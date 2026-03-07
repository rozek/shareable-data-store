# @rozek/sns-persistence-browser

IndexedDB persistence provider for the **shareable-notes-store** (SNS) family. Stores CRDT snapshots, incremental patches, and large value blobs in the browser's built-in IndexedDB — works in any modern browser, including offline PWAs and Electron renderer processes.

---

## Installation

```bash
pnpm add @rozek/sns-persistence-browser
```

No native dependencies; pure browser API.

---

## Concepts

The provider creates one IndexedDB database per store (named `sns:<storeId>`) with three object stores:

| Object store | Key | Contents |
|---|---|---|
| `snapshots` | `storeId` | Latest gzip-compressed full-store snapshot |
| `patches` | `[storeId, clock]` | Incremental CRDT patches in clock order |
| `values` | `hash` | Large value blobs with SHA-256 hash key and reference counter |

The database is opened lazily on the first operation. All operations are wrapped in IndexedDB transactions and return promises.

On startup `SNS_SyncEngine` calls `loadSnapshot()` to restore the last checkpoint, then `loadPatchesSince(clock)` to replay any patches recorded after that checkpoint. As new local mutations arrive, they are appended via `appendPatch()`. When the accumulated patch size crosses 512 KB (managed by the sync engine), a new snapshot replaces the old one and outdated patches are pruned.

---

## API Reference

### `SNS_BrowserPersistenceProvider`

```typescript
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'

class SNS_BrowserPersistenceProvider implements SNS_PersistenceProvider {
  constructor(StoreId:string)

  loadSnapshot():Promise<Uint8Array | null>
  saveSnapshot(Data:Uint8Array):Promise<void>

  loadPatchesSince(Clock:number):Promise<Uint8Array[]>
  appendPatch(Patch:Uint8Array, Clock:number):Promise<void>
  prunePatches(beforeClock:number):Promise<void>

  loadValue(ValueHash:string):Promise<Uint8Array | null>
  saveValue(ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue(ValueHash:string):Promise<void>

  close():Promise<void>
}
```

| Parameter | Description |
|---|---|
| `StoreId` | Logical store name; determines the IndexedDB database name (`sns:<StoreId>`) |

`releaseValue` uses reference counting: the blob row is deleted only when the counter reaches zero, so the same blob can be referenced by multiple notes safely.

---

## Usage

### Offline-first PWA

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('my-notes')

const engine = new SNS_SyncEngine(store, { PersistenceProvider:persistence })

// restores from IndexedDB before resolving — works fully offline
await engine.start()

const note = store.newNoteAt('text/plain', store.RootNote)
note.Label = 'Survives a page refresh'
await note.writeValue('Stored in IndexedDB.')

await engine.stop()   // final checkpoint written to IndexedDB
```

### With WebSocket sync

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('my-notes')
const network = new SNS_WebSocketProvider('my-notes')

const engine = new SNS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Multiple independent stores

```typescript
// each store gets its own IndexedDB database: sns:notes, sns:tasks, …
const notesPersistence = new SNS_BrowserPersistenceProvider('notes')
const tasksPersistence = new SNS_BrowserPersistenceProvider('tasks')
```

---

## License

MIT © Andreas Rozek
