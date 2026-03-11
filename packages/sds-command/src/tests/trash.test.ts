/*******************************************************************************
*                                                                              *
*                      trash commands — integration tests                      *
*                                                                              *
*******************************************************************************/

// covers: TR (trash list, purge-all, purge-expired)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                       TR — trash list / purge-all / purge-expired         //
//----------------------------------------------------------------------------//

describe('trash commands (TR)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tr-'))
    // seed the store with a fresh item (creates the DB)
    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'create', '--label', 'seed',
    ])
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('TR-01: trash list on an empty trash returns empty text marker', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'trash', 'list',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/empty/)
  })

  it('TR-02: trash list shows deleted entries', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'create', '--label', 'deleteme',
    ])
    const Id = Create.Stdout.trim()

    await runCLI(['--store', 'test', '--data-dir', DataDir, 'entry', 'delete', Id])

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'trash', 'list',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Entries.some((e) => e.id === Id)).toBe(true)
  })

  it('TR-03: purge-all empties the trash', async () => {
    // ensure at least one item is in trash from TR-02
    const PurgeAll = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'trash', 'purge-all',
    ])
    expect(PurgeAll.ExitCode).toBe(0)

    const List = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'trash', 'list',
    ])
    expect(List.ExitCode).toBe(0)
    expect(List.Stdout).toMatch(/empty/)
  })

  it('TR-04: purge-expired with very large TTL removes nothing', async () => {
    // delete an item and then purge with 100-year TTL
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'create', '--label', 'recent',
    ])
    const Id = Create.Stdout.trim()
    await runCLI(['--store', 'test', '--data-dir', DataDir, 'entry', 'delete', Id])

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'trash', 'purge-expired', '--ttl', '3153600000000',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json.purged).toBe(0)

    // item is still in trash
    const List = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'trash', 'list',
    ])
    const Entries:Array<{ id:string }> = JSON.parse(List.Stdout)
    expect(Entries.some((e) => e.id === Id)).toBe(true)
  })

  it('TR-05: purge-expired with --ttl 0 exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'trash', 'purge-expired', '--ttl', '0',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--ttl/i)
  })

  it('TR-06: --ttl with a non-integer value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'trash', 'purge-expired', '--ttl', 'abc',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('TR-07: trash list --only with an invalid value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'trash', 'list', '--only', 'foobar',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--only/i)
  })

  it('TR-08: purge-expired with --ttl -1 exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'trash', 'purge-expired', '--ttl', '-1',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--ttl/i)
  })
})
