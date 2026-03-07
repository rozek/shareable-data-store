/*******************************************************************************
*                                                                              *
*                   SNS_NoteStore — Entry Creation Tests                       *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'
import { SNS_Note }      from '../store/SNS_Note.js'
import { SNS_Link }      from '../store/SNS_Link.js'
import { SNS_Error }     from '../error/SNS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore — Entry Creation', () => {
  it('N-01: newNoteAt returns an SNS_Note', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note).toBeInstanceOf(SNS_Note)
    expect(Note.isNote).toBe(true)
  })

  it('N-02: note has correct MIME type', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote, 'text/markdown')
    expect(Note.Type).toBe('text/markdown')
  })

  it('N-03: note appears in container innerEntryList', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Ids   = Array.from(Store.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Note.Id)
  })

  it('N-04: note has correct outerNote', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note.outerNote?.Id).toBe(Store.RootNote.Id)
  })

  it('N-05: newLinkAt returns an SNS_Link', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    expect(Link).toBeInstanceOf(SNS_Link)
    expect(Link.isLink).toBe(true)
  })

  it('N-06: link has correct Target', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    expect(Link.Target.Id).toBe(Target.Id)
  })

  it('N-07: link appears in container innerEntryList', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    const Ids    = Array.from(Store.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Link.Id)
  })

  it('N-08: EntryWithId returns the correct entry', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Found = Store.EntryWithId(Note.Id)
    expect(Found?.Id).toBe(Note.Id)
  })

  it('N-09: EntryWithId with nonexistent id returns undefined', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(Store.EntryWithId('00000000-0000-0000-0000-000000000099')).toBeUndefined()
  })

  it('N-10: newNoteAt with empty MIMEType throws SNS_Error invalid-argument', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(() => Store.newNoteAt(Store.RootNote, '')).toThrowError(
      expect.objectContaining({ Code:'invalid-argument' })
    )
  })

  it('N-11: newLinkAt with non-existent target throws', () => {
    const Store      = SNS_NoteStore.fromScratch()
    const FakeTarget = { Id:'00000000-0000-0000-0000-000000000099', isNote:true } as any
    expect(() => Store.newLinkAt(FakeTarget, Store.RootNote)).toThrow()
  })
})
