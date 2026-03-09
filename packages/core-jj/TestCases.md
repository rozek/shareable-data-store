# Test Cases — `@rozek/sds-core-jj`

All test cases from [`@rozek/sds-core` TestCases.md](../core/TestCases.md) apply
without modification.  The additional json-joy-specific cases are listed below.

---

## SDS_CoreJJ.test.ts — Export Smoke Tests

| # | Test case | Expected result |
|---|---|---|
| JJ-01 | `SDS_Error` imported from `@rozek/sds-core-jj` is constructible | `err instanceof SDS_Error`, `err.Code === 'test'`, `err.message === 'test message'` |
| JJ-02 | `SDS_NoteStore` factory methods are exported | `fromScratch`, `fromBinary`, `fromJSON` are functions |
| JJ-03 | `SDS_Entry`, `SDS_Note`, `SDS_Link` are exported | all three are defined |
| JJ-04 | `fromScratch()` produces a working store | `instanceof SDS_NoteStore`; well-known IDs correct |
| JJ-05 | Instances have correct prototypes | `instanceof SDS_Note`, `instanceof SDS_Link` |
| JJ-06 | Patch exchange between two independent stores | Label set on StoreA visible on StoreB after `applyRemotePatch` |

---

## SDS_NoteStore.construction.test.ts — Canonical snapshot (json-joy only)

| # | Test case | Expected result |
|---|---|---|
| JJ-C-01 | `CanonicalEmptySnapshot` starts with gzip magic bytes | `[0] === 0x1f`, `[1] === 0x8b` |
| JJ-C-02 | `fromBinary(CanonicalEmptySnapshot)` contains exactly the three well-known notes | correct IDs; `RootNote.innerEntryList.length === 2` |
