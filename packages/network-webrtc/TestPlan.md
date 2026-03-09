# Test Plan — `@rozek/sds-network-webrtc`

---

## Goal

Verify that `SDS_WebRTCProvider` correctly handles construction, exposes its initial state, and falls back to `SDS_WebSocketProvider` when WebRTC signalling fails or is unavailable.

---

## Scope

**In scope:**
- Construction (`StoreId`, `ICEServers` option, `Fallback` option)
- Initial connection state and empty peer set
- Fallback activation when signalling fails — `Fallback.connect()` is called and `sendPatch` is delegated

**Out of scope:**
- Real WebRTC peer connections (unit tests mock `RTCPeerConnection`)
- Full signalling handshake and data channel frame dispatch (require a real browser or polyfill)
- Browser environment (these tests run in Node.js with minimal mocks)

---

## Test Environment

- **Runtime:** Node.js 22+ with `RTCPeerConnection` stubbed
- **Test framework:** Vitest 2

---

## Part I — Construction

### 1. Initial state

#### 1.1 ConnectionState and PeerSet on construction

- **TC-1.1.1** — `ConnectionState` equals `'disconnected'` and `PeerSet` is empty immediately after construction

---

## Part II — Fallback Behaviour

### 1. Fallback provider activation

#### 1.1 Fallback connect on signalling error

- **TC-2.1.1** — When the signalling WebSocket emits an error, `Fallback.connect()` is called with a URL that uses the `/ws/` WebSocket path

#### 1.2 Delegation after fallback

- **TC-2.2.1** — After fallback activation, `sendPatch()` delegates to the `Fallback` provider rather than the WebRTC data channel

---

## Running the Tests

```bash
cd packages/network-webrtc
pnpm test:run
```
