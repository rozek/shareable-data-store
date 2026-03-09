/*******************************************************************************
*                                                                              *
*                    SDS_NoteStore — Ordering Tests                            *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Ordering', () => {
  it('O-01: three notes without InsertionIndex appear in creation order', () => {
    const Store = SDS_NoteStore.fromScratch()
    const A = Store.newNoteAt(Store.RootNote)
    const B = Store.newNoteAt(Store.RootNote)
    const C = Store.newNoteAt(Store.RootNote)
    const InnerEntries = Array.from(Store.RootNote.innerEntryList)
      .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === C.Id)
      .map((e) => e.Id)
    expect(InnerEntries).toEqual([A.Id, B.Id, C.Id])
  })

  it('O-02: InsertionIndex 0 inserts at the front', () => {
    const Store = SDS_NoteStore.fromScratch()
    const A     = Store.newNoteAt(Store.RootNote)
    const B     = Store.newNoteAt(Store.RootNote)
    const First = Store.newNoteAt(Store.RootNote, undefined, 0)
    // find among A, B, First only
    const InnerEntries = Array.from(Store.RootNote.innerEntryList)
      .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === First.Id)
      .map((e) => e.Id)
    expect(InnerEntries[0]).toBe(First.Id)
  })

  it('O-03: InsertionIndex 1 inserts at the second position', () => {
    // use a custom container (not RootNote) so no system notes interfere with indexing
    const Store  = SDS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const A      = Store.newNoteAt(OuterNote)
    const B      = Store.newNoteAt(OuterNote)
    const Middle = Store.newNoteAt(OuterNote, undefined, 1)
    const InnerEntries = Array.from(OuterNote.innerEntryList).map((e) => e.Id)
    expect(InnerEntries[1]).toBe(Middle.Id)
  })

  it('O-04: InsertionIndex beyond length appends at end', () => {
    const Store = SDS_NoteStore.fromScratch()
    const A     = Store.newNoteAt(Store.RootNote)
    const B     = Store.newNoteAt(Store.RootNote)
    const Last  = Store.newNoteAt(Store.RootNote, undefined, 9999)
    const InnerEntries = Array.from(Store.RootNote.innerEntryList)
      .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === Last.Id)
      .map((e) => e.Id)
    expect(InnerEntries[InnerEntries.length-1]).toBe(Last.Id)
  })

  it('O-05: innerEntryList.length reflects actual inner-entry count', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    Store.newNoteAt(OuterNote)
    Store.newNoteAt(OuterNote)
    Store.newNoteAt(OuterNote)
    expect(OuterNote.innerEntryList.length).toBe(3)
  })

  it('O-06: innerEntryList is iterable with for..of', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    Store.newNoteAt(OuterNote)
    Store.newNoteAt(OuterNote)
    const Collected: string[] = []
    for (const Entry of OuterNote.innerEntryList) {
      Collected.push(Entry.Id)
    }
    expect(Collected.length).toBe(2)
  })

  it('O-07: innerEntryList[0] returns first inner entry', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const InnerNote = Store.newNoteAt(OuterNote)
    expect(OuterNote.innerEntryList[0]?.Id).toBe(InnerNote.Id)
  })
})
