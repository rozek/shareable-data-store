/*******************************************************************************
*                                                                              *
*                   SDS_SyncEngine — Persistence Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore }             from '@rozek/sds-core-jj'
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
    const SourceStore   = SDS_DataStore.fromScratch()
    const InitialBinary = SourceStore.asBinary()
    const Item = SourceStore.newItemAt(undefined, SourceStore.RootItem)
    Item.Label          = 'persisted-data'
    const Patch         = SourceStore.exportPatch()
    expect(Patch.byteLength).toBeGreaterThan(0)

    // target store starts from the same initial binary (simulates restart from snapshot)
    const TargetStore = SDS_DataStore.fromBinary(InitialBinary)
    const Persist     = makeMockPersistence([Patch])

    const Engine = new SDS_SyncEngine(TargetStore, { PersistenceProvider:Persist })
    await Engine.start()

    expect(Persist.loadPatchesSince).toHaveBeenCalledOnce()
    // the data should now exist in the target store after patch application
    expect(TargetStore.EntryWithId(Item.Id)).toBeTruthy()
    expect(TargetStore.EntryWithId(Item.Id)?.Label).toBe('persisted-data')

    await Engine.stop()
  })

  it('SP-02: internal store change calls appendPatch with patch bytes and monotone seq number', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    Store.newItemAt(undefined, Store.RootItem)

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
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    // writeValue with a string at the inline threshold (DefaultLiteralSizeLimit =
    // 131,072 chars) stores the full string in the CRDT patch (~131 KiB each).
    // Four such writes accumulate ≈ 524 KiB > 512 KiB checkpoint threshold.

    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Base = 'V'.repeat(131_071)
    for (let i = 0; i < 4; i++) {
      Item.writeValue(Base + i)  // vary last char so each call is a real change
    }

    // allow async checkpoint writes to complete
    await new Promise((r) => setTimeout(r, 50))

    // saveSnapshot should have been called by the in-flight checkpoint
    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).toHaveBeenCalled()

    await Engine.stop()
  })

  it('SP-04: stop() calls prunePatches if AccumulatedBytes > 0 (stop-time checkpoint)', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    // trigger a small change — not enough for in-flight threshold
    Store.newItemAt(undefined, Store.RootItem)

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
