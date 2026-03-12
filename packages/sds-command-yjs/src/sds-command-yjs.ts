/*******************************************************************************
*                                                                              *
*                        SDS Command Yjs — CLI entry                           *
*                                                                              *
*******************************************************************************/

// CLI tool for shareable-data-store using the Y.js CRDT backend.
// Wires the @rozek/sds-core-yjs static factory into @rozek/sds-command and
// exposes the result as the 'sds-yjs' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-yjs'
import { runCommand }                from '@rozek/sds-command'
import type { SDS_StoreFactory }     from '@rozek/sds-command'

import pkg from '../package.json'

  const Factory:SDS_StoreFactory = {
    fromScratch: ()     => SDS_DataStore.fromScratch(),
    fromBinary:  (Data) => SDS_DataStore.fromBinary(Data),
  }

//----------------------------------------------------------------------------//
//                               CLI entry point                              //
//----------------------------------------------------------------------------//

  if (
    (typeof process !== 'undefined') &&
    (process.argv[1] != null) &&
    (
      process.argv[1].endsWith('sds-command-yjs.js') ||
      process.argv[1].endsWith('/sds-yjs')
    )
  ) {
    runCommand(Factory, 'sds-yjs', pkg.version).catch((Signal) => {
      process.stderr.write(
        `sds-yjs: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
