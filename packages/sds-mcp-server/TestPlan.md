# Test Plan — `@rozek/sds-mcp-server`

---

## Goal

Verify that the configuration layer of `@rozek/sds-mcp-server` — `resolvePersistenceDir`, `configFrom`, and `DBPathFor` — correctly resolves env-var and CLI-arg defaults, honours explicit parameter precedence, and sanitises store IDs for filesystem use.

> **Integration tests:** all MCP tool integration tests (tool discovery, store/entry/trash/tree/token/batch tools) require the spawned server binary and a real SQLite store. They are implemented in `@rozek/sds-mcp-server-jj` (and the corresponding `-loro` / `-yjs` packages).

---

## Scope

**In scope:**
- `resolvePersistenceDir` — built-in default, `SDS_PERSISTENCE_DIR` env var, `ServerDefault`, explicit param; four-level precedence chain
- `configFrom` — `StoreId` and `PersistenceDir` resolution for all three source levels (env var, CLI-arg default via `ServerDefaults`, explicit param); `SDS_SERVER_URL` / `SDS_TOKEN` / `SDS_ADMIN_TOKEN` env vars
- `DBPathFor` — path composition, store-ID sanitisation

**Out of scope:**
- All MCP tool tests (LT, SI, SP, SY, SD, SE, EC, EG, EL, EU, EV, ED, TL, TA, TX, TW, TI, BA) — binary-level integration tests in `@rozek/sds-mcp-server-jj`
- Live WebSocket connectivity (`store sync`, `store ping`, `token issue`)
- JWT cryptographic validity (tested by `@rozek/sds-websocket-server`)
- Concurrent multi-client store access

---

## Test Environment

- **Runtime:** Node.js 22+
- **Test framework:** Vitest 2
- **External dependencies:** none — no binary is spawned; `Config.ts` is imported directly

---

## Part I — `resolvePersistenceDir`

### 1.1 Built-in default

- **CF-RD-01** — With no param, no `ServerDefault`, and no `SDS_PERSISTENCE_DIR` env var, returns `~/.sds`

### 1.2 Env-var fallback

- **CF-RD-02** — When `SDS_PERSISTENCE_DIR` is set and no `ServerDefault` or param is present, its value is returned

### 1.3 ServerDefault overrides env var

- **CF-RD-03** — When both `ServerDefault.PersistenceDir` and `SDS_PERSISTENCE_DIR` are set, `ServerDefault` wins

### 1.4 Explicit param overrides everything

- **CF-RD-04** — When the explicit `PersistenceDir` param, `ServerDefault`, and `SDS_PERSISTENCE_DIR` are all set, the explicit param wins

---

## Part II — `configFrom`

### 2.1 Env-var defaults

- **CF-01** — `SDS_STORE_ID` env var is used as `StoreId` when the param is absent
- **CF-02** — `SDS_PERSISTENCE_DIR` env var is used as `PersistenceDir` when the param is absent

### 2.2 Explicit param wins over env var

- **CF-03** — An explicit `StoreId` param overrides `SDS_STORE_ID`

### 2.3 ServerDefault (`--store` / `--persistence-dir` CLI args)

- **CF-04** — `ServerDefaults.StoreId` sets the default `StoreId` when no param is given
- **CF-05** — `ServerDefaults.PersistenceDir` sets the default `PersistenceDir` when no param is given

### 2.4 Explicit param wins over ServerDefault

- **CF-06** — An explicit `StoreId` param overrides `ServerDefaults.StoreId`

### 2.5 ServerDefault wins over env var

- **CF-07** — `ServerDefaults.StoreId` takes precedence over `SDS_STORE_ID` when no explicit param is given

---

## Part III — `configFrom` (extra env vars)

- **CF-EC-01** — `SDS_SERVER_URL`, `SDS_TOKEN`, and `SDS_ADMIN_TOKEN` are all resolved from env and placed in the returned config object

---

## Part IV — `DBPathFor`

### 4.1 Safe store ID (no sanitisation)

- **CF-DB-01** — A store ID containing only `[a-zA-Z0-9_-]` is kept unchanged; the result is `<PersistenceDir>/<storeId>.db`

### 4.2 Special-character sanitisation

- **CF-DB-02** — Any character outside `[a-zA-Z0-9_-]` (e.g. space, `/`) is replaced with `_`

### 4.3 Output path structure

- **CF-DB-03** — The result always starts with `PersistenceDir` and ends with `.db`, regardless of sanitisation

---

## Running the Tests

```bash
cd packages/sds-mcp-server
pnpm test:run
```
