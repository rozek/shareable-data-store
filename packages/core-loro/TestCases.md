# Test Cases — `@rozek/sds-core-loro`

All test cases from [`@rozek/sds-core` TestCases.md](../core/TestCases.md) apply.
The test files under `src/tests/` use the same IDs and descriptions as the
shared contract; only the import path points to `@rozek/sds-core-loro`.

---

## Backend items

### C-11 — Two independent fromScratch() stores can exchange patches

**How it works in Loro:** both stores are built from scratch using fixed
well-known entry IDs.  Loro's version-vector-based delta encoding correctly
handles the case where both docs started from divergent initial states — Loro
simply merges both sets of updates.  No canonical pre-generated snapshot is
required.

### Purge behaviour

`purgeEntry()` tombstones an entry by setting its `outerItemId` to `''`
instead of physically removing the map key.  The observable result is
identical to the contract specification: `EntryWithId(id)` returns `undefined`
and the entry no longer appears in any `innerEntryList`.

## SDS_CoreLoro.test.ts — Export Smoke Tests

| # | Test case | Expected result |
|---|---|---|
| LORO-01 | `SDS_Error` imported from `@rozek/sds-core-loro` is constructible | `err instanceof SDS_Error`, `err.code === 'test'`, `err.message === 'test message'` |
| LORO-02 | `SDS_DataStore` factory methods are exported | `fromScratch`, `fromBinary`, `fromJSON` are functions |
| LORO-03 | `SDS_Entry`, `SDS_Item`, `SDS_Link` are exported | all three are defined |
| LORO-04 | `fromScratch()` produces a working store | `instanceof SDS_DataStore`; well-known IDs correct |
| LORO-05 | Instances have correct prototypes | `instanceof SDS_Item`, `instanceof SDS_Link` |
| LORO-06 | Patch exchange between two independent stores | Label set on StoreA visible on StoreB after `applyRemotePatch` |

---

## SDS_DataStore.construction.test.ts — Backend-specific (Loro)

| # | Test case | Expected result |
|---|---|---|
| LO-C-01 | `fromScratch()` contains exactly the three well-known items with correct inner-entry order | `RootItem.innerEntryList` has length 2 and contains both `TrashItem.Id` and `LostAndFoundItem.Id` |

