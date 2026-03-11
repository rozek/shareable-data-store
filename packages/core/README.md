# @rozek/sds-core

Backend-agnostic shared types, base classes, and data-model documentation for the **shareable-data-store** (SDS) family.

This package contains everything that is common to **all** SDS CRDT backends: the base entry classes, the error class, the change-set types, and the provider interfaces. It does **not** contain any CRDT implementation — use one of the backend packages for that:

| Backend | Package |
| --- | --- |
| json-joy | `@rozek/sds-core-jj` |
| Y.js | `@rozek/sds-core-yjs` |
| Loro | `@rozek/sds-core-loro` |

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22+** | required when using this package in a Node.js project or build toolchain. Download from [nodejs.org](https://nodejs.org). |
| **Modern browser** | required when using this package in a web application. Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |

This package is isomorphic — it contains no native code, no WebAssembly, and no browser-specific APIs.

---

## Installation

```bash
pnpm add @rozek/sds-core
```

Application code typically depends on a backend package directly and does not need to add `@rozek/sds-core` explicitly — it is a peer dependency of all backend packages.

---

## Concepts

### Store

`SDS_DataStore` is a CRDT-based tree of items. All mutations are tracked as compact binary patches that can be exchanged with remote peers and applied in any order without conflicts.

### Entries: items and links

There are two kinds of entries in the tree:

- `SDS_Item` — a node that can carry a value (string or binary) and contain inner entries
- `SDS_Link` — a pointer entry that references another item; useful for aliases and cross-references

Every store starts with three well-known, non-deletable items:

| Item | Role |
| --- | --- |
| `RootItem` | Root of the user-visible tree |
| `TrashItem` | Deleted entries are moved here |
| `LostAndFoundItem` | Orphaned entries (outer item purged by a remote peer) are rescued here |

### Values

An item's value is stored in one of four modes, selected automatically:

| Kind | When used | Storage |
| --- | --- | --- |
| `literal` | short strings ≤ `LiteralSizeLimit` | inline in the CRDT |
| `literal-reference` | strings beyond the literal size limit | hash reference + external blob |
| `binary` | small `Uint8Array` ≤ 2 KB | inline in the CRDT |
| `binary-reference` | larger `Uint8Array` | hash reference + external blob |

Literal values support collaborative character-level editing via `changeValue()`.

### ChangeSet

Every mutation (or batch of mutations in a `transact()` block) produces a `SDS_ChangeSet` delivered to all registered handlers. The ChangeSet maps each affected entry Id to the set of property keys that changed (`'Label'`, `'Value'`, `'outerItem'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

## API reference

### `SDS_DataStore`

#### Construction

```typescript
SDS_DataStore.fromScratch (Options?: SDS_DataStoreOptions):SDS_DataStore
SDS_DataStore.fromBinary (Data:Uint8Array, Options?:SDS_DataStoreOptions):SDS_DataStore
SDS_DataStore.fromJSON (Data:unknown, Options?:SDS_DataStoreOptions):SDS_DataStore
```

`fromScratch` creates a new, empty store pre-populated with `RootItem`, `TrashItem`, and `LostAndFoundItem`. `fromBinary` restores a store from a gzip-compressed snapshot (as produced by `store.asBinary()`). `fromJSON` restores a store from a plain JSON object or a JSON string (as produced by `store.asJSON()`).

```typescript
interface SDS_DataStoreOptions {
  LiteralSizeLimit?:number      // max inline string length in UTF-16 code units (default 131_072)
  TrashTTLms?:number            // ms after which a trashed entry is eligible for auto-purge (default: 30 days = 2_592_000_000; set to 0 to disable)
  TrashCheckIntervalMs?: number // how often the auto-purge timer fires (default: min(TrashTTLms/4, 3_600_000))
}
```

Unless `TrashTTLms` is explicitly set to `0`, `SDS_DataStore` starts an internal `setInterval` that calls `purgeExpiredTrashEntries()` at the configured interval. Call `dispose()` to stop the timer when the store is no longer needed.

#### Well-known items

```typescript
readonly RootItem:SDS_Item
readonly TrashItem:SDS_Item
readonly LostAndFoundItem:SDS_Item
```

#### Creating entries

```typescript
newItemAt (
  MIMEType:string | undefined, // MIME type (default 'text/plain')
  outerItem:SDS_Item,
  InsertionIndex?:number       // position within outerItem.innerEntryList (appends if omitted)
):SDS_Item

newLinkAt (
  Target:SDS_Item,
  outerItem:SDS_Item,
  InsertionIndex?:number
):SDS_Link
```

#### Looking up entries

```typescript
EntryWithId (EntryId:string):SDS_Entry | undefined
```

#### Importing serialised entries

```typescript
deserializeItemInto (Data:unknown, outerItem:SDS_Item, InsertionIndex?:number):SDS_Item
deserializeLinkInto (Data:unknown, outerItem:SDS_Item, InsertionIndex?:number):SDS_Link

newEntryFromBinaryAt (Data:Uint8Array, outerItem:SDS_Item, InsertionIndex?:number):SDS_Entry
newEntryFromJSONat   (Data:unknown,    outerItem:SDS_Item, InsertionIndex?:number):SDS_Entry
```

`newEntryFromBinaryAt` accepts a gzip-compressed binary snapshot (as produced by `entry.asBinary()`); `newEntryFromJSONat` accepts a plain JSON object (as produced by `entry.asJSON()`). Both methods reconstruct the full entry subtree (including all inner entries) and insert it into `outerItem` at the given position. Unlike `deserializeItemInto`/`deserializeLinkInto`, they automatically detect whether the root is an item or a link.

#### Moving entries

```typescript
EntryMayBeMovedTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):boolean
moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):void
```

Throws `SDS_Error('move-would-cycle')` if the move would create a cycle in the tree.

#### Rebalancing order keys

```typescript
rebalanceInnerEntriesOf (item:SDS_Item):void
```

Reassigns fresh, evenly-spaced fractional-indexing keys to all direct inner entries of `item`. This is called **automatically** whenever a new `OrderKey` would exceed 200 characters, so manual calls are only needed as a proactive measure before predictably degenerate bulk operations (see [Order keys](#order-keys) below).

#### Deleting and purging entries

```typescript
EntryMayBeDeleted (Entry:SDS_Entry):boolean
deleteEntry (Entry:SDS_Entry):void  // moves to TrashItem; records _trashedAt in Info
purgeEntry (Entry:SDS_Entry):void   // permanently removes from Trash

// purges all direct TrashItem children whose _trashedAt exceeds TTLms;
// returns the count of entries actually removed
purgeExpiredTrashEntries (TTLms?: number):number

dispose ():void  // stops the auto-purge timer (if TrashTTLms was configured)
```

`deleteEntry` records a `_trashedAt` timestamp (milliseconds since epoch) in the entry's `Info` object. This field is stored in the CRDT and is therefore synced to remote peers.

`purgeEntry` throws `SDS_Error('purge-protected')` when the entry (or any descendant) is the target of a link reachable from `RootItem`; such entries remain in `TrashItem`.

`purgeExpiredTrashEntries` skips entries that have no `_trashedAt` field (e.g. moved to Trash via `moveEntryTo`) and silently skips protected entries rather than throwing.

#### Transactions

```typescript
transact (Callback:() => void):void
```

Groups multiple mutations into a single CRDT operation and emits exactly one ChangeSet event. Transactions may be nested, but inner ones have no extra effect.

> **No rollback:** If the callback throws, any CRDT mutations already applied within the transaction are **not** rolled back. Guard against partial writes with explicit precondition checks before mutating.

#### Events

```typescript
onChangeInvoke (
  Handler:(Origin:'internal' | 'external', ChangeSet:SDS_ChangeSet) => void
):() => void  // returns an unsubscribe function
```

`'internal'` — the mutation originated locally; `'external'` — it came from `applyRemotePatch`.

#### Sync

```typescript
get currentCursor ():SDS_SyncCursor              // cursor position after the latest local mutation
exportPatch (since?: SDS_SyncCursor):Uint8Array  // binary CRDT patch since a given cursor
applyRemotePatch (encodedPatch:Uint8Array):void
recoverOrphans ():void  // rescue entries whose outer item no longer exists
```

> **Backend compatibility:** `SDS_SyncCursor` values and `exportPatch` payloads are opaque binary blobs whose format is specific to the backend (YJS, LORO, or JJ). Cursors and patches produced by one backend must **never** be passed to a store using a different backend.

#### Serialisation

```typescript
asBinary ():Uint8Array  // gzip-compressed full snapshot
asJSON ():unknown       // full snapshot as a plain JSON object (binary values are base64-encoded)
```

---

### `SDS_Entry` (base class for `SDS_Item` and `SDS_Link`)

#### Identity

```typescript
readonly Id:string

get isRootItem:boolean
get isTrashItem:boolean
get isLostAndFoundItem:boolean
get isItem:boolean
get isLink:boolean
```

#### Hierarchy

```typescript
get outerItem:SDS_Item | undefined  // direct container
get outerItemId:string | undefined
get outerItemChain:SDS_Item[]       // ancestor chain, innermost first
get outerItemIds:string[]
```

#### Label and metadata

```typescript
get Label:string
set Label(Value:string):void

get Info:Record<string,unknown>  // live proxy; assignments are CRDT mutations
```

#### Convenience methods

```typescript
mayBeMovedTo (outerItem:SDS_Item, InsertionIndex?:number):boolean
moveTo (outerItem:SDS_Item, InsertionIndex?:number):void

get mayBeDeleted:boolean
delete ():void
purge ():void

asBinary ():Uint8Array  // serialises this entry subtree as a gzip-compressed binary snapshot
asJSON ():unknown        // serialises this entry subtree as a plain JSON object
```

---

### `SDS_Item` (extends `SDS_Entry`)

#### MIME type

```typescript
get Type:string
set Type(Value:string):void
```

#### Value

```typescript
get ValueKind:'none' | 'literal' | 'literal-reference' | 'binary' | 'binary-reference' | 'pending'
get isLiteral:boolean
get isBinary: boolean

readValue ():Promise<string | Uint8Array | undefined>
writeValue (Value:string | Uint8Array | undefined):void

// character-level collaborative edit on a 'literal' value
changeValue (fromIndex:number, toIndex:number, Replacement:string):void
```

`readValue` resolves immediately when the value is stored inline (`ValueKind` is `'literal'` or `'binary'`). For reference kinds (`'literal-reference'`, `'binary-reference'`) it fetches the payload from the configured `ValueStore` and resolves asynchronously. There is no synchronous alternative. Returns `undefined` when `ValueKind` is `'none'` or `'pending'`.

Throws `SDS_Error('change-value-not-literal')` if `ValueKind !== 'literal'`.

#### Inner entries

```typescript
get innerEntryList:SDS_Entry[]
```

---

### `SDS_Link` (extends `SDS_Entry`)

A link is a pointer entry that references another item. It is useful for aliases, cross-references, and many-to-one relationships — for example, tagging an item that lives in one part of the tree from multiple other locations.

```typescript
get Target:SDS_Item  // fixed at creation time; cannot be changed after creation
```

A link's target is **immutable** — once created, `Target` never changes. Deleting a link does not affect the target item. If a link reachable from `RootItem` points at an item that is in `TrashItem`, `purgeEntry` on that item will throw `SDS_Error('purge-protected')` until the link itself is deleted first.

---

## Exported types

### `SDS_Error`

```typescript
class SDS_Error extends Error {
  readonly code:string
  constructor (Code:string, Message:string)
}
```

Thrown by all SDS packages on invalid arguments or invalid state.

Common error codes: `'invalid-argument'`, `'move-would-cycle'`, `'delete-not-permitted'`, `'purge-not-in-trash'`, `'purge-protected'`, `'change-value-not-literal'`, `'not-implemented'`.

---

### `SDS_ChangeSet` / `SDS_EntryChangeSet`

```typescript
type SDS_EntryChangeSet = Set<string>
type SDS_ChangeSet = Record<string,SDS_EntryChangeSet>
```

Delivered to `onChangeInvoke` handlers after every mutation. The ChangeSet maps each affected entry Id to the set of property keys that changed (`'Label'`, `'Value'`, `'outerItem'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

### `SDS_SyncCursor` / `SDS_PatchSeqNumber`

```typescript
type SDS_SyncCursor = Uint8Array // opaque; format is backend-specific
type SDS_PatchSeqNumber = number // maintained by SDS_SyncEngine
```

---

### Provider interfaces

These interfaces are implemented by the infrastructure packages and consumed by `SDS_SyncEngine`.

#### `SDS_PersistenceProvider`

```typescript
interface SDS_PersistenceProvider {
  loadSnapshot ():Promise<Uint8Array | null>
  saveSnapshot (Data:Uint8Array):Promise<void>

  loadPatchesSince (SeqNumber:SDS_PatchSeqNumber):Promise<Uint8Array[]>
  appendPatch (Patch:Uint8Array, SeqNumber:SDS_PatchSeqNumber):Promise<void>
  prunePatches (beforeSeqNumber:SDS_PatchSeqNumber):Promise<void>

  loadValue (ValueHash:string):Promise<Uint8Array | null>
  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue (ValueHash:string):Promise<void>

  close ():Promise<void>
}
```

Implemented by `@rozek/sds-persistence-browser` (IndexedDB) and `@rozek/sds-persistence-node` (SQLite).

#### `SDS_NetworkProvider`

```typescript
type SDS_ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

interface SDS_ConnectionOptions {
  Token:string             // JWT
  reconnectDelayMs?:number // auto-reconnect backoff in ms (default 2000)
}

interface SDS_NetworkProvider {
  readonly StoreId:string
  readonly ConnectionState:SDS_ConnectionState

  connect (URL:string, Options:SDS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void
}
```

Implemented by `@rozek/sds-network-websocket` and `@rozek/sds-network-webrtc`.

#### `SDS_PresenceProvider`

```typescript
interface SDS_LocalPresenceState {
  PeerId?:string   // injected by the engine; not set by the user
  UserName?:string
  UserColor?:string
  UserFocus?: {
    EntryId:string
    Property:'Value' | 'Label' | 'Info'
    Cursor?:{ from:number; to:number }
  }
  custom?:unknown  // arbitrary JSON-serialisable application data
}

interface SDS_RemotePresenceState extends SDS_LocalPresenceState {
  PeerId:string   // always present for remote peers
  lastSeen:number // Date.now() timestamp of last received update
}

interface SDS_PresenceProvider {
  sendLocalState (State:SDS_LocalPresenceState):void
  onRemoteState (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | null) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string,SDS_RemotePresenceState>
}
```

Usually implemented by the same class as `SDS_NetworkProvider` (`@rozek/sds-network-websocket` and `@rozek/sds-network-webrtc` both implement both interfaces).

---

## Validation limits

All three backends enforce the same hard limits on user-supplied strings and metadata. Exceeding any limit throws `SDS_Error('invalid-argument')` with a descriptive message that includes the actual length and the limit.

| Field | Constant | Default | Checked in |
|---|---|---|---|
| `Label` | `maxLabelLength` | 1 024 chars | `entry.Label = …` |
| `MIMEType` | `maxMIMETypeLength` | 256 chars | `item.Type = …`, `newItemAt(…, mimeType)` |
| `Info` key | `maxInfoKeyLength` | 1 024 chars | `entry.Info['key'] = …` |
| `Info` value | `maxInfoValueSize` | 1 048 576 bytes (UTF-8 JSON) | `entry.Info['key'] = …` |

Info values must also be JSON-serialisable; functions, symbols, and circular references are rejected.

All four constants are exported from `@rozek/sds-core` so that application code can display the limits to users without hard-coding them.

---

## Order keys

Entries within a container are sorted by a string called `OrderKey`, generated by the [fractional-indexing](https://github.com/rocicorp/fractional-indexing) algorithm. These keys grow in length each time a new entry is inserted between two neighbours that already have adjacent keys. Under normal usage (appending, prepending, or occasional reordering) keys remain short. With repeated insertions at the same gap the keys can grow arbitrarily long.

### Automatic rebalancing

All three backends automatically trigger `rebalanceInnerEntriesOf` inside the same transaction whenever a newly generated `OrderKey` would exceed **200 characters**. Under normal usage this threshold is never reached, so the auto-trigger adds no overhead. In degenerate patterns (e.g. always inserting at position 0 in a large container), the rebalancing fires once and then the keys are short again for the next batch of operations.

### Manual rebalancing

Call `rebalanceInnerEntriesOf` explicitly as a proactive measure before bulk operations where you know the same gap will be used many times in a row:

```typescript
Store.rebalanceInnerEntriesOf(targetItem)
for (const record of largeImport) {
  Store.newItemAt('application/json', targetItem, 0)  // always inserts at position 0
}
```

### CRDT safety

`rebalanceInnerEntriesOf` is a normal CRDT mutation — it updates the `OrderKey` field of every direct inner entry in a single transaction that syncs to all peers. There is one caveat: if a remote peer inserts an entry at a gap that is being rebalanced concurrently, the new entry may land in a slightly different relative position than intended. No data is lost and all peers converge to the same order; the only effect is a potential one-time positional surprise during the brief window of concurrent activity.

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek