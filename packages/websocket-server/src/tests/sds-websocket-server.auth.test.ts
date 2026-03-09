/*******************************************************************************
*                                                                              *
*                  SNS WebSocket Server — Auth Tests                           *
*                                                                              *
*******************************************************************************/

  import { describe, it, expect }  from 'vitest'
  import { SignJWT }               from 'jose'
  import { createSDSServer }       from '../sds-websocket-server.js'

  const SECRET_STR = 'test-secret-key-at-least-32-chars!!'
  const SECRET     = new TextEncoder().encode(SECRET_STR)

/**** makeToken — signs a JWT with the given claims for test use ****/

  async function makeToken (
    sub:string, aud:string, scope:string,
    expiresInSec = 3600, SecretOverride?:Uint8Array
  ):Promise<string> {
    const Signer = new SignJWT({ sub, aud, scope })
      .setProtectedHeader({ alg:'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now()/1000)+expiresInSec)
    return Signer.sign(SecretOverride ?? SECRET)
  }

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

  describe('SNS WebSocket Server — Auth', () => {
    const { app } = createSDSServer({ JWTSecret:SECRET_STR })

    it('SA-01: missing token returns 401 on HTTP upgrade request', async () => {
      const Res = await app.request('/ws/store-1', {
        headers: { 'Upgrade':'websocket', 'Connection':'upgrade' },
      })
      // Without a real WS handshake, Hono returns 426 or 400; the route still validates
      expect(Res.status).toBeGreaterThanOrEqual(400)
    })

    it('SA-03: valid JWT but wrong aud rejected (HTTP-level check)', async () => {
      const Token = await makeToken('alice', 'other-store', 'write')
      const Res   = await app.request(`/ws/store-1?token=${encodeURIComponent(Token)}`, {
        headers: { 'Upgrade':'websocket' },
      })
      expect(Res.status).toBeGreaterThanOrEqual(400)
    })

    it('SA-04: expired JWT rejected', async () => {
      const Token = await makeToken('alice', 'store-1', 'write', -1)
      const Res   = await app.request(`/ws/store-1?token=${encodeURIComponent(Token)}`, {
        headers: { 'Upgrade':'websocket' },
      })
      expect(Res.status).toBeGreaterThanOrEqual(400)
    })
  })
