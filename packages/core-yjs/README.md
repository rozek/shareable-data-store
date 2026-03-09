# @rozek/sns-core-yjs

The **Y.js CRDT backend** for [shareable-notes-store](../../README.md). Provides `SNS_NoteStore`, `SNS_Note`, `SNS_Link`, `SNS_Entry`, and `SNS_Error` backed by [Y.js](https://github.com/yjs/yjs) — a well-proven, production-ready CRDT library used in many collaborative applications. Drop-in replacement for `@rozek/sns-core-jj` and `@rozek/sns-core-loro`: only the import path changes.

---

## When to use this package

Choose `@rozek/sns-core-yjs` when:

- You already use Y.js elsewhere in your stack and want a consistent CRDT model.
- You need character-level collaborative text editing on note values (`Y.Text`).
- You prefer Y.js's large ecosystem and tooling (y-websocket, y-indexeddb, …).
- You do **not** need the canonical-snapshot guarantee of the json-joy backend.
- You do **not** need to exchange patches with stores built on the json-joy or Loro backends.

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sns-core-yjs
```

All runtime dependencies (`yjs`, `fflate`, `fractional-indexing`, `zod`) are bundled — no additional installs required.

---

## API

The public API is identical across all backends. Refer to the `@rozek/sns-core-jj`[ README](../core-jj/README.md) for the complete reference — `SNS_NoteStore`, `SNS_Note`, `SNS_Link`, `SNS_Entry`, and `SNS_Error` all export the same interface.

The only backend-specific aspects are the binary encoding, cursor format, and patch encoding — see [Y.js-specific details](#yjs-specific-details) below.

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-yjs'

const NoteStore = SNS_NoteStore.fromScratch()

const unsubscribe = NoteStore.onChangeInvoke((Origin, ChangeSet) => {
  for (const [EntryId, changedKeys] of Object.entries(ChangeSet)) {
    console.log(`[${Origin}] ${EntryId}: ${[...changedKeys].join(', ')}`)
  }
})

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
import { SNS_NoteStore } from '@rozek/sns-core-yjs'

// two peers start from the same snapshot
const NoteStoreA = SNS_NoteStore.fromScratch()
const NoteStoreB = SNS_NoteStore.fromBinary(NoteStoreA.asBinary())

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
import { SNS_NoteStore } from '@rozek/sns-core-yjs'

const NoteStore = SNS_NoteStore.fromScratch()
const Note = NoteStore.newNoteAt(NoteStore.RootNote)

Note.writeValue('Hello, World!')

// replace characters 7–12 with 'SNS'
Note.changeValue(7, 12, 'SNS')

console.log(await Note.readValue())  // 'Hello, SNS!'
```

---

## Y.js-specific details

### No canonical empty snapshot

Unlike the json-joy backend, `fromScratch()` builds the document by creating the three well-known notes (`Root`, `Trash`, `Lost & Found`) directly into a fresh `Y.Doc` using their fixed UUIDs. Two independent peers can exchange patches immediately — Y.js CRDT semantics ensure deterministic conflict resolution.

### Binary format

`asBinary()` encodes the document via `Y.encodeStateAsUpdate(doc)` and gzip-compresses the result. `fromBinary()` decompresses and calls `Y.applyUpdate(doc, bytes)`. This format is **not** compatible with the json-joy or Loro binary formats.

### Cursor format

`currentCursor` returns `Y.encodeStateVector(doc)` — a variable-length `Uint8Array` encoding all seen logical clocks. `exportPatch(cursor)` returns `Y.encodeStateAsUpdate(doc, stateVector)` — exactly the delta since that cursor.

### Collaborative text editing

`literalValue` is stored as a `Y.Text` node inside each entry's `Y.Map`. The `changeValue(fromIndex, toIndex, replacement)` method translates directly to `Y.Text.delete` + `Y.Text.insert` operations, enabling true character-level collaborative editing with automatic merge.

---

## Switching backends

To switch from `@rozek/sns-core-jj` (json-joy) to this package, change only the import path:

```typescript
// before
import { SNS_NoteStore } from '@rozek/sns-core-jj'

// after
import { SNS_NoteStore } from '@rozek/sns-core-yjs'
```

Persisted binary data (`asBinary()` snapshots and `exportPatch()` patches) is **not** cross-compatible between backends. See the [root README](../../README.md) for a data migration guide.

---

## Building

```bash
pnpm --filter @rozek/sns-core-yjs build
```

Output is written to `packages/core-yjs/dist/`.

---

## License

MIT © Andreas Rozek