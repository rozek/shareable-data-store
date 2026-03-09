/*******************************************************************************
*                                                                              *
*          SDS_BrowserPersistenceProvider — Construction Tests                 *
*                                                                              *
*******************************************************************************/

import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { SDS_BrowserPersistenceProvider } from '../sds-persistence-browser.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_BrowserPersistenceProvider — Construction', () => {

  it('BC-01: construct and lazy-open DB without exception', async () => {
    const P = new SDS_BrowserPersistenceProvider('store-test')
    expect(await P.loadSnapshot()).toBeUndefined()
    await P.close()
  })

})
