# Test Plan — SDS_NoteStore Contract

Shared test plan for all `@rozek/sds-core-*` backend packages.
Every backend (`@rozek/sds-core-jj`, `@rozek/sds-core-yjs`, `@rozek/sds-core-loro`)
must pass every test case defined here.  Backend-specific additions and
behavioural differences are documented in each backend's own `TestPlan.md`.

---

## Goal

Verify that `SDS_NoteStore`, `SDS_Entry`, `SDS_Note`, `SDS_Link`, and
`SDS_Error` behave correctly in isolation from any network, persistence, or UI
layer, and that every backend exposes an identical observable API.

---

## Scope

**In scope:**
- Construction — `fromScratch()`, `fromBinary()`, `fromJSON()` produce a valid store with the three well-known notes present
- Well-known notes — `RootNote`, `TrashNote`, `LostAndFoundNote` have correct IDs, labels, and restrictions
- Entry creation — `newNoteAt()` and `newLinkAt()` create entries in the correct container at the correct position
- Entry lookup — `EntryWithId()` returns the correct entry or `undefined`
- Label & Info — getters and setters fire ChangeSet events and mutate the CRDT
- Value handling — `writeValue()` selects the correct `ValueKind`; `readValue()` returns the stored value; `changeValue()` splices literal values collaboratively
- Inner entry list — `innerEntryList` returns children sorted by `(OrderKey, Id)`; insertion order is respected
- Move — `moveEntryTo()` / `moveTo()` update placement; cycle detection blocks invalid moves
- Delete — `deleteEntry()` / `delete()` moves entry and all descendants to `TrashNote`; well-known notes cannot be deleted
- Purge — `purgeEntry()` / `purge()` permanently removes entries from `TrashNote`; throws `purge-protected` when the entry has incoming links from the live tree; `purgeExpiredTrashEntries()` auto-purges entries older than a configurable TTL
- Serialisation — `asBinary()` produces gzip-compressed data that `fromBinary()` can restore exactly; `asJSON()` / `fromJSON()` round-trip correctly
- Transactions — `transact()` is nestable; only the outermost call emits a ChangeSet event
- Change events — `onChangeInvoke()` fires with correct origin and ChangeSet; the returned unsubscribe function stops delivery
- Remote patch — `applyRemotePatch()` applies a patch exported from a second store instance, merging changes correctly
- Orphan recovery — `recoverOrphans()` places orphans into `LostAndFoundNote`
- Deserialisation — `deserializeNoteInto()` and `deserializeLinkInto()` import subtrees

**Out of scope:** Persistence (IndexedDB, SQLite), Network (WebSocket, WebRTC), Presence, SyncEngine.
Backend-specific initialisation details (e.g. canonical empty snapshots) are tested in the respective backend packages.

---

## Test Environment

- **Runner:** Vitest 2 with `globals: true`
- **Language:** TypeScript 5.7, ESM modules
- **Platform:** Node.js 22+ (no browser APIs needed)
- **No mocks** — every test creates a fresh store via `SDS_NoteStore.fromScratch()`; time-sensitive tests (D-14 – D-21) use Vitest fake timers (`vi.useFakeTimers` / `vi.setSystemTime` / `vi.advanceTimersByTime`) instead of mocking the store itself

---

## Part I — SDS_Error

### 1. Construction and properties

#### 1.1 Basic construction

- **TC-1.1.1** — `Code` and `message` match the arguments passed to the constructor
- **TC-1.1.2** — `name` equals `'SDS_Error'`
- **TC-1.1.3** — A thrown `SDS_Error` is an instance of both `SDS_Error` and `Error`

---

## Part II — Store Construction

### 1. Factory methods

#### 1.1 fromScratch — return value and well-known entries

- **TC-2.1.1** — `fromScratch()` returns an object that is an instance of `SDS_NoteStore`
- **TC-2.1.2** — A freshly created store exposes a `RootNote` with the correct well-known `Id`
- **TC-2.1.3** — A freshly created store exposes a `TrashNote` with the correct well-known `Id`
- **TC-2.1.4** — A freshly created store exposes a `LostAndFoundNote` with the correct well-known `Id`

#### 1.2 Binary and JSON round-trips

- **TC-2.2.1** — `asBinary()` returns a non-empty `Uint8Array`
- **TC-2.2.2** — `fromBinary(store.asBinary())` produces a store structurally equivalent to the original
- **TC-2.2.3** — `asJSON()` returns a value that survives a `JSON.stringify` / `JSON.parse` cycle without throwing
- **TC-2.2.4** — `fromJSON(store.asJSON())` produces a store structurally equivalent to the original
- **TC-2.2.5** — A string shorter than `LiteralSizeLimit` is stored with `ValueKind` `'literal'`
- **TC-2.2.6** — A string longer than `LiteralSizeLimit` is stored with `ValueKind` `'literal-reference'`

#### 1.3 Cross-peer patch exchange from independent stores

- **TC-2.3.1** — Two independent `fromScratch()` stores can exchange patches without error, and mutations made on one are visible on the other after `applyRemotePatch`

---

## Part III — Well-known Notes

### 1. Identity flags

#### 1.1 Type predicates

- **TC-3.1.1** — `RootNote.isRootNote` is `true`
- **TC-3.1.2** — `TrashNote.isTrashNote` is `true`
- **TC-3.1.3** — `LostAndFoundNote.isLostAndFoundNote` is `true`
- **TC-3.1.4** — `RootNote.isNote` is `true`

### 2. Outer-note relationships

#### 2.1 outerNote links

- **TC-3.2.1** — `RootNote.outerNote` is `undefined`
- **TC-3.2.2** — `TrashNote.outerNote` is `RootNote`
- **TC-3.2.3** — `LostAndFoundNote.outerNote` is `RootNote`

### 3. Deletion restrictions

#### 3.1 mayBeDeleted flag

- **TC-3.3.1** — `RootNote.mayBeDeleted` is `false`
- **TC-3.3.2** — `TrashNote.mayBeDeleted` is `false`
- **TC-3.3.3** — `LostAndFoundNote.mayBeDeleted` is `false`

### 4. Labels and initial contents

#### 4.1 Default labels and root membership

- **TC-3.4.1** — `TrashNote.Label` defaults to `'trash'`
- **TC-3.4.2** — `LostAndFoundNote.Label` defaults to `'lost-and-found'`
- **TC-3.4.3** — `TrashNote.Label` can be changed to a new string
- **TC-3.4.4** — `RootNote.innerEntryList` contains both `TrashNote` and `LostAndFoundNote`

---

## Part IV — Entry Creation & Lookup

### 1. newNoteAt

#### 1.1 Return value and initial properties

- **TC-4.1.1** — `newNoteAt()` returns an object that is an instance of `SDS_Note`
- **TC-4.1.2** — The created note has the MIME type that was passed to `newNoteAt()`
- **TC-4.1.3** — The created note appears in the container's `innerEntryList`
- **TC-4.1.4** — `note.outerNote` equals the container that was passed to `newNoteAt()`

### 2. newLinkAt

#### 2.1 Return value and initial properties

- **TC-4.2.1** — `newLinkAt()` returns an object that is an instance of `SDS_Link`
- **TC-4.2.2** — The created link's `Target` equals the entry passed as target to `newLinkAt()`
- **TC-4.2.3** — The created link appears in the container's `innerEntryList`

### 3. EntryWithId lookup

#### 3.1 Hit and miss behaviour

- **TC-4.3.1** — `EntryWithId(id)` returns the correct entry for a known `id`
- **TC-4.3.2** — `EntryWithId(id)` returns `undefined` for an unknown `id`

### 4. Input validation

#### 4.1 Guard conditions

- **TC-4.4.1** — `newNoteAt()` with an empty MIME type throws an `SDS_Error` with `Code` `'invalid-argument'`
- **TC-4.4.2** — `newLinkAt()` with a non-existent target entry throws

---

## Part V — Label & Info

### 1. Label

#### 1.1 Getter, setter, and change event

- **TC-5.1.1** — A newly created note has an empty string `Label`
- **TC-5.1.2** — Setting `note.Label = value` persists and returns `value` via the getter
- **TC-5.1.3** — A `Label` change fires a ChangeSet that includes the `'Label'` key for the affected entry

### 2. Info proxy

#### 2.1 Read, write, delete, and change events

- **TC-5.2.1** — `note.Info` is initially an empty object
- **TC-5.2.2** — Assigning `note.Info.tag = value` stores the value and makes it accessible via `note.Info.tag`
- **TC-5.2.3** — Setting an Info key fires a ChangeSet that includes `'Info.tag'` for the affected entry
- **TC-5.2.4** — Deleting an Info key removes it from the Info object
- **TC-5.2.5** — Deleting an Info key fires a ChangeSet that includes `'Info.tag'` for the affected entry

---

## Part VI — Value Handling

### 1. ValueKind transitions

#### 1.1 Writing values of different kinds

- **TC-6.1.1** — A newly created note has `ValueKind` `'none'`
- **TC-6.1.2** — `writeValue(undefined)` sets `ValueKind` to `'none'`
- **TC-6.1.3** — `writeValue(smallString)` sets `ValueKind` to `'literal'`
- **TC-6.1.4** — `writeValue(smallUint8Array)` sets `ValueKind` to `'binary'`
- **TC-6.1.5** — `writeValue(largeString)` beyond `LiteralSizeLimit` sets `ValueKind` to `'literal-reference'`
- **TC-6.1.6** — `writeValue(largeUint8Array)` beyond `BinarySizeLimit` sets `ValueKind` to `'binary-reference'`
- **TC-6.1.7** — `writeValue(undefined)` on a note with an existing value resets `ValueKind` to `'none'`

### 2. Reading values back

#### 2.1 readValue and type flags

- **TC-6.2.1** — `readValue()` returns the same string that was written with `writeValue()`
- **TC-6.2.2** — `isLiteral` is `true` after a string write
- **TC-6.2.3** — `isBinary` is `false` after a string write
- **TC-6.2.4** — `readValue()` returns a `Uint8Array` equal to the one written with `writeValue()`
- **TC-6.2.5** — `isBinary` is `true` after a binary write

### 3. In-place editing

#### 3.1 changeValue — splice semantics and guard

- **TC-6.3.1** — `changeValue(index, deleteCount, insertion)` splices the literal string value correctly
- **TC-6.3.2** — `changeValue()` on a non-literal value throws an `SDS_Error` with `Code` `'change-value-not-literal'`

### 4. Change events

#### 4.1 ChangeSet for value mutations

- **TC-6.4.1** — A value write fires a ChangeSet that includes the `'Value'` key for the affected entry

---

## Part VII — Entry Ordering

### 1. Insertion order

#### 1.1 Default and index-based placement

- **TC-7.1.1** — Three notes created without an `InsertionIndex` appear in `innerEntryList` in creation order
- **TC-7.1.2** — A note created with `InsertionIndex` `0` is placed at the front of `innerEntryList`
- **TC-7.1.3** — A note created with `InsertionIndex` `1` is placed at the second position of `innerEntryList`
- **TC-7.1.4** — A note created with an `InsertionIndex` beyond the current length is appended at the end

### 2. innerEntryList API

#### 2.1 Length, iteration, and index access

- **TC-7.2.1** — `innerEntryList.length` reflects the actual number of direct inner entries
- **TC-7.2.2** — `innerEntryList` is iterable with `for…of`
- **TC-7.2.3** — `innerEntryList[0]` returns the first inner entry

---

## Part VIII — Entry Move

### 1. Basic moving

#### 1.1 Placement update and list synchronisation

- **TC-8.1.1** — After `moveEntryTo(entry, target)`, `entry.outerNote` equals `target`
- **TC-8.1.2** — The moved entry appears in the target container's `innerEntryList`
- **TC-8.1.3** — The moved entry is removed from the source container's `innerEntryList`
- **TC-8.1.4** — `moveEntryTo()` fires a ChangeSet containing `'outerNote'` for the entry and `'innerEntryList'` for both the source and target containers

### 2. Cycle detection

#### 2.1 mayBeMovedTo and move-would-cycle guard

- **TC-8.2.1** — `mayBeMovedTo()` returns `true` for a valid target that is not a descendant
- **TC-8.2.2** — `mayBeMovedTo()` returns `false` when the target is a descendant of the entry
- **TC-8.2.3** — `moveEntryTo()` into a descendant throws an `SDS_Error` with `Code` `'move-would-cycle'`

### 3. Special cases

#### 3.1 Well-known note constraints and positional insertion

- **TC-8.3.1** — `TrashNote.mayBeMovedTo(RootNote)` returns `true`
- **TC-8.3.2** — `TrashNote.mayBeMovedTo(innerNote)` returns `false` (TrashNote may only sit at root level)
- **TC-8.3.3** — `RootNote.mayBeMovedTo(anyContainer)` returns `false`
- **TC-8.3.4** — `moveEntryTo()` with `InsertionIndex` `0` inserts the entry at the front of the target list
- **TC-8.3.5** — `entry.moveTo(container)` is equivalent to `store.moveEntryTo(entry, container)`

---

## Part IX — Delete & Purge

### 1. deleteEntry

#### 1.1 Moving to TrashNote

- **TC-9.1.1** — `deleteEntry(note)` moves the note to `TrashNote`
- **TC-9.1.2** — All children of a deleted note are also moved to the trash hierarchy
- **TC-9.1.3** — `deleteEntry()` fires a ChangeSet containing `'outerNote'` and `'innerEntryList'`

#### 1.2 Well-known note guards

- **TC-9.1.4** — `deleteEntry(RootNote)` throws an `SDS_Error` with `Code` `'delete-not-permitted'`
- **TC-9.1.5** — `deleteEntry(TrashNote)` throws
- **TC-9.1.6** — `deleteEntry(LostAndFoundNote)` throws

### 2. purgeEntry

#### 2.1 Permanent removal and protection rules

- **TC-9.2.1** — `purgeEntry()` on a note not in `TrashNote` throws an `SDS_Error` with `Code` `'purge-not-in-trash'`
- **TC-9.2.2** — `purgeEntry()` permanently removes a note that is in `TrashNote`
- **TC-9.2.3** — `purgeEntry()` throws an `SDS_Error` with `Code` `'purge-protected'` when the note has an incoming link from the root-reachable tree; the entry remains in the store

### 3. Entry-level shortcuts

#### 3.1 delete() and purge() proxy methods

- **TC-9.3.1** — `note.delete()` is equivalent to calling `store.deleteEntry(note)`
- **TC-9.3.2** — `note.purge()` throws when the note is not in `TrashNote`

### 4. Trash TTL and auto-purge

#### 4.1 `deleteEntry` side-effects

- **TC-9.4.1** — `deleteEntry()` writes a numeric `_trashedAt` timestamp into the entry's `Info` that is ≥ the wall-clock time before the call

#### 4.2 `purgeExpiredTrashEntries`

- **TC-9.4.2** — `purgeExpiredTrashEntries(TTLms)` purges entries whose `_trashedAt` is older than `TTLms` milliseconds and returns the count of purged entries
- **TC-9.4.3** — `purgeExpiredTrashEntries(TTLms)` skips entries whose `_trashedAt` is within the TTL window (returns 0; entry is still present)
- **TC-9.4.4** — `purgeExpiredTrashEntries(TTLms)` skips entries that have no `_trashedAt` field (e.g. moved to Trash directly via `moveEntryTo`)
- **TC-9.4.5** — `purgeExpiredTrashEntries(TTLms)` silently skips protected entries and does not throw; protected entry remains in the store
- **TC-9.4.6** — `purgeExpiredTrashEntries(TTLms)` returns the correct count when multiple entries are purged in one call

#### 4.3 Auto-purge timer

- **TC-9.4.7** — When `TrashTTLms` and `TrashCheckIntervalMs` are configured, the auto-purge timer fires at the specified interval and calls `purgeExpiredTrashEntries` automatically

### 5. Lifecycle

#### 5.1 `dispose`

- **TC-9.5.1** — `dispose()` stops the auto-purge timer so that no further `purgeExpiredTrashEntries` calls are made after it returns

---

## Part X — Serialisation

### 1. Binary serialisation

#### 1.1 Round-trip fidelity

- **TC-10.1.1** — `asBinary()` returns a `Uint8Array` that starts with the gzip magic bytes `0x1f 0x8b`
- **TC-10.1.2** — All notes survive a `fromBinary(asBinary())` round-trip
- **TC-10.1.3** — `Label` values are preserved after a binary round-trip
- **TC-10.1.4** — `innerEntryList` order is preserved after a binary round-trip
- **TC-10.1.5** — A stored literal value is recovered intact after a binary round-trip
- **TC-10.1.6** — A stored binary value is recovered intact after a binary round-trip

### 2. JSON serialisation

#### 2.1 Round-trip fidelity

- **TC-10.2.1** — `fromJSON(store.asJSON())` produces a store structurally equivalent to the original

### 3. Nested structure

#### 3.1 Deep hierarchy preservation

- **TC-10.3.1** — Nested note hierarchies are preserved after a binary round-trip

---

## Part XI — Events & Transactions

### 1. Change events

#### 1.1 Firing and ChangeSet content

- **TC-11.1.1** — The `onChangeInvoke` callback is called at least once after `newNoteAt()`
- **TC-11.1.2** — The ChangeSet fired after `newNoteAt()` contains entries for both the new note and the container
- **TC-11.1.3** — The ChangeSet entry for the new note includes `'outerNote'`
- **TC-11.1.4** — The ChangeSet entry for the container includes `'innerEntryList'`

### 2. Unsubscribe

#### 2.1 Handler lifecycle

- **TC-11.2.1** — `onChangeInvoke()` returns a function that, when called, stops further event delivery to that handler
- **TC-11.2.2** — After calling the unsubscribe function the callback is no longer invoked

### 3. Multiple handlers and transaction nesting

#### 3.1 Fan-out and event coalescing

- **TC-11.3.1** — Multiple handlers registered with `onChangeInvoke()` all receive the same event
- **TC-11.3.2** — A nested `transact()` call emits only one ChangeSet event, at the outermost boundary
- **TC-11.3.3** — The `Origin` value is `'internal'` for mutations made directly on the local store

---

## Part XII — Sync & Remote Patches

### 1. Cross-store patch exchange

#### 1.1 exportPatch / applyRemotePatch

- **TC-12.1.1** — Two stores created from the same binary start with identical views
- **TC-12.1.2** — A patch exported from Store 1 and applied to Store 2 propagates the mutation to Store 2
- **TC-12.1.3** — Patches from both stores can be merged so that each store converges to the same final state

### 2. Orphan recovery

#### 2.1 recoverOrphans no-op case

- **TC-12.2.1** — `recoverOrphans()` on a clean store (no orphans) makes no observable changes

### 3. Origin tracking

#### 3.1 External origin flag

- **TC-12.3.1** — The `Origin` value is `'external'` inside the `onChangeInvoke` callback triggered by `applyRemotePatch()`

### 4. Incremental index update after remote patches

#### 4.1 Placement changes

- **TC-12.4.1** — After `applyRemotePatch` that moves an entry, `outerNote` and both containers' `innerEntryList` are correct on the receiver
- **TC-12.4.2** — After `applyRemotePatch` that purges an entry, the entry is absent from the receiver and absent from `TrashNote.innerEntryList`

#### 4.2 ChangeSet precision

- **TC-12.4.3** — The ChangeSet produced by `applyRemotePatch` records `outerNote` only for entries whose placement actually changed; unaffected entries do not carry an `outerNote` entry

---

## Part XIII — Import (Deserialisation)

### 1. Note deserialisation

#### 1.1 deserializeNoteInto — structure and identity

- **TC-13.1.1** — `deserializeNoteInto()` creates a note in the specified container
- **TC-13.1.2** — The imported note is assigned a new `Id` (not the original one)
- **TC-13.1.3** — The imported note has the same `Label` as the serialised source
- **TC-13.1.4** — The imported note has the same MIME type as the serialised source
- **TC-13.1.5** — Nested inner notes are imported and their nesting relationships are preserved

### 2. Link deserialisation

#### 2.1 deserializeLinkInto

- **TC-13.2.1** — `deserializeLinkInto()` creates a link in the specified container

### 3. Invalid input

#### 3.1 Guard on malformed data

- **TC-13.3.1** — Passing `null` or a non-object to `deserializeNoteInto()` throws an `SDS_Error` with `Code` `'invalid-argument'`

---

## Implementing the contract

Each backend package runs the shared test suite against its own `SDS_NoteStore`
implementation.  The test files (`SDS_NoteStore.construction.test.ts`, …) are
identical across backends; only the import path and any backend-specific
adaptations differ.

See each backend's `TestPlan.md` for:
- Which additional tests apply (e.g. canonical empty snapshot for json-joy)
- Which standard test cases behave differently and why
- How to run the tests for that specific backend
