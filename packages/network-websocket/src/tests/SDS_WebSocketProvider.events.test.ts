/*******************************************************************************
*                                                                              *
*                SDS_WebSocketProvider — Events Tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SDS_WebSocketProvider }                 from '../sds-network-websocket.js'

/**** FakeWebSocket — minimal WebSocket stub for event tests ****/

const Sent: Uint8Array[] = []
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
  send (D:Uint8Array) { Sent.push(D) }
  close () {}
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_WebSocketProvider — Events', () => {

  let Provider: SDS_WebSocketProvider

  beforeEach(() => {
    Sent.length = 0
    ;(global as any).WebSocket = FakeWebSocket
    Provider = new SDS_WebSocketProvider('store-1')
  })

  async function connect () {
    const CP = Provider.connect('wss://example.com/ws/store-1', { Token:'tok' })
    MockWsInstance.onopen?.()
    await CP
  }

  it('WE-01: onPatch callback invoked when 0x01 frame received', async () => {
    await connect()
    const Handler = vi.fn()
    Provider.onPatch(Handler)
    const Frame = new Uint8Array([0x01, 10, 20])
    MockWsInstance.onmessage?.({ data:Frame.buffer })
    expect(Handler).toHaveBeenCalledTimes(1)
    expect(Array.from(Handler.mock.calls[0][0])).toEqual([10, 20])
  })

  it('WE-02: onValue callback invoked when 0x02 frame received', async () => {
    await connect()
    const Handler = vi.fn()
    Provider.onValue(Handler)
    const Hash  = new Uint8Array(32).fill(0xab)
    const Frame = new Uint8Array(1+32+3)
    Frame[0] = 0x02
    Frame.set(Hash, 1)
    Frame.set([1, 2, 3], 33)
    MockWsInstance.onmessage?.({ data:Frame.buffer })
    expect(Handler).toHaveBeenCalledTimes(1)
    expect(Array.from(Handler.mock.calls[0][1])).toEqual([1, 2, 3])
  })

  it('WE-03: onConnectionChange fires on connect and disconnect', async () => {
    const Handler = vi.fn()
    Provider.onConnectionChange(Handler)
    const CP = Provider.connect('wss://example.com/ws/store-1', { Token:'tok' })
    expect(Handler).toHaveBeenCalledWith('connecting')
    MockWsInstance.onopen?.()
    await CP
    expect(Handler).toHaveBeenCalledWith('connected')
    Provider.disconnect()
    expect(Handler).toHaveBeenCalledWith('disconnected')
  })

  it('WE-04: unsubscribe stops further callbacks', async () => {
    await connect()
    const Handler = vi.fn()
    const Unsub   = Provider.onPatch(Handler)
    Unsub()
    MockWsInstance.onmessage?.({ data:new Uint8Array([0x01, 5]).buffer })
    expect(Handler).not.toHaveBeenCalled()
  })

  it('WE-05: onConnectionChange fires reconnecting on unexpected close', async () => {
    const Handler = vi.fn()
    Provider.onConnectionChange(Handler)
    await connect()
    Handler.mockClear()
    MockWsInstance.onclose?.()
    expect(Handler).toHaveBeenCalledWith('reconnecting')
    Provider.disconnect()
  })

  it('WE-06: malformed frame (too short) is silently ignored', async () => {
    await connect()
    const Handler = vi.fn()
    Provider.onPatch(Handler)
    MockWsInstance.onmessage?.({ data:new ArrayBuffer(0) })
    expect(Handler).not.toHaveBeenCalled()
  })

})
