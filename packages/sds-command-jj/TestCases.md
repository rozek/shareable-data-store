# Test Cases — `@rozek/sds-command-jj`

All tests spawn the built `dist/sds-command-jj.js` binary. Exit codes and stdout/stderr are checked directly.

---

## CL — Binary Startup

| # | Description | Expected |
|---|---|---|
| CL-01 | `sds-jj` with no arguments | prints help text; exits with code 0 |
| CL-02 | `sds-jj shell` with empty stdin | exits with code 0 |
| CL-03 | `--format` with invalid value (e.g. `xml`) | exits with `UsageError` (code 2); error mentions `--format` |
| CL-04 | `--on-error` with invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--on-error` |
| CL-05 | `sds-jj --version` | exits with code 0; stdout matches semver pattern `\d+\.\d+\.\d+` |
| CL-06 | `sds-jj help entry` | exits with code 0; stdout contains `sds entry` and `create`; no error on stderr |

## UE — Usage Error Output Ordering

| # | Description | Expected |
|---|---|---|
| UE-01 | unknown global option | `error:` line in stderr precedes help text; exit code 2 |
| UE-02 | unknown command | `error:` line in stderr precedes help text; exit code 2 |
| UE-03 | missing required option (`store import` without `--input`) | `error:` line in stderr precedes help text; exit code 2 |

## SI — Store Info

| # | Description | Expected |
|---|---|---|
| SI-01 | no store ID configured | exits with `UsageError` (code 2) |
| SI-02 | non-existent store (text) | message contains "not found" |
| SI-03 | non-existent store (json) | `{ exists: false }` |
| SI-04 | existing store (json) | `{ exists: true, entryCount: ≥1, dbPath: <non-empty> }` |

## SD — Store Destroy

| # | Description | Expected |
|---|---|---|
| SD-01 | destroy existing store | SQLite file deleted; subsequent `store info` shows `exists: false` |
| SD-02 | destroy non-existent store | exits with `NotFound` (code 3) |

## SE — Store Export / Import

| # | Description | Expected |
|---|---|---|
| SE-01 | JSON export then import into new store | imported store has same entry count |
| SE-02 | binary export (`--encoding binary`) then import | file starts with gzip magic bytes; import round-trips correctly |
| SE-03 | import from non-existent file | exits with `NotFound` (code 3) |
| SE-04 | `--encoding` with invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--encoding` |
| SE-05 | importing file with malformed JSON | exits with `UsageError` (code 2); error mentions "valid JSON" |

## SY — Store Sync Timeout Validation

| # | Description | Expected |
|---|---|---|
| SY-06 | `store sync --timeout 0` | exits with `UsageError` (code 2); error mentions `--timeout` |
| SY-07 | `store sync --timeout -1` | exits with `UsageError` (code 2); error mentions `--timeout` |
| SY-08 | `--server http://bad` (invalid scheme) | exits with `UsageError` (code 2); error mentions `--server` |

## EC — Entry Create

| # | Description | Expected |
|---|---|---|
| EC-01 | create item (no `--target`) | UUID printed; `entry get` returns `kind: item` |
| EC-02 | create link (`--target` = existing item) | UUID printed; `entry get` returns `kind: link` |
| EC-03 | `--mime` and `--label` on item | stored correctly; visible in `entry get` |
| EC-04 | `--value` on item | value returned by `entry get` |
| EC-05 | `--file` on item | file content stored as item value |
| EC-06 | `--info.<key>` on item | visible in `entry get` |
| EC-07 | non-existent container | exits with `NotFound` (code 3) |
| EC-08 | `--file` pointing to non-existent path | exits with `NotFound` (code 3) |
| EC-09 | `--at` with non-integer | exits with `UsageError` (code 2) |
| EC-10 | `--target` pointing to non-existent item | exits with `NotFound` (code 3) |
| EC-11 | `--mime` combined with `--target` | exits with `UsageError` (code 2); error mentions `--mime` and `link` |
| EC-12 | `--label` at link creation time | label stored; visible in `entry get` |
| EC-13 | `--info` at link creation time | info stored; visible in `entry get` |
| EC-14 | `--value` and `--file` together | exits with `UsageError` (code 2) |
| EC-15 | `--container` pointing to a link | exits with `NotFound` (code 3); error mentions `not an item` |
| EC-16 | `--at -1` | exits with `UsageError` (code 2); error mentions `--at` |
| EC-17 | `--container root` alias | exits with code 0; item UUID printed; item appears in root list |
| EC-18 | `--info-delete.<key>` at create time | exits with code 0; new entry's info does not contain that key (flag is a no-op) |

## EG — Entry Get

| # | Description | Expected |
|---|---|---|
| EG-01 | `entry get root` | returns valid entry |
| EG-02 | non-existent UUID | exits with `NotFound` (code 3) |
| EG-03 | no field flags | all fields included |
| EG-04 | `--label` flag | only label field in output |
| EG-05 | `--info.<key>` flag | only that info key in output |
| EG-06 | `--kind` flag | only kind field; no label or mime |
| EG-07 | link entry with `--format json` | includes `kind: "link"` and `target`; no `mime` or `value` |
| EG-08 | `entry get trash` | exits with code 0; valid trash entry |
| EG-09 | `entry get lost-and-found` | exits with code 0; valid entry |
| EG-10 | `entry get lostandfound` (no-hyphen) | resolves to same entry as `lost-and-found` |

## EL — Entry List

| # | Description | Expected |
|---|---|---|
| EL-01 | list direct inner entries | only immediate entries returned |
| EL-02 | `--recursive` | traverses nested containers |
| EL-03 | `--only items` | excludes links |
| EL-04 | `--only links` | excludes items |
| EL-05 | `--depth 1` | limits traversal to one level |
| EL-06 | `--depth` with non-integer | exits with `UsageError` (code 2) |
| EL-07 | `--only` with invalid value | exits with `UsageError` (code 2); error mentions `--only` |
| EL-08 | link ID as container | exits with `NotFound` (code 3) |
| EL-09 | text format | exits with code 0; one UUID per line; includes expected entry ID |
| EL-10 | `--label` in text format | line for known entry contains both UUID and label |
| EL-11 | `--label` in JSON format | each object in array includes `label` field |
| EL-12 | `entry list root` alias | exits with code 0; JSON array includes root-level entries |
| EL-13 | `entry list root` excludes system containers | TrashId and LostAndFoundId absent from result |
| EL-14 | `entry list lost-and-found` alias | exits with code 0; result is an array |

## EU — Entry Update

| # | Description | Expected |
|---|---|---|
| EU-01 | `--label` on item | label updated; `entry get` reflects new value |
| EU-02 | `--label` on link | label updated; `entry get` reflects new value |
| EU-03 | `--mime` on link | exits with `UsageError` (code 2); error mentions `--mime` and `link` |
| EU-04 | non-existent entry | exits with `NotFound` (code 3) |
| EU-05 | no options | no-op; exits with code 0 |
| EU-06 | `--value` | value updated; `entry get` reflects new value |
| EU-07 | `--file` pointing to non-existent path | exits with `NotFound` (code 3) |
| EU-08 | `--value` and `--file` together | exits with `UsageError` (code 2) |
| EU-09 | `--mime <type>` on item | MIME type updated; `entry get` reflects new value |
| EU-10 | `--info.<key>` merge | individual key updated; other info keys preserved |
| EU-11 | `--info-delete.<key>` | specified key removed; other info keys preserved |
| EU-12 | `--info.<key>` and `--info-delete.<key>` in the same command | new key added; deleted key removed in one operation |
| EU-13 | `--info.<key>` and `--info-delete.<key>` reference the **same** key | delete wins; key is absent after the update |

## EM — Entry Move / Delete / Restore / Purge

| # | Description | Expected |
|---|---|---|
| EM-01 | move item to valid container | success; item in new container |
| EM-02 | move system entry to non-root container | exits with `Forbidden` (code 6) |
| EM-03 | move to non-existent target | exits with `NotFound` (code 3) |
| EM-04 | delete item | item appears in `trash list` |
| EM-05 | restore trashed item | item back at root (or specified container) |
| EM-06 | restore live (non-trashed) entry | exits with `Forbidden` (code 6) |
| EM-07 | purge entry not in trash | exits with `Forbidden` (code 6) |
| EM-08 | purge trashed entry | entry permanently removed; `entry get` exits with `NotFound` |
| EM-09 | `entry move --at` with non-integer | exits with `UsageError` (code 2) |
| EM-10 | `entry restore --at` with non-integer | exits with `UsageError` (code 2) |
| EM-11 | `entry restore --to <container>` | entry placed in specified container, not root |
| EM-12 | move item into own descendant | exits with `Forbidden` (code 6) |
| EM-13 | `entry move --at -1` | exits with `UsageError` (code 2); error mentions `--at` |
| EM-14 | `entry restore --at -5` | exits with `UsageError` (code 2); error mentions `--at` |
| EM-15 | delete system entries (root, trash, lost-and-found) | exits with `Forbidden` (code 6); error mentions "system entry" |
| EM-16 | `entry move --to root` alias | exits with code 0; item appears in root list |
| EM-17 | `entry restore --to root` alias | exits with code 0; item appears in root list |

## DO — Duplicate Options

| # | Description | Expected |
|---|---|---|
| DO-01 | `entry create --label A --label B` | label stored is `B` (last value wins) |
| DO-02 | `entry update <id> --label A --label B` | label stored is `B` (last value wins) |
| DO-03 | `entry create --mime text/plain --mime application/json` | MIME type stored is `application/json` (last value wins) |

## TR — Trash Commands

| # | Description | Expected |
|---|---|---|
| TR-01 | `trash list` on empty trash | empty text marker shown |
| TR-02 | `trash list` after `entry delete` | deleted entry appears |
| TR-03 | `trash purge-all` | subsequent `trash list` is empty |
| TR-04 | `trash purge-expired --ttl 3153600000000` (≈ 100 years) | no entries removed |
| TR-05 | `trash purge-expired --ttl 0` | exits with `UsageError` (code 2); error mentions `--ttl` |
| TR-06 | `--ttl` with non-integer | exits with `UsageError` (code 2) |
| TR-07 | `trash list --only` with invalid value | exits with `UsageError` (code 2); error mentions `--only` |
| TR-08 | `trash purge-expired --ttl -1` | exits with `UsageError` (code 2); error mentions `--ttl` |

## TW — Tree Show

| # | Description | Expected |
|---|---|---|
| TW-01 | text format | output starts with `root/` header |
| TW-02 | JSON format | output parses as JSON with a `root` array at the top level |
| TW-03 | store with one item (JSON) | item appears in root array |
| TW-04 | `--depth 1` | only direct inner entries of root; no deeper nodes |
| TW-05 | `--depth` with non-integer | exits with `UsageError` (code 2) |
| TW-06 | `tree show` on non-existent store | exits with `NotFound` (code 3) |
| TW-07 | `--depth 0` with items present | exits with code 0; JSON root array is empty |
| TW-08 | system containers included | TrashId and LostAndFoundId present in JSON tree at root level |

## RP — REPL

| # | Description | Expected |
|---|---|---|
| RP-01 | blank lines | ignored; no command executed |
| RP-02 | `# comment` lines | ignored; no command executed |
| RP-03 | `exit` | session closes |
| RP-04 | `quit` | session closes |
| RP-05 | global options from shell startup | available in every subsequent command |
| RP-06 | failing command in REPL | error printed; session continues; next command succeeds |
| RP-07 | unknown command in REPL | error printed; session continues |
| RP-08 | `help` in REPL | commands shown; session continues; `shell` not listed; no error on stderr |
| RP-09 | failing command error routing | error goes to stderr; stdout unaffected |
| RP-10 | `help entry` in REPL | subcommand help shown; session continues; no error on stderr |

## SR — Script Runner

| # | Description | Expected |
|---|---|---|
| SR-01 | `--on-error stop` with failing command | stops immediately; returns failing exit code |
| SR-02 | `--on-error continue` with failing command | continues; returns last non-zero exit code |
| SR-03 | non-existent script file | exits with `NotFound` (code 3) |
| SR-04 | global options from outer invocation | available in each script line |
| SR-05 | `--on-error ask` in non-TTY context | falls back to stop; exits after first failure |
| SR-06 | script with only blank lines and comments | exits with code 0; no error output |
