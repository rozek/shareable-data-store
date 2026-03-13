var Zl = Object.defineProperty;
var Vo = (n) => {
  throw TypeError(n);
};
var zl = (n, e, t) => e in n ? Zl(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Lt = (n, e, t) => zl(n, typeof e != "symbol" ? e + "" : e, t), ai = (n, e, t) => e.has(n) || Vo("Cannot " + t);
var l = (n, e, t) => (ai(n, e, "read from private field"), t ? t.call(n) : e.get(n)), _ = (n, e, t) => e.has(n) ? Vo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), S = (n, e, t, s) => (ai(n, e, "write to private field"), s ? s.call(n, t) : e.set(n, t), t), d = (n, e, t) => (ai(n, e, "access private method"), t);
var hr = (n, e, t, s) => ({
  set _(r) {
    S(n, e, r, t);
  },
  get _() {
    return l(n, e, s);
  }
});
class P extends Error {
  constructor(t, s) {
    super(s);
    Lt(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const Oe = "00000000-0000-4000-8000-000000000000", q = "00000000-0000-4000-8000-000000000001", Te = "00000000-0000-4000-8000-000000000002", Tn = "text/plain", Hl = 131072, Jl = 2048, Wl = 5e3, $o = 1024, Uo = 256, Bo = 1024, jo = 262144, ql = 200;
function Gl(n) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(n).toString("base64");
  let t = "";
  for (let s = 0; s < n.byteLength; s++)
    t += String.fromCharCode(n[s]);
  return btoa(t);
}
function Ha(n) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(n, "base64")) : Uint8Array.from(atob(n), (t) => t.charCodeAt(0));
}
var kt, jn, za;
let Yl = (za = class {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    _(this, kt, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    _(this, jn);
  }
  /**** _BLOBhash — FNV-1a 32-bit content hash used as blob identity key ****/
  static _BLOBhash(e) {
    let t = 2166136261;
    for (let s = 0; s < e.length; s++)
      t = Math.imul(t ^ e[s], 16777619) >>> 0;
    return `fnv1a-${t.toString(16).padStart(8, "0")}-${e.length}`;
  }
  /**** _storeValueBlob — cache a blob (called by backends on write) ****/
  _storeValueBlob(e, t) {
    l(this, kt).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = l(this, kt).get(e);
    return t == null && l(this, jn) != null && (t = await l(this, jn).call(this, e), t != null && l(this, kt).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    l(this, kt).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return l(this, kt).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return l(this, kt).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    S(this, jn, e);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/
  newEntryFromJSONat(e, t, s) {
    const r = typeof e == "string" ? JSON.parse(e) : e;
    switch (!0) {
      case (r == null ? void 0 : r.Kind) === "item":
        return this.deserializeItemInto(r, t, s);
      case (r == null ? void 0 : r.Kind) === "link":
        return this.deserializeLinkInto(r, t, s);
      default:
        throw new P("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
    }
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** EntryMayBeMovedTo — true when moving Entry into outerItem at InsertionIndex is allowed ****/
  EntryMayBeMovedTo(e, t, s) {
    return this._mayMoveEntryTo(e.Id, t.Id, s);
  }
  /**** EntryMayBeDeleted — true when Entry can be moved to the trash ****/
  EntryMayBeDeleted(e) {
    return this._mayDeleteEntry(e.Id);
  }
  //----------------------------------------------------------------------------//
  //                            OrderKey Management                             //
  //----------------------------------------------------------------------------//
  /**** rebalanceInnerEntriesOf — reassign fresh, evenly-spaced OrderKeys to all direct inner entries ****/
  rebalanceInnerEntriesOf(e) {
    this.transact(() => this._rebalanceInnerEntriesOf(e.Id));
  }
  /**** asJSON — serialise the full store tree as a plain, human-readable JSON object ****/
  asJSON() {
    return this._EntryAsJSON(Oe);
  }
  /**** _isLiteralOf — true when the item stores an inline literal string ****/
  _isLiteralOf(e) {
    const t = this._ValueKindOf(e);
    return t === "literal" || t === "literal-reference";
  }
  /**** _isBinaryOf — true when the item stores inline binary data ****/
  _isBinaryOf(e) {
    const t = this._ValueKindOf(e);
    return t === "binary" || t === "binary-reference";
  }
  /**** _outerItemOf — return the direct outer item of the entry with the given Id ****/
  _outerItemOf(e) {
    const t = this._outerItemIdOf(e);
    return t == null ? void 0 : this.EntryWithId(t);
  }
  /**** _outerItemChainOf — return the full ancestor chain from direct outer to root ****/
  _outerItemChainOf(e) {
    const t = [];
    let s = this._outerItemIdOf(e);
    for (; s != null && (t.push(this.EntryWithId(s)), s !== Oe); )
      s = this._outerItemIdOf(s);
    return t;
  }
  /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
  _outerItemIdsOf(e) {
    return this._outerItemChainOf(e).map((t) => t.Id);
  }
  /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
  _EntryAsJSON(e) {
    const t = this._KindOf(e), s = this._LabelOf(e), r = this._InfoProxyOf(e), i = {};
    for (const h of Object.keys(r))
      i[h] = r[h];
    if (t === "link") {
      const h = this._TargetOf(e).Id;
      return { Kind: "link", Id: e, Label: s, TargetId: h, Info: i };
    }
    const o = this._TypeOf(e), a = this._ValueKindOf(e), c = { Kind: "item", Id: e, Label: s, Type: o, ValueKind: a, Info: i, innerEntries: [] };
    if (a === "literal" || a === "binary") {
      const h = this._currentValueOf(e);
      h !== void 0 && (c.Value = typeof h == "string" ? h : Gl(h));
    }
    return c.innerEntries = Array.from(this._innerEntriesOf(e)).map((h) => this._EntryAsJSON(h.Id)), c;
  }
}, kt = new WeakMap(), jn = new WeakMap(), za);
var V;
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
})(V || (V = {}));
var Po;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Po || (Po = {}));
const k = V.arrayToEnum([
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
]), Vt = (n) => {
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
}, y = V.arrayToEnum([
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
class Et extends Error {
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
    if (!(e instanceof Et))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, V.jsonStringifyReplacer, 2);
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
Et.create = (n) => new Et(n);
const Ci = (n, e) => {
  let t;
  switch (n.code) {
    case y.invalid_type:
      n.received === k.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case y.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, V.jsonStringifyReplacer)}`;
      break;
    case y.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${V.joinValues(n.keys, ", ")}`;
      break;
    case y.invalid_union:
      t = "Invalid input";
      break;
    case y.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${V.joinValues(n.options)}`;
      break;
    case y.invalid_enum_value:
      t = `Invalid enum value. Expected ${V.joinValues(n.options)}, received '${n.received}'`;
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
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : V.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
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
      t = e.defaultError, V.assertNever(n);
  }
  return { message: t };
};
let Xl = Ci;
function Ql() {
  return Xl;
}
const eh = (n) => {
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
function v(n, e) {
  const t = Ql(), s = eh({
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
      t === Ci ? void 0 : Ci
      // then global default map
    ].filter((r) => !!r)
  });
  n.common.issues.push(s);
}
class Me {
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
    return Me.mergeObjectSync(e, s);
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
}), Is = (n) => ({ status: "dirty", value: n }), Pe = (n) => ({ status: "valid", value: n }), Ko = (n) => n.status === "aborted", Fo = (n) => n.status === "dirty", rs = (n) => n.status === "valid", kr = (n) => typeof Promise < "u" && n instanceof Promise;
var b;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(b || (b = {}));
class Wt {
  constructor(e, t, s, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Zo = (n, e) => {
  if (rs(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Et(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function A(n) {
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
class M {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Vt(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Vt(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Me(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Vt(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (kr(t))
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
      parsedType: Vt(e)
    }, r = this._parseSync({ data: e, path: s.path, parent: s });
    return Zo(s, r);
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
      parsedType: Vt(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return rs(i) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => rs(i) ? {
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
      parsedType: Vt(e)
    }, r = this._parse({ data: e, path: s.path, parent: s }), i = await (kr(r) ? r : Promise.resolve(r));
    return Zo(s, i);
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
    return new as({
      schema: this,
      typeName: T.ZodEffects,
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
    return Ht.create(this, this._def);
  }
  nullable() {
    return cs.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ht.create(this);
  }
  promise() {
    return xr.create(this, this._def);
  }
  or(e) {
    return Sr.create([this, e], this._def);
  }
  and(e) {
    return Ir.create(this, e, this._def);
  }
  transform(e) {
    return new as({
      ...A(this._def),
      schema: this,
      typeName: T.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ai({
      ...A(this._def),
      innerType: this,
      defaultValue: t,
      typeName: T.ZodDefault
    });
  }
  brand() {
    return new Sh({
      typeName: T.ZodBranded,
      type: this,
      ...A(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Di({
      ...A(this._def),
      innerType: this,
      catchValue: t,
      typeName: T.ZodCatch
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
    return lo.create(this, e);
  }
  readonly() {
    return Li.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const th = /^c[^\s-]{8,}$/i, nh = /^[0-9a-z]+$/, sh = /^[0-9A-HJKMNP-TV-Z]{26}$/i, rh = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, ih = /^[a-z0-9_-]{21}$/i, oh = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, ah = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, ch = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, lh = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ci;
const hh = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, uh = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, dh = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, fh = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, gh = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ph = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Ja = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", mh = new RegExp(`^${Ja}$`);
function Wa(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function yh(n) {
  return new RegExp(`^${Wa(n)}$`);
}
function wh(n) {
  let e = `${Ja}T${Wa(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function _h(n, e) {
  return !!((e === "v4" || !e) && hh.test(n) || (e === "v6" || !e) && dh.test(n));
}
function vh(n, e) {
  if (!oh.test(n))
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
function kh(n, e) {
  return !!((e === "v4" || !e) && uh.test(n) || (e === "v6" || !e) && fh.test(n));
}
class Zt extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== k.string) {
      const i = this._getOrReturnCtx(e);
      return v(i, {
        code: y.invalid_type,
        expected: k.string,
        received: i.parsedType
      }), C;
    }
    const s = new Me();
    let r;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (r = this._getOrReturnCtx(e, r), v(r, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (r = this._getOrReturnCtx(e, r), v(r, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "length") {
        const o = e.data.length > i.value, a = e.data.length < i.value;
        (o || a) && (r = this._getOrReturnCtx(e, r), o ? v(r, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : a && v(r, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), s.dirty());
      } else if (i.kind === "email")
        ch.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "emoji")
        ci || (ci = new RegExp(lh, "u")), ci.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "uuid")
        rh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "nanoid")
        ih.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid")
        th.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid2")
        nh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "ulid")
        sh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "ulid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), v(r, {
            validation: "url",
            code: y.invalid_string,
            message: i.message
          }), s.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "regex",
        code: y.invalid_string,
        message: i.message
      }), s.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), s.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "datetime" ? wh(i).test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), s.dirty()) : i.kind === "date" ? mh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), s.dirty()) : i.kind === "time" ? yh(i).test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), s.dirty()) : i.kind === "duration" ? ah.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "ip" ? _h(e.data, i.version) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "jwt" ? vh(e.data, i.alg) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "cidr" ? kh(e.data, i.version) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64" ? gh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64url" ? ph.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "base64url",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : V.assertNever(i);
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
  typeName: T.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
function bh(n, e) {
  const t = (n.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, r = t > s ? t : s, i = Number.parseInt(n.toFixed(r).replace(".", "")), o = Number.parseInt(e.toFixed(r).replace(".", ""));
  return i % o / 10 ** r;
}
class is extends M {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== k.number) {
      const i = this._getOrReturnCtx(e);
      return v(i, {
        code: y.invalid_type,
        expected: k.number,
        received: i.parsedType
      }), C;
    }
    let s;
    const r = new Me();
    for (const i of this._def.checks)
      i.kind === "int" ? V.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), r.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? bh(e.data, i.value) !== 0 && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.not_finite,
        message: i.message
      }), r.dirty()) : V.assertNever(i);
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
    return new is({
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
    return new is({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && V.isInteger(e.value));
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
is.create = (n) => new is({
  checks: [],
  typeName: T.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class Rs extends M {
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
    const r = new Me();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), v(s, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : V.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return v(t, {
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
    return new Rs({
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
    return new Rs({
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
Rs.create = (n) => new Rs({
  checks: [],
  typeName: T.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
class zo extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== k.boolean) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.boolean,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
zo.create = (n) => new zo({
  typeName: T.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class br extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== k.date) {
      const i = this._getOrReturnCtx(e);
      return v(i, {
        code: y.invalid_type,
        expected: k.date,
        received: i.parsedType
      }), C;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return v(i, {
        code: y.invalid_date
      }), C;
    }
    const s = new Me();
    let r;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), s.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), s.dirty()) : V.assertNever(i);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new br({
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
br.create = (n) => new br({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: T.ZodDate,
  ...A(n)
});
class Ho extends M {
  _parse(e) {
    if (this._getType(e) !== k.symbol) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.symbol,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Ho.create = (n) => new Ho({
  typeName: T.ZodSymbol,
  ...A(n)
});
class Ti extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.undefined,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Ti.create = (n) => new Ti({
  typeName: T.ZodUndefined,
  ...A(n)
});
class Jo extends M {
  _parse(e) {
    if (this._getType(e) !== k.null) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.null,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Jo.create = (n) => new Jo({
  typeName: T.ZodNull,
  ...A(n)
});
class Ns extends M {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Pe(e.data);
  }
}
Ns.create = (n) => new Ns({
  typeName: T.ZodAny,
  ...A(n)
});
class Ei extends M {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Pe(e.data);
  }
}
Ei.create = (n) => new Ei({
  typeName: T.ZodUnknown,
  ...A(n)
});
class qt extends M {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return v(t, {
      code: y.invalid_type,
      expected: k.never,
      received: t.parsedType
    }), C;
  }
}
qt.create = (n) => new qt({
  typeName: T.ZodNever,
  ...A(n)
});
class Wo extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.void,
        received: s.parsedType
      }), C;
    }
    return Pe(e.data);
  }
}
Wo.create = (n) => new Wo({
  typeName: T.ZodVoid,
  ...A(n)
});
class ht extends M {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== k.array)
      return v(t, {
        code: y.invalid_type,
        expected: k.array,
        received: t.parsedType
      }), C;
    if (r.exactLength !== null) {
      const o = t.data.length > r.exactLength.value, a = t.data.length < r.exactLength.value;
      (o || a) && (v(t, {
        code: o ? y.too_big : y.too_small,
        minimum: a ? r.exactLength.value : void 0,
        maximum: o ? r.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: r.exactLength.message
      }), s.dirty());
    }
    if (r.minLength !== null && t.data.length < r.minLength.value && (v(t, {
      code: y.too_small,
      minimum: r.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.minLength.message
    }), s.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (v(t, {
      code: y.too_big,
      maximum: r.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, a) => r.type._parseAsync(new Wt(t, o, t.path, a)))).then((o) => Me.mergeArray(s, o));
    const i = [...t.data].map((o, a) => r.type._parseSync(new Wt(t, o, t.path, a)));
    return Me.mergeArray(s, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ht({
      ...this._def,
      minLength: { value: e, message: b.toString(t) }
    });
  }
  max(e, t) {
    return new ht({
      ...this._def,
      maxLength: { value: e, message: b.toString(t) }
    });
  }
  length(e, t) {
    return new ht({
      ...this._def,
      exactLength: { value: e, message: b.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ht.create = (n, e) => new ht({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: T.ZodArray,
  ...A(e)
});
function En(n) {
  if (n instanceof te) {
    const e = {};
    for (const t in n.shape) {
      const s = n.shape[t];
      e[t] = Ht.create(En(s));
    }
    return new te({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof ht ? new ht({
    ...n._def,
    type: En(n.element)
  }) : n instanceof Ht ? Ht.create(En(n.unwrap())) : n instanceof cs ? cs.create(En(n.unwrap())) : n instanceof mn ? mn.create(n.items.map((e) => En(e))) : n;
}
class te extends M {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = V.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== k.object) {
      const h = this._getOrReturnCtx(e);
      return v(h, {
        code: y.invalid_type,
        expected: k.object,
        received: h.parsedType
      }), C;
    }
    const { status: s, ctx: r } = this._processInputParams(e), { shape: i, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof qt && this._def.unknownKeys === "strip"))
      for (const h in r.data)
        o.includes(h) || a.push(h);
    const c = [];
    for (const h of o) {
      const u = i[h], f = r.data[h];
      c.push({
        key: { status: "valid", value: h },
        value: u._parse(new Wt(r, f, r.path, h)),
        alwaysSet: h in r.data
      });
    }
    if (this._def.catchall instanceof qt) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const u of a)
          c.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: r.data[u] }
          });
      else if (h === "strict")
        a.length > 0 && (v(r, {
          code: y.unrecognized_keys,
          keys: a
        }), s.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const u of a) {
        const f = r.data[u];
        c.push({
          key: { status: "valid", value: u },
          value: h._parse(
            new Wt(r, f, r.path, u)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: u in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const u of c) {
        const f = await u.key, g = await u.value;
        h.push({
          key: f,
          value: g,
          alwaysSet: u.alwaysSet
        });
      }
      return h;
    }).then((h) => Me.mergeObjectSync(s, h)) : Me.mergeObjectSync(s, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return b.errToObj, new te({
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
    return new te({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new te({
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
    return new te({
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
    return new te({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: T.ZodObject
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
    return new te({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of V.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new te({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of V.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new te({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return En(this);
  }
  partial(e) {
    const t = {};
    for (const s of V.objectKeys(this.shape)) {
      const r = this.shape[s];
      e && !e[s] ? t[s] = r : t[s] = r.optional();
    }
    return new te({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of V.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let i = this.shape[s];
        for (; i instanceof Ht; )
          i = i._def.innerType;
        t[s] = i;
      }
    return new te({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return qa(V.objectKeys(this.shape));
  }
}
te.create = (n, e) => new te({
  shape: () => n,
  unknownKeys: "strip",
  catchall: qt.create(),
  typeName: T.ZodObject,
  ...A(e)
});
te.strictCreate = (n, e) => new te({
  shape: () => n,
  unknownKeys: "strict",
  catchall: qt.create(),
  typeName: T.ZodObject,
  ...A(e)
});
te.lazycreate = (n, e) => new te({
  shape: n,
  unknownKeys: "strip",
  catchall: qt.create(),
  typeName: T.ZodObject,
  ...A(e)
});
class Sr extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function r(i) {
      for (const a of i)
        if (a.result.status === "valid")
          return a.result;
      for (const a of i)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((a) => new Et(a.ctx.common.issues));
      return v(t, {
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
      const a = o.map((c) => new Et(c));
      return v(t, {
        code: y.invalid_union,
        unionErrors: a
      }), C;
    }
  }
  get options() {
    return this._def.options;
  }
}
Sr.create = (n, e) => new Sr({
  options: n,
  typeName: T.ZodUnion,
  ...A(e)
});
function Oi(n, e) {
  const t = Vt(n), s = Vt(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === k.object && s === k.object) {
    const r = V.objectKeys(e), i = V.objectKeys(n).filter((a) => r.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of i) {
      const c = Oi(n[a], e[a]);
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
      const o = n[i], a = e[i], c = Oi(o, a);
      if (!c.valid)
        return { valid: !1 };
      r.push(c.data);
    }
    return { valid: !0, data: r };
  } else return t === k.date && s === k.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class Ir extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), r = (i, o) => {
      if (Ko(i) || Ko(o))
        return C;
      const a = Oi(i.value, o.value);
      return a.valid ? ((Fo(i) || Fo(o)) && t.dirty(), { status: t.value, value: a.data }) : (v(s, {
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
Ir.create = (n, e, t) => new Ir({
  left: n,
  right: e,
  typeName: T.ZodIntersection,
  ...A(t)
});
class mn extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.array)
      return v(s, {
        code: y.invalid_type,
        expected: k.array,
        received: s.parsedType
      }), C;
    if (s.data.length < this._def.items.length)
      return v(s, {
        code: y.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), C;
    !this._def.rest && s.data.length > this._def.items.length && (v(s, {
      code: y.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...s.data].map((o, a) => {
      const c = this._def.items[a] || this._def.rest;
      return c ? c._parse(new Wt(s, o, s.path, a)) : null;
    }).filter((o) => !!o);
    return s.common.async ? Promise.all(i).then((o) => Me.mergeArray(t, o)) : Me.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new mn({
      ...this._def,
      rest: e
    });
  }
}
mn.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new mn({
    items: n,
    typeName: T.ZodTuple,
    rest: null,
    ...A(e)
  });
};
class qo extends M {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.map)
      return v(s, {
        code: y.invalid_type,
        expected: k.map,
        received: s.parsedType
      }), C;
    const r = this._def.keyType, i = this._def.valueType, o = [...s.data.entries()].map(([a, c], h) => ({
      key: r._parse(new Wt(s, a, s.path, [h, "key"])),
      value: i._parse(new Wt(s, c, s.path, [h, "value"]))
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
qo.create = (n, e, t) => new qo({
  valueType: e,
  keyType: n,
  typeName: T.ZodMap,
  ...A(t)
});
class Ms extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== k.set)
      return v(s, {
        code: y.invalid_type,
        expected: k.set,
        received: s.parsedType
      }), C;
    const r = this._def;
    r.minSize !== null && s.data.size < r.minSize.value && (v(s, {
      code: y.too_small,
      minimum: r.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.minSize.message
    }), t.dirty()), r.maxSize !== null && s.data.size > r.maxSize.value && (v(s, {
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
    const a = [...s.data.values()].map((c, h) => i._parse(new Wt(s, c, s.path, h)));
    return s.common.async ? Promise.all(a).then((c) => o(c)) : o(a);
  }
  min(e, t) {
    return new Ms({
      ...this._def,
      minSize: { value: e, message: b.toString(t) }
    });
  }
  max(e, t) {
    return new Ms({
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
Ms.create = (n, e) => new Ms({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: T.ZodSet,
  ...A(e)
});
class Go extends M {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Go.create = (n, e) => new Go({
  getter: n,
  typeName: T.ZodLazy,
  ...A(e)
});
class Yo extends M {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return v(t, {
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
Yo.create = (n, e) => new Yo({
  value: n,
  typeName: T.ZodLiteral,
  ...A(e)
});
function qa(n, e) {
  return new os({
    values: n,
    typeName: T.ZodEnum,
    ...A(e)
  });
}
class os extends M {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return v(t, {
        expected: V.joinValues(s),
        received: t.parsedType,
        code: y.invalid_type
      }), C;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return v(t, {
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
    return os.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return os.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
os.create = qa;
class Xo extends M {
  _parse(e) {
    const t = V.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== k.string && s.parsedType !== k.number) {
      const r = V.objectValues(t);
      return v(s, {
        expected: V.joinValues(r),
        received: s.parsedType,
        code: y.invalid_type
      }), C;
    }
    if (this._cache || (this._cache = new Set(V.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = V.objectValues(t);
      return v(s, {
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
Xo.create = (n, e) => new Xo({
  values: n,
  typeName: T.ZodNativeEnum,
  ...A(e)
});
class xr extends M {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== k.promise && t.common.async === !1)
      return v(t, {
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
xr.create = (n, e) => new xr({
  type: n,
  typeName: T.ZodPromise,
  ...A(e)
});
class as extends M {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === T.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), r = this._def.effect || null, i = {
      addIssue: (o) => {
        v(s, o), o.fatal ? t.abort() : t.dirty();
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
          return c.status === "aborted" ? C : c.status === "dirty" || t.value === "dirty" ? Is(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return C;
        const a = this._def.schema._parseSync({
          data: o,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? C : a.status === "dirty" || t.value === "dirty" ? Is(a.value) : a;
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
        if (!rs(o))
          return C;
        const a = r.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => rs(o) ? Promise.resolve(r.transform(o.value, i)).then((a) => ({
          status: t.value,
          value: a
        })) : C);
    V.assertNever(r);
  }
}
as.create = (n, e, t) => new as({
  schema: n,
  typeName: T.ZodEffects,
  effect: e,
  ...A(t)
});
as.createWithPreprocess = (n, e, t) => new as({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: T.ZodEffects,
  ...A(t)
});
class Ht extends M {
  _parse(e) {
    return this._getType(e) === k.undefined ? Pe(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ht.create = (n, e) => new Ht({
  innerType: n,
  typeName: T.ZodOptional,
  ...A(e)
});
class cs extends M {
  _parse(e) {
    return this._getType(e) === k.null ? Pe(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
cs.create = (n, e) => new cs({
  innerType: n,
  typeName: T.ZodNullable,
  ...A(e)
});
class Ai extends M {
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
Ai.create = (n, e) => new Ai({
  innerType: n,
  typeName: T.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...A(e)
});
class Di extends M {
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
    return kr(r) ? r.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new Et(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new Et(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Di.create = (n, e) => new Di({
  innerType: n,
  typeName: T.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...A(e)
});
class Qo extends M {
  _parse(e) {
    if (this._getType(e) !== k.nan) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.nan,
        received: s.parsedType
      }), C;
    }
    return { status: "valid", value: e.data };
  }
}
Qo.create = (n) => new Qo({
  typeName: T.ZodNaN,
  ...A(n)
});
class Sh extends M {
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
class lo extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return i.status === "aborted" ? C : i.status === "dirty" ? (t.dirty(), Is(i.value)) : this._def.out._parseAsync({
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
    return new lo({
      in: e,
      out: t,
      typeName: T.ZodPipeline
    });
  }
}
class Li extends M {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (r) => (rs(r) && (r.value = Object.freeze(r.value)), r);
    return kr(t) ? t.then((r) => s(r)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Li.create = (n, e) => new Li({
  innerType: n,
  typeName: T.ZodReadonly,
  ...A(e)
});
function ea(n, e) {
  const t = typeof n == "function" ? n(e) : typeof n == "string" ? { message: n } : n;
  return typeof t == "string" ? { message: t } : t;
}
function Ih(n, e = {}, t) {
  return n ? Ns.create().superRefine((s, r) => {
    const i = n(s);
    if (i instanceof Promise)
      return i.then((o) => {
        if (!o) {
          const a = ea(e, s), c = a.fatal ?? t ?? !0;
          r.addIssue({ code: "custom", ...a, fatal: c });
        }
      });
    if (!i) {
      const o = ea(e, s), a = o.fatal ?? t ?? !0;
      r.addIssue({ code: "custom", ...o, fatal: a });
    }
  }) : Ns.create();
}
var T;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(T || (T = {}));
const xh = (n, e = {
  message: `Input not instance of ${n.name}`
}) => Ih((t) => t instanceof n, e), tr = Zt.create, Ga = is.create, Ch = Ti.create;
Ns.create;
const Th = Ei.create;
qt.create;
ht.create;
const Eh = Sr.create;
Ir.create;
mn.create;
os.create;
xr.create;
Ht.create;
cs.create;
function Kr(n, e) {
  var r;
  const t = n.safeParse(e);
  if (t.success)
    return t.data;
  const s = ((r = t.error.issues[0]) == null ? void 0 : r.message) ?? "invalid argument";
  throw new P("invalid-argument", s);
}
const Oh = tr({
  invalid_type_error: "Label must be a string"
}).max($o, `Label must not exceed ${$o} characters`), Ah = tr({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(Uo, `MIMEType must not exceed ${Uo} characters`), Dh = tr({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(Bo, `Info key must not exceed ${Bo} characters`), Lh = Th().superRefine((n, e) => {
  let t;
  try {
    t = JSON.stringify(n);
  } catch {
    e.addIssue({
      code: y.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  if (t === void 0) {
    e.addIssue({
      code: y.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > jo && e.addIssue({
    code: y.custom,
    message: `Info value must not exceed ${jo} bytes when serialised as UTF-8 JSON`
  });
});
function Ya(n) {
  Kr(Oh, n);
}
function Ri(n) {
  Kr(Ah, n);
}
function Rh(n) {
  Kr(Dh, n);
}
function Nh(n) {
  Kr(Lh, n);
}
class Xa {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
  get isRootItem() {
    return this.Id === Oe;
  }
  get isTrashItem() {
    return this.Id === q;
  }
  get isLostAndFoundItem() {
    return this.Id === Te;
  }
  get isItem() {
    return this._Store._KindOf(this.Id) === "item";
  }
  get isLink() {
    return this._Store._KindOf(this.Id) === "link";
  }
  //----------------------------------------------------------------------------//
  //                                 Hierarchy                                  //
  //----------------------------------------------------------------------------//
  /**** outerItem / outerItemId / outerItemChain / outerItemIds ****/
  get outerItem() {
    return this._Store._outerItemOf(this.Id);
  }
  get outerItemId() {
    return this._Store._outerItemIdOf(this.Id);
  }
  get outerItemChain() {
    return this._Store._outerItemChainOf(this.Id);
  }
  get outerItemIds() {
    return this._Store._outerItemIdsOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                Description                                 //
  //----------------------------------------------------------------------------//
  /**** Label / Info ****/
  get Label() {
    return this._Store._LabelOf(this.Id);
  }
  set Label(e) {
    Ya(e), this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    if (e == null) throw new P("invalid-argument", "outerItem must not be missing");
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    if (e == null) throw new P("invalid-argument", "outerItem must not be missing");
    this._Store.moveEntryTo(this, e, t);
  }
  //----------------------------------------------------------------------------//
  //                                   Delete                                   //
  //----------------------------------------------------------------------------//
  /**** mayBeDeleted ****/
  get mayBeDeleted() {
    return this._Store._mayDeleteEntry(this.Id);
  }
  /**** delete ****/
  delete() {
    this._Store.deleteEntry(this);
  }
  /**** purge ****/
  purge() {
    this._Store.purgeEntry(this);
  }
  //----------------------------------------------------------------------------//
  //                               Serialisation                                //
  //----------------------------------------------------------------------------//
  /**** asJSON — serialise this entry and its subtree as a plain JSON object ****/
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
  /**** asBinary — serialise this entry and its subtree as a gzip-compressed binary ****/
  asBinary() {
    return this._Store._EntryAsBinary(this.Id);
  }
}
const Mh = Eh(
  [tr(), xh(Uint8Array), Ch()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), ta = Ga({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), Vh = tr({
  invalid_type_error: "Replacement must be a string"
});
function li(n, e, t) {
  var i;
  const s = n.safeParse(e);
  if (s.success)
    return s.data;
  const r = (t ? `${t}: ` : "") + (((i = s.error.issues[0]) == null ? void 0 : i.message) ?? "invalid argument");
  throw new P("invalid-argument", r);
}
class na extends Xa {
  constructor(e, t) {
    super(e, t);
  }
  //----------------------------------------------------------------------------//
  //                               Type & Value                                 //
  //----------------------------------------------------------------------------//
  /**** Type / ValueKind / isLiteral / isBinary ****/
  get Type() {
    return this._Store._TypeOf(this.Id);
  }
  set Type(e) {
    Ri(e), this._Store._setTypeOf(this.Id, e);
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
    li(Mh, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, s) {
    if (li(ta, e, "fromIndex"), !ta.safeParse(t).success || t < e)
      throw new P("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    li(Vh, s, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, s);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  /**** innerEntryList ****/
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                               Serialisation                                //
  //----------------------------------------------------------------------------//
  /**** asJSON — serialise this item and its subtree as a plain JSON object ****/
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
}
class sa extends Xa {
  constructor(e, t) {
    super(e, t);
  }
  /**** Target ****/
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                               Serialisation                                //
  //----------------------------------------------------------------------------//
  /**** asJSON — serialise this link as a plain JSON object ****/
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
}
const Ye = () => /* @__PURE__ */ new Map(), Ni = (n) => {
  const e = Ye();
  return n.forEach((t, s) => {
    e.set(s, t);
  }), e;
}, Qt = (n, e, t) => {
  let s = n.get(e);
  return s === void 0 && n.set(e, s = t()), s;
}, $h = (n, e) => {
  const t = [];
  for (const [s, r] of n)
    t.push(e(r, s));
  return t;
}, Uh = (n, e) => {
  for (const [t, s] of n)
    if (e(s, t))
      return !0;
  return !1;
}, ls = () => /* @__PURE__ */ new Set(), hi = (n) => n[n.length - 1], Bh = (n, e) => {
  for (let t = 0; t < e.length; t++)
    n.push(e[t]);
}, Gt = Array.from, ho = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (!e(n[t], t, n))
      return !1;
  return !0;
}, Qa = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (e(n[t], t, n))
      return !0;
  return !1;
}, jh = (n, e) => {
  const t = new Array(n);
  for (let s = 0; s < n; s++)
    t[s] = e(s, t);
  return t;
}, Fr = Array.isArray;
class Ph {
  constructor() {
    this._observers = Ye();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(e, t) {
    return Qt(
      this._observers,
      /** @type {string} */
      e,
      ls
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
    return Gt((this._observers.get(e) || Ye()).values()).forEach((s) => s(...t));
  }
  destroy() {
    this._observers = Ye();
  }
}
const dt = Math.floor, pr = Math.abs, ec = (n, e) => n < e ? n : e, vn = (n, e) => n > e ? n : e, tc = (n) => n !== 0 ? n < 0 : 1 / n < 0, ra = 1, ia = 2, ui = 4, di = 8, Vs = 32, Tt = 64, Ne = 128, Zr = 31, Mi = 63, pn = 127, Kh = 2147483647, Cr = Number.MAX_SAFE_INTEGER, oa = Number.MIN_SAFE_INTEGER, Fh = Number.isInteger || ((n) => typeof n == "number" && isFinite(n) && dt(n) === n), Zh = String.fromCharCode, zh = (n) => n.toLowerCase(), Hh = /^\s*/g, Jh = (n) => n.replace(Hh, ""), Wh = /([A-Z])/g, aa = (n, e) => Jh(n.replace(Wh, (t) => `${e}${zh(t)}`)), qh = (n) => {
  const e = unescape(encodeURIComponent(n)), t = e.length, s = new Uint8Array(t);
  for (let r = 0; r < t; r++)
    s[r] = /** @type {number} */
    e.codePointAt(r);
  return s;
}, $s = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), Gh = (n) => $s.encode(n), Yh = $s ? Gh : qh;
let Ls = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
Ls && Ls.decode(new Uint8Array()).length === 1 && (Ls = null);
const Xh = (n, e) => jh(e, () => n).join("");
class nr {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const zr = () => new nr(), Qh = (n) => {
  let e = n.cpos;
  for (let t = 0; t < n.bufs.length; t++)
    e += n.bufs[t].length;
  return e;
}, lt = (n) => {
  const e = new Uint8Array(Qh(n));
  let t = 0;
  for (let s = 0; s < n.bufs.length; s++) {
    const r = n.bufs[s];
    e.set(r, t), t += r.length;
  }
  return e.set(new Uint8Array(n.cbuf.buffer, 0, n.cpos), t), e;
}, eu = (n, e) => {
  const t = n.cbuf.length;
  t - n.cpos < e && (n.bufs.push(new Uint8Array(n.cbuf.buffer, 0, n.cpos)), n.cbuf = new Uint8Array(vn(t, e) * 2), n.cpos = 0);
}, ie = (n, e) => {
  const t = n.cbuf.length;
  n.cpos === t && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(t * 2), n.cpos = 0), n.cbuf[n.cpos++] = e;
}, Vi = ie, D = (n, e) => {
  for (; e > pn; )
    ie(n, Ne | pn & e), e = dt(e / 128);
  ie(n, pn & e);
}, uo = (n, e) => {
  const t = tc(e);
  for (t && (e = -e), ie(n, (e > Mi ? Ne : 0) | (t ? Tt : 0) | Mi & e), e = dt(e / 64); e > 0; )
    ie(n, (e > pn ? Ne : 0) | pn & e), e = dt(e / 128);
}, $i = new Uint8Array(3e4), tu = $i.length / 3, nu = (n, e) => {
  if (e.length < tu) {
    const t = $s.encodeInto(e, $i).written || 0;
    D(n, t);
    for (let s = 0; s < t; s++)
      ie(n, $i[s]);
  } else
    Ae(n, Yh(e));
}, su = (n, e) => {
  const t = unescape(encodeURIComponent(e)), s = t.length;
  D(n, s);
  for (let r = 0; r < s; r++)
    ie(
      n,
      /** @type {number} */
      t.codePointAt(r)
    );
}, Mn = $s && /** @type {any} */
$s.encodeInto ? nu : su, Hr = (n, e) => {
  const t = n.cbuf.length, s = n.cpos, r = ec(t - s, e.length), i = e.length - r;
  n.cbuf.set(e.subarray(0, r), s), n.cpos += r, i > 0 && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(vn(t * 2, i)), n.cbuf.set(e.subarray(r)), n.cpos = i);
}, Ae = (n, e) => {
  D(n, e.byteLength), Hr(n, e);
}, fo = (n, e) => {
  eu(n, e);
  const t = new DataView(n.cbuf.buffer, n.cpos, e);
  return n.cpos += e, t;
}, ru = (n, e) => fo(n, 4).setFloat32(0, e, !1), iu = (n, e) => fo(n, 8).setFloat64(0, e, !1), ou = (n, e) => (
  /** @type {any} */
  fo(n, 8).setBigInt64(0, e, !1)
), ca = new DataView(new ArrayBuffer(4)), au = (n) => (ca.setFloat32(0, n), ca.getFloat32(0) === n), Us = (n, e) => {
  switch (typeof e) {
    case "string":
      ie(n, 119), Mn(n, e);
      break;
    case "number":
      Fh(e) && pr(e) <= Kh ? (ie(n, 125), uo(n, e)) : au(e) ? (ie(n, 124), ru(n, e)) : (ie(n, 123), iu(n, e));
      break;
    case "bigint":
      ie(n, 122), ou(n, e);
      break;
    case "object":
      if (e === null)
        ie(n, 126);
      else if (Fr(e)) {
        ie(n, 117), D(n, e.length);
        for (let t = 0; t < e.length; t++)
          Us(n, e[t]);
      } else if (e instanceof Uint8Array)
        ie(n, 116), Ae(n, e);
      else {
        ie(n, 118);
        const t = Object.keys(e);
        D(n, t.length);
        for (let s = 0; s < t.length; s++) {
          const r = t[s];
          Mn(n, r), Us(n, e[r]);
        }
      }
      break;
    case "boolean":
      ie(n, e ? 120 : 121);
      break;
    default:
      ie(n, 127);
  }
};
class la extends nr {
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
const ha = (n) => {
  n.count > 0 && (uo(n.encoder, n.count === 1 ? n.s : -n.s), n.count > 1 && D(n.encoder, n.count - 2));
};
class mr {
  constructor() {
    this.encoder = new nr(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (ha(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return ha(this), lt(this.encoder);
  }
}
const ua = (n) => {
  if (n.count > 0) {
    const e = n.diff * 2 + (n.count === 1 ? 0 : 1);
    uo(n.encoder, e), n.count > 1 && D(n.encoder, n.count - 2);
  }
};
class fi {
  constructor() {
    this.encoder = new nr(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (ua(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return ua(this), lt(this.encoder);
  }
}
class cu {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new mr();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new nr();
    return this.sarr.push(this.s), this.s = "", Mn(e, this.sarr.join("")), Hr(e, this.lensE.toUint8Array()), lt(e);
  }
}
const ft = (n) => new Error(n), Xe = () => {
  throw ft("Method unimplemented");
}, je = () => {
  throw ft("Unexpected case");
}, nc = ft("Unexpected end of array"), sc = ft("Integer out of Range");
class Jr {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const gs = (n) => new Jr(n), lu = (n) => n.pos !== n.arr.length, hu = (n, e) => {
  const t = new Uint8Array(n.arr.buffer, n.pos + n.arr.byteOffset, e);
  return n.pos += e, t;
}, De = (n) => hu(n, O(n)), hs = (n) => n.arr[n.pos++], O = (n) => {
  let e = 0, t = 1;
  const s = n.arr.length;
  for (; n.pos < s; ) {
    const r = n.arr[n.pos++];
    if (e = e + (r & pn) * t, t *= 128, r < Ne)
      return e;
    if (e > Cr)
      throw sc;
  }
  throw nc;
}, go = (n) => {
  let e = n.arr[n.pos++], t = e & Mi, s = 64;
  const r = (e & Tt) > 0 ? -1 : 1;
  if ((e & Ne) === 0)
    return r * t;
  const i = n.arr.length;
  for (; n.pos < i; ) {
    if (e = n.arr[n.pos++], t = t + (e & pn) * s, s *= 128, e < Ne)
      return r * t;
    if (t > Cr)
      throw sc;
  }
  throw nc;
}, uu = (n) => {
  let e = O(n);
  if (e === 0)
    return "";
  {
    let t = String.fromCodePoint(hs(n));
    if (--e < 100)
      for (; e--; )
        t += String.fromCodePoint(hs(n));
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
}, du = (n) => (
  /** @type any */
  Ls.decode(De(n))
), Vn = Ls ? du : uu, po = (n, e) => {
  const t = new DataView(n.arr.buffer, n.arr.byteOffset + n.pos, e);
  return n.pos += e, t;
}, fu = (n) => po(n, 4).getFloat32(0, !1), gu = (n) => po(n, 8).getFloat64(0, !1), pu = (n) => (
  /** @type {any} */
  po(n, 8).getBigInt64(0, !1)
), mu = [
  (n) => {
  },
  // CASE 127: undefined
  (n) => null,
  // CASE 126: null
  go,
  // CASE 125: integer
  fu,
  // CASE 124: float32
  gu,
  // CASE 123: float64
  pu,
  // CASE 122: bigint
  (n) => !1,
  // CASE 121: boolean (false)
  (n) => !0,
  // CASE 120: boolean (true)
  Vn,
  // CASE 119: string
  (n) => {
    const e = O(n), t = {};
    for (let s = 0; s < e; s++) {
      const r = Vn(n);
      t[r] = Bs(n);
    }
    return t;
  },
  (n) => {
    const e = O(n), t = [];
    for (let s = 0; s < e; s++)
      t.push(Bs(n));
    return t;
  },
  De
  // CASE 116: Uint8Array
], Bs = (n) => mu[127 - hs(n)](n);
class da extends Jr {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, t) {
    super(e), this.reader = t, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), lu(this) ? this.count = O(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class yr extends Jr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = go(this);
      const e = tc(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = O(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class gi extends Jr {
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
      const e = go(this), t = e & 1;
      this.diff = dt(e / 2), this.count = 1, t && (this.count = O(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class yu {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new yr(e), this.str = Vn(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
    return this.spos = e, t;
  }
}
const wu = crypto.getRandomValues.bind(crypto), rc = () => wu(new Uint32Array(1))[0], _u = "10000000-1000-4000-8000" + -1e11, vu = () => _u.replace(
  /[018]/g,
  /** @param {number} c */
  (n) => (n ^ rc() & 15 >> n / 4).toString(16)
), fa = (n) => (
  /** @type {Promise<T>} */
  new Promise(n)
);
Promise.all.bind(Promise);
const ga = (n) => n === void 0 ? null : n;
class ku {
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
let ic = new ku(), bu = !0;
try {
  typeof localStorage < "u" && localStorage && (ic = localStorage, bu = !1);
} catch {
}
const Su = ic, js = Symbol("Equality"), oc = (n, e) => {
  var t;
  return n === e || !!((t = n == null ? void 0 : n[js]) != null && t.call(n, e)) || !1;
}, Iu = (n) => typeof n == "object", xu = Object.assign, Cu = Object.keys, Tu = (n, e) => {
  for (const t in n)
    e(n[t], t);
}, Tr = (n) => Cu(n).length, Eu = (n) => {
  for (const e in n)
    return !1;
  return !0;
}, sr = (n, e) => {
  for (const t in n)
    if (!e(n[t], t))
      return !1;
  return !0;
}, mo = (n, e) => Object.prototype.hasOwnProperty.call(n, e), Ou = (n, e) => n === e || Tr(n) === Tr(e) && sr(n, (t, s) => (t !== void 0 || mo(e, s)) && oc(e[s], t)), Au = Object.freeze, ac = (n) => {
  for (const e in n) {
    const t = n[e];
    (typeof t == "object" || typeof t == "function") && ac(n[e]);
  }
  return Au(n);
}, yo = (n, e, t = 0) => {
  try {
    for (; t < n.length; t++)
      n[t](...e);
  } finally {
    t < n.length && yo(n, e, t + 1);
  }
}, Du = (n) => n, wr = (n, e) => {
  if (n === e)
    return !0;
  if (n == null || e == null || n.constructor !== e.constructor && (n.constructor || Object) !== (e.constructor || Object))
    return !1;
  if (n[js] != null)
    return n[js](e);
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
        if (!e.has(t) || !wr(n.get(t), e.get(t)))
          return !1;
      break;
    }
    case void 0:
    case Object:
      if (Tr(n) !== Tr(e))
        return !1;
      for (const t in n)
        if (!mo(n, t) || !wr(n[t], e[t]))
          return !1;
      break;
    case Array:
      if (n.length !== e.length)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (!wr(n[t], e[t]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, Lu = (n, e) => e.includes(n), Ps = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let et;
const Ru = () => {
  if (et === void 0)
    if (Ps) {
      et = Ye();
      const n = process.argv;
      let e = null;
      for (let t = 0; t < n.length; t++) {
        const s = n[t];
        s[0] === "-" ? (e !== null && et.set(e, ""), e = s) : e !== null && (et.set(e, s), e = null);
      }
      e !== null && et.set(e, "");
    } else typeof location == "object" ? (et = Ye(), (location.search || "?").slice(1).split("&").forEach((n) => {
      if (n.length !== 0) {
        const [e, t] = n.split("=");
        et.set(`--${aa(e, "-")}`, t), et.set(`-${aa(e, "-")}`, t);
      }
    })) : et = Ye();
  return et;
}, Ui = (n) => Ru().has(n), Er = (n) => ga(Ps ? process.env[n.toUpperCase().replaceAll("-", "_")] : Su.getItem(n)), cc = (n) => Ui("--" + n) || Er(n) !== null, Nu = cc("production"), Mu = Ps && Lu(process.env.FORCE_COLOR, ["true", "1", "2"]), Vu = Mu || !Ui("--no-colors") && // @todo deprecate --no-colors
!cc("no-color") && (!Ps || process.stdout.isTTY) && (!Ps || Ui("--color") || Er("COLORTERM") !== null || (Er("TERM") || "").includes("color")), $u = (n) => new Uint8Array(n), Uu = (n) => {
  const e = $u(n.byteLength);
  return e.set(n), e;
};
class Bu {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, t) {
    this.left = e, this.right = t;
  }
}
const yt = (n, e) => new Bu(n, e), pa = (n) => n.next() >= 0.5, pi = (n, e, t) => dt(n.next() * (t + 1 - e) + e), lc = (n, e, t) => dt(n.next() * (t + 1 - e) + e), wo = (n, e, t) => lc(n, e, t), ju = (n) => Zh(wo(n, 97, 122)), Pu = (n, e = 0, t = 20) => {
  const s = wo(n, e, t);
  let r = "";
  for (let i = 0; i < s; i++)
    r += ju(n);
  return r;
}, mi = (n, e) => e[wo(n, 0, e.length - 1)], Ku = Symbol("0schema");
class Fu {
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
      e.push(Xh(" ", (this._rerrs.length - t) * 2) + `${s.path != null ? `[${s.path}] ` : ""}${s.has} doesn't match ${s.expected}. ${s.message}`);
    }
    return e.join(`
`);
  }
}
const Bi = (n, e) => n === e ? !0 : n == null || e == null || n.constructor !== e.constructor ? !1 : n[js] ? oc(n, e) : Fr(n) ? ho(
  n,
  (t) => Qa(e, (s) => Bi(t, s))
) : Iu(n) ? sr(
  n,
  (t, s) => Bi(t, e[s])
) : !1;
class ye {
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
      this.constructor._dilutes && ([s, t] = [t, s]), Bi(t, s)
    );
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(e) {
    return this.constructor === e.constructor && wr(this.shape, e.shape);
  }
  [Ku]() {
    return !0;
  }
  /**
   * @param {object} other
   */
  [js](e) {
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
    Xe();
  }
  /* c8 ignore stop */
  /**
   * @type {Schema<T?>}
   */
  get nullable() {
    return ps(this, Xr);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new dc(
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
    return ma(e, this), /** @type {any} */
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
    return ma(e, this), e;
  }
}
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
Lt(ye, "_dilutes", !1);
class _o extends ye {
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
const X = (n, e = null) => new _o(n, e);
X(_o);
class vo extends ye {
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
const ae = (n) => new vo(n);
X(vo);
class Wr extends ye {
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
const qr = (...n) => new Wr(n), hc = X(Wr), Zu = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((n) => n.replace(/[().|&,$^[\]]/g, (e) => "\\" + e))
), uc = (n) => {
  if (us.check(n))
    return [Zu(n)];
  if (hc.check(n))
    return (
      /** @type {Array<string|number>} */
      n.shape.map((e) => e + "")
    );
  if (kc.check(n))
    return ["[+-]?\\d+.?\\d*"];
  if (bc.check(n))
    return [".*"];
  if (Ar.check(n))
    return n.shape.map(uc).flat(1);
  je();
};
class zu extends ye {
  /**
   * @param {T} shape
   */
  constructor(e) {
    super(), this.shape = e, this._r = new RegExp("^" + e.map(uc).map((t) => `(${t.join("|")})`).join("") + "$");
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
X(zu);
const Hu = Symbol("optional");
class dc extends ye {
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
  get [Hu]() {
    return !0;
  }
}
const Ju = X(dc);
class Wu extends ye {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(e, t) {
    return t == null || t.extend(null, "never", typeof e), !1;
  }
}
X(Wu);
const jr = class jr extends ye {
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
    return new jr(this.shape, !0);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(e, t) {
    return e == null ? (t == null || t.extend(null, "object", "null"), !1) : sr(this.shape, (s, r) => {
      const i = this._isPartial && !mo(e, r) || s.check(e[r], t);
      return !i && (t == null || t.extend(r.toString(), s.toString(), typeof e[r], "Object property does not match")), i;
    });
  }
};
Lt(jr, "_dilutes", !0);
let Or = jr;
const qu = (n) => (
  /** @type {any} */
  new Or(n)
), Gu = X(Or), Yu = ae((n) => n != null && (n.constructor === Object || n.constructor == null));
class fc extends ye {
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
    return e != null && sr(e, (s, r) => {
      const i = this.shape.keys.check(r, t);
      return !i && (t == null || t.extend(r + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value")), i && this.shape.values.check(s, t);
    });
  }
}
const gc = (n, e) => new fc(n, e), Xu = X(fc);
class pc extends ye {
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
    return e != null && sr(this.shape, (s, r) => {
      const i = (
        /** @type {Schema<any>} */
        s.check(e[r], t)
      );
      return !i && (t == null || t.extend(r.toString(), "Tuple", typeof s)), i;
    });
  }
}
const Qu = (...n) => new pc(n);
X(pc);
class mc extends ye {
  /**
   * @param {Array<S>} v
   */
  constructor(e) {
    super(), this.shape = e.length === 1 ? e[0] : new Gr(e);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(e, t) {
    const s = Fr(e) && ho(e, (r) => this.shape.check(r));
    return !s && (t == null || t.extend(null, "Array", "")), s;
  }
}
const yc = (...n) => new mc(n), ed = X(mc), td = ae((n) => Fr(n));
class wc extends ye {
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
const nd = (n, e = null) => new wc(n, e);
X(wc);
const sd = nd(ye);
class rd extends ye {
  /**
   * @param {Args} args
   */
  constructor(e) {
    super(), this.len = e.length - 1, this.args = Qu(...e.slice(-1)), this.res = e[this.len];
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
const id = X(rd), od = ae((n) => typeof n == "function");
class ad extends ye {
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
    const s = ho(this.shape, (r) => r.check(e, t));
    return !s && (t == null || t.extend(null, "Intersectinon", typeof e)), s;
  }
}
X(ad, (n) => n.shape.length > 0);
class Gr extends ye {
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
    const s = Qa(this.shape, (r) => r.check(e, t));
    return t == null || t.extend(null, "Union", typeof e), s;
  }
}
Lt(Gr, "_dilutes", !0);
const ps = (...n) => n.findIndex((e) => Ar.check(e)) >= 0 ? ps(...n.map((e) => Ks(e)).map((e) => Ar.check(e) ? e.shape : [e]).flat(1)) : n.length === 1 ? n[0] : new Gr(n), Ar = (
  /** @type {Schema<$Union<any>>} */
  X(Gr)
), _c = () => !0, Dr = ae(_c), cd = (
  /** @type {Schema<Schema<any>>} */
  X(vo, (n) => n.shape === _c)
), ko = ae((n) => typeof n == "bigint"), ld = (
  /** @type {Schema<Schema<BigInt>>} */
  ae((n) => n === ko)
), vc = ae((n) => typeof n == "symbol");
ae((n) => n === vc);
const $n = ae((n) => typeof n == "number"), kc = (
  /** @type {Schema<Schema<number>>} */
  ae((n) => n === $n)
), us = ae((n) => typeof n == "string"), bc = (
  /** @type {Schema<Schema<string>>} */
  ae((n) => n === us)
), Yr = ae((n) => typeof n == "boolean"), hd = (
  /** @type {Schema<Schema<Boolean>>} */
  ae((n) => n === Yr)
), Sc = qr(void 0);
X(Wr, (n) => n.shape.length === 1 && n.shape[0] === void 0);
qr(void 0);
const Xr = qr(null), ud = (
  /** @type {Schema<Schema<null>>} */
  X(Wr, (n) => n.shape.length === 1 && n.shape[0] === null)
);
X(Uint8Array);
X(_o, (n) => n.shape === Uint8Array);
const dd = ps($n, us, Xr, Sc, ko, Yr, vc);
(() => {
  const n = (
    /** @type {$Array<$any>} */
    yc(Dr)
  ), e = (
    /** @type {$Record<$string,$any>} */
    gc(us, Dr)
  ), t = ps($n, us, Xr, Yr, n, e);
  return n.shape = t, e.shape.values = t, t;
})();
const Ks = (n) => {
  if (sd.check(n))
    return (
      /** @type {any} */
      n
    );
  if (Yu.check(n)) {
    const e = {};
    for (const t in n)
      e[t] = Ks(n[t]);
    return (
      /** @type {any} */
      qu(e)
    );
  } else {
    if (td.check(n))
      return (
        /** @type {any} */
        ps(...n.map(Ks))
      );
    if (dd.check(n))
      return (
        /** @type {any} */
        qr(n)
      );
    if (od.check(n))
      return (
        /** @type {any} */
        X(
          /** @type {any} */
          n
        )
      );
  }
  je();
}, ma = Nu ? () => {
} : (n, e) => {
  const t = new Fu();
  if (!e.check(n, t))
    throw ft(`Expected value to be of type ${e.constructor.name}.
${t.toString()}`);
};
class fd {
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
    return this.patterns.push({ if: Ks(e), h: t }), this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(e) {
    return this.if(Dr, e);
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
        throw ft("Unhandled pattern");
      }
    );
  }
}
const gd = (n) => new fd(
  /** @type {any} */
  n
), Ic = (
  /** @type {any} */
  gd(
    /** @type {Schema<prng.PRNG>} */
    Dr
  ).if(kc, (n, e) => pi(e, oa, Cr)).if(bc, (n, e) => Pu(e)).if(hd, (n, e) => pa(e)).if(ld, (n, e) => BigInt(pi(e, oa, Cr))).if(Ar, (n, e) => xn(e, mi(e, n.shape))).if(Gu, (n, e) => {
    const t = {};
    for (const s in n.shape) {
      let r = n.shape[s];
      if (Ju.check(r)) {
        if (pa(e))
          continue;
        r = r.shape;
      }
      t[s] = Ic(r, e);
    }
    return t;
  }).if(ed, (n, e) => {
    const t = [], s = lc(e, 0, 42);
    for (let r = 0; r < s; r++)
      t.push(xn(e, n.shape));
    return t;
  }).if(hc, (n, e) => mi(e, n.shape)).if(ud, (n, e) => null).if(id, (n, e) => {
    const t = xn(e, n.res);
    return () => t;
  }).if(cd, (n, e) => xn(e, mi(e, [
    $n,
    us,
    Xr,
    Sc,
    ko,
    Yr,
    yc($n),
    gc(ps("a", "b", "c"), $n)
  ]))).if(Xu, (n, e) => {
    const t = {}, s = pi(e, 0, 3);
    for (let r = 0; r < s; r++) {
      const i = xn(e, n.shape.keys), o = xn(e, n.shape.values);
      t[i] = o;
    }
    return t;
  }).done()
), xn = (n, e) => (
  /** @type {any} */
  Ic(Ks(e), n)
), Qr = (
  /** @type {Document} */
  typeof document < "u" ? document : {}
);
ae((n) => n.nodeType === _d);
typeof DOMParser < "u" && new DOMParser();
ae((n) => n.nodeType === md);
ae((n) => n.nodeType === yd);
const pd = (n) => $h(n, (e, t) => `${t}:${e};`).join(""), md = Qr.ELEMENT_NODE, yd = Qr.TEXT_NODE, wd = Qr.DOCUMENT_NODE, _d = Qr.DOCUMENT_FRAGMENT_NODE;
ae((n) => n.nodeType === wd);
const Ot = Symbol, xc = Ot(), Cc = Ot(), vd = Ot(), kd = Ot(), bd = Ot(), Tc = Ot(), Sd = Ot(), bo = Ot(), Id = Ot(), xd = (n) => {
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
}, Cd = {
  [xc]: yt("font-weight", "bold"),
  [Cc]: yt("font-weight", "normal"),
  [vd]: yt("color", "blue"),
  [bd]: yt("color", "green"),
  [kd]: yt("color", "grey"),
  [Tc]: yt("color", "red"),
  [Sd]: yt("color", "purple"),
  [bo]: yt("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [Id]: yt("color", "black")
}, Td = (n) => {
  var o;
  n.length === 1 && ((o = n[0]) == null ? void 0 : o.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [], s = Ye();
  let r = [], i = 0;
  for (; i < n.length; i++) {
    const a = n[i], c = Cd[a];
    if (c !== void 0)
      s.set(c.left, c.right);
    else {
      if (a === void 0)
        break;
      if (a.constructor === String || a.constructor === Number) {
        const h = pd(s);
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
}, Ec = Vu ? Td : xd, Ed = (...n) => {
  console.log(...Ec(n)), Oc.forEach((e) => e.print(n));
}, Od = (...n) => {
  console.warn(...Ec(n)), n.unshift(bo), Oc.forEach((e) => e.print(n));
}, Oc = ls(), Ac = (n) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: n
}), Ad = (n, e) => Ac(() => {
  let t;
  do
    t = n.next();
  while (!t.done && !e(t.value));
  return t;
}), yi = (n, e) => Ac(() => {
  const { done: t, value: s } = n.next();
  return { done: t, value: t ? void 0 : e(s) };
});
class So {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, t) {
    this.clock = e, this.len = t;
  }
}
class rr {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const Dc = (n, e, t) => e.clients.forEach((s, r) => {
  const i = (
    /** @type {Array<GC|Item>} */
    n.doc.store.clients.get(r)
  );
  if (i != null) {
    const o = i[i.length - 1], a = o.id.clock + o.length;
    for (let c = 0, h = s[c]; c < s.length && h.clock < a; h = s[++c])
      Zc(n, i, h.clock, h.len, t);
  }
}), Dd = (n, e) => {
  let t = 0, s = n.length - 1;
  for (; t <= s; ) {
    const r = dt((t + s) / 2), i = n[r], o = i.clock;
    if (o <= e) {
      if (e < o + i.len)
        return r;
      t = r + 1;
    } else
      s = r - 1;
  }
  return null;
}, Lc = (n, e) => {
  const t = n.clients.get(e.client);
  return t !== void 0 && Dd(t, e.clock) !== null;
}, Io = (n) => {
  n.clients.forEach((e) => {
    e.sort((r, i) => r.clock - i.clock);
    let t, s;
    for (t = 1, s = 1; t < e.length; t++) {
      const r = e[s - 1], i = e[t];
      r.clock + r.len >= i.clock ? r.len = vn(r.len, i.clock + i.len - r.clock) : (s < t && (e[s] = i), s++);
    }
    e.length = s;
  });
}, Ld = (n) => {
  const e = new rr();
  for (let t = 0; t < n.length; t++)
    n[t].clients.forEach((s, r) => {
      if (!e.clients.has(r)) {
        const i = s.slice();
        for (let o = t + 1; o < n.length; o++)
          Bh(i, n[o].clients.get(r) || []);
        e.clients.set(r, i);
      }
    });
  return Io(e), e;
}, Lr = (n, e, t, s) => {
  Qt(n.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new So(t, s));
}, Rd = () => new rr(), Nd = (n) => {
  const e = Rd();
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
        r.push(new So(a, c));
      }
    }
    r.length > 0 && e.clients.set(s, r);
  }), e;
}, ms = (n, e) => {
  D(n.restEncoder, e.clients.size), Gt(e.clients.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
    n.resetDsCurVal(), D(n.restEncoder, t);
    const r = s.length;
    D(n.restEncoder, r);
    for (let i = 0; i < r; i++) {
      const o = s[i];
      n.writeDsClock(o.clock), n.writeDsLen(o.len);
    }
  });
}, xo = (n) => {
  const e = new rr(), t = O(n.restDecoder);
  for (let s = 0; s < t; s++) {
    n.resetDsCurVal();
    const r = O(n.restDecoder), i = O(n.restDecoder);
    if (i > 0) {
      const o = Qt(e.clients, r, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let a = 0; a < i; a++)
        o.push(new So(n.readDsClock(), n.readDsLen()));
    }
  }
  return e;
}, ya = (n, e, t) => {
  const s = new rr(), r = O(n.restDecoder);
  for (let i = 0; i < r; i++) {
    n.resetDsCurVal();
    const o = O(n.restDecoder), a = O(n.restDecoder), c = t.clients.get(o) || [], h = oe(t, o);
    for (let u = 0; u < a; u++) {
      const f = n.readDsClock(), g = f + n.readDsLen();
      if (f < h) {
        h < g && Lr(s, o, h, g - h);
        let m = gt(c, f), w = c[m];
        for (!w.deleted && w.id.clock < f && (c.splice(m + 1, 0, Br(e, w, f - w.id.clock)), m++); m < c.length && (w = c[m++], w.id.clock < g); )
          w.deleted || (g < w.id.clock + w.length && c.splice(m, 0, Br(e, w, g - w.id.clock)), w.delete(e));
      } else
        Lr(s, o, f, g - f);
    }
  }
  if (s.clients.size > 0) {
    const i = new yn();
    return D(i.restEncoder, 0), ms(i, s), i.toUint8Array();
  }
  return null;
}, Rc = rc;
class Jt extends Ph {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = vu(), collectionid: t = null, gc: s = !0, gcFilter: r = () => !0, meta: i = null, autoLoad: o = !1, shouldLoad: a = !0 } = {}) {
    super(), this.gc = s, this.gcFilter = r, this.clientID = Rc(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new Kc(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = a, this.autoLoad = o, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = fa((h) => {
      this.on("load", () => {
        this.isLoaded = !0, h(this);
      });
    });
    const c = () => fa((h) => {
      const u = (f) => {
        (f === void 0 || f === !0) && (this.off("sync", u), h());
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
    e !== null && !this.shouldLoad && K(
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
    return new Set(Gt(this.subdocs).map((e) => e.guid));
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
    return K(this, e, t);
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
    fe
  )) {
    const s = Qt(this.share, e, () => {
      const i = new t();
      return i._integrate(this, null), i;
    }), r = s.constructor;
    if (t !== fe && r !== t)
      if (r === fe) {
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
      this.get(e, Bn)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(e = "") {
    return this.get(e, F);
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
      this.get(e, R)
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
      this.get(e, fs)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, wn);
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
    this.isDestroyed = !0, Gt(this.subdocs).forEach((t) => t.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const t = (
        /** @type {ContentDoc} */
        e.content
      );
      t.doc = new Jt({ guid: this.guid, ...t.opts, shouldLoad: !1 }), t.doc._item = e, K(
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
class Nc {
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
    return O(this.restDecoder);
  }
  /**
   * @return {number}
   */
  readDsLen() {
    return O(this.restDecoder);
  }
}
class Mc extends Nc {
  /**
   * @return {ID}
   */
  readLeftID() {
    return N(O(this.restDecoder), O(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return N(O(this.restDecoder), O(this.restDecoder));
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return O(this.restDecoder);
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return hs(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return Vn(this.restDecoder);
  }
  /**
   * @return {boolean} isKey
   */
  readParentInfo() {
    return O(this.restDecoder) === 1;
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readTypeRef() {
    return O(this.restDecoder);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number} len
   */
  readLen() {
    return O(this.restDecoder);
  }
  /**
   * @return {any}
   */
  readAny() {
    return Bs(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return Uu(De(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(Vn(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return Vn(this.restDecoder);
  }
}
class Md {
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
    return this.dsCurrVal += O(this.restDecoder), this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const e = O(this.restDecoder) + 1;
    return this.dsCurrVal += e, e;
  }
}
class ds extends Md {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], O(e), this.keyClockDecoder = new gi(De(e)), this.clientDecoder = new yr(De(e)), this.leftClockDecoder = new gi(De(e)), this.rightClockDecoder = new gi(De(e)), this.infoDecoder = new da(De(e), hs), this.stringDecoder = new yu(De(e)), this.parentInfoDecoder = new da(De(e), hs), this.typeRefDecoder = new yr(De(e)), this.lenDecoder = new yr(De(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new Un(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new Un(this.clientDecoder.read(), this.rightClockDecoder.read());
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
    return Bs(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return De(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return Bs(this.restDecoder);
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
class Vc {
  constructor() {
    this.restEncoder = zr();
  }
  toUint8Array() {
    return lt(this.restEncoder);
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
class ir extends Vc {
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
    Vi(this.restEncoder, e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    Mn(this.restEncoder, e);
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
    Us(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Ae(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    Mn(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    Mn(this.restEncoder, e);
  }
}
class $c {
  constructor() {
    this.restEncoder = zr(), this.dsCurrVal = 0;
  }
  toUint8Array() {
    return lt(this.restEncoder);
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
    e === 0 && je(), D(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class yn extends $c {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new fi(), this.clientEncoder = new mr(), this.leftClockEncoder = new fi(), this.rightClockEncoder = new fi(), this.infoEncoder = new la(Vi), this.stringEncoder = new cu(), this.parentInfoEncoder = new la(Vi), this.typeRefEncoder = new mr(), this.lenEncoder = new mr();
  }
  toUint8Array() {
    const e = zr();
    return D(e, 0), Ae(e, this.keyClockEncoder.toUint8Array()), Ae(e, this.clientEncoder.toUint8Array()), Ae(e, this.leftClockEncoder.toUint8Array()), Ae(e, this.rightClockEncoder.toUint8Array()), Ae(e, lt(this.infoEncoder)), Ae(e, this.stringEncoder.toUint8Array()), Ae(e, lt(this.parentInfoEncoder)), Ae(e, this.typeRefEncoder.toUint8Array()), Ae(e, this.lenEncoder.toUint8Array()), Hr(e, lt(this.restEncoder)), lt(e);
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
    Us(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Ae(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    Us(this.restEncoder, e);
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
const Vd = (n, e, t, s) => {
  s = vn(s, e[0].id.clock);
  const r = gt(e, s);
  D(n.restEncoder, e.length - r), n.writeClient(t), D(n.restEncoder, s);
  const i = e[r];
  i.write(n, s - i.id.clock);
  for (let o = r + 1; o < e.length; o++)
    e[o].write(n, 0);
}, Co = (n, e, t) => {
  const s = /* @__PURE__ */ new Map();
  t.forEach((r, i) => {
    oe(e, i) > r && s.set(i, r);
  }), ei(e).forEach((r, i) => {
    t.has(i) || s.set(i, 0);
  }), D(n.restEncoder, s.size), Gt(s.entries()).sort((r, i) => i[0] - r[0]).forEach(([r, i]) => {
    Vd(
      n,
      /** @type {Array<GC|Item>} */
      e.clients.get(r),
      r,
      i
    );
  });
}, $d = (n, e) => {
  const t = Ye(), s = O(n.restDecoder);
  for (let r = 0; r < s; r++) {
    const i = O(n.restDecoder), o = new Array(i), a = n.readClient();
    let c = O(n.restDecoder);
    t.set(a, { i: 0, refs: o });
    for (let h = 0; h < i; h++) {
      const u = n.readInfo();
      switch (Zr & u) {
        case 0: {
          const f = n.readLen();
          o[h] = new Ue(N(a, c), f), c += f;
          break;
        }
        case 10: {
          const f = O(n.restDecoder);
          o[h] = new Be(N(a, c), f), c += f;
          break;
        }
        default: {
          const f = (u & (Tt | Ne)) === 0, g = new ne(
            N(a, c),
            null,
            // left
            (u & Ne) === Ne ? n.readLeftID() : null,
            // origin
            null,
            // right
            (u & Tt) === Tt ? n.readRightID() : null,
            // right origin
            f ? n.readParentInfo() ? e.get(n.readString()) : n.readLeftID() : null,
            // parent
            f && (u & Vs) === Vs ? n.readString() : null,
            // parentSub
            ll(n, u)
            // item content
          );
          o[h] = g, c += g.length;
        }
      }
    }
  }
  return t;
}, Ud = (n, e, t) => {
  const s = [];
  let r = Gt(t.keys()).sort((m, w) => m - w);
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
  const a = new Kc(), c = /* @__PURE__ */ new Map(), h = (m, w) => {
    const I = c.get(m);
    (I == null || I > w) && c.set(m, w);
  };
  let u = (
    /** @type {any} */
    o.refs[
      /** @type {any} */
      o.i++
    ]
  );
  const f = /* @__PURE__ */ new Map(), g = () => {
    for (const m of s) {
      const w = m.id.client, I = t.get(w);
      I ? (I.i--, a.clients.set(w, I.refs.slice(I.i)), t.delete(w), I.i = 0, I.refs = []) : a.clients.set(w, [m]), r = r.filter((W) => W !== w);
    }
    s.length = 0;
  };
  for (; ; ) {
    if (u.constructor !== Be) {
      const w = Qt(f, u.id.client, () => oe(e, u.id.client)) - u.id.clock;
      if (w < 0)
        s.push(u), h(u.id.client, u.id.clock - 1), g();
      else {
        const I = u.getMissing(n, e);
        if (I !== null) {
          s.push(u);
          const W = t.get(
            /** @type {number} */
            I
          ) || { refs: [], i: 0 };
          if (W.refs.length === W.i)
            h(
              /** @type {number} */
              I,
              oe(e, I)
            ), g();
          else {
            u = W.refs[W.i++];
            continue;
          }
        } else (w === 0 || w < u.length) && (u.integrate(n, w), f.set(u.id.client, u.id.clock + u.length));
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
    const m = new yn();
    return Co(m, a, /* @__PURE__ */ new Map()), D(m.restEncoder, 0), { missing: c, update: m.toUint8Array() };
  }
  return null;
}, Bd = (n, e) => Co(n, e.doc.store, e.beforeState), jd = (n, e, t, s = new ds(n)) => K(e, (r) => {
  r.local = !1;
  let i = !1;
  const o = r.doc, a = o.store, c = $d(s, o), h = Ud(r, a, c), u = a.pendingStructs;
  if (u) {
    for (const [g, m] of u.missing)
      if (m < oe(a, g)) {
        i = !0;
        break;
      }
    if (h) {
      for (const [g, m] of h.missing) {
        const w = u.missing.get(g);
        (w == null || w > m) && u.missing.set(g, m);
      }
      u.update = Rr([u.update, h.update]);
    }
  } else
    a.pendingStructs = h;
  const f = ya(s, r, a);
  if (a.pendingDs) {
    const g = new ds(gs(a.pendingDs));
    O(g.restDecoder);
    const m = ya(g, r, a);
    f && m ? a.pendingDs = Rr([f, m]) : a.pendingDs = f || m;
  } else
    a.pendingDs = f;
  if (i) {
    const g = (
      /** @type {{update: Uint8Array}} */
      a.pendingStructs.update
    );
    a.pendingStructs = null, Uc(r.doc, g);
  }
}, t, !1), Uc = (n, e, t, s = ds) => {
  const r = gs(e);
  jd(r, n, t, new s(r));
}, wa = (n, e, t) => Uc(n, e, t, Mc), Pd = (n, e, t = /* @__PURE__ */ new Map()) => {
  Co(n, e.store, t), ms(n, Nd(e.store));
}, Kd = (n, e = new Uint8Array([0]), t = new yn()) => {
  const s = Bc(e);
  Pd(t, n, s);
  const r = [t.toUint8Array()];
  if (n.store.pendingDs && r.push(n.store.pendingDs), n.store.pendingStructs && r.push(sf(n.store.pendingStructs.update, e)), r.length > 1) {
    if (t.constructor === ir)
      return tf(r.map((i, o) => o === 0 ? i : of(i)));
    if (t.constructor === yn)
      return Rr(r);
  }
  return r[0];
}, wi = (n, e) => Kd(n, e, new ir()), Fd = (n) => {
  const e = /* @__PURE__ */ new Map(), t = O(n.restDecoder);
  for (let s = 0; s < t; s++) {
    const r = O(n.restDecoder), i = O(n.restDecoder);
    e.set(r, i);
  }
  return e;
}, Bc = (n) => Fd(new Nc(gs(n))), jc = (n, e) => (D(n.restEncoder, e.size), Gt(e.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
  D(n.restEncoder, t), D(n.restEncoder, s);
}), n), Zd = (n, e) => jc(n, ei(e.store)), zd = (n, e = new $c()) => (n instanceof Map ? jc(e, n) : Zd(e, n), e.toUint8Array()), Hd = (n) => zd(n, new Vc());
class Jd {
  constructor() {
    this.l = [];
  }
}
const _a = () => new Jd(), va = (n, e) => n.l.push(e), ka = (n, e) => {
  const t = n.l, s = t.length;
  n.l = t.filter((r) => e !== r), s === n.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, Pc = (n, e, t) => yo(n.l, [e, t]);
class Un {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, t) {
    this.client = e, this.clock = t;
  }
}
const ur = (n, e) => n === e || n !== null && e !== null && n.client === e.client && n.clock === e.clock, N = (n, e) => new Un(n, e), Wd = (n) => {
  for (const [e, t] of n.doc.share.entries())
    if (t === n)
      return e;
  throw je();
}, On = (n, e) => e === void 0 ? !n.deleted : e.sv.has(n.id.client) && (e.sv.get(n.id.client) || 0) > n.id.clock && !Lc(e.ds, n.id), ji = (n, e) => {
  const t = Qt(n.meta, ji, ls), s = n.doc.store;
  t.has(e) || (e.sv.forEach((r, i) => {
    r < oe(s, i) && Yt(n, N(i, r));
  }), Dc(n, e.ds, (r) => {
  }), t.add(e));
};
class Kc {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const ei = (n) => {
  const e = /* @__PURE__ */ new Map();
  return n.clients.forEach((t, s) => {
    const r = t[t.length - 1];
    e.set(s, r.id.clock + r.length);
  }), e;
}, oe = (n, e) => {
  const t = n.clients.get(e);
  if (t === void 0)
    return 0;
  const s = t[t.length - 1];
  return s.id.clock + s.length;
}, Fc = (n, e) => {
  let t = n.clients.get(e.id.client);
  if (t === void 0)
    t = [], n.clients.set(e.id.client, t);
  else {
    const s = t[t.length - 1];
    if (s.id.clock + s.length !== e.id.clock)
      throw je();
  }
  t.push(e);
}, gt = (n, e) => {
  let t = 0, s = n.length - 1, r = n[s], i = r.id.clock;
  if (i === e)
    return s;
  let o = dt(e / (i + r.length - 1) * s);
  for (; t <= s; ) {
    if (r = n[o], i = r.id.clock, i <= e) {
      if (e < i + r.length)
        return o;
      t = o + 1;
    } else
      s = o - 1;
    o = dt((t + s) / 2);
  }
  throw je();
}, qd = (n, e) => {
  const t = n.clients.get(e.client);
  return t[gt(t, e.clock)];
}, _i = (
  /** @type {function(StructStore,ID):Item} */
  qd
), Pi = (n, e, t) => {
  const s = gt(e, t), r = e[s];
  return r.id.clock < t && r instanceof ne ? (e.splice(s + 1, 0, Br(n, r, t - r.id.clock)), s + 1) : s;
}, Yt = (n, e) => {
  const t = (
    /** @type {Array<Item>} */
    n.doc.store.clients.get(e.client)
  );
  return t[Pi(n, t, e.clock)];
}, ba = (n, e, t) => {
  const s = e.clients.get(t.client), r = gt(s, t.clock), i = s[r];
  return t.clock !== i.id.clock + i.length - 1 && i.constructor !== Ue && s.splice(r + 1, 0, Br(n, i, t.clock - i.id.clock + 1)), i;
}, Gd = (n, e, t) => {
  const s = (
    /** @type {Array<GC|Item>} */
    n.clients.get(e.id.client)
  );
  s[gt(s, e.id.clock)] = t;
}, Zc = (n, e, t, s, r) => {
  if (s === 0)
    return;
  const i = t + s;
  let o = Pi(n, e, t), a;
  do
    a = e[o++], i < a.id.clock + a.length && Pi(n, e, i), r(a);
  while (o < e.length && e[o].id.clock < i);
};
class Yd {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, t, s) {
    this.doc = e, this.deleteSet = new rr(), this.beforeState = ei(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = s, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const Sa = (n, e) => e.deleteSet.clients.size === 0 && !Uh(e.afterState, (t, s) => e.beforeState.get(s) !== t) ? !1 : (Io(e.deleteSet), Bd(n, e), ms(n, e.deleteSet), !0), Ia = (n, e, t) => {
  const s = e._item;
  (s === null || s.id.clock < (n.beforeState.get(s.id.client) || 0) && !s.deleted) && Qt(n.changed, e, ls).add(t);
}, _r = (n, e) => {
  let t = n[e], s = n[e - 1], r = e;
  for (; r > 0; t = s, s = n[--r - 1]) {
    if (s.deleted === t.deleted && s.constructor === t.constructor && s.mergeWith(t)) {
      t instanceof ne && t.parentSub !== null && /** @type {AbstractType<any>} */
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
}, Xd = (n, e, t) => {
  for (const [s, r] of n.clients.entries()) {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let o = r.length - 1; o >= 0; o--) {
      const a = r[o], c = a.clock + a.len;
      for (let h = gt(i, a.clock), u = i[h]; h < i.length && u.id.clock < c; u = i[++h]) {
        const f = i[h];
        if (a.clock + a.len <= f.id.clock)
          break;
        f instanceof ne && f.deleted && !f.keep && t(f) && f.gc(e, !1);
      }
    }
  }
}, Qd = (n, e) => {
  n.clients.forEach((t, s) => {
    const r = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let i = t.length - 1; i >= 0; i--) {
      const o = t[i], a = ec(r.length - 1, 1 + gt(r, o.clock + o.len - 1));
      for (let c = a, h = r[c]; c > 0 && h.id.clock >= o.clock; h = r[c])
        c -= 1 + _r(r, c);
    }
  });
}, zc = (n, e) => {
  if (e < n.length) {
    const t = n[e], s = t.doc, r = s.store, i = t.deleteSet, o = t._mergeStructs;
    try {
      Io(i), t.afterState = ei(t.doc.store), s.emit("beforeObserverCalls", [t, s]);
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
          }), c.sort((u, f) => u.path.length - f.path.length), a.push(() => {
            Pc(h._dEH, c, t);
          }));
        }), a.push(() => s.emit("afterTransaction", [t, s])), a.push(() => {
          t._needFormattingCleanup && vf(t);
        });
      }), yo(a, []);
    } finally {
      s.gc && Xd(i, r, s.gcFilter), Qd(i, r), t.afterState.forEach((u, f) => {
        const g = t.beforeState.get(f) || 0;
        if (g !== u) {
          const m = (
            /** @type {Array<GC|Item>} */
            r.clients.get(f)
          ), w = vn(gt(m, g), 1);
          for (let I = m.length - 1; I >= w; )
            I -= 1 + _r(m, I);
        }
      });
      for (let u = o.length - 1; u >= 0; u--) {
        const { client: f, clock: g } = o[u].id, m = (
          /** @type {Array<GC|Item>} */
          r.clients.get(f)
        ), w = gt(m, g);
        w + 1 < m.length && _r(m, w + 1) > 1 || w > 0 && _r(m, w);
      }
      if (!t.local && t.afterState.get(s.clientID) !== t.beforeState.get(s.clientID) && (Ed(bo, xc, "[yjs] ", Cc, Tc, "Changed the client-id because another client seems to be using it."), s.clientID = Rc()), s.emit("afterTransactionCleanup", [t, s]), s._observers.has("update")) {
        const u = new ir();
        Sa(u, t) && s.emit("update", [u.toUint8Array(), t.origin, s, t]);
      }
      if (s._observers.has("updateV2")) {
        const u = new yn();
        Sa(u, t) && s.emit("updateV2", [u.toUint8Array(), t.origin, s, t]);
      }
      const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: h } = t;
      (a.size > 0 || h.size > 0 || c.size > 0) && (a.forEach((u) => {
        u.clientID = s.clientID, u.collectionid == null && (u.collectionid = s.collectionid), s.subdocs.add(u);
      }), h.forEach((u) => s.subdocs.delete(u)), s.emit("subdocs", [{ loaded: c, added: a, removed: h }, s, t]), h.forEach((u) => u.destroy())), n.length <= e + 1 ? (s._transactionCleanups = [], s.emit("afterAllTransactions", [s, n])) : zc(n, e + 1);
    }
  }
}, K = (n, e, t = null, s = !0) => {
  const r = n._transactionCleanups;
  let i = !1, o = null;
  n._transaction === null && (i = !0, n._transaction = new Yd(n, t, s), r.push(n._transaction), r.length === 1 && n.emit("beforeAllTransactions", [n]), n.emit("beforeTransaction", [n._transaction, n]));
  try {
    o = e(n._transaction);
  } finally {
    if (i) {
      const a = n._transaction === r[0];
      n._transaction = null, a && zc(r, 0);
    }
  }
  return o;
};
function* ef(n) {
  const e = O(n.restDecoder);
  for (let t = 0; t < e; t++) {
    const s = O(n.restDecoder), r = n.readClient();
    let i = O(n.restDecoder);
    for (let o = 0; o < s; o++) {
      const a = n.readInfo();
      if (a === 10) {
        const c = O(n.restDecoder);
        yield new Be(N(r, i), c), i += c;
      } else if ((Zr & a) !== 0) {
        const c = (a & (Tt | Ne)) === 0, h = new ne(
          N(r, i),
          null,
          // left
          (a & Ne) === Ne ? n.readLeftID() : null,
          // origin
          null,
          // right
          (a & Tt) === Tt ? n.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          c ? n.readParentInfo() ? n.readString() : n.readLeftID() : null,
          // parent
          c && (a & Vs) === Vs ? n.readString() : null,
          // parentSub
          ll(n, a)
          // item content
        );
        yield h, i += h.length;
      } else {
        const c = n.readLen();
        yield new Ue(N(r, i), c), i += c;
      }
    }
  }
}
class To {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, t) {
    this.gen = ef(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === Be);
    return this.curr;
  }
}
class Eo {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const tf = (n) => Rr(n, Mc, ir), nf = (n, e) => {
  if (n.constructor === Ue) {
    const { client: t, clock: s } = n.id;
    return new Ue(N(t, s + e), n.length - e);
  } else if (n.constructor === Be) {
    const { client: t, clock: s } = n.id;
    return new Be(N(t, s + e), n.length - e);
  } else {
    const t = (
      /** @type {Item} */
      n
    ), { client: s, clock: r } = t.id;
    return new ne(
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
}, Rr = (n, e = ds, t = yn) => {
  if (n.length === 1)
    return n[0];
  const s = n.map((u) => new e(gs(u)));
  let r = s.map((u) => new To(u, !0)), i = null;
  const o = new t(), a = new Eo(o);
  for (; r = r.filter((g) => g.curr !== null), r.sort(
    /** @type {function(any,any):number} */
    (g, m) => {
      if (g.curr.id.client === m.curr.id.client) {
        const w = g.curr.id.clock - m.curr.id.clock;
        return w === 0 ? g.curr.constructor === m.curr.constructor ? 0 : g.curr.constructor === Be ? 1 : -1 : w;
      } else
        return m.curr.id.client - g.curr.id.client;
    }
  ), r.length !== 0; ) {
    const u = r[0], f = (
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
      g.id.client !== f || // check whether there is another decoder that has has updates from `firstClient`
      m && g.id.clock > i.struct.id.clock + i.struct.length)
        continue;
      if (f !== i.struct.id.client)
        $t(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next();
      else if (i.struct.id.clock + i.struct.length < g.id.clock)
        if (i.struct.constructor === Be)
          i.struct.length = g.id.clock + g.length - i.struct.id.clock;
        else {
          $t(a, i.struct, i.offset);
          const w = g.id.clock - i.struct.id.clock - i.struct.length;
          i = { struct: new Be(N(f, i.struct.id.clock + i.struct.length), w), offset: 0 };
        }
      else {
        const w = i.struct.id.clock + i.struct.length - g.id.clock;
        w > 0 && (i.struct.constructor === Be ? i.struct.length -= w : g = nf(g, w)), i.struct.mergeWith(
          /** @type {any} */
          g
        ) || ($t(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next());
      }
    } else
      i = { struct: (
        /** @type {Item | GC} */
        u.curr
      ), offset: 0 }, u.next();
    for (let g = u.curr; g !== null && g.id.client === f && g.id.clock === i.struct.id.clock + i.struct.length && g.constructor !== Be; g = u.next())
      $t(a, i.struct, i.offset), i = { struct: g, offset: 0 };
  }
  i !== null && ($t(a, i.struct, i.offset), i = null), Oo(a);
  const c = s.map((u) => xo(u)), h = Ld(c);
  return ms(o, h), o.toUint8Array();
}, sf = (n, e, t = ds, s = yn) => {
  const r = Bc(e), i = new s(), o = new Eo(i), a = new t(gs(n)), c = new To(a, !1);
  for (; c.curr; ) {
    const u = c.curr, f = u.id.client, g = r.get(f) || 0;
    if (c.curr.constructor === Be) {
      c.next();
      continue;
    }
    if (u.id.clock + u.length > g)
      for ($t(o, u, vn(g - u.id.clock, 0)), c.next(); c.curr && c.curr.id.client === f; )
        $t(o, c.curr, 0), c.next();
    else
      for (; c.curr && c.curr.id.client === f && c.curr.id.clock + c.curr.length <= g; )
        c.next();
  }
  Oo(o);
  const h = xo(a);
  return ms(i, h), i.toUint8Array();
}, Hc = (n) => {
  n.written > 0 && (n.clientStructs.push({ written: n.written, restEncoder: lt(n.encoder.restEncoder) }), n.encoder.restEncoder = zr(), n.written = 0);
}, $t = (n, e, t) => {
  n.written > 0 && n.currClient !== e.id.client && Hc(n), n.written === 0 && (n.currClient = e.id.client, n.encoder.writeClient(e.id.client), D(n.encoder.restEncoder, e.id.clock + t)), e.write(n.encoder, t), n.written++;
}, Oo = (n) => {
  Hc(n);
  const e = n.encoder.restEncoder;
  D(e, n.clientStructs.length);
  for (let t = 0; t < n.clientStructs.length; t++) {
    const s = n.clientStructs[t];
    D(e, s.written), Hr(e, s.restEncoder);
  }
}, rf = (n, e, t, s) => {
  const r = new t(gs(n)), i = new To(r, !1), o = new s(), a = new Eo(o);
  for (let h = i.curr; h !== null; h = i.next())
    $t(a, e(h), 0);
  Oo(a);
  const c = xo(r);
  return ms(o, c), o.toUint8Array();
}, of = (n) => rf(n, Du, ds, ir), xa = "You must not compute changes after the event-handler fired.";
class ti {
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
    return this._path || (this._path = af(this.currentTarget, this.target));
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
    return Lc(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw ft(xa);
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
                o = "delete", a = hi(c.content.getContent());
              else
                return;
            else
              c !== null && this.deletes(c) ? (o = "update", a = hi(c.content.getContent())) : (o = "add", a = void 0);
          } else if (this.deletes(i))
            o = "delete", a = hi(
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
        throw ft(xa);
      const t = this.target, s = ls(), r = ls(), i = [];
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
const af = (n, e) => {
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
}, me = () => {
  Od("Invalid access: Add Yjs type to a document before reading data.");
}, Jc = 80;
let Ao = 0;
class cf {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, t) {
    e.marker = !0, this.p = e, this.index = t, this.timestamp = Ao++;
  }
}
const lf = (n) => {
  n.timestamp = Ao++;
}, Wc = (n, e, t) => {
  n.p.marker = !1, n.p = e, e.marker = !0, n.index = t, n.timestamp = Ao++;
}, hf = (n, e, t) => {
  if (n.length >= Jc) {
    const s = n.reduce((r, i) => r.timestamp < i.timestamp ? r : i);
    return Wc(s, e, t), s;
  } else {
    const s = new cf(e, t);
    return n.push(s), s;
  }
}, ni = (n, e) => {
  if (n._start === null || e === 0 || n._searchMarker === null)
    return null;
  const t = n._searchMarker.length === 0 ? null : n._searchMarker.reduce((i, o) => pr(e - i.index) < pr(e - o.index) ? i : o);
  let s = n._start, r = 0;
  for (t !== null && (s = t.p, r = t.index, lf(t)); s.right !== null && r < e; ) {
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
  return t !== null && pr(t.index - r) < /** @type {YText|YArray<any>} */
  s.parent.length / Jc ? (Wc(t, s, r), t) : hf(n._searchMarker, s, r);
}, Fs = (n, e, t) => {
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
    (e < r.index || t > 0 && e === r.index) && (r.index = vn(e, r.index + t));
  }
}, si = (n, e, t) => {
  const s = n, r = e.changedParentTypes;
  for (; Qt(r, n, () => []).push(t), n._item !== null; )
    n = /** @type {AbstractType<any>} */
    n._item.parent;
  Pc(s._eH, t, e);
};
class fe {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = _a(), this._dEH = _a(), this._searchMarker = null;
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
    throw Xe();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw Xe();
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
    va(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    va(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    ka(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    ka(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const qc = (n, e, t) => {
  n.doc ?? me(), e < 0 && (e = n._length + e), t < 0 && (t = n._length + t);
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
}, Gc = (n) => {
  n.doc ?? me();
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
}, Zs = (n, e) => {
  let t = 0, s = n._start;
  for (n.doc ?? me(); s !== null; ) {
    if (s.countable && !s.deleted) {
      const r = s.content.getContent();
      for (let i = 0; i < r.length; i++)
        e(r[i], t++, n);
    }
    s = s.right;
  }
}, Yc = (n, e) => {
  const t = [];
  return Zs(n, (s, r) => {
    t.push(e(s, r, n));
  }), t;
}, uf = (n) => {
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
}, Xc = (n, e) => {
  n.doc ?? me();
  const t = ni(n, e);
  let s = n._start;
  for (t !== null && (s = t.p, e -= t.index); s !== null; s = s.right)
    if (!s.deleted && s.countable) {
      if (e < s.length)
        return s.content.getContent()[e];
      e -= s.length;
    }
}, Nr = (n, e, t, s) => {
  let r = t;
  const i = n.doc, o = i.clientID, a = i.store, c = t === null ? e._start : t.right;
  let h = [];
  const u = () => {
    h.length > 0 && (r = new ne(N(o, oe(a, o)), r, r && r.lastId, c, c && c.id, e, null, new _n(h)), r.integrate(n, 0), h = []);
  };
  s.forEach((f) => {
    if (f === null)
      h.push(f);
    else
      switch (f.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          h.push(f);
          break;
        default:
          switch (u(), f.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              r = new ne(N(o, oe(a, o)), r, r && r.lastId, c, c && c.id, e, null, new or(new Uint8Array(
                /** @type {Uint8Array} */
                f
              ))), r.integrate(n, 0);
              break;
            case Jt:
              r = new ne(N(o, oe(a, o)), r, r && r.lastId, c, c && c.id, e, null, new ar(
                /** @type {Doc} */
                f
              )), r.integrate(n, 0);
              break;
            default:
              if (f instanceof fe)
                r = new ne(N(o, oe(a, o)), r, r && r.lastId, c, c && c.id, e, null, new At(f)), r.integrate(n, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), u();
}, Qc = () => ft("Length exceeded!"), el = (n, e, t, s) => {
  if (t > e._length)
    throw Qc();
  if (t === 0)
    return e._searchMarker && Fs(e._searchMarker, t, s.length), Nr(n, e, null, s);
  const r = t, i = ni(e, t);
  let o = e._start;
  for (i !== null && (o = i.p, t -= i.index, t === 0 && (o = o.prev, t += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right)
    if (!o.deleted && o.countable) {
      if (t <= o.length) {
        t < o.length && Yt(n, N(o.id.client, o.id.clock + t));
        break;
      }
      t -= o.length;
    }
  return e._searchMarker && Fs(e._searchMarker, r, s.length), Nr(n, e, o, s);
}, df = (n, e, t) => {
  let r = (e._searchMarker || []).reduce((i, o) => o.index > i.index ? o : i, { index: 0, p: e._start }).p;
  if (r)
    for (; r.right; )
      r = r.right;
  return Nr(n, e, r, t);
}, tl = (n, e, t, s) => {
  if (s === 0)
    return;
  const r = t, i = s, o = ni(e, t);
  let a = e._start;
  for (o !== null && (a = o.p, t -= o.index); a !== null && t > 0; a = a.right)
    !a.deleted && a.countable && (t < a.length && Yt(n, N(a.id.client, a.id.clock + t)), t -= a.length);
  for (; s > 0 && a !== null; )
    a.deleted || (s < a.length && Yt(n, N(a.id.client, a.id.clock + s)), a.delete(n), s -= a.length), a = a.right;
  if (s > 0)
    throw Qc();
  e._searchMarker && Fs(
    e._searchMarker,
    r,
    -i + s
    /* in case we remove the above exception */
  );
}, Mr = (n, e, t) => {
  const s = e._map.get(t);
  s !== void 0 && s.delete(n);
}, Do = (n, e, t, s) => {
  const r = e._map.get(t) || null, i = n.doc, o = i.clientID;
  let a;
  if (s == null)
    a = new _n([s]);
  else
    switch (s.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        a = new _n([s]);
        break;
      case Uint8Array:
        a = new or(
          /** @type {Uint8Array} */
          s
        );
        break;
      case Jt:
        a = new ar(
          /** @type {Doc} */
          s
        );
        break;
      default:
        if (s instanceof fe)
          a = new At(s);
        else
          throw new Error("Unexpected content type");
    }
  new ne(N(o, oe(i.store, o)), r, r && r.lastId, null, null, e, t, a).integrate(n, 0);
}, Lo = (n, e) => {
  n.doc ?? me();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted ? t.content.getContent()[t.length - 1] : void 0;
}, nl = (n) => {
  const e = {};
  return n.doc ?? me(), n._map.forEach((t, s) => {
    t.deleted || (e[s] = t.content.getContent()[t.length - 1]);
  }), e;
}, sl = (n, e) => {
  n.doc ?? me();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted;
}, ff = (n, e) => {
  const t = {};
  return n._map.forEach((s, r) => {
    let i = s;
    for (; i !== null && (!e.sv.has(i.id.client) || i.id.clock >= (e.sv.get(i.id.client) || 0)); )
      i = i.left;
    i !== null && On(i, e) && (t[r] = i.content.getContent()[i.length - 1]);
  }), t;
}, dr = (n) => (n.doc ?? me(), Ad(
  n._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class gf extends ti {
}
class Bn extends fe {
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
    const t = new Bn();
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
    return new Bn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new Bn();
    return e.insert(0, this.toArray().map(
      (t) => t instanceof fe ? (
        /** @type {typeof el} */
        t.clone()
      ) : t
    )), e;
  }
  get length() {
    return this.doc ?? me(), this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    super._callObserver(e, t), si(this, e, new gf(this, e));
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
    this.doc !== null ? K(this.doc, (s) => {
      el(
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
    this.doc !== null ? K(this.doc, (t) => {
      df(
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
    this.doc !== null ? K(this.doc, (s) => {
      tl(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return Xc(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return Gc(this);
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
    return qc(this, e, t);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof fe ? e.toJSON() : e);
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
    return Yc(
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
    Zs(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return uf(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Bf);
  }
}
const pf = (n) => new Bn();
class mf extends ti {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, t, s) {
    super(e, t), this.keysChanged = s;
  }
}
class R extends fe {
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
    return new R();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const e = new R();
    return this.forEach((t, s) => {
      e.set(s, t instanceof fe ? (
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
    si(this, e, new mf(this, e, t));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? me();
    const e = {};
    return this._map.forEach((t, s) => {
      if (!t.deleted) {
        const r = t.content.getContent()[t.length - 1];
        e[s] = r instanceof fe ? r.toJSON() : r;
      }
    }), e;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...dr(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return yi(
      dr(this),
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
    return yi(
      dr(this),
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
    return yi(
      dr(this),
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
    this.doc ?? me(), this._map.forEach((t, s) => {
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
    this.doc !== null ? K(this.doc, (t) => {
      Mr(t, this, e);
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
    return this.doc !== null ? K(this.doc, (s) => {
      Do(
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
      Lo(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return sl(this, e);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    this.doc !== null ? K(this.doc, (e) => {
      this.forEach(function(t, s, r) {
        Mr(e, r, s);
      });
    }) : this._prelimContent.clear();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(jf);
  }
}
const yf = (n) => new R(), zt = (n, e) => n === e || typeof n == "object" && typeof e == "object" && n && e && Ou(n, e);
class Ki {
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
    switch (this.right === null && je(), this.right.content.constructor) {
      case se:
        this.right.deleted || ys(
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
const Ca = (n, e, t) => {
  for (; e.right !== null && t > 0; ) {
    switch (e.right.content.constructor) {
      case se:
        e.right.deleted || ys(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (t < e.right.length && Yt(n, N(e.right.id.client, e.right.id.clock + t)), e.index += e.right.length, t -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, fr = (n, e, t, s) => {
  const r = /* @__PURE__ */ new Map(), i = s ? ni(e, t) : null;
  if (i) {
    const o = new Ki(i.p.left, i.p, i.index, r);
    return Ca(n, o, t - i.index);
  } else {
    const o = new Ki(null, e._start, 0, r);
    return Ca(n, o, t);
  }
}, rl = (n, e, t, s) => {
  for (; t.right !== null && (t.right.deleted === !0 || t.right.content.constructor === se && zt(
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
    const c = t.left, h = t.right, u = new ne(N(i, oe(r.store, i)), c, c && c.lastId, h, h && h.id, e, null, new se(a, o));
    u.integrate(n, 0), t.right = u, t.forward();
  });
}, ys = (n, e) => {
  const { key: t, value: s } = e;
  s === null ? n.delete(t) : n.set(t, s);
}, il = (n, e) => {
  for (; n.right !== null; ) {
    if (!(n.right.deleted || n.right.content.constructor === se && zt(
      e[
        /** @type {ContentFormat} */
        n.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      n.right.content.value
    ))) break;
    n.forward();
  }
}, ol = (n, e, t, s) => {
  const r = n.doc, i = r.clientID, o = /* @__PURE__ */ new Map();
  for (const a in s) {
    const c = s[a], h = t.currentAttributes.get(a) ?? null;
    if (!zt(h, c)) {
      o.set(a, h);
      const { left: u, right: f } = t;
      t.right = new ne(N(i, oe(r.store, i)), u, u && u.lastId, f, f && f.id, e, null, new se(a, c)), t.right.integrate(n, 0), t.forward();
    }
  }
  return o;
}, vi = (n, e, t, s, r) => {
  t.currentAttributes.forEach((g, m) => {
    r[m] === void 0 && (r[m] = null);
  });
  const i = n.doc, o = i.clientID;
  il(t, r);
  const a = ol(n, e, t, r), c = s.constructor === String ? new pt(
    /** @type {string} */
    s
  ) : s instanceof fe ? new At(s) : new kn(s);
  let { left: h, right: u, index: f } = t;
  e._searchMarker && Fs(e._searchMarker, t.index, c.getLength()), u = new ne(N(o, oe(i.store, o)), h, h && h.lastId, u, u && u.id, e, null, c), u.integrate(n, 0), t.right = u, t.index = f, t.forward(), rl(n, e, t, a);
}, Ta = (n, e, t, s, r) => {
  const i = n.doc, o = i.clientID;
  il(t, r);
  const a = ol(n, e, t, r);
  e: for (; t.right !== null && (s > 0 || a.size > 0 && (t.right.deleted || t.right.content.constructor === se)); ) {
    if (!t.right.deleted)
      switch (t.right.content.constructor) {
        case se: {
          const { key: c, value: h } = (
            /** @type {ContentFormat} */
            t.right.content
          ), u = r[c];
          if (u !== void 0) {
            if (zt(u, h))
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
          s < t.right.length && Yt(n, N(t.right.id.client, t.right.id.clock + s)), s -= t.right.length;
          break;
      }
    t.forward();
  }
  if (s > 0) {
    let c = "";
    for (; s > 0; s--)
      c += `
`;
    t.right = new ne(N(o, oe(i.store, o)), t.left, t.left && t.left.lastId, t.right, t.right && t.right.id, e, null, new pt(c)), t.right.integrate(n, 0), t.forward();
  }
  rl(n, e, t, a);
}, al = (n, e, t, s, r) => {
  let i = e;
  const o = Ye();
  for (; i && (!i.countable || i.deleted); ) {
    if (!i.deleted && i.content.constructor === se) {
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
        case se: {
          const { key: u, value: f } = (
            /** @type {ContentFormat} */
            h
          ), g = s.get(u) ?? null;
          (o.get(u) !== h || g === f) && (e.delete(n), a++, !c && (r.get(u) ?? null) === f && g !== f && (g === null ? r.delete(u) : r.set(u, g))), !c && !e.deleted && ys(
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
}, wf = (n, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const t = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === se) {
      const s = (
        /** @type {ContentFormat} */
        e.content.key
      );
      t.has(s) ? e.delete(n) : t.add(s);
    }
    e = e.left;
  }
}, _f = (n) => {
  let e = 0;
  return K(
    /** @type {Doc} */
    n.doc,
    (t) => {
      let s = (
        /** @type {Item} */
        n._start
      ), r = n._start, i = Ye();
      const o = Ni(i);
      for (; r; ) {
        if (r.deleted === !1)
          switch (r.content.constructor) {
            case se:
              ys(
                o,
                /** @type {ContentFormat} */
                r.content
              );
              break;
            default:
              e += al(t, s, r, i, o), i = Ni(o), s = r;
              break;
          }
        r = r.right;
      }
    }
  ), e;
}, vf = (n) => {
  const e = /* @__PURE__ */ new Set(), t = n.doc;
  for (const [s, r] of n.afterState.entries()) {
    const i = n.beforeState.get(s) || 0;
    r !== i && Zc(
      n,
      /** @type {Array<Item|GC>} */
      t.store.clients.get(s),
      i,
      r,
      (o) => {
        !o.deleted && /** @type {Item} */
        o.content.constructor === se && o.constructor !== Ue && e.add(
          /** @type {any} */
          o.parent
        );
      }
    );
  }
  K(t, (s) => {
    Dc(n, n.deleteSet, (r) => {
      if (r instanceof Ue || !/** @type {YText} */
      r.parent._hasFormatting || e.has(
        /** @type {YText} */
        r.parent
      ))
        return;
      const i = (
        /** @type {YText} */
        r.parent
      );
      r.content.constructor === se ? e.add(i) : wf(s, r);
    });
    for (const r of e)
      _f(r);
  });
}, Ea = (n, e, t) => {
  const s = t, r = Ni(e.currentAttributes), i = e.right;
  for (; t > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case At:
        case kn:
        case pt:
          t < e.right.length && Yt(n, N(e.right.id.client, e.right.id.clock + t)), t -= e.right.length, e.right.delete(n);
          break;
      }
    e.forward();
  }
  i && al(n, i, e.right, r, e.currentAttributes);
  const o = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return o._searchMarker && Fs(o._searchMarker, e.index, -s + t), e;
};
class kf extends ti {
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
      K(e, (s) => {
        const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
        let o = this.target._start, a = null;
        const c = {};
        let h = "", u = 0, f = 0;
        const g = () => {
          if (a !== null) {
            let m = null;
            switch (a) {
              case "delete":
                f > 0 && (m = { delete: f }), f = 0;
                break;
              case "insert":
                (typeof h == "object" || h.length > 0) && (m = { insert: h }, r.size > 0 && (m.attributes = {}, r.forEach((w, I) => {
                  w !== null && (m.attributes[I] = w);
                }))), h = "";
                break;
              case "retain":
                u > 0 && (m = { retain: u }, Eu(c) || (m.attributes = xu({}, c))), u = 0;
                break;
            }
            m && t.push(m), a = null;
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case At:
            case kn:
              this.adds(o) ? this.deletes(o) || (g(), a = "insert", h = o.content.getContent()[0], g()) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), f += 1) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += 1);
              break;
            case pt:
              this.adds(o) ? this.deletes(o) || (a !== "insert" && (g(), a = "insert"), h += /** @type {ContentString} */
              o.content.str) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), f += o.length) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += o.length);
              break;
            case se: {
              const { key: m, value: w } = (
                /** @type {ContentFormat} */
                o.content
              );
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const I = r.get(m) ?? null;
                  zt(I, w) ? w !== null && o.delete(s) : (a === "retain" && g(), zt(w, i.get(m) ?? null) ? delete c[m] : c[m] = w);
                }
              } else if (this.deletes(o)) {
                i.set(m, w);
                const I = r.get(m) ?? null;
                zt(I, w) || (a === "retain" && g(), c[m] = I);
              } else if (!o.deleted) {
                i.set(m, w);
                const I = c[m];
                I !== void 0 && (zt(I, w) ? I !== null && o.delete(s) : (a === "retain" && g(), w === null ? delete c[m] : c[m] = w));
              }
              o.deleted || (a === "insert" && g(), ys(
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
class F extends fe {
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
    return this.doc ?? me(), this._length;
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
    return new F();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const e = new F();
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
    const s = new kf(this, e, t);
    si(this, e, s), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? me();
    let e = "", t = this._start;
    for (; t !== null; )
      !t.deleted && t.countable && t.content.constructor === pt && (e += /** @type {ContentString} */
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
    this.doc !== null ? K(this.doc, (s) => {
      const r = new Ki(null, this._start, 0, /* @__PURE__ */ new Map());
      for (let i = 0; i < e.length; i++) {
        const o = e[i];
        if (o.insert !== void 0) {
          const a = !t && typeof o.insert == "string" && i === e.length - 1 && r.right === null && o.insert.slice(-1) === `
` ? o.insert.slice(0, -1) : o.insert;
          (typeof a != "string" || a.length > 0) && vi(s, this, r, a, o.attributes || {});
        } else o.retain !== void 0 ? Ta(s, this, r, o.retain, o.attributes || {}) : o.delete !== void 0 && Ea(s, r, o.delete);
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
    this.doc ?? me();
    const r = [], i = /* @__PURE__ */ new Map(), o = (
      /** @type {Doc} */
      this.doc
    );
    let a = "", c = this._start;
    function h() {
      if (a.length > 0) {
        const f = {};
        let g = !1;
        i.forEach((w, I) => {
          g = !0, f[I] = w;
        });
        const m = { insert: a };
        g && (m.attributes = f), r.push(m), a = "";
      }
    }
    const u = () => {
      for (; c !== null; ) {
        if (On(c, e) || t !== void 0 && On(c, t))
          switch (c.content.constructor) {
            case pt: {
              const f = i.get("ychange");
              e !== void 0 && !On(c, e) ? (f === void 0 || f.user !== c.id.client || f.type !== "removed") && (h(), i.set("ychange", s ? s("removed", c.id) : { type: "removed" })) : t !== void 0 && !On(c, t) ? (f === void 0 || f.user !== c.id.client || f.type !== "added") && (h(), i.set("ychange", s ? s("added", c.id) : { type: "added" })) : f !== void 0 && (h(), i.delete("ychange")), a += /** @type {ContentString} */
              c.content.str;
              break;
            }
            case At:
            case kn: {
              h();
              const f = {
                insert: c.content.getContent()[0]
              };
              if (i.size > 0) {
                const g = (
                  /** @type {Object<string,any>} */
                  {}
                );
                f.attributes = g, i.forEach((m, w) => {
                  g[w] = m;
                });
              }
              r.push(f);
              break;
            }
            case se:
              On(c, e) && (h(), ys(
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
    return e || t ? K(o, (f) => {
      e && ji(f, e), t && ji(f, t), u();
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
    r !== null ? K(r, (i) => {
      const o = fr(i, this, e, !s);
      s || (s = {}, o.currentAttributes.forEach((a, c) => {
        s[c] = a;
      })), vi(i, this, o, t, s);
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
    r !== null ? K(r, (i) => {
      const o = fr(i, this, e, !s);
      vi(i, this, o, t, s || {});
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
    s !== null ? K(s, (r) => {
      Ea(r, fr(r, this, e, !0), t);
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
    r !== null ? K(r, (i) => {
      const o = fr(i, this, e, !1);
      o.right !== null && Ta(i, this, o, t, s);
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
    this.doc !== null ? K(this.doc, (t) => {
      Mr(t, this, e);
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
    this.doc !== null ? K(this.doc, (s) => {
      Do(s, this, e, t);
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
      Lo(this, e)
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
    return nl(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Pf);
  }
}
const bf = (n) => new F();
class ki {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(e, t = () => !0) {
    this._filter = t, this._root = e, this._currentNode = /** @type {Item} */
    e._start, this._firstCall = !0, e.doc ?? me();
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
        e.content.type, !e.deleted && (t.constructor === fs || t.constructor === wn) && t._start !== null)
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
class wn extends fe {
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
    return new wn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new wn();
    return e.insert(0, this.toArray().map((t) => t instanceof fe ? t.clone() : t)), e;
  }
  get length() {
    return this.doc ?? me(), this._prelimContent === null ? this._length : this._prelimContent.length;
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
    return new ki(this, e);
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
    const s = new ki(this, (r) => r.nodeName && r.nodeName.toUpperCase() === e).next();
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
    return e = e.toUpperCase(), Gt(new ki(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    si(this, e, new xf(this, t, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return Yc(this, (e) => e.toString()).join("");
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
    return s !== void 0 && s._createAssociation(r, this), Zs(this, (i) => {
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
    this.doc !== null ? K(this.doc, (s) => {
      el(s, this, e, t);
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
      K(this.doc, (s) => {
        const r = e && e instanceof fe ? e._item : e;
        Nr(s, this, r, t);
      });
    else {
      const s = (
        /** @type {Array<any>} */
        this._prelimContent
      ), r = e === null ? 0 : s.findIndex((i) => i === e) + 1;
      if (r === 0 && e !== null)
        throw ft("Reference item not found");
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
    this.doc !== null ? K(this.doc, (s) => {
      tl(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return Gc(this);
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
    return Xc(this, e);
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
    return qc(this, e, t);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Zs(this, e);
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
    e.writeTypeRef(Ff);
  }
}
const Sf = (n) => new wn();
class fs extends wn {
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
    return new fs(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new fs(this.nodeName), t = this.getAttributes();
    return Tu(t, (s, r) => {
      e.setAttribute(
        r,
        /** @type {any} */
        s
      );
    }), e.insert(0, this.toArray().map((s) => s instanceof fe ? s.clone() : s)), e;
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
    this.doc !== null ? K(this.doc, (t) => {
      Mr(t, this, e);
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
    this.doc !== null ? K(this.doc, (s) => {
      Do(s, this, e, t);
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
      Lo(this, e)
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
      sl(this, e)
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
      e ? ff(this, e) : nl(this)
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
    return Zs(this, (o) => {
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
    e.writeTypeRef(Kf), e.writeKey(this.nodeName);
  }
}
const If = (n) => new fs(n.readKey());
class xf extends ti {
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
class Vr extends R {
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
    return new Vr(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const e = new Vr(this.hookName);
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
    e.writeTypeRef(Zf), e.writeKey(this.hookName);
  }
}
const Cf = (n) => new Vr(n.readKey());
class $r extends F {
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
    return new $r();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const e = new $r();
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
    e.writeTypeRef(zf);
  }
}
const Tf = (n) => new $r();
class Ro {
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
    throw Xe();
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
    throw Xe();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    throw Xe();
  }
}
const Ef = 0;
class Ue extends Ro {
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
    t > 0 && (this.id.clock += t, this.length -= t), Fc(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(Ef), e.writeLen(this.length - t);
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
class or {
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
    return new or(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(e) {
    throw Xe();
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
const Of = (n) => new or(n.readBuf());
class zs {
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
    return new zs(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const t = new zs(this.len - e);
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
    Lr(e.deleteSet, t.id.client, t.id.clock, this.len), t.markDeleted();
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
const Af = (n) => new zs(n.readLen()), cl = (n, e) => new Jt({ guid: n, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class ar {
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
    return new ar(cl(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(e) {
    throw Xe();
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
const Df = (n) => new ar(cl(n.readString(), n.readAny()));
class kn {
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
    return new kn(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(e) {
    throw Xe();
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
const Lf = (n) => new kn(n.readJSON());
class se {
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
    return new se(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(e) {
    throw Xe();
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
const Rf = (n) => new se(n.readKey(), n.readJSON());
class Ur {
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
    return new Ur(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(e) {
    const t = new Ur(this.arr.slice(e));
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
const Nf = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++) {
    const r = n.readString();
    r === "undefined" ? t.push(void 0) : t.push(JSON.parse(r));
  }
  return new Ur(t);
}, Mf = Er("node_env") === "development";
class _n {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, Mf && ac(e);
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
    return new _n(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const t = new _n(this.arr.slice(e));
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
const Vf = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++)
    t.push(n.readAny());
  return new _n(t);
};
class pt {
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
    return new pt(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(e) {
    const t = new pt(this.str.slice(e));
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
const $f = (n) => new pt(n.readString()), Uf = [
  pf,
  yf,
  bf,
  If,
  Sf,
  Cf,
  Tf
], Bf = 0, jf = 1, Pf = 2, Kf = 3, Ff = 4, Zf = 5, zf = 6;
class At {
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
    return new At(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(e) {
    throw Xe();
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
const Hf = (n) => new At(Uf[n.readTypeRef()](n)), Br = (n, e, t) => {
  const { client: s, clock: r } = e.id, i = new ne(
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
class ne extends Ro {
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
    super(e, c.getLength()), this.origin = s, this.left = t, this.right = r, this.rightOrigin = i, this.parent = o, this.parentSub = a, this.redone = null, this.content = c, this.info = this.content.isCountable() ? ia : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & di) > 0 !== e && (this.info ^= di);
  }
  get marker() {
    return (this.info & di) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & ra) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= ra);
  }
  get countable() {
    return (this.info & ia) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & ui) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= ui);
  }
  markDeleted() {
    this.info |= ui;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= oe(t, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= oe(t, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === Un && this.id.client !== this.parent.client && this.parent.clock >= oe(t, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = ba(e, t, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = Yt(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === Ue || this.right && this.right.constructor === Ue)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === ne ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === ne && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === Un) {
      const s = _i(t, this.parent);
      s.constructor === Ue ? this.parent = null : this.parent = /** @type {ContentType} */
      s.content.type;
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, t) {
    if (t > 0 && (this.id.clock += t, this.left = ba(e, e.doc.store, N(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
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
          if (o.add(r), i.add(r), ur(this.origin, r.origin)) {
            if (r.id.client < this.id.client)
              s = r, i.clear();
            else if (ur(this.rightOrigin, r.rightOrigin))
              break;
          } else if (r.origin !== null && o.has(_i(e.doc.store, r.origin)))
            i.has(_i(e.doc.store, r.origin)) || (s = r, i.clear());
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
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), Fc(e.doc.store, this), this.content.integrate(e, this), Ia(
        e,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      ), /** @type {AbstractType<any>} */
      (this.parent._item !== null && /** @type {AbstractType<any>} */
      this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
    } else
      new Ue(this.id, this.length).integrate(e, 0);
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
    if (this.constructor === e.constructor && ur(e.origin, this.lastId) && this.right === e && ur(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
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
      this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), Lr(e.deleteSet, this.id.client, this.id.clock, this.length), Ia(e, t, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, t) {
    if (!this.deleted)
      throw je();
    this.content.gc(e), t ? Gd(e, this, new Ue(this.id, this.length)) : this.content = new zs(this.length);
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
    const s = t > 0 ? N(this.id.client, this.id.clock + t - 1) : this.origin, r = this.rightOrigin, i = this.parentSub, o = this.content.getRef() & Zr | (s === null ? 0 : Ne) | // origin is defined
    (r === null ? 0 : Tt) | // right origin is defined
    (i === null ? 0 : Vs);
    if (e.writeInfo(o), s !== null && e.writeLeftID(s), r !== null && e.writeRightID(r), s === null && r === null) {
      const a = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const h = Wd(a);
          e.writeParentInfo(!0), e.writeString(h);
        } else
          e.writeParentInfo(!1), e.writeLeftID(c.id);
      } else a.constructor === String ? (e.writeParentInfo(!0), e.writeString(a)) : a.constructor === Un ? (e.writeParentInfo(!1), e.writeLeftID(a)) : je();
      i !== null && e.writeString(i);
    }
    this.content.write(e, t);
  }
}
const ll = (n, e) => Jf[e & Zr](n), Jf = [
  () => {
    je();
  },
  // GC is not ItemContent
  Af,
  // 1
  Nf,
  // 2
  Of,
  // 3
  $f,
  // 4
  Lf,
  // 5
  Rf,
  // 6
  Hf,
  // 7
  Vf,
  // 8
  Df,
  // 9
  () => {
    je();
  }
  // 10 - Skip is not ItemContent
], Wf = 10;
class Be extends Ro {
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
    je();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(Wf), D(e.restEncoder, this.length - t);
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
const hl = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), ul = "__ $YJS$ __";
hl[ul] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
hl[ul] = !0;
var de = Uint8Array, Re = Uint16Array, No = Int32Array, ri = new de([
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
]), ii = new de([
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
]), Fi = new de([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), dl = function(n, e) {
  for (var t = new Re(31), s = 0; s < 31; ++s)
    t[s] = e += 1 << n[s - 1];
  for (var r = new No(t[30]), s = 1; s < 30; ++s)
    for (var i = t[s]; i < t[s + 1]; ++i)
      r[i] = i - t[s] << 5 | s;
  return { b: t, r };
}, fl = dl(ri, 2), gl = fl.b, Zi = fl.r;
gl[28] = 258, Zi[258] = 28;
var pl = dl(ii, 0), qf = pl.b, Oa = pl.r, zi = new Re(32768);
for (var Z = 0; Z < 32768; ++Z) {
  var Rt = (Z & 43690) >> 1 | (Z & 21845) << 1;
  Rt = (Rt & 52428) >> 2 | (Rt & 13107) << 2, Rt = (Rt & 61680) >> 4 | (Rt & 3855) << 4, zi[Z] = ((Rt & 65280) >> 8 | (Rt & 255) << 8) >> 1;
}
var ut = (function(n, e, t) {
  for (var s = n.length, r = 0, i = new Re(e); r < s; ++r)
    n[r] && ++i[n[r] - 1];
  var o = new Re(e);
  for (r = 1; r < e; ++r)
    o[r] = o[r - 1] + i[r - 1] << 1;
  var a;
  if (t) {
    a = new Re(1 << e);
    var c = 15 - e;
    for (r = 0; r < s; ++r)
      if (n[r])
        for (var h = r << 4 | n[r], u = e - n[r], f = o[n[r] - 1]++ << u, g = f | (1 << u) - 1; f <= g; ++f)
          a[zi[f] >> c] = h;
  } else
    for (a = new Re(s), r = 0; r < s; ++r)
      n[r] && (a[r] = zi[o[n[r] - 1]++] >> 15 - n[r]);
  return a;
}), Xt = new de(288);
for (var Z = 0; Z < 144; ++Z)
  Xt[Z] = 8;
for (var Z = 144; Z < 256; ++Z)
  Xt[Z] = 9;
for (var Z = 256; Z < 280; ++Z)
  Xt[Z] = 7;
for (var Z = 280; Z < 288; ++Z)
  Xt[Z] = 8;
var Hs = new de(32);
for (var Z = 0; Z < 32; ++Z)
  Hs[Z] = 5;
var Gf = /* @__PURE__ */ ut(Xt, 9, 0), Yf = /* @__PURE__ */ ut(Xt, 9, 1), Xf = /* @__PURE__ */ ut(Hs, 5, 0), Qf = /* @__PURE__ */ ut(Hs, 5, 1), bi = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Fe = function(n, e, t) {
  var s = e / 8 | 0;
  return (n[s] | n[s + 1] << 8) >> (e & 7) & t;
}, Si = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, Mo = function(n) {
  return (n + 7) / 8 | 0;
}, ml = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new de(n.subarray(e, t));
}, eg = [
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
], ze = function(n, e, t) {
  var s = new Error(e || eg[n]);
  if (s.code = n, Error.captureStackTrace && Error.captureStackTrace(s, ze), !t)
    throw s;
  return s;
}, tg = function(n, e, t, s) {
  var r = n.length, i = 0;
  if (!r || e.f && !e.l)
    return t || new de(0);
  var o = !t, a = o || e.i != 2, c = e.i;
  o && (t = new de(r * 3));
  var h = function(_s) {
    var vs = t.length;
    if (_s > vs) {
      var In = new de(Math.max(vs * 2, _s));
      In.set(t), t = In;
    }
  }, u = e.f || 0, f = e.p || 0, g = e.b || 0, m = e.l, w = e.d, I = e.m, W = e.n, Ke = r * 8;
  do {
    if (!m) {
      u = Fe(n, f, 1);
      var Se = Fe(n, f + 1, 3);
      if (f += 3, Se)
        if (Se == 1)
          m = Yf, w = Qf, I = 9, W = 5;
        else if (Se == 2) {
          var _e = Fe(n, f, 31) + 257, ce = Fe(n, f + 10, 15) + 4, U = _e + Fe(n, f + 5, 31) + 1;
          f += 14;
          for (var E = new de(U), le = new de(19), Q = 0; Q < ce; ++Q)
            le[Fi[Q]] = Fe(n, f + Q * 3, 7);
          f += ce * 3;
          for (var pe = bi(le), Dt = (1 << pe) - 1, Ie = ut(le, pe, 1), Q = 0; Q < U; ) {
            var ke = Ie[Fe(n, f, Dt)];
            f += ke & 15;
            var re = ke >> 4;
            if (re < 16)
              E[Q++] = re;
            else {
              var he = 0, H = 0;
              for (re == 16 ? (H = 3 + Fe(n, f, 3), f += 2, he = E[Q - 1]) : re == 17 ? (H = 3 + Fe(n, f, 7), f += 3) : re == 18 && (H = 11 + Fe(n, f, 127), f += 7); H--; )
                E[Q++] = he;
            }
          }
          var be = E.subarray(0, _e), ue = E.subarray(_e);
          I = bi(be), W = bi(ue), m = ut(be, I, 1), w = ut(ue, W, 1);
        } else
          ze(1);
      else {
        var re = Mo(f) + 4, we = n[re - 4] | n[re - 3] << 8, ge = re + we;
        if (ge > r) {
          c && ze(0);
          break;
        }
        a && h(g + we), t.set(n.subarray(re, ge), g), e.b = g += we, e.p = f = ge * 8, e.f = u;
        continue;
      }
      if (f > Ke) {
        c && ze(0);
        break;
      }
    }
    a && h(g + 131072);
    for (var ws = (1 << I) - 1, Ve = (1 << W) - 1, mt = f; ; mt = f) {
      var he = m[Si(n, f) & ws], xe = he >> 4;
      if (f += he & 15, f > Ke) {
        c && ze(0);
        break;
      }
      if (he || ze(2), xe < 256)
        t[g++] = xe;
      else if (xe == 256) {
        mt = f, m = null;
        break;
      } else {
        var Ce = xe - 254;
        if (xe > 264) {
          var Q = xe - 257, J = ri[Q];
          Ce = Fe(n, f, (1 << J) - 1) + gl[Q], f += J;
        }
        var Qe = w[Si(n, f) & Ve], bn = Qe >> 4;
        Qe || ze(3), f += Qe & 15;
        var ue = qf[bn];
        if (bn > 3) {
          var J = ii[bn];
          ue += Si(n, f) & (1 << J) - 1, f += J;
        }
        if (f > Ke) {
          c && ze(0);
          break;
        }
        a && h(g + 131072);
        var Sn = g + Ce;
        if (g < ue) {
          var cr = i - ue, lr = Math.min(ue, Sn);
          for (cr + g < 0 && ze(3); g < lr; ++g)
            t[g] = s[cr + g];
        }
        for (; g < Sn; ++g)
          t[g] = t[g - ue];
      }
    }
    e.l = m, e.p = mt, e.b = g, e.f = u, m && (u = 1, e.m = I, e.d = w, e.n = W);
  } while (!u);
  return g != t.length && o ? ml(t, 0, g) : t.subarray(0, g);
}, wt = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8;
}, ks = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8, n[s + 2] |= t >> 16;
}, Ii = function(n, e) {
  for (var t = [], s = 0; s < n.length; ++s)
    n[s] && t.push({ s, f: n[s] });
  var r = t.length, i = t.slice();
  if (!r)
    return { t: wl, l: 0 };
  if (r == 1) {
    var o = new de(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(ge, _e) {
    return ge.f - _e.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], c = t[1], h = 0, u = 1, f = 2;
  for (t[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != r - 1; )
    a = t[t[h].f < t[f].f ? h++ : f++], c = t[h != u && t[h].f < t[f].f ? h++ : f++], t[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var g = i[0].s, s = 1; s < r; ++s)
    i[s].s > g && (g = i[s].s);
  var m = new Re(g + 1), w = Hi(t[u - 1], m, 0);
  if (w > e) {
    var s = 0, I = 0, W = w - e, Ke = 1 << W;
    for (i.sort(function(_e, ce) {
      return m[ce.s] - m[_e.s] || _e.f - ce.f;
    }); s < r; ++s) {
      var Se = i[s].s;
      if (m[Se] > e)
        I += Ke - (1 << w - m[Se]), m[Se] = e;
      else
        break;
    }
    for (I >>= W; I > 0; ) {
      var re = i[s].s;
      m[re] < e ? I -= 1 << e - m[re]++ - 1 : ++s;
    }
    for (; s >= 0 && I; --s) {
      var we = i[s].s;
      m[we] == e && (--m[we], ++I);
    }
    w = e;
  }
  return { t: new de(m), l: w };
}, Hi = function(n, e, t) {
  return n.s == -1 ? Math.max(Hi(n.l, e, t + 1), Hi(n.r, e, t + 1)) : e[n.s] = t;
}, Aa = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new Re(++e), s = 0, r = n[0], i = 1, o = function(c) {
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
}, bs = function(n, e) {
  for (var t = 0, s = 0; s < e.length; ++s)
    t += n[s] * e[s];
  return t;
}, yl = function(n, e, t) {
  var s = t.length, r = Mo(e + 2);
  n[r] = s & 255, n[r + 1] = s >> 8, n[r + 2] = n[r] ^ 255, n[r + 3] = n[r + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    n[r + i + 4] = t[i];
  return (r + 4 + s) * 8;
}, Da = function(n, e, t, s, r, i, o, a, c, h, u) {
  wt(e, u++, t), ++r[256];
  for (var f = Ii(r, 15), g = f.t, m = f.l, w = Ii(i, 15), I = w.t, W = w.l, Ke = Aa(g), Se = Ke.c, re = Ke.n, we = Aa(I), ge = we.c, _e = we.n, ce = new Re(19), U = 0; U < Se.length; ++U)
    ++ce[Se[U] & 31];
  for (var U = 0; U < ge.length; ++U)
    ++ce[ge[U] & 31];
  for (var E = Ii(ce, 7), le = E.t, Q = E.l, pe = 19; pe > 4 && !le[Fi[pe - 1]]; --pe)
    ;
  var Dt = h + 5 << 3, Ie = bs(r, Xt) + bs(i, Hs) + o, ke = bs(r, g) + bs(i, I) + o + 14 + 3 * pe + bs(ce, le) + 2 * ce[16] + 3 * ce[17] + 7 * ce[18];
  if (c >= 0 && Dt <= Ie && Dt <= ke)
    return yl(e, u, n.subarray(c, c + h));
  var he, H, be, ue;
  if (wt(e, u, 1 + (ke < Ie)), u += 2, ke < Ie) {
    he = ut(g, m, 0), H = g, be = ut(I, W, 0), ue = I;
    var ws = ut(le, Q, 0);
    wt(e, u, re - 257), wt(e, u + 5, _e - 1), wt(e, u + 10, pe - 4), u += 14;
    for (var U = 0; U < pe; ++U)
      wt(e, u + 3 * U, le[Fi[U]]);
    u += 3 * pe;
    for (var Ve = [Se, ge], mt = 0; mt < 2; ++mt)
      for (var xe = Ve[mt], U = 0; U < xe.length; ++U) {
        var Ce = xe[U] & 31;
        wt(e, u, ws[Ce]), u += le[Ce], Ce > 15 && (wt(e, u, xe[U] >> 5 & 127), u += xe[U] >> 12);
      }
  } else
    he = Gf, H = Xt, be = Xf, ue = Hs;
  for (var U = 0; U < a; ++U) {
    var J = s[U];
    if (J > 255) {
      var Ce = J >> 18 & 31;
      ks(e, u, he[Ce + 257]), u += H[Ce + 257], Ce > 7 && (wt(e, u, J >> 23 & 31), u += ri[Ce]);
      var Qe = J & 31;
      ks(e, u, be[Qe]), u += ue[Qe], Qe > 3 && (ks(e, u, J >> 5 & 8191), u += ii[Qe]);
    } else
      ks(e, u, he[J]), u += H[J];
  }
  return ks(e, u, he[256]), u + H[256];
}, ng = /* @__PURE__ */ new No([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), wl = /* @__PURE__ */ new de(0), sg = function(n, e, t, s, r, i) {
  var o = i.z || n.length, a = new de(s + o + 5 * (1 + Math.ceil(o / 7e3)) + r), c = a.subarray(s, a.length - r), h = i.l, u = (i.r || 0) & 7;
  if (e) {
    u && (c[0] = i.r >> 3);
    for (var f = ng[e - 1], g = f >> 13, m = f & 8191, w = (1 << t) - 1, I = i.p || new Re(32768), W = i.h || new Re(w + 1), Ke = Math.ceil(t / 3), Se = 2 * Ke, re = function(oi) {
      return (n[oi] ^ n[oi + 1] << Ke ^ n[oi + 2] << Se) & w;
    }, we = new No(25e3), ge = new Re(288), _e = new Re(32), ce = 0, U = 0, E = i.i || 0, le = 0, Q = i.w || 0, pe = 0; E + 2 < o; ++E) {
      var Dt = re(E), Ie = E & 32767, ke = W[Dt];
      if (I[Ie] = ke, W[Dt] = Ie, Q <= E) {
        var he = o - E;
        if ((ce > 7e3 || le > 24576) && (he > 423 || !h)) {
          u = Da(n, c, 0, we, ge, _e, U, le, pe, E - pe, u), le = ce = U = 0, pe = E;
          for (var H = 0; H < 286; ++H)
            ge[H] = 0;
          for (var H = 0; H < 30; ++H)
            _e[H] = 0;
        }
        var be = 2, ue = 0, ws = m, Ve = Ie - ke & 32767;
        if (he > 2 && Dt == re(E - Ve))
          for (var mt = Math.min(g, he) - 1, xe = Math.min(32767, E), Ce = Math.min(258, he); Ve <= xe && --ws && Ie != ke; ) {
            if (n[E + be] == n[E + be - Ve]) {
              for (var J = 0; J < Ce && n[E + J] == n[E + J - Ve]; ++J)
                ;
              if (J > be) {
                if (be = J, ue = Ve, J > mt)
                  break;
                for (var Qe = Math.min(Ve, J - 2), bn = 0, H = 0; H < Qe; ++H) {
                  var Sn = E - Ve + H & 32767, cr = I[Sn], lr = Sn - cr & 32767;
                  lr > bn && (bn = lr, ke = Sn);
                }
              }
            }
            Ie = ke, ke = I[Ie], Ve += Ie - ke & 32767;
          }
        if (ue) {
          we[le++] = 268435456 | Zi[be] << 18 | Oa[ue];
          var _s = Zi[be] & 31, vs = Oa[ue] & 31;
          U += ri[_s] + ii[vs], ++ge[257 + _s], ++_e[vs], Q = E + be, ++ce;
        } else
          we[le++] = n[E], ++ge[n[E]];
      }
    }
    for (E = Math.max(E, Q); E < o; ++E)
      we[le++] = n[E], ++ge[n[E]];
    u = Da(n, c, h, we, ge, _e, U, le, pe, E - pe, u), h || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = W, i.p = I, i.i = E, i.w = Q);
  } else {
    for (var E = i.w || 0; E < o + h; E += 65535) {
      var In = E + 65535;
      In >= o && (c[u / 8 | 0] = h, In = o), u = yl(c, u + 1, n.subarray(E, In));
    }
    i.i = o;
  }
  return ml(a, 0, s + Mo(u) + r);
}, rg = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, s = 9; --s; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), ig = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, s = 0; s < e.length; ++s)
        t = rg[t & 255 ^ e[s]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, og = function(n, e, t, s, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), o = new de(i.length + n.length);
    o.set(i), o.set(n, i.length), n = o, r.w = i.length;
  }
  return sg(n, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, s, r);
}, Ji = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, ag = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Ji(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var s = 0; s <= t.length; ++s)
      n[s + 10] = t.charCodeAt(s);
  }
}, cg = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && ze(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var s = (e >> 3 & 1) + (e >> 4 & 1); s > 0; s -= !n[t++])
    ;
  return t + (e & 2);
}, lg = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, hg = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function La(n, e) {
  e || (e = {});
  var t = ig(), s = n.length;
  t.p(n);
  var r = og(n, e, hg(e), 8), i = r.length;
  return ag(r, e), Ji(r, i - 8, t.d()), Ji(r, i - 4, s), r;
}
function Ra(n, e) {
  var t = cg(n);
  return t + 8 > n.length && ze(6, "invalid gzip data"), tg(n.subarray(t, -8), { i: 2 }, new de(lg(n)), e);
}
var ug = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), dg = 0;
try {
  ug.decode(wl, { stream: !0 }), dg = 1;
} catch {
}
const _l = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Nn(n, e, t) {
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
      return e.slice(0, o) + Nn(n.slice(o), e.slice(o), t);
  }
  const r = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - r > 1) {
    const o = Math.round(0.5 * (r + i));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Nn(n.slice(1), null, t);
}
function vl(n) {
  if (n.length !== kl(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function kl(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function xs(n) {
  const e = kl(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Na(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = xs(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Ma(n, e) {
  vl(n);
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
function fg(n, e) {
  vl(n);
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
function vt(n, e, t = _l) {
  if (n != null && Na(n, t), e != null && Na(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = xs(e), h = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Nn("", h, t);
    if (c < e)
      return c;
    const u = fg(c, t);
    if (u == null)
      throw new Error("cannot decrement any more");
    return u;
  }
  if (e == null) {
    const c = xs(n), h = n.slice(c.length), u = Ma(c, t);
    return u ?? c + Nn(h, null, t);
  }
  const s = xs(n), r = n.slice(s.length), i = xs(e), o = e.slice(i.length);
  if (s === i)
    return s + Nn(r, o, t);
  const a = Ma(s, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : s + Nn(r, null, t);
}
function Wi(n, e, t, s = _l) {
  if (t === 0)
    return [];
  if (t === 1)
    return [vt(n, e, s)];
  {
    let r = vt(n, e, s);
    const i = [r];
    for (let o = 0; o < t - 1; o++)
      r = vt(r, e, s), i.push(r);
    return i;
  }
}
const gg = Ga().int().nonnegative().optional();
function Ss(n) {
  var t;
  const e = gg.safeParse(n);
  if (!e.success)
    throw new P("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function bl(n, e, t, s) {
  const r = n.Id, i = new R();
  i.set("Kind", n.Kind), i.set("outerItemId", e), i.set("OrderKey", t), i.set("Label", new F(n.Label ?? ""));
  const o = new R();
  for (const [a, c] of Object.entries(n.Info ?? {}))
    o.set(a, c);
  if (i.set("Info", o), n.Kind === "item") {
    const a = n, c = a.Type === Tn ? "" : a.Type ?? "";
    switch (i.set("MIMEType", c), !0) {
      case (a.ValueKind === "literal" && a.Value !== void 0): {
        i.set("ValueKind", "literal"), i.set("literalValue", new F(a.Value));
        break;
      }
      case (a.ValueKind === "binary" && a.Value !== void 0): {
        i.set("ValueKind", "binary"), i.set("binaryValue", Ha(a.Value));
        break;
      }
      default:
        i.set("ValueKind", a.ValueKind ?? "none");
    }
    s.set(r, i);
    const h = Wi(null, null, (a.innerEntries ?? []).length);
    (a.innerEntries ?? []).forEach((u, f) => {
      bl(u, r, h[f], s);
    });
  } else {
    const a = n;
    i.set("TargetId", a.TargetId ?? ""), s.set(r, i);
  }
}
var nt, x, Js, Pn, bt, sn, Le, Ut, Bt, st, rt, Pr, rn, jt, on, p, An, Cs, Mt, vr, qi, Sl, Il, Ee, en, Dn, Ts, Ln, Es, Rn, xl, Gi, Cl, Yi, Xi, L, Tl, Qi, eo, El;
const nn = class nn extends Yl {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  /**** constructor — initialise store from document and options ****/
  constructor(t, s) {
    var i;
    super();
    _(this, p);
    /**** private state ****/
    _(this, nt);
    _(this, x);
    _(this, Js);
    _(this, Pn);
    _(this, bt, null);
    _(this, sn, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    _(this, Le, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId  (kept in sync with #ReverseIndex)
    _(this, Ut, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    _(this, Bt, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    _(this, st, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    _(this, rt, /* @__PURE__ */ new Map());
    _(this, Pr, Wl);
    // transaction nesting
    _(this, rn, 0);
    // ChangeSet accumulator inside a transaction
    _(this, jt, {});
    // suppress index updates / change tracking when applying remote patches
    _(this, on, !1);
    S(this, nt, t), S(this, x, t.getMap("Entries")), S(this, Js, (s == null ? void 0 : s.LiteralSizeLimit) ?? Hl), S(this, Pn, (s == null ? void 0 : s.TrashTTLms) ?? 2592e6), d(this, p, Sl).call(this);
    const r = (s == null ? void 0 : s.TrashCheckIntervalMs) ?? Math.min(Math.floor(l(this, Pn) / 4), 36e5);
    S(this, bt, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      r
    )), typeof ((i = l(this, bt)) == null ? void 0 : i.unref) == "function" && l(this, bt).unref();
  }
  /**** fromScratch — build initial document with three well-known items ****/
  static fromScratch(t) {
    const s = new Jt(), r = s.getMap("Entries");
    return s.transact(() => {
      const i = new R();
      i.set("Kind", "item"), i.set("outerItemId", ""), i.set("OrderKey", ""), i.set("Label", new F()), i.set("Info", new R()), i.set("MIMEType", ""), i.set("ValueKind", "none"), r.set(Oe, i);
      const o = new R();
      o.set("Kind", "item"), o.set("outerItemId", Oe), o.set("OrderKey", "a0"), o.set("Label", new F("trash")), o.set("Info", new R()), o.set("MIMEType", ""), o.set("ValueKind", "none"), r.set(q, o);
      const a = new R();
      a.set("Kind", "item"), a.set("outerItemId", Oe), a.set("OrderKey", "a1"), a.set("Label", new F("lost-and-found")), a.set("Info", new R()), a.set("MIMEType", ""), a.set("ValueKind", "none"), r.set(Te, a);
    }), new nn(s, t);
  }
  /**** fromBinary — restore store from compressed update ****/
  static fromBinary(t, s) {
    const r = new Jt();
    return wa(r, Ra(t)), new nn(r, s);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, s) {
    const r = typeof t == "string" ? JSON.parse(t) : t, i = new Jt(), o = i.getMap("Entries");
    return i.transact(() => {
      bl(r, "", "", o);
    }), new nn(i, s);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — access system items ****/
  get RootItem() {
    return d(this, p, Mt).call(this, Oe);
  }
  get TrashItem() {
    return d(this, p, Mt).call(this, q);
  }
  get LostAndFoundItem() {
    return d(this, p, Mt).call(this, Te);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve entry by Id ****/
  EntryWithId(t) {
    if (l(this, x).has(t))
      return d(this, p, Cs).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, s, r) {
    if (s == null) throw new P("invalid-argument", "outerItem must not be missing");
    const i = t ?? Tn;
    Ri(i), Ss(r), d(this, p, An).call(this, s.Id);
    const o = crypto.randomUUID(), a = d(this, p, Ln).call(this, s.Id, r), c = i === Tn ? "" : i;
    return this.transact(() => {
      const h = new R();
      h.set("Kind", "item"), h.set("outerItemId", s.Id), h.set("OrderKey", a), h.set("Label", new F()), h.set("Info", new R()), h.set("MIMEType", c), h.set("ValueKind", "none"), l(this, x).set(o, h), d(this, p, Ee).call(this, s.Id, o), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, o, "outerItem");
    }), d(this, p, Mt).call(this, o);
  }
  /**** newLinkAt — create link as inner link of outer data ****/
  newLinkAt(t, s, r) {
    if (t == null) throw new P("invalid-argument", "Target must not be missing");
    if (s == null) throw new P("invalid-argument", "outerItem must not be missing");
    Ss(r), d(this, p, An).call(this, t.Id), d(this, p, An).call(this, s.Id);
    const i = crypto.randomUUID(), o = d(this, p, Ln).call(this, s.Id, r);
    return this.transact(() => {
      const a = new R();
      a.set("Kind", "link"), a.set("outerItemId", s.Id), a.set("OrderKey", o), a.set("Label", new F()), a.set("Info", new R()), a.set("TargetId", t.Id), l(this, x).set(i, a), d(this, p, Ee).call(this, s.Id, i), d(this, p, Dn).call(this, t.Id, i), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, i, "outerItem");
    }), d(this, p, vr).call(this, i);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, s, r) {
    if (s == null) throw new P("invalid-argument", "outerItem must not be missing");
    Ss(r), d(this, p, An).call(this, s.Id);
    const i = t;
    if (i == null || i.Kind !== "item")
      throw new P("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const o = /* @__PURE__ */ new Map();
    d(this, p, Qi).call(this, i, o);
    const a = d(this, p, Ln).call(this, s.Id, r), c = o.get(i.Id);
    return this.transact(() => {
      d(this, p, eo).call(this, i, s.Id, a, o), d(this, p, L).call(this, s.Id, "innerEntryList");
    }), d(this, p, Mt).call(this, c);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, s, r) {
    if (s == null) throw new P("invalid-argument", "outerItem must not be missing");
    Ss(r), d(this, p, An).call(this, s.Id);
    const i = t;
    if (i == null || i.Kind !== "link")
      throw new P("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const o = crypto.randomUUID(), a = d(this, p, Ln).call(this, s.Id, r);
    return this.transact(() => {
      const c = new R();
      c.set("Kind", "link"), c.set("outerItemId", s.Id), c.set("OrderKey", a), c.set("Label", new F(i.Label ?? ""));
      const h = new R();
      for (const [u, f] of Object.entries(i.Info ?? {}))
        h.set(u, f);
      c.set("Info", h), c.set("TargetId", i.TargetId ?? ""), l(this, x).set(o, c), d(this, p, Ee).call(this, s.Id, o), i.TargetId && d(this, p, Dn).call(this, i.TargetId, o), d(this, p, L).call(this, s.Id, "innerEntryList");
    }), d(this, p, vr).call(this, o);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** moveEntryTo — move entry to new outer data and position ****/
  moveEntryTo(t, s, r) {
    if (Ss(r), !this._mayMoveEntryTo(t.Id, s.Id, r))
      throw new P(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const i = this._outerItemIdOf(t.Id), o = d(this, p, Ln).call(this, s.Id, r);
    this.transact(() => {
      const a = l(this, x).get(t.Id);
      if (a.set("outerItemId", s.Id), a.set("OrderKey", o), i === q && s.Id !== q) {
        const c = a.get("Info");
        c instanceof R && c.has("_trashedAt") && (c.delete("_trashedAt"), d(this, p, L).call(this, t.Id, "Info._trashedAt"));
      }
      i != null && (d(this, p, en).call(this, i, t.Id), d(this, p, L).call(this, i, "innerEntryList")), d(this, p, Ee).call(this, s.Id, t.Id), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const s = d(this, p, Rn).call(this, t);
    if (s.length === 0)
      return;
    const r = Wi(null, null, s.length);
    s.forEach((i, o) => {
      const a = l(this, x).get(i.Id);
      a != null && (a.set("OrderKey", r[o]), d(this, p, L).call(this, i.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new P("delete-not-permitted", "this entry cannot be deleted");
    const s = this._outerItemIdOf(t.Id), r = vt(d(this, p, Es).call(this, q), null);
    this.transact(() => {
      const i = l(this, x).get(t.Id);
      i.set("outerItemId", q), i.set("OrderKey", r);
      let o = i.get("Info");
      o instanceof R || (o = new R(), i.set("Info", o)), o.set("_trashedAt", Date.now()), s != null && (d(this, p, en).call(this, s, t.Id), d(this, p, L).call(this, s, "innerEntryList")), d(this, p, Ee).call(this, q, t.Id), d(this, p, L).call(this, q, "innerEntryList"), d(this, p, L).call(this, t.Id, "outerItem"), d(this, p, L).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry and subtree ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== q)
      throw new P(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, p, xl).call(this, t.Id))
      throw new P(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, p, Xi).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — remove trash items past TTL ****/
  purgeExpiredTrashEntries(t) {
    const s = t ?? l(this, Pn);
    if (s == null)
      return 0;
    const r = Date.now(), i = Array.from(l(this, Le).get(q) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const a of i) {
      const c = l(this, x).get(a);
      if (c == null || c.get("outerItemId") !== q)
        continue;
      const h = c.get("Info"), u = h instanceof R ? h.get("_trashedAt") : void 0;
      if (typeof u == "number" && !(r - u < s))
        try {
          this.purgeEntry(d(this, p, Cs).call(this, a)), o++;
        } catch {
        }
    }
    return o;
  }
  /**** dispose — stop background timer and remove all change listeners ****/
  dispose() {
    l(this, bt) != null && (clearInterval(l(this, bt)), S(this, bt, null)), l(this, sn).clear();
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback in batched transaction ****/
  transact(t) {
    hr(this, rn)._++;
    try {
      l(this, rn) === 1 && !l(this, on) ? l(this, nt).transact(() => {
        t();
      }) : t();
    } finally {
      if (hr(this, rn)._--, l(this, rn) === 0) {
        const s = { ...l(this, jt) };
        S(this, jt, {});
        const r = l(this, on) ? "external" : "internal";
        d(this, p, Tl).call(this, r, s);
      }
    }
  }
  /**** onChangeInvoke — subscribe to change events ****/
  onChangeInvoke(t) {
    return l(this, sn).add(t), () => {
      l(this, sn).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — apply remote changes and update indices ****/
  applyRemotePatch(t) {
    if (t.byteLength !== 0) {
      S(this, on, !0);
      try {
        wa(l(this, nt), t), this.transact(() => {
          d(this, p, Il).call(this);
        });
      } finally {
        S(this, on, !1);
      }
      this.recoverOrphans();
    }
  }
  /**** currentCursor — get state vector for sync ****/
  get currentCursor() {
    return Hd(l(this, nt));
  }
  /**** exportPatch — encode changes since cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? wi(l(this, nt)) : wi(l(this, nt), t);
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = new Set(l(this, x).keys());
    this.transact(() => {
      l(this, x).forEach((s, r) => {
        if (r === Oe)
          return;
        const i = s.get("outerItemId");
        if (i && !t.has(i)) {
          const o = vt(d(this, p, Es).call(this, Te), null);
          s.set("outerItemId", Te), s.set("OrderKey", o), d(this, p, Ee).call(this, Te, r), d(this, p, L).call(this, r, "outerItem"), d(this, p, L).call(this, Te, "innerEntryList");
        }
        if (s.get("Kind") === "link") {
          const o = s.get("TargetId");
          if (o && !t.has(o)) {
            const a = vt(d(this, p, Es).call(this, Te), null), c = new R();
            c.set("Kind", "item"), c.set("outerItemId", Te), c.set("OrderKey", a), c.set("Label", new F()), c.set("Info", new R()), c.set("MIMEType", ""), c.set("ValueKind", "none"), l(this, x).set(o, c), d(this, p, Ee).call(this, Te, o), t.add(o), d(this, p, L).call(this, Te, "innerEntryList");
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
    return La(wi(l(this, nt)));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, s, r) {
    const i = new TextDecoder().decode(Ra(t));
    return this.newEntryFromJSONat(JSON.parse(i), s, r);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const s = JSON.stringify(this._EntryAsJSON(t));
    return La(new TextEncoder().encode(s));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind ****/
  _KindOf(t) {
    const s = l(this, x).get(t);
    if (s == null)
      throw new P("not-found", `entry '${t}' not found`);
    return s.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const s = l(this, x).get(t);
    if (s == null)
      return "";
    const r = s.get("Label");
    return r instanceof F ? r.toString() : String(r ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, s) {
    Ya(s), this.transact(() => {
      const r = l(this, x).get(t);
      if (r == null)
        return;
      let i = r.get("Label");
      i instanceof F ? (i.delete(0, i.length), s.length > 0 && i.insert(0, s)) : (i = new F(s), r.set("Label", i)), d(this, p, L).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get data MIME type ****/
  _TypeOf(t) {
    const s = l(this, x).get(t), r = (s == null ? void 0 : s.get("MIMEType")) ?? "";
    return r === "" ? Tn : r;
  }
  /**** _setTypeOf — set data MIME type ****/
  _setTypeOf(t, s) {
    Ri(s);
    const r = s === Tn ? "" : s;
    this.transact(() => {
      var i;
      (i = l(this, x).get(t)) == null || i.set("MIMEType", r), d(this, p, L).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get data value kind ****/
  _ValueKindOf(t) {
    const s = l(this, x).get(t);
    return (s == null ? void 0 : s.get("ValueKind")) ?? "none";
  }
  /**** _readValueOf — get data value (literal or binary) ****/
  async _readValueOf(t) {
    const s = this._ValueKindOf(t);
    switch (!0) {
      case s === "none":
        return;
      case s === "literal": {
        const r = l(this, x).get(t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : i ?? "";
      }
      case s === "binary": {
        const r = l(this, x).get(t);
        return r == null ? void 0 : r.get("binaryValue");
      }
      default: {
        const r = this._getValueRefOf(t);
        if (r == null)
          return;
        const i = await this._getValueBlobAsync(r.Hash);
        return i == null ? void 0 : s === "literal-reference" ? new TextDecoder().decode(i) : i;
      }
    }
  }
  /**** _writeValueOf — set data value ****/
  _writeValueOf(t, s) {
    this.transact(() => {
      const r = l(this, x).get(t);
      if (r != null) {
        switch (!0) {
          case s == null: {
            r.set("ValueKind", "none");
            break;
          }
          case (typeof s == "string" && s.length <= l(this, Js)): {
            r.set("ValueKind", "literal");
            let i = r.get("literalValue");
            i instanceof F ? (i.delete(0, i.length), s.length > 0 && i.insert(0, s)) : (i = new F(s), r.set("literalValue", i));
            break;
          }
          case typeof s == "string": {
            const o = new TextEncoder().encode(s), a = nn._BLOBhash(o);
            this._storeValueBlob(a, o), r.set("ValueKind", "literal-reference"), r.set("ValueRef", { Hash: a, Size: o.byteLength });
            break;
          }
          case s.byteLength <= Jl: {
            r.set("ValueKind", "binary"), r.set("binaryValue", s);
            break;
          }
          default: {
            const i = s, o = nn._BLOBhash(i);
            this._storeValueBlob(o, i), r.set("ValueKind", "binary-reference"), r.set("ValueRef", { Hash: o, Size: i.byteLength });
            break;
          }
        }
        d(this, p, L).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value range ****/
  _spliceValueOf(t, s, r, i) {
    if (this._ValueKindOf(t) !== "literal")
      throw new P(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const o = l(this, x).get(t), a = o == null ? void 0 : o.get("literalValue");
      if (a instanceof F) {
        const c = r - s;
        c > 0 && a.delete(s, c), i.length > 0 && a.insert(s, i);
      }
      d(this, p, L).call(this, t, "Value");
    });
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const s = l(this, x).get(t);
    if (s == null)
      return;
    const r = this._ValueKindOf(t);
    if (!(r !== "literal-reference" && r !== "binary-reference"))
      return s.get("ValueRef");
  }
  /**** _InfoProxyOf — get info metadata proxy object ****/
  _InfoProxyOf(t) {
    const s = this;
    return new Proxy({}, {
      get(r, i) {
        if (typeof i != "string")
          return;
        const o = l(s, x).get(t), a = o == null ? void 0 : o.get("Info");
        return a instanceof R ? a.get(i) : void 0;
      },
      set(r, i, o) {
        return typeof i != "string" ? !1 : o === void 0 ? (s.transact(() => {
          var h;
          const a = l(s, x).get(t), c = a == null ? void 0 : a.get("Info");
          c instanceof R && c.has(i) && (c.delete(i), d(h = s, p, L).call(h, t, `Info.${i}`));
        }), !0) : (Rh(i), Nh(o), s.transact(() => {
          var h;
          const a = l(s, x).get(t);
          if (a == null)
            return;
          let c = a.get("Info");
          c instanceof R || (c = new R(), a.set("Info", c)), c.set(i, o), d(h = s, p, L).call(h, t, `Info.${i}`);
        }), !0);
      },
      deleteProperty(r, i) {
        return typeof i != "string" ? !1 : (s.transact(() => {
          var c;
          const o = l(s, x).get(t), a = o == null ? void 0 : o.get("Info");
          a instanceof R && a.has(i) && (a.delete(i), d(c = s, p, L).call(c, t, `Info.${i}`));
        }), !0);
      },
      ownKeys() {
        const r = l(s, x).get(t), i = r == null ? void 0 : r.get("Info");
        return i instanceof R ? Array.from(i.keys()) : [];
      },
      getOwnPropertyDescriptor(r, i) {
        if (typeof i != "string")
          return;
        const o = l(s, x).get(t), a = o == null ? void 0 : o.get("Info");
        if (!(a instanceof R))
          return;
        const c = a.get(i);
        return c !== void 0 ? { configurable: !0, enumerable: !0, value: c } : void 0;
      }
    });
  }
  /**** _outerItemIdOf — get outer item Id ****/
  _outerItemIdOf(t) {
    const s = l(this, x).get(t), r = s == null ? void 0 : s.get("outerItemId");
    return r != null && r !== "" ? r : void 0;
  }
  /**** _innerEntriesOf — get sorted children as array-like proxy ****/
  _innerEntriesOf(t) {
    const s = this, r = d(this, p, Rn).call(this, t);
    return new Proxy([], {
      get(i, o) {
        var a;
        if (o === "length")
          return r.length;
        if (o === Symbol.iterator)
          return function* () {
            var c;
            for (let h = 0; h < r.length; h++)
              yield d(c = s, p, Cs).call(c, r[h].Id);
          };
        if (typeof o == "string" && !isNaN(Number(o))) {
          const c = Number(o);
          return c >= 0 && c < r.length ? d(a = s, p, Cs).call(a, r[c].Id) : void 0;
        }
        return i[o];
      }
    });
  }
  /**** _mayMoveEntryTo — check move validity ****/
  _mayMoveEntryTo(t, s, r) {
    return t === Oe || t === s ? !1 : t === q || t === Te ? s === Oe : !d(this, p, El).call(this, s, t);
  }
  /**** _mayDeleteEntry — check delete validity ****/
  _mayDeleteEntry(t) {
    return t !== Oe && t !== q && t !== Te;
  }
  /**** _TargetOf — get link target data ****/
  _TargetOf(t) {
    const s = l(this, x).get(t), r = s == null ? void 0 : s.get("TargetId");
    if (r == null || r === "")
      throw new P("not-found", `link '${t}' has no target`);
    return d(this, p, Mt).call(this, r);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const s = this._ValueKindOf(t);
    switch (!0) {
      case s === "literal": {
        const r = l(this, x).get(t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : i ?? "";
      }
      case s === "binary": {
        const r = l(this, x).get(t);
        return r == null ? void 0 : r.get("binaryValue");
      }
      default:
        return;
    }
  }
};
nt = new WeakMap(), x = new WeakMap(), Js = new WeakMap(), Pn = new WeakMap(), bt = new WeakMap(), sn = new WeakMap(), Le = new WeakMap(), Ut = new WeakMap(), Bt = new WeakMap(), st = new WeakMap(), rt = new WeakMap(), Pr = new WeakMap(), rn = new WeakMap(), jt = new WeakMap(), on = new WeakMap(), p = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #requireItemExists — throw if data does not exist ****/
An = function(t) {
  const s = l(this, x).get(t);
  if (s == null || s.get("Kind") !== "item")
    throw new P("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped — return cached wrapper objects ****/
Cs = function(t) {
  const s = l(this, x).get(t);
  if (s == null)
    throw new P("invalid-argument", `entry '${t}' not found`);
  return s.get("Kind") === "item" ? d(this, p, Mt).call(this, t) : d(this, p, vr).call(this, t);
}, /**** #wrappedItem — return or create cached wrapper for data ****/
Mt = function(t) {
  const s = l(this, rt).get(t);
  if (s instanceof na)
    return s;
  const r = new na(this, t);
  return d(this, p, qi).call(this, t, r), r;
}, /**** #wrappedLink — return or create cached wrapper for link ****/
vr = function(t) {
  const s = l(this, rt).get(t);
  if (s instanceof sa)
    return s;
  const r = new sa(this, t);
  return d(this, p, qi).call(this, t, r), r;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
qi = function(t, s) {
  if (l(this, rt).size >= l(this, Pr)) {
    const r = l(this, rt).keys().next().value;
    r != null && l(this, rt).delete(r);
  }
  l(this, rt).set(t, s);
}, /**** #rebuildIndices — full rebuild used during construction ****/
Sl = function() {
  l(this, Le).clear(), l(this, Ut).clear(), l(this, Bt).clear(), l(this, st).clear(), l(this, x).forEach((t, s) => {
    const r = t.get("outerItemId");
    if (r && d(this, p, Ee).call(this, r, s), t.get("Kind") === "link") {
      const i = t.get("TargetId");
      i && d(this, p, Dn).call(this, i, s);
    }
  });
}, /**** #updateIndicesFromView — incremental diff after remote patches ****/
Il = function() {
  const t = /* @__PURE__ */ new Set();
  l(this, x).forEach((i, o) => {
    t.add(o);
    const a = i.get("outerItemId") || void 0, c = l(this, Ut).get(o);
    switch (a !== c && (c != null && (d(this, p, en).call(this, c, o), d(this, p, L).call(this, c, "innerEntryList")), a != null && (d(this, p, Ee).call(this, a, o), d(this, p, L).call(this, a, "innerEntryList")), d(this, p, L).call(this, o, "outerItem")), !0) {
      case i.get("Kind") === "link": {
        const h = i.get("TargetId"), u = l(this, st).get(o);
        h !== u && (u != null && d(this, p, Ts).call(this, u, o), h != null && d(this, p, Dn).call(this, h, o));
        break;
      }
      case l(this, st).has(o):
        d(this, p, Ts).call(this, l(this, st).get(o), o);
        break;
    }
    d(this, p, L).call(this, o, "Label");
  });
  const s = Array.from(l(this, Ut).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of s)
    d(this, p, en).call(this, o, i), d(this, p, L).call(this, o, "innerEntryList");
  const r = Array.from(l(this, st).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of r)
    d(this, p, Ts).call(this, o, i);
}, /**** #addToReverseIndex — add entry to reverse index ****/
Ee = function(t, s) {
  let r = l(this, Le).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), l(this, Le).set(t, r)), r.add(s), l(this, Ut).set(s, t);
}, /**** #removeFromReverseIndex — remove entry from reverse index ****/
en = function(t, s) {
  var r;
  (r = l(this, Le).get(t)) == null || r.delete(s), l(this, Ut).delete(s);
}, /**** #addToLinkTargetIndex — add link to target index ****/
Dn = function(t, s) {
  let r = l(this, Bt).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), l(this, Bt).set(t, r)), r.add(s), l(this, st).set(s, t);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
Ts = function(t, s) {
  var r;
  (r = l(this, Bt).get(t)) == null || r.delete(s), l(this, st).delete(s);
}, /**** #OrderKeyAt — generate fractional key at insertion position ****/
Ln = function(t, s) {
  const r = (a) => {
    if (a.length === 0 || s == null) {
      const h = a.length > 0 ? a[a.length - 1].OrderKey : null;
      return vt(h, null);
    }
    const c = Math.max(0, Math.min(s, a.length));
    return vt(
      c > 0 ? a[c - 1].OrderKey : null,
      c < a.length ? a[c].OrderKey : null
    );
  };
  let i = d(this, p, Rn).call(this, t);
  const o = r(i);
  return o.length <= ql ? o : (this._rebalanceInnerEntriesOf(t), r(d(this, p, Rn).call(this, t)));
}, /**** #lastOrderKeyOf — get last inner entry's order key ****/
Es = function(t) {
  const s = d(this, p, Rn).call(this, t);
  return s.length > 0 ? s[s.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/
Rn = function(t) {
  const s = l(this, Le).get(t) ?? /* @__PURE__ */ new Set(), r = [];
  for (const i of s) {
    const o = l(this, x).get(i);
    (o == null ? void 0 : o.get("outerItemId")) === t && r.push({ Id: i, OrderKey: o.get("OrderKey") ?? "" });
  }
  return r.sort((i, o) => i.OrderKey < o.OrderKey ? -1 : i.OrderKey > o.OrderKey ? 1 : i.Id < o.Id ? -1 : i.Id > o.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
xl = function(t) {
  const s = d(this, p, Yi).call(this), r = /* @__PURE__ */ new Set();
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const o of l(this, Le).get(q) ?? /* @__PURE__ */ new Set())
      r.has(o) || d(this, p, Gi).call(this, o, s, r) && (r.add(o), i = !0);
  }
  return r.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has root-reachable links ****/
Gi = function(t, s, r) {
  const i = [t], o = /* @__PURE__ */ new Set();
  for (; i.length > 0; ) {
    const a = i.pop();
    if (o.has(a))
      continue;
    o.add(a);
    const c = l(this, Bt).get(a) ?? /* @__PURE__ */ new Set();
    for (const h of c) {
      if (s.has(h))
        return !0;
      const u = d(this, p, Cl).call(this, h);
      if (u != null && r.has(u))
        return !0;
    }
    for (const h of l(this, Le).get(a) ?? /* @__PURE__ */ new Set())
      o.has(h) || i.push(h);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
Cl = function(t) {
  let s = t;
  for (; s != null; ) {
    const r = this._outerItemIdOf(s);
    if (r === q)
      return s;
    if (r === Oe || r == null)
      return null;
    s = r;
  }
  return null;
}, /**** #reachableFromRoot — compute live-tree entries reachable from root ****/
// TrashItem is included (it is a direct child of Root) but its subtree is
// NOT traversed — entries inside Trash are not considered "live" and must
// not protect other entries from being purged.
Yi = function() {
  const t = /* @__PURE__ */ new Set(), s = [Oe];
  for (; s.length > 0; ) {
    const r = s.pop();
    if (!t.has(r) && (t.add(r), r !== q))
      for (const i of l(this, Le).get(r) ?? /* @__PURE__ */ new Set())
        t.has(i) || s.push(i);
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Xi = function(t) {
  const s = l(this, x).get(t);
  if (s == null)
    return;
  const r = s.get("Kind"), i = s.get("outerItemId"), o = d(this, p, Yi).call(this), a = /* @__PURE__ */ new Set(), c = Array.from(l(this, Le).get(t) ?? /* @__PURE__ */ new Set());
  for (const h of c)
    if (d(this, p, Gi).call(this, h, o, a)) {
      const u = l(this, x).get(h), f = vt(d(this, p, Es).call(this, q), null);
      u.set("outerItemId", q), u.set("OrderKey", f), d(this, p, en).call(this, t, h), d(this, p, Ee).call(this, q, h), d(this, p, L).call(this, q, "innerEntryList"), d(this, p, L).call(this, h, "outerItem");
    } else
      d(this, p, Xi).call(this, h);
  if (d(this, p, L).call(this, t, "Existence"), l(this, x).delete(t), i && (d(this, p, en).call(this, i, t), d(this, p, L).call(this, i, "innerEntryList")), r === "link") {
    const h = s.get("TargetId");
    h && d(this, p, Ts).call(this, h, t);
  }
  l(this, rt).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
L = function(t, s) {
  l(this, jt)[t] == null && (l(this, jt)[t] = /* @__PURE__ */ new Set()), l(this, jt)[t].add(s);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
Tl = function(t, s) {
  if (Object.keys(s).length !== 0)
    for (const r of l(this, sn))
      try {
        r(t, s);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
Qi = function(t, s) {
  if (s.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const r of t.innerEntries ?? [])
      d(this, p, Qi).call(this, r, s);
}, /**** #importEntryFromJSON — recursively create a Y.js entry and update indices ****/
eo = function(t, s, r, i) {
  const o = i.get(t.Id), a = new R();
  a.set("Kind", t.Kind), a.set("outerItemId", s), a.set("OrderKey", r), a.set("Label", new F(t.Label ?? ""));
  const c = new R();
  for (const [h, u] of Object.entries(t.Info ?? {}))
    c.set(h, u);
  if (a.set("Info", c), t.Kind === "item") {
    const h = t, u = h.Type === Tn ? "" : h.Type ?? "";
    switch (a.set("MIMEType", u), !0) {
      case (h.ValueKind === "literal" && h.Value !== void 0): {
        a.set("ValueKind", "literal"), a.set("literalValue", new F(h.Value));
        break;
      }
      case (h.ValueKind === "binary" && h.Value !== void 0): {
        a.set("ValueKind", "binary"), a.set("binaryValue", Ha(h.Value));
        break;
      }
      default:
        a.set("ValueKind", h.ValueKind ?? "none");
    }
    l(this, x).set(o, a), d(this, p, Ee).call(this, s, o);
    const f = Wi(null, null, (h.innerEntries ?? []).length);
    (h.innerEntries ?? []).forEach((g, m) => {
      d(this, p, eo).call(this, g, o, f[m], i);
    });
  } else {
    const h = t, u = i.has(h.TargetId) ? i.get(h.TargetId) : h.TargetId;
    a.set("TargetId", u ?? ""), l(this, x).set(o, a), d(this, p, Ee).call(this, s, o), u && d(this, p, Dn).call(this, u, o);
  }
}, /**** #isDescendantOf — check ancestor relationship ****/
El = function(t, s) {
  let r = t;
  for (; r != null; ) {
    if (r === s)
      return !0;
    r = this._outerItemIdOf(r);
  }
  return !1;
};
let Va = nn;
const $a = 1, Ua = 2, Ba = 3, ja = 4, Pa = 5, Ka = 6, tt = 32, gr = 1024 * 1024;
function xi(...n) {
  const e = n.reduce((r, i) => r + i.byteLength, 0), t = new Uint8Array(e);
  let s = 0;
  for (const r of n)
    t.set(r, s), s += r.byteLength;
  return t;
}
function Cn(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function Fa(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function Za(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var St, It, Ws, Kn, an, Fn, cn, Zn, zn, Hn, Jn, qs, z, to, tn, Os, Ol, Al, Dl;
class wg {
  /**** constructor ****/
  constructor(e) {
    _(this, z);
    Lt(this, "StoreId");
    _(this, St, "disconnected");
    _(this, It);
    _(this, Ws, "");
    _(this, Kn);
    _(this, an);
    _(this, Fn, /* @__PURE__ */ new Set());
    _(this, cn, /* @__PURE__ */ new Set());
    _(this, Zn, /* @__PURE__ */ new Set());
    _(this, zn, /* @__PURE__ */ new Set());
    _(this, Hn, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    _(this, Jn, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    _(this, qs, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, St);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SDS WebSocket: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return S(this, Ws, e), S(this, Kn, t), d(this, z, to).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, z, Al).call(this), d(this, z, Os).call(this, "disconnected"), (e = l(this, It)) == null || e.close(), S(this, It, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, z, tn).call(this, Cn($a, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const s = Fa(e);
    if (t.byteLength <= gr)
      d(this, z, tn).call(this, Cn(Ua, xi(s, t)));
    else {
      const r = Math.ceil(t.byteLength / gr);
      for (let i = 0; i < r; i++) {
        const o = i * gr, a = t.slice(o, o + gr), c = new Uint8Array(tt + 8);
        c.set(s, 0), new DataView(c.buffer).setUint32(tt, i, !1), new DataView(c.buffer).setUint32(tt + 4, r, !1), d(this, z, tn).call(this, Cn(Pa, xi(c, a)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, z, tn).call(this, Cn(Ba, Fa(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return l(this, Fn).add(e), () => {
      l(this, Fn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, cn).add(e), () => {
      l(this, cn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Zn).add(e), () => {
      l(this, Zn).delete(e);
    };
  }
  /**** sendSyncRequest ****/
  sendSyncRequest(e) {
    d(this, z, tn).call(this, Cn(Ka, e));
  }
  /**** onSyncRequest ****/
  onSyncRequest(e) {
    return l(this, Hn).add(e), () => {
      l(this, Hn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, z, tn).call(this, Cn(ja, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return l(this, zn).add(e), () => {
      l(this, zn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, qs);
  }
}
St = new WeakMap(), It = new WeakMap(), Ws = new WeakMap(), Kn = new WeakMap(), an = new WeakMap(), Fn = new WeakMap(), cn = new WeakMap(), Zn = new WeakMap(), zn = new WeakMap(), Hn = new WeakMap(), Jn = new WeakMap(), qs = new WeakMap(), z = new WeakSet(), /**** #doConnect ****/
to = function() {
  return new Promise((e, t) => {
    const r = `${l(this, Ws).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(l(this, Kn).Token)}`, i = new WebSocket(r);
    i.binaryType = "arraybuffer", S(this, It, i), d(this, z, Os).call(this, "connecting"), i.onopen = () => {
      d(this, z, Os).call(this, "connected"), e();
    }, i.onerror = (o) => {
      l(this, St) === "connecting" && t(new Error("WebSocket connection failed"));
    }, i.onclose = () => {
      S(this, It, void 0), l(this, St) !== "disconnected" && (d(this, z, Os).call(this, "reconnecting"), d(this, z, Ol).call(this));
    }, i.onmessage = (o) => {
      d(this, z, Dl).call(this, new Uint8Array(o.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
tn = function(e) {
  var t;
  ((t = l(this, It)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, It).send(e);
}, /**** #setState ****/
Os = function(e) {
  if (l(this, St) !== e) {
    S(this, St, e);
    for (const t of l(this, Zn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Ol = function() {
  var t;
  const e = ((t = l(this, Kn)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  S(this, an, setTimeout(() => {
    l(this, St) === "reconnecting" && d(this, z, to).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Al = function() {
  l(this, an) != null && (clearTimeout(l(this, an)), S(this, an, void 0));
}, /**** #handleFrame ****/
Dl = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], s = e.slice(1);
  switch (t) {
    case $a: {
      for (const r of l(this, Fn))
        try {
          r(s);
        } catch {
        }
      break;
    }
    case Ua: {
      if (s.byteLength < tt)
        return;
      const r = Za(s.slice(0, tt)), i = s.slice(tt);
      for (const o of l(this, cn))
        try {
          o(r, i);
        } catch {
        }
      break;
    }
    case Ba:
      break;
    case ja: {
      try {
        const r = JSON.parse(new TextDecoder().decode(s));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), l(this, qs).set(r.PeerId, r);
        for (const i of l(this, zn))
          try {
            i(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case Ka: {
      for (const r of l(this, Hn))
        try {
          r(s);
        } catch {
        }
      break;
    }
    case Pa: {
      if (s.byteLength < tt + 8)
        return;
      const r = Za(s.slice(0, tt)), i = new DataView(s.buffer, s.byteOffset + tt, 8), o = i.getUint32(0, !1), a = i.getUint32(4, !1), c = s.slice(tt + 8);
      let h = l(this, Jn).get(r);
      if (h == null && (h = { total: a, chunks: /* @__PURE__ */ new Map() }, l(this, Jn).set(r, h)), h.chunks.set(o, c), h.chunks.size === h.total) {
        const u = xi(
          ...Array.from({ length: h.total }, (f, g) => h.chunks.get(g))
        );
        l(this, Jn).delete(r);
        for (const f of l(this, cn))
          try {
            f(r, u);
          } catch {
          }
      }
      break;
    }
  }
};
var Gs, He, ee, Pt, it, $e, Kt, Wn, qn, Gn, ln, Yn, Xn, ve, $, As, Ds, Ll, Rl, Nl, no, so, Ml, ro, Vl;
class _g {
  /**** Constructor ****/
  constructor(e, t = {}) {
    _(this, $);
    Lt(this, "StoreId");
    _(this, Gs);
    _(this, He, crypto.randomUUID());
    _(this, ee);
    /**** Signalling WebSocket ****/
    _(this, Pt);
    /**** active RTCPeerConnection per remote PeerId ****/
    _(this, it, /* @__PURE__ */ new Map());
    _(this, $e, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    _(this, Kt, "disconnected");
    /**** Event Handlers ****/
    _(this, Wn, /* @__PURE__ */ new Set());
    _(this, qn, /* @__PURE__ */ new Set());
    _(this, Gn, /* @__PURE__ */ new Set());
    _(this, ln, /* @__PURE__ */ new Set());
    _(this, Yn, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    _(this, Xn, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    _(this, ve, !1);
    this.StoreId = e, S(this, Gs, t), S(this, ee, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, Kt);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(e))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${e}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((s, r) => {
      const i = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(i);
      S(this, Pt, o), d(this, $, As).call(this, "connecting"), o.onopen = () => {
        d(this, $, As).call(this, "connected"), d(this, $, Ds).call(this, { type: "hello", from: l(this, He) }), s();
      }, o.onerror = () => {
        if (!l(this, ve) && l(this, ee) != null) {
          const a = e.replace("/signal/", "/ws/");
          S(this, ve, !0), l(this, ee).connect(a, t).then(s).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        l(this, Kt) !== "disconnected" && (d(this, $, As).call(this, "reconnecting"), setTimeout(() => {
          l(this, Kt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (a) => {
        try {
          const c = JSON.parse(a.data);
          d(this, $, Ll).call(this, c, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, $, As).call(this, "disconnected"), (e = l(this, Pt)) == null || e.close(), S(this, Pt, void 0);
    for (const t of l(this, it).values())
      t.close();
    l(this, it).clear(), l(this, $e).clear(), l(this, ve) && l(this, ee) != null && (l(this, ee).disconnect(), S(this, ve, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var s;
    if (l(this, ve)) {
      (s = l(this, ee)) == null || s.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of l(this, $e).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var i;
    if (l(this, ve)) {
      (i = l(this, ee)) == null || i.sendValue(e, t);
      return;
    }
    const s = d(this, $, ro).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(s, 1), r.set(t, 33);
    for (const o of l(this, $e).values())
      if (o.readyState === "open")
        try {
          o.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (l(this, ve)) {
      (r = l(this, ee)) == null || r.requestValue(e);
      return;
    }
    const t = d(this, $, ro).call(this, e), s = new Uint8Array(33);
    s[0] = 3, s.set(t, 1);
    for (const i of l(this, $e).values())
      if (i.readyState === "open")
        try {
          i.send(s);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return l(this, Wn).add(e), l(this, ve) && l(this, ee) != null ? l(this, ee).onPatch(e) : () => {
      l(this, Wn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, qn).add(e), l(this, ve) && l(this, ee) != null ? l(this, ee).onValue(e) : () => {
      l(this, qn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Gn).add(e), () => {
      l(this, Gn).delete(e);
    };
  }
  /**** sendSyncRequest ****/
  sendSyncRequest(e) {
    var s;
    if (l(this, ve)) {
      (s = l(this, ee)) == null || s.sendSyncRequest(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 6, t.set(e, 1);
    for (const r of l(this, $e).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** onSyncRequest ****/
  onSyncRequest(e) {
    return l(this, Yn).add(e), l(this, ve) && l(this, ee) != null ? l(this, ee).onSyncRequest(e) : () => {
      l(this, Yn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (l(this, ve)) {
      (r = l(this, ee)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), s = new Uint8Array(1 + t.byteLength);
    s[0] = 4, s.set(t, 1);
    for (const i of l(this, $e).values())
      if (i.readyState === "open")
        try {
          i.send(s);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return l(this, ln).add(e), () => {
      l(this, ln).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, Xn);
  }
}
Gs = new WeakMap(), He = new WeakMap(), ee = new WeakMap(), Pt = new WeakMap(), it = new WeakMap(), $e = new WeakMap(), Kt = new WeakMap(), Wn = new WeakMap(), qn = new WeakMap(), Gn = new WeakMap(), ln = new WeakMap(), Yn = new WeakMap(), Xn = new WeakMap(), ve = new WeakMap(), $ = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
As = function(e) {
  if (l(this, Kt) !== e) {
    S(this, Kt, e);
    for (const t of l(this, Gn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
Ds = function(e) {
  var t;
  ((t = l(this, Pt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, Pt).send(JSON.stringify(e));
}, Ll = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === l(this, He))
        return;
      l(this, it).has(e.from) || await d(this, $, Rl).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== l(this, He))
        return;
      await d(this, $, Nl).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== l(this, He))
        return;
      const s = l(this, it).get(e.from);
      s != null && await s.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== l(this, He))
        return;
      const s = l(this, it).get(e.from);
      s != null && await s.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, Rl = async function(e) {
  const t = d(this, $, no).call(this, e), s = t.createDataChannel("sds", { ordered: !1, maxRetransmits: 0 });
  d(this, $, so).call(this, s, e), l(this, $e).set(e, s);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, $, Ds).call(this, { type: "offer", from: l(this, He), to: e, sdp: r });
}, Nl = async function(e, t) {
  const s = d(this, $, no).call(this, e);
  await s.setRemoteDescription(new RTCSessionDescription(t));
  const r = await s.createAnswer();
  await s.setLocalDescription(r), d(this, $, Ds).call(this, { type: "answer", from: l(this, He), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
no = function(e) {
  const t = l(this, Gs).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], s = new RTCPeerConnection({ iceServers: t });
  return l(this, it).set(e, s), s.onicecandidate = (r) => {
    r.candidate != null && d(this, $, Ds).call(this, {
      type: "candidate",
      from: l(this, He),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, s.ondatachannel = (r) => {
    d(this, $, so).call(this, r.channel, e), l(this, $e).set(e, r.channel);
  }, s.onconnectionstatechange = () => {
    if (s.connectionState === "failed" || s.connectionState === "closed") {
      l(this, it).delete(e), l(this, $e).delete(e), l(this, Xn).delete(e);
      for (const r of l(this, ln))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, s;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
so = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (s) => {
    const r = new Uint8Array(s.data);
    d(this, $, Ml).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Ml = function(e, t) {
  if (e.byteLength < 1)
    return;
  const s = e[0], r = e.slice(1);
  switch (s) {
    case 1: {
      for (const i of l(this, Wn))
        try {
          i(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const i = d(this, $, Vl).call(this, r.slice(0, 32)), o = r.slice(32);
      for (const a of l(this, qn))
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
        i.lastSeen = Date.now(), l(this, Xn).set(i.PeerId, i);
        for (const o of l(this, ln))
          try {
            o(i.PeerId, i);
          } catch {
          }
      } catch {
      }
      break;
    }
    case 6: {
      for (const i of l(this, Yn))
        try {
          i(r);
        } catch {
        }
      break;
    }
  }
}, /**** #hexToBytes ****/
ro = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let s = 0; s < e.length; s += 2)
    t[s / 2] = parseInt(e.slice(s, s + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Vl = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Ze(n) {
  return new Promise((e, t) => {
    n.onsuccess = () => {
      e(n.result);
    }, n.onerror = () => {
      t(n.error);
    };
  });
}
function Nt(n, e, t) {
  return n.transaction(e, t);
}
var xt, Je, Ys, We, _t;
class vg {
  /**** constructor ****/
  constructor(e) {
    _(this, We);
    _(this, xt);
    _(this, Je);
    _(this, Ys);
    S(this, Je, e), S(this, Ys, `sds:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, We, _t).call(this), t = Nt(e, ["snapshots"], "readonly"), s = await Ze(
      t.objectStore("snapshots").get(l(this, Je))
    );
    return s != null ? s.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e, t) {
    const s = await d(this, We, _t).call(this), r = Nt(s, ["snapshots"], "readwrite");
    await Ze(
      r.objectStore("snapshots").put({
        storeId: l(this, Je),
        data: e,
        clock: t ?? 0
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await d(this, We, _t).call(this), r = Nt(t, ["patches"], "readonly").objectStore("patches"), i = IDBKeyRange.bound(
      [l(this, Je), e + 1],
      [l(this, Je), Number.MAX_SAFE_INTEGER]
    );
    return (await Ze(
      r.getAll(i)
    )).sort((a, c) => a.clock - c.clock).map((a) => a.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const s = await d(this, We, _t).call(this), r = Nt(s, ["patches"], "readwrite");
    try {
      await Ze(
        r.objectStore("patches").add({
          storeId: l(this, Je),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await d(this, We, _t).call(this), r = Nt(t, ["patches"], "readwrite").objectStore("patches"), i = IDBKeyRange.bound(
      [l(this, Je), 0],
      [l(this, Je), e - 1]
    );
    await new Promise((o, a) => {
      const c = r.openCursor(i);
      c.onsuccess = () => {
        const h = c.result;
        if (h === null) {
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
    const t = await d(this, We, _t).call(this), s = Nt(t, ["values"], "readonly"), r = await Ze(
      s.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const s = await d(this, We, _t).call(this), i = Nt(s, ["values"], "readwrite").objectStore("values"), o = await Ze(
      i.get(e)
    );
    o != null ? await Ze(
      i.put({ hash: e, data: o.data, ref_count: o.ref_count + 1 })
    ) : await Ze(
      i.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await d(this, We, _t).call(this), r = Nt(t, ["values"], "readwrite").objectStore("values"), i = await Ze(
      r.get(e)
    );
    if (i == null)
      return;
    const o = i.ref_count - 1;
    o <= 0 ? await Ze(r.delete(e)) : await Ze(
      r.put({ hash: e, data: i.data, ref_count: o })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = l(this, xt)) == null || e.close(), S(this, xt, void 0);
  }
}
xt = new WeakMap(), Je = new WeakMap(), Ys = new WeakMap(), We = new WeakSet(), _t = async function() {
  return l(this, xt) != null ? l(this, xt) : new Promise((e, t) => {
    const s = indexedDB.open(l(this, Ys), 1);
    s.onupgradeneeded = (r) => {
      const i = r.target.result;
      i.objectStoreNames.contains("snapshots") || i.createObjectStore("snapshots", { keyPath: "storeId" }), i.objectStoreNames.contains("patches") || i.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), i.objectStoreNames.contains("values") || i.createObjectStore("values", { keyPath: "hash" });
    }, s.onsuccess = (r) => {
      S(this, xt, r.target.result), e(l(this, xt));
    }, s.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const pg = 512 * 1024;
var G, Y, B, hn, Qn, es, Xs, Qs, ts, ns, qe, un, dn, fn, gn, Ct, Ft, Ge, er, ss, ot, at, ct, j, $l, Ul, Bl, jl, Pl, io, Kl, oo, ao, Fl, co;
class kg {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    _(this, j);
    _(this, G);
    _(this, Y);
    _(this, B);
    _(this, hn);
    _(this, Qn);
    Lt(this, "PeerId", crypto.randomUUID());
    _(this, es);
    _(this, Xs);
    _(this, Qs, []);
    // outgoing patch queue (patches created while disconnected)
    _(this, ts, 0);
    // accumulated patch bytes since last checkpoint
    _(this, ns, 0);
    // sequence number of the last saved snapshot
    _(this, qe, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    _(this, un, new Uint8Array(0));
    // heartbeat timer
    _(this, dn);
    _(this, fn);
    // presence peer tracking
    _(this, gn, /* @__PURE__ */ new Map());
    _(this, Ct, /* @__PURE__ */ new Map());
    _(this, Ft, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    _(this, Ge);
    // connection state mirror
    _(this, er, "disconnected");
    _(this, ss, /* @__PURE__ */ new Set());
    // pending sync-response timer (random delay before answering a sync request)
    _(this, ot);
    // unsubscribe functions for registered handlers
    _(this, at, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    _(this, ct, /* @__PURE__ */ new Map());
    var r;
    S(this, G, e), S(this, Y, t.PersistenceProvider ?? void 0), S(this, B, t.NetworkProvider ?? void 0), S(this, hn, t.PresenceProvider ?? (typeof ((r = t.NetworkProvider) == null ? void 0 : r.onRemoteState) == "function" ? t.NetworkProvider : void 0)), S(this, Qn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && l(this, B) != null && S(this, Ge, new BroadcastChannel(`sds:${l(this, B).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    if (l(this, Y) != null) {
      const e = l(this, Y);
      l(this, G).setValueBlobLoader((t) => e.loadValue(t));
    }
    await d(this, j, $l).call(this), d(this, j, Ul).call(this), d(this, j, Bl).call(this), d(this, j, jl).call(this), d(this, j, Pl).call(this), l(this, B) != null && l(this, B).onConnectionChange((e) => {
      S(this, er, e);
      for (const t of l(this, ss))
        try {
          t(e);
        } catch (s) {
          console.error("[SDS] connection-change handler threw:", s.message ?? s);
        }
      e === "connected" && (d(this, j, Kl).call(this), l(this, B).sendSyncRequest(l(this, G).currentCursor));
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, s;
    l(this, ot) != null && (clearTimeout(l(this, ot)), S(this, ot, void 0)), l(this, dn) != null && (clearInterval(l(this, dn)), S(this, dn, void 0));
    for (const r of l(this, Ct).values())
      clearTimeout(r);
    l(this, Ct).clear();
    for (const r of l(this, at))
      try {
        r();
      } catch {
      }
    S(this, at, []), (e = l(this, Ge)) == null || e.close(), S(this, Ge, void 0), (t = l(this, B)) == null || t.disconnect(), l(this, Y) != null && await d(this, j, io).call(this), await ((s = l(this, Y)) == null ? void 0 : s.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (l(this, B) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    S(this, es, e), S(this, Xs, t), await l(this, B).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (l(this, B) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    l(this, B).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (l(this, B) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    if (l(this, es) == null)
      throw new P(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await l(this, B).connect(l(this, es), l(this, Xs));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, er);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, ss).add(e), () => {
      l(this, ss).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var s, r;
    S(this, fn, e);
    const t = { ...e, PeerId: this.PeerId };
    (s = l(this, hn)) == null || s.sendLocalState(e), (r = l(this, Ge)) == null || r.postMessage({ type: "presence", payload: t, senderId: this.PeerId });
    for (const i of l(this, Ft))
      try {
        i(this.PeerId, t, "local");
      } catch (o) {
        console.error("SDS: presence handler failed", o);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return l(this, gn);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return l(this, Ft).add(e), () => {
      l(this, Ft).delete(e);
    };
  }
}
G = new WeakMap(), Y = new WeakMap(), B = new WeakMap(), hn = new WeakMap(), Qn = new WeakMap(), es = new WeakMap(), Xs = new WeakMap(), Qs = new WeakMap(), ts = new WeakMap(), ns = new WeakMap(), qe = new WeakMap(), un = new WeakMap(), dn = new WeakMap(), fn = new WeakMap(), gn = new WeakMap(), Ct = new WeakMap(), Ft = new WeakMap(), Ge = new WeakMap(), er = new WeakMap(), ss = new WeakMap(), ot = new WeakMap(), at = new WeakMap(), ct = new WeakMap(), j = new WeakSet(), $l = async function() {
  if (l(this, Y) == null)
    return;
  await l(this, Y).loadSnapshot();
  const e = await l(this, Y).loadPatchesSince(l(this, ns));
  for (const t of e)
    try {
      l(this, G).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && S(this, qe, l(this, ns) + e.length), S(this, un, l(this, G).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
Ul = function() {
  const e = l(this, G).onChangeInvoke((t, s) => {
    var o, a;
    if (t === "external") {
      d(this, j, oo).call(this, s, "request").catch((c) => {
        console.error("[SDS] value-request failed:", c.message ?? c);
      });
      return;
    }
    const r = l(this, un);
    hr(this, qe)._++;
    const i = l(this, G).exportPatch(r);
    S(this, un, l(this, G).currentCursor), i.byteLength !== 0 && (l(this, Y) != null && (l(this, Y).appendPatch(i, l(this, qe)).catch((c) => {
      console.error("[SDS] appendPatch failed:", c.message ?? c);
    }), S(this, ts, l(this, ts) + i.byteLength), l(this, ts) >= pg && d(this, j, io).call(this).catch((c) => {
      console.error("[SDS] checkpoint failed:", c.message ?? c);
    })), ((o = l(this, B)) == null ? void 0 : o.ConnectionState) === "connected" ? (l(this, B).sendPatch(i), (a = l(this, Ge)) == null || a.postMessage({ type: "patch", payload: i, senderId: this.PeerId })) : l(this, Qs).push(i), d(this, j, oo).call(this, s, "send").catch((c) => {
      console.error("[SDS] value-send failed:", c.message ?? c);
    }));
  });
  l(this, at).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
Bl = function() {
  if (l(this, B) != null) {
    const t = l(this, B).onPatch((i) => {
      try {
        l(this, G).applyRemotePatch(i);
      } catch {
      }
    });
    l(this, at).push(t);
    const s = l(this, B).onValue(async (i, o) => {
      var a;
      l(this, G).storeValueBlob(i, o), await ((a = l(this, Y)) == null ? void 0 : a.saveValue(i, o));
    });
    l(this, at).push(s);
    const r = l(this, B).onSyncRequest((i) => {
      l(this, ot) != null && clearTimeout(l(this, ot));
      const o = 50 + Math.floor(Math.random() * 250);
      S(this, ot, setTimeout(() => {
        var c;
        S(this, ot, void 0);
        const a = l(this, G).exportPatch();
        a.byteLength > 0 && ((c = l(this, B)) == null || c.sendPatch(a));
      }, o));
    });
    l(this, at).push(r);
  }
  const e = l(this, hn);
  if (e != null) {
    const t = e.onRemoteState((s, r) => {
      d(this, j, ao).call(this, s, r);
    });
    l(this, at).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
jl = function() {
  const e = l(this, Qn) / 4;
  S(this, dn, setInterval(() => {
    var t, s;
    if (l(this, fn) != null) {
      (t = l(this, hn)) == null || t.sendLocalState(l(this, fn));
      const r = { ...l(this, fn), PeerId: this.PeerId };
      (s = l(this, Ge)) == null || s.postMessage({ type: "presence", payload: r, senderId: this.PeerId });
    }
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Pl = function() {
  l(this, Ge) != null && (l(this, Ge).onmessage = (e) => {
    const t = e.data;
    if (t.senderId !== this.PeerId)
      switch (!0) {
        case t.type === "patch":
          try {
            l(this, G).applyRemotePatch(t.payload);
          } catch (s) {
            console.error("[SDS] failed to apply BC patch:", s.message ?? s);
          }
          break;
        case t.type === "presence":
          d(this, j, ao).call(this, t.payload.PeerId ?? t.senderId ?? "unknown", t.payload);
          break;
      }
  });
}, io = async function() {
  if (l(this, Y) == null)
    return;
  const e = await l(this, Y).loadPatchesSince(l(this, qe));
  for (const t of e)
    try {
      l(this, G).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && (S(this, qe, l(this, qe) + e.length), S(this, un, l(this, G).currentCursor)), await l(this, Y).saveSnapshot(l(this, G).asBinary(), l(this, qe)), l(this, B) != null && (await l(this, Y).prunePatches(l(this, qe)), S(this, ns, l(this, qe))), S(this, ts, 0);
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
Kl = function() {
  var t;
  const e = l(this, Qs).splice(0);
  for (const s of e)
    try {
      (t = l(this, B)) == null || t.sendPatch(s);
    } catch (r) {
      console.error("SDS: failed to send queued patch", r);
    }
}, oo = async function(e, t) {
  var s, r, i;
  for (const [o, a] of Object.entries(e)) {
    const c = a;
    if (c.has("Existence")) {
      const g = l(this, ct).get(o);
      g != null && (await ((s = l(this, Y)) == null ? void 0 : s.releaseValue(g)), l(this, ct).delete(o));
    }
    if (!c.has("Value"))
      continue;
    const h = l(this, ct).get(o), u = l(this, G)._getValueRefOf(o), f = u == null ? void 0 : u.Hash;
    if (h != null && h !== f && (await ((r = l(this, Y)) == null ? void 0 : r.releaseValue(h)), l(this, ct).delete(o)), u != null) {
      if (l(this, B) == null) {
        l(this, ct).set(o, u.Hash);
        continue;
      }
      if (t === "send") {
        const g = l(this, G).getValueBlobByHash(u.Hash);
        g != null && (await ((i = l(this, Y)) == null ? void 0 : i.saveValue(u.Hash, g)), l(this, ct).set(o, u.Hash), l(this, B).ConnectionState === "connected" && l(this, B).sendValue(u.Hash, g));
      } else
        l(this, ct).set(o, u.Hash), !l(this, G).hasValueBlob(u.Hash) && l(this, B).ConnectionState === "connected" && l(this, B).requestValue(u.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
ao = function(e, t) {
  if (t == null) {
    d(this, j, co).call(this, e);
    return;
  }
  const s = { ...t, _lastSeen: Date.now() };
  l(this, gn).set(e, s), d(this, j, Fl).call(this, e);
  for (const r of l(this, Ft))
    try {
      r(e, t, "remote");
    } catch (i) {
      console.error("SDS: presence handler failed", i);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
Fl = function(e) {
  const t = l(this, Ct).get(e);
  t != null && clearTimeout(t);
  const s = setTimeout(
    () => {
      d(this, j, co).call(this, e);
    },
    l(this, Qn)
  );
  l(this, Ct).set(e, s);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
co = function(e) {
  if (!l(this, gn).has(e))
    return;
  l(this, gn).delete(e);
  const t = l(this, Ct).get(e);
  t != null && (clearTimeout(t), l(this, Ct).delete(e));
  for (const s of l(this, Ft))
    try {
      s(e, void 0, "remote");
    } catch (r) {
      console.error("SDS: presence handler failed", r);
    }
};
export {
  vg as SDS_BrowserPersistenceProvider,
  Va as SDS_DataStore,
  Xa as SDS_Entry,
  P as SDS_Error,
  na as SDS_Item,
  sa as SDS_Link,
  kg as SDS_SyncEngine,
  _g as SDS_WebRTCProvider,
  wg as SDS_WebSocketProvider
};
