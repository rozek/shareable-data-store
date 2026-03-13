var ie = Object.defineProperty;
var G = (a) => {
  throw TypeError(a);
};
var oe = (a, t, s) => t in a ? ie(a, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : a[t] = s;
var J = (a, t, s) => oe(a, typeof t != "symbol" ? t + "" : t, s), Q = (a, t, s) => t.has(a) || G("Cannot " + s);
var e = (a, t, s) => (Q(a, t, "read from private field"), s ? s.call(a) : t.get(a)), c = (a, t, s) => t.has(a) ? G("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, s), r = (a, t, s, i) => (Q(a, t, "write to private field"), i ? i.call(a, s) : t.set(a, s), s), p = (a, t, s) => (Q(a, t, "access private method"), s);
var K = (a, t, s, i) => ({
  set _(n) {
    r(a, t, n, s);
  },
  get _() {
    return e(a, t, i);
  }
});
import { SDS_Error as U } from "@rozek/sds-core";
const ne = 512 * 1024;
var d, l, o, H, R, M, N, _, L, q, P, B, k, V, D, T, b, S, E, x, g, m, C, h, W, X, Y, Z, O, j, ee, F, $, te, z;
class re {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(t, s = {}) {
    c(this, h);
    c(this, d);
    c(this, l);
    c(this, o);
    c(this, H);
    c(this, R);
    J(this, "PeerId", crypto.randomUUID());
    c(this, M);
    c(this, N);
    c(this, _, []);
    // outgoing patch queue (patches created while disconnected)
    c(this, L, 0);
    // accumulated patch bytes since last checkpoint
    c(this, q, 0);
    // sequence number of the last saved snapshot
    c(this, P, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    c(this, B, new Uint8Array(0));
    // heartbeat timer
    c(this, k);
    c(this, V);
    // presence peer tracking
    c(this, D, /* @__PURE__ */ new Map());
    c(this, T, /* @__PURE__ */ new Map());
    c(this, b, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    c(this, S);
    // connection state mirror
    c(this, E, "disconnected");
    c(this, x, /* @__PURE__ */ new Set());
    // pending sync-response timer (random delay before answering a sync request)
    c(this, g);
    // unsubscribe functions for registered handlers
    c(this, m, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    c(this, C, /* @__PURE__ */ new Map());
    var n;
    r(this, d, t), r(this, l, s.PersistenceProvider ?? void 0), r(this, o, s.NetworkProvider ?? void 0), r(this, H, s.PresenceProvider ?? (typeof ((n = s.NetworkProvider) == null ? void 0 : n.onRemoteState) == "function" ? s.NetworkProvider : void 0)), r(this, R, s.PresenceTimeoutMs ?? 12e4), (s.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && e(this, o) != null && r(this, S, new BroadcastChannel(`sds:${e(this, o).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    if (e(this, l) != null) {
      const t = e(this, l);
      e(this, d).setValueBlobLoader((s) => t.loadValue(s));
    }
    await p(this, h, W).call(this), p(this, h, X).call(this), p(this, h, Y).call(this), p(this, h, Z).call(this), p(this, h, O).call(this), e(this, o) != null && e(this, o).onConnectionChange((t) => {
      r(this, E, t);
      for (const s of e(this, x))
        try {
          s(t);
        } catch (i) {
          console.error("[SDS] connection-change handler threw:", i.message ?? i);
        }
      t === "connected" && (p(this, h, ee).call(this), e(this, o).sendSyncRequest(e(this, d).currentCursor));
    });
  }
  /**** stop ****/
  async stop() {
    var t, s, i;
    e(this, g) != null && (clearTimeout(e(this, g)), r(this, g, void 0)), e(this, k) != null && (clearInterval(e(this, k)), r(this, k, void 0));
    for (const n of e(this, T).values())
      clearTimeout(n);
    e(this, T).clear();
    for (const n of e(this, m))
      try {
        n();
      } catch {
      }
    r(this, m, []), (t = e(this, S)) == null || t.close(), r(this, S, void 0), (s = e(this, o)) == null || s.disconnect(), e(this, l) != null && await p(this, h, j).call(this), await ((i = e(this, l)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(t, s) {
    if (e(this, o) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    r(this, M, t), r(this, N, s), await e(this, o).connect(t, s);
  }
  /**** disconnect ****/
  disconnect() {
    if (e(this, o) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    e(this, o).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (e(this, o) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    if (e(this, M) == null)
      throw new U(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await e(this, o).connect(e(this, M), e(this, N));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return e(this, E);
  }
  /**** onConnectionChange ****/
  onConnectionChange(t) {
    return e(this, x).add(t), () => {
      e(this, x).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(t) {
    var i, n;
    r(this, V, t);
    const s = { ...t, PeerId: this.PeerId };
    (i = e(this, H)) == null || i.sendLocalState(t), (n = e(this, S)) == null || n.postMessage({ type: "presence", payload: s, senderId: this.PeerId });
    for (const u of e(this, b))
      try {
        u(this.PeerId, s, "local");
      } catch (f) {
        console.error("SDS: presence handler failed", f);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return e(this, D);
  }
  /**** onPresenceChange ****/
  onPresenceChange(t) {
    return e(this, b).add(t), () => {
      e(this, b).delete(t);
    };
  }
}
d = new WeakMap(), l = new WeakMap(), o = new WeakMap(), H = new WeakMap(), R = new WeakMap(), M = new WeakMap(), N = new WeakMap(), _ = new WeakMap(), L = new WeakMap(), q = new WeakMap(), P = new WeakMap(), B = new WeakMap(), k = new WeakMap(), V = new WeakMap(), D = new WeakMap(), T = new WeakMap(), b = new WeakMap(), S = new WeakMap(), E = new WeakMap(), x = new WeakMap(), g = new WeakMap(), m = new WeakMap(), C = new WeakMap(), h = new WeakSet(), W = async function() {
  if (e(this, l) == null)
    return;
  await e(this, l).loadSnapshot();
  const t = await e(this, l).loadPatchesSince(e(this, q));
  for (const s of t)
    try {
      e(this, d).applyRemotePatch(s);
    } catch {
    }
  t.length > 0 && r(this, P, e(this, q) + t.length), r(this, B, e(this, d).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
X = function() {
  const t = e(this, d).onChangeInvoke((s, i) => {
    var f, w;
    if (s === "external") {
      p(this, h, F).call(this, i, "request").catch((v) => {
        console.error("[SDS] value-request failed:", v.message ?? v);
      });
      return;
    }
    const n = e(this, B);
    K(this, P)._++;
    const u = e(this, d).exportPatch(n);
    r(this, B, e(this, d).currentCursor), u.byteLength !== 0 && (e(this, l) != null && (e(this, l).appendPatch(u, e(this, P)).catch((v) => {
      console.error("[SDS] appendPatch failed:", v.message ?? v);
    }), r(this, L, e(this, L) + u.byteLength), e(this, L) >= ne && p(this, h, j).call(this).catch((v) => {
      console.error("[SDS] checkpoint failed:", v.message ?? v);
    })), ((f = e(this, o)) == null ? void 0 : f.ConnectionState) === "connected" ? (e(this, o).sendPatch(u), (w = e(this, S)) == null || w.postMessage({ type: "patch", payload: u, senderId: this.PeerId })) : e(this, _).push(u), p(this, h, F).call(this, i, "send").catch((v) => {
      console.error("[SDS] value-send failed:", v.message ?? v);
    }));
  });
  e(this, m).push(t);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
Y = function() {
  if (e(this, o) != null) {
    const s = e(this, o).onPatch((u) => {
      try {
        e(this, d).applyRemotePatch(u);
      } catch {
      }
    });
    e(this, m).push(s);
    const i = e(this, o).onValue(async (u, f) => {
      var w;
      e(this, d).storeValueBlob(u, f), await ((w = e(this, l)) == null ? void 0 : w.saveValue(u, f));
    });
    e(this, m).push(i);
    const n = e(this, o).onSyncRequest((u) => {
      e(this, g) != null && clearTimeout(e(this, g));
      const f = 50 + Math.floor(Math.random() * 250);
      r(this, g, setTimeout(() => {
        var v;
        r(this, g, void 0);
        const w = e(this, d).exportPatch();
        w.byteLength > 0 && ((v = e(this, o)) == null || v.sendPatch(w));
      }, f));
    });
    e(this, m).push(n);
  }
  const t = e(this, H);
  if (t != null) {
    const s = t.onRemoteState((i, n) => {
      p(this, h, $).call(this, i, n);
    });
    e(this, m).push(s);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
Z = function() {
  const t = e(this, R) / 4;
  r(this, k, setInterval(() => {
    var s, i;
    if (e(this, V) != null) {
      (s = e(this, H)) == null || s.sendLocalState(e(this, V));
      const n = { ...e(this, V), PeerId: this.PeerId };
      (i = e(this, S)) == null || i.postMessage({ type: "presence", payload: n, senderId: this.PeerId });
    }
  }, t));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
O = function() {
  e(this, S) != null && (e(this, S).onmessage = (t) => {
    const s = t.data;
    if (s.senderId !== this.PeerId)
      switch (!0) {
        case s.type === "patch":
          try {
            e(this, d).applyRemotePatch(s.payload);
          } catch (i) {
            console.error("[SDS] failed to apply BC patch:", i.message ?? i);
          }
          break;
        case s.type === "presence":
          p(this, h, $).call(this, s.payload.PeerId ?? s.senderId ?? "unknown", s.payload);
          break;
      }
  });
}, j = async function() {
  if (e(this, l) == null)
    return;
  const t = await e(this, l).loadPatchesSince(e(this, P));
  for (const s of t)
    try {
      e(this, d).applyRemotePatch(s);
    } catch {
    }
  t.length > 0 && (r(this, P, e(this, P) + t.length), r(this, B, e(this, d).currentCursor)), await e(this, l).saveSnapshot(e(this, d).asBinary(), e(this, P)), e(this, o) != null && (await e(this, l).prunePatches(e(this, P)), r(this, q, e(this, P))), r(this, L, 0);
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
ee = function() {
  var s;
  const t = e(this, _).splice(0);
  for (const i of t)
    try {
      (s = e(this, o)) == null || s.sendPatch(i);
    } catch (n) {
      console.error("SDS: failed to send queued patch", n);
    }
}, F = async function(t, s) {
  var i, n, u;
  for (const [f, w] of Object.entries(t)) {
    const v = w;
    if (v.has("Existence")) {
      const I = e(this, C).get(f);
      I != null && (await ((i = e(this, l)) == null ? void 0 : i.releaseValue(I)), e(this, C).delete(f));
    }
    if (!v.has("Value"))
      continue;
    const A = e(this, C).get(f), y = e(this, d)._getValueRefOf(f), se = y == null ? void 0 : y.Hash;
    if (A != null && A !== se && (await ((n = e(this, l)) == null ? void 0 : n.releaseValue(A)), e(this, C).delete(f)), y != null) {
      if (e(this, o) == null) {
        e(this, C).set(f, y.Hash);
        continue;
      }
      if (s === "send") {
        const I = e(this, d).getValueBlobByHash(y.Hash);
        I != null && (await ((u = e(this, l)) == null ? void 0 : u.saveValue(y.Hash, I)), e(this, C).set(f, y.Hash), e(this, o).ConnectionState === "connected" && e(this, o).sendValue(y.Hash, I));
      } else
        e(this, C).set(f, y.Hash), !e(this, d).hasValueBlob(y.Hash) && e(this, o).ConnectionState === "connected" && e(this, o).requestValue(y.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
$ = function(t, s) {
  if (s == null) {
    p(this, h, z).call(this, t);
    return;
  }
  const i = { ...s, _lastSeen: Date.now() };
  e(this, D).set(t, i), p(this, h, te).call(this, t);
  for (const n of e(this, b))
    try {
      n(t, s, "remote");
    } catch (u) {
      console.error("SDS: presence handler failed", u);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
te = function(t) {
  const s = e(this, T).get(t);
  s != null && clearTimeout(s);
  const i = setTimeout(
    () => {
      p(this, h, z).call(this, t);
    },
    e(this, R)
  );
  e(this, T).set(t, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
z = function(t) {
  if (!e(this, D).has(t))
    return;
  e(this, D).delete(t);
  const s = e(this, T).get(t);
  s != null && (clearTimeout(s), e(this, T).delete(t));
  for (const i of e(this, b))
    try {
      i(t, void 0, "remote");
    } catch (n) {
      console.error("SDS: presence handler failed", n);
    }
};
export {
  re as SDS_SyncEngine
};
