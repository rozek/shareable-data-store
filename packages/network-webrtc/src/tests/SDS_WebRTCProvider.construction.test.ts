/*******************************************************************************
*                                                                              *
*              SDS_WebRTCProvider — Construction Tests                         *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { SDS_WebRTCProvider }   from '../sds-network-webrtc.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_WebRTCProvider — Construction', () => {
  it('RC-01: ConnectionState is disconnected; PeerSet empty', () => {
    const P = new SDS_WebRTCProvider('store-1')
    expect(P.StoreID).toBe('store-1')
    expect(P.ConnectionState).toBe('disconnected')
    expect(P.PeerSet.size).toBe(0)
  })
})
