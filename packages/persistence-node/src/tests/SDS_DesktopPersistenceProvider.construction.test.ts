/*******************************************************************************
*                                                                              *
*           SDS_DesktopPersistenceProvider — Construction Tests                *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, rmSync }             from 'node:fs'
import { tmpdir }                          from 'node:os'
import { join }                            from 'node:path'
import { SDS_DesktopPersistenceProvider }  from '../sds-persistence-node.js'

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

describe('SDS_DesktopPersistenceProvider — Construction', () => {

  it('PC-01: construct with valid path and storeId succeeds', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      expect(P).toBeDefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PC-02: tables are auto-created on first open', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SDS_DesktopPersistenceProvider(DbPath, 'store-1')
      // If schema creation failed, the following calls would throw
      expect(await P.loadSnapshot()).toBeUndefined()
      expect(await P.loadPatchesSince(0)).toEqual([])
      expect(await P.loadValue('any')).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

})
