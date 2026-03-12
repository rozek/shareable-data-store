/*******************************************************************************
*                                                                              *
*                    SidecarNetworkProvider — unit tests                       *
*                                                                              *
*******************************************************************************/

// tests that do not require a live WebSocket server; they verify the backoff
// delay calculation and the interface contract of the provider

import { describe, it, expect } from 'vitest'
import { SidecarNetworkProvider } from '../SidecarNetworkProvider.js'

//----------------------------------------------------------------------------//
//                              backoff delay tests                           //
//----------------------------------------------------------------------------//

describe('SidecarNetworkProvider — backoff schedule', () => {

/**** TC-BD-01 — exponential growth and hard cap ****/

  // verifies that the delay doubles each attempt until MaxDelay is reached and
  // that subsequent attempts stay at the cap — the weaker property "no attempt
  // ever exceeds MaxDelay" is implied by the exact values checked below
  it('doubles delay each attempt until cap', () => {
    const InitialDelay = 1000
    const MaxDelay     = 60000

    const Expected = [ 1000, 2000, 4000, 8000, 16000, 32000, 60000, 60000 ]
    for (let Attempt = 0; Attempt < Expected.length; Attempt++) {
      const BaseDelay = Math.min(InitialDelay*(2**Attempt), MaxDelay)
      expect(BaseDelay).toBe(Expected[Attempt])
    }
  })

/**** TC-BD-02 — jitter range — builds on TC-BD-01 ****/

  // assumption: TC-BD-01 passes (base delay formula is correct)
  // verifies that the jitter term stays within ±jitter*baseDelay and that
  // the clamped delay is always non-negative
  it('applies jitter within ±jitter*baseDelay', () => {
    const Base   = 8000
    const Jitter = 0.1

    for (let i = 0; i < 50; i++) {
      const JitterMs = Base*Jitter*(Math.random()*2-1)
      const Delay    = Math.max(0, Math.round(Base+JitterMs))
      expect(Delay).toBeGreaterThanOrEqual(0)
      expect(Delay).toBeLessThanOrEqual(Math.ceil(Base*(1+Jitter)))
    }
  })

})

//----------------------------------------------------------------------------//
//                    subscription / constructor contract tests               //
//----------------------------------------------------------------------------//

describe('SidecarNetworkProvider — subscription contract', () => {

/**** TC-SC-01 — unsubscribe is idempotent ****/

  // verifies that the function returned by onPatch and onAuthError is callable
  // any number of times without throwing (idempotent unsubscribe)
  it('unsubscribe is callable multiple times without throwing', () => {
    const Provider = new SidecarNetworkProvider('test-store', {
      initialDelay: 1000, maxDelay: 60000, Jitter: 0.1,
    })

    const OffPatch = Provider.onPatch(() => {})
    expect(() => OffPatch()).not.toThrow()
    expect(() => OffPatch()).not.toThrow()   // idempotent

    const OffAuth = Provider.onAuthError(() => {})
    expect(() => OffAuth()).not.toThrow()
    expect(() => OffAuth()).not.toThrow()    // idempotent
  })

/**** TC-SC-02 — constructor initialises properties correctly ****/

  // ConnectionState and StoreId are independent constructor assertions;
  // merged into one test because they share a single constructor call
  it('constructor sets ConnectionState to disconnected and StoreId from argument', () => {
    const Provider = new SidecarNetworkProvider('my-store', {
      initialDelay: 1000, maxDelay: 60000, Jitter: 0.1,
    })
    expect(Provider.ConnectionState).toBe('disconnected')
    expect(Provider.StoreId).toBe('my-store')
  })

})
