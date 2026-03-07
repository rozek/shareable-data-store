# @rozek/sns-core-jj

The **json-joy CRDT backend** for [shareable-notes-store](../../README.md).
Provides `SNS_NoteStore`, `SNS_Note`, `SNS_Link`, `SNS_Entry`, and `SNS_Error`
backed by [json-joy](https://github.com/streamich/json-joy) JSON CRDT.

---

## When to use this package

Choose `@rozek/sns-core-jj` when:

- You want the mature, well-tested json-joy CRDT backend.
- You need the canonical-snapshot guarantee — every `fromScratch()` call starts from the same internal CRDT node-ID space, so cross-peer patches are always compatible even without prior snapshot exchange.
- You need json-joy-specific serialisation interoperability (the binary format is stable and gzip-compressed).

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sns-core-jj
# json-joy is a peer dependency:
pnpm add json-joy
```

---

## Concepts

### Store

`SNS_NoteStore` is a CRDT-based tree of notes built on json-joy. All mutations
are tracked as compact binary patches that can be exchanged with remote peers
and applied in any order without conflicts.

### Entries: Notes and Links

There are two kinds of entries in the tree:

- `SNS_Note` — a node that can carry a value (string or binary) and contain inner entries
- `SNS_Link` — a pointer entry that references another note; useful for aliases and cross-references

Every store starts with three well-known, non-deletable notes:

| Note | Role |
| --- | --- |
| `RootNote` | Root of the user-visible tree |
| `TrashNote` | Deleted entries are moved here |
| `LostAndFoundNote` | Orphaned entries (outer note purged by a remote peer) are rescued here |

### Values

A note's value is stored in one of four modes, selected automatically:

| Kind | When used | Storage |
| --- | --- | --- |
| `literal` | Short strings ≤ `LiteralSizeLimit` | Inline in the CRDT |
| `literal-reference` | Strings beyond the literal size limit | Hash reference + external blob |
| `binary` | Small `Uint8Array` ≤ 2 KB | Inline in the CRDT |
| `binary-reference` | Larger `Uint8Array` | Hash reference + external blob |

Literal values support collaborative character-level editing via `changeValue()`.

### ChangeSet

Every mutation (or batch of mutations in a `transact()` block) produces a
`SNS_ChangeSet` delivered to all registered handlers. The ChangeSet maps each
affected entry ID to the set of property keys that changed (`'Label'`,
`'Value'`, `'outerNote'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

## API Reference

### `SNS_NoteStore`

#### Construction

```typescript
SNS_NoteStore.fromScratch(Options?: SNS_NoteStoreOptions):SNS_NoteStore
SNS_NoteStore.fromBinary(Data:Uint8Array, Options?: SNS_NoteStoreOptions):SNS_NoteStore
SNS_NoteStore.fromJSON(Data:unknown, Options?: SNS_NoteStoreOptions):SNS_NoteStore
```

```typescript
interface SNS_NoteStoreOptions {
  LiteralSizeLimit?:     number  // max inline string length in UTF-16 code units (default 131 072)
  TrashTTLms?:           number  // ms after which a trashed entry is eligible for auto-purge (default: disabled)
  TrashCheckIntervalMs?: number  // how often the auto-purge timer fires (default: min(TrashTTLms/4, 3_600_000))
}
```

When `TrashTTLms` is set, `SNS_NoteStore` starts an internal `setInterval`
that calls `purgeExpiredTrashEntries()` at the configured interval. Call
`dispose()` to stop the timer when the store is no longer needed.

#### Well-known notes

```typescript
readonly RootNote:         SNS_Note
readonly TrashNote:        SNS_Note
readonly LostAndFoundNote:SNS_Note
```

#### Creating entries

```typescript
newNoteAt(
  Container:SNS_Note,
  InsertionIndex?: number    // position within Container.innerEntryList (appends if omitted)
):SNS_Note

newLinkAt(
  Target:SNS_Note,
  Container:SNS_Note,
  InsertionIndex?: number
):SNS_Link
```

#### Looking up entries

```typescript
EntryWithId(EntryId:string):SNS_Entry | undefined
```

#### Importing serialised entries

```typescript
deserializeNoteInto(Serialisation:unknown, Container:SNS_Note, InsertionIndex?: number):SNS_Note
deserializeLinkInto(Serialisation:unknown, Container:SNS_Note, InsertionIndex?: number):SNS_Link
```

#### Moving entries

```typescript
EntryMayBeMovedTo(Entry:SNS_Entry, Container:SNS_Note, InsertionIndex?: number):boolean
moveEntryTo(Entry:SNS_Entry, Container:SNS_Note, InsertionIndex?: number):void
```

Throws `SNS_Error('move-would-cycle')` if the move would create a cycle in the tree.

#### Deleting and purging entries

```typescript
EntryMayBeDeleted(Entry:SNS_Entry):boolean
deleteEntry(Entry:SNS_Entry):void  // moves to TrashNote; records _trashedAt in Info
purgeEntry(Entry:SNS_Entry):void   // permanently removes from Trash

// purges all direct TrashNote children whose _trashedAt exceeds TTLms;
// returns the count of entries actually removed
purgeExpiredTrashEntries(TTLms?: number):number

dispose():void  // stops the auto-purge timer (if TrashTTLms was configured)
```

`deleteEntry` records a `_trashedAt` timestamp (milliseconds since epoch) in
the entry's `Info` object. This field is stored in the CRDT and is therefore
synced to remote peers.

`purgeEntry` throws `SNS_Error('purge-protected')` when the entry (or any
descendant) is the target of a link reachable from `RootNote`; such entries
remain in `TrashNote`.

`purgeExpiredTrashEntries` skips entries that have no `_trashedAt` field
(e.g. moved to Trash via `moveEntryTo`) and silently skips protected entries
rather than throwing.

#### Transactions

```typescript
transact(Callback:() => void):void
```

Groups multiple mutations into a single CRDT operation and emits exactly one
ChangeSet event. Transactions may be nested, but inner ones have no extra
effect.

#### Events

```typescript
onChangeInvoke(
  Handler:(Origin:'internal' | 'external', ChangeSet:SNS_ChangeSet) => void
):() => void  // returns an unsubscribe function
```

`'internal'` — the mutation originated locally; `'external'` — it came from
`applyRemotePatch`.

#### Sync

```typescript
get currentCursor():SNS_SyncCursor          // cursor position after the latest local mutation
exportPatch(since?: SNS_SyncCursor):Uint8Array  // binary CRDT patch since a given cursor
applyRemotePatch(encodedPatch:Uint8Array):void
recoverOrphans():void  // rescue entries whose outer note no longer exists
```

#### Serialisation

```typescript
asBinary():Uint8Array  // gzip-compressed full snapshot
asJSON():unknown       // base64-encoded binary (JSON-safe)
```

---

### `SNS_Entry` (base class for SNS_Note and SNS_Link)

#### Identity

```typescript
readonly Id:string

get isRootNote:         boolean
get isTrashNote:        boolean
get isLostAndFoundNote:boolean
get isNote:             boolean
get isLink:             boolean
```

#### Hierarchy

```typescript
get outerNote:    SNS_Note | undefined
get outerNoteId:  string | undefined
get outerNotes:   SNS_Note[]    // ancestor chain, innermost first
get outerNoteIds:string[]
```

#### Label and metadata

```typescript
get Label:string
set Label(Value:string):void

get Info:Record<string, unknown>  // live proxy; assignments are CRDT mutations
```

#### Convenience methods

```typescript
mayBeMovedTo(Container:SNS_Note, InsertionIndex?: number):boolean
moveTo(Container:SNS_Note, InsertionIndex?: number):void

get mayBeDeleted:boolean
delete():void
purge():void

asJSON():unknown
```

---

### `SNS_Note` (extends SNS_Entry)

#### MIME type

```typescript
get Type:string
set Type(Value:string):void
```

#### Value

```typescript
get ValueKind:'none' | 'literal' | 'literal-reference' | 'binary' | 'binary-reference' | 'pending'
get isLiteral:boolean
get isBinary:  boolean

readValue():Promise<string | Uint8Array | undefined>
writeValue(Value:string | Uint8Array | undefined):void

// character-level collaborative edit on a 'literal' value
changeValue(fromIndex:number, toIndex:number, Replacement:string):void
```

Throws `SNS_Error('change-value-not-literal')` if `ValueKind !== 'literal'`.

#### Inner Notes and Links

```typescript
get innerEntryList:SNS_Entry[]
```

---

### `SNS_Link` (extends SNS_Entry)

```typescript
get Target:SNS_Note  // fixed at creation time
```

---

### `SNS_Error`

Re-exported from `@rozek/sns-core`.

```typescript
class SNS_Error extends Error {
  readonly Code:string
  constructor(Code:string, Message:string)
}
```

Common error codes: `'invalid-argument'`, `'move-would-cycle'`,
`'delete-not-permitted'`, `'purge-not-in-trash'`, `'purge-protected'`,
`'change-value-not-literal'`.

---

### Provider interfaces

Re-exported from `@rozek/sns-core`. See [`@rozek/sns-core` README](../core/README.md)
for the full interface definitions.

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-jj'

const store = SNS_NoteStore.fromScratch()

// subscribe to all changes
const unsubscribe = store.onChangeInvoke((Origin, ChangeSet) => {
  for (const [entryId, changedKeys] of Object.entries(ChangeSet)) {
    console.log(`[${Origin}] ${entryId}: ${[...changedKeys].join(', ')}`)
  }
})

// create notes
store.transact(() => {
  const journal = store.newNoteAt(store.RootNote)
  journal.Label = 'Journal'

  const entry = store.newNoteAt(journal)
  entry.Label = '2025-01-01'
  entry.Info['mood'] = 'hopeful'
})

unsubscribe()
```

### Syncing two stores via CRDT patches

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-jj'

// two peers start from the same snapshot
const storeA = SNS_NoteStore.fromScratch()
const storeB = SNS_NoteStore.fromBinary(storeA.asBinary())

// peer A makes a change
const note = storeA.newNoteAt(storeA.RootNote)
note.Label = 'shared note'

// peer A exports a patch and peer B applies it
const patch = storeA.exportPatch()
storeB.applyRemotePatch(patch)

// both peers now agree
const recovered = storeB.EntryWithId(note.Id)
console.log(recovered?.Label)  // 'shared note'
```

### Collaborative character editing

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-jj'

const store = SNS_NoteStore.fromScratch({ LiteralSizeLimit:65536 })
const note = store.newNoteAt(store.RootNote)

await note.writeValue('Hello, World!')

// replace characters 7-12 with 'SNS'
note.changeValue(7, 12, 'SNS')

console.log(await note.readValue())  // 'Hello, SNS!'
```

---

## json-joy-specific details

### Canonical empty snapshot

`SNS_NoteStore.fromScratch()` loads a pre-generated **canonical empty snapshot**
instead of building the CRDT document from scratch. This ensures all peers
start from the same internal json-joy node-ID space so that patches are always
compatible — even if the peers never exchanged a snapshot first.

The canonical snapshot is stored in
`packages/core-jj/src/store/canonical-empty-snapshot.ts` and must be
regenerated whenever the store schema or the json-joy version changes.

### Cursor format

The `SNS_SyncCursor` for the json-joy backend is a **4-byte big-endian
`uint32`** encoding the patch-log index. The persistence and network layers
treat it as an opaque `Uint8Array`.

### Patch encoding

Local patches are captured via json-joy's `Model.api.flush()` and assembled
into a length-prefixed multi-patch envelope by `encodePatches()` /
`decodePatches()` helpers inside `SNS_NoteStore`.

---

## Building

```bash
pnpm --filter @rozek/sns-core-jj build
```

Output is written to `packages/core-jj/dist/`.

---

## License

MIT © Andreas Rozek
