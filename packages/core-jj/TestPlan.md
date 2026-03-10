# Test Plan — `@rozek/sds-core-jj`

This package implements the full SDS_DataStore contract defined in
[`@rozek/sds-core` TestPlan.md](../core/TestPlan.md).

All Parts I–XIII of the shared contract apply without modification, with the
following addition: as the json-joy backend uses a **canonical empty snapshot**,
two extra construction tests (JJ-C-01 and JJ-C-02) verify its integrity.

---

## Goal

Verify that the json-joy CRDT backend exposes the correct observable API and
that all public symbols are correctly exported from the `@rozek/sds-core-jj`
entry point.

---

## Test Environment

- **Runner:** Vitest 2 with `globals: true`
- **Language:** TypeScript 5.7, ESM modules
- **Platform:** Node.js 22+ (no browser APIs needed)

---

## Additional tests — Export Smoke Tests

These tests verify that every public symbol can be imported from
`@rozek/sds-core-jj` and that the json-joy backend is wired up correctly.

- **JJ-01** — `SDS_Error` is exported and constructible
- **JJ-02** — `SDS_DataStore` factory methods are exported
- **JJ-03** — `SDS_Entry`, `SDS_Item`, `SDS_Link` classes are exported
- **JJ-04** — `fromScratch()` produces a working store with well-known items
- **JJ-05** — Instances are `SDS_Item` / `SDS_Link` (correct prototypes)
- **JJ-06** — Two independent stores can exchange patches

---

## Additional tests — Canonical empty snapshot

The json-joy backend loads a pre-generated canonical empty snapshot so that all
peers start from the same internal CRDT node-Id space.  TC-2.3.1 from the
shared contract already covers the two-peer patch exchange; the following tests
are specific to the canonical snapshot mechanism:

- **JJ-C-01** — `CanonicalEmptySnapshot` starts with the gzip magic bytes `0x1f 0x8b`
- **JJ-C-02** — `fromBinary(CanonicalEmptySnapshot)` produces a store with exactly the three well-known items and no other entries

---

## Additional tests — json-joy-specific sync behaviour

The json-joy backend wraps each individual `applyPatch` call in an inner
`try/catch` because json-joy's `_gcTree` traversal contains a bug: when two
peers concurrently create and delete a node, `ObjNode.children()` may pass
`undefined` to its callback, causing a runtime exception.  The CRDT state is
already consistent at that point; the inner catch suppresses the error and lets
`#updateIndicesFromView()` + `recoverOrphans()` reconcile in-memory indices with
the model view.

Callers can observe these suppressed errors via the optional `onApplyPatchError`
property of `SDS_DataStoreOptions`.  The following test verifies that this path
is wired up without being triggered in normal operation:

- **JJ-SY-01** — `onApplyPatchError` callback is not invoked during a normal `applyRemotePatch` (no CRDT conflict, no exception expected)

---

## Backend differences from the contract defaults

- **Cursor format** — `currentCursor` is a 4-byte big-endian `uint32` encoding the patch-log index (opaque to callers).
- **Patch encoding** — local patches are captured via `Model.api.flush()` and assembled into a length-prefixed multi-patch envelope.
- **Canonical snapshot** — `fromScratch()` loads `CanonicalEmptySnapshot` instead of building the document from scratch; this guarantees shared CRDT node IDs across peers.
- **Char-level editing** — `changeValue()` uses json-joy's str-mod operations on the CRDT string node.
- **Binary values** — small binary values are stored inline in the CRDT; large ones as hash references.
- **`onApplyPatchError` option** — `SDS_DataStoreOptions` accepts an optional `onApplyPatchError` callback; when the inner `applyPatch` call throws (due to the `_gcTree` bug), the error is passed to this callback before being suppressed.

---

## Running the tests

```bash
# from the monorepo root:
pnpm --filter @rozek/sds-core-jj test:run

# from the package directory:
cd packages/core-jj
pnpm test:run
```
