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
// Persistence: optional SQLite (SDS_DesktopPersistenceProvider) per store
//
// Environment variables:
//   SDS_JWT_SECRET   — HMAC-SHA256 secret (required)
//   SDS_ISSUER       — JWT iss value to validate (optional)
//   SDS_PORT         — listen port (default 3000)
//   SDS_HOST         — bind host (default 127.0.0.1)
//   SDS_PERSIST_DIR  — directory for SQLite DBs (optional; omit = relay-only)

import { Hono }                            from 'hono'
import { serve }                           from '@hono/node-server'
import { createNodeWebSocket }             from '@hono/node-ws'
import { SignJWT, jwtVerify }              from 'jose'
import type { WSContext }                  from 'hono/ws'
import type { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import path                                from 'node:path'

//----------------------------------------------------------------------------//
//                              Frame type bytes                              //
//----------------------------------------------------------------------------//

  const MSG_PATCH       = 0x01
  const MSG_VALUE       = 0x02
  const MSG_REQ_VALUE   = 0x03
  const MSG_PRESENCE    = 0x04
  const MSG_VALUE_CHUNK = 0x05

  const HASH_SIZE = 32  // SHA-256 bytes

//----------------------------------------------------------------------------//
//                             Hex / byte helpers                             //
//----------------------------------------------------------------------------//

/**** BytesToHex — converts a Uint8Array to a lowercase hex string ****/

  function BytesToHex (Bytes:Uint8Array):string {
    return Array.from(Bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  }

//----------------------------------------------------------------------------//
//                                 LiveStore                                  //
//----------------------------------------------------------------------------//

type SendFn = (Data:Uint8Array) => void

export interface LiveClient {
  send:  SendFn
  scope: 'read' | 'write' | 'admin'
}

type ChunkBuffer = { Chunks:Map<number,Uint8Array>; Total:number }

export class LiveStore {
  readonly StoreId:string
  #Clients:      Set<LiveClient>                   = new Set()
  #Persistence?: SDS_DesktopPersistenceProvider
  #ChunkBuffers: Map<string,ChunkBuffer>           = new Map()

  constructor (StoreId:string, Persistence?:SDS_DesktopPersistenceProvider) {
    this.StoreId      = StoreId
    this.#Persistence = Persistence
  }

/**** addClient ****/

  addClient (Client:LiveClient):void  { this.#Clients.add(Client)    }

/**** removeClient ****/

  removeClient (Client:LiveClient):void { this.#Clients.delete(Client) }

/**** isEmpty ****/

  isEmpty ():boolean { return this.#Clients.size === 0 }

/**** hasPersistence ****/

  hasPersistence ():boolean { return this.#Persistence != null }

/**** broadcast — sends Data to all clients in this store except Sender ****/

  broadcast (Data:Uint8Array, Sender:LiveClient):void {
    for (const Client of this.#Clients) {
      if (Client === Sender) { continue }
      try { Client.send(Data) } catch (_Signal) {}
    }
  }

/**** replayTo — sends stored snapshot and patches to a newly connected client ****/

  async replayTo (Client:LiveClient):Promise<void> {
    const P = this.#Persistence
    if (P == null) { return }
    const Snapshot = await P.loadSnapshot()
    if (Snapshot != null) {
      const Frame = new Uint8Array(1+Snapshot.byteLength)
        Frame[0] = MSG_VALUE
        Frame.set(Snapshot, 1)
      try { Client.send(Frame) } catch (_Signal) {}
    }
    const Patches = await P.loadPatchesSince(0)
    for (const Patch of Patches) {
      const Frame = new Uint8Array(1+Patch.byteLength)
        Frame[0] = MSG_PATCH
        Frame.set(Patch, 1)
      try { Client.send(Frame) } catch (_Signal) {}
    }
  }

/**** persistPatch — stores a patch payload (bytes after the 0x01 type byte) ****/

  persistPatch (Payload:Uint8Array):void {
    this.#Persistence?.appendPatch(Payload, Date.now()).catch(() => {})
  }

/**** persistValue — stores a value payload (hash + data, bytes after 0x02);
                     prunes all accumulated patches since the value is a full state ****/

  persistValue (Payload:Uint8Array):void {
    const P = this.#Persistence
    if (P == null) { return }
    P.saveSnapshot(Payload)
      .then(() => P.prunePatches(Date.now()+1))
      .catch(() => {})
  }

/**** handleChunk — accumulates VALUE_CHUNK frames; persists the assembled
                    value when all chunks have arrived ****/

  handleChunk (Frame:Uint8Array):void {
    if (Frame.byteLength < 1+HASH_SIZE+8) { return }

    const MAX_BLOB_SIZE = 2*1024*1024*1024  // 2 GB

    const HashBytes = Frame.slice(1, 1+HASH_SIZE)
    const HashHex   = BytesToHex(HashBytes)
    const View      = new DataView(Frame.buffer, Frame.byteOffset+1+HASH_SIZE)
    const Index     = View.getUint32(0, false)
    const Total     = View.getUint32(4, false)
    const Chunk     = Frame.slice(1+HASH_SIZE+8)
    let   Buffer    = this.#ChunkBuffers.get(HashHex)
    if (Buffer == null) {
      Buffer = { Chunks:new Map(), Total }
      this.#ChunkBuffers.set(HashHex, Buffer)
    }
    Buffer.Chunks.set(Index, Chunk)
    if (Buffer.Chunks.size < Buffer.Total) { return }
    this.#ChunkBuffers.delete(HashHex)
    const Parts:Uint8Array[] = []
    for (let i = 0; i < Buffer.Total; i++) {
      const Part = Buffer.Chunks.get(i)
      if (Part != null) { Parts.push(Part) }
    }
    const DataSize = Parts.reduce((Sum, P) => Sum+P.byteLength, 0)
    if (DataSize > MAX_BLOB_SIZE) {
      console.warn(`SDS: blob ${HashHex} rejected — size ${DataSize} exceeds limit of ${MAX_BLOB_SIZE} bytes`)
      return
    }
    const Payload  = new Uint8Array(HASH_SIZE+DataSize)
      Payload.set(HashBytes, 0)
    let Offset = HASH_SIZE
    for (const Part of Parts) { Payload.set(Part, Offset); Offset += Part.byteLength }
    this.persistValue(Payload)
  }

/**** close — closes the underlying SQLite connection ****/

  async close ():Promise<void> {
    await this.#Persistence?.close()
  }
}

//----------------------------------------------------------------------------//
//                               Store Registry                               //
//----------------------------------------------------------------------------//

  const StoreRegistry = new Map<string, LiveStore>()

/**** StoreWithId — returns the LiveStore for StoreId, creating one if it does not exist ****/

  async function StoreWithId (StoreId:string, PersistDir?:string):Promise<LiveStore> {
    let Store = StoreRegistry.get(StoreId)
    if (Store == null) {
      let Persistence: SDS_DesktopPersistenceProvider | undefined
      if (PersistDir != null) {
        const { SDS_DesktopPersistenceProvider:Provider } = await import('@rozek/sds-persistence-node')
        const SafeId = StoreId.replace(/[^a-zA-Z0-9_-]/g, '_')
        const DbPath = path.join(PersistDir, `${SafeId}.db`)
        Persistence  = new Provider(DbPath, StoreId)
      }
      Store = new LiveStore(StoreId, Persistence)
      StoreRegistry.set(StoreId, Store)
    }
    return Store
  }

/**** cleanupStore — removes a client from its store and deletes the store when it becomes empty ****/

  function cleanupStore (StoreId:string, Client:LiveClient):void {
    const Store = StoreRegistry.get(StoreId)
    if (Store == null) { return }
    Store.removeClient(Client)
    if (Store.isEmpty()) {
      StoreRegistry.delete(StoreId)
      Store.close().catch(() => {})
    }
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
    const Scope = (Payload as any).scope as string
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
    JWTSecret:   string
    Issuer?:     string
    Port?:       number
    Host?:       string
    PersistDir?: string
  }

/**** createSDSServer — creates the Hono app with /ws, /signal and /api/token routes; returns { app, start } ****/

export function createSDSServer (Options?:Partial<SDS_ServerOptions>) {
  const JWTSecretStr = Options?.JWTSecret  ?? process.env['SDS_JWT_SECRET'] ?? ''
  const Issuer       = Options?.Issuer     ?? process.env['SDS_ISSUER']
  const Port         = Options?.Port       ?? parseInt(process.env['SDS_PORT'] ?? '3000', 10)
  const Host         = Options?.Host       ?? process.env['SDS_HOST'] ?? '127.0.0.1'
  const PersistDir   = Options?.PersistDir ?? process.env['SDS_PERSIST_DIR']

  if (JWTSecretStr.length === 0) {
    throw new TypeError('SDS_JWT_SECRET is required (set via options.JWTSecret or the SDS_JWT_SECRET environment variable)')
  }
  if (JWTSecretStr.length < 32) {
    throw new TypeError('SDS_JWT_SECRET must be at least 32 characters long to provide sufficient entropy for HS256')
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
    let Claims: SDSClaims
    try {
      Claims = await verifyToken(Token, Secret, Issuer)
    } catch (_Signal) {
      return {
        onOpen: (_Event, WS) => { WS.close(4001, 'Unauthorized') },
      }
    }
    if (Claims.aud !== StoreId) {
      return {
        onOpen: (_Event, WS) => { WS.close(4003, 'Forbidden') },
      }
    }

    const Store:LiveStore = await StoreWithId(StoreId, PersistDir)
    let WebSocketContext!:WSContext
    const Client:LiveClient = {
      send:  (Data) => { WebSocketContext.send(Data as Uint8Array<ArrayBuffer>) },
      scope: Claims.scope,
    }

    return {
      onOpen: (_Event, WS) => {
        WebSocketContext = WS
        Store.addClient(Client)
        if (Store.hasPersistence()) {
          Store.replayTo(Client).catch(() => {})
        }
      },
      onMessage: (_Event, WS) => {
        const Data = _Event.data
        if (! (Data instanceof ArrayBuffer)) { return }
        const Frame = new Uint8Array(Data)
        if (Frame.byteLength < 1) { return }
        const MsgType = Frame[0]

        // read-only clients may not send patches or values
        if (Claims.scope === 'read' && rejectWriteFrame(MsgType)) { return }

        // relay to all other clients in the same store
        Store.broadcast(Frame, Client)

        // persist write frames when a persistence directory is configured
        if (Store.hasPersistence()) {
          switch (true) {
            case (MsgType === MSG_PATCH):
              Store.persistPatch(Frame.slice(1)); break
            case (MsgType === MSG_VALUE):
              Store.persistValue(Frame.slice(1)); break
            case (MsgType === MSG_VALUE_CHUNK):
              Store.handleChunk(Frame); break
          }
        }
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
    } catch (_Signal) {
      return {
        onOpen: (_Event, WS) => { WS.close(4001, 'Unauthorized') },
      }
    }
    if (Claims.aud !== StoreId) {
      return {
        onOpen: (_Event, WS) => { WS.close(4003, 'Forbidden') },
      }
    }

    // signalling: relay all messages to other peers in the same store (no persistence)
    const SignalStore:LiveStore = await StoreWithId(`signal:${StoreId}`)
    let WebSocketContext!:WSContext
    const Client:LiveClient = {
      send:  (Data) => { WebSocketContext.send(Data as Uint8Array<ArrayBuffer>) },
      scope: Claims.scope,
    }

    return {
      onOpen: (_Event, WS) => {
        WebSocketContext  = WS
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
    } catch (_Signal) {
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
