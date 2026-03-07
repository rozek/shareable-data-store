/*******************************************************************************
*                                                                              *
*               SNS_WebSocketProvider — Presence Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SNS_WebSocketProvider }                 from '../sns-network-websocket.js'

/**** FakeWebSocket — minimal WebSocket stub for presence tests ****/

let MockWsInstance: any

class FakeWebSocket {
  static OPEN = 1
  readyState  = 1
  binaryType  = ''
  onopen:   (() => void) | null                         = null
  onerror:  ((e:any) => void) | null                    = null
  onclose:  (() => void) | null                         = null
  onmessage:((e:{ data:ArrayBuffer }) => void) | null   = null
  constructor (_url:string) { MockWsInstance = this }
  send () {}
  close () {}
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_WebSocketProvider — Presence', () => {

  let Provider: SNS_WebSocketProvider

  beforeEach(() => {
    ;(global as any).WebSocket = FakeWebSocket
    Provider = new SNS_WebSocketProvider('store-1')
  })

  async function connect () {
    const CP = Provider.connect('wss://example.com/ws/store-1', { Token:'tok' })
    MockWsInstance.onopen?.()
    await CP
  }

  function makePresenceFrame (State:object):Uint8Array {
    const Json  = JSON.stringify(State)
    const Bytes = new TextEncoder().encode(Json)
    const Frame = new Uint8Array(1+Bytes.byteLength)
    Frame[0]    = 0x04
    Frame.set(Bytes, 1)
    return Frame
  }

  it('WP-01: PeerSet is empty on construction', () => {
    expect(Provider.PeerSet.size).toBe(0)
  })

  it('WP-02: incoming PRESENCE frame updates PeerSet', async () => {
    await connect()
    const State = { PeerId:'peer-1', UserName:'bob', lastSeen:0 }
    MockWsInstance.onmessage?.({ data:makePresenceFrame(State).buffer })
    expect(Provider.PeerSet.has('peer-1')).toBe(true)
    expect(Provider.PeerSet.get('peer-1')?.UserName).toBe('bob')
  })

  it('WP-03: onRemoteState handler is called with incoming presence', async () => {
    await connect()
    const Handler = vi.fn()
    Provider.onRemoteState(Handler)
    const State = { PeerId:'peer-2', UserName:'carol', lastSeen:0 }
    MockWsInstance.onmessage?.({ data:makePresenceFrame(State).buffer })
    expect(Handler).toHaveBeenCalledTimes(1)
    expect(Handler.mock.calls[0][0]).toBe('peer-2')
    expect(Handler.mock.calls[0][1]).toMatchObject({ UserName:'carol' })
  })

  it('WP-04: incoming PRESENCE frame with custom field → PeerSet entry has correct custom data', async () => {
    await connect()
    const State = { PeerId:'peer-3', UserName:'dave', lastSeen:0, custom:{ role:'editor' } }
    MockWsInstance.onmessage?.({ data:makePresenceFrame(State).buffer })
    expect(Provider.PeerSet.get('peer-3')?.custom).toEqual({ role:'editor' })
  })

})
