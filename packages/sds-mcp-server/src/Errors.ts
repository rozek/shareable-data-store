/*******************************************************************************
*                                                                              *
*                                  Errors                                      *
*                                                                              *
*******************************************************************************/

// MCP tool error class and response-shaping helpers

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

//----------------------------------------------------------------------------//
//                               MCP_ToolError                                //
//----------------------------------------------------------------------------//

/**** MCP_ToolError — thrown by tool handlers to signal a known failure ****/

export class MCP_ToolError extends Error {
  constructor (Message:string) {
    super(Message)
    this.name = 'MCP_ToolError'
  }
}

//----------------------------------------------------------------------------//
//                            response helpers                                //
//----------------------------------------------------------------------------//

/**** toolResult — wraps a plain value as a successful MCP tool response ****/

export function toolResult (Value:unknown):CallToolResult {
  return { content: [{ type:'text', text:JSON.stringify(Value) }] }
}

/**** toolError — wraps an error message as a failed MCP tool response ****/

export function toolError (Message:string):CallToolResult {
  return { content: [{ type:'text', text:Message }], isError:true }
}
