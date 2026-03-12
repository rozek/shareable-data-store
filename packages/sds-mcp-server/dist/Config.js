/*******************************************************************************
*                                                                              *
*                                MCPConfig                                     *
*                                                                              *
*******************************************************************************/
// resolves tool parameters and environment variables into a single config
// object used by all tool handlers; parameters take precedence over env vars
import os from 'node:os';
import path from 'node:path';
//----------------------------------------------------------------------------//
//                           server-level defaults                            //
//----------------------------------------------------------------------------//
// populated once at startup from CLI args (sds-mcp-server.ts → setServerDefaults)
let ServerDefaults = {};
/**** setServerDefaults — called once by the server entry point with parsed CLI args ****/
export function setServerDefaults(Defaults) {
    ServerDefaults = Defaults;
}
//----------------------------------------------------------------------------//
//                              config resolution                             //
//----------------------------------------------------------------------------//
/**** configFrom — builds MCPConfig with precedence: tool params > CLI defaults > env vars ****/
export function configFrom(Params) {
    return {
        StoreId: (Params['StoreId'] ?? ServerDefaults.StoreId ?? process.env['SDS_STORE_ID']),
        PersistenceDir: resolvePersistenceDir(Params['PersistenceDir']),
        ServerURL: (Params['ServerURL'] ?? ServerDefaults.ServerURL ?? process.env['SDS_SERVER_URL']),
        Token: (Params['Token'] ?? ServerDefaults.Token ?? process.env['SDS_TOKEN']),
        AdminToken: (Params['AdminToken'] ?? ServerDefaults.AdminToken ?? process.env['SDS_ADMIN_TOKEN']),
    };
}
/**** resolvePersistenceDir — returns the effective data directory ****/
export function resolvePersistenceDir(PersistenceDir) {
    return PersistenceDir ?? ServerDefaults.PersistenceDir ?? process.env['SDS_PERSISTENCE_DIR'] ?? path.join(os.homedir(), '.sds');
}
/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/
export function DBPathFor(Config, StoreId) {
    const SafeId = StoreId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(Config.PersistenceDir, `${SafeId}.db`);
}
//# sourceMappingURL=Config.js.map