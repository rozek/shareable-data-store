# Test Plan — `@rozek/sds-command`

---

## Goal

Verify that the pure-logic components of `@rozek/sds-command` — configuration resolution, command tokenisation, info-entry parsing, and the `runSync()` validation/upload logic — are correct in isolation, without spawning the CLI binary or requiring a live store backend.

> **Integration tests:** all sub-command integration tests (store, entry, trash, tree, REPL, script runner, CLI defaults) require the CLI binary and a real SQLite store. They are implemented in `@rozek/sds-command-jj` (and the corresponding `-loro` / `-yjs` packages).

---

## Scope

**In scope:**
- Configuration resolution (`resolveConfig`, `DBPathFor`) including env-var and option precedence
- Command tokenisation (`tokenizeLine`) for quoted strings, escapes, and edge cases
- Info-entry extraction and application (`extractInfoEntries`, `applyInfoToEntry`)
- `runSync()` unit tests — input validation and upload behaviour (mocked providers)

**Out of scope:**
- All `store`, `entry`, `trash`, and `tree` sub-commands (integration tests in `@rozek/sds-command-jj`)
- REPL shell (`startREPL`) and script runner (`runScript`) (integration tests in `@rozek/sds-command-jj`)
- CLI-level `--timeout` validation for `store sync` (tested in `@rozek/sds-command-jj`)
- Network commands requiring a live WebSocket server
- JWT cryptographic validity (tested by `@rozek/sds-websocket-server`)

---

## Test Environment

- **Runtime:** Node.js 22+
- **Test framework:** Vitest 2
- **External dependencies:** none — all tested logic is pure TypeScript with no binary spawn

---

## Part I — Configuration

### 1. `resolveConfig`

#### 1.1 Defaults

- **TC-1.1.1** — Calling `resolveConfig({})` with no options and no env vars produces `Format:'text'`, `OnError:'stop'`, and `PersistenceDir` equal to `~/.sds`
- **TC-1.1.2** — `resolveConfig` ignores unknown option keys

#### 1.2 Option precedence

- **TC-1.2.1** — A `format` option of `'json'` sets `Format:'json'`
- **TC-1.2.2** — An `onError` option of `'continue'` sets `OnError:'continue'`
- **TC-1.2.3** — Options take precedence over env vars: when both `SDS_STORE_ID` and `store` option are set, the option wins

#### 1.3 Validation

- **TC-1.3.1** — A `format` option with an unrecognised value (e.g. `'unknown'`) throws `SDS_ConfigError` with a `UsageError` exit code
- **TC-1.3.2** — An `onError` option with an unrecognised value (e.g. `'unknown'`) throws `SDS_ConfigError` with a `UsageError` exit code
- **TC-1.3.3** — A `server` option whose value does not start with `ws://` or `wss://` (e.g. `'http://…'`, `'ftp://…'`) throws `SDS_ConfigError` with a `UsageError` exit code
- **TC-1.3.4** — A `server` option starting with `ws://` or `wss://` is accepted without error

#### 1.4 Env-var fallback

- **TC-1.4.1** — When `SDS_SERVER_URL` is set and no `server` option is given, `ServerURL` reflects the env var
- **TC-1.4.2** — When `SDS_TOKEN` is set and no `token` option is given, `Token` reflects the env var

### 2. `DBPathFor`

- **TC-2.1** — The returned path combines `PersistenceDir` and the store ID followed by `.db`
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
- **TC-5.3** — A backslash-escaped double-quote inside a double-quoted string (e.g. `"say \\"hi\\""`) returns the literal quote character in the token

### 4. Comments

- **TC-5.4** — A `#` character (preceded by a space) outside any quoted string strips the `#` and everything after it; the preceding tokens are returned
- **TC-5.5** — A line whose first character is `#` returns `[]`

### 5. Tabs

- **TC-5.6** — A tab character between tokens is treated as whitespace

---

## Part III — Info-Entry Parsing

### 1. `extractInfoEntries`

- **TC-6.1** — An argv without `--info.<key>` tokens returns `CleanArgv` unchanged and `InfoEntries` as `{}`
- **TC-6.2** — `['--info.color', '"red"', 'store', 'info']` returns `CleanArgv:['store','info']` and `InfoEntries:{color:'red'}`
- **TC-6.3** — Multiple `--info.<key>` pairs are all extracted; none remain in `CleanArgv`
- **TC-6.4** — A numeric JSON value is parsed as a number, not a string
- **TC-6.5** — A key that is not a valid JavaScript identifier (e.g. `--info.my-key`) throws a `SDS_CommandError` with `UsageError` code
- **TC-6.6** — `--info.key=value` syntax (equals sign embedded in the token) is accepted; the key and value are extracted correctly
- **TC-6.7** — `--info.flag` with no following value argument sets `flag:true` in `InfoEntries`
- **TC-6.8** — Keys using valid JS identifier characters (`_`, `$`, letters, digits not in first position) are accepted without error
- **TC-6.9** — A key starting with a digit (e.g. `--info.1st`) throws a `SDS_CommandError` with `UsageError` code
- **TC-6.10** — A key containing an embedded dot (e.g. `--info.a.b=v`) throws a `SDS_CommandError` with `UsageError` code
- **TC-6.11** — An empty key (e.g. `--info.=v`) throws a `SDS_CommandError` with `UsageError` code
- **TC-6.12** — `--info-delete.key` is extracted into `InfoDeleteKeys`; the flag does not appear in `CleanArgv` *(see IP-23)*
- **TC-6.13** — Multiple `--info-delete.<key>` flags are all collected into `InfoDeleteKeys` *(see IP-24)*
- **TC-6.14** — An invalid key in `--info-delete.<key>` (e.g. `--info-delete.my-key`) throws a `SDS_CommandError` with `UsageError` code *(see IP-25)*

### 2. `applyInfoToEntry`

- **TC-7.1** — Passing a valid JSON object string merges all keys into the info proxy
- **TC-7.2** — Passing `InfoEntries` with typed values sets those keys on the info proxy
- **TC-7.3** — `null` for both `--info` and `InfoEntries` leaves the info proxy unchanged
- **TC-7.4** — A malformed JSON string for `--info` throws a `SDS_CommandError` with `UsageError` code
- **TC-7.5** — A JSON object supplied via `--info` whose keys contain non-identifier characters (e.g. `"my-key"`) throws a `SDS_CommandError` with `UsageError` code
- **TC-7.6** — A JSON value that is not an object (e.g. `null`, `"string"`, `42`, `[1,2,3]`) throws
- **TC-7.7** — A JSON object whose keys contain a key starting with a digit throws
- **TC-7.8** — A JSON object whose keys are all valid JS identifiers is accepted; all keys are merged into the proxy
- **TC-7.9** — Passing a non-empty `InfoDeleteKeys` removes those keys from the proxy; other keys remain *(see IP-26)*

---

## Part IV — `runSync()` Unit Tests

These tests exercise the `runSync()` helper directly with mocked persistence and network providers (no real SQLite file or WebSocket connection). They cover input validation and the bidirectional upload logic.

### 1. Input validation

- **TC-SY-1** — Calling `runSync()` with no `StoreId` in the config throws a `SDS_CommandError` with `UsageError` exit code (2) and a message containing "no store ID"
- **TC-SY-2** — Calling `runSync()` with no `ServerURL` throws a `SDS_CommandError` with `UsageError` exit code (2) and a message containing "no server URL"
- **TC-SY-3** — Calling `runSync()` with a `ServerURL` that does not start with `ws://` or `wss://` throws a `SDS_CommandError` with `UsageError` exit code (2) and a message containing "invalid server URL"
- **TC-SY-4** — Calling `runSync()` with no `Token` throws a `SDS_CommandError` with `UsageError` exit code (2) and a message containing "no client token"

### 2. Upload behaviour

- **TC-SY-5** — When the persistence provider returns a stored snapshot and the mock network provider fires `'connected'`, `runSync()` calls `Network.sendPatch()` with a non-empty full-state export (via `Store.exportPatch()`) and resolves with `Connected:true`

> **Note:** CLI-level `store sync --timeout` validation (SY-06, SY-07) requires the spawned binary and is tested in `@rozek/sds-command-jj`.

---

## Running the Tests

```bash
cd packages/sds-command
pnpm test:run
```
