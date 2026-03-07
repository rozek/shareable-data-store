/*******************************************************************************
*                                                                              *
*                           SNS_Error — Tests                                  *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_Error } from '../error/SNS_Error.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_Error', () => {

  it('E-01: has the given Code and message', () => {
    const Err = new SNS_Error('foo', 'bar message')
    expect(Err.Code).toBe('foo')
    expect(Err.message).toBe('bar message')
    expect(Err).toBeInstanceOf(Error)
  })

  it('E-02: name is SNS_Error', () => {
    const Err = new SNS_Error('code', 'msg')
    expect(Err.name).toBe('SNS_Error')
  })

  it('E-03: is an instance of SNS_Error', () => {
    const Err = new SNS_Error('code', 'msg')
    expect(Err).toBeInstanceOf(SNS_Error)
  })
})
