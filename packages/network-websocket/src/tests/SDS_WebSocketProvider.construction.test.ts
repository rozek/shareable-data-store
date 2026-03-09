/*******************************************************************************
*                                                                              *
*             SDS_WebSocketProvider — Construction Tests                       *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_WebSocketProvider } from '../sds-network-websocket.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_WebSocketProvider — Construction', () => {

  it('WC-01: ConnectionState is disconnected on construction', () => {
    const P = new SDS_WebSocketProvider('store-1')
    expect(P.ConnectionState).toBe('disconnected')
    expect(P.StoreID).toBe('store-1')
    expect(P.PeerSet.size).toBe(0)
  })

})
