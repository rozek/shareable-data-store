/*******************************************************************************
*                                                                              *
*                      SDS_SyncEngine — Network Tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore }             from '@rozek/sds-core-jj'
import { SDS_SyncEngine }            from '../sds-sync-engine.js'

/**** makeMockNetwork — creates a mocked network provider with trigger helpers ****/

function makeMockNetwork (storeId = 'store-1') {
  let connState = 'disconnected'
  const handlers: Record<string, Function[]> = { patch:[], value:[], conn:[], syncReq:[] }
  return {
    StoreId: storeId,
    get ConnectionState () { return connState as any },
    connect: vi.fn(async () => { connState = 'connected' }),
    disconnect: vi.fn(() => { connState = 'disconnected' }),
    sendPatch: vi.fn(),
    sendValue: vi.fn(),
    requestValue: vi.fn(),
    sendSyncRequest: vi.fn(),
    onPatch: vi.fn((cb: Function) => { handlers.patch.push(cb); return () => {} }),
    onValue: vi.fn((cb: Function) => { handlers.value.push(cb); return () => {} }),
    onConnectionChange: vi.fn((cb: Function) => { handlers.conn.push(cb); return () => {} }),
    onSyncRequest: vi.fn((cb: Function) => { handlers.syncReq.push(cb); return () => {} }),
    sendLocalState: vi.fn(),
    onRemoteState: vi.fn().mockReturnValue(() => {}),
    get PeerSet () { return new Map() },
    _triggerConn: (state: string) => { connState = state; handlers.conn.forEach((h) => h(state)) },
    _triggerPatch: (p: Uint8Array) => handlers.patch.forEach((h) => h(p)),
  }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_SyncEngine — Network', () => {

  it('SN-01: connectTo() without NetworkProvider throws SDS_Error', async () => {
    const Store  = SDS_DataStore.fromScratch()
    const Engine = new SDS_SyncEngine(Store)
    await Engine.start()
    await expect(Engine.connectTo('wss://x', { Token:'t' })).rejects.toThrow(expect.objectContaining({ code:'no-network-provider' }))
    await Engine.stop()
  })

  it('SN-02: reconnect() without prior connectTo() throws SDS_Error', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()
    await expect(Engine.reconnect()).rejects.toThrow(expect.objectContaining({ code:'not-yet-connected' }))
    await Engine.stop()
  })

  it('SN-03: when connected, internal store change triggers sendPatch', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()
    Network._triggerConn('connected')
    Store.newItemAt(undefined, Store.RootItem)
    await Engine.stop()
    expect(Network.sendPatch).toHaveBeenCalled()
  })

  it('SN-04: when disconnected, store change is queued; patch is sent after reconnect', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()

    // remain disconnected — create a data (patch should be queued, not sent)
    Store.newItemAt(undefined, Store.RootItem)
    expect(Network.sendPatch).not.toHaveBeenCalled()

    // now simulate reconnect — queued patch should be flushed
    Network._triggerConn('connected')
    expect(Network.sendPatch).toHaveBeenCalledOnce()

    await Engine.stop()
  })

  it('SR-01: on connection, engine sends a sync request with the current cursor', async () => {
    const Store   = SDS_DataStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()
    Network._triggerConn('connected')

    expect(Network.sendSyncRequest).toHaveBeenCalledOnce()
    const SentCursor = Network.sendSyncRequest.mock.calls[0][0] as Uint8Array
    expect(SentCursor).toBeInstanceOf(Uint8Array)

    await Engine.stop()
  })

  it('SR-02: incoming sync request triggers a full-state response after a random delay', async () => {
    vi.useFakeTimers()
    try {
      const Store   = SDS_DataStore.fromScratch()
      Store.newItemAt(undefined, Store.RootItem) // ensure store has exportable data
      const Network = makeMockNetwork()
      const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
      await Engine.start()
      Network._triggerConn('connected')

      // reset sendPatch calls from the connect phase
      Network.sendPatch.mockClear()

      // simulate an incoming sync request from another peer
      const SyncReqHandler = Network.onSyncRequest.mock.calls[0][0]
      SyncReqHandler(new Uint8Array(0))

      // sendPatch should not fire immediately (random delay 50–300 ms)
      expect(Network.sendPatch).not.toHaveBeenCalled()

      // advance past the maximum delay
      vi.advanceTimersByTime(300)

      expect(Network.sendPatch).toHaveBeenCalledOnce()
      const SentPatch = Network.sendPatch.mock.calls[0][0] as Uint8Array
      expect(SentPatch).toBeInstanceOf(Uint8Array)
      expect(SentPatch.byteLength).toBeGreaterThan(0)

      await Engine.stop()
    } finally {
      vi.useRealTimers()
    }
  })

  it('SR-03: sync response timer is cleared on stop()', async () => {
    vi.useFakeTimers()
    try {
      const Store   = SDS_DataStore.fromScratch()
      Store.newItemAt(undefined, Store.RootItem)
      const Network = makeMockNetwork()
      const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
      await Engine.start()
      Network._triggerConn('connected')

      Network.sendPatch.mockClear()

      // trigger a sync request — starts the delayed response timer
      const SyncReqHandler = Network.onSyncRequest.mock.calls[0][0]
      SyncReqHandler(new Uint8Array(0))

      // stop before the timer fires
      await Engine.stop()

      // advance past the delay — sendPatch must NOT fire
      vi.advanceTimersByTime(300)
      expect(Network.sendPatch).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('SN-05: incoming network patch triggers store.applyRemotePatch', async () => {
    const Store1  = SDS_DataStore.fromScratch()
    const Store2  = SDS_DataStore.fromBinary(Store1.asBinary())
    const Item = Store1.newItemAt(undefined, Store1.RootItem)
    Item.Label    = 'synced'
    const Patch   = Store1.exportPatch()

    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store2, { NetworkProvider:Network as any })
    await Engine.start()
    Network._triggerPatch(Patch)
    await Engine.stop()
    expect(Store2.EntryWithId(Item.Id)?.Label).toBe('synced')
  })

})
