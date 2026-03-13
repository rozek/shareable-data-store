# @rozek/sds-network-websocket

WebSocket network and presence provider for the **shareable-data-store** (SDS) family. Connects a local `SDS_DataStore` to an `SDS_WebSocket_Server` relay, exchanges CRDT patches in real time, and synchronises presence state between all connected peers.

Works in **browsers** (native WebSocket API) and **Node.js 22+** (built-in WebSocket).

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22+** | required when using this package server-side. Node.js 22 ships a built-in WebSocket client — no polyfill needed. Download from [nodejs.org](https://nodejs.org). |
| **Modern browser** | required when using this package client-side. Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |
| **SDS WebSocket server** | the remote end must run `@rozek/sds-websocket-server` (or a compatible relay) to exchange CRDT patches and presence state. |

This package is isomorphic — it uses the native `WebSocket` API available in both environments.

---

## Installation

```bash
pnpm add @rozek/sds-network-websocket
# @rozek/sds-core is a peer dependency:
pnpm add @rozek/sds-core
```

---

## Concepts

`SDS_WebSocketProvider` implements both `SDS_NetworkProvider` and `SDS_PresenceProvider` from `@rozek/sds-core`. A single instance can therefore be passed to `SDS_SyncEngine` for both roles.

### Wire protocol

All messages are binary frames with a one-byte type prefix:

| Byte | Name | Direction | Payload |
| --- | --- | --- | --- |
| `0x01` | PATCH | bidirectional | CRDT patch bytes |
| `0x02` | VALUE | bidirectional | 32-byte SHA-256 hash + value bytes (≤ 1 MB) |
| `0x03` | REQ_VALUE | client → server | 32-byte SHA-256 hash |
| `0x04` | PRESENCE | bidirectional | UTF-8 JSON of `SDS_PresenceState` |
| `0x05` | VALUE_CHUNK | bidirectional | hash + chunk-index + total-chunks + chunk bytes |
| `0x06` | SYNC_REQ | bidirectional | opaque CRDT cursor bytes (may be empty for a fresh peer) |

Values larger than 1 MB (1,048,576 bytes) are split into `VALUE_CHUNK` frames of at most 1 MB each and reassembled on the receiving end before the `onValue` callback fires. The `total-chunks` field in every chunk frame indicates how many frames form the complete value.

### Auto-reconnect

When the WebSocket closes unexpectedly the provider transitions to `'reconnecting'` and retries the connection after `reconnectDelayMs` milliseconds (default 2 000 ms). All patches generated while reconnecting are buffered by the sync engine and flushed once the connection is re-established.

---

## API reference

### `SDS_WebSocketProvider`

```typescript
import { SDS_WebSocketProvider } from '@rozek/sds-network-websocket'

class SDS_WebSocketProvider implements SDS_NetworkProvider, SDS_PresenceProvider {
  constructor (StoreId:string)

  // ── SDS_NetworkProvider ──────────────────────────────────────

  readonly StoreId:string
  get ConnectionState ():SDS_ConnectionState  // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  connect (URL:string, Options:SDS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void
  sendSyncRequest (Cursor:Uint8Array):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void
  onSyncRequest (Callback:(Cursor:Uint8Array) => void):() => void

  // ── SDS_PresenceProvider ─────────────────────────────────────

  sendLocalState (State:SDS_LocalPresenceState):void
  onRemoteState (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | undefined) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string, SDS_RemotePresenceState>
}
```

#### `SDS_ConnectionOptions`

```typescript
interface SDS_ConnectionOptions {
  Token:string             // JWT for authentication at the relay server
  reconnectDelayMs?: number // delay before reconnect attempt (default 2000 ms)
}
```

All `on*` methods return an unsubscribe function. Call it to stop receiving the corresponding events.

---

## Usage

### With `SDS_SyncEngine` (recommended)

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const DataStore   = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const SyncEngine = new SDS_SyncEngine(DataStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })

// react to connection state changes
SyncEngine.onConnectionChange((State) => {
  console.log('Connection:',State)  // 'connected', 'reconnecting', …
})
```

### Without the sync engine — direct use

```typescript
import { SDS_WebSocketProvider } from '@rozek/sds-network-websocket'

const Network = new SDS_WebSocketProvider('my-store')

const unsubPatch = Network.onPatch((patch) => {
  console.log('Received patch:', patch.byteLength, 'bytes')
})

const unsubConn = Network.onConnectionChange((state) => {
  console.log('State:', state)
})

await Network.connect('wss://my-server.example.com', { Token:'<jwt>' })

// send a raw patch
Network.sendPatch(new Uint8Array([/* ... */]))

// send presence info
Network.sendLocalState({ UserName:'Alice', UserColor:'#3498db' })

// later: clean up
unsubPatch()
unsubConn()
Network.disconnect()
```

### Tracking peer presence

```typescript
// snapshot of currently active peers
for (const [PeerId,PeerState] of Network.PeerSet) {
  console.log(PeerId, PeerState.UserName, PeerState.lastSeen)
}

// react whenever a peer's state changes
Network.onRemoteState((PeerId,PeerState) => {
  if (PeerState === null) {
    console.log(PeerId, 'left')
  } else {
    console.log(PeerId, 'is at', PeerState.UserFocus?.EntryId)
  }
})
```

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek