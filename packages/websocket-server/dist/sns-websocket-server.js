import { Hono as j } from "hono";
import { serve as U } from "@hono/node-server";
import { createNodeWebSocket as q } from "@hono/node-ws";
import { jwtVerify as D, SignJWT as M } from "jose";
import N from "node:path";
const E = 1, A = 2, I = 5, _ = 32;
function B(n) {
  return Array.from(n).map((t) => t.toString(16).padStart(2, "0")).join("");
}
class L {
  StoreId;
  #t = /* @__PURE__ */ new Set();
  #e;
  #n = /* @__PURE__ */ new Map();
  constructor(t, e) {
    this.StoreId = t, this.#e = e;
  }
  /**** addClient ****/
  addClient(t) {
    this.#t.add(t);
  }
  /**** removeClient ****/
  removeClient(t) {
    this.#t.delete(t);
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
  broadcast(t, e) {
    for (const s of this.#t)
      if (s !== e)
        try {
          s.send(t);
        } catch {
        }
  }
  /**** replayTo — sends stored snapshot and patches to a newly connected client ****/
  async replayTo(t) {
    const e = this.#e;
    if (e == null)
      return;
    const s = await e.loadSnapshot();
    if (s != null) {
      const u = new Uint8Array(1 + s.byteLength);
      u[0] = A, u.set(s, 1);
      try {
        t.send(u);
      } catch {
      }
    }
    const c = await e.loadPatchesSince(0);
    for (const u of c) {
      const i = new Uint8Array(1 + u.byteLength);
      i[0] = E, i.set(u, 1);
      try {
        t.send(i);
      } catch {
      }
    }
  }
  /**** persistPatch — stores a patch payload (bytes after the 0x01 type byte) ****/
  persistPatch(t) {
    this.#e?.appendPatch(t, Date.now()).catch(() => {
    });
  }
  /**** persistValue — stores a value payload (hash + data, bytes after 0x02);
                       prunes all accumulated patches since the value is a full state ****/
  persistValue(t) {
    const e = this.#e;
    e?.saveSnapshot(t).then(() => e.prunePatches(Date.now() + 1)).catch(() => {
    });
  }
  /**** handleChunk — accumulates VALUE_CHUNK frames; persists the assembled
                      value when all chunks have arrived ****/
  handleChunk(t) {
    if (t.byteLength < 1 + _ + 8)
      return;
    const e = t.slice(1, 1 + _), s = B(e), c = new DataView(t.buffer, t.byteOffset + 1 + _), u = c.getUint32(0, !1), i = c.getUint32(4, !1), w = t.slice(1 + _ + 8);
    let y = this.#n.get(s);
    if (y == null && (y = { Chunks: /* @__PURE__ */ new Map(), Total: i }, this.#n.set(s, y)), y.Chunks.set(u, w), y.Chunks.size < y.Total)
      return;
    this.#n.delete(s);
    const b = [];
    for (let d = 0; d < y.Total; d++) {
      const a = y.Chunks.get(d);
      a != null && b.push(a);
    }
    const v = b.reduce((d, a) => d + a.byteLength, 0), r = new Uint8Array(_ + v);
    r.set(e, 0);
    let h = _;
    for (const d of b)
      r.set(d, h), h += d.byteLength;
    this.persistValue(r);
  }
  /**** close — closes the underlying SQLite connection ****/
  async close() {
    await this.#e?.close();
  }
}
const P = /* @__PURE__ */ new Map();
async function C(n, t) {
  let e = P.get(n);
  if (e == null) {
    let s;
    if (t != null) {
      const { SNS_DesktopPersistenceProvider: c } = await import("@rozek/sns-persistence-node"), u = n.replace(/[^a-zA-Z0-9_-]/g, "_"), i = N.join(t, `${u}.db`);
      s = new c(i, n);
    }
    e = new L(n, s), P.set(n, e);
  }
  return e;
}
function W(n, t) {
  const e = P.get(n);
  e != null && (e.removeClient(t), e.isEmpty() && (P.delete(n), e.close().catch(() => {
  })));
}
async function T(n, t, e) {
  const { payload: s } = await D(n, t, {
    algorithms: ["HS256"],
    ...e != null ? { issuer: e } : {}
  });
  if (typeof s.sub != "string" || typeof s.aud != "string")
    throw new Error("missing claims");
  const c = s.scope;
  if (c !== "read" && c !== "write" && c !== "admin")
    throw new Error("invalid scope");
  return {
    sub: s.sub,
    aud: s.aud,
    scope: c,
    iss: s.iss
  };
}
async function V(n, t, e, s, c, u) {
  const i = new M({ sub: t, aud: e, scope: s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + Math.round(c / 1e3));
  return u != null && i.setIssuer(u), i.sign(n);
}
function z(n) {
  return n === E || n === A || n === I;
}
function H(n) {
  const t = n?.JWTSecret ?? process.env.SNS_JWT_SECRET ?? "", e = n?.Issuer ?? process.env.SNS_ISSUER, s = n?.Port ?? parseInt(process.env.SNS_PORT ?? "3000", 10), c = n?.Host ?? process.env.SNS_HOST ?? "127.0.0.1", u = n?.PersistDir ?? process.env.SNS_PERSIST_DIR;
  if (t.length === 0)
    throw new Error("SNS_JWT_SECRET environment variable is required");
  const i = new TextEncoder().encode(t), w = new j(), { injectWebSocket: y, upgradeWebSocket: b } = q({ app: w });
  w.get("/ws/:storeId", b(async (r) => {
    const h = r.req.param("storeId"), d = r.req.query("token") ?? "";
    let a;
    try {
      a = await T(d, i, e);
    } catch {
      return {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (a.aud !== h)
      return {
        onOpen: (l, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const o = await C(h, u);
    let m;
    const f = {
      send: (l) => {
        m.send(l);
      },
      scope: a.scope
    };
    return {
      onOpen: (l, p) => {
        m = p, o.addClient(f), o.hasPersistence() && o.replayTo(f).catch(() => {
        });
      },
      onMessage: (l, p) => {
        const S = l.data;
        if (!(S instanceof ArrayBuffer))
          return;
        const g = new Uint8Array(S);
        if (g.byteLength < 1)
          return;
        const k = g[0];
        if (!(a.scope === "read" && z(k)) && (o.broadcast(g, f), o.hasPersistence()))
          switch (!0) {
            case k === E:
              o.persistPatch(g.slice(1));
              break;
            case k === A:
              o.persistValue(g.slice(1));
              break;
            case k === I:
              o.handleChunk(g);
              break;
          }
      },
      onClose: () => {
        W(h, f);
      }
    };
  })), w.get("/signal/:storeId", b(async (r) => {
    const h = r.req.param("storeId"), d = r.req.query("token") ?? "";
    let a;
    try {
      a = await T(d, i, e);
    } catch {
      return {
        onOpen: (p, S) => {
          S.close(4001, "Unauthorized");
        }
      };
    }
    if (a.aud !== h)
      return {
        onOpen: (l, p) => {
          p.close(4003, "Forbidden");
        }
      };
    const o = await C(`signal:${h}`);
    let m;
    const f = {
      send: (l) => {
        m.send(l);
      },
      scope: a.scope
    };
    return {
      onOpen: (l, p) => {
        m = p, o.addClient(f);
      },
      onMessage: (l, p) => {
        const S = l.data;
        if (S instanceof ArrayBuffer)
          o.broadcast(new Uint8Array(S), f);
        else if (typeof S == "string") {
          const g = new TextEncoder().encode(S);
          o.broadcast(g, f);
        }
      },
      onClose: () => {
        W(`signal:${h}`, f);
      }
    };
  })), w.post("/api/token", async (r) => {
    const h = r.req.header("Authorization") ?? "";
    if (!h.startsWith("Bearer "))
      return r.json({ error: "missing token" }, 401);
    const d = h.slice(7);
    let a;
    try {
      a = await T(d, i, e);
    } catch {
      return r.json({ error: "invalid token" }, 401);
    }
    if (a.scope !== "admin")
      return r.json({ error: "admin scope required" }, 403);
    let o;
    try {
      o = await r.req.json();
    } catch {
      return r.json({ error: "invalid JSON body" }, 400);
    }
    if (typeof o.sub != "string" || typeof o.scope != "string")
      return r.json({ error: "sub and scope required" }, 400);
    const m = O(o.exp ?? "24h"), f = await V(
      i,
      o.sub,
      a.aud,
      o.scope,
      m,
      e
    );
    return r.json({ token: f });
  });
  function v() {
    const r = U({ fetch: w.fetch, port: s, hostname: c });
    y(r);
  }
  return { app: w, start: v };
}
function O(n) {
  const t = /^(\d+)(s|m|h|d)$/.exec(n);
  if (t == null)
    return 1440 * 60 * 1e3;
  const e = parseInt(t[1], 10);
  switch (t[2]) {
    case "s":
      return e * 1e3;
    case "m":
      return e * 60 * 1e3;
    case "h":
      return e * 60 * 60 * 1e3;
    case "d":
      return e * 24 * 60 * 60 * 1e3;
    default:
      return 1440 * 60 * 1e3;
  }
}
if (process.argv[1]?.endsWith("sns-websocket-server.js")) {
  const { start: n } = H();
  n();
}
export {
  L as LiveStore,
  H as createSNSServer,
  z as rejectWriteFrame
};
