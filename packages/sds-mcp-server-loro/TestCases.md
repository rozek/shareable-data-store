# Test Cases — `@rozek/sds-mcp-server-loro`

All tools are called via the MCP protocol through `StdioClientTransport`. Every response is a JSON value in `content[0].text`. Errors are signalled by `isError: true`.

---

## LT — ListTools

| # | Description | Expected |
|---|---|---|
| LT-01 | call `ListTools` | returns ≥ 20 tools |
| LT-02 | `ListTools` result | all 20 known tool names present |

## SI — `sds_store_info`

| # | Description | Expected |
|---|---|---|
| SI-01 | `StoreId` absent | `isError: true`; message contains "StoreId" |
| SI-02 | non-existent store | `isError: false`; `exists: false`; `StoreId` matches |
| SI-03 | existing store (≥ 1 item) | `isError: false`; `exists: true`; `EntryCount ≥ 1`; `DBPath` non-empty |

## SP — `sds_store_ping`

| # | Description | Expected |
|---|---|---|
| SP-01 | `ServerURL` absent | `isError: true`; message contains "ServerURL" |
| SP-02 | `Token` absent | `isError: true`; message contains "Token" |
| SP-03 | `ServerURL = "http://bad"` (no ws scheme) | `isError: true`; message contains "ServerURL" |
| SP-04 | unreachable address (`ws://127.0.0.1:1`) | `isError: false`; `reachable: false` |

## SY — `sds_store_sync` (validation only)

| # | Description | Expected |
|---|---|---|
| SY-01 | `TimeoutMs: 0` | `isError: true`; message contains "TimeoutMs" |
| SY-02 | `TimeoutMs: -1` | `isError: true`; message contains "TimeoutMs" |
| SY-03 | `ServerURL = "ftp://bad"` | `isError: true` |

## SD — `sds_store_destroy`

| # | Description | Expected |
|---|---|---|
| SD-01 | destroy existing store; then info | `destroyed: true`; follow-up `info` returns `exists: false` |
| SD-02 | destroy non-existent store | `isError: true`; message contains store ID |

## SE — `sds_store_export` / `sds_store_import`

| # | Description | Expected |
|---|---|---|
| SE-01 | JSON export, no `OutputFile` | `exported: true`; `Format: "json"`; `Data` field is a string |
| SE-02 | JSON export to file | `exported: true`; `Format: "json"`; `File` = given path |
| SE-03 | JSON export to file → JSON import into new store | new store `EntryCount` = original |
| SE-04 | binary export, no `OutputFile` | `exported: true`; `Format: "binary"`; `DataBase64` present; decodes to non-empty buffer |
| SE-05 | binary export to file | `exported: true`; `Format: "binary"`; `File` = given path; file non-empty |
| SE-06 | binary export to file → binary import into new store | new store `EntryCount` = original |
| SE-07 | import from non-existent file | `isError: true`; message contains "not found" |
| SE-08 | both `InputFile` and `InputBase64` supplied | `isError: true`; message contains "mutually exclusive" |
| SE-09 | `InputBase64` without `InputEncoding` | `isError: true`; message contains "InputEncoding" |
| SE-10 | neither `InputFile` nor `InputBase64` | `isError: true` |
| SE-11 | `Encoding: "xlsx"` (invalid) | `isError: true`; message contains "Encoding" |
