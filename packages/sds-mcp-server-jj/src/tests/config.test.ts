/*******************************************************************************
*                                                                              *
*                  config / defaults — integration tests (MCP)                 *
*                                                                              *
*******************************************************************************/

// covers: CF (config defaults via CLI args and env vars)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { createMCPClient, createMCPClientWith, callTool, closeMCPClient } from './runMCP.js'

//----------------------------------------------------------------------------//
//                           CF — config env vars                             //
//----------------------------------------------------------------------------//

describe('config: env vars (CF-env)', () => {
  let PersistenceDir:string
  let MCPClient:Client

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-cf-env-'))

    // pre-create the store so sds_store_info reports exists: true
    const Seed = await createMCPClient()
    await callTool(Seed, 'sds_entry_create', { StoreId:'cf-env-test', PersistenceDir })
    await closeMCPClient(Seed)

    MCPClient = await createMCPClientWith({
      extraEnv: { SDS_STORE_ID:'cf-env-test', SDS_PERSISTENCE_DIR:PersistenceDir },
    })
  })

  afterAll(async () => {
    await closeMCPClient(MCPClient)
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('CF-01: SDS_STORE_ID env var → sds_store_info without StoreId uses it', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {})
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['StoreId']).toBe('cf-env-test')
  })

  it('CF-02: SDS_PERSISTENCE_DIR env var → store found in the correct directory', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {})
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exists']).toBe(true)
  })

  it('CF-03: explicit StoreId param overrides SDS_STORE_ID env var', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', { StoreId:'override-store' })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['StoreId']).toBe('override-store')   // param wins over env var
  })

})

//----------------------------------------------------------------------------//
//                           CF — config CLI args                             //
//----------------------------------------------------------------------------//

describe('config: CLI args (CF-cli)', () => {
  let PersistenceDir:string
  let MCPClient:Client

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-cf-cli-'))

    // pre-create the store
    const Seed = await createMCPClient()
    await callTool(Seed, 'sds_entry_create', { StoreId:'cf-cli-test', PersistenceDir })
    await closeMCPClient(Seed)

    MCPClient = await createMCPClientWith({
      extraArgs: [ '--store', 'cf-cli-test', '--persistence-dir', PersistenceDir ],
    })
  })

  afterAll(async () => {
    await closeMCPClient(MCPClient)
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('CF-04: --store CLI arg → sds_store_info without StoreId uses it', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {})
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['StoreId']).toBe('cf-cli-test')
  })

  it('CF-05: --persistence-dir CLI arg → store found in the correct directory', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {})
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['exists']).toBe(true)
  })

  it('CF-06: explicit StoreId param overrides --store CLI arg', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', { StoreId:'override-store' })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['StoreId']).toBe('override-store')   // param wins over CLI arg
  })

})

//----------------------------------------------------------------------------//
//                       CF — CLI args override env vars                      //
//----------------------------------------------------------------------------//

describe('config: CLI args override env vars (CF-precedence)', () => {
  let PersistenceDir:string
  let MCPClient:Client

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-cf-prec-'))

    const Seed = await createMCPClient()
    await callTool(Seed, 'sds_entry_create', { StoreId:'cf-cli-wins', PersistenceDir })
    await closeMCPClient(Seed)

    // env var says 'cf-env-store', CLI arg says 'cf-cli-wins' → CLI arg must win
    MCPClient = await createMCPClientWith({
      extraArgs: [ '--store', 'cf-cli-wins', '--persistence-dir', PersistenceDir ],
      extraEnv:  { SDS_STORE_ID:'cf-env-store' },
    })
  })

  afterAll(async () => {
    await closeMCPClient(MCPClient)
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('CF-07: --store CLI arg takes precedence over SDS_STORE_ID env var', async () => {
    const Result = await callTool(MCPClient, 'sds_store_info', {})
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['StoreId']).toBe('cf-cli-wins')   // CLI arg beats env var
    expect(R['exists']).toBe(true)
  })

})
