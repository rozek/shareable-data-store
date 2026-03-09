/*******************************************************************************
*                                                                              *
*              SDS_DesktopPersistenceProvider — Values Tests                   *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync }  from 'node:fs'
import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'
import { SDS_DesktopPersistenceProvider } from '../sds-persistence-node.js'

/**** makeTmpDb — creates a temporary SQLite database path for test use ****/

function makeTmpDb ():{ DbPath:string; cleanup:() => void } {
  const Dir     = mkdtempSync(join(tmpdir(), 'sns-test-'))
  const DbPath  = join(Dir, 'test.db')
  const cleanup = () => { try { rmSync(Dir, { recursive:true, force:true }) } catch {} }
  return { DbPath, cleanup }
}

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DesktopPersistenceProvider — Values', () => {

  it('PV-01: loadValue for unknown hash returns undefined', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      expect(await P.loadValue('sha256-unknown')).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PV-02: saveValue then loadValue returns same bytes', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P    = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      const Data = new Uint8Array([10, 20, 30, 40])
      await P.saveValue('sha256-abc', Data)
      const Loaded = await P.loadValue('sha256-abc')
      expect(Loaded).not.toBeUndefined()
      expect(Array.from(Loaded!)).toEqual([10, 20, 30, 40])
      await P.close()
    } finally { cleanup() }
  })

  it('PV-03: saveValue same hash twice increments ref_count to 2', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P    = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      const Data = new Uint8Array([1, 2, 3])
      await P.saveValue('sha256-x', Data)
      await P.saveValue('sha256-x', Data)
      // Still loadable
      expect(await P.loadValue('sha256-x')).not.toBeUndefined()
      // Release once — should still exist (ref_count = 1)
      await P.releaseValue('sha256-x')
      expect(await P.loadValue('sha256-x')).not.toBeUndefined()
      // Release again — should be deleted (ref_count = 0)
      await P.releaseValue('sha256-x')
      expect(await P.loadValue('sha256-x')).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PV-04: releaseValue at ref_count 0 deletes the row', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      await P.saveValue('sha256-y', new Uint8Array([7, 8, 9]))
      await P.releaseValue('sha256-y')
      expect(await P.loadValue('sha256-y')).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PV-05: releaseValue on unknown hash does not throw', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      await expect(P.releaseValue('sha256-nonexistent')).resolves.toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

})
