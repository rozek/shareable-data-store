# @rozek/sds-core-loro

The **Loro CRDT backend** for [shareable-data-store](../../README.md). Provides `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, and `SDS_Error` backed by [Loro](https://loro.dev/) — a high-performance Rust-based CRDT library with native WebAssembly support. Drop-in replacement for `@rozek/sds-core-jj` and `@rozek/sds-core-yjs`: only the import path changes.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22+** | required when using this package in a Node.js project or build toolchain. Download from [nodejs.org](https://nodejs.org). |
| **Modern browser** | requires WebAssembly support. Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |

This package is isomorphic. The Loro CRDT engine (`loro-crdt`) ships as a WebAssembly module and is bundled as a direct dependency — no separate install required.

---

## When to use this package

Choose `@rozek/sds-core-loro` when:

- You want a high-performance, memory-efficient CRDT backend powered by Rust and WebAssembly.
- You need character-level collaborative text editing via Loro's native `LoroText` containers.
- You do not require the canonical-snapshot guarantee of the json-joy backend (see [Loro-specific details](#loro-specific-details)).
- You do not need cross-backend patch compatibility with the json-joy or Y.js binary formats.

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sds-core-loro
```

Peer dependency:

```bash
pnpm add @rozek/sds-core
```

---

## API

The public API — `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, `SDS_Error`, and all provider interfaces — is identical across all backends and is fully documented in the [`@rozek/sds-core` README](../core/README.md).

The only backend-specific aspects are the binary encoding, cursor format, and patch encoding — see [Loro-specific details](#loro-specific-details) below.

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SDS_DataStore } from '@rozek/sds-core-loro'

const DataStore = SDS_DataStore.fromScratch()

const unsubscribe = DataStore.onChangeInvoke((Origin, ChangeSet) => {
  for (const [EntryId, changedKeys] of Object.entries(ChangeSet)) {
    console.log(`[${Origin}] ${EntryId}: ${[...changedKeys].join(', ')}`)
  }
})

DataStore.transact(() => {
  const Journal = DataStore.newItemAt(undefined, DataStore.RootItem)
  Journal.Label = 'Journal'

  const Data = DataStore.newItemAt(undefined, Journal)
  Data.Label = '2025-01-01'
  Data.Info['mood'] = 'hopeful'
})

unsubscribe()
```

### Syncing two stores via CRDT patches

```typescript
import { SDS_DataStore } from '@rozek/sds-core-loro'

// two peers start from the same snapshot
const DataStoreA = SDS_DataStore.fromScratch()
const DataStoreB = SDS_DataStore.fromBinary(DataStoreA.asBinary())

// peer A makes a change
const ItemA = DataStoreA.newItemAt(undefined, DataStoreA.RootItem)
ItemA.Label = 'shared data'

// peer A exports a patch and peer B applies it
const Patch = DataStoreA.exportPatch()
DataStoreB.applyRemotePatch(Patch)

// both peers now agree
const ItemB = DataStoreB.EntryWithId(ItemA.Id)
console.log(ItemB?.Label)  // 'shared data'
```

### Collaborative character editing

```typescript
import { SDS_DataStore } from '@rozek/sds-core-loro'

const DataStore = SDS_DataStore.fromScratch()
const Data = DataStore.newItemAt(undefined, DataStore.RootItem)

Data.writeValue('Hello, World!')

// replace characters 7–12 with 'SDS'
Data.changeValue(7, 12, 'SDS')

console.log(await Data.readValue())  // 'Hello, SDS!'
```

---

## Loro-specific details

### No canonical empty snapshot

Unlike the json-joy backend (`@rozek/sds-core-jj`), the Loro backend does **not** rely on a shared canonical empty snapshot to bootstrap CRDT node IDs.

`fromScratch()` creates the three well-known entries (Root, Trash, LostAndFound) directly in the Loro document using fixed UUIDs and deterministic `LoroMap` containers. Two peers that each call `fromScratch()` independently will converge to the same state after a single full-patch exchange, because Loro's conflict-resolution algorithm is deterministic.

### Binary encoding

`asBinary()` returns a gzip-compressed Loro snapshot (`doc.export({ mode: 'snapshot' })`). `fromBinary()` decompresses and imports it via `doc.import()`. This format is **not** compatible with the json-joy or Y.js binary formats.

### Cursor format

`currentCursor` is a Loro version vector encoded as a `Uint8Array` (`doc.version().encode()`). It is **not** a 4-byte `uint32` as used by the json-joy backend.

`exportPatch(cursor?)` calls `doc.exportFrom(VersionVector.decode(cursor))` when a cursor is supplied, or `doc.export({ mode: 'snapshot' })` for a full export.

`applyRemotePatch(bytes)` calls `doc.import(bytes)` then rebuilds in-memory indices.

### Collaborative text editing

`literalValue` and `Label` are stored as `LoroText` containers, enabling character-level CRDT merging across peers.

### Binary values

Binary data values (`writeValue(Uint8Array)`) are stored as plain `Uint8Array` fields inside `LoroMap`, which Loro supports natively.

### Purge / tombstoning

Because CRDT consistency requires that deleted data can always be re-merged from remote peers, `purgeEntry()` uses **tombstoning** rather than map-key deletion: the entry's `outerItemId` is set to `''`, making it invisible to all traversal, and the entry is removed from in-memory indices.

### Transaction model

The Loro backend uses a `#TransactDepth` counter for nested transaction support. `doc.commit()` is called exactly once at the end of the outermost transaction, batching all CRDT operations into a single changeset for both local change-notification and CRDT history.

---

## Data model

Inside the single `Loro` document, the complete data store lives in `doc.getMap('Entries')` — a `LoroMap<string, LoroMap<any>>` mapping entry UUIDs to their data:

| field | type | description |
| --- | --- | --- |
| `Kind` | `string` | `'item'` or `'link'` |
| `outerItemId` | `string` | UUID of outer data; `''` for the root data |
| `OrderKey` | `string` | fractional-indexing key |
| `Label` | `LoroText` | collaborative string |
| `Info` | `LoroMap` | arbitrary metadata |
| `MIMEType` | `string` | items only; `''` = `'text/plain'` |
| `ValueKind` | `string` | `'none'` / `'literal'` / `'binary'` / `*-reference` |
| `literalValue` | `LoroText` | items with `ValueKind='literal'` |
| `binaryValue` | `Uint8Array` | items with `ValueKind='binary'` |
| `ValueRef` | `string` (JSON) | items with `*-reference` ValueKinds |
| `TargetId` | `string` | links only |

---

## Switching backends

To switch from `@rozek/sds-core-jj` (json-joy) to this package, change only the import path:

```typescript
// before
import { SDS_DataStore } from '@rozek/sds-core-jj'

// after
import { SDS_DataStore } from '@rozek/sds-core-loro'
```

Persisted binary data (`asBinary()` snapshots and `exportPatch()` patches) is **not** cross-compatible between backends. See the [root README](../../README.md) for a data migration guide.

---

## Building

```bash
pnpm --filter @rozek/sds-core-loro build
```

Output is written to `packages/core-loro/dist/`.

---

## License

MIT © Andreas Rozek