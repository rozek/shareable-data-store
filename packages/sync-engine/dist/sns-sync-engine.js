var X = Object.defineProperty;
var A = (i) => {
  throw TypeError(i);
};
var Y = (i, e, s) => e in i ? X(i, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : i[e] = s;
var Q = (i, e, s) => Y(i, typeof e != "symbol" ? e + "" : e, s), E = (i, e, s) => e.has(i) || A("Cannot " + s);
var t = (i, e, s) => (E(i, e, "read from private field"), s ? s.call(i) : e.get(i)), o = (i, e, s) => e.has(i) ? A("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, s), r = (i, e, s, n) => (E(i, e, "write to private field"), n ? n.call(i, s) : e.set(i, s), s), u = (i, e, s) => (E(i, e, "access private method"), s);
var q = (i, e, s, n) => ({
  set _(c) {
    r(i, e, c, s);
  },
  get _() {
    return t(i, e, n);
  }
});
import { SNS_Error as R } from "@rozek/sns-core";
const Z = 512 * 1024;
var d, l, a, P, k, B, N, H, m, L, g, U, C, v, T, y, S, p, _, b, w, h, I, j, F, $, z, V, G, J, K, W, x;
class et {
  //----------------------------------------------------------------------------//
  //                               Construction                                  //
  //----------------------------------------------------------------------------//
  constructor(e, s = {}) {
    o(this, h);
    o(this, d);
    o(this, l);
    o(this, a);
    o(this, P);
    o(this, k);
    Q(this, "PeerId", crypto.randomUUID());
    o(this, B, null);
    o(this, N, null);
    // outgoing patch queue (patches created while disconnected)
    o(this, H, []);
    // accumulated patch bytes since last checkpoint
    o(this, m, 0);
    // sequence number of the last saved snapshot
    o(this, L, 0);
    // current patch sequence number (append-monotonic counter, managed by SyncEngine)
    o(this, g, 0);
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    o(this, U, new Uint8Array(0));
    // heartbeat timer
    o(this, C, null);
    o(this, v, null);
    // presence peer tracking
    o(this, T, /* @__PURE__ */ new Map());
    o(this, y, /* @__PURE__ */ new Map());
    o(this, S, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    o(this, p, null);
    // connection state mirror
    o(this, _, "disconnected");
    o(this, b, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    o(this, w, []);
    r(this, d, e), r(this, l, s.PersistenceProvider ?? null), r(this, a, s.NetworkProvider ?? null), r(this, P, s.PresenceProvider ?? s.NetworkProvider ?? null), r(this, k, s.PresenceTimeoutMs ?? 12e4), (s.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && t(this, a) != null && r(this, p, new BroadcastChannel(`sns:${t(this, a).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                               Lifecycle                                     //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await u(this, h, I).call(this), u(this, h, j).call(this), u(this, h, F).call(this), u(this, h, $).call(this), u(this, h, z).call(this), t(this, a) != null && t(this, a).onConnectionChange((e) => {
      r(this, _, e);
      for (const s of t(this, b))
        try {
          s(e);
        } catch {
        }
      e === "connected" && u(this, h, G).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, s, n;
    t(this, C) != null && (clearInterval(t(this, C)), r(this, C, null));
    for (const c of t(this, y).values())
      clearTimeout(c);
    t(this, y).clear();
    for (const c of t(this, w))
      try {
        c();
      } catch {
      }
    r(this, w, []), (e = t(this, p)) == null || e.close(), r(this, p, null), (s = t(this, a)) == null || s.disconnect(), t(this, l) != null && t(this, m) > 0 && await u(this, h, V).call(this), await ((n = t(this, l)) == null ? void 0 : n.close());
  }
  //----------------------------------------------------------------------------//
  //                            Network connection                               //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, s) {
    if (t(this, a) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    r(this, B, e), r(this, N, s), await t(this, a).connect(e, s);
  }
  /**** disconnect ****/
  disconnect() {
    if (t(this, a) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    t(this, a).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (t(this, a) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    if (t(this, B) == null)
      throw new R(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await t(this, a).connect(t(this, B), t(this, N));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return t(this, _);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return t(this, b).add(e), () => {
      t(this, b).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                Presence                                     //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var n, c;
    r(this, v, e);
    const s = { ...e, PeerId: this.PeerId };
    (n = t(this, P)) == null || n.sendLocalState(e), (c = t(this, p)) == null || c.postMessage({ type: "presence", payload: e });
    for (const f of t(this, S))
      try {
        f(this.PeerId, s, "local");
      } catch {
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return t(this, T);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return t(this, S).add(e), () => {
      t(this, S).delete(e);
    };
  }
}
d = new WeakMap(), l = new WeakMap(), a = new WeakMap(), P = new WeakMap(), k = new WeakMap(), B = new WeakMap(), N = new WeakMap(), H = new WeakMap(), m = new WeakMap(), L = new WeakMap(), g = new WeakMap(), U = new WeakMap(), C = new WeakMap(), v = new WeakMap(), T = new WeakMap(), y = new WeakMap(), S = new WeakMap(), p = new WeakMap(), _ = new WeakMap(), b = new WeakMap(), w = new WeakMap(), h = new WeakSet(), I = async function() {
  if (t(this, l) == null)
    return;
  const e = await t(this, l).loadSnapshot();
  if (e != null)
    try {
      const n = t(this, d).constructor.fromBinary(e);
    } catch {
    }
  const s = await t(this, l).loadPatchesSince(t(this, L));
  for (const n of s)
    try {
      t(this, d).applyRemotePatch(n);
    } catch {
    }
  s.length > 0 && r(this, g, t(this, L) + s.length), r(this, U, t(this, d).currentCursor);
}, //----------------------------------------------------------------------------//
//                           Private — Wiring                                  //
//----------------------------------------------------------------------------//
j = function() {
  const e = t(this, d).onChangeInvoke((s, n) => {
    var M, D;
    if (s !== "internal")
      return;
    const c = t(this, U);
    q(this, g)._++;
    const f = t(this, d).exportPatch(c);
    r(this, U, t(this, d).currentCursor), f.byteLength !== 0 && (t(this, l) != null && (t(this, l).appendPatch(f, t(this, g)).catch(() => {
    }), r(this, m, t(this, m) + f.byteLength), t(this, m) >= Z && u(this, h, V).call(this).catch(() => {
    })), ((M = t(this, a)) == null ? void 0 : M.ConnectionState) === "connected" ? (t(this, a).sendPatch(f), (D = t(this, p)) == null || D.postMessage({ type: "patch", payload: f })) : t(this, H).push(f), u(this, h, J).call(this, n).catch(() => {
    }));
  });
  t(this, w).push(e);
}, F = function() {
  if (t(this, a) != null) {
    const s = t(this, a).onPatch((c) => {
      try {
        t(this, d).applyRemotePatch(c);
      } catch {
      }
    });
    t(this, w).push(s);
    const n = t(this, a).onValue(async (c, f) => {
      var M;
      await ((M = t(this, l)) == null ? void 0 : M.saveValue(c, f));
    });
    t(this, w).push(n);
  }
  const e = t(this, P);
  if (e != null) {
    const s = e.onRemoteState((n, c) => {
      u(this, h, K).call(this, n, c);
    });
    t(this, w).push(s);
  }
}, $ = function() {
  const e = t(this, k) / 4;
  r(this, C, setInterval(() => {
    var s, n;
    t(this, v) != null && ((s = t(this, P)) == null || s.sendLocalState(t(this, v)), (n = t(this, p)) == null || n.postMessage({ type: "presence", payload: t(this, v) }));
  }, e));
}, z = function() {
  t(this, p) != null && (t(this, p).onmessage = (e) => {
    var n;
    const s = e.data;
    if (s.type === "patch")
      try {
        t(this, d).applyRemotePatch(s.payload);
      } catch {
      }
    else s.type === "presence" && ((n = t(this, P)) == null || n.sendLocalState(s.payload));
  });
}, V = async function() {
  t(this, l) != null && (await t(this, l).saveSnapshot(t(this, d).asBinary()), await t(this, l).prunePatches(t(this, g)), r(this, L, t(this, g)), r(this, m, 0));
}, //----------------------------------------------------------------------------//
//                       Private — Offline queue flush                         //
//----------------------------------------------------------------------------//
G = function() {
  var s;
  const e = t(this, H).splice(0);
  for (const n of e)
    try {
      (s = t(this, a)) == null || s.sendPatch(n);
    } catch {
    }
}, J = async function(e) {
  for (const [s, n] of Object.entries(e))
    n.has("Value") && t(this, a) != null;
}, //----------------------------------------------------------------------------//
//                        Private — Remote presence                            //
//----------------------------------------------------------------------------//
K = function(e, s) {
  if (s == null) {
    u(this, h, x).call(this, e);
    return;
  }
  const n = { ...s, _lastSeen: Date.now() };
  t(this, T).set(e, n), u(this, h, W).call(this, e);
  for (const c of t(this, S))
    try {
      c(e, s, "remote");
    } catch {
    }
}, W = function(e) {
  const s = t(this, y).get(e);
  s != null && clearTimeout(s);
  const n = setTimeout(
    () => {
      u(this, h, x).call(this, e);
    },
    t(this, k)
  );
  t(this, y).set(e, n);
}, x = function(e) {
  if (!t(this, T).has(e))
    return;
  t(this, T).delete(e);
  const s = t(this, y).get(e);
  s != null && (clearTimeout(s), t(this, y).delete(e));
  for (const n of t(this, S))
    try {
      n(e, void 0, "remote");
    } catch {
    }
};
export {
  et as SNS_SyncEngine
};
