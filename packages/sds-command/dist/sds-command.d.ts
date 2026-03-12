/*******************************************************************************
*                                                                              *
*                             SDS Command CLI                                  *
*                                                                              *
*******************************************************************************/
export type { SDS_StoreFactory } from './StoreAccess.js';
/**** runCommand — called by backend-specific wrapper packages ****/
export declare function runCommand(StoreFactory: SDS_StoreFactory, CommandName?: string, Version?: string): Promise<void>;
//# sourceMappingURL=sds-command.d.ts.map