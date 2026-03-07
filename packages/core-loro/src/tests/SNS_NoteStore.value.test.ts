/*******************************************************************************
*                                                                              *
*                     SNS_NoteStore — Value Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SNS_NoteStore } from '../store/SNS_NoteStore.js'
import { SNS_Error }     from '../error/SNS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_NoteStore — Value', () => {

  it('V-01: new note has ValueKind none', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(Note.ValueKind).toBe('none')
  })

  it('V-02: writeValue(undefined) → ValueKind none', async () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    Note.writeValue(undefined)
    expect(Note.ValueKind).toBe('none')
    expect(await Note.readValue()).toBeUndefined()
  })

  it('V-03: writeValue(small string) → ValueKind literal', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    expect(Note.ValueKind).toBe('literal')
  })

  it('V-04: readValue returns the written string', async () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello world')
    expect(await Note.readValue()).toBe('hello world')
  })

  it('V-05: isLiteral true after string write', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    expect(Note.isLiteral).toBe(true)
  })

  it('V-06: isBinary false after string write', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    expect(Note.isBinary).toBe(false)
  })

  it('V-07: writeValue(small Uint8Array) → ValueKind binary', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote, 'application/octet-stream')
    Note.writeValue(new Uint8Array([1, 2, 3]))
    expect(Note.ValueKind).toBe('binary')
  })

  it('V-08: readValue returns the written Uint8Array', async () => {
    const Store    = SNS_NoteStore.fromScratch()
    const Note     = Store.newNoteAt(Store.RootNote, 'application/octet-stream')
    const Bytes    = new Uint8Array([10, 20, 30])
    Note.writeValue(Bytes)
    const Result = await Note.readValue()
    expect(Result).toBeInstanceOf(Uint8Array)
    expect(Array.from(Result as Uint8Array)).toEqual([10, 20, 30])
  })

  it('V-09: isBinary true after binary write', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote, 'application/octet-stream')
    Note.writeValue(new Uint8Array([1]))
    expect(Note.isBinary).toBe(true)
  })

  it('V-10: large string → ValueKind literal-reference', () => {
    const Store  = SNS_NoteStore.fromScratch({ LiteralSizeLimit:5 })
    const Note   = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello world')  // 11 chars > 5
    expect(Note.ValueKind).toBe('literal-reference')
  })

  it('V-11: large binary → ValueKind binary-reference', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote, 'application/octet-stream')
    Note.writeValue(new Uint8Array(3000))  // > 2048 bytes
    expect(Note.ValueKind).toBe('binary-reference')
  })

  it('V-12: changeValue splices the literal value', async () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello world')
    Note.changeValue(0, 5, 'Bye')  // replace 'hello' with 'Bye'
    expect(await Note.readValue()).toBe('Bye world')
  })

  it('V-13: changeValue on non-literal throws change-value-not-literal', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(() => Note.changeValue(0, 1, 'x')).toThrowError(
      expect.objectContaining({ Code:'change-value-not-literal' })
    )
  })

  it('V-14: value change fires ChangeSet with Value', () => {
    const Store   = SNS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Note.writeValue('hello')
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('Value')).toBe(true)
  })

  it('V-15: writeValue(undefined) on existing value → none', () => {
    const Store = SNS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.writeValue('hello')
    Note.writeValue(undefined)
    expect(Note.ValueKind).toBe('none')
  })
})
