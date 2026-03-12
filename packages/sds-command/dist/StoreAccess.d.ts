import { SDS_DataStore } from '@rozek/sds-core';
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node';
import { SDS_SyncEngine } from '@rozek/sds-sync-engine';
import { SDSConfig } from './Config.js';
/**** SDS_StoreFactory — pluggable backend factory injected by the CLI wrapper ****/
export interface SDS_StoreFactory {
    fromScratch(): SDS_DataStore;
    fromBinary(Data: Uint8Array): SDS_DataStore;
}
/**** setStoreFactory — called once by runCommand before any store operations ****/
export declare function setStoreFactory(f: SDS_StoreFactory): void;
/**** createStoreFromBinary — creates a temporary store using the injected factory ****/
export declare function createStoreFromBinary(Data: Uint8Array): SDS_DataStore;
/**** SDS_CommandError — carries a machine-readable exit code alongside the message ****/
export declare class SDS_CommandError extends Error {
    readonly ExitCode: number;
    constructor(Message: string, Code?: number);
}
export interface SDS_Context {
    Store: SDS_DataStore;
    Persistence: SDS_DesktopPersistenceProvider;
    Engine: SDS_SyncEngine;
}
/**** loadContext — opens the local store; creates it only when allowCreate is true ****/
export declare function loadContext(Config: SDSConfig, allowCreate?: boolean): Promise<SDS_Context>;
/**** closeContext — flushes any pending checkpoint and closes the database ****/
export declare function closeContext(Context: SDS_Context): Promise<void>;
export interface SyncResult {
    Connected: boolean;
    StoreId: string;
    ServerURL: string;
}
/**** runSync — one-shot: load → connect → exchange patches → save → close ****/
export declare function runSync(Config: SDSConfig, TimeoutMs?: number): Promise<SyncResult>;
/**** StoreExists — returns true when the SQLite DB file for StoreId is present ****/
export declare function StoreExists(Config: SDSConfig): Promise<boolean>;
/**** destroyStore — deletes the local SQLite DB file ****/
export declare function destroyStore(Config: SDSConfig): Promise<void>;
/**** resolveEntryId — maps well-known aliases to their canonical UUIDs ****/
export declare function resolveEntryId(IdOrAlias: string): string;
/**** parseIntOption — parses an integer CLI option; throws UsageError on NaN ****/
export declare function parseIntOption(Raw: string, FlagName: string): number;
/**** readFileSafely — wraps fs.readFile; maps ENOENT to SDS_CommandError(NotFound) ****/
export declare function readFileSafely(FilePath: string): Promise<Buffer>;
//# sourceMappingURL=StoreAccess.d.ts.map