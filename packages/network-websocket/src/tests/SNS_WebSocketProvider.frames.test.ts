/*******************************************************************************
*                                                                              *
*               SNS_WebSocketProvider — Frame Protocol Tests                   *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SNS_WebSocketProvider }                 from '../sns-network-websocket.js'

/**** FakeWebSocket — minimal WebSocket stub for frame protocol tests ****/

const Sent: Uint8Array[] = []
let MockWsInstance: any

class FakeWebSocket {
  static OPEN      = 1
  static CLOSED    = 3
  readyState       = 1
  binaryType       = ''
  onopen:  (() => void) | null                                 = null
  onerror: ((e:any) => void) | null                            = null
  onclose: (() => void) | null                                 = null
  onmessage: ((e:{ data:ArrayBuffer }) => void) | null         = null

  constructor (_url:string) { MockWsInstance = this }

  send (Data:Uint8Array) { Sent.push(Data) }
  close () {}
}

/**** hexToBytes — converts a hex string to a Uint8Array ****/

function hexToBytes (Hex:string):Uint8Array {
  const B = new Uint8Array(Hex.length/2)
  for (let i = 0; i < Hex.length; i += 2) { B[i/2] = parseInt(Hex.slice(i,i+2), 16) }
  return B
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_WebSocketProvider — Frame Protocol', () => {

  let Provider: SNS_WebSocketProvider

  beforeEach(() => {
    Sent.length = 0
    // patch global WebSocket with fake
    ;(global as any).WebSocket = FakeWebSocket
    Provider = new SNS_WebSocketProvider('store-1')
  })

  async function connect () {
    const ConnPromise = Provider.connect('wss://example.com/ws/store-1', { Token:'tok' })
    MockWsInstance.onopen?.()
    await ConnPromise
  }

  it('WF-01: sendPatch sends 0x01 frame with patch bytes', async () => {
    await connect()
    const Patch = new Uint8Array([11, 22, 33])
    Provider.sendPatch(Patch)
    expect(Sent).toHaveLength(1)
    expect(Sent[0][0]).toBe(0x01)
    expect(Array.from(Sent[0].slice(1))).toEqual([11, 22, 33])
  })

  it('WF-02: sendValue (small) sends 0x02 frame with 32-byte hash + data', async () => {
    await connect()
    const Hash = 'a'.repeat(64)  // 32 hex bytes = 64 hex chars
    const Data = new Uint8Array([1, 2])
    Provider.sendValue(Hash, Data)
    expect(Sent).toHaveLength(1)
    expect(Sent[0][0]).toBe(0x02)
    expect(Sent[0].byteLength).toBe(1+32+2)
  })

  it('WF-04: requestValue sends 0x03 frame with 32-byte hash', async () => {
    await connect()
    Provider.requestValue('b'.repeat(64))
    expect(Sent).toHaveLength(1)
    expect(Sent[0][0]).toBe(0x03)
    expect(Sent[0].byteLength).toBe(1+32)
  })

  it('WF-05: sendLocalState sends 0x04 frame with JSON presence', async () => {
    await connect()
    Provider.sendLocalState({ UserName:'alice' })
    expect(Sent).toHaveLength(1)
    expect(Sent[0][0]).toBe(0x04)
    const JSON_ = new TextDecoder().decode(Sent[0].slice(1))
    expect(JSON.parse(JSON_)).toMatchObject({ UserName:'alice' })
  })

  it('WF-07: sendLocalState with custom field includes custom data in JSON payload', async () => {
    await connect()
    Provider.sendLocalState({ UserName:'alice', custom:{ score:42 } })
    expect(Sent).toHaveLength(1)
    expect(Sent[0][0]).toBe(0x04)
    const JSON_ = new TextDecoder().decode(Sent[0].slice(1))
    expect(JSON.parse(JSON_)).toMatchObject({ custom:{ score:42 } })
  })

  it('WF-06: incoming VALUE_CHUNK frames are reassembled before firing onValue', async () => {
    await connect()
    const HashHex  = 'c'.repeat(64)
    const HashBytes= hexToBytes(HashHex)
    const onValue  = vi.fn()
    Provider.onValue(onValue)

    function makeChunkFrame (idx:number, total:number, chunk:Uint8Array):Uint8Array {
      const Header = new Uint8Array(1+32+8)
      Header[0] = 0x05
      Header.set(HashBytes, 1)
      new DataView(Header.buffer).setUint32(1+32,   idx,   false)
      new DataView(Header.buffer).setUint32(1+32+4, total, false)
      const Frame = new Uint8Array(Header.byteLength+chunk.byteLength)
      Frame.set(Header, 0)
      Frame.set(chunk, Header.byteLength)
      return Frame
    }

    // 2 chunks
    const Chunk1 = new Uint8Array([1, 2])
    const Chunk2 = new Uint8Array([3, 4])
    MockWsInstance.onmessage?.({ data:makeChunkFrame(0, 2, Chunk1).buffer })
    expect(onValue).not.toHaveBeenCalled()
    MockWsInstance.onmessage?.({ data:makeChunkFrame(1, 2, Chunk2).buffer })
    expect(onValue).toHaveBeenCalledTimes(1)
    const [hash, assembled] = onValue.mock.calls[0]
    expect(hash).toBe(HashHex)
    expect(Array.from(assembled)).toEqual([1, 2, 3, 4])
  })

})
