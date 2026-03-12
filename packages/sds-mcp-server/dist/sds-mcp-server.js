/*******************************************************************************
*                                                                              *
*                            SDS MCP Server                                    *
*                                                                              *
*******************************************************************************/
// entry point — sets up the MCP server, registers all tool definitions and
// call handlers, then connects to the stdio transport
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { toolResult, toolError } from './Errors.js';
import { setServerDefaults } from './Config.js';
import { setStoreFactory } from './StoreAccess.js';
// module-level server name and version — set once by runMCPServer
let _ServerName = 'sds-mcp-server';
let _Version = '0.0.0';
import { StoreToolDefs, StoreToolHandlers } from './tools/StoreTools.js';
import { EntryToolDefs, EntryToolHandlers } from './tools/EntryTools.js';
import { TrashToolDefs, TrashToolHandlers } from './tools/TrashTools.js';
import { TreeToolDefs, TreeToolHandlers } from './tools/TreeTools.js';
import { TokenToolDefs, TokenToolHandlers } from './tools/TokenTools.js';
import { BatchToolDefs, BatchToolHandlers } from './tools/BatchTools.js';
//----------------------------------------------------------------------------//
//                              tool registry                                 //
//----------------------------------------------------------------------------//
// all tool definitions, in the order they will appear in ListTools responses
const AllToolDefs = [
    ...StoreToolDefs,
    ...EntryToolDefs,
    ...TrashToolDefs,
    ...TreeToolDefs,
    ...TokenToolDefs,
    ...BatchToolDefs,
];
// unified dispatch table: tool name → async handler
const AllHandlers = {
    ...StoreToolHandlers,
    ...EntryToolHandlers,
    ...TrashToolHandlers,
    ...TreeToolHandlers,
    ...TokenToolHandlers,
    ...BatchToolHandlers,
};
//----------------------------------------------------------------------------//
//                               buildServer                                  //
//----------------------------------------------------------------------------//
/**** buildServer — constructs and configures the MCP server instance ****/
function buildServer() {
    const MCPServer = new Server({ name: _ServerName, version: _Version }, { capabilities: { tools: {} } });
    /**** ListTools — returns all registered tool definitions ****/
    MCPServer.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: AllToolDefs,
    }));
    /**** CallTool — dispatches to the appropriate tool handler ****/
    MCPServer.setRequestHandler(CallToolRequestSchema, async (Request) => {
        const { name, arguments: Args = {} } = Request.params;
        const Handler = AllHandlers[name];
        if (Handler == null) {
            return toolError(`unknown tool: '${name}'`);
        }
        try {
            const Result = await Handler(Args);
            return toolResult(Result);
        }
        catch (Signal) {
            return toolError(Signal.message ?? String(Signal));
        }
    });
    return MCPServer;
}
//----------------------------------------------------------------------------//
//                                  main                                      //
//----------------------------------------------------------------------------//
/**** parseArgs — extracts server-level defaults from process.argv ****/
const KnownFlags = new Set([
    '--store', '--persistence-dir', '--server', '--token', '--admin-token',
]);
function parseArgs(Argv) {
    const Defaults = {};
    for (let i = 0; i < Argv.length; i++) {
        switch (Argv[i]) {
            case '--store':
                Defaults.StoreId = Argv[++i];
                break;
            case '--persistence-dir':
                Defaults.PersistenceDir = Argv[++i];
                break;
            case '--server':
                Defaults.ServerURL = Argv[++i];
                break;
            case '--token':
                Defaults.Token = Argv[++i];
                break;
            case '--admin-token':
                Defaults.AdminToken = Argv[++i];
                break;
            default: {
                if (Argv[i]?.startsWith('--') && !KnownFlags.has(Argv[i])) {
                    process.stderr.write(`sds-mcp-server: unknown argument '${Argv[i]}' — ` +
                        `known flags: --store, --persistence-dir, --server, --token, --admin-token\n`);
                }
            }
        }
    }
    return Defaults;
}
/**** main — starts the MCP server on stdio ****/
async function main() {
    setServerDefaults(parseArgs(process.argv.slice(2)));
    const MCPServer = buildServer();
    const Transport = new StdioServerTransport();
    await MCPServer.connect(Transport);
}
//----------------------------------------------------------------------------//
//                              runMCPServer                                  //
//----------------------------------------------------------------------------//
/**** runMCPServer — called by backend-specific wrapper packages ****/
export async function runMCPServer(StoreFactory, ServerName = 'sds-mcp-server', Version = '0.0.0') {
    _ServerName = ServerName;
    _Version = Version;
    setStoreFactory(StoreFactory);
    return main();
}
//# sourceMappingURL=sds-mcp-server.js.map