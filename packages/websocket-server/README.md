# @rozek/sns-websocket-server

The relay server for the **shareable-notes-store** (SNS) family. A [Hono](https://hono.dev)-based WebSocket server that:

- authenticates clients with JWT (HS256)
- relays CRDT patches between connected peers
- enforces scope-based access control (read / write / admin)
- optionally persists patches and snapshots to per-store SQLite databases so late-joining clients can catch up without needing another peer online
- provides a WebRTC signalling relay
- issues short-lived access tokens via an admin API

Runs on Node.js 18+ using `@hono/node-server`.

---

## Installation

**Relay-only mode** (no persistence — default):

```bash
pnpm add @rozek/sns-websocket-server
```

**With SQLite persistence** (requires `better-sqlite3`, a native addon that is compiled on install or fetched as a pre-built binary):

```bash
pnpm add @rozek/sns-websocket-server @rozek/sns-persistence-node better-sqlite3
```

`better-sqlite3` and `@rozek/sns-persistence-node` are optional dependencies: the server loads them lazily only when `PersistDir` / `SNS_PERSIST_DIR` is set. In relay-only mode neither package needs to be installed.

---

## Quick start

### Minimal server

```typescript
import { createSNSServer } from '@rozek/sns-websocket-server'
import { serve }           from '@hono/node-server'

const { app:app } = createSNSServer({ JWTSecret:'your-secret-at-least-32-chars' })

serve({ fetch:app.fetch, port:3000 }, () => {
  console.log('SNS server listening on http://localhost:3000')
})
```

### With environment variables

```bash
SNS_JWT_SECRET=your-secret-at-least-32-chars \
SNS_PORT=3000 \
SNS_HOST=0.0.0.0 \
node server.js
```

---

## API Reference

### `createSNSServer`

```typescript
function createSNSServer(Options?: Partial<SNS_ServerOptions>):{ app:Hono }
```

Returns the configured Hono application. Pass `app.fetch` to `@hono/node-server`'s `serve()`.

#### `SNS_ServerOptions`

```typescript
interface SNS_ServerOptions {
  JWTSecret:   string  // HMAC-SHA256 signing secret (required, min 32 chars recommended)
  Issuer?:     string  // JWT iss claim to validate (optional)
  Port?:       number  // TCP port (default: 3000; also read from SNS_PORT)
  Host?:       string  // Bind address (default: 127.0.0.1; also read from SNS_HOST)
  PersistDir?: string  // Directory for per-store SQLite databases; omit for relay-only mode
}
```

Options take priority over environment variables. When `PersistDir` (or the `SNS_PERSIST_DIR` environment variable) is set, the server opens one SQLite database per store in that directory and:

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
wss://my-server.example.com/ws/my-notes?token=<jwt>
```

**JWT claims:**

| Claim | Required | Description |
| --- | --- | --- |
| `sub` | yes | Subject (user identifier) |
| `aud` | yes | must match `:storeId` |
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

Relays JSON signalling messages (SDP offers/answers, ICE candidates) between peers for WebRTC connection setup. Used by `@rozek/sns-network-webrtc`.

**Authentication:** same JWT `?token=` parameter as the sync endpoint.

```
wss://my-server.example.com/signal/my-notes?token=<jwt>
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
  "aud":   "my-notes",
  "scope": "write",
  "exp":   "1h"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `sub` | yes | subject (user identifier) |
| `aud` | yes | audience (store ID) |
| `scope` | yes | `'read'`, `'write'`, or `'admin'` |
| `exp` | no | expiry in [zeit/ms](https://github.com/vercel/ms) format, e.g. `'1h'`, `'7d'` |

**Response (200):**

```json
{ "token":"<signed-jwt>" }
```

**Errors:** `401` if no or invalid `Authorization` header; `403` if the token scope is not `'admin'`.

---

### Internal helpers (exported for testing)

```typescript
// per-store client registry
class LiveStore {
  constructor(StoreId:string)
  addClient(Client:LiveClient):void
  removeClient(Client:LiveClient):void
  isEmpty():boolean
  broadcast(Data:Uint8Array, Sender:LiveClient):void
}

// returns true if a frame of type `MsgType` must be dropped for read-scope clients
function rejectWriteFrame(MsgType:number):boolean

// client interface expected by LiveStore
interface LiveClient {
  send:(Data:Uint8Array) => void
  scope:'read' | 'write' | 'admin'
}
```

---

## Examples

### Self-contained server with token issuance

```typescript
import { createSNSServer } from '@rozek/sns-websocket-server'
import { serve }           from '@hono/node-server'

const secret = 'super-secret-key-at-least-32-chars!!'

const { app:app } = createSNSServer({ JWTSecret:secret, Port:3000 })

serve({ fetch:app.fetch, port:3000 })

// clients connect to wss://host/ws/<storeId>?token=<jwt>
// admins issue tokens via POST /api/token (authenticated with an admin JWT)
```

### Issuing a token programmatically (e.g. from your auth server)

```typescript
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode('super-secret-key-at-least-32-chars!!')

const token = await new SignJWT({ sub:'alice', aud:'my-notes', scope:'write' })
  .setProtectedHeader({ alg:'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(secret)

// pass this token to the client so it can connect:
// wss://host/ws/my-notes?token=<token>
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

## Wire protocol

The server is protocol-agnostic: it forwards raw binary frames without inspecting the payload (except for the one-byte type prefix used for scope enforcement). The frame format is defined by `@rozek/sns-network-websocket`:

| Byte | Name | Notes |
| --- | --- | --- |
| `0x01` | PATCH | Dropped for read-scope senders |
| `0x02` | VALUE | Dropped for read-scope senders |
| `0x03` | REQ_VALUE | Allowed for all scopes |
| `0x04` | PRESENCE | Allowed for all scopes |
| `0x05` | VALUE_CHUNK | Dropped for read-scope senders |

---

## License

MIT © Andreas Rozek