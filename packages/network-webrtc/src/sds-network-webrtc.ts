/*******************************************************************************
*                                                                              *
*                            SDS Network WebRTC                                *
*                                                                              *
*******************************************************************************/

// Browser-only WebRTC-based SDS_NetworkProvider + SDS_PresenceProvider.
// Uses native RTCPeerConnection + RTCDataChannel.
// Signalling is done via a WebSocket connection to /signal/:storeId.
// Falls back to SDS_WebSocketProvider when WebRTC cannot be established.
//
// Signalling protocol: JSON messages over the WebSocket:
//   { type:'offer',     from:PeerId, to:PeerId, sdp:RTCSessionDescriptionInit }
//   { type:'answer',    from:PeerId, to:PeerId, sdp:RTCSessionDescriptionInit }
//   { type:'candidate', from:PeerId, to:PeerId, candidate:RTCIceCandidateInit }
//   { type:'hello',     from:PeerId }  — announce presence to signalling server

import type {
  SDS_NetworkProvider,
  SDS_PresenceProvider,
  SDS_LocalPresenceState,
  SDS_RemotePresenceState,
  SDS_ConnectionState,
  SDS_ConnectionOptions,
} from '@rozek/sds-core'
import type { SDS_WebSocketProvider } from '@rozek/sds-network-websocket'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export interface SDS_WebRTCProviderOptions {
    ICEServers?: RTCIceServer[]
    Fallback?:   SDS_WebSocketProvider
  }

  type SignalMessage =
    | { type:'hello';     from:string }
    | { type:'offer';     from:string; to:string; sdp:RTCSessionDescriptionInit }
    | { type:'answer';    from:string; to:string; sdp:RTCSessionDescriptionInit }
    | { type:'candidate'; from:string; to:string; candidate:RTCIceCandidateInit }

//----------------------------------------------------------------------------//
//                             SDS_WebRTCProvider                             //
//----------------------------------------------------------------------------//

export class SDS_WebRTCProvider
  implements SDS_NetworkProvider, SDS_PresenceProvider
{
  readonly StoreId:string

  #Options: SDS_WebRTCProviderOptions
  #PeerId:  string = crypto.randomUUID()
  #Fallback:SDS_WebSocketProvider | undefined

/**** Signalling WebSocket ****/

  #SignallingWS:WebSocket | undefined = undefined

/**** active RTCPeerConnection per remote PeerId ****/

  #Peers:   Map<string, RTCPeerConnection>  = new Map()
  #Channels:Map<string, RTCDataChannel>     = new Map()

/**** Connection state ****/

  #ConnectionState:SDS_ConnectionState = 'disconnected'

/**** Event Handlers ****/

  #PatchHandlers:           Set<(Patch:Uint8Array) => void>                  = new Set()
  #ValueHandlers:           Set<(Hash:string, Data:Uint8Array) => void>      = new Set()
  #ConnectionChangeHandlers:Set<(State:SDS_ConnectionState) => void>         = new Set()
  #PresenceHandlers:        Set<(PeerId:string, State:SDS_RemotePresenceState | undefined) => void> = new Set()
  #SyncRequestHandlers:     Set<(Cursor:Uint8Array) => void> = new Set()

/**** Presence Peer Set ****/

  #PeerSet: Map<string, SDS_RemotePresenceState> = new Map()

/**** Fallback Mode ****/

  #UsingFallback = false

/**** Constructor ****/

  constructor (StoreId:string, Options:SDS_WebRTCProviderOptions = {}) {
    this.StoreId  = StoreId
    this.#Options = Options
    this.#Fallback = Options.Fallback ?? undefined
  }

//----------------------------------------------------------------------------//
//                            SDS_NetworkProvider                             //
//----------------------------------------------------------------------------//

/**** ConnectionState ****/

  get ConnectionState ():SDS_ConnectionState { return this.#ConnectionState }

/**** connect ****/

  async connect (URL:string, Options:SDS_ConnectionOptions):Promise<void> {
    if (! /^wss?:\/\/.+\/signal\/.+/.test(URL)) {
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${URL}' — expected wss://<host>/signal/<storeId>`
      )
    }
    // URL is a signalling URL: wss://.../signal/:storeId
    return new Promise<void>((resolve, reject) => {
      const SignallingURL = `${URL}?token=${encodeURIComponent(Options.Token)}`
      const WS           = new WebSocket(SignallingURL)
      this.#SignallingWS  = WS

      this.#setState('connecting')

      WS.onopen = () => {
        this.#setState('connected')
        this.#sendSignal({ type:'hello', from:this.#PeerId })
        resolve()
      }

      WS.onerror = () => {
        if (! this.#UsingFallback && this.#Fallback != null) {
          // derive WebSocket URL by replacing /signal/ with /ws/
          const WsURL = URL.replace('/signal/', '/ws/')
          this.#UsingFallback = true
          this.#Fallback.connect(WsURL, Options)
            .then(resolve)
            .catch(reject)
        } else {
          reject(new Error('WebRTC signalling connection failed'))
        }
      }

      WS.onclose = () => {
        if (this.#ConnectionState !== 'disconnected') {
          this.#setState('reconnecting')
          setTimeout(() => {
            if (this.#ConnectionState === 'reconnecting') {
              this.connect(URL, Options).catch(() => {})
            }
          }, Options.reconnectDelayMs ?? 2000)
        }
      }

      WS.onmessage = (Event) => {
        try {
          const Msg = JSON.parse(Event.data as string) as SignalMessage
          this.#handleSignal(Msg, Options)
        } catch (_Signal) {}
      }
    })
  }

/**** disconnect ****/

  disconnect ():void {
    this.#setState('disconnected')

    this.#SignallingWS?.close()
    this.#SignallingWS = undefined

    for (const PC of this.#Peers.values()) { PC.close() }
    this.#Peers.clear()
    this.#Channels.clear()
    if (this.#UsingFallback && this.#Fallback != null) {
      this.#Fallback.disconnect()
      this.#UsingFallback = false
    }
  }

/**** sendPatch ****/

  sendPatch (Patch:Uint8Array):void {
    if (this.#UsingFallback) {
      this.#Fallback?.sendPatch(Patch)
      return
    }

    const Frame = new Uint8Array(1+Patch.byteLength)
      Frame[0]    = 0x01
      Frame.set(Patch, 1)
    for (const CH of this.#Channels.values()) {
      if (CH.readyState === 'open') {
        try { CH.send(Frame) } catch {}
      }
    }
  }

/**** sendValue ****/

  sendValue (ValueHash:string, Data:Uint8Array):void {
    if (this.#UsingFallback) {
      this.#Fallback?.sendValue(ValueHash, Data)
      return
    }

    const HashBytes = this.#hexToBytes(ValueHash)
    const Payload   = new Uint8Array(1+32+Data.byteLength)
      Payload[0]      = 0x02
      Payload.set(HashBytes, 1)
      Payload.set(Data, 33)
    for (const CH of this.#Channels.values()) {
      if (CH.readyState === 'open') {
        try { CH.send(Payload) } catch {}
      }
    }
  }

/**** requestValue ****/

  requestValue (ValueHash:string):void {
    if (this.#UsingFallback) {
      this.#Fallback?.requestValue(ValueHash)
      return
    }

    const HashBytes = this.#hexToBytes(ValueHash)
    const Frame     = new Uint8Array(1+32)
      Frame[0]        = 0x03
      Frame.set(HashBytes, 1)
    for (const CH of this.#Channels.values()) {
      if (CH.readyState === 'open') {
        try { CH.send(Frame) } catch {}
      }
    }
  }

/**** onPatch ****/

  onPatch (Callback:(Patch:Uint8Array) => void):() => void {
    this.#PatchHandlers.add(Callback)
    if (this.#UsingFallback && this.#Fallback != null) {
      return this.#Fallback.onPatch(Callback)
    }
    return () => { this.#PatchHandlers.delete(Callback) }
  }

/**** onValue ****/

  onValue (Callback:(Hash:string, Data:Uint8Array) => void):() => void {
    this.#ValueHandlers.add(Callback)
    if (this.#UsingFallback && this.#Fallback != null) {
      return this.#Fallback.onValue(Callback)
    }
    return () => { this.#ValueHandlers.delete(Callback) }
  }

/**** onConnectionChange ****/

  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void {
    this.#ConnectionChangeHandlers.add(Callback)
    return () => { this.#ConnectionChangeHandlers.delete(Callback) }
  }

/**** sendSyncRequest ****/

  sendSyncRequest (Cursor:Uint8Array):void {
    if (this.#UsingFallback) {
      this.#Fallback?.sendSyncRequest(Cursor)
      return
    }

    const Frame = new Uint8Array(1+Cursor.byteLength)
      Frame[0]    = 0x06
      Frame.set(Cursor, 1)
    for (const CH of this.#Channels.values()) {
      if (CH.readyState === 'open') {
        try { CH.send(Frame) } catch {}
      }
    }
  }

/**** onSyncRequest ****/

  onSyncRequest (Callback:(Cursor:Uint8Array) => void):() => void {
    this.#SyncRequestHandlers.add(Callback)
    if (this.#UsingFallback && this.#Fallback != null) {
      return this.#Fallback.onSyncRequest(Callback)
    }
    return () => { this.#SyncRequestHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                           SDS_PresenceProvider                              //
//----------------------------------------------------------------------------//

/**** sendLocalState ****/

  sendLocalState (State:SDS_LocalPresenceState):void {
    if (this.#UsingFallback) {
      this.#Fallback?.sendLocalState(State)
      return
    }
    const encoded = new TextEncoder().encode(JSON.stringify(State))
    const Frame   = new Uint8Array(1+encoded.byteLength)
      Frame[0]      = 0x04
      Frame.set(encoded, 1)
    for (const CH of this.#Channels.values()) {
      if (CH.readyState === 'open') {
        try { CH.send(Frame) } catch {}
      }
    }
  }

/**** onRemoteState ****/

  onRemoteState (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | undefined) => void
  ):() => void {
    this.#PresenceHandlers.add(Callback)
    return () => { this.#PresenceHandlers.delete(Callback) }
  }

/**** PeerSet ****/

  get PeerSet ():ReadonlyMap<string, SDS_RemotePresenceState> {
    return this.#PeerSet
  }

//----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//

/**** #setState — updates the connection state and notifies all registered handlers ****/

  #setState (State:SDS_ConnectionState):void {
    if (this.#ConnectionState === State) { return }
    
    this.#ConnectionState = State
    for (const H of this.#ConnectionChangeHandlers) {
      try { H(State) } catch {}
    }
  }

/**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/

  #sendSignal (Msg:SignalMessage):void {
    if (this.#SignallingWS?.readyState === WebSocket.OPEN) {
      this.#SignallingWS.send(JSON.stringify(Msg))
    }
  }

/**** #handleSignal — dispatches an incoming signalling message to the appropriate handler ****/

  async #handleSignal (Msg:SignalMessage, ConnOpts:SDS_ConnectionOptions):Promise<void> {
    switch (Msg.type) {
      case 'hello': {
        // new peer announced — initiate offer
        if (Msg.from === this.#PeerId) { return }
        if (! this.#Peers.has(Msg.from)) {
          await this.#createOffer(Msg.from)
        }
        break
      }
      case 'offer': {
        if (Msg.to !== this.#PeerId) { return }
        await this.#handleOffer(Msg.from, Msg.sdp)
        break
      }
      case 'answer': {
        if (Msg.to !== this.#PeerId) { return }
        const PeerConn = this.#Peers.get(Msg.from)
        if (PeerConn != null) {
          await PeerConn.setRemoteDescription(new RTCSessionDescription(Msg.sdp))
        }
        break
      }
      case 'candidate': {
        if (Msg.to !== this.#PeerId) { return }
        const PeerConn = this.#Peers.get(Msg.from)
        if (PeerConn != null) {
          await PeerConn.addIceCandidate(new RTCIceCandidate(Msg.candidate))
        }
        break
      }
    }
  }

/**** #createOffer — creates a new RTCPeerConnection and sends an SDP offer to RemotePeerId ****/

  async #createOffer (RemotePeerId:string):Promise<void> {
    const PeerConn  = this.#createPeerConnection(RemotePeerId)
    const DataChannel = PeerConn.createDataChannel('sds', { ordered:false, maxRetransmits:0 })
    this.#setupDataChannel(DataChannel, RemotePeerId)
    this.#Channels.set(RemotePeerId, DataChannel)

    const Offer = await PeerConn.createOffer()
    await PeerConn.setLocalDescription(Offer)
    this.#sendSignal({ type:'offer', from:this.#PeerId, to:RemotePeerId, sdp:Offer })
  }

/**** #handleOffer — receives an SDP offer, creates an answer, and sends it back ****/

  async #handleOffer (
    RemotePeerId:string, Sdp:RTCSessionDescriptionInit
  ):Promise<void> {
    const PeerConn = this.#createPeerConnection(RemotePeerId)
    await PeerConn.setRemoteDescription(new RTCSessionDescription(Sdp))
    const Answer = await PeerConn.createAnswer()
    await PeerConn.setLocalDescription(Answer)
    this.#sendSignal({ type:'answer', from:this.#PeerId, to:RemotePeerId, sdp:Answer })
  }

/**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/

  #createPeerConnection (RemotePeerId:string):RTCPeerConnection {
    const IceServers = this.#Options.ICEServers ?? [
      { urls:'stun:stun.cloudflare.com:3478' }
    ]
    const PeerConn = new RTCPeerConnection({ iceServers:IceServers })
    this.#Peers.set(RemotePeerId, PeerConn)

    PeerConn.onicecandidate = (IceEvent) => {
      if (IceEvent.candidate != null) {
        this.#sendSignal({
          type: 'candidate',
          from: this.#PeerId,
          to:   RemotePeerId,
          candidate: IceEvent.candidate.toJSON(),
        })
      }
    }

    PeerConn.ondatachannel = (DataChannelEvent) => {
      this.#setupDataChannel(DataChannelEvent.channel, RemotePeerId)
      this.#Channels.set(RemotePeerId, DataChannelEvent.channel)
    }

    PeerConn.onconnectionstatechange = () => {
      if (PeerConn.connectionState === 'failed' || PeerConn.connectionState === 'closed') {
        this.#Peers.delete(RemotePeerId)
        this.#Channels.delete(RemotePeerId)
        this.#PeerSet.delete(RemotePeerId)
        for (const Handler of this.#PresenceHandlers) {
          try { Handler(RemotePeerId, undefined) } catch {}
        }
      }
    }

    return PeerConn
  }

/**** #setupDataChannel — attaches message and error handlers to a data channel ****/

  #setupDataChannel (CH:RTCDataChannel, RemotePeerId:string):void {
    CH.binaryType = 'arraybuffer'
    CH.onmessage  = (E) => {
      const Frame = new Uint8Array(E.data as ArrayBuffer)
      this.#handleFrame(Frame, RemotePeerId)
    }
  }

/**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/

  #handleFrame (Frame:Uint8Array, _RemotePeerId:string):void {
    if (Frame.byteLength < 1) { return }
    const Type    = Frame[0]
    const Payload = Frame.slice(1)
    switch (Type) {
      case 0x01: {
        for (const Handler of this.#PatchHandlers) {
          try { Handler(Payload) } catch {}
        }
        break
      }
      case 0x02: {
        if (Payload.byteLength < 32) { return }
        const Hash = this.#bytesToHex(Payload.slice(0, 32))
        const Data = Payload.slice(32)
        for (const Handler of this.#ValueHandlers) {
          try { Handler(Hash, Data) } catch {}
        }
        break
      }
      case 0x04: {
        try {
          const State = JSON.parse(new TextDecoder().decode(Payload)) as SDS_RemotePresenceState
          if (typeof State.PeerId !== 'string') { break }
          State.lastSeen = Date.now()
          this.#PeerSet.set(State.PeerId, State)
          for (const Handler of this.#PresenceHandlers) {
            try { Handler(State.PeerId, State) } catch {}
          }
        } catch {}
        break
      }
      case 0x06: {
        for (const Handler of this.#SyncRequestHandlers) {
          try { Handler(Payload) } catch {}
        }
        break
      }
    }
  }

/**** #hexToBytes ****/

  #hexToBytes (Hex:string):Uint8Array {
    const B = new Uint8Array(Hex.length/2)
    for (let i = 0; i < Hex.length; i += 2) { B[i/2] = parseInt(Hex.slice(i,i+2), 16) }
    return B
  }

/**** #bytesToHex ****/

  #bytesToHex (Bytes:Uint8Array):string {
    return Array.from(Bytes).map((Byte) => Byte.toString(16).padStart(2,'0')).join('')
  }

}
