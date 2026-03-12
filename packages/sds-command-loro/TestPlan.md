# Test Plan — `@rozek/sds-command-loro`

---

## Goal

Verify that the `sds-loro` CLI binary — the Loro-CRDT-backed wrapper around `@rozek/sds-command` — launches correctly, exposes the expected interface, and exits cleanly under basic failure conditions.

---

## Scope

**In scope:**
- Binary startup: `--help`, `--version`, default output, exit codes
- Basic usage-error handling: invalid `--format`, invalid `--on-error`, unknown global option, unknown command, missing required option

**Out of scope:**
- Full functional test suite (all store/entry/trash/tree/REPL/script commands) — covered by `@rozek/sds-command-jj`, which runs the same `@rozek/sds-command` logic with the json-joy backend
- Live WebSocket connectivity
- Unit-level logic (configuration, tokeniser, info-entry parser) — covered by `@rozek/sds-command`

---

## Relationship to `@rozek/sds-command-jj`

`@rozek/sds-command-jj` holds the complete integration test suite for all sub-commands. This package runs only the CLI smoke tests (CL + UE) to confirm that the `sds-loro` binary itself is correctly assembled and starts as expected with the Loro backend.

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | Loro CRDT via `@rozek/sds-core-loro` + `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Transport** | spawns built binary `dist/sds-command-loro.js` |
| **Build prerequisite** | `pnpm build` must succeed before `pnpm test:run` |

---

## Test Groups

| prefix | area | test file |
| --- | --- | --- |
| CL | binary startup and default behaviour | `cli.test.ts` |
| UE | usage-error output ordering | `cli.test.ts` |

---

## Part I — Binary Startup

### CL — Default behaviour

- **CL-01** — `sds-loro` with no arguments prints help text to stdout and exits with code 0
- **CL-02** — `sds-loro shell` with empty stdin exits with code 0
- **CL-03** — `--format` with an unrecognised value exits with `UsageError` (code 2)
- **CL-04** — `--on-error` with an unrecognised value exits with `UsageError` (code 2)
- **CL-05** — `sds-loro --version` exits with code 0 and prints a semver version string
- **CL-06** — `sds-loro help entry` exits with code 0; stdout contains `sds entry` and `create`; no error on stderr

### UE — Usage error output ordering

- **UE-01** — An unknown global option produces an `error:` line in stderr before `Usage:`; exit code 2
- **UE-02** — An unknown command produces an `error:` line in stderr before `Usage:`; exit code 2
- **UE-03** — A missing required option produces an `error:` line in stderr before `Usage:`; exit code 2

---

## Running the Tests

```bash
cd packages/sds-command-loro
pnpm build && pnpm test:run
```
