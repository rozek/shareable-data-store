/*******************************************************************************
*                                                                              *
*                          SNS Network WebSocket                               *
*                                                                              *
*******************************************************************************/

// WebSocket-based SNS_NetworkProvider + SNS_PresenceProvider.
// Works in both Browser (native WebSocket) and Node.js 22+
// (global WebSocket available since Node 22 without a flag).
//
// Wire protocol (binary frames only):
//   [1 byte: MessageType] [payload]
//
//   0x01  PATCH        — CRDT patch bytes
//   0x02  VALUE        — 32-byte SHA-256 hash + value bytes (small ≤ 1 MB)
//   0x03  REQ_VALUE    — 32-byte SHA-256 hash (request missing value)
//   0x04  PRESENCE     — UTF-8 JSON of SNS_PresenceState
//   0x05  VALUE_CHUNK  — 32-byte hash + 4-byte chunk-index + 4-byte total-chunks + chunk bytes

import type {
  SNS_NetworkProvider,
  SNS_PresenceProvider,
  SNS_LocalPresenceState,
  SNS_RemotePresenceState,
  SNS_ConnectionState,
  SNS_ConnectionOptions,
} from '@rozek/sns-core'

//----------------------------------------------------------------------------//
//                              Frame type bytes                               //
//----------------------------------------------------------------------------//

  const MSG_PATCH       = 0x01
  const MSG_VALUE       = 0x02
  const MSG_REQ_VALUE   = 0x03
  const MSG_PRESENCE    = 0x04
  const MSG_VALUE_CHUNK = 0x05

  const HASH_SIZE       = 32  // SHA-256 in bytes
  const MAX_CHUNK_SIZE  = 1024*1024  // 1 MB

//----------------------------------------------------------------------------//
//                             Helper utilities                                //
//----------------------------------------------------------------------------//

/**** concatUint8 — concatenates any number of Uint8Arrays into a single buffer ****/

  function concatUint8 (...Arrays:Uint8Array[]):Uint8Array {
    const totalLen = Arrays.reduce((acc, a) => acc+a.byteLength, 0)
    const Result   = new Uint8Array(totalLen)
    let Offset     = 0
    for (const ArrayChunk of Arrays) {
      Result.set(ArrayChunk, Offset)
      Offset += ArrayChunk.byteLength
    }
    return Result
  }

/**** encodeFrame — prepends a 1-byte message-type prefix to Payload ****/

  function encodeFrame (Type:number, Payload:Uint8Array):Uint8Array {
    const Frame = new Uint8Array(1+Payload.byteLength)
    Frame[0]    = Type
    Frame.set(Payload, 1)
    return Frame
  }

/**** HexToBytes — decodes a lowercase hex string into a Uint8Array ****/

  function HexToBytes (Hex:string):Uint8Array {
    const Bytes = new Uint8Array(Hex.length/2)
    for (let i = 0; i < Hex.length; i += 2) {
      Bytes[i/2] = parseInt(Hex.slice(i, i+2), 16)
    }
    return Bytes
  }

/**** BytesToHex — encodes a Uint8Array as a lowercase hex string ****/

  function BytesToHex (Bytes:Uint8Array):string {
    return Array.from(Bytes).map((Byte) => Byte.toString(16).padStart(2,'0')).join('')
  }

//----------------------------------------------------------------------------//
//                            SNS_WebSocketProvider                            //
//----------------------------------------------------------------------------//

export class SNS_WebSocketProvider
  implements SNS_NetworkProvider, SNS_PresenceProvider
{
  readonly StoreID:string

  #ConnectionState: SNS_ConnectionState = 'disconnected'
  #WS:              WebSocket | undefined    = undefined
  #URL:             string              = ''
  #Options:         SNS_ConnectionOptions | undefined = undefined
  #ReconnectTimer:  ReturnType<typeof setTimeout> | undefined = undefined

  #PatchHandlers:             Set<(Patch:Uint8Array) => void> = new Set()
  #ValueHandlers:             Set<(Hash:string, Data:Uint8Array) => void> = new Set()
  #ConnectionChangeHandlers:  Set<(State:SNS_ConnectionState) => void> = new Set()
  #PresenceHandlers:          Set<(PeerId:string, State:SNS_RemotePresenceState | undefined) => void> = new Set()

  // incoming value chunk reassembly: hash → chunks array
  #ChunkBuffer: Map<string, { total:number; chunks:Map<number,Uint8Array> }> = new Map()

  // presence peer set (remote peers)
  #PeerSet: Map<string, SNS_RemotePresenceState> = new Map()

/**** constructor ****/

  constructor (StoreId:string) {
    this.StoreID = StoreId
  }

//----------------------------------------------------------------------------//
//                            SNS_NetworkProvider                             //
//----------------------------------------------------------------------------//

/**** ConnectionState ****/

  get ConnectionState ():SNS_ConnectionState { return this.#ConnectionState }

/**** connect ****/

  async connect (URL:string, Options:SNS_ConnectionOptions):Promise<void> {
    this.#URL     = URL
    this.#Options = Options
    return this.#doConnect()
  }

/**** #doConnect ****/

  #doConnect ():Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const WsURL = `${this.#URL}?token=${encodeURIComponent(this.#Options!.Token)}`
      const WS    = new WebSocket(WsURL)
      WS.binaryType = 'arraybuffer'
      this.#WS = WS

      this.#setState('connecting')

      WS.onopen = () => {
        this.#setState('connected')
        resolve()
      }

      WS.onerror = (Event) => {
        if (this.#ConnectionState === 'connecting') {
          reject(new Error('WebSocket connection failed'))
        }
      }

      WS.onclose = () => {
        this.#WS = undefined
        if (this.#ConnectionState !== 'disconnected') {
          this.#setState('reconnecting')
          this.#scheduleReconnect()
        }
      }

      WS.onmessage = (Event) => {
        this.#handleFrame(new Uint8Array(Event.data as ArrayBuffer))
      }
    })
  }

/**** disconnect ****/

  disconnect ():void {
    this.#clearReconnectTimer()
    this.#setState('disconnected')
    this.#WS?.close()
    this.#WS = undefined
  }

/**** sendPatch ****/

  sendPatch (Patch:Uint8Array):void {
    this.#send(encodeFrame(MSG_PATCH, Patch))
  }

/**** sendValue ****/

  sendValue (ValueHash:string, Data:Uint8Array):void {
    const HashBytes = HexToBytes(ValueHash)
    if (Data.byteLength <= MAX_CHUNK_SIZE) {
      this.#send(encodeFrame(MSG_VALUE, concatUint8(HashBytes, Data)))
    } else {
      const totalChunks = Math.ceil(Data.byteLength/MAX_CHUNK_SIZE)
      for (let i = 0; i < totalChunks; i++) {
        const Start  = i*MAX_CHUNK_SIZE
        const Chunk  = Data.slice(Start, Start+MAX_CHUNK_SIZE)
        const Header = new Uint8Array(HASH_SIZE+8)
        Header.set(HashBytes, 0)
        new DataView(Header.buffer).setUint32(HASH_SIZE,   i,           false)
        new DataView(Header.buffer).setUint32(HASH_SIZE+4, totalChunks, false)
        this.#send(encodeFrame(MSG_VALUE_CHUNK, concatUint8(Header, Chunk)))
      }
    }
  }

/**** requestValue ****/

  requestValue (ValueHash:string):void {
    this.#send(encodeFrame(MSG_REQ_VALUE, HexToBytes(ValueHash)))
  }

/**** onPatch ****/

  onPatch (Callback:(Patch:Uint8Array) => void):() => void {
    this.#PatchHandlers.add(Callback)
    return () => { this.#PatchHandlers.delete(Callback) }
  }

/**** onValue ****/

  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void {
    this.#ValueHandlers.add(Callback)
    return () => { this.#ValueHandlers.delete(Callback) }
  }

/**** onConnectionChange ****/

  onConnectionChange (Callback:(State:SNS_ConnectionState) => void):() => void {
    this.#ConnectionChangeHandlers.add(Callback)
    return () => { this.#ConnectionChangeHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                            SNS_PresenceProvider                            //
//----------------------------------------------------------------------------//

/**** sendLocalState ****/

  sendLocalState (State:SNS_LocalPresenceState):void {
    const encoded = new TextEncoder().encode(JSON.stringify(State))
    this.#send(encodeFrame(MSG_PRESENCE, encoded))
  }

/**** onRemoteState ****/

  onRemoteState (
    Callback:(PeerId:string, State:SNS_RemotePresenceState | undefined) => void
  ):() => void {
    this.#PresenceHandlers.add(Callback)
    return () => { this.#PresenceHandlers.delete(Callback) }
  }

/**** PeerSet ****/

  get PeerSet ():ReadonlyMap<string, SNS_RemotePresenceState> {
    return this.#PeerSet
  }

//----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//

/**** #send ****/

  #send (Frame:Uint8Array):void {
    if (this.#WS?.readyState === WebSocket.OPEN) {
      this.#WS.send(Frame)
    }
  }

/**** #setState ****/

  #setState (State:SNS_ConnectionState):void {
    if (this.#ConnectionState === State) { return }
    this.#ConnectionState = State
    for (const Handler of this.#ConnectionChangeHandlers) {
      try { Handler(State) } catch (_Signal) { /* swallow */ }
    }
  }

/**** #scheduleReconnect ****/

  #scheduleReconnect ():void {
    const DelayMs = this.#Options?.reconnectDelayMs ?? 2000
    this.#ReconnectTimer = setTimeout(() => {
      if (this.#ConnectionState === 'reconnecting') {
        this.#doConnect().catch(() => { /* handled by onclose */ })
      }
    }, DelayMs)
  }

/**** #clearReconnectTimer ****/

  #clearReconnectTimer ():void {
    if (this.#ReconnectTimer != null) {
      clearTimeout(this.#ReconnectTimer)
      this.#ReconnectTimer = undefined
    }
  }

/**** #handleFrame ****/

  #handleFrame (Frame:Uint8Array):void {
    if (Frame.byteLength < 1) { return }
    const Type    = Frame[0]
    const Payload = Frame.slice(1)

    switch (Type) {
      case MSG_PATCH: {
        for (const Handler of this.#PatchHandlers) {
          try { Handler(Payload) } catch (_Signal) {}
        }
        break
      }
      case MSG_VALUE: {
        if (Payload.byteLength < HASH_SIZE) { return }
        const Hash  = BytesToHex(Payload.slice(0, HASH_SIZE))
        const Data  = Payload.slice(HASH_SIZE)
        for (const Handler of this.#ValueHandlers) {
          try { Handler(Hash, Data) } catch (_Signal) {}
        }
        break
      }
      case MSG_REQ_VALUE: {
        // server-to-client req_value: ignored on client side
        break
      }
      case MSG_PRESENCE: {
        try {
          const State = JSON.parse(new TextDecoder().decode(Payload)) as SNS_RemotePresenceState
          if (typeof State.PeerId !== 'string') { break }
          State.lastSeen = Date.now()
          this.#PeerSet.set(State.PeerId, State)
          for (const Handler of this.#PresenceHandlers) {
            try { Handler(State.PeerId, State) } catch (_Signal) {}
          }
        } catch (_Signal) {}
        break
      }
      case MSG_VALUE_CHUNK: {
        if (Payload.byteLength < HASH_SIZE+8) { return }
        const Hash       = BytesToHex(Payload.slice(0, HASH_SIZE))
        const DV         = new DataView(Payload.buffer, Payload.byteOffset+HASH_SIZE, 8)
        const ChunkIdx   = DV.getUint32(0, false)
        const totalChunks= DV.getUint32(4, false)
        const ChunkData  = Payload.slice(HASH_SIZE+8)

        let Entry = this.#ChunkBuffer.get(Hash)
        if (Entry == null) {
          Entry = { total:totalChunks, chunks:new Map() }
          this.#ChunkBuffer.set(Hash, Entry)
        }
        Entry.chunks.set(ChunkIdx, ChunkData)

        if (Entry.chunks.size === Entry.total) {
          const assembled = concatUint8(
            ...Array.from({ length:Entry.total }, (_, i) => Entry!.chunks.get(i)!)
          )
          this.#ChunkBuffer.delete(Hash)
          for (const Handler of this.#ValueHandlers) {
            try { Handler(Hash, assembled) } catch (_Signal) {}
          }
        }
        break
      }
    }
  }
}
