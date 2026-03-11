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
      '--store', 'test', '--data-dir', DataDir, 'entry', 'create', '--label', 'seed',
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

  it('RP-06: REPL continues after a failing command', async () => {
    // a non-existent entry causes an error; the REPL must not exit
    // and the subsequent store info command must still succeed
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'entry get 00000000-0000-0000-0000-000000000099\nstore info\nexit\n',
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/store:/)   // store info succeeded after the failing entry get
  })

  it('RP-07: unknown command does not exit the REPL', async () => {
    // typing an unrecognised command must not kill the session
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'not-a-command\nstore info\nexit\n',
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/store:/)   // store info succeeded after the unknown command
  })

  it('RP-09: a failing command in the REPL writes the error to stderr, not stdout', async () => {
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'entry get 00000000-0000-0000-0000-000000000099\nexit\n',
    )
    expect(Result.ExitCode).toBe(0)
    // error must appear on stderr
    expect(Result.Stderr).toMatch(/not found|00000000-0000-0000-0000-000000000099/i)
    // stdout must NOT contain the error message
    expect(Result.Stdout).not.toMatch(/not found/i)
  })

  it('RP-08: "help" inside the REPL does not exit the session', async () => {
    // help shows available commands but must not kill the session;
    // the subsequent store info command must still succeed
    const Result = await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'shell'],
      {},
      'help\nstore info\nexit\n',
    )
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/store:/)   // store info succeeded after help
    // "shell" must not appear in the REPL's help output
    expect(Result.Stdout).not.toMatch(/\bshell\b/)
  })
})
