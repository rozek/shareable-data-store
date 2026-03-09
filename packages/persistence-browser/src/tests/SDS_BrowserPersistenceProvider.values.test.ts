/*******************************************************************************
*                                                                              *
*             SDS_BrowserPersistenceProvider — Values Tests                    *
*                                                                              *
*******************************************************************************/

import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { SDS_BrowserPersistenceProvider }   from '../sds-persistence-browser.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_BrowserPersistenceProvider — Values', () => {

  let Provider: SDS_BrowserPersistenceProvider
  beforeEach(() => {
    Provider = new SDS_BrowserPersistenceProvider(`store-${Math.random()}`)
  })

  it('BV-01: loadValue for unknown hash returns undefined', async () => {
    expect(await Provider.loadValue('sha256-unknown')).toBeUndefined()
    await Provider.close()
  })

  it('BV-02: saveValue then loadValue returns same bytes', async () => {
    const Data = new Uint8Array([10, 20, 30])
    await Provider.saveValue('sha256-abc', Data)
    const Loaded = await Provider.loadValue('sha256-abc')
    expect(Array.from(Loaded!)).toEqual([10, 20, 30])
    await Provider.close()
  })

  it('BV-03: saveValue same hash twice; two releaseValue calls delete row', async () => {
    const Data = new Uint8Array([1, 2, 3])
    await Provider.saveValue('sha256-x', Data)
    await Provider.saveValue('sha256-x', Data)
    await Provider.releaseValue('sha256-x')
    expect(await Provider.loadValue('sha256-x')).not.toBeUndefined()
    await Provider.releaseValue('sha256-x')
    expect(await Provider.loadValue('sha256-x')).toBeUndefined()
    await Provider.close()
  })

  it('BV-04: releaseValue on unknown hash does not throw', async () => {
    await expect(Provider.releaseValue('sha256-nonexistent')).resolves.toBeUndefined()
    await Provider.close()
  })

})
