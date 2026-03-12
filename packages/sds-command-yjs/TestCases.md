# Test Cases — `@rozek/sds-command-yjs`

All tests spawn the built `dist/sds-command-yjs.js` binary.

---

## CL — Binary Startup

| # | Description | Expected |
|---|---|---|
| CL-01 | `sds-yjs` with no arguments | prints help text; exits with code 0 |
| CL-02 | `sds-yjs shell` with empty stdin | exits with code 0 |
| CL-03 | `--format` with invalid value (e.g. `xml`) | exits with `UsageError` (code 2); error mentions `--format` |
| CL-04 | `--on-error` with invalid value (e.g. `foobar`) | exits with `UsageError` (code 2); error mentions `--on-error` |
| CL-05 | `sds-yjs --version` | exits with code 0; stdout matches semver pattern `\d+\.\d+\.\d+` |
| CL-06 | `sds-yjs help entry` | exits with code 0; stdout contains `sds entry` and `create`; no error on stderr |

## UE — Usage Error Output Ordering

| # | Description | Expected |
|---|---|---|
| UE-01 | unknown global option | `error:` line in stderr precedes help text; exit code 2 |
| UE-02 | unknown command | `error:` line in stderr precedes help text; exit code 2 |
| UE-03 | missing required option (`store import` without `--input`) | `error:` line in stderr precedes help text; exit code 2 |
