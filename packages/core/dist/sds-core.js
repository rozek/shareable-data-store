var Be = Object.defineProperty;
var le = (r) => {
  throw TypeError(r);
};
var ze = (r, e, t) => e in r ? Be(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var he = (r, e, t) => ze(r, typeof e != "symbol" ? e + "" : e, t), fe = (r, e, t) => e.has(r) || le("Cannot " + t);
var I = (r, e, t) => (fe(r, e, "read from private field"), t ? t.call(r) : e.get(r)), X = (r, e, t) => e.has(r) ? le("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), me = (r, e, t, s) => (fe(r, e, "write to private field"), s ? s.call(r, t) : e.set(r, t), t);
class V extends Error {
  constructor(t, s) {
    super(s);
    he(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const re = "00000000-0000-4000-8000-000000000000", De = "00000000-0000-4000-8000-000000000001", Pe = "00000000-0000-4000-8000-000000000002", Et = "text/plain", Rt = 131072, Zt = 2048, jt = 5e3, pe = 1024, _e = 256, ye = 1024, ge = 1048576, Vt = 200;
function Ue(r) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(r).toString("base64");
  let t = "";
  for (let s = 0; s < r.byteLength; s++)
    t += String.fromCharCode(r[s]);
  return btoa(t);
}
function $t(r) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(r, "base64")) : Uint8Array.from(atob(r), (t) => t.charCodeAt(0));
}
var S, j;
class Lt {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    X(this, S, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    X(this, j);
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
    I(this, S).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = I(this, S).get(e);
    return t == null && I(this, j) != null && (t = await I(this, j).call(this, e), t != null && I(this, S).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    I(this, S).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return I(this, S).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return I(this, S).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    me(this, j, e);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/
  newEntryFromJSONat(e, t, s) {
    const n = typeof e == "string" ? JSON.parse(e) : e;
    switch (!0) {
      case (n == null ? void 0 : n.Kind) === "item":
        return this.deserializeItemInto(n, t, s);
      case (n == null ? void 0 : n.Kind) === "link":
        return this.deserializeLinkInto(n, t, s);
      default:
        throw new V("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
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
    return this._EntryAsJSON(re);
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
    for (; s != null && (t.push(this.EntryWithId(s)), s !== re); )
      s = this._outerItemIdOf(s);
    return t;
  }
  /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
  _outerItemIdsOf(e) {
    return this._outerItemChainOf(e).map((t) => t.Id);
  }
  /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
  _EntryAsJSON(e) {
    const t = this._KindOf(e), s = this._LabelOf(e), n = this._InfoProxyOf(e), a = {};
    for (const u of Object.keys(n))
      a[u] = n[u];
    if (t === "link") {
      const u = this._TargetOf(e).Id;
      return { Kind: "link", Id: e, Label: s, TargetId: u, Info: a };
    }
    const i = this._TypeOf(e), o = this._ValueKindOf(e), h = { Kind: "item", Id: e, Label: s, Type: i, ValueKind: o, Info: a, innerEntries: [] };
    if (o === "literal" || o === "binary") {
      const u = this._currentValueOf(e);
      u !== void 0 && (h.Value = typeof u == "string" ? u : Ue(u));
    }
    return h.innerEntries = Array.from(this._innerEntriesOf(e)).map((u) => this._EntryAsJSON(u.Id)), h;
  }
}
S = new WeakMap(), j = new WeakMap();
var g;
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
    const a = {};
    for (const i of n)
      a[i] = i;
    return a;
  }, r.getValidEnumValues = (n) => {
    const a = r.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), i = {};
    for (const o of a)
      i[o] = n[o];
    return r.objectValues(i);
  }, r.objectValues = (n) => r.objectKeys(n).map(function(a) {
    return n[a];
  }), r.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const a = [];
    for (const i in n)
      Object.prototype.hasOwnProperty.call(n, i) && a.push(i);
    return a;
  }, r.find = (n, a) => {
    for (const i of n)
      if (a(i))
        return i;
  }, r.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function s(n, a = " | ") {
    return n.map((i) => typeof i == "string" ? `'${i}'` : i).join(a);
  }
  r.joinValues = s, r.jsonStringifyReplacer = (n, a) => typeof a == "bigint" ? a.toString() : a;
})(g || (g = {}));
var ve;
(function(r) {
  r.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(ve || (ve = {}));
const l = g.arrayToEnum([
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
]), T = (r) => {
  switch (typeof r) {
    case "undefined":
      return l.undefined;
    case "string":
      return l.string;
    case "number":
      return Number.isNaN(r) ? l.nan : l.number;
    case "boolean":
      return l.boolean;
    case "function":
      return l.function;
    case "bigint":
      return l.bigint;
    case "symbol":
      return l.symbol;
    case "object":
      return Array.isArray(r) ? l.array : r === null ? l.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? l.promise : typeof Map < "u" && r instanceof Map ? l.map : typeof Set < "u" && r instanceof Set ? l.set : typeof Date < "u" && r instanceof Date ? l.date : l.object;
    default:
      return l.unknown;
  }
}, d = g.arrayToEnum([
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
class O extends Error {
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
    const t = e || function(a) {
      return a.message;
    }, s = { _errors: [] }, n = (a) => {
      for (const i of a.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n);
        else if (i.code === "invalid_return_type")
          n(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n(i.argumentsError);
        else if (i.path.length === 0)
          s._errors.push(t(i));
        else {
          let o = s, h = 0;
          for (; h < i.path.length; ) {
            const u = i.path[h];
            h === i.path.length - 1 ? (o[u] = o[u] || { _errors: [] }, o[u]._errors.push(t(i))) : o[u] = o[u] || { _errors: [] }, o = o[u], h++;
          }
        }
    };
    return n(this), s;
  }
  static assert(e) {
    if (!(e instanceof O))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, g.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const a = n.path[0];
        t[a] = t[a] || [], t[a].push(e(n));
      } else
        s.push(e(n));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
O.create = (r) => new O(r);
const se = (r, e) => {
  let t;
  switch (r.code) {
    case d.invalid_type:
      r.received === l.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
      break;
    case d.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(r.expected, g.jsonStringifyReplacer)}`;
      break;
    case d.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${g.joinValues(r.keys, ", ")}`;
      break;
    case d.invalid_union:
      t = "Invalid input";
      break;
    case d.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${g.joinValues(r.options)}`;
      break;
    case d.invalid_enum_value:
      t = `Invalid enum value. Expected ${g.joinValues(r.options)}, received '${r.received}'`;
      break;
    case d.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case d.invalid_return_type:
      t = "Invalid function return type";
      break;
    case d.invalid_date:
      t = "Invalid date";
      break;
    case d.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : g.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
      break;
    case d.too_small:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
      break;
    case d.too_big:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
      break;
    case d.custom:
      t = "Invalid input";
      break;
    case d.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case d.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case d.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, g.assertNever(r);
  }
  return { message: t };
};
let Fe = se;
function We() {
  return Fe;
}
const Je = (r) => {
  const { data: e, path: t, errorMaps: s, issueData: n } = r, a = [...t, ...n.path || []], i = {
    ...n,
    path: a
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: a,
      message: n.message
    };
  let o = "";
  const h = s.filter((u) => !!u).slice().reverse();
  for (const u of h)
    o = u(i, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: a,
    message: o
  };
};
function c(r, e) {
  const t = We(), s = Je({
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
      t === se ? void 0 : se
      // then global default map
    ].filter((n) => !!n)
  });
  r.common.issues.push(s);
}
class k {
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
    for (const n of t) {
      if (n.status === "aborted")
        return m;
      n.status === "dirty" && e.dirty(), s.push(n.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const n of t) {
      const a = await n.key, i = await n.value;
      s.push({
        key: a,
        value: i
      });
    }
    return k.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const n of t) {
      const { key: a, value: i } = n;
      if (a.status === "aborted" || i.status === "aborted")
        return m;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || n.alwaysSet) && (s[a.value] = i.value);
    }
    return { status: e.value, value: s };
  }
}
const m = Object.freeze({
  status: "aborted"
}), P = (r) => ({ status: "dirty", value: r }), b = (r) => ({ status: "valid", value: r }), xe = (r) => r.status === "aborted", ke = (r) => r.status === "dirty", $ = (r) => r.status === "valid", K = (r) => typeof Promise < "u" && r instanceof Promise;
var f;
(function(r) {
  r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(f || (f = {}));
class N {
  constructor(e, t, s, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const be = (r, e) => {
  if ($(e))
    return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new O(r.common.issues);
      return this._error = t, this._error;
    }
  };
};
function _(r) {
  if (!r)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: n } = r;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (i, o) => {
    const { message: h } = r;
    return i.code === "invalid_enum_value" ? { message: h ?? o.defaultError } : typeof o.data > "u" ? { message: h ?? s ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: h ?? t ?? o.defaultError };
  }, description: n };
}
class y {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return T(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: T(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new k(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: T(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (K(t))
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
      parsedType: T(e)
    }, n = this._parseSync({ data: e, path: s.path, parent: s });
    return be(s, n);
  }
  "~validate"(e) {
    var s, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: T(e)
    };
    if (!this["~standard"].async)
      try {
        const a = this._parseSync({ data: e, path: [], parent: t });
        return $(a) ? {
          value: a.value
        } : {
          issues: t.common.issues
        };
      } catch (a) {
        (n = (s = a == null ? void 0 : a.message) == null ? void 0 : s.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((a) => $(a) ? {
      value: a.value
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
      parsedType: T(e)
    }, n = this._parse({ data: e, path: s.path, parent: s }), a = await (K(n) ? n : Promise.resolve(n));
    return be(s, a);
  }
  refine(e, t) {
    const s = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, a) => {
      const i = e(n), o = () => a.addIssue({
        code: d.custom,
        ...s(n)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((h) => h ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, n) => e(s) ? !0 : (n.addIssue(typeof t == "function" ? t(s, n) : t), !1));
  }
  _refinement(e) {
    return new B({
      schema: this,
      typeName: p.ZodEffects,
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
    return A.create(this, this._def);
  }
  nullable() {
    return z.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return w.create(this);
  }
  promise() {
    return H.create(this, this._def);
  }
  or(e) {
    return Y.create([this, e], this._def);
  }
  and(e) {
    return G.create(this, e, this._def);
  }
  transform(e) {
    return new B({
      ..._(this._def),
      schema: this,
      typeName: p.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new oe({
      ..._(this._def),
      innerType: this,
      defaultValue: t,
      typeName: p.ZodDefault
    });
  }
  brand() {
    return new pt({
      typeName: p.ZodBranded,
      type: this,
      ..._(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new de({
      ..._(this._def),
      innerType: this,
      catchValue: t,
      typeName: p.ZodCatch
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
    return ue.create(this, e);
  }
  readonly() {
    return ce.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Ke = /^c[^\s-]{8,}$/i, qe = /^[0-9a-z]+$/, Ye = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Ge = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, He = /^[a-z0-9_-]{21}$/i, Qe = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Xe = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, et = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, tt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ee;
const rt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, st = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, nt = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, at = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, it = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ot = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, je = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", dt = new RegExp(`^${je}$`);
function Ve(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function ct(r) {
  return new RegExp(`^${Ve(r)}$`);
}
function ut(r) {
  let e = `${je}T${Ve(r)}`;
  const t = [];
  return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function lt(r, e) {
  return !!((e === "v4" || !e) && rt.test(r) || (e === "v6" || !e) && nt.test(r));
}
function ht(r, e) {
  if (!Qe.test(r))
    return !1;
  try {
    const [t] = r.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(s));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function ft(r, e) {
  return !!((e === "v4" || !e) && st.test(r) || (e === "v6" || !e) && at.test(r));
}
class C extends y {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== l.string) {
      const a = this._getOrReturnCtx(e);
      return c(a, {
        code: d.invalid_type,
        expected: l.string,
        received: a.parsedType
      }), m;
    }
    const s = new k();
    let n;
    for (const a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (n = this._getOrReturnCtx(e, n), c(n, {
          code: d.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), s.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (n = this._getOrReturnCtx(e, n), c(n, {
          code: d.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), s.dirty());
      else if (a.kind === "length") {
        const i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (n = this._getOrReturnCtx(e, n), i ? c(n, {
          code: d.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }) : o && c(n, {
          code: d.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }), s.dirty());
      } else if (a.kind === "email")
        et.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "email",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "emoji")
        ee || (ee = new RegExp(tt, "u")), ee.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "emoji",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "uuid")
        Ge.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "uuid",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "nanoid")
        He.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "nanoid",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "cuid")
        Ke.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "cuid",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "cuid2")
        qe.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "cuid2",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "ulid")
        Ye.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "ulid",
          code: d.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), c(n, {
            validation: "url",
            code: d.invalid_string,
            message: a.message
          }), s.dirty();
        }
      else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "regex",
        code: d.invalid_string,
        message: a.message
      }), s.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { includes: a.value, position: a.position },
        message: a.message
      }), s.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { startsWith: a.value },
        message: a.message
      }), s.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { endsWith: a.value },
        message: a.message
      }), s.dirty()) : a.kind === "datetime" ? ut(a).test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "datetime",
        message: a.message
      }), s.dirty()) : a.kind === "date" ? dt.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "date",
        message: a.message
      }), s.dirty()) : a.kind === "time" ? ct(a).test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "time",
        message: a.message
      }), s.dirty()) : a.kind === "duration" ? Xe.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "duration",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "ip" ? lt(e.data, a.version) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "ip",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "jwt" ? ht(e.data, a.alg) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "jwt",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "cidr" ? ft(e.data, a.version) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "cidr",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "base64" ? it.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "base64",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "base64url" ? ot.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "base64url",
        code: d.invalid_string,
        message: a.message
      }), s.dirty()) : g.assertNever(a);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: d.invalid_string,
      ...f.errToObj(s)
    });
  }
  _addCheck(e) {
    return new C({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...f.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...f.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...f.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...f.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...f.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...f.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...f.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...f.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...f.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...f.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...f.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...f.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...f.errToObj(e) });
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
      ...f.errToObj(e == null ? void 0 : e.message)
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
      ...f.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...f.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...f.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...f.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...f.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...f.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...f.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...f.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...f.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, f.errToObj(e));
  }
  trim() {
    return new C({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new C({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new C({
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
C.create = (r) => new C({
  checks: [],
  typeName: p.ZodString,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ..._(r)
});
function mt(r, e) {
  const t = (r.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, n = t > s ? t : s, a = Number.parseInt(r.toFixed(n).replace(".", "")), i = Number.parseInt(e.toFixed(n).replace(".", ""));
  return a % i / 10 ** n;
}
class L extends y {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== l.number) {
      const a = this._getOrReturnCtx(e);
      return c(a, {
        code: d.invalid_type,
        expected: l.number,
        received: a.parsedType
      }), m;
    }
    let s;
    const n = new k();
    for (const a of this._def.checks)
      a.kind === "int" ? g.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.invalid_type,
        expected: "integer",
        received: "float",
        message: a.message
      }), n.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        minimum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        maximum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? mt(e.data, a.value) !== 0 && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_finite,
        message: a.message
      }), n.dirty()) : g.assertNever(a);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, f.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, f.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, f.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, f.toString(t));
  }
  setLimit(e, t, s, n) {
    return new L({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new L({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: f.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: f.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: f.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: f.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: f.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: f.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: f.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: f.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: f.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && g.isInteger(e.value));
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
L.create = (r) => new L({
  checks: [],
  typeName: p.ZodNumber,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ..._(r)
});
class U extends y {
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
    if (this._getType(e) !== l.bigint)
      return this._getInvalidInput(e);
    let s;
    const n = new k();
    for (const a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        type: "bigint",
        minimum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        type: "bigint",
        maximum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : g.assertNever(a);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.bigint,
      received: t.parsedType
    }), m;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, f.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, f.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, f.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, f.toString(t));
  }
  setLimit(e, t, s, n) {
    return new U({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new U({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: f.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: f.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: f.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: f.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: f.toString(t)
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
U.create = (r) => new U({
  checks: [],
  typeName: p.ZodBigInt,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ..._(r)
});
class we extends y {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== l.boolean) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.boolean,
        received: s.parsedType
      }), m;
    }
    return b(e.data);
  }
}
we.create = (r) => new we({
  typeName: p.ZodBoolean,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ..._(r)
});
class q extends y {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== l.date) {
      const a = this._getOrReturnCtx(e);
      return c(a, {
        code: d.invalid_type,
        expected: l.date,
        received: a.parsedType
      }), m;
    }
    if (Number.isNaN(e.data.getTime())) {
      const a = this._getOrReturnCtx(e);
      return c(a, {
        code: d.invalid_date
      }), m;
    }
    const s = new k();
    let n;
    for (const a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.too_small,
        message: a.message,
        inclusive: !0,
        exact: !1,
        minimum: a.value,
        type: "date"
      }), s.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.too_big,
        message: a.message,
        inclusive: !0,
        exact: !1,
        maximum: a.value,
        type: "date"
      }), s.dirty()) : g.assertNever(a);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new q({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: f.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: f.toString(t)
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
q.create = (r) => new q({
  checks: [],
  coerce: (r == null ? void 0 : r.coerce) || !1,
  typeName: p.ZodDate,
  ..._(r)
});
class Ie extends y {
  _parse(e) {
    if (this._getType(e) !== l.symbol) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.symbol,
        received: s.parsedType
      }), m;
    }
    return b(e.data);
  }
}
Ie.create = (r) => new Ie({
  typeName: p.ZodSymbol,
  ..._(r)
});
class ne extends y {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.undefined,
        received: s.parsedType
      }), m;
    }
    return b(e.data);
  }
}
ne.create = (r) => new ne({
  typeName: p.ZodUndefined,
  ..._(r)
});
class Se extends y {
  _parse(e) {
    if (this._getType(e) !== l.null) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.null,
        received: s.parsedType
      }), m;
    }
    return b(e.data);
  }
}
Se.create = (r) => new Se({
  typeName: p.ZodNull,
  ..._(r)
});
class F extends y {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return b(e.data);
  }
}
F.create = (r) => new F({
  typeName: p.ZodAny,
  ..._(r)
});
class ae extends y {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return b(e.data);
  }
}
ae.create = (r) => new ae({
  typeName: p.ZodUnknown,
  ..._(r)
});
class E extends y {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.never,
      received: t.parsedType
    }), m;
  }
}
E.create = (r) => new E({
  typeName: p.ZodNever,
  ..._(r)
});
class Oe extends y {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.void,
        received: s.parsedType
      }), m;
    }
    return b(e.data);
  }
}
Oe.create = (r) => new Oe({
  typeName: p.ZodVoid,
  ..._(r)
});
class w extends y {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== l.array)
      return c(t, {
        code: d.invalid_type,
        expected: l.array,
        received: t.parsedType
      }), m;
    if (n.exactLength !== null) {
      const i = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (i || o) && (c(t, {
        code: i ? d.too_big : d.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: i ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), s.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (c(t, {
      code: d.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), s.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (c(t, {
      code: d.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => n.type._parseAsync(new N(t, i, t.path, o)))).then((i) => k.mergeArray(s, i));
    const a = [...t.data].map((i, o) => n.type._parseSync(new N(t, i, t.path, o)));
    return k.mergeArray(s, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new w({
      ...this._def,
      minLength: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new w({
      ...this._def,
      maxLength: { value: e, message: f.toString(t) }
    });
  }
  length(e, t) {
    return new w({
      ...this._def,
      exactLength: { value: e, message: f.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
w.create = (r, e) => new w({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: p.ZodArray,
  ..._(e)
});
function Z(r) {
  if (r instanceof x) {
    const e = {};
    for (const t in r.shape) {
      const s = r.shape[t];
      e[t] = A.create(Z(s));
    }
    return new x({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof w ? new w({
    ...r._def,
    type: Z(r.element)
  }) : r instanceof A ? A.create(Z(r.unwrap())) : r instanceof z ? z.create(Z(r.unwrap())) : r instanceof R ? R.create(r.items.map((e) => Z(e))) : r;
}
class x extends y {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = g.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== l.object) {
      const u = this._getOrReturnCtx(e);
      return c(u, {
        code: d.invalid_type,
        expected: l.object,
        received: u.parsedType
      }), m;
    }
    const { status: s, ctx: n } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof E && this._def.unknownKeys === "strip"))
      for (const u in n.data)
        i.includes(u) || o.push(u);
    const h = [];
    for (const u of i) {
      const v = a[u], D = n.data[u];
      h.push({
        key: { status: "valid", value: u },
        value: v._parse(new N(n, D, n.path, u)),
        alwaysSet: u in n.data
      });
    }
    if (this._def.catchall instanceof E) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const v of o)
          h.push({
            key: { status: "valid", value: v },
            value: { status: "valid", value: n.data[v] }
          });
      else if (u === "strict")
        o.length > 0 && (c(n, {
          code: d.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const v of o) {
        const D = n.data[v];
        h.push({
          key: { status: "valid", value: v },
          value: u._parse(
            new N(n, D, n.path, v)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: v in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const v of h) {
        const D = await v.key, Me = await v.value;
        u.push({
          key: D,
          value: Me,
          alwaysSet: v.alwaysSet
        });
      }
      return u;
    }).then((u) => k.mergeObjectSync(s, u)) : k.mergeObjectSync(s, h);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return f.errToObj, new x({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var a, i;
          const n = ((i = (a = this._def).errorMap) == null ? void 0 : i.call(a, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: f.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new x({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new x({
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
    return new x({
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
    return new x({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: p.ZodObject
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
    return new x({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of g.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new x({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of g.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new x({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Z(this);
  }
  partial(e) {
    const t = {};
    for (const s of g.objectKeys(this.shape)) {
      const n = this.shape[s];
      e && !e[s] ? t[s] = n : t[s] = n.optional();
    }
    return new x({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of g.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let a = this.shape[s];
        for (; a instanceof A; )
          a = a._def.innerType;
        t[s] = a;
      }
    return new x({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return $e(g.objectKeys(this.shape));
  }
}
x.create = (r, e) => new x({
  shape: () => r,
  unknownKeys: "strip",
  catchall: E.create(),
  typeName: p.ZodObject,
  ..._(e)
});
x.strictCreate = (r, e) => new x({
  shape: () => r,
  unknownKeys: "strict",
  catchall: E.create(),
  typeName: p.ZodObject,
  ..._(e)
});
x.lazycreate = (r, e) => new x({
  shape: r,
  unknownKeys: "strip",
  catchall: E.create(),
  typeName: p.ZodObject,
  ..._(e)
});
class Y extends y {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function n(a) {
      for (const o of a)
        if (o.result.status === "valid")
          return o.result;
      for (const o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = a.map((o) => new O(o.ctx.common.issues));
      return c(t, {
        code: d.invalid_union,
        unionErrors: i
      }), m;
    }
    if (t.common.async)
      return Promise.all(s.map(async (a) => {
        const i = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await a._parseAsync({
            data: t.data,
            path: t.path,
            parent: i
          }),
          ctx: i
        };
      })).then(n);
    {
      let a;
      const i = [];
      for (const h of s) {
        const u = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, v = h._parseSync({
          data: t.data,
          path: t.path,
          parent: u
        });
        if (v.status === "valid")
          return v;
        v.status === "dirty" && !a && (a = { result: v, ctx: u }), u.common.issues.length && i.push(u.common.issues);
      }
      if (a)
        return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((h) => new O(h));
      return c(t, {
        code: d.invalid_union,
        unionErrors: o
      }), m;
    }
  }
  get options() {
    return this._def.options;
  }
}
Y.create = (r, e) => new Y({
  options: r,
  typeName: p.ZodUnion,
  ..._(e)
});
function ie(r, e) {
  const t = T(r), s = T(e);
  if (r === e)
    return { valid: !0, data: r };
  if (t === l.object && s === l.object) {
    const n = g.objectKeys(e), a = g.objectKeys(r).filter((o) => n.indexOf(o) !== -1), i = { ...r, ...e };
    for (const o of a) {
      const h = ie(r[o], e[o]);
      if (!h.valid)
        return { valid: !1 };
      i[o] = h.data;
    }
    return { valid: !0, data: i };
  } else if (t === l.array && s === l.array) {
    if (r.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let a = 0; a < r.length; a++) {
      const i = r[a], o = e[a], h = ie(i, o);
      if (!h.valid)
        return { valid: !1 };
      n.push(h.data);
    }
    return { valid: !0, data: n };
  } else return t === l.date && s === l.date && +r == +e ? { valid: !0, data: r } : { valid: !1 };
}
class G extends y {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = (a, i) => {
      if (xe(a) || xe(i))
        return m;
      const o = ie(a.value, i.value);
      return o.valid ? ((ke(a) || ke(i)) && t.dirty(), { status: t.value, value: o.data }) : (c(s, {
        code: d.invalid_intersection_types
      }), m);
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
    ]).then(([a, i]) => n(a, i)) : n(this._def.left._parseSync({
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
G.create = (r, e, t) => new G({
  left: r,
  right: e,
  typeName: p.ZodIntersection,
  ..._(t)
});
class R extends y {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.array)
      return c(s, {
        code: d.invalid_type,
        expected: l.array,
        received: s.parsedType
      }), m;
    if (s.data.length < this._def.items.length)
      return c(s, {
        code: d.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), m;
    !this._def.rest && s.data.length > this._def.items.length && (c(s, {
      code: d.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const a = [...s.data].map((i, o) => {
      const h = this._def.items[o] || this._def.rest;
      return h ? h._parse(new N(s, i, s.path, o)) : null;
    }).filter((i) => !!i);
    return s.common.async ? Promise.all(a).then((i) => k.mergeArray(t, i)) : k.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new R({
      ...this._def,
      rest: e
    });
  }
}
R.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new R({
    items: r,
    typeName: p.ZodTuple,
    rest: null,
    ..._(e)
  });
};
class Te extends y {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.map)
      return c(s, {
        code: d.invalid_type,
        expected: l.map,
        received: s.parsedType
      }), m;
    const n = this._def.keyType, a = this._def.valueType, i = [...s.data.entries()].map(([o, h], u) => ({
      key: n._parse(new N(s, o, s.path, [u, "key"])),
      value: a._parse(new N(s, h, s.path, [u, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const h of i) {
          const u = await h.key, v = await h.value;
          if (u.status === "aborted" || v.status === "aborted")
            return m;
          (u.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(u.value, v.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const h of i) {
        const u = h.key, v = h.value;
        if (u.status === "aborted" || v.status === "aborted")
          return m;
        (u.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(u.value, v.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Te.create = (r, e, t) => new Te({
  valueType: e,
  keyType: r,
  typeName: p.ZodMap,
  ..._(t)
});
class W extends y {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.set)
      return c(s, {
        code: d.invalid_type,
        expected: l.set,
        received: s.parsedType
      }), m;
    const n = this._def;
    n.minSize !== null && s.data.size < n.minSize.value && (c(s, {
      code: d.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && s.data.size > n.maxSize.value && (c(s, {
      code: d.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const a = this._def.valueType;
    function i(h) {
      const u = /* @__PURE__ */ new Set();
      for (const v of h) {
        if (v.status === "aborted")
          return m;
        v.status === "dirty" && t.dirty(), u.add(v.value);
      }
      return { status: t.value, value: u };
    }
    const o = [...s.data.values()].map((h, u) => a._parse(new N(s, h, s.path, u)));
    return s.common.async ? Promise.all(o).then((h) => i(h)) : i(o);
  }
  min(e, t) {
    return new W({
      ...this._def,
      minSize: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new W({
      ...this._def,
      maxSize: { value: e, message: f.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
W.create = (r, e) => new W({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: p.ZodSet,
  ..._(e)
});
class Ce extends y {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ce.create = (r, e) => new Ce({
  getter: r,
  typeName: p.ZodLazy,
  ..._(e)
});
class Ae extends y {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return c(t, {
        received: t.data,
        code: d.invalid_literal,
        expected: this._def.value
      }), m;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Ae.create = (r, e) => new Ae({
  value: r,
  typeName: p.ZodLiteral,
  ..._(e)
});
function $e(r, e) {
  return new M({
    values: r,
    typeName: p.ZodEnum,
    ..._(e)
  });
}
class M extends y {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        expected: g.joinValues(s),
        received: t.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        received: t.data,
        code: d.invalid_enum_value,
        options: s
      }), m;
    }
    return b(e.data);
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
    return M.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return M.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
M.create = $e;
class Ne extends y {
  _parse(e) {
    const t = g.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== l.string && s.parsedType !== l.number) {
      const n = g.objectValues(t);
      return c(s, {
        expected: g.joinValues(n),
        received: s.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(g.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = g.objectValues(t);
      return c(s, {
        received: s.data,
        code: d.invalid_enum_value,
        options: n
      }), m;
    }
    return b(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ne.create = (r, e) => new Ne({
  values: r,
  typeName: p.ZodNativeEnum,
  ..._(e)
});
class H extends y {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== l.promise && t.common.async === !1)
      return c(t, {
        code: d.invalid_type,
        expected: l.promise,
        received: t.parsedType
      }), m;
    const s = t.parsedType === l.promise ? t.data : Promise.resolve(t.data);
    return b(s.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
H.create = (r, e) => new H({
  type: r,
  typeName: p.ZodPromise,
  ..._(e)
});
class B extends y {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === p.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = this._def.effect || null, a = {
      addIssue: (i) => {
        c(s, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (a.addIssue = a.addIssue.bind(a), n.type === "preprocess") {
      const i = n.transform(s.data, a);
      if (s.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return m;
          const h = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return h.status === "aborted" ? m : h.status === "dirty" || t.value === "dirty" ? P(h.value) : h;
        });
      {
        if (t.value === "aborted")
          return m;
        const o = this._def.schema._parseSync({
          data: i,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : o.status === "dirty" || t.value === "dirty" ? P(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const i = (o) => {
        const h = n.refinement(o, a);
        if (s.common.async)
          return Promise.resolve(h);
        if (h instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (s.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!$(i))
          return m;
        const o = n.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((i) => $(i) ? Promise.resolve(n.transform(i.value, a)).then((o) => ({
          status: t.value,
          value: o
        })) : m);
    g.assertNever(n);
  }
}
B.create = (r, e, t) => new B({
  schema: r,
  typeName: p.ZodEffects,
  effect: e,
  ..._(t)
});
B.createWithPreprocess = (r, e, t) => new B({
  schema: e,
  effect: { type: "preprocess", transform: r },
  typeName: p.ZodEffects,
  ..._(t)
});
class A extends y {
  _parse(e) {
    return this._getType(e) === l.undefined ? b(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
A.create = (r, e) => new A({
  innerType: r,
  typeName: p.ZodOptional,
  ..._(e)
});
class z extends y {
  _parse(e) {
    return this._getType(e) === l.null ? b(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
z.create = (r, e) => new z({
  innerType: r,
  typeName: p.ZodNullable,
  ..._(e)
});
class oe extends y {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === l.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
oe.create = (r, e) => new oe({
  innerType: r,
  typeName: p.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ..._(e)
});
class de extends y {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return K(n) ? n.then((a) => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new O(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new O(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
de.create = (r, e) => new de({
  innerType: r,
  typeName: p.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ..._(e)
});
class Ee extends y {
  _parse(e) {
    if (this._getType(e) !== l.nan) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.nan,
        received: s.parsedType
      }), m;
    }
    return { status: "valid", value: e.data };
  }
}
Ee.create = (r) => new Ee({
  typeName: p.ZodNaN,
  ..._(r)
});
class pt extends y {
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
class ue extends y {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const a = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? m : a.status === "dirty" ? (t.dirty(), P(a.value)) : this._def.out._parseAsync({
          data: a.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return n.status === "aborted" ? m : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new ue({
      in: e,
      out: t,
      typeName: p.ZodPipeline
    });
  }
}
class ce extends y {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (n) => ($(n) && (n.value = Object.freeze(n.value)), n);
    return K(t) ? t.then((n) => s(n)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ce.create = (r, e) => new ce({
  innerType: r,
  typeName: p.ZodReadonly,
  ..._(e)
});
function Re(r, e) {
  const t = typeof r == "function" ? r(e) : typeof r == "string" ? { message: r } : r;
  return typeof t == "string" ? { message: t } : t;
}
function _t(r, e = {}, t) {
  return r ? F.create().superRefine((s, n) => {
    const a = r(s);
    if (a instanceof Promise)
      return a.then((i) => {
        if (!i) {
          const o = Re(e, s), h = o.fatal ?? t ?? !0;
          n.addIssue({ code: "custom", ...o, fatal: h });
        }
      });
    if (!a) {
      const i = Re(e, s), o = i.fatal ?? t ?? !0;
      n.addIssue({ code: "custom", ...i, fatal: o });
    }
  }) : F.create();
}
var p;
(function(r) {
  r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
})(p || (p = {}));
const yt = (r, e = {
  message: `Input not instance of ${r.name}`
}) => _t((t) => t instanceof r, e), J = C.create, gt = L.create, vt = ne.create;
F.create;
const xt = ae.create;
E.create;
w.create;
const kt = Y.create;
G.create;
R.create;
M.create;
H.create;
A.create;
z.create;
function Q(r, e) {
  var n;
  const t = r.safeParse(e);
  if (t.success)
    return t.data;
  const s = ((n = t.error.issues[0]) == null ? void 0 : n.message) ?? "invalid argument";
  throw new V("invalid-argument", s);
}
const bt = J({
  invalid_type_error: "Label must be a string"
}).max(pe, `Label must not exceed ${pe} characters`), wt = J({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(_e, `MIMEType must not exceed ${_e} characters`), It = J({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(ye, `Info key must not exceed ${ye} characters`), St = xt().superRefine((r, e) => {
  let t;
  try {
    t = JSON.stringify(r);
  } catch {
    e.addIssue({
      code: d.custom,
      message: "Info value must be JSON-serialisable"
    });
    return;
  }
  new TextEncoder().encode(t).length > ge && e.addIssue({
    code: d.custom,
    message: `Info value must not exceed ${ge} bytes when serialised as UTF-8 JSON`
  });
});
function Ot(r) {
  Q(bt, r);
}
function Tt(r) {
  Q(wt, r);
}
function Mt(r) {
  Q(It, r);
}
function Bt(r) {
  Q(St, r);
}
class Le {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
  get isRootItem() {
    return this.Id === re;
  }
  get isTrashItem() {
    return this.Id === De;
  }
  get isLostAndFoundItem() {
    return this.Id === Pe;
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
    Ot(e), this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    if (e == null) throw new V("invalid-argument", "outerItem must not be missing");
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    if (e == null) throw new V("invalid-argument", "outerItem must not be missing");
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
const Ct = kt(
  [J(), yt(Uint8Array), vt()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), Ze = gt({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), At = J({
  invalid_type_error: "Replacement must be a string"
});
function te(r, e, t) {
  var a;
  const s = r.safeParse(e);
  if (s.success)
    return s.data;
  const n = (t ? `${t}: ` : "") + (((a = s.error.issues[0]) == null ? void 0 : a.message) ?? "invalid argument");
  throw new V("invalid-argument", n);
}
class zt extends Le {
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
    Tt(e), this._Store._setTypeOf(this.Id, e);
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
    te(Ct, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, s) {
    if (te(Ze, e, "fromIndex"), !Ze.safeParse(t).success || t < e)
      throw new V("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    te(At, s, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, s);
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
class Dt extends Le {
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
export {
  Zt as DefaultBinarySizeLimit,
  Rt as DefaultLiteralSizeLimit,
  Et as DefaultMIMEType,
  jt as DefaultWrapperCacheSize,
  Pe as LostAndFoundId,
  re as RootId,
  Lt as SDS_DataStore,
  Le as SDS_Entry,
  V as SDS_Error,
  zt as SDS_Item,
  Dt as SDS_Link,
  De as TrashId,
  $t as _base64ToUint8Array,
  Ue as _uint8ArrayToBase64,
  Bt as checkInfoValueSize,
  Mt as expectValidInfoKey,
  Ot as expectValidLabel,
  Tt as expectValidMIMEType,
  ye as maxInfoKeyLength,
  ge as maxInfoValueSize,
  pe as maxLabelLength,
  _e as maxMIMETypeLength,
  Vt as maxOrderKeyLength
};
