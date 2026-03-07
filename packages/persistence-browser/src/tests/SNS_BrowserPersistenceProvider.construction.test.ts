/*******************************************************************************
*                                                                              *
*          SNS_BrowserPersistenceProvider — Construction Tests                 *
*                                                                              *
*******************************************************************************/

import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { SNS_BrowserPersistenceProvider } from '../sns-persistence-browser.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_BrowserPersistenceProvider — Construction', () => {

  it('BC-01: construct and lazy-open DB without exception', async () => {
    const P = new SNS_BrowserPersistenceProvider('store-test')
    expect(await P.loadSnapshot()).toBeUndefined()
    await P.close()
  })

})
