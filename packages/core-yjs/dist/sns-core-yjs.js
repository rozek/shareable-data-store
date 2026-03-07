var La = Object.defineProperty;
var ri = (n) => {
  throw TypeError(n);
};
var Ma = (n, e, t) => e in n ? La(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Wn = (n, e, t) => Ma(n, typeof e != "symbol" ? e + "" : e, t), Kr = (n, e, t) => e.has(n) || ri("Cannot " + t);
var m = (n, e, t) => (Kr(n, e, "read from private field"), t ? t.call(n) : e.get(n)), re = (n, e, t) => e.has(n) ? ri("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), Ne = (n, e, t, r) => (Kr(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), p = (n, e, t) => (Kr(n, e, "access private method"), t);
var zr = (n, e, t, r) => ({
  set _(s) {
    Ne(n, e, s, t);
  },
  get _() {
    return m(n, e, r);
  }
});
import { DefaultWrapperCacheSize as Ra, DefaultLiteralSizeLimit as $a, RootId as Le, TrashId as P, LostAndFoundId as Ce, DefaultMIMEType as Jn, SNS_Error as se, SNS_Note as si, SNS_Link as ii, DefaultBinarySizeLimit as Va } from "@rozek/sns-core";
import { SNS_Entry as qu, SNS_Error as Hu, SNS_Link as Yu, SNS_Note as Xu } from "@rozek/sns-core";
const $e = () => /* @__PURE__ */ new Map(), as = (n) => {
  const e = $e();
  return n.forEach((t, r) => {
    e.set(r, t);
  }), e;
}, vt = (n, e, t) => {
  let r = n.get(e);
  return r === void 0 && n.set(e, r = t()), r;
}, Ua = (n, e) => {
  const t = [];
  for (const [r, s] of n)
    t.push(e(s, r));
  return t;
}, ja = (n, e) => {
  for (const [t, r] of n)
    if (e(r, t))
      return !0;
  return !1;
}, Ht = () => /* @__PURE__ */ new Set(), Pr = (n) => n[n.length - 1], Za = (n, e) => {
  for (let t = 0; t < e.length; t++)
    n.push(e[t]);
}, pt = Array.from, Ds = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (!e(n[t], t, n))
      return !1;
  return !0;
}, eo = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (e(n[t], t, n))
      return !0;
  return !1;
}, Fa = (n, e) => {
  const t = new Array(n);
  for (let r = 0; r < n; r++)
    t[r] = e(r, t);
  return t;
}, Ir = Array.isArray;
class Ba {
  constructor() {
    this._observers = $e();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(e, t) {
    return vt(
      this._observers,
      /** @type {string} */
      e,
      Ht
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
    return pt((this._observers.get(e) || $e()).values()).forEach((r) => r(...t));
  }
  destroy() {
    this._observers = $e();
  }
}
const Je = Math.floor, Yn = Math.abs, to = (n, e) => n < e ? n : e, Dt = (n, e) => n > e ? n : e, no = (n) => n !== 0 ? n < 0 : 1 / n < 0, oi = 1, ai = 2, Wr = 4, Jr = 8, xn = 32, tt = 64, Se = 128, Cr = 31, cs = 63, It = 127, Ka = 2147483647, sr = Number.MAX_SAFE_INTEGER, ci = Number.MIN_SAFE_INTEGER, za = Number.isInteger || ((n) => typeof n == "number" && isFinite(n) && Je(n) === n), Pa = String.fromCharCode, Wa = (n) => n.toLowerCase(), Ja = /^\s*/g, Ga = (n) => n.replace(Ja, ""), qa = /([A-Z])/g, li = (n, e) => Ga(n.replace(qa, (t) => `${e}${Wa(t)}`)), Ha = (n) => {
  const e = unescape(encodeURIComponent(n)), t = e.length, r = new Uint8Array(t);
  for (let s = 0; s < t; s++)
    r[s] = /** @type {number} */
    e.codePointAt(s);
  return r;
}, In = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), Ya = (n) => In.encode(n), Xa = In ? Ya : Ha;
let bn = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
bn && bn.decode(new Uint8Array()).length === 1 && (bn = null);
const Qa = (n, e) => Fa(e, () => n).join("");
class Un {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const Er = () => new Un(), ec = (n) => {
  let e = n.cpos;
  for (let t = 0; t < n.bufs.length; t++)
    e += n.bufs[t].length;
  return e;
}, ze = (n) => {
  const e = new Uint8Array(ec(n));
  let t = 0;
  for (let r = 0; r < n.bufs.length; r++) {
    const s = n.bufs[r];
    e.set(s, t), t += s.length;
  }
  return e.set(new Uint8Array(n.cbuf.buffer, 0, n.cpos), t), e;
}, tc = (n, e) => {
  const t = n.cbuf.length;
  t - n.cpos < e && (n.bufs.push(new Uint8Array(n.cbuf.buffer, 0, n.cpos)), n.cbuf = new Uint8Array(Dt(t, e) * 2), n.cpos = 0);
}, H = (n, e) => {
  const t = n.cbuf.length;
  n.cpos === t && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(t * 2), n.cpos = 0), n.cbuf[n.cpos++] = e;
}, ls = H, T = (n, e) => {
  for (; e > It; )
    H(n, Se | It & e), e = Je(e / 128);
  H(n, It & e);
}, Ns = (n, e) => {
  const t = no(e);
  for (t && (e = -e), H(n, (e > cs ? Se : 0) | (t ? tt : 0) | cs & e), e = Je(e / 64); e > 0; )
    H(n, (e > It ? Se : 0) | It & e), e = Je(e / 128);
}, hs = new Uint8Array(3e4), nc = hs.length / 3, rc = (n, e) => {
  if (e.length < nc) {
    const t = In.encodeInto(e, hs).written || 0;
    T(n, t);
    for (let r = 0; r < t; r++)
      H(n, hs[r]);
  } else
    ve(n, Xa(e));
}, sc = (n, e) => {
  const t = unescape(encodeURIComponent(e)), r = t.length;
  T(n, r);
  for (let s = 0; s < r; s++)
    H(
      n,
      /** @type {number} */
      t.codePointAt(s)
    );
}, zt = In && /** @type {any} */
In.encodeInto ? rc : sc, Ar = (n, e) => {
  const t = n.cbuf.length, r = n.cpos, s = to(t - r, e.length), i = e.length - s;
  n.cbuf.set(e.subarray(0, s), r), n.cpos += s, i > 0 && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(Dt(t * 2, i)), n.cbuf.set(e.subarray(s)), n.cpos = i);
}, ve = (n, e) => {
  T(n, e.byteLength), Ar(n, e);
}, Ls = (n, e) => {
  tc(n, e);
  const t = new DataView(n.cbuf.buffer, n.cpos, e);
  return n.cpos += e, t;
}, ic = (n, e) => Ls(n, 4).setFloat32(0, e, !1), oc = (n, e) => Ls(n, 8).setFloat64(0, e, !1), ac = (n, e) => (
  /** @type {any} */
  Ls(n, 8).setBigInt64(0, e, !1)
), hi = new DataView(new ArrayBuffer(4)), cc = (n) => (hi.setFloat32(0, n), hi.getFloat32(0) === n), Cn = (n, e) => {
  switch (typeof e) {
    case "string":
      H(n, 119), zt(n, e);
      break;
    case "number":
      za(e) && Yn(e) <= Ka ? (H(n, 125), Ns(n, e)) : cc(e) ? (H(n, 124), ic(n, e)) : (H(n, 123), oc(n, e));
      break;
    case "bigint":
      H(n, 122), ac(n, e);
      break;
    case "object":
      if (e === null)
        H(n, 126);
      else if (Ir(e)) {
        H(n, 117), T(n, e.length);
        for (let t = 0; t < e.length; t++)
          Cn(n, e[t]);
      } else if (e instanceof Uint8Array)
        H(n, 116), ve(n, e);
      else {
        H(n, 118);
        const t = Object.keys(e);
        T(n, t.length);
        for (let r = 0; r < t.length; r++) {
          const s = t[r];
          zt(n, s), Cn(n, e[s]);
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
class ui extends Un {
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
const di = (n) => {
  n.count > 0 && (Ns(n.encoder, n.count === 1 ? n.s : -n.s), n.count > 1 && T(n.encoder, n.count - 2));
};
class Xn {
  constructor() {
    this.encoder = new Un(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (di(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return di(this), ze(this.encoder);
  }
}
const fi = (n) => {
  if (n.count > 0) {
    const e = n.diff * 2 + (n.count === 1 ? 0 : 1);
    Ns(n.encoder, e), n.count > 1 && T(n.encoder, n.count - 2);
  }
};
class Gr {
  constructor() {
    this.encoder = new Un(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (fi(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return fi(this), ze(this.encoder);
  }
}
class lc {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new Xn();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new Un();
    return this.sarr.push(this.s), this.s = "", zt(e, this.sarr.join("")), Ar(e, this.lensE.toUint8Array()), ze(e);
  }
}
const Ge = (n) => new Error(n), Ve = () => {
  throw Ge("Method unimplemented");
}, Oe = () => {
  throw Ge("Unexpected case");
}, ro = Ge("Unexpected end of array"), so = Ge("Integer out of Range");
class Tr {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const an = (n) => new Tr(n), hc = (n) => n.pos !== n.arr.length, uc = (n, e) => {
  const t = new Uint8Array(n.arr.buffer, n.pos + n.arr.byteOffset, e);
  return n.pos += e, t;
}, ke = (n) => uc(n, E(n)), Yt = (n) => n.arr[n.pos++], E = (n) => {
  let e = 0, t = 1;
  const r = n.arr.length;
  for (; n.pos < r; ) {
    const s = n.arr[n.pos++];
    if (e = e + (s & It) * t, t *= 128, s < Se)
      return e;
    if (e > sr)
      throw so;
  }
  throw ro;
}, Ms = (n) => {
  let e = n.arr[n.pos++], t = e & cs, r = 64;
  const s = (e & tt) > 0 ? -1 : 1;
  if ((e & Se) === 0)
    return s * t;
  const i = n.arr.length;
  for (; n.pos < i; ) {
    if (e = n.arr[n.pos++], t = t + (e & It) * r, r *= 128, e < Se)
      return s * t;
    if (t > sr)
      throw so;
  }
  throw ro;
}, dc = (n) => {
  let e = E(n);
  if (e === 0)
    return "";
  {
    let t = String.fromCodePoint(Yt(n));
    if (--e < 100)
      for (; e--; )
        t += String.fromCodePoint(Yt(n));
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
}, fc = (n) => (
  /** @type any */
  bn.decode(ke(n))
), Pt = bn ? fc : dc, Rs = (n, e) => {
  const t = new DataView(n.arr.buffer, n.arr.byteOffset + n.pos, e);
  return n.pos += e, t;
}, gc = (n) => Rs(n, 4).getFloat32(0, !1), pc = (n) => Rs(n, 8).getFloat64(0, !1), mc = (n) => (
  /** @type {any} */
  Rs(n, 8).getBigInt64(0, !1)
), yc = [
  (n) => {
  },
  // CASE 127: undefined
  (n) => null,
  // CASE 126: null
  Ms,
  // CASE 125: integer
  gc,
  // CASE 124: float32
  pc,
  // CASE 123: float64
  mc,
  // CASE 122: bigint
  (n) => !1,
  // CASE 121: boolean (false)
  (n) => !0,
  // CASE 120: boolean (true)
  Pt,
  // CASE 119: string
  (n) => {
    const e = E(n), t = {};
    for (let r = 0; r < e; r++) {
      const s = Pt(n);
      t[s] = En(n);
    }
    return t;
  },
  (n) => {
    const e = E(n), t = [];
    for (let r = 0; r < e; r++)
      t.push(En(n));
    return t;
  },
  ke
  // CASE 116: Uint8Array
], En = (n) => yc[127 - Yt(n)](n);
class gi extends Tr {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, t) {
    super(e), this.reader = t, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), hc(this) ? this.count = E(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class Qn extends Tr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = Ms(this);
      const e = no(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = E(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class qr extends Tr {
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
      const e = Ms(this), t = e & 1;
      this.diff = Je(e / 2), this.count = 1, t && (this.count = E(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class wc {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new Qn(e), this.str = Pt(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
    return this.spos = e, t;
  }
}
const _c = crypto.getRandomValues.bind(crypto), io = () => _c(new Uint32Array(1))[0], vc = "10000000-1000-4000-8000" + -1e11, kc = () => vc.replace(
  /[018]/g,
  /** @param {number} c */
  (n) => (n ^ io() & 15 >> n / 4).toString(16)
), pi = (n) => (
  /** @type {Promise<T>} */
  new Promise(n)
);
Promise.all.bind(Promise);
const mi = (n) => n === void 0 ? null : n;
class bc {
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
let oo = new bc(), Sc = !0;
try {
  typeof localStorage < "u" && localStorage && (oo = localStorage, Sc = !1);
} catch {
}
const xc = oo, An = Symbol("Equality"), ao = (n, e) => {
  var t;
  return n === e || !!((t = n == null ? void 0 : n[An]) != null && t.call(n, e)) || !1;
}, Ic = (n) => typeof n == "object", Cc = Object.assign, Ec = Object.keys, Ac = (n, e) => {
  for (const t in n)
    e(n[t], t);
}, ir = (n) => Ec(n).length, Tc = (n) => {
  for (const e in n)
    return !1;
  return !0;
}, jn = (n, e) => {
  for (const t in n)
    if (!e(n[t], t))
      return !1;
  return !0;
}, $s = (n, e) => Object.prototype.hasOwnProperty.call(n, e), Oc = (n, e) => n === e || ir(n) === ir(e) && jn(n, (t, r) => (t !== void 0 || $s(e, r)) && ao(e[r], t)), Dc = Object.freeze, co = (n) => {
  for (const e in n) {
    const t = n[e];
    (typeof t == "object" || typeof t == "function") && co(n[e]);
  }
  return Dc(n);
}, Vs = (n, e, t = 0) => {
  try {
    for (; t < n.length; t++)
      n[t](...e);
  } finally {
    t < n.length && Vs(n, e, t + 1);
  }
}, Nc = (n) => n, er = (n, e) => {
  if (n === e)
    return !0;
  if (n == null || e == null || n.constructor !== e.constructor && (n.constructor || Object) !== (e.constructor || Object))
    return !1;
  if (n[An] != null)
    return n[An](e);
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
        if (!e.has(t) || !er(n.get(t), e.get(t)))
          return !1;
      break;
    }
    case void 0:
    case Object:
      if (ir(n) !== ir(e))
        return !1;
      for (const t in n)
        if (!$s(n, t) || !er(n[t], e[t]))
          return !1;
      break;
    case Array:
      if (n.length !== e.length)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (!er(n[t], e[t]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, Lc = (n, e) => e.includes(n), Tn = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let je;
const Mc = () => {
  if (je === void 0)
    if (Tn) {
      je = $e();
      const n = process.argv;
      let e = null;
      for (let t = 0; t < n.length; t++) {
        const r = n[t];
        r[0] === "-" ? (e !== null && je.set(e, ""), e = r) : e !== null && (je.set(e, r), e = null);
      }
      e !== null && je.set(e, "");
    } else typeof location == "object" ? (je = $e(), (location.search || "?").slice(1).split("&").forEach((n) => {
      if (n.length !== 0) {
        const [e, t] = n.split("=");
        je.set(`--${li(e, "-")}`, t), je.set(`-${li(e, "-")}`, t);
      }
    })) : je = $e();
  return je;
}, us = (n) => Mc().has(n), or = (n) => mi(Tn ? process.env[n.toUpperCase().replaceAll("-", "_")] : xc.getItem(n)), lo = (n) => us("--" + n) || or(n) !== null, Rc = lo("production"), $c = Tn && Lc(process.env.FORCE_COLOR, ["true", "1", "2"]), Vc = $c || !us("--no-colors") && // @todo deprecate --no-colors
!lo("no-color") && (!Tn || process.stdout.isTTY) && (!Tn || us("--color") || or("COLORTERM") !== null || (or("TERM") || "").includes("color")), Uc = (n) => new Uint8Array(n), jc = (n) => {
  const e = Uc(n.byteLength);
  return e.set(n), e;
};
class Zc {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, t) {
    this.left = e, this.right = t;
  }
}
const Xe = (n, e) => new Zc(n, e), yi = (n) => n.next() >= 0.5, Hr = (n, e, t) => Je(n.next() * (t + 1 - e) + e), ho = (n, e, t) => Je(n.next() * (t + 1 - e) + e), Us = (n, e, t) => ho(n, e, t), Fc = (n) => Pa(Us(n, 97, 122)), Bc = (n, e = 0, t = 20) => {
  const r = Us(n, e, t);
  let s = "";
  for (let i = 0; i < r; i++)
    s += Fc(n);
  return s;
}, Yr = (n, e) => e[Us(n, 0, e.length - 1)], Kc = Symbol("0schema");
class zc {
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
      e.push(Qa(" ", (this._rerrs.length - t) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
    }
    return e.join(`
`);
  }
}
const ds = (n, e) => n === e ? !0 : n == null || e == null || n.constructor !== e.constructor ? !1 : n[An] ? ao(n, e) : Ir(n) ? Ds(
  n,
  (t) => eo(e, (r) => ds(t, r))
) : Ic(n) ? jn(
  n,
  (t, r) => ds(t, e[r])
) : !1;
class he {
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
    return this.constructor === e.constructor && er(this.shape, e.shape);
  }
  [Kc]() {
    return !0;
  }
  /**
   * @param {object} other
   */
  [An](e) {
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
    return cn(this, Mr);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new go(
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
    return wi(e, this), /** @type {any} */
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
    return wi(e, this), e;
  }
}
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
Wn(he, "_dilutes", !1);
class js extends he {
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
const K = (n, e = null) => new js(n, e);
K(js);
class Zs extends he {
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
const X = (n) => new Zs(n);
K(Zs);
class Or extends he {
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
const Dr = (...n) => new Or(n), uo = K(Or), Pc = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((n) => n.replace(/[().|&,$^[\]]/g, (e) => "\\" + e))
), fo = (n) => {
  if (Xt.check(n))
    return [Pc(n)];
  if (uo.check(n))
    return (
      /** @type {Array<string|number>} */
      n.shape.map((e) => e + "")
    );
  if (So.check(n))
    return ["[+-]?\\d+.?\\d*"];
  if (xo.check(n))
    return [".*"];
  if (cr.check(n))
    return n.shape.map(fo).flat(1);
  Oe();
};
class Wc extends he {
  /**
   * @param {T} shape
   */
  constructor(e) {
    super(), this.shape = e, this._r = new RegExp("^" + e.map(fo).map((t) => `(${t.join("|")})`).join("") + "$");
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
K(Wc);
const Jc = Symbol("optional");
class go extends he {
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
  get [Jc]() {
    return !0;
  }
}
const Gc = K(go);
class qc extends he {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(e, t) {
    return t == null || t.extend(null, "never", typeof e), !1;
  }
}
K(qc);
const Sr = class Sr extends he {
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
    return new Sr(this.shape, !0);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(e, t) {
    return e == null ? (t == null || t.extend(null, "object", "null"), !1) : jn(this.shape, (r, s) => {
      const i = this._isPartial && !$s(e, s) || r.check(e[s], t);
      return !i && (t == null || t.extend(s.toString(), r.toString(), typeof e[s], "Object property does not match")), i;
    });
  }
};
Wn(Sr, "_dilutes", !0);
let ar = Sr;
const Hc = (n) => (
  /** @type {any} */
  new ar(n)
), Yc = K(ar), Xc = X((n) => n != null && (n.constructor === Object || n.constructor == null));
class po extends he {
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
    return e != null && jn(e, (r, s) => {
      const i = this.shape.keys.check(s, t);
      return !i && (t == null || t.extend(s + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value")), i && this.shape.values.check(r, t);
    });
  }
}
const mo = (n, e) => new po(n, e), Qc = K(po);
class yo extends he {
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
    return e != null && jn(this.shape, (r, s) => {
      const i = (
        /** @type {Schema<any>} */
        r.check(e[s], t)
      );
      return !i && (t == null || t.extend(s.toString(), "Tuple", typeof r)), i;
    });
  }
}
const el = (...n) => new yo(n);
K(yo);
class wo extends he {
  /**
   * @param {Array<S>} v
   */
  constructor(e) {
    super(), this.shape = e.length === 1 ? e[0] : new Nr(e);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(e, t) {
    const r = Ir(e) && Ds(e, (s) => this.shape.check(s));
    return !r && (t == null || t.extend(null, "Array", "")), r;
  }
}
const _o = (...n) => new wo(n), tl = K(wo), nl = X((n) => Ir(n));
class vo extends he {
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
const rl = (n, e = null) => new vo(n, e);
K(vo);
const sl = rl(he);
class il extends he {
  /**
   * @param {Args} args
   */
  constructor(e) {
    super(), this.len = e.length - 1, this.args = el(...e.slice(-1)), this.res = e[this.len];
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
const ol = K(il), al = X((n) => typeof n == "function");
class cl extends he {
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
    const r = Ds(this.shape, (s) => s.check(e, t));
    return !r && (t == null || t.extend(null, "Intersectinon", typeof e)), r;
  }
}
K(cl, (n) => n.shape.length > 0);
class Nr extends he {
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
    const r = eo(this.shape, (s) => s.check(e, t));
    return t == null || t.extend(null, "Union", typeof e), r;
  }
}
Wn(Nr, "_dilutes", !0);
const cn = (...n) => n.findIndex((e) => cr.check(e)) >= 0 ? cn(...n.map((e) => On(e)).map((e) => cr.check(e) ? e.shape : [e]).flat(1)) : n.length === 1 ? n[0] : new Nr(n), cr = (
  /** @type {Schema<$Union<any>>} */
  K(Nr)
), ko = () => !0, lr = X(ko), ll = (
  /** @type {Schema<Schema<any>>} */
  K(Zs, (n) => n.shape === ko)
), Fs = X((n) => typeof n == "bigint"), hl = (
  /** @type {Schema<Schema<BigInt>>} */
  X((n) => n === Fs)
), bo = X((n) => typeof n == "symbol");
X((n) => n === bo);
const Wt = X((n) => typeof n == "number"), So = (
  /** @type {Schema<Schema<number>>} */
  X((n) => n === Wt)
), Xt = X((n) => typeof n == "string"), xo = (
  /** @type {Schema<Schema<string>>} */
  X((n) => n === Xt)
), Lr = X((n) => typeof n == "boolean"), ul = (
  /** @type {Schema<Schema<Boolean>>} */
  X((n) => n === Lr)
), Io = Dr(void 0);
K(Or, (n) => n.shape.length === 1 && n.shape[0] === void 0);
Dr(void 0);
const Mr = Dr(null), dl = (
  /** @type {Schema<Schema<null>>} */
  K(Or, (n) => n.shape.length === 1 && n.shape[0] === null)
);
K(Uint8Array);
K(js, (n) => n.shape === Uint8Array);
const fl = cn(Wt, Xt, Mr, Io, Fs, Lr, bo);
(() => {
  const n = (
    /** @type {$Array<$any>} */
    _o(lr)
  ), e = (
    /** @type {$Record<$string,$any>} */
    mo(Xt, lr)
  ), t = cn(Wt, Xt, Mr, Lr, n, e);
  return n.shape = t, e.shape.values = t, t;
})();
const On = (n) => {
  if (sl.check(n))
    return (
      /** @type {any} */
      n
    );
  if (Xc.check(n)) {
    const e = {};
    for (const t in n)
      e[t] = On(n[t]);
    return (
      /** @type {any} */
      Hc(e)
    );
  } else {
    if (nl.check(n))
      return (
        /** @type {any} */
        cn(...n.map(On))
      );
    if (fl.check(n))
      return (
        /** @type {any} */
        Dr(n)
      );
    if (al.check(n))
      return (
        /** @type {any} */
        K(
          /** @type {any} */
          n
        )
      );
  }
  Oe();
}, wi = Rc ? () => {
} : (n, e) => {
  const t = new zc();
  if (!e.check(n, t))
    throw Ge(`Expected value to be of type ${e.constructor.name}.
${t.toString()}`);
};
class gl {
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
    return this.patterns.push({ if: On(e), h: t }), this;
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
        throw Ge("Unhandled pattern");
      }
    );
  }
}
const pl = (n) => new gl(
  /** @type {any} */
  n
), Co = (
  /** @type {any} */
  pl(
    /** @type {Schema<prng.PRNG>} */
    lr
  ).if(So, (n, e) => Hr(e, ci, sr)).if(xo, (n, e) => Bc(e)).if(ul, (n, e) => yi(e)).if(hl, (n, e) => BigInt(Hr(e, ci, sr))).if(cr, (n, e) => $t(e, Yr(e, n.shape))).if(Yc, (n, e) => {
    const t = {};
    for (const r in n.shape) {
      let s = n.shape[r];
      if (Gc.check(s)) {
        if (yi(e))
          continue;
        s = s.shape;
      }
      t[r] = Co(s, e);
    }
    return t;
  }).if(tl, (n, e) => {
    const t = [], r = ho(e, 0, 42);
    for (let s = 0; s < r; s++)
      t.push($t(e, n.shape));
    return t;
  }).if(uo, (n, e) => Yr(e, n.shape)).if(dl, (n, e) => null).if(ol, (n, e) => {
    const t = $t(e, n.res);
    return () => t;
  }).if(ll, (n, e) => $t(e, Yr(e, [
    Wt,
    Xt,
    Mr,
    Io,
    Fs,
    Lr,
    _o(Wt),
    mo(cn("a", "b", "c"), Wt)
  ]))).if(Qc, (n, e) => {
    const t = {}, r = Hr(e, 0, 3);
    for (let s = 0; s < r; s++) {
      const i = $t(e, n.shape.keys), o = $t(e, n.shape.values);
      t[i] = o;
    }
    return t;
  }).done()
), $t = (n, e) => (
  /** @type {any} */
  Co(On(e), n)
), Rr = (
  /** @type {Document} */
  typeof document < "u" ? document : {}
);
X((n) => n.nodeType === vl);
typeof DOMParser < "u" && new DOMParser();
X((n) => n.nodeType === yl);
X((n) => n.nodeType === wl);
const ml = (n) => Ua(n, (e, t) => `${t}:${e};`).join(""), yl = Rr.ELEMENT_NODE, wl = Rr.TEXT_NODE, _l = Rr.DOCUMENT_NODE, vl = Rr.DOCUMENT_FRAGMENT_NODE;
X((n) => n.nodeType === _l);
const rt = Symbol, Eo = rt(), Ao = rt(), kl = rt(), bl = rt(), Sl = rt(), To = rt(), xl = rt(), Bs = rt(), Il = rt(), Cl = (n) => {
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
}, El = {
  [Eo]: Xe("font-weight", "bold"),
  [Ao]: Xe("font-weight", "normal"),
  [kl]: Xe("color", "blue"),
  [Sl]: Xe("color", "green"),
  [bl]: Xe("color", "grey"),
  [To]: Xe("color", "red"),
  [xl]: Xe("color", "purple"),
  [Bs]: Xe("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [Il]: Xe("color", "black")
}, Al = (n) => {
  var o;
  n.length === 1 && ((o = n[0]) == null ? void 0 : o.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [], r = $e();
  let s = [], i = 0;
  for (; i < n.length; i++) {
    const a = n[i], c = El[a];
    if (c !== void 0)
      r.set(c.left, c.right);
    else {
      if (a === void 0)
        break;
      if (a.constructor === String || a.constructor === Number) {
        const l = ml(r);
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
}, Oo = Vc ? Al : Cl, Tl = (...n) => {
  console.log(...Oo(n)), Do.forEach((e) => e.print(n));
}, Ol = (...n) => {
  console.warn(...Oo(n)), n.unshift(Bs), Do.forEach((e) => e.print(n));
}, Do = Ht(), No = (n) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: n
}), Dl = (n, e) => No(() => {
  let t;
  do
    t = n.next();
  while (!t.done && !e(t.value));
  return t;
}), Xr = (n, e) => No(() => {
  const { done: t, value: r } = n.next();
  return { done: t, value: t ? void 0 : e(r) };
});
class Ks {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, t) {
    this.clock = e, this.len = t;
  }
}
class Zn {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const Lo = (n, e, t) => e.clients.forEach((r, s) => {
  const i = (
    /** @type {Array<GC|Item>} */
    n.doc.store.clients.get(s)
  );
  if (i != null) {
    const o = i[i.length - 1], a = o.id.clock + o.length;
    for (let c = 0, l = r[c]; c < r.length && l.clock < a; l = r[++c])
      Wo(n, i, l.clock, l.len, t);
  }
}), Nl = (n, e) => {
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
}, Mo = (n, e) => {
  const t = n.clients.get(e.client);
  return t !== void 0 && Nl(t, e.clock) !== null;
}, zs = (n) => {
  n.clients.forEach((e) => {
    e.sort((s, i) => s.clock - i.clock);
    let t, r;
    for (t = 1, r = 1; t < e.length; t++) {
      const s = e[r - 1], i = e[t];
      s.clock + s.len >= i.clock ? s.len = Dt(s.len, i.clock + i.len - s.clock) : (r < t && (e[r] = i), r++);
    }
    e.length = r;
  });
}, Ll = (n) => {
  const e = new Zn();
  for (let t = 0; t < n.length; t++)
    n[t].clients.forEach((r, s) => {
      if (!e.clients.has(s)) {
        const i = r.slice();
        for (let o = t + 1; o < n.length; o++)
          Za(i, n[o].clients.get(s) || []);
        e.clients.set(s, i);
      }
    });
  return zs(e), e;
}, hr = (n, e, t, r) => {
  vt(n.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new Ks(t, r));
}, Ml = () => new Zn(), Rl = (n) => {
  const e = Ml();
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
        s.push(new Ks(a, c));
      }
    }
    s.length > 0 && e.clients.set(r, s);
  }), e;
}, ln = (n, e) => {
  T(n.restEncoder, e.clients.size), pt(e.clients.entries()).sort((t, r) => r[0] - t[0]).forEach(([t, r]) => {
    n.resetDsCurVal(), T(n.restEncoder, t);
    const s = r.length;
    T(n.restEncoder, s);
    for (let i = 0; i < s; i++) {
      const o = r[i];
      n.writeDsClock(o.clock), n.writeDsLen(o.len);
    }
  });
}, Ps = (n) => {
  const e = new Zn(), t = E(n.restDecoder);
  for (let r = 0; r < t; r++) {
    n.resetDsCurVal();
    const s = E(n.restDecoder), i = E(n.restDecoder);
    if (i > 0) {
      const o = vt(e.clients, s, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let a = 0; a < i; a++)
        o.push(new Ks(n.readDsClock(), n.readDsLen()));
    }
  }
  return e;
}, _i = (n, e, t) => {
  const r = new Zn(), s = E(n.restDecoder);
  for (let i = 0; i < s; i++) {
    n.resetDsCurVal();
    const o = E(n.restDecoder), a = E(n.restDecoder), c = t.clients.get(o) || [], l = Y(t, o);
    for (let h = 0; h < a; h++) {
      const u = n.readDsClock(), d = u + n.readDsLen();
      if (u < l) {
        l < d && hr(r, o, l, d - l);
        let g = qe(c, u), w = c[g];
        for (!w.deleted && w.id.clock < u && (c.splice(g + 1, 0, yr(e, w, u - w.id.clock)), g++); g < c.length && (w = c[g++], w.id.clock < d); )
          w.deleted || (d < w.id.clock + w.length && c.splice(g, 0, yr(e, w, d - w.id.clock)), w.delete(e));
      } else
        hr(r, o, u, d - u);
    }
  }
  if (r.clients.size > 0) {
    const i = new Et();
    return T(i.restEncoder, 0), ln(i, r), i.toUint8Array();
  }
  return null;
}, Ro = io;
class Ct extends Ba {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = kc(), collectionid: t = null, gc: r = !0, gcFilter: s = () => !0, meta: i = null, autoLoad: o = !1, shouldLoad: a = !0 } = {}) {
    super(), this.gc = r, this.gcFilter = s, this.clientID = Ro(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new zo(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = a, this.autoLoad = o, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = pi((l) => {
      this.on("load", () => {
        this.isLoaded = !0, l(this);
      });
    });
    const c = () => pi((l) => {
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
    return new Set(pt(this.subdocs).map((e) => e.guid));
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
    oe
  )) {
    const r = vt(this.share, e, () => {
      const i = new t();
      return i._integrate(this, null), i;
    }), s = r.constructor;
    if (t !== oe && s !== t)
      if (s === oe) {
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
      this.get(e, Gt)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(e = "") {
    return this.get(e, Z);
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
      this.get(e, en)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, At);
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
    this.isDestroyed = !0, pt(this.subdocs).forEach((t) => t.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const t = (
        /** @type {ContentDoc} */
        e.content
      );
      t.doc = new Ct({ guid: this.guid, ...t.opts, shouldLoad: !1 }), t.doc._item = e, V(
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
class $o {
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
class Vo extends $o {
  /**
   * @return {ID}
   */
  readLeftID() {
    return O(E(this.restDecoder), E(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return O(E(this.restDecoder), E(this.restDecoder));
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
    return Yt(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return Pt(this.restDecoder);
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
    return En(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return jc(ke(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(Pt(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return Pt(this.restDecoder);
  }
}
class $l {
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
class Qt extends $l {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], E(e), this.keyClockDecoder = new qr(ke(e)), this.clientDecoder = new Qn(ke(e)), this.leftClockDecoder = new qr(ke(e)), this.rightClockDecoder = new qr(ke(e)), this.infoDecoder = new gi(ke(e), Yt), this.stringDecoder = new wc(ke(e)), this.parentInfoDecoder = new gi(ke(e), Yt), this.typeRefDecoder = new Qn(ke(e)), this.lenDecoder = new Qn(ke(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new Jt(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new Jt(this.clientDecoder.read(), this.rightClockDecoder.read());
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
    return En(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return ke(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return En(this.restDecoder);
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
class Uo {
  constructor() {
    this.restEncoder = Er();
  }
  toUint8Array() {
    return ze(this.restEncoder);
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
class Fn extends Uo {
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
    zt(this.restEncoder, e);
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
    Cn(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    ve(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    zt(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    zt(this.restEncoder, e);
  }
}
class jo {
  constructor() {
    this.restEncoder = Er(), this.dsCurrVal = 0;
  }
  toUint8Array() {
    return ze(this.restEncoder);
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
    e === 0 && Oe(), T(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class Et extends jo {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new Gr(), this.clientEncoder = new Xn(), this.leftClockEncoder = new Gr(), this.rightClockEncoder = new Gr(), this.infoEncoder = new ui(ls), this.stringEncoder = new lc(), this.parentInfoEncoder = new ui(ls), this.typeRefEncoder = new Xn(), this.lenEncoder = new Xn();
  }
  toUint8Array() {
    const e = Er();
    return T(e, 0), ve(e, this.keyClockEncoder.toUint8Array()), ve(e, this.clientEncoder.toUint8Array()), ve(e, this.leftClockEncoder.toUint8Array()), ve(e, this.rightClockEncoder.toUint8Array()), ve(e, ze(this.infoEncoder)), ve(e, this.stringEncoder.toUint8Array()), ve(e, ze(this.parentInfoEncoder)), ve(e, this.typeRefEncoder.toUint8Array()), ve(e, this.lenEncoder.toUint8Array()), Ar(e, ze(this.restEncoder)), ze(e);
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
    Cn(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    ve(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    Cn(this.restEncoder, e);
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
const Vl = (n, e, t, r) => {
  r = Dt(r, e[0].id.clock);
  const s = qe(e, r);
  T(n.restEncoder, e.length - s), n.writeClient(t), T(n.restEncoder, r);
  const i = e[s];
  i.write(n, r - i.id.clock);
  for (let o = s + 1; o < e.length; o++)
    e[o].write(n, 0);
}, Ws = (n, e, t) => {
  const r = /* @__PURE__ */ new Map();
  t.forEach((s, i) => {
    Y(e, i) > s && r.set(i, s);
  }), $r(e).forEach((s, i) => {
    t.has(i) || r.set(i, 0);
  }), T(n.restEncoder, r.size), pt(r.entries()).sort((s, i) => i[0] - s[0]).forEach(([s, i]) => {
    Vl(
      n,
      /** @type {Array<GC|Item>} */
      e.clients.get(s),
      s,
      i
    );
  });
}, Ul = (n, e) => {
  const t = $e(), r = E(n.restDecoder);
  for (let s = 0; s < r; s++) {
    const i = E(n.restDecoder), o = new Array(i), a = n.readClient();
    let c = E(n.restDecoder);
    t.set(a, { i: 0, refs: o });
    for (let l = 0; l < i; l++) {
      const h = n.readInfo();
      switch (Cr & h) {
        case 0: {
          const u = n.readLen();
          o[l] = new Ae(O(a, c), u), c += u;
          break;
        }
        case 10: {
          const u = E(n.restDecoder);
          o[l] = new Te(O(a, c), u), c += u;
          break;
        }
        default: {
          const u = (h & (tt | Se)) === 0, d = new J(
            O(a, c),
            null,
            // left
            (h & Se) === Se ? n.readLeftID() : null,
            // origin
            null,
            // right
            (h & tt) === tt ? n.readRightID() : null,
            // right origin
            u ? n.readParentInfo() ? e.get(n.readString()) : n.readLeftID() : null,
            // parent
            u && (h & xn) === xn ? n.readString() : null,
            // parentSub
            ua(n, h)
            // item content
          );
          o[l] = d, c += d.length;
        }
      }
    }
  }
  return t;
}, jl = (n, e, t) => {
  const r = [];
  let s = pt(t.keys()).sort((g, w) => g - w);
  if (s.length === 0)
    return null;
  const i = () => {
    if (s.length === 0)
      return null;
    let g = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      t.get(s[s.length - 1])
    );
    for (; g.refs.length === g.i; )
      if (s.pop(), s.length > 0)
        g = /** @type {{i:number,refs:Array<GC|Item>}} */
        t.get(s[s.length - 1]);
      else
        return null;
    return g;
  };
  let o = i();
  if (o === null)
    return null;
  const a = new zo(), c = /* @__PURE__ */ new Map(), l = (g, w) => {
    const b = c.get(g);
    (b == null || b > w) && c.set(g, w);
  };
  let h = (
    /** @type {any} */
    o.refs[
      /** @type {any} */
      o.i++
    ]
  );
  const u = /* @__PURE__ */ new Map(), d = () => {
    for (const g of r) {
      const w = g.id.client, b = t.get(w);
      b ? (b.i--, a.clients.set(w, b.refs.slice(b.i)), t.delete(w), b.i = 0, b.refs = []) : a.clients.set(w, [g]), s = s.filter(($) => $ !== w);
    }
    r.length = 0;
  };
  for (; ; ) {
    if (h.constructor !== Te) {
      const w = vt(u, h.id.client, () => Y(e, h.id.client)) - h.id.clock;
      if (w < 0)
        r.push(h), l(h.id.client, h.id.clock - 1), d();
      else {
        const b = h.getMissing(n, e);
        if (b !== null) {
          r.push(h);
          const $ = t.get(
            /** @type {number} */
            b
          ) || { refs: [], i: 0 };
          if ($.refs.length === $.i)
            l(
              /** @type {number} */
              b,
              Y(e, b)
            ), d();
          else {
            h = $.refs[$.i++];
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
    const g = new Et();
    return Ws(g, a, /* @__PURE__ */ new Map()), T(g.restEncoder, 0), { missing: c, update: g.toUint8Array() };
  }
  return null;
}, Zl = (n, e) => Ws(n, e.doc.store, e.beforeState), Fl = (n, e, t, r = new Qt(n)) => V(e, (s) => {
  s.local = !1;
  let i = !1;
  const o = s.doc, a = o.store, c = Ul(r, o), l = jl(s, a, c), h = a.pendingStructs;
  if (h) {
    for (const [d, g] of h.missing)
      if (g < Y(a, d)) {
        i = !0;
        break;
      }
    if (l) {
      for (const [d, g] of l.missing) {
        const w = h.missing.get(d);
        (w == null || w > g) && h.missing.set(d, g);
      }
      h.update = ur([h.update, l.update]);
    }
  } else
    a.pendingStructs = l;
  const u = _i(r, s, a);
  if (a.pendingDs) {
    const d = new Qt(an(a.pendingDs));
    E(d.restDecoder);
    const g = _i(d, s, a);
    u && g ? a.pendingDs = ur([u, g]) : a.pendingDs = u || g;
  } else
    a.pendingDs = u;
  if (i) {
    const d = (
      /** @type {{update: Uint8Array}} */
      a.pendingStructs.update
    );
    a.pendingStructs = null, Zo(s.doc, d);
  }
}, t, !1), Zo = (n, e, t, r = Qt) => {
  const s = an(e);
  Fl(s, n, t, new r(s));
}, vi = (n, e, t) => Zo(n, e, t, Vo), Bl = (n, e, t = /* @__PURE__ */ new Map()) => {
  Ws(n, e.store, t), ln(n, Rl(e.store));
}, Kl = (n, e = new Uint8Array([0]), t = new Et()) => {
  const r = Fo(e);
  Bl(t, n, r);
  const s = [t.toUint8Array()];
  if (n.store.pendingDs && s.push(n.store.pendingDs), n.store.pendingStructs && s.push(sh(n.store.pendingStructs.update, e)), s.length > 1) {
    if (t.constructor === Fn)
      return nh(s.map((i, o) => o === 0 ? i : oh(i)));
    if (t.constructor === Et)
      return ur(s);
  }
  return s[0];
}, Qr = (n, e) => Kl(n, e, new Fn()), zl = (n) => {
  const e = /* @__PURE__ */ new Map(), t = E(n.restDecoder);
  for (let r = 0; r < t; r++) {
    const s = E(n.restDecoder), i = E(n.restDecoder);
    e.set(s, i);
  }
  return e;
}, Fo = (n) => zl(new $o(an(n))), Bo = (n, e) => (T(n.restEncoder, e.size), pt(e.entries()).sort((t, r) => r[0] - t[0]).forEach(([t, r]) => {
  T(n.restEncoder, t), T(n.restEncoder, r);
}), n), Pl = (n, e) => Bo(n, $r(e.store)), Wl = (n, e = new jo()) => (n instanceof Map ? Bo(e, n) : Pl(e, n), e.toUint8Array()), Jl = (n) => Wl(n, new Uo());
class Gl {
  constructor() {
    this.l = [];
  }
}
const ki = () => new Gl(), bi = (n, e) => n.l.push(e), Si = (n, e) => {
  const t = n.l, r = t.length;
  n.l = t.filter((s) => e !== s), r === n.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, Ko = (n, e, t) => Vs(n.l, [e, t]);
class Jt {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, t) {
    this.client = e, this.clock = t;
  }
}
const Gn = (n, e) => n === e || n !== null && e !== null && n.client === e.client && n.clock === e.clock, O = (n, e) => new Jt(n, e), ql = (n) => {
  for (const [e, t] of n.doc.share.entries())
    if (t === n)
      return e;
  throw Oe();
}, Ut = (n, e) => e === void 0 ? !n.deleted : e.sv.has(n.id.client) && (e.sv.get(n.id.client) || 0) > n.id.clock && !Mo(e.ds, n.id), fs = (n, e) => {
  const t = vt(n.meta, fs, Ht), r = n.doc.store;
  t.has(e) || (e.sv.forEach((s, i) => {
    s < Y(r, i) && mt(n, O(i, s));
  }), Lo(n, e.ds, (s) => {
  }), t.add(e));
};
class zo {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const $r = (n) => {
  const e = /* @__PURE__ */ new Map();
  return n.clients.forEach((t, r) => {
    const s = t[t.length - 1];
    e.set(r, s.id.clock + s.length);
  }), e;
}, Y = (n, e) => {
  const t = n.clients.get(e);
  if (t === void 0)
    return 0;
  const r = t[t.length - 1];
  return r.id.clock + r.length;
}, Po = (n, e) => {
  let t = n.clients.get(e.id.client);
  if (t === void 0)
    t = [], n.clients.set(e.id.client, t);
  else {
    const r = t[t.length - 1];
    if (r.id.clock + r.length !== e.id.clock)
      throw Oe();
  }
  t.push(e);
}, qe = (n, e) => {
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
  throw Oe();
}, Hl = (n, e) => {
  const t = n.clients.get(e.client);
  return t[qe(t, e.clock)];
}, es = (
  /** @type {function(StructStore,ID):Item} */
  Hl
), gs = (n, e, t) => {
  const r = qe(e, t), s = e[r];
  return s.id.clock < t && s instanceof J ? (e.splice(r + 1, 0, yr(n, s, t - s.id.clock)), r + 1) : r;
}, mt = (n, e) => {
  const t = (
    /** @type {Array<Item>} */
    n.doc.store.clients.get(e.client)
  );
  return t[gs(n, t, e.clock)];
}, xi = (n, e, t) => {
  const r = e.clients.get(t.client), s = qe(r, t.clock), i = r[s];
  return t.clock !== i.id.clock + i.length - 1 && i.constructor !== Ae && r.splice(s + 1, 0, yr(n, i, t.clock - i.id.clock + 1)), i;
}, Yl = (n, e, t) => {
  const r = (
    /** @type {Array<GC|Item>} */
    n.clients.get(e.id.client)
  );
  r[qe(r, e.id.clock)] = t;
}, Wo = (n, e, t, r, s) => {
  if (r === 0)
    return;
  const i = t + r;
  let o = gs(n, e, t), a;
  do
    a = e[o++], i < a.id.clock + a.length && gs(n, e, i), s(a);
  while (o < e.length && e[o].id.clock < i);
};
class Xl {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, t, r) {
    this.doc = e, this.deleteSet = new Zn(), this.beforeState = $r(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = r, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const Ii = (n, e) => e.deleteSet.clients.size === 0 && !ja(e.afterState, (t, r) => e.beforeState.get(r) !== t) ? !1 : (zs(e.deleteSet), Zl(n, e), ln(n, e.deleteSet), !0), Ci = (n, e, t) => {
  const r = e._item;
  (r === null || r.id.clock < (n.beforeState.get(r.id.client) || 0) && !r.deleted) && vt(n.changed, e, Ht).add(t);
}, tr = (n, e) => {
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
}, Ql = (n, e, t) => {
  for (const [r, s] of n.clients.entries()) {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let o = s.length - 1; o >= 0; o--) {
      const a = s[o], c = a.clock + a.len;
      for (let l = qe(i, a.clock), h = i[l]; l < i.length && h.id.clock < c; h = i[++l]) {
        const u = i[l];
        if (a.clock + a.len <= u.id.clock)
          break;
        u instanceof J && u.deleted && !u.keep && t(u) && u.gc(e, !1);
      }
    }
  }
}, eh = (n, e) => {
  n.clients.forEach((t, r) => {
    const s = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let i = t.length - 1; i >= 0; i--) {
      const o = t[i], a = to(s.length - 1, 1 + qe(s, o.clock + o.len - 1));
      for (let c = a, l = s[c]; c > 0 && l.id.clock >= o.clock; l = s[c])
        c -= 1 + tr(s, c);
    }
  });
}, Jo = (n, e) => {
  if (e < n.length) {
    const t = n[e], r = t.doc, s = r.store, i = t.deleteSet, o = t._mergeStructs;
    try {
      zs(i), t.afterState = $r(t.doc.store), r.emit("beforeObserverCalls", [t, r]);
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
            Ko(l._dEH, c, t);
          }));
        }), a.push(() => r.emit("afterTransaction", [t, r])), a.push(() => {
          t._needFormattingCleanup && vh(t);
        });
      }), Vs(a, []);
    } finally {
      r.gc && Ql(i, s, r.gcFilter), eh(i, s), t.afterState.forEach((h, u) => {
        const d = t.beforeState.get(u) || 0;
        if (d !== h) {
          const g = (
            /** @type {Array<GC|Item>} */
            s.clients.get(u)
          ), w = Dt(qe(g, d), 1);
          for (let b = g.length - 1; b >= w; )
            b -= 1 + tr(g, b);
        }
      });
      for (let h = o.length - 1; h >= 0; h--) {
        const { client: u, clock: d } = o[h].id, g = (
          /** @type {Array<GC|Item>} */
          s.clients.get(u)
        ), w = qe(g, d);
        w + 1 < g.length && tr(g, w + 1) > 1 || w > 0 && tr(g, w);
      }
      if (!t.local && t.afterState.get(r.clientID) !== t.beforeState.get(r.clientID) && (Tl(Bs, Eo, "[yjs] ", Ao, To, "Changed the client-id because another client seems to be using it."), r.clientID = Ro()), r.emit("afterTransactionCleanup", [t, r]), r._observers.has("update")) {
        const h = new Fn();
        Ii(h, t) && r.emit("update", [h.toUint8Array(), t.origin, r, t]);
      }
      if (r._observers.has("updateV2")) {
        const h = new Et();
        Ii(h, t) && r.emit("updateV2", [h.toUint8Array(), t.origin, r, t]);
      }
      const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: l } = t;
      (a.size > 0 || l.size > 0 || c.size > 0) && (a.forEach((h) => {
        h.clientID = r.clientID, h.collectionid == null && (h.collectionid = r.collectionid), r.subdocs.add(h);
      }), l.forEach((h) => r.subdocs.delete(h)), r.emit("subdocs", [{ loaded: c, added: a, removed: l }, r, t]), l.forEach((h) => h.destroy())), n.length <= e + 1 ? (r._transactionCleanups = [], r.emit("afterAllTransactions", [r, n])) : Jo(n, e + 1);
    }
  }
}, V = (n, e, t = null, r = !0) => {
  const s = n._transactionCleanups;
  let i = !1, o = null;
  n._transaction === null && (i = !0, n._transaction = new Xl(n, t, r), s.push(n._transaction), s.length === 1 && n.emit("beforeAllTransactions", [n]), n.emit("beforeTransaction", [n._transaction, n]));
  try {
    o = e(n._transaction);
  } finally {
    if (i) {
      const a = n._transaction === s[0];
      n._transaction = null, a && Jo(s, 0);
    }
  }
  return o;
};
function* th(n) {
  const e = E(n.restDecoder);
  for (let t = 0; t < e; t++) {
    const r = E(n.restDecoder), s = n.readClient();
    let i = E(n.restDecoder);
    for (let o = 0; o < r; o++) {
      const a = n.readInfo();
      if (a === 10) {
        const c = E(n.restDecoder);
        yield new Te(O(s, i), c), i += c;
      } else if ((Cr & a) !== 0) {
        const c = (a & (tt | Se)) === 0, l = new J(
          O(s, i),
          null,
          // left
          (a & Se) === Se ? n.readLeftID() : null,
          // origin
          null,
          // right
          (a & tt) === tt ? n.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          c ? n.readParentInfo() ? n.readString() : n.readLeftID() : null,
          // parent
          c && (a & xn) === xn ? n.readString() : null,
          // parentSub
          ua(n, a)
          // item content
        );
        yield l, i += l.length;
      } else {
        const c = n.readLen();
        yield new Ae(O(s, i), c), i += c;
      }
    }
  }
}
class Js {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, t) {
    this.gen = th(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === Te);
    return this.curr;
  }
}
class Gs {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const nh = (n) => ur(n, Vo, Fn), rh = (n, e) => {
  if (n.constructor === Ae) {
    const { client: t, clock: r } = n.id;
    return new Ae(O(t, r + e), n.length - e);
  } else if (n.constructor === Te) {
    const { client: t, clock: r } = n.id;
    return new Te(O(t, r + e), n.length - e);
  } else {
    const t = (
      /** @type {Item} */
      n
    ), { client: r, clock: s } = t.id;
    return new J(
      O(r, s + e),
      null,
      O(r, s + e - 1),
      null,
      t.rightOrigin,
      t.parent,
      t.parentSub,
      t.content.splice(e)
    );
  }
}, ur = (n, e = Qt, t = Et) => {
  if (n.length === 1)
    return n[0];
  const r = n.map((h) => new e(an(h)));
  let s = r.map((h) => new Js(h, !0)), i = null;
  const o = new t(), a = new Gs(o);
  for (; s = s.filter((d) => d.curr !== null), s.sort(
    /** @type {function(any,any):number} */
    (d, g) => {
      if (d.curr.id.client === g.curr.id.client) {
        const w = d.curr.id.clock - g.curr.id.clock;
        return w === 0 ? d.curr.constructor === g.curr.constructor ? 0 : d.curr.constructor === Te ? 1 : -1 : w;
      } else
        return g.curr.id.client - d.curr.id.client;
    }
  ), s.length !== 0; ) {
    const h = s[0], u = (
      /** @type {Item | GC} */
      h.curr.id.client
    );
    if (i !== null) {
      let d = (
        /** @type {Item | GC | null} */
        h.curr
      ), g = !1;
      for (; d !== null && d.id.clock + d.length <= i.struct.id.clock + i.struct.length && d.id.client >= i.struct.id.client; )
        d = h.next(), g = !0;
      if (d === null || // current decoder is empty
      d.id.client !== u || // check whether there is another decoder that has has updates from `firstClient`
      g && d.id.clock > i.struct.id.clock + i.struct.length)
        continue;
      if (u !== i.struct.id.client)
        ct(a, i.struct, i.offset), i = { struct: d, offset: 0 }, h.next();
      else if (i.struct.id.clock + i.struct.length < d.id.clock)
        if (i.struct.constructor === Te)
          i.struct.length = d.id.clock + d.length - i.struct.id.clock;
        else {
          ct(a, i.struct, i.offset);
          const w = d.id.clock - i.struct.id.clock - i.struct.length;
          i = { struct: new Te(O(u, i.struct.id.clock + i.struct.length), w), offset: 0 };
        }
      else {
        const w = i.struct.id.clock + i.struct.length - d.id.clock;
        w > 0 && (i.struct.constructor === Te ? i.struct.length -= w : d = rh(d, w)), i.struct.mergeWith(
          /** @type {any} */
          d
        ) || (ct(a, i.struct, i.offset), i = { struct: d, offset: 0 }, h.next());
      }
    } else
      i = { struct: (
        /** @type {Item | GC} */
        h.curr
      ), offset: 0 }, h.next();
    for (let d = h.curr; d !== null && d.id.client === u && d.id.clock === i.struct.id.clock + i.struct.length && d.constructor !== Te; d = h.next())
      ct(a, i.struct, i.offset), i = { struct: d, offset: 0 };
  }
  i !== null && (ct(a, i.struct, i.offset), i = null), qs(a);
  const c = r.map((h) => Ps(h)), l = Ll(c);
  return ln(o, l), o.toUint8Array();
}, sh = (n, e, t = Qt, r = Et) => {
  const s = Fo(e), i = new r(), o = new Gs(i), a = new t(an(n)), c = new Js(a, !1);
  for (; c.curr; ) {
    const h = c.curr, u = h.id.client, d = s.get(u) || 0;
    if (c.curr.constructor === Te) {
      c.next();
      continue;
    }
    if (h.id.clock + h.length > d)
      for (ct(o, h, Dt(d - h.id.clock, 0)), c.next(); c.curr && c.curr.id.client === u; )
        ct(o, c.curr, 0), c.next();
    else
      for (; c.curr && c.curr.id.client === u && c.curr.id.clock + c.curr.length <= d; )
        c.next();
  }
  qs(o);
  const l = Ps(a);
  return ln(i, l), i.toUint8Array();
}, Go = (n) => {
  n.written > 0 && (n.clientStructs.push({ written: n.written, restEncoder: ze(n.encoder.restEncoder) }), n.encoder.restEncoder = Er(), n.written = 0);
}, ct = (n, e, t) => {
  n.written > 0 && n.currClient !== e.id.client && Go(n), n.written === 0 && (n.currClient = e.id.client, n.encoder.writeClient(e.id.client), T(n.encoder.restEncoder, e.id.clock + t)), e.write(n.encoder, t), n.written++;
}, qs = (n) => {
  Go(n);
  const e = n.encoder.restEncoder;
  T(e, n.clientStructs.length);
  for (let t = 0; t < n.clientStructs.length; t++) {
    const r = n.clientStructs[t];
    T(e, r.written), Ar(e, r.restEncoder);
  }
}, ih = (n, e, t, r) => {
  const s = new t(an(n)), i = new Js(s, !1), o = new r(), a = new Gs(o);
  for (let l = i.curr; l !== null; l = i.next())
    ct(a, e(l), 0);
  qs(a);
  const c = Ps(s);
  return ln(o, c), o.toUint8Array();
}, oh = (n) => ih(n, Nc, Qt, Fn), Ei = "You must not compute changes after the event-handler fired.";
class Vr {
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
    return this._path || (this._path = ah(this.currentTarget, this.target));
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
    return Mo(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw Ge(Ei);
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
        throw Ge(Ei);
      const t = this.target, r = Ht(), s = Ht(), i = [];
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
const ah = (n, e) => {
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
}, le = () => {
  Ol("Invalid access: Add Yjs type to a document before reading data.");
}, qo = 80;
let Hs = 0;
class ch {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, t) {
    e.marker = !0, this.p = e, this.index = t, this.timestamp = Hs++;
  }
}
const lh = (n) => {
  n.timestamp = Hs++;
}, Ho = (n, e, t) => {
  n.p.marker = !1, n.p = e, e.marker = !0, n.index = t, n.timestamp = Hs++;
}, hh = (n, e, t) => {
  if (n.length >= qo) {
    const r = n.reduce((s, i) => s.timestamp < i.timestamp ? s : i);
    return Ho(r, e, t), r;
  } else {
    const r = new ch(e, t);
    return n.push(r), r;
  }
}, Ur = (n, e) => {
  if (n._start === null || e === 0 || n._searchMarker === null)
    return null;
  const t = n._searchMarker.length === 0 ? null : n._searchMarker.reduce((i, o) => Yn(e - i.index) < Yn(e - o.index) ? i : o);
  let r = n._start, s = 0;
  for (t !== null && (r = t.p, s = t.index, lh(t)); r.right !== null && s < e; ) {
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
  return t !== null && Yn(t.index - s) < /** @type {YText|YArray<any>} */
  r.parent.length / qo ? (Ho(t, r, s), t) : hh(n._searchMarker, r, s);
}, Dn = (n, e, t) => {
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
    (e < s.index || t > 0 && e === s.index) && (s.index = Dt(e, s.index + t));
  }
}, jr = (n, e, t) => {
  const r = n, s = e.changedParentTypes;
  for (; vt(s, n, () => []).push(t), n._item !== null; )
    n = /** @type {AbstractType<any>} */
    n._item.parent;
  Ko(r._eH, t, e);
};
class oe {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = ki(), this._dEH = ki(), this._searchMarker = null;
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
    bi(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    bi(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    Si(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    Si(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const Yo = (n, e, t) => {
  n.doc ?? le(), e < 0 && (e = n._length + e), t < 0 && (t = n._length + t);
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
}, Xo = (n) => {
  n.doc ?? le();
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
}, Nn = (n, e) => {
  let t = 0, r = n._start;
  for (n.doc ?? le(); r !== null; ) {
    if (r.countable && !r.deleted) {
      const s = r.content.getContent();
      for (let i = 0; i < s.length; i++)
        e(s[i], t++, n);
    }
    r = r.right;
  }
}, Qo = (n, e) => {
  const t = [];
  return Nn(n, (r, s) => {
    t.push(e(r, s, n));
  }), t;
}, uh = (n) => {
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
}, ea = (n, e) => {
  n.doc ?? le();
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
    l.length > 0 && (s = new J(O(o, Y(a, o)), s, s && s.lastId, c, c && c.id, e, null, new Tt(l)), s.integrate(n, 0), l = []);
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
              s = new J(O(o, Y(a, o)), s, s && s.lastId, c, c && c.id, e, null, new Bn(new Uint8Array(
                /** @type {Uint8Array} */
                u
              ))), s.integrate(n, 0);
              break;
            case Ct:
              s = new J(O(o, Y(a, o)), s, s && s.lastId, c, c && c.id, e, null, new Kn(
                /** @type {Doc} */
                u
              )), s.integrate(n, 0);
              break;
            default:
              if (u instanceof oe)
                s = new J(O(o, Y(a, o)), s, s && s.lastId, c, c && c.id, e, null, new st(u)), s.integrate(n, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), h();
}, ta = () => Ge("Length exceeded!"), na = (n, e, t, r) => {
  if (t > e._length)
    throw ta();
  if (t === 0)
    return e._searchMarker && Dn(e._searchMarker, t, r.length), dr(n, e, null, r);
  const s = t, i = Ur(e, t);
  let o = e._start;
  for (i !== null && (o = i.p, t -= i.index, t === 0 && (o = o.prev, t += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right)
    if (!o.deleted && o.countable) {
      if (t <= o.length) {
        t < o.length && mt(n, O(o.id.client, o.id.clock + t));
        break;
      }
      t -= o.length;
    }
  return e._searchMarker && Dn(e._searchMarker, s, r.length), dr(n, e, o, r);
}, dh = (n, e, t) => {
  let s = (e._searchMarker || []).reduce((i, o) => o.index > i.index ? o : i, { index: 0, p: e._start }).p;
  if (s)
    for (; s.right; )
      s = s.right;
  return dr(n, e, s, t);
}, ra = (n, e, t, r) => {
  if (r === 0)
    return;
  const s = t, i = r, o = Ur(e, t);
  let a = e._start;
  for (o !== null && (a = o.p, t -= o.index); a !== null && t > 0; a = a.right)
    !a.deleted && a.countable && (t < a.length && mt(n, O(a.id.client, a.id.clock + t)), t -= a.length);
  for (; r > 0 && a !== null; )
    a.deleted || (r < a.length && mt(n, O(a.id.client, a.id.clock + r)), a.delete(n), r -= a.length), a = a.right;
  if (r > 0)
    throw ta();
  e._searchMarker && Dn(
    e._searchMarker,
    s,
    -i + r
    /* in case we remove the above exception */
  );
}, fr = (n, e, t) => {
  const r = e._map.get(t);
  r !== void 0 && r.delete(n);
}, Ys = (n, e, t, r) => {
  const s = e._map.get(t) || null, i = n.doc, o = i.clientID;
  let a;
  if (r == null)
    a = new Tt([r]);
  else
    switch (r.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        a = new Tt([r]);
        break;
      case Uint8Array:
        a = new Bn(
          /** @type {Uint8Array} */
          r
        );
        break;
      case Ct:
        a = new Kn(
          /** @type {Doc} */
          r
        );
        break;
      default:
        if (r instanceof oe)
          a = new st(r);
        else
          throw new Error("Unexpected content type");
    }
  new J(O(o, Y(i.store, o)), s, s && s.lastId, null, null, e, t, a).integrate(n, 0);
}, Xs = (n, e) => {
  n.doc ?? le();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted ? t.content.getContent()[t.length - 1] : void 0;
}, sa = (n) => {
  const e = {};
  return n.doc ?? le(), n._map.forEach((t, r) => {
    t.deleted || (e[r] = t.content.getContent()[t.length - 1]);
  }), e;
}, ia = (n, e) => {
  n.doc ?? le();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted;
}, fh = (n, e) => {
  const t = {};
  return n._map.forEach((r, s) => {
    let i = r;
    for (; i !== null && (!e.sv.has(i.id.client) || i.id.clock >= (e.sv.get(i.id.client) || 0)); )
      i = i.left;
    i !== null && Ut(i, e) && (t[s] = i.content.getContent()[i.length - 1]);
  }), t;
}, qn = (n) => (n.doc ?? le(), Dl(
  n._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class gh extends Vr {
}
class Gt extends oe {
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
    const t = new Gt();
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
    return new Gt();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new Gt();
    return e.insert(0, this.toArray().map(
      (t) => t instanceof oe ? (
        /** @type {typeof el} */
        t.clone()
      ) : t
    )), e;
  }
  get length() {
    return this.doc ?? le(), this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    super._callObserver(e, t), jr(this, e, new gh(this, e));
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
      na(
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
      dh(
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
      ra(r, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return ea(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return Xo(this);
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
    return Yo(this, e, t);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof oe ? e.toJSON() : e);
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
    return Qo(
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
    Nn(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return uh(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(jh);
  }
}
const ph = (n) => new Gt();
class mh extends Vr {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, t, r) {
    super(e, t), this.keysChanged = r;
  }
}
class D extends oe {
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
      e.set(r, t instanceof oe ? (
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
    jr(this, e, new mh(this, e, t));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? le();
    const e = {};
    return this._map.forEach((t, r) => {
      if (!t.deleted) {
        const s = t.content.getContent()[t.length - 1];
        e[r] = s instanceof oe ? s.toJSON() : s;
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
    this.doc ?? le(), this._map.forEach((t, r) => {
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
      Ys(
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
      Xs(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return ia(this, e);
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
    e.writeTypeRef(Zh);
  }
}
const yh = (n) => new D(), dt = (n, e) => n === e || typeof n == "object" && typeof e == "object" && n && e && Oc(n, e);
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
    switch (this.right === null && Oe(), this.right.content.constructor) {
      case G:
        this.right.deleted || hn(
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
const Ai = (n, e, t) => {
  for (; e.right !== null && t > 0; ) {
    switch (e.right.content.constructor) {
      case G:
        e.right.deleted || hn(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (t < e.right.length && mt(n, O(e.right.id.client, e.right.id.clock + t)), e.index += e.right.length, t -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, Hn = (n, e, t, r) => {
  const s = /* @__PURE__ */ new Map(), i = r ? Ur(e, t) : null;
  if (i) {
    const o = new ps(i.p.left, i.p, i.index, s);
    return Ai(n, o, t - i.index);
  } else {
    const o = new ps(null, e._start, 0, s);
    return Ai(n, o, t);
  }
}, oa = (n, e, t, r) => {
  for (; t.right !== null && (t.right.deleted === !0 || t.right.content.constructor === G && dt(
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
    const c = t.left, l = t.right, h = new J(O(i, Y(s.store, i)), c, c && c.lastId, l, l && l.id, e, null, new G(a, o));
    h.integrate(n, 0), t.right = h, t.forward();
  });
}, hn = (n, e) => {
  const { key: t, value: r } = e;
  r === null ? n.delete(t) : n.set(t, r);
}, aa = (n, e) => {
  for (; n.right !== null; ) {
    if (!(n.right.deleted || n.right.content.constructor === G && dt(
      e[
        /** @type {ContentFormat} */
        n.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      n.right.content.value
    ))) break;
    n.forward();
  }
}, ca = (n, e, t, r) => {
  const s = n.doc, i = s.clientID, o = /* @__PURE__ */ new Map();
  for (const a in r) {
    const c = r[a], l = t.currentAttributes.get(a) ?? null;
    if (!dt(l, c)) {
      o.set(a, l);
      const { left: h, right: u } = t;
      t.right = new J(O(i, Y(s.store, i)), h, h && h.lastId, u, u && u.id, e, null, new G(a, c)), t.right.integrate(n, 0), t.forward();
    }
  }
  return o;
}, ts = (n, e, t, r, s) => {
  t.currentAttributes.forEach((d, g) => {
    s[g] === void 0 && (s[g] = null);
  });
  const i = n.doc, o = i.clientID;
  aa(t, s);
  const a = ca(n, e, t, s), c = r.constructor === String ? new He(
    /** @type {string} */
    r
  ) : r instanceof oe ? new st(r) : new Nt(r);
  let { left: l, right: h, index: u } = t;
  e._searchMarker && Dn(e._searchMarker, t.index, c.getLength()), h = new J(O(o, Y(i.store, o)), l, l && l.lastId, h, h && h.id, e, null, c), h.integrate(n, 0), t.right = h, t.index = u, t.forward(), oa(n, e, t, a);
}, Ti = (n, e, t, r, s) => {
  const i = n.doc, o = i.clientID;
  aa(t, s);
  const a = ca(n, e, t, s);
  e: for (; t.right !== null && (r > 0 || a.size > 0 && (t.right.deleted || t.right.content.constructor === G)); ) {
    if (!t.right.deleted)
      switch (t.right.content.constructor) {
        case G: {
          const { key: c, value: l } = (
            /** @type {ContentFormat} */
            t.right.content
          ), h = s[c];
          if (h !== void 0) {
            if (dt(h, l))
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
          r < t.right.length && mt(n, O(t.right.id.client, t.right.id.clock + r)), r -= t.right.length;
          break;
      }
    t.forward();
  }
  if (r > 0) {
    let c = "";
    for (; r > 0; r--)
      c += `
`;
    t.right = new J(O(o, Y(i.store, o)), t.left, t.left && t.left.lastId, t.right, t.right && t.right.id, e, null, new He(c)), t.right.integrate(n, 0), t.forward();
  }
  oa(n, e, t, a);
}, la = (n, e, t, r, s) => {
  let i = e;
  const o = $e();
  for (; i && (!i.countable || i.deleted); ) {
    if (!i.deleted && i.content.constructor === G) {
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
        case G: {
          const { key: h, value: u } = (
            /** @type {ContentFormat} */
            l
          ), d = r.get(h) ?? null;
          (o.get(h) !== l || d === u) && (e.delete(n), a++, !c && (s.get(h) ?? null) === u && d !== u && (d === null ? s.delete(h) : s.set(h, d))), !c && !e.deleted && hn(
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
}, wh = (n, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const t = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === G) {
      const r = (
        /** @type {ContentFormat} */
        e.content.key
      );
      t.has(r) ? e.delete(n) : t.add(r);
    }
    e = e.left;
  }
}, _h = (n) => {
  let e = 0;
  return V(
    /** @type {Doc} */
    n.doc,
    (t) => {
      let r = (
        /** @type {Item} */
        n._start
      ), s = n._start, i = $e();
      const o = as(i);
      for (; s; ) {
        if (s.deleted === !1)
          switch (s.content.constructor) {
            case G:
              hn(
                o,
                /** @type {ContentFormat} */
                s.content
              );
              break;
            default:
              e += la(t, r, s, i, o), i = as(o), r = s;
              break;
          }
        s = s.right;
      }
    }
  ), e;
}, vh = (n) => {
  const e = /* @__PURE__ */ new Set(), t = n.doc;
  for (const [r, s] of n.afterState.entries()) {
    const i = n.beforeState.get(r) || 0;
    s !== i && Wo(
      n,
      /** @type {Array<Item|GC>} */
      t.store.clients.get(r),
      i,
      s,
      (o) => {
        !o.deleted && /** @type {Item} */
        o.content.constructor === G && o.constructor !== Ae && e.add(
          /** @type {any} */
          o.parent
        );
      }
    );
  }
  V(t, (r) => {
    Lo(n, n.deleteSet, (s) => {
      if (s instanceof Ae || !/** @type {YText} */
      s.parent._hasFormatting || e.has(
        /** @type {YText} */
        s.parent
      ))
        return;
      const i = (
        /** @type {YText} */
        s.parent
      );
      s.content.constructor === G ? e.add(i) : wh(r, s);
    });
    for (const s of e)
      _h(s);
  });
}, Oi = (n, e, t) => {
  const r = t, s = as(e.currentAttributes), i = e.right;
  for (; t > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case st:
        case Nt:
        case He:
          t < e.right.length && mt(n, O(e.right.id.client, e.right.id.clock + t)), t -= e.right.length, e.right.delete(n);
          break;
      }
    e.forward();
  }
  i && la(n, i, e.right, s, e.currentAttributes);
  const o = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return o._searchMarker && Dn(o._searchMarker, e.index, -r + t), e;
};
class kh extends Vr {
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
        const d = () => {
          if (a !== null) {
            let g = null;
            switch (a) {
              case "delete":
                u > 0 && (g = { delete: u }), u = 0;
                break;
              case "insert":
                (typeof l == "object" || l.length > 0) && (g = { insert: l }, s.size > 0 && (g.attributes = {}, s.forEach((w, b) => {
                  w !== null && (g.attributes[b] = w);
                }))), l = "";
                break;
              case "retain":
                h > 0 && (g = { retain: h }, Tc(c) || (g.attributes = Cc({}, c))), h = 0;
                break;
            }
            g && t.push(g), a = null;
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case st:
            case Nt:
              this.adds(o) ? this.deletes(o) || (d(), a = "insert", l = o.content.getContent()[0], d()) : this.deletes(o) ? (a !== "delete" && (d(), a = "delete"), u += 1) : o.deleted || (a !== "retain" && (d(), a = "retain"), h += 1);
              break;
            case He:
              this.adds(o) ? this.deletes(o) || (a !== "insert" && (d(), a = "insert"), l += /** @type {ContentString} */
              o.content.str) : this.deletes(o) ? (a !== "delete" && (d(), a = "delete"), u += o.length) : o.deleted || (a !== "retain" && (d(), a = "retain"), h += o.length);
              break;
            case G: {
              const { key: g, value: w } = (
                /** @type {ContentFormat} */
                o.content
              );
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const b = s.get(g) ?? null;
                  dt(b, w) ? w !== null && o.delete(r) : (a === "retain" && d(), dt(w, i.get(g) ?? null) ? delete c[g] : c[g] = w);
                }
              } else if (this.deletes(o)) {
                i.set(g, w);
                const b = s.get(g) ?? null;
                dt(b, w) || (a === "retain" && d(), c[g] = b);
              } else if (!o.deleted) {
                i.set(g, w);
                const b = c[g];
                b !== void 0 && (dt(b, w) ? b !== null && o.delete(r) : (a === "retain" && d(), w === null ? delete c[g] : c[g] = w));
              }
              o.deleted || (a === "insert" && d(), hn(
                s,
                /** @type {ContentFormat} */
                o.content
              ));
              break;
            }
          }
          o = o.right;
        }
        for (d(); t.length > 0; ) {
          const g = t[t.length - 1];
          if (g.retain !== void 0 && g.attributes === void 0)
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
class Z extends oe {
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
    return this.doc ?? le(), this._length;
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
    return new Z();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const e = new Z();
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
    const r = new kh(this, e, t);
    jr(this, e, r), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? le();
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
        } else o.retain !== void 0 ? Ti(r, this, s, o.retain, o.attributes || {}) : o.delete !== void 0 && Oi(r, s, o.delete);
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
    this.doc ?? le();
    const s = [], i = /* @__PURE__ */ new Map(), o = (
      /** @type {Doc} */
      this.doc
    );
    let a = "", c = this._start;
    function l() {
      if (a.length > 0) {
        const u = {};
        let d = !1;
        i.forEach((w, b) => {
          d = !0, u[b] = w;
        });
        const g = { insert: a };
        d && (g.attributes = u), s.push(g), a = "";
      }
    }
    const h = () => {
      for (; c !== null; ) {
        if (Ut(c, e) || t !== void 0 && Ut(c, t))
          switch (c.content.constructor) {
            case He: {
              const u = i.get("ychange");
              e !== void 0 && !Ut(c, e) ? (u === void 0 || u.user !== c.id.client || u.type !== "removed") && (l(), i.set("ychange", r ? r("removed", c.id) : { type: "removed" })) : t !== void 0 && !Ut(c, t) ? (u === void 0 || u.user !== c.id.client || u.type !== "added") && (l(), i.set("ychange", r ? r("added", c.id) : { type: "added" })) : u !== void 0 && (l(), i.delete("ychange")), a += /** @type {ContentString} */
              c.content.str;
              break;
            }
            case st:
            case Nt: {
              l();
              const u = {
                insert: c.content.getContent()[0]
              };
              if (i.size > 0) {
                const d = (
                  /** @type {Object<string,any>} */
                  {}
                );
                u.attributes = d, i.forEach((g, w) => {
                  d[w] = g;
                });
              }
              s.push(u);
              break;
            }
            case G:
              Ut(c, e) && (l(), hn(
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
      const o = Hn(i, this, e, !r);
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
      const o = Hn(i, this, e, !r);
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
      Oi(s, Hn(s, this, e, !0), t);
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
      const o = Hn(i, this, e, !1);
      o.right !== null && Ti(i, this, o, t, r);
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
      Ys(r, this, e, t);
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
      Xs(this, e)
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
    return sa(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Fh);
  }
}
const bh = (n) => new Z();
class ns {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(e, t = () => !0) {
    this._filter = t, this._root = e, this._currentNode = /** @type {Item} */
    e._start, this._firstCall = !0, e.doc ?? le();
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
        e.content.type, !e.deleted && (t.constructor === en || t.constructor === At) && t._start !== null)
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
class At extends oe {
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
    return new At();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new At();
    return e.insert(0, this.toArray().map((t) => t instanceof oe ? t.clone() : t)), e;
  }
  get length() {
    return this.doc ?? le(), this._prelimContent === null ? this._length : this._prelimContent.length;
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
    return e = e.toUpperCase(), pt(new ns(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    jr(this, e, new Ih(this, t, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return Qo(this, (e) => e.toString()).join("");
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
    return r !== void 0 && r._createAssociation(s, this), Nn(this, (i) => {
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
      na(r, this, e, t);
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
        const s = e && e instanceof oe ? e._item : e;
        dr(r, this, s, t);
      });
    else {
      const r = (
        /** @type {Array<any>} */
        this._prelimContent
      ), s = e === null ? 0 : r.findIndex((i) => i === e) + 1;
      if (s === 0 && e !== null)
        throw Ge("Reference item not found");
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
      ra(r, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return Xo(this);
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
    return ea(this, e);
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
    return Yo(this, e, t);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Nn(this, e);
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
    e.writeTypeRef(Kh);
  }
}
const Sh = (n) => new At();
class en extends At {
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
    return new en(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new en(this.nodeName), t = this.getAttributes();
    return Ac(t, (r, s) => {
      e.setAttribute(
        s,
        /** @type {any} */
        r
      );
    }), e.insert(0, this.toArray().map((r) => r instanceof oe ? r.clone() : r)), e;
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
      Ys(r, this, e, t);
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
      Xs(this, e)
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
      ia(this, e)
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
      e ? fh(this, e) : sa(this)
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
    return Nn(this, (o) => {
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
    e.writeTypeRef(Bh), e.writeKey(this.nodeName);
  }
}
const xh = (n) => new en(n.readKey());
class Ih extends Vr {
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
    e.writeTypeRef(zh), e.writeKey(this.hookName);
  }
}
const Ch = (n) => new gr(n.readKey());
class pr extends Z {
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
    e.writeTypeRef(Ph);
  }
}
const Eh = (n) => new pr();
class Qs {
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
const Ah = 0;
class Ae extends Qs {
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
    t > 0 && (this.id.clock += t, this.length -= t), Po(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(Ah), e.writeLen(this.length - t);
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
class Bn {
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
    return new Bn(this.content);
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
const Th = (n) => new Bn(n.readBuf());
class Ln {
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
    return new Ln(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const t = new Ln(this.len - e);
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
const Oh = (n) => new Ln(n.readLen()), ha = (n, e) => new Ct({ guid: n, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class Kn {
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
    return new Kn(ha(this.doc.guid, this.opts));
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
const Dh = (n) => new Kn(ha(n.readString(), n.readAny()));
class Nt {
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
    return new Nt(this.embed);
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
const Nh = (n) => new Nt(n.readJSON());
class G {
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
    return new G(this.key, this.value);
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
const Lh = (n) => new G(n.readKey(), n.readJSON());
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
const Mh = (n) => {
  const e = n.readLen(), t = [];
  for (let r = 0; r < e; r++) {
    const s = n.readString();
    s === "undefined" ? t.push(void 0) : t.push(JSON.parse(s));
  }
  return new mr(t);
}, Rh = or("node_env") === "development";
class Tt {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, Rh && co(e);
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
    return new Tt(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const t = new Tt(this.arr.slice(e));
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
const $h = (n) => {
  const e = n.readLen(), t = [];
  for (let r = 0; r < e; r++)
    t.push(n.readAny());
  return new Tt(t);
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
const Vh = (n) => new He(n.readString()), Uh = [
  ph,
  yh,
  bh,
  xh,
  Sh,
  Ch,
  Eh
], jh = 0, Zh = 1, Fh = 2, Bh = 3, Kh = 4, zh = 5, Ph = 6;
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
const Wh = (n) => new st(Uh[n.readTypeRef()](n)), yr = (n, e, t) => {
  const { client: r, clock: s } = e.id, i = new J(
    O(r, s + t),
    e,
    O(r, s + t - 1),
    e.right,
    e.rightOrigin,
    e.parent,
    e.parentSub,
    e.content.splice(t)
  );
  return e.deleted && i.markDeleted(), e.keep && (i.keep = !0), e.redone !== null && (i.redone = O(e.redone.client, e.redone.clock + t)), e.right = i, i.right !== null && (i.right.left = i), n._mergeStructs.push(i), i.parentSub !== null && i.right === null && i.parent._map.set(i.parentSub, i), e.length = t, i;
};
class J extends Qs {
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
    super(e, c.getLength()), this.origin = r, this.left = t, this.right = s, this.rightOrigin = i, this.parent = o, this.parentSub = a, this.redone = null, this.content = c, this.info = this.content.isCountable() ? ai : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & Jr) > 0 !== e && (this.info ^= Jr);
  }
  get marker() {
    return (this.info & Jr) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & oi) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= oi);
  }
  get countable() {
    return (this.info & ai) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & Wr) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= Wr);
  }
  markDeleted() {
    this.info |= Wr;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= Y(t, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= Y(t, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === Jt && this.id.client !== this.parent.client && this.parent.clock >= Y(t, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = xi(e, t, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = mt(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === Ae || this.right && this.right.constructor === Ae)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === J ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === J && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === Jt) {
      const r = es(t, this.parent);
      r.constructor === Ae ? this.parent = null : this.parent = /** @type {ContentType} */
      r.content.type;
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    if (t > 0 && (this.id.clock += t, this.left = xi(e, e.doc.store, O(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
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
          if (o.add(s), i.add(s), Gn(this.origin, s.origin)) {
            if (s.id.client < this.id.client)
              r = s, i.clear();
            else if (Gn(this.rightOrigin, s.rightOrigin))
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
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), Po(e.doc.store, this), this.content.integrate(e, this), Ci(
        e,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      ), /** @type {AbstractType<any>} */
      (this.parent._item !== null && /** @type {AbstractType<any>} */
      this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
    } else
      new Ae(this.id, this.length).integrate(e, 0);
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
    return this.length === 1 ? this.id : O(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(e) {
    if (this.constructor === e.constructor && Gn(e.origin, this.lastId) && this.right === e && Gn(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
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
      this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), hr(e.deleteSet, this.id.client, this.id.clock, this.length), Ci(e, t, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, t) {
    if (!this.deleted)
      throw Oe();
    this.content.gc(e), t ? Yl(e, this, new Ae(this.id, this.length)) : this.content = new Ln(this.length);
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
    const r = t > 0 ? O(this.id.client, this.id.clock + t - 1) : this.origin, s = this.rightOrigin, i = this.parentSub, o = this.content.getRef() & Cr | (r === null ? 0 : Se) | // origin is defined
    (s === null ? 0 : tt) | // right origin is defined
    (i === null ? 0 : xn);
    if (e.writeInfo(o), r !== null && e.writeLeftID(r), s !== null && e.writeRightID(s), r === null && s === null) {
      const a = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const l = ql(a);
          e.writeParentInfo(!0), e.writeString(l);
        } else
          e.writeParentInfo(!1), e.writeLeftID(c.id);
      } else a.constructor === String ? (e.writeParentInfo(!0), e.writeString(a)) : a.constructor === Jt ? (e.writeParentInfo(!1), e.writeLeftID(a)) : Oe();
      i !== null && e.writeString(i);
    }
    this.content.write(e, t);
  }
}
const ua = (n, e) => Jh[e & Cr](n), Jh = [
  () => {
    Oe();
  },
  // GC is not ItemContent
  Oh,
  // 1
  Mh,
  // 2
  Th,
  // 3
  Vh,
  // 4
  Nh,
  // 5
  Lh,
  // 6
  Wh,
  // 7
  $h,
  // 8
  Dh,
  // 9
  () => {
    Oe();
  }
  // 10 - Skip is not ItemContent
], Gh = 10;
class Te extends Qs {
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
    Oe();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(Gh), T(e.restEncoder, this.length - t);
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
const da = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), fa = "__ $YJS$ __";
da[fa] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
da[fa] = !0;
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
var Di;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Di || (Di = {}));
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
]), at = (n) => {
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
let qh = ms;
function Hh() {
  return qh;
}
const Yh = (n) => {
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
  const t = Hh(), r = Yh({
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
class xe {
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
    return xe.mergeObjectSync(e, r);
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
}), yn = (n) => ({ status: "dirty", value: n }), De = (n) => ({ status: "valid", value: n }), Ni = (n) => n.status === "aborted", Li = (n) => n.status === "dirty", tn = (n) => n.status === "valid", wr = (n) => typeof Promise < "u" && n instanceof Promise;
var k;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(k || (k = {}));
class yt {
  constructor(e, t, r, s) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Mi = (n, e) => {
  if (tn(e))
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
    return at(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: at(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new xe(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: at(e.data),
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
      parsedType: at(e)
    }, s = this._parseSync({ data: e, path: r.path, parent: r });
    return Mi(r, s);
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
      parsedType: at(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return tn(i) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => tn(i) ? {
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
      parsedType: at(e)
    }, s = this._parse({ data: e, path: r.path, parent: r }), i = await (wr(s) ? s : Promise.resolve(s));
    return Mi(r, i);
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
    return new sn({
      schema: this,
      typeName: x.ZodEffects,
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
    return gt.create(this, this._def);
  }
  nullable() {
    return on.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Pe.create(this);
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
    return new sn({
      ...A(this._def),
      schema: this,
      typeName: x.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ws({
      ...A(this._def),
      innerType: this,
      defaultValue: t,
      typeName: x.ZodDefault
    });
  }
  brand() {
    return new vu({
      typeName: x.ZodBranded,
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
      typeName: x.ZodCatch
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
    return ei.create(this, e);
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
const Xh = /^c[^\s-]{8,}$/i, Qh = /^[0-9a-z]+$/, eu = /^[0-9A-HJKMNP-TV-Z]{26}$/i, tu = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, nu = /^[a-z0-9_-]{21}$/i, ru = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, su = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, iu = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, ou = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let rs;
const au = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, cu = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, lu = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, hu = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, uu = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, du = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ga = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", fu = new RegExp(`^${ga}$`);
function pa(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function gu(n) {
  return new RegExp(`^${pa(n)}$`);
}
function pu(n) {
  let e = `${ga}T${pa(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function mu(n, e) {
  return !!((e === "v4" || !e) && au.test(n) || (e === "v6" || !e) && lu.test(n));
}
function yu(n, e) {
  if (!ru.test(n))
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
function wu(n, e) {
  return !!((e === "v4" || !e) && cu.test(n) || (e === "v6" || !e) && hu.test(n));
}
class ft extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: v.string,
        received: i.parsedType
      }), S;
    }
    const r = new xe();
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
        iu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "emoji")
        rs || (rs = new RegExp(ou, "u")), rs.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "uuid")
        tu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "nanoid")
        nu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid")
        Xh.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid2")
        Qh.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "ulid")
        eu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
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
      }), r.dirty()) : i.kind === "datetime" ? pu(i).test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), r.dirty()) : i.kind === "date" ? fu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), r.dirty()) : i.kind === "time" ? gu(i).test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), r.dirty()) : i.kind === "duration" ? su.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "ip" ? mu(e.data, i.version) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "jwt" ? yu(e.data, i.alg) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "cidr" ? wu(e.data, i.version) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64" ? uu.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64url" ? du.test(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
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
    return new ft({
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
    return new ft({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ft({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ft({
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
ft.create = (n) => new ft({
  checks: [],
  typeName: x.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
function _u(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = t > r ? t : r, i = Number.parseInt(n.toFixed(s).replace(".", "")), o = Number.parseInt(e.toFixed(s).replace(".", ""));
  return i % o / 10 ** s;
}
class nn extends N {
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
    const s = new xe();
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
      }), s.dirty()) : i.kind === "multipleOf" ? _u(e.data, i.value) !== 0 && (r = this._getOrReturnCtx(e, r), _(r, {
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
    return new nn({
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
    return new nn({
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
nn.create = (n) => new nn({
  checks: [],
  typeName: x.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class Mn extends N {
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
    const s = new xe();
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
    return new Mn({
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
    return new Mn({
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
Mn.create = (n) => new Mn({
  checks: [],
  typeName: x.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
class Ri extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.boolean,
        received: r.parsedType
      }), S;
    }
    return De(e.data);
  }
}
Ri.create = (n) => new Ri({
  typeName: x.ZodBoolean,
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
    const r = new xe();
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
  typeName: x.ZodDate,
  ...A(n)
});
class $i extends N {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.symbol,
        received: r.parsedType
      }), S;
    }
    return De(e.data);
  }
}
$i.create = (n) => new $i({
  typeName: x.ZodSymbol,
  ...A(n)
});
class Vi extends N {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.undefined,
        received: r.parsedType
      }), S;
    }
    return De(e.data);
  }
}
Vi.create = (n) => new Vi({
  typeName: x.ZodUndefined,
  ...A(n)
});
class Ui extends N {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.null,
        received: r.parsedType
      }), S;
    }
    return De(e.data);
  }
}
Ui.create = (n) => new Ui({
  typeName: x.ZodNull,
  ...A(n)
});
class ji extends N {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return De(e.data);
  }
}
ji.create = (n) => new ji({
  typeName: x.ZodAny,
  ...A(n)
});
class Zi extends N {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return De(e.data);
  }
}
Zi.create = (n) => new Zi({
  typeName: x.ZodUnknown,
  ...A(n)
});
class wt extends N {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return _(t, {
      code: y.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), S;
  }
}
wt.create = (n) => new wt({
  typeName: x.ZodNever,
  ...A(n)
});
class Fi extends N {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return _(r, {
        code: y.invalid_type,
        expected: v.void,
        received: r.parsedType
      }), S;
    }
    return De(e.data);
  }
}
Fi.create = (n) => new Fi({
  typeName: x.ZodVoid,
  ...A(n)
});
class Pe extends N {
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
      return Promise.all([...t.data].map((o, a) => s.type._parseAsync(new yt(t, o, t.path, a)))).then((o) => xe.mergeArray(r, o));
    const i = [...t.data].map((o, a) => s.type._parseSync(new yt(t, o, t.path, a)));
    return xe.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new Pe({
      ...this._def,
      minLength: { value: e, message: k.toString(t) }
    });
  }
  max(e, t) {
    return new Pe({
      ...this._def,
      maxLength: { value: e, message: k.toString(t) }
    });
  }
  length(e, t) {
    return new Pe({
      ...this._def,
      exactLength: { value: e, message: k.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Pe.create = (n, e) => new Pe({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: x.ZodArray,
  ...A(e)
});
function jt(n) {
  if (n instanceof W) {
    const e = {};
    for (const t in n.shape) {
      const r = n.shape[t];
      e[t] = gt.create(jt(r));
    }
    return new W({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof Pe ? new Pe({
    ...n._def,
    type: jt(n.element)
  }) : n instanceof gt ? gt.create(jt(n.unwrap())) : n instanceof on ? on.create(jt(n.unwrap())) : n instanceof Ot ? Ot.create(n.items.map((e) => jt(e))) : n;
}
class W extends N {
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
    if (!(this._def.catchall instanceof wt && this._def.unknownKeys === "strip"))
      for (const l in s.data)
        o.includes(l) || a.push(l);
    const c = [];
    for (const l of o) {
      const h = i[l], u = s.data[l];
      c.push({
        key: { status: "valid", value: l },
        value: h._parse(new yt(s, u, s.path, l)),
        alwaysSet: l in s.data
      });
    }
    if (this._def.catchall instanceof wt) {
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
            new yt(s, u, s.path, h)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: h in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const h of c) {
        const u = await h.key, d = await h.value;
        l.push({
          key: u,
          value: d,
          alwaysSet: h.alwaysSet
        });
      }
      return l;
    }).then((l) => xe.mergeObjectSync(r, l)) : xe.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return k.errToObj, new W({
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
    return new W({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new W({
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
    return new W({
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
    return new W({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: x.ZodObject
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
    return new W({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of M.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of M.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return jt(this);
  }
  partial(e) {
    const t = {};
    for (const r of M.objectKeys(this.shape)) {
      const s = this.shape[r];
      e && !e[r] ? t[r] = s : t[r] = s.optional();
    }
    return new W({
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
        for (; i instanceof gt; )
          i = i._def.innerType;
        t[r] = i;
      }
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return ma(M.objectKeys(this.shape));
  }
}
W.create = (n, e) => new W({
  shape: () => n,
  unknownKeys: "strip",
  catchall: wt.create(),
  typeName: x.ZodObject,
  ...A(e)
});
W.strictCreate = (n, e) => new W({
  shape: () => n,
  unknownKeys: "strict",
  catchall: wt.create(),
  typeName: x.ZodObject,
  ...A(e)
});
W.lazycreate = (n, e) => new W({
  shape: n,
  unknownKeys: "strip",
  catchall: wt.create(),
  typeName: x.ZodObject,
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
  typeName: x.ZodUnion,
  ...A(e)
});
function ys(n, e) {
  const t = at(n), r = at(e);
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
      if (Ni(i) || Ni(o))
        return S;
      const a = ys(i.value, o.value);
      return a.valid ? ((Li(i) || Li(o)) && t.dirty(), { status: t.value, value: a.data }) : (_(r, {
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
  typeName: x.ZodIntersection,
  ...A(t)
});
class Ot extends N {
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
      return c ? c._parse(new yt(r, o, r.path, a)) : null;
    }).filter((o) => !!o);
    return r.common.async ? Promise.all(i).then((o) => xe.mergeArray(t, o)) : xe.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Ot({
      ...this._def,
      rest: e
    });
  }
}
Ot.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ot({
    items: n,
    typeName: x.ZodTuple,
    rest: null,
    ...A(e)
  });
};
class Bi extends N {
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
      key: s._parse(new yt(r, a, r.path, [l, "key"])),
      value: i._parse(new yt(r, c, r.path, [l, "value"]))
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
Bi.create = (n, e, t) => new Bi({
  valueType: e,
  keyType: n,
  typeName: x.ZodMap,
  ...A(t)
});
class Rn extends N {
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
    const a = [...r.data.values()].map((c, l) => i._parse(new yt(r, c, r.path, l)));
    return r.common.async ? Promise.all(a).then((c) => o(c)) : o(a);
  }
  min(e, t) {
    return new Rn({
      ...this._def,
      minSize: { value: e, message: k.toString(t) }
    });
  }
  max(e, t) {
    return new Rn({
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
Rn.create = (n, e) => new Rn({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: x.ZodSet,
  ...A(e)
});
class Ki extends N {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ki.create = (n, e) => new Ki({
  getter: n,
  typeName: x.ZodLazy,
  ...A(e)
});
class zi extends N {
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
zi.create = (n, e) => new zi({
  value: n,
  typeName: x.ZodLiteral,
  ...A(e)
});
function ma(n, e) {
  return new rn({
    values: n,
    typeName: x.ZodEnum,
    ...A(e)
  });
}
class rn extends N {
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
    return De(e.data);
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
    return rn.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return rn.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
rn.create = ma;
class Pi extends N {
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
    return De(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Pi.create = (n, e) => new Pi({
  values: n,
  typeName: x.ZodNativeEnum,
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
    return De(r.then((s) => this._def.type.parseAsync(s, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
br.create = (n, e) => new br({
  type: n,
  typeName: x.ZodPromise,
  ...A(e)
});
class sn extends N {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === x.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
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
          return c.status === "aborted" ? S : c.status === "dirty" || t.value === "dirty" ? yn(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return S;
        const a = this._def.schema._parseSync({
          data: o,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? S : a.status === "dirty" || t.value === "dirty" ? yn(a.value) : a;
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
        if (!tn(o))
          return S;
        const a = s.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => tn(o) ? Promise.resolve(s.transform(o.value, i)).then((a) => ({
          status: t.value,
          value: a
        })) : S);
    M.assertNever(s);
  }
}
sn.create = (n, e, t) => new sn({
  schema: n,
  typeName: x.ZodEffects,
  effect: e,
  ...A(t)
});
sn.createWithPreprocess = (n, e, t) => new sn({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: x.ZodEffects,
  ...A(t)
});
class gt extends N {
  _parse(e) {
    return this._getType(e) === v.undefined ? De(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
gt.create = (n, e) => new gt({
  innerType: n,
  typeName: x.ZodOptional,
  ...A(e)
});
class on extends N {
  _parse(e) {
    return this._getType(e) === v.null ? De(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
on.create = (n, e) => new on({
  innerType: n,
  typeName: x.ZodNullable,
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
  typeName: x.ZodDefault,
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
  typeName: x.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...A(e)
});
class Wi extends N {
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
Wi.create = (n) => new Wi({
  typeName: x.ZodNaN,
  ...A(n)
});
class vu extends N {
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
class ei extends N {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return i.status === "aborted" ? S : i.status === "dirty" ? (t.dirty(), yn(i.value)) : this._def.out._parseAsync({
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
    return new ei({
      in: e,
      out: t,
      typeName: x.ZodPipeline
    });
  }
}
class vs extends N {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (s) => (tn(s) && (s.value = Object.freeze(s.value)), s);
    return wr(t) ? t.then((s) => r(s)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
vs.create = (n, e) => new vs({
  innerType: n,
  typeName: x.ZodReadonly,
  ...A(e)
});
var x;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(x || (x = {}));
const ya = ft.create, ku = nn.create;
wt.create;
Pe.create;
vr.create;
kr.create;
Ot.create;
rn.create;
br.create;
gt.create;
on.create;
var ie = Uint8Array, be = Uint16Array, ti = Int32Array, Zr = new ie([
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
]), Fr = new ie([
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
]), ks = new ie([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), wa = function(n, e) {
  for (var t = new be(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << n[r - 1];
  for (var s = new ti(t[30]), r = 1; r < 30; ++r)
    for (var i = t[r]; i < t[r + 1]; ++i)
      s[i] = i - t[r] << 5 | r;
  return { b: t, r: s };
}, _a = wa(Zr, 2), va = _a.b, bs = _a.r;
va[28] = 258, bs[258] = 28;
var ka = wa(Fr, 0), bu = ka.b, Ji = ka.r, Ss = new be(32768);
for (var j = 0; j < 32768; ++j) {
  var ot = (j & 43690) >> 1 | (j & 21845) << 1;
  ot = (ot & 52428) >> 2 | (ot & 13107) << 2, ot = (ot & 61680) >> 4 | (ot & 3855) << 4, Ss[j] = ((ot & 65280) >> 8 | (ot & 255) << 8) >> 1;
}
var We = (function(n, e, t) {
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
        for (var l = s << 4 | n[s], h = e - n[s], u = o[n[s] - 1]++ << h, d = u | (1 << h) - 1; u <= d; ++u)
          a[Ss[u] >> c] = l;
  } else
    for (a = new be(r), s = 0; s < r; ++s)
      n[s] && (a[s] = Ss[o[n[s] - 1]++] >> 15 - n[s]);
  return a;
}), _t = new ie(288);
for (var j = 0; j < 144; ++j)
  _t[j] = 8;
for (var j = 144; j < 256; ++j)
  _t[j] = 9;
for (var j = 256; j < 280; ++j)
  _t[j] = 7;
for (var j = 280; j < 288; ++j)
  _t[j] = 8;
var $n = new ie(32);
for (var j = 0; j < 32; ++j)
  $n[j] = 5;
var Su = /* @__PURE__ */ We(_t, 9, 0), xu = /* @__PURE__ */ We(_t, 9, 1), Iu = /* @__PURE__ */ We($n, 5, 0), Cu = /* @__PURE__ */ We($n, 5, 1), ss = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Me = function(n, e, t) {
  var r = e / 8 | 0;
  return (n[r] | n[r + 1] << 8) >> (e & 7) & t;
}, is = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, ni = function(n) {
  return (n + 7) / 8 | 0;
}, ba = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new ie(n.subarray(e, t));
}, Eu = [
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
], Re = function(n, e, t) {
  var r = new Error(e || Eu[n]);
  if (r.code = n, Error.captureStackTrace && Error.captureStackTrace(r, Re), !t)
    throw r;
  return r;
}, Au = function(n, e, t, r) {
  var s = n.length, i = 0;
  if (!s || e.f && !e.l)
    return t || new ie(0);
  var o = !t, a = o || e.i != 2, c = e.i;
  o && (t = new ie(s * 3));
  var l = function(dn) {
    var fn = t.length;
    if (dn > fn) {
      var Rt = new ie(Math.max(fn * 2, dn));
      Rt.set(t), t = Rt;
    }
  }, h = e.f || 0, u = e.p || 0, d = e.b || 0, g = e.l, w = e.d, b = e.m, $ = e.n, me = s * 8;
  do {
    if (!g) {
      h = Me(n, u, 1);
      var U = Me(n, u + 1, 3);
      if (u += 3, U)
        if (U == 1)
          g = xu, w = Cu, b = 9, $ = 5;
        else if (U == 2) {
          var de = Me(n, u, 31) + 257, Q = Me(n, u + 10, 15) + 4, R = de + Me(n, u + 5, 31) + 1;
          u += 14;
          for (var C = new ie(R), ee = new ie(19), z = 0; z < Q; ++z)
            ee[ks[z]] = Me(n, u + z * 3, 7);
          u += Q * 3;
          for (var ce = ss(ee), it = (1 << ce) - 1, ye = We(ee, ce, 1), z = 0; z < R; ) {
            var fe = ye[Me(n, u, it)];
            u += fe & 15;
            var q = fe >> 4;
            if (q < 16)
              C[z++] = q;
            else {
              var te = 0, F = 0;
              for (q == 16 ? (F = 3 + Me(n, u, 3), u += 2, te = C[z - 1]) : q == 17 ? (F = 3 + Me(n, u, 7), u += 3) : q == 18 && (F = 11 + Me(n, u, 127), u += 7); F--; )
                C[z++] = te;
            }
          }
          var ge = C.subarray(0, de), ne = C.subarray(de);
          b = ss(ge), $ = ss(ne), g = We(ge, b, 1), w = We(ne, $, 1);
        } else
          Re(1);
      else {
        var q = ni(u) + 4, ue = n[q - 4] | n[q - 3] << 8, ae = q + ue;
        if (ae > s) {
          c && Re(0);
          break;
        }
        a && l(d + ue), t.set(n.subarray(q, ae), d), e.b = d += ue, e.p = u = ae * 8, e.f = h;
        continue;
      }
      if (u > me) {
        c && Re(0);
        break;
      }
    }
    a && l(d + 131072);
    for (var un = (1 << b) - 1, Ie = (1 << $) - 1, Ye = u; ; Ye = u) {
      var te = g[is(n, u) & un], we = te >> 4;
      if (u += te & 15, u > me) {
        c && Re(0);
        break;
      }
      if (te || Re(2), we < 256)
        t[d++] = we;
      else if (we == 256) {
        Ye = u, g = null;
        break;
      } else {
        var _e = we - 254;
        if (we > 264) {
          var z = we - 257, B = Zr[z];
          _e = Me(n, u, (1 << B) - 1) + va[z], u += B;
        }
        var Ue = w[is(n, u) & Ie], Lt = Ue >> 4;
        Ue || Re(3), u += Ue & 15;
        var ne = bu[Lt];
        if (Lt > 3) {
          var B = Fr[Lt];
          ne += is(n, u) & (1 << B) - 1, u += B;
        }
        if (u > me) {
          c && Re(0);
          break;
        }
        a && l(d + 131072);
        var Mt = d + _e;
        if (d < ne) {
          var zn = i - ne, Pn = Math.min(ne, Mt);
          for (zn + d < 0 && Re(3); d < Pn; ++d)
            t[d] = r[zn + d];
        }
        for (; d < Mt; ++d)
          t[d] = t[d - ne];
      }
    }
    e.l = g, e.p = Ye, e.b = d, e.f = h, g && (h = 1, e.m = b, e.d = w, e.n = $);
  } while (!h);
  return d != t.length && o ? ba(t, 0, d) : t.subarray(0, d);
}, Qe = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8;
}, gn = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8, n[r + 2] |= t >> 16;
}, os = function(n, e) {
  for (var t = [], r = 0; r < n.length; ++r)
    n[r] && t.push({ s: r, f: n[r] });
  var s = t.length, i = t.slice();
  if (!s)
    return { t: xa, l: 0 };
  if (s == 1) {
    var o = new ie(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(ae, de) {
    return ae.f - de.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], c = t[1], l = 0, h = 1, u = 2;
  for (t[0] = { s: -1, f: a.f + c.f, l: a, r: c }; h != s - 1; )
    a = t[t[l].f < t[u].f ? l++ : u++], c = t[l != h && t[l].f < t[u].f ? l++ : u++], t[h++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var d = i[0].s, r = 1; r < s; ++r)
    i[r].s > d && (d = i[r].s);
  var g = new be(d + 1), w = xs(t[h - 1], g, 0);
  if (w > e) {
    var r = 0, b = 0, $ = w - e, me = 1 << $;
    for (i.sort(function(de, Q) {
      return g[Q.s] - g[de.s] || de.f - Q.f;
    }); r < s; ++r) {
      var U = i[r].s;
      if (g[U] > e)
        b += me - (1 << w - g[U]), g[U] = e;
      else
        break;
    }
    for (b >>= $; b > 0; ) {
      var q = i[r].s;
      g[q] < e ? b -= 1 << e - g[q]++ - 1 : ++r;
    }
    for (; r >= 0 && b; --r) {
      var ue = i[r].s;
      g[ue] == e && (--g[ue], ++b);
    }
    w = e;
  }
  return { t: new ie(g), l: w };
}, xs = function(n, e, t) {
  return n.s == -1 ? Math.max(xs(n.l, e, t + 1), xs(n.r, e, t + 1)) : e[n.s] = t;
}, Gi = function(n) {
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
}, pn = function(n, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += n[r] * e[r];
  return t;
}, Sa = function(n, e, t) {
  var r = t.length, s = ni(e + 2);
  n[s] = r & 255, n[s + 1] = r >> 8, n[s + 2] = n[s] ^ 255, n[s + 3] = n[s + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    n[s + i + 4] = t[i];
  return (s + 4 + r) * 8;
}, qi = function(n, e, t, r, s, i, o, a, c, l, h) {
  Qe(e, h++, t), ++s[256];
  for (var u = os(s, 15), d = u.t, g = u.l, w = os(i, 15), b = w.t, $ = w.l, me = Gi(d), U = me.c, q = me.n, ue = Gi(b), ae = ue.c, de = ue.n, Q = new be(19), R = 0; R < U.length; ++R)
    ++Q[U[R] & 31];
  for (var R = 0; R < ae.length; ++R)
    ++Q[ae[R] & 31];
  for (var C = os(Q, 7), ee = C.t, z = C.l, ce = 19; ce > 4 && !ee[ks[ce - 1]]; --ce)
    ;
  var it = l + 5 << 3, ye = pn(s, _t) + pn(i, $n) + o, fe = pn(s, d) + pn(i, b) + o + 14 + 3 * ce + pn(Q, ee) + 2 * Q[16] + 3 * Q[17] + 7 * Q[18];
  if (c >= 0 && it <= ye && it <= fe)
    return Sa(e, h, n.subarray(c, c + l));
  var te, F, ge, ne;
  if (Qe(e, h, 1 + (fe < ye)), h += 2, fe < ye) {
    te = We(d, g, 0), F = d, ge = We(b, $, 0), ne = b;
    var un = We(ee, z, 0);
    Qe(e, h, q - 257), Qe(e, h + 5, de - 1), Qe(e, h + 10, ce - 4), h += 14;
    for (var R = 0; R < ce; ++R)
      Qe(e, h + 3 * R, ee[ks[R]]);
    h += 3 * ce;
    for (var Ie = [U, ae], Ye = 0; Ye < 2; ++Ye)
      for (var we = Ie[Ye], R = 0; R < we.length; ++R) {
        var _e = we[R] & 31;
        Qe(e, h, un[_e]), h += ee[_e], _e > 15 && (Qe(e, h, we[R] >> 5 & 127), h += we[R] >> 12);
      }
  } else
    te = Su, F = _t, ge = Iu, ne = $n;
  for (var R = 0; R < a; ++R) {
    var B = r[R];
    if (B > 255) {
      var _e = B >> 18 & 31;
      gn(e, h, te[_e + 257]), h += F[_e + 257], _e > 7 && (Qe(e, h, B >> 23 & 31), h += Zr[_e]);
      var Ue = B & 31;
      gn(e, h, ge[Ue]), h += ne[Ue], Ue > 3 && (gn(e, h, B >> 5 & 8191), h += Fr[Ue]);
    } else
      gn(e, h, te[B]), h += F[B];
  }
  return gn(e, h, te[256]), h + F[256];
}, Tu = /* @__PURE__ */ new ti([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), xa = /* @__PURE__ */ new ie(0), Ou = function(n, e, t, r, s, i) {
  var o = i.z || n.length, a = new ie(r + o + 5 * (1 + Math.ceil(o / 7e3)) + s), c = a.subarray(r, a.length - s), l = i.l, h = (i.r || 0) & 7;
  if (e) {
    h && (c[0] = i.r >> 3);
    for (var u = Tu[e - 1], d = u >> 13, g = u & 8191, w = (1 << t) - 1, b = i.p || new be(32768), $ = i.h || new be(w + 1), me = Math.ceil(t / 3), U = 2 * me, q = function(Br) {
      return (n[Br] ^ n[Br + 1] << me ^ n[Br + 2] << U) & w;
    }, ue = new ti(25e3), ae = new be(288), de = new be(32), Q = 0, R = 0, C = i.i || 0, ee = 0, z = i.w || 0, ce = 0; C + 2 < o; ++C) {
      var it = q(C), ye = C & 32767, fe = $[it];
      if (b[ye] = fe, $[it] = ye, z <= C) {
        var te = o - C;
        if ((Q > 7e3 || ee > 24576) && (te > 423 || !l)) {
          h = qi(n, c, 0, ue, ae, de, R, ee, ce, C - ce, h), ee = Q = R = 0, ce = C;
          for (var F = 0; F < 286; ++F)
            ae[F] = 0;
          for (var F = 0; F < 30; ++F)
            de[F] = 0;
        }
        var ge = 2, ne = 0, un = g, Ie = ye - fe & 32767;
        if (te > 2 && it == q(C - Ie))
          for (var Ye = Math.min(d, te) - 1, we = Math.min(32767, C), _e = Math.min(258, te); Ie <= we && --un && ye != fe; ) {
            if (n[C + ge] == n[C + ge - Ie]) {
              for (var B = 0; B < _e && n[C + B] == n[C + B - Ie]; ++B)
                ;
              if (B > ge) {
                if (ge = B, ne = Ie, B > Ye)
                  break;
                for (var Ue = Math.min(Ie, B - 2), Lt = 0, F = 0; F < Ue; ++F) {
                  var Mt = C - Ie + F & 32767, zn = b[Mt], Pn = Mt - zn & 32767;
                  Pn > Lt && (Lt = Pn, fe = Mt);
                }
              }
            }
            ye = fe, fe = b[ye], Ie += ye - fe & 32767;
          }
        if (ne) {
          ue[ee++] = 268435456 | bs[ge] << 18 | Ji[ne];
          var dn = bs[ge] & 31, fn = Ji[ne] & 31;
          R += Zr[dn] + Fr[fn], ++ae[257 + dn], ++de[fn], z = C + ge, ++Q;
        } else
          ue[ee++] = n[C], ++ae[n[C]];
      }
    }
    for (C = Math.max(C, z); C < o; ++C)
      ue[ee++] = n[C], ++ae[n[C]];
    h = qi(n, c, l, ue, ae, de, R, ee, ce, C - ce, h), l || (i.r = h & 7 | c[h / 8 | 0] << 3, h -= 7, i.h = $, i.p = b, i.i = C, i.w = z);
  } else {
    for (var C = i.w || 0; C < o + l; C += 65535) {
      var Rt = C + 65535;
      Rt >= o && (c[h / 8 | 0] = l, Rt = o), h = Sa(c, h + 1, n.subarray(C, Rt));
    }
    i.i = o;
  }
  return ba(a, 0, r + ni(h) + s);
}, Du = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Nu = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, r = 0; r < e.length; ++r)
        t = Du[t & 255 ^ e[r]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Lu = function(n, e, t, r, s) {
  if (!s && (s = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), o = new ie(i.length + n.length);
    o.set(i), o.set(n, i.length), n = o, s.w = i.length;
  }
  return Ou(n, e.level == null ? 6 : e.level, e.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, r, s);
}, Is = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Mu = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Is(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      n[r + 10] = t.charCodeAt(r);
  }
}, Ru = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Re(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !n[t++])
    ;
  return t + (e & 2);
}, $u = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, Vu = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Uu(n, e) {
  e || (e = {});
  var t = Nu(), r = n.length;
  t.p(n);
  var s = Lu(n, e, Vu(e), 8), i = s.length;
  return Mu(s, e), Is(s, i - 8, t.d()), Is(s, i - 4, r), s;
}
function ju(n, e) {
  var t = Ru(n);
  return t + 8 > n.length && Re(6, "invalid gzip data"), Au(n.subarray(t, -8), { i: 2 }, new ie($u(n)), e);
}
var Zu = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Fu = 0;
try {
  Zu.decode(xa, { stream: !0 }), Fu = 1;
} catch {
}
const Bu = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Kt(n, e, t) {
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
      return e.slice(0, o) + Kt(n.slice(o), e.slice(o), t);
  }
  const s = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - s > 1) {
    const o = Math.round(0.5 * (s + i));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[s] + Kt(n.slice(1), null, t);
}
function Ia(n) {
  if (n.length !== Ca(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function Ca(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function wn(n) {
  const e = Ca(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Hi(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = wn(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Yi(n, e) {
  Ia(n);
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
function Ku(n, e) {
  Ia(n);
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
function Vt(n, e, t = Bu) {
  if (n != null && Hi(n, t), e != null && Hi(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = wn(e), l = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Kt("", l, t);
    if (c < e)
      return c;
    const h = Ku(c, t);
    if (h == null)
      throw new Error("cannot decrement any more");
    return h;
  }
  if (e == null) {
    const c = wn(n), l = n.slice(c.length), h = Yi(c, t);
    return h ?? c + Kt(l, null, t);
  }
  const r = wn(n), s = n.slice(r.length), i = wn(e), o = e.slice(i.length);
  if (r === i)
    return r + Kt(s, o, t);
  const a = Yi(r, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : r + Kt(s, null, t);
}
const zu = ya(), Xi = ya().min(1), mn = ku().int().nonnegative().optional();
var Fe, I, Vn, bt, et, qt, pe, lt, ht, Be, Ke, xr, St, ut, xt, f, Zt, _n, Ze, nr, Cs, Ea, Aa, Ee, kt, Ft, vn, Bt, kn, rr, Ta, Es, Oa, As, Ts, L, Da, Os, Na;
const Sn = class Sn {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  /**** constructor — initialise store from document and options ****/
  constructor(e, t) {
    re(this, f);
    /**** private state ****/
    re(this, Fe);
    re(this, I);
    re(this, Vn);
    re(this, bt);
    re(this, et, null);
    re(this, qt, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    re(this, pe, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId  (kept in sync with #ReverseIndex)
    re(this, lt, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    re(this, ht, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    re(this, Be, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    re(this, Ke, /* @__PURE__ */ new Map());
    re(this, xr, Ra);
    // transaction nesting
    re(this, St, 0);
    // ChangeSet accumulator inside a transaction
    re(this, ut, {});
    // suppress index updates / change tracking when applying remote patches
    re(this, xt, !1);
    var r;
    if (Ne(this, Fe, e), Ne(this, I, e.getMap("Entries")), Ne(this, Vn, (t == null ? void 0 : t.LiteralSizeLimit) ?? $a), Ne(this, bt, (t == null ? void 0 : t.TrashTTLms) ?? null), p(this, f, Ea).call(this), m(this, bt) != null) {
      const s = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(m(this, bt) / 4), 36e5);
      Ne(this, et, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        s
      )), typeof ((r = m(this, et)) == null ? void 0 : r.unref) == "function" && m(this, et).unref();
    }
  }
  /**** fromScratch — build initial document with three well-known notes ****/
  static fromScratch(e) {
    const t = new Ct(), r = t.getMap("Entries");
    return t.transact(() => {
      const s = new D();
      s.set("Kind", "note"), s.set("outerNoteId", ""), s.set("OrderKey", ""), s.set("Label", new Z()), s.set("Info", new D()), s.set("MIMEType", ""), s.set("ValueKind", "none"), r.set(Le, s);
      const i = new D();
      i.set("Kind", "note"), i.set("outerNoteId", Le), i.set("OrderKey", "a0"), i.set("Label", new Z("trash")), i.set("Info", new D()), i.set("MIMEType", ""), i.set("ValueKind", "none"), r.set(P, i);
      const o = new D();
      o.set("Kind", "note"), o.set("outerNoteId", Le), o.set("OrderKey", "a1"), o.set("Label", new Z("lost-and-found")), o.set("Info", new D()), o.set("MIMEType", ""), o.set("ValueKind", "none"), r.set(Ce, o);
    }), new Sn(t, e);
  }
  /**** fromBinary — restore store from compressed update ****/
  static fromBinary(e, t) {
    const r = new Ct();
    return vi(r, ju(e)), new Sn(r, t);
  }
  /**** fromJSON — restore store from base64-encoded data ****/
  static fromJSON(e, t) {
    let r;
    return typeof Buffer < "u" ? r = new Uint8Array(Buffer.from(String(e), "base64")) : r = Uint8Array.from(atob(String(e)), (s) => s.charCodeAt(0)), Sn.fromBinary(r, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  /**** RootNote / TrashNote / LostAndFoundNote — access system notes ****/
  get RootNote() {
    return p(this, f, Ze).call(this, Le);
  }
  get TrashNote() {
    return p(this, f, Ze).call(this, P);
  }
  get LostAndFoundNote() {
    return p(this, f, Ze).call(this, Ce);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve entry by ID ****/
  EntryWithId(e) {
    if (m(this, I).has(e))
      return p(this, f, _n).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newNoteAt — create note as inner note of outer note ****/
  newNoteAt(e, t, r) {
    const s = t ?? Jn;
    if (!Xi.safeParse(s).success)
      throw new se("invalid-argument", "MIMEType must be a non-empty string");
    mn.parse(r), p(this, f, Zt).call(this, e.Id);
    const i = crypto.randomUUID(), o = p(this, f, Bt).call(this, e.Id, r), a = s === Jn ? "" : s;
    return this.transact(() => {
      const c = new D();
      c.set("Kind", "note"), c.set("outerNoteId", e.Id), c.set("OrderKey", o), c.set("Label", new Z()), c.set("Info", new D()), c.set("MIMEType", a), c.set("ValueKind", "none"), m(this, I).set(i, c), p(this, f, Ee).call(this, e.Id, i), p(this, f, L).call(this, e.Id, "innerEntryList"), p(this, f, L).call(this, i, "outerNote");
    }), p(this, f, Ze).call(this, i);
  }
  /**** newLinkAt — create link as inner link of outer note ****/
  newLinkAt(e, t, r) {
    mn.parse(r), p(this, f, Zt).call(this, e.Id), p(this, f, Zt).call(this, t.Id);
    const s = crypto.randomUUID(), i = p(this, f, Bt).call(this, t.Id, r);
    return this.transact(() => {
      const o = new D();
      o.set("Kind", "link"), o.set("outerNoteId", t.Id), o.set("OrderKey", i), o.set("Label", new Z()), o.set("Info", new D()), o.set("TargetId", e.Id), m(this, I).set(s, o), p(this, f, Ee).call(this, t.Id, s), p(this, f, Ft).call(this, e.Id, s), p(this, f, L).call(this, t.Id, "innerEntryList"), p(this, f, L).call(this, s, "outerNote");
    }), p(this, f, nr).call(this, s);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeNoteInto — import note subtree with remapped IDs ****/
  deserializeNoteInto(e, t, r) {
    if (mn.parse(r), p(this, f, Zt).call(this, t.Id), e == null)
      throw new se("invalid-argument", "Serialisation must not be null");
    const s = e, i = Object.keys(s.Entries ?? {});
    if (i.length === 0)
      throw new se("invalid-argument", "empty serialisation");
    const o = i[0], a = crypto.randomUUID(), c = /* @__PURE__ */ new Map([[o, a]]);
    for (const h of i)
      c.has(h) || c.set(h, crypto.randomUUID());
    const l = p(this, f, Bt).call(this, t.Id, r);
    return this.transact(() => {
      var h, u;
      for (const d of i) {
        const g = s.Entries[d], w = c.get(d), b = d === o, $ = b ? t.Id : ((h = g.outerPlacement) == null ? void 0 : h.outerNoteId) != null ? c.get(g.outerPlacement.outerNoteId) ?? t.Id : void 0, me = b ? l : ((u = g.outerPlacement) == null ? void 0 : u.OrderKey) ?? "", U = new D();
        U.set("Kind", g.Kind), U.set("Label", new Z(g.Label ?? "")), U.set("Info", new D()), $ != null ? (U.set("outerNoteId", $), U.set("OrderKey", me)) : (U.set("outerNoteId", ""), U.set("OrderKey", "")), g.Kind === "note" ? (U.set("MIMEType", g.MIMEType ?? ""), U.set("ValueKind", "none")) : U.set(
          "TargetId",
          g.TargetId != null ? c.get(g.TargetId) ?? g.TargetId : ""
        ), m(this, I).set(w, U), $ && p(this, f, Ee).call(this, $, w), g.Kind === "link" && g.TargetId != null && p(this, f, Ft).call(this, c.get(g.TargetId) ?? g.TargetId, w);
      }
      p(this, f, L).call(this, t.Id, "innerEntryList");
    }), p(this, f, Ze).call(this, a);
  }
  /**** deserializeLinkInto — import link with remapped target ID ****/
  deserializeLinkInto(e, t, r) {
    if (mn.parse(r), p(this, f, Zt).call(this, t.Id), e == null)
      throw new se("invalid-argument", "Serialisation must not be null");
    const s = e, i = Object.keys(s.Entries ?? {});
    if (i.length === 0)
      throw new se("invalid-argument", "empty serialisation");
    const o = s.Entries[i[0]];
    if (o.Kind !== "link")
      throw new se("invalid-argument", "serialisation is not a link");
    const a = crypto.randomUUID(), c = p(this, f, Bt).call(this, t.Id, r);
    return this.transact(() => {
      const l = new D();
      l.set("Kind", "link"), l.set("outerNoteId", t.Id), l.set("OrderKey", c), l.set("Label", new Z(o.Label ?? "")), l.set("Info", new D()), l.set("TargetId", o.TargetId ?? ""), m(this, I).set(a, l), p(this, f, Ee).call(this, t.Id, a), o.TargetId && p(this, f, Ft).call(this, o.TargetId, a), p(this, f, L).call(this, t.Id, "innerEntryList");
    }), p(this, f, nr).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** EntryMayBeMovedTo — check if entry can move to new outer note ****/
  EntryMayBeMovedTo(e, t, r) {
    return e.mayBeMovedTo(t, r);
  }
  /**** moveEntryTo — move entry to new outer note and position ****/
  moveEntryTo(e, t, r) {
    if (mn.parse(r), !this._mayMoveEntryTo(e.Id, t.Id, r))
      throw new se(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const s = this._outerNoteIdOf(e.Id), i = p(this, f, Bt).call(this, t.Id, r);
    this.transact(() => {
      const o = m(this, I).get(e.Id);
      if (o.set("outerNoteId", t.Id), o.set("OrderKey", i), s === P && t.Id !== P) {
        const a = o.get("Info");
        a instanceof D && a.has("_trashedAt") && (a.delete("_trashedAt"), p(this, f, L).call(this, e.Id, "Info._trashedAt"));
      }
      s != null && (p(this, f, kt).call(this, s, e.Id), p(this, f, L).call(this, s, "innerEntryList")), p(this, f, Ee).call(this, t.Id, e.Id), p(this, f, L).call(this, t.Id, "innerEntryList"), p(this, f, L).call(this, e.Id, "outerNote");
    });
  }
  /**** EntryMayBeDeleted — check if entry can be deleted ****/
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new se("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), r = Vt(p(this, f, kn).call(this, P), null);
    this.transact(() => {
      const s = m(this, I).get(e.Id);
      s.set("outerNoteId", P), s.set("OrderKey", r);
      let i = s.get("Info");
      i instanceof D || (i = new D(), s.set("Info", i)), i.set("_trashedAt", Date.now()), t != null && (p(this, f, kt).call(this, t, e.Id), p(this, f, L).call(this, t, "innerEntryList")), p(this, f, Ee).call(this, P, e.Id), p(this, f, L).call(this, P, "innerEntryList"), p(this, f, L).call(this, e.Id, "outerNote"), p(this, f, L).call(this, e.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry and subtree ****/
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== P)
      throw new se(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (p(this, f, Ta).call(this, e.Id))
      throw new se(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      p(this, f, Ts).call(this, e.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — remove trash items past TTL ****/
  purgeExpiredTrashEntries(e) {
    const t = e ?? m(this, bt);
    if (t == null)
      return 0;
    const r = Date.now(), s = Array.from(m(this, pe).get(P) ?? /* @__PURE__ */ new Set());
    let i = 0;
    for (const o of s) {
      const a = m(this, I).get(o);
      if (a == null || a.get("outerNoteId") !== P)
        continue;
      const c = a.get("Info"), l = c instanceof D ? c.get("_trashedAt") : void 0;
      if (typeof l == "number" && !(r - l < t))
        try {
          this.purgeEntry(p(this, f, _n).call(this, o)), i++;
        } catch {
        }
    }
    return i;
  }
  /**** dispose — cleanup trash timer ****/
  dispose() {
    m(this, et) != null && (clearInterval(m(this, et)), Ne(this, et, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback in batched transaction ****/
  transact(e) {
    zr(this, St)._++;
    try {
      m(this, St) === 1 && !m(this, xt) ? m(this, Fe).transact(() => {
        e();
      }) : e();
    } finally {
      if (zr(this, St)._--, m(this, St) === 0) {
        const t = { ...m(this, ut) };
        Ne(this, ut, {});
        const r = m(this, xt) ? "external" : "internal";
        p(this, f, Da).call(this, r, t);
      }
    }
  }
  /**** onChangeInvoke — subscribe to change events ****/
  onChangeInvoke(e) {
    return m(this, qt).add(e), () => {
      m(this, qt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — apply remote changes and update indices ****/
  applyRemotePatch(e) {
    Ne(this, xt, !0);
    try {
      vi(m(this, Fe), e), this.transact(() => {
        p(this, f, Aa).call(this);
      });
    } finally {
      Ne(this, xt, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get state vector for sync ****/
  get currentCursor() {
    return Jl(m(this, Fe));
  }
  /**** exportPatch — encode changes since cursor ****/
  exportPatch(e) {
    return e == null || e.byteLength === 0 ? Qr(m(this, Fe)) : Qr(m(this, Fe), e);
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const e = new Set(m(this, I).keys());
    this.transact(() => {
      m(this, I).forEach((t, r) => {
        if (r === Le)
          return;
        const s = t.get("outerNoteId");
        if (s && !e.has(s)) {
          const i = Vt(p(this, f, kn).call(this, Ce), null);
          t.set("outerNoteId", Ce), t.set("OrderKey", i), p(this, f, Ee).call(this, Ce, r), p(this, f, L).call(this, r, "outerNote"), p(this, f, L).call(this, Ce, "innerEntryList");
        }
        if (t.get("Kind") === "link") {
          const i = t.get("TargetId");
          if (i && !e.has(i)) {
            const o = Vt(p(this, f, kn).call(this, Ce), null), a = new D();
            a.set("Kind", "note"), a.set("outerNoteId", Ce), a.set("OrderKey", o), a.set("Label", new Z()), a.set("Info", new D()), a.set("MIMEType", ""), a.set("ValueKind", "none"), m(this, I).set(i, a), p(this, f, Ee).call(this, Ce, i), e.add(i), p(this, f, L).call(this, Ce, "innerEntryList");
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
    return Uu(Qr(m(this, Fe)));
  }
  /**** asJSON — export as base64-encoded compressed update ****/
  asJSON() {
    const e = this.asBinary();
    if (typeof Buffer < "u")
      return Buffer.from(e).toString("base64");
    let t = "";
    for (let r = 0; r < e.byteLength; r++)
      t += String.fromCharCode(e[r]);
    return btoa(t);
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SNS_Entry / Note / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind ****/
  _KindOf(e) {
    const t = m(this, I).get(e);
    if (t == null)
      throw new se("not-found", `entry '${e}' not found`);
    return t.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(e) {
    const t = m(this, I).get(e);
    if (t == null)
      return "";
    const r = t.get("Label");
    return r instanceof Z ? r.toString() : String(r ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(e, t) {
    zu.parse(t), this.transact(() => {
      const r = m(this, I).get(e);
      if (r == null)
        return;
      let s = r.get("Label");
      s instanceof Z ? (s.delete(0, s.length), t.length > 0 && s.insert(0, t)) : (s = new Z(t), r.set("Label", s)), p(this, f, L).call(this, e, "Label");
    });
  }
  /**** _TypeOf — get note MIME type ****/
  _TypeOf(e) {
    const t = m(this, I).get(e), r = (t == null ? void 0 : t.get("MIMEType")) ?? "";
    return r === "" ? Jn : r;
  }
  /**** _setTypeOf — set note MIME type ****/
  _setTypeOf(e, t) {
    Xi.parse(t);
    const r = t === Jn ? "" : t;
    this.transact(() => {
      var s;
      (s = m(this, I).get(e)) == null || s.set("MIMEType", r), p(this, f, L).call(this, e, "Type");
    });
  }
  /**** _ValueKindOf — get note value kind ****/
  _ValueKindOf(e) {
    const t = m(this, I).get(e);
    return (t == null ? void 0 : t.get("ValueKind")) ?? "none";
  }
  /**** _isLiteralOf — check if note has literal value ****/
  _isLiteralOf(e) {
    const t = this._ValueKindOf(e);
    return t === "literal" || t === "literal-reference";
  }
  /**** _isBinaryOf — check if note has binary value ****/
  _isBinaryOf(e) {
    const t = this._ValueKindOf(e);
    return t === "binary" || t === "binary-reference";
  }
  /**** _readValueOf — get note value (literal or binary) ****/
  async _readValueOf(e) {
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal": {
        const r = m(this, I).get(e), s = r == null ? void 0 : r.get("literalValue");
        return s instanceof Z ? s.toString() : s ?? "";
      }
      case t === "binary": {
        const r = m(this, I).get(e);
        return r == null ? void 0 : r.get("binaryValue");
      }
      default:
        throw new se(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  /**** _writeValueOf — set note value ****/
  _writeValueOf(e, t) {
    this.transact(() => {
      const r = m(this, I).get(e);
      if (r != null) {
        switch (!0) {
          case t == null: {
            r.set("ValueKind", "none");
            break;
          }
          case (typeof t == "string" && t.length <= m(this, Vn)): {
            r.set("ValueKind", "literal");
            let s = r.get("literalValue");
            s instanceof Z ? (s.delete(0, s.length), t.length > 0 && s.insert(0, t)) : (s = new Z(t), r.set("literalValue", s));
            break;
          }
          case typeof t == "string": {
            const i = new TextEncoder().encode(t), o = `sha256-size-${i.byteLength}`;
            r.set("ValueKind", "literal-reference"), r.set("ValueRef", { Hash: o, Size: i.byteLength });
            break;
          }
          case t.byteLength <= Va: {
            r.set("ValueKind", "binary"), r.set("binaryValue", t);
            break;
          }
          default: {
            const s = t, i = `sha256-size-${s.byteLength}`;
            r.set("ValueKind", "binary-reference"), r.set("ValueRef", { Hash: i, Size: s.byteLength });
            break;
          }
        }
        p(this, f, L).call(this, e, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value range ****/
  _spliceValueOf(e, t, r, s) {
    if (this._ValueKindOf(e) !== "literal")
      throw new se(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const i = m(this, I).get(e), o = i == null ? void 0 : i.get("literalValue");
      if (o instanceof Z) {
        const a = r - t;
        a > 0 && o.delete(t, a), s.length > 0 && o.insert(t, s);
      }
      p(this, f, L).call(this, e, "Value");
    });
  }
  /**** _InfoProxyOf — get info metadata proxy object ****/
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(r, s) {
        if (typeof s != "string")
          return;
        const i = m(t, I).get(e), o = i == null ? void 0 : i.get("Info");
        return o instanceof D ? o.get(s) : void 0;
      },
      set(r, s, i) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var c;
          const o = m(t, I).get(e);
          if (o == null)
            return;
          let a = o.get("Info");
          a instanceof D || (a = new D(), o.set("Info", a)), a.set(s, i), p(c = t, f, L).call(c, e, `Info.${s}`);
        }), !0);
      },
      deleteProperty(r, s) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var a;
          const i = m(t, I).get(e), o = i == null ? void 0 : i.get("Info");
          o instanceof D && o.delete(s), p(a = t, f, L).call(a, e, `Info.${s}`);
        }), !0);
      },
      ownKeys() {
        const r = m(t, I).get(e), s = r == null ? void 0 : r.get("Info");
        return s instanceof D ? Array.from(s.keys()) : [];
      },
      getOwnPropertyDescriptor(r, s) {
        if (typeof s != "string")
          return;
        const i = m(t, I).get(e), o = i == null ? void 0 : i.get("Info");
        if (!(o instanceof D))
          return;
        const a = o.get(s);
        return a !== void 0 ? { configurable: !0, enumerable: !0, value: a } : void 0;
      }
    });
  }
  /**** _outerNoteOf — get outer note ****/
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? p(this, f, Ze).call(this, t) : void 0;
  }
  /**** _outerNoteIdOf — get outer note ID ****/
  _outerNoteIdOf(e) {
    const t = m(this, I).get(e), r = t == null ? void 0 : t.get("outerNoteId");
    return r != null && r !== "" ? r : void 0;
  }
  /**** _outerNotesOf — get ancestor chain ****/
  _outerNotesOf(e) {
    const t = [];
    let r = this._outerNoteIdOf(e);
    for (; r != null && (t.push(p(this, f, Ze).call(this, r)), r !== Le); )
      r = this._outerNoteIdOf(r);
    return t;
  }
  /**** _outerNoteIdsOf — get ancestor IDs ****/
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  /**** _innerEntriesOf — get sorted children as array-like proxy ****/
  _innerEntriesOf(e) {
    const t = this, r = p(this, f, rr).call(this, e);
    return new Proxy([], {
      get(s, i) {
        var o;
        if (i === "length")
          return r.length;
        if (i === Symbol.iterator)
          return function* () {
            var a;
            for (let c = 0; c < r.length; c++)
              yield p(a = t, f, _n).call(a, r[c].Id);
          };
        if (typeof i == "string" && !isNaN(Number(i))) {
          const a = Number(i);
          return a >= 0 && a < r.length ? p(o = t, f, _n).call(o, r[a].Id) : void 0;
        }
        return s[i];
      }
    });
  }
  /**** _mayMoveEntryTo — check move validity ****/
  _mayMoveEntryTo(e, t, r) {
    return e === Le || e === t ? !1 : e === P || e === Ce ? t === Le : !p(this, f, Na).call(this, t, e);
  }
  /**** _mayDeleteEntry — check delete validity ****/
  _mayDeleteEntry(e) {
    return e !== Le && e !== P && e !== Ce;
  }
  /**** _TargetOf — get link target note ****/
  _TargetOf(e) {
    const t = m(this, I).get(e), r = t == null ? void 0 : t.get("TargetId");
    if (!r)
      throw new se("not-found", `link '${e}' has no target`);
    return p(this, f, Ze).call(this, r);
  }
  /**** _EntryAsJSON — serialize entry and subtree ****/
  _EntryAsJSON(e) {
    if (!m(this, I).has(e))
      throw new se("not-found", `entry '${e}' not found`);
    const t = {};
    return p(this, f, Os).call(this, e, t), { Entries: t };
  }
};
Fe = new WeakMap(), I = new WeakMap(), Vn = new WeakMap(), bt = new WeakMap(), et = new WeakMap(), qt = new WeakMap(), pe = new WeakMap(), lt = new WeakMap(), ht = new WeakMap(), Be = new WeakMap(), Ke = new WeakMap(), xr = new WeakMap(), St = new WeakMap(), ut = new WeakMap(), xt = new WeakMap(), f = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #requireNoteExists — throw if note does not exist ****/
Zt = function(e) {
  const t = m(this, I).get(e);
  if (t == null || t.get("Kind") !== "note")
    throw new se("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink — return cached wrapper objects ****/
_n = function(e) {
  const t = m(this, I).get(e);
  if (t == null)
    throw new se("invalid-argument", `entry '${e}' not found`);
  return t.get("Kind") === "note" ? p(this, f, Ze).call(this, e) : p(this, f, nr).call(this, e);
}, /**** #wrapNote — return or create cached wrapper for note ****/
Ze = function(e) {
  const t = m(this, Ke).get(e);
  if (t instanceof si)
    return t;
  const r = new si(this, e);
  return p(this, f, Cs).call(this, e, r), r;
}, /**** #wrapLink — return or create cached wrapper for link ****/
nr = function(e) {
  const t = m(this, Ke).get(e);
  if (t instanceof ii)
    return t;
  const r = new ii(this, e);
  return p(this, f, Cs).call(this, e, r), r;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
Cs = function(e, t) {
  if (m(this, Ke).size >= m(this, xr)) {
    const r = m(this, Ke).keys().next().value;
    r != null && m(this, Ke).delete(r);
  }
  m(this, Ke).set(e, t);
}, /**** #rebuildIndices — full rebuild used during construction ****/
Ea = function() {
  m(this, pe).clear(), m(this, lt).clear(), m(this, ht).clear(), m(this, Be).clear(), m(this, I).forEach((e, t) => {
    const r = e.get("outerNoteId");
    if (r && p(this, f, Ee).call(this, r, t), e.get("Kind") === "link") {
      const s = e.get("TargetId");
      s && p(this, f, Ft).call(this, s, t);
    }
  });
}, /**** #updateIndicesFromView — incremental diff after remote patches ****/
Aa = function() {
  const e = /* @__PURE__ */ new Set();
  m(this, I).forEach((s, i) => {
    e.add(i);
    const o = s.get("outerNoteId") || void 0, a = m(this, lt).get(i);
    if (o !== a && (a != null && (p(this, f, kt).call(this, a, i), p(this, f, L).call(this, a, "innerEntryList")), o != null && (p(this, f, Ee).call(this, o, i), p(this, f, L).call(this, o, "innerEntryList")), p(this, f, L).call(this, i, "outerNote")), s.get("Kind") === "link") {
      const c = s.get("TargetId"), l = m(this, Be).get(i);
      c !== l && (l != null && p(this, f, vn).call(this, l, i), c != null && p(this, f, Ft).call(this, c, i));
    } else m(this, Be).has(i) && p(this, f, vn).call(this, m(this, Be).get(i), i);
    p(this, f, L).call(this, i, "Label");
  });
  const t = Array.from(m(this, lt).entries()).filter(([s]) => !e.has(s));
  for (const [s, i] of t)
    p(this, f, kt).call(this, i, s), p(this, f, L).call(this, i, "innerEntryList");
  const r = Array.from(m(this, Be).entries()).filter(([s]) => !e.has(s));
  for (const [s, i] of r)
    p(this, f, vn).call(this, i, s);
}, /**** #addToReverseIndex — add entry to reverse index ****/
Ee = function(e, t) {
  let r = m(this, pe).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), m(this, pe).set(e, r)), r.add(t), m(this, lt).set(t, e);
}, /**** #removeFromReverseIndex — remove entry from reverse index ****/
kt = function(e, t) {
  var r;
  (r = m(this, pe).get(e)) == null || r.delete(t), m(this, lt).delete(t);
}, /**** #addToLinkTargetIndex — add link to target index ****/
Ft = function(e, t) {
  let r = m(this, ht).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), m(this, ht).set(e, r)), r.add(t), m(this, Be).set(t, e);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
vn = function(e, t) {
  var r;
  (r = m(this, ht).get(e)) == null || r.delete(t), m(this, Be).delete(t);
}, /**** #orderKeyAt — generate fractional key at insertion position ****/
Bt = function(e, t) {
  const r = p(this, f, rr).call(this, e);
  if (r.length === 0 || t == null) {
    const a = r.length > 0 ? r[r.length - 1].OrderKey : null;
    return Vt(a, null);
  }
  const s = Math.max(0, Math.min(t, r.length)), i = s > 0 ? r[s - 1].OrderKey : null, o = s < r.length ? r[s].OrderKey : null;
  return Vt(i, o);
}, /**** #lastOrderKeyOf — get last inner entry's order key ****/
kn = function(e) {
  const t = p(this, f, rr).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/
rr = function(e) {
  const t = m(this, pe).get(e) ?? /* @__PURE__ */ new Set(), r = [];
  for (const s of t) {
    const i = m(this, I).get(s);
    (i == null ? void 0 : i.get("outerNoteId")) === e && r.push({ Id: s, OrderKey: i.get("OrderKey") ?? "" });
  }
  return r.sort((s, i) => s.OrderKey < i.OrderKey ? -1 : s.OrderKey > i.OrderKey ? 1 : s.Id < i.Id ? -1 : s.Id > i.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
Ta = function(e) {
  const t = p(this, f, As).call(this), r = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const i of m(this, pe).get(P) ?? /* @__PURE__ */ new Set())
      r.has(i) || p(this, f, Es).call(this, i, t, r) && (r.add(i), s = !0);
  }
  return r.has(e);
}, /**** #subtreeHasIncomingLinks — check if subtree has root-reachable links ****/
Es = function(e, t, r) {
  const s = [e], i = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const o = s.pop();
    if (i.has(o))
      continue;
    i.add(o);
    const a = m(this, ht).get(o) ?? /* @__PURE__ */ new Set();
    for (const c of a) {
      if (t.has(c))
        return !0;
      const l = p(this, f, Oa).call(this, c);
      if (l != null && r.has(l))
        return !0;
    }
    for (const c of m(this, pe).get(o) ?? /* @__PURE__ */ new Set())
      i.has(c) || s.push(c);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashNote containing entry ****/
Oa = function(e) {
  let t = e;
  for (; t != null; ) {
    const r = this._outerNoteIdOf(t);
    if (r === P)
      return t;
    if (r === Le || r == null)
      return null;
    t = r;
  }
  return null;
}, /**** #reachableFromRoot — get all entries reachable from root ****/
As = function() {
  const e = /* @__PURE__ */ new Set(), t = [Le];
  for (; t.length > 0; ) {
    const r = t.pop();
    if (!e.has(r)) {
      e.add(r);
      for (const s of m(this, pe).get(r) ?? /* @__PURE__ */ new Set())
        e.has(s) || t.push(s);
    }
  }
  return e;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Ts = function(e) {
  const t = m(this, I).get(e);
  if (t == null)
    return;
  const r = t.get("Kind"), s = t.get("outerNoteId"), i = p(this, f, As).call(this), o = /* @__PURE__ */ new Set(), a = Array.from(m(this, pe).get(e) ?? /* @__PURE__ */ new Set());
  for (const c of a)
    if (p(this, f, Es).call(this, c, i, o)) {
      const l = m(this, I).get(c), h = Vt(p(this, f, kn).call(this, P), null);
      l.set("outerNoteId", P), l.set("OrderKey", h), p(this, f, kt).call(this, e, c), p(this, f, Ee).call(this, P, c), p(this, f, L).call(this, P, "innerEntryList"), p(this, f, L).call(this, c, "outerNote");
    } else
      p(this, f, Ts).call(this, c);
  if (m(this, I).delete(e), s && (p(this, f, kt).call(this, s, e), p(this, f, L).call(this, s, "innerEntryList")), r === "link") {
    const c = t.get("TargetId");
    c && p(this, f, vn).call(this, c, e);
  }
  m(this, Ke).delete(e);
}, /**** #recordChange — add property change to pending changeset ****/
L = function(e, t) {
  m(this, ut)[e] == null && (m(this, ut)[e] = /* @__PURE__ */ new Set()), m(this, ut)[e].add(t);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
Da = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const r of m(this, qt))
      try {
        r(e, t);
      } catch {
      }
}, /**** #collectSubtree — recursively serialize entry and descendants ****/
Os = function(e, t) {
  const r = m(this, I).get(e);
  if (r == null)
    return;
  const s = r.get("outerNoteId"), i = r.get("OrderKey"), o = r.get("Label"), a = r.get("Info"), c = {};
  a instanceof D && a.forEach((h, u) => {
    c[u] = h;
  });
  const l = {
    Kind: r.get("Kind"),
    Label: o instanceof Z ? o.toString() : String(o ?? ""),
    Info: c
  };
  if (s && i && (l.outerPlacement = { outerNoteId: s, OrderKey: i }), r.get("Kind") === "note") {
    l.MIMEType = r.get("MIMEType") ?? "", l.ValueKind = r.get("ValueKind") ?? "none";
    const h = r.get("literalValue");
    h instanceof Z && (l.literalValue = h.toString());
    const u = r.get("binaryValue");
    u instanceof Uint8Array && (l.binaryValue = u);
    const d = r.get("ValueRef");
    d != null && (l.ValueRef = d);
  } else
    l.TargetId = r.get("TargetId");
  t[e] = l;
  for (const h of m(this, pe).get(e) ?? /* @__PURE__ */ new Set())
    p(this, f, Os).call(this, h, t);
}, /**** #isDescendantOf — check ancestor relationship ****/
Na = function(e, t) {
  let r = e;
  for (; r != null; ) {
    if (r === t)
      return !0;
    r = this._outerNoteIdOf(r);
  }
  return !1;
};
let Qi = Sn;
export {
  qu as SNS_Entry,
  Hu as SNS_Error,
  Yu as SNS_Link,
  Xu as SNS_Note,
  Qi as SNS_NoteStore
};
