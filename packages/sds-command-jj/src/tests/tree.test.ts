/*******************************************************************************
*                                                                              *
*                       tree command — integration tests                       *
*                                                                              *
*******************************************************************************/

// covers: TW (tree show)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import { runCLI } from './runCLI.js'

//----------------------------------------------------------------------------//
//                              TW — tree show                                //
//----------------------------------------------------------------------------//

describe('tree show (TW)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw-'))
    // seed a store (empty of user items)
    await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'entry', 'create', '--label', 'seed',
    ])
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('TW-01: text output starts with "root/" header', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, 'tree', 'show',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/^root\//)
  })

  it('TW-02: JSON output has a "root" array at the top level', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir, '--format', 'json', 'tree', 'show',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Array.isArray(Json.root)).toBe(true)
  })

  it('TW-03: a store with one item shows that item in the JSON root array', async () => {
    const PersistenceDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw3-'))
    try {
      const Create = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir2, 'entry', 'create', '--label', 'only-item',
      ])
      const Id = Create.Stdout.trim()

      const Result = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir2, '--format', 'json', 'tree', 'show',
      ])
      const Json = JSON.parse(Result.Stdout)
      expect(Json.root.some((n:{ Id:string }) => n.Id === Id)).toBe(true)
    } finally {
      await fs.rm(PersistenceDir2, { recursive:true, force:true })
    }
  })

  it('TW-04: --depth 1 limits output to direct inner entries of root', async () => {
    // create a container at root, then a child inside it
    const PersistenceDir3 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw4-'))
    try {
      const Outer = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir3, 'entry', 'create', '--label', 'outer',
      ])
      const OuterId = Outer.Stdout.trim()
      const Inner = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir3,
        'entry', 'create', '--label', 'inner', '--container', OuterId,
      ])
      const InnerId = Inner.Stdout.trim()

      const Result = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir3, '--format', 'json',
        'tree', 'show', '--depth', '1',
      ])
      const Json = JSON.parse(Result.Stdout)

      // outer is at root level and should appear
      const OuterNode = Json.root.find((n:{ Id:string }) => n.Id === OuterId)
      expect(OuterNode).toBeDefined()

      // with depth 1, outer's Children array is empty (not recursed)
      expect(OuterNode.Children).toHaveLength(0)

      // inner item should not appear anywhere in the flat JSON
      const AllIds = JSON.stringify(Json)
      expect(AllIds).not.toContain(InnerId)
    } finally {
      await fs.rm(PersistenceDir3, { recursive:true, force:true })
    }
  })

  it('TW-05: --depth with a non-integer value exits with UsageError (code 2)', async () => {
    const Result = await runCLI([
      '--store', 'test', '--persistence-dir', PersistenceDir,
      'tree', 'show', '--depth', 'abc',
    ])
    expect(Result.ExitCode).toBe(2)
  })

  it('TW-06: tree show on a non-existent store exits with NotFound (code 3)', async () => {
    const EmptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw06-'))
    try {
      const Result = await runCLI([
        '--store', 'nosuchstore', '--persistence-dir', EmptyDir,
        'tree', 'show',
      ])
      expect(Result.ExitCode).toBe(3)
    } finally {
      await fs.rm(EmptyDir, { recursive:true, force:true })
    }
  })

  it('TW-07: --depth 0 returns an empty root array in JSON (no children shown)', async () => {
    const PersistenceDir4 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw7-'))
    try {
      await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir4, 'entry', 'create', '--label', 'item',
      ])
      const Result = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir4, '--format', 'json',
        'tree', 'show', '--depth', '0',
      ])
      expect(Result.ExitCode).toBe(0)
      const Json = JSON.parse(Result.Stdout)
      expect(Array.isArray(Json.root)).toBe(true)
      expect(Json.root).toHaveLength(0)
    } finally {
      await fs.rm(PersistenceDir4, { recursive:true, force:true })
    }
  })

  it('TW-08: tree show includes system containers (trash, lost-and-found) at root level', async () => {
    const PersistenceDir8 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw8-'))
    try {
      // create one user item so the store file exists
      await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir8, 'entry', 'create', '--label', 'user-item',
      ])
      const Result = await runCLI([
        '--store', 'test', '--persistence-dir', PersistenceDir8, '--format', 'json', 'tree', 'show',
      ])
      expect(Result.ExitCode).toBe(0)
      const Json = JSON.parse(Result.Stdout)
      const AllIds = JSON.stringify(Json)
      // well-known system IDs must appear in tree output
      expect(AllIds).toContain('00000000-0000-4000-8000-000000000001')  // TrashId
      expect(AllIds).toContain('00000000-0000-4000-8000-000000000002')  // LostAndFoundId
    } finally {
      await fs.rm(PersistenceDir8, { recursive:true, force:true })
    }
  })
})
