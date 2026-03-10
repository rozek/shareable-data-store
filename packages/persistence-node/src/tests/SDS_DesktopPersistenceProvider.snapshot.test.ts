/*******************************************************************************
*                                                                              *
*            SDS_DesktopPersistenceProvider — Snapshot Tests                   *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync }  from 'node:fs'
import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'
import { SDS_DesktopPersistenceProvider } from '../sds-persistence-node.js'

/**** makeTmpDb — creates a temporary SQLite database path for test use ****/

function makeTmpDb ():{ DbPath:string; cleanup:() => void } {
  const Dir     = mkdtempSync(join(tmpdir(), 'sds-test-'))
  const DbPath  = join(Dir, 'test.db')
  const cleanup = () => { try { rmSync(Dir, { recursive:true, force:true }) } catch {} }
  return { DbPath, cleanup }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DesktopPersistenceProvider — Snapshot', () => {

  it('PS-01: loadSnapshot on empty DB returns undefined', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      expect(await P.loadSnapshot()).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PS-02: saveSnapshot then loadSnapshot returns same bytes', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P    = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      const Data = new Uint8Array([1, 2, 3, 4, 5])
      await P.saveSnapshot(Data)
      const Loaded = await P.loadSnapshot()
      expect(Loaded).not.toBeUndefined()
      expect(Array.from(Loaded!)).toEqual(Array.from(Data))
      await P.close()
    } finally { cleanup() }
  })

  it('PS-03: saveSnapshot twice overwrites previous', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P     = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      const First = new Uint8Array([1, 2, 3])
      const Sec   = new Uint8Array([9, 8, 7])
      await P.saveSnapshot(First)
      await P.saveSnapshot(Sec)
      const Loaded = await P.loadSnapshot()
      expect(Array.from(Loaded!)).toEqual([9, 8, 7])
      await P.close()
    } finally { cleanup() }
  })

  it('PS-04: data survives close and reopen', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const Data = new Uint8Array([10, 20, 30])
      {
        const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
        await P.saveSnapshot(Data)
        await P.close()
      }
      {
        const P      = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
        const Loaded = await P.loadSnapshot()
        expect(Array.from(Loaded!)).toEqual([10, 20, 30])
        await P.close()
      }
    } finally { cleanup() }
  })

})
