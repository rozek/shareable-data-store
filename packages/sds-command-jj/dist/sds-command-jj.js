#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as r } from "@rozek/sds-core-jj";
import { runCommand as o } from "@rozek/sds-command";
const e = "0.0.10", n = {
  version: e
}, t = {
  fromScratch: () => r.fromScratch(),
  fromBinary: (s) => r.fromBinary(s)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-command-jj.js") || process.argv[1].endsWith("/sds-jj")) && o(t, "sds-jj", n.version).catch((s) => {
  process.stderr.write(
    `sds-jj: fatal: ${s.message ?? s}
`
  ), process.exit(1);
});
