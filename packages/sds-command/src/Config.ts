/*******************************************************************************
*                                                                              *
*                                  SDSConfig                                   *
*                                                                              *
*******************************************************************************/

// resolves CLI options and environment variables into a single configuration
// object; options take precedence over env vars

import os   from 'node:os'
import path from 'node:path'

import { ExitCodes } from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                                 SDSConfig                                  //
//----------------------------------------------------------------------------//

/**** SDS_ConfigError — thrown by resolveConfig for invalid global option values ****/

export class SDS_ConfigError extends Error {
  readonly ExitCode:number
  constructor (message:string, exitCode:number = ExitCodes.UsageError) {
    super(message)
    this.ExitCode = exitCode
  }
}

export interface SDSConfig {
  ServerURL?:  string                       // WebSocket server base URL
  PersistenceDir:     string                       // directory for local SQLite databases
  StoreId?:    string                       // store identifier (= DB file basename)
  Token?:      string                       // client JWT (scope read or write)
  AdminToken?: string                       // admin JWT (scope admin)
  Format:      'text' | 'json'             // output format
  OnError:     'stop' | 'continue' | 'ask' // error handling in batch/REPL mode
}

/**** resolveConfig — merges env vars and commander option object into SDSConfig ****/

export function resolveConfig (Options:Record<string,unknown>):SDSConfig {
  const ServerURL  = (Options['server']     ?? process.env['SDS_SERVER_URL'])  as string | undefined
  const PersistenceDir    = (Options['persistenceDir']    ?? process.env['SDS_PERSISTENCE_DIR']
                   ?? path.join(os.homedir(), '.sds'))                          as string
  const StoreId    = (Options['store']      ?? process.env['SDS_STORE_ID'])    as string | undefined
  const Token      = (Options['token']      ?? process.env['SDS_TOKEN'])       as string | undefined
  const AdminToken = (Options['adminToken'] ?? process.env['SDS_ADMIN_TOKEN']) as string | undefined

  const rawFormat  = ((Options['format']   ?? 'text') as string).toLowerCase()
  if ((rawFormat !== 'text') && (rawFormat !== 'json')) {
    throw new SDS_ConfigError(
      `'--format' accepts 'text' or 'json' — got '${Options['format']}'`,
      ExitCodes.UsageError
    )
  }
  const Format = rawFormat as 'text' | 'json'

  const rawOnError = ((Options['onError']  ?? 'stop') as string).toLowerCase()
  if ((rawOnError !== 'stop') && (rawOnError !== 'continue') && (rawOnError !== 'ask')) {
    throw new SDS_ConfigError(
      `'--on-error' accepts 'stop', 'continue', or 'ask' — got '${Options['onError']}'`,
      ExitCodes.UsageError
    )
  }
  const OnError = rawOnError as 'stop' | 'continue' | 'ask'

  return { ServerURL, PersistenceDir, StoreId, Token, AdminToken, Format, OnError }
}

/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/

export function DBPathFor (Config:SDSConfig, StoreId:string):string {
  const SafeId = StoreId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(Config.PersistenceDir, `${SafeId}.db`)
}
