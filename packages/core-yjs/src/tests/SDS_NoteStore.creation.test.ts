/*******************************************************************************
*                                                                              *
*                   SDS_NoteStore — Entry Creation Tests                       *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'
import { SDS_Note }      from '../store/SDS_Note.js'
import { SDS_Link }      from '../store/SDS_Link.js'
import { SDS_Error }     from '../error/SDS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Entry Creation', () => {

  it('N-01: newNoteAt returns an SDS_Note', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note).toBeInstanceOf(SDS_Note)
    expect(Note.isNote).toBe(true)
  })

  it('N-02: note has correct MIME type', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote, 'text/markdown')
    expect(Note.Type).toBe('text/markdown')
  })

  it('N-03: note appears in container innerEntryList', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Ids   = Array.from(Store.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Note.Id)
  })

  it('N-04: note has correct outerNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note.outerNote?.Id).toBe(Store.RootNote.Id)
  })

  it('N-05: newLinkAt returns an SDS_Link', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    expect(Link).toBeInstanceOf(SDS_Link)
    expect(Link.isLink).toBe(true)
  })

  it('N-06: link has correct Target', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    expect(Link.Target.Id).toBe(Target.Id)
  })

  it('N-07: link appears in container innerEntryList', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const Target = Store.newNoteAt(Store.RootNote)
    const Link   = Store.newLinkAt(Target, Store.RootNote)
    const Ids    = Array.from(Store.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Link.Id)
  })

  it('N-08: EntryWithId returns the correct entry', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    const Found = Store.EntryWithId(Note.Id)
    expect(Found?.Id).toBe(Note.Id)
  })

  it('N-09: EntryWithId with nonexistent id returns undefined', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(Store.EntryWithId('00000000-0000-0000-0000-000000000099')).toBeUndefined()
  })

  it('N-10: newNoteAt with empty MIMEType throws SDS_Error invalid-argument', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(() => Store.newNoteAt(Store.RootNote, '')).toThrowError(
      expect.objectContaining({ Code:'invalid-argument' })
    )
  })

  it('N-11: newLinkAt with non-existent target throws', () => {
    const Store      = SDS_NoteStore.fromScratch()
    const FakeTarget = { Id:'00000000-0000-0000-0000-000000000099', isNote:true } as any
    expect(() => Store.newLinkAt(FakeTarget, Store.RootNote)).toThrow()
  })
})
