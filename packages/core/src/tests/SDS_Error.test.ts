/*******************************************************************************
*                                                                              *
*                           SDS_Error — Tests                                  *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_Error } from '../error/SDS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_Error', () => {
  it('E-01: has the given Code and message', () => {
    const Err = new SDS_Error('foo', 'bar message')
    expect(Err.Code).toBe('foo')
    expect(Err.message).toBe('bar message')
    expect(Err).toBeInstanceOf(Error)
  })

  it('E-02: name is SDS_Error', () => {
    const Err = new SDS_Error('code', 'msg')
    expect(Err.name).toBe('SDS_Error')
  })

  it('E-03: is an instance of SDS_Error', () => {
    const Err = new SDS_Error('code', 'msg')
    expect(Err).toBeInstanceOf(SDS_Error)
  })
})
