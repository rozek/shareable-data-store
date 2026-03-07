# Test Cases — @rozek/sns-websocket-server

## SA — Auth

| # | Description | Expected |
|---|---|---|
| SA-01 | missing token → HTTP upgrade rejected | HTTP status ≥ 400 |
| SA-03 | valid JWT but `aud` ≠ storeId → HTTP upgrade rejected | HTTP status ≥ 400 |
| SA-04 | expired JWT → HTTP upgrade rejected | HTTP status ≥ 400 |

## SR — Relay

| # | Description | Expected |
|---|---|---|
| SR-01 | PATCH frame from write client relayed to all other clients; sender not included | all others receive the frame; sender does not |
| SR-02 | write-type frame types (PATCH 0x01, VALUE 0x02, VALUE_CHUNK 0x05) are flagged for rejection from read clients; read-allowed types (REQ_VALUE 0x03, PRESENCE 0x04) are not | `rejectWriteFrame()` returns `true` for 0x01/0x02/0x05, `false` for 0x03/0x04 |
| SR-03 | client disconnect cleans up store; empty store detected | `isEmpty()` returns `true` after last client removed |
| SR-04 | PRESENCE frame relayed to all other clients regardless of sender scope | all others receive it; sender does not |

## ST — Token issuance

| # | Description | Expected |
|---|---|---|
| ST-01 | POST /api/token without Authorization → 401 | HTTP 401 |
| ST-02 | POST /api/token with non-admin (write-scope) token → 403 | HTTP 403 |
| ST-03 | POST /api/token with admin token + valid body → returns JWT | HTTP 200 + `{ token }` string |
| ST-04 | issued token is a valid JWT verifiable with same secret; carries correct `sub`, `aud`, `scope` | JWT verifies; claims match request body |

## SP — Persistence

| # | Description | Expected |
|---|---|---|
| SP-01 | `persistPatch([10,20,30])` → `replayTo()` sends one `0x01` frame with payload `[10,20,30]` | 1 frame received; type byte `0x01`; payload matches |
| SP-02 | `persistValue(hash+data)` → `replayTo()` sends one `0x02` frame with that payload | 1 frame received; type byte `0x02`; payload matches |
| SP-03 | `persistPatch()` then `persistValue()` → `replayTo()` sends only the `0x02` frame (patch pruned) | 1 frame received; type byte `0x02` |
| SP-04 | `persistValue()` then `persistPatch()` → `replayTo()` sends `0x02` followed by `0x01` | 2 frames; first `0x02`, second `0x01` with correct payload |
| SP-05 | two VALUE_CHUNK frames (0/2, 1/2) → `handleChunk()` assembles; `replayTo()` sends one `0x02` frame with assembled data | 1 frame; type `0x02`; data is the concatenation of both chunks |
| SP-06 | `persistPatch()`, `close()`, new `LiveStore` with same DB → `replayTo()` returns the patch | 1 frame; type `0x01`; payload matches original patch |
