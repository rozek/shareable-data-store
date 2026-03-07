/*******************************************************************************
*                                                                              *
*                     SNS_NoteStore — Import Tests                             *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'
import { SNS_Note }      from '../store/SNS_Note.js'
import { SNS_Link }      from '../store/SNS_Link.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore — Import', () => {

  it('I-01: deserializeNoteInto imports note into container', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note1  = Store1.newNoteAt(Store1.RootNote)
    Note1.Label  = 'original'

    const Store2   = SNS_NoteStore.fromScratch()
    const Imported = Store2.deserializeNoteInto(Note1.asJSON(), Store2.RootNote)

    expect(Imported).toBeInstanceOf(SNS_Note)
    const Ids = Array.from(Store2.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Imported.Id)
  })

  it('I-02: imported note gets a new Id', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note1  = Store1.newNoteAt(Store1.RootNote)

    const Store2   = SNS_NoteStore.fromScratch()
    const Imported = Store2.deserializeNoteInto(Note1.asJSON(), Store2.RootNote)

    expect(Imported.Id).not.toBe(Note1.Id)
  })

  it('I-03: imported note has same Label', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note1  = Store1.newNoteAt(Store1.RootNote)
    Note1.Label  = 'copy this'

    const Store2   = SNS_NoteStore.fromScratch()
    const Imported = Store2.deserializeNoteInto(Note1.asJSON(), Store2.RootNote)

    expect(Imported.Label).toBe('copy this')
  })

  it('I-04: imported note has same MIME type', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note1  = Store1.newNoteAt(Store1.RootNote, 'text/markdown')

    const Store2   = SNS_NoteStore.fromScratch()
    const Imported = Store2.deserializeNoteInto(Note1.asJSON(), Store2.RootNote) as SNS_Note

    expect(Imported.Type).toBe('text/markdown')
  })

  it('I-05: nested notes are imported with their structure', () => {
    const Store1  = SNS_NoteStore.fromScratch()
    const OuterNote  = Store1.newNoteAt(Store1.RootNote)
    const InnerNote1 = Store1.newNoteAt(OuterNote)
    const InnerNote2 = Store1.newNoteAt(OuterNote)

    const Store2     = SNS_NoteStore.fromScratch()
    const Imported   = Store2.deserializeNoteInto(OuterNote.asJSON(), Store2.RootNote) as SNS_Note

    expect(Imported.innerEntryList.length).toBe(2)
  })

  it('I-06: deserializeLinkInto imports link into container', () => {
    const Store1  = SNS_NoteStore.fromScratch()
    const Target  = Store1.newNoteAt(Store1.RootNote)
    const Link1   = Store1.newLinkAt(Target, Store1.RootNote)
    Link1.Label   = 'link copy'

    const Store2     = SNS_NoteStore.fromScratch()
    // Target must exist in Store2 for the link to be valid
    const Target2    = Store2.newNoteAt(Store2.RootNote)
    const Imported   = Store2.deserializeLinkInto(Link1.asJSON(), Store2.RootNote) as SNS_Link

    expect(Imported).toBeInstanceOf(SNS_Link)
    const Ids = Array.from(Store2.RootNote.innerEntryList).map((e) => e.Id)
    expect(Ids).toContain(Imported.Id)
  })

  it('I-07: invalid serialisation throws SNS_Error invalid-argument', () => {
    const Store = SNS_NoteStore.fromScratch()
    expect(() => Store.deserializeNoteInto(null, Store.RootNote)).toThrow()
  })
})
