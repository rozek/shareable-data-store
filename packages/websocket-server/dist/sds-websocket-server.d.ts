import { BlankEnv } from 'hono/types';
import { BlankSchema } from 'hono/types';
import { Hono } from 'hono';

/**** createSDSServer — creates the Hono app with /ws, /signal and /api/token routes; returns { app, start } ****/
export declare function createSDSServer(Options?: Partial<SDS_ServerOptions>): {
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
    constructor(StoreId: string);
    /**** addClient ****/
    addClient(Client: LiveClient): void;
    /**** removeClient ****/
    removeClient(Client: LiveClient): void;
    /**** isEmpty ****/
    isEmpty(): boolean;
    /**** broadcast — relays Data to all clients except Sender ****/
    broadcast(Data: Uint8Array, Sender: LiveClient): void;
}

/**** rejectWriteFrame — returns true for message types that only write-scope clients may send ****/
export declare function rejectWriteFrame(MsgType: number): boolean;

export declare interface SDS_ServerOptions {
    JWTSecret: string;
    Issuer?: string;
    Port?: number;
    Host?: string;
}

declare type SendFn = (Data: Uint8Array) => void;

export { }
