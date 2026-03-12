/*******************************************************************************
*                                                                              *
*                               TrashTools                                     *
*                                                                              *
*******************************************************************************/
import { configFrom } from '../Config.js';
import { MCP_ToolError } from '../Errors.js';
import { loadContext, closeContext } from '../StoreAccess.js';
const DefaultTrashTTLms = 30 * 24 * 60 * 60 * 1000; // 30 days
//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//
export const TrashToolDefs = [
    /**** sds_trash_list ****/
    {
        name: 'sds_trash_list',
        description: 'list all entries currently in the trash',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                only: { type: 'string', enum: ['items', 'links'], description: 'restrict output to items or links only' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_trash_purge_all ****/
    {
        name: 'sds_trash_purge_all',
        description: 'permanently delete every entry in the trash',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_trash_purge_expired ****/
    {
        name: 'sds_trash_purge_expired',
        description: ('permanently delete trash entries older than TTLms milliseconds ' +
            '(default: 30 days)'),
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                TTLms: { type: 'integer', description: 'age threshold in ms — entries older than this are purged (default: 2592000000 = 30 days)' },
            },
            required: ['StoreId'],
        },
    },
];
export const TrashToolHandlers = {
    'sds_trash_list': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreTrashList(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_trash_purge_all': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreTrashPurgeAll(Context.Store);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_trash_purge_expired': async (Params) => {
        const Config = configFrom(Params);
        const TTLms = validateTTLms(Params);
        const Context = await loadContext(Config);
        try {
            return coreTrashPurgeExpired(Context.Store, TTLms);
        }
        finally {
            await closeContext(Context);
        }
    },
};
export const TrashBatchStepHandlers = {
    'sds_trash_list': async (Session, Params) => coreTrashList(Session.Store, Params),
    'sds_trash_purge_all': async (Session, _Params) => coreTrashPurgeAll(Session.Store),
    'sds_trash_purge_expired': async (Session, Params) => {
        const TTLms = validateTTLms(Params);
        return coreTrashPurgeExpired(Session.Store, TTLms);
    },
};
/**** coreTrashList ****/
function coreTrashList(Store, Params) {
    const RawOnly = Params['only']?.toLowerCase();
    if ((RawOnly != null) && (!['items', 'links'].includes(RawOnly))) {
        throw new MCP_ToolError(`'only' must be 'items' or 'links' — got '${Params['only']}'`);
    }
    const TrashItem = Store.TrashItem;
    const Entries = Store._innerEntriesOf(TrashItem.Id);
    return Entries
        .filter((Entry) => {
        if (RawOnly == null) {
            return true;
        }
        const Kind = Entry.isItem ? 'item' : 'link';
        return RawOnly === Kind + 's';
    })
        .map((Entry) => ({
        Id: Entry.Id,
        Kind: Entry.isItem ? 'item' : 'link',
        Label: Entry.Label,
    }));
}
/**** coreTrashPurgeAll ****/
function coreTrashPurgeAll(Store) {
    const TrashItem = Store.TrashItem;
    const Entries = [...Store._innerEntriesOf(TrashItem.Id)];
    let Count = 0;
    for (const Entry of Entries) {
        try {
            Entry.purge();
            Count++;
        }
        catch { /* skip any protected entry */ }
    }
    return { purged: Count };
}
/**** coreTrashPurgeExpired ****/
function coreTrashPurgeExpired(Store, TTLms) {
    const Count = Store.purgeExpiredTrashEntries(TTLms);
    return { purged: Count, TTLms };
}
//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//
/**** validateTTLms — validates and returns the TTLms parameter ****/
function validateTTLms(Params) {
    const Raw = Params['TTLms'] ?? DefaultTrashTTLms;
    if ((typeof Raw !== 'number') || (!Number.isInteger(Raw)) || (Raw <= 0)) {
        throw new MCP_ToolError(`'TTLms' must be a positive integer — got ${Raw}`);
    }
    return Raw;
}
//# sourceMappingURL=TrashTools.js.map