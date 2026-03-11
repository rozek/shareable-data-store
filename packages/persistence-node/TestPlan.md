# Test Plan — `@rozek/sds-persistence-node`

---

## Goal

Verify that `SDS_DesktopPersistenceProvider` reliably persists and restores snapshots, patches, and large value blobs via SQLite (`node:sqlite`).

---

## Scope

**In scope:**
- Construction and schema auto-creation
- Snapshot save / load / overwrite and persistence across close/reopen
- Patch append / load since clock / prune / duplicate-clock handling
- Value blob save / load / ref-counted release

**Out of scope:**
- Integration with `SDS_DataStore` (covered by `@rozek/sds-sync-engine` tests)
- Concurrent access from multiple processes

---

## Test Environment

- **Runtime:** Node.js 22+
- **Database:** in-memory or temp-file SQLite via `node:sqlite`
- **Test framework:** Vitest 2

---

## Part I — Construction

### 1. Instance creation and schema initialisation

#### 1.1 Basic construction

- **TC-1.1.1** — Constructing a provider with a valid path and `storeId` succeeds without throwing
- **TC-1.1.2** — After the first open, all required tables (`snapshots`, `patches`, `blobs`) exist in the database

---

## Part II — Snapshot Management

### 1. Persisting and loading snapshots

#### 1.1 Empty database behaviour

- **TC-2.1.1** — `loadSnapshot()` returns `null` when no snapshot has been saved

#### 1.2 Save and load

- **TC-2.2.1** — `saveSnapshot(bytes)` followed by `loadSnapshot()` returns the exact same bytes
- **TC-2.2.2** — Calling `saveSnapshot()` a second time overwrites the previous snapshot so that only the latest is returned

#### 1.3 Durability across close and reopen

- **TC-2.3.1** — A saved snapshot survives a `close()` + reopen of the provider

---

## Part III — Patch Management

### 1. Persisting and loading patches

#### 1.1 Empty database behaviour

- **TC-3.1.1** — `loadPatchesSince(0)` returns an empty array when no patches have been appended

#### 1.2 Appending and loading

- **TC-3.2.1** — `appendPatch(bytes, 1)` followed by `loadPatchesSince(0)` returns that patch
- **TC-3.2.2** — Multiple patches are returned in ascending clock order by `loadPatchesSince()`
- **TC-3.2.3** — `loadPatchesSince(clock)` returns only patches whose clock value is strictly greater than `clock`

#### 1.3 Pruning

- **TC-3.3.1** — `prunePatches(threshold)` removes all patches whose clock is strictly less than `threshold`

#### 1.4 Duplicate handling

- **TC-3.4.1** — `appendPatch()` with a duplicate clock value is silently ignored (idempotent)

---

## Part IV — Value Blob Management

### 1. Storing and retrieving value blobs

#### 1.1 Empty database behaviour

- **TC-4.1.1** — `loadValue(hash)` returns `null` for an unknown hash

#### 1.2 Save and load

- **TC-4.2.1** — `saveValue(hash, bytes)` followed by `loadValue(hash)` returns the exact same bytes

#### 1.3 Reference counting

- **TC-4.3.1** — Calling `saveValue()` with the same hash twice increments the internal `ref_count` to `2`
- **TC-4.3.2** — Two calls to `releaseValue()` after two `saveValue()` calls delete the row from the database

#### 1.4 Release on unknown hash

- **TC-4.4.1** — `releaseValue()` on an unknown hash does not throw

---

## Running the Tests

```bash
cd packages/persistence-node
pnpm test:run
```
