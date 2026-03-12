/*******************************************************************************
*                                                                              *
*                                  Errors                                      *
*                                                                              *
*******************************************************************************/
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**** MCP_ToolError — thrown by tool handlers to signal a known failure ****/
export declare class MCP_ToolError extends Error {
    constructor(Message: string);
}
/**** toolResult — wraps a plain value as a successful MCP tool response ****/
export declare function toolResult(Value: unknown): CallToolResult;
/**** toolError — wraps an error message as a failed MCP tool response ****/
export declare function toolError(Message: string): CallToolResult;
//# sourceMappingURL=Errors.d.ts.map