/*******************************************************************************
*                                                                              *
*                                MCPConfig                                     *
*                                                                              *
*******************************************************************************/
export interface MCPConfig {
    StoreId?: string;
    PersistenceDir: string;
    ServerURL?: string;
    Token?: string;
    AdminToken?: string;
}
/**** setServerDefaults — called once by the server entry point with parsed CLI args ****/
export declare function setServerDefaults(Defaults: Partial<MCPConfig>): void;
/**** configFrom — builds MCPConfig with precedence: tool params > CLI defaults > env vars ****/
export declare function configFrom(Params: Record<string, unknown>): MCPConfig;
/**** resolvePersistenceDir — returns the effective data directory ****/
export declare function resolvePersistenceDir(PersistenceDir?: string): string;
/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/
export declare function DBPathFor(Config: MCPConfig, StoreId: string): string;
//# sourceMappingURL=Config.d.ts.map