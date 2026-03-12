/*******************************************************************************
*                                                                              *
*                               TreeTools                                      *
*                                                                              *
*******************************************************************************/
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type BatchSession } from '../StoreAccess.js';
export declare const TreeToolDefs: Tool[];
export type TreeToolHandler = (Params: Record<string, unknown>) => Promise<unknown>;
export declare const TreeToolHandlers: Record<string, TreeToolHandler>;
export type TreeBatchStepFn = (Session: BatchSession, Params: Record<string, unknown>) => Promise<unknown>;
export declare const TreeBatchStepHandlers: Record<string, TreeBatchStepFn>;
/**** TreeNode — discriminated union: item nodes carry innerEntries, link nodes carry TargetId ****/
export type TreeNode = {
    Id: string;
    Kind: 'item';
    Label: string;
    innerEntries: TreeNode[];
} | {
    Id: string;
    Kind: 'link';
    Label: string;
    TargetId: string;
};
//# sourceMappingURL=TreeTools.d.ts.map