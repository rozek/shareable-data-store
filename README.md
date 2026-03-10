# shareable-data-store

A CRDT-based, offline-capable, real-time-syncable **tree-of-data** library for Browser and Node.js.

Data Items are organised in a hierarchy (with optional links between them), can carry arbitrary typed values (text, binary, large blobs), and synchronise across devices and users without conflicts — even when peers are offline for extended periods. The library is split into small, composable packages so you can use only what you need.

The CRDT engine is **pluggable**: choose from three ready-made backends or write your own: [Y.js](https://yjs.dev/), [Loro CRDT](https://loro.dev/) or [JSON JOY](https://jsonjoy.com/).

### Current Roadmap

Next steps:

- \[ \] CLI Interface - access your stores from the command line
- \[ \] MCP Server - access your stores from any MCP-capable AI
- \[ \] Applications - some concrete applications (e.g., a shareable notebook similar Obsidian or Notion)
- \[ \] (not yet to be revealed)

---

## Packages

### Shared Types

| Package | Description |
| --- | --- |
| `@rozek/sds-core` | Backend-agnostic shared types: `SDS_Error`, `SDS_ChangeSet`, `SDS_Entry`/`Data`/`Link` base classes, the `SDS_DataStore` contract interface, and all provider interfaces. No CRDT engine — the interface must be implemented by a backend. |

### CRDT Backends (choose one)

| Package | CRDT engine | Description |
| --- | --- | --- |
| `@rozek/sds-core-jj` | [json-joy](https://github.com/streamich/json-joy) 17.x | reference backend; ships with a canonical empty snapshot |
| `@rozek/sds-core-yjs` | [Y.js](https://github.com/yjs/yjs) | no canonical snapshot; Y.js state-vector cursor |
| `@rozek/sds-core-loro` | [Loro](https://loro.dev/) | no canonical snapshot; Loro version-vector cursor; Rust/WASM |

All three backend packages expose an **identical public API**. Import from whichever backend suits your project; application code never calls any CRDT library directly.

### Infrastructure (Backend-agnostic)

| Package | Description |
| --- | --- |
| `@rozek/sds-persistence-node` | SQLite persistence for Node.js and Electron |
| `@rozek/sds-persistence-browser` | IndexedDB persistence for browsers |
| `@rozek/sds-network-websocket` | WebSocket sync + presence provider |
| `@rozek/sds-network-webrtc` | WebRTC peer-to-peer sync + presence provider (browser) |
| `@rozek/sds-sync-engine` | orchestrates persistence, network, and presence |
| `@rozek/sds-websocket-server` | Hono-based relay server: JWT auth, signalling, token issuance |

---

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                       │
│                                                             │
│   SDS_DataStore  ←── read/write ──►  SDS_SyncEngine         │
│   (any backend)                      │      │       │       │
│                               Persistence Network Presence  │
│                                 Provider Provider Provider  │
└─────────────────────────────────────────────────────────────┘
         ▲ CRDT patches                          │ WebSocket / WebRTC
         │                                       ▼
         └──────────────────── SDS WebSocket Server ◄── other peers
```

`SDS_DataStore` is the source of truth. It holds a tree of items and links stored as a conflict-free replicated data type (CRDT). `SDS_SyncEngine` wires it to any combination of:

- a **persistence provider** — saves snapshots and patches so the store survives restarts and works offline
- a **network provider** — exchanges CRDT patches with a relay server or other peers in real time
- a **presence provider** — shares user name, cursor position, and focus between peers without persisting them

All providers are optional and interchangeable. A browser PWA might use IndexedDB + WebSocket; an Electron app might use SQLite + WebRTC with WebSocket fallback.

---

## Quick Start

### Choosing a backend

All backends offer the same API. Pick one and import from it:

```typescript
// Option A — json-joy (reference implementation)
import { SDS_DataStore } from '@rozek/sds-core-jj'

// Option B — Y.js
import { SDS_DataStore } from '@rozek/sds-core-yjs'

// Option C — Loro CRDT
import { SDS_DataStore } from '@rozek/sds-core-loro'
```

The examples below use `@rozek/sds-core-jj` but work identically with any backend.

### Local-only — no Network, no Server

```typescript
import { SDS_DataStore } from '@rozek/sds-core-jj'

const DataStore = SDS_DataStore.fromScratch()

const DataItem = DataStore.newItemAt(undefined, DataStore.RootItem)
DataItem.Label = 'My first data'
DataItem.writeValue('Hello, world!')

// serialise to binary and restore later
const StoreSnapshot = DataStore.asBinary()
const restoredStore = SDS_DataStore.fromBinary(StoreSnapshot)
```

### Browser PWA — offline-first with WebSocket Sync

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core-jj'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const DataStore   = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const SyncEngine = new SDS_SyncEngine(DataStore, {
  PersistenceProvider: Persistence,
  NetworkProvider:     Network,
  PresenceProvider:    Network,  // WebSocket provider doubles as presence provider
})

// restores persisted state before resolving
await SyncEngine.start()

// connect to the relay server with a JWT
await SyncEngine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })

// write items — the engine handles persistence and sync transparently
const DataItem = DataStore.newItemAt(undefined, DataStore.RootItem)
DataItem.Label = 'Hello from the browser!'
```

### Node.js / Electron — SQLite Persistence

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core-jj'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'

const Store       = SDS_DataStore.fromScratch()
const Persistence = new SDS_DesktopPersistenceProvider('./data', 'my-store')
const Network     = new SDS_WebSocketProvider('my-store')

const Engine = new SDS_SyncEngine(Store, {
  PersistenceProvider: Persistence,
  NetworkProvider:     Network,
  PresenceProvider:    Network,
})

await Engine.start()
await Engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })
```

### Presence — see who is editing what

```typescript
// broadcast your cursor position and user info
Engine.setPresenceTo({
  UserName: 'Alice',
  UserColor:'#e74c3c',
  UserFocus:{
    EntryId: DataItem.Id,
    Property:'Value',
    Cursor:  { from:0, to:5 },
  },
})

// react when any peer's presence changes
Engine.onPresenceChange((PeerId, State, Origin) => {
  if (Origin === 'remote') {
    console.log(`${State?.UserName ?? PeerId} is editing`, State?.UserFocus?.EntryId)
  }
})
```

### Running the Relay Server

```typescript
import { createSDSServer } from '@rozek/sds-websocket-server'
import { serve }           from '@hono/node-server'

const { app:App } = createSDSServer({ JWTSecret:'your-secret-at-least-32-chars' })

serve({ fetch:App.fetch, Port:3000 }, () => {
  console.log('SDS relay server listening on port 3000')
})
```

---

## Data Model

Every store starts with three well-known items:

- **RootItem** — root of the user-visible tree
- **TrashItem** — deleted entries are moved here; can be permanently purged
- **LostAndFoundItem** — entries orphaned by a remote peer's purge are rescued here

Each data has:

- **Label** — plain-text title (collaborative, CRDT string)
- **Type** — MIME type string (`text/plain`, `text/markdown`, `image/png`, …)
- **Value** — string, `Uint8Array`, or a reference to a large blob (stored separately)
- **Info** — arbitrary key–value metadata map
- **innerEntryList** — ordered list of inner items and links

Links are pointer entries: they live inside a container data and point to a target data elsewhere in the tree. They are useful for cross-references, shortcuts, and aliases.

---

## Requirements

### Functional Requirements

**Data Store**

- the store holds an ordered, arbitrarily deep tree of entries. Each entry is either an *item* or a *link*.
- an item carries a MIME type, a string or binary value (or no value at all), a plain-text label, and an arbitrary key–value metadata map (`Info`).
- a link is a named pointer to another item. It lives inside a container item but does not own its target.
- the tree always contains three non-deletable, non-movable well-known items: `RootItem`, `TrashItem`, and `LostAndFoundItem`.
- entries can be created, labelled, moved, and soft-deleted (moved to `TrashItem`). Soft-deleted entries can be permanently purged.
- an item that is still referenced by a link from the live tree (reachable from `RootItem`) is protected: a purge attempt throws `SDS_Error('purge-protected')`.
- entries in `TrashItem` are eligible for automatic permanent deletion after a configurable time-to-live (`TrashTTLms`). The timestamp is recorded in the entry's `Info._trashedAt` field (synced via CRDT) when the entry is moved to Trash via `deleteEntry`.
- after applying a remote patch, any entry whose declared outer item no longer exists is automatically rescued to `LostAndFoundItem`. Dangling links whose target no longer exists are recreated in `LostAndFoundItem` so the link remains valid.
- ordering of inner entries within a container is collaborative and stable: any peer can insert an entry at any position without conflicting with concurrent inserts on other peers.
- large string and binary values that exceed configurable thresholds are stored as external blobs referenced by a SHA-256 hash, keeping the CRDT compact.
- the store can be serialised to a compact binary snapshot (gzip-compressed) or to a base64 string, and can be fully reconstructed from either.

**Synchronisation**

- all mutations are expressed as binary CRDT patches that can be applied in any order and on any peer without conflict.
- multiple patches originating from a single `transact()` call are wrapped in a lightweight binary envelope and treated atomically by the receiver.
- patches accumulated since any given clock position can be exported for incremental sync.
- the sync engine persists a rolling snapshot plus incremental patches. A new checkpoint (snapshot + prune) is triggered automatically when accumulated patches exceed 512 KB, and always on clean shutdown.
- outgoing patches generated while offline are queued in memory and flushed in order as soon as the connection is re-established.

**Presence**

- each sync-engine instance has a unique peer id (UUID).
- presence state (user name, colour, focused entry, cursor position) is broadcasted to all connected peers.
- remote peers that have not sent an update within the configured timeout (default 120 s) are automatically removed.
- presence state is not persisted — it is ephemeral.

**Networking**

- two transport providers are available out of the box: WebSocket (browser + Node.js) and WebRTC with WebSocket fallback (browser only).
- the server authenticates clients with HS256 JWTs and enforces `read` / `write` / `admin` scope per connection.
- the server exposes a WebRTC signalling endpoint and an admin API for token issuance.
- large value blobs are transferred as chunked binary frames independent of the CRDT patch stream.

### Non-functional Requirements

- **Runtime support** — browser (modern, ESM-capable) and Node.js 22+; no CommonJS.
- **Module format** — ESM-only throughout, with TypeScript declaration files (`.d.ts`).
- **Conflict-free** — all concurrent edits must converge to the same state on all peers without manual conflict resolution.
- **Offline-first** — local reads and writes must work without any network connectivity.
- **Composable** — each concern (persistence, networking, presence) is encapsulated in a separate, exchangeable package.
- **Compact wire format** — CRDT patches are binary-encoded; snapshots are gzip-compressed.
- **No global state** — multiple independent store instances must be usable within the same process.
- **Testability** — all providers are defined as interfaces so they can be replaced by mocks in unit tests.
- **MIT-compatible dependency chain** — all runtime dependencies must use a permissive open-source licence (Apache 2.0, MIT, or equivalent) to allow inclusion in MIT-licensed projects.

---

## Data model

### The Store as seen by Application Code

From the application's perspective the store looks like a document-oriented tree:

```
RootItem
├── Item (text/plain)  — Label="Meeting items", Value="…"
│   ├── Item (text/markdown)  — Label="Action items"
│   └── Link  ──────────────────────────────────────► Item (text/plain)  — Label="Alice's task"
├── Item (image/png)  — Label="Screenshot", Value=<binary blob ref>
└── TrashItem
    └── Item (text/plain)  — Label="Draft (deleted)"
```

The three well-known items are always present and have fixed UUIDs:

| UUID | Role |
| --- | --- |
| `00000000-0000-4000-8000-000000000000` | `RootItem` |
| `00000000-0000-4000-8000-000000000001` | `TrashItem` |
| `00000000-0000-4000-8000-000000000002` | `LostAndFoundItem` |

### Store Rules

The following invariants are maintained at all times:

1. **Acyclicity** — the outer-item chain of any entry must not form a cycle. `moveEntryTo` throws `SDS_Error('move-would-cycle')` if the target item is a descendant of the entry being moved.
2. **Root immobility** — `RootItem`, `TrashItem`, and `LostAndFoundItem` can never be moved or deleted.
3. **Trash-only purge** — `purgeEntry` only accepts direct inner entries of `TrashItem`. Deeper descendants must be moved to the trash root first.
4. **Link protection** — an item (and its subtree) is *protected* if any item within it is the target of a link that is reachable from `RootItem`. `purgeEntry` throws `SDS_Error('purge-protected')` for protected items; `purgeExpiredTrashEntries` skips them silently.
5. **Trash TTL** — `deleteEntry` records a `_trashedAt` timestamp (ms since epoch) in the entry's `Info` object. `purgeExpiredTrashEntries(TTLms)` permanently removes all direct inner entries of `TrashItem` whose `_trashedAt` is older than `TTLms`. When `TrashTTLms` is passed to `SDS_DataStore.fromScratch`, an internal timer fires at `TrashCheckIntervalMs` intervals automatically.
6. **Orphan rescue** — after applying a remote patch, any entry whose `outerItemId` points to a non-existent item is immediately moved to `LostAndFoundItem` by `recoverOrphans()`.
7. **Dangling-link rescue** — after applying a remote patch, any link whose `TargetId` points to a non-existent item causes that item to be recreated (empty) in `LostAndFoundItem`.
8. **Inner-entry ordering** — the `innerEntryList` of an item is always sorted by `OrderKey` (ascending), with the entry `Id` as a tie-breaker. Order is stable across concurrent insertions on different peers.

### Flat Map Layout

Internally the store uses a **flat** `Entries` map (keyed by UUID) rather than a nested tree structure. This is true for all backends. The entry's `outerItemId` and `OrderKey` fields record its position in the tree. A move is a single field update; patches stay small regardless of tree depth.

### Fractional Indexing for collaborative Ordering

CRDT maps are inherently unordered. To give users a stable, collaboratively editable inner-entry order without conflicts, each entry records an `OrderKey` alongside its `outerItemId`. `OrderKey` strings are generated by the `fractional-indexing` npm package.

The algorithm was originally developed by Evan Wallace at Figma and later published by the Rocicorp team. Just as there is always a rational number between any two distinct rationals, there is always a lexicographically ordered string between any two distinct strings. A key can always be generated between any two neighbours without modifying their keys; concurrent inserts at the same position produce different keys resolved by UUID as a tie-breaker.

### In-memory secondary Indices

Because the CRDT only stores `outerItemId` *inside the inner entry*, reconstructing the inner-entry list of a given item requires scanning all entries — O(n). The store maintains a `#ReverseIndex` (`Map<outerItemId, Set<innerId>>`) and a `#LinkTargetIndex` (`Map<targetId, Set<linkId>>`) as in-memory secondary indices. Both are rebuilt from scratch once during construction and then kept in sync incrementally for every mutation.

Remote patches use a *forward-index diff*: companion maps `#ForwardIndex` and `#LinkForwardIndex` record the last-known placement of every entry. After a patch is applied, the store iterates the new view once and compares each entry's current placement against the forward index, touching only the buckets that actually changed.

---

## Backend-specific Details

Each backend stores the same logical model in a different CRDT representation. Refer to the individual package READMEs for details:

- `packages/core-jj/README.md` — json-joy (canonical snapshot, 4-byte cursor)
- `packages/core-yjs/README.md` — Y.js (state-vector cursor, Y.Text)
- `packages/core-loro/README.md` — Loro CRDT (version-vector cursor, LoroText, Rust/WASM)

### The `SDS_SyncCursor` Abstraction

The persistence interface uses an **opaque binary cursor** (`SDS_SyncCursor = Uint8Array`) instead of a raw integer clock. Each backend encodes the cursor differently:

| Backend | Cursor encoding |
| --- | --- |
| json-joy | 4-byte big-endian integer (patch sequence number) |
| Y.js | Y.js state vector (`Y.encodeStateVector(doc)`) |
| Loro | Loro version vector (`doc.version().encode()`) |

The sync engine and all persistence providers treat the cursor as an opaque blob — they store and pass it without interpretation. This allows the persistence infrastructure to be reused across all backends without change.

---

## Migrating between Backends

Binary snapshots and CRDT patches are **not cross-compatible** between backends. To migrate existing data from one backend to another:

1. load your data with the **old** backend:

   ```typescript
   // Example: migrate from json-joy to Y.js
   import { SDS_DataStore as oldStore } from '@rozek/sds-core-jj'
   import { SDS_DataStore as newStore } from '@rozek/sds-core-yjs'
   
   const oldContents = oldStore.fromBinary(existingSnapshot)
   ```

2. export all entries as JSON:

   ```typescript
   const allEntries = oldContents.asJSON()
   ```

3. Create a fresh store with the **new** backend and import the JSON:

   ```typescript
   const newContents = newStore.fromJSON(allEntries)
   ```

4. re-persist the new store:

   ```typescript
   const newSnapshot = newContents.asBinary()
   // save newSnapshot with your persistence provider
   ```

**Important items:**

- the JSON export/import path preserves all Labels, Values, Info keys, MIME types, and the tree structure, but does **not** preserve CRDT history. Every peer receiving the migrated snapshot will see it as a single atomic origin — there is no incremental patch history to replay.
- if you run multiple peers, all peers must migrate simultaneously to the same backend. A json-joy peer and a Y.js peer cannot exchange patches.
- after migration, re-initialise your persistence store (clear old `patches` and `snapshots` rows and seed with the new binary snapshot).
- all `SDS_SyncCursor` values stored in the database are backend-specific and must be discarded on migration.

---

## Implementing a new Backend

You can add a new CRDT engine by creating a package that implements the same `SDS_DataStore` class surface. Here is what is required:

### Requirements for a new Backend

**Static Factory Methods**

```typescript
static fromScratch (Options?:SDS_DataStoreOptions):SDS_DataStore
static fromBinary (Data:Uint8Array, Options?:SDS_DataStoreOptions):SDS_DataStore
static fromJSON (Data:unknown, Options?:SDS_DataStoreOptions):SDS_DataStore
```

`fromScratch()` must create the three well-known entries (`RootItem`, `TrashItem`, `LostAndFoundItem`) with their fixed UUIDs and set `TrashItem` and `LostAndFoundItem` as children of `RootItem`. Two independent calls to `fromScratch()` on different peers must produce stores that can exchange patches and converge.

**Serialisation**

```typescript
asBinary ():Uint8Array
asJSON ():unknown
```

`asBinary()` returns a self-contained, gzip-compressed snapshot that `fromBinary()` can restore. `asJSON()` returns a plain-object representation that `fromJSON()` can restore (used for backend migration).

**Sync**

```typescript
get currentCursor ():SDS_SyncCursor
exportPatch (since?:SDS_SyncCursor):Uint8Array
applyRemotePatch (encodedPatch:Uint8Array):void
```

`exportPatch()` with no argument exports a full snapshot patch; with a cursor it exports only the operations added since that cursor. `applyRemotePatch()` merges a remote patch into the local document and fires change handlers with `Origin = 'external'`.

**Mutation Methods** — identical to `@rozek/sds-core-jj` (the reference implementation)

```typescript
newItemAt (MIMEType:string|undefined, outerItem:SDS_Item, InsertionIndex?:number):SDS_Item
newLinkAt (Target:SDS_Item, outerItem:SDS_Item, InsertionIndex?:number):SDS_Link
EntryWithId (Id:string): SDS_Entry | undefined
moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):void
deleteEntry (Entry:SDS_Entry):void
purgeEntry (Entry:SDS_Entry):void
deserializeItemInto (Data:unknown, Container:SDS_Item, InsertionIndex?:number):SDS_Item
deserializeLinkInto (Data:unknown, Container:SDS_Item, InsertionIndex?:number):SDS_Link
recoverOrphans ():void
transact (Callback:() => void):void
onChangeInvoke (Handler:ChangeHandler):() => void
```

**Properties**

```typescript
get RootItem ():SDS_Item
get TrashItem ():SDS_Item
get LostAndFoundItem ():SDS_Item
```

**Data Storage Constraints**

- store entries in a flat map keyed by UUID (no nested tree in the CRDT layer).
- each entry must expose at minimum: `Kind`, `outerItemId`, `OrderKey`, `Label`, `Info`, `MIMEType`, `ValueKind` and the appropriate value field.
- use `fractional-indexing` for `OrderKey` generation to maintain collaborative ordering.
- maintain in-memory `#ReverseIndex`, `#ForwardIndex`, `#LinkTargetIndex`, `#LinkForwardIndex`, and `#WrapperCache` for efficient traversal and incremental updates.
- re-use the `SDS_Entry`, `SDS_Item`, and `SDS_Link` classes from `@rozek/sds-core` (or copy and adapt them) — they delegate all CRDT operations back to the store via bracket-notation calls (`this._Store['_method']()`).

**Change Notifications**

- maintain a `#TransactDepth` counter. Increment it on entry, decrement on exit.
- collect a `SDS_ChangeSet` during the transaction.
- fire all registered `ChangeHandler`s exactly once when the outermost transaction completes.
- remote patches must fire handlers with `Origin = 'external'`; local mutations with `Origin = 'internal'`.

### Package Structure

Follow the same layout as `packages/core-jj`, `packages/core-yjs`, or `packages/core-loro`:

```
packages/core-<name>/
  package.json       ← name: @rozek/sds-core-<name>
  tsconfig.json      ← extends ../../tsconfig.base.json
  vite.config.ts
  src/
    sds-core-<name>.ts   ← entry point (re-export all public symbols)
    store/
      constants.ts
      SDS_DataStore.ts   ← full implementation
      SDS_Entry.ts       ← copied from core, local import
      SDS_Item.ts
      SDS_Link.ts
    error/SDS_Error.ts
    changeset/SDS_ChangeSet.ts
    changeset/SDS_EntryChangeSet.ts
    interfaces/SDS_PersistenceProvider.ts
    tests/
      SDS_Error.test.ts
      SDS_DataStore.construction.test.ts   ← backend-specific
      SDS_DataStore.creation.test.ts
      … (mirror the core test suite)
  TestPlan.md
  TestCases.md
  README.md
```

Add the new package to `pnpm-workspace.yaml` under the `packages:` list and add it as a workspace package to `package.json` if needed.

---

## Development

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm -r build

# Run all tests
pnpm -r test:run

# Type-check all packages
pnpm -r typecheck
```

---

## License

[MIT License](LICENSE.md) © Andreas Rozek