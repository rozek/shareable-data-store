/*******************************************************************************
*                                                                              *
*                    SDS MCP Server Loro — entry point                         *
*                                                                              *
*******************************************************************************/

// MCP server for shareable-data-store using the Loro CRDT backend.
// Wires the @rozek/sds-core-loro static factory into @rozek/sds-mcp-server and
// exposes the result as the 'sds-mcp-server-loro' executable.

import { SDS_DataStore }             from '@rozek/sds-core-loro'
import { runMCPServer }              from '@rozek/sds-mcp-server'
import type { SDS_StoreFactory }     from '@rozek/sds-mcp-server'

import pkg from '../package.json'

  const Factory:SDS_StoreFactory = {
    fromScratch: ()     => SDS_DataStore.fromScratch(),
    fromBinary:  (Data) => SDS_DataStore.fromBinary(Data),
  }

//----------------------------------------------------------------------------//
//                               server entry point                           //
//----------------------------------------------------------------------------//

  runMCPServer(Factory, 'sds-mcp-server-loro', pkg.version).catch((Signal) => {
    process.stderr.write(
      `sds-mcp-server-loro: fatal: ${(Signal as Error).message ?? Signal}\n`
    )
    process.exit(1)
  })
