import { Hono as I } from "hono";
import { serve as j } from "@hono/node-server";
import { createNodeWebSocket as U } from "@hono/node-ws";
import { jwtVerify as q, SignJWT as B } from "jose";
import M from "node:path";
const P = 1, D = 2, C = 5, m = 32;
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
      const c = new Uint8Array(1 + r.byteLength);
      c[0] = D, c.set(r, 1);
      try {
        e.send(c);
      } catch {
      }
    }
    const i = await t.loadPatchesSince(0);
    for (const c of i) {
      const u = new Uint8Array(1 + c.byteLength);
      u[0] = P, u.set(c, 1);
      try {
        e.send(u);
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
    if (e.byteLength < 1 + m + 8)
      return;
    const t = 2 * 1024 * 1024 * 1024, r = e.slice(1, 1 + m), i = J(r), c = new DataView(e.buffer, e.byteOffset + 1 + m), u = c.getUint32(0, !1), y = c.getUint32(4, !1), v = e.slice(1 + m + 8);
    let h = this.#n.get(i);
    if (h == null && (h = { Chunks: /* @__PURE__ */ new Map(), Total: y }, this.#n.set(i, h)), h.Chunks.set(u, v), h.Chunks.size < h.Total)
      return;
    this.#n.delete(i);
    const _ = [];
    for (let o = 0; o < h.Total; o++) {
      const s = h.Chunks.get(o);
      s != null && _.push(s);
    }
    const a = _.reduce((o, s) => o + s.byteLength, 0);
    if (a > t) {
      console.warn(`SDS: blob ${i} rejected — size ${a} exceeds limit of ${t} bytes`);
      return;
    }
    const d = new Uint8Array(m + a);
    d.set(r, 0);
    let w = m;
    for (const o of _)
      d.set(o, w), w += o.byteLength;
    this.persistValue(d);
  }
  /**** close — closes the underlying SQLite connection ****/
  async close() {
    await this.#e?.close();
  }
}
const k = /* @__PURE__ */ new Map();
async function A(n, e) {
  let t = k.get(n);
  if (t == null) {
    let r;
    if (e != null) {
      const { SDS_DesktopPersistenceProvider: i } = await import("@rozek/sds-persistence-node"), c = n.replace(/[^a-zA-Z0-9_-]/g, "_"), u = M.join(e, `${c}.db`);
      r = new i(u, n);
    }
    t = new L(n, r), k.set(n, t);
  }
  return t;
}
function W(n, e) {
  const t = k.get(n);
  t != null && (t.removeClient(e), t.isEmpty() && (k.delete(n), t.close().catch(() => {
  })));
}
async function E(n, e, t) {
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
async function R(n, e, t, r, i, c) {
  const u = new B({ sub: e, aud: t, scope: r }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + Math.round(i / 1e3));
  return c != null && u.setIssuer(c), u.sign(n);
}
function z(n) {
  return n === P || n === D || n === C;
}
function H(n) {
  const e = n?.JWTSecret ?? process.env.SDS_JWT_SECRET ?? "", t = n?.Issuer ?? process.env.SDS_ISSUER, r = n?.Port ?? parseInt(process.env.SDS_PORT ?? "3000", 10), i = n?.Host ?? process.env.SDS_HOST ?? "127.0.0.1", c = n?.PersistDir ?? process.env.SDS_PERSIST_DIR;
  if (e.length === 0)
    throw new TypeError("SDS_JWT_SECRET is required (set via options.JWTSecret or the SDS_JWT_SECRET environment variable)");
  if (e.length < 32)
    throw new TypeError("SDS_JWT_SECRET must be at least 32 characters long to provide sufficient entropy for HS256");
  const u = new TextEncoder().encode(e), y = new I(), { injectWebSocket: v, upgradeWebSocket: h } = U({ app: y });
  y.get("/ws/:storeId", h(async (a) => {
    const d = a.req.param("storeId"), w = a.req.query("token") ?? "";
    let o;
    try {
      o = await E(w, u, t);
    } catch {
      return {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== d)
      return {
        onOpen: (l, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const s = await A(d, c);
    let b;
    const f = {
      send: (l) => {
        b.send(l);
      },
      scope: o.scope
    };
    return {
      onOpen: (l, p) => {
        b = p, s.addClient(f), s.hasPersistence() && s.replayTo(f).catch(() => {
        });
      },
      onMessage: (l, p) => {
        const S = l.data;
        if (!(S instanceof ArrayBuffer))
          return;
        const g = new Uint8Array(S);
        if (g.byteLength < 1)
          return;
        const T = g[0];
        if (!(o.scope === "read" && z(T)) && (s.broadcast(g, f), s.hasPersistence()))
          switch (!0) {
            case T === P:
              s.persistPatch(g.slice(1));
              break;
            case T === D:
              s.persistValue(g.slice(1));
              break;
            case T === C:
              s.handleChunk(g);
              break;
          }
      },
      onClose: () => {
        W(d, f);
      }
    };
  })), y.get("/signal/:storeId", h(async (a) => {
    const d = a.req.param("storeId"), w = a.req.query("token") ?? "";
    let o;
    try {
      o = await E(w, u, t);
    } catch {
      return {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== d)
      return {
        onOpen: (l, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const s = await A(`signal:${d}`);
    let b;
    const f = {
      send: (l) => {
        b.send(l);
      },
      scope: o.scope
    };
    return {
      onOpen: (l, p) => {
        b = p, s.addClient(f);
      },
      onMessage: (l, p) => {
        const S = l.data;
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
  })), y.post("/api/token", async (a) => {
    const d = a.req.header("Authorization") ?? "";
    if (!d.startsWith("Bearer "))
      return a.json({ error: "missing token" }, 401);
    const w = d.slice(7);
    let o;
    try {
      o = await E(w, u, t);
    } catch {
      return a.json({ error: "invalid token" }, 401);
    }
    if (o.scope !== "admin")
      return a.json({ error: "admin scope required" }, 403);
    let s;
    try {
      s = await a.req.json();
    } catch {
      return a.json({ error: "invalid JSON body" }, 400);
    }
    if (typeof s.sub != "string" || typeof s.scope != "string")
      return a.json({ error: "sub and scope required" }, 400);
    const b = O(s.exp ?? "24h"), f = await R(
      u,
      s.sub,
      o.aud,
      s.scope,
      b,
      t
    );
    return a.json({ token: f });
  });
  function _() {
    const a = j({ fetch: y.fetch, port: r, hostname: i });
    v(a);
  }
  return { app: y, start: _ };
}
function O(n) {
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
  const { start: n } = H();
  n();
}
export {
  L as LiveStore,
  H as createSDSServer,
  z as rejectWriteFrame
};
