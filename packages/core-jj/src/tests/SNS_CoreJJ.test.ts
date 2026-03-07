/*******************************************************************************
*                                                                              *
*                          SNS Core JJ — Smoke Tests                           *
*                                                                              *
* Verifies that all public API symbols are correctly re-exported from          *
* @rozek/sns-core.  The full functional test suite lives in that package.      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import {
  SNS_Error,
  SNS_Entry, SNS_Note, SNS_Link, SNS_NoteStore,
} from '../sns-core-jj.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS Core JJ — Re-exports', () => {
  it('JJ-01: SNS_Error is exported and constructible', () => {
    const err = new SNS_Error('test', 'test message')
    expect(err).toBeInstanceOf(SNS_Error)
    expect(err.Code).toBe('test')
    expect(err.message).toBe('test message')
  })

  it('JJ-02: SNS_NoteStore is exported', () => {
    expect(SNS_NoteStore).toBeDefined()
    expect(typeof SNS_NoteStore.fromScratch).toBe('function')
    expect(typeof SNS_NoteStore.fromBinary).toBe('function')
    expect(typeof SNS_NoteStore.fromJSON).toBe('function')
  })

  it('JJ-03: SNS_Entry, SNS_Note, SNS_Link are exported', () => {
    expect(SNS_Entry).toBeDefined()
    expect(SNS_Note).toBeDefined()
    expect(SNS_Link).toBeDefined()
  })

  it('JJ-04: fromScratch() produces a working SNS_NoteStore', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store).toBeInstanceOf(SNS_NoteStore)
    expect(Store.RootNote.Id).toBe('00000000-0000-4000-8000-000000000000')
    expect(Store.TrashNote.Id).toBe('00000000-0000-4000-8000-000000000001')
    expect(Store.LostAndFoundNote.Id).toBe('00000000-0000-4000-8000-000000000002')
  })

  it('JJ-05: notes and links are instances of SNS_Note and SNS_Link', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Link  = Store.newLinkAt(Note, Store.RootNote)
    expect(Note).toBeInstanceOf(SNS_Note)
    expect(Link).toBeInstanceOf(SNS_Link)
  })

  it('JJ-06: patch exchange between two independent stores works', () => {
    const StoreA = SNS_NoteStore.fromScratch()
    const StoreB = SNS_NoteStore.fromScratch()

    const Note = StoreA.newNoteAt(StoreA.RootNote)
    Note.Label  = 'hello from core-jj'

    StoreB.applyRemotePatch(StoreA.exportPatch())
    expect(StoreB.EntryWithId(Note.Id)?.Label).toBe('hello from core-jj')
  })
})
