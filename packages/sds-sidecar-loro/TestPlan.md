# Test Plan — `@rozek/sds-sidecar-loro`

---

## Goal

Verify that the `sds-sidecar-loro` binary — the Loro-CRDT-backed sidecar process — handles CLI arguments correctly, prints usage and version information, rejects unknown options, and exits with an error when required configuration is absent.

---

## Scope

This package contains a **CLI smoke test** for the sidecar binary. Tests spawn the built binary as a child process and verify its exit code and output:

**In scope:**
- `--help` output and exit code
- `--version` output and exit code
- Unknown option rejection
- Missing required configuration (no args, no env vars)

**Out of scope:**
- Live WebSocket connectivity
- Sync behaviour and CRDT operations — those require a running server

---

## Test Environment

| aspect | details |
| --- | --- |
| **Runtime** | Node.js 22+ |
| **Store backend** | Loro CRDT via `@rozek/sds-core-loro` + `@rozek/sds-persistence-node` |
| **Test framework** | Vitest 2 |
| **Execution** | child process spawn of `dist/sds-sidecar-loro.js` |
| **Build prerequisite** | `pnpm build` must succeed before `pnpm test:run` |

---

## Test Groups

| prefix | aspect covered | test file |
| --- | --- | --- |
| SC | sidecar CLI behaviour | `cli.test.ts` |

---

## Part I — Sidecar CLI Behaviour

- **SC-01** — `--help` prints usage (contains "Usage:" and binary name) and exits with code 0
- **SC-02** — `--version` prints a semver string and exits with code 0
- **SC-03** — Unknown option exits with usage-error code 2
- **SC-04** — No args and no env vars → non-zero exit; stderr is non-empty

---

## Running the Tests

```bash
cd packages/sds-sidecar-loro
pnpm build && pnpm test:run
```
