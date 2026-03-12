/*******************************************************************************
*                                                                              *
*                      SDS_DataStore — Move Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore } from '../store/SDS_DataStore.js'
import { SDS_Error }     from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore — Move', () => {

  it('M-01: moveEntryTo updates outerItem', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target = Store.newItemAt(undefined, Store.RootItem)
    Store.moveEntryTo(Item, Target)
    expect(Item.outerItem?.Id).toBe(Target.Id)
  })

  it('M-02: moved data appears in target innerEntryList', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target = Store.newItemAt(undefined, Store.RootItem)
    Store.moveEntryTo(Item, Target)
    const Ids = Array.from(Target.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Item.Id)
  })

  it('M-03: moved data removed from source innerEntryList', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target = Store.newItemAt(undefined, Store.RootItem)
    Store.moveEntryTo(Item, Target)
    const Ids = Array.from(Store.RootItem.innerEntryList).map((e) => e.Id)
    expect(Ids).not.toContain(Item.Id)
  })

  it('M-04: moveEntryTo fires ChangeSet with outerItem and innerEntryList', () => {
    const Store   = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target  = Store.newItemAt(undefined, Store.RootItem)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.moveEntryTo(Item, Target)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Item.Id]?.has('outerItem')).toBe(true)
    expect(ChangeSet[Target.Id]?.has('innerEntryList')).toBe(true)
    expect(ChangeSet[Store.RootItem.Id]?.has('innerEntryList')).toBe(true)
  })

  it('M-05: mayBeMovedTo returns true for valid move', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target = Store.newItemAt(undefined, Store.RootItem)
    expect(Item.mayBeMovedTo(Target)).toBe(true)
  })

  it('M-06: mayBeMovedTo returns false when Container is descendant (cycle)', () => {
    const Store  = SDS_DataStore.fromScratch()
    const OuterItem = Store.newItemAt(undefined, Store.RootItem)
    const InnerItem = Store.newItemAt(undefined, OuterItem)
    expect(OuterItem.mayBeMovedTo(InnerItem)).toBe(false)
  })

  it('M-07: moveEntryTo into descendant throws move-would-cycle', () => {
    const Store  = SDS_DataStore.fromScratch()
    const OuterItem = Store.newItemAt(undefined, Store.RootItem)
    const InnerItem = Store.newItemAt(undefined, OuterItem)
    expect(() => Store.moveEntryTo(OuterItem, InnerItem)).toThrowError(
      expect.objectContaining({ code:'move-would-cycle' })
    )
  })

  it('M-08: TrashItem mayBeMovedTo(RootItem) returns true', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store.TrashItem.mayBeMovedTo(Store.RootItem)).toBe(true)
  })

  it('M-09: TrashItem mayBeMovedTo(innerItem) returns false', () => {
    const Store = SDS_DataStore.fromScratch()
    const InnerItem = Store.newItemAt(undefined, Store.RootItem)
    expect(Store.TrashItem.mayBeMovedTo(InnerItem)).toBe(false)
  })

  it('M-10: RootItem cannot be moved anywhere', () => {
    const Store = SDS_DataStore.fromScratch()
    const Dest  = Store.newItemAt(undefined, Store.RootItem)
    expect(Store.RootItem.mayBeMovedTo(Dest)).toBe(false)
  })

  it('M-11: moveEntryTo with InsertionIndex 0 inserts at front', () => {
    const Store   = SDS_DataStore.fromScratch()
    const OuterItem = Store.newItemAt(undefined, Store.RootItem)
    const Existing = Store.newItemAt(undefined, OuterItem)
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.moveEntryTo(Item, OuterItem, 0)
    const InnerEntries = Array.from(OuterItem.innerEntryList).map((e) => e.Id)
    expect(InnerEntries[0]).toBe(Item.Id)
  })

  it('M-12: data.moveTo(container) is equivalent to store.moveEntryTo', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Target = Store.newItemAt(undefined, Store.RootItem)
    Item.moveTo(Target)
    expect(Item.outerItem?.Id).toBe(Target.Id)
  })
})
