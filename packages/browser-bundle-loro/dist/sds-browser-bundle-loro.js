var oi = Object.defineProperty;
var Dr = (i) => {
  throw TypeError(i);
};
var ci = (i, e, t) => e in i ? oi(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var hn = (i, e, t) => ci(i, typeof e != "symbol" ? e + "" : e, t), Xn = (i, e, t) => e.has(i) || Dr("Cannot " + t);
var o = (i, e, t) => (Xn(i, e, "read from private field"), t ? t.call(i) : e.get(i)), y = (i, e, t) => e.has(i) ? Dr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), b = (i, e, t, n) => (Xn(i, e, "write to private field"), n ? n.call(i, t) : e.set(i, t), t), d = (i, e, t) => (Xn(i, e, "access private method"), t);
var Zn = (i, e, t, n) => ({
  set _(r) {
    b(i, e, r, t);
  },
  get _() {
    return o(i, e, n);
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
const ae = "00000000-0000-4000-8000-000000000000", $ = "00000000-0000-4000-8000-000000000001", ge = "00000000-0000-4000-8000-000000000002", At = "text/plain", di = 131072, ui = 2048, hi = 5e3, Br = 1024, jr = 256, Zr = 1024, Kr = 1048576, fi = 200;
function mi(i) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(i).toString("base64");
  let t = "";
  for (let n = 0; n < i.byteLength; n++)
    t += String.fromCharCode(i[n]);
  return btoa(t);
}
function bs(i) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(i, "base64")) : Uint8Array.from(atob(i), (t) => t.charCodeAt(0));
}
var Fe, jt, ws;
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
    y(this, jt);
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
    return t == null && o(this, jt) != null && (t = await o(this, jt).call(this, e), t != null && o(this, Fe).set(e, t)), t;
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
    b(this, jt, e);
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
    return this._EntryAsJSON(ae);
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
    for (; n != null && (t.push(this.EntryWithId(n)), n !== ae); )
      n = this._outerItemIdOf(n);
    return t;
  }
  /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
  _outerItemIdsOf(e) {
    return this._outerItemChainOf(e).map((t) => t.Id);
  }
  /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
  _EntryAsJSON(e) {
    const t = this._KindOf(e), n = this._LabelOf(e), r = this._InfoProxyOf(e), s = {};
    for (const u of Object.keys(r))
      s[u] = r[u];
    if (t === "link") {
      const u = this._TargetOf(e).Id;
      return { Kind: "link", Id: e, Label: n, TargetId: u, Info: s };
    }
    const a = this._TypeOf(e), c = this._ValueKindOf(e), l = { Kind: "item", Id: e, Label: n, Type: a, ValueKind: c, Info: s, innerEntries: [] };
    if (c === "literal" || c === "binary") {
      const u = this._currentValueOf(e);
      u !== void 0 && (l.Value = typeof u == "string" ? u : mi(u));
    }
    return l.innerEntries = Array.from(this._innerEntriesOf(e)).map((u) => this._EntryAsJSON(u.Id)), l;
  }
}, Fe = new WeakMap(), jt = new WeakMap(), ws);
var E;
(function(i) {
  i.assertEqual = (r) => {
  };
  function e(r) {
  }
  i.assertIs = e;
  function t(r) {
    throw new Error();
  }
  i.assertNever = t, i.arrayToEnum = (r) => {
    const s = {};
    for (const a of r)
      s[a] = a;
    return s;
  }, i.getValidEnumValues = (r) => {
    const s = i.objectKeys(r).filter((c) => typeof r[r[c]] != "number"), a = {};
    for (const c of s)
      a[c] = r[c];
    return i.objectValues(a);
  }, i.objectValues = (r) => i.objectKeys(r).map(function(s) {
    return r[s];
  }), i.objectKeys = typeof Object.keys == "function" ? (r) => Object.keys(r) : (r) => {
    const s = [];
    for (const a in r)
      Object.prototype.hasOwnProperty.call(r, a) && s.push(a);
    return s;
  }, i.find = (r, s) => {
    for (const a of r)
      if (s(a))
        return a;
  }, i.isInteger = typeof Number.isInteger == "function" ? (r) => Number.isInteger(r) : (r) => typeof r == "number" && Number.isFinite(r) && Math.floor(r) === r;
  function n(r, s = " | ") {
    return r.map((a) => typeof a == "string" ? `'${a}'` : a).join(s);
  }
  i.joinValues = n, i.jsonStringifyReplacer = (r, s) => typeof s == "bigint" ? s.toString() : s;
})(E || (E = {}));
var $r;
(function(i) {
  i.mergeShapes = (e, t) => ({
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
]), rt = (i) => {
  switch (typeof i) {
    case "undefined":
      return v.undefined;
    case "string":
      return v.string;
    case "number":
      return Number.isNaN(i) ? v.nan : v.number;
    case "boolean":
      return v.boolean;
    case "function":
      return v.function;
    case "bigint":
      return v.bigint;
    case "symbol":
      return v.symbol;
    case "object":
      return Array.isArray(i) ? v.array : i === null ? v.null : i.then && typeof i.then == "function" && i.catch && typeof i.catch == "function" ? v.promise : typeof Map < "u" && i instanceof Map ? v.map : typeof Set < "u" && i instanceof Set ? v.set : typeof Date < "u" && i instanceof Date ? v.date : v.object;
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
    const t = e || function(s) {
      return s.message;
    }, n = { _errors: [] }, r = (s) => {
      for (const a of s.issues)
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
        const s = r.path[0];
        t[s] = t[s] || [], t[s].push(e(r));
      } else
        n.push(e(r));
    return { formErrors: n, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Ye.create = (i) => new Ye(i);
const or = (i, e) => {
  let t;
  switch (i.code) {
    case m.invalid_type:
      i.received === v.undefined ? t = "Required" : t = `Expected ${i.expected}, received ${i.received}`;
      break;
    case m.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(i.expected, E.jsonStringifyReplacer)}`;
      break;
    case m.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${E.joinValues(i.keys, ", ")}`;
      break;
    case m.invalid_union:
      t = "Invalid input";
      break;
    case m.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${E.joinValues(i.options)}`;
      break;
    case m.invalid_enum_value:
      t = `Invalid enum value. Expected ${E.joinValues(i.options)}, received '${i.received}'`;
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
      typeof i.validation == "object" ? "includes" in i.validation ? (t = `Invalid input: must include "${i.validation.includes}"`, typeof i.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${i.validation.position}`)) : "startsWith" in i.validation ? t = `Invalid input: must start with "${i.validation.startsWith}"` : "endsWith" in i.validation ? t = `Invalid input: must end with "${i.validation.endsWith}"` : E.assertNever(i.validation) : i.validation !== "regex" ? t = `Invalid ${i.validation}` : t = "Invalid";
      break;
    case m.too_small:
      i.type === "array" ? t = `Array must contain ${i.exact ? "exactly" : i.inclusive ? "at least" : "more than"} ${i.minimum} element(s)` : i.type === "string" ? t = `String must contain ${i.exact ? "exactly" : i.inclusive ? "at least" : "over"} ${i.minimum} character(s)` : i.type === "number" ? t = `Number must be ${i.exact ? "exactly equal to " : i.inclusive ? "greater than or equal to " : "greater than "}${i.minimum}` : i.type === "bigint" ? t = `Number must be ${i.exact ? "exactly equal to " : i.inclusive ? "greater than or equal to " : "greater than "}${i.minimum}` : i.type === "date" ? t = `Date must be ${i.exact ? "exactly equal to " : i.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(i.minimum))}` : t = "Invalid input";
      break;
    case m.too_big:
      i.type === "array" ? t = `Array must contain ${i.exact ? "exactly" : i.inclusive ? "at most" : "less than"} ${i.maximum} element(s)` : i.type === "string" ? t = `String must contain ${i.exact ? "exactly" : i.inclusive ? "at most" : "under"} ${i.maximum} character(s)` : i.type === "number" ? t = `Number must be ${i.exact ? "exactly" : i.inclusive ? "less than or equal to" : "less than"} ${i.maximum}` : i.type === "bigint" ? t = `BigInt must be ${i.exact ? "exactly" : i.inclusive ? "less than or equal to" : "less than"} ${i.maximum}` : i.type === "date" ? t = `Date must be ${i.exact ? "exactly" : i.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(i.maximum))}` : t = "Invalid input";
      break;
    case m.custom:
      t = "Invalid input";
      break;
    case m.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case m.not_multiple_of:
      t = `Number must be a multiple of ${i.multipleOf}`;
      break;
    case m.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, E.assertNever(i);
  }
  return { message: t };
};
let yi = or;
function pi() {
  return yi;
}
const vi = (i) => {
  const { data: e, path: t, errorMaps: n, issueData: r } = i, s = [...t, ...r.path || []], a = {
    ...r,
    path: s
  };
  if (r.message !== void 0)
    return {
      ...r,
      path: s,
      message: r.message
    };
  let c = "";
  const l = n.filter((u) => !!u).slice().reverse();
  for (const u of l)
    c = u(a, { data: e, defaultError: c }).message;
  return {
    ...r,
    path: s,
    message: c
  };
};
function p(i, e) {
  const t = pi(), n = vi({
    issueData: e,
    data: i.data,
    path: i.path,
    errorMaps: [
      i.common.contextualErrorMap,
      // contextual error map is first priority
      i.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === or ? void 0 : or
      // then global default map
    ].filter((r) => !!r)
  });
  i.common.issues.push(n);
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
      const s = await r.key, a = await r.value;
      n.push({
        key: s,
        value: a
      });
    }
    return we.mergeObjectSync(e, n);
  }
  static mergeObjectSync(e, t) {
    const n = {};
    for (const r of t) {
      const { key: s, value: a } = r;
      if (s.status === "aborted" || a.status === "aborted")
        return x;
      s.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof a.value < "u" || r.alwaysSet) && (n[s.value] = a.value);
    }
    return { status: e.value, value: n };
  }
}
const x = Object.freeze({
  status: "aborted"
}), pn = (i) => ({ status: "dirty", value: i }), xe = (i) => ({ status: "valid", value: i }), Ur = (i) => i.status === "aborted", zr = (i) => i.status === "dirty", rn = (i) => i.status === "valid", Un = (i) => typeof Promise < "u" && i instanceof Promise;
var _;
(function(i) {
  i.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, i.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(_ || (_ = {}));
class mt {
  constructor(e, t, n, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Fr = (i, e) => {
  if (rn(e))
    return { success: !0, data: e.value };
  if (!i.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ye(i.common.issues);
      return this._error = t, this._error;
    }
  };
};
function I(i) {
  if (!i)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: n, description: r } = i;
  if (e && (t || n))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: r } : { errorMap: (a, c) => {
    const { message: l } = i;
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
        const s = this._parseSync({ data: e, path: [], parent: t });
        return rn(s) ? {
          value: s.value
        } : {
          issues: t.common.issues
        };
      } catch (s) {
        (r = (n = s == null ? void 0 : s.message) == null ? void 0 : n.toLowerCase()) != null && r.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => rn(s) ? {
      value: s.value
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
    }, r = this._parse({ data: e, path: n.path, parent: n }), s = await (Un(r) ? r : Promise.resolve(r));
    return Fr(n, s);
  }
  refine(e, t) {
    const n = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, s) => {
      const a = e(r), c = () => s.addIssue({
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
      typeName: S.ZodEffects,
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
    return je.create(this);
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
      typeName: S.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ur({
      ...I(this._def),
      innerType: this,
      defaultValue: t,
      typeName: S.ZodDefault
    });
  }
  brand() {
    return new Ki({
      typeName: S.ZodBranded,
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
      typeName: S.ZodCatch
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
const _i = /^c[^\s-]{8,}$/i, wi = /^[0-9a-z]+$/, bi = /^[0-9A-HJKMNP-TV-Z]{26}$/i, xi = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Si = /^[a-z0-9_-]{21}$/i, ki = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Ii = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Ti = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Oi = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let tr;
const Ci = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ei = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Li = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Ai = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ni = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Vi = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, xs = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ri = new RegExp(`^${xs}$`);
function Ss(i) {
  let e = "[0-5]\\d";
  i.precision ? e = `${e}\\.\\d{${i.precision}}` : i.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = i.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Mi(i) {
  return new RegExp(`^${Ss(i)}$`);
}
function Pi(i) {
  let e = `${xs}T${Ss(i)}`;
  const t = [];
  return t.push(i.local ? "Z?" : "Z"), i.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Di(i, e) {
  return !!((e === "v4" || !e) && Ci.test(i) || (e === "v6" || !e) && Li.test(i));
}
function Bi(i, e) {
  if (!ki.test(i))
    return !1;
  try {
    const [t] = i.split(".");
    if (!t)
      return !1;
    const n = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), r = JSON.parse(atob(n));
    return !(typeof r != "object" || r === null || "typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || e && r.alg !== e);
  } catch {
    return !1;
  }
}
function ji(i, e) {
  return !!((e === "v4" || !e) && Ei.test(i) || (e === "v6" || !e) && Ai.test(i));
}
class ht extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_type,
        expected: v.string,
        received: s.parsedType
      }), x;
    }
    const n = new we();
    let r;
    for (const s of this._def.checks)
      if (s.kind === "min")
        e.data.length < s.value && (r = this._getOrReturnCtx(e, r), p(r, {
          code: m.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), n.dirty());
      else if (s.kind === "max")
        e.data.length > s.value && (r = this._getOrReturnCtx(e, r), p(r, {
          code: m.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), n.dirty());
      else if (s.kind === "length") {
        const a = e.data.length > s.value, c = e.data.length < s.value;
        (a || c) && (r = this._getOrReturnCtx(e, r), a ? p(r, {
          code: m.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }) : c && p(r, {
          code: m.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }), n.dirty());
      } else if (s.kind === "email")
        Ti.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "email",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "emoji")
        tr || (tr = new RegExp(Oi, "u")), tr.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "emoji",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "uuid")
        xi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "uuid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "nanoid")
        Si.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "nanoid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "cuid")
        _i.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "cuid2")
        wi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid2",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "ulid")
        bi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "ulid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), p(r, {
            validation: "url",
            code: m.invalid_string,
            message: s.message
          }), n.dirty();
        }
      else s.kind === "regex" ? (s.regex.lastIndex = 0, s.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "regex",
        code: m.invalid_string,
        message: s.message
      }), n.dirty())) : s.kind === "trim" ? e.data = e.data.trim() : s.kind === "includes" ? e.data.includes(s.value, s.position) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { includes: s.value, position: s.position },
        message: s.message
      }), n.dirty()) : s.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : s.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : s.kind === "startsWith" ? e.data.startsWith(s.value) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { startsWith: s.value },
        message: s.message
      }), n.dirty()) : s.kind === "endsWith" ? e.data.endsWith(s.value) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: { endsWith: s.value },
        message: s.message
      }), n.dirty()) : s.kind === "datetime" ? Pi(s).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "datetime",
        message: s.message
      }), n.dirty()) : s.kind === "date" ? Ri.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "date",
        message: s.message
      }), n.dirty()) : s.kind === "time" ? Mi(s).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "time",
        message: s.message
      }), n.dirty()) : s.kind === "duration" ? Ii.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "duration",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "ip" ? Di(e.data, s.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "ip",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "jwt" ? Bi(e.data, s.alg) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "jwt",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "cidr" ? ji(e.data, s.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "cidr",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "base64" ? Ni.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "base64",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "base64url" ? Vi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "base64url",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : E.assertNever(s);
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
ht.create = (i) => new ht({
  checks: [],
  typeName: S.ZodString,
  coerce: (i == null ? void 0 : i.coerce) ?? !1,
  ...I(i)
});
function Zi(i, e) {
  const t = (i.toString().split(".")[1] || "").length, n = (e.toString().split(".")[1] || "").length, r = t > n ? t : n, s = Number.parseInt(i.toFixed(r).replace(".", "")), a = Number.parseInt(e.toFixed(r).replace(".", ""));
  return s % a / 10 ** r;
}
class sn extends C {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== v.number) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_type,
        expected: v.number,
        received: s.parsedType
      }), x;
    }
    let n;
    const r = new we();
    for (const s of this._def.checks)
      s.kind === "int" ? E.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.invalid_type,
        expected: "integer",
        received: "float",
        message: s.message
      }), r.dirty()) : s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_small,
        minimum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), r.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_big,
        maximum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), r.dirty()) : s.kind === "multipleOf" ? Zi(e.data, s.value) !== 0 && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), r.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_finite,
        message: s.message
      }), r.dirty()) : E.assertNever(s);
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
sn.create = (i) => new sn({
  checks: [],
  typeName: S.ZodNumber,
  coerce: (i == null ? void 0 : i.coerce) || !1,
  ...I(i)
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
    for (const s of this._def.checks)
      s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_small,
        type: "bigint",
        minimum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), r.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.too_big,
        type: "bigint",
        maximum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), r.dirty()) : s.kind === "multipleOf" ? e.data % s.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), p(n, {
        code: m.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), r.dirty()) : E.assertNever(s);
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
In.create = (i) => new In({
  checks: [],
  typeName: S.ZodBigInt,
  coerce: (i == null ? void 0 : i.coerce) ?? !1,
  ...I(i)
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
Hr.create = (i) => new Hr({
  typeName: S.ZodBoolean,
  coerce: (i == null ? void 0 : i.coerce) || !1,
  ...I(i)
});
class zn extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_type,
        expected: v.date,
        received: s.parsedType
      }), x;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_date
      }), x;
    }
    const n = new we();
    let r;
    for (const s of this._def.checks)
      s.kind === "min" ? e.data.getTime() < s.value && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_small,
        message: s.message,
        inclusive: !0,
        exact: !1,
        minimum: s.value,
        type: "date"
      }), n.dirty()) : s.kind === "max" ? e.data.getTime() > s.value && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_big,
        message: s.message,
        inclusive: !0,
        exact: !1,
        maximum: s.value,
        type: "date"
      }), n.dirty()) : E.assertNever(s);
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
zn.create = (i) => new zn({
  checks: [],
  coerce: (i == null ? void 0 : i.coerce) || !1,
  typeName: S.ZodDate,
  ...I(i)
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
Wr.create = (i) => new Wr({
  typeName: S.ZodSymbol,
  ...I(i)
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
cr.create = (i) => new cr({
  typeName: S.ZodUndefined,
  ...I(i)
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
Jr.create = (i) => new Jr({
  typeName: S.ZodNull,
  ...I(i)
});
class Tn extends C {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return xe(e.data);
  }
}
Tn.create = (i) => new Tn({
  typeName: S.ZodAny,
  ...I(i)
});
class lr extends C {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return xe(e.data);
  }
}
lr.create = (i) => new lr({
  typeName: S.ZodUnknown,
  ...I(i)
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
gt.create = (i) => new gt({
  typeName: S.ZodNever,
  ...I(i)
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
qr.create = (i) => new qr({
  typeName: S.ZodVoid,
  ...I(i)
});
class je extends C {
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
    const s = [...t.data].map((a, c) => r.type._parseSync(new mt(t, a, t.path, c)));
    return we.mergeArray(n, s);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new je({
      ...this._def,
      minLength: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new je({
      ...this._def,
      maxLength: { value: e, message: _.toString(t) }
    });
  }
  length(e, t) {
    return new je({
      ...this._def,
      exactLength: { value: e, message: _.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
je.create = (i, e) => new je({
  type: i,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: S.ZodArray,
  ...I(e)
});
function Nt(i) {
  if (i instanceof H) {
    const e = {};
    for (const t in i.shape) {
      const n = i.shape[t];
      e[t] = ft.create(Nt(n));
    }
    return new H({
      ...i._def,
      shape: () => e
    });
  } else return i instanceof je ? new je({
    ...i._def,
    type: Nt(i.element)
  }) : i instanceof ft ? ft.create(Nt(i.unwrap())) : i instanceof cn ? cn.create(Nt(i.unwrap())) : i instanceof Ot ? Ot.create(i.items.map((e) => Nt(e))) : i;
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
    const { status: n, ctx: r } = this._processInputParams(e), { shape: s, keys: a } = this._getCached(), c = [];
    if (!(this._def.catchall instanceof gt && this._def.unknownKeys === "strip"))
      for (const u in r.data)
        a.includes(u) || c.push(u);
    const l = [];
    for (const u of a) {
      const f = s[u], g = r.data[u];
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
          var s, a;
          const r = ((a = (s = this._def).errorMap) == null ? void 0 : a.call(s, t, n).message) ?? n.defaultError;
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
      typeName: S.ZodObject
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
        let s = this.shape[n];
        for (; s instanceof ft; )
          s = s._def.innerType;
        t[n] = s;
      }
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return ks(E.objectKeys(this.shape));
  }
}
H.create = (i, e) => new H({
  shape: () => i,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: S.ZodObject,
  ...I(e)
});
H.strictCreate = (i, e) => new H({
  shape: () => i,
  unknownKeys: "strict",
  catchall: gt.create(),
  typeName: S.ZodObject,
  ...I(e)
});
H.lazycreate = (i, e) => new H({
  shape: i,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: S.ZodObject,
  ...I(e)
});
class Fn extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = this._def.options;
    function r(s) {
      for (const c of s)
        if (c.result.status === "valid")
          return c.result;
      for (const c of s)
        if (c.result.status === "dirty")
          return t.common.issues.push(...c.ctx.common.issues), c.result;
      const a = s.map((c) => new Ye(c.ctx.common.issues));
      return p(t, {
        code: m.invalid_union,
        unionErrors: a
      }), x;
    }
    if (t.common.async)
      return Promise.all(n.map(async (s) => {
        const a = {
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
            parent: a
          }),
          ctx: a
        };
      })).then(r);
    {
      let s;
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
        f.status === "dirty" && !s && (s = { result: f, ctx: u }), u.common.issues.length && a.push(u.common.issues);
      }
      if (s)
        return t.common.issues.push(...s.ctx.common.issues), s.result;
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
Fn.create = (i, e) => new Fn({
  options: i,
  typeName: S.ZodUnion,
  ...I(e)
});
function dr(i, e) {
  const t = rt(i), n = rt(e);
  if (i === e)
    return { valid: !0, data: i };
  if (t === v.object && n === v.object) {
    const r = E.objectKeys(e), s = E.objectKeys(i).filter((c) => r.indexOf(c) !== -1), a = { ...i, ...e };
    for (const c of s) {
      const l = dr(i[c], e[c]);
      if (!l.valid)
        return { valid: !1 };
      a[c] = l.data;
    }
    return { valid: !0, data: a };
  } else if (t === v.array && n === v.array) {
    if (i.length !== e.length)
      return { valid: !1 };
    const r = [];
    for (let s = 0; s < i.length; s++) {
      const a = i[s], c = e[s], l = dr(a, c);
      if (!l.valid)
        return { valid: !1 };
      r.push(l.data);
    }
    return { valid: !0, data: r };
  } else return t === v.date && n === v.date && +i == +e ? { valid: !0, data: i } : { valid: !1 };
}
class Hn extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = (s, a) => {
      if (Ur(s) || Ur(a))
        return x;
      const c = dr(s.value, a.value);
      return c.valid ? ((zr(s) || zr(a)) && t.dirty(), { status: t.value, value: c.data }) : (p(n, {
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
    ]).then(([s, a]) => r(s, a)) : r(this._def.left._parseSync({
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
Hn.create = (i, e, t) => new Hn({
  left: i,
  right: e,
  typeName: S.ZodIntersection,
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
    const s = [...n.data].map((a, c) => {
      const l = this._def.items[c] || this._def.rest;
      return l ? l._parse(new mt(n, a, n.path, c)) : null;
    }).filter((a) => !!a);
    return n.common.async ? Promise.all(s).then((a) => we.mergeArray(t, a)) : we.mergeArray(t, s);
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
Ot.create = (i, e) => {
  if (!Array.isArray(i))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ot({
    items: i,
    typeName: S.ZodTuple,
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
    const r = this._def.keyType, s = this._def.valueType, a = [...n.data.entries()].map(([c, l], u) => ({
      key: r._parse(new mt(n, c, n.path, [u, "key"])),
      value: s._parse(new mt(n, l, n.path, [u, "value"]))
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
Gr.create = (i, e, t) => new Gr({
  valueType: e,
  keyType: i,
  typeName: S.ZodMap,
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
    const s = this._def.valueType;
    function a(l) {
      const u = /* @__PURE__ */ new Set();
      for (const f of l) {
        if (f.status === "aborted")
          return x;
        f.status === "dirty" && t.dirty(), u.add(f.value);
      }
      return { status: t.value, value: u };
    }
    const c = [...n.data.values()].map((l, u) => s._parse(new mt(n, l, n.path, u)));
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
On.create = (i, e) => new On({
  valueType: i,
  minSize: null,
  maxSize: null,
  typeName: S.ZodSet,
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
Qr.create = (i, e) => new Qr({
  getter: i,
  typeName: S.ZodLazy,
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
Yr.create = (i, e) => new Yr({
  value: i,
  typeName: S.ZodLiteral,
  ...I(e)
});
function ks(i, e) {
  return new an({
    values: i,
    typeName: S.ZodEnum,
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
an.create = ks;
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
Xr.create = (i, e) => new Xr({
  values: i,
  typeName: S.ZodNativeEnum,
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
Wn.create = (i, e) => new Wn({
  type: i,
  typeName: S.ZodPromise,
  ...I(e)
});
class on extends C {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === S.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, s = {
      addIssue: (a) => {
        p(n, a), a.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return n.path;
      }
    };
    if (s.addIssue = s.addIssue.bind(s), r.type === "preprocess") {
      const a = r.transform(n.data, s);
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
        const l = r.refinement(c, s);
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
        const c = r.transform(a.value, s);
        if (c instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: c };
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((a) => rn(a) ? Promise.resolve(r.transform(a.value, s)).then((c) => ({
          status: t.value,
          value: c
        })) : x);
    E.assertNever(r);
  }
}
on.create = (i, e, t) => new on({
  schema: i,
  typeName: S.ZodEffects,
  effect: e,
  ...I(t)
});
on.createWithPreprocess = (i, e, t) => new on({
  schema: e,
  effect: { type: "preprocess", transform: i },
  typeName: S.ZodEffects,
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
ft.create = (i, e) => new ft({
  innerType: i,
  typeName: S.ZodOptional,
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
cn.create = (i, e) => new cn({
  innerType: i,
  typeName: S.ZodNullable,
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
ur.create = (i, e) => new ur({
  innerType: i,
  typeName: S.ZodDefault,
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
    return Un(r) ? r.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
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
hr.create = (i, e) => new hr({
  innerType: i,
  typeName: S.ZodCatch,
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
es.create = (i) => new es({
  typeName: S.ZodNaN,
  ...I(i)
});
class Ki extends C {
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
        const s = await this._def.in._parseAsync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return s.status === "aborted" ? x : s.status === "dirty" ? (t.dirty(), pn(s.value)) : this._def.out._parseAsync({
          data: s.value,
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
      typeName: S.ZodPipeline
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
fr.create = (i, e) => new fr({
  innerType: i,
  typeName: S.ZodReadonly,
  ...I(e)
});
function ts(i, e) {
  const t = typeof i == "function" ? i(e) : typeof i == "string" ? { message: i } : i;
  return typeof t == "string" ? { message: t } : t;
}
function $i(i, e = {}, t) {
  return i ? Tn.create().superRefine((n, r) => {
    const s = i(n);
    if (s instanceof Promise)
      return s.then((a) => {
        if (!a) {
          const c = ts(e, n), l = c.fatal ?? t ?? !0;
          r.addIssue({ code: "custom", ...c, fatal: l });
        }
      });
    if (!s) {
      const a = ts(e, n), c = a.fatal ?? t ?? !0;
      r.addIssue({ code: "custom", ...a, fatal: c });
    }
  }) : Tn.create();
}
var S;
(function(i) {
  i.ZodString = "ZodString", i.ZodNumber = "ZodNumber", i.ZodNaN = "ZodNaN", i.ZodBigInt = "ZodBigInt", i.ZodBoolean = "ZodBoolean", i.ZodDate = "ZodDate", i.ZodSymbol = "ZodSymbol", i.ZodUndefined = "ZodUndefined", i.ZodNull = "ZodNull", i.ZodAny = "ZodAny", i.ZodUnknown = "ZodUnknown", i.ZodNever = "ZodNever", i.ZodVoid = "ZodVoid", i.ZodArray = "ZodArray", i.ZodObject = "ZodObject", i.ZodUnion = "ZodUnion", i.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", i.ZodIntersection = "ZodIntersection", i.ZodTuple = "ZodTuple", i.ZodRecord = "ZodRecord", i.ZodMap = "ZodMap", i.ZodSet = "ZodSet", i.ZodFunction = "ZodFunction", i.ZodLazy = "ZodLazy", i.ZodLiteral = "ZodLiteral", i.ZodEnum = "ZodEnum", i.ZodEffects = "ZodEffects", i.ZodNativeEnum = "ZodNativeEnum", i.ZodOptional = "ZodOptional", i.ZodNullable = "ZodNullable", i.ZodDefault = "ZodDefault", i.ZodCatch = "ZodCatch", i.ZodPromise = "ZodPromise", i.ZodBranded = "ZodBranded", i.ZodPipeline = "ZodPipeline", i.ZodReadonly = "ZodReadonly";
})(S || (S = {}));
const Ui = (i, e = {
  message: `Input not instance of ${i.name}`
}) => $i((t) => t instanceof i, e), Dn = ht.create, Is = sn.create, zi = cr.create;
Tn.create;
const Fi = lr.create;
gt.create;
je.create;
const Hi = Fn.create;
Hn.create;
Ot.create;
an.create;
Wn.create;
ft.create;
cn.create;
function qn(i, e) {
  var r;
  const t = i.safeParse(e);
  if (t.success)
    return t.data;
  const n = ((r = t.error.issues[0]) == null ? void 0 : r.message) ?? "invalid argument";
  throw new R("invalid-argument", n);
}
const Wi = Dn({
  invalid_type_error: "Label must be a string"
}).max(Br, `Label must not exceed ${Br} characters`), Ji = Dn({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(jr, `MIMEType must not exceed ${jr} characters`), qi = Dn({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(Zr, `Info key must not exceed ${Zr} characters`), Gi = Fi().superRefine((i, e) => {
  let t;
  try {
    t = JSON.stringify(i);
  } catch {
    e.addIssue({
      code: m.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > Kr && e.addIssue({
    code: m.custom,
    message: `Info value must not exceed ${Kr} bytes when serialised as UTF-8 JSON`
  });
});
function Ts(i) {
  qn(Wi, i);
}
function mr(i) {
  qn(Ji, i);
}
function Qi(i) {
  qn(qi, i);
}
function Yi(i) {
  qn(Gi, i);
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
    return this.Id === ae;
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
function nr(i, e, t) {
  var s;
  const n = i.safeParse(e);
  if (n.success)
    return n.data;
  const r = (t ? `${t}: ` : "") + (((s = n.error.issues[0]) == null ? void 0 : s.message) ?? "invalid argument");
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
]), gr = new ee([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Cs = function(i, e) {
  for (var t = new _e(31), n = 0; n < 31; ++n)
    t[n] = e += 1 << i[n - 1];
  for (var r = new Mr(t[30]), n = 1; n < 30; ++n)
    for (var s = t[n]; s < t[n + 1]; ++s)
      r[s] = s - t[n] << 5 | n;
  return { b: t, r };
}, Es = Cs(Gn, 2), Ls = Es.b, yr = Es.r;
Ls[28] = 258, yr[258] = 28;
var As = Cs(Qn, 0), ta = As.b, is = As.r, pr = new _e(32768);
for (var D = 0; D < 32768; ++D) {
  var et = (D & 43690) >> 1 | (D & 21845) << 1;
  et = (et & 52428) >> 2 | (et & 13107) << 2, et = (et & 61680) >> 4 | (et & 3855) << 4, pr[D] = ((et & 65280) >> 8 | (et & 255) << 8) >> 1;
}
var Ze = (function(i, e, t) {
  for (var n = i.length, r = 0, s = new _e(e); r < n; ++r)
    i[r] && ++s[i[r] - 1];
  var a = new _e(e);
  for (r = 1; r < e; ++r)
    a[r] = a[r - 1] + s[r - 1] << 1;
  var c;
  if (t) {
    c = new _e(1 << e);
    var l = 15 - e;
    for (r = 0; r < n; ++r)
      if (i[r])
        for (var u = r << 4 | i[r], f = e - i[r], g = a[i[r] - 1]++ << f, w = g | (1 << f) - 1; g <= w; ++g)
          c[pr[g] >> l] = u;
  } else
    for (c = new _e(n), r = 0; r < n; ++r)
      i[r] && (c[r] = pr[a[i[r] - 1]++] >> 15 - i[r]);
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
var na = /* @__PURE__ */ Ze(yt, 9, 0), ra = /* @__PURE__ */ Ze(yt, 9, 1), sa = /* @__PURE__ */ Ze(Cn, 5, 0), ia = /* @__PURE__ */ Ze(Cn, 5, 1), rr = function(i) {
  for (var e = i[0], t = 1; t < i.length; ++t)
    i[t] > e && (e = i[t]);
  return e;
}, ke = function(i, e, t) {
  var n = e / 8 | 0;
  return (i[n] | i[n + 1] << 8) >> (e & 7) & t;
}, sr = function(i, e) {
  var t = e / 8 | 0;
  return (i[t] | i[t + 1] << 8 | i[t + 2] << 16) >> (e & 7);
}, Pr = function(i) {
  return (i + 7) / 8 | 0;
}, Ns = function(i, e, t) {
  return (t == null || t > i.length) && (t = i.length), new ee(i.subarray(e, t));
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
], Te = function(i, e, t) {
  var n = new Error(e || aa[i]);
  if (n.code = i, Error.captureStackTrace && Error.captureStackTrace(n, Te), !t)
    throw n;
  return n;
}, oa = function(i, e, t, n) {
  var r = i.length, s = 0;
  if (!r || e.f && !e.l)
    return t || new ee(0);
  var a = !t, c = a || e.i != 2, l = e.i;
  a && (t = new ee(r * 3));
  var u = function(dn) {
    var un = t.length;
    if (dn > un) {
      var Lt = new ee(Math.max(un * 2, dn));
      Lt.set(t), t = Lt;
    }
  }, f = e.f || 0, g = e.p || 0, w = e.b || 0, V = e.l, W = e.d, B = e.m, oe = e.n, Se = r * 8;
  do {
    if (!V) {
      f = ke(i, g, 1);
      var ue = ke(i, g + 1, 3);
      if (g += 3, ue)
        if (ue == 1)
          V = ra, W = ia, B = 9, oe = 5;
        else if (ue == 2) {
          var ie = ke(i, g, 31) + 257, q = ke(i, g + 10, 15) + 4, A = ie + ke(i, g + 5, 31) + 1;
          g += 14;
          for (var k = new ee(A), G = new ee(19), z = 0; z < q; ++z)
            G[gr[z]] = ke(i, g + z * 3, 7);
          g += q * 3;
          for (var ne = rr(G), Xe = (1 << ne) - 1, he = Ze(G, ne, 1), z = 0; z < A; ) {
            var ce = he[ke(i, g, Xe)];
            g += ce & 15;
            var J = ce >> 4;
            if (J < 16)
              k[z++] = J;
            else {
              var Q = 0, j = 0;
              for (J == 16 ? (j = 3 + ke(i, g, 3), g += 2, Q = k[z - 1]) : J == 17 ? (j = 3 + ke(i, g, 7), g += 3) : J == 18 && (j = 11 + ke(i, g, 127), g += 7); j--; )
                k[z++] = Q;
            }
          }
          var le = k.subarray(0, ie), Y = k.subarray(ie);
          B = rr(le), oe = rr(Y), V = Ze(le, B, 1), W = Ze(Y, oe, 1);
        } else
          Te(1);
      else {
        var J = Pr(g) + 4, se = i[J - 4] | i[J - 3] << 8, te = J + se;
        if (te > r) {
          l && Te(0);
          break;
        }
        c && u(w + se), t.set(i.subarray(J, te), w), e.b = w += se, e.p = g = te * 8, e.f = f;
        continue;
      }
      if (g > Se) {
        l && Te(0);
        break;
      }
    }
    c && u(w + 131072);
    for (var ln = (1 << B) - 1, be = (1 << oe) - 1, Ke = g; ; Ke = g) {
      var Q = V[sr(i, g) & ln], fe = Q >> 4;
      if (g += Q & 15, g > Se) {
        l && Te(0);
        break;
      }
      if (Q || Te(2), fe < 256)
        t[w++] = fe;
      else if (fe == 256) {
        Ke = g, V = null;
        break;
      } else {
        var me = fe - 254;
        if (fe > 264) {
          var z = fe - 257, Z = Gn[z];
          me = ke(i, g, (1 << Z) - 1) + Ls[z], g += Z;
        }
        var Ne = W[sr(i, g) & be], Ct = Ne >> 4;
        Ne || Te(3), g += Ne & 15;
        var Y = ta[Ct];
        if (Ct > 3) {
          var Z = Qn[Ct];
          Y += sr(i, g) & (1 << Z) - 1, g += Z;
        }
        if (g > Se) {
          l && Te(0);
          break;
        }
        c && u(w + 131072);
        var Et = w + me;
        if (w < Y) {
          var Bn = s - Y, jn = Math.min(Y, Et);
          for (Bn + w < 0 && Te(3); w < jn; ++w)
            t[w] = n[Bn + w];
        }
        for (; w < Et; ++w)
          t[w] = t[w - Y];
      }
    }
    e.l = V, e.p = Ke, e.b = w, e.f = f, V && (f = 1, e.m = B, e.d = W, e.n = oe);
  } while (!f);
  return w != t.length && a ? Ns(t, 0, w) : t.subarray(0, w);
}, $e = function(i, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  i[n] |= t, i[n + 1] |= t >> 8;
}, fn = function(i, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  i[n] |= t, i[n + 1] |= t >> 8, i[n + 2] |= t >> 16;
}, ir = function(i, e) {
  for (var t = [], n = 0; n < i.length; ++n)
    i[n] && t.push({ s: n, f: i[n] });
  var r = t.length, s = t.slice();
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
  for (var w = s[0].s, n = 1; n < r; ++n)
    s[n].s > w && (w = s[n].s);
  var V = new _e(w + 1), W = vr(t[f - 1], V, 0);
  if (W > e) {
    var n = 0, B = 0, oe = W - e, Se = 1 << oe;
    for (s.sort(function(ie, q) {
      return V[q.s] - V[ie.s] || ie.f - q.f;
    }); n < r; ++n) {
      var ue = s[n].s;
      if (V[ue] > e)
        B += Se - (1 << W - V[ue]), V[ue] = e;
      else
        break;
    }
    for (B >>= oe; B > 0; ) {
      var J = s[n].s;
      V[J] < e ? B -= 1 << e - V[J]++ - 1 : ++n;
    }
    for (; n >= 0 && B; --n) {
      var se = s[n].s;
      V[se] == e && (--V[se], ++B);
    }
    W = e;
  }
  return { t: new ee(V), l: W };
}, vr = function(i, e, t) {
  return i.s == -1 ? Math.max(vr(i.l, e, t + 1), vr(i.r, e, t + 1)) : e[i.s] = t;
}, as = function(i) {
  for (var e = i.length; e && !i[--e]; )
    ;
  for (var t = new _e(++e), n = 0, r = i[0], s = 1, a = function(l) {
    t[n++] = l;
  }, c = 1; c <= e; ++c)
    if (i[c] == r && c != e)
      ++s;
    else {
      if (!r && s > 2) {
        for (; s > 138; s -= 138)
          a(32754);
        s > 2 && (a(s > 10 ? s - 11 << 5 | 28690 : s - 3 << 5 | 12305), s = 0);
      } else if (s > 3) {
        for (a(r), --s; s > 6; s -= 6)
          a(8304);
        s > 2 && (a(s - 3 << 5 | 8208), s = 0);
      }
      for (; s--; )
        a(r);
      s = 1, r = i[c];
    }
  return { c: t.subarray(0, n), n: e };
}, mn = function(i, e) {
  for (var t = 0, n = 0; n < e.length; ++n)
    t += i[n] * e[n];
  return t;
}, Vs = function(i, e, t) {
  var n = t.length, r = Pr(e + 2);
  i[r] = n & 255, i[r + 1] = n >> 8, i[r + 2] = i[r] ^ 255, i[r + 3] = i[r + 1] ^ 255;
  for (var s = 0; s < n; ++s)
    i[r + s + 4] = t[s];
  return (r + 4 + n) * 8;
}, os = function(i, e, t, n, r, s, a, c, l, u, f) {
  $e(e, f++, t), ++r[256];
  for (var g = ir(r, 15), w = g.t, V = g.l, W = ir(s, 15), B = W.t, oe = W.l, Se = as(w), ue = Se.c, J = Se.n, se = as(B), te = se.c, ie = se.n, q = new _e(19), A = 0; A < ue.length; ++A)
    ++q[ue[A] & 31];
  for (var A = 0; A < te.length; ++A)
    ++q[te[A] & 31];
  for (var k = ir(q, 7), G = k.t, z = k.l, ne = 19; ne > 4 && !G[gr[ne - 1]]; --ne)
    ;
  var Xe = u + 5 << 3, he = mn(r, yt) + mn(s, Cn) + a, ce = mn(r, w) + mn(s, B) + a + 14 + 3 * ne + mn(q, G) + 2 * q[16] + 3 * q[17] + 7 * q[18];
  if (l >= 0 && Xe <= he && Xe <= ce)
    return Vs(e, f, i.subarray(l, l + u));
  var Q, j, le, Y;
  if ($e(e, f, 1 + (ce < he)), f += 2, ce < he) {
    Q = Ze(w, V, 0), j = w, le = Ze(B, oe, 0), Y = B;
    var ln = Ze(G, z, 0);
    $e(e, f, J - 257), $e(e, f + 5, ie - 1), $e(e, f + 10, ne - 4), f += 14;
    for (var A = 0; A < ne; ++A)
      $e(e, f + 3 * A, G[gr[A]]);
    f += 3 * ne;
    for (var be = [ue, te], Ke = 0; Ke < 2; ++Ke)
      for (var fe = be[Ke], A = 0; A < fe.length; ++A) {
        var me = fe[A] & 31;
        $e(e, f, ln[me]), f += G[me], me > 15 && ($e(e, f, fe[A] >> 5 & 127), f += fe[A] >> 12);
      }
  } else
    Q = na, j = yt, le = sa, Y = Cn;
  for (var A = 0; A < c; ++A) {
    var Z = n[A];
    if (Z > 255) {
      var me = Z >> 18 & 31;
      fn(e, f, Q[me + 257]), f += j[me + 257], me > 7 && ($e(e, f, Z >> 23 & 31), f += Gn[me]);
      var Ne = Z & 31;
      fn(e, f, le[Ne]), f += Y[Ne], Ne > 3 && (fn(e, f, Z >> 5 & 8191), f += Qn[Ne]);
    } else
      fn(e, f, Q[Z]), f += j[Z];
  }
  return fn(e, f, Q[256]), f + j[256];
}, ca = /* @__PURE__ */ new Mr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Rs = /* @__PURE__ */ new ee(0), la = function(i, e, t, n, r, s) {
  var a = s.z || i.length, c = new ee(n + a + 5 * (1 + Math.ceil(a / 7e3)) + r), l = c.subarray(n, c.length - r), u = s.l, f = (s.r || 0) & 7;
  if (e) {
    f && (l[0] = s.r >> 3);
    for (var g = ca[e - 1], w = g >> 13, V = g & 8191, W = (1 << t) - 1, B = s.p || new _e(32768), oe = s.h || new _e(W + 1), Se = Math.ceil(t / 3), ue = 2 * Se, J = function(Yn) {
      return (i[Yn] ^ i[Yn + 1] << Se ^ i[Yn + 2] << ue) & W;
    }, se = new Mr(25e3), te = new _e(288), ie = new _e(32), q = 0, A = 0, k = s.i || 0, G = 0, z = s.w || 0, ne = 0; k + 2 < a; ++k) {
      var Xe = J(k), he = k & 32767, ce = oe[Xe];
      if (B[he] = ce, oe[Xe] = he, z <= k) {
        var Q = a - k;
        if ((q > 7e3 || G > 24576) && (Q > 423 || !u)) {
          f = os(i, l, 0, se, te, ie, A, G, ne, k - ne, f), G = q = A = 0, ne = k;
          for (var j = 0; j < 286; ++j)
            te[j] = 0;
          for (var j = 0; j < 30; ++j)
            ie[j] = 0;
        }
        var le = 2, Y = 0, ln = V, be = he - ce & 32767;
        if (Q > 2 && Xe == J(k - be))
          for (var Ke = Math.min(w, Q) - 1, fe = Math.min(32767, k), me = Math.min(258, Q); be <= fe && --ln && he != ce; ) {
            if (i[k + le] == i[k + le - be]) {
              for (var Z = 0; Z < me && i[k + Z] == i[k + Z - be]; ++Z)
                ;
              if (Z > le) {
                if (le = Z, Y = be, Z > Ke)
                  break;
                for (var Ne = Math.min(be, Z - 2), Ct = 0, j = 0; j < Ne; ++j) {
                  var Et = k - be + j & 32767, Bn = B[Et], jn = Et - Bn & 32767;
                  jn > Ct && (Ct = jn, ce = Et);
                }
              }
            }
            he = ce, ce = B[he], be += he - ce & 32767;
          }
        if (Y) {
          se[G++] = 268435456 | yr[le] << 18 | is[Y];
          var dn = yr[le] & 31, un = is[Y] & 31;
          A += Gn[dn] + Qn[un], ++te[257 + dn], ++ie[un], z = k + le, ++q;
        } else
          se[G++] = i[k], ++te[i[k]];
      }
    }
    for (k = Math.max(k, z); k < a; ++k)
      se[G++] = i[k], ++te[i[k]];
    f = os(i, l, u, se, te, ie, A, G, ne, k - ne, f), u || (s.r = f & 7 | l[f / 8 | 0] << 3, f -= 7, s.h = oe, s.p = B, s.i = k, s.w = z);
  } else {
    for (var k = s.w || 0; k < a + u; k += 65535) {
      var Lt = k + 65535;
      Lt >= a && (l[f / 8 | 0] = u, Lt = a), f = Vs(l, f + 1, i.subarray(k, Lt));
    }
    s.i = a;
  }
  return Ns(c, 0, n + Pr(f) + r);
}, da = /* @__PURE__ */ (function() {
  for (var i = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, n = 9; --n; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    i[e] = t;
  }
  return i;
})(), ua = function() {
  var i = -1;
  return {
    p: function(e) {
      for (var t = i, n = 0; n < e.length; ++n)
        t = da[t & 255 ^ e[n]] ^ t >>> 8;
      i = t;
    },
    d: function() {
      return ~i;
    }
  };
}, ha = function(i, e, t, n, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var s = e.dictionary.subarray(-32768), a = new ee(s.length + i.length);
    a.set(s), a.set(i, s.length), i = a, r.w = s.length;
  }
  return la(i, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(i.length))) * 1.5) : 20 : 12 + e.mem, t, n, r);
}, _r = function(i, e, t) {
  for (; t; ++e)
    i[e] = t, t >>>= 8;
}, fa = function(i, e) {
  var t = e.filename;
  if (i[0] = 31, i[1] = 139, i[2] = 8, i[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, i[9] = 3, e.mtime != 0 && _r(i, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    i[3] = 8;
    for (var n = 0; n <= t.length; ++n)
      i[n + 10] = t.charCodeAt(n);
  }
}, ma = function(i) {
  (i[0] != 31 || i[1] != 139 || i[2] != 8) && Te(6, "invalid gzip data");
  var e = i[3], t = 10;
  e & 4 && (t += (i[10] | i[11] << 8) + 2);
  for (var n = (e >> 3 & 1) + (e >> 4 & 1); n > 0; n -= !i[t++])
    ;
  return t + (e & 2);
}, ga = function(i) {
  var e = i.length;
  return (i[e - 4] | i[e - 3] << 8 | i[e - 2] << 16 | i[e - 1] << 24) >>> 0;
}, ya = function(i) {
  return 10 + (i.filename ? i.filename.length + 1 : 0);
};
function cs(i, e) {
  e || (e = {});
  var t = ua(), n = i.length;
  t.p(i);
  var r = ha(i, e, ya(e), 8), s = r.length;
  return fa(r, e), _r(r, s - 8, t.d()), _r(r, s - 4, n), r;
}
function ls(i, e) {
  var t = ma(i);
  return t + 8 > i.length && Te(6, "invalid gzip data"), oa(i.subarray(t, -8), { i: 2 }, new ee(ga(i)), e);
}
var pa = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), va = 0;
try {
  pa.decode(Rs, { stream: !0 }), va = 1;
} catch {
}
const Ms = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Bt(i, e, t) {
  const n = t[0];
  if (e != null && i >= e)
    throw new Error(i + " >= " + e);
  if (i.slice(-1) === n || e && e.slice(-1) === n)
    throw new Error("trailing zero");
  if (e) {
    let a = 0;
    for (; (i[a] || n) === e[a]; )
      a++;
    if (a > 0)
      return e.slice(0, a) + Bt(i.slice(a), e.slice(a), t);
  }
  const r = i ? t.indexOf(i[0]) : 0, s = e != null ? t.indexOf(e[0]) : t.length;
  if (s - r > 1) {
    const a = Math.round(0.5 * (r + s));
    return t[a];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Bt(i.slice(1), null, t);
}
function Ps(i) {
  if (i.length !== Ds(i[0]))
    throw new Error("invalid integer part of order key: " + i);
}
function Ds(i) {
  if (i >= "a" && i <= "z")
    return i.charCodeAt(0) - 97 + 2;
  if (i >= "A" && i <= "Z")
    return 90 - i.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + i);
}
function vn(i) {
  const e = Ds(i[0]);
  if (e > i.length)
    throw new Error("invalid order key: " + i);
  return i.slice(0, e);
}
function ds(i, e) {
  if (i === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + i);
  const t = vn(i);
  if (i.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + i);
}
function us(i, e) {
  Ps(i);
  const [t, ...n] = i.split("");
  let r = !0;
  for (let s = n.length - 1; r && s >= 0; s--) {
    const a = e.indexOf(n[s]) + 1;
    a === e.length ? n[s] = e[0] : (n[s] = e[a], r = !1);
  }
  if (r) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) + 1);
    return s > "a" ? n.push(e[0]) : n.pop(), s + n.join("");
  } else
    return t + n.join("");
}
function _a(i, e) {
  Ps(i);
  const [t, ...n] = i.split("");
  let r = !0;
  for (let s = n.length - 1; r && s >= 0; s--) {
    const a = e.indexOf(n[s]) - 1;
    a === -1 ? n[s] = e.slice(-1) : (n[s] = e[a], r = !1);
  }
  if (r) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) - 1);
    return s < "Z" ? n.push(e.slice(-1)) : n.pop(), s + n.join("");
  } else
    return t + n.join("");
}
function ze(i, e, t = Ms) {
  if (i != null && ds(i, t), e != null && ds(e, t), i != null && e != null && i >= e)
    throw new Error(i + " >= " + e);
  if (i == null) {
    if (e == null)
      return "a" + t[0];
    const l = vn(e), u = e.slice(l.length);
    if (l === "A" + t[0].repeat(26))
      return l + Bt("", u, t);
    if (l < e)
      return l;
    const f = _a(l, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const l = vn(i), u = i.slice(l.length), f = us(l, t);
    return f ?? l + Bt(u, null, t);
  }
  const n = vn(i), r = i.slice(n.length), s = vn(e), a = e.slice(s.length);
  if (n === s)
    return n + Bt(r, a, t);
  const c = us(n, t);
  if (c == null)
    throw new Error("cannot increment any more");
  return c < e ? c : n + Bt(r, null, t);
}
function wr(i, e, t, n = Ms) {
  if (t === 0)
    return [];
  if (t === 1)
    return [ze(i, e, n)];
  {
    let r = ze(i, e, n);
    const s = [r];
    for (let a = 0; a < t - 1; a++)
      r = ze(r, e, n), s.push(r);
    return s;
  }
}
const wa = Is().int().nonnegative().optional();
function gn(i) {
  var t;
  const e = wa.safeParse(i);
  if (!e.success)
    throw new R("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function Bs(i, e, t, n) {
  const r = i.Id, s = n.setContainer(r, new N());
  s.set("Kind", i.Kind), s.set("outerItemId", e), s.set("OrderKey", t);
  const a = s.setContainer("Label", new F());
  i.Label && a.insert(0, i.Label);
  const c = s.setContainer("Info", new N());
  for (const [l, u] of Object.entries(i.Info ?? {}))
    c.set(l, u);
  if (i.Kind === "item") {
    const l = i, u = l.Type === At ? "" : l.Type ?? "";
    switch (s.set("MIMEType", u), !0) {
      case (l.ValueKind === "literal" && l.Value !== void 0): {
        s.set("ValueKind", "literal");
        const g = s.setContainer("literalValue", new F());
        l.Value.length > 0 && g.insert(0, l.Value);
        break;
      }
      case (l.ValueKind === "binary" && l.Value !== void 0): {
        s.set("ValueKind", "binary"), s.set("binaryValue", bs(l.Value));
        break;
      }
      default:
        s.set("ValueKind", l.ValueKind ?? "none");
    }
    const f = wr(null, null, (l.innerEntries ?? []).length);
    (l.innerEntries ?? []).forEach((g, w) => {
      Bs(g, r, f[w], n);
    });
  } else {
    const l = i;
    s.set("TargetId", l.TargetId ?? "");
  }
}
var Re, de, En, Zt, He, _t, pe, st, it, Me, Pe, Jn, Kt, at, wt, h, O, Vt, _n, nt, $n, br, js, Zs, ye, pt, Rt, wn, Mt, bn, Pt, Ks, xr, $s, Sr, kr, T, Us, Ir, Tr, zs;
const vt = class vt extends gi {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(t, n) {
    var s;
    super();
    y(this, h);
    /**** private state ****/
    y(this, Re);
    y(this, de);
    y(this, En);
    y(this, Zt);
    y(this, He, null);
    y(this, _t, /* @__PURE__ */ new Set());
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
    y(this, Kt, 0);
    // ChangeSet accumulator inside a transaction
    y(this, at, {});
    // suppress index updates / change tracking when applying remote patches
    y(this, wt, !1);
    b(this, Re, t), b(this, de, t.getMap("Entries")), b(this, En, (n == null ? void 0 : n.LiteralSizeLimit) ?? di), b(this, Zt, (n == null ? void 0 : n.TrashTTLms) ?? 2592e6), d(this, h, js).call(this);
    const r = (n == null ? void 0 : n.TrashCheckIntervalMs) ?? Math.min(Math.floor(o(this, Zt) / 4), 36e5);
    b(this, He, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      r
    )), typeof ((s = o(this, He)) == null ? void 0 : s.unref) == "function" && o(this, He).unref();
  }
  /**** fromScratch — create a new store with root, trash, and lost-and-found items ****/
  static fromScratch(t) {
    const n = new er(), r = n.getMap("Entries"), s = r.setContainer(ae, new N());
    s.set("Kind", "item"), s.set("outerItemId", ""), s.set("OrderKey", ""), s.setContainer("Label", new F()), s.setContainer("Info", new N()), s.set("MIMEType", ""), s.set("ValueKind", "none");
    const a = r.setContainer($, new N());
    a.set("Kind", "item"), a.set("outerItemId", ae), a.set("OrderKey", "a0"), a.setContainer("Label", new F()).insert(0, "trash"), a.setContainer("Info", new N()), a.set("MIMEType", ""), a.set("ValueKind", "none");
    const l = r.setContainer(ge, new N());
    return l.set("Kind", "item"), l.set("outerItemId", ae), l.set("OrderKey", "a1"), l.setContainer("Label", new F()).insert(0, "lost-and-found"), l.setContainer("Info", new N()), l.set("MIMEType", ""), l.set("ValueKind", "none"), n.commit(), new vt(n, t);
  }
  /**** fromBinary — restore store from gzip-compressed binary data ****/
  static fromBinary(t, n) {
    const r = new er();
    return r.import(ls(t)), new vt(r, n);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, n) {
    const r = typeof t == "string" ? JSON.parse(t) : t, s = new er(), a = s.getMap("Entries");
    return s.commit(), Bs(r, "", "", a), s.commit(), new vt(s, n);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — well-known data accessors ****/
  get RootItem() {
    return d(this, h, nt).call(this, ae);
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
    const s = t ?? At;
    mr(s), gn(r), d(this, h, Vt).call(this, n.Id);
    const a = crypto.randomUUID(), c = d(this, h, Mt).call(this, n.Id, r), l = s === At ? "" : s;
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
    const s = crypto.randomUUID(), a = d(this, h, Mt).call(this, n.Id, r);
    return this.transact(() => {
      const c = o(this, de).setContainer(s, new N());
      c.set("Kind", "link"), c.set("outerItemId", n.Id), c.set("OrderKey", a), c.setContainer("Label", new F()), c.setContainer("Info", new N()), c.set("TargetId", t.Id), d(this, h, ye).call(this, n.Id, s), d(this, h, Rt).call(this, t.Id, s), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, s, "outerItem");
    }), d(this, h, $n).call(this, s);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, n, r) {
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    gn(r), d(this, h, Vt).call(this, n.Id);
    const s = t;
    if (s == null || s.Kind !== "item")
      throw new R("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const a = /* @__PURE__ */ new Map();
    d(this, h, Ir).call(this, s, a);
    const c = d(this, h, Mt).call(this, n.Id, r), l = a.get(s.Id);
    return this.transact(() => {
      d(this, h, Tr).call(this, s, n.Id, c, a), d(this, h, T).call(this, n.Id, "innerEntryList");
    }), d(this, h, nt).call(this, l);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, n, r) {
    if (n == null) throw new R("invalid-argument", "outerItem must not be missing");
    gn(r), d(this, h, Vt).call(this, n.Id);
    const s = t;
    if (s == null || s.Kind !== "link")
      throw new R("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const a = crypto.randomUUID(), c = d(this, h, Mt).call(this, n.Id, r);
    return this.transact(() => {
      const l = o(this, de).setContainer(a, new N());
      l.set("Kind", "link"), l.set("outerItemId", n.Id), l.set("OrderKey", c);
      const u = l.setContainer("Label", new F());
      s.Label && u.insert(0, s.Label);
      const f = l.setContainer("Info", new N());
      for (const [g, w] of Object.entries(s.Info ?? {}))
        f.set(g, w);
      l.set("TargetId", s.TargetId ?? ""), d(this, h, ye).call(this, n.Id, a), s.TargetId && d(this, h, Rt).call(this, s.TargetId, a), d(this, h, T).call(this, n.Id, "innerEntryList");
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
    const s = this._outerItemIdOf(t.Id), a = d(this, h, Mt).call(this, n.Id, r);
    this.transact(() => {
      const c = d(this, h, O).call(this, t.Id);
      if (c.set("outerItemId", n.Id), c.set("OrderKey", a), s === $ && n.Id !== $) {
        const l = c.get("Info");
        l instanceof N && l.get("_trashedAt") != null && (l.delete("_trashedAt"), d(this, h, T).call(this, t.Id, "Info._trashedAt"));
      }
      s != null && (d(this, h, pt).call(this, s, t.Id), d(this, h, T).call(this, s, "innerEntryList")), d(this, h, ye).call(this, n.Id, t.Id), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const n = d(this, h, Pt).call(this, t);
    if (n.length === 0)
      return;
    const r = wr(null, null, n.length);
    n.forEach((s, a) => {
      const c = d(this, h, O).call(this, s.Id);
      c != null && (c.set("OrderKey", r[a]), d(this, h, T).call(this, s.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new R("delete-not-permitted", "this entry cannot be deleted");
    const n = this._outerItemIdOf(t.Id), r = ze(d(this, h, bn).call(this, $), null);
    this.transact(() => {
      const s = d(this, h, O).call(this, t.Id);
      s.set("outerItemId", $), s.set("OrderKey", r);
      let a = s.get("Info");
      a instanceof N || (a = s.setContainer("Info", new N())), a.set("_trashedAt", Date.now()), n != null && (d(this, h, pt).call(this, n, t.Id), d(this, h, T).call(this, n, "innerEntryList")), d(this, h, ye).call(this, $, t.Id), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem"), d(this, h, T).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete a trash entry ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== $)
      throw new R(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, h, Ks).call(this, t.Id))
      throw new R(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, h, kr).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    const n = t ?? o(this, Zt);
    if (n == null)
      return 0;
    const r = Date.now(), s = Array.from(o(this, pe).get($) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const c of s) {
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
  /**** dispose — stop background timer and remove all change listeners ****/
  dispose() {
    o(this, He) != null && (clearInterval(o(this, He)), b(this, He, null)), o(this, _t).clear();
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute operations within a batch transaction ****/
  transact(t) {
    Zn(this, Kt)._++;
    try {
      t();
    } finally {
      if (Zn(this, Kt)._--, o(this, Kt) === 0) {
        o(this, wt) || o(this, Re).commit();
        const n = { ...o(this, at) };
        b(this, at, {});
        const r = o(this, wt) ? "external" : "internal";
        d(this, h, Us).call(this, r, n);
      }
    }
  }
  /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
  onChangeInvoke(t) {
    return o(this, _t).add(t), () => {
      o(this, _t).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — merge remote changes and rebuild indices ****/
  applyRemotePatch(t) {
    if (t.byteLength !== 0) {
      b(this, wt, !0);
      try {
        o(this, Re).import(t), this.transact(() => {
          d(this, h, Zs).call(this);
        });
      } finally {
        b(this, wt, !1);
      }
      this.recoverOrphans();
    }
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
    const t = o(this, de).toJSON(), n = new Set(
      Object.entries(t).filter(([r, s]) => r === ae || s.outerItemId !== "").map(([r]) => r)
    );
    this.transact(() => {
      const r = o(this, de).toJSON();
      for (const [s, a] of Object.entries(r)) {
        if (s === ae)
          continue;
        const c = a.outerItemId;
        if (c && !n.has(c)) {
          const l = ze(d(this, h, bn).call(this, ge), null), u = d(this, h, O).call(this, s);
          u.set("outerItemId", ge), u.set("OrderKey", l), d(this, h, ye).call(this, ge, s), d(this, h, T).call(this, s, "outerItem"), d(this, h, T).call(this, ge, "innerEntryList");
        }
        if (a.Kind === "link") {
          const l = a.TargetId;
          if (l && !n.has(l)) {
            const u = ze(d(this, h, bn).call(this, ge), null), f = o(this, de).setContainer(l, new N());
            f.set("Kind", "item"), f.set("outerItemId", ge), f.set("OrderKey", u), f.setContainer("Label", new F()), f.setContainer("Info", new N()), f.set("MIMEType", ""), f.set("ValueKind", "none"), d(this, h, ye).call(this, ge, l), n.add(l), d(this, h, T).call(this, ge, "innerEntryList");
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
    const s = new TextDecoder().decode(ls(t));
    return this.newEntryFromJSONat(JSON.parse(s), n, r);
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
      let s = r.get("Label");
      if (s instanceof F) {
        const a = s.toString().length;
        a > 0 && s.delete(0, a), n.length > 0 && s.insert(0, n);
      } else
        s = r.setContainer("Label", new F()), n.length > 0 && s.insert(0, n);
      d(this, h, T).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const n = d(this, h, O).call(this, t), r = (n == null ? void 0 : n.get("MIMEType")) ?? "";
    return r === "" ? At : r;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, n) {
    mr(n);
    const r = n === At ? "" : n;
    this.transact(() => {
      var s;
      (s = d(this, h, O).call(this, t)) == null || s.set("MIMEType", r), d(this, h, T).call(this, t, "Type");
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
        const r = d(this, h, O).call(this, t), s = r == null ? void 0 : r.get("literalValue");
        return s instanceof F ? s.toString() : String(s ?? "");
      }
      case n === "binary": {
        const r = d(this, h, O).call(this, t), s = r == null ? void 0 : r.get("binaryValue");
        return s instanceof Uint8Array ? s : void 0;
      }
      default: {
        const r = this._getValueRefOf(t);
        if (r == null)
          return;
        const s = await this._getValueBlobAsync(r.Hash);
        return s == null ? void 0 : n === "literal-reference" ? new TextDecoder().decode(s) : s;
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
            let s = r.get("literalValue");
            if (s instanceof F) {
              const a = s.toString().length;
              a > 0 && s.delete(0, a), n.length > 0 && s.insert(0, n);
            } else
              s = r.setContainer("literalValue", new F()), n.length > 0 && s.insert(0, n);
            break;
          }
          case typeof n == "string": {
            const a = new TextEncoder().encode(n), c = vt._BLOBhash(a);
            this._storeValueBlob(c, a), r.set("ValueKind", "literal-reference"), r.set("ValueRef", JSON.stringify({ Hash: c, Size: a.byteLength }));
            break;
          }
          case n.byteLength <= ui: {
            r.set("ValueKind", "binary"), r.set("binaryValue", n);
            break;
          }
          default: {
            const s = n, a = vt._BLOBhash(s);
            this._storeValueBlob(a, s), r.set("ValueKind", "binary-reference"), r.set("ValueRef", JSON.stringify({ Hash: a, Size: s.byteLength }));
            break;
          }
        }
        d(this, h, T).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value text at a range ****/
  _spliceValueOf(t, n, r, s) {
    if (this._ValueKindOf(t) !== "literal")
      throw new R(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const a = d(this, h, O).call(this, t), c = a == null ? void 0 : a.get("literalValue");
      if (c instanceof F) {
        const l = r - n;
        l > 0 && c.delete(n, l), s.length > 0 && c.insert(n, s);
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
    const s = n.get("ValueRef");
    if (s != null)
      return typeof s == "string" ? JSON.parse(s) : s;
  }
  /**** _InfoProxyOf — get proxy for arbitrary metadata object ****/
  _InfoProxyOf(t) {
    const n = this;
    return new Proxy({}, {
      get(r, s) {
        var l;
        if (typeof s != "string")
          return;
        const a = d(l = n, h, O).call(l, t), c = a == null ? void 0 : a.get("Info");
        return c instanceof N ? c.get(s) : void 0;
      },
      set(r, s, a) {
        return typeof s != "string" ? !1 : a === void 0 ? (n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t), l = c == null ? void 0 : c.get("Info");
          if (l instanceof N) {
            const g = l.get(s) !== void 0;
            l.delete(s), g && d(f = n, h, T).call(f, t, `Info.${s}`);
          }
        }), !0) : (Qi(s), Yi(a), n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t);
          if (c == null)
            return;
          let l = c.get("Info");
          l instanceof N || (l = c.setContainer("Info", new N())), l.set(s, a), d(f = n, h, T).call(f, t, `Info.${s}`);
        }), !0);
      },
      deleteProperty(r, s) {
        return typeof s != "string" ? !1 : (n.transact(() => {
          var l, u;
          const a = d(l = n, h, O).call(l, t), c = a == null ? void 0 : a.get("Info");
          if (c instanceof N) {
            const f = c.get(s) !== void 0;
            c.delete(s), f && d(u = n, h, T).call(u, t, `Info.${s}`);
          }
        }), !0);
      },
      ownKeys() {
        var a;
        const r = d(a = n, h, O).call(a, t), s = r == null ? void 0 : r.get("Info");
        return s instanceof N ? Object.keys(s.toJSON()) : [];
      },
      getOwnPropertyDescriptor(r, s) {
        var u;
        if (typeof s != "string")
          return;
        const a = d(u = n, h, O).call(u, t), c = a == null ? void 0 : a.get("Info");
        if (!(c instanceof N))
          return;
        const l = c.get(s);
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
      get(s, a) {
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
        return s[a];
      }
    });
  }
  /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
  _mayMoveEntryTo(t, n, r) {
    return t === ae || t === n ? !1 : t === $ || t === ge ? n === ae : !d(this, h, zs).call(this, n, t);
  }
  /**** _mayDeleteEntry — check if entry is deletable ****/
  _mayDeleteEntry(t) {
    return t !== ae && t !== $ && t !== ge;
  }
  /**** _TargetOf — get the target data for a link ****/
  _TargetOf(t) {
    const n = d(this, h, O).call(this, t), r = n == null ? void 0 : n.get("TargetId");
    if (r == null || r === "")
      throw new R("not-found", `link '${t}' has no target`);
    return d(this, h, nt).call(this, r);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const n = this._ValueKindOf(t);
    switch (!0) {
      case n === "literal": {
        const r = d(this, h, O).call(this, t), s = r == null ? void 0 : r.get("literalValue");
        return s instanceof F ? s.toString() : String(s ?? "");
      }
      case n === "binary": {
        const r = d(this, h, O).call(this, t), s = r == null ? void 0 : r.get("binaryValue");
        return s instanceof Uint8Array ? s : void 0;
      }
      default:
        return;
    }
  }
};
Re = new WeakMap(), de = new WeakMap(), En = new WeakMap(), Zt = new WeakMap(), He = new WeakMap(), _t = new WeakMap(), pe = new WeakMap(), st = new WeakMap(), it = new WeakMap(), Me = new WeakMap(), Pe = new WeakMap(), Jn = new WeakMap(), Kt = new WeakMap(), at = new WeakMap(), wt = new WeakMap(), h = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry Id ****/
O = function(t) {
  const n = o(this, de).get(t);
  if (n instanceof N && !(n.get("outerItemId") === "" && t !== ae))
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
js = function() {
  o(this, pe).clear(), o(this, st).clear(), o(this, it).clear(), o(this, Me).clear();
  const t = o(this, de).toJSON();
  for (const [n, r] of Object.entries(t)) {
    const s = r.outerItemId;
    if (s && d(this, h, ye).call(this, s, n), r.Kind === "link") {
      const a = r.TargetId;
      a && d(this, h, Rt).call(this, a, n);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Zs = function() {
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
  const s = Array.from(o(this, Me).entries()).filter(([a]) => !n.has(a));
  for (const [a, c] of s)
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
  let s = d(this, h, Pt).call(this, t);
  const a = r(s);
  return a.length <= fi ? a : (this._rebalanceInnerEntriesOf(t), r(d(this, h, Pt).call(this, t)));
}, /**** #lastOrderKeyOf — get the last order key for an entry's children ****/
bn = function(t) {
  const n = d(this, h, Pt).call(this, t);
  return n.length > 0 ? n[n.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/
Pt = function(t) {
  const n = o(this, pe).get(t) ?? /* @__PURE__ */ new Set(), r = [];
  for (const s of n) {
    const a = d(this, h, O).call(this, s);
    (a == null ? void 0 : a.get("outerItemId")) === t && r.push({ Id: s, OrderKey: a.get("OrderKey") ?? "" });
  }
  return r.sort((s, a) => s.OrderKey < a.OrderKey ? -1 : s.OrderKey > a.OrderKey ? 1 : s.Id < a.Id ? -1 : s.Id > a.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
Ks = function(t) {
  const n = d(this, h, Sr).call(this), r = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const a of o(this, pe).get($) ?? /* @__PURE__ */ new Set())
      r.has(a) || d(this, h, xr).call(this, a, n, r) && (r.add(a), s = !0);
  }
  return r.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has links from reachable entries ****/
xr = function(t, n, r) {
  const s = [t], a = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const c = s.pop();
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
      a.has(u) || s.push(u);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — get direct inner entry of TrashItem containing an entry ****/
$s = function(t) {
  let n = t;
  for (; n != null; ) {
    const r = this._outerItemIdOf(n);
    if (r === $)
      return n;
    if (r === ae || r == null)
      return null;
    n = r;
  }
  return null;
}, /**** #reachableFromRoot — get all entries reachable from root ****/
Sr = function() {
  const t = /* @__PURE__ */ new Set(), n = [ae];
  for (; n.length > 0; ) {
    const r = n.pop();
    if (!t.has(r)) {
      t.add(r);
      for (const s of o(this, pe).get(r) ?? /* @__PURE__ */ new Set())
        t.has(s) || n.push(s);
    }
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
kr = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null)
    return;
  const r = n.get("Kind"), s = n.get("outerItemId"), a = d(this, h, Sr).call(this), c = /* @__PURE__ */ new Set(), l = Array.from(o(this, pe).get(t) ?? /* @__PURE__ */ new Set());
  for (const u of l)
    if (d(this, h, xr).call(this, u, a, c)) {
      const f = d(this, h, O).call(this, u), g = ze(d(this, h, bn).call(this, $), null);
      f.set("outerItemId", $), f.set("OrderKey", g), d(this, h, pt).call(this, t, u), d(this, h, ye).call(this, $, u), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, u, "outerItem");
    } else
      d(this, h, kr).call(this, u);
  if (d(this, h, T).call(this, t, "Existence"), n.set("outerItemId", ""), n.set("OrderKey", ""), s && (d(this, h, pt).call(this, s, t), d(this, h, T).call(this, s, "innerEntryList")), r === "link") {
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
    for (const r of o(this, _t))
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
Tr = function(t, n, r, s) {
  const a = s.get(t.Id), c = o(this, de).setContainer(a, new N());
  c.set("Kind", t.Kind), c.set("outerItemId", n), c.set("OrderKey", r);
  const l = c.setContainer("Label", new F());
  t.Label && l.insert(0, t.Label);
  const u = c.setContainer("Info", new N());
  for (const [f, g] of Object.entries(t.Info ?? {}))
    u.set(f, g);
  if (t.Kind === "item") {
    const f = t, g = f.Type === At ? "" : f.Type ?? "";
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
      d(this, h, Tr).call(this, V, a, w[W], s);
    });
  } else {
    const f = t, g = s.has(f.TargetId) ? s.get(f.TargetId) : f.TargetId;
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
const fs = 1, ms = 2, gs = 3, ys = 4, ps = 5, Ve = 32, Kn = 1024 * 1024;
function ar(...i) {
  const e = i.reduce((r, s) => r + s.byteLength, 0), t = new Uint8Array(e);
  let n = 0;
  for (const r of i)
    t.set(r, n), n += r.byteLength;
  return t;
}
function yn(i, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = i, t.set(e, 1), t;
}
function vs(i) {
  const e = new Uint8Array(i.length / 2);
  for (let t = 0; t < i.length; t += 2)
    e[t / 2] = parseInt(i.slice(t, t + 2), 16);
  return e;
}
function _s(i) {
  return Array.from(i).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var We, Je, Ln, $t, bt, Ut, xt, zt, Ft, Ht, An, K, Or, Dt, xn, Fs, Hs, Ws;
class Ia {
  /**** constructor ****/
  constructor(e) {
    y(this, K);
    hn(this, "StoreId");
    y(this, We, "disconnected");
    y(this, Je);
    y(this, Ln, "");
    y(this, $t);
    y(this, bt);
    y(this, Ut, /* @__PURE__ */ new Set());
    y(this, xt, /* @__PURE__ */ new Set());
    y(this, zt, /* @__PURE__ */ new Set());
    y(this, Ft, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    y(this, Ht, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    y(this, An, /* @__PURE__ */ new Map());
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
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SDS WebSocket: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return b(this, Ln, e), b(this, $t, t), d(this, K, Or).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, K, Hs).call(this), d(this, K, xn).call(this, "disconnected"), (e = o(this, Je)) == null || e.close(), b(this, Je, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, K, Dt).call(this, yn(fs, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const n = vs(e);
    if (t.byteLength <= Kn)
      d(this, K, Dt).call(this, yn(ms, ar(n, t)));
    else {
      const r = Math.ceil(t.byteLength / Kn);
      for (let s = 0; s < r; s++) {
        const a = s * Kn, c = t.slice(a, a + Kn), l = new Uint8Array(Ve + 8);
        l.set(n, 0), new DataView(l.buffer).setUint32(Ve, s, !1), new DataView(l.buffer).setUint32(Ve + 4, r, !1), d(this, K, Dt).call(this, yn(ps, ar(l, c)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, K, Dt).call(this, yn(gs, vs(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Ut).add(e), () => {
      o(this, Ut).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, xt).add(e), () => {
      o(this, xt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, zt).add(e), () => {
      o(this, zt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, K, Dt).call(this, yn(ys, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, Ft).add(e), () => {
      o(this, Ft).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, An);
  }
}
We = new WeakMap(), Je = new WeakMap(), Ln = new WeakMap(), $t = new WeakMap(), bt = new WeakMap(), Ut = new WeakMap(), xt = new WeakMap(), zt = new WeakMap(), Ft = new WeakMap(), Ht = new WeakMap(), An = new WeakMap(), K = new WeakSet(), /**** #doConnect ****/
Or = function() {
  return new Promise((e, t) => {
    const r = `${o(this, Ln).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(o(this, $t).Token)}`, s = new WebSocket(r);
    s.binaryType = "arraybuffer", b(this, Je, s), d(this, K, xn).call(this, "connecting"), s.onopen = () => {
      d(this, K, xn).call(this, "connected"), e();
    }, s.onerror = (a) => {
      o(this, We) === "connecting" && t(new Error("WebSocket connection failed"));
    }, s.onclose = () => {
      b(this, Je, void 0), o(this, We) !== "disconnected" && (d(this, K, xn).call(this, "reconnecting"), d(this, K, Fs).call(this));
    }, s.onmessage = (a) => {
      d(this, K, Ws).call(this, new Uint8Array(a.data));
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
    for (const t of o(this, zt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Fs = function() {
  var t;
  const e = ((t = o(this, $t)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  b(this, bt, setTimeout(() => {
    o(this, We) === "reconnecting" && d(this, K, Or).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Hs = function() {
  o(this, bt) != null && (clearTimeout(o(this, bt)), b(this, bt, void 0));
}, /**** #handleFrame ****/
Ws = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], n = e.slice(1);
  switch (t) {
    case fs: {
      for (const r of o(this, Ut))
        try {
          r(n);
        } catch {
        }
      break;
    }
    case ms: {
      if (n.byteLength < Ve)
        return;
      const r = _s(n.slice(0, Ve)), s = n.slice(Ve);
      for (const a of o(this, xt))
        try {
          a(r, s);
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
        r.lastSeen = Date.now(), o(this, An).set(r.PeerId, r);
        for (const s of o(this, Ft))
          try {
            s(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case ps: {
      if (n.byteLength < Ve + 8)
        return;
      const r = _s(n.slice(0, Ve)), s = new DataView(n.buffer, n.byteOffset + Ve, 8), a = s.getUint32(0, !1), c = s.getUint32(4, !1), l = n.slice(Ve + 8);
      let u = o(this, Ht).get(r);
      if (u == null && (u = { total: c, chunks: /* @__PURE__ */ new Map() }, o(this, Ht).set(r, u)), u.chunks.set(a, l), u.chunks.size === u.total) {
        const f = ar(
          ...Array.from({ length: u.total }, (g, w) => u.chunks.get(w))
        );
        o(this, Ht).delete(r);
        for (const g of o(this, xt))
          try {
            g(r, f);
          } catch {
          }
      }
      break;
    }
  }
};
var Nn, Oe, re, ot, De, Ce, ct, Wt, Jt, qt, St, Gt, ve, L, Sn, kn, Js, qs, Gs, Cr, Er, Qs, Lr, Ys;
class Ta {
  /**** Constructor ****/
  constructor(e, t = {}) {
    y(this, L);
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
    y(this, Wt, /* @__PURE__ */ new Set());
    y(this, Jt, /* @__PURE__ */ new Set());
    y(this, qt, /* @__PURE__ */ new Set());
    y(this, St, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    y(this, Gt, /* @__PURE__ */ new Map());
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
      const s = `${e}?token=${encodeURIComponent(t.Token)}`, a = new WebSocket(s);
      b(this, ot, a), d(this, L, Sn).call(this, "connecting"), a.onopen = () => {
        d(this, L, Sn).call(this, "connected"), d(this, L, kn).call(this, { type: "hello", from: o(this, Oe) }), n();
      }, a.onerror = () => {
        if (!o(this, ve) && o(this, re) != null) {
          const c = e.replace("/signal/", "/ws/");
          b(this, ve, !0), o(this, re).connect(c, t).then(n).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, a.onclose = () => {
        o(this, ct) !== "disconnected" && (d(this, L, Sn).call(this, "reconnecting"), setTimeout(() => {
          o(this, ct) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, a.onmessage = (c) => {
        try {
          const l = JSON.parse(c.data);
          d(this, L, Js).call(this, l, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, L, Sn).call(this, "disconnected"), (e = o(this, ot)) == null || e.close(), b(this, ot, void 0);
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
    var s;
    if (o(this, ve)) {
      (s = o(this, re)) == null || s.sendValue(e, t);
      return;
    }
    const n = d(this, L, Lr).call(this, e), r = new Uint8Array(33 + t.byteLength);
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
    const t = d(this, L, Lr).call(this, e), n = new Uint8Array(33);
    n[0] = 3, n.set(t, 1);
    for (const s of o(this, Ce).values())
      if (s.readyState === "open")
        try {
          s.send(n);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Wt).add(e), o(this, ve) && o(this, re) != null ? o(this, re).onPatch(e) : () => {
      o(this, Wt).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, Jt).add(e), o(this, ve) && o(this, re) != null ? o(this, re).onValue(e) : () => {
      o(this, Jt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, qt).add(e), () => {
      o(this, qt).delete(e);
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
    for (const s of o(this, Ce).values())
      if (s.readyState === "open")
        try {
          s.send(n);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, St).add(e), () => {
      o(this, St).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, Gt);
  }
}
Nn = new WeakMap(), Oe = new WeakMap(), re = new WeakMap(), ot = new WeakMap(), De = new WeakMap(), Ce = new WeakMap(), ct = new WeakMap(), Wt = new WeakMap(), Jt = new WeakMap(), qt = new WeakMap(), St = new WeakMap(), Gt = new WeakMap(), ve = new WeakMap(), L = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
Sn = function(e) {
  if (o(this, ct) !== e) {
    b(this, ct, e);
    for (const t of o(this, qt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
kn = function(e) {
  var t;
  ((t = o(this, ot)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, ot).send(JSON.stringify(e));
}, Js = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === o(this, Oe))
        return;
      o(this, De).has(e.from) || await d(this, L, qs).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== o(this, Oe))
        return;
      await d(this, L, Gs).call(this, e.from, e.sdp);
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
  const t = d(this, L, Cr).call(this, e), n = t.createDataChannel("sds", { ordered: !1, maxRetransmits: 0 });
  d(this, L, Er).call(this, n, e), o(this, Ce).set(e, n);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, L, kn).call(this, { type: "offer", from: o(this, Oe), to: e, sdp: r });
}, Gs = async function(e, t) {
  const n = d(this, L, Cr).call(this, e);
  await n.setRemoteDescription(new RTCSessionDescription(t));
  const r = await n.createAnswer();
  await n.setLocalDescription(r), d(this, L, kn).call(this, { type: "answer", from: o(this, Oe), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Cr = function(e) {
  const t = o(this, Nn).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], n = new RTCPeerConnection({ iceServers: t });
  return o(this, De).set(e, n), n.onicecandidate = (r) => {
    r.candidate != null && d(this, L, kn).call(this, {
      type: "candidate",
      from: o(this, Oe),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, n.ondatachannel = (r) => {
    d(this, L, Er).call(this, r.channel, e), o(this, Ce).set(e, r.channel);
  }, n.onconnectionstatechange = () => {
    if (n.connectionState === "failed" || n.connectionState === "closed") {
      o(this, De).delete(e), o(this, Ce).delete(e), o(this, Gt).delete(e);
      for (const r of o(this, St))
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
    d(this, L, Qs).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Qs = function(e, t) {
  if (e.byteLength < 1)
    return;
  const n = e[0], r = e.slice(1);
  switch (n) {
    case 1: {
      for (const s of o(this, Wt))
        try {
          s(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const s = d(this, L, Ys).call(this, r.slice(0, 32)), a = r.slice(32);
      for (const c of o(this, Jt))
        try {
          c(s, a);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const s = JSON.parse(new TextDecoder().decode(r));
        if (typeof s.PeerId != "string")
          break;
        s.lastSeen = Date.now(), o(this, Gt).set(s.PeerId, s);
        for (const a of o(this, St))
          try {
            a(s.PeerId, s);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
Lr = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Ys = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Ie(i) {
  return new Promise((e, t) => {
    i.onsuccess = () => {
      e(i.result);
    }, i.onerror = () => {
      t(i.error);
    };
  });
}
function tt(i, e, t) {
  return i.transaction(e, t);
}
var qe, Ee, Vn, Le, Ue;
class Oa {
  /**** constructor ****/
  constructor(e) {
    y(this, Le);
    y(this, qe);
    y(this, Ee);
    y(this, Vn);
    b(this, Ee, e), b(this, Vn, `sds:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, Le, Ue).call(this), t = tt(e, ["snapshots"], "readonly"), n = await Ie(
      t.objectStore("snapshots").get(o(this, Ee))
    );
    return n != null ? n.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await d(this, Le, Ue).call(this), n = tt(t, ["snapshots"], "readwrite");
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
    const t = await d(this, Le, Ue).call(this), r = tt(t, ["patches"], "readonly").objectStore("patches"), s = IDBKeyRange.bound(
      [o(this, Ee), e + 1],
      [o(this, Ee), Number.MAX_SAFE_INTEGER]
    );
    return (await Ie(
      r.getAll(s)
    )).sort((c, l) => c.clock - l.clock).map((c) => c.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const n = await d(this, Le, Ue).call(this), r = tt(n, ["patches"], "readwrite");
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
    const t = await d(this, Le, Ue).call(this), r = tt(t, ["patches"], "readwrite").objectStore("patches"), s = IDBKeyRange.bound(
      [o(this, Ee), 0],
      [o(this, Ee), e - 1]
    );
    await new Promise((a, c) => {
      const l = r.openCursor(s);
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
    const t = await d(this, Le, Ue).call(this), n = tt(t, ["values"], "readonly"), r = await Ie(
      n.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const n = await d(this, Le, Ue).call(this), s = tt(n, ["values"], "readwrite").objectStore("values"), a = await Ie(
      s.get(e)
    );
    a != null ? await Ie(
      s.put({ hash: e, data: a.data, ref_count: a.ref_count + 1 })
    ) : await Ie(
      s.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await d(this, Le, Ue).call(this), r = tt(t, ["values"], "readwrite").objectStore("values"), s = await Ie(
      r.get(e)
    );
    if (s == null)
      return;
    const a = s.ref_count - 1;
    a <= 0 ? await Ie(r.delete(e)) : await Ie(
      r.put({ hash: e, data: s.data, ref_count: a })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = o(this, qe)) == null || e.close(), b(this, qe, void 0);
  }
}
qe = new WeakMap(), Ee = new WeakMap(), Vn = new WeakMap(), Le = new WeakSet(), Ue = async function() {
  return o(this, qe) != null ? o(this, qe) : new Promise((e, t) => {
    const n = indexedDB.open(o(this, Vn), 1);
    n.onupgradeneeded = (r) => {
      const s = r.target.result;
      s.objectStoreNames.contains("snapshots") || s.createObjectStore("snapshots", { keyPath: "storeId" }), s.objectStoreNames.contains("patches") || s.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), s.objectStoreNames.contains("values") || s.createObjectStore("values", { keyPath: "hash" });
    }, n.onsuccess = (r) => {
      b(this, qe, r.target.result), e(o(this, qe));
    }, n.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const ba = 512 * 1024;
var X, U, P, lt, Qt, Yt, Rn, Mn, Xt, en, dt, tn, kt, It, Tt, Ge, ut, Ae, Pn, nn, Qe, Be, M, Xs, ei, ti, ni, ri, Ar, si, Nr, ii, ai, Vr;
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
    y(this, Qt);
    hn(this, "PeerId", crypto.randomUUID());
    y(this, Yt);
    y(this, Rn);
    y(this, Mn, []);
    // outgoing patch queue (patches created while disconnected)
    y(this, Xt, 0);
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
    y(this, kt);
    y(this, It);
    // presence peer tracking
    y(this, Tt, /* @__PURE__ */ new Map());
    y(this, Ge, /* @__PURE__ */ new Map());
    y(this, ut, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    y(this, Ae);
    // connection state mirror
    y(this, Pn, "disconnected");
    y(this, nn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    y(this, Qe, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    y(this, Be, /* @__PURE__ */ new Map());
    b(this, X, e), b(this, U, t.PersistenceProvider ?? void 0), b(this, P, t.NetworkProvider ?? void 0), b(this, lt, t.PresenceProvider ?? t.NetworkProvider ?? void 0), b(this, Qt, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && o(this, P) != null && b(this, Ae, new BroadcastChannel(`sds:${o(this, P).StoreId}`));
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
    o(this, kt) != null && (clearInterval(o(this, kt)), b(this, kt, void 0));
    for (const r of o(this, Ge).values())
      clearTimeout(r);
    o(this, Ge).clear();
    for (const r of o(this, Qe))
      try {
        r();
      } catch {
      }
    b(this, Qe, []), (e = o(this, Ae)) == null || e.close(), b(this, Ae, void 0), (t = o(this, P)) == null || t.disconnect(), o(this, U) != null && await d(this, M, Ar).call(this), await ((n = o(this, U)) == null ? void 0 : n.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (o(this, P) == null)
      throw new R("no-network-provider", "no NetworkProvider configured");
    b(this, Yt, e), b(this, Rn, t), await o(this, P).connect(e, t);
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
    if (o(this, Yt) == null)
      throw new R(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await o(this, P).connect(o(this, Yt), o(this, Rn));
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
    (n = o(this, lt)) == null || n.sendLocalState(e), (r = o(this, Ae)) == null || r.postMessage({ type: "presence", payload: e });
    for (const s of o(this, ut))
      try {
        s(this.PeerId, t, "local");
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
X = new WeakMap(), U = new WeakMap(), P = new WeakMap(), lt = new WeakMap(), Qt = new WeakMap(), Yt = new WeakMap(), Rn = new WeakMap(), Mn = new WeakMap(), Xt = new WeakMap(), en = new WeakMap(), dt = new WeakMap(), tn = new WeakMap(), kt = new WeakMap(), It = new WeakMap(), Tt = new WeakMap(), Ge = new WeakMap(), ut = new WeakMap(), Ae = new WeakMap(), Pn = new WeakMap(), nn = new WeakMap(), Qe = new WeakMap(), Be = new WeakMap(), M = new WeakSet(), Xs = async function() {
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
    Zn(this, dt)._++;
    const s = o(this, X).exportPatch(r);
    b(this, tn, o(this, X).currentCursor), s.byteLength !== 0 && (o(this, U) != null && (o(this, U).appendPatch(s, o(this, dt)).catch(() => {
    }), b(this, Xt, o(this, Xt) + s.byteLength), o(this, Xt) >= ba && d(this, M, Ar).call(this).catch(() => {
    })), ((a = o(this, P)) == null ? void 0 : a.ConnectionState) === "connected" ? (o(this, P).sendPatch(s), (c = o(this, Ae)) == null || c.postMessage({ type: "patch", payload: s })) : o(this, Mn).push(s), d(this, M, Nr).call(this, n, "send").catch(() => {
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
    const n = o(this, P).onValue(async (r, s) => {
      var a;
      o(this, X).storeValueBlob(r, s), await ((a = o(this, U)) == null ? void 0 : a.saveValue(r, s));
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
  const e = o(this, Qt) / 4;
  b(this, kt, setInterval(() => {
    var t, n;
    o(this, It) != null && ((t = o(this, lt)) == null || t.sendLocalState(o(this, It)), (n = o(this, Ae)) == null || n.postMessage({ type: "presence", payload: o(this, It) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
ri = function() {
  o(this, Ae) != null && (o(this, Ae).onmessage = (e) => {
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
}, Ar = async function() {
  o(this, U) != null && (await o(this, U).saveSnapshot(o(this, X).asBinary()), await o(this, U).prunePatches(o(this, dt)), b(this, en, o(this, dt)), b(this, Xt, 0));
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
  var n, r, s;
  for (const [a, c] of Object.entries(e)) {
    const l = c;
    if (l.has("Existence")) {
      const w = o(this, Be).get(a);
      w != null && (await ((n = o(this, U)) == null ? void 0 : n.releaseValue(w)), o(this, Be).delete(a));
    }
    if (!l.has("Value"))
      continue;
    const u = o(this, Be).get(a), f = o(this, X)._getValueRefOf(a), g = f == null ? void 0 : f.Hash;
    if (u != null && u !== g && (await ((r = o(this, U)) == null ? void 0 : r.releaseValue(u)), o(this, Be).delete(a)), f != null) {
      if (o(this, P) == null) {
        o(this, Be).set(a, f.Hash);
        continue;
      }
      if (t === "send") {
        const w = o(this, X).getValueBlobByHash(f.Hash);
        w != null && (await ((s = o(this, U)) == null ? void 0 : s.saveValue(f.Hash, w)), o(this, Be).set(a, f.Hash), o(this, P).ConnectionState === "connected" && o(this, P).sendValue(f.Hash, w));
      } else
        o(this, Be).set(a, f.Hash), !o(this, X).hasValueBlob(f.Hash) && o(this, P).ConnectionState === "connected" && o(this, P).requestValue(f.Hash);
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
    } catch (s) {
      console.error("SDS: presence handler failed", s);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
ai = function(e) {
  const t = o(this, Ge).get(e);
  t != null && clearTimeout(t);
  const n = setTimeout(
    () => {
      d(this, M, Vr).call(this, e);
    },
    o(this, Qt)
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
