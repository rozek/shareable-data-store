var _ = Object.defineProperty;
var v = (a) => {
  throw TypeError(a);
};
var q = (a, t, n) => t in a ? _(a, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : a[t] = n;
var F = (a, t, n) => q(a, typeof t != "symbol" ? t + "" : t, n), A = (a, t, n) => t.has(a) || v("Cannot " + n);
var e = (a, t, n) => (A(a, t, "read from private field"), n ? n.call(a) : t.get(a)), l = (a, t, n) => t.has(a) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, n), w = (a, t, n, s) => (A(a, t, "write to private field"), s ? s.call(a, n) : t.set(a, n), n), c = (a, t, n) => (A(a, t, "access private method"), n);
var k, u, h, p, S, y, C, b, m, P, g, T, d, r, H, U, J, V, x, L, N, B, O, E;
class $ {
  /**** constructor ****/
  constructor(t, n = {}) {
    l(this, r);
    F(this, "StoreID");
    l(this, k);
    l(this, u, crypto.randomUUID());
    l(this, h);
    /**** Signalling WebSocket ****/
    l(this, p, null);
    /**** Active RTCPeerConnection per remote PeerId ****/
    l(this, S, /* @__PURE__ */ new Map());
    l(this, y, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    l(this, C, "disconnected");
    /**** Event handlers ****/
    l(this, b, /* @__PURE__ */ new Set());
    l(this, m, /* @__PURE__ */ new Set());
    l(this, P, /* @__PURE__ */ new Set());
    l(this, g, /* @__PURE__ */ new Set());
    /**** Presence peer set ****/
    l(this, T, /* @__PURE__ */ new Map());
    /**** Fallback mode ****/
    l(this, d, !1);
    this.StoreID = t, w(this, k, n), w(this, h, n.Fallback ?? null);
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return e(this, C);
  }
  /**** connect ****/
  async connect(t, n) {
    return new Promise((s, i) => {
      const o = `${t}?token=${encodeURIComponent(n.Token)}`, f = new WebSocket(o);
      w(this, p, f), c(this, r, H).call(this, "connecting"), f.onopen = () => {
        c(this, r, H).call(this, "connected"), c(this, r, U).call(this, { type: "hello", from: e(this, u) }), s();
      }, f.onerror = () => {
        if (!e(this, d) && e(this, h) != null) {
          const D = t.replace("/signal/", "/ws/");
          w(this, d, !0), e(this, h).connect(D, n).then(s).catch(i);
        } else
          i(new Error("WebRTC signalling connection failed"));
      }, f.onclose = () => {
        e(this, C) !== "disconnected" && (c(this, r, H).call(this, "reconnecting"), setTimeout(() => {
          e(this, C) === "reconnecting" && this.connect(t, n).catch(() => {
          });
        }, n.reconnectDelayMs ?? 2e3));
      }, f.onmessage = (D) => {
        try {
          const W = JSON.parse(D.data);
          c(this, r, J).call(this, W, n);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var t;
    c(this, r, H).call(this, "disconnected"), (t = e(this, p)) == null || t.close(), w(this, p, null);
    for (const n of e(this, S).values())
      n.close();
    e(this, S).clear(), e(this, y).clear(), e(this, d) && e(this, h) != null && (e(this, h).disconnect(), w(this, d, !1));
  }
  /**** sendPatch ****/
  sendPatch(t) {
    var s;
    if (e(this, d)) {
      (s = e(this, h)) == null || s.sendPatch(t);
      return;
    }
    const n = new Uint8Array(1 + t.byteLength);
    n[0] = 1, n.set(t, 1);
    for (const i of e(this, y).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(t, n) {
    var o;
    if (e(this, d)) {
      (o = e(this, h)) == null || o.sendValue(t, n);
      return;
    }
    const s = c(this, r, O).call(this, t), i = new Uint8Array(33 + n.byteLength);
    i[0] = 2, i.set(s, 1), i.set(n, 33);
    for (const f of e(this, y).values())
      if (f.readyState === "open")
        try {
          f.send(i);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(t) {
    var i;
    if (e(this, d)) {
      (i = e(this, h)) == null || i.requestValue(t);
      return;
    }
    const n = c(this, r, O).call(this, t), s = new Uint8Array(33);
    s[0] = 3, s.set(n, 1);
    for (const o of e(this, y).values())
      if (o.readyState === "open")
        try {
          o.send(s);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(t) {
    return e(this, b).add(t), e(this, d) && e(this, h) != null ? e(this, h).onPatch(t) : () => {
      e(this, b).delete(t);
    };
  }
  /**** onValue ****/
  onValue(t) {
    return e(this, m).add(t), e(this, d) && e(this, h) != null ? e(this, h).onValue(t) : () => {
      e(this, m).delete(t);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(t) {
    return e(this, P).add(t), () => {
      e(this, P).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(t) {
    var i;
    if (e(this, d)) {
      (i = e(this, h)) == null || i.sendLocalState(t);
      return;
    }
    const n = new TextEncoder().encode(JSON.stringify(t)), s = new Uint8Array(1 + n.byteLength);
    s[0] = 4, s.set(n, 1);
    for (const o of e(this, y).values())
      if (o.readyState === "open")
        try {
          o.send(s);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(t) {
    return e(this, g).add(t), () => {
      e(this, g).delete(t);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return e(this, T);
  }
}
k = new WeakMap(), u = new WeakMap(), h = new WeakMap(), p = new WeakMap(), S = new WeakMap(), y = new WeakMap(), C = new WeakMap(), b = new WeakMap(), m = new WeakMap(), P = new WeakMap(), g = new WeakMap(), T = new WeakMap(), d = new WeakMap(), r = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
H = function(t) {
  if (e(this, C) !== t) {
    w(this, C, t);
    for (const n of e(this, P))
      try {
        n(t);
      } catch {
      }
  }
}, U = function(t) {
  var n;
  ((n = e(this, p)) == null ? void 0 : n.readyState) === WebSocket.OPEN && e(this, p).send(JSON.stringify(t));
}, J = async function(t, n) {
  switch (t.type) {
    case "hello": {
      if (t.from === e(this, u))
        return;
      e(this, S).has(t.from) || await c(this, r, V).call(this, t.from);
      break;
    }
    case "offer": {
      if (t.to !== e(this, u))
        return;
      await c(this, r, x).call(this, t.from, t.sdp);
      break;
    }
    case "answer": {
      if (t.to !== e(this, u))
        return;
      const s = e(this, S).get(t.from);
      s != null && await s.setRemoteDescription(new RTCSessionDescription(t.sdp));
      break;
    }
    case "candidate": {
      if (t.to !== e(this, u))
        return;
      const s = e(this, S).get(t.from);
      s != null && await s.addIceCandidate(new RTCIceCandidate(t.candidate));
      break;
    }
  }
}, V = async function(t) {
  const n = c(this, r, L).call(this, t), s = n.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  c(this, r, N).call(this, s, t), e(this, y).set(t, s);
  const i = await n.createOffer();
  await n.setLocalDescription(i), c(this, r, U).call(this, { type: "offer", from: e(this, u), to: t, sdp: i });
}, x = async function(t, n) {
  const s = c(this, r, L).call(this, t);
  await s.setRemoteDescription(new RTCSessionDescription(n));
  const i = await s.createAnswer();
  await s.setLocalDescription(i), c(this, r, U).call(this, { type: "answer", from: e(this, u), to: t, sdp: i });
}, L = function(t) {
  const n = e(this, k).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], s = new RTCPeerConnection({ iceServers: n });
  return e(this, S).set(t, s), s.onicecandidate = (i) => {
    i.candidate != null && c(this, r, U).call(this, {
      type: "candidate",
      from: e(this, u),
      to: t,
      candidate: i.candidate.toJSON()
    });
  }, s.ondatachannel = (i) => {
    c(this, r, N).call(this, i.channel, t), e(this, y).set(t, i.channel);
  }, s.onconnectionstatechange = () => {
    if (s.connectionState === "failed" || s.connectionState === "closed") {
      e(this, S).delete(t), e(this, y).delete(t), e(this, T).delete(t);
      for (const i of e(this, g))
        try {
          i(t, null);
        } catch {
        }
    }
  }, s;
}, N = function(t, n) {
  t.binaryType = "arraybuffer", t.onmessage = (s) => {
    const i = new Uint8Array(s.data);
    c(this, r, B).call(this, i, n);
  };
}, B = function(t, n) {
  if (t.byteLength < 1)
    return;
  const s = t[0], i = t.slice(1);
  switch (s) {
    case 1: {
      for (const o of e(this, b))
        try {
          o(i);
        } catch {
        }
      break;
    }
    case 2: {
      if (i.byteLength < 32)
        return;
      const o = c(this, r, E).call(this, i.slice(0, 32)), f = i.slice(32);
      for (const D of e(this, m))
        try {
          D(o, f);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const o = JSON.parse(new TextDecoder().decode(i));
        if (typeof o.PeerId != "string")
          break;
        o.lastSeen = Date.now(), e(this, T).set(o.PeerId, o);
        for (const f of e(this, g))
          try {
            f(o.PeerId, o);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, O = function(t) {
  const n = new Uint8Array(t.length / 2);
  for (let s = 0; s < t.length; s += 2)
    n[s / 2] = parseInt(t.slice(s, s + 2), 16);
  return n;
}, E = function(t) {
  return Array.from(t).map((n) => n.toString(16).padStart(2, "0")).join("");
};
export {
  $ as SNS_WebRTCProvider
};
