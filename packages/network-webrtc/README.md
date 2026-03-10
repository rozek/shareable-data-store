# @rozek/sds-network-webrtc

WebRTC peer-to-peer network and presence provider for the **shareable-data-store** (SDS) family. Exchanges CRDT patches directly between browser tabs or devices over RTCDataChannel, using a lightweight WebSocket signalling endpoint for connection setup. Falls back automatically to `SDS_WebSocketProvider` if WebRTC is unavailable or the signalling server cannot be reached.

**Browser only** — requires `RTCPeerConnection` and `RTCDataChannel`.

---

## Installation

```bash
pnpm add @rozek/sds-network-webrtc
```

---

## Concepts

### Peer discovery and signalling

When `connect()` is called, the provider opens a WebSocket to `/signal/:storeId` on the relay server and exchanges JSON signalling messages (SDP offers/answers and ICE candidates) with other peers in the same store. Once a data channel is established between two peers, all further CRDT patches and presence frames travel directly over WebRTC — the relay server is no longer involved.

### Fallback

Pass an `SDS_WebSocketProvider` instance as `Fallback`. If the signalling WebSocket fails or WebRTC negotiation does not complete, `SDS_WebRTCProvider` activates the fallback and delegates all subsequent `sendPatch`, `sendValue`, and `requestValue` calls to it. The `ConnectionState` and all `on*` callbacks remain on the WebRTC provider so the rest of the application sees a unified interface.

### Frame protocol

The same binary frame format as `SDS_WebSocketProvider` is used over the data channel:

| Byte | Name | Payload |
| --- | --- | --- |
| `0x01` | PATCH | CRDT patch bytes |
| `0x02` | VALUE | 32-byte hash + value bytes |
| `0x03` | REQ_VALUE | 32-byte hash |
| `0x04` | PRESENCE | UTF-8 JSON of presence state |
| `0x05` | VALUE_CHUNK | hash + chunk index + total chunks + bytes |

---

## API Reference

### `SDS_WebRTCProvider`

```typescript
import { SDS_WebRTCProvider } from '@rozek/sds-network-webrtc'

class SDS_WebRTCProvider implements SDS_NetworkProvider, SDS_PresenceProvider {
  constructor (StoreId:string, Options?:SDS_WebRTCProviderOptions)

  // ── SDS_NetworkProvider ──────────────────────────────────────

  readonly StoreId:string
  get ConnectionState ():SDS_ConnectionState

  connect (URL:string, Options:SDS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void

  // ── SDS_PresenceProvider ─────────────────────────────────────

  sendLocalState (State:SDS_LocalPresenceState):void
  onRemoteState (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | undefined) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string, SDS_RemotePresenceState>
}
```

#### `SDS_WebRTCProviderOptions`

```typescript
interface SDS_WebRTCProviderOptions {
  ICEServers?:RTCIceServer[]         // STUN/TURN servers (default: Google STUN)
  Fallback?:  SDS_WebSocketProvider  // activated if WebRTC fails
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
import { SDS_DataStore }       from '@rozek/sds-core'
import { SDS_WebRTCProvider }  from '@rozek/sds-network-webrtc'
import { SDS_SyncEngine }      from '@rozek/sds-sync-engine'

const DataStore = SDS_DataStore.fromScratch()
const Network   = new SDS_WebRTCProvider('my-store')

const SyncEngine = new SDS_SyncEngine(DataStore, {
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### With automatic WebSocket fallback

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_WebRTCProvider }             from '@rozek/sds-network-webrtc'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const DataStore   = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('my-store')
const WSFallback  = new SDS_WebSocketProvider('my-store')
const Network     = new SDS_WebRTCProvider('my-store', { Fallback:WSFallback })

const SyncEngine = new SDS_SyncEngine(DataStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
// if WebRTC signalling fails, the engine automatically switches to WebSocket relay
```

### Custom ICE servers (TURN for strict NATs)

```typescript
const network = new SDS_WebRTCProvider('my-store', {
  ICEServers:[
    { urls:'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential:'pass',
    },
  ],
  Fallback:WSFallback,
})
```

---

## Server requirements

The relay server must expose a `/signal/:storeId` WebSocket endpoint. `@rozek/sds-websocket-server` provides this out of the box. The signalling endpoint accepts the same JWT `?token=` query parameter as the `/ws/:storeId` sync endpoint.

---

## License

MIT © Andreas Rozek