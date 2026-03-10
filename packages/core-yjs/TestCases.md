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

## SDS_DataStore.construction.test.ts — Backend-specific (Y.js)

| # | Test case | Expected result |
|---|---|---|
| YJS-C-01 | `fromScratch()` contains exactly the three well-known items with correct inner-entry order | `RootItem.innerEntryList` has length 2 and contains both `TrashItem.Id` and `LostAndFoundItem.Id` |

