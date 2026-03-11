# @rozek/sds-command

CLI tool for the **shareable-data-store** (SDS) family. Provides a one-shot command line interface, an interactive REPL shell, and a batch script runner for managing CRDT stores, entries, items, links, and tokens.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Node.js 22.5+** | required to run `sds`. `npx` is included with Node.js — no separate install needed. Download from [nodejs.org](https://nodejs.org). |
| **SDS server** | only required for network operations (`store sync`, `store ping`, `token issue`). Local read/write commands work entirely offline against the SQLite file. |
| **JWT tokens** | server operations need a client token (`--token`, scope `read` or `write`) or an admin token (`--admin-token`, scope `admin`). Tokens are issued by the server's `POST /api/token` endpoint via `sds token issue`. |

SQLite support is built directly into Node.js since version 22.5 via the `node:sqlite` module — no separate database driver, no native C++ addon, and no build toolchain is needed. The `sds` binary therefore runs with **Node.js as its only dependency**.

> **Note on stability:** `node:sqlite` is classified as *Stability 1 — Experimental* in the Node.js 22 and 24 documentation. In practice the API has been stable since its introduction, with no breaking changes across any release. The experimental classification reflects the Node.js team's ongoing stabilisation process; the module is expected to reach *Stability 2 — Stable* with Node.js 26. The `sds` binary suppresses the associated runtime warning automatically.

---

## Installation

```bash
pnpm add @rozek/sds-command
```

Requires Node.js 22.5+. After installation the `sds` binary is available in the project's `node_modules/.bin/` directory and — when installed globally — directly on the `PATH`.

### Without installation via `npx`

`npx` can invoke `sds` directly without a global installation:

```bash
npx @rozek/sds-command entry get <id>
```

`npx` downloads `@rozek/sds-command` and all its dependencies on first use and caches them locally; subsequent invocations reuse the cached version. Every argument after `@rozek/sds-command` is passed directly to `sds`, so all commands, options, and global flags work exactly as documented below.

---

## Concepts

The tool supports three modes of operation:

| mode | how to trigger |
| --- | --- |
| one-shot | `sds <command> [options]` — runs a single command and exits |
| script | `sds --script <file>` — reads commands line-by-line from a file or stdin (`-`) |
| REPL | `sds shell` — opens an interactive read-eval-print loop |

`sds` without any arguments or sub-command prints the help text and exits.

Every command shares the same set of global options and environment variable overrides. Options take precedence over environment variables; environment variables take precedence over built-in defaults.

---

## Global options

| option | env var | description |
| --- | --- | --- |
| `--server <url>` | `SDS_SERVER_URL` | WebSocket server base URL |
| `--store <id>` | `SDS_STORE_ID` | Store identifier (= local SQLite file basename) |
| `--token <jwt>` | `SDS_TOKEN` | Client JWT with `read` or `write` scope |
| `--admin-token <jwt>` | `SDS_ADMIN_TOKEN` | Admin JWT with `admin` scope |
| `--data-dir <path>` | `SDS_DATA_DIR` | Directory for local SQLite files (default: `~/.sds`) |
| `--format <fmt>` | — | Output format: `text` (default) or `json` |
| `--on-error <action>` | — | Error handling in script/batch mode: `stop` (default), `continue`, or `ask`; ignored in the interactive REPL (which always continues on error) |

---

## Command reference

### `token`

```
sds token issue --sub <subject> --scope <scope> [--exp <duration>]
```

**`token issue`** requests a new JWT from the server's `POST /api/token` endpoint. Requires `--admin-token`. `--sub <subject>` sets the user identifier (required, e.g. an email address); `--scope` must be `read`, `write`, or `admin` (required); `--exp <duration>` sets the expiry as a number followed by `s`, `m`, `h`, or `d` (default: `24h`).

---

### `store`

```
sds store info
sds store ping
sds store sync [--timeout <ms>]
sds store destroy
sds store export [--encoding json|binary] [--output <file>]
sds store import --input <file>
```

**`store info`** shows existence, entry count, and DB path of the local store.

**`store ping`** checks WebSocket server reachability (requires `--server` and `--token`).

**`store sync`** connects to the server, exchanges CRDT patches, and disconnects. Use `--timeout <ms>` to wait longer on slow links (default: 5 000 ms).

**`store destroy`** permanently deletes the local SQLite file and its WAL/SHM companions.

**`store export`** writes the current store snapshot to a file or stdout. `--encoding json` (default) or `--encoding binary`; `--output <file>` writes to a file instead of stdout.

**`store import`** reads the snapshot file given by `--input <file>` and CRDT-merges it into the local store — conflicts are resolved automatically. Accepts both JSON and binary format (auto-detected).

---

### `entry`

Generic operations that work on both items and links. `<id>` accepts a canonical UUID or the aliases `root` and `trash`.

```
sds entry get <id> [--label] [--mime] [--value] [--info] [--info.<key>] [--target]
sds entry move <id> --to <targetId> [--at <index>]
sds entry delete <id>
sds entry restore <id> [--to <targetId>] [--at <index>]
sds entry purge <id>
```

**`entry get`** displays fields of an entry. Without display flags all available fields are shown. `--label` includes the label; `--mime` includes the MIME type (items only); `--value` includes the stored value (items only); `--info` includes the full info map as a JSON object; `--info.<key>` includes only the single info entry named `<key>` (output key: `info.<key>`); `--target` includes the target item's UUID (links only). `--mime`, `--value`, and `--info.<key>` are silently ignored for links; `--target` is silently ignored for items.

**`entry move`** moves a live entry to a different container. `--to <targetId>` is required; `--at <index>` sets the insertion position (default: append).

**`entry delete`** soft-deletes the entry by moving it to the trash.

**`entry restore`** moves a trashed entry back to a live container. The entry must already be in the trash. `--to <targetId>` sets the destination container (default: root); `--at <index>` sets the insertion position (default: append).

**`entry purge`** permanently deletes an entry. The entry must already be in the trash.

---

### `item`

```
sds item list <id> [--recursive] [--depth <n>] [--only items|links]
              [--label] [--mime] [--value] [--info] [--info.<key>]
sds item get <id> [--label] [--mime] [--value] [--info] [--info.<key>]
sds item create [--label <label>] [--mime <type>] [--container <itemId>]
                [--at <index>] [--value <string>] [--file <path>]
                [--info <json>] [--info.<key> <value>]
sds item update <id> [--label <label>] [--mime <type>] [--value <string>]
                     [--file <path>] [--info <json>] [--info.<key> <value>]
```

`item list` traverses the direct inner entries of a container item and prints one entry per line. Without display flags only the UUID of each entry is printed. `--recursive` enables a depth-first walk; `--depth <n>` limits the recursion depth (only effective with `--recursive`). `--only items` or `--only links` restricts output to one kind.

`item get` displays the details of a single item. Without display flags all fields are shown. The display flags (`--label`, `--mime`, `--value`, `--info`, `--info.<key>`) work exactly as described for `entry get`.

`item create` creates a new item and prints its UUID to stdout. If the store does not exist yet it is created automatically. `--value <string>` sets an initial text value; `--file <path>` reads the initial value from a file (binary for non-`text/` MIME types, UTF-8 otherwise) — the two options are mutually exclusive. `--info <json>` sets the info map from a JSON object; `--info.<key> <value>` sets individual keys. Both can be combined.

`item update` modifies an existing item. Only the fields explicitly specified are changed; all other fields keep their current values. `--info <json>` and `--info.<key> <value>` are merged into the existing info map (individual keys are added or overwritten, not replaced entirely).

---

### `link`

```
sds link get <id> [--label] [--target] [--info] [--info.<key>]
sds link create --target <itemId> [--container <itemId>] [--at <index>]
```

**`link get`** displays the details of a link. Without display flags all fields are shown. `--label` includes the link's label; `--target` includes the UUID of the item this link points to; `--info` includes the full info map as a JSON object; `--info.<key>` includes only the single info entry named `<key>`.

**`link create`** creates a new link pointing at the item given by `--target` (required) and prints the new link's UUID to stdout. `--container` sets the outer container item (default: root); `--at <index>` controls the insertion position (default: append). The store must already exist — unlike `item create`, `link create` does not create a new store.

---

### `trash`

```
sds trash list [--only items|links]
sds trash purge-all
sds trash purge-expired [--ttl <ms>]
```

**`trash list`** lists all entries currently in the trash. `--only items` or `--only links` restricts output to one kind.

**`trash purge-all`** permanently deletes every entry in the trash.

**`trash purge-expired`** permanently deletes trash entries older than `--ttl` milliseconds (default: 30 days = 2 592 000 000 ms).

---

### `tree`

```
sds tree show [--depth <n>]
```

Displays the entire store as an indented ASCII tree starting from the root item. `--depth <n>` limits the number of levels rendered; without `--depth` the full tree is shown.

---

### `shell`

```
sds shell
```

Opens an interactive REPL. Each line is parsed and executed as an `sds` command without the `sds` prefix. Blank lines and lines starting with `#` are ignored. Type `exit` or `quit` to close the session. Global options set when starting the shell (e.g. `sds --store mystore shell`) apply to every command in the session.

---

### `--script`

```
sds --script <file>
sds --script -        (read from stdin)
```

Reads commands from a file or stdin, executing them one per line (same syntax as the REPL). Error handling follows `--on-error`: `stop` aborts on the first error (default), `continue` keeps going, `ask` prompts interactively (TTY only).

---

### The `--info.<key>` pattern

Several commands support dynamically named info options where `<key>` is the name of an info map entry and is embedded directly in the option name:

**In read commands** (`entry get`, `item get`, `item list`, `link get`): `--info.<key>` (no value argument) selects a single info entry for output. For example, `--info.priority` outputs only the `info.priority` field instead of the full info map.

**In write commands** (`item create`, `item update`): `--info.<key> <value>` sets or updates one info entry. The value is parsed as JSON if valid, otherwise stored as a plain string. For example, `--info.priority high` stores the string `"high"` and `--info.count 42` stores the number `42`. Multiple `--info.<key>` options can be given in a single command; they are merged with any object supplied via `--info <json>`.

**Key naming rules**: `<key>` must be a valid JavaScript identifier — it may contain letters, digits, `_`, and `$`, but must not start with a digit and must not contain spaces, hyphens, dots, or other special characters. Examples of valid keys: `author`, `_private`, `$ref`, `createdAt`. Keys that violate this rule cause `sds` to exit with a usage error (exit code 2). The same rule applies to keys inside a JSON object supplied via `--info <json>`.

---

## Examples

### Local store — first steps

Create a store implicitly with the first `item create`, explore the resulting tree, then retrieve a specific item by its UUID:

```bash
# First item create also initialises the local SQLite store
sds --store notes item create --label "Recipes" --mime text/plain --value "Pasta: boil, sauce, enjoy"

# Show the full tree
sds --store notes tree show

# List root with labels and MIME types
sds --store notes item list root --label --mime

# Get a specific entry (UUID printed by item create)
sds --store notes item get <uuid> --label --value
```

---

### Store with persistence and synchronisation

Set environment variables once for the session so every command picks them up automatically:

```bash
export SDS_SERVER_URL=ws://my-sds-server.example.com
export SDS_STORE_ID=team-wiki
export SDS_TOKEN=eyJhbGci...

# Verify that the server is reachable
sds store ping

# Create items locally — persisted immediately to SQLite
sds item create --label "Meeting Notes" --mime text/plain
sds item create --label "Action Items"  --mime text/plain

# Push local CRDT patches to the server and pull remote changes
sds store sync

# Allow more time for patch exchange on a slow link
sds store sync --timeout 10000
```

The local SQLite file in `~/.sds/team-wiki.db` is updated on every write, so work continues safely while offline. `store sync` merges changes in both directions whenever a connection is available.

---

### Issuing client tokens

An admin token is required to issue scoped JWTs for regular clients:

```bash
# Write token for Alice, valid for 7 days
sds --server ws://my-sds-server.example.com \
    --admin-token $SDS_ADMIN_TOKEN \
    token issue --sub alice --scope write --exp 7d

# Read-only token for a public reader, valid for 30 days
sds --server ws://my-sds-server.example.com \
    --admin-token $SDS_ADMIN_TOKEN \
    token issue --sub reader --scope read --exp 30d
```

---

### Batch setup with a script file

A script file initialises a folder structure in one step:

```
# init-wiki.sds  — one command per line, # lines are comments
item create --label "Documentation" --mime text/plain
item create --label "Meeting Notes" --mime text/plain
item create --label "Decisions"     --mime text/plain
store sync
```

Run it against the configured store:

```bash
sds --store team-wiki --script init-wiki.sds
```

Pipe from stdin to avoid a temporary file:

```bash
printf 'item create --label "Quick note" --value "Remember this"\nstore sync\n' \
  | sds --store team-wiki --script -
```

---

### Interactive REPL session

The shell is useful for ad-hoc inspection and edits without retyping global flags:

```
$ sds --store team-wiki shell
SDS interactive shell — type "help" for commands, "exit" to quit
sds> store info
sds> item list root --label --mime
sds> item create --label "Ideas" --mime text/plain
sds> item get <uuid> --label --value
sds> tree show --depth 2
sds> store sync
sds> exit
```

---

## Exit codes

| code | constant | meaning |
| --- | --- | --- |
| 0 | `OK` | success |
| 1 | `GeneralError` | unspecified runtime error |
| 2 | `UsageError` | bad arguments or missing required option |
| 3 | `NotFound` | entry, store, or file not found |
| 4 | `Unauthorized` | authentication failed (missing or invalid token) |
| 5 | `NetworkError` | WebSocket or HTTP connection error |
| 6 | `Forbidden` | operation not permitted for this scope |

---

## License

MIT © Andreas Rozek