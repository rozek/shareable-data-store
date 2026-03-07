import { SNS_ConnectionOptions } from '@rozek/sns-core';
import { SNS_ConnectionState } from '@rozek/sns-core';
import { SNS_LocalPresenceState } from '@rozek/sns-core';
import { SNS_NetworkProvider } from '@rozek/sns-core';
import { SNS_NoteStore } from '@rozek/sns-core';
import { SNS_PersistenceProvider } from '@rozek/sns-core';
import { SNS_PresenceProvider } from '@rozek/sns-core';
import { SNS_RemotePresenceState } from '@rozek/sns-core';

export declare class SNS_SyncEngine {
    #private;
    readonly PeerId: string;
    constructor(Store: SNS_NoteStore, Options?: SNS_SyncEngineOptions);
    /**** start ****/
    start(): Promise<void>;
    /**** stop ****/
    stop(): Promise<void>;
    /**** connectTo ****/
    connectTo(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
    /**** disconnect ****/
    disconnect(): void;
    /**** reconnect ****/
    reconnect(): Promise<void>;
    /**** ConnectionState ****/
    get ConnectionState(): SNS_ConnectionState;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SNS_ConnectionState) => void): () => void;
    /**** setPresenceTo ****/
    setPresenceTo(State: Omit<SNS_LocalPresenceState, never>): void;
    /**** PeerSet (remote peers only) ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
    /**** onPresenceChange ****/
    onPresenceChange(Callback: (PeerId: string, State: SNS_RemotePresenceState | undefined, Origin: 'local' | 'remote') => void): () => void;
}

export declare interface SNS_SyncEngineOptions {
    PersistenceProvider?: SNS_PersistenceProvider;
    NetworkProvider?: SNS_NetworkProvider;
    PresenceProvider?: SNS_PresenceProvider;
    BroadcastChannel?: boolean;
    PresenceTimeoutMs?: number;
}

export { }
