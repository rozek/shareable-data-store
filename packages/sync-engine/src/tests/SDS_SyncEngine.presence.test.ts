/*******************************************************************************
*                                                                              *
*                      SDS_SyncEngine — Presence Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore }             from '@rozek/sds-core-jj'
import { SDS_SyncEngine }            from '../sds-sync-engine.js'

/**** makeMockPresence — creates a mocked presence provider with trigger helper ****/

function makeMockPresence () {
  const remoteHandlers: Function[] = []
  return {
    sendLocalState: vi.fn(),
    onRemoteState: vi.fn((cb: Function) => {
      remoteHandlers.push(cb)
      return () => {}
    }),
    get PeerSet () { return new Map() },
    _triggerRemote: (peerId: string, state: any) => {
      remoteHandlers.forEach((h) => h(peerId, state))
    },
  }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_SyncEngine — Presence', () => {

  it('SS-01: setPresenceTo() calls presence.sendLocalState()', async () => {
    const Store    = SDS_DataStore.fromScratch()
    const Presence = makeMockPresence()
    const Engine   = new SDS_SyncEngine(Store, { PresenceProvider:Presence as any })
    await Engine.start()
    Engine.setPresenceTo({ UserName:'alice' })
    expect(Presence.sendLocalState).toHaveBeenCalledWith({ UserName:'alice' })
    await Engine.stop()
  })

  it('SS-02: setPresenceTo fires onPresenceChange with local origin', async () => {
    const Store    = SDS_DataStore.fromScratch()
    const Presence = makeMockPresence()
    const Engine   = new SDS_SyncEngine(Store, { PresenceProvider:Presence as any })
    await Engine.start()
    const Handler  = vi.fn()
    Engine.onPresenceChange(Handler)
    Engine.setPresenceTo({ UserName:'bob' })
    expect(Handler).toHaveBeenCalledWith(
      Engine.PeerId,
      expect.objectContaining({ UserName:'bob' }),
      'local'
    )
    await Engine.stop()
  })

  it('SS-03: incoming remote presence triggers onPresenceChange with remote origin', async () => {
    const Store    = SDS_DataStore.fromScratch()
    const Presence = makeMockPresence()
    const Engine   = new SDS_SyncEngine(Store, { PresenceProvider:Presence as any })
    await Engine.start()
    const Handler  = vi.fn()
    Engine.onPresenceChange(Handler)
    Presence._triggerRemote('peer-x', { PeerId:'peer-x', UserName:'carol', lastSeen:0 })
    expect(Handler).toHaveBeenCalledWith(
      'peer-x',
      expect.objectContaining({ UserName:'carol' }),
      'remote'
    )
    await Engine.stop()
  })

  it('SS-04: peer timeout fires onPresenceChange with undefined state', async () => {
    vi.useFakeTimers()
    const Store    = SDS_DataStore.fromScratch()
    const Presence = makeMockPresence()
    const Engine   = new SDS_SyncEngine(Store, {
      PresenceProvider:  Presence as any,
      PresenceTimeoutMs: 1000,
    })
    await Engine.start()
    const Handler = vi.fn()
    Engine.onPresenceChange(Handler)
    Presence._triggerRemote('peer-y', { PeerId:'peer-y', UserName:'dave', lastSeen:0 })
    Handler.mockClear()
    vi.advanceTimersByTime(1100)
    expect(Handler).toHaveBeenCalledWith('peer-y', undefined, 'remote')
    vi.useRealTimers()
    await Engine.stop()
  })

  it('SS-05: setPresenceTo with custom field passes custom data to sendLocalState', async () => {
    const Store    = SDS_DataStore.fromScratch()
    const Presence = makeMockPresence()
    const Engine   = new SDS_SyncEngine(Store, { PresenceProvider:Presence as any })
    await Engine.start()
    Engine.setPresenceTo({ UserName:'alice', custom:{ score:42 } })
    expect(Presence.sendLocalState).toHaveBeenCalledWith(
      expect.objectContaining({ custom:{ score:42 } })
    )
    await Engine.stop()
  })

})
