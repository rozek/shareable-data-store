/*******************************************************************************
*                                                                              *
*                  SDS_NoteStore — Well-known Notes Tests                      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'
import { SDS_Error }     from '@rozek/sds-core'

const RootId = '00000000-0000-4000-8000-000000000000'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Well-known Notes', () => {
  it('W-01: RootNote.isRootNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.RootNote.isRootNote).toBe(true)
  })

  it('W-02: TrashNote.isTrashNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.TrashNote.isTrashNote).toBe(true)
  })

  it('W-03: LostAndFoundNote.isLostAndFoundNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.LostAndFoundNote.isLostAndFoundNote).toBe(true)
  })

  it('W-04: RootNote.isNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.RootNote.isNote).toBe(true)
  })

  it('W-05: RootNote.outerNote is undefined', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.RootNote.outerNote).toBeUndefined()
  })

  it('W-06: TrashNote.outerNote is RootNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.TrashNote.outerNote?.Id).toBe(RootId)
  })

  it('W-07: LostAndFoundNote.outerNote is RootNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.LostAndFoundNote.outerNote?.Id).toBe(RootId)
  })

  it('W-08: RootNote.mayBeDeleted is false', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.RootNote.mayBeDeleted).toBe(false)
  })

  it('W-09: TrashNote.mayBeDeleted is false', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.TrashNote.mayBeDeleted).toBe(false)
  })

  it('W-10: LostAndFoundNote.mayBeDeleted is false', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.LostAndFoundNote.mayBeDeleted).toBe(false)
  })

  it('W-11: TrashNote default Label is "trash"', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.TrashNote.Label).toBe('trash')
  })

  it('W-12: LostAndFoundNote default Label is "lost-and-found"', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.LostAndFoundNote.Label).toBe('lost-and-found')
  })

  it('W-13: TrashNote can be renamed', () => {
    const Store = SDS_NoteStore.fromScratch()
    Store.TrashNote.Label = 'bin'
    expect(Store.TrashNote.Label).toBe('bin')
  })

  it('W-14: RootNote.innerEntryList contains TrashNote and LostAndFoundNote', () => {
    const Store    = SDS_NoteStore.fromScratch()
    const InnerEntries = Store.RootNote.innerEntryList
    const Ids      = Array.from(InnerEntries).map((e) => e.Id)
    expect(Ids).toContain(Store.TrashNote.Id)
    expect(Ids).toContain(Store.LostAndFoundNote.Id)
  })
})
