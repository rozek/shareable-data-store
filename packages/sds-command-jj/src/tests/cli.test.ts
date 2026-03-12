/*******************************************************************************
*                                                                              *
*                      CLI default behaviour — integration tests               *
*                                                                              *
*******************************************************************************/

// covers: CL (default CLI behaviour) and UE (usage error output order)

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

  it('CL-03: invalid --format value exits with UsageError (code 2)', async () => {
    const Result = await runCLI(['--format', 'xml', 'store', 'info', '--store', 'x', '--persistence-dir', '/tmp'])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--format/i)
  })

  it('CL-04: invalid --on-error value exits with UsageError (code 2)', async () => {
    const Result = await runCLI(['--on-error', 'foobar', '--script', '/dev/null'])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--on-error/i)
  })

  it('CL-05: --version prints the version string and exits with code 0', async () => {
    const Result = await runCLI(['--version'])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/\d+\.\d+\.\d+/)   // semver pattern
  })

  it('CL-06: "help entry" shows entry subcommand help (not top-level help)', async () => {
    const Result = await runCLI(['help', 'entry'])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/sds\S* entry/)     // entry-specific usage line
    expect(Result.Stdout).toMatch(/create/)           // at least one entry subcommand listed
    expect(Result.Stderr).not.toMatch(/error/)
  })
})

//----------------------------------------------------------------------------//
//                         UE — usage error output order                      //
//----------------------------------------------------------------------------//

describe('usage error output order (UE)', () => {
  it('UE-01: unknown global option — error line precedes help text in stderr', async () => {
    const Result = await runCLI(['--unknown-xyz-option'])
    expect(Result.ExitCode).toBe(2)

    // both error and help must be present
    expect(Result.Stderr).toMatch(/error:.*unknown.*option/i)
    expect(Result.Stderr).toMatch(/Usage:/)

    // error must appear before help
    const ErrorIdx = Result.Stderr.indexOf('error:')
    const HelpIdx  = Result.Stderr.indexOf('Usage:')
    expect(ErrorIdx).toBeGreaterThanOrEqual(0)
    expect(HelpIdx).toBeGreaterThanOrEqual(0)
    expect(ErrorIdx).toBeLessThan(HelpIdx)
  })

  it('UE-02: unknown command — error line precedes help text in stderr', async () => {
    // `sds store not-a-subcommand` triggers unknownCommand on the store group
    const Result = await runCLI(['store', 'not-a-subcommand'])
    expect(Result.ExitCode).toBe(2)

    expect(Result.Stderr).toMatch(/error:.*unknown.*command/i)
    expect(Result.Stderr).toMatch(/Usage:/)

    const ErrorIdx = Result.Stderr.indexOf('error:')
    const HelpIdx  = Result.Stderr.indexOf('Usage:')
    expect(ErrorIdx).toBeGreaterThanOrEqual(0)
    expect(HelpIdx).toBeGreaterThanOrEqual(0)
    expect(ErrorIdx).toBeLessThan(HelpIdx)
  })

  it('UE-03: missing required option — error line precedes help text in stderr', async () => {
    // `store import` requires --input; omitting it triggers the error
    const Result = await runCLI(['--store', 'x', '--persistence-dir', '/tmp', 'store', 'import'])
    expect(Result.ExitCode).toBe(2)

    expect(Result.Stderr).toMatch(/error:/i)
    expect(Result.Stderr).toMatch(/Usage:/)

    const ErrorIdx = Result.Stderr.indexOf('error:')
    const HelpIdx  = Result.Stderr.indexOf('Usage:')
    expect(ErrorIdx).toBeGreaterThanOrEqual(0)
    expect(HelpIdx).toBeGreaterThanOrEqual(0)
    expect(ErrorIdx).toBeLessThan(HelpIdx)
  })
})
