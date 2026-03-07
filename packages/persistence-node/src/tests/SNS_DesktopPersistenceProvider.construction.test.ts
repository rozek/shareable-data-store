/*******************************************************************************
*                                                                              *
*           SNS_DesktopPersistenceProvider — Construction Tests                *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, rmSync }             from 'node:fs'
import { tmpdir }                          from 'node:os'
import { join }                            from 'node:path'
import { SNS_DesktopPersistenceProvider }  from '../sns-persistence-node.js'

/**** cursor — encodes an integer sequence number as a 4-byte big-endian cursor ****/

function cursor (Seq:number):Uint8Array {
  const Buf = new Uint8Array(4)
  new DataView(Buf.buffer).setUint32(0, Seq >>> 0, false)
  return Buf
}

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

describe('SNS_DesktopPersistenceProvider — Construction', () => {

  it('PC-01: construct with valid path and storeId succeeds', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      expect(P).toBeDefined()
      await P.close()
    } finally { cleanup() }
  })

  it('PC-02: tables are auto-created on first open', async () => {
    const { DbPath, cleanup } = makeTmpDb()
    try {
      const P = new SNS_DesktopPersistenceProvider(DbPath, 'store-1')
      // If schema creation failed, the following calls would throw
      expect(await P.loadSnapshot()).toBeUndefined()
      expect(await P.loadPatchesSince(cursor(0))).toEqual([])
      expect(await P.loadValue('any')).toBeUndefined()
      await P.close()
    } finally { cleanup() }
  })

})
