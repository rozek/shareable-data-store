# @rozek/sns-network-webrtc

WebRTC peer-to-peer network and presence provider for the **shareable-notes-store** (SNS) family. Exchanges CRDT patches directly between browser tabs or devices over RTCDataChannel, using a lightweight WebSocket signalling endpoint for connection setup. Falls back automatically to `SNS_WebSocketProvider` if WebRTC is unavailable or the signalling server cannot be reached.

**Browser only** — requires `RTCPeerConnection` and `RTCDataChannel`.

---

## Installation

```bash
pnpm add @rozek/sns-network-webrtc
```

---

## Concepts

### Peer discovery and signalling

When `connect()` is called, the provider opens a WebSocket to `/signal/:storeId` on the relay server and exchanges JSON signalling messages (SDP offers/answers and ICE candidates) with other peers in the same store. Once a data channel is established between two peers, all further CRDT patches and presence frames travel directly over WebRTC — the relay server is no longer involved.

### Fallback

Pass an `SNS_WebSocketProvider` instance as `Fallback`. If the signalling WebSocket fails or WebRTC negotiation does not complete, `SNS_WebRTCProvider` activates the fallback and delegates all subsequent `sendPatch`, `sendValue`, and `requestValue` calls to it. The `ConnectionState` and all `on*` callbacks remain on the WebRTC provider so the rest of the application sees a unified interface.

### Frame protocol

The same binary frame format as `SNS_WebSocketProvider` is used over the data channel:

| Byte | Name | Payload |
|---|---|---|
| `0x01` | PATCH | CRDT patch bytes |
| `0x02` | VALUE | 32-byte hash + value bytes |
| `0x03` | REQ_VALUE | 32-byte hash |
| `0x04` | PRESENCE | UTF-8 JSON of presence state |
| `0x05` | VALUE_CHUNK | hash + chunk index + total chunks + bytes |

---

## API Reference

### `SNS_WebRTCProvider`

```typescript
import { SNS_WebRTCProvider } from '@rozek/sns-network-webrtc'

class SNS_WebRTCProvider implements SNS_NetworkProvider, SNS_PresenceProvider {
  constructor(StoreId:string, Options?: SNS_WebRTCProviderOptions)

  // ── SNS_NetworkProvider ──────────────────────────────────────

  readonly StoreID:string
  get ConnectionState():SNS_ConnectionState

  connect(URL:string, Options:SNS_ConnectionOptions):Promise<void>
  disconnect():void

  sendPatch(Patch:Uint8Array):void
  sendValue(ValueHash:string, Data:Uint8Array):void
  requestValue(ValueHash:string):void

  onPatch(Callback:(Patch:Uint8Array) => void):() => void
  onValue(Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange(Callback:(State:SNS_ConnectionState) => void):() => void

  // ── SNS_PresenceProvider ─────────────────────────────────────

  sendLocalState(State:SNS_LocalPresenceState):void
  onRemoteState(
    Callback:(PeerId:string, State:SNS_RemotePresenceState | null) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string, SNS_RemotePresenceState>
}
```

#### `SNS_WebRTCProviderOptions`

```typescript
interface SNS_WebRTCProviderOptions {
  ICEServers?: RTCIceServer[]         // STUN/TURN servers (default: Google STUN)
  Fallback?:   SNS_WebSocketProvider  // activated if WebRTC fails
}
```

#### Signalling message types (internal JSON protocol)

```typescript
type SignalMessage =
  | { type:'hello';     from:string }
  | { type:'offer';     from:string; to:string; sdp:RTCSessionDescriptionInit }
  | { type:'answer';    from:string; to:string; sdp:RTCSessionDescriptionInit }
  | { type:'candidate'; from:string; to:string; candidate:RTCIceCandidateInit }
```

---

## Usage

### Basic — WebRTC only, no fallback

```typescript
import { SNS_NoteStore }       from '@rozek/sns-core'
import { SNS_WebRTCProvider }  from '@rozek/sns-network-webrtc'
import { SNS_SyncEngine }      from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const network = new SNS_WebRTCProvider('my-notes')

const engine = new SNS_SyncEngine(store, {
  NetworkProvider: network,
  PresenceProvider:network,
})

await engine.start()
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### With automatic WebSocket fallback

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_WebRTCProvider }             from '@rozek/sns-network-webrtc'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('my-notes')
const fallback = new SNS_WebSocketProvider('my-notes')
const network = new SNS_WebRTCProvider('my-notes', { Fallback:fallback })

const engine = new SNS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
// if WebRTC signalling fails, the engine automatically switches to WebSocket relay
```

### Custom ICE servers (TURN for strict NATs)

```typescript
const network = new SNS_WebRTCProvider('my-notes', {
  ICEServers:[
    { urls:'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential:'pass',
    },
  ],
  Fallback:fallbackWsProvider,
})
```

---

## Server requirements

The relay server must expose a `/signal/:storeId` WebSocket endpoint. `@rozek/sns-websocket-server` provides this out of the box. The signalling endpoint accepts the same JWT `?token=` query parameter as the `/ws/:storeId` sync endpoint.

---

## License

MIT © Andreas Rozek
