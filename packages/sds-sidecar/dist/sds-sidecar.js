import A from "node:fs/promises";
import { Command as K } from "commander";
import { SDS_DesktopPersistenceProvider as C } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as B } from "@rozek/sds-sync-engine";
import I from "node:path";
import V from "node:os";
import { TrashId as T } from "@rozek/sds-core";
const G = "0.0.11", N = {
  version: G
}, y = {
  OK: 0,
  // success (clean shutdown)
  GeneralError: 1,
  // unspecified runtime error
  UsageError: 2,
  // bad arguments or missing required option
  NotFound: 3,
  // store or config file not found
  Unauthorized: 4,
  // WebSocket or HTTP connection error
  Forbidden: 6
  // token valid but store access denied (close code 4003)
};
class h extends Error {
  ExitCode;
  constructor(e, t = y.UsageError) {
    super(e), this.name = "SDS_SidecarError", this.ExitCode = t;
  }
}
function L(n) {
  switch (!0) {
    case n === "change":
      return { Kind: "change" };
    case n === "create":
      return { Kind: "create" };
    case n === "delete":
      return { Kind: "delete" };
    case n === "value":
      return { Kind: "value" };
    case n.startsWith("value:"): {
      const e = n.slice(6).trim();
      if (e.length === 0)
        throw new h(`invalid --on value '${n}' — expected 'value:<mime-glob>'`);
      return { Kind: "value", MIMEGlob: e };
    }
    case n.startsWith("info:"): {
      const e = n.slice(5), t = e.indexOf("=");
      if (t < 1)
        throw new h(
          `invalid --on value '${n}' — expected 'info:<key>=<value>'`
        );
      const o = e.slice(0, t).trim(), r = e.slice(t + 1);
      if (o.length === 0)
        throw new h(
          `invalid --on value '${n}' — info key must not be empty`
        );
      return { Kind: "info", Key: o, Value: r };
    }
    default:
      throw new h(
        `unknown trigger '${n}' — valid values: change, create, delete, value, value:<mime-glob>, info:<key>=<value>`
      );
  }
}
function F(n, e) {
  if (n == null || typeof n != "object" || Array.isArray(n))
    throw new h(`WebHooks[${e}]: expected an object`);
  const t = n;
  if (typeof t.URL != "string" || t.URL.trim().length === 0)
    throw new h(`WebHooks[${e}].URL: expected a non-empty string`);
  const o = t.URL.trim(), r = t.Topic != null ? String(t.Topic) : void 0, s = t.Watch != null ? String(t.Watch) : void 0, c = t.maxDepth != null ? Number(t.maxDepth) : void 0;
  if (c != null && (!Number.isInteger(c) || c < 0))
    throw new h(`WebHooks[${e}].maxDepth: expected a non-negative integer`);
  const i = t.on;
  if (!Array.isArray(i) || i.length === 0)
    throw new h(`WebHooks[${e}].on: expected a non-empty array`);
  const f = i.map((l, u) => {
    try {
      return L(String(l));
    } catch (S) {
      throw new h(`WebHooks[${e}].on[${u}]: ${S.message}`);
    }
  });
  return { URL: o, Topic: r, Watch: s, maxDepth: c, on: f };
}
async function j(n) {
  let e = {};
  const t = n.config;
  if (t != null) {
    let p;
    try {
      p = await A.readFile(I.resolve(t), "utf-8");
    } catch (E) {
      throw new h(
        `cannot read config file '${t}': ${E.message}`,
        y.NotFound
      );
    }
    try {
      e = JSON.parse(p);
    } catch (E) {
      throw new h(
        `config file '${t}' contains invalid JSON: ${E.message}`
      );
    }
  }
  const o = n.server ?? process.env.SDS_SERVER_URL ?? e.ServerURL, r = n.store ?? process.env.SDS_STORE_ID ?? e.StoreId, s = n.token ?? process.env.SDS_TOKEN ?? e.Token, c = n.persistenceDir ?? process.env.SDS_PERSISTENCE_DIR ?? e.PersistenceDir, i = n.webhookToken ?? process.env.SDS_WEBHOOK_TOKEN ?? e.WebHookToken, f = n.onAuthError ?? process.env.SDS_ON_AUTH_ERROR ?? e.onAuthError;
  if (o == null || o.trim().length === 0)
    throw new h(
      'no server URL — set SDS_SERVER_URL, use --server, or set "ServerURL" in config file'
    );
  if (!/^wss?:\/\//.test(o))
    throw new h(
      `invalid server URL '${o}' — must start with 'ws://' or 'wss://'`
    );
  if (r == null || r.trim().length === 0)
    throw new h(
      'no store ID — set SDS_STORE_ID, use --store, or set "StoreId" in config file'
    );
  if (s == null || s.trim().length === 0)
    throw new h(
      'no token — set SDS_TOKEN, use --token, or set "Token" in config file'
    );
  const l = e.reconnect ?? {}, u = Number(n.reconnectInitial ?? l.initialDelay ?? 1e3), S = Number(n.reconnectMax ?? l.maxDelay ?? 6e4), d = Number(n.reconnectJitter ?? l.Jitter ?? 0.1);
  if (!isFinite(u) || u < 100)
    throw new h("--reconnect-initial must be at least 100 ms");
  if (!isFinite(S) || S < u)
    throw new h("--reconnect-max must be >= --reconnect-initial");
  if (!isFinite(d) || d < 0 || d > 1)
    throw new h("--reconnect-jitter must be between 0 and 1");
  const w = c != null ? I.resolve(c) : I.join(V.homedir(), ".sds"), v = [], m = n.webhookUrl;
  if (m != null) {
    const p = n.on ?? [];
    if (p.length === 0)
      throw new h("--webhook-url given without any --on trigger");
    const E = p.map((O) => L(O)), P = n.topic, M = n.watch, $ = n.depth != null ? Number(n.depth) : void 0;
    if ($ != null && (!Number.isInteger($) || $ < 0))
      throw new h("--depth must be a non-negative integer");
    v.push({ URL: m, Topic: P, Watch: M, maxDepth: $, on: E });
  }
  const a = [], g = e.WebHooks;
  if (Array.isArray(g))
    for (let p = 0; p < g.length; p++)
      a.push(F(g[p], p));
  const k = [...v, ...a];
  return {
    ServerURL: o.trim(),
    StoreId: r.trim(),
    Token: s.trim(),
    PersistenceDir: w,
    WebHookToken: i,
    onAuthError: f,
    reconnect: { initialDelay: u, maxDelay: S, Jitter: d },
    WebHooks: k
  };
}
function J(n, e) {
  const t = e.replace(/[^a-zA-Z0-9_-]/g, "_");
  return I.join(n, `${t}.db`);
}
const U = 1, R = 2, z = 3, q = 5, b = 32;
function W(...n) {
  const e = n.reduce((r, s) => r + s.byteLength, 0), t = new Uint8Array(e);
  let o = 0;
  for (const r of n)
    t.set(r, o), o += r.byteLength;
  return t;
}
function _(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function H(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
function D(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
class Q {
  StoreId;
  #t = "disconnected";
  #e = void 0;
  #r = "";
  #i = "";
  // exponential backoff state
  #o = 0;
  #s = void 0;
  // reconnect options (constant after construction)
  #a;
  #l;
  #h;
  // value-chunk reassembly buffer: hash → { total, chunks }
  #n = /* @__PURE__ */ new Map();
  // subscriber sets
  #d = /* @__PURE__ */ new Set();
  #u = /* @__PURE__ */ new Set();
  #f = /* @__PURE__ */ new Set();
  #p = /* @__PURE__ */ new Set();
  constructor(e, t) {
    this.StoreId = e, this.#a = t.initialDelay, this.#l = t.maxDelay, this.#h = t.Jitter;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return this.#t;
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SidecarNetworkProvider: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return this.#r = e, this.#i = t.Token, this.#o = 0, this.#S();
  }
  /**** disconnect ****/
  disconnect() {
    this.#y(), this.#c("disconnected"), this.#e?.close(), this.#e = void 0, this.#n.clear();
  }
  /**** sendPatch ****/
  sendPatch(e) {
    this.#g(D(U, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const o = _(e);
    this.#g(D(R, W(o, t)));
  }
  /**** requestValue ****/
  requestValue(e) {
    this.#g(D(z, _(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return this.#d.add(e), () => {
      this.#d.delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return this.#u.add(e), () => {
      this.#u.delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return this.#f.add(e), () => {
      this.#f.delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                              auth-error hook                               //
  //----------------------------------------------------------------------------//
  /**** onAuthError — called when the server closes with 4001 or 4003; no reconnect follows ****/
  onAuthError(e) {
    return this.#p.add(e), () => {
      this.#p.delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  private                                   //
  //----------------------------------------------------------------------------//
  /**** #doConnect ****/
  #S() {
    return new Promise((e, t) => {
      const r = `${this.#r.replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(this.#i)}`, s = new WebSocket(r);
      s.binaryType = "arraybuffer", this.#e = s, this.#c("connecting"), s.onopen = () => {
        this.#o = 0, this.#c("connected"), e();
      }, s.onerror = () => {
        this.#t === "connecting" && t(new Error("WebSocket connection failed"));
      }, s.onclose = (c) => {
        if (this.#e = void 0, c.code === 4001 || c.code === 4003) {
          this.#n.clear(), this.#c("disconnected");
          for (const i of this.#p)
            try {
              i(c.code, c.reason);
            } catch {
            }
          return;
        }
        this.#t !== "disconnected" && (this.#n.clear(), this.#c("reconnecting"), this.#w());
      }, s.onmessage = (c) => {
        c.data instanceof ArrayBuffer && this.#b(new Uint8Array(c.data));
      };
    });
  }
  /**** #send ****/
  #g(e) {
    this.#e?.readyState === WebSocket.OPEN && this.#e.send(e);
  }
  /**** #setState ****/
  #c(e) {
    if (this.#t !== e) {
      this.#t = e;
      for (const t of this.#f)
        try {
          t(e);
        } catch {
        }
    }
  }
  /**** #scheduleReconnect — exponential backoff capped at MaxDelay, with jitter ****/
  #w() {
    const e = Math.min(this.#a * 2 ** this.#o, this.#l), t = e * this.#h * (Math.random() * 2 - 1), o = Math.max(0, Math.round(e + t));
    this.#o++, this.#s = setTimeout(() => {
      this.#t === "reconnecting" && this.#S().catch(() => {
      });
    }, o);
  }
  /**** #clearReconnectTimer ****/
  #y() {
    this.#s != null && (clearTimeout(this.#s), this.#s = void 0);
  }
  /**** #handleFrame — parses incoming binary frames and dispatches to handlers ****/
  #b(e) {
    if (e.byteLength < 1)
      return;
    const t = e[0], o = e.slice(1);
    switch (!0) {
      case t === U: {
        for (const r of this.#d)
          try {
            r(o);
          } catch {
          }
        break;
      }
      case t === R: {
        if (o.byteLength < b)
          return;
        const r = H(o.slice(0, b)), s = o.slice(b);
        for (const c of this.#u)
          try {
            c(r, s);
          } catch {
          }
        break;
      }
      case t === q: {
        if (o.byteLength < b + 8)
          return;
        const r = H(o.slice(0, b)), s = new DataView(o.buffer, o.byteOffset + b, 8), c = s.getUint32(0, !1), i = s.getUint32(4, !1), f = o.slice(b + 8);
        let l = this.#n.get(r);
        if (l == null && (l = { total: i, chunks: /* @__PURE__ */ new Map() }, this.#n.set(r, l)), l.chunks.set(c, f), l.chunks.size < l.total)
          break;
        let u = !0;
        for (let d = 0; d < l.total; d++)
          if (!l.chunks.has(d)) {
            u = !1;
            break;
          }
        if (!u) {
          this.#n.delete(r);
          break;
        }
        this.#n.delete(r);
        const S = W(
          ...Array.from({ length: l.total }, (d, w) => l.chunks.get(w))
        );
        for (const d of this.#u)
          try {
            d(r, S);
          } catch {
          }
        break;
      }
    }
  }
}
const Z = 1e4;
function X(n, e) {
  const t = e.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${t}$`, "i").test(n);
}
class Y {
  #t;
  #e;
  #r;
  #i;
  constructor(e, t, o, r) {
    this.#t = e, this.#e = t, this.#i = o, this.#r = r;
  }
  /**** processChangeSet — evaluates the changeset against all rules; fires matching hooks ****/
  async processChangeSet(e, t) {
    if (this.#t.length === 0)
      return;
    const o = Object.keys(t);
    if (o.length === 0)
      return;
    const r = [];
    for (const s of this.#t) {
      const c = this.#o(s, t, o);
      for (const { Trigger: i, EntryIds: f } of c) {
        const l = {
          StoreId: this.#i,
          Trigger: ee(i),
          changedEntries: f,
          Timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        s.Topic != null && (l.Topic = s.Topic), r.push(this.#h(s.URL, l));
      }
    }
    await Promise.allSettled(r);
  }
  /**** #matchConfig — returns each trigger that fires for this config + the matching IDs ****/
  #o(e, t, o) {
    const r = e.Watch != null ? this.#a(e.Watch) : void 0, s = r != null ? o.filter(
      (i) => this.#l(i, r, e.maxDepth ?? 1 / 0)
    ) : o;
    if (s.length === 0)
      return [];
    const c = [];
    for (const i of e.on) {
      const f = this.#s(i, s, t);
      f.length > 0 && c.push({ Trigger: i, EntryIds: f });
    }
    return c;
  }
  /**** #filterByTrigger — returns the entry IDs that satisfy the given trigger ****/
  #s(e, t, o) {
    switch (e.Kind) {
      case "change":
        return t;
      case "create":
        return t.filter((r) => {
          if (!o[r]?.has("outerItem"))
            return !1;
          const c = this.#e.EntryWithId(r);
          if (c == null)
            return !1;
          const i = c.outerItemId;
          return i != null && i !== T;
        });
      case "delete":
        return t.filter((r) => {
          if (!o[r]?.has("outerItem"))
            return !1;
          const c = this.#e.EntryWithId(r);
          return c == null ? !0 : c.outerItemId === T;
        });
      case "value":
        return e.MIMEGlob == null ? t.filter((r) => o[r]?.has("Value")) : t.filter((r) => {
          if (!o[r]?.has("Value"))
            return !1;
          const s = this.#e.EntryWithId(r);
          return s == null || !s.isItem ? !1 : X(s.Type, e.MIMEGlob);
        });
      case "info": {
        const r = `Info.${e.Key}`;
        return t.filter((s) => {
          if (!o[s]?.has(r))
            return !1;
          const c = this.#e.EntryWithId(s);
          if (c == null)
            return !1;
          const i = c.Info[e.Key];
          return String(i) === e.Value;
        });
      }
      default:
        return [];
    }
  }
  /**** #resolveWatch — verifies that the watch UUID exists in the store ****/
  // Note: only direct UUIDs are supported; link targets are NOT automatically
  // included in the watched subtree even if they are linked from within it.
  #a(e) {
    return this.#e.EntryWithId(e) != null ? e : void 0;
  }
  /**** #isInWatchedSubtree — true when EntryId is inside WatchId at depth <= MaxDepth ****/
  #l(e, t, o) {
    if (e === t)
      return !0;
    const r = this.#e.EntryWithId(e);
    if (r == null)
      return !1;
    const s = r.outerItemChain;
    for (let c = 0; c < s.length; c++)
      if (s[c].Id === t)
        return c + 1 <= o;
    return !1;
  }
  /**** #fireWebHook — sends an HTTP POST with the JSON payload and bearer token ****/
  async #h(e, t) {
    const o = {
      "Content-Type": "application/json"
    };
    this.#r != null && (o.Authorization = `Bearer ${this.#r}`);
    try {
      const r = await fetch(e, {
        method: "POST",
        headers: o,
        body: JSON.stringify(t),
        signal: AbortSignal.timeout(Z)
      });
      r.ok || process.stderr.write(
        `[sds-sidecar] webhook ${e} returned ${r.status} ${r.statusText}
`
      );
    } catch (r) {
      process.stderr.write(
        `[sds-sidecar] webhook ${e} failed: ${r.message}
`
      );
    }
  }
}
function ee(n) {
  switch (n.Kind) {
    case "change":
      return "change";
    case "create":
      return "create";
    case "delete":
      return "delete";
    case "value":
      return n.MIMEGlob != null ? `value:${n.MIMEGlob}` : "value";
    case "info":
      return `info:${n.Key}=${n.Value}`;
  }
}
function te(n) {
  const e = new K(n);
  return e.description("shareable-data-store sidecar — persistent sync + webhook notifications").version(N.version, "--version", "print version").allowUnknownOption(!1).configureOutput({ writeErr: () => {
  } }).argument("[ws-url]", "WebSocket server URL (env: SDS_SERVER_URL)").argument("[store-id]", "store identifier     (env: SDS_STORE_ID)").option("--token <jwt>", "JWT for the WebSocket server (env: SDS_TOKEN)").option("--config <file>", "JSON config file path").option("--persistence-dir <path>", "directory for local SQLite DB (env: SDS_PERSISTENCE_DIR)").option("--webhook-url <url>", "webhook endpoint URL").option("--webhook-token <token>", "bearer token for webhook calls (env: SDS_WEBHOOK_TOKEN)").option("--topic <string>", "opaque string echoed in the webhook payload").option("--watch <uuid>", "UUID of the subtree root to observe").option("--depth <n>", "max watch depth (default: unlimited)").option("--on <trigger>", "trigger condition (repeatable)", ne, []).option("--on-auth-error <url>", "webhook URL to notify on auth errors").option("--reconnect-initial <ms>", "initial reconnect delay in ms (default: 1000)").option("--reconnect-max <ms>", "max reconnect delay in ms     (default: 60000)").option("--reconnect-jitter <f>", "jitter fraction 0..1          (default: 0.1)"), e;
}
function ne(n, e) {
  return [...e, n];
}
async function ue(n, e = "sds-sidecar") {
  const t = te(e);
  t.exitOverride(), t.configureOutput({ writeErr: () => {
  } });
  let o;
  try {
    await t.parseAsync(process.argv), o = { args: t.args, opts: t.opts() };
  } catch (a) {
    const g = a;
    switch (!0) {
      case g.code === "commander.helpDisplayed":
      case g.code === "commander.version":
        process.exit(y.OK);
      default:
        process.stderr.write(`${e}: ${g.message}

`), process.stderr.write(t.helpInformation()), process.exit(y.UsageError);
    }
  }
  const [r, s] = o.args, c = {
    ...o.opts,
    ...r != null ? { server: r } : {},
    ...s != null ? { store: s } : {}
  };
  let i;
  try {
    i = await j(c);
  } catch (a) {
    throw a instanceof h && (process.stderr.write(`${e}: ${a.message}
`), process.exit(a.ExitCode)), a;
  }
  await A.mkdir(i.PersistenceDir, { recursive: !0 });
  const f = J(i.PersistenceDir, i.StoreId), l = new C(f, i.StoreId);
  let u;
  try {
    const a = await l.loadSnapshot();
    u = a != null ? n.fromBinary(a) : n.fromScratch();
  } catch (a) {
    process.stderr.write(
      `${e}: failed to load store '${i.StoreId}': ${a.message}
`
    ), await l.close().catch(() => {
    }), process.exit(y.GeneralError);
  }
  const S = new Q(i.StoreId, i.reconnect), d = i.WebHooks.length > 0 ? new Y(i.WebHooks, u, i.StoreId, i.WebHookToken) : void 0, w = new B(u, {
    PersistenceProvider: l,
    NetworkProvider: S,
    BroadcastChannel: !1
  });
  await w.start();
  const v = d != null ? u.onChangeInvoke((a, g) => {
    d.processChangeSet(a, g).catch((k) => {
      process.stderr.write(
        `[${e}] webhook error: ${k.message}
`
      );
    });
  }) : () => {
  };
  S.onAuthError(async (a, g) => {
    const k = a === 4001 ? "Unauthorized" : "Forbidden";
    process.stderr.write(
      `[${e}] AUTH ERROR ${a} ${k}: ${g || "(no reason given)"}
[${e}] reconnect suppressed — check SDS_TOKEN or --token
`
    ), i.onAuthError != null && await re(i.onAuthError, i.WebHookToken, {
      StoreId: i.StoreId,
      ServerURL: i.ServerURL,
      Code: a,
      Reason: g || k
    }, e).catch((p) => {
      process.stderr.write(
        `[${e}] auth-error webhook failed: ${p.message ?? p}
`
      );
    }), await x(w, v, l), process.exit(a === 4001 ? y.Unauthorized : y.Forbidden);
  }), process.stderr.write(
    `[${e}] connecting to ${i.ServerURL} (store: ${i.StoreId})
`
  );
  try {
    await w.connectTo(i.ServerURL, { Token: i.Token });
  } catch (a) {
    process.stderr.write(
      `[${e}] initial connection failed: ${a.message}
`
    );
  }
  S.onConnectionChange((a) => {
    switch (a) {
      case "connected":
        process.stderr.write(`[${e}] connected
`);
        break;
      case "reconnecting":
        process.stderr.write(`[${e}] disconnected — reconnecting…
`);
        break;
      case "disconnected":
        process.stderr.write(`[${e}] disconnected
`);
        break;
    }
  });
  const m = async (a) => {
    process.stderr.write(`
[${e}] received ${a} — shutting down
`), await x(w, v, l), process.exit(y.OK);
  };
  process.once("SIGINT", () => {
    m("SIGINT").catch(() => process.exit(1));
  }), process.once("SIGTERM", () => {
    m("SIGTERM").catch(() => process.exit(1));
  }), process.stderr.write(`[${e}] running (press Ctrl+C to stop)
`);
}
async function x(n, e, t) {
  e();
  try {
    await n.stop();
  } catch {
  }
  try {
    await t.close();
  } catch {
  }
}
async function re(n, e, t, o) {
  const r = { "Content-Type": "application/json" };
  e != null && (r.Authorization = `Bearer ${e}`);
  const s = await fetch(n, {
    method: "POST",
    headers: r,
    body: JSON.stringify(t),
    signal: AbortSignal.timeout(1e4)
  });
  s.ok || process.stderr.write(
    `[${o}] auth-error webhook returned ${s.status} ${s.statusText}
`
  );
}
export {
  ue as runSidecar
};
