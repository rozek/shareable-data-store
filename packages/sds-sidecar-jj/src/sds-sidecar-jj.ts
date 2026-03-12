/*******************************************************************************
*                                                                              *
*                          SDS Sidecar JJ — CLI entry                          *
*                                                                              *
*******************************************************************************/

// sidecar daemon for shareable-data-store using the json-joy CRDT backend.
// Wires the @rozek/sds-core-jj static factory into @rozek/sds-sidecar and
// exposes the result as the 'sds-sidecar-jj' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-jj'
import { runSidecar }                from '@rozek/sds-sidecar'
import type { SDS_StoreFactory }     from '@rozek/sds-sidecar'

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
      process.argv[1].endsWith('sds-sidecar-jj.js') ||
      process.argv[1].endsWith('/sds-sidecar-jj')
    )
  ) {
    runSidecar(Factory, 'sds-sidecar-jj').catch((Signal) => {
      process.stderr.write(
        `sds-sidecar-jj: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
