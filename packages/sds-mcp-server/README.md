# @rozek/sds-mcp-server

Shared toolkit for the **shareable-data-store** (SDS) MCP server family. Provides all tool definitions, handlers, and server infrastructure that backend-specific packages wire together with a concrete CRDT store factory.

> **This package is a library — it is not directly runnable.**
> Install a backend-specific wrapper such as [`@rozek/sds-mcp-server-jj`](../sds-mcp-server-jj/README.md) to get a ready-to-use MCP server binary. The `-jj` package uses this library internally and exposes the `sds-mcp-server-jj` executable.

---

## For end users

If you want to use the SDS MCP server in Claude Desktop or another MCP host, install and configure the backend package:

```bash
npm add @rozek/sds-mcp-server-jj
```

Full installation, configuration, and usage instructions are in the [`@rozek/sds-mcp-server-jj` README](../sds-mcp-server-jj/README.md).

---

## For package authors

To create a new SDS MCP server backed by a different CRDT engine, add this package as a dependency and call `runMCPServer` with your store factory:

```typescript
import { runMCPServer } from '@rozek/sds-mcp-server'
import type { SDS_StoreFactory } from '@rozek/sds-mcp-server'

const Factory: SDS_StoreFactory = {
  fromScratch: ()     => MyStore.fromScratch(),
  fromBinary:  (data) => MyStore.fromBinary(data),
}

runMCPServer(Factory, 'sds-mcp-server-myengine', '1.0.0')
```

Add a `bin` entry to your `package.json` pointing at the compiled output, and your package becomes a standalone, runnable MCP server.

### Server-level defaults

Servers built on this library inherit the following CLI arguments and environment variables. **Tool parameters always take precedence** over both.

**CLI arguments:**

| argument | applies to |
| --- | --- |
| `--store <id>` | default `StoreId` for all tools |
| `--persistence-dir <path>` | default `PersistenceDir` for all tools |
| `--server <url>` | default `ServerURL` for sync/token tools |
| `--token <jwt>` | default client `Token` for sync tools |
| `--admin-token <jwt>` | default `AdminToken` for `sds_token_issue` |

**Environment variables:**

| variable | applies to |
| --- | --- |
| `SDS_STORE_ID` | default `StoreId` for all tools |
| `SDS_PERSISTENCE_DIR` | default `PersistenceDir` for all tools |
| `SDS_SERVER_URL` | default `ServerURL` for sync/token tools |
| `SDS_TOKEN` | default client `Token` for sync tools |
| `SDS_ADMIN_TOKEN` | default `AdminToken` for `sds_token_issue` |

**Precedence** (highest to lowest): tool parameter → CLI argument → environment variable → built-in default (`~/.sds` for `PersistenceDir`).

---

## Concepts

The MCP server exposes 20 tools grouped into six categories:

| category | tools |
| --- | --- |
| **store** | `sds_store_info`, `sds_store_ping`, `sds_store_sync`, `sds_store_destroy`, `sds_store_export`, `sds_store_import` |
| **entry** | `sds_entry_create`, `sds_entry_get`, `sds_entry_list`, `sds_entry_update`, `sds_entry_move`, `sds_entry_delete`, `sds_entry_restore`, `sds_entry_purge` |
| **trash** | `sds_trash_list`, `sds_trash_purge_all`, `sds_trash_purge_expired` |
| **tree** | `sds_tree_show` |
| **token** | `sds_token_issue` |
| **batch** | `sds_batch` |

Every tool accepts `StoreId` and `PersistenceDir` parameters. `StoreId` identifies the local SQLite store file; `PersistenceDir` sets the directory in which it is stored (default: `~/.sds`).

Well-known entry aliases are accepted wherever a UUID is expected:

| alias | container |
| --- | --- |
| `"root"` | the top-level container that holds all user entries |
| `"trash"` | the soft-delete container; entries are held here until purged |
| `"lost-and-found"` | internal recovery container for orphaned entries; normally empty |

`"lostandfound"` (no hyphens) is accepted as an alternative spelling for `"lost-and-found"`.

---

## Offline availability

Most tools operate entirely against the local SQLite file and require **no network connection**. Only three tools open an outbound connection to an SDS server:

| tool | requires network | reason |
| --- | --- | --- |
| `sds_store_info` | no | reads local metadata |
| `sds_store_ping` | **yes** | tests WebSocket reachability |
| `sds_store_sync` | **yes** | exchanges CRDT patches with server |
| `sds_store_destroy` | no | deletes local SQLite file |
| `sds_store_export` | no | reads local store |
| `sds_store_import` | no | writes to local store |
| `sds_entry_create` | no | writes to local store |
| `sds_entry_get` | no | reads from local store |
| `sds_entry_list` | no | reads from local store |
| `sds_entry_update` | no | writes to local store |
| `sds_entry_move` | no | writes to local store |
| `sds_entry_delete` | no | moves entry to trash |
| `sds_entry_restore` | no | moves entry out of trash |
| `sds_entry_purge` | no | permanently removes from trash |
| `sds_trash_list` | no | reads from local store |
| `sds_trash_purge_all` | no | writes to local store |
| `sds_trash_purge_expired` | no | writes to local store |
| `sds_tree_show` | no | reads from local store |
| `sds_token_issue` | **yes** | HTTP call to server token endpoint |
| `sds_batch` | no (unless a step requires it) | wraps offline tools |

---

## Tool reference

### `sds_store_info`

Returns existence, entry count, and DB path for a local store. When the store does not exist: `{ StoreId, exists: false }`. When it exists: `{ StoreId, exists: true, EntryCount, DBPath }`.

### `sds_store_ping`

Checks WebSocket server reachability. Returns `{ Server, StoreId, reachable: true }` or `{ Server, reachable: false, Error }`. Requires `ServerURL` and `Token`.

### `sds_store_sync`

Connects to the server, exchanges CRDT patches, and disconnects. Returns `{ StoreId, Server, synced: true }`. Requires `ServerURL` and `Token`. `TimeoutMs` controls the wait budget (default: 5 000 ms; must be a positive integer).

### `sds_store_destroy`

Permanently deletes the local SQLite file and its WAL/SHM companions. Returns `{ StoreId, destroyed: true }`. Fails if the store does not exist.

### `sds_store_export`

Exports the current store snapshot. `Encoding` is `"json"` (default) or `"binary"`. Without `OutputFile` the response contains the data inline: `Data` for JSON, `DataBase64` for binary. With `OutputFile` the response is `{ exported: true, Format, File }`.

### `sds_store_import`

CRDT-merges a snapshot into the local store. Accepts either `InputFile` (file path) or `InputBase64` (base64 string); these are mutually exclusive. When using `InputBase64`, `InputEncoding` (`"json"` or `"binary"`) is required.

---

### `sds_entry_create`

Creates a new item (default) or link (when `Target` is supplied). Auto-creates the store when creating items. `Container` sets the outer container (default: root); accepts a UUID or the aliases `"root"` and `"lost-and-found"`. Returns `{ Id, created: true, Kind: "item" }` or `{ Id, created: true, Kind: "link", Target }`. `MIMEType`, `Value`, `ValueBase64`, and `File` are item-only and cannot be combined with `Target`. `Value`, `ValueBase64`, and `File` are mutually exclusive. `Info` sets initial info entries as a key-value object. `InfoDelete` is accepted for API consistency with `sds_entry_update` but has no effect on a new entry (there are no existing keys to remove).

### `sds_entry_get`

Returns fields of a single entry. Without `Fields` and `InfoKeys` all available fields are returned. `Fields` is an array of field names to include (subset of `Kind`, `Label`, `MIMEType`, `Value`, `Info`, `Target`; field names are case-insensitive). `InfoKeys` returns only the named keys from the info map.

### `sds_entry_list`

Lists the direct inner entries of a container item. `recursive: true` walks all descendants depth-first; `Depth` limits recursion (only effective with `recursive: true`). `only: "items"` or `only: "links"` restricts output. `Fields` and `InfoKeys` work as in `sds_entry_get`. System containers (trash, lost-and-found) are excluded from the output. Returns an array of `{ Id, Kind, [Label], [MIMEType], [Value], [Info] }`.

### `sds_entry_update`

Modifies an existing entry. Only explicitly supplied fields are changed. `Label` is accepted for both items and links. `MIMEType`, `Value`, `ValueBase64`, and `File` are item-only. `Info` is merged into (not replaced by) the existing info map — individual keys are added or overwritten, not the whole map. `InfoDelete` is an array of key names to remove from the info map; it can be combined with `Info` in the same call. All key names (in `Info` and `InfoDelete`) must be valid JavaScript identifiers. **Conflict rule — delete wins**: if a key appears in both `Info` and `InfoDelete`, the delete takes precedence and the key will be absent after the call. Returns `{ Id, updated: true }`.

### `sds_entry_move`

Moves a live entry to a different container. `to` is required and accepts a UUID or the aliases `"root"`, `"trash"`, and `"lost-and-found"`; `at` controls the insertion index (0-based, default: append). Moving an entry into its own descendant fails. Returns `{ Id, movedTo, at }` where `at` is always a number (the final 0-based position).

### `sds_entry_delete`

Soft-deletes an entry by moving it to the trash. System entries (`root`, `trash`, `lost-and-found`) cannot be deleted. Returns `{ Id, deleted: true }`.

### `sds_entry_restore`

Moves a trashed entry back to a live container. The entry must be in the trash. `to` sets the destination (default: root) and accepts a UUID or the aliases `"root"` and `"lost-and-found"`; `at` sets the insertion index. Returns `{ Id, restoredTo, at }` where `at` is always a number (the final 0-based position).

### `sds_entry_purge`

Permanently deletes a trashed entry. The entry must be in the trash. Returns `{ Id, purged: true }`.

---

### `sds_trash_list`

Lists all entries currently in the trash. `only: "items"` or `only: "links"` restricts the result. Returns an array of `{ Id, Kind, Label }`.

### `sds_trash_purge_all`

Permanently deletes every entry in the trash. Returns `{ purged: <count> }`.

### `sds_trash_purge_expired`

Permanently deletes trash entries older than `TTLms` milliseconds (default: 30 days). `TTLms` must be a positive integer. Returns `{ purged: <count>, TTLms }`.

---

### `sds_tree_show`

Returns the entire store as a JSON tree starting from root. `Depth` limits the number of levels (without `Depth` the full tree is returned). Response: `{ Root: [<node>, ...] }` where each node is `{ Id, Kind, Label, innerEntries: [...] }` for items and `{ Id, Kind, Label, TargetId }` for links. Trash and lost-and-found are excluded from the tree.

---

### `sds_token_issue`

Requests a new scoped JWT from the server's `POST /api/token` endpoint. Requires `ServerURL` (must use `ws://` or `wss://` scheme), `AdminToken`, `Sub` (user identifier), and `Scope` (`"read"`, `"write"`, or `"admin"`). `Exp` sets the expiry duration — a number followed by `s`, `m`, `h`, or `d` (default: `"24h"`). Returns `{ Token, Sub, Scope, Exp }`.

---

### `sds_batch`

Executes multiple operations against one store in a single session — the store is opened once, all commands run sequentially, then it is closed. `StoreId` and `PersistenceDir` are inherited by all commands that omit them. `onError: "stop"` (default) aborts on the first failure; `onError: "continue"` attempts all commands and collects errors. Returns `{ Results: [{ Tool, ok: true, Result } | { Tool, ok: false, Error }] }`.

The following tools are **not allowed** inside `sds_batch`:

| tool | reason |
| --- | --- |
| `sds_store_destroy` | deleting the store during a batch session would corrupt the open session |
| `sds_store_ping` | requires an outbound network connection independent of the batch store |
| `sds_token_issue` | makes an HTTP call to an external server; unrelated to the batch store's data |

---

## Examples

### Local store — first steps

Create a store, add some entries, inspect the tree, then retrieve a specific entry by UUID:

```
sds_entry_create  { StoreId: "notes", Label: "Recipes", MIMEType: "text/plain", Value: "Pasta: boil, sauce, enjoy" }
sds_tree_show     { StoreId: "notes" }
sds_entry_list    { StoreId: "notes", Id: "root", Fields: ["Label", "MIMEType"] }
sds_entry_get     { StoreId: "notes", Id: "<uuid>" }
```

---

### Store with persistence and synchronisation

```
sds_store_ping    { StoreId: "team-wiki", ServerURL: "ws://my-server.example.com", Token: "eyJ..." }
sds_entry_create  { StoreId: "team-wiki", Label: "Meeting Notes", MIMEType: "text/plain" }
sds_store_sync    { StoreId: "team-wiki", ServerURL: "ws://my-server.example.com", Token: "eyJ..." }
```

---

### Issuing client tokens

```
sds_token_issue  {
  ServerURL:  "ws://my-server.example.com",
  AdminToken: "<admin-jwt>",
  Sub:        "alice@example.com",
  Scope:      "write",
  Exp:        "7d"
}
```

---

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

---

### Export and restore

```
sds_store_export  { StoreId: "notes", Encoding: "json", OutputFile: "/backups/notes.json" }
sds_store_import  { StoreId: "notes-restored", InputFile: "/backups/notes.json", InputEncoding: "json" }
```

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek
