/*******************************************************************************
*                                                                              *
*                   token tools — integration tests (MCP)                      *
*                                                                              *
*******************************************************************************/

// covers: TI (token issue)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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
//                            TI — token issue                               //
//----------------------------------------------------------------------------//

describe('token issue (TI)', () => {

  it('TI-01: ServerURL: "http://bad" → isError: true; message contains "ServerURL"', async () => {
    const Result = await callTool(MCPClient, 'sds_token_issue', {
      ServerURL:   'http://bad',
      AdminToken:  'admin-tok',
      Sub:         'alice',
      Scope:       'read',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/ServerURL/i)
  })

  it('TI-02: Scope: "superadmin" → isError: true; message contains "Scope"', async () => {
    const Result = await callTool(MCPClient, 'sds_token_issue', {
      ServerURL:   'ws://localhost:9999',
      AdminToken:  'admin-tok',
      Sub:         'alice',
      Scope:       'superadmin',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/Scope/i)
  })

  it('TI-03: Exp: "7x" → isError: true; message contains "Exp"', async () => {
    const Result = await callTool(MCPClient, 'sds_token_issue', {
      ServerURL:  'ws://localhost:9999',
      AdminToken: 'admin-tok',
      Sub:        'alice',
      Scope:      'read',
      Exp:        '7x',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/Exp/i)
  })

  it('TI-04: valid params, unreachable server → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_token_issue', {
      ServerURL:  'ws://127.0.0.1:1',
      AdminToken: 'admin-tok',
      Sub:        'alice',
      Scope:      'read',
      Exp:        '24h',
    })
    expect(Result.isError).toBe(true)
  })

})
