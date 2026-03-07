# @rozek/sns-core-loro

> Loro CRDT backend for [shareable-notes-store](https://github.com/rozek/shareable-notes-store)

This package provides a full implementation of the SNS_NoteStore public API
backed by [Loro](https://loro.dev/) — a high-performance Rust-based CRDT library
with native WebAssembly support.  It is a drop-in replacement for
`@rozek/sns-core` (the json-joy backend) and `@rozek/sns-core-yjs` (the Y.js
backend): application code needs only to change a single import path.

## Installation

```bash
pnpm add @rozek/sns-core-loro
# or: npm install @rozek/sns-core-loro
```

Peer dependency:

```bash
pnpm add @rozek/sns-core
```

## Quick Start

```typescript
import { SNS_NoteStore } from '@rozek/sns-core-loro'

const store = SNS_NoteStore.fromScratch()
const note = store.newNoteAt(store.RootNote)
note.Label = 'My first note'
console.log(note.Label)  // 'My first note'
```

## API

The public API is identical to `@rozek/sns-core`.  Please refer to the
[core package documentation](../core/README.md) for the complete reference.

The key difference for application code is the `currentCursor` type and the
persistence / sync encoding — see the backend-specific notes below.

## Loro-specific Behaviour

### No Canonical Empty Snapshot

Unlike the json-joy backend (`@rozek/sns-core`), the Loro backend does **not**
rely on a shared canonical empty snapshot to bootstrap CRDT node IDs.

`fromScratch()` creates the three well-known entries (Root, Trash,
LostAndFound) directly in the Loro document using fixed UUIDs and deterministic
`LoroMap` containers.  Two peers that each call `fromScratch()` independently
will converge to the same state after a single full-patch exchange, because
Loro's conflict-resolution algorithm is deterministic.

### Binary Encoding

`asBinary()` returns a gzip-compressed Loro snapshot
(`doc.export({ mode: 'snapshot' })`).  `fromBinary()` decompresses and imports
it via `doc.import()`.  This format is **not** compatible with the json-joy or
Y.js binary formats.

### Sync Cursor

`currentCursor` is a Loro version vector encoded as a `Uint8Array`
(`doc.version().encode()`).  It is **not** a 4-byte uint32 as used by the
json-joy backend.

`exportPatch(cursor?)` calls `doc.exportFrom(VersionVector.decode(cursor))`
when a cursor is supplied, or `doc.export({ mode: 'snapshot' })` for a full
export.

`applyRemotePatch(bytes)` calls `doc.import(bytes)` then rebuilds in-memory
indices.

### Collaborative Text Editing

`literalValue` and `Label` are stored as `LoroText` containers, enabling
character-level CRDT merging across peers.

### Binary Values

Binary note values (`writeValue(Uint8Array)`) are stored as plain `Uint8Array`
fields inside `LoroMap`, which Loro supports natively.

### Purge / Tombstoning

Because CRDT consistency requires that deleted data can always be re-merged
from remote peers, `purgeEntry()` uses **tombstoning** rather than map-key
deletion: the entry's `outerNoteId` is set to `''`, making it invisible to all
traversal, and the entry is removed from in-memory indices.  If the Loro
version in use supports `LoroMap.delete(key)`, that can be used instead
(commented in the source).

### Transaction Model

The Loro backend uses a `#TransactDepth` counter for nested transaction
support.  `doc.commit()` is called exactly once at the end of the outermost
transaction, batching all CRDT operations into a single changeset for both
local change-notification and CRDT history.

## Data Model

Inside the single `Loro` document, the complete note store lives in
`doc.getMap('Entries')` — a `LoroMap<string, LoroMap<any>>` mapping entry UUIDs
to their data.  Each entry map contains the following fields:

| Field | Type | Notes |
|-------|------|-------|
| `Kind` | `string` | `'note'` or `'link'` |
| `outerNoteId` | `string` | UUID of outer note; `''` for the root note |
| `OrderKey` | `string` | Fractional-indexing key |
| `Label` | `LoroText` | Collaborative string |
| `Info` | `LoroMap` | Arbitrary metadata |
| `MIMEType` | `string` | Notes only; `''` = `'text/plain'` |
| `ValueKind` | `string` | `'none'` / `'literal'` / `'binary'` / `*-reference` |
| `literalValue` | `LoroText` | Notes with `ValueKind='literal'` |
| `binaryValue` | `Uint8Array` | Notes with `ValueKind='binary'` |
| `ValueRef` | `string` (JSON) | Notes with `*-reference` ValueKinds |
| `TargetId` | `string` | Links only |

## Switching Backends

To switch from `@rozek/sns-core` (json-joy) to this package, change:

```typescript
// Before
import { SNS_NoteStore } from '@rozek/sns-core'

// After
import { SNS_NoteStore } from '@rozek/sns-core-loro'
```

Persisted binary data (`asBinary()` snapshots and `exportPatch()` patches) is
**not** cross-compatible between backends.  See the outer
[README.md](../../README.md) for a data migration guide.

## Building

```bash
pnpm build       # compile to dist/
pnpm dev         # watch mode
pnpm typecheck   # TypeScript check without emit
pnpm test:run    # run tests once
pnpm test        # run tests in watch mode
```

## License

MIT — see [LICENSE](../../LICENSE)
