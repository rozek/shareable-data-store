# Test Cases — @rozek/sds-command

## CF — Configuration (`resolveConfig`, `DBPathFor`)

| # | Description | Expected |
|---|---|---|
| CF-01 | `resolveConfig({})` with no env vars | `Format:'text'`, `OnError:'stop'`, `DataDir:'~/.sds'` |
| CF-02 | `format:'json'` option | `Format:'json'` |
| CF-03 | `onError:'continue'` option | `OnError:'continue'` |
| CF-04 | option overrides matching env var | option value is used |
| CF-05 | `SDS_SERVER_URL` env var set, no `server` option | `ServerURL` reflects env var |
| CF-06 | `SDS_TOKEN` env var set, no `token` option | `Token` reflects env var |
| CF-07 | `DBPathFor` with a simple store ID | `<DataDir>/<storeId>.db` |
| CF-08 | `DBPathFor` with special chars in store ID | chars outside `[a-zA-Z0-9_-]` replaced with `_` |

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

## SI — Store Info (`store info`)

| # | Description | Expected |
|---|---|---|
| SI-01 | no store ID configured | exits with `UsageError` (code 2) |
| SI-02 | store does not exist locally (text) | message contains "not found" |
| SI-03 | store does not exist locally (json) | `{ exists: false }` |
| SI-04 | store exists (json) | `{ exists:true, entryCount:≥0, dbPath:<non-empty> }` |

## SD — Store Destroy (`store destroy`)

| # | Description | Expected |
|---|---|---|
| SD-01 | destroy existing store | SQLite file deleted; subsequent `store info` shows `exists:false` |
| SD-02 | destroy non-existent store | exits with `NotFound` (code 3) |

## SE — Store Export / Import (`store export`, `store import`)

| # | Description | Expected |
|---|---|---|
| SE-01 | JSON export then import into new store | imported store has same entry count |
| SE-02 | binary export (`--encoding binary`) | file starts with gzip magic bytes; binary import round-trips correctly |
| SE-03 | import from non-existent file | exits with `NotFound` (code 3) |

## EG — Entry Get (`entry get`)

| # | Description | Expected |
|---|---|---|
| EG-01 | well-known alias `root` | returns valid entry |
| EG-02 | non-existent UUID | exits with `NotFound` (code 3) |
| EG-03 | no field flags | all fields included |
| EG-04 | `--label` only | only label field in output |
| EG-05 | `--info.mykey` | only `info.mykey` field in output |

## EM — Entry Move / Delete / Restore / Purge

| # | Description | Expected |
|---|---|---|
| EM-01 | move item to valid container | success; `entry get` shows new container |
| EM-02 | move root or trash entry | exits with `Forbidden` (code 6) |
| EM-03 | move to non-existent target | exits with `NotFound` (code 3) |
| EM-04 | delete item | entry appears in `trash list` |
| EM-05 | restore trashed item | entry moves back to root (or specified target) |
| EM-06 | restore live (non-trash) entry | exits with `Forbidden` (code 6) |
| EM-07 | purge entry not in trash | exits with `Forbidden` (code 6) |
| EM-08 | purge trashed entry | entry gone; subsequent `entry get` exits with `NotFound` |

## IC — Item Create (`item create`)

| # | Description | Expected |
|---|---|---|
| IC-01 | create with defaults | prints UUID; `item get` succeeds |
| IC-02 | `--mime` and `--label` set | stored correctly in `item get` output |
| IC-03 | `--value` set | value returned by `item get --value` |
| IC-04 | `--file` set | file content stored as item value |
| IC-05 | `--info.<key>` value | visible in `item get --info` |
| IC-06 | non-existent container | exits with `NotFound` (code 3) |

## IL — Item List (`item list`)

| # | Description | Expected |
|---|---|---|
| IL-01 | list direct inner entries | returns only immediate entries |
| IL-02 | `--recursive` | traverses nested containers |
| IL-03 | `--only items` | excludes links |
| IL-04 | `--only links` | excludes items |
| IL-05 | `--depth 1` | limits traversal to one level |

## IG — Item Get (`item get`)

| # | Description | Expected |
|---|---|---|
| IG-01 | no field flags | all fields in output |
| IG-02 | `--info.<key>` | only specified key in output |
| IG-03 | link UUID passed to `item get` | exits with `NotFound` (code 3) |

## IU — Item Update (`item update`)

| # | Description | Expected |
|---|---|---|
| IU-01 | `--label` update | subsequent `item get` shows new label |
| IU-02 | `--value` update | subsequent `item get --value` shows new value |
| IU-03 | non-existent item | exits with `NotFound` (code 3) |

## LC — Link Create / Get (`link create`, `link get`)

| # | Description | Expected |
|---|---|---|
| LC-01 | create link to valid target | prints UUID; `link get` succeeds |
| LC-02 | create link to non-existent target | exits with `NotFound` (code 3) |
| LC-03 | `link get` — no field flags | label, target, and info in output |
| LC-04 | item UUID passed to `link get` | exits with `NotFound` (code 3) |

## TR — Trash Commands (`trash list`, `trash purge-all`, `trash purge-expired`)

| # | Description | Expected |
|---|---|---|
| TR-01 | `trash list` on empty trash | empty list (text: "(trash is empty)") |
| TR-02 | `trash list` after `entry delete` | deleted entry appears |
| TR-03 | `trash purge-all` | subsequent `trash list` returns empty list |
| TR-04 | `trash purge-expired --ttl 3153600000000` (≈ 100 years in ms) | no entries removed |
| TR-05 | `trash purge-expired --ttl 0` | all trash entries removed |

## TW — Tree Show (`tree show`)

| # | Description | Expected |
|---|---|---|
| TW-01 | empty store (text) | output contains `root/` and `(empty)` |
| TW-02 | empty store (json) | `{ root: [] }` |
| TW-03 | one item in root | one node beneath root |
| TW-04 | `--depth 1` | only direct inner entries of root; no deeper nodes |

## CL — CLI default behaviour

| # | Description | Expected |
|---|---|---|
| CL-01 | `sds` with no arguments | prints help text and exits with code 0 |
| CL-02 | `sds shell` | opens interactive REPL |

## RP — REPL (`startREPL`)

| # | Description | Expected |
|---|---|---|
| RP-01 | blank line | ignored; no command executed |
| RP-02 | `# comment` line | ignored; no command executed |
| RP-03 | `exit` | session closes |
| RP-04 | `quit` | session closes |

## SR — Script Runner (`runScript`)

| # | Description | Expected |
|---|---|---|
| SR-01 | `--on-error stop` with failing command | stops immediately; returns failing exit code |
| SR-02 | `--on-error continue` with failing command | continues; returns last non-zero exit code |
| SR-03 | non-existent script file | exits with `NotFound` (code 3) |
