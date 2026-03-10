/*******************************************************************************
*                                                                              *
*                      SDS_DataStore — Sync Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore }             from '../store/SDS_DataStore.js'
import type { SDS_Item }             from '../store/SDS_Item.js'
import type { SDS_ChangeSet }        from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore — Sync', () => {
  it('SY-01: two stores from same binary start identical', () => {
    const Store1 = SDS_DataStore.fromScratch()
    const Binary = Store1.asBinary()
    const Store2 = SDS_DataStore.fromBinary(Binary)
    expect(Store2.RootItem.Id).toBe(Store1.RootItem.Id)
    expect(Store2.TrashItem.Id).toBe(Store1.TrashItem.Id)
  })

  it('SY-02: exportPatch from Store1 applied to Store2 propagates mutation', () => {
    const Store1   = SDS_DataStore.fromScratch()
    const Binary   = Store1.asBinary()
    const Store2   = SDS_DataStore.fromBinary(Binary)

    const Item = Store1.newItemAt(undefined, Store1.RootItem)
    Item.Label     = 'synced data'

    const Patch    = Store1.exportPatch()
    Store2.applyRemotePatch(Patch)

    expect(Store2.EntryWithId(Item.Id)?.Label).toBe('synced data')
  })

  it('SY-03: merging patches from both stores preserves all changes', () => {
    const Store1   = SDS_DataStore.fromScratch()
    const Binary   = Store1.asBinary()
    const Store2   = SDS_DataStore.fromBinary(Binary)

    const Item1    = Store1.newItemAt(undefined, Store1.RootItem)
    Item1.Label    = 'from store 1'
    const Item2    = Store2.newItemAt(undefined, Store2.RootItem)
    Item2.Label    = 'from store 2'

    Store2.applyRemotePatch(Store1.exportPatch())
    Store1.applyRemotePatch(Store2.exportPatch())

    expect(Store1.EntryWithId(Item2.Id)).toBeDefined()
    expect(Store2.EntryWithId(Item1.Id)).toBeDefined()
  })

  it('SY-04: recoverOrphans on clean store is a no-op', () => {
    const Store = SDS_DataStore.fromScratch()
    const Before = Store.LostAndFoundItem.innerEntryList.length
    Store.recoverOrphans()
    expect(Store.LostAndFoundItem.innerEntryList.length).toBe(Before)
  })


  it('SY-05: orphaned entry rescued to LostAndFoundItem after remote peer purges its parent', () => {
    const StoreA    = SDS_DataStore.fromScratch()

    // StoreA creates Outer; record the cursor so we can export only the delta later
    const Outer     = StoreA.newItemAt(undefined, StoreA.RootItem)
    const CursorAfterCreate = StoreA.currentCursor

    // StoreB starts from the same snapshot (already knows about Outer)
    const StoreB    = SDS_DataStore.fromBinary(StoreA.asBinary())

    // StoreB creates Child inside Outer (local only; StoreA does not know about it)
    const OuterOnB  = StoreB.EntryWithId(Outer.Id) as SDS_Item
    const Child     = StoreB.newItemAt(undefined, OuterOnB)

    // StoreA deletes and purges Outer; Child's parent ceases to exist on StoreA
    StoreA.deleteEntry(Outer)
    StoreA.purgeEntry(Outer)

    // Export only the delta since the snapshot (delete+purge operations)
    // so StoreB doesn't re-process the createOuter it already has.
    // Note: json-joy's _gcTree may throw internally during purge application
    // when concurrent operations are present; applyRemotePatch handles this
    // gracefully — the CRDT state update completes before the exception fires.
    StoreB.applyRemotePatch(StoreA.exportPatch(CursorAfterCreate))

    // applyRemotePatch calls recoverOrphans() automatically, but we also call
    // it explicitly to match the documented test contract
    StoreB.recoverOrphans()
    expect(StoreB.EntryWithId(Child.Id)).toBeDefined()
    expect(StoreB.EntryWithId(Child.Id)?.outerItem?.Id).toBe(StoreB.LostAndFoundItem.Id)
  })

  it('SY-06: applyRemotePatch containing a move updates innerEntryList on the receiver', () => {
    const StoreA    = SDS_DataStore.fromScratch()
    const StoreB    = SDS_DataStore.fromBinary(StoreA.asBinary())

    const OuterItem = StoreA.newItemAt(undefined, StoreA.RootItem)
    const Item = StoreA.newItemAt(undefined, OuterItem)
    StoreA.moveEntryTo(Item, StoreA.RootItem)

    StoreB.applyRemotePatch(StoreA.exportPatch())

    // data must sit under RootItem on the receiver.
    expect(StoreB.EntryWithId(Item.Id)?.outerItem?.Id).toBe(StoreB.RootItem.Id)

    const RootChildIds = Array.from(StoreB.RootItem.innerEntryList).map(e => e.Id)
    expect(RootChildIds).toContain(Item.Id)

    const OuterItemOnB = StoreB.EntryWithId(OuterItem.Id) as SDS_Item
    const OuterItemChildIds = Array.from(OuterItemOnB.innerEntryList).map(e => e.Id)
    expect(OuterItemChildIds).not.toContain(Item.Id)
  })

  it('SY-07: applyRemotePatch containing a purge removes the entry from the receiver', () => {
    const StoreA = SDS_DataStore.fromScratch()
    const StoreB = SDS_DataStore.fromBinary(StoreA.asBinary())

    const Item = StoreA.newItemAt(undefined, StoreA.RootItem)
    StoreA.deleteEntry(Item)
    StoreA.purgeEntry(Item)

    StoreB.applyRemotePatch(StoreA.exportPatch())

    expect(StoreB.EntryWithId(Item.Id)).toBeUndefined()
    const TrashChildIds = Array.from(StoreB.TrashItem.innerEntryList).map(e => e.Id)
    expect(TrashChildIds).not.toContain(Item.Id)
  })

  it('SY-08: ChangeSet from applyRemotePatch records outerItem only for moved entries', () => {
    const StoreA     = SDS_DataStore.fromScratch()
    const StoreB     = SDS_DataStore.fromBinary(StoreA.asBinary())

    // bystander exists on StoreB before the remote patch arrives.
    const Bystander  = StoreB.newItemAt(undefined, StoreB.RootItem)

    // storeA creates a new data (not yet known to StoreB).
    const RemoteItem = StoreA.newItemAt(undefined, StoreA.RootItem)

    let ReceivedChangeSet:SDS_ChangeSet | undefined
    StoreB.onChangeInvoke((_Origin, ChangeSet) => { ReceivedChangeSet = ChangeSet })
    StoreB.applyRemotePatch(StoreA.exportPatch())

    // the newly arrived data must appear in the ChangeSet with outerItem.
    expect(ReceivedChangeSet?.[RemoteItem.Id]?.has('outerItem')).toBe(true)

    // RootItem gained an inner entry, so its innerEntryList must be in the ChangeSet.
    expect(ReceivedChangeSet?.[StoreB.RootItem.Id]?.has('innerEntryList')).toBe(true)

    // the bystander's placement did not change — no outerItem in its ChangeSet entry.
    expect(ReceivedChangeSet?.[Bystander.Id]?.has('outerItem')).toBeFalsy()
  })

  it('EV-10: Origin is external after applyRemotePatch', () => {
    const Store1   = SDS_DataStore.fromScratch()
    const Store2   = SDS_DataStore.fromBinary(Store1.asBinary())
    Store1.newItemAt(undefined, Store1.RootItem)
    const Patch    = Store1.exportPatch()
    const Handler  = vi.fn()
    Store2.onChangeInvoke(Handler)
    Store2.applyRemotePatch(Patch)
    expect(Handler.mock.calls[0][0]).toBe('external')
  })

  it('SY-09: dangling link target rescued to LostAndFound after remote peer purges it', () => {
    const StoreA            = SDS_DataStore.fromScratch()
    const Target            = StoreA.newItemAt(undefined, StoreA.RootItem)
    const CursorAfterCreate = StoreA.currentCursor
    const StoreB            = SDS_DataStore.fromBinary(StoreA.asBinary())
    const TargetOnB         = StoreB.EntryWithId(Target.Id) as SDS_Item
    StoreB.newLinkAt(TargetOnB, StoreB.RootItem)
    StoreA.deleteEntry(Target)
    StoreA.purgeEntry(Target)
    StoreB.applyRemotePatch(StoreA.exportPatch(CursorAfterCreate))

    const Rescued = StoreB.EntryWithId(Target.Id)
    expect(Rescued).toBeDefined()
    expect(Rescued?.isItem).toBe(true)
    expect(Rescued?.outerItem?.Id).toBe(StoreB.LostAndFoundItem.Id)
  })

  it('SY-10: applyRemotePatch with empty Uint8Array is a no-op', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Before = Array.from(Store.RootItem.innerEntryList).map(e => e.Id)
    expect(() => Store.applyRemotePatch(new Uint8Array(0))).not.toThrow()
    const After  = Array.from(Store.RootItem.innerEntryList).map(e => e.Id)
    expect(After).toEqual(Before)
  })

  it('JJ-SY-01: onApplyPatchError callback is not invoked during normal applyRemotePatch', () => {
    const ErrorHandler = vi.fn()
    const Store1 = SDS_DataStore.fromScratch({ onApplyPatchError: ErrorHandler })
    const Store2 = SDS_DataStore.fromBinary(Store1.asBinary())
    Store2.newItemAt(undefined, Store2.RootItem)
    Store1.applyRemotePatch(Store2.exportPatch())
    expect(ErrorHandler).not.toHaveBeenCalled()
  })
})
