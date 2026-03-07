import { SNS_ConnectionOptions } from '@rozek/sns-core';
import { SNS_ConnectionState } from '@rozek/sns-core';
import { SNS_LocalPresenceState } from '@rozek/sns-core';
import { SNS_NetworkProvider } from '@rozek/sns-core';
import { SNS_PresenceProvider } from '@rozek/sns-core';
import { SNS_RemotePresenceState } from '@rozek/sns-core';

export declare class SNS_WebSocketProvider implements SNS_NetworkProvider, SNS_PresenceProvider {
    #private;
    readonly StoreID: string;
    /**** constructor ****/
    constructor(StoreId: string);
    /**** ConnectionState ****/
    get ConnectionState(): SNS_ConnectionState;
    /**** connect ****/
    connect(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
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
    onValue(Callback: (ValueHash: string, Value: Uint8Array) => void): () => void;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SNS_ConnectionState) => void): () => void;
    /**** sendLocalState ****/
    sendLocalState(State: SNS_LocalPresenceState): void;
    /**** onRemoteState ****/
    onRemoteState(Callback: (PeerId: string, State: SNS_RemotePresenceState | undefined) => void): () => void;
    /**** PeerSet ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
}

export { }
