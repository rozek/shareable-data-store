/*******************************************************************************
*                                                                              *
*         SDS_DataStore (Loro CRDT backend) — Construction Tests               *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_DataStore } from '../store/SDS_DataStore.js'

const RootId         = '00000000-0000-4000-8000-000000000000'
const TrashId        = '00000000-0000-4000-8000-000000000001'
const LostAndFoundId = '00000000-0000-4000-8000-000000000002'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore (Loro) — Construction', () => {

  it('C-01: fromScratch() returns an SDS_DataStore', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store).toBeInstanceOf(SDS_DataStore)
  })

  it('C-02: fresh store has RootItem with correct Id', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store.RootItem.Id).toBe(RootId)
  })

  it('C-03: fresh store has TrashItem with correct Id', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store.TrashItem.Id).toBe(TrashId)
  })

  it('C-04: fresh store has LostAndFoundItem with correct Id', () => {
    const Store = SDS_DataStore.fromScratch()
    expect(Store.LostAndFoundItem.Id).toBe(LostAndFoundId)
  })

  it('C-05: asBinary() returns a non-empty Uint8Array', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Binary = Store.asBinary()
    expect(Binary).toBeInstanceOf(Uint8Array)
    expect(Binary.length).toBeGreaterThan(0)
  })

  it('C-06: fromBinary(asBinary()) round-trips correctly', () => {
    const Store1 = SDS_DataStore.fromScratch()
    const Item1  = Store1.newItemAt(undefined, Store1.RootItem)
      Item1.Label = 'round-trip data'
    const Binary = Store1.asBinary()
    const Store2 = SDS_DataStore.fromBinary(Binary)
    expect(Store2.RootItem.Id).toBe(RootId)
    const Found = Store2.EntryWithId(Item1.Id)
    expect(Found?.Label).toBe('round-trip data')
  })

  it('C-07: asJSON() returns a JSON-serializable value', () => {
    const Store = SDS_DataStore.fromScratch()
    const JSON_ = Store.asJSON()
    expect(() => JSON.stringify(JSON_)).not.toThrow()
  })

  it('C-08: fromJSON(asJSON()) round-trips correctly', () => {
    const Store1 = SDS_DataStore.fromScratch()
    const JSON_  = Store1.asJSON()
    const Store2 = SDS_DataStore.fromJSON(JSON_)
    expect(Store2.RootItem.Id).toBe(RootId)
    expect(Store2.TrashItem.Id).toBe(TrashId)
  })

  it('C-09: small strings stored as literal when within LiteralSizeLimit', () => {
    const Store = SDS_DataStore.fromScratch({ LiteralSizeLimit:1000 })
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(Item.ValueKind).toBe('literal')
  })

  it('C-10: strings beyond LiteralSizeLimit stored as literal-reference', () => {
    const Store = SDS_DataStore.fromScratch({ LiteralSizeLimit:3 })
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')  // 5 chars > 3
    expect(Item.ValueKind).toBe('literal-reference')
  })

  it('LO-C-01: fromScratch() contains exactly the three well-known items', () => {
    // Loro backend: no canonical snapshot — the well-known entries are created
    // directly in fromScratch() using fixed UUIDs via LoroMap containers.
    const Store = SDS_DataStore.fromScratch()
    expect(Store.RootItem.Id).toBe(RootId)
    expect(Store.TrashItem.Id).toBe(TrashId)
    expect(Store.LostAndFoundItem.Id).toBe(LostAndFoundId)
    const InnerIds = Array.from(Store.RootItem.innerEntryList).map(e => e.Id)
    expect(InnerIds).toContain(TrashId)
    expect(InnerIds).toContain(LostAndFoundId)
    expect(InnerIds).toHaveLength(2)
  })

  it('C-11: two independent fromScratch() stores can exchange patches', () => {
    // Loro CRDT merges patches from independent stores correctly — no canonical
    // snapshot is required because Loro conflict resolution is deterministic.
    const StoreA = SDS_DataStore.fromScratch()
    const StoreB = SDS_DataStore.fromScratch()

    const Item = StoreA.newItemAt(undefined, StoreA.RootItem)
    Item.Label  = 'shared across peers'

    const Patch = StoreA.exportPatch()
    expect(() => StoreB.applyRemotePatch(Patch)).not.toThrow()

    const Recovered = StoreB.EntryWithId(Item.Id)
    expect(Recovered?.Label).toBe('shared across peers')
  })
})
