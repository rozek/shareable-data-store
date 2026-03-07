# @rozek/sns-persistence-node

SQLite persistence provider for the **shareable-notes-store** (SNS) family. Stores CRDT snapshots, incremental patches, and large value blobs in a local SQLite database — suitable for Node.js servers, Electron desktop apps, and Tauri (with a Node.js backend).

---

## Installation

```bash
pnpm add @rozek/sns-persistence-node
```

Requires Node.js 18+ and a native build toolchain for `better-sqlite3`.

---

## Concepts

The provider uses three SQLite tables:

| Table | Contents |
|---|---|
| `snapshots` | One compressed full-store snapshot per `store_id` |
| `patches` | Incremental CRDT patches keyed by `(store_id, clock)` |
| `blobs` | Large value blobs keyed by SHA-256 hash, with reference counting |

On startup `SNS_SyncEngine` calls `loadSnapshot()` to restore the last checkpoint, then `loadPatchesSince(clock)` to replay any patches recorded after that checkpoint. During operation every local mutation is appended via `appendPatch()`. When the accumulated patch size crosses 512 KB (managed by the sync engine), a new snapshot is written and old patches are pruned.

---

## API Reference

### `SNS_DesktopPersistenceProvider`

```typescript
import { SNS_DesktopPersistenceProvider } from '@rozek/sns-persistence-node'

class SNS_DesktopPersistenceProvider implements SNS_PersistenceProvider {
  constructor(DbPath:string, StoreId:string)

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
| `DbPath` | Directory where the SQLite file is created (created if it doesn't exist) |
| `StoreId` | Logical store identifier; multiple stores can share the same database file |

The SQLite file is named `<DbPath>/sns.db`. WAL mode is enabled automatically for better concurrent-read performance.

---

## Usage

### Standalone — persistence only

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_DesktopPersistenceProvider } from '@rozek/sns-persistence-node'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_DesktopPersistenceProvider('./data', 'my-notes')

const engine = new SNS_SyncEngine(store, { PersistenceProvider:persistence })
await engine.start()   // restores snapshot + patches from SQLite

// work with the store normally …
const note = store.newNoteAt('text/plain', store.RootNote)
note.Label = 'Persisted note'

await engine.stop()    // flushes final checkpoint and closes the DB
```

### With network sync

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_DesktopPersistenceProvider } from '@rozek/sns-persistence-node'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_DesktopPersistenceProvider('./data', 'my-notes')
const network = new SNS_WebSocketProvider('my-notes')

const engine = new SNS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Multiple stores in one database

```typescript
const persistenceA = new SNS_DesktopPersistenceProvider('./data', 'store-a')
const persistenceB = new SNS_DesktopPersistenceProvider('./data', 'store-b')
// both use ./data/sns.db but different store_id values
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

MIT © Andreas Rozek
