# Test Plan — `@rozek/sds-command-jj`

---

## Goal

Verify that the `sds-jj` CLI binary — the json-joy-backed wrapper around `@rozek/sds-command` — is fully functional end-to-end: correct binary startup, all sub-commands, REPL, script runner, exit codes, and output formats.

---

## Scope

This package contains the **full integration test suite** for the `sds` CLI toolchain. The tests spawn the built `sds-command-jj.js` binary directly (no imports) and cover:

**In scope:**
- Binary launch: `--help`, `--version`, unknown options, usage-error output ordering
- All `store` sub-commands: `info`, `destroy`, `export`, `import` (including JSON and binary round-trips)
- `store sync --timeout` validation
- All `entry` sub-commands: `create`, `get`, `list`, `update`, `move`, `delete`, `restore`, `purge`
- All `trash` sub-commands: `list`, `purge-all`, `purge-expired`
- `tree show` — depth limit, system-container exclusion
- REPL (`sds shell`) — blank lines, comments, `exit`/`quit`, error recovery, `help`
- Script runner (`sds --script`) — `--on-error` modes (`stop`, `continue`, `ask`)
- Duplicate-option last-wins behaviour
- Well-known aliases (`root`, `trash`, `lost-and-found`, `lostandfound`)

**Out of scope:**
- Live WebSocket connectivity (`store ping`, `store sync` with a real server)
- JWT cryptographic validity (tested by `@rozek/sds-websocket-server`)
- Unit-level logic (configuration resolution, tokeniser, info-entry parser) — covered by `@rozek/sds-command`

---

## Relationship to `@rozek/sds-command`

`@rozek/sds-command` holds the unit-level tests (configuration, tokeniser, info-entry parser, `runSync()` mock tests). This package tests the *binary* end-to-end with the json-joy backend wired in. The `-loro` and `-yjs` sibling packages re-run a CLI smoke test (CL + UE) to confirm their binaries also start correctly; the full functional suite lives here.

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | json-joy CRDT via `@rozek/sds-core-jj` + `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Transport** | spawns built binary `dist/sds-command-jj.js` |
| **Build prerequisite** | `pnpm build` must succeed before `pnpm test:run` |

---

## Test Groups

| prefix | area | test file |
| --- | --- | --- |
| CL | binary startup and default behaviour | `cli.test.ts` |
| UE | usage-error output ordering | `cli.test.ts` |
| SI | `store info` | `store.test.ts` |
| SD | `store destroy` | `store.test.ts` |
| SE | `store export` / `store import` | `store.test.ts` |
| SY | `store sync --timeout` validation | `store.test.ts` |
| EC | `entry create` | `entry.test.ts` |
| EG | `entry get` | `entry.test.ts` |
| EL | `entry list` | `entry.test.ts` |
| EU | `entry update` | `entry.test.ts` |
| EM | `entry move`, `entry delete`, `entry restore`, `entry purge` | `entry.test.ts` |
| DO | duplicate-option last-wins | `entry.test.ts` |
| TR | `trash list`, `trash purge-all`, `trash purge-expired` | `trash.test.ts` |
| TW | `tree show` | `tree.test.ts` |
| RP | REPL (`sds shell`) | `repl.test.ts` |
| SR | script runner (`sds --script`) | `script-runner.test.ts` |

---

## Part I — Binary Startup

### CL — Default behaviour

- **CL-01** — `sds-jj` with no arguments prints help text to stdout and exits with code 0
- **CL-02** — `sds-jj shell` with empty stdin exits with code 0
- **CL-03** — `--format` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--format`
- **CL-04** — `--on-error` with an unrecognised value exits with `UsageError` (code 2); error message mentions `--on-error`
- **CL-05** — `sds-jj --version` exits with code 0 and prints a semver version string to stdout
- **CL-06** — `sds-jj help entry` exits with code 0; stdout contains `sds entry` and `create`; no error on stderr

### UE — Usage error output ordering

- **UE-01** — An unknown global option produces an `error:` line in stderr followed by the full help text; the `error:` line appears before `Usage:`
- **UE-02** — An unknown command produces an `error:` line in stderr followed by the full help text; the `error:` line appears before `Usage:`
- **UE-03** — A missing required option (e.g. `store import` without `--input`) produces an `error:` line in stderr followed by the full help text; the `error:` line appears before `Usage:`

---

## Part II — Store Commands

### SI — `store info`

- **SI-01** — No store ID configured → exits with `UsageError` (code 2)
- **SI-02** — Non-existent store (text format) → message contains "not found"
- **SI-03** — Non-existent store (JSON format) → `{ exists: false }`
- **SI-04** — Existing store (JSON format) → `{ exists: true, entryCount: ≥1, dbPath: <non-empty> }`

### SD — `store destroy`

- **SD-01** — Destroys the store; subsequent `store info` shows `exists: false`
- **SD-02** — Destroying a non-existent store exits with `NotFound` (code 3)

### SE — `store export` / `store import`

- **SE-01** — JSON export then import into a new store preserves entry count
- **SE-02** — Binary export then import round-trips correctly (gzip magic bytes `0x1f 0x8b`)
- **SE-03** — Import from a non-existent file exits with `NotFound` (code 3)
- **SE-04** — `--encoding` with an invalid value exits with `UsageError` (code 2); error mentions `--encoding`
- **SE-05** — Importing a file with malformed JSON exits with `UsageError` (code 2); error mentions "valid JSON"

### SY — `store sync` timeout validation

- **SY-06** — `store sync --timeout 0` exits with `UsageError` (code 2); error mentions `--timeout`
- **SY-07** — `store sync --timeout -1` exits with `UsageError` (code 2); error mentions `--timeout`

---

## Part III — Entry Commands

### EC — `entry create`

- **EC-01** — Create item (no `--target`) → UUID printed; `entry get` returns `kind: item`
- **EC-02** — Create link (`--target` = existing item) → UUID printed; `entry get` returns `kind: link`
- **EC-03** — `--mime` and `--label` stored correctly
- **EC-04** — `--value` returned by `entry get`
- **EC-05** — `--file` stores file content as item value
- **EC-06** — `--info.<key>` visible in `entry get`
- **EC-07** — Non-existent container → `NotFound` (code 3)
- **EC-08** — `--file` pointing to non-existent path → `NotFound` (code 3)
- **EC-09** — `--at` with a non-integer → `UsageError` (code 2)
- **EC-10** — `--target` pointing to non-existent item → `NotFound` (code 3)
- **EC-11** — `--mime` combined with `--target` → `UsageError` (code 2); error mentions `--mime` and `link`
- **EC-12** — `--label` at link creation time stored and visible
- **EC-13** — `--info` at link creation time stored and visible
- **EC-14** — `--value` and `--file` together → `UsageError` (code 2)
- **EC-15** — `--container` pointing to a link → `NotFound` (code 3); error mentions `not an item`
- **EC-16** — `--at -1` → `UsageError` (code 2); error mentions `--at`
- **EC-17** — `--container root` alias creates item in root; item appears in `entry list root`
- **EC-18** — `--info-delete.<key>` at create time is a no-op; command exits with code 0; new entry's info contains only keys set via `--info`/`--info.<key>`

### EG — `entry get`

- **EG-01** — Well-known alias `root` returns a valid entry
- **EG-02** — Non-existent UUID → `NotFound` (code 3)
- **EG-03** — No field flags → all fields included
- **EG-04** — `--label` flag → only label field in output
- **EG-05** — `--info.<key>` → only that info key in output
- **EG-06** — `--kind` alone → only kind field; no label or mime
- **EG-07** — Link entry with `--format json` → includes `kind: "link"` and `target`; no `mime` or `value`
- **EG-08** — `entry get trash` → valid trash entry
- **EG-09** — `entry get lost-and-found` → valid lost-and-found entry
- **EG-10** — `entry get lostandfound` (no-hyphen variant) → same entry as `lost-and-found`

### EL — `entry list`

- **EL-01** — Lists direct inner entries of container
- **EL-02** — `--recursive` traverses nested containers
- **EL-03** — `--only items` excludes links
- **EL-04** — `--only links` excludes items
- **EL-05** — `--depth 1` limits traversal to one level
- **EL-06** — `--depth` with non-integer → `UsageError` (code 2)
- **EL-07** — `--only` with invalid value → `UsageError` (code 2); error mentions `--only`
- **EL-08** — Link ID as container → `NotFound` (code 3)
- **EL-09** — Text format: exits code 0; one UUID per line; includes expected entry ID
- **EL-10** — `--label` in text format: line contains both UUID and label
- **EL-11** — `--label` in JSON format: each object has `label` field
- **EL-12** — `entry list root` alias lists root-level entries
- **EL-13** — `entry list root` does not include system containers (Trash, LostAndFound)
- **EL-14** — `entry list lost-and-found` alias exits with code 0

### EU — `entry update`

- **EU-01** — `--label` on item updates label
- **EU-02** — `--label` on link updates label
- **EU-03** — `--mime` on link → `UsageError` (code 2); error mentions `--mime` and `link`
- **EU-04** — Non-existent entry → `NotFound` (code 3)
- **EU-05** — No options → no-op, exits code 0
- **EU-06** — `--value` updates item value
- **EU-07** — `--file` pointing to non-existent → `NotFound` (code 3)
- **EU-08** — `--value` and `--file` together → `UsageError` (code 2)
- **EU-09** — `--mime <type>` updates MIME type
- **EU-10** — `--info.<key>` merges individual key without replacing others
- **EU-11** — `--info-delete.<key>` removes the specified key; other info keys remain
- **EU-12** — `--info.<key>` and `--info-delete.<key>` combined in one update command: new key is added and deleted key is removed in the same operation
- **EU-13** — `--info.<key>` and `--info-delete.<key>` name the **same** key in one command: delete wins — key is absent after the update

### EM — `entry move` / `entry delete` / `entry restore` / `entry purge`

- **EM-01** — Move item to valid container succeeds
- **EM-02** — Moving a system entry to a non-root container → `Forbidden` (code 6)
- **EM-03** — Move to non-existent target → `NotFound` (code 3)
- **EM-04** — Delete item → item appears in trash list
- **EM-05** — Restore trashed item → back to root (or specified container)
- **EM-06** — Restore live (non-trashed) entry → `Forbidden` (code 6)
- **EM-07** — Purge entry not in trash → `Forbidden` (code 6)
- **EM-08** — Purge trashed entry → permanently removed
- **EM-09** — `entry move --at` with non-integer → `UsageError` (code 2)
- **EM-10** — `entry restore --at` with non-integer → `UsageError` (code 2)
- **EM-11** — `entry restore --to <container>` places entry in specified container, not root
- **EM-12** — Moving item into its own descendant → `Forbidden` (code 6)
- **EM-13** — `entry move --at -1` → `UsageError` (code 2); error mentions `--at`
- **EM-14** — `entry restore --at -5` → `UsageError` (code 2); error mentions `--at`
- **EM-15** — Deleting system entries (root, trash, lost-and-found) → `Forbidden` (code 6)
- **EM-16** — `entry move --to root` alias moves item to root
- **EM-17** — `entry restore --to root` alias restores to root

### DO — Duplicate options

- **DO-01** — `--label` given twice in `entry create` → last value used
- **DO-02** — `--label` given twice in `entry update` → last value used
- **DO-03** — `--mime` given twice in `entry create` → last value used

---

## Part IV — Trash Commands

### TR — Trash

- **TR-01** — `trash list` on empty trash → empty text marker
- **TR-02** — `trash list` after `entry delete` → deleted entry appears
- **TR-03** — `trash purge-all` → subsequent `trash list` is empty
- **TR-04** — `trash purge-expired --ttl 3153600000000` (≈ 100 years) → no entries removed
- **TR-05** — `trash purge-expired --ttl 0` → `UsageError` (code 2); error mentions `--ttl`
- **TR-06** — `--ttl` with non-integer → `UsageError` (code 2)
- **TR-07** — `trash list --only` with invalid value → `UsageError` (code 2); error mentions `--only`
- **TR-08** — `trash purge-expired --ttl -1` → `UsageError` (code 2); error mentions `--ttl`

---

## Part V — Tree

### TW — `tree show`

- **TW-01** — Text output starts with `root/` header
- **TW-02** — JSON output has a `root` array at the top level
- **TW-03** — Store with one item shows that item in JSON root array
- **TW-04** — `--depth 1` limits output to direct inner entries
- **TW-05** — `--depth` with non-integer → `UsageError` (code 2)
- **TW-06** — `tree show` on non-existent store → `NotFound` (code 3)
- **TW-07** — `--depth 0` → empty root array in JSON
- **TW-08** — System containers (Trash, LostAndFound) never appear in output

---

## Part VI — REPL

### RP — `sds shell`

- **RP-01** — Blank lines are ignored
- **RP-02** — Comment lines (`#`) are ignored
- **RP-03** — `exit` closes the session
- **RP-04** — `quit` closes the session
- **RP-05** — Global options from `sds shell` startup apply to every command in the session
- **RP-06** — REPL continues after a failing command
- **RP-07** — Unknown command does not exit the REPL
- **RP-08** — `help` inside the REPL shows commands; session continues; `shell` not listed; no error on stderr
- **RP-09** — Failing command writes error to stderr, not stdout
- **RP-10** — `help <subcommand>` inside the REPL shows subcommand help; no error on stderr

---

## Part VII — Script Runner

### SR — `sds --script`

- **SR-01** — `--on-error stop`: stops after first failure; returns failing exit code
- **SR-02** — `--on-error continue`: continues after errors; returns last non-zero exit code
- **SR-03** — Non-existent script file → `NotFound` (code 3)
- **SR-04** — Global options from outer invocation available in each script line
- **SR-05** — `--on-error ask` in non-TTY context falls back to stop behaviour
- **SR-06** — Script with only blank lines and comments exits with code 0

---

## Running the Tests

```bash
cd packages/sds-command-jj
pnpm build && pnpm test:run
```
