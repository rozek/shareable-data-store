/*******************************************************************************
*                                                                              *
*                        SDS Sidecar Loro — CLI entry                          *
*                                                                              *
*******************************************************************************/

// sidecar daemon for shareable-data-store using the Loro CRDT backend.
// Wires the @rozek/sds-core-loro static factory into @rozek/sds-sidecar and
// exposes the result as the 'sds-sidecar-loro' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-loro'
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
      process.argv[1].endsWith('sds-sidecar-loro.js') ||
      process.argv[1].endsWith('/sds-sidecar-loro')
    )
  ) {
    runSidecar(Factory, 'sds-sidecar-loro').catch((Signal) => {
      process.stderr.write(
        `sds-sidecar-loro: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
