/*******************************************************************************
*                                                                              *
*             SNS_DesktopPersistenceProvider — Patches Tests                   *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync }  from 'node:fs'
import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'
import { SNS_DesktopPersistenceProvider } from '../sns-persistence-node.js'

/**** makeTmpDb — creates a temporary SQLite database path for test use ****/

function makeTmpDb ():{ DbPath:string; cleanup:() => void } {
  const Dir     = mkdtempSync(join(tmpdir(), 'sns-test-'))
  const DbPath  = join(Dir, 'test.db')
  const cleanup = () => { try { rmSync(Dir, { recursive:true, force:true }) } catch {} }
  return { DbPath, cleanup }
}

/**** cursor — encodes an integer sequence number as a 4-byte big-endian cursor ****/

function cursor (Seq:number):Uint8Array {
  const Buf = new Uint8Array(4)
  new DataView(Buf.buffer).setUint32(0, Seq >>> 0, false)
  return Buf
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_DesktopPersistenceProvider — Patches', () => {

  it('PP-01: loadPatchesSince on empty DB returns []', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      expect(await P.loadPatchesSince(cursor(0))).toEqual([])
      await P.close()
    } finally { cleanup() }
  })

  it('PP-02: appendPatch then loadPatchesSince(0) returns that patch', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P     = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      const Patch = new Uint8Array([5, 6, 7])
      await P.appendPatch(Patch, cursor(100))
      const Loaded = await P.loadPatchesSince(cursor(0))
      expect(Loaded).toHaveLength(1)
      expect(Array.from(Loaded[0])).toEqual([5, 6, 7])
      await P.close()
    } finally { cleanup() }
  })

  it('PP-03: multiple patches returned in ascending clock order', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      await P.appendPatch(new Uint8Array([3]), cursor(300))
      await P.appendPatch(new Uint8Array([1]), cursor(100))
      await P.appendPatch(new Uint8Array([2]), cursor(200))
      const Loaded = await P.loadPatchesSince(cursor(0))
      expect(Loaded).toHaveLength(3)
      expect(Array.from(Loaded[0])).toEqual([1])
      expect(Array.from(Loaded[1])).toEqual([2])
      expect(Array.from(Loaded[2])).toEqual([3])
      await P.close()
    } finally { cleanup() }
  })

  it('PP-04: loadPatchesSince(clock) returns only patches after clock', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      await P.appendPatch(new Uint8Array([1]), cursor(100))
      await P.appendPatch(new Uint8Array([2]), cursor(200))
      await P.appendPatch(new Uint8Array([3]), cursor(300))
      const Loaded = await P.loadPatchesSince(cursor(150))
      expect(Loaded).toHaveLength(2)
      expect(Array.from(Loaded[0])).toEqual([2])
      await P.close()
    } finally { cleanup() }
  })

  it('PP-05: prunePatches removes patches with clock < threshold', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      await P.appendPatch(new Uint8Array([1]), cursor(100))
      await P.appendPatch(new Uint8Array([2]), cursor(200))
      await P.appendPatch(new Uint8Array([3]), cursor(300))
      await P.prunePatches(cursor(200))
      const Loaded = await P.loadPatchesSince(cursor(0))
      expect(Loaded).toHaveLength(2)
      expect(Array.from(Loaded[0])).toEqual([2])
      await P.close()
    } finally { cleanup() }
  })

  it('PP-06: appendPatch with duplicate clock is ignored', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      await P.appendPatch(new Uint8Array([1]), cursor(100))
      await P.appendPatch(new Uint8Array([9]), cursor(100))  // same cursor, different data
      const Loaded = await P.loadPatchesSince(cursor(0))
      expect(Loaded).toHaveLength(1)
      expect(Array.from(Loaded[0])).toEqual([1])    // first one wins
      await P.close()
    } finally { cleanup() }
  })

})
