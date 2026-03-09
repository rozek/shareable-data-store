# @rozek/sds-sync-engine

The orchestration layer of the **shareable-data-store** (SNS) family. `SDS_SyncEngine` wires an `SDS_NoteStore` to a persistence provider, a network provider, and a presence provider, and manages the full lifecycle: startup restore, offline patch queuing, automatic checkpointing, large-value transfer, and presence heartbeats.

---

## Installation

```bash
pnpm add @rozek/sds-sync-engine
```

---

## Concepts

### Startup restore

When `start()` is called, the engine loads the latest snapshot from the persistence provider and replays all patches recorded since that snapshot. The store is in a consistent, up-to-date state before `start()` resolves.

### Offline queue

While the network connection is in `'disconnected'` or `'reconnecting'` state, outgoing patches are queued in memory. As soon as the connection transitions to `'connected'`, the queue is flushed in order.

### Automatic checkpointing

Every local mutation's patch bytes are accumulated. When the total crosses **512 KB**, the engine writes a new snapshot and prunes all patches up to that point. A final checkpoint is also written on `stop()` if there are any un-checkpointed patches.

### Large-value transfer

When a note's value changes to a reference kind (`'literal-reference'` or `'binary-reference'`), the engine sends the blob to the network provider. When the store receives a patch referencing an unknown blob hash, the engine requests the blob from the network provider.

### Presence heartbeat

The engine periodically re-broadcasts the local presence state so that remote peers can detect stale entries (timeout controlled by `PresenceTimeoutMs`).

### BroadcastChannel (browser / Tauri)

When running in a browser or Tauri context, the engine optionally uses a `BroadcastChannel` to relay patches and presence frames between tabs opened on the same origin, without going through the server.

---

## API Reference

### `SDS_SyncEngine`

```typescript
import { SDS_SyncEngine } from '@rozek/sds-sync-engine'

class SDS_SyncEngine {
  constructor(Store:SDS_NoteStore, Options?: SDS_SyncEngineOptions)

  // ── Lifecycle ────────────────────────────────────────────────

  start():Promise<void>   // restore, wire providers
  stop():  Promise<void>   // flush queue, write checkpoint, close providers

  // ── Network ──────────────────────────────────────────────────

  connectTo(URL:string, Options:SDS_ConnectionOptions):Promise<void>
  disconnect():void
  reconnect():Promise<void>

  get ConnectionState():SDS_ConnectionState
  onConnectionChange(Callback:(State:SDS_ConnectionState) => void):() => void

  // ── Presence ─────────────────────────────────────────────────

  readonly PeerId:string   // unique identifier for this engine instance (UUID)

  setPresenceTo(State:SDS_LocalPresenceState):void
  readonly PeerSet:ReadonlyMap<string, SDS_RemotePresenceState>
  onPresenceChange(
    Callback:(
      PeerId:  string,
      State:   SDS_RemotePresenceState | undefined,
      Origin:'local' | 'remote'
    ) => void
  ):() => void
}
```

### `SDS_SyncEngineOptions`

```typescript
interface SDS_SyncEngineOptions {
  PersistenceProvider?: SDS_PersistenceProvider  // SQLite or IndexedDB
  NetworkProvider?:     SDS_NetworkProvider       // WebSocket or WebRTC
  PresenceProvider?:    SDS_PresenceProvider      // often the same as NetworkProvider
  BroadcastChannel?:    boolean                   // cross-tab relay (default: true in browser)
  PresenceTimeoutMs?:   number                    // peer inactivity timeout (default: 120 000 ms)
}
```

All providers are optional. You can use any combination — for example persistence only (no network), or network only (no persistence).

### Error codes

| Code | Thrown by | Reason |
|---|---|---|
| `'no-network-provider'` | `connectTo()` | No `NetworkProvider` was configured |
| `'not-yet-connected'` | `reconnect()` | `connectTo()` has never been called successfully |

---

## Usage

### Persistence only — offline-capable local store

```typescript
import { SDS_NoteStore }                  from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const store = SDS_NoteStore.fromScratch()
const persistence = new SDS_DesktopPersistenceProvider('./data', 'my-notes')

const engine = new SDS_SyncEngine(store, { PersistenceProvider:persistence })
await engine.start()

const note = store.newNoteAt('text/plain', store.RootNote)
note.Label = 'This note survives restarts'

await engine.stop()  // writes checkpoint, closes DB
```

### Full stack — persistence + WebSocket + presence

```typescript
import { SDS_NoteStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const store = SDS_NoteStore.fromScratch()
const persistence = new SDS_BrowserPersistenceProvider('my-notes')
const network = new SDS_WebSocketProvider('my-notes')

const engine = new SDS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })

engine.onConnectionChange((state) => {
  if (state === 'connected') console.log('Online — syncing')
  if (state === 'reconnecting') console.log('Offline — patches queued')
})
```

### Presence — show collaborators

```typescript
// announce yourself
engine.setPresenceTo({
  UserName: 'Alice',
  UserColor:'#3498db',
  UserFocus:{ entryId:note.Id, Property:'Value', Cursor:{ from:4, to:4 } },
})

// react to any peer change (local or remote)
engine.onPresenceChange((peerId, state, origin) => {
  if (state == null) {
    // peer timed out
    removeAvatarFor(peerId)
  } else if (origin === 'remote') {
    showAvatarFor(peerId, state)
  }
})

// snapshot of all currently active peers
for (const [peerId, state] of engine.PeerSet) {
  console.log(peerId, state.UserName, state.UserFocus)
}
```

### Reconnect after a planned disconnect

```typescript
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })

// … later …
engine.disconnect()

// … reconnect using the same URL and token
await engine.reconnect()
```

---

## License

MIT © Andreas Rozek
