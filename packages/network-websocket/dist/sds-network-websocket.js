var B = Object.defineProperty;
var R = (n) => {
  throw TypeError(n);
};
var O = (n, e, t) => e in n ? B(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var T = (n, e, t) => O(n, typeof e != "symbol" ? e + "" : e, t), P = (n, e, t) => e.has(n) || R("Cannot " + t);
var s = (n, e, t) => (P(n, e, "read from private field"), t ? t.call(n) : e.get(n)), h = (n, e, t) => e.has(n) ? R("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), d = (n, e, t, c) => (P(n, e, "write to private field"), c ? c.call(n, t) : e.set(n, t), t), a = (n, e, t) => (P(n, e, "access private method"), t);
function p(...n) {
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
function N(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function m(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var l, f, b, A, u, g, H, w, U, M, L, i, V, y, I, v, D, K;
class X {
  /**** constructor ****/
  constructor(e) {
    h(this, i);
    T(this, "StoreId");
    h(this, l, "disconnected");
    h(this, f);
    h(this, b, "");
    h(this, A);
    h(this, u);
    h(this, g, /* @__PURE__ */ new Set());
    h(this, H, /* @__PURE__ */ new Set());
    h(this, w, /* @__PURE__ */ new Set());
    h(this, U, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    h(this, M, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    h(this, L, /* @__PURE__ */ new Map());
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
    return d(this, b, e), d(this, A, t), a(this, i, V).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    a(this, i, D).call(this), a(this, i, I).call(this, "disconnected"), (e = s(this, f)) == null || e.close(), d(this, f, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    a(this, i, y).call(this, C(1, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const c = N(e);
    if (t.byteLength <= 1048576)
      a(this, i, y).call(this, C(2, p(c, t)));
    else {
      const o = Math.ceil(t.byteLength / 1048576);
      for (let r = 0; r < o; r++) {
        const S = r * 1048576, k = t.slice(S, S + 1048576), E = new Uint8Array(40);
        E.set(c, 0), new DataView(E.buffer).setUint32(32, r, !1), new DataView(E.buffer).setUint32(36, o, !1), a(this, i, y).call(this, C(5, p(E, k)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    a(this, i, y).call(this, C(3, N(e)));
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
    return s(this, w).add(e), () => {
      s(this, w).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    a(this, i, y).call(this, C(4, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return s(this, U).add(e), () => {
      s(this, U).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return s(this, L);
  }
}
l = new WeakMap(), f = new WeakMap(), b = new WeakMap(), A = new WeakMap(), u = new WeakMap(), g = new WeakMap(), H = new WeakMap(), w = new WeakMap(), U = new WeakMap(), M = new WeakMap(), L = new WeakMap(), i = new WeakSet(), /**** #doConnect ****/
V = function() {
  return new Promise((e, t) => {
    const o = `${s(this, b).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(s(this, A).Token)}`, r = new WebSocket(o);
    r.binaryType = "arraybuffer", d(this, f, r), a(this, i, I).call(this, "connecting"), r.onopen = () => {
      a(this, i, I).call(this, "connected"), e();
    }, r.onerror = (S) => {
      s(this, l) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      d(this, f, void 0), s(this, l) !== "disconnected" && (a(this, i, I).call(this, "reconnecting"), a(this, i, v).call(this));
    }, r.onmessage = (S) => {
      a(this, i, K).call(this, new Uint8Array(S.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
y = function(e) {
  var t;
  ((t = s(this, f)) == null ? void 0 : t.readyState) === WebSocket.OPEN && s(this, f).send(e);
}, /**** #setState ****/
I = function(e) {
  if (s(this, l) !== e) {
    d(this, l, e);
    for (const t of s(this, w))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
v = function() {
  var t;
  const e = ((t = s(this, A)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  d(this, u, setTimeout(() => {
    s(this, l) === "reconnecting" && a(this, i, V).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
D = function() {
  s(this, u) != null && (clearTimeout(s(this, u)), d(this, u, void 0));
}, /**** #handleFrame ****/
K = function(e) {
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
      for (const S of s(this, H))
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
        o.lastSeen = Date.now(), s(this, L).set(o.PeerId, o);
        for (const r of s(this, U))
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
      const o = m(c.slice(0, 32)), r = new DataView(c.buffer, c.byteOffset + 32, 8), S = r.getUint32(0, !1), k = r.getUint32(4, !1), E = c.slice(40);
      let _ = s(this, M).get(o);
      if (_ == null && (_ = { total: k, chunks: /* @__PURE__ */ new Map() }, s(this, M).set(o, _)), _.chunks.set(S, E), _.chunks.size === _.total) {
        const W = p(
          ...Array.from({ length: _.total }, (Z, G) => _.chunks.get(G))
        );
        s(this, M).delete(o);
        for (const Z of s(this, H))
          try {
            Z(o, W);
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
