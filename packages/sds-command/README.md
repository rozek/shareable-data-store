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
| `--persistence-dir <path>` | `SDS_PERSISTENCE_DIR` | Directory for local SQLite files (default: `~/.sds`) |
| `--format <fmt>` | — | Output format: `text` (default) or `json`; any other value exits with code 2 |
| `--on-error <action>` | — | Error handling in script/batch mode: `stop` (default), `continue`, or `ask`; ignored in the interactive REPL (which always continues on error); any other value exits with code 2 |
| `--version` | — | Print the installed `sds` version number and exit with code 0 |

---

## General behavior

### Repeated options

When the same option is supplied more than once on the command line, **the last occurrence wins**. For example:

```bash
sds --store notes entry create --label "Draft" --label "Final"
# stored label: "Final"
```

This applies to all single-value options (`--label`, `--mime`, `--value`, `--file`, `--target`, `--container`, `--at`, `--info`, `--depth`, `--only`, `--to`, `--ttl`, etc.). The `--info.<key>` pattern follows the same rule: if `--info.author alice` and `--info.author bob` are both given, only `bob` is stored.

---

## Command reference

### `token`

```
sds token issue --sub <subject> --scope <scope> [--exp <duration>]
```

`token issue` requests a new JWT from the server's `POST /api/token` endpoint. Requires `--admin-token`. `--sub <subject>` sets the user identifier (required, e.g. an email address); `--scope` must be `read`, `write`, or `admin` (required); `--exp <duration>` sets the expiry as a number followed by `s`, `m`, `h`, or `d` (default: `24h`).

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

`store info` shows existence, entry count, and DB path of the local store. JSON output: `{ storeId, exists: false }` when not found, or `{ storeId, exists: true, entryCount, dbPath }` when found.

`store ping` checks WebSocket server reachability (requires `--server` and `--token`).

`store sync` connects to the server, exchanges CRDT patches, and disconnects. Use `--timeout <ms>` to wait longer on slow links (default: 5 000 ms).

`store destroy` permanently deletes the local SQLite file and its WAL/SHM companions. JSON output: `{ storeId, destroyed: true }`.

`store export` writes the current store snapshot to a file or stdout. `--encoding json` (default) or `--encoding binary`; any other value exits with code 2. `--output <file>` writes to a file instead of stdout — if the file already exists it is silently overwritten. JSON output (with `--format json --output`): `{ exported: true, file: "<path>", format: "json"|"binary" }`.

`store import` reads the snapshot file given by `--input <file>` and CRDT-merges it into the local store — conflicts are resolved automatically. Accepts both JSON and binary format (auto-detected). If the file content begins with `{` or `[` but is not valid JSON, the command exits with code 2. JSON output: `{ imported: true, file: "<path>" }`.

---

### `entry`

All entry operations — creating, reading, listing, and modifying both items and links — are handled by a single `entry` command group. `<id>` accepts a canonical UUID or the well-known aliases `root`, `trash`, and `lost-and-found` (also accepted without hyphens as `lostandfound`).

```
sds entry create [--target <item-id>] [--container <item-id>] [--at <index>]
                 [--label <label>] [--mime <type>] [--value <string>] [--file <path>]
                 [--info <json>] [--info.<key> <value>] [--info-delete.<key>]
sds entry get    <id> [--kind] [--label] [--mime] [--value] [--info] [--info.<key>] [--target]
sds entry list   <id> [--recursive] [--depth <n>] [--only items|links]
                      [--label] [--mime] [--value] [--info] [--info.<key>]
sds entry update <id> [--label <label>] [--mime <type>] [--value <string>]
                      [--file <path>] [--info <json>] [--info.<key> <value>] [--info-delete.<key>]
sds entry move   <id> --to <target-id> [--at <index>]
sds entry delete <id>
sds entry restore <id> [--to <target-id>] [--at <index>]
sds entry purge  <id>
```

`entry create` creates a new entry and prints its UUID to stdout. Without `--target` an **item** is created; `--target <item-id>` creates a **link** pointing at that item instead. If the store does not exist yet it is created automatically (items only — for links the store must already exist). `--container <item-id>` sets the outer container (default: root) — also accepts the well-known aliases `root` and `lost-and-found`; the container must be an item, not a link; passing a link ID exits with code 3 (NotFound). `--at <index>` controls the insertion position as a zero-based integer (0 = first, default: append at end); a negative value exits with code 2; a value larger than the current child count is silently clamped to the end. `--label <label>` sets an initial label; `--info <json>` and `--info.<key> <value>` set initial info entries; `--info-delete.<key>` is accepted for consistency with `entry update` but is a no-op on a new entry (there are no existing keys to remove). Item-only options (`--mime`, `--value`, `--file`) exit with code 2 when combined with `--target`. `--value` and `--file` are mutually exclusive; using both at once exits with code 2. JSON output: `{ id, created: true, kind: "item" }` for items, `{ id, created: true, kind: "link", target: "<target-id>" }` for links.

`entry get` displays fields of an entry. Without display flags all available fields are shown. `--kind` returns `item` or `link`; `--label` includes the label; `--mime` includes the MIME type (items only); `--value` includes the stored value (items only); `--info` includes the full info map as a JSON object; `--info.<key>` includes only the single info entry named `<key>` (output key: `info.<key>`); `--target` includes the target item's UUID (links only). `--mime`, `--value`, and `--info.<key>` are silently ignored for links; `--target` is silently ignored for items. JSON output: `{ id, [kind], [label], [mime], [value], [info], [target] }` — only the requested fields are included; `mime`, `value`, and `info` only appear for items; `target` only appears for links.

`entry list` traverses the direct inner entries of a container item and prints one entry per line. The container `<id>` accepts a canonical UUID or the well-known aliases `root`, `trash`, and `lost-and-found` (also `lostandfound` without hyphens). Without display flags only the UUID of each entry is printed. `--recursive` enables a depth-first walk; `--depth <n>` limits the recursion depth (only effective with `--recursive`). `--only items` (or the singular form `--only item`) restricts output to items; `--only links` (or `--only link`) restricts to links; any other value exits with code 2. The display flags (`--label`, `--mime`, `--value`, `--info`, `--info.<key>`) work exactly as described for `entry get`. JSON output: array of `{ id, kind, [label], [mime], [value], [info] }` — `id` and `kind` are always present; additional fields follow the same display-flag rules as `entry get`.

`entry update` modifies an existing entry — works on both items and links. Only explicitly specified fields are changed. `--label` is accepted for both kinds. `--mime`, `--value`, and `--file` are items-only; using them on a link exits with code 2. `--value` and `--file` are mutually exclusive; using both at once exits with code 2. `--info <json>` and `--info.<key> <value>` are merged into the existing info map (individual keys are added or overwritten, not replaced entirely). `--info-delete.<key>` removes a single key from the info map; any number of delete flags may be combined with `--info` and `--info.<key>` flags in the same command. JSON output: `{ id, updated: true }`.

`entry move` moves a live entry to a different container. `--to <target-id>` is required and also accepts the well-known aliases `root`, `trash`, and `lost-and-found`; `--at <index>` sets the insertion position as a zero-based integer (0 = first, default: append at end); a negative value exits with code 2; a value larger than the current child count is silently clamped to the end. Moving an entry into its own descendant exits with code 6 (Forbidden). JSON output: `{ id, movedTo: "<target-id>", at: <index>|"end" }`.

`entry delete` soft-deletes the entry by moving it to the trash. System entries (`root`, `trash`, `lost-and-found`) cannot be deleted — attempting to do so exits with code 6 (Forbidden). JSON output: `{ id, deleted: true }`.

`entry restore` moves a trashed entry back to a live container. The entry must already be in the trash; attempting to restore a live entry exits with code 6 (Forbidden). `--to <target-id>` sets the destination container (default: root) — also accepts the well-known aliases `root` and `lost-and-found`; `--at <index>` sets the insertion position as a zero-based integer (0 = first, default: append at end); a negative value exits with code 2; a value larger than the current child count is silently clamped to the end. JSON output: `{ id, restoredTo: "<target-id>", at: <index>|"end" }`.

`entry purge` permanently deletes an entry. The entry must already be in the trash; purging a live entry exits with code 6 (Forbidden). JSON output: `{ id, purged: true }`.

---

### `trash`

```
sds trash list [--only items|links]
sds trash purge-all
sds trash purge-expired [--ttl <ms>]
```

`trash list` lists all entries currently in the trash. `--only items` (or `--only item`) restricts to items; `--only links` (or `--only link`) restricts to links; any other value exits with code 2. JSON output: array of `{ id, kind: "item"|"link", label }`.

`trash purge-all` permanently deletes every entry in the trash. JSON output: `{ purged: <count> }`.

`trash purge-expired` permanently deletes trash entries older than `--ttl` milliseconds (default: 30 days = 2 592 000 000 ms). `--ttl` must be a positive integer; zero or negative values exit with code 2 (UsageError). JSON output: `{ purged: <count>, ttlMs: <n> }`.

---

### `tree`

```
sds tree show [--depth <n>]
```

Displays the entire store as an indented ASCII tree starting from the root item. `--depth <n>` limits the number of levels rendered; without `--depth` the full tree is shown. JSON output: `{ root: [<tree-node>, ...] }` where each tree node is `{ Id, Kind, Label, [TargetId], Children: [...] }` — `TargetId` is present only for link nodes.

---

### `shell`

```
sds shell
```

Opens an interactive REPL. Each line is parsed and executed as an `sds` command without the `sds` prefix. Blank lines and lines starting with `#` are ignored. Type `exit` or `quit` to close the session. Global options set when starting the shell (e.g. `sds --store mystore shell`) apply to every command in the session. The prompt is displayed in bold to help distinguish it from command output.

The REPL continues after errors — a failing command prints the error message but does not end the session.

**Getting help inside the REPL:**

| what you type | what you get |
| --- | --- |
| `help` | list of all available commands |
| `help <command>` | help for a top-level command group (e.g. `help entry`) |
| `<command> --help` | help for a command or sub-command (e.g. `entry list --help`) |

---

### `--script`

```
sds --script <file>
sds --script -        (read from stdin)
```

Reads commands from a file or stdin, executing them one per line (same syntax as the REPL). Error handling follows `--on-error`: `stop` aborts on the first error (default), `continue` keeps going, `ask` prompts interactively (TTY only). Global options set at invocation time (e.g. `sds --store mystore --script file.sds`) apply to every command in the script — individual lines do not need to repeat them.

---

### The `--info.<key>` pattern

Several commands support dynamically named info options where `<key>` is the name of an info map entry and is embedded directly in the option name:

**In read commands** (`entry get`, `entry list`): `--info.<key>` (no value argument) selects a single info entry for output. For example, `--info.priority` outputs only the `info.priority` field instead of the full info map.

**In write commands** (`entry create`, `entry update`): `--info.<key> <value>` sets or updates one info entry. The value is parsed as JSON if valid, otherwise stored as a plain string. For example, `--info.priority high` stores the string `"high"` and `--info.count 42` stores the number `42`. Multiple `--info.<key>` options can be given in a single command; they are merged with any object supplied via `--info <json>`.

**Key naming rules**: `<key>` must be a valid JavaScript identifier — it may contain letters, digits, `_`, and `$`, but must not start with a digit and must not contain spaces, hyphens, dots, or other special characters. Examples of valid keys: `author`, `_private`, `$ref`, `createdAt`. Keys that violate this rule cause `sds` to exit with a usage error (exit code 2). The same rule applies to keys inside a JSON object supplied via `--info <json>`.

### The `--info-delete.<key>` pattern

**In write commands** (`entry create`, `entry update`): `--info-delete.<key>` (no value argument) removes a single info entry from the stored info map. For example, `--info-delete.author` removes the `author` key. Multiple `--info-delete.<key>` flags can be combined with `--info` and `--info.<key>` flags in the same command — all changes are applied together. On `entry create` the flag is accepted but has no effect (there are no existing keys to remove). The same key-naming rules apply: `<key>` must be a valid JavaScript identifier.

**Conflict rule — delete wins**: If the same key is specified by both `--info.<key>` (or `--info <json>`) and `--info-delete.<key>` in the same command, the delete takes precedence and the key will be absent after the command. The write is applied first and the delete second, regardless of the order the flags appear on the command line.

---

## Examples

### Local store — first steps

Create a store implicitly with the first `entry create`, explore the resulting tree, then retrieve a specific entry by its UUID:

```bash
# First entry create also initialises the local SQLite store
sds --store notes entry create --label "Recipes" --mime text/plain --value "Pasta: boil, sauce, enjoy"

# Show the full tree
sds --store notes tree show

# List root with labels and MIME types
sds --store notes entry list root --label --mime

# Get a specific entry (UUID printed by entry create)
sds --store notes entry get <uuid> --label --value
```

---

### Working with info metadata

Attach arbitrary key/value metadata to entries, update individual keys, and remove keys that are no longer needed:

```bash
# Create an entry with two info keys
sds --store notes entry create --label "Report Q1" \
    --info.author "alice" --info.status "draft"

# Update the status, add a reviewer key, and remove the now-unnecessary author key
# All three changes happen atomically in a single command
sds --store notes entry update <uuid> \
    --info.status "final" \
    --info.reviewer "bob" \
    --info-delete.author

# Conflict rule: if the same key appears in both --info.<key> and --info-delete.<key>,
# the delete always wins and the key is absent after the command
sds --store notes entry update <uuid> \
    --info.status "published" \
    --info-delete.status
# → "status" will NOT be present in the info map afterwards
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
sds entry create --label "Meeting Notes" --mime text/plain
sds entry create --label "Action Items"  --mime text/plain

# Push local CRDT patches to the server and pull remote changes
sds store sync

# Allow more time for patch exchange on a slow link
sds store sync --timeout 10000
```

The local SQLite file in `~/.sds/team-wiki.db` is updated on every write, so work continues safely while offline. `store sync` merges changes in both directions whenever a connection is available.

**Setting up on a new machine:** if the store already exists on the server and you want to fetch its full current state, run `store sync` first — before any `entry` or `tree` commands. `store sync` bootstraps the local SQLite file from scratch when it does not yet exist:

```bash
export SDS_SERVER_URL=ws://my-sds-server.example.com
export SDS_STORE_ID=team-wiki
export SDS_TOKEN=eyJhbGci...

# download the full store from the server (creates the local SQLite file)
sds store sync

# the local store is now populated — all commands work offline from here
sds tree show
```

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
entry create --label "Documentation" --mime text/plain
entry create --label "Meeting Notes" --mime text/plain
entry create --label "Decisions"     --mime text/plain
store sync
```

Run it against the configured store:

```bash
sds --store team-wiki --script init-wiki.sds
```

Pipe from stdin to avoid a temporary file:

```bash
printf 'entry create --label "Quick note" --value "Remember this"\nstore sync\n' \
  | sds --store team-wiki --script -
```

---

### Interactive REPL session

The shell is useful for ad-hoc inspection and edits without retyping global flags:

```
$ sds --store team-wiki shell
SDS interactive shell — type "help [command]" for help, "exit" to quit
sds> store info
sds> entry list root --label --mime
sds> entry create --label "Ideas" --mime text/plain
sds> entry get <uuid> --label --value --kind
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

[MIT License](../../LICENSE.md) © Andreas Rozek