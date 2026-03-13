import L from "node:fs/promises";
import { Command as V } from "commander";
import { SDS_DesktopPersistenceProvider as B } from "@rozek/sds-persistence-node";
import { SDS_SyncEngine as C } from "@rozek/sds-sync-engine";
import D from "node:path";
import G from "node:os";
import { TrashId as R } from "@rozek/sds-core";
const j = "0.0.13", F = {
  version: j
}, b = {
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
  constructor(e, t = b.UsageError) {
    super(e), this.name = "SDS_SidecarError", this.ExitCode = t;
  }
}
function P(r) {
  switch (!0) {
    case r === "change":
      return { Kind: "change" };
    case r === "create":
      return { Kind: "create" };
    case r === "delete":
      return { Kind: "delete" };
    case r === "value":
      return { Kind: "value" };
    case r.startsWith("value:"): {
      const e = r.slice(6).trim();
      if (e.length === 0)
        throw new h(`invalid --on value '${r}' — expected 'value:<mime-glob>'`);
      return { Kind: "value", MIMEGlob: e };
    }
    case r.startsWith("info:"): {
      const e = r.slice(5), t = e.indexOf("=");
      if (t < 1)
        throw new h(
          `invalid --on value '${r}' — expected 'info:<key>=<value>'`
        );
      const o = e.slice(0, t).trim(), n = e.slice(t + 1);
      if (o.length === 0)
        throw new h(
          `invalid --on value '${r}' — info key must not be empty`
        );
      return { Kind: "info", Key: o, Value: n };
    }
    default:
      throw new h(
        `unknown trigger '${r}' — valid values: change, create, delete, value, value:<mime-glob>, info:<key>=<value>`
      );
  }
}
function J(r, e) {
  if (r == null || typeof r != "object" || Array.isArray(r))
    throw new h(`WebHooks[${e}]: expected an object`);
  const t = r;
  if (typeof t.URL != "string" || t.URL.trim().length === 0)
    throw new h(`WebHooks[${e}].URL: expected a non-empty string`);
  const o = t.URL.trim(), n = t.Topic != null ? String(t.Topic) : void 0, s = t.Watch != null ? String(t.Watch) : void 0, c = t.maxDepth != null ? Number(t.maxDepth) : void 0;
  if (c != null && (!Number.isInteger(c) || c < 0))
    throw new h(`WebHooks[${e}].maxDepth: expected a non-negative integer`);
  const i = t.on;
  if (!Array.isArray(i) || i.length === 0)
    throw new h(`WebHooks[${e}].on: expected a non-empty array`);
  const f = i.map((l, u) => {
    try {
      return P(String(l));
    } catch (p) {
      throw new h(`WebHooks[${e}].on[${u}]: ${p.message}`);
    }
  });
  return { URL: o, Topic: n, Watch: s, maxDepth: c, on: f };
}
async function N(r) {
  let e = {};
  const t = r.config;
  if (t != null) {
    let w;
    try {
      w = await L.readFile(D.resolve(t), "utf-8");
    } catch (v) {
      throw new h(
        `cannot read config file '${t}': ${v.message}`,
        b.NotFound
      );
    }
    try {
      e = JSON.parse(w);
    } catch (v) {
      throw new h(
        `config file '${t}' contains invalid JSON: ${v.message}`
      );
    }
  }
  const o = r.server ?? process.env.SDS_SERVER_URL ?? e.ServerURL, n = r.store ?? process.env.SDS_STORE_ID ?? e.StoreId, s = r.token ?? process.env.SDS_TOKEN ?? e.Token, c = r.persistenceDir ?? process.env.SDS_PERSISTENCE_DIR ?? e.PersistenceDir, i = r.webhookToken ?? process.env.SDS_WEBHOOK_TOKEN ?? e.WebHookToken, f = r.onAuthError ?? process.env.SDS_ON_AUTH_ERROR ?? e.onAuthError, l = r.verbose === !0 || process.env.SDS_VERBOSE === "1" || e.Verbose === !0;
  if (o == null || o.trim().length === 0)
    throw new h(
      'no server URL — set SDS_SERVER_URL, use --server, or set "ServerURL" in config file'
    );
  if (!/^wss?:\/\//.test(o))
    throw new h(
      `invalid server URL '${o}' — must start with 'ws://' or 'wss://'`
    );
  if (n == null || n.trim().length === 0)
    throw new h(
      'no store ID — set SDS_STORE_ID, use --store, or set "StoreId" in config file'
    );
  if (s == null || s.trim().length === 0)
    throw new h(
      'no token — set SDS_TOKEN, use --token, or set "Token" in config file'
    );
  const u = e.reconnect ?? {}, p = Number(r.reconnectInitial ?? u.initialDelay ?? 1e3), g = Number(r.reconnectMax ?? u.maxDelay ?? 6e4), S = Number(r.reconnectJitter ?? u.Jitter ?? 0.1);
  if (!isFinite(p) || p < 100)
    throw new h("--reconnect-initial must be at least 100 ms");
  if (!isFinite(g) || g < p)
    throw new h("--reconnect-max must be >= --reconnect-initial");
  if (!isFinite(S) || S < 0 || S > 1)
    throw new h("--reconnect-jitter must be between 0 and 1");
  const m = c != null ? D.resolve(c) : D.join(G.homedir(), ".sds"), $ = [], a = r.webhookUrl;
  if (a != null) {
    const w = r.on ?? [];
    if (w.length === 0)
      throw new h("--webhook-url given without any --on trigger");
    const v = w.map((K) => P(K)), M = r.topic, O = r.watch, I = r.depth != null ? Number(r.depth) : void 0;
    if (I != null && (!Number.isInteger(I) || I < 0))
      throw new h("--depth must be a non-negative integer");
    $.push({ URL: a, Topic: M, Watch: O, maxDepth: I, on: v });
  }
  const d = [], y = e.WebHooks;
  if (Array.isArray(y))
    for (let w = 0; w < y.length; w++)
      d.push(J(y[w], w));
  const k = [...$, ...d];
  return {
    ServerURL: o.trim(),
    StoreId: n.trim(),
    Token: s.trim(),
    PersistenceDir: m,
    WebHookToken: i,
    onAuthError: f,
    Verbose: l,
    reconnect: { initialDelay: p, maxDelay: g, Jitter: S },
    WebHooks: k
  };
}
function z(r, e) {
  const t = e.replace(/[^a-zA-Z0-9_-]/g, "_");
  return D.join(r, `${t}.db`);
}
const U = 1, _ = 2, q = 3, Q = 5, E = 32;
function W(...r) {
  const e = r.reduce((n, s) => n + s.byteLength, 0), t = new Uint8Array(e);
  let o = 0;
  for (const n of r)
    t.set(n, o), o += n.byteLength;
  return t;
}
function H(r) {
  const e = new Uint8Array(r.length / 2);
  for (let t = 0; t < r.length; t += 2)
    e[t / 2] = parseInt(r.slice(t, t + 2), 16);
  return e;
}
function x(r) {
  return Array.from(r).map((e) => e.toString(16).padStart(2, "0")).join("");
}
function T(r, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = r, t.set(e, 1), t;
}
class Z {
  StoreId;
  #t = "disconnected";
  #e = void 0;
  #n = "";
  #i = "";
  // exponential backoff state
  #o = 0;
  #s = void 0;
  // reconnect options (constant after construction)
  #a;
  #l;
  #h;
  // value-chunk reassembly buffer: hash → { total, chunks }
  #r = /* @__PURE__ */ new Map();
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
    return this.#n = e, this.#i = t.Token, this.#o = 0, this.#S();
  }
  /**** disconnect ****/
  disconnect() {
    this.#y(), this.#c("disconnected"), this.#e?.close(), this.#e = void 0, this.#r.clear();
  }
  /**** sendPatch ****/
  sendPatch(e) {
    this.#g(T(U, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const o = H(e);
    this.#g(T(_, W(o, t)));
  }
  /**** requestValue ****/
  requestValue(e) {
    this.#g(T(q, H(e)));
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
      const n = `${this.#n.replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(this.#i)}`, s = new WebSocket(n);
      s.binaryType = "arraybuffer", this.#e = s, this.#c("connecting"), s.onopen = () => {
        this.#o = 0, this.#c("connected"), e();
      }, s.onerror = () => {
        this.#t === "connecting" && t(new Error("WebSocket connection failed"));
      }, s.onclose = (c) => {
        if (this.#e = void 0, c.code === 4001 || c.code === 4003) {
          this.#r.clear(), this.#c("disconnected");
          for (const i of this.#p)
            try {
              i(c.code, c.reason);
            } catch {
            }
          return;
        }
        this.#t !== "disconnected" && (this.#r.clear(), this.#c("reconnecting"), this.#w());
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
        for (const n of this.#d)
          try {
            n(o);
          } catch {
          }
        break;
      }
      case t === _: {
        if (o.byteLength < E)
          return;
        const n = x(o.slice(0, E)), s = o.slice(E);
        for (const c of this.#u)
          try {
            c(n, s);
          } catch {
          }
        break;
      }
      case t === Q: {
        if (o.byteLength < E + 8)
          return;
        const n = x(o.slice(0, E)), s = new DataView(o.buffer, o.byteOffset + E, 8), c = s.getUint32(0, !1), i = s.getUint32(4, !1), f = o.slice(E + 8);
        let l = this.#r.get(n);
        if (l == null && (l = { total: i, chunks: /* @__PURE__ */ new Map() }, this.#r.set(n, l)), l.chunks.set(c, f), l.chunks.size < l.total)
          break;
        let u = !0;
        for (let g = 0; g < l.total; g++)
          if (!l.chunks.has(g)) {
            u = !1;
            break;
          }
        if (!u) {
          this.#r.delete(n);
          break;
        }
        this.#r.delete(n);
        const p = W(
          ...Array.from({ length: l.total }, (g, S) => l.chunks.get(S))
        );
        for (const g of this.#u)
          try {
            g(n, p);
          } catch {
          }
        break;
      }
    }
  }
}
const X = 1e4;
function Y(r, e) {
  const t = e.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${t}$`, "i").test(r);
}
class ee {
  #t;
  #e;
  #n;
  #i;
  constructor(e, t, o, n) {
    this.#t = e, this.#e = t, this.#i = o, this.#n = n;
  }
  /**** processChangeSet — evaluates the changeset against all rules; fires matching hooks ****/
  async processChangeSet(e, t) {
    if (this.#t.length === 0)
      return;
    const o = Object.keys(t);
    if (o.length === 0)
      return;
    const n = [];
    for (const s of this.#t) {
      const c = this.#o(s, t, o);
      for (const { Trigger: i, EntryIds: f } of c) {
        const l = {
          StoreId: this.#i,
          Trigger: te(i),
          changedEntries: f,
          Timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        s.Topic != null && (l.Topic = s.Topic), n.push(this.#h(s.URL, l));
      }
    }
    await Promise.allSettled(n);
  }
  /**** #matchConfig — returns each trigger that fires for this config + the matching IDs ****/
  #o(e, t, o) {
    const n = e.Watch != null ? this.#a(e.Watch) : void 0, s = n != null ? o.filter(
      (i) => this.#l(i, n, e.maxDepth ?? 1 / 0)
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
        return t.filter((n) => {
          if (!o[n]?.has("outerItem"))
            return !1;
          const c = this.#e.EntryWithId(n);
          if (c == null)
            return !1;
          const i = c.outerItemId;
          return i != null && i !== R;
        });
      case "delete":
        return t.filter((n) => {
          if (!o[n]?.has("outerItem"))
            return !1;
          const c = this.#e.EntryWithId(n);
          return c == null ? !0 : c.outerItemId === R;
        });
      case "value":
        return e.MIMEGlob == null ? t.filter((n) => o[n]?.has("Value")) : t.filter((n) => {
          if (!o[n]?.has("Value"))
            return !1;
          const s = this.#e.EntryWithId(n);
          return s == null || !s.isItem ? !1 : Y(s.Type, e.MIMEGlob);
        });
      case "info": {
        const n = `Info.${e.Key}`;
        return t.filter((s) => {
          if (!o[s]?.has(n))
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
    const n = this.#e.EntryWithId(e);
    if (n == null)
      return !1;
    const s = n.outerItemChain;
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
    this.#n != null && (o.Authorization = `Bearer ${this.#n}`);
    try {
      const n = await fetch(e, {
        method: "POST",
        headers: o,
        body: JSON.stringify(t),
        signal: AbortSignal.timeout(X)
      });
      n.ok || process.stderr.write(
        `[sds-sidecar] webhook ${e} returned ${n.status} ${n.statusText}
`
      );
    } catch (n) {
      process.stderr.write(
        `[sds-sidecar] webhook ${e} failed: ${n.message}
`
      );
    }
  }
}
function te(r) {
  switch (r.Kind) {
    case "change":
      return "change";
    case "create":
      return "create";
    case "delete":
      return "delete";
    case "value":
      return r.MIMEGlob != null ? `value:${r.MIMEGlob}` : "value";
    case "info":
      return `info:${r.Key}=${r.Value}`;
  }
}
function re(r) {
  const e = new V(r);
  return e.description("shareable-data-store sidecar — persistent sync + webhook notifications").version(F.version, "--version", "print version").allowUnknownOption(!1).configureOutput({ writeErr: () => {
  } }).argument("[ws-url]", "WebSocket server URL (env: SDS_SERVER_URL)").argument("[store-id]", "store identifier     (env: SDS_STORE_ID)").option("--token <jwt>", "JWT for the WebSocket server (env: SDS_TOKEN)").option("--config <file>", "JSON config file path").option("--persistence-dir <path>", "directory for local SQLite DB (env: SDS_PERSISTENCE_DIR)").option("--webhook-url <url>", "webhook endpoint URL").option("--webhook-token <token>", "bearer token for webhook calls (env: SDS_WEBHOOK_TOKEN)").option("--topic <string>", "opaque string echoed in the webhook payload").option("--watch <uuid>", "UUID of the subtree root to observe").option("--depth <n>", "max watch depth (default: unlimited)").option("--on <trigger>", "trigger condition (repeatable)", ne, []).option("--on-auth-error <url>", "webhook URL to notify on auth errors").option("--verbose", "log incoming patches and store changes (env: SDS_VERBOSE=1)").option("--reconnect-initial <ms>", "initial reconnect delay in ms (default: 1000)").option("--reconnect-max <ms>", "max reconnect delay in ms     (default: 60000)").option("--reconnect-jitter <f>", "jitter fraction 0..1          (default: 0.1)"), e;
}
function ne(r, e) {
  return [...e, r];
}
async function de(r, e = "sds-sidecar") {
  const t = re(e);
  t.exitOverride(), t.configureOutput({ writeErr: () => {
  } });
  let o;
  try {
    await t.parseAsync(process.argv), o = { args: t.args, opts: t.opts() };
  } catch (a) {
    const d = a;
    switch (!0) {
      case d.code === "commander.helpDisplayed":
      case d.code === "commander.version":
        process.exit(b.OK);
      default:
        process.stderr.write(`${e}: ${d.message}

`), process.stderr.write(t.helpInformation()), process.exit(b.UsageError);
    }
  }
  const [n, s] = o.args, c = {
    ...o.opts,
    ...n != null ? { server: n } : {},
    ...s != null ? { store: s } : {}
  };
  let i;
  try {
    i = await N(c);
  } catch (a) {
    throw a instanceof h && (process.stderr.write(`${e}: ${a.message}
`), process.exit(a.ExitCode)), a;
  }
  await L.mkdir(i.PersistenceDir, { recursive: !0 });
  const f = z(i.PersistenceDir, i.StoreId), l = new B(f, i.StoreId);
  let u;
  try {
    const a = await l.loadSnapshot();
    u = a != null ? r.fromBinary(a) : r.fromScratch(), i.Verbose && (a != null ? process.stderr.write(
      `[${e}] snapshot loaded (${a.byteLength} bytes)
`
    ) : process.stderr.write(`[${e}] no snapshot found — created fresh store
`));
  } catch (a) {
    process.stderr.write(
      `${e}: failed to load store '${i.StoreId}': ${a.message}
`
    ), await l.close().catch(() => {
    }), process.exit(b.GeneralError);
  }
  const p = new Z(i.StoreId, i.reconnect), g = i.WebHooks.length > 0 ? new ee(i.WebHooks, u, i.StoreId, i.WebHookToken) : void 0, S = new C(u, {
    PersistenceProvider: l,
    NetworkProvider: p,
    BroadcastChannel: !1
  });
  await S.start();
  const m = g != null ? u.onChangeInvoke((a, d) => {
    g.processChangeSet(a, d).catch((y) => {
      process.stderr.write(
        `[${e}] webhook error: ${y.message}
`
      );
    });
  }) : () => {
  };
  i.Verbose && (p.onPatch((a) => {
    process.stderr.write(
      `[${e}] patch received (${a.byteLength} bytes)
`
    );
  }), u.onChangeInvoke((a, d) => {
    if (a !== "external")
      return;
    const y = Object.keys(d), k = /* @__PURE__ */ new Set();
    for (const w of y)
      for (const v of d[w])
        k.add(v);
    process.stderr.write(
      `[${e}] remote change: ${y.length} entries affected (${[...k].join(", ")})
`
    );
  })), p.onAuthError(async (a, d) => {
    const y = a === 4001 ? "Unauthorized" : "Forbidden";
    process.stderr.write(
      `[${e}] AUTH ERROR ${a} ${y}: ${d || "(no reason given)"}
[${e}] reconnect suppressed — check SDS_TOKEN or --token
`
    ), i.onAuthError != null && await oe(i.onAuthError, i.WebHookToken, {
      StoreId: i.StoreId,
      ServerURL: i.ServerURL,
      Code: a,
      Reason: d || y
    }, e).catch((k) => {
      process.stderr.write(
        `[${e}] auth-error webhook failed: ${k.message ?? k}
`
      );
    }), await A(S, m, l), process.exit(a === 4001 ? b.Unauthorized : b.Forbidden);
  }), process.stderr.write(
    `[${e}] connecting to ${i.ServerURL} (store: ${i.StoreId})
`
  );
  try {
    await S.connectTo(i.ServerURL, { Token: i.Token });
  } catch (a) {
    process.stderr.write(
      `[${e}] initial connection failed: ${a.message}
`
    );
  }
  p.onConnectionChange((a) => {
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
  const $ = async (a) => {
    process.stderr.write(`
[${e}] received ${a} — shutting down
`), await A(S, m, l), process.exit(b.OK);
  };
  process.once("SIGINT", () => {
    $("SIGINT").catch(() => process.exit(1));
  }), process.once("SIGTERM", () => {
    $("SIGTERM").catch(() => process.exit(1));
  }), process.stderr.write(`[${e}] running (press Ctrl+C to stop)
`);
}
async function A(r, e, t) {
  e();
  try {
    await r.stop();
  } catch {
  }
  try {
    await t.close();
  } catch {
  }
}
async function oe(r, e, t, o) {
  const n = { "Content-Type": "application/json" };
  e != null && (n.Authorization = `Bearer ${e}`);
  const s = await fetch(r, {
    method: "POST",
    headers: n,
    body: JSON.stringify(t),
    signal: AbortSignal.timeout(1e4)
  });
  s.ok || process.stderr.write(
    `[${o}] auth-error webhook returned ${s.status} ${s.statusText}
`
  );
}
export {
  de as runSidecar
};
