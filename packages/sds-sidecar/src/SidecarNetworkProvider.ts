/*******************************************************************************
*                                                                              *
*                         SidecarNetworkProvider                               *
*                                                                              *
*******************************************************************************/

// implements SDS_NetworkProvider with exponential-backoff reconnect and
// WebSocket close-code detection for auth errors (4001 Unauthorized,
// 4003 Forbidden); used in place of SDS_WebSocketProvider so that the sidecar
// can intercept auth-error closes before the SDS_SyncEngine sees them

import type {
  SDS_NetworkProvider,
  SDS_ConnectionState,
  SDS_ConnectionOptions,
} from '@rozek/sds-core'

import type { ReconnectOptions } from './Config.js'

//----------------------------------------------------------------------------//
//                              frame type bytes                               //
//----------------------------------------------------------------------------//

  const MSG_PATCH       = 0x01
  const MSG_VALUE       = 0x02
  const MSG_REQ_VALUE   = 0x03
  const MSG_VALUE_CHUNK = 0x05

  const HASH_SIZE = 32   // SHA-256 in bytes

//----------------------------------------------------------------------------//
//                               helper utils                                 //
//----------------------------------------------------------------------------//

/**** concatUint8 — concatenates any number of Uint8Arrays ****/

  function concatUint8 (...Arrays:Uint8Array[]):Uint8Array {
    const TotalLen = Arrays.reduce((Acc, A) => Acc+A.byteLength, 0)
    const Result   = new Uint8Array(TotalLen)
    let Offset     = 0
    for (const Chunk of Arrays) { Result.set(Chunk, Offset); Offset += Chunk.byteLength }
    return Result
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

/**** encodeFrame — prepends a 1-byte message-type prefix to Payload ****/

  function encodeFrame (Type:number, Payload:Uint8Array):Uint8Array {
    const Frame = new Uint8Array(1+Payload.byteLength)
    Frame[0]    = Type
    Frame.set(Payload, 1)
    return Frame
  }

//----------------------------------------------------------------------------//
//                           SidecarNetworkProvider                           //
//----------------------------------------------------------------------------//

export class SidecarNetworkProvider implements SDS_NetworkProvider {
  readonly StoreId:string

  #ConnectionState:SDS_ConnectionState = 'disconnected'
  #WS:             WebSocket | undefined = undefined
  #URL:            string = ''
  #Token:          string = ''

  // exponential backoff state
  #Attempt:        number = 0
  #ReconnectTimer: ReturnType<typeof setTimeout> | undefined = undefined

  // reconnect options (constant after construction)
  readonly #initialDelay:number
  readonly #maxDelay:number
  readonly #Jitter:number

  // value-chunk reassembly buffer: hash → { total, chunks }
  #ChunkBuffer:Map<string,{ total:number; chunks:Map<number,Uint8Array> }> = new Map()

  // subscriber sets
  #PatchHandlers:            Set<(Patch:Uint8Array) => void> = new Set()
  #ValueHandlers:            Set<(Hash:string, Data:Uint8Array) => void> = new Set()
  #ConnectionChangeHandlers: Set<(State:SDS_ConnectionState) => void> = new Set()
  #AuthErrorHandlers:        Set<(Code:4001|4003, Reason:string) => void> = new Set()

  constructor (StoreId:string, reconnect:ReconnectOptions) {
    this.StoreId       = StoreId
    this.#initialDelay = reconnect.initialDelay
    this.#maxDelay     = reconnect.maxDelay
    this.#Jitter       = reconnect.Jitter
  }

//----------------------------------------------------------------------------//
//                            SDS_NetworkProvider                             //
//----------------------------------------------------------------------------//

/**** ConnectionState ****/

  get ConnectionState ():SDS_ConnectionState { return this.#ConnectionState }

/**** connect ****/

  async connect (URL:string, Options:SDS_ConnectionOptions):Promise<void> {
    if (! /^wss?:\/\//.test(URL)) {
      throw new TypeError(
        `SidecarNetworkProvider: invalid server URL '${URL}' — expected ws:// or wss://`
      )
    }
    this.#URL     = URL
    this.#Token   = Options.Token
    this.#Attempt = 0
    return this.#doConnect()
  }

/**** disconnect ****/

  disconnect ():void {
    this.#clearReconnectTimer()
    this.#setState('disconnected')
    this.#WS?.close()
    this.#WS = undefined
    this.#ChunkBuffer.clear()
  }

/**** sendPatch ****/

  sendPatch (Patch:Uint8Array):void {
    this.#send(encodeFrame(MSG_PATCH, Patch))
  }

/**** sendValue ****/

  sendValue (ValueHash:string, Data:Uint8Array):void {
    const HashBytes = HexToBytes(ValueHash)
    this.#send(encodeFrame(MSG_VALUE, concatUint8(HashBytes, Data)))
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

  onValue (Callback:(Hash:string, Data:Uint8Array) => void):() => void {
    this.#ValueHandlers.add(Callback)
    return () => { this.#ValueHandlers.delete(Callback) }
  }

/**** onConnectionChange ****/

  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void {
    this.#ConnectionChangeHandlers.add(Callback)
    return () => { this.#ConnectionChangeHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                              auth-error hook                               //
//----------------------------------------------------------------------------//

/**** onAuthError — called when the server closes with 4001 or 4003; no reconnect follows ****/

  onAuthError (Callback:(Code:4001|4003, Reason:string) => void):() => void {
    this.#AuthErrorHandlers.add(Callback)
    return () => { this.#AuthErrorHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                                  private                                   //
//----------------------------------------------------------------------------//

/**** #doConnect ****/

  #doConnect ():Promise<void> {
    return new Promise<void>((Resolve, Reject) => {
      const BaseURL = this.#URL.replace(/\/+$/, '')
      const WsURL   = `${BaseURL}/ws/${this.StoreId}?token=${encodeURIComponent(this.#Token)}`
      const WS      = new WebSocket(WsURL)
        WS.binaryType = 'arraybuffer'
      this.#WS = WS

      this.#setState('connecting')

      WS.onopen = () => {
        this.#Attempt = 0
        this.#setState('connected')
        Resolve()
      }

      WS.onerror = () => {
        if (this.#ConnectionState === 'connecting') {
          Reject(new Error('WebSocket connection failed'))
        }
      }

      WS.onclose = (Event) => {
        this.#WS = undefined

        // auth errors: stop reconnecting and notify caller
        if ((Event.code === 4001) || (Event.code === 4003)) {
          this.#ChunkBuffer.clear()
          this.#setState('disconnected')
          for (const Handler of this.#AuthErrorHandlers) {
            try { Handler(Event.code as 4001|4003, Event.reason) } catch (_Signal) {}
          }
          return
        }

        if (this.#ConnectionState !== 'disconnected') {
          this.#ChunkBuffer.clear()
          this.#setState('reconnecting')
          this.#scheduleReconnect()
        }
      }

      WS.onmessage = (Event) => {
        if (! (Event.data instanceof ArrayBuffer)) { return }
        this.#handleFrame(new Uint8Array(Event.data))
      }
    })
  }

/**** #send ****/

  #send (Frame:Uint8Array):void {
    if (this.#WS?.readyState === WebSocket.OPEN) {
      this.#WS.send(Frame)
    }
  }

/**** #setState ****/

  #setState (State:SDS_ConnectionState):void {
    if (this.#ConnectionState === State) { return }
    this.#ConnectionState = State
    for (const Handler of this.#ConnectionChangeHandlers) {
      try { Handler(State) } catch (_Signal) {}
    }
  }

/**** #scheduleReconnect — exponential backoff capped at MaxDelay, with jitter ****/

  #scheduleReconnect ():void {
    const BaseDelay = Math.min(this.#initialDelay*(2**this.#Attempt), this.#maxDelay)
    const JitterMs  = BaseDelay*this.#Jitter*(Math.random()*2-1)
    const Delay     = Math.max(0, Math.round(BaseDelay+JitterMs))
    this.#Attempt++
    this.#ReconnectTimer = setTimeout(() => {
      if (this.#ConnectionState === 'reconnecting') {
        this.#doConnect().catch(() => { /* handled via onclose */ })
      }
    }, Delay)
  }

/**** #clearReconnectTimer ****/

  #clearReconnectTimer ():void {
    if (this.#ReconnectTimer != null) {
      clearTimeout(this.#ReconnectTimer)
      this.#ReconnectTimer = undefined
    }
  }

/**** #handleFrame — parses incoming binary frames and dispatches to handlers ****/

  #handleFrame (Frame:Uint8Array):void {
    if (Frame.byteLength < 1) { return }
    const Type    = Frame[0]
    const Payload = Frame.slice(1)

    switch (true) {
      case (Type === MSG_PATCH): {
        for (const Handler of this.#PatchHandlers) {
          try { Handler(Payload) } catch (_Signal) {}
        }
        break
      }
      case (Type === MSG_VALUE): {
        if (Payload.byteLength < HASH_SIZE) { return }
        const Hash = BytesToHex(Payload.slice(0, HASH_SIZE))
        const Data = Payload.slice(HASH_SIZE)
        for (const Handler of this.#ValueHandlers) {
          try { Handler(Hash, Data) } catch (_Signal) {}
        }
        break
      }
      case (Type === MSG_VALUE_CHUNK): {
        if (Payload.byteLength < HASH_SIZE+8) { return }
        const Hash       = BytesToHex(Payload.slice(0, HASH_SIZE))
        const DV         = new DataView(Payload.buffer, Payload.byteOffset+HASH_SIZE, 8)
        const ChunkIdx   = DV.getUint32(0, false)
        const TotalChunks= DV.getUint32(4, false)
        const ChunkData  = Payload.slice(HASH_SIZE+8)

        let Entry = this.#ChunkBuffer.get(Hash)
        if (Entry == null) {
          Entry = { total:TotalChunks, chunks:new Map() }
          this.#ChunkBuffer.set(Hash, Entry)
        }
        Entry.chunks.set(ChunkIdx, ChunkData)
        if (Entry.chunks.size < Entry.total) { break }

        // verify indices 0…total-1 are all present (guards against non-contiguous frames)
        let AllPresent = true
        for (let i = 0; i < Entry.total; i++) {
          if (! Entry.chunks.has(i)) { AllPresent = false; break }
        }
        if (! AllPresent) { this.#ChunkBuffer.delete(Hash); break }

        this.#ChunkBuffer.delete(Hash)
        const Assembled = concatUint8(
          ...Array.from({ length:Entry.total }, (_, i) => Entry!.chunks.get(i) as Uint8Array)
        )
        for (const Handler of this.#ValueHandlers) {
          try { Handler(Hash, Assembled) } catch (_Signal) {}
        }
        break
      }
    }
  }
}
