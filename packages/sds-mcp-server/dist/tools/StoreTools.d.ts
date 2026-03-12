/*******************************************************************************
*                                                                              *
*                               StoreTools                                     *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type BatchSession } from '../StoreAccess.js';
export declare const StoreToolDefs: Tool[];
export type StoreToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export declare const StoreToolHandlers: Record<string, StoreToolHandler>;
export type StoreBatchStepFn = (Session: BatchSession, Params: Record<string, unknown>) => Promise<unknown>;
export declare const StoreBatchStepHandlers: Record<string, StoreBatchStepFn>;
//# sourceMappingURL=StoreTools.d.ts.map