# shareable-notes-store

A CRDT-based, offline-capable, real-time-syncable **tree-of-notes** library for Browser and Node.js.

Notes are organised in a hierarchy (with optional links between them), can carry arbitrary typed values (text, binary, large blobs), and synchronise across devices and users without conflicts — even when peers are offline for extended periods. The library is split into small, composable packages so you can use only what you need.

The CRDT engine is **pluggable**: choose from three ready-made backends or write your own: \[Y.js\](<https://yjs.dev/>), \[Loro CRDT\](<https://loro.dev/>) or \[JSON JOY\](<https://jsonjoy.com/>).

---

## Packages

### Shared types

| Package | Description |
| --- | --- |
| `@rozek/sns-core` | Backend-agnostic shared types: `SNS_Error`, `SNS_ChangeSet`, `SNS_Entry`/`Note`/`Link` base classes, the `SNS_NoteStore` contract interface, and all provider interfaces. No CRDT engine — the interface must be implemented by a backend. |

### CRDT backends (choose one)

| Package | CRDT engine | Notes |
| --- | --- | --- |
| `@rozek/sns-core-jj` | [json-joy](https://github.com/streamich/json-joy) 17.x | Reference backend; ships with a canonical empty snapshot |
| `@rozek/sns-core-yjs` | [Y.js](https://github.com/yjs/yjs) | No canonical snapshot; Y.js state-vector cursor |
| `@rozek/sns-core-loro` | [Loro](https://loro.dev/) | No canonical snapshot; Loro version-vector cursor; Rust/WASM |

All three backend packages expose an **identical public API**. Import from whichever backend suits your project; application code never calls any CRDT library directly.

### Infrastructure (backend-agnostic)

| Package | Description |
| --- | --- |
| `@rozek/sns-persistence-node` | SQLite persistence for Node.js and Electron |
| `@rozek/sns-persistence-browser` | IndexedDB persistence for browsers |
| `@rozek/sns-network-websocket` | WebSocket sync + presence provider |
| `@rozek/sns-network-webrtc` | WebRTC peer-to-peer sync + presence provider (browser) |
| `@rozek/sns-sync-engine` | orchestrates persistence, network, and presence |
| `@rozek/sns-websocket-server` | Hono-based relay server: JWT auth, signalling, token issuance |

---

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                       │
│                                                             │
│   SNS_NoteStore  ←── read/write ──►  SNS_SyncEngine         │
│   (any backend)                      │      │       │       │
│                               Persistence Network Presence  │
│                                 Provider Provider Provider  │
└─────────────────────────────────────────────────────────────┘
         ▲ CRDT patches                          │ WebSocket / WebRTC
         │                                       ▼
         └──────────────────── SNS WebSocket Server ◄── other peers
```

`SNS_NoteStore` is the source of truth. It holds a tree of notes and links stored as a conflict-free replicated data type (CRDT). `SNS_SyncEngine` wires it to any combination of:

- a **persistence provider** — saves snapshots and patches so the store survives restarts and works offline
- a **network provider** — exchanges CRDT patches with a relay server or other peers in real time
- a **presence provider** — shares user name, cursor position, and focus between peers without persisting them

All providers are optional and interchangeable. A browser PWA might use IndexedDB + WebSocket; an Electron app might use SQLite + WebRTC with WebSocket fallback.

---

## Quick start

### Choosing a backend

All backends offer the same API. Pick one and import from it:

```typescript
// Option A — json-joy (reference implementation)
import { SNS_NoteStore } from '@rozek/sns-core-jj'

// Option B — Y.js
import { SNS_NoteStore } from '@rozek/sns-core-yjs'

// Option C — Loro CRDT
import { SNS_NoteStore } from '@rozek/sns-core-loro'
```

The examples below use `@rozek/sns-core-jj` but work identically with any backend.

### Local-only — no network, no server

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-jj'

const Store = SNS_NoteStore.fromScratch()

const Note  = Store.newNoteAt(Store.RootNote)
Note.Label  = 'My first note'
Note.writeValue('Hello, world!')

// serialise to binary and restore later
const StoreSnapshot = Store.asBinary()
const restoredStore = SNS_NoteStore.fromBinary(Snapshot)
```

### Browser PWA — offline-first with WebSocket sync

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core-jj'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const Store       = SNS_NoteStore.fromScratch()
const Persistence = new SNS_BrowserPersistenceProvider('my-notes')
const Network     = new SNS_WebSocketProvider('my-notes')

const Engine = new SNS_SyncEngine(Store, {
  PersistenceProvider: Persistence,
  NetworkProvider:     Network,
  PresenceProvider:    Network,  // WebSocket provider doubles as presence provider
})

// restores persisted state before resolving
await Engine.start()

// connect to the relay server with a JWT
await Engine.connectTo('wss://my-server.example.com', { Token:'<jwt>' })

// write notes — the engine handles persistence and sync transparently
const Note = Store.newNoteAt(Store.RootNote)
Note.Label = 'Hello from the browser!'
```

### Node.js / Electron — SQLite persistence

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core-jj'
import { SNS_DesktopPersistenceProvider } from '@rozek/sns-persistence-node'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'

const Store       = SNS_NoteStore.fromScratch()
const Persistence = new SNS_DesktopPersistenceProvider('./data', 'my-notes')
const Network     = new SNS_WebSocketProvider('my-notes')

const Engine = new SNS_SyncEngine(Store, {
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
    EntryId: Note.Id,
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

### Running the relay server

```typescript
import { createSNSServer } from '@rozek/sns-websocket-server'
import { serve }           from '@hono/node-server'

const { app: App } = createSNSServer({ JWTSecret:'your-secret-at-least-32-chars' })

serve({ fetch:App.fetch, port:3000 }, () => {
  console.log('SNS relay server listening on port 3000')
})
```

---

## Note model

Every store starts with three well-known notes:

- **RootNote** — root of the user-visible tree
- **TrashNote** — deleted entries are moved here; can be permanently purged
- **LostAndFoundNote** — entries orphaned by a remote peer's purge are rescued here

Each note has:

- **Label** — plain-text title (collaborative, CRDT string)
- **Type** — MIME type string (`text/plain`, `text/markdown`, `image/png`, …)
- **Value** — string, `Uint8Array`, or a reference to a large blob (stored separately)
- **Info** — arbitrary key–value metadata map
- **innerEntryList** — ordered list of inner notes and links

Links are pointer entries: they live inside a container note and point to a target note elsewhere in the tree. They are useful for cross-references, shortcuts, and aliases.

---

## Requirements

### Functional requirements

**Note store**

- the store holds an ordered, arbitrarily deep tree of entries. Each entry is either a *note* or a *link*.
- a note carries a MIME type, a string or binary value (or no value at all), a plain-text label, and an arbitrary key–value metadata map (`Info`).
- a link is a named pointer to another note. It lives inside a container note but does not own its target.
- the tree always contains three non-deletable, non-movable well-known notes: `RootNote`, `TrashNote`, and `LostAndFoundNote`.
- entries can be created, labelled, moved, and soft-deleted (moved to `TrashNote`). Soft-deleted entries can be permanently purged.
- an entry that is still referenced by a link from the live tree (reachable from `RootNote`) is protected: a purge attempt throws `SNS_Error('purge-protected')`.
- notes in `TrashNote` are eligible for automatic permanent deletion after a configurable time-to-live (`TrashTTLms`). The timestamp is recorded in the entry's `Info._trashedAt` field (synced via CRDT) when the entry is moved to Trash via `deleteEntry`.
- after applying a remote patch, any entry whose declared outer note no longer exists is automatically rescued to `LostAndFoundNote`. Dangling links whose target no longer exists are recreated in `LostAndFoundNote` so the link remains valid.
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

- each sync-engine instance has a unique peer ID (UUID).
- presence state (user name, colour, focused entry, cursor position) is broadcast to all connected peers.
- remote peers that have not sent an update within the configured timeout (default 120 s) are automatically removed.
- presence state is not persisted — it is ephemeral.

**Networking**

- two transport providers are available out of the box: WebSocket (browser + Node.js) and WebRTC with WebSocket fallback (browser only).
- the server authenticates clients with HS256 JWTs and enforces `read` / `write` / `admin` scope per connection.
- the server exposes a WebRTC signalling endpoint and an admin API for token issuance.
- large value blobs are transferred as chunked binary frames independent of the CRDT patch stream.

### Non-functional requirements

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

### The store as seen by application code

From the application's perspective the store looks like a document-oriented tree:

```
RootNote
├── Note (text/plain)  — Label="Meeting notes", Value="…"
│   ├── Note (text/markdown)  — Label="Action items"
│   └── Link  ──────────────────────────────────────► Note (text/plain)  — Label="Alice's task"
├── Note (image/png)  — Label="Screenshot", Value=<binary blob ref>
└── TrashNote
    └── Note (text/plain)  — Label="Draft (deleted)"
```

The three well-known notes are always present and have fixed UUIDs:

| UUID | Role |
| --- | --- |
| `00000000-0000-4000-8000-000000000000` | `RootNote` |
| `00000000-0000-4000-8000-000000000001` | `TrashNote` |
| `00000000-0000-4000-8000-000000000002` | `LostAndFoundNote` |

### Store rules

The following invariants are maintained at all times:

1. **Acyclicity** — the outer-note chain of any entry must not form a cycle. `moveEntryTo` throws `SNS_Error('move-would-cycle')` if the target container is a descendant of the entry being moved.
2. **Root immobility** — `RootNote`, `TrashNote`, and `LostAndFoundNote` can never be moved or deleted.
3. **Trash-only purge** — `purgeEntry` only accepts direct inner entries of `TrashNote`. Deeper descendants must be moved to the trash root first.
4. **Link protection** — an entry (and its subtree) is *protected* if any entry within it is the target of a link that is reachable from `RootNote`. `purgeEntry` throws `SNS_Error('purge-protected')` for protected entries; `purgeExpiredTrashEntries` skips them silently.
5. **Trash TTL** — `deleteEntry` records a `_trashedAt` timestamp (ms since epoch) in the entry's `Info` object. `purgeExpiredTrashEntries(TTLms)` permanently removes all direct inner entries of `TrashNote` whose `_trashedAt` is older than `TTLms`. When `TrashTTLms` is passed to `SNS_NoteStore.fromScratch`, an internal timer fires at `TrashCheckIntervalMs` intervals automatically.
6. **Orphan rescue** — after applying a remote patch, any entry whose `outerNoteId` points to a non-existent entry is immediately moved to `LostAndFoundNote` by `recoverOrphans()`.
7. **Dangling-link rescue** — after applying a remote patch, any link whose `TargetId` points to a non-existent note causes that note to be recreated (empty) in `LostAndFoundNote`.
8. **Inner-entry ordering** — the `innerEntryList` of a note is always sorted by `OrderKey` (ascending), with the entry `Id` as a tie-breaker. Order is stable across concurrent insertions on different peers.

### Flat map layout

Internally the store uses a **flat** `Entries` map (keyed by UUID) rather than a nested tree structure. This is true for all backends. The entry's `outerNoteId` and `OrderKey` fields record its position in the tree. A move is a single field update; patches stay small regardless of tree depth.

### Fractional indexing for collaborative ordering

CRDT maps are inherently unordered. To give users a stable, collaboratively editable inner-entry order without conflicts, each entry records an `OrderKey` alongside its `outerNoteId`. `OrderKey` strings are generated by the `fractional-indexing` npm package.

The algorithm was originally developed by Evan Wallace at Figma and later published by the Rocicorp team. Just as there is always a rational number between any two distinct rationals, there is always a lexicographically ordered string between any two distinct strings. A key can always be generated between any two neighbours without modifying their keys; concurrent inserts at the same position produce different keys resolved by UUID as a tie-breaker.

### In-memory secondary indices

Because the CRDT only stores `outerNoteId` *inside the inner entry*, reconstructing the inner-entry list of a given note requires scanning all entries — O(n). The store maintains a `#ReverseIndex` (`Map<outerNoteId, Set<innerId>>`) and a `#LinkTargetIndex` (`Map<targetId, Set<linkId>>`) as in-memory secondary indices. Both are rebuilt from scratch once during construction and then kept in sync incrementally for every mutation.

Remote patches use a *forward-index diff*: companion maps `#ForwardIndex` and `#LinkForwardIndex` record the last-known placement of every entry. After a patch is applied, the store iterates the new view once and compares each entry's current placement against the forward index, touching only the buckets that actually changed.

---

## Backend-specific details

Each backend stores the same logical model in a different CRDT representation. Refer to the individual package READMEs for details:

- `packages/core-jj/README.md` — json-joy (canonical snapshot, 4-byte cursor)
- `packages/core-yjs/README.md` — Y.js (state-vector cursor, Y.Text)
- `packages/core-loro/README.md` — Loro CRDT (version-vector cursor, LoroText, Rust/WASM)

### The `SNS_SyncCursor` abstraction

The persistence interface uses an **opaque binary cursor** (`SNS_SyncCursor = Uint8Array`) instead of a raw integer clock. Each backend encodes the cursor differently:

| Backend | Cursor encoding |
| --- | --- |
| json-joy | 4-byte big-endian integer (patch sequence number) |
| Y.js | Y.js state vector (`Y.encodeStateVector(doc)`) |
| Loro | Loro version vector (`doc.version().encode()`) |

The sync engine and all persistence providers treat the cursor as an opaque blob — they store and pass it without interpretation. This allows the persistence infrastructure to be reused across all backends without change.

---

## Migrating between backends

Binary snapshots and CRDT patches are **not cross-compatible** between backends. To migrate existing data from one backend to another:

1. Load your data with the **old** backend:

   ```typescript
   // Example: migrate from json-joy to Y.js
   import { SNS_NoteStore as oldStore } from '@rozek/sns-core-jj'
   import { SNS_NoteStore as newStore } from '@rozek/sns-core-yjs'
   
   const oldContents = oldStore.fromBinary(existingSnapshot)
   ```

2. Export all entries as JSON:

   ```typescript
   const allEntries = oldContents.asJSON()
   ```

3. Create a fresh store with the **new** backend and import the JSON:

   ```typescript
   const newContents = newStore.fromJSON(allEntries)
   ```

4. Re-persist the new store:

   ```typescript
   const newSnapshot = newContents.asBinary()
   // save newSnapshot with your persistence provider
   ```

**Important notes:**

- The JSON export/import path preserves all Labels, Values, Info keys, MIME types, and the tree structure, but does **not** preserve CRDT history. Every peer receiving the migrated snapshot will see it as a single atomic origin — there is no incremental patch history to replay.
- If you run multiple peers, all peers must migrate simultaneously to the same backend. A json-joy peer and a Y.js peer cannot exchange patches.
- After migration, re-initialise your persistence store (clear old `patches` and `snapshots` rows and seed with the new binary snapshot).
- All `SNS_SyncCursor` values stored in the database are backend-specific and must be discarded on migration.

---

## Implementing a new backend

You can add a new CRDT engine by creating a package that implements the same `SNS_NoteStore` class surface. Here is what is required:

### Requirements for a new backend

**Static factory methods**

```typescript
static fromScratch (Options?:SNS_NoteStoreOptions):SNS_NoteStore
static fromBinary (Data:Uint8Array, Options?:SNS_NoteStoreOptions):SNS_NoteStore
static fromJSON (Data:unknown, Options?:SNS_NoteStoreOptions):SNS_NoteStore
```

`fromScratch()` must create the three well-known entries (`RootNote`, `TrashNote`, `LostAndFoundNote`) with their fixed UUIDs and set `TrashNote` and `LostAndFoundNote` as children of `RootNote`. Two independent calls to `fromScratch()` on different peers must produce stores that can exchange patches and converge.

**Serialisation**

```typescript
asBinary ():Uint8Array
asJSON ():unknown
```

`asBinary()` returns a self-contained, gzip-compressed snapshot that `fromBinary()` can restore. `asJSON()` returns a plain-object representation that `fromJSON()` can restore (used for backend migration).

**Sync**

```typescript
get currentCursor ():SNS_SyncCursor
exportPatch (since?:SNS_SyncCursor):Uint8Array
applyRemotePatch (encodedPatch:Uint8Array):void
```

`exportPatch()` with no argument exports a full snapshot patch; with a cursor it exports only the operations added since that cursor. `applyRemotePatch()` merges a remote patch into the local document and fires change handlers with `Origin = 'external'`.

**Mutation methods** — identical to `@rozek/sns-core-jj` (the reference implementation)

```typescript
newNoteAt (Container:SNS_Note, Index?:number):SNS_Note
newLinkAt (Container:SNS_Note, Target:SNS_Note, Index?:number):SNS_Link
EntryWithId (Id:string): SNS_Entry | undefined
moveEntryTo (Entry:SNS_Entry, Container:SNS_Note, Index?:number):void
deleteEntry (Entry:SNS_Entry):void
purgeEntry (Entry:SNS_Entry):void
deserializeNoteInto (Note:SNS_Note, Data:unknown):void
deserializeLinkInto (Link:SNS_Link, Data:unknown):void
recoverOrphans ():void
transact (Callback:() => void):void
onChangeInvoke (Handler:ChangeHandler):() => void
```

**Properties**

```typescript
get RootNote ():         SNS_Note
get TrashNote ():        SNS_Note
get LostAndFoundNote (): SNS_Note
```

**Data storage constraints**

- Store entries in a flat map keyed by UUID (no nested tree in the CRDT layer).
- Each entry must expose at minimum: `Kind`, `outerNoteId`, `OrderKey`, `Label`, `Info`, `MIMEType`, `ValueKind` and the appropriate value field.
- Use `fractional-indexing` for `OrderKey` generation to maintain collaborative ordering.
- Maintain in-memory `#ReverseIndex`, `#ForwardIndex`, `#LinkTargetIndex`, `#LinkForwardIndex`, and `#WrapperCache` for efficient traversal and incremental updates.
- Re-use the `SNS_Entry`, `SNS_Note`, and `SNS_Link` classes from `@rozek/sns-core` (or copy and adapt them) — they delegate all CRDT operations back to the store via bracket-notation calls (`this._Store['_method']()`).

**Change notifications**

- Maintain a `#TransactDepth` counter. Increment it on entry, decrement on exit.
- Collect a `SNS_ChangeSet` during the transaction.
- Fire all registered `ChangeHandler`s exactly once when the outermost transaction completes.
- Remote patches must fire handlers with `Origin = 'external'`; local mutations with `Origin = 'internal'`.

### Package structure

Follow the same layout as `packages/core-jj`, `packages/core-yjs`, or `packages/core-loro`:

```
packages/core-<name>/
  package.json       ← name: @rozek/sns-core-<name>
  tsconfig.json      ← extends ../../tsconfig.base.json
  vite.config.ts
  src/
    sns-core-<name>.ts   ← entry point (re-export all public symbols)
    store/
      constants.ts
      SNS_NoteStore.ts   ← full implementation
      SNS_Entry.ts       ← copied from core, local import
      SNS_Note.ts
      SNS_Link.ts
    error/SNS_Error.ts
    changeset/SNS_ChangeSet.ts
    changeset/SNS_EntryChangeSet.ts
    interfaces/SNS_PersistenceProvider.ts
    tests/
      SNS_Error.test.ts
      SNS_NoteStore.construction.test.ts   ← backend-specific
      SNS_NoteStore.creation.test.ts
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