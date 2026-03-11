/*******************************************************************************
*                                                                              *
*                      item commands — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: IC (item create), IL (item list), IG (item get), IU (item update)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                              IC — item create                              //
//----------------------------------------------------------------------------//

describe('item create (IC)', () => {
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ic-'))
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('IC-01: create with defaults prints a UUID; item get succeeds', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = Create.Stdout.trim()
    expect(Id).toMatch(/^[0-9a-f-]{36}$/)

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', Id,
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).id).toBe(Id)
  })

  it('IC-02: --mime and --label are stored correctly', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'My Doc', '--mime', 'text/markdown',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', Id,
    ])
    const Json = JSON.parse(Get.Stdout)
    expect(Json.label).toBe('My Doc')
    expect(Json.mime).toBe('text/markdown')
  })

  it('IC-03: --value is returned by item get', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--value', 'hello world',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('hello world')
  })

  it('IC-04: --file stores the file content as item value', async () => {
    const TmpFile = path.join(DataDir, 'upload.txt')
    await fs.writeFile(TmpFile, 'file content here')

    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--file', TmpFile,
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('file content here')
  })

  it('IC-05: --info.<key> is visible in item get --info (json)', async () => {
    const Create = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      '--info.author', '"Alice"',
      'item', 'create', '--label', 'annotated',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', Id,
    ])
    const Json = JSON.parse(Get.Stdout)
    expect(Json.info?.author).toBe('Alice')
  })

  it('IC-06: creating in a non-existent container exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--container', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })
})

//----------------------------------------------------------------------------//
//                              IL — item list                                //
//----------------------------------------------------------------------------//

describe('item list (IL)', () => {
  let DataDir:string
  let OuterId:string   // container item
  let InnerAId:string  // item inside container

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-il-'))

    const Outer = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'outer',
    ])
    OuterId = Outer.Stdout.trim()

    const InnerA = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'inner-item', '--container', OuterId,
    ])
    InnerAId = InnerA.Stdout.trim()

    // create a link inside the outer container
    await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'link', 'create', '--target', InnerAId, '--container', OuterId,
    ])
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('IL-01: lists direct inner entries of the container', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'item', 'list', OuterId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Array.isArray(Entries)).toBe(true)
    expect(Entries.some((e) => e.id === InnerAId)).toBe(true)
  })

  it('IL-02: --recursive traverses nested containers', async () => {
    // create a nested container with an item
    const Deep = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'deep', '--container', InnerAId,
    ])
    const DeepId = Deep.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'item', 'list', OuterId, '--recursive',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Entries.some((e) => e.id === DeepId)).toBe(true)
  })

  it('IL-03: --only items excludes links', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'item', 'list', OuterId, '--only', 'items',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ kind:string }> = JSON.parse(Result.Stdout)
    expect(Entries.every((e) => e.kind === 'item')).toBe(true)
  })

  it('IL-04: --only links excludes items', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'item', 'list', OuterId, '--only', 'links',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ kind:string }> = JSON.parse(Result.Stdout)
    expect(Entries.every((e) => e.kind === 'link')).toBe(true)
  })

  it('IL-05: --depth 1 limits traversal to one level', async () => {
    // create a deep chain: OuterId → InnerAId (already has DeepId)
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json',
      'item', 'list', OuterId, '--recursive', '--depth', '1',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    // only direct children appear (InnerAId and the link), not the grandchild
    expect(Entries.some((e) => e.id === InnerAId)).toBe(true)
  })
})

//----------------------------------------------------------------------------//
//                               IG — item get                                //
//----------------------------------------------------------------------------//

describe('item get (IG)', () => {
  let DataDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ig-'))

    const Item = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'getme', '--info.color', '"blue"',
    ])
    ItemId = Item.Stdout.trim()

    const Link = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'link', 'create', '--target', ItemId,
    ])
    LinkId = Link.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('IG-01: no field flags returns all fields', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json).toHaveProperty('id')
    expect(Json).toHaveProperty('label')
    expect(Json).toHaveProperty('mime')
  })

  it('IG-02: --info.<key> returns only that info key', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      '--info.color', '"x"',
      'item', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/info\.color/)
    expect(Result.Stdout).not.toMatch(/mime:/)
  })

  it('IG-03: passing a link UUID to item get exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'get', LinkId,
    ])
    expect(Result.ExitCode).toBe(3)
  })
})

//----------------------------------------------------------------------------//
//                             IU — item update                               //
//----------------------------------------------------------------------------//

describe('item update (IU)', () => {
  let DataDir:string
  let ItemId:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-iu-'))

    const Item = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'create', '--label', 'original', '--value', 'old',
    ])
    ItemId = Item.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('IU-01: --label update is reflected in subsequent item get', async () => {
    const Update = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'update', ItemId, '--label', 'updated',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', ItemId,
    ])
    expect(JSON.parse(Get.Stdout).label).toBe('updated')
  })

  it('IU-02: --value update is reflected in subsequent item get', async () => {
    const Update = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'update', ItemId, '--value', 'new content',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'item', 'get', ItemId,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('new content')
  })

  it('IU-03: updating a non-existent item exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir,
      'item', 'update', '00000000-0000-0000-0000-000000000099', '--label', 'x',
    ])
    expect(Result.ExitCode).toBe(3)
  })
})
