/*******************************************************************************
*                                                                              *
*             SNS_WebSocketProvider — Construction Tests                       *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_WebSocketProvider } from '../sns-network-websocket.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_WebSocketProvider — Construction', () => {

  it('WC-01: ConnectionState is disconnected on construction', () => {
    const P = new SNS_WebSocketProvider('store-1')
    expect(P.ConnectionState).toBe('disconnected')
    expect(P.StoreID).toBe('store-1')
    expect(P.PeerSet.size).toBe(0)
  })

})
