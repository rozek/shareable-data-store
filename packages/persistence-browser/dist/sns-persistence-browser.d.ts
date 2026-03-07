import { SNS_PatchSeqNumber } from '@rozek/sns-core';
import { SNS_PersistenceProvider } from '@rozek/sns-core';

export declare class SNS_BrowserPersistenceProvider implements SNS_PersistenceProvider {
    #private;
    /**** constructor ****/
    constructor(StoreId: string);
    /**** loadSnapshot ****/
    loadSnapshot(): Promise<Uint8Array | null>;
    /**** saveSnapshot ****/
    saveSnapshot(Data: Uint8Array): Promise<void>;
    /**** loadPatchesSince ****/
    loadPatchesSince(SeqNumber: SNS_PatchSeqNumber): Promise<Uint8Array[]>;
    /**** appendPatch ****/
    appendPatch(Patch: Uint8Array, SeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** prunePatches ****/
    prunePatches(beforeSeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** loadValue ****/
    loadValue(ValueHash: string): Promise<Uint8Array | null>;
    /**** saveValue ****/
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    /**** releaseValue ****/
    releaseValue(ValueHash: string): Promise<void>;
    /**** close ****/
    close(): Promise<void>;
}

export { }
