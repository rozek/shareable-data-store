/*******************************************************************************
*                                                                              *
*                      SNS_NoteStore — Move Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'
import { SNS_Error }     from '../error/SNS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore — Move', () => {

  it('M-01: moveEntryTo updates outerNote', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Target = Store.newNoteAt(Store.RootNote)
    Store.moveEntryTo(Note, Target)
    expect(Note.outerNote?.Id).toBe(Target.Id)
  })

  it('M-02: moved note appears in target innerEntryList', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Target = Store.newNoteAt(Store.RootNote)
    Store.moveEntryTo(Note, Target)
    const Ids = Array.from(Target.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Note.Id)
  })

  it('M-03: moved note removed from source innerEntryList', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Target = Store.newNoteAt(Store.RootNote)
    Store.moveEntryTo(Note, Target)
    const Ids = Array.from(Store.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).not.toContain(Note.Id)
  })

  it('M-04: moveEntryTo fires ChangeSet with outerNote and innerEntryList', () => {
    const Store   = SNS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    const Target  = Store.newNoteAt(Store.RootNote)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.moveEntryTo(Note, Target)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('outerNote')).toBe(true)
    expect(ChangeSet[Target.Id]?.has('innerEntryList')).toBe(true)
    expect(ChangeSet[Store.RootNote.Id]?.has('innerEntryList')).toBe(true)
  })

  it('M-05: mayBeMovedTo returns true for valid move', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Target = Store.newNoteAt(Store.RootNote)
    expect(Note.mayBeMovedTo(Target)).toBe(true)
  })

  it('M-06: mayBeMovedTo returns false when Container is descendant (cycle)', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const InnerNote = Store.newNoteAt(OuterNote)
    expect(OuterNote.mayBeMovedTo(InnerNote)).toBe(false)
  })

  it('M-07: moveEntryTo into descendant throws move-would-cycle', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const InnerNote = Store.newNoteAt(OuterNote)
    expect(() => Store.moveEntryTo(OuterNote, InnerNote)).toThrowError(
      expect.objectContaining({ Code:'move-would-cycle' })
    )
  })

  it('M-08: TrashNote mayBeMovedTo(RootNote) returns true', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.TrashNote.mayBeMovedTo(Store.RootNote)).toBe(true)
  })

  it('M-09: TrashNote mayBeMovedTo(innerNote) returns false', () => {
    const Store = SNS_NoteStore.fromScratch()
    const InnerNote = Store.newNoteAt(Store.RootNote)
    expect(Store.TrashNote.mayBeMovedTo(InnerNote)).toBe(false)
  })

  it('M-10: RootNote cannot be moved anywhere', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Dest  = Store.newNoteAt(Store.RootNote)
    expect(Store.RootNote.mayBeMovedTo(Dest)).toBe(false)
  })

  it('M-11: moveEntryTo with InsertionIndex 0 inserts at front', () => {
    const Store   = SNS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const Existing = Store.newNoteAt(OuterNote)
    const Note    = Store.newNoteAt(Store.RootNote)
    Store.moveEntryTo(Note, OuterNote, 0)
    const InnerEntries = Array.from(OuterNote.innerEntryList).map((e) => e.Id)
    expect(InnerEntries[0]).toBe(Note.Id)
  })

  it('M-12: note.moveTo(container) is equivalent to store.moveEntryTo', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Target = Store.newNoteAt(Store.RootNote)
    Note.moveTo(Target)
    expect(Note.outerNote?.Id).toBe(Target.Id)
  })
})
