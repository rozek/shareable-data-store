# Test Cases — `@rozek/sns-core-jj`

All test cases from [`@rozek/sns-core` TestCases.md](../core/TestCases.md) apply
without modification.  The additional json-joy-specific cases are listed below.

---

## SNS_CoreJJ.test.ts — Export Smoke Tests

| # | Test case | Expected result |
|---|---|---|
| JJ-01 | `SNS_Error` imported from `@rozek/sns-core-jj` is constructible | `err instanceof SNS_Error`, `err.Code === 'test'`, `err.message === 'test message'` |
| JJ-02 | `SNS_NoteStore` factory methods are exported | `fromScratch`, `fromBinary`, `fromJSON` are functions |
| JJ-03 | `SNS_Entry`, `SNS_Note`, `SNS_Link` are exported | all three are defined |
| JJ-04 | `fromScratch()` produces a working store | `instanceof SNS_NoteStore`; well-known IDs correct |
| JJ-05 | Instances have correct prototypes | `instanceof SNS_Note`, `instanceof SNS_Link` |
| JJ-06 | Patch exchange between two independent stores | Label set on StoreA visible on StoreB after `applyRemotePatch` |

---

## SNS_NoteStore.construction.test.ts — Canonical snapshot (json-joy only)

| # | Test case | Expected result |
|---|---|---|
| JJ-C-01 | `CanonicalEmptySnapshot` starts with gzip magic bytes | `[0] === 0x1f`, `[1] === 0x8b` |
| JJ-C-02 | `fromBinary(CanonicalEmptySnapshot)` contains exactly the three well-known notes | correct IDs; `RootNote.innerEntryList.length === 2` |
