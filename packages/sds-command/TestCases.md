# Test Cases — @rozek/sds-command

> **Note — integration tests:** all sub-command integration tests (store, entry, trash, tree, REPL, script runner, CLI defaults) are implemented in `@rozek/sds-command-jj` (and the corresponding `-loro` / `-yjs` packages). Only the pure-logic unit tests live here.

## CF — Configuration (`resolveConfig`, `DBPathFor`)

| # | Description | Expected |
|---|---|---|
| CF-01 | `resolveConfig({})` with no env vars | `Format:'text'`, `OnError:'stop'`, `PersistenceDir:'~/.sds'` |
| CF-02 | `format:'json'` option | `Format:'json'` |
| CF-03 | `onError:'continue'` option | `OnError:'continue'` |
| CF-04 | option overrides matching env var | option value is used |
| CF-05 | `SDS_SERVER_URL` env var set, no `server` option | `ServerURL` reflects env var |
| CF-06 | `SDS_TOKEN` env var set, no `token` option | `Token` reflects env var |
| CF-07 | `DBPathFor` with a simple store ID | `<PersistenceDir>/<storeId>.db` |
| CF-08 | `DBPathFor` with special chars in store ID | chars outside `[a-zA-Z0-9_-]` replaced with `_` |
| CF-09 | `format:'unknown'` option | throws `SDS_ConfigError` with `UsageError` code |
| CF-10 | `onError:'unknown'` option | throws `SDS_ConfigError` with `UsageError` code |
| CF-11 | `server:'http://...'` or `server:'ftp://...'` (invalid scheme) | throws `SDS_ConfigError` with `UsageError` code |
| CF-12 | `server:'ws://...'` and `server:'wss://...'` (valid schemes) | accepted without error |

## CT — Command Tokeniser (`tokenizeLine`)

| # | Description | Expected |
|---|---|---|
| CT-01 | empty string | `[]` |
| CT-02 | whitespace-only string | `[]` |
| CT-03 | `'store info'` | `['store', 'info']` |
| CT-04 | multiple spaces between tokens | same as single space |
| CT-05 | `'"hello world"'` (double-quoted) | `['hello world']` |
| CT-06 | `"'foo bar'"` (single-quoted) | `['foo bar']` |
| CT-07 | unclosed quote | remaining input merged into last token |
| CT-08 | backslash-escaped space (`item\ get`) | `['item get']` as one token |
| CT-09 | `'\\"'` (escaped double-quote) | `['"']` |
| CT-10 | backslash-escaped double-quote inside a double-quoted string (`"say \"hi\""`) | `['say "hi"']` |
| CT-11 | inline comment (`tokens # comment`) | tokens before `#` returned; `#` and everything after stripped |
| CT-12 | line starting with `#` | `[]` |
| CT-13 | tab character between tokens | treated as whitespace |

## IP — Info-Entry Parsing (`extractInfoEntries`, `applyInfoToEntry`)

| # | Description | Expected |
|---|---|---|
| IP-01 | argv without `--info.<key>` tokens | `CleanArgv` unchanged, `InfoEntries:{}` |
| IP-02 | `['--info.color', '"red"', 'store', 'info']` | `CleanArgv:['store','info']`, `InfoEntries:{color:'red'}` |
| IP-03 | multiple `--info.<key>` pairs | all extracted; none remain in `CleanArgv` |
| IP-04 | numeric JSON value | parsed as number, not string |
| IP-05 | `applyInfoToEntry` with valid JSON object | all keys merged into info proxy |
| IP-06 | `applyInfoToEntry` with `InfoEntries` values | keys set on info proxy |
| IP-07 | `applyInfoToEntry` with `null` for both args | info proxy unchanged |
| IP-08 | `applyInfoToEntry` with malformed JSON string | throws `SDS_CommandError` with `UsageError` code |
| IP-09 | `--info.my-key value` (hyphen in key) | throws `SDS_CommandError` with `UsageError` code |
| IP-10 | `applyInfoToEntry` with JSON object containing key `"my-key"` | throws `SDS_CommandError` with `UsageError` code |
| IP-11 | `applyInfoToEntry` with `null` (valid JSON, not an object) | throws |
| IP-12 | `applyInfoToEntry` with `"hello"` (JSON string, not an object) | throws |
| IP-13 | `applyInfoToEntry` with `42` (JSON number, not an object) | throws |
| IP-14 | `--info.key=value` syntax (equals sign in token) | equivalent to `--info.key value`; key extracted, value parsed |
| IP-15 | `--info.flag` (no value argument follows) | `InfoEntries:{flag:true}` |
| IP-16 | key with valid JS identifier chars (`_`, `$`, letter, digit) | accepted without error |
| IP-17 | key starting with a digit (`--info.1st`) | throws `SDS_CommandError` with `UsageError` code |
| IP-18 | key with embedded dot (`--info.a.b=v`) | throws `SDS_CommandError` with `UsageError` code |
| IP-19 | empty key (`--info.=v`) | throws `SDS_CommandError` with `UsageError` code |
| IP-20 | `applyInfoToEntry` with JSON array (not an object) (`[1,2,3]`) | throws |
| IP-21 | `applyInfoToEntry` JSON object contains a key starting with a digit (`{"1st":"v"}`) | throws |
| IP-22 | `applyInfoToEntry` JSON object contains only valid JS identifier keys | accepted; all keys merged into proxy |
| IP-23 | `--info-delete.key` flag | `InfoDeleteKeys` contains `'key'`; flag absent from `CleanArgv` |
| IP-24 | multiple `--info-delete.<key>` flags | all keys collected into `InfoDeleteKeys`; none remain in `CleanArgv` |
| IP-25 | invalid key in `--info-delete.<key>` (e.g. `--info-delete.my-key`) | throws `SDS_CommandError` with `UsageError` code |
| IP-26 | `applyInfoToEntry` with non-empty `InfoDeleteKeys` | listed keys removed from proxy; other keys unchanged |

## SY — `runSync()` Unit Tests

| # | Description | Expected |
|---|---|---|
| SY-01 | `runSync()` without a store ID | throws `SDS_CommandError` with `UsageError` (code 2); message contains "no store ID" |
| SY-02 | `runSync()` without a server URL | throws `SDS_CommandError` with `UsageError` (code 2); message contains "no server URL" |
| SY-03 | `runSync()` with invalid URL scheme (e.g. `http://`) | throws `SDS_CommandError` with `UsageError` (code 2); message contains "invalid server URL" |
| SY-04 | `runSync()` without a token | throws `SDS_CommandError` with `UsageError` (code 2); message contains "no client token" |
| SY-05 | local SQLite patches exist; connection succeeds | `Network.sendPatch()` called once per stored patch; result `Connected:true` |

> **Integration tests (CLI-level):** `store sync --timeout` validation (SY-06, SY-07) and all sub-command tests (SI, SD, SE, EC, EG, EL, EM, TR, TW, CL, UE, EU, RP, DO, SR) are in `@rozek/sds-command-jj`.
