/*******************************************************************************
*                                                                              *
*                      SDS_NoteStore — Sync Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_NoteStore }             from '../store/SDS_NoteStore.js'
import type { SDS_Note }             from '../store/SDS_Note.js'
import type { SDS_ChangeSet }        from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_NoteStore — Sync', () => {
  it('SY-01: two stores from same binary start identical', () => {
    const Store1 = SDS_NoteStore.fromScratch()
    const Binary = Store1.asBinary()
    const Store2 = SDS_NoteStore.fromBinary(Binary)
    expect(Store2.RootNote.Id).toBe(Store1.RootNote.Id)
    expect(Store2.TrashNote.Id).toBe(Store1.TrashNote.Id)
  })

  it('SY-02: exportPatch from Store1 applied to Store2 propagates mutation', () => {
    const Store1   = SDS_NoteStore.fromScratch()
    const Binary   = Store1.asBinary()
    const Store2   = SDS_NoteStore.fromBinary(Binary)

    const Note     = Store1.newNoteAt(Store1.RootNote)
    Note.Label     = 'synced note'

    const Patch    = Store1.exportPatch()
    Store2.applyRemotePatch(Patch)

    expect(Store2.EntryWithId(Note.Id)?.Label).toBe('synced note')
  })

  it('SY-03: merging patches from both stores preserves all changes', () => {
    const Store1   = SDS_NoteStore.fromScratch()
    const Binary   = Store1.asBinary()
    const Store2   = SDS_NoteStore.fromBinary(Binary)

    const Note1    = Store1.newNoteAt(Store1.RootNote)
    Note1.Label    = 'from store 1'
    const Note2    = Store2.newNoteAt(Store2.RootNote)
    Note2.Label    = 'from store 2'

    Store2.applyRemotePatch(Store1.exportPatch())
    Store1.applyRemotePatch(Store2.exportPatch())

    expect(Store1.EntryWithId(Note2.Id)).toBeDefined()
    expect(Store2.EntryWithId(Note1.Id)).toBeDefined()
  })

  it('SY-04: recoverOrphans on clean store is a no-op', () => {
    const Store = SDS_NoteStore.fromScratch()
    const Before = Store.LostAndFoundNote.innerEntryList.length
    Store.recoverOrphans()
    expect(Store.LostAndFoundNote.innerEntryList.length).toBe(Before)
  })

  it('SY-06: applyRemotePatch containing a move updates innerEntryList on the receiver', () => {
    const StoreA    = SDS_NoteStore.fromScratch()
    const StoreB    = SDS_NoteStore.fromBinary(StoreA.asBinary())

    const OuterNote = StoreA.newNoteAt(StoreA.RootNote)
    const Note      = StoreA.newNoteAt(OuterNote)
    StoreA.moveEntryTo(Note, StoreA.RootNote)

    StoreB.applyRemotePatch(StoreA.exportPatch())

    // note must sit under RootNote on the receiver.
    expect(StoreB.EntryWithId(Note.Id)?.outerNote?.Id).toBe(StoreB.RootNote.Id)

    const RootChildIds = Array.from(StoreB.RootNote.innerEntryList).map(e => e.Id)
    expect(RootChildIds).toContain(Note.Id)

    const OuterNoteOnB = StoreB.EntryWithId(OuterNote.Id) as SDS_Note
    const OuterNoteChildIds = Array.from(OuterNoteOnB.innerEntryList).map(e => e.Id)
    expect(OuterNoteChildIds).not.toContain(Note.Id)
  })

  it('SY-07: applyRemotePatch containing a purge removes the entry from the receiver', () => {
    const StoreA = SDS_NoteStore.fromScratch()
    const StoreB = SDS_NoteStore.fromBinary(StoreA.asBinary())

    const Note   = StoreA.newNoteAt(StoreA.RootNote)
    StoreA.deleteEntry(Note)
    StoreA.purgeEntry(Note)

    StoreB.applyRemotePatch(StoreA.exportPatch())

    expect(StoreB.EntryWithId(Note.Id)).toBeUndefined()
    const TrashChildIds = Array.from(StoreB.TrashNote.innerEntryList).map(e => e.Id)
    expect(TrashChildIds).not.toContain(Note.Id)
  })

  it('SY-08: ChangeSet from applyRemotePatch records outerNote only for moved entries', () => {
    const StoreA     = SDS_NoteStore.fromScratch()
    const StoreB     = SDS_NoteStore.fromBinary(StoreA.asBinary())

    // bystander exists on StoreB before the remote patch arrives.
    const Bystander  = StoreB.newNoteAt(StoreB.RootNote)

    // storeA creates a new note (not yet known to StoreB).
    const RemoteNote = StoreA.newNoteAt(StoreA.RootNote)

    let ReceivedChangeSet:SDS_ChangeSet | undefined
    StoreB.onChangeInvoke((_Origin, ChangeSet) => { ReceivedChangeSet = ChangeSet })
    StoreB.applyRemotePatch(StoreA.exportPatch())

    // the newly arrived note must appear in the ChangeSet with outerNote.
    expect(ReceivedChangeSet?.[RemoteNote.Id]?.has('outerNote')).toBe(true)

    // RootNote gained an inner entry, so its innerEntryList must be in the ChangeSet.
    expect(ReceivedChangeSet?.[StoreB.RootNote.Id]?.has('innerEntryList')).toBe(true)

    // the bystander's placement did not change — no outerNote in its ChangeSet entry.
    expect(ReceivedChangeSet?.[Bystander.Id]?.has('outerNote')).toBeFalsy()
  })

  it('EV-10: Origin is external after applyRemotePatch', () => {
    const Store1   = SDS_NoteStore.fromScratch()
    const Store2   = SDS_NoteStore.fromBinary(Store1.asBinary())
    Store1.newNoteAt(Store1.RootNote)
    const Patch    = Store1.exportPatch()
    const Handler  = vi.fn()
    Store2.onChangeInvoke(Handler)
    Store2.applyRemotePatch(Patch)
    expect(Handler.mock.calls[0][0]).toBe('external')
  })
})
