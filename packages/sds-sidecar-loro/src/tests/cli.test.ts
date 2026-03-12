/*******************************************************************************
*                                                                              *
*                    sidecar CLI behaviour — integration tests                  *
*                                                                              *
*******************************************************************************/

// covers: SC (sidecar CLI behaviour)
// note: tests only exercise arguments that cause immediate exit (--help,
// --version, unknown option, missing required config). A live WebSocket
// connection is not required and not established.

import { describe, it, expect } from 'vitest'
import { runSidecar } from './runSidecar.js'

//----------------------------------------------------------------------------//
//                          SC — sidecar CLI behaviour                        //
//----------------------------------------------------------------------------//

describe('sidecar CLI behaviour (SC)', () => {

  it('SC-01: --help prints usage and exits with code 0', async () => {
    const Result = await runSidecar(['--help'])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/Usage:/)
    expect(Result.Stdout).toMatch(/sds-sidecar-loro/)
  })

  it('SC-02: --version prints the version string and exits with code 0', async () => {
    const Result = await runSidecar(['--version'])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/\d+\.\d+\.\d+/)   // semver pattern
  })

  it('SC-03: unknown option exits with UsageError (code 2)', async () => {
    const Result = await runSidecar(['--unknown-xyz-option'])
    expect(Result.ExitCode).toBe(2)
  })

  it('SC-04: no args and no env vars → non-zero exit (missing required config)', async () => {
    const Result = await runSidecar([], {
      SDS_SERVER_URL: undefined,
      SDS_STORE_ID:   undefined,
      SDS_TOKEN:      undefined,
    })
    expect(Result.ExitCode).not.toBe(0)
    expect(Result.Stderr.length).toBeGreaterThan(0)
  })

})
