/*******************************************************************************
*                                                                              *
*           SNS_NoteStore (Y.js backend) — Construction Tests                  *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'

const RootId         = '00000000-0000-4000-8000-000000000000'
const TrashId        = '00000000-0000-4000-8000-000000000001'
const LostAndFoundId = '00000000-0000-4000-8000-000000000002'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore (Y.js) — Construction', () => {

  it('C-01: fromScratch() returns an SNS_NoteStore', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store).toBeInstanceOf(SNS_NoteStore)
  })

  it('C-02: fresh store has RootNote with correct Id', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.RootNote.Id).toBe(RootId)
  })

  it('C-03: fresh store has TrashNote with correct Id', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.TrashNote.Id).toBe(TrashId)
  })

  it('C-04: fresh store has LostAndFoundNote with correct Id', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.LostAndFoundNote.Id).toBe(LostAndFoundId)
  })

  it('C-05: asBinary() returns a non-empty Uint8Array', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Binary = Store.asBinary()
    expect(Binary).toBeInstanceOf(Uint8Array)
    expect(Binary.length).toBeGreaterThan(0)
  })

  it('C-06: fromBinary(asBinary()) round-trips correctly', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note1  = Store1.newNoteAt(Store1.RootNote)
      Note1.Label = 'round-trip note'
    const Binary = Store1.asBinary()
    const Store2 = SNS_NoteStore.fromBinary(Binary)
    expect(Store2.RootNote.Id).toBe(RootId)
    const Found = Store2.EntryWithId(Note1.Id)
    expect(Found?.Label).toBe('round-trip note')
  })

  it('C-07: asJSON() returns a JSON-serializable value', () => {
    const Store = SNS_NoteStore.fromScratch()
    const JSON_ = Store.asJSON()
    expect(() => JSON.stringify(JSON_)).not.toThrow()
  })

  it('C-08: fromJSON(asJSON()) round-trips correctly', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const JSON_  = Store1.asJSON()
    const Store2 = SNS_NoteStore.fromJSON(JSON_)
    expect(Store2.RootNote.Id).toBe(RootId)
    expect(Store2.TrashNote.Id).toBe(TrashId)
  })

  it('C-09: small strings stored as literal when within LiteralSizeLimit', () => {
    const Store = SNS_NoteStore.fromScratch({ LiteralSizeLimit:1000 })
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    expect(Note.ValueKind).toBe('literal')
  })

  it('C-10: strings beyond LiteralSizeLimit stored as literal-reference', () => {
    const Store = SNS_NoteStore.fromScratch({ LiteralSizeLimit:3 })
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')  // 5 chars > 3
    expect(Note.ValueKind).toBe('literal-reference')
  })

  it('C-11: fromScratch() contains exactly the three well-known notes', () => {
    // Y.js backend: no canonical snapshot — the well-known entries are created
    // directly in fromScratch() using fixed UUIDs.
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.RootNote.Id).toBe(RootId)
    expect(Store.TrashNote.Id).toBe(TrashId)
    expect(Store.LostAndFoundNote.Id).toBe(LostAndFoundId)
    const InnerIds = Array.from(Store.RootNote.innerEntryList).map(e => e.Id)
    expect(InnerIds).toContain(TrashId)
    expect(InnerIds).toContain(LostAndFoundId)
    expect(InnerIds).toHaveLength(2)
  })

  it('C-12: two independent fromScratch() stores can exchange patches', () => {
    // Y.js merges patches from independent stores correctly — no canonical
    // snapshot is required because Y.js conflict resolution is deterministic.
    const StoreA = SNS_NoteStore.fromScratch()
    const StoreB = SNS_NoteStore.fromScratch()

    const Note = StoreA.newNoteAt(StoreA.RootNote)
    Note.Label  = 'shared across peers'

    const Patch = StoreA.exportPatch()
    expect(() => StoreB.applyRemotePatch(Patch)).not.toThrow()

    const Recovered = StoreB.EntryWithId(Note.Id)
    expect(Recovered?.Label).toBe('shared across peers')
  })
})
