/*******************************************************************************
*                                                                              *
*                               TokenCmd                                       *
*                                                                              *
*******************************************************************************/

// token issue — requests a new JWT from the server's POST /api/token endpoint;
// requires an admin token (SDS_ADMIN_TOKEN or --admin-token)

import type { Command }    from 'commander'
import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printError } from '../Output.js'
import { SDS_CommandError } from '../StoreAccess.js'
import { ExitCodes }       from '../ExitCodes.js'

//----------------------------------------------------------------------------//
//                           registerTokenCommands                            //
//----------------------------------------------------------------------------//

/**** registerTokenCommands — attaches the `token` sub-tree to Program ****/

export function registerTokenCommands (Program:Command):void {
  const TokenCmd = Program.command('token')
    .description('manage authentication tokens (requires admin token)')

/**** token issue ****/

  TokenCmd.command('issue')
    .description('request a new JWT from the server')
    .requiredOption('--sub <subject>',  'user identifier (e.g. email address)')
    .requiredOption('--scope <scope>',  'token scope: read | write | admin')
    .option('--exp <duration>',         'expiry duration, e.g. 24h or 7d', '24h')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await issueToken(Config, Options)
    })
}

//----------------------------------------------------------------------------//
//                               issueToken                                   //
//----------------------------------------------------------------------------//

const ValidScopes = new Set([ 'read', 'write', 'admin' ])
const ExpPattern  = /^(\d+)(s|m|h|d)$/

/**** issueToken — POSTs to /api/token with the admin JWT ****/

async function issueToken (
  Config:SDSConfig,
  Options:{ sub:string; scope:string; exp:string }
):Promise<void> {
  const { ServerURL, AdminToken } = Config

  if (AdminToken == null) {
    throw new SDS_CommandError(
      'no admin token — set SDS_ADMIN_TOKEN or use --admin-token',
      ExitCodes.Unauthorized
    )
  }
  if (ServerURL == null) {
    throw new SDS_CommandError(
      'no server URL — set SDS_SERVER_URL or use --server',
      ExitCodes.UsageError
    )
  }
  if (! /^wss?:\/\//.test(ServerURL)) {
    throw new SDS_CommandError(
      `invalid server URL '${ServerURL}' — must start with 'ws://' or 'wss://'`,
      ExitCodes.UsageError
    )
  }
  if (! ValidScopes.has(Options.scope)) {
    throw new SDS_CommandError(
      `invalid scope '${Options.scope}' — must be read, write, or admin`,
      ExitCodes.UsageError
    )
  }
  if (! ExpPattern.test(Options.exp)) {
    throw new SDS_CommandError(
      `invalid expiry '${Options.exp}' — use a number followed by s, m, h, or d`,
      ExitCodes.UsageError
    )
  }

  // convert WebSocket scheme to HTTP for the REST call
  const HttpBase = ServerURL.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://')
  const URL = HttpBase.replace(/\/+$/, '') + '/api/token'
  let Response:Response
  try {
    Response = await fetch(URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${AdminToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ sub:Options.sub, scope:Options.scope, exp:Options.exp }),
    })
  } catch (Signal) {
    throw new SDS_CommandError(
      `HTTP request to '${URL}' failed: ${(Signal as Error).message}`,
      ExitCodes.NetworkError
    )
  }

  const Body = await Response.json().catch(() => ({}))

  switch (true) {
    case (Response.status === 401):
      throw new SDS_CommandError(
        `token rejected by server: ${(Body as any).error ?? 'unauthorized'}`,
        ExitCodes.Unauthorized
      )
    case (Response.status === 403):
      throw new SDS_CommandError(
        `admin scope required: ${(Body as any).error ?? 'forbidden'}`,
        ExitCodes.Forbidden
      )
    case (! Response.ok):
      throw new SDS_CommandError(
        `server returned ${Response.status}: ${(Body as any).error ?? 'unknown error'}`,
        ExitCodes.GeneralError
      )
  }

  const Token = (Body as any).token as string | undefined
  if (Token == null) {
    throw new SDS_CommandError(
      'server response did not contain a token',
      ExitCodes.GeneralError
    )
  }

  if (Config.Format === 'json') {
    printResult(Config, { token:Token, sub:Options.sub, scope:Options.scope, exp:Options.exp })
  } else {
    printResult(Config, Token)
  }
}
