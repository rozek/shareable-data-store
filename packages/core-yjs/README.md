# @rozek/sns-core-yjs

The **Y.js CRDT backend** for [shareable-notes-store](../../README.md).

This package provides a full implementation of the `SNS_NoteStore` public API
backed by [Y.js](https://github.com/yjs/yjs) — a well-proven, production-ready
CRDT library used in many collaborative applications.

---

## When to use this package

Choose `@rozek/sns-core-yjs` when:

- You already use Y.js elsewhere in your stack and want a consistent CRDT model.
- You need character-level collaborative text editing on note values (`Y.Text`).
- You prefer Y.js's large ecosystem and tooling (y-websocket, y-indexeddb, …).
- You do **not** need to exchange data with stores built on the json-joy backend.

---

## Installation

```bash
pnpm add @rozek/sns-core-yjs
```

All runtime dependencies (`yjs`, `fflate`, `fractional-indexing`, `zod`) are
bundled in the package — no additional installs required.

---

## Usage

```typescript
import {
  SNS_NoteStore,
  SNS_Note, SNS_Link, SNS_Entry,
  SNS_Error,
} from '@rozek/sns-core-yjs'

// ── create a fresh store ────────────────────────────────────────────────────
const store = SNS_NoteStore.fromScratch()

// ── create notes and links ──────────────────────────────────────────────────
const note = store.newNoteAt(store.RootNote)
note.Label = 'Hello, Y.js!'
note.writeValue('This value is stored as a Y.Text for collaborative editing.')

const link = store.newLinkAt(note, store.RootNote)

// ── patch exchange (collaborative sync) ─────────────────────────────────────
const peer = SNS_NoteStore.fromScratch()
peer.applyRemotePatch(store.exportPatch())

// ── persist and restore ─────────────────────────────────────────────────────
const binary = store.asBinary()          // gzip-compressed Y.js snapshot
const restored = SNS_NoteStore.fromBinary(binary)
```

---

## Y.js-specific details

### No canonical snapshot

Unlike the json-joy backend, `fromScratch()` builds the document by creating
the three well-known notes (`Root`, `Trash`, `Lost & Found`) directly into a
fresh `Y.Doc` using their fixed UUIDs.  Two independent peers can exchange
patches immediately — Y.js CRDT semantics ensure deterministic conflict
resolution.

### Binary format

`asBinary()` encodes the document via `Y.encodeStateAsUpdate(doc)` and then
gzip-compresses the result.  `fromBinary()` decompresses and calls
`Y.applyUpdate(doc, bytes)`.  The format is **not** compatible with the
json-joy backend's binary format.

### Cursor format

`currentCursor` returns `Y.encodeStateVector(doc)` — a variable-length
`Uint8Array` encoding all seen logical clocks.  `exportPatch(cursor)` returns
`Y.encodeStateAsUpdate(doc, stateVector)` — exactly the delta since that cursor.

### Collaborative text editing

`literalValue` is stored as a `Y.Text` node inside each entry's `Y.Map`.
The `changeValue(fromIndex, toIndex, replacement)` method translates directly
to `Y.Text.delete` + `Y.Text.insert` operations, enabling true character-level
collaborative editing with automatic merge.

---

## Building

```bash
pnpm --filter @rozek/sns-core-yjs build
```

Output is written to `packages/core-yjs/dist/`.

---

## License

MIT © Andreas Rozek
