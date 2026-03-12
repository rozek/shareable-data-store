/*******************************************************************************
*                                                                              *
*                   store tools — integration tests (MCP)                      *
*                                                                              *
*******************************************************************************/

// covers: LT (list tools), SI (store info), SP (store ping),
//         SY (store sync validation), SD (store destroy), SE (store export/import)

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
//                              LT — ListTools                                //
//----------------------------------------------------------------------------//

describe('ListTools (LT)', () => {

  it('LT-01: ListTools returns ≥ 20 tools', async () => {
    const Response = await MCPClient.listTools()
    expect(Array.isArray(Response.tools)).toBe(true)
    expect(Response.tools.length).toBeGreaterThanOrEqual(20)
  })

  it('LT-02: all 20 known tool names are present', async () => {
    const Response = await MCPClient.listTools()
    const Names    = new Set(Response.tools.map((t) => t.name))
    const Expected = [
      'sds_store_info',    'sds_store_ping',       'sds_store_sync',
      'sds_store_destroy', 'sds_store_export',     'sds_store_import',
      'sds_entry_create',  'sds_entry_get',         'sds_entry_list',
      'sds_entry_update',  'sds_entry_move',        'sds_entry_delete',
      'sds_entry_restore', 'sds_entry_purge',
      'sds_trash_list',    'sds_trash_purge_all',  'sds_trash_purge_expired',
      'sds_tree_show',     'sds_token_issue',       'sds_batch',
    ]
    for (const Name of Expected) {
      expect(Names.has(Name), `expected tool '${Name}' to be present`).toBe(true)
    }
  })

})

//----------------------------------------------------------------------------//
//                              SI — store info                               //
//----------------------------------------------------------------------------//

describe('store info (SI)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-si-'))
    // create a store by adding one item
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'si-test',
      PersistenceDir,
      Label:   'seed',
    })
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('SI-01: StoreId absent → isError: true; message contains "StoreId"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', { PersistenceDir })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/StoreId/i)
  })

  it('SI-02: non-existent store → isError: false; exists: false; StoreId matches', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {
      StoreId: 'si-nosuchstore',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exists']).toBe(false)
    expect(R['StoreId']).toBe('si-nosuchstore')
  })

  it('SI-03: existing store → isError: false; exists: true; EntryCount ≥ 1; DBPath non-empty', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {
      StoreId: 'si-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exists']).toBe(true)
    expect(typeof R['EntryCount']).toBe('number')
    expect(R['EntryCount'] as number).toBeGreaterThanOrEqual(1)
    expect(typeof R['DBPath']).toBe('string')
    expect((R['DBPath'] as string).length).toBeGreaterThan(0)
  })

})

//----------------------------------------------------------------------------//
//                              SP — store ping                               //
//----------------------------------------------------------------------------//

describe('store ping (SP)', () => {

  it('SP-01: ServerURL absent → isError: true; message contains "ServerURL"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_ping', {
      StoreId: 'sp-test',
      Token:   'tok',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/ServerURL/i)
  })

  it('SP-02: Token absent → isError: true; message contains "Token"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_ping', {
      StoreId:   'sp-test',
      ServerURL: 'ws://localhost:9999',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/Token/i)
  })

  it('SP-03: ServerURL = "http://bad" (no ws scheme) → isError: true; message contains "ServerURL"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_ping', {
      StoreId:   'sp-test',
      ServerURL: 'http://bad',
      Token:     'tok',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/ServerURL/i)
  })

  it('SP-04: unreachable address → isError: false; reachable: false', async () => {
    const Result = await callTool(MCPClient, 'sds_store_ping', {
      StoreId:   'sp-test',
      ServerURL: 'ws://127.0.0.1:1',
      Token:     'tok',
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['reachable']).toBe(false)
  })

})

//----------------------------------------------------------------------------//
//                        SY — store sync validation                         //
//----------------------------------------------------------------------------//

describe('store sync validation (SY)', () => {

  it('SY-01: TimeoutMs: 0 → isError: true; message contains "TimeoutMs"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_sync', {
      StoreId:   'sy-test',
      ServerURL: 'ws://localhost:9999',
      Token:     'tok',
      TimeoutMs: 0,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/TimeoutMs/i)
  })

  it('SY-02: TimeoutMs: -1 → isError: true; message contains "TimeoutMs"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_sync', {
      StoreId:   'sy-test',
      ServerURL: 'ws://localhost:9999',
      Token:     'tok',
      TimeoutMs: -1,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/TimeoutMs/i)
  })

  it('SY-03: ServerURL = "ftp://bad" → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_store_sync', {
      StoreId:   'sy-test',
      ServerURL: 'ftp://bad',
      Token:     'tok',
    })
    expect(Result.isError).toBe(true)
  })

})

//----------------------------------------------------------------------------//
//                            SD — store destroy                             //
//----------------------------------------------------------------------------//

describe('store destroy (SD)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-sd-'))
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'sd-destroyme',
      PersistenceDir,
      Label:   'tmp',
    })
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('SD-01: destroy existing store; follow-up info returns exists: false', async () => {
    const Destroy = await callTool(MCPClient, 'sds_store_destroy', {
      StoreId: 'sd-destroyme',
      PersistenceDir,
    })
    expect(Destroy.isError).toBe(false)
    const D = Destroy.Result as Record<string,unknown>
    expect(D['destroyed']).toBe(true)

    const Info = await callTool(MCPClient, 'sds_store_info', {
      StoreId: 'sd-destroyme',
      PersistenceDir,
    })
    expect(Info.isError).toBe(false)
    expect((Info.Result as Record<string,unknown>)['exists']).toBe(false)
  })

  it('SD-02: destroy non-existent store → isError: true; message contains store ID', async () => {
    const Result = await callTool(MCPClient, 'sds_store_destroy', {
      StoreId: 'sd-nosuchstore',
      PersistenceDir,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/sd-nosuchstore/)
  })

})

//----------------------------------------------------------------------------//
//                       SE — store export / import                          //
//----------------------------------------------------------------------------//

describe('store export / import (SE)', () => {
  let PersistenceDir:string
  const StoreId = 'se-src'

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-se-'))
    // populate with a few items
    for (const Label of [ 'alpha', 'beta', 'gamma' ]) {
      await callTool(MCPClient, 'sds_entry_create', { StoreId, PersistenceDir, Label })
    }
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('SE-01: JSON export without OutputFile → exported: true; Format: "json"; Data is a string', async () => {
    const Result = await callTool(MCPClient, 'sds_store_export', { StoreId, PersistenceDir })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exported']).toBe(true)
    expect(R['Format']).toBe('json')
    expect(typeof R['Data']).toBe('string')
  })

  it('SE-02: JSON export to file → exported: true; Format: "json"; File = given path', async () => {
    const OutputFile = path.join(PersistenceDir, 'snap.json')
    const Result = await callTool(MCPClient, 'sds_store_export', {
      StoreId, PersistenceDir, Encoding:'json', OutputFile,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exported']).toBe(true)
    expect(R['Format']).toBe('json')
    expect(R['File']).toBe(OutputFile)
  })

  it('SE-03: JSON export to file → JSON import into new store; EntryCount matches', async () => {
    const OutputFile = path.join(PersistenceDir, 'snap2.json')
    await callTool(MCPClient, 'sds_store_export', {
      StoreId, PersistenceDir, Encoding:'json', OutputFile,
    })
    const Import = await callTool(MCPClient, 'sds_store_import', {
      StoreId:   'se-dst-json',
      PersistenceDir,
      InputFile: OutputFile,
      InputEncoding: 'json',
    })
    expect(Import.isError).toBe(false)
    expect((Import.Result as Record<string,unknown>)['imported']).toBe(true)

    const SrcInfo = await callTool(MCPClient, 'sds_store_info', { StoreId, PersistenceDir })
    const DstInfo = await callTool(MCPClient, 'sds_store_info', { StoreId:'se-dst-json', PersistenceDir })
    const SrcCount = (SrcInfo.Result as Record<string,unknown>)['EntryCount'] as number
    const DstCount = (DstInfo.Result as Record<string,unknown>)['EntryCount'] as number
    expect(DstCount).toBe(SrcCount)
  })

  it('SE-04: binary export without OutputFile → exported: true; Format: "binary"; DataBase64 present', async () => {
    const Result = await callTool(MCPClient, 'sds_store_export', {
      StoreId, PersistenceDir, Encoding:'binary',
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exported']).toBe(true)
    expect(R['Format']).toBe('binary')
    expect(typeof R['DataBase64']).toBe('string')
    expect((R['DataBase64'] as string).length).toBeGreaterThan(0)
    // verify it decodes to a non-empty buffer
    const Buf = Buffer.from(R['DataBase64'] as string, 'base64')
    expect(Buf.length).toBeGreaterThan(0)
  })

  it('SE-05: binary export to file → exported: true; Format: "binary"; file non-empty', async () => {
    const OutputFile = path.join(PersistenceDir, 'snap.bin')
    const Result = await callTool(MCPClient, 'sds_store_export', {
      StoreId, PersistenceDir, Encoding:'binary', OutputFile,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exported']).toBe(true)
    expect(R['Format']).toBe('binary')
    expect(R['File']).toBe(OutputFile)
    const Stat = await fs.stat(OutputFile)
    expect(Stat.size).toBeGreaterThan(0)
  })

  it('SE-06: binary export to file → binary import into new store; EntryCount matches', async () => {
    const OutputFile = path.join(PersistenceDir, 'snap2.bin')
    await callTool(MCPClient, 'sds_store_export', {
      StoreId, PersistenceDir, Encoding:'binary', OutputFile,
    })
    const Import = await callTool(MCPClient, 'sds_store_import', {
      StoreId:       'se-dst-bin',
      PersistenceDir,
      InputFile:     OutputFile,
      InputEncoding: 'binary',
    })
    expect(Import.isError).toBe(false)

    const SrcInfo = await callTool(MCPClient, 'sds_store_info', { StoreId, PersistenceDir })
    const DstInfo = await callTool(MCPClient, 'sds_store_info', { StoreId:'se-dst-bin', PersistenceDir })
    const SrcCount = (SrcInfo.Result as Record<string,unknown>)['EntryCount'] as number
    const DstCount = (DstInfo.Result as Record<string,unknown>)['EntryCount'] as number
    expect(DstCount).toBe(SrcCount)
  })

  it('SE-07: import from non-existent file → isError: true; message contains "not found"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_import', {
      StoreId,
      PersistenceDir,
      InputFile:     path.join(PersistenceDir, 'nonexistent.json'),
      InputEncoding: 'json',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not found/i)
  })

  it('SE-08: both InputFile and InputBase64 → isError: true; message contains "mutually exclusive"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_import', {
      StoreId,
      PersistenceDir,
      InputFile:     path.join(PersistenceDir, 'any.json'),
      InputBase64:   Buffer.from('{}').toString('base64'),
      InputEncoding: 'json',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/mutually exclusive/i)
  })

  it('SE-09: InputBase64 without InputEncoding → isError: true; message contains "InputEncoding"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_import', {
      StoreId,
      PersistenceDir,
      InputBase64: Buffer.from('{}').toString('base64'),
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/InputEncoding/i)
  })

  it('SE-10: neither InputFile nor InputBase64 → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_store_import', {
      StoreId,
      PersistenceDir,
    })
    expect(Result.isError).toBe(true)
  })

  it('SE-11: Encoding: "xlsx" (invalid) → isError: true; message contains "Encoding"', async () => {
    const Result = await callTool(MCPClient, 'sds_store_export', {
      StoreId,
      PersistenceDir,
      Encoding: 'xlsx',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/Encoding/i)
  })

})
