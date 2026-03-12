#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as o } from "@rozek/sds-core-loro";
import { runMCPServer as s } from "@rozek/sds-mcp-server";
const e = "0.0.10", t = {
  version: e
}, c = {
  fromScratch: () => o.fromScratch(),
  fromBinary: (r) => o.fromBinary(r)
};
s(c, "sds-mcp-server-loro", t.version).catch((r) => {
  process.stderr.write(
    `sds-mcp-server-loro: fatal: ${r.message ?? r}
`
  ), process.exit(1);
});
