/*******************************************************************************
*                                                                              *
*               SNS WebSocket Server — Token Issuance Tests                    *
*                                                                              *
*******************************************************************************/

  import { describe, it, expect }  from 'vitest'
  import { SignJWT, jwtVerify }    from 'jose'
  import { createSNSServer }       from '../sns-websocket-server.js'

  const SECRET_STR = 'test-secret-key-at-least-32-chars!!'
  const SECRET     = new TextEncoder().encode(SECRET_STR)

/**** makeToken — signs a JWT with the given claims for test use ****/

  async function makeToken (sub:string, aud:string, scope:string):Promise<string> {
    return new SignJWT({ sub, aud, scope })
      .setProtectedHeader({ alg:'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now()/1000)+3600)
      .sign(SECRET)
  }

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

  describe('SNS WebSocket Server — Token Issuance', () => {
    const { app } = createSNSServer({ JWTSecret:SECRET_STR })

    it('ST-01: POST /api/token without Authorization returns 401', async () => {
      const Res = await app.request('/api/token', {
        method: 'POST',
        body:   JSON.stringify({ sub:'bob', scope:'read' }),
        headers:{ 'Content-Type':'application/json' },
      })
      expect(Res.status).toBe(401)
    })

    it('ST-02: POST /api/token with write-scope token returns 403', async () => {
      const Token = await makeToken('alice', 'store-1', 'write')
      const Res   = await app.request('/api/token', {
        method: 'POST',
        body:   JSON.stringify({ sub:'bob', scope:'read' }),
        headers:{
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      })
      expect(Res.status).toBe(403)
    })

    it('ST-03: POST /api/token with admin token returns 200 + JWT', async () => {
      const AdminToken = await makeToken('alice', 'store-1', 'admin')
      const Res        = await app.request('/api/token', {
        method: 'POST',
        body:   JSON.stringify({ sub:'bob', scope:'read', exp:'1h' }),
        headers:{
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${AdminToken}`,
        },
      })
      expect(Res.status).toBe(200)
      const Body = await Res.json()
      expect(typeof Body.token).toBe('string')
    })

    it('ST-04: issued token is a valid JWT verifiable with same secret', async () => {
      const AdminToken = await makeToken('alice', 'store-1', 'admin')
      const Res        = await app.request('/api/token', {
        method: 'POST',
        body:   JSON.stringify({ sub:'carol', scope:'write', exp:'2h' }),
        headers:{
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${AdminToken}`,
        },
      })
      const { token } = await Res.json()
      const { payload } = await jwtVerify(token, SECRET, { algorithms:['HS256'] })
      expect(payload.sub).toBe('carol')
      expect(payload.aud).toBe('store-1')
      expect((payload as any).scope).toBe('write')
    })
  })
