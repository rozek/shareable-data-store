/*******************************************************************************
*                                                                              *
*                          SNS Core JJ — Smoke Tests                           *
*                                                                              *
* Verifies that all public API symbols are correctly re-exported from          *
* @rozek/sds-core.  The full functional test suite lives in that package.      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import {
  SDS_Error,
  SDS_Entry, SDS_Note, SDS_Link, SDS_NoteStore,
} from '../sds-core-jj.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS Core JJ — Re-exports', () => {
  it('JJ-01: SDS_Error is exported and constructible', () => {
    const err = new SDS_Error('test', 'test message')
    expect(err).toBeInstanceOf(SDS_Error)
    expect(err.Code).toBe('test')
    expect(err.message).toBe('test message')
  })

  it('JJ-02: SDS_NoteStore is exported', () => {
    expect(SDS_NoteStore).toBeDefined()
    expect(typeof SDS_NoteStore.fromScratch).toBe('function')
    expect(typeof SDS_NoteStore.fromBinary).toBe('function')
    expect(typeof SDS_NoteStore.fromJSON).toBe('function')
  })

  it('JJ-03: SDS_Entry, SDS_Note, SDS_Link are exported', () => {
    expect(SDS_Entry).toBeDefined()
    expect(SDS_Note).toBeDefined()
    expect(SDS_Link).toBeDefined()
  })

  it('JJ-04: fromScratch() produces a working SDS_NoteStore', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store).toBeInstanceOf(SDS_NoteStore)
    expect(Store.RootNote.Id).toBe('00000000-0000-4000-8000-000000000000')
    expect(Store.TrashNote.Id).toBe('00000000-0000-4000-8000-000000000001')
    expect(Store.LostAndFoundNote.Id).toBe('00000000-0000-4000-8000-000000000002')
  })

  it('JJ-05: notes and links are instances of SDS_Note and SDS_Link', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Link  = Store.newLinkAt(Note, Store.RootNote)
    expect(Note).toBeInstanceOf(SDS_Note)
    expect(Link).toBeInstanceOf(SDS_Link)
  })

  it('JJ-06: patch exchange between two independent stores works', () => {
    const StoreA = SDS_NoteStore.fromScratch()
    const StoreB = SDS_NoteStore.fromScratch()

    const Note = StoreA.newNoteAt(StoreA.RootNote)
    Note.Label  = 'hello from core-jj'

    StoreB.applyRemotePatch(StoreA.exportPatch())
    expect(StoreB.EntryWithId(Note.Id)?.Label).toBe('hello from core-jj')
  })
})
