#!/usr/bin/env -S node --no-warnings
import { Command as Q } from "commander";
import X from "node:os";
import M from "node:path";
import g from "node:fs/promises";
import { SDS_DataStore as _ } from "@rozek/sds-core-jj";
import { SDS_DesktopPersistenceProvider as V } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as B } from "@rozek/sds-sync-engine";
import { SDS_WebSocketProvider as O } from "@rozek/sds-network-websocket";
import { TrashId as N, RootId as E, LostAndFoundId as ee } from "@rozek/sds-core";
import C from "node:readline";
const c = {
  OK: 0,
  // success
  GeneralError: 1,
  // unspecified runtime error
  UsageError: 2,
  // bad arguments or missing required option
  NotFound: 3,
  // entry, store, or file not found
  Unauthorized: 4,
  // authentication failed (missing or invalid token)
  NetworkError: 5,
  // WebSocket or HTTP connection error
  Forbidden: 6
  // operation not permitted for this scope
};
class U extends Error {
  ExitCode;
  constructor(o, n = c.UsageError) {
    super(o), this.ExitCode = n;
  }
}
function m(e) {
  const o = e.server ?? process.env.SDS_SERVER_URL, n = e.dataDir ?? process.env.SDS_DATA_DIR ?? M.join(X.homedir(), ".sds"), t = e.store ?? process.env.SDS_STORE_ID, r = e.token ?? process.env.SDS_TOKEN, s = e.adminToken ?? process.env.SDS_ADMIN_TOKEN, i = (e.format ?? "text").toLowerCase();
  if (i !== "text" && i !== "json")
    throw new U(
      `'--format' accepts 'text' or 'json' — got '${e.format}'`,
      c.UsageError
    );
  const a = i, d = (e.onError ?? "stop").toLowerCase();
  if (d !== "stop" && d !== "continue" && d !== "ask")
    throw new U(
      `'--on-error' accepts 'stop', 'continue', or 'ask' — got '${e.onError}'`,
      c.UsageError
    );
  return { ServerURL: o, DataDir: n, StoreId: t, Token: r, AdminToken: s, Format: a, OnError: d };
}
function D(e, o) {
  const n = o.replace(/[^a-zA-Z0-9_-]/g, "_");
  return M.join(e.DataDir, `${n}.db`);
}
function f(e = "") {
  process.stdout.write(e + `
`);
}
function te(e) {
  process.stdout.write(JSON.stringify(e, null, 2) + `
`);
}
function L(e, o, n) {
  e.Format === "json" ? process.stderr.write(
    JSON.stringify({ error: o, exitCode: n ?? 1 }) + `
`
  ) : process.stderr.write(`sds: error: ${o}
`);
}
function w(e, o) {
  if (e.Format === "json") {
    te(o);
    return;
  }
  switch (!0) {
    case o == null:
      break;
    case typeof o == "string":
      f(o);
      break;
    case Array.isArray(o):
      for (const n of o)
        f(String(n));
      break;
    default:
      f(JSON.stringify(o));
  }
}
function ne(e, o, n, t, r, s) {
  const i = [e];
  switch (s.showLabel && i.push(o !== "" ? o : "(no label)"), s.showMIME && i.push(n), s.showValue && i.push(t != null ? String(t) : "(no value)"), !0) {
    case s.InfoKey != null:
      i.push(JSON.stringify(r[s.InfoKey] ?? null));
      break;
    case s.showInfo:
      i.push(JSON.stringify(r));
      break;
  }
  return i.join("  ");
}
function q(e, o, n, t, r, s, i) {
  const a = i ? "└── " : "├── ", d = n === "link" ? ` → ${t ?? "?"}` : "", u = o !== "" ? `  ${o}` : "", h = `${s}${a}${e}${u}${d}`, I = s + (i ? "    " : "│   "), v = [h];
  for (let T = 0; T < r.length; T++) {
    const b = r[T], F = T === r.length - 1;
    v.push(
      ...q(
        b.Id,
        b.Label,
        b.Kind,
        b.TargetId,
        b.Children,
        I,
        F
      )
    );
  }
  return v;
}
class l extends Error {
  ExitCode;
  constructor(o, n = c.GeneralError) {
    super(o), this.name = "SDS_CommandError", this.ExitCode = n;
  }
}
async function y(e, o = !1) {
  const n = e.StoreId;
  if (n == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  await g.mkdir(e.DataDir, { recursive: !0 });
  const t = D(e, n), r = new V(t, n);
  let s;
  try {
    const a = await r.loadSnapshot();
    switch (!0) {
      case a != null: {
        s = _.fromBinary(a);
        break;
      }
      case o: {
        s = _.fromScratch();
        break;
      }
      default:
        throw await r.close(), new l(
          `store '${n}' not found in '${e.DataDir}'`,
          c.NotFound
        );
    }
  } catch (a) {
    throw a instanceof l ? a : (await r.close().catch(() => {
    }), new l(
      `failed to open store '${n}': ${a.message}`,
      c.GeneralError
    ));
  }
  const i = new B(s, { PersistenceProvider: r });
  return await i.start(), { Store: s, Persistence: r, Engine: i };
}
async function p(e) {
  await e.Engine.stop();
}
async function z(e, o = 5e3) {
  const n = e.StoreId, t = e.ServerURL, r = e.Token;
  if (n == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  if (t == null)
    throw new l(
      "no server URL — set SDS_SERVER_URL or use --server",
      c.UsageError
    );
  if (!/^wss?:\/\//.test(t))
    throw new l(
      `invalid server URL '${t}' — must start with 'ws://' or 'wss://'`,
      c.UsageError
    );
  if (r == null)
    throw new l(
      "no client token — set SDS_TOKEN or use --token",
      c.UsageError
    );
  await g.mkdir(e.DataDir, { recursive: !0 });
  const s = D(e, n), i = new V(s, n), a = await i.loadSnapshot(), d = a != null ? _.fromBinary(a) : _.fromScratch(), u = new O(n), h = new B(d, {
    PersistenceProvider: i,
    NetworkProvider: u
  });
  await h.start();
  let I = !1, v;
  const T = new Promise((x) => {
    v = x;
  }), b = h.onConnectionChange((x) => {
    x === "connected" && (I = !0, setTimeout(v, o)), x === "disconnected" && v();
  }), F = setTimeout(() => {
    v();
  }, o * 2);
  try {
    await h.connectTo(t, { Token: r }), await T;
  } catch (x) {
    throw new l(
      `sync failed: ${x.message}`,
      c.NetworkError
    );
  } finally {
    clearTimeout(F), b(), await h.stop();
  }
  return { Connected: I, StoreId: n, ServerURL: t };
}
async function oe(e) {
  const o = e.StoreId;
  if (o == null)
    return !1;
  const n = D(e, o);
  try {
    return await g.access(n), !0;
  } catch {
    return !1;
  }
}
async function re(e) {
  const o = e.StoreId;
  if (o == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  const n = D(e, o);
  try {
    await g.unlink(n), await g.unlink(n + "-wal").catch(() => {
    }), await g.unlink(n + "-shm").catch(() => {
    });
  } catch (t) {
    const r = t;
    throw r.code === "ENOENT" ? new l(
      `store '${o}' not found in '${e.DataDir}'`,
      c.NotFound
    ) : new l(
      `failed to delete store '${o}': ${r.message}`,
      c.GeneralError
    );
  }
}
function S(e) {
  switch (e.toLowerCase()) {
    case "root":
      return E;
    case "trash":
      return N;
    default:
      return e;
  }
}
function k(e, o) {
  const n = parseInt(e, 10);
  if (isNaN(n))
    throw new l(
      `invalid value for ${o}: '${e}' — expected an integer`,
      c.UsageError
    );
  return n;
}
async function P(e) {
  try {
    return await g.readFile(e);
  } catch (o) {
    throw o.code === "ENOENT" ? new l(
      `file not found: '${e}'`,
      c.NotFound
    ) : o;
  }
}
const se = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function R(e) {
  if (!se.test(e))
    throw new l(
      `invalid info key ${JSON.stringify(e)} — keys must be valid JavaScript identifiers`,
      c.UsageError
    );
}
function $(e) {
  const o = [], n = {};
  let t = 0;
  for (; t < e.length; ) {
    const r = e[t];
    if (r.startsWith("--info.") && r.includes("=")) {
      const s = r.indexOf("="), i = r.slice(7, s), a = r.slice(s + 1);
      R(i), n[i] = G(a), t++;
      continue;
    }
    if (r.startsWith("--info.") && !r.includes("=")) {
      const s = r.slice(7);
      R(s);
      const i = e[t + 1];
      if (i != null && !i.startsWith("--")) {
        n[s] = G(i), t += 2;
        continue;
      }
      n[s] = !0, t++;
      continue;
    }
    o.push(r), t++;
  }
  return { CleanArgv: o, InfoEntries: n };
}
function G(e) {
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}
function j(e, o, n) {
  if (o != null) {
    let t;
    if (typeof o == "string")
      try {
        t = JSON.parse(o);
      } catch {
        throw new l(
          `--info value is not valid JSON: ${o}`,
          c.UsageError
        );
      }
    else
      t = o;
    if (typeof t != "object" || t === null || Array.isArray(t))
      throw new l(
        "--info value must be a JSON object",
        c.UsageError
      );
    for (const [r, s] of Object.entries(t))
      R(r), e[r] = s;
  }
  for (const [t, r] of Object.entries(n))
    e[t] = r;
}
function H(e) {
  const o = [];
  let n = "", t = 0;
  for (; t < e.length; ) {
    const r = e[t];
    switch (!0) {
      // skip leading and inter-token whitespace
      case (r === " " || r === "	"): {
        n.length > 0 && (o.push(n), n = ""), t++;
        break;
      }
      // single-quoted string — no escapes inside
      case r === "'": {
        for (t++; t < e.length && e[t] !== "'"; )
          n += e[t], t++;
        t++;
        break;
      }
      // double-quoted string — supports \" and \\ inside
      case r === '"': {
        for (t++; t < e.length && e[t] !== '"'; )
          if (e[t] === "\\" && t + 1 < e.length) {
            const s = e[t + 1];
            n += s === '"' || s === "\\" ? s : "\\" + s, t += 2;
          } else
            n += e[t], t++;
        t++;
        break;
      }
      // inline comment — everything from # to end of line is dropped
      case (r === "#" && n.length === 0): {
        t = e.length;
        break;
      }
      default:
        r === "\\" && t + 1 < e.length ? (n += e[t + 1], t += 2) : (n += r, t++);
    }
  }
  return n.length > 0 && o.push(n), o;
}
async function ie(e) {
  const o = process.stdin.isTTY, n = o ? "\x1B[1msds>\x1B[0m " : "sds> ", t = C.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: o,
    prompt: n
  });
  o && (process.stdout.write(
    `SDS interactive shell — type "help [command]" for help, "exit" to quit
`
  ), t.prompt());
  for await (const r of t) {
    const s = r.trim();
    if (s === "" || s.startsWith("#")) {
      o && t.prompt();
      continue;
    }
    if (s === "exit" || s === "quit")
      break;
    const i = H(s);
    if (i.length === 0) {
      o && t.prompt();
      continue;
    }
    try {
      await e(i);
    } catch (a) {
      process.stderr.write(`sds: ${a.message}
`);
    }
    o && t.prompt();
  }
  t.close();
}
async function ae(e, o, n) {
  let t;
  if (o === "-")
    t = process.stdin;
  else
    try {
      t = (await g.open(o)).createReadStream();
    } catch {
      throw new l(
        `cannot open script file '${o}'`,
        c.NotFound
      );
    }
  const r = C.createInterface({
    input: t,
    terminal: !1
  });
  let s = 0;
  for await (const i of r) {
    const a = i.trim();
    if (a === "" || a.startsWith("#"))
      continue;
    const d = H(a);
    if (d.length === 0)
      continue;
    let u = 0;
    try {
      u = await n(d, e);
    } catch (h) {
      u = 1, process.stderr.write(`sds: ${h.message}
`);
    }
    if (u !== 0)
      switch (s = u, e.OnError) {
        case "stop":
          return r.close(), u;
        case "continue":
          break;
        // keep executing
        case "ask": {
          if (!await ce())
            return r.close(), u;
          break;
        }
      }
  }
  return r.close(), s;
}
async function ce() {
  return process.stdin.isTTY ? new Promise((o) => {
    const n = C.createInterface({ input: process.stdin, output: process.stdout });
    n.question("error — continue? [y/N] ", (t) => {
      n.close(), o(t.trim().toLowerCase() === "y");
    });
  }) : !1;
}
const le = "0.0.9", de = {
  version: le
};
function ue(e) {
  e.command("token").description("manage authentication tokens (requires admin token)").command("issue").description("request a new JWT from the server").requiredOption("--sub <subject>", "user identifier (e.g. email address)").requiredOption("--scope <scope>", "token scope: read | write | admin").option("--exp <duration>", "expiry duration, e.g. 24h or 7d", "24h").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await we(r, n);
  });
}
const fe = /* @__PURE__ */ new Set(["read", "write", "admin"]), me = /^(\d+)(s|m|h|d)$/;
async function we(e, o) {
  const { ServerURL: n, AdminToken: t } = e;
  if (t == null)
    throw new l(
      "no admin token — set SDS_ADMIN_TOKEN or use --admin-token",
      c.Unauthorized
    );
  if (n == null)
    throw new l(
      "no server URL — set SDS_SERVER_URL or use --server",
      c.UsageError
    );
  if (!/^wss?:\/\//.test(n))
    throw new l(
      `invalid server URL '${n}' — must start with 'ws://' or 'wss://'`,
      c.UsageError
    );
  if (!fe.has(o.scope))
    throw new l(
      `invalid scope '${o.scope}' — must be read, write, or admin`,
      c.UsageError
    );
  if (!me.test(o.exp))
    throw new l(
      `invalid expiry '${o.exp}' — use a number followed by s, m, h, or d`,
      c.UsageError
    );
  const s = n.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://").replace(/\/+$/, "") + "/api/token";
  let i;
  try {
    i = await fetch(s, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sub: o.sub, scope: o.scope, exp: o.exp })
    });
  } catch (u) {
    throw new l(
      `HTTP request to '${s}' failed: ${u.message}`,
      c.NetworkError
    );
  }
  const a = await i.json().catch(() => ({}));
  switch (!0) {
    case i.status === 401:
      throw new l(
        `token rejected by server: ${a.error ?? "unauthorized"}`,
        c.Unauthorized
      );
    case i.status === 403:
      throw new l(
        `admin scope required: ${a.error ?? "forbidden"}`,
        c.Forbidden
      );
    case !i.ok:
      throw new l(
        `server returned ${i.status}: ${a.error ?? "unknown error"}`,
        c.GeneralError
      );
  }
  const d = a.token;
  if (d == null)
    throw new l(
      "server response did not contain a token",
      c.GeneralError
    );
  e.Format === "json" ? w(e, { token: d, sub: o.sub, scope: o.scope, exp: o.exp }) : w(e, d);
}
function he(e) {
  const o = e.command("store").description("store lifecycle operations");
  o.command("info").description("show local store metadata (existence, entry count, DB path)").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await ye(r);
  }), o.command("ping").description("check connectivity to the WebSocket server").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await pe(r);
  }), o.command("sync").description("connect to server, exchange CRDT patches, and disconnect").option("--timeout <ms>", "milliseconds to wait after connecting", "5000").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await Ie(r, k(n.timeout, "--timeout"));
  }), o.command("destroy").description("permanently delete the local store database").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await Se(r);
  }), o.command("export").description("export the current store snapshot").option("--encoding <enc>", "serialisation encoding: json | binary", "json").option("--output <file>", "destination file (default: stdout)").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await ge(r, n.encoding, n.output);
  }), o.command("import").description("CRDT-merge a snapshot file into the local store").requiredOption("--input <file>", "source file to import").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await Ee(r, n.input);
  });
}
async function ye(e) {
  const o = e.StoreId;
  if (o == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  if (!await oe(e)) {
    e.Format === "json" ? w(e, { storeId: o, exists: !1 }) : f(`store '${o}': not found in '${e.DataDir}'`);
    return;
  }
  const t = await y(e);
  try {
    const r = ke(t.Store);
    e.Format === "json" ? w(e, {
      storeId: o,
      exists: !0,
      entryCount: r,
      dbPath: D(e, o)
    }) : (f(`store:       ${o}`), f(`entries:     ${r}`), f(`db path:     ${D(e, o)}`));
  } finally {
    await p(t);
  }
}
async function pe(e) {
  const o = e.ServerURL, n = e.Token;
  if (o == null)
    throw new l(
      "no server URL — set SDS_SERVER_URL or use --server",
      c.UsageError
    );
  if (n == null)
    throw new l(
      "no client token — set SDS_TOKEN or use --token",
      c.UsageError
    );
  try {
    const t = await z(e, 1e3);
    e.Format === "json" ? w(e, { server: t.ServerURL, storeId: t.StoreId, reachable: !0 }) : f(`server '${t.ServerURL}': reachable`);
  } catch (t) {
    if (t instanceof l && t.ExitCode === c.NetworkError)
      e.Format === "json" ? w(e, { server: o, reachable: !1, error: t.message }) : f(`server '${o}': unreachable — ${t.message}`);
    else
      throw t;
  }
}
async function Ie(e, o) {
  const n = await z(e, o);
  if (e.Format === "json")
    w(e, {
      storeId: n.StoreId,
      server: n.ServerURL,
      connected: n.Connected,
      synced: n.Connected
    });
  else {
    const t = n.Connected ? "synced" : "could not connect";
    f(`store '${n.StoreId}': ${t}`);
  }
}
async function Se(e) {
  await re(e), e.Format === "json" ? w(e, { storeId: e.StoreId, destroyed: !0 }) : f(`store '${e.StoreId}': deleted`);
}
async function ge(e, o, n) {
  const t = o.toLowerCase();
  if (t !== "json" && t !== "binary")
    throw new l(
      `'--encoding' accepts 'json' or 'binary' — got '${o}'`,
      c.UsageError
    );
  const r = await y(e);
  try {
    const s = t === "binary", i = s ? r.Store.asBinary() : JSON.stringify(r.Store.asJSON(), null, 2);
    n != null ? (await g.writeFile(n, s ? i : i + `
`), e.Format === "json" ? w(e, { exported: !0, file: n, format: t }) : f(`exported to '${n}'`)) : s ? process.stdout.write(i) : process.stdout.write(i + `
`);
  } finally {
    await p(r);
  }
}
async function Ee(e, o) {
  const n = await P(o), t = n.toString("utf8").trimStart(), r = t.startsWith("{") || t.startsWith("["), s = await y(e, !0);
  try {
    if (r) {
      let i;
      try {
        i = JSON.parse(t);
      } catch {
        throw new l(
          `'${o}' does not contain valid JSON`,
          c.UsageError
        );
      }
      K(s.Store, i);
    } else {
      const i = _.fromBinary(new Uint8Array(n));
      try {
        K(s.Store, i.asJSON());
      } finally {
        i.dispose();
      }
    }
    e.Format === "json" ? w(e, { imported: !0, file: o }) : f(`imported '${o}'`);
  } finally {
    await p(s);
  }
}
function K(e, o) {
  const n = o, t = /* @__PURE__ */ new Set([E, N, ee]), r = n.innerEntries;
  if (r != null)
    for (const s of r)
      t.has(s.Id) || e.newEntryFromJSONat(s, e.RootItem);
}
function ke(e) {
  const o = /* @__PURE__ */ new Set([E, N]);
  let n = 0;
  function t(r) {
    for (const s of e._innerEntriesOf(r))
      o.has(s.Id) || n++, s.isItem && t(s.Id);
  }
  return t(E), n;
}
function ve(e, o) {
  const n = e.command("entry").description("operations on entries (items and links)");
  n.command("create").description("create a new item (default) or link (with --target)").option("--target <itemId>", "link target — creates a link instead of an item").option("--container <itemId>", "container item (default: root)").option("--at <index>", "insertion index (default: append)").option("--label <label>", "initial label").option("--mime <type>", "MIME type (default: text/plain, items only)").option("--value <string>", "initial text value (items only)").option("--file <path>", "read initial value from file (items only)").option("--info <json>", "initial info map as JSON object").option("--info.<key>", "set a single info entry, e.g. --info.author").action(async (t, r) => {
    const s = m(r.optsWithGlobals()), { InfoEntries: i } = $(o);
    await be(s, t, i);
  }), n.command("get <id>").description("display all or selected fields of an entry").option("--kind", "include entry kind (item or link)").option("--label", "include label").option("--mime", "include MIME type (items only)").option("--value", "include value (items only)").option("--info", "include full info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").option("--target", "include link target ID (links only)").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals()), { InfoEntries: a } = $(o), d = Object.keys(a)[0];
    await Te(i, t, r, d);
  }), n.command("list <id>").description("list entries in a container item (only IDs by default)").option("--recursive", "traverse inner containers recursively").option("--depth <n>", "maximum recursion depth").option("--only <kind>", "filter by kind: items | links").option("--label", "include label").option("--mime", "include MIME type (items only)").option("--value", "include value (items only)").option("--info", "include info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals()), { InfoEntries: a } = $(o), d = Object.keys(a)[0];
    await xe(i, t, r, d);
  }), n.command("update <id>").description("update entry properties (works on both items and links)").option("--label <label>", "new label (items and links)").option("--mime <type>", "new MIME type (items only)").option("--value <string>", "new text value (items only)").option("--file <path>", "read new value from file (items only)").option("--info <json>", "merge info map from JSON object").option("--info.<key>", "set a single info entry, e.g. --info.author").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals()), { InfoEntries: a } = $(o);
    await Ue(i, t, r, a);
  }), n.command("move <id>").description("move an entry to a different container").requiredOption("--to <targetId>", "destination container item ID").option("--at <index>", "insertion index (default: append)").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals());
    await $e(i, t, r.to, r.at);
  }), n.command("delete <id>").description("soft-delete: move entry to the trash").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals());
    await De(i, t);
  }), n.command("restore <id>").description("restore a trashed entry (moves to root or --to target)").option("--to <targetId>", "destination container item ID (default: root)").option("--at <index>", "insertion index (default: append)").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals());
    await _e(i, t, r.to, r.at);
  }), n.command("purge <id>").description("permanently delete an entry (must be in the trash)").action(async (t, r, s) => {
    const i = m(s.optsWithGlobals());
    await Ne(i, t);
  });
}
async function be(e, o, n) {
  if (o.value != null && o.file != null)
    throw new l(
      "'--value' and '--file' are mutually exclusive — specify at most one",
      c.UsageError
    );
  if (o.target != null) {
    if (o.mime != null)
      throw new l(
        "'--mime' is not supported when creating a link — only items have a MIME type",
        c.UsageError
      );
    if (o.value != null)
      throw new l(
        "'--value' is not supported when creating a link — only items have a value",
        c.UsageError
      );
    if (o.file != null)
      throw new l(
        "'--file' is not supported when creating a link — only items have a value",
        c.UsageError
      );
    const t = await y(e);
    try {
      const r = S(o.target), s = S(o.container ?? E), i = o.at != null ? k(o.at, "--at") : void 0;
      if (i != null && i < 0)
        throw new l(
          `'--at' must be a non-negative integer — got ${i}`,
          c.UsageError
        );
      const a = t.Store.EntryWithId(r), d = t.Store.EntryWithId(s);
      if (a == null || !a.isItem)
        throw new l(
          `target '${r}' not found or is not an item`,
          c.NotFound
        );
      if (d == null || !d.isItem)
        throw new l(
          `container '${s}' not found or is not an item`,
          c.NotFound
        );
      const u = t.Store.newLinkAt(a, d, i);
      o.label != null && (u.Label = o.label), j(
        t.Store._InfoProxyOf(u.Id),
        o.info ?? null,
        n
      ), e.Format === "json" ? w(e, { id: u.Id, created: !0, kind: "link", target: r }) : f(u.Id);
    } finally {
      await p(t);
    }
  } else {
    const t = await y(e, !0);
    try {
      const r = S(o.container ?? E), s = t.Store.EntryWithId(r);
      if (s == null || !s.isItem)
        throw new l(
          `container '${r}' not found or is not an item`,
          c.NotFound
        );
      const i = o.at != null ? k(o.at, "--at") : void 0;
      if (i != null && i < 0)
        throw new l(
          `'--at' must be a non-negative integer — got ${i}`,
          c.UsageError
        );
      const a = o.mime ?? "text/plain", d = t.Store.newItemAt(a, s, i);
      switch (o.label != null && (d.Label = o.label), !0) {
        case o.file != null: {
          const u = await P(o.file), h = !a.startsWith("text/");
          d.writeValue(h ? new Uint8Array(u) : u.toString("utf8"));
          break;
        }
        case o.value != null: {
          d.writeValue(o.value);
          break;
        }
      }
      j(d.Info, o.info ?? null, n), e.Format === "json" ? w(e, { id: d.Id, created: !0, kind: "item" }) : f(d.Id);
    } finally {
      await p(t);
    }
  }
}
async function Te(e, o, n, t) {
  const r = await y(e);
  try {
    const s = S(o), i = r.Store.EntryWithId(s);
    if (i == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    const d = !(n.kind || n.label || n.mime || n.value || n.info || n.target || t != null) ? "all" : { ...n, InfoKey: t };
    e.Format === "json" ? w(e, Le(i, r.Store, d)) : Fe(i, r.Store, d);
  } finally {
    await p(r);
  }
}
async function xe(e, o, n, t) {
  const r = n.only?.toLowerCase();
  if (r != null && !["item", "items", "link", "links"].includes(r))
    throw new l(
      `'--only' accepts 'items' or 'links' — got '${n.only}'`,
      c.UsageError
    );
  const s = await y(e);
  try {
    const i = S(o), a = s.Store.EntryWithId(i);
    if (a == null || !a.isItem)
      throw new l(
        `container '${i}' not found or is not an item`,
        c.NotFound
      );
    const d = n.depth != null ? k(n.depth, "--depth") : 1 / 0, u = {
      showLabel: n.label,
      showMIME: n.mime,
      showValue: n.value,
      showInfo: n.info,
      InfoKey: t
    }, h = [];
    if (Y(s.Store, i, n.recursive ?? !1, d, 0, r, u, h, e), e.Format === "json")
      w(e, h);
    else
      for (const I of h)
        f(I);
  } finally {
    await p(s);
  }
}
function Y(e, o, n, t, r, s, i, a, d) {
  for (const u of e._innerEntriesOf(o)) {
    const h = u.isItem ? "item" : "link";
    if (s == null || s === h + "s" || s === h)
      if (d.Format === "json") {
        const I = { id: u.Id, kind: h };
        switch (i.showLabel && (I.label = u.Label), u.isItem && (i.showMIME && (I.mime = e._TypeOf(u.Id)), i.showValue && (I.value = e._currentValueOf(u.Id) ?? null)), !0) {
          case i.InfoKey != null: {
            I["info." + i.InfoKey] = e._InfoProxyOf(u.Id)[i.InfoKey] ?? null;
            break;
          }
          case i.showInfo: {
            I.info = { ...e._InfoProxyOf(u.Id) };
            break;
          }
        }
        a.push(I);
      } else
        a.push(ne(
          u.Id,
          i.showLabel ? u.Label : "",
          i.showMIME && u.isItem ? e._TypeOf(u.Id) : "",
          i.showValue && u.isItem ? e._currentValueOf(u.Id) : void 0,
          i.showInfo || i.InfoKey != null ? e._InfoProxyOf(u.Id) : {},
          i
        ));
    n && u.isItem && r < t && Y(e, u.Id, n, t, r + 1, s, i, a, d);
  }
}
async function $e(e, o, n, t) {
  const r = await y(e);
  try {
    const s = S(o), i = S(n), a = t != null ? k(t, "--at") : void 0;
    if (a != null && a < 0)
      throw new l(
        `'--at' must be a non-negative integer — got ${a}`,
        c.UsageError
      );
    const d = r.Store.EntryWithId(s), u = r.Store.EntryWithId(i);
    if (d == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    if (u == null || !u.isItem)
      throw new l(
        `target '${i}' not found or is not an item`,
        c.NotFound
      );
    if (!d.mayBeMovedTo(u, a))
      throw new l(
        `cannot move '${s}' into '${i}' — cycle or invalid target`,
        c.Forbidden
      );
    d.moveTo(u, a), e.Format === "json" ? w(e, { id: s, movedTo: i, at: a ?? "end" }) : f(`moved '${s}' into '${i}'`);
  } finally {
    await p(r);
  }
}
async function De(e, o) {
  const n = await y(e);
  try {
    const t = S(o), r = n.Store.EntryWithId(t);
    if (r == null)
      throw new l(`entry '${t}' not found`, c.NotFound);
    if (!r.mayBeDeleted)
      throw new l(
        `entry '${t}' cannot be deleted (system entry)`,
        c.Forbidden
      );
    r.delete(), e.Format === "json" ? w(e, { id: t, deleted: !0 }) : f(`deleted '${t}' (moved to trash)`);
  } finally {
    await p(n);
  }
}
async function _e(e, o, n, t) {
  const r = await y(e);
  try {
    const s = S(o), i = S(n ?? E), a = t != null ? k(t, "--at") : void 0;
    if (a != null && a < 0)
      throw new l(
        `'--at' must be a non-negative integer — got ${a}`,
        c.UsageError
      );
    const d = r.Store.EntryWithId(s), u = r.Store.EntryWithId(i);
    if (d == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    if (d.outerItemId !== N)
      throw new l(
        `entry '${s}' is not in the trash — use 'entry move' to relocate live entries`,
        c.Forbidden
      );
    if (u == null || !u.isItem)
      throw new l(
        `target '${i}' not found or is not an item`,
        c.NotFound
      );
    d.moveTo(u, a), e.Format === "json" ? w(e, { id: s, restoredTo: i, at: a ?? "end" }) : f(`restored '${s}' into '${i}'`);
  } finally {
    await p(r);
  }
}
async function Ne(e, o) {
  const n = await y(e);
  try {
    const t = S(o), r = n.Store.EntryWithId(t);
    if (r == null)
      throw new l(`entry '${t}' not found`, c.NotFound);
    if (r.outerItemId !== N)
      throw new l(
        `entry '${t}' is not in the trash — delete it first`,
        c.Forbidden
      );
    r.purge(), e.Format === "json" ? w(e, { id: t, purged: !0 }) : f(`purged '${t}'`);
  } finally {
    await p(n);
  }
}
async function Ue(e, o, n, t) {
  const r = await y(e);
  try {
    const s = S(o), i = r.Store.EntryWithId(s);
    if (i == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    if (i.isLink) {
      if (n.mime != null)
        throw new l(
          "'--mime' is not supported for links — only items have a MIME type",
          c.UsageError
        );
      if (n.value != null)
        throw new l(
          "'--value' is not supported for links — only items have a value",
          c.UsageError
        );
      if (n.file != null)
        throw new l(
          "'--file' is not supported for links — only items have a value",
          c.UsageError
        );
    }
    if (n.label != null && (i.Label = n.label), i.isItem) {
      if (n.value != null && n.file != null)
        throw new l(
          "'--value' and '--file' are mutually exclusive — specify at most one",
          c.UsageError
        );
      const a = i;
      switch (n.mime != null && (a.Type = n.mime), !0) {
        case n.file != null: {
          const d = await P(n.file), u = !a.Type.startsWith("text/");
          a.writeValue(u ? new Uint8Array(d) : d.toString("utf8"));
          break;
        }
        case n.value != null: {
          a.writeValue(n.value);
          break;
        }
      }
    }
    j(
      r.Store._InfoProxyOf(s),
      n.info ?? null,
      t
    ), e.Format === "json" ? w(e, { id: s, updated: !0 }) : f(`updated '${s}'`);
  } finally {
    await p(r);
  }
}
function Le(e, o, n) {
  const t = n === "all", r = { id: e.Id };
  if ((t || n.kind) && (r.kind = e.isItem ? "item" : "link"), (t || n.label) && (r.label = e.Label), e.isItem) {
    const i = e;
    (t || n.mime) && (r.mime = i.Type), (t || n.value) && (r.value = o._currentValueOf(e.Id) ?? null);
  }
  if (e.isLink) {
    const i = o._TargetOf(e.Id).Id;
    (t || n.target) && (r.target = i);
  }
  const s = n.InfoKey;
  switch (!0) {
    case s != null: {
      r["info." + s] = o._InfoProxyOf(e.Id)[s] ?? null;
      break;
    }
    case (t || n.info): {
      r.info = { ...o._InfoProxyOf(e.Id) };
      break;
    }
  }
  return r;
}
function Fe(e, o, n) {
  const t = n === "all";
  if (f(`id:    ${e.Id}`), (t || n.kind) && f(`kind:  ${e.isItem ? "item" : "link"}`), (t || n.label) && f(`label: ${e.Label}`), e.isItem) {
    const s = e;
    if ((t || n.mime) && f(`mime:  ${s.Type}`), t || n.value) {
      const i = o._currentValueOf(e.Id);
      f(`value: ${i != null ? String(i) : "(none)"}`);
    }
  }
  if (e.isLink) {
    const s = o._TargetOf(e.Id).Id;
    (t || n.target) && f(`target: ${s}`);
  }
  const r = n.InfoKey;
  switch (!0) {
    case r != null: {
      const s = o._InfoProxyOf(e.Id)[r];
      f(`info.${r}: ${JSON.stringify(s ?? null)}`);
      break;
    }
    case (t || n.info): {
      const s = o._InfoProxyOf(e.Id);
      f(`info:  ${JSON.stringify(s)}`);
      break;
    }
  }
}
const Re = 720 * 60 * 60 * 1e3;
function je(e) {
  const o = e.command("trash").description("trash inspection and cleanup");
  o.command("list").description("list all entries currently in the trash").option("--only <kind>", "filter by kind: items | links").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await We(r, n.only);
  }), o.command("purge-all").description("permanently delete every entry in the trash").action(async (n, t) => {
    const r = m(t.optsWithGlobals());
    await Ce(r);
  }), o.command("purge-expired").description("permanently delete trash entries older than --ttl milliseconds").option("--ttl <ms>", "TTL in milliseconds (default: 30 days)", String(Re)).action(async (n, t) => {
    const r = m(t.optsWithGlobals()), s = k(n.ttl, "--ttl");
    if (s <= 0)
      throw new l(
        `'--ttl' must be a positive integer — got ${s}`,
        c.UsageError
      );
    await Pe(r, s);
  });
}
async function We(e, o) {
  const n = o?.toLowerCase();
  if (n != null && !["item", "items", "link", "links"].includes(n))
    throw new l(
      `'--only' accepts 'items' or 'links' — got '${o}'`,
      c.UsageError
    );
  const t = await y(e);
  try {
    const r = t.Store.TrashItem, i = t.Store._innerEntriesOf(r.Id).filter((a) => {
      if (n == null)
        return !0;
      const d = a.isItem ? "item" : "link";
      return n === d + "s" || n === d;
    });
    if (e.Format === "json")
      w(e, i.map((a) => ({
        id: a.Id,
        kind: a.isItem ? "item" : "link",
        label: a.Label
      })));
    else if (i.length === 0)
      f("(trash is empty)");
    else
      for (const a of i) {
        const d = a.isItem ? "item" : "link";
        f(`${a.Id}  ${d}  ${a.Label}`);
      }
  } finally {
    await p(t);
  }
}
async function Ce(e) {
  const o = await y(e);
  try {
    const n = o.Store.TrashItem, t = [...o.Store._innerEntriesOf(n.Id)];
    let r = 0;
    for (const s of t)
      try {
        s.purge(), r++;
      } catch {
      }
    e.Format === "json" ? w(e, { purged: r }) : f(`purged ${r} entr${r === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(o);
  }
}
async function Pe(e, o) {
  const n = await y(e);
  try {
    const t = n.Store.purgeExpiredTrashEntries(o);
    e.Format === "json" ? w(e, { purged: t, ttlMs: o }) : f(`purged ${t} expired entr${t === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(n);
  }
}
function Ae(e) {
  e.command("tree").description("tree display").command("show").description("display the store tree").option("--depth <n>", "maximum display depth (default: unlimited)").action(async (n, t) => {
    const r = m(t.optsWithGlobals()), s = n.depth != null ? k(n.depth, "--depth") : 1 / 0;
    await Ge(r, s);
  });
}
async function Ge(e, o) {
  const n = await y(e);
  try {
    if (e.Format === "json") {
      const t = W(n.Store, E, o, 0);
      w(e, { root: t });
    } else {
      f("root/");
      const t = W(n.Store, E, o, 0);
      for (let r = 0; r < t.length; r++) {
        const s = t[r], i = r === t.length - 1, a = q(
          s.Id,
          s.Label,
          s.Kind,
          s.TargetId,
          s.Children,
          "",
          i
        );
        for (const d of a)
          f(d);
      }
      t.length === 0 && f("  (empty)");
    }
  } finally {
    await p(n);
  }
}
function W(e, o, n, t) {
  return t >= n ? [] : e._innerEntriesOf(o).map((r) => {
    const s = r.isItem ? "item" : "link", i = r.isLink ? e._TargetOf(r.Id).Id : void 0, a = r.isItem && t + 1 < n ? W(e, r.Id, n, t + 1) : [];
    return { Id: r.Id, Kind: s, Label: r.Label, TargetId: i, Children: a };
  });
}
function Z(e, o = !1) {
  const n = new Q("sds");
  return n.description("shareable-data-store CLI").version(de.version, "--version", "print version").allowUnknownOption(!1).configureOutput({ writeErr: () => {
  } }).option("--server <url>", "WebSocket server URL (env: SDS_SERVER_URL)").option("--store <id>", "store identifier (env: SDS_STORE_ID)").option("--token <jwt>", "client JWT — read/write (env: SDS_TOKEN)").option("--admin-token <jwt>", "admin JWT (env: SDS_ADMIN_TOKEN)").option("--data-dir <path>", "directory for local SQLite files (env: SDS_DATA_DIR)").option("--format <fmt>", "output format: text | json (default: text)").option("--on-error <action>", "error mode: stop | continue | ask (default: stop)"), ue(n), he(n), ve(n, e), je(n), Ae(n), o || (n.command("shell").description("start an interactive REPL").action(async (t, r) => {
    const s = m(r.optsWithGlobals());
    await ie((i) => J(i, s));
  }), n.option("--script <file>", "run commands from file (use - for stdin)").action(async (t) => {
    const r = m(t);
    if (t.script != null) {
      const s = await ae(r, t.script, J);
      process.exit(s);
    } else
      process.stdout.write(n.helpInformation()), process.exit(c.OK);
  }), n.addHelpCommand(!0)), n;
}
function A(e) {
  e.exitOverride(), e.configureOutput({ writeErr: () => {
  } });
  for (const o of e.commands)
    A(o);
}
function Ke(e) {
  const o = [];
  return e.ServerURL != null && o.push("--server", e.ServerURL), e.StoreId != null && o.push("--store", e.StoreId), e.Token != null && o.push("--token", e.Token), e.AdminToken != null && o.push("--admin-token", e.AdminToken), o.push("--data-dir", e.DataDir), e.Format !== "text" && o.push("--format", e.Format), o;
}
async function J(e, o) {
  if (e.length === 0)
    return c.OK;
  const { CleanArgv: n, InfoEntries: t } = $(e), r = o != null ? Ke(o) : [], s = Z(
    Object.entries(t).flatMap(([i, a]) => [
      `--info.${i}`,
      JSON.stringify(a)
    ]),
    !0
    // isSubContext: skip shell + root action so process.exit() can never fire
  );
  A(s);
  try {
    return await s.parseAsync(["node", "sds", ...r, ...n]), c.OK;
  } catch (i) {
    const a = i;
    return a.code === "commander.help" || a.code === "commander.helpDisplayed" || a.code === "commander.version" ? c.OK : a.code === "commander.unknownCommand" ? (process.stderr.write(`sds: unknown command '${n[0]}' — try 'sds help'
`), c.UsageError) : a.code === "commander.unknownOption" || a.code === "commander.missingArgument" || a.code === "commander.missingMandatoryOptionValue" ? (process.stderr.write(`sds: ${a.message}
`), c.UsageError) : i instanceof U ? (process.stderr.write(`sds: ${i.message}
`), i.ExitCode) : i instanceof l ? (L(o ?? { Format: "text" }, i.message, i.ExitCode), i.ExitCode) : (L(o ?? { Format: "text" }, i.message ?? String(i)), c.GeneralError);
  }
}
async function Je() {
  const { CleanArgv: e, InfoEntries: o } = $(process.argv.slice(2)), n = Object.entries(o).flatMap(([r, s]) => [
    `--info.${r}`,
    JSON.stringify(s)
  ]), t = Z(n);
  A(t);
  try {
    await t.parseAsync(["node", "sds", ...e]);
  } catch (r) {
    const s = r;
    if ((s.code === "commander.help" || s.code === "commander.helpDisplayed" || s.code === "commander.version") && process.exit(c.OK), (s.code === "commander.unknownCommand" || s.code === "commander.unknownOption" || s.code === "commander.missingArgument" || s.code === "commander.missingMandatoryOptionValue") && (process.stderr.write(`sds: ${s.message}

`), process.stderr.write(t.helpInformation()), process.exit(c.UsageError)), r instanceof U && (process.stderr.write(`sds: ${r.message}
`), process.exit(r.ExitCode)), r instanceof l) {
      const a = m({});
      L(a, r.message, r.ExitCode), process.exit(r.ExitCode);
    }
    const i = m({});
    L(i, r.message ?? String(r)), process.exit(c.GeneralError);
  }
}
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-command.js") || process.argv[1].endsWith("/sds")) && Je().catch((e) => {
  process.stderr.write(`sds: fatal: ${e.message ?? e}
`), process.exit(c.GeneralError);
});
