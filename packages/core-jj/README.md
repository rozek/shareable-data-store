# @rozek/sds-core-jj

The **json-joy CRDT backend** for [shareable-data-store](../../README.md). Provides `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, and `SDS_Error` backed by [json-joy](https://github.com/streamich/json-joy) JSON CRDT.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22+** | required when using this package in a Node.js project or build toolchain. Download from [nodejs.org](https://nodejs.org). |
| **Modern browser** | required when using this package in a web application. Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |
| `json-joy` **≥ 17** | peer dependency — install separately: `pnpm add json-joy`. |

This package is isomorphic. All other runtime dependencies (`fflate`, `fractional-indexing`, `zod`) are bundled.

---

## When to use this package

Choose `@rozek/sds-core-jj` when:

- you want the mature, well-tested json-joy CRDT backend.
- you need the canonical-snapshot guarantee — every `fromScratch()` call starts from the same internal CRDT node-Id space, so cross-peer patches are always compatible even without prior snapshot exchange.
- you need json-joy-specific serialisation interoperability (the binary format is stable and gzip-compressed).

Choose one of the alternative backend packages when you need a different CRDT library or want to migrate an existing store.

---

## Installation

```bash
pnpm add @rozek/sds-core-jj
# peer dependencies:
pnpm add @rozek/sds-core
pnpm add json-joy
```

---

## API

The public API — `SDS_DataStore`, `SDS_Item`, `SDS_Link`, `SDS_Entry`, `SDS_Error`, and all provider interfaces — is identical across all backends and is fully documented in the `@rozek/sds-core`[ README](../core/README.md).

---

## Examples

### Building a tree and subscribing to changes

```typescript
import { SDS_DataStore } from '@rozek/sds-core-jj'

const Store = SDS_DataStore.fromScratch()

const unsubscribe = Store.onChangeInvoke((Origin, ChangeSet) => {
  for (const [EntryId, changedKeys] of Object.entries(ChangeSet)) {
    console.log(`[${Origin}] ${EntryId}: ${[...changedKeys].join(', ')}`)
  }
})

Store.transact(() => {
  const Journal = Store.newItemAt(undefined, Store.RootItem)
  Journal.Label = 'Journal'

  const Entry = Store.newItemAt(undefined, Journal)
  Entry.Label = '2025-01-01'
  Entry.Info['mood'] = 'hopeful'
})

unsubscribe()
```

### Syncing two stores via CRDT patches

```typescript
import { SDS_DataStore } from '@rozek/sds-core-jj'

// two peers start from the same snapshot
const StoreA = SDS_DataStore.fromScratch()
const StoreB = SDS_DataStore.fromBinary(StoreA.asBinary())

// peer A makes a change
const ItemA = StoreA.newItemAt(undefined, StoreA.RootItem)
ItemA.Label = 'shared item'

// peer A exports a patch and peer B applies it
const Patch = StoreA.exportPatch()
StoreB.applyRemotePatch(Patch)

// both peers now agree
const ItemB = StoreB.EntryWithId(ItemA.Id)
console.log(ItemB?.Label)  // 'shared item'
```

### Collaborative character editing

```typescript
import { SDS_DataStore } from '@rozek/sds-core-jj'

const Store = SDS_DataStore.fromScratch({ LiteralSizeLimit: 65536 })
const Item = Store.newItemAt(undefined, Store.RootItem)

Item.writeValue('Hello, World!')

// replace characters 7–12 with 'SDS'
Item.changeValue(7, 12, 'SDS')

console.log(await Item.readValue())  // 'Hello, SDS!'
```

---

## json-joy-specific details

### Canonical empty snapshot

`SDS_DataStore.fromScratch()` loads a pre-generated **canonical empty snapshot** instead of building the CRDT document from scratch. This ensures all peers start from the same internal json-joy node-Id space so that patches are always compatible — even if the peers never exchanged a snapshot first.

The canonical snapshot is stored in `packages/core-jj/src/store/canonical-empty-snapshot.ts` and must be regenerated whenever the store schema or the json-joy version changes. The generation script is in `packages/core/scripts/generate-canonical-snapshot.test.ts`.

### Cursor format

The `SDS_SyncCursor` for the json-joy backend is a **4-byte big-endian** `uint32` encoding the patch-log index. The persistence and network layers treat it as an opaque `Uint8Array`.

### Patch encoding

Local patches are captured via json-joy's `Model.api.flush()` and assembled into a length-prefixed multi-patch envelope by `encodePatches()` / `decodePatches()` helpers inside `SDS_DataStore`.

---

## Building

```bash
pnpm --filter @rozek/sds-core-jj build
```

Output is written to `packages/core-jj/dist/`.

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek