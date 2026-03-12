# @rozek/sds-core-yjs

The **Y.js CRDT backend** for [shareable-data-store](../../README.md). Provides `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, and `SDS_Error` backed by [Y.js](https://github.com/yjs/yjs) — a well-proven, production-ready CRDT library used in many collaborative applications. Drop-in replacement for `@rozek/sds-core-jj` and `@rozek/sds-core-loro`: only the import path changes.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22+** | required when using this package in a Node.js project or build toolchain. Download from [nodejs.org](https://nodejs.org). |
| **Modern browser** | required when using this package in a web application. Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |

This package is isomorphic. All runtime dependencies (`yjs`, `fflate`, `fractional-indexing`, `zod`) are bundled — no additional installs required.

---

## When to use this package

Choose `@rozek/sds-core-yjs` when:

- You already use Y.js elsewhere in your stack and want a consistent CRDT model.
- You need character-level collaborative text editing on data values (`Y.Text`).
- You prefer Y.js's large ecosystem and tooling (y-websocket, y-indexeddb, …).
- You do **not** need the canonical-snapshot guarantee of the json-joy backend.
- You do **not** need to exchange patches with stores built on the json-joy or Loro backends.

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sds-core-yjs
# @rozek/sds-core is a peer dependency:
pnpm add @rozek/sds-core
```

All other runtime dependencies (`yjs`, `fflate`, `fractional-indexing`, `zod`) are bundled.

---

## API

The public API — `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, `SDS_Error`, and all provider interfaces — is identical across all backends and is fully documented in the [`@rozek/sds-core` README](../core/README.md).

The only backend-specific aspects are the binary encoding, cursor format, and patch encoding — see [Y.js-specific details](#yjs-specific-details) below.

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SDS_DataStore } from '@rozek/sds-core-yjs'

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
import { SDS_DataStore } from '@rozek/sds-core-yjs'

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
import { SDS_DataStore } from '@rozek/sds-core-yjs'

const DataStore = SDS_DataStore.fromScratch()
const Data = DataStore.newItemAt(undefined, DataStore.RootItem)

Data.writeValue('Hello, World!')

// replace characters 7–12 with 'SDS'
Data.changeValue(7, 12, 'SDS')

console.log(await Data.readValue())  // 'Hello, SDS!'
```

---

## Y.js-specific details

### No canonical empty snapshot

Unlike the json-joy backend, `fromScratch()` builds the document by creating the three well-known items (`Root`, `Trash`, `Lost & Found`) directly into a fresh `Y.Doc` using their fixed UUIDs. Two independent peers can exchange patches immediately — Y.js CRDT semantics ensure deterministic conflict resolution.

### Binary format

`asBinary()` encodes the document via `Y.encodeStateAsUpdate(doc)` and gzip-compresses the result. `fromBinary()` decompresses and calls `Y.applyUpdate(doc, bytes)`. This format is **not** compatible with the json-joy or Loro binary formats.

### Cursor format

`currentCursor` returns `Y.encodeStateVector(doc)` — a variable-length `Uint8Array` encoding all seen logical clocks. `exportPatch(cursor)` returns `Y.encodeStateAsUpdate(doc, stateVector)` — exactly the delta since that cursor.

### Collaborative text editing

`literalValue` is stored as a `Y.Text` node inside each entry's `Y.Map`. The `changeValue(fromIndex, toIndex, replacement)` method translates directly to `Y.Text.delete` + `Y.Text.insert` operations, enabling true character-level collaborative editing with automatic merge.

---

## Switching backends

To switch from `@rozek/sds-core-jj` (json-joy) to this package, change only the import path:

```typescript
// before
import { SDS_DataStore } from '@rozek/sds-core-jj'

// after
import { SDS_DataStore } from '@rozek/sds-core-yjs'
```

Persisted binary data (`asBinary()` snapshots and `exportPatch()` patches) is **not** cross-compatible between backends. See the [root README](../../README.md) for a data migration guide.

---

## Building

```bash
pnpm --filter @rozek/sds-core-yjs build
```

Output is written to `packages/core-yjs/dist/`.

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek