/*******************************************************************************
*                                                                              *
*                          SDS WebSocket Server                                *
*                                                                              *
*******************************************************************************/

// Hono + @hono/node-server + @hono/node-ws WebSocket server.
// Provides:
//   GET /ws/:storeId       — CRDT sync + presence (WebSocket upgrade)
//   GET /signal/:storeId   — WebRTC signalling (WebSocket upgrade)
//   POST /api/token        — token issuance (admin scope only)
//
// JWT authentication: HS256 via jose
// Relay-only: no persistence — use sds-sidecar-* for a persisting peer
//
// Environment variables:
//   SDS_JWT_SECRET   — HMAC-SHA256 secret (required)
//   SDS_ISSUER       — JWT iss value to validate (optional)
//   SDS_PORT         — listen port (default 3000)
//   SDS_HOST         — bind host (default 127.0.0.1)

import { Hono }                            from 'hono'
import { serve }                           from '@hono/node-server'
import { createNodeWebSocket }             from '@hono/node-ws'
import { SignJWT, jwtVerify }              from 'jose'
import type { WSContext }                  from 'hono/ws'

//----------------------------------------------------------------------------//
//                              Frame type bytes                              //
//----------------------------------------------------------------------------//

  const MSG_PATCH       = 0x01
  const MSG_VALUE       = 0x02
  const MSG_PRESENCE    = 0x04
  const MSG_VALUE_CHUNK = 0x05

//----------------------------------------------------------------------------//
//                                 LiveStore                                  //
//----------------------------------------------------------------------------//

  type SendFn = (Data:Uint8Array) => void

  export interface LiveClient {
    send:  SendFn
    scope: 'read' | 'write' | 'admin'
  }

  export class LiveStore {
    readonly StoreId:string
    #Clients:Set<LiveClient> = new Set()

    constructor (StoreId:string) {
      this.StoreId = StoreId
    }

  /**** addClient ****/

    addClient (Client:LiveClient):void { this.#Clients.add(Client) }

  /**** removeClient ****/

    removeClient (Client:LiveClient):void { this.#Clients.delete(Client) }

  /**** isEmpty ****/

    isEmpty ():boolean { return this.#Clients.size === 0 }

  /**** broadcast — sends Data to all clients in this store except Sender ****/

    broadcast (Data:Uint8Array, Sender:LiveClient):void {
      for (const Client of this.#Clients) {
        if (Client === Sender) { continue }
        try { Client.send(Data) } catch (_Signal) {}
      }
    }
  }

//----------------------------------------------------------------------------//
//                               Store Registry                               //
//----------------------------------------------------------------------------//

  const StoreRegistry = new Map<string,LiveStore>()

/**** StoreWithId — returns the LiveStore for StoreId, creating one if it does not exist ****/

  function StoreWithId (StoreId:string):LiveStore {
    let Store = StoreRegistry.get(StoreId)
    if (Store == null) {
      Store = new LiveStore(StoreId)
      StoreRegistry.set(StoreId, Store)
    }
    return Store
  }

/**** cleanupStore — removes a client from its store and deletes the store when empty ****/

  function cleanupStore (StoreId:string, Client:LiveClient):void {
    const Store = StoreRegistry.get(StoreId)
    if (Store == null) { return }
    Store.removeClient(Client)
    if (Store.isEmpty()) { StoreRegistry.delete(StoreId) }
  }

//----------------------------------------------------------------------------//
//                               JWT utilities                                //
//----------------------------------------------------------------------------//

  interface SDSClaims {
    sub:   string
    aud:   string
    scope: 'read' | 'write' | 'admin'
    iss?:  string
  }

/**** verifyToken — verifies a JWT and returns its SDS claims; throws on invalid tokens ****/

  async function verifyToken (
    Token:string, Secret:Uint8Array, ExpectedIssuer?:string
  ):Promise<SDSClaims> {
    const { payload:Payload } = await jwtVerify(Token, Secret, {
      algorithms: ['HS256'],
      ...(ExpectedIssuer != null ? { issuer:ExpectedIssuer } : {}),
    })
    if (typeof Payload.sub !== 'string' || typeof Payload.aud !== 'string') {
      throw new TypeError('JWT is missing required claims (sub, aud)')
    }
    const Scope = (Payload as Record<string,unknown>)['scope'] as string
    if (Scope !== 'read' && Scope !== 'write' && Scope !== 'admin') {
      throw new TypeError(`JWT scope '${Scope}' is invalid — must be 'read', 'write', or 'admin'`)
    }
    return {
      sub:   Payload.sub,
      aud:   Payload.aud as string,
      scope: Scope,
      iss:   Payload.iss,
    }
  }

/**** issueToken — signs and returns a new HS256 JWT with the given claims ****/

  async function issueToken (
    Secret:Uint8Array,
    Sub:string, Aud:string, Scope:string,
    ExpMs:number, Issuer?:string
  ):Promise<string> {
    const Builder = new SignJWT({ sub:Sub, aud:Aud, scope:Scope })
      .setProtectedHeader({ alg:'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now()/1000)+Math.round(ExpMs/1000))
    if (Issuer != null) { Builder.setIssuer(Issuer) }
    return Builder.sign(Secret)
  }

//----------------------------------------------------------------------------//
//                           Frame write / dispatch                           //
//----------------------------------------------------------------------------//

/**** rejectWriteFrame — returns true for message types that only write-scope clients may send ****/

  export function rejectWriteFrame (MsgType:number):boolean {
    return MsgType === MSG_PATCH || MsgType === MSG_VALUE || MsgType === MSG_VALUE_CHUNK
  }

//----------------------------------------------------------------------------//
//                                    App                                     //
//----------------------------------------------------------------------------//

  export interface SDS_ServerOptions {
    JWTSecret: string
    Issuer?:   string
    Port?:     number
    Host?:     string
  }

/**** createSDSServer — creates the Hono app with /ws, /signal and /api/token routes; returns { app, start } ****/

  export function createSDSServer (Options?:Partial<SDS_ServerOptions>) {
    const JWTSecretStr = Options?.JWTSecret ?? process.env['SDS_JWT_SECRET'] ?? ''
    const Issuer       = Options?.Issuer    || process.env['SDS_ISSUER'] || undefined
    const Port         = Options?.Port      ?? parseInt(process.env['SDS_PORT'] ?? '3000', 10)
    const Host         = Options?.Host      ?? process.env['SDS_HOST'] ?? '127.0.0.1'

    if (JWTSecretStr.length === 0) {
      throw new TypeError(
        'SDS_JWT_SECRET is required (set via options.JWTSecret or the SDS_JWT_SECRET environment variable)'
      )
    }
    if (JWTSecretStr.length < 32) {
      throw new TypeError(
        'SDS_JWT_SECRET must be at least 32 characters long to provide sufficient entropy for HS256'
      )
    }
    const Secret = new TextEncoder().encode(JWTSecretStr)

    const App = new Hono()
    const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app:App })

//----------------------------------------------------------------------------//
//                              GET /ws/:storeId                              //
//----------------------------------------------------------------------------//

    App.get('/ws/:storeId', upgradeWebSocket(async (HonoCtx) => {
      const StoreId = HonoCtx.req.param('storeId')
      const Token   = HonoCtx.req.query('token') ?? ''
      let Claims:SDSClaims
      try {
        Claims = await verifyToken(Token, Secret, Issuer)
      } catch (Signal) {
        console.error('[/ws] token rejected:', (Signal as any)?.message ?? Signal)
        return {
          onOpen: (_Event, WS) => { WS.close(4001, 'Unauthorized') },
        }
      }
      if (Claims.aud !== StoreId) {
        return {
          onOpen: (_Event, WS) => { WS.close(4003, 'Forbidden') },
        }
      }

      const Store = StoreWithId(StoreId)
      let WebSocketContext!:WSContext
      const Client:LiveClient = {
        send:  (Data) => { WebSocketContext.send(Data as Uint8Array<ArrayBuffer>) },
        scope: Claims.scope,
      }

      return {
        onOpen: (_Event, WS) => {
          WebSocketContext = WS
          Store.addClient(Client)
        },
        onMessage: (_Event, _WS) => {
          const Data = _Event.data
          if (! (Data instanceof ArrayBuffer)) { return }
          const Frame = new Uint8Array(Data)
          if (Frame.byteLength < 1) { return }
          const MsgType = Frame[0]

          // read-only clients may not send patches or values
          if (Claims.scope === 'read' && rejectWriteFrame(MsgType)) { return }

          // relay to all other clients in the same store
          Store.broadcast(Frame, Client)
        },
        onClose: () => {
          cleanupStore(StoreId, Client)
        },
      }
    }))

//----------------------------------------------------------------------------//
//                            GET /signal/:storeId                            //
//----------------------------------------------------------------------------//

    App.get('/signal/:storeId', upgradeWebSocket(async (HonoCtx) => {
      const StoreId = HonoCtx.req.param('storeId')
      const Token   = HonoCtx.req.query('token') ?? ''
      let Claims:SDSClaims
      try {
        Claims = await verifyToken(Token, Secret, Issuer)
      } catch (Signal) {
        console.error('[/signal] token rejected:', (Signal as any)?.message ?? Signal)
        return {
          onOpen: (_Event, WS) => { WS.close(4001, 'Unauthorized') },
        }
      }
      if (Claims.aud !== StoreId) {
        return {
          onOpen: (_Event, WS) => { WS.close(4003, 'Forbidden') },
        }
      }

      const SignalStore = StoreWithId(`signal:${StoreId}`)
      let WebSocketContext!:WSContext
      const Client:LiveClient = {
        send:  (Data) => { WebSocketContext.send(Data as Uint8Array<ArrayBuffer>) },
        scope: Claims.scope,
      }

      return {
        onOpen: (_Event, WS) => {
          WebSocketContext = WS
          SignalStore.addClient(Client)
        },
        onMessage: (_Event, _WS) => {
          const Data = _Event.data
          switch (true) {
            case (Data instanceof ArrayBuffer):
              SignalStore.broadcast(new Uint8Array(Data), Client)
              break
            case (typeof Data === 'string'): {
              const Bytes = new TextEncoder().encode(Data)
              SignalStore.broadcast(Bytes, Client)
              break
            }
          }
        },
        onClose: () => {
          cleanupStore(`signal:${StoreId}`, Client)
        },
      }
    }))

//----------------------------------------------------------------------------//
//                              POST /api/token                               //
//----------------------------------------------------------------------------//

    App.post('/api/token', async (HonoCtx) => {
      const AuthHeader = HonoCtx.req.header('Authorization') ?? ''
      if (! AuthHeader.startsWith('Bearer ')) {
        return HonoCtx.json({ error:'missing token' }, 401)
      }
      const AdminToken = AuthHeader.slice(7)
      let AdminClaims:SDSClaims
      try {
        AdminClaims = await verifyToken(AdminToken, Secret, Issuer)
      } catch (Signal) {
        console.error('[POST /api/token] token rejected:', (Signal as any)?.message ?? Signal)
        return HonoCtx.json({ error:'invalid token' }, 401)
      }
      if (AdminClaims.scope !== 'admin') {
        return HonoCtx.json({ error:'admin scope required' }, 403)
      }

      let Body:{ sub:string; scope:string; exp?:string }
      try {
        Body = await HonoCtx.req.json()
      } catch (_Signal) {
        return HonoCtx.json({ error:'invalid JSON body' }, 400)
      }
      if (typeof Body.sub !== 'string' || typeof Body.scope !== 'string') {
        return HonoCtx.json({ error:'sub and scope required' }, 400)
      }

      const ExpMs    = parseExpiry(Body.exp ?? '24h')
      const newToken = await issueToken(
        Secret, Body.sub, AdminClaims.aud, Body.scope, ExpMs, Issuer
      )
      return HonoCtx.json({ token:newToken })
    })

  /**** start ****/

    function start ():void {
      const Server = serve({ fetch:App.fetch, port:Port, hostname:Host })
      injectWebSocket(Server)
    }

    return { app:App, start }
  }

//----------------------------------------------------------------------------//
//                               Expiry Parser                                //
//----------------------------------------------------------------------------//

/**** parseExpiry — parses a human-readable expiry string like '24h' into milliseconds ****/

  function parseExpiry (Exp:string):number {
    const Match = /^(\d+)(s|m|h|d)$/.exec(Exp)
    if (Match == null) { return 24*60*60*1000 }

    const Amount = parseInt(Match[1], 10)
    switch (Match[2]) {
      case 's': return Amount*1000
      case 'm': return Amount*60*1000
      case 'h': return Amount*60*60*1000
      case 'd': return Amount*24*60*60*1000
      default:  return 24*60*60*1000
    }
  }

//----------------------------------------------------------------------------//
//                              CLI Entry Point                               //
//----------------------------------------------------------------------------//

  if (process.argv[1]?.endsWith('sds-websocket-server.js')) {
    const { start } = createSDSServer()
    start()
  }
