/*******************************************************************************
*                                                                              *
*                    tree tools — integration tests (MCP)                      *
*                                                                              *
*******************************************************************************/

// covers: TW (tree show)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { createMCPClient, callTool, closeMCPClient } from './runMCP.js'

let MCPClient:Client

beforeAll(async () => {
  MCPClient = await createMCPClient()
})

afterAll(async () => {
  await closeMCPClient(MCPClient)
})

//----------------------------------------------------------------------------//
//                              TW — tree show                               //
//----------------------------------------------------------------------------//

describe('tree show (TW)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  // well-known system IDs
  const TrashId = '00000000-0000-4000-8000-000000000001'

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw-'))

    // create a labelled item and a link pointing at it
    const Item = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tw-test',
      PersistenceDir,
      Label:   'TW-Item',
    })
    ItemId = (Item.Result as Record<string,unknown>)['Id'] as string

    const Link = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tw-test',
      PersistenceDir,
      Target:  ItemId,
    })
    LinkId = (Link.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('TW-01: populated store → Root non-empty; each node has Id, Kind, Label; item nodes also have innerEntries', async () => {
    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const R    = Result.Result as Record<string,unknown>
    const Root = R['Root'] as Array<Record<string,unknown>>
    expect(Array.isArray(Root)).toBe(true)
    expect(Root.length).toBeGreaterThan(0)
    for (const Node of Root) {
      expect(Node).toHaveProperty('Id')
      expect(Node).toHaveProperty('Kind')
      expect(Node).toHaveProperty('Label')
      if (Node['Kind'] === 'item') {
        expect(Node).toHaveProperty('innerEntries')
      }
    }
  })

  it('TW-02: empty store → Root: []', async () => {
    const EmptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tw02-'))
    try {
      // create a store with only the seed entry — then destroy it and recreate empty
      // easier: use a store ID that has never had entries written
      // actually we need at least the store to exist, so create it via entry create then purge all
      const Create = await callTool(MCPClient, 'sds_entry_create', {
        StoreId: 'tw02-empty',
        PersistenceDir: EmptyDir,
        Label:   'seed',
      })
      const Id = (Create.Result as Record<string,unknown>)['Id'] as string
      await callTool(MCPClient, 'sds_entry_delete',  { StoreId:'tw02-empty', PersistenceDir:EmptyDir, Id })
      await callTool(MCPClient, 'sds_trash_purge_all', { StoreId:'tw02-empty', PersistenceDir:EmptyDir })

      const Result = await callTool(MCPClient, 'sds_tree_show', {
        StoreId: 'tw02-empty',
        PersistenceDir: EmptyDir,
      })
      expect(Result.isError).toBe(false)
      const Root = (Result.Result as Record<string,unknown>)['Root'] as unknown[]
      expect(Array.isArray(Root)).toBe(true)
      expect(Root.length).toBe(0)
    } finally {
      await fs.rm(EmptyDir, { recursive:true, force:true })
    }
  })

  // requires: beforeAll (ItemId); creates a nested child inside ItemId to make the depth
  //           limit observable — TW-04 through TW-06 use the same shared store but do not
  //           depend on the presence or absence of this child, so the mutation is safe.
  it('TW-03: Depth: 1 → innerEntries of every root item node is []', async () => {
    // create a nested item to make the depth limit observable
    const Child = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'tw-test',
      PersistenceDir,
      Container: ItemId,
      Label:     'child',
    })
    expect(Child.isError).toBe(false)

    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
      Depth:   1,
    })
    expect(Result.isError).toBe(false)
    const Root = (Result.Result as Record<string,unknown>)['Root'] as Array<Record<string,unknown>>
    for (const Node of Root) {
      if (Node['Kind'] !== 'item') { continue }
      const Inner = Node['innerEntries'] as unknown[]
      expect(Array.isArray(Inner)).toBe(true)
      expect(Inner.length).toBe(0)
    }
  })

  it('TW-04: Depth: 0 → Root: []', async () => {
    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
      Depth:   0,
    })
    expect(Result.isError).toBe(false)
    const Root = (Result.Result as Record<string,unknown>)['Root'] as unknown[]
    expect(Array.isArray(Root)).toBe(true)
    expect(Root.length).toBe(0)
  })

  it('TW-04b: Depth: -1 → isError: true; message mentions Depth', async () => {
    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
      Depth:   -1,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/'Depth'/i)
  })

  it('TW-05: Trash absent → Trash ID not in any node of the tree', async () => {
    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const Root = (Result.Result as Record<string,unknown>)['Root'] as Array<Record<string,unknown>>

    function collectIds (Nodes:Array<Record<string,unknown>>):string[] {
      const Ids:string[] = []
      for (const N of Nodes) {
        Ids.push(N['Id'] as string)
        const Inner = N['innerEntries'] as Array<Record<string,unknown>> | undefined
        if (Inner != null) { Ids.push(...collectIds(Inner)) }
      }
      return Ids
    }

    const AllIds = collectIds(Root)
    expect(AllIds).not.toContain(TrashId)
  })

  it('TW-06: link node has TargetId field; no innerEntries for link nodes', async () => {
    const Result = await callTool(MCPClient, 'sds_tree_show', {
      StoreId: 'tw-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const Root = (Result.Result as Record<string,unknown>)['Root'] as Array<Record<string,unknown>>

    function findLink (Nodes:Array<Record<string,unknown>>):Record<string,unknown> | undefined {
      for (const N of Nodes) {
        if (N['Kind'] === 'link') { return N }
        const Inner = N['innerEntries'] as Array<Record<string,unknown>> | undefined
        if (Inner != null) {
          const Found = findLink(Inner)
          if (Found != null) { return Found }
        }
      }
      return undefined
    }

    const LinkNode = findLink(Root)
    expect(LinkNode).toBeDefined()
    expect(LinkNode!).toHaveProperty('TargetId')
    expect(LinkNode!).not.toHaveProperty('innerEntries')
  })

})
