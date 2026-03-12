# @rozek/sds-mcp-server-jj

MCP (Model Context Protocol) server for the **shareable-data-store** (SDS) family — backed by the [json-joy](https://github.com/streamich/json-joy) CRDT engine. Exposes all SDS store and entry operations as MCP tools so that AI agents can manage CRDT stores, entries, items, links, tokens, and batch workflows through the standard MCP tool-calling interface.

This package is the **runnable binary**. The tool definitions, handlers, and shared infrastructure live in [`@rozek/sds-mcp-server`](../sds-mcp-server/README.md); this package wires in the json-joy store factory and exposes the result as the `sds-mcp-server-jj` executable.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required to run the server. Download from [nodejs.org](https://nodejs.org). |
| **MCP client** | any host that speaks the Model Context Protocol (Claude Desktop, custom agent, etc.) |
| **SDS server** | only required for network operations (`sds_store_sync`, `sds_store_ping`, `sds_token_issue`). All local read/write tools work entirely offline against the SQLite file. |
| **JWT tokens** | server operations need a client token (scope `read` or `write`) or an admin token (scope `admin`). Tokens are issued by the server's `POST /api/token` endpoint via `sds_token_issue`. |

SQLite support is built directly into Node.js since version 22.5 via the `node:sqlite` module — no separate database driver, no native C++ addon, and no build toolchain is needed. The server binary therefore runs with **Node.js as its only dependency**.

> **Note on stability:** `node:sqlite` is classified as *Stability 1 — Experimental* in the Node.js 22 and 24 documentation. In practice the API has been stable since its introduction. The server suppresses the associated runtime warning automatically.

---

## Installation

```bash
npm add @rozek/sds-mcp-server-jj
```

After installation the `sds-mcp-server-jj` command is available in the project's `node_modules/.bin/` directory.

---

## Running without Installation

The package includes a `bin` entry, so it can be started directly via `npx` — no prior installation required:

```bash
npx @rozek/sds-mcp-server-jj
```

This is the recommended way to configure MCP hosts that manage servers themselves. Register the server in your MCP host configuration using `npx` as the command:

**Claude Desktop (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "sds": {
      "command": "npx",
      "args": [ "-y", "@rozek/sds-mcp-server-jj" ]
    }
  }
}
```

The `-y` flag skips the confirmation prompt when `npx` downloads the package. Remove it if you prefer to confirm each download.

> **Note on Node.js version:** `npx` uses whatever `node` is on your `PATH`. Make sure it is version 22.5 or later before adding the server to a host configuration.

---

## Configuration (installed package)

If you have installed `@rozek/sds-mcp-server-jj` locally or globally, register the built binary directly in your MCP host configuration:

**Claude Desktop (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "sds": {
      "command": "node",
      "args": [ "/path/to/node_modules/@rozek/sds-mcp-server-jj/dist/sds-mcp-server-jj.js" ]
    }
  }
}
```

The server communicates over **stdio** — no port, no HTTP server, no daemon is required.

### Server-level defaults

You can pre-configure default values for `StoreId`, `PersistenceDir`, `ServerURL`, `Token`, and `AdminToken` so that individual tool calls do not need to repeat them. There are two ways to do this — they can be combined freely, and **tool parameters always take precedence** over both.

**CLI arguments** (passed in the `args` array of the MCP host config):

| argument | applies to |
| --- | --- |
| `--store <id>` | default `StoreId` for all tools |
| `--persistence-dir <path>` | default `PersistenceDir` for all tools |
| `--server <url>` | default `ServerURL` for sync/token tools |
| `--token <jwt>` | default client `Token` for sync tools |
| `--admin-token <jwt>` | default `AdminToken` for `sds_token_issue` |

**Environment variables** (set in the `env` block of the MCP host config, or in the shell):

| variable | applies to |
| --- | --- |
| `SDS_STORE_ID` | default `StoreId` for all tools |
| `SDS_PERSISTENCE_DIR` | default `PersistenceDir` for all tools |
| `SDS_SERVER_URL` | default `ServerURL` for sync/token tools |
| `SDS_TOKEN` | default client `Token` for sync tools |
| `SDS_ADMIN_TOKEN` | default `AdminToken` for `sds_token_issue` |

**Precedence** (highest to lowest): tool parameter → CLI argument → environment variable → built-in default (`~/.sds` for `PersistenceDir`).

**Example — fixed store and data directory via CLI args:**

```json
{
  "mcpServers": {
    "sds": {
      "command": "node",
      "args": [
        "/path/to/node_modules/@rozek/sds-mcp-server-jj/dist/sds-mcp-server-jj.js",
        "--store",           "my-notes",
        "--persistence-dir", "/home/alice/.my-sds-data"
      ]
    }
  }
}
```

**Example — sync server and token via environment variables:**

```json
{
  "mcpServers": {
    "sds": {
      "command": "node",
      "args": [ "/path/to/.../sds-mcp-server-jj.js" ],
      "env": {
        "SDS_SERVER_URL": "wss://sync.example.com",
        "SDS_TOKEN":      "eyJhbGci..."
      }
    }
  }
}
```

---

## Tool reference

This package exposes 20 tools grouped into six categories. Full documentation for every tool — parameters, return values, error conditions, and examples — is in the [`@rozek/sds-mcp-server` README](../sds-mcp-server/README.md#tool-reference).

| category | tools |
| --- | --- |
| **store** | `sds_store_info`, `sds_store_ping`, `sds_store_sync`, `sds_store_destroy`, `sds_store_export`, `sds_store_import` |
| **entry** | `sds_entry_create`, `sds_entry_get`, `sds_entry_list`, `sds_entry_update`, `sds_entry_move`, `sds_entry_delete`, `sds_entry_restore`, `sds_entry_purge` |
| **trash** | `sds_trash_list`, `sds_trash_purge_all`, `sds_trash_purge_expired` |
| **tree** | `sds_tree_show` |
| **token** | `sds_token_issue` |
| **batch** | `sds_batch` |

---

## Examples

### Local store — first steps

```
sds_entry_create  { StoreId: "notes", Label: "Recipes", MIMEType: "text/plain", Value: "Pasta: boil, sauce, enjoy" }
sds_tree_show     { StoreId: "notes" }
sds_entry_list    { StoreId: "notes", Id: "root", Fields: ["Label", "MIMEType"] }
sds_entry_get     { StoreId: "notes", Id: "<uuid>" }
```

### Batch setup

Initialise a folder structure in one round trip:

```
sds_batch {
  StoreId:  "team-wiki",
  Commands: [
    { Tool: "sds_entry_create", Params: { Label: "Documentation", MIMEType: "text/plain" } },
    { Tool: "sds_entry_create", Params: { Label: "Meeting Notes",  MIMEType: "text/plain" } },
    { Tool: "sds_entry_create", Params: { Label: "Decisions",      MIMEType: "text/plain" } }
  ]
}
```

### Export and restore

```
sds_store_export  { StoreId: "notes", Encoding: "json", OutputFile: "/backups/notes.json" }
sds_store_import  { StoreId: "notes-restored", InputFile: "/backups/notes.json", InputEncoding: "json" }
```

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek
