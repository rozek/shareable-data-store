var ui = Object.defineProperty;
var Kr = (i) => {
  throw TypeError(i);
};
var hi = (i, e, t) => e in i ? ui(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var yn = (i, e, t) => hi(i, typeof e != "symbol" ? e + "" : e, t), nr = (i, e, t) => e.has(i) || Kr("Cannot " + t);
var o = (i, e, t) => (nr(i, e, "read from private field"), t ? t.call(i) : e.get(i)), y = (i, e, t) => e.has(i) ? Kr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), w = (i, e, t, n) => (nr(i, e, "write to private field"), n ? n.call(i, t) : e.set(i, t), t), d = (i, e, t) => (nr(i, e, "access private method"), t);
var Un = (i, e, t, n) => ({
  set _(r) {
    w(i, e, r, t);
  },
  get _() {
    return o(i, e, n);
  }
});
import { Loro as rr, LoroMap as R, LoroText as H, VersionVector as fi } from "loro-crdt";
class P extends Error {
  constructor(t, n) {
    super(n);
    yn(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const ae = "00000000-0000-4000-8000-000000000000", $ = "00000000-0000-4000-8000-000000000001", ye = "00000000-0000-4000-8000-000000000002", Mt = "text/plain", mi = 131072, gi = 2048, yi = 5e3, $r = 1024, Ur = 256, zr = 1024, Fr = 262144, pi = 200;
function vi(i) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(i).toString("base64");
  let t = "";
  for (let n = 0; n < i.byteLength; n++)
    t += String.fromCharCode(i[n]);
  return btoa(t);
}
function Ts(i) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(i, "base64")) : Uint8Array.from(atob(i), (t) => t.charCodeAt(0));
}
var Je, $t, ks;
let _i = (ks = class {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    y(this, Je, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    y(this, $t);
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
    o(this, Je).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = o(this, Je).get(e);
    return t == null && o(this, $t) != null && (t = await o(this, $t).call(this, e), t != null && o(this, Je).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    o(this, Je).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return o(this, Je).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return o(this, Je).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    w(this, $t, e);
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
        throw new P("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
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
      u !== void 0 && (l.Value = typeof u == "string" ? u : vi(u));
    }
    return l.innerEntries = Array.from(this._innerEntriesOf(e)).map((u) => this._EntryAsJSON(u.Id)), l;
  }
}, Je = new WeakMap(), $t = new WeakMap(), ks);
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
var Hr;
(function(i) {
  i.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Hr || (Hr = {}));
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
]), it = (i) => {
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
class et extends Error {
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
    if (!(e instanceof et))
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
et.create = (i) => new et(i);
const dr = (i, e) => {
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
let wi = dr;
function bi() {
  return wi;
}
const Si = (i) => {
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
  const t = bi(), n = Si({
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
      t === dr ? void 0 : dr
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
        return S;
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
        return S;
      s.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof a.value < "u" || r.alwaysSet) && (n[s.value] = a.value);
    }
    return { status: e.value, value: n };
  }
}
const S = Object.freeze({
  status: "aborted"
}), wn = (i) => ({ status: "dirty", value: i }), Ie = (i) => ({ status: "valid", value: i }), Wr = (i) => i.status === "aborted", Jr = (i) => i.status === "dirty", cn = (i) => i.status === "valid", Hn = (i) => typeof Promise < "u" && i instanceof Promise;
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
const qr = (i, e) => {
  if (cn(e))
    return { success: !0, data: e.value };
  if (!i.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new et(i.common.issues);
      return this._error = t, this._error;
    }
  };
};
function k(i) {
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
    return it(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: it(e.data),
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
        parsedType: it(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Hn(t))
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
      parsedType: it(e)
    }, r = this._parseSync({ data: e, path: n.path, parent: n });
    return qr(n, r);
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
      parsedType: it(e)
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: e, path: [], parent: t });
        return cn(s) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => cn(s) ? {
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
      parsedType: it(e)
    }, r = this._parse({ data: e, path: n.path, parent: n }), s = await (Hn(r) ? r : Promise.resolve(r));
    return qr(n, s);
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
    return new un({
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
    return ft.create(this, this._def);
  }
  nullable() {
    return hn.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return $e.create(this);
  }
  promise() {
    return Gn.create(this, this._def);
  }
  or(e) {
    return Jn.create([this, e], this._def);
  }
  and(e) {
    return qn.create(this, e, this._def);
  }
  transform(e) {
    return new un({
      ...k(this._def),
      schema: this,
      typeName: I.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new mr({
      ...k(this._def),
      innerType: this,
      defaultValue: t,
      typeName: I.ZodDefault
    });
  }
  brand() {
    return new Fi({
      typeName: I.ZodBranded,
      type: this,
      ...k(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new gr({
      ...k(this._def),
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
    return Br.create(this, e);
  }
  readonly() {
    return yr.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Ii = /^c[^\s-]{8,}$/i, xi = /^[0-9a-z]+$/, ki = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Ti = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Oi = /^[a-z0-9_-]{21}$/i, Ci = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Ei = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Li = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Ai = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let sr;
const Ri = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ni = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Vi = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Mi = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Pi = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Di = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Os = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Bi = new RegExp(`^${Os}$`);
function Cs(i) {
  let e = "[0-5]\\d";
  i.precision ? e = `${e}\\.\\d{${i.precision}}` : i.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = i.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function ji(i) {
  return new RegExp(`^${Cs(i)}$`);
}
function Zi(i) {
  let e = `${Os}T${Cs(i)}`;
  const t = [];
  return t.push(i.local ? "Z?" : "Z"), i.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Ki(i, e) {
  return !!((e === "v4" || !e) && Ri.test(i) || (e === "v6" || !e) && Vi.test(i));
}
function $i(i, e) {
  if (!Ci.test(i))
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
function Ui(i, e) {
  return !!((e === "v4" || !e) && Ni.test(i) || (e === "v6" || !e) && Mi.test(i));
}
class ht extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_type,
        expected: v.string,
        received: s.parsedType
      }), S;
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
        Li.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "email",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "emoji")
        sr || (sr = new RegExp(Ai, "u")), sr.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "emoji",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "uuid")
        Ti.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "uuid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "nanoid")
        Oi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "nanoid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "cuid")
        Ii.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "cuid2")
        xi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
          validation: "cuid2",
          code: m.invalid_string,
          message: s.message
        }), n.dirty());
      else if (s.kind === "ulid")
        ki.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
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
      }), n.dirty()) : s.kind === "datetime" ? Zi(s).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "datetime",
        message: s.message
      }), n.dirty()) : s.kind === "date" ? Bi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "date",
        message: s.message
      }), n.dirty()) : s.kind === "time" ? ji(s).test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_string,
        validation: "time",
        message: s.message
      }), n.dirty()) : s.kind === "duration" ? Ei.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "duration",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "ip" ? Ki(e.data, s.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "ip",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "jwt" ? $i(e.data, s.alg) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "jwt",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "cidr" ? Ui(e.data, s.version) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "cidr",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "base64" ? Pi.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        validation: "base64",
        code: m.invalid_string,
        message: s.message
      }), n.dirty()) : s.kind === "base64url" ? Di.test(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
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
  typeName: I.ZodString,
  coerce: (i == null ? void 0 : i.coerce) ?? !1,
  ...k(i)
});
function zi(i, e) {
  const t = (i.toString().split(".")[1] || "").length, n = (e.toString().split(".")[1] || "").length, r = t > n ? t : n, s = Number.parseInt(i.toFixed(r).replace(".", "")), a = Number.parseInt(e.toFixed(r).replace(".", ""));
  return s % a / 10 ** r;
}
class ln extends C {
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
      }), S;
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
      }), r.dirty()) : s.kind === "multipleOf" ? zi(e.data, s.value) !== 0 && (n = this._getOrReturnCtx(e, n), p(n, {
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
    return new ln({
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
    return new ln({
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
ln.create = (i) => new ln({
  checks: [],
  typeName: I.ZodNumber,
  coerce: (i == null ? void 0 : i.coerce) || !1,
  ...k(i)
});
class Cn extends C {
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
    }), S;
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
    return new Cn({
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
    return new Cn({
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
Cn.create = (i) => new Cn({
  checks: [],
  typeName: I.ZodBigInt,
  coerce: (i == null ? void 0 : i.coerce) ?? !1,
  ...k(i)
});
class Gr extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.boolean,
        received: n.parsedType
      }), S;
    }
    return Ie(e.data);
  }
}
Gr.create = (i) => new Gr({
  typeName: I.ZodBoolean,
  coerce: (i == null ? void 0 : i.coerce) || !1,
  ...k(i)
});
class Wn extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_type,
        expected: v.date,
        received: s.parsedType
      }), S;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return p(s, {
        code: m.invalid_date
      }), S;
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
    return new Wn({
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
Wn.create = (i) => new Wn({
  checks: [],
  coerce: (i == null ? void 0 : i.coerce) || !1,
  typeName: I.ZodDate,
  ...k(i)
});
class Qr extends C {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.symbol,
        received: n.parsedType
      }), S;
    }
    return Ie(e.data);
  }
}
Qr.create = (i) => new Qr({
  typeName: I.ZodSymbol,
  ...k(i)
});
class ur extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.undefined,
        received: n.parsedType
      }), S;
    }
    return Ie(e.data);
  }
}
ur.create = (i) => new ur({
  typeName: I.ZodUndefined,
  ...k(i)
});
class Yr extends C {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.null,
        received: n.parsedType
      }), S;
    }
    return Ie(e.data);
  }
}
Yr.create = (i) => new Yr({
  typeName: I.ZodNull,
  ...k(i)
});
class En extends C {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Ie(e.data);
  }
}
En.create = (i) => new En({
  typeName: I.ZodAny,
  ...k(i)
});
class hr extends C {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Ie(e.data);
  }
}
hr.create = (i) => new hr({
  typeName: I.ZodUnknown,
  ...k(i)
});
class gt extends C {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return p(t, {
      code: m.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), S;
  }
}
gt.create = (i) => new gt({
  typeName: I.ZodNever,
  ...k(i)
});
class Xr extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.void,
        received: n.parsedType
      }), S;
    }
    return Ie(e.data);
  }
}
Xr.create = (i) => new Xr({
  typeName: I.ZodVoid,
  ...k(i)
});
class $e extends C {
  _parse(e) {
    const { ctx: t, status: n } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== v.array)
      return p(t, {
        code: m.invalid_type,
        expected: v.array,
        received: t.parsedType
      }), S;
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
    return new $e({
      ...this._def,
      minLength: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new $e({
      ...this._def,
      maxLength: { value: e, message: _.toString(t) }
    });
  }
  length(e, t) {
    return new $e({
      ...this._def,
      exactLength: { value: e, message: _.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
$e.create = (i, e) => new $e({
  type: i,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: I.ZodArray,
  ...k(e)
});
function Pt(i) {
  if (i instanceof J) {
    const e = {};
    for (const t in i.shape) {
      const n = i.shape[t];
      e[t] = ft.create(Pt(n));
    }
    return new J({
      ...i._def,
      shape: () => e
    });
  } else return i instanceof $e ? new $e({
    ...i._def,
    type: Pt(i.element)
  }) : i instanceof ft ? ft.create(Pt(i.unwrap())) : i instanceof hn ? hn.create(Pt(i.unwrap())) : i instanceof Lt ? Lt.create(i.items.map((e) => Pt(e))) : i;
}
class J extends C {
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
      }), S;
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
        const g = await f.key, b = await f.value;
        u.push({
          key: g,
          value: b,
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
    return _.errToObj, new J({
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
    return new J({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new J({
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
    return new J({
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
    return new J({
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
    return new J({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const n of E.objectKeys(e))
      e[n] && this.shape[n] && (t[n] = this.shape[n]);
    return new J({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const n of E.objectKeys(this.shape))
      e[n] || (t[n] = this.shape[n]);
    return new J({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Pt(this);
  }
  partial(e) {
    const t = {};
    for (const n of E.objectKeys(this.shape)) {
      const r = this.shape[n];
      e && !e[n] ? t[n] = r : t[n] = r.optional();
    }
    return new J({
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
    return new J({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Es(E.objectKeys(this.shape));
  }
}
J.create = (i, e) => new J({
  shape: () => i,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: I.ZodObject,
  ...k(e)
});
J.strictCreate = (i, e) => new J({
  shape: () => i,
  unknownKeys: "strict",
  catchall: gt.create(),
  typeName: I.ZodObject,
  ...k(e)
});
J.lazycreate = (i, e) => new J({
  shape: i,
  unknownKeys: "strip",
  catchall: gt.create(),
  typeName: I.ZodObject,
  ...k(e)
});
class Jn extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = this._def.options;
    function r(s) {
      for (const c of s)
        if (c.result.status === "valid")
          return c.result;
      for (const c of s)
        if (c.result.status === "dirty")
          return t.common.issues.push(...c.ctx.common.issues), c.result;
      const a = s.map((c) => new et(c.ctx.common.issues));
      return p(t, {
        code: m.invalid_union,
        unionErrors: a
      }), S;
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
      const c = a.map((l) => new et(l));
      return p(t, {
        code: m.invalid_union,
        unionErrors: c
      }), S;
    }
  }
  get options() {
    return this._def.options;
  }
}
Jn.create = (i, e) => new Jn({
  options: i,
  typeName: I.ZodUnion,
  ...k(e)
});
function fr(i, e) {
  const t = it(i), n = it(e);
  if (i === e)
    return { valid: !0, data: i };
  if (t === v.object && n === v.object) {
    const r = E.objectKeys(e), s = E.objectKeys(i).filter((c) => r.indexOf(c) !== -1), a = { ...i, ...e };
    for (const c of s) {
      const l = fr(i[c], e[c]);
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
      const a = i[s], c = e[s], l = fr(a, c);
      if (!l.valid)
        return { valid: !1 };
      r.push(l.data);
    }
    return { valid: !0, data: r };
  } else return t === v.date && n === v.date && +i == +e ? { valid: !0, data: i } : { valid: !1 };
}
class qn extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = (s, a) => {
      if (Wr(s) || Wr(a))
        return S;
      const c = fr(s.value, a.value);
      return c.valid ? ((Jr(s) || Jr(a)) && t.dirty(), { status: t.value, value: c.data }) : (p(n, {
        code: m.invalid_intersection_types
      }), S);
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
qn.create = (i, e, t) => new qn({
  left: i,
  right: e,
  typeName: I.ZodIntersection,
  ...k(t)
});
class Lt extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.array)
      return p(n, {
        code: m.invalid_type,
        expected: v.array,
        received: n.parsedType
      }), S;
    if (n.data.length < this._def.items.length)
      return p(n, {
        code: m.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), S;
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
    return new Lt({
      ...this._def,
      rest: e
    });
  }
}
Lt.create = (i, e) => {
  if (!Array.isArray(i))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Lt({
    items: i,
    typeName: I.ZodTuple,
    rest: null,
    ...k(e)
  });
};
class es extends C {
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
      }), S;
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
            return S;
          (u.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(u.value, f.value);
        }
        return { status: t.value, value: c };
      });
    } else {
      const c = /* @__PURE__ */ new Map();
      for (const l of a) {
        const u = l.key, f = l.value;
        if (u.status === "aborted" || f.status === "aborted")
          return S;
        (u.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(u.value, f.value);
      }
      return { status: t.value, value: c };
    }
  }
}
es.create = (i, e, t) => new es({
  valueType: e,
  keyType: i,
  typeName: I.ZodMap,
  ...k(t)
});
class Ln extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.set)
      return p(n, {
        code: m.invalid_type,
        expected: v.set,
        received: n.parsedType
      }), S;
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
          return S;
        f.status === "dirty" && t.dirty(), u.add(f.value);
      }
      return { status: t.value, value: u };
    }
    const c = [...n.data.values()].map((l, u) => s._parse(new mt(n, l, n.path, u)));
    return n.common.async ? Promise.all(c).then((l) => a(l)) : a(c);
  }
  min(e, t) {
    return new Ln({
      ...this._def,
      minSize: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new Ln({
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
Ln.create = (i, e) => new Ln({
  valueType: i,
  minSize: null,
  maxSize: null,
  typeName: I.ZodSet,
  ...k(e)
});
class ts extends C {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
ts.create = (i, e) => new ts({
  getter: i,
  typeName: I.ZodLazy,
  ...k(e)
});
class ns extends C {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return p(t, {
        received: t.data,
        code: m.invalid_literal,
        expected: this._def.value
      }), S;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
ns.create = (i, e) => new ns({
  value: i,
  typeName: I.ZodLiteral,
  ...k(e)
});
function Es(i, e) {
  return new dn({
    values: i,
    typeName: I.ZodEnum,
    ...k(e)
  });
}
class dn extends C {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return p(t, {
        expected: E.joinValues(n),
        received: t.parsedType,
        code: m.invalid_type
      }), S;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return p(t, {
        received: t.data,
        code: m.invalid_enum_value,
        options: n
      }), S;
    }
    return Ie(e.data);
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
    return dn.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return dn.create(this.options.filter((n) => !e.includes(n)), {
      ...this._def,
      ...t
    });
  }
}
dn.create = Es;
class rs extends C {
  _parse(e) {
    const t = E.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
    if (n.parsedType !== v.string && n.parsedType !== v.number) {
      const r = E.objectValues(t);
      return p(n, {
        expected: E.joinValues(r),
        received: n.parsedType,
        code: m.invalid_type
      }), S;
    }
    if (this._cache || (this._cache = new Set(E.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = E.objectValues(t);
      return p(n, {
        received: n.data,
        code: m.invalid_enum_value,
        options: r
      }), S;
    }
    return Ie(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
rs.create = (i, e) => new rs({
  values: i,
  typeName: I.ZodNativeEnum,
  ...k(e)
});
class Gn extends C {
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
      }), S;
    const n = t.parsedType === v.promise ? t.data : Promise.resolve(t.data);
    return Ie(n.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Gn.create = (i, e) => new Gn({
  type: i,
  typeName: I.ZodPromise,
  ...k(e)
});
class un extends C {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === I.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
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
            return S;
          const l = await this._def.schema._parseAsync({
            data: c,
            path: n.path,
            parent: n
          });
          return l.status === "aborted" ? S : l.status === "dirty" || t.value === "dirty" ? wn(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return S;
        const c = this._def.schema._parseSync({
          data: a,
          path: n.path,
          parent: n
        });
        return c.status === "aborted" ? S : c.status === "dirty" || t.value === "dirty" ? wn(c.value) : c;
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
        return c.status === "aborted" ? S : (c.status === "dirty" && t.dirty(), a(c.value), { status: t.value, value: c.value });
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((c) => c.status === "aborted" ? S : (c.status === "dirty" && t.dirty(), a(c.value).then(() => ({ status: t.value, value: c.value }))));
    }
    if (r.type === "transform")
      if (n.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n
        });
        if (!cn(a))
          return S;
        const c = r.transform(a.value, s);
        if (c instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: c };
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((a) => cn(a) ? Promise.resolve(r.transform(a.value, s)).then((c) => ({
          status: t.value,
          value: c
        })) : S);
    E.assertNever(r);
  }
}
un.create = (i, e, t) => new un({
  schema: i,
  typeName: I.ZodEffects,
  effect: e,
  ...k(t)
});
un.createWithPreprocess = (i, e, t) => new un({
  schema: e,
  effect: { type: "preprocess", transform: i },
  typeName: I.ZodEffects,
  ...k(t)
});
class ft extends C {
  _parse(e) {
    return this._getType(e) === v.undefined ? Ie(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ft.create = (i, e) => new ft({
  innerType: i,
  typeName: I.ZodOptional,
  ...k(e)
});
class hn extends C {
  _parse(e) {
    return this._getType(e) === v.null ? Ie(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
hn.create = (i, e) => new hn({
  innerType: i,
  typeName: I.ZodNullable,
  ...k(e)
});
class mr extends C {
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
mr.create = (i, e) => new mr({
  innerType: i,
  typeName: I.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...k(e)
});
class gr extends C {
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
    return Hn(r) ? r.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new et(n.common.issues);
        },
        input: n.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new et(n.common.issues);
        },
        input: n.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
gr.create = (i, e) => new gr({
  innerType: i,
  typeName: I.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...k(e)
});
class ss extends C {
  _parse(e) {
    if (this._getType(e) !== v.nan) {
      const n = this._getOrReturnCtx(e);
      return p(n, {
        code: m.invalid_type,
        expected: v.nan,
        received: n.parsedType
      }), S;
    }
    return { status: "valid", value: e.data };
  }
}
ss.create = (i) => new ss({
  typeName: I.ZodNaN,
  ...k(i)
});
class Fi extends C {
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
class Br extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return s.status === "aborted" ? S : s.status === "dirty" ? (t.dirty(), wn(s.value)) : this._def.out._parseAsync({
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
      return r.status === "aborted" ? S : r.status === "dirty" ? (t.dirty(), {
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
    return new Br({
      in: e,
      out: t,
      typeName: I.ZodPipeline
    });
  }
}
class yr extends C {
  _parse(e) {
    const t = this._def.innerType._parse(e), n = (r) => (cn(r) && (r.value = Object.freeze(r.value)), r);
    return Hn(t) ? t.then((r) => n(r)) : n(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
yr.create = (i, e) => new yr({
  innerType: i,
  typeName: I.ZodReadonly,
  ...k(e)
});
function is(i, e) {
  const t = typeof i == "function" ? i(e) : typeof i == "string" ? { message: i } : i;
  return typeof t == "string" ? { message: t } : t;
}
function Hi(i, e = {}, t) {
  return i ? En.create().superRefine((n, r) => {
    const s = i(n);
    if (s instanceof Promise)
      return s.then((a) => {
        if (!a) {
          const c = is(e, n), l = c.fatal ?? t ?? !0;
          r.addIssue({ code: "custom", ...c, fatal: l });
        }
      });
    if (!s) {
      const a = is(e, n), c = a.fatal ?? t ?? !0;
      r.addIssue({ code: "custom", ...a, fatal: c });
    }
  }) : En.create();
}
var I;
(function(i) {
  i.ZodString = "ZodString", i.ZodNumber = "ZodNumber", i.ZodNaN = "ZodNaN", i.ZodBigInt = "ZodBigInt", i.ZodBoolean = "ZodBoolean", i.ZodDate = "ZodDate", i.ZodSymbol = "ZodSymbol", i.ZodUndefined = "ZodUndefined", i.ZodNull = "ZodNull", i.ZodAny = "ZodAny", i.ZodUnknown = "ZodUnknown", i.ZodNever = "ZodNever", i.ZodVoid = "ZodVoid", i.ZodArray = "ZodArray", i.ZodObject = "ZodObject", i.ZodUnion = "ZodUnion", i.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", i.ZodIntersection = "ZodIntersection", i.ZodTuple = "ZodTuple", i.ZodRecord = "ZodRecord", i.ZodMap = "ZodMap", i.ZodSet = "ZodSet", i.ZodFunction = "ZodFunction", i.ZodLazy = "ZodLazy", i.ZodLiteral = "ZodLiteral", i.ZodEnum = "ZodEnum", i.ZodEffects = "ZodEffects", i.ZodNativeEnum = "ZodNativeEnum", i.ZodOptional = "ZodOptional", i.ZodNullable = "ZodNullable", i.ZodDefault = "ZodDefault", i.ZodCatch = "ZodCatch", i.ZodPromise = "ZodPromise", i.ZodBranded = "ZodBranded", i.ZodPipeline = "ZodPipeline", i.ZodReadonly = "ZodReadonly";
})(I || (I = {}));
const Wi = (i, e = {
  message: `Input not instance of ${i.name}`
}) => Hi((t) => t instanceof i, e), Zn = ht.create, Ls = ln.create, Ji = ur.create;
En.create;
const qi = hr.create;
gt.create;
$e.create;
const Gi = Jn.create;
qn.create;
Lt.create;
dn.create;
Gn.create;
ft.create;
hn.create;
function Yn(i, e) {
  var r;
  const t = i.safeParse(e);
  if (t.success)
    return t.data;
  const n = ((r = t.error.issues[0]) == null ? void 0 : r.message) ?? "invalid argument";
  throw new P("invalid-argument", n);
}
const Qi = Zn({
  invalid_type_error: "Label must be a string"
}).max($r, `Label must not exceed ${$r} characters`), Yi = Zn({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(Ur, `MIMEType must not exceed ${Ur} characters`), Xi = Zn({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(zr, `Info key must not exceed ${zr} characters`), ea = qi().superRefine((i, e) => {
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
  if (t === void 0) {
    e.addIssue({
      code: m.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > Fr && e.addIssue({
    code: m.custom,
    message: `Info value must not exceed ${Fr} bytes when serialised as UTF-8 JSON`
  });
});
function As(i) {
  Yn(Qi, i);
}
function pr(i) {
  Yn(Yi, i);
}
function ta(i) {
  Yn(Xi, i);
}
function na(i) {
  Yn(ea, i);
}
class Rs {
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
    return this.Id === ye;
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
    As(e), this._Store._setLabelOf(this.Id, e);
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
const ra = Gi(
  [Zn(), Wi(Uint8Array), Ji()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), as = Ls({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), sa = Zn({
  invalid_type_error: "Replacement must be a string"
});
function ir(i, e, t) {
  var s;
  const n = i.safeParse(e);
  if (n.success)
    return n.data;
  const r = (t ? `${t}: ` : "") + (((s = n.error.issues[0]) == null ? void 0 : s.message) ?? "invalid argument");
  throw new P("invalid-argument", r);
}
class os extends Rs {
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
    pr(e), this._Store._setTypeOf(this.Id, e);
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
    ir(ra, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, n) {
    if (ir(as, e, "fromIndex"), !as.safeParse(t).success || t < e)
      throw new P("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    ir(sa, n, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, n);
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
class cs extends Rs {
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
var te = Uint8Array, _e = Uint16Array, jr = Int32Array, Xn = new te([
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
]), er = new te([
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
]), vr = new te([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Ns = function(i, e) {
  for (var t = new _e(31), n = 0; n < 31; ++n)
    t[n] = e += 1 << i[n - 1];
  for (var r = new jr(t[30]), n = 1; n < 30; ++n)
    for (var s = t[n]; s < t[n + 1]; ++s)
      r[s] = s - t[n] << 5 | n;
  return { b: t, r };
}, Vs = Ns(Xn, 2), Ms = Vs.b, _r = Vs.r;
Ms[28] = 258, _r[258] = 28;
var Ps = Ns(er, 0), ia = Ps.b, ls = Ps.r, wr = new _e(32768);
for (var D = 0; D < 32768; ++D) {
  var nt = (D & 43690) >> 1 | (D & 21845) << 1;
  nt = (nt & 52428) >> 2 | (nt & 13107) << 2, nt = (nt & 61680) >> 4 | (nt & 3855) << 4, wr[D] = ((nt & 65280) >> 8 | (nt & 255) << 8) >> 1;
}
var Ue = (function(i, e, t) {
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
        for (var u = r << 4 | i[r], f = e - i[r], g = a[i[r] - 1]++ << f, b = g | (1 << f) - 1; g <= b; ++g)
          c[wr[g] >> l] = u;
  } else
    for (c = new _e(n), r = 0; r < n; ++r)
      i[r] && (c[r] = wr[a[i[r] - 1]++] >> 15 - i[r]);
  return c;
}), yt = new te(288);
for (var D = 0; D < 144; ++D)
  yt[D] = 8;
for (var D = 144; D < 256; ++D)
  yt[D] = 9;
for (var D = 256; D < 280; ++D)
  yt[D] = 7;
for (var D = 280; D < 288; ++D)
  yt[D] = 8;
var An = new te(32);
for (var D = 0; D < 32; ++D)
  An[D] = 5;
var aa = /* @__PURE__ */ Ue(yt, 9, 0), oa = /* @__PURE__ */ Ue(yt, 9, 1), ca = /* @__PURE__ */ Ue(An, 5, 0), la = /* @__PURE__ */ Ue(An, 5, 1), ar = function(i) {
  for (var e = i[0], t = 1; t < i.length; ++t)
    i[t] > e && (e = i[t]);
  return e;
}, ke = function(i, e, t) {
  var n = e / 8 | 0;
  return (i[n] | i[n + 1] << 8) >> (e & 7) & t;
}, or = function(i, e) {
  var t = e / 8 | 0;
  return (i[t] | i[t + 1] << 8 | i[t + 2] << 16) >> (e & 7);
}, Zr = function(i) {
  return (i + 7) / 8 | 0;
}, Ds = function(i, e, t) {
  return (t == null || t > i.length) && (t = i.length), new te(i.subarray(e, t));
}, da = [
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
], Oe = function(i, e, t) {
  var n = new Error(e || da[i]);
  if (n.code = i, Error.captureStackTrace && Error.captureStackTrace(n, Oe), !t)
    throw n;
  return n;
}, ua = function(i, e, t, n) {
  var r = i.length, s = 0;
  if (!r || e.f && !e.l)
    return t || new te(0);
  var a = !t, c = a || e.i != 2, l = e.i;
  a && (t = new te(r * 3));
  var u = function(mn) {
    var gn = t.length;
    if (mn > gn) {
      var Nt = new te(Math.max(gn * 2, mn));
      Nt.set(t), t = Nt;
    }
  }, f = e.f || 0, g = e.p || 0, b = e.b || 0, M = e.l, q = e.d, j = e.m, ce = e.n, xe = r * 8;
  do {
    if (!M) {
      f = ke(i, g, 1);
      var he = ke(i, g + 1, 3);
      if (g += 3, he)
        if (he == 1)
          M = oa, q = la, j = 9, ce = 5;
        else if (he == 2) {
          var ie = ke(i, g, 31) + 257, Q = ke(i, g + 10, 15) + 4, A = ie + ke(i, g + 5, 31) + 1;
          g += 14;
          for (var x = new te(A), Y = new te(19), F = 0; F < Q; ++F)
            Y[vr[F]] = ke(i, g + F * 3, 7);
          g += Q * 3;
          for (var re = ar(Y), tt = (1 << re) - 1, fe = Ue(Y, re, 1), F = 0; F < A; ) {
            var le = fe[ke(i, g, tt)];
            g += le & 15;
            var G = le >> 4;
            if (G < 16)
              x[F++] = G;
            else {
              var X = 0, Z = 0;
              for (G == 16 ? (Z = 3 + ke(i, g, 3), g += 2, X = x[F - 1]) : G == 17 ? (Z = 3 + ke(i, g, 7), g += 3) : G == 18 && (Z = 11 + ke(i, g, 127), g += 7); Z--; )
                x[F++] = X;
            }
          }
          var de = x.subarray(0, ie), ee = x.subarray(ie);
          j = ar(de), ce = ar(ee), M = Ue(de, j, 1), q = Ue(ee, ce, 1);
        } else
          Oe(1);
      else {
        var G = Zr(g) + 4, se = i[G - 4] | i[G - 3] << 8, ne = G + se;
        if (ne > r) {
          l && Oe(0);
          break;
        }
        c && u(b + se), t.set(i.subarray(G, ne), b), e.b = b += se, e.p = g = ne * 8, e.f = f;
        continue;
      }
      if (g > xe) {
        l && Oe(0);
        break;
      }
    }
    c && u(b + 131072);
    for (var fn = (1 << j) - 1, be = (1 << ce) - 1, ze = g; ; ze = g) {
      var X = M[or(i, g) & fn], me = X >> 4;
      if (g += X & 15, g > xe) {
        l && Oe(0);
        break;
      }
      if (X || Oe(2), me < 256)
        t[b++] = me;
      else if (me == 256) {
        ze = g, M = null;
        break;
      } else {
        var ge = me - 254;
        if (me > 264) {
          var F = me - 257, K = Xn[F];
          ge = ke(i, g, (1 << K) - 1) + Ms[F], g += K;
        }
        var Ne = q[or(i, g) & be], At = Ne >> 4;
        Ne || Oe(3), g += Ne & 15;
        var ee = ia[At];
        if (At > 3) {
          var K = er[At];
          ee += or(i, g) & (1 << K) - 1, g += K;
        }
        if (g > xe) {
          l && Oe(0);
          break;
        }
        c && u(b + 131072);
        var Rt = b + ge;
        if (b < ee) {
          var Kn = s - ee, $n = Math.min(ee, Rt);
          for (Kn + b < 0 && Oe(3); b < $n; ++b)
            t[b] = n[Kn + b];
        }
        for (; b < Rt; ++b)
          t[b] = t[b - ee];
      }
    }
    e.l = M, e.p = ze, e.b = b, e.f = f, M && (f = 1, e.m = j, e.d = q, e.n = ce);
  } while (!f);
  return b != t.length && a ? Ds(t, 0, b) : t.subarray(0, b);
}, Fe = function(i, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  i[n] |= t, i[n + 1] |= t >> 8;
}, pn = function(i, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  i[n] |= t, i[n + 1] |= t >> 8, i[n + 2] |= t >> 16;
}, cr = function(i, e) {
  for (var t = [], n = 0; n < i.length; ++n)
    i[n] && t.push({ s: n, f: i[n] });
  var r = t.length, s = t.slice();
  if (!r)
    return { t: js, l: 0 };
  if (r == 1) {
    var a = new te(t[0].s + 1);
    return a[t[0].s] = 1, { t: a, l: 1 };
  }
  t.sort(function(ne, ie) {
    return ne.f - ie.f;
  }), t.push({ s: -1, f: 25001 });
  var c = t[0], l = t[1], u = 0, f = 1, g = 2;
  for (t[0] = { s: -1, f: c.f + l.f, l: c, r: l }; f != r - 1; )
    c = t[t[u].f < t[g].f ? u++ : g++], l = t[u != f && t[u].f < t[g].f ? u++ : g++], t[f++] = { s: -1, f: c.f + l.f, l: c, r: l };
  for (var b = s[0].s, n = 1; n < r; ++n)
    s[n].s > b && (b = s[n].s);
  var M = new _e(b + 1), q = br(t[f - 1], M, 0);
  if (q > e) {
    var n = 0, j = 0, ce = q - e, xe = 1 << ce;
    for (s.sort(function(ie, Q) {
      return M[Q.s] - M[ie.s] || ie.f - Q.f;
    }); n < r; ++n) {
      var he = s[n].s;
      if (M[he] > e)
        j += xe - (1 << q - M[he]), M[he] = e;
      else
        break;
    }
    for (j >>= ce; j > 0; ) {
      var G = s[n].s;
      M[G] < e ? j -= 1 << e - M[G]++ - 1 : ++n;
    }
    for (; n >= 0 && j; --n) {
      var se = s[n].s;
      M[se] == e && (--M[se], ++j);
    }
    q = e;
  }
  return { t: new te(M), l: q };
}, br = function(i, e, t) {
  return i.s == -1 ? Math.max(br(i.l, e, t + 1), br(i.r, e, t + 1)) : e[i.s] = t;
}, ds = function(i) {
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
}, vn = function(i, e) {
  for (var t = 0, n = 0; n < e.length; ++n)
    t += i[n] * e[n];
  return t;
}, Bs = function(i, e, t) {
  var n = t.length, r = Zr(e + 2);
  i[r] = n & 255, i[r + 1] = n >> 8, i[r + 2] = i[r] ^ 255, i[r + 3] = i[r + 1] ^ 255;
  for (var s = 0; s < n; ++s)
    i[r + s + 4] = t[s];
  return (r + 4 + n) * 8;
}, us = function(i, e, t, n, r, s, a, c, l, u, f) {
  Fe(e, f++, t), ++r[256];
  for (var g = cr(r, 15), b = g.t, M = g.l, q = cr(s, 15), j = q.t, ce = q.l, xe = ds(b), he = xe.c, G = xe.n, se = ds(j), ne = se.c, ie = se.n, Q = new _e(19), A = 0; A < he.length; ++A)
    ++Q[he[A] & 31];
  for (var A = 0; A < ne.length; ++A)
    ++Q[ne[A] & 31];
  for (var x = cr(Q, 7), Y = x.t, F = x.l, re = 19; re > 4 && !Y[vr[re - 1]]; --re)
    ;
  var tt = u + 5 << 3, fe = vn(r, yt) + vn(s, An) + a, le = vn(r, b) + vn(s, j) + a + 14 + 3 * re + vn(Q, Y) + 2 * Q[16] + 3 * Q[17] + 7 * Q[18];
  if (l >= 0 && tt <= fe && tt <= le)
    return Bs(e, f, i.subarray(l, l + u));
  var X, Z, de, ee;
  if (Fe(e, f, 1 + (le < fe)), f += 2, le < fe) {
    X = Ue(b, M, 0), Z = b, de = Ue(j, ce, 0), ee = j;
    var fn = Ue(Y, F, 0);
    Fe(e, f, G - 257), Fe(e, f + 5, ie - 1), Fe(e, f + 10, re - 4), f += 14;
    for (var A = 0; A < re; ++A)
      Fe(e, f + 3 * A, Y[vr[A]]);
    f += 3 * re;
    for (var be = [he, ne], ze = 0; ze < 2; ++ze)
      for (var me = be[ze], A = 0; A < me.length; ++A) {
        var ge = me[A] & 31;
        Fe(e, f, fn[ge]), f += Y[ge], ge > 15 && (Fe(e, f, me[A] >> 5 & 127), f += me[A] >> 12);
      }
  } else
    X = aa, Z = yt, de = ca, ee = An;
  for (var A = 0; A < c; ++A) {
    var K = n[A];
    if (K > 255) {
      var ge = K >> 18 & 31;
      pn(e, f, X[ge + 257]), f += Z[ge + 257], ge > 7 && (Fe(e, f, K >> 23 & 31), f += Xn[ge]);
      var Ne = K & 31;
      pn(e, f, de[Ne]), f += ee[Ne], Ne > 3 && (pn(e, f, K >> 5 & 8191), f += er[Ne]);
    } else
      pn(e, f, X[K]), f += Z[K];
  }
  return pn(e, f, X[256]), f + Z[256];
}, ha = /* @__PURE__ */ new jr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), js = /* @__PURE__ */ new te(0), fa = function(i, e, t, n, r, s) {
  var a = s.z || i.length, c = new te(n + a + 5 * (1 + Math.ceil(a / 7e3)) + r), l = c.subarray(n, c.length - r), u = s.l, f = (s.r || 0) & 7;
  if (e) {
    f && (l[0] = s.r >> 3);
    for (var g = ha[e - 1], b = g >> 13, M = g & 8191, q = (1 << t) - 1, j = s.p || new _e(32768), ce = s.h || new _e(q + 1), xe = Math.ceil(t / 3), he = 2 * xe, G = function(tr) {
      return (i[tr] ^ i[tr + 1] << xe ^ i[tr + 2] << he) & q;
    }, se = new jr(25e3), ne = new _e(288), ie = new _e(32), Q = 0, A = 0, x = s.i || 0, Y = 0, F = s.w || 0, re = 0; x + 2 < a; ++x) {
      var tt = G(x), fe = x & 32767, le = ce[tt];
      if (j[fe] = le, ce[tt] = fe, F <= x) {
        var X = a - x;
        if ((Q > 7e3 || Y > 24576) && (X > 423 || !u)) {
          f = us(i, l, 0, se, ne, ie, A, Y, re, x - re, f), Y = Q = A = 0, re = x;
          for (var Z = 0; Z < 286; ++Z)
            ne[Z] = 0;
          for (var Z = 0; Z < 30; ++Z)
            ie[Z] = 0;
        }
        var de = 2, ee = 0, fn = M, be = fe - le & 32767;
        if (X > 2 && tt == G(x - be))
          for (var ze = Math.min(b, X) - 1, me = Math.min(32767, x), ge = Math.min(258, X); be <= me && --fn && fe != le; ) {
            if (i[x + de] == i[x + de - be]) {
              for (var K = 0; K < ge && i[x + K] == i[x + K - be]; ++K)
                ;
              if (K > de) {
                if (de = K, ee = be, K > ze)
                  break;
                for (var Ne = Math.min(be, K - 2), At = 0, Z = 0; Z < Ne; ++Z) {
                  var Rt = x - be + Z & 32767, Kn = j[Rt], $n = Rt - Kn & 32767;
                  $n > At && (At = $n, le = Rt);
                }
              }
            }
            fe = le, le = j[fe], be += fe - le & 32767;
          }
        if (ee) {
          se[Y++] = 268435456 | _r[de] << 18 | ls[ee];
          var mn = _r[de] & 31, gn = ls[ee] & 31;
          A += Xn[mn] + er[gn], ++ne[257 + mn], ++ie[gn], F = x + de, ++Q;
        } else
          se[Y++] = i[x], ++ne[i[x]];
      }
    }
    for (x = Math.max(x, F); x < a; ++x)
      se[Y++] = i[x], ++ne[i[x]];
    f = us(i, l, u, se, ne, ie, A, Y, re, x - re, f), u || (s.r = f & 7 | l[f / 8 | 0] << 3, f -= 7, s.h = ce, s.p = j, s.i = x, s.w = F);
  } else {
    for (var x = s.w || 0; x < a + u; x += 65535) {
      var Nt = x + 65535;
      Nt >= a && (l[f / 8 | 0] = u, Nt = a), f = Bs(l, f + 1, i.subarray(x, Nt));
    }
    s.i = a;
  }
  return Ds(c, 0, n + Zr(f) + r);
}, ma = /* @__PURE__ */ (function() {
  for (var i = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, n = 9; --n; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    i[e] = t;
  }
  return i;
})(), ga = function() {
  var i = -1;
  return {
    p: function(e) {
      for (var t = i, n = 0; n < e.length; ++n)
        t = ma[t & 255 ^ e[n]] ^ t >>> 8;
      i = t;
    },
    d: function() {
      return ~i;
    }
  };
}, ya = function(i, e, t, n, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var s = e.dictionary.subarray(-32768), a = new te(s.length + i.length);
    a.set(s), a.set(i, s.length), i = a, r.w = s.length;
  }
  return fa(i, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(i.length))) * 1.5) : 20 : 12 + e.mem, t, n, r);
}, Sr = function(i, e, t) {
  for (; t; ++e)
    i[e] = t, t >>>= 8;
}, pa = function(i, e) {
  var t = e.filename;
  if (i[0] = 31, i[1] = 139, i[2] = 8, i[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, i[9] = 3, e.mtime != 0 && Sr(i, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    i[3] = 8;
    for (var n = 0; n <= t.length; ++n)
      i[n + 10] = t.charCodeAt(n);
  }
}, va = function(i) {
  (i[0] != 31 || i[1] != 139 || i[2] != 8) && Oe(6, "invalid gzip data");
  var e = i[3], t = 10;
  e & 4 && (t += (i[10] | i[11] << 8) + 2);
  for (var n = (e >> 3 & 1) + (e >> 4 & 1); n > 0; n -= !i[t++])
    ;
  return t + (e & 2);
}, _a = function(i) {
  var e = i.length;
  return (i[e - 4] | i[e - 3] << 8 | i[e - 2] << 16 | i[e - 1] << 24) >>> 0;
}, wa = function(i) {
  return 10 + (i.filename ? i.filename.length + 1 : 0);
};
function hs(i, e) {
  e || (e = {});
  var t = ga(), n = i.length;
  t.p(i);
  var r = ya(i, e, wa(e), 8), s = r.length;
  return pa(r, e), Sr(r, s - 8, t.d()), Sr(r, s - 4, n), r;
}
function fs(i, e) {
  var t = va(i);
  return t + 8 > i.length && Oe(6, "invalid gzip data"), ua(i.subarray(t, -8), { i: 2 }, new te(_a(i)), e);
}
var ba = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Sa = 0;
try {
  ba.decode(js, { stream: !0 }), Sa = 1;
} catch {
}
const Zs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Kt(i, e, t) {
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
      return e.slice(0, a) + Kt(i.slice(a), e.slice(a), t);
  }
  const r = i ? t.indexOf(i[0]) : 0, s = e != null ? t.indexOf(e[0]) : t.length;
  if (s - r > 1) {
    const a = Math.round(0.5 * (r + s));
    return t[a];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Kt(i.slice(1), null, t);
}
function Ks(i) {
  if (i.length !== $s(i[0]))
    throw new Error("invalid integer part of order key: " + i);
}
function $s(i) {
  if (i >= "a" && i <= "z")
    return i.charCodeAt(0) - 97 + 2;
  if (i >= "A" && i <= "Z")
    return 90 - i.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + i);
}
function bn(i) {
  const e = $s(i[0]);
  if (e > i.length)
    throw new Error("invalid order key: " + i);
  return i.slice(0, e);
}
function ms(i, e) {
  if (i === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + i);
  const t = bn(i);
  if (i.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + i);
}
function gs(i, e) {
  Ks(i);
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
function Ia(i, e) {
  Ks(i);
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
function We(i, e, t = Zs) {
  if (i != null && ms(i, t), e != null && ms(e, t), i != null && e != null && i >= e)
    throw new Error(i + " >= " + e);
  if (i == null) {
    if (e == null)
      return "a" + t[0];
    const l = bn(e), u = e.slice(l.length);
    if (l === "A" + t[0].repeat(26))
      return l + Kt("", u, t);
    if (l < e)
      return l;
    const f = Ia(l, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const l = bn(i), u = i.slice(l.length), f = gs(l, t);
    return f ?? l + Kt(u, null, t);
  }
  const n = bn(i), r = i.slice(n.length), s = bn(e), a = e.slice(s.length);
  if (n === s)
    return n + Kt(r, a, t);
  const c = gs(n, t);
  if (c == null)
    throw new Error("cannot increment any more");
  return c < e ? c : n + Kt(r, null, t);
}
function Ir(i, e, t, n = Zs) {
  if (t === 0)
    return [];
  if (t === 1)
    return [We(i, e, n)];
  {
    let r = We(i, e, n);
    const s = [r];
    for (let a = 0; a < t - 1; a++)
      r = We(r, e, n), s.push(r);
    return s;
  }
}
const xa = Ls().int().nonnegative().optional();
function _n(i) {
  var t;
  const e = xa.safeParse(i);
  if (!e.success)
    throw new P("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function Us(i, e, t, n) {
  const r = i.Id, s = n.setContainer(r, new R());
  s.set("Kind", i.Kind), s.set("outerItemId", e), s.set("OrderKey", t);
  const a = s.setContainer("Label", new H());
  i.Label && a.insert(0, i.Label);
  const c = s.setContainer("Info", new R());
  for (const [l, u] of Object.entries(i.Info ?? {}))
    c.set(l, u);
  if (i.Kind === "item") {
    const l = i, u = l.Type === Mt ? "" : l.Type ?? "";
    switch (s.set("MIMEType", u), !0) {
      case (l.ValueKind === "literal" && l.Value !== void 0): {
        s.set("ValueKind", "literal");
        const g = s.setContainer("literalValue", new H());
        l.Value.length > 0 && g.insert(0, l.Value);
        break;
      }
      case (l.ValueKind === "binary" && l.Value !== void 0): {
        s.set("ValueKind", "binary"), s.set("binaryValue", Ts(l.Value));
        break;
      }
      default:
        s.set("ValueKind", l.ValueKind ?? "none");
    }
    const f = Ir(null, null, (l.innerEntries ?? []).length);
    (l.innerEntries ?? []).forEach((g, b) => {
      Us(g, r, f[b], n);
    });
  } else {
    const l = i;
    s.set("TargetId", l.TargetId ?? "");
  }
}
var Me, ue, Rn, Ut, qe, wt, ve, at, ot, Pe, De, Qn, zt, ct, bt, h, O, Dt, Sn, st, Fn, xr, zs, Fs, pe, pt, Bt, In, jt, xn, Zt, Hs, kr, Ws, Tr, Or, T, Js, Cr, Er, qs;
const _t = class _t extends _i {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(t, n) {
    var s;
    super();
    y(this, h);
    /**** private state ****/
    y(this, Me);
    y(this, ue);
    y(this, Rn);
    y(this, Ut);
    y(this, qe, null);
    y(this, wt, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    y(this, ve, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId
    y(this, at, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    y(this, ot, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId
    y(this, Pe, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    y(this, De, /* @__PURE__ */ new Map());
    y(this, Qn, yi);
    // transaction nesting
    y(this, zt, 0);
    // ChangeSet accumulator inside a transaction
    y(this, ct, {});
    // suppress index updates / change tracking when applying remote patches
    y(this, bt, !1);
    w(this, Me, t), w(this, ue, t.getMap("Entries")), w(this, Rn, (n == null ? void 0 : n.LiteralSizeLimit) ?? mi), w(this, Ut, (n == null ? void 0 : n.TrashTTLms) ?? 2592e6), d(this, h, zs).call(this);
    const r = (n == null ? void 0 : n.TrashCheckIntervalMs) ?? Math.min(Math.floor(o(this, Ut) / 4), 36e5);
    w(this, qe, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      r
    )), typeof ((s = o(this, qe)) == null ? void 0 : s.unref) == "function" && o(this, qe).unref();
  }
  /**** fromScratch — create a new store with root, trash, and lost-and-found items ****/
  static fromScratch(t) {
    const n = new rr(), r = n.getMap("Entries"), s = r.setContainer(ae, new R());
    s.set("Kind", "item"), s.set("outerItemId", ""), s.set("OrderKey", ""), s.setContainer("Label", new H()), s.setContainer("Info", new R()), s.set("MIMEType", ""), s.set("ValueKind", "none");
    const a = r.setContainer($, new R());
    a.set("Kind", "item"), a.set("outerItemId", ae), a.set("OrderKey", "a0"), a.setContainer("Label", new H()).insert(0, "trash"), a.setContainer("Info", new R()), a.set("MIMEType", ""), a.set("ValueKind", "none");
    const l = r.setContainer(ye, new R());
    return l.set("Kind", "item"), l.set("outerItemId", ae), l.set("OrderKey", "a1"), l.setContainer("Label", new H()).insert(0, "lost-and-found"), l.setContainer("Info", new R()), l.set("MIMEType", ""), l.set("ValueKind", "none"), n.commit(), new _t(n, t);
  }
  /**** fromBinary — restore store from gzip-compressed binary data ****/
  static fromBinary(t, n) {
    const r = new rr();
    return r.import(fs(t)), new _t(r, n);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, n) {
    const r = typeof t == "string" ? JSON.parse(t) : t, s = new rr(), a = s.getMap("Entries");
    return s.commit(), Us(r, "", "", a), s.commit(), new _t(s, n);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — well-known data accessors ****/
  get RootItem() {
    return d(this, h, st).call(this, ae);
  }
  get TrashItem() {
    return d(this, h, st).call(this, $);
  }
  get LostAndFoundItem() {
    return d(this, h, st).call(this, ye);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve an entry by Id ****/
  EntryWithId(t) {
    if (d(this, h, O).call(this, t) != null)
      return d(this, h, Sn).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, n, r) {
    if (n == null) throw new P("invalid-argument", "outerItem must not be missing");
    const s = t ?? Mt;
    pr(s), _n(r), d(this, h, Dt).call(this, n.Id);
    const a = crypto.randomUUID(), c = d(this, h, jt).call(this, n.Id, r), l = s === Mt ? "" : s;
    return this.transact(() => {
      const u = o(this, ue).setContainer(a, new R());
      u.set("Kind", "item"), u.set("outerItemId", n.Id), u.set("OrderKey", c), u.setContainer("Label", new H()), u.setContainer("Info", new R()), u.set("MIMEType", l), u.set("ValueKind", "none"), d(this, h, pe).call(this, n.Id, a), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, a, "outerItem");
    }), d(this, h, st).call(this, a);
  }
  /**** newLinkAt — create a new link within an outer data ****/
  newLinkAt(t, n, r) {
    if (t == null) throw new P("invalid-argument", "Target must not be missing");
    if (n == null) throw new P("invalid-argument", "outerItem must not be missing");
    _n(r), d(this, h, Dt).call(this, t.Id), d(this, h, Dt).call(this, n.Id);
    const s = crypto.randomUUID(), a = d(this, h, jt).call(this, n.Id, r);
    return this.transact(() => {
      const c = o(this, ue).setContainer(s, new R());
      c.set("Kind", "link"), c.set("outerItemId", n.Id), c.set("OrderKey", a), c.setContainer("Label", new H()), c.setContainer("Info", new R()), c.set("TargetId", t.Id), d(this, h, pe).call(this, n.Id, s), d(this, h, Bt).call(this, t.Id, s), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, s, "outerItem");
    }), d(this, h, Fn).call(this, s);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, n, r) {
    if (n == null) throw new P("invalid-argument", "outerItem must not be missing");
    _n(r), d(this, h, Dt).call(this, n.Id);
    const s = t;
    if (s == null || s.Kind !== "item")
      throw new P("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const a = /* @__PURE__ */ new Map();
    d(this, h, Cr).call(this, s, a);
    const c = d(this, h, jt).call(this, n.Id, r), l = a.get(s.Id);
    return this.transact(() => {
      d(this, h, Er).call(this, s, n.Id, c, a), d(this, h, T).call(this, n.Id, "innerEntryList");
    }), d(this, h, st).call(this, l);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, n, r) {
    if (n == null) throw new P("invalid-argument", "outerItem must not be missing");
    _n(r), d(this, h, Dt).call(this, n.Id);
    const s = t;
    if (s == null || s.Kind !== "link")
      throw new P("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const a = crypto.randomUUID(), c = d(this, h, jt).call(this, n.Id, r);
    return this.transact(() => {
      const l = o(this, ue).setContainer(a, new R());
      l.set("Kind", "link"), l.set("outerItemId", n.Id), l.set("OrderKey", c);
      const u = l.setContainer("Label", new H());
      s.Label && u.insert(0, s.Label);
      const f = l.setContainer("Info", new R());
      for (const [g, b] of Object.entries(s.Info ?? {}))
        f.set(g, b);
      l.set("TargetId", s.TargetId ?? ""), d(this, h, pe).call(this, n.Id, a), s.TargetId && d(this, h, Bt).call(this, s.TargetId, a), d(this, h, T).call(this, n.Id, "innerEntryList");
    }), d(this, h, Fn).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  /**** moveEntryTo — move an entry to a different outer data ****/
  moveEntryTo(t, n, r) {
    if (_n(r), !this._mayMoveEntryTo(t.Id, n.Id, r))
      throw new P(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const s = this._outerItemIdOf(t.Id), a = d(this, h, jt).call(this, n.Id, r);
    this.transact(() => {
      const c = d(this, h, O).call(this, t.Id);
      if (c.set("outerItemId", n.Id), c.set("OrderKey", a), s === $ && n.Id !== $) {
        const l = c.get("Info");
        l instanceof R && l.get("_trashedAt") != null && (l.delete("_trashedAt"), d(this, h, T).call(this, t.Id, "Info._trashedAt"));
      }
      s != null && (d(this, h, pt).call(this, s, t.Id), d(this, h, T).call(this, s, "innerEntryList")), d(this, h, pe).call(this, n.Id, t.Id), d(this, h, T).call(this, n.Id, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const n = d(this, h, Zt).call(this, t);
    if (n.length === 0)
      return;
    const r = Ir(null, null, n.length);
    n.forEach((s, a) => {
      const c = d(this, h, O).call(this, s.Id);
      c != null && (c.set("OrderKey", r[a]), d(this, h, T).call(this, s.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new P("delete-not-permitted", "this entry cannot be deleted");
    const n = this._outerItemIdOf(t.Id), r = We(d(this, h, xn).call(this, $), null);
    this.transact(() => {
      const s = d(this, h, O).call(this, t.Id);
      s.set("outerItemId", $), s.set("OrderKey", r);
      let a = s.get("Info");
      a instanceof R || (a = s.setContainer("Info", new R())), a.set("_trashedAt", Date.now()), n != null && (d(this, h, pt).call(this, n, t.Id), d(this, h, T).call(this, n, "innerEntryList")), d(this, h, pe).call(this, $, t.Id), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, t.Id, "outerItem"), d(this, h, T).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete a trash entry ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== $)
      throw new P(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, h, Hs).call(this, t.Id))
      throw new P(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, h, Or).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    const n = t ?? o(this, Ut);
    if (n == null)
      return 0;
    const r = Date.now(), s = Array.from(o(this, ve).get($) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const c of s) {
      const l = d(this, h, O).call(this, c);
      if (l == null || l.get("outerItemId") !== $)
        continue;
      const u = l.get("Info"), f = u instanceof R ? u.get("_trashedAt") : void 0;
      if (typeof f == "number" && !(r - f < n))
        try {
          this.purgeEntry(d(this, h, Sn).call(this, c)), a++;
        } catch {
        }
    }
    return a;
  }
  /**** dispose — stop background timer and remove all change listeners ****/
  dispose() {
    o(this, qe) != null && (clearInterval(o(this, qe)), w(this, qe, null)), o(this, wt).clear();
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute operations within a batch transaction ****/
  transact(t) {
    Un(this, zt)._++;
    try {
      t();
    } finally {
      if (Un(this, zt)._--, o(this, zt) === 0) {
        o(this, bt) || o(this, Me).commit();
        const n = { ...o(this, ct) };
        w(this, ct, {});
        const r = o(this, bt) ? "external" : "internal";
        d(this, h, Js).call(this, r, n);
      }
    }
  }
  /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
  onChangeInvoke(t) {
    return o(this, wt).add(t), () => {
      o(this, wt).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — merge remote changes and rebuild indices ****/
  applyRemotePatch(t) {
    if (t.byteLength !== 0) {
      w(this, bt, !0);
      try {
        o(this, Me).import(t), this.transact(() => {
          d(this, h, Fs).call(this);
        });
      } finally {
        w(this, bt, !1);
      }
      this.recoverOrphans();
    }
  }
  /**** currentCursor — get current version vector as sync cursor ****/
  get currentCursor() {
    return o(this, Me).version().encode();
  }
  /**** exportPatch — generate a change patch since a given cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? o(this, Me).export({ mode: "snapshot" }) : o(this, Me).export({ mode: "update", from: fi.decode(t) });
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = o(this, ue).toJSON(), n = new Set(
      Object.entries(t).filter(([r, s]) => r === ae || s.outerItemId !== "").map(([r]) => r)
    );
    this.transact(() => {
      const r = o(this, ue).toJSON();
      for (const [s, a] of Object.entries(r)) {
        if (s === ae)
          continue;
        const c = a.outerItemId;
        if (c && !n.has(c)) {
          const l = We(d(this, h, xn).call(this, ye), null), u = d(this, h, O).call(this, s);
          u.set("outerItemId", ye), u.set("OrderKey", l), d(this, h, pe).call(this, ye, s), d(this, h, T).call(this, s, "outerItem"), d(this, h, T).call(this, ye, "innerEntryList");
        }
        if (a.Kind === "link") {
          const l = a.TargetId;
          if (l && !n.has(l)) {
            const u = We(d(this, h, xn).call(this, ye), null), f = o(this, ue).setContainer(l, new R());
            f.set("Kind", "item"), f.set("outerItemId", ye), f.set("OrderKey", u), f.setContainer("Label", new H()), f.setContainer("Info", new R()), f.set("MIMEType", ""), f.set("ValueKind", "none"), d(this, h, pe).call(this, ye, l), n.add(l), d(this, h, T).call(this, ye, "innerEntryList");
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
    return hs(o(this, Me).export({ mode: "snapshot" }));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, n, r) {
    const s = new TextDecoder().decode(fs(t));
    return this.newEntryFromJSONat(JSON.parse(s), n, r);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const n = JSON.stringify(this._EntryAsJSON(t));
    return hs(new TextEncoder().encode(n));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (data or link) ****/
  _KindOf(t) {
    const n = d(this, h, O).call(this, t);
    if (n == null)
      throw new P("not-found", `entry '${t}' not found`);
    return n.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const n = d(this, h, O).call(this, t);
    if (n == null)
      return "";
    const r = n.get("Label");
    return r instanceof H ? r.toString() : String(r ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, n) {
    As(n), this.transact(() => {
      const r = d(this, h, O).call(this, t);
      if (r == null)
        return;
      let s = r.get("Label");
      if (s instanceof H) {
        const a = s.toString().length;
        a > 0 && s.delete(0, a), n.length > 0 && s.insert(0, n);
      } else
        s = r.setContainer("Label", new H()), n.length > 0 && s.insert(0, n);
      d(this, h, T).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const n = d(this, h, O).call(this, t), r = (n == null ? void 0 : n.get("MIMEType")) ?? "";
    return r === "" ? Mt : r;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, n) {
    pr(n);
    const r = n === Mt ? "" : n;
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
        return s instanceof H ? s.toString() : String(s ?? "");
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
          case (typeof n == "string" && n.length <= o(this, Rn)): {
            r.set("ValueKind", "literal");
            let s = r.get("literalValue");
            if (s instanceof H) {
              const a = s.toString().length;
              a > 0 && s.delete(0, a), n.length > 0 && s.insert(0, n);
            } else
              s = r.setContainer("literalValue", new H()), n.length > 0 && s.insert(0, n);
            break;
          }
          case typeof n == "string": {
            const a = new TextEncoder().encode(n), c = _t._BLOBhash(a);
            this._storeValueBlob(c, a), r.set("ValueKind", "literal-reference"), r.set("ValueRef", JSON.stringify({ Hash: c, Size: a.byteLength }));
            break;
          }
          case n.byteLength <= gi: {
            r.set("ValueKind", "binary"), r.set("binaryValue", n);
            break;
          }
          default: {
            const s = n, a = _t._BLOBhash(s);
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
      throw new P(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const a = d(this, h, O).call(this, t), c = a == null ? void 0 : a.get("literalValue");
      if (c instanceof H) {
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
        return c instanceof R ? c.get(s) : void 0;
      },
      set(r, s, a) {
        return typeof s != "string" ? !1 : a === void 0 ? (n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t), l = c == null ? void 0 : c.get("Info");
          if (l instanceof R) {
            const g = l.get(s) !== void 0;
            l.delete(s), g && d(f = n, h, T).call(f, t, `Info.${s}`);
          }
        }), !0) : (ta(s), na(a), n.transact(() => {
          var u, f;
          const c = d(u = n, h, O).call(u, t);
          if (c == null)
            return;
          let l = c.get("Info");
          l instanceof R || (l = c.setContainer("Info", new R())), l.set(s, a), d(f = n, h, T).call(f, t, `Info.${s}`);
        }), !0);
      },
      deleteProperty(r, s) {
        return typeof s != "string" ? !1 : (n.transact(() => {
          var l, u;
          const a = d(l = n, h, O).call(l, t), c = a == null ? void 0 : a.get("Info");
          if (c instanceof R) {
            const f = c.get(s) !== void 0;
            c.delete(s), f && d(u = n, h, T).call(u, t, `Info.${s}`);
          }
        }), !0);
      },
      ownKeys() {
        var a;
        const r = d(a = n, h, O).call(a, t), s = r == null ? void 0 : r.get("Info");
        return s instanceof R ? Object.keys(s.toJSON()) : [];
      },
      getOwnPropertyDescriptor(r, s) {
        var u;
        if (typeof s != "string")
          return;
        const a = d(u = n, h, O).call(u, t), c = a == null ? void 0 : a.get("Info");
        if (!(c instanceof R))
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
    const n = this, r = d(this, h, Zt).call(this, t);
    return new Proxy([], {
      get(s, a) {
        var c;
        if (a === "length")
          return r.length;
        if (a === Symbol.iterator)
          return function* () {
            var l;
            for (let u = 0; u < r.length; u++)
              yield d(l = n, h, Sn).call(l, r[u].Id);
          };
        if (typeof a == "string" && !isNaN(Number(a))) {
          const l = Number(a);
          return l >= 0 && l < r.length ? d(c = n, h, Sn).call(c, r[l].Id) : void 0;
        }
        return s[a];
      }
    });
  }
  /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
  _mayMoveEntryTo(t, n, r) {
    return t === ae || t === n ? !1 : t === $ || t === ye ? n === ae : !d(this, h, qs).call(this, n, t);
  }
  /**** _mayDeleteEntry — check if entry is deletable ****/
  _mayDeleteEntry(t) {
    return t !== ae && t !== $ && t !== ye;
  }
  /**** _TargetOf — get the target data for a link ****/
  _TargetOf(t) {
    const n = d(this, h, O).call(this, t), r = n == null ? void 0 : n.get("TargetId");
    if (r == null || r === "")
      throw new P("not-found", `link '${t}' has no target`);
    return d(this, h, st).call(this, r);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const n = this._ValueKindOf(t);
    switch (!0) {
      case n === "literal": {
        const r = d(this, h, O).call(this, t), s = r == null ? void 0 : r.get("literalValue");
        return s instanceof H ? s.toString() : String(s ?? "");
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
Me = new WeakMap(), ue = new WeakMap(), Rn = new WeakMap(), Ut = new WeakMap(), qe = new WeakMap(), wt = new WeakMap(), ve = new WeakMap(), at = new WeakMap(), ot = new WeakMap(), Pe = new WeakMap(), De = new WeakMap(), Qn = new WeakMap(), zt = new WeakMap(), ct = new WeakMap(), bt = new WeakMap(), h = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry Id ****/
O = function(t) {
  const n = o(this, ue).get(t);
  if (n instanceof R && !(n.get("outerItemId") === "" && t !== ae))
    return n;
}, /**** #requireItemExists — throw if data does not exist ****/
Dt = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null || n.get("Kind") !== "item")
    throw new P("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped / #wrappedItem / #wrappedLink — return cached wrapper objects ****/
Sn = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null)
    throw new P("invalid-argument", `entry '${t}' not found`);
  return n.get("Kind") === "item" ? d(this, h, st).call(this, t) : d(this, h, Fn).call(this, t);
}, st = function(t) {
  const n = o(this, De).get(t);
  if (n instanceof os)
    return n;
  const r = new os(this, t);
  return d(this, h, xr).call(this, t, r), r;
}, Fn = function(t) {
  const n = o(this, De).get(t);
  if (n instanceof cs)
    return n;
  const r = new cs(this, t);
  return d(this, h, xr).call(this, t, r), r;
}, /**** #CacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/
xr = function(t, n) {
  if (o(this, De).size >= o(this, Qn)) {
    const r = o(this, De).keys().next().value;
    r != null && o(this, De).delete(r);
  }
  o(this, De).set(t, n);
}, /**** #rebuildIndices — full rebuild of all indices from scratch ****/
zs = function() {
  o(this, ve).clear(), o(this, at).clear(), o(this, ot).clear(), o(this, Pe).clear();
  const t = o(this, ue).toJSON();
  for (const [n, r] of Object.entries(t)) {
    const s = r.outerItemId;
    if (s && d(this, h, pe).call(this, s, n), r.Kind === "link") {
      const a = r.TargetId;
      a && d(this, h, Bt).call(this, a, n);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Fs = function() {
  const t = o(this, ue).toJSON(), n = /* @__PURE__ */ new Set();
  for (const [a, c] of Object.entries(t)) {
    n.add(a);
    const l = c.outerItemId || void 0, u = o(this, at).get(a);
    switch (l !== u && (u != null && (d(this, h, pt).call(this, u, a), d(this, h, T).call(this, u, "innerEntryList")), l != null && (d(this, h, pe).call(this, l, a), d(this, h, T).call(this, l, "innerEntryList")), d(this, h, T).call(this, a, "outerItem")), !0) {
      case c.Kind === "link": {
        const f = c.TargetId, g = o(this, Pe).get(a);
        f !== g && (g != null && d(this, h, In).call(this, g, a), f != null && d(this, h, Bt).call(this, f, a));
        break;
      }
      case o(this, Pe).has(a):
        d(this, h, In).call(this, o(this, Pe).get(a), a);
        break;
    }
    d(this, h, T).call(this, a, "Label");
  }
  const r = Array.from(o(this, at).entries()).filter(([a]) => !n.has(a));
  for (const [a, c] of r)
    d(this, h, pt).call(this, c, a), d(this, h, T).call(this, c, "innerEntryList");
  const s = Array.from(o(this, Pe).entries()).filter(([a]) => !n.has(a));
  for (const [a, c] of s)
    d(this, h, In).call(this, c, a);
}, /**** #addToReverseIndex — add entry to reverse and forward indices ****/
pe = function(t, n) {
  let r = o(this, ve).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), o(this, ve).set(t, r)), r.add(n), o(this, at).set(n, t);
}, /**** #removeFromReverseIndex — remove entry from indices ****/
pt = function(t, n) {
  var r;
  (r = o(this, ve).get(t)) == null || r.delete(n), o(this, at).delete(n);
}, /**** #addToLinkTargetIndex — add link to target and forward indices ****/
Bt = function(t, n) {
  let r = o(this, ot).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), o(this, ot).set(t, r)), r.add(n), o(this, Pe).set(n, t);
}, /**** #removeFromLinkTargetIndex — remove link from indices ****/
In = function(t, n) {
  var r;
  (r = o(this, ot).get(t)) == null || r.delete(n), o(this, Pe).delete(n);
}, /**** #OrderKeyAt — generate fractional order key for insertion position ****/
jt = function(t, n) {
  const r = (c) => {
    if (c.length === 0 || n == null) {
      const u = c.length > 0 ? c[c.length - 1].OrderKey : null;
      return We(u, null);
    }
    const l = Math.max(0, Math.min(n, c.length));
    return We(
      l > 0 ? c[l - 1].OrderKey : null,
      l < c.length ? c[l].OrderKey : null
    );
  };
  let s = d(this, h, Zt).call(this, t);
  const a = r(s);
  return a.length <= pi ? a : (this._rebalanceInnerEntriesOf(t), r(d(this, h, Zt).call(this, t)));
}, /**** #lastOrderKeyOf — get the last order key for an entry's children ****/
xn = function(t) {
  const n = d(this, h, Zt).call(this, t);
  return n.length > 0 ? n[n.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/
Zt = function(t) {
  const n = o(this, ve).get(t) ?? /* @__PURE__ */ new Set(), r = [];
  for (const s of n) {
    const a = d(this, h, O).call(this, s);
    (a == null ? void 0 : a.get("outerItemId")) === t && r.push({ Id: s, OrderKey: a.get("OrderKey") ?? "" });
  }
  return r.sort((s, a) => s.OrderKey < a.OrderKey ? -1 : s.OrderKey > a.OrderKey ? 1 : s.Id < a.Id ? -1 : s.Id > a.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
Hs = function(t) {
  const n = d(this, h, Tr).call(this), r = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const a of o(this, ve).get($) ?? /* @__PURE__ */ new Set())
      r.has(a) || d(this, h, kr).call(this, a, n, r) && (r.add(a), s = !0);
  }
  return r.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has links from reachable entries ****/
kr = function(t, n, r) {
  const s = [t], a = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const c = s.pop();
    if (a.has(c))
      continue;
    a.add(c);
    const l = o(this, ot).get(c) ?? /* @__PURE__ */ new Set();
    for (const u of l) {
      if (n.has(u))
        return !0;
      const f = d(this, h, Ws).call(this, u);
      if (f != null && r.has(f))
        return !0;
    }
    for (const u of o(this, ve).get(c) ?? /* @__PURE__ */ new Set())
      a.has(u) || s.push(u);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — get direct inner entry of TrashItem containing an entry ****/
Ws = function(t) {
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
}, /**** #reachableFromRoot — compute live-tree entries reachable from root ****/
// TrashItem is included (it is a direct child of Root) but its subtree is
// NOT traversed — entries inside Trash are not considered "live" and must
// not protect other entries from being purged.
Tr = function() {
  const t = /* @__PURE__ */ new Set(), n = [ae];
  for (; n.length > 0; ) {
    const r = n.pop();
    if (!t.has(r) && (t.add(r), r !== $))
      for (const s of o(this, ve).get(r) ?? /* @__PURE__ */ new Set())
        t.has(s) || n.push(s);
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Or = function(t) {
  const n = d(this, h, O).call(this, t);
  if (n == null)
    return;
  const r = n.get("Kind"), s = n.get("outerItemId"), a = d(this, h, Tr).call(this), c = /* @__PURE__ */ new Set(), l = Array.from(o(this, ve).get(t) ?? /* @__PURE__ */ new Set());
  for (const u of l)
    if (d(this, h, kr).call(this, u, a, c)) {
      const f = d(this, h, O).call(this, u), g = We(d(this, h, xn).call(this, $), null);
      f.set("outerItemId", $), f.set("OrderKey", g), d(this, h, pt).call(this, t, u), d(this, h, pe).call(this, $, u), d(this, h, T).call(this, $, "innerEntryList"), d(this, h, T).call(this, u, "outerItem");
    } else
      d(this, h, Or).call(this, u);
  if (d(this, h, T).call(this, t, "Existence"), n.set("outerItemId", ""), n.set("OrderKey", ""), s && (d(this, h, pt).call(this, s, t), d(this, h, T).call(this, s, "innerEntryList")), r === "link") {
    const u = n.get("TargetId");
    u && d(this, h, In).call(this, u, t);
  }
  o(this, De).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
T = function(t, n) {
  o(this, ct)[t] == null && (o(this, ct)[t] = /* @__PURE__ */ new Set()), o(this, ct)[t].add(n);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
Js = function(t, n) {
  if (Object.keys(n).length !== 0)
    for (const r of o(this, wt))
      try {
        r(t, n);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
Cr = function(t, n) {
  if (n.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const r of t.innerEntries ?? [])
      d(this, h, Cr).call(this, r, n);
}, /**** #importEntryFromJSON — recursively create a Loro entry and update indices ****/
Er = function(t, n, r, s) {
  const a = s.get(t.Id), c = o(this, ue).setContainer(a, new R());
  c.set("Kind", t.Kind), c.set("outerItemId", n), c.set("OrderKey", r);
  const l = c.setContainer("Label", new H());
  t.Label && l.insert(0, t.Label);
  const u = c.setContainer("Info", new R());
  for (const [f, g] of Object.entries(t.Info ?? {}))
    u.set(f, g);
  if (t.Kind === "item") {
    const f = t, g = f.Type === Mt ? "" : f.Type ?? "";
    switch (c.set("MIMEType", g), !0) {
      case (f.ValueKind === "literal" && f.Value !== void 0): {
        c.set("ValueKind", "literal");
        const M = c.setContainer("literalValue", new H());
        f.Value.length > 0 && M.insert(0, f.Value);
        break;
      }
      case (f.ValueKind === "binary" && f.Value !== void 0): {
        c.set("ValueKind", "binary"), c.set("binaryValue", Ts(f.Value));
        break;
      }
      default:
        c.set("ValueKind", f.ValueKind ?? "none");
    }
    d(this, h, pe).call(this, n, a);
    const b = Ir(null, null, (f.innerEntries ?? []).length);
    (f.innerEntries ?? []).forEach((M, q) => {
      d(this, h, Er).call(this, M, a, b[q], s);
    });
  } else {
    const f = t, g = s.has(f.TargetId) ? s.get(f.TargetId) : f.TargetId;
    c.set("TargetId", g ?? ""), d(this, h, pe).call(this, n, a), g && d(this, h, Bt).call(this, g, a);
  }
}, /**** #isDescendantOf — check if one entry is a descendant of another ****/
qs = function(t, n) {
  let r = t;
  for (; r != null; ) {
    if (r === n)
      return !0;
    r = this._outerItemIdOf(r);
  }
  return !1;
};
let ys = _t;
const ps = 1, vs = 2, _s = 3, ws = 4, bs = 5, Ss = 6, Ve = 32, zn = 1024 * 1024;
function lr(...i) {
  const e = i.reduce((r, s) => r + s.byteLength, 0), t = new Uint8Array(e);
  let n = 0;
  for (const r of i)
    t.set(r, n), n += r.byteLength;
  return t;
}
function Vt(i, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = i, t.set(e, 1), t;
}
function Is(i) {
  const e = new Uint8Array(i.length / 2);
  for (let t = 0; t < i.length; t += 2)
    e[t / 2] = parseInt(i.slice(t, t + 2), 16);
  return e;
}
function xs(i) {
  return Array.from(i).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var Ge, Qe, Nn, Ft, St, Ht, It, Wt, Jt, qt, Gt, Vn, B, Lr, vt, kn, Gs, Qs, Ys;
class Ea {
  /**** constructor ****/
  constructor(e) {
    y(this, B);
    yn(this, "StoreId");
    y(this, Ge, "disconnected");
    y(this, Qe);
    y(this, Nn, "");
    y(this, Ft);
    y(this, St);
    y(this, Ht, /* @__PURE__ */ new Set());
    y(this, It, /* @__PURE__ */ new Set());
    y(this, Wt, /* @__PURE__ */ new Set());
    y(this, Jt, /* @__PURE__ */ new Set());
    y(this, qt, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    y(this, Gt, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    y(this, Vn, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, Ge);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\//.test(e))
      throw new TypeError(
        `SDS WebSocket: invalid server URL '${e}' — expected ws:// or wss://`
      );
    return w(this, Nn, e), w(this, Ft, t), d(this, B, Lr).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, B, Qs).call(this), d(this, B, kn).call(this, "disconnected"), (e = o(this, Qe)) == null || e.close(), w(this, Qe, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, B, vt).call(this, Vt(ps, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const n = Is(e);
    if (t.byteLength <= zn)
      d(this, B, vt).call(this, Vt(vs, lr(n, t)));
    else {
      const r = Math.ceil(t.byteLength / zn);
      for (let s = 0; s < r; s++) {
        const a = s * zn, c = t.slice(a, a + zn), l = new Uint8Array(Ve + 8);
        l.set(n, 0), new DataView(l.buffer).setUint32(Ve, s, !1), new DataView(l.buffer).setUint32(Ve + 4, r, !1), d(this, B, vt).call(this, Vt(bs, lr(l, c)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, B, vt).call(this, Vt(_s, Is(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Ht).add(e), () => {
      o(this, Ht).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, It).add(e), () => {
      o(this, It).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, Wt).add(e), () => {
      o(this, Wt).delete(e);
    };
  }
  /**** sendSyncRequest ****/
  sendSyncRequest(e) {
    d(this, B, vt).call(this, Vt(Ss, e));
  }
  /**** onSyncRequest ****/
  onSyncRequest(e) {
    return o(this, qt).add(e), () => {
      o(this, qt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, B, vt).call(this, Vt(ws, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, Jt).add(e), () => {
      o(this, Jt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, Vn);
  }
}
Ge = new WeakMap(), Qe = new WeakMap(), Nn = new WeakMap(), Ft = new WeakMap(), St = new WeakMap(), Ht = new WeakMap(), It = new WeakMap(), Wt = new WeakMap(), Jt = new WeakMap(), qt = new WeakMap(), Gt = new WeakMap(), Vn = new WeakMap(), B = new WeakSet(), /**** #doConnect ****/
Lr = function() {
  return new Promise((e, t) => {
    const r = `${o(this, Nn).replace(/\/+$/, "")}/ws/${this.StoreId}?token=${encodeURIComponent(o(this, Ft).Token)}`, s = new WebSocket(r);
    s.binaryType = "arraybuffer", w(this, Qe, s), d(this, B, kn).call(this, "connecting"), s.onopen = () => {
      d(this, B, kn).call(this, "connected"), e();
    }, s.onerror = (a) => {
      o(this, Ge) === "connecting" && t(new Error("WebSocket connection failed"));
    }, s.onclose = () => {
      w(this, Qe, void 0), o(this, Ge) !== "disconnected" && (d(this, B, kn).call(this, "reconnecting"), d(this, B, Gs).call(this));
    }, s.onmessage = (a) => {
      d(this, B, Ys).call(this, new Uint8Array(a.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
vt = function(e) {
  var t;
  ((t = o(this, Qe)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, Qe).send(e);
}, /**** #setState ****/
kn = function(e) {
  if (o(this, Ge) !== e) {
    w(this, Ge, e);
    for (const t of o(this, Wt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Gs = function() {
  var t;
  const e = ((t = o(this, Ft)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  w(this, St, setTimeout(() => {
    o(this, Ge) === "reconnecting" && d(this, B, Lr).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Qs = function() {
  o(this, St) != null && (clearTimeout(o(this, St)), w(this, St, void 0));
}, /**** #handleFrame ****/
Ys = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], n = e.slice(1);
  switch (t) {
    case ps: {
      for (const r of o(this, Ht))
        try {
          r(n);
        } catch {
        }
      break;
    }
    case vs: {
      if (n.byteLength < Ve)
        return;
      const r = xs(n.slice(0, Ve)), s = n.slice(Ve);
      for (const a of o(this, It))
        try {
          a(r, s);
        } catch {
        }
      break;
    }
    case _s:
      break;
    case ws: {
      try {
        const r = JSON.parse(new TextDecoder().decode(n));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), o(this, Vn).set(r.PeerId, r);
        for (const s of o(this, Jt))
          try {
            s(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case Ss: {
      for (const r of o(this, qt))
        try {
          r(n);
        } catch {
        }
      break;
    }
    case bs: {
      if (n.byteLength < Ve + 8)
        return;
      const r = xs(n.slice(0, Ve)), s = new DataView(n.buffer, n.byteOffset + Ve, 8), a = s.getUint32(0, !1), c = s.getUint32(4, !1), l = n.slice(Ve + 8);
      let u = o(this, Gt).get(r);
      if (u == null && (u = { total: c, chunks: /* @__PURE__ */ new Map() }, o(this, Gt).set(r, u)), u.chunks.set(a, l), u.chunks.size === u.total) {
        const f = lr(
          ...Array.from({ length: u.total }, (g, b) => u.chunks.get(b))
        );
        o(this, Gt).delete(r);
        for (const g of o(this, It))
          try {
            g(r, f);
          } catch {
          }
      }
      break;
    }
  }
};
var Mn, Ce, W, lt, Be, Se, dt, Qt, Yt, Xt, xt, en, tn, oe, L, Tn, On, Xs, ei, ti, Ar, Rr, ni, Nr, ri;
class La {
  /**** Constructor ****/
  constructor(e, t = {}) {
    y(this, L);
    yn(this, "StoreId");
    y(this, Mn);
    y(this, Ce, crypto.randomUUID());
    y(this, W);
    /**** Signalling WebSocket ****/
    y(this, lt);
    /**** active RTCPeerConnection per remote PeerId ****/
    y(this, Be, /* @__PURE__ */ new Map());
    y(this, Se, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    y(this, dt, "disconnected");
    /**** Event Handlers ****/
    y(this, Qt, /* @__PURE__ */ new Set());
    y(this, Yt, /* @__PURE__ */ new Set());
    y(this, Xt, /* @__PURE__ */ new Set());
    y(this, xt, /* @__PURE__ */ new Set());
    y(this, en, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    y(this, tn, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    y(this, oe, !1);
    this.StoreId = e, w(this, Mn, t), w(this, W, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, dt);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(e))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${e}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((n, r) => {
      const s = `${e}?token=${encodeURIComponent(t.Token)}`, a = new WebSocket(s);
      w(this, lt, a), d(this, L, Tn).call(this, "connecting"), a.onopen = () => {
        d(this, L, Tn).call(this, "connected"), d(this, L, On).call(this, { type: "hello", from: o(this, Ce) }), n();
      }, a.onerror = () => {
        if (!o(this, oe) && o(this, W) != null) {
          const c = e.replace("/signal/", "/ws/");
          w(this, oe, !0), o(this, W).connect(c, t).then(n).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, a.onclose = () => {
        o(this, dt) !== "disconnected" && (d(this, L, Tn).call(this, "reconnecting"), setTimeout(() => {
          o(this, dt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, a.onmessage = (c) => {
        try {
          const l = JSON.parse(c.data);
          d(this, L, Xs).call(this, l, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, L, Tn).call(this, "disconnected"), (e = o(this, lt)) == null || e.close(), w(this, lt, void 0);
    for (const t of o(this, Be).values())
      t.close();
    o(this, Be).clear(), o(this, Se).clear(), o(this, oe) && o(this, W) != null && (o(this, W).disconnect(), w(this, oe, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var n;
    if (o(this, oe)) {
      (n = o(this, W)) == null || n.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of o(this, Se).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var s;
    if (o(this, oe)) {
      (s = o(this, W)) == null || s.sendValue(e, t);
      return;
    }
    const n = d(this, L, Nr).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(n, 1), r.set(t, 33);
    for (const a of o(this, Se).values())
      if (a.readyState === "open")
        try {
          a.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (o(this, oe)) {
      (r = o(this, W)) == null || r.requestValue(e);
      return;
    }
    const t = d(this, L, Nr).call(this, e), n = new Uint8Array(33);
    n[0] = 3, n.set(t, 1);
    for (const s of o(this, Se).values())
      if (s.readyState === "open")
        try {
          s.send(n);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Qt).add(e), o(this, oe) && o(this, W) != null ? o(this, W).onPatch(e) : () => {
      o(this, Qt).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, Yt).add(e), o(this, oe) && o(this, W) != null ? o(this, W).onValue(e) : () => {
      o(this, Yt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, Xt).add(e), () => {
      o(this, Xt).delete(e);
    };
  }
  /**** sendSyncRequest ****/
  sendSyncRequest(e) {
    var n;
    if (o(this, oe)) {
      (n = o(this, W)) == null || n.sendSyncRequest(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 6, t.set(e, 1);
    for (const r of o(this, Se).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** onSyncRequest ****/
  onSyncRequest(e) {
    return o(this, en).add(e), o(this, oe) && o(this, W) != null ? o(this, W).onSyncRequest(e) : () => {
      o(this, en).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (o(this, oe)) {
      (r = o(this, W)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), n = new Uint8Array(1 + t.byteLength);
    n[0] = 4, n.set(t, 1);
    for (const s of o(this, Se).values())
      if (s.readyState === "open")
        try {
          s.send(n);
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
    return o(this, tn);
  }
}
Mn = new WeakMap(), Ce = new WeakMap(), W = new WeakMap(), lt = new WeakMap(), Be = new WeakMap(), Se = new WeakMap(), dt = new WeakMap(), Qt = new WeakMap(), Yt = new WeakMap(), Xt = new WeakMap(), xt = new WeakMap(), en = new WeakMap(), tn = new WeakMap(), oe = new WeakMap(), L = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
Tn = function(e) {
  if (o(this, dt) !== e) {
    w(this, dt, e);
    for (const t of o(this, Xt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
On = function(e) {
  var t;
  ((t = o(this, lt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, lt).send(JSON.stringify(e));
}, Xs = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === o(this, Ce))
        return;
      o(this, Be).has(e.from) || await d(this, L, ei).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== o(this, Ce))
        return;
      await d(this, L, ti).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== o(this, Ce))
        return;
      const n = o(this, Be).get(e.from);
      n != null && await n.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== o(this, Ce))
        return;
      const n = o(this, Be).get(e.from);
      n != null && await n.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, ei = async function(e) {
  const t = d(this, L, Ar).call(this, e), n = t.createDataChannel("sds", { ordered: !1, maxRetransmits: 0 });
  d(this, L, Rr).call(this, n, e), o(this, Se).set(e, n);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, L, On).call(this, { type: "offer", from: o(this, Ce), to: e, sdp: r });
}, ti = async function(e, t) {
  const n = d(this, L, Ar).call(this, e);
  await n.setRemoteDescription(new RTCSessionDescription(t));
  const r = await n.createAnswer();
  await n.setLocalDescription(r), d(this, L, On).call(this, { type: "answer", from: o(this, Ce), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Ar = function(e) {
  const t = o(this, Mn).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], n = new RTCPeerConnection({ iceServers: t });
  return o(this, Be).set(e, n), n.onicecandidate = (r) => {
    r.candidate != null && d(this, L, On).call(this, {
      type: "candidate",
      from: o(this, Ce),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, n.ondatachannel = (r) => {
    d(this, L, Rr).call(this, r.channel, e), o(this, Se).set(e, r.channel);
  }, n.onconnectionstatechange = () => {
    if (n.connectionState === "failed" || n.connectionState === "closed") {
      o(this, Be).delete(e), o(this, Se).delete(e), o(this, tn).delete(e);
      for (const r of o(this, xt))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, n;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
Rr = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (n) => {
    const r = new Uint8Array(n.data);
    d(this, L, ni).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
ni = function(e, t) {
  if (e.byteLength < 1)
    return;
  const n = e[0], r = e.slice(1);
  switch (n) {
    case 1: {
      for (const s of o(this, Qt))
        try {
          s(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const s = d(this, L, ri).call(this, r.slice(0, 32)), a = r.slice(32);
      for (const c of o(this, Yt))
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
        s.lastSeen = Date.now(), o(this, tn).set(s.PeerId, s);
        for (const a of o(this, xt))
          try {
            a(s.PeerId, s);
          } catch {
          }
      } catch {
      }
      break;
    }
    case 6: {
      for (const s of o(this, en))
        try {
          s(r);
        } catch {
        }
      break;
    }
  }
}, /**** #hexToBytes ****/
Nr = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}, /**** #bytesToHex ****/
ri = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Te(i) {
  return new Promise((e, t) => {
    i.onsuccess = () => {
      e(i.result);
    }, i.onerror = () => {
      t(i.error);
    };
  });
}
function rt(i, e, t) {
  return i.transaction(e, t);
}
var Ye, Ee, Pn, Le, He;
class Aa {
  /**** constructor ****/
  constructor(e) {
    y(this, Le);
    y(this, Ye);
    y(this, Ee);
    y(this, Pn);
    w(this, Ee, e), w(this, Pn, `sds:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, Le, He).call(this), t = rt(e, ["snapshots"], "readonly"), n = await Te(
      t.objectStore("snapshots").get(o(this, Ee))
    );
    return n != null ? n.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e, t) {
    const n = await d(this, Le, He).call(this), r = rt(n, ["snapshots"], "readwrite");
    await Te(
      r.objectStore("snapshots").put({
        storeId: o(this, Ee),
        data: e,
        clock: t ?? 0
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await d(this, Le, He).call(this), r = rt(t, ["patches"], "readonly").objectStore("patches"), s = IDBKeyRange.bound(
      [o(this, Ee), e + 1],
      [o(this, Ee), Number.MAX_SAFE_INTEGER]
    );
    return (await Te(
      r.getAll(s)
    )).sort((c, l) => c.clock - l.clock).map((c) => c.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const n = await d(this, Le, He).call(this), r = rt(n, ["patches"], "readwrite");
    try {
      await Te(
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
    const t = await d(this, Le, He).call(this), r = rt(t, ["patches"], "readwrite").objectStore("patches"), s = IDBKeyRange.bound(
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
    const t = await d(this, Le, He).call(this), n = rt(t, ["values"], "readonly"), r = await Te(
      n.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const n = await d(this, Le, He).call(this), s = rt(n, ["values"], "readwrite").objectStore("values"), a = await Te(
      s.get(e)
    );
    a != null ? await Te(
      s.put({ hash: e, data: a.data, ref_count: a.ref_count + 1 })
    ) : await Te(
      s.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await d(this, Le, He).call(this), r = rt(t, ["values"], "readwrite").objectStore("values"), s = await Te(
      r.get(e)
    );
    if (s == null)
      return;
    const a = s.ref_count - 1;
    a <= 0 ? await Te(r.delete(e)) : await Te(
      r.put({ hash: e, data: s.data, ref_count: a })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = o(this, Ye)) == null || e.close(), w(this, Ye, void 0);
  }
}
Ye = new WeakMap(), Ee = new WeakMap(), Pn = new WeakMap(), Le = new WeakSet(), He = async function() {
  return o(this, Ye) != null ? o(this, Ye) : new Promise((e, t) => {
    const n = indexedDB.open(o(this, Pn), 1);
    n.onupgradeneeded = (r) => {
      const s = r.target.result;
      s.objectStoreNames.contains("snapshots") || s.createObjectStore("snapshots", { keyPath: "storeId" }), s.objectStoreNames.contains("patches") || s.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), s.objectStoreNames.contains("values") || s.createObjectStore("values", { keyPath: "hash" });
    }, n.onsuccess = (r) => {
      w(this, Ye, r.target.result), e(o(this, Ye));
    }, n.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const ka = 512 * 1024;
var U, z, N, kt, nn, rn, Dn, Bn, sn, an, Ae, Tt, Ot, Ct, Et, Xe, ut, Re, jn, on, je, Ze, Ke, V, si, ii, ai, oi, ci, Vr, li, Mr, Pr, di, Dr;
class Ra {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    y(this, V);
    y(this, U);
    y(this, z);
    y(this, N);
    y(this, kt);
    y(this, nn);
    yn(this, "PeerId", crypto.randomUUID());
    y(this, rn);
    y(this, Dn);
    y(this, Bn, []);
    // outgoing patch queue (patches created while disconnected)
    y(this, sn, 0);
    // accumulated patch bytes since last checkpoint
    y(this, an, 0);
    // sequence number of the last saved snapshot
    y(this, Ae, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    y(this, Tt, new Uint8Array(0));
    // heartbeat timer
    y(this, Ot);
    y(this, Ct);
    // presence peer tracking
    y(this, Et, /* @__PURE__ */ new Map());
    y(this, Xe, /* @__PURE__ */ new Map());
    y(this, ut, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    y(this, Re);
    // connection state mirror
    y(this, jn, "disconnected");
    y(this, on, /* @__PURE__ */ new Set());
    // pending sync-response timer (random delay before answering a sync request)
    y(this, je);
    // unsubscribe functions for registered handlers
    y(this, Ze, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    y(this, Ke, /* @__PURE__ */ new Map());
    var r;
    w(this, U, e), w(this, z, t.PersistenceProvider ?? void 0), w(this, N, t.NetworkProvider ?? void 0), w(this, kt, t.PresenceProvider ?? (typeof ((r = t.NetworkProvider) == null ? void 0 : r.onRemoteState) == "function" ? t.NetworkProvider : void 0)), w(this, nn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && o(this, N) != null && w(this, Re, new BroadcastChannel(`sds:${o(this, N).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    if (o(this, z) != null) {
      const e = o(this, z);
      o(this, U).setValueBlobLoader((t) => e.loadValue(t));
    }
    await d(this, V, si).call(this), d(this, V, ii).call(this), d(this, V, ai).call(this), d(this, V, oi).call(this), d(this, V, ci).call(this), o(this, N) != null && o(this, N).onConnectionChange((e) => {
      w(this, jn, e);
      for (const t of o(this, on))
        try {
          t(e);
        } catch (n) {
          console.error("[SDS] connection-change handler threw:", n.message ?? n);
        }
      e === "connected" && (d(this, V, li).call(this), o(this, N).sendSyncRequest(o(this, U).currentCursor));
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, n;
    o(this, je) != null && (clearTimeout(o(this, je)), w(this, je, void 0)), o(this, Ot) != null && (clearInterval(o(this, Ot)), w(this, Ot, void 0));
    for (const r of o(this, Xe).values())
      clearTimeout(r);
    o(this, Xe).clear();
    for (const r of o(this, Ze))
      try {
        r();
      } catch {
      }
    w(this, Ze, []), (e = o(this, Re)) == null || e.close(), w(this, Re, void 0), (t = o(this, N)) == null || t.disconnect(), o(this, z) != null && await d(this, V, Vr).call(this), await ((n = o(this, z)) == null ? void 0 : n.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (o(this, N) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    w(this, rn, e), w(this, Dn, t), await o(this, N).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (o(this, N) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    o(this, N).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (o(this, N) == null)
      throw new P("no-network-provider", "no NetworkProvider configured");
    if (o(this, rn) == null)
      throw new P(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await o(this, N).connect(o(this, rn), o(this, Dn));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, jn);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, on).add(e), () => {
      o(this, on).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var n, r;
    w(this, Ct, e);
    const t = { ...e, PeerId: this.PeerId };
    (n = o(this, kt)) == null || n.sendLocalState(e), (r = o(this, Re)) == null || r.postMessage({ type: "presence", payload: t, senderId: this.PeerId });
    for (const s of o(this, ut))
      try {
        s(this.PeerId, t, "local");
      } catch (a) {
        console.error("SDS: presence handler failed", a);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return o(this, Et);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return o(this, ut).add(e), () => {
      o(this, ut).delete(e);
    };
  }
}
U = new WeakMap(), z = new WeakMap(), N = new WeakMap(), kt = new WeakMap(), nn = new WeakMap(), rn = new WeakMap(), Dn = new WeakMap(), Bn = new WeakMap(), sn = new WeakMap(), an = new WeakMap(), Ae = new WeakMap(), Tt = new WeakMap(), Ot = new WeakMap(), Ct = new WeakMap(), Et = new WeakMap(), Xe = new WeakMap(), ut = new WeakMap(), Re = new WeakMap(), jn = new WeakMap(), on = new WeakMap(), je = new WeakMap(), Ze = new WeakMap(), Ke = new WeakMap(), V = new WeakSet(), si = async function() {
  if (o(this, z) == null)
    return;
  await o(this, z).loadSnapshot();
  const e = await o(this, z).loadPatchesSince(o(this, an));
  for (const t of e)
    try {
      o(this, U).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && w(this, Ae, o(this, an) + e.length), w(this, Tt, o(this, U).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
ii = function() {
  const e = o(this, U).onChangeInvoke((t, n) => {
    var a, c;
    if (t === "external") {
      d(this, V, Mr).call(this, n, "request").catch((l) => {
        console.error("[SDS] value-request failed:", l.message ?? l);
      });
      return;
    }
    const r = o(this, Tt);
    Un(this, Ae)._++;
    const s = o(this, U).exportPatch(r);
    w(this, Tt, o(this, U).currentCursor), s.byteLength !== 0 && (o(this, z) != null && (o(this, z).appendPatch(s, o(this, Ae)).catch((l) => {
      console.error("[SDS] appendPatch failed:", l.message ?? l);
    }), w(this, sn, o(this, sn) + s.byteLength), o(this, sn) >= ka && d(this, V, Vr).call(this).catch((l) => {
      console.error("[SDS] checkpoint failed:", l.message ?? l);
    })), ((a = o(this, N)) == null ? void 0 : a.ConnectionState) === "connected" ? (o(this, N).sendPatch(s), (c = o(this, Re)) == null || c.postMessage({ type: "patch", payload: s, senderId: this.PeerId })) : o(this, Bn).push(s), d(this, V, Mr).call(this, n, "send").catch((l) => {
      console.error("[SDS] value-send failed:", l.message ?? l);
    }));
  });
  o(this, Ze).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
ai = function() {
  if (o(this, N) != null) {
    const t = o(this, N).onPatch((s) => {
      try {
        o(this, U).applyRemotePatch(s);
      } catch {
      }
    });
    o(this, Ze).push(t);
    const n = o(this, N).onValue(async (s, a) => {
      var c;
      o(this, U).storeValueBlob(s, a), await ((c = o(this, z)) == null ? void 0 : c.saveValue(s, a));
    });
    o(this, Ze).push(n);
    const r = o(this, N).onSyncRequest((s) => {
      o(this, je) != null && clearTimeout(o(this, je));
      const a = 50 + Math.floor(Math.random() * 250);
      w(this, je, setTimeout(() => {
        var l;
        w(this, je, void 0);
        const c = o(this, U).exportPatch();
        c.byteLength > 0 && ((l = o(this, N)) == null || l.sendPatch(c));
      }, a));
    });
    o(this, Ze).push(r);
  }
  const e = o(this, kt);
  if (e != null) {
    const t = e.onRemoteState((n, r) => {
      d(this, V, Pr).call(this, n, r);
    });
    o(this, Ze).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
oi = function() {
  const e = o(this, nn) / 4;
  w(this, Ot, setInterval(() => {
    var t, n;
    if (o(this, Ct) != null) {
      (t = o(this, kt)) == null || t.sendLocalState(o(this, Ct));
      const r = { ...o(this, Ct), PeerId: this.PeerId };
      (n = o(this, Re)) == null || n.postMessage({ type: "presence", payload: r, senderId: this.PeerId });
    }
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
ci = function() {
  o(this, Re) != null && (o(this, Re).onmessage = (e) => {
    const t = e.data;
    if (t.senderId !== this.PeerId)
      switch (!0) {
        case t.type === "patch":
          try {
            o(this, U).applyRemotePatch(t.payload);
          } catch (n) {
            console.error("[SDS] failed to apply BC patch:", n.message ?? n);
          }
          break;
        case t.type === "presence":
          d(this, V, Pr).call(this, t.payload.PeerId ?? t.senderId ?? "unknown", t.payload);
          break;
      }
  });
}, Vr = async function() {
  if (o(this, z) == null)
    return;
  const e = await o(this, z).loadPatchesSince(o(this, Ae));
  for (const t of e)
    try {
      o(this, U).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && (w(this, Ae, o(this, Ae) + e.length), w(this, Tt, o(this, U).currentCursor)), await o(this, z).saveSnapshot(o(this, U).asBinary(), o(this, Ae)), o(this, N) != null && (await o(this, z).prunePatches(o(this, Ae)), w(this, an, o(this, Ae))), w(this, sn, 0);
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
li = function() {
  var t;
  const e = o(this, Bn).splice(0);
  for (const n of e)
    try {
      (t = o(this, N)) == null || t.sendPatch(n);
    } catch (r) {
      console.error("SDS: failed to send queued patch", r);
    }
}, Mr = async function(e, t) {
  var n, r, s;
  for (const [a, c] of Object.entries(e)) {
    const l = c;
    if (l.has("Existence")) {
      const b = o(this, Ke).get(a);
      b != null && (await ((n = o(this, z)) == null ? void 0 : n.releaseValue(b)), o(this, Ke).delete(a));
    }
    if (!l.has("Value"))
      continue;
    const u = o(this, Ke).get(a), f = o(this, U)._getValueRefOf(a), g = f == null ? void 0 : f.Hash;
    if (u != null && u !== g && (await ((r = o(this, z)) == null ? void 0 : r.releaseValue(u)), o(this, Ke).delete(a)), f != null) {
      if (o(this, N) == null) {
        o(this, Ke).set(a, f.Hash);
        continue;
      }
      if (t === "send") {
        const b = o(this, U).getValueBlobByHash(f.Hash);
        b != null && (await ((s = o(this, z)) == null ? void 0 : s.saveValue(f.Hash, b)), o(this, Ke).set(a, f.Hash), o(this, N).ConnectionState === "connected" && o(this, N).sendValue(f.Hash, b));
      } else
        o(this, Ke).set(a, f.Hash), !o(this, U).hasValueBlob(f.Hash) && o(this, N).ConnectionState === "connected" && o(this, N).requestValue(f.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
Pr = function(e, t) {
  if (t == null) {
    d(this, V, Dr).call(this, e);
    return;
  }
  const n = { ...t, _lastSeen: Date.now() };
  o(this, Et).set(e, n), d(this, V, di).call(this, e);
  for (const r of o(this, ut))
    try {
      r(e, t, "remote");
    } catch (s) {
      console.error("SDS: presence handler failed", s);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
di = function(e) {
  const t = o(this, Xe).get(e);
  t != null && clearTimeout(t);
  const n = setTimeout(
    () => {
      d(this, V, Dr).call(this, e);
    },
    o(this, nn)
  );
  o(this, Xe).set(e, n);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
Dr = function(e) {
  if (!o(this, Et).has(e))
    return;
  o(this, Et).delete(e);
  const t = o(this, Xe).get(e);
  t != null && (clearTimeout(t), o(this, Xe).delete(e));
  for (const n of o(this, ut))
    try {
      n(e, void 0, "remote");
    } catch (r) {
      console.error("SDS: presence handler failed", r);
    }
};
export {
  Aa as SDS_BrowserPersistenceProvider,
  ys as SDS_DataStore,
  Rs as SDS_Entry,
  P as SDS_Error,
  os as SDS_Item,
  cs as SDS_Link,
  Ra as SDS_SyncEngine,
  La as SDS_WebRTCProvider,
  Ea as SDS_WebSocketProvider
};
