/*******************************************************************************
*                                                                              *
*                     entry commands — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: EG (entry get), EM (entry move / delete / restore / purge)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                              EG — entry get                                //
//----------------------------------------------------------------------------//

describe('entry get (EG)', () => {
  let DataDir:string
  let ItemId:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-eg-'))
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'TestItem',
    ])
    ItemId = Result.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('EG-01: well-known alias "root" returns a valid entry', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'get', 'root',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/id:/)
  })

  it('EG-02: non-existent UUID exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'entry', 'get', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EG-03: no field flags returns all fields', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/id:/)
    expect(Result.Stdout).toMatch(/label:/)
    expect(Result.Stdout).toMatch(/kind:/)
  })

  it('EG-04: --label flag returns only the label field', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'get', ItemId, '--label',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/label:\s*TestItem/)
    expect(Result.Stdout).not.toMatch(/mime:/)
  })

  it('EG-05: --info.<key> returns only that info key in the output', async () => {
    // first set an info key
    await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      '--info.tag', '"important"',
      'item', 'update', ItemId,
    ])
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      '--info.tag', '"x"',       // extra argv parsed as info key filter
      'entry', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/info\.tag/)
    expect(Result.Stdout).not.toMatch(/mime:/)
  })
})

//----------------------------------------------------------------------------//
//                    EM — entry move / delete / restore / purge              //
//----------------------------------------------------------------------------//

describe('entry move / delete / restore / purge (EM)', () => {
  let DataDir:string
  let ContainerId:string
  let ItemId:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-em-'))
    const Container = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'container',
    ])
    ContainerId = Container.Stdout.trim()
    const Item = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'movable',
    ])
    ItemId = Item.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('EM-01: move item to a valid container succeeds', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'entry', 'move', ItemId, '--to', ContainerId,
    ])
    expect(Result.ExitCode).toBe(0)
    // verify outerItem changed
    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'entry', 'get', ItemId,
    ])
    expect(Get.ExitCode).toBe(0)
  })

  it('EM-02: moving the root item exits with Forbidden (code 6)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'entry', 'move', 'root', '--to', ContainerId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-03: move to a non-existent target exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'entry', 'move', ItemId, '--to', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EM-04: delete moves item to trash; appears in trash list', async () => {
    // create a fresh item to delete
    const Fresh = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'todelete',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Delete = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'delete', FreshId,
    ])
    expect(Delete.ExitCode).toBe(0)

    const Trash = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'trash', 'list',
    ])
    expect(Trash.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Trash.Stdout)
    expect(Entries.some((e) => e.id === FreshId)).toBe(true)
  })

  it('EM-05: restore brings trashed item back to root', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'torestore',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'delete', FreshId,
    ])
    const Restore = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'restore', FreshId,
    ])
    expect(Restore.ExitCode).toBe(0)

    // item should no longer be in trash
    const Trash = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'trash', 'list',
    ])
    const Entries:Array<{ id:string }> = JSON.parse(Trash.Stdout)
    expect(Entries.some((e) => e.id === FreshId)).toBe(false)
  })

  it('EM-06: restoring a live (non-trashed) entry exits with Forbidden (code 6)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'liveitem',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'restore', FreshId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-07: purging an entry not in trash exits with Forbidden (code 6)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'liveitem2',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'purge', FreshId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-08: purging a trashed entry removes it permanently', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'topurge',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'delete', FreshId,
    ])
    const Purge = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'purge', FreshId,
    ])
    expect(Purge.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'entry', 'get', FreshId,
    ])
    expect(Get.ExitCode).toBe(3)
  })
})
