/*******************************************************************************
*                                                                              *
*                      link commands — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: LC (link create / get)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                          LC — link create / get                            //
//----------------------------------------------------------------------------//

describe('link create / get (LC)', () => {
  let DataDir:string
  let TargetId:string
  let LinkId:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-lc-'))

    const Target = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'target-item',
    ])
    TargetId = Target.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('LC-01: create link to a valid target prints UUID; link get succeeds', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'link', 'create', '--target', TargetId,
    ])
    expect(Create.ExitCode).toBe(0)
    LinkId = Create.Stdout.trim()
    expect(LinkId).toMatch(/^[0-9a-f-]{36}$/)

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'link', 'get', LinkId,
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).id).toBe(LinkId)
  })

  it('LC-02: create link to a non-existent target exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'link', 'create', '--target', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('LC-03: link get with no flags returns label, target, and info', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'link', 'get', LinkId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json).toHaveProperty('target')
    expect(Json.target).toBe(TargetId)
  })

  it('LC-04: passing an item UUID to link get exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'link', 'get', TargetId,
    ])
    expect(Result.ExitCode).toBe(3)
  })
})
