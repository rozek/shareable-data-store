# @rozek/sds-websocket-server

The relay server for the **shareable-data-store** (SDS) family. A [Hono](https://hono.dev)-based WebSocket server that:

- authenticates clients with JWT (HS256)
- relays CRDT patches between connected peers
- enforces scope-based access control (read / write / admin)
- optionally persists patches and snapshots to per-store SQLite databases so late-joining clients can catch up without needing another peer online
- provides a WebRTC signalling relay
- issues short-lived access tokens via an admin API

Runs on Node.js 18+ using `@hono/node-server`.

You may install the server locally or deploy it using a Docker image (refer to [DEPLOYMENT.md](./DEPLOYMENT.md))

---

## Installation

**Relay-only mode** (no persistence — default):

```bash
pnpm add @rozek/sds-websocket-server
```

**With SQLite persistence** (requires `better-sqlite3`, a native addon that is compiled on install or fetched as a pre-built binary):

```bash
pnpm add @rozek/sds-websocket-server @rozek/sds-persistence-node better-sqlite3
```

`@rozek/sds-persistence-node` is an optional peer dependency: the server loads it lazily only when `PersistDir` / `SDS_PERSIST_DIR` is set. In relay-only mode neither package needs to be installed.

---

## Quick start

### Minimal server

```typescript
import { createSDSServer } from '@rozek/sds-websocket-server'
import { serve }           from '@hono/node-server'

const { app:App } = createSDSServer({ JWTSecret:'your-secret-at-least-32-chars' })

serve({ fetch:App.fetch, port:3000 }, () => {
  console.log('SDS server listening on http://localhost:3000')
})
```

### With environment variables

```bash
SDS_JWT_SECRET=your-secret-at-least-32-chars \
SDS_PORT=3000 \
SDS_HOST=0.0.0.0 \
node server.js
```

---

## API Reference

### `createSDSServer`

```typescript
function createSDSServer (Options?:Partial<SDS_ServerOptions>):{ app:Hono }
```

Returns the configured Hono application. Pass `app.fetch` to `@hono/node-server`'s `serve()`.

#### `SDS_ServerOptions`

```typescript
interface SDS_ServerOptions {
  JWTSecret:   string  // HMAC-SHA256 signing secret (required, min 32 chars recommended)
  Issuer?:     string  // JWT iss claim to validate (optional)
  Port?:       number  // TCP port (default: 3000; also read from SDS_PORT)
  Host?:       string  // bind address (default: 127.0.0.1; also read from SDS_HOST)
  PersistDir?: string  // directory for per-store SQLite databases; omit for relay-only mode
}
```

Options take priority over environment variables.

#### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `SDS_JWT_SECRET` | *(required)* | HMAC-SHA256 signing secret — must be at least 32 characters |
| `SDS_ISSUER` | *(none)* | expected JWT `iss` claim; omit to skip issuer validation |
| `SDS_PORT` | `3000` | TCP port the server listens on |
| `SDS_HOST` | `127.0.0.1` | bind address (`0.0.0.0` to listen on all interfaces) |
| `SDS_PERSIST_DIR` | *(none)* | directory for per-store SQLite databases; omit for relay-only mode |

When `PersistDir` (or the `SDS_PERSIST_DIR` environment variable) is set, the server opens one SQLite database per store in that directory and:

- replays the stored snapshot and all subsequent patches to every newly connecting client
- persists every incoming PATCH frame
- persists every incoming VALUE frame (or reassembled VALUE_CHUNK sequence) as a new snapshot, then prunes the now-superseded patches

In relay-only mode (no `PersistDir`) the server holds no state between connections.

---

### Endpoints

#### `GET /ws/:StoreId` — CRDT sync WebSocket

Clients connect here to exchange CRDT patches in real time.

**Authentication:** a JWT is required as the `token` query parameter.

```
wss://my-server.example.com/ws/my-store?token=<jwt>
```

**JWT claims:**

| Claim | Required | Description |
| --- | --- | --- |
| `sub` | yes | subject (user identifier) |
| `aud` | yes | must match `:StoreId` |
| `scope` | yes | `'read'`, `'write'`, or `'admin'` |
| `exp` | recommended | expiry timestamp |

**Scope enforcement:**

| Scope | May receive patches | May send patches/values |
| --- | --- | --- |
| `read` | ✓ | ✗ |
| `write` | ✓ | ✓ |
| `admin` | ✓ | ✓ |

Frames sent by `read` clients with types `0x01` (PATCH), `0x02` (VALUE), or `0x05` (VALUE_CHUNK) are silently dropped. Presence frames (`0x04`) and value requests (`0x03`) are allowed for all scopes.

**Relay behaviour:** every incoming frame is forwarded to all other clients connected to the same `:StoreId`. The sender does not receive its own frame.

---

#### `GET /signal/:StoreId` — WebRTC signalling WebSocket

Relays JSON signalling messages (SDP offers/answers, ICE candidates) between peers for WebRTC connection setup. Used by `@rozek/sds-network-webrtc`.

**Authentication:** same JWT `?token=` parameter as the sync endpoint.

```
wss://my-server.example.com/signal/my-store?token=<jwt>
```

Messages are JSON objects with a `to` field. The server forwards each message only to the peer identified by `to`.

---

#### `POST /api/token` — Token issuance (admin only)

Issues a new signed JWT. Requires an `admin`-scope Bearer token in the `Authorization` header.

**Request:**

```http
POST /api/token
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "sub":   "alice",
  "scope": "write",
  "exp":   "1h"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `sub` | yes | subject (user identifier) |
| `scope` | yes | `'read'`, `'write'`, or `'admin'` |
| `exp` | no | expiry in [zeit/ms](https://github.com/vercel/ms) format, e.g. `'1h'`, `'7d'` |

The issued token automatically inherits the store ID (`aud` claim) from the admin token — there is no `aud` field in the request body. An admin token is store-scoped, so it can only issue tokens for its own store.

**Response (200):**

```json
{ "token":"<signed-jwt>" }
```

**Errors:** `401` if no or invalid `Authorization` header; `403` if the token scope is not `'admin'`.

---

### Internal Helpers (exported for Testing)

```typescript
// per-store client registry
class LiveStore {
  constructor (StoreId:string)
  addClient (Client:LiveClient):void
  removeClient (Client:LiveClient):void
  isEmpty ():boolean
  broadcast (Data:Uint8Array, Sender:LiveClient):void
}

// returns true if a frame of type `MsgType` must be dropped for read-scope clients
function rejectWriteFrame (MsgType:number):boolean

// client interface expected by LiveStore
interface LiveClient {
  send:(Data:Uint8Array) => void
  scope:'read' | 'write' | 'admin'
}
```

---

## Examples

### Self-contained Server with Token Issuance

```typescript
import { createSDSServer } from '@rozek/sds-websocket-server'
import { serve }           from '@hono/node-server'

const Secret = 'super-secret-key-at-least-32-chars!!'

const { app:App } = createSDSServer({ JWTSecret:secret, Port:3000 })

serve({ fetch:App.fetch, Port:3000 })

// clients connect to wss://host/ws/<storeId>?token=<jwt>
// admins issue tokens via POST /api/token (authenticated with an admin JWT)
```

### Issuing a Token programmatically (e.g. from your Auth Server)

```typescript
import { SignJWT } from 'jose'

const Secret = new TextEncoder().encode('super-secret-key-at-least-32-chars!!')

const Token = await new SignJWT({ sub:'alice', aud:'my-store', scope:'write' })
  .setProtectedHeader({ alg:'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(Secret)

// pass this token to the client so it can connect:
// wss://host/ws/my-store?token=<Token>
```

### Behind a Reverse Proxy (Caddy / nginx)

The server binds to `127.0.0.1:3000` by default. Point your reverse proxy at that address and handle TLS termination there:

```
# Caddyfile example
my-server.example.com {
  reverse_proxy /ws/*     localhost:3000
  reverse_proxy /signal/* localhost:3000
  reverse_proxy /api/*    localhost:3000
}
```

---

## Deployment

For production use — Docker + Caddy, bare Node.js (relay-only or with SQLite persistence), backup and restore, operations, and security hardening — refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

It covers four ready-to-use setups:

- **A1 (recommended):** Docker + Caddy + pre-built image from GHCR — no compilation, automatic TLS, works on servers with as little as 1 GB RAM
- **A2:** Docker + Caddy + build on server — for teams that prefer to build the image locally
- **B1:** bare Node.js, relay-only — smallest possible footprint, no native addons
- **B2 / B3:** bare Node.js + SQLite persistence via pre-built binary or tarball

---

## Wire Protocol

The server is protocol-agnostic: it forwards raw binary frames without inspecting the payload (except for the one-byte type prefix used for scope enforcement). The frame format is defined by `@rozek/sds-network-websocket`:

| Byte | Name | Description |
| --- | --- | --- |
| `0x01` | PATCH | Dropped for read-scope senders |
| `0x02` | VALUE | Dropped for read-scope senders |
| `0x03` | REQ_VALUE | Allowed for all scopes |
| `0x04` | PRESENCE | Allowed for all scopes |
| `0x05` | VALUE_CHUNK | Dropped for read-scope senders |

---

## License

MIT © Andreas Rozek