#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as o } from "@rozek/sds-core-loro";
import { runCommand as s } from "@rozek/sds-command";
const e = "0.0.10", n = {
  version: e
}, t = {
  fromScratch: () => o.fromScratch(),
  fromBinary: (r) => o.fromBinary(r)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-command-loro.js") || process.argv[1].endsWith("/sds-loro")) && s(t, "sds-loro", n.version).catch((r) => {
  process.stderr.write(
    `sds-loro: fatal: ${r.message ?? r}
`
  ), process.exit(1);
});
