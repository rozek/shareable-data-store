# Test Cases — `@rozek/sds-sidecar-yjs`

Tests spawn `dist/sds-sidecar-yjs.js` as a child process and inspect exit code, stdout, and stderr.

---

## SC — Sidecar CLI Behaviour

| # | Description | Expected |
|---|---|---|
| SC-01 | `--help` | exits with code 0; stdout contains "Usage:" and "sds-sidecar-yjs" |
| SC-02 | `--version` | exits with code 0; stdout matches semver pattern (`\d+\.\d+\.\d+`) |
| SC-03 | unknown option (`--unknown-xyz-option`) | exits with code 2 |
| SC-04 | no args, `SDS_SERVER_URL` / `SDS_STORE_ID` / `SDS_TOKEN` unset | exits with non-zero code; stderr non-empty |
