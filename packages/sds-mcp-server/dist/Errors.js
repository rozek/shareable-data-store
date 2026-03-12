/*******************************************************************************
*                                                                              *
*                                  Errors                                      *
*                                                                              *
*******************************************************************************/
//----------------------------------------------------------------------------//
//                               MCP_ToolError                                //
//----------------------------------------------------------------------------//
/**** MCP_ToolError — thrown by tool handlers to signal a known failure ****/
export class MCP_ToolError extends Error {
    constructor(Message) {
        super(Message);
        this.name = 'MCP_ToolError';
    }
}
//----------------------------------------------------------------------------//
//                            response helpers                                //
//----------------------------------------------------------------------------//
/**** toolResult — wraps a plain value as a successful MCP tool response ****/
export function toolResult(Value) {
    return { content: [{ type: 'text', text: JSON.stringify(Value) }] };
}
/**** toolError — wraps an error message as a failed MCP tool response ****/
export function toolError(Message) {
    return { content: [{ type: 'text', text: Message }], isError: true };
}
//# sourceMappingURL=Errors.js.map