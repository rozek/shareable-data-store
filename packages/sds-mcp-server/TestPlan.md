# Test Plan — `@rozek/sds-mcp-server`

---

## Goal

Verify that the `sds-mcp-server` binary correctly exposes all SDS operations as MCP tools — producing the right JSON responses, tool-error flags, and side effects for every supported tool.

---

## Scope

**In scope:**
- Tool discovery: `ListTools` returns all 20 registered tools with correct names
- `sds_store_info` — existence check, entry count, DB path
- `sds_store_ping` — parameter validation; reachability-reporting with a non-listening address
- `sds_store_sync` — parameter validation only (live sync requires a WebSocket server)
- `sds_store_destroy` — deletes the local store file
- `sds_store_export` / `sds_store_import` — JSON and binary round-trips, inline data, file-based data
- `sds_entry_create` — item creation, link creation, all value/info variants
- `sds_entry_get` — all field selection variants, well-known aliases
- `sds_entry_list` — recursive traversal, `only`, extra fields
- `sds_entry_update` — label, value, MIME, info merge
- `sds_entry_move` — move to container, cycle detection
- `sds_entry_delete` / `sds_entry_restore` / `sds_entry_purge` — full soft-delete lifecycle
- `sds_trash_list` / `sds_trash_purge_all` / `sds_trash_purge_expired` — all trash variants
- `sds_tree_show` — nested tree, depth limit
- `sds_token_issue` — parameter validation only (live issuance requires a server)
- `sds_batch` — sequential execution, shared store, `onError` modes, sync within batch

**Out of scope:**
- Live WebSocket connectivity (`store sync`, `store ping` with a real server, `token issue`)
- JWT cryptographic validity
- Concurrent multi-client store access

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | temp-dir SQLite via `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Transport** | MCP SDK `StdioClientTransport` — spawns the built server binary |
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

---

## Part I — Tool Discovery

### LT — `ListTools`

- **LT-01** — `ListTools` returns at least 20 tools
- **LT-02** — All 20 expected tool names are present in the returned list

---

## Part II — Store Tools

### SI — `sds_store_info`

- **SI-01** — `StoreId` missing → `isError: true`, message contains "StoreId"
- **SI-02** — Non-existent store → `isError: false`, `exists: false`, `StoreId` matches
- **SI-03** — Existing store → `isError: false`, `exists: true`, `EntryCount ≥ 1`, `DBPath` non-empty string

### SP — `sds_store_ping`

- **SP-01** — `ServerURL` missing → `isError: true`, message contains "ServerURL"
- **SP-02** — `Token` missing → `isError: true`, message contains "Token"
- **SP-03** — `ServerURL` without `ws://` / `wss://` prefix → `isError: true`, message contains "ServerURL"
- **SP-04** — Unreachable server → `isError: false`, result has `reachable: false`

### SY — `sds_store_sync` (validation only)

- **SY-01** — `TimeoutMs: 0` → `isError: true`, message contains "TimeoutMs"
- **SY-02** — `TimeoutMs: -1` → `isError: true`, message contains "TimeoutMs"
- **SY-03** — `ServerURL` without `ws://` / `wss://` prefix → `isError: true`

### SD — `sds_store_destroy`

- **SD-01** — Destroys the store file; subsequent `sds_store_info` returns `exists: false`
- **SD-02** — Non-existent store → `isError: true`, message contains store ID

### SE — `sds_store_export` / `sds_store_import`

- **SE-01** — JSON export inline (no `OutputFile`) → `exported: true`, `Format: "json"`, `Data` field present
- **SE-02** — JSON export to file → `exported: true`, `Format: "json"`, `File` field equals given path
- **SE-03** — JSON export → import into new store → both stores have equal `EntryCount`
- **SE-04** — Binary export inline → `exported: true`, `Format: "binary"`, `DataBase64` decodes to valid binary
- **SE-05** — Binary export to file → `exported: true`, `Format: "binary"`, `File` field present; file is non-empty
- **SE-06** — Binary export → import into new store → equal `EntryCount`
- **SE-07** — `ImportFile` non-existent → `isError: true`, message contains "not found"
- **SE-08** — Both `InputFile` and `InputBase64` supplied → `isError: true`, message contains "mutually exclusive"
- **SE-09** — `InputBase64` without `InputEncoding` → `isError: true`, message contains "InputEncoding"
- **SE-10** — Neither `InputFile` nor `InputBase64` supplied → `isError: true`
- **SE-11** — Invalid `Encoding` value → `isError: true`, message contains "Encoding"

---

## Part III — Entry Tools

### EC — `sds_entry_create`

- **EC-01** — Create item (no `Target`) → `isError: false`, `Kind: "item"`, UUID returned
- **EC-02** — Create link (with `Target`) → `isError: false`, `Kind: "link"`, `Target` field matches
- **EC-03** — `Label` and `MIMEType` are stored and visible in subsequent `sds_entry_get`
- **EC-04** — `Value` is stored and visible in subsequent `sds_entry_get`
- **EC-05** — `ValueBase64` decoded and stored correctly
- **EC-06** — `File` path is read and stored; file content visible in `sds_entry_get`
- **EC-07** — `Info` map is stored and visible in subsequent `sds_entry_get`
- **EC-08** — `at: 0` places the entry at the first position in the container
- **EC-09** — Non-existent `Container` → `isError: true`, message mentions "not found"
- **EC-10** — `MIMEType` combined with `Target` → `isError: true` *(representative for the item-only-field + Target guard; the same check rejects Value)*
- **EC-11** — `Value` and `File` together → `isError: true`, message contains "mutually exclusive"
- **EC-12** — `Container: "root"` alias → item created in root; appears in `sds_entry_list` of root *(representative for alias resolution; other aliases use the same code path)*
- **EC-13** — `InfoDelete` is accepted on item creation; command succeeds; the new entry's info contains only keys from `Info`, not any key listed in `InfoDelete`

### EG — `sds_entry_get`

- **EG-01** — No `Fields` / no `InfoKeys` → all available fields returned
- **EG-02** — `Fields: ["Kind", "Label"]` → only `Kind` and `Label` present (plus `Id`)
- **EG-03** — `InfoKeys: ["author"]` → `Info` contains only the requested key
- **EG-04** — Well-known alias `"root"` → entry returned; `Id` equals canonical `RootId`
- **EG-05** — Well-known alias `"trash"` → entry returned; `Id` equals canonical `TrashId`; `Kind: "item"`
- **EG-06** — Non-existent ID → `isError: true`, message contains "not found"
- **EG-07** — Link entry: `Fields: ["Target"]` → `Target` field present; no `MIMEType` or `Value`
- **EG-08** — Well-known alias `"lost-and-found"` → entry returned with `Kind: "item"`
- **EG-09** — No-hyphen variant `"lostandfound"` → same entry returned; `Id` matches `"lost-and-found"` result

### EL — `sds_entry_list`

- **EL-01** — Direct children of root listed; `Id` and `Kind` always present
- **EL-02** — `recursive: true` traverses nested containers
- **EL-03** — `only: "items"` excludes links from result
- **EL-04** — `only: "links"` excludes items from result
- **EL-05** — `Depth: 1` limits recursion to one level even with `recursive: true`
- **EL-06** — `Fields: ["Label"]` adds `Label` to each entry object
- **EL-07** — `InfoKeys: ["tag"]` adds `Info` with only the requested key to each entry
- **EL-08** — Invalid `only` value → `isError: true`, message contains "'only'"
- **EL-09** — Non-item container ID → `isError: true`
- **EL-10** — System containers (Trash) never appear in `entry list root`
- **EL-11** — Well-known alias `"lost-and-found"` resolves correctly; tool returns an array

### EU — `sds_entry_update`

- **EU-01** — Update `Label` on item → subsequent `sds_entry_get` reflects new label
- **EU-02** — Update `Label` on link → subsequent `sds_entry_get` reflects new label
- **EU-03** — Update `Value` → subsequent `sds_entry_get` reflects new value
- **EU-04** — Update `MIMEType` → subsequent `sds_entry_get` reflects new MIME type
- **EU-05** — `Info` update merges keys (does not replace existing keys)
- **EU-06** — `MIMEType` on link → `isError: true`, message contains "link" *(representative for the item-only-field-on-link guard; the same check rejects Value)*
- **EU-07** — `Value` and `File` together → `isError: true`, message contains "mutually exclusive"
- **EU-08** — Non-existent entry ID → `isError: true`, message contains "not found"
- **EU-09** — `InfoDelete` removes the specified key; other info keys remain
- **EU-10** — `InfoDelete` entry with an invalid JavaScript identifier (e.g. `"my-key"`) → `isError: true`; message contains the key name
- **EU-11** — `Info` and `InfoDelete` in the same call: new key added and existing key removed in one operation
- **EU-12** — `Info` and `InfoDelete` reference the **same** key: delete wins — key is absent after the call

### EV — `sds_entry_move`

- **EV-01** — Move item to a different container → item appears in new container
- **EV-02** — `at: 0` places the entry at the first position
- **EV-03** — Non-existent target container → `isError: true`, message contains "not found"
- **EV-04** — Move item into its own descendant → `isError: true`, message contains "descendant"
- **EV-05** — `to: "root"` alias → item moved to root; `movedTo` equals canonical root UUID
- **EV-06** — Move `"lost-and-found"` to a non-root container → `isError: true`
- **EV-07** — `at: -1` on move → `isError: true`; message contains "at"

### ED — `sds_entry_delete` / `sds_entry_restore` / `sds_entry_purge`

- **ED-01** — Delete item → `deleted: true`; subsequent `sds_trash_list` includes the entry
- **ED-02** — Delete system entry `"root"` → `isError: true`, message contains "cannot be deleted"
- **ED-03** — Restore trashed entry → `restoredTo` and `at` fields in response; entry visible at root
- **ED-04** — Restore non-trashed entry → `isError: true`, message contains "not in the trash"
- **ED-05** — Purge trashed entry → `purged: true`; subsequent `sds_entry_get` on same ID → `isError: true`
- **ED-06** — Purge non-trashed entry → `isError: true`, message contains "not in the trash"
- **ED-07** — Delete `"lost-and-found"` → `isError: true`, message contains "cannot be deleted"
- **ED-08** — Restore with `to: "root"` alias → `isError: false`; `restoredTo` equals canonical root UUID *(representative for alias resolution; other aliases use the same code path)*
- **ED-09** — Restore with `at: -1` → `isError: true`; message contains "at"

---

## Part IV — Trash Tools

### TL — `sds_trash_list`

- **TL-01** — Empty trash → empty array returned
- **TL-02** — Deleted entries appear in the list
- **TL-03** — `only: "items"` excludes links
- **TL-04** — `only: "links"` excludes items
- **TL-05** — Invalid `only` value → `isError: true`

### TA — `sds_trash_purge_all`

- **TA-01** — After `purge_all`, `sds_trash_list` returns empty array; `purged` count matches pre-existing trash count

### TX — `sds_trash_purge_expired`

- **TX-01** — Very large `TTLms` (100 years) → `purged: 0`; `TTLms` echoed; entries remain in trash
- **TX-02** — `TTLms: 0` → `isError: true`, message contains "TTLms"
- **TX-03** — `TTLms: -1` → `isError: true`, message contains "TTLms"

---

## Part V — Tree Tool

### TW — `sds_tree_show`

- **TW-01** — Populated store → `Root` array is non-empty; each node has `Id`, `Kind`, `Label`; item nodes additionally have `innerEntries`
- **TW-02** — Empty store (no items) → `Root` is an empty array
- **TW-03** — `Depth: 1` → `innerEntries` of every top-level item node is empty
- **TW-04** — `Depth: 0` → `Root` is an empty array
- **TW-04b** — `Depth: -1` (negative) → tool error; message mentions `Depth`
- **TW-05** — System containers (Trash) never appear anywhere in the tree
- **TW-06** — Link nodes carry a `TargetId` field and have no `innerEntries`; item nodes do not carry `TargetId`

---

## Part VI — Token Tool

### TI — `sds_token_issue` (validation only)

- **TI-01** — `ServerURL` without `ws://` / `wss://` prefix → `isError: true`, message contains "ServerURL"
- **TI-02** — Invalid `Scope` value → `isError: true`, message contains "Scope"
- **TI-03** — Invalid `Exp` format (e.g. `"7x"`) → `isError: true`, message contains "Exp"
- **TI-04** — Valid params but unreachable server → `isError: true`, message contains URL or "failed"

---

## Part VII — Batch Tool

### BA — `sds_batch`

- **BA-01** — Sequential create + get in a single batch → both results are `ok: true`
- **BA-02** — `onError: "stop"` — failing command aborts remaining commands; subsequent commands absent from `Results`
- **BA-03** — `onError: "continue"` — all commands attempted; failed ones have `ok: false` with `Error` field
- **BA-04** — Tool not in allowed batch list → `isError: true` before any execution
- **BA-05** — `Commands` missing → `isError: true`
- **BA-06** — `sync` within batch (unreachable server) → that step `ok: false`; subsequent steps still run with `onError: "continue"`
- **BA-07** — `StoreId` and `PersistenceDir` inherited by all batch commands
- **BA-08** — `sds_token_issue` disallowed in batch → `isError: true`

---

## CF — Config Defaults

Verifies that server-level defaults (CLI args and environment variables) are correctly applied and that explicit tool parameters always take precedence.

- **CF-01** — `SDS_STORE_ID` env var → used as default `StoreId` when param is absent
- **CF-02** — `SDS_PERSISTENCE_DIR` env var → store found in the correct directory
- **CF-03** — Explicit `StoreId` param overrides `SDS_STORE_ID` env var
- **CF-04** — `--store` CLI arg → used as default `StoreId` when param is absent
- **CF-05** — `--persistence-dir` CLI arg → store found in the correct directory
- **CF-06** — Explicit `StoreId` param overrides `--store` CLI arg
- **CF-07** — `--store` CLI arg takes precedence over `SDS_STORE_ID` env var

---

## Running the Tests

```bash
cd packages/sds-mcp-server
pnpm build && pnpm test:run
```
