/*******************************************************************************
*                                                                              *
*               SNS WebSocket Server — Persistence Tests                       *
*                                                                              *
*******************************************************************************/

  import { describe, it, expect, beforeEach, afterEach } from 'vitest'
  import { LiveStore }                                    from '../sns-websocket-server.js'
  import type { LiveClient }                              from '../sns-websocket-server.js'
  import { SNS_DesktopPersistenceProvider }               from '@rozek/sns-persistence-node'
  import os   from 'node:os'
  import path from 'node:path'
  import fs   from 'node:fs'

/**** makeClient — creates a mock LiveClient that records received frames ****/

  function makeClient ():LiveClient & { Received:Uint8Array[] } {
    const Received:Uint8Array[] = []
    return {
      scope: 'write',
      send:  (Data) => { Received.push(new Uint8Array(Data)) },
      Received,
    }
  }

/**** flush — lets all pending microtasks and timers drain before asserting ****/

  function flush ():Promise<void> {
    return new Promise((r) => setTimeout(r, 10))
  }

/**** makeChunkFrame — builds a VALUE_CHUNK (0x05) frame for testing ****/

  function makeChunkFrame (
    HashBytes:Uint8Array, Idx:number, Total:number, Chunk:Uint8Array
  ):Uint8Array {
    const Frame = new Uint8Array(1+32+8+Chunk.byteLength)
      Frame[0] = 0x05
      Frame.set(HashBytes, 1)
      new DataView(Frame.buffer).setUint32(1+32,   Idx,   false)
      new DataView(Frame.buffer).setUint32(1+32+4, Total, false)
      Frame.set(Chunk, 1+32+8)
    return Frame
  }

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

  describe('SNS WebSocket Server — Persistence', () => {
    let TempDir:  string
    let DbPath:   string
    let Provider: SNS_DesktopPersistenceProvider
    let Store:    LiveStore

    beforeEach(() => {
      TempDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'sns-persist-test-'))
      DbPath   = path.join(TempDir, 'test.db')
      Provider = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      Store    = new LiveStore('store-1', Provider)
    })

    afterEach(async () => {
      await Store.close().catch(() => {})
      fs.rmSync(TempDir, { recursive:true, force:true })
    })

    it('SP-01: persistPatch stores patch; replayTo sends it as 0x01 frame', async () => {
      Store.persistPatch(new Uint8Array([10, 20, 30]))
      await flush()

      const Client = makeClient()
      await Store.replayTo(Client)

      expect(Client.Received).toHaveLength(1)
      expect(Client.Received[0][0]).toBe(0x01)
      expect(Array.from(Client.Received[0].slice(1))).toEqual([10, 20, 30])
    })

    it('SP-02: persistValue stores snapshot; replayTo sends it as 0x02 frame', async () => {
      const Payload = new Uint8Array(32+3)
        Payload.fill(0xab, 0, 32)   // hash
        Payload.set([1, 2, 3], 32)  // data

      Store.persistValue(Payload)
      await flush()

      const Client = makeClient()
      await Store.replayTo(Client)

      expect(Client.Received).toHaveLength(1)
      expect(Client.Received[0][0]).toBe(0x02)
      expect(Array.from(Client.Received[0].slice(1))).toEqual(Array.from(Payload))
    })

    it('SP-03: patch before VALUE is pruned; replayTo sends only the 0x02 frame', async () => {
      Store.persistPatch(new Uint8Array([10, 20]))
      await flush()

      const Payload = new Uint8Array(32+2).fill(0xcc)
      Store.persistValue(Payload)
      await flush()

      const Client = makeClient()
      await Store.replayTo(Client)

      expect(Client.Received).toHaveLength(1)
      expect(Client.Received[0][0]).toBe(0x02)
    })

    it('SP-04: patch after VALUE is not pruned; replayTo sends 0x02 then 0x01', async () => {
      const Payload = new Uint8Array(32+2).fill(0xdd)
      Store.persistValue(Payload)
      await flush()

      Store.persistPatch(new Uint8Array([55, 66]))
      await flush()

      const Client = makeClient()
      await Store.replayTo(Client)

      expect(Client.Received).toHaveLength(2)
      expect(Client.Received[0][0]).toBe(0x02)
      expect(Client.Received[1][0]).toBe(0x01)
      expect(Array.from(Client.Received[1].slice(1))).toEqual([55, 66])
    })

    it('SP-05: handleChunk assembles 2 chunks and persists as 0x02 snapshot', async () => {
      const HashBytes = new Uint8Array(32).fill(0xfe)
      Store.handleChunk(makeChunkFrame(HashBytes, 0, 2, new Uint8Array([1, 2])))
      Store.handleChunk(makeChunkFrame(HashBytes, 1, 2, new Uint8Array([3, 4])))
      await flush()

      const Client = makeClient()
      await Store.replayTo(Client)

      expect(Client.Received).toHaveLength(1)
      expect(Client.Received[0][0]).toBe(0x02)
      // payload: 32-byte hash + assembled data [1,2,3,4]
      expect(Client.Received[0].byteLength).toBe(1+32+4)
      expect(Array.from(Client.Received[0].slice(1+32))).toEqual([1, 2, 3, 4])
    })

    it('SP-06: data survives store close; new LiveStore with same DB replays it', async () => {
      Store.persistPatch(new Uint8Array([77, 88]))
      await flush()
      await Store.close()

      const Provider2 = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      const Store2    = new LiveStore('store-1', Provider2)
      const Client    = makeClient()
      await Store2.replayTo(Client)
      await Store2.close()

      expect(Client.Received).toHaveLength(1)
      expect(Client.Received[0][0]).toBe(0x01)
      expect(Array.from(Client.Received[0].slice(1))).toEqual([77, 88])
    })
  })
