/*******************************************************************************
*                                                                              *
*                        SDS Command JJ — CLI entry                            *
*                                                                              *
*******************************************************************************/

// CLI tool for shareable-data-store using the json-joy CRDT backend.
// Wires the @rozek/sds-core-jj static factory into @rozek/sds-command and
// exposes the result as the 'sds-jj' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-jj'
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
      process.argv[1].endsWith('sds-command-jj.js') ||
      process.argv[1].endsWith('/sds-jj')
    )
  ) {
    runCommand(Factory, 'sds-jj', pkg.version).catch((Signal) => {
      process.stderr.write(
        `sds-jj: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
