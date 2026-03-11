# Test Plan — `@rozek/sds-command`

---

## Goal

Verify that the `sds` CLI tool correctly resolves configuration, tokenises input, parses info entries, and executes all sub-commands — producing the right output, exit codes, and side effects for both the `text` and `json` output formats.

---

## Scope

**In scope:**
- Configuration resolution (`resolveConfig`, `DBPathFor`) including env-var and option precedence
- Command tokenisation (`tokenizeLine`) for quoted strings, escapes, and edge cases
- Info-entry extraction and application (`extractInfoEntries`, `applyInfoToEntry`)
- All `store` sub-commands: `info`, `ping`, `sync`, `destroy`, `export`, `import`
- All `entry` sub-commands: `get`, `move`, `delete`, `restore`, `purge`
- All `item` sub-commands: `list`, `get`, `create`, `update`
- All `link` sub-commands: `get`, `create`
- All `trash` sub-commands: `list`, `purge-all`, `purge-expired`
- `tree show`
- `token issue`
- REPL shell (`startREPL`) — line parsing, exit/quit, blank/comment lines
- Script runner (`runScript`) — stop / continue / ask error handling
- Exit-code mapping for all error conditions

**Out of scope:**
- End-to-end WebSocket server integration (covered by `@rozek/sds-sync-engine` tests)
- JWT cryptographic validity (tested by `@rozek/websocket-server`)
- Concurrent multi-process store access

---

## Test Environment

- **Runtime:** Node.js 22+
- **Store backend:** in-memory or temp-dir SQLite via `@rozek/sds-persistence-node`
- **Test framework:** Vitest 2

---

## Part I — Configuration

### 1. `resolveConfig`

#### 1.1 Defaults

- **TC-1.1.1** — Calling `resolveConfig({})` with no options and no env vars produces `Format:'text'`, `OnError:'stop'`, and `DataDir` equal to `~/.sds`
- **TC-1.1.2** — `resolveConfig` ignores unknown option keys

#### 1.2 Option precedence

- **TC-1.2.1** — A `format` option of `'json'` sets `Format:'json'`
- **TC-1.2.2** — An `onError` option of `'continue'` sets `OnError:'continue'`
- **TC-1.2.3** — Options take precedence over env vars: when both `SDS_STORE_ID` and `store` option are set, the option wins

#### 1.3 Env-var fallback

- **TC-1.3.1** — When `SDS_SERVER_URL` is set and no `server` option is given, `ServerURL` reflects the env var
- **TC-1.3.2** — When `SDS_TOKEN` is set and no `token` option is given, `Token` reflects the env var

### 2. `DBPathFor`

- **TC-2.1** — The returned path combines `DataDir` and the store ID followed by `.db`
- **TC-2.2** — Characters outside `[a-zA-Z0-9_-]` in the store ID are replaced with `_`

---

## Part II — Command Tokeniser

### 1. Basic splitting

- **TC-3.1** — An empty string returns `[]`
- **TC-3.2** — A string with only whitespace returns `[]`
- **TC-3.3** — `'store info'` returns `['store', 'info']`
- **TC-3.4** — Multiple consecutive spaces between tokens are treated as a single delimiter

### 2. Quoted strings

- **TC-4.1** — `'"hello world"'` returns `['hello world']` (double quotes removed, spaces preserved)
- **TC-4.2** — `"'foo bar'"` returns `['foo bar']` (single quotes removed)
- **TC-4.3** — A quote opened but never closed includes all remaining input in the last token

### 3. Escape sequences

- **TC-5.1** — `'item\\ get'` (backslash-space) returns `['item get']` as one token
- **TC-5.2** — `'\\"'` returns `['"']` (escaped double-quote inside unquoted context)

---

## Part III — Info-Entry Parsing

### 1. `extractInfoEntries`

- **TC-6.1** — An argv without `--info.<key>` tokens returns `CleanArgv` unchanged and `InfoEntries` as `{}`
- **TC-6.2** — `['--info.color', '"red"', 'store', 'info']` returns `CleanArgv:['store','info']` and `InfoEntries:{color:'red'}`
- **TC-6.3** — Multiple `--info.<key>` pairs are all extracted; none remain in `CleanArgv`
- **TC-6.4** — A numeric JSON value is parsed as a number, not a string
- **TC-6.5** — A key that is not a valid JavaScript identifier (e.g. `--info.my-key`) throws a `SDS_CommandError` with `UsageError` code

### 2. `applyInfoToEntry`

- **TC-7.1** — Passing a valid JSON object string merges all keys into the info proxy
- **TC-7.2** — Passing `InfoEntries` with typed values sets those keys on the info proxy
- **TC-7.3** — `null` for both `--info` and `InfoEntries` leaves the info proxy unchanged
- **TC-7.4** — A malformed JSON string for `--info` throws a `SDS_CommandError` with `UsageError` code
- **TC-7.5** — A JSON object supplied via `--info` whose keys contain non-identifier characters (e.g. `"my-key"`) throws a `SDS_CommandError` with `UsageError` code

---

## Part IV — Store Commands

### 1. `store info`

- **TC-8.1** — When no store ID is configured, exits with `UsageError`
- **TC-8.2** — When the store does not exist locally, reports `exists:false` (JSON) or a "not found" message (text)
- **TC-8.3** — When the store exists, reports `exists:true`, non-negative `entryCount`, and a non-empty `dbPath`

### 2. `store destroy`

- **TC-9.1** — Deletes the SQLite file; a subsequent `store info` reports `exists:false`
- **TC-9.2** — Calling `destroy` on a non-existent store exits with `NotFound`

### 3. `store export` / `store import`

- **TC-10.1** — Export to a file then import into a new store: the imported store has the same entry count as the original
- **TC-10.2** — Binary export (`--encoding binary`) produces a gzip file (magic bytes `0x1f 0x8b`); binary import round-trips correctly
- **TC-10.3** — Import of a non-existent file exits with `NotFound`

---

## Part V — Entry Commands

### 1. `entry get`

- **TC-11.1** — Fetching the well-known alias `root` returns a valid entry
- **TC-11.2** — Fetching a non-existent ID exits with `NotFound`
- **TC-11.3** — With no field flags all fields are included; with `--label` only the label field is included
- **TC-11.4** — `--info.<key>` returns only the specified info key (e.g. `--info.mykey` emits `info.mykey: …`)

### 2. `entry move`

- **TC-12.1** — Moving an item to a valid container succeeds
- **TC-12.2** — Attempting to move the root or trash item exits with `Forbidden`
- **TC-12.3** — Moving to a non-existent target exits with `NotFound`

### 3. `entry delete` / `entry restore` / `entry purge`

- **TC-13.1** — Deleting an item moves it to the trash; `trash list` includes it afterwards
- **TC-13.2** — Restoring a trashed item moves it back to root (or the specified target)
- **TC-13.3** — Attempting to restore a live (non-trash) entry exits with `Forbidden`
- **TC-13.4** — Purging an entry that is not in the trash exits with `Forbidden`
- **TC-13.5** — Purging a trashed entry removes it permanently; `entry get` afterwards exits with `NotFound`

---

## Part VI — Item Commands

### 1. `item create`

- **TC-14.1** — Creates a new item and prints its UUID; the UUID is valid in a subsequent `item get`
- **TC-14.2** — `--mime` and `--label` are stored correctly
- **TC-14.3** — `--value` sets the item's string value; `--file` reads it from disk
- **TC-14.4** — `--info.<key>` values are stored in the item's info map
- **TC-14.5** — Creating in a non-existent container exits with `NotFound`

### 2. `item list`

- **TC-15.1** — Lists direct inner entries of the given container
- **TC-15.2** — `--recursive` traverses nested containers
- **TC-15.3** — `--only items` excludes links; `--only links` excludes items
- **TC-15.4** — `--depth 1` limits recursion to one level

### 3. `item get`

- **TC-16.1** — Returns all fields when no filter flags are given
- **TC-16.2** — `--info.<key>` returns only the specified info key
- **TC-16.3** — Fetching a link ID via `item get` exits with `NotFound`

### 4. `item update`

- **TC-17.1** — Updating `--label` changes the label; a subsequent `item get` reflects the change
- **TC-17.2** — Updating `--value` changes the value
- **TC-17.3** — Updating a non-existent item exits with `NotFound`

---

## Part VII — Link Commands

### 1. `link create`

- **TC-18.1** — Creates a link pointing to a valid target item; prints the new link UUID
- **TC-18.2** — Creating a link to a non-existent target exits with `NotFound`

### 2. `link get`

- **TC-19.1** — Returns label, target, and info when no filter flags are given
- **TC-19.2** — Fetching an item ID via `link get` exits with `NotFound`

---

## Part VIII — Trash Commands

### 1. `trash list`

- **TC-20.1** — Returns an empty list when the trash is empty
- **TC-20.2** — Returns deleted entries after at least one `entry delete` has been run

### 2. `trash purge-all`

- **TC-21.1** — After `purge-all`, `trash list` returns an empty list

### 3. `trash purge-expired`

- **TC-22.1** — With a very large TTL (e.g. `--ttl 3153600000000`, ≈ 100 years in ms) no entries are removed
- **TC-22.2** — With `--ttl 0` all entries are removed immediately

---

## Part IX — Tree

### 1. `tree show`

- **TC-23.1** — An empty store produces output containing only the `root/` header (text) or an empty `root` inner-entries array (JSON)
- **TC-23.2** — A store with one item produces exactly one tree node beneath root
- **TC-23.3** — `--depth 1` limits the output to direct inner entries of root

---

## Part X — CLI Default Behaviour, REPL, and Script Runner

### 1. Default behaviour

- **TC-26.1** — `sds` with no arguments prints help text to stdout and exits with code 0
- **TC-26.2** — `sds shell` opens the interactive REPL

### 2. REPL

- **TC-24.1** — Blank lines are ignored
- **TC-24.2** — Lines starting with `#` are ignored
- **TC-24.3** — `exit` and `quit` close the session

### 3. Script runner — `--on-error` modes

- **TC-25.1** — `stop` (default): stops after the first failing command and returns its exit code
- **TC-25.2** — `continue`: continues after errors; returns the last non-zero exit code
- **TC-25.3** — A script file that does not exist causes an immediate error

---

## Running the Tests

```bash
cd packages/sds-command
pnpm test:run
```
