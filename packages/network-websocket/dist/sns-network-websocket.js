var X = Object.defineProperty;
var N = (n) => {
  throw TypeError(n);
};
var x = (n, e, t) => e in n ? X(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var p = (n, e, t) => x(n, typeof e != "symbol" ? e + "" : e, t), P = (n, e, t) => e.has(n) || N("Cannot " + t);
var s = (n, e, t) => (P(n, e, "read from private field"), t ? t.call(n) : e.get(n)), h = (n, e, t) => e.has(n) ? N("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), S = (n, e, t, c) => (P(n, e, "write to private field"), c ? c.call(n, t) : e.set(n, t), t), a = (n, e, t) => (P(n, e, "access private method"), t);
function T(...n) {
  const e = n.reduce((o, r) => o + r.byteLength, 0), t = new Uint8Array(e);
  let c = 0;
  for (const o of n)
    t.set(o, c), c += o.byteLength;
  return t;
}
function C(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function R(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function m(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var l, d, b, A, _, g, H, U, M, w, L, i, V, y, I, D, K, W;
class Q {
  /**** constructor ****/
  constructor(e) {
    h(this, i);
    p(this, "StoreID");
    h(this, l, "disconnected");
    h(this, d, null);
    h(this, b, "");
    h(this, A, null);
    h(this, _, null);
    h(this, g, /* @__PURE__ */ new Set());
    h(this, H, /* @__PURE__ */ new Set());
    h(this, U, /* @__PURE__ */ new Set());
    h(this, M, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    h(this, w, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    h(this, L, /* @__PURE__ */ new Map());
    this.StoreID = e;
  }
  //----------------------------------------------------------------------------//
  //                             SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return s(this, l);
  }
  /**** connect ****/
  async connect(e, t) {
    return S(this, b, e), S(this, A, t), a(this, i, V).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    a(this, i, K).call(this), a(this, i, I).call(this, "disconnected"), (e = s(this, d)) == null || e.close(), S(this, d, null);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    a(this, i, y).call(this, C(1, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const c = R(e);
    if (t.byteLength <= 1048576)
      a(this, i, y).call(this, C(2, T(c, t)));
    else {
      const o = Math.ceil(t.byteLength / 1048576);
      for (let r = 0; r < o; r++) {
        const f = r * 1048576, k = t.slice(f, f + 1048576), E = new Uint8Array(40);
        E.set(c, 0), new DataView(E.buffer).setUint32(32, r, !1), new DataView(E.buffer).setUint32(36, o, !1), a(this, i, y).call(this, C(5, T(E, k)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    a(this, i, y).call(this, C(3, R(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return s(this, g).add(e), () => {
      s(this, g).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return s(this, H).add(e), () => {
      s(this, H).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return s(this, U).add(e), () => {
      s(this, U).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SNS_PresenceProvider                             //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    a(this, i, y).call(this, C(4, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return s(this, M).add(e), () => {
      s(this, M).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return s(this, L);
  }
}
l = new WeakMap(), d = new WeakMap(), b = new WeakMap(), A = new WeakMap(), _ = new WeakMap(), g = new WeakMap(), H = new WeakMap(), U = new WeakMap(), M = new WeakMap(), w = new WeakMap(), L = new WeakMap(), i = new WeakSet(), /**** #doConnect ****/
V = function() {
  return new Promise((e, t) => {
    const c = `${s(this, b)}?token=${encodeURIComponent(s(this, A).Token)}`, o = new WebSocket(c);
    o.binaryType = "arraybuffer", S(this, d, o), a(this, i, I).call(this, "connecting"), o.onopen = () => {
      a(this, i, I).call(this, "connected"), e();
    }, o.onerror = (r) => {
      s(this, l) === "connecting" && t(new Error("WebSocket connection failed"));
    }, o.onclose = () => {
      S(this, d, null), s(this, l) !== "disconnected" && (a(this, i, I).call(this, "reconnecting"), a(this, i, D).call(this));
    }, o.onmessage = (r) => {
      a(this, i, W).call(this, new Uint8Array(r.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
y = function(e) {
  var t;
  ((t = s(this, d)) == null ? void 0 : t.readyState) === WebSocket.OPEN && s(this, d).send(e);
}, /**** #setState ****/
I = function(e) {
  if (s(this, l) !== e) {
    S(this, l, e);
    for (const t of s(this, U))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
D = function() {
  var t;
  const e = ((t = s(this, A)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  S(this, _, setTimeout(() => {
    s(this, l) === "reconnecting" && a(this, i, V).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
K = function() {
  s(this, _) != null && (clearTimeout(s(this, _)), S(this, _, null));
}, /**** #handleFrame ****/
W = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], c = e.slice(1);
  switch (t) {
    case 1: {
      for (const o of s(this, g))
        try {
          o(c);
        } catch {
        }
      break;
    }
    case 2: {
      if (c.byteLength < 32)
        return;
      const o = m(c.slice(0, 32)), r = c.slice(32);
      for (const f of s(this, H))
        try {
          f(o, r);
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
        o.lastSeen = Date.now(), s(this, L).set(o.PeerId, o);
        for (const r of s(this, M))
          try {
            r(o.PeerId, o);
          } catch {
          }
      } catch {
      }
      break;
    }
    case 5: {
      if (c.byteLength < 40)
        return;
      const o = m(c.slice(0, 32)), r = new DataView(c.buffer, c.byteOffset + 32, 8), f = r.getUint32(0, !1), k = r.getUint32(4, !1), E = c.slice(40);
      let u = s(this, w).get(o);
      if (u == null && (u = { total: k, chunks: /* @__PURE__ */ new Map() }, s(this, w).set(o, u)), u.chunks.set(f, E), u.chunks.size === u.total) {
        const O = T(
          ...Array.from({ length: u.total }, (Z, G) => u.chunks.get(G))
        );
        s(this, w).delete(o);
        for (const Z of s(this, H))
          try {
            Z(o, O);
          } catch {
          }
      }
      break;
    }
  }
};
export {
  Q as SNS_WebSocketProvider
};
