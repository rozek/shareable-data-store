/*******************************************************************************
*                                                                              *
*           SDS_BrowserPersistenceProvider — Snapshot Tests                    *
*                                                                              *
*******************************************************************************/

import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { SDS_BrowserPersistenceProvider }   from '../sds-persistence-browser.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_BrowserPersistenceProvider — Snapshot', () => {

  let Provider: SDS_BrowserPersistenceProvider
  beforeEach(async () => {
    Provider = new SDS_BrowserPersistenceProvider(`store-${Math.random()}`)
  })

  it('BS-01: loadSnapshot on empty DB returns undefined', async () => {
    expect(await Provider.loadSnapshot()).toBeUndefined()
    await Provider.close()
  })

  it('BS-02: saveSnapshot then loadSnapshot returns same bytes', async () => {
    const Data = new Uint8Array([1, 2, 3])
    await Provider.saveSnapshot(Data)
    const Loaded = await Provider.loadSnapshot()
    expect(Loaded).not.toBeUndefined()
    expect(Array.from(Loaded!)).toEqual([1, 2, 3])
    await Provider.close()
  })

  it('BS-03: saveSnapshot twice overwrites previous', async () => {
    await Provider.saveSnapshot(new Uint8Array([1]))
    await Provider.saveSnapshot(new Uint8Array([9]))
    const Loaded = await Provider.loadSnapshot()
    expect(Array.from(Loaded!)).toEqual([9])
    await Provider.close()
  })

})
