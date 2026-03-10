import { Hono as j } from "hono";
import { serve as I } from "@hono/node-server";
import { createNodeWebSocket as U } from "@hono/node-ws";
import { jwtVerify as q, SignJWT as B } from "jose";
import M from "node:path";
const E = 1, D = 2, C = 5, b = 32;
function J(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
class L {
  StoreId;
  #t = /* @__PURE__ */ new Set();
  #e;
  #n = /* @__PURE__ */ new Map();
  constructor(e, t) {
    this.StoreId = e, this.#e = t;
  }
  /**** addClient ****/
  addClient(e) {
    this.#t.add(e);
  }
  /**** removeClient ****/
  removeClient(e) {
    this.#t.delete(e);
  }
  /**** isEmpty ****/
  isEmpty() {
    return this.#t.size === 0;
  }
  /**** hasPersistence ****/
  hasPersistence() {
    return this.#e != null;
  }
  /**** broadcast — sends Data to all clients in this store except Sender ****/
  broadcast(e, t) {
    for (const r of this.#t)
      if (r !== t)
        try {
          r.send(e);
        } catch {
        }
  }
  /**** replayTo — sends stored snapshot and patches to a newly connected client ****/
  async replayTo(e) {
    const t = this.#e;
    if (t == null)
      return;
    const r = await t.loadSnapshot();
    if (r != null) {
      const u = new Uint8Array(1 + r.byteLength);
      u[0] = D, u.set(r, 1);
      try {
        e.send(u);
      } catch {
      }
    }
    const i = await t.loadPatchesSince(0);
    for (const u of i) {
      const l = new Uint8Array(1 + u.byteLength);
      l[0] = E, l.set(u, 1);
      try {
        e.send(l);
      } catch {
      }
    }
  }
  /**** persistPatch — stores a patch payload (bytes after the 0x01 type byte) ****/
  persistPatch(e) {
    this.#e?.appendPatch(e, Date.now()).catch(() => {
    });
  }
  /**** persistValue — stores a value payload (hash + data, bytes after 0x02);
                       prunes all accumulated patches since the value is a full state ****/
  persistValue(e) {
    const t = this.#e;
    t?.saveSnapshot(e).then(() => t.prunePatches(Date.now() + 1)).catch(() => {
    });
  }
  /**** handleChunk — accumulates VALUE_CHUNK frames; persists the assembled
                      value when all chunks have arrived ****/
  handleChunk(e) {
    if (e.byteLength < 1 + b + 8)
      return;
    const t = 2 * 1024 * 1024 * 1024, r = e.slice(1, 1 + b), i = J(r), u = new DataView(e.buffer, e.byteOffset + 1 + b), l = u.getUint32(0, !1), y = u.getUint32(4, !1), v = e.slice(1 + b + 8);
    let h = this.#n.get(i);
    if (h == null && (h = { Chunks: /* @__PURE__ */ new Map(), Total: y }, this.#n.set(i, h)), h.Chunks.set(l, v), h.Chunks.size < h.Total)
      return;
    this.#n.delete(i);
    const T = [];
    for (let o = 0; o < h.Total; o++) {
      const s = h.Chunks.get(o);
      s != null && T.push(s);
    }
    const c = T.reduce((o, s) => o + s.byteLength, 0);
    if (c > t) {
      console.warn(`SDS: blob ${i} rejected — size ${c} exceeds limit of ${t} bytes`);
      return;
    }
    const d = new Uint8Array(b + c);
    d.set(r, 0);
    let w = b;
    for (const o of T)
      d.set(o, w), w += o.byteLength;
    this.persistValue(d);
  }
  /**** close — closes the underlying SQLite connection ****/
  async close() {
    await this.#e?.close();
  }
}
const _ = /* @__PURE__ */ new Map();
async function A(n, e) {
  let t = _.get(n);
  if (t == null) {
    let r;
    if (e != null) {
      const { SDS_DesktopPersistenceProvider: i } = await import("@rozek/sds-persistence-node"), u = n.replace(/[^a-zA-Z0-9_-]/g, "_"), l = M.join(e, `${u}.db`);
      r = new i(l, n);
    }
    t = new L(n, r), _.set(n, t);
  }
  return t;
}
function W(n, e) {
  const t = _.get(n);
  t != null && (t.removeClient(e), t.isEmpty() && (_.delete(n), t.close().catch(() => {
  })));
}
async function P(n, e, t) {
  const { payload: r } = await q(n, e, {
    algorithms: ["HS256"],
    ...t != null ? { issuer: t } : {}
  });
  if (typeof r.sub != "string" || typeof r.aud != "string")
    throw new TypeError("JWT is missing required claims (sub, aud)");
  const i = r.scope;
  if (i !== "read" && i !== "write" && i !== "admin")
    throw new TypeError(`JWT scope '${i}' is invalid — must be 'read', 'write', or 'admin'`);
  return {
    sub: r.sub,
    aud: r.aud,
    scope: i,
    iss: r.iss
  };
}
async function O(n, e, t, r, i, u) {
  const l = new B({ sub: e, aud: t, scope: r }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + Math.round(i / 1e3));
  return u != null && l.setIssuer(u), l.sign(n);
}
function R(n) {
  return n === E || n === D || n === C;
}
function z(n) {
  const e = n?.JWTSecret ?? process.env.SDS_JWT_SECRET ?? "", t = n?.Issuer || process.env.SDS_ISSUER || void 0, r = n?.Port ?? parseInt(process.env.SDS_PORT ?? "3000", 10), i = n?.Host ?? process.env.SDS_HOST ?? "127.0.0.1", u = n?.PersistDir ?? process.env.SDS_PERSIST_DIR;
  if (e.length === 0)
    throw new TypeError("SDS_JWT_SECRET is required (set via options.JWTSecret or the SDS_JWT_SECRET environment variable)");
  if (e.length < 32)
    throw new TypeError("SDS_JWT_SECRET must be at least 32 characters long to provide sufficient entropy for HS256");
  const l = new TextEncoder().encode(e), y = new j(), { injectWebSocket: v, upgradeWebSocket: h } = U({ app: y });
  y.get("/ws/:storeId", h(async (c) => {
    const d = c.req.param("storeId"), w = c.req.query("token") ?? "";
    let o;
    try {
      o = await P(w, l, t);
    } catch (a) {
      return console.error("[/ws] token rejected:", a?.message ?? a), {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== d)
      return {
        onOpen: (a, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const s = await A(d, u);
    let m;
    const f = {
      send: (a) => {
        m.send(a);
      },
      scope: o.scope
    };
    return {
      onOpen: (a, p) => {
        m = p, s.addClient(f), s.hasPersistence() && s.replayTo(f).catch(() => {
        });
      },
      onMessage: (a, p) => {
        const S = a.data;
        if (!(S instanceof ArrayBuffer))
          return;
        const g = new Uint8Array(S);
        if (g.byteLength < 1)
          return;
        const k = g[0];
        if (!(o.scope === "read" && R(k)) && (s.broadcast(g, f), s.hasPersistence()))
          switch (!0) {
            case k === E:
              s.persistPatch(g.slice(1));
              break;
            case k === D:
              s.persistValue(g.slice(1));
              break;
            case k === C:
              s.handleChunk(g);
              break;
          }
      },
      onClose: () => {
        W(d, f);
      }
    };
  })), y.get("/signal/:storeId", h(async (c) => {
    const d = c.req.param("storeId"), w = c.req.query("token") ?? "";
    let o;
    try {
      o = await P(w, l, t);
    } catch (a) {
      return console.error("[/signal] token rejected:", a?.message ?? a), {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== d)
      return {
        onOpen: (a, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const s = await A(`signal:${d}`);
    let m;
    const f = {
      send: (a) => {
        m.send(a);
      },
      scope: o.scope
    };
    return {
      onOpen: (a, p) => {
        m = p, s.addClient(f);
      },
      onMessage: (a, p) => {
        const S = a.data;
        switch (!0) {
          case S instanceof ArrayBuffer:
            s.broadcast(new Uint8Array(S), f);
            break;
          case typeof S == "string": {
            const g = new TextEncoder().encode(S);
            s.broadcast(g, f);
            break;
          }
        }
      },
      onClose: () => {
        W(`signal:${d}`, f);
      }
    };
  })), y.post("/api/token", async (c) => {
    const d = c.req.header("Authorization") ?? "";
    if (!d.startsWith("Bearer "))
      return c.json({ error: "missing token" }, 401);
    const w = d.slice(7);
    let o;
    try {
      o = await P(w, l, t);
    } catch (a) {
      return console.error("[POST /api/token] token rejected:", a?.message ?? a), c.json({ error: "invalid token" }, 401);
    }
    if (o.scope !== "admin")
      return c.json({ error: "admin scope required" }, 403);
    let s;
    try {
      s = await c.req.json();
    } catch {
      return c.json({ error: "invalid JSON body" }, 400);
    }
    if (typeof s.sub != "string" || typeof s.scope != "string")
      return c.json({ error: "sub and scope required" }, 400);
    const m = H(s.exp ?? "24h"), f = await O(
      l,
      s.sub,
      o.aud,
      s.scope,
      m,
      t
    );
    return c.json({ token: f });
  });
  function T() {
    const c = I({ fetch: y.fetch, port: r, hostname: i });
    v(c);
  }
  return { app: y, start: T };
}
function H(n) {
  const e = /^(\d+)(s|m|h|d)$/.exec(n);
  if (e == null)
    return 1440 * 60 * 1e3;
  const t = parseInt(e[1], 10);
  switch (e[2]) {
    case "s":
      return t * 1e3;
    case "m":
      return t * 60 * 1e3;
    case "h":
      return t * 60 * 60 * 1e3;
    case "d":
      return t * 24 * 60 * 60 * 1e3;
    default:
      return 1440 * 60 * 1e3;
  }
}
if (process.argv[1]?.endsWith("sds-websocket-server.js")) {
  const { start: n } = z();
  n();
}
export {
  L as LiveStore,
  z as createSDSServer,
  R as rejectWriteFrame
};
