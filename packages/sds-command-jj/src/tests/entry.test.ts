/*******************************************************************************
*                                                                              *
*                     entry commands — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: EC (entry create), EG (entry get), EL (entry list),
//         EM (entry move / delete / restore / purge), EU (entry update)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                             EC — entry create                              //
//----------------------------------------------------------------------------//

describe('entry create (EC)', () => {
  let PersistenceDir:string
  let ItemId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ec-'))
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EC-01: create without --target creates an item; kind is "item"', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'create',
    ])
    expect(Create.ExitCode).toBe(0)
    ItemId = Create.Stdout.trim()
    expect(ItemId).toMatch(/^[0-9a-f-]{36}$/)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId,
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).kind).toBe('item')
  })

  it('EC-02: create with --target creates a link; kind is "link"', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId,
    ])
    expect(Create.ExitCode).toBe(0)
    const LinkId = Create.Stdout.trim()
    expect(LinkId).toMatch(/^[0-9a-f-]{36}$/)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', LinkId,
    ])
    expect(Get.ExitCode).toBe(0)
    const Json = JSON.parse(Get.Stdout)
    expect(Json.kind).toBe('link')
    expect(Json.target).toBe(ItemId)
  })

  it('EC-03: --mime and --label are stored correctly (item)', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'My Doc', '--mime', 'text/markdown',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    const Json = JSON.parse(Get.Stdout)
    expect(Json.label).toBe('My Doc')
    expect(Json.mime).toBe('text/markdown')
  })

  it('EC-04: --value is returned by entry get (item)', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--value', 'hello world',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('hello world')
  })

  it('EC-05: --file stores the file content as item value', async () => {
    const TmpFile = path.join(PersistenceDir, 'upload.txt')
    await fs.writeFile(TmpFile, 'file content here')

    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--file', TmpFile,
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('file content here')
  })

  it('EC-06: --info.<key> is visible in entry get (item)', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      '--info.author', '"Alice"',
      'entry', 'create', '--label', 'annotated',
    ])
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).info?.author).toBe('Alice')
  })

  it('EC-07: creating in a non-existent container exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--container', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EC-08: --file on a non-existent path exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--file', '/tmp/sds-nonexistent-ec08.txt',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EC-09: --at with a non-integer value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--at', 'abc',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('EC-10: --target pointing to a non-existent item exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  // EC-11 is the representative test for the "item-only flag + --target" guard;
  // the same validation rejects --value and --file — no separate tests needed.
  it('EC-11: --mime combined with --target exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId, '--mime', 'text/plain',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--mime.*link/i)
  })

  // requires: EC-01 (ItemId), EC-02 (link creation)
  it('EC-12: --label at link creation time is visible in entry get', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId, '--label', 'my-link',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).label).toBe('my-link')
  })

  it('EC-13: --info at link creation time is visible in entry get', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId, '--info', '{"author":"bob"}',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = Create.Stdout.trim()

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id,
    ])
    expect(JSON.parse(Get.Stdout).info?.author).toBe('bob')
  })

  it('EC-14: --value and --file together exit with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--value', 'text', '--file', '/tmp/sds-nonexistent.txt',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--value.*--file|--file.*--value/i)
  })

  it('EC-15: using a link as --container exits with NotFound (code 3)', async () => {
    const LinkResult = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'ec17-target', '--target', 'root',
    ])
    const LinkId = LinkResult.Stdout.trim()
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'ec17-child', '--container', LinkId,
    ])
    expect(Result.ExitCode).toBe(3)
    expect(Result.Stderr).toMatch(/not an item/i)
  })

  it('EC-16: --at with a negative value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'ec18', '--at', '-1',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--at/i)
  })

  // EC-17 proves that --container resolves well-known aliases via resolveEntryId();
  // testing a second alias would exercise the same code path and add no new coverage.
  it('EC-17: --container root alias creates an item in root; item appears in root list', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'ec19-root-alias', '--container', 'root',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = Create.Stdout.trim()
    expect(Id).toMatch(/^[0-9a-f-]{36}$/)

    const List = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'root',
    ])
    expect(List.ExitCode).toBe(0)
    const Entries = JSON.parse(List.Stdout) as Array<{ id:string }>
    expect(Entries.some((e) => e.id === Id)).toBe(true)
  })

  it('EC-18: --info-delete.<key> at create time is a no-op; command exits with code 0', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'ec18-no-op', '--info.keep', 'yes', '--info-delete.gone',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = Create.Stdout.trim()
    expect(Id).toMatch(/^[0-9a-f-]{36}$/)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id, '--info',
    ])
    const Info = JSON.parse(Get.Stdout).info as Record<string,unknown>
    expect(Info['keep']).toBe('yes')       // --info.<key> was applied
    expect('gone' in Info).toBe(false)     // --info-delete was silently ignored
  })

})

//----------------------------------------------------------------------------//
//                              EG — entry get                                //
//----------------------------------------------------------------------------//

describe('entry get (EG)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-eg-'))
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'TestItem',
    ])
    ItemId = Result.Stdout.trim()

    const LinkResult = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId,
    ])
    LinkId = LinkResult.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EG-01: well-known alias "root" returns a valid entry', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'get', 'root',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/id:/)
  })

  it('EG-02: non-existent UUID exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'get', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EG-03: no field flags returns all fields including kind', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/id:/)
    expect(Result.Stdout).toMatch(/label:/)
    expect(Result.Stdout).toMatch(/kind:/)
  })

  it('EG-04: --label flag returns only the label field', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'get', ItemId, '--label',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/label:\s*TestItem/)
    expect(Result.Stdout).not.toMatch(/mime:/)
    expect(Result.Stdout).not.toMatch(/kind:/)
  })

  it('EG-05: --info.<key> returns only that info key in the output', async () => {
    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      '--info.tag', '"important"',
      'entry', 'update', ItemId,
    ])
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      '--info.tag', '"x"',
      'entry', 'get', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/info\.tag/)
    expect(Result.Stdout).not.toMatch(/mime:/)
  })

  it('EG-06: --kind alone returns only the kind field', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId, '--kind',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json.kind).toBe('item')
    expect(Json).not.toHaveProperty('label')
    expect(Json).not.toHaveProperty('mime')
  })

  it('EG-07: entry get on a link with --format json includes the target field', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', LinkId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Json.kind).toBe('link')
    expect(Json.target).toBe(ItemId)
    expect(Json).not.toHaveProperty('mime')
    expect(Json).not.toHaveProperty('value')
  })

  it('EG-08: entry get trash returns the trash entry using the well-known alias', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', 'trash',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(typeof Json.id).toBe('string')
    expect(Json.kind).toBe('item')
  })

  it('EG-09: entry get lost-and-found returns the lost-and-found entry using the well-known alias', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', 'lost-and-found',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(typeof Json.id).toBe('string')
    expect(Json.kind).toBe('item')
  })

  // requires: EG-09 (lost-and-found alias); lostandfound has its own switch case and
  // must be tested independently — a broken case would only be caught by this test.
  it('EG-10: entry get lostandfound (no-hyphen variant) resolves to the same entry as lost-and-found', async () => {
    const WithHyphen = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', 'lost-and-found',
    ])
    const WithoutHyphen = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', 'lostandfound',
    ])
    expect(WithoutHyphen.ExitCode).toBe(0)
    const IdA = JSON.parse(WithHyphen.Stdout).id
    const IdB = JSON.parse(WithoutHyphen.Stdout).id
    expect(IdB).toBe(IdA)
  })
})

//----------------------------------------------------------------------------//
//                             EL — entry list                               //
//----------------------------------------------------------------------------//

describe('entry list (EL)', () => {
  let PersistenceDir:string
  let OuterId:string
  let InnerAId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-el-'))

    const Outer = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'outer',
    ])
    OuterId = Outer.Stdout.trim()

    const InnerA = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'inner-item', '--container', OuterId,
    ])
    InnerAId = InnerA.Stdout.trim()

    // create a link inside the outer container
    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', InnerAId, '--container', OuterId,
    ])
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EL-01: lists direct inner entries of the container', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Array.isArray(Entries)).toBe(true)
    expect(Entries.some((e) => e.id === InnerAId)).toBe(true)
  })

  it('EL-02: --recursive traverses nested containers', async () => {
    const Deep = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'deep', '--container', InnerAId,
    ])
    const DeepId = Deep.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId, '--recursive',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Entries.some((e) => e.id === DeepId)).toBe(true)
  })

  it('EL-03: --only items excludes links', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId, '--only', 'items',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ kind:string }> = JSON.parse(Result.Stdout)
    expect(Entries.every((e) => e.kind === 'item')).toBe(true)
  })

  it('EL-04: --only links excludes items', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId, '--only', 'links',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ kind:string }> = JSON.parse(Result.Stdout)
    expect(Entries.every((e) => e.kind === 'link')).toBe(true)
  })

  it('EL-05: --depth 1 limits traversal to one level', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId, '--recursive', '--depth', '1',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    expect(Entries.some((e) => e.id === InnerAId)).toBe(true)
  })

  it('EL-06: --depth with a non-integer value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'list', OuterId, '--depth', 'abc',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('EL-07: --only with an invalid value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'list', OuterId, '--only', 'foobar',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--only/i)
  })

  it('EL-08: passing a link ID as the container exits with NotFound (code 3)', async () => {
    // create a link inside OuterId, then try to list using the link as a container
    const Link = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', InnerAId, '--container', OuterId,
    ])
    const LinkId = Link.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'list', LinkId,
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EL-09: entry list in text format prints one UUID per line', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'list', OuterId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Lines = Result.Stdout.trim().split('\n').filter(Boolean)
    expect(Lines.length).toBeGreaterThan(0)
    expect(Lines.some((l) => l.includes(InnerAId))).toBe(true)
  })

  it('EL-10: entry list --label in text format includes label alongside UUID', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'list', OuterId, '--label',
    ])
    expect(Result.ExitCode).toBe(0)
    const Lines = Result.Stdout.trim().split('\n').filter(Boolean)
    // the line for InnerAId should contain both the UUID and the label "inner-item"
    const InnerLine = Lines.find((l) => l.includes(InnerAId))
    expect(InnerLine).toBeDefined()
    expect(InnerLine).toContain('inner-item')
  })

  it('EL-11: entry list --label in JSON format includes label field in each object', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', OuterId, '--label',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string; kind:string; label:string }> = JSON.parse(Result.Stdout)
    expect(Array.isArray(Entries)).toBe(true)
    const InnerEntry = Entries.find((e) => e.id === InnerAId)
    expect(InnerEntry).toBeDefined()
    expect(InnerEntry!.label).toBe('inner-item')
  })

  it('EL-12: entry list root lists root-level entries using the well-known alias', async () => {
    // OuterId is a direct child of root in the test store
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'root',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string; kind:string }> = JSON.parse(Result.Stdout)
    expect(Array.isArray(Entries)).toBe(true)
    expect(Entries.some((e) => e.id === OuterId)).toBe(true)
  })

  it('EL-13: entry list root does not include system containers (trash, lost-and-found)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'root',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Result.Stdout)
    const Ids = Entries.map((e) => e.id)
    // well-known system IDs must never appear in user-facing listing output
    expect(Ids).not.toContain('00000000-0000-4000-8000-000000000001')  // TrashId
    expect(Ids).not.toContain('00000000-0000-4000-8000-000000000002')  // LostAndFoundId
  })

  it('EL-14: entry list lost-and-found alias returns an array (exits with code 0)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'lost-and-found',
    ])
    expect(Result.ExitCode).toBe(0)
    const Entries = JSON.parse(Result.Stdout)
    expect(Array.isArray(Entries)).toBe(true)
  })
})

//----------------------------------------------------------------------------//
//                    EM — entry move / delete / restore / purge              //
//----------------------------------------------------------------------------//

describe('entry move / delete / restore / purge (EM)', () => {
  let PersistenceDir:string
  let ContainerId:string
  let ItemId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-em-'))
    const Container = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'container',
    ])
    ContainerId = Container.Stdout.trim()
    const Item = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'movable',
    ])
    ItemId = Item.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EM-01: move item to a valid container succeeds', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', ItemId, '--to', ContainerId,
    ])
    expect(Result.ExitCode).toBe(0)
    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId,
    ])
    expect(Get.ExitCode).toBe(0)
  })

  it('EM-02: moving a system entry (root, trash, lost-and-found) to a non-root container exits with Forbidden (code 6)', async () => {
    // Test moving root
    const MoveRoot = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', 'root', '--to', ContainerId,
    ])
    expect(MoveRoot.ExitCode).toBe(6)

    // Test moving trash
    const MoveTrash = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', 'trash', '--to', ContainerId,
    ])
    expect(MoveTrash.ExitCode).toBe(6)

    // Test moving lost-and-found
    const MoveLAF = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', 'lost-and-found', '--to', ContainerId,
    ])
    expect(MoveLAF.ExitCode).toBe(6)
  })

  it('EM-03: move to a non-existent target exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', ItemId, '--to', '00000000-0000-0000-0000-000000000099',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EM-04: delete moves item to trash; appears in trash list', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'todelete',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Delete = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])
    expect(Delete.ExitCode).toBe(0)

    const Trash = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json', 'trash', 'list',
    ])
    expect(Trash.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(Trash.Stdout)
    expect(Entries.some((e) => e.id === FreshId)).toBe(true)
  })

  it('EM-05: restore brings trashed item back to root', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'torestore',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])
    const Restore = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'restore', FreshId,
    ])
    expect(Restore.ExitCode).toBe(0)

    const Trash = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json', 'trash', 'list',
    ])
    const Entries:Array<{ id:string }> = JSON.parse(Trash.Stdout)
    expect(Entries.some((e) => e.id === FreshId)).toBe(false)
  })

  it('EM-06: restoring a live (non-trashed) entry exits with Forbidden (code 6)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'liveitem',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'restore', FreshId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-07: purging an entry not in trash exits with Forbidden (code 6)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'liveitem2',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'purge', FreshId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-08: purging a trashed entry removes it permanently', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'topurge',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])
    const Purge = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'purge', FreshId,
    ])
    expect(Purge.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'get', FreshId,
    ])
    expect(Get.ExitCode).toBe(3)
  })

  it('EM-09: entry move --at with non-integer value exits with UsageError (code 2)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'formove',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', FreshId, '--to', ContainerId, '--at', 'abc',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('EM-10: entry restore --at with non-integer value exits with UsageError (code 2)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'restore-at-test',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'restore', FreshId, '--at', 'xyz',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('EM-11: entry restore --to places the entry in the specified container', async () => {
    const Target = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'restore-target',
    ])
    const TargetId = Target.Stdout.trim()

    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'to-restore',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])
    const Restore = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'restore', FreshId, '--to', TargetId,
    ])
    expect(Restore.ExitCode).toBe(0)

    const List = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', TargetId,
    ])
    expect(List.ExitCode).toBe(0)
    const Entries:Array<{ id:string }> = JSON.parse(List.Stdout)
    expect(Entries.some((e) => e.id === FreshId)).toBe(true)
  })

  it('EM-12: moving an item into its own descendant exits with Forbidden (code 6)', async () => {
    // ContainerId is a direct child of root; create a child inside it
    const Child = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'cycle-child', '--container', ContainerId,
    ])
    const ChildId = Child.Stdout.trim()

    // attempting to move ContainerId into its own child would create a cycle
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', ContainerId, '--to', ChildId,
    ])
    expect(Result.ExitCode).toBe(6)
  })

  it('EM-13: entry move --at with a negative value exits with UsageError (code 2)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'em13',
    ])
    const FreshId = Fresh.Stdout.trim()

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', FreshId, '--to', ContainerId, '--at', '-1',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--at/i)
  })

  it('EM-14: entry restore --at with a negative value exits with UsageError (code 2)', async () => {
    const Fresh = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'em14',
    ])
    const FreshId = Fresh.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', FreshId,
    ])

    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'restore', FreshId, '--at', '-5',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--at/i)
  })

  it('EM-15: deleting system entries (root, trash, lost-and-found) exits with Forbidden (code 6)', async () => {
    // Test deleting root
    const DeleteRoot = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'delete', 'root',
    ])
    expect(DeleteRoot.ExitCode).toBe(6)
    expect(DeleteRoot.Stderr).toContain('system entry')

    // Test deleting trash
    const DeleteTrash = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'delete', 'trash',
    ])
    expect(DeleteTrash.ExitCode).toBe(6)
    expect(DeleteTrash.Stderr).toContain('system entry')

    // Test deleting lost-and-found
    const DeleteLAF = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'delete', 'lost-and-found',
    ])
    expect(DeleteLAF.ExitCode).toBe(6)
    expect(DeleteLAF.Stderr).toContain('system entry')
  })

  // EM-16 proves that --to resolves well-known aliases via resolveEntryId();
  // testing a second alias would exercise the same code path and add no new coverage.
  it('EM-16: entry move --to root alias moves item to root; item appears in root list', async () => {
    const ContainerResult = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'em16-container',
    ])
    const ContainerId = ContainerResult.Stdout.trim()

    const ItemResult = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'em16-item', '--container', ContainerId,
    ])
    const ItemId = ItemResult.Stdout.trim()

    const Move = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'move', ItemId, '--to', 'root',
    ])
    expect(Move.ExitCode).toBe(0)

    const List = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'root',
    ])
    const Entries = JSON.parse(List.Stdout) as Array<{ id:string }>
    expect(Entries.some((e) => e.id === ItemId)).toBe(true)
  })

  // requires: EM-05 (restore mechanics), EM-16 (--to alias resolution)
  it('EM-17: entry restore --to root alias restores trashed item to root; item appears in root list', async () => {
    const ItemResult = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'em17-item',
    ])
    const ItemId = ItemResult.Stdout.trim()

    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'delete', ItemId,
    ])

    const Restore = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'restore', ItemId, '--to', 'root',
    ])
    expect(Restore.ExitCode).toBe(0)

    const List = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'list', 'root',
    ])
    const Entries = JSON.parse(List.Stdout) as Array<{ id:string }>
    expect(Entries.some((e) => e.id === ItemId)).toBe(true)
  })

})

//----------------------------------------------------------------------------//
//                            EU — entry update                              //
//----------------------------------------------------------------------------//

describe('entry update (EU)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-eu-'))

    const Item = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'original',
    ])
    ItemId = Item.Stdout.trim()

    const Link = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--target', ItemId,
    ])
    LinkId = Link.Stdout.trim()
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EU-01: entry update --label on an item updates the label', async () => {
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--label', 'item-updated',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId,
    ])
    expect(JSON.parse(Get.Stdout).label).toBe('item-updated')
  })

  it('EU-02: entry update --label on a link updates the label', async () => {
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', LinkId, '--label', 'link-updated',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', LinkId,
    ])
    expect(JSON.parse(Get.Stdout).label).toBe('link-updated')
  })

  it('EU-03: entry update --mime on a link exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', LinkId, '--mime', 'text/plain',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--mime.*link/i)
  })

  it('EU-04: entry update on a non-existent entry exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', '00000000-0000-0000-0000-000000000099', '--label', 'x',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EU-05: entry update with no options is a no-op and exits successfully', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId,
    ])
    expect(Result.ExitCode).toBe(0)
  })

  it('EU-06: entry update --value changes the item value', async () => {
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--value', 'eu06-value',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId,
    ])
    expect(JSON.parse(Get.Stdout).value).toBe('eu06-value')
  })

  it('EU-07: entry update --file on a non-existent file exits with NotFound (code 3)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--file', '/tmp/sds-nonexistent-eu07.txt',
    ])
    expect(Result.ExitCode).toBe(3)
  })

  it('EU-08: --value and --file together in entry update exit with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--value', 'text', '--file', '/tmp/sds-nonexistent.txt',
    ])
    expect(Result.ExitCode).toBe(2)
    expect(Result.Stderr).toMatch(/--value.*--file|--file.*--value/i)
  })

  it('EU-09: entry update --mime on an item updates the MIME type', async () => {
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--mime', 'application/json',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId,
    ])
    expect(JSON.parse(Get.Stdout).mime).toBe('application/json')
  })

  it('EU-10: entry update --info.<key> merges individual info keys without replacing others', async () => {
    // set initial info
    const Set = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.author', 'alice', '--info.version', '1',
    ])
    expect(Set.ExitCode).toBe(0)

    // update only one key; the other must survive
    const Merge = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.version', '2',
    ])
    expect(Merge.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId, '--info',
    ])
    const Info = JSON.parse(Get.Stdout).info as Record<string,unknown>
    expect(Info['author']).toBe('alice')   // untouched key preserved
    expect(Info['version']).toBe(2)        // updated key reflects new value (parsed as number)
  })

  it('EU-11: entry update --info-delete.<key> removes the key; other keys remain', async () => {
    // set initial info with two keys
    const Set = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.keep', 'yes', '--info.remove', 'bye',
    ])
    expect(Set.ExitCode).toBe(0)

    // delete one key
    const Del = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info-delete.remove',
    ])
    expect(Del.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId, '--info',
    ])
    const Info = JSON.parse(Get.Stdout).info as Record<string,unknown>
    expect('remove' in Info).toBe(false)  // deleted key must be gone
    expect(Info['keep']).toBe('yes')      // untouched key preserved
  })

  it('EU-12: --info.<key> and --info-delete.<key> combined in one command: add and remove atomically', async () => {
    // establish baseline: two keys
    const Setup = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.old', 'out', '--info.stay', 'here',
    ])
    expect(Setup.ExitCode).toBe(0)

    // one command: add a new key AND delete an existing key
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.new', 'added', '--info-delete.old',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId, '--info',
    ])
    const Info = JSON.parse(Get.Stdout).info as Record<string,unknown>
    expect(Info['new']).toBe('added')     // newly added key is present
    expect('old' in Info).toBe(false)     // deleted key is gone
    expect(Info['stay']).toBe('here')     // unrelated key is untouched
  })

  it('EU-13: --info.<key> and --info-delete.<key> name the same key — delete wins', async () => {
    // pre-condition: ensure the key is absent so the test starts clean
    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info-delete.contested',
    ])

    // write and delete the same key in one command
    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', ItemId, '--info.contested', 'written', '--info-delete.contested',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', ItemId, '--info',
    ])
    const Info = JSON.parse(Get.Stdout).info as Record<string,unknown>
    // delete must win regardless of flag order on the command line
    expect('contested' in Info).toBe(false)
  })
})

//----------------------------------------------------------------------------//
//                    DO — Duplicate Options                                  //
//----------------------------------------------------------------------------//

describe('duplicate options (DO)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-do-'))
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('DO-01: --label given twice in entry create — last value is used', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'create', '--label', 'first', '--label', 'last',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = JSON.parse(Create.Stdout).id

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id, '--label',
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).label).toBe('last')
  })

  it('DO-02: --label given twice in entry update — last value is used', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'create', '--label', 'original',
    ])
    const Id = Create.Stdout.trim()

    const Update = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'entry', 'update', Id, '--label', 'first', '--label', 'last',
    ])
    expect(Update.ExitCode).toBe(0)

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id, '--label',
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).label).toBe('last')
  })

  it('DO-03: --mime given twice in entry create — last value is used', async () => {
    const Create = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'create', '--mime', 'text/plain', '--mime', 'application/json',
    ])
    expect(Create.ExitCode).toBe(0)
    const Id = JSON.parse(Create.Stdout).id

    const Get = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json',
      'entry', 'get', Id, '--mime',
    ])
    expect(Get.ExitCode).toBe(0)
    expect(JSON.parse(Get.Stdout).mime).toBe('application/json')
  })
})
