import { BlankEnv } from 'hono/types';
import { BlankSchema } from 'hono/types';
import { Hono } from 'hono';
import { SNS_DesktopPersistenceProvider } from '@rozek/sns-persistence-node';

/**** createSNSServer — creates the Hono app with /ws, /signal and /api/token routes; returns { app, start } ****/
export declare function createSNSServer(Options?: Partial<SNS_ServerOptions>): {
    app: Hono<BlankEnv, BlankSchema, "/">;
    start: () => void;
};

export declare interface LiveClient {
    send: SendFn;
    scope: 'read' | 'write' | 'admin';
}

export declare class LiveStore {
    #private;
    readonly StoreId: string;
    constructor(StoreId: string, Persistence?: SNS_DesktopPersistenceProvider);
    /**** addClient ****/
    addClient(Client: LiveClient): void;
    /**** removeClient ****/
    removeClient(Client: LiveClient): void;
    /**** isEmpty ****/
    isEmpty(): boolean;
    /**** hasPersistence ****/
    hasPersistence(): boolean;
    /**** broadcast — sends Data to all clients in this store except Sender ****/
    broadcast(Data: Uint8Array, Sender: LiveClient): void;
    /**** replayTo — sends stored snapshot and patches to a newly connected client ****/
    replayTo(Client: LiveClient): Promise<void>;
    /**** persistPatch — stores a patch payload (bytes after the 0x01 type byte) ****/
    persistPatch(Payload: Uint8Array): void;
    /**** persistValue — stores a value payload (hash + data, bytes after 0x02);
     prunes all accumulated patches since the value is a full state ****/
    persistValue(Payload: Uint8Array): void;
    /**** handleChunk — accumulates VALUE_CHUNK frames; persists the assembled
     value when all chunks have arrived ****/
    handleChunk(Frame: Uint8Array): void;
    /**** close — closes the underlying SQLite connection ****/
    close(): Promise<void>;
}

/**** rejectWriteFrame — returns true for message types that only write-scope clients may send ****/
export declare function rejectWriteFrame(MsgType: number): boolean;

declare type SendFn = (Data: Uint8Array) => void;

export declare interface SNS_ServerOptions {
    JWTSecret: string;
    Issuer?: string;
    Port?: number;
    Host?: string;
    PersistDir?: string;
}

export { }
