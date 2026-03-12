/*******************************************************************************
*                                                                              *
*                               EntryTools                                     *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type BatchSession } from '../StoreAccess.js';
export declare const EntryToolDefs: Tool[];
export type EntryToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export declare const EntryToolHandlers: Record<string, EntryToolHandler>;
export type EntryBatchStepFn = (Session: BatchSession, Params: Record<string, unknown>) => Promise<unknown>;
export declare const EntryBatchStepHandlers: Record<string, EntryBatchStepFn>;
//# sourceMappingURL=EntryTools.d.ts.map