#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as s } from "@rozek/sds-core-loro";
import { runSidecar as o } from "@rozek/sds-sidecar";
const e = {
  fromScratch: () => s.fromScratch(),
  fromBinary: (r) => s.fromBinary(r)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-sidecar-loro.js") || process.argv[1].endsWith("/sds-sidecar-loro")) && o(e, "sds-sidecar-loro").catch((r) => {
  process.stderr.write(
    `sds-sidecar-loro: fatal: ${r.message ?? r}
`
  ), process.exit(1);
});
