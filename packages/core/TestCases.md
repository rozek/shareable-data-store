# Test Cases — SDS_NoteStore Contract

Shared test cases for all `@rozek/sds-core-*` backend packages.
Every backend must implement and pass every test case listed here.
Backend-specific additions are documented in each backend's own `TestCases.md`.

---

## SDS_Error.test.ts

| # | Test case | Expected result |
|---|---|---|
| E-01 | `new SDS_Error('foo', 'bar message')` | `err.Code === 'foo'`, `err.message === 'bar message'`, `err instanceof Error` |
| E-02 | `err.name` | `'SDS_Error'` |
| E-03 | `err instanceof SDS_Error` | `true` |

---

## SDS_NoteStore.construction.test.ts

| # | Test case | Expected result |
|---|---|---|
| C-01 | `fromScratch()` returns a store | instance of `SDS_NoteStore` |
| C-02 | fresh store has `RootNote` | `RootNote.Id === '00000000-0000-4000-8000-000000000000'` |
| C-03 | fresh store has `TrashNote` | `TrashNote.Id === '00000000-0000-4000-8000-000000000001'` |
| C-04 | fresh store has `LostAndFoundNote` | `LostAndFoundNote.Id === '00000000-0000-4000-8000-000000000002'` |
| C-05 | `asBinary()` returns `Uint8Array` | truthy, length > 0 |
| C-06 | `fromBinary(store.asBinary())` round-trips | new store has same RootNote.Id |
| C-07 | `asJSON()` returns a serialisable value | `JSON.stringify(asJSON())` does not throw |
| C-08 | `fromJSON(store.asJSON())` round-trips | new store has same RootNote.Id |
| C-09 | `fromScratch({ LiteralSizeLimit: 10 })` stores small strings as literal | `writeValue('hello')` → `ValueKind === 'literal'` |
| C-10 | `fromScratch({ LiteralSizeLimit: 3 })` stores longer strings as literal-reference | `writeValue('hello')` → `ValueKind === 'literal-reference'` |
| C-11 | two independent `fromScratch()` stores can exchange patches | `applyRemotePatch` does not throw; note created on StoreA appears on StoreB |

---

## SDS_NoteStore.wellKnown.test.ts

| # | Test case | Expected result |
|---|---|---|
| W-01 | `RootNote.isRootNote` | `true` |
| W-02 | `TrashNote.isTrashNote` | `true` |
| W-03 | `LostAndFoundNote.isLostAndFoundNote` | `true` |
| W-04 | `RootNote.isNote` | `true` |
| W-05 | `RootNote.outerNote` | `undefined` |
| W-06 | `TrashNote.outerNote` is RootNote | `TrashNote.outerNote?.Id === RootNote.Id` |
| W-07 | `LostAndFoundNote.outerNote` is RootNote | `LostAndFoundNote.outerNote?.Id === RootNote.Id` |
| W-08 | `RootNote.mayBeDeleted` | `false` |
| W-09 | `TrashNote.mayBeDeleted` | `false` |
| W-10 | `LostAndFoundNote.mayBeDeleted` | `false` |
| W-11 | `TrashNote.Label` default | `'trash'` |
| W-12 | `LostAndFoundNote.Label` default | `'lost-and-found'` |
| W-13 | rename `TrashNote` via setter | `TrashNote.Label = 'bin'` → `TrashNote.Label === 'bin'` |
| W-14 | `RootNote.innerEntryList` contains TrashNote and LostAndFoundNote | length ≥ 2, both IDs present |

---

## SDS_NoteStore.creation.test.ts

| # | Test case | Expected result |
|---|---|---|
| N-01 | `newNoteAt('text/plain', RootNote)` returns `SDS_Note` | `entry.isNote === true` |
| N-02 | note has correct MIME type | `note.Type === 'text/plain'` |
| N-03 | note appears in `RootNote.innerEntryList` | inner list contains note.Id |
| N-04 | note has `outerNote === RootNote` | `note.outerNote?.Id === RootNote.Id` |
| N-05 | `newLinkAt(target, RootNote)` returns `SDS_Link` | `entry.isLink === true` |
| N-06 | link has correct Target | `link.Target.Id === target.Id` |
| N-07 | link appears in `RootNote.innerEntryList` | inner list contains link.Id |
| N-08 | `EntryWithId(note.Id)` returns the note | `result?.Id === note.Id` |
| N-09 | `EntryWithId('nonexistent-id')` | `undefined` |
| N-10 | `newNoteAt` with invalid MIMEType (empty string) throws `SDS_Error('invalid-argument')` | throws with `Code === 'invalid-argument'` |
| N-11 | `newLinkAt` with non-existent target throws | throws `SDS_Error` |
| N-12 | `newNoteAt` with non-note container throws | throws `SDS_Error` |

---

## SDS_NoteStore.labelInfo.test.ts

| # | Test case | Expected result |
|---|---|---|
| L-01 | new note has empty Label | `note.Label === ''` |
| L-02 | `note.Label = 'My Note'` stores value | `note.Label === 'My Note'` |
| L-03 | Label change fires ChangeSet with `'Label'` | ChangeSet includes `note.Id → {'Label'}` |
| L-04 | `note.Info` is initially empty | `Object.keys(note.Info).length === 0` |
| L-05 | `note.Info['tag'] = 'important'` stores value | `note.Info['tag'] === 'important'` |
| L-06 | Info set fires ChangeSet with `'Info.tag'` | ChangeSet includes `note.Id → {'Info.tag'}` |
| L-07 | `delete note.Info['tag']` removes key | `note.Info['tag'] === undefined` |
| L-08 | Info delete fires ChangeSet with `'Info.tag'` | ChangeSet includes `note.Id → {'Info.tag'}` |
| L-09 | Label setter with non-string throws `SDS_Error('invalid-argument')` | throws |

---

## SDS_NoteStore.value.test.ts

| # | Test case | Expected result |
|---|---|---|
| V-01 | new note has `ValueKind === 'none'` | `true` |
| V-02 | `writeValue(undefined)` → `ValueKind === 'none'` | `true` |
| V-03 | `writeValue('hello')` (small) → `ValueKind === 'literal'` | `true` |
| V-04 | `readValue()` after small string write | resolves to `'hello'` |
| V-05 | `isLiteral` after string write | `true` |
| V-06 | `isBinary` after string write | `false` |
| V-07 | `writeValue(new Uint8Array([1,2,3]))` (≤2KB) → `ValueKind === 'binary'` | `true` |
| V-08 | `readValue()` after binary write | resolves to equal `Uint8Array` |
| V-09 | `isBinary` after binary write | `true` |
| V-10 | large string (> LiteralSizeLimit) → `ValueKind === 'literal-reference'` | `true` |
| V-11 | large binary (> 2KB) → `ValueKind === 'binary-reference'` | `true` |
| V-12 | `changeValue(0, 5, 'Bye')` on literal replaces range | `readValue()` reflects splice |
| V-13 | `changeValue()` on non-literal throws `SDS_Error('change-value-not-literal')` | throws |
| V-14 | value change fires ChangeSet with `'Value'` | ChangeSet includes `note.Id → {'Value'}` |
| V-15 | `writeValue(undefined)` on existing value → `ValueKind === 'none'` | `true` |

---

## SDS_NoteStore.ordering.test.ts

| # | Test case | Expected result |
|---|---|---|
| O-01 | three notes created without InsertionIndex appear in creation order | `list[0]`, `list[1]`, `list[2]` by creation |
| O-02 | `newNoteAt('text/plain', root, 0)` inserts at index 0 | first in list |
| O-03 | `newNoteAt('text/plain', root, 1)` inserts at index 1 | second in list |
| O-04 | inserting beyond list length appends at end | last in list |
| O-05 | `innerEntryList.length` reflects actual inner-entry count | equals number of inner entries added |
| O-06 | `innerEntryList` is iterable (for…of) | iterates all inner entries |
| O-07 | `innerEntryList[0]` returns first inner entry | correct entry |

---

## SDS_NoteStore.move.test.ts

| # | Test case | Expected result |
|---|---|---|
| M-01 | `moveEntryTo(note, otherNote)` moves to new container | `note.outerNote?.Id === otherNote.Id` |
| M-02 | moved note appears in target's `innerEntryList` | target list contains note |
| M-03 | moved note is removed from source's `innerEntryList` | source list no longer contains note |
| M-04 | `moveEntryTo` fires ChangeSet with `'outerNote'` for entry, `'innerEntryList'` for old and new containers | all three entries in ChangeSet |
| M-05 | `mayBeMovedTo` returns `true` for a valid move | `true` |
| M-06 | `mayBeMovedTo` returns `false` when Container is a descendant (cycle) | `false` |
| M-07 | `moveEntryTo` into descendant throws `SDS_Error('move-would-cycle')` | throws |
| M-08 | TrashNote `mayBeMovedTo(RootNote)` → `true` | `true` |
| M-09 | TrashNote `mayBeMovedTo(innerNote)` → `false` | `false` |
| M-10 | RootNote cannot be moved | `mayBeMovedTo(…)` returns `false` |
| M-11 | `moveEntryTo(note, container, 0)` inserts at position 0 | first in container |
| M-12 | `note.moveTo(container)` is equivalent to `store.moveEntryTo(note, container)` | same result |

---

## SDS_NoteStore.delete.test.ts

| # | Test case | Expected result |
|---|---|---|
| D-01 | `deleteEntry(note)` moves note to TrashNote | `note.outerNote?.Id === TrashNote.Id` |
| D-02 | deleted note's children are also in TrashNote | all descendants have outerNote chain leading to Trash |
| D-03 | `deleteEntry` fires ChangeSet with `'outerNote'` and `'innerEntryList'` | both present |
| D-04 | `deleteEntry(RootNote)` throws `SDS_Error('delete-not-permitted')` | throws |
| D-05 | `deleteEntry(TrashNote)` throws | throws |
| D-06 | `deleteEntry(LostAndFoundNote)` throws | throws |
| D-07 | `purgeEntry(note)` on note not in TrashNote throws `SDS_Error('purge-not-in-trash')` | throws |
| D-08 | `purgeEntry(note)` on note in TrashNote removes it | `EntryWithId(note.Id) === undefined` |
| D-09 | `purgeEntry(note)` when note has incoming link from RootNote tree → throws `purge-protected` | `SDS_Error({ Code:'purge-protected' })`; entry still exists |
| D-12 | `note.delete()` equivalent to `store.deleteEntry(note)` | note in Trash |
| D-13 | `note.purge()` throws if note not in Trash | `SDS_Error('purge-not-in-trash')` |
| D-14 | `deleteEntry` records `_trashedAt` in `Info` as a number ≥ time before the call | `typeof note.Info['_trashedAt'] === 'number'`; value ≥ `Before` |
| D-15 | `purgeExpiredTrashEntries(60_000)` purges entry trashed 90 s ago | returns 1; `EntryWithId(Note.Id) === undefined` |
| D-16 | `purgeExpiredTrashEntries(86_400_000)` skips entry trashed just now | returns 0; entry still present |
| D-17 | `purgeExpiredTrashEntries(0)` skips entry moved to Trash without `_trashedAt` | returns 0; entry still present |
| D-18 | `purgeExpiredTrashEntries(60_000)` silently skips protected entry trashed 90 s ago | does not throw; returns 0; entry still present |
| D-19 | `purgeExpiredTrashEntries(60_000)` returns 2 when two entries are both expired | returns 2 |
| D-20 | `dispose()` stops the auto-purge timer | spy called once before dispose; still called only once after 2 s more |
| D-21 | auto-purge timer calls `purgeExpiredTrashEntries` when `TrashTTLms` is configured | entry expired 90 s ago is absent after one check interval |

---

## SDS_NoteStore.serialization.test.ts

| # | Test case | Expected result |
|---|---|---|
| S-01 | `asBinary()` starts with gzip magic bytes (0x1f, 0x8b) | first two bytes match |
| S-02 | `fromBinary(store.asBinary())` round-trips all notes | all IDs match |
| S-03 | round-tripped store has same Label values | Labels equal |
| S-04 | round-tripped store has same innerEntryList order | inner-entry order preserved |
| S-05 | round-tripped store preserves literal value | `readValue()` returns same string |
| S-06 | round-tripped store preserves binary value | `readValue()` returns equal `Uint8Array` |
| S-07 | `fromJSON(store.asJSON())` round-trips | all IDs match |
| S-08 | binary round-trip of store with nested notes | deeply nested structure preserved |

---

## SDS_NoteStore.events.test.ts

| # | Test case | Expected result |
|---|---|---|
| EV-01 | `onChangeInvoke` callback fires after `newNoteAt` | called once |
| EV-02 | ChangeSet contains entry for new note and for RootNote | both present |
| EV-03 | ChangeSet for new note contains `'outerNote'` | present |
| EV-04 | ChangeSet for RootNote contains `'innerEntryList'` | present |
| EV-05 | `onChangeInvoke` returns unsubscribe function | calling it stops delivery |
| EV-06 | after unsubscribe, callback is not called on next mutation | not called |
| EV-07 | multiple handlers all receive the event | both called |
| EV-08 | nested `transact()` emits only one ChangeSet event | callback called once |
| EV-09 | Origin is `'internal'` for local mutations | `Origin === 'internal'` |
| EV-10 | Origin is `'external'` after `applyRemotePatch` | `Origin === 'external'` |

---

## SDS_NoteStore.sync.test.ts

| # | Test case | Expected result |
|---|---|---|
| SY-01 | two stores created from same `asBinary()` start identical | both have same entry count |
| SY-02 | mutation on store A → `exportPatch()` → `applyRemotePatch()` on store B | B now contains the change |
| SY-03 | `applyRemotePatch` on store A of patch from store B merges without loss | both stores have both changes |
| SY-04 | `recoverOrphans()` on a clean store is a no-op | no extra entries in LostAndFoundNote |
| SY-05 | after applying a patch whose note was purged on another peer → orphaned entry rescued to LostAndFoundNote | entry's outerNote is LostAndFoundNote |
| SY-06 | `applyRemotePatch` containing a move: `outerNote` and both containers' `innerEntryList` correct on receiver | moved entry in new container, absent from old container |
| SY-07 | `applyRemotePatch` containing a purge: entry absent from receiver and from `TrashNote.innerEntryList` | `EntryWithId` returns `undefined`; Trash list does not contain the Id |
| SY-08 | ChangeSet from `applyRemotePatch` records `outerNote` only for entries whose placement changed | new entry has `outerNote`; unaffected bystander does not |

---

## SDS_NoteStore.import.test.ts

| # | Test case | Expected result |
|---|---|---|
| I-01 | `deserializeNoteInto(note.asJSON(), RootNote)` imports the note | new note in RootNote's inner list |
| I-02 | imported note gets a new Id | different from original |
| I-03 | imported note has same Label | Labels equal |
| I-04 | imported note has same MIME type | Types equal |
| I-05 | nested notes are imported with their structure | inner-entry count matches |
| I-06 | `deserializeLinkInto(link.asJSON(), RootNote)` imports the link | new link in RootNote's inner list |
| I-07 | invalid serialisation throws `SDS_Error('invalid-argument')` | throws |
