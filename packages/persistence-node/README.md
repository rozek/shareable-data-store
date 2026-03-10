# @rozek/sds-persistence-node

SQLite persistence provider for the **shareable-data-store** (SDS) family. Stores CRDT snapshots, incremental patches, and large value blobs in a local SQLite database — suitable for Node.js servers, Electron desktop apps, and Tauri (with a Node.js backend).

---

## Installation

```bash
pnpm add @rozek/sds-persistence-node
```

Requires Node.js 18+ and a native build toolchain for `better-sqlite3`.

---

## Concepts

The provider uses three SQLite tables:

| Table | Contents |
| --- | --- |
| `snapshots` | One compressed full-store snapshot per `store_id` |
| `patches` | Incremental CRDT patches keyed by `(store_id, clock)` |
| `blobs` | Large value blobs keyed by SHA-256 hash, with reference counting |

On startup `SDS_SyncEngine` calls `loadSnapshot()` to restore the last checkpoint, then `loadPatchesSince(clock)` to replay any patches recorded after that checkpoint. During operation every local mutation is appended via `appendPatch()`. When the accumulated patch size crosses 512 KB (managed by the sync engine), a new snapshot is written and old patches are pruned.

---

## API Reference

### `SDS_DesktopPersistenceProvider`

```typescript
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'

class SDS_DesktopPersistenceProvider implements SDS_PersistenceProvider {
  constructor (DbPath:string, StoreId:string)

  loadSnapshot ():Promise<Uint8Array | null>
  saveSnapshot (Data:Uint8Array):Promise<void>

  loadPatchesSince (Clock:number):Promise<Uint8Array[]>
  appendPatch (Patch:Uint8Array, Clock:number):Promise<void>
  prunePatches (beforeClock:number):Promise<void>

  loadValue (ValueHash:string):Promise<Uint8Array | null>
  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue (ValueHash:string):Promise<void>

  close ():Promise<void>
}
```

| Parameter | Description |
| --- | --- |
| `DbPath` | Directory where the SQLite file is created (created if it doesn't exist) |
| `StoreId` | Logical store identifier; multiple stores can share the same database file |

The SQLite file is named `<DbPath>/sns.db`. WAL mode is enabled automatically for better concurrent-read performance.

---

## Usage

### Standalone — Persistence only

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_DesktopPersistenceProvider('./data', 'my-store')

const SyncEngine = new SDS_SyncEngine(Store, { PersistenceProvider:Persistence })
await SyncEngine.start()   // restores snapshot + patches from SQLite

// work with the store normally …
const Data = Store.newItemAt('text/plain', Store.RootItem)
Data.Label = 'Persisted data'

await SyncEngine.stop()    // flushes final checkpoint and closes the DB
```

### With Network Sync

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_DesktopPersistenceProvider('./data', 'my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const SyncEngine = new SDS_SyncEngine(Store, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Multiple Stores in one Database

```typescript
const PersistenceA = new SDS_DesktopPersistenceProvider('./data', 'store-a')
const PersistenceB = new SDS_DesktopPersistenceProvider('./data', 'store-b')
// both use ./data/sns.db but different store_id values
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS snapshots (
  store_id  TEXT    PRIMARY KEY,
  data      BLOB    NOT NULL,
  clock     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS patches (
  store_id  TEXT    NOT NULL,
  clock     INTEGER NOT NULL,
  data      BLOB    NOT NULL,
  PRIMARY KEY (store_id, clock)
);

CREATE TABLE IF NOT EXISTS blobs (
  hash      TEXT    PRIMARY KEY,
  data      BLOB    NOT NULL,
  ref_count INTEGER NOT NULL DEFAULT 0
);
```

---

## License

MIT © Andreas Rozek