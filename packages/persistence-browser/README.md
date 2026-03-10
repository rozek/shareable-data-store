# @rozek/sds-persistence-browser

IndexedDB persistence provider for the **shareable-data-store** (SDS) family. Stores CRDT snapshots, incremental patches, and large value blobs in the browser's built-in IndexedDB — works in any modern browser, including offline PWAs and Electron renderer processes.

---

## Installation

```bash
pnpm add @rozek/sds-persistence-browser
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

On startup `SDS_SyncEngine` calls `loadSnapshot()` to restore the last checkpoint, then `loadPatchesSince(clock)` to replay any patches recorded after that checkpoint. As new local mutations arrive, they are appended via `appendPatch()`. When the accumulated patch size crosses 512 KB (managed by the sync engine), a new snapshot replaces the old one and outdated patches are pruned.

---

## API Reference

### `SDS_BrowserPersistenceProvider`

```typescript
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'

class SDS_BrowserPersistenceProvider implements SDS_PersistenceProvider {
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

`releaseValue` uses reference counting: the blob row is deleted only when the counter reaches zero, so the same blob can be referenced by multiple items safely.

---

## Usage

### Offline-first PWA

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('my-store')

const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persistence })

// restores from IndexedDB before resolving — works fully offline
await Engine.start()

const Data = Store.newItemAt('text/plain', Store.RootItem)
Data.Label = 'Survives a page refresh'
await Data.writeValue('Stored in IndexedDB.')

await Engine.stop()   // final checkpoint written to IndexedDB
```

### With WebSocket sync

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const Engine = new SDS_SyncEngine(Store, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider: Network,
})

await Engine.start()
await Engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Multiple independent stores

```typescript
// each store gets its own IndexedDB database: sns:items, sns:tasks, …
const dataPersistence = new SDS_BrowserPersistenceProvider('items')
const tasksPersistence = new SDS_BrowserPersistenceProvider('tasks')
```

---

## License

MIT © Andreas Rozek
