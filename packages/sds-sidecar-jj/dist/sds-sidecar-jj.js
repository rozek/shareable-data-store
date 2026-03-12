#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as s } from "@rozek/sds-core-jj";
import { runSidecar as e } from "@rozek/sds-sidecar";
const o = {
  fromScratch: () => s.fromScratch(),
  fromBinary: (r) => s.fromBinary(r)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-sidecar-jj.js") || process.argv[1].endsWith("/sds-sidecar-jj")) && e(o, "sds-sidecar-jj").catch((r) => {
  process.stderr.write(
    `sds-sidecar-jj: fatal: ${r.message ?? r}
`
  ), process.exit(1);
});
