/*******************************************************************************
*                                                                              *
*                               BatchTools                                     *
*                                                                              *
*******************************************************************************/
import { configFrom } from '../Config.js';
import { MCP_ToolError } from '../Errors.js';
import { openBatchSession } from '../StoreAccess.js';
import { StoreBatchStepHandlers } from './StoreTools.js';
import { EntryBatchStepHandlers } from './EntryTools.js';
import { TrashBatchStepHandlers } from './TrashTools.js';
import { TreeBatchStepHandlers } from './TreeTools.js';
//----------------------------------------------------------------------------//
//                            batch step registry                             //
//----------------------------------------------------------------------------//
// all tool names that may appear inside a sds_batch Commands list
const BatchRegistry = {
    ...StoreBatchStepHandlers,
    ...EntryBatchStepHandlers,
    ...TrashBatchStepHandlers,
    ...TreeBatchStepHandlers,
};
const AllowedBatchTools = new Set(Object.keys(BatchRegistry));
//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//
export const BatchToolDefs = [
    /**** sds_batch ****/
    {
        name: 'sds_batch',
        description: ('execute multiple operations against one store in a single session — ' +
            'the store is opened once, all commands run sequentially, then it is closed; ' +
            'StoreId and PersistenceDir are inherited by all commands'),
        inputSchema: {
            type: 'object',
            properties: {
                StoreId: { type: 'string', description: 'store identifier' },
                PersistenceDir: { type: 'string', description: 'local database directory (default: ~/.sds)' },
                onError: { type: 'string', enum: ['stop', 'continue'], description: '"stop" (default): abort on first failure; "continue": attempt all commands and collect errors' },
                Commands: {
                    type: 'array',
                    description: 'ordered list of operations to execute',
                    items: {
                        type: 'object',
                        properties: {
                            Tool: { type: 'string', description: 'name of the tool to invoke' },
                            Params: { type: 'object', description: 'parameters for that tool, without StoreId and PersistenceDir' },
                        },
                        required: ['Tool', 'Params'],
                    },
                },
            },
            required: ['StoreId', 'Commands'],
        },
    },
];
export const BatchToolHandlers = {
    'sds_batch': async (Params) => {
        const Config = configFrom(Params);
        const StoreId = Config.StoreId;
        const onError = (Params['onError'] ?? 'stop').toLowerCase();
        const Commands = Params['Commands'];
        if (StoreId == null) {
            throw new MCP_ToolError('StoreId is required');
        }
        if (Commands == null || !Array.isArray(Commands)) {
            throw new MCP_ToolError('Commands must be an array');
        }
        if ((onError !== 'stop') && (onError !== 'continue')) {
            throw new MCP_ToolError(`'onError' must be 'stop' or 'continue' — got '${Params['onError']}'`);
        }
        // validate all tool names up front (regardless of onError mode)
        for (const Cmd of Commands) {
            if (typeof Cmd.Tool !== 'string') {
                throw new MCP_ToolError('each Command must have a string Tool field');
            }
            if (!AllowedBatchTools.has(Cmd.Tool)) {
                throw new MCP_ToolError(`tool '${Cmd.Tool}' is not allowed inside sds_batch`);
            }
            if ((Cmd.Params == null) || (typeof Cmd.Params !== 'object')) {
                throw new MCP_ToolError(`Command for '${Cmd.Tool}' must have a Params object`);
            }
        }
        // open the store once — allow creation so entry-create can init a new store
        const Session = await openBatchSession(Config, true);
        const Results = [];
        try {
            for (const Cmd of Commands) {
                const Handler = BatchRegistry[Cmd.Tool];
                try {
                    const Result = await Handler(Session, Cmd.Params);
                    Results.push({ Tool: Cmd.Tool, ok: true, Result });
                }
                catch (Signal) {
                    const ErrorMsg = (Signal instanceof Error) ? Signal.message : String(Signal);
                    Results.push({ Tool: Cmd.Tool, ok: false, Error: ErrorMsg });
                    if (onError === 'stop') {
                        break;
                    }
                }
            }
        }
        finally {
            await Session.close();
        }
        return { Results };
    },
};
//# sourceMappingURL=BatchTools.js.map