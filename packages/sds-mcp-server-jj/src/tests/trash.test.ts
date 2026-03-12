/*******************************************************************************
*                                                                              *
*                   trash tools — integration tests (MCP)                      *
*                                                                              *
*******************************************************************************/

// covers: TL (trash list), TA (trash purge-all), TX (trash purge-expired)

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
//                              TL — trash list                              //
//----------------------------------------------------------------------------//

describe('trash list (TL)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tl-'))

    // create an item and a link, then delete both
    const Item = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tl-test',
      PersistenceDir,
      Label:   'tl-item',
    })
    ItemId = (Item.Result as Record<string,unknown>)['Id'] as string

    const Target = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tl-test',
      PersistenceDir,
      Label:   'tl-target',
    })
    const TargetId = (Target.Result as Record<string,unknown>)['Id'] as string

    const Link = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tl-test',
      PersistenceDir,
      Target:  TargetId,
    })
    LinkId = (Link.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('TL-01: empty trash returns []', async () => {
    // fresh store — nothing deleted yet
    const PersistenceDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tl01-'))
    try {
      await callTool(MCPClient, 'sds_entry_create', {
        StoreId: 'tl01-empty',
        PersistenceDir: PersistenceDir2,
        Label:   'seed',
      })
      const Result = await callTool(MCPClient, 'sds_trash_list', {
        StoreId: 'tl01-empty',
        PersistenceDir: PersistenceDir2,
      })
      expect(Result.isError).toBe(false)
      const Entries = Result.Result as unknown[]
      expect(Array.isArray(Entries)).toBe(true)
      expect(Entries.length).toBe(0)
    } finally {
      await fs.rm(PersistenceDir2, { recursive:true, force:true })
    }
  })

  it('TL-02: after entry delete → deleted entry ID in result', async () => {
    await callTool(MCPClient, 'sds_entry_delete', {
      StoreId: 'tl-test',
      PersistenceDir,
      Id:      ItemId,
    })
    const Result = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'tl-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === ItemId)).toBe(true)
  })

  // requires: TL-02 (ItemId in trash — ensures at least one item is present so the
  //           "items" filter can be proven to include items and exclude the link added below)
  it('TL-03: only: "items" → no element has Kind: "link"', async () => {
    await callTool(MCPClient, 'sds_entry_delete', {
      StoreId: 'tl-test',
      PersistenceDir,
      Id:      LinkId,
    })
    const Result = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'tl-test',
      PersistenceDir,
      only:    'items',
    })
    expect(Result.isError).toBe(false)
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.every((e) => e['Kind'] === 'item')).toBe(true)
  })

  // requires: TL-02 (ItemId in trash), TL-03 (LinkId in trash — ensures at least one link
  //           is present so the "links" filter can be proven to include links and exclude items)
  it('TL-04: only: "links" → no element has Kind: "item"', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'tl-test',
      PersistenceDir,
      only:    'links',
    })
    expect(Result.isError).toBe(false)
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.every((e) => e['Kind'] === 'link')).toBe(true)
  })

  it('TL-05: only: "both" (invalid) → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'tl-test',
      PersistenceDir,
      only:    'both',
    })
    expect(Result.isError).toBe(true)
  })

})

//----------------------------------------------------------------------------//
//                           TA — trash purge-all                            //
//----------------------------------------------------------------------------//

describe('trash purge-all (TA)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ta-'))

    // put 2 items into the trash
    for (const Label of [ 'ta-item1', 'ta-item2' ]) {
      const Create = await callTool(MCPClient, 'sds_entry_create', {
        StoreId: 'ta-test',
        PersistenceDir,
        Label,
      })
      const Id = (Create.Result as Record<string,unknown>)['Id'] as string
      await callTool(MCPClient, 'sds_entry_delete', { StoreId:'ta-test', PersistenceDir, Id })
    }
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('TA-01: purge all with 2 items in trash → purged: 2; follow-up trash list returns []', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_purge_all', {
      StoreId: 'ta-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['purged']).toBe(2)

    const List = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'ta-test',
      PersistenceDir,
    })
    const Entries = List.Result as unknown[]
    expect(Entries.length).toBe(0)
  })

})

//----------------------------------------------------------------------------//
//                         TX — trash purge-expired                          //
//----------------------------------------------------------------------------//

describe('trash purge-expired (TX)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-tx-'))

    // put an item into the trash (it was just deleted, so it is very recent)
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'tx-test',
      PersistenceDir,
      Label:   'tx-item',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string
    await callTool(MCPClient, 'sds_entry_delete', { StoreId:'tx-test', PersistenceDir, Id })
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('TX-01: TTLms: 3153600000000 (≈ 100 years) → purged: 0; TTLms echoed; entries remain in trash', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_purge_expired', {
      StoreId: 'tx-test',
      PersistenceDir,
      TTLms:   3153600000000,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['purged']).toBe(0)
    expect(R['TTLms']).toBe(3153600000000)

    const List = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'tx-test',
      PersistenceDir,
    })
    const Entries = List.Result as unknown[]
    expect(Entries.length).toBeGreaterThan(0)
  })

  it('TX-02: TTLms: 0 → isError: true; message contains "TTLms"', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_purge_expired', {
      StoreId: 'tx-test',
      PersistenceDir,
      TTLms:   0,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/TTLms/i)
  })

  it('TX-03: TTLms: -1 → isError: true; message contains "TTLms"', async () => {
    const Result = await callTool(MCPClient, 'sds_trash_purge_expired', {
      StoreId: 'tx-test',
      PersistenceDir,
      TTLms:   -1,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/TTLms/i)
  })

})
