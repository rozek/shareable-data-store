/*******************************************************************************
*                                                                              *
*                         REPL — integration tests                             *
*                                                                              *
*******************************************************************************/

// covers: RP (startREPL behaviour via sds shell)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                               RP — REPL                                    //
//----------------------------------------------------------------------------//

describe('REPL (RP)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-rp-'))
    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'seed',
    ])
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('RP-01: blank lines are ignored — shell exits normally', async () => {
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      '\n\n\n',    // three blank lines then EOF
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stderr).toBe('')
  })

  it('RP-02: comment lines are ignored — shell exits normally', async () => {
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      '# this is a comment\n# another comment\n',
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stderr).toBe('')
  })

  it('RP-03: "exit" closes the session', async () => {
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'exit\n',
    )
    expect(Result.ExitCode).toBe(0)
  })

  it('RP-04: "quit" closes the session', async () => {
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'quit\n',
    )
    expect(Result.ExitCode).toBe(0)
  })

  it('RP-05: global options from shell startup apply to every command in the session', async () => {
    // store info requires --store and --data-dir; they must be inherited from the
    // outer `sds --store test --data-dir DataDir shell` invocation
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'store info\nexit\n',
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stderr).toBe('')
    expect(Result.Stdout).toMatch(/store:/)   // text output from store info
  })
})
