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
- All offline `store` sub-commands: `info`, `destroy`, `export`, `import`
- All `entry` sub-commands: `create`, `get`, `list`, `update`, `move`, `delete`, `restore`, `purge`
- All `trash` sub-commands: `list`, `purge-all`, `purge-expired`
- `tree show`
- REPL shell (`startREPL`) — line parsing, exit/quit, blank/comment lines, error recovery, `help`
- Script runner (`runScript`) — stop / continue / ask error handling
- Exit-code mapping for all error conditions

**Out of scope:**
- Network commands requiring a live WebSocket server: `store ping`, `store sync`, `token issue` (covered by `@rozek/sds-sync-engine` tests)
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

#### 1.3 Validation

- **TC-1.3.1** — A `format` option with an unrecognised value (e.g. `'unknown'`) throws `SDS_ConfigError` with a `UsageError` exit code
- **TC-1.3.2** — An `onError` option with an unrecognised value (e.g. `'unknown'`) throws `SDS_ConfigError` with a `UsageError` exit code

#### 1.4 Env-var fallback

- **TC-1.4.1** — When `SDS_SERVER_URL` is set and no `server` option is given, `ServerURL` reflects the env var
- **TC-1.4.2** — When `SDS_TOKEN` is set and no `token` option is given, `Token` reflects the env var

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
- **TC-10.4** — `--encoding` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--encoding`
- **TC-10.5** — Importing a file whose content begins with `{` or `[` but is not valid JSON exits with `UsageError` (code 2); error message mentions "valid JSON"

---

## Part V — Entry Commands

### 1. `entry create`

- **TC-11.1** — Creates a new item and prints its UUID; the UUID is valid in a subsequent `entry get`
- **TC-11.2** — `--mime` and `--label` are stored correctly
- **TC-11.3** — `--value` sets the item's string value; `--file` reads it from disk
- **TC-11.4** — `--info.<key>` values are stored in the item's info map
- **TC-11.5** — Creating in a non-existent container exits with `NotFound`
- **TC-11.6** — `--file` pointing to a non-existent path exits with `NotFound` (code 3)
- **TC-11.7** — `--at` with a non-integer value exits with `UsageError` (code 2)
- **TC-11.8** — With `--target` creates a link; `entry get --kind` returns `link`
- **TC-11.9** — `--target` pointing to a non-existent item exits with `NotFound`
- **TC-11.10** — `--mime` combined with `--target` exits with `UsageError` (code 2); error names the flag and mentions "link"
- **TC-11.11** — `--value` combined with `--target` exits with `UsageError` (code 2); error names the flag and mentions "link"
- **TC-11.12** — `--file` combined with `--target` exits with `UsageError` (code 2); error names the flag and mentions "link"
- **TC-11.13** — `--label` at link creation time is stored and visible in a subsequent `entry get`
- **TC-11.14** — `--info` at link creation time is stored and visible in a subsequent `entry get`
- **TC-11.15** — `--value` and `--file` together exit with `UsageError` (code 2); error message mentions both flags
- **TC-11.16** — `--container` pointing to a link (not an item) exits with `NotFound` (code 3); error mentions `not an item`
- **TC-11.17** — `--at` with a negative value exits with `UsageError` (code 2); error message mentions `--at`

### 2. `entry get`

- **TC-12.1** — Fetching the well-known alias `root` returns a valid entry
- **TC-12.2** — Fetching a non-existent ID exits with `NotFound`
- **TC-12.3** — With no field flags all fields are included; with `--label` only the label field is included
- **TC-12.4** — `--info.<key>` returns only the specified info key (e.g. `--info.mykey` emits `info.mykey: …`)
- **TC-12.5** — `--kind` alone returns only the `kind` field; no `label` or `mime` in the output
- **TC-12.6** — `entry get` on a link with `--format json` includes `kind: "link"` and `target` field; no `mime` or `value`
- **TC-12.7** — `entry get trash` (well-known alias) returns a valid entry with `id` and `kind: "item"`

### 3. `entry list`

- **TC-13.1** — Lists direct inner entries of the given container
- **TC-13.2** — `--recursive` traverses nested containers
- **TC-13.3** — `--only items` excludes links; `--only links` excludes items
- **TC-13.4** — `--depth 1` limits recursion to one level
- **TC-13.5** — `--depth` with a non-integer value exits with `UsageError` (code 2)
- **TC-13.6** — `--only` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--only`
- **TC-13.7** — Passing a link ID (not an item) as the container exits with `NotFound` (code 3)
- **TC-13.8** — Text format (no `--format json`) prints one UUID per line and includes the expected entry ID
- **TC-13.9** — `--label` flag in text format: the line for a known entry contains both the UUID and the label
- **TC-13.10** — `--label` flag in JSON format: each object in the array includes a `label` field
- **TC-13.11** — `entry list root` (well-known alias) lists direct root-level entries as a JSON array

### 4. `entry update`

- **TC-14.1** — `--label` on an item updates the label; subsequent `entry get` reflects the new value
- **TC-14.2** — `--label` on a link updates the label; subsequent `entry get` reflects the new value
- **TC-14.3** — `--mime`, `--value`, or `--file` on a link exits with `UsageError` (code 2) and the error message names the unsupported flag and mentions "link"
- **TC-14.4** — Calling `entry update` on a non-existent ID exits with `NotFound`
- **TC-14.5** — Calling `entry update <id>` with no options is a no-op and exits with code 0
- **TC-14.6** — `--value` changes the item value; subsequent `entry get` reflects it
- **TC-14.7** — `--file` pointing to a non-existent path exits with `NotFound` (code 3)
- **TC-14.8** — `--value` and `--file` together exit with `UsageError` (code 2); error message mentions both flags
- **TC-14.9** — `--mime <type>` on an item changes the stored MIME type; subsequent `entry get` reflects the new value
- **TC-14.10** — `--info.<key>` updates a single info key without replacing other existing keys (merge semantics)

### 5. `entry move`

- **TC-15.1** — Moving an item to a valid container succeeds
- **TC-15.2** — Attempting to move the root or trash item exits with `Forbidden`
- **TC-15.3** — Moving to a non-existent target exits with `NotFound`
- **TC-15.4** — `--at` with a non-integer value exits with `UsageError` (code 2)
- **TC-15.6** — `--at` with a negative value exits with `UsageError` (code 2); error message mentions `--at`
- **TC-15.5** — Attempting to move an item into its own descendant (cycle) exits with `Forbidden` (code 6)

### 6. `entry delete` / `entry restore` / `entry purge`

- **TC-16.1** — Deleting an item moves it to the trash; `trash list` includes it afterwards
- **TC-16.2** — Restoring a trashed item moves it back to root by default
- **TC-16.3** — `entry restore --to <container>` places the entry in the specified container, not root
- **TC-16.4** — `entry restore --at <non-integer>` exits with `UsageError` (code 2)
- **TC-16.8** — `entry restore --at` with a negative value exits with `UsageError` (code 2); error message mentions `--at`
- **TC-16.5** — Attempting to restore a live (non-trash) entry exits with `Forbidden`
- **TC-16.6** — Purging an entry that is not in the trash exits with `Forbidden`
- **TC-16.7** — Purging a trashed entry removes it permanently; `entry get` afterwards exits with `NotFound`

---

## Part VI — Trash Commands

### 1. `trash list`

- **TC-20.1** — Returns an empty list when the trash is empty
- **TC-20.2** — Returns deleted entries after at least one `entry delete` has been run
- **TC-20.3** — `--only` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--only`

### 2. `trash purge-all`

- **TC-21.1** — After `purge-all`, `trash list` returns an empty list

### 3. `trash purge-expired`

- **TC-22.1** — With a very large TTL (e.g. `--ttl 3153600000000`, ≈ 100 years in ms) no entries are removed
- **TC-22.2** — `--ttl 0` exits with `UsageError` (code 2); error message mentions `--ttl`
- **TC-22.3** — `--ttl` with a non-integer value exits with `UsageError` (code 2)
- **TC-22.4** — `--ttl -1` exits with `UsageError` (code 2); error message mentions `--ttl`

---

## Part VII — Tree

### 1. `tree show`

- **TC-23.1** — An empty store produces output containing only the `root/` header (text) or an empty `root` inner-entries array (JSON)
- **TC-23.2** — A store with one item produces exactly one tree node beneath root
- **TC-23.3** — `--depth 1` limits the output to direct inner entries of root
- **TC-23.4** — `--depth` with a non-integer value exits with `UsageError` (code 2)
- **TC-23.6** — `--depth 0` with items present: exits with code 0; JSON `root` array is empty (no entries shown at any depth)
- **TC-23.5** — Calling `tree show` when the store does not exist exits with `NotFound` (code 3)

---

## Part VIII — CLI Default Behaviour, REPL, and Script Runner

### 1. Default behaviour

- **TC-26.1** — `sds` with no arguments prints help text to stdout and exits with code 0
- **TC-26.2** — `sds shell` opens the interactive REPL
- **TC-26.3** — `--format` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--format`
- **TC-26.4** — `--on-error` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--on-error`
- **TC-26.5** — `sds --version` exits with code 0 and prints a semver version string to stdout

### 4. Usage error output order

- **TC-27.1** — An unknown global option produces a line containing `error:` in stderr followed by the full help text; the `error:` line appears before `Usage:`
- **TC-27.2** — An unknown command produces a line containing `error:` in stderr followed by the full help text; the `error:` line appears before `Usage:`
- **TC-27.3** — A missing required option (e.g. `store import` without `--input`) produces an `error:` line in stderr followed by the full help text; the `error:` line appears before `Usage:`

### 2. REPL

- **TC-24.1** — Blank lines are ignored
- **TC-24.2** — Lines starting with `#` are ignored
- **TC-24.3** — `exit` and `quit` close the session
- **TC-24.4** — Global options given at `sds shell` start (e.g. `--store`, `--data-dir`) are inherited by every command in the session
- **TC-24.5** — A failing command prints an error but does not end the session; subsequent commands succeed normally
- **TC-24.6** — An unknown command prints an error but does not end the session
- **TC-24.7** — `help` inside the REPL shows available commands and does not end the session; `shell` does not appear in the help output
- **TC-24.8** — A failing command in the REPL sends its error to stderr (not stdout); stdout is unaffected

### 3. Script runner — `--on-error` modes

- **TC-25.1** — `stop` (default): stops after the first failing command and returns its exit code
- **TC-25.2** — `continue`: continues after errors; returns the last non-zero exit code
- **TC-25.3** — A script file that does not exist causes an immediate error
- **TC-25.4** — Global options given at `sds --script` start (e.g. `--store`, `--data-dir`) are inherited by every script line
- **TC-25.5** — `ask` in non-TTY context falls back to `stop` behaviour (stdin not a TTY → `askContinue` returns false)
- **TC-25.6** — A script file containing only blank lines and comments exits with code 0 and produces no error output

### 5. Duplicate options

- **TC-28.1** — When `--label` is given twice (e.g. `--label A --label B`), the last value (`B`) is used; applies to `entry create`
- **TC-28.2** — When `--label` is given twice in `entry update`, the last value is used
- **TC-28.3** — When `--mime` is given twice in `entry create`, the last value is used

---

## Running the Tests

```bash
cd packages/sds-command
pnpm test:run
```
