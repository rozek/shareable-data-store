# @rozek/sds-core-jj

The **json-joy CRDT backend** for [shareable-data-store](../../README.md). Provides `SDS_NoteStore`, `SDS_Note`, `SDS_Link`, `SDS_Entry`, and `SDS_Error`backed by [json-joy](https://github.com/streamich/json-joy) JSON CRDT.

---

## When to use this package

Choose `@rozek/sds-core-jj` when:

- You want the mature, well-tested json-joy CRDT backend.
- You need the canonical-snapshot guarantee — every `fromScratch()` call starts from the same internal CRDT node-ID space, so cross-peer patches are always compatible even without prior snapshot exchange.
- You need json-joy-specific serialisation interoperability (the binary format is stable and gzip-compressed).

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sds-core-jj
# json-joy is a peer dependency:
pnpm add json-joy
```

---

## Concepts

### Store

`SDS_NoteStore` is a CRDT-based tree of notes built on json-joy. All mutations are tracked as compact binary patches that can be exchanged with remote peers and applied in any order without conflicts.

### Entries: Notes and Links

There are two kinds of entries in the tree:

- `SDS_Note` — a node that can carry a value (string or binary) and contain inner entries
- `SDS_Link` — a pointer entry that references another note; useful for aliases and cross-references

Every store starts with three well-known, non-deletable notes:

| Note | Role |
| --- | --- |
| `RootNote` | Root of the user-visible tree |
| `TrashNote` | deleted entries are moved here |
| `LostAndFoundNote` | orphaned entries (outer note purged by a remote peer) are rescued here |

### Values

A note's value is stored in one of four modes, selected automatically:

| Kind | When used | Storage |
| --- | --- | --- |
| `literal` | short strings ≤ `LiteralSizeLimit` | inline in the CRDT |
| `literal-reference` | strings beyond the literal size limit | hash reference + external blob |
| `binary` | small `Uint8Array` ≤ 2 KB | inline in the CRDT |
| `binary-reference` | larger `Uint8Array` | hash reference + external blob |

Literal values support collaborative character-level editing via `changeValue()`.

### ChangeSet

Every mutation (or batch of mutations in a `transact()` block) produces a `SDS_ChangeSet` delivered to all registered handlers. The ChangeSet maps each affected entry ID to the set of property keys that changed (`'Label'`, `'Value'`, `'outerNote'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

## API Reference

### `SDS_NoteStore`

#### Construction

```typescript
SDS_NoteStore.fromScratch (Options?: SDS_NoteStoreOptions):SDS_NoteStore
SDS_NoteStore.fromBinary (Data:Uint8Array, Options?: SDS_NoteStoreOptions):SDS_NoteStore
SDS_NoteStore.fromJSON (Data:unknown, Options?:SDS_NoteStoreOptions):SDS_NoteStore
```

```typescript
interface SDS_NoteStoreOptions {
  LiteralSizeLimit?:     number  // max inline string length in UTF-16 code units (default 131_072)
  TrashTTLms?:           number  // ms after which a trashed entry is eligible for auto-purge (default: disabled)
  TrashCheckIntervalMs?: number  // how often the auto-purge timer fires (default: min(TrashTTLms/4, 3_600_000))
}
```

When `TrashTTLms` is set, `SDS_NoteStore` starts an internal `setInterval`that calls `purgeExpiredTrashEntries()` at the configured interval. Call `dispose()` to stop the timer when the store is no longer needed.

#### Well-known notes

```typescript
readonly RootNote:        SDS_Note
readonly TrashNote:       SDS_Note
readonly LostAndFoundNote:SDS_Note
```

#### Creating entries

```typescript
newNoteAt(
  Container:SDS_Note,
  InsertionIndex?: number    // position within Container.innerEntryList (appends if omitted)
):SDS_Note

newLinkAt(
  Target:SDS_Note,
  Container:SDS_Note,
  InsertionIndex?:number
):SDS_Link
```

#### Looking up entries

```typescript
EntryWithId (EntryId:string):SDS_Entry | undefined
```

#### Importing serialised entries

```typescript
deserializeNoteInto (Serialisation:unknown, Container:SDS_Note, InsertionIndex?: number):SDS_Note
deserializeLinkInto (Serialisation:unknown, Container:SDS_Note, InsertionIndex?: number):SDS_Link
```

#### Moving entries

```typescript
EntryMayBeMovedTo (Entry:SDS_Entry, Container:SDS_Note, InsertionIndex?: number):boolean
moveEntryTo (Entry:SDS_Entry, Container:SDS_Note, InsertionIndex?:number):void
```

Throws `SDS_Error('move-would-cycle')` if the move would create a cycle in the tree.

#### Deleting and purging entries

```typescript
EntryMayBeDeleted (Entry:SDS_Entry):boolean
deleteEntry (Entry:SDS_Entry):void  // moves to TrashNote; records _trashedAt in Info
purgeEntry (Entry:SDS_Entry):void   // permanently removes from Trash

// purges all direct TrashNote children whose _trashedAt exceeds TTLms;
// returns the count of entries actually removed
purgeExpiredTrashEntries (TTLms?: number):number

dispose ():void  // stops the auto-purge timer (if TrashTTLms was configured)
```

`deleteEntry` records a `_trashedAt` timestamp (milliseconds since epoch) in the entry's `Info` object. This field is stored in the CRDT and is therefore synced to remote peers.

`purgeEntry` throws `SDS_Error('purge-protected')` when the entry (or any descendant) is the target of a link reachable from `RootNote`; such entries remain in `TrashNote`.

`purgeExpiredTrashEntries` skips entries that have no `_trashedAt` field (e.g. moved to Trash via `moveEntryTo`) and silently skips protected entries rather than throwing.

#### Transactions

```typescript
transact (Callback:() => void):void
```

Groups multiple mutations into a single CRDT operation and emits exactly one ChangeSet event. Transactions may be nested, but inner ones have no extra effect.

#### Events

```typescript
onChangeInvoke(
  Handler:(Origin:'internal' | 'external', ChangeSet:SDS_ChangeSet) => void
):() => void  // returns an unsubscribe function
```

`'internal'` — the mutation originated locally; `'external'` — it came from `applyRemotePatch`.

#### Sync

```typescript
get currentCursor ():SDS_SyncCursor          // cursor position after the latest local mutation
exportPatch (since?: SDS_SyncCursor):Uint8Array  // binary CRDT patch since a given cursor
applyRemotePatch (encodedPatch:Uint8Array):void
recoverOrphans ():void  // rescue entries whose outer note no longer exists
```

#### Serialisation

```typescript
asBinary ():Uint8Array  // gzip-compressed full snapshot
asJSON ():unknown       // base64-encoded binary (JSON-safe)
```

---

### `SDS_Entry` (base class for SDS_Note and SDS_Link)

#### Identity

```typescript
readonly Id:string

get isRootNote:        boolean
get isTrashNote:       boolean
get isLostAndFoundNote:boolean
get isNote:            boolean
get isLink:            boolean
```

#### Hierarchy

```typescript
get outerNote:   SDS_Note | undefined
get outerNoteId: string | undefined
get outerNotes:  SDS_Note[]    // ancestor chain, innermost first
get outerNoteIds:string[]
```

#### Label and metadata

```typescript
get Label:string
set Label(Value:string):void

get Info:Record<string,unknown>  // live proxy; assignments are CRDT mutations
```

#### Convenience methods

```typescript
mayBeMovedTo (Container:SDS_Note, InsertionIndex?:number):boolean
moveTo (Container:SDS_Note, InsertionIndex?:number):void

get mayBeDeleted:boolean
delete ():void
purge ():void

asJSON ():unknown
```

---

### `SDS_Note` (extends SDS_Entry)

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

Throws `SDS_Error('change-value-not-literal')` if `ValueKind !== 'literal'`.

#### Inner Notes and Links

```typescript
get innerEntryList:SDS_Entry[]
```

---

### `SDS_Link` (extends SDS_Entry)

```typescript
get Target:SDS_Note  // fixed at creation time
```

---

### `SDS_Error`

Re-exported from `@rozek/sds-core`.

```typescript
class SDS_Error extends Error {
  readonly Code:string
  constructor (Code:string, Message:string)
}
```

Common error codes: `'invalid-argument'`, `'move-would-cycle'`, `'delete-not-permitted'`, `'purge-not-in-trash'`, `'purge-protected'`, `'change-value-not-literal'`.

---

### Provider interfaces

Re-exported from `@rozek/sds-core`. See `@rozek/sds-core`[ README](../core/README.md)for the full interface definitions.

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SDS_NoteStore } from '@rozek/sds-core-jj'

const NoteStore = SDS_NoteStore.fromScratch()

// subscribe to all changes
const unsubscribe = NoteStore.onChangeInvoke((Origin, ChangeSet) => {
  for (const [EntryId, changedKeys] of Object.entries(ChangeSet)) {
    console.log(`[${Origin}] ${EntryId}: ${[...changedKeys].join(', ')}`)
  }
})

// create notes
NoteStore.transact(() => {
  const Journal = NoteStore.newNoteAt(NoteStore.RootNote)
  Journal.Label = 'Journal'

  const Note = NoteStore.newNoteAt(Journal)
  Note.Label = '2025-01-01'
  Note.Info['mood'] = 'hopeful'
})

unsubscribe()
```

### Syncing two stores via CRDT patches

```typescript
import { SDS_NoteStore } from '@rozek/sds-core-jj'

// two peers start from the same snapshot
const NoteStoreA = SDS_NoteStore.fromScratch()
const NoteStoreB = SDS_NoteStore.fromBinary(NoteStoreA.asBinary())

// peer A makes a change
const NoteA = NoteStoreA.newNoteAt(NoteStoreA.RootNote)
NoteA.Label = 'shared note'

// peer A exports a patch and peer B applies it
const Patch = NoteStoreA.exportPatch()
NoteStoreB.applyRemotePatch(Patch)

// both peers now agree
const NoteB = NoteStoreB.EntryWithId(Note.Id)
console.log(NoteB?.Label)  // 'shared note'
```

### Collaborative character editing

```typescript
import { SDS_NoteStore } from '@rozek/sds-core-jj'

const NoteStore = SDS_NoteStore.fromScratch({ LiteralSizeLimit:65536 })
const Note = NoteStore.newNoteAt(NoteStore.RootNote)

Note.writeValue('Hello, World!')

// replace characters 7-12 with 'SNS'
Note.changeValue(7, 12, 'SNS')

console.log(await Note.readValue())  // 'Hello, SNS!'
```

---

## json-joy-specific details

### Canonical empty snapshot

`SDS_NoteStore.fromScratch()` loads a pre-generated **canonical empty snapshot**instead of building the CRDT document from scratch. This ensures all peers start from the same internal json-joy node-ID space so that patches are always compatible — even if the peers never exchanged a snapshot first.

The canonical snapshot is stored in `packages/core-jj/src/store/canonical-empty-snapshot.ts` and must be regenerated whenever the store schema or the json-joy version changes.

### Cursor format

The `SDS_SyncCursor` for the json-joy backend is a **4-byte big-endian** `uint32` encoding the patch-log index. The persistence and network layers treat it as an opaque `Uint8Array`.

### Patch encoding

Local patches are captured via json-joy's `Model.api.flush()` and assembled into a length-prefixed multi-patch envelope by `encodePatches()` / `decodePatches()` helpers inside `SDS_NoteStore`.

---

## Building

```bash
pnpm --filter @rozek/sds-core-jj build
```

Output is written to `packages/core-jj/dist/`.

---

## License

MIT © Andreas Rozek