var ja = Object.defineProperty;
var ii = (n) => {
  throw TypeError(n);
};
var Za = (n, e, t) => e in n ? ja(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Gn = (n, e, t) => Za(n, typeof e != "symbol" ? e + "" : e, t), Br = (n, e, t) => e.has(n) || ii("Cannot " + t);
var m = (n, e, t) => (Br(n, e, "read from private field"), t ? t.call(n) : e.get(n)), ne = (n, e, t) => e.has(n) ? ii("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), Le = (n, e, t, r) => (Br(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), g = (n, e, t) => (Br(n, e, "access private method"), t);
var zr = (n, e, t, r) => ({
  set _(s) {
    Le(n, e, s, t);
  },
  get _() {
    return m(n, e, r);
  }
});
import { SDS_DataStore as Fa, DefaultWrapperCacheSize as Ka, DefaultLiteralSizeLimit as Ba, RootId as Ue, TrashId as K, LostAndFoundId as Ce, SDS_Error as re, expectValidMIMEType as oi, DefaultMIMEType as jt, SDS_Item as ai, SDS_Link as ci, maxOrderKeyLength as za, expectValidLabel as Pa, DefaultBinarySizeLimit as Ja, expectValidInfoKey as Wa, checkInfoValueSize as Ga, _base64ToUint8Array as so } from "@rozek/sds-core";
import { SDS_Entry as rd, SDS_Error as sd, SDS_Item as id, SDS_Link as od } from "@rozek/sds-core";
const Re = () => /* @__PURE__ */ new Map(), as = (n) => {
  const e = Re();
  return n.forEach((t, r) => {
    e.set(r, t);
  }), e;
}, kt = (n, e, t) => {
  let r = n.get(e);
  return r === void 0 && n.set(e, r = t()), r;
}, Ha = (n, e) => {
  const t = [];
  for (const [r, s] of n)
    t.push(e(s, r));
  return t;
}, qa = (n, e) => {
  for (const [t, r] of n)
    if (e(r, t))
      return !0;
  return !1;
}, Qt = () => /* @__PURE__ */ new Set(), Pr = (n) => n[n.length - 1], Ya = (n, e) => {
  for (let t = 0; t < e.length; t++)
    n.push(e[t]);
}, mt = Array.from, Ns = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (!e(n[t], t, n))
      return !1;
  return !0;
}, io = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (e(n[t], t, n))
      return !0;
  return !1;
}, Xa = (n, e) => {
  const t = new Array(n);
  for (let r = 0; r < n; r++)
    t[r] = e(r, t);
  return t;
}, Ir = Array.isArray;
class Qa {
  constructor() {
    this._observers = Re();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(e, t) {
    return kt(
      this._observers,
      /** @type {string} */
      e,
      Qt
    ).add(t), t;
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once(e, t) {
    const r = (...s) => {
      this.off(
        e,
        /** @type {any} */
        r
      ), t(...s);
    };
    this.on(
      e,
      /** @type {any} */
      r
    );
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off(e, t) {
    const r = this._observers.get(e);
    r !== void 0 && (r.delete(t), r.size === 0 && this._observers.delete(e));
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */
  emit(e, t) {
    return mt((this._observers.get(e) || Re()).values()).forEach((r) => r(...t));
  }
  destroy() {
    this._observers = Re();
  }
}
const Je = Math.floor, Xn = Math.abs, oo = (n, e) => n < e ? n : e, Nt = (n, e) => n > e ? n : e, ao = (n) => n !== 0 ? n < 0 : 1 / n < 0, li = 1, hi = 2, Jr = 4, Wr = 8, Cn = 32, tt = 64, xe = 128, Cr = 31, cs = 63, At = 127, ec = 2147483647, sr = Number.MAX_SAFE_INTEGER, ui = Number.MIN_SAFE_INTEGER, tc = Number.isInteger || ((n) => typeof n == "number" && isFinite(n) && Je(n) === n), nc = String.fromCharCode, rc = (n) => n.toLowerCase(), sc = /^\s*/g, ic = (n) => n.replace(sc, ""), oc = /([A-Z])/g, di = (n, e) => ic(n.replace(oc, (t) => `${e}${rc(t)}`)), ac = (n) => {
  const e = unescape(encodeURIComponent(n)), t = e.length, r = new Uint8Array(t);
  for (let s = 0; s < t; s++)
    r[s] = /** @type {number} */
    e.codePointAt(s);
  return r;
}, En = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), cc = (n) => En.encode(n), lc = En ? cc : ac;
let In = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
In && In.decode(new Uint8Array()).length === 1 && (In = null);
const hc = (n, e) => Xa(e, () => n).join("");
class Zn {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const Er = () => new Zn(), uc = (n) => {
  let e = n.cpos;
  for (let t = 0; t < n.bufs.length; t++)
    e += n.bufs[t].length;
  return e;
}, Be = (n) => {
  const e = new Uint8Array(uc(n));
  let t = 0;
  for (let r = 0; r < n.bufs.length; r++) {
    const s = n.bufs[r];
    e.set(s, t), t += s.length;
  }
  return e.set(new Uint8Array(n.cbuf.buffer, 0, n.cpos), t), e;
}, dc = (n, e) => {
  const t = n.cbuf.length;
  t - n.cpos < e && (n.bufs.push(new Uint8Array(n.cbuf.buffer, 0, n.cpos)), n.cbuf = new Uint8Array(Nt(t, e) * 2), n.cpos = 0);
}, H = (n, e) => {
  const t = n.cbuf.length;
  n.cpos === t && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(t * 2), n.cpos = 0), n.cbuf[n.cpos++] = e;
}, ls = H, T = (n, e) => {
  for (; e > At; )
    H(n, xe | At & e), e = Je(e / 128);
  H(n, At & e);
}, Ms = (n, e) => {
  const t = ao(e);
  for (t && (e = -e), H(n, (e > cs ? xe : 0) | (t ? tt : 0) | cs & e), e = Je(e / 64); e > 0; )
    H(n, (e > At ? xe : 0) | At & e), e = Je(e / 128);
}, hs = new Uint8Array(3e4), fc = hs.length / 3, gc = (n, e) => {
  if (e.length < fc) {
    const t = En.encodeInto(e, hs).written || 0;
    T(n, t);
    for (let r = 0; r < t; r++)
      H(n, hs[r]);
  } else
    _e(n, lc(e));
}, pc = (n, e) => {
  const t = unescape(encodeURIComponent(e)), r = t.length;
  T(n, r);
  for (let s = 0; s < r; s++)
    H(
      n,
      /** @type {number} */
      t.codePointAt(s)
    );
}, Wt = En && /** @type {any} */
En.encodeInto ? gc : pc, Ar = (n, e) => {
  const t = n.cbuf.length, r = n.cpos, s = oo(t - r, e.length), i = e.length - s;
  n.cbuf.set(e.subarray(0, s), r), n.cpos += s, i > 0 && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(Nt(t * 2, i)), n.cbuf.set(e.subarray(s)), n.cpos = i);
}, _e = (n, e) => {
  T(n, e.byteLength), Ar(n, e);
}, Rs = (n, e) => {
  dc(n, e);
  const t = new DataView(n.cbuf.buffer, n.cpos, e);
  return n.cpos += e, t;
}, mc = (n, e) => Rs(n, 4).setFloat32(0, e, !1), yc = (n, e) => Rs(n, 8).setFloat64(0, e, !1), wc = (n, e) => (
  /** @type {any} */
  Rs(n, 8).setBigInt64(0, e, !1)
), fi = new DataView(new ArrayBuffer(4)), _c = (n) => (fi.setFloat32(0, n), fi.getFloat32(0) === n), An = (n, e) => {
  switch (typeof e) {
    case "string":
      H(n, 119), Wt(n, e);
      break;
    case "number":
      tc(e) && Xn(e) <= ec ? (H(n, 125), Ms(n, e)) : _c(e) ? (H(n, 124), mc(n, e)) : (H(n, 123), yc(n, e));
      break;
    case "bigint":
      H(n, 122), wc(n, e);
      break;
    case "object":
      if (e === null)
        H(n, 126);
      else if (Ir(e)) {
        H(n, 117), T(n, e.length);
        for (let t = 0; t < e.length; t++)
          An(n, e[t]);
      } else if (e instanceof Uint8Array)
        H(n, 116), _e(n, e);
      else {
        H(n, 118);
        const t = Object.keys(e);
        T(n, t.length);
        for (let r = 0; r < t.length; r++) {
          const s = t[r];
          Wt(n, s), An(n, e[s]);
        }
      }
      break;
    case "boolean":
      H(n, e ? 120 : 121);
      break;
    default:
      H(n, 127);
  }
};
class gi extends Zn {
  /**
   * @param {function(Encoder, T):void} writer
   */
  constructor(e) {
    super(), this.w = e, this.s = null, this.count = 0;
  }
  /**
   * @param {T} v
   */
  write(e) {
    this.s === e ? this.count++ : (this.count > 0 && T(this, this.count - 1), this.count = 1, this.w(this, e), this.s = e);
  }
}
const pi = (n) => {
  n.count > 0 && (Ms(n.encoder, n.count === 1 ? n.s : -n.s), n.count > 1 && T(n.encoder, n.count - 2));
};
class Qn {
  constructor() {
    this.encoder = new Zn(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (pi(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return pi(this), Be(this.encoder);
  }
}
const mi = (n) => {
  if (n.count > 0) {
    const e = n.diff * 2 + (n.count === 1 ? 0 : 1);
    Ms(n.encoder, e), n.count > 1 && T(n.encoder, n.count - 2);
  }
};
class Gr {
  constructor() {
    this.encoder = new Zn(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (mi(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return mi(this), Be(this.encoder);
  }
}
class vc {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new Qn();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new Zn();
    return this.sarr.push(this.s), this.s = "", Wt(e, this.sarr.join("")), Ar(e, this.lensE.toUint8Array()), Be(e);
  }
}
const We = (n) => new Error(n), Ve = () => {
  throw We("Method unimplemented");
}, Te = () => {
  throw We("Unexpected case");
}, co = We("Unexpected end of array"), lo = We("Integer out of Range");
class Tr {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const hn = (n) => new Tr(n), kc = (n) => n.pos !== n.arr.length, bc = (n, e) => {
  const t = new Uint8Array(n.arr.buffer, n.pos + n.arr.byteOffset, e);
  return n.pos += e, t;
}, ve = (n) => bc(n, E(n)), en = (n) => n.arr[n.pos++], E = (n) => {
  let e = 0, t = 1;
  const r = n.arr.length;
  for (; n.pos < r; ) {
    const s = n.arr[n.pos++];
    if (e = e + (s & At) * t, t *= 128, s < xe)
      return e;
    if (e > sr)
      throw lo;
  }
  throw co;
}, Vs = (n) => {
  let e = n.arr[n.pos++], t = e & cs, r = 64;
  const s = (e & tt) > 0 ? -1 : 1;
  if ((e & xe) === 0)
    return s * t;
  const i = n.arr.length;
  for (; n.pos < i; ) {
    if (e = n.arr[n.pos++], t = t + (e & At) * r, r *= 128, e < xe)
      return s * t;
    if (t > sr)
      throw lo;
  }
  throw co;
}, xc = (n) => {
  let e = E(n);
  if (e === 0)
    return "";
  {
    let t = String.fromCodePoint(en(n));
    if (--e < 100)
      for (; e--; )
        t += String.fromCodePoint(en(n));
    else
      for (; e > 0; ) {
        const r = e < 1e4 ? e : 1e4, s = n.arr.subarray(n.pos, n.pos + r);
        n.pos += r, t += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          s
        ), e -= r;
      }
    return decodeURIComponent(escape(t));
  }
}, Sc = (n) => (
  /** @type any */
  In.decode(ve(n))
), Gt = In ? Sc : xc, $s = (n, e) => {
  const t = new DataView(n.arr.buffer, n.arr.byteOffset + n.pos, e);
  return n.pos += e, t;
}, Ic = (n) => $s(n, 4).getFloat32(0, !1), Cc = (n) => $s(n, 8).getFloat64(0, !1), Ec = (n) => (
  /** @type {any} */
  $s(n, 8).getBigInt64(0, !1)
), Ac = [
  (n) => {
  },
  // CASE 127: undefined
  (n) => null,
  // CASE 126: null
  Vs,
  // CASE 125: integer
  Ic,
  // CASE 124: float32
  Cc,
  // CASE 123: float64
  Ec,
  // CASE 122: bigint
  (n) => !1,
  // CASE 121: boolean (false)
  (n) => !0,
  // CASE 120: boolean (true)
  Gt,
  // CASE 119: string
  (n) => {
    const e = E(n), t = {};
    for (let r = 0; r < e; r++) {
      const s = Gt(n);
      t[s] = Tn(n);
    }
    return t;
  },
  (n) => {
    const e = E(n), t = [];
    for (let r = 0; r < e; r++)
      t.push(Tn(n));
    return t;
  },
  ve
  // CASE 116: Uint8Array
], Tn = (n) => Ac[127 - en(n)](n);
class yi extends Tr {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, t) {
    super(e), this.reader = t, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), kc(this) ? this.count = E(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class er extends Tr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = Vs(this);
      const e = ao(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = E(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class Hr extends Tr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @return {number}
   */
  read() {
    if (this.count === 0) {
      const e = Vs(this), t = e & 1;
      this.diff = Je(e / 2), this.count = 1, t && (this.count = E(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class Tc {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new er(e), this.str = Gt(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
    return this.spos = e, t;
  }
}
const Oc = crypto.getRandomValues.bind(crypto), ho = () => Oc(new Uint32Array(1))[0], Dc = "10000000-1000-4000-8000" + -1e11, Lc = () => Dc.replace(
  /[018]/g,
  /** @param {number} c */
  (n) => (n ^ ho() & 15 >> n / 4).toString(16)
), wi = (n) => (
  /** @type {Promise<T>} */
  new Promise(n)
);
Promise.all.bind(Promise);
const _i = (n) => n === void 0 ? null : n;
class Nc {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem(e, t) {
    this.map.set(e, t);
  }
  /**
   * @param {string} key
   */
  getItem(e) {
    return this.map.get(e);
  }
}
let uo = new Nc(), Mc = !0;
try {
  typeof localStorage < "u" && localStorage && (uo = localStorage, Mc = !1);
} catch {
}
const Rc = uo, On = Symbol("Equality"), fo = (n, e) => {
  var t;
  return n === e || !!((t = n == null ? void 0 : n[On]) != null && t.call(n, e)) || !1;
}, Vc = (n) => typeof n == "object", $c = Object.assign, Uc = Object.keys, jc = (n, e) => {
  for (const t in n)
    e(n[t], t);
}, ir = (n) => Uc(n).length, Zc = (n) => {
  for (const e in n)
    return !1;
  return !0;
}, Fn = (n, e) => {
  for (const t in n)
    if (!e(n[t], t))
      return !1;
  return !0;
}, Us = (n, e) => Object.prototype.hasOwnProperty.call(n, e), Fc = (n, e) => n === e || ir(n) === ir(e) && Fn(n, (t, r) => (t !== void 0 || Us(e, r)) && fo(e[r], t)), Kc = Object.freeze, go = (n) => {
  for (const e in n) {
    const t = n[e];
    (typeof t == "object" || typeof t == "function") && go(n[e]);
  }
  return Kc(n);
}, js = (n, e, t = 0) => {
  try {
    for (; t < n.length; t++)
      n[t](...e);
  } finally {
    t < n.length && js(n, e, t + 1);
  }
}, Bc = (n) => n, tr = (n, e) => {
  if (n === e)
    return !0;
  if (n == null || e == null || n.constructor !== e.constructor && (n.constructor || Object) !== (e.constructor || Object))
    return !1;
  if (n[On] != null)
    return n[On](e);
  switch (n.constructor) {
    case ArrayBuffer:
      n = new Uint8Array(n), e = new Uint8Array(e);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (n.byteLength !== e.byteLength)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (n[t] !== e[t])
          return !1;
      break;
    }
    case Set: {
      if (n.size !== e.size)
        return !1;
      for (const t of n)
        if (!e.has(t))
          return !1;
      break;
    }
    case Map: {
      if (n.size !== e.size)
        return !1;
      for (const t of n.keys())
        if (!e.has(t) || !tr(n.get(t), e.get(t)))
          return !1;
      break;
    }
    case void 0:
    case Object:
      if (ir(n) !== ir(e))
        return !1;
      for (const t in n)
        if (!Us(n, t) || !tr(n[t], e[t]))
          return !1;
      break;
    case Array:
      if (n.length !== e.length)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (!tr(n[t], e[t]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, zc = (n, e) => e.includes(n), Dn = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let je;
const Pc = () => {
  if (je === void 0)
    if (Dn) {
      je = Re();
      const n = process.argv;
      let e = null;
      for (let t = 0; t < n.length; t++) {
        const r = n[t];
        r[0] === "-" ? (e !== null && je.set(e, ""), e = r) : e !== null && (je.set(e, r), e = null);
      }
      e !== null && je.set(e, "");
    } else typeof location == "object" ? (je = Re(), (location.search || "?").slice(1).split("&").forEach((n) => {
      if (n.length !== 0) {
        const [e, t] = n.split("=");
        je.set(`--${di(e, "-")}`, t), je.set(`-${di(e, "-")}`, t);
      }
    })) : je = Re();
  return je;
}, us = (n) => Pc().has(n), or = (n) => _i(Dn ? process.env[n.toUpperCase().replaceAll("-", "_")] : Rc.getItem(n)), po = (n) => us("--" + n) || or(n) !== null, Jc = po("production"), Wc = Dn && zc(process.env.FORCE_COLOR, ["true", "1", "2"]), Gc = Wc || !us("--no-colors") && // @todo deprecate --no-colors
!po("no-color") && (!Dn || process.stdout.isTTY) && (!Dn || us("--color") || or("COLORTERM") !== null || (or("TERM") || "").includes("color")), Hc = (n) => new Uint8Array(n), qc = (n) => {
  const e = Hc(n.byteLength);
  return e.set(n), e;
};
class Yc {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, t) {
    this.left = e, this.right = t;
  }
}
const Ye = (n, e) => new Yc(n, e), vi = (n) => n.next() >= 0.5, qr = (n, e, t) => Je(n.next() * (t + 1 - e) + e), mo = (n, e, t) => Je(n.next() * (t + 1 - e) + e), Zs = (n, e, t) => mo(n, e, t), Xc = (n) => nc(Zs(n, 97, 122)), Qc = (n, e = 0, t = 20) => {
  const r = Zs(n, e, t);
  let s = "";
  for (let i = 0; i < r; i++)
    s += Xc(n);
  return s;
}, Yr = (n, e) => e[Zs(n, 0, e.length - 1)], el = Symbol("0schema");
class tl {
  constructor() {
    this._rerrs = [];
  }
  /**
   * @param {string?} path
   * @param {string} expected
   * @param {string} has
   * @param {string?} message
   */
  extend(e, t, r, s = null) {
    this._rerrs.push({ path: e, expected: t, has: r, message: s });
  }
  toString() {
    const e = [];
    for (let t = this._rerrs.length - 1; t > 0; t--) {
      const r = this._rerrs[t];
      e.push(hc(" ", (this._rerrs.length - t) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
    }
    return e.join(`
`);
  }
}
const ds = (n, e) => n === e ? !0 : n == null || e == null || n.constructor !== e.constructor ? !1 : n[On] ? fo(n, e) : Ir(n) ? Ns(
  n,
  (t) => io(e, (r) => ds(t, r))
) : Vc(n) ? Fn(
  n,
  (t, r) => ds(t, e[r])
) : !1;
class le {
  /**
   * @param {Schema<any>} other
   */
  extends(e) {
    let [t, r] = [
      /** @type {any} */
      this.shape,
      /** @type {any} */
      e.shape
    ];
    return (
      /** @type {typeof Schema<any>} */
      this.constructor._dilutes && ([r, t] = [t, r]), ds(t, r)
    );
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(e) {
    return this.constructor === e.constructor && tr(this.shape, e.shape);
  }
  [el]() {
    return !0;
  }
  /**
   * @param {object} other
   */
  [On](e) {
    return this.equals(
      /** @type {any} */
      e
    );
  }
  /**
   * Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
   * Schema. Validate will check the structure of the parameter and return true iff the instance
   * really is an instance of Schema.
   *
   * @param {T} o
   * @return {boolean}
   */
  validate(e) {
    return this.check(e);
  }
  /* c8 ignore start */
  /**
   * Similar to validate, but this method accepts untyped parameters.
   *
   * @param {any} _o
   * @param {ValidationError} [_err]
   * @return {_o is T}
   */
  check(e, t) {
    Ve();
  }
  /* c8 ignore stop */
  /**
   * @type {Schema<T?>}
   */
  get nullable() {
    return un(this, Mr);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new _o(
      /** @type {Schema<T>} */
      this
    );
  }
  /**
   * Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check only if not in a production environment.
   *
   * @template OO
   * @param {OO} o
   * @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
   */
  cast(e) {
    return ki(e, this), /** @type {any} */
    e;
  }
  /**
   * EXPECTO PATRONUM!! 🪄
   * This function protects against type errors. Though it may not work in the real world.
   *
   * "After all this time?"
   * "Always." - Snape, talking about type safety
   *
   * Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check if not in a production environment.
   *
   * @param {T} o
   * @return {o extends T ? T : never}
   */
  expect(e) {
    return ki(e, this), e;
  }
}
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
Gn(le, "_dilutes", !1);
class Fs extends le {
  /**
   * @param {C} c
   * @param {((o:Instance<C>)=>boolean)|null} check
   */
  constructor(e, t) {
    super(), this.shape = e, this._c = t;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
   */
  check(e, t = void 0) {
    const r = (e == null ? void 0 : e.constructor) === this.shape && (this._c == null || this._c(e));
    return !r && (t == null || t.extend(null, this.shape.name, e == null ? void 0 : e.constructor.name, (e == null ? void 0 : e.constructor) !== this.shape ? "Constructor match failed" : "Check failed")), r;
  }
}
const B = (n, e = null) => new Fs(n, e);
B(Fs);
class Ks extends le {
  /**
   * @param {(o:any) => boolean} check
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is any}
   */
  check(e, t) {
    const r = this.shape(e);
    return !r && (t == null || t.extend(null, "custom prop", e == null ? void 0 : e.constructor.name, "failed to check custom prop")), r;
  }
}
const Y = (n) => new Ks(n);
B(Ks);
class Or extends le {
  /**
   * @param {Array<T>} literals
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   *
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is T}
   */
  check(e, t) {
    const r = this.shape.some((s) => s === e);
    return !r && (t == null || t.extend(null, this.shape.join(" | "), e.toString())), r;
  }
}
const Dr = (...n) => new Or(n), yo = B(Or), nl = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((n) => n.replace(/[().|&,$^[\]]/g, (e) => "\\" + e))
), wo = (n) => {
  if (tn.check(n))
    return [nl(n)];
  if (yo.check(n))
    return (
      /** @type {Array<string|number>} */
      n.shape.map((e) => e + "")
    );
  if (Ao.check(n))
    return ["[+-]?\\d+.?\\d*"];
  if (To.check(n))
    return [".*"];
  if (cr.check(n))
    return n.shape.map(wo).flat(1);
  Te();
};
class rl extends le {
  /**
   * @param {T} shape
   */
  constructor(e) {
    super(), this.shape = e, this._r = new RegExp("^" + e.map(wo).map((t) => `(${t.join("|")})`).join("") + "$");
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is CastStringTemplateArgsToTemplate<T>}
   */
  check(e, t) {
    const r = this._r.exec(e) != null;
    return !r && (t == null || t.extend(null, this._r.toString(), e.toString(), "String doesn't match string template.")), r;
  }
}
B(rl);
const sl = Symbol("optional");
class _o extends le {
  /**
   * @param {S} shape
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is (Unwrap<S>|undefined)}
   */
  check(e, t) {
    const r = e === void 0 || this.shape.check(e);
    return !r && (t == null || t.extend(null, "undefined (optional)", "()")), r;
  }
  get [sl]() {
    return !0;
  }
}
const il = B(_o);
class ol extends le {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(e, t) {
    return t == null || t.extend(null, "never", typeof e), !1;
  }
}
B(ol);
const xr = class xr extends le {
  /**
   * @param {S} shape
   * @param {boolean} partial
   */
  constructor(e, t = !1) {
    super(), this.shape = e, this._isPartial = t;
  }
  /**
   * @type {Schema<Partial<$ObjectToType<S>>>}
   */
  get partial() {
    return new xr(this.shape, !0);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(e, t) {
    return e == null ? (t == null || t.extend(null, "object", "null"), !1) : Fn(this.shape, (r, s) => {
      const i = this._isPartial && !Us(e, s) || r.check(e[s], t);
      return !i && (t == null || t.extend(s.toString(), r.toString(), typeof e[s], "Object property does not match")), i;
    });
  }
};
Gn(xr, "_dilutes", !0);
let ar = xr;
const al = (n) => (
  /** @type {any} */
  new ar(n)
), cl = B(ar), ll = Y((n) => n != null && (n.constructor === Object || n.constructor == null));
class vo extends le {
  /**
   * @param {Keys} keys
   * @param {Values} values
   */
  constructor(e, t) {
    super(), this.shape = {
      keys: e,
      values: t
    };
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
   */
  check(e, t) {
    return e != null && Fn(e, (r, s) => {
      const i = this.shape.keys.check(s, t);
      return !i && (t == null || t.extend(s + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value")), i && this.shape.values.check(r, t);
    });
  }
}
const ko = (n, e) => new vo(n, e), hl = B(vo);
class bo extends le {
  /**
   * @param {S} shape
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
   */
  check(e, t) {
    return e != null && Fn(this.shape, (r, s) => {
      const i = (
        /** @type {Schema<any>} */
        r.check(e[s], t)
      );
      return !i && (t == null || t.extend(s.toString(), "Tuple", typeof r)), i;
    });
  }
}
const ul = (...n) => new bo(n);
B(bo);
class xo extends le {
  /**
   * @param {Array<S>} v
   */
  constructor(e) {
    super(), this.shape = e.length === 1 ? e[0] : new Lr(e);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(e, t) {
    const r = Ir(e) && Ns(e, (s) => this.shape.check(s));
    return !r && (t == null || t.extend(null, "Array", "")), r;
  }
}
const So = (...n) => new xo(n), dl = B(xo), fl = Y((n) => Ir(n));
class Io extends le {
  /**
   * @param {new (...args:any) => T} constructor
   * @param {((o:T) => boolean)|null} check
   */
  constructor(e, t) {
    super(), this.shape = e, this._c = t;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is T}
   */
  check(e, t) {
    const r = e instanceof this.shape && (this._c == null || this._c(e));
    return !r && (t == null || t.extend(null, this.shape.name, e == null ? void 0 : e.constructor.name)), r;
  }
}
const gl = (n, e = null) => new Io(n, e);
B(Io);
const pl = gl(le);
class ml extends le {
  /**
   * @param {Args} args
   */
  constructor(e) {
    super(), this.len = e.length - 1, this.args = ul(...e.slice(-1)), this.res = e[this.len];
  }
  /**
   * @param {any} f
   * @param {ValidationError} err
   * @return {f is _LArgsToLambdaDef<Args>}
   */
  check(e, t) {
    const r = e.constructor === Function && e.length <= this.len;
    return !r && (t == null || t.extend(null, "function", typeof e)), r;
  }
}
const yl = B(ml), wl = Y((n) => typeof n == "function");
class _l extends le {
  /**
   * @param {T} v
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Intersect<UnwrapArray<T>>}
   */
  check(e, t) {
    const r = Ns(this.shape, (s) => s.check(e, t));
    return !r && (t == null || t.extend(null, "Intersectinon", typeof e)), r;
  }
}
B(_l, (n) => n.shape.length > 0);
class Lr extends le {
  /**
   * @param {Array<Schema<S>>} v
   */
  constructor(e) {
    super(), this.shape = e;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is S}
   */
  check(e, t) {
    const r = io(this.shape, (s) => s.check(e, t));
    return t == null || t.extend(null, "Union", typeof e), r;
  }
}
Gn(Lr, "_dilutes", !0);
const un = (...n) => n.findIndex((e) => cr.check(e)) >= 0 ? un(...n.map((e) => Ln(e)).map((e) => cr.check(e) ? e.shape : [e]).flat(1)) : n.length === 1 ? n[0] : new Lr(n), cr = (
  /** @type {Schema<$Union<any>>} */
  B(Lr)
), Co = () => !0, lr = Y(Co), vl = (
  /** @type {Schema<Schema<any>>} */
  B(Ks, (n) => n.shape === Co)
), Bs = Y((n) => typeof n == "bigint"), kl = (
  /** @type {Schema<Schema<BigInt>>} */
  Y((n) => n === Bs)
), Eo = Y((n) => typeof n == "symbol");
Y((n) => n === Eo);
const Ht = Y((n) => typeof n == "number"), Ao = (
  /** @type {Schema<Schema<number>>} */
  Y((n) => n === Ht)
), tn = Y((n) => typeof n == "string"), To = (
  /** @type {Schema<Schema<string>>} */
  Y((n) => n === tn)
), Nr = Y((n) => typeof n == "boolean"), bl = (
  /** @type {Schema<Schema<Boolean>>} */
  Y((n) => n === Nr)
), Oo = Dr(void 0);
B(Or, (n) => n.shape.length === 1 && n.shape[0] === void 0);
Dr(void 0);
const Mr = Dr(null), xl = (
  /** @type {Schema<Schema<null>>} */
  B(Or, (n) => n.shape.length === 1 && n.shape[0] === null)
);
B(Uint8Array);
B(Fs, (n) => n.shape === Uint8Array);
const Sl = un(Ht, tn, Mr, Oo, Bs, Nr, Eo);
(() => {
  const n = (
    /** @type {$Array<$any>} */
    So(lr)
  ), e = (
    /** @type {$Record<$string,$any>} */
    ko(tn, lr)
  ), t = un(Ht, tn, Mr, Nr, n, e);
  return n.shape = t, e.shape.values = t, t;
})();
const Ln = (n) => {
  if (pl.check(n))
    return (
      /** @type {any} */
      n
    );
  if (ll.check(n)) {
    const e = {};
    for (const t in n)
      e[t] = Ln(n[t]);
    return (
      /** @type {any} */
      al(e)
    );
  } else {
    if (fl.check(n))
      return (
        /** @type {any} */
        un(...n.map(Ln))
      );
    if (Sl.check(n))
      return (
        /** @type {any} */
        Dr(n)
      );
    if (wl.check(n))
      return (
        /** @type {any} */
        B(
          /** @type {any} */
          n
        )
      );
  }
  Te();
}, ki = Jc ? () => {
} : (n, e) => {
  const t = new tl();
  if (!e.check(n, t))
    throw We(`Expected value to be of type ${e.constructor.name}.
${t.toString()}`);
};
class Il {
  /**
   * @param {Schema<State>} [$state]
   */
  constructor(e) {
    this.patterns = [], this.$state = e;
  }
  /**
   * @template P
   * @template R
   * @param {P} pattern
   * @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
   * @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
   */
  if(e, t) {
    return this.patterns.push({ if: Ln(e), h: t }), this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(e) {
    return this.if(lr, e);
  }
  /**
   * @return {State extends undefined
   *   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
   *   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
   */
  done() {
    return (
      /** @type {any} */
      (e, t) => {
        for (let r = 0; r < this.patterns.length; r++) {
          const s = this.patterns[r];
          if (s.if.check(e))
            return s.h(e, t);
        }
        throw We("Unhandled pattern");
      }
    );
  }
}
const Cl = (n) => new Il(
  /** @type {any} */
  n
), Do = (
  /** @type {any} */
  Cl(
    /** @type {Schema<prng.PRNG>} */
    lr
  ).if(Ao, (n, e) => qr(e, ui, sr)).if(To, (n, e) => Qc(e)).if(bl, (n, e) => vi(e)).if(kl, (n, e) => BigInt(qr(e, ui, sr))).if(cr, (n, e) => Ut(e, Yr(e, n.shape))).if(cl, (n, e) => {
    const t = {};
    for (const r in n.shape) {
      let s = n.shape[r];
      if (il.check(s)) {
        if (vi(e))
          continue;
        s = s.shape;
      }
      t[r] = Do(s, e);
    }
    return t;
  }).if(dl, (n, e) => {
    const t = [], r = mo(e, 0, 42);
    for (let s = 0; s < r; s++)
      t.push(Ut(e, n.shape));
    return t;
  }).if(yo, (n, e) => Yr(e, n.shape)).if(xl, (n, e) => null).if(yl, (n, e) => {
    const t = Ut(e, n.res);
    return () => t;
  }).if(vl, (n, e) => Ut(e, Yr(e, [
    Ht,
    tn,
    Mr,
    Oo,
    Bs,
    Nr,
    So(Ht),
    ko(un("a", "b", "c"), Ht)
  ]))).if(hl, (n, e) => {
    const t = {}, r = qr(e, 0, 3);
    for (let s = 0; s < r; s++) {
      const i = Ut(e, n.shape.keys), o = Ut(e, n.shape.values);
      t[i] = o;
    }
    return t;
  }).done()
), Ut = (n, e) => (
  /** @type {any} */
  Do(Ln(e), n)
), Rr = (
  /** @type {Document} */
  typeof document < "u" ? document : {}
);
Y((n) => n.nodeType === Dl);
typeof DOMParser < "u" && new DOMParser();
Y((n) => n.nodeType === Al);
Y((n) => n.nodeType === Tl);
const El = (n) => Ha(n, (e, t) => `${t}:${e};`).join(""), Al = Rr.ELEMENT_NODE, Tl = Rr.TEXT_NODE, Ol = Rr.DOCUMENT_NODE, Dl = Rr.DOCUMENT_FRAGMENT_NODE;
Y((n) => n.nodeType === Ol);
const rt = Symbol, Lo = rt(), No = rt(), Ll = rt(), Nl = rt(), Ml = rt(), Mo = rt(), Rl = rt(), zs = rt(), Vl = rt(), $l = (n) => {
  var s;
  n.length === 1 && ((s = n[0]) == null ? void 0 : s.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [];
  let r = 0;
  for (; r < n.length; r++) {
    const i = n[r];
    if (i === void 0)
      break;
    if (i.constructor === String || i.constructor === Number)
      e.push(i);
    else if (i.constructor === Object)
      break;
  }
  for (r > 0 && t.push(e.join("")); r < n.length; r++) {
    const i = n[r];
    i instanceof Symbol || t.push(i);
  }
  return t;
}, Ul = {
  [Lo]: Ye("font-weight", "bold"),
  [No]: Ye("font-weight", "normal"),
  [Ll]: Ye("color", "blue"),
  [Ml]: Ye("color", "green"),
  [Nl]: Ye("color", "grey"),
  [Mo]: Ye("color", "red"),
  [Rl]: Ye("color", "purple"),
  [zs]: Ye("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [Vl]: Ye("color", "black")
}, jl = (n) => {
  var o;
  n.length === 1 && ((o = n[0]) == null ? void 0 : o.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [], r = Re();
  let s = [], i = 0;
  for (; i < n.length; i++) {
    const a = n[i], c = Ul[a];
    if (c !== void 0)
      r.set(c.left, c.right);
    else {
      if (a === void 0)
        break;
      if (a.constructor === String || a.constructor === Number) {
        const l = El(r);
        i > 0 || l.length > 0 ? (e.push("%c" + a), t.push(l)) : e.push(a);
      } else
        break;
    }
  }
  for (i > 0 && (s = t, s.unshift(e.join(""))); i < n.length; i++) {
    const a = n[i];
    a instanceof Symbol || s.push(a);
  }
  return s;
}, Ro = Gc ? jl : $l, Zl = (...n) => {
  console.log(...Ro(n)), Vo.forEach((e) => e.print(n));
}, Fl = (...n) => {
  console.warn(...Ro(n)), n.unshift(zs), Vo.forEach((e) => e.print(n));
}, Vo = Qt(), $o = (n) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: n
}), Kl = (n, e) => $o(() => {
  let t;
  do
    t = n.next();
  while (!t.done && !e(t.value));
  return t;
}), Xr = (n, e) => $o(() => {
  const { done: t, value: r } = n.next();
  return { done: t, value: t ? void 0 : e(r) };
});
class Ps {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, t) {
    this.clock = e, this.len = t;
  }
}
class Kn {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const Uo = (n, e, t) => e.clients.forEach((r, s) => {
  const i = (
    /** @type {Array<GC|Item>} */
    n.doc.store.clients.get(s)
  );
  if (i != null) {
    const o = i[i.length - 1], a = o.id.clock + o.length;
    for (let c = 0, l = r[c]; c < r.length && l.clock < a; l = r[++c])
      Yo(n, i, l.clock, l.len, t);
  }
}), Bl = (n, e) => {
  let t = 0, r = n.length - 1;
  for (; t <= r; ) {
    const s = Je((t + r) / 2), i = n[s], o = i.clock;
    if (o <= e) {
      if (e < o + i.len)
        return s;
      t = s + 1;
    } else
      r = s - 1;
  }
  return null;
}, jo = (n, e) => {
  const t = n.clients.get(e.client);
  return t !== void 0 && Bl(t, e.clock) !== null;
}, Js = (n) => {
  n.clients.forEach((e) => {
    e.sort((s, i) => s.clock - i.clock);
    let t, r;
    for (t = 1, r = 1; t < e.length; t++) {
      const s = e[r - 1], i = e[t];
      s.clock + s.len >= i.clock ? s.len = Nt(s.len, i.clock + i.len - s.clock) : (r < t && (e[r] = i), r++);
    }
    e.length = r;
  });
}, zl = (n) => {
  const e = new Kn();
  for (let t = 0; t < n.length; t++)
    n[t].clients.forEach((r, s) => {
      if (!e.clients.has(s)) {
        const i = r.slice();
        for (let o = t + 1; o < n.length; o++)
          Ya(i, n[o].clients.get(s) || []);
        e.clients.set(s, i);
      }
    });
  return Js(e), e;
}, hr = (n, e, t, r) => {
  kt(n.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new Ps(t, r));
}, Pl = () => new Kn(), Jl = (n) => {
  const e = Pl();
  return n.clients.forEach((t, r) => {
    const s = [];
    for (let i = 0; i < t.length; i++) {
      const o = t[i];
      if (o.deleted) {
        const a = o.id.clock;
        let c = o.length;
        if (i + 1 < t.length)
          for (let l = t[i + 1]; i + 1 < t.length && l.deleted; l = t[++i + 1])
            c += l.length;
        s.push(new Ps(a, c));
      }
    }
    s.length > 0 && e.clients.set(r, s);
  }), e;
}, dn = (n, e) => {
  T(n.restEncoder, e.clients.size), mt(e.clients.entries()).sort((t, r) => r[0] - t[0]).forEach(([t, r]) => {
    n.resetDsCurVal(), T(n.restEncoder, t);
    const s = r.length;
    T(n.restEncoder, s);
    for (let i = 0; i < s; i++) {
      const o = r[i];
      n.writeDsClock(o.clock), n.writeDsLen(o.len);
    }
  });
}, Ws = (n) => {
  const e = new Kn(), t = E(n.restDecoder);
  for (let r = 0; r < t; r++) {
    n.resetDsCurVal();
    const s = E(n.restDecoder), i = E(n.restDecoder);
    if (i > 0) {
      const o = kt(e.clients, s, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let a = 0; a < i; a++)
        o.push(new Ps(n.readDsClock(), n.readDsLen()));
    }
  }
  return e;
}, bi = (n, e, t) => {
  const r = new Kn(), s = E(n.restDecoder);
  for (let i = 0; i < s; i++) {
    n.resetDsCurVal();
    const o = E(n.restDecoder), a = E(n.restDecoder), c = t.clients.get(o) || [], l = q(t, o);
    for (let h = 0; h < a; h++) {
      const u = n.readDsClock(), f = u + n.readDsLen();
      if (u < l) {
        l < f && hr(r, o, l, f - l);
        let p = Ge(c, u), w = c[p];
        for (!w.deleted && w.id.clock < u && (c.splice(p + 1, 0, yr(e, w, u - w.id.clock)), p++); p < c.length && (w = c[p++], w.id.clock < f); )
          w.deleted || (f < w.id.clock + w.length && c.splice(p, 0, yr(e, w, f - w.id.clock)), w.delete(e));
      } else
        hr(r, o, u, f - u);
    }
  }
  if (r.clients.size > 0) {
    const i = new Tt();
    return T(i.restEncoder, 0), dn(i, r), i.toUint8Array();
  }
  return null;
}, Zo = ho;
class gt extends Qa {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = Lc(), collectionid: t = null, gc: r = !0, gcFilter: s = () => !0, meta: i = null, autoLoad: o = !1, shouldLoad: a = !0 } = {}) {
    super(), this.gc = r, this.gcFilter = s, this.clientID = Zo(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new Ho(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = a, this.autoLoad = o, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = wi((l) => {
      this.on("load", () => {
        this.isLoaded = !0, l(this);
      });
    });
    const c = () => wi((l) => {
      const h = (u) => {
        (u === void 0 || u === !0) && (this.off("sync", h), l());
      };
      this.on("sync", h);
    });
    this.on("sync", (l) => {
      l === !1 && this.isSynced && (this.whenSynced = c()), this.isSynced = l === void 0 || l === !0, this.isSynced && !this.isLoaded && this.emit("load", [this]);
    }), this.whenSynced = c();
  }
  /**
   * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
   *
   * `load()` might be used in the future to request any provider to load the most current data.
   *
   * It is safe to call `load()` multiple times.
   */
  load() {
    const e = this._item;
    e !== null && !this.shouldLoad && V(
      /** @type {any} */
      e.parent.doc,
      (t) => {
        t.subdocsLoaded.add(this);
      },
      null,
      !0
    ), this.shouldLoad = !0;
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(mt(this.subdocs).map((e) => e.guid));
  }
  /**
   * Changes that happen inside of a transaction are bundled. This means that
   * the observer fires _after_ the transaction is finished and that all changes
   * that happened inside of the transaction are sent as one message to the
   * other peers.
   *
   * @template T
   * @param {function(Transaction):T} f The function that should be executed as a transaction
   * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
   * @return T
   *
   * @public
   */
  transact(e, t = null) {
    return V(this, e, t);
  }
  /**
   * Define a shared data type.
   *
   * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
   * and do not overwrite each other. I.e.
   * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
   *
   * After this method is called, the type is also available on `ydoc.share.get(name)`.
   *
   * *Best Practices:*
   * Define all types right after the Y.Doc instance is created and store them in a separate object.
   * Also use the typed methods `getText(name)`, `getArray(name)`, ..
   *
   * @template {typeof AbstractType<any>} Type
   * @example
   *   const ydoc = new Y.Doc(..)
   *   const appState = {
   *     document: ydoc.getText('document')
   *     comments: ydoc.getArray('comments')
   *   }
   *
   * @param {string} name
   * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
   * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
   *
   * @public
   */
  get(e, t = (
    /** @type {any} */
    ie
  )) {
    const r = kt(this.share, e, () => {
      const i = new t();
      return i._integrate(this, null), i;
    }), s = r.constructor;
    if (t !== ie && s !== t)
      if (s === ie) {
        const i = new t();
        i._map = r._map, r._map.forEach(
          /** @param {Item?} n */
          (o) => {
            for (; o !== null; o = o.left)
              o.parent = i;
          }
        ), i._start = r._start;
        for (let o = i._start; o !== null; o = o.right)
          o.parent = i;
        return i._length = r._length, this.share.set(e, i), i._integrate(this, null), /** @type {InstanceType<Type>} */
        i;
      } else
        throw new Error(`Type with the name ${e} has already been defined with a different constructor`);
    return (
      /** @type {InstanceType<Type>} */
      r
    );
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YArray<T>}
   *
   * @public
   */
  getArray(e = "") {
    return (
      /** @type {YArray<T>} */
      this.get(e, Yt)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(e = "") {
    return this.get(e, $);
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YMap<T>}
   *
   * @public
   */
  getMap(e = "") {
    return (
      /** @type {YMap<T>} */
      this.get(e, D)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlElement}
   *
   * @public
   */
  getXmlElement(e = "") {
    return (
      /** @type {YXmlElement<{[key:string]:string}>} */
      this.get(e, rn)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, Ot);
  }
  /**
   * Converts the entire document into a js object, recursively traversing each yjs type
   * Doesn't log types that have not been defined (using ydoc.getType(..)).
   *
   * @deprecated Do not use this method and rather call toJSON directly on the shared types.
   *
   * @return {Object<string, any>}
   */
  toJSON() {
    const e = {};
    return this.share.forEach((t, r) => {
      e[r] = t.toJSON();
    }), e;
  }
  /**
   * Emit `destroy` event and unregister all event handlers.
   */
  destroy() {
    this.isDestroyed = !0, mt(this.subdocs).forEach((t) => t.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const t = (
        /** @type {ContentDoc} */
        e.content
      );
      t.doc = new gt({ guid: this.guid, ...t.opts, shouldLoad: !1 }), t.doc._item = e, V(
        /** @type {any} */
        e.parent.doc,
        (r) => {
          const s = t.doc;
          e.deleted || r.subdocsAdded.add(s), r.subdocsRemoved.add(this);
        },
        null,
        !0
      );
    }
    this.emit("destroyed", [!0]), this.emit("destroy", [this]), super.destroy();
  }
}
class Fo {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    this.restDecoder = e;
  }
  resetDsCurVal() {
  }
  /**
   * @return {number}
   */
  readDsClock() {
    return E(this.restDecoder);
  }
  /**
   * @return {number}
   */
  readDsLen() {
    return E(this.restDecoder);
  }
}
class Ko extends Fo {
  /**
   * @return {ID}
   */
  readLeftID() {
    return L(E(this.restDecoder), E(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return L(E(this.restDecoder), E(this.restDecoder));
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return E(this.restDecoder);
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return en(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return Gt(this.restDecoder);
  }
  /**
   * @return {boolean} isKey
   */
  readParentInfo() {
    return E(this.restDecoder) === 1;
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readTypeRef() {
    return E(this.restDecoder);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number} len
   */
  readLen() {
    return E(this.restDecoder);
  }
  /**
   * @return {any}
   */
  readAny() {
    return Tn(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return qc(ve(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(Gt(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return Gt(this.restDecoder);
  }
}
class Wl {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    this.dsCurrVal = 0, this.restDecoder = e;
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @return {number}
   */
  readDsClock() {
    return this.dsCurrVal += E(this.restDecoder), this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const e = E(this.restDecoder) + 1;
    return this.dsCurrVal += e, e;
  }
}
class nn extends Wl {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], E(e), this.keyClockDecoder = new Hr(ve(e)), this.clientDecoder = new er(ve(e)), this.leftClockDecoder = new Hr(ve(e)), this.rightClockDecoder = new Hr(ve(e)), this.infoDecoder = new yi(ve(e), en), this.stringDecoder = new Tc(ve(e)), this.parentInfoDecoder = new yi(ve(e), en), this.typeRefDecoder = new er(ve(e)), this.lenDecoder = new er(ve(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new qt(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new qt(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return this.clientDecoder.read();
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return (
      /** @type {number} */
      this.infoDecoder.read()
    );
  }
  /**
   * @return {string}
   */
  readString() {
    return this.stringDecoder.read();
  }
  /**
   * @return {boolean}
   */
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  /**
   * @return {number} An unsigned 8-bit integer
   */
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number}
   */
  readLen() {
    return this.lenDecoder.read();
  }
  /**
   * @return {any}
   */
  readAny() {
    return Tn(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return ve(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return Tn(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readKey() {
    const e = this.keyClockDecoder.read();
    if (e < this.keys.length)
      return this.keys[e];
    {
      const t = this.stringDecoder.read();
      return this.keys.push(t), t;
    }
  }
}
class Bo {
  constructor() {
    this.restEncoder = Er();
  }
  toUint8Array() {
    return Be(this.restEncoder);
  }
  resetDsCurVal() {
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    T(this.restEncoder, e);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    T(this.restEncoder, e);
  }
}
class Bn extends Bo {
  /**
   * @param {ID} id
   */
  writeLeftID(e) {
    T(this.restEncoder, e.client), T(this.restEncoder, e.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(e) {
    T(this.restEncoder, e.client), T(this.restEncoder, e.clock);
  }
  /**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */
  writeClient(e) {
    T(this.restEncoder, e);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(e) {
    ls(this.restEncoder, e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    Wt(this.restEncoder, e);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(e) {
    T(this.restEncoder, e ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(e) {
    T(this.restEncoder, e);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(e) {
    T(this.restEncoder, e);
  }
  /**
   * @param {any} any
   */
  writeAny(e) {
    An(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    _e(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    Wt(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    Wt(this.restEncoder, e);
  }
}
class zo {
  constructor() {
    this.restEncoder = Er(), this.dsCurrVal = 0;
  }
  toUint8Array() {
    return Be(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    const t = e - this.dsCurrVal;
    this.dsCurrVal = e, T(this.restEncoder, t);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    e === 0 && Te(), T(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class Tt extends zo {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new Gr(), this.clientEncoder = new Qn(), this.leftClockEncoder = new Gr(), this.rightClockEncoder = new Gr(), this.infoEncoder = new gi(ls), this.stringEncoder = new vc(), this.parentInfoEncoder = new gi(ls), this.typeRefEncoder = new Qn(), this.lenEncoder = new Qn();
  }
  toUint8Array() {
    const e = Er();
    return T(e, 0), _e(e, this.keyClockEncoder.toUint8Array()), _e(e, this.clientEncoder.toUint8Array()), _e(e, this.leftClockEncoder.toUint8Array()), _e(e, this.rightClockEncoder.toUint8Array()), _e(e, Be(this.infoEncoder)), _e(e, this.stringEncoder.toUint8Array()), _e(e, Be(this.parentInfoEncoder)), _e(e, this.typeRefEncoder.toUint8Array()), _e(e, this.lenEncoder.toUint8Array()), Ar(e, Be(this.restEncoder)), Be(e);
  }
  /**
   * @param {ID} id
   */
  writeLeftID(e) {
    this.clientEncoder.write(e.client), this.leftClockEncoder.write(e.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(e) {
    this.clientEncoder.write(e.client), this.rightClockEncoder.write(e.clock);
  }
  /**
   * @param {number} client
   */
  writeClient(e) {
    this.clientEncoder.write(e);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(e) {
    this.infoEncoder.write(e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    this.stringEncoder.write(e);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(e) {
    this.parentInfoEncoder.write(e ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(e) {
    this.typeRefEncoder.write(e);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(e) {
    this.lenEncoder.write(e);
  }
  /**
   * @param {any} any
   */
  writeAny(e) {
    An(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    _e(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    An(this.restEncoder, e);
  }
  /**
   * Property keys are often reused. For example, in y-prosemirror the key `bold` might
   * occur very often. For a 3d application, the key `position` might occur very often.
   *
   * We cache these keys in a Map and refer to them via a unique number.
   *
   * @param {string} key
   */
  writeKey(e) {
    const t = this.keyMap.get(e);
    t === void 0 ? (this.keyClockEncoder.write(this.keyClock++), this.stringEncoder.write(e)) : this.keyClockEncoder.write(t);
  }
}
const Gl = (n, e, t, r) => {
  r = Nt(r, e[0].id.clock);
  const s = Ge(e, r);
  T(n.restEncoder, e.length - s), n.writeClient(t), T(n.restEncoder, r);
  const i = e[s];
  i.write(n, r - i.id.clock);
  for (let o = s + 1; o < e.length; o++)
    e[o].write(n, 0);
}, Gs = (n, e, t) => {
  const r = /* @__PURE__ */ new Map();
  t.forEach((s, i) => {
    q(e, i) > s && r.set(i, s);
  }), Vr(e).forEach((s, i) => {
    t.has(i) || r.set(i, 0);
  }), T(n.restEncoder, r.size), mt(r.entries()).sort((s, i) => i[0] - s[0]).forEach(([s, i]) => {
    Gl(
      n,
      /** @type {Array<GC|Item>} */
      e.clients.get(s),
      s,
      i
    );
  });
}, Hl = (n, e) => {
  const t = Re(), r = E(n.restDecoder);
  for (let s = 0; s < r; s++) {
    const i = E(n.restDecoder), o = new Array(i), a = n.readClient();
    let c = E(n.restDecoder);
    t.set(a, { i: 0, refs: o });
    for (let l = 0; l < i; l++) {
      const h = n.readInfo();
      switch (Cr & h) {
        case 0: {
          const u = n.readLen();
          o[l] = new Ee(L(a, c), u), c += u;
          break;
        }
        case 10: {
          const u = E(n.restDecoder);
          o[l] = new Ae(L(a, c), u), c += u;
          break;
        }
        default: {
          const u = (h & (tt | xe)) === 0, f = new J(
            L(a, c),
            null,
            // left
            (h & xe) === xe ? n.readLeftID() : null,
            // origin
            null,
            // right
            (h & tt) === tt ? n.readRightID() : null,
            // right origin
            u ? n.readParentInfo() ? e.get(n.readString()) : n.readLeftID() : null,
            // parent
            u && (h & Cn) === Cn ? n.readString() : null,
            // parentSub
            ma(n, h)
            // item content
          );
          o[l] = f, c += f.length;
        }
      }
    }
  }
  return t;
}, ql = (n, e, t) => {
  const r = [];
  let s = mt(t.keys()).sort((p, w) => p - w);
  if (s.length === 0)
    return null;
  const i = () => {
    if (s.length === 0)
      return null;
    let p = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      t.get(s[s.length - 1])
    );
    for (; p.refs.length === p.i; )
      if (s.pop(), s.length > 0)
        p = /** @type {{i:number,refs:Array<GC|Item>}} */
        t.get(s[s.length - 1]);
      else
        return null;
    return p;
  };
  let o = i();
  if (o === null)
    return null;
  const a = new Ho(), c = /* @__PURE__ */ new Map(), l = (p, w) => {
    const b = c.get(p);
    (b == null || b > w) && c.set(p, w);
  };
  let h = (
    /** @type {any} */
    o.refs[
      /** @type {any} */
      o.i++
    ]
  );
  const u = /* @__PURE__ */ new Map(), f = () => {
    for (const p of r) {
      const w = p.id.client, b = t.get(w);
      b ? (b.i--, a.clients.set(w, b.refs.slice(b.i)), t.delete(w), b.i = 0, b.refs = []) : a.clients.set(w, [p]), s = s.filter((F) => F !== w);
    }
    r.length = 0;
  };
  for (; ; ) {
    if (h.constructor !== Ae) {
      const w = kt(u, h.id.client, () => q(e, h.id.client)) - h.id.clock;
      if (w < 0)
        r.push(h), l(h.id.client, h.id.clock - 1), f();
      else {
        const b = h.getMissing(n, e);
        if (b !== null) {
          r.push(h);
          const F = t.get(
            /** @type {number} */
            b
          ) || { refs: [], i: 0 };
          if (F.refs.length === F.i)
            l(
              /** @type {number} */
              b,
              q(e, b)
            ), f();
          else {
            h = F.refs[F.i++];
            continue;
          }
        } else (w === 0 || w < h.length) && (h.integrate(n, w), u.set(h.id.client, h.id.clock + h.length));
      }
    }
    if (r.length > 0)
      h = /** @type {GC|Item} */
      r.pop();
    else if (o !== null && o.i < o.refs.length)
      h = /** @type {GC|Item} */
      o.refs[o.i++];
    else {
      if (o = i(), o === null)
        break;
      h = /** @type {GC|Item} */
      o.refs[o.i++];
    }
  }
  if (a.clients.size > 0) {
    const p = new Tt();
    return Gs(p, a, /* @__PURE__ */ new Map()), T(p.restEncoder, 0), { missing: c, update: p.toUint8Array() };
  }
  return null;
}, Yl = (n, e) => Gs(n, e.doc.store, e.beforeState), Xl = (n, e, t, r = new nn(n)) => V(e, (s) => {
  s.local = !1;
  let i = !1;
  const o = s.doc, a = o.store, c = Hl(r, o), l = ql(s, a, c), h = a.pendingStructs;
  if (h) {
    for (const [f, p] of h.missing)
      if (p < q(a, f)) {
        i = !0;
        break;
      }
    if (l) {
      for (const [f, p] of l.missing) {
        const w = h.missing.get(f);
        (w == null || w > p) && h.missing.set(f, p);
      }
      h.update = ur([h.update, l.update]);
    }
  } else
    a.pendingStructs = l;
  const u = bi(r, s, a);
  if (a.pendingDs) {
    const f = new nn(hn(a.pendingDs));
    E(f.restDecoder);
    const p = bi(f, s, a);
    u && p ? a.pendingDs = ur([u, p]) : a.pendingDs = u || p;
  } else
    a.pendingDs = u;
  if (i) {
    const f = (
      /** @type {{update: Uint8Array}} */
      a.pendingStructs.update
    );
    a.pendingStructs = null, Po(s.doc, f);
  }
}, t, !1), Po = (n, e, t, r = nn) => {
  const s = hn(e);
  Xl(s, n, t, new r(s));
}, xi = (n, e, t) => Po(n, e, t, Ko), Ql = (n, e, t = /* @__PURE__ */ new Map()) => {
  Gs(n, e.store, t), dn(n, Jl(e.store));
}, eh = (n, e = new Uint8Array([0]), t = new Tt()) => {
  const r = Jo(e);
  Ql(t, n, r);
  const s = [t.toUint8Array()];
  if (n.store.pendingDs && s.push(n.store.pendingDs), n.store.pendingStructs && s.push(ph(n.store.pendingStructs.update, e)), s.length > 1) {
    if (t.constructor === Bn)
      return fh(s.map((i, o) => o === 0 ? i : yh(i)));
    if (t.constructor === Tt)
      return ur(s);
  }
  return s[0];
}, Qr = (n, e) => eh(n, e, new Bn()), th = (n) => {
  const e = /* @__PURE__ */ new Map(), t = E(n.restDecoder);
  for (let r = 0; r < t; r++) {
    const s = E(n.restDecoder), i = E(n.restDecoder);
    e.set(s, i);
  }
  return e;
}, Jo = (n) => th(new Fo(hn(n))), Wo = (n, e) => (T(n.restEncoder, e.size), mt(e.entries()).sort((t, r) => r[0] - t[0]).forEach(([t, r]) => {
  T(n.restEncoder, t), T(n.restEncoder, r);
}), n), nh = (n, e) => Wo(n, Vr(e.store)), rh = (n, e = new zo()) => (n instanceof Map ? Wo(e, n) : nh(e, n), e.toUint8Array()), sh = (n) => rh(n, new Bo());
class ih {
  constructor() {
    this.l = [];
  }
}
const Si = () => new ih(), Ii = (n, e) => n.l.push(e), Ci = (n, e) => {
  const t = n.l, r = t.length;
  n.l = t.filter((s) => e !== s), r === n.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, Go = (n, e, t) => js(n.l, [e, t]);
class qt {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, t) {
    this.client = e, this.clock = t;
  }
}
const Hn = (n, e) => n === e || n !== null && e !== null && n.client === e.client && n.clock === e.clock, L = (n, e) => new qt(n, e), oh = (n) => {
  for (const [e, t] of n.doc.share.entries())
    if (t === n)
      return e;
  throw Te();
}, Zt = (n, e) => e === void 0 ? !n.deleted : e.sv.has(n.id.client) && (e.sv.get(n.id.client) || 0) > n.id.clock && !jo(e.ds, n.id), fs = (n, e) => {
  const t = kt(n.meta, fs, Qt), r = n.doc.store;
  t.has(e) || (e.sv.forEach((s, i) => {
    s < q(r, i) && yt(n, L(i, s));
  }), Uo(n, e.ds, (s) => {
  }), t.add(e));
};
class Ho {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const Vr = (n) => {
  const e = /* @__PURE__ */ new Map();
  return n.clients.forEach((t, r) => {
    const s = t[t.length - 1];
    e.set(r, s.id.clock + s.length);
  }), e;
}, q = (n, e) => {
  const t = n.clients.get(e);
  if (t === void 0)
    return 0;
  const r = t[t.length - 1];
  return r.id.clock + r.length;
}, qo = (n, e) => {
  let t = n.clients.get(e.id.client);
  if (t === void 0)
    t = [], n.clients.set(e.id.client, t);
  else {
    const r = t[t.length - 1];
    if (r.id.clock + r.length !== e.id.clock)
      throw Te();
  }
  t.push(e);
}, Ge = (n, e) => {
  let t = 0, r = n.length - 1, s = n[r], i = s.id.clock;
  if (i === e)
    return r;
  let o = Je(e / (i + s.length - 1) * r);
  for (; t <= r; ) {
    if (s = n[o], i = s.id.clock, i <= e) {
      if (e < i + s.length)
        return o;
      t = o + 1;
    } else
      r = o - 1;
    o = Je((t + r) / 2);
  }
  throw Te();
}, ah = (n, e) => {
  const t = n.clients.get(e.client);
  return t[Ge(t, e.clock)];
}, es = (
  /** @type {function(StructStore,ID):Item} */
  ah
), gs = (n, e, t) => {
  const r = Ge(e, t), s = e[r];
  return s.id.clock < t && s instanceof J ? (e.splice(r + 1, 0, yr(n, s, t - s.id.clock)), r + 1) : r;
}, yt = (n, e) => {
  const t = (
    /** @type {Array<Item>} */
    n.doc.store.clients.get(e.client)
  );
  return t[gs(n, t, e.clock)];
}, Ei = (n, e, t) => {
  const r = e.clients.get(t.client), s = Ge(r, t.clock), i = r[s];
  return t.clock !== i.id.clock + i.length - 1 && i.constructor !== Ee && r.splice(s + 1, 0, yr(n, i, t.clock - i.id.clock + 1)), i;
}, ch = (n, e, t) => {
  const r = (
    /** @type {Array<GC|Item>} */
    n.clients.get(e.id.client)
  );
  r[Ge(r, e.id.clock)] = t;
}, Yo = (n, e, t, r, s) => {
  if (r === 0)
    return;
  const i = t + r;
  let o = gs(n, e, t), a;
  do
    a = e[o++], i < a.id.clock + a.length && gs(n, e, i), s(a);
  while (o < e.length && e[o].id.clock < i);
};
class lh {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, t, r) {
    this.doc = e, this.deleteSet = new Kn(), this.beforeState = Vr(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = r, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const Ai = (n, e) => e.deleteSet.clients.size === 0 && !qa(e.afterState, (t, r) => e.beforeState.get(r) !== t) ? !1 : (Js(e.deleteSet), Yl(n, e), dn(n, e.deleteSet), !0), Ti = (n, e, t) => {
  const r = e._item;
  (r === null || r.id.clock < (n.beforeState.get(r.id.client) || 0) && !r.deleted) && kt(n.changed, e, Qt).add(t);
}, nr = (n, e) => {
  let t = n[e], r = n[e - 1], s = e;
  for (; s > 0; t = r, r = n[--s - 1]) {
    if (r.deleted === t.deleted && r.constructor === t.constructor && r.mergeWith(t)) {
      t instanceof J && t.parentSub !== null && /** @type {AbstractType<any>} */
      t.parent._map.get(t.parentSub) === t && t.parent._map.set(
        t.parentSub,
        /** @type {Item} */
        r
      );
      continue;
    }
    break;
  }
  const i = e - s;
  return i && n.splice(e + 1 - i, i), i;
}, hh = (n, e, t) => {
  for (const [r, s] of n.clients.entries()) {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let o = s.length - 1; o >= 0; o--) {
      const a = s[o], c = a.clock + a.len;
      for (let l = Ge(i, a.clock), h = i[l]; l < i.length && h.id.clock < c; h = i[++l]) {
        const u = i[l];
        if (a.clock + a.len <= u.id.clock)
          break;
        u instanceof J && u.deleted && !u.keep && t(u) && u.gc(e, !1);
      }
    }
  }
}, uh = (n, e) => {
  n.clients.forEach((t, r) => {
    const s = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let i = t.length - 1; i >= 0; i--) {
      const o = t[i], a = oo(s.length - 1, 1 + Ge(s, o.clock + o.len - 1));
      for (let c = a, l = s[c]; c > 0 && l.id.clock >= o.clock; l = s[c])
        c -= 1 + nr(s, c);
    }
  });
}, Xo = (n, e) => {
  if (e < n.length) {
    const t = n[e], r = t.doc, s = r.store, i = t.deleteSet, o = t._mergeStructs;
    try {
      Js(i), t.afterState = Vr(t.doc.store), r.emit("beforeObserverCalls", [t, r]);
      const a = [];
      t.changed.forEach(
        (c, l) => a.push(() => {
          (l._item === null || !l._item.deleted) && l._callObserver(t, c);
        })
      ), a.push(() => {
        t.changedParentTypes.forEach((c, l) => {
          l._dEH.l.length > 0 && (l._item === null || !l._item.deleted) && (c = c.filter(
            (h) => h.target._item === null || !h.target._item.deleted
          ), c.forEach((h) => {
            h.currentTarget = l, h._path = null;
          }), c.sort((h, u) => h.path.length - u.path.length), a.push(() => {
            Go(l._dEH, c, t);
          }));
        }), a.push(() => r.emit("afterTransaction", [t, r])), a.push(() => {
          t._needFormattingCleanup && Dh(t);
        });
      }), js(a, []);
    } finally {
      r.gc && hh(i, s, r.gcFilter), uh(i, s), t.afterState.forEach((h, u) => {
        const f = t.beforeState.get(u) || 0;
        if (f !== h) {
          const p = (
            /** @type {Array<GC|Item>} */
            s.clients.get(u)
          ), w = Nt(Ge(p, f), 1);
          for (let b = p.length - 1; b >= w; )
            b -= 1 + nr(p, b);
        }
      });
      for (let h = o.length - 1; h >= 0; h--) {
        const { client: u, clock: f } = o[h].id, p = (
          /** @type {Array<GC|Item>} */
          s.clients.get(u)
        ), w = Ge(p, f);
        w + 1 < p.length && nr(p, w + 1) > 1 || w > 0 && nr(p, w);
      }
      if (!t.local && t.afterState.get(r.clientID) !== t.beforeState.get(r.clientID) && (Zl(zs, Lo, "[yjs] ", No, Mo, "Changed the client-id because another client seems to be using it."), r.clientID = Zo()), r.emit("afterTransactionCleanup", [t, r]), r._observers.has("update")) {
        const h = new Bn();
        Ai(h, t) && r.emit("update", [h.toUint8Array(), t.origin, r, t]);
      }
      if (r._observers.has("updateV2")) {
        const h = new Tt();
        Ai(h, t) && r.emit("updateV2", [h.toUint8Array(), t.origin, r, t]);
      }
      const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: l } = t;
      (a.size > 0 || l.size > 0 || c.size > 0) && (a.forEach((h) => {
        h.clientID = r.clientID, h.collectionid == null && (h.collectionid = r.collectionid), r.subdocs.add(h);
      }), l.forEach((h) => r.subdocs.delete(h)), r.emit("subdocs", [{ loaded: c, added: a, removed: l }, r, t]), l.forEach((h) => h.destroy())), n.length <= e + 1 ? (r._transactionCleanups = [], r.emit("afterAllTransactions", [r, n])) : Xo(n, e + 1);
    }
  }
}, V = (n, e, t = null, r = !0) => {
  const s = n._transactionCleanups;
  let i = !1, o = null;
  n._transaction === null && (i = !0, n._transaction = new lh(n, t, r), s.push(n._transaction), s.length === 1 && n.emit("beforeAllTransactions", [n]), n.emit("beforeTransaction", [n._transaction, n]));
  try {
    o = e(n._transaction);
  } finally {
    if (i) {
      const a = n._transaction === s[0];
      n._transaction = null, a && Xo(s, 0);
    }
  }
  return o;
};
function* dh(n) {
  const e = E(n.restDecoder);
  for (let t = 0; t < e; t++) {
    const r = E(n.restDecoder), s = n.readClient();
    let i = E(n.restDecoder);
    for (let o = 0; o < r; o++) {
      const a = n.readInfo();
      if (a === 10) {
        const c = E(n.restDecoder);
        yield new Ae(L(s, i), c), i += c;
      } else if ((Cr & a) !== 0) {
        const c = (a & (tt | xe)) === 0, l = new J(
          L(s, i),
          null,
          // left
          (a & xe) === xe ? n.readLeftID() : null,
          // origin
          null,
          // right
          (a & tt) === tt ? n.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          c ? n.readParentInfo() ? n.readString() : n.readLeftID() : null,
          // parent
          c && (a & Cn) === Cn ? n.readString() : null,
          // parentSub
          ma(n, a)
          // item content
        );
        yield l, i += l.length;
      } else {
        const c = n.readLen();
        yield new Ee(L(s, i), c), i += c;
      }
    }
  }
}
class Hs {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, t) {
    this.gen = dh(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === Ae);
    return this.curr;
  }
}
class qs {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const fh = (n) => ur(n, Ko, Bn), gh = (n, e) => {
  if (n.constructor === Ee) {
    const { client: t, clock: r } = n.id;
    return new Ee(L(t, r + e), n.length - e);
  } else if (n.constructor === Ae) {
    const { client: t, clock: r } = n.id;
    return new Ae(L(t, r + e), n.length - e);
  } else {
    const t = (
      /** @type {Item} */
      n
    ), { client: r, clock: s } = t.id;
    return new J(
      L(r, s + e),
      null,
      L(r, s + e - 1),
      null,
      t.rightOrigin,
      t.parent,
      t.parentSub,
      t.content.splice(e)
    );
  }
}, ur = (n, e = nn, t = Tt) => {
  if (n.length === 1)
    return n[0];
  const r = n.map((h) => new e(hn(h)));
  let s = r.map((h) => new Hs(h, !0)), i = null;
  const o = new t(), a = new qs(o);
  for (; s = s.filter((f) => f.curr !== null), s.sort(
    /** @type {function(any,any):number} */
    (f, p) => {
      if (f.curr.id.client === p.curr.id.client) {
        const w = f.curr.id.clock - p.curr.id.clock;
        return w === 0 ? f.curr.constructor === p.curr.constructor ? 0 : f.curr.constructor === Ae ? 1 : -1 : w;
      } else
        return p.curr.id.client - f.curr.id.client;
    }
  ), s.length !== 0; ) {
    const h = s[0], u = (
      /** @type {Item | GC} */
      h.curr.id.client
    );
    if (i !== null) {
      let f = (
        /** @type {Item | GC | null} */
        h.curr
      ), p = !1;
      for (; f !== null && f.id.clock + f.length <= i.struct.id.clock + i.struct.length && f.id.client >= i.struct.id.client; )
        f = h.next(), p = !0;
      if (f === null || // current decoder is empty
      f.id.client !== u || // check whether there is another decoder that has has updates from `firstClient`
      p && f.id.clock > i.struct.id.clock + i.struct.length)
        continue;
      if (u !== i.struct.id.client)
        lt(a, i.struct, i.offset), i = { struct: f, offset: 0 }, h.next();
      else if (i.struct.id.clock + i.struct.length < f.id.clock)
        if (i.struct.constructor === Ae)
          i.struct.length = f.id.clock + f.length - i.struct.id.clock;
        else {
          lt(a, i.struct, i.offset);
          const w = f.id.clock - i.struct.id.clock - i.struct.length;
          i = { struct: new Ae(L(u, i.struct.id.clock + i.struct.length), w), offset: 0 };
        }
      else {
        const w = i.struct.id.clock + i.struct.length - f.id.clock;
        w > 0 && (i.struct.constructor === Ae ? i.struct.length -= w : f = gh(f, w)), i.struct.mergeWith(
          /** @type {any} */
          f
        ) || (lt(a, i.struct, i.offset), i = { struct: f, offset: 0 }, h.next());
      }
    } else
      i = { struct: (
        /** @type {Item | GC} */
        h.curr
      ), offset: 0 }, h.next();
    for (let f = h.curr; f !== null && f.id.client === u && f.id.clock === i.struct.id.clock + i.struct.length && f.constructor !== Ae; f = h.next())
      lt(a, i.struct, i.offset), i = { struct: f, offset: 0 };
  }
  i !== null && (lt(a, i.struct, i.offset), i = null), Ys(a);
  const c = r.map((h) => Ws(h)), l = zl(c);
  return dn(o, l), o.toUint8Array();
}, ph = (n, e, t = nn, r = Tt) => {
  const s = Jo(e), i = new r(), o = new qs(i), a = new t(hn(n)), c = new Hs(a, !1);
  for (; c.curr; ) {
    const h = c.curr, u = h.id.client, f = s.get(u) || 0;
    if (c.curr.constructor === Ae) {
      c.next();
      continue;
    }
    if (h.id.clock + h.length > f)
      for (lt(o, h, Nt(f - h.id.clock, 0)), c.next(); c.curr && c.curr.id.client === u; )
        lt(o, c.curr, 0), c.next();
    else
      for (; c.curr && c.curr.id.client === u && c.curr.id.clock + c.curr.length <= f; )
        c.next();
  }
  Ys(o);
  const l = Ws(a);
  return dn(i, l), i.toUint8Array();
}, Qo = (n) => {
  n.written > 0 && (n.clientStructs.push({ written: n.written, restEncoder: Be(n.encoder.restEncoder) }), n.encoder.restEncoder = Er(), n.written = 0);
}, lt = (n, e, t) => {
  n.written > 0 && n.currClient !== e.id.client && Qo(n), n.written === 0 && (n.currClient = e.id.client, n.encoder.writeClient(e.id.client), T(n.encoder.restEncoder, e.id.clock + t)), e.write(n.encoder, t), n.written++;
}, Ys = (n) => {
  Qo(n);
  const e = n.encoder.restEncoder;
  T(e, n.clientStructs.length);
  for (let t = 0; t < n.clientStructs.length; t++) {
    const r = n.clientStructs[t];
    T(e, r.written), Ar(e, r.restEncoder);
  }
}, mh = (n, e, t, r) => {
  const s = new t(hn(n)), i = new Hs(s, !1), o = new r(), a = new qs(o);
  for (let l = i.curr; l !== null; l = i.next())
    lt(a, e(l), 0);
  Ys(a);
  const c = Ws(s);
  return dn(o, c), o.toUint8Array();
}, yh = (n) => mh(n, Bc, nn, Bn), Oi = "You must not compute changes after the event-handler fired.";
class $r {
  /**
   * @param {T} target The changed type.
   * @param {Transaction} transaction
   */
  constructor(e, t) {
    this.target = e, this.currentTarget = e, this.transaction = t, this._changes = null, this._keys = null, this._delta = null, this._path = null;
  }
  /**
   * Computes the path from `y` to the changed type.
   *
   * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
   *
   * The following property holds:
   * @example
   *   let type = y
   *   event.path.forEach(dir => {
   *     type = type.get(dir)
   *   })
   *   type === event.target // => true
   */
  get path() {
    return this._path || (this._path = wh(this.currentTarget, this.target));
  }
  /**
   * Check if a struct is deleted by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  deletes(e) {
    return jo(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw We(Oi);
      const e = /* @__PURE__ */ new Map(), t = this.target;
      /** @type Set<string|null> */
      this.transaction.changed.get(t).forEach((s) => {
        if (s !== null) {
          const i = (
            /** @type {Item} */
            t._map.get(s)
          );
          let o, a;
          if (this.adds(i)) {
            let c = i.left;
            for (; c !== null && this.adds(c); )
              c = c.left;
            if (this.deletes(i))
              if (c !== null && this.deletes(c))
                o = "delete", a = Pr(c.content.getContent());
              else
                return;
            else
              c !== null && this.deletes(c) ? (o = "update", a = Pr(c.content.getContent())) : (o = "add", a = void 0);
          } else if (this.deletes(i))
            o = "delete", a = Pr(
              /** @type {Item} */
              i.content.getContent()
            );
          else
            return;
          e.set(s, { action: o, oldValue: a });
        }
      }), this._keys = e;
    }
    return this._keys;
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
   */
  get delta() {
    return this.changes.delta;
  }
  /**
   * Check if a struct is added by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  adds(e) {
    return e.id.clock >= (this.transaction.beforeState.get(e.id.client) || 0);
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    let e = this._changes;
    if (e === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw We(Oi);
      const t = this.target, r = Qt(), s = Qt(), i = [];
      if (e = {
        added: r,
        deleted: s,
        delta: i,
        keys: this.keys
      }, /** @type Set<string|null> */
      this.transaction.changed.get(t).has(null)) {
        let a = null;
        const c = () => {
          a && i.push(a);
        };
        for (let l = t._start; l !== null; l = l.right)
          l.deleted ? this.deletes(l) && !this.adds(l) && ((a === null || a.delete === void 0) && (c(), a = { delete: 0 }), a.delete += l.length, s.add(l)) : this.adds(l) ? ((a === null || a.insert === void 0) && (c(), a = { insert: [] }), a.insert = a.insert.concat(l.content.getContent()), r.add(l)) : ((a === null || a.retain === void 0) && (c(), a = { retain: 0 }), a.retain += l.length);
        a !== null && a.retain === void 0 && c();
      }
      this._changes = e;
    }
    return (
      /** @type {any} */
      e
    );
  }
}
const wh = (n, e) => {
  const t = [];
  for (; e._item !== null && e !== n; ) {
    if (e._item.parentSub !== null)
      t.unshift(e._item.parentSub);
    else {
      let r = 0, s = (
        /** @type {AbstractType<any>} */
        e._item.parent._start
      );
      for (; s !== e._item && s !== null; )
        !s.deleted && s.countable && (r += s.length), s = s.right;
      t.unshift(r);
    }
    e = /** @type {AbstractType<any>} */
    e._item.parent;
  }
  return t;
}, ce = () => {
  Fl("Invalid access: Add Yjs type to a document before reading data.");
}, ea = 80;
let Xs = 0;
class _h {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, t) {
    e.marker = !0, this.p = e, this.index = t, this.timestamp = Xs++;
  }
}
const vh = (n) => {
  n.timestamp = Xs++;
}, ta = (n, e, t) => {
  n.p.marker = !1, n.p = e, e.marker = !0, n.index = t, n.timestamp = Xs++;
}, kh = (n, e, t) => {
  if (n.length >= ea) {
    const r = n.reduce((s, i) => s.timestamp < i.timestamp ? s : i);
    return ta(r, e, t), r;
  } else {
    const r = new _h(e, t);
    return n.push(r), r;
  }
}, Ur = (n, e) => {
  if (n._start === null || e === 0 || n._searchMarker === null)
    return null;
  const t = n._searchMarker.length === 0 ? null : n._searchMarker.reduce((i, o) => Xn(e - i.index) < Xn(e - o.index) ? i : o);
  let r = n._start, s = 0;
  for (t !== null && (r = t.p, s = t.index, vh(t)); r.right !== null && s < e; ) {
    if (!r.deleted && r.countable) {
      if (e < s + r.length)
        break;
      s += r.length;
    }
    r = r.right;
  }
  for (; r.left !== null && s > e; )
    r = r.left, !r.deleted && r.countable && (s -= r.length);
  for (; r.left !== null && r.left.id.client === r.id.client && r.left.id.clock + r.left.length === r.id.clock; )
    r = r.left, !r.deleted && r.countable && (s -= r.length);
  return t !== null && Xn(t.index - s) < /** @type {YText|YArray<any>} */
  r.parent.length / ea ? (ta(t, r, s), t) : kh(n._searchMarker, r, s);
}, Nn = (n, e, t) => {
  for (let r = n.length - 1; r >= 0; r--) {
    const s = n[r];
    if (t > 0) {
      let i = s.p;
      for (i.marker = !1; i && (i.deleted || !i.countable); )
        i = i.left, i && !i.deleted && i.countable && (s.index -= i.length);
      if (i === null || i.marker === !0) {
        n.splice(r, 1);
        continue;
      }
      s.p = i, i.marker = !0;
    }
    (e < s.index || t > 0 && e === s.index) && (s.index = Nt(e, s.index + t));
  }
}, jr = (n, e, t) => {
  const r = n, s = e.changedParentTypes;
  for (; kt(s, n, () => []).push(t), n._item !== null; )
    n = /** @type {AbstractType<any>} */
    n._item.parent;
  Go(r._eH, t, e);
};
class ie {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = Si(), this._dEH = Si(), this._searchMarker = null;
  }
  /**
   * @return {AbstractType<any>|null}
   */
  get parent() {
    return this._item ? (
      /** @type {AbstractType<any>} */
      this._item.parent
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item|null} item
   */
  _integrate(e, t) {
    this.doc = e, this._item = t;
  }
  /**
   * @return {AbstractType<EventType>}
   */
  _copy() {
    throw Ve();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw Ve();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
   */
  _write(e) {
  }
  /**
   * The first non-deleted item
   */
  get _first() {
    let e = this._start;
    for (; e !== null && e.deleted; )
      e = e.right;
    return e;
  }
  /**
   * Creates YEvent and calls all type observers.
   * Must be implemented by each type.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    !e.local && this._searchMarker && (this._searchMarker.length = 0);
  }
  /**
   * Observe all events that are created on this type.
   *
   * @param {function(EventType, Transaction):void} f Observer function
   */
  observe(e) {
    Ii(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    Ii(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    Ci(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    Ci(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const na = (n, e, t) => {
  n.doc ?? ce(), e < 0 && (e = n._length + e), t < 0 && (t = n._length + t);
  let r = t - e;
  const s = [];
  let i = n._start;
  for (; i !== null && r > 0; ) {
    if (i.countable && !i.deleted) {
      const o = i.content.getContent();
      if (o.length <= e)
        e -= o.length;
      else {
        for (let a = e; a < o.length && r > 0; a++)
          s.push(o[a]), r--;
        e = 0;
      }
    }
    i = i.right;
  }
  return s;
}, ra = (n) => {
  n.doc ?? ce();
  const e = [];
  let t = n._start;
  for (; t !== null; ) {
    if (t.countable && !t.deleted) {
      const r = t.content.getContent();
      for (let s = 0; s < r.length; s++)
        e.push(r[s]);
    }
    t = t.right;
  }
  return e;
}, Mn = (n, e) => {
  let t = 0, r = n._start;
  for (n.doc ?? ce(); r !== null; ) {
    if (r.countable && !r.deleted) {
      const s = r.content.getContent();
      for (let i = 0; i < s.length; i++)
        e(s[i], t++, n);
    }
    r = r.right;
  }
}, sa = (n, e) => {
  const t = [];
  return Mn(n, (r, s) => {
    t.push(e(r, s, n));
  }), t;
}, bh = (n) => {
  let e = n._start, t = null, r = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next: () => {
      if (t === null) {
        for (; e !== null && e.deleted; )
          e = e.right;
        if (e === null)
          return {
            done: !0,
            value: void 0
          };
        t = e.content.getContent(), r = 0, e = e.right;
      }
      const s = t[r++];
      return t.length <= r && (t = null), {
        done: !1,
        value: s
      };
    }
  };
}, ia = (n, e) => {
  n.doc ?? ce();
  const t = Ur(n, e);
  let r = n._start;
  for (t !== null && (r = t.p, e -= t.index); r !== null; r = r.right)
    if (!r.deleted && r.countable) {
      if (e < r.length)
        return r.content.getContent()[e];
      e -= r.length;
    }
}, dr = (n, e, t, r) => {
  let s = t;
  const i = n.doc, o = i.clientID, a = i.store, c = t === null ? e._start : t.right;
  let l = [];
  const h = () => {
    l.length > 0 && (s = new J(L(o, q(a, o)), s, s && s.lastId, c, c && c.id, e, null, new Dt(l)), s.integrate(n, 0), l = []);
  };
  r.forEach((u) => {
    if (u === null)
      l.push(u);
    else
      switch (u.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          l.push(u);
          break;
        default:
          switch (h(), u.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              s = new J(L(o, q(a, o)), s, s && s.lastId, c, c && c.id, e, null, new zn(new Uint8Array(
                /** @type {Uint8Array} */
                u
              ))), s.integrate(n, 0);
              break;
            case gt:
              s = new J(L(o, q(a, o)), s, s && s.lastId, c, c && c.id, e, null, new Pn(
                /** @type {Doc} */
                u
              )), s.integrate(n, 0);
              break;
            default:
              if (u instanceof ie)
                s = new J(L(o, q(a, o)), s, s && s.lastId, c, c && c.id, e, null, new st(u)), s.integrate(n, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), h();
}, oa = () => We("Length exceeded!"), aa = (n, e, t, r) => {
  if (t > e._length)
    throw oa();
  if (t === 0)
    return e._searchMarker && Nn(e._searchMarker, t, r.length), dr(n, e, null, r);
  const s = t, i = Ur(e, t);
  let o = e._start;
  for (i !== null && (o = i.p, t -= i.index, t === 0 && (o = o.prev, t += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right)
    if (!o.deleted && o.countable) {
      if (t <= o.length) {
        t < o.length && yt(n, L(o.id.client, o.id.clock + t));
        break;
      }
      t -= o.length;
    }
  return e._searchMarker && Nn(e._searchMarker, s, r.length), dr(n, e, o, r);
}, xh = (n, e, t) => {
  let s = (e._searchMarker || []).reduce((i, o) => o.index > i.index ? o : i, { index: 0, p: e._start }).p;
  if (s)
    for (; s.right; )
      s = s.right;
  return dr(n, e, s, t);
}, ca = (n, e, t, r) => {
  if (r === 0)
    return;
  const s = t, i = r, o = Ur(e, t);
  let a = e._start;
  for (o !== null && (a = o.p, t -= o.index); a !== null && t > 0; a = a.right)
    !a.deleted && a.countable && (t < a.length && yt(n, L(a.id.client, a.id.clock + t)), t -= a.length);
  for (; r > 0 && a !== null; )
    a.deleted || (r < a.length && yt(n, L(a.id.client, a.id.clock + r)), a.delete(n), r -= a.length), a = a.right;
  if (r > 0)
    throw oa();
  e._searchMarker && Nn(
    e._searchMarker,
    s,
    -i + r
    /* in case we remove the above exception */
  );
}, fr = (n, e, t) => {
  const r = e._map.get(t);
  r !== void 0 && r.delete(n);
}, Qs = (n, e, t, r) => {
  const s = e._map.get(t) || null, i = n.doc, o = i.clientID;
  let a;
  if (r == null)
    a = new Dt([r]);
  else
    switch (r.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        a = new Dt([r]);
        break;
      case Uint8Array:
        a = new zn(
          /** @type {Uint8Array} */
          r
        );
        break;
      case gt:
        a = new Pn(
          /** @type {Doc} */
          r
        );
        break;
      default:
        if (r instanceof ie)
          a = new st(r);
        else
          throw new Error("Unexpected content type");
    }
  new J(L(o, q(i.store, o)), s, s && s.lastId, null, null, e, t, a).integrate(n, 0);
}, ei = (n, e) => {
  n.doc ?? ce();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted ? t.content.getContent()[t.length - 1] : void 0;
}, la = (n) => {
  const e = {};
  return n.doc ?? ce(), n._map.forEach((t, r) => {
    t.deleted || (e[r] = t.content.getContent()[t.length - 1]);
  }), e;
}, ha = (n, e) => {
  n.doc ?? ce();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted;
}, Sh = (n, e) => {
  const t = {};
  return n._map.forEach((r, s) => {
    let i = r;
    for (; i !== null && (!e.sv.has(i.id.client) || i.id.clock >= (e.sv.get(i.id.client) || 0)); )
      i = i.left;
    i !== null && Zt(i, e) && (t[s] = i.content.getContent()[i.length - 1]);
  }), t;
}, qn = (n) => (n.doc ?? ce(), Kl(
  n._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class Ih extends $r {
}
class Yt extends ie {
  constructor() {
    super(), this._prelimContent = [], this._searchMarker = [];
  }
  /**
   * Construct a new YArray containing the specified items.
   * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
   * @param {Array<T>} items
   * @return {YArray<T>}
   */
  static from(e) {
    const t = new Yt();
    return t.push(e), t;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t), this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    ), this._prelimContent = null;
  }
  /**
   * @return {YArray<T>}
   */
  _copy() {
    return new Yt();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new Yt();
    return e.insert(0, this.toArray().map(
      (t) => t instanceof ie ? (
        /** @type {typeof el} */
        t.clone()
      ) : t
    )), e;
  }
  get length() {
    return this.doc ?? ce(), this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    super._callObserver(e, t), jr(this, e, new Ih(this, e));
  }
  /**
   * Inserts new content at an index.
   *
   * Important: This function expects an array of content. Not just a content
   * object. The reason for this "weirdness" is that inserting several elements
   * is very efficient when it is done as a single operation.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  yarray.insert(0, ['a'])
   *  // Insert numbers 1, 2 at position 1
   *  yarray.insert(1, [1, 2])
   *
   * @param {number} index The index to insert content at.
   * @param {Array<T>} content The array of content
   */
  insert(e, t) {
    this.doc !== null ? V(this.doc, (r) => {
      aa(
        r,
        this,
        e,
        /** @type {any} */
        t
      );
    }) : this._prelimContent.splice(e, 0, ...t);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<T>} content Array of content to append.
   *
   * @todo Use the following implementation in all types.
   */
  push(e) {
    this.doc !== null ? V(this.doc, (t) => {
      xh(
        t,
        this,
        /** @type {any} */
        e
      );
    }) : this._prelimContent.push(...e);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<T>} content Array of content to prepend.
   */
  unshift(e) {
    this.insert(0, e);
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} length The number of elements to remove. Defaults to 1.
   */
  delete(e, t = 1) {
    this.doc !== null ? V(this.doc, (r) => {
      ca(r, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return ia(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return ra(this);
  }
  /**
   * Returns a portion of this YArray into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<T>}
   */
  slice(e = 0, t = this.length) {
    return na(this, e, t);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof ie ? e.toJSON() : e);
  }
  /**
   * Returns an Array with the result of calling a provided function on every
   * element of this YArray.
   *
   * @template M
   * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
   * @return {Array<M>} A new array with each element being the result of the
   *                 callback function
   */
  map(e) {
    return sa(
      this,
      /** @type {any} */
      e
    );
  }
  /**
   * Executes a provided function once on every element of this YArray.
   *
   * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Mn(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return bh(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(qh);
  }
}
const Ch = (n) => new Yt();
class Eh extends $r {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, t, r) {
    super(e, t), this.keysChanged = r;
  }
}
class D extends ie {
  /**
   *
   * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
   */
  constructor(e) {
    super(), this._prelimContent = null, e === void 0 ? this._prelimContent = /* @__PURE__ */ new Map() : this._prelimContent = new Map(e);
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t), this._prelimContent.forEach((r, s) => {
      this.set(s, r);
    }), this._prelimContent = null;
  }
  /**
   * @return {YMap<MapType>}
   */
  _copy() {
    return new D();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const e = new D();
    return this.forEach((t, r) => {
      e.set(r, t instanceof ie ? (
        /** @type {typeof value} */
        t.clone()
      ) : t);
    }), e;
  }
  /**
   * Creates YMapEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    jr(this, e, new Eh(this, e, t));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? ce();
    const e = {};
    return this._map.forEach((t, r) => {
      if (!t.deleted) {
        const s = t.content.getContent()[t.length - 1];
        e[r] = s instanceof ie ? s.toJSON() : s;
      }
    }), e;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...qn(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return Xr(
      qn(this),
      /** @param {any} v */
      (e) => e[0]
    );
  }
  /**
   * Returns the values for each element in the YMap Type.
   *
   * @return {IterableIterator<MapType>}
   */
  values() {
    return Xr(
      qn(this),
      /** @param {any} v */
      (e) => e[1].content.getContent()[e[1].length - 1]
    );
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  entries() {
    return Xr(
      qn(this),
      /** @param {any} v */
      (e) => (
        /** @type {any} */
        [e[0], e[1].content.getContent()[e[1].length - 1]]
      )
    );
  }
  /**
   * Executes a provided function on once on every key-value pair.
   *
   * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    this.doc ?? ce(), this._map.forEach((t, r) => {
      t.deleted || e(t.content.getContent()[t.length - 1], r, this);
    });
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Remove a specified element from this YMap.
   *
   * @param {string} key The key of the element to remove.
   */
  delete(e) {
    this.doc !== null ? V(this.doc, (t) => {
      fr(t, this, e);
    }) : this._prelimContent.delete(e);
  }
  /**
   * Adds or updates an element with a specified key and value.
   * @template {MapType} VAL
   *
   * @param {string} key The key of the element to add to this YMap
   * @param {VAL} value The value of the element to add
   * @return {VAL}
   */
  set(e, t) {
    return this.doc !== null ? V(this.doc, (r) => {
      Qs(
        r,
        this,
        e,
        /** @type {any} */
        t
      );
    }) : this._prelimContent.set(e, t), t;
  }
  /**
   * Returns a specified element from this YMap.
   *
   * @param {string} key
   * @return {MapType|undefined}
   */
  get(e) {
    return (
      /** @type {any} */
      ei(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return ha(this, e);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    this.doc !== null ? V(this.doc, (e) => {
      this.forEach(function(t, r, s) {
        fr(e, s, r);
      });
    }) : this._prelimContent.clear();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Yh);
  }
}
const Ah = (n) => new D(), ft = (n, e) => n === e || typeof n == "object" && typeof e == "object" && n && e && Fc(n, e);
class ps {
  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
  constructor(e, t, r, s) {
    this.left = e, this.right = t, this.index = r, this.currentAttributes = s;
  }
  /**
   * Only call this if you know that this.right is defined
   */
  forward() {
    switch (this.right === null && Te(), this.right.content.constructor) {
      case W:
        this.right.deleted || fn(
          this.currentAttributes,
          /** @type {ContentFormat} */
          this.right.content
        );
        break;
      default:
        this.right.deleted || (this.index += this.right.length);
        break;
    }
    this.left = this.right, this.right = this.right.right;
  }
}
const Di = (n, e, t) => {
  for (; e.right !== null && t > 0; ) {
    switch (e.right.content.constructor) {
      case W:
        e.right.deleted || fn(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (t < e.right.length && yt(n, L(e.right.id.client, e.right.id.clock + t)), e.index += e.right.length, t -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, Yn = (n, e, t, r) => {
  const s = /* @__PURE__ */ new Map(), i = r ? Ur(e, t) : null;
  if (i) {
    const o = new ps(i.p.left, i.p, i.index, s);
    return Di(n, o, t - i.index);
  } else {
    const o = new ps(null, e._start, 0, s);
    return Di(n, o, t);
  }
}, ua = (n, e, t, r) => {
  for (; t.right !== null && (t.right.deleted === !0 || t.right.content.constructor === W && ft(
    r.get(
      /** @type {ContentFormat} */
      t.right.content.key
    ),
    /** @type {ContentFormat} */
    t.right.content.value
  )); )
    t.right.deleted || r.delete(
      /** @type {ContentFormat} */
      t.right.content.key
    ), t.forward();
  const s = n.doc, i = s.clientID;
  r.forEach((o, a) => {
    const c = t.left, l = t.right, h = new J(L(i, q(s.store, i)), c, c && c.lastId, l, l && l.id, e, null, new W(a, o));
    h.integrate(n, 0), t.right = h, t.forward();
  });
}, fn = (n, e) => {
  const { key: t, value: r } = e;
  r === null ? n.delete(t) : n.set(t, r);
}, da = (n, e) => {
  for (; n.right !== null; ) {
    if (!(n.right.deleted || n.right.content.constructor === W && ft(
      e[
        /** @type {ContentFormat} */
        n.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      n.right.content.value
    ))) break;
    n.forward();
  }
}, fa = (n, e, t, r) => {
  const s = n.doc, i = s.clientID, o = /* @__PURE__ */ new Map();
  for (const a in r) {
    const c = r[a], l = t.currentAttributes.get(a) ?? null;
    if (!ft(l, c)) {
      o.set(a, l);
      const { left: h, right: u } = t;
      t.right = new J(L(i, q(s.store, i)), h, h && h.lastId, u, u && u.id, e, null, new W(a, c)), t.right.integrate(n, 0), t.forward();
    }
  }
  return o;
}, ts = (n, e, t, r, s) => {
  t.currentAttributes.forEach((f, p) => {
    s[p] === void 0 && (s[p] = null);
  });
  const i = n.doc, o = i.clientID;
  da(t, s);
  const a = fa(n, e, t, s), c = r.constructor === String ? new He(
    /** @type {string} */
    r
  ) : r instanceof ie ? new st(r) : new Mt(r);
  let { left: l, right: h, index: u } = t;
  e._searchMarker && Nn(e._searchMarker, t.index, c.getLength()), h = new J(L(o, q(i.store, o)), l, l && l.lastId, h, h && h.id, e, null, c), h.integrate(n, 0), t.right = h, t.index = u, t.forward(), ua(n, e, t, a);
}, Li = (n, e, t, r, s) => {
  const i = n.doc, o = i.clientID;
  da(t, s);
  const a = fa(n, e, t, s);
  e: for (; t.right !== null && (r > 0 || a.size > 0 && (t.right.deleted || t.right.content.constructor === W)); ) {
    if (!t.right.deleted)
      switch (t.right.content.constructor) {
        case W: {
          const { key: c, value: l } = (
            /** @type {ContentFormat} */
            t.right.content
          ), h = s[c];
          if (h !== void 0) {
            if (ft(h, l))
              a.delete(c);
            else {
              if (r === 0)
                break e;
              a.set(c, l);
            }
            t.right.delete(n);
          } else
            t.currentAttributes.set(c, l);
          break;
        }
        default:
          r < t.right.length && yt(n, L(t.right.id.client, t.right.id.clock + r)), r -= t.right.length;
          break;
      }
    t.forward();
  }
  if (r > 0) {
    let c = "";
    for (; r > 0; r--)
      c += `
`;
    t.right = new J(L(o, q(i.store, o)), t.left, t.left && t.left.lastId, t.right, t.right && t.right.id, e, null, new He(c)), t.right.integrate(n, 0), t.forward();
  }
  ua(n, e, t, a);
}, ga = (n, e, t, r, s) => {
  let i = e;
  const o = Re();
  for (; i && (!i.countable || i.deleted); ) {
    if (!i.deleted && i.content.constructor === W) {
      const l = (
        /** @type {ContentFormat} */
        i.content
      );
      o.set(l.key, l);
    }
    i = i.right;
  }
  let a = 0, c = !1;
  for (; e !== i; ) {
    if (t === e && (c = !0), !e.deleted) {
      const l = e.content;
      switch (l.constructor) {
        case W: {
          const { key: h, value: u } = (
            /** @type {ContentFormat} */
            l
          ), f = r.get(h) ?? null;
          (o.get(h) !== l || f === u) && (e.delete(n), a++, !c && (s.get(h) ?? null) === u && f !== u && (f === null ? s.delete(h) : s.set(h, f))), !c && !e.deleted && fn(
            s,
            /** @type {ContentFormat} */
            l
          );
          break;
        }
      }
    }
    e = /** @type {Item} */
    e.right;
  }
  return a;
}, Th = (n, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const t = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === W) {
      const r = (
        /** @type {ContentFormat} */
        e.content.key
      );
      t.has(r) ? e.delete(n) : t.add(r);
    }
    e = e.left;
  }
}, Oh = (n) => {
  let e = 0;
  return V(
    /** @type {Doc} */
    n.doc,
    (t) => {
      let r = (
        /** @type {Item} */
        n._start
      ), s = n._start, i = Re();
      const o = as(i);
      for (; s; ) {
        if (s.deleted === !1)
          switch (s.content.constructor) {
            case W:
              fn(
                o,
                /** @type {ContentFormat} */
                s.content
              );
              break;
            default:
              e += ga(t, r, s, i, o), i = as(o), r = s;
              break;
          }
        s = s.right;
      }
    }
  ), e;
}, Dh = (n) => {
  const e = /* @__PURE__ */ new Set(), t = n.doc;
  for (const [r, s] of n.afterState.entries()) {
    const i = n.beforeState.get(r) || 0;
    s !== i && Yo(
      n,
      /** @type {Array<Item|GC>} */
      t.store.clients.get(r),
      i,
      s,
      (o) => {
        !o.deleted && /** @type {Item} */
        o.content.constructor === W && o.constructor !== Ee && e.add(
          /** @type {any} */
          o.parent
        );
      }
    );
  }
  V(t, (r) => {
    Uo(n, n.deleteSet, (s) => {
      if (s instanceof Ee || !/** @type {YText} */
      s.parent._hasFormatting || e.has(
        /** @type {YText} */
        s.parent
      ))
        return;
      const i = (
        /** @type {YText} */
        s.parent
      );
      s.content.constructor === W ? e.add(i) : Th(r, s);
    });
    for (const s of e)
      Oh(s);
  });
}, Ni = (n, e, t) => {
  const r = t, s = as(e.currentAttributes), i = e.right;
  for (; t > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case st:
        case Mt:
        case He:
          t < e.right.length && yt(n, L(e.right.id.client, e.right.id.clock + t)), t -= e.right.length, e.right.delete(n);
          break;
      }
    e.forward();
  }
  i && ga(n, i, e.right, s, e.currentAttributes);
  const o = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return o._searchMarker && Nn(o._searchMarker, e.index, -r + t), e;
};
class Lh extends $r {
  /**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
  constructor(e, t, r) {
    super(e, t), this.childListChanged = !1, this.keysChanged = /* @__PURE__ */ new Set(), r.forEach((s) => {
      s === null ? this.childListChanged = !0 : this.keysChanged.add(s);
    });
  }
  /**
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    if (this._changes === null) {
      const e = {
        keys: this.keys,
        delta: this.delta,
        added: /* @__PURE__ */ new Set(),
        deleted: /* @__PURE__ */ new Set()
      };
      this._changes = e;
    }
    return (
      /** @type {any} */
      this._changes
    );
  }
  /**
   * Compute the changes in the delta format.
   * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
   *
   * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
   *
   * @public
   */
  get delta() {
    if (this._delta === null) {
      const e = (
        /** @type {Doc} */
        this.target.doc
      ), t = [];
      V(e, (r) => {
        const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
        let o = this.target._start, a = null;
        const c = {};
        let l = "", h = 0, u = 0;
        const f = () => {
          if (a !== null) {
            let p = null;
            switch (a) {
              case "delete":
                u > 0 && (p = { delete: u }), u = 0;
                break;
              case "insert":
                (typeof l == "object" || l.length > 0) && (p = { insert: l }, s.size > 0 && (p.attributes = {}, s.forEach((w, b) => {
                  w !== null && (p.attributes[b] = w);
                }))), l = "";
                break;
              case "retain":
                h > 0 && (p = { retain: h }, Zc(c) || (p.attributes = $c({}, c))), h = 0;
                break;
            }
            p && t.push(p), a = null;
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case st:
            case Mt:
              this.adds(o) ? this.deletes(o) || (f(), a = "insert", l = o.content.getContent()[0], f()) : this.deletes(o) ? (a !== "delete" && (f(), a = "delete"), u += 1) : o.deleted || (a !== "retain" && (f(), a = "retain"), h += 1);
              break;
            case He:
              this.adds(o) ? this.deletes(o) || (a !== "insert" && (f(), a = "insert"), l += /** @type {ContentString} */
              o.content.str) : this.deletes(o) ? (a !== "delete" && (f(), a = "delete"), u += o.length) : o.deleted || (a !== "retain" && (f(), a = "retain"), h += o.length);
              break;
            case W: {
              const { key: p, value: w } = (
                /** @type {ContentFormat} */
                o.content
              );
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const b = s.get(p) ?? null;
                  ft(b, w) ? w !== null && o.delete(r) : (a === "retain" && f(), ft(w, i.get(p) ?? null) ? delete c[p] : c[p] = w);
                }
              } else if (this.deletes(o)) {
                i.set(p, w);
                const b = s.get(p) ?? null;
                ft(b, w) || (a === "retain" && f(), c[p] = b);
              } else if (!o.deleted) {
                i.set(p, w);
                const b = c[p];
                b !== void 0 && (ft(b, w) ? b !== null && o.delete(r) : (a === "retain" && f(), w === null ? delete c[p] : c[p] = w));
              }
              o.deleted || (a === "insert" && f(), fn(
                s,
                /** @type {ContentFormat} */
                o.content
              ));
              break;
            }
          }
          o = o.right;
        }
        for (f(); t.length > 0; ) {
          const p = t[t.length - 1];
          if (p.retain !== void 0 && p.attributes === void 0)
            t.pop();
          else
            break;
        }
      }), this._delta = t;
    }
    return (
      /** @type {any} */
      this._delta
    );
  }
}
class $ extends ie {
  /**
   * @param {String} [string] The initial value of the YText.
   */
  constructor(e) {
    super(), this._pending = e !== void 0 ? [() => this.insert(0, e)] : [], this._searchMarker = [], this._hasFormatting = !1;
  }
  /**
   * Number of characters of this text type.
   *
   * @type {number}
   */
  get length() {
    return this.doc ?? ce(), this._length;
  }
  /**
   * @param {Doc} y
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t);
    try {
      this._pending.forEach((r) => r());
    } catch (r) {
      console.error(r);
    }
    this._pending = null;
  }
  _copy() {
    return new $();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const e = new $();
    return e.applyDelta(this.toDelta()), e;
  }
  /**
   * Creates YTextEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    super._callObserver(e, t);
    const r = new Lh(this, e, t);
    jr(this, e, r), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? ce();
    let e = "", t = this._start;
    for (; t !== null; )
      !t.deleted && t.countable && t.content.constructor === He && (e += /** @type {ContentString} */
      t.content.str), t = t.right;
    return e;
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @return {string}
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Apply a {@link Delta} on this shared YText type.
   *
   * @param {Array<any>} delta The changes to apply on this element.
   * @param {object}  opts
   * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
   *
   *
   * @public
   */
  applyDelta(e, { sanitize: t = !0 } = {}) {
    this.doc !== null ? V(this.doc, (r) => {
      const s = new ps(null, this._start, 0, /* @__PURE__ */ new Map());
      for (let i = 0; i < e.length; i++) {
        const o = e[i];
        if (o.insert !== void 0) {
          const a = !t && typeof o.insert == "string" && i === e.length - 1 && s.right === null && o.insert.slice(-1) === `
` ? o.insert.slice(0, -1) : o.insert;
          (typeof a != "string" || a.length > 0) && ts(r, this, s, a, o.attributes || {});
        } else o.retain !== void 0 ? Li(r, this, s, o.retain, o.attributes || {}) : o.delete !== void 0 && Ni(r, s, o.delete);
      }
    }) : this._pending.push(() => this.applyDelta(e));
  }
  /**
   * Returns the Delta representation of this YText type.
   *
   * @param {Snapshot} [snapshot]
   * @param {Snapshot} [prevSnapshot]
   * @param {function('removed' | 'added', ID):any} [computeYChange]
   * @return {any} The Delta representation of this type.
   *
   * @public
   */
  toDelta(e, t, r) {
    this.doc ?? ce();
    const s = [], i = /* @__PURE__ */ new Map(), o = (
      /** @type {Doc} */
      this.doc
    );
    let a = "", c = this._start;
    function l() {
      if (a.length > 0) {
        const u = {};
        let f = !1;
        i.forEach((w, b) => {
          f = !0, u[b] = w;
        });
        const p = { insert: a };
        f && (p.attributes = u), s.push(p), a = "";
      }
    }
    const h = () => {
      for (; c !== null; ) {
        if (Zt(c, e) || t !== void 0 && Zt(c, t))
          switch (c.content.constructor) {
            case He: {
              const u = i.get("ychange");
              e !== void 0 && !Zt(c, e) ? (u === void 0 || u.user !== c.id.client || u.type !== "removed") && (l(), i.set("ychange", r ? r("removed", c.id) : { type: "removed" })) : t !== void 0 && !Zt(c, t) ? (u === void 0 || u.user !== c.id.client || u.type !== "added") && (l(), i.set("ychange", r ? r("added", c.id) : { type: "added" })) : u !== void 0 && (l(), i.delete("ychange")), a += /** @type {ContentString} */
              c.content.str;
              break;
            }
            case st:
            case Mt: {
              l();
              const u = {
                insert: c.content.getContent()[0]
              };
              if (i.size > 0) {
                const f = (
                  /** @type {Object<string,any>} */
                  {}
                );
                u.attributes = f, i.forEach((p, w) => {
                  f[w] = p;
                });
              }
              s.push(u);
              break;
            }
            case W:
              Zt(c, e) && (l(), fn(
                i,
                /** @type {ContentFormat} */
                c.content
              ));
              break;
          }
        c = c.right;
      }
      l();
    };
    return e || t ? V(o, (u) => {
      e && fs(u, e), t && fs(u, t), h();
    }, "cleanup") : h(), s;
  }
  /**
   * Insert text at a given index.
   *
   * @param {number} index The index at which to start inserting.
   * @param {String} text The text to insert at the specified position.
   * @param {TextAttributes} [attributes] Optionally define some formatting
   *                                    information to apply on the inserted
   *                                    Text.
   * @public
   */
  insert(e, t, r) {
    if (t.length <= 0)
      return;
    const s = this.doc;
    s !== null ? V(s, (i) => {
      const o = Yn(i, this, e, !r);
      r || (r = {}, o.currentAttributes.forEach((a, c) => {
        r[c] = a;
      })), ts(i, this, o, t, r);
    }) : this._pending.push(() => this.insert(e, t, r));
  }
  /**
   * Inserts an embed at a index.
   *
   * @param {number} index The index to insert the embed at.
   * @param {Object | AbstractType<any>} embed The Object that represents the embed.
   * @param {TextAttributes} [attributes] Attribute information to apply on the
   *                                    embed
   *
   * @public
   */
  insertEmbed(e, t, r) {
    const s = this.doc;
    s !== null ? V(s, (i) => {
      const o = Yn(i, this, e, !r);
      ts(i, this, o, t, r || {});
    }) : this._pending.push(() => this.insertEmbed(e, t, r || {}));
  }
  /**
   * Deletes text starting from an index.
   *
   * @param {number} index Index at which to start deleting.
   * @param {number} length The number of characters to remove. Defaults to 1.
   *
   * @public
   */
  delete(e, t) {
    if (t === 0)
      return;
    const r = this.doc;
    r !== null ? V(r, (s) => {
      Ni(s, Yn(s, this, e, !0), t);
    }) : this._pending.push(() => this.delete(e, t));
  }
  /**
   * Assigns properties to a range of text.
   *
   * @param {number} index The position where to start formatting.
   * @param {number} length The amount of characters to assign properties to.
   * @param {TextAttributes} attributes Attribute information to apply on the
   *                                    text.
   *
   * @public
   */
  format(e, t, r) {
    if (t === 0)
      return;
    const s = this.doc;
    s !== null ? V(s, (i) => {
      const o = Yn(i, this, e, !1);
      o.right !== null && Li(i, this, o, t, r);
    }) : this._pending.push(() => this.format(e, t, r));
  }
  /**
   * Removes an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(e) {
    this.doc !== null ? V(this.doc, (t) => {
      fr(t, this, e);
    }) : this._pending.push(() => this.removeAttribute(e));
  }
  /**
   * Sets or updates an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be set.
   * @param {any} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(e, t) {
    this.doc !== null ? V(this.doc, (r) => {
      Qs(r, this, e, t);
    }) : this._pending.push(() => this.setAttribute(e, t));
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {any} The queried attribute value.
   *
   * @public
   */
  getAttribute(e) {
    return (
      /** @type {any} */
      ei(this, e)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @return {Object<string, any>} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes() {
    return la(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Xh);
  }
}
const Nh = (n) => new $();
class ns {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(e, t = () => !0) {
    this._filter = t, this._root = e, this._currentNode = /** @type {Item} */
    e._start, this._firstCall = !0, e.doc ?? ce();
  }
  [Symbol.iterator]() {
    return this;
  }
  /**
   * Get the next node.
   *
   * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
   *
   * @public
   */
  next() {
    let e = this._currentNode, t = e && e.content && /** @type {any} */
    e.content.type;
    if (e !== null && (!this._firstCall || e.deleted || !this._filter(t)))
      do
        if (t = /** @type {any} */
        e.content.type, !e.deleted && (t.constructor === rn || t.constructor === Ot) && t._start !== null)
          e = t._start;
        else
          for (; e !== null; ) {
            const r = e.next;
            if (r !== null) {
              e = r;
              break;
            } else e.parent === this._root ? e = null : e = /** @type {AbstractType<any>} */
            e.parent._item;
          }
      while (e !== null && (e.deleted || !this._filter(
        /** @type {ContentType} */
        e.content.type
      )));
    return this._firstCall = !1, e === null ? { value: void 0, done: !0 } : (this._currentNode = e, { value: (
      /** @type {any} */
      e.content.type
    ), done: !1 });
  }
}
class Ot extends ie {
  constructor() {
    super(), this._prelimContent = [];
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get firstChild() {
    const e = this._first;
    return e ? e.content.getContent()[0] : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t), this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    ), this._prelimContent = null;
  }
  _copy() {
    return new Ot();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new Ot();
    return e.insert(0, this.toArray().map((t) => t instanceof ie ? t.clone() : t)), e;
  }
  get length() {
    return this.doc ?? ce(), this._prelimContent === null ? this._length : this._prelimContent.length;
  }
  /**
   * Create a subtree of childNodes.
   *
   * @example
   * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
   * for (let node in walker) {
   *   // `node` is a div node
   *   nop(node)
   * }
   *
   * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
   *                          returns a Boolean indicating whether the child
   *                          is to be included in the subtree.
   * @return {YXmlTreeWalker} A subtree and a position within it.
   *
   * @public
   */
  createTreeWalker(e) {
    return new ns(this, e);
  }
  /**
   * Returns the first YXmlElement that matches the query.
   * Similar to DOM's {@link querySelector}.
   *
   * Query support:
   *   - tagname
   * TODO:
   *   - id
   *   - attribute
   *
   * @param {CSS_Selector} query The query on the children.
   * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
   *
   * @public
   */
  querySelector(e) {
    e = e.toUpperCase();
    const r = new ns(this, (s) => s.nodeName && s.nodeName.toUpperCase() === e).next();
    return r.done ? null : r.value;
  }
  /**
   * Returns all YXmlElements that match the query.
   * Similar to Dom's {@link querySelectorAll}.
   *
   * @todo Does not yet support all queries. Currently only query by tagName.
   *
   * @param {CSS_Selector} query The query on the children
   * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
   *
   * @public
   */
  querySelectorAll(e) {
    return e = e.toUpperCase(), mt(new ns(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    jr(this, e, new Vh(this, t, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return sa(this, (e) => e.toString()).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, t = {}, r) {
    const s = e.createDocumentFragment();
    return r !== void 0 && r._createAssociation(s, this), Mn(this, (i) => {
      s.insertBefore(i.toDOM(e, t, r), null);
    }), s;
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insert(e, t) {
    this.doc !== null ? V(this.doc, (r) => {
      aa(r, this, e, t);
    }) : this._prelimContent.splice(e, 0, ...t);
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insertAfter(e, t) {
    if (this.doc !== null)
      V(this.doc, (r) => {
        const s = e && e instanceof ie ? e._item : e;
        dr(r, this, s, t);
      });
    else {
      const r = (
        /** @type {Array<any>} */
        this._prelimContent
      ), s = e === null ? 0 : r.findIndex((i) => i === e) + 1;
      if (s === 0 && e !== null)
        throw We("Reference item not found");
      r.splice(s, 0, ...t);
    }
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */
  delete(e, t = 1) {
    this.doc !== null ? V(this.doc, (r) => {
      ca(r, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return ra(this);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
   */
  push(e) {
    this.insert(this.length, e);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
   */
  unshift(e) {
    this.insert(0, e);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {YXmlElement|YXmlText}
   */
  get(e) {
    return ia(this, e);
  }
  /**
   * Returns a portion of this YXmlFragment into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<YXmlElement|YXmlText>}
   */
  slice(e = 0, t = this.length) {
    return na(this, e, t);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Mn(this, e);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(eu);
  }
}
const Mh = (n) => new Ot();
class rn extends Ot {
  constructor(e = "UNDEFINED") {
    super(), this.nodeName = e, this._prelimAttrs = /* @__PURE__ */ new Map();
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t), /** @type {Map<string, any>} */
    this._prelimAttrs.forEach((r, s) => {
      this.setAttribute(s, r);
    }), this._prelimAttrs = null;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   *
   * @return {YXmlElement}
   */
  _copy() {
    return new rn(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new rn(this.nodeName), t = this.getAttributes();
    return jc(t, (r, s) => {
      e.setAttribute(
        s,
        /** @type {any} */
        r
      );
    }), e.insert(0, this.toArray().map((r) => r instanceof ie ? r.clone() : r)), e;
  }
  /**
   * Returns the XML serialization of this YXmlElement.
   * The attributes are ordered by attribute-name, so you can easily use this
   * method to compare YXmlElements
   *
   * @return {string} The string representation of this type.
   *
   * @public
   */
  toString() {
    const e = this.getAttributes(), t = [], r = [];
    for (const a in e)
      r.push(a);
    r.sort();
    const s = r.length;
    for (let a = 0; a < s; a++) {
      const c = r[a];
      t.push(c + '="' + e[c] + '"');
    }
    const i = this.nodeName.toLocaleLowerCase(), o = t.length > 0 ? " " + t.join(" ") : "";
    return `<${i}${o}>${super.toString()}</${i}>`;
  }
  /**
   * Removes an attribute from this YXmlElement.
   *
   * @param {string} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(e) {
    this.doc !== null ? V(this.doc, (t) => {
      fr(t, this, e);
    }) : this._prelimAttrs.delete(e);
  }
  /**
   * Sets or updates an attribute.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that is to be set.
   * @param {KV[KEY]} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(e, t) {
    this.doc !== null ? V(this.doc, (r) => {
      Qs(r, this, e, t);
    }) : this._prelimAttrs.set(e, t);
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {KV[KEY]|undefined} The queried attribute value.
   *
   * @public
   */
  getAttribute(e) {
    return (
      /** @type {any} */
      ei(this, e)
    );
  }
  /**
   * Returns whether an attribute exists
   *
   * @param {string} attributeName The attribute name to check for existence.
   * @return {boolean} whether the attribute exists.
   *
   * @public
   */
  hasAttribute(e) {
    return (
      /** @type {any} */
      ha(this, e)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @param {Snapshot} [snapshot]
   * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes(e) {
    return (
      /** @type {any} */
      e ? Sh(this, e) : la(this)
    );
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, t = {}, r) {
    const s = e.createElement(this.nodeName), i = this.getAttributes();
    for (const o in i) {
      const a = i[o];
      typeof a == "string" && s.setAttribute(o, a);
    }
    return Mn(this, (o) => {
      s.appendChild(o.toDOM(e, t, r));
    }), r !== void 0 && r._createAssociation(s, this), s;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(Qh), e.writeKey(this.nodeName);
  }
}
const Rh = (n) => new rn(n.readKey());
class Vh extends $r {
  /**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
  constructor(e, t, r) {
    super(e, r), this.childListChanged = !1, this.attributesChanged = /* @__PURE__ */ new Set(), t.forEach((s) => {
      s === null ? this.childListChanged = !0 : this.attributesChanged.add(s);
    });
  }
}
class gr extends D {
  /**
   * @param {string} hookName nodeName of the Dom Node.
   */
  constructor(e) {
    super(), this.hookName = e;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   */
  _copy() {
    return new gr(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const e = new gr(this.hookName);
    return this.forEach((t, r) => {
      e.set(r, t);
    }), e;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type
   * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, t = {}, r) {
    const s = t[this.hookName];
    let i;
    return s !== void 0 ? i = s.createDom(this) : i = document.createElement(this.hookName), i.setAttribute("data-yjs-hook", this.hookName), r !== void 0 && r._createAssociation(i, this), i;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(tu), e.writeKey(this.hookName);
  }
}
const $h = (n) => new gr(n.readKey());
class pr extends $ {
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  _copy() {
    return new pr();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const e = new pr();
    return e.applyDelta(this.toDelta()), e;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlText.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, t, r) {
    const s = e.createTextNode(this.toString());
    return r !== void 0 && r._createAssociation(s, this), s;
  }
  toString() {
    return this.toDelta().map((e) => {
      const t = [];
      for (const s in e.attributes) {
        const i = [];
        for (const o in e.attributes[s])
          i.push({ key: o, value: e.attributes[s][o] });
        i.sort((o, a) => o.key < a.key ? -1 : 1), t.push({ nodeName: s, attrs: i });
      }
      t.sort((s, i) => s.nodeName < i.nodeName ? -1 : 1);
      let r = "";
      for (let s = 0; s < t.length; s++) {
        const i = t[s];
        r += `<${i.nodeName}`;
        for (let o = 0; o < i.attrs.length; o++) {
          const a = i.attrs[o];
          r += ` ${a.key}="${a.value}"`;
        }
        r += ">";
      }
      r += e.insert;
      for (let s = t.length - 1; s >= 0; s--)
        r += `</${t[s].nodeName}>`;
      return r;
    }).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(nu);
  }
}
const Uh = (n) => new pr();
class ti {
  /**
   * @param {ID} id
   * @param {number} length
   */
  constructor(e, t) {
    this.id = e, this.length = t;
  }
  /**
   * @type {boolean}
   */
  get deleted() {
    throw Ve();
  }
  /**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} whether this merged with right
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */
  write(e, t, r) {
    throw Ve();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    throw Ve();
  }
}
const jh = 0;
class Ee extends ti {
  get deleted() {
    return !0;
  }
  delete() {
  }
  /**
   * @param {GC} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.constructor !== e.constructor ? !1 : (this.length += e.length, !0);
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    t > 0 && (this.id.clock += t, this.length -= t), qo(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(jh), e.writeLen(this.length - t);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    return null;
  }
}
class zn {
  /**
   * @param {Uint8Array} content
   */
  constructor(e) {
    this.content = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.content];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentBinary}
   */
  copy() {
    return new zn(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(e) {
    throw Ve();
  }
  /**
   * @param {ContentBinary} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeBuf(this.content);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 3;
  }
}
const Zh = (n) => new zn(n.readBuf());
class Rn {
  /**
   * @param {number} len
   */
  constructor(e) {
    this.len = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.len;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !1;
  }
  /**
   * @return {ContentDeleted}
   */
  copy() {
    return new Rn(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const t = new Rn(this.len - e);
    return this.len = e, t;
  }
  /**
   * @param {ContentDeleted} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.len += e.len, !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
    hr(e.deleteSet, t.id.client, t.id.clock, this.len), t.markDeleted();
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeLen(this.len - t);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 1;
  }
}
const Fh = (n) => new Rn(n.readLen()), pa = (n, e) => new gt({ guid: n, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class Pn {
  /**
   * @param {Doc} doc
   */
  constructor(e) {
    e._item && console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid."), this.doc = e;
    const t = {};
    this.opts = t, e.gc || (t.gc = !1), e.autoLoad && (t.autoLoad = !0), e.meta !== null && (t.meta = e.meta);
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.doc];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentDoc}
   */
  copy() {
    return new Pn(pa(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(e) {
    throw Ve();
  }
  /**
   * @param {ContentDoc} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
    this.doc._item = t, e.subdocsAdded.add(this.doc), this.doc.shouldLoad && e.subdocsLoaded.add(this.doc);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
    e.subdocsAdded.has(this.doc) ? e.subdocsAdded.delete(this.doc) : e.subdocsRemoved.add(this.doc);
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeString(this.doc.guid), e.writeAny(this.opts);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 9;
  }
}
const Kh = (n) => new Pn(pa(n.readString(), n.readAny()));
class Mt {
  /**
   * @param {Object} embed
   */
  constructor(e) {
    this.embed = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.embed];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentEmbed}
   */
  copy() {
    return new Mt(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(e) {
    throw Ve();
  }
  /**
   * @param {ContentEmbed} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeJSON(this.embed);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 5;
  }
}
const Bh = (n) => new Mt(n.readJSON());
class W {
  /**
   * @param {string} key
   * @param {Object} value
   */
  constructor(e, t) {
    this.key = e, this.value = t;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !1;
  }
  /**
   * @return {ContentFormat}
   */
  copy() {
    return new W(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(e) {
    throw Ve();
  }
  /**
   * @param {ContentFormat} _right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} _transaction
   * @param {Item} item
   */
  integrate(e, t) {
    const r = (
      /** @type {YText} */
      t.parent
    );
    r._searchMarker = null, r._hasFormatting = !0;
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeKey(this.key), e.writeJSON(this.value);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 6;
  }
}
const zh = (n) => new W(n.readKey(), n.readJSON());
class mr {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentJSON}
   */
  copy() {
    return new mr(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(e) {
    const t = new mr(this.arr.slice(e));
    return this.arr = this.arr.slice(0, e), t;
  }
  /**
   * @param {ContentJSON} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.arr = this.arr.concat(e.arr), !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    const r = this.arr.length;
    e.writeLen(r - t);
    for (let s = t; s < r; s++) {
      const i = this.arr[s];
      e.writeString(i === void 0 ? "undefined" : JSON.stringify(i));
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 2;
  }
}
const Ph = (n) => {
  const e = n.readLen(), t = [];
  for (let r = 0; r < e; r++) {
    const s = n.readString();
    s === "undefined" ? t.push(void 0) : t.push(JSON.parse(s));
  }
  return new mr(t);
}, Jh = or("node_env") === "development";
class Dt {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, Jh && go(e);
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentAny}
   */
  copy() {
    return new Dt(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const t = new Dt(this.arr.slice(e));
    return this.arr = this.arr.slice(0, e), t;
  }
  /**
   * @param {ContentAny} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.arr = this.arr.concat(e.arr), !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    const r = this.arr.length;
    e.writeLen(r - t);
    for (let s = t; s < r; s++) {
      const i = this.arr[s];
      e.writeAny(i);
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 8;
  }
}
const Wh = (n) => {
  const e = n.readLen(), t = [];
  for (let r = 0; r < e; r++)
    t.push(n.readAny());
  return new Dt(t);
};
class He {
  /**
   * @param {string} str
   */
  constructor(e) {
    this.str = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.str.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.str.split("");
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentString}
   */
  copy() {
    return new He(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(e) {
    const t = new He(this.str.slice(e));
    this.str = this.str.slice(0, e);
    const r = this.str.charCodeAt(e - 1);
    return r >= 55296 && r <= 56319 && (this.str = this.str.slice(0, e - 1) + "�", t.str = "�" + t.str.slice(1)), t;
  }
  /**
   * @param {ContentString} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.str += e.str, !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeString(t === 0 ? this.str : this.str.slice(t));
  }
  /**
   * @return {number}
   */
  getRef() {
    return 4;
  }
}
const Gh = (n) => new He(n.readString()), Hh = [
  Ch,
  Ah,
  Nh,
  Rh,
  Mh,
  $h,
  Uh
], qh = 0, Yh = 1, Xh = 2, Qh = 3, eu = 4, tu = 5, nu = 6;
class st {
  /**
   * @param {AbstractType<any>} type
   */
  constructor(e) {
    this.type = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.type];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentType}
   */
  copy() {
    return new st(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(e) {
    throw Ve();
  }
  /**
   * @param {ContentType} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, t) {
    this.type._integrate(e.doc, t);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
    let t = this.type._start;
    for (; t !== null; )
      t.deleted ? t.id.clock < (e.beforeState.get(t.id.client) || 0) && e._mergeStructs.push(t) : t.delete(e), t = t.right;
    this.type._map.forEach((r) => {
      r.deleted ? r.id.clock < (e.beforeState.get(r.id.client) || 0) && e._mergeStructs.push(r) : r.delete(e);
    }), e.changed.delete(this.type);
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
    let t = this.type._start;
    for (; t !== null; )
      t.gc(e, !0), t = t.right;
    this.type._start = null, this.type._map.forEach(
      /** @param {Item | null} item */
      (r) => {
        for (; r !== null; )
          r.gc(e, !0), r = r.left;
      }
    ), this.type._map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    this.type._write(e);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 7;
  }
}
const ru = (n) => new st(Hh[n.readTypeRef()](n)), yr = (n, e, t) => {
  const { client: r, clock: s } = e.id, i = new J(
    L(r, s + t),
    e,
    L(r, s + t - 1),
    e.right,
    e.rightOrigin,
    e.parent,
    e.parentSub,
    e.content.splice(t)
  );
  return e.deleted && i.markDeleted(), e.keep && (i.keep = !0), e.redone !== null && (i.redone = L(e.redone.client, e.redone.clock + t)), e.right = i, i.right !== null && (i.right.left = i), n._mergeStructs.push(i), i.parentSub !== null && i.right === null && i.parent._map.set(i.parentSub, i), e.length = t, i;
};
class J extends ti {
  /**
   * @param {ID} id
   * @param {Item | null} left
   * @param {ID | null} origin
   * @param {Item | null} right
   * @param {ID | null} rightOrigin
   * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
   * @param {string | null} parentSub
   * @param {AbstractContent} content
   */
  constructor(e, t, r, s, i, o, a, c) {
    super(e, c.getLength()), this.origin = r, this.left = t, this.right = s, this.rightOrigin = i, this.parent = o, this.parentSub = a, this.redone = null, this.content = c, this.info = this.content.isCountable() ? hi : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & Wr) > 0 !== e && (this.info ^= Wr);
  }
  get marker() {
    return (this.info & Wr) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & li) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= li);
  }
  get countable() {
    return (this.info & hi) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & Jr) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= Jr);
  }
  markDeleted() {
    this.info |= Jr;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= q(t, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= q(t, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === qt && this.id.client !== this.parent.client && this.parent.clock >= q(t, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = Ei(e, t, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = yt(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === Ee || this.right && this.right.constructor === Ee)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === J ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === J && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === qt) {
      const r = es(t, this.parent);
      r.constructor === Ee ? this.parent = null : this.parent = /** @type {ContentType} */
      r.content.type;
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    if (t > 0 && (this.id.clock += t, this.left = Ei(e, e.doc.store, L(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let r = this.left, s;
        if (r !== null)
          s = r.right;
        else if (this.parentSub !== null)
          for (s = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; s !== null && s.left !== null; )
            s = s.left;
        else
          s = /** @type {AbstractType<any>} */
          this.parent._start;
        const i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
        for (; s !== null && s !== this.right; ) {
          if (o.add(s), i.add(s), Hn(this.origin, s.origin)) {
            if (s.id.client < this.id.client)
              r = s, i.clear();
            else if (Hn(this.rightOrigin, s.rightOrigin))
              break;
          } else if (s.origin !== null && o.has(es(e.doc.store, s.origin)))
            i.has(es(e.doc.store, s.origin)) || (r = s, i.clear());
          else
            break;
          s = s.right;
        }
        this.left = r;
      }
      if (this.left !== null) {
        const r = this.left.right;
        this.right = r, this.left.right = this;
      } else {
        let r;
        if (this.parentSub !== null)
          for (r = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; r !== null && r.left !== null; )
            r = r.left;
        else
          r = /** @type {AbstractType<any>} */
          this.parent._start, this.parent._start = this;
        this.right = r;
      }
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), qo(e.doc.store, this), this.content.integrate(e, this), Ti(
        e,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      ), /** @type {AbstractType<any>} */
      (this.parent._item !== null && /** @type {AbstractType<any>} */
      this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
    } else
      new Ee(this.id, this.length).integrate(e, 0);
  }
  /**
   * Returns the next non-deleted item
   */
  get next() {
    let e = this.right;
    for (; e !== null && e.deleted; )
      e = e.right;
    return e;
  }
  /**
   * Returns the previous non-deleted item
   */
  get prev() {
    let e = this.left;
    for (; e !== null && e.deleted; )
      e = e.left;
    return e;
  }
  /**
   * Computes the last content address of this Item.
   */
  get lastId() {
    return this.length === 1 ? this.id : L(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(e) {
    if (this.constructor === e.constructor && Hn(e.origin, this.lastId) && this.right === e && Hn(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
      const t = (
        /** @type {AbstractType<any>} */
        this.parent._searchMarker
      );
      return t && t.forEach((r) => {
        r.p === e && (r.p = this, !this.deleted && this.countable && (r.index -= this.length));
      }), e.keep && (this.keep = !0), this.right = e.right, this.right !== null && (this.right.left = this), this.length += e.length, !0;
    }
    return !1;
  }
  /**
   * Mark this Item as deleted.
   *
   * @param {Transaction} transaction
   */
  delete(e) {
    if (!this.deleted) {
      const t = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), hr(e.deleteSet, this.id.client, this.id.clock, this.length), Ti(e, t, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, t) {
    if (!this.deleted)
      throw Te();
    this.content.gc(e), t ? ch(e, this, new Ee(this.id, this.length)) : this.content = new Rn(this.length);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   */
  write(e, t) {
    const r = t > 0 ? L(this.id.client, this.id.clock + t - 1) : this.origin, s = this.rightOrigin, i = this.parentSub, o = this.content.getRef() & Cr | (r === null ? 0 : xe) | // origin is defined
    (s === null ? 0 : tt) | // right origin is defined
    (i === null ? 0 : Cn);
    if (e.writeInfo(o), r !== null && e.writeLeftID(r), s !== null && e.writeRightID(s), r === null && s === null) {
      const a = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const l = oh(a);
          e.writeParentInfo(!0), e.writeString(l);
        } else
          e.writeParentInfo(!1), e.writeLeftID(c.id);
      } else a.constructor === String ? (e.writeParentInfo(!0), e.writeString(a)) : a.constructor === qt ? (e.writeParentInfo(!1), e.writeLeftID(a)) : Te();
      i !== null && e.writeString(i);
    }
    this.content.write(e, t);
  }
}
const ma = (n, e) => su[e & Cr](n), su = [
  () => {
    Te();
  },
  // GC is not ItemContent
  Fh,
  // 1
  Ph,
  // 2
  Zh,
  // 3
  Gh,
  // 4
  Bh,
  // 5
  zh,
  // 6
  ru,
  // 7
  Wh,
  // 8
  Kh,
  // 9
  () => {
    Te();
  }
  // 10 - Skip is not ItemContent
], iu = 10;
class Ae extends ti {
  get deleted() {
    return !0;
  }
  delete() {
  }
  /**
   * @param {Skip} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.constructor !== e.constructor ? !1 : (this.length += e.length, !0);
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    Te();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(iu), T(e.restEncoder, this.length - t);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    return null;
  }
}
const ya = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), wa = "__ $YJS$ __";
ya[wa] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
ya[wa] = !0;
var M;
(function(n) {
  n.assertEqual = (s) => {
  };
  function e(s) {
  }
  n.assertIs = e;
  function t(s) {
    throw new Error();
  }
  n.assertNever = t, n.arrayToEnum = (s) => {
    const i = {};
    for (const o of s)
      i[o] = o;
    return i;
  }, n.getValidEnumValues = (s) => {
    const i = n.objectKeys(s).filter((a) => typeof s[s[a]] != "number"), o = {};
    for (const a of i)
      o[a] = s[a];
    return n.objectValues(o);
  }, n.objectValues = (s) => n.objectKeys(s).map(function(i) {
    return s[i];
  }), n.objectKeys = typeof Object.keys == "function" ? (s) => Object.keys(s) : (s) => {
    const i = [];
    for (const o in s)
      Object.prototype.hasOwnProperty.call(s, o) && i.push(o);
    return i;
  }, n.find = (s, i) => {
    for (const o of s)
      if (i(o))
        return o;
  }, n.isInteger = typeof Number.isInteger == "function" ? (s) => Number.isInteger(s) : (s) => typeof s == "number" && Number.isFinite(s) && Math.floor(s) === s;
  function r(s, i = " | ") {
    return s.map((o) => typeof o == "string" ? `'${o}'` : o).join(i);
  }
  n.joinValues = r, n.jsonStringifyReplacer = (s, i) => typeof i == "bigint" ? i.toString() : i;
})(M || (M = {}));
var Mi;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Mi || (Mi = {}));
const v = M.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), ct = (n) => {
  switch (typeof n) {
    case "undefined":
      return v.undefined;
    case "string":
      return v.string;
    case "number":
      return Number.isNaN(n) ? v.nan : v.number;
    case "boolean":
      return v.boolean;
    case "function":
      return v.function;
    case "bigint":
      return v.bigint;
    case "symbol":
      return v.symbol;
    case "object":
      return Array.isArray(n) ? v.array : n === null ? v.null : n.then && typeof n.then == "function" && n.catch && typeof n.catch == "function" ? v.promise : typeof Map < "u" && n instanceof Map ? v.map : typeof Set < "u" && n instanceof Set ? v.set : typeof Date < "u" && n instanceof Date ? v.date : v.object;
    default:
      return v.unknown;
  }
}, y = M.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class nt extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (r) => {
      this.issues = [...this.issues, r];
    }, this.addIssues = (r = []) => {
      this.issues = [...this.issues, ...r];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(i) {
      return i.message;
    }, r = { _errors: [] }, s = (i) => {
      for (const o of i.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(s);
        else if (o.code === "invalid_return_type")
          s(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          s(o.argumentsError);
        else if (o.path.length === 0)
          r._errors.push(t(o));
        else {
          let a = r, c = 0;
          for (; c < o.path.length; ) {
            const l = o.path[c];
            c === o.path.length - 1 ? (a[l] = a[l] || { _errors: [] }, a[l]._errors.push(t(o))) : a[l] = a[l] || { _errors: [] }, a = a[l], c++;
          }
        }
    };
    return s(this), r;
  }
  static assert(e) {
    if (!(e instanceof nt))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, M.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const s of this.issues)
      if (s.path.length > 0) {
        const i = s.path[0];
        t[i] = t[i] || [], t[i].push(e(s));
      } else
        r.push(e(s));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
nt.create = (n) => new nt(n);
const ms = (n, e) => {
  let t;
  switch (n.code) {
    case y.invalid_type:
      n.received === v.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case y.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, M.jsonStringifyReplacer)}`;
      break;
    case y.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${M.joinValues(n.keys, ", ")}`;
      break;
    case y.invalid_union:
      t = "Invalid input";
      break;
    case y.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${M.joinValues(n.options)}`;
      break;
    case y.invalid_enum_value:
      t = `Invalid enum value. Expected ${M.joinValues(n.options)}, received '${n.received}'`;
      break;
    case y.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case y.invalid_return_type:
      t = "Invalid function return type";
      break;
    case y.invalid_date:
      t = "Invalid date";
      break;
    case y.invalid_string:
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : M.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
      break;
    case y.too_small:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "more than"} ${n.minimum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "over"} ${n.minimum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "bigint" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(n.minimum))}` : t = "Invalid input";
      break;
    case y.too_big:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "less than"} ${n.maximum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "under"} ${n.maximum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "bigint" ? t = `BigInt must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly" : n.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(n.maximum))}` : t = "Invalid input";
      break;
    case y.custom:
      t = "Invalid input";
      break;
    case y.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case y.not_multiple_of:
      t = `Number must be a multiple of ${n.multipleOf}`;
      break;
    case y.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, M.assertNever(n);
  }
  return { message: t };
};
let ou = ms;
function au() {
  return ou;
}
const cu = (n) => {
  const { data: e, path: t, errorMaps: r, issueData: s } = n, i = [...t, ...s.path || []], o = {
    ...s,
    path: i
  };
  if (s.message !== void 0)
    return {
      ...s,
      path: i,
      message: s.message
    };
  let a = "";
  const c = r.filter((l) => !!l).slice().reverse();
  for (const l of c)
    a = l(o, { data: e, defaultError: a }).message;
  return {
    ...s,
    path: i,
    message: a
  };
};
function _(n, e) {
  const t = au(), r = cu({
    issueData: e,
    data: n.data,
    path: n.path,
    errorMaps: [
      n.common.contextualErrorMap,
      // contextual error map is first priority
      n.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === ms ? void 0 : ms
      // then global default map
    ].filter((s) => !!s)
  });
  n.common.issues.push(r);
}
class Se {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const r = [];
    for (const s of t) {
      if (s.status === "aborted")
        return S;
      s.status === "dirty" && e.dirty(), r.push(s.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const s of t) {
      const i = await s.key, o = await s.value;
      r.push({
        key: i,
        value: o
      });
    }
    return Se.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const s of t) {
      const { key: i, value: o } = s;
      if (i.status === "aborted" || o.status === "aborted")
        return S;
      i.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof o.value < "u" || s.alwaysSet) && (r[i.value] = o.value);
    }
    return { status: e.value, value: r };
  }
}
const S = Object.freeze({
  status: "aborted"
}), vn = (n) => ({ status: "dirty", value: n }), Oe = (n) => ({ status: "valid", value: n }), Ri = (n) => n.status === "aborted", Vi = (n) => n.status === "dirty", sn = (n) => n.status === "valid", wr = (n) => typeof Promise < "u" && n instanceof Promise;
var k;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(k || (k = {}));
class wt {
  constructor(e, t, r, s) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const $i = (n, e) => {
  if (sn(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new nt(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function A(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: s } = n;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: s } : { errorMap: (o, a) => {
    const { message: c } = n;
    return o.code === "invalid_enum_value" ? { message: c ?? a.defaultError } : typeof a.data > "u" ? { message: c ?? r ?? a.defaultError } : o.code !== "invalid_type" ? { message: a.defaultError } : { message: c ?? t ?? a.defaultError };
  }, description: s };
}
class N {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return ct(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: ct(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Se(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: ct(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (wr(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const r = this.safeParse(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  safeParse(e, t) {
    const r = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ct(e)
    }, s = this._parseSync({ data: e, path: r.path, parent: r });
    return $i(r, s);
  }
  "~validate"(e) {
    var r, s;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ct(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return sn(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (s = (r = i == null ? void 0 : i.message) == null ? void 0 : r.toLowerCase()) != null && s.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => sn(i) ? {
      value: i.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const r = await this.safeParseAsync(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  async safeParseAsync(e, t) {
    const r = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ct(e)
    }, s = this._parse({ data: e, path: r.path, parent: r }), i = await (wr(s) ? s : Promise.resolve(s));
    return $i(r, i);
  }
  refine(e, t) {
    const r = (s) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(s) : t;
    return this._refinement((s, i) => {
      const o = e(s), a = () => i.addIssue({
        code: y.custom,
        ...r(s)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((c) => c ? !0 : (a(), !1)) : o ? !0 : (a(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, s) => e(r) ? !0 : (s.addIssue(typeof t == "function" ? t(r, s) : t), !1));
  }
  _refinement(e) {
    return new cn({
      schema: this,
      typeName: I.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (t) => this["~validate"](t)
    };
  }
  optional() {
    return pt.create(this, this._def);
  }
  nullable() {
    return ln.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ze.create(this);
  }
  promise() {
    return br.create(this, this._def);
  }
  or(e) {
    return vr.create([this, e], this._def);
  }
  and(e) {
    return kr.create(this, e, this._def);
  }
  transform(e) {
    return new cn({
      ...A(this._def),
      schema: this,
      typeName: I.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ws({
      ...A(this._def),
      innerType: this,
      defaultValue: t,
      typeName: I.ZodDefault
    });
  }
  brand() {
    return new Du({
      typeName: I.ZodBranded,
      type: this,
      ...A(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new _s({
      ...A(this._def),
      innerType: this,
      catchValue: t,
      typeName: I.ZodCatch
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return ni.create(this, e);
  }
  readonly() {
    return vs.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const lu = /^c[^\s-]{8,}$/i, hu = /^[0-9a-z]+$/, uu = /^[0-9A-HJKMNP-TV-Z]{26}$/i, du = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, fu = /^[a-z0-9_-]{21}$/i, gu = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, pu = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, mu = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, yu = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let rs;
const wu = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, _u = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, vu = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, ku = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, bu = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, xu = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, _a = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Su = new RegExp(`^${_a}$`);
function va(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Iu(n) {
  return new RegExp(`^${va(n)}$`);
}
function Cu(n) {
  let e = `${_a}T${va(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Eu(n, e) {
  return !!((e === "v4" || !e) && wu.test(n) || (e === "v6" || !e) && vu.test(n));
}
function Au(n, e) {
  if (!gu.test(n))
    return !1;
  try {
    const [t] = n.split(".");
    if (!t)
      return !1;
    const r = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), s = JSON.parse(atob(r));
    return !(typeof s != "object" || s === null || "typ" in s && (s == null ? void 0 : s.typ) !== "JWT" || !s.alg || e && s.alg !== e);
  } catch {
    return !1;
  }
}
function Tu(n, e) {
  return !!((e === "v4" || !e) && _u.test(n) || (e === "v6" || !e) && ku.test(n));
}
class St extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: v.string,
        received: i.parsedType
      }), S;
    }
    const r = new Se();
    let s;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (s = this._getOrReturnCtx(e, s), _(s, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (s = this._getOrReturnCtx(e, s), _(s, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "length") {
        const o = e.data.length > i.value, a = e.data.length < i.value;
        (o || a) && (s = this._getOrReturnCtx(e, s), o ? _(s, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : a && _(s, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), r.dirty());
      } else if (i.kind === "email")
        mu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "emoji")
        rs || (rs = new RegExp(yu, "u")), rs.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "uuid")
        du.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "nanoid")
        fu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid")
        lu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid2")
        hu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "ulid")
        uu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "ulid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          s = this._getOrReturnCtx(e, s), _(s, {
            validation: "url",
            code: y.invalid_string,
            message: i.message
          }), r.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "regex",
        code: y.invalid_string,
        message: i.message
      }), r.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), r.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "datetime" ? Cu(i).test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), r.dirty()) : i.kind === "date" ? Su.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), r.dirty()) : i.kind === "time" ? Iu(i).test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), r.dirty()) : i.kind === "duration" ? pu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "ip" ? Eu(e.data, i.version) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "jwt" ? Au(e.data, i.alg) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "cidr" ? Tu(e.data, i.version) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64" ? bu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64url" ? xu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "base64url",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : M.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((s) => e.test(s), {
      validation: t,
      code: y.invalid_string,
      ...k.errToObj(r)
    });
  }
  _addCheck(e) {
    return new St({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...k.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...k.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...k.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...k.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...k.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...k.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...k.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...k.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...k.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...k.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...k.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...k.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...k.errToObj(e) });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (e == null ? void 0 : e.offset) ?? !1,
      local: (e == null ? void 0 : e.local) ?? !1,
      ...k.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...k.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...k.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...k.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...k.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...k.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...k.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...k.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...k.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...k.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, k.errToObj(e));
  }
  trim() {
    return new St({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new St({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new St({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
St.create = (n) => new St({
  checks: [],
  typeName: I.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
function Ou(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = t > r ? t : r, i = Number.parseInt(n.toFixed(s).replace(".", "")), o = Number.parseInt(e.toFixed(s).replace(".", ""));
  return i % o / 10 ** s;
}
class on extends N {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== v.number) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: v.number,
        received: i.parsedType
      }), S;
    }
    let r;
    const s = new Se();
    for (const i of this._def.checks)
      i.kind === "int" ? M.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), s.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? Ou(e.data, i.value) !== 0 && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.not_finite,
        message: i.message
      }), s.dirty()) : M.assertNever(i);
    return { status: s.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, k.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, k.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, k.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, k.toString(t));
  }
  setLimit(e, t, r, s) {
    return new on({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: k.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new on({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: k.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: k.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: k.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: k.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: k.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: k.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: k.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: k.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: k.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && M.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const r of this._def.checks) {
      if (r.kind === "finite" || r.kind === "int" || r.kind === "multipleOf")
        return !0;
      r.kind === "min" ? (t === null || r.value > t) && (t = r.value) : r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
on.create = (n) => new on({
  checks: [],
  typeName: I.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class Vn extends N {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== v.bigint)
      return this._getInvalidInput(e);
    let r;
    const s = new Se();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : M.assertNever(i);
    return { status: s.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return _(t, {
      code: y.invalid_type,
      expected: v.bigint,
      received: t.parsedType
    }), S;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, k.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, k.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, k.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, k.toString(t));
  }
  setLimit(e, t, r, s) {
    return new Vn({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: k.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Vn({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: k.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: k.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: k.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: k.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: k.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
Vn.create = (n) => new Vn({
  checks: [],
  typeName: I.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
class Ui extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.boolean,
        received: r.parsedType
      }), S;
    }
    return Oe(e.data);
  }
}
Ui.create = (n) => new Ui({
  typeName: I.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class _r extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: v.date,
        received: i.parsedType
      }), S;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_date
      }), S;
    }
    const r = new Se();
    let s;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), r.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), r.dirty()) : M.assertNever(i);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new _r({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: k.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: k.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
_r.create = (n) => new _r({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: I.ZodDate,
  ...A(n)
});
class ji extends N {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.symbol,
        received: r.parsedType
      }), S;
    }
    return Oe(e.data);
  }
}
ji.create = (n) => new ji({
  typeName: I.ZodSymbol,
  ...A(n)
});
class Zi extends N {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.undefined,
        received: r.parsedType
      }), S;
    }
    return Oe(e.data);
  }
}
Zi.create = (n) => new Zi({
  typeName: I.ZodUndefined,
  ...A(n)
});
class Fi extends N {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.null,
        received: r.parsedType
      }), S;
    }
    return Oe(e.data);
  }
}
Fi.create = (n) => new Fi({
  typeName: I.ZodNull,
  ...A(n)
});
class Ki extends N {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Oe(e.data);
  }
}
Ki.create = (n) => new Ki({
  typeName: I.ZodAny,
  ...A(n)
});
class Bi extends N {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Oe(e.data);
  }
}
Bi.create = (n) => new Bi({
  typeName: I.ZodUnknown,
  ...A(n)
});
class _t extends N {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return _(t, {
      code: y.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), S;
  }
}
_t.create = (n) => new _t({
  typeName: I.ZodNever,
  ...A(n)
});
class zi extends N {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.void,
        received: r.parsedType
      }), S;
    }
    return Oe(e.data);
  }
}
zi.create = (n) => new zi({
  typeName: I.ZodVoid,
  ...A(n)
});
class ze extends N {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), s = this._def;
    if (t.parsedType !== v.array)
      return _(t, {
        code: y.invalid_type,
        expected: v.array,
        received: t.parsedType
      }), S;
    if (s.exactLength !== null) {
      const o = t.data.length > s.exactLength.value, a = t.data.length < s.exactLength.value;
      (o || a) && (_(t, {
        code: o ? y.too_big : y.too_small,
        minimum: a ? s.exactLength.value : void 0,
        maximum: o ? s.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: s.exactLength.message
      }), r.dirty());
    }
    if (s.minLength !== null && t.data.length < s.minLength.value && (_(t, {
      code: y.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.minLength.message
    }), r.dirty()), s.maxLength !== null && t.data.length > s.maxLength.value && (_(t, {
      code: y.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, a) => s.type._parseAsync(new wt(t, o, t.path, a)))).then((o) => Se.mergeArray(r, o));
    const i = [...t.data].map((o, a) => s.type._parseSync(new wt(t, o, t.path, a)));
    return Se.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ze({
      ...this._def,
      minLength: { value: e, message: k.toString(t) }
    });
  }
  max(e, t) {
    return new ze({
      ...this._def,
      maxLength: { value: e, message: k.toString(t) }
    });
  }
  length(e, t) {
    return new ze({
      ...this._def,
      exactLength: { value: e, message: k.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ze.create = (n, e) => new ze({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: I.ZodArray,
  ...A(e)
});
function Ft(n) {
  if (n instanceof P) {
    const e = {};
    for (const t in n.shape) {
      const r = n.shape[t];
      e[t] = pt.create(Ft(r));
    }
    return new P({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof ze ? new ze({
    ...n._def,
    type: Ft(n.element)
  }) : n instanceof pt ? pt.create(Ft(n.unwrap())) : n instanceof ln ? ln.create(Ft(n.unwrap())) : n instanceof Lt ? Lt.create(n.items.map((e) => Ft(e))) : n;
}
class P extends N {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = M.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== v.object) {
      const l = this._getOrReturnCtx(e);
      return _(l, {
        code: y.invalid_type,
        expected: v.object,
        received: l.parsedType
      }), S;
    }
    const { status: r, ctx: s } = this._processInputParams(e), { shape: i, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof _t && this._def.unknownKeys === "strip"))
      for (const l in s.data)
        o.includes(l) || a.push(l);
    const c = [];
    for (const l of o) {
      const h = i[l], u = s.data[l];
      c.push({
        key: { status: "valid", value: l },
        value: h._parse(new wt(s, u, s.path, l)),
        alwaysSet: l in s.data
      });
    }
    if (this._def.catchall instanceof _t) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const h of a)
          c.push({
            key: { status: "valid", value: h },
            value: { status: "valid", value: s.data[h] }
          });
      else if (l === "strict")
        a.length > 0 && (_(s, {
          code: y.unrecognized_keys,
          keys: a
        }), r.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const h of a) {
        const u = s.data[h];
        c.push({
          key: { status: "valid", value: h },
          value: l._parse(
            new wt(s, u, s.path, h)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: h in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const h of c) {
        const u = await h.key, f = await h.value;
        l.push({
          key: u,
          value: f,
          alwaysSet: h.alwaysSet
        });
      }
      return l;
    }).then((l) => Se.mergeObjectSync(r, l)) : Se.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return k.errToObj, new P({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var i, o;
          const s = ((o = (i = this._def).errorMap) == null ? void 0 : o.call(i, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: k.errToObj(e).message ?? s
          } : {
            message: s
          };
        }
      } : {}
    });
  }
  strip() {
    return new P({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new P({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new P({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new P({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: I.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new P({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of M.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of M.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Ft(this);
  }
  partial(e) {
    const t = {};
    for (const r of M.objectKeys(this.shape)) {
      const s = this.shape[r];
      e && !e[r] ? t[r] = s : t[r] = s.optional();
    }
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of M.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let i = this.shape[r];
        for (; i instanceof pt; )
          i = i._def.innerType;
        t[r] = i;
      }
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return ka(M.objectKeys(this.shape));
  }
}
P.create = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strip",
  catchall: _t.create(),
  typeName: I.ZodObject,
  ...A(e)
});
P.strictCreate = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strict",
  catchall: _t.create(),
  typeName: I.ZodObject,
  ...A(e)
});
P.lazycreate = (n, e) => new P({
  shape: n,
  unknownKeys: "strip",
  catchall: _t.create(),
  typeName: I.ZodObject,
  ...A(e)
});
class vr extends N {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function s(i) {
      for (const a of i)
        if (a.result.status === "valid")
          return a.result;
      for (const a of i)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((a) => new nt(a.ctx.common.issues));
      return _(t, {
        code: y.invalid_union,
        unionErrors: o
      }), S;
    }
    if (t.common.async)
      return Promise.all(r.map(async (i) => {
        const o = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await i._parseAsync({
            data: t.data,
            path: t.path,
            parent: o
          }),
          ctx: o
        };
      })).then(s);
    {
      let i;
      const o = [];
      for (const c of r) {
        const l = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, h = c._parseSync({
          data: t.data,
          path: t.path,
          parent: l
        });
        if (h.status === "valid")
          return h;
        h.status === "dirty" && !i && (i = { result: h, ctx: l }), l.common.issues.length && o.push(l.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const a = o.map((c) => new nt(c));
      return _(t, {
        code: y.invalid_union,
        unionErrors: a
      }), S;
    }
  }
  get options() {
    return this._def.options;
  }
}
vr.create = (n, e) => new vr({
  options: n,
  typeName: I.ZodUnion,
  ...A(e)
});
function ys(n, e) {
  const t = ct(n), r = ct(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === v.object && r === v.object) {
    const s = M.objectKeys(e), i = M.objectKeys(n).filter((a) => s.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of i) {
      const c = ys(n[a], e[a]);
      if (!c.valid)
        return { valid: !1 };
      o[a] = c.data;
    }
    return { valid: !0, data: o };
  } else if (t === v.array && r === v.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const s = [];
    for (let i = 0; i < n.length; i++) {
      const o = n[i], a = e[i], c = ys(o, a);
      if (!c.valid)
        return { valid: !1 };
      s.push(c.data);
    }
    return { valid: !0, data: s };
  } else return t === v.date && r === v.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class kr extends N {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = (i, o) => {
      if (Ri(i) || Ri(o))
        return S;
      const a = ys(i.value, o.value);
      return a.valid ? ((Vi(i) || Vi(o)) && t.dirty(), { status: t.value, value: a.data }) : (_(r, {
        code: y.invalid_intersection_types
      }), S);
    };
    return r.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      }),
      this._def.right._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      })
    ]).then(([i, o]) => s(i, o)) : s(this._def.left._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }), this._def.right._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }));
  }
}
kr.create = (n, e, t) => new kr({
  left: n,
  right: e,
  typeName: I.ZodIntersection,
  ...A(t)
});
class Lt extends N {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.array)
      return _(r, {
        code: y.invalid_type,
        expected: v.array,
        received: r.parsedType
      }), S;
    if (r.data.length < this._def.items.length)
      return _(r, {
        code: y.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), S;
    !this._def.rest && r.data.length > this._def.items.length && (_(r, {
      code: y.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...r.data].map((o, a) => {
      const c = this._def.items[a] || this._def.rest;
      return c ? c._parse(new wt(r, o, r.path, a)) : null;
    }).filter((o) => !!o);
    return r.common.async ? Promise.all(i).then((o) => Se.mergeArray(t, o)) : Se.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Lt({
      ...this._def,
      rest: e
    });
  }
}
Lt.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Lt({
    items: n,
    typeName: I.ZodTuple,
    rest: null,
    ...A(e)
  });
};
class Pi extends N {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.map)
      return _(r, {
        code: y.invalid_type,
        expected: v.map,
        received: r.parsedType
      }), S;
    const s = this._def.keyType, i = this._def.valueType, o = [...r.data.entries()].map(([a, c], l) => ({
      key: s._parse(new wt(r, a, r.path, [l, "key"])),
      value: i._parse(new wt(r, c, r.path, [l, "value"]))
    }));
    if (r.common.async) {
      const a = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of o) {
          const l = await c.key, h = await c.value;
          if (l.status === "aborted" || h.status === "aborted")
            return S;
          (l.status === "dirty" || h.status === "dirty") && t.dirty(), a.set(l.value, h.value);
        }
        return { status: t.value, value: a };
      });
    } else {
      const a = /* @__PURE__ */ new Map();
      for (const c of o) {
        const l = c.key, h = c.value;
        if (l.status === "aborted" || h.status === "aborted")
          return S;
        (l.status === "dirty" || h.status === "dirty") && t.dirty(), a.set(l.value, h.value);
      }
      return { status: t.value, value: a };
    }
  }
}
Pi.create = (n, e, t) => new Pi({
  valueType: e,
  keyType: n,
  typeName: I.ZodMap,
  ...A(t)
});
class $n extends N {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.set)
      return _(r, {
        code: y.invalid_type,
        expected: v.set,
        received: r.parsedType
      }), S;
    const s = this._def;
    s.minSize !== null && r.data.size < s.minSize.value && (_(r, {
      code: y.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.minSize.message
    }), t.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && (_(r, {
      code: y.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function o(c) {
      const l = /* @__PURE__ */ new Set();
      for (const h of c) {
        if (h.status === "aborted")
          return S;
        h.status === "dirty" && t.dirty(), l.add(h.value);
      }
      return { status: t.value, value: l };
    }
    const a = [...r.data.values()].map((c, l) => i._parse(new wt(r, c, r.path, l)));
    return r.common.async ? Promise.all(a).then((c) => o(c)) : o(a);
  }
  min(e, t) {
    return new $n({
      ...this._def,
      minSize: { value: e, message: k.toString(t) }
    });
  }
  max(e, t) {
    return new $n({
      ...this._def,
      maxSize: { value: e, message: k.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
$n.create = (n, e) => new $n({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: I.ZodSet,
  ...A(e)
});
class Ji extends N {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ji.create = (n, e) => new Ji({
  getter: n,
  typeName: I.ZodLazy,
  ...A(e)
});
class Wi extends N {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return _(t, {
        received: t.data,
        code: y.invalid_literal,
        expected: this._def.value
      }), S;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Wi.create = (n, e) => new Wi({
  value: n,
  typeName: I.ZodLiteral,
  ...A(e)
});
function ka(n, e) {
  return new an({
    values: n,
    typeName: I.ZodEnum,
    ...A(e)
  });
}
class an extends N {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return _(t, {
        expected: M.joinValues(r),
        received: t.parsedType,
        code: y.invalid_type
      }), S;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return _(t, {
        received: t.data,
        code: y.invalid_enum_value,
        options: r
      }), S;
    }
    return Oe(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e, t = this._def) {
    return an.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return an.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
an.create = ka;
class Gi extends N {
  _parse(e) {
    const t = M.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== v.string && r.parsedType !== v.number) {
      const s = M.objectValues(t);
      return _(r, {
        expected: M.joinValues(s),
        received: r.parsedType,
        code: y.invalid_type
      }), S;
    }
    if (this._cache || (this._cache = new Set(M.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const s = M.objectValues(t);
      return _(r, {
        received: r.data,
        code: y.invalid_enum_value,
        options: s
      }), S;
    }
    return Oe(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Gi.create = (n, e) => new Gi({
  values: n,
  typeName: I.ZodNativeEnum,
  ...A(e)
});
class br extends N {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== v.promise && t.common.async === !1)
      return _(t, {
        code: y.invalid_type,
        expected: v.promise,
        received: t.parsedType
      }), S;
    const r = t.parsedType === v.promise ? t.data : Promise.resolve(t.data);
    return Oe(r.then((s) => this._def.type.parseAsync(s, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
br.create = (n, e) => new br({
  type: n,
  typeName: I.ZodPromise,
  ...A(e)
});
class cn extends N {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === I.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = this._def.effect || null, i = {
      addIssue: (o) => {
        _(r, o), o.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), s.type === "preprocess") {
      const o = s.transform(r.data, i);
      if (r.common.async)
        return Promise.resolve(o).then(async (a) => {
          if (t.value === "aborted")
            return S;
          const c = await this._def.schema._parseAsync({
            data: a,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? S : c.status === "dirty" || t.value === "dirty" ? vn(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return S;
        const a = this._def.schema._parseSync({
          data: o,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? S : a.status === "dirty" || t.value === "dirty" ? vn(a.value) : a;
      }
    }
    if (s.type === "refinement") {
      const o = (a) => {
        const c = s.refinement(a, i);
        if (r.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return a;
      };
      if (r.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? S : (a.status === "dirty" && t.dirty(), o(a.value), { status: t.value, value: a.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((a) => a.status === "aborted" ? S : (a.status === "dirty" && t.dirty(), o(a.value).then(() => ({ status: t.value, value: a.value }))));
    }
    if (s.type === "transform")
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!sn(o))
          return S;
        const a = s.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => sn(o) ? Promise.resolve(s.transform(o.value, i)).then((a) => ({
          status: t.value,
          value: a
        })) : S);
    M.assertNever(s);
  }
}
cn.create = (n, e, t) => new cn({
  schema: n,
  typeName: I.ZodEffects,
  effect: e,
  ...A(t)
});
cn.createWithPreprocess = (n, e, t) => new cn({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: I.ZodEffects,
  ...A(t)
});
class pt extends N {
  _parse(e) {
    return this._getType(e) === v.undefined ? Oe(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
pt.create = (n, e) => new pt({
  innerType: n,
  typeName: I.ZodOptional,
  ...A(e)
});
class ln extends N {
  _parse(e) {
    return this._getType(e) === v.null ? Oe(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ln.create = (n, e) => new ln({
  innerType: n,
  typeName: I.ZodNullable,
  ...A(e)
});
class ws extends N {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === v.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ws.create = (n, e) => new ws({
  innerType: n,
  typeName: I.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...A(e)
});
class _s extends N {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, s = this._def.innerType._parse({
      data: r.data,
      path: r.path,
      parent: {
        ...r
      }
    });
    return wr(s) ? s.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new nt(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new nt(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
_s.create = (n, e) => new _s({
  innerType: n,
  typeName: I.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...A(e)
});
class Hi extends N {
  _parse(e) {
    if (this._getType(e) !== v.nan) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.nan,
        received: r.parsedType
      }), S;
    }
    return { status: "valid", value: e.data };
  }
}
Hi.create = (n) => new Hi({
  typeName: I.ZodNaN,
  ...A(n)
});
class Du extends N {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = t.data;
    return this._def.type._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class ni extends N {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return i.status === "aborted" ? S : i.status === "dirty" ? (t.dirty(), vn(i.value)) : this._def.out._parseAsync({
          data: i.value,
          path: r.path,
          parent: r
        });
      })();
    {
      const s = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return s.status === "aborted" ? S : s.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: s.value
      }) : this._def.out._parseSync({
        data: s.value,
        path: r.path,
        parent: r
      });
    }
  }
  static create(e, t) {
    return new ni({
      in: e,
      out: t,
      typeName: I.ZodPipeline
    });
  }
}
class vs extends N {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (s) => (sn(s) && (s.value = Object.freeze(s.value)), s);
    return wr(t) ? t.then((s) => r(s)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
vs.create = (n, e) => new vs({
  innerType: n,
  typeName: I.ZodReadonly,
  ...A(e)
});
var I;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(I || (I = {}));
const Lu = on.create;
_t.create;
ze.create;
vr.create;
kr.create;
Lt.create;
an.create;
br.create;
pt.create;
ln.create;
var se = Uint8Array, be = Uint16Array, ri = Int32Array, Zr = new se([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), Fr = new se([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), ks = new se([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), ba = function(n, e) {
  for (var t = new be(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << n[r - 1];
  for (var s = new ri(t[30]), r = 1; r < 30; ++r)
    for (var i = t[r]; i < t[r + 1]; ++i)
      s[i] = i - t[r] << 5 | r;
  return { b: t, r: s };
}, xa = ba(Zr, 2), Sa = xa.b, bs = xa.r;
Sa[28] = 258, bs[258] = 28;
var Ia = ba(Fr, 0), Nu = Ia.b, qi = Ia.r, xs = new be(32768);
for (var U = 0; U < 32768; ++U) {
  var ot = (U & 43690) >> 1 | (U & 21845) << 1;
  ot = (ot & 52428) >> 2 | (ot & 13107) << 2, ot = (ot & 61680) >> 4 | (ot & 3855) << 4, xs[U] = ((ot & 65280) >> 8 | (ot & 255) << 8) >> 1;
}
var Pe = (function(n, e, t) {
  for (var r = n.length, s = 0, i = new be(e); s < r; ++s)
    n[s] && ++i[n[s] - 1];
  var o = new be(e);
  for (s = 1; s < e; ++s)
    o[s] = o[s - 1] + i[s - 1] << 1;
  var a;
  if (t) {
    a = new be(1 << e);
    var c = 15 - e;
    for (s = 0; s < r; ++s)
      if (n[s])
        for (var l = s << 4 | n[s], h = e - n[s], u = o[n[s] - 1]++ << h, f = u | (1 << h) - 1; u <= f; ++u)
          a[xs[u] >> c] = l;
  } else
    for (a = new be(r), s = 0; s < r; ++s)
      n[s] && (a[s] = xs[o[n[s] - 1]++] >> 15 - n[s]);
  return a;
}), vt = new se(288);
for (var U = 0; U < 144; ++U)
  vt[U] = 8;
for (var U = 144; U < 256; ++U)
  vt[U] = 9;
for (var U = 256; U < 280; ++U)
  vt[U] = 7;
for (var U = 280; U < 288; ++U)
  vt[U] = 8;
var Un = new se(32);
for (var U = 0; U < 32; ++U)
  Un[U] = 5;
var Mu = /* @__PURE__ */ Pe(vt, 9, 0), Ru = /* @__PURE__ */ Pe(vt, 9, 1), Vu = /* @__PURE__ */ Pe(Un, 5, 0), $u = /* @__PURE__ */ Pe(Un, 5, 1), ss = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Ne = function(n, e, t) {
  var r = e / 8 | 0;
  return (n[r] | n[r + 1] << 8) >> (e & 7) & t;
}, is = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, si = function(n) {
  return (n + 7) / 8 | 0;
}, Ca = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new se(n.subarray(e, t));
}, Uu = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], Me = function(n, e, t) {
  var r = new Error(e || Uu[n]);
  if (r.code = n, Error.captureStackTrace && Error.captureStackTrace(r, Me), !t)
    throw r;
  return r;
}, ju = function(n, e, t, r) {
  var s = n.length, i = 0;
  if (!s || e.f && !e.l)
    return t || new se(0);
  var o = !t, a = o || e.i != 2, c = e.i;
  o && (t = new se(s * 3));
  var l = function(pn) {
    var mn = t.length;
    if (pn > mn) {
      var $t = new se(Math.max(mn * 2, pn));
      $t.set(t), t = $t;
    }
  }, h = e.f || 0, u = e.p || 0, f = e.b || 0, p = e.l, w = e.d, b = e.m, F = e.n, De = s * 8;
  do {
    if (!p) {
      h = Ne(n, u, 1);
      var ge = Ne(n, u + 1, 3);
      if (u += 3, ge)
        if (ge == 1)
          p = Ru, w = $u, b = 9, F = 5;
        else if (ge == 2) {
          var ue = Ne(n, u, 31) + 257, X = Ne(n, u + 10, 15) + 4, R = ue + Ne(n, u + 5, 31) + 1;
          u += 14;
          for (var C = new se(R), Q = new se(19), z = 0; z < X; ++z)
            Q[ks[z]] = Ne(n, u + z * 3, 7);
          u += X * 3;
          for (var ae = ss(Q), it = (1 << ae) - 1, pe = Pe(Q, ae, 1), z = 0; z < R; ) {
            var de = pe[Ne(n, u, it)];
            u += de & 15;
            var G = de >> 4;
            if (G < 16)
              C[z++] = G;
            else {
              var ee = 0, j = 0;
              for (G == 16 ? (j = 3 + Ne(n, u, 3), u += 2, ee = C[z - 1]) : G == 17 ? (j = 3 + Ne(n, u, 7), u += 3) : G == 18 && (j = 11 + Ne(n, u, 127), u += 7); j--; )
                C[z++] = ee;
            }
          }
          var fe = C.subarray(0, ue), te = C.subarray(ue);
          b = ss(fe), F = ss(te), p = Pe(fe, b, 1), w = Pe(te, F, 1);
        } else
          Me(1);
      else {
        var G = si(u) + 4, he = n[G - 4] | n[G - 3] << 8, oe = G + he;
        if (oe > s) {
          c && Me(0);
          break;
        }
        a && l(f + he), t.set(n.subarray(G, oe), f), e.b = f += he, e.p = u = oe * 8, e.f = h;
        continue;
      }
      if (u > De) {
        c && Me(0);
        break;
      }
    }
    a && l(f + 131072);
    for (var gn = (1 << b) - 1, Ie = (1 << F) - 1, qe = u; ; qe = u) {
      var ee = p[is(n, u) & gn], me = ee >> 4;
      if (u += ee & 15, u > De) {
        c && Me(0);
        break;
      }
      if (ee || Me(2), me < 256)
        t[f++] = me;
      else if (me == 256) {
        qe = u, p = null;
        break;
      } else {
        var ye = me - 254;
        if (me > 264) {
          var z = me - 257, Z = Zr[z];
          ye = Ne(n, u, (1 << Z) - 1) + Sa[z], u += Z;
        }
        var $e = w[is(n, u) & Ie], Rt = $e >> 4;
        $e || Me(3), u += $e & 15;
        var te = Nu[Rt];
        if (Rt > 3) {
          var Z = Fr[Rt];
          te += is(n, u) & (1 << Z) - 1, u += Z;
        }
        if (u > De) {
          c && Me(0);
          break;
        }
        a && l(f + 131072);
        var Vt = f + ye;
        if (f < te) {
          var Jn = i - te, Wn = Math.min(te, Vt);
          for (Jn + f < 0 && Me(3); f < Wn; ++f)
            t[f] = r[Jn + f];
        }
        for (; f < Vt; ++f)
          t[f] = t[f - te];
      }
    }
    e.l = p, e.p = qe, e.b = f, e.f = h, p && (h = 1, e.m = b, e.d = w, e.n = F);
  } while (!h);
  return f != t.length && o ? Ca(t, 0, f) : t.subarray(0, f);
}, Xe = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8;
}, yn = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8, n[r + 2] |= t >> 16;
}, os = function(n, e) {
  for (var t = [], r = 0; r < n.length; ++r)
    n[r] && t.push({ s: r, f: n[r] });
  var s = t.length, i = t.slice();
  if (!s)
    return { t: Aa, l: 0 };
  if (s == 1) {
    var o = new se(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(oe, ue) {
    return oe.f - ue.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], c = t[1], l = 0, h = 1, u = 2;
  for (t[0] = { s: -1, f: a.f + c.f, l: a, r: c }; h != s - 1; )
    a = t[t[l].f < t[u].f ? l++ : u++], c = t[l != h && t[l].f < t[u].f ? l++ : u++], t[h++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var f = i[0].s, r = 1; r < s; ++r)
    i[r].s > f && (f = i[r].s);
  var p = new be(f + 1), w = Ss(t[h - 1], p, 0);
  if (w > e) {
    var r = 0, b = 0, F = w - e, De = 1 << F;
    for (i.sort(function(ue, X) {
      return p[X.s] - p[ue.s] || ue.f - X.f;
    }); r < s; ++r) {
      var ge = i[r].s;
      if (p[ge] > e)
        b += De - (1 << w - p[ge]), p[ge] = e;
      else
        break;
    }
    for (b >>= F; b > 0; ) {
      var G = i[r].s;
      p[G] < e ? b -= 1 << e - p[G]++ - 1 : ++r;
    }
    for (; r >= 0 && b; --r) {
      var he = i[r].s;
      p[he] == e && (--p[he], ++b);
    }
    w = e;
  }
  return { t: new se(p), l: w };
}, Ss = function(n, e, t) {
  return n.s == -1 ? Math.max(Ss(n.l, e, t + 1), Ss(n.r, e, t + 1)) : e[n.s] = t;
}, Yi = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new be(++e), r = 0, s = n[0], i = 1, o = function(c) {
    t[r++] = c;
  }, a = 1; a <= e; ++a)
    if (n[a] == s && a != e)
      ++i;
    else {
      if (!s && i > 2) {
        for (; i > 138; i -= 138)
          o(32754);
        i > 2 && (o(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (o(s), --i; i > 6; i -= 6)
          o(8304);
        i > 2 && (o(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        o(s);
      i = 1, s = n[a];
    }
  return { c: t.subarray(0, r), n: e };
}, wn = function(n, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += n[r] * e[r];
  return t;
}, Ea = function(n, e, t) {
  var r = t.length, s = si(e + 2);
  n[s] = r & 255, n[s + 1] = r >> 8, n[s + 2] = n[s] ^ 255, n[s + 3] = n[s + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    n[s + i + 4] = t[i];
  return (s + 4 + r) * 8;
}, Xi = function(n, e, t, r, s, i, o, a, c, l, h) {
  Xe(e, h++, t), ++s[256];
  for (var u = os(s, 15), f = u.t, p = u.l, w = os(i, 15), b = w.t, F = w.l, De = Yi(f), ge = De.c, G = De.n, he = Yi(b), oe = he.c, ue = he.n, X = new be(19), R = 0; R < ge.length; ++R)
    ++X[ge[R] & 31];
  for (var R = 0; R < oe.length; ++R)
    ++X[oe[R] & 31];
  for (var C = os(X, 7), Q = C.t, z = C.l, ae = 19; ae > 4 && !Q[ks[ae - 1]]; --ae)
    ;
  var it = l + 5 << 3, pe = wn(s, vt) + wn(i, Un) + o, de = wn(s, f) + wn(i, b) + o + 14 + 3 * ae + wn(X, Q) + 2 * X[16] + 3 * X[17] + 7 * X[18];
  if (c >= 0 && it <= pe && it <= de)
    return Ea(e, h, n.subarray(c, c + l));
  var ee, j, fe, te;
  if (Xe(e, h, 1 + (de < pe)), h += 2, de < pe) {
    ee = Pe(f, p, 0), j = f, fe = Pe(b, F, 0), te = b;
    var gn = Pe(Q, z, 0);
    Xe(e, h, G - 257), Xe(e, h + 5, ue - 1), Xe(e, h + 10, ae - 4), h += 14;
    for (var R = 0; R < ae; ++R)
      Xe(e, h + 3 * R, Q[ks[R]]);
    h += 3 * ae;
    for (var Ie = [ge, oe], qe = 0; qe < 2; ++qe)
      for (var me = Ie[qe], R = 0; R < me.length; ++R) {
        var ye = me[R] & 31;
        Xe(e, h, gn[ye]), h += Q[ye], ye > 15 && (Xe(e, h, me[R] >> 5 & 127), h += me[R] >> 12);
      }
  } else
    ee = Mu, j = vt, fe = Vu, te = Un;
  for (var R = 0; R < a; ++R) {
    var Z = r[R];
    if (Z > 255) {
      var ye = Z >> 18 & 31;
      yn(e, h, ee[ye + 257]), h += j[ye + 257], ye > 7 && (Xe(e, h, Z >> 23 & 31), h += Zr[ye]);
      var $e = Z & 31;
      yn(e, h, fe[$e]), h += te[$e], $e > 3 && (yn(e, h, Z >> 5 & 8191), h += Fr[$e]);
    } else
      yn(e, h, ee[Z]), h += j[Z];
  }
  return yn(e, h, ee[256]), h + j[256];
}, Zu = /* @__PURE__ */ new ri([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Aa = /* @__PURE__ */ new se(0), Fu = function(n, e, t, r, s, i) {
  var o = i.z || n.length, a = new se(r + o + 5 * (1 + Math.ceil(o / 7e3)) + s), c = a.subarray(r, a.length - s), l = i.l, h = (i.r || 0) & 7;
  if (e) {
    h && (c[0] = i.r >> 3);
    for (var u = Zu[e - 1], f = u >> 13, p = u & 8191, w = (1 << t) - 1, b = i.p || new be(32768), F = i.h || new be(w + 1), De = Math.ceil(t / 3), ge = 2 * De, G = function(Kr) {
      return (n[Kr] ^ n[Kr + 1] << De ^ n[Kr + 2] << ge) & w;
    }, he = new ri(25e3), oe = new be(288), ue = new be(32), X = 0, R = 0, C = i.i || 0, Q = 0, z = i.w || 0, ae = 0; C + 2 < o; ++C) {
      var it = G(C), pe = C & 32767, de = F[it];
      if (b[pe] = de, F[it] = pe, z <= C) {
        var ee = o - C;
        if ((X > 7e3 || Q > 24576) && (ee > 423 || !l)) {
          h = Xi(n, c, 0, he, oe, ue, R, Q, ae, C - ae, h), Q = X = R = 0, ae = C;
          for (var j = 0; j < 286; ++j)
            oe[j] = 0;
          for (var j = 0; j < 30; ++j)
            ue[j] = 0;
        }
        var fe = 2, te = 0, gn = p, Ie = pe - de & 32767;
        if (ee > 2 && it == G(C - Ie))
          for (var qe = Math.min(f, ee) - 1, me = Math.min(32767, C), ye = Math.min(258, ee); Ie <= me && --gn && pe != de; ) {
            if (n[C + fe] == n[C + fe - Ie]) {
              for (var Z = 0; Z < ye && n[C + Z] == n[C + Z - Ie]; ++Z)
                ;
              if (Z > fe) {
                if (fe = Z, te = Ie, Z > qe)
                  break;
                for (var $e = Math.min(Ie, Z - 2), Rt = 0, j = 0; j < $e; ++j) {
                  var Vt = C - Ie + j & 32767, Jn = b[Vt], Wn = Vt - Jn & 32767;
                  Wn > Rt && (Rt = Wn, de = Vt);
                }
              }
            }
            pe = de, de = b[pe], Ie += pe - de & 32767;
          }
        if (te) {
          he[Q++] = 268435456 | bs[fe] << 18 | qi[te];
          var pn = bs[fe] & 31, mn = qi[te] & 31;
          R += Zr[pn] + Fr[mn], ++oe[257 + pn], ++ue[mn], z = C + fe, ++X;
        } else
          he[Q++] = n[C], ++oe[n[C]];
      }
    }
    for (C = Math.max(C, z); C < o; ++C)
      he[Q++] = n[C], ++oe[n[C]];
    h = Xi(n, c, l, he, oe, ue, R, Q, ae, C - ae, h), l || (i.r = h & 7 | c[h / 8 | 0] << 3, h -= 7, i.h = F, i.p = b, i.i = C, i.w = z);
  } else {
    for (var C = i.w || 0; C < o + l; C += 65535) {
      var $t = C + 65535;
      $t >= o && (c[h / 8 | 0] = l, $t = o), h = Ea(c, h + 1, n.subarray(C, $t));
    }
    i.i = o;
  }
  return Ca(a, 0, r + si(h) + s);
}, Ku = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Bu = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, r = 0; r < e.length; ++r)
        t = Ku[t & 255 ^ e[r]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, zu = function(n, e, t, r, s) {
  if (!s && (s = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), o = new se(i.length + n.length);
    o.set(i), o.set(n, i.length), n = o, s.w = i.length;
  }
  return Fu(n, e.level == null ? 6 : e.level, e.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, r, s);
}, Is = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Pu = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Is(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      n[r + 10] = t.charCodeAt(r);
  }
}, Ju = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Me(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !n[t++])
    ;
  return t + (e & 2);
}, Wu = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, Gu = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Qi(n, e) {
  e || (e = {});
  var t = Bu(), r = n.length;
  t.p(n);
  var s = zu(n, e, Gu(e), 8), i = s.length;
  return Pu(s, e), Is(s, i - 8, t.d()), Is(s, i - 4, r), s;
}
function eo(n, e) {
  var t = Ju(n);
  return t + 8 > n.length && Me(6, "invalid gzip data"), ju(n.subarray(t, -8), { i: 2 }, new se(Wu(n)), e);
}
var Hu = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), qu = 0;
try {
  Hu.decode(Aa, { stream: !0 }), qu = 1;
} catch {
}
const Ta = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Jt(n, e, t) {
  const r = t[0];
  if (e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n.slice(-1) === r || e && e.slice(-1) === r)
    throw new Error("trailing zero");
  if (e) {
    let o = 0;
    for (; (n[o] || r) === e[o]; )
      o++;
    if (o > 0)
      return e.slice(0, o) + Jt(n.slice(o), e.slice(o), t);
  }
  const s = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - s > 1) {
    const o = Math.round(0.5 * (s + i));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[s] + Jt(n.slice(1), null, t);
}
function Oa(n) {
  if (n.length !== Da(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function Da(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function kn(n) {
  const e = Da(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function to(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = kn(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function no(n, e) {
  Oa(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let i = r.length - 1; s && i >= 0; i--) {
    const o = e.indexOf(r[i]) + 1;
    o === e.length ? r[i] = e[0] : (r[i] = e[o], s = !1);
  }
  if (s) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) + 1);
    return i > "a" ? r.push(e[0]) : r.pop(), i + r.join("");
  } else
    return t + r.join("");
}
function Yu(n, e) {
  Oa(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let i = r.length - 1; s && i >= 0; i--) {
    const o = e.indexOf(r[i]) - 1;
    o === -1 ? r[i] = e.slice(-1) : (r[i] = e[o], s = !1);
  }
  if (s) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) - 1);
    return i < "Z" ? r.push(e.slice(-1)) : r.pop(), i + r.join("");
  } else
    return t + r.join("");
}
function Qe(n, e, t = Ta) {
  if (n != null && to(n, t), e != null && to(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = kn(e), l = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Jt("", l, t);
    if (c < e)
      return c;
    const h = Yu(c, t);
    if (h == null)
      throw new Error("cannot decrement any more");
    return h;
  }
  if (e == null) {
    const c = kn(n), l = n.slice(c.length), h = no(c, t);
    return h ?? c + Jt(l, null, t);
  }
  const r = kn(n), s = n.slice(r.length), i = kn(e), o = e.slice(i.length);
  if (r === i)
    return r + Jt(s, o, t);
  const a = no(r, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : r + Jt(s, null, t);
}
function Cs(n, e, t, r = Ta) {
  if (t === 0)
    return [];
  if (t === 1)
    return [Qe(n, e, r)];
  {
    let s = Qe(n, e, r);
    const i = [s];
    for (let o = 0; o < t - 1; o++)
      s = Qe(s, e, r), i.push(s);
    return i;
  }
}
const Xu = Lu().int().nonnegative().optional();
function _n(n) {
  var t;
  const e = Xu.safeParse(n);
  if (!e.success)
    throw new re("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function La(n, e, t, r) {
  const s = n.Id, i = new D();
  i.set("Kind", n.Kind), i.set("outerItemId", e), i.set("OrderKey", t), i.set("Label", new $(n.Label ?? ""));
  const o = new D();
  for (const [a, c] of Object.entries(n.Info ?? {}))
    o.set(a, c);
  if (i.set("Info", o), n.Kind === "item") {
    const a = n, c = a.Type === jt ? "" : a.Type ?? "";
    switch (i.set("MIMEType", c), !0) {
      case (a.ValueKind === "literal" && a.Value !== void 0): {
        i.set("ValueKind", "literal"), i.set("literalValue", new $(a.Value));
        break;
      }
      case (a.ValueKind === "binary" && a.Value !== void 0): {
        i.set("ValueKind", "binary"), i.set("binaryValue", so(a.Value));
        break;
      }
      default:
        i.set("ValueKind", a.ValueKind ?? "none");
    }
    r.set(s, i);
    const l = Cs(null, null, (a.innerEntries ?? []).length);
    (a.innerEntries ?? []).forEach((h, u) => {
      La(h, s, l[u], r);
    });
  } else {
    const a = n;
    i.set("TargetId", a.TargetId ?? ""), r.set(s, i);
  }
}
var Ze, x, jn, Xt, et, It, ke, ht, ut, Fe, Ke, Sr, Ct, dt, Et, d, Kt, bn, at, rr, Es, Na, Ma, we, bt, Bt, xn, zt, Sn, Pt, Ra, As, Va, Ts, Os, O, $a, Ds, Ls, Ua;
const xt = class xt extends Fa {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  /**** constructor — initialise store from document and options ****/
  constructor(t, r) {
    var i;
    super();
    ne(this, d);
    /**** private state ****/
    ne(this, Ze);
    ne(this, x);
    ne(this, jn);
    ne(this, Xt);
    ne(this, et, null);
    ne(this, It, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    ne(this, ke, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId  (kept in sync with #ReverseIndex)
    ne(this, ht, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    ne(this, ut, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    ne(this, Fe, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    ne(this, Ke, /* @__PURE__ */ new Map());
    ne(this, Sr, Ka);
    // transaction nesting
    ne(this, Ct, 0);
    // ChangeSet accumulator inside a transaction
    ne(this, dt, {});
    // suppress index updates / change tracking when applying remote patches
    ne(this, Et, !1);
    Le(this, Ze, t), Le(this, x, t.getMap("Entries")), Le(this, jn, (r == null ? void 0 : r.LiteralSizeLimit) ?? Ba), Le(this, Xt, (r == null ? void 0 : r.TrashTTLms) ?? 2592e6), g(this, d, Na).call(this);
    const s = (r == null ? void 0 : r.TrashCheckIntervalMs) ?? Math.min(Math.floor(m(this, Xt) / 4), 36e5);
    Le(this, et, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      s
    )), typeof ((i = m(this, et)) == null ? void 0 : i.unref) == "function" && m(this, et).unref();
  }
  /**** fromScratch — build initial document with three well-known items ****/
  static fromScratch(t) {
    const r = new gt(), s = r.getMap("Entries");
    return r.transact(() => {
      const i = new D();
      i.set("Kind", "item"), i.set("outerItemId", ""), i.set("OrderKey", ""), i.set("Label", new $()), i.set("Info", new D()), i.set("MIMEType", ""), i.set("ValueKind", "none"), s.set(Ue, i);
      const o = new D();
      o.set("Kind", "item"), o.set("outerItemId", Ue), o.set("OrderKey", "a0"), o.set("Label", new $("trash")), o.set("Info", new D()), o.set("MIMEType", ""), o.set("ValueKind", "none"), s.set(K, o);
      const a = new D();
      a.set("Kind", "item"), a.set("outerItemId", Ue), a.set("OrderKey", "a1"), a.set("Label", new $("lost-and-found")), a.set("Info", new D()), a.set("MIMEType", ""), a.set("ValueKind", "none"), s.set(Ce, a);
    }), new xt(r, t);
  }
  /**** fromBinary — restore store from compressed update ****/
  static fromBinary(t, r) {
    const s = new gt();
    return xi(s, eo(t)), new xt(s, r);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, r) {
    const s = typeof t == "string" ? JSON.parse(t) : t, i = new gt(), o = i.getMap("Entries");
    return i.transact(() => {
      La(s, "", "", o);
    }), new xt(i, r);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — access system items ****/
  get RootItem() {
    return g(this, d, at).call(this, Ue);
  }
  get TrashItem() {
    return g(this, d, at).call(this, K);
  }
  get LostAndFoundItem() {
    return g(this, d, at).call(this, Ce);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve entry by Id ****/
  EntryWithId(t) {
    if (m(this, x).has(t))
      return g(this, d, bn).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, r, s) {
    if (r == null) throw new re("invalid-argument", "outerItem must not be missing");
    const i = t ?? jt;
    oi(i), _n(s), g(this, d, Kt).call(this, r.Id);
    const o = crypto.randomUUID(), a = g(this, d, zt).call(this, r.Id, s), c = i === jt ? "" : i;
    return this.transact(() => {
      const l = new D();
      l.set("Kind", "item"), l.set("outerItemId", r.Id), l.set("OrderKey", a), l.set("Label", new $()), l.set("Info", new D()), l.set("MIMEType", c), l.set("ValueKind", "none"), m(this, x).set(o, l), g(this, d, we).call(this, r.Id, o), g(this, d, O).call(this, r.Id, "innerEntryList"), g(this, d, O).call(this, o, "outerItem");
    }), g(this, d, at).call(this, o);
  }
  /**** newLinkAt — create link as inner link of outer data ****/
  newLinkAt(t, r, s) {
    if (t == null) throw new re("invalid-argument", "Target must not be missing");
    if (r == null) throw new re("invalid-argument", "outerItem must not be missing");
    _n(s), g(this, d, Kt).call(this, t.Id), g(this, d, Kt).call(this, r.Id);
    const i = crypto.randomUUID(), o = g(this, d, zt).call(this, r.Id, s);
    return this.transact(() => {
      const a = new D();
      a.set("Kind", "link"), a.set("outerItemId", r.Id), a.set("OrderKey", o), a.set("Label", new $()), a.set("Info", new D()), a.set("TargetId", t.Id), m(this, x).set(i, a), g(this, d, we).call(this, r.Id, i), g(this, d, Bt).call(this, t.Id, i), g(this, d, O).call(this, r.Id, "innerEntryList"), g(this, d, O).call(this, i, "outerItem");
    }), g(this, d, rr).call(this, i);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, r, s) {
    if (r == null) throw new re("invalid-argument", "outerItem must not be missing");
    _n(s), g(this, d, Kt).call(this, r.Id);
    const i = t;
    if (i == null || i.Kind !== "item")
      throw new re("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const o = /* @__PURE__ */ new Map();
    g(this, d, Ds).call(this, i, o);
    const a = g(this, d, zt).call(this, r.Id, s), c = o.get(i.Id);
    return this.transact(() => {
      g(this, d, Ls).call(this, i, r.Id, a, o), g(this, d, O).call(this, r.Id, "innerEntryList");
    }), g(this, d, at).call(this, c);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, r, s) {
    if (r == null) throw new re("invalid-argument", "outerItem must not be missing");
    _n(s), g(this, d, Kt).call(this, r.Id);
    const i = t;
    if (i == null || i.Kind !== "link")
      throw new re("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const o = crypto.randomUUID(), a = g(this, d, zt).call(this, r.Id, s);
    return this.transact(() => {
      const c = new D();
      c.set("Kind", "link"), c.set("outerItemId", r.Id), c.set("OrderKey", a), c.set("Label", new $(i.Label ?? ""));
      const l = new D();
      for (const [h, u] of Object.entries(i.Info ?? {}))
        l.set(h, u);
      c.set("Info", l), c.set("TargetId", i.TargetId ?? ""), m(this, x).set(o, c), g(this, d, we).call(this, r.Id, o), i.TargetId && g(this, d, Bt).call(this, i.TargetId, o), g(this, d, O).call(this, r.Id, "innerEntryList");
    }), g(this, d, rr).call(this, o);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** moveEntryTo — move entry to new outer data and position ****/
  moveEntryTo(t, r, s) {
    if (_n(s), !this._mayMoveEntryTo(t.Id, r.Id, s))
      throw new re(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const i = this._outerItemIdOf(t.Id), o = g(this, d, zt).call(this, r.Id, s);
    this.transact(() => {
      const a = m(this, x).get(t.Id);
      if (a.set("outerItemId", r.Id), a.set("OrderKey", o), i === K && r.Id !== K) {
        const c = a.get("Info");
        c instanceof D && c.has("_trashedAt") && (c.delete("_trashedAt"), g(this, d, O).call(this, t.Id, "Info._trashedAt"));
      }
      i != null && (g(this, d, bt).call(this, i, t.Id), g(this, d, O).call(this, i, "innerEntryList")), g(this, d, we).call(this, r.Id, t.Id), g(this, d, O).call(this, r.Id, "innerEntryList"), g(this, d, O).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const r = g(this, d, Pt).call(this, t);
    if (r.length === 0)
      return;
    const s = Cs(null, null, r.length);
    r.forEach((i, o) => {
      const a = m(this, x).get(i.Id);
      a != null && (a.set("OrderKey", s[o]), g(this, d, O).call(this, i.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new re("delete-not-permitted", "this entry cannot be deleted");
    const r = this._outerItemIdOf(t.Id), s = Qe(g(this, d, Sn).call(this, K), null);
    this.transact(() => {
      const i = m(this, x).get(t.Id);
      i.set("outerItemId", K), i.set("OrderKey", s);
      let o = i.get("Info");
      o instanceof D || (o = new D(), i.set("Info", o)), o.set("_trashedAt", Date.now()), r != null && (g(this, d, bt).call(this, r, t.Id), g(this, d, O).call(this, r, "innerEntryList")), g(this, d, we).call(this, K, t.Id), g(this, d, O).call(this, K, "innerEntryList"), g(this, d, O).call(this, t.Id, "outerItem"), g(this, d, O).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry and subtree ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== K)
      throw new re(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (g(this, d, Ra).call(this, t.Id))
      throw new re(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      g(this, d, Os).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — remove trash items past TTL ****/
  purgeExpiredTrashEntries(t) {
    const r = t ?? m(this, Xt);
    if (r == null)
      return 0;
    const s = Date.now(), i = Array.from(m(this, ke).get(K) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const a of i) {
      const c = m(this, x).get(a);
      if (c == null || c.get("outerItemId") !== K)
        continue;
      const l = c.get("Info"), h = l instanceof D ? l.get("_trashedAt") : void 0;
      if (typeof h == "number" && !(s - h < r))
        try {
          this.purgeEntry(g(this, d, bn).call(this, a)), o++;
        } catch {
        }
    }
    return o;
  }
  /**** dispose — stop background timer and remove all change listeners ****/
  dispose() {
    m(this, et) != null && (clearInterval(m(this, et)), Le(this, et, null)), m(this, It).clear();
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback in batched transaction ****/
  transact(t) {
    zr(this, Ct)._++;
    try {
      m(this, Ct) === 1 && !m(this, Et) ? m(this, Ze).transact(() => {
        t();
      }) : t();
    } finally {
      if (zr(this, Ct)._--, m(this, Ct) === 0) {
        const r = { ...m(this, dt) };
        Le(this, dt, {});
        const s = m(this, Et) ? "external" : "internal";
        g(this, d, $a).call(this, s, r);
      }
    }
  }
  /**** onChangeInvoke — subscribe to change events ****/
  onChangeInvoke(t) {
    return m(this, It).add(t), () => {
      m(this, It).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — apply remote changes and update indices ****/
  applyRemotePatch(t) {
    if (t.byteLength !== 0) {
      Le(this, Et, !0);
      try {
        xi(m(this, Ze), t), this.transact(() => {
          g(this, d, Ma).call(this);
        });
      } finally {
        Le(this, Et, !1);
      }
      this.recoverOrphans();
    }
  }
  /**** currentCursor — get state vector for sync ****/
  get currentCursor() {
    return sh(m(this, Ze));
  }
  /**** exportPatch — encode changes since cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? Qr(m(this, Ze)) : Qr(m(this, Ze), t);
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = new Set(m(this, x).keys());
    this.transact(() => {
      m(this, x).forEach((r, s) => {
        if (s === Ue)
          return;
        const i = r.get("outerItemId");
        if (i && !t.has(i)) {
          const o = Qe(g(this, d, Sn).call(this, Ce), null);
          r.set("outerItemId", Ce), r.set("OrderKey", o), g(this, d, we).call(this, Ce, s), g(this, d, O).call(this, s, "outerItem"), g(this, d, O).call(this, Ce, "innerEntryList");
        }
        if (r.get("Kind") === "link") {
          const o = r.get("TargetId");
          if (o && !t.has(o)) {
            const a = Qe(g(this, d, Sn).call(this, Ce), null), c = new D();
            c.set("Kind", "item"), c.set("outerItemId", Ce), c.set("OrderKey", a), c.set("Label", new $()), c.set("Info", new D()), c.set("MIMEType", ""), c.set("ValueKind", "none"), m(this, x).set(o, c), g(this, d, we).call(this, Ce, o), t.add(o), g(this, d, O).call(this, Ce, "innerEntryList");
          }
        }
      });
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  /**** asBinary — export compressed Y.js update ****/
  asBinary() {
    return Qi(Qr(m(this, Ze)));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, r, s) {
    const i = new TextDecoder().decode(eo(t));
    return this.newEntryFromJSONat(JSON.parse(i), r, s);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const r = JSON.stringify(this._EntryAsJSON(t));
    return Qi(new TextEncoder().encode(r));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind ****/
  _KindOf(t) {
    const r = m(this, x).get(t);
    if (r == null)
      throw new re("not-found", `entry '${t}' not found`);
    return r.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const r = m(this, x).get(t);
    if (r == null)
      return "";
    const s = r.get("Label");
    return s instanceof $ ? s.toString() : String(s ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, r) {
    Pa(r), this.transact(() => {
      const s = m(this, x).get(t);
      if (s == null)
        return;
      let i = s.get("Label");
      i instanceof $ ? (i.delete(0, i.length), r.length > 0 && i.insert(0, r)) : (i = new $(r), s.set("Label", i)), g(this, d, O).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get data MIME type ****/
  _TypeOf(t) {
    const r = m(this, x).get(t), s = (r == null ? void 0 : r.get("MIMEType")) ?? "";
    return s === "" ? jt : s;
  }
  /**** _setTypeOf — set data MIME type ****/
  _setTypeOf(t, r) {
    oi(r);
    const s = r === jt ? "" : r;
    this.transact(() => {
      var i;
      (i = m(this, x).get(t)) == null || i.set("MIMEType", s), g(this, d, O).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get data value kind ****/
  _ValueKindOf(t) {
    const r = m(this, x).get(t);
    return (r == null ? void 0 : r.get("ValueKind")) ?? "none";
  }
  /**** _readValueOf — get data value (literal or binary) ****/
  async _readValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "none":
        return;
      case r === "literal": {
        const s = m(this, x).get(t), i = s == null ? void 0 : s.get("literalValue");
        return i instanceof $ ? i.toString() : i ?? "";
      }
      case r === "binary": {
        const s = m(this, x).get(t);
        return s == null ? void 0 : s.get("binaryValue");
      }
      default: {
        const s = this._getValueRefOf(t);
        if (s == null)
          return;
        const i = await this._getValueBlobAsync(s.Hash);
        return i == null ? void 0 : r === "literal-reference" ? new TextDecoder().decode(i) : i;
      }
    }
  }
  /**** _writeValueOf — set data value ****/
  _writeValueOf(t, r) {
    this.transact(() => {
      const s = m(this, x).get(t);
      if (s != null) {
        switch (!0) {
          case r == null: {
            s.set("ValueKind", "none");
            break;
          }
          case (typeof r == "string" && r.length <= m(this, jn)): {
            s.set("ValueKind", "literal");
            let i = s.get("literalValue");
            i instanceof $ ? (i.delete(0, i.length), r.length > 0 && i.insert(0, r)) : (i = new $(r), s.set("literalValue", i));
            break;
          }
          case typeof r == "string": {
            const o = new TextEncoder().encode(r), a = xt._BLOBhash(o);
            this._storeValueBlob(a, o), s.set("ValueKind", "literal-reference"), s.set("ValueRef", { Hash: a, Size: o.byteLength });
            break;
          }
          case r.byteLength <= Ja: {
            s.set("ValueKind", "binary"), s.set("binaryValue", r);
            break;
          }
          default: {
            const i = r, o = xt._BLOBhash(i);
            this._storeValueBlob(o, i), s.set("ValueKind", "binary-reference"), s.set("ValueRef", { Hash: o, Size: i.byteLength });
            break;
          }
        }
        g(this, d, O).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value range ****/
  _spliceValueOf(t, r, s, i) {
    if (this._ValueKindOf(t) !== "literal")
      throw new re(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const o = m(this, x).get(t), a = o == null ? void 0 : o.get("literalValue");
      if (a instanceof $) {
        const c = s - r;
        c > 0 && a.delete(r, c), i.length > 0 && a.insert(r, i);
      }
      g(this, d, O).call(this, t, "Value");
    });
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const r = m(this, x).get(t);
    if (r == null)
      return;
    const s = this._ValueKindOf(t);
    if (!(s !== "literal-reference" && s !== "binary-reference"))
      return r.get("ValueRef");
  }
  /**** _InfoProxyOf — get info metadata proxy object ****/
  _InfoProxyOf(t) {
    const r = this;
    return new Proxy({}, {
      get(s, i) {
        if (typeof i != "string")
          return;
        const o = m(r, x).get(t), a = o == null ? void 0 : o.get("Info");
        return a instanceof D ? a.get(i) : void 0;
      },
      set(s, i, o) {
        return typeof i != "string" ? !1 : o === void 0 ? (r.transact(() => {
          var l;
          const a = m(r, x).get(t), c = a == null ? void 0 : a.get("Info");
          c instanceof D && c.has(i) && (c.delete(i), g(l = r, d, O).call(l, t, `Info.${i}`));
        }), !0) : (Wa(i), Ga(o), r.transact(() => {
          var l;
          const a = m(r, x).get(t);
          if (a == null)
            return;
          let c = a.get("Info");
          c instanceof D || (c = new D(), a.set("Info", c)), c.set(i, o), g(l = r, d, O).call(l, t, `Info.${i}`);
        }), !0);
      },
      deleteProperty(s, i) {
        return typeof i != "string" ? !1 : (r.transact(() => {
          var c;
          const o = m(r, x).get(t), a = o == null ? void 0 : o.get("Info");
          a instanceof D && a.has(i) && (a.delete(i), g(c = r, d, O).call(c, t, `Info.${i}`));
        }), !0);
      },
      ownKeys() {
        const s = m(r, x).get(t), i = s == null ? void 0 : s.get("Info");
        return i instanceof D ? Array.from(i.keys()) : [];
      },
      getOwnPropertyDescriptor(s, i) {
        if (typeof i != "string")
          return;
        const o = m(r, x).get(t), a = o == null ? void 0 : o.get("Info");
        if (!(a instanceof D))
          return;
        const c = a.get(i);
        return c !== void 0 ? { configurable: !0, enumerable: !0, value: c } : void 0;
      }
    });
  }
  /**** _outerItemIdOf — get outer item Id ****/
  _outerItemIdOf(t) {
    const r = m(this, x).get(t), s = r == null ? void 0 : r.get("outerItemId");
    return s != null && s !== "" ? s : void 0;
  }
  /**** _innerEntriesOf — get sorted children as array-like proxy ****/
  _innerEntriesOf(t) {
    const r = this, s = g(this, d, Pt).call(this, t);
    return new Proxy([], {
      get(i, o) {
        var a;
        if (o === "length")
          return s.length;
        if (o === Symbol.iterator)
          return function* () {
            var c;
            for (let l = 0; l < s.length; l++)
              yield g(c = r, d, bn).call(c, s[l].Id);
          };
        if (typeof o == "string" && !isNaN(Number(o))) {
          const c = Number(o);
          return c >= 0 && c < s.length ? g(a = r, d, bn).call(a, s[c].Id) : void 0;
        }
        return i[o];
      }
    });
  }
  /**** _mayMoveEntryTo — check move validity ****/
  _mayMoveEntryTo(t, r, s) {
    return t === Ue || t === r ? !1 : t === K || t === Ce ? r === Ue : !g(this, d, Ua).call(this, r, t);
  }
  /**** _mayDeleteEntry — check delete validity ****/
  _mayDeleteEntry(t) {
    return t !== Ue && t !== K && t !== Ce;
  }
  /**** _TargetOf — get link target data ****/
  _TargetOf(t) {
    const r = m(this, x).get(t), s = r == null ? void 0 : r.get("TargetId");
    if (s == null || s === "")
      throw new re("not-found", `link '${t}' has no target`);
    return g(this, d, at).call(this, s);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "literal": {
        const s = m(this, x).get(t), i = s == null ? void 0 : s.get("literalValue");
        return i instanceof $ ? i.toString() : i ?? "";
      }
      case r === "binary": {
        const s = m(this, x).get(t);
        return s == null ? void 0 : s.get("binaryValue");
      }
      default:
        return;
    }
  }
};
Ze = new WeakMap(), x = new WeakMap(), jn = new WeakMap(), Xt = new WeakMap(), et = new WeakMap(), It = new WeakMap(), ke = new WeakMap(), ht = new WeakMap(), ut = new WeakMap(), Fe = new WeakMap(), Ke = new WeakMap(), Sr = new WeakMap(), Ct = new WeakMap(), dt = new WeakMap(), Et = new WeakMap(), d = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #requireItemExists — throw if data does not exist ****/
Kt = function(t) {
  const r = m(this, x).get(t);
  if (r == null || r.get("Kind") !== "item")
    throw new re("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped — return cached wrapper objects ****/
bn = function(t) {
  const r = m(this, x).get(t);
  if (r == null)
    throw new re("invalid-argument", `entry '${t}' not found`);
  return r.get("Kind") === "item" ? g(this, d, at).call(this, t) : g(this, d, rr).call(this, t);
}, /**** #wrappedItem — return or create cached wrapper for data ****/
at = function(t) {
  const r = m(this, Ke).get(t);
  if (r instanceof ai)
    return r;
  const s = new ai(this, t);
  return g(this, d, Es).call(this, t, s), s;
}, /**** #wrappedLink — return or create cached wrapper for link ****/
rr = function(t) {
  const r = m(this, Ke).get(t);
  if (r instanceof ci)
    return r;
  const s = new ci(this, t);
  return g(this, d, Es).call(this, t, s), s;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
Es = function(t, r) {
  if (m(this, Ke).size >= m(this, Sr)) {
    const s = m(this, Ke).keys().next().value;
    s != null && m(this, Ke).delete(s);
  }
  m(this, Ke).set(t, r);
}, /**** #rebuildIndices — full rebuild used during construction ****/
Na = function() {
  m(this, ke).clear(), m(this, ht).clear(), m(this, ut).clear(), m(this, Fe).clear(), m(this, x).forEach((t, r) => {
    const s = t.get("outerItemId");
    if (s && g(this, d, we).call(this, s, r), t.get("Kind") === "link") {
      const i = t.get("TargetId");
      i && g(this, d, Bt).call(this, i, r);
    }
  });
}, /**** #updateIndicesFromView — incremental diff after remote patches ****/
Ma = function() {
  const t = /* @__PURE__ */ new Set();
  m(this, x).forEach((i, o) => {
    t.add(o);
    const a = i.get("outerItemId") || void 0, c = m(this, ht).get(o);
    switch (a !== c && (c != null && (g(this, d, bt).call(this, c, o), g(this, d, O).call(this, c, "innerEntryList")), a != null && (g(this, d, we).call(this, a, o), g(this, d, O).call(this, a, "innerEntryList")), g(this, d, O).call(this, o, "outerItem")), !0) {
      case i.get("Kind") === "link": {
        const l = i.get("TargetId"), h = m(this, Fe).get(o);
        l !== h && (h != null && g(this, d, xn).call(this, h, o), l != null && g(this, d, Bt).call(this, l, o));
        break;
      }
      case m(this, Fe).has(o):
        g(this, d, xn).call(this, m(this, Fe).get(o), o);
        break;
    }
    g(this, d, O).call(this, o, "Label");
  });
  const r = Array.from(m(this, ht).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of r)
    g(this, d, bt).call(this, o, i), g(this, d, O).call(this, o, "innerEntryList");
  const s = Array.from(m(this, Fe).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of s)
    g(this, d, xn).call(this, o, i);
}, /**** #addToReverseIndex — add entry to reverse index ****/
we = function(t, r) {
  let s = m(this, ke).get(t);
  s == null && (s = /* @__PURE__ */ new Set(), m(this, ke).set(t, s)), s.add(r), m(this, ht).set(r, t);
}, /**** #removeFromReverseIndex — remove entry from reverse index ****/
bt = function(t, r) {
  var s;
  (s = m(this, ke).get(t)) == null || s.delete(r), m(this, ht).delete(r);
}, /**** #addToLinkTargetIndex — add link to target index ****/
Bt = function(t, r) {
  let s = m(this, ut).get(t);
  s == null && (s = /* @__PURE__ */ new Set(), m(this, ut).set(t, s)), s.add(r), m(this, Fe).set(r, t);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
xn = function(t, r) {
  var s;
  (s = m(this, ut).get(t)) == null || s.delete(r), m(this, Fe).delete(r);
}, /**** #OrderKeyAt — generate fractional key at insertion position ****/
zt = function(t, r) {
  const s = (a) => {
    if (a.length === 0 || r == null) {
      const l = a.length > 0 ? a[a.length - 1].OrderKey : null;
      return Qe(l, null);
    }
    const c = Math.max(0, Math.min(r, a.length));
    return Qe(
      c > 0 ? a[c - 1].OrderKey : null,
      c < a.length ? a[c].OrderKey : null
    );
  };
  let i = g(this, d, Pt).call(this, t);
  const o = s(i);
  return o.length <= za ? o : (this._rebalanceInnerEntriesOf(t), s(g(this, d, Pt).call(this, t)));
}, /**** #lastOrderKeyOf — get last inner entry's order key ****/
Sn = function(t) {
  const r = g(this, d, Pt).call(this, t);
  return r.length > 0 ? r[r.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/
Pt = function(t) {
  const r = m(this, ke).get(t) ?? /* @__PURE__ */ new Set(), s = [];
  for (const i of r) {
    const o = m(this, x).get(i);
    (o == null ? void 0 : o.get("outerItemId")) === t && s.push({ Id: i, OrderKey: o.get("OrderKey") ?? "" });
  }
  return s.sort((i, o) => i.OrderKey < o.OrderKey ? -1 : i.OrderKey > o.OrderKey ? 1 : i.Id < o.Id ? -1 : i.Id > o.Id ? 1 : 0), s;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
Ra = function(t) {
  const r = g(this, d, Ts).call(this), s = /* @__PURE__ */ new Set();
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const o of m(this, ke).get(K) ?? /* @__PURE__ */ new Set())
      s.has(o) || g(this, d, As).call(this, o, r, s) && (s.add(o), i = !0);
  }
  return s.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has root-reachable links ****/
As = function(t, r, s) {
  const i = [t], o = /* @__PURE__ */ new Set();
  for (; i.length > 0; ) {
    const a = i.pop();
    if (o.has(a))
      continue;
    o.add(a);
    const c = m(this, ut).get(a) ?? /* @__PURE__ */ new Set();
    for (const l of c) {
      if (r.has(l))
        return !0;
      const h = g(this, d, Va).call(this, l);
      if (h != null && s.has(h))
        return !0;
    }
    for (const l of m(this, ke).get(a) ?? /* @__PURE__ */ new Set())
      o.has(l) || i.push(l);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
Va = function(t) {
  let r = t;
  for (; r != null; ) {
    const s = this._outerItemIdOf(r);
    if (s === K)
      return r;
    if (s === Ue || s == null)
      return null;
    r = s;
  }
  return null;
}, /**** #reachableFromRoot — compute live-tree entries reachable from root ****/
// TrashItem is included (it is a direct child of Root) but its subtree is
// NOT traversed — entries inside Trash are not considered "live" and must
// not protect other entries from being purged.
Ts = function() {
  const t = /* @__PURE__ */ new Set(), r = [Ue];
  for (; r.length > 0; ) {
    const s = r.pop();
    if (!t.has(s) && (t.add(s), s !== K))
      for (const i of m(this, ke).get(s) ?? /* @__PURE__ */ new Set())
        t.has(i) || r.push(i);
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Os = function(t) {
  const r = m(this, x).get(t);
  if (r == null)
    return;
  const s = r.get("Kind"), i = r.get("outerItemId"), o = g(this, d, Ts).call(this), a = /* @__PURE__ */ new Set(), c = Array.from(m(this, ke).get(t) ?? /* @__PURE__ */ new Set());
  for (const l of c)
    if (g(this, d, As).call(this, l, o, a)) {
      const h = m(this, x).get(l), u = Qe(g(this, d, Sn).call(this, K), null);
      h.set("outerItemId", K), h.set("OrderKey", u), g(this, d, bt).call(this, t, l), g(this, d, we).call(this, K, l), g(this, d, O).call(this, K, "innerEntryList"), g(this, d, O).call(this, l, "outerItem");
    } else
      g(this, d, Os).call(this, l);
  if (g(this, d, O).call(this, t, "Existence"), m(this, x).delete(t), i && (g(this, d, bt).call(this, i, t), g(this, d, O).call(this, i, "innerEntryList")), s === "link") {
    const l = r.get("TargetId");
    l && g(this, d, xn).call(this, l, t);
  }
  m(this, Ke).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
O = function(t, r) {
  m(this, dt)[t] == null && (m(this, dt)[t] = /* @__PURE__ */ new Set()), m(this, dt)[t].add(r);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
$a = function(t, r) {
  if (Object.keys(r).length !== 0)
    for (const s of m(this, It))
      try {
        s(t, r);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
Ds = function(t, r) {
  if (r.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const s of t.innerEntries ?? [])
      g(this, d, Ds).call(this, s, r);
}, /**** #importEntryFromJSON — recursively create a Y.js entry and update indices ****/
Ls = function(t, r, s, i) {
  const o = i.get(t.Id), a = new D();
  a.set("Kind", t.Kind), a.set("outerItemId", r), a.set("OrderKey", s), a.set("Label", new $(t.Label ?? ""));
  const c = new D();
  for (const [l, h] of Object.entries(t.Info ?? {}))
    c.set(l, h);
  if (a.set("Info", c), t.Kind === "item") {
    const l = t, h = l.Type === jt ? "" : l.Type ?? "";
    switch (a.set("MIMEType", h), !0) {
      case (l.ValueKind === "literal" && l.Value !== void 0): {
        a.set("ValueKind", "literal"), a.set("literalValue", new $(l.Value));
        break;
      }
      case (l.ValueKind === "binary" && l.Value !== void 0): {
        a.set("ValueKind", "binary"), a.set("binaryValue", so(l.Value));
        break;
      }
      default:
        a.set("ValueKind", l.ValueKind ?? "none");
    }
    m(this, x).set(o, a), g(this, d, we).call(this, r, o);
    const u = Cs(null, null, (l.innerEntries ?? []).length);
    (l.innerEntries ?? []).forEach((f, p) => {
      g(this, d, Ls).call(this, f, o, u[p], i);
    });
  } else {
    const l = t, h = i.has(l.TargetId) ? i.get(l.TargetId) : l.TargetId;
    a.set("TargetId", h ?? ""), m(this, x).set(o, a), g(this, d, we).call(this, r, o), h && g(this, d, Bt).call(this, h, o);
  }
}, /**** #isDescendantOf — check ancestor relationship ****/
Ua = function(t, r) {
  let s = t;
  for (; s != null; ) {
    if (s === r)
      return !0;
    s = this._outerItemIdOf(s);
  }
  return !1;
};
let ro = xt;
export {
  ro as SDS_DataStore,
  rd as SDS_Entry,
  sd as SDS_Error,
  id as SDS_Item,
  od as SDS_Link
};
