#!/usr/bin/env -S node --no-warnings
import { SDS_DataStore as s } from "@rozek/sds-core-yjs";
import { runMCPServer as o } from "@rozek/sds-mcp-server";
const e = "0.0.11", t = {
  version: e
}, c = {
  fromScratch: () => s.fromScratch(),
  fromBinary: (r) => s.fromBinary(r)
};
o(c, "sds-mcp-server-yjs", t.version).catch((r) => {
  process.stderr.write(
    `sds-mcp-server-yjs: fatal: ${r.message ?? r}
`
  ), process.exit(1);
});
