# Test Plan — `@rozek/sds-network-websocket`

---

## Goal

Verify that `SDS_WebSocketProvider` correctly implements the binary wire protocol, manages connection state, handles automatic reconnect, and provides the presence API.

---

## Scope

**In scope:**
- Construction and initial state
- Frame encoding — `PATCH (0x01)`, `VALUE (0x02)`, `REQ_VALUE (0x03)`, `PRESENCE (0x04)`, `VALUE_CHUNK (0x05)`
- Outgoing methods — `sendPatch`, `sendValue` (small and chunked), `requestValue`, `sendLocalState`
- Incoming frame dispatch — patch, value, presence, and chunked value reassembly
- Connection state lifecycle — `disconnected → connecting → connected → reconnecting`
- Handler registration and unsubscribe — `onPatch`, `onValue`, `onConnectionChange`, `onRemoteState`
- Presence tracking — `PeerSet` maintained from incoming `PRESENCE` frames

**Out of scope:**
- Real WebSocket server (integration with `@rozek/sds-websocket-server`)
- JWT validation (done server-side)

---

## Test Environment

- **Runtime:** Node.js 22+ (global `WebSocket`)
- **Fake WebSocket:** mock server using the `ws` package
- **Test framework:** Vitest 2

---

## Part I — Construction

### 1. Initial state

#### 1.1 ConnectionState on construction

- **TC-1.1.1** — `ConnectionState` equals `'disconnected'` immediately after construction

---

## Part II — Frame Protocol

### 1. Outgoing frames

#### 1.1 Patch frame

- **TC-2.1.1** — `sendPatch(bytes)` sends a binary frame whose first byte is `0x01` followed by the patch bytes

#### 1.2 Value frame

- **TC-2.2.1** — `sendValue(hash, data)` for small data sends a binary frame whose first byte is `0x02` followed by the 32-byte hash and then the data bytes

#### 1.3 Request-value frame

- **TC-2.3.1** — `requestValue(hash)` sends a binary frame whose first byte is `0x03` followed by the 32-byte hash

#### 1.4 Presence frame

- **TC-2.4.1** — `sendLocalState(state)` sends a binary frame whose first byte is `0x04` followed by the JSON-encoded presence state
- **TC-2.4.2** — `sendLocalState({ custom: {...} })` includes the `custom` field in the JSON payload of the presence frame

#### 1.5 Chunked value reassembly

- **TC-2.5.1** — Multiple incoming `VALUE_CHUNK (0x05)` frames are reassembled and the `onValue` callback is invoked once with the complete data

---

## Part III — Event Dispatch

### 1. Incoming frame callbacks

#### 1.1 Patch and value callbacks

- **TC-3.1.1** — An incoming `0x01` frame causes the `onPatch` callback to be invoked with the frame payload
- **TC-3.1.2** — An incoming `0x02` frame causes the `onValue` callback to be invoked with the hash and data

#### 1.2 Connection state callbacks

- **TC-3.2.1** — `onConnectionChange` fires `'connected'` when the socket opens and `'disconnected'` when it closes cleanly
- **TC-3.2.2** — `onConnectionChange` fires `'reconnecting'` when the socket closes unexpectedly

#### 1.3 Unsubscribe

- **TC-3.3.1** — Calling the function returned by `onPatch()` prevents any further patch callbacks from that handler

#### 1.4 Malformed frames

- **TC-3.4.1** — An incoming frame that is too short to contain a valid type byte is silently ignored without throwing

---

## Part IV — Presence

### 1. PeerSet and remote state

#### 1.1 Initial state and updates

- **TC-4.1.1** — `PeerSet` is empty immediately after construction
- **TC-4.1.2** — An incoming `PRESENCE (0x04)` frame updates `PeerSet` with the peer's state
- **TC-4.1.3** — An incoming `PRESENCE` frame causes the `onRemoteState` callback to be invoked with the parsed state
- **TC-4.1.4** — An incoming `PRESENCE` frame that contains a `custom` field makes that field accessible via `PeerSet.get(peerId)?.custom`

---

## Running the Tests

```bash
cd packages/network-websocket
pnpm test:run
```
