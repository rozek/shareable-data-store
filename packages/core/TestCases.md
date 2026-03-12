# Test Cases — SDS_DataStore Contract

Shared test cases for all `@rozek/sds-core-*` backend packages.
Every backend must implement and pass every test case listed here.
Backend-specific additions are documented in each backend's own `TestCases.md`.

---

## SDS_Error.test.ts

| # | Test case | Expected result |
|---|---|---|
| E-01 | `new SDS_Error('foo', 'bar message')` | `err.code === 'foo'`, `err.message === 'bar message'`, `err instanceof Error` |
| E-02 | `err.name` | `'SDS_Error'` |
| E-03 | `err instanceof SDS_Error` | `true` |

---

## SDS_DataStore.construction.test.ts

| # | Test case | Expected result |
|---|---|---|
| C-01 | `fromScratch()` returns a store | instance of `SDS_DataStore` |
| C-02 | fresh store has `RootItem` | `RootItem.Id === '00000000-0000-4000-8000-000000000000'` |
| C-03 | fresh store has `TrashItem` | `TrashItem.Id === '00000000-0000-4000-8000-000000000001'` |
| C-04 | fresh store has `LostAndFoundItem` | `LostAndFoundItem.Id === '00000000-0000-4000-8000-000000000002'` |
| C-05 | `asBinary()` returns `Uint8Array` | truthy, length > 0 |
| C-06 | `fromBinary(store.asBinary())` round-trips | new store has same RootItem.Id |
| C-07 | `asJSON()` returns a serialisable value | `JSON.stringify(asJSON())` does not throw |
| C-08 | `fromJSON(store.asJSON())` round-trips | new store has same RootItem.Id |
| C-09 | `fromScratch({ LiteralSizeLimit: 10 })` stores small strings as literal | `writeValue('hello')` → `ValueKind === 'literal'` |
| C-10 | `fromScratch({ LiteralSizeLimit: 3 })` stores longer strings as literal-reference | `writeValue('hello')` → `ValueKind === 'literal-reference'` |
| C-11 | two independent `fromScratch()` stores can exchange patches | `applyRemotePatch` does not throw; data created on StoreA appears on StoreB |

---

## SDS_DataStore.wellKnown.test.ts

| # | Test case | Expected result |
|---|---|---|
| W-01 | `RootItem.isRootItem` | `true` |
| W-02 | `TrashItem.isTrashItem` | `true` |
| W-03 | `LostAndFoundItem.isLostAndFoundItem` | `true` |
| W-04 | `RootItem.isItem` | `true` |
| W-05 | `RootItem.outerItem` | `undefined` |
| W-06 | `TrashItem.outerItem` is RootItem | `TrashItem.outerItem?.Id === RootItem.Id` |
| W-07 | `LostAndFoundItem.outerItem` is RootItem | `LostAndFoundItem.outerItem?.Id === RootItem.Id` |
| W-08 | `RootItem.mayBeDeleted` | `false` |
| W-09 | `TrashItem.mayBeDeleted` | `false` |
| W-10 | `LostAndFoundItem.mayBeDeleted` | `false` |
| W-11 | `TrashItem.Label` default | `'trash'` |
| W-12 | `LostAndFoundItem.Label` default | `'lost-and-found'` |
| W-13 | rename `TrashItem` via setter | `TrashItem.Label = 'bin'` → `TrashItem.Label === 'bin'` |
| W-14 | `RootItem.innerEntryList` contains TrashItem and LostAndFoundItem | length ≥ 2, both IDs present |

---

## SDS_DataStore.creation.test.ts

| # | Test case | Expected result |
|---|---|---|
| N-01 | `newItemAt('text/plain', RootItem)` returns `SDS_Item` | `entry.isItem === true` |
| N-02 | data has correct MIME type | `data.Type === 'text/plain'` |
| N-03 | data appears in `RootItem.innerEntryList` | inner list contains data.Id |
| N-04 | data has `outerItem === RootItem` | `data.outerItem?.Id === RootItem.Id` |
| N-05 | `newLinkAt(target, RootItem)` returns `SDS_Link` | `entry.isLink === true` |
| N-06 | link has correct Target | `link.Target.Id === target.Id` |
| N-07 | link appears in `RootItem.innerEntryList` | inner list contains link.Id |
| N-08 | `EntryWithId(data.Id)` returns the data | `result?.Id === data.Id` |
| N-09 | `EntryWithId('nonexistent-id')` | `undefined` |
| N-10 | `newItemAt` with invalid MIMEType (empty string) throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| N-11 | `newLinkAt` with non-existent target throws | throws `SDS_Error` |
| N-12 | `newItemAt` with `null` outerItem throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| N-13 | `newLinkAt` with `null` Target throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| N-14 | `newLinkAt` with a link (not an item) as target throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| N-15 | `newItemAt` with MIMEType exceeding `maxMIMETypeLength` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| N-16 | `item.Type` setter with MIMEType exceeding `maxMIMETypeLength` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |

---

## SDS_DataStore.labelInfo.test.ts

| # | Test case | Expected result |
|---|---|---|
| L-01 | new data has empty Label | `data.Label === ''` |
| L-02 | `data.Label = 'My Data'` stores value | `data.Label === 'My Data'` |
| L-03 | Label change fires ChangeSet with `'Label'` | ChangeSet includes `data.Id → {'Label'}` |
| L-04 | `data.Info` is initially empty | `Object.keys(data.Info).length === 0` |
| L-05 | `data.Info['tag'] = 'important'` stores value | `data.Info['tag'] === 'important'` |
| L-06 | Info set fires ChangeSet with `'Info.tag'` | ChangeSet includes `data.Id → {'Info.tag'}` |
| L-07 | `delete data.Info['tag']` removes key | `data.Info['tag'] === undefined` |
| L-08 | Info delete fires ChangeSet with `'Info.tag'` | ChangeSet includes `data.Id → {'Info.tag'}` |
| L-09 | deleting the last Info key removes the Info node; proxy still returns `{}` and writing afterwards works | `Object.keys(Info).length === 0`; subsequent write succeeds |
| L-10 | `Label` setter with non-string argument throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| L-11 | assigning `undefined` to an Info key deletes the key | key absent from `Object.keys(Info)` afterwards |
| L-12 | Info value whose UTF-8 JSON representation is exactly `maxInfoValueSize` bytes is accepted | no error thrown; value stored and readable |
| L-13 | Info value whose UTF-8 JSON representation exceeds `maxInfoValueSize` bytes throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| L-14 | `Label` setter with a string exceeding `maxLabelLength` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| L-15 | Info key exceeding `maxInfoKeyLength` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| L-16 | empty Info key (`''`) throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| L-17 | non-JSON-serialisable Info value (function) throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |

---

## SDS_DataStore.value.test.ts

| # | Test case | Expected result |
|---|---|---|
| V-01 | new data has `ValueKind === 'none'` | `true` |
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
| V-14 | value change fires ChangeSet with `'Value'` | ChangeSet includes `data.Id → {'Value'}` |
| V-15 | `writeValue(undefined)` on existing value → `ValueKind === 'none'` | `true` |
| V-16 | `writeValue` with a wrong-type argument (e.g. `42`) throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| V-17 | large string round-trip: `readValue()` after `writeValue(string > LiteralSizeLimit)` returns the full string | resolves to original string |
| V-18 | large binary round-trip: `readValue()` after `writeValue(Uint8Array > 2KB)` returns the full `Uint8Array` | resolves to equal bytes |
| V-19 | `changeValue(-1, 2, 'x')` — negative `fromIndex` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| V-20 | `changeValue(3, 2, 'x')` — `toIndex < fromIndex` throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |
| V-21 | `changeValue(0, 2, 42)` — non-string replacement throws `SDS_Error('invalid-argument')` | throws with `code === 'invalid-argument'` |

---

## SDS_DataStore.ordering.test.ts

| # | Test case | Expected result |
|---|---|---|
| O-01 | three items created without InsertionIndex appear in creation order | `list[0]`, `list[1]`, `list[2]` by creation |
| O-02 | `newItemAt('text/plain', root, 0)` inserts at index 0 | first in list |
| O-03 | `newItemAt('text/plain', root, 1)` inserts at index 1 | second in list |
| O-04 | inserting beyond list length appends at end | last in list |
| O-05 | `innerEntryList.length` reflects actual inner-entry count | equals number of inner entries added |
| O-06 | `innerEntryList` is iterable (for…of) | iterates all inner entries |
| O-07 | `innerEntryList[0]` returns first inner entry | correct entry |

---

## SDS_DataStore.move.test.ts

| # | Test case | Expected result |
|---|---|---|
| M-01 | `moveEntryTo(data, otherData)` moves to new container | `data.outerItem?.Id === otherData.Id` |
| M-02 | moved data appears in target's `innerEntryList` | target list contains data |
| M-03 | moved data is removed from source's `innerEntryList` | source list no longer contains data |
| M-04 | `moveEntryTo` fires ChangeSet with `'outerItem'` for entry, `'innerEntryList'` for old and new containers | all three entries in ChangeSet |
| M-05 | `mayBeMovedTo` returns `true` for a valid move | `true` |
| M-06 | `mayBeMovedTo` returns `false` when Container is a descendant (cycle) | `false` |
| M-07 | `moveEntryTo` into descendant throws `SDS_Error('move-would-cycle')` | throws |
| M-08 | TrashItem `mayBeMovedTo(RootItem)` → `true` | `true` |
| M-09 | TrashItem `mayBeMovedTo(innerItem)` → `false` | `false` |
| M-10 | RootItem cannot be moved | `mayBeMovedTo(…)` returns `false` |
| M-11 | `moveEntryTo(data, container, 0)` inserts at position 0 | first in container |
| M-12 | `data.moveTo(container)` is equivalent to `store.moveEntryTo(data, container)` | same result |

---

## SDS_DataStore.delete.test.ts

| # | Test case | Expected result |
|---|---|---|
| D-01 | `deleteEntry(data)` moves data to TrashItem | `data.outerItem?.Id === TrashItem.Id` |
| D-02 | deleted data's children are also in TrashItem | all descendants have outerItem chain leading to Trash |
| D-03 | `deleteEntry` fires ChangeSet with `'outerItem'` and `'innerEntryList'` | both present |
| D-04 | `deleteEntry(RootItem)` throws `SDS_Error('delete-not-permitted')` | throws |
| D-05 | `deleteEntry(TrashItem)` throws | throws |
| D-06 | `deleteEntry(LostAndFoundItem)` throws | throws |
| D-07 | `purgeEntry(data)` on data not in TrashItem throws `SDS_Error('purge-not-in-trash')` | throws |
| D-08 | `purgeEntry(data)` on data in TrashItem removes it | `EntryWithId(data.Id) === undefined` |
| D-09 | `purgeEntry(data)` when data has incoming link from RootItem tree → throws `purge-protected` | `SDS_Error({ Code:'purge-protected' })`; entry still exists |
| D-12 | `data.delete()` equivalent to `store.deleteEntry(data)` | data in Trash |
| D-13 | `data.purge()` throws if data not in Trash | `SDS_Error('purge-not-in-trash')` |
| D-14 | `deleteEntry` records `_trashedAt` in `Info` as a number ≥ time before the call | `typeof data.Info['_trashedAt'] === 'number'`; value ≥ `Before` |
| D-15 | `purgeExpiredTrashEntries(60_000)` purges entry trashed 90 s ago | returns 1; `EntryWithId(Data.Id) === undefined` |
| D-16 | `purgeExpiredTrashEntries(86_400_000)` skips entry trashed just now | returns 0; entry still present |
| D-17 | `purgeExpiredTrashEntries(0)` skips entry moved to Trash without `_trashedAt` | returns 0; entry still present |
| D-18 | `purgeExpiredTrashEntries(60_000)` silently skips protected entry trashed 90 s ago | does not throw; returns 0; entry still present |
| D-19 | `purgeExpiredTrashEntries(60_000)` returns 2 when two entries are both expired | returns 2 |
| D-20 | `dispose()` stops the auto-purge timer | spy called once before dispose; still called only once after 2 s more |
| D-21 | auto-purge timer calls `purgeExpiredTrashEntries` when `TrashTTLms` is configured | entry expired 90 s ago is absent after one check interval |
| D-22 | moving an entry out of TrashItem removes `Info._trashedAt` | `data.Info['_trashedAt'] === undefined` after `moveEntryTo(data, RootItem)` |

---

## SDS_DataStore.serialization.test.ts

| # | Test case | Expected result |
|---|---|---|
| S-01 | `asBinary()` starts with gzip magic bytes (0x1f, 0x8b) | first two bytes match |
| S-02 | `fromBinary(store.asBinary())` round-trips all items | all IDs match |
| S-03 | round-tripped store has same Label values | Labels equal |
| S-04 | round-tripped store has same innerEntryList order | inner-entry order preserved |
| S-05 | round-tripped store preserves literal value | `readValue()` returns same string |
| S-06 | round-tripped store preserves binary value | `readValue()` returns equal `Uint8Array` |
| S-07 | `fromJSON(store.asJSON())` round-trips — preserves all entry IDs | item created before serialisation is found by original Id in restored store |
| S-08 | binary round-trip of store with nested items | deeply nested structure preserved |
| S-09 | `asJSON()` returns a plain JS object | `typeof store.asJSON() === 'object'`; `Kind === 'item'` |
| S-10 | `fromJSON(store.asJSON())` preserves literal value | `readValue()` returns same string after JSON round-trip |
| S-11 | `fromJSON(store.asJSON())` preserves binary value | `readValue()` returns equal `Uint8Array` after JSON round-trip |

---

## SDS_DataStore.events.test.ts

| # | Test case | Expected result |
|---|---|---|
| EV-01 | `onChangeInvoke` callback fires after `newItemAt` | called once |
| EV-02 | ChangeSet contains entry for new data and for RootItem | both present |
| EV-03 | ChangeSet for new data contains `'outerItem'` | present |
| EV-04 | ChangeSet for RootItem contains `'innerEntryList'` | present |
| EV-05 | `onChangeInvoke` returns unsubscribe function | calling it stops delivery |
| EV-06 | after unsubscribe, callback is not called on next mutation | not called |
| EV-07 | multiple handlers all receive the event | both called |
| EV-08 | nested `transact()` emits only one ChangeSet event | callback called once |
| EV-09 | Origin is `'internal'` for local mutations | `Origin === 'internal'` |
| EV-10 | Origin is `'external'` after `applyRemotePatch` | `Origin === 'external'` |

---

## SDS_DataStore.sync.test.ts

| # | Test case | Expected result |
|---|---|---|
| SY-01 | two stores created from same `asBinary()` start identical | both have same entry count |
| SY-02 | mutation on store A → `exportPatch()` → `applyRemotePatch()` on store B | B now contains the change |
| SY-03 | `applyRemotePatch` on store A of patch from store B merges without loss | both stores have both changes |
| SY-04 | `recoverOrphans()` on a clean store is a no-op | no extra entries in LostAndFoundItem |
| SY-05 | after applying a patch whose data was purged on another peer → orphaned entry rescued to LostAndFoundItem | entry's outerItem is LostAndFoundItem |
| SY-06 | `applyRemotePatch` containing a move: `outerItem` and both containers' `innerEntryList` correct on receiver | moved entry in new container, absent from old container |
| SY-07 | `applyRemotePatch` containing a purge: entry absent from receiver and from `TrashItem.innerEntryList` | `EntryWithId` returns `undefined`; Trash list does not contain the Id |
| SY-08 | ChangeSet from `applyRemotePatch` records `outerItem` only for entries whose placement changed | new entry has `outerItem`; unaffected bystander does not |
| SY-09 | link whose target was purged by a remote peer → placeholder item for that target in `LostAndFoundItem` | `EntryWithId(Target.Id)` is defined; `isItem` is `true`; `outerItem.Id === LostAndFoundItem.Id` |
| SY-10 | `applyRemotePatch(new Uint8Array(0))` is a no-op — store is unchanged and no exception is thrown | store state identical before and after; no throw |

---

## SDS_DataStore.import.test.ts

| # | Test case | Expected result |
|---|---|---|
| I-01 | `deserializeItemInto(data.asJSON(), RootItem)` imports the data | new data in RootItem's inner list |
| I-02 | imported data gets a new Id | different from original |
| I-03 | imported data has same Label | Labels equal |
| I-04 | imported data has same MIME type | Types equal |
| I-05 | nested items are imported with their structure | inner-entry count matches |
| I-06 | `deserializeLinkInto(link.asJSON(), RootItem)` imports the link | new link in RootItem's inner list |
| I-07 | invalid serialisation throws `SDS_Error('invalid-argument')` | throws |
| I-08 | imported item preserves literal value | `readValue()` returns same string as in source item |
