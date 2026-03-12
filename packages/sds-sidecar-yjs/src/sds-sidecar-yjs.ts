/*******************************************************************************
*                                                                              *
*                        SDS Sidecar YJS — CLI entry                           *
*                                                                              *
*******************************************************************************/

// sidecar daemon for shareable-data-store using the Y.js CRDT backend.
// Wires the @rozek/sds-core-yjs static factory into @rozek/sds-sidecar and
// exposes the result as the 'sds-sidecar-yjs' CLI.

import { SDS_DataStore }             from '@rozek/sds-core-yjs'
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
      process.argv[1].endsWith('sds-sidecar-yjs.js') ||
      process.argv[1].endsWith('/sds-sidecar-yjs')
    )
  ) {
    runSidecar(Factory, 'sds-sidecar-yjs').catch((Signal) => {
      process.stderr.write(
        `sds-sidecar-yjs: fatal: ${(Signal as Error).message ?? Signal}\n`
      )
      process.exit(1)
    })
  }
