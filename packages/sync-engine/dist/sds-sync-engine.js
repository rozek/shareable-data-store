var st = Object.defineProperty;
var z = (n) => {
  throw TypeError(n);
};
var it = (n, e, s) => e in n ? st(n, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : n[e] = s;
var F = (n, e, s) => it(n, typeof e != "symbol" ? e + "" : e, s), A = (n, e, s) => e.has(n) || z("Cannot " + s);
var t = (n, e, s) => (A(n, e, "read from private field"), s ? s.call(n) : e.get(n)), r = (n, e, s) => e.has(n) ? z("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, s), c = (n, e, s, i) => (A(n, e, "write to private field"), i ? i.call(n, s) : e.set(n, s), s), v = (n, e, s) => (A(n, e, "access private method"), s);
var G = (n, e, s, i) => ({
  set _(o) {
    c(n, e, o, s);
  },
  get _() {
    return t(n, e, i);
  }
});
import { SDS_Error as U } from "@rozek/sds-core";
const ot = 512 * 1024;
var u, d, a, P, V, k, N, _, L, M, C, D, H, T, b, S, m, w, x, R, g, y, h, J, K, W, X, Y, Q, Z, I, O, tt, j;
class at {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, s = {}) {
    r(this, h);
    r(this, u);
    r(this, d);
    r(this, a);
    r(this, P);
    r(this, V);
    F(this, "PeerId", crypto.randomUUID());
    r(this, k);
    r(this, N);
    r(this, _, []);
    // outgoing patch queue (patches created while disconnected)
    r(this, L, 0);
    // accumulated patch bytes since last checkpoint
    r(this, M, 0);
    // sequence number of the last saved snapshot
    r(this, C, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    r(this, D, new Uint8Array(0));
    // heartbeat timer
    r(this, H);
    r(this, T);
    // presence peer tracking
    r(this, b, /* @__PURE__ */ new Map());
    r(this, S, /* @__PURE__ */ new Map());
    r(this, m, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    r(this, w);
    // connection state mirror
    r(this, x, "disconnected");
    r(this, R, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    r(this, g, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    r(this, y, /* @__PURE__ */ new Map());
    c(this, u, e), c(this, d, s.PersistenceProvider ?? void 0), c(this, a, s.NetworkProvider ?? void 0), c(this, P, s.PresenceProvider ?? s.NetworkProvider ?? void 0), c(this, V, s.PresenceTimeoutMs ?? 12e4), (s.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && t(this, a) != null && c(this, w, new BroadcastChannel(`sds:${t(this, a).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    t(this, d) != null && t(this, u).setValueBlobLoader(
      (e) => t(this, d).loadValue(e)
    ), await v(this, h, J).call(this), v(this, h, K).call(this), v(this, h, W).call(this), v(this, h, X).call(this), v(this, h, Y).call(this), t(this, a) != null && t(this, a).onConnectionChange((e) => {
      c(this, x, e);
      for (const s of t(this, R))
        try {
          s(e);
        } catch {
        }
      e === "connected" && v(this, h, Z).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, s, i;
    t(this, H) != null && (clearInterval(t(this, H)), c(this, H, void 0));
    for (const o of t(this, S).values())
      clearTimeout(o);
    t(this, S).clear();
    for (const o of t(this, g))
      try {
        o();
      } catch {
      }
    c(this, g, []), (e = t(this, w)) == null || e.close(), c(this, w, void 0), (s = t(this, a)) == null || s.disconnect(), t(this, d) != null && await v(this, h, Q).call(this), await ((i = t(this, d)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, s) {
    if (t(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    c(this, k, e), c(this, N, s), await t(this, a).connect(e, s);
  }
  /**** disconnect ****/
  disconnect() {
    if (t(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    t(this, a).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (t(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    if (t(this, k) == null)
      throw new U(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await t(this, a).connect(t(this, k), t(this, N));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return t(this, x);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return t(this, R).add(e), () => {
      t(this, R).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var i, o;
    c(this, T, e);
    const s = { ...e, PeerId: this.PeerId };
    (i = t(this, P)) == null || i.sendLocalState(e), (o = t(this, w)) == null || o.postMessage({ type: "presence", payload: e });
    for (const l of t(this, m))
      try {
        l(this.PeerId, s, "local");
      } catch (f) {
        console.error("SDS: presence handler failed", f);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return t(this, b);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return t(this, m).add(e), () => {
      t(this, m).delete(e);
    };
  }
}
u = new WeakMap(), d = new WeakMap(), a = new WeakMap(), P = new WeakMap(), V = new WeakMap(), k = new WeakMap(), N = new WeakMap(), _ = new WeakMap(), L = new WeakMap(), M = new WeakMap(), C = new WeakMap(), D = new WeakMap(), H = new WeakMap(), T = new WeakMap(), b = new WeakMap(), S = new WeakMap(), m = new WeakMap(), w = new WeakMap(), x = new WeakMap(), R = new WeakMap(), g = new WeakMap(), y = new WeakMap(), h = new WeakSet(), J = async function() {
  if (t(this, d) == null)
    return;
  await t(this, d).loadSnapshot();
  const e = await t(this, d).loadPatchesSince(t(this, M));
  for (const s of e)
    try {
      t(this, u).applyRemotePatch(s);
    } catch {
    }
  e.length > 0 && c(this, C, t(this, M) + e.length), c(this, D, t(this, u).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
K = function() {
  const e = t(this, u).onChangeInvoke((s, i) => {
    var f, q;
    if (s === "external") {
      v(this, h, I).call(this, i, "request").catch(() => {
      });
      return;
    }
    const o = t(this, D);
    G(this, C)._++;
    const l = t(this, u).exportPatch(o);
    c(this, D, t(this, u).currentCursor), l.byteLength !== 0 && (t(this, d) != null && (t(this, d).appendPatch(l, t(this, C)).catch(() => {
    }), c(this, L, t(this, L) + l.byteLength), t(this, L) >= ot && v(this, h, Q).call(this).catch(() => {
    })), ((f = t(this, a)) == null ? void 0 : f.ConnectionState) === "connected" ? (t(this, a).sendPatch(l), (q = t(this, w)) == null || q.postMessage({ type: "patch", payload: l })) : t(this, _).push(l), v(this, h, I).call(this, i, "send").catch(() => {
    }));
  });
  t(this, g).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
W = function() {
  if (t(this, a) != null) {
    const s = t(this, a).onPatch((o) => {
      try {
        t(this, u).applyRemotePatch(o);
      } catch {
      }
    });
    t(this, g).push(s);
    const i = t(this, a).onValue(async (o, l) => {
      var f;
      t(this, u).storeValueBlob(o, l), await ((f = t(this, d)) == null ? void 0 : f.saveValue(o, l));
    });
    t(this, g).push(i);
  }
  const e = t(this, P);
  if (e != null) {
    const s = e.onRemoteState((i, o) => {
      v(this, h, O).call(this, i, o);
    });
    t(this, g).push(s);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
X = function() {
  const e = t(this, V) / 4;
  c(this, H, setInterval(() => {
    var s, i;
    t(this, T) != null && ((s = t(this, P)) == null || s.sendLocalState(t(this, T)), (i = t(this, w)) == null || i.postMessage({ type: "presence", payload: t(this, T) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Y = function() {
  t(this, w) != null && (t(this, w).onmessage = (e) => {
    var i;
    const s = e.data;
    switch (!0) {
      case s.type === "patch":
        try {
          t(this, u).applyRemotePatch(s.payload);
        } catch (o) {
          console.error("SDS: failed to apply remote patch from BroadcastChannel", o);
        }
        break;
      case s.type === "presence":
        (i = t(this, P)) == null || i.sendLocalState(s.payload);
        break;
    }
  });
}, Q = async function() {
  t(this, d) != null && (await t(this, d).saveSnapshot(t(this, u).asBinary()), await t(this, d).prunePatches(t(this, C)), c(this, M, t(this, C)), c(this, L, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
Z = function() {
  var s;
  const e = t(this, _).splice(0);
  for (const i of e)
    try {
      (s = t(this, a)) == null || s.sendPatch(i);
    } catch (o) {
      console.error("SDS: failed to send queued patch", o);
    }
}, I = async function(e, s) {
  var i, o, l;
  for (const [f, q] of Object.entries(e)) {
    const $ = q;
    if ($.has("Existence")) {
      const B = t(this, y).get(f);
      B != null && (await ((i = t(this, d)) == null ? void 0 : i.releaseValue(B)), t(this, y).delete(f));
    }
    if (!$.has("Value"))
      continue;
    const E = t(this, y).get(f), p = t(this, u)._getValueRefOf(f), et = p == null ? void 0 : p.Hash;
    if (E != null && E !== et && (await ((o = t(this, d)) == null ? void 0 : o.releaseValue(E)), t(this, y).delete(f)), p != null) {
      if (t(this, a) == null) {
        t(this, y).set(f, p.Hash);
        continue;
      }
      if (s === "send") {
        const B = t(this, u).getValueBlobByHash(p.Hash);
        B != null && (await ((l = t(this, d)) == null ? void 0 : l.saveValue(p.Hash, B)), t(this, y).set(f, p.Hash), t(this, a).ConnectionState === "connected" && t(this, a).sendValue(p.Hash, B));
      } else
        t(this, y).set(f, p.Hash), !t(this, u).hasValueBlob(p.Hash) && t(this, a).ConnectionState === "connected" && t(this, a).requestValue(p.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
O = function(e, s) {
  if (s == null) {
    v(this, h, j).call(this, e);
    return;
  }
  const i = { ...s, _lastSeen: Date.now() };
  t(this, b).set(e, i), v(this, h, tt).call(this, e);
  for (const o of t(this, m))
    try {
      o(e, s, "remote");
    } catch (l) {
      console.error("SDS: presence handler failed", l);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
tt = function(e) {
  const s = t(this, S).get(e);
  s != null && clearTimeout(s);
  const i = setTimeout(
    () => {
      v(this, h, j).call(this, e);
    },
    t(this, V)
  );
  t(this, S).set(e, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
j = function(e) {
  if (!t(this, b).has(e))
    return;
  t(this, b).delete(e);
  const s = t(this, S).get(e);
  s != null && (clearTimeout(s), t(this, S).delete(e));
  for (const i of t(this, m))
    try {
      i(e, void 0, "remote");
    } catch (o) {
      console.error("SDS: presence handler failed", o);
    }
};
export {
  at as SDS_SyncEngine
};
