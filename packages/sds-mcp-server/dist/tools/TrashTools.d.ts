/*******************************************************************************
*                                                                              *
*                               TrashTools                                     *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type BatchSession } from '../StoreAccess.js';
export declare const TrashToolDefs: Tool[];
export type TrashToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export declare const TrashToolHandlers: Record<string, TrashToolHandler>;
export type TrashBatchStepFn = (Session: BatchSession, Params: Record<string, unknown>) => Promise<unknown>;
export declare const TrashBatchStepHandlers: Record<string, TrashBatchStepFn>;
//# sourceMappingURL=TrashTools.d.ts.map