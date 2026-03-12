# @rozek/sds-mcp-server-loro

MCP (Model Context Protocol) server for the **shareable-data-store** (SDS) family, using the **Loro** CRDT backend. Exposes all SDS store and entry operations as MCP tools so that AI agents can manage CRDT stores, entries, items, links, tokens, and batch workflows through the standard MCP tool-calling interface.

Built on top of `@rozek/sds-mcp-server`.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required to run `sds-mcp-server-loro`. Download from [nodejs.org](https://nodejs.org). |
| **MCP client** | any host that speaks the Model Context Protocol (Claude Desktop, custom agent, etc.) |
| **SDS server** | only required for network operations (`sds_store_sync`, `sds_store_ping`, `sds_token_issue`). All local read/write tools work entirely offline. |
| **JWT tokens** | server operations need a client token (scope `read` or `write`) or an admin token (scope `admin`). |

All clients and servers connected to the same relay must use the **same CRDT backend**. Use `@rozek/sds-mcp-server-loro` together with `@rozek/sds-websocket-server` and `@rozek/sds-command-loro`.

SQLite support is built directly into Node.js 22.5+ — no native addon and no build toolchain is needed.

> **Note:** Run `pnpm build` (or `npm run build`) in this package directory before starting the server for the first time. The `dist/` directory is not included in the repository.

---

## Installation

```bash
pnpm add @rozek/sds-mcp-server-loro
```

Or use without installation via npx:

```bash
npx @rozek/sds-mcp-server-loro
```

---

## Running without Installation

Register the server in your MCP host configuration using `npx` as the command:

**Claude Desktop (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "sds": {
      "command": "npx",
      "args": [ "-y", "@rozek/sds-mcp-server-loro" ]
    }
  }
}
```

---

## Configuration

### Server-level defaults

You can pre-configure default values for `StoreId`, `PersistenceDir`, `ServerURL`, `Token`, and `AdminToken` so that individual tool calls do not need to repeat them.

**CLI arguments:**

| argument | applies to |
| --- | --- |
| `--store <id>` | default `StoreId` for all tools |
| `--data-dir <path>` | default `PersistenceDir` for all tools |
| `--server <url>` | default `ServerURL` for sync/token tools |
| `--token <jwt>` | default client `Token` for sync tools |
| `--admin-token <jwt>` | default `AdminToken` for `sds_token_issue` |

**Environment variables:**

| variable | applies to |
| --- | --- |
| `SDS_STORE_ID` | default `StoreId` for all tools |
| `SDS_DATA_DIR` | default `PersistenceDir` for all tools |
| `SDS_SERVER_URL` | default `ServerURL` for sync/token tools |
| `SDS_TOKEN` | default client `Token` for sync tools |
| `SDS_ADMIN_TOKEN` | default `AdminToken` for `sds_token_issue` |

**Precedence** (highest to lowest): tool parameter → CLI argument → environment variable → built-in default (`~/.sds` for `PersistenceDir`).

---

## Tools

See `@rozek/sds-mcp-server` for the complete tool reference. All 20 tools available in `sds-mcp-server-loro` are identical to those in `sds-mcp-server` — the only difference is the CRDT backend used to store and synchronise data.

| category | tools |
| --- | --- |
| **store** | `sds_store_info`, `sds_store_ping`, `sds_store_sync`, `sds_store_destroy`, `sds_store_export`, `sds_store_import` |
| **entry** | `sds_entry_create`, `sds_entry_get`, `sds_entry_list`, `sds_entry_update`, `sds_entry_move`, `sds_entry_delete`, `sds_entry_restore`, `sds_entry_purge` |
| **trash** | `sds_trash_list`, `sds_trash_purge_all`, `sds_trash_purge_expired` |
| **tree** | `sds_tree_show` |
| **token** | `sds_token_issue` |
| **batch** | `sds_batch` |

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek
