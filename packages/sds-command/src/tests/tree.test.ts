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
  let DataDir:string

  beforeAll(async () => {
    DataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw-'))
    // seed a store (empty of user items)
    await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'item', 'create', '--label', 'seed',
    ])
  })

  afterAll(async () => {
    await fs.rm(DataDir, { recursive:true, force:true })
  })

  it('TW-01: text output starts with "root/" header', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, 'tree', 'show',
    ])
    expect(Result.ExitCode).toBe(0)
    expect(Result.Stdout).toMatch(/^root\//)
  })

  it('TW-02: JSON output has a "root" array at the top level', async () => {
    const Result = await runCLI([
      '--store', 'test', '--data-dir', DataDir, '--format', 'json', 'tree', 'show',
    ])
    expect(Result.ExitCode).toBe(0)
    const Json = JSON.parse(Result.Stdout)
    expect(Array.isArray(Json.root)).toBe(true)
  })

  it('TW-03: a store with one item shows that item in the JSON root array', async () => {
    const DataDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw3-'))
    try {
      const Create = await runCLI([
        '--store', 'test', '--data-dir', DataDir2, 'item', 'create', '--label', 'only-item',
      ])
      const Id = Create.Stdout.trim()

      const Result = await runCLI([
        '--store', 'test', '--data-dir', DataDir2, '--format', 'json', 'tree', 'show',
      ])
      const Json = JSON.parse(Result.Stdout)
      expect(Json.root.some((n:{ Id:string }) => n.Id === Id)).toBe(true)
    } finally {
      await fs.rm(DataDir2, { recursive:true, force:true })
    }
  })

  it('TW-04: --depth 1 limits output to direct inner entries of root', async () => {
    // create a container at root, then a child inside it
    const DataDir3 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw4-'))
    try {
      const Outer = await runCLI([
        '--store', 'test', '--data-dir', DataDir3, 'item', 'create', '--label', 'outer',
      ])
      const OuterId = Outer.Stdout.trim()
      const Inner = await runCLI([
        '--store', 'test', '--data-dir', DataDir3,
        'item', 'create', '--label', 'inner', '--container', OuterId,
      ])
      const InnerId = Inner.Stdout.trim()

      const Result = await runCLI([
        '--store', 'test', '--data-dir', DataDir3, '--format', 'json',
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
      await fs.rm(DataDir3, { recursive:true, force:true })
    }
  })
})
