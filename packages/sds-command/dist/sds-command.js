#!/usr/bin/env -S node --no-warnings
import { Command as z } from "commander";
import Y from "node:os";
import U from "node:path";
import b from "node:fs/promises";
import { SDS_DataStore as _ } from "@rozek/sds-core-jj";
import { SDS_DesktopPersistenceProvider as A } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as G } from "@rozek/sds-sync-engine";
import { SDS_WebSocketProvider as H } from "@rozek/sds-network-websocket";
import { TrashId as D, RootId as g, LostAndFoundId as Z } from "@rozek/sds-core";
import C from "node:readline";
function m(e) {
  const r = e.server ?? process.env.SDS_SERVER_URL, t = e.dataDir ?? process.env.SDS_DATA_DIR ?? U.join(Y.homedir(), ".sds"), n = e.store ?? process.env.SDS_STORE_ID, o = e.token ?? process.env.SDS_TOKEN, i = e.adminToken ?? process.env.SDS_ADMIN_TOKEN, a = (e.format ?? "text").toLowerCase() === "json" ? "json" : "text", c = (e.onError ?? "stop").toLowerCase();
  return { ServerURL: r, DataDir: t, StoreId: n, Token: o, AdminToken: i, Format: a, OnError: c === "continue" ? "continue" : c === "ask" ? "ask" : "stop" };
}
function x(e, r) {
  const t = r.replace(/[^a-zA-Z0-9_-]/g, "_");
  return U.join(e.DataDir, `${t}.db`);
}
function f(e = "") {
  process.stdout.write(e + `
`);
}
function Q(e) {
  process.stdout.write(JSON.stringify(e, null, 2) + `
`);
}
function N(e, r, t) {
  e.Format === "json" ? process.stderr.write(
    JSON.stringify({ error: r, exitCode: t ?? 1 }) + `
`
  ) : process.stderr.write(`sds: error: ${r}
`);
}
function w(e, r) {
  if (e.Format === "json") {
    Q(r);
    return;
  }
  switch (!0) {
    case r == null:
      break;
    case typeof r == "string":
      f(r);
      break;
    case Array.isArray(r):
      for (const t of r)
        f(String(t));
      break;
    default:
      f(JSON.stringify(r));
  }
}
function X(e, r, t, n, o, i) {
  const s = [e];
  switch (i.showLabel && s.push(r !== "" ? r : "(no label)"), i.showMIME && s.push(t), i.showValue && s.push(n != null ? String(n) : "(no value)"), !0) {
    case i.InfoKey != null:
      s.push(JSON.stringify(o[i.InfoKey] ?? null));
      break;
    case i.showInfo:
      s.push(JSON.stringify(o));
      break;
  }
  return s.join("  ");
}
function J(e, r, t, n, o, i, s) {
  const a = s ? "└── " : "├── ", c = t === "link" ? ` → ${n ?? "?"}` : "", d = r !== "" ? `  ${r}` : "", y = `${i}${a}${e}${d}${c}`, S = i + (s ? "    " : "│   "), E = [y];
  for (let T = 0; T < o.length; T++) {
    const v = o[T], L = T === o.length - 1;
    E.push(
      ...J(
        v.Id,
        v.Label,
        v.Kind,
        v.TargetId,
        v.Children,
        S,
        L
      )
    );
  }
  return E;
}
const l = {
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
class u extends Error {
  ExitCode;
  constructor(r, t = l.GeneralError) {
    super(r), this.name = "SDS_CommandError", this.ExitCode = t;
  }
}
async function h(e, r = !1) {
  const t = e.StoreId;
  if (t == null)
    throw new u(
      "no store ID — set SDS_STORE_ID or use --store",
      l.UsageError
    );
  await b.mkdir(e.DataDir, { recursive: !0 });
  const n = x(e, t), o = new A(n, t);
  let i;
  try {
    const a = await o.loadSnapshot();
    switch (!0) {
      case a != null: {
        i = _.fromBinary(a);
        break;
      }
      case r: {
        i = _.fromScratch();
        break;
      }
      default:
        throw await o.close(), new u(
          `store '${t}' not found in '${e.DataDir}'`,
          l.NotFound
        );
    }
  } catch (a) {
    throw a instanceof u ? a : (await o.close().catch(() => {
    }), new u(
      `failed to open store '${t}': ${a.message}`,
      l.GeneralError
    ));
  }
  const s = new G(i, { PersistenceProvider: o });
  return await s.start(), { Store: i, Persistence: o, Engine: s };
}
async function p(e) {
  await e.Engine.stop();
}
async function V(e, r = 5e3) {
  const t = e.StoreId, n = e.ServerURL, o = e.Token;
  if (t == null)
    throw new u(
      "no store ID — set SDS_STORE_ID or use --store",
      l.UsageError
    );
  if (n == null)
    throw new u(
      "no server URL — set SDS_SERVER_URL or use --server",
      l.UsageError
    );
  if (o == null)
    throw new u(
      "no client token — set SDS_TOKEN or use --token",
      l.UsageError
    );
  await b.mkdir(e.DataDir, { recursive: !0 });
  const i = x(e, t), s = new A(i, t), a = await s.loadSnapshot(), c = a != null ? _.fromBinary(a) : _.fromScratch(), d = new H(t), y = new G(c, {
    PersistenceProvider: s,
    NetworkProvider: d
  });
  await y.start();
  let S = !1, E;
  const T = new Promise(($) => {
    E = $;
  }), v = y.onConnectionChange(($) => {
    $ === "connected" && (S = !0, setTimeout(E, r)), $ === "disconnected" && E();
  }), L = setTimeout(() => {
    E();
  }, r * 2);
  try {
    await y.connectTo(n, { Token: o }), await T;
  } catch ($) {
    throw new u(
      `sync failed: ${$.message}`,
      l.NetworkError
    );
  } finally {
    clearTimeout(L), v(), await y.stop();
  }
  return { Connected: S, StoreId: t, ServerURL: n };
}
async function ee(e) {
  const r = e.StoreId;
  if (r == null)
    return !1;
  const t = x(e, r);
  try {
    return await b.access(t), !0;
  } catch {
    return !1;
  }
}
async function te(e) {
  const r = e.StoreId;
  if (r == null)
    throw new u(
      "no store ID — set SDS_STORE_ID or use --store",
      l.UsageError
    );
  const t = x(e, r);
  try {
    await b.unlink(t), await b.unlink(t + "-wal").catch(() => {
    }), await b.unlink(t + "-shm").catch(() => {
    });
  } catch (n) {
    const o = n;
    throw o.code === "ENOENT" ? new u(
      `store '${r}' not found in '${e.DataDir}'`,
      l.NotFound
    ) : new u(
      `failed to delete store '${r}': ${o.message}`,
      l.GeneralError
    );
  }
}
function I(e) {
  switch (e.toLowerCase()) {
    case "root":
      return g;
    case "trash":
      return D;
    default:
      return e;
  }
}
const ne = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function F(e) {
  if (!ne.test(e))
    throw new u(
      `invalid info key ${JSON.stringify(e)} — keys must be valid JavaScript identifiers`,
      l.UsageError
    );
}
function k(e) {
  const r = [], t = {};
  let n = 0;
  for (; n < e.length; ) {
    const o = e[n];
    if (o.startsWith("--info.") && o.includes("=")) {
      const i = o.indexOf("="), s = o.slice(7, i), a = o.slice(i + 1);
      F(s), t[s] = R(a), n++;
      continue;
    }
    if (o.startsWith("--info.") && !o.includes("=")) {
      const i = o.slice(7);
      F(i);
      const s = e[n + 1];
      if (s != null && !s.startsWith("--")) {
        t[i] = R(s), n += 2;
        continue;
      }
      t[i] = !0, n++;
      continue;
    }
    r.push(o), n++;
  }
  return { CleanArgv: r, InfoEntries: t };
}
function R(e) {
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}
function M(e, r, t) {
  if (r != null) {
    let n;
    if (typeof r == "string")
      try {
        n = JSON.parse(r);
      } catch {
        throw new u(
          `--info value is not valid JSON: ${r}`,
          l.UsageError
        );
      }
    else
      n = r;
    if (typeof n != "object" || n === null || Array.isArray(n))
      throw new u(
        "--info value must be a JSON object",
        l.UsageError
      );
    for (const [o, i] of Object.entries(n))
      F(o), e[o] = i;
  }
  for (const [n, o] of Object.entries(t))
    e[n] = o;
}
function K(e) {
  const r = [];
  let t = "", n = 0;
  for (; n < e.length; ) {
    const o = e[n];
    switch (!0) {
      // skip leading and inter-token whitespace
      case (o === " " || o === "	"): {
        t.length > 0 && (r.push(t), t = ""), n++;
        break;
      }
      // single-quoted string — no escapes inside
      case o === "'": {
        for (n++; n < e.length && e[n] !== "'"; )
          t += e[n], n++;
        n++;
        break;
      }
      // double-quoted string — supports \" and \\ inside
      case o === '"': {
        for (n++; n < e.length && e[n] !== '"'; )
          if (e[n] === "\\" && n + 1 < e.length) {
            const i = e[n + 1];
            t += i === '"' || i === "\\" ? i : "\\" + i, n += 2;
          } else
            t += e[n], n++;
        n++;
        break;
      }
      // inline comment — everything from # to end of line is dropped
      case (o === "#" && t.length === 0): {
        n = e.length;
        break;
      }
      default:
        o === "\\" && n + 1 < e.length ? (t += e[n + 1], n += 2) : (t += o, n++);
    }
  }
  return t.length > 0 && r.push(t), r;
}
async function oe(e) {
  const r = process.stdin.isTTY, t = C.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: r,
    prompt: "sds> "
  });
  r && (process.stdout.write(
    `SDS interactive shell — type "help" for commands, "exit" to quit
`
  ), t.prompt());
  for await (const n of t) {
    const o = n.trim();
    if (o === "" || o.startsWith("#")) {
      r && t.prompt();
      continue;
    }
    if (o === "exit" || o === "quit")
      break;
    const i = K(o);
    if (i.length === 0) {
      r && t.prompt();
      continue;
    }
    try {
      await e(i);
    } catch (s) {
      process.stderr.write(`sds: ${s.message}
`);
    }
    r && t.prompt();
  }
  t.close();
}
async function re(e, r, t) {
  let n;
  if (r === "-")
    n = process.stdin;
  else
    try {
      n = (await b.open(r)).createReadStream();
    } catch {
      throw new u(
        `cannot open script file '${r}'`,
        l.NotFound
      );
    }
  const o = C.createInterface({
    input: n,
    terminal: !1
  });
  let i = 0;
  for await (const s of o) {
    const a = s.trim();
    if (a === "" || a.startsWith("#"))
      continue;
    const c = K(a);
    if (c.length === 0)
      continue;
    let d = 0;
    try {
      d = await t(c, e);
    } catch (y) {
      d = 1, process.stderr.write(`sds: ${y.message}
`);
    }
    if (d !== 0)
      switch (i = d, e.OnError) {
        case "stop":
          return o.close(), d;
        case "continue":
          break;
        // keep executing
        case "ask": {
          if (!await ie())
            return o.close(), d;
          break;
        }
      }
  }
  return o.close(), i;
}
async function ie() {
  return process.stdin.isTTY ? new Promise((r) => {
    const t = C.createInterface({ input: process.stdin, output: process.stdout });
    t.question("error — continue? [y/N] ", (n) => {
      t.close(), r(n.trim().toLowerCase() === "y");
    });
  }) : !1;
}
const se = "0.0.5", ae = {
  version: se
};
function ce(e) {
  e.command("token").description("manage authentication tokens (requires admin token)").command("issue").description("request a new JWT from the server").requiredOption("--sub <subject>", "user identifier (e.g. email address)").requiredOption("--scope <scope>", "token scope: read | write | admin").option("--exp <duration>", "expiry duration, e.g. 24h or 7d", "24h").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await ue(o, t);
  });
}
const le = /* @__PURE__ */ new Set(["read", "write", "admin"]), de = /^(\d+)(s|m|h|d)$/;
async function ue(e, r) {
  const { ServerURL: t, AdminToken: n } = e;
  if (n == null)
    throw new u(
      "no admin token — set SDS_ADMIN_TOKEN or use --admin-token",
      l.Unauthorized
    );
  if (t == null)
    throw new u(
      "no server URL — set SDS_SERVER_URL or use --server",
      l.UsageError
    );
  if (!le.has(r.scope))
    throw new u(
      `invalid scope '${r.scope}' — must be read, write, or admin`,
      l.UsageError
    );
  if (!de.test(r.exp))
    throw new u(
      `invalid expiry '${r.exp}' — use a number followed by s, m, h, or d`,
      l.UsageError
    );
  const o = t.replace(/\/+$/, "") + "/api/token";
  let i;
  try {
    i = await fetch(o, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${n}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sub: r.sub, scope: r.scope, exp: r.exp })
    });
  } catch (c) {
    throw new u(
      `HTTP request to '${o}' failed: ${c.message}`,
      l.NetworkError
    );
  }
  const s = await i.json().catch(() => ({}));
  switch (!0) {
    case i.status === 401:
      throw new u(
        `token rejected by server: ${s.error ?? "unauthorized"}`,
        l.Unauthorized
      );
    case i.status === 403:
      throw new u(
        `admin scope required: ${s.error ?? "forbidden"}`,
        l.Forbidden
      );
    case !i.ok:
      throw new u(
        `server returned ${i.status}: ${s.error ?? "unknown error"}`,
        l.GeneralError
      );
  }
  const a = s.token;
  if (a == null)
    throw new u(
      "server response did not contain a token",
      l.GeneralError
    );
  e.Format === "json" ? w(e, { token: a, sub: r.sub, scope: r.scope, exp: r.exp }) : w(e, a);
}
function fe(e) {
  const r = e.command("store").description("store lifecycle operations");
  r.command("info").description("show local store metadata (existence, entry count, DB path)").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await me(o);
  }), r.command("ping").description("check connectivity to the WebSocket server").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await we(o);
  }), r.command("sync").description("connect to server, exchange CRDT patches, and disconnect").option("--timeout <ms>", "milliseconds to wait after connecting", "5000").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await ye(o, parseInt(t.timeout, 10));
  }), r.command("destroy").description("permanently delete the local store database").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await he(o);
  }), r.command("export").description("export the current store snapshot").option("--encoding <enc>", "serialisation encoding: json | binary", "json").option("--output <file>", "destination file (default: stdout)").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await pe(o, t.encoding, t.output);
  }), r.command("import").description("CRDT-merge a snapshot file into the local store").requiredOption("--input <file>", "source file to import").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await Ie(o, t.input);
  });
}
async function me(e) {
  const r = e.StoreId;
  if (r == null)
    throw new u(
      "no store ID — set SDS_STORE_ID or use --store",
      l.UsageError
    );
  if (!await ee(e)) {
    e.Format === "json" ? w(e, { storeId: r, exists: !1 }) : f(`store '${r}': not found in '${e.DataDir}'`);
    return;
  }
  const n = await h(e);
  try {
    const o = Se(n.Store);
    e.Format === "json" ? w(e, {
      storeId: r,
      exists: !0,
      entryCount: o,
      dbPath: x(e, r)
    }) : (f(`store:       ${r}`), f(`entries:     ${o}`), f(`db path:     ${x(e, r)}`));
  } finally {
    await p(n);
  }
}
async function we(e) {
  const r = e.ServerURL, t = e.Token;
  if (r == null)
    throw new u(
      "no server URL — set SDS_SERVER_URL or use --server",
      l.UsageError
    );
  if (t == null)
    throw new u(
      "no client token — set SDS_TOKEN or use --token",
      l.UsageError
    );
  try {
    const n = await V(e, 1e3);
    e.Format === "json" ? w(e, { server: n.ServerURL, storeId: n.StoreId, reachable: !0 }) : f(`server '${n.ServerURL}': reachable`);
  } catch (n) {
    if (n instanceof u && n.ExitCode === l.NetworkError)
      e.Format === "json" ? w(e, { server: r, reachable: !1, error: n.message }) : f(`server '${r}': unreachable — ${n.message}`);
    else
      throw n;
  }
}
async function ye(e, r) {
  const t = await V(e, isNaN(r) ? 5e3 : r);
  if (e.Format === "json")
    w(e, {
      storeId: t.StoreId,
      server: t.ServerURL,
      connected: t.Connected,
      synced: t.Connected
    });
  else {
    const n = t.Connected ? "synced" : "could not connect";
    f(`store '${t.StoreId}': ${n}`);
  }
}
async function he(e) {
  await te(e), e.Format === "json" ? w(e, { storeId: e.StoreId, destroyed: !0 }) : f(`store '${e.StoreId}': deleted`);
}
async function pe(e, r, t) {
  const n = await h(e);
  try {
    const o = r.toLowerCase() === "binary", i = o ? n.Store.asBinary() : JSON.stringify(n.Store.asJSON(), null, 2);
    t != null ? (await b.writeFile(t, o ? i : i + `
`), e.Format === "json" ? w(e, { exported: !0, file: t, format: r }) : f(`exported to '${t}'`)) : o ? process.stdout.write(i) : process.stdout.write(i + `
`);
  } finally {
    await p(n);
  }
}
async function Ie(e, r) {
  let t;
  try {
    t = await b.readFile(r);
  } catch (s) {
    throw new u(
      `cannot read '${r}': ${s.message}`,
      l.NotFound
    );
  }
  const n = t.toString("utf8").trimStart(), o = n.startsWith("{") || n.startsWith("["), i = await h(e, !0);
  try {
    if (o)
      W(i.Store, JSON.parse(n));
    else {
      const s = _.fromBinary(new Uint8Array(t));
      try {
        W(i.Store, s.asJSON());
      } finally {
        s.dispose();
      }
    }
    e.Format === "json" ? w(e, { imported: !0, file: r }) : f(`imported '${r}'`);
  } finally {
    await p(i);
  }
}
function W(e, r) {
  const t = r, n = /* @__PURE__ */ new Set([g, D, Z]), o = t.innerEntries;
  if (o != null)
    for (const i of o)
      n.has(i.Id) || e.newEntryFromJSONat(i, e.RootItem);
}
function Se(e) {
  const r = /* @__PURE__ */ new Set([g, D]);
  let t = 0;
  function n(o) {
    for (const i of e._innerEntriesOf(o))
      r.has(i.Id) || t++, i.isItem && n(i.Id);
  }
  return n(g), t;
}
function be(e, r) {
  const t = e.command("entry").description("operations shared by items and links");
  t.command("get <id>").description("display all or selected fields of an entry").option("--label", "include label").option("--mime", "include MIME type (items only)").option("--value", "include value (items only)").option("--info", "include full info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").option("--target", "include link target ID (links only)").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals()), { InfoEntries: a } = k(r), c = Object.keys(a)[0];
    await ge(s, n, o, c);
  }), t.command("move <id>").description("move an entry to a different container").requiredOption("--to <targetId>", "destination container item ID").option("--at <index>", "insertion index (default: append)").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals());
    await ke(s, n, o.to, o.at);
  }), t.command("delete <id>").description("soft-delete: move entry to the trash").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals());
    await Ee(s, n);
  }), t.command("restore <id>").description("restore a trashed entry (moves to root or --to target)").option("--to <targetId>", "destination container item ID (default: root)").option("--at <index>", "insertion index (default: append)").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals());
    await ve(s, n, o.to, o.at);
  }), t.command("purge <id>").description("permanently delete an entry (must be in the trash)").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals());
    await Te(s, n);
  });
}
async function ge(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = o.Store.EntryWithId(i);
    if (s == null)
      throw new u(`entry '${i}' not found`, l.NotFound);
    const c = !(t.label || t.mime || t.value || t.info || t.target || n != null) ? "all" : { ...t, InfoKey: n };
    e.Format === "json" ? w(e, $e(s, o.Store, c)) : xe(s, o.Store, c);
  } finally {
    await p(o);
  }
}
async function ke(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = I(t), a = n != null ? parseInt(n, 10) : void 0, c = o.Store.EntryWithId(i), d = o.Store.EntryWithId(s);
    if (c == null)
      throw new u(`entry '${i}' not found`, l.NotFound);
    if (d == null || !d.isItem)
      throw new u(
        `target '${s}' not found or is not an item`,
        l.NotFound
      );
    if (!c.mayBeMovedTo(d, a))
      throw new u(
        `cannot move '${i}' into '${s}' — cycle or invalid target`,
        l.Forbidden
      );
    c.moveTo(d, a), e.Format === "json" ? w(e, { id: i, movedTo: s, at: a ?? "end" }) : f(`moved '${i}' into '${s}'`);
  } finally {
    await p(o);
  }
}
async function Ee(e, r) {
  const t = await h(e);
  try {
    const n = I(r), o = t.Store.EntryWithId(n);
    if (o == null)
      throw new u(`entry '${n}' not found`, l.NotFound);
    if (!o.mayBeDeleted)
      throw new u(
        `entry '${n}' cannot be deleted (system entry)`,
        l.Forbidden
      );
    o.delete(), e.Format === "json" ? w(e, { id: n, deleted: !0 }) : f(`deleted '${n}' (moved to trash)`);
  } finally {
    await p(t);
  }
}
async function ve(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = I(t ?? g), a = n != null ? parseInt(n, 10) : void 0, c = o.Store.EntryWithId(i), d = o.Store.EntryWithId(s);
    if (c == null)
      throw new u(`entry '${i}' not found`, l.NotFound);
    if (c.outerItemId !== D)
      throw new u(
        `entry '${i}' is not in the trash — use 'entry move' to relocate live entries`,
        l.Forbidden
      );
    if (d == null || !d.isItem)
      throw new u(
        `target '${s}' not found or is not an item`,
        l.NotFound
      );
    c.moveTo(d, a), e.Format === "json" ? w(e, { id: i, restoredTo: s, at: a ?? "end" }) : f(`restored '${i}' into '${s}'`);
  } finally {
    await p(o);
  }
}
async function Te(e, r) {
  const t = await h(e);
  try {
    const n = I(r), o = t.Store.EntryWithId(n);
    if (o == null)
      throw new u(`entry '${n}' not found`, l.NotFound);
    if (o.outerItemId !== D)
      throw new u(
        `entry '${n}' is not in the trash — delete it first`,
        l.Forbidden
      );
    o.purge(), e.Format === "json" ? w(e, { id: n, purged: !0 }) : f(`purged '${n}'`);
  } finally {
    await p(t);
  }
}
function $e(e, r, t) {
  const n = t === "all", o = { id: e.Id, kind: e.isItem ? "item" : "link" };
  if ((n || t.label) && (o.label = e.Label), e.isItem) {
    const s = e;
    (n || t.mime) && (o.mime = s.Type), (n || t.value) && (o.value = r._currentValueOf(e.Id) ?? null);
  }
  if (e.isLink) {
    const s = r._TargetOf(e.Id).Id;
    (n || t.target) && (o.target = s);
  }
  const i = t.InfoKey;
  switch (!0) {
    case i != null: {
      o["info." + i] = r._InfoProxyOf(e.Id)[i] ?? null;
      break;
    }
    case (n || t.info): {
      o.info = { ...r._InfoProxyOf(e.Id) };
      break;
    }
  }
  return o;
}
function xe(e, r, t) {
  const n = t === "all";
  if (f(`id:    ${e.Id}`), f(`kind:  ${e.isItem ? "item" : "link"}`), (n || t.label) && f(`label: ${e.Label}`), e.isItem) {
    const i = e;
    if ((n || t.mime) && f(`mime:  ${i.Type}`), n || t.value) {
      const s = r._currentValueOf(e.Id);
      f(`value: ${s != null ? String(s) : "(none)"}`);
    }
  }
  if (e.isLink) {
    const i = r._TargetOf(e.Id).Id;
    (n || t.target) && f(`target: ${i}`);
  }
  const o = t.InfoKey;
  switch (!0) {
    case o != null: {
      const i = r._InfoProxyOf(e.Id)[o];
      f(`info.${o}: ${JSON.stringify(i ?? null)}`);
      break;
    }
    case (n || t.info): {
      const i = r._InfoProxyOf(e.Id);
      f(`info:  ${JSON.stringify(i)}`);
      break;
    }
  }
}
function _e(e, r) {
  const t = e.command("item").description("item-specific operations");
  t.command("list <id>").description("list entries in a container item (only IDs by default)").option("--recursive", "traverse inner containers recursively").option("--depth <n>", "maximum recursion depth").option("--only <kind>", "filter by kind: items | links").option("--label", "include label").option("--mime", "include MIME type").option("--value", "include value").option("--info", "include info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals()), { InfoEntries: a } = k(r), c = Object.keys(a)[0];
    await De(s, n, o, c);
  }), t.command("get <id>").description("display item details").option("--label", "include label").option("--mime", "include MIME type").option("--value", "include value").option("--info", "include info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals()), { InfoEntries: a } = k(r), c = Object.keys(a)[0];
    await Ne(s, n, o, c);
  }), t.command("create").description("create a new item").option("--label <label>", "item label").option("--mime <type>", "MIME type (default: text/plain)").option("--container <itemId>", "container item (default: root)").option("--at <index>", "insertion index (default: append)").option("--value <string>", "initial text value").option("--file <path>", "read initial value from file").option("--info <json>", "info map as JSON object").action(async (n, o) => {
    const i = m(o.optsWithGlobals()), { InfoEntries: s } = k(r);
    await Le(i, n, s);
  }), t.command("update <id>").description("update item properties").option("--label <label>", "new label").option("--mime <type>", "new MIME type").option("--value <string>", "new text value").option("--file <path>", "read new value from file").option("--info <json>", "merge info map from JSON object").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals()), { InfoEntries: a } = k(r);
    await Fe(s, n, o, a);
  });
}
async function De(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = o.Store.EntryWithId(i);
    if (s == null || !s.isItem)
      throw new u(
        `item '${i}' not found`,
        l.NotFound
      );
    const a = t.depth != null ? parseInt(t.depth, 10) : 1 / 0, c = t.only?.toLowerCase(), d = {
      showLabel: t.label,
      showMIME: t.mime,
      showValue: t.value,
      showInfo: t.info,
      InfoKey: n
    }, y = [];
    if (B(o.Store, i, t.recursive ?? !1, a, 0, c, d, y, e), e.Format === "json")
      w(e, y);
    else
      for (const S of y)
        f(S);
  } finally {
    await p(o);
  }
}
function B(e, r, t, n, o, i, s, a, c) {
  for (const d of e._innerEntriesOf(r)) {
    const y = d.isItem ? "item" : "link";
    if (i == null || i === y + "s" || i === y)
      if (c.Format === "json") {
        const S = { id: d.Id, kind: y };
        switch (s.showLabel && (S.label = d.Label), d.isItem && (s.showMIME && (S.mime = e._TypeOf(d.Id)), s.showValue && (S.value = e._currentValueOf(d.Id) ?? null)), !0) {
          case s.InfoKey != null: {
            S["info." + s.InfoKey] = e._InfoProxyOf(d.Id)[s.InfoKey] ?? null;
            break;
          }
          case s.showInfo: {
            S.info = { ...e._InfoProxyOf(d.Id) };
            break;
          }
        }
        a.push(S);
      } else
        a.push(X(
          d.Id,
          s.showLabel ? d.Label : "",
          s.showMIME && d.isItem ? e._TypeOf(d.Id) : "",
          s.showValue && d.isItem ? e._currentValueOf(d.Id) : void 0,
          s.showInfo || s.InfoKey != null ? e._InfoProxyOf(d.Id) : {},
          s
        ));
    t && d.isItem && o < n && B(e, d.Id, t, n, o + 1, i, s, a, c);
  }
}
async function Ne(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = o.Store.EntryWithId(i);
    if (s == null || !s.isItem)
      throw new u(`item '${i}' not found`, l.NotFound);
    const a = !(t.label || t.mime || t.value || t.info || n != null);
    if (e.Format === "json") {
      const c = { id: i, kind: "item" };
      switch ((a || t.label) && (c.label = s.Label), (a || t.mime) && (c.mime = s.Type), (a || t.value) && (c.value = o.Store._currentValueOf(i) ?? null), !0) {
        case n != null: {
          c["info." + n] = o.Store._InfoProxyOf(i)[n] ?? null;
          break;
        }
        case (a || t.info): {
          c.info = { ...o.Store._InfoProxyOf(i) };
          break;
        }
      }
      w(e, c);
    } else {
      if (f(`id:    ${i}`), (a || t.label) && f(`label: ${s.Label}`), (a || t.mime) && f(`mime:  ${s.Type}`), a || t.value) {
        const c = o.Store._currentValueOf(i);
        f(`value: ${c != null ? String(c) : "(none)"}`);
      }
      switch (!0) {
        case n != null: {
          const c = o.Store._InfoProxyOf(i)[n];
          f(`info.${n}: ${JSON.stringify(c ?? null)}`);
          break;
        }
        case (a || t.info): {
          f(`info:  ${JSON.stringify(o.Store._InfoProxyOf(i))}`);
          break;
        }
      }
    }
  } finally {
    await p(o);
  }
}
async function Le(e, r, t) {
  const n = await h(e, !0);
  try {
    const o = I(r.container ?? g), i = n.Store.EntryWithId(o);
    if (i == null || !i.isItem)
      throw new u(
        `container '${o}' not found or is not an item`,
        l.NotFound
      );
    const s = r.at != null ? parseInt(r.at, 10) : void 0, a = r.mime ?? "text/plain", c = n.Store.newItemAt(a, i, s);
    switch (r.label != null && (c.Label = r.label), !0) {
      case r.file != null: {
        const d = await b.readFile(r.file), y = !a.startsWith("text/");
        c.writeValue(y ? new Uint8Array(d) : d.toString("utf8"));
        break;
      }
      case r.value != null: {
        c.writeValue(r.value);
        break;
      }
    }
    M(c.Info, r.info ?? null, t), e.Format === "json" ? w(e, { id: c.Id, created: !0 }) : f(c.Id);
  } finally {
    await p(n);
  }
}
async function Fe(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = o.Store.EntryWithId(i);
    if (s == null || !s.isItem)
      throw new u(`item '${i}' not found`, l.NotFound);
    switch (t.label != null && (s.Label = t.label), t.mime != null && (s.Type = t.mime), !0) {
      case t.file != null: {
        const a = await b.readFile(t.file), c = !s.Type.startsWith("text/");
        s.writeValue(c ? new Uint8Array(a) : a.toString("utf8"));
        break;
      }
      case t.value != null: {
        s.writeValue(t.value);
        break;
      }
    }
    M(s.Info, t.info ?? null, n), e.Format === "json" ? w(e, { id: i, updated: !0 }) : f(`updated '${i}'`);
  } finally {
    await p(o);
  }
}
function je(e, r) {
  const t = e.command("link").description("link-specific operations");
  t.command("get <id>").description("display link details").option("--label", "include label").option("--target", "include target item ID").option("--info", "include info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").action(async (n, o, i) => {
    const s = m(i.optsWithGlobals()), { InfoEntries: a } = k(r), c = Object.keys(a)[0];
    await Ce(s, n, o, c);
  }), t.command("create").description("create a new link pointing at a target item").requiredOption("--target <itemId>", "target item to point to").option("--container <itemId>", "container item (default: root)").option("--at <index>", "insertion index (default: append)").action(async (n, o) => {
    const i = m(o.optsWithGlobals());
    await Re(i, n);
  });
}
async function Ce(e, r, t, n) {
  const o = await h(e);
  try {
    const i = I(r), s = o.Store.EntryWithId(i);
    if (s == null || !s.isLink)
      throw new u(`link '${i}' not found`, l.NotFound);
    const a = !(t.label || t.target || t.info || n != null), c = o.Store._TargetOf(i).Id;
    if (e.Format === "json") {
      const d = { id: i, kind: "link" };
      switch ((a || t.label) && (d.label = s.Label), (a || t.target) && (d.target = c), !0) {
        case n != null: {
          d["info." + n] = o.Store._InfoProxyOf(i)[n] ?? null;
          break;
        }
        case (a || t.info): {
          d.info = { ...o.Store._InfoProxyOf(i) };
          break;
        }
      }
      w(e, d);
    } else
      switch (f(`id:     ${i}`), f("kind:   link"), (a || t.label) && f(`label:  ${s.Label}`), (a || t.target) && f(`target: ${c}`), !0) {
        case n != null: {
          const d = o.Store._InfoProxyOf(i)[n];
          f(`info.${n}: ${JSON.stringify(d ?? null)}`);
          break;
        }
        case (a || t.info): {
          f(`info:   ${JSON.stringify(o.Store._InfoProxyOf(i))}`);
          break;
        }
      }
  } finally {
    await p(o);
  }
}
async function Re(e, r) {
  const t = await h(e);
  try {
    const n = I(r.target), o = I(r.container ?? g), i = r.at != null ? parseInt(r.at, 10) : void 0, s = t.Store.EntryWithId(n), a = t.Store.EntryWithId(o);
    if (s == null || !s.isItem)
      throw new u(
        `target '${n}' not found or is not an item`,
        l.NotFound
      );
    if (a == null || !a.isItem)
      throw new u(
        `container '${o}' not found or is not an item`,
        l.NotFound
      );
    const c = t.Store.newLinkAt(s, a, i);
    e.Format === "json" ? w(e, { id: c.Id, created: !0, target: n }) : f(c.Id);
  } finally {
    await p(t);
  }
}
const q = 720 * 60 * 60 * 1e3;
function We(e) {
  const r = e.command("trash").description("trash inspection and cleanup");
  r.command("list").description("list all entries currently in the trash").option("--only <kind>", "filter by kind: items | links").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await Pe(o, t.only);
  }), r.command("purge-all").description("permanently delete every entry in the trash").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await Ue(o);
  }), r.command("purge-expired").description("permanently delete trash entries older than --ttl milliseconds").option("--ttl <ms>", "TTL in milliseconds (default: 30 days)", String(q)).action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await Ae(o, parseInt(t.ttl, 10));
  });
}
async function Pe(e, r) {
  const t = await h(e);
  try {
    const n = t.Store.TrashItem, i = t.Store._innerEntriesOf(n.Id).filter((s) => {
      if (r == null)
        return !0;
      const a = s.isItem ? "item" : "link";
      return r === a + "s" || r === a;
    });
    if (e.Format === "json")
      w(e, i.map((s) => ({
        id: s.Id,
        kind: s.isItem ? "item" : "link",
        label: s.Label
      })));
    else if (i.length === 0)
      f("(trash is empty)");
    else
      for (const s of i) {
        const a = s.isItem ? "item" : "link";
        f(`${s.Id}  ${a}  ${s.Label}`);
      }
  } finally {
    await p(t);
  }
}
async function Ue(e) {
  const r = await h(e);
  try {
    const t = r.Store.TrashItem, n = [...r.Store._innerEntriesOf(t.Id)];
    let o = 0;
    for (const i of n)
      try {
        i.purge(), o++;
      } catch {
      }
    e.Format === "json" ? w(e, { purged: o }) : f(`purged ${o} entr${o === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(r);
  }
}
async function Ae(e, r) {
  const t = isNaN(r) ? q : r, n = await h(e);
  try {
    const o = n.Store.purgeExpiredTrashEntries(t);
    e.Format === "json" ? w(e, { purged: o, ttlMs: t }) : f(`purged ${o} expired entr${o === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(n);
  }
}
function Ge(e) {
  e.command("tree").description("tree display").command("show").description("display the store tree").option("--depth <n>", "maximum display depth (default: unlimited)").action(async (t, n) => {
    const o = m(n.optsWithGlobals()), i = t.depth != null ? parseInt(t.depth, 10) : 1 / 0;
    await Je(o, i);
  });
}
async function Je(e, r) {
  const t = await h(e);
  try {
    if (e.Format === "json") {
      const n = j(t.Store, g, r, 0);
      w(e, { root: n });
    } else {
      f("root/");
      const n = j(t.Store, g, r, 0);
      for (let o = 0; o < n.length; o++) {
        const i = n[o], s = o === n.length - 1, a = J(
          i.Id,
          i.Label,
          i.Kind,
          i.TargetId,
          i.Children,
          "",
          s
        );
        for (const c of a)
          f(c);
      }
      n.length === 0 && f("  (empty)");
    }
  } finally {
    await p(t);
  }
}
function j(e, r, t, n) {
  return n >= t ? [] : e._innerEntriesOf(r).map((o) => {
    const i = o.isItem ? "item" : "link", s = o.isLink ? e._TargetOf(o.Id).Id : void 0, a = o.isItem && n + 1 < t ? j(e, o.Id, t, n + 1) : [];
    return { Id: o.Id, Kind: i, Label: o.Label, TargetId: s, Children: a };
  });
}
function O(e) {
  const r = new z("sds");
  return r.description("shareable-data-store CLI").version(ae.version, "--version", "print version").allowUnknownOption(!1).option("--server <url>", "WebSocket server URL (env: SDS_SERVER_URL)").option("--store <id>", "store identifier (env: SDS_STORE_ID)").option("--token <jwt>", "client JWT — read/write (env: SDS_TOKEN)").option("--admin-token <jwt>", "admin JWT (env: SDS_ADMIN_TOKEN)").option("--data-dir <path>", "directory for local SQLite files (env: SDS_DATA_DIR)").option("--format <fmt>", "output format: text | json (default: text)").option("--on-error <action>", "error mode: stop | continue | ask (default: stop)"), ce(r), fe(r), be(r, e), _e(r, e), je(r, e), We(r), Ge(r), r.command("shell").description("start an interactive REPL").action(async (t, n) => {
    const o = m(n.optsWithGlobals());
    await oe((i) => P(i, o));
  }), r.option("--script <file>", "run commands from file (use - for stdin)").action(async (t) => {
    const n = m(t);
    if (t.script != null) {
      const o = await re(n, t.script, P);
      process.exit(o);
    } else
      process.stdout.write(r.helpInformation()), process.exit(l.OK);
  }), r;
}
async function P(e, r) {
  if (e.length === 0)
    return l.OK;
  const { CleanArgv: t, InfoEntries: n } = k(e), o = O(
    Object.entries(n).flatMap(([i, s]) => [
      `--info.${i}`,
      JSON.stringify(s)
    ])
  );
  o.exitOverride();
  try {
    return await o.parseAsync(["node", "sds", ...t]), l.OK;
  } catch (i) {
    const s = i;
    return s.code === "commander.helpDisplayed" || s.code === "commander.version" ? l.OK : s.code === "commander.unknownCommand" ? (process.stderr.write(`sds: unknown command '${t[0]}' — try 'sds help'
`), l.UsageError) : s.code === "commander.unknownOption" || s.code === "commander.missingArgument" || s.code === "commander.missingMandatoryOptionValue" ? (process.stderr.write(`sds: ${s.message}
`), l.UsageError) : i instanceof u ? (N(r ?? { Format: "text" }, i.message, i.ExitCode), i.ExitCode) : (N(r ?? { Format: "text" }, i.message ?? String(i)), l.GeneralError);
  }
}
async function Ve() {
  const { CleanArgv: e, InfoEntries: r } = k(process.argv.slice(2)), t = Object.entries(r).flatMap(([o, i]) => [
    `--info.${o}`,
    JSON.stringify(i)
  ]), n = O(t);
  n.exitOverride();
  try {
    await n.parseAsync(["node", "sds", ...e]);
  } catch (o) {
    const i = o;
    if ((i.code === "commander.helpDisplayed" || i.code === "commander.version") && process.exit(l.OK), (i.code === "commander.unknownCommand" || i.code === "commander.unknownOption" || i.code === "commander.missingArgument" || i.code === "commander.missingMandatoryOptionValue") && (process.stderr.write(`sds: ${i.message}
`), process.exit(l.UsageError)), o instanceof u) {
      const a = m({});
      N(a, o.message, o.ExitCode), process.exit(o.ExitCode);
    }
    const s = m({});
    N(s, o.message ?? String(o)), process.exit(l.GeneralError);
  }
}
typeof process < "u" && process.argv[1] != null && (process.argv[1].endsWith("sds-command.js") || process.argv[1].endsWith("/sds")) && Ve().catch((e) => {
  process.stderr.write(`sds: fatal: ${e.message ?? e}
`), process.exit(l.GeneralError);
});
