var se = Object.defineProperty;
var F = (h) => {
  throw TypeError(h);
};
var ie = (h, t, s) => t in h ? se(h, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : h[t] = s;
var G = (h, t, s) => ie(h, typeof t != "symbol" ? t + "" : t, s), A = (h, t, s) => t.has(h) || F("Cannot " + s);
var e = (h, t, s) => (A(h, t, "read from private field"), s ? s.call(h) : t.get(h)), r = (h, t, s) => t.has(h) ? F("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(h) : t.set(h, s), c = (h, t, s, i) => (A(h, t, "write to private field"), i ? i.call(h, s) : t.set(h, s), s), v = (h, t, s) => (A(h, t, "access private method"), s);
var J = (h, t, s, i) => ({
  set _(o) {
    c(h, t, o, s);
  },
  get _() {
    return e(h, t, i);
  }
});
import { SDS_Error as U } from "@rozek/sds-core";
const oe = 512 * 1024;
var u, d, a, H, V, D, N, q, I, L, m, M, T, b, B, y, C, P, x, R, g, S, n, K, W, X, Y, Z, Q, O, j, $, ee, z;
class ae {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(t, s = {}) {
    r(this, n);
    r(this, u);
    r(this, d);
    r(this, a);
    r(this, H);
    r(this, V);
    G(this, "PeerId", crypto.randomUUID());
    r(this, D);
    r(this, N);
    r(this, q, []);
    // outgoing patch queue (patches created while disconnected)
    r(this, I, 0);
    // accumulated patch bytes since last checkpoint
    r(this, L, 0);
    // sequence number of the last saved snapshot
    r(this, m, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    r(this, M, new Uint8Array(0));
    // heartbeat timer
    r(this, T);
    r(this, b);
    // presence peer tracking
    r(this, B, /* @__PURE__ */ new Map());
    r(this, y, /* @__PURE__ */ new Map());
    r(this, C, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    r(this, P);
    // connection state mirror
    r(this, x, "disconnected");
    r(this, R, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    r(this, g, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    r(this, S, /* @__PURE__ */ new Map());
    var o;
    c(this, u, t), c(this, d, s.PersistenceProvider ?? void 0), c(this, a, s.NetworkProvider ?? void 0), c(this, H, s.PresenceProvider ?? (typeof ((o = s.NetworkProvider) == null ? void 0 : o.onRemoteState) == "function" ? s.NetworkProvider : void 0)), c(this, V, s.PresenceTimeoutMs ?? 12e4), (s.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && e(this, a) != null && c(this, P, new BroadcastChannel(`sds:${e(this, a).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    if (e(this, d) != null) {
      const t = e(this, d);
      e(this, u).setValueBlobLoader((s) => t.loadValue(s));
    }
    await v(this, n, K).call(this), v(this, n, W).call(this), v(this, n, X).call(this), v(this, n, Y).call(this), v(this, n, Z).call(this), e(this, a) != null && e(this, a).onConnectionChange((t) => {
      c(this, x, t);
      for (const s of e(this, R))
        try {
          s(t);
        } catch (i) {
          console.error("[SDS] connection-change handler threw:", i.message ?? i);
        }
      t === "connected" && v(this, n, O).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var t, s, i;
    e(this, T) != null && (clearInterval(e(this, T)), c(this, T, void 0));
    for (const o of e(this, y).values())
      clearTimeout(o);
    e(this, y).clear();
    for (const o of e(this, g))
      try {
        o();
      } catch {
      }
    c(this, g, []), (t = e(this, P)) == null || t.close(), c(this, P, void 0), (s = e(this, a)) == null || s.disconnect(), e(this, d) != null && await v(this, n, Q).call(this), await ((i = e(this, d)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(t, s) {
    if (e(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    c(this, D, t), c(this, N, s), await e(this, a).connect(t, s);
  }
  /**** disconnect ****/
  disconnect() {
    if (e(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    e(this, a).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (e(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    if (e(this, D) == null)
      throw new U(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await e(this, a).connect(e(this, D), e(this, N));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return e(this, x);
  }
  /**** onConnectionChange ****/
  onConnectionChange(t) {
    return e(this, R).add(t), () => {
      e(this, R).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(t) {
    var i, o;
    c(this, b, t);
    const s = { ...t, PeerId: this.PeerId };
    (i = e(this, H)) == null || i.sendLocalState(t), (o = e(this, P)) == null || o.postMessage({ type: "presence", payload: s, senderId: this.PeerId });
    for (const l of e(this, C))
      try {
        l(this.PeerId, s, "local");
      } catch (f) {
        console.error("SDS: presence handler failed", f);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return e(this, B);
  }
  /**** onPresenceChange ****/
  onPresenceChange(t) {
    return e(this, C).add(t), () => {
      e(this, C).delete(t);
    };
  }
}
u = new WeakMap(), d = new WeakMap(), a = new WeakMap(), H = new WeakMap(), V = new WeakMap(), D = new WeakMap(), N = new WeakMap(), q = new WeakMap(), I = new WeakMap(), L = new WeakMap(), m = new WeakMap(), M = new WeakMap(), T = new WeakMap(), b = new WeakMap(), B = new WeakMap(), y = new WeakMap(), C = new WeakMap(), P = new WeakMap(), x = new WeakMap(), R = new WeakMap(), g = new WeakMap(), S = new WeakMap(), n = new WeakSet(), K = async function() {
  if (e(this, d) == null)
    return;
  await e(this, d).loadSnapshot();
  const t = await e(this, d).loadPatchesSince(e(this, L));
  for (const s of t)
    try {
      e(this, u).applyRemotePatch(s);
    } catch {
    }
  t.length > 0 && c(this, m, e(this, L) + t.length), c(this, M, e(this, u).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
W = function() {
  const t = e(this, u).onChangeInvoke((s, i) => {
    var f, _;
    if (s === "external") {
      v(this, n, j).call(this, i, "request").catch((p) => {
        console.error("[SDS] value-request failed:", p.message ?? p);
      });
      return;
    }
    const o = e(this, M);
    J(this, m)._++;
    const l = e(this, u).exportPatch(o);
    c(this, M, e(this, u).currentCursor), l.byteLength !== 0 && (e(this, d) != null && (e(this, d).appendPatch(l, e(this, m)).catch((p) => {
      console.error("[SDS] appendPatch failed:", p.message ?? p);
    }), c(this, I, e(this, I) + l.byteLength), e(this, I) >= oe && v(this, n, Q).call(this).catch((p) => {
      console.error("[SDS] checkpoint failed:", p.message ?? p);
    })), ((f = e(this, a)) == null ? void 0 : f.ConnectionState) === "connected" ? (e(this, a).sendPatch(l), (_ = e(this, P)) == null || _.postMessage({ type: "patch", payload: l, senderId: this.PeerId })) : e(this, q).push(l), v(this, n, j).call(this, i, "send").catch((p) => {
      console.error("[SDS] value-send failed:", p.message ?? p);
    }));
  });
  e(this, g).push(t);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
X = function() {
  if (e(this, a) != null) {
    const s = e(this, a).onPatch((o) => {
      try {
        e(this, u).applyRemotePatch(o);
      } catch {
      }
    });
    e(this, g).push(s);
    const i = e(this, a).onValue(async (o, l) => {
      var f;
      e(this, u).storeValueBlob(o, l), await ((f = e(this, d)) == null ? void 0 : f.saveValue(o, l));
    });
    e(this, g).push(i);
  }
  const t = e(this, H);
  if (t != null) {
    const s = t.onRemoteState((i, o) => {
      v(this, n, $).call(this, i, o);
    });
    e(this, g).push(s);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
Y = function() {
  const t = e(this, V) / 4;
  c(this, T, setInterval(() => {
    var s, i;
    if (e(this, b) != null) {
      (s = e(this, H)) == null || s.sendLocalState(e(this, b));
      const o = { ...e(this, b), PeerId: this.PeerId };
      (i = e(this, P)) == null || i.postMessage({ type: "presence", payload: o, senderId: this.PeerId });
    }
  }, t));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Z = function() {
  e(this, P) != null && (e(this, P).onmessage = (t) => {
    const s = t.data;
    if (s.senderId !== this.PeerId)
      switch (!0) {
        case s.type === "patch":
          try {
            e(this, u).applyRemotePatch(s.payload);
          } catch (i) {
            console.error("[SDS] failed to apply BC patch:", i.message ?? i);
          }
          break;
        case s.type === "presence":
          v(this, n, $).call(this, s.payload.PeerId ?? s.senderId ?? "unknown", s.payload);
          break;
      }
  });
}, Q = async function() {
  e(this, d) != null && (await e(this, d).saveSnapshot(e(this, u).asBinary()), e(this, a) != null && (await e(this, d).prunePatches(e(this, m)), c(this, L, e(this, m))), c(this, I, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
O = function() {
  var s;
  const t = e(this, q).splice(0);
  for (const i of t)
    try {
      (s = e(this, a)) == null || s.sendPatch(i);
    } catch (o) {
      console.error("SDS: failed to send queued patch", o);
    }
}, j = async function(t, s) {
  var i, o, l;
  for (const [f, _] of Object.entries(t)) {
    const p = _;
    if (p.has("Existence")) {
      const k = e(this, S).get(f);
      k != null && (await ((i = e(this, d)) == null ? void 0 : i.releaseValue(k)), e(this, S).delete(f));
    }
    if (!p.has("Value"))
      continue;
    const E = e(this, S).get(f), w = e(this, u)._getValueRefOf(f), te = w == null ? void 0 : w.Hash;
    if (E != null && E !== te && (await ((o = e(this, d)) == null ? void 0 : o.releaseValue(E)), e(this, S).delete(f)), w != null) {
      if (e(this, a) == null) {
        e(this, S).set(f, w.Hash);
        continue;
      }
      if (s === "send") {
        const k = e(this, u).getValueBlobByHash(w.Hash);
        k != null && (await ((l = e(this, d)) == null ? void 0 : l.saveValue(w.Hash, k)), e(this, S).set(f, w.Hash), e(this, a).ConnectionState === "connected" && e(this, a).sendValue(w.Hash, k));
      } else
        e(this, S).set(f, w.Hash), !e(this, u).hasValueBlob(w.Hash) && e(this, a).ConnectionState === "connected" && e(this, a).requestValue(w.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
$ = function(t, s) {
  if (s == null) {
    v(this, n, z).call(this, t);
    return;
  }
  const i = { ...s, _lastSeen: Date.now() };
  e(this, B).set(t, i), v(this, n, ee).call(this, t);
  for (const o of e(this, C))
    try {
      o(t, s, "remote");
    } catch (l) {
      console.error("SDS: presence handler failed", l);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
ee = function(t) {
  const s = e(this, y).get(t);
  s != null && clearTimeout(s);
  const i = setTimeout(
    () => {
      v(this, n, z).call(this, t);
    },
    e(this, V)
  );
  e(this, y).set(t, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
z = function(t) {
  if (!e(this, B).has(t))
    return;
  e(this, B).delete(t);
  const s = e(this, y).get(t);
  s != null && (clearTimeout(s), e(this, y).delete(t));
  for (const i of e(this, C))
    try {
      i(t, void 0, "remote");
    } catch (o) {
      console.error("SDS: presence handler failed", o);
    }
};
export {
  ae as SDS_SyncEngine
};
