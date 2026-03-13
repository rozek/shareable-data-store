#!/usr/bin/env -S node --no-warnings
import { Command as te } from "commander";
import ne from "node:os";
import B from "node:path";
import g from "node:fs/promises";
import { SDS_DesktopPersistenceProvider as q } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as z } from "@rozek/sds-sync-engine";
import { SDS_WebSocketProvider as oe } from "@rozek/sds-network-websocket";
import { LostAndFoundId as P, TrashId as D, RootId as k } from "@rozek/sds-core";
import K from "node:readline";
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
class L extends Error {
  ExitCode;
  constructor(n, t = c.UsageError) {
    super(n), this.ExitCode = t;
  }
}
function w(e) {
  const n = e.server ?? process.env.SDS_SERVER_URL, t = e.persistenceDir ?? process.env.SDS_PERSISTENCE_DIR ?? B.join(ne.homedir(), ".sds"), o = e.store ?? process.env.SDS_STORE_ID, r = e.token ?? process.env.SDS_TOKEN, s = e.adminToken ?? process.env.SDS_ADMIN_TOKEN;
  if (n != null && !/^wss?:\/\//.test(n))
    throw new L(
      `invalid '--server' URL '${n}' — must start with 'ws://' or 'wss://'`,
      c.UsageError
    );
  const i = (e.format ?? "text").toLowerCase();
  if (i !== "text" && i !== "json")
    throw new L(
      `'--format' accepts 'text' or 'json' — got '${e.format}'`,
      c.UsageError
    );
  const a = i, d = (e.onError ?? "stop").toLowerCase();
  if (d !== "stop" && d !== "continue" && d !== "ask")
    throw new L(
      `'--on-error' accepts 'stop', 'continue', or 'ask' — got '${e.onError}'`,
      c.UsageError
    );
  return { ServerURL: n, PersistenceDir: t, StoreId: o, Token: r, AdminToken: s, Format: a, OnError: d };
}
function N(e, n) {
  const t = n.replace(/[^a-zA-Z0-9_-]/g, "_");
  return B.join(e.PersistenceDir, `${t}.db`);
}
function f(e = "") {
  process.stdout.write(e + `
`);
}
function re(e) {
  process.stdout.write(JSON.stringify(e, null, 2) + `
`);
}
function R(e, n, t) {
  e.Format === "json" ? process.stderr.write(
    JSON.stringify({ error: n, exitCode: t ?? 1 }) + `
`
  ) : process.stderr.write(`sds: error: ${n}
`);
}
function h(e, n) {
  if (e.Format === "json") {
    re(n);
    return;
  }
  switch (!0) {
    case n == null:
      break;
    case typeof n == "string":
      f(n);
      break;
    case Array.isArray(n):
      for (const t of n)
        f(String(t));
      break;
    default:
      f(JSON.stringify(n));
  }
}
function se(e, n, t, o, r, s) {
  const i = [e];
  switch (s.showLabel && i.push(n !== "" ? n : "(no label)"), s.showMIME && i.push(t), s.showValue && i.push(o != null ? String(o) : "(no value)"), !0) {
    case s.InfoKey != null:
      i.push(JSON.stringify(r[s.InfoKey] ?? null));
      break;
    case s.showInfo:
      i.push(JSON.stringify(r));
      break;
  }
  return i.join("  ");
}
function H(e, n, t, o, r, s, i) {
  const a = i ? "└── " : "├── ", d = t === "link" ? ` → ${o ?? "?"}` : "", u = n !== "" ? `  ${n}` : "", m = `${s}${a}${e}${u}${d}`, I = s + (i ? "    " : "│   "), $ = [m];
  for (let x = 0; x < r.length; x++) {
    const T = r[x], j = x === r.length - 1;
    $.push(
      ...H(
        T.Id,
        T.Label,
        T.Kind,
        T.TargetId,
        T.Children,
        I,
        j
      )
    );
  }
  return $;
}
let U;
function ie(e) {
  U = e;
}
function ae(e) {
  return U.fromBinary(e);
}
class l extends Error {
  ExitCode;
  constructor(n, t = c.GeneralError) {
    super(n), this.name = "SDS_CommandError", this.ExitCode = t;
  }
}
async function y(e, n = !1) {
  const t = e.StoreId;
  if (t == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  await g.mkdir(e.PersistenceDir, { recursive: !0 });
  const o = N(e, t), r = new q(o, t);
  let s;
  try {
    const a = await r.loadSnapshot();
    switch (!0) {
      case a != null: {
        s = U.fromBinary(a);
        break;
      }
      case n: {
        s = U.fromScratch();
        break;
      }
      default:
        throw await r.close(), new l(
          `store '${t}' not found in '${e.PersistenceDir}'`,
          c.NotFound
        );
    }
  } catch (a) {
    throw a instanceof l ? a : (await r.close().catch(() => {
    }), new l(
      `failed to open store '${t}': ${a.message}`,
      c.GeneralError
    ));
  }
  const i = new z(s, { PersistenceProvider: r });
  return await i.start(), { Store: s, Persistence: r, Engine: i };
}
async function p(e) {
  await e.Engine.stop();
}
async function Y(e, n = 5e3) {
  const t = e.StoreId, o = e.ServerURL, r = e.Token;
  if (t == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  if (o == null)
    throw new l(
      "no server URL — set SDS_SERVER_URL or use --server",
      c.UsageError
    );
  if (!/^wss?:\/\//.test(o))
    throw new l(
      `invalid server URL '${o}' — must start with 'ws://' or 'wss://'`,
      c.UsageError
    );
  if (r == null)
    throw new l(
      "no client token — set SDS_TOKEN or use --token",
      c.UsageError
    );
  await g.mkdir(e.PersistenceDir, { recursive: !0 });
  const s = N(e, t), i = new q(s, t), a = await i.loadSnapshot(), d = a != null ? U.fromBinary(a) : U.fromScratch(), u = new oe(t), m = new z(d, {
    PersistenceProvider: i,
    NetworkProvider: u
  });
  await m.start();
  let I = !1, $;
  const x = new Promise((v) => {
    $ = v;
  }), T = m.onConnectionChange((v) => {
    v === "connected" && (I = !0, setTimeout($, n)), v === "disconnected" && $();
  }), j = setTimeout(() => {
    $();
  }, n * 2);
  try {
    await m.connectTo(o, { Token: r });
    const v = await i.loadPatchesSince(0);
    for (const ee of v)
      u.sendPatch(ee);
    await x;
  } catch (v) {
    throw new l(
      `sync failed: ${v.message}`,
      c.NetworkError
    );
  } finally {
    clearTimeout(j), T(), await m.stop();
  }
  return { Connected: I, StoreId: t, ServerURL: o };
}
async function ce(e) {
  const n = e.StoreId;
  if (n == null)
    return !1;
  const t = N(e, n);
  try {
    return await g.access(t), !0;
  } catch {
    return !1;
  }
}
async function le(e) {
  const n = e.StoreId;
  if (n == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  const t = N(e, n);
  try {
    await g.unlink(t), await g.unlink(t + "-wal").catch(() => {
    }), await g.unlink(t + "-shm").catch(() => {
    });
  } catch (o) {
    const r = o;
    throw r.code === "ENOENT" ? new l(
      `store '${n}' not found in '${e.PersistenceDir}'`,
      c.NotFound
    ) : new l(
      `failed to delete store '${n}': ${r.message}`,
      c.GeneralError
    );
  }
}
function S(e) {
  switch (e.toLowerCase()) {
    case "root":
      return k;
    case "trash":
      return D;
    case "lost-and-found":
    case "lostandfound":
      return P;
    default:
      return e;
  }
}
function b(e, n) {
  const t = parseInt(e, 10);
  if (isNaN(t))
    throw new l(
      `invalid value for ${n}: '${e}' — expected an integer`,
      c.UsageError
    );
  return t;
}
async function A(e) {
  try {
    return await g.readFile(e);
  } catch (n) {
    throw n.code === "ENOENT" ? new l(
      `file not found: '${e}'`,
      c.NotFound
    ) : n;
  }
}
const de = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function F(e) {
  if (!de.test(e))
    throw new l(
      `invalid info key ${JSON.stringify(e)} — keys must be valid JavaScript identifiers`,
      c.UsageError
    );
}
function _(e) {
  const n = [], t = {}, o = [];
  let r = 0;
  for (; r < e.length; ) {
    const s = e[r];
    if (s.startsWith("--info-delete.")) {
      const i = s.slice(14);
      F(i), o.push(i), r++;
      continue;
    }
    if (s.startsWith("--info.") && s.includes("=")) {
      const i = s.indexOf("="), a = s.slice(7, i), d = s.slice(i + 1);
      F(a), t[a] = J(d), r++;
      continue;
    }
    if (s.startsWith("--info.") && !s.includes("=")) {
      const i = s.slice(7);
      F(i);
      const a = e[r + 1];
      if (a != null && !a.startsWith("--")) {
        t[i] = J(a), r += 2;
        continue;
      }
      t[i] = !0, r++;
      continue;
    }
    n.push(s), r++;
  }
  return { CleanArgv: n, InfoEntries: t, InfoDeleteKeys: o };
}
function J(e) {
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}
function C(e, n, t, o = []) {
  if (n != null) {
    let r;
    if (typeof n == "string")
      try {
        r = JSON.parse(n);
      } catch {
        throw new l(
          `--info value is not valid JSON: ${n}`,
          c.UsageError
        );
      }
    else
      r = n;
    if (typeof r != "object" || r === null || Array.isArray(r))
      throw new l(
        "--info value must be a JSON object",
        c.UsageError
      );
    for (const [s, i] of Object.entries(r))
      F(s), e[s] = i;
  }
  for (const [r, s] of Object.entries(t))
    e[r] = s;
  for (const r of o)
    delete e[r];
}
function Z(e) {
  const n = [];
  let t = "", o = 0;
  for (; o < e.length; ) {
    const r = e[o];
    switch (!0) {
      // skip leading and inter-token whitespace
      case (r === " " || r === "	"): {
        t.length > 0 && (n.push(t), t = ""), o++;
        break;
      }
      // single-quoted string — no escapes inside
      case r === "'": {
        for (o++; o < e.length && e[o] !== "'"; )
          t += e[o], o++;
        o++;
        break;
      }
      // double-quoted string — supports \" and \\ inside
      case r === '"': {
        for (o++; o < e.length && e[o] !== '"'; )
          if (e[o] === "\\" && o + 1 < e.length) {
            const s = e[o + 1];
            t += s === '"' || s === "\\" ? s : "\\" + s, o += 2;
          } else
            t += e[o], o++;
        o++;
        break;
      }
      // inline comment — everything from # to end of line is dropped
      case (r === "#" && t.length === 0): {
        o = e.length;
        break;
      }
      default:
        r === "\\" && o + 1 < e.length ? (t += e[o + 1], o += 2) : (t += r, o++);
    }
  }
  return t.length > 0 && n.push(t), n;
}
async function ue(e) {
  const n = process.stdin.isTTY, t = n ? "\x1B[1msds>\x1B[0m " : "sds> ", o = K.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: n,
    prompt: t
  });
  n && (process.stdout.write(
    `SDS interactive shell — type "help [command]" for help, "exit" to quit
`
  ), o.prompt());
  for await (const r of o) {
    const s = r.trim();
    if (s === "" || s.startsWith("#")) {
      n && o.prompt();
      continue;
    }
    if (s === "exit" || s === "quit")
      break;
    const i = Z(s);
    if (i.length === 0) {
      n && o.prompt();
      continue;
    }
    try {
      await e(i);
    } catch (a) {
      process.stderr.write(`sds: ${a.message}
`);
    }
    n && o.prompt();
  }
  o.close();
}
async function fe(e, n, t) {
  let o;
  if (n === "-")
    o = process.stdin;
  else
    try {
      o = (await g.open(n)).createReadStream();
    } catch {
      throw new l(
        `cannot open script file '${n}'`,
        c.NotFound
      );
    }
  const r = K.createInterface({
    input: o,
    terminal: !1
  });
  let s = 0;
  for await (const i of r) {
    const a = i.trim();
    if (a === "" || a.startsWith("#"))
      continue;
    const d = Z(a);
    if (d.length === 0)
      continue;
    let u = 0;
    try {
      u = await t(d, e);
    } catch (m) {
      u = 1, process.stderr.write(`sds: ${m.message}
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
          if (!await me())
            return r.close(), u;
          break;
        }
      }
  }
  return r.close(), s;
}
async function me() {
  return process.stdin.isTTY ? new Promise((n) => {
    const t = K.createInterface({ input: process.stdin, output: process.stdout });
    t.question("error — continue? [y/N] ", (o) => {
      t.close(), n(o.trim().toLowerCase() === "y");
    });
  }) : !1;
}
function we(e) {
  e.command("token").description("manage authentication tokens (requires admin token)").command("issue").description("request a new JWT from the server").requiredOption("--sub <subject>", "user identifier (e.g. email address)").requiredOption("--scope <scope>", "token scope: read | write | admin").option("--exp <duration>", "expiry duration, e.g. 24h or 7d", "24h").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await pe(r, t);
  });
}
const he = /* @__PURE__ */ new Set(["read", "write", "admin"]), ye = /^(\d+)(s|m|h|d)$/;
async function pe(e, n) {
  const { ServerURL: t, AdminToken: o } = e;
  if (o == null)
    throw new l(
      "no admin token — set SDS_ADMIN_TOKEN or use --admin-token",
      c.Unauthorized
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
  if (!he.has(n.scope))
    throw new l(
      `invalid scope '${n.scope}' — must be read, write, or admin`,
      c.UsageError
    );
  if (!ye.test(n.exp))
    throw new l(
      `invalid expiry '${n.exp}' — use a number followed by s, m, h, or d`,
      c.UsageError
    );
  const s = t.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://").replace(/\/+$/, "") + "/api/token";
  let i;
  try {
    i = await fetch(s, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${o}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sub: n.sub, scope: n.scope, exp: n.exp })
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
  e.Format === "json" ? h(e, { token: d, sub: n.sub, scope: n.scope, exp: n.exp }) : h(e, d);
}
function Ie(e) {
  const n = e.command("store").description("store lifecycle operations");
  n.command("info").description("show local store metadata (existence, entry count, DB path)").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await Se(r);
  }), n.command("ping").description("check connectivity to the WebSocket server").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await Ee(r);
  }), n.command("sync").description("connect to server, exchange CRDT patches, and disconnect").option("--timeout <ms>", "milliseconds to wait after connecting", "5000").action(async (t, o) => {
    const r = w(o.optsWithGlobals()), s = b(t.timeout, "--timeout");
    if (s <= 0)
      throw new l(
        `'--timeout' must be a positive integer — got ${s}`,
        c.UsageError
      );
    await ge(r, s);
  }), n.command("destroy").description("permanently delete the local store database").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await ke(r);
  }), n.command("export").description("export the current store snapshot").option("--encoding <enc>", "serialisation encoding: json | binary", "json").option("--output <file>", "destination file (default: stdout)").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await ve(r, t.encoding, t.output);
  }), n.command("import").description("CRDT-merge a snapshot file into the local store").requiredOption("--input <file>", "source file to import").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await be(r, t.input);
  });
}
async function Se(e) {
  const n = e.StoreId;
  if (n == null)
    throw new l(
      "no store ID — set SDS_STORE_ID or use --store",
      c.UsageError
    );
  if (!await ce(e)) {
    e.Format === "json" ? h(e, { storeId: n, exists: !1 }) : f(`store '${n}': not found in '${e.PersistenceDir}'`);
    return;
  }
  const o = await y(e);
  try {
    const r = $e(o.Store);
    e.Format === "json" ? h(e, {
      storeId: n,
      exists: !0,
      entryCount: r,
      dbPath: N(e, n)
    }) : (f(`store:       ${n}`), f(`entries:     ${r}`), f(`db path:     ${N(e, n)}`));
  } finally {
    await p(o);
  }
}
async function Ee(e) {
  const n = e.ServerURL, t = e.Token;
  if (n == null)
    throw new l(
      "no server URL — set SDS_SERVER_URL or use --server",
      c.UsageError
    );
  if (t == null)
    throw new l(
      "no client token — set SDS_TOKEN or use --token",
      c.UsageError
    );
  try {
    const o = await Y(e, 1e3);
    e.Format === "json" ? h(e, { server: o.ServerURL, storeId: o.StoreId, reachable: !0 }) : f(`server '${o.ServerURL}': reachable`);
  } catch (o) {
    if (o instanceof l && o.ExitCode === c.NetworkError)
      e.Format === "json" ? h(e, { server: n, reachable: !1, error: o.message }) : f(`server '${n}': unreachable — ${o.message}`);
    else
      throw o;
  }
}
async function ge(e, n) {
  const t = await Y(e, n);
  if (e.Format === "json")
    h(e, {
      storeId: t.StoreId,
      server: t.ServerURL,
      connected: t.Connected,
      synced: t.Connected
    });
  else {
    const o = t.Connected ? "synced" : "could not connect";
    f(`store '${t.StoreId}': ${o}`);
  }
}
async function ke(e) {
  await le(e), e.Format === "json" ? h(e, { storeId: e.StoreId, destroyed: !0 }) : f(`store '${e.StoreId}': deleted`);
}
async function ve(e, n, t) {
  const o = n.toLowerCase();
  if (o !== "json" && o !== "binary")
    throw new l(
      `'--encoding' accepts 'json' or 'binary' — got '${n}'`,
      c.UsageError
    );
  const r = await y(e);
  try {
    const s = o === "binary", i = s ? r.Store.asBinary() : JSON.stringify(r.Store.asJSON(), null, 2);
    t != null ? (await g.writeFile(t, s ? i : i + `
`), e.Format === "json" ? h(e, { exported: !0, file: t, format: o }) : f(`exported to '${t}'`)) : s ? process.stdout.write(i) : process.stdout.write(i + `
`);
  } finally {
    await p(r);
  }
}
async function be(e, n) {
  const t = await A(n), o = t.toString("utf8").trimStart(), r = o.startsWith("{") || o.startsWith("["), s = await y(e, !0);
  try {
    if (r) {
      let i;
      try {
        i = JSON.parse(o);
      } catch {
        throw new l(
          `'${n}' does not contain valid JSON`,
          c.UsageError
        );
      }
      M(s.Store, i);
    } else {
      const i = ae(new Uint8Array(t));
      try {
        M(s.Store, i.asJSON());
      } finally {
        i.dispose();
      }
    }
    e.Format === "json" ? h(e, { imported: !0, file: n }) : f(`imported '${n}'`);
  } finally {
    await p(s);
  }
}
function M(e, n) {
  const t = n, o = /* @__PURE__ */ new Set([k, D, P]), r = t.innerEntries;
  if (r != null)
    for (const s of r)
      o.has(s.Id) || e.newEntryFromJSONat(s, e.RootItem);
}
function $e(e) {
  const n = /* @__PURE__ */ new Set([k, D, P]);
  let t = 0;
  function o(r) {
    for (const s of e._innerEntriesOf(r))
      n.has(s.Id) || (t++, s.isItem && o(s.Id));
  }
  return o(k), t;
}
function Te(e, n) {
  const t = e.command("entry").description("operations on entries (items and links)");
  t.command("create").description("create a new item (default) or link (with --target)").option("--target <itemId>", "link target — creates a link instead of an item").option("--container <itemId>", "container item (default: root)").option("--at <index>", "insertion index (default: append)").option("--label <label>", "initial label").option("--mime <type>", "MIME type (default: text/plain, items only)").option("--value <string>", "initial text value (items only)").option("--file <path>", "read initial value from file (items only)").option("--info <json>", "initial info map as JSON object").option("--info.<key>", "set a single info entry, e.g. --info.author").option("--info-delete.<key>", "remove a single info entry, e.g. --info-delete.author").action(async (o, r) => {
    const s = w(r.optsWithGlobals()), { InfoEntries: i, InfoDeleteKeys: a } = _(n);
    await xe(s, o, i, a);
  }), t.command("get <id>").description("display all or selected fields of an entry").option("--kind", "include entry kind (item or link)").option("--label", "include label").option("--mime", "include MIME type (items only)").option("--value", "include value (items only)").option("--info", "include full info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").option("--target", "include link target ID (links only)").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals()), { InfoEntries: a } = _(n), d = Object.keys(a)[0];
    await _e(i, o, r, d);
  }), t.command("list <id>").description("list entries in a container item (only IDs by default)").option("--recursive", "traverse inner containers recursively").option("--depth <n>", "maximum recursion depth").option("--only <kind>", "filter by kind: items | links").option("--label", "include label").option("--mime", "include MIME type (items only)").option("--value", "include value (items only)").option("--info", "include info map").option("--info.<key>", "include only the named info entry, e.g. --info.author").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals()), { InfoEntries: a } = _(n), d = Object.keys(a)[0];
    await Ne(i, o, r, d);
  }), t.command("update <id>").description("update entry properties (works on both items and links)").option("--label <label>", "new label (items and links)").option("--mime <type>", "new MIME type (items only)").option("--value <string>", "new text value (items only)").option("--file <path>", "read new value from file (items only)").option("--info <json>", "merge info map from JSON object").option("--info.<key>", "set a single info entry, e.g. --info.author").option("--info-delete.<key>", "remove a single info entry, e.g. --info-delete.author").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals()), { InfoEntries: a, InfoDeleteKeys: d } = _(n);
    await Pe(i, o, r, a, d);
  }), t.command("move <id>").description("move an entry to a different container").requiredOption("--to <targetId>", "destination container item ID").option("--at <index>", "insertion index (default: append)").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals());
    await De(i, o, r.to, r.at);
  }), t.command("delete <id>").description("soft-delete: move entry to the trash").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals());
    await Le(i, o);
  }), t.command("restore <id>").description("restore a trashed entry (moves to root or --to target)").option("--to <targetId>", "destination container item ID (default: root)").option("--at <index>", "insertion index (default: append)").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals());
    await Fe(i, o, r.to, r.at);
  }), t.command("purge <id>").description("permanently delete an entry (must be in the trash)").action(async (o, r, s) => {
    const i = w(s.optsWithGlobals());
    await Re(i, o);
  });
}
async function xe(e, n, t, o) {
  if (n.value != null && n.file != null)
    throw new l(
      "'--value' and '--file' are mutually exclusive — specify at most one",
      c.UsageError
    );
  if (n.target != null) {
    if (n.mime != null)
      throw new l(
        "'--mime' is not supported when creating a link — only items have a MIME type",
        c.UsageError
      );
    if (n.value != null)
      throw new l(
        "'--value' is not supported when creating a link — only items have a value",
        c.UsageError
      );
    if (n.file != null)
      throw new l(
        "'--file' is not supported when creating a link — only items have a value",
        c.UsageError
      );
    const r = await y(e);
    try {
      const s = S(n.target), i = S(n.container ?? k), a = n.at != null ? b(n.at, "--at") : void 0;
      if (a != null && a < 0)
        throw new l(
          `'--at' must be a non-negative integer — got ${a}`,
          c.UsageError
        );
      const d = r.Store.EntryWithId(s), u = r.Store.EntryWithId(i);
      if (d == null || !d.isItem)
        throw new l(
          `target '${s}' not found or is not an item`,
          c.NotFound
        );
      if (u == null || !u.isItem)
        throw new l(
          `container '${i}' not found or is not an item`,
          c.NotFound
        );
      const m = r.Store.newLinkAt(d, u, a);
      n.label != null && (m.Label = n.label), C(
        r.Store._InfoProxyOf(m.Id),
        n.info ?? null,
        t,
        o
      ), e.Format === "json" ? h(e, { id: m.Id, created: !0, kind: "link", target: s }) : f(m.Id);
    } finally {
      await p(r);
    }
  } else {
    const r = await y(e, !0);
    try {
      const s = S(n.container ?? k), i = r.Store.EntryWithId(s);
      if (i == null || !i.isItem)
        throw new l(
          `container '${s}' not found or is not an item`,
          c.NotFound
        );
      const a = n.at != null ? b(n.at, "--at") : void 0;
      if (a != null && a < 0)
        throw new l(
          `'--at' must be a non-negative integer — got ${a}`,
          c.UsageError
        );
      const d = n.mime ?? "text/plain", u = r.Store.newItemAt(d, i, a);
      switch (n.label != null && (u.Label = n.label), !0) {
        case n.file != null: {
          const m = await A(n.file), I = !d.startsWith("text/");
          u.writeValue(I ? new Uint8Array(m) : m.toString("utf8"));
          break;
        }
        case n.value != null: {
          u.writeValue(n.value);
          break;
        }
      }
      C(u.Info, n.info ?? null, t, o), e.Format === "json" ? h(e, { id: u.Id, created: !0, kind: "item" }) : f(u.Id);
    } finally {
      await p(r);
    }
  }
}
async function _e(e, n, t, o) {
  const r = await y(e);
  try {
    const s = S(n), i = r.Store.EntryWithId(s);
    if (i == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    const d = !(t.kind || t.label || t.mime || t.value || t.info || t.target || o != null) ? "all" : { ...t, InfoKey: o };
    e.Format === "json" ? h(e, je(i, r.Store, d)) : Ce(i, r.Store, d);
  } finally {
    await p(r);
  }
}
async function Ne(e, n, t, o) {
  const r = t.only?.toLowerCase();
  if (r != null && !["item", "items", "link", "links"].includes(r))
    throw new l(
      `'--only' accepts 'items' or 'links' — got '${t.only}'`,
      c.UsageError
    );
  const s = await y(e);
  try {
    const i = S(n), a = s.Store.EntryWithId(i);
    if (a == null || !a.isItem)
      throw new l(
        `container '${i}' not found or is not an item`,
        c.NotFound
      );
    const d = t.depth != null ? b(t.depth, "--depth") : 1 / 0, u = {
      showLabel: t.label,
      showMIME: t.mime,
      showValue: t.value,
      showInfo: t.info,
      InfoKey: o
    }, m = [];
    if (Q(s.Store, i, t.recursive ?? !1, d, 0, r, u, m, e), e.Format === "json")
      h(e, m);
    else
      for (const I of m)
        f(I);
  } finally {
    await p(s);
  }
}
const Ue = /* @__PURE__ */ new Set([D, P]);
function Q(e, n, t, o, r, s, i, a, d) {
  for (const u of e._innerEntriesOf(n)) {
    if (Ue.has(u.Id))
      continue;
    const m = u.isItem ? "item" : "link";
    if (s == null || s === m + "s" || s === m)
      if (d.Format === "json") {
        const I = { id: u.Id, kind: m };
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
        a.push(se(
          u.Id,
          i.showLabel ? u.Label : "",
          i.showMIME && u.isItem ? e._TypeOf(u.Id) : "",
          i.showValue && u.isItem ? e._currentValueOf(u.Id) : void 0,
          i.showInfo || i.InfoKey != null ? e._InfoProxyOf(u.Id) : {},
          i
        ));
    t && u.isItem && r < o && Q(e, u.Id, t, o, r + 1, s, i, a, d);
  }
}
async function De(e, n, t, o) {
  const r = await y(e);
  try {
    const s = S(n), i = S(t), a = o != null ? b(o, "--at") : void 0;
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
    d.moveTo(u, a), e.Format === "json" ? h(e, { id: s, movedTo: i, at: a ?? "end" }) : f(`moved '${s}' into '${i}'`);
  } finally {
    await p(r);
  }
}
async function Le(e, n) {
  const t = await y(e);
  try {
    const o = S(n), r = t.Store.EntryWithId(o);
    if (r == null)
      throw new l(`entry '${o}' not found`, c.NotFound);
    if (!r.mayBeDeleted)
      throw new l(
        `entry '${o}' cannot be deleted (system entry)`,
        c.Forbidden
      );
    r.delete(), e.Format === "json" ? h(e, { id: o, deleted: !0 }) : f(`deleted '${o}' (moved to trash)`);
  } finally {
    await p(t);
  }
}
async function Fe(e, n, t, o) {
  const r = await y(e);
  try {
    const s = S(n), i = S(t ?? k), a = o != null ? b(o, "--at") : void 0;
    if (a != null && a < 0)
      throw new l(
        `'--at' must be a non-negative integer — got ${a}`,
        c.UsageError
      );
    const d = r.Store.EntryWithId(s), u = r.Store.EntryWithId(i);
    if (d == null)
      throw new l(`entry '${s}' not found`, c.NotFound);
    if (d.outerItemId !== D)
      throw new l(
        `entry '${s}' is not in the trash — use 'entry move' to relocate live entries`,
        c.Forbidden
      );
    if (u == null || !u.isItem)
      throw new l(
        `target '${i}' not found or is not an item`,
        c.NotFound
      );
    d.moveTo(u, a), e.Format === "json" ? h(e, { id: s, restoredTo: i, at: a ?? "end" }) : f(`restored '${s}' into '${i}'`);
  } finally {
    await p(r);
  }
}
async function Re(e, n) {
  const t = await y(e);
  try {
    const o = S(n), r = t.Store.EntryWithId(o);
    if (r == null)
      throw new l(`entry '${o}' not found`, c.NotFound);
    if (r.outerItemId !== D)
      throw new l(
        `entry '${o}' is not in the trash — delete it first`,
        c.Forbidden
      );
    r.purge(), e.Format === "json" ? h(e, { id: o, purged: !0 }) : f(`purged '${o}'`);
  } finally {
    await p(t);
  }
}
async function Pe(e, n, t, o, r) {
  const s = await y(e);
  try {
    const i = S(n), a = s.Store.EntryWithId(i);
    if (a == null)
      throw new l(`entry '${i}' not found`, c.NotFound);
    if (a.isLink) {
      if (t.mime != null)
        throw new l(
          "'--mime' is not supported for links — only items have a MIME type",
          c.UsageError
        );
      if (t.value != null)
        throw new l(
          "'--value' is not supported for links — only items have a value",
          c.UsageError
        );
      if (t.file != null)
        throw new l(
          "'--file' is not supported for links — only items have a value",
          c.UsageError
        );
    }
    if (t.label != null && (a.Label = t.label), a.isItem) {
      if (t.value != null && t.file != null)
        throw new l(
          "'--value' and '--file' are mutually exclusive — specify at most one",
          c.UsageError
        );
      const d = a;
      switch (t.mime != null && (d.Type = t.mime), !0) {
        case t.file != null: {
          const u = await A(t.file), m = !d.Type.startsWith("text/");
          d.writeValue(m ? new Uint8Array(u) : u.toString("utf8"));
          break;
        }
        case t.value != null: {
          d.writeValue(t.value);
          break;
        }
      }
    }
    C(
      s.Store._InfoProxyOf(i),
      t.info ?? null,
      o,
      r
    ), e.Format === "json" ? h(e, { id: i, updated: !0 }) : f(`updated '${i}'`);
  } finally {
    await p(s);
  }
}
function je(e, n, t) {
  const o = t === "all", r = { id: e.Id };
  if ((o || t.kind) && (r.kind = e.isItem ? "item" : "link"), (o || t.label) && (r.label = e.Label), e.isItem) {
    const i = e;
    (o || t.mime) && (r.mime = i.Type), (o || t.value) && (r.value = n._currentValueOf(e.Id) ?? null);
  }
  if (e.isLink) {
    const i = n._TargetOf(e.Id).Id;
    (o || t.target) && (r.target = i);
  }
  const s = t.InfoKey;
  switch (!0) {
    case s != null: {
      r["info." + s] = n._InfoProxyOf(e.Id)[s] ?? null;
      break;
    }
    case (o || t.info): {
      r.info = { ...n._InfoProxyOf(e.Id) };
      break;
    }
  }
  return r;
}
function Ce(e, n, t) {
  const o = t === "all";
  if (f(`id:    ${e.Id}`), (o || t.kind) && f(`kind:  ${e.isItem ? "item" : "link"}`), (o || t.label) && f(`label: ${e.Label}`), e.isItem) {
    const s = e;
    if ((o || t.mime) && f(`mime:  ${s.Type}`), o || t.value) {
      const i = n._currentValueOf(e.Id);
      f(`value: ${i != null ? String(i) : "(none)"}`);
    }
  }
  if (e.isLink) {
    const s = n._TargetOf(e.Id).Id;
    (o || t.target) && f(`target: ${s}`);
  }
  const r = t.InfoKey;
  switch (!0) {
    case r != null: {
      const s = n._InfoProxyOf(e.Id)[r];
      f(`info.${r}: ${JSON.stringify(s ?? null)}`);
      break;
    }
    case (o || t.info): {
      const s = n._InfoProxyOf(e.Id);
      f(`info:  ${JSON.stringify(s)}`);
      break;
    }
  }
}
const We = 720 * 60 * 60 * 1e3;
function Ke(e) {
  const n = e.command("trash").description("trash inspection and cleanup");
  n.command("list").description("list all entries currently in the trash").option("--only <kind>", "filter by kind: items | links").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await Ae(r, t.only);
  }), n.command("purge-all").description("permanently delete every entry in the trash").action(async (t, o) => {
    const r = w(o.optsWithGlobals());
    await Ge(r);
  }), n.command("purge-expired").description("permanently delete trash entries older than --ttl milliseconds").option("--ttl <ms>", "TTL in milliseconds (default: 30 days)", String(We)).action(async (t, o) => {
    const r = w(o.optsWithGlobals()), s = b(t.ttl, "--ttl");
    if (s <= 0)
      throw new l(
        `'--ttl' must be a positive integer — got ${s}`,
        c.UsageError
      );
    await Je(r, s);
  });
}
async function Ae(e, n) {
  const t = n?.toLowerCase();
  if (t != null && !["item", "items", "link", "links"].includes(t))
    throw new l(
      `'--only' accepts 'items' or 'links' — got '${n}'`,
      c.UsageError
    );
  const o = await y(e);
  try {
    const r = o.Store.TrashItem, i = o.Store._innerEntriesOf(r.Id).filter((a) => {
      if (t == null)
        return !0;
      const d = a.isItem ? "item" : "link";
      return t === d + "s" || t === d;
    });
    if (e.Format === "json")
      h(e, i.map((a) => ({
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
    await p(o);
  }
}
async function Ge(e) {
  const n = await y(e);
  try {
    const t = n.Store.TrashItem, o = [...n.Store._innerEntriesOf(t.Id)];
    let r = 0;
    for (const s of o)
      try {
        s.purge(), r++;
      } catch {
      }
    e.Format === "json" ? h(e, { purged: r }) : f(`purged ${r} entr${r === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(n);
  }
}
async function Je(e, n) {
  const t = await y(e);
  try {
    const o = t.Store.purgeExpiredTrashEntries(n);
    e.Format === "json" ? h(e, { purged: o, ttlMs: n }) : f(`purged ${o} expired entr${o === 1 ? "y" : "ies"} from trash`);
  } finally {
    await p(t);
  }
}
function Me(e) {
  e.command("tree").description("tree display").command("show").description("display the store tree").option("--depth <n>", "maximum display depth (default: unlimited)").action(async (t, o) => {
    const r = w(o.optsWithGlobals()), s = t.depth != null ? b(t.depth, "--depth") : 1 / 0;
    await Ve(r, s);
  });
}
async function Ve(e, n) {
  const t = await y(e);
  try {
    if (e.Format === "json") {
      const o = W(t.Store, k, n, 0);
      h(e, { root: o });
    } else {
      f("root/");
      const o = W(t.Store, k, n, 0);
      for (let r = 0; r < o.length; r++) {
        const s = o[r], i = r === o.length - 1, a = H(
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
      o.length === 0 && f("  (empty)");
    }
  } finally {
    await p(t);
  }
}
function W(e, n, t, o) {
  if (o >= t)
    return [];
  const r = [];
  for (const s of e._innerEntriesOf(n)) {
    const i = s.isItem ? "item" : "link", a = s.isLink ? e._TargetOf(s.Id).Id : void 0, d = s.isItem && o + 1 < t ? W(e, s.Id, t, o + 1) : [];
    r.push({ Id: s.Id, Kind: i, Label: s.Label, TargetId: a, Children: d });
  }
  return r;
}
let E = "sds", X = "0.0.0";
function O(e, n = !1) {
  const t = new te(E);
  return t.description("shareable-data-store CLI").version(X, "--version", "print version").allowUnknownOption(!1).configureOutput({ writeErr: () => {
  } }).option("--server <url>", "WebSocket server URL (env: SDS_SERVER_URL)").option("--store <id>", "store identifier (env: SDS_STORE_ID)").option("--token <jwt>", "client JWT — read/write (env: SDS_TOKEN)").option("--admin-token <jwt>", "admin JWT (env: SDS_ADMIN_TOKEN)").option("--persistence-dir <path>", "directory for local SQLite files (env: SDS_PERSISTENCE_DIR)").option("--format <fmt>", "output format: text | json (default: text)").option("--on-error <action>", "error mode: stop | continue | ask (default: stop)"), we(t), Ie(t), Te(t, e), Ke(t), Me(t), n || (t.command("shell").description("start an interactive REPL").action(async (o, r) => {
    const s = w(r.optsWithGlobals());
    await ue((i) => V(i, s));
  }), t.option("--script <file>", "run commands from file (use - for stdin)").action(async (o) => {
    const r = w(o);
    if (o.script != null) {
      const s = await fe(r, o.script, V);
      process.exit(s);
    } else
      process.stdout.write(t.helpInformation()), process.exit(c.OK);
  }), t.addHelpCommand(!0)), t;
}
function G(e) {
  e.exitOverride(), e.configureOutput({ writeErr: () => {
  } });
  for (const n of e.commands)
    G(n);
}
function Be(e) {
  const n = [];
  return e.ServerURL != null && n.push("--server", e.ServerURL), e.StoreId != null && n.push("--store", e.StoreId), e.Token != null && n.push("--token", e.Token), e.AdminToken != null && n.push("--admin-token", e.AdminToken), n.push("--persistence-dir", e.PersistenceDir), e.Format !== "text" && n.push("--format", e.Format), n;
}
async function V(e, n) {
  if (e.length === 0)
    return c.OK;
  const { CleanArgv: t, InfoEntries: o } = _(e), r = n != null ? Be(n) : [], s = O(
    Object.entries(o).flatMap(([i, a]) => [
      `--info.${i}`,
      JSON.stringify(a)
    ]),
    !0
    // isSubContext: skip shell + root action so process.exit() can never fire
  );
  G(s);
  try {
    return await s.parseAsync(["node", E, ...r, ...t]), c.OK;
  } catch (i) {
    const a = i;
    return a.code === "commander.help" || a.code === "commander.helpDisplayed" || a.code === "commander.version" ? c.OK : a.code === "commander.unknownCommand" ? (process.stderr.write(`${E}: unknown command '${t[0]}' — try '${E} help'
`), c.UsageError) : a.code === "commander.unknownOption" || a.code === "commander.missingArgument" || a.code === "commander.missingMandatoryOptionValue" ? (process.stderr.write(`${E}: ${a.message}
`), c.UsageError) : i instanceof L ? (process.stderr.write(`${E}: ${i.message}
`), i.ExitCode) : i instanceof l ? (R(n ?? { Format: "text" }, i.message, i.ExitCode), i.ExitCode) : (R(n ?? { Format: "text" }, i.message ?? String(i)), c.GeneralError);
  }
}
async function qe() {
  const { CleanArgv: e, InfoEntries: n, InfoDeleteKeys: t } = _(process.argv.slice(2)), o = [
    ...Object.entries(n).flatMap(([s, i]) => [
      `--info.${s}`,
      JSON.stringify(i)
    ]),
    ...t.map((s) => `--info-delete.${s}`)
  ], r = O(o);
  G(r);
  try {
    await r.parseAsync(["node", E, ...e]);
  } catch (s) {
    const i = s;
    if ((i.code === "commander.help" || i.code === "commander.helpDisplayed" || i.code === "commander.version") && process.exit(c.OK), (i.code === "commander.unknownCommand" || i.code === "commander.unknownOption" || i.code === "commander.missingArgument" || i.code === "commander.missingMandatoryOptionValue") && (process.stderr.write(`${E}: ${i.message}

`), process.stderr.write(r.helpInformation()), process.exit(c.UsageError)), s instanceof L && (process.stderr.write(`${E}: ${s.message}
`), process.exit(s.ExitCode)), s instanceof l) {
      const d = w({});
      R(d, s.message, s.ExitCode), process.exit(s.ExitCode);
    }
    const a = w({});
    R(a, s.message ?? String(s)), process.exit(c.GeneralError);
  }
}
async function nt(e, n = "sds", t = "0.0.0") {
  return E = n, X = t, ie(e), qe();
}
export {
  nt as runCommand
};
