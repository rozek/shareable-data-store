/*******************************************************************************
*                                                                              *
*                               StoreAccess                                    *
*                                                                              *
*******************************************************************************/
import type { SDS_DataStore } from '@rozek/sds-core';
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node';
import { SDS_SyncEngine } from '@rozek/sds-sync-engine';
import type { MCPConfig } from './Config.js';
/**** SDS_StoreFactory — pluggable backend factory injected by the server wrapper ****/
export interface SDS_StoreFactory {
    fromScratch(): SDS_DataStore;
    fromBinary(Data: Uint8Array): SDS_DataStore;
}
/**** setStoreFactory — called once by runMCPServer before any store operations ****/
export declare function setStoreFactory(f: SDS_StoreFactory): void;
/**** createStoreFromBinary — creates a temporary store using the injected factory ****/
export declare function createStoreFromBinary(Data: Uint8Array): SDS_DataStore;
export interface StoreContext {
    Store: SDS_DataStore;
    Persistence: SDS_DesktopPersistenceProvider;
    Engine: SDS_SyncEngine;
}
/**** loadContext — opens the local store; creates it only when allowCreate is true ****/
export declare function loadContext(Config: MCPConfig, allowCreate?: boolean): Promise<StoreContext>;
/**** closeContext — flushes any pending checkpoint and closes the database ****/
export declare function closeContext(Context: StoreContext): Promise<void>;
/**** BatchSession — manages a shared store context for batch tool execution ****/
export declare class BatchSession {
    #private;
    constructor(Store: SDS_DataStore, Persistence: SDS_DesktopPersistenceProvider, Engine: SDS_SyncEngine, StoreId: string, PersistenceDir: string);
    get Store(): SDS_DataStore;
    get Persistence(): SDS_DesktopPersistenceProvider;
    get StoreId(): string;
    get PersistenceDir(): string;
    /**** syncWith — flushes, syncs with server, then reloads the store ****/
    syncWith(ServerURL: string, Token: string, TimeoutMs?: number): Promise<void>;
    /**** close — flushes and closes the batch session ****/
    close(): Promise<void>;
}
/**** openBatchSession — opens a store and wraps it in a BatchSession ****/
export declare function openBatchSession(Config: MCPConfig, allowCreate?: boolean): Promise<BatchSession>;
export interface SyncResult {
    Connected: boolean;
    StoreId: string;
    ServerURL: string;
}
/**** runSync — one-shot: load → connect → exchange patches → save → close ****/
export declare function runSync(Config: MCPConfig, TimeoutMs?: number): Promise<SyncResult>;
/**** StoreExists — returns true when the SQLite DB file for StoreId is present ****/
export declare function StoreExists(Config: MCPConfig): Promise<boolean>;
/**** destroyStore — deletes the local SQLite DB file and its companions ****/
export declare function destroyStore(Config: MCPConfig): Promise<void>;
/**** resolveEntryId — maps well-known aliases to their canonical UUIDs ****/
export declare function resolveEntryId(IdOrAlias: string): string;
/**** readFileSafely — wraps fs.readFile; maps ENOENT to MCP_ToolError ****/
export declare function readFileSafely(FilePath: string): Promise<Buffer>;
/**** countEntries — recursive count of all non-system items in the tree ****/
export declare function countEntries(Store: SDS_DataStore): number;
//# sourceMappingURL=StoreAccess.d.ts.map