/*******************************************************************************
*                                                                              *
*                               EntryTools                                     *
*                                                                              *
*******************************************************************************/
import { TrashId, LostAndFoundId } from '@rozek/sds-core';
import { configFrom } from '../Config.js';
import { MCP_ToolError } from '../Errors.js';
import { loadContext, closeContext, resolveEntryId, readFileSafely, } from '../StoreAccess.js';
//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//
export const EntryToolDefs = [
    /**** sds_entry_create ****/
    {
        name: 'sds_entry_create',
        description: ('create a new item (default) or link (with Target); ' +
            'auto-creates the store when creating items'),
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Target: { type: 'string', description: 'UUID of the item to link to — creates a link instead of an item' },
                Container: { type: 'string', description: 'UUID of the outer container item, or "root" / "lost-and-found" (default: root)' },
                at: { type: 'integer', description: 'insertion index, 0-based (default: append)' },
                Label: { type: 'string', description: 'initial display label' },
                MIMEType: { type: 'string', description: 'MIME type of the item value (items only; default: text/plain)' },
                Value: { type: 'string', description: 'initial plain-text value (items only)' },
                ValueBase64: { type: 'string', description: 'initial binary value as base64 (items only)' },
                File: { type: 'string', description: 'file path to read initial value from (items only)' },
                Info: { type: 'object', description: 'initial info map as an object of key-value pairs' },
                InfoDelete: { type: 'array', items: { type: 'string' }, description: 'info keys to remove (no-op for new entries, but accepted for consistency with sds_entry_update)' },
            },
            required: ['StoreId'],
        },
    },
    /**** sds_entry_get ****/
    {
        name: 'sds_entry_get',
        description: 'read fields of a single entry; returns all available fields when Fields is omitted',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the entry, or "root" / "trash" / "lost-and-found"' },
                Fields: { type: 'array', items: { type: 'string' }, description: 'fields to include — subset of Kind, Label, MIMEType, Value, Info, Target' },
                InfoKeys: { type: 'array', items: { type: 'string' }, description: 'return only these named keys from the info map' },
            },
            required: ['StoreId', 'Id'],
        },
    },
    /**** sds_entry_list ****/
    {
        name: 'sds_entry_list',
        description: 'list the direct inner entries (or all nested entries) of a container item',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the container item, or "root" / "trash" / "lost-and-found"' },
                recursive: { type: 'boolean', description: 'walk all descendants depth-first (default: false)' },
                Depth: { type: 'integer', description: 'maximum recursion depth — only effective with recursive: true' },
                only: { type: 'string', enum: ['items', 'links'], description: 'restrict output to items or links only' },
                Fields: { type: 'array', items: { type: 'string' }, description: 'extra fields to include — subset of Label, MIMEType, Value, Info' },
                InfoKeys: { type: 'array', items: { type: 'string' }, description: 'return only these named keys from each entry info map' },
            },
            required: ['StoreId', 'Id'],
        },
    },
    /**** sds_entry_update ****/
    {
        name: 'sds_entry_update',
        description: 'modify an existing entry; only explicitly specified fields are changed',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the entry to modify' },
                Label: { type: 'string', description: 'new display label' },
                MIMEType: { type: 'string', description: 'new MIME type (items only)' },
                Value: { type: 'string', description: 'new plain-text value (items only)' },
                ValueBase64: { type: 'string', description: 'new binary value as base64 (items only)' },
                File: { type: 'string', description: 'file path to read the new value from (items only)' },
                Info: { type: 'object', description: 'key-value pairs merged into the existing info map' },
                InfoDelete: { type: 'array', items: { type: 'string' }, description: 'info keys to remove from the entry' },
            },
            required: ['StoreId', 'Id'],
        },
    },
    /**** sds_entry_move ****/
    {
        name: 'sds_entry_move',
        description: 'move a live entry to a different container',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the entry to move' },
                to: { type: 'string', description: 'UUID of the target container item, or "root" / "lost-and-found"' },
                at: { type: 'integer', description: 'insertion index, 0-based (default: append)' },
            },
            required: ['StoreId', 'Id', 'to'],
        },
    },
    /**** sds_entry_delete ****/
    {
        name: 'sds_entry_delete',
        description: 'soft-delete an entry by moving it to the trash',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the entry to soft-delete' },
            },
            required: ['StoreId', 'Id'],
        },
    },
    /**** sds_entry_restore ****/
    {
        name: 'sds_entry_restore',
        description: 'move a trashed entry back to a live container (entry must be in trash)',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the trashed entry to restore' },
                to: { type: 'string', description: 'UUID of the target container item, or "root" / "lost-and-found" (default: root)' },
                at: { type: 'integer', description: 'insertion index, 0-based (default: append)' },
            },
            required: ['StoreId', 'Id'],
        },
    },
    /**** sds_entry_purge ****/
    {
        name: 'sds_entry_purge',
        description: 'permanently delete a trashed entry (entry must be in trash)',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Id: { type: 'string', description: 'UUID of the trashed entry to permanently delete' },
            },
            required: ['StoreId', 'Id'],
        },
    },
];
export const EntryToolHandlers = {
    'sds_entry_create': async (Params) => {
        const Config = configFrom(Params);
        return coreEntryCreate(Config.StoreId, Config, Params);
    },
    'sds_entry_get': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryGet(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_list': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryList(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_update': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return await coreEntryUpdate(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_move': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryMove(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_delete': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryDelete(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_restore': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryRestore(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
    'sds_entry_purge': async (Params) => {
        const Config = configFrom(Params);
        const Context = await loadContext(Config);
        try {
            return coreEntryPurge(Context.Store, Params);
        }
        finally {
            await closeContext(Context);
        }
    },
};
export const EntryBatchStepHandlers = {
    'sds_entry_create': async (Session, Params) => coreEntryCreate(Session.StoreId, { StoreId: Session.StoreId, PersistenceDir: Session.PersistenceDir }, Params, Session.Store),
    'sds_entry_get': async (Session, Params) => coreEntryGet(Session.Store, Params),
    'sds_entry_list': async (Session, Params) => coreEntryList(Session.Store, Params),
    'sds_entry_update': async (Session, Params) => coreEntryUpdate(Session.Store, Params),
    'sds_entry_move': async (Session, Params) => coreEntryMove(Session.Store, Params),
    'sds_entry_delete': async (Session, Params) => coreEntryDelete(Session.Store, Params),
    'sds_entry_restore': async (Session, Params) => coreEntryRestore(Session.Store, Params),
    'sds_entry_purge': async (Session, Params) => coreEntryPurge(Session.Store, Params),
};
/**** coreEntryCreate ****/
async function coreEntryCreate(StoreId, Config, Params, OpenStore) {
    validateValueParams(Params);
    const HasTarget = Params['Target'] != null;
    if (HasTarget) {
        // validate: item-only options cannot be combined with Target
        if (Params['MIMEType'] != null) {
            throw new MCP_ToolError('MIMEType cannot be combined with Target — only items have a MIME type');
        }
        if (Params['Value'] != null) {
            throw new MCP_ToolError('Value cannot be combined with Target');
        }
        if (Params['ValueBase64'] != null) {
            throw new MCP_ToolError('ValueBase64 cannot be combined with Target');
        }
        if (Params['File'] != null) {
            throw new MCP_ToolError('File cannot be combined with Target');
        }
    }
    const UseOpenStore = OpenStore != null;
    // for standalone calls, load or reuse the context
    const FullConfig = { ...Config, StoreId };
    let Store;
    let ContextToClose;
    if (UseOpenStore) {
        Store = OpenStore;
    }
    else {
        const Ctx = await loadContext(FullConfig, !HasTarget);
        Store = Ctx.Store;
        ContextToClose = Ctx;
    }
    try {
        const ContainerId = resolveEntryId(Params['Container'] ?? 'root');
        const Container = Store.EntryWithId(ContainerId);
        if ((Container == null) || (!Container.isItem)) {
            throw new MCP_ToolError(`container '${ContainerId}' not found or is not an item`);
        }
        const AtIndex = Params['at'] != null ? requireNonNegativeInt(Params['at'], 'at') : undefined;
        if (HasTarget) {
            const TargetId = resolveEntryId(Params['Target']);
            const Target = Store.EntryWithId(TargetId);
            if ((Target == null) || (!Target.isItem)) {
                throw new MCP_ToolError(`target '${TargetId}' not found or is not an item`);
            }
            const Link = Store.newLinkAt(Target, Container, AtIndex);
            if (Params['Label'] != null) {
                Link.Label = Params['Label'];
            }
            applyInfoParams(Store._InfoProxyOf(Link.Id), Params);
            return { Id: Link.Id, created: true, Kind: 'link', Target: TargetId };
        }
        else {
            const MIMEType = Params['MIMEType'] ?? 'text/plain';
            const Item = Store.newItemAt(MIMEType, Container, AtIndex);
            if (Params['Label'] != null) {
                Item.Label = Params['Label'];
            }
            await applyValueParams(Store, Item.Id, Params);
            applyInfoParams(Item.Info, Params);
            return { Id: Item.Id, created: true, Kind: 'item' };
        }
    }
    finally {
        if (!UseOpenStore && (ContextToClose != null)) {
            await ContextToClose.Engine.stop();
        }
    }
}
/**** coreEntryGet ****/
function coreEntryGet(Store, Params) {
    const RawId = Params['Id'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const Entry = Store.EntryWithId(Id);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    const Fields = Params['Fields']?.map((f) => f.toLowerCase());
    const InfoKeys = Params['InfoKeys'];
    const ShowAll = (Fields == null) && (InfoKeys == null);
    const Result = { Id: Entry.Id };
    const wantField = (Name) => ShowAll || (Fields?.includes(Name.toLowerCase()) ?? false);
    if (wantField('Kind')) {
        Result['Kind'] = Entry.isItem ? 'item' : 'link';
    }
    if (wantField('Label')) {
        Result['Label'] = Entry.Label;
    }
    if (Entry.isItem) {
        const Item = Entry;
        if (wantField('MIMEType')) {
            Result['MIMEType'] = Item.Type;
        }
        if (wantField('Value')) {
            Result['Value'] = Store._currentValueOf(Entry.Id) ?? null;
        }
    }
    if (Entry.isLink) {
        if (wantField('Target')) {
            Result['Target'] = Store._TargetOf(Entry.Id).Id;
        }
    }
    const InfoProxy = Store._InfoProxyOf(Entry.Id);
    switch (true) {
        case (InfoKeys != null): {
            const InfoSlice = {};
            for (const Key of InfoKeys) {
                InfoSlice[Key] = InfoProxy[Key] ?? null;
            }
            Result['Info'] = InfoSlice;
            break;
        }
        case (wantField('Info')): {
            Result['Info'] = { ...InfoProxy };
            break;
        }
    }
    return Result;
}
/**** coreEntryList ****/
function coreEntryList(Store, Params) {
    const RawId = Params['Id'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const Item = Store.EntryWithId(Id);
    if ((Item == null) || (!Item.isItem)) {
        throw new MCP_ToolError(`container '${Id}' not found or is not an item`);
    }
    const Recursive = Params['recursive'] ?? false;
    const MaxDepth = Params['Depth'] != null
        ? requireNonNegativeInt(Params['Depth'], 'Depth')
        : Infinity;
    const RawOnly = Params['only']?.toLowerCase();
    if ((RawOnly != null) && (!['items', 'links'].includes(RawOnly))) {
        throw new MCP_ToolError(`'only' must be 'items' or 'links' — got '${Params['only']}'`);
    }
    const Fields = Params['Fields']?.map((f) => f.toLowerCase());
    const InfoKeys = Params['InfoKeys'];
    const SystemListIds = new Set([TrashId, LostAndFoundId]);
    const Out = [];
    function walkEntries(ContainerId, Depth) {
        for (const Entry of Store._innerEntriesOf(ContainerId)) {
            if (SystemListIds.has(Entry.Id)) {
                continue;
            }
            const Kind = Entry.isItem ? 'item' : 'link';
            if ((RawOnly == null) || (RawOnly === Kind + 's')) {
                const Obj = { Id: Entry.Id, Kind };
                if (Fields?.includes('label')) {
                    Obj['Label'] = Entry.Label;
                }
                if (Entry.isItem) {
                    if (Fields?.includes('mimetype')) {
                        Obj['MIMEType'] = Store._TypeOf(Entry.Id);
                    }
                    if (Fields?.includes('value')) {
                        Obj['Value'] = Store._currentValueOf(Entry.Id) ?? null;
                    }
                }
                const InfoProxy = Store._InfoProxyOf(Entry.Id);
                switch (true) {
                    case (InfoKeys != null): {
                        const InfoSlice = {};
                        for (const Key of InfoKeys) {
                            InfoSlice[Key] = InfoProxy[Key] ?? null;
                        }
                        Obj['Info'] = InfoSlice;
                        break;
                    }
                    case (Fields?.includes('info')): {
                        Obj['Info'] = { ...InfoProxy };
                        break;
                    }
                }
                Out.push(Obj);
            }
            if (Recursive && Entry.isItem && (Depth + 1 < MaxDepth)) {
                walkEntries(Entry.Id, Depth + 1);
            }
        }
    }
    walkEntries(Id, 0);
    return Out;
}
/**** coreEntryUpdate ****/
async function coreEntryUpdate(Store, Params) {
    const RawId = Params['Id'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const Entry = Store.EntryWithId(Id);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    if (Entry.isLink) {
        if (Params['MIMEType'] != null) {
            throw new MCP_ToolError('MIMEType is not supported for links');
        }
        if (Params['Value'] != null) {
            throw new MCP_ToolError('Value is not supported for links');
        }
        if (Params['ValueBase64'] != null) {
            throw new MCP_ToolError('ValueBase64 is not supported for links');
        }
        if (Params['File'] != null) {
            throw new MCP_ToolError('File is not supported for links');
        }
    }
    validateValueParams(Params);
    if (Params['Label'] != null) {
        Entry.Label = Params['Label'];
    }
    if (Entry.isItem) {
        const Item = Entry;
        if (Params['MIMEType'] != null) {
            Item.Type = Params['MIMEType'];
        }
        await applyValueParams(Store, Item.Id, Params);
    }
    applyInfoParams(Store._InfoProxyOf(Id), Params);
    return { Id, updated: true };
}
/**** coreEntryMove ****/
function coreEntryMove(Store, Params) {
    const RawId = Params['Id'];
    const RawTo = Params['to'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    if (RawTo == null) {
        throw new MCP_ToolError('to is required');
    }
    const Id = resolveEntryId(RawId);
    const TargetId = resolveEntryId(RawTo);
    const AtIndex = Params['at'] != null ? requireNonNegativeInt(Params['at'], 'at') : undefined;
    const Entry = Store.EntryWithId(Id);
    const Target = Store.EntryWithId(TargetId);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    if ((Target == null) || (!Target.isItem)) {
        throw new MCP_ToolError(`container '${TargetId}' not found or is not an item`);
    }
    if (!Entry.mayBeMovedTo(Target, AtIndex)) {
        throw new MCP_ToolError(`cannot move '${Id}' into its own descendant`);
    }
    Entry.moveTo(Target, AtIndex);
    const MoveAt = AtIndex ?? (Array.from(Store._innerEntriesOf(Target.Id)).length - 1);
    return { Id, movedTo: TargetId, at: MoveAt };
}
/**** coreEntryDelete ****/
function coreEntryDelete(Store, Params) {
    const RawId = Params['Id'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const Entry = Store.EntryWithId(Id);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    if (!Entry.mayBeDeleted) {
        throw new MCP_ToolError(`entry '${Id}' cannot be deleted`);
    }
    Entry.delete();
    return { Id, deleted: true };
}
/**** coreEntryRestore ****/
function coreEntryRestore(Store, Params) {
    const RawId = Params['Id'];
    const RawTo = Params['to'] ?? 'root';
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const TargetId = resolveEntryId(RawTo);
    const AtIndex = Params['at'] != null ? requireNonNegativeInt(Params['at'], 'at') : undefined;
    const Entry = Store.EntryWithId(Id);
    const Target = Store.EntryWithId(TargetId);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    if (Entry.outerItemId !== TrashId) {
        throw new MCP_ToolError(`entry '${Id}' is not in the trash`);
    }
    if ((Target == null) || (!Target.isItem)) {
        throw new MCP_ToolError(`container '${TargetId}' not found or is not an item`);
    }
    Entry.moveTo(Target, AtIndex);
    const RestoreAt = AtIndex ?? (Array.from(Store._innerEntriesOf(Target.Id)).length - 1);
    return { Id, restoredTo: TargetId, at: RestoreAt };
}
/**** coreEntryPurge ****/
function coreEntryPurge(Store, Params) {
    const RawId = Params['Id'];
    if (RawId == null) {
        throw new MCP_ToolError('Id is required');
    }
    const Id = resolveEntryId(RawId);
    const Entry = Store.EntryWithId(Id);
    if (Entry == null) {
        throw new MCP_ToolError(`entry '${Id}' not found`);
    }
    if (Entry.outerItemId !== TrashId) {
        throw new MCP_ToolError(`entry '${Id}' is not in the trash — delete it first`);
    }
    Entry.purge();
    return { Id, purged: true };
}
//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//
/**** validInfoKeyPattern / assertValidInfoKey — rejects non-identifier keys ****/
const validInfoKeyPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function assertValidInfoKey(Key) {
    if (!validInfoKeyPattern.test(Key)) {
        throw new MCP_ToolError(`invalid info key ${JSON.stringify(Key)} — keys must be valid JavaScript identifiers`);
    }
}
/**** requireNonNegativeInt — validates an integer parameter value ****/
function requireNonNegativeInt(Value, ParamName) {
    if ((typeof Value !== 'number') || (!Number.isInteger(Value)) || (Value < 0)) {
        throw new MCP_ToolError(`'${ParamName}' must be a non-negative integer — got ${Value}`);
    }
    return Value;
}
/**** validateValueParams — checks mutual exclusion of Value / ValueBase64 / File ****/
function validateValueParams(Params) {
    const Count = [
        Params['Value'], Params['ValueBase64'], Params['File'],
    ].filter((v) => v != null).length;
    if (Count > 1) {
        throw new MCP_ToolError('Value, ValueBase64, and File are mutually exclusive');
    }
}
/**** applyValueParams — writes the appropriate value variant to the store item ****/
async function applyValueParams(Store, ItemId, Params) {
    const Item = Store.EntryWithId(ItemId);
    switch (true) {
        case (Params['File'] != null): {
            const FileData = await readFileSafely(Params['File']);
            const isBinary = !Item.Type.startsWith('text/');
            Item.writeValue(isBinary ? new Uint8Array(FileData) : FileData.toString('utf8'));
            break;
        }
        case (Params['ValueBase64'] != null): {
            const Decoded = Buffer.from(Params['ValueBase64'], 'base64');
            const isBinary = !Item.Type.startsWith('text/');
            Item.writeValue(isBinary ? new Uint8Array(Decoded) : Decoded.toString('utf8'));
            break;
        }
        case (Params['Value'] != null): {
            Item.writeValue(Params['Value']);
            break;
        }
    }
}
/**** applyInfoParams — merges and deletes info entries via an entry's info proxy ****/
function applyInfoParams(InfoProxy, Params) {
    const InfoMap = Params['Info'];
    const InfoDelete = Params['InfoDelete'];
    if (InfoMap != null) {
        if ((typeof InfoMap !== 'object') || Array.isArray(InfoMap)) {
            throw new MCP_ToolError(`'Info' must be a plain object — got ${Array.isArray(InfoMap) ? 'array' : typeof InfoMap}`);
        }
        for (const [Key, Value] of Object.entries(InfoMap)) {
            assertValidInfoKey(Key);
            InfoProxy[Key] = Value;
        }
    }
    if (InfoDelete != null) {
        if (!Array.isArray(InfoDelete)) {
            throw new MCP_ToolError(`'InfoDelete' must be an array of strings — got ${typeof InfoDelete}`);
        }
        for (const Key of InfoDelete) {
            if (typeof Key !== 'string') {
                throw new MCP_ToolError(`'InfoDelete' entries must be strings — got ${typeof Key}`);
            }
            assertValidInfoKey(Key);
            delete InfoProxy[Key];
        }
    }
}
//# sourceMappingURL=EntryTools.js.map