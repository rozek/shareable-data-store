/*******************************************************************************
*                                                                              *
*                               TreeTools                                      *
*                                                                              *
*******************************************************************************/
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core';
import { configFrom } from '../Config.js';
import { MCP_ToolError } from '../Errors.js';
import { loadContext, closeContext } from '../StoreAccess.js';
//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//
export const TreeToolDefs = [
    /**** sds_tree_show ****/
    {
        name: 'sds_tree_show',
        description: 'return the entire store as a nested tree structure starting from root',
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                Depth: { type: 'integer', description: 'maximum number of levels to include (default: unlimited)' },
            },
            required: ['StoreId'],
        },
    },
];
export const TreeToolHandlers = {
    'sds_tree_show': async (Params) => {
        const Config = configFrom(Params);
        const MaxDepth = resolveDepth(Params);
        const Context = await loadContext(Config);
        try {
            return coreTreeShow(Context.Store, MaxDepth);
        }
        finally {
            await closeContext(Context);
        }
    },
};
export const TreeBatchStepHandlers = {
    'sds_tree_show': async (Session, Params) => {
        const MaxDepth = resolveDepth(Params);
        return coreTreeShow(Session.Store, MaxDepth);
    },
};
/**** coreTreeShow ****/
function coreTreeShow(Store, MaxDepth) {
    return { Root: buildTreeNodes(Store, RootId, MaxDepth, 0) };
}
/**** buildTreeNodes — recursive conversion of store entries to TreeNode ****/
const SystemTreeIds = new Set([TrashId, LostAndFoundId]);
function buildTreeNodes(Store, ItemId, MaxDepth, Depth) {
    if (Depth >= MaxDepth) {
        return [];
    }
    const Result = [];
    for (const Entry of Store._innerEntriesOf(ItemId)) {
        if (SystemTreeIds.has(Entry.Id)) {
            continue;
        }
        if (Entry.isLink) {
            const TargetId = Store._TargetOf(Entry.Id).Id;
            Result.push({ Id: Entry.Id, Kind: 'link', Label: Entry.Label, TargetId });
        }
        else {
            const innerEntries = (Depth + 1 < MaxDepth)
                ? buildTreeNodes(Store, Entry.Id, MaxDepth, Depth + 1)
                : [];
            Result.push({ Id: Entry.Id, Kind: 'item', Label: Entry.Label, innerEntries });
        }
    }
    return Result;
}
//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//
/**** resolveDepth — validates and returns the Depth parameter ****/
function resolveDepth(Params) {
    if (Params['Depth'] == null) {
        return Infinity;
    }
    const Value = Params['Depth'];
    if ((typeof Value !== 'number') || (!Number.isInteger(Value)) || (Value < 0)) {
        throw new MCP_ToolError(`'Depth' must be a non-negative integer — got ${Value}`);
    }
    return Value;
}
//# sourceMappingURL=TreeTools.js.map