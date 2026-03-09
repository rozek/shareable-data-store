/*******************************************************************************
*                                                                              *
*               SDS_WebRTCProvider — Fallback Tests                            *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SDS_WebRTCProvider }                    from '../sds-network-webrtc.js'

/**** FakeWebSocket — minimal WebSocket stub for fallback tests ****/

  let MockWsInstance: any

  class FakeWebSocket {
    static OPEN = 1
    readyState  = 0
    onopen:   (() => void) | null             = null
    onerror:  ((e:any) => void) | null        = null
    onclose:  (() => void) | null             = null
    onmessage:((e:{ data:any }) => void) | null = null
    constructor (_url:string) { MockWsInstance = this }
    send (_Data:any) {}
    close () {}
  }

/**** makeMockFallback — creates a fully-mocked WebSocket fallback provider ****/

  function makeMockFallback () {
    return {
      StoreID:           'store-1',
      get ConnectionState () { return 'disconnected' as const },
      connect:           vi.fn().mockResolvedValue(undefined),
      disconnect:        vi.fn(),
      sendPatch:         vi.fn(),
      sendValue:         vi.fn(),
      requestValue:      vi.fn(),
      onPatch:           vi.fn().mockReturnValue(() => {}),
      onValue:           vi.fn().mockReturnValue(() => {}),
      onConnectionChange:vi.fn().mockReturnValue(() => {}),
      sendLocalState:    vi.fn(),
      onRemoteState:     vi.fn().mockReturnValue(() => {}),
      get PeerSet ()  { return new Map() },
    }
  }

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_WebRTCProvider — Fallback', () => {
  beforeEach(() => {
    ;(global as any).WebSocket = FakeWebSocket
    MockWsInstance = null
  })

  it('RF-01: when signalling WS errors, Fallback.connect() is called with /ws/ URL', async () => {
    const Fallback = makeMockFallback()
    const P        = new SDS_WebRTCProvider('store-1', { Fallback:Fallback as any })

    const ConnectPromise = P.connect('wss://host/signal/store-1', { Token:'tok' })

    // Trigger WebSocket error to activate fallback
    MockWsInstance?.onerror?.({})

    await ConnectPromise

    expect(Fallback.connect).toHaveBeenCalledOnce()
    const [CalledUrl, CalledOpts] = Fallback.connect.mock.calls[0] as [string, any]
    expect(CalledUrl).toContain('/ws/')
    expect(CalledUrl).not.toContain('/signal/')
    expect(CalledOpts.Token).toBe('tok')
  })

  it('RF-02: after fallback activation, sendPatch delegates to Fallback', async () => {
    const Fallback = makeMockFallback()
    const P        = new SDS_WebRTCProvider('store-1', { Fallback:Fallback as any })

    const ConnectPromise = P.connect('wss://host/signal/store-1', { Token:'tok' })
    MockWsInstance?.onerror?.({})
    await ConnectPromise

    const Patch = new Uint8Array([1, 2, 3])
    P.sendPatch(Patch)

    expect(Fallback.sendPatch).toHaveBeenCalledWith(Patch)
  })
})
