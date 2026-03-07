# Test Plan — `@rozek/sns-core-jj`

This package implements the full SNS_NoteStore contract defined in
[`@rozek/sns-core` TestPlan.md](../core/TestPlan.md).

All Parts I–XIII of the shared contract apply without modification, with the
following addition: as the json-joy backend uses a **canonical empty snapshot**,
two extra construction tests (JJ-C-01 and JJ-C-02) verify its integrity.

---

## Goal

Verify that the json-joy CRDT backend exposes the correct observable API and
that all public symbols are correctly exported from the `@rozek/sns-core-jj`
entry point.

---

## Test Environment

- **Runner:** Vitest 2 with `globals: true`
- **Language:** TypeScript 5.7, ESM modules
- **Platform:** Node.js 22+ (no browser APIs needed)

---

## Additional tests — Export Smoke Tests

These tests verify that every public symbol can be imported from
`@rozek/sns-core-jj` and that the json-joy backend is wired up correctly.

- **JJ-01** — `SNS_Error` is exported and constructible
- **JJ-02** — `SNS_NoteStore` factory methods are exported
- **JJ-03** — `SNS_Entry`, `SNS_Note`, `SNS_Link` classes are exported
- **JJ-04** — `fromScratch()` produces a working store with well-known notes
- **JJ-05** — Instances are `SNS_Note` / `SNS_Link` (correct prototypes)
- **JJ-06** — Two independent stores can exchange patches

---

## Additional tests — Canonical empty snapshot

The json-joy backend loads a pre-generated canonical empty snapshot so that all
peers start from the same internal CRDT node-ID space.  TC-2.3.1 from the
shared contract already covers the two-peer patch exchange; the following tests
are specific to the canonical snapshot mechanism:

- **JJ-C-01** — `CanonicalEmptySnapshot` starts with the gzip magic bytes `0x1f 0x8b`
- **JJ-C-02** — `fromBinary(CanonicalEmptySnapshot)` produces a store with exactly the three well-known notes and no other entries

---

## Backend differences from the contract defaults

- **Cursor format** — `currentCursor` is a 4-byte big-endian `uint32` encoding the patch-log index (opaque to callers).
- **Patch encoding** — local patches are captured via `Model.api.flush()` and assembled into a length-prefixed multi-patch envelope.
- **Canonical snapshot** — `fromScratch()` loads `CanonicalEmptySnapshot` instead of building the document from scratch; this guarantees shared CRDT node IDs across peers.
- **Char-level editing** — `changeValue()` uses json-joy's str-mod operations on the CRDT string node.
- **Binary values** — small binary values are stored inline in the CRDT; large ones as hash references.

---

## Running the tests

```bash
# from the monorepo root:
pnpm --filter @rozek/sns-core-jj test:run

# from the package directory:
cd packages/core-jj
pnpm test:run
```
