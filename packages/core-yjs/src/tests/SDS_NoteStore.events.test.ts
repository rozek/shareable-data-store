/*******************************************************************************
*                                                                              *
*                   SDS_NoteStore — Events & Transact Tests                    *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Events & Transact', () => {

  it('EV-01: onChangeInvoke callback fires after newNoteAt', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.newNoteAt(Store.RootNote)
    expect(Handler).toHaveBeenCalledOnce()
  })

  it('EV-02: ChangeSet contains entries for new note and container', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    const Note    = Store.newNoteAt(Store.RootNote)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]).toBeDefined()
    expect(ChangeSet[Store.RootNote.Id]).toBeDefined()
  })

  it('EV-03: ChangeSet for new note contains outerNote', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    const Note    = Store.newNoteAt(Store.RootNote)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('outerNote')).toBe(true)
  })

  it('EV-04: ChangeSet for container contains innerEntryList', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.newNoteAt(Store.RootNote)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Store.RootNote.Id]?.has('innerEntryList')).toBe(true)
  })

  it('EV-05: onChangeInvoke returns an unsubscribe function', () => {
    const Store       = SDS_NoteStore.fromScratch()
    const Handler     = vi.fn()
    const Unsubscribe = Store.onChangeInvoke(Handler)
    expect(typeof Unsubscribe).toBe('function')
  })

  it('EV-06: after unsubscribe callback is no longer called', () => {
    const Store       = SDS_NoteStore.fromScratch()
    const Handler     = vi.fn()
    const Unsubscribe = Store.onChangeInvoke(Handler)
    Unsubscribe()
    Store.newNoteAt(Store.RootNote)
    expect(Handler).not.toHaveBeenCalled()
  })

  it('EV-07: multiple handlers all receive the event', () => {
    const Store    = SDS_NoteStore.fromScratch()
    const HandlerA = vi.fn()
    const HandlerB = vi.fn()
    Store.onChangeInvoke(HandlerA)
    Store.onChangeInvoke(HandlerB)
    Store.newNoteAt(Store.RootNote)
    expect(HandlerA).toHaveBeenCalledOnce()
    expect(HandlerB).toHaveBeenCalledOnce()
  })

  it('EV-08: nested transact emits only one ChangeSet event', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.transact(() => {
      Store.newNoteAt(Store.RootNote)
      Store.transact(() => {
        Store.newNoteAt(Store.RootNote)
      })
    })
    expect(Handler).toHaveBeenCalledOnce()
  })

  it('EV-09: Origin is internal for local mutations', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.newNoteAt(Store.RootNote)
    expect(Handler.mock.calls[0][0]).toBe('internal')
  })
})
