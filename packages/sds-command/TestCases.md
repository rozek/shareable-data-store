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
| CF-09 | `format:'unknown'` option | throws `SDS_ConfigError` with `UsageError` code |
| CF-10 | `onError:'unknown'` option | throws `SDS_ConfigError` with `UsageError` code |

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
| IP-11 | `applyInfoToEntry` with `null` (valid JSON, not an object) | throws |
| IP-12 | `applyInfoToEntry` with `"hello"` (JSON string, not an object) | throws |
| IP-13 | `applyInfoToEntry` with `42` (JSON number, not an object) | throws |

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
| SE-04 | `--encoding` with an invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--encoding` |
| SE-05 | `store import` with malformed JSON file | exits with `UsageError` (code 2); error mentions "valid JSON" |

## EC — Entry Create (`entry create`)

| # | Description | Expected |
|---|---|---|
| EC-01 | create item with defaults | prints UUID; `entry get` succeeds |
| EC-02 | `--target` creates a link; kind is `link` | prints UUID; `entry get` returns `kind: link` and `target` |
| EC-03 | `--mime` and `--label` set | stored correctly in `entry get` output |
| EC-04 | `--value` set | value returned by `entry get --value` |
| EC-05 | `--file` set | file content stored as item value |
| EC-06 | `--info.<key>` value | visible in `entry get --info` |
| EC-07 | non-existent container | exits with `NotFound` (code 3) |
| EC-08 | `--file` points to non-existent file | exits with `NotFound` (code 3) |
| EC-09 | `--at` is a non-integer (`abc`) | exits with `UsageError` (code 2) |
| EC-10 | `--target` with non-existent target | exits with `NotFound` (code 3) |
| EC-11 | `--mime` combined with `--target` | exits with `UsageError` (code 2); error mentions `--mime` and `link` |
| EC-12 | `--value` combined with `--target` | exits with `UsageError` (code 2); error mentions `--value` and `link` |
| EC-13 | `--file` combined with `--target` | exits with `UsageError` (code 2); error mentions `--file` and `link` |
| EC-14 | `--label` at link creation time | label stored; visible in subsequent `entry get` |
| EC-15 | `--info` at link creation time | info entries stored; visible in subsequent `entry get` |
| EC-16 | `--value` and `--file` together | exits with `UsageError` (code 2); error mentions both `--value` and `--file` |
| EC-17 | `--container` points to a link (not an item) | exits with `NotFound` (code 3); error mentions `not an item` |
| EC-18 | `--at -1` (negative index) | exits with `UsageError` (code 2); error mentions `--at` |

## EG — Entry Get (`entry get`)

| # | Description | Expected |
|---|---|---|
| EG-01 | well-known alias `root` | returns valid entry |
| EG-02 | non-existent UUID | exits with `NotFound` (code 3) |
| EG-03 | no field flags | all fields included |
| EG-04 | `--label` only | only label field in output |
| EG-05 | `--info.mykey` | only `info.mykey` field in output |
| EG-06 | `--kind` only | only `kind` field in output; no `label` or `mime` |
| EG-07 | `entry get` on a link with `--format json` | JSON output includes `kind: "link"` and `target` field; no `mime` or `value` |
| EG-08 | `entry get trash` (well-known alias) | exits with code 0; JSON includes `id` and `kind: "item"` |

## EL — Entry List (`entry list`)

| # | Description | Expected |
|---|---|---|
| EL-01 | list direct inner entries | returns only immediate entries |
| EL-02 | `--recursive` | traverses nested containers |
| EL-03 | `--only items` | excludes links |
| EL-04 | `--only links` | excludes items |
| EL-05 | `--depth 1` | limits traversal to one level |
| EL-06 | `--depth` is a non-integer (`abc`) | exits with `UsageError` (code 2) |
| EL-07 | `--only` with an invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--only` |
| EL-08 | passing a link ID as the container | exits with `NotFound` (code 3) |
| EL-09 | `entry list` in text format (no `--format json`) | exits with code 0; stdout contains one UUID per line; includes expected entry ID |
| EL-10 | `entry list --label` in text format | line for known entry contains both UUID and label text |
| EL-11 | `entry list --label` in JSON format | JSON array objects include a `label` field matching the stored label |
| EL-12 | `entry list root` (well-known alias) | exits with code 0; JSON array includes direct root-level entries |

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
| EM-09 | `entry move --at <non-integer>` | exits with `UsageError` (code 2) |
| EM-10 | `entry restore --at <non-integer>` | exits with `UsageError` (code 2) |
| EM-11 | `entry restore --to <container>` | entry appears in specified container; not in root |
| EM-12 | move an item into its own descendant (cycle) | exits with `Forbidden` (code 6) |
| EM-13 | `entry move --at -1` (negative index) | exits with `UsageError` (code 2); error mentions `--at` |
| EM-14 | `entry restore --at -5` (negative index) | exits with `UsageError` (code 2); error mentions `--at` |
| EM-15 | delete system entries (root, trash) | exits with `Forbidden` (code 6); error mentions "system entry" |

## TR — Trash Commands (`trash list`, `trash purge-all`, `trash purge-expired`)

| # | Description | Expected |
|---|---|---|
| TR-01 | `trash list` on empty trash | empty list (text: "(trash is empty)") |
| TR-02 | `trash list` after `entry delete` | deleted entry appears |
| TR-03 | `trash purge-all` | subsequent `trash list` returns empty list |
| TR-04 | `trash purge-expired --ttl 3153600000000` (≈ 100 years in ms) | no entries removed |
| TR-05 | `trash purge-expired --ttl 0` | exits with `UsageError` (code 2); error mentions `--ttl` |
| TR-06 | `--ttl` is a non-integer (`abc`) | exits with `UsageError` (code 2) |
| TR-07 | `trash list --only` with an invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--only` |
| TR-08 | `trash purge-expired --ttl -1` | exits with `UsageError` (code 2); error mentions `--ttl` |

## TW — Tree Show (`tree show`)

| # | Description | Expected |
|---|---|---|
| TW-01 | empty store (text) | output contains `root/` and `(empty)` |
| TW-02 | empty store (json) | `{ root: [] }` |
| TW-03 | one item in root | one node beneath root |
| TW-04 | `--depth 1` | only direct inner entries of root; no deeper nodes |
| TW-05 | `--depth` is a non-integer (`abc`) | exits with `UsageError` (code 2) |
| TW-07 | `--depth 0` with items present | exits with code 0; JSON `root` array is empty |
| TW-06 | `tree show` on a non-existent store | exits with `NotFound` (code 3) |

## CL — CLI default behaviour

| # | Description | Expected |
|---|---|---|
| CL-01 | `sds` with no arguments | prints help text and exits with code 0 |
| CL-02 | `sds shell` | opens interactive REPL |
| CL-03 | `--format` with invalid value (e.g. `xml`) | exits with `UsageError` (code 2); error mentions `--format` |
| CL-04 | `--on-error` with invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--on-error` |
| CL-05 | `sds --version` | exits with code 0; stdout matches semver pattern `\d+\.\d+\.\d+` |

## UE — Usage Error Output Order

| # | Description | Expected |
|---|---|---|
| UE-01 | unknown global option | error line in stderr precedes help text; exit code 2 |
| UE-02 | unknown sub-command (`store not-a-subcommand`) | error line in stderr precedes help text; exit code 2 |
| UE-03 | missing required option (`store import` without `--input`) | error line in stderr precedes help text; exit code 2 |

## EU — Entry Update (`entry update`)

| # | Description | Expected |
|---|---|---|
| EU-01 | `entry update <itemId> --label <new>` | label changed; subsequent `entry get` shows new label |
| EU-02 | `entry update <linkId> --label <new>` | label changed; subsequent `entry get` shows new label |
| EU-03 | `entry update <linkId> --mime <type>` | exits with `UsageError` (code 2); error message mentions `--mime` and `link` |
| EU-04 | `entry update` non-existent entry | exits with `NotFound` (code 3) |
| EU-05 | `entry update <id>` with no options | no-op; exits with code 0 |
| EU-06 | `entry update <itemId> --value <new>` | value changed; subsequent `entry get` shows new value |
| EU-07 | `entry update <itemId> --file` points to non-existent file | exits with `NotFound` (code 3) |
| EU-08 | `entry update <itemId> --value` and `--file` together | exits with `UsageError` (code 2); error mentions both `--value` and `--file` |
| EU-09 | `entry update <itemId> --mime application/json` | MIME type stored; visible in subsequent `entry get` |
| EU-10 | `entry update --info.author alice --info.version 1`, then `--info.version 2` only | `version` updated to `2`; `author` still `alice` (merge, not replace) |

## RP — REPL (`startREPL`)

| # | Description | Expected |
|---|---|---|
| RP-01 | blank line | ignored; no command executed |
| RP-02 | `# comment` line | ignored; no command executed |
| RP-03 | `exit` | session closes |
| RP-04 | `quit` | session closes |
| RP-05 | global options on `sds shell` start | available in every subsequent command (no "no store ID" error) |
| RP-06 | failing command in REPL | error printed; session continues; next command succeeds |
| RP-07 | unknown command in REPL | error printed; session continues; next command succeeds |
| RP-08 | `help` in REPL | available commands shown; session continues; `shell` not listed |
| RP-09 | failing command in REPL | error message goes to stderr (not stdout); stdout unaffected |

## DO — Duplicate Options

| # | Description | Expected |
|---|---|---|
| DO-01 | `entry create --label A --label B` | label stored is `B` (last value wins) |
| DO-02 | `entry update <id> --label A --label B` | label stored is `B` (last value wins) |
| DO-03 | `entry create --mime text/plain --mime application/json` | MIME type stored is `application/json` (last value wins) |

## SR — Script Runner (`runScript`)

| # | Description | Expected |
|---|---|---|
| SR-01 | `--on-error stop` with failing command | stops immediately; returns failing exit code |
| SR-02 | `--on-error continue` with failing command | continues; returns last non-zero exit code |
| SR-03 | non-existent script file | exits with `NotFound` (code 3) |
| SR-04 | global options on `sds --script` start | available in every script line (no "no store ID" error) |
| SR-05 | `--on-error ask` in non-TTY context | stdin is not a TTY — falls back to stop; exits after first failure |
| SR-06 | script file containing only blank lines and comments | exits with code 0; no error output |
