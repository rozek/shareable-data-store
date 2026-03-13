import { SDS_DataStore } from '@rozek/sds-core';

/**** runMCPServer — called by backend-specific wrapper packages ****/
export declare function runMCPServer(StoreFactory: SDS_StoreFactory, ServerName?: string, Version?: string): Promise<void>;

/**** SDS_StoreFactory — pluggable backend factory injected by the server wrapper ****/
export declare interface SDS_StoreFactory {
    fromScratch(): SDS_DataStore;
    fromBinary(Data: Uint8Array): SDS_DataStore;
}

export { }
