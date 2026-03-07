# Test Plan — `@rozek/sns-persistence-browser`

---

## Goal

Verify that `SNS_BrowserPersistenceProvider` correctly persists and restores snapshots, patches, and large value blobs via IndexedDB.

---

## Scope

**In scope:**
- Database open and schema creation
- Snapshot save / load / overwrite
- Patch append / load since clock / prune
- Value blob save / load / ref-counted release

**Out of scope:**
- Integration with `SNS_NoteStore` (covered by sync-engine tests)
- Cross-origin or cross-tab isolation (browser policy)

---

## Test Environment

- **Runtime:** Node.js with `fake-indexeddb` providing an in-memory IndexedDB
- **Test framework:** Vitest 2

> `fake-indexeddb/auto` is imported globally in the test setup so that `indexedDB` is available without a real browser environment.

---

## Part I — Construction

### 1. Instance creation and lazy database open

#### 1.1 Basic construction

- **TC-1.1.1** — Constructing a provider and calling an operation that opens the database succeeds without throwing

---

## Part II — Snapshot Management

### 1. Persisting and loading snapshots

#### 1.1 Empty database behaviour

- **TC-2.1.1** — `loadSnapshot()` returns `null` when no snapshot has been saved

#### 1.2 Save and load

- **TC-2.2.1** — `saveSnapshot(bytes)` followed by `loadSnapshot()` returns the exact same bytes
- **TC-2.2.2** — Calling `saveSnapshot()` a second time overwrites the previous snapshot so that only the latest is returned

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

---

## Part IV — Value Blob Management

### 1. Storing and retrieving value blobs

#### 1.1 Empty database behaviour

- **TC-4.1.1** — `loadValue(hash)` returns `null` for an unknown hash

#### 1.2 Save and load

- **TC-4.2.1** — `saveValue(hash, bytes)` followed by `loadValue(hash)` returns the exact same bytes

#### 1.3 Reference counting

- **TC-4.3.1** — Calling `saveValue()` with the same hash twice and then calling `releaseValue()` twice deletes the blob

#### 1.4 Release on unknown hash

- **TC-4.4.1** — `releaseValue()` on an unknown hash does not throw

---

## Running the Tests

```bash
cd packages/persistence-browser
pnpm test:run
```
