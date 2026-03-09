/*******************************************************************************
*                                                                              *
*                      SDS_SyncEngine — Network Tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_NoteStore }             from '@rozek/sds-core-jj'
import { SDS_SyncEngine }            from '../sds-sync-engine.js'

/**** makeMockNetwork — creates a mocked network provider with trigger helpers ****/

function makeMockNetwork (storeId = 'store-1') {
  let connState = 'disconnected'
  const handlers: Record<string, Function[]> = { patch:[], value:[], conn:[] }
  return {
    StoreID: storeId,
    get ConnectionState () { return connState as any },
    connect: vi.fn(async () => { connState = 'connected' }),
    disconnect: vi.fn(() => { connState = 'disconnected' }),
    sendPatch: vi.fn(),
    sendValue: vi.fn(),
    requestValue: vi.fn(),
    onPatch: vi.fn((cb: Function) => { handlers.patch.push(cb); return () => {} }),
    onValue: vi.fn((cb: Function) => { handlers.value.push(cb); return () => {} }),
    onConnectionChange: vi.fn((cb: Function) => { handlers.conn.push(cb); return () => {} }),
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
    const Store  = SDS_NoteStore.fromScratch()
    const Engine = new SDS_SyncEngine(Store)
    await Engine.start()
    await expect(Engine.connectTo('wss://x', { Token:'t' })).rejects.toThrow(expect.objectContaining({ Code:'no-network-provider' }))
    await Engine.stop()
  })

  it('SN-02: reconnect() without prior connectTo() throws SDS_Error', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()
    await expect(Engine.reconnect()).rejects.toThrow(expect.objectContaining({ Code:'not-yet-connected' }))
    await Engine.stop()
  })

  it('SN-03: when connected, internal store change triggers sendPatch', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()
    Network._triggerConn('connected')
    Store.newNoteAt(Store.RootNote)
    await Engine.stop()
    expect(Network.sendPatch).toHaveBeenCalled()
  })

  it('SN-04: when disconnected, store change is queued; patch is sent after reconnect', async () => {
    const Store   = SDS_NoteStore.fromScratch()
    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store, { NetworkProvider:Network as any })
    await Engine.start()

    // remain disconnected — create a note (patch should be queued, not sent)
    Store.newNoteAt(Store.RootNote)
    expect(Network.sendPatch).not.toHaveBeenCalled()

    // now simulate reconnect — queued patch should be flushed
    Network._triggerConn('connected')
    expect(Network.sendPatch).toHaveBeenCalledOnce()

    await Engine.stop()
  })

  it('SN-05: incoming network patch triggers store.applyRemotePatch', async () => {
    const Store1  = SDS_NoteStore.fromScratch()
    const Store2  = SDS_NoteStore.fromBinary(Store1.asBinary())
    const Note    = Store1.newNoteAt(Store1.RootNote)
    Note.Label    = 'synced'
    const Patch   = Store1.exportPatch()

    const Network = makeMockNetwork()
    const Engine  = new SDS_SyncEngine(Store2, { NetworkProvider:Network as any })
    await Engine.start()
    Network._triggerPatch(Patch)
    await Engine.stop()
    expect(Store2.EntryWithId(Note.Id)?.Label).toBe('synced')
  })

})
