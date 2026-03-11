/*******************************************************************************
*                                                                              *
*                     store commands — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: SI (store info), SD (store destroy), SE (store export/import)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                              SI — store info                               //
//----------------------------------------------------------------------------//

describe('store info (SI)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-si-'))
    // create a store by adding one item
    await runCLI(
      ['--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'seed'],
    )
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('SI-01: no store ID exits with UsageError (code 2)', async () => {
    const Result = await runCLI(['--data-dir', DataDir, 'store', 'info'])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/no store ID/)
  })

  it('SI-02: non-existent store shows "not found" message (text)', async () => {
    const Result = await runCLI([
      '--store', 'nosuchstore', '--data-dir', DataDir, 'store', 'info',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/not found/)
  })

  it('SI-03: non-existent store returns exists:false (json)', async () => {
    const Result = await runCLI([
      '--store', 'nosuchstore', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json.exists).toBe(false)
  })

  it('SI-04: existing store returns exists:true with entryCount and dbPath (json)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json.exists).toBe(true)
    expect(typeof Json.entryCount).toBe('number')
    expect(Json.entryCount).toBeGreaterThanOrEqual(0)
    expect(typeof Json.dbPath).toBe('string')
    expect(Json.dbPath.length).toBeGreaterThan(0)
  })
})

//----------------------------------------------------------------------------//
//                             SD — store destroy                             //
//----------------------------------------------------------------------------//

describe('store destroy (SD)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-sd-'))
    await runCLI(
      ['--store', 'destroyme', '--data-dir', DataDir, 'item', 'create', '--label', 'tmp'],
    )
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('SD-01: destroys the store; subsequent info shows not found', async () => {
    const Destroy = await runCLI([
      '--store', 'destroyme', '--data-dir', DataDir, 'store', 'destroy',
    ])
    expect(Destroy.ExitCode).toBe(0)

    const Info = await runCLI([
      '--store', 'destroyme', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    expect(Info.ExitCode).toBe(0)
    expect(JSON.parse(Info.Stdout).exists).toBe(false)
  })

  it('SD-02: destroy of non-existent store exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'nosuchstore', '--data-dir', DataDir, 'store', 'destroy',
    ])
    expect(Result.ExitCode).toBe(3)
  })
})

//----------------------------------------------------------------------------//
//                          SE — store export / import                        //
//----------------------------------------------------------------------------//

describe('store export / import (SE)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-se-'))
    // populate with a few items
    for (const Label of ['alpha', 'beta', 'gamma']) {
      await runCLI([
        '--store', 'src', '--data-dir', DataDir, 'item', 'create', '--label', Label,
      ])
    }
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('SE-01: JSON export then import into a new store preserves entry count', async () => {
    const ExportFile = path.join(DataDir, 'snapshot.json')

    const Export = await runCLI([
      '--store', 'src', '--data-dir', DataDir,
      'store', 'export', '--encoding', 'json', '--output', ExportFile,
    ])
    expect(Export.ExitCode).toBe(0)

    const Import = await runCLI([
      '--store', 'dst', '--data-dir', DataDir,
      'store', 'import', '--input', ExportFile,
    ])
    expect(Import.ExitCode).toBe(0)

    const SrcInfo = await runCLI([
      '--store', 'src', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    const DstInfo = await runCLI([
      '--store', 'dst', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    expect(JSON.parse(SrcInfo.Stdout).entryCount)
      .toBe(JSON.parse(DstInfo.Stdout).entryCount)
  })

  it('SE-02: binary export then import round-trips correctly', async () => {
    const ExportFile = path.join(DataDir, 'snapshot.bin')

    const Export = await runCLI([
      '--store', 'src', '--data-dir', DataDir,
      'store', 'export', '--encoding', 'binary', '--output', ExportFile,
    ])
    expect(Export.ExitCode).toBe(0)

    // verify file is non-empty and starts with gzip magic bytes
    const Bytes = await fs.readFile(ExportFile)
    expect(Bytes[0]).toBe(0x1f)
    expect(Bytes[1]).toBe(0x8b)

    const Import = await runCLI([
      '--store', 'dst2', '--data-dir', DataDir,
      'store', 'import', '--input', ExportFile,
    ])
    expect(Import.ExitCode).toBe(0)

    const DstInfo = await runCLI([
      '--store', 'dst2', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    const SrcInfo = await runCLI([
      '--store', 'src', '--data-dir', DataDir, '--format', 'json', 'store', 'info',
    ])
    expect(JSON.parse(DstInfo.Stdout).entryCount)
      .toBe(JSON.parse(SrcInfo.Stdout).entryCount)
  })

  it('SE-03: import from a non-existent file exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'src', '--data-dir', DataDir,
      'store', 'import', '--input', path.join(DataDir, 'nonexistent.json'),
    ])
    expect(Result.ExitCode).toBe(3)
  })
})
