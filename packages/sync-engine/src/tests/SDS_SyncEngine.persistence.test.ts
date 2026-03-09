/*******************************************************************************
*                                                                              *
*                   SDS_SyncEngine — Persistence Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_NoteStore }             from '@rozek/sds-core-jj'
import { SDS_SyncEngine }            from '../sds-sync-engine.js'

/**** makeMockPersistence — creates a fully-mocked persistence provider ****/

function makeMockPersistence (patches: Uint8Array[] = []) {
  return {
    loadSnapshot:     vi.fn().mockResolvedValue(undefined),
    saveSnapshot:     vi.fn().mockResolvedValue(undefined),
    loadPatchesSince: vi.fn().mockResolvedValue(patches),
    appendPatch:      vi.fn().mockResolvedValue(undefined),
    prunePatches:     vi.fn().mockResolvedValue(undefined),
    loadValue:        vi.fn().mockResolvedValue(undefined),
    saveValue:        vi.fn().mockResolvedValue(undefined),
    releaseValue:     vi.fn().mockResolvedValue(undefined),
    close:            vi.fn().mockResolvedValue(undefined),
  }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_SyncEngine — Persistence', () => {

  it('SP-01: start() calls loadPatchesSince and applies persisted patches to the store', async () => {
    // build a patch from a separate store instance.
    // capture the initial binary BEFORE any changes so TargetStore can start
    // from the same CRDT model base (patches only apply across compatible models).
    const SourceStore   = SDS_NoteStore.fromScratch()
    const InitialBinary = SourceStore.asBinary()
    const Note          = SourceStore.newNoteAt(SourceStore.RootNote)
    Note.Label          = 'persisted-note'
    const Patch         = SourceStore.exportPatch()
    expect(Patch.byteLength).toBeGreaterThan(0)

    // target store starts from the same initial binary (simulates restart from snapshot)
    const TargetStore = SDS_NoteStore.fromBinary(InitialBinary)
    const Persist     = makeMockPersistence([Patch])

    const Engine = new SDS_SyncEngine(TargetStore, { PersistenceProvider:Persist })
    await Engine.start()

    expect(Persist.loadPatchesSince).toHaveBeenCalledOnce()
    // the note should now exist in the target store after patch application
    expect(TargetStore.EntryWithId(Note.Id)).toBeTruthy()
    expect(TargetStore.EntryWithId(Note.Id)?.Label).toBe('persisted-note')

    await Engine.stop()
  })

  it('SP-02: internal store change calls appendPatch with patch bytes and monotone seq number', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    Store.newNoteAt(Store.RootNote)

    // give async ops a tick to settle
    await new Promise((r) => setTimeout(r, 10))

    expect(Persist.appendPatch).toHaveBeenCalledOnce()
    const [PatchArg, SeqArg] = Persist.appendPatch.mock.calls[0] as [Uint8Array, number]
    expect(PatchArg).toBeInstanceOf(Uint8Array)
    expect(PatchArg.byteLength).toBeGreaterThan(0)
    // seq number must be a plain integer > 0 (monotone, first patch = sequence 1)
    expect(typeof SeqArg).toBe('number')
    expect(SeqArg).toBeGreaterThan(0)

    await Engine.stop()
  })

  it('SP-03: accumulated bytes ≥ threshold triggers in-flight writeCheckpoint', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    // each label change generates a patch. We use a large label to quickly exceed
    // the 512 KiB (524,288 byte) threshold. With 150,000 chars per patch and
    // 4 iterations, accumulated bytes ≈ 600 KB > 512 KiB.
    const BigLabel = 'L'.repeat(150_000)
    const Note = Store.newNoteAt(Store.RootNote)
    for (let i = 0; i < 4; i++) {
      Note.Label = BigLabel + i
    }

    // allow async checkpoint writes to complete
    await new Promise((r) => setTimeout(r, 50))

    // saveSnapshot should have been called by the in-flight checkpoint
    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).toHaveBeenCalled()

    await Engine.stop()
  })

  it('SP-04: stop() calls prunePatches if AccumulatedBytes > 0 (stop-time checkpoint)', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    // trigger a small change — not enough for in-flight threshold
    Store.newNoteAt(Store.RootNote)

    await new Promise((r) => setTimeout(r, 10))

    // appendPatch must have been called (so AccumulatedBytes > 0)
    expect(Persist.appendPatch).toHaveBeenCalled()

    // stop() should trigger the checkpoint because AccumulatedBytes > 0
    await Engine.stop()

    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).toHaveBeenCalled()
    expect(Persist.close).toHaveBeenCalled()
  })

})
