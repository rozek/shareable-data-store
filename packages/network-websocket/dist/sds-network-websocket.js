var O = Object.defineProperty;
var Z = (n) => {
  throw TypeError(n);
};
var Q = (n, e, t) => e in n ? O(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var T = (n, e, t) => Q(n, typeof e != "symbol" ? e + "" : e, t), G = (n, e, t) => e.has(n) || Z("Cannot " + t);
var s = (n, e, t) => (G(n, e, "read from private field"), t ? t.call(n) : e.get(n)), h = (n, e, t) => e.has(n) ? Z("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), d = (n, e, t, c) => (G(n, e, "write to private field"), c ? c.call(n, t) : e.set(n, t), t), a = (n, e, t) => (G(n, e, "access private method"), t);
function P(...n) {
  const e = n.reduce((o, r) => o + r.byteLength, 0), t = new Uint8Array(e);
  let c = 0;
  for (const o of n)
    t.set(o, c), c += o.byteLength;
  return t;
}
function A(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function m(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function v(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var l, f, L, g, H, w, E, U, M, C, I, R, i, p, u, b, D, K, W;
class X {
  /**** constructor ****/
  constructor(e) {
    h(this, i);
    T(this, "StoreId");
    h(this, l, "disconnected");
    h(this, f);
    h(this, L, "");
    h(this, g);
    h(this, H);
    h(this, w, /* @__PURE__ */ new Set());
    h(this, E, /* @__PURE__ */ new Set());
    h(this, U, /* @__PURE__ */ new Set());
    h(this, M, /* @__PURE__ */ new Set());
    h(this, C, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    h(this, I, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    h(this, R, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return s(this, l);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SDS WebSocket: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return d(this, L, e), d(this, g, t), a(this, i, p).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    a(this, i, K).call(this), a(this, i, b).call(this, "disconnected"), (e = s(this, f)) == null || e.close(), d(this, f, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    a(this, i, u).call(this, A(1, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const c = m(e);
    if (t.byteLength <= 1048576)
      a(this, i, u).call(this, A(2, P(c, t)));
    else {
      const o = Math.ceil(t.byteLength / 1048576);
      for (let r = 0; r < o; r++) {
        const S = r * 1048576, k = t.slice(S, S + 1048576), y = new Uint8Array(40);
        y.set(c, 0), new DataView(y.buffer).setUint32(32, r, !1), new DataView(y.buffer).setUint32(36, o, !1), a(this, i, u).call(this, A(5, P(y, k)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    a(this, i, u).call(this, A(3, m(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return s(this, w).add(e), () => {
      s(this, w).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return s(this, E).add(e), () => {
      s(this, E).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return s(this, U).add(e), () => {
      s(this, U).delete(e);
    };
  }
  /**** sendSyncRequest ****/
  sendSyncRequest(e) {
    a(this, i, u).call(this, A(6, e));
  }
  /**** onSyncRequest ****/
  onSyncRequest(e) {
    return s(this, C).add(e), () => {
      s(this, C).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    a(this, i, u).call(this, A(4, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return s(this, M).add(e), () => {
      s(this, M).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return s(this, R);
  }
}
l = new WeakMap(), f = new WeakMap(), L = new WeakMap(), g = new WeakMap(), H = new WeakMap(), w = new WeakMap(), E = new WeakMap(), U = new WeakMap(), M = new WeakMap(), C = new WeakMap(), I = new WeakMap(), R = new WeakMap(), i = new WeakSet(), /**** #doConnect ****/
p = function() {
  return new Promise((e, t) => {
    const o = `${s(this, L).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(s(this, g).Token)}`, r = new WebSocket(o);
    r.binaryType = "arraybuffer", d(this, f, r), a(this, i, b).call(this, "connecting"), r.onopen = () => {
      a(this, i, b).call(this, "connected"), e();
    }, r.onerror = (S) => {
      s(this, l) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      d(this, f, void 0), s(this, l) !== "disconnected" && (a(this, i, b).call(this, "reconnecting"), a(this, i, D).call(this));
    }, r.onmessage = (S) => {
      a(this, i, W).call(this, new Uint8Array(S.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
u = function(e) {
  var t;
  ((t = s(this, f)) == null ? void 0 : t.readyState) === WebSocket.OPEN && s(this, f).send(e);
}, /**** #setState ****/
b = function(e) {
  if (s(this, l) !== e) {
    d(this, l, e);
    for (const t of s(this, U))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
D = function() {
  var t;
  const e = ((t = s(this, g)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  d(this, H, setTimeout(() => {
    s(this, l) === "reconnecting" && a(this, i, p).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
K = function() {
  s(this, H) != null && (clearTimeout(s(this, H)), d(this, H, void 0));
}, /**** #handleFrame ****/
W = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], c = e.slice(1);
  switch (t) {
    case 1: {
      for (const o of s(this, w))
        try {
          o(c);
        } catch {
        }
      break;
    }
    case 2: {
      if (c.byteLength < 32)
        return;
      const o = v(c.slice(0, 32)), r = c.slice(32);
      for (const S of s(this, E))
        try {
          S(o, r);
        } catch {
        }
      break;
    }
    case 3:
      break;
    case 4: {
      try {
        const o = JSON.parse(new TextDecoder().decode(c));
        if (typeof o.PeerId != "string")
          break;
        o.lastSeen = Date.now(), s(this, R).set(o.PeerId, o);
        for (const r of s(this, M))
          try {
            r(o.PeerId, o);
          } catch {
          }
      } catch {
      }
      break;
    }
    case 6: {
      for (const o of s(this, C))
        try {
          o(c);
        } catch {
        }
      break;
    }
    case 5: {
      if (c.byteLength < 40)
        return;
      const o = v(c.slice(0, 32)), r = new DataView(c.buffer, c.byteOffset + 32, 8), S = r.getUint32(0, !1), k = r.getUint32(4, !1), y = c.slice(40);
      let _ = s(this, I).get(o);
      if (_ == null && (_ = { total: k, chunks: /* @__PURE__ */ new Map() }, s(this, I).set(o, _)), _.chunks.set(S, y), _.chunks.size === _.total) {
        const B = P(
          ...Array.from({ length: _.total }, (N, V) => _.chunks.get(V))
        );
        s(this, I).delete(o);
        for (const N of s(this, E))
          try {
            N(o, B);
          } catch {
          }
      }
      break;
    }
  }
};
export {
  X as SDS_WebSocketProvider
};
