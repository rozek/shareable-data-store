# Test Plan — `@rozek/sds-websocket-server`

---

## Goal

Verify that the relay-only SDS WebSocket server correctly authenticates clients, relays CRDT frames, enforces scope restrictions, and issues tokens via the admin API.

---

## Scope

**In scope:**
- JWT validation (HS256, `aud`, `scope`, expiry)
- `/ws/:storeId` WebSocket upgrade — missing token, wrong audience, expired token
- Frame relay — PATCH broadcast to all other clients, scope enforcement
- Connection lifecycle — client join, broadcast exclusion of sender, disconnect / cleanup
- `POST /api/token` — no credentials, insufficient scope, admin issuance, issued token verifiability

**Out of scope:**
- TLS / Caddy configuration
- Persistence — the relay server holds no state; persistence is the responsibility of `sds-sidecar-*` packages

---

## Test Environment

- **Runtime:** Node.js 22+
- **HTTP testing:** Hono's built-in `app.request()` + Vitest
- **WebSocket unit testing:** `LiveStore` and `rejectWriteFrame` helpers imported directly
- **Test framework:** Vitest 2

> **Note on WebSocket auth testing:** `createNodeWebSocket` requires a raw Node.js
> socket that is absent from Hono's HTTP test harness, so all `/ws` requests return
> HTTP 500 in unit tests regardless of auth outcome.  Auth rejections (SA-01, SA-04)
> are detected by spying on `console.error` for the `'[/ws] token rejected:'` prefix.
> SA-02 (valid token accepted) is verified by asserting that no such log entry is
> produced.  SA-03 (wrong `aud`) is handled silently at the application level and
> falls back to an HTTP status assertion.

---

## Part I — Authentication

### 1. JWT validation on WebSocket upgrade

#### 1.1 Missing token

- **TC-1.1.1** — A WebSocket upgrade request to `/ws/:storeId` with no `token` query parameter causes the server to log `'[/ws] token rejected:'` (auth rejection detected via `console.error` spy)

#### 1.2 Valid token — happy path

- **TC-1.2.1** — A WebSocket upgrade request with a valid JWT whose `aud` matches `:storeId` does **not** cause the server to log `'[/ws] token rejected:'` (auth passes; in a production WS-capable environment this results in HTTP 101)

#### 1.3 Wrong audience

- **TC-1.3.1** — A valid JWT whose `aud` claim does not match the `:storeId` path parameter is rejected at the application level (returns HTTP ≥ 400)

#### 1.4 Expired token

- **TC-1.4.1** — A JWT with an expiry in the past causes the server to log `'[/ws] token rejected:'` (auth rejection detected via `console.error` spy)

---

## Part II — Frame Relay

### 1. PATCH broadcast

#### 1.1 Relay to other clients

- **TC-2.1.1** — A `PATCH (0x01)` frame broadcast by a write client is forwarded to all other connected clients and is not echoed back to the sender

### 2. Scope enforcement

#### 2.1 Write-type frame rejection for read clients

- **TC-2.2.1** — `rejectWriteFrame()` returns `true` for frame types `0x01` (PATCH), `0x02` (VALUE), and `0x05` (VALUE_CHUNK), and `false` for `0x03` (REQ_VALUE) and `0x04` (PRESENCE)

### 3. Connection lifecycle

#### 3.1 Disconnect and cleanup

- **TC-2.3.1** — Removing all clients from a `LiveStore` causes `isEmpty()` to return `true`, indicating the store entry can be cleaned up

### 4. Presence relay

#### 4.1 PRESENCE frame from any scope

- **TC-2.4.1** — A `PRESENCE (0x04)` frame broadcast by a read client is forwarded to all other clients (write and admin) and is not echoed back to the sender

---

## Part III — Token Issuance

### 1. Access control for `POST /api/token`

#### 1.1 No credentials

- **TC-3.1.1** — `POST /api/token` without an `Authorization` header returns HTTP 401

#### 1.2 Insufficient scope

- **TC-3.2.1** — `POST /api/token` authenticated with a `write`-scope JWT returns HTTP 403

### 2. Successful issuance

#### 2.1 Admin token issues successfully

- **TC-3.3.1** — `POST /api/token` authenticated with an `admin`-scope JWT returns HTTP 200 with a JSON body containing a `token` string

#### 2.2 Issued token is valid

- **TC-3.4.1** — The JWT returned by a successful `POST /api/token` is verifiable with the server's secret and carries the requested `sub`, `aud`, and `scope` claims

---

## Running the Tests

```bash
cd packages/websocket-server
pnpm test:run
```
