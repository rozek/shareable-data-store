/*******************************************************************************
*                                                                              *
*                               StoreAccess                                    *
*                                                                              *
*******************************************************************************/
// loads the CRDT store from local SQLite persistence, manages the SyncEngine
// lifecycle, and provides a one-shot sync helper — adapted from sds-command
import fs from 'node:fs/promises';
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core';
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node';
import { SDS_SyncEngine } from '@rozek/sds-sync-engine';
import { SDS_WebSocketProvider } from '@rozek/sds-network-websocket';
import { DBPathFor } from './Config.js';
import { MCP_ToolError } from './Errors.js';
let Factory;
/**** setStoreFactory — called once by runMCPServer before any store operations ****/
export function setStoreFactory(f) {
    Factory = f;
}
/**** createStoreFromBinary — creates a temporary store using the injected factory ****/
export function createStoreFromBinary(Data) {
    return Factory.fromBinary(Data);
}
//----------------------------------------------------------------------------//
//                               loadContext                                  //
//----------------------------------------------------------------------------//
/**** loadContext — opens the local store; creates it only when allowCreate is true ****/
export async function loadContext(Config, allowCreate = false) {
    const StoreId = Config.StoreId;
    if (StoreId == null) {
        throw new MCP_ToolError('StoreId is required');
    }
    await fs.mkdir(Config.PersistenceDir, { recursive: true });
    const DbPath = DBPathFor(Config, StoreId);
    const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId);
    let Store;
    try {
        const Snapshot = await Persistence.loadSnapshot();
        switch (true) {
            case (Snapshot != null): {
                Store = Factory.fromBinary(Snapshot);
                break;
            }
            case (allowCreate): {
                Store = Factory.fromScratch();
                break;
            }
            default: {
                await Persistence.close();
                throw new MCP_ToolError(`store '${StoreId}' not found in '${Config.PersistenceDir}'`);
            }
        }
    }
    catch (Signal) {
        if (Signal instanceof MCP_ToolError) {
            throw Signal;
        }
        await Persistence.close().catch(() => { });
        throw new MCP_ToolError(`failed to open store '${StoreId}': ${Signal.message}`);
    }
    const SyncEngine = new SDS_SyncEngine(Store, { PersistenceProvider: Persistence });
    await SyncEngine.start();
    return { Store, Persistence, Engine: SyncEngine };
}
/**** closeContext — flushes any pending checkpoint and closes the database ****/
export async function closeContext(Context) {
    await Context.Engine.stop();
}
//----------------------------------------------------------------------------//
//                               BatchSession                                 //
//----------------------------------------------------------------------------//
/**** BatchSession — manages a shared store context for batch tool execution ****/
export class BatchSession {
    #store;
    #persistence;
    #engine;
    #storeId;
    #persistenceDir;
    constructor(Store, Persistence, Engine, StoreId, PersistenceDir) {
        this.#store = Store;
        this.#persistence = Persistence;
        this.#engine = Engine;
        this.#storeId = StoreId;
        this.#persistenceDir = PersistenceDir;
    }
    get Store() { return this.#store; }
    get Persistence() { return this.#persistence; }
    get StoreId() { return this.#storeId; }
    get PersistenceDir() { return this.#persistenceDir; }
    /**** syncWith — flushes, syncs with server, then reloads the store ****/
    async syncWith(ServerURL, Token, TimeoutMs = 5000) {
        const DbPath = DBPathFor({ PersistenceDir: this.#persistenceDir }, this.#storeId);
        // flush all pending changes to disk — stop() also closes the DB connection
        await this.#engine.stop();
        const SyncConfig = {
            StoreId: this.#storeId,
            PersistenceDir: this.#persistenceDir,
            ServerURL,
            Token,
        };
        // capture sync error so we can always restore the session to a working state
        let SyncError = null;
        try {
            await runSync(SyncConfig, TimeoutMs);
        }
        catch (innerSignal) {
            SyncError = innerSignal;
        }
        // reopen the DB (stop() closed it) and reload the store — whether sync
        // succeeded or failed, the session must remain in a usable state
        const FreshPersistence = new SDS_DesktopPersistenceProvider(DbPath, this.#storeId);
        this.#persistence = FreshPersistence;
        const Snapshot = await FreshPersistence.loadSnapshot();
        this.#store = Snapshot != null
            ? Factory.fromBinary(Snapshot)
            : Factory.fromScratch();
        this.#engine = new SDS_SyncEngine(this.#store, { PersistenceProvider: FreshPersistence });
        await this.#engine.start();
        // now propagate the sync error (session is back to a working state)
        if (SyncError != null) {
            throw SyncError;
        }
    }
    /**** close — flushes and closes the batch session ****/
    async close() {
        await this.#engine.stop();
    }
}
/**** openBatchSession — opens a store and wraps it in a BatchSession ****/
export async function openBatchSession(Config, allowCreate = false) {
    const Context = await loadContext(Config, allowCreate);
    return new BatchSession(Context.Store, Context.Persistence, Context.Engine, Config.StoreId, Config.PersistenceDir);
}
/**** runSync — one-shot: load → connect → exchange patches → save → close ****/
export async function runSync(Config, TimeoutMs = 5000) {
    const StoreId = Config.StoreId;
    const ServerURL = Config.ServerURL;
    const Token = Config.Token;
    if (StoreId == null) {
        throw new MCP_ToolError('StoreId is required');
    }
    if (ServerURL == null) {
        throw new MCP_ToolError('ServerURL is required');
    }
    if (!/^wss?:\/\//.test(ServerURL)) {
        throw new MCP_ToolError(`invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`);
    }
    if (Token == null) {
        throw new MCP_ToolError('Token is required');
    }
    await fs.mkdir(Config.PersistenceDir, { recursive: true });
    const DbPath = DBPathFor(Config, StoreId);
    const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId);
    const Snapshot = await Persistence.loadSnapshot();
    const Store = Snapshot != null
        ? Factory.fromBinary(Snapshot)
        : Factory.fromScratch();
    const Network = new SDS_WebSocketProvider(StoreId);
    const SyncEngine = new SDS_SyncEngine(Store, {
        PersistenceProvider: Persistence,
        NetworkProvider: Network,
    });
    await SyncEngine.start();
    let ConnectionEstablished = false;
    let Resolve;
    const CompletionPromise = new Promise((resolve) => { Resolve = resolve; });
    const detachConnectionObserver = SyncEngine.onConnectionChange((State) => {
        if (State === 'connected') {
            ConnectionEstablished = true;
            setTimeout(Resolve, TimeoutMs);
        }
        if (State === 'disconnected') {
            Resolve();
        }
    });
    const Guard = setTimeout(() => { Resolve(); }, TimeoutMs * 2);
    try {
        await SyncEngine.connectTo(ServerURL, { Token });
        const LocalPatches = await Persistence.loadPatchesSince(0);
        for (const Patch of LocalPatches) {
            Network.sendPatch(Patch);
        }
        await CompletionPromise;
    }
    catch (Signal) {
        throw new MCP_ToolError(`could not connect to '${ServerURL}': ${Signal.message}`);
    }
    finally {
        clearTimeout(Guard);
        detachConnectionObserver();
        await SyncEngine.stop();
    }
    return { Connected: ConnectionEstablished, StoreId, ServerURL };
}
//----------------------------------------------------------------------------//
//                               StoreExists                                  //
//----------------------------------------------------------------------------//
/**** StoreExists — returns true when the SQLite DB file for StoreId is present ****/
export async function StoreExists(Config) {
    const StoreId = Config.StoreId;
    if (StoreId == null) {
        return false;
    }
    const DbPath = DBPathFor(Config, StoreId);
    try {
        await fs.access(DbPath);
        return true;
    }
    catch {
        return false;
    }
}
/**** destroyStore — deletes the local SQLite DB file and its companions ****/
export async function destroyStore(Config) {
    const StoreId = Config.StoreId;
    if (StoreId == null) {
        throw new MCP_ToolError('StoreId is required');
    }
    const DbPath = DBPathFor(Config, StoreId);
    try {
        await fs.unlink(DbPath);
        await fs.unlink(DbPath + '-wal').catch(() => { });
        await fs.unlink(DbPath + '-shm').catch(() => { });
    }
    catch (Signal) {
        const FileSystemError = Signal;
        if (FileSystemError.code === 'ENOENT') {
            throw new MCP_ToolError(`store '${StoreId}' not found in '${Config.PersistenceDir}'`);
        }
        throw new MCP_ToolError(`failed to delete store '${StoreId}': ${FileSystemError.message}`);
    }
}
//----------------------------------------------------------------------------//
//                             resolveEntryId                                 //
//----------------------------------------------------------------------------//
/**** resolveEntryId — maps well-known aliases to their canonical UUIDs ****/
export function resolveEntryId(IdOrAlias) {
    switch (IdOrAlias.toLowerCase()) {
        case 'root': return RootId;
        case 'trash': return TrashId;
        case 'lost-and-found':
        case 'lostandfound': return LostAndFoundId;
        default: return IdOrAlias;
    }
}
//----------------------------------------------------------------------------//
//                             readFileSafely                                 //
//----------------------------------------------------------------------------//
/**** readFileSafely — wraps fs.readFile; maps ENOENT to MCP_ToolError ****/
export async function readFileSafely(FilePath) {
    try {
        return await fs.readFile(FilePath);
    }
    catch (Signal) {
        if (Signal.code === 'ENOENT') {
            throw new MCP_ToolError(`file '${FilePath}' not found`);
        }
        throw Signal;
    }
}
//----------------------------------------------------------------------------//
//                             countEntries                                   //
//----------------------------------------------------------------------------//
/**** countEntries — recursive count of all non-system items in the tree ****/
export function countEntries(Store) {
    const SystemIds = new Set([RootId, TrashId, LostAndFoundId]);
    let Count = 0;
    function traverseEntries(ItemId) {
        for (const Entry of Store._innerEntriesOf(ItemId)) {
            if (SystemIds.has(Entry.Id)) {
                continue;
            }
            Count++;
            if (Entry.isItem) {
                traverseEntries(Entry.Id);
            }
        }
    }
    traverseEntries(RootId);
    return Count;
}
//# sourceMappingURL=StoreAccess.js.map