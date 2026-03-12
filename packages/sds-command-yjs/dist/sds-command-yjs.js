#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as r } from "@rozek/sds-core-yjs";
import { runCommand as o } from "@rozek/sds-command";
const e = "0.0.10", n = {
  version: e
}, t = {
  fromScratch: () => r.fromScratch(),
  fromBinary: (s) => r.fromBinary(s)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-command-yjs.js") || process.argv[1].endsWith("/sds-yjs")) && o(t, "sds-yjs", n.version).catch((s) => {
  process.stderr.write(
    `sds-yjs: fatal: ${s.message ?? s}
`
  ), process.exit(1);
});
