# Test Plan — `@rozek/sns-websocket-server`

---

## Goal

Verify that the SNS WebSocket server correctly authenticates clients, relays CRDT frames, enforces scope restrictions, and issues tokens via the admin API.

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

---

## Test Environment

- **Runtime:** Node.js 22+
- **HTTP testing:** Hono's built-in `app.request()` + Vitest
- **WebSocket unit testing:** `LiveStore` and `rejectWriteFrame` helpers imported directly
- **Test framework:** Vitest 2

---

## Part I — Authentication

### 1. JWT validation on WebSocket upgrade

#### 1.1 Missing token

- **TC-1.1.1** — A WebSocket upgrade request to `/ws/:storeId` with no `token` query parameter returns HTTP 4xx

#### 1.2 Wrong audience

- **TC-1.2.1** — A valid JWT whose `aud` claim does not match the `:storeId` path parameter is rejected with HTTP 4xx

#### 1.3 Expired token

- **TC-1.3.1** — A JWT with an expiry in the past is rejected with HTTP 4xx

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

## Part IV — Persistence

Persistence is tested via `LiveStore` directly with a real `SNS_DesktopPersistenceProvider`
backed by a temporary SQLite file. Each test gets a fresh `mkdtemp` directory that is
removed in `afterEach`.

### 1. PATCH persistence

#### 1.1 Patch stored and replayed

- **TC-4.1.1** — After `persistPatch()`, a newly connecting client receives the patch payload as a `0x01` frame via `replayTo()`

### 2. VALUE persistence

#### 2.1 Snapshot stored and replayed

- **TC-4.2.1** — After `persistValue()`, a newly connecting client receives the value payload as a `0x02` frame via `replayTo()`

#### 2.2 Patches pruned on VALUE

- **TC-4.2.2** — A PATCH persisted before `persistValue()` is pruned; `replayTo()` sends only the snapshot, not the superseded patch

#### 2.3 Patches after VALUE replayed

- **TC-4.2.3** — A PATCH persisted after `persistValue()` is not pruned; `replayTo()` sends the snapshot followed by the patch

### 3. VALUE_CHUNK reassembly

#### 3.1 Chunks assembled and persisted as snapshot

- **TC-4.3.1** — Two VALUE_CHUNK frames for the same hash (chunk 0/2, chunk 1/2) are assembled by `handleChunk()`; `replayTo()` sends the assembled value as a `0x02` frame

### 4. Store close / reopen

#### 4.1 Data survives store close

- **TC-4.4.1** — After `close()`, creating a new `LiveStore` with the same SQLite file and calling `replayTo()` returns the previously persisted patches

---

## Running the Tests

```bash
cd packages/websocket-server
pnpm test:run
```
