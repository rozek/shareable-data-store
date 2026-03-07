var O = Object.defineProperty;
var p = (n) => {
  throw TypeError(n);
};
var B = (n, e, t) => e in n ? O(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var R = (n, e, t) => B(n, typeof e != "symbol" ? e + "" : e, t), P = (n, e, t) => e.has(n) || p("Cannot " + t);
var s = (n, e, t) => (P(n, e, "read from private field"), t ? t.call(n) : e.get(n)), h = (n, e, t) => e.has(n) ? p("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), S = (n, e, t, i) => (P(n, e, "write to private field"), i ? i.call(n, t) : e.set(n, t), t), a = (n, e, t) => (P(n, e, "access private method"), t);
function V(...n) {
  const e = n.reduce((o, r) => o + r.byteLength, 0), t = new Uint8Array(e);
  let i = 0;
  for (const o of n)
    t.set(o, i), i += o.byteLength;
  return t;
}
function C(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function T(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function m(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var d, l, b, A, u, g, H, U, M, w, L, c, Z, y, I, D, v, K;
class x {
  /**** constructor ****/
  constructor(e) {
    h(this, c);
    R(this, "StoreID");
    h(this, d, "disconnected");
    h(this, l);
    h(this, b, "");
    h(this, A);
    h(this, u);
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
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return s(this, d);
  }
  /**** connect ****/
  async connect(e, t) {
    return S(this, b, e), S(this, A, t), a(this, c, Z).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    a(this, c, v).call(this), a(this, c, I).call(this, "disconnected"), (e = s(this, l)) == null || e.close(), S(this, l, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    a(this, c, y).call(this, C(1, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const i = T(e);
    if (t.byteLength <= 1048576)
      a(this, c, y).call(this, C(2, V(i, t)));
    else {
      const o = Math.ceil(t.byteLength / 1048576);
      for (let r = 0; r < o; r++) {
        const _ = r * 1048576, k = t.slice(_, _ + 1048576), E = new Uint8Array(40);
        E.set(i, 0), new DataView(E.buffer).setUint32(32, r, !1), new DataView(E.buffer).setUint32(36, o, !1), a(this, c, y).call(this, C(5, V(E, k)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    a(this, c, y).call(this, C(3, T(e)));
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
  //                            SNS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    a(this, c, y).call(this, C(4, t));
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
d = new WeakMap(), l = new WeakMap(), b = new WeakMap(), A = new WeakMap(), u = new WeakMap(), g = new WeakMap(), H = new WeakMap(), U = new WeakMap(), M = new WeakMap(), w = new WeakMap(), L = new WeakMap(), c = new WeakSet(), /**** #doConnect ****/
Z = function() {
  return new Promise((e, t) => {
    const i = `${s(this, b)}?token=${encodeURIComponent(s(this, A).Token)}`, o = new WebSocket(i);
    o.binaryType = "arraybuffer", S(this, l, o), a(this, c, I).call(this, "connecting"), o.onopen = () => {
      a(this, c, I).call(this, "connected"), e();
    }, o.onerror = (r) => {
      s(this, d) === "connecting" && t(new Error("WebSocket connection failed"));
    }, o.onclose = () => {
      S(this, l, void 0), s(this, d) !== "disconnected" && (a(this, c, I).call(this, "reconnecting"), a(this, c, D).call(this));
    }, o.onmessage = (r) => {
      a(this, c, K).call(this, new Uint8Array(r.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
y = function(e) {
  var t;
  ((t = s(this, l)) == null ? void 0 : t.readyState) === WebSocket.OPEN && s(this, l).send(e);
}, /**** #setState ****/
I = function(e) {
  if (s(this, d) !== e) {
    S(this, d, e);
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
  S(this, u, setTimeout(() => {
    s(this, d) === "reconnecting" && a(this, c, Z).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
v = function() {
  s(this, u) != null && (clearTimeout(s(this, u)), S(this, u, void 0));
}, /**** #handleFrame ****/
K = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], i = e.slice(1);
  switch (t) {
    case 1: {
      for (const o of s(this, g))
        try {
          o(i);
        } catch {
        }
      break;
    }
    case 2: {
      if (i.byteLength < 32)
        return;
      const o = m(i.slice(0, 32)), r = i.slice(32);
      for (const _ of s(this, H))
        try {
          _(o, r);
        } catch {
        }
      break;
    }
    case 3:
      break;
    case 4: {
      try {
        const o = JSON.parse(new TextDecoder().decode(i));
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
      if (i.byteLength < 40)
        return;
      const o = m(i.slice(0, 32)), r = new DataView(i.buffer, i.byteOffset + 32, 8), _ = r.getUint32(0, !1), k = r.getUint32(4, !1), E = i.slice(40);
      let f = s(this, w).get(o);
      if (f == null && (f = { total: k, chunks: /* @__PURE__ */ new Map() }, s(this, w).set(o, f)), f.chunks.set(_, E), f.chunks.size === f.total) {
        const W = V(
          ...Array.from({ length: f.total }, (G, N) => f.chunks.get(N))
        );
        s(this, w).delete(o);
        for (const G of s(this, H))
          try {
            G(o, W);
          } catch {
          }
      }
      break;
    }
  }
};
export {
  x as SNS_WebSocketProvider
};
