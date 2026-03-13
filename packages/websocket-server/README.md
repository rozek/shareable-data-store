# @rozek/sds-websocket-server

The relay server for the **shareable-data-store** (SDS) family. A [Hono](https://hono.dev)-based WebSocket server that:

- authenticates clients with JWT (HS256)
- relays CRDT patches between connected peers
- enforces scope-based access control (read / write / admin)
- provides a WebRTC signalling relay
- issues short-lived access tokens via an admin API

The server is **relay-only**: it holds no store state between connections. Use a [`@rozek/sds-sidecar-*`](../sds-sidecar-jj/README.md) daemon alongside the relay to keep a persistent local copy of any store.

> **Important — sync requires an online peer:** Because the relay server holds no state, a `sds store sync` invocation can only receive remote data if at least one other peer (e.g. a `sds-sidecar-*` daemon) is **connected to the same relay at the same time**. If the other peer is offline when `sync` runs, the syncing client will see an empty store.

Runs on Node.js 22.5+ using `@hono/node-server`.

You may install the server locally or deploy it using a Docker image (refer to [DEPLOYMENT.md](./DEPLOYMENT.md))

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required. Download from [nodejs.org](https://nodejs.org). |

There are no runtime dependencies beyond `@hono/node-server`.

---

## Installation

```bash
pnpm add @rozek/sds-websocket-server
```

---

## Quick start

### Minimal server

```typescript
import { createSDSServer } from '@rozek/sds-websocket-server'

const { start } = createSDSServer({ JWTSecret:'your-secret-at-least-32-chars', Port:3000 })
start()
```

> **Important:** Always use the `start()` helper rather than calling `@hono/node-server`'s `serve()` directly. `start()` also calls `injectWebSocket()` internally, which is required for WebSocket upgrades to work. Skipping `injectWebSocket()` will cause all WebSocket connections to silently fail.

### With environment variables

```bash
SDS_JWT_SECRET=your-secret-at-least-32-chars \
SDS_PORT=3000 \
SDS_HOST=0.0.0.0 \
node server.js
```

---

## API reference

### `createSDSServer`

```typescript
function createSDSServer (Options?:Partial<SDS_ServerOptions>):{ app:Hono, start:() => void }
```

Returns the configured Hono application and a convenience `start()` function. Pass `app.fetch` to `@hono/node-server`'s `serve()`, or call `start()` to let the server bind to the configured `Port` and `Host` automatically.

#### `SDS_ServerOptions`

```typescript
interface SDS_ServerOptions {
  JWTSecret: string  // HMAC-SHA256 signing secret (required, min 32 chars)
  Issuer?:   string  // JWT iss claim to validate (optional)
  Port?:     number  // TCP port (default: 3000; also read from SDS_PORT)
  Host?:     string  // bind address (default: 127.0.0.1; also read from SDS_HOST)
}
```

Options take priority over environment variables.

#### Environment variables

| variable | default | description |
| --- | --- | --- |
| `SDS_JWT_SECRET` | *(required)* | HMAC-SHA256 signing secret — must be at least 32 characters |
| `SDS_ISSUER` | *(none)* | expected JWT `iss` claim; omit to skip issuer validation |
| `SDS_PORT` | `3000` | TCP port the server listens on |
| `SDS_HOST` | `127.0.0.1` | bind address (`0.0.0.0` to listen on all interfaces) |

---

### Endpoints

#### `GET /ws/:StoreId` — CRDT sync WebSocket

Clients connect here to exchange CRDT patches in real time.

**Authentication:** a JWT is required as the `token` query parameter.

```
wss://my-server.example.com/ws/my-store?token=<jwt>
```

**JWT claims:**

| claim | required | description |
| --- | --- | --- |
| `sub` | yes | subject (user identifier) |
| `aud` | yes | must match `:StoreId` |
| `scope` | yes | `'read'`, `'write'`, or `'admin'` |
| `exp` | recommended | expiry timestamp |

**JWT error handling:**

| condition | behaviour |
| --- | --- |
| Missing, malformed, expired, or otherwise invalid token | WebSocket upgrade is accepted; connection is immediately closed with code **4001** (`Unauthorized`) |
| Valid token but `aud` does not match `:StoreId` | WebSocket upgrade is accepted; connection is immediately closed with code **4003** (`Forbidden`) |

The upgrade is always accepted before the close is sent because Hono's WebSocket adapter requires an `onOpen` handler to issue the close frame — the HTTP-level handshake completes first in every case.

**Scope enforcement:**

| scope | may receive patches | may send patches/values |
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

**JWT error handling:** identical to the sync endpoint — invalid or mismatched token closes the connection with code **4001** or **4003** respectively.

Messages can be binary or text. The server broadcasts each message to all other peers connected to the same `:StoreId` — targeted delivery is not enforced by the server; clients use the message content (e.g. a `to` field) to decide which messages to act on.

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

| field | required | description |
| --- | --- | --- |
| `sub` | yes | subject (user identifier) |
| `scope` | yes | `'read'`, `'write'`, or `'admin'` |
| `exp` | no | expiry in [zeit/ms](https://github.com/vercel/ms) format, e.g. `'1h'`, `'7d'` |

The issued token automatically inherits the store ID (`aud` claim) from the admin token — there is no `aud` field in the request body. An admin token is store-scoped, so it can only issue tokens for its own store.

**Response (200):**

```json
{ "token":"<signed-jwt>" }
```

**Errors:**

| status | body | condition |
| --- | --- | --- |
| `400` | `{ "error": "invalid JSON body" }` | request body cannot be parsed as JSON |
| `401` | `{ "error": "missing token" }` | no `Authorization` header |
| `401` | `{ "error": "invalid token" }` | token is malformed, expired, has wrong signature, etc. |
| `403` | `{ "error": "admin scope required" }` | token is valid but `scope` is not `'admin'` |

---

### Internal helpers (exported for testing)

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

## Persistent sync peer

The relay server itself holds no store state. To keep a persistent local copy and fire webhooks on changes, run a `@rozek/sds-sidecar-*` daemon alongside the relay:

```bash
# json-joy backend
sds-sidecar-jj wss://relay.example.com my-store \
  --token "$SDS_TOKEN" \
  --on change

# Loro backend
sds-sidecar-loro wss://relay.example.com my-store \
  --token "$SDS_TOKEN" \
  --on change

# Y.js backend
sds-sidecar-yjs wss://relay.example.com my-store \
  --token "$SDS_TOKEN" \
  --on change
```

All clients connected to the same relay — including the sidecar — must use the **same CRDT backend**. Mixing backends causes silent data corruption.

---

## Examples

### Self-contained server with token issuance

```typescript
import { createSDSServer } from '@rozek/sds-websocket-server'

const Secret = 'super-secret-key-at-least-32-chars!!'

const { start } = createSDSServer({ JWTSecret:Secret, Port:3000 })
start()

// clients connect to wss://host/ws/<storeId>?token=<jwt>
// admins issue tokens via POST /api/token (authenticated with an admin JWT)
```

### Issuing a token programmatically (e.g. from your auth server)

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

### Behind a reverse proxy (Caddy / nginx)

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

For production use — Docker + Caddy, bare Node.js, security hardening — refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Wire protocol

The server is protocol-agnostic: it forwards raw binary frames without inspecting the payload (except for the one-byte type prefix used for scope enforcement). The frame format is defined by `@rozek/sds-network-websocket`:

| byte | name | description |
| --- | --- | --- |
| `0x01` | PATCH | dropped for read-scope senders |
| `0x02` | VALUE | dropped for read-scope senders |
| `0x03` | REQ_VALUE | allowed for all scopes |
| `0x04` | PRESENCE | allowed for all scopes |
| `0x05` | VALUE_CHUNK | dropped for read-scope senders |

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek
