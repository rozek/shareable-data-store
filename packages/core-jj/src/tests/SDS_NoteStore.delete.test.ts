/*******************************************************************************
*                                                                              *
*                    SDS_NoteStore — Delete & Purge Tests                      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SDS_NoteStore } from '../store/SDS_NoteStore.js'
import { SDS_Error }     from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Delete & Purge', () => {
  it('D-01: deleteEntry moves note to TrashNote', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Store.deleteEntry(Note)
    expect(Note.outerNote?.Id).toBe(Store.TrashNote.Id)
  })

  it('D-02: deleted note\'s children are also in trash hierarchy', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const OuterNote = Store.newNoteAt(Store.RootNote)
    const InnerNote = Store.newNoteAt(OuterNote)
    Store.deleteEntry(OuterNote)
    // outerNote should be directly in Trash
    expect(OuterNote.outerNote?.Id).toBe(Store.TrashNote.Id)
    // innerNote should still be inside OuterNote (deleteEntry only moves the top)
    expect(InnerNote.outerNote?.Id).toBe(OuterNote.Id)
  })

  it('D-03: deleteEntry fires ChangeSet with outerNote and innerEntryList', () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Note    = Store.newNoteAt(Store.RootNote)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Store.deleteEntry(Note)
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Note.Id]?.has('outerNote')).toBe(true)
    expect(ChangeSet[Store.TrashNote.Id]?.has('innerEntryList')).toBe(true)
  })

  it('D-04: deleteEntry(RootNote) throws delete-not-permitted', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(() => Store.deleteEntry(Store.RootNote)).toThrowError(
      expect.objectContaining({ Code:'delete-not-permitted' })
    )
  })

  it('D-05: deleteEntry(TrashNote) throws', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(() => Store.deleteEntry(Store.TrashNote)).toThrowError(
      expect.objectContaining({ Code:'delete-not-permitted' })
    )
  })

  it('D-06: deleteEntry(LostAndFoundNote) throws', () => {
    const Store = SDS_NoteStore.fromScratch()
    expect(() => Store.deleteEntry(Store.LostAndFoundNote)).toThrowError(
      expect.objectContaining({ Code:'delete-not-permitted' })
    )
  })

  it('D-07: purgeEntry on note not in TrashNote throws purge-not-in-trash', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(() => Store.purgeEntry(Note)).toThrowError(
      expect.objectContaining({ Code:'purge-not-in-trash' })
    )
  })

  it('D-08: purgeEntry removes note from store', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Store.deleteEntry(Note)
    Store.purgeEntry(Note)
    expect(Store.EntryWithId(Note.Id)).toBeUndefined()
  })

  it('D-09: purgeEntry throws purge-protected when note has incoming link from RootNote tree', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Store.newLinkAt(Note, Store.RootNote)   // link in root tree points to Note
    Store.deleteEntry(Note)                  // note is in Trash
    expect(() => Store.purgeEntry(Note)).toThrowError(
      expect.objectContaining({ Code:'purge-protected' })
    )
    expect(Store.EntryWithId(Note.Id)).toBeDefined()  // still exists
  })

  it('D-12: note.delete() equivalent to store.deleteEntry(note)', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Note.delete()
    expect(Note.outerNote?.Id).toBe(Store.TrashNote.Id)
  })

  it('D-13: note.purge() throws if note not in Trash', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    expect(() => Note.purge()).toThrowError(
      expect.objectContaining({ Code:'purge-not-in-trash' })
    )
  })

  // ---------------------------------------------------------------------------
  // d-14 … d-21: Trash TTL / auto-purge
  // ---------------------------------------------------------------------------

  it('D-14: deleteEntry records _trashedAt in Info with a timestamp ≥ the time before the call', () => {
    const Store  = SDS_NoteStore.fromScratch()
    const Note   = Store.newNoteAt(Store.RootNote)
    const Before = Date.now()
    Store.deleteEntry(Note)
    const TrashedAt = Note.Info['_trashedAt'] as number
    expect(typeof TrashedAt).toBe('number')
    expect(TrashedAt).toBeGreaterThanOrEqual(Before)
  })

  it('D-15: purgeExpiredTrashEntries purges entries whose _trashedAt exceeds the TTL', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_NoteStore.fromScratch()
      const Note  = Store.newNoteAt(Store.RootNote)
      vi.setSystemTime(new Date(Date.now() - 90_000))  // 90 s in the past
      Store.deleteEntry(Note)
      vi.setSystemTime(new Date(Date.now() + 90_000))  // restore to now

      const Count = Store.purgeExpiredTrashEntries(60_000)  // TTL = 60 s
      expect(Count).toBe(1)
      expect(Store.EntryWithId(Note.Id)).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-16: purgeExpiredTrashEntries skips entries whose _trashedAt is within the TTL', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Store.deleteEntry(Note)  // _trashedAt ≈ now

    const Count = Store.purgeExpiredTrashEntries(86_400_000)  // TTL = 1 day
    expect(Count).toBe(0)
    expect(Store.EntryWithId(Note.Id)).toBeDefined()
  })

  it('D-17: purgeExpiredTrashEntries skips entries without _trashedAt', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    // move to Trash without going through deleteEntry (bypasses _trashedAt recording)
    Store.moveEntryTo(Note, Store.TrashNote)

    const Count = Store.purgeExpiredTrashEntries(0)  // TTL = 0 ms (everything expired)
    expect(Count).toBe(0)
    expect(Store.EntryWithId(Note.Id)).toBeDefined()
  })

  it('D-18: purgeExpiredTrashEntries silently skips protected entries', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_NoteStore.fromScratch()
      const Note  = Store.newNoteAt(Store.RootNote)
      Store.newLinkAt(Note, Store.RootNote)  // link in root tree → Note is protected

      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(Note)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      expect(() => Store.purgeExpiredTrashEntries(60_000)).not.toThrow()
      const Count = Store.purgeExpiredTrashEntries(60_000)
      expect(Count).toBe(0)
      expect(Store.EntryWithId(Note.Id)).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-19: purgeExpiredTrashEntries returns the count of purged entries', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_NoteStore.fromScratch()
      const NoteA = Store.newNoteAt(Store.RootNote)
      const NoteB = Store.newNoteAt(Store.RootNote)
      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(NoteA)
      Store.deleteEntry(NoteB)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      const Count = Store.purgeExpiredTrashEntries(60_000)
      expect(Count).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-20: dispose() stops the auto-purge timer', () => {
    vi.useFakeTimers()
    const purgeSpy = vi.fn()
    try {
      const Store = SDS_NoteStore.fromScratch({ TrashTTLms:1_000, TrashCheckIntervalMs:500 })
      // monkey-patch to count calls from the timer
      const orig = Store.purgeExpiredTrashEntries.bind(Store)
      ;(Store as any).purgeExpiredTrashEntries = (...args: any[]) => {
        purgeSpy()
        return orig(...args)
      }

      vi.advanceTimersByTime(600)   // first interval fires → spy called once
      expect(purgeSpy).toHaveBeenCalledTimes(1)

      Store.dispose()               // stop the timer

      vi.advanceTimersByTime(2_000) // no more intervals should fire
      expect(purgeSpy).toHaveBeenCalledTimes(1)  // still 1, no additional calls
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-21: auto-purge timer calls purgeExpiredTrashEntries when TrashTTLms is configured', () => {
    vi.useFakeTimers()
    try {
      const Store = SDS_NoteStore.fromScratch({ TrashTTLms:60_000, TrashCheckIntervalMs:500 })
      const Note  = Store.newNoteAt(Store.RootNote)

      // simulate note deleted in the past
      vi.setSystemTime(new Date(Date.now() - 90_000))
      Store.deleteEntry(Note)
      vi.setSystemTime(new Date(Date.now() + 90_000))

      // Advance past one check interval — auto-purge should have fired
      vi.advanceTimersByTime(600)
      expect(Store.EntryWithId(Note.Id)).toBeUndefined()
      Store.dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('D-22: moving an entry out of TrashNote removes Info._trashedAt', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Note  = Store.newNoteAt(Store.RootNote)
    Store.deleteEntry(Note)
    expect(typeof Note.Info['_trashedAt']).toBe('number')  // set by deleteEntry
    Store.moveEntryTo(Note, Store.RootNote)                // move back out of trash
    expect(Note.Info['_trashedAt']).toBeUndefined()        // cleaned up
  })

})
