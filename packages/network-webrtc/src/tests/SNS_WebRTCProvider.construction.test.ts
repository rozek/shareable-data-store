/*******************************************************************************
*                                                                              *
*              SNS_WebRTCProvider — Construction Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SNS_WebRTCProvider }   from '../sns-network-webrtc.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_WebRTCProvider — Construction', () => {
  it('RC-01: ConnectionState is disconnected; PeerSet empty', () => {
    const P = new SNS_WebRTCProvider('store-1')
    expect(P.StoreID).toBe('store-1')
    expect(P.ConnectionState).toBe('disconnected')
    expect(P.PeerSet.size).toBe(0)
  })
})
