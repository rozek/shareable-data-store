#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as r } from "@rozek/sds-core-yjs";
import { runSidecar as e } from "@rozek/sds-sidecar";
const o = {
  fromScratch: () => r.fromScratch(),
  fromBinary: (s) => r.fromBinary(s)
};
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-sidecar-yjs.js") || process.argv[1].endsWith("/sds-sidecar-yjs")) && e(o, "sds-sidecar-yjs").catch((s) => {
  process.stderr.write(
    `sds-sidecar-yjs: fatal: ${s.message ?? s}
`
  ), process.exit(1);
});
