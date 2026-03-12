# Test Cases — `@rozek/sds-mcp-server`

All tools are called via the MCP protocol through the `StdioClientTransport`. Every response is a JSON value wrapped in the tool result's `content[0].text` field. Errors are signalled by `isError: true` on the tool result.

---

## LT — ListTools

| # | description | expected |
| --- | --- | --- |
| LT-01 | call `ListTools` | returns ≥ 20 tools |
| LT-02 | `ListTools` result | all 20 known tool names present |

---

## SI — `sds_store_info`

| # | description | expected |
| --- | --- | --- |
| SI-01 | `StoreId` absent | `isError: true`; message contains "StoreId" |
| SI-02 | non-existent store | `isError: false`; `exists: false`; `StoreId` matches |
| SI-03 | existing store (≥ 1 item) | `isError: false`; `exists: true`; `EntryCount ≥ 1`; `DBPath` non-empty |

---

## SP — `sds_store_ping`

| # | description | expected |
| --- | --- | --- |
| SP-01 | `ServerURL` absent | `isError: true`; message contains "ServerURL" |
| SP-02 | `Token` absent | `isError: true`; message contains "Token" |
| SP-03 | `ServerURL` = `"http://bad"` (no ws scheme) | `isError: true`; message contains "ServerURL" |
| SP-04 | unreachable address (`ws://127.0.0.1:1`) | `isError: false`; `reachable: false` |

---

## SY — `sds_store_sync` (validation only)

| # | description | expected |
| --- | --- | --- |
| SY-01 | `TimeoutMs: 0` | `isError: true`; message contains "TimeoutMs" |
| SY-02 | `TimeoutMs: -1` | `isError: true`; message contains "TimeoutMs" |
| SY-03 | `ServerURL` = `"ftp://bad"` | `isError: true` |

---

## SD — `sds_store_destroy`

| # | description | expected |
| --- | --- | --- |
| SD-01 | destroy existing store; then info | `destroyed: true`; follow-up `info` returns `exists: false` |
| SD-02 | destroy non-existent store | `isError: true`; message contains store ID |

---

## SE — `sds_store_export` / `sds_store_import`

| # | description | expected |
| --- | --- | --- |
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

---

## EC — `sds_entry_create`

| # | description | expected |
| --- | --- | --- |
| EC-01 | create item (no `Target`) | `isError: false`; `Kind: "item"`; `Id` is a UUID |
| EC-02 | create link (`Target` = existing item ID) | `isError: false`; `Kind: "link"`; `Target` matches given ID |
| EC-03 | `Label: "Docs"`, `MIMEType: "text/markdown"` on item | `sds_entry_get` returns `Label: "Docs"`, `MIMEType: "text/markdown"` |
| EC-04 | `Value: "hello"` on item | `sds_entry_get` returns `Value: "hello"` |
| EC-05 | `ValueBase64` set to base64 of `"world"` | `sds_entry_get` value decodes to `"world"` (stored as bytes) |
| EC-06 | `File` pointing to a temp file with known content | `sds_entry_get` value matches file content |
| EC-07 | `Info: { author: "alice" }` on item | `sds_entry_get` `Info.author` = `"alice"` |
| EC-08 | `at: 0` on item | item ID appears at index 0 in container's `entry list` result |
| EC-09 | non-existent `Container` | `isError: true`; message contains "not found" |
| EC-10 | `MIMEType` with `Target` (representative for all item-only fields) | `isError: true` |
| EC-11 | `Value` and `File` together | `isError: true`; message contains "mutually exclusive" |
| EC-12 | `Container: "root"` alias (representative for alias resolution) | item created in root; appears in `sds_entry_list` of root |
| EC-13 | `InfoDelete` supplied at item creation time | `isError: false`; `created: true`; entry info contains keys from `Info` only — `InfoDelete` is a no-op |

---

## EG — `sds_entry_get`

| # | description | expected |
| --- | --- | --- |
| EG-01 | no `Fields`, no `InfoKeys` | all available fields returned |
| EG-02 | `Fields: ["Kind", "Label"]` | response has `Id`, `Kind`, `Label`; no `MIMEType`, `Value`, `Info` |
| EG-03 | `InfoKeys: ["author"]` | `Info` contains only `author` key |
| EG-04 | `Id: "root"` | entry returned; `Id` equals `"00000000-0000-4000-8000-000000000000"` |
| EG-05 | `Id: "trash"` | entry returned; `Id` equals `"00000000-0000-4000-8000-000000000001"`; `Kind: "item"` |
| EG-06 | non-existent UUID | `isError: true`; message contains "not found" |
| EG-07 | link entry with `Fields: ["Target"]` | `Target` field present; no `MIMEType`, no `Value` |
| EG-08 | `Id: "lost-and-found"` | entry returned; `Kind: "item"` |
| EG-09 | `Id: "lostandfound"` (no-hyphen variant) | `isError: false`; returned `Id` equals the `"lost-and-found"` entry `Id` |

---

## EL — `sds_entry_list`

| # | description | expected |
| --- | --- | --- |
| EL-01 | `Id: "root"` after creating items | array contains created item IDs; every element has `Id` and `Kind` |
| EL-02 | `Id: "root"`, `recursive: true` | nested items appear in result |
| EL-03 | `only: "items"` | no entry has `Kind: "link"` |
| EL-04 | `only: "links"` | no entry has `Kind: "item"` |
| EL-05 | `recursive: true`, `Depth: 1` | nested children of top-level items not included |
| EL-06 | `Fields: ["Label"]` | every entry has a `Label` field |
| EL-07 | `InfoKeys: ["tag"]` | every entry has an `Info` object with only the `tag` key |
| EL-08 | `only: "foobar"` | `isError: true`; message contains "'only'" |
| EL-09 | link ID as container | `isError: true` |
| EL-10 | `Id: "root"` output | Trash ID absent from result array |
| EL-11 | `Id: "lost-and-found"` | alias resolves; `isError: false`; result is an array |

---

## EU — `sds_entry_update`

| # | description | expected |
| --- | --- | --- |
| EU-01 | update `Label` on item | `updated: true`; `sds_entry_get` reflects new label |
| EU-02 | update `Label` on link | `updated: true`; `sds_entry_get` reflects new label |
| EU-03 | update `Value` on item | `sds_entry_get` reflects new value |
| EU-04 | update `MIMEType` on item | `sds_entry_get` reflects new MIME type |
| EU-05 | `Info: { b: 2 }` on item with existing `{ a: 1 }` | `sds_entry_get` info contains both `a` and `b` |
| EU-06 | `MIMEType` on link (representative for all item-only fields) | `isError: true`; message contains "link" |
| EU-07 | `Value` and `File` together | `isError: true`; message contains "mutually exclusive" |
| EU-08 | non-existent entry ID | `isError: true`; message contains "not found" |
| EU-09 | `InfoDelete: ['remove']` on item with keys `keep` and `remove` | `remove` key gone; `keep` key preserved |
| EU-10 | `InfoDelete` contains an invalid JS identifier (e.g. `"my-key"`) | `isError: true`; message contains the invalid key name |
| EU-11 | `Info: { b: 2 }` + `InfoDelete: ['a']` in one call (item with existing `a` and `b` keys) | `a` key removed; `b` key updated; other unrelated keys preserved |
| EU-12 | `Info` and `InfoDelete` reference the **same** key | delete wins; key is absent after the call |

---

## EV — `sds_entry_move`

| # | description | expected |
| --- | --- | --- |
| EV-01 | move item to a different container | `movedTo` matches target ID; item appears in target's `entry list` |
| EV-02 | `at: 0` on move | item appears at index 0 in target container |
| EV-03 | non-existent target container | `isError: true`; message contains "not found" |
| EV-04 | move item into its own descendant | `isError: true`; message contains "descendant" |
| EV-05 | `to: "root"` alias on move | `isError: false`; `movedTo` equals canonical root UUID |
| EV-06 | move `"lost-and-found"` to non-root container | `isError: true` |
| EV-07 | `at: -1` on move | `isError: true`; message contains "at" |

---

## ED — `sds_entry_delete` / `sds_entry_restore` / `sds_entry_purge`

| # | description | expected |
| --- | --- | --- |
| ED-01 | delete item | `deleted: true`; `sds_trash_list` includes entry ID |
| ED-02 | delete `"root"` | `isError: true`; message contains "cannot be deleted" |
| ED-03 | restore trashed entry (default to root) | `restoredTo` = root ID; entry appears in `entry list root` |
| ED-04 | restore non-trashed entry | `isError: true`; message contains "not in the trash" |
| ED-05 | purge trashed entry | `purged: true`; follow-up `sds_entry_get` → `isError: true` |
| ED-06 | purge non-trashed entry | `isError: true`; message contains "not in the trash" |
| ED-07 | delete `"lost-and-found"` | `isError: true`; message contains "cannot be deleted" |
| ED-08 | restore with `to: "root"` alias (representative for alias resolution) | `isError: false`; `restoredTo` equals canonical root UUID |
| ED-09 | restore with `at: -1` | `isError: true`; message contains "at" |

---

## TL — `sds_trash_list`

| # | description | expected |
| --- | --- | --- |
| TL-01 | empty trash | `[]` |
| TL-02 | after `entry delete` | deleted entry's ID in result |
| TL-03 | `only: "items"` | no element has `Kind: "link"` |
| TL-04 | `only: "links"` | no element has `Kind: "item"` |
| TL-05 | `only: "both"` (invalid) | `isError: true` |

---

## TA — `sds_trash_purge_all`

| # | description | expected |
| --- | --- | --- |
| TA-01 | purge all with 2 items in trash | `purged: 2`; follow-up `sds_trash_list` returns `[]` |

---

## TX — `sds_trash_purge_expired`

| # | description | expected |
| --- | --- | --- |
| TX-01 | `TTLms: 3153600000000` (≈ 100 years) | `purged: 0`; `TTLms` echoed in response; entries remain in trash |
| TX-02 | `TTLms: 0` | `isError: true`; message contains "TTLms" |
| TX-03 | `TTLms: -1` | `isError: true`; message contains "TTLms" |

---

## TW — `sds_tree_show`

| # | description | expected |
| --- | --- | --- |
| TW-01 | populated store | `Root` non-empty; each node has `Id`, `Kind`, `Label`; item nodes also have `innerEntries` |
| TW-02 | empty store | `Root: []` |
| TW-03 | `Depth: 1` | `innerEntries` of every root item node is `[]` |
| TW-04 | `Depth: 0` | `Root: []` |
| TW-04b | `Depth: -1` (negative) | `isError: true`; message contains `'Depth'` |
| TW-05 | Trash absent | Trash ID not in any node of tree |
| TW-06 | link node | node has `TargetId` field; link nodes have no `innerEntries` field |

---

## TI — `sds_token_issue`

| # | description | expected |
| --- | --- | --- |
| TI-01 | `ServerURL: "http://bad"` | `isError: true`; message contains "ServerURL" |
| TI-02 | `Scope: "superadmin"` | `isError: true`; message contains "Scope" |
| TI-03 | `Exp: "7x"` | `isError: true`; message contains "Exp" |
| TI-04 | valid params, unreachable server | `isError: true` |

---

## BA — `sds_batch`

| # | description | expected |
| --- | --- | --- |
| BA-01 | create + get in one batch | `Results` has 2 entries, both `ok: true` |
| BA-02 | `onError: "stop"` — 2nd command fails | `Results` has 2 entries; 3rd command absent |
| BA-03 | `onError: "continue"` — 2nd command fails | `Results` has 3 entries; 2nd `ok: false` with `Error`; 3rd `ok: true` |
| BA-04 | `sds_store_destroy` in Commands (disallowed) | `isError: true` before any execution |
| BA-05 | `Commands` absent | `isError: true` |
| BA-06 | `sync` step with unreachable server, `onError: "continue"` | sync step `ok: false`; subsequent create step `ok: true` |
| BA-07 | `StoreId` + `PersistenceDir` at batch level | commands that omit both still operate on the correct store |
| BA-08 | `sds_token_issue` in Commands (disallowed) | `isError: true` |

---

## CF — Config Defaults (env vars and CLI args)

Server is started with `createMCPClientWith({ extraEnv / extraArgs })`. All CF tests call `sds_store_info` without explicit `StoreId` / `PersistenceDir` unless noted.

| # | description | expected |
| --- | --- | --- |
| CF-01 | `SDS_STORE_ID` env var set | `StoreId` in response equals env var value |
| CF-02 | `SDS_PERSISTENCE_DIR` env var set | store found (`exists: true`) in the specified directory |
| CF-03 | explicit `StoreId` param + `SDS_STORE_ID` env var | param wins; response `StoreId` equals explicit param value |
| CF-04 | `--store` CLI arg | `StoreId` in response equals CLI arg value |
| CF-05 | `--persistence-dir` CLI arg | store found (`exists: true`) in the specified directory |
| CF-06 | explicit `StoreId` param + `--store` CLI arg | param wins; response `StoreId` equals explicit param value |
| CF-07 | `--store` CLI arg + `SDS_STORE_ID` env var | CLI arg wins; `StoreId` equals CLI arg value; `exists: true` |
