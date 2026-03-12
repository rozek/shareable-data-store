# Test Plan — `@rozek/sds-mcp-server-loro`

---

## Goal

Verify that the `sds-mcp-server-loro` binary — the Loro-CRDT-backed MCP server — starts correctly, exposes all 20 registered tools, and handles store-level operations with the right JSON responses and error flags.

---

## Scope

This package contains a **store-level smoke test** for the Loro-backed MCP server binary. Tests connect via MCP `StdioClientTransport` and cover:

**In scope:**
- Tool discovery (`ListTools`): all 20 registered tools present
- Store tools: `sds_store_info`, `sds_store_ping`, `sds_store_sync` (parameter validation), `sds_store_destroy`, `sds_store_export`, `sds_store_import`

**Out of scope:**
- Entry, trash, tree, token, batch, and config tests — those are covered exhaustively in `@rozek/sds-mcp-server-jj`
- Live WebSocket connectivity
- JWT cryptographic validity

---

## Relationship to `@rozek/sds-mcp-server-jj`

`@rozek/sds-mcp-server-jj` carries the full functional test suite. This package and its `-yjs` sibling run the store-level groups (LT + SI + SP + SY + SD + SE) only, to confirm the binary starts correctly and the Loro backend is wired up.

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | Loro CRDT via `@rozek/sds-core-loro` + `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Transport** | MCP SDK `StdioClientTransport` — spawns `dist/sds-mcp-server-loro.js` |
| **Build prerequisite** | `pnpm build` must succeed before `pnpm test:run` |

---

## Test Groups

| prefix | tool(s) covered | test file |
| --- | --- | --- |
| LT | `ListTools` | `store.test.ts` |
| SI | `sds_store_info` | `store.test.ts` |
| SP | `sds_store_ping` | `store.test.ts` |
| SY | `sds_store_sync` | `store.test.ts` |
| SD | `sds_store_destroy` | `store.test.ts` |
| SE | `sds_store_export`, `sds_store_import` | `store.test.ts` |

---

## Part I — Tool Discovery

- **LT-01** — `ListTools` returns ≥ 20 tools
- **LT-02** — All 20 expected tool names are present

---

## Part II — Store Tools

- **SI-01** — `StoreId` absent → `isError: true`; message contains "StoreId"
- **SI-02** — Non-existent store → `isError: false`; `exists: false`
- **SI-03** — Existing store → `isError: false`; `exists: true`; `EntryCount ≥ 1`; `DBPath` non-empty
- **SP-01** — `ServerURL` absent → `isError: true`; message contains "ServerURL"
- **SP-02** — `Token` absent → `isError: true`; message contains "Token"
- **SP-03** — `ServerURL` without `ws://`/`wss://` → `isError: true`; message contains "ServerURL"
- **SP-04** — Unreachable server → `isError: false`; `reachable: false`
- **SY-01** — `TimeoutMs: 0` → `isError: true`; message contains "TimeoutMs"
- **SY-02** — `TimeoutMs: -1` → `isError: true`; message contains "TimeoutMs"
- **SY-03** — `ServerURL = "ftp://bad"` → `isError: true`
- **SD-01** — Destroys store; subsequent `sds_store_info` returns `exists: false`
- **SD-02** — Non-existent store → `isError: true`; message contains store ID
- **SE-01** — JSON export inline → `exported: true`; `Format: "json"`; `Data` field present
- **SE-02** — JSON export to file → `exported: true`; `File` = given path
- **SE-03** — JSON export → import into new store → equal `EntryCount`
- **SE-04** — Binary export inline → `DataBase64` present; decodes to non-empty buffer
- **SE-05** — Binary export to file → file non-empty
- **SE-06** — Binary export → import into new store → equal `EntryCount`
- **SE-07** — Import from non-existent file → `isError: true`; message contains "not found"
- **SE-08** — Both `InputFile` and `InputBase64` → `isError: true`; message contains "mutually exclusive"
- **SE-09** — `InputBase64` without `InputEncoding` → `isError: true`; message contains "InputEncoding"
- **SE-10** — Neither `InputFile` nor `InputBase64` → `isError: true`
- **SE-11** — Invalid `Encoding` value → `isError: true`; message contains "Encoding"

---

## Running the Tests

```bash
cd packages/sds-mcp-server-loro
pnpm build && pnpm test:run
```
