# Test Plan — `@rozek/sds-core-yjs`

This package implements the full SDS_DataStore contract defined in
[`@rozek/sds-core` TestPlan.md](../core/TestPlan.md).

All Parts I–XIII of the shared contract apply.  The sections below document
how this backend satisfies the contract and where its behaviour differs from
the json-joy reference implementation.

---

## Goal

Verify that the Y.js CRDT backend exhibits identical observable behaviour to
the json-joy backend for every contract test case.

---

## Test Environment

- **Runner:** Vitest
- **Platform:** Node.js (no browser / JSDOM required)
- **Dependencies:** `yjs`, `fflate`, `fractional-indexing`, `zod`

---

## Backend differences from the contract defaults

- **No canonical empty snapshot** — `fromScratch()` builds the Y.js document
  directly using fixed well-known entry IDs.  TC-2.3.1 (cross-peer patch
  exchange from independent stores) is satisfied via Y.js CRDT merge semantics
  rather than a shared canonical starting state.

- **Cursor format** — `currentCursor` is a Y.js state vector encoded as
  `Uint8Array` (opaque to callers), not a 4-byte uint32.

- **Binary serialisation** — `asBinary()` / `fromBinary()` use
  `Y.encodeStateAsUpdate` / `Y.applyUpdate` (gzip-compressed).

- **Patch export** — `exportPatch(cursor)` calls
  `Y.encodeStateAsUpdate(doc, stateVector)`.

- **Char-level editing** — `changeValue()` uses `Y.Text` insert / delete
  operations.

- **Binary values** — Y.js supports binary CRDT values natively; large binary
  values are stored as plain `Uint8Array` entries in `Y.Map`.

- **Conservative `'Label'` change events** — after every `applyRemotePatch`,
  `#updateIndicesFromView()` records a `'Label'` change for every entry it
  processes, even when the label did not actually change.  Y.js does not expose
  a per-field diff for nested maps, so the backend errs on the side of
  over-reporting rather than missing a real update.  consumers should treat
  `'Label'` in a ChangeSet as "label may have changed" rather than "label
  definitely changed".

---

## Pass criteria

All shared contract tests (Parts I–XIII) must pass with `vitest run`.
No additional backend-specific test suites are defined for this package.

---

## Running the tests

```bash
# from the monorepo root:
pnpm --filter @rozek/sds-core-yjs test:run

# from the package directory:
cd packages/core-yjs
pnpm test:run
```
