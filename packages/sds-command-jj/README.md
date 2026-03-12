# @rozek/sds-command-jj

CLI tool for the **shareable-data-store** (SDS) family, using the **json-joy** CRDT backend. Exposes every store and entry operation as a one-shot command, an interactive REPL shell, and a batch script runner.

Built on top of `@rozek/sds-command`.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required to run `sds-jj`. Download from [nodejs.org](https://nodejs.org). |
| **SDS server** | only required for network operations (`store sync`, `store ping`, `token issue`). Local read/write commands work entirely offline. |
| **JWT tokens** | server operations need a client token (`--token`, scope `read` or `write`) or an admin token (`--admin-token`, scope `admin`). |

All clients and servers connected to the same relay must use the **same CRDT backend**. Use `@rozek/sds-command-jj` together with `@rozek/sds-websocket-server` and `@rozek/sds-mcp-server-jj`.

SQLite support is built directly into Node.js 22.5+ — no native addon and no build toolchain is needed.

---

## Installation

```bash
npm install -g @rozek/sds-command-jj
```

Or use without installation via npx:

```bash
npx @rozek/sds-command-jj entry get <id>
```

---

## Synopsis

```
sds-jj [global-options] <command> [command-options]
sds-jj shell
sds-jj --script <file>
```

---

## Global options

| option | env var | description |
| --- | --- | --- |
| `--server <url>` | `SDS_SERVER_URL` | WebSocket server base URL |
| `--store <id>` | `SDS_STORE_ID` | store identifier |
| `--token <jwt>` | `SDS_TOKEN` | client JWT with `read` or `write` scope |
| `--admin-token <jwt>` | `SDS_ADMIN_TOKEN` | admin JWT with `admin` scope |
| `--persistence-dir <path>` | `SDS_PERSISTENCE_DIR` | directory for local SQLite files (default: `~/.sds`) |
| `--format <fmt>` | — | output format: `text` (default) or `json` |
| `--on-error <action>` | — | error handling in script/batch mode: `stop` (default), `continue`, or `ask` |
| `--version` | — | print version and exit |

---

## Commands

See `@rozek/sds-command` for full command reference. All commands available in `sds-jj` are identical to those in `sds-command` — the only difference is the CRDT backend used to store and synchronise data.

Quick reference:

| command | description |
| --- | --- |
| `token issue` | request a JWT from the server |
| `store info` | show store existence, entry count, and DB path |
| `store ping` | check WebSocket server reachability |
| `store sync` | exchange CRDT patches with the server |
| `store destroy` | permanently delete the local SQLite file |
| `store export` | export the store snapshot to stdout or a file |
| `store import` | merge a snapshot into the local store |
| `entry create` | create a new item or link |
| `entry get` | read fields of a single entry |
| `entry list` | list entries inside a container |
| `entry update` | modify an existing entry |
| `entry move` | move a live entry to a different container |
| `entry delete` | soft-delete (move to trash) |
| `entry restore` | restore a trashed entry |
| `entry purge` | permanently delete a trashed entry |
| `trash list` | list all entries in the trash |
| `trash purge-all` | permanently delete all trashed entries |
| `trash purge-expired` | permanently delete trashed entries older than a TTL |
| `tree show` | display the store as an ASCII tree |
| `shell` | open an interactive REPL |
| `--script <file>` | run commands from a file or stdin |

---

## Examples

```bash
# create an entry
sds-jj --store notes entry create --label "Draft" --mime text/plain

# show the full tree
sds-jj --store notes tree show

# sync with the server
sds-jj --store notes store sync
```

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek
