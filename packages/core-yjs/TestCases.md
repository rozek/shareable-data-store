# Test Cases — `@rozek/sds-core-yjs`

All test cases from [`@rozek/sds-core` TestCases.md](../core/TestCases.md) apply.
The test files under `src/tests/` use the same IDs and descriptions as the
shared contract; only the import path points to `@rozek/sds-core-yjs`.

---

## Backend items

### C-11 — Two independent fromScratch() stores can exchange patches

**How it works in Y.js:** both stores are built from scratch using fixed
well-known entry IDs.  Y.js state-vector-based delta encoding correctly handles
the case where both docs started from divergent initial states — Y.js simply
merges both sets of updates.  No canonical pre-generated snapshot is required.

## SDS_CoreYjs.test.ts — Export Smoke Tests

| # | Test case | Expected result |
|---|---|---|
| YJS-01 | `SDS_Error` imported from `@rozek/sds-core-yjs` is constructible | `err instanceof SDS_Error`, `err.code === 'test'`, `err.message === 'test message'` |
| YJS-02 | `SDS_DataStore` factory methods are exported | `fromScratch`, `fromBinary`, `fromJSON` are functions |
| YJS-03 | `SDS_Entry`, `SDS_Item`, `SDS_Link` are exported | all three are defined |
| YJS-04 | `fromScratch()` produces a working store | `instanceof SDS_DataStore`; well-known IDs correct |
| YJS-05 | Instances have correct prototypes | `instanceof SDS_Item`, `instanceof SDS_Link` |
| YJS-06 | Patch exchange between two independent stores | Label set on StoreA visible on StoreB after `applyRemotePatch` |

---

## SDS_DataStore.construction.test.ts — Backend-specific (Y.js)

| # | Test case | Expected result |
|---|---|---|
| YJS-C-01 | `fromScratch()` contains exactly the three well-known items with correct inner-entry order | `RootItem.innerEntryList` has length 2 and contains both `TrashItem.Id` and `LostAndFoundItem.Id` |

