/*******************************************************************************
*                                                                              *
*                    SDS_DataStore — Delete & Purge Tests                      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SDS_DataStore } from '../store/SDS_DataStore.js'
import { SDS_Error }     from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore — Delete & Purge', () => {

  it('D-01: deleteEntry moves data to TrashItem', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.deleteEntry(Item)
    expect(Item.outerItem?.Id).toBe(Store.TrashItem.Id)
  })

  it('D-02: deleted data\'s children are also in trash hierarchy', () => {
    const Store  = SDS_DataStore.fromScratch()
    const OuterItem = Store.newItemAt(undefined, Store.RootItem)
    const InnerItem = Store.newItemAt(undefined, OuterItem)
    Store.deleteEntry(OuterItem)
    // OuterItem should be directly in Trash
    expect(OuterItem.outerItem?.Id).toBe(Store.TrashItem.Id)
    // InnerItem should still be inside OuterItem (deleteEntry only moves the top)
    expect(InnerItem.outerItem?.Id).toBe(OuterItem.Id)
  })

  it('D-03: deleteEntry fires ChangeSet with outerItem and innerEntryList', () => {
    const Store   = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.deleteEntry(Item)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Item.Id]?.has('outerItem')).toBe(true)
    expect(ChangeSet[Store.TrashItem.Id]?.has('innerEntryList')).toBe(true)
  })

  it('D-04: deleteEntry(RootItem) throws delete-not-permitted', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.deleteEntry(Store.RootItem)).toThrowError(
      expect.objectContaining({ code:'delete-not-permitted' })
    )
  })

  it('D-05: deleteEntry(TrashItem) throws', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.deleteEntry(Store.TrashItem)).toThrowError(
      expect.objectContaining({ code:'delete-not-permitted' })
    )
  })

  it('D-06: deleteEntry(LostAndFoundItem) throws', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.deleteEntry(Store.LostAndFoundItem)).toThrowError(
      expect.objectContaining({ code:'delete-not-permitted' })
    )
  })

  it('D-07: purgeEntry on data not in TrashItem throws purge-not-in-trash', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(() => Store.purgeEntry(Item)).toThrowError(
      expect.objectContaining({ code:'purge-not-in-trash' })
    )
  })

  it('D-08: purgeEntry removes data from store', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.deleteEntry(Item)
    Store.purgeEntry(Item)
    expect(Store.EntryWithId(Item.Id)).toBeUndefined()
  })

  it('D-09: purgeEntry throws purge-protected when data has incoming link from RootItem tree', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.newLinkAt(Item, Store.RootItem)   // link in root tree points to Data
    Store.deleteEntry(Item)                  // Data is in Trash
    expect(() => Store.purgeEntry(Item)).toThrowError(
      expect.objectContaining({ code:'purge-protected' })
    )
    expect(Store.EntryWithId(Item.Id)).toBeDefined()  // still exists
  })

  it('D-12: data.delete() equivalent to store.deleteEntry(data)', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.delete()
    expect(Item.outerItem?.Id).toBe(Store.TrashItem.Id)
  })

  it('D-13: data.purge() throws if data not in Trash', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(() => Item.purge()).toThrowError(
      expect.objectContaining({ code:'purge-not-in-trash' })
    )
  })

  // ---------------------------------------------------------------------------
  // D-14 … D-21: Trash TTL / auto-purge
  // ---------------------------------------------------------------------------

  it('D-14: deleteEntry records _trashedAt in Info with a timestamp ≥ the time before the call', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Before = Date.now()
    Store.deleteEntry(Item)
    const TrashedAt = Item.Info['_trashedAt'] as number
    expect(typeof TrashedAt).toBe('number')
    expect(TrashedAt).toBeGreaterThanOrEqual(Before)
  })

  it('D-15: purgeExpiredTrashEntries purges entries whose _trashedAt exceeds the TTL', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_DataStore.fromScratch()
      const Item = Store.newItemAt(undefined, Store.RootItem)
      vi.setSystemTime(new Date(Date.now() - 90_000))  // 90 s in the past
      Store.deleteEntry(Item)
      vi.setSystemTime(new Date(Date.now() + 90_000))  // restore to now

      const Count = Store.purgeExpiredTrashEntries(60_000)  // TTL = 60 s
      expect(Count).toBe(1)
      expect(Store.EntryWithId(Item.Id)).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-16: purgeExpiredTrashEntries skips entries whose _trashedAt is within the TTL', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.deleteEntry(Item)  // _trashedAt ≈ now

    const Count = Store.purgeExpiredTrashEntries(86_400_000)  // TTL = 1 day
    expect(Count).toBe(0)
    expect(Store.EntryWithId(Item.Id)).toBeDefined()
  })

  it('D-17: purgeExpiredTrashEntries skips entries without _trashedAt', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    // Move to Trash without going through deleteEntry (bypasses _trashedAt recording)
    Store.moveEntryTo(Item, Store.TrashItem)

    const Count = Store.purgeExpiredTrashEntries(0)  // TTL = 0 ms (everything expired)
    expect(Count).toBe(0)
    expect(Store.EntryWithId(Item.Id)).toBeDefined()
  })

  it('D-18: purgeExpiredTrashEntries silently skips protected entries', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_DataStore.fromScratch()
      const Item = Store.newItemAt(undefined, Store.RootItem)
      Store.newLinkAt(Item, Store.RootItem)  // link in root tree → Data is protected

      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(Item)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      expect(() => Store.purgeExpiredTrashEntries(60_000)).not.toThrow()
      const Count = Store.purgeExpiredTrashEntries(60_000)
      expect(Count).toBe(0)
      expect(Store.EntryWithId(Item.Id)).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-19: purgeExpiredTrashEntries returns the count of purged entries', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_DataStore.fromScratch()
      const ItemA = Store.newItemAt(undefined, Store.RootItem)
      const ItemB = Store.newItemAt(undefined, Store.RootItem)
      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(ItemA)
      Store.deleteEntry(ItemB)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      const Count = Store.purgeExpiredTrashEntries(60_000)
      expect(Count).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-20: dispose() stops the auto-purge timer', () => {
    vi.useFakeTimers()
    const purgeSpy = vi.fn()
    try {
      const Store = SDS_DataStore.fromScratch({ TrashTTLms:1_000, TrashCheckIntervalMs:500 })
      // Monkey-patch to count calls from the timer
      const orig = Store.purgeExpiredTrashEntries.bind(Store)
      ;(Store as any).purgeExpiredTrashEntries = (...args: any[]) => {
        purgeSpy()
        return orig(...args)
      }

      vi.advanceTimersByTime(600)   // first interval fires → spy called once
      expect(purgeSpy).toHaveBeenCalledTimes(1)

      Store.dispose()               // stop the timer

      vi.advanceTimersByTime(2_000) // no more intervals should fire
      expect(purgeSpy).toHaveBeenCalledTimes(1)  // still 1, no additional calls
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-21: auto-purge timer calls purgeExpiredTrashEntries when TrashTTLms is configured', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_DataStore.fromScratch({ TrashTTLms:60_000, TrashCheckIntervalMs:500 })
      const Item = Store.newItemAt(undefined, Store.RootItem)

      // Simulate data deleted in the past
      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(Item)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      // Advance past one check interval — auto-purge should have fired
      vi.advanceTimersByTime(600)
      expect(Store.EntryWithId(Item.Id)).toBeUndefined()
      Store.dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-22: moving an entry out of TrashItem removes Info._trashedAt', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Store.deleteEntry(Item)
    expect(typeof Item.Info['_trashedAt']).toBe('number')  // set by deleteEntry
    Store.moveEntryTo(Item, Store.RootItem)                // move back out of trash
    expect(Item.Info['_trashedAt']).toBeUndefined()        // cleaned up
  })

})
