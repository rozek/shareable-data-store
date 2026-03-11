# @rozek/sds-persistence-node

SQLite persistence provider for the **shareable-data-store** (SDS) family. Stores CRDT snapshots, incremental patches, and large value blobs in a local SQLite database — suitable for Node.js servers, Electron desktop apps, and Tauri (with a Node.js backend).

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required. Download from [nodejs.org](https://nodejs.org). |

This package targets **Node.js only** and is not intended for use in a browser context.

SQLite support is provided by the built-in `node:sqlite` module (available since Node.js 22.5) — no separate database driver, no native C++ addon, and no build toolchain is required.

> **Note on stability:** `node:sqlite` is classified as *Stability 1 — Experimental* in the Node.js 22 and 24 documentation. In practice the API has been stable since its introduction, with no breaking changes across any release. The module is expected to reach *Stability 2 — Stable* with Node.js 26.

---

## Installation

```bash
pnpm add @rozek/sds-persistence-node
```

Requires Node.js 22.5+. No native dependencies are needed — SQLite is provided by Node.js itself.

---

## Concepts

The provider uses three SQLite tables:

| table | contents |
| --- | --- |
| `snapshots` | one compressed full-store snapshot per `store_id` |
| `patches` | incremental CRDT patches keyed by `(store_id, clock)` |
| `blobs` | large value blobs keyed by SHA-256 hash, with reference counting |

On startup `SDS_SyncEngine` calls `loadSnapshot()` to restore the last checkpoint, then `loadPatchesSince(clock)` to replay any patches recorded after that checkpoint. During operation every local mutation is appended via `appendPatch()`. When the accumulated patch size crosses 512 KB (managed by the sync engine), a new snapshot is written and old patches are pruned.

---

## API reference

### `SDS_DesktopPersistenceProvider`

```typescript
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'

class SDS_DesktopPersistenceProvider implements SDS_PersistenceProvider {
  constructor (DbPath:string, StoreId:string)

  loadSnapshot ():Promise<Uint8Array | undefined>
  saveSnapshot (Data:Uint8Array):Promise<void>

  loadPatchesSince (Clock:number):Promise<Uint8Array[]>
  appendPatch (Patch:Uint8Array, Clock:number):Promise<void>
  prunePatches (beforeClock:number):Promise<void>

  loadValue (ValueHash:string):Promise<Uint8Array | undefined>
  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue (ValueHash:string):Promise<void>

  close ():Promise<void>
}
```

| parameter | description |
| --- | --- |
| `DbPath` | path to the SQLite database file (created if it does not exist) |
| `StoreId` | logical store identifier; multiple stores can share the same database file |

WAL mode is enabled automatically for better concurrent-read performance.

---

## Usage

### Standalone — persistence only

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_DesktopPersistenceProvider('./data/sds.db', 'my-store')

const SyncEngine = new SDS_SyncEngine(Store, { PersistenceProvider:Persistence })
await SyncEngine.start()   // restores snapshot + patches from SQLite

// work with the store normally …
const Data = Store.newItemAt('text/plain', Store.RootItem)
Data.Label = 'Persisted data'

await SyncEngine.stop()    // flushes final checkpoint and closes the DB
```

### With network sync

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_DesktopPersistenceProvider('./data/sds.db', 'my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const SyncEngine = new SDS_SyncEngine(Store, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Multiple stores in one database

```typescript
const PersistenceA = new SDS_DesktopPersistenceProvider('./data/sds.db', 'store-a')
const PersistenceB = new SDS_DesktopPersistenceProvider('./data/sds.db', 'store-b')
// both use the same database file but different store_id values
```

---

## Database schema

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

[MIT License](../../LICENSE.md) © Andreas Rozek