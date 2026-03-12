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

    // saveSnapshot is called by the in-flight checkpoint; patches are NOT pruned
    // because this is an offline engine (no NetworkProvider) — patches must
    // survive so that a future 'store sync' run can upload them to the server
    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).not.toHaveBeenCalled()

    await Engine.stop()
  })

  it('SP-04: stop() writes a checkpoint but does NOT prune patches for offline engines', async () => {
    // offline-only engines (no NetworkProvider) must keep their patches in SQLite
    // so that a subsequent 'store sync' run can upload them to the server
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()

    const Engine = new SDS_SyncEngine(Store, { PersistenceProvider:Persist })
    await Engine.start()

    // trigger a small change — not enough for in-flight threshold
    Store.newItemAt(undefined, Store.RootItem)

    await new Promise((r) => setTimeout(r, 10))

    // appendPatch must have been called
    expect(Persist.appendPatch).toHaveBeenCalled()

    await Engine.stop()

    // snapshot is saved but patches are kept (offline engine: no NetworkProvider)
    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).not.toHaveBeenCalled()
    expect(Persist.close).toHaveBeenCalled()
  })

  it('SP-05: stop() writes checkpoint even when only remote patches were received (AccumulatedBytes stays 0)', async () => {
    // simulates the "new machine" bootstrap scenario:
    // store sync receives remote patches from the server but produces no local
    // changes — AccumulatedBytes stays 0; stop() must still persist the state
    // so that subsequent commands (tree show, entry list, …) can open the store

    // build a remote patch from a separate store instance
    const SourceStore   = SDS_DataStore.fromScratch()
    const InitialBinary = SourceStore.asBinary()
    const Item          = SourceStore.newItemAt(undefined, SourceStore.RootItem)
    Item.Label          = 'remote-item'
    const RemotePatch   = SourceStore.exportPatch()

    // target store starts from the same initial binary (no local snapshot yet)
    const TargetStore = SDS_DataStore.fromBinary(InitialBinary)
    const Persist     = makeMockPersistence()

    const handlers: Function[] = []
    const MockNetwork = {
      StoreId: 'test',
      get ConnectionState () { return 'disconnected' as const },
      connect:            () => Promise.resolve(),
      disconnect:         () => {},
      sendPatch:          () => {},
      sendValue:          () => {},
      requestValue:       () => {},
      onPatch:            (cb: Function) => { handlers.push(cb); return () => {} },
      onValue:            () => () => {},
      onConnectionChange: () => () => {},
      sendLocalState:     () => {},
      onRemoteState:      () => () => {},
      get PeerSet ()      { return new Map() },
    }

    const Engine = new SDS_SyncEngine(TargetStore, {
      PersistenceProvider: Persist,
      NetworkProvider:     MockNetwork as any,
    })
    await Engine.start()

    // deliver the remote patch — this changes the store but NOT AccumulatedBytes
    handlers.forEach((h) => h(RemotePatch))
    await new Promise((r) => setTimeout(r, 10))

    // no local patches were appended
    expect(Persist.appendPatch).not.toHaveBeenCalled()

    // stop() must still checkpoint so the remote state is persisted
    await Engine.stop()

    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.prunePatches).toHaveBeenCalled()
    expect(Persist.close).toHaveBeenCalled()

    // the persisted snapshot must contain the remote item
    const SnapshotArg = Persist.saveSnapshot.mock.calls[0][0] as Uint8Array
    const RestoredStore = SDS_DataStore.fromBinary(SnapshotArg)
    expect(RestoredStore.EntryWithId(Item.Id)?.Label).toBe('remote-item')
  })

  it('SP-06: network engines prune patches on checkpoint; offline engines do not', async () => {
    // ── offline engine: patches must survive stop() ───────────────────────
    const OfflineStore   = SDS_DataStore.fromScratch()
    const OfflinePersist = makeMockPersistence()

    const OfflineEngine = new SDS_SyncEngine(OfflineStore, {
      PersistenceProvider: OfflinePersist,
    })
    await OfflineEngine.start()
    OfflineStore.newItemAt(undefined, OfflineStore.RootItem)
    await new Promise((r) => setTimeout(r, 10))
    await OfflineEngine.stop()

    expect(OfflinePersist.saveSnapshot).toHaveBeenCalled()
    expect(OfflinePersist.prunePatches).not.toHaveBeenCalled()

    // ── network engine: patches are pruned after checkpoint ───────────────
    const NetworkStore   = SDS_DataStore.fromScratch()
    const NetworkPersist = makeMockPersistence()
    const MockNetwork = {
      StoreId: 'test',
      get ConnectionState () { return 'disconnected' as const },
      connect:            () => Promise.resolve(),
      disconnect:         () => {},
      sendPatch:          () => {},
      sendValue:          () => {},
      requestValue:       () => {},
      onPatch:            () => () => {},
      onValue:            () => () => {},
      onConnectionChange: () => () => {},
      sendLocalState:     () => {},
      onRemoteState:      () => () => {},
      get PeerSet ()      { return new Map() },
    }

    const NetworkEngine = new SDS_SyncEngine(NetworkStore, {
      PersistenceProvider: NetworkPersist,
      NetworkProvider:     MockNetwork as any,
    })
    await NetworkEngine.start()
    NetworkStore.newItemAt(undefined, NetworkStore.RootItem)
    await new Promise((r) => setTimeout(r, 10))
    await NetworkEngine.stop()

    expect(NetworkPersist.saveSnapshot).toHaveBeenCalled()
    expect(NetworkPersist.prunePatches).toHaveBeenCalled()
  })

})
