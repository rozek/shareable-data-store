/*******************************************************************************
*                                                                              *
*                 SNS_NoteStore — Serialisation Tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore — Serialisation', () => {
  it('S-01: asBinary starts with gzip magic bytes', () => {
    const Store  = SNS_NoteStore.fromScratch()
    const Binary = Store.asBinary()
    expect(Binary[0]).toBe(0x1f)
    expect(Binary[1]).toBe(0x8b)
  })

  it('S-02: fromBinary round-trips all notes', () => {
    const Store1  = SNS_NoteStore.fromScratch()
    const NoteA   = Store1.newNoteAt(Store1.RootNote)
    const NoteB   = Store1.newNoteAt(Store1.RootNote, 'text/markdown')
    const Binary  = Store1.asBinary()
    const Store2  = SNS_NoteStore.fromBinary(Binary)
    expect(Store2.EntryWithId(NoteA.Id)).toBeDefined()
    expect(Store2.EntryWithId(NoteB.Id)).toBeDefined()
  })

  it('S-03: round-tripped store has same Label values', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note   = Store1.newNoteAt(Store1.RootNote)
    Note.Label   = 'preserved label'
    const Store2 = SNS_NoteStore.fromBinary(Store1.asBinary())
    expect(Store2.EntryWithId(Note.Id)?.Label).toBe('preserved label')
  })

  it('S-04: round-tripped store has same innerEntryList order', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const A      = Store1.newNoteAt(Store1.RootNote)
    const B      = Store1.newNoteAt(Store1.RootNote)
    const C      = Store1.newNoteAt(Store1.RootNote)
    const Order1 = Array.from(Store1.RootNote.innerEntryList)
      .filter((e) => [A.Id, B.Id, C.Id].includes(e.Id))
      .map((e) => e.Id)
    const Store2 = SNS_NoteStore.fromBinary(Store1.asBinary())
    const Order2 = Array.from(Store2.RootNote.innerEntryList)
      .filter((e) => [A.Id, B.Id, C.Id].includes(e.Id))
      .map((e) => e.Id)
    expect(Order2).toEqual(Order1)
  })

  it('S-05: round-tripped store preserves literal value', async () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note   = Store1.newNoteAt(Store1.RootNote)
    Note.writeValue('my content')
    const Store2 = SNS_NoteStore.fromBinary(Store1.asBinary())
    const Note2  = Store2.EntryWithId(Note.Id) as any
    expect(await Note2.readValue()).toBe('my content')
  })

  it('S-06: round-tripped store preserves binary value', async () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note   = Store1.newNoteAt(Store1.RootNote, 'application/octet-stream')
    const Bytes  = new Uint8Array([7, 8, 9])
    Note.writeValue(Bytes)
    const Store2 = SNS_NoteStore.fromBinary(Store1.asBinary())
    const Note2  = Store2.EntryWithId(Note.Id) as any
    expect(Array.from(await Note2.readValue())).toEqual([7, 8, 9])
  })

  it('S-07: fromJSON(asJSON()) round-trips', () => {
    const Store1 = SNS_NoteStore.fromScratch()
    const Note   = Store1.newNoteAt(Store1.RootNote)
    Note.Label   = 'json test'
    const Store2 = SNS_NoteStore.fromJSON(Store1.asJSON())
    expect(Store2.EntryWithId(Note.Id)?.Label).toBe('json test')
  })

  it('S-08: binary round-trip preserves nested notes', () => {
    const Store1  = SNS_NoteStore.fromScratch()
    const OuterNote  = Store1.newNoteAt(Store1.RootNote)
    const InnerNote  = Store1.newNoteAt(OuterNote)
    const Binary  = Store1.asBinary()
    const Store2  = SNS_NoteStore.fromBinary(Binary)
    const OuterNote2 = Store2.EntryWithId(OuterNote.Id)
    expect(OuterNote2).toBeDefined()
    expect(Store2.EntryWithId(InnerNote.Id)?.outerNote?.Id).toBe(OuterNote.Id)
  })
})
