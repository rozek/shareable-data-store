var X = Object.defineProperty;
var E = (n) => {
  throw TypeError(n);
};
var Y = (n, e, s) => e in n ? X(n, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : n[e] = s;
var Q = (n, e, s) => Y(n, typeof e != "symbol" ? e + "" : e, s), V = (n, e, s) => e.has(n) || E("Cannot " + s);
var t = (n, e, s) => (V(n, e, "read from private field"), s ? s.call(n) : e.get(n)), h = (n, e, s) => e.has(n) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, s), r = (n, e, s, i) => (V(n, e, "write to private field"), i ? i.call(n, s) : e.set(n, s), s), l = (n, e, s) => (V(n, e, "access private method"), s);
var q = (n, e, s, i) => ({
  set _(c) {
    r(n, e, c, s);
  },
  get _() {
    return t(n, e, i);
  }
});
import { SNS_Error as U } from "@rozek/sns-core";
const Z = 512 * 1024;
var u, d, a, w, k, B, H, _, S, L, P, b, m, C, T, p, g, v, R, M, y, o, I, j, $, z, F, x, G, J, K, W, D;
class et {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, s = {}) {
    h(this, o);
    h(this, u);
    h(this, d);
    h(this, a);
    h(this, w);
    h(this, k);
    Q(this, "PeerId", crypto.randomUUID());
    h(this, B);
    h(this, H);
    h(this, _, []);
    // outgoing patch queue (patches created while disconnected)
    h(this, S, 0);
    // accumulated patch bytes since last checkpoint
    h(this, L, 0);
    // sequence number of the last saved snapshot
    h(this, P, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    h(this, b, new Uint8Array(0));
    // heartbeat timer
    h(this, m);
    h(this, C);
    // presence peer tracking
    h(this, T, /* @__PURE__ */ new Map());
    h(this, p, /* @__PURE__ */ new Map());
    h(this, g, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    h(this, v);
    // connection state mirror
    h(this, R, "disconnected");
    h(this, M, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    h(this, y, []);
    r(this, u, e), r(this, d, s.PersistenceProvider ?? void 0), r(this, a, s.NetworkProvider ?? void 0), r(this, w, s.PresenceProvider ?? s.NetworkProvider ?? void 0), r(this, k, s.PresenceTimeoutMs ?? 12e4), (s.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && t(this, a) != null && r(this, v, new BroadcastChannel(`sns:${t(this, a).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await l(this, o, I).call(this), l(this, o, j).call(this), l(this, o, $).call(this), l(this, o, z).call(this), l(this, o, F).call(this), t(this, a) != null && t(this, a).onConnectionChange((e) => {
      r(this, R, e);
      for (const s of t(this, M))
        try {
          s(e);
        } catch {
        }
      e === "connected" && l(this, o, G).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, s, i;
    t(this, m) != null && (clearInterval(t(this, m)), r(this, m, void 0));
    for (const c of t(this, p).values())
      clearTimeout(c);
    t(this, p).clear();
    for (const c of t(this, y))
      try {
        c();
      } catch {
      }
    r(this, y, []), (e = t(this, v)) == null || e.close(), r(this, v, void 0), (s = t(this, a)) == null || s.disconnect(), t(this, d) != null && t(this, S) > 0 && await l(this, o, x).call(this), await ((i = t(this, d)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, s) {
    if (t(this, a) == null)
      throw new U("no-network-provider", "no NetworkProvider configured");
    r(this, B, e), r(this, H, s), await t(this, a).connect(e, s);
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
    if (t(this, B) == null)
      throw new U(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await t(this, a).connect(t(this, B), t(this, H));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return t(this, R);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return t(this, M).add(e), () => {
      t(this, M).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var i, c;
    r(this, C, e);
    const s = { ...e, PeerId: this.PeerId };
    (i = t(this, w)) == null || i.sendLocalState(e), (c = t(this, v)) == null || c.postMessage({ type: "presence", payload: e });
    for (const f of t(this, g))
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
    return t(this, g).add(e), () => {
      t(this, g).delete(e);
    };
  }
}
u = new WeakMap(), d = new WeakMap(), a = new WeakMap(), w = new WeakMap(), k = new WeakMap(), B = new WeakMap(), H = new WeakMap(), _ = new WeakMap(), S = new WeakMap(), L = new WeakMap(), P = new WeakMap(), b = new WeakMap(), m = new WeakMap(), C = new WeakMap(), T = new WeakMap(), p = new WeakMap(), g = new WeakMap(), v = new WeakMap(), R = new WeakMap(), M = new WeakMap(), y = new WeakMap(), o = new WeakSet(), I = async function() {
  if (t(this, d) == null)
    return;
  const e = await t(this, d).loadSnapshot();
  if (e != null)
    try {
      const i = t(this, u).constructor.fromBinary(e);
    } catch {
    }
  const s = await t(this, d).loadPatchesSince(t(this, L));
  for (const i of s)
    try {
      t(this, u).applyRemotePatch(i);
    } catch {
    }
  s.length > 0 && r(this, P, t(this, L) + s.length), r(this, b, t(this, u).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
j = function() {
  const e = t(this, u).onChangeInvoke((s, i) => {
    var N, A;
    if (s !== "internal")
      return;
    const c = t(this, b);
    q(this, P)._++;
    const f = t(this, u).exportPatch(c);
    r(this, b, t(this, u).currentCursor), f.byteLength !== 0 && (t(this, d) != null && (t(this, d).appendPatch(f, t(this, P)).catch(() => {
    }), r(this, S, t(this, S) + f.byteLength), t(this, S) >= Z && l(this, o, x).call(this).catch(() => {
    })), ((N = t(this, a)) == null ? void 0 : N.ConnectionState) === "connected" ? (t(this, a).sendPatch(f), (A = t(this, v)) == null || A.postMessage({ type: "patch", payload: f })) : t(this, _).push(f), l(this, o, J).call(this, i).catch(() => {
    }));
  });
  t(this, y).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
$ = function() {
  if (t(this, a) != null) {
    const s = t(this, a).onPatch((c) => {
      try {
        t(this, u).applyRemotePatch(c);
      } catch {
      }
    });
    t(this, y).push(s);
    const i = t(this, a).onValue(async (c, f) => {
      var N;
      await ((N = t(this, d)) == null ? void 0 : N.saveValue(c, f));
    });
    t(this, y).push(i);
  }
  const e = t(this, w);
  if (e != null) {
    const s = e.onRemoteState((i, c) => {
      l(this, o, K).call(this, i, c);
    });
    t(this, y).push(s);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
z = function() {
  const e = t(this, k) / 4;
  r(this, m, setInterval(() => {
    var s, i;
    t(this, C) != null && ((s = t(this, w)) == null || s.sendLocalState(t(this, C)), (i = t(this, v)) == null || i.postMessage({ type: "presence", payload: t(this, C) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
F = function() {
  t(this, v) != null && (t(this, v).onmessage = (e) => {
    var i;
    const s = e.data;
    if (s.type === "patch")
      try {
        t(this, u).applyRemotePatch(s.payload);
      } catch {
      }
    else s.type === "presence" && ((i = t(this, w)) == null || i.sendLocalState(s.payload));
  });
}, x = async function() {
  t(this, d) != null && (await t(this, d).saveSnapshot(t(this, u).asBinary()), await t(this, d).prunePatches(t(this, P)), r(this, L, t(this, P)), r(this, S, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
G = function() {
  var s;
  const e = t(this, _).splice(0);
  for (const i of e)
    try {
      (s = t(this, a)) == null || s.sendPatch(i);
    } catch {
    }
}, J = async function(e) {
  for (const [s, i] of Object.entries(e))
    i.has("Value") && t(this, a) != null;
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
K = function(e, s) {
  if (s == null) {
    l(this, o, D).call(this, e);
    return;
  }
  const i = { ...s, _lastSeen: Date.now() };
  t(this, T).set(e, i), l(this, o, W).call(this, e);
  for (const c of t(this, g))
    try {
      c(e, s, "remote");
    } catch {
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
W = function(e) {
  const s = t(this, p).get(e);
  s != null && clearTimeout(s);
  const i = setTimeout(
    () => {
      l(this, o, D).call(this, e);
    },
    t(this, k)
  );
  t(this, p).set(e, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
D = function(e) {
  if (!t(this, T).has(e))
    return;
  t(this, T).delete(e);
  const s = t(this, p).get(e);
  s != null && (clearTimeout(s), t(this, p).delete(e));
  for (const i of t(this, g))
    try {
      i(e, void 0, "remote");
    } catch {
    }
};
export {
  et as SNS_SyncEngine
};
