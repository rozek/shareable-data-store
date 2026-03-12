# Test Cases — @rozek/sds-websocket-server

## SA — Auth

| # | Description | Expected |
|---|---|---|
| SA-01 | missing token → HTTP upgrade rejected | HTTP status ≥ 400 |
| SA-02 | valid JWT with correct `aud` → WebSocket upgrade accepted | HTTP 101 (connection upgraded) |
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

