import { SDS_ConnectionOptions } from '@rozek/sds-core';
import { SDS_ConnectionState } from '@rozek/sds-core';
import { SDS_LocalPresenceState } from '@rozek/sds-core';
import { SDS_NetworkProvider } from '@rozek/sds-core';
import { SDS_PresenceProvider } from '@rozek/sds-core';
import { SDS_RemotePresenceState } from '@rozek/sds-core';
import { SDS_WebSocketProvider } from '@rozek/sds-network-websocket';

export declare class SDS_WebRTCProvider implements SDS_NetworkProvider, SDS_PresenceProvider {
    #private;
    readonly StoreId: string;
    /**** Constructor ****/
    constructor(StoreId: string, Options?: SDS_WebRTCProviderOptions);
    /**** ConnectionState ****/
    get ConnectionState(): SDS_ConnectionState;
    /**** connect ****/
    connect(URL: string, Options: SDS_ConnectionOptions): Promise<void>;
    /**** disconnect ****/
    disconnect(): void;
    /**** sendPatch ****/
    sendPatch(Patch: Uint8Array): void;
    /**** sendValue ****/
    sendValue(ValueHash: string, Data: Uint8Array): void;
    /**** requestValue ****/
    requestValue(ValueHash: string): void;
    /**** onPatch ****/
    onPatch(Callback: (Patch: Uint8Array) => void): () => void;
    /**** onValue ****/
    onValue(Callback: (Hash: string, Data: Uint8Array) => void): () => void;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SDS_ConnectionState) => void): () => void;
    /**** sendSyncRequest ****/
    sendSyncRequest(Cursor: Uint8Array): void;
    /**** onSyncRequest ****/
    onSyncRequest(Callback: (Cursor: Uint8Array) => void): () => void;
    /**** sendLocalState ****/
    sendLocalState(State: SDS_LocalPresenceState): void;
    /**** onRemoteState ****/
    onRemoteState(Callback: (PeerId: string, State: SDS_RemotePresenceState | undefined) => void): () => void;
    /**** PeerSet ****/
    get PeerSet(): ReadonlyMap<string, SDS_RemotePresenceState>;
}

export declare interface SDS_WebRTCProviderOptions {
    ICEServers?: RTCIceServer[];
    Fallback?: SDS_WebSocketProvider;
}

export { }
