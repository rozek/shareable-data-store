/*******************************************************************************
*                                                                              *
*                     SDS_SyncEngine — Lifecycle Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore }             from '@rozek/sds-core-jj'
import { SDS_SyncEngine }            from '../sds-sync-engine.js'

/**** makeMockPersistence — creates a fully-mocked persistence provider ****/

function makeMockPersistence () {
  return {
    loadSnapshot:    vi.fn().mockResolvedValue(undefined),
    saveSnapshot:    vi.fn().mockResolvedValue(undefined),
    loadPatchesSince:vi.fn().mockResolvedValue([]),
    appendPatch:     vi.fn().mockResolvedValue(undefined),
    prunePatches:    vi.fn().mockResolvedValue(undefined),
    loadValue:       vi.fn().mockResolvedValue(undefined),
    saveValue:       vi.fn().mockResolvedValue(undefined),
    releaseValue:    vi.fn().mockResolvedValue(undefined),
    close:           vi.fn().mockResolvedValue(undefined),
  }
}

/**** makeMockNetwork — creates a fully-mocked network provider with trigger helpers ****/

function makeMockNetwork (storeId = 'store-1') {
  const handlers: Record<string, Function[]> = { patch:[], value:[], conn:[], syncReq:[] }
  return {
    StoreId: storeId,
    get ConnectionState () { return 'disconnected' as const },
    connect:          vi.fn().mockResolvedValue(undefined),
    disconnect:       vi.fn(),
    sendPatch:        vi.fn(),
    sendValue:        vi.fn(),
    requestValue:     vi.fn(),
    sendSyncRequest:  vi.fn(),
    onPatch:          vi.fn((cb: Function) => { handlers.patch.push(cb); return () => {} }),
    onValue:          vi.fn((cb: Function) => { handlers.value.push(cb); return () => {} }),
    onConnectionChange:vi.fn((cb: Function) => { handlers.conn.push(cb); return () => {} }),
    onSyncRequest:    vi.fn((cb: Function) => { handlers.syncReq.push(cb); return () => {} }),
    sendLocalState:   vi.fn(),
    onRemoteState:    vi.fn().mockReturnValue(() => {}),
    get PeerSet ()  { return new Map() },
    _triggerConn:   (state: string) => handlers.conn.forEach((h) => h(state)),
    _triggerPatch:  (p: Uint8Array) => handlers.patch.forEach((h) => h(p)),
  }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_SyncEngine — Lifecycle', () => {

  it('SL-01: construct without options succeeds', () => {
    const Store  = SDS_DataStore.fromScratch()
    const Engine = new SDS_SyncEngine(Store)
    expect(Engine).toBeDefined()
    expect(Engine.PeerId).toBeTruthy()
  })

  it('SL-02: start() with no providers succeeds', async () => {
    const Store  = SDS_DataStore.fromScratch()
    const Engine = new SDS_SyncEngine(Store)
    await expect(Engine.start()).resolves.toBeUndefined()
    await Engine.stop()
  })

  it('SL-03: stop() calls persistence.close() and network.disconnect()', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, {
      PersistenceProvider: Persist,
      NetworkProvider:     Network as any,
    })
    await Engine.start()
    await Engine.stop()
    expect(Persist.close).toHaveBeenCalled()
    expect(Network.disconnect).toHaveBeenCalled()
  })

  it('SL-04: stop() always writes a checkpoint and closes persistence', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Persist = makeMockPersistence()
    const Engine  = new SDS_SyncEngine(Store, {
      PersistenceProvider: Persist,
    })
    await Engine.start()
    // No local changes — AccumulatedBytes stays 0; stop() must still checkpoint
    await Engine.stop()
    expect(Persist.saveSnapshot).toHaveBeenCalled()
    expect(Persist.close).toHaveBeenCalled()
  })

})
