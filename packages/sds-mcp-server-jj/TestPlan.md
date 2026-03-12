# Test Plan — `@rozek/sds-mcp-server-jj`

---

## Goal

Verify that the `sds-mcp-server-jj` binary — the json-joy-backed MCP server — correctly exposes all SDS operations as MCP tools, with the right JSON responses, tool-error flags, and side effects.

---

## Scope

This package contains the **full integration test suite** for the MCP server toolchain. Tests connect to the built binary via MCP `StdioClientTransport` and cover:

**In scope:**
- Tool discovery (`ListTools`): all 20 registered tools present
- All store tools: `sds_store_info`, `sds_store_ping`, `sds_store_sync` (validation), `sds_store_destroy`, `sds_store_export`, `sds_store_import`
- All entry tools: `sds_entry_create`, `sds_entry_get`, `sds_entry_list`, `sds_entry_update`, `sds_entry_move`, `sds_entry_delete`, `sds_entry_restore`, `sds_entry_purge`
- All trash tools: `sds_trash_list`, `sds_trash_purge_all`, `sds_trash_purge_expired`
- Tree tool: `sds_tree_show`
- Token tool: `sds_token_issue` (parameter validation only)
- Batch tool: `sds_batch` — sequential execution, `onError` modes, sync within batch, disallowed tools
- Server-level configuration: env vars and CLI args as defaults; explicit params take precedence

**Out of scope:**
- Live WebSocket connectivity (`store sync`, `store ping` with a real server)
- JWT cryptographic validity
- Concurrent multi-client store access

---

## Relationship to `@rozek/sds-mcp-server`

`@rozek/sds-mcp-server` holds the unit-level config tests. This package tests the *binary* end-to-end with the json-joy backend wired in. The `-loro` and `-yjs` sibling packages run a store-level smoke test (LT + SI + SP + SY + SD + SE) to confirm their binaries also work; the full functional suite (entry, trash, tree, token, batch, config) lives here.

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | json-joy CRDT via `@rozek/sds-core-jj` + `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Transport** | MCP SDK `StdioClientTransport` — spawns `dist/sds-mcp-server-jj.js` |
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
| EC | `sds_entry_create` | `entry.test.ts` |
| EG | `sds_entry_get` | `entry.test.ts` |
| EL | `sds_entry_list` | `entry.test.ts` |
| EU | `sds_entry_update` | `entry.test.ts` |
| EV | `sds_entry_move` | `entry.test.ts` |
| ED | `sds_entry_delete`, `sds_entry_restore`, `sds_entry_purge` | `entry.test.ts` |
| TL | `sds_trash_list` | `trash.test.ts` |
| TA | `sds_trash_purge_all` | `trash.test.ts` |
| TX | `sds_trash_purge_expired` | `trash.test.ts` |
| TW | `sds_tree_show` | `tree.test.ts` |
| TI | `sds_token_issue` | `token.test.ts` |
| BA | `sds_batch` | `batch.test.ts` |
| CF | server-level config defaults | `config.test.ts` |

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

## Part III — Entry Tools

- **EC-01** through **EC-13** — Create items and links, store metadata, validate constraints, InfoDelete no-op (see TestCases.md)
- **EG-01** through **EG-09** — Retrieve entries by ID and alias, field selection (see TestCases.md)
- **EL-01** through **EL-11** — List entries with recursion, filtering, field projection (see TestCases.md)
- **EU-01** through **EU-12** — Update label, value, MIME type, info merge, info-key deletion, invalid identifier, combined Info+InfoDelete, delete-wins conflict (see TestCases.md)
- **EV-01** through **EV-07** — Move entries, cycle detection, alias resolution (see TestCases.md)
- **ED-01** through **ED-09** — Delete, restore, purge lifecycle (see TestCases.md)

---

## Part IV — Trash Tools

- **TL-01** through **TL-05** — List with `only` filter
- **TA-01** — Purge all
- **TX-01** through **TX-03** — Purge expired with TTL validation

---

## Part V — Tree Tool

- **TW-01** through **TW-06**, **TW-04b** — Populated tree, empty store, depth limits, system-container exclusion, link nodes

---

## Part VI — Token Tool (validation only)

- **TI-01** through **TI-04** — Parameter validation for `sds_token_issue`

---

## Part VII — Batch Tool

- **BA-01** through **BA-08** — Sequential execution, `onError` modes, disallowed tools, `StoreId`/`PersistenceDir` inheritance

---

## Part VIII — Config Defaults

- **CF-01** through **CF-07** — Env vars and CLI args as defaults; explicit params override defaults

---

## Running the Tests

```bash
cd packages/sds-mcp-server-jj
pnpm build && pnpm test:run
```
