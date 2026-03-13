# Test Plan — `@rozek/sds-sync-engine`

---

## Goal

Verify that `SDS_SyncEngine` correctly coordinates `SDS_DataStore` with persistence, network, and presence providers across its full lifecycle.

---

## Scope

**In scope:**
- Construction with optional providers and lifecycle (`start()` / `stop()`)
- Local restore from persisted snapshot and patches on `start()`
- Outgoing patch persistence (`appendPatch`) and network send (`sendPatch`)
- Checkpoint trigger when accumulated patch bytes exceed the 512 KiB threshold
- Incoming network patch application to the store
- Offline queue flush on reconnect
- `connectTo()` / `reconnect()` error handling
- Presence broadcast (`setPresenceTo`) and incoming remote state
- `onPresenceChange` handler registration and peer timeout

**Out of scope:**
- Real network connections (unit tests use mocks)
- BroadcastChannel (browser-only; tested separately in integration)

---

## Test Environment

- **Runtime:** Node.js 22+
- **Mocks:** Vitest mock functions for all providers
- **Test framework:** Vitest 2

---

## Part I — Lifecycle

### 1. Construction and start/stop

#### 1.1 Basic construction

- **TC-1.1.1** — Constructing `SDS_SyncEngine` without any options succeeds, and `PeerId` is a non-empty string

#### 1.2 Start with no providers

- **TC-1.2.1** — `start()` with no persistence or network provider resolves without throwing

#### 1.3 Stop calls provider teardown

- **TC-1.3.1** — After `start()` and `stop()`, `persistence.close()` and `network.disconnect()` have each been called exactly once

#### 1.4 Stop always checkpoints

- **TC-1.4.1** — After `stop()` with no local changes (AccumulatedBytes stays 0), `persistence.saveSnapshot()` and `persistence.close()` are still called

---

## Part II — Persistence

### 1. Restore on start

#### 1.1 Patch replay from persistence

- **TC-2.1.1** — `start()` calls `loadPatchesSince` and applies the returned patches to the store, making previously created items accessible by Id and label

### 2. Outgoing patch recording

#### 2.1 Append on store change

- **TC-2.2.1** — A store change after `start()` causes `appendPatch` to be called once with a non-empty `Uint8Array` payload and a positive monotonically increasing clock value

### 3. Checkpoint on threshold

#### 3.1 In-flight checkpoint (offline engine)

- **TC-3.1.1** — Accumulating more than 512 KiB of patch data triggers `saveSnapshot` without waiting for `stop()`; for offline engines (no `NetworkProvider`) `prunePatches` is NOT called so that patches survive for a future `store sync` upload

### 4. Stop-time checkpoint

#### 4.1 Checkpoint on stop

- **TC-4.1.1** — After a small store change (below the in-flight threshold), `stop()` on an offline engine triggers `saveSnapshot` and `close()` but does NOT call `prunePatches` (patches must be preserved for a future `store sync` run)
- **TC-4.1.2** — After only remote patches are applied (no local changes, AccumulatedBytes stays 0), `stop()` on a network engine still triggers `saveSnapshot` and `prunePatches`; the resulting snapshot binary contains the remotely patched data (regression test for bootstrap-on-new-machine bug)

### 5. Offline vs network pruning

#### 5.1 Pruning distinction

- **TC-5.1.1** — Offline engines (no `NetworkProvider`) never call `prunePatches` on any checkpoint (in-flight or stop-time), ensuring SQLite patches are available for a subsequent `store sync`
- **TC-5.1.2** — Network engines (with `NetworkProvider`) do call `prunePatches` on checkpoint, since patches are already forwarded to the server in real time

---

## Part III — Network

### 1. Error handling

#### 1.1 connectTo without provider

- **TC-3.1.1** — `connectTo()` when no `NetworkProvider` is configured rejects with an `SDS_Error` whose `Code` is `'no-network-provider'`

#### 1.2 Reconnect without prior connect

- **TC-3.2.1** — `reconnect()` before any successful `connectTo()` rejects with an `SDS_Error` whose `Code` is `'not-yet-connected'`

### 2. Outgoing patch dispatch

#### 2.1 Send when connected

- **TC-3.3.1** — When the network connection state transitions to `'connected'`, a subsequent store change causes `network.sendPatch` to be called

#### 2.2 Offline queue flush

- **TC-3.4.1** — A store change made while disconnected does not call `sendPatch`; once the connection transitions to `'connected'`, the queued patch is flushed and `sendPatch` is called exactly once

### 3. Incoming patch application

#### 3.1 Remote patch applied to store

- **TC-3.5.1** — An incoming network patch delivered via the `onPatch` callback is applied to the store, making the patched data's label readable

---

## Part IV — Sync Request

When a peer connects (or reconnects) it broadcasts a `MSG_SYNC_REQUEST` carrying its current CRDT cursor. Every other connected peer that receives the request responds after a random delay (50–300 ms) by sending a full-state `exportPatch()` via `sendPatch()`. The random delay avoids a thundering-herd problem when many peers are online. Because cross-peer cursors are not portable across all backends (json-joy uses a local patch index), the response always contains the full CRDT state; CRDT idempotent merge makes duplicate data harmless.

### 1. Outgoing sync request on connect

#### 1.1 Automatic request after connection

- **TC-SR-1** — When the network connection transitions to `'connected'`, the engine immediately calls `sendSyncRequest(Store.currentCursor)` so that existing peers can provide their state

### 2. Incoming sync request handling

#### 2.1 Full-state response with random delay

- **TC-SR-2** — When the engine receives a sync request via `onSyncRequest`, it waits a random delay (50–300 ms) and then calls `sendPatch()` with the full CRDT state from `Store.exportPatch()`

### 3. Cleanup

#### 3.1 Timer cleanup on stop

- **TC-SR-3** — If a sync-response timer is pending when `stop()` is called, the timer is cleared and no delayed `sendPatch()` fires

---

## Part V — Presence

### 1. Outgoing presence

#### 1.1 Local state broadcast

- **TC-4.1.1** — `setPresenceTo(state)` calls `presence.sendLocalState` with the exact same state object
- **TC-4.1.2** — `setPresenceTo({ custom: {...} })` passes the `custom` field through to `presence.sendLocalState`

#### 1.2 Local presence change event

- **TC-4.2.1** — `setPresenceTo(state)` causes every registered `onPresenceChange` handler to be called with the engine's own `PeerId`, the state, and the string `'local'`

### 2. Incoming presence

#### 2.1 Remote presence change event

- **TC-4.3.1** — An incoming remote state delivered via `onRemoteState` causes every registered `onPresenceChange` handler to be called with the remote peer Id, the state, and the string `'remote'`

#### 2.2 Peer timeout

- **TC-4.4.1** — After a remote peer's state is received and the configured `PresenceTimeoutMs` elapses without a refresh, `onPresenceChange` is called with the peer Id and `undefined` state, signalling departure

---

## Running the Tests

```bash
cd packages/sync-engine
pnpm test:run
```
