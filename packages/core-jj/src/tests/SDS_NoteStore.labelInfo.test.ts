/*******************************************************************************
*                                                                              *
*                  SDS_NoteStore — Label & Info Tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Label & Info', () => {
  it('L-01: new note has empty Label', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note.Label).toBe('')
  })

  it('L-02: Label setter stores the value', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.Label  = 'My Note'
    expect(Note.Label).toBe('My Note')
  })

  it('L-03: Label change fires ChangeSet with Label key', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Note.Label = 'test'
    const CallArgs = Handler.mock.calls[0]
    expect(CallArgs).toBeDefined()
    const ChangeSet = CallArgs[1]
    expect(ChangeSet[Note.Id]?.has('Label')).toBe(true)
  })

  it('L-04: Info is initially empty', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Object.keys(Note.Info).length).toBe(0)
  })

  it('L-05: Info set stores value', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.Info['tag'] = 'important'
    expect(Note.Info['tag']).toBe('important')
  })

  it('L-06: Info set fires ChangeSet with Info.tag', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Note.Info['tag'] = 'important'
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('Info.tag')).toBe(true)
  })

  it('L-07: Info delete removes key', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.Info['tag'] = 'important'
    delete Note.Info['tag']
    expect(Note.Info['tag']).toBeUndefined()
  })

  it('L-08: Info delete fires ChangeSet with Info.tag', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    Note.Info['tag'] = 'important'
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    delete Note.Info['tag']
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('Info.tag')).toBe(true)
  })

  it('L-09: deleting the last Info key removes the Info node (Info still readable as {})', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.Info['tag'] = 'important'
    delete Note.Info['tag']
    // the CRDT Info node has been removed — but the proxy still returns an empty object.
    expect(Object.keys(Note.Info).length).toBe(0)
    // writing a new key afterwards must still work (node recreated transparently).
    Note.Info['x'] = 1
    expect(Note.Info['x']).toBe(1)
  })
})
