/*******************************************************************************
*                                                                              *
*                       SDS Command Loro — CLI entry                           *
*                                                                              *
*******************************************************************************/

// CLI tool for shareable-data-store using the Loro CRDT backend.
// Wires the @rozek/sds-core-loro static factory into @rozek/sds-command and
// exposes the result as the 'sds-loro' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-loro'
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
      process.argv[1].endsWith('sds-command-loro.js') ||
      process.argv[1].endsWith('/sds-loro')
    )
  ) {
    runCommand(Factory, 'sds-loro', pkg.version).catch((Signal) => {
      process.stderr.write(
        `sds-loro: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
