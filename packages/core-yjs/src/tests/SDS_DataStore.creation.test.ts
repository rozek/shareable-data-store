/*******************************************************************************
*                                                                              *
*                   SDS_DataStore — Entry Creation Tests                       *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_DataStore } from '../store/SDS_DataStore.js'
import { SDS_Item }      from '../store/SDS_Item.js'
import { SDS_Link }      from '../store/SDS_Link.js'
import { SDS_Error }     from '../error/SDS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore — Entry Creation', () => {

  it('N-01: newItemAt returns an SDS_Item', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(Item).toBeInstanceOf(SDS_Item)
    expect(Item.isItem).toBe(true)
  })

  it('N-02: data has correct MIME type', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt('text/markdown', Store.RootItem)
    expect(Item.Type).toBe('text/markdown')
  })

  it('N-03: data appears in container innerEntryList', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Ids   = Array.from(Store.RootItem.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Item.Id)
  })

  it('N-04: data has correct outerItem', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(Item.outerItem?.Id).toBe(Store.RootItem.Id)
  })

  it('N-05: newLinkAt returns an SDS_Link', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Target = Store.newItemAt(undefined, Store.RootItem)
    const Link   = Store.newLinkAt(Target, Store.RootItem)
    expect(Link).toBeInstanceOf(SDS_Link)
    expect(Link.isLink).toBe(true)
  })

  it('N-06: link has correct Target', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Target = Store.newItemAt(undefined, Store.RootItem)
    const Link   = Store.newLinkAt(Target, Store.RootItem)
    expect(Link.Target.Id).toBe(Target.Id)
  })

  it('N-07: link appears in container innerEntryList', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Target = Store.newItemAt(undefined, Store.RootItem)
    const Link   = Store.newLinkAt(Target, Store.RootItem)
    const Ids    = Array.from(Store.RootItem.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Link.Id)
  })

  it('N-08: EntryWithId returns the correct entry', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Found = Store.EntryWithId(Item.Id)
    expect(Found?.Id).toBe(Item.Id)
  })

  it('N-09: EntryWithId with nonexistent id returns undefined', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store.EntryWithId('00000000-0000-0000-0000-000000000099')).toBeUndefined()
  })

  it('N-10: newItemAt with empty MIMEType throws SDS_Error invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.newItemAt('', Store.RootItem)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })


  it('N-11: newLinkAt with non-existent target throws', () => {
    const Store      = SDS_DataStore.fromScratch()
    const FakeTarget = { Id:'00000000-0000-0000-0000-000000000099', isItem:true } as any
    expect(() => Store.newLinkAt(FakeTarget, Store.RootItem)).toThrow()
  })

  it('N-12: newItemAt with null outerItem throws SDS_Error invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.newItemAt(undefined, null as any)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })

  it('N-13: newLinkAt with null Target throws SDS_Error invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(() => Store.newLinkAt(null as any, Store.RootItem)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })

  it('N-14: newLinkAt with a link as target throws SDS_Error invalid-argument', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Target = Store.newItemAt(undefined, Store.RootItem)
    const Link   = Store.newLinkAt(Target, Store.RootItem)
    expect(() => Store.newLinkAt(Link as unknown as SDS_Item, Store.RootItem)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })
})
