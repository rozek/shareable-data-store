/*******************************************************************************
*                                                                              *
*                      CLI default behaviour — integration tests               *
*                                                                              *
*******************************************************************************/

// covers: CL (default CLI behaviour)

import { describe, it, expect } from 'vitest'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                           CL — CLI default behaviour                       //
//----------------------------------------------------------------------------//

describe('CLI default behaviour (CL)', () => {
  it('CL-01: sds with no arguments prints help text and exits with code 0', async () => {
    const Result = await runCLI([])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/Usage:/)
    expect(Result.Stdout).toMatch(/sds/)
  })

  it('CL-02: sds shell with empty stdin exits with code 0', async () => {
    const Result = await runCLI(['shell'], {}, '')
    expect(Result.ExitCode).toBe(0)
  })
})
