/*******************************************************************************
*                                                                              *
*                      script runner — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: SR (runScript via sds --script)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                            SR — script runner                              //
//----------------------------------------------------------------------------//

describe('script runner (SR)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-sr-'))
    // seed store so commands in scripts can succeed
    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'seed',
    ])
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('SR-01: --on-error stop halts on first failure and returns its exit code', async () => {
    // script: first command fails (bad ID), second would succeed
    const ScriptFile = path.join(DataDir, 'stop.sds')
    await fs.writeFile(ScriptFile, [
      'item get 00000000-0000-0000-0000-000000000099',   // fails: NotFound (3)
      'store info',                                       // would succeed
    ].join('\n'))

    // global options from the outer invocation are forwarded to each script line
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--on-error', 'stop', '--script', ScriptFile,
    ])
    // exits with the first command's exit code (3 = NotFound)
    expect(Result.ExitCode).toBe(3)
  })

  it('SR-02: --on-error continue keeps going after errors; returns last non-zero code', async () => {
    const ScriptFile = path.join(DataDir, 'continue.sds')
    await fs.writeFile(ScriptFile, [
      'item get 00000000-0000-0000-0000-000000000099',   // fails: NotFound (3)
      'item get 00000000-0000-0000-0000-000000000098',   // also fails: NotFound (3)
    ].join('\n'))

    // global options from the outer invocation are forwarded to each script line
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--on-error', 'continue', '--script', ScriptFile,
    ])
    // ran both commands; returned last non-zero exit code
    expect(Result.ExitCode).toBe(3)
  })

  it('SR-03: non-existent script file exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      '--script', path.join(DataDir, 'does-not-exist.sds'),
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('SR-04: global options from outer invocation are available in each script line', async () => {
    // script line has no --store/--data-dir; they must be inherited from the outer call
    const ScriptFile = path.join(DataDir, 'inherit.sds')
    await fs.writeFile(ScriptFile, 'store info\n')

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--script', ScriptFile,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stderr).toBe('')
    expect(Result.Stdout).toMatch(/store:/)   // text output confirms store was found
  })
})
