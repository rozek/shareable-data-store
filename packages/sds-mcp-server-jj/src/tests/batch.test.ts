/*******************************************************************************
*                                                                              *
*                   batch tool — integration tests (MCP)                       *
*                                                                              *
*******************************************************************************/

// covers: BA (sds_batch)

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
//                               BA — sds_batch                              //
//----------------------------------------------------------------------------//

describe('sds_batch (BA)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ba-'))
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('BA-01: create + get in one batch → Results has 2 entries, both ok: true', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba01-item' },
        },
        {
          Tool:   'sds_entry_get',
          Params: { Id:'root' },
        },
      ],
    })
    expect(Result.isError).toBe(false)
    const Results = (Result.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(Results.length).toBe(2)
    expect(Results[0]?.['ok']).toBe(true)
    expect(Results[1]?.['ok']).toBe(true)
  })

  it('BA-02: onError: "stop" — 2nd command fails → Results has 2 entries; 3rd absent', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      onError:  'stop',
      Commands: [
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba02-first' },
        },
        {
          // deliberately fail: get a non-existent UUID
          Tool:   'sds_entry_get',
          Params: { Id:'00000000-0000-0000-0000-000000000099' },
        },
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba02-third' },
        },
      ],
    })
    expect(Result.isError).toBe(false)
    const Results = (Result.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(Results.length).toBe(2)
    expect(Results[1]?.['ok']).toBe(false)
  })

  it('BA-03: onError: "continue" — 2nd fails → Results has 3 entries; 2nd ok: false; 3rd ok: true', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      onError:  'continue',
      Commands: [
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba03-first' },
        },
        {
          Tool:   'sds_entry_get',
          Params: { Id:'00000000-0000-0000-0000-000000000099' },
        },
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba03-third' },
        },
      ],
    })
    expect(Result.isError).toBe(false)
    const Results = (Result.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(Results.length).toBe(3)
    expect(Results[1]?.['ok']).toBe(false)
    expect(typeof Results[1]?.['Error']).toBe('string')
    expect(Results[2]?.['ok']).toBe(true)
  })

  it('BA-04: sds_store_destroy in Commands (disallowed) → isError: true before any execution', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_store_destroy',
          Params: {},
        },
      ],
    })
    expect(Result.isError).toBe(true)
  })

  it('BA-05: Commands absent → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId: 'ba-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(true)
  })

  it('BA-06: sync step with unreachable server, onError: "continue" → sync step ok: false; create step ok: true', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      onError:  'continue',
      Commands: [
        {
          Tool:   'sds_store_sync',
          Params: {
            ServerURL: 'ws://127.0.0.1:1',
            Token:     'tok',
            TimeoutMs: 500,
          },
        },
        {
          Tool:   'sds_entry_create',
          Params: { Label:'ba06-after-sync' },
        },
      ],
    })
    expect(Result.isError).toBe(false)
    const Results = (Result.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(Results.length).toBe(2)
    expect(Results[0]?.['ok']).toBe(false)
    expect(Results[1]?.['ok']).toBe(true)
  })

  // BA-08 appears before BA-07 in this file because BA-07 uses its own isolated store
  // ('ba07-store') and the two tests are independent; execution order does not affect results.
  it('BA-08: sds_token_issue in Commands (disallowed) → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_token_issue',
          Params: { ServerURL:'ws://localhost', AdminToken:'x', Sub:'u', Scope:'read' },
        },
      ],
    })
    expect(Result.isError).toBe(true)
  })

  it('BA-09: sds_store_ping in Commands (disallowed) → isError: true before any execution', async () => {
    const Result = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba-test',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_store_ping',
          Params: { ServerURL:'ws://localhost', Token:'tok' },
        },
      ],
    })
    expect(Result.isError).toBe(true)
  })

  it('BA-10: batch sds_store_export (JSON, no file) + sds_store_import (base64) into new store → both ok: true; EntryCount matches', async () => {
    // first populate a source store
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ba10-src',
      PersistenceDir,
      Label:   'ba10-item-1',
    })
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ba10-src',
      PersistenceDir,
      Label:   'ba10-item-2',
    })

    // export from source store in a batch, then import into a new store in the same batch
    const ExportResult = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba10-src',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_store_export',
          Params: { Encoding:'json' },
        },
      ],
    })
    expect(ExportResult.isError).toBe(false)
    const ExportResults = (ExportResult.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(ExportResults[0]?.['ok']).toBe(true)
    const ExportData   = (ExportResults[0]?.['Result'] as Record<string,unknown>)['Data'] as string
    const DataBase64   = Buffer.from(ExportData).toString('base64')

    // import the base64-encoded JSON snapshot into a fresh target store
    const ImportResult = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba10-dst',
      PersistenceDir,
      Commands: [
        {
          Tool:   'sds_store_import',
          Params: { InputBase64:DataBase64, InputEncoding:'json' },
        },
        {
          Tool:   'sds_store_info',
          Params: {},
        },
      ],
    })
    expect(ImportResult.isError).toBe(false)
    const ImportResults = (ImportResult.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(ImportResults[0]?.['ok']).toBe(true)
    expect(ImportResults[1]?.['ok']).toBe(true)
    const DstEntryCount = (ImportResults[1]?.['Result'] as Record<string,unknown>)['EntryCount'] as number
    expect(DstEntryCount).toBe(2)
  })

  it('BA-07: StoreId + PersistenceDir at batch level → commands without them use the correct store', async () => {
    const BatchResult = await callTool(MCPClient, 'sds_batch', {
      StoreId:  'ba07-store',
      PersistenceDir,
      Commands: [
        {
          // no StoreId / PersistenceDir — must inherit from batch level
          Tool:   'sds_entry_create',
          Params: { Label:'ba07-item' },
        },
        {
          Tool:   'sds_store_info',
          Params: {},
        },
      ],
    })
    expect(BatchResult.isError).toBe(false)
    const Results = (BatchResult.Result as Record<string,unknown>)['Results'] as Array<Record<string,unknown>>
    expect(Results.length).toBe(2)
    expect(Results[0]?.['ok']).toBe(true)
    expect(Results[1]?.['ok']).toBe(true)

    // the store info result should reflect the ba07-store
    const InfoResult = Results[1]?.['Result'] as Record<string,unknown>
    expect(InfoResult?.['StoreId']).toBe('ba07-store')
    expect(InfoResult?.['exists']).toBe(true)
  })

})
