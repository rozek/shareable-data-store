var oi = Object.defineProperty;
var Dr = (s) => {
  throw TypeError(s);
};
var ci = (s, e, t) => e in s ? oi(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var hn = (s, e, t) => ci(s, typeof e != "symbol" ? e + "" : e, t), Xn = (s, e, t) => e.has(s) || Dr("Cannot " + t);
var o = (s, e, t) => (Xn(s, e, "read from private field"), t ? t.call(s) : e.get(s)), y = (s, e, t) => e.has(s) ? Dr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), b = (s, e, t, n) => (Xn(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t), d = (s, e, t) => (Xn(s, e, "access private method"), t);
var Kn = (s, e, t, n) => ({
  set _(r) {
    b(s, e, r, t);
  },
  get _() {
    return o(s, e, n);
  }
});
import { Loro as er, LoroMap as N, LoroText as F, VersionVector as li } from "loro-crdt";
class R extends Error {
  constructor(t, n) {
    super(n);
    hn(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const le = "00000000-0000-4000-8000-000000000000", $ = "00000000-0000-4000-8000-000000000001", ge = "00000000-0000-4000-8000-000000000002", Lt = "text/plain", di = 131072, ui = 2048, hi = 5e3, jr = 1024, Zr = 256, Kr = 1024, Br = 1048576, fi = 200;
function mi(s) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(s).toString("base64");
  let t = "";
  for (let n = 0; n < s.byteLength; n++)
    t += String.fromCharCode(s[n]);
  return btoa(t);
}
function bs(s) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(s, "base64")) : Uint8Array.from(atob(s), (t) => t.charCodeAt(0));
}
var Fe, Zt, ws;
let gi = (ws = class {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    y(this, Fe, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    y(this, Zt);
  }
  /**** _BLOBhash — FNV-1a 32-bit content hash used as blob identity key ****/
  static _BLOBhash(e) {
    let t = 2166136261;
    for (let n = 0; n < e.length; n++)
      t = Math.imul(t ^ e[n], 16777619) >>> 0;
    return `fnv1a-${t.toString(16).padStart(8, "0")}-${e.length}`;
  }
  /**** _storeValueBlob — cache a blob (called by backends on write) ****/
  _storeValueBlob(e, t) {
    o(this, Fe).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = o(this, Fe).get(e);
    return t == null && o(this, Zt) != null && (t = await o(this, Zt).call(this, e), t != null && o(this, Fe).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    o(this, Fe).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return o(this, Fe).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return o(this, Fe).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    b(this, Zt, e);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/
  newEntryFromJSONat(e, t, n) {
    const r = typeof e == "string" ? JSON.parse(e) : e;
    switch (!0) {
      case (r == null ? void 0 : r.Kind) === "item":
        return this.deserializeItemInto(r, t, n);
      case (r == null ? void 0 : r.Kind) === "link":
        return this.deserializeLinkInto(r, t, n);
      default:
        throw new R("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
    }
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** EntryMayBeMovedTo — true when moving Entry into outerItem at InsertionIndex is allowed ****/
  EntryMayBeMovedTo(e, t, n) {
    return this._mayMoveEntryTo(e.Id, t.Id, n);
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
    return this._EntryAsJSON(le);
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
    let n = this._outerItemIdOf(e);
    for (; n != null && (t.push(this.EntryWithId(n)), n !== le); )
      n = this._outerItemIdOf(n);
    return t;
  }
  /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
  _outerItemIdsOf(e) {
    return this._outerItemChainOf(e).map((t) => t.Id);
  }
  /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
  _EntryAsJSON(e) {
    const t = this._KindOf(e), n = this._LabelOf(e), r = this._InfoProxyOf(e), i = {};
    for (const u of Object.keys(r))
      i[u] = r[u];
    if (t === "link") {
      const u = this._TargetOf(e).Id;
      return { Kind: "link", Id: e, Label: n, TargetId: u, Info: i };
    }
    const a = this._TypeOf(e), c = this._ValueKindOf(e), l = { Kind: "item", Id: e, Label: n, Type: a, ValueKind: c, Info: i, innerEntries: [] };
    if (c === "literal" || c === "binary") {
      const u = this._currentValueOf(e);
      u !== void 0 && (l.Value = typeof u == "string" ? u : mi(u));
    }
    return l.innerEntries = Array.from(this._innerEntriesOf(e)).map((u) => this._EntryAsJSON(u.Id)), l;
  }
}, Fe = new WeakMap(), Zt = new WeakMap(), ws);
var E;
(function(s) {
  s.assertEqual = (r) => {
  };
  function e(r) {
  }
  s.assertIs = e;
  function t(r) {
    throw new Error();
  }
  s.assertNever = t, s.arrayToEnum = (r) => {
    const i = {};
    for (const a of r)
      i[a] = a;
    return i;
  }, s.getValidEnumValues = (r) => {
    const i = s.objectKeys(r).filter((c) => typeof r[r[c]] != "number"), a = {};
    for (const c of i)
      a[c] = r[c];
    return s.objectValues(a);
  }, s.objectValues = (r) => s.objectKeys(r).map(function(i) {
    return r[i];
  }), s.objectKeys = typeof Object.keys == "function" ? (r) => Object.keys(r) : (r) => {
    const i = [];
    for (const a in r)
      Object.prototype.hasOwnProperty.call(r, a) && i.push(a);
    return i;
  }, s.find = (r, i) => {
    for (const a of r)
      if (i(a))
        return a;
  }, s.isInteger = typeof Number.isInteger == "function" ? (r) => Number.isInteger(r) : (r) => typeof r == "number" && Number.isFinite(r) && Math.floor(r) === r;
  function n(r, i = " | ") {
    return r.map((a) => typeof a == "string" ? `'${a}'` : a).join(i);
  }
  s.joinValues = n, s.jsonStringifyReplacer = (r, i) => typeof i == "bigint" ? i.toString() : i;
})(E || (E = {}));
var $r;
(function(s) {
  s.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})($r || ($r = {}));
const v = E.arrayToEnum([
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
]), rt = (s) => {
  switch (typeof s) {
    case "undefined":
      return v.undefined;
    case "string":
      return v.string;
    case "number":
      return Number.isNaN(s) ? v.nan : v.number;
    case "boolean":
      return v.boolean;
    case "function":
      return v.function;
    case "bigint":
      return v.bigint;
    case "symbol":
      return v.symbol;
    case "object":
      return Array.isArray(s) ? v.array : s === null ? v.null : s.then && typeof s.then == "function" && s.catch && typeof s.catch == "function" ? v.promise : typeof Map < "u" && s instanceof Map ? v.map : typeof Set < "u" && s instanceof Set ? v.set : typeof Date < "u" && s instanceof Date ? v.date : v.object;
    default:
      return v.unknown;
  }
}, m = E.arrayToEnum([
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
class Ye extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (n) => {
      this.issues = [...this.issues, n];
    }, this.addIssues = (n = []) => {
      this.issues = [...this.issues, ...n];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(i) {
      return i.message;
    }, n = { _errors: [] }, r = (i) => {
      for (const a of i.issues)
        if (a.code === "invalid_union")
          a.unionErrors.map(r);
        else if (a.code === "invalid_return_type")
          r(a.returnTypeError);
        else if (a.code === "invalid_arguments")
          r(a.argumentsError);
        else if (a.path.length === 0)
          n._errors.push(t(a));
        else {
          let c = n, l = 0;
          for (; l < a.path.length; ) {
            const u = a.path[l];
            l === a.path.length - 1 ? (c[u] = c[u] || { _errors: [] }, c[u]._errors.push(t(a))) : c[u] = c[u] || { _errors: [] }, c = c[u], l++;
          }
        }
    };
    return r(this), n;
  }
  static assert(e) {
    if (!(e instanceof Ye))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, E.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, n = [];
    for (const r of this.issues)
      if (r.path.length > 0) {
        const i = r.path[0];
        t[i] = t[i] || [], t[i].push(e(r));
      } else
        n.push(e(r));
    return { formErrors: n, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Ye.create = (s) => new Ye(s);
const or = (s, e) => {
  let t;
  switch (s.code) {
    case m.invalid_type:
      s.received === v.undefined ? t = "Required" : t = `Expected ${s.expected}, received ${s.received}`;
      break;
    case m.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(s.expected, E.jsonStringifyReplacer)}`;
      break;
    case m.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${E.joinValues(s.keys, ", ")}`;
      break;
    case m.invalid_union:
      t = "Invalid input";
      break;
    case m.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${E.joinValues(s.options)}`;
      break;
    case m.invalid_enum_value:
      t = `Invalid enum value. Expected ${E.joinValues(s.options)}, received '${s.received}'`;
      break;
    case m.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case m.invalid_return_type:
      t = "Invalid function return type";
      break;
    case m.invalid_date:
      t = "Invalid date";
      break;
    case m.invalid_string:
      typeof s.validation == "object" ? "includes" in s.validation ? (t = `Invalid input: must include "${s.validation.includes}"`, typeof s.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${s.validation.position}`)) : "startsWith" in s.validation ? t = `Invalid input: must start with "${s.validation.startsWith}"` : "endsWith" in s.validation ? t = `Invalid input: must end with "${s.validation.endsWith}"` : E.assertNever(s.validation) : s.validation !== "regex" ? t = `Invalid ${s.validation}` : t = "Invalid";
      break;
    case m.too_small:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "more than"} ${s.minimum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "over"} ${s.minimum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "bigint" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s.minimum))}` : t = "Invalid input";
      break;
    case m.too_big:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "less than"} ${s.maximum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "under"} ${s.maximum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "bigint" ? t = `BigInt must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly" : s.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s.maximum))}` : t = "Invalid input";
      break;
    case m.custom:
      t = "Invalid input";
      break;
    case m.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case m.not_multiple_of:
      t = `Number must be a multiple of ${s.multipleOf}`;
      break;
    case m.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, E.assertNever(s);
  }
  return { message: t };
};
let yi = or;
function pi() {
  return yi;
}
const vi = (s) => {
  const { data: e, path: t, errorMaps: n, issueData: r } = s, i = [...t, ...r.path || []], a = {
    ...r,
    path: i
  };
  if (r.message !== void 0)
    return {
      ...r,
      path: i,
      message: r.message
    };
  let c = "";
  const l = n.filter((u) => !!u).slice().reverse();
  for (const u of l)
    c = u(a, { data: e, defaultError: c }).message;
  return {
    ...r,
    path: i,
    message: c
  };
};
function p(s, e) {
  const t = pi(), n = vi({
    issueData: e,
    data: s.data,
    path: s.path,
    errorMaps: [
      s.common.contextualErrorMap,
      // contextual error map is first priority
      s.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === or ? void 0 : or
      // then global default map
    ].filter((r) => !!r)
  });
  s.common.issues.push(n);
}
class we {
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
    const n = [];
    for (const r of t) {
      if (r.status === "aborted")
        return x;
      r.status === "dirty" && e.dirty(), n.push(r.value);
    }
    return { status: e.value, value: n };
  }
  static async mergeObjectAsync(e, t) {
    const n = [];
    for (const r of t) {
      const i = await r.key, a = await r.value;
      n.push({
        key: i,
        value: a
      });
    }
    return we.mergeObjectSync(e, n);
  }
  static mergeObjectSync(e, t) {
    const n = {};
    for (const r of t) {
      const { key: i, value: a } = r;
      if (i.status === "aborted" || a.status === "aborted")
        return x;
      i.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof a.value < "u" || r.alwaysSet) && (n[i.value] = a.value);
    }
    return { status: e.value, value: n };
  }
}
const x = Object.freeze({
  status: "aborted"
}), pn = (s) => ({ status: "dirty", value: s }), xe = (s) => ({ status: "valid", value: s }), Ur = (s) => s.status === "aborted", zr = (s) => s.status === "dirty", rn = (s) => s.status === "valid", Un = (s) => typeof Promise < "u" && s instanceof Promise;
var _;
(function(s) {
  s.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(_ || (_ = {}));
class mt {
  constructor(e, t, n, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Fr = (s, e) => {
  if (rn(e))
    return { success: !0, data: e.value };
  if (!s.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ye(s.common.issues);
      return this._error = t, this._error;
    }
  };
};
function I(s) {
  if (!s)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: n, description: r } = s;
  if (e && (t || n))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: r } : { errorMap: (a, c) => {
    const { message: l } = s;
    return a.code === "invalid_enum_value" ? { message: l ?? c.defaultError } : typeof c.data > "u" ? { message: l ?? n ?? c.defaultError } : a.code !== "invalid_type" ? { message: c.defaultError } : { message: l ?? t ?? c.defaultError };
  }, description: r };
}
class C {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return rt(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: rt(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new we(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: rt(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Un(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const n = this.safeParse(e, t);
    if (n.success)
      return n.data;
    throw n.error;
  }
  safeParse(e, t) {
    const n = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: rt(e)
    }, r = this._parseSync({ data: e, path: n.path, parent: n });
    return Fr(n, r);
  }
  "~validate"(e) {
    var n, r;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: rt(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return rn(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (r = (n = i == null ? void 0 : i.message) == null ? void 0 : n.toLowerCase()) != null && r.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => rn(i) ? {
      value: i.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const n = await this.safeParseAsync(e, t);
    if (n.success)
      return n.data;
    throw n.error;
  }
  async safeParseAsync(e, t) {
    const n = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: rt(e)
    }, r = this._parse({ data: e, path: n.path, parent: n }), i = await (Un(r) ? r : Promise.resolve(r));
    return Fr(n, i);
  }
  refine(e, t) {
    const n = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, i) => {
      const a = e(r), c = () => i.addIssue({
        code: m.custom,
        ...n(r)
      });
      return typeof Promise < "u" && a instanceof Promise ? a.then((l) => l ? !0 : (c(), !1)) : a ? !0 : (c(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
  }
  _refinement(e) {
    return new on({
      schema: this,
      typeName: k.ZodEffects,
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
    return ft.create(this, this._def);
  }
  nullable() {
    return cn.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Ze.create(this);
  }
  promise() {
    return Wn.create(this, this._def);
  }
  or(e) {
    return Fn.create([this, e], this._def);
  }
  and(e) {
    return Hn.create(this, e, this._def);
  }
  transform(e) {
    return new on({
      ...I(this._def),
      schema: this,
      typeName: k.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ur({
      ...I(this._def),
      innerType: this,
      defaultValue: t,
      typeName: k.ZodDefault
    });
  }
  brand() {
    return new Bi({
      typeName: k.ZodBranded,
      type: this,
      ...I(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new hr({
      ...I(this._def),
      innerType: this,
      catchValue: t,
      typeName: k.ZodCatch
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
    return Rr.create(this, e);
  }
  readonly() {
    return fr.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const _i = /^c[^\s-]{8,}$/i, wi = /^[0-9a-z]+$/, bi = /^[0-9A-HJKMNP-TV-Z]{26}$/i, xi = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, ki = /^[a-z0-9_-]{21}$/i, Si = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Ii = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Ti = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Oi = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let tr;
const Ci = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ei = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Ai = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Li = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ni = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Vi = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, xs = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ri = new RegExp(`^${xs}$`);
function ks(s) {
  let e = "[0-5]\\d";
  s.precision ? e = `${e}\\.\\d{${s.precision}}` : s.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = s.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Mi(s) {
  return new RegExp(`^${ks(s)}$`);
}
function Pi(s) {
  let e = `${xs}T${ks(s)}`;
  const t = [];
  return t.push(s.local ? "Z?" : "Z"), s.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Di(s, e) {
  return !!((e === "v4" || !e) && Ci.test(s) || (e === "v6" || !e) && Ai.test(s));
}
function ji(s, e) {
  if (!Si.test(s))
    return !1;
  try {
    const [t] = s.split(".");
    if (!t)
      return !1;
    const n = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), r = JSON.parse(atob(n));
    return !(typeof r != "object" || r === null || "typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || e && r.alg !== e);
  } catch {
    return !1;
  }
}
function Zi(s, e) {
  return !!((e === "v4" || !e) && Ei.test(s) || (e === "v6" || !e) && Li.test(s));
}
class ht extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: v.string,
        received: i.parsedType
      }), x;
    }
    const n = new we();
    let r;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (r = this._getOrReturnCtx(e, r), p(r, {
          code: m.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), n.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (r = this._getOrReturnCtx(e, r), p(r, {
          code: m.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), n.dirty());
      else if (i.kind === "length") {
        const a = e.data.length > i.value, c = e.data.length < i.value;
        (a || c) && (r = this._getOrReturnCtx(e, r), a ? p(r, {
          code: m.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : c && p(r, {
          code: m.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), n.dirty());
      } else if (i.kind === "email")
        Ti.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "email",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "emoji")
        tr || (tr = new RegExp(Oi, "u")), tr.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "emoji",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "uuid")
        xi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "uuid",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "nanoid")
        ki.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "nanoid",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "cuid")
        _i.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "cuid2")
        wi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid2",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "ulid")
        bi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "ulid",
          code: m.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), p(r, {
            validation: "url",
            code: m.invalid_string,
            message: i.message
          }), n.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "regex",
        code: m.invalid_string,
        message: i.message
      }), n.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), n.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), n.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), n.dirty()) : i.kind === "datetime" ? Pi(i).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "datetime",
        message: i.message
      }), n.dirty()) : i.kind === "date" ? Ri.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "date",
        message: i.message
      }), n.dirty()) : i.kind === "time" ? Mi(i).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "time",
        message: i.message
      }), n.dirty()) : i.kind === "duration" ? Ii.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "duration",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "ip" ? Di(e.data, i.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "ip",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "jwt" ? ji(e.data, i.alg) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "jwt",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "cidr" ? Zi(e.data, i.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "cidr",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "base64" ? Ni.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "base64",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "base64url" ? Vi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "base64url",
        code: m.invalid_string,
        message: i.message
      }), n.dirty()) : E.assertNever(i);
    return { status: n.value, value: e.data };
  }
  _regex(e, t, n) {
    return this.refinement((r) => e.test(r), {
      validation: t,
      code: m.invalid_string,
      ..._.errToObj(n)
    });
  }
  _addCheck(e) {
    return new ht({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ..._.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ..._.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ..._.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ..._.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ..._.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ..._.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ..._.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ..._.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ..._.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ..._.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ..._.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ..._.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ..._.errToObj(e) });
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
      ..._.errToObj(e == null ? void 0 : e.message)
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
      ..._.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ..._.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ..._.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ..._.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ..._.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ..._.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ..._.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ..._.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ..._.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, _.errToObj(e));
  }
  trim() {
    return new ht({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ht({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ht({
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
ht.create = (s) => new ht({
  checks: [],
  typeName: k.ZodString,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...I(s)
});
function Ki(s, e) {
  const t = (s.toString().split(".")[1] || "").length, n = (e.toString().split(".")[1] || "").length, r = t > n ? t : n, i = Number.parseInt(s.toFixed(r).replace(".", "")), a = Number.parseInt(e.toFixed(r).replace(".", ""));
  return i % a / 10 ** r;
}
class sn extends C {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== v.number) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: v.number,
        received: i.parsedType
      }), x;
    }
    let n;
    const r = new we();
    for (const i of this._def.checks)
      i.kind === "int" ? E.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), r.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? Ki(e.data, i.value) !== 0 && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_finite,
        message: i.message
      }), r.dirty()) : E.assertNever(i);
    return { status: r.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, _.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, _.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, _.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, _.toString(t));
  }
  setLimit(e, t, n, r) {
    return new sn({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: n,
          message: _.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new sn({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: _.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: _.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: _.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: _.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: _.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: _.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: _.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: _.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: _.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && E.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const n of this._def.checks) {
      if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf")
        return !0;
      n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
sn.create = (s) => new sn({
  checks: [],
  typeName: k.ZodNumber,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...I(s)
});
class In extends C {
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
    let n;
    const r = new we();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : E.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return p(t, {
      code: m.invalid_type,
      expected: v.bigint,
      received: t.parsedType
    }), x;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, _.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, _.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, _.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, _.toString(t));
  }
  setLimit(e, t, n, r) {
    return new In({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: n,
          message: _.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new In({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: _.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: _.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: _.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: _.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: _.toString(t)
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
In.create = (s) => new In({
  checks: [],
  typeName: k.ZodBigInt,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...I(s)
});
class Hr extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.boolean,
        received: n.parsedType
      }), x;
    }
    return xe(e.data);
  }
}
Hr.create = (s) => new Hr({
  typeName: k.ZodBoolean,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...I(s)
});
class zn extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: v.date,
        received: i.parsedType
      }), x;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_date
      }), x;
    }
    const n = new we();
    let r;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), n.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), n.dirty()) : E.assertNever(i);
    return {
      status: n.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new zn({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: _.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: _.toString(t)
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
zn.create = (s) => new zn({
  checks: [],
  coerce: (s == null ? void 0 : s.coerce) || !1,
  typeName: k.ZodDate,
  ...I(s)
});
class Wr extends C {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.symbol,
        received: n.parsedType
      }), x;
    }
    return xe(e.data);
  }
}
Wr.create = (s) => new Wr({
  typeName: k.ZodSymbol,
  ...I(s)
});
class cr extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.undefined,
        received: n.parsedType
      }), x;
    }
    return xe(e.data);
  }
}
cr.create = (s) => new cr({
  typeName: k.ZodUndefined,
  ...I(s)
});
class Jr extends C {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.null,
        received: n.parsedType
      }), x;
    }
    return xe(e.data);
  }
}
Jr.create = (s) => new Jr({
  typeName: k.ZodNull,
  ...I(s)
});
class Tn extends C {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return xe(e.data);
  }
}
Tn.create = (s) => new Tn({
  typeName: k.ZodAny,
  ...I(s)
});
class lr extends C {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return xe(e.data);
  }
}
lr.create = (s) => new lr({
  typeName: k.ZodUnknown,
  ...I(s)
});
class gt extends C {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return p(t, {
      code: m.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), x;
  }
}
gt.create = (s) => new gt({
  typeName: k.ZodNever,
  ...I(s)
});
class qr extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.void,
        received: n.parsedType
      }), x;
    }
    return xe(e.data);
  }
}
qr.create = (s) => new qr({
  typeName: k.ZodVoid,
  ...I(s)
});
class Ze extends C {
  _parse(e) {
    const { ctx: t, status: n } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== v.array)
      return p(t, {
        code: m.invalid_type,
        expected: v.array,
        received: t.parsedType
      }), x;
    if (r.exactLength !== null) {
      const a = t.data.length > r.exactLength.value, c = t.data.length < r.exactLength.value;
      (a || c) && (p(t, {
        code: a ? m.too_big : m.too_small,
        minimum: c ? r.exactLength.value : void 0,
        maximum: a ? r.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: r.exactLength.message
      }), n.dirty());
    }
    if (r.minLength !== null && t.data.length < r.minLength.value && (p(t, {
      code: m.too_small,
      minimum: r.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.minLength.message
    }), n.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (p(t, {
      code: m.too_big,
      maximum: r.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.maxLength.message
    }), n.dirty()), t.common.async)
      return Promise.all([...t.data].map((a, c) => r.type._parseAsync(new mt(t, a, t.path, c)))).then((a) => we.mergeArray(n, a));
    const i = [...t.data].map((a, c) => r.type._parseSync(new mt(t, a, t.path, c)));
    return we.mergeArray(n, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new Ze({
      ...this._def,
      minLength: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new Ze({
      ...this._def,
      maxLength: { value: e, message: _.toString(t) }
    });
  }
  length(e, t) {
    return new Ze({
      ...this._def,
      exactLength: { value: e, message: _.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Ze.create = (s, e) => new Ze({
  type: s,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: k.ZodArray,
  ...I(e)
});
function Nt(s) {
  if (s instanceof H) {
    const e = {};
    for (const t in s.shape) {
      const n = s.shape[t];
      e[t] = ft.create(Nt(n));
    }
    return new H({
      ...s._def,
      shape: () => e
    });
  } else return s instanceof Ze ? new Ze({
    ...s._def,
    type: Nt(s.element)
  }) : s instanceof ft ? ft.create(Nt(s.unwrap())) : s instanceof cn ? cn.create(Nt(s.unwrap())) : s instanceof Ot ? Ot.create(s.items.map((e) => Nt(e))) : s;
}
class H extends C {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = E.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== v.object) {
      const u = this._getOrReturnCtx(e);
      return p(u, {
        code: m.invalid_type,
        expected: v.object,
        received: u.parsedType
      }), x;
    }
    const { status: n, ctx: r } = this._processInputParams(e), { shape: i, keys: a } = this._getCached(), c = [];
    if (!(this._def.catchall instanceof gt && this._def.unknownKeys === "strip"))
      for (const u in r.data)
        a.includes(u) || c.push(u);
    const l = [];
    for (const u of a) {
      const f = i[u], g = r.data[u];
      l.push({
        key: { status: "valid", value: u },
        value: f._parse(new mt(r, g, r.path, u)),
        alwaysSet: u in r.data
      });
    }
    if (this._def.catchall instanceof gt) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const f of c)
          l.push({
            key: { status: "valid", value: f },
            value: { status: "valid", value: r.data[f] }
          });
      else if (u === "strict")
        c.length > 0 && (p(r, {
          code: m.unrecognized_keys,
          keys: c
        }), n.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const f of c) {
        const g = r.data[f];
        l.push({
          key: { status: "valid", value: f },
          value: u._parse(
            new mt(r, g, r.path, f)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: f in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const f of l) {
        const g = await f.key, w = await f.value;
        u.push({
          key: g,
          value: w,
          alwaysSet: f.alwaysSet
        });
      }
      return u;
    }).then((u) => we.mergeObjectSync(n, u)) : we.mergeObjectSync(n, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return _.errToObj, new H({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, n) => {
          var i, a;
          const r = ((a = (i = this._def).errorMap) == null ? void 0 : a.call(i, t, n).message) ?? n.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: _.errToObj(e).message ?? r
          } : {
            message: r
          };
        }
      } : {}
    });
  }
  strip() {
    return new H({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new H({
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
    return new H({
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
    return new H({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: k.ZodObject
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
    return new H({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const n of E.objectKeys(e))
      e[n] && this.shape[n] && (t[n] = this.shape[n]);
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const n of E.objectKeys(this.shape))
      e[n] || (t[n] = this.shape[n]);
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Nt(this);
  }
  partial(e) {
    const t = {};
    for (const n of E.objectKeys(this.shape)) {
      const r = this.shape[n];
      e && !e[n] ? t[n] = r : t[n] = r.optional();
    }
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const n of E.objectKeys(this.shape))
      if (e && !e[n])
        t[n] = this.shape[n];
      else {
        let i = this.shape[n];
        for (; i instanceof ft; )
          i = i._def.innerType;
        t[n] = i;
      }
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Ss(E.objectKeys(this.shape));
  }
}
H.create = (s, e) => new H({
  shape: () => s,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: k.ZodObject,
  ...I(e)
});
H.strictCreate = (s, e) => new H({
  shape: () => s,
  unknownKeys: "strict",
  catchall: gt.create(),
  typeName: k.ZodObject,
  ...I(e)
});
H.lazycreate = (s, e) => new H({
  shape: s,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: k.ZodObject,
  ...I(e)
});
class Fn extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = this._def.options;
    function r(i) {
      for (const c of i)
        if (c.result.status === "valid")
          return c.result;
      for (const c of i)
        if (c.result.status === "dirty")
          return t.common.issues.push(...c.ctx.common.issues), c.result;
      const a = i.map((c) => new Ye(c.ctx.common.issues));
      return p(t, {
        code: m.invalid_union,
        unionErrors: a
      }), x;
    }
    if (t.common.async)
      return Promise.all(n.map(async (i) => {
        const a = {
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
            parent: a
          }),
          ctx: a
        };
      })).then(r);
    {
      let i;
      const a = [];
      for (const l of n) {
        const u = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, f = l._parseSync({
          data: t.data,
          path: t.path,
          parent: u
        });
        if (f.status === "valid")
          return f;
        f.status === "dirty" && !i && (i = { result: f, ctx: u }), u.common.issues.length && a.push(u.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const c = a.map((l) => new Ye(l));
      return p(t, {
        code: m.invalid_union,
        unionErrors: c
      }), x;
    }
  }
  get options() {
    return this._def.options;
  }
}
Fn.create = (s, e) => new Fn({
  options: s,
  typeName: k.ZodUnion,
  ...I(e)
});
function dr(s, e) {
  const t = rt(s), n = rt(e);
  if (s === e)
    return { valid: !0, data: s };
  if (t === v.object && n === v.object) {
    const r = E.objectKeys(e), i = E.objectKeys(s).filter((c) => r.indexOf(c) !== -1), a = { ...s, ...e };
    for (const c of i) {
      const l = dr(s[c], e[c]);
      if (!l.valid)
        return { valid: !1 };
      a[c] = l.data;
    }
    return { valid: !0, data: a };
  } else if (t === v.array && n === v.array) {
    if (s.length !== e.length)
      return { valid: !1 };
    const r = [];
    for (let i = 0; i < s.length; i++) {
      const a = s[i], c = e[i], l = dr(a, c);
      if (!l.valid)
        return { valid: !1 };
      r.push(l.data);
    }
    return { valid: !0, data: r };
  } else return t === v.date && n === v.date && +s == +e ? { valid: !0, data: s } : { valid: !1 };
}
class Hn extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = (i, a) => {
      if (Ur(i) || Ur(a))
        return x;
      const c = dr(i.value, a.value);
      return c.valid ? ((zr(i) || zr(a)) && t.dirty(), { status: t.value, value: c.data }) : (p(n, {
        code: m.invalid_intersection_types
      }), x);
    };
    return n.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: n.data,
        path: n.path,
        parent: n
      }),
      this._def.right._parseAsync({
        data: n.data,
        path: n.path,
        parent: n
      })
    ]).then(([i, a]) => r(i, a)) : r(this._def.left._parseSync({
      data: n.data,
      path: n.path,
      parent: n
    }), this._def.right._parseSync({
      data: n.data,
      path: n.path,
      parent: n
    }));
  }
}
Hn.create = (s, e, t) => new Hn({
  left: s,
  right: e,
  typeName: k.ZodIntersection,
  ...I(t)
});
class Ot extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.array)
      return p(n, {
        code: m.invalid_type,
        expected: v.array,
        received: n.parsedType
      }), x;
    if (n.data.length < this._def.items.length)
      return p(n, {
        code: m.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), x;
    !this._def.rest && n.data.length > this._def.items.length && (p(n, {
      code: m.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...n.data].map((a, c) => {
      const l = this._def.items[c] || this._def.rest;
      return l ? l._parse(new mt(n, a, n.path, c)) : null;
    }).filter((a) => !!a);
    return n.common.async ? Promise.all(i).then((a) => we.mergeArray(t, a)) : we.mergeArray(t, i);
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
Ot.create = (s, e) => {
  if (!Array.isArray(s))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ot({
    items: s,
    typeName: k.ZodTuple,
    rest: null,
    ...I(e)
  });
};
class Gr extends C {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.map)
      return p(n, {
        code: m.invalid_type,
        expected: v.map,
        received: n.parsedType
      }), x;
    const r = this._def.keyType, i = this._def.valueType, a = [...n.data.entries()].map(([c, l], u) => ({
      key: r._parse(new mt(n, c, n.path, [u, "key"])),
      value: i._parse(new mt(n, l, n.path, [u, "value"]))
    }));
    if (n.common.async) {
      const c = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of a) {
          const u = await l.key, f = await l.value;
          if (u.status === "aborted" || f.status === "aborted")
            return x;
          (u.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(u.value, f.value);
        }
        return { status: t.value, value: c };
      });
    } else {
      const c = /* @__PURE__ */ new Map();
      for (const l of a) {
        const u = l.key, f = l.value;
        if (u.status === "aborted" || f.status === "aborted")
          return x;
        (u.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(u.value, f.value);
      }
      return { status: t.value, value: c };
    }
  }
}
Gr.create = (s, e, t) => new Gr({
  valueType: e,
  keyType: s,
  typeName: k.ZodMap,
  ...I(t)
});
class On extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.set)
      return p(n, {
        code: m.invalid_type,
        expected: v.set,
        received: n.parsedType
      }), x;
    const r = this._def;
    r.minSize !== null && n.data.size < r.minSize.value && (p(n, {
      code: m.too_small,
      minimum: r.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.minSize.message
    }), t.dirty()), r.maxSize !== null && n.data.size > r.maxSize.value && (p(n, {
      code: m.too_big,
      maximum: r.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function a(l) {
      const u = /* @__PURE__ */ new Set();
      for (const f of l) {
        if (f.status === "aborted")
          return x;
        f.status === "dirty" && t.dirty(), u.add(f.value);
      }
      return { status: t.value, value: u };
    }
    const c = [...n.data.values()].map((l, u) => i._parse(new mt(n, l, n.path, u)));
    return n.common.async ? Promise.all(c).then((l) => a(l)) : a(c);
  }
  min(e, t) {
    return new On({
      ...this._def,
      minSize: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new On({
      ...this._def,
      maxSize: { value: e, message: _.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
On.create = (s, e) => new On({
  valueType: s,
  minSize: null,
  maxSize: null,
  typeName: k.ZodSet,
  ...I(e)
});
class Qr extends C {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Qr.create = (s, e) => new Qr({
  getter: s,
  typeName: k.ZodLazy,
  ...I(e)
});
class Yr extends C {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return p(t, {
        received: t.data,
        code: m.invalid_literal,
        expected: this._def.value
      }), x;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Yr.create = (s, e) => new Yr({
  value: s,
  typeName: k.ZodLiteral,
  ...I(e)
});
function Ss(s, e) {
  return new an({
    values: s,
    typeName: k.ZodEnum,
    ...I(e)
  });
}
class an extends C {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return p(t, {
        expected: E.joinValues(n),
        received: t.parsedType,
        code: m.invalid_type
      }), x;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return p(t, {
        received: t.data,
        code: m.invalid_enum_value,
        options: n
      }), x;
    }
    return xe(e.data);
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
    return an.create(this.options.filter((n) => !e.includes(n)), {
      ...this._def,
      ...t
    });
  }
}
an.create = Ss;
class Xr extends C {
  _parse(e) {
    const t = E.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
    if (n.parsedType !== v.string && n.parsedType !== v.number) {
      const r = E.objectValues(t);
      return p(n, {
        expected: E.joinValues(r),
        received: n.parsedType,
        code: m.invalid_type
      }), x;
    }
    if (this._cache || (this._cache = new Set(E.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = E.objectValues(t);
      return p(n, {
        received: n.data,
        code: m.invalid_enum_value,
        options: r
      }), x;
    }
    return xe(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Xr.create = (s, e) => new Xr({
  values: s,
  typeName: k.ZodNativeEnum,
  ...I(e)
});
class Wn extends C {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== v.promise && t.common.async === !1)
      return p(t, {
        code: m.invalid_type,
        expected: v.promise,
        received: t.parsedType
      }), x;
    const n = t.parsedType === v.promise ? t.data : Promise.resolve(t.data);
    return xe(n.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Wn.create = (s, e) => new Wn({
  type: s,
  typeName: k.ZodPromise,
  ...I(e)
});
class on extends C {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === k.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, i = {
      addIssue: (a) => {
        p(n, a), a.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return n.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), r.type === "preprocess") {
      const a = r.transform(n.data, i);
      if (n.common.async)
        return Promise.resolve(a).then(async (c) => {
          if (t.value === "aborted")
            return x;
          const l = await this._def.schema._parseAsync({
            data: c,
            path: n.path,
            parent: n
          });
          return l.status === "aborted" ? x : l.status === "dirty" || t.value === "dirty" ? pn(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return x;
        const c = this._def.schema._parseSync({
          data: a,
          path: n.path,
          parent: n
        });
        return c.status === "aborted" ? x : c.status === "dirty" || t.value === "dirty" ? pn(c.value) : c;
      }
    }
    if (r.type === "refinement") {
      const a = (c) => {
        const l = r.refinement(c, i);
        if (n.common.async)
          return Promise.resolve(l);
        if (l instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return c;
      };
      if (n.common.async === !1) {
        const c = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return c.status === "aborted" ? x : (c.status === "dirty" && t.dirty(), a(c.value), { status: t.value, value: c.value });
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((c) => c.status === "aborted" ? x : (c.status === "dirty" && t.dirty(), a(c.value).then(() => ({ status: t.value, value: c.value }))));
    }
    if (r.type === "transform")
      if (n.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n
        });
        if (!rn(a))
          return x;
        const c = r.transform(a.value, i);
        if (c instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: c };
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((a) => rn(a) ? Promise.resolve(r.transform(a.value, i)).then((c) => ({
          status: t.value,
          value: c
        })) : x);
    E.assertNever(r);
  }
}
on.create = (s, e, t) => new on({
  schema: s,
  typeName: k.ZodEffects,
  effect: e,
  ...I(t)
});
on.createWithPreprocess = (s, e, t) => new on({
  schema: e,
  effect: { type: "preprocess", transform: s },
  typeName: k.ZodEffects,
  ...I(t)
});
class ft extends C {
  _parse(e) {
    return this._getType(e) === v.undefined ? xe(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ft.create = (s, e) => new ft({
  innerType: s,
  typeName: k.ZodOptional,
  ...I(e)
});
class cn extends C {
  _parse(e) {
    return this._getType(e) === v.null ? xe(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
cn.create = (s, e) => new cn({
  innerType: s,
  typeName: k.ZodNullable,
  ...I(e)
});
class ur extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let n = t.data;
    return t.parsedType === v.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
      data: n,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ur.create = (s, e) => new ur({
  innerType: s,
  typeName: k.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...I(e)
});
class hr extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, r = this._def.innerType._parse({
      data: n.data,
      path: n.path,
      parent: {
        ...n
      }
    });
    return Un(r) ? r.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new Ye(n.common.issues);
        },
        input: n.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new Ye(n.common.issues);
        },
        input: n.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
hr.create = (s, e) => new hr({
  innerType: s,
  typeName: k.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...I(e)
});
class es extends C {
  _parse(e) {
    if (this._getType(e) !== v.nan) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.nan,
        received: n.parsedType
      }), x;
    }
    return { status: "valid", value: e.data };
  }
}
es.create = (s) => new es({
  typeName: k.ZodNaN,
  ...I(s)
});
class Bi extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = t.data;
    return this._def.type._parse({
      data: n,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class Rr extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return i.status === "aborted" ? x : i.status === "dirty" ? (t.dirty(), pn(i.value)) : this._def.out._parseAsync({
          data: i.value,
          path: n.path,
          parent: n
        });
      })();
    {
      const r = this._def.in._parseSync({
        data: n.data,
        path: n.path,
        parent: n
      });
      return r.status === "aborted" ? x : r.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: r.value
      }) : this._def.out._parseSync({
        data: r.value,
        path: n.path,
        parent: n
      });
    }
  }
  static create(e, t) {
    return new Rr({
      in: e,
      out: t,
      typeName: k.ZodPipeline
    });
  }
}
class fr extends C {
  _parse(e) {
    const t = this._def.innerType._parse(e), n = (r) => (rn(r) && (r.value = Object.freeze(r.value)), r);
    return Un(t) ? t.then((r) => n(r)) : n(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
fr.create = (s, e) => new fr({
  innerType: s,
  typeName: k.ZodReadonly,
  ...I(e)
});
function ts(s, e) {
  const t = typeof s == "function" ? s(e) : typeof s == "string" ? { message: s } : s;
  return typeof t == "string" ? { message: t } : t;
}
function $i(s, e = {}, t) {
  return s ? Tn.create().superRefine((n, r) => {
    const i = s(n);
    if (i instanceof Promise)
      return i.then((a) => {
        if (!a) {
          const c = ts(e, n), l = c.fatal ?? t ?? !0;
          r.addIssue({ code: "custom", ...c, fatal: l });
        }
      });
    if (!i) {
      const a = ts(e, n), c = a.fatal ?? t ?? !0;
      r.addIssue({ code: "custom", ...a, fatal: c });
    }
  }) : Tn.create();
}
var k;
(function(s) {
  s.ZodString = "ZodString", s.ZodNumber = "ZodNumber", s.ZodNaN = "ZodNaN", s.ZodBigInt = "ZodBigInt", s.ZodBoolean = "ZodBoolean", s.ZodDate = "ZodDate", s.ZodSymbol = "ZodSymbol", s.ZodUndefined = "ZodUndefined", s.ZodNull = "ZodNull", s.ZodAny = "ZodAny", s.ZodUnknown = "ZodUnknown", s.ZodNever = "ZodNever", s.ZodVoid = "ZodVoid", s.ZodArray = "ZodArray", s.ZodObject = "ZodObject", s.ZodUnion = "ZodUnion", s.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s.ZodIntersection = "ZodIntersection", s.ZodTuple = "ZodTuple", s.ZodRecord = "ZodRecord", s.ZodMap = "ZodMap", s.ZodSet = "ZodSet", s.ZodFunction = "ZodFunction", s.ZodLazy = "ZodLazy", s.ZodLiteral = "ZodLiteral", s.ZodEnum = "ZodEnum", s.ZodEffects = "ZodEffects", s.ZodNativeEnum = "ZodNativeEnum", s.ZodOptional = "ZodOptional", s.ZodNullable = "ZodNullable", s.ZodDefault = "ZodDefault", s.ZodCatch = "ZodCatch", s.ZodPromise = "ZodPromise", s.ZodBranded = "ZodBranded", s.ZodPipeline = "ZodPipeline", s.ZodReadonly = "ZodReadonly";
})(k || (k = {}));
const Ui = (s, e = {
  message: `Input not instance of ${s.name}`
}) => $i((t) => t instanceof s, e), Dn = ht.create, Is = sn.create, zi = cr.create;
Tn.create;
const Fi = lr.create;
gt.create;
Ze.create;
const Hi = Fn.create;
Hn.create;
Ot.create;
an.create;
Wn.create;
ft.create;
cn.create;
function qn(s, e) {
  var r;
  const t = s.safeParse(e);
  if (t.success)
    return t.data;
  const n = ((r = t.error.issues[0]) == null ? void 0 : r.message) ?? "invalid argument";
  throw new R("invalid-argument", n);
}
const Wi = Dn({
  invalid_type_error: "Label must be a string"
}).max(jr, `Label must not exceed ${jr} characters`), Ji = Dn({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(Zr, `MIMEType must not exceed ${Zr} characters`), qi = Dn({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(Kr, `Info key must not exceed ${Kr} characters`), Gi = Fi().superRefine((s, e) => {
  let t;
  try {
    t = JSON.stringify(s);
  } catch {
    e.addIssue({
      code: m.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > Br && e.addIssue({
    code: m.custom,
    message: `Info value must not exceed ${Br} bytes when serialised as UTF-8 JSON`
  });
});
function Ts(s) {
  qn(Wi, s);
}
function mr(s) {
  qn(Ji, s);
}
function Qi(s) {
  qn(qi, s);
}
function Yi(s) {
  qn(Gi, s);
}
class Os {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
  get isRootItem() {
    return this.Id === le;
  }
  get isTrashItem() {
    return this.Id === $;
  }
  get isLostAndFoundItem() {
    return this.Id === ge;
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
    Ts(e), this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    if (e == null) throw new R("invalid-argument", "outerItem must not be missing");
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    if (e == null) throw new R("invalid-argument", "outerItem must not be missing");
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
const Xi = Hi(
  [Dn(), Ui(Uint8Array), zi()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), ns = Is({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), ea = Dn({
  invalid_type_error: "Replacement must be a string"
});
function nr(s, e, t) {
  var i;
  const n = s.safeParse(e);
  if (n.success)
    return n.data;
  const r = (t ? `${t}: ` : "") + (((i = n.error.issues[0]) == null ? void 0 : i.message) ?? "invalid argument");
  throw new R("invalid-argument", r);
}
class rs extends Os {
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
    mr(e), this._Store._setTypeOf(this.Id, e);
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
    nr(Xi, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, n) {
    if (nr(ns, e, "fromIndex"), !ns.safeParse(t).success || t < e)
      throw new R("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    nr(ea, n, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, n);
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
class ss extends Os {
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
var ee = Uint8Array, _e = Uint16Array, Mr = Int32Array, Gn = new ee([
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
]), Qn = new ee([
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
]), gr = new ee([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Cs = function(s, e) {
  for (var t = new _e(31), n = 0; n < 31; ++n)
    t[n] = e += 1 << s[n - 1];
  for (var r = new Mr(t[30]), n = 1; n < 30; ++n)
    for (var i = t[n]; i < t[n + 1]; ++i)
      r[i] = i - t[n] << 5 | n;
  return { b: t, r };
}, Es = Cs(Gn, 2), As = Es.b, yr = Es.r;
As[28] = 258, yr[258] = 28;
var Ls = Cs(Qn, 0), ta = Ls.b, is = Ls.r, pr = new _e(32768);
for (var D = 0; D < 32768; ++D) {
  var et = (D & 43690) >> 1 | (D & 21845) << 1;
  et = (et & 52428) >> 2 | (et & 13107) << 2, et = (et & 61680) >> 4 | (et & 3855) << 4, pr[D] = ((et & 65280) >> 8 | (et & 255) << 8) >> 1;
}
var Ke = (function(s, e, t) {
  for (var n = s.length, r = 0, i = new _e(e); r < n; ++r)
    s[r] && ++i[s[r] - 1];
  var a = new _e(e);
  for (r = 1; r < e; ++r)
    a[r] = a[r - 1] + i[r - 1] << 1;
  var c;
  if (t) {
    c = new _e(1 << e);
    var l = 15 - e;
    for (r = 0; r < n; ++r)
      if (s[r])
        for (var u = r << 4 | s[r], f = e - s[r], g = a[s[r] - 1]++ << f, w = g | (1 << f) - 1; g <= w; ++g)
          c[pr[g] >> l] = u;
  } else
    for (c = new _e(n), r = 0; r < n; ++r)
      s[r] && (c[r] = pr[a[s[r] - 1]++] >> 15 - s[r]);
  return c;
}), yt = new ee(288);
for (var D = 0; D < 144; ++D)
  yt[D] = 8;
for (var D = 144; D < 256; ++D)
  yt[D] = 9;
for (var D = 256; D < 280; ++D)
  yt[D] = 7;
for (var D = 280; D < 288; ++D)
  yt[D] = 8;
var Cn = new ee(32);
for (var D = 0; D < 32; ++D)
  Cn[D] = 5;
var na = /* @__PURE__ */ Ke(yt, 9, 0), ra = /* @__PURE__ */ Ke(yt, 9, 1), sa = /* @__PURE__ */ Ke(Cn, 5, 0), ia = /* @__PURE__ */ Ke(Cn, 5, 1), rr = function(s) {
  for (var e = s[0], t = 1; t < s.length; ++t)
    s[t] > e && (e = s[t]);
  return e;
}, Se = function(s, e, t) {
  var n = e / 8 | 0;
  return (s[n] | s[n + 1] << 8) >> (e & 7) & t;
}, sr = function(s, e) {
  var t = e / 8 | 0;
  return (s[t] | s[t + 1] << 8 | s[t + 2] << 16) >> (e & 7);
}, Pr = function(s) {
  return (s + 7) / 8 | 0;
}, Ns = function(s, e, t) {
  return (t == null || t > s.length) && (t = s.length), new ee(s.subarray(e, t));
}, aa = [
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
], Te = function(s, e, t) {
  var n = new Error(e || aa[s]);
  if (n.code = s, Error.captureStackTrace && Error.captureStackTrace(n, Te), !t)
    throw n;
  return n;
}, oa = function(s, e, t, n) {
  var r = s.length, i = 0;
  if (!r || e.f && !e.l)
    return t || new ee(0);
  var a = !t, c = a || e.i != 2, l = e.i;
  a && (t = new ee(r * 3));
  var u = function(dn) {
    var un = t.length;
    if (dn > un) {
      var At = new ee(Math.max(un * 2, dn));
      At.set(t), t = At;
    }
  }, f = e.f || 0, g = e.p || 0, w = e.b || 0, V = e.l, W = e.d, j = e.m, ae = e.n, ke = r * 8;
  do {
    if (!V) {
      f = Se(s, g, 1);
      var ue = Se(s, g + 1, 3);
      if (g += 3, ue)
        if (ue == 1)
          V = ra, W = ia, j = 9, ae = 5;
        else if (ue == 2) {
          var ie = Se(s, g, 31) + 257, q = Se(s, g + 10, 15) + 4, L = ie + Se(s, g + 5, 31) + 1;
          g += 14;
          for (var S = new ee(L), G = new ee(19), z = 0; z < q; ++z)
            G[gr[z]] = Se(s, g + z * 3, 7);
          g += q * 3;
          for (var ne = rr(G), Xe = (1 << ne) - 1, he = Ke(G, ne, 1), z = 0; z < L; ) {
            var oe = he[Se(s, g, Xe)];
            g += oe & 15;
            var J = oe >> 4;
            if (J < 16)
              S[z++] = J;
            else {
              var Q = 0, Z = 0;
              for (J == 16 ? (Z = 3 + Se(s, g, 3), g += 2, Q = S[z - 1]) : J == 17 ? (Z = 3 + Se(s, g, 7), g += 3) : J == 18 && (Z = 11 + Se(s, g, 127), g += 7); Z--; )
                S[z++] = Q;
            }
          }
          var ce = S.subarray(0, ie), Y = S.subarray(ie);
          j = rr(ce), ae = rr(Y), V = Ke(ce, j, 1), W = Ke(Y, ae, 1);
        } else
          Te(1);
      else {
        var J = Pr(g) + 4, se = s[J - 4] | s[J - 3] << 8, te = J + se;
        if (te > r) {
          l && Te(0);
          break;
        }
        c && u(w + se), t.set(s.subarray(J, te), w), e.b = w += se, e.p = g = te * 8, e.f = f;
        continue;
      }
      if (g > ke) {
        l && Te(0);
        break;
      }
    }
    c && u(w + 131072);
    for (var ln = (1 << j) - 1, be = (1 << ae) - 1, Be = g; ; Be = g) {
      var Q = V[sr(s, g) & ln], fe = Q >> 4;
      if (g += Q & 15, g > ke) {
        l && Te(0);
        break;
      }
      if (Q || Te(2), fe < 256)
        t[w++] = fe;
      else if (fe == 256) {
        Be = g, V = null;
        break;
      } else {
        var me = fe - 254;
        if (fe > 264) {
          var z = fe - 257, K = Gn[z];
          me = Se(s, g, (1 << K) - 1) + As[z], g += K;
        }
        var Ne = W[sr(s, g) & be], Ct = Ne >> 4;
        Ne || Te(3), g += Ne & 15;
        var Y = ta[Ct];
        if (Ct > 3) {
          var K = Qn[Ct];
          Y += sr(s, g) & (1 << K) - 1, g += K;
        }
        if (g > ke) {
          l && Te(0);
          break;
        }
        c && u(w + 131072);
        var Et = w + me;
        if (w < Y) {
          var jn = i - Y, Zn = Math.min(Y, Et);
          for (jn + w < 0 && Te(3); w < Zn; ++w)
            t[w] = n[jn + w];
        }
        for (; w < Et; ++w)
          t[w] = t[w - Y];
      }
    }
    e.l = V, e.p = Be, e.b = w, e.f = f, V && (f = 1, e.m = j, e.d = W, e.n = ae);
  } while (!f);
  return w != t.length && a ? Ns(t, 0, w) : t.subarray(0, w);
}, $e = function(s, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  s[n] |= t, s[n + 1] |= t >> 8;
}, fn = function(s, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  s[n] |= t, s[n + 1] |= t >> 8, s[n + 2] |= t >> 16;
}, ir = function(s, e) {
  for (var t = [], n = 0; n < s.length; ++n)
    s[n] && t.push({ s: n, f: s[n] });
  var r = t.length, i = t.slice();
  if (!r)
    return { t: Rs, l: 0 };
  if (r == 1) {
    var a = new ee(t[0].s + 1);
    return a[t[0].s] = 1, { t: a, l: 1 };
  }
  t.sort(function(te, ie) {
    return te.f - ie.f;
  }), t.push({ s: -1, f: 25001 });
  var c = t[0], l = t[1], u = 0, f = 1, g = 2;
  for (t[0] = { s: -1, f: c.f + l.f, l: c, r: l }; f != r - 1; )
    c = t[t[u].f < t[g].f ? u++ : g++], l = t[u != f && t[u].f < t[g].f ? u++ : g++], t[f++] = { s: -1, f: c.f + l.f, l: c, r: l };
  for (var w = i[0].s, n = 1; n < r; ++n)
    i[n].s > w && (w = i[n].s);
  var V = new _e(w + 1), W = vr(t[f - 1], V, 0);
  if (W > e) {
    var n = 0, j = 0, ae = W - e, ke = 1 << ae;
    for (i.sort(function(ie, q) {
      return V[q.s] - V[ie.s] || ie.f - q.f;
    }); n < r; ++n) {
      var ue = i[n].s;
      if (V[ue] > e)
        j += ke - (1 << W - V[ue]), V[ue] = e;
      else
        break;
    }
    for (j >>= ae; j > 0; ) {
      var J = i[n].s;
      V[J] < e ? j -= 1 << e - V[J]++ - 1 : ++n;
    }
    for (; n >= 0 && j; --n) {
      var se = i[n].s;
      V[se] == e && (--V[se], ++j);
    }
    W = e;
  }
  return { t: new ee(V), l: W };
}, vr = function(s, e, t) {
  return s.s == -1 ? Math.max(vr(s.l, e, t + 1), vr(s.r, e, t + 1)) : e[s.s] = t;
}, as = function(s) {
  for (var e = s.length; e && !s[--e]; )
    ;
  for (var t = new _e(++e), n = 0, r = s[0], i = 1, a = function(l) {
    t[n++] = l;
  }, c = 1; c <= e; ++c)
    if (s[c] == r && c != e)
      ++i;
    else {
      if (!r && i > 2) {
        for (; i > 138; i -= 138)
          a(32754);
        i > 2 && (a(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (a(r), --i; i > 6; i -= 6)
          a(8304);
        i > 2 && (a(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        a(r);
      i = 1, r = s[c];
    }
  return { c: t.subarray(0, n), n: e };
}, mn = function(s, e) {
  for (var t = 0, n = 0; n < e.length; ++n)
    t += s[n] * e[n];
  return t;
}, Vs = function(s, e, t) {
  var n = t.length, r = Pr(e + 2);
  s[r] = n & 255, s[r + 1] = n >> 8, s[r + 2] = s[r] ^ 255, s[r + 3] = s[r + 1] ^ 255;
  for (var i = 0; i < n; ++i)
    s[r + i + 4] = t[i];
  return (r + 4 + n) * 8;
}, os = function(s, e, t, n, r, i, a, c, l, u, f) {
  $e(e, f++, t), ++r[256];
  for (var g = ir(r, 15), w = g.t, V = g.l, W = ir(i, 15), j = W.t, ae = W.l, ke = as(w), ue = ke.c, J = ke.n, se = as(j), te = se.c, ie = se.n, q = new _e(19), L = 0; L < ue.length; ++L)
    ++q[ue[L] & 31];
  for (var L = 0; L < te.length; ++L)
    ++q[te[L] & 31];
  for (var S = ir(q, 7), G = S.t, z = S.l, ne = 19; ne > 4 && !G[gr[ne - 1]]; --ne)
    ;
  var Xe = u + 5 << 3, he = mn(r, yt) + mn(i, Cn) + a, oe = mn(r, w) + mn(i, j) + a + 14 + 3 * ne + mn(q, G) + 2 * q[16] + 3 * q[17] + 7 * q[18];
  if (l >= 0 && Xe <= he && Xe <= oe)
    return Vs(e, f, s.subarray(l, l + u));
  var Q, Z, ce, Y;
  if ($e(e, f, 1 + (oe < he)), f += 2, oe < he) {
    Q = Ke(w, V, 0), Z = w, ce = Ke(j, ae, 0), Y = j;
    var ln = Ke(G, z, 0);
    $e(e, f, J - 257), $e(e, f + 5, ie - 1), $e(e, f + 10, ne - 4), f += 14;
    for (var L = 0; L < ne; ++L)
      $e(e, f + 3 * L, G[gr[L]]);
    f += 3 * ne;
    for (var be = [ue, te], Be = 0; Be < 2; ++Be)
      for (var fe = be[Be], L = 0; L < fe.length; ++L) {
        var me = fe[L] & 31;
        $e(e, f, ln[me]), f += G[me], me > 15 && ($e(e, f, fe[L] >> 5 & 127), f += fe[L] >> 12);
      }
  } else
    Q = na, Z = yt, ce = sa, Y = Cn;
  for (var L = 0; L < c; ++L) {
    var K = n[L];
    if (K > 255) {
      var me = K >> 18 & 31;
      fn(e, f, Q[me + 257]), f += Z[me + 257], me > 7 && ($e(e, f, K >> 23 & 31), f += Gn[me]);
      var Ne = K & 31;
      fn(e, f, ce[Ne]), f += Y[Ne], Ne > 3 && (fn(e, f, K >> 5 & 8191), f += Qn[Ne]);
    } else
      fn(e, f, Q[K]), f += Z[K];
  }
  return fn(e, f, Q[256]), f + Z[256];
}, ca = /* @__PURE__ */ new Mr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Rs = /* @__PURE__ */ new ee(0), la = function(s, e, t, n, r, i) {
  var a = i.z || s.length, c = new ee(n + a + 5 * (1 + Math.ceil(a / 7e3)) + r), l = c.subarray(n, c.length - r), u = i.l, f = (i.r || 0) & 7;
  if (e) {
    f && (l[0] = i.r >> 3);
    for (var g = ca[e - 1], w = g >> 13, V = g & 8191, W = (1 << t) - 1, j = i.p || new _e(32768), ae = i.h || new _e(W + 1), ke = Math.ceil(t / 3), ue = 2 * ke, J = function(Yn) {
      return (s[Yn] ^ s[Yn + 1] << ke ^ s[Yn + 2] << ue) & W;
    }, se = new Mr(25e3), te = new _e(288), ie = new _e(32), q = 0, L = 0, S = i.i || 0, G = 0, z = i.w || 0, ne = 0; S + 2 < a; ++S) {
      var Xe = J(S), he = S & 32767, oe = ae[Xe];
      if (j[he] = oe, ae[Xe] = he, z <= S) {
        var Q = a - S;
        if ((q > 7e3 || G > 24576) && (Q > 423 || !u)) {
          f = os(s, l, 0, se, te, ie, L, G, ne, S - ne, f), G = q = L = 0, ne = S;
          for (var Z = 0; Z < 286; ++Z)
            te[Z] = 0;
          for (var Z = 0; Z < 30; ++Z)
            ie[Z] = 0;
        }
        var ce = 2, Y = 0, ln = V, be = he - oe & 32767;
        if (Q > 2 && Xe == J(S - be))
          for (var Be = Math.min(w, Q) - 1, fe = Math.min(32767, S), me = Math.min(258, Q); be <= fe && --ln && he != oe; ) {
            if (s[S + ce] == s[S + ce - be]) {
              for (var K = 0; K < me && s[S + K] == s[S + K - be]; ++K)
                ;
              if (K > ce) {
                if (ce = K, Y = be, K > Be)
                  break;
                for (var Ne = Math.min(be, K - 2), Ct = 0, Z = 0; Z < Ne; ++Z) {
                  var Et = S - be + Z & 32767, jn = j[Et], Zn = Et - jn & 32767;
                  Zn > Ct && (Ct = Zn, oe = Et);
                }
              }
            }
            he = oe, oe = j[he], be += he - oe & 32767;
          }
        if (Y) {
          se[G++] = 268435456 | yr[ce] << 18 | is[Y];
          var dn = yr[ce] & 31, un = is[Y] & 31;
          L += Gn[dn] + Qn[un], ++te[257 + dn], ++ie[un], z = S + ce, ++q;
        } else
          se[G++] = s[S], ++te[s[S]];
      }
    }
    for (S = Math.max(S, z); S < a; ++S)
      se[G++] = s[S], ++te[s[S]];
    f = os(s, l, u, se, te, ie, L, G, ne, S - ne, f), u || (i.r = f & 7 | l[f / 8 | 0] << 3, f -= 7, i.h = ae, i.p = j, i.i = S, i.w = z);
  } else {
    for (var S = i.w || 0; S < a + u; S += 65535) {
      var At = S + 65535;
      At >= a && (l[f / 8 | 0] = u, At = a), f = Vs(l, f + 1, s.subarray(S, At));
    }
    i.i = a;
  }
  return Ns(c, 0, n + Pr(f) + r);
}, da = /* @__PURE__ */ (function() {
  for (var s = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, n = 9; --n; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    s[e] = t;
  }
  return s;
})(), ua = function() {
  var s = -1;
  return {
    p: function(e) {
      for (var t = s, n = 0; n < e.length; ++n)
        t = da[t & 255 ^ e[n]] ^ t >>> 8;
      s = t;
    },
    d: function() {
      return ~s;
    }
  };
}, ha = function(s, e, t, n, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), a = new ee(i.length + s.length);
    a.set(i), a.set(s, i.length), s = a, r.w = i.length;
  }
  return la(s, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(s.length))) * 1.5) : 20 : 12 + e.mem, t, n, r);
}, _r = function(s, e, t) {
  for (; t; ++e)
    s[e] = t, t >>>= 8;
}, fa = function(s, e) {
  var t = e.filename;
  if (s[0] = 31, s[1] = 139, s[2] = 8, s[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, s[9] = 3, e.mtime != 0 && _r(s, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    s[3] = 8;
    for (var n = 0; n <= t.length; ++n)
      s[n + 10] = t.charCodeAt(n);
  }
}, ma = function(s) {
  (s[0] != 31 || s[1] != 139 || s[2] != 8) && Te(6, "invalid gzip data");
  var e = s[3], t = 10;
  e & 4 && (t += (s[10] | s[11] << 8) + 2);
  for (var n = (e >> 3 & 1) + (e >> 4 & 1); n > 0; n -= !s[t++])
    ;
  return t + (e & 2);
}, ga = function(s) {
  var e = s.length;
  return (s[e - 4] | s[e - 3] << 8 | s[e - 2] << 16 | s[e - 1] << 24) >>> 0;
}, ya = function(s) {
  return 10 + (s.filename ? s.filename.length + 1 : 0);
};
function cs(s, e) {
  e || (e = {});
  var t = ua(), n = s.length;
  t.p(s);
  var r = ha(s, e, ya(e), 8), i = r.length;
  return fa(r, e), _r(r, i - 8, t.d()), _r(r, i - 4, n), r;
}
function ls(s, e) {
  var t = ma(s);
  return t + 8 > s.length && Te(6, "invalid gzip data"), oa(s.subarray(t, -8), { i: 2 }, new ee(ga(s)), e);
}
var pa = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), va = 0;
try {
  pa.decode(Rs, { stream: !0 }), va = 1;
} catch {
}
const Ms = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function jt(s, e, t) {
  const n = t[0];
  if (e != null && s >= e)
    throw new Error(s + " >= " + e);
  if (s.slice(-1) === n || e && e.slice(-1) === n)
    throw new Error("trailing zero");
  if (e) {
    let a = 0;
    for (; (s[a] || n) === e[a]; )
      a++;
    if (a > 0)
      return e.slice(0, a) + jt(s.slice(a), e.slice(a), t);
  }
  const r = s ? t.indexOf(s[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - r > 1) {
    const a = Math.round(0.5 * (r + i));
    return t[a];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + jt(s.slice(1), null, t);
}
function Ps(s) {
  if (s.length !== Ds(s[0]))
    throw new Error("invalid integer part of order key: " + s);
}
function Ds(s) {
  if (s >= "a" && s <= "z")
    return s.charCodeAt(0) - 97 + 2;
  if (s >= "A" && s <= "Z")
    return 90 - s.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + s);
}
function vn(s) {
  const e = Ds(s[0]);
  if (e > s.length)
    throw new Error("invalid order key: " + s);
  return s.slice(0, e);
}
function ds(s, e) {
  if (s === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + s);
  const t = vn(s);
  if (s.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + s);
}
function us(s, e) {
  Ps(s);
  const [t, ...n] = s.split("");
  let r = !0;
  for (let i = n.length - 1; r && i >= 0; i--) {
    const a = e.indexOf(n[i]) + 1;
    a === e.length ? n[i] = e[0] : (n[i] = e[a], r = !1);
  }
  if (r) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) + 1);
    return i > "a" ? n.push(e[0]) : n.pop(), i + n.join("");
  } else
    return t + n.join("");
}
function _a(s, e) {
  Ps(s);
  const [t, ...n] = s.split("");
  let r = !0;
  for (let i = n.length - 1; r && i >= 0; i--) {
    const a = e.indexOf(n[i]) - 1;
    a === -1 ? n[i] = e.slice(-1) : (n[i] = e[a], r = !1);
  }
  if (r) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) - 1);
    return i < "Z" ? n.push(e.slice(-1)) : n.pop(), i + n.join("");
  } else
    return t + n.join("");
}
function ze(s, e, t = Ms) {
  if (s != null && ds(s, t), e != null && ds(e, t), s != null && e != null && s >= e)
    throw new Error(s + " >= " + e);
  if (s == null) {
    if (e == null)
      return "a" + t[0];
    const l = vn(e), u = e.slice(l.length);
    if (l === "A" + t[0].repeat(26))
      return l + jt("", u, t);
    if (l < e)
      return l;
    const f = _a(l, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const l = vn(s), u = s.slice(l.length), f = us(l, t);
    return f ?? l + jt(u, null, t);
  }
  const n = vn(s), r = s.slice(n.length), i = vn(e), a = e.slice(i.length);
  if (n === i)
    return n + jt(r, a, t);
  const c = us(n, t);
  if (c == null)
    throw new Error("cannot increment any more");
  return c < e ? c : n + jt(r, null, t);
}
function wr(s, e, t, n = Ms) {
  if (t === 0)
    return [];
  if (t === 1)
    return [ze(s, e, n)];
  {
    let r = ze(s, e, n);
    const i = [r];
    for (let a = 0; a < t - 1; a++)
      r = ze(r, e, n), i.push(r);
    return i;
  }
}
const wa = Is().int().nonnegative().optional();
function gn(s) {
  var t;
  const e = wa.safeParse(s);
  if (!e.success)
    throw new R("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function js(s, e, t, n) {
  const r = s.Id, i = n.setContainer(r, new N());
  i.set("Kind", s.Kind), i.set("outerItemId", e), i.set("OrderKey", t);
  const a = i.setContainer("Label", new F());
  s.Label && a.insert(0, s.Label);
  const c = i.setContainer("Info", new N());
  for (const [l, u] of Object.entries(s.Info ?? {}))
    c.set(l, u);
  if (s.Kind === "item") {
    const l = s, u = l.Type === Lt ? "" : l.Type ?? "";
    switch (i.set("MIMEType", u), !0) {
      case (l.ValueKind === "literal" && l.Value !== void 0): {
        i.set("ValueKind", "literal");
        const g = i.setContainer("literalValue", new F());
        l.Value.length > 0 && g.insert(0, l.Value);
        break;
      }
      case (l.ValueKind === "binary" && l.Value !== void 0): {
        i.set("ValueKind", "binary"), i.set("binaryValue", bs(l.Value));
        break;
      }
      default:
        i.set("ValueKind", l.ValueKind ?? "none");
    }
    const f = wr(null, null, (l.innerEntries ?? []).length);
    (l.innerEntries ?? []).forEach((g, w) => {
      js(g, r, f[w], n);
    });
  } else {
    const l = s;
    i.set("TargetId", l.TargetId ?? "");
  }
}
var Re, de, En, Kt, He, Bt, pe, st, it, Me, Pe, Jn, $t, at, _t, h, O, Vt, _n, nt, $n, br, Zs, Ks, ye, pt, Rt, wn, Mt, bn, Pt, Bs, xr, $s, kr, Sr, T, Us, Ir, Tr, zs;
const vt = class vt extends gi {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(t, n) {
    var i;
    super();
    y(this, h);
    /**** private state ****/
    y(this, Re);
    y(this, de);
    y(this, En);
    y(this, Kt);
    y(this, He, null);
    y(this, Bt, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    y(this, pe, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId
    y(this, st, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    y(this, it, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId
    y(this, Me, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    y(this, Pe, /* @__PURE__ */ new Map());
    y(this, Jn, hi);
    // transaction nesting
    y(this, $t, 0);
    // ChangeSet accumulator inside a transaction
    y(this, at, {});
    // suppress index updates / change tracking when applying remote patches
    y(this, _t, !1);
    b(this, Re, t), b(this, de, t.getMap("Entries")), b(this, En, (n == null ? void 0 : n.LiteralSizeLimit) ?? di), b(this, Kt, (n == null ? void 0 : n.TrashTTLms) ?? 2592e6), d(this, h, Zs).call(this);
    const r = (n == null ? void 0 : n.TrashCheckIntervalMs) ?? Math.min(Math.floor(o(this, Kt) / 4), 36e5);
    b(this, He, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      r
    )), typeof ((i = o(this, He)) == null ? void 0 : i.unref) == "function" && o(this, He).unref();
  }
  /**** fromScratch — create a new store with root, trash, and lost-and-found items ****/
  static fromScratch(t) {
    const n = new er(), r = n.getMap("Entries"), i = r.setContainer(le, new N());
    i.set("Kind", "item"), i.set("outerItemId", ""), i.set("OrderKey", ""), i.setContainer("Label", new F()), i.setContainer("Info", new N()), i.set("MIMEType", ""), i.set("ValueKind", "none");
    const a = r.setContainer($, new N());
    a.set("Kind", "item"), a.set("outerItemId", le), a.set("OrderKey", "a0"), a.setContainer("Label", new F()).insert(0, "trash"), a.setContainer("Info", new N()), a.set("MIMEType", ""), a.set("ValueKind", "none");
    const l = r.setContainer(ge, new N());
    return l.set("Kind", "item"), l.set("outerItemId", le), l.set("OrderKey", "a1"), l.setContainer("Label", new F()).insert(0, "lost-and-found"), l.setContainer("Info", new N()), l.set("MIMEType", ""), l.set("ValueKind", "none"), n.commit(), new vt(n, t);
  }
  /**** fromBinary — restore store from gzip-compressed binary data ****/
  static fromBinary(t, n) {
    const r = new er();
    return r.import(ls(t)), new vt(r, n);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, n) {
    const r = typeof t == "string" ? JSON.parse(t) : t, i = new er(), a = i.getMap("Entries");
    return i.commit(), js(r, "", "", a), i.commit(), new vt(i, n);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — well-known data accessors ****/
  get RootItem() {
    return d(this, h, nt).call(this, le);
  }
  get TrashItem() {
    return d(this, h, nt).call(this, $);
  }
  get LostAndFoundItem() {
    return d(this, h, nt).call(this, ge);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve an entry by Id ****/
  EntryWithId(t) {
    if (d(this, h, O).call(this, t) != null)
      return d(this, h, _n).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, n, r) {
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    const i = t ?? Lt;
    mr(i), gn(r), d(this, h, Vt).call(this, n.Id);
    const a = crypto.randomUUID(), c = d(this, h, Mt).call(this, n.Id, r), l = i === Lt ? "" : i;
    return this.transact(() => {
      const u = o(this, de).setContainer(a, new N());
      u.set("Kind", "item"), u.set("outerItemId", n.Id), u.set("OrderKey", c), u.setContainer("Label", new F()), u.setContainer("Info", new N()), u.set("MIMEType", l), u.set("ValueKind", "none"), d(this, h, ye).call(this, n.Id, a), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, a, "outerItem");
    }), d(this, h, nt).call(this, a);
  }
  /**** newLinkAt — create a new link within an outer data ****/
  newLinkAt(t, n, r) {
    if (t == null) throw new R("invalid-argument", "Target must not be missing");
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    gn(r), d(this, h, Vt).call(this, t.Id), d(this, h, Vt).call(this, n.Id);
    const i = crypto.randomUUID(), a = d(this, h, Mt).call(this, n.Id, r);
    return this.transact(() => {
      const c = o(this, de).setContainer(i, new N());
      c.set("Kind", "link"), c.set("outerItemId", n.Id), c.set("OrderKey", a), c.setContainer("Label", new F()), c.setContainer("Info", new N()), c.set("TargetId", t.Id), d(this, h, ye).call(this, n.Id, i), d(this, h, Rt).call(this, t.Id, i), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, i, "outerItem");
    }), d(this, h, $n).call(this, i);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, n, r) {
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    gn(r), d(this, h, Vt).call(this, n.Id);
    const i = t;
    if (i == null || i.Kind !== "item")
      throw new R("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const a = /* @__PURE__ */ new Map();
    d(this, h, Ir).call(this, i, a);
    const c = d(this, h, Mt).call(this, n.Id, r), l = a.get(i.Id);
    return this.transact(() => {
      d(this, h, Tr).call(this, i, n.Id, c, a), d(this, h, T).call(this, n.Id, "innerEntryList");
    }), d(this, h, nt).call(this, l);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, n, r) {
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    gn(r), d(this, h, Vt).call(this, n.Id);
    const i = t;
    if (i == null || i.Kind !== "link")
      throw new R("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const a = crypto.randomUUID(), c = d(this, h, Mt).call(this, n.Id, r);
    return this.transact(() => {
      const l = o(this, de).setContainer(a, new N());
      l.set("Kind", "link"), l.set("outerItemId", n.Id), l.set("OrderKey", c);
      const u = l.setContainer("Label", new F());
      i.Label && u.insert(0, i.Label);
      const f = l.setContainer("Info", new N());
      for (const [g, w] of Object.entries(i.Info ?? {}))
        f.set(g, w);
      l.set("TargetId", i.TargetId ?? ""), d(this, h, ye).call(this, n.Id, a), i.TargetId && d(this, h, Rt).call(this, i.TargetId, a), d(this, h, T).call(this, n.Id, "innerEntryList");
    }), d(this, h, $n).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  /**** moveEntryTo — move an entry to a different outer data ****/
  moveEntryTo(t, n, r) {
    if (gn(r), !this._mayMoveEntryTo(t.Id, n.Id, r))
      throw new R(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const i = this._outerItemIdOf(t.Id), a = d(this, h, Mt).call(this, n.Id, r);
    this.transact(() => {
      const c = d(this, h, O).call(this, t.Id);
      if (c.set("outerItemId", n.Id), c.set("OrderKey", a), i === $ && n.Id !== $) {
        const l = c.get("Info");
        l instanceof N && l.get("_trashedAt") != null && (l.delete("_trashedAt"), d(this, h, T).call(this, t.Id, "Info._trashedAt"));
      }
      i != null && (d(this, h, pt).call(this, i, t.Id), d(this, h, T).call(this, i, "innerEntryList")), d(this, h, ye).call(this, n.Id, t.Id), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const n = d(this, h, Pt).call(this, t);
    if (n.length === 0)
      return;
    const r = wr(null, null, n.length);
    n.forEach((i, a) => {
      const c = d(this, h, O).call(this, i.Id);
      c != null && (c.set("OrderKey", r[a]), d(this, h, T).call(this, i.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new R("delete-not-permitted", "this entry cannot be deleted");
    const n = this._outerItemIdOf(t.Id), r = ze(d(this, h, bn).call(this, $), null);
    this.transact(() => {
      const i = d(this, h, O).call(this, t.Id);
      i.set("outerItemId", $), i.set("OrderKey", r);
      let a = i.get("Info");
      a instanceof N || (a = i.setContainer("Info", new N())), a.set("_trashedAt", Date.now()), n != null && (d(this, h, pt).call(this, n, t.Id), d(this, h, T).call(this, n, "innerEntryList")), d(this, h, ye).call(this, $, t.Id), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem"), d(this, h, T).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete a trash entry ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== $)
      throw new R(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, h, Bs).call(this, t.Id))
      throw new R(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, h, Sr).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    const n = t ?? o(this, Kt);
    if (n == null)
      return 0;
    const r = Date.now(), i = Array.from(o(this, pe).get($) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const c of i) {
      const l = d(this, h, O).call(this, c);
      if (l == null || l.get("outerItemId") !== $)
        continue;
      const u = l.get("Info"), f = u instanceof N ? u.get("_trashedAt") : void 0;
      if (typeof f == "number" && !(r - f < n))
        try {
          this.purgeEntry(d(this, h, _n).call(this, c)), a++;
        } catch {
        }
    }
    return a;
  }
  /**** dispose — cleanup and stop background timers ****/
  dispose() {
    o(this, He) != null && (clearInterval(o(this, He)), b(this, He, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute operations within a batch transaction ****/
  transact(t) {
    Kn(this, $t)._++;
    try {
      t();
    } finally {
      if (Kn(this, $t)._--, o(this, $t) === 0) {
        o(this, _t) || o(this, Re).commit();
        const n = { ...o(this, at) };
        b(this, at, {});
        const r = o(this, _t) ? "external" : "internal";
        d(this, h, Us).call(this, r, n);
      }
    }
  }
  /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
  onChangeInvoke(t) {
    return o(this, Bt).add(t), () => {
      o(this, Bt).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — merge remote changes and rebuild indices ****/
  applyRemotePatch(t) {
    b(this, _t, !0);
    try {
      o(this, Re).import(t), this.transact(() => {
        d(this, h, Ks).call(this);
      });
    } finally {
      b(this, _t, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get current version vector as sync cursor ****/
  get currentCursor() {
    return o(this, Re).version().encode();
  }
  /**** exportPatch — generate a change patch since a given cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? o(this, Re).export({ mode: "snapshot" }) : o(this, Re).export({ mode: "update", from: li.decode(t) });
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = new Set(Object.keys(o(this, de).toJSON()));
    this.transact(() => {
      const n = o(this, de).toJSON();
      for (const [r, i] of Object.entries(n)) {
        if (r === le)
          continue;
        const a = i.outerItemId;
        if (a && !t.has(a)) {
          const c = ze(d(this, h, bn).call(this, ge), null), l = d(this, h, O).call(this, r);
          l.set("outerItemId", ge), l.set("OrderKey", c), d(this, h, ye).call(this, ge, r), d(this, h, T).call(this, r, "outerItem"), d(this, h, T).call(this, ge, "innerEntryList");
        }
        if (i.Kind === "link") {
          const c = i.TargetId;
          if (c && !t.has(c)) {
            const l = ze(d(this, h, bn).call(this, ge), null), u = o(this, de).setContainer(c, new N());
            u.set("Kind", "item"), u.set("outerItemId", ge), u.set("OrderKey", l), u.setContainer("Label", new F()), u.setContainer("Info", new N()), u.set("MIMEType", ""), u.set("ValueKind", "none"), d(this, h, ye).call(this, ge, c), t.add(c), d(this, h, T).call(this, ge, "innerEntryList");
          }
        }
      }
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  /**** asBinary — export store as gzip-compressed Loro snapshot ****/
  asBinary() {
    return cs(o(this, Re).export({ mode: "snapshot" }));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, n, r) {
    const i = new TextDecoder().decode(ls(t));
    return this.newEntryFromJSONat(JSON.parse(i), n, r);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const n = JSON.stringify(this._EntryAsJSON(t));
    return cs(new TextEncoder().encode(n));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (data or link) ****/
  _KindOf(t) {
    const n = d(this, h, O).call(this, t);
    if (n == null)
      throw new R("not-found", `entry '${t}' not found`);
    return n.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const n = d(this, h, O).call(this, t);
    if (n == null)
      return "";
    const r = n.get("Label");
    return r instanceof F ? r.toString() : String(r ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, n) {
    Ts(n), this.transact(() => {
      const r = d(this, h, O).call(this, t);
      if (r == null)
        return;
      let i = r.get("Label");
      if (i instanceof F) {
        const a = i.toString().length;
        a > 0 && i.delete(0, a), n.length > 0 && i.insert(0, n);
      } else
        i = r.setContainer("Label", new F()), n.length > 0 && i.insert(0, n);
      d(this, h, T).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const n = d(this, h, O).call(this, t), r = (n == null ? void 0 : n.get("MIMEType")) ?? "";
    return r === "" ? Lt : r;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, n) {
    mr(n);
    const r = n === Lt ? "" : n;
    this.transact(() => {
      var i;
      (i = d(this, h, O).call(this, t)) == null || i.set("MIMEType", r), d(this, h, T).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get value kind (none, literal, binary, reference types) ****/
  _ValueKindOf(t) {
    const n = d(this, h, O).call(this, t);
    return (n == null ? void 0 : n.get("ValueKind")) ?? "none";
  }
  /**** _readValueOf — read entry value (literal or binary) ****/
  async _readValueOf(t) {
    const n = this._ValueKindOf(t);
    switch (!0) {
      case n === "none":
        return;
      case n === "literal": {
        const r = d(this, h, O).call(this, t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : String(i ?? "");
      }
      case n === "binary": {
        const r = d(this, h, O).call(this, t), i = r == null ? void 0 : r.get("binaryValue");
        return i instanceof Uint8Array ? i : void 0;
      }
      default: {
        const r = this._getValueRefOf(t);
        if (r == null)
          return;
        const i = await this._getValueBlobAsync(r.Hash);
        return i == null ? void 0 : n === "literal-reference" ? new TextDecoder().decode(i) : i;
      }
    }
  }
  /**** _writeValueOf — write entry value with automatic storage strategy ****/
  _writeValueOf(t, n) {
    this.transact(() => {
      const r = d(this, h, O).call(this, t);
      if (r != null) {
        switch (!0) {
          case n == null: {
            r.set("ValueKind", "none");
            break;
          }
          case (typeof n == "string" && n.length <= o(this, En)): {
            r.set("ValueKind", "literal");
            let i = r.get("literalValue");
            if (i instanceof F) {
              const a = i.toString().length;
              a > 0 && i.delete(0, a), n.length > 0 && i.insert(0, n);
            } else
              i = r.setContainer("literalValue", new F()), n.length > 0 && i.insert(0, n);
            break;
          }
          case typeof n == "string": {
            const a = new TextEncoder().encode(n), c = vt._blobHash(a);
            this._storeValueBlob(c, a), r.set("ValueKind", "literal-reference"), r.set("ValueRef", JSON.stringify({ Hash: c, Size: a.byteLength }));
            break;
          }
          case n.byteLength <= ui: {
            r.set("ValueKind", "binary"), r.set("binaryValue", n);
            break;
          }
          default: {
            const i = n, a = vt._blobHash(i);
            this._storeValueBlob(a, i), r.set("ValueKind", "binary-reference"), r.set("ValueRef", JSON.stringify({ Hash: a, Size: i.byteLength }));
            break;
          }
        }
        d(this, h, T).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value text at a range ****/
  _spliceValueOf(t, n, r, i) {
    if (this._ValueKindOf(t) !== "literal")
      throw new R(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const a = d(this, h, O).call(this, t), c = a == null ? void 0 : a.get("literalValue");
      if (c instanceof F) {
        const l = r - n;
        l > 0 && c.delete(n, l), i.length > 0 && c.insert(n, i);
      }
      d(this, h, T).call(this, t, "Value");
    });
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const n = d(this, h, O).call(this, t);
    if (n == null)
      return;
    const r = this._ValueKindOf(t);
    if (r !== "literal-reference" && r !== "binary-reference")
      return;
    const i = n.get("ValueRef");
    if (i != null)
      return typeof i == "string" ? JSON.parse(i) : i;
  }
  /**** _InfoProxyOf — get proxy for arbitrary metadata object ****/
  _InfoProxyOf(t) {
    const n = this;
    return new Proxy({}, {
      get(r, i) {
        var l;
        if (typeof i != "string")
          return;
        const a = d(l = n, h, O).call(l, t), c = a == null ? void 0 : a.get("Info");
        return c instanceof N ? c.get(i) : void 0;
      },
      set(r, i, a) {
        return typeof i != "string" ? !1 : a === void 0 ? (n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t), l = c == null ? void 0 : c.get("Info");
          if (l instanceof N) {
            const g = l.get(i) !== void 0;
            l.delete(i), g && d(f = n, h, T).call(f, t, `Info.${i}`);
          }
        }), !0) : (Qi(i), Yi(a), n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t);
          if (c == null)
            return;
          let l = c.get("Info");
          l instanceof N || (l = c.setContainer("Info", new N())), l.set(i, a), d(f = n, h, T).call(f, t, `Info.${i}`);
        }), !0);
      },
      deleteProperty(r, i) {
        return typeof i != "string" ? !1 : (n.transact(() => {
          var l, u;
          const a = d(l = n, h, O).call(l, t), c = a == null ? void 0 : a.get("Info");
          if (c instanceof N) {
            const f = c.get(i) !== void 0;
            c.delete(i), f && d(u = n, h, T).call(u, t, `Info.${i}`);
          }
        }), !0);
      },
      ownKeys() {
        var a;
        const r = d(a = n, h, O).call(a, t), i = r == null ? void 0 : r.get("Info");
        return i instanceof N ? Object.keys(i.toJSON()) : [];
      },
      getOwnPropertyDescriptor(r, i) {
        var u;
        if (typeof i != "string")
          return;
        const a = d(u = n, h, O).call(u, t), c = a == null ? void 0 : a.get("Info");
        if (!(c instanceof N))
          return;
        const l = c.get(i);
        return l !== void 0 ? { configurable: !0, enumerable: !0, value: l } : void 0;
      }
    });
  }
  /**** _outerItemIdOf — get outer item Id or undefined ****/
  _outerItemIdOf(t) {
    const n = d(this, h, O).call(this, t), r = n == null ? void 0 : n.get("outerItemId");
    return r != null && r !== "" ? r : void 0;
  }
  /**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/
  _innerEntriesOf(t) {
    const n = this, r = d(this, h, Pt).call(this, t);
    return new Proxy([], {
      get(i, a) {
        var c;
        if (a === "length")
          return r.length;
        if (a === Symbol.iterator)
          return function* () {
            var l;
            for (let u = 0; u < r.length; u++)
              yield d(l = n, h, _n).call(l, r[u].Id);
          };
        if (typeof a == "string" && !isNaN(Number(a))) {
          const l = Number(a);
          return l >= 0 && l < r.length ? d(c = n, h, _n).call(c, r[l].Id) : void 0;
        }
        return i[a];
      }
    });
  }
  /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
  _mayMoveEntryTo(t, n, r) {
    return t === le || t === n ? !1 : t === $ || t === ge ? n === le : !d(this, h, zs).call(this, n, t);
  }
  /**** _mayDeleteEntry — check if entry is deletable ****/
  _mayDeleteEntry(t) {
    return t !== le && t !== $ && t !== ge;
  }
  /**** _TargetOf — get the target data for a link ****/
  _TargetOf(t) {
    const n = d(this, h, O).call(this, t), r = n == null ? void 0 : n.get("TargetId");
    if (!r)
      throw new R("not-found", `link '${t}' has no target`);
    return d(this, h, nt).call(this, r);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const n = this._ValueKindOf(t);
    switch (!0) {
      case n === "literal": {
        const r = d(this, h, O).call(this, t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : String(i ?? "");
      }
      case n === "binary": {
        const r = d(this, h, O).call(this, t), i = r == null ? void 0 : r.get("binaryValue");
        return i instanceof Uint8Array ? i : void 0;
      }
      default:
        return;
    }
  }
};
Re = new WeakMap(), de = new WeakMap(), En = new WeakMap(), Kt = new WeakMap(), He = new WeakMap(), Bt = new WeakMap(), pe = new WeakMap(), st = new WeakMap(), it = new WeakMap(), Me = new WeakMap(), Pe = new WeakMap(), Jn = new WeakMap(), $t = new WeakMap(), at = new WeakMap(), _t = new WeakMap(), h = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry Id ****/
O = function(t) {
  const n = o(this, de).get(t);
  if (n instanceof N && !(n.get("outerItemId") === "" && t !== le))
    return n;
}, /**** #requireItemExists — throw if data does not exist ****/
Vt = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null || n.get("Kind") !== "item")
    throw new R("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped / #wrappedItem / #wrappedLink — return cached wrapper objects ****/
_n = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null)
    throw new R("invalid-argument", `entry '${t}' not found`);
  return n.get("Kind") === "item" ? d(this, h, nt).call(this, t) : d(this, h, $n).call(this, t);
}, nt = function(t) {
  const n = o(this, Pe).get(t);
  if (n instanceof rs)
    return n;
  const r = new rs(this, t);
  return d(this, h, br).call(this, t, r), r;
}, $n = function(t) {
  const n = o(this, Pe).get(t);
  if (n instanceof ss)
    return n;
  const r = new ss(this, t);
  return d(this, h, br).call(this, t, r), r;
}, /**** #CacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/
br = function(t, n) {
  if (o(this, Pe).size >= o(this, Jn)) {
    const r = o(this, Pe).keys().next().value;
    r != null && o(this, Pe).delete(r);
  }
  o(this, Pe).set(t, n);
}, /**** #rebuildIndices — full rebuild of all indices from scratch ****/
Zs = function() {
  o(this, pe).clear(), o(this, st).clear(), o(this, it).clear(), o(this, Me).clear();
  const t = o(this, de).toJSON();
  for (const [n, r] of Object.entries(t)) {
    const i = r.outerItemId;
    if (i && d(this, h, ye).call(this, i, n), r.Kind === "link") {
      const a = r.TargetId;
      a && d(this, h, Rt).call(this, a, n);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Ks = function() {
  const t = o(this, de).toJSON(), n = /* @__PURE__ */ new Set();
  for (const [a, c] of Object.entries(t)) {
    n.add(a);
    const l = c.outerItemId || void 0, u = o(this, st).get(a);
    switch (l !== u && (u != null && (d(this, h, pt).call(this, u, a), d(this, h, T).call(this, u, "innerEntryList")), l != null && (d(this, h, ye).call(this, l, a), d(this, h, T).call(this, l, "innerEntryList")), d(this, h, T).call(this, a, "outerItem")), !0) {
      case c.Kind === "link": {
        const f = c.TargetId, g = o(this, Me).get(a);
        f !== g && (g != null && d(this, h, wn).call(this, g, a), f != null && d(this, h, Rt).call(this, f, a));
        break;
      }
      case o(this, Me).has(a):
        d(this, h, wn).call(this, o(this, Me).get(a), a);
        break;
    }
    d(this, h, T).call(this, a, "Label");
  }
  const r = Array.from(o(this, st).entries()).filter(([a]) => !n.has(a));
  for (const [a, c] of r)
    d(this, h, pt).call(this, c, a), d(this, h, T).call(this, c, "innerEntryList");
  const i = Array.from(o(this, Me).entries()).filter(([a]) => !n.has(a));
  for (const [a, c] of i)
    d(this, h, wn).call(this, c, a);
}, /**** #addToReverseIndex — add entry to reverse and forward indices ****/
ye = function(t, n) {
  let r = o(this, pe).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), o(this, pe).set(t, r)), r.add(n), o(this, st).set(n, t);
}, /**** #removeFromReverseIndex — remove entry from indices ****/
pt = function(t, n) {
  var r;
  (r = o(this, pe).get(t)) == null || r.delete(n), o(this, st).delete(n);
}, /**** #addToLinkTargetIndex — add link to target and forward indices ****/
Rt = function(t, n) {
  let r = o(this, it).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), o(this, it).set(t, r)), r.add(n), o(this, Me).set(n, t);
}, /**** #removeFromLinkTargetIndex — remove link from indices ****/
wn = function(t, n) {
  var r;
  (r = o(this, it).get(t)) == null || r.delete(n), o(this, Me).delete(n);
}, /**** #OrderKeyAt — generate fractional order key for insertion position ****/
Mt = function(t, n) {
  const r = (c) => {
    if (c.length === 0 || n == null) {
      const u = c.length > 0 ? c[c.length - 1].OrderKey : null;
      return ze(u, null);
    }
    const l = Math.max(0, Math.min(n, c.length));
    return ze(
      l > 0 ? c[l - 1].OrderKey : null,
      l < c.length ? c[l].OrderKey : null
    );
  };
  let i = d(this, h, Pt).call(this, t);
  const a = r(i);
  return a.length <= fi ? a : (this._rebalanceInnerEntriesOf(t), r(d(this, h, Pt).call(this, t)));
}, /**** #lastOrderKeyOf — get the last order key for an entry's children ****/
bn = function(t) {
  const n = d(this, h, Pt).call(this, t);
  return n.length > 0 ? n[n.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/
Pt = function(t) {
  const n = o(this, pe).get(t) ?? /* @__PURE__ */ new Set(), r = [];
  for (const i of n) {
    const a = d(this, h, O).call(this, i);
    (a == null ? void 0 : a.get("outerItemId")) === t && r.push({ Id: i, OrderKey: a.get("OrderKey") ?? "" });
  }
  return r.sort((i, a) => i.OrderKey < a.OrderKey ? -1 : i.OrderKey > a.OrderKey ? 1 : i.Id < a.Id ? -1 : i.Id > a.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
Bs = function(t) {
  const n = d(this, h, kr).call(this), r = /* @__PURE__ */ new Set();
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const a of o(this, pe).get($) ?? /* @__PURE__ */ new Set())
      r.has(a) || d(this, h, xr).call(this, a, n, r) && (r.add(a), i = !0);
  }
  return r.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has links from reachable entries ****/
xr = function(t, n, r) {
  const i = [t], a = /* @__PURE__ */ new Set();
  for (; i.length > 0; ) {
    const c = i.pop();
    if (a.has(c))
      continue;
    a.add(c);
    const l = o(this, it).get(c) ?? /* @__PURE__ */ new Set();
    for (const u of l) {
      if (n.has(u))
        return !0;
      const f = d(this, h, $s).call(this, u);
      if (f != null && r.has(f))
        return !0;
    }
    for (const u of o(this, pe).get(c) ?? /* @__PURE__ */ new Set())
      a.has(u) || i.push(u);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — get direct inner entry of TrashItem containing an entry ****/
$s = function(t) {
  let n = t;
  for (; n != null; ) {
    const r = this._outerItemIdOf(n);
    if (r === $)
      return n;
    if (r === le || r == null)
      return null;
    n = r;
  }
  return null;
}, /**** #reachableFromRoot — get all entries reachable from root ****/
kr = function() {
  const t = /* @__PURE__ */ new Set(), n = [le];
  for (; n.length > 0; ) {
    const r = n.pop();
    if (!t.has(r)) {
      t.add(r);
      for (const i of o(this, pe).get(r) ?? /* @__PURE__ */ new Set())
        t.has(i) || n.push(i);
    }
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Sr = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null)
    return;
  const r = n.get("Kind"), i = n.get("outerItemId"), a = d(this, h, kr).call(this), c = /* @__PURE__ */ new Set(), l = Array.from(o(this, pe).get(t) ?? /* @__PURE__ */ new Set());
  for (const u of l)
    if (d(this, h, xr).call(this, u, a, c)) {
      const f = d(this, h, O).call(this, u), g = ze(d(this, h, bn).call(this, $), null);
      f.set("outerItemId", $), f.set("OrderKey", g), d(this, h, pt).call(this, t, u), d(this, h, ye).call(this, $, u), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, u, "outerItem");
    } else
      d(this, h, Sr).call(this, u);
  if (d(this, h, T).call(this, t, "Existence"), n.set("outerItemId", ""), n.set("OrderKey", ""), i && (d(this, h, pt).call(this, i, t), d(this, h, T).call(this, i, "innerEntryList")), r === "link") {
    const u = n.get("TargetId");
    u && d(this, h, wn).call(this, u, t);
  }
  o(this, Pe).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
T = function(t, n) {
  o(this, at)[t] == null && (o(this, at)[t] = /* @__PURE__ */ new Set()), o(this, at)[t].add(n);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
Us = function(t, n) {
  if (Object.keys(n).length !== 0)
    for (const r of o(this, Bt))
      try {
        r(t, n);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
Ir = function(t, n) {
  if (n.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const r of t.innerEntries ?? [])
      d(this, h, Ir).call(this, r, n);
}, /**** #importEntryFromJSON — recursively create a Loro entry and update indices ****/
Tr = function(t, n, r, i) {
  const a = i.get(t.Id), c = o(this, de).setContainer(a, new N());
  c.set("Kind", t.Kind), c.set("outerItemId", n), c.set("OrderKey", r);
  const l = c.setContainer("Label", new F());
  t.Label && l.insert(0, t.Label);
  const u = c.setContainer("Info", new N());
  for (const [f, g] of Object.entries(t.Info ?? {}))
    u.set(f, g);
  if (t.Kind === "item") {
    const f = t, g = f.Type === Lt ? "" : f.Type ?? "";
    switch (c.set("MIMEType", g), !0) {
      case (f.ValueKind === "literal" && f.Value !== void 0): {
        c.set("ValueKind", "literal");
        const V = c.setContainer("literalValue", new F());
        f.Value.length > 0 && V.insert(0, f.Value);
        break;
      }
      case (f.ValueKind === "binary" && f.Value !== void 0): {
        c.set("ValueKind", "binary"), c.set("binaryValue", bs(f.Value));
        break;
      }
      default:
        c.set("ValueKind", f.ValueKind ?? "none");
    }
    d(this, h, ye).call(this, n, a);
    const w = wr(null, null, (f.innerEntries ?? []).length);
    (f.innerEntries ?? []).forEach((V, W) => {
      d(this, h, Tr).call(this, V, a, w[W], i);
    });
  } else {
    const f = t, g = i.has(f.TargetId) ? i.get(f.TargetId) : f.TargetId;
    c.set("TargetId", g ?? ""), d(this, h, ye).call(this, n, a), g && d(this, h, Rt).call(this, g, a);
  }
}, /**** #isDescendantOf — check if one entry is a descendant of another ****/
zs = function(t, n) {
  let r = t;
  for (; r != null; ) {
    if (r === n)
      return !0;
    r = this._outerItemIdOf(r);
  }
  return !1;
};
let hs = vt;
const fs = 1, ms = 2, gs = 3, ys = 4, ps = 5, Ve = 32, Bn = 1024 * 1024;
function ar(...s) {
  const e = s.reduce((r, i) => r + i.byteLength, 0), t = new Uint8Array(e);
  let n = 0;
  for (const r of s)
    t.set(r, n), n += r.byteLength;
  return t;
}
function yn(s, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = s, t.set(e, 1), t;
}
function vs(s) {
  const e = new Uint8Array(s.length / 2);
  for (let t = 0; t < s.length; t += 2)
    e[t / 2] = parseInt(s.slice(t, t + 2), 16);
  return e;
}
function _s(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var We, Je, An, Ut, wt, zt, bt, Ft, Ht, Wt, Ln, B, Or, Dt, xn, Fs, Hs, Ws;
class Ia {
  /**** constructor ****/
  constructor(e) {
    y(this, B);
    hn(this, "StoreId");
    y(this, We, "disconnected");
    y(this, Je);
    y(this, An, "");
    y(this, Ut);
    y(this, wt);
    y(this, zt, /* @__PURE__ */ new Set());
    y(this, bt, /* @__PURE__ */ new Set());
    y(this, Ft, /* @__PURE__ */ new Set());
    y(this, Ht, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    y(this, Wt, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    y(this, Ln, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, We);
  }
  /**** connect ****/
  async connect(e, t) {
    return b(this, An, e), b(this, Ut, t), d(this, B, Or).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, B, Hs).call(this), d(this, B, xn).call(this, "disconnected"), (e = o(this, Je)) == null || e.close(), b(this, Je, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, B, Dt).call(this, yn(fs, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const n = vs(e);
    if (t.byteLength <= Bn)
      d(this, B, Dt).call(this, yn(ms, ar(n, t)));
    else {
      const r = Math.ceil(t.byteLength / Bn);
      for (let i = 0; i < r; i++) {
        const a = i * Bn, c = t.slice(a, a + Bn), l = new Uint8Array(Ve + 8);
        l.set(n, 0), new DataView(l.buffer).setUint32(Ve, i, !1), new DataView(l.buffer).setUint32(Ve + 4, r, !1), d(this, B, Dt).call(this, yn(ps, ar(l, c)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, B, Dt).call(this, yn(gs, vs(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, zt).add(e), () => {
      o(this, zt).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, bt).add(e), () => {
      o(this, bt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, Ft).add(e), () => {
      o(this, Ft).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, B, Dt).call(this, yn(ys, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, Ht).add(e), () => {
      o(this, Ht).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, Ln);
  }
}
We = new WeakMap(), Je = new WeakMap(), An = new WeakMap(), Ut = new WeakMap(), wt = new WeakMap(), zt = new WeakMap(), bt = new WeakMap(), Ft = new WeakMap(), Ht = new WeakMap(), Wt = new WeakMap(), Ln = new WeakMap(), B = new WeakSet(), /**** #doConnect ****/
Or = function() {
  return new Promise((e, t) => {
    const n = `${o(this, An)}?token=${encodeURIComponent(o(this, Ut).Token)}`, r = new WebSocket(n);
    r.binaryType = "arraybuffer", b(this, Je, r), d(this, B, xn).call(this, "connecting"), r.onopen = () => {
      d(this, B, xn).call(this, "connected"), e();
    }, r.onerror = (i) => {
      o(this, We) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      b(this, Je, void 0), o(this, We) !== "disconnected" && (d(this, B, xn).call(this, "reconnecting"), d(this, B, Fs).call(this));
    }, r.onmessage = (i) => {
      d(this, B, Ws).call(this, new Uint8Array(i.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
Dt = function(e) {
  var t;
  ((t = o(this, Je)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, Je).send(e);
}, /**** #setState ****/
xn = function(e) {
  if (o(this, We) !== e) {
    b(this, We, e);
    for (const t of o(this, Ft))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Fs = function() {
  var t;
  const e = ((t = o(this, Ut)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  b(this, wt, setTimeout(() => {
    o(this, We) === "reconnecting" && d(this, B, Or).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Hs = function() {
  o(this, wt) != null && (clearTimeout(o(this, wt)), b(this, wt, void 0));
}, /**** #handleFrame ****/
Ws = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], n = e.slice(1);
  switch (t) {
    case fs: {
      for (const r of o(this, zt))
        try {
          r(n);
        } catch {
        }
      break;
    }
    case ms: {
      if (n.byteLength < Ve)
        return;
      const r = _s(n.slice(0, Ve)), i = n.slice(Ve);
      for (const a of o(this, bt))
        try {
          a(r, i);
        } catch {
        }
      break;
    }
    case gs:
      break;
    case ys: {
      try {
        const r = JSON.parse(new TextDecoder().decode(n));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), o(this, Ln).set(r.PeerId, r);
        for (const i of o(this, Ht))
          try {
            i(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case ps: {
      if (n.byteLength < Ve + 8)
        return;
      const r = _s(n.slice(0, Ve)), i = new DataView(n.buffer, n.byteOffset + Ve, 8), a = i.getUint32(0, !1), c = i.getUint32(4, !1), l = n.slice(Ve + 8);
      let u = o(this, Wt).get(r);
      if (u == null && (u = { total: c, chunks: /* @__PURE__ */ new Map() }, o(this, Wt).set(r, u)), u.chunks.set(a, l), u.chunks.size === u.total) {
        const f = ar(
          ...Array.from({ length: u.total }, (g, w) => u.chunks.get(w))
        );
        o(this, Wt).delete(r);
        for (const g of o(this, bt))
          try {
            g(r, f);
          } catch {
          }
      }
      break;
    }
  }
};
var Nn, Oe, re, ot, De, Ce, ct, Jt, qt, Gt, xt, Qt, ve, A, kn, Sn, Js, qs, Gs, Cr, Er, Qs, Ar, Ys;
class Ta {
  /**** Constructor ****/
  constructor(e, t = {}) {
    y(this, A);
    hn(this, "StoreId");
    y(this, Nn);
    y(this, Oe, crypto.randomUUID());
    y(this, re);
    /**** Signalling WebSocket ****/
    y(this, ot);
    /**** active RTCPeerConnection per remote PeerId ****/
    y(this, De, /* @__PURE__ */ new Map());
    y(this, Ce, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    y(this, ct, "disconnected");
    /**** Event Handlers ****/
    y(this, Jt, /* @__PURE__ */ new Set());
    y(this, qt, /* @__PURE__ */ new Set());
    y(this, Gt, /* @__PURE__ */ new Set());
    y(this, xt, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    y(this, Qt, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    y(this, ve, !1);
    this.StoreId = e, b(this, Nn, t), b(this, re, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, ct);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(e))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${e}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((n, r) => {
      const i = `${e}?token=${encodeURIComponent(t.Token)}`, a = new WebSocket(i);
      b(this, ot, a), d(this, A, kn).call(this, "connecting"), a.onopen = () => {
        d(this, A, kn).call(this, "connected"), d(this, A, Sn).call(this, { type: "hello", from: o(this, Oe) }), n();
      }, a.onerror = () => {
        if (!o(this, ve) && o(this, re) != null) {
          const c = e.replace("/signal/", "/ws/");
          b(this, ve, !0), o(this, re).connect(c, t).then(n).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, a.onclose = () => {
        o(this, ct) !== "disconnected" && (d(this, A, kn).call(this, "reconnecting"), setTimeout(() => {
          o(this, ct) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, a.onmessage = (c) => {
        try {
          const l = JSON.parse(c.data);
          d(this, A, Js).call(this, l, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, A, kn).call(this, "disconnected"), (e = o(this, ot)) == null || e.close(), b(this, ot, void 0);
    for (const t of o(this, De).values())
      t.close();
    o(this, De).clear(), o(this, Ce).clear(), o(this, ve) && o(this, re) != null && (o(this, re).disconnect(), b(this, ve, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var n;
    if (o(this, ve)) {
      (n = o(this, re)) == null || n.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of o(this, Ce).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var i;
    if (o(this, ve)) {
      (i = o(this, re)) == null || i.sendValue(e, t);
      return;
    }
    const n = d(this, A, Ar).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(n, 1), r.set(t, 33);
    for (const a of o(this, Ce).values())
      if (a.readyState === "open")
        try {
          a.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (o(this, ve)) {
      (r = o(this, re)) == null || r.requestValue(e);
      return;
    }
    const t = d(this, A, Ar).call(this, e), n = new Uint8Array(33);
    n[0] = 3, n.set(t, 1);
    for (const i of o(this, Ce).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Jt).add(e), o(this, ve) && o(this, re) != null ? o(this, re).onPatch(e) : () => {
      o(this, Jt).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, qt).add(e), o(this, ve) && o(this, re) != null ? o(this, re).onValue(e) : () => {
      o(this, qt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, Gt).add(e), () => {
      o(this, Gt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (o(this, ve)) {
      (r = o(this, re)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), n = new Uint8Array(1 + t.byteLength);
    n[0] = 4, n.set(t, 1);
    for (const i of o(this, Ce).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, xt).add(e), () => {
      o(this, xt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, Qt);
  }
}
Nn = new WeakMap(), Oe = new WeakMap(), re = new WeakMap(), ot = new WeakMap(), De = new WeakMap(), Ce = new WeakMap(), ct = new WeakMap(), Jt = new WeakMap(), qt = new WeakMap(), Gt = new WeakMap(), xt = new WeakMap(), Qt = new WeakMap(), ve = new WeakMap(), A = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
kn = function(e) {
  if (o(this, ct) !== e) {
    b(this, ct, e);
    for (const t of o(this, Gt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
Sn = function(e) {
  var t;
  ((t = o(this, ot)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, ot).send(JSON.stringify(e));
}, Js = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === o(this, Oe))
        return;
      o(this, De).has(e.from) || await d(this, A, qs).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== o(this, Oe))
        return;
      await d(this, A, Gs).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== o(this, Oe))
        return;
      const n = o(this, De).get(e.from);
      n != null && await n.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== o(this, Oe))
        return;
      const n = o(this, De).get(e.from);
      n != null && await n.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, qs = async function(e) {
  const t = d(this, A, Cr).call(this, e), n = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  d(this, A, Er).call(this, n, e), o(this, Ce).set(e, n);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, A, Sn).call(this, { type: "offer", from: o(this, Oe), to: e, sdp: r });
}, Gs = async function(e, t) {
  const n = d(this, A, Cr).call(this, e);
  await n.setRemoteDescription(new RTCSessionDescription(t));
  const r = await n.createAnswer();
  await n.setLocalDescription(r), d(this, A, Sn).call(this, { type: "answer", from: o(this, Oe), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Cr = function(e) {
  const t = o(this, Nn).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], n = new RTCPeerConnection({ iceServers: t });
  return o(this, De).set(e, n), n.onicecandidate = (r) => {
    r.candidate != null && d(this, A, Sn).call(this, {
      type: "candidate",
      from: o(this, Oe),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, n.ondatachannel = (r) => {
    d(this, A, Er).call(this, r.channel, e), o(this, Ce).set(e, r.channel);
  }, n.onconnectionstatechange = () => {
    if (n.connectionState === "failed" || n.connectionState === "closed") {
      o(this, De).delete(e), o(this, Ce).delete(e), o(this, Qt).delete(e);
      for (const r of o(this, xt))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, n;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
Er = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (n) => {
    const r = new Uint8Array(n.data);
    d(this, A, Qs).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Qs = function(e, t) {
  if (e.byteLength < 1)
    return;
  const n = e[0], r = e.slice(1);
  switch (n) {
    case 1: {
      for (const i of o(this, Jt))
        try {
          i(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const i = d(this, A, Ys).call(this, r.slice(0, 32)), a = r.slice(32);
      for (const c of o(this, qt))
        try {
          c(i, a);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const i = JSON.parse(new TextDecoder().decode(r));
        if (typeof i.PeerId != "string")
          break;
        i.lastSeen = Date.now(), o(this, Qt).set(i.PeerId, i);
        for (const a of o(this, xt))
          try {
            a(i.PeerId, i);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
Ar = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Ys = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Ie(s) {
  return new Promise((e, t) => {
    s.onsuccess = () => {
      e(s.result);
    }, s.onerror = () => {
      t(s.error);
    };
  });
}
function tt(s, e, t) {
  return s.transaction(e, t);
}
var qe, Ee, Vn, Ae, Ue;
class Oa {
  /**** constructor ****/
  constructor(e) {
    y(this, Ae);
    y(this, qe);
    y(this, Ee);
    y(this, Vn);
    b(this, Ee, e), b(this, Vn, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, Ae, Ue).call(this), t = tt(e, ["snapshots"], "readonly"), n = await Ie(
      t.objectStore("snapshots").get(o(this, Ee))
    );
    return n != null ? n.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await d(this, Ae, Ue).call(this), n = tt(t, ["snapshots"], "readwrite");
    await Ie(
      n.objectStore("snapshots").put({
        storeId: o(this, Ee),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await d(this, Ae, Ue).call(this), r = tt(t, ["patches"], "readonly").objectStore("patches"), i = IDBKeyRange.bound(
      [o(this, Ee), e + 1],
      [o(this, Ee), Number.MAX_SAFE_INTEGER]
    );
    return (await Ie(
      r.getAll(i)
    )).sort((c, l) => c.clock - l.clock).map((c) => c.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const n = await d(this, Ae, Ue).call(this), r = tt(n, ["patches"], "readwrite");
    try {
      await Ie(
        r.objectStore("patches").add({
          storeId: o(this, Ee),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await d(this, Ae, Ue).call(this), r = tt(t, ["patches"], "readwrite").objectStore("patches"), i = IDBKeyRange.bound(
      [o(this, Ee), 0],
      [o(this, Ee), e - 1]
    );
    await new Promise((a, c) => {
      const l = r.openCursor(i);
      l.onsuccess = () => {
        const u = l.result;
        if (u === null) {
          a();
          return;
        }
        u.delete(), u.continue();
      }, l.onerror = () => {
        c(l.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = await d(this, Ae, Ue).call(this), n = tt(t, ["values"], "readonly"), r = await Ie(
      n.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const n = await d(this, Ae, Ue).call(this), i = tt(n, ["values"], "readwrite").objectStore("values"), a = await Ie(
      i.get(e)
    );
    a != null ? await Ie(
      i.put({ hash: e, data: a.data, ref_count: a.ref_count + 1 })
    ) : await Ie(
      i.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await d(this, Ae, Ue).call(this), r = tt(t, ["values"], "readwrite").objectStore("values"), i = await Ie(
      r.get(e)
    );
    if (i == null)
      return;
    const a = i.ref_count - 1;
    a <= 0 ? await Ie(r.delete(e)) : await Ie(
      r.put({ hash: e, data: i.data, ref_count: a })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = o(this, qe)) == null || e.close(), b(this, qe, void 0);
  }
}
qe = new WeakMap(), Ee = new WeakMap(), Vn = new WeakMap(), Ae = new WeakSet(), Ue = async function() {
  return o(this, qe) != null ? o(this, qe) : new Promise((e, t) => {
    const n = indexedDB.open(o(this, Vn), 1);
    n.onupgradeneeded = (r) => {
      const i = r.target.result;
      i.objectStoreNames.contains("snapshots") || i.createObjectStore("snapshots", { keyPath: "storeId" }), i.objectStoreNames.contains("patches") || i.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), i.objectStoreNames.contains("values") || i.createObjectStore("values", { keyPath: "hash" });
    }, n.onsuccess = (r) => {
      b(this, qe, r.target.result), e(o(this, qe));
    }, n.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const ba = 512 * 1024;
var X, U, P, lt, Yt, Xt, Rn, Mn, kt, en, dt, tn, St, It, Tt, Ge, ut, Le, Pn, nn, Qe, je, M, Xs, ei, ti, ni, ri, Lr, si, Nr, ii, ai, Vr;
class Ca {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    y(this, M);
    y(this, X);
    y(this, U);
    y(this, P);
    y(this, lt);
    y(this, Yt);
    hn(this, "PeerId", crypto.randomUUID());
    y(this, Xt);
    y(this, Rn);
    y(this, Mn, []);
    // outgoing patch queue (patches created while disconnected)
    y(this, kt, 0);
    // accumulated patch bytes since last checkpoint
    y(this, en, 0);
    // sequence number of the last saved snapshot
    y(this, dt, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    y(this, tn, new Uint8Array(0));
    // heartbeat timer
    y(this, St);
    y(this, It);
    // presence peer tracking
    y(this, Tt, /* @__PURE__ */ new Map());
    y(this, Ge, /* @__PURE__ */ new Map());
    y(this, ut, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    y(this, Le);
    // connection state mirror
    y(this, Pn, "disconnected");
    y(this, nn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    y(this, Qe, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    y(this, je, /* @__PURE__ */ new Map());
    b(this, X, e), b(this, U, t.PersistenceProvider ?? void 0), b(this, P, t.NetworkProvider ?? void 0), b(this, lt, t.PresenceProvider ?? t.NetworkProvider ?? void 0), b(this, Yt, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && o(this, P) != null && b(this, Le, new BroadcastChannel(`sns:${o(this, P).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    o(this, U) != null && o(this, X).setValueBlobLoader(
      (e) => o(this, U).loadValue(e)
    ), await d(this, M, Xs).call(this), d(this, M, ei).call(this), d(this, M, ti).call(this), d(this, M, ni).call(this), d(this, M, ri).call(this), o(this, P) != null && o(this, P).onConnectionChange((e) => {
      b(this, Pn, e);
      for (const t of o(this, nn))
        try {
          t(e);
        } catch {
        }
      e === "connected" && d(this, M, si).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, n;
    o(this, St) != null && (clearInterval(o(this, St)), b(this, St, void 0));
    for (const r of o(this, Ge).values())
      clearTimeout(r);
    o(this, Ge).clear();
    for (const r of o(this, Qe))
      try {
        r();
      } catch {
      }
    b(this, Qe, []), (e = o(this, Le)) == null || e.close(), b(this, Le, void 0), (t = o(this, P)) == null || t.disconnect(), o(this, U) != null && o(this, kt) > 0 && await d(this, M, Lr).call(this), await ((n = o(this, U)) == null ? void 0 : n.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (o(this, P) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    b(this, Xt, e), b(this, Rn, t), await o(this, P).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (o(this, P) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    o(this, P).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (o(this, P) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    if (o(this, Xt) == null)
      throw new R(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await o(this, P).connect(o(this, Xt), o(this, Rn));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, Pn);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, nn).add(e), () => {
      o(this, nn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var n, r;
    b(this, It, e);
    const t = { ...e, PeerId: this.PeerId };
    (n = o(this, lt)) == null || n.sendLocalState(e), (r = o(this, Le)) == null || r.postMessage({ type: "presence", payload: e });
    for (const i of o(this, ut))
      try {
        i(this.PeerId, t, "local");
      } catch (a) {
        console.error("SDS: presence handler failed", a);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return o(this, Tt);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return o(this, ut).add(e), () => {
      o(this, ut).delete(e);
    };
  }
}
X = new WeakMap(), U = new WeakMap(), P = new WeakMap(), lt = new WeakMap(), Yt = new WeakMap(), Xt = new WeakMap(), Rn = new WeakMap(), Mn = new WeakMap(), kt = new WeakMap(), en = new WeakMap(), dt = new WeakMap(), tn = new WeakMap(), St = new WeakMap(), It = new WeakMap(), Tt = new WeakMap(), Ge = new WeakMap(), ut = new WeakMap(), Le = new WeakMap(), Pn = new WeakMap(), nn = new WeakMap(), Qe = new WeakMap(), je = new WeakMap(), M = new WeakSet(), Xs = async function() {
  if (o(this, U) == null)
    return;
  await o(this, U).loadSnapshot();
  const e = await o(this, U).loadPatchesSince(o(this, en));
  for (const t of e)
    try {
      o(this, X).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && b(this, dt, o(this, en) + e.length), b(this, tn, o(this, X).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
ei = function() {
  const e = o(this, X).onChangeInvoke((t, n) => {
    var a, c;
    if (t === "external") {
      d(this, M, Nr).call(this, n, "request").catch(() => {
      });
      return;
    }
    const r = o(this, tn);
    Kn(this, dt)._++;
    const i = o(this, X).exportPatch(r);
    b(this, tn, o(this, X).currentCursor), i.byteLength !== 0 && (o(this, U) != null && (o(this, U).appendPatch(i, o(this, dt)).catch(() => {
    }), b(this, kt, o(this, kt) + i.byteLength), o(this, kt) >= ba && d(this, M, Lr).call(this).catch(() => {
    })), ((a = o(this, P)) == null ? void 0 : a.ConnectionState) === "connected" ? (o(this, P).sendPatch(i), (c = o(this, Le)) == null || c.postMessage({ type: "patch", payload: i })) : o(this, Mn).push(i), d(this, M, Nr).call(this, n, "send").catch(() => {
    }));
  });
  o(this, Qe).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
ti = function() {
  if (o(this, P) != null) {
    const t = o(this, P).onPatch((r) => {
      try {
        o(this, X).applyRemotePatch(r);
      } catch {
      }
    });
    o(this, Qe).push(t);
    const n = o(this, P).onValue(async (r, i) => {
      var a;
      o(this, X).storeValueBlob(r, i), await ((a = o(this, U)) == null ? void 0 : a.saveValue(r, i));
    });
    o(this, Qe).push(n);
  }
  const e = o(this, lt);
  if (e != null) {
    const t = e.onRemoteState((n, r) => {
      d(this, M, ii).call(this, n, r);
    });
    o(this, Qe).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
ni = function() {
  const e = o(this, Yt) / 4;
  b(this, St, setInterval(() => {
    var t, n;
    o(this, It) != null && ((t = o(this, lt)) == null || t.sendLocalState(o(this, It)), (n = o(this, Le)) == null || n.postMessage({ type: "presence", payload: o(this, It) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
ri = function() {
  o(this, Le) != null && (o(this, Le).onmessage = (e) => {
    var n;
    const t = e.data;
    switch (!0) {
      case t.type === "patch":
        try {
          o(this, X).applyRemotePatch(t.payload);
        } catch (r) {
          console.error("SDS: failed to apply remote patch from BroadcastChannel", r);
        }
        break;
      case t.type === "presence":
        (n = o(this, lt)) == null || n.sendLocalState(t.payload);
        break;
    }
  });
}, Lr = async function() {
  o(this, U) != null && (await o(this, U).saveSnapshot(o(this, X).asBinary()), await o(this, U).prunePatches(o(this, dt)), b(this, en, o(this, dt)), b(this, kt, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
si = function() {
  var t;
  const e = o(this, Mn).splice(0);
  for (const n of e)
    try {
      (t = o(this, P)) == null || t.sendPatch(n);
    } catch (r) {
      console.error("SDS: failed to send queued patch", r);
    }
}, Nr = async function(e, t) {
  var n, r, i;
  for (const [a, c] of Object.entries(e)) {
    const l = c;
    if (l.has("Existence")) {
      const w = o(this, je).get(a);
      w != null && (await ((n = o(this, U)) == null ? void 0 : n.releaseValue(w)), o(this, je).delete(a));
    }
    if (!l.has("Value"))
      continue;
    const u = o(this, je).get(a), f = o(this, X)._getValueRefOf(a), g = f == null ? void 0 : f.Hash;
    if (u != null && u !== g && (await ((r = o(this, U)) == null ? void 0 : r.releaseValue(u)), o(this, je).delete(a)), f != null) {
      if (o(this, P) == null) {
        o(this, je).set(a, f.Hash);
        continue;
      }
      if (t === "send") {
        const w = o(this, X).getValueBlobByHash(f.Hash);
        w != null && (await ((i = o(this, U)) == null ? void 0 : i.saveValue(f.Hash, w)), o(this, je).set(a, f.Hash), o(this, P).ConnectionState === "connected" && o(this, P).sendValue(f.Hash, w));
      } else
        o(this, je).set(a, f.Hash), !o(this, X).hasValueBlob(f.Hash) && o(this, P).ConnectionState === "connected" && o(this, P).requestValue(f.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
ii = function(e, t) {
  if (t == null) {
    d(this, M, Vr).call(this, e);
    return;
  }
  const n = { ...t, _lastSeen: Date.now() };
  o(this, Tt).set(e, n), d(this, M, ai).call(this, e);
  for (const r of o(this, ut))
    try {
      r(e, t, "remote");
    } catch (i) {
      console.error("SDS: presence handler failed", i);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
ai = function(e) {
  const t = o(this, Ge).get(e);
  t != null && clearTimeout(t);
  const n = setTimeout(
    () => {
      d(this, M, Vr).call(this, e);
    },
    o(this, Yt)
  );
  o(this, Ge).set(e, n);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
Vr = function(e) {
  if (!o(this, Tt).has(e))
    return;
  o(this, Tt).delete(e);
  const t = o(this, Ge).get(e);
  t != null && (clearTimeout(t), o(this, Ge).delete(e));
  for (const n of o(this, ut))
    try {
      n(e, void 0, "remote");
    } catch (r) {
      console.error("SDS: presence handler failed", r);
    }
};
export {
  Oa as SDS_BrowserPersistenceProvider,
  hs as SDS_DataStore,
  Os as SDS_Entry,
  R as SDS_Error,
  rs as SDS_Item,
  ss as SDS_Link,
  Ca as SDS_SyncEngine,
  Ta as SDS_WebRTCProvider,
  Ia as SDS_WebSocketProvider
};
