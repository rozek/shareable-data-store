/*******************************************************************************
*                                                                              *
*                               StoreTools                                     *
*                                                                              *
*******************************************************************************/
// MCP tool definitions and handlers for store lifecycle operations:
// sds_store_info, sds_store_ping, sds_store_sync, sds_store_destroy,
// sds_store_export, sds_store_import
import fs from 'node:fs/promises';
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core';
import { configFrom, DBPathFor } from '../Config.js';
import { MCP_ToolError } from '../Errors.js';
import { loadContext, closeContext, runSync, StoreExists, destroyStore, readFileSafely, countEntries, createStoreFromBinary, } from '../StoreAccess.js';
//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//
export const StoreToolDefs = [
    /**** sds_store_info ****/
    {
        name: 'sds_store_info',
        description: 'show existence, entry count, and DB path of a local store',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_store_ping ****/
    {
        name: 'sds_store_ping',
        description: 'check connectivity to the WebSocket server',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                ServerURL: { type: 'string', description: 'WebSocket server base URL' },
                Token: { type: 'string', description: 'client JWT with read or write scope' },
            },
            required: ['StoreId', 'ServerURL', 'Token'],
        },
    },
    /**** sds_store_sync ****/
    {
        name: 'sds_store_sync',
        description: 'connect to the server, exchange CRDT patches, and disconnect',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                ServerURL: { type: 'string', description: 'WebSocket server base URL' },
                Token: { type: 'string', description: 'client JWT with read or write scope' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                TimeoutMs: { type: 'integer', description: 'max wait in ms after connecting (default: 5000)' },
            },
            required: ['StoreId', 'ServerURL', 'Token'],
        },
    },
    /**** sds_store_destroy ****/
    {
        name: 'sds_store_destroy',
        description: 'permanently delete the local SQLite store file and its WAL/SHM companions',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_store_export ****/
    {
        name: 'sds_store_export',
        description: ('export the current store snapshot; binary without OutputFile returns inline DataBase64'),
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Encoding: { type: 'string', enum: ['json', 'binary'], description: 'serialisation format (default: json)' },
                OutputFile: { type: 'string', description: 'destination file path; omit to return data in response' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_store_import ****/
    {
        name: 'sds_store_import',
        description: 'CRDT-merge a snapshot (JSON or binary) into the local store',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                InputFile: { type: 'string', description: 'source file path — mutually exclusive with InputBase64' },
                InputBase64: { type: 'string', description: 'base64-encoded snapshot — mutually exclusive with InputFile' },
                InputEncoding: { type: 'string', enum: ['json', 'binary'], description: 'encoding of InputBase64 — required when InputBase64 is used' },
            },
            required: ['StoreId'],
        },
    },
];
export const StoreToolHandlers = {
    'sds_store_info': async (Params) => toolStoreInfo(configFrom(Params)),
    'sds_store_ping': async (Params) => toolStorePing(configFrom(Params)),
    'sds_store_sync': async (Params) => {
        const Config = configFrom(Params);
        const TimeoutMs = Params['TimeoutMs'] ?? 5000;
        if ((typeof TimeoutMs !== 'number') || (TimeoutMs <= 0) || (!Number.isInteger(TimeoutMs))) {
            throw new MCP_ToolError(`'TimeoutMs' must be a positive integer — got ${TimeoutMs}`);
        }
        return toolStoreSync(Config, TimeoutMs);
    },
    'sds_store_destroy': async (Params) => toolStoreDestroy(configFrom(Params)),
    'sds_store_export': async (Params) => {
        const Config = configFrom(Params);
        const Encoding = (Params['Encoding'] ?? 'json').toLowerCase();
        const OutputFile = Params['OutputFile'];
        if ((Encoding !== 'json') && (Encoding !== 'binary')) {
            throw new MCP_ToolError(`'Encoding' must be 'json' or 'binary' — got '${Params['Encoding']}'`);
        }
        return toolStoreExport(Config, Encoding, OutputFile);
    },
    'sds_store_import': async (Params) => {
        const Config = configFrom(Params);
        validateImportParams(Params);
        return toolStoreImport(Config, Params['InputFile'], Params['InputBase64'], (Params['InputEncoding'] ?? 'json').toLowerCase());
    },
};
export const StoreBatchStepHandlers = {
    'sds_store_info': async (Session, _Params) => {
        return {
            StoreId: Session.StoreId,
            exists: true,
            EntryCount: countEntries(Session.Store),
            DBPath: DBPathFor({ PersistenceDir: Session.PersistenceDir }, Session.StoreId),
        };
    },
    'sds_store_sync': async (Session, Params) => {
        const ServerURL = Params['ServerURL'];
        const Token = Params['Token'];
        const TimeoutMs = Params['TimeoutMs'] ?? 5000;
        if (ServerURL == null) {
            throw new MCP_ToolError('ServerURL is required');
        }
        if (Token == null) {
            throw new MCP_ToolError('Token is required');
        }
        if (!/^wss?:\/\//.test(ServerURL)) {
            throw new MCP_ToolError(`invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`);
        }
        if ((typeof TimeoutMs !== 'number') || (TimeoutMs <= 0) || (!Number.isInteger(TimeoutMs))) {
            throw new MCP_ToolError(`'TimeoutMs' must be a positive integer — got ${TimeoutMs}`);
        }
        await Session.syncWith(ServerURL, Token, TimeoutMs);
        return { StoreId: Session.StoreId, Server: ServerURL, synced: true };
    },
    'sds_store_export': async (Session, Params) => {
        const Encoding = (Params['Encoding'] ?? 'json').toLowerCase();
        const OutputFile = Params['OutputFile'];
        if ((Encoding !== 'json') && (Encoding !== 'binary')) {
            throw new MCP_ToolError(`'Encoding' must be 'json' or 'binary' — got '${Params['Encoding']}'`);
        }
        return coreStoreExport(Session.Store, Encoding, OutputFile);
    },
    'sds_store_import': async (Session, Params) => {
        validateImportParams(Params);
        return coreStoreImport(Session.Store, Params['InputFile'], Params['InputBase64'], (Params['InputEncoding'] ?? 'json').toLowerCase());
    },
};
//----------------------------------------------------------------------------//
//                           core implementations                             //
//----------------------------------------------------------------------------//
/**** toolStoreInfo ****/
async function toolStoreInfo(Config) {
    const StoreId = Config.StoreId;
    if (StoreId == null) {
        throw new MCP_ToolError('StoreId is required');
    }
    const Exists = await StoreExists(Config);
    if (!Exists) {
        return { StoreId, exists: false };
    }
    const Context = await loadContext(Config);
    try {
        return {
            StoreId,
            exists: true,
            EntryCount: countEntries(Context.Store),
            DBPath: DBPathFor(Config, StoreId),
        };
    }
    finally {
        await closeContext(Context);
    }
}
/**** toolStorePing ****/
async function toolStorePing(Config) {
    const { ServerURL, Token } = Config;
    if (ServerURL == null) {
        throw new MCP_ToolError('ServerURL is required');
    }
    if (Token == null) {
        throw new MCP_ToolError('Token is required');
    }
    if (!/^wss?:\/\//.test(ServerURL)) {
        throw new MCP_ToolError(`invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`);
    }
    try {
        const Result = await runSync(Config, 1000);
        return { Server: Result.ServerURL, StoreId: Result.StoreId, reachable: true };
    }
    catch (Signal) {
        const message = Signal instanceof Error ? Signal.message : String(Signal);
        return { Server: ServerURL, reachable: false, Error: message };
    }
}
/**** toolStoreSync ****/
async function toolStoreSync(Config, TimeoutMs) {
    const Result = await runSync(Config, TimeoutMs);
    return { StoreId: Result.StoreId, Server: Result.ServerURL, synced: Result.Connected };
}
/**** toolStoreDestroy ****/
async function toolStoreDestroy(Config) {
    const StoreId = Config.StoreId;
    if (StoreId == null) {
        throw new MCP_ToolError('StoreId is required');
    }
    await destroyStore(Config);
    return { StoreId, destroyed: true };
}
/**** toolStoreExport ****/
async function toolStoreExport(Config, Encoding, OutputFile) {
    const Context = await loadContext(Config);
    try {
        return await coreStoreExport(Context.Store, Encoding, OutputFile);
    }
    finally {
        await closeContext(Context);
    }
}
/**** coreStoreExport — shared by standalone and batch handlers ****/
async function coreStoreExport(Store, Encoding, OutputFile) {
    const isBinary = Encoding === 'binary';
    const Data = isBinary
        ? Store.asBinary()
        : JSON.stringify(Store.asJSON(), null, 2);
    if (OutputFile != null) {
        try {
            await fs.writeFile(OutputFile, isBinary ? Data : Data + '\n');
        }
        catch (Signal) {
            throw new MCP_ToolError(`failed to write export to '${OutputFile}': ${Signal.message}`);
        }
        return { exported: true, Format: Encoding, File: OutputFile };
    }
    if (isBinary) {
        const DataBase64 = Buffer.from(Data).toString('base64');
        return { exported: true, Format: 'binary', DataBase64 };
    }
    return { exported: true, Format: 'json', Data };
}
/**** toolStoreImport ****/
async function toolStoreImport(Config, InputFile, InputBase64, InputEncoding) {
    const Context = await loadContext(Config, true);
    try {
        return await coreStoreImport(Context.Store, InputFile, InputBase64, InputEncoding);
    }
    finally {
        await closeContext(Context);
    }
}
/**** coreStoreImport — shared by standalone and batch handlers ****/
async function coreStoreImport(Store, InputFile, InputBase64, InputEncoding) {
    let RawData;
    let Source;
    if (InputFile != null) {
        RawData = await readFileSafely(InputFile);
        Source = InputFile;
    }
    else {
        // InputBase64 is guaranteed non-null by validateImportParams
        RawData = Buffer.from(InputBase64, 'base64');
        Source = 'base64';
    }
    const isJSON = InputEncoding === 'json';
    if (isJSON) {
        const Text = RawData.toString('utf8').trimStart();
        let Parsed;
        try {
            Parsed = JSON.parse(Text);
        }
        catch {
            throw new MCP_ToolError(InputFile != null
                ? `'${InputFile}' does not contain valid JSON`
                : 'InputBase64 does not contain valid JSON');
        }
        mergeEntriesFromJSON(Store, Parsed);
    }
    else {
        let TmpStore;
        try {
            TmpStore = createStoreFromBinary(new Uint8Array(RawData));
        }
        catch {
            throw new MCP_ToolError(InputFile != null
                ? `'${InputFile}' does not contain valid binary SDS data`
                : 'InputBase64 does not contain valid binary SDS data');
        }
        try {
            mergeEntriesFromJSON(Store, TmpStore.asJSON());
        }
        finally {
            TmpStore.dispose();
        }
    }
    return InputFile != null
        ? { imported: true, File: Source }
        : { imported: true, Source };
}
/**** validateImportParams — checks mutual exclusion of InputFile / InputBase64 ****/
function validateImportParams(Params) {
    const hasFile = Params['InputFile'] != null;
    const hasBase64 = Params['InputBase64'] != null;
    if (!hasFile && !hasBase64) {
        throw new MCP_ToolError('either InputFile or InputBase64 is required');
    }
    if (hasFile && hasBase64) {
        throw new MCP_ToolError('InputFile and InputBase64 are mutually exclusive');
    }
    if (hasBase64 && (Params['InputEncoding'] == null)) {
        throw new MCP_ToolError('InputEncoding is required when InputBase64 is used');
    }
}
/**** mergeEntriesFromJSON — copies non-system inner entries into the store ****/
function mergeEntriesFromJSON(Store, RootJSON) {
    const SystemIds = new Set([RootId, TrashId, LostAndFoundId]);
    const Root = RootJSON;
    const InnerEntries = Root['innerEntries'];
    if (InnerEntries == null) {
        return;
    }
    for (const Entry of InnerEntries) {
        if (!SystemIds.has(Entry['Id'])) {
            Store.newEntryFromJSONat(Entry, Store.RootItem);
        }
    }
}
//# sourceMappingURL=StoreTools.js.map