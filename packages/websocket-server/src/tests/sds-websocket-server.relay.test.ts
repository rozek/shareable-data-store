/*******************************************************************************
*                                                                              *
*                  SNS WebSocket Server — Relay Tests                          *
*                                                                              *
*******************************************************************************/

  import { describe, it, expect, vi } from 'vitest'
  import { LiveStore, rejectWriteFrame } from '../sds-websocket-server.js'
  import type { LiveClient }             from '../sds-websocket-server.js'

/**** makeClient — creates a mock LiveClient with a recorded send buffer ****/

  function makeClient (scope: 'read' | 'write' | 'admin' = 'write'): LiveClient & { received: Uint8Array[] } {
    const received: Uint8Array[] = []
    return {
      scope,
      send: vi.fn((Data: Uint8Array) => { received.push(Data) }) as any,
      received,
    }
  }

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

  describe('SNS WebSocket Server — Relay', () => {
    it('SR-01: PATCH frame from write client is relayed to all other clients', () => {
      const Store   = new LiveStore('store-1')
      const Sender  = makeClient('write')
      const Other1  = makeClient('write')
      const Other2  = makeClient('read')

      Store.addClient(Sender)
      Store.addClient(Other1)
      Store.addClient(Other2)

      const Frame = new Uint8Array([0x01, 10, 20, 30])
      Store.broadcast(Frame, Sender)

      expect((Other1 as any).send).toHaveBeenCalledWith(Frame)
      expect((Other2 as any).send).toHaveBeenCalledWith(Frame)
      expect((Sender as any).send).not.toHaveBeenCalled()
    })

    it('SR-02: PATCH frame from read client is identified and would be dropped by the handler', () => {
      // rejectWriteFrame() decides whether to silently drop a frame from a read client.
      // The server's onMessage calls: if (scope === 'read' && rejectWriteFrame(msgType)) return
      expect(rejectWriteFrame(0x01)).toBe(true)   // MSG_PATCH
      expect(rejectWriteFrame(0x02)).toBe(true)   // MSG_VALUE
      expect(rejectWriteFrame(0x05)).toBe(true)   // MSG_VALUE_CHUNK
      expect(rejectWriteFrame(0x03)).toBe(false)  // MSG_REQ_VALUE — allowed
      expect(rejectWriteFrame(0x04)).toBe(false)  // MSG_PRESENCE — allowed
    })

    it('SR-03: client disconnect cleans up store; empty store is removed', () => {
      const Store   = new LiveStore('store-2')
      const Client1 = makeClient('write')
      const Client2 = makeClient('write')

      Store.addClient(Client1)
      Store.addClient(Client2)

      expect(Store.isEmpty()).toBe(false)

      Store.removeClient(Client1)
      expect(Store.isEmpty()).toBe(false)

      Store.removeClient(Client2)
      expect(Store.isEmpty()).toBe(true)
    })

    it('SR-04: PRESENCE frame is relayed to all other clients regardless of sender scope', () => {
      const Store    = new LiveStore('store-3')
      const ReadSrc  = makeClient('read')
      const WriteRcv = makeClient('write')
      const AdminRcv = makeClient('admin')

      Store.addClient(ReadSrc)
      Store.addClient(WriteRcv)
      Store.addClient(AdminRcv)

      const Frame = new Uint8Array([0x04, 1, 2, 3, 4])
      Store.broadcast(Frame, ReadSrc)

      expect((WriteRcv as any).send).toHaveBeenCalledWith(Frame)
      expect((AdminRcv as any).send).toHaveBeenCalledWith(Frame)
      expect((ReadSrc  as any).send).not.toHaveBeenCalled()
    })
  })
