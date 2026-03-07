var vl = Object.defineProperty;
var vo = (n) => {
  throw TypeError(n);
};
var kl = (n, e, t) => e in n ? vl(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var gt = (n, e, t) => kl(n, typeof e != "symbol" ? e + "" : e, t), Qr = (n, e, t) => e.has(n) || vo("Cannot " + t);
var l = (n, e, t) => (Qr(n, e, "read from private field"), t ? t.call(n) : e.get(n)), v = (n, e, t) => e.has(n) ? vo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), x = (n, e, t, s) => (Qr(n, e, "write to private field"), s ? s.call(n, t) : e.set(n, t), t), f = (n, e, t) => (Qr(n, e, "access private method"), t);
var er = (n, e, t, s) => ({
  set _(r) {
    x(n, e, r, t);
  },
  get _() {
    return l(n, e, s);
  }
});
let le = class extends Error {
  constructor(t, s) {
    super(s);
    gt(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
};
const Ue = "00000000-0000-4000-8000-000000000000", G = "00000000-0000-4000-8000-000000000001", Ee = "00000000-0000-4000-8000-000000000002", tr = "text/plain", bl = 131072, Sl = 2048, xl = 5e3;
class xa {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  get isRootNote() {
    return this.Id === Ue;
  }
  get isTrashNote() {
    return this.Id === G;
  }
  get isLostAndFoundNote() {
    return this.Id === Ee;
  }
  get isNote() {
    return this._Store._KindOf(this.Id) === "note";
  }
  get isLink() {
    return this._Store._KindOf(this.Id) === "link";
  }
  //----------------------------------------------------------------------------//
  //                                 Hierarchy                                  //
  //----------------------------------------------------------------------------//
  get outerNote() {
    return this._Store._outerNoteOf(this.Id);
  }
  get outerNoteId() {
    return this._Store._outerNoteIdOf(this.Id);
  }
  get outerNotes() {
    return this._Store._outerNotesOf(this.Id);
  }
  get outerNoteIds() {
    return this._Store._outerNoteIdsOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                Description                                 //
  //----------------------------------------------------------------------------//
  get Label() {
    return this._Store._LabelOf(this.Id);
  }
  set Label(e) {
    this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  mayBeMovedTo(e, t) {
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  moveTo(e, t) {
    this._Store.moveEntryTo(this, e, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Delete                                    //
  //----------------------------------------------------------------------------//
  get mayBeDeleted() {
    return this._Store._mayDeleteEntry(this.Id);
  }
  delete() {
    this._Store.deleteEntry(this);
  }
  purge() {
    this._Store.purgeEntry(this);
  }
  //----------------------------------------------------------------------------//
  //                              Serialisation                                 //
  //----------------------------------------------------------------------------//
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
}
class ko extends xa {
  constructor(e, t) {
    super(e, t);
  }
  //----------------------------------------------------------------------------//
  //                               Type & Value                                 //
  //----------------------------------------------------------------------------//
  get Type() {
    return this._Store._TypeOf(this.Id);
  }
  set Type(e) {
    this._Store._setTypeOf(this.Id, e);
  }
  get ValueKind() {
    return this._Store._ValueKindOf(this.Id);
  }
  get isLiteral() {
    return this._Store._isLiteralOf(this.Id);
  }
  get isBinary() {
    return this._Store._isBinaryOf(this.Id);
  }
  /**** readValue — resolves inline values immediately, fetches blobs async ****/
  readValue() {
    return this._Store._readValueOf(this.Id);
  }
  /**** writeValue — chooses ValueKind automatically based on type/size ****/
  writeValue(e) {
    this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, s) {
    this._Store._spliceValueOf(this.Id, e, t, s);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class bo extends xa {
  constructor(e, t) {
    super(e, t);
  }
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
const qe = () => /* @__PURE__ */ new Map(), yi = (n) => {
  const e = qe();
  return n.forEach((t, s) => {
    e.set(s, t);
  }), e;
}, Gt = (n, e, t) => {
  let s = n.get(e);
  return s === void 0 && n.set(e, s = t()), s;
}, Cl = (n, e) => {
  const t = [];
  for (const [s, r] of n)
    t.push(e(r, s));
  return t;
}, Il = (n, e) => {
  for (const [t, s] of n)
    if (e(s, t))
      return !0;
  return !1;
}, Jn = () => /* @__PURE__ */ new Set(), ei = (n) => n[n.length - 1], El = (n, e) => {
  for (let t = 0; t < e.length; t++)
    n.push(e[t]);
}, Kt = Array.from, Wi = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (!e(n[t], t, n))
      return !1;
  return !0;
}, Ca = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (e(n[t], t, n))
      return !0;
  return !1;
}, Tl = (n, e) => {
  const t = new Array(n);
  for (let s = 0; s < n; s++)
    t[s] = e(s, t);
  return t;
}, Mr = Array.isArray;
class Al {
  constructor() {
    this._observers = qe();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(e, t) {
    return Gt(
      this._observers,
      /** @type {string} */
      e,
      Jn
    ).add(t), t;
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once(e, t) {
    const s = (...r) => {
      this.off(
        e,
        /** @type {any} */
        s
      ), t(...r);
    };
    this.on(
      e,
      /** @type {any} */
      s
    );
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off(e, t) {
    const s = this._observers.get(e);
    s !== void 0 && (s.delete(t), s.size === 0 && this._observers.delete(e));
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
    return Kt((this._observers.get(e) || qe()).values()).forEach((s) => s(...t));
  }
  destroy() {
    this._observers = qe();
  }
}
const lt = Math.floor, ar = Math.abs, Ia = (n, e) => n < e ? n : e, gn = (n, e) => n > e ? n : e, Ea = (n) => n !== 0 ? n < 0 : 1 / n < 0, So = 1, xo = 2, ti = 4, ni = 8, Cs = 32, xt = 64, Le = 128, Ur = 31, wi = 63, cn = 127, Ol = 2147483647, gr = Number.MAX_SAFE_INTEGER, Co = Number.MIN_SAFE_INTEGER, Dl = Number.isInteger || ((n) => typeof n == "number" && isFinite(n) && lt(n) === n), Nl = String.fromCharCode, Ll = (n) => n.toLowerCase(), Rl = /^\s*/g, Ml = (n) => n.replace(Rl, ""), Ul = /([A-Z])/g, Io = (n, e) => Ml(n.replace(Ul, (t) => `${e}${Ll(t)}`)), Vl = (n) => {
  const e = unescape(encodeURIComponent(n)), t = e.length, s = new Uint8Array(t);
  for (let r = 0; r < t; r++)
    s[r] = /** @type {number} */
    e.codePointAt(r);
  return s;
}, Is = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), $l = (n) => Is.encode(n), jl = Is ? $l : Vl;
let Ss = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
Ss && Ss.decode(new Uint8Array()).length === 1 && (Ss = null);
const Bl = (n, e) => Tl(e, () => n).join("");
class Hs {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const Vr = () => new Hs(), Pl = (n) => {
  let e = n.cpos;
  for (let t = 0; t < n.bufs.length; t++)
    e += n.bufs[t].length;
  return e;
}, ot = (n) => {
  const e = new Uint8Array(Pl(n));
  let t = 0;
  for (let s = 0; s < n.bufs.length; s++) {
    const r = n.bufs[s];
    e.set(r, t), t += r.length;
  }
  return e.set(new Uint8Array(n.cbuf.buffer, 0, n.cpos), t), e;
}, Zl = (n, e) => {
  const t = n.cbuf.length;
  t - n.cpos < e && (n.bufs.push(new Uint8Array(n.cbuf.buffer, 0, n.cpos)), n.cbuf = new Uint8Array(gn(t, e) * 2), n.cpos = 0);
}, ne = (n, e) => {
  const t = n.cbuf.length;
  n.cpos === t && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(t * 2), n.cpos = 0), n.cbuf[n.cpos++] = e;
}, _i = ne, D = (n, e) => {
  for (; e > cn; )
    ne(n, Le | cn & e), e = lt(e / 128);
  ne(n, cn & e);
}, Ji = (n, e) => {
  const t = Ea(e);
  for (t && (e = -e), ne(n, (e > wi ? Le : 0) | (t ? xt : 0) | wi & e), e = lt(e / 64); e > 0; )
    ne(n, (e > cn ? Le : 0) | cn & e), e = lt(e / 128);
}, vi = new Uint8Array(3e4), Fl = vi.length / 3, Kl = (n, e) => {
  if (e.length < Fl) {
    const t = Is.encodeInto(e, vi).written || 0;
    D(n, t);
    for (let s = 0; s < t; s++)
      ne(n, vi[s]);
  } else
    Te(n, jl(e));
}, zl = (n, e) => {
  const t = unescape(encodeURIComponent(e)), s = t.length;
  D(n, s);
  for (let r = 0; r < s; r++)
    ne(
      n,
      /** @type {number} */
      t.codePointAt(r)
    );
}, Tn = Is && /** @type {any} */
Is.encodeInto ? Kl : zl, $r = (n, e) => {
  const t = n.cbuf.length, s = n.cpos, r = Ia(t - s, e.length), i = e.length - r;
  n.cbuf.set(e.subarray(0, r), s), n.cpos += r, i > 0 && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(gn(t * 2, i)), n.cbuf.set(e.subarray(r)), n.cpos = i);
}, Te = (n, e) => {
  D(n, e.byteLength), $r(n, e);
}, Gi = (n, e) => {
  Zl(n, e);
  const t = new DataView(n.cbuf.buffer, n.cpos, e);
  return n.cpos += e, t;
}, Hl = (n, e) => Gi(n, 4).setFloat32(0, e, !1), Wl = (n, e) => Gi(n, 8).setFloat64(0, e, !1), Jl = (n, e) => (
  /** @type {any} */
  Gi(n, 8).setBigInt64(0, e, !1)
), Eo = new DataView(new ArrayBuffer(4)), Gl = (n) => (Eo.setFloat32(0, n), Eo.getFloat32(0) === n), Es = (n, e) => {
  switch (typeof e) {
    case "string":
      ne(n, 119), Tn(n, e);
      break;
    case "number":
      Dl(e) && ar(e) <= Ol ? (ne(n, 125), Ji(n, e)) : Gl(e) ? (ne(n, 124), Hl(n, e)) : (ne(n, 123), Wl(n, e));
      break;
    case "bigint":
      ne(n, 122), Jl(n, e);
      break;
    case "object":
      if (e === null)
        ne(n, 126);
      else if (Mr(e)) {
        ne(n, 117), D(n, e.length);
        for (let t = 0; t < e.length; t++)
          Es(n, e[t]);
      } else if (e instanceof Uint8Array)
        ne(n, 116), Te(n, e);
      else {
        ne(n, 118);
        const t = Object.keys(e);
        D(n, t.length);
        for (let s = 0; s < t.length; s++) {
          const r = t[s];
          Tn(n, r), Es(n, e[r]);
        }
      }
      break;
    case "boolean":
      ne(n, e ? 120 : 121);
      break;
    default:
      ne(n, 127);
  }
};
class To extends Hs {
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
    this.s === e ? this.count++ : (this.count > 0 && D(this, this.count - 1), this.count = 1, this.w(this, e), this.s = e);
  }
}
const Ao = (n) => {
  n.count > 0 && (Ji(n.encoder, n.count === 1 ? n.s : -n.s), n.count > 1 && D(n.encoder, n.count - 2));
};
class cr {
  constructor() {
    this.encoder = new Hs(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (Ao(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return Ao(this), ot(this.encoder);
  }
}
const Oo = (n) => {
  if (n.count > 0) {
    const e = n.diff * 2 + (n.count === 1 ? 0 : 1);
    Ji(n.encoder, e), n.count > 1 && D(n.encoder, n.count - 2);
  }
};
class si {
  constructor() {
    this.encoder = new Hs(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (Oo(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return Oo(this), ot(this.encoder);
  }
}
class ql {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new cr();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new Hs();
    return this.sarr.push(this.s), this.s = "", Tn(e, this.sarr.join("")), $r(e, this.lensE.toUint8Array()), ot(e);
  }
}
const ht = (n) => new Error(n), Ye = () => {
  throw ht("Method unimplemented");
}, Be = () => {
  throw ht("Unexpected case");
}, Ta = ht("Unexpected end of array"), Aa = ht("Integer out of Range");
class jr {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const rs = (n) => new jr(n), Yl = (n) => n.pos !== n.arr.length, Xl = (n, e) => {
  const t = new Uint8Array(n.arr.buffer, n.pos + n.arr.byteOffset, e);
  return n.pos += e, t;
}, Ae = (n) => Xl(n, A(n)), Gn = (n) => n.arr[n.pos++], A = (n) => {
  let e = 0, t = 1;
  const s = n.arr.length;
  for (; n.pos < s; ) {
    const r = n.arr[n.pos++];
    if (e = e + (r & cn) * t, t *= 128, r < Le)
      return e;
    if (e > gr)
      throw Aa;
  }
  throw Ta;
}, qi = (n) => {
  let e = n.arr[n.pos++], t = e & wi, s = 64;
  const r = (e & xt) > 0 ? -1 : 1;
  if ((e & Le) === 0)
    return r * t;
  const i = n.arr.length;
  for (; n.pos < i; ) {
    if (e = n.arr[n.pos++], t = t + (e & cn) * s, s *= 128, e < Le)
      return r * t;
    if (t > gr)
      throw Aa;
  }
  throw Ta;
}, Ql = (n) => {
  let e = A(n);
  if (e === 0)
    return "";
  {
    let t = String.fromCodePoint(Gn(n));
    if (--e < 100)
      for (; e--; )
        t += String.fromCodePoint(Gn(n));
    else
      for (; e > 0; ) {
        const s = e < 1e4 ? e : 1e4, r = n.arr.subarray(n.pos, n.pos + s);
        n.pos += s, t += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          r
        ), e -= s;
      }
    return decodeURIComponent(escape(t));
  }
}, eh = (n) => (
  /** @type any */
  Ss.decode(Ae(n))
), An = Ss ? eh : Ql, Yi = (n, e) => {
  const t = new DataView(n.arr.buffer, n.arr.byteOffset + n.pos, e);
  return n.pos += e, t;
}, th = (n) => Yi(n, 4).getFloat32(0, !1), nh = (n) => Yi(n, 8).getFloat64(0, !1), sh = (n) => (
  /** @type {any} */
  Yi(n, 8).getBigInt64(0, !1)
), rh = [
  (n) => {
  },
  // CASE 127: undefined
  (n) => null,
  // CASE 126: null
  qi,
  // CASE 125: integer
  th,
  // CASE 124: float32
  nh,
  // CASE 123: float64
  sh,
  // CASE 122: bigint
  (n) => !1,
  // CASE 121: boolean (false)
  (n) => !0,
  // CASE 120: boolean (true)
  An,
  // CASE 119: string
  (n) => {
    const e = A(n), t = {};
    for (let s = 0; s < e; s++) {
      const r = An(n);
      t[r] = Ts(n);
    }
    return t;
  },
  (n) => {
    const e = A(n), t = [];
    for (let s = 0; s < e; s++)
      t.push(Ts(n));
    return t;
  },
  Ae
  // CASE 116: Uint8Array
], Ts = (n) => rh[127 - Gn(n)](n);
class Do extends jr {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, t) {
    super(e), this.reader = t, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), Yl(this) ? this.count = A(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class lr extends jr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = qi(this);
      const e = Ea(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = A(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class ri extends jr {
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
      const e = qi(this), t = e & 1;
      this.diff = lt(e / 2), this.count = 1, t && (this.count = A(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class ih {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new lr(e), this.str = An(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
    return this.spos = e, t;
  }
}
const oh = crypto.getRandomValues.bind(crypto), Oa = () => oh(new Uint32Array(1))[0], ah = "10000000-1000-4000-8000" + -1e11, ch = () => ah.replace(
  /[018]/g,
  /** @param {number} c */
  (n) => (n ^ Oa() & 15 >> n / 4).toString(16)
), No = (n) => (
  /** @type {Promise<T>} */
  new Promise(n)
);
Promise.all.bind(Promise);
const Lo = (n) => n === void 0 ? null : n;
class lh {
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
let Da = new lh(), hh = !0;
try {
  typeof localStorage < "u" && localStorage && (Da = localStorage, hh = !1);
} catch {
}
const uh = Da, As = Symbol("Equality"), Na = (n, e) => {
  var t;
  return n === e || !!((t = n == null ? void 0 : n[As]) != null && t.call(n, e)) || !1;
}, dh = (n) => typeof n == "object", fh = Object.assign, gh = Object.keys, ph = (n, e) => {
  for (const t in n)
    e(n[t], t);
}, pr = (n) => gh(n).length, mh = (n) => {
  for (const e in n)
    return !1;
  return !0;
}, Ws = (n, e) => {
  for (const t in n)
    if (!e(n[t], t))
      return !1;
  return !0;
}, Xi = (n, e) => Object.prototype.hasOwnProperty.call(n, e), yh = (n, e) => n === e || pr(n) === pr(e) && Ws(n, (t, s) => (t !== void 0 || Xi(e, s)) && Na(e[s], t)), wh = Object.freeze, La = (n) => {
  for (const e in n) {
    const t = n[e];
    (typeof t == "object" || typeof t == "function") && La(n[e]);
  }
  return wh(n);
}, Qi = (n, e, t = 0) => {
  try {
    for (; t < n.length; t++)
      n[t](...e);
  } finally {
    t < n.length && Qi(n, e, t + 1);
  }
}, _h = (n) => n, hr = (n, e) => {
  if (n === e)
    return !0;
  if (n == null || e == null || n.constructor !== e.constructor && (n.constructor || Object) !== (e.constructor || Object))
    return !1;
  if (n[As] != null)
    return n[As](e);
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
        if (!e.has(t) || !hr(n.get(t), e.get(t)))
          return !1;
      break;
    }
    case void 0:
    case Object:
      if (pr(n) !== pr(e))
        return !1;
      for (const t in n)
        if (!Xi(n, t) || !hr(n[t], e[t]))
          return !1;
      break;
    case Array:
      if (n.length !== e.length)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (!hr(n[t], e[t]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, vh = (n, e) => e.includes(n), Os = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let Qe;
const kh = () => {
  if (Qe === void 0)
    if (Os) {
      Qe = qe();
      const n = process.argv;
      let e = null;
      for (let t = 0; t < n.length; t++) {
        const s = n[t];
        s[0] === "-" ? (e !== null && Qe.set(e, ""), e = s) : e !== null && (Qe.set(e, s), e = null);
      }
      e !== null && Qe.set(e, "");
    } else typeof location == "object" ? (Qe = qe(), (location.search || "?").slice(1).split("&").forEach((n) => {
      if (n.length !== 0) {
        const [e, t] = n.split("=");
        Qe.set(`--${Io(e, "-")}`, t), Qe.set(`-${Io(e, "-")}`, t);
      }
    })) : Qe = qe();
  return Qe;
}, ki = (n) => kh().has(n), mr = (n) => Lo(Os ? process.env[n.toUpperCase().replaceAll("-", "_")] : uh.getItem(n)), Ra = (n) => ki("--" + n) || mr(n) !== null, bh = Ra("production"), Sh = Os && vh(process.env.FORCE_COLOR, ["true", "1", "2"]), xh = Sh || !ki("--no-colors") && // @todo deprecate --no-colors
!Ra("no-color") && (!Os || process.stdout.isTTY) && (!Os || ki("--color") || mr("COLORTERM") !== null || (mr("TERM") || "").includes("color")), Ch = (n) => new Uint8Array(n), Ih = (n) => {
  const e = Ch(n.byteLength);
  return e.set(n), e;
};
class Eh {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, t) {
    this.left = e, this.right = t;
  }
}
const pt = (n, e) => new Eh(n, e), Ro = (n) => n.next() >= 0.5, ii = (n, e, t) => lt(n.next() * (t + 1 - e) + e), Ma = (n, e, t) => lt(n.next() * (t + 1 - e) + e), eo = (n, e, t) => Ma(n, e, t), Th = (n) => Nl(eo(n, 97, 122)), Ah = (n, e = 0, t = 20) => {
  const s = eo(n, e, t);
  let r = "";
  for (let i = 0; i < s; i++)
    r += Th(n);
  return r;
}, oi = (n, e) => e[eo(n, 0, e.length - 1)], Oh = Symbol("0schema");
class Dh {
  constructor() {
    this._rerrs = [];
  }
  /**
   * @param {string?} path
   * @param {string} expected
   * @param {string} has
   * @param {string?} message
   */
  extend(e, t, s, r = null) {
    this._rerrs.push({ path: e, expected: t, has: s, message: r });
  }
  toString() {
    const e = [];
    for (let t = this._rerrs.length - 1; t > 0; t--) {
      const s = this._rerrs[t];
      e.push(Bl(" ", (this._rerrs.length - t) * 2) + `${s.path != null ? `[${s.path}] ` : ""}${s.has} doesn't match ${s.expected}. ${s.message}`);
    }
    return e.join(`
`);
  }
}
const bi = (n, e) => n === e ? !0 : n == null || e == null || n.constructor !== e.constructor ? !1 : n[As] ? Na(n, e) : Mr(n) ? Wi(
  n,
  (t) => Ca(e, (s) => bi(t, s))
) : dh(n) ? Ws(
  n,
  (t, s) => bi(t, e[s])
) : !1;
class me {
  /**
   * @param {Schema<any>} other
   */
  extends(e) {
    let [t, s] = [
      /** @type {any} */
      this.shape,
      /** @type {any} */
      e.shape
    ];
    return (
      /** @type {typeof Schema<any>} */
      this.constructor._dilutes && ([s, t] = [t, s]), bi(t, s)
    );
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(e) {
    return this.constructor === e.constructor && hr(this.shape, e.shape);
  }
  [Oh]() {
    return !0;
  }
  /**
   * @param {object} other
   */
  [As](e) {
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
    Ye();
  }
  /* c8 ignore stop */
  /**
   * @type {Schema<T?>}
   */
  get nullable() {
    return is(this, Kr);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new $a(
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
    return Mo(e, this), /** @type {any} */
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
    return Mo(e, this), e;
  }
}
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
gt(me, "_dilutes", !1);
class to extends me {
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
    const s = (e == null ? void 0 : e.constructor) === this.shape && (this._c == null || this._c(e));
    return !s && (t == null || t.extend(null, this.shape.name, e == null ? void 0 : e.constructor.name, (e == null ? void 0 : e.constructor) !== this.shape ? "Constructor match failed" : "Check failed")), s;
  }
}
const q = (n, e = null) => new to(n, e);
q(to);
class no extends me {
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
    const s = this.shape(e);
    return !s && (t == null || t.extend(null, "custom prop", e == null ? void 0 : e.constructor.name, "failed to check custom prop")), s;
  }
}
const re = (n) => new no(n);
q(no);
class Br extends me {
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
    const s = this.shape.some((r) => r === e);
    return !s && (t == null || t.extend(null, this.shape.join(" | "), e.toString())), s;
  }
}
const Pr = (...n) => new Br(n), Ua = q(Br), Nh = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((n) => n.replace(/[().|&,$^[\]]/g, (e) => "\\" + e))
), Va = (n) => {
  if (qn.check(n))
    return [Nh(n)];
  if (Ua.check(n))
    return (
      /** @type {Array<string|number>} */
      n.shape.map((e) => e + "")
    );
  if (Wa.check(n))
    return ["[+-]?\\d+.?\\d*"];
  if (Ja.check(n))
    return [".*"];
  if (wr.check(n))
    return n.shape.map(Va).flat(1);
  Be();
};
class Lh extends me {
  /**
   * @param {T} shape
   */
  constructor(e) {
    super(), this.shape = e, this._r = new RegExp("^" + e.map(Va).map((t) => `(${t.join("|")})`).join("") + "$");
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is CastStringTemplateArgsToTemplate<T>}
   */
  check(e, t) {
    const s = this._r.exec(e) != null;
    return !s && (t == null || t.extend(null, this._r.toString(), e.toString(), "String doesn't match string template.")), s;
  }
}
q(Lh);
const Rh = Symbol("optional");
class $a extends me {
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
    const s = e === void 0 || this.shape.check(e);
    return !s && (t == null || t.extend(null, "undefined (optional)", "()")), s;
  }
  get [Rh]() {
    return !0;
  }
}
const Mh = q($a);
class Uh extends me {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(e, t) {
    return t == null || t.extend(null, "never", typeof e), !1;
  }
}
q(Uh);
const Lr = class Lr extends me {
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
    return new Lr(this.shape, !0);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(e, t) {
    return e == null ? (t == null || t.extend(null, "object", "null"), !1) : Ws(this.shape, (s, r) => {
      const i = this._isPartial && !Xi(e, r) || s.check(e[r], t);
      return !i && (t == null || t.extend(r.toString(), s.toString(), typeof e[r], "Object property does not match")), i;
    });
  }
};
gt(Lr, "_dilutes", !0);
let yr = Lr;
const Vh = (n) => (
  /** @type {any} */
  new yr(n)
), $h = q(yr), jh = re((n) => n != null && (n.constructor === Object || n.constructor == null));
class ja extends me {
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
    return e != null && Ws(e, (s, r) => {
      const i = this.shape.keys.check(r, t);
      return !i && (t == null || t.extend(r + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value")), i && this.shape.values.check(s, t);
    });
  }
}
const Ba = (n, e) => new ja(n, e), Bh = q(ja);
class Pa extends me {
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
    return e != null && Ws(this.shape, (s, r) => {
      const i = (
        /** @type {Schema<any>} */
        s.check(e[r], t)
      );
      return !i && (t == null || t.extend(r.toString(), "Tuple", typeof s)), i;
    });
  }
}
const Ph = (...n) => new Pa(n);
q(Pa);
class Za extends me {
  /**
   * @param {Array<S>} v
   */
  constructor(e) {
    super(), this.shape = e.length === 1 ? e[0] : new Zr(e);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(e, t) {
    const s = Mr(e) && Wi(e, (r) => this.shape.check(r));
    return !s && (t == null || t.extend(null, "Array", "")), s;
  }
}
const Fa = (...n) => new Za(n), Zh = q(Za), Fh = re((n) => Mr(n));
class Ka extends me {
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
    const s = e instanceof this.shape && (this._c == null || this._c(e));
    return !s && (t == null || t.extend(null, this.shape.name, e == null ? void 0 : e.constructor.name)), s;
  }
}
const Kh = (n, e = null) => new Ka(n, e);
q(Ka);
const zh = Kh(me);
class Hh extends me {
  /**
   * @param {Args} args
   */
  constructor(e) {
    super(), this.len = e.length - 1, this.args = Ph(...e.slice(-1)), this.res = e[this.len];
  }
  /**
   * @param {any} f
   * @param {ValidationError} err
   * @return {f is _LArgsToLambdaDef<Args>}
   */
  check(e, t) {
    const s = e.constructor === Function && e.length <= this.len;
    return !s && (t == null || t.extend(null, "function", typeof e)), s;
  }
}
const Wh = q(Hh), Jh = re((n) => typeof n == "function");
class Gh extends me {
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
    const s = Wi(this.shape, (r) => r.check(e, t));
    return !s && (t == null || t.extend(null, "Intersectinon", typeof e)), s;
  }
}
q(Gh, (n) => n.shape.length > 0);
class Zr extends me {
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
    const s = Ca(this.shape, (r) => r.check(e, t));
    return t == null || t.extend(null, "Union", typeof e), s;
  }
}
gt(Zr, "_dilutes", !0);
const is = (...n) => n.findIndex((e) => wr.check(e)) >= 0 ? is(...n.map((e) => Ds(e)).map((e) => wr.check(e) ? e.shape : [e]).flat(1)) : n.length === 1 ? n[0] : new Zr(n), wr = (
  /** @type {Schema<$Union<any>>} */
  q(Zr)
), za = () => !0, _r = re(za), qh = (
  /** @type {Schema<Schema<any>>} */
  q(no, (n) => n.shape === za)
), so = re((n) => typeof n == "bigint"), Yh = (
  /** @type {Schema<Schema<BigInt>>} */
  re((n) => n === so)
), Ha = re((n) => typeof n == "symbol");
re((n) => n === Ha);
const On = re((n) => typeof n == "number"), Wa = (
  /** @type {Schema<Schema<number>>} */
  re((n) => n === On)
), qn = re((n) => typeof n == "string"), Ja = (
  /** @type {Schema<Schema<string>>} */
  re((n) => n === qn)
), Fr = re((n) => typeof n == "boolean"), Xh = (
  /** @type {Schema<Schema<Boolean>>} */
  re((n) => n === Fr)
), Ga = Pr(void 0);
q(Br, (n) => n.shape.length === 1 && n.shape[0] === void 0);
Pr(void 0);
const Kr = Pr(null), Qh = (
  /** @type {Schema<Schema<null>>} */
  q(Br, (n) => n.shape.length === 1 && n.shape[0] === null)
);
q(Uint8Array);
q(to, (n) => n.shape === Uint8Array);
const eu = is(On, qn, Kr, Ga, so, Fr, Ha);
(() => {
  const n = (
    /** @type {$Array<$any>} */
    Fa(_r)
  ), e = (
    /** @type {$Record<$string,$any>} */
    Ba(qn, _r)
  ), t = is(On, qn, Kr, Fr, n, e);
  return n.shape = t, e.shape.values = t, t;
})();
const Ds = (n) => {
  if (zh.check(n))
    return (
      /** @type {any} */
      n
    );
  if (jh.check(n)) {
    const e = {};
    for (const t in n)
      e[t] = Ds(n[t]);
    return (
      /** @type {any} */
      Vh(e)
    );
  } else {
    if (Fh.check(n))
      return (
        /** @type {any} */
        is(...n.map(Ds))
      );
    if (eu.check(n))
      return (
        /** @type {any} */
        Pr(n)
      );
    if (Jh.check(n))
      return (
        /** @type {any} */
        q(
          /** @type {any} */
          n
        )
      );
  }
  Be();
}, Mo = bh ? () => {
} : (n, e) => {
  const t = new Dh();
  if (!e.check(n, t))
    throw ht(`Expected value to be of type ${e.constructor.name}.
${t.toString()}`);
};
class tu {
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
    return this.patterns.push({ if: Ds(e), h: t }), this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(e) {
    return this.if(_r, e);
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
        for (let s = 0; s < this.patterns.length; s++) {
          const r = this.patterns[s];
          if (r.if.check(e))
            return r.h(e, t);
        }
        throw ht("Unhandled pattern");
      }
    );
  }
}
const nu = (n) => new tu(
  /** @type {any} */
  n
), qa = (
  /** @type {any} */
  nu(
    /** @type {Schema<prng.PRNG>} */
    _r
  ).if(Wa, (n, e) => ii(e, Co, gr)).if(Ja, (n, e) => Ah(e)).if(Xh, (n, e) => Ro(e)).if(Yh, (n, e) => BigInt(ii(e, Co, gr))).if(wr, (n, e) => _n(e, oi(e, n.shape))).if($h, (n, e) => {
    const t = {};
    for (const s in n.shape) {
      let r = n.shape[s];
      if (Mh.check(r)) {
        if (Ro(e))
          continue;
        r = r.shape;
      }
      t[s] = qa(r, e);
    }
    return t;
  }).if(Zh, (n, e) => {
    const t = [], s = Ma(e, 0, 42);
    for (let r = 0; r < s; r++)
      t.push(_n(e, n.shape));
    return t;
  }).if(Ua, (n, e) => oi(e, n.shape)).if(Qh, (n, e) => null).if(Wh, (n, e) => {
    const t = _n(e, n.res);
    return () => t;
  }).if(qh, (n, e) => _n(e, oi(e, [
    On,
    qn,
    Kr,
    Ga,
    so,
    Fr,
    Fa(On),
    Ba(is("a", "b", "c"), On)
  ]))).if(Bh, (n, e) => {
    const t = {}, s = ii(e, 0, 3);
    for (let r = 0; r < s; r++) {
      const i = _n(e, n.shape.keys), o = _n(e, n.shape.values);
      t[i] = o;
    }
    return t;
  }).done()
), _n = (n, e) => (
  /** @type {any} */
  qa(Ds(e), n)
), zr = (
  /** @type {Document} */
  typeof document < "u" ? document : {}
);
re((n) => n.nodeType === au);
typeof DOMParser < "u" && new DOMParser();
re((n) => n.nodeType === ru);
re((n) => n.nodeType === iu);
const su = (n) => Cl(n, (e, t) => `${t}:${e};`).join(""), ru = zr.ELEMENT_NODE, iu = zr.TEXT_NODE, ou = zr.DOCUMENT_NODE, au = zr.DOCUMENT_FRAGMENT_NODE;
re((n) => n.nodeType === ou);
const It = Symbol, Ya = It(), Xa = It(), cu = It(), lu = It(), hu = It(), Qa = It(), uu = It(), ro = It(), du = It(), fu = (n) => {
  var r;
  n.length === 1 && ((r = n[0]) == null ? void 0 : r.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [];
  let s = 0;
  for (; s < n.length; s++) {
    const i = n[s];
    if (i === void 0)
      break;
    if (i.constructor === String || i.constructor === Number)
      e.push(i);
    else if (i.constructor === Object)
      break;
  }
  for (s > 0 && t.push(e.join("")); s < n.length; s++) {
    const i = n[s];
    i instanceof Symbol || t.push(i);
  }
  return t;
}, gu = {
  [Ya]: pt("font-weight", "bold"),
  [Xa]: pt("font-weight", "normal"),
  [cu]: pt("color", "blue"),
  [hu]: pt("color", "green"),
  [lu]: pt("color", "grey"),
  [Qa]: pt("color", "red"),
  [uu]: pt("color", "purple"),
  [ro]: pt("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [du]: pt("color", "black")
}, pu = (n) => {
  var o;
  n.length === 1 && ((o = n[0]) == null ? void 0 : o.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [], s = qe();
  let r = [], i = 0;
  for (; i < n.length; i++) {
    const a = n[i], c = gu[a];
    if (c !== void 0)
      s.set(c.left, c.right);
    else {
      if (a === void 0)
        break;
      if (a.constructor === String || a.constructor === Number) {
        const h = su(s);
        i > 0 || h.length > 0 ? (e.push("%c" + a), t.push(h)) : e.push(a);
      } else
        break;
    }
  }
  for (i > 0 && (r = t, r.unshift(e.join(""))); i < n.length; i++) {
    const a = n[i];
    a instanceof Symbol || r.push(a);
  }
  return r;
}, ec = xh ? pu : fu, mu = (...n) => {
  console.log(...ec(n)), tc.forEach((e) => e.print(n));
}, yu = (...n) => {
  console.warn(...ec(n)), n.unshift(ro), tc.forEach((e) => e.print(n));
}, tc = Jn(), nc = (n) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: n
}), wu = (n, e) => nc(() => {
  let t;
  do
    t = n.next();
  while (!t.done && !e(t.value));
  return t;
}), ai = (n, e) => nc(() => {
  const { done: t, value: s } = n.next();
  return { done: t, value: t ? void 0 : e(s) };
});
class io {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, t) {
    this.clock = e, this.len = t;
  }
}
class Js {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const sc = (n, e, t) => e.clients.forEach((s, r) => {
  const i = (
    /** @type {Array<GC|Item>} */
    n.doc.store.clients.get(r)
  );
  if (i != null) {
    const o = i[i.length - 1], a = o.id.clock + o.length;
    for (let c = 0, h = s[c]; c < s.length && h.clock < a; h = s[++c])
      mc(n, i, h.clock, h.len, t);
  }
}), _u = (n, e) => {
  let t = 0, s = n.length - 1;
  for (; t <= s; ) {
    const r = lt((t + s) / 2), i = n[r], o = i.clock;
    if (o <= e) {
      if (e < o + i.len)
        return r;
      t = r + 1;
    } else
      s = r - 1;
  }
  return null;
}, rc = (n, e) => {
  const t = n.clients.get(e.client);
  return t !== void 0 && _u(t, e.clock) !== null;
}, oo = (n) => {
  n.clients.forEach((e) => {
    e.sort((r, i) => r.clock - i.clock);
    let t, s;
    for (t = 1, s = 1; t < e.length; t++) {
      const r = e[s - 1], i = e[t];
      r.clock + r.len >= i.clock ? r.len = gn(r.len, i.clock + i.len - r.clock) : (s < t && (e[s] = i), s++);
    }
    e.length = s;
  });
}, vu = (n) => {
  const e = new Js();
  for (let t = 0; t < n.length; t++)
    n[t].clients.forEach((s, r) => {
      if (!e.clients.has(r)) {
        const i = s.slice();
        for (let o = t + 1; o < n.length; o++)
          El(i, n[o].clients.get(r) || []);
        e.clients.set(r, i);
      }
    });
  return oo(e), e;
}, vr = (n, e, t, s) => {
  Gt(n.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new io(t, s));
}, ku = () => new Js(), bu = (n) => {
  const e = ku();
  return n.clients.forEach((t, s) => {
    const r = [];
    for (let i = 0; i < t.length; i++) {
      const o = t[i];
      if (o.deleted) {
        const a = o.id.clock;
        let c = o.length;
        if (i + 1 < t.length)
          for (let h = t[i + 1]; i + 1 < t.length && h.deleted; h = t[++i + 1])
            c += h.length;
        r.push(new io(a, c));
      }
    }
    r.length > 0 && e.clients.set(s, r);
  }), e;
}, os = (n, e) => {
  D(n.restEncoder, e.clients.size), Kt(e.clients.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
    n.resetDsCurVal(), D(n.restEncoder, t);
    const r = s.length;
    D(n.restEncoder, r);
    for (let i = 0; i < r; i++) {
      const o = s[i];
      n.writeDsClock(o.clock), n.writeDsLen(o.len);
    }
  });
}, ao = (n) => {
  const e = new Js(), t = A(n.restDecoder);
  for (let s = 0; s < t; s++) {
    n.resetDsCurVal();
    const r = A(n.restDecoder), i = A(n.restDecoder);
    if (i > 0) {
      const o = Gt(e.clients, r, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let a = 0; a < i; a++)
        o.push(new io(n.readDsClock(), n.readDsLen()));
    }
  }
  return e;
}, Uo = (n, e, t) => {
  const s = new Js(), r = A(n.restDecoder);
  for (let i = 0; i < r; i++) {
    n.resetDsCurVal();
    const o = A(n.restDecoder), a = A(n.restDecoder), c = t.clients.get(o) || [], h = se(t, o);
    for (let u = 0; u < a; u++) {
      const d = n.readDsClock(), g = d + n.readDsLen();
      if (d < h) {
        h < g && vr(s, o, h, g - h);
        let m = ut(c, d), w = c[m];
        for (!w.deleted && w.id.clock < d && (c.splice(m + 1, 0, Er(e, w, d - w.id.clock)), m++); m < c.length && (w = c[m++], w.id.clock < g); )
          w.deleted || (g < w.id.clock + w.length && c.splice(m, 0, Er(e, w, g - w.id.clock)), w.delete(e));
      } else
        vr(s, o, d, g - d);
    }
  }
  if (s.clients.size > 0) {
    const i = new hn();
    return D(i.restEncoder, 0), os(i, s), i.toUint8Array();
  }
  return null;
}, ic = Oa;
class ln extends Al {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = ch(), collectionid: t = null, gc: s = !0, gcFilter: r = () => !0, meta: i = null, autoLoad: o = !1, shouldLoad: a = !0 } = {}) {
    super(), this.gc = s, this.gcFilter = r, this.clientID = ic(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new gc(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = a, this.autoLoad = o, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = No((h) => {
      this.on("load", () => {
        this.isLoaded = !0, h(this);
      });
    });
    const c = () => No((h) => {
      const u = (d) => {
        (d === void 0 || d === !0) && (this.off("sync", u), h());
      };
      this.on("sync", u);
    });
    this.on("sync", (h) => {
      h === !1 && this.isSynced && (this.whenSynced = c()), this.isSynced = h === void 0 || h === !0, this.isSynced && !this.isLoaded && this.emit("load", [this]);
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
    e !== null && !this.shouldLoad && B(
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
    return new Set(Kt(this.subdocs).map((e) => e.guid));
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
    return B(this, e, t);
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
    ue
  )) {
    const s = Gt(this.share, e, () => {
      const i = new t();
      return i._integrate(this, null), i;
    }), r = s.constructor;
    if (t !== ue && r !== t)
      if (r === ue) {
        const i = new t();
        i._map = s._map, s._map.forEach(
          /** @param {Item?} n */
          (o) => {
            for (; o !== null; o = o.left)
              o.parent = i;
          }
        ), i._start = s._start;
        for (let o = i._start; o !== null; o = o.right)
          o.parent = i;
        return i._length = s._length, this.share.set(e, i), i._integrate(this, null), /** @type {InstanceType<Type>} */
        i;
      } else
        throw new Error(`Type with the name ${e} has already been defined with a different constructor`);
    return (
      /** @type {InstanceType<Type>} */
      s
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
      this.get(e, Nn)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(e = "") {
    return this.get(e, K);
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
      this.get(e, L)
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
      this.get(e, Xn)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, un);
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
    return this.share.forEach((t, s) => {
      e[s] = t.toJSON();
    }), e;
  }
  /**
   * Emit `destroy` event and unregister all event handlers.
   */
  destroy() {
    this.isDestroyed = !0, Kt(this.subdocs).forEach((t) => t.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const t = (
        /** @type {ContentDoc} */
        e.content
      );
      t.doc = new ln({ guid: this.guid, ...t.opts, shouldLoad: !1 }), t.doc._item = e, B(
        /** @type {any} */
        e.parent.doc,
        (s) => {
          const r = t.doc;
          e.deleted || s.subdocsAdded.add(r), s.subdocsRemoved.add(this);
        },
        null,
        !0
      );
    }
    this.emit("destroyed", [!0]), this.emit("destroy", [this]), super.destroy();
  }
}
class oc {
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
    return A(this.restDecoder);
  }
  /**
   * @return {number}
   */
  readDsLen() {
    return A(this.restDecoder);
  }
}
class ac extends oc {
  /**
   * @return {ID}
   */
  readLeftID() {
    return N(A(this.restDecoder), A(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return N(A(this.restDecoder), A(this.restDecoder));
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return A(this.restDecoder);
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return Gn(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return An(this.restDecoder);
  }
  /**
   * @return {boolean} isKey
   */
  readParentInfo() {
    return A(this.restDecoder) === 1;
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readTypeRef() {
    return A(this.restDecoder);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number} len
   */
  readLen() {
    return A(this.restDecoder);
  }
  /**
   * @return {any}
   */
  readAny() {
    return Ts(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return Ih(Ae(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(An(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return An(this.restDecoder);
  }
}
class Su {
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
    return this.dsCurrVal += A(this.restDecoder), this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const e = A(this.restDecoder) + 1;
    return this.dsCurrVal += e, e;
  }
}
class Yn extends Su {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], A(e), this.keyClockDecoder = new ri(Ae(e)), this.clientDecoder = new lr(Ae(e)), this.leftClockDecoder = new ri(Ae(e)), this.rightClockDecoder = new ri(Ae(e)), this.infoDecoder = new Do(Ae(e), Gn), this.stringDecoder = new ih(Ae(e)), this.parentInfoDecoder = new Do(Ae(e), Gn), this.typeRefDecoder = new lr(Ae(e)), this.lenDecoder = new lr(Ae(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new Dn(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new Dn(this.clientDecoder.read(), this.rightClockDecoder.read());
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
    return Ts(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return Ae(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return Ts(this.restDecoder);
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
class cc {
  constructor() {
    this.restEncoder = Vr();
  }
  toUint8Array() {
    return ot(this.restEncoder);
  }
  resetDsCurVal() {
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    D(this.restEncoder, e);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    D(this.restEncoder, e);
  }
}
class Gs extends cc {
  /**
   * @param {ID} id
   */
  writeLeftID(e) {
    D(this.restEncoder, e.client), D(this.restEncoder, e.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(e) {
    D(this.restEncoder, e.client), D(this.restEncoder, e.clock);
  }
  /**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */
  writeClient(e) {
    D(this.restEncoder, e);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(e) {
    _i(this.restEncoder, e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    Tn(this.restEncoder, e);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(e) {
    D(this.restEncoder, e ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(e) {
    D(this.restEncoder, e);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(e) {
    D(this.restEncoder, e);
  }
  /**
   * @param {any} any
   */
  writeAny(e) {
    Es(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Te(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    Tn(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    Tn(this.restEncoder, e);
  }
}
class lc {
  constructor() {
    this.restEncoder = Vr(), this.dsCurrVal = 0;
  }
  toUint8Array() {
    return ot(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    const t = e - this.dsCurrVal;
    this.dsCurrVal = e, D(this.restEncoder, t);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    e === 0 && Be(), D(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class hn extends lc {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new si(), this.clientEncoder = new cr(), this.leftClockEncoder = new si(), this.rightClockEncoder = new si(), this.infoEncoder = new To(_i), this.stringEncoder = new ql(), this.parentInfoEncoder = new To(_i), this.typeRefEncoder = new cr(), this.lenEncoder = new cr();
  }
  toUint8Array() {
    const e = Vr();
    return D(e, 0), Te(e, this.keyClockEncoder.toUint8Array()), Te(e, this.clientEncoder.toUint8Array()), Te(e, this.leftClockEncoder.toUint8Array()), Te(e, this.rightClockEncoder.toUint8Array()), Te(e, ot(this.infoEncoder)), Te(e, this.stringEncoder.toUint8Array()), Te(e, ot(this.parentInfoEncoder)), Te(e, this.typeRefEncoder.toUint8Array()), Te(e, this.lenEncoder.toUint8Array()), $r(e, ot(this.restEncoder)), ot(e);
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
    Es(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Te(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    Es(this.restEncoder, e);
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
const xu = (n, e, t, s) => {
  s = gn(s, e[0].id.clock);
  const r = ut(e, s);
  D(n.restEncoder, e.length - r), n.writeClient(t), D(n.restEncoder, s);
  const i = e[r];
  i.write(n, s - i.id.clock);
  for (let o = r + 1; o < e.length; o++)
    e[o].write(n, 0);
}, co = (n, e, t) => {
  const s = /* @__PURE__ */ new Map();
  t.forEach((r, i) => {
    se(e, i) > r && s.set(i, r);
  }), Hr(e).forEach((r, i) => {
    t.has(i) || s.set(i, 0);
  }), D(n.restEncoder, s.size), Kt(s.entries()).sort((r, i) => i[0] - r[0]).forEach(([r, i]) => {
    xu(
      n,
      /** @type {Array<GC|Item>} */
      e.clients.get(r),
      r,
      i
    );
  });
}, Cu = (n, e) => {
  const t = qe(), s = A(n.restDecoder);
  for (let r = 0; r < s; r++) {
    const i = A(n.restDecoder), o = new Array(i), a = n.readClient();
    let c = A(n.restDecoder);
    t.set(a, { i: 0, refs: o });
    for (let h = 0; h < i; h++) {
      const u = n.readInfo();
      switch (Ur & u) {
        case 0: {
          const d = n.readLen();
          o[h] = new $e(N(a, c), d), c += d;
          break;
        }
        case 10: {
          const d = A(n.restDecoder);
          o[h] = new je(N(a, c), d), c += d;
          break;
        }
        default: {
          const d = (u & (xt | Le)) === 0, g = new Q(
            N(a, c),
            null,
            // left
            (u & Le) === Le ? n.readLeftID() : null,
            // origin
            null,
            // right
            (u & xt) === xt ? n.readRightID() : null,
            // right origin
            d ? n.readParentInfo() ? e.get(n.readString()) : n.readLeftID() : null,
            // parent
            d && (u & Cs) === Cs ? n.readString() : null,
            // parentSub
            Mc(n, u)
            // item content
          );
          o[h] = g, c += g.length;
        }
      }
    }
  }
  return t;
}, Iu = (n, e, t) => {
  const s = [];
  let r = Kt(t.keys()).sort((m, w) => m - w);
  if (r.length === 0)
    return null;
  const i = () => {
    if (r.length === 0)
      return null;
    let m = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      t.get(r[r.length - 1])
    );
    for (; m.refs.length === m.i; )
      if (r.pop(), r.length > 0)
        m = /** @type {{i:number,refs:Array<GC|Item>}} */
        t.get(r[r.length - 1]);
      else
        return null;
    return m;
  };
  let o = i();
  if (o === null)
    return null;
  const a = new gc(), c = /* @__PURE__ */ new Map(), h = (m, w) => {
    const S = c.get(m);
    (S == null || S > w) && c.set(m, w);
  };
  let u = (
    /** @type {any} */
    o.refs[
      /** @type {any} */
      o.i++
    ]
  );
  const d = /* @__PURE__ */ new Map(), g = () => {
    for (const m of s) {
      const w = m.id.client, S = t.get(w);
      S ? (S.i--, a.clients.set(w, S.refs.slice(S.i)), t.delete(w), S.i = 0, S.refs = []) : a.clients.set(w, [m]), r = r.filter((j) => j !== w);
    }
    s.length = 0;
  };
  for (; ; ) {
    if (u.constructor !== je) {
      const w = Gt(d, u.id.client, () => se(e, u.id.client)) - u.id.clock;
      if (w < 0)
        s.push(u), h(u.id.client, u.id.clock - 1), g();
      else {
        const S = u.getMissing(n, e);
        if (S !== null) {
          s.push(u);
          const j = t.get(
            /** @type {number} */
            S
          ) || { refs: [], i: 0 };
          if (j.refs.length === j.i)
            h(
              /** @type {number} */
              S,
              se(e, S)
            ), g();
          else {
            u = j.refs[j.i++];
            continue;
          }
        } else (w === 0 || w < u.length) && (u.integrate(n, w), d.set(u.id.client, u.id.clock + u.length));
      }
    }
    if (s.length > 0)
      u = /** @type {GC|Item} */
      s.pop();
    else if (o !== null && o.i < o.refs.length)
      u = /** @type {GC|Item} */
      o.refs[o.i++];
    else {
      if (o = i(), o === null)
        break;
      u = /** @type {GC|Item} */
      o.refs[o.i++];
    }
  }
  if (a.clients.size > 0) {
    const m = new hn();
    return co(m, a, /* @__PURE__ */ new Map()), D(m.restEncoder, 0), { missing: c, update: m.toUint8Array() };
  }
  return null;
}, Eu = (n, e) => co(n, e.doc.store, e.beforeState), Tu = (n, e, t, s = new Yn(n)) => B(e, (r) => {
  r.local = !1;
  let i = !1;
  const o = r.doc, a = o.store, c = Cu(s, o), h = Iu(r, a, c), u = a.pendingStructs;
  if (u) {
    for (const [g, m] of u.missing)
      if (m < se(a, g)) {
        i = !0;
        break;
      }
    if (h) {
      for (const [g, m] of h.missing) {
        const w = u.missing.get(g);
        (w == null || w > m) && u.missing.set(g, m);
      }
      u.update = kr([u.update, h.update]);
    }
  } else
    a.pendingStructs = h;
  const d = Uo(s, r, a);
  if (a.pendingDs) {
    const g = new Yn(rs(a.pendingDs));
    A(g.restDecoder);
    const m = Uo(g, r, a);
    d && m ? a.pendingDs = kr([d, m]) : a.pendingDs = d || m;
  } else
    a.pendingDs = d;
  if (i) {
    const g = (
      /** @type {{update: Uint8Array}} */
      a.pendingStructs.update
    );
    a.pendingStructs = null, hc(r.doc, g);
  }
}, t, !1), hc = (n, e, t, s = Yn) => {
  const r = rs(e);
  Tu(r, n, t, new s(r));
}, Vo = (n, e, t) => hc(n, e, t, ac), Au = (n, e, t = /* @__PURE__ */ new Map()) => {
  co(n, e.store, t), os(n, bu(e.store));
}, Ou = (n, e = new Uint8Array([0]), t = new hn()) => {
  const s = uc(e);
  Au(t, n, s);
  const r = [t.toUint8Array()];
  if (n.store.pendingDs && r.push(n.store.pendingDs), n.store.pendingStructs && r.push(zu(n.store.pendingStructs.update, e)), r.length > 1) {
    if (t.constructor === Gs)
      return Fu(r.map((i, o) => o === 0 ? i : Wu(i)));
    if (t.constructor === hn)
      return kr(r);
  }
  return r[0];
}, ci = (n, e) => Ou(n, e, new Gs()), Du = (n) => {
  const e = /* @__PURE__ */ new Map(), t = A(n.restDecoder);
  for (let s = 0; s < t; s++) {
    const r = A(n.restDecoder), i = A(n.restDecoder);
    e.set(r, i);
  }
  return e;
}, uc = (n) => Du(new oc(rs(n))), dc = (n, e) => (D(n.restEncoder, e.size), Kt(e.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
  D(n.restEncoder, t), D(n.restEncoder, s);
}), n), Nu = (n, e) => dc(n, Hr(e.store)), Lu = (n, e = new lc()) => (n instanceof Map ? dc(e, n) : Nu(e, n), e.toUint8Array()), Ru = (n) => Lu(n, new cc());
class Mu {
  constructor() {
    this.l = [];
  }
}
const $o = () => new Mu(), jo = (n, e) => n.l.push(e), Bo = (n, e) => {
  const t = n.l, s = t.length;
  n.l = t.filter((r) => e !== r), s === n.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, fc = (n, e, t) => Qi(n.l, [e, t]);
class Dn {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, t) {
    this.client = e, this.clock = t;
  }
}
const nr = (n, e) => n === e || n !== null && e !== null && n.client === e.client && n.clock === e.clock, N = (n, e) => new Dn(n, e), Uu = (n) => {
  for (const [e, t] of n.doc.share.entries())
    if (t === n)
      return e;
  throw Be();
}, kn = (n, e) => e === void 0 ? !n.deleted : e.sv.has(n.id.client) && (e.sv.get(n.id.client) || 0) > n.id.clock && !rc(e.ds, n.id), Si = (n, e) => {
  const t = Gt(n.meta, Si, Jn), s = n.doc.store;
  t.has(e) || (e.sv.forEach((r, i) => {
    r < se(s, i) && zt(n, N(i, r));
  }), sc(n, e.ds, (r) => {
  }), t.add(e));
};
class gc {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const Hr = (n) => {
  const e = /* @__PURE__ */ new Map();
  return n.clients.forEach((t, s) => {
    const r = t[t.length - 1];
    e.set(s, r.id.clock + r.length);
  }), e;
}, se = (n, e) => {
  const t = n.clients.get(e);
  if (t === void 0)
    return 0;
  const s = t[t.length - 1];
  return s.id.clock + s.length;
}, pc = (n, e) => {
  let t = n.clients.get(e.id.client);
  if (t === void 0)
    t = [], n.clients.set(e.id.client, t);
  else {
    const s = t[t.length - 1];
    if (s.id.clock + s.length !== e.id.clock)
      throw Be();
  }
  t.push(e);
}, ut = (n, e) => {
  let t = 0, s = n.length - 1, r = n[s], i = r.id.clock;
  if (i === e)
    return s;
  let o = lt(e / (i + r.length - 1) * s);
  for (; t <= s; ) {
    if (r = n[o], i = r.id.clock, i <= e) {
      if (e < i + r.length)
        return o;
      t = o + 1;
    } else
      s = o - 1;
    o = lt((t + s) / 2);
  }
  throw Be();
}, Vu = (n, e) => {
  const t = n.clients.get(e.client);
  return t[ut(t, e.clock)];
}, li = (
  /** @type {function(StructStore,ID):Item} */
  Vu
), xi = (n, e, t) => {
  const s = ut(e, t), r = e[s];
  return r.id.clock < t && r instanceof Q ? (e.splice(s + 1, 0, Er(n, r, t - r.id.clock)), s + 1) : s;
}, zt = (n, e) => {
  const t = (
    /** @type {Array<Item>} */
    n.doc.store.clients.get(e.client)
  );
  return t[xi(n, t, e.clock)];
}, Po = (n, e, t) => {
  const s = e.clients.get(t.client), r = ut(s, t.clock), i = s[r];
  return t.clock !== i.id.clock + i.length - 1 && i.constructor !== $e && s.splice(r + 1, 0, Er(n, i, t.clock - i.id.clock + 1)), i;
}, $u = (n, e, t) => {
  const s = (
    /** @type {Array<GC|Item>} */
    n.clients.get(e.id.client)
  );
  s[ut(s, e.id.clock)] = t;
}, mc = (n, e, t, s, r) => {
  if (s === 0)
    return;
  const i = t + s;
  let o = xi(n, e, t), a;
  do
    a = e[o++], i < a.id.clock + a.length && xi(n, e, i), r(a);
  while (o < e.length && e[o].id.clock < i);
};
class ju {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, t, s) {
    this.doc = e, this.deleteSet = new Js(), this.beforeState = Hr(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = s, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const Zo = (n, e) => e.deleteSet.clients.size === 0 && !Il(e.afterState, (t, s) => e.beforeState.get(s) !== t) ? !1 : (oo(e.deleteSet), Eu(n, e), os(n, e.deleteSet), !0), Fo = (n, e, t) => {
  const s = e._item;
  (s === null || s.id.clock < (n.beforeState.get(s.id.client) || 0) && !s.deleted) && Gt(n.changed, e, Jn).add(t);
}, ur = (n, e) => {
  let t = n[e], s = n[e - 1], r = e;
  for (; r > 0; t = s, s = n[--r - 1]) {
    if (s.deleted === t.deleted && s.constructor === t.constructor && s.mergeWith(t)) {
      t instanceof Q && t.parentSub !== null && /** @type {AbstractType<any>} */
      t.parent._map.get(t.parentSub) === t && t.parent._map.set(
        t.parentSub,
        /** @type {Item} */
        s
      );
      continue;
    }
    break;
  }
  const i = e - r;
  return i && n.splice(e + 1 - i, i), i;
}, Bu = (n, e, t) => {
  for (const [s, r] of n.clients.entries()) {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let o = r.length - 1; o >= 0; o--) {
      const a = r[o], c = a.clock + a.len;
      for (let h = ut(i, a.clock), u = i[h]; h < i.length && u.id.clock < c; u = i[++h]) {
        const d = i[h];
        if (a.clock + a.len <= d.id.clock)
          break;
        d instanceof Q && d.deleted && !d.keep && t(d) && d.gc(e, !1);
      }
    }
  }
}, Pu = (n, e) => {
  n.clients.forEach((t, s) => {
    const r = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let i = t.length - 1; i >= 0; i--) {
      const o = t[i], a = Ia(r.length - 1, 1 + ut(r, o.clock + o.len - 1));
      for (let c = a, h = r[c]; c > 0 && h.id.clock >= o.clock; h = r[c])
        c -= 1 + ur(r, c);
    }
  });
}, yc = (n, e) => {
  if (e < n.length) {
    const t = n[e], s = t.doc, r = s.store, i = t.deleteSet, o = t._mergeStructs;
    try {
      oo(i), t.afterState = Hr(t.doc.store), s.emit("beforeObserverCalls", [t, s]);
      const a = [];
      t.changed.forEach(
        (c, h) => a.push(() => {
          (h._item === null || !h._item.deleted) && h._callObserver(t, c);
        })
      ), a.push(() => {
        t.changedParentTypes.forEach((c, h) => {
          h._dEH.l.length > 0 && (h._item === null || !h._item.deleted) && (c = c.filter(
            (u) => u.target._item === null || !u.target._item.deleted
          ), c.forEach((u) => {
            u.currentTarget = h, u._path = null;
          }), c.sort((u, d) => u.path.length - d.path.length), a.push(() => {
            fc(h._dEH, c, t);
          }));
        }), a.push(() => s.emit("afterTransaction", [t, s])), a.push(() => {
          t._needFormattingCleanup && ad(t);
        });
      }), Qi(a, []);
    } finally {
      s.gc && Bu(i, r, s.gcFilter), Pu(i, r), t.afterState.forEach((u, d) => {
        const g = t.beforeState.get(d) || 0;
        if (g !== u) {
          const m = (
            /** @type {Array<GC|Item>} */
            r.clients.get(d)
          ), w = gn(ut(m, g), 1);
          for (let S = m.length - 1; S >= w; )
            S -= 1 + ur(m, S);
        }
      });
      for (let u = o.length - 1; u >= 0; u--) {
        const { client: d, clock: g } = o[u].id, m = (
          /** @type {Array<GC|Item>} */
          r.clients.get(d)
        ), w = ut(m, g);
        w + 1 < m.length && ur(m, w + 1) > 1 || w > 0 && ur(m, w);
      }
      if (!t.local && t.afterState.get(s.clientID) !== t.beforeState.get(s.clientID) && (mu(ro, Ya, "[yjs] ", Xa, Qa, "Changed the client-id because another client seems to be using it."), s.clientID = ic()), s.emit("afterTransactionCleanup", [t, s]), s._observers.has("update")) {
        const u = new Gs();
        Zo(u, t) && s.emit("update", [u.toUint8Array(), t.origin, s, t]);
      }
      if (s._observers.has("updateV2")) {
        const u = new hn();
        Zo(u, t) && s.emit("updateV2", [u.toUint8Array(), t.origin, s, t]);
      }
      const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: h } = t;
      (a.size > 0 || h.size > 0 || c.size > 0) && (a.forEach((u) => {
        u.clientID = s.clientID, u.collectionid == null && (u.collectionid = s.collectionid), s.subdocs.add(u);
      }), h.forEach((u) => s.subdocs.delete(u)), s.emit("subdocs", [{ loaded: c, added: a, removed: h }, s, t]), h.forEach((u) => u.destroy())), n.length <= e + 1 ? (s._transactionCleanups = [], s.emit("afterAllTransactions", [s, n])) : yc(n, e + 1);
    }
  }
}, B = (n, e, t = null, s = !0) => {
  const r = n._transactionCleanups;
  let i = !1, o = null;
  n._transaction === null && (i = !0, n._transaction = new ju(n, t, s), r.push(n._transaction), r.length === 1 && n.emit("beforeAllTransactions", [n]), n.emit("beforeTransaction", [n._transaction, n]));
  try {
    o = e(n._transaction);
  } finally {
    if (i) {
      const a = n._transaction === r[0];
      n._transaction = null, a && yc(r, 0);
    }
  }
  return o;
};
function* Zu(n) {
  const e = A(n.restDecoder);
  for (let t = 0; t < e; t++) {
    const s = A(n.restDecoder), r = n.readClient();
    let i = A(n.restDecoder);
    for (let o = 0; o < s; o++) {
      const a = n.readInfo();
      if (a === 10) {
        const c = A(n.restDecoder);
        yield new je(N(r, i), c), i += c;
      } else if ((Ur & a) !== 0) {
        const c = (a & (xt | Le)) === 0, h = new Q(
          N(r, i),
          null,
          // left
          (a & Le) === Le ? n.readLeftID() : null,
          // origin
          null,
          // right
          (a & xt) === xt ? n.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          c ? n.readParentInfo() ? n.readString() : n.readLeftID() : null,
          // parent
          c && (a & Cs) === Cs ? n.readString() : null,
          // parentSub
          Mc(n, a)
          // item content
        );
        yield h, i += h.length;
      } else {
        const c = n.readLen();
        yield new $e(N(r, i), c), i += c;
      }
    }
  }
}
class lo {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, t) {
    this.gen = Zu(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === je);
    return this.curr;
  }
}
class ho {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const Fu = (n) => kr(n, ac, Gs), Ku = (n, e) => {
  if (n.constructor === $e) {
    const { client: t, clock: s } = n.id;
    return new $e(N(t, s + e), n.length - e);
  } else if (n.constructor === je) {
    const { client: t, clock: s } = n.id;
    return new je(N(t, s + e), n.length - e);
  } else {
    const t = (
      /** @type {Item} */
      n
    ), { client: s, clock: r } = t.id;
    return new Q(
      N(s, r + e),
      null,
      N(s, r + e - 1),
      null,
      t.rightOrigin,
      t.parent,
      t.parentSub,
      t.content.splice(e)
    );
  }
}, kr = (n, e = Yn, t = hn) => {
  if (n.length === 1)
    return n[0];
  const s = n.map((u) => new e(rs(u)));
  let r = s.map((u) => new lo(u, !0)), i = null;
  const o = new t(), a = new ho(o);
  for (; r = r.filter((g) => g.curr !== null), r.sort(
    /** @type {function(any,any):number} */
    (g, m) => {
      if (g.curr.id.client === m.curr.id.client) {
        const w = g.curr.id.clock - m.curr.id.clock;
        return w === 0 ? g.curr.constructor === m.curr.constructor ? 0 : g.curr.constructor === je ? 1 : -1 : w;
      } else
        return m.curr.id.client - g.curr.id.client;
    }
  ), r.length !== 0; ) {
    const u = r[0], d = (
      /** @type {Item | GC} */
      u.curr.id.client
    );
    if (i !== null) {
      let g = (
        /** @type {Item | GC | null} */
        u.curr
      ), m = !1;
      for (; g !== null && g.id.clock + g.length <= i.struct.id.clock + i.struct.length && g.id.client >= i.struct.id.client; )
        g = u.next(), m = !0;
      if (g === null || // current decoder is empty
      g.id.client !== d || // check whether there is another decoder that has has updates from `firstClient`
      m && g.id.clock > i.struct.id.clock + i.struct.length)
        continue;
      if (d !== i.struct.id.client)
        Nt(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next();
      else if (i.struct.id.clock + i.struct.length < g.id.clock)
        if (i.struct.constructor === je)
          i.struct.length = g.id.clock + g.length - i.struct.id.clock;
        else {
          Nt(a, i.struct, i.offset);
          const w = g.id.clock - i.struct.id.clock - i.struct.length;
          i = { struct: new je(N(d, i.struct.id.clock + i.struct.length), w), offset: 0 };
        }
      else {
        const w = i.struct.id.clock + i.struct.length - g.id.clock;
        w > 0 && (i.struct.constructor === je ? i.struct.length -= w : g = Ku(g, w)), i.struct.mergeWith(
          /** @type {any} */
          g
        ) || (Nt(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next());
      }
    } else
      i = { struct: (
        /** @type {Item | GC} */
        u.curr
      ), offset: 0 }, u.next();
    for (let g = u.curr; g !== null && g.id.client === d && g.id.clock === i.struct.id.clock + i.struct.length && g.constructor !== je; g = u.next())
      Nt(a, i.struct, i.offset), i = { struct: g, offset: 0 };
  }
  i !== null && (Nt(a, i.struct, i.offset), i = null), uo(a);
  const c = s.map((u) => ao(u)), h = vu(c);
  return os(o, h), o.toUint8Array();
}, zu = (n, e, t = Yn, s = hn) => {
  const r = uc(e), i = new s(), o = new ho(i), a = new t(rs(n)), c = new lo(a, !1);
  for (; c.curr; ) {
    const u = c.curr, d = u.id.client, g = r.get(d) || 0;
    if (c.curr.constructor === je) {
      c.next();
      continue;
    }
    if (u.id.clock + u.length > g)
      for (Nt(o, u, gn(g - u.id.clock, 0)), c.next(); c.curr && c.curr.id.client === d; )
        Nt(o, c.curr, 0), c.next();
    else
      for (; c.curr && c.curr.id.client === d && c.curr.id.clock + c.curr.length <= g; )
        c.next();
  }
  uo(o);
  const h = ao(a);
  return os(i, h), i.toUint8Array();
}, wc = (n) => {
  n.written > 0 && (n.clientStructs.push({ written: n.written, restEncoder: ot(n.encoder.restEncoder) }), n.encoder.restEncoder = Vr(), n.written = 0);
}, Nt = (n, e, t) => {
  n.written > 0 && n.currClient !== e.id.client && wc(n), n.written === 0 && (n.currClient = e.id.client, n.encoder.writeClient(e.id.client), D(n.encoder.restEncoder, e.id.clock + t)), e.write(n.encoder, t), n.written++;
}, uo = (n) => {
  wc(n);
  const e = n.encoder.restEncoder;
  D(e, n.clientStructs.length);
  for (let t = 0; t < n.clientStructs.length; t++) {
    const s = n.clientStructs[t];
    D(e, s.written), $r(e, s.restEncoder);
  }
}, Hu = (n, e, t, s) => {
  const r = new t(rs(n)), i = new lo(r, !1), o = new s(), a = new ho(o);
  for (let h = i.curr; h !== null; h = i.next())
    Nt(a, e(h), 0);
  uo(a);
  const c = ao(r);
  return os(o, c), o.toUint8Array();
}, Wu = (n) => Hu(n, _h, Yn, Gs), Ko = "You must not compute changes after the event-handler fired.";
class Wr {
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
    return this._path || (this._path = Ju(this.currentTarget, this.target));
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
    return rc(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw ht(Ko);
      const e = /* @__PURE__ */ new Map(), t = this.target;
      /** @type Set<string|null> */
      this.transaction.changed.get(t).forEach((r) => {
        if (r !== null) {
          const i = (
            /** @type {Item} */
            t._map.get(r)
          );
          let o, a;
          if (this.adds(i)) {
            let c = i.left;
            for (; c !== null && this.adds(c); )
              c = c.left;
            if (this.deletes(i))
              if (c !== null && this.deletes(c))
                o = "delete", a = ei(c.content.getContent());
              else
                return;
            else
              c !== null && this.deletes(c) ? (o = "update", a = ei(c.content.getContent())) : (o = "add", a = void 0);
          } else if (this.deletes(i))
            o = "delete", a = ei(
              /** @type {Item} */
              i.content.getContent()
            );
          else
            return;
          e.set(r, { action: o, oldValue: a });
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
        throw ht(Ko);
      const t = this.target, s = Jn(), r = Jn(), i = [];
      if (e = {
        added: s,
        deleted: r,
        delta: i,
        keys: this.keys
      }, /** @type Set<string|null> */
      this.transaction.changed.get(t).has(null)) {
        let a = null;
        const c = () => {
          a && i.push(a);
        };
        for (let h = t._start; h !== null; h = h.right)
          h.deleted ? this.deletes(h) && !this.adds(h) && ((a === null || a.delete === void 0) && (c(), a = { delete: 0 }), a.delete += h.length, r.add(h)) : this.adds(h) ? ((a === null || a.insert === void 0) && (c(), a = { insert: [] }), a.insert = a.insert.concat(h.content.getContent()), s.add(h)) : ((a === null || a.retain === void 0) && (c(), a = { retain: 0 }), a.retain += h.length);
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
const Ju = (n, e) => {
  const t = [];
  for (; e._item !== null && e !== n; ) {
    if (e._item.parentSub !== null)
      t.unshift(e._item.parentSub);
    else {
      let s = 0, r = (
        /** @type {AbstractType<any>} */
        e._item.parent._start
      );
      for (; r !== e._item && r !== null; )
        !r.deleted && r.countable && (s += r.length), r = r.right;
      t.unshift(s);
    }
    e = /** @type {AbstractType<any>} */
    e._item.parent;
  }
  return t;
}, pe = () => {
  yu("Invalid access: Add Yjs type to a document before reading data.");
}, _c = 80;
let fo = 0;
class Gu {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, t) {
    e.marker = !0, this.p = e, this.index = t, this.timestamp = fo++;
  }
}
const qu = (n) => {
  n.timestamp = fo++;
}, vc = (n, e, t) => {
  n.p.marker = !1, n.p = e, e.marker = !0, n.index = t, n.timestamp = fo++;
}, Yu = (n, e, t) => {
  if (n.length >= _c) {
    const s = n.reduce((r, i) => r.timestamp < i.timestamp ? r : i);
    return vc(s, e, t), s;
  } else {
    const s = new Gu(e, t);
    return n.push(s), s;
  }
}, Jr = (n, e) => {
  if (n._start === null || e === 0 || n._searchMarker === null)
    return null;
  const t = n._searchMarker.length === 0 ? null : n._searchMarker.reduce((i, o) => ar(e - i.index) < ar(e - o.index) ? i : o);
  let s = n._start, r = 0;
  for (t !== null && (s = t.p, r = t.index, qu(t)); s.right !== null && r < e; ) {
    if (!s.deleted && s.countable) {
      if (e < r + s.length)
        break;
      r += s.length;
    }
    s = s.right;
  }
  for (; s.left !== null && r > e; )
    s = s.left, !s.deleted && s.countable && (r -= s.length);
  for (; s.left !== null && s.left.id.client === s.id.client && s.left.id.clock + s.left.length === s.id.clock; )
    s = s.left, !s.deleted && s.countable && (r -= s.length);
  return t !== null && ar(t.index - r) < /** @type {YText|YArray<any>} */
  s.parent.length / _c ? (vc(t, s, r), t) : Yu(n._searchMarker, s, r);
}, Ns = (n, e, t) => {
  for (let s = n.length - 1; s >= 0; s--) {
    const r = n[s];
    if (t > 0) {
      let i = r.p;
      for (i.marker = !1; i && (i.deleted || !i.countable); )
        i = i.left, i && !i.deleted && i.countable && (r.index -= i.length);
      if (i === null || i.marker === !0) {
        n.splice(s, 1);
        continue;
      }
      r.p = i, i.marker = !0;
    }
    (e < r.index || t > 0 && e === r.index) && (r.index = gn(e, r.index + t));
  }
}, Gr = (n, e, t) => {
  const s = n, r = e.changedParentTypes;
  for (; Gt(r, n, () => []).push(t), n._item !== null; )
    n = /** @type {AbstractType<any>} */
    n._item.parent;
  fc(s._eH, t, e);
};
class ue {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = $o(), this._dEH = $o(), this._searchMarker = null;
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
    throw Ye();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw Ye();
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
    jo(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    jo(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    Bo(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    Bo(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const kc = (n, e, t) => {
  n.doc ?? pe(), e < 0 && (e = n._length + e), t < 0 && (t = n._length + t);
  let s = t - e;
  const r = [];
  let i = n._start;
  for (; i !== null && s > 0; ) {
    if (i.countable && !i.deleted) {
      const o = i.content.getContent();
      if (o.length <= e)
        e -= o.length;
      else {
        for (let a = e; a < o.length && s > 0; a++)
          r.push(o[a]), s--;
        e = 0;
      }
    }
    i = i.right;
  }
  return r;
}, bc = (n) => {
  n.doc ?? pe();
  const e = [];
  let t = n._start;
  for (; t !== null; ) {
    if (t.countable && !t.deleted) {
      const s = t.content.getContent();
      for (let r = 0; r < s.length; r++)
        e.push(s[r]);
    }
    t = t.right;
  }
  return e;
}, Ls = (n, e) => {
  let t = 0, s = n._start;
  for (n.doc ?? pe(); s !== null; ) {
    if (s.countable && !s.deleted) {
      const r = s.content.getContent();
      for (let i = 0; i < r.length; i++)
        e(r[i], t++, n);
    }
    s = s.right;
  }
}, Sc = (n, e) => {
  const t = [];
  return Ls(n, (s, r) => {
    t.push(e(s, r, n));
  }), t;
}, Xu = (n) => {
  let e = n._start, t = null, s = 0;
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
        t = e.content.getContent(), s = 0, e = e.right;
      }
      const r = t[s++];
      return t.length <= s && (t = null), {
        done: !1,
        value: r
      };
    }
  };
}, xc = (n, e) => {
  n.doc ?? pe();
  const t = Jr(n, e);
  let s = n._start;
  for (t !== null && (s = t.p, e -= t.index); s !== null; s = s.right)
    if (!s.deleted && s.countable) {
      if (e < s.length)
        return s.content.getContent()[e];
      e -= s.length;
    }
}, br = (n, e, t, s) => {
  let r = t;
  const i = n.doc, o = i.clientID, a = i.store, c = t === null ? e._start : t.right;
  let h = [];
  const u = () => {
    h.length > 0 && (r = new Q(N(o, se(a, o)), r, r && r.lastId, c, c && c.id, e, null, new dn(h)), r.integrate(n, 0), h = []);
  };
  s.forEach((d) => {
    if (d === null)
      h.push(d);
    else
      switch (d.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          h.push(d);
          break;
        default:
          switch (u(), d.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              r = new Q(N(o, se(a, o)), r, r && r.lastId, c, c && c.id, e, null, new qs(new Uint8Array(
                /** @type {Uint8Array} */
                d
              ))), r.integrate(n, 0);
              break;
            case ln:
              r = new Q(N(o, se(a, o)), r, r && r.lastId, c, c && c.id, e, null, new Ys(
                /** @type {Doc} */
                d
              )), r.integrate(n, 0);
              break;
            default:
              if (d instanceof ue)
                r = new Q(N(o, se(a, o)), r, r && r.lastId, c, c && c.id, e, null, new Et(d)), r.integrate(n, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), u();
}, Cc = () => ht("Length exceeded!"), Ic = (n, e, t, s) => {
  if (t > e._length)
    throw Cc();
  if (t === 0)
    return e._searchMarker && Ns(e._searchMarker, t, s.length), br(n, e, null, s);
  const r = t, i = Jr(e, t);
  let o = e._start;
  for (i !== null && (o = i.p, t -= i.index, t === 0 && (o = o.prev, t += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right)
    if (!o.deleted && o.countable) {
      if (t <= o.length) {
        t < o.length && zt(n, N(o.id.client, o.id.clock + t));
        break;
      }
      t -= o.length;
    }
  return e._searchMarker && Ns(e._searchMarker, r, s.length), br(n, e, o, s);
}, Qu = (n, e, t) => {
  let r = (e._searchMarker || []).reduce((i, o) => o.index > i.index ? o : i, { index: 0, p: e._start }).p;
  if (r)
    for (; r.right; )
      r = r.right;
  return br(n, e, r, t);
}, Ec = (n, e, t, s) => {
  if (s === 0)
    return;
  const r = t, i = s, o = Jr(e, t);
  let a = e._start;
  for (o !== null && (a = o.p, t -= o.index); a !== null && t > 0; a = a.right)
    !a.deleted && a.countable && (t < a.length && zt(n, N(a.id.client, a.id.clock + t)), t -= a.length);
  for (; s > 0 && a !== null; )
    a.deleted || (s < a.length && zt(n, N(a.id.client, a.id.clock + s)), a.delete(n), s -= a.length), a = a.right;
  if (s > 0)
    throw Cc();
  e._searchMarker && Ns(
    e._searchMarker,
    r,
    -i + s
    /* in case we remove the above exception */
  );
}, Sr = (n, e, t) => {
  const s = e._map.get(t);
  s !== void 0 && s.delete(n);
}, go = (n, e, t, s) => {
  const r = e._map.get(t) || null, i = n.doc, o = i.clientID;
  let a;
  if (s == null)
    a = new dn([s]);
  else
    switch (s.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        a = new dn([s]);
        break;
      case Uint8Array:
        a = new qs(
          /** @type {Uint8Array} */
          s
        );
        break;
      case ln:
        a = new Ys(
          /** @type {Doc} */
          s
        );
        break;
      default:
        if (s instanceof ue)
          a = new Et(s);
        else
          throw new Error("Unexpected content type");
    }
  new Q(N(o, se(i.store, o)), r, r && r.lastId, null, null, e, t, a).integrate(n, 0);
}, po = (n, e) => {
  n.doc ?? pe();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted ? t.content.getContent()[t.length - 1] : void 0;
}, Tc = (n) => {
  const e = {};
  return n.doc ?? pe(), n._map.forEach((t, s) => {
    t.deleted || (e[s] = t.content.getContent()[t.length - 1]);
  }), e;
}, Ac = (n, e) => {
  n.doc ?? pe();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted;
}, ed = (n, e) => {
  const t = {};
  return n._map.forEach((s, r) => {
    let i = s;
    for (; i !== null && (!e.sv.has(i.id.client) || i.id.clock >= (e.sv.get(i.id.client) || 0)); )
      i = i.left;
    i !== null && kn(i, e) && (t[r] = i.content.getContent()[i.length - 1]);
  }), t;
}, sr = (n) => (n.doc ?? pe(), wu(
  n._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class td extends Wr {
}
class Nn extends ue {
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
    const t = new Nn();
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
    return new Nn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new Nn();
    return e.insert(0, this.toArray().map(
      (t) => t instanceof ue ? (
        /** @type {typeof el} */
        t.clone()
      ) : t
    )), e;
  }
  get length() {
    return this.doc ?? pe(), this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    super._callObserver(e, t), Gr(this, e, new td(this, e));
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
    this.doc !== null ? B(this.doc, (s) => {
      Ic(
        s,
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
    this.doc !== null ? B(this.doc, (t) => {
      Qu(
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
    this.doc !== null ? B(this.doc, (s) => {
      Ec(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return xc(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return bc(this);
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
    return kc(this, e, t);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof ue ? e.toJSON() : e);
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
    return Sc(
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
    Ls(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return Xu(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Id);
  }
}
const nd = (n) => new Nn();
class sd extends Wr {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, t, s) {
    super(e, t), this.keysChanged = s;
  }
}
class L extends ue {
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
    super._integrate(e, t), this._prelimContent.forEach((s, r) => {
      this.set(r, s);
    }), this._prelimContent = null;
  }
  /**
   * @return {YMap<MapType>}
   */
  _copy() {
    return new L();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const e = new L();
    return this.forEach((t, s) => {
      e.set(s, t instanceof ue ? (
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
    Gr(this, e, new sd(this, e, t));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? pe();
    const e = {};
    return this._map.forEach((t, s) => {
      if (!t.deleted) {
        const r = t.content.getContent()[t.length - 1];
        e[s] = r instanceof ue ? r.toJSON() : r;
      }
    }), e;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...sr(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return ai(
      sr(this),
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
    return ai(
      sr(this),
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
    return ai(
      sr(this),
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
    this.doc ?? pe(), this._map.forEach((t, s) => {
      t.deleted || e(t.content.getContent()[t.length - 1], s, this);
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
    this.doc !== null ? B(this.doc, (t) => {
      Sr(t, this, e);
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
    return this.doc !== null ? B(this.doc, (s) => {
      go(
        s,
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
      po(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return Ac(this, e);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    this.doc !== null ? B(this.doc, (e) => {
      this.forEach(function(t, s, r) {
        Sr(e, r, s);
      });
    }) : this._prelimContent.clear();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Ed);
  }
}
const rd = (n) => new L(), Pt = (n, e) => n === e || typeof n == "object" && typeof e == "object" && n && e && yh(n, e);
class Ci {
  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
  constructor(e, t, s, r) {
    this.left = e, this.right = t, this.index = s, this.currentAttributes = r;
  }
  /**
   * Only call this if you know that this.right is defined
   */
  forward() {
    switch (this.right === null && Be(), this.right.content.constructor) {
      case ee:
        this.right.deleted || as(
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
const zo = (n, e, t) => {
  for (; e.right !== null && t > 0; ) {
    switch (e.right.content.constructor) {
      case ee:
        e.right.deleted || as(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (t < e.right.length && zt(n, N(e.right.id.client, e.right.id.clock + t)), e.index += e.right.length, t -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, rr = (n, e, t, s) => {
  const r = /* @__PURE__ */ new Map(), i = s ? Jr(e, t) : null;
  if (i) {
    const o = new Ci(i.p.left, i.p, i.index, r);
    return zo(n, o, t - i.index);
  } else {
    const o = new Ci(null, e._start, 0, r);
    return zo(n, o, t);
  }
}, Oc = (n, e, t, s) => {
  for (; t.right !== null && (t.right.deleted === !0 || t.right.content.constructor === ee && Pt(
    s.get(
      /** @type {ContentFormat} */
      t.right.content.key
    ),
    /** @type {ContentFormat} */
    t.right.content.value
  )); )
    t.right.deleted || s.delete(
      /** @type {ContentFormat} */
      t.right.content.key
    ), t.forward();
  const r = n.doc, i = r.clientID;
  s.forEach((o, a) => {
    const c = t.left, h = t.right, u = new Q(N(i, se(r.store, i)), c, c && c.lastId, h, h && h.id, e, null, new ee(a, o));
    u.integrate(n, 0), t.right = u, t.forward();
  });
}, as = (n, e) => {
  const { key: t, value: s } = e;
  s === null ? n.delete(t) : n.set(t, s);
}, Dc = (n, e) => {
  for (; n.right !== null; ) {
    if (!(n.right.deleted || n.right.content.constructor === ee && Pt(
      e[
        /** @type {ContentFormat} */
        n.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      n.right.content.value
    ))) break;
    n.forward();
  }
}, Nc = (n, e, t, s) => {
  const r = n.doc, i = r.clientID, o = /* @__PURE__ */ new Map();
  for (const a in s) {
    const c = s[a], h = t.currentAttributes.get(a) ?? null;
    if (!Pt(h, c)) {
      o.set(a, h);
      const { left: u, right: d } = t;
      t.right = new Q(N(i, se(r.store, i)), u, u && u.lastId, d, d && d.id, e, null, new ee(a, c)), t.right.integrate(n, 0), t.forward();
    }
  }
  return o;
}, hi = (n, e, t, s, r) => {
  t.currentAttributes.forEach((g, m) => {
    r[m] === void 0 && (r[m] = null);
  });
  const i = n.doc, o = i.clientID;
  Dc(t, r);
  const a = Nc(n, e, t, r), c = s.constructor === String ? new dt(
    /** @type {string} */
    s
  ) : s instanceof ue ? new Et(s) : new pn(s);
  let { left: h, right: u, index: d } = t;
  e._searchMarker && Ns(e._searchMarker, t.index, c.getLength()), u = new Q(N(o, se(i.store, o)), h, h && h.lastId, u, u && u.id, e, null, c), u.integrate(n, 0), t.right = u, t.index = d, t.forward(), Oc(n, e, t, a);
}, Ho = (n, e, t, s, r) => {
  const i = n.doc, o = i.clientID;
  Dc(t, r);
  const a = Nc(n, e, t, r);
  e: for (; t.right !== null && (s > 0 || a.size > 0 && (t.right.deleted || t.right.content.constructor === ee)); ) {
    if (!t.right.deleted)
      switch (t.right.content.constructor) {
        case ee: {
          const { key: c, value: h } = (
            /** @type {ContentFormat} */
            t.right.content
          ), u = r[c];
          if (u !== void 0) {
            if (Pt(u, h))
              a.delete(c);
            else {
              if (s === 0)
                break e;
              a.set(c, h);
            }
            t.right.delete(n);
          } else
            t.currentAttributes.set(c, h);
          break;
        }
        default:
          s < t.right.length && zt(n, N(t.right.id.client, t.right.id.clock + s)), s -= t.right.length;
          break;
      }
    t.forward();
  }
  if (s > 0) {
    let c = "";
    for (; s > 0; s--)
      c += `
`;
    t.right = new Q(N(o, se(i.store, o)), t.left, t.left && t.left.lastId, t.right, t.right && t.right.id, e, null, new dt(c)), t.right.integrate(n, 0), t.forward();
  }
  Oc(n, e, t, a);
}, Lc = (n, e, t, s, r) => {
  let i = e;
  const o = qe();
  for (; i && (!i.countable || i.deleted); ) {
    if (!i.deleted && i.content.constructor === ee) {
      const h = (
        /** @type {ContentFormat} */
        i.content
      );
      o.set(h.key, h);
    }
    i = i.right;
  }
  let a = 0, c = !1;
  for (; e !== i; ) {
    if (t === e && (c = !0), !e.deleted) {
      const h = e.content;
      switch (h.constructor) {
        case ee: {
          const { key: u, value: d } = (
            /** @type {ContentFormat} */
            h
          ), g = s.get(u) ?? null;
          (o.get(u) !== h || g === d) && (e.delete(n), a++, !c && (r.get(u) ?? null) === d && g !== d && (g === null ? r.delete(u) : r.set(u, g))), !c && !e.deleted && as(
            r,
            /** @type {ContentFormat} */
            h
          );
          break;
        }
      }
    }
    e = /** @type {Item} */
    e.right;
  }
  return a;
}, id = (n, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const t = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === ee) {
      const s = (
        /** @type {ContentFormat} */
        e.content.key
      );
      t.has(s) ? e.delete(n) : t.add(s);
    }
    e = e.left;
  }
}, od = (n) => {
  let e = 0;
  return B(
    /** @type {Doc} */
    n.doc,
    (t) => {
      let s = (
        /** @type {Item} */
        n._start
      ), r = n._start, i = qe();
      const o = yi(i);
      for (; r; ) {
        if (r.deleted === !1)
          switch (r.content.constructor) {
            case ee:
              as(
                o,
                /** @type {ContentFormat} */
                r.content
              );
              break;
            default:
              e += Lc(t, s, r, i, o), i = yi(o), s = r;
              break;
          }
        r = r.right;
      }
    }
  ), e;
}, ad = (n) => {
  const e = /* @__PURE__ */ new Set(), t = n.doc;
  for (const [s, r] of n.afterState.entries()) {
    const i = n.beforeState.get(s) || 0;
    r !== i && mc(
      n,
      /** @type {Array<Item|GC>} */
      t.store.clients.get(s),
      i,
      r,
      (o) => {
        !o.deleted && /** @type {Item} */
        o.content.constructor === ee && o.constructor !== $e && e.add(
          /** @type {any} */
          o.parent
        );
      }
    );
  }
  B(t, (s) => {
    sc(n, n.deleteSet, (r) => {
      if (r instanceof $e || !/** @type {YText} */
      r.parent._hasFormatting || e.has(
        /** @type {YText} */
        r.parent
      ))
        return;
      const i = (
        /** @type {YText} */
        r.parent
      );
      r.content.constructor === ee ? e.add(i) : id(s, r);
    });
    for (const r of e)
      od(r);
  });
}, Wo = (n, e, t) => {
  const s = t, r = yi(e.currentAttributes), i = e.right;
  for (; t > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case Et:
        case pn:
        case dt:
          t < e.right.length && zt(n, N(e.right.id.client, e.right.id.clock + t)), t -= e.right.length, e.right.delete(n);
          break;
      }
    e.forward();
  }
  i && Lc(n, i, e.right, r, e.currentAttributes);
  const o = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return o._searchMarker && Ns(o._searchMarker, e.index, -s + t), e;
};
class cd extends Wr {
  /**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
  constructor(e, t, s) {
    super(e, t), this.childListChanged = !1, this.keysChanged = /* @__PURE__ */ new Set(), s.forEach((r) => {
      r === null ? this.childListChanged = !0 : this.keysChanged.add(r);
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
      B(e, (s) => {
        const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
        let o = this.target._start, a = null;
        const c = {};
        let h = "", u = 0, d = 0;
        const g = () => {
          if (a !== null) {
            let m = null;
            switch (a) {
              case "delete":
                d > 0 && (m = { delete: d }), d = 0;
                break;
              case "insert":
                (typeof h == "object" || h.length > 0) && (m = { insert: h }, r.size > 0 && (m.attributes = {}, r.forEach((w, S) => {
                  w !== null && (m.attributes[S] = w);
                }))), h = "";
                break;
              case "retain":
                u > 0 && (m = { retain: u }, mh(c) || (m.attributes = fh({}, c))), u = 0;
                break;
            }
            m && t.push(m), a = null;
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case Et:
            case pn:
              this.adds(o) ? this.deletes(o) || (g(), a = "insert", h = o.content.getContent()[0], g()) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), d += 1) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += 1);
              break;
            case dt:
              this.adds(o) ? this.deletes(o) || (a !== "insert" && (g(), a = "insert"), h += /** @type {ContentString} */
              o.content.str) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), d += o.length) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += o.length);
              break;
            case ee: {
              const { key: m, value: w } = (
                /** @type {ContentFormat} */
                o.content
              );
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const S = r.get(m) ?? null;
                  Pt(S, w) ? w !== null && o.delete(s) : (a === "retain" && g(), Pt(w, i.get(m) ?? null) ? delete c[m] : c[m] = w);
                }
              } else if (this.deletes(o)) {
                i.set(m, w);
                const S = r.get(m) ?? null;
                Pt(S, w) || (a === "retain" && g(), c[m] = S);
              } else if (!o.deleted) {
                i.set(m, w);
                const S = c[m];
                S !== void 0 && (Pt(S, w) ? S !== null && o.delete(s) : (a === "retain" && g(), w === null ? delete c[m] : c[m] = w));
              }
              o.deleted || (a === "insert" && g(), as(
                r,
                /** @type {ContentFormat} */
                o.content
              ));
              break;
            }
          }
          o = o.right;
        }
        for (g(); t.length > 0; ) {
          const m = t[t.length - 1];
          if (m.retain !== void 0 && m.attributes === void 0)
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
class K extends ue {
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
    return this.doc ?? pe(), this._length;
  }
  /**
   * @param {Doc} y
   * @param {Item} item
   */
  _integrate(e, t) {
    super._integrate(e, t);
    try {
      this._pending.forEach((s) => s());
    } catch (s) {
      console.error(s);
    }
    this._pending = null;
  }
  _copy() {
    return new K();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const e = new K();
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
    const s = new cd(this, e, t);
    Gr(this, e, s), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? pe();
    let e = "", t = this._start;
    for (; t !== null; )
      !t.deleted && t.countable && t.content.constructor === dt && (e += /** @type {ContentString} */
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
    this.doc !== null ? B(this.doc, (s) => {
      const r = new Ci(null, this._start, 0, /* @__PURE__ */ new Map());
      for (let i = 0; i < e.length; i++) {
        const o = e[i];
        if (o.insert !== void 0) {
          const a = !t && typeof o.insert == "string" && i === e.length - 1 && r.right === null && o.insert.slice(-1) === `
` ? o.insert.slice(0, -1) : o.insert;
          (typeof a != "string" || a.length > 0) && hi(s, this, r, a, o.attributes || {});
        } else o.retain !== void 0 ? Ho(s, this, r, o.retain, o.attributes || {}) : o.delete !== void 0 && Wo(s, r, o.delete);
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
  toDelta(e, t, s) {
    this.doc ?? pe();
    const r = [], i = /* @__PURE__ */ new Map(), o = (
      /** @type {Doc} */
      this.doc
    );
    let a = "", c = this._start;
    function h() {
      if (a.length > 0) {
        const d = {};
        let g = !1;
        i.forEach((w, S) => {
          g = !0, d[S] = w;
        });
        const m = { insert: a };
        g && (m.attributes = d), r.push(m), a = "";
      }
    }
    const u = () => {
      for (; c !== null; ) {
        if (kn(c, e) || t !== void 0 && kn(c, t))
          switch (c.content.constructor) {
            case dt: {
              const d = i.get("ychange");
              e !== void 0 && !kn(c, e) ? (d === void 0 || d.user !== c.id.client || d.type !== "removed") && (h(), i.set("ychange", s ? s("removed", c.id) : { type: "removed" })) : t !== void 0 && !kn(c, t) ? (d === void 0 || d.user !== c.id.client || d.type !== "added") && (h(), i.set("ychange", s ? s("added", c.id) : { type: "added" })) : d !== void 0 && (h(), i.delete("ychange")), a += /** @type {ContentString} */
              c.content.str;
              break;
            }
            case Et:
            case pn: {
              h();
              const d = {
                insert: c.content.getContent()[0]
              };
              if (i.size > 0) {
                const g = (
                  /** @type {Object<string,any>} */
                  {}
                );
                d.attributes = g, i.forEach((m, w) => {
                  g[w] = m;
                });
              }
              r.push(d);
              break;
            }
            case ee:
              kn(c, e) && (h(), as(
                i,
                /** @type {ContentFormat} */
                c.content
              ));
              break;
          }
        c = c.right;
      }
      h();
    };
    return e || t ? B(o, (d) => {
      e && Si(d, e), t && Si(d, t), u();
    }, "cleanup") : u(), r;
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
  insert(e, t, s) {
    if (t.length <= 0)
      return;
    const r = this.doc;
    r !== null ? B(r, (i) => {
      const o = rr(i, this, e, !s);
      s || (s = {}, o.currentAttributes.forEach((a, c) => {
        s[c] = a;
      })), hi(i, this, o, t, s);
    }) : this._pending.push(() => this.insert(e, t, s));
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
  insertEmbed(e, t, s) {
    const r = this.doc;
    r !== null ? B(r, (i) => {
      const o = rr(i, this, e, !s);
      hi(i, this, o, t, s || {});
    }) : this._pending.push(() => this.insertEmbed(e, t, s || {}));
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
    const s = this.doc;
    s !== null ? B(s, (r) => {
      Wo(r, rr(r, this, e, !0), t);
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
  format(e, t, s) {
    if (t === 0)
      return;
    const r = this.doc;
    r !== null ? B(r, (i) => {
      const o = rr(i, this, e, !1);
      o.right !== null && Ho(i, this, o, t, s);
    }) : this._pending.push(() => this.format(e, t, s));
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
    this.doc !== null ? B(this.doc, (t) => {
      Sr(t, this, e);
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
    this.doc !== null ? B(this.doc, (s) => {
      go(s, this, e, t);
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
      po(this, e)
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
    return Tc(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Td);
  }
}
const ld = (n) => new K();
class ui {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(e, t = () => !0) {
    this._filter = t, this._root = e, this._currentNode = /** @type {Item} */
    e._start, this._firstCall = !0, e.doc ?? pe();
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
        e.content.type, !e.deleted && (t.constructor === Xn || t.constructor === un) && t._start !== null)
          e = t._start;
        else
          for (; e !== null; ) {
            const s = e.next;
            if (s !== null) {
              e = s;
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
class un extends ue {
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
    return new un();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new un();
    return e.insert(0, this.toArray().map((t) => t instanceof ue ? t.clone() : t)), e;
  }
  get length() {
    return this.doc ?? pe(), this._prelimContent === null ? this._length : this._prelimContent.length;
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
    return new ui(this, e);
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
    const s = new ui(this, (r) => r.nodeName && r.nodeName.toUpperCase() === e).next();
    return s.done ? null : s.value;
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
    return e = e.toUpperCase(), Kt(new ui(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    Gr(this, e, new dd(this, t, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return Sc(this, (e) => e.toString()).join("");
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
  toDOM(e = document, t = {}, s) {
    const r = e.createDocumentFragment();
    return s !== void 0 && s._createAssociation(r, this), Ls(this, (i) => {
      r.insertBefore(i.toDOM(e, t, s), null);
    }), r;
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
    this.doc !== null ? B(this.doc, (s) => {
      Ic(s, this, e, t);
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
      B(this.doc, (s) => {
        const r = e && e instanceof ue ? e._item : e;
        br(s, this, r, t);
      });
    else {
      const s = (
        /** @type {Array<any>} */
        this._prelimContent
      ), r = e === null ? 0 : s.findIndex((i) => i === e) + 1;
      if (r === 0 && e !== null)
        throw ht("Reference item not found");
      s.splice(r, 0, ...t);
    }
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */
  delete(e, t = 1) {
    this.doc !== null ? B(this.doc, (s) => {
      Ec(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return bc(this);
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
    return xc(this, e);
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
    return kc(this, e, t);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Ls(this, e);
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
    e.writeTypeRef(Od);
  }
}
const hd = (n) => new un();
class Xn extends un {
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
    this._prelimAttrs.forEach((s, r) => {
      this.setAttribute(r, s);
    }), this._prelimAttrs = null;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   *
   * @return {YXmlElement}
   */
  _copy() {
    return new Xn(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new Xn(this.nodeName), t = this.getAttributes();
    return ph(t, (s, r) => {
      e.setAttribute(
        r,
        /** @type {any} */
        s
      );
    }), e.insert(0, this.toArray().map((s) => s instanceof ue ? s.clone() : s)), e;
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
    const e = this.getAttributes(), t = [], s = [];
    for (const a in e)
      s.push(a);
    s.sort();
    const r = s.length;
    for (let a = 0; a < r; a++) {
      const c = s[a];
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
    this.doc !== null ? B(this.doc, (t) => {
      Sr(t, this, e);
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
    this.doc !== null ? B(this.doc, (s) => {
      go(s, this, e, t);
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
      po(this, e)
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
      Ac(this, e)
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
      e ? ed(this, e) : Tc(this)
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
  toDOM(e = document, t = {}, s) {
    const r = e.createElement(this.nodeName), i = this.getAttributes();
    for (const o in i) {
      const a = i[o];
      typeof a == "string" && r.setAttribute(o, a);
    }
    return Ls(this, (o) => {
      r.appendChild(o.toDOM(e, t, s));
    }), s !== void 0 && s._createAssociation(r, this), r;
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
    e.writeTypeRef(Ad), e.writeKey(this.nodeName);
  }
}
const ud = (n) => new Xn(n.readKey());
class dd extends Wr {
  /**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
  constructor(e, t, s) {
    super(e, s), this.childListChanged = !1, this.attributesChanged = /* @__PURE__ */ new Set(), t.forEach((r) => {
      r === null ? this.childListChanged = !0 : this.attributesChanged.add(r);
    });
  }
}
class xr extends L {
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
    return new xr(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const e = new xr(this.hookName);
    return this.forEach((t, s) => {
      e.set(s, t);
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
  toDOM(e = document, t = {}, s) {
    const r = t[this.hookName];
    let i;
    return r !== void 0 ? i = r.createDom(this) : i = document.createElement(this.hookName), i.setAttribute("data-yjs-hook", this.hookName), s !== void 0 && s._createAssociation(i, this), i;
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
    e.writeTypeRef(Dd), e.writeKey(this.hookName);
  }
}
const fd = (n) => new xr(n.readKey());
class Cr extends K {
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
    return new Cr();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const e = new Cr();
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
  toDOM(e = document, t, s) {
    const r = e.createTextNode(this.toString());
    return s !== void 0 && s._createAssociation(r, this), r;
  }
  toString() {
    return this.toDelta().map((e) => {
      const t = [];
      for (const r in e.attributes) {
        const i = [];
        for (const o in e.attributes[r])
          i.push({ key: o, value: e.attributes[r][o] });
        i.sort((o, a) => o.key < a.key ? -1 : 1), t.push({ nodeName: r, attrs: i });
      }
      t.sort((r, i) => r.nodeName < i.nodeName ? -1 : 1);
      let s = "";
      for (let r = 0; r < t.length; r++) {
        const i = t[r];
        s += `<${i.nodeName}`;
        for (let o = 0; o < i.attrs.length; o++) {
          const a = i.attrs[o];
          s += ` ${a.key}="${a.value}"`;
        }
        s += ">";
      }
      s += e.insert;
      for (let r = t.length - 1; r >= 0; r--)
        s += `</${t[r].nodeName}>`;
      return s;
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
    e.writeTypeRef(Nd);
  }
}
const gd = (n) => new Cr();
class mo {
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
    throw Ye();
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
  write(e, t, s) {
    throw Ye();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    throw Ye();
  }
}
const pd = 0;
class $e extends mo {
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
    t > 0 && (this.id.clock += t, this.length -= t), pc(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(pd), e.writeLen(this.length - t);
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
class qs {
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
    return new qs(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(e) {
    throw Ye();
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
const md = (n) => new qs(n.readBuf());
class Rs {
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
    return new Rs(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const t = new Rs(this.len - e);
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
    vr(e.deleteSet, t.id.client, t.id.clock, this.len), t.markDeleted();
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
const yd = (n) => new Rs(n.readLen()), Rc = (n, e) => new ln({ guid: n, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class Ys {
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
    return new Ys(Rc(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(e) {
    throw Ye();
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
const wd = (n) => new Ys(Rc(n.readString(), n.readAny()));
class pn {
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
    return new pn(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(e) {
    throw Ye();
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
const _d = (n) => new pn(n.readJSON());
class ee {
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
    return new ee(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(e) {
    throw Ye();
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
    const s = (
      /** @type {YText} */
      t.parent
    );
    s._searchMarker = null, s._hasFormatting = !0;
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
const vd = (n) => new ee(n.readKey(), n.readJSON());
class Ir {
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
    return new Ir(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(e) {
    const t = new Ir(this.arr.slice(e));
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
    const s = this.arr.length;
    e.writeLen(s - t);
    for (let r = t; r < s; r++) {
      const i = this.arr[r];
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
const kd = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++) {
    const r = n.readString();
    r === "undefined" ? t.push(void 0) : t.push(JSON.parse(r));
  }
  return new Ir(t);
}, bd = mr("node_env") === "development";
class dn {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, bd && La(e);
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
    return new dn(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const t = new dn(this.arr.slice(e));
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
    const s = this.arr.length;
    e.writeLen(s - t);
    for (let r = t; r < s; r++) {
      const i = this.arr[r];
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
const Sd = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++)
    t.push(n.readAny());
  return new dn(t);
};
class dt {
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
    return new dt(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(e) {
    const t = new dt(this.str.slice(e));
    this.str = this.str.slice(0, e);
    const s = this.str.charCodeAt(e - 1);
    return s >= 55296 && s <= 56319 && (this.str = this.str.slice(0, e - 1) + "�", t.str = "�" + t.str.slice(1)), t;
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
const xd = (n) => new dt(n.readString()), Cd = [
  nd,
  rd,
  ld,
  ud,
  hd,
  fd,
  gd
], Id = 0, Ed = 1, Td = 2, Ad = 3, Od = 4, Dd = 5, Nd = 6;
class Et {
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
    return new Et(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(e) {
    throw Ye();
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
    this.type._map.forEach((s) => {
      s.deleted ? s.id.clock < (e.beforeState.get(s.id.client) || 0) && e._mergeStructs.push(s) : s.delete(e);
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
      (s) => {
        for (; s !== null; )
          s.gc(e, !0), s = s.left;
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
const Ld = (n) => new Et(Cd[n.readTypeRef()](n)), Er = (n, e, t) => {
  const { client: s, clock: r } = e.id, i = new Q(
    N(s, r + t),
    e,
    N(s, r + t - 1),
    e.right,
    e.rightOrigin,
    e.parent,
    e.parentSub,
    e.content.splice(t)
  );
  return e.deleted && i.markDeleted(), e.keep && (i.keep = !0), e.redone !== null && (i.redone = N(e.redone.client, e.redone.clock + t)), e.right = i, i.right !== null && (i.right.left = i), n._mergeStructs.push(i), i.parentSub !== null && i.right === null && i.parent._map.set(i.parentSub, i), e.length = t, i;
};
class Q extends mo {
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
  constructor(e, t, s, r, i, o, a, c) {
    super(e, c.getLength()), this.origin = s, this.left = t, this.right = r, this.rightOrigin = i, this.parent = o, this.parentSub = a, this.redone = null, this.content = c, this.info = this.content.isCountable() ? xo : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & ni) > 0 !== e && (this.info ^= ni);
  }
  get marker() {
    return (this.info & ni) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & So) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= So);
  }
  get countable() {
    return (this.info & xo) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & ti) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= ti);
  }
  markDeleted() {
    this.info |= ti;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= se(t, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= se(t, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === Dn && this.id.client !== this.parent.client && this.parent.clock >= se(t, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = Po(e, t, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = zt(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === $e || this.right && this.right.constructor === $e)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === Q ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === Q && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === Dn) {
      const s = li(t, this.parent);
      s.constructor === $e ? this.parent = null : this.parent = /** @type {ContentType} */
      s.content.type;
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    if (t > 0 && (this.id.clock += t, this.left = Po(e, e.doc.store, N(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let s = this.left, r;
        if (s !== null)
          r = s.right;
        else if (this.parentSub !== null)
          for (r = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; r !== null && r.left !== null; )
            r = r.left;
        else
          r = /** @type {AbstractType<any>} */
          this.parent._start;
        const i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
        for (; r !== null && r !== this.right; ) {
          if (o.add(r), i.add(r), nr(this.origin, r.origin)) {
            if (r.id.client < this.id.client)
              s = r, i.clear();
            else if (nr(this.rightOrigin, r.rightOrigin))
              break;
          } else if (r.origin !== null && o.has(li(e.doc.store, r.origin)))
            i.has(li(e.doc.store, r.origin)) || (s = r, i.clear());
          else
            break;
          r = r.right;
        }
        this.left = s;
      }
      if (this.left !== null) {
        const s = this.left.right;
        this.right = s, this.left.right = this;
      } else {
        let s;
        if (this.parentSub !== null)
          for (s = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; s !== null && s.left !== null; )
            s = s.left;
        else
          s = /** @type {AbstractType<any>} */
          this.parent._start, this.parent._start = this;
        this.right = s;
      }
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), pc(e.doc.store, this), this.content.integrate(e, this), Fo(
        e,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      ), /** @type {AbstractType<any>} */
      (this.parent._item !== null && /** @type {AbstractType<any>} */
      this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
    } else
      new $e(this.id, this.length).integrate(e, 0);
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
    return this.length === 1 ? this.id : N(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(e) {
    if (this.constructor === e.constructor && nr(e.origin, this.lastId) && this.right === e && nr(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
      const t = (
        /** @type {AbstractType<any>} */
        this.parent._searchMarker
      );
      return t && t.forEach((s) => {
        s.p === e && (s.p = this, !this.deleted && this.countable && (s.index -= this.length));
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
      this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), vr(e.deleteSet, this.id.client, this.id.clock, this.length), Fo(e, t, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, t) {
    if (!this.deleted)
      throw Be();
    this.content.gc(e), t ? $u(e, this, new $e(this.id, this.length)) : this.content = new Rs(this.length);
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
    const s = t > 0 ? N(this.id.client, this.id.clock + t - 1) : this.origin, r = this.rightOrigin, i = this.parentSub, o = this.content.getRef() & Ur | (s === null ? 0 : Le) | // origin is defined
    (r === null ? 0 : xt) | // right origin is defined
    (i === null ? 0 : Cs);
    if (e.writeInfo(o), s !== null && e.writeLeftID(s), r !== null && e.writeRightID(r), s === null && r === null) {
      const a = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const h = Uu(a);
          e.writeParentInfo(!0), e.writeString(h);
        } else
          e.writeParentInfo(!1), e.writeLeftID(c.id);
      } else a.constructor === String ? (e.writeParentInfo(!0), e.writeString(a)) : a.constructor === Dn ? (e.writeParentInfo(!1), e.writeLeftID(a)) : Be();
      i !== null && e.writeString(i);
    }
    this.content.write(e, t);
  }
}
const Mc = (n, e) => Rd[e & Ur](n), Rd = [
  () => {
    Be();
  },
  // GC is not ItemContent
  yd,
  // 1
  kd,
  // 2
  md,
  // 3
  xd,
  // 4
  _d,
  // 5
  vd,
  // 6
  Ld,
  // 7
  Sd,
  // 8
  wd,
  // 9
  () => {
    Be();
  }
  // 10 - Skip is not ItemContent
], Md = 10;
class je extends mo {
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
    Be();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(Md), D(e.restEncoder, this.length - t);
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
const Uc = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), Vc = "__ $YJS$ __";
Uc[Vc] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
Uc[Vc] = !0;
var U;
(function(n) {
  n.assertEqual = (r) => {
  };
  function e(r) {
  }
  n.assertIs = e;
  function t(r) {
    throw new Error();
  }
  n.assertNever = t, n.arrayToEnum = (r) => {
    const i = {};
    for (const o of r)
      i[o] = o;
    return i;
  }, n.getValidEnumValues = (r) => {
    const i = n.objectKeys(r).filter((a) => typeof r[r[a]] != "number"), o = {};
    for (const a of i)
      o[a] = r[a];
    return n.objectValues(o);
  }, n.objectValues = (r) => n.objectKeys(r).map(function(i) {
    return r[i];
  }), n.objectKeys = typeof Object.keys == "function" ? (r) => Object.keys(r) : (r) => {
    const i = [];
    for (const o in r)
      Object.prototype.hasOwnProperty.call(r, o) && i.push(o);
    return i;
  }, n.find = (r, i) => {
    for (const o of r)
      if (i(o))
        return o;
  }, n.isInteger = typeof Number.isInteger == "function" ? (r) => Number.isInteger(r) : (r) => typeof r == "number" && Number.isFinite(r) && Math.floor(r) === r;
  function s(r, i = " | ") {
    return r.map((o) => typeof o == "string" ? `'${o}'` : o).join(i);
  }
  n.joinValues = s, n.jsonStringifyReplacer = (r, i) => typeof i == "bigint" ? i.toString() : i;
})(U || (U = {}));
var Jo;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Jo || (Jo = {}));
const k = U.arrayToEnum([
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
]), Dt = (n) => {
  switch (typeof n) {
    case "undefined":
      return k.undefined;
    case "string":
      return k.string;
    case "number":
      return Number.isNaN(n) ? k.nan : k.number;
    case "boolean":
      return k.boolean;
    case "function":
      return k.function;
    case "bigint":
      return k.bigint;
    case "symbol":
      return k.symbol;
    case "object":
      return Array.isArray(n) ? k.array : n === null ? k.null : n.then && typeof n.then == "function" && n.catch && typeof n.catch == "function" ? k.promise : typeof Map < "u" && n instanceof Map ? k.map : typeof Set < "u" && n instanceof Set ? k.set : typeof Date < "u" && n instanceof Date ? k.date : k.object;
    default:
      return k.unknown;
  }
}, y = U.arrayToEnum([
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
class Ct extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (s) => {
      this.issues = [...this.issues, s];
    }, this.addIssues = (s = []) => {
      this.issues = [...this.issues, ...s];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(i) {
      return i.message;
    }, s = { _errors: [] }, r = (i) => {
      for (const o of i.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(r);
        else if (o.code === "invalid_return_type")
          r(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          r(o.argumentsError);
        else if (o.path.length === 0)
          s._errors.push(t(o));
        else {
          let a = s, c = 0;
          for (; c < o.path.length; ) {
            const h = o.path[c];
            c === o.path.length - 1 ? (a[h] = a[h] || { _errors: [] }, a[h]._errors.push(t(o))) : a[h] = a[h] || { _errors: [] }, a = a[h], c++;
          }
        }
    };
    return r(this), s;
  }
  static assert(e) {
    if (!(e instanceof Ct))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, U.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const r of this.issues)
      if (r.path.length > 0) {
        const i = r.path[0];
        t[i] = t[i] || [], t[i].push(e(r));
      } else
        s.push(e(r));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Ct.create = (n) => new Ct(n);
const Ii = (n, e) => {
  let t;
  switch (n.code) {
    case y.invalid_type:
      n.received === k.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case y.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, U.jsonStringifyReplacer)}`;
      break;
    case y.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${U.joinValues(n.keys, ", ")}`;
      break;
    case y.invalid_union:
      t = "Invalid input";
      break;
    case y.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${U.joinValues(n.options)}`;
      break;
    case y.invalid_enum_value:
      t = `Invalid enum value. Expected ${U.joinValues(n.options)}, received '${n.received}'`;
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
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : U.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
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
      t = e.defaultError, U.assertNever(n);
  }
  return { message: t };
};
let Ud = Ii;
function Vd() {
  return Ud;
}
const $d = (n) => {
  const { data: e, path: t, errorMaps: s, issueData: r } = n, i = [...t, ...r.path || []], o = {
    ...r,
    path: i
  };
  if (r.message !== void 0)
    return {
      ...r,
      path: i,
      message: r.message
    };
  let a = "";
  const c = s.filter((h) => !!h).slice().reverse();
  for (const h of c)
    a = h(o, { data: e, defaultError: a }).message;
  return {
    ...r,
    path: i,
    message: a
  };
};
function _(n, e) {
  const t = Vd(), s = $d({
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
      t === Ii ? void 0 : Ii
      // then global default map
    ].filter((r) => !!r)
  });
  n.common.issues.push(s);
}
class Re {
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
    const s = [];
    for (const r of t) {
      if (r.status === "aborted")
        return C;
      r.status === "dirty" && e.dirty(), s.push(r.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const r of t) {
      const i = await r.key, o = await r.value;
      s.push({
        key: i,
        value: o
      });
    }
    return Re.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const r of t) {
      const { key: i, value: o } = r;
      if (i.status === "aborted" || o.status === "aborted")
        return C;
      i.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof o.value < "u" || r.alwaysSet) && (s[i.value] = o.value);
    }
    return { status: e.value, value: s };
  }
}
const C = Object.freeze({
  status: "aborted"
}), ps = (n) => ({ status: "dirty", value: n }), Pe = (n) => ({ status: "valid", value: n }), Go = (n) => n.status === "aborted", qo = (n) => n.status === "dirty", Qn = (n) => n.status === "valid", Tr = (n) => typeof Promise < "u" && n instanceof Promise;
var b;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(b || (b = {}));
class Ht {
  constructor(e, t, s, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Yo = (n, e) => {
  if (Qn(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ct(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function O(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: r } = n;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: r } : { errorMap: (o, a) => {
    const { message: c } = n;
    return o.code === "invalid_enum_value" ? { message: c ?? a.defaultError } : typeof a.data > "u" ? { message: c ?? s ?? a.defaultError } : o.code !== "invalid_type" ? { message: a.defaultError } : { message: c ?? t ?? a.defaultError };
  }, description: r };
}
class R {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Dt(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Dt(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Re(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Dt(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Tr(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const s = this.safeParse(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  safeParse(e, t) {
    const s = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Dt(e)
    }, r = this._parseSync({ data: e, path: s.path, parent: s });
    return Yo(s, r);
  }
  "~validate"(e) {
    var s, r;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Dt(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return Qn(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (r = (s = i == null ? void 0 : i.message) == null ? void 0 : s.toLowerCase()) != null && r.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => Qn(i) ? {
      value: i.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const s = await this.safeParseAsync(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  async safeParseAsync(e, t) {
    const s = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Dt(e)
    }, r = this._parse({ data: e, path: s.path, parent: s }), i = await (Tr(r) ? r : Promise.resolve(r));
    return Yo(s, i);
  }
  refine(e, t) {
    const s = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, i) => {
      const o = e(r), a = () => i.addIssue({
        code: y.custom,
        ...s(r)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((c) => c ? !0 : (a(), !1)) : o ? !0 : (a(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, r) => e(s) ? !0 : (r.addIssue(typeof t == "function" ? t(s, r) : t), !1));
  }
  _refinement(e) {
    return new ns({
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
    return Ft.create(this, this._def);
  }
  nullable() {
    return ss.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return at.create(this);
  }
  promise() {
    return Nr.create(this, this._def);
  }
  or(e) {
    return Or.create([this, e], this._def);
  }
  and(e) {
    return Dr.create(this, e, this._def);
  }
  transform(e) {
    return new ns({
      ...O(this._def),
      schema: this,
      typeName: I.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ti({
      ...O(this._def),
      innerType: this,
      defaultValue: t,
      typeName: I.ZodDefault
    });
  }
  brand() {
    return new cf({
      typeName: I.ZodBranded,
      type: this,
      ...O(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ai({
      ...O(this._def),
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
    return yo.create(this, e);
  }
  readonly() {
    return Oi.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const jd = /^c[^\s-]{8,}$/i, Bd = /^[0-9a-z]+$/, Pd = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Zd = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Fd = /^[a-z0-9_-]{21}$/i, Kd = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, zd = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Hd = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Wd = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let di;
const Jd = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Gd = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, qd = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Yd = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Xd = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Qd = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, $c = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", ef = new RegExp(`^${$c}$`);
function jc(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function tf(n) {
  return new RegExp(`^${jc(n)}$`);
}
function nf(n) {
  let e = `${$c}T${jc(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function sf(n, e) {
  return !!((e === "v4" || !e) && Jd.test(n) || (e === "v6" || !e) && qd.test(n));
}
function rf(n, e) {
  if (!Kd.test(n))
    return !1;
  try {
    const [t] = n.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), r = JSON.parse(atob(s));
    return !(typeof r != "object" || r === null || "typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || e && r.alg !== e);
  } catch {
    return !1;
  }
}
function of(n, e) {
  return !!((e === "v4" || !e) && Gd.test(n) || (e === "v6" || !e) && Yd.test(n));
}
class Zt extends R {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== k.string) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: k.string,
        received: i.parsedType
      }), C;
    }
    const s = new Re();
    let r;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (r = this._getOrReturnCtx(e, r), _(r, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (r = this._getOrReturnCtx(e, r), _(r, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "length") {
        const o = e.data.length > i.value, a = e.data.length < i.value;
        (o || a) && (r = this._getOrReturnCtx(e, r), o ? _(r, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : a && _(r, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), s.dirty());
      } else if (i.kind === "email")
        Hd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "emoji")
        di || (di = new RegExp(Wd, "u")), di.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "uuid")
        Zd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "nanoid")
        Fd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid")
        jd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid2")
        Bd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "ulid")
        Pd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
          validation: "ulid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), _(r, {
            validation: "url",
            code: y.invalid_string,
            message: i.message
          }), s.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "regex",
        code: y.invalid_string,
        message: i.message
      }), s.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), s.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "datetime" ? nf(i).test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), s.dirty()) : i.kind === "date" ? ef.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), s.dirty()) : i.kind === "time" ? tf(i).test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), s.dirty()) : i.kind === "duration" ? zd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "ip" ? sf(e.data, i.version) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "jwt" ? rf(e.data, i.alg) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "cidr" ? of(e.data, i.version) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64" ? Xd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64url" ? Qd.test(e.data) || (r = this._getOrReturnCtx(e, r), _(r, {
        validation: "base64url",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : U.assertNever(i);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((r) => e.test(r), {
      validation: t,
      code: y.invalid_string,
      ...b.errToObj(s)
    });
  }
  _addCheck(e) {
    return new Zt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...b.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...b.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...b.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...b.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...b.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...b.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...b.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...b.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...b.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...b.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...b.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...b.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...b.errToObj(e) });
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
      ...b.errToObj(e == null ? void 0 : e.message)
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
      ...b.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...b.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...b.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...b.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...b.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...b.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...b.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...b.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...b.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, b.errToObj(e));
  }
  trim() {
    return new Zt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new Zt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new Zt({
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
Zt.create = (n) => new Zt({
  checks: [],
  typeName: I.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...O(n)
});
function af(n, e) {
  const t = (n.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, r = t > s ? t : s, i = Number.parseInt(n.toFixed(r).replace(".", "")), o = Number.parseInt(e.toFixed(r).replace(".", ""));
  return i % o / 10 ** r;
}
class es extends R {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== k.number) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: k.number,
        received: i.parsedType
      }), C;
    }
    let s;
    const r = new Re();
    for (const i of this._def.checks)
      i.kind === "int" ? U.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), r.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? af(e.data, i.value) !== 0 && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.not_finite,
        message: i.message
      }), r.dirty()) : U.assertNever(i);
    return { status: r.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, b.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, b.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, b.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, b.toString(t));
  }
  setLimit(e, t, s, r) {
    return new es({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: b.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new es({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: b.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: b.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: b.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: b.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: b.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: b.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: b.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: b.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: b.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && U.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const s of this._def.checks) {
      if (s.kind === "finite" || s.kind === "int" || s.kind === "multipleOf")
        return !0;
      s.kind === "min" ? (t === null || s.value > t) && (t = s.value) : s.kind === "max" && (e === null || s.value < e) && (e = s.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
es.create = (n) => new es({
  checks: [],
  typeName: I.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...O(n)
});
class Ms extends R {
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
    if (this._getType(e) !== k.bigint)
      return this._getInvalidInput(e);
    let s;
    const r = new Re();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), _(s, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : U.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return _(t, {
      code: y.invalid_type,
      expected: k.bigint,
      received: t.parsedType
    }), C;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, b.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, b.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, b.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, b.toString(t));
  }
  setLimit(e, t, s, r) {
    return new Ms({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: b.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Ms({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: b.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: b.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: b.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: b.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: b.toString(t)
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
Ms.create = (n) => new Ms({
  checks: [],
  typeName: I.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...O(n)
});
class Xo extends R {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== k.boolean) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.boolean,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Xo.create = (n) => new Xo({
  typeName: I.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...O(n)
});
class Ar extends R {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== k.date) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_type,
        expected: k.date,
        received: i.parsedType
      }), C;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return _(i, {
        code: y.invalid_date
      }), C;
    }
    const s = new Re();
    let r;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), s.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (r = this._getOrReturnCtx(e, r), _(r, {
        code: y.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), s.dirty()) : U.assertNever(i);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new Ar({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: b.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: b.toString(t)
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
Ar.create = (n) => new Ar({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: I.ZodDate,
  ...O(n)
});
class Qo extends R {
  _parse(e) {
    if (this._getType(e) !== k.symbol) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.symbol,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Qo.create = (n) => new Qo({
  typeName: I.ZodSymbol,
  ...O(n)
});
class ea extends R {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.undefined,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
ea.create = (n) => new ea({
  typeName: I.ZodUndefined,
  ...O(n)
});
class ta extends R {
  _parse(e) {
    if (this._getType(e) !== k.null) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.null,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
ta.create = (n) => new ta({
  typeName: I.ZodNull,
  ...O(n)
});
class na extends R {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Pe(e.data);
  }
}
na.create = (n) => new na({
  typeName: I.ZodAny,
  ...O(n)
});
class sa extends R {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Pe(e.data);
  }
}
sa.create = (n) => new sa({
  typeName: I.ZodUnknown,
  ...O(n)
});
class Wt extends R {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return _(t, {
      code: y.invalid_type,
      expected: k.never,
      received: t.parsedType
    }), C;
  }
}
Wt.create = (n) => new Wt({
  typeName: I.ZodNever,
  ...O(n)
});
class ra extends R {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.void,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
ra.create = (n) => new ra({
  typeName: I.ZodVoid,
  ...O(n)
});
class at extends R {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== k.array)
      return _(t, {
        code: y.invalid_type,
        expected: k.array,
        received: t.parsedType
      }), C;
    if (r.exactLength !== null) {
      const o = t.data.length > r.exactLength.value, a = t.data.length < r.exactLength.value;
      (o || a) && (_(t, {
        code: o ? y.too_big : y.too_small,
        minimum: a ? r.exactLength.value : void 0,
        maximum: o ? r.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: r.exactLength.message
      }), s.dirty());
    }
    if (r.minLength !== null && t.data.length < r.minLength.value && (_(t, {
      code: y.too_small,
      minimum: r.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.minLength.message
    }), s.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (_(t, {
      code: y.too_big,
      maximum: r.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, a) => r.type._parseAsync(new Ht(t, o, t.path, a)))).then((o) => Re.mergeArray(s, o));
    const i = [...t.data].map((o, a) => r.type._parseSync(new Ht(t, o, t.path, a)));
    return Re.mergeArray(s, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new at({
      ...this._def,
      minLength: { value: e, message: b.toString(t) }
    });
  }
  max(e, t) {
    return new at({
      ...this._def,
      maxLength: { value: e, message: b.toString(t) }
    });
  }
  length(e, t) {
    return new at({
      ...this._def,
      exactLength: { value: e, message: b.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
at.create = (n, e) => new at({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: I.ZodArray,
  ...O(e)
});
function bn(n) {
  if (n instanceof X) {
    const e = {};
    for (const t in n.shape) {
      const s = n.shape[t];
      e[t] = Ft.create(bn(s));
    }
    return new X({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof at ? new at({
    ...n._def,
    type: bn(n.element)
  }) : n instanceof Ft ? Ft.create(bn(n.unwrap())) : n instanceof ss ? ss.create(bn(n.unwrap())) : n instanceof fn ? fn.create(n.items.map((e) => bn(e))) : n;
}
class X extends R {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = U.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== k.object) {
      const h = this._getOrReturnCtx(e);
      return _(h, {
        code: y.invalid_type,
        expected: k.object,
        received: h.parsedType
      }), C;
    }
    const { status: s, ctx: r } = this._processInputParams(e), { shape: i, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof Wt && this._def.unknownKeys === "strip"))
      for (const h in r.data)
        o.includes(h) || a.push(h);
    const c = [];
    for (const h of o) {
      const u = i[h], d = r.data[h];
      c.push({
        key: { status: "valid", value: h },
        value: u._parse(new Ht(r, d, r.path, h)),
        alwaysSet: h in r.data
      });
    }
    if (this._def.catchall instanceof Wt) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const u of a)
          c.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: r.data[u] }
          });
      else if (h === "strict")
        a.length > 0 && (_(r, {
          code: y.unrecognized_keys,
          keys: a
        }), s.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const u of a) {
        const d = r.data[u];
        c.push({
          key: { status: "valid", value: u },
          value: h._parse(
            new Ht(r, d, r.path, u)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: u in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const u of c) {
        const d = await u.key, g = await u.value;
        h.push({
          key: d,
          value: g,
          alwaysSet: u.alwaysSet
        });
      }
      return h;
    }).then((h) => Re.mergeObjectSync(s, h)) : Re.mergeObjectSync(s, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return b.errToObj, new X({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var i, o;
          const r = ((o = (i = this._def).errorMap) == null ? void 0 : o.call(i, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: b.errToObj(e).message ?? r
          } : {
            message: r
          };
        }
      } : {}
    });
  }
  strip() {
    return new X({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new X({
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
    return new X({
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
    return new X({
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
    return new X({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of U.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new X({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of U.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new X({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return bn(this);
  }
  partial(e) {
    const t = {};
    for (const s of U.objectKeys(this.shape)) {
      const r = this.shape[s];
      e && !e[s] ? t[s] = r : t[s] = r.optional();
    }
    return new X({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of U.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let i = this.shape[s];
        for (; i instanceof Ft; )
          i = i._def.innerType;
        t[s] = i;
      }
    return new X({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Bc(U.objectKeys(this.shape));
  }
}
X.create = (n, e) => new X({
  shape: () => n,
  unknownKeys: "strip",
  catchall: Wt.create(),
  typeName: I.ZodObject,
  ...O(e)
});
X.strictCreate = (n, e) => new X({
  shape: () => n,
  unknownKeys: "strict",
  catchall: Wt.create(),
  typeName: I.ZodObject,
  ...O(e)
});
X.lazycreate = (n, e) => new X({
  shape: n,
  unknownKeys: "strip",
  catchall: Wt.create(),
  typeName: I.ZodObject,
  ...O(e)
});
class Or extends R {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function r(i) {
      for (const a of i)
        if (a.result.status === "valid")
          return a.result;
      for (const a of i)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((a) => new Ct(a.ctx.common.issues));
      return _(t, {
        code: y.invalid_union,
        unionErrors: o
      }), C;
    }
    if (t.common.async)
      return Promise.all(s.map(async (i) => {
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
      })).then(r);
    {
      let i;
      const o = [];
      for (const c of s) {
        const h = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, u = c._parseSync({
          data: t.data,
          path: t.path,
          parent: h
        });
        if (u.status === "valid")
          return u;
        u.status === "dirty" && !i && (i = { result: u, ctx: h }), h.common.issues.length && o.push(h.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const a = o.map((c) => new Ct(c));
      return _(t, {
        code: y.invalid_union,
        unionErrors: a
      }), C;
    }
  }
  get options() {
    return this._def.options;
  }
}
Or.create = (n, e) => new Or({
  options: n,
  typeName: I.ZodUnion,
  ...O(e)
});
function Ei(n, e) {
  const t = Dt(n), s = Dt(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === k.object && s === k.object) {
    const r = U.objectKeys(e), i = U.objectKeys(n).filter((a) => r.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of i) {
      const c = Ei(n[a], e[a]);
      if (!c.valid)
        return { valid: !1 };
      o[a] = c.data;
    }
    return { valid: !0, data: o };
  } else if (t === k.array && s === k.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const r = [];
    for (let i = 0; i < n.length; i++) {
      const o = n[i], a = e[i], c = Ei(o, a);
      if (!c.valid)
        return { valid: !1 };
      r.push(c.data);
    }
    return { valid: !0, data: r };
  } else return t === k.date && s === k.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class Dr extends R {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), r = (i, o) => {
      if (Go(i) || Go(o))
        return C;
      const a = Ei(i.value, o.value);
      return a.valid ? ((qo(i) || qo(o)) && t.dirty(), { status: t.value, value: a.data }) : (_(s, {
        code: y.invalid_intersection_types
      }), C);
    };
    return s.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      }),
      this._def.right._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      })
    ]).then(([i, o]) => r(i, o)) : r(this._def.left._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }), this._def.right._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }));
  }
}
Dr.create = (n, e, t) => new Dr({
  left: n,
  right: e,
  typeName: I.ZodIntersection,
  ...O(t)
});
class fn extends R {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.array)
      return _(s, {
        code: y.invalid_type,
        expected: k.array,
        received: s.parsedType
      }), C;
    if (s.data.length < this._def.items.length)
      return _(s, {
        code: y.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), C;
    !this._def.rest && s.data.length > this._def.items.length && (_(s, {
      code: y.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...s.data].map((o, a) => {
      const c = this._def.items[a] || this._def.rest;
      return c ? c._parse(new Ht(s, o, s.path, a)) : null;
    }).filter((o) => !!o);
    return s.common.async ? Promise.all(i).then((o) => Re.mergeArray(t, o)) : Re.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new fn({
      ...this._def,
      rest: e
    });
  }
}
fn.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new fn({
    items: n,
    typeName: I.ZodTuple,
    rest: null,
    ...O(e)
  });
};
class ia extends R {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.map)
      return _(s, {
        code: y.invalid_type,
        expected: k.map,
        received: s.parsedType
      }), C;
    const r = this._def.keyType, i = this._def.valueType, o = [...s.data.entries()].map(([a, c], h) => ({
      key: r._parse(new Ht(s, a, s.path, [h, "key"])),
      value: i._parse(new Ht(s, c, s.path, [h, "value"]))
    }));
    if (s.common.async) {
      const a = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of o) {
          const h = await c.key, u = await c.value;
          if (h.status === "aborted" || u.status === "aborted")
            return C;
          (h.status === "dirty" || u.status === "dirty") && t.dirty(), a.set(h.value, u.value);
        }
        return { status: t.value, value: a };
      });
    } else {
      const a = /* @__PURE__ */ new Map();
      for (const c of o) {
        const h = c.key, u = c.value;
        if (h.status === "aborted" || u.status === "aborted")
          return C;
        (h.status === "dirty" || u.status === "dirty") && t.dirty(), a.set(h.value, u.value);
      }
      return { status: t.value, value: a };
    }
  }
}
ia.create = (n, e, t) => new ia({
  valueType: e,
  keyType: n,
  typeName: I.ZodMap,
  ...O(t)
});
class Us extends R {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.set)
      return _(s, {
        code: y.invalid_type,
        expected: k.set,
        received: s.parsedType
      }), C;
    const r = this._def;
    r.minSize !== null && s.data.size < r.minSize.value && (_(s, {
      code: y.too_small,
      minimum: r.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.minSize.message
    }), t.dirty()), r.maxSize !== null && s.data.size > r.maxSize.value && (_(s, {
      code: y.too_big,
      maximum: r.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function o(c) {
      const h = /* @__PURE__ */ new Set();
      for (const u of c) {
        if (u.status === "aborted")
          return C;
        u.status === "dirty" && t.dirty(), h.add(u.value);
      }
      return { status: t.value, value: h };
    }
    const a = [...s.data.values()].map((c, h) => i._parse(new Ht(s, c, s.path, h)));
    return s.common.async ? Promise.all(a).then((c) => o(c)) : o(a);
  }
  min(e, t) {
    return new Us({
      ...this._def,
      minSize: { value: e, message: b.toString(t) }
    });
  }
  max(e, t) {
    return new Us({
      ...this._def,
      maxSize: { value: e, message: b.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Us.create = (n, e) => new Us({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: I.ZodSet,
  ...O(e)
});
class oa extends R {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
oa.create = (n, e) => new oa({
  getter: n,
  typeName: I.ZodLazy,
  ...O(e)
});
class aa extends R {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return _(t, {
        received: t.data,
        code: y.invalid_literal,
        expected: this._def.value
      }), C;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
aa.create = (n, e) => new aa({
  value: n,
  typeName: I.ZodLiteral,
  ...O(e)
});
function Bc(n, e) {
  return new ts({
    values: n,
    typeName: I.ZodEnum,
    ...O(e)
  });
}
class ts extends R {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return _(t, {
        expected: U.joinValues(s),
        received: t.parsedType,
        code: y.invalid_type
      }), C;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return _(t, {
        received: t.data,
        code: y.invalid_enum_value,
        options: s
      }), C;
    }
    return Pe(e.data);
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
    return ts.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return ts.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
ts.create = Bc;
class ca extends R {
  _parse(e) {
    const t = U.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== k.string && s.parsedType !== k.number) {
      const r = U.objectValues(t);
      return _(s, {
        expected: U.joinValues(r),
        received: s.parsedType,
        code: y.invalid_type
      }), C;
    }
    if (this._cache || (this._cache = new Set(U.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = U.objectValues(t);
      return _(s, {
        received: s.data,
        code: y.invalid_enum_value,
        options: r
      }), C;
    }
    return Pe(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
ca.create = (n, e) => new ca({
  values: n,
  typeName: I.ZodNativeEnum,
  ...O(e)
});
class Nr extends R {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== k.promise && t.common.async === !1)
      return _(t, {
        code: y.invalid_type,
        expected: k.promise,
        received: t.parsedType
      }), C;
    const s = t.parsedType === k.promise ? t.data : Promise.resolve(t.data);
    return Pe(s.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Nr.create = (n, e) => new Nr({
  type: n,
  typeName: I.ZodPromise,
  ...O(e)
});
class ns extends R {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === I.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), r = this._def.effect || null, i = {
      addIssue: (o) => {
        _(s, o), o.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), r.type === "preprocess") {
      const o = r.transform(s.data, i);
      if (s.common.async)
        return Promise.resolve(o).then(async (a) => {
          if (t.value === "aborted")
            return C;
          const c = await this._def.schema._parseAsync({
            data: a,
            path: s.path,
            parent: s
          });
          return c.status === "aborted" ? C : c.status === "dirty" || t.value === "dirty" ? ps(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return C;
        const a = this._def.schema._parseSync({
          data: o,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? C : a.status === "dirty" || t.value === "dirty" ? ps(a.value) : a;
      }
    }
    if (r.type === "refinement") {
      const o = (a) => {
        const c = r.refinement(a, i);
        if (s.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return a;
      };
      if (s.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? C : (a.status === "dirty" && t.dirty(), o(a.value), { status: t.value, value: a.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((a) => a.status === "aborted" ? C : (a.status === "dirty" && t.dirty(), o(a.value).then(() => ({ status: t.value, value: a.value }))));
    }
    if (r.type === "transform")
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!Qn(o))
          return C;
        const a = r.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => Qn(o) ? Promise.resolve(r.transform(o.value, i)).then((a) => ({
          status: t.value,
          value: a
        })) : C);
    U.assertNever(r);
  }
}
ns.create = (n, e, t) => new ns({
  schema: n,
  typeName: I.ZodEffects,
  effect: e,
  ...O(t)
});
ns.createWithPreprocess = (n, e, t) => new ns({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: I.ZodEffects,
  ...O(t)
});
class Ft extends R {
  _parse(e) {
    return this._getType(e) === k.undefined ? Pe(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ft.create = (n, e) => new Ft({
  innerType: n,
  typeName: I.ZodOptional,
  ...O(e)
});
class ss extends R {
  _parse(e) {
    return this._getType(e) === k.null ? Pe(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ss.create = (n, e) => new ss({
  innerType: n,
  typeName: I.ZodNullable,
  ...O(e)
});
class Ti extends R {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === k.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Ti.create = (n, e) => new Ti({
  innerType: n,
  typeName: I.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...O(e)
});
class Ai extends R {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, r = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return Tr(r) ? r.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new Ct(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new Ct(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Ai.create = (n, e) => new Ai({
  innerType: n,
  typeName: I.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...O(e)
});
class la extends R {
  _parse(e) {
    if (this._getType(e) !== k.nan) {
      const s = this._getOrReturnCtx(e);
      return _(s, {
        code: y.invalid_type,
        expected: k.nan,
        received: s.parsedType
      }), C;
    }
    return { status: "valid", value: e.data };
  }
}
la.create = (n) => new la({
  typeName: I.ZodNaN,
  ...O(n)
});
class cf extends R {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = t.data;
    return this._def.type._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class yo extends R {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return i.status === "aborted" ? C : i.status === "dirty" ? (t.dirty(), ps(i.value)) : this._def.out._parseAsync({
          data: i.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const r = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return r.status === "aborted" ? C : r.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: r.value
      }) : this._def.out._parseSync({
        data: r.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new yo({
      in: e,
      out: t,
      typeName: I.ZodPipeline
    });
  }
}
class Oi extends R {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (r) => (Qn(r) && (r.value = Object.freeze(r.value)), r);
    return Tr(t) ? t.then((r) => s(r)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Oi.create = (n, e) => new Oi({
  innerType: n,
  typeName: I.ZodReadonly,
  ...O(e)
});
var I;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(I || (I = {}));
const Pc = Zt.create, lf = es.create;
Wt.create;
at.create;
Or.create;
Dr.create;
fn.create;
ts.create;
Nr.create;
Ft.create;
ss.create;
var he = Uint8Array, Ne = Uint16Array, wo = Int32Array, qr = new he([
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
]), Yr = new he([
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
]), Di = new he([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Zc = function(n, e) {
  for (var t = new Ne(31), s = 0; s < 31; ++s)
    t[s] = e += 1 << n[s - 1];
  for (var r = new wo(t[30]), s = 1; s < 30; ++s)
    for (var i = t[s]; i < t[s + 1]; ++i)
      r[i] = i - t[s] << 5 | s;
  return { b: t, r };
}, Fc = Zc(qr, 2), Kc = Fc.b, Ni = Fc.r;
Kc[28] = 258, Ni[258] = 28;
var zc = Zc(Yr, 0), hf = zc.b, ha = zc.r, Li = new Ne(32768);
for (var F = 0; F < 32768; ++F) {
  var At = (F & 43690) >> 1 | (F & 21845) << 1;
  At = (At & 52428) >> 2 | (At & 13107) << 2, At = (At & 61680) >> 4 | (At & 3855) << 4, Li[F] = ((At & 65280) >> 8 | (At & 255) << 8) >> 1;
}
var ct = (function(n, e, t) {
  for (var s = n.length, r = 0, i = new Ne(e); r < s; ++r)
    n[r] && ++i[n[r] - 1];
  var o = new Ne(e);
  for (r = 1; r < e; ++r)
    o[r] = o[r - 1] + i[r - 1] << 1;
  var a;
  if (t) {
    a = new Ne(1 << e);
    var c = 15 - e;
    for (r = 0; r < s; ++r)
      if (n[r])
        for (var h = r << 4 | n[r], u = e - n[r], d = o[n[r] - 1]++ << u, g = d | (1 << u) - 1; d <= g; ++d)
          a[Li[d] >> c] = h;
  } else
    for (a = new Ne(s), r = 0; r < s; ++r)
      n[r] && (a[r] = Li[o[n[r] - 1]++] >> 15 - n[r]);
  return a;
}), Jt = new he(288);
for (var F = 0; F < 144; ++F)
  Jt[F] = 8;
for (var F = 144; F < 256; ++F)
  Jt[F] = 9;
for (var F = 256; F < 280; ++F)
  Jt[F] = 7;
for (var F = 280; F < 288; ++F)
  Jt[F] = 8;
var Vs = new he(32);
for (var F = 0; F < 32; ++F)
  Vs[F] = 5;
var uf = /* @__PURE__ */ ct(Jt, 9, 0), df = /* @__PURE__ */ ct(Jt, 9, 1), ff = /* @__PURE__ */ ct(Vs, 5, 0), gf = /* @__PURE__ */ ct(Vs, 5, 1), fi = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Ze = function(n, e, t) {
  var s = e / 8 | 0;
  return (n[s] | n[s + 1] << 8) >> (e & 7) & t;
}, gi = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, _o = function(n) {
  return (n + 7) / 8 | 0;
}, Hc = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new he(n.subarray(e, t));
}, pf = [
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
], Ke = function(n, e, t) {
  var s = new Error(e || pf[n]);
  if (s.code = n, Error.captureStackTrace && Error.captureStackTrace(s, Ke), !t)
    throw s;
  return s;
}, mf = function(n, e, t, s) {
  var r = n.length, i = 0;
  if (!r || e.f && !e.l)
    return t || new he(0);
  var o = !t, a = o || e.i != 2, c = e.i;
  o && (t = new he(r * 3));
  var h = function(ls) {
    var hs = t.length;
    if (ls > hs) {
      var wn = new he(Math.max(hs * 2, ls));
      wn.set(t), t = wn;
    }
  }, u = e.f || 0, d = e.p || 0, g = e.b || 0, m = e.l, w = e.d, S = e.m, j = e.n, Se = r * 8;
  do {
    if (!m) {
      u = Ze(n, d, 1);
      var Z = Ze(n, d + 1, 3);
      if (d += 3, Z)
        if (Z == 1)
          m = df, w = gf, S = 9, j = 5;
        else if (Z == 2) {
          var we = Ze(n, d, 31) + 257, ie = Ze(n, d + 10, 15) + 4, $ = we + Ze(n, d + 5, 31) + 1;
          d += 14;
          for (var T = new he($), oe = new he(19), Y = 0; Y < ie; ++Y)
            oe[Di[Y]] = Ze(n, d + Y * 3, 7);
          d += ie * 3;
          for (var fe = fi(oe), Tt = (1 << fe) - 1, xe = ct(oe, fe, 1), Y = 0; Y < $; ) {
            var ve = xe[Ze(n, d, Tt)];
            d += ve & 15;
            var te = ve >> 4;
            if (te < 16)
              T[Y++] = te;
            else {
              var ae = 0, z = 0;
              for (te == 16 ? (z = 3 + Ze(n, d, 3), d += 2, ae = T[Y - 1]) : te == 17 ? (z = 3 + Ze(n, d, 7), d += 3) : te == 18 && (z = 11 + Ze(n, d, 127), d += 7); z--; )
                T[Y++] = ae;
            }
          }
          var ke = T.subarray(0, we), ce = T.subarray(we);
          S = fi(ke), j = fi(ce), m = ct(ke, S, 1), w = ct(ce, j, 1);
        } else
          Ke(1);
      else {
        var te = _o(d) + 4, ye = n[te - 4] | n[te - 3] << 8, de = te + ye;
        if (de > r) {
          c && Ke(0);
          break;
        }
        a && h(g + ye), t.set(n.subarray(te, de), g), e.b = g += ye, e.p = d = de * 8, e.f = u;
        continue;
      }
      if (d > Se) {
        c && Ke(0);
        break;
      }
    }
    a && h(g + 131072);
    for (var cs = (1 << S) - 1, Me = (1 << j) - 1, ft = d; ; ft = d) {
      var ae = m[gi(n, d) & cs], Ce = ae >> 4;
      if (d += ae & 15, d > Se) {
        c && Ke(0);
        break;
      }
      if (ae || Ke(2), Ce < 256)
        t[g++] = Ce;
      else if (Ce == 256) {
        ft = d, m = null;
        break;
      } else {
        var Ie = Ce - 254;
        if (Ce > 264) {
          var Y = Ce - 257, H = qr[Y];
          Ie = Ze(n, d, (1 << H) - 1) + Kc[Y], d += H;
        }
        var Xe = w[gi(n, d) & Me], mn = Xe >> 4;
        Xe || Ke(3), d += Xe & 15;
        var ce = hf[mn];
        if (mn > 3) {
          var H = Yr[mn];
          ce += gi(n, d) & (1 << H) - 1, d += H;
        }
        if (d > Se) {
          c && Ke(0);
          break;
        }
        a && h(g + 131072);
        var yn = g + Ie;
        if (g < ce) {
          var Xs = i - ce, Qs = Math.min(ce, yn);
          for (Xs + g < 0 && Ke(3); g < Qs; ++g)
            t[g] = s[Xs + g];
        }
        for (; g < yn; ++g)
          t[g] = t[g - ce];
      }
    }
    e.l = m, e.p = ft, e.b = g, e.f = u, m && (u = 1, e.m = S, e.d = w, e.n = j);
  } while (!u);
  return g != t.length && o ? Hc(t, 0, g) : t.subarray(0, g);
}, mt = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8;
}, us = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8, n[s + 2] |= t >> 16;
}, pi = function(n, e) {
  for (var t = [], s = 0; s < n.length; ++s)
    n[s] && t.push({ s, f: n[s] });
  var r = t.length, i = t.slice();
  if (!r)
    return { t: Jc, l: 0 };
  if (r == 1) {
    var o = new he(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(de, we) {
    return de.f - we.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], c = t[1], h = 0, u = 1, d = 2;
  for (t[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != r - 1; )
    a = t[t[h].f < t[d].f ? h++ : d++], c = t[h != u && t[h].f < t[d].f ? h++ : d++], t[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var g = i[0].s, s = 1; s < r; ++s)
    i[s].s > g && (g = i[s].s);
  var m = new Ne(g + 1), w = Ri(t[u - 1], m, 0);
  if (w > e) {
    var s = 0, S = 0, j = w - e, Se = 1 << j;
    for (i.sort(function(we, ie) {
      return m[ie.s] - m[we.s] || we.f - ie.f;
    }); s < r; ++s) {
      var Z = i[s].s;
      if (m[Z] > e)
        S += Se - (1 << w - m[Z]), m[Z] = e;
      else
        break;
    }
    for (S >>= j; S > 0; ) {
      var te = i[s].s;
      m[te] < e ? S -= 1 << e - m[te]++ - 1 : ++s;
    }
    for (; s >= 0 && S; --s) {
      var ye = i[s].s;
      m[ye] == e && (--m[ye], ++S);
    }
    w = e;
  }
  return { t: new he(m), l: w };
}, Ri = function(n, e, t) {
  return n.s == -1 ? Math.max(Ri(n.l, e, t + 1), Ri(n.r, e, t + 1)) : e[n.s] = t;
}, ua = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new Ne(++e), s = 0, r = n[0], i = 1, o = function(c) {
    t[s++] = c;
  }, a = 1; a <= e; ++a)
    if (n[a] == r && a != e)
      ++i;
    else {
      if (!r && i > 2) {
        for (; i > 138; i -= 138)
          o(32754);
        i > 2 && (o(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (o(r), --i; i > 6; i -= 6)
          o(8304);
        i > 2 && (o(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        o(r);
      i = 1, r = n[a];
    }
  return { c: t.subarray(0, s), n: e };
}, ds = function(n, e) {
  for (var t = 0, s = 0; s < e.length; ++s)
    t += n[s] * e[s];
  return t;
}, Wc = function(n, e, t) {
  var s = t.length, r = _o(e + 2);
  n[r] = s & 255, n[r + 1] = s >> 8, n[r + 2] = n[r] ^ 255, n[r + 3] = n[r + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    n[r + i + 4] = t[i];
  return (r + 4 + s) * 8;
}, da = function(n, e, t, s, r, i, o, a, c, h, u) {
  mt(e, u++, t), ++r[256];
  for (var d = pi(r, 15), g = d.t, m = d.l, w = pi(i, 15), S = w.t, j = w.l, Se = ua(g), Z = Se.c, te = Se.n, ye = ua(S), de = ye.c, we = ye.n, ie = new Ne(19), $ = 0; $ < Z.length; ++$)
    ++ie[Z[$] & 31];
  for (var $ = 0; $ < de.length; ++$)
    ++ie[de[$] & 31];
  for (var T = pi(ie, 7), oe = T.t, Y = T.l, fe = 19; fe > 4 && !oe[Di[fe - 1]]; --fe)
    ;
  var Tt = h + 5 << 3, xe = ds(r, Jt) + ds(i, Vs) + o, ve = ds(r, g) + ds(i, S) + o + 14 + 3 * fe + ds(ie, oe) + 2 * ie[16] + 3 * ie[17] + 7 * ie[18];
  if (c >= 0 && Tt <= xe && Tt <= ve)
    return Wc(e, u, n.subarray(c, c + h));
  var ae, z, ke, ce;
  if (mt(e, u, 1 + (ve < xe)), u += 2, ve < xe) {
    ae = ct(g, m, 0), z = g, ke = ct(S, j, 0), ce = S;
    var cs = ct(oe, Y, 0);
    mt(e, u, te - 257), mt(e, u + 5, we - 1), mt(e, u + 10, fe - 4), u += 14;
    for (var $ = 0; $ < fe; ++$)
      mt(e, u + 3 * $, oe[Di[$]]);
    u += 3 * fe;
    for (var Me = [Z, de], ft = 0; ft < 2; ++ft)
      for (var Ce = Me[ft], $ = 0; $ < Ce.length; ++$) {
        var Ie = Ce[$] & 31;
        mt(e, u, cs[Ie]), u += oe[Ie], Ie > 15 && (mt(e, u, Ce[$] >> 5 & 127), u += Ce[$] >> 12);
      }
  } else
    ae = uf, z = Jt, ke = ff, ce = Vs;
  for (var $ = 0; $ < a; ++$) {
    var H = s[$];
    if (H > 255) {
      var Ie = H >> 18 & 31;
      us(e, u, ae[Ie + 257]), u += z[Ie + 257], Ie > 7 && (mt(e, u, H >> 23 & 31), u += qr[Ie]);
      var Xe = H & 31;
      us(e, u, ke[Xe]), u += ce[Xe], Xe > 3 && (us(e, u, H >> 5 & 8191), u += Yr[Xe]);
    } else
      us(e, u, ae[H]), u += z[H];
  }
  return us(e, u, ae[256]), u + z[256];
}, yf = /* @__PURE__ */ new wo([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Jc = /* @__PURE__ */ new he(0), wf = function(n, e, t, s, r, i) {
  var o = i.z || n.length, a = new he(s + o + 5 * (1 + Math.ceil(o / 7e3)) + r), c = a.subarray(s, a.length - r), h = i.l, u = (i.r || 0) & 7;
  if (e) {
    u && (c[0] = i.r >> 3);
    for (var d = yf[e - 1], g = d >> 13, m = d & 8191, w = (1 << t) - 1, S = i.p || new Ne(32768), j = i.h || new Ne(w + 1), Se = Math.ceil(t / 3), Z = 2 * Se, te = function(Xr) {
      return (n[Xr] ^ n[Xr + 1] << Se ^ n[Xr + 2] << Z) & w;
    }, ye = new wo(25e3), de = new Ne(288), we = new Ne(32), ie = 0, $ = 0, T = i.i || 0, oe = 0, Y = i.w || 0, fe = 0; T + 2 < o; ++T) {
      var Tt = te(T), xe = T & 32767, ve = j[Tt];
      if (S[xe] = ve, j[Tt] = xe, Y <= T) {
        var ae = o - T;
        if ((ie > 7e3 || oe > 24576) && (ae > 423 || !h)) {
          u = da(n, c, 0, ye, de, we, $, oe, fe, T - fe, u), oe = ie = $ = 0, fe = T;
          for (var z = 0; z < 286; ++z)
            de[z] = 0;
          for (var z = 0; z < 30; ++z)
            we[z] = 0;
        }
        var ke = 2, ce = 0, cs = m, Me = xe - ve & 32767;
        if (ae > 2 && Tt == te(T - Me))
          for (var ft = Math.min(g, ae) - 1, Ce = Math.min(32767, T), Ie = Math.min(258, ae); Me <= Ce && --cs && xe != ve; ) {
            if (n[T + ke] == n[T + ke - Me]) {
              for (var H = 0; H < Ie && n[T + H] == n[T + H - Me]; ++H)
                ;
              if (H > ke) {
                if (ke = H, ce = Me, H > ft)
                  break;
                for (var Xe = Math.min(Me, H - 2), mn = 0, z = 0; z < Xe; ++z) {
                  var yn = T - Me + z & 32767, Xs = S[yn], Qs = yn - Xs & 32767;
                  Qs > mn && (mn = Qs, ve = yn);
                }
              }
            }
            xe = ve, ve = S[xe], Me += xe - ve & 32767;
          }
        if (ce) {
          ye[oe++] = 268435456 | Ni[ke] << 18 | ha[ce];
          var ls = Ni[ke] & 31, hs = ha[ce] & 31;
          $ += qr[ls] + Yr[hs], ++de[257 + ls], ++we[hs], Y = T + ke, ++ie;
        } else
          ye[oe++] = n[T], ++de[n[T]];
      }
    }
    for (T = Math.max(T, Y); T < o; ++T)
      ye[oe++] = n[T], ++de[n[T]];
    u = da(n, c, h, ye, de, we, $, oe, fe, T - fe, u), h || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = j, i.p = S, i.i = T, i.w = Y);
  } else {
    for (var T = i.w || 0; T < o + h; T += 65535) {
      var wn = T + 65535;
      wn >= o && (c[u / 8 | 0] = h, wn = o), u = Wc(c, u + 1, n.subarray(T, wn));
    }
    i.i = o;
  }
  return Hc(a, 0, s + _o(u) + r);
}, _f = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, s = 9; --s; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), vf = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, s = 0; s < e.length; ++s)
        t = _f[t & 255 ^ e[s]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, kf = function(n, e, t, s, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), o = new he(i.length + n.length);
    o.set(i), o.set(n, i.length), n = o, r.w = i.length;
  }
  return wf(n, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, s, r);
}, Mi = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, bf = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Mi(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var s = 0; s <= t.length; ++s)
      n[s + 10] = t.charCodeAt(s);
  }
}, Sf = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Ke(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var s = (e >> 3 & 1) + (e >> 4 & 1); s > 0; s -= !n[t++])
    ;
  return t + (e & 2);
}, xf = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, Cf = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function If(n, e) {
  e || (e = {});
  var t = vf(), s = n.length;
  t.p(n);
  var r = kf(n, e, Cf(e), 8), i = r.length;
  return bf(r, e), Mi(r, i - 8, t.d()), Mi(r, i - 4, s), r;
}
function Ef(n, e) {
  var t = Sf(n);
  return t + 8 > n.length && Ke(6, "invalid gzip data"), mf(n.subarray(t, -8), { i: 2 }, new he(xf(n)), e);
}
var Tf = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Af = 0;
try {
  Tf.decode(Jc, { stream: !0 }), Af = 1;
} catch {
}
const Of = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function En(n, e, t) {
  const s = t[0];
  if (e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n.slice(-1) === s || e && e.slice(-1) === s)
    throw new Error("trailing zero");
  if (e) {
    let o = 0;
    for (; (n[o] || s) === e[o]; )
      o++;
    if (o > 0)
      return e.slice(0, o) + En(n.slice(o), e.slice(o), t);
  }
  const r = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - r > 1) {
    const o = Math.round(0.5 * (r + i));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + En(n.slice(1), null, t);
}
function Gc(n) {
  if (n.length !== qc(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function qc(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function ms(n) {
  const e = qc(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function fa(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = ms(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function ga(n, e) {
  Gc(n);
  const [t, ...s] = n.split("");
  let r = !0;
  for (let i = s.length - 1; r && i >= 0; i--) {
    const o = e.indexOf(s[i]) + 1;
    o === e.length ? s[i] = e[0] : (s[i] = e[o], r = !1);
  }
  if (r) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) + 1);
    return i > "a" ? s.push(e[0]) : s.pop(), i + s.join("");
  } else
    return t + s.join("");
}
function Df(n, e) {
  Gc(n);
  const [t, ...s] = n.split("");
  let r = !0;
  for (let i = s.length - 1; r && i >= 0; i--) {
    const o = e.indexOf(s[i]) - 1;
    o === -1 ? s[i] = e.slice(-1) : (s[i] = e[o], r = !1);
  }
  if (r) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) - 1);
    return i < "Z" ? s.push(e.slice(-1)) : s.pop(), i + s.join("");
  } else
    return t + s.join("");
}
function vn(n, e, t = Of) {
  if (n != null && fa(n, t), e != null && fa(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = ms(e), h = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + En("", h, t);
    if (c < e)
      return c;
    const u = Df(c, t);
    if (u == null)
      throw new Error("cannot decrement any more");
    return u;
  }
  if (e == null) {
    const c = ms(n), h = n.slice(c.length), u = ga(c, t);
    return u ?? c + En(h, null, t);
  }
  const s = ms(n), r = n.slice(s.length), i = ms(e), o = e.slice(i.length);
  if (s === i)
    return s + En(r, o, t);
  const a = ga(s, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : s + En(r, null, t);
}
const Nf = Pc(), pa = Pc().min(1), fs = lf().int().nonnegative().optional();
var nt, E, $s, Yt, wt, Ln, be, Lt, Rt, st, rt, Rr, Xt, Mt, Qt, p, Sn, ys, tt, dr, Ui, Yc, Xc, Ve, qt, xn, ws, Cn, _s, fr, Qc, Vi, el, $i, ji, M, tl, Bi, nl;
const xs = class xs {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t) {
    v(this, p);
    /**** private state ****/
    v(this, nt);
    v(this, E);
    v(this, $s);
    v(this, Yt);
    v(this, wt, null);
    v(this, Ln, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    v(this, be, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId  (kept in sync with #ReverseIndex)
    v(this, Lt, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    v(this, Rt, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    v(this, st, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    v(this, rt, /* @__PURE__ */ new Map());
    v(this, Rr, xl);
    // transaction nesting
    v(this, Xt, 0);
    // ChangeSet accumulator inside a transaction
    v(this, Mt, {});
    // suppress index updates / change tracking when applying remote patches
    v(this, Qt, !1);
    var s;
    if (x(this, nt, e), x(this, E, e.getMap("Entries")), x(this, $s, (t == null ? void 0 : t.LiteralSizeLimit) ?? bl), x(this, Yt, (t == null ? void 0 : t.TrashTTLms) ?? null), f(this, p, Yc).call(this), l(this, Yt) != null) {
      const r = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(l(this, Yt) / 4), 36e5);
      x(this, wt, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        r
      )), typeof ((s = l(this, wt)) == null ? void 0 : s.unref) == "function" && l(this, wt).unref();
    }
  }
  static fromScratch(e) {
    const t = new ln(), s = t.getMap("Entries");
    return t.transact(() => {
      const r = new L();
      r.set("Kind", "note"), r.set("outerNoteId", ""), r.set("OrderKey", ""), r.set("Label", new K()), r.set("Info", new L()), r.set("MIMEType", ""), r.set("ValueKind", "none"), s.set(Ue, r);
      const i = new L();
      i.set("Kind", "note"), i.set("outerNoteId", Ue), i.set("OrderKey", "a0"), i.set("Label", new K("trash")), i.set("Info", new L()), i.set("MIMEType", ""), i.set("ValueKind", "none"), s.set(G, i);
      const o = new L();
      o.set("Kind", "note"), o.set("outerNoteId", Ue), o.set("OrderKey", "a1"), o.set("Label", new K("lost-and-found")), o.set("Info", new L()), o.set("MIMEType", ""), o.set("ValueKind", "none"), s.set(Ee, o);
    }), new xs(t, e);
  }
  static fromBinary(e, t) {
    const s = new ln();
    return Vo(s, Ef(e)), new xs(s, t);
  }
  static fromJSON(e, t) {
    let s;
    return typeof Buffer < "u" ? s = new Uint8Array(Buffer.from(String(e), "base64")) : s = Uint8Array.from(atob(String(e)), (r) => r.charCodeAt(0)), xs.fromBinary(s, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  get RootNote() {
    return f(this, p, tt).call(this, Ue);
  }
  get TrashNote() {
    return f(this, p, tt).call(this, G);
  }
  get LostAndFoundNote() {
    return f(this, p, tt).call(this, Ee);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  EntryWithId(e) {
    if (l(this, E).has(e))
      return f(this, p, ys).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  newNoteAt(e, t, s) {
    const r = t ?? tr;
    if (!pa.safeParse(r).success)
      throw new le("invalid-argument", "MIMEType must be a non-empty string");
    fs.parse(s), f(this, p, Sn).call(this, e.Id);
    const i = crypto.randomUUID(), o = f(this, p, Cn).call(this, e.Id, s), a = r === tr ? "" : r;
    return this.transact(() => {
      const c = new L();
      c.set("Kind", "note"), c.set("outerNoteId", e.Id), c.set("OrderKey", o), c.set("Label", new K()), c.set("Info", new L()), c.set("MIMEType", a), c.set("ValueKind", "none"), l(this, E).set(i, c), f(this, p, Ve).call(this, e.Id, i), f(this, p, M).call(this, e.Id, "innerEntryList"), f(this, p, M).call(this, i, "outerNote");
    }), f(this, p, tt).call(this, i);
  }
  newLinkAt(e, t, s) {
    fs.parse(s), f(this, p, Sn).call(this, e.Id), f(this, p, Sn).call(this, t.Id);
    const r = crypto.randomUUID(), i = f(this, p, Cn).call(this, t.Id, s);
    return this.transact(() => {
      const o = new L();
      o.set("Kind", "link"), o.set("outerNoteId", t.Id), o.set("OrderKey", i), o.set("Label", new K()), o.set("Info", new L()), o.set("TargetId", e.Id), l(this, E).set(r, o), f(this, p, Ve).call(this, t.Id, r), f(this, p, xn).call(this, e.Id, r), f(this, p, M).call(this, t.Id, "innerEntryList"), f(this, p, M).call(this, r, "outerNote");
    }), f(this, p, dr).call(this, r);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  deserializeNoteInto(e, t, s) {
    if (fs.parse(s), f(this, p, Sn).call(this, t.Id), e == null)
      throw new le("invalid-argument", "Serialisation must not be null");
    const r = e, i = Object.keys(r.Entries ?? {});
    if (i.length === 0)
      throw new le("invalid-argument", "empty serialisation");
    const o = i[0], a = crypto.randomUUID(), c = /* @__PURE__ */ new Map([[o, a]]);
    for (const u of i)
      c.has(u) || c.set(u, crypto.randomUUID());
    const h = f(this, p, Cn).call(this, t.Id, s);
    return this.transact(() => {
      var u, d;
      for (const g of i) {
        const m = r.Entries[g], w = c.get(g), S = g === o, j = S ? t.Id : ((u = m.outerPlacement) == null ? void 0 : u.outerNoteId) != null ? c.get(m.outerPlacement.outerNoteId) ?? t.Id : void 0, Se = S ? h : ((d = m.outerPlacement) == null ? void 0 : d.OrderKey) ?? "", Z = new L();
        Z.set("Kind", m.Kind), Z.set("Label", new K(m.Label ?? "")), Z.set("Info", new L()), j != null ? (Z.set("outerNoteId", j), Z.set("OrderKey", Se)) : (Z.set("outerNoteId", ""), Z.set("OrderKey", "")), m.Kind === "note" ? (Z.set("MIMEType", m.MIMEType ?? ""), Z.set("ValueKind", "none")) : Z.set(
          "TargetId",
          m.TargetId != null ? c.get(m.TargetId) ?? m.TargetId : ""
        ), l(this, E).set(w, Z), j && f(this, p, Ve).call(this, j, w), m.Kind === "link" && m.TargetId != null && f(this, p, xn).call(this, c.get(m.TargetId) ?? m.TargetId, w);
      }
      f(this, p, M).call(this, t.Id, "innerEntryList");
    }), f(this, p, tt).call(this, a);
  }
  deserializeLinkInto(e, t, s) {
    if (fs.parse(s), f(this, p, Sn).call(this, t.Id), e == null)
      throw new le("invalid-argument", "Serialisation must not be null");
    const r = e, i = Object.keys(r.Entries ?? {});
    if (i.length === 0)
      throw new le("invalid-argument", "empty serialisation");
    const o = r.Entries[i[0]];
    if (o.Kind !== "link")
      throw new le("invalid-argument", "serialisation is not a link");
    const a = crypto.randomUUID(), c = f(this, p, Cn).call(this, t.Id, s);
    return this.transact(() => {
      const h = new L();
      h.set("Kind", "link"), h.set("outerNoteId", t.Id), h.set("OrderKey", c), h.set("Label", new K(o.Label ?? "")), h.set("Info", new L()), h.set("TargetId", o.TargetId ?? ""), l(this, E).set(a, h), f(this, p, Ve).call(this, t.Id, a), o.TargetId && f(this, p, xn).call(this, o.TargetId, a), f(this, p, M).call(this, t.Id, "innerEntryList");
    }), f(this, p, dr).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  EntryMayBeMovedTo(e, t, s) {
    return e.mayBeMovedTo(t, s);
  }
  moveEntryTo(e, t, s) {
    if (fs.parse(s), !this._mayMoveEntryTo(e.Id, t.Id, s))
      throw new le(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const r = this._outerNoteIdOf(e.Id), i = f(this, p, Cn).call(this, t.Id, s);
    this.transact(() => {
      const o = l(this, E).get(e.Id);
      if (o.set("outerNoteId", t.Id), o.set("OrderKey", i), r === G && t.Id !== G) {
        const a = o.get("Info");
        a instanceof L && a.has("_trashedAt") && (a.delete("_trashedAt"), f(this, p, M).call(this, e.Id, "Info._trashedAt"));
      }
      r != null && (f(this, p, qt).call(this, r, e.Id), f(this, p, M).call(this, r, "innerEntryList")), f(this, p, Ve).call(this, t.Id, e.Id), f(this, p, M).call(this, t.Id, "innerEntryList"), f(this, p, M).call(this, e.Id, "outerNote");
    });
  }
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new le("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), s = vn(f(this, p, _s).call(this, G), null);
    this.transact(() => {
      const r = l(this, E).get(e.Id);
      r.set("outerNoteId", G), r.set("OrderKey", s);
      let i = r.get("Info");
      i instanceof L || (i = new L(), r.set("Info", i)), i.set("_trashedAt", Date.now()), t != null && (f(this, p, qt).call(this, t, e.Id), f(this, p, M).call(this, t, "innerEntryList")), f(this, p, Ve).call(this, G, e.Id), f(this, p, M).call(this, G, "innerEntryList"), f(this, p, M).call(this, e.Id, "outerNote"), f(this, p, M).call(this, e.Id, "Info._trashedAt");
    });
  }
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== G)
      throw new le(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (f(this, p, Qc).call(this, e.Id))
      throw new le(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      f(this, p, ji).call(this, e.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  purgeExpiredTrashEntries(e) {
    const t = e ?? l(this, Yt);
    if (t == null)
      return 0;
    const s = Date.now(), r = Array.from(l(this, be).get(G) ?? /* @__PURE__ */ new Set());
    let i = 0;
    for (const o of r) {
      const a = l(this, E).get(o);
      if (a == null || a.get("outerNoteId") !== G)
        continue;
      const c = a.get("Info"), h = c instanceof L ? c.get("_trashedAt") : void 0;
      if (typeof h == "number" && !(s - h < t))
        try {
          this.purgeEntry(f(this, p, ys).call(this, o)), i++;
        } catch {
        }
    }
    return i;
  }
  dispose() {
    l(this, wt) != null && (clearInterval(l(this, wt)), x(this, wt, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  transact(e) {
    er(this, Xt)._++;
    try {
      l(this, Xt) === 1 && !l(this, Qt) ? l(this, nt).transact(() => {
        e();
      }) : e();
    } finally {
      if (er(this, Xt)._--, l(this, Xt) === 0) {
        const t = { ...l(this, Mt) };
        x(this, Mt, {});
        const s = l(this, Qt) ? "external" : "internal";
        f(this, p, tl).call(this, s, t);
      }
    }
  }
  onChangeInvoke(e) {
    return l(this, Ln).add(e), () => {
      l(this, Ln).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  applyRemotePatch(e) {
    x(this, Qt, !0);
    try {
      Vo(l(this, nt), e), this.transact(() => {
        f(this, p, Xc).call(this);
      });
    } finally {
      x(this, Qt, !1);
    }
    this.recoverOrphans();
  }
  get currentCursor() {
    return Ru(l(this, nt));
  }
  exportPatch(e) {
    return e == null || e.byteLength === 0 ? ci(l(this, nt)) : ci(l(this, nt), e);
  }
  recoverOrphans() {
    const e = new Set(l(this, E).keys());
    this.transact(() => {
      l(this, E).forEach((t, s) => {
        if (s === Ue)
          return;
        const r = t.get("outerNoteId");
        if (r && !e.has(r)) {
          const i = vn(f(this, p, _s).call(this, Ee), null);
          t.set("outerNoteId", Ee), t.set("OrderKey", i), f(this, p, Ve).call(this, Ee, s), f(this, p, M).call(this, s, "outerNote"), f(this, p, M).call(this, Ee, "innerEntryList");
        }
        if (t.get("Kind") === "link") {
          const i = t.get("TargetId");
          if (i && !e.has(i)) {
            const o = vn(f(this, p, _s).call(this, Ee), null), a = new L();
            a.set("Kind", "note"), a.set("outerNoteId", Ee), a.set("OrderKey", o), a.set("Label", new K()), a.set("Info", new L()), a.set("MIMEType", ""), a.set("ValueKind", "none"), l(this, E).set(i, a), f(this, p, Ve).call(this, Ee, i), e.add(i), f(this, p, M).call(this, Ee, "innerEntryList");
          }
        }
      });
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  asBinary() {
    return If(ci(l(this, nt)));
  }
  asJSON() {
    const e = this.asBinary();
    if (typeof Buffer < "u")
      return Buffer.from(e).toString("base64");
    let t = "";
    for (let s = 0; s < e.byteLength; s++)
      t += String.fromCharCode(e[s]);
    return btoa(t);
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SNS_Entry / Note / Link             //
  //----------------------------------------------------------------------------//
  _KindOf(e) {
    const t = l(this, E).get(e);
    if (t == null)
      throw new le("not-found", `entry '${e}' not found`);
    return t.get("Kind");
  }
  _LabelOf(e) {
    const t = l(this, E).get(e);
    if (t == null)
      return "";
    const s = t.get("Label");
    return s instanceof K ? s.toString() : String(s ?? "");
  }
  _setLabelOf(e, t) {
    Nf.parse(t), this.transact(() => {
      const s = l(this, E).get(e);
      if (s == null)
        return;
      let r = s.get("Label");
      r instanceof K ? (r.delete(0, r.length), t.length > 0 && r.insert(0, t)) : (r = new K(t), s.set("Label", r)), f(this, p, M).call(this, e, "Label");
    });
  }
  _TypeOf(e) {
    const t = l(this, E).get(e), s = (t == null ? void 0 : t.get("MIMEType")) ?? "";
    return s === "" ? tr : s;
  }
  _setTypeOf(e, t) {
    pa.parse(t);
    const s = t === tr ? "" : t;
    this.transact(() => {
      var r;
      (r = l(this, E).get(e)) == null || r.set("MIMEType", s), f(this, p, M).call(this, e, "Type");
    });
  }
  _ValueKindOf(e) {
    const t = l(this, E).get(e);
    return (t == null ? void 0 : t.get("ValueKind")) ?? "none";
  }
  _isLiteralOf(e) {
    const t = this._ValueKindOf(e);
    return t === "literal" || t === "literal-reference";
  }
  _isBinaryOf(e) {
    const t = this._ValueKindOf(e);
    return t === "binary" || t === "binary-reference";
  }
  async _readValueOf(e) {
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal": {
        const s = l(this, E).get(e), r = s == null ? void 0 : s.get("literalValue");
        return r instanceof K ? r.toString() : r ?? "";
      }
      case t === "binary": {
        const s = l(this, E).get(e);
        return s == null ? void 0 : s.get("binaryValue");
      }
      default:
        throw new le(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  _writeValueOf(e, t) {
    this.transact(() => {
      const s = l(this, E).get(e);
      if (s != null) {
        switch (!0) {
          case t == null: {
            s.set("ValueKind", "none");
            break;
          }
          case (typeof t == "string" && t.length <= l(this, $s)): {
            s.set("ValueKind", "literal");
            let r = s.get("literalValue");
            r instanceof K ? (r.delete(0, r.length), t.length > 0 && r.insert(0, t)) : (r = new K(t), s.set("literalValue", r));
            break;
          }
          case typeof t == "string": {
            const i = new TextEncoder().encode(t), o = `sha256-size-${i.byteLength}`;
            s.set("ValueKind", "literal-reference"), s.set("ValueRef", { Hash: o, Size: i.byteLength });
            break;
          }
          case t.byteLength <= Sl: {
            s.set("ValueKind", "binary"), s.set("binaryValue", t);
            break;
          }
          default: {
            const r = t, i = `sha256-size-${r.byteLength}`;
            s.set("ValueKind", "binary-reference"), s.set("ValueRef", { Hash: i, Size: r.byteLength });
            break;
          }
        }
        f(this, p, M).call(this, e, "Value");
      }
    });
  }
  _spliceValueOf(e, t, s, r) {
    if (this._ValueKindOf(e) !== "literal")
      throw new le(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const i = l(this, E).get(e), o = i == null ? void 0 : i.get("literalValue");
      if (o instanceof K) {
        const a = s - t;
        a > 0 && o.delete(t, a), r.length > 0 && o.insert(t, r);
      }
      f(this, p, M).call(this, e, "Value");
    });
  }
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(s, r) {
        if (typeof r != "string")
          return;
        const i = l(t, E).get(e), o = i == null ? void 0 : i.get("Info");
        return o instanceof L ? o.get(r) : void 0;
      },
      set(s, r, i) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var c;
          const o = l(t, E).get(e);
          if (o == null)
            return;
          let a = o.get("Info");
          a instanceof L || (a = new L(), o.set("Info", a)), a.set(r, i), f(c = t, p, M).call(c, e, `Info.${r}`);
        }), !0);
      },
      deleteProperty(s, r) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var a;
          const i = l(t, E).get(e), o = i == null ? void 0 : i.get("Info");
          o instanceof L && o.delete(r), f(a = t, p, M).call(a, e, `Info.${r}`);
        }), !0);
      },
      ownKeys() {
        const s = l(t, E).get(e), r = s == null ? void 0 : s.get("Info");
        return r instanceof L ? Array.from(r.keys()) : [];
      },
      getOwnPropertyDescriptor(s, r) {
        if (typeof r != "string")
          return;
        const i = l(t, E).get(e), o = i == null ? void 0 : i.get("Info");
        if (!(o instanceof L))
          return;
        const a = o.get(r);
        return a !== void 0 ? { configurable: !0, enumerable: !0, value: a } : void 0;
      }
    });
  }
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? f(this, p, tt).call(this, t) : void 0;
  }
  _outerNoteIdOf(e) {
    const t = l(this, E).get(e), s = t == null ? void 0 : t.get("outerNoteId");
    return s != null && s !== "" ? s : void 0;
  }
  _outerNotesOf(e) {
    const t = [];
    let s = this._outerNoteIdOf(e);
    for (; s != null && (t.push(f(this, p, tt).call(this, s)), s !== Ue); )
      s = this._outerNoteIdOf(s);
    return t;
  }
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  _innerEntriesOf(e) {
    const t = this, s = f(this, p, fr).call(this, e);
    return new Proxy([], {
      get(r, i) {
        var o;
        if (i === "length")
          return s.length;
        if (i === Symbol.iterator)
          return function* () {
            var a;
            for (let c = 0; c < s.length; c++)
              yield f(a = t, p, ys).call(a, s[c].Id);
          };
        if (typeof i == "string" && !isNaN(Number(i))) {
          const a = Number(i);
          return a >= 0 && a < s.length ? f(o = t, p, ys).call(o, s[a].Id) : void 0;
        }
        return r[i];
      }
    });
  }
  _mayMoveEntryTo(e, t, s) {
    return e === Ue || e === t ? !1 : e === G || e === Ee ? t === Ue : !f(this, p, nl).call(this, t, e);
  }
  _mayDeleteEntry(e) {
    return e !== Ue && e !== G && e !== Ee;
  }
  _TargetOf(e) {
    const t = l(this, E).get(e), s = t == null ? void 0 : t.get("TargetId");
    if (!s)
      throw new le("not-found", `link '${e}' has no target`);
    return f(this, p, tt).call(this, s);
  }
  _EntryAsJSON(e) {
    if (!l(this, E).has(e))
      throw new le("not-found", `entry '${e}' not found`);
    const t = {};
    return f(this, p, Bi).call(this, e, t), { Entries: t };
  }
};
nt = new WeakMap(), E = new WeakMap(), $s = new WeakMap(), Yt = new WeakMap(), wt = new WeakMap(), Ln = new WeakMap(), be = new WeakMap(), Lt = new WeakMap(), Rt = new WeakMap(), st = new WeakMap(), rt = new WeakMap(), Rr = new WeakMap(), Xt = new WeakMap(), Mt = new WeakMap(), Qt = new WeakMap(), p = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #requireNoteExists ****/
Sn = function(e) {
  const t = l(this, E).get(e);
  if (t == null || t.get("Kind") !== "note")
    throw new le("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink ****/
ys = function(e) {
  const t = l(this, E).get(e);
  if (t == null)
    throw new le("invalid-argument", `entry '${e}' not found`);
  return t.get("Kind") === "note" ? f(this, p, tt).call(this, e) : f(this, p, dr).call(this, e);
}, tt = function(e) {
  const t = l(this, rt).get(e);
  if (t instanceof ko)
    return t;
  const s = new ko(this, e);
  return f(this, p, Ui).call(this, e, s), s;
}, dr = function(e) {
  const t = l(this, rt).get(e);
  if (t instanceof bo)
    return t;
  const s = new bo(this, e);
  return f(this, p, Ui).call(this, e, s), s;
}, Ui = function(e, t) {
  if (l(this, rt).size >= l(this, Rr)) {
    const s = l(this, rt).keys().next().value;
    s != null && l(this, rt).delete(s);
  }
  l(this, rt).set(e, t);
}, /**** #rebuildIndices — full rebuild used during construction ****/
Yc = function() {
  l(this, be).clear(), l(this, Lt).clear(), l(this, Rt).clear(), l(this, st).clear(), l(this, E).forEach((e, t) => {
    const s = e.get("outerNoteId");
    if (s && f(this, p, Ve).call(this, s, t), e.get("Kind") === "link") {
      const r = e.get("TargetId");
      r && f(this, p, xn).call(this, r, t);
    }
  });
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Xc = function() {
  const e = /* @__PURE__ */ new Set();
  l(this, E).forEach((r, i) => {
    e.add(i);
    const o = r.get("outerNoteId") || void 0, a = l(this, Lt).get(i);
    if (o !== a && (a != null && (f(this, p, qt).call(this, a, i), f(this, p, M).call(this, a, "innerEntryList")), o != null && (f(this, p, Ve).call(this, o, i), f(this, p, M).call(this, o, "innerEntryList")), f(this, p, M).call(this, i, "outerNote")), r.get("Kind") === "link") {
      const c = r.get("TargetId"), h = l(this, st).get(i);
      c !== h && (h != null && f(this, p, ws).call(this, h, i), c != null && f(this, p, xn).call(this, c, i));
    } else l(this, st).has(i) && f(this, p, ws).call(this, l(this, st).get(i), i);
    f(this, p, M).call(this, i, "Label");
  });
  const t = Array.from(l(this, Lt).entries()).filter(([r]) => !e.has(r));
  for (const [r, i] of t)
    f(this, p, qt).call(this, i, r), f(this, p, M).call(this, i, "innerEntryList");
  const s = Array.from(l(this, st).entries()).filter(([r]) => !e.has(r));
  for (const [r, i] of s)
    f(this, p, ws).call(this, i, r);
}, Ve = function(e, t) {
  let s = l(this, be).get(e);
  s == null && (s = /* @__PURE__ */ new Set(), l(this, be).set(e, s)), s.add(t), l(this, Lt).set(t, e);
}, qt = function(e, t) {
  var s;
  (s = l(this, be).get(e)) == null || s.delete(t), l(this, Lt).delete(t);
}, xn = function(e, t) {
  let s = l(this, Rt).get(e);
  s == null && (s = /* @__PURE__ */ new Set(), l(this, Rt).set(e, s)), s.add(t), l(this, st).set(t, e);
}, ws = function(e, t) {
  var s;
  (s = l(this, Rt).get(e)) == null || s.delete(t), l(this, st).delete(t);
}, /**** #orderKeyAt ****/
Cn = function(e, t) {
  const s = f(this, p, fr).call(this, e);
  if (s.length === 0 || t == null) {
    const a = s.length > 0 ? s[s.length - 1].OrderKey : null;
    return vn(a, null);
  }
  const r = Math.max(0, Math.min(t, s.length)), i = r > 0 ? s[r - 1].OrderKey : null, o = r < s.length ? s[r].OrderKey : null;
  return vn(i, o);
}, _s = function(e) {
  const t = f(this, p, fr).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, fr = function(e) {
  const t = l(this, be).get(e) ?? /* @__PURE__ */ new Set(), s = [];
  for (const r of t) {
    const i = l(this, E).get(r);
    (i == null ? void 0 : i.get("outerNoteId")) === e && s.push({ Id: r, OrderKey: i.get("OrderKey") ?? "" });
  }
  return s.sort((r, i) => r.OrderKey < i.OrderKey ? -1 : r.OrderKey > i.OrderKey ? 1 : r.Id < i.Id ? -1 : r.Id > i.Id ? 1 : 0), s;
}, /**** #isProtected ****/
Qc = function(e) {
  const t = f(this, p, $i).call(this), s = /* @__PURE__ */ new Set();
  let r = !0;
  for (; r; ) {
    r = !1;
    for (const i of l(this, be).get(G) ?? /* @__PURE__ */ new Set())
      s.has(i) || f(this, p, Vi).call(this, i, t, s) && (s.add(i), r = !0);
  }
  return s.has(e);
}, Vi = function(e, t, s) {
  const r = [e], i = /* @__PURE__ */ new Set();
  for (; r.length > 0; ) {
    const o = r.pop();
    if (i.has(o))
      continue;
    i.add(o);
    const a = l(this, Rt).get(o) ?? /* @__PURE__ */ new Set();
    for (const c of a) {
      if (t.has(c))
        return !0;
      const h = f(this, p, el).call(this, c);
      if (h != null && s.has(h))
        return !0;
    }
    for (const c of l(this, be).get(o) ?? /* @__PURE__ */ new Set())
      i.has(c) || r.push(c);
  }
  return !1;
}, el = function(e) {
  let t = e;
  for (; t != null; ) {
    const s = this._outerNoteIdOf(t);
    if (s === G)
      return t;
    if (s === Ue || s == null)
      return null;
    t = s;
  }
  return null;
}, $i = function() {
  const e = /* @__PURE__ */ new Set(), t = [Ue];
  for (; t.length > 0; ) {
    const s = t.pop();
    if (!e.has(s)) {
      e.add(s);
      for (const r of l(this, be).get(s) ?? /* @__PURE__ */ new Set())
        e.has(r) || t.push(r);
    }
  }
  return e;
}, /**** #purgeSubtree ****/
ji = function(e) {
  const t = l(this, E).get(e);
  if (t == null)
    return;
  const s = t.get("Kind"), r = t.get("outerNoteId"), i = f(this, p, $i).call(this), o = /* @__PURE__ */ new Set(), a = Array.from(l(this, be).get(e) ?? /* @__PURE__ */ new Set());
  for (const c of a)
    if (f(this, p, Vi).call(this, c, i, o)) {
      const h = l(this, E).get(c), u = vn(f(this, p, _s).call(this, G), null);
      h.set("outerNoteId", G), h.set("OrderKey", u), f(this, p, qt).call(this, e, c), f(this, p, Ve).call(this, G, c), f(this, p, M).call(this, G, "innerEntryList"), f(this, p, M).call(this, c, "outerNote");
    } else
      f(this, p, ji).call(this, c);
  if (l(this, E).delete(e), r && (f(this, p, qt).call(this, r, e), f(this, p, M).call(this, r, "innerEntryList")), s === "link") {
    const c = t.get("TargetId");
    c && f(this, p, ws).call(this, c, e);
  }
  l(this, rt).delete(e);
}, /**** #recordChange ****/
M = function(e, t) {
  l(this, Mt)[e] == null && (l(this, Mt)[e] = /* @__PURE__ */ new Set()), l(this, Mt)[e].add(t);
}, /**** #notifyHandlers ****/
tl = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const s of l(this, Ln))
      try {
        s(e, t);
      } catch {
      }
}, Bi = function(e, t) {
  const s = l(this, E).get(e);
  if (s == null)
    return;
  const r = s.get("outerNoteId"), i = s.get("OrderKey"), o = s.get("Label"), a = s.get("Info"), c = {};
  a instanceof L && a.forEach((u, d) => {
    c[d] = u;
  });
  const h = {
    Kind: s.get("Kind"),
    Label: o instanceof K ? o.toString() : String(o ?? ""),
    Info: c
  };
  if (r && i && (h.outerPlacement = { outerNoteId: r, OrderKey: i }), s.get("Kind") === "note") {
    h.MIMEType = s.get("MIMEType") ?? "", h.ValueKind = s.get("ValueKind") ?? "none";
    const u = s.get("literalValue");
    u instanceof K && (h.literalValue = u.toString());
    const d = s.get("binaryValue");
    d instanceof Uint8Array && (h.binaryValue = d);
    const g = s.get("ValueRef");
    g != null && (h.ValueRef = g);
  } else
    h.TargetId = s.get("TargetId");
  t[e] = h;
  for (const u of l(this, be).get(e) ?? /* @__PURE__ */ new Set())
    f(this, p, Bi).call(this, u, t);
}, nl = function(e, t) {
  let s = e;
  for (; s != null; ) {
    if (s === t)
      return !0;
    s = this._outerNoteIdOf(s);
  }
  return !1;
};
let ma = xs;
const ya = 1, wa = 2, _a = 3, va = 4, ka = 5, et = 32, ir = 1024 * 1024;
function mi(...n) {
  const e = n.reduce((r, i) => r + i.byteLength, 0), t = new Uint8Array(e);
  let s = 0;
  for (const r of n)
    t.set(r, s), s += r.byteLength;
  return t;
}
function gs(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function ba(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function Sa(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var _t, vt, js, Rn, en, Mn, tn, Un, Vn, $n, Bs, J, Pi, In, vs, sl, rl, il;
class Uf {
  /**** constructor ****/
  constructor(e) {
    v(this, J);
    gt(this, "StoreID");
    v(this, _t, "disconnected");
    v(this, vt, null);
    v(this, js, "");
    v(this, Rn, null);
    v(this, en, null);
    v(this, Mn, /* @__PURE__ */ new Set());
    v(this, tn, /* @__PURE__ */ new Set());
    v(this, Un, /* @__PURE__ */ new Set());
    v(this, Vn, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    v(this, $n, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    v(this, Bs, /* @__PURE__ */ new Map());
    this.StoreID = e;
  }
  //----------------------------------------------------------------------------//
  //                             SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, _t);
  }
  /**** connect ****/
  async connect(e, t) {
    return x(this, js, e), x(this, Rn, t), f(this, J, Pi).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    f(this, J, rl).call(this), f(this, J, vs).call(this, "disconnected"), (e = l(this, vt)) == null || e.close(), x(this, vt, null);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    f(this, J, In).call(this, gs(ya, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const s = ba(e);
    if (t.byteLength <= ir)
      f(this, J, In).call(this, gs(wa, mi(s, t)));
    else {
      const r = Math.ceil(t.byteLength / ir);
      for (let i = 0; i < r; i++) {
        const o = i * ir, a = t.slice(o, o + ir), c = new Uint8Array(et + 8);
        c.set(s, 0), new DataView(c.buffer).setUint32(et, i, !1), new DataView(c.buffer).setUint32(et + 4, r, !1), f(this, J, In).call(this, gs(ka, mi(c, a)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    f(this, J, In).call(this, gs(_a, ba(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return l(this, Mn).add(e), () => {
      l(this, Mn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, tn).add(e), () => {
      l(this, tn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Un).add(e), () => {
      l(this, Un).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SNS_PresenceProvider                             //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    f(this, J, In).call(this, gs(va, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return l(this, Vn).add(e), () => {
      l(this, Vn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, Bs);
  }
}
_t = new WeakMap(), vt = new WeakMap(), js = new WeakMap(), Rn = new WeakMap(), en = new WeakMap(), Mn = new WeakMap(), tn = new WeakMap(), Un = new WeakMap(), Vn = new WeakMap(), $n = new WeakMap(), Bs = new WeakMap(), J = new WeakSet(), /**** #doConnect ****/
Pi = function() {
  return new Promise((e, t) => {
    const s = `${l(this, js)}?token=${encodeURIComponent(l(this, Rn).Token)}`, r = new WebSocket(s);
    r.binaryType = "arraybuffer", x(this, vt, r), f(this, J, vs).call(this, "connecting"), r.onopen = () => {
      f(this, J, vs).call(this, "connected"), e();
    }, r.onerror = (i) => {
      l(this, _t) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      x(this, vt, null), l(this, _t) !== "disconnected" && (f(this, J, vs).call(this, "reconnecting"), f(this, J, sl).call(this));
    }, r.onmessage = (i) => {
      f(this, J, il).call(this, new Uint8Array(i.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
In = function(e) {
  var t;
  ((t = l(this, vt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, vt).send(e);
}, /**** #setState ****/
vs = function(e) {
  if (l(this, _t) !== e) {
    x(this, _t, e);
    for (const t of l(this, Un))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
sl = function() {
  var t;
  const e = ((t = l(this, Rn)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  x(this, en, setTimeout(() => {
    l(this, _t) === "reconnecting" && f(this, J, Pi).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
rl = function() {
  l(this, en) != null && (clearTimeout(l(this, en)), x(this, en, null));
}, /**** #handleFrame ****/
il = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], s = e.slice(1);
  switch (t) {
    case ya: {
      for (const r of l(this, Mn))
        try {
          r(s);
        } catch {
        }
      break;
    }
    case wa: {
      if (s.byteLength < et)
        return;
      const r = Sa(s.slice(0, et)), i = s.slice(et);
      for (const o of l(this, tn))
        try {
          o(r, i);
        } catch {
        }
      break;
    }
    case _a:
      break;
    case va: {
      try {
        const r = JSON.parse(new TextDecoder().decode(s));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), l(this, Bs).set(r.PeerId, r);
        for (const i of l(this, Vn))
          try {
            i(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case ka: {
      if (s.byteLength < et + 8)
        return;
      const r = Sa(s.slice(0, et)), i = new DataView(s.buffer, s.byteOffset + et, 8), o = i.getUint32(0, !1), a = i.getUint32(4, !1), c = s.slice(et + 8);
      let h = l(this, $n).get(r);
      if (h == null && (h = { total: a, chunks: /* @__PURE__ */ new Map() }, l(this, $n).set(r, h)), h.chunks.set(o, c), h.chunks.size === h.total) {
        const u = mi(
          ...Array.from({ length: h.total }, (d, g) => h.chunks.get(g))
        );
        l(this, $n).delete(r);
        for (const d of l(this, tn))
          try {
            d(r, u);
          } catch {
          }
      }
      break;
    }
  }
};
var Ps, ze, ge, Ut, it, He, Vt, jn, Bn, Pn, nn, Zn, Oe, V, ks, bs, ol, al, cl, Zi, Fi, ll, Ki, hl;
class Vf {
  /**** constructor ****/
  constructor(e, t = {}) {
    v(this, V);
    gt(this, "StoreID");
    v(this, Ps);
    v(this, ze, crypto.randomUUID());
    v(this, ge);
    /**** Signalling WebSocket ****/
    v(this, Ut, null);
    /**** Active RTCPeerConnection per remote PeerId ****/
    v(this, it, /* @__PURE__ */ new Map());
    v(this, He, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    v(this, Vt, "disconnected");
    /**** Event handlers ****/
    v(this, jn, /* @__PURE__ */ new Set());
    v(this, Bn, /* @__PURE__ */ new Set());
    v(this, Pn, /* @__PURE__ */ new Set());
    v(this, nn, /* @__PURE__ */ new Set());
    /**** Presence peer set ****/
    v(this, Zn, /* @__PURE__ */ new Map());
    /**** Fallback mode ****/
    v(this, Oe, !1);
    this.StoreID = e, x(this, Ps, t), x(this, ge, t.Fallback ?? null);
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, Vt);
  }
  /**** connect ****/
  async connect(e, t) {
    return new Promise((s, r) => {
      const i = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(i);
      x(this, Ut, o), f(this, V, ks).call(this, "connecting"), o.onopen = () => {
        f(this, V, ks).call(this, "connected"), f(this, V, bs).call(this, { type: "hello", from: l(this, ze) }), s();
      }, o.onerror = () => {
        if (!l(this, Oe) && l(this, ge) != null) {
          const a = e.replace("/signal/", "/ws/");
          x(this, Oe, !0), l(this, ge).connect(a, t).then(s).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        l(this, Vt) !== "disconnected" && (f(this, V, ks).call(this, "reconnecting"), setTimeout(() => {
          l(this, Vt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (a) => {
        try {
          const c = JSON.parse(a.data);
          f(this, V, ol).call(this, c, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    f(this, V, ks).call(this, "disconnected"), (e = l(this, Ut)) == null || e.close(), x(this, Ut, null);
    for (const t of l(this, it).values())
      t.close();
    l(this, it).clear(), l(this, He).clear(), l(this, Oe) && l(this, ge) != null && (l(this, ge).disconnect(), x(this, Oe, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var s;
    if (l(this, Oe)) {
      (s = l(this, ge)) == null || s.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of l(this, He).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var i;
    if (l(this, Oe)) {
      (i = l(this, ge)) == null || i.sendValue(e, t);
      return;
    }
    const s = f(this, V, Ki).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(s, 1), r.set(t, 33);
    for (const o of l(this, He).values())
      if (o.readyState === "open")
        try {
          o.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (l(this, Oe)) {
      (r = l(this, ge)) == null || r.requestValue(e);
      return;
    }
    const t = f(this, V, Ki).call(this, e), s = new Uint8Array(33);
    s[0] = 3, s.set(t, 1);
    for (const i of l(this, He).values())
      if (i.readyState === "open")
        try {
          i.send(s);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return l(this, jn).add(e), l(this, Oe) && l(this, ge) != null ? l(this, ge).onPatch(e) : () => {
      l(this, jn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, Bn).add(e), l(this, Oe) && l(this, ge) != null ? l(this, ge).onValue(e) : () => {
      l(this, Bn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Pn).add(e), () => {
      l(this, Pn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (l(this, Oe)) {
      (r = l(this, ge)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), s = new Uint8Array(1 + t.byteLength);
    s[0] = 4, s.set(t, 1);
    for (const i of l(this, He).values())
      if (i.readyState === "open")
        try {
          i.send(s);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return l(this, nn).add(e), () => {
      l(this, nn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, Zn);
  }
}
Ps = new WeakMap(), ze = new WeakMap(), ge = new WeakMap(), Ut = new WeakMap(), it = new WeakMap(), He = new WeakMap(), Vt = new WeakMap(), jn = new WeakMap(), Bn = new WeakMap(), Pn = new WeakMap(), nn = new WeakMap(), Zn = new WeakMap(), Oe = new WeakMap(), V = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
ks = function(e) {
  if (l(this, Vt) !== e) {
    x(this, Vt, e);
    for (const t of l(this, Pn))
      try {
        t(e);
      } catch {
      }
  }
}, bs = function(e) {
  var t;
  ((t = l(this, Ut)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, Ut).send(JSON.stringify(e));
}, ol = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === l(this, ze))
        return;
      l(this, it).has(e.from) || await f(this, V, al).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== l(this, ze))
        return;
      await f(this, V, cl).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== l(this, ze))
        return;
      const s = l(this, it).get(e.from);
      s != null && await s.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== l(this, ze))
        return;
      const s = l(this, it).get(e.from);
      s != null && await s.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, al = async function(e) {
  const t = f(this, V, Zi).call(this, e), s = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  f(this, V, Fi).call(this, s, e), l(this, He).set(e, s);
  const r = await t.createOffer();
  await t.setLocalDescription(r), f(this, V, bs).call(this, { type: "offer", from: l(this, ze), to: e, sdp: r });
}, cl = async function(e, t) {
  const s = f(this, V, Zi).call(this, e);
  await s.setRemoteDescription(new RTCSessionDescription(t));
  const r = await s.createAnswer();
  await s.setLocalDescription(r), f(this, V, bs).call(this, { type: "answer", from: l(this, ze), to: e, sdp: r });
}, Zi = function(e) {
  const t = l(this, Ps).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], s = new RTCPeerConnection({ iceServers: t });
  return l(this, it).set(e, s), s.onicecandidate = (r) => {
    r.candidate != null && f(this, V, bs).call(this, {
      type: "candidate",
      from: l(this, ze),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, s.ondatachannel = (r) => {
    f(this, V, Fi).call(this, r.channel, e), l(this, He).set(e, r.channel);
  }, s.onconnectionstatechange = () => {
    if (s.connectionState === "failed" || s.connectionState === "closed") {
      l(this, it).delete(e), l(this, He).delete(e), l(this, Zn).delete(e);
      for (const r of l(this, nn))
        try {
          r(e, null);
        } catch {
        }
    }
  }, s;
}, Fi = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (s) => {
    const r = new Uint8Array(s.data);
    f(this, V, ll).call(this, r, t);
  };
}, ll = function(e, t) {
  if (e.byteLength < 1)
    return;
  const s = e[0], r = e.slice(1);
  switch (s) {
    case 1: {
      for (const i of l(this, jn))
        try {
          i(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const i = f(this, V, hl).call(this, r.slice(0, 32)), o = r.slice(32);
      for (const a of l(this, Bn))
        try {
          a(i, o);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const i = JSON.parse(new TextDecoder().decode(r));
        if (typeof i.PeerId != "string")
          break;
        i.lastSeen = Date.now(), l(this, Zn).set(i.PeerId, i);
        for (const o of l(this, nn))
          try {
            o(i.PeerId, i);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, Ki = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let s = 0; s < e.length; s += 2)
    t[s / 2] = parseInt(e.slice(s, s + 2), 16);
  return t;
}, hl = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Fe(n) {
  return new Promise((e, t) => {
    n.onsuccess = () => {
      e(n.result);
    }, n.onerror = () => {
      t(n.error);
    };
  });
}
function Ot(n, e, t) {
  return n.transaction(e, t);
}
var kt, We, Zs, Je, yt;
class $f {
  /**** constructor ****/
  constructor(e) {
    v(this, Je);
    v(this, kt, null);
    v(this, We);
    v(this, Zs);
    x(this, We, e), x(this, Zs, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await f(this, Je, yt).call(this), t = Ot(e, ["snapshots"], "readonly"), s = await Fe(
      t.objectStore("snapshots").get(l(this, We))
    );
    return s != null ? s.data : null;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await f(this, Je, yt).call(this), s = Ot(t, ["snapshots"], "readwrite");
    await Fe(
      s.objectStore("snapshots").put({
        storeId: l(this, We),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await f(this, Je, yt).call(this), r = Ot(t, ["patches"], "readonly").objectStore("patches"), i = IDBKeyRange.bound(
      [l(this, We), e + 1],
      [l(this, We), Number.MAX_SAFE_INTEGER]
    );
    return (await Fe(
      r.getAll(i)
    )).sort((a, c) => a.clock - c.clock).map((a) => a.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const s = await f(this, Je, yt).call(this), r = Ot(s, ["patches"], "readwrite");
    try {
      await Fe(
        r.objectStore("patches").add({
          storeId: l(this, We),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await f(this, Je, yt).call(this), r = Ot(t, ["patches"], "readwrite").objectStore("patches"), i = IDBKeyRange.bound(
      [l(this, We), 0],
      [l(this, We), e - 1]
    );
    await new Promise((o, a) => {
      const c = r.openCursor(i);
      c.onsuccess = () => {
        const h = c.result;
        if (h == null) {
          o();
          return;
        }
        h.delete(), h.continue();
      }, c.onerror = () => {
        a(c.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = await f(this, Je, yt).call(this), s = Ot(t, ["values"], "readonly"), r = await Fe(
      s.objectStore("values").get(e)
    );
    return r != null ? r.data : null;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const s = await f(this, Je, yt).call(this), i = Ot(s, ["values"], "readwrite").objectStore("values"), o = await Fe(
      i.get(e)
    );
    o != null ? await Fe(
      i.put({ hash: e, data: o.data, ref_count: o.ref_count + 1 })
    ) : await Fe(
      i.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await f(this, Je, yt).call(this), r = Ot(t, ["values"], "readwrite").objectStore("values"), i = await Fe(
      r.get(e)
    );
    if (i == null)
      return;
    const o = i.ref_count - 1;
    o <= 0 ? await Fe(r.delete(e)) : await Fe(
      r.put({ hash: e, data: i.data, ref_count: o })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = l(this, kt)) == null || e.close(), x(this, kt, null);
  }
}
kt = new WeakMap(), We = new WeakMap(), Zs = new WeakMap(), Je = new WeakSet(), yt = async function() {
  return l(this, kt) != null ? l(this, kt) : new Promise((e, t) => {
    const s = indexedDB.open(l(this, Zs), 1);
    s.onupgradeneeded = (r) => {
      const i = r.target.result;
      i.objectStoreNames.contains("snapshots") || i.createObjectStore("snapshots", { keyPath: "storeId" }), i.objectStoreNames.contains("patches") || i.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), i.objectStoreNames.contains("values") || i.createObjectStore("values", { keyPath: "hash" });
    }, s.onsuccess = (r) => {
      x(this, kt, r.target.result), e(l(this, kt));
    }, s.onerror = (r) => {
      t(r.target.error);
    };
  });
};
class or extends Error {
  constructor(t, s) {
    super(s);
    gt(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
}
const Lf = 512 * 1024;
var De, _e, W, $t, Fn, Kn, Fs, Ks, sn, zn, jt, Hn, rn, on, an, bt, Bt, Ge, zs, Wn, St, P, ul, dl, fl, gl, pl, zi, ml, yl, wl, _l, Hi;
class jf {
  //----------------------------------------------------------------------------//
  //                               Construction                                  //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    v(this, P);
    v(this, De);
    v(this, _e);
    v(this, W);
    v(this, $t);
    v(this, Fn);
    gt(this, "PeerId", crypto.randomUUID());
    v(this, Kn, null);
    v(this, Fs, null);
    // outgoing patch queue (patches created while disconnected)
    v(this, Ks, []);
    // accumulated patch bytes since last checkpoint
    v(this, sn, 0);
    // sequence number of the last saved snapshot
    v(this, zn, 0);
    // current patch sequence number (append-monotonic counter, managed by SyncEngine)
    v(this, jt, 0);
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    v(this, Hn, new Uint8Array(0));
    // heartbeat timer
    v(this, rn, null);
    v(this, on, null);
    // presence peer tracking
    v(this, an, /* @__PURE__ */ new Map());
    v(this, bt, /* @__PURE__ */ new Map());
    v(this, Bt, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    v(this, Ge, null);
    // connection state mirror
    v(this, zs, "disconnected");
    v(this, Wn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    v(this, St, []);
    x(this, De, e), x(this, _e, t.PersistenceProvider ?? null), x(this, W, t.NetworkProvider ?? null), x(this, $t, t.PresenceProvider ?? t.NetworkProvider ?? null), x(this, Fn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && l(this, W) != null && x(this, Ge, new BroadcastChannel(`sns:${l(this, W).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                               Lifecycle                                     //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await f(this, P, ul).call(this), f(this, P, dl).call(this), f(this, P, fl).call(this), f(this, P, gl).call(this), f(this, P, pl).call(this), l(this, W) != null && l(this, W).onConnectionChange((e) => {
      x(this, zs, e);
      for (const t of l(this, Wn))
        try {
          t(e);
        } catch {
        }
      e === "connected" && f(this, P, ml).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, s;
    l(this, rn) != null && (clearInterval(l(this, rn)), x(this, rn, null));
    for (const r of l(this, bt).values())
      clearTimeout(r);
    l(this, bt).clear();
    for (const r of l(this, St))
      try {
        r();
      } catch {
      }
    x(this, St, []), (e = l(this, Ge)) == null || e.close(), x(this, Ge, null), (t = l(this, W)) == null || t.disconnect(), l(this, _e) != null && l(this, sn) > 0 && await f(this, P, zi).call(this), await ((s = l(this, _e)) == null ? void 0 : s.close());
  }
  //----------------------------------------------------------------------------//
  //                            Network connection                               //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (l(this, W) == null)
      throw new or("no-network-provider", "no NetworkProvider configured");
    x(this, Kn, e), x(this, Fs, t), await l(this, W).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (l(this, W) == null)
      throw new or("no-network-provider", "no NetworkProvider configured");
    l(this, W).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (l(this, W) == null)
      throw new or("no-network-provider", "no NetworkProvider configured");
    if (l(this, Kn) == null)
      throw new or(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await l(this, W).connect(l(this, Kn), l(this, Fs));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, zs);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Wn).add(e), () => {
      l(this, Wn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                Presence                                     //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var s, r;
    x(this, on, e);
    const t = { ...e, PeerId: this.PeerId };
    (s = l(this, $t)) == null || s.sendLocalState(e), (r = l(this, Ge)) == null || r.postMessage({ type: "presence", payload: e });
    for (const i of l(this, Bt))
      try {
        i(this.PeerId, t, "local");
      } catch {
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return l(this, an);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return l(this, Bt).add(e), () => {
      l(this, Bt).delete(e);
    };
  }
}
De = new WeakMap(), _e = new WeakMap(), W = new WeakMap(), $t = new WeakMap(), Fn = new WeakMap(), Kn = new WeakMap(), Fs = new WeakMap(), Ks = new WeakMap(), sn = new WeakMap(), zn = new WeakMap(), jt = new WeakMap(), Hn = new WeakMap(), rn = new WeakMap(), on = new WeakMap(), an = new WeakMap(), bt = new WeakMap(), Bt = new WeakMap(), Ge = new WeakMap(), zs = new WeakMap(), Wn = new WeakMap(), St = new WeakMap(), P = new WeakSet(), ul = async function() {
  if (l(this, _e) == null)
    return;
  const e = await l(this, _e).loadSnapshot();
  if (e != null)
    try {
      const s = l(this, De).constructor.fromBinary(e);
    } catch {
    }
  const t = await l(this, _e).loadPatchesSince(l(this, zn));
  for (const s of t)
    try {
      l(this, De).applyRemotePatch(s);
    } catch {
    }
  t.length > 0 && x(this, jt, l(this, zn) + t.length), x(this, Hn, l(this, De).currentCursor);
}, //----------------------------------------------------------------------------//
//                           Private — Wiring                                  //
//----------------------------------------------------------------------------//
dl = function() {
  const e = l(this, De).onChangeInvoke((t, s) => {
    var o, a;
    if (t !== "internal")
      return;
    const r = l(this, Hn);
    er(this, jt)._++;
    const i = l(this, De).exportPatch(r);
    x(this, Hn, l(this, De).currentCursor), i.byteLength !== 0 && (l(this, _e) != null && (l(this, _e).appendPatch(i, l(this, jt)).catch(() => {
    }), x(this, sn, l(this, sn) + i.byteLength), l(this, sn) >= Lf && f(this, P, zi).call(this).catch(() => {
    })), ((o = l(this, W)) == null ? void 0 : o.ConnectionState) === "connected" ? (l(this, W).sendPatch(i), (a = l(this, Ge)) == null || a.postMessage({ type: "patch", payload: i })) : l(this, Ks).push(i), f(this, P, yl).call(this, s).catch(() => {
    }));
  });
  l(this, St).push(e);
}, fl = function() {
  if (l(this, W) != null) {
    const t = l(this, W).onPatch((r) => {
      try {
        l(this, De).applyRemotePatch(r);
      } catch {
      }
    });
    l(this, St).push(t);
    const s = l(this, W).onValue(async (r, i) => {
      var o;
      await ((o = l(this, _e)) == null ? void 0 : o.saveValue(r, i));
    });
    l(this, St).push(s);
  }
  const e = l(this, $t);
  if (e != null) {
    const t = e.onRemoteState((s, r) => {
      f(this, P, wl).call(this, s, r);
    });
    l(this, St).push(t);
  }
}, gl = function() {
  const e = l(this, Fn) / 4;
  x(this, rn, setInterval(() => {
    var t, s;
    l(this, on) != null && ((t = l(this, $t)) == null || t.sendLocalState(l(this, on)), (s = l(this, Ge)) == null || s.postMessage({ type: "presence", payload: l(this, on) }));
  }, e));
}, pl = function() {
  l(this, Ge) != null && (l(this, Ge).onmessage = (e) => {
    var s;
    const t = e.data;
    if (t.type === "patch")
      try {
        l(this, De).applyRemotePatch(t.payload);
      } catch {
      }
    else t.type === "presence" && ((s = l(this, $t)) == null || s.sendLocalState(t.payload));
  });
}, zi = async function() {
  l(this, _e) != null && (await l(this, _e).saveSnapshot(l(this, De).asBinary()), await l(this, _e).prunePatches(l(this, jt)), x(this, zn, l(this, jt)), x(this, sn, 0));
}, //----------------------------------------------------------------------------//
//                       Private — Offline queue flush                         //
//----------------------------------------------------------------------------//
ml = function() {
  var t;
  const e = l(this, Ks).splice(0);
  for (const s of e)
    try {
      (t = l(this, W)) == null || t.sendPatch(s);
    } catch {
    }
}, yl = async function(e) {
  for (const [t, s] of Object.entries(e))
    s.has("Value") && l(this, W) != null;
}, //----------------------------------------------------------------------------//
//                        Private — Remote presence                            //
//----------------------------------------------------------------------------//
wl = function(e, t) {
  if (t == null) {
    f(this, P, Hi).call(this, e);
    return;
  }
  const s = { ...t, _lastSeen: Date.now() };
  l(this, an).set(e, s), f(this, P, _l).call(this, e);
  for (const r of l(this, Bt))
    try {
      r(e, t, "remote");
    } catch {
    }
}, _l = function(e) {
  const t = l(this, bt).get(e);
  t != null && clearTimeout(t);
  const s = setTimeout(
    () => {
      f(this, P, Hi).call(this, e);
    },
    l(this, Fn)
  );
  l(this, bt).set(e, s);
}, Hi = function(e) {
  if (!l(this, an).has(e))
    return;
  l(this, an).delete(e);
  const t = l(this, bt).get(e);
  t != null && (clearTimeout(t), l(this, bt).delete(e));
  for (const s of l(this, Bt))
    try {
      s(e, void 0, "remote");
    } catch {
    }
};
export {
  $f as SNS_BrowserPersistenceProvider,
  xa as SNS_Entry,
  le as SNS_Error,
  bo as SNS_Link,
  ko as SNS_Note,
  ma as SNS_NoteStore,
  jf as SNS_SyncEngine,
  Vf as SNS_WebRTCProvider,
  Uf as SNS_WebSocketProvider
};
