/*******************************************************************************
*                                                                              *
*                               BatchTools                                     *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const BatchToolDefs: Tool[];
export type BatchToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export declare const BatchToolHandlers: Record<string, BatchToolHandler>;
//# sourceMappingURL=BatchTools.d.ts.map