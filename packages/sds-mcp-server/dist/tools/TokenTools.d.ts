/*******************************************************************************
*                                                                              *
*                               TokenTools                                     *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const TokenToolDefs: Tool[];
export type TokenToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export type TokenBatchStepFn = never;
export declare const TokenBatchStepHandlers: Record<string, never>;
export declare const TokenToolHandlers: Record<string, TokenToolHandler>;
//# sourceMappingURL=TokenTools.d.ts.map