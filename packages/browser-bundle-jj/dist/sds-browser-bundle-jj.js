var hh = Object.defineProperty;
var mo = (r) => {
  throw TypeError(r);
};
var dh = (r, e, t) => e in r ? hh(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var jn = (r, e, t) => dh(r, typeof e != "symbol" ? e + "" : e, t), Ni = (r, e, t) => e.has(r) || mo("Cannot " + t);
var S = (r, e, t) => (Ni(r, e, "read from private field"), t ? t.call(r) : e.get(r)), D = (r, e, t) => e.has(r) ? mo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), H = (r, e, t, i) => (Ni(r, e, "write to private field"), i ? i.call(r, t) : e.set(r, t), t), N = (r, e, t) => (Ni(r, e, "access private method"), t);
var ri = (r, e, t, i) => ({
  set _(n) {
    H(r, e, n, t);
  },
  get _() {
    return S(r, e, i);
  }
});
class ue extends Error {
  constructor(t, i) {
    super(i);
    jn(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const Qe = "00000000-0000-4000-8000-000000000000", ve = "00000000-0000-4000-8000-000000000001", Ae = "00000000-0000-4000-8000-000000000002", Wt = "text/plain", fh = 131072, ph = 2048, yh = 5e3, bo = 1024, wo = 256, _o = 1024, ko = 262144, gh = 200;
function vh(r) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(r).toString("base64");
  let t = "";
  for (let i = 0; i < r.byteLength; i++)
    t += String.fromCharCode(r[i]);
  return btoa(t);
}
function hu(r) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(r, "base64")) : Uint8Array.from(atob(r), (t) => t.charCodeAt(0));
}
var et, nn, lu;
let mh = (lu = class {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    D(this, et, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    D(this, nn);
  }
  /**** _BLOBhash — FNV-1a 32-bit content hash used as blob identity key ****/
  static _BLOBhash(e) {
    let t = 2166136261;
    for (let i = 0; i < e.length; i++)
      t = Math.imul(t ^ e[i], 16777619) >>> 0;
    return `fnv1a-${t.toString(16).padStart(8, "0")}-${e.length}`;
  }
  /**** _storeValueBlob — cache a blob (called by backends on write) ****/
  _storeValueBlob(e, t) {
    S(this, et).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = S(this, et).get(e);
    return t == null && S(this, nn) != null && (t = await S(this, nn).call(this, e), t != null && S(this, et).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    S(this, et).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return S(this, et).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return S(this, et).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    H(this, nn, e);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/
  newEntryFromJSONat(e, t, i) {
    const n = typeof e == "string" ? JSON.parse(e) : e;
    switch (!0) {
      case (n == null ? void 0 : n.Kind) === "item":
        return this.deserializeItemInto(n, t, i);
      case (n == null ? void 0 : n.Kind) === "link":
        return this.deserializeLinkInto(n, t, i);
      default:
        throw new ue("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
    }
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** EntryMayBeMovedTo — true when moving Entry into outerItem at InsertionIndex is allowed ****/
  EntryMayBeMovedTo(e, t, i) {
    return this._mayMoveEntryTo(e.Id, t.Id, i);
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
    return this._EntryAsJSON(Qe);
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
    let i = this._outerItemIdOf(e);
    for (; i != null && (t.push(this.EntryWithId(i)), i !== Qe); )
      i = this._outerItemIdOf(i);
    return t;
  }
  /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
  _outerItemIdsOf(e) {
    return this._outerItemChainOf(e).map((t) => t.Id);
  }
  /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
  _EntryAsJSON(e) {
    const t = this._KindOf(e), i = this._LabelOf(e), n = this._InfoProxyOf(e), s = {};
    for (const l of Object.keys(n))
      s[l] = n[l];
    if (t === "link") {
      const l = this._TargetOf(e).Id;
      return { Kind: "link", Id: e, Label: i, TargetId: l, Info: s };
    }
    const o = this._TypeOf(e), a = this._ValueKindOf(e), u = { Kind: "item", Id: e, Label: i, Type: o, ValueKind: a, Info: s, innerEntries: [] };
    if (a === "literal" || a === "binary") {
      const l = this._currentValueOf(e);
      l !== void 0 && (u.Value = typeof l == "string" ? l : vh(l));
    }
    return u.innerEntries = Array.from(this._innerEntriesOf(e)).map((l) => this._EntryAsJSON(l.Id)), u;
  }
}, et = new WeakMap(), nn = new WeakMap(), lu);
var te;
(function(r) {
  r.assertEqual = (n) => {
  };
  function e(n) {
  }
  r.assertIs = e;
  function t(n) {
    throw new Error();
  }
  r.assertNever = t, r.arrayToEnum = (n) => {
    const s = {};
    for (const o of n)
      s[o] = o;
    return s;
  }, r.getValidEnumValues = (n) => {
    const s = r.objectKeys(n).filter((a) => typeof n[n[a]] != "number"), o = {};
    for (const a of s)
      o[a] = n[a];
    return r.objectValues(o);
  }, r.objectValues = (n) => r.objectKeys(n).map(function(s) {
    return n[s];
  }), r.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const s = [];
    for (const o in n)
      Object.prototype.hasOwnProperty.call(n, o) && s.push(o);
    return s;
  }, r.find = (n, s) => {
    for (const o of n)
      if (s(o))
        return o;
  }, r.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function i(n, s = " | ") {
    return n.map((o) => typeof o == "string" ? `'${o}'` : o).join(s);
  }
  r.joinValues = i, r.jsonStringifyReplacer = (n, s) => typeof s == "bigint" ? s.toString() : s;
})(te || (te = {}));
var So;
(function(r) {
  r.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(So || (So = {}));
const U = te.arrayToEnum([
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
]), ht = (r) => {
  switch (typeof r) {
    case "undefined":
      return U.undefined;
    case "string":
      return U.string;
    case "number":
      return Number.isNaN(r) ? U.nan : U.number;
    case "boolean":
      return U.boolean;
    case "function":
      return U.function;
    case "bigint":
      return U.bigint;
    case "symbol":
      return U.symbol;
    case "object":
      return Array.isArray(r) ? U.array : r === null ? U.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? U.promise : typeof Map < "u" && r instanceof Map ? U.map : typeof Set < "u" && r instanceof Set ? U.set : typeof Date < "u" && r instanceof Date ? U.date : U.object;
    default:
      return U.unknown;
  }
}, L = te.arrayToEnum([
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
class at extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (i) => {
      this.issues = [...this.issues, i];
    }, this.addIssues = (i = []) => {
      this.issues = [...this.issues, ...i];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(s) {
      return s.message;
    }, i = { _errors: [] }, n = (s) => {
      for (const o of s.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(n);
        else if (o.code === "invalid_return_type")
          n(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          n(o.argumentsError);
        else if (o.path.length === 0)
          i._errors.push(t(o));
        else {
          let a = i, u = 0;
          for (; u < o.path.length; ) {
            const l = o.path[u];
            u === o.path.length - 1 ? (a[l] = a[l] || { _errors: [] }, a[l]._errors.push(t(o))) : a[l] = a[l] || { _errors: [] }, a = a[l], u++;
          }
        }
    };
    return n(this), i;
  }
  static assert(e) {
    if (!(e instanceof at))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, te.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, i = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const s = n.path[0];
        t[s] = t[s] || [], t[s].push(e(n));
      } else
        i.push(e(n));
    return { formErrors: i, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
at.create = (r) => new at(r);
const Os = (r, e) => {
  let t;
  switch (r.code) {
    case L.invalid_type:
      r.received === U.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
      break;
    case L.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(r.expected, te.jsonStringifyReplacer)}`;
      break;
    case L.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${te.joinValues(r.keys, ", ")}`;
      break;
    case L.invalid_union:
      t = "Invalid input";
      break;
    case L.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${te.joinValues(r.options)}`;
      break;
    case L.invalid_enum_value:
      t = `Invalid enum value. Expected ${te.joinValues(r.options)}, received '${r.received}'`;
      break;
    case L.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case L.invalid_return_type:
      t = "Invalid function return type";
      break;
    case L.invalid_date:
      t = "Invalid date";
      break;
    case L.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : te.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
      break;
    case L.too_small:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
      break;
    case L.too_big:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
      break;
    case L.custom:
      t = "Invalid input";
      break;
    case L.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case L.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case L.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, te.assertNever(r);
  }
  return { message: t };
};
let bh = Os;
function wh() {
  return bh;
}
const _h = (r) => {
  const { data: e, path: t, errorMaps: i, issueData: n } = r, s = [...t, ...n.path || []], o = {
    ...n,
    path: s
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: s,
      message: n.message
    };
  let a = "";
  const u = i.filter((l) => !!l).slice().reverse();
  for (const l of u)
    a = l(o, { data: e, defaultError: a }).message;
  return {
    ...n,
    path: s,
    message: a
  };
};
function q(r, e) {
  const t = wh(), i = _h({
    issueData: e,
    data: r.data,
    path: r.path,
    errorMaps: [
      r.common.contextualErrorMap,
      // contextual error map is first priority
      r.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === Os ? void 0 : Os
      // then global default map
    ].filter((n) => !!n)
  });
  r.common.issues.push(i);
}
class Te {
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
    const i = [];
    for (const n of t) {
      if (n.status === "aborted")
        return Z;
      n.status === "dirty" && e.dirty(), i.push(n.value);
    }
    return { status: e.value, value: i };
  }
  static async mergeObjectAsync(e, t) {
    const i = [];
    for (const n of t) {
      const s = await n.key, o = await n.value;
      i.push({
        key: s,
        value: o
      });
    }
    return Te.mergeObjectSync(e, i);
  }
  static mergeObjectSync(e, t) {
    const i = {};
    for (const n of t) {
      const { key: s, value: o } = n;
      if (s.status === "aborted" || o.status === "aborted")
        return Z;
      s.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof o.value < "u" || n.alwaysSet) && (i[s.value] = o.value);
    }
    return { status: e.value, value: i };
  }
}
const Z = Object.freeze({
  status: "aborted"
}), Rr = (r) => ({ status: "dirty", value: r }), je = (r) => ({ status: "valid", value: r }), xo = (r) => r.status === "aborted", Oo = (r) => r.status === "dirty", Sn = (r) => r.status === "valid", li = (r) => typeof Promise < "u" && r instanceof Promise;
var F;
(function(r) {
  r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(F || (F = {}));
class _t {
  constructor(e, t, i, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = i, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Io = (r, e) => {
  if (Sn(e))
    return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new at(r.common.issues);
      return this._error = t, this._error;
    }
  };
};
function X(r) {
  if (!r)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: i, description: n } = r;
  if (e && (t || i))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (o, a) => {
    const { message: u } = r;
    return o.code === "invalid_enum_value" ? { message: u ?? a.defaultError } : typeof a.data > "u" ? { message: u ?? i ?? a.defaultError } : o.code !== "invalid_type" ? { message: a.defaultError } : { message: u ?? t ?? a.defaultError };
  }, description: n };
}
class ee {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return ht(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: ht(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Te(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: ht(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (li(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const i = this.safeParse(e, t);
    if (i.success)
      return i.data;
    throw i.error;
  }
  safeParse(e, t) {
    const i = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ht(e)
    }, n = this._parseSync({ data: e, path: i.path, parent: i });
    return Io(i, n);
  }
  "~validate"(e) {
    var i, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ht(e)
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: e, path: [], parent: t });
        return Sn(s) ? {
          value: s.value
        } : {
          issues: t.common.issues
        };
      } catch (s) {
        (n = (i = s == null ? void 0 : s.message) == null ? void 0 : i.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => Sn(s) ? {
      value: s.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const i = await this.safeParseAsync(e, t);
    if (i.success)
      return i.data;
    throw i.error;
  }
  async safeParseAsync(e, t) {
    const i = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ht(e)
    }, n = this._parse({ data: e, path: i.path, parent: i }), s = await (li(n) ? n : Promise.resolve(n));
    return Io(i, s);
  }
  refine(e, t) {
    const i = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, s) => {
      const o = e(n), a = () => s.addIssue({
        code: L.custom,
        ...i(n)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((u) => u ? !0 : (a(), !1)) : o ? !0 : (a(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((i, n) => e(i) ? !0 : (n.addIssue(typeof t == "function" ? t(i, n) : t), !1));
  }
  _refinement(e) {
    return new In({
      schema: this,
      typeName: K.ZodEffects,
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
    return wt.create(this, this._def);
  }
  nullable() {
    return Cn.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return We.create(this);
  }
  promise() {
    return pi.create(this, this._def);
  }
  or(e) {
    return di.create([this, e], this._def);
  }
  and(e) {
    return fi.create(this, e, this._def);
  }
  transform(e) {
    return new In({
      ...X(this._def),
      schema: this,
      typeName: K.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ts({
      ...X(this._def),
      innerType: this,
      defaultValue: t,
      typeName: K.ZodDefault
    });
  }
  brand() {
    return new zh({
      typeName: K.ZodBranded,
      type: this,
      ...X(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new As({
      ...X(this._def),
      innerType: this,
      catchValue: t,
      typeName: K.ZodCatch
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
    return ro.create(this, e);
  }
  readonly() {
    return js.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const kh = /^c[^\s-]{8,}$/i, Sh = /^[0-9a-z]+$/, xh = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Oh = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Ih = /^[a-z0-9_-]{21}$/i, Ch = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Nh = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Th = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Ah = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Ti;
const jh = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Eh = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Ph = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Rh = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Vh = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Bh = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, du = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Lh = new RegExp(`^${du}$`);
function fu(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Mh(r) {
  return new RegExp(`^${fu(r)}$`);
}
function Dh(r) {
  let e = `${du}T${fu(r)}`;
  const t = [];
  return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function qh(r, e) {
  return !!((e === "v4" || !e) && jh.test(r) || (e === "v6" || !e) && Ph.test(r));
}
function Uh(r, e) {
  if (!Ch.test(r))
    return !1;
  try {
    const [t] = r.split(".");
    if (!t)
      return !1;
    const i = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(i));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function Fh(r, e) {
  return !!((e === "v4" || !e) && Eh.test(r) || (e === "v6" || !e) && Rh.test(r));
}
class bt extends ee {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== U.string) {
      const s = this._getOrReturnCtx(e);
      return q(s, {
        code: L.invalid_type,
        expected: U.string,
        received: s.parsedType
      }), Z;
    }
    const i = new Te();
    let n;
    for (const s of this._def.checks)
      if (s.kind === "min")
        e.data.length < s.value && (n = this._getOrReturnCtx(e, n), q(n, {
          code: L.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), i.dirty());
      else if (s.kind === "max")
        e.data.length > s.value && (n = this._getOrReturnCtx(e, n), q(n, {
          code: L.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), i.dirty());
      else if (s.kind === "length") {
        const o = e.data.length > s.value, a = e.data.length < s.value;
        (o || a) && (n = this._getOrReturnCtx(e, n), o ? q(n, {
          code: L.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }) : a && q(n, {
          code: L.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }), i.dirty());
      } else if (s.kind === "email")
        Th.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "email",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "emoji")
        Ti || (Ti = new RegExp(Ah, "u")), Ti.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "emoji",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "uuid")
        Oh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "uuid",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "nanoid")
        Ih.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "nanoid",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid")
        kh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "cuid",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid2")
        Sh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "cuid2",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "ulid")
        xh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
          validation: "ulid",
          code: L.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), q(n, {
            validation: "url",
            code: L.invalid_string,
            message: s.message
          }), i.dirty();
        }
      else s.kind === "regex" ? (s.regex.lastIndex = 0, s.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "regex",
        code: L.invalid_string,
        message: s.message
      }), i.dirty())) : s.kind === "trim" ? e.data = e.data.trim() : s.kind === "includes" ? e.data.includes(s.value, s.position) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: { includes: s.value, position: s.position },
        message: s.message
      }), i.dirty()) : s.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : s.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : s.kind === "startsWith" ? e.data.startsWith(s.value) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: { startsWith: s.value },
        message: s.message
      }), i.dirty()) : s.kind === "endsWith" ? e.data.endsWith(s.value) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: { endsWith: s.value },
        message: s.message
      }), i.dirty()) : s.kind === "datetime" ? Dh(s).test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: "datetime",
        message: s.message
      }), i.dirty()) : s.kind === "date" ? Lh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: "date",
        message: s.message
      }), i.dirty()) : s.kind === "time" ? Mh(s).test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.invalid_string,
        validation: "time",
        message: s.message
      }), i.dirty()) : s.kind === "duration" ? Nh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "duration",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "ip" ? qh(e.data, s.version) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "ip",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "jwt" ? Uh(e.data, s.alg) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "jwt",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "cidr" ? Fh(e.data, s.version) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "cidr",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64" ? Vh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "base64",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64url" ? Bh.test(e.data) || (n = this._getOrReturnCtx(e, n), q(n, {
        validation: "base64url",
        code: L.invalid_string,
        message: s.message
      }), i.dirty()) : te.assertNever(s);
    return { status: i.value, value: e.data };
  }
  _regex(e, t, i) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: L.invalid_string,
      ...F.errToObj(i)
    });
  }
  _addCheck(e) {
    return new bt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...F.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...F.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...F.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...F.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...F.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...F.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...F.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...F.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...F.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...F.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...F.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...F.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...F.errToObj(e) });
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
      ...F.errToObj(e == null ? void 0 : e.message)
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
      ...F.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...F.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...F.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...F.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...F.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...F.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...F.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...F.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...F.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, F.errToObj(e));
  }
  trim() {
    return new bt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new bt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new bt({
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
bt.create = (r) => new bt({
  checks: [],
  typeName: K.ZodString,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...X(r)
});
function Hh(r, e) {
  const t = (r.toString().split(".")[1] || "").length, i = (e.toString().split(".")[1] || "").length, n = t > i ? t : i, s = Number.parseInt(r.toFixed(n).replace(".", "")), o = Number.parseInt(e.toFixed(n).replace(".", ""));
  return s % o / 10 ** n;
}
class xn extends ee {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== U.number) {
      const s = this._getOrReturnCtx(e);
      return q(s, {
        code: L.invalid_type,
        expected: U.number,
        received: s.parsedType
      }), Z;
    }
    let i;
    const n = new Te();
    for (const s of this._def.checks)
      s.kind === "int" ? te.isInteger(e.data) || (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.invalid_type,
        expected: "integer",
        received: "float",
        message: s.message
      }), n.dirty()) : s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.too_small,
        minimum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), n.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.too_big,
        maximum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), n.dirty()) : s.kind === "multipleOf" ? Hh(e.data, s.value) !== 0 && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), n.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.not_finite,
        message: s.message
      }), n.dirty()) : te.assertNever(s);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, F.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, F.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, F.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, F.toString(t));
  }
  setLimit(e, t, i, n) {
    return new xn({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: F.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new xn({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: F.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: F.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: F.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: F.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: F.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: F.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: F.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: F.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: F.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && te.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const i of this._def.checks) {
      if (i.kind === "finite" || i.kind === "int" || i.kind === "multipleOf")
        return !0;
      i.kind === "min" ? (t === null || i.value > t) && (t = i.value) : i.kind === "max" && (e === null || i.value < e) && (e = i.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
xn.create = (r) => new xn({
  checks: [],
  typeName: K.ZodNumber,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...X(r)
});
class Ur extends ee {
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
    if (this._getType(e) !== U.bigint)
      return this._getInvalidInput(e);
    let i;
    const n = new Te();
    for (const s of this._def.checks)
      s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.too_small,
        type: "bigint",
        minimum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), n.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.too_big,
        type: "bigint",
        maximum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), n.dirty()) : s.kind === "multipleOf" ? e.data % s.value !== BigInt(0) && (i = this._getOrReturnCtx(e, i), q(i, {
        code: L.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), n.dirty()) : te.assertNever(s);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return q(t, {
      code: L.invalid_type,
      expected: U.bigint,
      received: t.parsedType
    }), Z;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, F.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, F.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, F.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, F.toString(t));
  }
  setLimit(e, t, i, n) {
    return new Ur({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: F.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Ur({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: F.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: F.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: F.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: F.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: F.toString(t)
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
Ur.create = (r) => new Ur({
  checks: [],
  typeName: K.ZodBigInt,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...X(r)
});
class Co extends ee {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== U.boolean) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.boolean,
        received: i.parsedType
      }), Z;
    }
    return je(e.data);
  }
}
Co.create = (r) => new Co({
  typeName: K.ZodBoolean,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...X(r)
});
class hi extends ee {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== U.date) {
      const s = this._getOrReturnCtx(e);
      return q(s, {
        code: L.invalid_type,
        expected: U.date,
        received: s.parsedType
      }), Z;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return q(s, {
        code: L.invalid_date
      }), Z;
    }
    const i = new Te();
    let n;
    for (const s of this._def.checks)
      s.kind === "min" ? e.data.getTime() < s.value && (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.too_small,
        message: s.message,
        inclusive: !0,
        exact: !1,
        minimum: s.value,
        type: "date"
      }), i.dirty()) : s.kind === "max" ? e.data.getTime() > s.value && (n = this._getOrReturnCtx(e, n), q(n, {
        code: L.too_big,
        message: s.message,
        inclusive: !0,
        exact: !1,
        maximum: s.value,
        type: "date"
      }), i.dirty()) : te.assertNever(s);
    return {
      status: i.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new hi({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: F.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: F.toString(t)
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
hi.create = (r) => new hi({
  checks: [],
  coerce: (r == null ? void 0 : r.coerce) || !1,
  typeName: K.ZodDate,
  ...X(r)
});
class No extends ee {
  _parse(e) {
    if (this._getType(e) !== U.symbol) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.symbol,
        received: i.parsedType
      }), Z;
    }
    return je(e.data);
  }
}
No.create = (r) => new No({
  typeName: K.ZodSymbol,
  ...X(r)
});
class Is extends ee {
  _parse(e) {
    if (this._getType(e) !== U.undefined) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.undefined,
        received: i.parsedType
      }), Z;
    }
    return je(e.data);
  }
}
Is.create = (r) => new Is({
  typeName: K.ZodUndefined,
  ...X(r)
});
class To extends ee {
  _parse(e) {
    if (this._getType(e) !== U.null) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.null,
        received: i.parsedType
      }), Z;
    }
    return je(e.data);
  }
}
To.create = (r) => new To({
  typeName: K.ZodNull,
  ...X(r)
});
class Fr extends ee {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return je(e.data);
  }
}
Fr.create = (r) => new Fr({
  typeName: K.ZodAny,
  ...X(r)
});
class Cs extends ee {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return je(e.data);
  }
}
Cs.create = (r) => new Cs({
  typeName: K.ZodUnknown,
  ...X(r)
});
class kt extends ee {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return q(t, {
      code: L.invalid_type,
      expected: U.never,
      received: t.parsedType
    }), Z;
  }
}
kt.create = (r) => new kt({
  typeName: K.ZodNever,
  ...X(r)
});
class Ao extends ee {
  _parse(e) {
    if (this._getType(e) !== U.undefined) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.void,
        received: i.parsedType
      }), Z;
    }
    return je(e.data);
  }
}
Ao.create = (r) => new Ao({
  typeName: K.ZodVoid,
  ...X(r)
});
class We extends ee {
  _parse(e) {
    const { ctx: t, status: i } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== U.array)
      return q(t, {
        code: L.invalid_type,
        expected: U.array,
        received: t.parsedType
      }), Z;
    if (n.exactLength !== null) {
      const o = t.data.length > n.exactLength.value, a = t.data.length < n.exactLength.value;
      (o || a) && (q(t, {
        code: o ? L.too_big : L.too_small,
        minimum: a ? n.exactLength.value : void 0,
        maximum: o ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), i.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (q(t, {
      code: L.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), i.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (q(t, {
      code: L.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), i.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, a) => n.type._parseAsync(new _t(t, o, t.path, a)))).then((o) => Te.mergeArray(i, o));
    const s = [...t.data].map((o, a) => n.type._parseSync(new _t(t, o, t.path, a)));
    return Te.mergeArray(i, s);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new We({
      ...this._def,
      minLength: { value: e, message: F.toString(t) }
    });
  }
  max(e, t) {
    return new We({
      ...this._def,
      maxLength: { value: e, message: F.toString(t) }
    });
  }
  length(e, t) {
    return new We({
      ...this._def,
      exactLength: { value: e, message: F.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
We.create = (r, e) => new We({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: K.ZodArray,
  ...X(e)
});
function Gt(r) {
  if (r instanceof me) {
    const e = {};
    for (const t in r.shape) {
      const i = r.shape[t];
      e[t] = wt.create(Gt(i));
    }
    return new me({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof We ? new We({
    ...r._def,
    type: Gt(r.element)
  }) : r instanceof wt ? wt.create(Gt(r.unwrap())) : r instanceof Cn ? Cn.create(Gt(r.unwrap())) : r instanceof zt ? zt.create(r.items.map((e) => Gt(e))) : r;
}
class me extends ee {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = te.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== U.object) {
      const l = this._getOrReturnCtx(e);
      return q(l, {
        code: L.invalid_type,
        expected: U.object,
        received: l.parsedType
      }), Z;
    }
    const { status: i, ctx: n } = this._processInputParams(e), { shape: s, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof kt && this._def.unknownKeys === "strip"))
      for (const l in n.data)
        o.includes(l) || a.push(l);
    const u = [];
    for (const l of o) {
      const c = s[l], h = n.data[l];
      u.push({
        key: { status: "valid", value: l },
        value: c._parse(new _t(n, h, n.path, l)),
        alwaysSet: l in n.data
      });
    }
    if (this._def.catchall instanceof kt) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const c of a)
          u.push({
            key: { status: "valid", value: c },
            value: { status: "valid", value: n.data[c] }
          });
      else if (l === "strict")
        a.length > 0 && (q(n, {
          code: L.unrecognized_keys,
          keys: a
        }), i.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const c of a) {
        const h = n.data[c];
        u.push({
          key: { status: "valid", value: c },
          value: l._parse(
            new _t(n, h, n.path, c)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: c in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const c of u) {
        const h = await c.key, g = await c.value;
        l.push({
          key: h,
          value: g,
          alwaysSet: c.alwaysSet
        });
      }
      return l;
    }).then((l) => Te.mergeObjectSync(i, l)) : Te.mergeObjectSync(i, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return F.errToObj, new me({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, i) => {
          var s, o;
          const n = ((o = (s = this._def).errorMap) == null ? void 0 : o.call(s, t, i).message) ?? i.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: F.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new me({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new me({
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
    return new me({
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
    return new me({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: K.ZodObject
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
    return new me({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const i of te.objectKeys(e))
      e[i] && this.shape[i] && (t[i] = this.shape[i]);
    return new me({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const i of te.objectKeys(this.shape))
      e[i] || (t[i] = this.shape[i]);
    return new me({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Gt(this);
  }
  partial(e) {
    const t = {};
    for (const i of te.objectKeys(this.shape)) {
      const n = this.shape[i];
      e && !e[i] ? t[i] = n : t[i] = n.optional();
    }
    return new me({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const i of te.objectKeys(this.shape))
      if (e && !e[i])
        t[i] = this.shape[i];
      else {
        let s = this.shape[i];
        for (; s instanceof wt; )
          s = s._def.innerType;
        t[i] = s;
      }
    return new me({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return pu(te.objectKeys(this.shape));
  }
}
me.create = (r, e) => new me({
  shape: () => r,
  unknownKeys: "strip",
  catchall: kt.create(),
  typeName: K.ZodObject,
  ...X(e)
});
me.strictCreate = (r, e) => new me({
  shape: () => r,
  unknownKeys: "strict",
  catchall: kt.create(),
  typeName: K.ZodObject,
  ...X(e)
});
me.lazycreate = (r, e) => new me({
  shape: r,
  unknownKeys: "strip",
  catchall: kt.create(),
  typeName: K.ZodObject,
  ...X(e)
});
class di extends ee {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = this._def.options;
    function n(s) {
      for (const a of s)
        if (a.result.status === "valid")
          return a.result;
      for (const a of s)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = s.map((a) => new at(a.ctx.common.issues));
      return q(t, {
        code: L.invalid_union,
        unionErrors: o
      }), Z;
    }
    if (t.common.async)
      return Promise.all(i.map(async (s) => {
        const o = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await s._parseAsync({
            data: t.data,
            path: t.path,
            parent: o
          }),
          ctx: o
        };
      })).then(n);
    {
      let s;
      const o = [];
      for (const u of i) {
        const l = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, c = u._parseSync({
          data: t.data,
          path: t.path,
          parent: l
        });
        if (c.status === "valid")
          return c;
        c.status === "dirty" && !s && (s = { result: c, ctx: l }), l.common.issues.length && o.push(l.common.issues);
      }
      if (s)
        return t.common.issues.push(...s.ctx.common.issues), s.result;
      const a = o.map((u) => new at(u));
      return q(t, {
        code: L.invalid_union,
        unionErrors: a
      }), Z;
    }
  }
  get options() {
    return this._def.options;
  }
}
di.create = (r, e) => new di({
  options: r,
  typeName: K.ZodUnion,
  ...X(e)
});
function Ns(r, e) {
  const t = ht(r), i = ht(e);
  if (r === e)
    return { valid: !0, data: r };
  if (t === U.object && i === U.object) {
    const n = te.objectKeys(e), s = te.objectKeys(r).filter((a) => n.indexOf(a) !== -1), o = { ...r, ...e };
    for (const a of s) {
      const u = Ns(r[a], e[a]);
      if (!u.valid)
        return { valid: !1 };
      o[a] = u.data;
    }
    return { valid: !0, data: o };
  } else if (t === U.array && i === U.array) {
    if (r.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let s = 0; s < r.length; s++) {
      const o = r[s], a = e[s], u = Ns(o, a);
      if (!u.valid)
        return { valid: !1 };
      n.push(u.data);
    }
    return { valid: !0, data: n };
  } else return t === U.date && i === U.date && +r == +e ? { valid: !0, data: r } : { valid: !1 };
}
class fi extends ee {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e), n = (s, o) => {
      if (xo(s) || xo(o))
        return Z;
      const a = Ns(s.value, o.value);
      return a.valid ? ((Oo(s) || Oo(o)) && t.dirty(), { status: t.value, value: a.data }) : (q(i, {
        code: L.invalid_intersection_types
      }), Z);
    };
    return i.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: i.data,
        path: i.path,
        parent: i
      }),
      this._def.right._parseAsync({
        data: i.data,
        path: i.path,
        parent: i
      })
    ]).then(([s, o]) => n(s, o)) : n(this._def.left._parseSync({
      data: i.data,
      path: i.path,
      parent: i
    }), this._def.right._parseSync({
      data: i.data,
      path: i.path,
      parent: i
    }));
  }
}
fi.create = (r, e, t) => new fi({
  left: r,
  right: e,
  typeName: K.ZodIntersection,
  ...X(t)
});
class zt extends ee {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.array)
      return q(i, {
        code: L.invalid_type,
        expected: U.array,
        received: i.parsedType
      }), Z;
    if (i.data.length < this._def.items.length)
      return q(i, {
        code: L.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), Z;
    !this._def.rest && i.data.length > this._def.items.length && (q(i, {
      code: L.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const s = [...i.data].map((o, a) => {
      const u = this._def.items[a] || this._def.rest;
      return u ? u._parse(new _t(i, o, i.path, a)) : null;
    }).filter((o) => !!o);
    return i.common.async ? Promise.all(s).then((o) => Te.mergeArray(t, o)) : Te.mergeArray(t, s);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new zt({
      ...this._def,
      rest: e
    });
  }
}
zt.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new zt({
    items: r,
    typeName: K.ZodTuple,
    rest: null,
    ...X(e)
  });
};
class jo extends ee {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.map)
      return q(i, {
        code: L.invalid_type,
        expected: U.map,
        received: i.parsedType
      }), Z;
    const n = this._def.keyType, s = this._def.valueType, o = [...i.data.entries()].map(([a, u], l) => ({
      key: n._parse(new _t(i, a, i.path, [l, "key"])),
      value: s._parse(new _t(i, u, i.path, [l, "value"]))
    }));
    if (i.common.async) {
      const a = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of o) {
          const l = await u.key, c = await u.value;
          if (l.status === "aborted" || c.status === "aborted")
            return Z;
          (l.status === "dirty" || c.status === "dirty") && t.dirty(), a.set(l.value, c.value);
        }
        return { status: t.value, value: a };
      });
    } else {
      const a = /* @__PURE__ */ new Map();
      for (const u of o) {
        const l = u.key, c = u.value;
        if (l.status === "aborted" || c.status === "aborted")
          return Z;
        (l.status === "dirty" || c.status === "dirty") && t.dirty(), a.set(l.value, c.value);
      }
      return { status: t.value, value: a };
    }
  }
}
jo.create = (r, e, t) => new jo({
  valueType: e,
  keyType: r,
  typeName: K.ZodMap,
  ...X(t)
});
class Hr extends ee {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.set)
      return q(i, {
        code: L.invalid_type,
        expected: U.set,
        received: i.parsedType
      }), Z;
    const n = this._def;
    n.minSize !== null && i.data.size < n.minSize.value && (q(i, {
      code: L.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && i.data.size > n.maxSize.value && (q(i, {
      code: L.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const s = this._def.valueType;
    function o(u) {
      const l = /* @__PURE__ */ new Set();
      for (const c of u) {
        if (c.status === "aborted")
          return Z;
        c.status === "dirty" && t.dirty(), l.add(c.value);
      }
      return { status: t.value, value: l };
    }
    const a = [...i.data.values()].map((u, l) => s._parse(new _t(i, u, i.path, l)));
    return i.common.async ? Promise.all(a).then((u) => o(u)) : o(a);
  }
  min(e, t) {
    return new Hr({
      ...this._def,
      minSize: { value: e, message: F.toString(t) }
    });
  }
  max(e, t) {
    return new Hr({
      ...this._def,
      maxSize: { value: e, message: F.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Hr.create = (r, e) => new Hr({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: K.ZodSet,
  ...X(e)
});
class Eo extends ee {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Eo.create = (r, e) => new Eo({
  getter: r,
  typeName: K.ZodLazy,
  ...X(e)
});
class Po extends ee {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return q(t, {
        received: t.data,
        code: L.invalid_literal,
        expected: this._def.value
      }), Z;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Po.create = (r, e) => new Po({
  value: r,
  typeName: K.ZodLiteral,
  ...X(e)
});
function pu(r, e) {
  return new On({
    values: r,
    typeName: K.ZodEnum,
    ...X(e)
  });
}
class On extends ee {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), i = this._def.values;
      return q(t, {
        expected: te.joinValues(i),
        received: t.parsedType,
        code: L.invalid_type
      }), Z;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), i = this._def.values;
      return q(t, {
        received: t.data,
        code: L.invalid_enum_value,
        options: i
      }), Z;
    }
    return je(e.data);
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
    return On.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return On.create(this.options.filter((i) => !e.includes(i)), {
      ...this._def,
      ...t
    });
  }
}
On.create = pu;
class Ro extends ee {
  _parse(e) {
    const t = te.getValidEnumValues(this._def.values), i = this._getOrReturnCtx(e);
    if (i.parsedType !== U.string && i.parsedType !== U.number) {
      const n = te.objectValues(t);
      return q(i, {
        expected: te.joinValues(n),
        received: i.parsedType,
        code: L.invalid_type
      }), Z;
    }
    if (this._cache || (this._cache = new Set(te.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = te.objectValues(t);
      return q(i, {
        received: i.data,
        code: L.invalid_enum_value,
        options: n
      }), Z;
    }
    return je(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ro.create = (r, e) => new Ro({
  values: r,
  typeName: K.ZodNativeEnum,
  ...X(e)
});
class pi extends ee {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== U.promise && t.common.async === !1)
      return q(t, {
        code: L.invalid_type,
        expected: U.promise,
        received: t.parsedType
      }), Z;
    const i = t.parsedType === U.promise ? t.data : Promise.resolve(t.data);
    return je(i.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
pi.create = (r, e) => new pi({
  type: r,
  typeName: K.ZodPromise,
  ...X(e)
});
class In extends ee {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === K.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e), n = this._def.effect || null, s = {
      addIssue: (o) => {
        q(i, o), o.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return i.path;
      }
    };
    if (s.addIssue = s.addIssue.bind(s), n.type === "preprocess") {
      const o = n.transform(i.data, s);
      if (i.common.async)
        return Promise.resolve(o).then(async (a) => {
          if (t.value === "aborted")
            return Z;
          const u = await this._def.schema._parseAsync({
            data: a,
            path: i.path,
            parent: i
          });
          return u.status === "aborted" ? Z : u.status === "dirty" || t.value === "dirty" ? Rr(u.value) : u;
        });
      {
        if (t.value === "aborted")
          return Z;
        const a = this._def.schema._parseSync({
          data: o,
          path: i.path,
          parent: i
        });
        return a.status === "aborted" ? Z : a.status === "dirty" || t.value === "dirty" ? Rr(a.value) : a;
      }
    }
    if (n.type === "refinement") {
      const o = (a) => {
        const u = n.refinement(a, s);
        if (i.common.async)
          return Promise.resolve(u);
        if (u instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return a;
      };
      if (i.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: i.data,
          path: i.path,
          parent: i
        });
        return a.status === "aborted" ? Z : (a.status === "dirty" && t.dirty(), o(a.value), { status: t.value, value: a.value });
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((a) => a.status === "aborted" ? Z : (a.status === "dirty" && t.dirty(), o(a.value).then(() => ({ status: t.value, value: a.value }))));
    }
    if (n.type === "transform")
      if (i.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: i.data,
          path: i.path,
          parent: i
        });
        if (!Sn(o))
          return Z;
        const a = n.transform(o.value, s);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((o) => Sn(o) ? Promise.resolve(n.transform(o.value, s)).then((a) => ({
          status: t.value,
          value: a
        })) : Z);
    te.assertNever(n);
  }
}
In.create = (r, e, t) => new In({
  schema: r,
  typeName: K.ZodEffects,
  effect: e,
  ...X(t)
});
In.createWithPreprocess = (r, e, t) => new In({
  schema: e,
  effect: { type: "preprocess", transform: r },
  typeName: K.ZodEffects,
  ...X(t)
});
class wt extends ee {
  _parse(e) {
    return this._getType(e) === U.undefined ? je(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
wt.create = (r, e) => new wt({
  innerType: r,
  typeName: K.ZodOptional,
  ...X(e)
});
class Cn extends ee {
  _parse(e) {
    return this._getType(e) === U.null ? je(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Cn.create = (r, e) => new Cn({
  innerType: r,
  typeName: K.ZodNullable,
  ...X(e)
});
class Ts extends ee {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let i = t.data;
    return t.parsedType === U.undefined && (i = this._def.defaultValue()), this._def.innerType._parse({
      data: i,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Ts.create = (r, e) => new Ts({
  innerType: r,
  typeName: K.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...X(e)
});
class As extends ee {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: i.data,
      path: i.path,
      parent: {
        ...i
      }
    });
    return li(n) ? n.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new at(i.common.issues);
        },
        input: i.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new at(i.common.issues);
        },
        input: i.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
As.create = (r, e) => new As({
  innerType: r,
  typeName: K.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...X(e)
});
class Vo extends ee {
  _parse(e) {
    if (this._getType(e) !== U.nan) {
      const i = this._getOrReturnCtx(e);
      return q(i, {
        code: L.invalid_type,
        expected: U.nan,
        received: i.parsedType
      }), Z;
    }
    return { status: "valid", value: e.data };
  }
}
Vo.create = (r) => new Vo({
  typeName: K.ZodNaN,
  ...X(r)
});
class zh extends ee {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = t.data;
    return this._def.type._parse({
      data: i,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class ro extends ee {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: i.data,
          path: i.path,
          parent: i
        });
        return s.status === "aborted" ? Z : s.status === "dirty" ? (t.dirty(), Rr(s.value)) : this._def.out._parseAsync({
          data: s.value,
          path: i.path,
          parent: i
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: i.data,
        path: i.path,
        parent: i
      });
      return n.status === "aborted" ? Z : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: i.path,
        parent: i
      });
    }
  }
  static create(e, t) {
    return new ro({
      in: e,
      out: t,
      typeName: K.ZodPipeline
    });
  }
}
class js extends ee {
  _parse(e) {
    const t = this._def.innerType._parse(e), i = (n) => (Sn(n) && (n.value = Object.freeze(n.value)), n);
    return li(t) ? t.then((n) => i(n)) : i(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
js.create = (r, e) => new js({
  innerType: r,
  typeName: K.ZodReadonly,
  ...X(e)
});
function Bo(r, e) {
  const t = typeof r == "function" ? r(e) : typeof r == "string" ? { message: r } : r;
  return typeof t == "string" ? { message: t } : t;
}
function Zh(r, e = {}, t) {
  return r ? Fr.create().superRefine((i, n) => {
    const s = r(i);
    if (s instanceof Promise)
      return s.then((o) => {
        if (!o) {
          const a = Bo(e, i), u = a.fatal ?? t ?? !0;
          n.addIssue({ code: "custom", ...a, fatal: u });
        }
      });
    if (!s) {
      const o = Bo(e, i), a = o.fatal ?? t ?? !0;
      n.addIssue({ code: "custom", ...o, fatal: a });
    }
  }) : Fr.create();
}
var K;
(function(r) {
  r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
})(K || (K = {}));
const Kh = (r, e = {
  message: `Input not instance of ${r.name}`
}) => Zh((t) => t instanceof r, e), $r = bt.create, yu = xn.create, Jh = Is.create;
Fr.create;
const Wh = Cs.create;
kt.create;
We.create;
const Gh = di.create;
fi.create;
zt.create;
On.create;
pi.create;
wt.create;
Cn.create;
function mi(r, e) {
  var n;
  const t = r.safeParse(e);
  if (t.success)
    return t.data;
  const i = ((n = t.error.issues[0]) == null ? void 0 : n.message) ?? "invalid argument";
  throw new ue("invalid-argument", i);
}
const Xh = $r({
  invalid_type_error: "Label must be a string"
}).max(bo, `Label must not exceed ${bo} characters`), Yh = $r({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(wo, `MIMEType must not exceed ${wo} characters`), Qh = $r({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(_o, `Info key must not exceed ${_o} characters`), $h = Wh().superRefine((r, e) => {
  let t;
  try {
    t = JSON.stringify(r);
  } catch {
    e.addIssue({
      code: L.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  if (t === void 0) {
    e.addIssue({
      code: L.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > ko && e.addIssue({
    code: L.custom,
    message: `Info value must not exceed ${ko} bytes when serialised as UTF-8 JSON`
  });
});
function gu(r) {
  mi(Xh, r);
}
function Es(r) {
  mi(Yh, r);
}
function ed(r) {
  mi(Qh, r);
}
function td(r) {
  mi($h, r);
}
class vu {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
  get isRootItem() {
    return this.Id === Qe;
  }
  get isTrashItem() {
    return this.Id === ve;
  }
  get isLostAndFoundItem() {
    return this.Id === Ae;
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
    gu(e), this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    if (e == null) throw new ue("invalid-argument", "outerItem must not be missing");
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    if (e == null) throw new ue("invalid-argument", "outerItem must not be missing");
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
const nd = Gh(
  [$r(), Kh(Uint8Array), Jh()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), Lo = yu({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), rd = $r({
  invalid_type_error: "Replacement must be a string"
});
function Ai(r, e, t) {
  var s;
  const i = r.safeParse(e);
  if (i.success)
    return i.data;
  const n = (t ? `${t}: ` : "") + (((s = i.error.issues[0]) == null ? void 0 : s.message) ?? "invalid argument");
  throw new ue("invalid-argument", n);
}
class Mo extends vu {
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
    Es(e), this._Store._setTypeOf(this.Id, e);
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
    Ai(nd, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, i) {
    if (Ai(Lo, e, "fromIndex"), !Lo.safeParse(t).success || t < e)
      throw new ue("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    Ai(rd, i, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, i);
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
class Do extends vu {
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
function id(r) {
  if (Object.prototype.hasOwnProperty.call(r, "__esModule")) return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function i() {
      return this instanceof i ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(i) {
    var n = Object.getOwnPropertyDescriptor(r, i);
    Object.defineProperty(t, i, n.get ? n : {
      enumerable: !0,
      get: function() {
        return r[i];
      }
    });
  }), t;
}
var ji = {}, Ps = function(r, e) {
  return Ps = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, i) {
    t.__proto__ = i;
  } || function(t, i) {
    for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && (t[n] = i[n]);
  }, Ps(r, e);
};
function mu(r, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  Ps(r, e);
  function t() {
    this.constructor = r;
  }
  r.prototype = e === null ? Object.create(e) : (t.prototype = e.prototype, new t());
}
var yi = function() {
  return yi = Object.assign || function(e) {
    for (var t, i = 1, n = arguments.length; i < n; i++) {
      t = arguments[i];
      for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[s] = t[s]);
    }
    return e;
  }, yi.apply(this, arguments);
};
function bu(r, e) {
  var t = {};
  for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && e.indexOf(i) < 0 && (t[i] = r[i]);
  if (r != null && typeof Object.getOwnPropertySymbols == "function")
    for (var n = 0, i = Object.getOwnPropertySymbols(r); n < i.length; n++)
      e.indexOf(i[n]) < 0 && Object.prototype.propertyIsEnumerable.call(r, i[n]) && (t[i[n]] = r[i[n]]);
  return t;
}
function wu(r, e, t, i) {
  var n = arguments.length, s = n < 3 ? e : i === null ? i = Object.getOwnPropertyDescriptor(e, t) : i, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") s = Reflect.decorate(r, e, t, i);
  else for (var a = r.length - 1; a >= 0; a--) (o = r[a]) && (s = (n < 3 ? o(s) : n > 3 ? o(e, t, s) : o(e, t)) || s);
  return n > 3 && s && Object.defineProperty(e, t, s), s;
}
function _u(r, e) {
  return function(t, i) {
    e(t, i, r);
  };
}
function ku(r, e, t, i, n, s) {
  function o(_) {
    if (_ !== void 0 && typeof _ != "function") throw new TypeError("Function expected");
    return _;
  }
  for (var a = i.kind, u = a === "getter" ? "get" : a === "setter" ? "set" : "value", l = !e && r ? i.static ? r : r.prototype : null, c = e || (l ? Object.getOwnPropertyDescriptor(l, i.name) : {}), h, g = !1, p = t.length - 1; p >= 0; p--) {
    var b = {};
    for (var k in i) b[k] = k === "access" ? {} : i[k];
    for (var k in i.access) b.access[k] = i.access[k];
    b.addInitializer = function(_) {
      if (g) throw new TypeError("Cannot add initializers after decoration has completed");
      s.push(o(_ || null));
    };
    var m = (0, t[p])(a === "accessor" ? { get: c.get, set: c.set } : c[u], b);
    if (a === "accessor") {
      if (m === void 0) continue;
      if (m === null || typeof m != "object") throw new TypeError("Object expected");
      (h = o(m.get)) && (c.get = h), (h = o(m.set)) && (c.set = h), (h = o(m.init)) && n.unshift(h);
    } else (h = o(m)) && (a === "field" ? n.unshift(h) : c[u] = h);
  }
  l && Object.defineProperty(l, i.name, c), g = !0;
}
function Su(r, e, t) {
  for (var i = arguments.length > 2, n = 0; n < e.length; n++)
    t = i ? e[n].call(r, t) : e[n].call(r);
  return i ? t : void 0;
}
function xu(r) {
  return typeof r == "symbol" ? r : "".concat(r);
}
function Ou(r, e, t) {
  return typeof e == "symbol" && (e = e.description ? "[".concat(e.description, "]") : ""), Object.defineProperty(r, "name", { configurable: !0, value: t ? "".concat(t, " ", e) : e });
}
function Iu(r, e) {
  if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(r, e);
}
function Cu(r, e, t, i) {
  function n(s) {
    return s instanceof t ? s : new t(function(o) {
      o(s);
    });
  }
  return new (t || (t = Promise))(function(s, o) {
    function a(c) {
      try {
        l(i.next(c));
      } catch (h) {
        o(h);
      }
    }
    function u(c) {
      try {
        l(i.throw(c));
      } catch (h) {
        o(h);
      }
    }
    function l(c) {
      c.done ? s(c.value) : n(c.value).then(a, u);
    }
    l((i = i.apply(r, e || [])).next());
  });
}
function Nu(r, e) {
  var t = { label: 0, sent: function() {
    if (s[0] & 1) throw s[1];
    return s[1];
  }, trys: [], ops: [] }, i, n, s, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return o.next = a(0), o.throw = a(1), o.return = a(2), typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function a(l) {
    return function(c) {
      return u([l, c]);
    };
  }
  function u(l) {
    if (i) throw new TypeError("Generator is already executing.");
    for (; o && (o = 0, l[0] && (t = 0)), t; ) try {
      if (i = 1, n && (s = l[0] & 2 ? n.return : l[0] ? n.throw || ((s = n.return) && s.call(n), 0) : n.next) && !(s = s.call(n, l[1])).done) return s;
      switch (n = 0, s && (l = [l[0] & 2, s.value]), l[0]) {
        case 0:
        case 1:
          s = l;
          break;
        case 4:
          return t.label++, { value: l[1], done: !1 };
        case 5:
          t.label++, n = l[1], l = [0];
          continue;
        case 7:
          l = t.ops.pop(), t.trys.pop();
          continue;
        default:
          if (s = t.trys, !(s = s.length > 0 && s[s.length - 1]) && (l[0] === 6 || l[0] === 2)) {
            t = 0;
            continue;
          }
          if (l[0] === 3 && (!s || l[1] > s[0] && l[1] < s[3])) {
            t.label = l[1];
            break;
          }
          if (l[0] === 6 && t.label < s[1]) {
            t.label = s[1], s = l;
            break;
          }
          if (s && t.label < s[2]) {
            t.label = s[2], t.ops.push(l);
            break;
          }
          s[2] && t.ops.pop(), t.trys.pop();
          continue;
      }
      l = e.call(r, t);
    } catch (c) {
      l = [6, c], n = 0;
    } finally {
      i = s = 0;
    }
    if (l[0] & 5) throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
var bi = Object.create ? (function(r, e, t, i) {
  i === void 0 && (i = t);
  var n = Object.getOwnPropertyDescriptor(e, t);
  (!n || ("get" in n ? !e.__esModule : n.writable || n.configurable)) && (n = { enumerable: !0, get: function() {
    return e[t];
  } }), Object.defineProperty(r, i, n);
}) : (function(r, e, t, i) {
  i === void 0 && (i = t), r[i] = e[t];
});
function Tu(r, e) {
  for (var t in r) t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && bi(e, r, t);
}
function gi(r) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && r[e], i = 0;
  if (t) return t.call(r);
  if (r && typeof r.length == "number") return {
    next: function() {
      return r && i >= r.length && (r = void 0), { value: r && r[i++], done: !r };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function io(r, e) {
  var t = typeof Symbol == "function" && r[Symbol.iterator];
  if (!t) return r;
  var i = t.call(r), n, s = [], o;
  try {
    for (; (e === void 0 || e-- > 0) && !(n = i.next()).done; ) s.push(n.value);
  } catch (a) {
    o = { error: a };
  } finally {
    try {
      n && !n.done && (t = i.return) && t.call(i);
    } finally {
      if (o) throw o.error;
    }
  }
  return s;
}
function Au() {
  for (var r = [], e = 0; e < arguments.length; e++)
    r = r.concat(io(arguments[e]));
  return r;
}
function ju() {
  for (var r = 0, e = 0, t = arguments.length; e < t; e++) r += arguments[e].length;
  for (var i = Array(r), n = 0, e = 0; e < t; e++)
    for (var s = arguments[e], o = 0, a = s.length; o < a; o++, n++)
      i[n] = s[o];
  return i;
}
function Eu(r, e, t) {
  if (t || arguments.length === 2) for (var i = 0, n = e.length, s; i < n; i++)
    (s || !(i in e)) && (s || (s = Array.prototype.slice.call(e, 0, i)), s[i] = e[i]);
  return r.concat(s || Array.prototype.slice.call(e));
}
function Nn(r) {
  return this instanceof Nn ? (this.v = r, this) : new Nn(r);
}
function Pu(r, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var i = t.apply(r, e || []), n, s = [];
  return n = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), n[Symbol.asyncIterator] = function() {
    return this;
  }, n;
  function o(p) {
    return function(b) {
      return Promise.resolve(b).then(p, h);
    };
  }
  function a(p, b) {
    i[p] && (n[p] = function(k) {
      return new Promise(function(m, _) {
        s.push([p, k, m, _]) > 1 || u(p, k);
      });
    }, b && (n[p] = b(n[p])));
  }
  function u(p, b) {
    try {
      l(i[p](b));
    } catch (k) {
      g(s[0][3], k);
    }
  }
  function l(p) {
    p.value instanceof Nn ? Promise.resolve(p.value.v).then(c, h) : g(s[0][2], p);
  }
  function c(p) {
    u("next", p);
  }
  function h(p) {
    u("throw", p);
  }
  function g(p, b) {
    p(b), s.shift(), s.length && u(s[0][0], s[0][1]);
  }
}
function Ru(r) {
  var e, t;
  return e = {}, i("next"), i("throw", function(n) {
    throw n;
  }), i("return"), e[Symbol.iterator] = function() {
    return this;
  }, e;
  function i(n, s) {
    e[n] = r[n] ? function(o) {
      return (t = !t) ? { value: Nn(r[n](o)), done: !1 } : s ? s(o) : o;
    } : s;
  }
}
function Vu(r) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = r[Symbol.asyncIterator], t;
  return e ? e.call(r) : (r = typeof gi == "function" ? gi(r) : r[Symbol.iterator](), t = {}, i("next"), i("throw"), i("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function i(s) {
    t[s] = r[s] && function(o) {
      return new Promise(function(a, u) {
        o = r[s](o), n(a, u, o.done, o.value);
      });
    };
  }
  function n(s, o, a, u) {
    Promise.resolve(u).then(function(l) {
      s({ value: l, done: a });
    }, o);
  }
}
function Bu(r, e) {
  return Object.defineProperty ? Object.defineProperty(r, "raw", { value: e }) : r.raw = e, r;
}
var sd = Object.create ? (function(r, e) {
  Object.defineProperty(r, "default", { enumerable: !0, value: e });
}) : function(r, e) {
  r.default = e;
}, Rs = function(r) {
  return Rs = Object.getOwnPropertyNames || function(e) {
    var t = [];
    for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[t.length] = i);
    return t;
  }, Rs(r);
};
function Lu(r) {
  if (r && r.__esModule) return r;
  var e = {};
  if (r != null) for (var t = Rs(r), i = 0; i < t.length; i++) t[i] !== "default" && bi(e, r, t[i]);
  return sd(e, r), e;
}
function Mu(r) {
  return r && r.__esModule ? r : { default: r };
}
function Du(r, e, t, i) {
  if (t === "a" && !i) throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? r !== e || !i : !e.has(r)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return t === "m" ? i : t === "a" ? i.call(r) : i ? i.value : e.get(r);
}
function qu(r, e, t, i, n) {
  if (i === "m") throw new TypeError("Private method is not writable");
  if (i === "a" && !n) throw new TypeError("Private accessor was defined without a setter");
  if (typeof e == "function" ? r !== e || !n : !e.has(r)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return i === "a" ? n.call(r, t) : n ? n.value = t : e.set(r, t), t;
}
function Uu(r, e) {
  if (e === null || typeof e != "object" && typeof e != "function") throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof r == "function" ? e === r : r.has(e);
}
function Fu(r, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, n;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (n = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    n && (i = function() {
      try {
        n.call(this);
      } catch (s) {
        return Promise.reject(s);
      }
    }), r.stack.push({ value: e, dispose: i, async: t });
  } else t && r.stack.push({ async: !0 });
  return e;
}
var od = typeof SuppressedError == "function" ? SuppressedError : function(r, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = r, i.suppressed = e, i;
};
function Hu(r) {
  function e(s) {
    r.error = r.hasError ? new od(s, r.error, "An error was suppressed during disposal.") : s, r.hasError = !0;
  }
  var t, i = 0;
  function n() {
    for (; t = r.stack.pop(); )
      try {
        if (!t.async && i === 1) return i = 0, r.stack.push(t), Promise.resolve().then(n);
        if (t.dispose) {
          var s = t.dispose.call(t.value);
          if (t.async) return i |= 2, Promise.resolve(s).then(n, function(o) {
            return e(o), n();
          });
        } else i |= 1;
      } catch (o) {
        e(o);
      }
    if (i === 1) return r.hasError ? Promise.reject(r.error) : Promise.resolve();
    if (r.hasError) throw r.error;
  }
  return n();
}
function zu(r, e) {
  return typeof r == "string" && /^\.\.?\//.test(r) ? r.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(t, i, n, s, o) {
    return i ? e ? ".jsx" : ".js" : n && (!s || !o) ? t : n + s + "." + o.toLowerCase() + "js";
  }) : r;
}
const ad = {
  __extends: mu,
  __assign: yi,
  __rest: bu,
  __decorate: wu,
  __param: _u,
  __esDecorate: ku,
  __runInitializers: Su,
  __propKey: xu,
  __setFunctionName: Ou,
  __metadata: Iu,
  __awaiter: Cu,
  __generator: Nu,
  __createBinding: bi,
  __exportStar: Tu,
  __values: gi,
  __read: io,
  __spread: Au,
  __spreadArrays: ju,
  __spreadArray: Eu,
  __await: Nn,
  __asyncGenerator: Pu,
  __asyncDelegator: Ru,
  __asyncValues: Vu,
  __makeTemplateObject: Bu,
  __importStar: Lu,
  __importDefault: Mu,
  __classPrivateFieldGet: Du,
  __classPrivateFieldSet: qu,
  __classPrivateFieldIn: Uu,
  __addDisposableResource: Fu,
  __disposeResources: Hu,
  __rewriteRelativeImportExtension: zu
}, cd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __addDisposableResource: Fu,
  get __assign() {
    return yi;
  },
  __asyncDelegator: Ru,
  __asyncGenerator: Pu,
  __asyncValues: Vu,
  __await: Nn,
  __awaiter: Cu,
  __classPrivateFieldGet: Du,
  __classPrivateFieldIn: Uu,
  __classPrivateFieldSet: qu,
  __createBinding: bi,
  __decorate: wu,
  __disposeResources: Hu,
  __esDecorate: ku,
  __exportStar: Tu,
  __extends: mu,
  __generator: Nu,
  __importDefault: Mu,
  __importStar: Lu,
  __makeTemplateObject: Bu,
  __metadata: Iu,
  __param: _u,
  __propKey: xu,
  __read: io,
  __rest: bu,
  __rewriteRelativeImportExtension: zu,
  __runInitializers: Su,
  __setFunctionName: Ou,
  __spread: Au,
  __spreadArray: Eu,
  __spreadArrays: ju,
  __values: gi,
  default: ad
}, Symbol.toStringTag, { value: "Module" })), re = /* @__PURE__ */ id(cd);
var Ei = {}, Pi = {}, qo;
function ud() {
  return qo || (qo = 1, Object.defineProperty(Pi, "__esModule", { value: !0 })), Pi;
}
var Ri = {}, En = {}, Vi = {}, Bi = {}, Pn = {}, Uo;
function ld() {
  if (Uo) return Pn;
  Uo = 1, Object.defineProperty(Pn, "__esModule", { value: !0 }), Pn.dim = void 0;
  const r = (e) => e;
  return Pn.dim = r, Pn;
}
var Fo;
function hd() {
  return Fo || (Fo = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.toLine = void 0;
    const e = ld(), t = (n) => " " + (n.length ? `{ ${n.toString().split(",").map((s) => Number(s).toString(16).toUpperCase().padStart(n.BYTES_PER_ELEMENT << 1, "0")).join(" ")} }` : "{}"), i = (n, s = " ") => {
      switch (n) {
        case null:
          return "!n";
        case void 0:
          return "!u";
        case !0:
          return "!t";
        case !1:
          return "!f";
      }
      switch (typeof n) {
        case "number":
        case "bigint": {
          const o = typeof n == "number" && Math.round(n) !== n ? n + "" : Intl.NumberFormat("en-US").format(n) + (typeof n == "bigint" ? "n" : "");
          return o[0] === "0" && o[1] === "." ? o.slice(1) : o;
        }
        case "string":
          return n ? n.split(/([\u0000-\u001F]|\n|\t)/).filter(Boolean).map((a) => a === `
` ? "⏎" : a === "	" ? "⇥" : a.length === 1 && a.charCodeAt(0) < 32 ? "\\x" + a.charCodeAt(0).toString(16).padStart(2, "0") : (0, e.dim)('"') + JSON.stringify(a).slice(1, -1) + (0, e.dim)('"')).join(" ") : '""';
        case "object": {
          if (Array.isArray(n))
            return n.length ? `[${s}${n.map((a) => (0, r.toLine)(a, s)).join("," + s)}${s}]` : "[]";
          if (n instanceof DataView)
            return n.constructor.name + t(new Uint8Array(n.buffer, n.byteOffset, n.byteLength));
          if (ArrayBuffer.isView(n))
            return n.constructor.name + t(n);
          if (n instanceof ArrayBuffer)
            return "ArrayBuffer" + t(new Uint8Array(n));
          if (n instanceof Date)
            return "Date { " + n.getTime() + " }";
          if (n instanceof RegExp)
            return n + "";
          const o = Object.keys(n);
          return o.length ? `{${s}${o.map((a) => `${a}${s}${(0, e.dim)("=")}${s}${(0, r.toLine)(n[a], s)}`).join("," + s)}${s}}` : "{}";
        }
        case "function":
          return `fn ${(0, r.toLine)(n.name)} ( ${n.length} args )`;
        case "symbol":
          return `sym ( ${n.description} )`;
      }
      return "?";
    };
    r.toLine = i;
  })(Bi)), Bi;
}
var Li = {}, Mi = {}, Ho;
function dd() {
  return Ho || (Ho = 1, Object.defineProperty(Mi, "__esModule", { value: !0 })), Mi;
}
var Di = {}, qi = {}, zo;
function fd() {
  return zo || (zo = 1, Object.defineProperty(qi, "__esModule", { value: !0 })), qi;
}
var Ui = {}, Zo;
function pd() {
  return Zo || (Zo = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.ServerClockVector = r.ClockVector = r.LogicalClock = r.interval = r.printTs = r.containsId = r.contains = r.compare = r.equal = r.tick = r.tss = r.ts = r.Timespan = r.Timestamp = void 0;
    class e {
      constructor(m, _) {
        this.sid = m, this.time = _;
      }
    }
    r.Timestamp = e;
    class t {
      constructor(m, _, f) {
        this.sid = m, this.time = _, this.span = f;
      }
    }
    r.Timespan = t;
    const i = (k, m) => new e(k, m);
    r.ts = i;
    const n = (k, m, _) => new t(k, m, _);
    r.tss = n;
    const s = (k, m) => (0, r.ts)(k.sid, k.time + m);
    r.tick = s;
    const o = (k, m) => k.time === m.time && k.sid === m.sid;
    r.equal = o;
    const a = (k, m) => {
      const _ = k.time, f = m.time;
      if (_ > f)
        return 1;
      if (_ < f)
        return -1;
      const d = k.sid, y = m.sid;
      return d > y ? 1 : d < y ? -1 : 0;
    };
    r.compare = a;
    const u = (k, m, _, f) => {
      if (k.sid !== _.sid)
        return !1;
      const d = k.time, y = _.time;
      return !(d > y || d + m < y + f);
    };
    r.contains = u;
    const l = (k, m, _) => {
      if (k.sid !== _.sid)
        return !1;
      const f = k.time, d = _.time;
      return !(f > d || f + m < d + 1);
    };
    r.containsId = l;
    const c = (k) => {
      if (k.sid === 1)
        return "." + k.time;
      let m = "" + k.sid;
      return m.length > 4 && (m = ".." + m.slice(m.length - 4)), m + "." + k.time;
    };
    r.printTs = c;
    const h = (k, m, _) => new t(k.sid, k.time + m, _);
    r.interval = h;
    class g extends e {
      /**
       * Returns a new timestamp, which is the current clock value, and advances the
       * clock by a number of cycles.
       *
       * @param cycles Number of cycles to advance the clock.
       * @returns A new timestamp, which is the current clock value.
       */
      tick(m) {
        const _ = new e(this.sid, this.time);
        return this.time += m, _;
      }
    }
    r.LogicalClock = g;
    class p extends g {
      constructor() {
        super(...arguments), this.peers = /* @__PURE__ */ new Map();
      }
      /**
       * Advances local time every time we see any timestamp with higher time value.
       * This is an idempotent method which can be called every time a new timestamp
       * is observed, it advances the local time only if the observed timestamp is
       * greater than the current local time.
       *
       * @param id The time stamp we observed.
       * @param span Length of the time span.
       */
      observe(m, _) {
        const f = m.time + _ - 1, d = m.sid;
        if (d !== this.sid) {
          const y = this.peers.get(m.sid);
          y ? f > y.time && (y.time = f) : this.peers.set(m.sid, (0, r.ts)(d, f));
        }
        f >= this.time && (this.time = f + 1);
      }
      /**
       * Returns a deep copy of the current vector clock with the same session ID.
       *
       * @returns A new vector clock, which is a clone of the current vector clock.
       */
      clone() {
        return this.fork(this.sid);
      }
      /**
       * Returns a deep copy of the current vector clock with a different session ID.
       *
       * @param sessionId The session ID of the new vector clock.
       * @returns A new vector clock, which is a fork of the current vector clock.
       */
      fork(m) {
        const _ = new p(m, this.time);
        return m !== this.sid && _.observe((0, r.tick)(this, -1), 1), this.peers.forEach((f) => {
          _.observe(f, 1);
        }), _;
      }
      /**
       * Returns a human-readable string representation of the clock vector.
       *
       * @param tab String to use for indentation.
       * @returns Human-readable string representation of the clock vector.
       */
      toString(m = "") {
        const _ = this.peers.size;
        let f = 1, d = "";
        return this.peers.forEach((y) => {
          d += `
${m}${f === _ ? "└─" : "├─"} ${y.sid}.${y.time}`, f++;
        }), `clock ${this.sid}.${this.time}${d}`;
      }
    }
    r.ClockVector = p;
    class b extends g {
      constructor() {
        super(...arguments), this.peers = /* @__PURE__ */ new Map();
      }
      observe(m, _) {
        if (m.sid > 8)
          throw new Error("INVALID_SERVER_SESSION");
        if (this.time < m.time)
          throw new Error("TIME_TRAVEL");
        const f = m.time + _;
        f > this.time && (this.time = f);
      }
      clone() {
        return this.fork();
      }
      fork() {
        return new b(1, this.time);
      }
      /**
       * Returns a human-readable string representation of the clock vector.
       *
       * @returns Human-readable string representation of the clock vector.
       */
      toString() {
        return `clock ${this.sid}.${this.time}`;
      }
    }
    r.ServerClockVector = b;
  })(Ui)), Ui;
}
var Ko;
function de() {
  return Ko || (Ko = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(fd(), r), e.__exportStar(pd(), r);
  })(Di)), Di;
}
var Q = {}, Rn = {}, Jo;
function Ee() {
  if (Jo) return Rn;
  Jo = 1, Object.defineProperty(Rn, "__esModule", { value: !0 }), Rn.printTree = void 0;
  const r = (e = "", t) => {
    let i = "", n = t.length - 1;
    for (; n >= 0 && !t[n]; n--)
      ;
    for (let s = 0; s <= n; s++) {
      const o = t[s];
      if (!o)
        continue;
      const a = s === n, u = o(e + (a ? " " : "│") + "  "), l = u ? a ? "└─" : "├─" : "│";
      i += `
` + e + l + (u ? " " + u : "");
    }
    return i;
  };
  return Rn.printTree = r, Rn;
}
var Wo;
function ei() {
  if (Wo) return Q;
  Wo = 1, Object.defineProperty(Q, "__esModule", { value: !0 }), Q.NopOp = Q.DelOp = Q.UpdArrOp = Q.InsArrOp = Q.InsBinOp = Q.InsStrOp = Q.InsVecOp = Q.InsObjOp = Q.InsValOp = Q.NewArrOp = Q.NewBinOp = Q.NewStrOp = Q.NewVecOp = Q.NewObjOp = Q.NewValOp = Q.NewConOp = void 0;
  const r = Ee(), e = de();
  class t {
    constructor(y) {
      this.id = y;
    }
    span() {
      return 1;
    }
    toString() {
      let y = this.name() + " " + (0, e.printTs)(this.id);
      const v = this.span();
      return v > 1 && (y += "!" + v), y;
    }
  }
  class i extends t {
    constructor(y, v) {
      super(y), this.id = y, this.val = v;
    }
    name() {
      return "new_con";
    }
    toString() {
      const y = this.val, v = "Uint8Array", w = y instanceof e.Timestamp ? `{ ${(0, e.printTs)(y)} }` : y instanceof Uint8Array ? y.length < 13 ? `${v} { ${("" + y).replaceAll(",", ", ")} }` : `${v}(${y.length})` : `{ ${JSON.stringify(y)} }`;
      return super.toString() + " " + w;
    }
  }
  Q.NewConOp = i;
  class n extends t {
    name() {
      return "new_val";
    }
  }
  Q.NewValOp = n;
  class s extends t {
    name() {
      return "new_obj";
    }
  }
  Q.NewObjOp = s;
  class o extends t {
    name() {
      return "new_vec";
    }
  }
  Q.NewVecOp = o;
  class a extends t {
    name() {
      return "new_str";
    }
  }
  Q.NewStrOp = a;
  class u extends t {
    name() {
      return "new_bin";
    }
  }
  Q.NewBinOp = u;
  class l extends t {
    name() {
      return "new_arr";
    }
  }
  Q.NewArrOp = l;
  class c extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.val = w;
    }
    name() {
      return "ins_val";
    }
    toString() {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}, val = ${(0, e.printTs)(this.val)}`;
    }
  }
  Q.InsValOp = c;
  class h extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.data = w;
    }
    name() {
      return "ins_obj";
    }
    toString(y = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, r.printTree)(y, this.data.map((w) => (x) => `${JSON.stringify(w[0])}: ${(0, e.printTs)(w[1])}`));
    }
  }
  Q.InsObjOp = h;
  class g extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.data = w;
    }
    name() {
      return "ins_vec";
    }
    toString(y = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, r.printTree)(y, this.data.map((w) => (x) => `${w[0]}: ${(0, e.printTs)(w[1])}`));
    }
  }
  Q.InsVecOp = g;
  class p extends t {
    constructor(y, v, w, x) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = x;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_str";
    }
    toString() {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${(0, e.printTs)(this.ref)} ← ${JSON.stringify(this.data)} }`;
    }
  }
  Q.InsStrOp = p;
  class b extends t {
    constructor(y, v, w, x) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = x;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_bin";
    }
    toString() {
      const y = (0, e.printTs)(this.ref);
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${y} ← ${this.data} }`;
    }
  }
  Q.InsBinOp = b;
  class k extends t {
    /**
     * @param id ID if the first operation in this compound operation.
     * @param obj ID of the array where to insert elements. In theory `arr` is
     *        not necessary as it is possible to find the `arr` just using the
     *        `after` property, however to efficiently be able to find `arr` just
     *        by `after` at runtime all operations would need to be indexed and
     *        also they each would need to store a pointer to array type, which
     *        would require additional dozens of bytes of RAM for each array
     *        insert operation.
     * @param ref ID of the element after which to insert elements.
     * @param data The elements to insert.
     */
    constructor(y, v, w, x) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = x;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_arr";
    }
    toString() {
      const y = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = this.data.map(e.printTs).join(", ");
      return super.toString() + ", obj = " + y + " { " + v + " ← " + w + " }";
    }
  }
  Q.InsArrOp = k;
  class m extends t {
    /**
     * @param id ID of this operation.
     * @param obj and "arr" object ID where to update an element.
     * @param ref ID of the element to update.
     * @param val ID of the new value to set.
     */
    constructor(y, v, w, x) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.val = x;
    }
    name() {
      return "upd_arr";
    }
    toString() {
      const y = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = (0, e.printTs)(this.val);
      return super.toString() + ", obj = " + y + " { " + v + ": " + w + " }";
    }
  }
  Q.UpdArrOp = m;
  class _ extends t {
    /**
     * @param id ID of this operation.
     * @param obj Object in which to delete something.
     * @param what ID of the first operation to be deleted.
     */
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.what = w;
    }
    name() {
      return "del";
    }
    toString() {
      const y = this.what.map((v) => (0, e.printTs)(v) + "!" + v.span).join(", ");
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${y} }`;
    }
  }
  Q.DelOp = _;
  class f extends t {
    constructor(y, v) {
      super(y), this.id = y, this.len = v;
    }
    span() {
      return this.len;
    }
    name() {
      return "nop";
    }
  }
  return Q.NopOp = f, Q;
}
var Vn = {}, Fi = {}, Bn = {}, Ln = {}, Mn = {}, Dn = {}, Go;
function yd() {
  if (Go) return Dn;
  Go = 1, Object.defineProperty(Dn, "__esModule", { value: !0 }), Dn.Slice = void 0;
  let r = class {
    constructor(t, i, n, s) {
      this.uint8 = t, this.view = i, this.start = n, this.end = s;
    }
    subarray() {
      return this.uint8.subarray(this.start, this.end);
    }
  };
  return Dn.Slice = r, Dn;
}
var Xo;
function Zu() {
  if (Xo) return Mn;
  Xo = 1, Object.defineProperty(Mn, "__esModule", { value: !0 }), Mn.Writer = void 0;
  const r = yd(), e = new Uint8Array([]), t = new DataView(e.buffer), i = typeof Buffer == "function", n = i ? Buffer.prototype.utf8Write : null, s = i ? Buffer.from : null, o = typeof TextEncoder < "u" ? new TextEncoder() : null;
  let a = class {
    /**
     * @param allocSize Number of bytes to allocate at a time when buffer ends.
     */
    constructor(l = 64 * 1024) {
      this.allocSize = l, this.view = t, this.x0 = 0, this.x = 0, this.uint8 = new Uint8Array(l), this.size = l, this.view = new DataView(this.uint8.buffer);
    }
    /** @ignore */
    grow(l) {
      const c = this.x0, h = this.x, g = this.uint8, p = new Uint8Array(l), b = new DataView(p.buffer), k = g.subarray(c, h);
      p.set(k, 0), this.x = h - c, this.x0 = 0, this.uint8 = p, this.size = l, this.view = b;
    }
    /**
     * Make sure the internal buffer has enough space to write the specified number
     * of bytes, otherwise resize the internal buffer to accommodate for more size.
     *
     * @param capacity Number of bytes.
     */
    ensureCapacity(l) {
      const c = this.size, h = c - this.x;
      if (h < l) {
        const g = c - this.x0, p = l - h, b = g + p;
        this.grow(b <= this.allocSize ? this.allocSize : b * 2);
      }
    }
    /** @todo Consider renaming to "skip"? */
    move(l) {
      this.ensureCapacity(l), this.x += l;
    }
    reset() {
      this.x0 = this.x;
    }
    /**
     * Allocates a new {@link ArrayBuffer}, useful when the underlying
     * {@link ArrayBuffer} cannot be shared between threads.
     *
     * @param size Size of memory to allocate.
     */
    newBuffer(l) {
      const c = this.uint8 = new Uint8Array(l);
      this.size = l, this.view = new DataView(c.buffer), this.x = this.x0 = 0;
    }
    /**
     * @returns Encoded memory buffer contents.
     */
    flush() {
      const l = this.uint8.subarray(this.x0, this.x);
      return this.x0 = this.x, l;
    }
    flushSlice() {
      const l = new r.Slice(this.uint8, this.view, this.x0, this.x);
      return this.x0 = this.x, l;
    }
    u8(l) {
      this.ensureCapacity(1), this.uint8[this.x++] = l;
    }
    u16(l) {
      this.ensureCapacity(2), this.view.setUint16(this.x, l), this.x += 2;
    }
    u32(l) {
      this.ensureCapacity(4), this.view.setUint32(this.x, l), this.x += 4;
    }
    i32(l) {
      this.ensureCapacity(4), this.view.setInt32(this.x, l), this.x += 4;
    }
    u64(l) {
      this.ensureCapacity(8), this.view.setBigUint64(this.x, BigInt(l)), this.x += 8;
    }
    f64(l) {
      this.ensureCapacity(8), this.view.setFloat64(this.x, l), this.x += 8;
    }
    u8u16(l, c) {
      this.ensureCapacity(3);
      let h = this.x;
      this.uint8[h++] = l, this.uint8[h++] = c >>> 8, this.uint8[h++] = c & 255, this.x = h;
    }
    u8u32(l, c) {
      this.ensureCapacity(5);
      let h = this.x;
      this.uint8[h++] = l, this.view.setUint32(h, c), this.x = h + 4;
    }
    u8u64(l, c) {
      this.ensureCapacity(9);
      let h = this.x;
      this.uint8[h++] = l, this.view.setBigUint64(h, BigInt(c)), this.x = h + 8;
    }
    u8f32(l, c) {
      this.ensureCapacity(5);
      let h = this.x;
      this.uint8[h++] = l, this.view.setFloat32(h, c), this.x = h + 4;
    }
    u8f64(l, c) {
      this.ensureCapacity(9);
      let h = this.x;
      this.uint8[h++] = l, this.view.setFloat64(h, c), this.x = h + 8;
    }
    buf(l, c) {
      this.ensureCapacity(c);
      const h = this.x;
      this.uint8.set(l, h), this.x = h + c;
    }
    /**
     * Encodes string as UTF-8. You need to call .ensureCapacity(str.length * 4)
     * before calling
     *
     * @param str String to encode as UTF-8.
     * @returns The number of bytes written
     */
    utf8(l) {
      const c = l.length * 4;
      if (c < 168)
        return this.utf8Native(l);
      this.ensureCapacity(c);
      const h = this.size - this.x;
      if (n) {
        const g = n.call(this.uint8, l, this.x, h);
        return this.x += g, g;
      } else if (s) {
        const g = this.uint8, p = g.byteOffset + this.x, k = s(g.buffer).subarray(p, p + h).write(l, 0, h, "utf8");
        return this.x += k, k;
      } else if (c > 1024 && o) {
        const g = o.encodeInto(l, this.uint8.subarray(this.x, this.x + h)).written;
        return this.x += g, g;
      }
      return this.utf8Native(l);
    }
    utf8Native(l) {
      const c = l.length, h = this.uint8;
      let g = this.x, p = 0;
      for (; p < c; ) {
        let k = l.charCodeAt(p++);
        if ((k & 4294967168) === 0) {
          h[g++] = k;
          continue;
        } else if ((k & 4294965248) === 0)
          h[g++] = k >> 6 & 31 | 192;
        else {
          if (k >= 55296 && k <= 56319 && p < c) {
            const m = l.charCodeAt(p);
            (m & 64512) === 56320 && (p++, k = ((k & 1023) << 10) + (m & 1023) + 65536);
          }
          (k & 4294901760) === 0 ? (h[g++] = k >> 12 & 15 | 224, h[g++] = k >> 6 & 63 | 128) : (h[g++] = k >> 18 & 7 | 240, h[g++] = k >> 12 & 63 | 128, h[g++] = k >> 6 & 63 | 128);
        }
        h[g++] = k & 63 | 128;
      }
      const b = g - this.x;
      return this.x = g, b;
    }
    ascii(l) {
      const c = l.length;
      this.ensureCapacity(c);
      const h = this.uint8;
      let g = this.x, p = 0;
      for (; p < c; )
        h[g++] = l.charCodeAt(p++);
      this.x = g;
    }
  };
  return Mn.Writer = a, Mn;
}
var Yo;
function so() {
  if (Yo) return Ln;
  Yo = 1, Object.defineProperty(Ln, "__esModule", { value: !0 }), Ln.CrdtWriter = void 0;
  const r = Zu();
  let e = class extends r.Writer {
    /**
     * In the below encoding diagrams bits are annotated as follows:
     *
     * - "x" - vector table index, reference to the logical clock.
     * - "y" - time difference.
     * - "?" - whether the next byte is used for encoding.
     *
     * If x is less than 8 and y is less than 16, the relative ID is encoded as a
     * single byte:
     *
     * ```
     * +--------+
     * |0xxxyyyy|
     * +--------+
     * ```
     *
     * Otherwise the top bit of the first byte is set to 1; and x and y are encoded
     * separately using b1vuint28 and vuint39, respectively.
     *
     * ```
     *       x          y
     * +===========+=========+
     * | b1vuint28 | vuint39 |
     * +===========+=========+
     * ```
     *
     * The boolean flag of x b1vuint28 value is always set to 1.
     */
    id(i, n) {
      i <= 7 && n <= 15 ? this.u8(i << 4 | n) : (this.b1vu56(1, i), this.vu57(n));
    }
    /**
     * #### `vu57`
     *
     * `vu57` stands for *variable length unsigned 57 bit integer*. It consumes
     * up to 8 bytes. The maximum size of the decoded value is 57 bits.
     *
     * The high bit `?` of each octet indicates if the next byte should be
     * consumed, up to 8 bytes. When `?` is set to `0`, it means that the current
     * byte is the last byte of the encoded value.
     *
     * ```
     *  byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
     * +--------+........+........+........+........+........+........+········+
     * |?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
     * +--------+........+........+........+........+........+........+········+
     *
     *            11111    2211111  2222222  3333332  4443333  4444444 55555555
     *   7654321  4321098  1098765  8765432  5432109  2109876  9876543 76543210
     *     |                        |                    |             |
     *     5th bit of z             |                    |             |
     *                              28th bit of z        |             57th bit of z
     *                                                   39th bit of z
     * ```
     *
     * @param num Number to encode as variable length unsigned 57 bit integer.
     */
    vu57(i) {
      if (i <= 127)
        this.u8(i);
      else if (i <= 16383) {
        this.ensureCapacity(2);
        const n = this.uint8;
        n[this.x++] = 128 | i & 127, n[this.x++] = i >>> 7;
      } else if (i <= 2097151) {
        this.ensureCapacity(3);
        const n = this.uint8;
        n[this.x++] = 128 | i & 127, n[this.x++] = 128 | i >>> 7 & 127, n[this.x++] = i >>> 14;
      } else if (i <= 268435455) {
        this.ensureCapacity(4);
        const n = this.uint8;
        n[this.x++] = 128 | i & 127, n[this.x++] = 128 | i >>> 7 & 127, n[this.x++] = 128 | i >>> 14 & 127, n[this.x++] = i >>> 21;
      } else {
        let n = i | 0;
        n < 0 && (n += 4294967296);
        const s = (i - n) / 4294967296;
        if (i <= 34359738367) {
          this.ensureCapacity(5);
          const o = this.uint8;
          o[this.x++] = 128 | i & 127, o[this.x++] = 128 | i >>> 7 & 127, o[this.x++] = 128 | i >>> 14 & 127, o[this.x++] = 128 | i >>> 21 & 127, o[this.x++] = s << 4 | i >>> 28;
        } else if (i <= 4398046511103) {
          this.ensureCapacity(6);
          const o = this.uint8;
          o[this.x++] = 128 | i & 127, o[this.x++] = 128 | i >>> 7 & 127, o[this.x++] = 128 | i >>> 14 & 127, o[this.x++] = 128 | i >>> 21 & 127, o[this.x++] = 128 | (s & 7) << 4 | i >>> 28, o[this.x++] = s >>> 3;
        } else if (i <= 562949953421311) {
          this.ensureCapacity(7);
          const o = this.uint8;
          o[this.x++] = 128 | i & 127, o[this.x++] = 128 | i >>> 7 & 127, o[this.x++] = 128 | i >>> 14 & 127, o[this.x++] = 128 | i >>> 21 & 127, o[this.x++] = 128 | (s & 7) << 4 | i >>> 28, o[this.x++] = 128 | (s & 1016) >>> 3, o[this.x++] = s >>> 10;
        } else {
          this.ensureCapacity(8);
          const o = this.uint8;
          o[this.x++] = 128 | i & 127, o[this.x++] = 128 | i >>> 7 & 127, o[this.x++] = 128 | i >>> 14 & 127, o[this.x++] = 128 | i >>> 21 & 127, o[this.x++] = 128 | (s & 7) << 4 | i >>> 28, o[this.x++] = 128 | (s & 1016) >>> 3, o[this.x++] = 128 | (s & 130048) >>> 10, o[this.x++] = s >>> 17;
        }
      }
    }
    /**
     * #### `b1vu56`
     *
     * `b1vu56` stands for: 1 bit flag followed by variable length unsigned 56 bit integer.
     * It consumes up to 8 bytes.
     *
     * The high bit "?" of each byte indicates if the next byte should be
     * consumed, up to 8 bytes.
     *
     * - f - flag
     * - z - variable length unsigned 56 bit integer
     * - ? - whether the next byte is used for encoding
     *
     * ```
     * byte 1                                                         byte 8
     * +--------+........+........+........+........+........+........+········+
     * |f?zzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
     * +--------+........+........+........+........+........+........+········+
     *
     *            1111     2111111  2222222  3333322  4433333  4444444 55555554
     *    654321  3210987  0987654  7654321  4321098  1098765  8765432 65432109
     *     |                        |                    |             |
     *     5th bit of z             |                    |             |
     *                              27th bit of z        |             56th bit of z
     *                                                   38th bit of z
     * ```
     *
     * @param num Number to encode as variable length unsigned 56 bit integer.
     */
    b1vu56(i, n) {
      if (n <= 63)
        this.u8(i << 7 | n);
      else {
        const s = i << 7 | 64;
        if (n <= 8191) {
          this.ensureCapacity(2);
          const o = this.uint8;
          o[this.x++] = s | n & 63, o[this.x++] = n >>> 6;
        } else if (n <= 1048575) {
          this.ensureCapacity(3);
          const o = this.uint8;
          o[this.x++] = s | n & 63, o[this.x++] = 128 | n >>> 6 & 127, o[this.x++] = n >>> 13;
        } else if (n <= 134217727) {
          this.ensureCapacity(4);
          const o = this.uint8;
          o[this.x++] = s | n & 63, o[this.x++] = 128 | n >>> 6 & 127, o[this.x++] = 128 | n >>> 13 & 127, o[this.x++] = n >>> 20;
        } else {
          let o = n | 0;
          o < 0 && (o += 4294967296);
          const a = (n - o) / 4294967296;
          if (n <= 17179869183) {
            this.ensureCapacity(5);
            const u = this.uint8;
            u[this.x++] = s | n & 63, u[this.x++] = 128 | n >>> 6 & 127, u[this.x++] = 128 | n >>> 13 & 127, u[this.x++] = 128 | n >>> 20 & 127, u[this.x++] = a << 5 | n >>> 27;
          } else if (n <= 2199023255551) {
            this.ensureCapacity(6);
            const u = this.uint8;
            u[this.x++] = s | n & 63, u[this.x++] = 128 | n >>> 6 & 127, u[this.x++] = 128 | n >>> 13 & 127, u[this.x++] = 128 | n >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | n >>> 27, u[this.x++] = a >>> 2;
          } else if (n <= 281474976710655) {
            this.ensureCapacity(7);
            const u = this.uint8;
            u[this.x++] = s | n & 63, u[this.x++] = 128 | n >>> 6 & 127, u[this.x++] = 128 | n >>> 13 & 127, u[this.x++] = 128 | n >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | n >>> 27, u[this.x++] = 128 | (a & 508) >>> 2, u[this.x++] = a >>> 9;
          } else {
            this.ensureCapacity(8);
            const u = this.uint8;
            u[this.x++] = s | n & 63, u[this.x++] = 128 | n >>> 6 & 127, u[this.x++] = 128 | n >>> 13 & 127, u[this.x++] = 128 | n >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | n >>> 27, u[this.x++] = 128 | (a & 508) >>> 2, u[this.x++] = 128 | (a & 65024) >>> 9, u[this.x++] = a >>> 16;
          }
        }
      }
    }
  };
  return Ln.CrdtWriter = e, Ln;
}
var qn = {}, Un = {}, Qo;
function gd() {
  if (Qo) return Un;
  Qo = 1, Object.defineProperty(Un, "__esModule", { value: !0 }), Un.isFloat32 = void 0;
  const r = new DataView(new ArrayBuffer(4)), e = (t) => (r.setFloat32(0, t), t === r.getFloat32(0));
  return Un.isFloat32 = e, Un;
}
var Fn = {}, $o;
function Ku() {
  if ($o) return Fn;
  $o = 1, Object.defineProperty(Fn, "__esModule", { value: !0 }), Fn.JsonPackExtension = void 0;
  let r = class {
    constructor(t, i) {
      this.tag = t, this.val = i;
    }
  };
  return Fn.JsonPackExtension = r, Fn;
}
var Hn = {}, ea;
function vd() {
  if (ea) return Hn;
  ea = 1, Object.defineProperty(Hn, "__esModule", { value: !0 }), Hn.CborEncoderFast = void 0;
  const r = Zu(), e = Number.isSafeInteger;
  let t = class {
    constructor(n = new r.Writer()) {
      this.writer = n;
    }
    encode(n) {
      return this.writeAny(n), this.writer.flush();
    }
    writeAny(n) {
      switch (typeof n) {
        case "number":
          return this.writeNumber(n);
        case "string":
          return this.writeStr(n);
        case "boolean":
          return this.writer.u8(244 + +n);
        case "object": {
          if (!n)
            return this.writer.u8(246);
          switch (n.constructor) {
            case Array:
              return this.writeArr(n);
            default:
              return this.writeObj(n);
          }
        }
      }
    }
    writeCbor() {
      this.writer.u8u16(217, 55799);
    }
    writeEnd() {
      this.writer.u8(
        255
        /* CONST.END */
      );
    }
    writeNull() {
      this.writer.u8(246);
    }
    writeBoolean(n) {
      n ? this.writer.u8(245) : this.writer.u8(244);
    }
    writeNumber(n) {
      e(n) ? this.writeInteger(n) : typeof n == "bigint" ? this.writeBigInt(n) : this.writeFloat(n);
    }
    writeBigInt(n) {
      n >= 0 ? this.writeBigUint(n) : this.writeBigSint(n);
    }
    writeBigUint(n) {
      if (n <= Number.MAX_SAFE_INTEGER)
        return this.writeUInteger(Number(n));
      this.writer.u8u64(27, n);
    }
    writeBigSint(n) {
      if (n >= Number.MIN_SAFE_INTEGER)
        return this.encodeNint(Number(n));
      const s = -BigInt(1) - n;
      this.writer.u8u64(59, s);
    }
    writeInteger(n) {
      n >= 0 ? this.writeUInteger(n) : this.encodeNint(n);
    }
    writeUInteger(n) {
      const s = this.writer;
      s.ensureCapacity(9);
      const o = s.uint8;
      let a = s.x;
      n <= 23 ? o[a++] = 0 + n : n <= 255 ? (o[a++] = 24, o[a++] = n) : n <= 65535 ? (o[a++] = 25, s.view.setUint16(a, n), a += 2) : n <= 4294967295 ? (o[a++] = 26, s.view.setUint32(a, n), a += 4) : (o[a++] = 27, s.view.setBigUint64(a, BigInt(n)), a += 8), s.x = a;
    }
    /** @deprecated Remove and use `writeNumber` instead. */
    encodeNumber(n) {
      this.writeNumber(n);
    }
    /** @deprecated Remove and use `writeInteger` instead. */
    encodeInteger(n) {
      this.writeInteger(n);
    }
    /** @deprecated */
    encodeUint(n) {
      this.writeUInteger(n);
    }
    encodeNint(n) {
      const s = -1 - n, o = this.writer;
      o.ensureCapacity(9);
      const a = o.uint8;
      let u = o.x;
      s < 24 ? a[u++] = 32 + s : s <= 255 ? (a[u++] = 56, a[u++] = s) : s <= 65535 ? (a[u++] = 57, o.view.setUint16(u, s), u += 2) : s <= 4294967295 ? (a[u++] = 58, o.view.setUint32(u, s), u += 4) : (a[u++] = 59, o.view.setBigUint64(u, BigInt(s)), u += 8), o.x = u;
    }
    writeFloat(n) {
      this.writer.u8f64(251, n);
    }
    writeBin(n) {
      const s = n.length;
      this.writeBinHdr(s), this.writer.buf(n, s);
    }
    writeBinHdr(n) {
      const s = this.writer;
      n <= 23 ? s.u8(64 + n) : n <= 255 ? s.u16(22528 + n) : n <= 65535 ? s.u8u16(89, n) : n <= 4294967295 ? s.u8u32(90, n) : s.u8u64(91, n);
    }
    writeStr(n) {
      const s = this.writer, a = n.length * 4;
      s.ensureCapacity(5 + a);
      const u = s.uint8;
      let l = s.x;
      a <= 23 ? s.x++ : a <= 255 ? (u[s.x++] = 120, l = s.x, s.x++) : a <= 65535 ? (u[s.x++] = 121, l = s.x, s.x += 2) : (u[s.x++] = 122, l = s.x, s.x += 4);
      const c = s.utf8(n);
      a <= 23 ? u[l] = 96 + c : a <= 255 ? u[l] = c : a <= 65535 ? s.view.setUint16(l, c) : s.view.setUint32(l, c);
    }
    writeStrHdr(n) {
      const s = this.writer;
      n <= 23 ? s.u8(96 + n) : n <= 255 ? s.u16(30720 + n) : n <= 65535 ? s.u8u16(121, n) : s.u8u32(122, n);
    }
    writeAsciiStr(n) {
      this.writeStrHdr(n.length), this.writer.ascii(n);
    }
    writeArr(n) {
      const s = n.length;
      this.writeArrHdr(s);
      for (let o = 0; o < s; o++)
        this.writeAny(n[o]);
    }
    writeArrHdr(n) {
      const s = this.writer;
      n <= 23 ? s.u8(128 + n) : n <= 255 ? s.u16(38912 + n) : n <= 65535 ? s.u8u16(153, n) : n <= 4294967295 ? s.u8u32(154, n) : s.u8u64(155, n);
    }
    writeObj(n) {
      const s = Object.keys(n), o = s.length;
      this.writeObjHdr(o);
      for (let a = 0; a < o; a++) {
        const u = s[a];
        this.writeStr(u), this.writeAny(n[u]);
      }
    }
    writeObjHdr(n) {
      const s = this.writer;
      n <= 23 ? s.u8(160 + n) : n <= 255 ? s.u16(47104 + n) : n <= 65535 ? s.u8u16(185, n) : n <= 4294967295 ? s.u8u32(186, n) : s.u8u64(187, n);
    }
    writeMapHdr(n) {
      this.writeObjHdr(n);
    }
    writeStartMap() {
      this.writer.u8(191);
    }
    writeTag(n, s) {
      this.writeTagHdr(n), this.writeAny(s);
    }
    writeTagHdr(n) {
      const s = this.writer;
      n <= 23 ? s.u8(192 + n) : n <= 255 ? s.u16(55296 + n) : n <= 65535 ? s.u8u16(217, n) : n <= 4294967295 ? s.u8u32(218, n) : s.u8u64(219, n);
    }
    writeTkn(n) {
      const s = this.writer;
      n <= 23 ? s.u8(224 + n) : n <= 255 && s.u16(63488 + n);
    }
    // ------------------------------------------------------- Streaming encoding
    writeStartStr() {
      this.writer.u8(127);
    }
    writeStrChunk(n) {
      throw new Error("Not implemented");
    }
    writeEndStr() {
      throw new Error("Not implemented");
    }
    writeStartBin() {
      this.writer.u8(95);
    }
    writeBinChunk(n) {
      throw new Error("Not implemented");
    }
    writeEndBin() {
      throw new Error("Not implemented");
    }
    writeStartArr() {
      this.writer.u8(159);
    }
    writeArrChunk(n) {
      throw new Error("Not implemented");
    }
    writeEndArr() {
      this.writer.u8(
        255
        /* CONST.END */
      );
    }
    writeStartObj() {
      this.writer.u8(191);
    }
    writeObjChunk(n, s) {
      throw new Error("Not implemented");
    }
    writeEndObj() {
      this.writer.u8(
        255
        /* CONST.END */
      );
    }
  };
  return Hn.CborEncoderFast = t, Hn;
}
var zn = {}, ta;
function oo() {
  if (ta) return zn;
  ta = 1, Object.defineProperty(zn, "__esModule", { value: !0 }), zn.JsonPackValue = void 0;
  let r = class {
    constructor(t) {
      this.val = t;
    }
  };
  return zn.JsonPackValue = r, zn;
}
var na;
function Ju() {
  if (na) return qn;
  na = 1, Object.defineProperty(qn, "__esModule", { value: !0 }), qn.CborEncoder = void 0;
  const r = gd(), e = Ku(), t = vd(), i = oo();
  let n = class extends t.CborEncoderFast {
    /**
     * Called when the encoder encounters a value that it does not know how to encode.
     *
     * @param value Some JavaScript value.
     */
    writeUnknown(o) {
      this.writeNull();
    }
    writeAny(o) {
      switch (typeof o) {
        case "number":
          return this.writeNumber(o);
        case "string":
          return this.writeStr(o);
        case "boolean":
          return this.writer.u8(244 + +o);
        case "object": {
          if (!o)
            return this.writer.u8(246);
          switch (o.constructor) {
            case Object:
              return this.writeObj(o);
            case Array:
              return this.writeArr(o);
            case Uint8Array:
              return this.writeBin(o);
            case Map:
              return this.writeMap(o);
            case e.JsonPackExtension:
              return this.writeTag(o.tag, o.val);
            case i.JsonPackValue: {
              const u = o.val;
              return this.writer.buf(u, u.length);
            }
            default:
              return o instanceof Uint8Array ? this.writeBin(o) : Array.isArray(o) ? this.writeArr(o) : o instanceof Map ? this.writeMap(o) : this.writeUnknown(o);
          }
        }
        case "undefined":
          return this.writeUndef();
        case "bigint":
          return this.writeBigInt(o);
        default:
          return this.writeUnknown(o);
      }
    }
    writeFloat(o) {
      (0, r.isFloat32)(o) ? this.writer.u8f32(250, o) : this.writer.u8f64(251, o);
    }
    writeMap(o) {
      this.writeMapHdr(o.size), o.forEach((a, u) => {
        this.writeAny(u), this.writeAny(a);
      });
    }
    writeUndef() {
      this.writer.u8(247);
    }
  };
  return qn.CborEncoder = n, qn;
}
var ra;
function Wu() {
  if (ra) return Bn;
  ra = 1, Object.defineProperty(Bn, "__esModule", { value: !0 }), Bn.Encoder = void 0;
  const e = re.__importStar(ei()), t = so(), i = de(), n = Ju();
  class s extends n.CborEncoder {
    /**
     * Creates a new encoder instance.
     *
     * @param writer An optional custom implementation of CRDT writer.
     */
    constructor(a = new t.CrdtWriter()) {
      super(a), this.writer = a, this.patchSid = 0;
    }
    /**
     * Encodes a JSON CRDT Patch into a {@link Uint8Array} blob.
     *
     * @param patch A JSON CRDT Patch to encode.
     * @returns A {@link Uint8Array} blob containing the encoded JSON CRDT Patch.
     */
    encode(a) {
      this.writer.reset();
      const u = a.getId(), l = this.patchSid = u.sid, c = this.writer;
      c.vu57(l), c.vu57(u.time);
      const h = a.meta;
      return h === void 0 ? this.writeUndef() : this.writeArr([h]), this.encodeOperations(a), c.flush();
    }
    encodeOperations(a) {
      const u = a.ops, l = u.length;
      this.writer.vu57(l);
      for (let c = 0; c < l; c++)
        this.encodeOperation(u[c]);
    }
    encodeId(a) {
      const u = a.sid, l = a.time, c = this.writer;
      u === this.patchSid ? c.b1vu56(0, l) : (c.b1vu56(1, l), c.vu57(u));
    }
    encodeTss(a) {
      this.encodeId(a), this.writer.vu57(a.span);
    }
    writeInsStr(a, u, l, c) {
      const h = this.writer;
      return a <= 7 ? h.u8(96 + a) : (h.u8(
        96
        /* JsonCrdtPatchOpcodeOverlay.ins_str */
      ), h.vu57(a)), this.encodeId(u), this.encodeId(l), h.utf8(c);
    }
    encodeOperation(a) {
      const u = this.writer;
      switch (a.constructor) {
        case e.NewConOp: {
          const h = a.val;
          h instanceof i.Timestamp ? (u.u8(1), this.encodeId(h)) : (u.u8(
            0
            /* JsonCrdtPatchOpcodeOverlay.new_con */
          ), this.writeAny(h));
          break;
        }
        case e.NewValOp: {
          u.u8(
            8
            /* JsonCrdtPatchOpcodeOverlay.new_val */
          );
          break;
        }
        case e.NewObjOp: {
          u.u8(
            16
            /* JsonCrdtPatchOpcodeOverlay.new_obj */
          );
          break;
        }
        case e.NewVecOp: {
          u.u8(
            24
            /* JsonCrdtPatchOpcodeOverlay.new_vec */
          );
          break;
        }
        case e.NewStrOp: {
          u.u8(
            32
            /* JsonCrdtPatchOpcodeOverlay.new_str */
          );
          break;
        }
        case e.NewBinOp: {
          u.u8(
            40
            /* JsonCrdtPatchOpcodeOverlay.new_bin */
          );
          break;
        }
        case e.NewArrOp: {
          u.u8(
            48
            /* JsonCrdtPatchOpcodeOverlay.new_arr */
          );
          break;
        }
        case e.InsValOp: {
          const c = a;
          u.u8(
            72
            /* JsonCrdtPatchOpcodeOverlay.ins_val */
          ), this.encodeId(c.obj), this.encodeId(c.val);
          break;
        }
        case e.InsObjOp: {
          const c = a, h = c.data, g = h.length;
          g <= 7 ? u.u8(80 + g) : (u.u8(
            80
            /* JsonCrdtPatchOpcodeOverlay.ins_obj */
          ), u.vu57(g)), this.encodeId(c.obj);
          for (let p = 0; p < g; p++) {
            const b = h[p];
            this.writeStr(b[0]), this.encodeId(b[1]);
          }
          break;
        }
        case e.InsVecOp: {
          const c = a, h = c.data, g = h.length;
          g <= 7 ? u.u8(88 + g) : (u.u8(
            88
            /* JsonCrdtPatchOpcodeOverlay.ins_vec */
          ), u.vu57(g)), this.encodeId(c.obj);
          for (let p = 0; p < g; p++) {
            const b = h[p];
            u.u8(b[0]), this.encodeId(b[1]);
          }
          break;
        }
        case e.InsStrOp: {
          const c = a, h = c.obj, g = c.ref, p = c.data, b = p.length;
          u.ensureCapacity(24 + b * 4);
          const k = u.x, m = this.writeInsStr(b, h, g, p);
          b !== m && (u.x = k, this.writeInsStr(m, h, g, p));
          break;
        }
        case e.InsBinOp: {
          const c = a, h = c.data, g = h.length;
          g <= 7 ? u.u8(104 + g) : (u.u8(
            104
            /* JsonCrdtPatchOpcodeOverlay.ins_bin */
          ), u.vu57(g)), this.encodeId(c.obj), this.encodeId(c.ref), u.buf(h, g);
          break;
        }
        case e.InsArrOp: {
          const c = a, h = c.data, g = h.length;
          g <= 7 ? u.u8(112 + g) : (u.u8(
            112
            /* JsonCrdtPatchOpcodeOverlay.ins_arr */
          ), u.vu57(g)), this.encodeId(c.obj), this.encodeId(c.ref);
          for (let p = 0; p < g; p++)
            this.encodeId(h[p]);
          break;
        }
        case e.UpdArrOp: {
          const c = a;
          u.u8(
            120
            /* JsonCrdtPatchOpcodeOverlay.upd_arr */
          ), this.encodeId(c.obj), this.encodeId(c.ref), this.encodeId(c.val);
          break;
        }
        case e.DelOp: {
          const c = a, h = c.what, g = h.length;
          g <= 7 ? u.u8(128 + g) : (u.u8(
            128
            /* JsonCrdtPatchOpcodeOverlay.del */
          ), u.vu57(g)), this.encodeId(c.obj);
          for (let p = 0; p < g; p++)
            this.encodeTss(h[p]);
          break;
        }
        case e.NopOp: {
          const h = a.len;
          h <= 7 ? u.u8(136 + h) : (u.u8(
            136
            /* JsonCrdtPatchOpcodeOverlay.nop */
          ), u.vu57(h));
          break;
        }
        default:
          throw new Error("UNKNOWN_OP");
      }
    }
  }
  return Bn.Encoder = s, Bn;
}
var Zn = {}, Kn = {}, Jn = {}, Wn = {}, ii = {}, It = {}, ia;
function md() {
  if (ia) return It;
  ia = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.decodeAsciiMax15 = It.decodeAscii = void 0;
  const r = String.fromCharCode, e = (i, n, s) => {
    const o = [];
    for (let a = 0; a < s; a++) {
      const u = i[n++];
      if (u & 128)
        return;
      o.push(u);
    }
    return r.apply(String, o);
  };
  It.decodeAscii = e;
  const t = (i, n, s) => {
    if (s < 4)
      if (s < 2) {
        if (s === 0)
          return "";
        {
          const o = i[n++];
          if ((o & 128) > 1) {
            n -= 1;
            return;
          }
          return r(o);
        }
      } else {
        const o = i[n++], a = i[n++];
        if ((o & 128) > 0 || (a & 128) > 0) {
          n -= 2;
          return;
        }
        if (s < 3)
          return r(o, a);
        const u = i[n++];
        if ((u & 128) > 0) {
          n -= 3;
          return;
        }
        return r(o, a, u);
      }
    else {
      const o = i[n++], a = i[n++], u = i[n++], l = i[n++];
      if ((o & 128) > 0 || (a & 128) > 0 || (u & 128) > 0 || (l & 128) > 0) {
        n -= 4;
        return;
      }
      if (s < 6) {
        if (s === 4)
          return r(o, a, u, l);
        {
          const c = i[n++];
          if ((c & 128) > 0) {
            n -= 5;
            return;
          }
          return r(o, a, u, l, c);
        }
      } else if (s < 8) {
        const c = i[n++], h = i[n++];
        if ((c & 128) > 0 || (h & 128) > 0) {
          n -= 6;
          return;
        }
        if (s < 7)
          return r(o, a, u, l, c, h);
        const g = i[n++];
        if ((g & 128) > 0) {
          n -= 7;
          return;
        }
        return r(o, a, u, l, c, h, g);
      } else {
        const c = i[n++], h = i[n++], g = i[n++], p = i[n++];
        if ((c & 128) > 0 || (h & 128) > 0 || (g & 128) > 0 || (p & 128) > 0) {
          n -= 8;
          return;
        }
        if (s < 10) {
          if (s === 8)
            return r(o, a, u, l, c, h, g, p);
          {
            const b = i[n++];
            if ((b & 128) > 0) {
              n -= 9;
              return;
            }
            return r(o, a, u, l, c, h, g, p, b);
          }
        } else if (s < 12) {
          const b = i[n++], k = i[n++];
          if ((b & 128) > 0 || (k & 128) > 0) {
            n -= 10;
            return;
          }
          if (s < 11)
            return r(o, a, u, l, c, h, g, p, b, k);
          const m = i[n++];
          if ((m & 128) > 0) {
            n -= 11;
            return;
          }
          return r(o, a, u, l, c, h, g, p, b, k, m);
        } else {
          const b = i[n++], k = i[n++], m = i[n++], _ = i[n++];
          if ((b & 128) > 0 || (k & 128) > 0 || (m & 128) > 0 || (_ & 128) > 0) {
            n -= 12;
            return;
          }
          if (s < 14) {
            if (s === 12)
              return r(o, a, u, l, c, h, g, p, b, k, m, _);
            {
              const f = i[n++];
              if ((f & 128) > 0) {
                n -= 13;
                return;
              }
              return r(o, a, u, l, c, h, g, p, b, k, m, _, f);
            }
          } else {
            const f = i[n++], d = i[n++];
            if ((f & 128) > 0 || (d & 128) > 0) {
              n -= 14;
              return;
            }
            if (s < 15)
              return r(o, a, u, l, c, h, g, p, b, k, m, _, f, d);
            const y = i[n++];
            if ((y & 128) > 0) {
              n -= 15;
              return;
            }
            return r(o, a, u, l, c, h, g, p, b, k, m, _, f, d, y);
          }
        }
      }
    }
  };
  return It.decodeAsciiMax15 = t, It;
}
var si = {}, sa;
function bd() {
  if (sa) return si;
  sa = 1, Object.defineProperty(si, "__esModule", { value: !0 });
  const r = String.fromCharCode;
  return si.default = (e, t, i) => {
    let n = t;
    const s = n + i, o = [];
    for (; n < s; ) {
      let a = e[n++];
      if ((a & 128) !== 0) {
        const u = e[n++] & 63;
        if ((a & 224) === 192)
          a = (a & 31) << 6 | u;
        else {
          const l = e[n++] & 63;
          if ((a & 240) === 224)
            a = (a & 31) << 12 | u << 6 | l;
          else if ((a & 248) === 240) {
            const c = e[n++] & 63;
            let h = (a & 7) << 18 | u << 12 | l << 6 | c;
            if (h > 65535) {
              h -= 65536;
              const g = h >>> 10 & 1023 | 55296;
              a = 56320 | h & 1023, o.push(g);
            } else
              a = h;
          }
        }
      }
      o.push(a);
    }
    return r.apply(String, o);
  }, si;
}
var oa;
function wd() {
  if (oa) return ii;
  oa = 1, Object.defineProperty(ii, "__esModule", { value: !0 });
  const r = re, e = md(), t = r.__importDefault(bd()), i = typeof Buffer < "u", n = i ? Buffer.prototype.utf8Slice : null, s = i ? Buffer.from : null, o = (c, h, g) => (0, e.decodeAsciiMax15)(c, h, g) ?? (0, t.default)(c, h, g), a = (c, h, g) => (0, e.decodeAscii)(c, h, g) ?? (0, t.default)(c, h, g), u = n ? (c, h, g) => n.call(c, h, h + g) : s ? (c, h, g) => s(c).subarray(h, h + g).toString("utf8") : t.default, l = (c, h, g) => g < 16 ? o(c, h, g) : g < 32 ? a(c, h, g) : u(c, h, g);
  return ii.default = l, ii;
}
var aa;
function _d() {
  if (aa) return Wn;
  aa = 1, Object.defineProperty(Wn, "__esModule", { value: !0 }), Wn.decodeUtf8 = void 0;
  const e = re.__importDefault(wd());
  return Wn.decodeUtf8 = e.default, Wn;
}
var ca;
function Xu() {
  if (ca) return Jn;
  ca = 1, Object.defineProperty(Jn, "__esModule", { value: !0 }), Jn.Reader = void 0;
  const r = _d();
  let e = class Gu {
    constructor(i = new Uint8Array([]), n = new DataView(i.buffer, i.byteOffset, i.length), s = 0, o = i.length) {
      this.uint8 = i, this.view = n, this.x = s, this.end = o;
    }
    reset(i) {
      this.x = 0, this.uint8 = i, this.view = new DataView(i.buffer, i.byteOffset, i.length);
    }
    size() {
      return this.end - this.x;
    }
    /**
     * Get current byte value without advancing the cursor.
     */
    peek() {
      return this.view.getUint8(this.x);
    }
    /**
     * @deprecated Use peek() instead.
     */
    peak() {
      return this.peek();
    }
    skip(i) {
      this.x += i;
    }
    buf(i = this.size()) {
      const n = this.x, s = n + i, o = this.uint8.subarray(n, s);
      return this.x = s, o;
    }
    subarray(i = 0, n) {
      const s = this.x, o = s + i, a = typeof n == "number" ? s + n : this.end;
      return this.uint8.subarray(o, a);
    }
    /**
     * Creates a new {@link Reader} that references the same underlying memory
     * buffer. But with independent cursor and end.
     *
     * Preferred over {@link buf} since it also provides a DataView and is much
     * faster to allocate a new {@link Slice} than a new {@link Uint8Array}.
     *
     * @param start Start offset relative to the current cursor position.
     * @param end End offset relative to the current cursor position.
     * @returns A new {@link Reader} instance.
     */
    slice(i = 0, n) {
      const s = this.x, o = s + i, a = typeof n == "number" ? s + n : this.end;
      return new Gu(this.uint8, this.view, o, a);
    }
    /**
     * Similar to {@link slice} but also advances the cursor. Returns a new
     * {@link Reader} that references the same underlying memory buffer, starting
     * from the current cursor position.
     *
     * @param size Number of bytes to cut from the current position.
     * @returns A new {@link Reader} instance.
     */
    cut(i = this.size()) {
      const n = this.slice(0, i);
      return this.skip(i), n;
    }
    u8() {
      return this.uint8[this.x++];
    }
    i8() {
      return this.view.getInt8(this.x++);
    }
    u16() {
      let i = this.x;
      const n = (this.uint8[i++] << 8) + this.uint8[i++];
      return this.x = i, n;
    }
    i16() {
      const i = this.view.getInt16(this.x);
      return this.x += 2, i;
    }
    u32() {
      const i = this.view.getUint32(this.x);
      return this.x += 4, i;
    }
    i32() {
      const i = this.view.getInt32(this.x);
      return this.x += 4, i;
    }
    u64() {
      const i = this.view.getBigUint64(this.x);
      return this.x += 8, i;
    }
    i64() {
      const i = this.view.getBigInt64(this.x);
      return this.x += 8, i;
    }
    f32() {
      const i = this.x;
      return this.x += 4, this.view.getFloat32(i);
    }
    f64() {
      const i = this.x;
      return this.x += 8, this.view.getFloat64(i);
    }
    utf8(i) {
      const n = this.x;
      return this.x += i, (0, r.decodeUtf8)(this.uint8, n, i);
    }
    ascii(i) {
      const n = this.uint8;
      let s = "";
      const o = this.x + i;
      for (let a = this.x; a < o; a++)
        s += String.fromCharCode(n[a]);
      return this.x = o, s;
    }
  };
  return Jn.Reader = e, Jn;
}
var ua;
function Yu() {
  if (ua) return Kn;
  ua = 1, Object.defineProperty(Kn, "__esModule", { value: !0 }), Kn.CrdtReader = void 0;
  const r = Xu();
  let e = class extends r.Reader {
    id() {
      const i = this.u8();
      return i <= 127 ? [i >>> 4, i & 15] : (this.x--, [this.b1vu56()[1], this.vu57()]);
    }
    idSkip() {
      this.u8() <= 127 || (this.x--, this.b1vu56(), this.vu57Skip());
    }
    vu57() {
      const i = this.u8();
      if (i <= 127)
        return i;
      const n = this.u8();
      if (n <= 127)
        return n << 7 | i & 127;
      const s = this.u8();
      if (s <= 127)
        return s << 14 | (n & 127) << 7 | i & 127;
      const o = this.u8();
      if (o <= 127)
        return o << 21 | (s & 127) << 14 | (n & 127) << 7 | i & 127;
      const a = this.u8();
      if (a <= 127)
        return a * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (n & 127) << 7 | i & 127);
      const u = this.u8();
      if (u <= 127)
        return u * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (n & 127) << 7 | i & 127));
      const l = this.u8();
      return l <= 127 ? l * 4398046511104 + ((u & 127) * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (n & 127) << 7 | i & 127))) : this.u8() * 562949953421312 + ((l & 127) * 4398046511104 + ((u & 127) * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (n & 127) << 7 | i & 127))));
    }
    vu57Skip() {
      this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.x++;
    }
    b1vu56() {
      const i = this.u8(), n = i & 128 ? 1 : 0, s = 127 & i;
      if (s <= 63)
        return [n, s];
      const o = this.u8();
      if (o <= 127)
        return [n, o << 6 | s & 63];
      const a = this.u8();
      if (a <= 127)
        return [n, a << 13 | (o & 127) << 6 | s & 63];
      const u = this.u8();
      if (u <= 127)
        return [n, u << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63];
      const l = this.u8();
      if (l <= 127)
        return [
          n,
          l * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63)
        ];
      const c = this.u8();
      if (c <= 127)
        return [
          n,
          c * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63))
        ];
      const h = this.u8();
      if (h <= 127)
        return [
          n,
          h * 2199023255552 + ((c & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63)))
        ];
      const g = this.u8();
      return [
        n,
        g * 281474976710656 + ((h & 127) * 2199023255552 + ((c & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63))))
      ];
    }
  };
  return Kn.CrdtReader = e, Kn;
}
var Gn = {}, Xn = {}, la;
function ao() {
  return la || (la = 1, Object.defineProperty(Xn, "__esModule", { value: !0 }), Xn.isUint8Array = void 0, Xn.isUint8Array = typeof Buffer == "function" ? (r) => r instanceof Uint8Array || Buffer.isBuffer(r) : (r) => r instanceof Uint8Array), Xn;
}
var Hi = {}, zi = {}, ha;
function kd() {
  return ha || (ha = 1, Object.defineProperty(zi, "__esModule", { value: !0 })), zi;
}
var da;
function wi() {
  return da || (da = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.ORIGIN = void 0;
    const e = re, t = de();
    e.__exportStar(kd(), r), r.ORIGIN = (0, t.ts)(
      0,
      0
      /* SYSTEM_SESSION_TIME.ORIGIN */
    );
  })(Hi)), Hi;
}
var Zi = {}, Ki = {}, Yn = {}, fa;
function _i() {
  if (fa) return Yn;
  fa = 1, Object.defineProperty(Yn, "__esModule", { value: !0 }), Yn.printBinary = void 0;
  const r = (e = "", t) => {
    const i = t[0], n = t[1];
    let s = "";
    return i && (s += `
` + e + "← " + i(e + "  ")), n && (s += `
` + e + "→ " + n(e + "  ")), s;
  };
  return Yn.printBinary = r, Yn;
}
var Qn = {}, pa;
function Sd() {
  if (pa) return Qn;
  pa = 1, Object.defineProperty(Qn, "__esModule", { value: !0 }), Qn.printJson = void 0;
  const r = (e = "", t, i = 2) => (JSON.stringify(t, null, i) || "nil").split(`
`).join(`
` + e);
  return Qn.printJson = r, Qn;
}
var ya;
function xd() {
  return ya || (ya = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Ee(), r), e.__exportStar(_i(), r), e.__exportStar(Sd(), r);
  })(Ki)), Ki;
}
var ga;
function ki() {
  return ga || (ga = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.s = r.schema = r.nodes = r.SchemaNode = r.NodeBuilder = void 0;
    const e = re, t = ao(), i = de(), n = e.__importStar(nl()), s = xd(), o = (c) => {
      switch (typeof c) {
        case "number":
        case "boolean":
        case "undefined":
          return !0;
        case "object":
          return c === null || c instanceof i.Timestamp;
        default:
          return !1;
      }
    };
    class a {
      constructor(h) {
        this._build = h;
      }
      build(h) {
        var g;
        return ((g = this._build) == null ? void 0 : g.call(this, h)) ?? h.con(void 0);
      }
    }
    r.NodeBuilder = a;
    class u extends a {
      toString(h) {
        return this.type;
      }
    }
    r.SchemaNode = u;
    var l;
    (function(c) {
      class h extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "con";
        }
        build(y) {
          return y.con(this.raw);
        }
        toString(y) {
          return this.type + " " + n.con(this.raw);
        }
      }
      c.con = h;
      class g extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "str";
        }
        build(y) {
          return y.json(this.raw);
        }
        toString(y) {
          return this.type + " " + n.con(this.raw);
        }
      }
      c.str = g;
      class p extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "bin";
        }
        build(y) {
          return y.json(this.raw);
        }
        toString(y) {
          return this.type + " " + n.bin(this.raw);
        }
      }
      c.bin = p;
      class b extends u {
        constructor(y) {
          super(), this.value = y, this.type = "val";
        }
        build(y) {
          const v = y.val(), w = this.value.build(y);
          return y.setVal(v, w), v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [(v) => this.value.toString(v)]);
        }
      }
      c.val = b;
      class k extends u {
        constructor(y) {
          super(), this.value = y, this.type = "vec";
        }
        build(y) {
          const v = y.vec(), w = this.value, x = w.length;
          if (x) {
            const I = [];
            for (let C = 0; C < x; C++) {
              const E = w[C];
              if (!E)
                continue;
              const O = E.build(y);
              I.push([C, O]);
            }
            y.insVec(v, I);
          }
          return v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [
            ...this.value.map((v, w) => (x) => `${w}: ${v ? v.toString(x) : n.line(v)}`)
          ]);
        }
      }
      c.vec = k;
      class m extends u {
        constructor(y, v) {
          super(), this.obj = y, this.opt = v, this.type = "obj";
        }
        optional() {
          return this;
        }
        build(y) {
          const v = y.obj(), w = [], x = { ...this.obj, ...this.opt }, I = Object.keys(x), C = I.length;
          if (C) {
            for (let E = 0; E < C; E++) {
              const O = I[E], T = x[O].build(y);
              w.push([O, T]);
            }
            y.insObj(v, w);
          }
          return v;
        }
        toString(y = "") {
          return this.type + (0, s.printTree)(y, [
            ...[...Object.entries(this.obj)].map(([v, w]) => (x) => n.line(v) + (0, s.printTree)(x + " ", [(I) => w.toString(I)])),
            ...[...Object.entries(this.opt ?? [])].map(([v, w]) => (x) => n.line(v) + "?" + (0, s.printTree)(x + " ", [(I) => w.toString(I)]))
          ]);
        }
      }
      c.obj = m;
      class _ extends u {
        constructor(y) {
          super(), this.arr = y, this.type = "arr";
        }
        build(y) {
          const v = y.arr(), w = this.arr, x = w.length;
          if (x) {
            const I = [];
            for (let C = 0; C < x; C++)
              I.push(w[C].build(y));
            y.insArr(v, v, I);
          }
          return v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [
            ...this.arr.map((v, w) => (x) => `[${w}]: ${v ? v.toString(x) : n.line(v)}`)
          ]);
        }
      }
      c.arr = _;
      class f extends u {
        /**
         * @param id A unique extension ID.
         * @param data Schema of the data node of the extension.
         */
        constructor(y, v) {
          super(), this.id = y, this.data = v, this.type = "ext";
        }
        build(y) {
          const v = new Uint8Array([this.id, 0, 0]), w = y.vec();
          return v[1] = w.sid % 256, v[2] = w.time % 256, y.insVec(w, [
            [0, y.constOrJson(r.s.con(v))],
            [1, this.data.build(y)]
          ]), w;
        }
        toString(y) {
          return this.type + "(" + this.id + ")" + (0, s.printTree)(y, [(v) => this.data.toString(v)]);
        }
      }
      c.ext = f;
    })(l || (r.nodes = l = {})), r.schema = {
      /**
       * Creates a "con" node schema and the default value.
       *
       * @param raw Raw default value.
       */
      con: (c) => new l.con(c),
      /**
       * Creates a "str" node schema and the default value.
       *
       * @param str Default value.
       */
      str: (c) => new l.str(c || ""),
      /**
       * Creates a "bin" node schema and the default value.
       *
       * @param bin Default value.
       */
      bin: (c) => new l.bin(c),
      /**
       * Creates a "val" node schema and the default value.
       *
       * @param val Default value.
       */
      val: (c) => new l.val(c),
      /**
       * Creates a "vec" node schema and the default value.
       *
       * @param vec Default value.
       */
      vec: (...c) => new l.vec(c),
      /**
       * Creates a "obj" node schema and the default value.
       *
       * @param obj Default value, required object keys.
       * @param opt Default value of optional object keys.
       */
      obj: (c, h) => new l.obj(c, h),
      /**
       * This is an alias for {@link schema.obj}. It creates a "map" node schema,
       * which is an object where a key can be any string and the value is of the
       * same type.
       *
       * @param obj Default value.
       */
      map: (c) => r.schema.obj(c),
      /**
       * Creates an "arr" node schema and the default value.
       *
       * @param arr Default value.
       */
      arr: (c) => new l.arr(c),
      /**
       * Recursively creates a node tree from any POJO.
       */
      json: (c) => {
        switch (typeof c) {
          case "object": {
            if (!c)
              return r.s.val(r.s.con(c));
            if (c instanceof a)
              return c;
            if (Array.isArray(c))
              return r.s.arr(c.map((h) => r.s.json(h)));
            if ((0, t.isUint8Array)(c))
              return r.s.bin(c);
            if (c instanceof i.Timestamp)
              return r.s.val(r.s.con(c));
            {
              const h = {}, g = Object.keys(c);
              for (const p of g)
                h[p] = r.s.jsonCon(c[p]);
              return r.s.obj(h);
            }
          }
          case "string":
            return r.s.str(c);
          default:
            return r.s.val(r.s.con(c));
        }
      },
      /**
       * Recursively creates a schema node tree from any POJO. Same as {@link json}, but
       * converts constant values to {@link nodes.con} nodes, instead wrapping them into
       * {@link nodes.val} nodes.
       *
       * @todo Remove this once "arr" RGA supports in-place updates.
       */
      jsonCon: (c) => o(c) ? r.s.con(c) : r.s.json(c),
      /**
       * Creates an extension node schema.
       *
       * @param id A unique extension ID.
       * @param data Schema of the data node of the extension.
       */
      ext: (c, h) => new l.ext(c, h)
    }, r.s = r.schema;
  })(Zi)), Zi;
}
var va;
function co() {
  if (va) return Gn;
  va = 1, Object.defineProperty(Gn, "__esModule", { value: !0 }), Gn.PatchBuilder = void 0;
  const e = re.__importStar(ei()), t = de(), i = ao(), n = tl(), s = wi(), o = ki(), a = (l) => {
    switch (typeof l) {
      case "number":
      case "boolean":
        return !0;
      default:
        return l === null;
    }
  };
  let u = class {
    /**
     * Creates a new PatchBuilder instance.
     *
     * @param clock Clock to use for generating timestamps.
     */
    constructor(c) {
      this.clock = c, this.patch = new n.Patch();
    }
    /**
     * Retrieve the sequence number of the next timestamp.
     *
     * @returns The next timestamp sequence number that will be used by the builder.
     */
    nextTime() {
      return this.patch.nextTime() || this.clock.time;
    }
    /**
     * Returns the current {@link Patch} instance and resets the builder.
     *
     * @returns A new {@link Patch} instance containing all operations created
     *          using this builder.
     */
    flush() {
      const c = this.patch;
      return this.patch = new n.Patch(), c;
    }
    // --------------------------------------------------------- Basic operations
    /**
     * Create a new "obj" LWW-Map object.
     *
     * @returns ID of the new operation.
     */
    obj() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewObjOp(c)), c;
    }
    /**
     * Create a new "arr" RGA-Array object.
     *
     * @returns ID of the new operation.
     */
    arr() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewArrOp(c)), c;
    }
    /**
     * Create a new "vec" LWW-Array vector.
     *
     * @returns ID of the new operation.
     */
    vec() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewVecOp(c)), c;
    }
    /**
     * Create a new "str" RGA-String object.
     *
     * @returns ID of the new operation.
     */
    str() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewStrOp(c)), c;
    }
    /**
     * Create a new "bin" RGA-Binary object.
     *
     * @returns ID of the new operation.
     */
    bin() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewBinOp(c)), c;
    }
    /**
     * Create a new immutable constant JSON value. Can be anything, including
     * nested arrays and objects.
     *
     * @param value JSON value
     * @returns ID of the new operation.
     */
    con(c) {
      this.pad();
      const h = this.clock.tick(1);
      return this.patch.ops.push(new e.NewConOp(h, c)), h;
    }
    /**
     * Create a new "val" LWW-Register object. Can be anything, including
     * nested arrays and objects.
     *
     * @param val Reference to another object.
     * @returns ID of the new operation.
     * @todo Rename to `newVal`.
     */
    val() {
      this.pad();
      const c = this.clock.tick(1);
      return this.patch.ops.push(new e.NewValOp(c)), c;
    }
    /**
     * Set value of document's root LWW-Register.
     *
     * @returns ID of the new operation.
     */
    root(c) {
      return this.setVal(s.ORIGIN, c);
    }
    /**
     * Set fields of an "obj" object.
     *
     * @returns ID of the new operation.
     */
    insObj(c, h) {
      if (!h.length)
        throw new Error("EMPTY_TUPLES");
      this.pad();
      const g = this.clock.tick(1), p = new e.InsObjOp(g, c, h), b = p.span();
      return b > 1 && this.clock.tick(b - 1), this.patch.ops.push(p), g;
    }
    /**
     * Set elements of a "vec" object.
     *
     * @returns ID of the new operation.
     */
    insVec(c, h) {
      if (!h.length)
        throw new Error("EMPTY_TUPLES");
      this.pad();
      const g = this.clock.tick(1), p = new e.InsVecOp(g, c, h), b = p.span();
      return b > 1 && this.clock.tick(b - 1), this.patch.ops.push(p), g;
    }
    /**
     * Set value of a "val" object.
     *
     * @returns ID of the new operation.
     * @todo Rename to "insVal".
     */
    setVal(c, h) {
      this.pad();
      const g = this.clock.tick(1), p = new e.InsValOp(g, c, h);
      return this.patch.ops.push(p), g;
    }
    /**
     * Insert a substring into a "str" object.
     *
     * @returns ID of the new operation.
     */
    insStr(c, h, g) {
      if (!g.length)
        throw new Error("EMPTY_STRING");
      this.pad();
      const p = this.clock.tick(1), b = new e.InsStrOp(p, c, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Insert binary data into a "bin" object.
     *
     * @returns ID of the new operation.
     */
    insBin(c, h, g) {
      if (!g.length)
        throw new Error("EMPTY_BINARY");
      this.pad();
      const p = this.clock.tick(1), b = new e.InsBinOp(p, c, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Insert elements into an "arr" object.
     *
     * @returns ID of the new operation.
     */
    insArr(c, h, g) {
      this.pad();
      const p = this.clock.tick(1), b = new e.InsArrOp(p, c, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Update an element in an "arr" object.
     *
     * @returns ID of the new operation.
     */
    updArr(c, h, g) {
      this.pad();
      const p = this.clock.tick(1), b = new e.UpdArrOp(p, c, h, g);
      return this.patch.ops.push(b), p;
    }
    /**
     * Delete a span of operations.
     *
     * @param obj Object in which to delete something.
     * @param what List of time spans to delete.
     * @returns ID of the new operation.
     */
    del(c, h) {
      this.pad();
      const g = this.clock.tick(1);
      return this.patch.ops.push(new e.DelOp(g, c, h)), g;
    }
    /**
     * Operation that does nothing just skips IDs in the patch.
     *
     * @param span Length of the operation.
     * @returns ID of the new operation.
     *
     */
    nop(c) {
      this.pad();
      const h = this.clock.tick(c);
      return this.patch.ops.push(new e.NopOp(h, c)), h;
    }
    // --------------------------------------- JSON value construction operations
    /**
     * Run the necessary builder commands to create an arbitrary JSON object.
     */
    jsonObj(c) {
      const h = this.obj(), g = Object.keys(c);
      if (g.length) {
        const p = [];
        for (const b of g) {
          const k = c[b], m = k instanceof t.Timestamp ? k : a(k) ? this.con(k) : this.json(k);
          p.push([b, m]);
        }
        this.insObj(h, p);
      }
      return h;
    }
    /**
     * Run the necessary builder commands to create an arbitrary JSON array.
     */
    jsonArr(c) {
      const h = this.arr();
      if (c.length) {
        const g = [];
        for (const p of c)
          g.push(this.json(p));
        this.insArr(h, h, g);
      }
      return h;
    }
    /**
     * Run builder commands to create a JSON string.
     */
    jsonStr(c) {
      const h = this.str();
      return c && this.insStr(h, h, c), h;
    }
    /**
     * Run builder commands to create a binary data type.
     */
    jsonBin(c) {
      const h = this.bin();
      return c.length && this.insBin(h, h, c), h;
    }
    /**
     * Run builder commands to create a JSON value.
     */
    jsonVal(c) {
      const h = this.val(), g = this.con(c);
      return this.setVal(h, g), h;
    }
    /**
     * Run the necessary builder commands to create any arbitrary JSON value.
     */
    json(c) {
      if (c instanceof t.Timestamp)
        return c;
      if (c === void 0)
        return this.con(c);
      if (c instanceof Array)
        return this.jsonArr(c);
      if ((0, i.isUint8Array)(c))
        return this.jsonBin(c);
      if (c instanceof o.NodeBuilder)
        return c.build(this);
      switch (typeof c) {
        case "object":
          return c === null ? this.jsonVal(c) : this.jsonObj(c);
        case "string":
          return this.jsonStr(c);
        case "number":
        case "boolean":
          return this.jsonVal(c);
      }
      throw new Error("INVALID_JSON");
    }
    /**
     * Given a JSON `value` creates the necessary builder commands to create
     * JSON CRDT Patch operations to construct the value. If the `value` is a
     * timestamp, it is returned as-is. If the `value` is a JSON primitive is
     * a number, boolean, or `null`, it is converted to a "con" data type. Otherwise,
     * the `value` is converted using the {@link PatchBuilder.json} method.
     *
     * @param value A JSON value for which to create JSON CRDT Patch construction operations.
     * @returns ID of the root constructed CRDT object.
     */
    constOrJson(c) {
      return c instanceof t.Timestamp ? c : a(c) ? this.con(c) : this.json(c);
    }
    /**
     * Creates a "con" data type unless the value is already a timestamp, in which
     * case it is returned as-is.
     *
     * @param value Value to convert to a "con" data type.
     * @returns ID of the new "con" object.
     */
    maybeConst(c) {
      return c instanceof t.Timestamp ? c : this.con(c);
    }
    // ------------------------------------------------------------------ Private
    /**
     * Add padding "noop" operation if clock's time has jumped. This method checks
     * if clock has advanced past the ID of the last operation of the patch and,
     * if so, adds a "noop" operation to the patch to pad the gap.
     */
    pad() {
      const c = this.patch.nextTime();
      if (!c)
        return;
      const h = this.clock.time - c;
      if (h > 0) {
        const g = (0, t.ts)(this.clock.sid, c), p = new e.NopOp(g, h);
        this.patch.ops.push(p);
      }
    }
  };
  return Gn.PatchBuilder = u, Gn;
}
var $n = {}, er = {}, tr = {}, ma;
function Od() {
  if (ma) return tr;
  ma = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.decodeF16 = void 0;
  const r = Math.pow, e = (t) => {
    const i = (t & 31744) >> 10, n = t & 1023;
    return (t >> 15 ? -1 : 1) * (i ? i === 31 ? n ? NaN : 1 / 0 : r(2, i - 15) * (1 + n / 1024) : 6103515625e-14 * (n / 1024));
  };
  return tr.decodeF16 = e, tr;
}
var oi = {}, nr = {}, ai = {}, ba;
function Id() {
  if (ba) return ai;
  ba = 1, Object.defineProperty(ai, "__esModule", { value: !0 });
  const r = String.fromCharCode;
  return ai.default = (e, t, i) => {
    let n = t;
    const s = n + i;
    let o = "";
    for (; n < s; ) {
      const a = e[n++];
      if ((a & 128) === 0) {
        o += r(a);
        continue;
      }
      const u = e[n++] & 63;
      if ((a & 224) === 192) {
        o += r((a & 31) << 6 | u);
        continue;
      }
      const l = e[n++] & 63;
      if ((a & 240) === 224) {
        o += r((a & 31) << 12 | u << 6 | l);
        continue;
      }
      if ((a & 248) === 240) {
        const c = e[n++] & 63;
        let h = (a & 7) << 18 | u << 12 | l << 6 | c;
        if (h > 65535) {
          h -= 65536;
          const g = h >>> 10 & 1023 | 55296;
          h = 56320 | h & 1023, o += r(g, h);
        } else
          o += r(h);
      } else
        o += r(a);
    }
    return o;
  }, ai;
}
var wa;
function Cd() {
  if (wa) return nr;
  wa = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.CachedUtf8Decoder = void 0;
  const e = re.__importDefault(Id());
  let t = 1 + Math.round(Math.random() * ((-1 >>> 0) - 1));
  function i(o, a) {
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, (t >>> 0) % (a - o + 1) + o;
  }
  class n {
    constructor(a, u) {
      this.bytes = a, this.value = u;
    }
  }
  let s = class {
    constructor() {
      this.caches = [];
      for (let a = 0; a < 31; a++)
        this.caches.push([]);
    }
    get(a, u, l) {
      const c = this.caches[l - 1], h = c.length;
      e: for (let g = 0; g < h; g++) {
        const p = c[g], b = p.bytes;
        for (let k = 0; k < l; k++)
          if (b[k] !== a[u + k])
            continue e;
        return p.value;
      }
      return null;
    }
    store(a, u) {
      const l = this.caches[a.length - 1], c = new n(a, u);
      l.length >= 16 ? l[i(0, 15)] = c : l.push(c);
    }
    decode(a, u, l) {
      if (!l)
        return "";
      const c = this.get(a, u, l);
      if (c !== null)
        return c;
      const h = (0, e.default)(a, u, l), g = Uint8Array.prototype.slice.call(a, u, u + l);
      return this.store(g, h), h;
    }
  };
  return nr.CachedUtf8Decoder = s, nr;
}
var _a;
function Nd() {
  if (_a) return oi;
  _a = 1, Object.defineProperty(oi, "__esModule", { value: !0 });
  const r = Cd();
  return oi.default = new r.CachedUtf8Decoder(), oi;
}
var ka;
function Qu() {
  if (ka) return er;
  ka = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.CborDecoderBase = void 0;
  const r = re, e = Od(), t = Ku(), i = oo(), n = Xu(), s = r.__importDefault(Nd());
  let o = class {
    constructor(u = new n.Reader(), l = s.default) {
      this.reader = u, this.keyDecoder = l;
    }
    read(u) {
      return this.reader.reset(u), this.readAny();
    }
    decode(u) {
      return this.reader.reset(u), this.readAny();
    }
    // -------------------------------------------------------- Any value reading
    val() {
      return this.readAny();
    }
    readAny() {
      const l = this.reader.u8(), c = l >> 5, h = l & 31;
      return c < 4 ? c < 2 ? c === 0 ? this.readUint(h) : this.readNint(h) : c === 2 ? this.readBin(h) : this.readStr(h) : c < 6 ? c === 4 ? this.readArr(h) : this.readObj(h) : c === 6 ? this.readTag(h) : this.readTkn(h);
    }
    readAnyRaw(u) {
      const l = u >> 5, c = u & 31;
      return l < 4 ? l < 2 ? l === 0 ? this.readUint(c) : this.readNint(c) : l === 2 ? this.readBin(c) : this.readStr(c) : l < 6 ? l === 4 ? this.readArr(c) : this.readObj(c) : l === 6 ? this.readTag(c) : this.readTkn(c);
    }
    readMinorLen(u) {
      if (u < 24)
        return u;
      switch (u) {
        case 24:
          return this.reader.u8();
        case 25:
          return this.reader.u16();
        case 26:
          return this.reader.u32();
        case 27:
          return Number(this.reader.u64());
        case 31:
          return -1;
        default:
          throw 1;
      }
    }
    // ----------------------------------------------------- Unsigned int reading
    readUint(u) {
      if (u < 25)
        return u === 24 ? this.reader.u8() : u;
      if (u < 27)
        return u === 25 ? this.reader.u16() : this.reader.u32();
      {
        const l = this.reader.u64();
        return l > 9007199254740991 ? l : Number(l);
      }
    }
    // ----------------------------------------------------- Negative int reading
    readNint(u) {
      if (u < 25)
        return u === 24 ? -this.reader.u8() - 1 : -u - 1;
      if (u < 27)
        return u === 25 ? -this.reader.u16() - 1 : -this.reader.u32() - 1;
      {
        const l = this.reader.u64();
        return l > 9007199254740991 - 1 ? -l - BigInt(1) : -Number(l) - 1;
      }
    }
    // ----------------------------------------------------------- Binary reading
    readBin(u) {
      const l = this.reader;
      if (u <= 23)
        return l.buf(u);
      switch (u) {
        case 24:
          return l.buf(l.u8());
        case 25:
          return l.buf(l.u16());
        case 26:
          return l.buf(l.u32());
        case 27:
          return l.buf(Number(l.u64()));
        case 31: {
          let c = 0;
          const h = [];
          for (; this.reader.peak() !== 255; ) {
            const k = this.readBinChunk();
            c += k.length, h.push(k);
          }
          this.reader.x++;
          const g = new Uint8Array(c);
          let p = 0;
          const b = h.length;
          for (let k = 0; k < b; k++) {
            const m = h[k];
            g.set(m, p), p += m.length;
          }
          return g;
        }
        default:
          throw 1;
      }
    }
    readBinChunk() {
      const u = this.reader.u8(), l = u >> 5, c = u & 31;
      if (l !== 2)
        throw 2;
      if (c > 27)
        throw 3;
      return this.readBin(c);
    }
    // ----------------------------------------------------------- String reading
    readAsStr() {
      const l = this.reader.u8(), c = l >> 5, h = l & 31;
      if (c !== 3)
        throw 11;
      return this.readStr(h);
    }
    readStr(u) {
      const l = this.reader;
      if (u <= 23)
        return l.utf8(u);
      switch (u) {
        case 24:
          return l.utf8(l.u8());
        case 25:
          return l.utf8(l.u16());
        case 26:
          return l.utf8(l.u32());
        case 27:
          return l.utf8(Number(l.u64()));
        case 31: {
          let c = "";
          for (; l.peak() !== 255; )
            c += this.readStrChunk();
          return this.reader.x++, c;
        }
        default:
          throw 1;
      }
    }
    readStrLen(u) {
      if (u <= 23)
        return u;
      switch (u) {
        case 24:
          return this.reader.u8();
        case 25:
          return this.reader.u16();
        case 26:
          return this.reader.u32();
        case 27:
          return Number(this.reader.u64());
        default:
          throw 1;
      }
    }
    readStrChunk() {
      const u = this.reader.u8(), l = u >> 5, c = u & 31;
      if (l !== 3)
        throw 4;
      if (c > 27)
        throw 5;
      return this.readStr(c);
    }
    // ------------------------------------------------------------ Array reading
    readArr(u) {
      const l = this.readMinorLen(u);
      return l >= 0 ? this.readArrRaw(l) : this.readArrIndef();
    }
    readArrRaw(u) {
      const l = [];
      for (let c = 0; c < u; c++)
        l.push(this.readAny());
      return l;
    }
    readArrIndef() {
      const u = [];
      for (; this.reader.peak() !== 255; )
        u.push(this.readAny());
      return this.reader.x++, u;
    }
    // ----------------------------------------------------------- Object reading
    readObj(u) {
      if (u < 28) {
        let l = u;
        switch (u) {
          case 24:
            l = this.reader.u8();
            break;
          case 25:
            l = this.reader.u16();
            break;
          case 26:
            l = this.reader.u32();
            break;
          case 27:
            l = Number(this.reader.u64());
            break;
        }
        const c = {};
        for (let h = 0; h < l; h++) {
          const g = this.key();
          if (g === "__proto__")
            throw 6;
          const p = this.readAny();
          c[g] = p;
        }
        return c;
      } else {
        if (u === 31)
          return this.readObjIndef();
        throw 1;
      }
    }
    /** Remove this? */
    readObjRaw(u) {
      const l = {};
      for (let c = 0; c < u; c++) {
        const h = this.key(), g = this.readAny();
        l[h] = g;
      }
      return l;
    }
    readObjIndef() {
      const u = {};
      for (; this.reader.peak() !== 255; ) {
        const l = this.key();
        if (this.reader.peak() === 255)
          throw 7;
        const c = this.readAny();
        u[l] = c;
      }
      return this.reader.x++, u;
    }
    key() {
      const u = this.reader.u8(), l = u >> 5, c = u & 31;
      if (l !== 3)
        return String(this.readAnyRaw(u));
      const h = this.readStrLen(c);
      if (h > 31)
        return this.reader.utf8(h);
      const g = this.keyDecoder.decode(this.reader.uint8, this.reader.x, h);
      return this.reader.skip(h), g;
    }
    // -------------------------------------------------------------- Tag reading
    readTag(u) {
      if (u <= 23)
        return this.readTagRaw(u);
      switch (u) {
        case 24:
          return this.readTagRaw(this.reader.u8());
        case 25:
          return this.readTagRaw(this.reader.u16());
        case 26:
          return this.readTagRaw(this.reader.u32());
        case 27:
          return this.readTagRaw(Number(this.reader.u64()));
        default:
          throw 1;
      }
    }
    readTagRaw(u) {
      return new t.JsonPackExtension(u, this.readAny());
    }
    // ------------------------------------------------------------ Token reading
    readTkn(u) {
      switch (u) {
        case 20:
          return !1;
        case 21:
          return !0;
        case 22:
          return null;
        case 23:
          return;
        case 24:
          return new i.JsonPackValue(this.reader.u8());
        case 25:
          return this.f16();
        case 26:
          return this.reader.f32();
        case 27:
          return this.reader.f64();
      }
      if (u <= 23)
        return new i.JsonPackValue(u);
      throw 1;
    }
    f16() {
      return (0, e.decodeF16)(this.reader.u16());
    }
  };
  return er.CborDecoderBase = o, er;
}
var Sa;
function Td() {
  if (Sa) return $n;
  Sa = 1, Object.defineProperty($n, "__esModule", { value: !0 }), $n.CborDecoder = void 0;
  const r = Qu(), e = oo();
  let t = class extends r.CborDecoderBase {
    // -------------------------------------------------------------- Map reading
    readAsMap() {
      const n = this.reader.u8(), s = n >> 5, o = n & 31;
      switch (s) {
        case 5:
          return this.readMap(o);
        default:
          throw 0;
      }
    }
    readMap(n) {
      const s = this.readMinorLen(n);
      return s >= 0 ? this.readMapRaw(s) : this.readMapIndef();
    }
    readMapRaw(n) {
      const s = /* @__PURE__ */ new Map();
      for (let o = 0; o < n; o++) {
        const a = this.readAny(), u = this.readAny();
        s.set(a, u);
      }
      return s;
    }
    readMapIndef() {
      const n = /* @__PURE__ */ new Map();
      for (; this.reader.peak() !== 255; ) {
        const s = this.readAny();
        if (this.reader.peak() === 255)
          throw 7;
        const o = this.readAny();
        n.set(s, o);
      }
      return this.reader.x++, n;
    }
    // ----------------------------------------------------------- Value skipping
    skipN(n) {
      for (let s = 0; s < n; s++)
        this.skipAny();
    }
    skipAny() {
      this.skipAnyRaw(this.reader.u8());
    }
    skipAnyRaw(n) {
      const s = n >> 5, o = n & 31;
      switch (s) {
        case 0:
        case 1:
          this.skipUNint(o);
          break;
        case 2:
          this.skipBin(o);
          break;
        case 3:
          this.skipStr(o);
          break;
        case 4:
          this.skipArr(o);
          break;
        case 5:
          this.skipObj(o);
          break;
        case 7:
          this.skipTkn(o);
          break;
        case 6:
          this.skipTag(o);
          break;
      }
    }
    skipMinorLen(n) {
      if (n <= 23)
        return n;
      switch (n) {
        case 24:
          return this.reader.u8();
        case 25:
          return this.reader.u16();
        case 26:
          return this.reader.u32();
        case 27:
          return Number(this.reader.u64());
        case 31:
          return -1;
        default:
          throw 1;
      }
    }
    // --------------------------------------------------------- Integer skipping
    skipUNint(n) {
      if (!(n <= 23))
        switch (n) {
          case 24:
            return this.reader.skip(1);
          case 25:
            return this.reader.skip(2);
          case 26:
            return this.reader.skip(4);
          case 27:
            return this.reader.skip(8);
          default:
            throw 1;
        }
    }
    // ---------------------------------------------------------- Binary skipping
    skipBin(n) {
      const s = this.skipMinorLen(n);
      if (s >= 0)
        this.reader.skip(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipBinChunk();
        this.reader.x++;
      }
    }
    skipBinChunk() {
      const n = this.reader.u8(), s = n >> 5, o = n & 31;
      if (s !== 2)
        throw 2;
      if (o > 27)
        throw 3;
      this.skipBin(o);
    }
    // ---------------------------------------------------------- String skipping
    skipStr(n) {
      const s = this.skipMinorLen(n);
      if (s >= 0)
        this.reader.skip(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipStrChunk();
        this.reader.x++;
      }
    }
    skipStrChunk() {
      const n = this.reader.u8(), s = n >> 5, o = n & 31;
      if (s !== 3)
        throw 4;
      if (o > 27)
        throw 5;
      this.skipStr(o);
    }
    // ----------------------------------------------------------- Array skipping
    skipArr(n) {
      const s = this.skipMinorLen(n);
      if (s >= 0)
        this.skipN(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipAny();
        this.reader.x++;
      }
    }
    // ---------------------------------------------------------- Object skipping
    skipObj(n) {
      const s = this.readMinorLen(n);
      if (s >= 0)
        return this.skipN(s * 2);
      for (; this.reader.peak() !== 255; ) {
        if (this.skipAny(), this.reader.peak() === 255)
          throw 7;
        this.skipAny();
      }
      this.reader.x++;
    }
    // ------------------------------------------------------------- Tag skipping
    skipTag(n) {
      if (this.skipMinorLen(n) < 0)
        throw 1;
      this.skipAny();
    }
    // ----------------------------------------------------------- Token skipping
    skipTkn(n) {
      switch (n) {
        case 24:
          this.reader.skip(1);
          return;
        case 25:
          this.reader.skip(2);
          return;
        case 26:
          this.reader.skip(4);
          return;
        case 27:
          this.reader.skip(8);
          return;
      }
      if (!(n <= 23))
        throw 1;
    }
    // --------------------------------------------------------------- Validation
    /**
     * Throws if at given offset in a buffer there is an invalid CBOR value, or
     * if the value does not span the exact length specified in `size`. I.e.
     * throws if:
     *
     * - The value is not a valid CBOR value.
     * - The value is shorter than `size`.
     * - The value is longer than `size`.
     *
     * @param value Buffer in which to validate CBOR value.
     * @param offset Offset at which the value starts.
     * @param size Expected size of the value.
     */
    validate(n, s = 0, o = n.length) {
      this.reader.reset(n), this.reader.x = s;
      const a = s;
      if (this.skipAny(), this.reader.x - a !== o)
        throw 8;
    }
    // -------------------------------------------- One level reading - any value
    decodeLevel(n) {
      return this.reader.reset(n), this.readLevel();
    }
    /**
     * Decodes only one level of objects and arrays. Other values are decoded
     * completely.
     *
     * @returns One level of decoded CBOR value.
     */
    readLevel() {
      const n = this.reader.u8(), s = n >> 5, o = n & 31;
      switch (s) {
        case 4:
          return this.readArrLevel(o);
        case 5:
          return this.readObjLevel(o);
        default:
          return super.readAnyRaw(n);
      }
    }
    /**
     * Decodes primitive values, returns container values as `JsonPackValue`.
     *
     * @returns A primitive value, or CBOR container value as a blob.
     */
    readPrimitiveOrVal() {
      switch (this.reader.peak() >> 5) {
        case 4:
        case 5:
          return this.readAsValue();
        default:
          return this.readAny();
      }
    }
    readAsValue() {
      const n = this.reader, s = n.x;
      this.skipAny();
      const o = n.x;
      return new e.JsonPackValue(n.uint8.subarray(s, o));
    }
    // ----------------------------------------------- One level reading - object
    readObjLevel(n) {
      const s = this.readMinorLen(n);
      return s >= 0 ? this.readObjRawLevel(s) : this.readObjIndefLevel();
    }
    readObjRawLevel(n) {
      const s = {};
      for (let o = 0; o < n; o++) {
        const a = this.key(), u = this.readPrimitiveOrVal();
        s[a] = u;
      }
      return s;
    }
    readObjIndefLevel() {
      const n = {};
      for (; this.reader.peak() !== 255; ) {
        const s = this.key();
        if (this.reader.peak() === 255)
          throw 7;
        const o = this.readPrimitiveOrVal();
        n[s] = o;
      }
      return this.reader.x++, n;
    }
    // ------------------------------------------------ One level reading - array
    readArrLevel(n) {
      const s = this.readMinorLen(n);
      return s >= 0 ? this.readArrRawLevel(s) : this.readArrIndefLevel();
    }
    readArrRawLevel(n) {
      const s = [];
      for (let o = 0; o < n; o++)
        s.push(this.readPrimitiveOrVal());
      return s;
    }
    readArrIndefLevel() {
      const n = [];
      for (; this.reader.peak() !== 255; )
        n.push(this.readPrimitiveOrVal());
      return this.reader.x++, n;
    }
    // ---------------------------------------------------------- Shallow reading
    readHdr(n) {
      const s = this.reader.u8();
      if (s >> 5 !== n)
        throw 0;
      const a = s & 31;
      if (a < 24)
        return a;
      switch (a) {
        case 24:
          return this.reader.u8();
        case 25:
          return this.reader.u16();
        case 26:
          return this.reader.u32();
        case 27:
          return Number(this.reader.u64());
        case 31:
          return -1;
      }
      throw 1;
    }
    readStrHdr() {
      return this.readHdr(
        3
        /* MAJOR.STR */
      );
    }
    readObjHdr() {
      return this.readHdr(
        5
        /* MAJOR.MAP */
      );
    }
    readArrHdr() {
      return this.readHdr(
        4
        /* MAJOR.ARR */
      );
    }
    findKey(n) {
      const s = this.readObjHdr();
      for (let o = 0; o < s; o++) {
        if (this.key() === n)
          return this;
        this.skipAny();
      }
      throw 9;
    }
    findIndex(n) {
      const s = this.readArrHdr();
      if (n >= s)
        throw 10;
      for (let o = 0; o < n; o++)
        this.skipAny();
      return this;
    }
    find(n) {
      for (let s = 0; s < n.length; s++) {
        const o = n[s];
        typeof o == "string" ? this.findKey(o) : this.findIndex(o);
      }
      return this;
    }
  };
  return $n.CborDecoder = t, $n;
}
var xa;
function $u() {
  if (xa) return Zn;
  xa = 1, Object.defineProperty(Zn, "__esModule", { value: !0 }), Zn.Decoder = void 0;
  const r = Yu(), e = de(), t = co(), i = Td();
  class n extends i.CborDecoder {
    /**
     * Creates a new JSON CRDT patch decoder.
     *
     * @param reader An optional custom implementation of a CRDT decoder.
     */
    constructor(o = new r.CrdtReader()) {
      super(o);
    }
    /**
     * Decodes a JSON CRDT patch from a binary blob.
     *
     * @param data Binary data to decode.
     * @returns A JSON CRDT patch.
     */
    decode(o) {
      return this.reader.reset(o), this.readPatch();
    }
    readPatch() {
      const o = this.reader, a = o.vu57(), u = o.vu57(), c = a === 1 ? new e.ServerClockVector(1, u) : new e.ClockVector(a, u);
      this.patchSid = c.sid;
      const h = this.builder = new t.PatchBuilder(c), g = this.val();
      return Array.isArray(g) && (h.patch.meta = g[0]), this.decodeOperations(), h.patch;
    }
    decodeId() {
      const o = this.reader, [a, u] = o.b1vu56();
      return a ? new e.Timestamp(o.vu57(), u) : new e.Timestamp(this.patchSid, u);
    }
    decodeTss() {
      const o = this.decodeId(), a = this.reader.vu57();
      return (0, e.interval)(o, 0, a);
    }
    decodeOperations() {
      const a = this.reader.vu57();
      for (let u = 0; u < a; u++)
        this.decodeOperation();
    }
    decodeOperation() {
      const o = this.builder, a = this.reader, u = a.u8();
      switch (u >> 3) {
        case 0: {
          const c = u & 7;
          o.con(c ? this.decodeId() : this.val());
          break;
        }
        case 1: {
          o.val();
          break;
        }
        case 2: {
          o.obj();
          break;
        }
        case 3: {
          o.vec();
          break;
        }
        case 4: {
          o.str();
          break;
        }
        case 5: {
          o.bin();
          break;
        }
        case 6: {
          o.arr();
          break;
        }
        case 9: {
          const c = this.decodeId(), h = this.decodeId();
          o.setVal(c, h);
          break;
        }
        case 10: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < c; p++) {
            const b = this.val();
            if (typeof b != "string")
              continue;
            const k = this.decodeId();
            g.push([b, k]);
          }
          o.insObj(h, g);
          break;
        }
        case 11: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < c; p++) {
            const b = this.val();
            if (typeof b != "number")
              continue;
            const k = this.decodeId();
            g.push([b, k]);
          }
          o.insVec(h, g);
          break;
        }
        case 12: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = this.decodeId(), p = a.utf8(c);
          o.insStr(h, g, p);
          break;
        }
        case 13: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = this.decodeId(), p = a.buf(c);
          if (!(p instanceof Uint8Array))
            return;
          o.insBin(h, g, p);
          break;
        }
        case 14: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = this.decodeId(), p = [];
          for (let b = 0; b < c; b++)
            p.push(this.decodeId());
          o.insArr(h, g, p);
          break;
        }
        case 15: {
          const c = this.decodeId(), h = this.decodeId(), g = this.decodeId();
          o.updArr(c, h, g);
          break;
        }
        case 16: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < c; p++)
            g.push(this.decodeTss());
          o.del(h, g);
          break;
        }
        case 17: {
          const c = u & 7 || a.vu57();
          o.nop(c);
          break;
        }
        default:
          throw new Error("UNKNOWN_OP");
      }
    }
  }
  return Zn.Decoder = n, Zn;
}
var Ji = {}, Oa;
function Ad() {
  return Oa || (Oa = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.decode = r.decoder = r.encode = r.encoder = void 0;
    const e = Wu(), t = $u(), i = so(), n = new i.CrdtWriter(1024 * 4);
    r.encoder = new e.Encoder(n);
    const s = (a) => r.encoder.encode(a);
    r.encode = s, r.decoder = new t.Decoder();
    const o = (a) => r.decoder.decode(a);
    r.decode = o;
  })(Ji)), Ji;
}
var Ia;
function jd() {
  return Ia || (Ia = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Wu(), r), e.__exportStar($u(), r), e.__exportStar(Ad(), r);
  })(Fi)), Fi;
}
var Ca;
function tl() {
  if (Ca) return Vn;
  Ca = 1, Object.defineProperty(Vn, "__esModule", { value: !0 }), Vn.Patch = void 0;
  const e = re.__importStar(ei()), t = de(), i = Ee(), n = jd();
  let s = class el {
    constructor() {
      this.ops = [], this.meta = void 0;
    }
    /**
     * Un-marshals a JSON CRDT patch from a binary representation.
     */
    static fromBinary(a) {
      return (0, n.decode)(a);
    }
    /**
     * Returns the patch ID, which is equal to the ID of the first operation
     * in the patch.
     *
     * @returns The ID of the first operation in the patch.
     */
    getId() {
      const a = this.ops[0];
      if (a)
        return a.id;
    }
    /**
     * Returns the total time span of the patch, which is the sum of all
     * operation spans.
     *
     * @returns The length of the patch.
     */
    span() {
      let a = 0;
      for (const u of this.ops)
        a += u.span();
      return a;
    }
    /**
     * Returns the expected time of the next inserted operation.
     */
    nextTime() {
      const a = this.ops, u = a.length;
      if (!u)
        return 0;
      const l = a[u - 1];
      return l.id.time + l.span();
    }
    /**
     * Creates a new patch where all timestamps are transformed using the
     * provided function.
     *
     * @param ts Timestamp transformation function.
     * @returns A new patch with transformed timestamps.
     */
    rewriteTime(a) {
      const u = new el(), l = this.ops, c = l.length, h = u.ops;
      for (let g = 0; g < c; g++) {
        const p = l[g];
        p instanceof e.DelOp ? h.push(new e.DelOp(a(p.id), a(p.obj), p.what)) : p instanceof e.NewConOp ? h.push(new e.NewConOp(a(p.id), p.val instanceof t.Timestamp ? a(p.val) : p.val)) : p instanceof e.NewVecOp ? h.push(new e.NewVecOp(a(p.id))) : p instanceof e.NewValOp ? h.push(new e.NewValOp(a(p.id))) : p instanceof e.NewObjOp ? h.push(new e.NewObjOp(a(p.id))) : p instanceof e.NewStrOp ? h.push(new e.NewStrOp(a(p.id))) : p instanceof e.NewBinOp ? h.push(new e.NewBinOp(a(p.id))) : p instanceof e.NewArrOp ? h.push(new e.NewArrOp(a(p.id))) : p instanceof e.InsArrOp ? h.push(new e.InsArrOp(a(p.id), a(p.obj), a(p.ref), p.data.map(a))) : p instanceof e.UpdArrOp ? h.push(new e.UpdArrOp(a(p.id), a(p.obj), a(p.ref), a(p.val))) : p instanceof e.InsStrOp ? h.push(new e.InsStrOp(a(p.id), a(p.obj), a(p.ref), p.data)) : p instanceof e.InsBinOp ? h.push(new e.InsBinOp(a(p.id), a(p.obj), a(p.ref), p.data)) : p instanceof e.InsValOp ? h.push(new e.InsValOp(a(p.id), a(p.obj), a(p.val))) : p instanceof e.InsObjOp ? h.push(new e.InsObjOp(a(p.id), a(p.obj), p.data.map(([b, k]) => [b, a(k)]))) : p instanceof e.InsVecOp ? h.push(new e.InsVecOp(a(p.id), a(p.obj), p.data.map(([b, k]) => [b, a(k)]))) : p instanceof e.NopOp && h.push(new e.NopOp(a(p.id), p.len));
      }
      return u;
    }
    /**
     * The `.rebase()` operation is meant to be applied to patches which have not
     * yet been advertised to the server (other peers), or when
     * the server clock is used and concurrent change on the server happened.
     *
     * The .rebase() operation returns a new `Patch` with the IDs recalculated
     * such that the first operation has the `time` equal to `newTime`.
     *
     * @param newTime Time where the patch ID should begin (ID of the first operation).
     * @param transformAfter Time after (and including) which the IDs should be
     *     transformed. If not specified, equals to the time of the first operation.
     */
    rebase(a, u) {
      const l = this.getId();
      if (!l)
        throw new Error("EMPTY_PATCH");
      const c = l.sid, h = l.time;
      if (u ?? (u = h), h === a)
        return this;
      const g = a - h;
      return this.rewriteTime((p) => {
        if (p.sid !== c)
          return p;
        const b = p.time;
        return b < u ? p : (0, t.ts)(c, b + g);
      });
    }
    /**
     * Creates a deep clone of the patch.
     *
     * @returns A deep clone of the patch.
     */
    clone() {
      return this.rewriteTime((a) => a);
    }
    /**
     * Marshals the patch into a binary representation.
     *
     * @returns A binary representation of the patch.
     */
    toBinary() {
      return (0, n.encode)(this);
    }
    // ---------------------------------------------------------------- Printable
    /**
     * Returns a textual human-readable representation of the patch. This can be
     * used for debugging purposes.
     *
     * @param tab Start string for each line.
     * @returns Text representation of the patch.
     */
    toString(a = "") {
      const u = this.getId();
      return `Patch ${u ? (0, t.printTs)(u) : "(nil)"}!${this.span()}` + (0, i.printTree)(a, this.ops.map((c) => (h) => c.toString(h)));
    }
  };
  return Vn.Patch = s, Vn;
}
var Na;
function xt() {
  return Na || (Na = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(dd(), r), e.__exportStar(de(), r), e.__exportStar(ei(), r), e.__exportStar(tl(), r), e.__exportStar(co(), r), e.__exportStar(ki(), r);
  })(Li)), Li;
}
var Ta;
function nl() {
  return Ta || (Ta = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.bin = r.con = r.line = void 0;
    const e = hd(), t = xt();
    r.line = e.toLine;
    const i = (s) => s instanceof Uint8Array ? "Uint8Array " + (0, r.bin)(s) : `{ ${s instanceof t.Timestamp ? (0, t.printTs)(s) : (0, r.line)(s)} }`;
    r.con = i;
    const n = (s) => "{ " + ("" + s).replaceAll(",", ", ") + " }";
    r.bin = n;
  })(Vi)), Vi;
}
var Aa;
function Si() {
  if (Aa) return En;
  Aa = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.ConNode = void 0;
  const r = nl(), e = de();
  let t = class rl {
    /**
     * @param id ID of the CRDT node.
     * @param val Raw value of the constant. It can be any JSON/CBOR value, or
     *        a logical timestamp {@link Timestamp}.
     */
    constructor(n, s) {
      this.id = n, this.val = s, this.api = void 0, this.parent = void 0;
    }
    // ----------------------------------------------------------------- JsonNode
    name() {
      return "con";
    }
    /** @ignore */
    children() {
    }
    /** @ignore */
    child() {
    }
    /** @ignore */
    container() {
    }
    view() {
      return this.val;
    }
    /** @ignore */
    clone() {
      return new rl(this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(n) {
      return this.name() + " " + (0, e.printTs)(this.id) + " " + (0, r.con)(this.val);
    }
  };
  return En.ConNode = t, En;
}
var rr = {}, Ct = {}, Nt = {}, ir = {}, sr = {}, or = {}, ja;
function Ed() {
  if (ja) return or;
  ja = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.RelativeTimestamp = void 0;
  let r = class {
    /**
     *
     * @param sessionIndex Index of the clock in clock table.
     * @param timeDiff Time difference relative to the clock time from the table.
     */
    constructor(t, i) {
      this.sessionIndex = t, this.timeDiff = i;
    }
  };
  return or.RelativeTimestamp = r, or;
}
var Ea;
function Pd() {
  if (Ea) return sr;
  Ea = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.ClockEncoder = void 0;
  const r = de(), e = Ed();
  class t {
    constructor(s, o) {
      this.index = s, this.clock = o;
    }
  }
  let i = class {
    constructor() {
      this.table = /* @__PURE__ */ new Map(), this.index = 1, this.clock = null;
    }
    reset(s) {
      this.index = 1, this.clock = s;
      const o = new t(this.index++, (0, r.tick)(s, -1));
      this.table.clear(), this.table.set(s.sid, o);
    }
    append(s) {
      const o = s.time, a = s.sid;
      let u = this.table.get(a);
      if (!u) {
        let h = this.clock.peers.get(a);
        h || (h = new r.Timestamp(a, this.clock.time - 1)), u = new t(this.index++, h), this.table.set(a, u);
      }
      const c = u.clock.time - o;
      if (c < 0)
        throw new Error("TIME_TRAVEL");
      return new e.RelativeTimestamp(u.index, c);
    }
    toJson() {
      const s = [];
      return this.table.forEach((o) => {
        const a = o.clock;
        s.push(a.sid, a.time);
      }), s;
    }
  };
  return sr.ClockEncoder = i, sr;
}
var Tt = {}, Pa;
function il() {
  if (Pa) return Tt;
  Pa = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.CRDT_MAJOR_OVERLAY = Tt.CRDT_MAJOR = void 0;
  var r;
  (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 1] = "VAL", t[t.OBJ = 2] = "OBJ", t[t.VEC = 3] = "VEC", t[t.STR = 4] = "STR", t[t.BIN = 5] = "BIN", t[t.ARR = 6] = "ARR";
  })(r || (Tt.CRDT_MAJOR = r = {}));
  var e;
  return (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 32] = "VAL", t[t.VEC = 96] = "VEC", t[t.OBJ = 64] = "OBJ", t[t.STR = 128] = "STR", t[t.BIN = 160] = "BIN", t[t.ARR = 192] = "ARR";
  })(e || (Tt.CRDT_MAJOR_OVERLAY = e = {})), Tt;
}
var Ra;
function Rd() {
  if (Ra) return ir;
  Ra = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.Encoder = void 0;
  const e = re.__importStar(Ot()), t = Pd(), i = so(), n = de(), s = Ju(), o = il();
  let a = class extends s.CborEncoder {
    constructor(l) {
      super(l || new i.CrdtWriter()), this.clockEncoder = new t.ClockEncoder(), this.time = 0, this.cTableEntry = (c) => {
        const h = c.clock, g = this.writer;
        g.vu57(h.sid), g.vu57(h.time);
      }, this.tsLogical = (c) => {
        const h = this.clockEncoder.append(c);
        this.writer.id(h.sessionIndex, h.timeDiff);
      }, this.tsServer = (c) => {
        this.writer.vu57(c.time);
      }, this.ts = this.tsLogical, this.cKey = (c, h) => {
        this.writeStr(h), this.cNode(this.doc.index.get(c));
      };
    }
    encode(l) {
      this.doc = l;
      const c = this.writer;
      return c.reset(), l.clock.sid === 1 ? this.encodeServer(l) : this.encodeLogical(l), c.flush();
    }
    encodeLogical(l) {
      const c = this.writer;
      this.ts = this.tsLogical, this.clockEncoder.reset(l.clock), c.ensureCapacity(4);
      const h = c.x0, g = c.x;
      c.x += 4, this.cRoot(l.root), this.encodeClockTable(h, g);
    }
    encodeServer(l) {
      this.ts = this.tsServer;
      const c = this.writer;
      c.u8(128), c.vu57(this.time = l.clock.time), this.cRoot(l.root);
    }
    encodeClockTable(l, c) {
      const h = this.writer, g = h.x0 - l;
      h.view.setUint32(h.x0 + (c - l), h.x - c - g - 4);
      const b = this.clockEncoder.table, k = b.size;
      h.vu57(k), b.forEach(this.cTableEntry);
    }
    cRoot(l) {
      l.val.sid === 0 ? this.writer.u8(0) : this.cNode(l.node());
    }
    writeTL(l, c) {
      const h = this.writer;
      c < 31 ? h.u8(l | c) : (h.u8(l | 31), h.vu57(c));
    }
    cNode(l) {
      l instanceof e.ConNode ? this.cCon(l) : l instanceof e.ValNode ? this.cVal(l) : l instanceof e.StrNode ? this.cStr(l) : l instanceof e.ObjNode ? this.cObj(l) : l instanceof e.VecNode ? this.cVec(l) : l instanceof e.ArrNode ? this.cArr(l) : l instanceof e.BinNode && this.cBin(l);
    }
    cCon(l) {
      const c = l.val;
      this.ts(l.id), c instanceof n.Timestamp ? (this.writer.u8(1), this.ts(c)) : (this.writer.u8(0), this.writeAny(c));
    }
    cVal(l) {
      this.ts(l.id), this.writer.u8(32), this.cNode(l.node());
    }
    cObj(l) {
      this.ts(l.id);
      const c = l.keys;
      this.writeTL(o.CRDT_MAJOR_OVERLAY.OBJ, c.size), c.forEach(this.cKey);
    }
    cVec(l) {
      const c = l.elements, h = c.length;
      this.ts(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.VEC, h);
      const g = this.doc.index;
      for (let p = 0; p < h; p++) {
        const b = c[p];
        b ? this.cNode(g.get(b)) : this.writer.u8(0);
      }
    }
    cStr(l) {
      const c = this.ts;
      c(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.STR, l.count);
      for (let h = l.first(); h; h = l.next(h))
        c(h.id), h.del ? this.writeUInteger(h.span) : this.writeStr(h.data);
    }
    cBin(l) {
      const c = this.ts, h = this.writer;
      c(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.BIN, l.count);
      for (let g = l.first(); g; g = l.next(g)) {
        c(g.id);
        const p = g.span, b = g.del;
        h.b1vu56(~~b, p), !b && h.buf(g.data, p);
      }
    }
    cArr(l) {
      const c = this.ts, h = this.writer;
      c(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.ARR, l.count);
      const g = this.doc.index;
      for (let p = l.first(); p; p = l.next(p)) {
        c(p.id);
        const b = p.span, k = p.del;
        if (h.b1vu56(~~k, b), k)
          continue;
        const m = p.data;
        for (let _ = 0; _ < b; _++)
          this.cNode(g.get(m[_]));
      }
    }
  };
  return ir.Encoder = a, ir;
}
var ar = {}, cr = {}, Va;
function Vd() {
  if (Va) return cr;
  Va = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.ClockDecoder = void 0;
  const r = de();
  let e = class sl {
    static fromArr(i) {
      const n = new sl(i[0], i[1]), s = i.length;
      for (let o = 2; o < s; o += 2)
        n.pushTuple(i[o], i[o + 1]);
      return n;
    }
    constructor(i, n) {
      this.table = [], this.clock = new r.ClockVector(i, n + 1), this.table.push((0, r.ts)(i, n));
    }
    pushTuple(i, n) {
      const s = (0, r.ts)(i, n);
      this.clock.observe(s, 1), this.table.push(s);
    }
    decodeId(i, n) {
      if (!i)
        return (0, r.ts)(0, n);
      const s = this.table[i - 1];
      if (!s)
        throw new Error("INVALID_CLOCK_TABLE");
      return (0, r.ts)(s.sid, s.time - n);
    }
  };
  return cr.ClockDecoder = e, cr;
}
var Ba;
function Bd() {
  if (Ba) return ar;
  Ba = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.Decoder = void 0;
  const e = re.__importStar(Ot()), t = Vd(), i = Yu(), n = de(), s = po(), o = Qu(), a = il();
  let u = class extends o.CborDecoderBase {
    constructor() {
      super(new i.CrdtReader()), this.clockDecoder = void 0, this.time = -1, this.cStrChunk = () => {
        const c = this.ts(), h = this.val();
        return typeof h == "string" ? new e.StrChunk(c, h.length, h) : new e.StrChunk(c, ~~h, "");
      }, this.cBinChunk = () => {
        const c = this.ts(), h = this.reader, [g, p] = h.b1vu56();
        return g ? new e.BinChunk(c, p, void 0) : new e.BinChunk(c, p, h.buf(p));
      };
    }
    decode(c, h) {
      this.clockDecoder = void 0, this.time = -1;
      const g = this.reader;
      if (g.reset(c), g.peak() & 128) {
        g.x++;
        const m = this.time = g.vu57();
        h || (h = s.Model.withServerClock(void 0, m));
      } else if (this.decodeClockTable(), !h) {
        const m = this.clockDecoder.clock;
        h = s.Model.create(void 0, m);
      }
      this.doc = h;
      const b = this.cRoot(), k = h.root = new e.RootNode(this.doc, b.id);
      return b.parent = k, this.clockDecoder = void 0, h;
    }
    decodeClockTable() {
      const c = this.reader, h = c.u32(), g = c.x;
      c.x += h;
      const p = c.vu57(), b = c.vu57(), k = c.vu57();
      this.clockDecoder = new t.ClockDecoder(b, k);
      for (let m = 1; m < p; m++) {
        const _ = c.vu57(), f = c.vu57();
        this.clockDecoder.pushTuple(_, f);
      }
      c.x = g;
    }
    ts() {
      if (this.time < 0) {
        const [g, p] = this.reader.id();
        return this.clockDecoder.decodeId(g, p);
      } else
        return new n.Timestamp(1, this.reader.vu57());
    }
    cRoot() {
      const c = this.reader;
      return c.uint8[c.x] ? this.cNode() : s.UNDEFINED;
    }
    cNode() {
      const c = this.reader, h = this.ts(), g = c.u8(), p = g >> 5, b = g & 31;
      switch (p) {
        case a.CRDT_MAJOR.CON:
          return this.cCon(h, b);
        case a.CRDT_MAJOR.VAL:
          return this.cVal(h);
        case a.CRDT_MAJOR.OBJ:
          return this.cObj(h, b !== 31 ? b : c.vu57());
        case a.CRDT_MAJOR.VEC:
          return this.cVec(h, b !== 31 ? b : c.vu57());
        case a.CRDT_MAJOR.STR:
          return this.cStr(h, b !== 31 ? b : c.vu57());
        case a.CRDT_MAJOR.BIN:
          return this.cBin(h, b !== 31 ? b : c.vu57());
        case a.CRDT_MAJOR.ARR:
          return this.cArr(h, b !== 31 ? b : c.vu57());
      }
      throw new Error("UNKNOWN_NODE");
    }
    cCon(c, h) {
      const g = this.doc, p = h ? this.ts() : this.val(), b = new e.ConNode(c, p);
      return g.index.set(c, b), b;
    }
    cVal(c) {
      const h = this.cNode(), g = this.doc, p = new e.ValNode(g, c, h.id);
      return h.parent = p, g.index.set(c, p), p;
    }
    cObj(c, h) {
      const g = new e.ObjNode(this.doc, c);
      for (let p = 0; p < h; p++)
        this.cObjChunk(g);
      return this.doc.index.set(c, g), g;
    }
    cObjChunk(c) {
      const h = this.key(), g = this.cNode();
      g.parent = c, c.keys.set(h, g.id);
    }
    cVec(c, h) {
      const g = this.reader, p = new e.VecNode(this.doc, c), b = p.elements;
      for (let k = 0; k < h; k++)
        if (!g.peak())
          g.x++, b.push(void 0);
        else {
          const _ = this.cNode();
          _.parent = p, b.push(_.id);
        }
      return this.doc.index.set(c, p), p;
    }
    cStr(c, h) {
      const g = new e.StrNode(c);
      return h && g.ingest(h, this.cStrChunk), this.doc.index.set(c, g), g;
    }
    cBin(c, h) {
      const g = new e.BinNode(c);
      return h && g.ingest(h, this.cBinChunk), this.doc.index.set(c, g), g;
    }
    cArr(c, h) {
      const g = new e.ArrNode(this.doc, c);
      return h && g.ingest(h, () => {
        const p = this.ts(), [b, k] = this.reader.b1vu56();
        if (b)
          return new e.ArrChunk(p, k, void 0);
        const m = [];
        for (let _ = 0; _ < k; _++) {
          const f = this.cNode();
          f.parent = g, m.push(f.id);
        }
        return new e.ArrChunk(p, k, m);
      }), this.doc.index.set(c, g), g;
    }
  };
  return ar.Decoder = u, ar;
}
var La;
function Ld() {
  if (La) return Nt;
  La = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.decoder = Nt.encoder = void 0;
  const r = Rd(), e = Bd();
  return Nt.encoder = new r.Encoder(), Nt.decoder = new e.Decoder(), Nt;
}
var Wi = {}, ye = {}, ur = {}, ci = {}, Ma;
function uo() {
  if (Ma) return ci;
  Ma = 1, Object.defineProperty(ci, "__esModule", { value: !0 }), ci.hasOwnProperty = e;
  const r = Object.prototype.hasOwnProperty;
  function e(t, i) {
    return r.call(t, i);
  }
  return ci;
}
var Da;
function ol() {
  if (Da) return ur;
  Da = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.get = void 0;
  const r = uo(), e = (t, i) => {
    const n = i.length;
    let s;
    if (!n)
      return t;
    for (let o = 0; o < n; o++)
      if (s = i[o], t instanceof Array) {
        if (typeof s != "number") {
          if (s === "-")
            return;
          const a = ~~s;
          if ("" + a !== s)
            return;
          s = a;
        }
        t = t[s];
      } else if (typeof t == "object") {
        if (!t || !(0, r.hasOwnProperty)(t, s))
          return;
        t = t[s];
      } else
        return;
    return t;
  };
  return ur.get = e, ur;
}
var Gi = {}, qa;
function lo() {
  return qa || (qa = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.isInteger = r.isRoot = r.toPath = void 0, r.unescapeComponent = s, r.escapeComponent = o, r.parseJsonPointer = a, r.formatJsonPointer = u, r.isChild = c, r.isPathEqual = h, r.parent = p, r.isValidIndex = b;
    const e = /~1/g, t = /~0/g, i = /~/g, n = /\//g;
    function s(m) {
      return m.indexOf("~") === -1 ? m : m.replace(e, "/").replace(t, "~");
    }
    function o(m) {
      return m.indexOf("/") === -1 && m.indexOf("~") === -1 ? m : m.replace(i, "~0").replace(n, "~1");
    }
    function a(m) {
      return m ? m.slice(1).split("/").map(s) : [];
    }
    function u(m) {
      return (0, r.isRoot)(m) ? "" : "/" + m.map((_) => o(String(_))).join("/");
    }
    const l = (m) => typeof m == "string" ? a(m) : m;
    r.toPath = l;
    function c(m, _) {
      if (m.length >= _.length)
        return !1;
      for (let f = 0; f < m.length; f++)
        if (m[f] !== _[f])
          return !1;
      return !0;
    }
    function h(m, _) {
      if (m.length !== _.length)
        return !1;
      for (let f = 0; f < m.length; f++)
        if (m[f] !== _[f])
          return !1;
      return !0;
    }
    const g = (m) => !m.length;
    r.isRoot = g;
    function p(m) {
      if (m.length < 1)
        throw new Error("NO_PARENT");
      return m.slice(0, m.length - 1);
    }
    function b(m) {
      if (typeof m == "number")
        return !0;
      const _ = Number.parseInt(m, 10);
      return String(_) === m && _ >= 0;
    }
    const k = (m) => {
      const _ = m.length;
      let f = 0, d;
      for (; f < _; ) {
        if (d = m.charCodeAt(f), d >= 48 && d <= 57) {
          f++;
          continue;
        }
        return !1;
      }
      return !0;
    };
    r.isInteger = k;
  })(Gi)), Gi;
}
var lr = {}, Xi = {}, Yi = {}, Ua;
function Md() {
  return Ua || (Ua = 1, Object.defineProperty(Yi, "__esModule", { value: !0 })), Yi;
}
var Qi = {}, Fa;
function Dd() {
  return Fa || (Fa = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.validatePath = r.validateJsonPointer = void 0;
    const e = (n) => {
      if (typeof n == "string") {
        if (n) {
          if (n[0] !== "/")
            throw new Error("POINTER_INVALID");
          if (n.length > 1024)
            throw new Error("POINTER_TOO_LONG");
        }
      } else
        (0, r.validatePath)(n);
    };
    r.validateJsonPointer = e;
    const { isArray: t } = Array, i = (n) => {
      if (!t(n))
        throw new Error("Invalid path.");
      if (n.length > 256)
        throw new Error("Path too long.");
      for (const s of n)
        switch (typeof s) {
          case "string":
          case "number":
            continue;
          default:
            throw new Error("Invalid path step.");
        }
    };
    r.validatePath = i;
  })(Qi)), Qi;
}
var Pe = {}, Ha;
function qd() {
  if (Ha) return Pe;
  Ha = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.isObjectReference = Pe.isArrayEnd = Pe.isArrayReference = Pe.find = void 0;
  const r = uo(), { isArray: e } = Array, t = (o, a) => {
    const u = a.length;
    if (!u)
      return { val: o };
    let l, c;
    for (let g = 0; g < u; g++)
      if (l = o, c = a[g], e(l)) {
        const p = l.length;
        if (c === "-")
          c = p;
        else if (typeof c == "string") {
          const b = ~~c;
          if ("" + b !== c)
            throw new Error("INVALID_INDEX");
          if (c = b, c < 0)
            throw new Error("INVALID_INDEX");
        }
        o = l[c];
      } else if (typeof l == "object" && l)
        o = (0, r.hasOwnProperty)(l, c) ? l[c] : void 0;
      else
        throw new Error("NOT_FOUND");
    return { val: o, obj: l, key: c };
  };
  Pe.find = t;
  const i = (o) => e(o.obj) && typeof o.key == "number";
  Pe.isArrayReference = i;
  const n = (o) => o.obj.length === o.key;
  Pe.isArrayEnd = n;
  const s = (o) => typeof o.obj == "object" && typeof o.key == "string";
  return Pe.isObjectReference = s, Pe;
}
var $i = {}, hr = {}, za;
function Ud() {
  if (za) return hr;
  za = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.findByPointer = void 0;
  const r = uo(), e = lo(), { isArray: t } = Array, i = (n, s) => {
    if (!n)
      return { val: s };
    let o, a, u = 0, l = 1;
    for (; u > -1; )
      if (u = n.indexOf("/", l), a = u > -1 ? n.substring(l, u) : n.substring(l), l = u + 1, o = s, t(o)) {
        const c = o.length;
        if (a === "-")
          a = c;
        else {
          const h = ~~a;
          if ("" + h !== a)
            throw new Error("INVALID_INDEX");
          if (a = h, a < 0)
            throw "INVALID_INDEX";
        }
        s = o[a];
      } else if (typeof o == "object" && o)
        a = (0, e.unescapeComponent)(a), s = (0, r.hasOwnProperty)(o, a) ? o[a] : void 0;
      else
        throw "NOT_FOUND";
    return { val: s, obj: o, key: a };
  };
  return hr.findByPointer = i, hr;
}
var Za;
function Fd() {
  return Za || (Za = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), re.__exportStar(Ud(), r);
  })($i)), $i;
}
var Ka;
function Hd() {
  return Ka || (Ka = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Md(), r), e.__exportStar(lo(), r), e.__exportStar(Dd(), r), e.__exportStar(ol(), r), e.__exportStar(qd(), r), e.__exportStar(Fd(), r);
  })(Xi)), Xi;
}
var Ja;
function zd() {
  if (Ja) return lr;
  Ja = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.find = void 0;
  const r = Hd(), e = Ot(), t = (i, n) => {
    const s = (0, r.toPath)(n);
    let o = i;
    const a = s.length;
    if (!a)
      return o;
    let u = 0;
    for (; u < a && o; ) {
      const l = s[u++];
      if (o = o.container(), !o)
        throw new Error("NOT_CONTAINER");
      if (o instanceof e.ObjNode) {
        const c = o.get(String(l));
        if (!c)
          throw new Error("NOT_FOUND");
        o = c;
      } else if (o instanceof e.ArrNode) {
        const c = o.getNode(Number(l));
        if (!c)
          throw new Error("NOT_FOUND");
        o = c;
      } else if (o instanceof e.VecNode) {
        const c = o.get(Number(l));
        if (!c)
          throw new Error("NOT_FOUND");
        o = c;
      }
    }
    return o;
  };
  return lr.find = t, lr;
}
var dr = {}, Re = {}, fr = {}, Wa;
function al() {
  if (Wa) return fr;
  Wa = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.FanOut = void 0;
  class r {
    constructor() {
      this.listeners = /* @__PURE__ */ new Set();
    }
    emit(t) {
      this.listeners.forEach((i) => i(t));
    }
    listen(t) {
      const i = this.listeners;
      return i.add(t), () => i.delete(t);
    }
  }
  return fr.FanOut = r, fr;
}
var Ga;
function cl() {
  if (Ga) return Re;
  Ga = 1, Object.defineProperty(Re, "__esModule", { value: !0 }), Re.OnNewFanOut = Re.MapFanOut = Re.MicrotaskBufferFanOut = Re.MergeFanOut = void 0;
  const r = al();
  class e extends r.FanOut {
    constructor(o, a = (u) => u) {
      super(), this.fanouts = o, this.mappper = a, this.unsubs = [];
    }
    listen(o) {
      this.listeners.size || (this.unsubs = this.fanouts.map((u) => u.listen((l) => this.emit(this.mappper(l)))));
      const a = super.listen(o);
      return () => {
        if (a(), !this.listeners.size) {
          for (const u of this.unsubs)
            u();
          this.unsubs = [];
        }
      };
    }
  }
  Re.MergeFanOut = e;
  class t extends r.FanOut {
    constructor(o) {
      super(), this.source = o, this.buffer = [], this.unsub = void 0;
    }
    listen(o) {
      this.unsub || (this.unsub = this.source.listen((u) => {
        const l = this.buffer;
        l.length || queueMicrotask(() => {
          this.emit(l), this.buffer = [];
        }), l.push(u);
      }));
      const a = super.listen(o);
      return () => {
        a(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), this.buffer = [], (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  Re.MicrotaskBufferFanOut = t;
  class i extends r.FanOut {
    constructor(o, a) {
      super(), this.source = o, this.mapper = a, this.unsub = void 0;
    }
    listen(o) {
      this.unsub || (this.unsub = this.source.listen((u) => this.emit(this.mapper(u))));
      const a = super.listen(o);
      return () => {
        a(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  Re.MapFanOut = i;
  class n extends r.FanOut {
    constructor(o, a = void 0) {
      super(), this.source = o, this.last = a, this.unsub = void 0;
    }
    listen(o) {
      this.unsub || (this.unsub = this.source.listen((u) => {
        this.last !== u && this.emit(this.last = u);
      }));
      const a = super.listen(o);
      return () => {
        a(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), this.last = void 0, (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  return Re.OnNewFanOut = n, Re;
}
var Xa;
function Zd() {
  if (Xa) return dr;
  Xa = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.NodeEvents = void 0;
  const r = cl();
  let e = class {
    constructor(i) {
      this.api = i, this.subscribe = (n) => this.onViewChanges.listen(() => n()), this.getSnapshot = () => this.api.view(), this.onChanges = new r.MapFanOut(this.api.api.onChanges, this.getSnapshot), this.onViewChanges = new r.OnNewFanOut(this.onChanges, this.api.view());
    }
    onChange(i) {
      return this.api.api.onChange.listen((s) => {
        i(s);
      });
    }
    /**
     * Called when this node is deleted.
     *
     * @internal
     * @ignore
     */
    handleDelete() {
      this.onViewChanges.clear(), this.onChanges.clear();
    }
  };
  return dr.NodeEvents = e, dr;
}
var pr = {}, Ya;
function Kd() {
  if (Ya) return pr;
  Ya = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.ExtNode = void 0;
  const r = de();
  let e = class {
    constructor(i) {
      this.data = i, this.api = void 0, this.parent = void 0, this.id = i.id;
    }
    children(i) {
    }
    child() {
      return this.data;
    }
    container() {
      return this.data.container();
    }
    // ---------------------------------------------------------------- Printable
    toString(i, n) {
      return this.name() + (n ? " " + (0, r.printTs)(n) : "") + " " + this.data.toString(i);
    }
  };
  return pr.ExtNode = e, pr;
}
var At = {}, es = {}, ts = {}, Qa;
function Jd() {
  return Qa || (Qa = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.deepEqual = void 0;
    const e = Array.isArray, t = Object.prototype, i = (n, s) => {
      if (n === s)
        return !0;
      let o = 0, a = 0;
      if (e(n)) {
        if (!e(s) || (o = n.length, o !== s.length))
          return !1;
        for (a = o; a-- !== 0; )
          if (!(0, r.deepEqual)(n[a], s[a]))
            return !1;
        return !0;
      }
      if (n && s && typeof n == "object" && typeof s == "object") {
        e: {
          if (n.__proto__ === t)
            break e;
          if (n instanceof Uint8Array) {
            if (!(s instanceof Uint8Array))
              return !1;
            const l = n.length;
            if (l !== s.length)
              return !1;
            for (let c = 0; c < l; c++)
              if (n[c] !== s[c])
                return !1;
            return !0;
          }
        }
        const u = Object.keys(n);
        if (o = u.length, o !== Object.keys(s).length || e(s))
          return !1;
        for (a = o; a-- !== 0; ) {
          const l = u[a];
          if (!(0, r.deepEqual)(n[l], s[l]))
            return !1;
        }
        return !0;
      }
      return !1;
    };
    r.deepEqual = i;
  })(ts)), ts;
}
var $a;
function Wd() {
  return $a || ($a = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), re.__exportStar(Jd(), r);
  })(es)), es;
}
var yr = {}, ec;
function Gd() {
  if (ec) return yr;
  ec = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.cmpUint8Array = void 0;
  const r = (e, t) => {
    const i = e.length;
    if (i !== t.length)
      return !1;
    for (let n = 0; n < i; n++)
      if (e[n] !== t[n])
        return !1;
    return !0;
  };
  return yr.cmpUint8Array = r, yr;
}
var ns = {}, tc;
function ho() {
  return tc || (tc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.apply = r.invert = r.dst = r.src = r.diffEdit = r.diff = r.overlap = r.sfx = r.pfx = r.normalize = void 0;
    const e = (d) => {
      const y = d.length;
      if (y < 2)
        return d;
      let v = 0;
      e: {
        if (!d[0][1])
          break e;
        for (v = 1; v < y; v++) {
          const x = d[v - 1], I = d[v];
          if (!I[1] || x[0] === I[0])
            break e;
        }
        return d;
      }
      const w = [];
      for (let x = 0; x < v; x++)
        w.push(d[x]);
      for (let x = v; x < y; x++) {
        const I = d[x];
        if (!I[1])
          continue;
        const C = w.length > 0 ? w[w.length - 1] : null;
        C && C[0] === I[0] ? C[1] += I[1] : w.push(I);
      }
      return w;
    };
    r.normalize = e;
    const t = (d) => {
      const y = d.charCodeAt(0);
      return y >= 56320 && y <= 57343;
    }, i = (d) => {
      const y = d.charCodeAt(d.length - 1);
      return y >= 55296 && y <= 56319;
    }, n = (d, y) => {
      d.push([0, ""]);
      let v = 0, w = 0, x = 0, I = "", C = "", E = 0;
      for (; v < d.length; ) {
        if (v < d.length - 1 && !d[v][1]) {
          d.splice(v, 1);
          continue;
        }
        const T = d[v];
        switch (T[0]) {
          case 1:
            x++, v++, C += T[1];
            break;
          case -1:
            w++, v++, I += T[1];
            break;
          case 0: {
            let j = v - x - w - 1;
            if (y) {
              const V = d[j];
              if (j >= 0) {
                let he = V[1];
                if (i(he)) {
                  const Y = he.slice(-1);
                  if (V[1] = he = he.slice(0, -1), I = Y + I, C = Y + C, !he) {
                    d.splice(j, 1), v--;
                    let fe = j - 1;
                    const ce = d[fe];
                    if (ce) {
                      const oe = ce[0];
                      oe === 1 ? (x++, fe--, C = ce[1] + C) : oe === -1 && (w++, fe--, I = ce[1] + I);
                    }
                    j = fe;
                  }
                }
              }
              const z = d[v], J = z[1];
              if (t(J)) {
                const he = J.charAt(0);
                z[1] = J.slice(1), I += he, C += he;
              }
            }
            if (v < d.length - 1 && !d[v][1]) {
              d.splice(v, 1);
              break;
            }
            const P = I.length > 0, R = C.length > 0;
            if (P || R) {
              P && R && (E = (0, r.pfx)(C, I), E !== 0 && (j >= 0 ? d[j][1] += C.slice(0, E) : (d.splice(0, 0, [0, C.slice(0, E)]), v++), C = C.slice(E), I = I.slice(E)), E = (0, r.sfx)(C, I), E !== 0 && (d[v][1] = C.slice(C.length - E) + d[v][1], C = C.slice(0, C.length - E), I = I.slice(0, I.length - E)));
              const V = x + w, z = I.length, J = C.length;
              z === 0 && J === 0 ? (d.splice(v - V, V), v = v - V) : z === 0 ? (d.splice(v - V, V, [1, C]), v = v - V + 1) : J === 0 ? (d.splice(v - V, V, [-1, I]), v = v - V + 1) : (d.splice(v - V, V, [-1, I], [1, C]), v = v - V + 2);
            }
            const M = d[v - 1];
            v !== 0 && M[0] === 0 ? (M[1] += d[v][1], d.splice(v, 1)) : v++, x = 0, w = 0, I = "", C = "";
            break;
          }
        }
      }
      d[d.length - 1][1] === "" && d.pop();
      let O = !1;
      for (v = 1; v < d.length - 1; ) {
        const T = d[v - 1], j = d[v + 1];
        if (T[0] === 0 && j[0] === 0) {
          const P = T[1], R = d[v], M = R[1], V = j[1];
          M.slice(M.length - P.length) === P ? (d[v][1] = P + M.slice(0, M.length - P.length), j[1] = P + V, d.splice(v - 1, 1), O = !0) : M.slice(0, V.length) === V && (T[1] += j[1], R[1] = M.slice(V.length) + V, d.splice(v + 1, 1), O = !0);
        }
        v++;
      }
      O && n(d, y);
    }, s = (d, y, v, w) => {
      if (v > 0 && v < d.length) {
        const C = d.charCodeAt(v);
        C >= 56320 && C <= 57343 && v--;
      }
      if (w > 0 && w < y.length) {
        const C = y.charCodeAt(w);
        C >= 56320 && C <= 57343 && w--;
      }
      const x = h(d.slice(0, v), y.slice(0, w), !1), I = h(d.slice(v), y.slice(w), !1);
      return x.concat(I);
    }, o = (d, y) => {
      const v = d.length, w = y.length, x = Math.ceil((v + w) / 2), I = x, C = 2 * x, E = new Array(C), O = new Array(C);
      for (let z = 0; z < C; z++)
        E[z] = -1, O[z] = -1;
      E[I + 1] = 0, O[I + 1] = 0;
      const T = v - w, j = T % 2 !== 0;
      let P = 0, R = 0, M = 0, V = 0;
      for (let z = 0; z < x; z++) {
        for (let J = -z + P; J <= z - R; J += 2) {
          const he = I + J;
          let Y = 0;
          const fe = E[he - 1], ce = E[he + 1];
          J === -z || J !== z && fe < ce ? Y = ce : Y = fe + 1;
          let oe = Y - J;
          for (; Y < v && oe < w && d.charAt(Y) === y.charAt(oe); )
            Y++, oe++;
          if (E[he] = Y, Y > v)
            R += 2;
          else if (oe > w)
            P += 2;
          else if (j) {
            const ie = I + T - J, xe = O[ie];
            if (ie >= 0 && ie < C && xe !== -1 && Y >= v - xe)
              return s(d, y, Y, oe);
          }
        }
        for (let J = -z + M; J <= z - V; J += 2) {
          const he = I + J;
          let Y = J === -z || J !== z && O[he - 1] < O[he + 1] ? O[he + 1] : O[he - 1] + 1, fe = Y - J;
          for (; Y < v && fe < w && d.charAt(v - Y - 1) === y.charAt(w - fe - 1); )
            Y++, fe++;
          if (O[he] = Y, Y > v)
            V += 2;
          else if (fe > w)
            M += 2;
          else if (!j) {
            const ce = I + T - J, oe = E[ce];
            if (ce >= 0 && ce < C && oe !== -1) {
              const ie = I + oe - ce;
              if (Y = v - Y, oe >= Y)
                return s(d, y, oe, ie);
            }
          }
        }
      }
      return [
        [-1, d],
        [1, y]
      ];
    }, a = (d, y) => {
      if (!d)
        return [[1, y]];
      if (!y)
        return [[-1, d]];
      const v = d.length, w = y.length, x = v > w ? d : y, I = v > w ? y : d, C = I.length, E = x.indexOf(I);
      if (E >= 0) {
        const O = x.slice(0, E), T = x.slice(E + C);
        return v > w ? [
          [-1, O],
          [0, I],
          [-1, T]
        ] : [
          [1, O],
          [0, I],
          [1, T]
        ];
      }
      return C === 1 ? [
        [-1, d],
        [1, y]
      ] : o(d, y);
    }, u = (d, y) => {
      if (!d || !y || d.charAt(0) !== y.charAt(0))
        return 0;
      let v = 0, w = Math.min(d.length, y.length), x = w, I = 0;
      for (; v < x; )
        d.slice(I, x) === y.slice(I, x) ? (v = x, I = v) : w = x, x = Math.floor((w - v) / 2 + v);
      const C = d.charCodeAt(x - 1);
      return C >= 55296 && C <= 56319 && x--, x;
    };
    r.pfx = u;
    const l = (d, y) => {
      if (!d || !y || d.slice(-1) !== y.slice(-1))
        return 0;
      let v = 0, w = Math.min(d.length, y.length), x = w, I = 0;
      for (; v < x; )
        d.slice(d.length - x, d.length - I) === y.slice(y.length - x, y.length - I) ? (v = x, I = v) : w = x, x = Math.floor((w - v) / 2 + v);
      if (x > 0 && x < d.length) {
        const C = d.length - x - 1, E = d.charCodeAt(C), O = E >= 55296 && E <= 56319, T = E === 8205 || // ZWJ
        E >= 65024 && E <= 65039 || // Variation selectors
        E >= 768 && E <= 879;
        if (O || T)
          for (x--; x > 0; ) {
            const j = d.length - x - 1;
            if (j < 0)
              break;
            const P = d.charCodeAt(j), R = P >= 55296 && P <= 56319, M = P === 8205 || P >= 65024 && P <= 65039 || P >= 768 && P <= 879;
            if (!R && !M)
              break;
            x--;
          }
      }
      return x;
    };
    r.sfx = l;
    const c = (d, y) => {
      const v = d.length, w = y.length;
      if (v === 0 || w === 0)
        return 0;
      let x = v;
      if (v > w ? (x = w, d = d.substring(v - w)) : v < w && (y = y.substring(0, v)), d === y)
        return x;
      let I = 0, C = 1;
      for (; ; ) {
        const E = d.substring(x - C), O = y.indexOf(E);
        if (O === -1)
          return I;
        C += O, (O === 0 || d.substring(x - C) === y.substring(0, C)) && (I = C, C++);
      }
    };
    r.overlap = c;
    const h = (d, y, v) => {
      if (d === y)
        return d ? [[0, d]] : [];
      const w = (0, r.pfx)(d, y), x = d.slice(0, w);
      d = d.slice(w), y = y.slice(w);
      const I = (0, r.sfx)(d, y), C = d.slice(d.length - I);
      d = d.slice(0, d.length - I), y = y.slice(0, y.length - I);
      const E = a(d, y);
      return x && E.unshift([0, x]), C && E.push([0, C]), n(E, v), E;
    }, g = (d, y) => h(d, y, !0);
    r.diff = g;
    const p = (d, y, v) => {
      e: {
        if (v < 0)
          break e;
        const w = d.length, x = y.length;
        if (w === x)
          break e;
        const I = y.slice(v), C = I.length;
        if (C > w || d.slice(w - C) !== I)
          break e;
        if (x > w) {
          const T = w - C, j = d.slice(0, T), P = y.slice(0, T);
          if (j !== P)
            break e;
          const R = y.slice(T, v), M = [];
          return j && M.push([0, j]), R && M.push([1, R]), I && M.push([0, I]), M;
        } else {
          const T = x - C, j = y.slice(0, T), P = d.slice(0, T);
          if (P !== j)
            break e;
          const R = d.slice(T, w - C), M = [];
          return P && M.push([0, P]), R && M.push([-1, R]), I && M.push([0, I]), M;
        }
      }
      return (0, r.diff)(d, y);
    };
    r.diffEdit = p;
    const b = (d) => {
      let y = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const x = d[w];
        x[0] !== 1 && (y += x[1]);
      }
      return y;
    };
    r.src = b;
    const k = (d) => {
      let y = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const x = d[w];
        x[0] !== -1 && (y += x[1]);
      }
      return y;
    };
    r.dst = k;
    const m = (d) => {
      const y = d[0];
      return y === 0 ? d : y === 1 ? [-1, d[1]] : [1, d[1]];
    }, _ = (d) => d.map(m);
    r.invert = _;
    const f = (d, y, v, w) => {
      const x = d.length;
      let I = y;
      for (let C = x - 1; C >= 0; C--) {
        const [E, O] = d[C];
        if (E === 0)
          I -= O.length;
        else if (E === 1)
          v(I, O);
        else {
          const T = O.length;
          I -= T, w(I, T, O);
        }
      }
    };
    r.apply = f;
  })(ns)), ns;
}
var rs = {}, nc;
function Xd() {
  return nc || (nc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.dst = r.src = r.apply = r.diff = r.toBin = r.toStr = void 0;
    const t = re.__importStar(ho()), i = (l) => {
      let c = "";
      const h = l.length;
      for (let g = 0; g < h; g++)
        c += String.fromCharCode(l[g]);
      return c;
    };
    r.toStr = i;
    const n = (l) => {
      const c = l.length, h = new Uint8Array(c);
      for (let g = 0; g < c; g++)
        h[g] = l.charCodeAt(g);
      return h;
    };
    r.toBin = n;
    const s = (l, c) => {
      const h = (0, r.toStr)(l), g = (0, r.toStr)(c);
      return t.diff(h, g);
    };
    r.diff = s;
    const o = (l, c, h, g) => t.apply(l, c, (p, b) => h(p, (0, r.toBin)(b)), g);
    r.apply = o;
    const a = (l) => (0, r.toBin)(t.src(l));
    r.src = a;
    const u = (l) => (0, r.toBin)(t.dst(l));
    r.dst = u;
  })(rs)), rs;
}
var is = {}, rc;
function Yd() {
  return rc || (rc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.apply = r.diff = r.agg = void 0;
    const t = re.__importStar(ho()), i = (o) => {
      const a = [], u = o.length;
      let l = [];
      const c = (h, g) => {
        if (!g.length)
          return;
        const p = l.length;
        if (p) {
          const b = l[p - 1];
          if (b[0] === h) {
            b[1] += g;
            return;
          }
        }
        l.push([h, g]);
      };
      e: for (let h = 0; h < u; h++) {
        const g = o[h], p = g[0], b = g[1], k = b.indexOf(`
`);
        if (k < 0) {
          c(p, b);
          continue e;
        } else
          c(p, b.slice(0, k + 1)), l.length && a.push(l), l = [];
        let m = k;
        const _ = b.length;
        t: for (; m < _; ) {
          const f = b.indexOf(`
`, m + 1);
          if (f < 0) {
            c(p, b.slice(m + 1));
            break t;
          }
          a.push([[p, b.slice(m + 1, f + 1)]]), m = f;
        }
      }
      l.length && a.push(l);
      {
        const h = a.length;
        for (let g = 0; g < h; g++) {
          const p = a[g] = t.normalize(a[g]), b = p.length;
          e: {
            if (b < 2)
              break e;
            const k = p[0], m = p[1], _ = m[0];
            if (k[0] !== 0 || _ !== -1 && _ !== 1)
              break e;
            for (let f = 2; f < b; f++)
              if (p[f][0] !== _)
                break e;
            for (let f = g + 1; f < h; f++) {
              const d = a[f] = t.normalize(a[f]), y = d.length, v = k[1];
              let w, x;
              if (d.length > 1 && (w = d[0])[0] === _ && (x = d[1])[0] === 0 && v === w[1]) {
                p.splice(0, 1), m[1] = v + m[1], x[1] = v + x[1], d.splice(0, 1);
                break e;
              } else
                for (let I = 0; I < y; I++)
                  if (d[I][0] !== _)
                    break e;
            }
          }
          e: {
            if (p.length < 2)
              break e;
            const k = p[p.length - 1], m = k[1];
            if (k[0] !== -1)
              break e;
            t: for (let _ = g + 1; _ < h; _++) {
              const f = a[_] = t.normalize(a[_]), d = f.length;
              let y;
              if (d === 0)
                continue t;
              if (d === 1) {
                if (y = f[0], y[0] === -1)
                  continue t;
                if (f[0][0] !== 0)
                  break e;
              } else if (y = f[1], d > 2 || f[0][0] !== -1)
                break e;
              const v = y[0];
              if (v === -1)
                continue t;
              if (v !== 0)
                break e;
              const w = y[1];
              if (w.length > m.length || !m.endsWith(w))
                break e;
              const x = m.length - w.length;
              k[1] = m.slice(0, x), p.push([0, w]), y[0] = -1, a[g] = t.normalize(a[g]), a[_] = t.normalize(a[_]);
              break e;
            }
          }
        }
      }
      return a;
    };
    r.agg = i;
    const n = (o, a) => {
      if (!a.length)
        return o.map((f, d) => [-1, d, -1]);
      if (!o.length)
        return a.map((f, d) => [1, -1, d]);
      const u = o.join(`
`) + `
`, l = a.join(`
`) + `
`;
      if (u === l)
        return [];
      const c = t.diff(u, l), h = (0, r.agg)(c), g = h.length, p = [];
      let b = -1, k = -1;
      const m = o.length, _ = a.length;
      for (let f = 0; f < g; f++) {
        const d = h[f];
        let y = d.length;
        if (!y)
          continue;
        const v = d[y - 1], w = v[0], x = v[1];
        if (x === `
`)
          d.splice(y - 1, 1);
        else {
          const C = x.length;
          x[C - 1] === `
` && (C === 1 ? d.splice(y - 1, 1) : v[1] = x.slice(0, C - 1));
        }
        let I = 0;
        if (y = d.length, !y)
          w === 0 ? (I = 0, b++, k++) : w === 1 ? (I = 1, k++) : w === -1 && (I = -1, b++);
        else if (f + 1 === g)
          b + 1 < m ? k + 1 < _ ? (I = y === 1 && d[0][0] === 0 ? 0 : 2, b++, k++) : (I = -1, b++) : (I = 1, k++);
        else {
          const E = d[0][0];
          y === 1 && E === w && E === 0 ? (b++, k++) : w === 0 ? (I = 2, b++, k++) : w === 1 ? (I = 1, k++) : w === -1 && (I = -1, b++);
        }
        I === 0 && o[b] !== a[k] && (I = 2), p.push([I, b, k]);
      }
      return p;
    };
    r.diff = n;
    const s = (o, a, u, l) => {
      const c = o.length;
      e: for (let h = c - 1; h >= 0; h--) {
        const [g, p, b] = o[h];
        switch (g) {
          case 0:
            continue e;
          case -1:
            a(p);
            break;
          case 1:
            u(p, b);
            break;
          case 2:
            l(p, b);
            break;
        }
      }
    };
    r.apply = s;
  })(is)), is;
}
var ss = {}, gr = {}, ic;
function xi() {
  if (ic) return gr;
  ic = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.sort = void 0;
  const r = (e) => {
    const t = e.length;
    for (let i = 1; i < t; i++) {
      const n = e[i];
      let s = i;
      for (; s !== 0 && e[s - 1] > n; )
        e[s] = e[s - 1], s--;
      e[s] = n;
    }
    return e;
  };
  return gr.sort = r, gr;
}
var os = {}, sc;
function fo() {
  return sc || (sc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.hash = r.updateJson = r.updateBin = r.updateStr = r.updateNum = r.CONST = void 0;
    const e = xi();
    var t;
    (function(u) {
      u[u.START_STATE = 5381] = "START_STATE", u[u.NULL = 982452847] = "NULL", u[u.TRUE = 982453247] = "TRUE", u[u.FALSE = 982454243] = "FALSE", u[u.ARRAY = 982452259] = "ARRAY", u[u.STRING = 982453601] = "STRING", u[u.OBJECT = 982454533] = "OBJECT", u[u.BINARY = 982454837] = "BINARY";
    })(t || (r.CONST = t = {}));
    const i = (u, l) => (u << 5) + u + l;
    r.updateNum = i;
    const n = (u, l) => {
      const c = l.length;
      u = (0, r.updateNum)(u, t.STRING), u = (0, r.updateNum)(u, c);
      let h = c;
      for (; h; )
        u = (u << 5) + u + l.charCodeAt(--h);
      return u;
    };
    r.updateStr = n;
    const s = (u, l) => {
      const c = l.length;
      u = (0, r.updateNum)(u, t.BINARY), u = (0, r.updateNum)(u, c);
      let h = c;
      for (; h; )
        u = (u << 5) + u + l[--h];
      return u;
    };
    r.updateBin = s;
    const o = (u, l) => {
      switch (typeof l) {
        case "number":
          return (0, r.updateNum)(u, l);
        case "string":
          return u = (0, r.updateNum)(u, t.STRING), (0, r.updateStr)(u, l);
        case "object": {
          if (l === null)
            return (0, r.updateNum)(u, t.NULL);
          if (Array.isArray(l)) {
            const g = l.length;
            u = (0, r.updateNum)(u, t.ARRAY);
            for (let p = 0; p < g; p++)
              u = (0, r.updateJson)(u, l[p]);
            return u;
          }
          if (l instanceof Uint8Array)
            return (0, r.updateBin)(u, l);
          u = (0, r.updateNum)(u, t.OBJECT);
          const c = (0, e.sort)(Object.keys(l)), h = c.length;
          for (let g = 0; g < h; g++) {
            const p = c[g];
            u = (0, r.updateStr)(u, p), u = (0, r.updateJson)(u, l[p]);
          }
          return u;
        }
        case "boolean":
          return (0, r.updateNum)(u, l ? t.TRUE : t.FALSE);
      }
      return u;
    };
    r.updateJson = o;
    const a = (u) => (0, r.updateJson)(t.START_STATE, u) >>> 0;
    r.hash = a;
  })(os)), os;
}
var as = {}, oc;
function ul() {
  return oc || (oc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.structHash = void 0;
    const e = xi(), t = fo(), i = xt(), n = (s) => {
      switch (typeof s) {
        case "string":
          return (0, t.hash)(s).toString(36);
        case "number":
        case "bigint":
          return s.toString(36);
        case "boolean":
          return s ? "T" : "F";
        case "object":
          if (s === null)
            return "N";
          if (s instanceof i.Timestamp)
            return (s.sid % 2e6).toString(36) + "." + s.time.toString(36);
          if (Array.isArray(s)) {
            const o = s.length;
            let a = "[";
            for (let u = 0; u < o; u++)
              a += (0, r.structHash)(s[u]) + ";";
            return a + "]";
          } else {
            if (s instanceof Uint8Array)
              return (0, t.hash)(s).toString(36);
            {
              const o = Object.keys(s);
              (0, e.sort)(o);
              let a = "{";
              const u = o.length;
              for (let l = 0; l < u; l++) {
                const c = o[l];
                a += (0, t.hash)(c).toString(36) + ":" + (0, r.structHash)(s[c]) + ",";
              }
              return a + "}";
            }
          }
        default:
          return "U";
      }
    };
    r.structHash = n;
  })(as)), as;
}
var ac;
function Qd() {
  return ac || (ac = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.structHashCrdt = void 0;
    const e = xi(), t = xl(), i = fo(), n = ul(), s = (o) => {
      if (o instanceof t.ConNode)
        return (0, n.structHash)(o.val);
      if (o instanceof t.ValNode)
        return (0, r.structHashCrdt)(o.node());
      if (o instanceof t.StrNode)
        return (0, i.hash)(o.view()).toString(36);
      if (o instanceof t.ObjNode) {
        let a = "{";
        const u = Array.from(o.keys.keys());
        (0, e.sort)(u);
        const l = u.length;
        for (let c = 0; c < l; c++) {
          const h = u[c], g = o.get(h);
          a += (0, i.hash)(h).toString(36) + ":" + (0, r.structHashCrdt)(g) + ",";
        }
        return a + "}";
      } else if (o instanceof t.ArrNode || o instanceof t.VecNode) {
        let a = "[";
        return o.children((u) => {
          a += (0, r.structHashCrdt)(u) + ";";
        }), a + "]";
      } else if (o instanceof t.BinNode)
        return (0, i.hash)(o.view()).toString(36);
      return "U";
    };
    r.structHashCrdt = s;
  })(ss)), ss;
}
var cs = {}, cc;
function $d() {
  return cc || (cc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.structHashSchema = void 0;
    const e = xi(), t = ki(), i = fo(), n = ul(), s = (o) => {
      if (o instanceof t.nodes.con || o instanceof t.nodes.str || o instanceof t.nodes.bin)
        return (0, n.structHash)(o.raw);
      if (o instanceof t.nodes.val)
        return (0, r.structHashSchema)(o.value);
      if (o instanceof t.nodes.obj) {
        let a = "{";
        const u = { ...o.obj, ...o.opt }, l = Object.keys(u);
        (0, e.sort)(l);
        const c = l.length;
        for (let h = 0; h < c; h++) {
          const g = l[h], p = u[g];
          a += (0, i.hash)(g).toString(36) + ":" + (0, r.structHashSchema)(p) + ",";
        }
        return a + "}";
      } else if (o instanceof t.nodes.arr || o instanceof t.nodes.vec) {
        let a = "[";
        const u = o instanceof t.nodes.arr ? o.arr : o.value;
        for (const l of u)
          a += (0, r.structHashSchema)(l) + ";";
        return a + "]";
      }
      return (0, n.structHash)(o);
    };
    r.structHashSchema = s;
  })(cs)), cs;
}
var uc;
function ll() {
  if (uc) return At;
  uc = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.JsonCrdtDiff = At.DiffError = void 0;
  const r = re, e = Wd(), t = Gd(), i = xt(), n = Ot(), s = r.__importStar(ho()), o = r.__importStar(Xd()), a = r.__importStar(Yd()), u = Qd(), l = $d();
  class c extends Error {
    constructor(p = "DIFF") {
      super(p);
    }
  }
  At.DiffError = c;
  let h = class {
    constructor(p) {
      this.model = p, this.builder = new i.PatchBuilder(p.clock.clone());
    }
    diffStr(p, b) {
      const k = p.view();
      if (k === b)
        return;
      const m = this.builder;
      s.apply(s.diff(k, b), k.length, (_, f) => m.insStr(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => m.del(p.id, p.findInterval(_, f)));
    }
    diffBin(p, b) {
      const k = p.view();
      if ((0, t.cmpUint8Array)(k, b))
        return;
      const m = this.builder;
      o.apply(o.diff(k, b), k.length, (_, f) => m.insBin(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => m.del(p.id, p.findInterval(_, f)));
    }
    diffArr(p, b) {
      if (p.size() === 0) {
        const x = b.length;
        if (x === 0)
          return;
        let I = p.id;
        for (let C = 0; C < x; C++)
          I = this.builder.insArr(p.id, I, [this.buildView(b[C])]);
        return;
      } else if (b.length === 0) {
        const x = [];
        for (const I of p.chunks()) {
          if (I.del)
            continue;
          const C = I.id;
          x.push((0, i.tss)(C.sid, C.time, I.span));
        }
        x.length && this.builder.del(p.id, x);
        return;
      }
      const k = [];
      p.children((x) => k.push((0, u.structHashCrdt)(x)));
      const m = [], _ = b.length;
      for (let x = 0; x < _; x++)
        m.push((0, l.structHashSchema)(b[x]));
      const f = a.diff(k, m);
      if (!f.length)
        return;
      const d = [], y = [];
      a.apply(f, (x) => {
        const I = p.findInterval(x, 1);
        if (!I || !I.length)
          throw new c();
        y.push(...I);
      }, (x, I) => {
        const C = b[I], E = x >= 0 ? p.find(x) : p.id;
        if (!E)
          throw new c();
        d.push([E, [C]]);
      }, (x, I) => {
        const C = b[I];
        try {
          this.diffAny(p.getNode(x), C);
        } catch (E) {
          if (E instanceof c) {
            const O = p.findInterval(x, 1);
            y.push(...O);
            const T = x ? p.find(x - 1) : p.id;
            if (!T)
              throw new c();
            d.push([T, [C]]);
          } else
            throw E;
        }
      });
      const v = this.builder, w = d.length;
      for (let x = 0; x < w; x++) {
        const [I, C] = d[x];
        v.insArr(p.id, I, C.map((E) => this.buildView(E)));
      }
      y.length && v.del(p.id, y);
    }
    diffObj(p, b) {
      const k = this.builder, m = [], _ = /* @__PURE__ */ new Set();
      p.forEach((y) => {
        _.add(y), b[y] === void 0 && m.push([y, k.con(void 0)]);
      });
      const f = Object.keys(b), d = f.length;
      for (let y = 0; y < d; y++) {
        const v = f[y], w = b[v];
        if (_.has(v)) {
          const x = p.get(v);
          if (x)
            try {
              this.diffAny(x, w);
              continue;
            } catch (I) {
              if (!(I instanceof c))
                throw I;
            }
        }
        m.push([v, this.buildConView(w)]);
      }
      m.length && k.insObj(p.id, m);
    }
    diffVec(p, b) {
      const k = this.builder, m = [], _ = p.elements, f = _.length, d = b.length, y = p.doc.index, v = Math.min(f, d);
      for (let w = d; w < f; w++) {
        const x = _[w];
        if (x) {
          const I = y.get(x);
          if (!I || I instanceof n.ConNode && I.val === void 0)
            continue;
          m.push([w, k.con(void 0)]);
        }
      }
      e: for (let w = 0; w < v; w++) {
        const x = b[w], I = p.get(w);
        if (I) {
          try {
            this.diffAny(I, x);
            continue;
          } catch (C) {
            if (!(C instanceof c))
              throw C;
          }
          if (I instanceof n.ConNode && typeof x != "object") {
            const C = k.con(x);
            m.push([w, C]);
            continue e;
          }
        }
        m.push([w, this.buildConView(x)]);
      }
      for (let w = f; w < d; w++)
        m.push([w, this.buildConView(b[w])]);
      m.length && k.insVec(p.id, m);
    }
    diffVal(p, b) {
      try {
        this.diffAny(p.node(), b);
      } catch (k) {
        if (k instanceof c)
          this.builder.setVal(p.id, this.buildConView(b));
        else
          throw k;
      }
    }
    diffAny(p, b) {
      if (p instanceof n.ConNode) {
        b instanceof i.nodes.con && (b = b.raw);
        const k = p.val;
        if (k !== b && (k instanceof i.Timestamp && !(b instanceof i.Timestamp) || !(k instanceof i.Timestamp) && b instanceof i.Timestamp || !(0, e.deepEqual)(p.val, b)))
          throw new c();
      } else if (p instanceof n.StrNode) {
        if (b instanceof i.nodes.str && (b = b.raw), typeof b != "string")
          throw new c();
        this.diffStr(p, b);
      } else if (p instanceof n.ObjNode) {
        if (b instanceof i.nodes.obj && (b = b.opt ? { ...b.obj, ...b.opt } : b.obj), b instanceof i.NodeBuilder)
          throw new c();
        if (b instanceof Uint8Array)
          throw new c();
        if (!b || typeof b != "object" || Array.isArray(b))
          throw new c();
        this.diffObj(p, b);
      } else if (p instanceof n.ValNode)
        b instanceof i.nodes.val && (b = b.value), this.diffVal(p, b);
      else if (p instanceof n.ArrNode) {
        if (b instanceof i.nodes.arr && (b = b.arr), !Array.isArray(b))
          throw new c();
        this.diffArr(p, b);
      } else if (p instanceof n.VecNode) {
        if (b instanceof i.nodes.vec && (b = b.value), !Array.isArray(b))
          throw new c();
        this.diffVec(p, b);
      } else if (p instanceof n.BinNode) {
        if (b instanceof i.nodes.bin && (b = b.raw), !(b instanceof Uint8Array))
          throw new c();
        this.diffBin(p, b);
      } else
        throw new c();
    }
    diff(p, b) {
      return this.diffAny(p, b), this.builder.flush();
    }
    /** Diffs only keys present in the destination object. */
    diffDstKeys(p, b) {
      const k = this.builder, m = [], _ = Object.keys(b), f = _.length;
      for (let d = 0; d < f; d++) {
        const y = _[d], v = p.get(y), w = b[y];
        if (!v) {
          m.push([y, this.buildConView(w)]);
          continue;
        }
        try {
          this.diffAny(v, w);
        } catch (x) {
          if (x instanceof c)
            m.push([y, this.buildConView(w)]);
          else
            throw x;
        }
      }
      return m.length && k.insObj(p.id, m), this.builder.flush();
    }
    buildView(p) {
      const b = this.builder;
      return p instanceof i.Timestamp ? b.con(p) : p instanceof i.nodes.con ? b.con(p.raw) : b.json(p);
    }
    buildConView(p) {
      const b = this.builder;
      return p instanceof i.Timestamp ? b.con(p) : p instanceof i.nodes.con ? b.con(p.raw) : b.constOrJson(p);
    }
  };
  return At.JsonCrdtDiff = h, At;
}
var us = {}, lc;
function ef() {
  return lc || (lc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.merge = r.diff = void 0;
    const e = ll(), t = (n, s) => {
      const a = new e.JsonCrdtDiff(n.api.model).diff(n.node, s);
      return a.ops.length ? a : void 0;
    };
    r.diff = t;
    const i = (n, s) => {
      const o = (0, r.diff)(n, s);
      return o && n.api.model.applyLocalPatch(o), o;
    };
    r.merge = i;
  })(us)), us;
}
var vr = {}, hc;
function tf() {
  if (hc) return vr;
  hc = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.ChangeEvent = void 0;
  const r = xt(), e = (i) => i instanceof r.InsValOp || i instanceof r.InsObjOp || i instanceof r.InsVecOp || i instanceof r.InsStrOp || i instanceof r.InsBinOp || i instanceof r.InsArrOp || i instanceof r.UpdArrOp || i instanceof r.DelOp;
  class t {
    constructor(n, s) {
      this.raw = n, this.api = s, this._direct = null, this._parents = null;
    }
    origin() {
      var o;
      const { raw: n, api: s } = this;
      return n instanceof Set ? 2 : typeof n == "number" ? 0 : n instanceof r.Patch ? ((o = n.getId()) == null ? void 0 : o.sid) === s.model.clock.sid ? 0 : 1 : 0;
    }
    isLocal() {
      return this.origin() === 0;
    }
    isReset() {
      return this.raw instanceof Set;
    }
    /**
     * JSON CRDT nodes directly affected by this change event, i.e. nodes
     * which are direct targets of operations in the change.
     */
    direct() {
      let n = this._direct;
      e: if (!n) {
        const s = this.raw;
        if (s instanceof Set) {
          this._direct = n = s;
          break e;
        }
        this._direct = n = /* @__PURE__ */ new Set();
        const o = this.api.model.index;
        if (typeof s == "number") {
          const a = s, l = this.api.builder.patch.ops;
          for (let c = a; c < l.length; c++) {
            const h = l[c];
            if (e(h)) {
              const g = o.get(h.obj);
              g && n.add(g);
            }
          }
        } else if (s instanceof r.Patch) {
          const a = s.ops, u = a.length;
          for (let l = 0; l < u; l++) {
            const c = a[l];
            if (e(c)) {
              const h = o.get(c.obj);
              h && n.add(h);
            }
          }
        }
      }
      return n;
    }
    /**
     * JSON CRDT nodes which are parents of directly affected nodes in this
     * change event.
     */
    parents() {
      let n = this._parents;
      if (!n) {
        this._parents = n = /* @__PURE__ */ new Set();
        const s = this.direct();
        for (const o of s) {
          let a = o.parent;
          for (; a && !n.has(a); )
            n.add(a), a = a.parent;
        }
      }
      return n;
    }
  }
  return vr.ChangeEvent = t, vr;
}
var ls = {}, dc;
function nf() {
  return dc || (dc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.proxy$ = r.proxy = void 0;
    const e = (i, n = []) => new Proxy(() => {
    }, {
      get: (s, o, a) => (n.push(String(o)), (0, r.proxy)(i, n)),
      apply: (s, o, a) => i(n, ...a)
    });
    r.proxy = e;
    const t = (i, n, s = []) => new Proxy({}, { get: (o, a, u) => a === n ? i(s) : (s.push(String(a)), (0, r.proxy$)(i, n, s)) });
    r.proxy$ = t;
  })(ls)), ls;
}
var fc;
function rf() {
  if (fc) return ye;
  fc = 1, Object.defineProperty(ye, "__esModule", { value: !0 }), ye.ModelApi = ye.ArrApi = ye.BinApi = ye.StrApi = ye.ObjApi = ye.VecApi = ye.ValApi = ye.ConApi = ye.NodeApi = void 0;
  const r = re, e = Ee(), t = ol(), i = lo(), n = zd(), s = Ot(), o = Zd(), a = al(), u = co(), l = cl(), c = Kd(), h = ll(), g = r.__importStar(ef()), p = tf(), b = de(), k = nf(), m = (E) => {
    if (!E)
      return [void 0, ""];
    if (typeof E == "number")
      return [void 0, E];
    switch (typeof E == "string" && (E = (0, i.toPath)(E)), E.length) {
      case 0:
        return [void 0, ""];
      case 1:
        return [void 0, E[0]];
      default: {
        const O = E[E.length - 1];
        return [E.slice(0, -1), O];
      }
    }
  };
  class _ {
    constructor(O, T) {
      this.node = O, this.api = T, this.ev = void 0;
    }
    /**
     * Find a child node at the given path starting from this node.
     *
     * @param path Path to the child node to find.
     * @returns JSON CRDT node at the given path.
     */
    find(O) {
      let T = this.node;
      if (O === void 0) {
        if (typeof T.child == "function") {
          const j = T.child();
          if (!j) {
            if (T instanceof s.RootNode)
              return T;
            throw new Error("NO_CHILD");
          }
          return j;
        }
        throw new Error("CANNOT_IN");
      }
      for (typeof O == "string" && O && O[0] !== "/" && (O = "/" + O), typeof O == "number" && (O = [O]); T instanceof s.ValNode; )
        T = T.child();
      return (0, n.find)(T, O);
    }
    /**
     * Find a child node at the given path starting from this node and wrap it in
     * a local changes API.
     *
     * @param path Path to the child node to find.
     * @returns Local changes API for the child node at the given path.
     */
    in(O) {
      const T = this.find(O);
      return this.api.wrap(T);
    }
    asVal() {
      if (this.node instanceof s.ValNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_VAL");
    }
    asStr() {
      if (this.node instanceof s.StrNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_STR");
    }
    asBin() {
      if (this.node instanceof s.BinNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_BIN");
    }
    asArr() {
      if (this.node instanceof s.ArrNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_ARR");
    }
    asVec() {
      if (this.node instanceof s.VecNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_VEC");
    }
    asObj() {
      if (this.node instanceof s.ObjNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_OBJ");
    }
    asCon() {
      if (this.node instanceof s.ConNode)
        return this.api.wrap(this.node);
      throw new Error("NOT_CON");
    }
    asExt(O) {
      let T;
      const j = this.node;
      if (j instanceof c.ExtNode && (T = j), j instanceof s.VecNode && (T = j.ext()), !T)
        throw new Error("NOT_EXT");
      const P = this.api.wrap(T);
      if (!O || P instanceof O.Api)
        return P;
      throw new Error("NOT_EXT");
    }
    val(O) {
      return this.in(O).asVal();
    }
    str(O) {
      return this.in(O).asStr();
    }
    bin(O) {
      return this.in(O).asBin();
    }
    arr(O) {
      return this.in(O).asArr();
    }
    vec(O) {
      return this.in(O).asVec();
    }
    obj(O) {
      return this.in(O).asObj();
    }
    con(O) {
      return this.in(O).asCon();
    }
    view() {
      return this.node.view();
    }
    select(O, T) {
      try {
        let j = O !== void 0 ? this.find(O) : this.node;
        if (T)
          for (; j instanceof s.ValNode; )
            j = j.child();
        return this.api.wrap(j);
      } catch {
        return;
      }
    }
    read(O) {
      const T = this.view();
      if (Array.isArray(O))
        return (0, t.get)(T, O);
      if (!O)
        return T;
      let j = O + "";
      return O && j[0] !== "/" && (j = "/" + j), (0, t.get)(T, (0, i.toPath)(j));
    }
    add(O, T) {
      const [j, P] = m(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v)
          R.set({ [P]: T });
        else if (R instanceof I || R instanceof w || R instanceof x) {
          const M = R.length();
          let V = 0;
          if (typeof P == "number")
            V = P;
          else if (P === "-")
            V = M;
          else if (V = ~~P, V + "" !== P)
            break e;
          if (V !== V)
            break e;
          if (V < 0 && (V = 0), V > M && (V = M), R instanceof I)
            R.ins(V, Array.isArray(T) ? T : [T]);
          else if (R instanceof w)
            R.ins(V, T + "");
          else if (R instanceof x) {
            if (!(T instanceof Uint8Array))
              break e;
            R.ins(V, T);
          }
        } else if (R instanceof y)
          R.set([[~~P, T]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    replace(O, T) {
      const [j, P] = m(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v) {
          const M = P + "";
          if (!R.has(M))
            break e;
          R.set({ [P]: T });
        } else if (R instanceof I) {
          const M = R.length();
          let V = 0;
          if (typeof P == "number")
            V = P;
          else if (V = ~~P, V + "" !== P)
            break e;
          if (V !== V || V < 0 || V > M)
            break e;
          V === M ? R.ins(V, [T]) : R.upd(V, T);
        } else if (R instanceof y)
          R.set([[~~P, T]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    remove(O, T = 1) {
      const [j, P] = m(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v) {
          const M = P + "";
          if (!R.has(M))
            break e;
          R.del([M]);
        } else if (R instanceof I || R instanceof w || R instanceof x) {
          const M = R.length();
          let V = 0;
          if (typeof P == "number")
            V = P;
          else if (P === "-")
            V = T;
          else if (V = ~~P, V + "" !== P)
            break e;
          if (V !== V || V < 0 || V > M)
            break e;
          R.del(V, Math.min(T, M - V));
        } else if (R instanceof y)
          R.set([[~~P, void 0]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    diff(O) {
      return g.diff(this, O);
    }
    merge(O) {
      return g.merge(this, O);
    }
    op(O) {
      var R;
      if (!Array.isArray(O))
        return !1;
      const [T, j, P] = O;
      switch (T) {
        case "add":
          return this.add(j, P);
        case "replace":
          return this.replace(j, P);
        case "merge":
          return !!((R = this.select(j)) != null && R.merge(P));
        case "remove":
          return this.remove(j, P);
      }
    }
    get s() {
      return { $: this };
    }
    get $() {
      return (0, k.proxy$)((O) => {
        try {
          return this.api.wrap(this.find(O));
        } catch {
          return;
        }
      }, "$");
    }
    /**
     * Event target for listening to node changes. You can subscribe to `"view"`
     * events, which are triggered every time the node's view changes.
     *
     * ```ts
     * node.events.on('view', () => {
     *   // do something...
     * });
     * ```
     *
     * @ignore
     * @deprecated Use `onNodeChange()` and other `on*()` methods.
     */
    get events() {
      return this.ev || (this.ev = new o.NodeEvents(this));
    }
    /**
     * Attaches a listener which executes on every change that is executed
     * directly on this node. For example, if this is a "str" string node and
     * you insert or delete text, the listener will be executed. Or if
     * this is an "obj" object node and keys of this object are changed, this
     * listener will be executed.
     *
     * It does not trigger when child nodes are edit, to include those changes,
     * use `onSubtreeChange()` or `onChildChange()` methods.
     *
     * @see onChildChange()
     * @see onSubtreeChange()
     *
     * @param listener Callback called on every change that is executed directly
     *     on this node.
     * @param onReset Optional parameter, if set to `true`, the listener will also
     *     be called when the model is reset using the `.reset()` method.
     * @returns Returns an unsubscribe function to stop listening to the events.
     */
    onSelfChange(O, T) {
      return this.api.onChange.listen((j) => {
        (j.direct().has(this.node) || T && j.isReset()) && O(j);
      });
    }
    /**
     * Attaches a listener which executes on every change that is applied to this
     * node's children. Hence, this listener will trigger only for *container*
     * nodes - nodes that can have child nodes, such as "obj", "arr", "vec", and
     * "val" nodes. It will not execute on changes made directly to this node.
     *
     * If you want to listen to changes on this node as well as its children, use
     * `onSubtreeChange()` method. If you want to listen to changes on this node
     * only, use `onSelfChange()` method.
     *
     * @see onSelfChange()
     * @see onSubtreeChange()
     *
     * @param listener Callback called on every change that is applied to
     *     children of this node.
     * @param onReset Optional parameter, if set to `true`, the listener will also
     *     be called when the model is reset using the `.reset()` method.
     * @return Returns an unsubscribe function to stop listening to the events.
     */
    onChildChange(O, T) {
      return this.api.onChange.listen((j) => {
        (j.parents().has(this.node) || T && j.isReset()) && O(j);
      });
    }
    /**
     * Attaches a listener which executes on every change that is applied to this
     * node or any of its child nodes (recursively). This is equivalent to
     * combining both `onSelfChange()` and `onChildChange()` methods.
     *
     * @see onSelfChange()
     * @see onChildChange()
     *
     * @param listener Callback called on every change that is applied to this
     *     node or any of its child nodes.
     * @param onReset Optional parameter, if set to `true`, the listener will also
     *     be called when the model is reset using the `.reset()` method.
     * @return Returns an unsubscribe function to stop listening to the events.
     */
    onSubtreeChange(O, T) {
      return this.api.onChange.listen((j) => {
        const P = this.node;
        (j.direct().has(P) || j.parents().has(P) || T && j.isReset()) && O(j);
      });
    }
    // -------------------------------------------------------------------- Debug
    toString(O = "") {
      return "api(" + (this.constructor === _ ? "*" : this.node.name()) + ")" + (0, e.printTree)(O, [(j) => this.node.toString(j)]);
    }
  }
  ye.NodeApi = _;
  class f extends _ {
    /**
     * Returns a proxy object for this node.
     */
    get s() {
      return { $: this };
    }
  }
  ye.ConApi = f;
  class d extends _ {
    /**
     * Get API instance of the inner node.
     * @returns Inner node API.
     */
    get() {
      return this.in();
    }
    /**
     * Sets the value of the node.
     *
     * @param json JSON/CBOR value or ID (logical timestamp) of the value to set.
     * @returns Reference to itself.
     */
    set(O) {
      const { api: T, node: j } = this, R = T.builder.constOrJson(O);
      T.builder.setVal(j.id, R), T.apply();
    }
    /**
     * Returns a proxy object for this node. Allows to access the value of the
     * node by accessing the `.val` property.
     */
    get s() {
      const O = this;
      return {
        $: this,
        get _() {
          const j = O.node.node();
          return O.api.wrap(j).s;
        }
      };
    }
  }
  ye.ValApi = d;
  class y extends _ {
    /**
     * Get API instance of a child node.
     *
     * @param key Object key to get.
     * @returns A specified child node API.
     */
    get(O) {
      return this.in(O);
    }
    /**
     * Sets a list of elements to the given values.
     *
     * @param entries List of index-value pairs to set.
     * @returns Reference to itself.
     */
    set(O) {
      const { api: T, node: j } = this, { builder: P } = T;
      P.insVec(j.id, O.map(([R, M]) => [R, P.constOrJson(M)])), T.apply();
    }
    push(...O) {
      const T = this.length();
      this.set(O.map((j, P) => [T + P, j]));
    }
    /**
     * Get the length of the vector without materializing it to a view.
     *
     * @returns Length of the vector.
     */
    length() {
      return this.node.elements.length;
    }
    /**
     * Returns a proxy object for this node. Allows to access vector elements by
     * index.
     */
    get s() {
      return new Proxy({}, {
        get: (T, j, P) => {
          if (j === "$")
            return this;
          if (j === "toExt")
            return () => this.asExt();
          const R = Number(j);
          if (Number.isNaN(R))
            throw new Error("INVALID_INDEX");
          const M = this.node.get(R);
          if (!M)
            throw new Error("OUT_OF_BOUNDS");
          return this.api.wrap(M).s;
        }
      });
    }
  }
  ye.VecApi = y;
  class v extends _ {
    /**
     * Get API instance of a child node.
     *
     * @param key Object key to get.
     * @returns A specified child node API.
     */
    get(O) {
      return this.in(O);
    }
    /**
     * Sets a list of keys to the given values.
     *
     * @param entries List of key-value pairs to set.
     * @returns Reference to itself.
     */
    set(O) {
      const { api: T, node: j } = this, { builder: P } = T;
      P.insObj(j.id, Object.entries(O).map(([R, M]) => [R, P.constOrJson(M)])), T.apply();
    }
    /**
     * Deletes a list of keys from the object.
     *
     * @param keys List of keys to delete.
     * @returns Reference to itself.
     */
    del(O) {
      const { api: T, node: j } = this, { builder: P } = T;
      T.builder.insObj(j.id, O.map((R) => [R, P.con(void 0)])), T.apply();
    }
    /**
     * Checks if a key exists in the object.
     *
     * @param key Key to check.
     * @returns True if the key exists, false otherwise.
     */
    has(O) {
      return this.node.keys.has(O);
    }
    /** Diffs only keys present in `dst` object. */
    diffKeys(O) {
      const j = new h.JsonCrdtDiff(this.api.model).diffDstKeys(this.node, O);
      return j.ops.length ? j : void 0;
    }
    /** Merges only keys present in `dst` object. */
    mergeKeys(O) {
      const T = this.diffKeys(O);
      return T && this.api.model.applyLocalPatch(T), T;
    }
    /**
     * Returns a proxy object for this node. Allows to access object properties
     * by key.
     */
    get s() {
      return new Proxy({}, {
        get: (T, j, P) => {
          if (j === "$")
            return this;
          const R = String(j), M = this.node.get(R);
          if (!M)
            throw new Error("NO_SUCH_KEY");
          return this.api.wrap(M).s;
        }
      });
    }
  }
  ye.ObjApi = v;
  class w extends _ {
    /**
     * Inserts text at a given position.
     *
     * @param index Position at which to insert text.
     * @param text Text to insert.
     * @returns Reference to itself.
     */
    ins(O, T) {
      const { api: j, node: P } = this;
      j.onBeforeLocalChange.emit(j.next);
      const R = j.builder;
      R.pad();
      const M = j.builder.nextTime(), V = new b.Timestamp(R.clock.sid, M), z = P.insAt(O, V, T);
      if (!z)
        throw new Error("OUT_OF_BOUNDS");
      R.insStr(P.id, z, T), j.advance();
    }
    /**
     * Deletes a range of text at a given position.
     *
     * @param index Position at which to delete text.
     * @param length Number of UTF-16 code units to delete.
     * @returns Reference to itself.
     */
    del(O, T) {
      const { api: j, node: P } = this;
      j.onBeforeLocalChange.emit(j.next);
      const R = j.builder;
      R.pad();
      const M = P.findInterval(O, T);
      if (!M)
        throw new Error("OUT_OF_BOUNDS");
      P.delete(M), R.del(P.id, M), j.advance();
    }
    /**
     * Given a character index in local coordinates, find the ID of the character
     * in the global coordinates.
     *
     * @param index Index of the character or `-1` for before the first character.
     * @returns ID of the character after which the given position is located.
     */
    findId(O) {
      const T = this.node, P = T.length() - 1;
      return O > P && (O = P), O < 0 ? T.id : T.find(O) || T.id;
    }
    /**
     * Given a position in global coordinates, find the position in local
     * coordinates.
     *
     * @param id ID of the character.
     * @returns Index of the character in local coordinates. Returns -1 if the
     *          the position refers to the beginning of the string.
     */
    findPos(O) {
      const T = this.node, j = T.id;
      if (j.sid === O.sid && j.time === O.time)
        return -1;
      const P = T.findById(O);
      return P ? T.pos(P) + (P.del ? 0 : O.time - P.id.time) : -1;
    }
    /**
     * Get the length of the string without materializing it to a view.
     *
     * @returns Length of the string.
     */
    length() {
      return this.node.length();
    }
    /**
     * Returns a proxy object for this node.
     */
    get s() {
      return { $: this };
    }
  }
  ye.StrApi = w;
  class x extends _ {
    /**
     * Inserts octets at a given position.
     *
     * @param index Position at which to insert octets.
     * @param data Octets to insert.
     * @returns Reference to itself.
     */
    ins(O, T) {
      const { api: j, node: P } = this, R = O ? P.find(O - 1) : P.id;
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      j.builder.insBin(P.id, R, T), j.apply();
    }
    /**
     * Deletes a range of octets at a given position.
     *
     * @param index Position at which to delete octets.
     * @param length Number of octets to delete.
     * @returns Reference to itself.
     */
    del(O, T) {
      const { api: j, node: P } = this, R = P.findInterval(O, T);
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      j.builder.del(P.id, R), j.apply();
    }
    /**
     * Get the length of the binary blob without materializing it to a view.
     *
     * @returns Length of the binary blob.
     */
    length() {
      return this.node.length();
    }
    /**
     * Returns a proxy object for this node.
     */
    get s() {
      return { $: this };
    }
  }
  ye.BinApi = x;
  class I extends _ {
    /**
     * Get API instance of a child node.
     *
     * @param index Index of the element to get.
     * @returns Child node API for the element at the given index.
     */
    get(O) {
      return this.in(O);
    }
    /**
     * Inserts elements at a given position.
     *
     * @param index Position at which to insert elements.
     * @param values Values or schema of the elements to insert.
     */
    ins(O, T) {
      const { api: j, node: P } = this, { builder: R } = j, M = O ? P.find(O - 1) : P.id;
      if (!M)
        throw new Error("OUT_OF_BOUNDS");
      const V = [];
      for (let z = 0; z < T.length; z++)
        V.push(R.json(T[z]));
      R.insArr(P.id, M, V), j.apply();
    }
    /**
     * Inserts elements at the end of the array.
     *
     * @param values Values or schema of the elements to insert at the end of the array.
     */
    push(...O) {
      const T = this.length();
      this.ins(T, O);
    }
    /**
     * Updates (overwrites) an element at a given position.
     *
     * @param index Position at which to update the element.
     * @param value Value or schema of the element to replace with.
     */
    upd(O, T) {
      const { api: j, node: P } = this, R = P.getId(O);
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      const { builder: M } = j;
      M.updArr(P.id, R, M.constOrJson(T)), j.apply();
    }
    /**
     * Deletes a range of elements at a given position.
     *
     * @param index Position at which to delete elements.
     * @param length Number of elements to delete.
     * @returns Reference to itself.
     */
    del(O, T) {
      const { api: j, node: P } = this, R = P.findInterval(O, T);
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      j.builder.del(P.id, R), j.apply();
    }
    /**
     * Get the length of the array without materializing it to a view.
     *
     * @returns Length of the array.
     */
    length() {
      return this.node.length();
    }
    /**
     * Returns a proxy object that allows to access array elements by index.
     *
     * @returns Proxy object that allows to access array elements by index.
     */
    get s() {
      return new Proxy({}, {
        get: (T, j, P) => {
          if (j === "$")
            return this;
          const R = Number(j);
          if (Number.isNaN(R))
            throw new Error("INVALID_INDEX");
          const M = this.node.getNode(R);
          if (!M)
            throw new Error("OUT_OF_BOUNDS");
          return this.api.wrap(M).s;
        }
      });
    }
  }
  ye.ArrApi = I;
  class C extends d {
    /**
     * @param model Model instance on which the API operates.
     */
    constructor(O) {
      super(O.root, void 0), this.model = O, this.next = 0, this.onBeforeReset = new a.FanOut(), this.onReset = new a.FanOut(), this.onBeforePatch = new a.FanOut(), this.onPatch = new a.FanOut(), this.onBeforeLocalChange = new a.FanOut(), this.onLocalChange = new a.FanOut(), this.onLocalChanges = new l.MicrotaskBufferFanOut(this.onLocalChange), this.onBeforeTransaction = new a.FanOut(), this.onTransaction = new a.FanOut(), this.onChange = new l.MergeFanOut([this.onReset, this.onPatch, this.onLocalChange], (T) => new p.ChangeEvent(T, this)), this.onChanges = new l.MicrotaskBufferFanOut(this.onChange), this.onFlush = new a.FanOut(), this.inTx = !1, this.stopAutoFlush = void 0, this.subscribe = (T) => this.onChanges.listen(() => T()), this.getSnapshot = () => this.view(), this.api = this, this.builder = new u.PatchBuilder(O.clock), O.onbeforereset = () => this.onBeforeReset.emit(), O.onreset = (T) => this.onReset.emit(T), O.onbeforepatch = (T) => this.onBeforePatch.emit(T), O.onpatch = (T) => this.onPatch.emit(T);
    }
    wrap(O) {
      if (O instanceof s.ValNode)
        return O.api || (O.api = new d(O, this));
      if (O instanceof s.StrNode)
        return O.api || (O.api = new w(O, this));
      if (O instanceof s.BinNode)
        return O.api || (O.api = new x(O, this));
      if (O instanceof s.ArrNode)
        return O.api || (O.api = new I(O, this));
      if (O instanceof s.ObjNode)
        return O.api || (O.api = new v(O, this));
      if (O instanceof s.ConNode)
        return O.api || (O.api = new f(O, this));
      if (O instanceof s.VecNode)
        return O.api || (O.api = new y(O, this));
      if (O instanceof c.ExtNode) {
        if (O.api)
          return O.api;
        const T = this.model.ext.get(O.extId);
        return O.api = new T.Api(O, this);
      } else
        throw new Error("UNKNOWN_NODE");
    }
    /**
     * Given a JSON/CBOR value, constructs CRDT nodes recursively out of it and
     * sets the root node of the model to the constructed nodes.
     *
     * @param json JSON/CBOR value to set as the view of the model.
     * @returns Reference to itself.
     *
     * @deprecated Use `.set()` instead.
     */
    root(O) {
      return this.set(O);
    }
    set(O) {
      return super.set(O), this;
    }
    /**
     * Apply locally any operations from the `.builder`, which haven't been
     * applied yet.
     */
    apply() {
      const O = this.builder.patch.ops, T = O.length, j = this.model, P = this.next;
      this.onBeforeLocalChange.emit(P);
      for (let R = this.next; R < T; R++)
        j.applyOperation(O[R]);
      this.next = T, j.tick++, this.onLocalChange.emit(P);
    }
    /**
     * Advance patch pointer to the end without applying the operations. With the
     * idea that they have already been applied locally.
     *
     * You need to manually call `this.onBeforeLocalChange.emit(this.next)` before
     * calling this method.
     *
     * @ignore
     */
    advance() {
      const O = this.next;
      this.next = this.builder.patch.ops.length, this.model.tick++, this.onLocalChange.emit(O);
    }
    transaction(O) {
      if (this.inTx)
        O();
      else {
        this.inTx = !0;
        try {
          this.onBeforeTransaction.emit(), O(), this.onTransaction.emit();
        } finally {
          this.inTx = !1;
        }
      }
    }
    /**
     * Flushes the builder and returns a patch.
     *
     * @returns A JSON CRDT patch.
     * @todo Make this return undefined if there are no operations in the builder.
     */
    flush() {
      const O = this.builder.flush();
      return this.next = 0, O.ops.length && this.onFlush.emit(O), O;
    }
    /**
     * Begins to automatically flush buffered operations into patches, grouping
     * operations by microtasks or by transactions. To capture the patch, listen
     * to the `.onFlush` event.
     *
     * @returns Callback to stop auto flushing.
     */
    autoFlush(O = !1) {
      const T = () => this.builder.patch.ops.length && this.flush(), j = this.onLocalChanges.listen(T), P = this.onBeforeTransaction.listen(T), R = this.onTransaction.listen(T);
      return O && T(), this.stopAutoFlush = () => {
        this.stopAutoFlush = void 0, j(), P(), R();
      };
    }
  }
  return ye.ModelApi = C, ye;
}
var pc;
function hl() {
  return pc || (pc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), re.__exportStar(rf(), r);
  })(Wi)), Wi;
}
var mr = {}, yc;
function sf() {
  if (yc) return mr;
  yc = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.randomSessionId = void 0;
  const r = 65535, e = 9007199254740991 - r, t = () => Math.floor(e * Math.random() + r);
  return mr.randomSessionId = t, mr;
}
var br = {}, gc;
function of() {
  if (gc) return br;
  gc = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.Extensions = void 0;
  const r = Ee();
  let e = class dl {
    constructor() {
      this.ext = {};
    }
    register(i) {
      this.ext[i.id] = i;
    }
    get(i) {
      return this.ext[i];
    }
    size() {
      return Object.keys(this.ext).length;
    }
    clone() {
      const i = new dl();
      for (const n of Object.values(this.ext))
        i.register(n);
      return i;
    }
    toString(i = "") {
      const n = Object.keys(this.ext).map((s) => +s).sort();
      return "extensions" + (0, r.printTree)(i, n.map((s) => (o) => `${s}: ${this.ext[s].name}`));
    }
  };
  return br.Extensions = e, br;
}
var jt = {}, hs = {}, ds = {}, vc;
function af() {
  return vc || (vc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), re.__exportStar(_i(), r);
  })(ds)), ds;
}
var mc;
function cf() {
  return mc || (mc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.print = r.remove = r.insert = r.insertLeft = r.insertRight = void 0;
    const e = af(), t = JSON.stringify, i = (k, m, _) => {
      const f = m.p;
      if (!f)
        return k;
      const d = m === f.l;
      let y = f.bf | 0;
      switch (d ? f.bf = ++y : f.bf = --y, y) {
        case 0:
          return k;
        case 1:
        case -1:
          return i(k, f, m);
        default: {
          const v = _ === m.l;
          return d ? v ? (n(f, m), m.p ? k : m) : (o(f, m, _), _.p ? k : _) : v ? (a(f, m, _), _.p ? k : _) : (s(f, m), m.p ? k : m);
        }
      }
    }, n = (k, m) => {
      const _ = k.p, f = m.r;
      m.p = _, m.r = k, k.p = m, k.l = f, f && (f.p = k), _ && (_.l === k ? _.l = m : _.r = m);
      let d = k.bf, y = m.bf;
      d += -1 - (y > 0 ? y : 0), y += -1 + (d < 0 ? d : 0), k.bf = d, m.bf = y;
    }, s = (k, m) => {
      const _ = k.p, f = m.l;
      m.p = _, m.l = k, k.p = m, k.r = f, f && (f.p = k), _ && (_.l === k ? _.l = m : _.r = m);
      let d = k.bf, y = m.bf;
      d += 1 - (y < 0 ? y : 0), y += 1 + (d > 0 ? d : 0), k.bf = d, m.bf = y;
    }, o = (k, m, _) => {
      s(m, _), n(k, _);
    }, a = (k, m, _) => {
      n(m, _), s(k, _);
    }, u = (k, m, _) => (_.r = m, m.p = _, _.bf--, _.l ? k : i(k, _, m));
    r.insertRight = u;
    const l = (k, m, _) => (_.l = m, m.p = _, _.bf++, _.r ? k : i(k, _, m));
    r.insertLeft = l;
    const c = (k, m, _) => {
      if (!k)
        return m;
      const f = m.k;
      let d = k, y, v = 0;
      for (; y = (v = _(f, d.k)) < 0 ? d.l : d.r; )
        d = y;
      return v < 0 ? (0, r.insertLeft)(k, m, d) : (0, r.insertRight)(k, m, d);
    };
    r.insert = c;
    const h = (k, m) => {
      if (!k)
        return m;
      const _ = m.p, f = m.l, d = m.r;
      if (m.p = m.l = m.r = void 0, f && d)
        if (f.r) {
          let w = f, x = w;
          for (; x = w.r; )
            w = x;
          const I = w.l, C = w.p, E = I;
          return _ && (_.l === m ? _.l = w : _.r = w), w.p = _, w.r = d, w.bf = m.bf, f !== w && (w.l = f, f.p = w), d.p = w, C && (C.l === w ? C.l = E : C.r = E), E && (E.p = C), p(_ ? k : w, C, 1);
        } else {
          _ && (_.l === m ? _.l = f : _.r = f), f.p = _, f.r = d, d.p = f;
          const w = m.bf;
          if (_)
            return f.bf = w, g(k, f, 1);
          const x = w - 1;
          if (f.bf = x, x >= -1)
            return f;
          const I = d.l;
          return d.bf > 0 ? (a(f, d, I), I) : (s(f, d), d);
        }
      const y = f || d;
      return y && (y.p = _), _ ? _.l === m ? (_.l = y, g(k, _, 1)) : (_.r = y, p(k, _, 1)) : y;
    };
    r.remove = h;
    const g = (k, m, _) => {
      let f = m.bf | 0;
      f -= _, m.bf = f;
      let d = _;
      if (f === -1)
        return k;
      if (f < -1) {
        const v = m.r;
        if (v.bf <= 0)
          v.l && v.bf === 0 && (d = 0), s(m, v), m = v;
        else {
          const w = v.l;
          a(m, v, w), m = w;
        }
      }
      const y = m.p;
      return y ? y.l === m ? g(k, y, d) : p(k, y, d) : m;
    }, p = (k, m, _) => {
      let f = m.bf | 0;
      f += _, m.bf = f;
      let d = _;
      if (f === 1)
        return k;
      if (f > 1) {
        const v = m.l;
        if (v.bf >= 0)
          v.r && v.bf === 0 && (d = 0), n(m, v), m = v;
        else {
          const w = v.r;
          o(m, v, w), m = w;
        }
      }
      const y = m.p;
      return y ? y.l === m ? g(k, y, d) : p(k, y, d) : m;
    }, b = (k, m = "") => {
      if (!k)
        return "∅";
      const { bf: _, l: f, r: d, k: y, v } = k, w = v && typeof v == "object" && v.constructor === Object ? t(v) : v && typeof v == "object" ? v.toString(m) : t(v), x = y !== void 0 ? ` { ${t(y)} = ${w} }` : "", I = _ ? ` [${_}]` : "";
      return k.constructor.name + `${I}` + x + (0, e.printBinary)(m, [f ? (C) => (0, r.print)(f, C) : null, d ? (C) => (0, r.print)(d, C) : null]);
    };
    r.print = b;
  })(hs)), hs;
}
var wr = {}, fs = {}, _r = {}, bc;
function fl() {
  if (bc) return _r;
  bc = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.first = void 0;
  const r = (e) => {
    let t = e;
    for (; t; )
      if (t.l)
        t = t.l;
      else
        return t;
    return t;
  };
  return _r.first = r, _r;
}
var kr = {}, wc;
function uf() {
  if (wc) return kr;
  wc = 1, Object.defineProperty(kr, "__esModule", { value: !0 }), kr.next = void 0;
  const r = fl(), e = (t) => {
    const i = t.r;
    if (i)
      return (0, r.first)(i);
    let n = t.p;
    for (; n && n.r === t; )
      t = n, n = n.p;
    return n;
  };
  return kr.next = e, kr;
}
var _c;
function pl() {
  return _c || (_c = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.remove = r.insert = r.insertLeft = r.insertRight = r.findOrNextLower = r.find = r.size = r.prev = r.last = r.next = r.first = void 0;
    const e = fl();
    Object.defineProperty(r, "first", { enumerable: !0, get: function() {
      return e.first;
    } });
    const t = uf();
    Object.defineProperty(r, "next", { enumerable: !0, get: function() {
      return t.next;
    } });
    const i = (p) => {
      let b = p;
      for (; b; )
        if (b.r)
          b = b.r;
        else
          return b;
      return b;
    };
    r.last = i;
    const n = (p) => {
      if (p.l) {
        for (p = p.l; p.r; )
          p = p.r;
        return p;
      }
      let b = p.p;
      for (; b && b.l === p; )
        p = b, b = b.p;
      return b;
    };
    r.prev = n;
    const s = (p) => {
      const b = p.l, k = p.r;
      return 1 + (b ? s(b) : 0) + (k ? s(k) : 0);
    }, o = (p) => p ? s(p) : 0;
    r.size = o;
    const a = (p, b, k) => {
      let m = p;
      for (; m; ) {
        const _ = k(b, m.k);
        if (_ === 0)
          return m;
        m = _ < 0 ? m.l : m.r;
      }
      return m;
    };
    r.find = a;
    const u = (p, b, k) => {
      let m = p, _;
      for (; m; ) {
        const f = k(m.k, b);
        if (f === 0)
          return m;
        if (f > 0)
          m = m.l;
        else {
          const d = m.r;
          if (_ = m, !d)
            return _;
          m = d;
        }
      }
      return _;
    };
    r.findOrNextLower = u;
    const l = (p, b) => {
      const k = p.r = b.r;
      b.r = p, p.p = b, k && (k.p = p);
    };
    r.insertRight = l;
    const c = (p, b) => {
      const k = p.l = b.l;
      b.l = p, p.p = b, k && (k.p = p);
    };
    r.insertLeft = c;
    const h = (p, b, k) => {
      if (!p)
        return b;
      const m = b.k;
      let _ = p;
      for (; _; ) {
        const f = k(m, _.k), d = f < 0 ? _.l : _.r;
        if (d)
          _ = d;
        else {
          f < 0 ? (0, r.insertLeft)(b, _) : (0, r.insertRight)(b, _);
          break;
        }
      }
      return p;
    };
    r.insert = h;
    const g = (p, b) => {
      const k = b.p, m = b.l, _ = b.r;
      if (b.p = b.l = b.r = void 0, !m && !_) {
        if (k)
          k.l === b ? k.l = void 0 : k.r = void 0;
        else return;
        return p;
      } else if (m && _) {
        let d = m;
        for (; d.r; )
          d = d.r;
        return d.r = _, _.p = d, k ? (k.l === b ? k.l = m : k.r = m, m.p = k, p) : (m.p = void 0, m);
      }
      const f = m || _;
      if (f.p = k, k)
        k.l === b ? k.l = f : k.r = f;
      else return f;
      return p;
    };
    r.remove = g;
  })(fs)), fs;
}
var ps = {}, kc;
function lf() {
  return kc || (kc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), re.__exportStar(Ee(), r);
  })(ps)), ps;
}
var Sc;
function hf() {
  if (Sc) return wr;
  Sc = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.createMap = void 0;
  const r = pl(), e = lf(), t = (n, s) => n === s ? 0 : n < s ? -1 : 1, i = (n, s, o, a, u, l) => {
    class c {
      constructor(g) {
        this.min = void 0, this.root = void 0, this.max = void 0, this._size = 0, this.next = r.next, this.comparator = g || t;
      }
      set(g, p) {
        const b = this.root;
        if (b === void 0) {
          this._size = 1;
          const y = new n(g, p);
          return this.root = this.min = this.max = s(void 0, y, this.comparator);
        }
        const k = this.comparator;
        let m;
        const _ = this.max;
        if (m = k(g, _.k), m === 0)
          return _.v = p, _;
        if (m > 0) {
          const y = this.max = new n(g, p);
          return this.root = a(b, y, _), this._size++, y;
        }
        const f = this.min;
        if (m = k(g, f.k), m === 0)
          return f.v = p, f;
        if (m < 0) {
          const y = this.min = new n(g, p);
          return this.root = o(b, y, f), this._size++, y;
        }
        let d = b;
        do {
          if (m = k(g, d.k), m === 0)
            return d.v = p, d;
          if (m > 0) {
            const y = d.r;
            if (y === void 0) {
              const v = new n(g, p);
              return this.root = a(b, v, d), this._size++, v;
            }
            d = y;
          } else if (m < 0) {
            const y = d.l;
            if (y === void 0) {
              const v = new n(g, p);
              return this.root = o(b, v, d), this._size++, v;
            }
            d = y;
          }
        } while (!0);
      }
      find(g) {
        const p = this.comparator;
        let b = this.root;
        for (; b; ) {
          const k = +p(g, b.k);
          if (k === 0)
            return b;
          b = k < 0 ? b.l : b.r;
        }
      }
      get(g) {
        var p;
        return (p = this.find(g)) == null ? void 0 : p.v;
      }
      del(g) {
        const p = this.find(g);
        return p ? (p === this.max && (this.max = (0, r.prev)(p)), p === this.min && (this.min = (0, r.next)(p)), this.root = u(this.root, p), this._size--, !0) : !1;
      }
      clear() {
        this._size = 0, this.root = this.min = this.max = void 0;
      }
      has(g) {
        return !!this.find(g);
      }
      size() {
        return this._size;
      }
      isEmpty() {
        return !this.min;
      }
      getOrNextLower(g) {
        return (0, r.findOrNextLower)(this.root, g, this.comparator) || void 0;
      }
      forEach(g) {
        let p = this.first();
        if (p)
          do
            g(p);
          while (p = (0, r.next)(p));
      }
      first() {
        return this.min;
      }
      last() {
        return this.max;
      }
      iterator0() {
        let g = this.first();
        return () => {
          if (!g)
            return;
          const p = g;
          return g = (0, r.next)(g), p;
        };
      }
      iterator() {
        const g = this.iterator0();
        return {
          next: () => {
            const p = g();
            return { value: p, done: !p };
          }
        };
      }
      entries() {
        return { [Symbol.iterator]: () => this.iterator() };
      }
      toString(g) {
        return this.constructor.name + (0, e.printTree)(g, [(p) => l(this.root, p)]);
      }
    }
    return c;
  };
  return wr.createMap = i, wr;
}
var xc;
function df() {
  if (xc) return jt;
  xc = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt.AvlMap = jt.AvlNode = void 0;
  const r = cf(), e = hf();
  class t {
    constructor(n, s) {
      this.k = n, this.v = s, this.p = void 0, this.l = void 0, this.r = void 0, this.bf = 0;
    }
  }
  return jt.AvlNode = t, jt.AvlMap = (0, e.createMap)(t, r.insert, r.insertLeft, r.insertRight, r.remove, r.print), jt;
}
var Sr = {}, ke = {}, Oc;
function yl() {
  if (Oc) return ke;
  Oc = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.remove2 = ke.insert2 = ke.prev2 = ke.next2 = ke.last2 = ke.first2 = void 0;
  const r = (u) => {
    let l = u;
    for (; l; )
      if (l.l2)
        l = l.l2;
      else
        return l;
    return l;
  };
  ke.first2 = r;
  const e = (u) => {
    let l = u;
    for (; l; )
      if (l.r2)
        l = l.r2;
      else
        return l;
    return l;
  };
  ke.last2 = e;
  const t = (u) => {
    if (u.r2) {
      for (u = u.r2; u.l2; )
        u = u.l2;
      return u;
    }
    let l = u.p2;
    for (; l && l.r2 === u; )
      u = l, l = l.p2;
    return l;
  };
  ke.next2 = t;
  const i = (u) => {
    if (u.l2) {
      for (u = u.l2; u.r2; )
        u = u.r2;
      return u;
    }
    let l = u.p2;
    for (; l && l.l2 === u; )
      u = l, l = l.p2;
    return l;
  };
  ke.prev2 = i;
  const n = (u, l) => {
    const c = u.r2 = l.r2;
    l.r2 = u, u.p2 = l, c && (c.p2 = u);
  }, s = (u, l) => {
    const c = u.l2 = l.l2;
    l.l2 = u, u.p2 = l, c && (c.p2 = u);
  }, o = (u, l, c) => {
    if (!u)
      return l;
    let h = u;
    for (; h; ) {
      const g = c(l, h), p = g < 0 ? h.l2 : h.r2;
      if (p)
        h = p;
      else {
        g < 0 ? s(l, h) : n(l, h);
        break;
      }
    }
    return u;
  };
  ke.insert2 = o;
  const a = (u, l) => {
    const c = l.p2, h = l.l2, g = l.r2;
    if (l.p2 = l.l2 = l.r2 = void 0, !h && !g) {
      if (c)
        c.l2 === l ? c.l2 = void 0 : c.r2 = void 0;
      else return;
      return u;
    } else if (h && g) {
      let b = h;
      for (; b.r2; )
        b = b.r2;
      return b.r2 = g, g.p2 = b, c ? (c.l2 === l ? c.l2 = h : c.r2 = h, h.p2 = c, u) : (h.p2 = void 0, h);
    }
    const p = h || g;
    if (p.p2 = c, c)
      c.l2 === l ? c.l2 = p : c.r2 = p;
    else return p;
    return u;
  };
  return ke.remove2 = a, ke;
}
var Ic;
function ff() {
  if (Ic) return Sr;
  Ic = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.cmpNode = void 0;
  const r = Ot(), e = xt(), t = yl(), i = (s, o) => {
    const a = (0, t.last2)(s.ids), u = (0, t.last2)(o.ids);
    return a && u && !(0, e.equal)(a.id, u.id) ? !1 : s.length() === o.length() && s.size() === o.size();
  }, n = (s, o) => {
    if (s === o)
      return !0;
    if (s instanceof r.ConNode)
      return o instanceof r.ConNode && (0, e.equal)(s.id, o.id);
    if (s instanceof r.ValNode)
      return o instanceof r.ValNode && (0, e.equal)(s.id, o.id) && (0, e.equal)(s.val, o.val);
    if (s instanceof r.StrNode)
      return !(o instanceof r.StrNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
    if (s instanceof r.ObjNode) {
      if (!(o instanceof r.ObjNode) || !(0, e.equal)(s.id, o.id))
        return !1;
      const a = s.keys, u = o.keys, l = a.size, c = u.size;
      if (l !== c)
        return !1;
      for (const h of a.keys()) {
        const g = a.get(h), p = u.get(h);
        if (!g || !p || !(0, e.equal)(g, p))
          return !1;
      }
      return !0;
    } else {
      if (s instanceof r.ArrNode)
        return !(o instanceof r.ArrNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
      if (s instanceof r.VecNode) {
        if (!(o instanceof r.VecNode) || !(0, e.equal)(s.id, o.id))
          return !1;
        const a = s.elements, u = o.elements, l = a.length;
        if (l !== u.length)
          return !1;
        for (let c = 0; c < l; c++) {
          const h = a[c], g = u[c];
          if (h) {
            if (!g || !(0, e.equal)(h, g))
              return !1;
          } else if (g)
            return !1;
        }
        return !0;
      } else if (s instanceof r.BinNode)
        return !(o instanceof r.BinNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
    }
    return !1;
  };
  return Sr.cmpNode = n, Sr;
}
var Cc;
function po() {
  if (Cc) return Ct;
  Cc = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.Model = Ct.UNDEFINED = void 0;
  const r = re, e = r.__importStar(ei()), t = r.__importStar(de()), i = Ld(), n = hl(), s = wi(), o = sf(), a = Ot(), u = Si(), l = Ee(), c = of(), h = df(), g = xt(), p = ff();
  Ct.UNDEFINED = new u.ConNode(s.ORIGIN, void 0);
  let b = class Vs {
    /**
     * Use this method to generate a random session ID for an existing document.
     * It checks for the uniqueness of the session ID given the current peers in
     * the document. This reduces the chance of collision substantially.
     *
     * @returns A random session ID that is not used by any peer in the current
     *     document.
     */
    rndSid() {
      const m = this.clock, _ = m.sid, f = m.peers;
      for (; ; ) {
        const d = (0, o.randomSessionId)();
        if (_ !== d && !f.has(d))
          return d;
      }
    }
    /**
     * Instantiates a model from a collection of patches. The patches are applied
     * to the model in the order they are provided. The session ID of the model is
     * set to the session ID of the first patch.
     *
     * @param patches A collection of initial patches to apply to the model.
     * @returns A model with the patches applied.
     */
    static fromPatches(m) {
      if (!m.length)
        throw new Error("NO_PATCHES");
      const d = m[0].getId().sid;
      if (!d)
        throw new Error("NO_SID");
      const y = Vs.create(void 0, d);
      return y.applyBatch(m), y;
    }
    constructor(m) {
      this.root = new a.RootNode(this, s.ORIGIN), this.index = new h.AvlMap(t.compare), this.ext = new c.Extensions(), this.tick = 0, this.onbeforepatch = void 0, this.onpatch = void 0, this.onbeforereset = void 0, this.onreset = void 0, this.clock = m, m.time || (m.time = 1);
    }
    /**
     * API for applying local changes to the current document.
     */
    get api() {
      return this._api || (this._api = new n.ModelApi(this)), this._api;
    }
    /**
     * Experimental node retrieval API using proxy objects. Returns a strictly
     * typed proxy wrapper around the value of the root node.
     */
    get s() {
      return this.api.s._;
    }
    /**
     * Experimental strictly typed node retrieval API using proxy objects.
     * Automatically resolves nested "val" nodes.
     */
    get $() {
      return this.api.$;
    }
    /**
     * Applies a batch of patches to the document.
     *
     * @param patches A batch, i.e. an array of patches.
     */
    applyBatch(m) {
      const _ = m.length;
      for (let f = 0; f < _; f++)
        this.applyPatch(m[f]);
    }
    /**
     * Works like `applyPatch`, but is intended to be used by the local client
     * for locally generated patches. It checks if the model clock is ahead of
     * the patch clock and rebases the patch if necessary.
     *
     * @param patch A patch to apply to the document.
     */
    applyLocalPatch(m) {
      const _ = m.getId();
      if (_) {
        const f = this.clock;
        if (f.sid === _.sid) {
          const d = f.time;
          d > _.time && (m = m.rebase(d));
        }
      }
      this.applyPatch(m);
    }
    /**
     * Applies a single patch to the document. All mutations to the model must go
     * through this method. (With the only exception of local changes through API,
     * which have an alternative path.)
     *
     * @param patch A patch to apply to the document.
     */
    applyPatch(m) {
      var d, y;
      (d = this.onbeforepatch) == null || d.call(this, m);
      const _ = m.ops, { length: f } = _;
      for (let v = 0; v < f; v++)
        this.applyOperation(_[v]);
      this.tick++, (y = this.onpatch) == null || y.call(this, m);
    }
    /**
     * Applies a single operation to the model. All mutations to the model must go
     * through this method.
     *
     * For advanced use only, better use `applyPatch` instead. You MUST increment
     * the `tick` property and call the necessary event emitters manually.
     *
     * @param op Any JSON CRDT Patch operation
     * @ignore
     * @internal
     */
    applyOperation(m) {
      this.clock.observe(m.id, m.span());
      const _ = this.index;
      if (m instanceof e.InsStrOp) {
        const f = _.get(m.obj);
        f instanceof a.StrNode && f.ins(m.ref, m.id, m.data);
      } else if (m instanceof e.NewObjOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.ObjNode(this, f));
      } else if (m instanceof e.NewArrOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.ArrNode(this, f));
      } else if (m instanceof e.NewStrOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.StrNode(f));
      } else if (m instanceof e.NewValOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.ValNode(this, f, s.ORIGIN));
      } else if (m instanceof e.NewConOp) {
        const f = m.id;
        _.get(f) || _.set(f, new u.ConNode(f, m.val));
      } else if (m instanceof e.InsObjOp) {
        const f = _.get(m.obj), d = m.data, y = d.length;
        if (f instanceof a.ObjNode)
          for (let v = 0; v < y; v++) {
            const w = d[v], x = _.get(w[1]);
            if (!x || f.id.time >= w[1].time)
              continue;
            x.parent = f;
            const I = f.put(w[0] + "", x.id);
            I && this._gcTree(I);
          }
      } else if (m instanceof e.InsVecOp) {
        const f = _.get(m.obj), d = m.data, y = d.length;
        if (f instanceof a.VecNode)
          for (let v = 0; v < y; v++) {
            const w = d[v], x = _.get(w[1]);
            if (!x || f.id.time >= w[1].time)
              continue;
            x.parent = f;
            const I = f.put(Number(w[0]), x.id);
            I && this._gcTree(I);
          }
      } else if (m instanceof e.InsValOp) {
        const f = m.obj, d = f.sid === 0 && f.time === 0 ? this.root : _.get(f);
        if (d instanceof a.ValNode) {
          const y = _.get(m.val);
          if (y) {
            y.parent = d;
            const v = d.set(m.val);
            v && this._gcTree(v);
          }
        }
      } else if (m instanceof e.InsArrOp) {
        const f = _.get(m.obj);
        if (f instanceof a.ArrNode) {
          const d = [], y = m.data, v = y.length;
          for (let w = 0; w < v; w++) {
            const x = y[w], I = _.get(x);
            I && (f.id.time >= x.time || (d.push(x), I.parent = f));
          }
          d.length && f.ins(m.ref, m.id, d);
        }
      } else if (m instanceof e.UpdArrOp) {
        const f = _.get(m.obj);
        if (f instanceof a.ArrNode) {
          const d = m.val, y = _.get(d);
          if (y) {
            y.parent = f;
            const v = f.upd(m.ref, d);
            v && this._gcTree(v);
          }
        }
      } else if (m instanceof e.DelOp) {
        const f = _.get(m.obj);
        if (f instanceof a.ArrNode) {
          const d = m.what.length;
          for (let y = 0; y < d; y++) {
            const v = m.what[y];
            for (let w = 0; w < v.span; w++) {
              const x = f.getById(new t.Timestamp(v.sid, v.time + w));
              x && this._gcTree(x);
            }
          }
          f.delete(m.what);
        } else (f instanceof a.StrNode || f instanceof a.BinNode) && f.delete(m.what);
      } else if (m instanceof e.NewBinOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.BinNode(f));
      } else if (m instanceof e.InsBinOp) {
        const f = _.get(m.obj);
        f instanceof a.BinNode && f.ins(m.ref, m.id, m.data);
      } else if (m instanceof e.NewVecOp) {
        const f = m.id;
        _.get(f) || _.set(f, new a.VecNode(this, f));
      }
    }
    /**
     * Recursively deletes a tree of nodes. Used when root node is overwritten or
     * when object contents of container node (object or array) is removed.
     *
     * @ignore
     */
    _gcTree(m) {
      if (m.sid === 0)
        return;
      const f = this.index.get(m);
      if (!f)
        return;
      f.parent = void 0;
      const d = f.api;
      d && d.events.handleDelete(), f.children((y) => this._gcTree(y.id)), this.index.del(m);
    }
    /**
     * Creates a copy of this model with a new session ID. If the session ID is
     * not provided, a random session ID is generated.
     *
     * This performs a deep clone of all model state without serialization,
     * which allows sharing of immutable data like strings, binary buffers, and IDs
     * between the original and the clone for memory efficiency.
     *
     * @param sessionId Session ID to use for the new model.
     * @returns A copy of this model with a new session ID.
     */
    fork(m = this.rndSid()) {
      const _ = this.clock instanceof t.ClockVector ? this.clock.fork(m) : this.clock.clone(), f = new Vs(_);
      f.ext = this.ext.clone();
      const d = this.index, y = f.index;
      return d.forEach(({ v }) => {
        let w;
        if (v instanceof u.ConNode)
          w = v.clone();
        else if (v instanceof a.ValNode)
          w = v.clone(f);
        else if (v instanceof a.ObjNode)
          w = v.clone(f);
        else if (v instanceof a.VecNode)
          w = v.clone(f);
        else if (v instanceof a.StrNode)
          w = v.clone();
        else if (v instanceof a.BinNode)
          w = v.clone();
        else if (v instanceof a.ArrNode)
          w = v.clone(f);
        else
          throw new Error("UNKNOWN_NODE");
        y.set(w.id, w);
      }), f.root = this.root.clone(f), f.tick = this.tick, f.linkParents(), f;
    }
    /**
     * Creates a copy of this model with the same session ID.
     *
     * @returns A copy of this model with the same session ID.
     */
    clone() {
      return this.fork(this.clock.sid);
    }
    /**
     * Resets the model to equivalent state of another model.
     */
    reset(m) {
      var v, w;
      (v = this.onbeforereset) == null || v.call(this);
      const _ = this.index;
      this.index = new h.AvlMap(t.compare);
      const f = m.toBinary();
      i.decoder.decode(f, this), this.clock = m.clock.clone(), this.ext = m.ext.clone(), this.linkParents();
      const d = this._api;
      d && (d.flush(), d.builder.clock = this.clock, d.node = this.root);
      const y = /* @__PURE__ */ new Set();
      _.forEach(({ v: x }) => {
        const I = x.api;
        if (!I)
          return;
        const C = this.index.get(x.id);
        if (!C) {
          I.events.handleDelete();
          return;
        }
        I.node = C, C.api = I, x && C && !(0, p.cmpNode)(x, C) && y.add(C);
      }), this.tick++, (w = this.onreset) == null || w.call(this, y);
    }
    /**
     * Returns the view of the model.
     *
     * @returns JSON/CBOR of the model.
     */
    view() {
      return this.root.view();
    }
    /**
     * Rebuilds `.parent` links for all nodes in the document.
     */
    linkParents() {
      const m = (f, d) => {
        d.parent = f, d.children((y) => m(d, y));
      }, _ = this.root;
      _.parent = void 0, _.children((f) => m(_, f));
    }
    /**
     * Serialize this model using "binary" structural encoding.
     *
     * @returns This model encoded in octets.
     */
    toBinary() {
      return i.encoder.encode(this);
    }
    /**
     * Strictly types the model and sets the default value of the model, if
     * the document is empty.
     *
     * @param schema The schema to set for this model.
     * @param sid Session ID to use for setting the default value of the document.
     *            Defaults to `SESSION.GLOBAL` (2), which is the default session ID
     *            for all operations operations that are not attributed to a specific
     *            session.
     * @returns Strictly typed model.
     */
    setSchema(m, _ = !0) {
      const f = this.clock;
      if (f.time === 1) {
        const y = f.sid;
        _ && (f.sid = 2), this.api.set(m), _ && this.setSid(y);
      }
      return this;
    }
    /**
     * Changes the session ID of the model. By modifying the attached clock vector
     * of the model. Be careful when changing the session ID of the model, as this
     * is an advanced operation.
     *
     * Use the {@link Model.load} method to load a model with the the right session
     * ID, instead of changing the session ID of the model. When in doubt, use the
     * {@link Model.fork} method to create a new model with the right session ID.
     *
     * @param sid The new session ID to set for the model.
     */
    setSid(m) {
      const _ = this.clock, f = _.sid;
      f !== m && (_.sid = m, _.observe(new t.Timestamp(f, _.time - 1), 1));
    }
    // ---------------------------------------------------------------- Printable
    toString(m = "") {
      const _ = () => "", f = this.ext.size() > 0;
      return "model" + (0, l.printTree)(m, [
        (d) => this.root.toString(d),
        _,
        (d) => {
          const y = [];
          return this.index.forEach((v) => y.push(v.v)), `index (${y.length} nodes)` + (y.length ? (0, l.printTree)(d, y.map((v) => (w) => `${v.name()} ${t.printTs(v.id)}`)) : "");
        },
        _,
        (d) => `view${(0, l.printTree)(d, [(y) => String(JSON.stringify(this.view(), null, 2)).replace(/\n/g, `
` + y)])}`,
        _,
        (d) => this.clock.toString(d),
        f ? _ : null,
        f ? (d) => this.ext.toString(d) : null
      ]);
    }
  };
  return Ct.Model = b, b.sid = o.randomSessionId, b.create = (k, m = b.sid()) => {
    const _ = typeof m == "number" ? m === 1 ? new t.ServerClockVector(1, 1) : new t.ClockVector(m, 1) : m, f = new b(_);
    return k !== void 0 && f.setSchema(k instanceof g.NodeBuilder ? k : g.s.json(k), !0), f;
  }, b.withServerClock = (k, m = 1) => b.create(k, new t.ServerClockVector(1, m)), b.fromBinary = (k) => i.decoder.decode(k), b.load = (k, m, _) => {
    const f = i.decoder.decode(k);
    return _ && f.setSchema(_, !0), typeof m == "number" && f.setSid(m), f;
  }, Ct;
}
var Nc;
function vl() {
  if (Nc) return rr;
  Nc = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.ValNode = void 0;
  const r = de(), e = Ee(), t = po();
  let i = class gl {
    constructor(s, o, a) {
      this.doc = s, this.id = o, this.val = a, this.api = void 0, this.parent = void 0;
    }
    /**
     * @ignore
     */
    set(s) {
      if ((0, r.compare)(s, this.val) <= 0 && this.val.sid !== 0 || (0, r.compare)(s, this.id) <= 0)
        return;
      const o = this.val;
      return this.val = s, o;
    }
    /**
     * Returns the latest value of the node, the JSON CRDT node that `val` points
     * to.
     *
     * @returns The latest value of the node.
     */
    node() {
      return this.val.sid === 0 ? t.UNDEFINED : this.child();
    }
    // ----------------------------------------------------------------- JsonNode
    view() {
      var s;
      return (s = this.node()) == null ? void 0 : s.view();
    }
    /**
     * @ignore
     */
    children(s) {
      s(this.node());
    }
    /**
     * @ignore
     */
    child() {
      return this.doc.index.get(this.val);
    }
    /**
     * @ignore
     */
    container() {
      const s = this.node();
      return s ? s.container() : void 0;
    }
    name() {
      return "val";
    }
    /** @ignore */
    clone(s) {
      return new gl(s, this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      const o = this.node();
      return this.name() + " " + (0, r.printTs)(this.id) + (0, e.printTree)(s, [(u) => o ? o.toString(u) : (0, r.printTs)(this.val)]);
    }
  };
  return rr.ValNode = i, rr;
}
var xr = {}, Tc;
function pf() {
  if (Tc) return xr;
  Tc = 1, Object.defineProperty(xr, "__esModule", { value: !0 }), xr.RootNode = void 0;
  const r = wi(), e = vl();
  let t = class ml extends e.ValNode {
    /**
     * @param val Latest value of the document root.
     */
    constructor(n, s) {
      super(n, r.ORIGIN, s);
    }
    name() {
      return "root";
    }
    /** @ignore */
    clone(n) {
      return new ml(n, this.val);
    }
  };
  return xr.RootNode = t, xr;
}
var Or = {}, Ir = {}, Ac;
function yf() {
  if (Ac) return Ir;
  Ac = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.CRDT_CONSTANTS = void 0;
  var r;
  return (function(e) {
    e[e.MAX_TUPLE_LENGTH = 255] = "MAX_TUPLE_LENGTH";
  })(r || (Ir.CRDT_CONSTANTS = r = {})), Ir;
}
var jc;
function gf() {
  if (jc) return Or;
  jc = 1, Object.defineProperty(Or, "__esModule", { value: !0 }), Or.VecNode = void 0;
  const r = Si(), e = yf(), t = Ee(), i = de();
  let n = class bl {
    constructor(o, a) {
      this.doc = o, this.id = a, this.elements = [], this.__extNode = void 0, this._view = [], this.api = void 0, this.parent = void 0;
    }
    length() {
      return this.elements.length;
    }
    /**
     * Retrieves the ID of an element at the given index.
     *
     * @param index Index of the element to get.
     * @returns ID of the element at the given index, if any.
     */
    val(o) {
      return this.elements[o];
    }
    /**
     * Retrieves the JSON CRDT node at the given index.
     *
     * @param index Index of the element to get.
     * @returns JSON CRDT node at the given index, if any.
     */
    get(o) {
      const a = this.elements[o];
      if (a)
        return this.doc.index.get(a);
    }
    /**
     * @ignore
     */
    put(o, a) {
      if (o > e.CRDT_CONSTANTS.MAX_TUPLE_LENGTH)
        throw new Error("OUT_OF_BOUNDS");
      const u = this.val(o);
      if (!(u && (0, i.compare)(u, a) >= 0)) {
        if (o > this.elements.length)
          for (let l = this.elements.length; l < o; l++)
            this.elements.push(void 0);
        return o < this.elements.length ? this.elements[o] = a : this.elements.push(a), u;
      }
    }
    /**
     * @ignore
     * @returns Returns the extension data node if this is an extension node,
     *          otherwise `undefined`. The node is cached after the first access.
     */
    ext() {
      if (this.__extNode)
        return this.__extNode;
      const o = this.getExtId();
      if (!(o >= 0))
        return;
      const u = this.doc.ext.get(o);
      if (u)
        return this.__extNode = new u.Node(this.get(1)), this.__extNode;
    }
    /**
     * @ignore
     */
    isExt() {
      return !!this.ext();
    }
    /**
     * @ignore
     * @returns Returns extension ID if this is an extension node, otherwise -1.
     */
    getExtId() {
      if (this.elements.length !== 2)
        return -1;
      const o = this.get(0);
      if (!(o instanceof r.ConNode))
        return -1;
      const a = o.val, u = this.id;
      return !(a instanceof Uint8Array) || a.length !== 3 || a[1] !== u.sid % 256 || a[2] !== u.time % 256 ? -1 : a[0];
    }
    /** ------------------------------------------------------ {@link JsonNode} */
    name() {
      return "vec";
    }
    /** @ignore */
    child() {
      return this.ext();
    }
    /** @ignore */
    container() {
      return this;
    }
    /** @ignore */
    children(o) {
      const a = this.elements, u = a.length, l = this.doc.index;
      for (let c = 0; c < u; c++) {
        const h = a[c];
        if (!h)
          continue;
        const g = l.get(h);
        g && o(g);
      }
    }
    /** @ignore */
    view() {
      const o = this.ext();
      if (o)
        return o.view();
      let a = !0;
      const u = this._view, l = [], c = this.doc.index, h = this.elements, g = h.length;
      for (let p = 0; p < g; p++) {
        const b = h[p], k = b ? c.get(b) : void 0, m = k ? k.view() : void 0;
        u[p] !== m && (a = !1), l.push(m);
      }
      return a ? u : this._view = l;
    }
    /**
     * @ignore
     *
     * - `doc`: provided
     * - `id`: shared, immutable
     * - `elements`: shallow copy, elements are immutable
     * - `__extNode`: not copied, will be lazily initialized
     * - `_view`: not copied, will be lazily initialized
     * - `api`: not copied
     */
    clone(o) {
      const a = new bl(o, this.id), u = this.elements, l = u.length;
      for (let c = 0; c < l; c++)
        a.elements.push(u[c]);
      return a;
    }
    /** ----------------------------------------------------- {@link Printable} */
    toString(o = "") {
      const a = this.ext(), u = this.name() + " " + (0, i.printTs)(this.id) + (a ? ` { extension = ${this.getExtId()} }` : "");
      if (a)
        return this.child().toString(o, this.id);
      const l = this.doc.index;
      return u + (0, t.printTree)(o, [
        ...this.elements.map((c, h) => (g) => `${h}: ${c && l.get(c) ? l.get(c).toString(g + "  " + " ".repeat(("" + h).length)) : "nil"}`),
        ...a ? [(c) => `${this.child().toString(c)}`] : []
      ]);
    }
  };
  return Or.VecNode = n, Or;
}
var Cr = {}, Ec;
function vf() {
  if (Ec) return Cr;
  Ec = 1, Object.defineProperty(Cr, "__esModule", { value: !0 }), Cr.ObjNode = void 0;
  const r = Ee(), e = de(), t = Si();
  let i = class wl {
    constructor(s, o) {
      this.doc = s, this.id = o, this.keys = /* @__PURE__ */ new Map(), this._tick = 0, this._view = {}, this.api = void 0, this.parent = void 0;
    }
    /**
     * Retrieves a JSON CRDT node at the given key.
     *
     * @param key A key of the object.
     * @returns JSON CRDT node at the given key, if any.
     */
    get(s) {
      const o = this.keys.get(s);
      if (o)
        return this.doc.index.get(o);
    }
    /**
     * Rewrites object key.
     *
     * @param key Object key to set.
     * @param id ID of the contents of the key.
     * @returns Returns old entry ID, if any.
     * @ignore
     */
    put(s, o) {
      const a = this.keys.get(s);
      if (!(a && (0, e.compare)(a, o) >= 0))
        return this.keys.set(s, o), a;
    }
    /**
     * Iterate over all key-value pairs in the object.
     *
     * @param callback Callback to call for each key-value pair.
     */
    nodes(s) {
      const o = this.doc.index;
      this.keys.forEach((a, u) => s(o.get(a), u));
    }
    forEach(s) {
      const o = this.doc.index;
      this.keys.forEach((a, u) => {
        const l = o.get(a);
        !l || l instanceof t.ConNode && l.val === void 0 || s(u, l);
      });
    }
    // ----------------------------------------------------------------- JsonNode
    name() {
      return "obj";
    }
    /** @ignore */
    children(s) {
      const o = this.doc.index;
      this.keys.forEach((a, u) => s(o.get(a)));
    }
    /** @ignore */
    child() {
    }
    /** @ignore */
    container() {
      return this;
    }
    /** @ignore */
    view() {
      const s = this.doc, o = s.clock.time + s.tick, a = this._view;
      if (this._tick === o)
        return a;
      const u = {}, l = s.index;
      let c = !0;
      return this.keys.forEach((h, g) => {
        const p = l.get(h);
        if (!p) {
          c = !1;
          return;
        }
        const b = p.view();
        b !== void 0 ? (a[g] !== b && (c = !1), u[g] = b) : a[g] !== void 0 && (c = !1);
      }), c ? a : (this._tick = o, this._view = u);
    }
    /** @ignore */
    clone(s) {
      const o = new wl(s, this.id);
      return this.keys.forEach((a, u) => o.keys.set(u, a)), o;
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      return this.name() + " " + (0, e.printTs)(this.id) + (0, r.printTree)(s, [...this.keys.entries()].filter(([, a]) => !!this.doc.index.get(a)).map(([a, u]) => (l) => JSON.stringify(a) + (0, r.printTree)(l + " ", [(c) => this.doc.index.get(u).toString(c)])));
    }
  };
  return Cr.ObjNode = i, Cr;
}
var Et = {}, Nr = {}, Tr = {}, Pc;
function mf() {
  if (Pc) return Tr;
  Pc = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.printOctets = void 0;
  const r = (e, t = 16) => {
    let i = "";
    if (!e.length)
      return i;
    e[0] < 16 && (i += "0"), i += e[0].toString(16);
    for (let n = 1; n < e.length && n < t; n++) {
      const s = e[n];
      i += " ", s < 16 && (i += "0"), i += s.toString(16);
    }
    return e.length > t && (i += `… (${e.length - t} more)`), i;
  };
  return Tr.printOctets = r, Tr;
}
var ys = {}, Rc;
function bf() {
  return Rc || (Rc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.rlSplay = r.lrSplay = r.llSplay = r.rrSplay = r.lSplay = r.rSplay = r.splay = void 0;
    const e = (u, l, c) => {
      const h = l.p;
      if (!h)
        return u;
      const g = h.p, p = h.l === l;
      return g ? (g.l === h ? p ? u = (0, r.llSplay)(u, l, h, g) : u = (0, r.lrSplay)(u, l, h, g) : p ? u = (0, r.rlSplay)(u, l, h, g) : u = (0, r.rrSplay)(u, l, h, g), c > 1 ? (0, r.splay)(u, l, c - 1) : u) : (p ? (0, r.rSplay)(l, h) : (0, r.lSplay)(l, h), l);
    };
    r.splay = e;
    const t = (u, l) => {
      const c = u.r;
      u.p = void 0, u.r = l, l.p = u, l.l = c, c && (c.p = l);
    };
    r.rSplay = t;
    const i = (u, l) => {
      const c = u.l;
      u.p = void 0, u.l = l, l.p = u, l.r = c, c && (c.p = l);
    };
    r.lSplay = i;
    const n = (u, l, c, h) => {
      const g = c.l, p = l.l, b = h.p;
      return l.p = b, l.l = c, c.p = l, c.l = h, c.r = p, h.p = c, h.r = g, g && (g.p = h), p && (p.p = c), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    r.rrSplay = n;
    const s = (u, l, c, h) => {
      const g = c.r, p = l.r, b = h.p;
      return l.p = b, l.r = c, c.p = l, c.l = p, c.r = h, h.p = c, h.l = g, g && (g.p = h), p && (p.p = c), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    r.llSplay = s;
    const o = (u, l, c, h) => {
      const g = l.l, p = l.r, b = h.p;
      return l.p = b, l.l = c, l.r = h, c.p = l, c.r = g, h.p = l, h.l = p, g && (g.p = c), p && (p.p = h), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    r.lrSplay = o;
    const a = (u, l, c, h) => {
      const g = l.r, p = l.l, b = h.p;
      return l.p = b, l.l = h, l.r = c, c.p = l, c.l = g, h.p = l, h.r = p, g && (g.p = c), p && (p.p = h), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    r.rlSplay = a;
  })(ys)), ys;
}
var gs = {}, Vc;
function wf() {
  return Vc || (Vc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.splay2 = void 0;
    const e = (u, l) => {
      const c = l.p2;
      if (!c)
        return u;
      const h = c.p2, g = c.l2 === l;
      return h ? (h.l2 === c ? g ? u = s(u, l, c, h) : u = o(u, l, c, h) : g ? u = a(u, l, c, h) : u = n(u, l, c, h), (0, r.splay2)(u, l)) : (g ? t(l, c) : i(l, c), l);
    };
    r.splay2 = e;
    const t = (u, l) => {
      const c = u.r2;
      u.p2 = void 0, u.r2 = l, l.p2 = u, l.l2 = c, c && (c.p2 = l);
    }, i = (u, l) => {
      const c = u.l2;
      u.p2 = void 0, u.l2 = l, l.p2 = u, l.r2 = c, c && (c.p2 = l);
    }, n = (u, l, c, h) => {
      const g = c.l2, p = l.l2, b = h.p2;
      return l.p2 = b, l.l2 = c, c.p2 = l, c.l2 = h, c.r2 = p, h.p2 = c, h.r2 = g, g && (g.p2 = h), p && (p.p2 = c), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, s = (u, l, c, h) => {
      const g = c.r2, p = l.r2, b = h.p2;
      return l.p2 = b, l.r2 = c, c.p2 = l, c.l2 = p, c.r2 = h, h.p2 = c, h.l2 = g, g && (g.p2 = h), p && (p.p2 = c), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, o = (u, l, c, h) => {
      const g = l.l2, p = l.r2, b = h.p2;
      return l.p2 = b, l.l2 = c, l.r2 = h, c.p2 = l, c.r2 = g, h.p2 = l, h.l2 = p, g && (g.p2 = c), p && (p.p2 = h), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, a = (u, l, c, h) => {
      const g = l.r2, p = l.l2, b = h.p2;
      return l.p2 = b, l.l2 = h, l.r2 = c, c.p2 = l, c.l2 = g, h.p2 = l, h.r2 = p, g && (g.p2 = c), p && (p.p2 = h), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    };
  })(gs)), gs;
}
var Ar = {}, Bc = {}, Lc;
function _f() {
  if (Lc) return Bc;
  if (Lc = 1, typeof Iterator > "u" && typeof globalThis == "object") {
    class r {
      [Symbol.iterator]() {
        return this;
      }
      find(t) {
        for (const i of this)
          if (t(i))
            return i;
      }
    }
    globalThis.Iterator = r;
  }
  return Bc;
}
var Mc;
function kf() {
  if (Mc) return Ar;
  Mc = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.UndEndIterator = void 0, _f();
  class r extends Iterator {
    constructor(i) {
      super(), this.n = i;
    }
    next() {
      const i = this.n();
      return new e(i, i === void 0);
    }
  }
  Ar.UndEndIterator = r;
  class e {
    constructor(i, n) {
      this.value = i, this.done = n;
    }
  }
  return Ar;
}
var Dc;
function yo() {
  if (Dc) return Nr;
  Dc = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.AbstractRga = void 0;
  const r = de(), e = ao(), t = mf(), i = bf(), n = wf(), s = yl(), o = wi(), a = Ee(), u = _i(), l = kf(), c = (_, f) => {
    const d = _.id, y = f.id;
    return d.sid - y.sid || d.time - y.time;
  }, h = (_) => {
    const f = _.l, d = _.r;
    _.len = (_.del ? 0 : _.span) + (f ? f.len : 0) + (d ? d.len : 0);
  }, g = (_) => {
    const f = _.l, d = _.r;
    _.len = _.span + (f ? f.len : 0) + (d ? d.len : 0);
  }, p = (_, f) => {
    for (; _; )
      _.len += f, _ = _.p;
  }, b = (_) => {
    const f = _.r;
    if (f) {
      _ = f;
      let y;
      for (; y = _.l; )
        _ = y;
      return _;
    }
    let d = _.p;
    for (; d && d.r === _; )
      _ = d, d = d.p;
    return d;
  }, k = (_) => {
    const f = _.l;
    if (f) {
      _ = f;
      let y;
      for (; y = _.r; )
        _ = y;
      return _;
    }
    let d = _.p;
    for (; d && d.l === _; )
      _ = d, d = d.p;
    return d;
  };
  let m = class {
    constructor(f) {
      this.id = f, this.root = void 0, this.ids = void 0, this.count = 0;
    }
    // --------------------------------------------------------------- Public API
    ins(f, d, y) {
      const v = this.id, w = f.time, x = f.sid;
      if (v.time === w && v.sid === x) {
        this.insAfterRoot(f, d, y);
        return;
      }
      let C = this.ids, E = C;
      for (; C; ) {
        const V = C.id, z = V.sid;
        if (z > x)
          C = C.l2;
        else if (z < x)
          E = C, C = C.r2;
        else {
          const J = V.time;
          if (J > w)
            C = C.l2;
          else if (J < w)
            E = C, C = C.r2;
          else {
            E = C;
            break;
          }
        }
      }
      if (!E)
        return;
      const O = E.id, T = O.time, j = O.sid, P = E.span;
      if (j !== x || w - T >= P)
        return;
      const M = w - T;
      this.insAfterChunk(f, E, M, d, y);
    }
    insAt(f, d, y) {
      if (!f) {
        const E = this.id;
        return this.insAfterRoot(E, d, y), E;
      }
      const v = this.findChunk(f - 1);
      if (!v)
        return;
      const [w, x] = v, I = w.id, C = x === 0 ? I : new r.Timestamp(I.sid, I.time + x);
      return this.insAfterChunk(C, w, x, d, y), C;
    }
    insAfterRoot(f, d, y) {
      const v = this.createChunk(d, y), w = this.first();
      if (!w)
        this.setRoot(v);
      else if ((0, r.compare)(w.id, d) < 0)
        this.insertBefore(v, w);
      else {
        if ((0, r.containsId)(w.id, w.span, d))
          return;
        this.insertAfterRef(v, f, w);
      }
    }
    insAfterChunk(f, d, y, v, w) {
      const x = d.id, I = x.time, C = x.sid, E = d.span, O = this.createChunk(v, w);
      if (y + 1 < E) {
        const j = v.sid, P = v.time;
        if (C === j && I <= P && I + E - 1 >= P)
          return;
        if (P > f.time + 1 || j > f.sid) {
          this.insertInside(O, d, y + 1), this.splay(O);
          return;
        }
      }
      this.insertAfterRef(O, f, d), this.splay(O);
    }
    delete(f) {
      const d = f.length;
      for (let y = 0; y < d; y++)
        this.deleteSpan(f[y]);
      this.onChange();
    }
    deleteSpan(f) {
      const d = f.span, y = f.time, v = y + d - 1, w = this.findById(f);
      if (!w)
        return;
      let x = w, I = x;
      for (; x; ) {
        I = x;
        const C = x.id, E = x.span, O = C.time, T = O + E - 1;
        if (x.del) {
          if (T >= v)
            break;
          x = x.s;
          continue;
        }
        const j = y <= O, P = y <= T;
        if (j)
          if (v >= T) {
            if (x.delete(), p(x, -x.span), v <= T)
              break;
          } else {
            const M = v - O + 1, V = this.split(x, M);
            x.delete(), h(V), p(x, -x.span);
            break;
          }
        else if (P)
          if (v >= T) {
            const M = y - O, V = this.split(x, M);
            if (V.delete(), V.len = V.r ? V.r.len : 0, p(x, -V.span), v <= T)
              break;
          } else {
            const M = this.split(x, v - O + 1), V = this.split(x, y - O);
            V.delete(), h(M), h(V), p(x, -V.span);
            break;
          }
        x = x.s;
      }
      I && this.mergeTombstones2(w, I);
    }
    find(f) {
      let d = this.root;
      for (; d; ) {
        const y = d.l, v = y ? y.len : 0;
        let w;
        if (f < v)
          d = y;
        else if (d.del)
          f -= v, d = d.r;
        else if (f < v + (w = d.span)) {
          const x = f - v, I = d.id;
          return x ? new r.Timestamp(I.sid, I.time + x) : I;
        } else
          f -= v + w, d = d.r;
      }
    }
    findChunk(f) {
      let d = this.root;
      for (; d; ) {
        const y = d.l, v = y ? y.len : 0;
        let w;
        if (f < v)
          d = y;
        else if (d.del)
          f -= v, d = d.r;
        else {
          if (f < v + (w = d.span))
            return [d, f - v];
          f -= v + w, d = d.r;
        }
      }
    }
    findInterval(f, d) {
      const y = [];
      if (!d)
        return y;
      let v = this.root, w = 0;
      for (; v; ) {
        const C = v.l ? v.l.len : 0;
        if (f < C)
          v = v.l;
        else if (v.del)
          f -= C, v = v.r;
        else if (f < C + v.span) {
          w = f - C;
          break;
        } else
          f -= C + v.span, v = v.r;
      }
      if (!v)
        return y;
      if (v.span >= d + w) {
        const C = v.id;
        return y.push((0, r.tss)(C.sid, C.time + w, d)), y;
      }
      const x = v.span - w, I = v.id;
      if (y.push((0, r.tss)(I.sid, I.time + w, x)), d -= x, v = b(v), !v)
        return y;
      do {
        if (v.del)
          continue;
        const C = v.id, E = v.span;
        if (d <= E)
          return y.push((0, r.tss)(C.sid, C.time, d)), y;
        y.push((0, r.tss)(C.sid, C.time, E)), d -= E;
      } while ((v = b(v)) && d > 0);
      return y;
    }
    /** Rename to .rangeX() method? */
    findInterval2(f, d) {
      const y = [];
      return this.range0(void 0, f, d, (v, w, x) => {
        const I = v.id;
        y.push((0, r.tss)(I.sid, I.time + w, x));
      }), y;
    }
    /**
     * @note All ".rangeX()" method are not performance optimized. For hot paths
     * it is better to hand craft the loop.
     *
     * @param startChunk Chunk from which to start the range. If undefined, the
     *                   chunk containing `from` will be used. This is an optimization
     *                   to avoid a lookup.
     * @param from ID of the first element in the range.
     * @param to ID of the last element in the range.
     * @param callback Function to call for each chunk slice in the range. If it
     *     returns truthy value, the iteration will stop.
     * @returns Reference to the last chunk in the range.
     */
    range0(f, d, y, v) {
      let w = f || this.findById(d);
      if (f)
        for (; w && !(0, r.containsId)(w.id, w.span, d); )
          w = b(w);
      if (w) {
        if (w.del) {
          if ((0, r.containsId)(w.id, w.span, y))
            return;
        } else {
          const x = d.time - w.id.time;
          if ((0, r.containsId)(w.id, w.span, y)) {
            const E = y.time - d.time + 1;
            return v(w, x, E), w;
          }
          const C = w.span - x;
          if (v(w, x, C))
            return w;
        }
        for (w = b(w); w; ) {
          if ((0, r.containsId)(w.id, w.span, y))
            return !w.del && v(w, 0, y.time - w.id.time + 1), w;
          if (!w.del && v(w, 0, w.span))
            return w;
          w = b(w);
        }
        return w;
      }
    }
    // ---------------------------------------------------------------- Retrieval
    first() {
      let f = this.root;
      for (; f; ) {
        const d = f.l;
        if (d)
          f = d;
        else
          return f;
      }
      return f;
    }
    last() {
      let f = this.root;
      for (; f; ) {
        const d = f.r;
        if (d)
          f = d;
        else
          return f;
      }
      return f;
    }
    lastId() {
      const f = this.last();
      if (!f)
        return;
      const d = f.id, y = f.span;
      return y === 1 ? d : new r.Timestamp(d.sid, d.time + y - 1);
    }
    /** @todo Maybe use implementation from tree utils, if does not impact performance. */
    /** @todo Or better remove this method completely, as it does not require "this". */
    next(f) {
      return b(f);
    }
    /** @todo Maybe use implementation from tree utils, if does not impact performance. */
    /** @todo Or better remove this method completely, as it does not require "this". */
    prev(f) {
      return k(f);
    }
    /** Content length. */
    length() {
      const f = this.root;
      return f ? f.len : 0;
    }
    /** Number of chunks. */
    size() {
      return this.count;
    }
    /** Returns the position of the first element in the chunk. */
    pos(f) {
      const d = f.p, y = f.l;
      if (!d)
        return y ? y.len : 0;
      const v = this.pos(d);
      if (d.r === f)
        return v + (d.del ? 0 : d.span) + (y ? y.len : 0);
      const x = f.r;
      return v - (f.del ? 0 : f.span) - (x ? x.len : 0);
    }
    chunks0() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = b(f)), d;
      };
    }
    chunks() {
      return new l.UndEndIterator(this.chunks0());
    }
    // --------------------------------------------------------------- Insertions
    setRoot(f) {
      this.root = f, this.insertId(f), this.onChange();
    }
    insertBefore(f, d) {
      const y = d.l;
      d.l = f, f.l = y, f.p = d;
      let v = 0;
      y && (y.p = f, v = y.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfter(f, d) {
      const y = d.r;
      d.r = f, f.r = y, f.p = d;
      let v = 0;
      y && (y.p = f, v = y.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfterRef(f, d, y) {
      const v = f.id, w = v.sid, x = v.time;
      let I = !1;
      for (; ; ) {
        const C = y.id, E = C.time + y.span;
        y.s || (I = C.sid === w && E === x && E - 1 === d.time, I && (y.s = f));
        const O = b(y);
        if (!O)
          break;
        const T = O.id, j = T.time, P = T.sid;
        if (j < x)
          break;
        if (j === x) {
          if (P === w)
            return;
          if (P < w)
            break;
        }
        y = O;
      }
      I && !y.del ? (this.mergeContent(y, f.data), y.s = void 0) : this.insertAfter(f, y);
    }
    mergeContent(f, d) {
      const y = f.span;
      f.merge(d), p(f, f.span - y), this.onChange();
    }
    insertInside(f, d, y) {
      const v = d.p, w = d.l, x = d.r, I = d.s, C = d.len, E = d.split(y);
      if (d.s = E, E.s = I, d.l = d.r = E.l = E.r = void 0, E.l = void 0, f.p = v, !w)
        f.l = d, d.p = f;
      else {
        f.l = w, w.p = f;
        const j = w.r;
        w.r = d, d.p = w, d.l = j, j && (j.p = d);
      }
      if (!x)
        f.r = E, E.p = f;
      else {
        f.r = x, x.p = f;
        const j = x.l;
        x.l = E, E.p = x, E.r = j, j && (j.p = E);
      }
      v ? v.l === d ? v.l = f : v.r = f : this.root = f, h(d), h(E), w && (w.len = (w.l ? w.l.len : 0) + d.len + (w.del ? 0 : w.span)), x && (x.len = (x.r ? x.r.len : 0) + E.len + (x.del ? 0 : x.span)), f.len = C + f.span;
      const O = f.span;
      let T = f.p;
      for (; T; )
        T.len += O, T = T.p;
      this.insertId(E), this.insertIdFast(f), this.onChange();
    }
    split(f, d) {
      const y = f.s, v = f.split(d), w = f.r;
      return f.s = v, v.r = w, v.s = y, f.r = v, v.p = f, this.insertId(v), w && (w.p = v), v;
    }
    mergeTombstones(f, d) {
      if (!f.del || !d.del)
        return !1;
      const y = f.id, v = d.id;
      return y.sid !== v.sid || y.time + f.span !== v.time ? !1 : (f.s = d.s, f.span += d.span, this.deleteChunk(d), !0);
    }
    mergeTombstones2(f, d) {
      let y = f;
      for (; y; ) {
        const w = b(y);
        if (!w)
          break;
        if (!this.mergeTombstones(y, w)) {
          if (w === d) {
            if (w) {
              const I = b(w);
              I && this.mergeTombstones(w, I);
            }
            break;
          }
          y = y.s;
        }
      }
      const v = k(f);
      v && this.mergeTombstones(v, f);
    }
    rmTombstones() {
      let f = this.first();
      const d = [];
      for (; f; )
        f.del && d.push(f), f = b(f);
      for (let y = 0; y < d.length; y++)
        this.deleteChunk(d[y]);
    }
    deleteChunk(f) {
      this.deleteId(f);
      const d = f.p, y = f.l, v = f.r;
      if (f.id = o.ORIGIN, !y && !v)
        d ? d.l === f ? d.l = void 0 : d.r = void 0 : this.root = void 0;
      else if (y && v) {
        let w = y;
        for (; w.r; )
          w = w.r;
        w.r = v, v.p = w;
        const x = v.len;
        let I;
        for (I = w, d ? (d.l === f ? d.l = y : d.r = y, y.p = d) : (this.root = y, y.p = void 0); I && I !== d; )
          I.len += x, I = I.p;
      } else {
        const w = y || v;
        w.p = d, d ? d.l === f ? d.l = w : d.r = w : this.root = w;
      }
    }
    insertId(f) {
      this.ids = (0, s.insert2)(this.ids, f, c), this.count++, this.ids = (0, n.splay2)(this.ids, f);
    }
    insertIdFast(f) {
      this.ids = (0, s.insert2)(this.ids, f, c), this.count++;
    }
    deleteId(f) {
      this.ids = (0, s.remove2)(this.ids, f), this.count--;
    }
    findById(f) {
      const d = f.sid, y = f.time;
      let v = this.ids, w = v;
      for (; v; ) {
        const T = v.id, j = T.sid;
        if (j > d)
          v = v.l2;
        else if (j < d)
          w = v, v = v.r2;
        else {
          const P = T.time;
          if (P > y)
            v = v.l2;
          else if (P < y)
            w = v, v = v.r2;
          else {
            w = v;
            break;
          }
        }
      }
      if (!w)
        return;
      const x = w.id, I = x.time, C = x.sid, E = w.span;
      if (!(C !== d || y < I || y - I >= E))
        return w;
    }
    posById(f) {
      const d = this.findById(f);
      if (!d)
        return;
      const y = this.pos(d);
      return d.del ? y : y + (f.time - d.id.time);
    }
    /**
     * @param id ID of character to start the search from.
     * @returns Previous ID in the RGA sequence.
     */
    prevId(f) {
      let d = this.findById(f);
      if (!d)
        return;
      const y = f.time;
      if (d.id.time < y)
        return new r.Timestamp(f.sid, y - 1);
      if (d = k(d), !d)
        return;
      const v = d.id;
      return d.span > 1 ? new r.Timestamp(v.sid, v.time + d.span - 1) : v;
    }
    spanView(f) {
      const d = [];
      let y = f.span;
      const v = f.time;
      let w = this.findById(f);
      if (!w)
        return d;
      if (!w.del)
        if (w.span >= y + v - w.id.time) {
          const x = v - w.id.time, I = x + y, C = w.view().slice(x, I);
          return d.push(C), d;
        } else {
          const x = v - w.id.time, I = w.view().slice(x, f.span);
          y -= w.span - x, d.push(I);
        }
      for (; w = w.s; ) {
        const x = w.span;
        if (!w.del) {
          if (x > y) {
            const I = w.view().slice(0, y);
            d.push(I);
            break;
          }
          d.push(w.data);
        }
        if (y -= x, y <= 0)
          break;
      }
      return d;
    }
    // ---------------------------------------------------------- Splay balancing
    splay(f) {
      const d = f.p;
      if (!d)
        return;
      const y = d.p, v = d.l === f;
      if (!y) {
        v ? (0, i.rSplay)(f, d) : (0, i.lSplay)(f, d), this.root = f, h(d), g(f);
        return;
      }
      y.l === d ? v ? this.root = (0, i.llSplay)(this.root, f, d, y) : this.root = (0, i.lrSplay)(this.root, f, d, y) : v ? this.root = (0, i.rlSplay)(this.root, f, d, y) : this.root = (0, i.rrSplay)(this.root, f, d, y), h(y), h(d), g(f), this.splay(f);
    }
    // ---------------------------------------------------------- Export / Import
    iterator() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = b(f)), d;
      };
    }
    ingest(f, d) {
      if (f < 1)
        return;
      const y = /* @__PURE__ */ new Map();
      this.root = this._ingest(f, () => {
        const v = d(), w = v.id, x = w.sid + "." + w.time, I = y.get(x);
        I && (I.s = v, y.delete(x));
        const C = (0, r.tick)(w, v.span);
        return y.set(C.sid + "." + C.time, v), v;
      });
    }
    _ingest(f, d) {
      const y = f >> 1, v = f - y - 1, w = y > 0 ? this._ingest(y, d) : void 0, x = d();
      w && (x.l = w, w.p = x);
      const I = v > 0 ? this._ingest(v, d) : void 0;
      return I && (x.r = I, I.p = x), h(x), this.insertId(x), x;
    }
    // ---------------------------------------------------------------- Printable
    toStringName() {
      return "AbstractRga";
    }
    toString(f = "") {
      const d = this.view();
      let y = "";
      return (0, e.isUint8Array)(d) ? y += ` { ${(0, t.printOctets)(d) || "∅"} }` : typeof d == "string" && (y += `{ ${d.length > 32 ? JSON.stringify(d.substring(0, 32)) + " …" : JSON.stringify(d)} }`), `${this.toStringName()} ${(0, r.printTs)(this.id)} ${y}` + (0, a.printTree)(f, [(w) => this.root ? this.printChunk(w, this.root) : "∅"]);
    }
    printChunk(f, d) {
      return this.formatChunk(d) + (0, u.printBinary)(f, [
        d.l ? (y) => this.printChunk(y, d.l) : null,
        d.r ? (y) => this.printChunk(y, d.r) : null
      ]);
    }
    formatChunk(f) {
      let y = `chunk ${(0, r.printTs)(f.id)}:${f.span} .${f.len}.`;
      if (f.del)
        y += ` [${f.span}]`;
      else if ((0, e.isUint8Array)(f.data))
        y += ` { ${(0, t.printOctets)(f.data) || "∅"} }`;
      else if (typeof f.data == "string") {
        const v = f.data.length > 32 ? JSON.stringify(f.data.substring(0, 32)) + " …" : JSON.stringify(f.data);
        y += ` { ${v} }`;
      }
      return y;
    }
  };
  return Nr.AbstractRga = m, Nr;
}
var qc;
function Sf() {
  if (qc) return Et;
  qc = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.ArrNode = Et.ArrChunk = void 0;
  const r = yo(), e = de(), t = _i(), i = Ee();
  class n {
    constructor(a, u, l) {
      this.id = a, this.span = u, this.len = l ? u : 0, this.del = !l, this.p = void 0, this.l = void 0, this.r = void 0, this.s = void 0, this.data = l;
    }
    merge(a) {
      this.data.push(...a), this.span = this.data.length;
    }
    split(a) {
      const u = this.span;
      if (this.span = a, !this.del) {
        const c = this.data.splice(a);
        return new n((0, e.tick)(this.id, a), u - a, c);
      }
      return new n((0, e.tick)(this.id, a), u - a, void 0);
    }
    delete() {
      this.del = !0, this.data = void 0;
    }
    clone() {
      return new n(this.id, this.span, this.data ? [...this.data] : void 0);
    }
    view() {
      return this.data ? [...this.data] : [];
    }
  }
  Et.ArrChunk = n;
  let s = class _l extends r.AbstractRga {
    constructor(a, u) {
      super(u), this.doc = a, this._tick = 0, this._view = [], this.api = void 0, this.parent = void 0;
    }
    /**
     * Returns a reference to an element at a given position in the array.
     *
     * @param position The position of the element to get.
     * @returns An element of the array, if any.
     */
    get(a) {
      const u = this.findChunk(a);
      if (u)
        return u[0].data[u[1]];
    }
    /**
     * Returns a JSON node at a given position in the array.
     *
     * @param position The position of the element to get.
     * @returns A JSON node, if any.
     */
    getNode(a) {
      const u = this.get(a);
      if (u)
        return this.doc.index.get(u);
    }
    /**
     * Returns ID of the RGA slot (not the referenced JSON node) at a given position
     * in the array. The ID is a timestamp the unique slot of the element in the RGA.
     * To retrieve the JSON node ID referenced by the slot, use {@link get} method.
     *
     * @todo Rename to `getRef`.
     *
     * @param position The position of the element to get.
     * @returns ID of the RGA slot.
     */
    getId(a) {
      const u = this.findChunk(a);
      if (!u)
        return;
      const [l, c] = u, h = l.id;
      return c ? (0, e.tick)(h, c) : h;
    }
    getById(a) {
      const u = this.findById(a);
      if (!u || u.del)
        return;
      const l = a.time - u.id.time;
      return u.data[l];
    }
    /**
     * Updates an array element in-place. Used by the "upd_arr" operation.
     *
     * @todo Verify that the new ID is greater than the old ID.
     *
     * @param ref A reference to the element slot in the array.
     * @param val A new value to set in the slot.
     * @returns The old value of the slot, if any.
     */
    upd(a, u) {
      const l = this.findById(a);
      if (!l)
        return;
      const c = l.data;
      if (!c)
        return;
      const h = a.time - l.id.time, g = c[h];
      if (!(g && (0, e.compare)(g, u) >= 0))
        return c[h] = u, this.onChange(), g;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(a, u) {
      return new n(a, u ? u.length : 0, u);
    }
    /** @ignore */
    onChange() {
    }
    toStringName() {
      return this.name();
    }
    // ----------------------------------------------------------------- JsonNode
    name() {
      return "arr";
    }
    /** @ignore */
    child() {
    }
    /** @ignore */
    container() {
      return this;
    }
    view() {
      const a = this.doc, u = a.clock.time + a.tick, l = this._view;
      if (this._tick === u)
        return l;
      const c = [], h = a.index;
      let g = !0;
      for (let b = this.first(); b; b = this.next(b))
        if (!b.del)
          for (const k of b.data) {
            const m = h.get(k);
            if (!m) {
              g = !1;
              continue;
            }
            const _ = m.view();
            l[c.length] !== _ && (g = !1), c.push(_);
          }
      return l.length !== c.length && (g = !1), g ? l : (this._tick = u, this._view = c);
    }
    /** @ignore */
    children(a) {
      const u = this.doc.index;
      for (let l = this.first(); l; l = this.next(l)) {
        const c = l.data;
        if (!c)
          continue;
        const h = c.length;
        for (let g = 0; g < h; g++)
          a(u.get(c[g]));
      }
    }
    /** @ignore */
    clone(a) {
      const u = new _l(a, this.id), l = this.count;
      if (!l)
        return u;
      let c = this.first();
      return u.ingest(l, () => {
        const h = c.clone();
        return c = this.next(c), h;
      }), u;
    }
    // ---------------------------------------------------------------- Printable
    /** @ignore */
    printChunk(a, u) {
      const l = this.pos(u);
      let c = "";
      if (!u.del) {
        const h = this.doc.index;
        c = (0, i.printTree)(a, u.data.map((g) => h.get(g)).filter((g) => !!g).map((g, p) => (b) => `[${l + p}]: ${g.toString(b + "    " + " ".repeat(String(p).length))}`));
      }
      return this.formatChunk(u) + c + (0, t.printBinary)(a, [
        u.l ? (h) => this.printChunk(h, u.l) : null,
        u.r ? (h) => this.printChunk(h, u.r) : null
      ]);
    }
  };
  return Et.ArrNode = s, Et;
}
var Pt = {}, Uc;
function xf() {
  if (Uc) return Pt;
  Uc = 1, Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.BinNode = Pt.BinChunk = void 0;
  const r = de(), e = yo();
  class t {
    constructor(s, o, a) {
      this.id = s, this.span = o, this.len = a ? o : 0, this.del = !a, this.p = void 0, this.l = void 0, this.r = void 0, this.s = void 0, this.data = a;
    }
    merge(s) {
      const o = this.data.length, a = new Uint8Array(o + s.length);
      a.set(this.data), a.set(s, o), this.data = a, this.span = a.length;
    }
    split(s) {
      if (!this.del) {
        const a = this.data, u = a.subarray(s), l = new t((0, r.tick)(this.id, s), this.span - s, u);
        return this.data = a.subarray(0, s), this.span = s, l;
      }
      const o = new t((0, r.tick)(this.id, s), this.span - s, void 0);
      return this.span = s, o;
    }
    delete() {
      this.del = !0, this.data = void 0;
    }
    clone() {
      return new t(this.id, this.span, this.data);
    }
    view() {
      return this.data || new Uint8Array(0);
    }
  }
  Pt.BinChunk = t;
  let i = class kl extends e.AbstractRga {
    constructor() {
      super(...arguments), this._view = null, this.api = void 0, this.parent = void 0;
    }
    name() {
      return "bin";
    }
    view() {
      if (this._view)
        return this._view;
      const s = new Uint8Array(this.length());
      let o = 0, a = this.first();
      for (; a; ) {
        if (!a.del) {
          const u = a.data;
          s.set(u, o), o += u.length;
        }
        a = this.next(a);
      }
      return this._view = s;
    }
    /** @ignore */
    children() {
    }
    /** @ignore */
    child() {
    }
    /** @ignore */
    container() {
    }
    /** @ignore */
    clone() {
      const s = new kl(this.id), o = this.count;
      if (!o)
        return s;
      let a = this.first();
      return s.ingest(o, () => {
        const u = a.clone();
        return a = this.next(a), u;
      }), s;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(s, o) {
      return new t(s, o ? o.length : 0, o);
    }
    /** @ignore */
    onChange() {
      this._view = null;
    }
    toStringName() {
      return this.name();
    }
  };
  return Pt.BinNode = i, Pt;
}
var Rt = {}, Fc;
function Of() {
  if (Fc) return Rt;
  Fc = 1, Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.StrNode = Rt.StrChunk = void 0;
  const r = de(), e = yo(), t = pl();
  class i {
    constructor(o, a, u) {
      this.id = o, this.span = a, this.len = u ? a : 0, this.del = !u, this.p = void 0, this.l = void 0, this.r = void 0, this.p2 = void 0, this.l2 = void 0, this.r2 = void 0, this.s = void 0, this.data = u;
    }
    merge(o) {
      this.data += o, this.span = this.data.length;
    }
    split(o) {
      if (!this.del) {
        const u = new i((0, r.tick)(this.id, o), this.span - o, this.data.slice(o));
        return this.data = this.data.slice(0, o), this.span = o, u;
      }
      const a = new i((0, r.tick)(this.id, o), this.span - o, "");
      return this.span = o, a;
    }
    delete() {
      this.del = !0, this.data = "";
    }
    /**
     * - `id`, `span`, `len`, `del`, `data`: copied, set by constructor
     * - `p`, `l`, `r`, `p2`, `l2`, `r2`, `s`: not copied, set when inserted into RGA
     */
    clone() {
      return new i(this.id, this.span, this.data);
    }
    view() {
      return this.data;
    }
  }
  Rt.StrChunk = i;
  let n = class Sl extends e.AbstractRga {
    constructor() {
      super(...arguments), this._view = "", this.api = void 0, this.parent = void 0;
    }
    /** @ignore */
    children() {
    }
    /** @ignore */
    child() {
    }
    /** @ignore */
    container() {
    }
    view() {
      if (this._view)
        return this._view;
      let o = "";
      for (let a = this.first(); a; a = (0, t.next)(a))
        o += a.data;
      return this._view = o;
    }
    name() {
      return "str";
    }
    /** @ignore */
    clone() {
      const o = new Sl(this.id), a = this.count;
      if (!a)
        return o;
      let u = this.first();
      return o.ingest(a, () => {
        const l = u.clone();
        return u = this.next(u), l;
      }), o;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(o, a) {
      return new i(o, a ? a.length : 0, a || "");
    }
    /** @ignore */
    onChange() {
      this._view = "";
    }
    toStringName() {
      return this.name();
    }
  };
  return Rt.StrNode = n, Rt;
}
var Hc;
function If() {
  return Hc || (Hc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.StrChunk = r.StrNode = r.BinChunk = r.BinNode = r.ArrChunk = r.ArrNode = r.ObjNode = r.VecNode = r.RootNode = r.ValNode = r.ConNode = void 0;
    var e = Si();
    Object.defineProperty(r, "ConNode", { enumerable: !0, get: function() {
      return e.ConNode;
    } });
    var t = vl();
    Object.defineProperty(r, "ValNode", { enumerable: !0, get: function() {
      return t.ValNode;
    } });
    var i = pf();
    Object.defineProperty(r, "RootNode", { enumerable: !0, get: function() {
      return i.RootNode;
    } });
    var n = gf();
    Object.defineProperty(r, "VecNode", { enumerable: !0, get: function() {
      return n.VecNode;
    } });
    var s = vf();
    Object.defineProperty(r, "ObjNode", { enumerable: !0, get: function() {
      return s.ObjNode;
    } });
    var o = Sf();
    Object.defineProperty(r, "ArrNode", { enumerable: !0, get: function() {
      return o.ArrNode;
    } }), Object.defineProperty(r, "ArrChunk", { enumerable: !0, get: function() {
      return o.ArrChunk;
    } });
    var a = xf();
    Object.defineProperty(r, "BinNode", { enumerable: !0, get: function() {
      return a.BinNode;
    } }), Object.defineProperty(r, "BinChunk", { enumerable: !0, get: function() {
      return a.BinChunk;
    } });
    var u = Of();
    Object.defineProperty(r, "StrNode", { enumerable: !0, get: function() {
      return u.StrNode;
    } }), Object.defineProperty(r, "StrChunk", { enumerable: !0, get: function() {
      return u.StrChunk;
    } });
  })(Ri)), Ri;
}
var zc;
function Ot() {
  return zc || (zc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(ud(), r), e.__exportStar(If(), r);
  })(Ei)), Ei;
}
var vs = {}, Zc;
function Cf() {
  return Zc || (Zc = 1, Object.defineProperty(vs, "__esModule", { value: !0 })), vs;
}
var ms = {}, Kc;
function Nf() {
  return Kc || (Kc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.Model = void 0;
    const e = re;
    var t = po();
    Object.defineProperty(r, "Model", { enumerable: !0, get: function() {
      return t.Model;
    } }), e.__exportStar(hl(), r);
  })(ms)), ms;
}
var Jc;
function xl() {
  return Jc || (Jc = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Ot(), r), e.__exportStar(Cf(), r), e.__exportStar(Nf(), r), e.__exportStar(xt(), r);
  })(ji)), ji;
}
var Wc = xl(), B = ki(), Tf = xt(), we = Uint8Array, Ne = Uint16Array, go = Int32Array, Oi = new we([
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
]), Ii = new we([
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
]), Bs = new we([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Ol = function(r, e) {
  for (var t = new Ne(31), i = 0; i < 31; ++i)
    t[i] = e += 1 << r[i - 1];
  for (var n = new go(t[30]), i = 1; i < 30; ++i)
    for (var s = t[i]; s < t[i + 1]; ++s)
      n[s] = s - t[i] << 5 | i;
  return { b: t, r: n };
}, Il = Ol(Oi, 2), Cl = Il.b, Ls = Il.r;
Cl[28] = 258, Ls[258] = 28;
var Nl = Ol(Ii, 0), Af = Nl.b, Gc = Nl.r, Ms = new Ne(32768);
for (var le = 0; le < 32768; ++le) {
  var ct = (le & 43690) >> 1 | (le & 21845) << 1;
  ct = (ct & 52428) >> 2 | (ct & 13107) << 2, ct = (ct & 61680) >> 4 | (ct & 3855) << 4, Ms[le] = ((ct & 65280) >> 8 | (ct & 255) << 8) >> 1;
}
var Ge = (function(r, e, t) {
  for (var i = r.length, n = 0, s = new Ne(e); n < i; ++n)
    r[n] && ++s[r[n] - 1];
  var o = new Ne(e);
  for (n = 1; n < e; ++n)
    o[n] = o[n - 1] + s[n - 1] << 1;
  var a;
  if (t) {
    a = new Ne(1 << e);
    var u = 15 - e;
    for (n = 0; n < i; ++n)
      if (r[n])
        for (var l = n << 4 | r[n], c = e - r[n], h = o[r[n] - 1]++ << c, g = h | (1 << c) - 1; h <= g; ++h)
          a[Ms[h] >> u] = l;
  } else
    for (a = new Ne(i), n = 0; n < i; ++n)
      r[n] && (a[n] = Ms[o[r[n] - 1]++] >> 15 - r[n]);
  return a;
}), St = new we(288);
for (var le = 0; le < 144; ++le)
  St[le] = 8;
for (var le = 144; le < 256; ++le)
  St[le] = 9;
for (var le = 256; le < 280; ++le)
  St[le] = 7;
for (var le = 280; le < 288; ++le)
  St[le] = 8;
var zr = new we(32);
for (var le = 0; le < 32; ++le)
  zr[le] = 5;
var jf = /* @__PURE__ */ Ge(St, 9, 0), Ef = /* @__PURE__ */ Ge(St, 9, 1), Pf = /* @__PURE__ */ Ge(zr, 5, 0), Rf = /* @__PURE__ */ Ge(zr, 5, 1), bs = function(r) {
  for (var e = r[0], t = 1; t < r.length; ++t)
    r[t] > e && (e = r[t]);
  return e;
}, Ve = function(r, e, t) {
  var i = e / 8 | 0;
  return (r[i] | r[i + 1] << 8) >> (e & 7) & t;
}, ws = function(r, e) {
  var t = e / 8 | 0;
  return (r[t] | r[t + 1] << 8 | r[t + 2] << 16) >> (e & 7);
}, vo = function(r) {
  return (r + 7) / 8 | 0;
}, Tl = function(r, e, t) {
  return (t == null || t > r.length) && (t = r.length), new we(r.subarray(e, t));
}, Vf = [
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
], Le = function(r, e, t) {
  var i = new Error(e || Vf[r]);
  if (i.code = r, Error.captureStackTrace && Error.captureStackTrace(i, Le), !t)
    throw i;
  return i;
}, Bf = function(r, e, t, i) {
  var n = r.length, s = 0;
  if (!n || e.f && !e.l)
    return t || new we(0);
  var o = !t, a = o || e.i != 2, u = e.i;
  o && (t = new we(n * 3));
  var l = function(Tn) {
    var An = t.length;
    if (Tn > An) {
      var Jt = new we(Math.max(An * 2, Tn));
      Jt.set(t), t = Jt;
    }
  }, c = e.f || 0, h = e.p || 0, g = e.b || 0, p = e.l, b = e.d, k = e.m, m = e.n, _ = n * 8;
  do {
    if (!p) {
      c = Ve(r, h, 1);
      var f = Ve(r, h + 1, 3);
      if (h += 3, f)
        if (f == 1)
          p = Ef, b = Rf, k = 9, m = 5;
        else if (f == 2) {
          var w = Ve(r, h, 31) + 257, x = Ve(r, h + 10, 15) + 4, I = w + Ve(r, h + 5, 31) + 1;
          h += 14;
          for (var C = new we(I), E = new we(19), O = 0; O < x; ++O)
            E[Bs[O]] = Ve(r, h + O * 3, 7);
          h += x * 3;
          for (var T = bs(E), j = (1 << T) - 1, P = Ge(E, T, 1), O = 0; O < I; ) {
            var R = P[Ve(r, h, j)];
            h += R & 15;
            var d = R >> 4;
            if (d < 16)
              C[O++] = d;
            else {
              var M = 0, V = 0;
              for (d == 16 ? (V = 3 + Ve(r, h, 3), h += 2, M = C[O - 1]) : d == 17 ? (V = 3 + Ve(r, h, 7), h += 3) : d == 18 && (V = 11 + Ve(r, h, 127), h += 7); V--; )
                C[O++] = M;
            }
          }
          var z = C.subarray(0, w), J = C.subarray(w);
          k = bs(z), m = bs(J), p = Ge(z, k, 1), b = Ge(J, m, 1);
        } else
          Le(1);
      else {
        var d = vo(h) + 4, y = r[d - 4] | r[d - 3] << 8, v = d + y;
        if (v > n) {
          u && Le(0);
          break;
        }
        a && l(g + y), t.set(r.subarray(d, v), g), e.b = g += y, e.p = h = v * 8, e.f = c;
        continue;
      }
      if (h > _) {
        u && Le(0);
        break;
      }
    }
    a && l(g + 131072);
    for (var he = (1 << k) - 1, Y = (1 << m) - 1, fe = h; ; fe = h) {
      var M = p[ws(r, h) & he], ce = M >> 4;
      if (h += M & 15, h > _) {
        u && Le(0);
        break;
      }
      if (M || Le(2), ce < 256)
        t[g++] = ce;
      else if (ce == 256) {
        fe = h, p = null;
        break;
      } else {
        var oe = ce - 254;
        if (ce > 264) {
          var O = ce - 257, ie = Oi[O];
          oe = Ve(r, h, (1 << ie) - 1) + Cl[O], h += ie;
        }
        var xe = b[ws(r, h) & Y], Zt = xe >> 4;
        xe || Le(3), h += xe & 15;
        var J = Af[Zt];
        if (Zt > 3) {
          var ie = Ii[Zt];
          J += ws(r, h) & (1 << ie) - 1, h += ie;
        }
        if (h > _) {
          u && Le(0);
          break;
        }
        a && l(g + 131072);
        var Kt = g + oe;
        if (g < J) {
          var ti = s - J, ni = Math.min(J, Kt);
          for (ti + g < 0 && Le(3); g < ni; ++g)
            t[g] = i[ti + g];
        }
        for (; g < Kt; ++g)
          t[g] = t[g - J];
      }
    }
    e.l = p, e.p = fe, e.b = g, e.f = c, p && (c = 1, e.m = k, e.d = b, e.n = m);
  } while (!c);
  return g != t.length && o ? Tl(t, 0, g) : t.subarray(0, g);
}, Xe = function(r, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  r[i] |= t, r[i + 1] |= t >> 8;
}, jr = function(r, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  r[i] |= t, r[i + 1] |= t >> 8, r[i + 2] |= t >> 16;
}, _s = function(r, e) {
  for (var t = [], i = 0; i < r.length; ++i)
    r[i] && t.push({ s: i, f: r[i] });
  var n = t.length, s = t.slice();
  if (!n)
    return { t: jl, l: 0 };
  if (n == 1) {
    var o = new we(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(v, w) {
    return v.f - w.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], u = t[1], l = 0, c = 1, h = 2;
  for (t[0] = { s: -1, f: a.f + u.f, l: a, r: u }; c != n - 1; )
    a = t[t[l].f < t[h].f ? l++ : h++], u = t[l != c && t[l].f < t[h].f ? l++ : h++], t[c++] = { s: -1, f: a.f + u.f, l: a, r: u };
  for (var g = s[0].s, i = 1; i < n; ++i)
    s[i].s > g && (g = s[i].s);
  var p = new Ne(g + 1), b = Ds(t[c - 1], p, 0);
  if (b > e) {
    var i = 0, k = 0, m = b - e, _ = 1 << m;
    for (s.sort(function(w, x) {
      return p[x.s] - p[w.s] || w.f - x.f;
    }); i < n; ++i) {
      var f = s[i].s;
      if (p[f] > e)
        k += _ - (1 << b - p[f]), p[f] = e;
      else
        break;
    }
    for (k >>= m; k > 0; ) {
      var d = s[i].s;
      p[d] < e ? k -= 1 << e - p[d]++ - 1 : ++i;
    }
    for (; i >= 0 && k; --i) {
      var y = s[i].s;
      p[y] == e && (--p[y], ++k);
    }
    b = e;
  }
  return { t: new we(p), l: b };
}, Ds = function(r, e, t) {
  return r.s == -1 ? Math.max(Ds(r.l, e, t + 1), Ds(r.r, e, t + 1)) : e[r.s] = t;
}, Xc = function(r) {
  for (var e = r.length; e && !r[--e]; )
    ;
  for (var t = new Ne(++e), i = 0, n = r[0], s = 1, o = function(u) {
    t[i++] = u;
  }, a = 1; a <= e; ++a)
    if (r[a] == n && a != e)
      ++s;
    else {
      if (!n && s > 2) {
        for (; s > 138; s -= 138)
          o(32754);
        s > 2 && (o(s > 10 ? s - 11 << 5 | 28690 : s - 3 << 5 | 12305), s = 0);
      } else if (s > 3) {
        for (o(n), --s; s > 6; s -= 6)
          o(8304);
        s > 2 && (o(s - 3 << 5 | 8208), s = 0);
      }
      for (; s--; )
        o(n);
      s = 1, n = r[a];
    }
  return { c: t.subarray(0, i), n: e };
}, Er = function(r, e) {
  for (var t = 0, i = 0; i < e.length; ++i)
    t += r[i] * e[i];
  return t;
}, Al = function(r, e, t) {
  var i = t.length, n = vo(e + 2);
  r[n] = i & 255, r[n + 1] = i >> 8, r[n + 2] = r[n] ^ 255, r[n + 3] = r[n + 1] ^ 255;
  for (var s = 0; s < i; ++s)
    r[n + s + 4] = t[s];
  return (n + 4 + i) * 8;
}, Yc = function(r, e, t, i, n, s, o, a, u, l, c) {
  Xe(e, c++, t), ++n[256];
  for (var h = _s(n, 15), g = h.t, p = h.l, b = _s(s, 15), k = b.t, m = b.l, _ = Xc(g), f = _.c, d = _.n, y = Xc(k), v = y.c, w = y.n, x = new Ne(19), I = 0; I < f.length; ++I)
    ++x[f[I] & 31];
  for (var I = 0; I < v.length; ++I)
    ++x[v[I] & 31];
  for (var C = _s(x, 7), E = C.t, O = C.l, T = 19; T > 4 && !E[Bs[T - 1]]; --T)
    ;
  var j = l + 5 << 3, P = Er(n, St) + Er(s, zr) + o, R = Er(n, g) + Er(s, k) + o + 14 + 3 * T + Er(x, E) + 2 * x[16] + 3 * x[17] + 7 * x[18];
  if (u >= 0 && j <= P && j <= R)
    return Al(e, c, r.subarray(u, u + l));
  var M, V, z, J;
  if (Xe(e, c, 1 + (R < P)), c += 2, R < P) {
    M = Ge(g, p, 0), V = g, z = Ge(k, m, 0), J = k;
    var he = Ge(E, O, 0);
    Xe(e, c, d - 257), Xe(e, c + 5, w - 1), Xe(e, c + 10, T - 4), c += 14;
    for (var I = 0; I < T; ++I)
      Xe(e, c + 3 * I, E[Bs[I]]);
    c += 3 * T;
    for (var Y = [f, v], fe = 0; fe < 2; ++fe)
      for (var ce = Y[fe], I = 0; I < ce.length; ++I) {
        var oe = ce[I] & 31;
        Xe(e, c, he[oe]), c += E[oe], oe > 15 && (Xe(e, c, ce[I] >> 5 & 127), c += ce[I] >> 12);
      }
  } else
    M = jf, V = St, z = Pf, J = zr;
  for (var I = 0; I < a; ++I) {
    var ie = i[I];
    if (ie > 255) {
      var oe = ie >> 18 & 31;
      jr(e, c, M[oe + 257]), c += V[oe + 257], oe > 7 && (Xe(e, c, ie >> 23 & 31), c += Oi[oe]);
      var xe = ie & 31;
      jr(e, c, z[xe]), c += J[xe], xe > 3 && (jr(e, c, ie >> 5 & 8191), c += Ii[xe]);
    } else
      jr(e, c, M[ie]), c += V[ie];
  }
  return jr(e, c, M[256]), c + V[256];
}, Lf = /* @__PURE__ */ new go([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), jl = /* @__PURE__ */ new we(0), Mf = function(r, e, t, i, n, s) {
  var o = s.z || r.length, a = new we(i + o + 5 * (1 + Math.ceil(o / 7e3)) + n), u = a.subarray(i, a.length - n), l = s.l, c = (s.r || 0) & 7;
  if (e) {
    c && (u[0] = s.r >> 3);
    for (var h = Lf[e - 1], g = h >> 13, p = h & 8191, b = (1 << t) - 1, k = s.p || new Ne(32768), m = s.h || new Ne(b + 1), _ = Math.ceil(t / 3), f = 2 * _, d = function(Ci) {
      return (r[Ci] ^ r[Ci + 1] << _ ^ r[Ci + 2] << f) & b;
    }, y = new go(25e3), v = new Ne(288), w = new Ne(32), x = 0, I = 0, C = s.i || 0, E = 0, O = s.w || 0, T = 0; C + 2 < o; ++C) {
      var j = d(C), P = C & 32767, R = m[j];
      if (k[P] = R, m[j] = P, O <= C) {
        var M = o - C;
        if ((x > 7e3 || E > 24576) && (M > 423 || !l)) {
          c = Yc(r, u, 0, y, v, w, I, E, T, C - T, c), E = x = I = 0, T = C;
          for (var V = 0; V < 286; ++V)
            v[V] = 0;
          for (var V = 0; V < 30; ++V)
            w[V] = 0;
        }
        var z = 2, J = 0, he = p, Y = P - R & 32767;
        if (M > 2 && j == d(C - Y))
          for (var fe = Math.min(g, M) - 1, ce = Math.min(32767, C), oe = Math.min(258, M); Y <= ce && --he && P != R; ) {
            if (r[C + z] == r[C + z - Y]) {
              for (var ie = 0; ie < oe && r[C + ie] == r[C + ie - Y]; ++ie)
                ;
              if (ie > z) {
                if (z = ie, J = Y, ie > fe)
                  break;
                for (var xe = Math.min(Y, ie - 2), Zt = 0, V = 0; V < xe; ++V) {
                  var Kt = C - Y + V & 32767, ti = k[Kt], ni = Kt - ti & 32767;
                  ni > Zt && (Zt = ni, R = Kt);
                }
              }
            }
            P = R, R = k[P], Y += P - R & 32767;
          }
        if (J) {
          y[E++] = 268435456 | Ls[z] << 18 | Gc[J];
          var Tn = Ls[z] & 31, An = Gc[J] & 31;
          I += Oi[Tn] + Ii[An], ++v[257 + Tn], ++w[An], O = C + z, ++x;
        } else
          y[E++] = r[C], ++v[r[C]];
      }
    }
    for (C = Math.max(C, O); C < o; ++C)
      y[E++] = r[C], ++v[r[C]];
    c = Yc(r, u, l, y, v, w, I, E, T, C - T, c), l || (s.r = c & 7 | u[c / 8 | 0] << 3, c -= 7, s.h = m, s.p = k, s.i = C, s.w = O);
  } else {
    for (var C = s.w || 0; C < o + l; C += 65535) {
      var Jt = C + 65535;
      Jt >= o && (u[c / 8 | 0] = l, Jt = o), c = Al(u, c + 1, r.subarray(C, Jt));
    }
    s.i = o;
  }
  return Tl(a, 0, i + vo(c) + n);
}, Df = /* @__PURE__ */ (function() {
  for (var r = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, i = 9; --i; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    r[e] = t;
  }
  return r;
})(), qf = function() {
  var r = -1;
  return {
    p: function(e) {
      for (var t = r, i = 0; i < e.length; ++i)
        t = Df[t & 255 ^ e[i]] ^ t >>> 8;
      r = t;
    },
    d: function() {
      return ~r;
    }
  };
}, Uf = function(r, e, t, i, n) {
  if (!n && (n = { l: 1 }, e.dictionary)) {
    var s = e.dictionary.subarray(-32768), o = new we(s.length + r.length);
    o.set(s), o.set(r, s.length), r = o, n.w = s.length;
  }
  return Mf(r, e.level == null ? 6 : e.level, e.mem == null ? n.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(r.length))) * 1.5) : 20 : 12 + e.mem, t, i, n);
}, qs = function(r, e, t) {
  for (; t; ++e)
    r[e] = t, t >>>= 8;
}, Ff = function(r, e) {
  var t = e.filename;
  if (r[0] = 31, r[1] = 139, r[2] = 8, r[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, r[9] = 3, e.mtime != 0 && qs(r, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    r[3] = 8;
    for (var i = 0; i <= t.length; ++i)
      r[i + 10] = t.charCodeAt(i);
  }
}, Hf = function(r) {
  (r[0] != 31 || r[1] != 139 || r[2] != 8) && Le(6, "invalid gzip data");
  var e = r[3], t = 10;
  e & 4 && (t += (r[10] | r[11] << 8) + 2);
  for (var i = (e >> 3 & 1) + (e >> 4 & 1); i > 0; i -= !r[t++])
    ;
  return t + (e & 2);
}, zf = function(r) {
  var e = r.length;
  return (r[e - 4] | r[e - 3] << 8 | r[e - 2] << 16 | r[e - 1] << 24) >>> 0;
}, Zf = function(r) {
  return 10 + (r.filename ? r.filename.length + 1 : 0);
};
function Qc(r, e) {
  e || (e = {});
  var t = qf(), i = r.length;
  t.p(r);
  var n = Uf(r, e, Zf(e), 8), s = n.length;
  return Ff(n, e), qs(n, s - 8, t.d()), qs(n, s - 4, i), n;
}
function ks(r, e) {
  var t = Hf(r);
  return t + 8 > r.length && Le(6, "invalid gzip data"), Bf(r.subarray(t, -8), { i: 2 }, new we(zf(r)), e);
}
var Kf = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Jf = 0;
try {
  Kf.decode(jl, { stream: !0 }), Jf = 1;
} catch {
}
const El = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function en(r, e, t) {
  const i = t[0];
  if (e != null && r >= e)
    throw new Error(r + " >= " + e);
  if (r.slice(-1) === i || e && e.slice(-1) === i)
    throw new Error("trailing zero");
  if (e) {
    let o = 0;
    for (; (r[o] || i) === e[o]; )
      o++;
    if (o > 0)
      return e.slice(0, o) + en(r.slice(o), e.slice(o), t);
  }
  const n = r ? t.indexOf(r[0]) : 0, s = e != null ? t.indexOf(e[0]) : t.length;
  if (s - n > 1) {
    const o = Math.round(0.5 * (n + s));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[n] + en(r.slice(1), null, t);
}
function Pl(r) {
  if (r.length !== Rl(r[0]))
    throw new Error("invalid integer part of order key: " + r);
}
function Rl(r) {
  if (r >= "a" && r <= "z")
    return r.charCodeAt(0) - 97 + 2;
  if (r >= "A" && r <= "Z")
    return 90 - r.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + r);
}
function Vr(r) {
  const e = Rl(r[0]);
  if (e > r.length)
    throw new Error("invalid order key: " + r);
  return r.slice(0, e);
}
function $c(r, e) {
  if (r === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + r);
  const t = Vr(r);
  if (r.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + r);
}
function eu(r, e) {
  Pl(r);
  const [t, ...i] = r.split("");
  let n = !0;
  for (let s = i.length - 1; n && s >= 0; s--) {
    const o = e.indexOf(i[s]) + 1;
    o === e.length ? i[s] = e[0] : (i[s] = e[o], n = !1);
  }
  if (n) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) + 1);
    return s > "a" ? i.push(e[0]) : i.pop(), s + i.join("");
  } else
    return t + i.join("");
}
function Wf(r, e) {
  Pl(r);
  const [t, ...i] = r.split("");
  let n = !0;
  for (let s = i.length - 1; n && s >= 0; s--) {
    const o = e.indexOf(i[s]) - 1;
    o === -1 ? i[s] = e.slice(-1) : (i[s] = e[o], n = !1);
  }
  if (n) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) - 1);
    return s < "Z" ? i.push(e.slice(-1)) : i.pop(), s + i.join("");
  } else
    return t + i.join("");
}
function $e(r, e, t = El) {
  if (r != null && $c(r, t), e != null && $c(e, t), r != null && e != null && r >= e)
    throw new Error(r + " >= " + e);
  if (r == null) {
    if (e == null)
      return "a" + t[0];
    const u = Vr(e), l = e.slice(u.length);
    if (u === "A" + t[0].repeat(26))
      return u + en("", l, t);
    if (u < e)
      return u;
    const c = Wf(u, t);
    if (c == null)
      throw new Error("cannot decrement any more");
    return c;
  }
  if (e == null) {
    const u = Vr(r), l = r.slice(u.length), c = eu(u, t);
    return c ?? u + en(l, null, t);
  }
  const i = Vr(r), n = r.slice(i.length), s = Vr(e), o = e.slice(s.length);
  if (i === s)
    return i + en(n, o, t);
  const a = eu(i, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : i + en(n, null, t);
}
function Us(r, e, t, i = El) {
  if (t === 0)
    return [];
  if (t === 1)
    return [$e(r, e, i)];
  {
    let n = $e(r, e, i);
    const s = [n];
    for (let o = 0; o < t - 1; o++)
      n = $e(n, e, i), s.push(n);
    return s;
  }
}
const tu = new Uint8Array([
  31,
  139,
  8,
  0,
  177,
  131,
  174,
  105,
  0,
  3,
  99,
  96,
  96,
  82,
  111,
  12,
  112,
  172,
  96,
  119,
  205,
  43,
  41,
  202,
  76,
  45,
  110,
  244,
  119,
  174,
  80,
  49,
  128,
  2,
  93,
  48,
  97,
  2,
  34,
  44,
  96,
  92,
  24,
  104,
  244,
  115,
  77,
  241,
  206,
  204,
  75,
  105,
  244,
  101,
  72,
  201,
  44,
  73,
  205,
  77,
  245,
  73,
  76,
  74,
  205,
  105,
  244,
  81,
  104,
  244,
  110,
  72,
  241,
  204,
  75,
  203,
  111,
  244,
  116,
  168,
  224,
  240,
  245,
  244,
  117,
  13,
  169,
  44,
  72,
  109,
  244,
  80,
  104,
  116,
  111,
  168,
  224,
  12,
  75,
  204,
  41,
  77,
  5,
  107,
  115,
  85,
  104,
  116,
  105,
  108,
  116,
  78,
  201,
  203,
  207,
  75,
  37,
  202,
  70,
  195,
  70,
  91,
  55,
  136,
  141,
  54,
  16,
  27,
  43,
  248,
  242,
  75,
  75,
  82,
  139,
  2,
  114,
  18,
  147,
  129,
  214,
  231,
  149,
  52,
  90,
  43,
  52,
  90,
  49,
  44,
  170,
  224,
  6,
  11,
  123,
  2,
  85,
  120,
  166,
  16,
  231,
  151,
  10,
  14,
  255,
  162,
  148,
  212,
  34,
  239,
  212,
  202,
  164,
  68,
  3,
  168,
  71,
  44,
  20,
  26,
  205,
  27,
  27,
  205,
  82,
  75,
  138,
  18,
  139,
  51,
  32,
  30,
  50,
  64,
  246,
  144,
  190,
  66,
  163,
  30,
  138,
  135,
  116,
  20,
  26,
  181,
  27,
  27,
  181,
  136,
  247,
  144,
  81,
  163,
  10,
  212,
  67,
  202,
  56,
  60,
  164,
  164,
  208,
  168,
  72,
  177,
  135,
  12,
  161,
  30,
  146,
  87,
  104,
  148,
  107,
  108,
  148,
  173,
  224,
  203,
  201,
  47,
  46,
  209,
  77,
  204,
  75,
  209,
  77,
  203,
  47,
  205,
  75,
  1,
  123,
  77,
  14,
  201,
  103,
  178,
  10,
  50,
  200,
  254,
  146,
  82,
  144,
  108,
  148,
  0,
  123,
  138,
  241,
  202,
  175,
  89,
  83,
  55,
  29,
  94,
  204,
  30,
  8,
  0,
  64,
  93,
  64,
  8,
  53,
  2,
  0,
  0
]);
function Vl(r, e, t, i) {
  const n = r.Id, s = {};
  for (const u of Object.keys(r.Info))
    s[u] = B.s.con(r.Info[u]);
  if (r.Kind === "link") {
    i.api.obj(["Entries"]).set({ [n]: B.s.obj({
      Kind: B.s.con("link"),
      outerPlacement: B.s.val(B.s.con({ outerItemId: e, OrderKey: t })),
      Label: B.s.val(B.s.str(r.Label)),
      Info: B.s.obj(s),
      TargetId: B.s.con(r.TargetId)
    }) });
    return;
  }
  const o = r.Type === Wt ? "" : r.Type, a = {
    Kind: B.s.con("item"),
    outerPlacement: B.s.val(B.s.con({ outerItemId: e, OrderKey: t })),
    Label: B.s.val(B.s.str(r.Label)),
    Info: B.s.obj(s),
    MIMEType: B.s.val(B.s.str(o)),
    ValueKind: B.s.val(B.s.str(r.ValueKind))
  };
  switch (!0) {
    case (r.ValueKind === "literal" && r.Value != null):
      a.literalValue = B.s.val(B.s.str(r.Value));
      break;
    case (r.ValueKind === "binary" && r.Value != null):
      a.binaryValue = B.s.con(hu(r.Value));
      break;
  }
  if (i.api.obj(["Entries"]).set({ [n]: B.s.obj(a) }), r.innerEntries.length > 0) {
    const u = Us(null, null, r.innerEntries.length);
    for (let l = 0; l < r.innerEntries.length; l++)
      Vl(r.innerEntries[l], n, u[l], i);
  }
}
const Bl = yu().int().nonnegative().optional();
function Ss(r) {
  var t;
  const e = Bl.safeParse(r);
  if (!e.success)
    throw new ue("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
var $, Zr, rn, tt, Vt, Ie, dt, ft, ze, Ze, vi, sn, pt, on, Bt, an, A, Ll, Ml, Dl, ql, Fs, Hs, W, Se, Ul, Fl, zs, Hl, zl, Oe, lt, Xt, Br, Yt, Lr, Qt, Zl, Zs, Kl, Ks, Js, Ws, Jl, Gf, G, Wl, Gl;
const tn = class tn extends mh {
  //----------------------------------------------------------------------------//
  //                                Construction                                //
  //----------------------------------------------------------------------------//
  /**** constructor — initialize store with model and configuration ****/
  constructor(t, i) {
    super();
    D(this, A);
    /**** private state ****/
    D(this, $);
    D(this, Zr);
    D(this, rn);
    D(this, tt, null);
    D(this, Vt, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    D(this, Ie, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId (kept in sync with #ReverseIndex)
    D(this, dt, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    D(this, ft, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
    D(this, ze, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    D(this, Ze, /* @__PURE__ */ new Map());
    D(this, vi, yh);
    // transaction nesting
    D(this, sn, 0);
    // ChangeSet accumulator inside a transaction
    D(this, pt, {});
    // patch log for exportPatch() — only locally generated patches (as binaries)
    D(this, on, []);
    // suppress index updates / change tracking when applying remote patches
    D(this, Bt, !1);
    // optional observer called when applyRemotePatch() catches an internal error
    D(this, an);
    H(this, $, t), H(this, Zr, (i == null ? void 0 : i.LiteralSizeLimit) ?? fh), H(this, rn, (i == null ? void 0 : i.TrashTTLms) ?? 2592e6), H(this, an, i == null ? void 0 : i.onApplyPatchError), N(this, A, Hl).call(this);
    const n = (i == null ? void 0 : i.TrashCheckIntervalMs) ?? Math.min(Math.floor(S(this, rn) / 4), 36e5);
    H(this, tt, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      n
    )), typeof S(this, tt).unref == "function" && S(this, tt).unref();
  }
  /**** fromScratch — create store from canonical empty snapshot ****/
  static fromScratch(t) {
    return this.fromBinary(tu, t);
  }
  /**** fromBinary — deserialize store from binary snapshot ****/
  static fromBinary(t, i) {
    const n = ks(t), s = Wc.Model.fromBinary(n).fork();
    return new tn(s, i);
  }
  /**** fromJSON — deserialize store from a plain JSON object or JSON string ****/
  static fromJSON(t, i) {
    const n = typeof t == "string" ? JSON.parse(t) : t, s = Wc.Model.fromBinary(ks(tu));
    return Vl(n, "", "", s), s.api.flush(), new tn(s, i);
  }
  //----------------------------------------------------------------------------//
  //                             Public Accessors                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — access special items ****/
  get RootItem() {
    return N(this, A, Se).call(this, Qe);
  }
  get TrashItem() {
    return N(this, A, Se).call(this, ve);
  }
  get LostAndFoundItem() {
    return N(this, A, Se).call(this, Ae);
  }
  /**** EntryWithId — retrieve entry by id ****/
  EntryWithId(t) {
    if (N(this, A, W).call(this).Entries[t] != null)
      return N(this, A, Se).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                             Public Mutators                                //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, i, n) {
    if (i == null) throw new ue("invalid-argument", "outerItem must not be missing");
    const s = t ?? Wt;
    Es(s), Ss(n);
    const o = crypto.randomUUID();
    return this.transact(() => {
      const a = N(this, A, Yt).call(this, i.Id, n), u = s === Wt ? "" : s, l = B.s.obj({
        Kind: B.s.con("item"),
        outerPlacement: B.s.val(B.s.con({ outerItemId: i.Id, OrderKey: a })),
        Label: B.s.val(B.s.str("")),
        Info: B.s.obj({}),
        MIMEType: B.s.val(B.s.str(u)),
        ValueKind: B.s.val(B.s.str("none"))
      });
      S(this, $).api.obj(["Entries"]).set({ [o]: l }), N(this, A, Oe).call(this, i.Id, o), N(this, A, G).call(this, i.Id, "innerEntryList"), N(this, A, G).call(this, o, "outerItem");
    }), N(this, A, Se).call(this, o);
  }
  /**** newLinkAt — create new link in specified location ****/
  newLinkAt(t, i, n) {
    if (t == null) throw new ue("invalid-argument", "Target must not be missing");
    if (i == null) throw new ue("invalid-argument", "outerItem must not be missing");
    Ss(n), N(this, A, Ws).call(this, t.Id), N(this, A, Ws).call(this, i.Id);
    const s = crypto.randomUUID();
    return this.transact(() => {
      const o = N(this, A, Yt).call(this, i.Id, n), a = B.s.obj({
        Kind: B.s.con("link"),
        outerPlacement: B.s.val(B.s.con({ outerItemId: i.Id, OrderKey: o })),
        Label: B.s.val(B.s.str("")),
        Info: B.s.obj({}),
        TargetId: B.s.con(t.Id)
      });
      S(this, $).api.obj(["Entries"]).set({ [s]: a }), N(this, A, Oe).call(this, i.Id, s), N(this, A, Xt).call(this, t.Id, s), N(this, A, G).call(this, i.Id, "innerEntryList"), N(this, A, G).call(this, s, "outerItem");
    }), N(this, A, Se).call(this, s);
  }
  /**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/
  deserializeItemInto(t, i, n) {
    if (i == null) throw new ue("invalid-argument", "outerItem must not be missing");
    Ss(n);
    const s = typeof t == "string" ? JSON.parse(t) : t;
    if (s == null || s.Kind !== "item")
      throw new ue("invalid-argument", "Serialisation must be a valid SDS_ItemJSON object");
    const o = /* @__PURE__ */ new Map();
    N(this, A, Fs).call(this, s, o);
    const a = N(this, A, Yt).call(this, i.Id, n), u = o.get(s.Id) ?? s.Id;
    return this.transact(() => {
      N(this, A, Hs).call(this, s, i.Id, a, o);
    }), N(this, A, Se).call(this, u);
  }
  /**** deserializeLinkInto — import a serialised link; always assigns a new Id ****/
  deserializeLinkInto(t, i, n) {
    if (i == null) throw new ue("invalid-argument", "outerItem must not be missing");
    const s = typeof t == "string" ? JSON.parse(t) : t;
    if (s == null || s.Kind !== "link")
      throw new ue("invalid-argument", "Serialisation must be a valid SDS_LinkJSON object");
    const o = crypto.randomUUID(), a = N(this, A, Yt).call(this, i.Id, n), u = {};
    for (const c of Object.keys(s.Info ?? {}))
      u[c] = B.s.con(s.Info[c]);
    const l = B.s.obj({
      Kind: B.s.con("link"),
      outerPlacement: B.s.val(B.s.con({ outerItemId: i.Id, OrderKey: a })),
      Label: B.s.val(B.s.str(s.Label ?? "")),
      Info: B.s.obj(u),
      TargetId: B.s.con(s.TargetId)
    });
    return this.transact(() => {
      S(this, $).api.obj(["Entries"]).set({ [o]: l }), N(this, A, Oe).call(this, i.Id, o), N(this, A, Xt).call(this, s.TargetId, o), N(this, A, G).call(this, i.Id, "innerEntryList"), N(this, A, G).call(this, o, "outerItem");
    }), N(this, A, Se).call(this, o);
  }
  /**** moveEntryTo — move entry to new location in tree ****/
  moveEntryTo(t, i, n) {
    if (Bl.parse(n), !this._mayMoveEntryTo(t.Id, i.Id, n))
      throw new ue("move-would-cycle", "cannot move an entry into one of its own descendants");
    const s = this._outerItemIdOf(t.Id), o = N(this, A, Yt).call(this, i.Id, n);
    this.transact(() => {
      if (S(this, $).api.val(["Entries", t.Id, "outerPlacement"]).set(B.s.con({ outerItemId: i.Id, OrderKey: o })), s === ve && i.Id !== ve) {
        const a = N(this, A, W).call(this).Entries[t.Id], u = a == null ? void 0 : a.Info;
        u != null && "_trashedAt" in u && (S(this, $).api.obj(["Entries", t.Id, "Info"]).del(["_trashedAt"]), N(this, A, G).call(this, t.Id, "Info._trashedAt"));
      }
      s != null && (N(this, A, lt).call(this, s, t.Id), N(this, A, G).call(this, s, "innerEntryList")), N(this, A, Oe).call(this, i.Id, t.Id), N(this, A, G).call(this, i.Id, "innerEntryList"), N(this, A, G).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const i = N(this, A, Qt).call(this, t);
    if (i.length === 0)
      return;
    const n = Us(null, null, i.length);
    i.forEach((s, o) => {
      S(this, $).api.val(["Entries", s.Id, "outerPlacement"]).set(B.s.con({ outerItemId: t, OrderKey: n[o] })), N(this, A, G).call(this, s.Id, "outerItem");
    });
  }
  /**** deleteEntry — move entry to trash ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new ue("delete-not-permitted", "this entry cannot be deleted");
    const i = this._outerItemIdOf(t.Id), n = N(this, A, Lr).call(this, ve), s = $e(n, null);
    this.transact(() => {
      S(this, $).api.val(["Entries", t.Id, "outerPlacement"]).set(B.s.con({ outerItemId: ve, OrderKey: s })), N(this, A, Jl).call(this, t.Id), S(this, $).api.obj(["Entries", t.Id, "Info"]).set({ _trashedAt: B.s.val(B.s.json(Date.now())) }), i != null && (N(this, A, lt).call(this, i, t.Id), N(this, A, G).call(this, i, "innerEntryList")), N(this, A, Oe).call(this, ve, t.Id), N(this, A, G).call(this, ve, "innerEntryList"), N(this, A, G).call(this, t.Id, "outerItem"), N(this, A, G).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry from trash ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== ve)
      throw new ue("purge-not-in-trash", "only direct children of TrashItem can be purged");
    if (N(this, A, Zl).call(this, t.Id))
      throw new ue("purge-protected", "entry is protected by incoming links and cannot be purged");
    this.transact(() => {
      N(this, A, Js).call(this, t.Id);
    });
  }
  /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    var u, l;
    const i = t ?? S(this, rn);
    if (i == null)
      return 0;
    const n = Date.now(), s = N(this, A, W).call(this), o = Array.from(S(this, Ie).get(ve) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const c of o) {
      const h = s.Entries[c];
      if (h == null || ((u = h.outerPlacement) == null ? void 0 : u.outerItemId) !== ve)
        continue;
      const p = (l = h.Info) == null ? void 0 : l._trashedAt;
      if (typeof p == "number" && !(n - p < i))
        try {
          this.purgeEntry(N(this, A, Se).call(this, c)), a++;
        } catch {
        }
    }
    return a;
  }
  /**** dispose — clean up resources ****/
  dispose() {
    S(this, tt) != null && (clearInterval(S(this, tt)), H(this, tt, null)), S(this, Vt).clear();
  }
  //----------------------------------------------------------------------------//
  //                             Change Tracking                                //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback within transaction ****/
  transact(t) {
    const i = S(this, sn) === 0;
    ri(this, sn)._++;
    try {
      t();
    } finally {
      if (ri(this, sn)._--, i) {
        const n = S(this, $).api.flush();
        if (!S(this, Bt))
          try {
            const a = n.toBinary();
            a.byteLength > 0 && S(this, on).push(a);
          } catch {
          }
        const s = S(this, pt), o = S(this, Bt) ? "external" : "internal";
        H(this, pt, {}), N(this, A, Wl).call(this, o, s);
      }
    }
  }
  /**** onChangeInvoke — register change listener ****/
  onChangeInvoke(t) {
    return S(this, Vt).add(t), () => {
      S(this, Vt).delete(t);
    };
  }
  /**** applyRemotePatch — apply external patch to model ****/
  applyRemotePatch(t) {
    H(this, Bt, !0);
    try {
      this.transact(() => {
        if (t instanceof Uint8Array) {
          if (t.byteLength === 0)
            return;
          let i;
          try {
            i = N(this, A, ql).call(this, t);
          } catch {
            i = [t];
          }
          for (const n of i) {
            const s = Tf.Patch.fromBinary(n);
            try {
              S(this, $).applyPatch(s);
            } catch (o) {
              S(this, an) != null && S(this, an).call(this, o);
            }
          }
        } else
          S(this, $).applyPatch(t);
        N(this, A, zl).call(this);
      });
    } finally {
      H(this, Bt, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get current sync position ****/
  get currentCursor() {
    return N(this, A, Ll).call(this, S(this, on).length);
  }
  /**** exportPatch — export patches since given cursor ****/
  exportPatch(t) {
    const i = t != null ? N(this, A, Ml).call(this, t) : 0, n = S(this, on).slice(i);
    return N(this, A, Dl).call(this, n);
  }
  /**** recoverOrphans — move orphaned entries to LostAndFound ****/
  recoverOrphans() {
    this.transact(() => {
      var n;
      const t = N(this, A, W).call(this).Entries, i = new Set(Object.keys(t));
      for (const [s, o] of Object.entries(t)) {
        const a = (n = o.outerPlacement) == null ? void 0 : n.outerItemId;
        if (a && !i.has(a)) {
          const u = $e(N(this, A, Lr).call(this, Ae), null);
          S(this, $).api.val(["Entries", s, "outerPlacement"]).set(B.s.con({ outerItemId: Ae, OrderKey: u })), N(this, A, lt).call(this, a, s), N(this, A, Oe).call(this, Ae, s), N(this, A, G).call(this, a, "innerEntryList"), N(this, A, G).call(this, Ae, "innerEntryList"), N(this, A, G).call(this, s, "outerItem");
        }
        if (o.Kind === "link") {
          const u = o.TargetId;
          if (u && !i.has(u)) {
            const l = $e(N(this, A, Lr).call(this, Ae), null);
            S(this, $).api.obj(["Entries"]).set({ [u]: B.s.obj({
              Kind: B.s.con("item"),
              outerPlacement: B.s.val(B.s.con({ outerItemId: Ae, OrderKey: l })),
              Label: B.s.val(B.s.str("")),
              Info: B.s.obj({}),
              MIMEType: B.s.val(B.s.str("")),
              ValueKind: B.s.val(B.s.str("none"))
            }) }), N(this, A, Oe).call(this, Ae, u), i.add(u), N(this, A, G).call(this, Ae, "innerEntryList");
          }
        }
      }
    });
  }
  /**** asBinary — serialize store to gzipped binary ****/
  asBinary() {
    return Qc(S(this, $).toBinary());
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, i, n) {
    const s = new TextDecoder().decode(ks(t));
    return this.newEntryFromJSONat(JSON.parse(s), i, n);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const i = JSON.stringify(this._EntryAsJSON(t));
    return Qc(new TextEncoder().encode(i));
  }
  //----------------------------------------------------------------------------//
  //                               Proxies                                      //
  //----------------------------------------------------------------------------//
  /**** get — proxy handler for property access ****/
  get(t, i) {
    return i === "Entries" ? new Proxy(N(this, A, W).call(this).Entries, {
      get: (n, s) => N(this, A, Se).call(this, s),
      set: () => !1,
      deleteProperty: () => !1,
      ownKeys: () => Object.keys(N(this, A, W).call(this).Entries),
      getOwnPropertyDescriptor: (n, s) => {
        if (Object.keys(N(this, A, W).call(this).Entries).includes(String(s)))
          return {
            configurable: !0,
            enumerable: !0,
            value: N(this, A, Se).call(this, String(s))
          };
      }
    }) : N(this, A, W).call(this)[i];
  }
  /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
  set() {
    return !1;
  }
  deleteProperty() {
    return !1;
  }
  ownKeys() {
    return Object.keys(N(this, A, W).call(this));
  }
  getOwnPropertyDescriptor() {
    return {
      configurable: !0,
      enumerable: !0
    };
  }
  //----------------------------------------------------------------------------//
  //              Internal helpers — called by SDS_Entry / Data / Link           //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (data or link) ****/
  _KindOf(t) {
    const i = N(this, A, W).call(this).Entries[t];
    if (i == null)
      throw new ue("not-found", `entry '${t}' not found`);
    return i.Kind;
  }
  /**** _LabelOf — get entry label ****/
  _LabelOf(t) {
    const i = N(this, A, W).call(this).Entries[t];
    return i == null ? "" : String(i.Label ?? "");
  }
  /**** _setLabelOf — set entry label ****/
  _setLabelOf(t, i) {
    gu(i), this.transact(() => {
      N(this, A, W).call(this).Entries[t] != null && (S(this, $).api.obj(["Entries", t]).set({ Label: i }), N(this, A, G).call(this, t, "Label"));
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const i = N(this, A, W).call(this).Entries[t], n = (i == null ? void 0 : i.MIMEType) ?? "";
    return n === "" ? Wt : n;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, i) {
    Es(i);
    const n = i === Wt ? "" : i;
    this.transact(() => {
      S(this, $).api.obj(["Entries", t]).set({ MIMEType: n }), N(this, A, G).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get value storage kind ****/
  _ValueKindOf(t) {
    const i = N(this, A, W).call(this).Entries[t];
    return (i == null ? void 0 : i.ValueKind) ?? "none";
  }
  /**** _readValueOf — read entry value ****/
  async _readValueOf(t) {
    const i = this._ValueKindOf(t);
    switch (!0) {
      case i === "none":
        return;
      case i === "literal": {
        const n = N(this, A, W).call(this).Entries[t], s = n == null ? void 0 : n.literalValue;
        return String(s ?? "");
      }
      case i === "binary": {
        const n = N(this, A, W).call(this).Entries[t];
        return n == null ? void 0 : n.binaryValue;
      }
      default: {
        const n = this._getValueRefOf(t);
        if (n == null)
          return;
        const s = await this._getValueBlobAsync(n.Hash);
        return s == null ? void 0 : i === "literal-reference" ? new TextDecoder().decode(s) : s;
      }
    }
  }
  /**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/
  _currentValueOf(t) {
    const i = this._ValueKindOf(t);
    switch (!0) {
      case i === "literal": {
        const n = N(this, A, W).call(this).Entries[t];
        return String((n == null ? void 0 : n.literalValue) ?? "");
      }
      case i === "binary": {
        const n = N(this, A, W).call(this).Entries[t];
        return n == null ? void 0 : n.binaryValue;
      }
      default:
        return;
    }
  }
  /**** _writeValueOf — write entry value ****/
  _writeValueOf(t, i) {
    this.transact(() => {
      if (N(this, A, W).call(this).Entries[t] != null) {
        switch (!0) {
          case i == null: {
            S(this, $).api.obj(["Entries", t]).set({ ValueKind: B.s.val(B.s.str("none")) });
            break;
          }
          case (typeof i == "string" && i.length <= S(this, Zr)): {
            S(this, $).api.obj(["Entries", t]).set({
              ValueKind: B.s.val(B.s.str("literal")),
              literalValue: i
            });
            break;
          }
          case typeof i == "string": {
            const o = new TextEncoder().encode(i), a = tn._BLOBhash(o);
            this._storeValueBlob(a, o), S(this, $).api.obj(["Entries", t]).set({
              ValueKind: B.s.val(B.s.str("literal-reference")),
              ValueRef: { Hash: a, Size: o.byteLength }
            });
            break;
          }
          case i.byteLength <= ph: {
            S(this, $).api.obj(["Entries", t]).set({
              ValueKind: B.s.val(B.s.str("binary")),
              binaryValue: i
            });
            break;
          }
          default: {
            const s = i, o = tn._BLOBhash(s);
            this._storeValueBlob(o, s), S(this, $).api.obj(["Entries", t]).set({
              ValueKind: B.s.val(B.s.str("binary-reference")),
              ValueRef: { Hash: o, Size: s.byteLength }
            });
            break;
          }
        }
        N(this, A, G).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value in-place ****/
  _spliceValueOf(t, i, n, s) {
    if (this._ValueKindOf(t) !== "literal")
      throw new ue("change-value-not-literal", "changeValue only works on items with ValueKind literal");
    this.transact(() => {
      var l;
      const a = String(((l = N(this, A, W).call(this).Entries[t]) == null ? void 0 : l.literalValue) ?? ""), u = a.slice(0, i) + s + a.slice(i + n);
      this._writeValueOf(t, u);
    });
  }
  /**** _innerEntriesOf — get sorted inner entries ****/
  _innerEntriesOf(t) {
    return N(this, A, Qt).call(this, t).map((i) => N(this, A, Se).call(this, i.Id));
  }
  /**** _outerItemIdOf — get outer data id ****/
  _outerItemIdOf(t) {
    var s;
    const i = N(this, A, W).call(this).Entries[t];
    return ((s = i == null ? void 0 : i.outerPlacement) == null ? void 0 : s.outerItemId) ?? void 0;
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const i = this._ValueKindOf(t);
    if (i !== "literal-reference" && i !== "binary-reference")
      return;
    const n = N(this, A, W).call(this).Entries[t], s = n == null ? void 0 : n.ValueRef;
    if (s != null)
      return typeof s == "string" ? JSON.parse(s) : s;
  }
  /**** _InfoProxyOf — get proxy for metadata access ****/
  _InfoProxyOf(t) {
    const i = this;
    return new Proxy({}, {
      get(n, s) {
        var a, u;
        if (typeof s != "string")
          return;
        const o = (u = N(a = i, A, W).call(a).Entries[t]) == null ? void 0 : u.Info;
        return o == null ? void 0 : o[s];
      },
      set(n, s, o) {
        return typeof s != "string" ? !1 : o === void 0 ? (i.transact(() => {
          var u, l, c;
          const a = (l = N(u = i, A, W).call(u).Entries[t]) == null ? void 0 : l.Info;
          a != null && s in a && (S(i, $).api.obj(["Entries", t, "Info"]).del([s]), N(c = i, A, G).call(c, t, `Info.${s}`));
        }), !0) : (ed(s), td(o), i.transact(() => {
          var a;
          S(i, $).api.obj(["Entries", t, "Info"]).set({ [s]: o }), N(a = i, A, G).call(a, t, `Info.${s}`);
        }), !0);
      },
      deleteProperty(n, s) {
        return typeof s != "string" ? !1 : (i.transact(() => {
          var a, u, l;
          const o = (u = N(a = i, A, W).call(a).Entries[t]) == null ? void 0 : u.Info;
          o != null && s in o && (S(i, $).api.obj(["Entries", t, "Info"]).del([s]), N(l = i, A, G).call(l, t, `Info.${s}`));
        }), !0);
      },
      ownKeys() {
        var s, o;
        const n = (o = N(s = i, A, W).call(s).Entries[t]) == null ? void 0 : o.Info;
        return n != null ? Object.keys(n) : [];
      },
      getOwnPropertyDescriptor(n, s) {
        var a, u;
        if (typeof s != "string")
          return;
        const o = (u = N(a = i, A, W).call(a).Entries[t]) == null ? void 0 : u.Info;
        if (!(o == null || !(s in o)))
          return { configurable: !0, enumerable: !0, value: o[s] };
      },
      has(n, s) {
        var a, u;
        if (typeof s != "string")
          return !1;
        const o = (u = N(a = i, A, W).call(a).Entries[t]) == null ? void 0 : u.Info;
        return o != null && s in o;
      }
    });
  }
  /**** _TargetOf — get link target data ****/
  _TargetOf(t) {
    const i = N(this, A, W).call(this).Entries[t], n = i == null ? void 0 : i.TargetId;
    if (n == null || n === "")
      throw new ue("not-found", `link '${t}' has no target`);
    return N(this, A, Se).call(this, n);
  }
  /**** _mayMoveEntryTo — check if move is valid ****/
  _mayMoveEntryTo(t, i, n) {
    return !(t === Qe || (t === ve || t === Ae) && i !== Qe || N(this, A, Gl).call(this, t, i));
  }
  /**** _mayDeleteEntry — check if entry can be deleted ****/
  _mayDeleteEntry(t) {
    return !(t === Qe || t === ve || t === Ae);
  }
};
$ = new WeakMap(), Zr = new WeakMap(), rn = new WeakMap(), tt = new WeakMap(), Vt = new WeakMap(), Ie = new WeakMap(), dt = new WeakMap(), ft = new WeakMap(), ze = new WeakMap(), Ze = new WeakMap(), vi = new WeakMap(), sn = new WeakMap(), pt = new WeakMap(), on = new WeakMap(), Bt = new WeakMap(), an = new WeakMap(), A = new WeakSet(), /**** #encodeUint32 — encode 32-bit integer as bytes ****/
Ll = function(t) {
  const i = new Uint8Array(4);
  return new DataView(i.buffer).setUint32(0, t >>> 0, !1), i;
}, /**** #decodeUint32 — decode 32-bit integer from bytes ****/
Ml = function(t) {
  return t.byteLength < 4 ? 0 : new DataView(t.buffer, t.byteOffset, 4).getUint32(0, !1);
}, /**** #encodePatchArray — encode array of patches ****/
Dl = function(t) {
  const i = 4 + t.reduce((a, u) => a + 4 + u.byteLength, 0), n = new Uint8Array(i), s = new DataView(n.buffer);
  s.setUint32(0, t.length, !1);
  let o = 4;
  for (const a of t)
    s.setUint32(o, a.byteLength, !1), o += 4, n.set(a, o), o += a.byteLength;
  return n;
}, /**** #decodePatchArray — decode array of patches ****/
ql = function(t) {
  const i = new DataView(t.buffer, t.byteOffset, t.byteLength), n = i.getUint32(0, !1), s = [];
  let o = 4;
  for (let a = 0; a < n; a++) {
    const u = i.getUint32(o, !1);
    o += 4, s.push(t.slice(o, o + u)), o += u;
  }
  return s;
}, //----------------------------------------------------------------------------//
//                             Private Helpers                                //
//----------------------------------------------------------------------------//
/**** #collectEntryIds — build old-to-new UUID mapping for an entire subtree ****/
Fs = function(t, i) {
  if (i.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const n of t.innerEntries)
      N(this, A, Fs).call(this, n, i);
}, /**** #importEntryFromJSON — recursively import a JSON entry with index updates ****/
Hs = function(t, i, n, s) {
  const o = s.get(t.Id) ?? t.Id, a = {};
  for (const c of Object.keys(t.Info ?? {}))
    a[c] = B.s.con(t.Info[c]);
  if (t.Kind === "link") {
    const c = s.get(t.TargetId) ?? t.TargetId;
    S(this, $).api.obj(["Entries"]).set({ [o]: B.s.obj({
      Kind: B.s.con("link"),
      outerPlacement: B.s.val(B.s.con({ outerItemId: i, OrderKey: n })),
      Label: B.s.val(B.s.str(t.Label ?? "")),
      Info: B.s.obj(a),
      TargetId: B.s.con(c)
    }) }), N(this, A, Oe).call(this, i, o), N(this, A, Xt).call(this, c, o), N(this, A, G).call(this, i, "innerEntryList"), N(this, A, G).call(this, o, "outerItem");
    return;
  }
  const u = t.Type === Wt ? "" : t.Type, l = {
    Kind: B.s.con("item"),
    outerPlacement: B.s.val(B.s.con({ outerItemId: i, OrderKey: n })),
    Label: B.s.val(B.s.str(t.Label ?? "")),
    Info: B.s.obj(a),
    MIMEType: B.s.val(B.s.str(u)),
    ValueKind: B.s.val(B.s.str(t.ValueKind ?? "none"))
  };
  switch (!0) {
    case (t.ValueKind === "literal" && t.Value != null):
      l.literalValue = B.s.val(B.s.str(t.Value));
      break;
    case (t.ValueKind === "binary" && t.Value != null):
      l.binaryValue = B.s.con(hu(t.Value));
      break;
  }
  if (S(this, $).api.obj(["Entries"]).set({ [o]: B.s.obj(l) }), N(this, A, Oe).call(this, i, o), N(this, A, G).call(this, i, "innerEntryList"), N(this, A, G).call(this, o, "outerItem"), t.innerEntries.length > 0) {
    const c = Us(null, null, t.innerEntries.length);
    for (let h = 0; h < t.innerEntries.length; h++)
      N(this, A, Hs).call(this, t.innerEntries[h], o, c[h], s);
  }
}, /**** #view — get current model state view ****/
W = function() {
  return S(this, $).api.view();
}, /**** #wrapped — wrap raw entry data in SDS_Entry object ****/
Se = function(t) {
  const n = N(this, A, W).call(this).Entries[t];
  if (n == null)
    return null;
  const s = n.Kind;
  switch (!0) {
    case s === "item":
      return N(this, A, Ul).call(this, t);
    case s === "link":
      return N(this, A, Fl).call(this, t);
    default:
      return null;
  }
}, /**** #wrappedItem — wrap raw data data in SDS_Item object ****/
Ul = function(t) {
  const i = S(this, Ze).get(t);
  if (i instanceof Mo)
    return i;
  const n = new Mo(this, t);
  return N(this, A, zs).call(this, t, n), n;
}, /**** #wrappedLink — wrap raw link data in SDS_Link object ****/
Fl = function(t) {
  const i = S(this, Ze).get(t);
  if (i instanceof Do)
    return i;
  const n = new Do(this, t);
  return N(this, A, zs).call(this, t, n), n;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
zs = function(t, i) {
  if (S(this, Ze).size >= S(this, vi)) {
    const n = S(this, Ze).keys().next().value;
    n != null && S(this, Ze).delete(n);
  }
  S(this, Ze).set(t, i);
}, /**** #rebuildIndices — rebuild all indices from scratch ****/
Hl = function() {
  var i;
  S(this, Ie).clear(), S(this, dt).clear(), S(this, ft).clear(), S(this, ze).clear();
  const t = N(this, A, W).call(this).Entries;
  for (const [n, s] of Object.entries(t)) {
    const o = (i = s.outerPlacement) == null ? void 0 : i.outerItemId;
    if (o && N(this, A, Oe).call(this, o, n), s.Kind === "link") {
      const a = s.TargetId;
      a && N(this, A, Xt).call(this, a, n);
    }
  }
}, /**** #updateIndicesFromView — update indices after patch applied ****/
zl = function() {
  var o;
  const t = /* @__PURE__ */ new Set(), i = N(this, A, W).call(this).Entries;
  for (const [a, u] of Object.entries(i)) {
    t.add(a);
    const l = (o = u.outerPlacement) == null ? void 0 : o.outerItemId, c = S(this, dt).get(a);
    switch (l !== c && (c != null && (N(this, A, lt).call(this, c, a), N(this, A, G).call(this, c, "innerEntryList")), l != null && (N(this, A, Oe).call(this, l, a), N(this, A, G).call(this, l, "innerEntryList")), N(this, A, G).call(this, a, "outerItem")), !0) {
      case u.Kind === "link": {
        const h = u.TargetId, g = S(this, ze).get(a);
        h !== g && (g != null && N(this, A, Br).call(this, g, a), h != null && N(this, A, Xt).call(this, h, a));
        break;
      }
      case S(this, ze).has(a):
        N(this, A, Br).call(this, S(this, ze).get(a), a);
        break;
    }
    N(this, A, G).call(this, a, "Label");
  }
  const n = Array.from(S(this, dt).entries()).filter(([a]) => !t.has(a));
  for (const [a, u] of n)
    N(this, A, lt).call(this, u, a), N(this, A, G).call(this, u, "innerEntryList");
  const s = Array.from(S(this, ze).entries()).filter(([a]) => !t.has(a));
  for (const [a, u] of s)
    N(this, A, Br).call(this, u, a);
}, /**** #addToReverseIndex — add entry to outer-data index ****/
Oe = function(t, i) {
  let n = S(this, Ie).get(t);
  n == null && (n = /* @__PURE__ */ new Set(), S(this, Ie).set(t, n)), n.add(i), S(this, dt).set(i, t);
}, /**** #removeFromReverseIndex — remove entry from outer-data index ****/
lt = function(t, i) {
  var n;
  (n = S(this, Ie).get(t)) == null || n.delete(i), S(this, dt).delete(i);
}, /**** #addToLinkTargetIndex — add link to target index ****/
Xt = function(t, i) {
  let n = S(this, ft).get(t);
  n == null && (n = /* @__PURE__ */ new Set(), S(this, ft).set(t, n)), n.add(i), S(this, ze).set(i, t);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
Br = function(t, i) {
  var n;
  (n = S(this, ft).get(t)) == null || n.delete(i), S(this, ze).delete(i);
}, /**** #OrderKeyAt — generate order key for insertion position ****/
Yt = function(t, i) {
  const n = (a) => {
    if (a.length === 0 || i == null) {
      const l = a.length > 0 ? a[a.length - 1].OrderKey : null;
      return $e(l, null);
    }
    const u = Math.max(0, Math.min(i, a.length));
    return $e(
      u > 0 ? a[u - 1].OrderKey : null,
      u < a.length ? a[u].OrderKey : null
    );
  };
  let s = N(this, A, Qt).call(this, t);
  const o = n(s);
  return o.length <= gh ? o : (this._rebalanceInnerEntriesOf(t), n(N(this, A, Qt).call(this, t)));
}, /**** #lastOrderKeyOf — get order key of last inner entry ****/
Lr = function(t) {
  const i = N(this, A, Qt).call(this, t);
  return i.length > 0 ? i[i.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries ****/
Qt = function(t) {
  var o, a;
  const i = S(this, Ie).get(t) ?? /* @__PURE__ */ new Set(), n = [], s = N(this, A, W).call(this).Entries;
  for (const u of i) {
    const l = s[u];
    ((o = l.outerPlacement) == null ? void 0 : o.outerItemId) === t && n.push({
      Id: u,
      OrderKey: ((a = l.outerPlacement) == null ? void 0 : a.OrderKey) ?? ""
    });
  }
  return n.sort(
    (u, l) => u.OrderKey < l.OrderKey ? -1 : u.OrderKey > l.OrderKey ? 1 : u.Id < l.Id ? -1 : u.Id > l.Id ? 1 : 0
  ), n;
}, /**** #isProtected — check if entry is protected by incoming links ****/
Zl = function(t) {
  const i = N(this, A, Ks).call(this), n = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const o of S(this, Ie).get(ve) ?? /* @__PURE__ */ new Set())
      n.has(o) || N(this, A, Zs).call(this, o, i, n) && (n.add(o), s = !0);
  }
  return n.has(t);
}, /**** #SubtreeHasIncomingLinks — check for incoming links to subtree ****/
Zs = function(t, i, n) {
  const s = [t], o = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const a = s.pop();
    if (o.has(a))
      continue;
    o.add(a);
    const u = S(this, ft).get(a) ?? /* @__PURE__ */ new Set();
    for (const l of u) {
      if (i.has(l))
        return !0;
      const c = N(this, A, Kl).call(this, l);
      if (c != null && n.has(c))
        return !0;
    }
    for (const l of S(this, Ie).get(a) ?? /* @__PURE__ */ new Set())
      o.has(l) || s.push(l);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
Kl = function(t) {
  let i = t;
  for (; i != null; ) {
    const n = this._outerItemIdOf(i);
    if (n === ve)
      return i;
    if (n === Qe || n == null)
      return null;
    i = n;
  }
  return null;
}, /**** #reachableFromRoot — compute reachable entries from root ****/
Ks = function() {
  const t = /* @__PURE__ */ new Set(), i = [Qe];
  for (; i.length > 0; ) {
    const n = i.pop();
    if (!t.has(n)) {
      t.add(n);
      for (const s of S(this, Ie).get(n) ?? /* @__PURE__ */ new Set())
        t.has(s) || i.push(s);
    }
  }
  return t;
}, /**** #purgeSubtree — recursively purge entry and children ****/
Js = function(t) {
  var l;
  const i = N(this, A, W).call(this).Entries[t];
  if (i == null)
    return;
  const n = i.Kind, s = (l = i.outerPlacement) == null ? void 0 : l.outerItemId, o = N(this, A, Ks).call(this), a = /* @__PURE__ */ new Set(), u = Array.from(S(this, Ie).get(t) ?? /* @__PURE__ */ new Set());
  for (const c of u)
    if (N(this, A, Zs).call(this, c, o, a)) {
      const h = $e(N(this, A, Lr).call(this, ve), null);
      S(this, $).api.obj(["Entries", c, "outerPlacement"]).set({
        outerItemId: ve,
        OrderKey: h
      }), N(this, A, lt).call(this, t, c), N(this, A, Oe).call(this, ve, c), N(this, A, G).call(this, ve, "innerEntryList"), N(this, A, G).call(this, c, "outerItem");
    } else
      N(this, A, Js).call(this, c);
  if (S(this, $).api.obj(["Entries"]).del([t]), s && (N(this, A, lt).call(this, s, t), N(this, A, G).call(this, s, "innerEntryList")), n === "link") {
    const c = i.TargetId;
    c && N(this, A, Br).call(this, c, t);
  }
  S(this, Ze).delete(t);
}, /**** #requireItemExists — throw if data doesn't exist ****/
Ws = function(t) {
  const n = N(this, A, W).call(this).Entries[t];
  if (n == null || n.Kind !== "item")
    throw new ue("invalid-argument", `item '${t}' does not exist`);
}, /**** #ensureInfoExists — create Info object if missing ****/
Jl = function(t) {
  const i = N(this, A, W).call(this).Entries[t];
  (i == null ? void 0 : i.Info) == null && S(this, $).api.obj(["Entries", t]).set({ Info: B.s.obj({}) });
}, /**** #removeInfoIfEmpty — delete Info object if empty ****/
Gf = function(t) {
  const i = N(this, A, W).call(this).Entries[t], n = i == null ? void 0 : i.Info;
  n != null && Object.keys(n).length === 0 && S(this, $).api.obj(["Entries", t]).del(["Info"]);
}, /**** #recordChange — track property change ****/
G = function(t, i) {
  S(this, pt)[t] == null && (S(this, pt)[t] = /* @__PURE__ */ new Set()), S(this, pt)[t].add(i);
}, /**** #notifyHandlers — invoke change listeners ****/
Wl = function(t, i) {
  if (Object.keys(i).length !== 0)
    for (const n of S(this, Vt))
      try {
        n(t, i);
      } catch {
      }
}, /**** #wouldCreateCycle — check if move would create an outer-data cycle ****/
Gl = function(t, i) {
  let n = i;
  for (; n != null; ) {
    if (n === t)
      return !0;
    n = this._outerItemIdOf(n);
  }
  return !1;
};
let nu = tn;
const ru = 1, iu = 2, su = 3, ou = 4, au = 5, He = 32, ui = 1024 * 1024;
function xs(...r) {
  const e = r.reduce((n, s) => n + s.byteLength, 0), t = new Uint8Array(e);
  let i = 0;
  for (const n of r)
    t.set(n, i), i += n.byteLength;
  return t;
}
function Pr(r, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = r, t.set(e, 1), t;
}
function cu(r) {
  const e = new Uint8Array(r.length / 2);
  for (let t = 0; t < r.length; t += 2)
    e[t / 2] = parseInt(r.slice(t, t + 2), 16);
  return e;
}
function uu(r) {
  return Array.from(r).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var nt, rt, Kr, cn, Lt, un, Mt, ln, hn, dn, Jr, pe, Gs, $t, Mr, Xl, Yl, Ql;
class b0 {
  /**** constructor ****/
  constructor(e) {
    D(this, pe);
    jn(this, "StoreId");
    D(this, nt, "disconnected");
    D(this, rt);
    D(this, Kr, "");
    D(this, cn);
    D(this, Lt);
    D(this, un, /* @__PURE__ */ new Set());
    D(this, Mt, /* @__PURE__ */ new Set());
    D(this, ln, /* @__PURE__ */ new Set());
    D(this, hn, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    D(this, dn, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    D(this, Jr, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, nt);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SDS WebSocket: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return H(this, Kr, e), H(this, cn, t), N(this, pe, Gs).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    N(this, pe, Yl).call(this), N(this, pe, Mr).call(this, "disconnected"), (e = S(this, rt)) == null || e.close(), H(this, rt, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    N(this, pe, $t).call(this, Pr(ru, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const i = cu(e);
    if (t.byteLength <= ui)
      N(this, pe, $t).call(this, Pr(iu, xs(i, t)));
    else {
      const n = Math.ceil(t.byteLength / ui);
      for (let s = 0; s < n; s++) {
        const o = s * ui, a = t.slice(o, o + ui), u = new Uint8Array(He + 8);
        u.set(i, 0), new DataView(u.buffer).setUint32(He, s, !1), new DataView(u.buffer).setUint32(He + 4, n, !1), N(this, pe, $t).call(this, Pr(au, xs(u, a)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    N(this, pe, $t).call(this, Pr(su, cu(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return S(this, un).add(e), () => {
      S(this, un).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return S(this, Mt).add(e), () => {
      S(this, Mt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, ln).add(e), () => {
      S(this, ln).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    N(this, pe, $t).call(this, Pr(ou, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return S(this, hn).add(e), () => {
      S(this, hn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return S(this, Jr);
  }
}
nt = new WeakMap(), rt = new WeakMap(), Kr = new WeakMap(), cn = new WeakMap(), Lt = new WeakMap(), un = new WeakMap(), Mt = new WeakMap(), ln = new WeakMap(), hn = new WeakMap(), dn = new WeakMap(), Jr = new WeakMap(), pe = new WeakSet(), /**** #doConnect ****/
Gs = function() {
  return new Promise((e, t) => {
    const n = `${S(this, Kr).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(S(this, cn).Token)}`, s = new WebSocket(n);
    s.binaryType = "arraybuffer", H(this, rt, s), N(this, pe, Mr).call(this, "connecting"), s.onopen = () => {
      N(this, pe, Mr).call(this, "connected"), e();
    }, s.onerror = (o) => {
      S(this, nt) === "connecting" && t(new Error("WebSocket connection failed"));
    }, s.onclose = () => {
      H(this, rt, void 0), S(this, nt) !== "disconnected" && (N(this, pe, Mr).call(this, "reconnecting"), N(this, pe, Xl).call(this));
    }, s.onmessage = (o) => {
      N(this, pe, Ql).call(this, new Uint8Array(o.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
$t = function(e) {
  var t;
  ((t = S(this, rt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && S(this, rt).send(e);
}, /**** #setState ****/
Mr = function(e) {
  if (S(this, nt) !== e) {
    H(this, nt, e);
    for (const t of S(this, ln))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Xl = function() {
  var t;
  const e = ((t = S(this, cn)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  H(this, Lt, setTimeout(() => {
    S(this, nt) === "reconnecting" && N(this, pe, Gs).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Yl = function() {
  S(this, Lt) != null && (clearTimeout(S(this, Lt)), H(this, Lt, void 0));
}, /**** #handleFrame ****/
Ql = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], i = e.slice(1);
  switch (t) {
    case ru: {
      for (const n of S(this, un))
        try {
          n(i);
        } catch {
        }
      break;
    }
    case iu: {
      if (i.byteLength < He)
        return;
      const n = uu(i.slice(0, He)), s = i.slice(He);
      for (const o of S(this, Mt))
        try {
          o(n, s);
        } catch {
        }
      break;
    }
    case su:
      break;
    case ou: {
      try {
        const n = JSON.parse(new TextDecoder().decode(i));
        if (typeof n.PeerId != "string")
          break;
        n.lastSeen = Date.now(), S(this, Jr).set(n.PeerId, n);
        for (const s of S(this, hn))
          try {
            s(n.PeerId, n);
          } catch {
          }
      } catch {
      }
      break;
    }
    case au: {
      if (i.byteLength < He + 8)
        return;
      const n = uu(i.slice(0, He)), s = new DataView(i.buffer, i.byteOffset + He, 8), o = s.getUint32(0, !1), a = s.getUint32(4, !1), u = i.slice(He + 8);
      let l = S(this, dn).get(n);
      if (l == null && (l = { total: a, chunks: /* @__PURE__ */ new Map() }, S(this, dn).set(n, l)), l.chunks.set(o, u), l.chunks.size === l.total) {
        const c = xs(
          ...Array.from({ length: l.total }, (h, g) => l.chunks.get(g))
        );
        S(this, dn).delete(n);
        for (const h of S(this, Mt))
          try {
            h(n, c);
          } catch {
          }
      }
      break;
    }
  }
};
var Wr, Me, _e, yt, Ke, De, gt, fn, pn, yn, Dt, gn, Ce, ne, Dr, qr, $l, eh, th, Xs, Ys, nh, Qs, rh;
class w0 {
  /**** Constructor ****/
  constructor(e, t = {}) {
    D(this, ne);
    jn(this, "StoreId");
    D(this, Wr);
    D(this, Me, crypto.randomUUID());
    D(this, _e);
    /**** Signalling WebSocket ****/
    D(this, yt);
    /**** active RTCPeerConnection per remote PeerId ****/
    D(this, Ke, /* @__PURE__ */ new Map());
    D(this, De, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    D(this, gt, "disconnected");
    /**** Event Handlers ****/
    D(this, fn, /* @__PURE__ */ new Set());
    D(this, pn, /* @__PURE__ */ new Set());
    D(this, yn, /* @__PURE__ */ new Set());
    D(this, Dt, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    D(this, gn, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    D(this, Ce, !1);
    this.StoreId = e, H(this, Wr, t), H(this, _e, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, gt);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(e))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${e}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((i, n) => {
      const s = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(s);
      H(this, yt, o), N(this, ne, Dr).call(this, "connecting"), o.onopen = () => {
        N(this, ne, Dr).call(this, "connected"), N(this, ne, qr).call(this, { type: "hello", from: S(this, Me) }), i();
      }, o.onerror = () => {
        if (!S(this, Ce) && S(this, _e) != null) {
          const a = e.replace("/signal/", "/ws/");
          H(this, Ce, !0), S(this, _e).connect(a, t).then(i).catch(n);
        } else
          n(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        S(this, gt) !== "disconnected" && (N(this, ne, Dr).call(this, "reconnecting"), setTimeout(() => {
          S(this, gt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (a) => {
        try {
          const u = JSON.parse(a.data);
          N(this, ne, $l).call(this, u, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    N(this, ne, Dr).call(this, "disconnected"), (e = S(this, yt)) == null || e.close(), H(this, yt, void 0);
    for (const t of S(this, Ke).values())
      t.close();
    S(this, Ke).clear(), S(this, De).clear(), S(this, Ce) && S(this, _e) != null && (S(this, _e).disconnect(), H(this, Ce, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var i;
    if (S(this, Ce)) {
      (i = S(this, _e)) == null || i.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const n of S(this, De).values())
      if (n.readyState === "open")
        try {
          n.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var s;
    if (S(this, Ce)) {
      (s = S(this, _e)) == null || s.sendValue(e, t);
      return;
    }
    const i = N(this, ne, Qs).call(this, e), n = new Uint8Array(33 + t.byteLength);
    n[0] = 2, n.set(i, 1), n.set(t, 33);
    for (const o of S(this, De).values())
      if (o.readyState === "open")
        try {
          o.send(n);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var n;
    if (S(this, Ce)) {
      (n = S(this, _e)) == null || n.requestValue(e);
      return;
    }
    const t = N(this, ne, Qs).call(this, e), i = new Uint8Array(33);
    i[0] = 3, i.set(t, 1);
    for (const s of S(this, De).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return S(this, fn).add(e), S(this, Ce) && S(this, _e) != null ? S(this, _e).onPatch(e) : () => {
      S(this, fn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return S(this, pn).add(e), S(this, Ce) && S(this, _e) != null ? S(this, _e).onValue(e) : () => {
      S(this, pn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, yn).add(e), () => {
      S(this, yn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var n;
    if (S(this, Ce)) {
      (n = S(this, _e)) == null || n.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), i = new Uint8Array(1 + t.byteLength);
    i[0] = 4, i.set(t, 1);
    for (const s of S(this, De).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return S(this, Dt).add(e), () => {
      S(this, Dt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return S(this, gn);
  }
}
Wr = new WeakMap(), Me = new WeakMap(), _e = new WeakMap(), yt = new WeakMap(), Ke = new WeakMap(), De = new WeakMap(), gt = new WeakMap(), fn = new WeakMap(), pn = new WeakMap(), yn = new WeakMap(), Dt = new WeakMap(), gn = new WeakMap(), Ce = new WeakMap(), ne = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
Dr = function(e) {
  if (S(this, gt) !== e) {
    H(this, gt, e);
    for (const t of S(this, yn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
qr = function(e) {
  var t;
  ((t = S(this, yt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && S(this, yt).send(JSON.stringify(e));
}, $l = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === S(this, Me))
        return;
      S(this, Ke).has(e.from) || await N(this, ne, eh).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== S(this, Me))
        return;
      await N(this, ne, th).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== S(this, Me))
        return;
      const i = S(this, Ke).get(e.from);
      i != null && await i.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== S(this, Me))
        return;
      const i = S(this, Ke).get(e.from);
      i != null && await i.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, eh = async function(e) {
  const t = N(this, ne, Xs).call(this, e), i = t.createDataChannel("sds", { ordered: !1, maxRetransmits: 0 });
  N(this, ne, Ys).call(this, i, e), S(this, De).set(e, i);
  const n = await t.createOffer();
  await t.setLocalDescription(n), N(this, ne, qr).call(this, { type: "offer", from: S(this, Me), to: e, sdp: n });
}, th = async function(e, t) {
  const i = N(this, ne, Xs).call(this, e);
  await i.setRemoteDescription(new RTCSessionDescription(t));
  const n = await i.createAnswer();
  await i.setLocalDescription(n), N(this, ne, qr).call(this, { type: "answer", from: S(this, Me), to: e, sdp: n });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Xs = function(e) {
  const t = S(this, Wr).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], i = new RTCPeerConnection({ iceServers: t });
  return S(this, Ke).set(e, i), i.onicecandidate = (n) => {
    n.candidate != null && N(this, ne, qr).call(this, {
      type: "candidate",
      from: S(this, Me),
      to: e,
      candidate: n.candidate.toJSON()
    });
  }, i.ondatachannel = (n) => {
    N(this, ne, Ys).call(this, n.channel, e), S(this, De).set(e, n.channel);
  }, i.onconnectionstatechange = () => {
    if (i.connectionState === "failed" || i.connectionState === "closed") {
      S(this, Ke).delete(e), S(this, De).delete(e), S(this, gn).delete(e);
      for (const n of S(this, Dt))
        try {
          n(e, void 0);
        } catch {
        }
    }
  }, i;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
Ys = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (i) => {
    const n = new Uint8Array(i.data);
    N(this, ne, nh).call(this, n, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
nh = function(e, t) {
  if (e.byteLength < 1)
    return;
  const i = e[0], n = e.slice(1);
  switch (i) {
    case 1: {
      for (const s of S(this, fn))
        try {
          s(n);
        } catch {
        }
      break;
    }
    case 2: {
      if (n.byteLength < 32)
        return;
      const s = N(this, ne, rh).call(this, n.slice(0, 32)), o = n.slice(32);
      for (const a of S(this, pn))
        try {
          a(s, o);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const s = JSON.parse(new TextDecoder().decode(n));
        if (typeof s.PeerId != "string")
          break;
        s.lastSeen = Date.now(), S(this, gn).set(s.PeerId, s);
        for (const o of S(this, Dt))
          try {
            o(s.PeerId, s);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
Qs = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let i = 0; i < e.length; i += 2)
    t[i / 2] = parseInt(e.slice(i, i + 2), 16);
  return t;
}, /**** #bytesToHex ****/
rh = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Be(r) {
  return new Promise((e, t) => {
    r.onsuccess = () => {
      e(r.result);
    }, r.onerror = () => {
      t(r.error);
    };
  });
}
function ut(r, e, t) {
  return r.transaction(e, t);
}
var it, qe, Gr, Ue, Ye;
class _0 {
  /**** constructor ****/
  constructor(e) {
    D(this, Ue);
    D(this, it);
    D(this, qe);
    D(this, Gr);
    H(this, qe, e), H(this, Gr, `sds:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await N(this, Ue, Ye).call(this), t = ut(e, ["snapshots"], "readonly"), i = await Be(
      t.objectStore("snapshots").get(S(this, qe))
    );
    return i != null ? i.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await N(this, Ue, Ye).call(this), i = ut(t, ["snapshots"], "readwrite");
    await Be(
      i.objectStore("snapshots").put({
        storeId: S(this, qe),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await N(this, Ue, Ye).call(this), n = ut(t, ["patches"], "readonly").objectStore("patches"), s = IDBKeyRange.bound(
      [S(this, qe), e + 1],
      [S(this, qe), Number.MAX_SAFE_INTEGER]
    );
    return (await Be(
      n.getAll(s)
    )).sort((a, u) => a.clock - u.clock).map((a) => a.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const i = await N(this, Ue, Ye).call(this), n = ut(i, ["patches"], "readwrite");
    try {
      await Be(
        n.objectStore("patches").add({
          storeId: S(this, qe),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await N(this, Ue, Ye).call(this), n = ut(t, ["patches"], "readwrite").objectStore("patches"), s = IDBKeyRange.bound(
      [S(this, qe), 0],
      [S(this, qe), e - 1]
    );
    await new Promise((o, a) => {
      const u = n.openCursor(s);
      u.onsuccess = () => {
        const l = u.result;
        if (l === null) {
          o();
          return;
        }
        l.delete(), l.continue();
      }, u.onerror = () => {
        a(u.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = await N(this, Ue, Ye).call(this), i = ut(t, ["values"], "readonly"), n = await Be(
      i.objectStore("values").get(e)
    );
    return n != null ? n.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const i = await N(this, Ue, Ye).call(this), s = ut(i, ["values"], "readwrite").objectStore("values"), o = await Be(
      s.get(e)
    );
    o != null ? await Be(
      s.put({ hash: e, data: o.data, ref_count: o.ref_count + 1 })
    ) : await Be(
      s.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await N(this, Ue, Ye).call(this), n = ut(t, ["values"], "readwrite").objectStore("values"), s = await Be(
      n.get(e)
    );
    if (s == null)
      return;
    const o = s.ref_count - 1;
    o <= 0 ? await Be(n.delete(e)) : await Be(
      n.put({ hash: e, data: s.data, ref_count: o })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = S(this, it)) == null || e.close(), H(this, it, void 0);
  }
}
it = new WeakMap(), qe = new WeakMap(), Gr = new WeakMap(), Ue = new WeakSet(), Ye = async function() {
  return S(this, it) != null ? S(this, it) : new Promise((e, t) => {
    const i = indexedDB.open(S(this, Gr), 1);
    i.onupgradeneeded = (n) => {
      const s = n.target.result;
      s.objectStoreNames.contains("snapshots") || s.createObjectStore("snapshots", { keyPath: "storeId" }), s.objectStoreNames.contains("patches") || s.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), s.objectStoreNames.contains("values") || s.createObjectStore("values", { keyPath: "hash" });
    }, i.onsuccess = (n) => {
      H(this, it, n.target.result), e(S(this, it));
    }, i.onerror = (n) => {
      t(n.target.error);
    };
  });
};
const Xf = 512 * 1024;
var be, ge, ae, qt, vn, mn, Xr, Yr, bn, wn, vt, _n, Ut, Ft, Ht, st, mt, Fe, Qr, kn, ot, Je, se, ih, sh, oh, ah, ch, $s, uh, eo, to, lh, no;
class k0 {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    D(this, se);
    D(this, be);
    D(this, ge);
    D(this, ae);
    D(this, qt);
    D(this, vn);
    jn(this, "PeerId", crypto.randomUUID());
    D(this, mn);
    D(this, Xr);
    D(this, Yr, []);
    // outgoing patch queue (patches created while disconnected)
    D(this, bn, 0);
    // accumulated patch bytes since last checkpoint
    D(this, wn, 0);
    // sequence number of the last saved snapshot
    D(this, vt, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    D(this, _n, new Uint8Array(0));
    // heartbeat timer
    D(this, Ut);
    D(this, Ft);
    // presence peer tracking
    D(this, Ht, /* @__PURE__ */ new Map());
    D(this, st, /* @__PURE__ */ new Map());
    D(this, mt, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    D(this, Fe);
    // connection state mirror
    D(this, Qr, "disconnected");
    D(this, kn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    D(this, ot, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    D(this, Je, /* @__PURE__ */ new Map());
    var n;
    H(this, be, e), H(this, ge, t.PersistenceProvider ?? void 0), H(this, ae, t.NetworkProvider ?? void 0), H(this, qt, t.PresenceProvider ?? (typeof ((n = t.NetworkProvider) == null ? void 0 : n.onRemoteState) == "function" ? t.NetworkProvider : void 0)), H(this, vn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && S(this, ae) != null && H(this, Fe, new BroadcastChannel(`sds:${S(this, ae).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    if (S(this, ge) != null) {
      const e = S(this, ge);
      S(this, be).setValueBlobLoader((t) => e.loadValue(t));
    }
    await N(this, se, ih).call(this), N(this, se, sh).call(this), N(this, se, oh).call(this), N(this, se, ah).call(this), N(this, se, ch).call(this), S(this, ae) != null && S(this, ae).onConnectionChange((e) => {
      H(this, Qr, e);
      for (const t of S(this, kn))
        try {
          t(e);
        } catch (i) {
          console.error("[SDS] connection-change handler threw:", i.message ?? i);
        }
      e === "connected" && N(this, se, uh).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, i;
    S(this, Ut) != null && (clearInterval(S(this, Ut)), H(this, Ut, void 0));
    for (const n of S(this, st).values())
      clearTimeout(n);
    S(this, st).clear();
    for (const n of S(this, ot))
      try {
        n();
      } catch {
      }
    H(this, ot, []), (e = S(this, Fe)) == null || e.close(), H(this, Fe, void 0), (t = S(this, ae)) == null || t.disconnect(), S(this, ge) != null && await N(this, se, $s).call(this), await ((i = S(this, ge)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (S(this, ae) == null)
      throw new ue("no-network-provider", "no NetworkProvider configured");
    H(this, mn, e), H(this, Xr, t), await S(this, ae).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (S(this, ae) == null)
      throw new ue("no-network-provider", "no NetworkProvider configured");
    S(this, ae).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (S(this, ae) == null)
      throw new ue("no-network-provider", "no NetworkProvider configured");
    if (S(this, mn) == null)
      throw new ue(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await S(this, ae).connect(S(this, mn), S(this, Xr));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, Qr);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, kn).add(e), () => {
      S(this, kn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var i, n;
    H(this, Ft, e);
    const t = { ...e, PeerId: this.PeerId };
    (i = S(this, qt)) == null || i.sendLocalState(e), (n = S(this, Fe)) == null || n.postMessage({ type: "presence", payload: t, senderId: this.PeerId });
    for (const s of S(this, mt))
      try {
        s(this.PeerId, t, "local");
      } catch (o) {
        console.error("SDS: presence handler failed", o);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return S(this, Ht);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return S(this, mt).add(e), () => {
      S(this, mt).delete(e);
    };
  }
}
be = new WeakMap(), ge = new WeakMap(), ae = new WeakMap(), qt = new WeakMap(), vn = new WeakMap(), mn = new WeakMap(), Xr = new WeakMap(), Yr = new WeakMap(), bn = new WeakMap(), wn = new WeakMap(), vt = new WeakMap(), _n = new WeakMap(), Ut = new WeakMap(), Ft = new WeakMap(), Ht = new WeakMap(), st = new WeakMap(), mt = new WeakMap(), Fe = new WeakMap(), Qr = new WeakMap(), kn = new WeakMap(), ot = new WeakMap(), Je = new WeakMap(), se = new WeakSet(), ih = async function() {
  if (S(this, ge) == null)
    return;
  await S(this, ge).loadSnapshot();
  const e = await S(this, ge).loadPatchesSince(S(this, wn));
  for (const t of e)
    try {
      S(this, be).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && H(this, vt, S(this, wn) + e.length), H(this, _n, S(this, be).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
sh = function() {
  const e = S(this, be).onChangeInvoke((t, i) => {
    var o, a;
    if (t === "external") {
      N(this, se, eo).call(this, i, "request").catch((u) => {
        console.error("[SDS] value-request failed:", u.message ?? u);
      });
      return;
    }
    const n = S(this, _n);
    ri(this, vt)._++;
    const s = S(this, be).exportPatch(n);
    H(this, _n, S(this, be).currentCursor), s.byteLength !== 0 && (S(this, ge) != null && (S(this, ge).appendPatch(s, S(this, vt)).catch((u) => {
      console.error("[SDS] appendPatch failed:", u.message ?? u);
    }), H(this, bn, S(this, bn) + s.byteLength), S(this, bn) >= Xf && N(this, se, $s).call(this).catch((u) => {
      console.error("[SDS] checkpoint failed:", u.message ?? u);
    })), ((o = S(this, ae)) == null ? void 0 : o.ConnectionState) === "connected" ? (S(this, ae).sendPatch(s), (a = S(this, Fe)) == null || a.postMessage({ type: "patch", payload: s, senderId: this.PeerId })) : S(this, Yr).push(s), N(this, se, eo).call(this, i, "send").catch((u) => {
      console.error("[SDS] value-send failed:", u.message ?? u);
    }));
  });
  S(this, ot).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
oh = function() {
  if (S(this, ae) != null) {
    const t = S(this, ae).onPatch((n) => {
      try {
        S(this, be).applyRemotePatch(n);
      } catch {
      }
    });
    S(this, ot).push(t);
    const i = S(this, ae).onValue(async (n, s) => {
      var o;
      S(this, be).storeValueBlob(n, s), await ((o = S(this, ge)) == null ? void 0 : o.saveValue(n, s));
    });
    S(this, ot).push(i);
  }
  const e = S(this, qt);
  if (e != null) {
    const t = e.onRemoteState((i, n) => {
      N(this, se, to).call(this, i, n);
    });
    S(this, ot).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
ah = function() {
  const e = S(this, vn) / 4;
  H(this, Ut, setInterval(() => {
    var t, i;
    if (S(this, Ft) != null) {
      (t = S(this, qt)) == null || t.sendLocalState(S(this, Ft));
      const n = { ...S(this, Ft), PeerId: this.PeerId };
      (i = S(this, Fe)) == null || i.postMessage({ type: "presence", payload: n, senderId: this.PeerId });
    }
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
ch = function() {
  S(this, Fe) != null && (S(this, Fe).onmessage = (e) => {
    const t = e.data;
    if (t.senderId !== this.PeerId)
      switch (!0) {
        case t.type === "patch":
          try {
            S(this, be).applyRemotePatch(t.payload);
          } catch (i) {
            console.error("[SDS] failed to apply BC patch:", i.message ?? i);
          }
          break;
        case t.type === "presence":
          N(this, se, to).call(this, t.payload.PeerId ?? t.senderId ?? "unknown", t.payload);
          break;
      }
  });
}, $s = async function() {
  S(this, ge) != null && (await S(this, ge).saveSnapshot(S(this, be).asBinary()), S(this, ae) != null && (await S(this, ge).prunePatches(S(this, vt)), H(this, wn, S(this, vt))), H(this, bn, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
uh = function() {
  var t;
  const e = S(this, Yr).splice(0);
  for (const i of e)
    try {
      (t = S(this, ae)) == null || t.sendPatch(i);
    } catch (n) {
      console.error("SDS: failed to send queued patch", n);
    }
}, eo = async function(e, t) {
  var i, n, s;
  for (const [o, a] of Object.entries(e)) {
    const u = a;
    if (u.has("Existence")) {
      const g = S(this, Je).get(o);
      g != null && (await ((i = S(this, ge)) == null ? void 0 : i.releaseValue(g)), S(this, Je).delete(o));
    }
    if (!u.has("Value"))
      continue;
    const l = S(this, Je).get(o), c = S(this, be)._getValueRefOf(o), h = c == null ? void 0 : c.Hash;
    if (l != null && l !== h && (await ((n = S(this, ge)) == null ? void 0 : n.releaseValue(l)), S(this, Je).delete(o)), c != null) {
      if (S(this, ae) == null) {
        S(this, Je).set(o, c.Hash);
        continue;
      }
      if (t === "send") {
        const g = S(this, be).getValueBlobByHash(c.Hash);
        g != null && (await ((s = S(this, ge)) == null ? void 0 : s.saveValue(c.Hash, g)), S(this, Je).set(o, c.Hash), S(this, ae).ConnectionState === "connected" && S(this, ae).sendValue(c.Hash, g));
      } else
        S(this, Je).set(o, c.Hash), !S(this, be).hasValueBlob(c.Hash) && S(this, ae).ConnectionState === "connected" && S(this, ae).requestValue(c.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
to = function(e, t) {
  if (t == null) {
    N(this, se, no).call(this, e);
    return;
  }
  const i = { ...t, _lastSeen: Date.now() };
  S(this, Ht).set(e, i), N(this, se, lh).call(this, e);
  for (const n of S(this, mt))
    try {
      n(e, t, "remote");
    } catch (s) {
      console.error("SDS: presence handler failed", s);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
lh = function(e) {
  const t = S(this, st).get(e);
  t != null && clearTimeout(t);
  const i = setTimeout(
    () => {
      N(this, se, no).call(this, e);
    },
    S(this, vn)
  );
  S(this, st).set(e, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
no = function(e) {
  if (!S(this, Ht).has(e))
    return;
  S(this, Ht).delete(e);
  const t = S(this, st).get(e);
  t != null && (clearTimeout(t), S(this, st).delete(e));
  for (const i of S(this, mt))
    try {
      i(e, void 0, "remote");
    } catch (n) {
      console.error("SDS: presence handler failed", n);
    }
};
export {
  _0 as SDS_BrowserPersistenceProvider,
  nu as SDS_DataStore,
  vu as SDS_Entry,
  ue as SDS_Error,
  Mo as SDS_Item,
  Do as SDS_Link,
  k0 as SDS_SyncEngine,
  w0 as SDS_WebRTCProvider,
  b0 as SDS_WebSocketProvider
};
