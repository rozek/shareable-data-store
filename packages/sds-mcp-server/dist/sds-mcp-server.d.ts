/*******************************************************************************
*                                                                              *
*                            SDS MCP Server                                    *
*                                                                              *
*******************************************************************************/
import { type SDS_StoreFactory } from './StoreAccess.js';
export type { SDS_StoreFactory };
/**** runMCPServer — called by backend-specific wrapper packages ****/
export declare function runMCPServer(StoreFactory: SDS_StoreFactory, ServerName?: string, Version?: string): Promise<void>;
//# sourceMappingURL=sds-mcp-server.d.ts.map