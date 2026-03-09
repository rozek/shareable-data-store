# @rozek/sns-network-websocket

WebSocket network and presence provider for the **shareable-notes-store** (SNS) family. Connects a local `SNS_NoteStore` to an `SNS_WebSocket_Server` relay, exchanges CRDT patches in real time, and synchronises presence state between all connected peers.

Works in **browsers** (native WebSocket API) and **Node.js 22+** (built-in WebSocket).

---

## Installation

```bash
pnpm add @rozek/sns-network-websocket
```

---

## Concepts

`SNS_WebSocketProvider` implements both `SNS_NetworkProvider` and `SNS_PresenceProvider` from `@rozek/sns-core`. A single instance can therefore be passed to `SNS_SyncEngine` for both roles.

### Wire protocol

All messages are binary frames with a one-byte type prefix:

| Byte | Name | Direction | Payload |
| --- | --- | --- | --- |
| `0x01` | PATCH | bidirectional | CRDT patch bytes |
| `0x02` | VALUE | bidirectional | 32-byte SHA-256 hash + value bytes (≤ 1 MB) |
| `0x03` | REQ_VALUE | client → server | 32-byte SHA-256 hash |
| `0x04` | PRESENCE | bidirectional | UTF-8 JSON of `SNS_PresenceState` |
| `0x05` | VALUE_CHUNK | bidirectional | hash + chunk-index + total-chunks + chunk bytes |

Values larger than 1 MB are split into `VALUE_CHUNK` frames automatically and reassembled on the receiving end before the `onValue` callback fires.

### Auto-reconnect

When the WebSocket closes unexpectedly the provider transitions to `'reconnecting'` and retries the connection after `reconnectDelayMs` milliseconds (default 2 000 ms). All patches generated while reconnecting are buffered by the sync engine and flushed once the connection is re-established.

---

## API Reference

### `SNS_WebSocketProvider`

```typescript
import { SNS_WebSocketProvider } from '@rozek/sns-network-websocket'

class SNS_WebSocketProvider implements SNS_NetworkProvider, SNS_PresenceProvider {
  constructor (StoreId:string)

  // ── SNS_NetworkProvider ──────────────────────────────────────

  readonly StoreID:string
  get ConnectionState ():SNS_ConnectionState  // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  connect (URL:string, Options:SNS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SNS_ConnectionState) => void):() => void

  // ── SNS_PresenceProvider ─────────────────────────────────────

  sendLocalState (State:SNS_LocalPresenceState):void
  onRemoteState (
    Callback:(PeerId:string, State:SNS_RemotePresenceState | null) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string, SNS_RemotePresenceState>
}
```

#### `SNS_ConnectionOptions`

```typescript
interface SNS_ConnectionOptions {
  Token:string             // JWT for authentication at the relay server
  reconnectDelayMs?: number // delay before reconnect attempt (default 2000 ms)
}
```

All `on*` methods return an unsubscribe function. Call it to stop receiving the corresponding events.

---

## Usage

### With `SNS_SyncEngine` (recommended)

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const NoteStore   = SNS_NoteStore.fromScratch()
const Persistence = new SNS_BrowserPersistenceProvider('my-notes')
const Network     = new SNS_WebSocketProvider('my-notes')

const SyncEngine = new SNS_SyncEngine(NoteStore, {
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
import { SNS_WebSocketProvider } from '@rozek/sns-network-websocket'

const Network = new SNS_WebSocketProvider('my-store')

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

MIT © Andreas Rozek