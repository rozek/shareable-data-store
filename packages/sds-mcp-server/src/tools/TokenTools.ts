/*******************************************************************************
*                                                                              *
*                               TokenTools                                     *
*                                                                              *
*******************************************************************************/

// MCP tool definition and handler for JWT issuance: sds_token_issue

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

import { MCP_ToolError } from '../Errors.js'

//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//

export const TokenToolDefs:Tool[] = [

/**** sds_token_issue ****/

  {
    name:        'sds_token_issue',
    description: 'request a new scoped JWT from the server (requires admin token)',
    inputSchema: {
      type: 'object',
      properties: {
        ServerURL:   { type:'string', description:'WebSocket server base URL' },
        AdminToken:  { type:'string', description:'admin JWT with admin scope' },
        Sub:         { type:'string', description:'subject / user identifier for the new token (e.g. an email address)' },
        Scope:       { type:'string', enum:['read','write','admin'], description:'permission level for the issued token' },
        Exp:         { type:'string', description:'expiry duration — number followed by s, m, h, or d (default: 24h)' },
      },
      required: [ 'ServerURL', 'AdminToken', 'Sub', 'Scope' ],
    },
  },

]

//----------------------------------------------------------------------------//
//                           standalone handlers                              //
//----------------------------------------------------------------------------//

export type TokenToolHandler = (Params:Record<string,unknown>) => Promise<unknown>

const ValidScopes = new Set([ 'read', 'write', 'admin' ])
const ExpPattern  = /^(\d+)(s|m|h|d)$/

// sds_token_issue requires a live HTTP connection to an external server and is
// intentionally excluded from sds_batch (which operates on a single local store).
// The export below satisfies the consistent *BatchStepHandlers pattern across all
// tool modules — BatchTools.ts simply does not register any token step handler.
export type TokenBatchStepFn = never
export const TokenBatchStepHandlers:Record<string,never> = {}

export const TokenToolHandlers:Record<string,TokenToolHandler> = {

  'sds_token_issue': async (Params) => {
    const ServerURL  = Params['ServerURL']  as string | undefined
    const AdminToken = Params['AdminToken'] as string | undefined
    const Sub        = Params['Sub']        as string | undefined
    const Scope      = Params['Scope']      as string | undefined
    const Exp        = (Params['Exp']       as string | undefined) ?? '24h'

    if (ServerURL  == null) { throw new MCP_ToolError('ServerURL is required') }
    if (AdminToken == null) { throw new MCP_ToolError('AdminToken is required') }
    if (Sub        == null) { throw new MCP_ToolError('Sub is required') }
    if (Scope      == null) { throw new MCP_ToolError('Scope is required') }

    if (! /^wss?:\/\//.test(ServerURL)) {
      throw new MCP_ToolError(
        `invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`
      )
    }
    if (! ValidScopes.has(Scope)) {
      throw new MCP_ToolError(`invalid Scope '${Scope}' — must be read, write, or admin`)
    }
    if (! ExpPattern.test(Exp)) {
      throw new MCP_ToolError(`invalid Exp '${Exp}' — use a number followed by s, m, h, or d`)
    }

    // convert WebSocket scheme to HTTP for the REST call
    const HttpBase = ServerURL.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://')
    const TokenURL = HttpBase.replace(/\/+$/, '') + '/api/token'

    let Response:Response
    try {
      Response = await fetch(TokenURL, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${AdminToken}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ sub:Sub, scope:Scope, exp:Exp }),
      })
    } catch (Signal) {
      throw new MCP_ToolError(
        `HTTP request to '${TokenURL}' failed: ${(Signal as Error).message}`
      )
    }

    const Body = await Response.json().catch(() => ({}))

    switch (true) {
      case (Response.status === 401): {
        throw new MCP_ToolError(
          `authentication failed — token is missing or expired: ${(Body as any).error ?? 'unauthorized'}`
        )
      }
      case (Response.status === 403): {
        throw new MCP_ToolError(
          `admin scope required: ${(Body as any).error ?? 'forbidden'}`
        )
      }
      case (! Response.ok): {
        throw new MCP_ToolError(
          `server returned ${Response.status}: ${(Body as any).error ?? 'unknown error'}`
        )
      }
    }

    const Token = (Body as any).token as string | undefined
    if (Token == null) {
      throw new MCP_ToolError('server response did not contain a token')
    }

    return { Token, Sub, Scope, Exp }
  },

}
