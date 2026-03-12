/*******************************************************************************
*                                                                              *
*                        integration test MCP helper                           *
*                                                                              *
*******************************************************************************/

// spawns the built sds-mcp-server binary via StdioClientTransport and wraps
// the MCP Client API in a simpler interface for use in integration tests

import { Client }               from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { fileURLToPath }        from 'node:url'
import path                     from 'node:path'

const __dirname    = path.dirname(fileURLToPath(import.meta.url))
const ServerPath   = path.resolve(__dirname, '../../dist/sds-mcp-server-jj.js')

// tracks the Transport for each Client so closeMCPClient can shut it down cleanly
const ClientTransports = new WeakMap<Client, StdioClientTransport>()

//----------------------------------------------------------------------------//
//                                MCPResult                                   //
//----------------------------------------------------------------------------//

export interface MCPResult {
  isError: boolean
  Result?: unknown   // parsed JSON value; present when isError is false
  Error?:  string    // plain-text error message; present when isError is true
}

//----------------------------------------------------------------------------//
//                             createMCPClient                                //
//----------------------------------------------------------------------------//

/**** createMCPClient — spawns the server and returns a connected Client ****/

export async function createMCPClient ():Promise<Client> {
  return createMCPClientWith({})
}

/**** createMCPClientWith — spawns the server with extra CLI args / env vars ****/

export async function createMCPClientWith (Options:{
  extraArgs?: string[]
  extraEnv?:  Record<string,string>
}):Promise<Client> {
  const Transport = new StdioClientTransport({
    command: process.execPath,
    args:    [ ServerPath, ...(Options.extraArgs ?? []) ],
    env:     { ...process.env, NODE_OPTIONS:'--no-warnings', ...(Options.extraEnv ?? {}) },
  })

  const MCPClient = new Client(
    { name:'sds-mcp-test', version:'1.0.0' },
    { capabilities:{} }
  )
  await MCPClient.connect(Transport)
  ClientTransports.set(MCPClient, Transport)

  return MCPClient
}

//----------------------------------------------------------------------------//
//                             closeMCPClient                                 //
//----------------------------------------------------------------------------//

/**** closeMCPClient — closes the Transport associated with the given Client ****/

export async function closeMCPClient (MCPClient:Client):Promise<void> {
  const Transport = ClientTransports.get(MCPClient)
  if (Transport != null) { await Transport.close() }
}

//----------------------------------------------------------------------------//
//                               callTool                                     //
//----------------------------------------------------------------------------//

/**** callTool — calls a named MCP tool and returns a structured result ****/

export async function callTool (
  MCPClient:Client, Name:string, Args:Record<string,unknown>
):Promise<MCPResult> {
  const Response = await MCPClient.callTool({ name:Name, arguments:Args })

  const IsError = (Response as any).isError === true
  const Text    = ((Response.content as any)[0]?.text ?? '') as string

  if (IsError) { return { isError:true, Error:Text } }

  try {
    return { isError:false, Result:JSON.parse(Text) }
  } catch {
    return { isError:false, Result:Text }
  }
}
