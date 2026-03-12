/*******************************************************************************
*                                                                              *
*                                MCPConfig                                     *
*                                                                              *
*******************************************************************************/

// resolves tool parameters and environment variables into a single config
// object used by all tool handlers; parameters take precedence over env vars

import os   from 'node:os'
import path from 'node:path'

//----------------------------------------------------------------------------//
//                                 MCPConfig                                  //
//----------------------------------------------------------------------------//

export interface MCPConfig {
  StoreId?:    string   // store identifier (= SQLite file basename)
  PersistenceDir:     string   // directory for local SQLite databases
  ServerURL?:  string   // WebSocket server base URL
  Token?:      string   // client JWT (scope read or write)
  AdminToken?: string   // admin JWT (scope admin)
}

//----------------------------------------------------------------------------//
//                           server-level defaults                            //
//----------------------------------------------------------------------------//

// populated once at startup from CLI args (sds-mcp-server.ts → setServerDefaults)
let ServerDefaults:Partial<MCPConfig> = {}

/**** setServerDefaults — called once by the server entry point with parsed CLI args ****/

export function setServerDefaults (Defaults:Partial<MCPConfig>):void {
  ServerDefaults = Defaults
}

//----------------------------------------------------------------------------//
//                              config resolution                             //
//----------------------------------------------------------------------------//

/**** configFrom — builds MCPConfig with precedence: tool params > CLI defaults > env vars ****/

export function configFrom (Params:Record<string,unknown>):MCPConfig {
  return {
    StoreId:    (Params['StoreId']    ?? ServerDefaults.StoreId    ?? process.env['SDS_STORE_ID'])    as string | undefined,
    PersistenceDir:    resolvePersistenceDir(Params['PersistenceDir'] as string | undefined),
    ServerURL:  (Params['ServerURL']  ?? ServerDefaults.ServerURL  ?? process.env['SDS_SERVER_URL'])  as string | undefined,
    Token:      (Params['Token']      ?? ServerDefaults.Token      ?? process.env['SDS_TOKEN'])       as string | undefined,
    AdminToken: (Params['AdminToken'] ?? ServerDefaults.AdminToken ?? process.env['SDS_ADMIN_TOKEN']) as string | undefined,
  }
}

/**** resolvePersistenceDir — returns the effective data directory ****/

export function resolvePersistenceDir (PersistenceDir?:string):string {
  return PersistenceDir ?? ServerDefaults.PersistenceDir ?? process.env['SDS_PERSISTENCE_DIR'] ?? path.join(os.homedir(), '.sds')
}

/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/

export function DBPathFor (Config:MCPConfig, StoreId:string):string {
  const SafeId = StoreId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(Config.PersistenceDir, `${SafeId}.db`)
}
