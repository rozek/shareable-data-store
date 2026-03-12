/*******************************************************************************
*                                                                              *
*                                  SDSConfig                                   *
*                                                                              *
*******************************************************************************/
/**** SDS_ConfigError — thrown by resolveConfig for invalid global option values ****/
export declare class SDS_ConfigError extends Error {
    readonly ExitCode: number;
    constructor(message: string, exitCode?: number);
}
export interface SDSConfig {
    ServerURL?: string;
    PersistenceDir: string;
    StoreId?: string;
    Token?: string;
    AdminToken?: string;
    Format: 'text' | 'json';
    OnError: 'stop' | 'continue' | 'ask';
}
/**** resolveConfig — merges env vars and commander option object into SDSConfig ****/
export declare function resolveConfig(Options: Record<string, unknown>): SDSConfig;
/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/
export declare function DBPathFor(Config: SDSConfig, StoreId: string): string;
//# sourceMappingURL=Config.d.ts.map