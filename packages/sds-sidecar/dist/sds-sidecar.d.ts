import { SDS_DataStore } from '@rozek/sds-core';

/**** runSidecar — wires up sync engine, webhook manager, and signal handlers ****/
export declare function runSidecar(Factory: SDS_StoreFactory, CommandName?: string): Promise<void>;

/**** SDS_StoreFactory — pluggable interface for backend-specific store creation ****/
export declare interface SDS_StoreFactory {
    fromScratch(): SDS_DataStore;
    fromBinary(Data: Uint8Array): SDS_DataStore;
}

export { }
