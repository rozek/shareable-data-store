var I = Object.defineProperty;
var F = (a) => {
  throw TypeError(a);
};
var _ = (a, t, n) => t in a ? I(a, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : a[t] = n;
var N = (a, t, n) => _(a, typeof t != "symbol" ? t + "" : t, n), A = (a, t, n) => t.has(a) || F("Cannot " + n);
var e = (a, t, n) => (A(a, t, "read from private field"), n ? n.call(a) : t.get(a)), d = (a, t, n) => t.has(a) ? F("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, n), w = (a, t, n, s) => (A(a, t, "write to private field"), s ? s.call(a, n) : t.set(a, n), n), c = (a, t, n) => (A(a, t, "access private method"), n);
var k, y, h, p, S, u, g, b, m, T, C, P, l, r, H, v, x, J, V, U, L, B, W, E;
class q {
  /**** Constructor ****/
  constructor(t, n = {}) {
    d(this, r);
    N(this, "StoreId");
    d(this, k);
    d(this, y, crypto.randomUUID());
    d(this, h);
    /**** Signalling WebSocket ****/
    d(this, p);
    /**** active RTCPeerConnection per remote PeerId ****/
    d(this, S, /* @__PURE__ */ new Map());
    d(this, u, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    d(this, g, "disconnected");
    /**** Event Handlers ****/
    d(this, b, /* @__PURE__ */ new Set());
    d(this, m, /* @__PURE__ */ new Set());
    d(this, T, /* @__PURE__ */ new Set());
    d(this, C, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    d(this, P, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    d(this, l, !1);
    this.StoreId = t, w(this, k, n), w(this, h, n.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return e(this, g);
  }
  /**** connect ****/
  async connect(t, n) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(t))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${t}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((s, i) => {
      const o = `${t}?token=${encodeURIComponent(n.Token)}`, f = new WebSocket(o);
      w(this, p, f), c(this, r, H).call(this, "connecting"), f.onopen = () => {
        c(this, r, H).call(this, "connected"), c(this, r, v).call(this, { type: "hello", from: e(this, y) }), s();
      }, f.onerror = () => {
        if (!e(this, l) && e(this, h) != null) {
          const D = t.replace("/signal/", "/ws/");
          w(this, l, !0), e(this, h).connect(D, n).then(s).catch(i);
        } else
          i(new Error("WebRTC signalling connection failed"));
      }, f.onclose = () => {
        e(this, g) !== "disconnected" && (c(this, r, H).call(this, "reconnecting"), setTimeout(() => {
          e(this, g) === "reconnecting" && this.connect(t, n).catch(() => {
          });
        }, n.reconnectDelayMs ?? 2e3));
      }, f.onmessage = (D) => {
        try {
          const O = JSON.parse(D.data);
          c(this, r, x).call(this, O, n);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var t;
    c(this, r, H).call(this, "disconnected"), (t = e(this, p)) == null || t.close(), w(this, p, void 0);
    for (const n of e(this, S).values())
      n.close();
    e(this, S).clear(), e(this, u).clear(), e(this, l) && e(this, h) != null && (e(this, h).disconnect(), w(this, l, !1));
  }
  /**** sendPatch ****/
  sendPatch(t) {
    var s;
    if (e(this, l)) {
      (s = e(this, h)) == null || s.sendPatch(t);
      return;
    }
    const n = new Uint8Array(1 + t.byteLength);
    n[0] = 1, n.set(t, 1);
    for (const i of e(this, u).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(t, n) {
    var o;
    if (e(this, l)) {
      (o = e(this, h)) == null || o.sendValue(t, n);
      return;
    }
    const s = c(this, r, W).call(this, t), i = new Uint8Array(33 + n.byteLength);
    i[0] = 2, i.set(s, 1), i.set(n, 33);
    for (const f of e(this, u).values())
      if (f.readyState === "open")
        try {
          f.send(i);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(t) {
    var i;
    if (e(this, l)) {
      (i = e(this, h)) == null || i.requestValue(t);
      return;
    }
    const n = c(this, r, W).call(this, t), s = new Uint8Array(33);
    s[0] = 3, s.set(n, 1);
    for (const o of e(this, u).values())
      if (o.readyState === "open")
        try {
          o.send(s);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(t) {
    return e(this, b).add(t), e(this, l) && e(this, h) != null ? e(this, h).onPatch(t) : () => {
      e(this, b).delete(t);
    };
  }
  /**** onValue ****/
  onValue(t) {
    return e(this, m).add(t), e(this, l) && e(this, h) != null ? e(this, h).onValue(t) : () => {
      e(this, m).delete(t);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(t) {
    return e(this, T).add(t), () => {
      e(this, T).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(t) {
    var i;
    if (e(this, l)) {
      (i = e(this, h)) == null || i.sendLocalState(t);
      return;
    }
    const n = new TextEncoder().encode(JSON.stringify(t)), s = new Uint8Array(1 + n.byteLength);
    s[0] = 4, s.set(n, 1);
    for (const o of e(this, u).values())
      if (o.readyState === "open")
        try {
          o.send(s);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(t) {
    return e(this, C).add(t), () => {
      e(this, C).delete(t);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return e(this, P);
  }
}
k = new WeakMap(), y = new WeakMap(), h = new WeakMap(), p = new WeakMap(), S = new WeakMap(), u = new WeakMap(), g = new WeakMap(), b = new WeakMap(), m = new WeakMap(), T = new WeakMap(), C = new WeakMap(), P = new WeakMap(), l = new WeakMap(), r = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
H = function(t) {
  if (e(this, g) !== t) {
    w(this, g, t);
    for (const n of e(this, T))
      try {
        n(t);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
v = function(t) {
  var n;
  ((n = e(this, p)) == null ? void 0 : n.readyState) === WebSocket.OPEN && e(this, p).send(JSON.stringify(t));
}, x = async function(t, n) {
  switch (t.type) {
    case "hello": {
      if (t.from === e(this, y))
        return;
      e(this, S).has(t.from) || await c(this, r, J).call(this, t.from);
      break;
    }
    case "offer": {
      if (t.to !== e(this, y))
        return;
      await c(this, r, V).call(this, t.from, t.sdp);
      break;
    }
    case "answer": {
      if (t.to !== e(this, y))
        return;
      const s = e(this, S).get(t.from);
      s != null && await s.setRemoteDescription(new RTCSessionDescription(t.sdp));
      break;
    }
    case "candidate": {
      if (t.to !== e(this, y))
        return;
      const s = e(this, S).get(t.from);
      s != null && await s.addIceCandidate(new RTCIceCandidate(t.candidate));
      break;
    }
  }
}, J = async function(t) {
  const n = c(this, r, U).call(this, t), s = n.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  c(this, r, L).call(this, s, t), e(this, u).set(t, s);
  const i = await n.createOffer();
  await n.setLocalDescription(i), c(this, r, v).call(this, { type: "offer", from: e(this, y), to: t, sdp: i });
}, V = async function(t, n) {
  const s = c(this, r, U).call(this, t);
  await s.setRemoteDescription(new RTCSessionDescription(n));
  const i = await s.createAnswer();
  await s.setLocalDescription(i), c(this, r, v).call(this, { type: "answer", from: e(this, y), to: t, sdp: i });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
U = function(t) {
  const n = e(this, k).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], s = new RTCPeerConnection({ iceServers: n });
  return e(this, S).set(t, s), s.onicecandidate = (i) => {
    i.candidate != null && c(this, r, v).call(this, {
      type: "candidate",
      from: e(this, y),
      to: t,
      candidate: i.candidate.toJSON()
    });
  }, s.ondatachannel = (i) => {
    c(this, r, L).call(this, i.channel, t), e(this, u).set(t, i.channel);
  }, s.onconnectionstatechange = () => {
    if (s.connectionState === "failed" || s.connectionState === "closed") {
      e(this, S).delete(t), e(this, u).delete(t), e(this, P).delete(t);
      for (const i of e(this, C))
        try {
          i(t, void 0);
        } catch {
        }
    }
  }, s;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
L = function(t, n) {
  t.binaryType = "arraybuffer", t.onmessage = (s) => {
    const i = new Uint8Array(s.data);
    c(this, r, B).call(this, i, n);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
B = function(t, n) {
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
        o.lastSeen = Date.now(), e(this, P).set(o.PeerId, o);
        for (const f of e(this, C))
          try {
            f(o.PeerId, o);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
W = function(t) {
  const n = new Uint8Array(t.length / 2);
  for (let s = 0; s < t.length; s += 2)
    n[s / 2] = parseInt(t.slice(s, s + 2), 16);
  return n;
}, /**** #bytesToHex ****/
E = function(t) {
  return Array.from(t).map((n) => n.toString(16).padStart(2, "0")).join("");
};
export {
  q as SDS_WebRTCProvider
};
