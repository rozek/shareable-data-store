# Test Cases — `@rozek/sns-core-yjs`

All test cases from [`@rozek/sns-core` TestCases.md](../core/TestCases.md) apply.
The test files under `src/tests/` use the same IDs and descriptions as the
shared contract; only the import path points to `@rozek/sns-core-yjs`.

---

## Backend notes

### C-11 — Two independent fromScratch() stores can exchange patches

**How it works in Y.js:** both stores are built from scratch using fixed
well-known entry IDs.  Y.js state-vector-based delta encoding correctly handles
the case where both docs started from divergent initial states — Y.js simply
merges both sets of updates.  No canonical pre-generated snapshot is required.
