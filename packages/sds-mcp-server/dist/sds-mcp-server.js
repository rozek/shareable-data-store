#!/usr/bin/env -S node --no-warnings
import { Server as ye } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport as fe } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema as we, CallToolRequestSchema as he } from "@modelcontextprotocol/sdk/types.js";
import Ie from "node:os";
import A from "node:path";
import _ from "node:fs/promises";
import { LostAndFoundId as L, TrashId as E, RootId as x } from "@rozek/sds-core";
import { SDS_DesktopPersistenceProvider as $ } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as U } from "@rozek/sds-sync-engine";
import { SDS_WebSocketProvider as me } from "@rozek/sds-network-websocket";
class i extends Error {
  constructor(t) {
    super(t), this.name = "MCP_ToolError";
  }
}
function Se(e) {
  return { content: [{ type: "text", text: JSON.stringify(e) }] };
}
function O(e) {
  return { content: [{ type: "text", text: e }], isError: !0 };
}
let D = {};
function ge(e) {
  D = e;
}
function y(e) {
  return {
    StoreId: e.StoreId ?? D.StoreId ?? process.env.SDS_STORE_ID,
    PersistenceDir: be(e.PersistenceDir),
    ServerURL: e.ServerURL ?? D.ServerURL ?? process.env.SDS_SERVER_URL,
    Token: e.Token ?? D.Token ?? process.env.SDS_TOKEN,
    AdminToken: e.AdminToken ?? D.AdminToken ?? process.env.SDS_ADMIN_TOKEN
  };
}
function be(e) {
  return e ?? D.PersistenceDir ?? process.env.SDS_PERSISTENCE_DIR ?? A.join(Ie.homedir(), ".sds");
}
function k(e, t) {
  const n = t.replace(/[^a-zA-Z0-9_-]/g, "_");
  return A.join(e.PersistenceDir, `${n}.db`);
}
let v;
function Te(e) {
  v = e;
}
function _e(e) {
  return v.fromBinary(e);
}
async function w(e, t = !1) {
  const n = e.StoreId;
  if (n == null)
    throw new i("StoreId is required");
  await _.mkdir(e.PersistenceDir, { recursive: !0 });
  const o = k(e, n), r = new $(o, n);
  let s;
  try {
    const a = await r.loadSnapshot();
    switch (!0) {
      case a != null: {
        s = v.fromBinary(a);
        break;
      }
      case t: {
        s = v.fromScratch();
        break;
      }
      default:
        throw await r.close(), new i(
          `store '${n}' not found in '${e.PersistenceDir}'`
        );
    }
  } catch (a) {
    throw a instanceof i ? a : (await r.close().catch(() => {
    }), new i(
      `failed to open store '${n}': ${a.message}`
    ));
  }
  const d = new U(s, { PersistenceProvider: r });
  return await d.start(), { Store: s, Persistence: r, Engine: d };
}
async function I(e) {
  await e.Engine.stop();
}
class ve {
  #n;
  #o;
  #e;
  #t;
  #r;
  constructor(t, n, o, r, s) {
    this.#n = t, this.#o = n, this.#e = o, this.#t = r, this.#r = s;
  }
  get Store() {
    return this.#n;
  }
  get Persistence() {
    return this.#o;
  }
  get StoreId() {
    return this.#t;
  }
  get PersistenceDir() {
    return this.#r;
  }
  /**** syncWith — flushes, syncs with server, then reloads the store ****/
  async syncWith(t, n, o = 5e3) {
    const r = k({ PersistenceDir: this.#r }, this.#t);
    await this.#e.stop();
    const s = {
      StoreId: this.#t,
      PersistenceDir: this.#r,
      ServerURL: t,
      Token: n
    };
    let d = null;
    try {
      await q(s, o);
    } catch (l) {
      d = l;
    }
    const a = new $(r, this.#t);
    this.#o = a;
    const c = await a.loadSnapshot();
    if (this.#n = c != null ? v.fromBinary(c) : v.fromScratch(), this.#e = new U(
      this.#n,
      { PersistenceProvider: a }
    ), await this.#e.start(), d != null)
      throw d;
  }
  /**** close — flushes and closes the batch session ****/
  async close() {
    await this.#e.stop();
  }
}
async function Ee(e, t = !1) {
  const n = await w(e, t);
  return new ve(
    n.Store,
    n.Persistence,
    n.Engine,
    e.StoreId,
    e.PersistenceDir
  );
}
async function q(e, t = 5e3) {
  const n = e.StoreId, o = e.ServerURL, r = e.Token;
  if (n == null)
    throw new i("StoreId is required");
  if (o == null)
    throw new i("ServerURL is required");
  if (!/^wss?:\/\//.test(o))
    throw new i(
      `invalid ServerURL '${o}' — must start with 'ws://' or 'wss://'`
    );
  if (r == null)
    throw new i("Token is required");
  await _.mkdir(e.PersistenceDir, { recursive: !0 });
  const s = k(e, n), d = new $(s, n), a = await d.loadSnapshot(), c = a != null ? v.fromBinary(a) : v.fromScratch(), l = new me(n), u = new U(c, {
    PersistenceProvider: d,
    NetworkProvider: l
  });
  await u.start();
  let p = !1, f;
  const h = new Promise((S) => {
    f = S;
  }), b = u.onConnectionChange((S) => {
    S === "connected" && (p = !0, setTimeout(f, t)), S === "disconnected" && f();
  }), m = setTimeout(() => {
    f();
  }, t * 2);
  try {
    await u.connectTo(o, { Token: r });
    const S = await d.loadPatchesSince(0);
    for (const T of S)
      l.sendPatch(T);
    await h;
  } catch (S) {
    throw new i(
      `could not connect to '${o}': ${S.message}`
    );
  } finally {
    clearTimeout(m), b(), await u.stop();
  }
  return { Connected: p, StoreId: n, ServerURL: o };
}
async function ke(e) {
  const t = e.StoreId;
  if (t == null)
    return !1;
  const n = k(e, t);
  try {
    return await _.access(n), !0;
  } catch {
    return !1;
  }
}
async function De(e) {
  const t = e.StoreId;
  if (t == null)
    throw new i("StoreId is required");
  const n = k(e, t);
  try {
    await _.unlink(n), await _.unlink(n + "-wal").catch(() => {
    }), await _.unlink(n + "-shm").catch(() => {
    });
  } catch (o) {
    const r = o;
    throw r.code === "ENOENT" ? new i(
      `store '${t}' not found in '${e.PersistenceDir}'`
    ) : new i(
      `failed to delete store '${t}': ${r.message}`
    );
  }
}
function g(e) {
  switch (e.toLowerCase()) {
    case "root":
      return x;
    case "trash":
      return E;
    case "lost-and-found":
    case "lostandfound":
      return L;
    default:
      return e;
  }
}
async function N(e) {
  try {
    return await _.readFile(e);
  } catch (t) {
    throw t.code === "ENOENT" ? new i(`file '${e}' not found`) : t;
  }
}
function W(e) {
  const t = /* @__PURE__ */ new Set([x, E, L]);
  let n = 0;
  function o(r) {
    for (const s of e._innerEntriesOf(r))
      t.has(s.Id) || (n++, s.isItem && o(s.Id));
  }
  return o(x), n;
}
const xe = [
  /**** sds_store_info ****/
  {
    name: "sds_store_info",
    description: "show existence, entry count, and DB path of a local store",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_store_ping ****/
  {
    name: "sds_store_ping",
    description: "check connectivity to the WebSocket server",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        ServerURL: { type: "string", description: "WebSocket server base URL" },
        Token: { type: "string", description: "client JWT with read or write scope" }
      },
      required: ["StoreId", "ServerURL", "Token"]
    }
  },
  /**** sds_store_sync ****/
  {
    name: "sds_store_sync",
    description: "connect to the server, exchange CRDT patches, and disconnect",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        ServerURL: { type: "string", description: "WebSocket server base URL" },
        Token: { type: "string", description: "client JWT with read or write scope" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        TimeoutMs: { type: "integer", description: "max wait in ms after connecting (default: 5000)" }
      },
      required: ["StoreId", "ServerURL", "Token"]
    }
  },
  /**** sds_store_destroy ****/
  {
    name: "sds_store_destroy",
    description: "permanently delete the local SQLite store file and its WAL/SHM companions",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_store_export ****/
  {
    name: "sds_store_export",
    description: "export the current store snapshot; binary without OutputFile returns inline DataBase64",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Encoding: { type: "string", enum: ["json", "binary"], description: "serialisation format (default: json)" },
        OutputFile: { type: "string", description: "destination file path; omit to return data in response" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_store_import ****/
  {
    name: "sds_store_import",
    description: "CRDT-merge a snapshot (JSON or binary) into the local store",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        InputFile: { type: "string", description: "source file path — mutually exclusive with InputBase64" },
        InputBase64: { type: "string", description: "base64-encoded snapshot — mutually exclusive with InputFile" },
        InputEncoding: { type: "string", enum: ["json", "binary"], description: "encoding of InputBase64 — required when InputBase64 is used" }
      },
      required: ["StoreId"]
    }
  }
], Le = {
  sds_store_info: async (e) => Ce(y(e)),
  sds_store_ping: async (e) => $e(y(e)),
  sds_store_sync: async (e) => {
    const t = y(e), n = e.TimeoutMs ?? 5e3;
    if (typeof n != "number" || n <= 0 || !Number.isInteger(n))
      throw new i(`'TimeoutMs' must be a positive integer — got ${n}`);
    return Ue(t, n);
  },
  sds_store_destroy: async (e) => qe(y(e)),
  sds_store_export: async (e) => {
    const t = y(e), n = (e.Encoding ?? "json").toLowerCase(), o = e.OutputFile;
    if (n !== "json" && n !== "binary")
      throw new i(`'Encoding' must be 'json' or 'binary' — got '${e.Encoding}'`);
    return Be(t, n, o);
  },
  sds_store_import: async (e) => {
    const t = y(e);
    return J(e), Me(
      t,
      e.InputFile,
      e.InputBase64,
      (e.InputEncoding ?? "json").toLowerCase()
    );
  }
}, Re = {
  sds_store_info: async (e, t) => ({
    StoreId: e.StoreId,
    exists: !0,
    EntryCount: W(e.Store),
    DBPath: k({ PersistenceDir: e.PersistenceDir }, e.StoreId)
  }),
  sds_store_sync: async (e, t) => {
    const n = t.ServerURL, o = t.Token, r = t.TimeoutMs ?? 5e3;
    if (n == null)
      throw new i("ServerURL is required");
    if (o == null)
      throw new i("Token is required");
    if (!/^wss?:\/\//.test(n))
      throw new i(
        `invalid ServerURL '${n}' — must start with 'ws://' or 'wss://'`
      );
    if (typeof r != "number" || r <= 0 || !Number.isInteger(r))
      throw new i(`'TimeoutMs' must be a positive integer — got ${r}`);
    return await e.syncWith(n, o, r), { StoreId: e.StoreId, Server: n, synced: !0 };
  },
  sds_store_export: async (e, t) => {
    const n = (t.Encoding ?? "json").toLowerCase(), o = t.OutputFile;
    if (n !== "json" && n !== "binary")
      throw new i(`'Encoding' must be 'json' or 'binary' — got '${t.Encoding}'`);
    return K(e.Store, n, o);
  },
  sds_store_import: async (e, t) => (J(t), H(
    e.Store,
    t.InputFile,
    t.InputBase64,
    (t.InputEncoding ?? "json").toLowerCase()
  ))
};
async function Ce(e) {
  const t = e.StoreId;
  if (t == null)
    throw new i("StoreId is required");
  if (!await ke(e))
    return { StoreId: t, exists: !1 };
  const o = await w(e);
  try {
    return {
      StoreId: t,
      exists: !0,
      EntryCount: W(o.Store),
      DBPath: k(e, t)
    };
  } finally {
    await I(o);
  }
}
async function $e(e) {
  const { ServerURL: t, Token: n } = e;
  if (t == null)
    throw new i("ServerURL is required");
  if (n == null)
    throw new i("Token is required");
  if (!/^wss?:\/\//.test(t))
    throw new i(
      `invalid ServerURL '${t}' — must start with 'ws://' or 'wss://'`
    );
  try {
    const o = await q(e, 1e3);
    return { Server: o.ServerURL, StoreId: o.StoreId, reachable: !0 };
  } catch (o) {
    if (o instanceof i)
      return { Server: t, reachable: !1, Error: o.message };
    throw o;
  }
}
async function Ue(e, t) {
  const n = await q(e, t);
  return { StoreId: n.StoreId, Server: n.ServerURL, synced: n.Connected };
}
async function qe(e) {
  const t = e.StoreId;
  if (t == null)
    throw new i("StoreId is required");
  return await De(e), { StoreId: t, destroyed: !0 };
}
async function Be(e, t, n) {
  const o = await w(e);
  try {
    return await K(o.Store, t, n);
  } finally {
    await I(o);
  }
}
async function K(e, t, n) {
  const o = t === "binary", r = o ? e.asBinary() : JSON.stringify(e.asJSON(), null, 2);
  if (n != null) {
    try {
      await _.writeFile(n, o ? r : r + `
`);
    } catch (s) {
      throw new i(`failed to write export to '${n}': ${s.message}`);
    }
    return { exported: !0, Format: t, File: n };
  }
  return o ? { exported: !0, Format: "binary", DataBase64: Buffer.from(r).toString("base64") } : { exported: !0, Format: "json", Data: r };
}
async function Me(e, t, n, o) {
  const r = await w(e, !0);
  try {
    return await H(r.Store, t, n, o);
  } finally {
    await I(r);
  }
}
async function H(e, t, n, o) {
  let r, s;
  if (t != null ? (r = await N(t), s = t) : (r = Buffer.from(n, "base64"), s = "base64"), o === "json") {
    const a = r.toString("utf8").trimStart();
    let c;
    try {
      c = JSON.parse(a);
    } catch {
      throw new i(
        t != null ? `'${t}' does not contain valid JSON` : "InputBase64 does not contain valid JSON"
      );
    }
    F(e, c);
  } else {
    let a;
    try {
      a = _e(new Uint8Array(r));
    } catch {
      throw new i(
        t != null ? `'${t}' does not contain valid binary SDS data` : "InputBase64 does not contain valid binary SDS data"
      );
    }
    try {
      F(e, a.asJSON());
    } finally {
      a.dispose();
    }
  }
  return t != null ? { imported: !0, File: s } : { imported: !0, Source: s };
}
function J(e) {
  const t = e.InputFile != null, n = e.InputBase64 != null;
  if (!t && !n)
    throw new i("either InputFile or InputBase64 is required");
  if (t && n)
    throw new i("InputFile and InputBase64 are mutually exclusive");
  if (n && e.InputEncoding == null)
    throw new i("InputEncoding is required when InputBase64 is used");
}
function F(e, t) {
  const n = /* @__PURE__ */ new Set([x, E, L]), r = t.innerEntries;
  if (r != null)
    for (const s of r)
      n.has(s.Id) || e.newEntryFromJSONat(s, e.RootItem);
}
const je = [
  /**** sds_entry_create ****/
  {
    name: "sds_entry_create",
    description: "create a new item (default) or link (with Target); auto-creates the store when creating items",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Target: { type: "string", description: "UUID of the item to link to — creates a link instead of an item" },
        Container: { type: "string", description: 'UUID of the outer container item, or "root" / "lost-and-found" (default: root)' },
        at: { type: "integer", description: "insertion index, 0-based (default: append)" },
        Label: { type: "string", description: "initial display label" },
        MIMEType: { type: "string", description: "MIME type of the item value (items only; default: text/plain)" },
        Value: { type: "string", description: "initial plain-text value (items only)" },
        ValueBase64: { type: "string", description: "initial binary value as base64 (items only)" },
        File: { type: "string", description: "file path to read initial value from (items only)" },
        Info: { type: "object", description: "initial info map as an object of key-value pairs" },
        InfoDelete: { type: "array", items: { type: "string" }, description: "info keys to remove (no-op for new entries, but accepted for consistency with sds_entry_update)" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_entry_get ****/
  {
    name: "sds_entry_get",
    description: "read fields of a single entry; returns all available fields when Fields is omitted",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: 'UUID of the entry, or "root" / "trash" / "lost-and-found"' },
        Fields: { type: "array", items: { type: "string" }, description: "fields to include — subset of Kind, Label, MIMEType, Value, Info, Target" },
        InfoKeys: { type: "array", items: { type: "string" }, description: "return only these named keys from the info map" }
      },
      required: ["StoreId", "Id"]
    }
  },
  /**** sds_entry_list ****/
  {
    name: "sds_entry_list",
    description: "list the direct inner entries (or all nested entries) of a container item",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: 'UUID of the container item, or "root" / "trash" / "lost-and-found"' },
        recursive: { type: "boolean", description: "walk all descendants depth-first (default: false)" },
        Depth: { type: "integer", description: "maximum recursion depth — only effective with recursive: true" },
        only: { type: "string", enum: ["items", "links"], description: "restrict output to items or links only" },
        Fields: { type: "array", items: { type: "string" }, description: "extra fields to include — subset of Label, MIMEType, Value, Info" },
        InfoKeys: { type: "array", items: { type: "string" }, description: "return only these named keys from each entry info map" }
      },
      required: ["StoreId", "Id"]
    }
  },
  /**** sds_entry_update ****/
  {
    name: "sds_entry_update",
    description: "modify an existing entry; only explicitly specified fields are changed",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: "UUID of the entry to modify" },
        Label: { type: "string", description: "new display label" },
        MIMEType: { type: "string", description: "new MIME type (items only)" },
        Value: { type: "string", description: "new plain-text value (items only)" },
        ValueBase64: { type: "string", description: "new binary value as base64 (items only)" },
        File: { type: "string", description: "file path to read the new value from (items only)" },
        Info: { type: "object", description: "key-value pairs merged into the existing info map" },
        InfoDelete: { type: "array", items: { type: "string" }, description: "info keys to remove from the entry" }
      },
      required: ["StoreId", "Id"]
    }
  },
  /**** sds_entry_move ****/
  {
    name: "sds_entry_move",
    description: "move a live entry to a different container",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: "UUID of the entry to move" },
        to: { type: "string", description: 'UUID of the target container item, or "root" / "lost-and-found"' },
        at: { type: "integer", description: "insertion index, 0-based (default: append)" }
      },
      required: ["StoreId", "Id", "to"]
    }
  },
  /**** sds_entry_delete ****/
  {
    name: "sds_entry_delete",
    description: "soft-delete an entry by moving it to the trash",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: "UUID of the entry to soft-delete" }
      },
      required: ["StoreId", "Id"]
    }
  },
  /**** sds_entry_restore ****/
  {
    name: "sds_entry_restore",
    description: "move a trashed entry back to a live container (entry must be in trash)",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: "UUID of the trashed entry to restore" },
        to: { type: "string", description: 'UUID of the target container item, or "root" / "lost-and-found" (default: root)' },
        at: { type: "integer", description: "insertion index, 0-based (default: append)" }
      },
      required: ["StoreId", "Id"]
    }
  },
  /**** sds_entry_purge ****/
  {
    name: "sds_entry_purge",
    description: "permanently delete a trashed entry (entry must be in trash)",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Id: { type: "string", description: "UUID of the trashed entry to permanently delete" }
      },
      required: ["StoreId", "Id"]
    }
  }
], Oe = {
  sds_entry_create: async (e) => {
    const t = y(e);
    return P(t.StoreId, t, e);
  },
  sds_entry_get: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return z(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_list: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return Z(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_update: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return await G(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_move: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return Q(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_delete: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return X(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_restore: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return Y(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_entry_purge: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return ee(n.Store, e);
    } finally {
      await I(n);
    }
  }
}, Fe = {
  sds_entry_create: async (e, t) => P(e.StoreId, { StoreId: e.StoreId, PersistenceDir: e.PersistenceDir }, t, e.Store),
  sds_entry_get: async (e, t) => z(e.Store, t),
  sds_entry_list: async (e, t) => Z(e.Store, t),
  sds_entry_update: async (e, t) => G(e.Store, t),
  sds_entry_move: async (e, t) => Q(e.Store, t),
  sds_entry_delete: async (e, t) => X(e.Store, t),
  sds_entry_restore: async (e, t) => Y(e.Store, t),
  sds_entry_purge: async (e, t) => ee(e.Store, t)
};
async function P(e, t, n, o) {
  te(n);
  const r = n.Target != null;
  if (r) {
    if (n.MIMEType != null)
      throw new i("MIMEType cannot be combined with Target — only items have a MIME type");
    if (n.Value != null)
      throw new i("Value cannot be combined with Target");
    if (n.ValueBase64 != null)
      throw new i("ValueBase64 cannot be combined with Target");
    if (n.File != null)
      throw new i("File cannot be combined with Target");
  }
  const s = o != null, d = { ...t, StoreId: e };
  let a, c;
  if (s)
    a = o;
  else {
    const l = await w(d, !r);
    a = l.Store, c = l;
  }
  try {
    const l = g(n.Container ?? "root"), u = a.EntryWithId(l);
    if (u == null || !u.isItem)
      throw new i(`container '${l}' not found or is not an item`);
    const p = n.at != null ? R(n.at, "at") : void 0;
    if (r) {
      const f = g(n.Target), h = a.EntryWithId(f);
      if (h == null || !h.isItem)
        throw new i(`target '${f}' not found or is not an item`);
      const b = a.newLinkAt(h, u, p);
      return n.Label != null && (b.Label = n.Label), C(a._InfoProxyOf(b.Id), n), { Id: b.Id, created: !0, Kind: "link", Target: f };
    } else {
      const f = n.MIMEType ?? "text/plain", h = a.newItemAt(f, u, p);
      return n.Label != null && (h.Label = n.Label), await ne(a, h.Id, n), C(h.Info, n), { Id: h.Id, created: !0, Kind: "item" };
    }
  } finally {
    !s && c != null && await c.Engine.stop();
  }
}
function z(e, t) {
  const n = t.Id;
  if (n == null)
    throw new i("Id is required");
  const o = g(n), r = e.EntryWithId(o);
  if (r == null)
    throw new i(`entry '${o}' not found`);
  const s = t.Fields?.map((p) => p.toLowerCase()), d = t.InfoKeys, a = s == null && d == null, c = { Id: r.Id }, l = (p) => a || (s?.includes(p.toLowerCase()) ?? !1);
  if (l("Kind") && (c.Kind = r.isItem ? "item" : "link"), l("Label") && (c.Label = r.Label), r.isItem) {
    const p = r;
    l("MIMEType") && (c.MIMEType = p.Type), l("Value") && (c.Value = e._currentValueOf(r.Id) ?? null);
  }
  r.isLink && l("Target") && (c.Target = e._TargetOf(r.Id).Id);
  const u = e._InfoProxyOf(r.Id);
  switch (!0) {
    case d != null: {
      const p = {};
      for (const f of d)
        p[f] = u[f] ?? null;
      c.Info = p;
      break;
    }
    case l("Info"): {
      c.Info = { ...u };
      break;
    }
  }
  return c;
}
function Z(e, t) {
  const n = t.Id;
  if (n == null)
    throw new i("Id is required");
  const o = g(n), r = e.EntryWithId(o);
  if (r == null || !r.isItem)
    throw new i(`container '${o}' not found or is not an item`);
  const s = t.recursive ?? !1, d = t.Depth != null ? R(t.Depth, "Depth") : 1 / 0, a = t.only?.toLowerCase();
  if (a != null && !["items", "links"].includes(a))
    throw new i(`'only' must be 'items' or 'links' — got '${t.only}'`);
  const c = t.Fields?.map((h) => h.toLowerCase()), l = t.InfoKeys, u = /* @__PURE__ */ new Set([E, L]), p = [];
  function f(h, b) {
    for (const m of e._innerEntriesOf(h)) {
      if (u.has(m.Id))
        continue;
      const S = m.isItem ? "item" : "link";
      if (a == null || a === S + "s") {
        const T = { Id: m.Id, Kind: S };
        c?.includes("label") && (T.Label = m.Label), m.isItem && (c?.includes("mimetype") && (T.MIMEType = e._TypeOf(m.Id)), c?.includes("value") && (T.Value = e._currentValueOf(m.Id) ?? null));
        const B = e._InfoProxyOf(m.Id);
        switch (!0) {
          case l != null: {
            const M = {};
            for (const j of l)
              M[j] = B[j] ?? null;
            T.Info = M;
            break;
          }
          case c?.includes("info"): {
            T.Info = { ...B };
            break;
          }
        }
        p.push(T);
      }
      s && m.isItem && b + 1 < d && f(m.Id, b + 1);
    }
  }
  return f(o, 0), p;
}
async function G(e, t) {
  const n = t.Id;
  if (n == null)
    throw new i("Id is required");
  const o = g(n), r = e.EntryWithId(o);
  if (r == null)
    throw new i(`entry '${o}' not found`);
  if (r.isLink) {
    if (t.MIMEType != null)
      throw new i("MIMEType is not supported for links");
    if (t.Value != null)
      throw new i("Value is not supported for links");
    if (t.ValueBase64 != null)
      throw new i("ValueBase64 is not supported for links");
    if (t.File != null)
      throw new i("File is not supported for links");
  }
  if (te(t), t.Label != null && (r.Label = t.Label), r.isItem) {
    const s = r;
    t.MIMEType != null && (s.Type = t.MIMEType), await ne(e, s.Id, t);
  }
  return C(e._InfoProxyOf(o), t), { Id: o, updated: !0 };
}
function Q(e, t) {
  const n = t.Id, o = t.to;
  if (n == null)
    throw new i("Id is required");
  if (o == null)
    throw new i("to is required");
  const r = g(n), s = g(o), d = t.at != null ? R(t.at, "at") : void 0, a = e.EntryWithId(r), c = e.EntryWithId(s);
  if (a == null)
    throw new i(`entry '${r}' not found`);
  if (c == null || !c.isItem)
    throw new i(`container '${s}' not found or is not an item`);
  if (!a.mayBeMovedTo(c, d))
    throw new i(
      `cannot move '${r}' into its own descendant`
    );
  a.moveTo(c, d);
  const l = d ?? Array.from(e._innerEntriesOf(c.Id)).length - 1;
  return { Id: r, movedTo: s, at: l };
}
function X(e, t) {
  const n = t.Id;
  if (n == null)
    throw new i("Id is required");
  const o = g(n), r = e.EntryWithId(o);
  if (r == null)
    throw new i(`entry '${o}' not found`);
  if (!r.mayBeDeleted)
    throw new i(`entry '${o}' cannot be deleted`);
  return r.delete(), { Id: o, deleted: !0 };
}
function Y(e, t) {
  const n = t.Id, o = t.to ?? "root";
  if (n == null)
    throw new i("Id is required");
  const r = g(n), s = g(o), d = t.at != null ? R(t.at, "at") : void 0, a = e.EntryWithId(r), c = e.EntryWithId(s);
  if (a == null)
    throw new i(`entry '${r}' not found`);
  if (a.outerItemId !== E)
    throw new i(`entry '${r}' is not in the trash`);
  if (c == null || !c.isItem)
    throw new i(`container '${s}' not found or is not an item`);
  a.moveTo(c, d);
  const l = d ?? Array.from(e._innerEntriesOf(c.Id)).length - 1;
  return { Id: r, restoredTo: s, at: l };
}
function ee(e, t) {
  const n = t.Id;
  if (n == null)
    throw new i("Id is required");
  const o = g(n), r = e.EntryWithId(o);
  if (r == null)
    throw new i(`entry '${o}' not found`);
  if (r.outerItemId !== E)
    throw new i(`entry '${o}' is not in the trash — delete it first`);
  return r.purge(), { Id: o, purged: !0 };
}
const Ve = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function V(e) {
  if (!Ve.test(e))
    throw new i(
      `invalid info key ${JSON.stringify(e)} — keys must be valid JavaScript identifiers`
    );
}
function R(e, t) {
  if (typeof e != "number" || !Number.isInteger(e) || e < 0)
    throw new i(`'${t}' must be a non-negative integer — got ${e}`);
  return e;
}
function te(e) {
  if ([
    e.Value,
    e.ValueBase64,
    e.File
  ].filter((n) => n != null).length > 1)
    throw new i("Value, ValueBase64, and File are mutually exclusive");
}
async function ne(e, t, n) {
  const o = e.EntryWithId(t);
  switch (!0) {
    case n.File != null: {
      const r = await N(n.File), s = !o.Type.startsWith("text/");
      o.writeValue(s ? new Uint8Array(r) : r.toString("utf8"));
      break;
    }
    case n.ValueBase64 != null: {
      const r = Buffer.from(n.ValueBase64, "base64"), s = !o.Type.startsWith("text/");
      o.writeValue(s ? new Uint8Array(r) : r.toString("utf8"));
      break;
    }
    case n.Value != null: {
      o.writeValue(n.Value);
      break;
    }
  }
}
function C(e, t) {
  const n = t.Info, o = t.InfoDelete;
  if (n != null) {
    if (typeof n != "object" || Array.isArray(n))
      throw new i(`'Info' must be a plain object — got ${Array.isArray(n) ? "array" : typeof n}`);
    for (const [r, s] of Object.entries(n))
      V(r), e[r] = s;
  }
  if (o != null) {
    if (!Array.isArray(o))
      throw new i(`'InfoDelete' must be an array of strings — got ${typeof o}`);
    for (const r of o) {
      if (typeof r != "string")
        throw new i(`'InfoDelete' entries must be strings — got ${typeof r}`);
      V(r), delete e[r];
    }
  }
}
const Ae = 720 * 60 * 60 * 1e3, Ne = [
  /**** sds_trash_list ****/
  {
    name: "sds_trash_list",
    description: "list all entries currently in the trash",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        only: { type: "string", enum: ["items", "links"], description: "restrict output to items or links only" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_trash_purge_all ****/
  {
    name: "sds_trash_purge_all",
    description: "permanently delete every entry in the trash",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" }
      },
      required: ["StoreId"]
    }
  },
  /**** sds_trash_purge_expired ****/
  {
    name: "sds_trash_purge_expired",
    description: "permanently delete trash entries older than TTLms milliseconds (default: 30 days)",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        TTLms: { type: "integer", description: "age threshold in ms — entries older than this are purged (default: 2592000000 = 30 days)" }
      },
      required: ["StoreId"]
    }
  }
], We = {
  sds_trash_list: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return re(n.Store, e);
    } finally {
      await I(n);
    }
  },
  sds_trash_purge_all: async (e) => {
    const t = y(e), n = await w(t);
    try {
      return oe(n.Store);
    } finally {
      await I(n);
    }
  },
  sds_trash_purge_expired: async (e) => {
    const t = y(e), n = se(e), o = await w(t);
    try {
      return ie(o.Store, n);
    } finally {
      await I(o);
    }
  }
}, Ke = {
  sds_trash_list: async (e, t) => re(e.Store, t),
  sds_trash_purge_all: async (e, t) => oe(e.Store),
  sds_trash_purge_expired: async (e, t) => {
    const n = se(t);
    return ie(e.Store, n);
  }
};
function re(e, t) {
  const n = t.only?.toLowerCase();
  if (n != null && !["items", "links"].includes(n))
    throw new i(`'only' must be 'items' or 'links' — got '${t.only}'`);
  const o = e.TrashItem;
  return e._innerEntriesOf(o.Id).filter((s) => {
    if (n == null)
      return !0;
    const d = s.isItem ? "item" : "link";
    return n === d + "s";
  }).map((s) => ({
    Id: s.Id,
    Kind: s.isItem ? "item" : "link",
    Label: s.Label
  }));
}
function oe(e) {
  const t = e.TrashItem, n = [...e._innerEntriesOf(t.Id)];
  let o = 0;
  for (const r of n)
    try {
      r.purge(), o++;
    } catch {
    }
  return { purged: o };
}
function ie(e, t) {
  return { purged: e.purgeExpiredTrashEntries(t), TTLms: t };
}
function se(e) {
  const t = e.TTLms ?? Ae;
  if (typeof t != "number" || !Number.isInteger(t) || t <= 0)
    throw new i(`'TTLms' must be a positive integer — got ${t}`);
  return t;
}
const He = [
  /**** sds_tree_show ****/
  {
    name: "sds_tree_show",
    description: "return the entire store as a nested tree structure starting from root",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        Depth: { type: "integer", description: "maximum number of levels to include (default: unlimited)" }
      },
      required: ["StoreId"]
    }
  }
], Je = {
  sds_tree_show: async (e) => {
    const t = y(e), n = de(e), o = await w(t);
    try {
      return ae(o.Store, n);
    } finally {
      await I(o);
    }
  }
}, Pe = {
  sds_tree_show: async (e, t) => {
    const n = de(t);
    return ae(e.Store, n);
  }
};
function ae(e, t) {
  return { Root: ce(e, x, t, 0) };
}
const ze = /* @__PURE__ */ new Set([E, L]);
function ce(e, t, n, o) {
  if (o >= n)
    return [];
  const r = [];
  for (const s of e._innerEntriesOf(t))
    if (!ze.has(s.Id))
      if (s.isLink) {
        const d = e._TargetOf(s.Id).Id;
        r.push({ Id: s.Id, Kind: "link", Label: s.Label, TargetId: d });
      } else {
        const d = o + 1 < n ? ce(e, s.Id, n, o + 1) : [];
        r.push({ Id: s.Id, Kind: "item", Label: s.Label, innerEntries: d });
      }
  return r;
}
function de(e) {
  if (e.Depth == null)
    return 1 / 0;
  const t = e.Depth;
  if (typeof t != "number" || !Number.isInteger(t) || t < 0)
    throw new i(`'Depth' must be a non-negative integer — got ${t}`);
  return t;
}
const Ze = [
  /**** sds_token_issue ****/
  {
    name: "sds_token_issue",
    description: "request a new scoped JWT from the server (requires admin token)",
    inputSchema: {
      type: "object",
      properties: {
        ServerURL: { type: "string", description: "WebSocket server base URL" },
        AdminToken: { type: "string", description: "admin JWT with admin scope" },
        Sub: { type: "string", description: "subject / user identifier for the new token (e.g. an email address)" },
        Scope: { type: "string", enum: ["read", "write", "admin"], description: "permission level for the issued token" },
        Exp: { type: "string", description: "expiry duration — number followed by s, m, h, or d (default: 24h)" }
      },
      required: ["ServerURL", "AdminToken", "Sub", "Scope"]
    }
  }
], Ge = /* @__PURE__ */ new Set(["read", "write", "admin"]), Qe = /^(\d+)(s|m|h|d)$/, Xe = {
  sds_token_issue: async (e) => {
    const t = e.ServerURL, n = e.AdminToken, o = e.Sub, r = e.Scope, s = e.Exp ?? "24h";
    if (t == null)
      throw new i("ServerURL is required");
    if (n == null)
      throw new i("AdminToken is required");
    if (o == null)
      throw new i("Sub is required");
    if (r == null)
      throw new i("Scope is required");
    if (!/^wss?:\/\//.test(t))
      throw new i(
        `invalid ServerURL '${t}' — must start with 'ws://' or 'wss://'`
      );
    if (!Ge.has(r))
      throw new i(`invalid Scope '${r}' — must be read, write, or admin`);
    if (!Qe.test(s))
      throw new i(`invalid Exp '${s}' — use a number followed by s, m, h, or d`);
    const a = t.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://").replace(/\/+$/, "") + "/api/token";
    let c;
    try {
      c = await fetch(a, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${n}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sub: o, scope: r, exp: s })
      });
    } catch (p) {
      throw new i(
        `HTTP request to '${a}' failed: ${p.message}`
      );
    }
    const l = await c.json().catch(() => ({}));
    switch (!0) {
      case c.status === 401:
        throw new i(
          `authentication failed — token is missing or expired: ${l.error ?? "unauthorized"}`
        );
      case c.status === 403:
        throw new i(
          `admin scope required: ${l.error ?? "forbidden"}`
        );
      case !c.ok:
        throw new i(
          `server returned ${c.status}: ${l.error ?? "unknown error"}`
        );
    }
    const u = l.token;
    if (u == null)
      throw new i("server response did not contain a token");
    return { Token: u, Sub: o, Scope: r, Exp: s };
  }
}, le = {
  ...Re,
  ...Fe,
  ...Ke,
  ...Pe
}, Ye = new Set(Object.keys(le)), et = [
  /**** sds_batch ****/
  {
    name: "sds_batch",
    description: "execute multiple operations against one store in a single session — the store is opened once, all commands run sequentially, then it is closed; StoreId and PersistenceDir are inherited by all commands",
    inputSchema: {
      type: "object",
      properties: {
        StoreId: { type: "string", description: "store identifier" },
        PersistenceDir: { type: "string", description: "local database directory (default: ~/.sds)" },
        onError: { type: "string", enum: ["stop", "continue"], description: '"stop" (default): abort on first failure; "continue": attempt all commands and collect errors' },
        Commands: {
          type: "array",
          description: "ordered list of operations to execute",
          items: {
            type: "object",
            properties: {
              Tool: { type: "string", description: "name of the tool to invoke" },
              Params: { type: "object", description: "parameters for that tool, without StoreId and PersistenceDir" }
            },
            required: ["Tool", "Params"]
          }
        }
      },
      required: ["StoreId", "Commands"]
    }
  }
], tt = {
  sds_batch: async (e) => {
    const t = y(e), n = t.StoreId, o = (e.onError ?? "stop").toLowerCase(), r = e.Commands;
    if (n == null)
      throw new i("StoreId is required");
    if (r == null || !Array.isArray(r))
      throw new i("Commands must be an array");
    if (o !== "stop" && o !== "continue")
      throw new i(`'onError' must be 'stop' or 'continue' — got '${e.onError}'`);
    for (const a of r) {
      if (typeof a.Tool != "string")
        throw new i("each Command must have a string Tool field");
      if (!Ye.has(a.Tool))
        throw new i(
          `tool '${a.Tool}' is not allowed inside sds_batch`
        );
      if (a.Params == null || typeof a.Params != "object")
        throw new i(`Command for '${a.Tool}' must have a Params object`);
    }
    const s = await Ee(t, !0), d = [];
    try {
      for (const a of r) {
        const c = le[a.Tool];
        try {
          const l = await c(s, a.Params);
          d.push({ Tool: a.Tool, ok: !0, Result: l });
        } catch (l) {
          const u = l instanceof Error ? l.message : String(l);
          if (d.push({ Tool: a.Tool, ok: !1, Error: u }), o === "stop")
            break;
        }
      }
    } finally {
      await s.close();
    }
    return { Results: d };
  }
};
let ue = "sds-mcp-server", pe = "0.0.0";
const nt = [
  ...xe,
  ...je,
  ...Ne,
  ...He,
  ...Ze,
  ...et
], rt = {
  ...Le,
  ...Oe,
  ...We,
  ...Je,
  ...Xe,
  ...tt
};
function ot() {
  const e = new ye(
    { name: ue, version: pe },
    { capabilities: { tools: {} } }
  );
  return e.setRequestHandler(we, async () => ({
    tools: nt
  })), e.setRequestHandler(he, async (t) => {
    const { name: n, arguments: o = {} } = t.params, r = rt[n];
    if (r == null)
      return O(`unknown tool: '${n}'`);
    try {
      const s = await r(o);
      return Se(s);
    } catch (s) {
      return O(s.message ?? String(s));
    }
  }), e;
}
const it = /* @__PURE__ */ new Set([
  "--store",
  "--persistence-dir",
  "--server",
  "--token",
  "--admin-token"
]);
function st(e) {
  const t = {};
  for (let n = 0; n < e.length; n++)
    switch (e[n]) {
      case "--store":
        t.StoreId = e[++n];
        break;
      case "--persistence-dir":
        t.PersistenceDir = e[++n];
        break;
      case "--server":
        t.ServerURL = e[++n];
        break;
      case "--token":
        t.Token = e[++n];
        break;
      case "--admin-token":
        t.AdminToken = e[++n];
        break;
      default:
        e[n]?.startsWith("--") && !it.has(e[n]) && process.stderr.write(
          `sds-mcp-server: unknown argument '${e[n]}' — known flags: --store, --persistence-dir, --server, --token, --admin-token
`
        );
    }
  return t;
}
async function at() {
  ge(st(process.argv.slice(2)));
  const e = ot(), t = new fe();
  await e.connect(t);
}
async function mt(e, t = "sds-mcp-server", n = "0.0.0") {
  return ue = t, pe = n, Te(e), at();
}
export {
  mt as runMCPServer
};
