# Test Cases — `@rozek/sns-core-loro`

All test cases from [`@rozek/sns-core` TestCases.md](../core/TestCases.md) apply.
The test files under `src/tests/` use the same IDs and descriptions as the
shared contract; only the import path points to `@rozek/sns-core-loro`.

---

## Backend notes

### C-11 — Two independent fromScratch() stores can exchange patches

**How it works in Loro:** both stores are built from scratch using fixed
well-known entry IDs.  Loro's version-vector-based delta encoding correctly
handles the case where both docs started from divergent initial states — Loro
simply merges both sets of updates.  No canonical pre-generated snapshot is
required.

### Purge behaviour

`purgeEntry()` tombstones an entry by setting its `outerNoteId` to `''`
instead of physically removing the map key.  The observable result is
identical to the contract specification: `EntryWithId(id)` returns `undefined`
and the entry no longer appears in any `innerEntryList`.
