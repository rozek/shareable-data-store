import { Hono as W } from "hono";
import { serve as j } from "@hono/node-server";
import { createNodeWebSocket as A } from "@hono/node-ws";
import { jwtVerify as C, SignJWT as q } from "jose";
const D = 1, I = 2, J = 5;
class M {
  StoreId;
  #e = /* @__PURE__ */ new Set();
  constructor(e) {
    this.StoreId = e;
  }
  /**** addClient ****/
  addClient(e) {
    this.#e.add(e);
  }
  /**** removeClient ****/
  removeClient(e) {
    this.#e.delete(e);
  }
  /**** isEmpty ****/
  isEmpty() {
    return this.#e.size === 0;
  }
  /**** broadcast — sends Data to all clients in this store except Sender ****/
  broadcast(e, n) {
    for (const o of this.#e)
      if (o !== n)
        try {
          o.send(e);
        } catch {
        }
  }
}
const g = /* @__PURE__ */ new Map();
function b(t) {
  let e = g.get(t);
  return e == null && (e = new M(t), g.set(t, e)), e;
}
function v(t, e) {
  const n = g.get(t);
  n != null && (n.removeClient(e), n.isEmpty() && g.delete(t));
}
async function w(t, e, n) {
  const { payload: o } = await C(t, e, {
    algorithms: ["HS256"],
    ...n != null ? { issuer: n } : {}
  });
  if (typeof o.sub != "string" || typeof o.aud != "string")
    throw new TypeError("JWT is missing required claims (sub, aud)");
  const u = o.scope;
  if (u !== "read" && u !== "write" && u !== "admin")
    throw new TypeError(`JWT scope '${u}' is invalid — must be 'read', 'write', or 'admin'`);
  return {
    sub: o.sub,
    aud: o.aud,
    scope: u,
    iss: o.iss
  };
}
async function U(t, e, n, o, u, f) {
  const S = new q({ sub: e, aud: n, scope: o }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + Math.round(u / 1e3));
  return f != null && S.setIssuer(f), S.sign(t);
}
function O(t) {
  return t === D || t === I || t === J;
}
function P(t) {
  const e = t?.JWTSecret ?? process.env.SDS_JWT_SECRET ?? "", n = t?.Issuer || process.env.SDS_ISSUER || void 0, o = t?.Port ?? parseInt(process.env.SDS_PORT ?? "3000", 10), u = t?.Host ?? process.env.SDS_HOST ?? "127.0.0.1";
  if (e.length === 0)
    throw new TypeError(
      "SDS_JWT_SECRET is required (set via options.JWTSecret or the SDS_JWT_SECRET environment variable)"
    );
  if (e.length < 32)
    throw new TypeError(
      "SDS_JWT_SECRET must be at least 32 characters long to provide sufficient entropy for HS256"
    );
  const f = new TextEncoder().encode(e), S = new W(), { injectWebSocket: E, upgradeWebSocket: T } = A({ app: S });
  S.get("/ws/:storeId", T(async (s) => {
    const l = s.req.param("storeId"), h = s.req.query("token") ?? "";
    let i;
    try {
      i = await w(h, f, n);
    } catch (r) {
      return console.error("[/ws] token rejected:", r?.message ?? r), {
        onOpen: (c, d) => {
          d.close(4001, "Unauthorized");
        }
      };
    }
    if (i.aud !== l)
      return {
        onOpen: (r, c) => {
          c.close(4003, "Forbidden");
        }
      };
    const a = b(l);
    let m;
    const p = {
      send: (r) => {
        m.send(r);
      },
      scope: i.scope
    };
    return {
      onOpen: (r, c) => {
        m = c, a.addClient(p);
      },
      onMessage: (r, c) => {
        const d = r.data;
        if (!(d instanceof ArrayBuffer))
          return;
        const y = new Uint8Array(d);
        if (y.byteLength < 1)
          return;
        const k = y[0];
        i.scope === "read" && O(k) || a.broadcast(y, p);
      },
      onClose: () => {
        v(l, p);
      }
    };
  })), S.get("/signal/:storeId", T(async (s) => {
    const l = s.req.param("storeId"), h = s.req.query("token") ?? "";
    let i;
    try {
      i = await w(h, f, n);
    } catch (r) {
      return console.error("[/signal] token rejected:", r?.message ?? r), {
        onOpen: (c, d) => {
          d.close(4001, "Unauthorized");
        }
      };
    }
    if (i.aud !== l)
      return {
        onOpen: (r, c) => {
          c.close(4003, "Forbidden");
        }
      };
    const a = b(`signal:${l}`);
    let m;
    const p = {
      send: (r) => {
        m.send(r);
      },
      scope: i.scope
    };
    return {
      onOpen: (r, c) => {
        m = c, a.addClient(p);
      },
      onMessage: (r, c) => {
        const d = r.data;
        switch (!0) {
          case d instanceof ArrayBuffer:
            a.broadcast(new Uint8Array(d), p);
            break;
          case typeof d == "string": {
            const y = new TextEncoder().encode(d);
            a.broadcast(y, p);
            break;
          }
        }
      },
      onClose: () => {
        v(`signal:${l}`, p);
      }
    };
  })), S.post("/api/token", async (s) => {
    const l = s.req.header("Authorization") ?? "";
    if (!l.startsWith("Bearer "))
      return s.json({ error: "missing token" }, 401);
    const h = l.slice(7);
    let i;
    try {
      i = await w(h, f, n);
    } catch (r) {
      return console.error("[POST /api/token] token rejected:", r?.message ?? r), s.json({ error: "invalid token" }, 401);
    }
    if (i.scope !== "admin")
      return s.json({ error: "admin scope required" }, 403);
    let a;
    try {
      a = await s.req.json();
    } catch {
      return s.json({ error: "invalid JSON body" }, 400);
    }
    if (typeof a.sub != "string" || typeof a.scope != "string")
      return s.json({ error: "sub and scope required" }, 400);
    const m = R(a.exp ?? "24h"), p = await U(
      f,
      a.sub,
      i.aud,
      a.scope,
      m,
      n
    );
    return s.json({ token: p });
  });
  function _() {
    const s = j({ fetch: S.fetch, port: o, hostname: u });
    E(s);
  }
  return { app: S, start: _ };
}
function R(t) {
  const e = /^(\d+)(s|m|h|d)$/.exec(t);
  if (e == null)
    return 1440 * 60 * 1e3;
  const n = parseInt(e[1], 10);
  switch (e[2]) {
    case "s":
      return n * 1e3;
    case "m":
      return n * 60 * 1e3;
    case "h":
      return n * 60 * 60 * 1e3;
    case "d":
      return n * 24 * 60 * 60 * 1e3;
    default:
      return 1440 * 60 * 1e3;
  }
}
if (process.argv[1]?.endsWith("sds-websocket-server.js")) {
  const { start: t } = P();
  t();
}
export {
  M as LiveStore,
  P as createSDSServer,
  O as rejectWriteFrame
};
