# Test Cases — `@rozek/sds-mcp-server`

> **Note — integration tests:** all MCP tool integration tests (LT, SI, SP, SY, SD, SE, EC, EG, EL, EU, EV, ED, TL, TA, TX, TW, TI, BA) are implemented in `@rozek/sds-mcp-server-jj` (and the corresponding `-loro` / `-yjs` packages). Only the pure-logic unit tests for the config layer live here.

Unit tests call `resolvePersistenceDir`, `configFrom`, and `DBPathFor` directly — no binary is spawned.

---

## CF-RD — `resolvePersistenceDir`

| # | Description | Expected |
|---|---|---|
| CF-RD-01 | no param, no ServerDefault, no env var | `~/.sds` (OS home + `/.sds`) |
| CF-RD-02 | `SDS_PERSISTENCE_DIR` env var set | env var value returned |
| CF-RD-03 | `ServerDefault.PersistenceDir` set and `SDS_PERSISTENCE_DIR` also set | ServerDefault wins |
| CF-RD-04 | explicit `PersistenceDir` param, ServerDefault, and env var all set | explicit param wins |

---

## CF — `configFrom`

| # | Description | Expected |
|---|---|---|
| CF-01 | `SDS_STORE_ID` env var set, no `StoreId` param | `StoreId` reflects env var |
| CF-02 | `SDS_PERSISTENCE_DIR` env var set, no `PersistenceDir` param | `PersistenceDir` reflects env var |
| CF-03 | explicit `StoreId` param and `SDS_STORE_ID` env var | param wins |
| CF-04 | `ServerDefaults.StoreId` set (simulating `--store` CLI arg), no param | `StoreId` reflects ServerDefault |
| CF-05 | `ServerDefaults.PersistenceDir` set (simulating `--persistence-dir`), no param | `PersistenceDir` reflects ServerDefault |
| CF-06 | explicit `StoreId` param and `ServerDefaults.StoreId` both set | param wins |
| CF-07 | `ServerDefaults.StoreId` and `SDS_STORE_ID` env var both set, no param | ServerDefault wins |

---

## CF-EC — `configFrom` (extra env vars)

| # | Description | Expected |
|---|---|---|
| CF-EC-01 | `SDS_SERVER_URL`, `SDS_TOKEN`, `SDS_ADMIN_TOKEN` all set | `ServerURL`, `Token`, `AdminToken` reflect the env vars |

---

## CF-DB — `DBPathFor`

| # | Description | Expected |
|---|---|---|
| CF-DB-01 | store ID containing only `[a-zA-Z0-9_-]` | returned unchanged inside `PersistenceDir` with `.db` suffix |
| CF-DB-02 | store ID with special characters (space, `/`) | chars replaced with `_` |
| CF-DB-03 | any store ID | result starts with `PersistenceDir` and ends with `.db` |
