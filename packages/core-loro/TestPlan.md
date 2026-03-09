# Test Plan — `@rozek/sds-core-loro`

This package implements the full SDS_NoteStore contract defined in
[`@rozek/sds-core` TestPlan.md](../core/TestPlan.md).

All Parts I–XIII of the shared contract apply.  The sections below document
how this backend satisfies the contract and where its behaviour differs from
the json-joy reference implementation.

---

## Goal

Verify that the Loro CRDT backend exhibits identical observable behaviour to
the json-joy backend for every contract test case.

---

## Test Environment

- **Runner:** Vitest
- **Platform:** Node.js (no browser / JSDOM required)
- **Dependencies:** `loro-crdt`, `fflate`, `fractional-indexing`, `zod`

---

## Backend differences from the contract defaults

- **No canonical empty snapshot** — `fromScratch()` builds the Loro document
  directly using `LoroMap.setContainer()` for nested maps and `LoroText`
  containers with fixed well-known entry IDs.  TC-2.3.1 (cross-peer patch
  exchange from independent stores) is satisfied via Loro CRDT merge semantics
  rather than a shared canonical starting state.

- **Cursor format** — `currentCursor` is a Loro version vector encoded as
  `Uint8Array` (`doc.version().encode()`), not a 4-byte uint32.

- **Binary serialisation** — `asBinary()` / `fromBinary()` use
  `doc.export({ mode: 'snapshot' })` / `doc.import()` (gzip-compressed).

- **Patch export** — `exportPatch(cursor)` calls
  `doc.exportFrom(VersionVector.decode(cursor))`.

- **Char-level editing** — `changeValue()` uses `LoroText` insert / delete
  operations.

- **Binary values** — Loro supports binary CRDT values natively; large binary
  values are stored as plain `Uint8Array` entries in `LoroMap`.

- **Purge implementation** — `purgeEntry()` uses tombstoning (sets
  `outerNoteId` to `''`) rather than deleting the map key, ensuring CRDT
  consistency across peers.

- **Transactions** — modelled via a depth counter (`#TransactDepth`); Loro's
  `doc.commit()` is called once at the end of each outermost transaction.

---

## Pass criteria

All shared contract tests (Parts I–XIII) must pass with `vitest run`.
No additional backend-specific test suites are defined for this package.

---

## Running the tests

```bash
# from the monorepo root:
pnpm --filter @rozek/sds-core-loro test:run

# from the package directory:
cd packages/core-loro
pnpm test:run
```
