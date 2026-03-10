var Bl = Object.defineProperty;
var Lo = (n) => {
  throw TypeError(n);
};
var Kl = (n, e, t) => e in n ? Bl(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var At = (n, e, t) => Kl(n, typeof e != "symbol" ? e + "" : e, t), ri = (n, e, t) => e.has(n) || Lo("Cannot " + t);
var l = (n, e, t) => (ri(n, e, "read from private field"), t ? t.call(n) : e.get(n)), _ = (n, e, t) => e.has(n) ? Lo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), x = (n, e, t, s) => (ri(n, e, "write to private field"), s ? s.call(n, t) : e.set(n, t), t), d = (n, e, t) => (ri(n, e, "access private method"), t);
var ar = (n, e, t, s) => ({
  set _(r) {
    x(n, e, r, t);
  },
  get _() {
    return l(n, e, s);
  }
});
class j extends Error {
  constructor(t, s) {
    super(s);
    At(this, "code");
    this.code = t, this.name = "SDS_Error";
  }
}
const Te = "00000000-0000-4000-8000-000000000000", G = "00000000-0000-4000-8000-000000000001", Ce = "00000000-0000-4000-8000-000000000002", Sn = "text/plain", Pl = 131072, Fl = 2048, Zl = 5e3, No = 1024, Ro = 256, Mo = 1024, Vo = 1048576, zl = 200;
function Hl(n) {
  const e = globalThis.Buffer;
  if (e != null)
    return e.from(n).toString("base64");
  let t = "";
  for (let s = 0; s < n.byteLength; s++)
    t += String.fromCharCode(n[s]);
  return btoa(t);
}
function Ka(n) {
  const e = globalThis.Buffer;
  return e != null ? new Uint8Array(e.from(n, "base64")) : Uint8Array.from(atob(n), (t) => t.charCodeAt(0));
}
var wt, $n, Ba;
let Jl = (Ba = class {
  constructor() {
    //----------------------------------------------------------------------------//
    //                          Large-value blob store                            //
    //----------------------------------------------------------------------------//
    // in-memory map holding large-value blobs (those with ValueKind
    // '*-reference'). Written by backends on writeValue and by the SyncEngine when
    // a blob arrives from the network or is loaded from persistence.
    _(this, wt, /* @__PURE__ */ new Map());
    // optional async loader injected by SDS_SyncEngine so that _readValueOf can
    // transparently fetch blobs from the persistence layer on demand.
    _(this, $n);
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
    l(this, wt).set(e, t);
  }
  /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
  async _getValueBlobAsync(e) {
    let t = l(this, wt).get(e);
    return t == null && l(this, $n) != null && (t = await l(this, $n).call(this, e), t != null && l(this, wt).set(e, t)), t;
  }
  /**** storeValueBlob — public entry point for SyncEngine ****/
  storeValueBlob(e, t) {
    l(this, wt).set(e, t);
  }
  /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
  getValueBlobByHash(e) {
    return l(this, wt).get(e);
  }
  /**** hasValueBlob — check whether a blob is already in the local cache ****/
  hasValueBlob(e) {
    return l(this, wt).has(e);
  }
  /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
  setValueBlobLoader(e) {
    x(this, $n, e);
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
        throw new j("invalid-argument", "Serialisation must be an SDS_EntryJSON object");
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
    return this._EntryAsJSON(Te);
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
    for (; s != null && (t.push(this.EntryWithId(s)), s !== Te); )
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
      h !== void 0 && (c.Value = typeof h == "string" ? h : Hl(h));
    }
    return c.innerEntries = Array.from(this._innerEntriesOf(e)).map((h) => this._EntryAsJSON(h.Id)), c;
  }
}, wt = new WeakMap(), $n = new WeakMap(), Ba);
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
var $o;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})($o || ($o = {}));
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
]), Rt = (n) => {
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
Ct.create = (n) => new Ct(n);
const Si = (n, e) => {
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
let Wl = Si;
function Gl() {
  return Wl;
}
const ql = (n) => {
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
  const t = Gl(), s = ql({
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
      t === Si ? void 0 : Si
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
}), ks = (n) => ({ status: "dirty", value: n }), Be = (n) => ({ status: "valid", value: n }), Uo = (n) => n.status === "aborted", jo = (n) => n.status === "dirty", es = (n) => n.status === "valid", wr = (n) => typeof Promise < "u" && n instanceof Promise;
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
const Bo = (n, e) => {
  if (es(e))
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
    return Rt(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Rt(e.data),
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
        parsedType: Rt(e.data),
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
      parsedType: Rt(e)
    }, r = this._parseSync({ data: e, path: s.path, parent: s });
    return Bo(s, r);
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
      parsedType: Rt(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return es(i) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => es(i) ? {
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
      parsedType: Rt(e)
    }, r = this._parse({ data: e, path: s.path, parent: s }), i = await (wr(r) ? r : Promise.resolve(r));
    return Bo(s, i);
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
    return new ss({
      schema: this,
      typeName: E.ZodEffects,
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
    return rs.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return at.create(this);
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
    return new ss({
      ...A(this._def),
      schema: this,
      typeName: E.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ei({
      ...A(this._def),
      innerType: this,
      defaultValue: t,
      typeName: E.ZodDefault
    });
  }
  brand() {
    return new _h({
      typeName: E.ZodBranded,
      type: this,
      ...A(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ti({
      ...A(this._def),
      innerType: this,
      catchValue: t,
      typeName: E.ZodCatch
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
    return io.create(this, e);
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
const Yl = /^c[^\s-]{8,}$/i, Xl = /^[0-9a-z]+$/, Ql = /^[0-9A-HJKMNP-TV-Z]{26}$/i, eh = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, th = /^[a-z0-9_-]{21}$/i, nh = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, sh = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, rh = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, ih = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ii;
const oh = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ah = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, ch = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, lh = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, hh = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, uh = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Pa = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", dh = new RegExp(`^${Pa}$`);
function Fa(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function fh(n) {
  return new RegExp(`^${Fa(n)}$`);
}
function gh(n) {
  let e = `${Pa}T${Fa(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function ph(n, e) {
  return !!((e === "v4" || !e) && oh.test(n) || (e === "v6" || !e) && ch.test(n));
}
function mh(n, e) {
  if (!nh.test(n))
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
function yh(n, e) {
  return !!((e === "v4" || !e) && ah.test(n) || (e === "v6" || !e) && lh.test(n));
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
        rh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "emoji")
        ii || (ii = new RegExp(ih, "u")), ii.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "uuid")
        eh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "nanoid")
        th.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid")
        Yl.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid2")
        Xl.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "ulid")
        Ql.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
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
      }), s.dirty()) : i.kind === "datetime" ? gh(i).test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), s.dirty()) : i.kind === "date" ? dh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), s.dirty()) : i.kind === "time" ? fh(i).test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), s.dirty()) : i.kind === "duration" ? sh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "ip" ? ph(e.data, i.version) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "jwt" ? mh(e.data, i.alg) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "cidr" ? yh(e.data, i.version) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64" ? hh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64url" ? uh.test(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
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
  typeName: E.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
function wh(n, e) {
  const t = (n.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, r = t > s ? t : s, i = Number.parseInt(n.toFixed(r).replace(".", "")), o = Number.parseInt(e.toFixed(r).replace(".", ""));
  return i % o / 10 ** r;
}
class ts extends M {
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
      }), r.dirty()) : i.kind === "multipleOf" ? wh(e.data, i.value) !== 0 && (s = this._getOrReturnCtx(e, s), v(s, {
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
    return new ts({
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
    return new ts({
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
ts.create = (n) => new ts({
  checks: [],
  typeName: E.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class As extends M {
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
    return new As({
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
    return new As({
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
As.create = (n) => new As({
  checks: [],
  typeName: E.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...A(n)
});
class Ko extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== k.boolean) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.boolean,
        received: s.parsedType
      }), C;
    }
    return Be(e.data);
  }
}
Ko.create = (n) => new Ko({
  typeName: E.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...A(n)
});
class _r extends M {
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
    return new _r({
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
_r.create = (n) => new _r({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: E.ZodDate,
  ...A(n)
});
class Po extends M {
  _parse(e) {
    if (this._getType(e) !== k.symbol) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.symbol,
        received: s.parsedType
      }), C;
    }
    return Be(e.data);
  }
}
Po.create = (n) => new Po({
  typeName: E.ZodSymbol,
  ...A(n)
});
class xi extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.undefined,
        received: s.parsedType
      }), C;
    }
    return Be(e.data);
  }
}
xi.create = (n) => new xi({
  typeName: E.ZodUndefined,
  ...A(n)
});
class Fo extends M {
  _parse(e) {
    if (this._getType(e) !== k.null) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.null,
        received: s.parsedType
      }), C;
    }
    return Be(e.data);
  }
}
Fo.create = (n) => new Fo({
  typeName: E.ZodNull,
  ...A(n)
});
class Ds extends M {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Be(e.data);
  }
}
Ds.create = (n) => new Ds({
  typeName: E.ZodAny,
  ...A(n)
});
class Ii extends M {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Be(e.data);
  }
}
Ii.create = (n) => new Ii({
  typeName: E.ZodUnknown,
  ...A(n)
});
class Gt extends M {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return v(t, {
      code: y.invalid_type,
      expected: k.never,
      received: t.parsedType
    }), C;
  }
}
Gt.create = (n) => new Gt({
  typeName: E.ZodNever,
  ...A(n)
});
class Zo extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const s = this._getOrReturnCtx(e);
      return v(s, {
        code: y.invalid_type,
        expected: k.void,
        received: s.parsedType
      }), C;
    }
    return Be(e.data);
  }
}
Zo.create = (n) => new Zo({
  typeName: E.ZodVoid,
  ...A(n)
});
class at extends M {
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
  typeName: E.ZodArray,
  ...A(e)
});
function xn(n) {
  if (n instanceof Q) {
    const e = {};
    for (const t in n.shape) {
      const s = n.shape[t];
      e[t] = Ht.create(xn(s));
    }
    return new Q({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof at ? new at({
    ...n._def,
    type: xn(n.element)
  }) : n instanceof Ht ? Ht.create(xn(n.unwrap())) : n instanceof rs ? rs.create(xn(n.unwrap())) : n instanceof fn ? fn.create(n.items.map((e) => xn(e))) : n;
}
class Q extends M {
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
    if (!(this._def.catchall instanceof Gt && this._def.unknownKeys === "strip"))
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
    if (this._def.catchall instanceof Gt) {
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
    return b.errToObj, new Q({
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
    return new Q({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new Q({
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
    return new Q({
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
    return new Q({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: E.ZodObject
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
    return new Q({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of V.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new Q({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of V.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new Q({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return xn(this);
  }
  partial(e) {
    const t = {};
    for (const s of V.objectKeys(this.shape)) {
      const r = this.shape[s];
      e && !e[s] ? t[s] = r : t[s] = r.optional();
    }
    return new Q({
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
    return new Q({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Za(V.objectKeys(this.shape));
  }
}
Q.create = (n, e) => new Q({
  shape: () => n,
  unknownKeys: "strip",
  catchall: Gt.create(),
  typeName: E.ZodObject,
  ...A(e)
});
Q.strictCreate = (n, e) => new Q({
  shape: () => n,
  unknownKeys: "strict",
  catchall: Gt.create(),
  typeName: E.ZodObject,
  ...A(e)
});
Q.lazycreate = (n, e) => new Q({
  shape: n,
  unknownKeys: "strip",
  catchall: Gt.create(),
  typeName: E.ZodObject,
  ...A(e)
});
class vr extends M {
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
      const a = o.map((c) => new Ct(c));
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
vr.create = (n, e) => new vr({
  options: n,
  typeName: E.ZodUnion,
  ...A(e)
});
function Ci(n, e) {
  const t = Rt(n), s = Rt(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === k.object && s === k.object) {
    const r = V.objectKeys(e), i = V.objectKeys(n).filter((a) => r.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of i) {
      const c = Ci(n[a], e[a]);
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
      const o = n[i], a = e[i], c = Ci(o, a);
      if (!c.valid)
        return { valid: !1 };
      r.push(c.data);
    }
    return { valid: !0, data: r };
  } else return t === k.date && s === k.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class kr extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), r = (i, o) => {
      if (Uo(i) || Uo(o))
        return C;
      const a = Ci(i.value, o.value);
      return a.valid ? ((jo(i) || jo(o)) && t.dirty(), { status: t.value, value: a.data }) : (v(s, {
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
kr.create = (n, e, t) => new kr({
  left: n,
  right: e,
  typeName: E.ZodIntersection,
  ...A(t)
});
class fn extends M {
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
    typeName: E.ZodTuple,
    rest: null,
    ...A(e)
  });
};
class zo extends M {
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
zo.create = (n, e, t) => new zo({
  valueType: e,
  keyType: n,
  typeName: E.ZodMap,
  ...A(t)
});
class Ls extends M {
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
    return new Ls({
      ...this._def,
      minSize: { value: e, message: b.toString(t) }
    });
  }
  max(e, t) {
    return new Ls({
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
Ls.create = (n, e) => new Ls({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: E.ZodSet,
  ...A(e)
});
class Ho extends M {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ho.create = (n, e) => new Ho({
  getter: n,
  typeName: E.ZodLazy,
  ...A(e)
});
class Jo extends M {
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
Jo.create = (n, e) => new Jo({
  value: n,
  typeName: E.ZodLiteral,
  ...A(e)
});
function Za(n, e) {
  return new ns({
    values: n,
    typeName: E.ZodEnum,
    ...A(e)
  });
}
class ns extends M {
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
    return Be(e.data);
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
    return ns.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return ns.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
ns.create = Za;
class Wo extends M {
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
    return Be(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Wo.create = (n, e) => new Wo({
  values: n,
  typeName: E.ZodNativeEnum,
  ...A(e)
});
class br extends M {
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
    return Be(s.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
br.create = (n, e) => new br({
  type: n,
  typeName: E.ZodPromise,
  ...A(e)
});
class ss extends M {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === E.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
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
          return c.status === "aborted" ? C : c.status === "dirty" || t.value === "dirty" ? ks(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return C;
        const a = this._def.schema._parseSync({
          data: o,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? C : a.status === "dirty" || t.value === "dirty" ? ks(a.value) : a;
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
        if (!es(o))
          return C;
        const a = r.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => es(o) ? Promise.resolve(r.transform(o.value, i)).then((a) => ({
          status: t.value,
          value: a
        })) : C);
    V.assertNever(r);
  }
}
ss.create = (n, e, t) => new ss({
  schema: n,
  typeName: E.ZodEffects,
  effect: e,
  ...A(t)
});
ss.createWithPreprocess = (n, e, t) => new ss({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: E.ZodEffects,
  ...A(t)
});
class Ht extends M {
  _parse(e) {
    return this._getType(e) === k.undefined ? Be(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ht.create = (n, e) => new Ht({
  innerType: n,
  typeName: E.ZodOptional,
  ...A(e)
});
class rs extends M {
  _parse(e) {
    return this._getType(e) === k.null ? Be(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
rs.create = (n, e) => new rs({
  innerType: n,
  typeName: E.ZodNullable,
  ...A(e)
});
class Ei extends M {
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
Ei.create = (n, e) => new Ei({
  innerType: n,
  typeName: E.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...A(e)
});
class Ti extends M {
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
    return wr(r) ? r.then((i) => ({
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
Ti.create = (n, e) => new Ti({
  innerType: n,
  typeName: E.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...A(e)
});
class Go extends M {
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
Go.create = (n) => new Go({
  typeName: E.ZodNaN,
  ...A(n)
});
class _h extends M {
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
class io extends M {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return i.status === "aborted" ? C : i.status === "dirty" ? (t.dirty(), ks(i.value)) : this._def.out._parseAsync({
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
    return new io({
      in: e,
      out: t,
      typeName: E.ZodPipeline
    });
  }
}
class Oi extends M {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (r) => (es(r) && (r.value = Object.freeze(r.value)), r);
    return wr(t) ? t.then((r) => s(r)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Oi.create = (n, e) => new Oi({
  innerType: n,
  typeName: E.ZodReadonly,
  ...A(e)
});
function qo(n, e) {
  const t = typeof n == "function" ? n(e) : typeof n == "string" ? { message: n } : n;
  return typeof t == "string" ? { message: t } : t;
}
function vh(n, e = {}, t) {
  return n ? Ds.create().superRefine((s, r) => {
    const i = n(s);
    if (i instanceof Promise)
      return i.then((o) => {
        if (!o) {
          const a = qo(e, s), c = a.fatal ?? t ?? !0;
          r.addIssue({ code: "custom", ...a, fatal: c });
        }
      });
    if (!i) {
      const o = qo(e, s), a = o.fatal ?? t ?? !0;
      r.addIssue({ code: "custom", ...o, fatal: a });
    }
  }) : Ds.create();
}
var E;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(E || (E = {}));
const kh = (n, e = {
  message: `Input not instance of ${n.name}`
}) => vh((t) => t instanceof n, e), Xs = Zt.create, za = ts.create, bh = xi.create;
Ds.create;
const Sh = Ii.create;
Gt.create;
at.create;
const xh = vr.create;
kr.create;
fn.create;
ns.create;
br.create;
Ht.create;
rs.create;
function jr(n, e) {
  var r;
  const t = n.safeParse(e);
  if (t.success)
    return t.data;
  const s = ((r = t.error.issues[0]) == null ? void 0 : r.message) ?? "invalid argument";
  throw new j("invalid-argument", s);
}
const Ih = Xs({
  invalid_type_error: "Label must be a string"
}).max(No, `Label must not exceed ${No} characters`), Ch = Xs({
  invalid_type_error: "MIMEType must be a non-empty string"
}).min(1, "MIMEType must be a non-empty string").max(Ro, `MIMEType must not exceed ${Ro} characters`), Eh = Xs({
  invalid_type_error: "Info key must be a string"
}).min(1, "Info key must not be empty").max(Mo, `Info key must not exceed ${Mo} characters`), Th = Sh().superRefine((n, e) => {
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
  new TextEncoder().encode(t).length > Vo && e.addIssue({
    code: y.custom,
    message: `Info value must not exceed ${Vo} bytes when serialised as UTF-8 JSON`
  });
});
function Ha(n) {
  jr(Ih, n);
}
function Ai(n) {
  jr(Ch, n);
}
function Oh(n) {
  jr(Eh, n);
}
function Ah(n) {
  jr(Th, n);
}
class Ja {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
  get isRootItem() {
    return this.Id === Te;
  }
  get isTrashItem() {
    return this.Id === G;
  }
  get isLostAndFoundItem() {
    return this.Id === Ce;
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
    Ha(e), this._Store._setLabelOf(this.Id, e);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    if (e == null) throw new j("invalid-argument", "outerItem must not be missing");
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    if (e == null) throw new j("invalid-argument", "outerItem must not be missing");
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
const Dh = xh(
  [Xs(), kh(Uint8Array), bh()],
  { invalid_type_error: "Value must be a string, a Uint8Array, or undefined" }
), Yo = za({
  invalid_type_error: "index must be a number"
}).int("index must be an integer").nonnegative("index must be a non-negative integer"), Lh = Xs({
  invalid_type_error: "Replacement must be a string"
});
function oi(n, e, t) {
  var i;
  const s = n.safeParse(e);
  if (s.success)
    return s.data;
  const r = (t ? `${t}: ` : "") + (((i = s.error.issues[0]) == null ? void 0 : i.message) ?? "invalid argument");
  throw new j("invalid-argument", r);
}
class Xo extends Ja {
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
    Ai(e), this._Store._setTypeOf(this.Id, e);
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
    oi(Dh, e), this._Store._writeValueOf(this.Id, e);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(e, t, s) {
    if (oi(Yo, e, "fromIndex"), !Yo.safeParse(t).success || t < e)
      throw new j("invalid-argument", "toIndex must be an integer ≥ fromIndex");
    oi(Lh, s, "Replacement"), this._Store._spliceValueOf(this.Id, e, t, s);
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
class Qo extends Ja {
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
const qe = () => /* @__PURE__ */ new Map(), Di = (n) => {
  const e = qe();
  return n.forEach((t, s) => {
    e.set(s, t);
  }), e;
}, Qt = (n, e, t) => {
  let s = n.get(e);
  return s === void 0 && n.set(e, s = t()), s;
}, Nh = (n, e) => {
  const t = [];
  for (const [s, r] of n)
    t.push(e(r, s));
  return t;
}, Rh = (n, e) => {
  for (const [t, s] of n)
    if (e(s, t))
      return !0;
  return !1;
}, is = () => /* @__PURE__ */ new Set(), ai = (n) => n[n.length - 1], Mh = (n, e) => {
  for (let t = 0; t < e.length; t++)
    n.push(e[t]);
}, qt = Array.from, oo = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (!e(n[t], t, n))
      return !1;
  return !0;
}, Wa = (n, e) => {
  for (let t = 0; t < n.length; t++)
    if (e(n[t], t, n))
      return !0;
  return !1;
}, Vh = (n, e) => {
  const t = new Array(n);
  for (let s = 0; s < n; s++)
    t[s] = e(s, t);
  return t;
}, Br = Array.isArray;
class $h {
  constructor() {
    this._observers = qe();
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
      is
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
    return qt((this._observers.get(e) || qe()).values()).forEach((s) => s(...t));
  }
  destroy() {
    this._observers = qe();
  }
}
const lt = Math.floor, dr = Math.abs, Ga = (n, e) => n < e ? n : e, yn = (n, e) => n > e ? n : e, qa = (n) => n !== 0 ? n < 0 : 1 / n < 0, ea = 1, ta = 2, ci = 4, li = 8, Ns = 32, It = 64, Re = 128, Kr = 31, Li = 63, dn = 127, Uh = 2147483647, Sr = Number.MAX_SAFE_INTEGER, na = Number.MIN_SAFE_INTEGER, jh = Number.isInteger || ((n) => typeof n == "number" && isFinite(n) && lt(n) === n), Bh = String.fromCharCode, Kh = (n) => n.toLowerCase(), Ph = /^\s*/g, Fh = (n) => n.replace(Ph, ""), Zh = /([A-Z])/g, sa = (n, e) => Fh(n.replace(Zh, (t) => `${e}${Kh(t)}`)), zh = (n) => {
  const e = unescape(encodeURIComponent(n)), t = e.length, s = new Uint8Array(t);
  for (let r = 0; r < t; r++)
    s[r] = /** @type {number} */
    e.codePointAt(r);
  return s;
}, Rs = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), Hh = (n) => Rs.encode(n), Jh = Rs ? Hh : zh;
let Os = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
Os && Os.decode(new Uint8Array()).length === 1 && (Os = null);
const Wh = (n, e) => Vh(e, () => n).join("");
class Qs {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const Pr = () => new Qs(), Gh = (n) => {
  let e = n.cpos;
  for (let t = 0; t < n.bufs.length; t++)
    e += n.bufs[t].length;
  return e;
}, ot = (n) => {
  const e = new Uint8Array(Gh(n));
  let t = 0;
  for (let s = 0; s < n.bufs.length; s++) {
    const r = n.bufs[s];
    e.set(r, t), t += r.length;
  }
  return e.set(new Uint8Array(n.cbuf.buffer, 0, n.cpos), t), e;
}, qh = (n, e) => {
  const t = n.cbuf.length;
  t - n.cpos < e && (n.bufs.push(new Uint8Array(n.cbuf.buffer, 0, n.cpos)), n.cbuf = new Uint8Array(yn(t, e) * 2), n.cpos = 0);
}, se = (n, e) => {
  const t = n.cbuf.length;
  n.cpos === t && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(t * 2), n.cpos = 0), n.cbuf[n.cpos++] = e;
}, Ni = se, D = (n, e) => {
  for (; e > dn; )
    se(n, Re | dn & e), e = lt(e / 128);
  se(n, dn & e);
}, ao = (n, e) => {
  const t = qa(e);
  for (t && (e = -e), se(n, (e > Li ? Re : 0) | (t ? It : 0) | Li & e), e = lt(e / 64); e > 0; )
    se(n, (e > dn ? Re : 0) | dn & e), e = lt(e / 128);
}, Ri = new Uint8Array(3e4), Yh = Ri.length / 3, Xh = (n, e) => {
  if (e.length < Yh) {
    const t = Rs.encodeInto(e, Ri).written || 0;
    D(n, t);
    for (let s = 0; s < t; s++)
      se(n, Ri[s]);
  } else
    Oe(n, Jh(e));
}, Qh = (n, e) => {
  const t = unescape(encodeURIComponent(e)), s = t.length;
  D(n, s);
  for (let r = 0; r < s; r++)
    se(
      n,
      /** @type {number} */
      t.codePointAt(r)
    );
}, Ln = Rs && /** @type {any} */
Rs.encodeInto ? Xh : Qh, Fr = (n, e) => {
  const t = n.cbuf.length, s = n.cpos, r = Ga(t - s, e.length), i = e.length - r;
  n.cbuf.set(e.subarray(0, r), s), n.cpos += r, i > 0 && (n.bufs.push(n.cbuf), n.cbuf = new Uint8Array(yn(t * 2, i)), n.cbuf.set(e.subarray(r)), n.cpos = i);
}, Oe = (n, e) => {
  D(n, e.byteLength), Fr(n, e);
}, co = (n, e) => {
  qh(n, e);
  const t = new DataView(n.cbuf.buffer, n.cpos, e);
  return n.cpos += e, t;
}, eu = (n, e) => co(n, 4).setFloat32(0, e, !1), tu = (n, e) => co(n, 8).setFloat64(0, e, !1), nu = (n, e) => (
  /** @type {any} */
  co(n, 8).setBigInt64(0, e, !1)
), ra = new DataView(new ArrayBuffer(4)), su = (n) => (ra.setFloat32(0, n), ra.getFloat32(0) === n), Ms = (n, e) => {
  switch (typeof e) {
    case "string":
      se(n, 119), Ln(n, e);
      break;
    case "number":
      jh(e) && dr(e) <= Uh ? (se(n, 125), ao(n, e)) : su(e) ? (se(n, 124), eu(n, e)) : (se(n, 123), tu(n, e));
      break;
    case "bigint":
      se(n, 122), nu(n, e);
      break;
    case "object":
      if (e === null)
        se(n, 126);
      else if (Br(e)) {
        se(n, 117), D(n, e.length);
        for (let t = 0; t < e.length; t++)
          Ms(n, e[t]);
      } else if (e instanceof Uint8Array)
        se(n, 116), Oe(n, e);
      else {
        se(n, 118);
        const t = Object.keys(e);
        D(n, t.length);
        for (let s = 0; s < t.length; s++) {
          const r = t[s];
          Ln(n, r), Ms(n, e[r]);
        }
      }
      break;
    case "boolean":
      se(n, e ? 120 : 121);
      break;
    default:
      se(n, 127);
  }
};
class ia extends Qs {
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
const oa = (n) => {
  n.count > 0 && (ao(n.encoder, n.count === 1 ? n.s : -n.s), n.count > 1 && D(n.encoder, n.count - 2));
};
class fr {
  constructor() {
    this.encoder = new Qs(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (oa(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return oa(this), ot(this.encoder);
  }
}
const aa = (n) => {
  if (n.count > 0) {
    const e = n.diff * 2 + (n.count === 1 ? 0 : 1);
    ao(n.encoder, e), n.count > 1 && D(n.encoder, n.count - 2);
  }
};
class hi {
  constructor() {
    this.encoder = new Qs(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (aa(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return aa(this), ot(this.encoder);
  }
}
class ru {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new fr();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new Qs();
    return this.sarr.push(this.s), this.s = "", Ln(e, this.sarr.join("")), Fr(e, this.lensE.toUint8Array()), ot(e);
  }
}
const ht = (n) => new Error(n), Ye = () => {
  throw ht("Method unimplemented");
}, je = () => {
  throw ht("Unexpected case");
}, Ya = ht("Unexpected end of array"), Xa = ht("Integer out of Range");
class Zr {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const hs = (n) => new Zr(n), iu = (n) => n.pos !== n.arr.length, ou = (n, e) => {
  const t = new Uint8Array(n.arr.buffer, n.pos + n.arr.byteOffset, e);
  return n.pos += e, t;
}, Ae = (n) => ou(n, O(n)), os = (n) => n.arr[n.pos++], O = (n) => {
  let e = 0, t = 1;
  const s = n.arr.length;
  for (; n.pos < s; ) {
    const r = n.arr[n.pos++];
    if (e = e + (r & dn) * t, t *= 128, r < Re)
      return e;
    if (e > Sr)
      throw Xa;
  }
  throw Ya;
}, lo = (n) => {
  let e = n.arr[n.pos++], t = e & Li, s = 64;
  const r = (e & It) > 0 ? -1 : 1;
  if ((e & Re) === 0)
    return r * t;
  const i = n.arr.length;
  for (; n.pos < i; ) {
    if (e = n.arr[n.pos++], t = t + (e & dn) * s, s *= 128, e < Re)
      return r * t;
    if (t > Sr)
      throw Xa;
  }
  throw Ya;
}, au = (n) => {
  let e = O(n);
  if (e === 0)
    return "";
  {
    let t = String.fromCodePoint(os(n));
    if (--e < 100)
      for (; e--; )
        t += String.fromCodePoint(os(n));
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
}, cu = (n) => (
  /** @type any */
  Os.decode(Ae(n))
), Nn = Os ? cu : au, ho = (n, e) => {
  const t = new DataView(n.arr.buffer, n.arr.byteOffset + n.pos, e);
  return n.pos += e, t;
}, lu = (n) => ho(n, 4).getFloat32(0, !1), hu = (n) => ho(n, 8).getFloat64(0, !1), uu = (n) => (
  /** @type {any} */
  ho(n, 8).getBigInt64(0, !1)
), du = [
  (n) => {
  },
  // CASE 127: undefined
  (n) => null,
  // CASE 126: null
  lo,
  // CASE 125: integer
  lu,
  // CASE 124: float32
  hu,
  // CASE 123: float64
  uu,
  // CASE 122: bigint
  (n) => !1,
  // CASE 121: boolean (false)
  (n) => !0,
  // CASE 120: boolean (true)
  Nn,
  // CASE 119: string
  (n) => {
    const e = O(n), t = {};
    for (let s = 0; s < e; s++) {
      const r = Nn(n);
      t[r] = Vs(n);
    }
    return t;
  },
  (n) => {
    const e = O(n), t = [];
    for (let s = 0; s < e; s++)
      t.push(Vs(n));
    return t;
  },
  Ae
  // CASE 116: Uint8Array
], Vs = (n) => du[127 - os(n)](n);
class ca extends Zr {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, t) {
    super(e), this.reader = t, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), iu(this) ? this.count = O(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class gr extends Zr {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = lo(this);
      const e = qa(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = O(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class ui extends Zr {
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
      const e = lo(this), t = e & 1;
      this.diff = lt(e / 2), this.count = 1, t && (this.count = O(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class fu {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new gr(e), this.str = Nn(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
    return this.spos = e, t;
  }
}
const gu = crypto.getRandomValues.bind(crypto), Qa = () => gu(new Uint32Array(1))[0], pu = "10000000-1000-4000-8000" + -1e11, mu = () => pu.replace(
  /[018]/g,
  /** @param {number} c */
  (n) => (n ^ Qa() & 15 >> n / 4).toString(16)
), la = (n) => (
  /** @type {Promise<T>} */
  new Promise(n)
);
Promise.all.bind(Promise);
const ha = (n) => n === void 0 ? null : n;
class yu {
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
let ec = new yu(), wu = !0;
try {
  typeof localStorage < "u" && localStorage && (ec = localStorage, wu = !1);
} catch {
}
const _u = ec, $s = Symbol("Equality"), tc = (n, e) => {
  var t;
  return n === e || !!((t = n == null ? void 0 : n[$s]) != null && t.call(n, e)) || !1;
}, vu = (n) => typeof n == "object", ku = Object.assign, bu = Object.keys, Su = (n, e) => {
  for (const t in n)
    e(n[t], t);
}, xr = (n) => bu(n).length, xu = (n) => {
  for (const e in n)
    return !1;
  return !0;
}, er = (n, e) => {
  for (const t in n)
    if (!e(n[t], t))
      return !1;
  return !0;
}, uo = (n, e) => Object.prototype.hasOwnProperty.call(n, e), Iu = (n, e) => n === e || xr(n) === xr(e) && er(n, (t, s) => (t !== void 0 || uo(e, s)) && tc(e[s], t)), Cu = Object.freeze, nc = (n) => {
  for (const e in n) {
    const t = n[e];
    (typeof t == "object" || typeof t == "function") && nc(n[e]);
  }
  return Cu(n);
}, fo = (n, e, t = 0) => {
  try {
    for (; t < n.length; t++)
      n[t](...e);
  } finally {
    t < n.length && fo(n, e, t + 1);
  }
}, Eu = (n) => n, pr = (n, e) => {
  if (n === e)
    return !0;
  if (n == null || e == null || n.constructor !== e.constructor && (n.constructor || Object) !== (e.constructor || Object))
    return !1;
  if (n[$s] != null)
    return n[$s](e);
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
        if (!e.has(t) || !pr(n.get(t), e.get(t)))
          return !1;
      break;
    }
    case void 0:
    case Object:
      if (xr(n) !== xr(e))
        return !1;
      for (const t in n)
        if (!uo(n, t) || !pr(n[t], e[t]))
          return !1;
      break;
    case Array:
      if (n.length !== e.length)
        return !1;
      for (let t = 0; t < n.length; t++)
        if (!pr(n[t], e[t]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, Tu = (n, e) => e.includes(n), Us = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let Qe;
const Ou = () => {
  if (Qe === void 0)
    if (Us) {
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
        Qe.set(`--${sa(e, "-")}`, t), Qe.set(`-${sa(e, "-")}`, t);
      }
    })) : Qe = qe();
  return Qe;
}, Mi = (n) => Ou().has(n), Ir = (n) => ha(Us ? process.env[n.toUpperCase().replaceAll("-", "_")] : _u.getItem(n)), sc = (n) => Mi("--" + n) || Ir(n) !== null, Au = sc("production"), Du = Us && Tu(process.env.FORCE_COLOR, ["true", "1", "2"]), Lu = Du || !Mi("--no-colors") && // @todo deprecate --no-colors
!sc("no-color") && (!Us || process.stdout.isTTY) && (!Us || Mi("--color") || Ir("COLORTERM") !== null || (Ir("TERM") || "").includes("color")), Nu = (n) => new Uint8Array(n), Ru = (n) => {
  const e = Nu(n.byteLength);
  return e.set(n), e;
};
class Mu {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, t) {
    this.left = e, this.right = t;
  }
}
const gt = (n, e) => new Mu(n, e), ua = (n) => n.next() >= 0.5, di = (n, e, t) => lt(n.next() * (t + 1 - e) + e), rc = (n, e, t) => lt(n.next() * (t + 1 - e) + e), go = (n, e, t) => rc(n, e, t), Vu = (n) => Bh(go(n, 97, 122)), $u = (n, e = 0, t = 20) => {
  const s = go(n, e, t);
  let r = "";
  for (let i = 0; i < s; i++)
    r += Vu(n);
  return r;
}, fi = (n, e) => e[go(n, 0, e.length - 1)], Uu = Symbol("0schema");
class ju {
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
      e.push(Wh(" ", (this._rerrs.length - t) * 2) + `${s.path != null ? `[${s.path}] ` : ""}${s.has} doesn't match ${s.expected}. ${s.message}`);
    }
    return e.join(`
`);
  }
}
const Vi = (n, e) => n === e ? !0 : n == null || e == null || n.constructor !== e.constructor ? !1 : n[$s] ? tc(n, e) : Br(n) ? oo(
  n,
  (t) => Wa(e, (s) => Vi(t, s))
) : vu(n) ? er(
  n,
  (t, s) => Vi(t, e[s])
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
      this.constructor._dilutes && ([s, t] = [t, s]), Vi(t, s)
    );
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(e) {
    return this.constructor === e.constructor && pr(this.shape, e.shape);
  }
  [Uu]() {
    return !0;
  }
  /**
   * @param {object} other
   */
  [$s](e) {
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
    return us(this, Gr);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new ac(
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
    return da(e, this), /** @type {any} */
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
    return da(e, this), e;
  }
}
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
At(ye, "_dilutes", !1);
class po extends ye {
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
const Y = (n, e = null) => new po(n, e);
Y(po);
class mo extends ye {
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
const ie = (n) => new mo(n);
Y(mo);
class zr extends ye {
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
const Hr = (...n) => new zr(n), ic = Y(zr), Bu = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((n) => n.replace(/[().|&,$^[\]]/g, (e) => "\\" + e))
), oc = (n) => {
  if (as.check(n))
    return [Bu(n)];
  if (ic.check(n))
    return (
      /** @type {Array<string|number>} */
      n.shape.map((e) => e + "")
    );
  if (mc.check(n))
    return ["[+-]?\\d+.?\\d*"];
  if (yc.check(n))
    return [".*"];
  if (Er.check(n))
    return n.shape.map(oc).flat(1);
  je();
};
class Ku extends ye {
  /**
   * @param {T} shape
   */
  constructor(e) {
    super(), this.shape = e, this._r = new RegExp("^" + e.map(oc).map((t) => `(${t.join("|")})`).join("") + "$");
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
Y(Ku);
const Pu = Symbol("optional");
class ac extends ye {
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
  get [Pu]() {
    return !0;
  }
}
const Fu = Y(ac);
class Zu extends ye {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(e, t) {
    return t == null || t.extend(null, "never", typeof e), !1;
  }
}
Y(Zu);
const $r = class $r extends ye {
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
    return new $r(this.shape, !0);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(e, t) {
    return e == null ? (t == null || t.extend(null, "object", "null"), !1) : er(this.shape, (s, r) => {
      const i = this._isPartial && !uo(e, r) || s.check(e[r], t);
      return !i && (t == null || t.extend(r.toString(), s.toString(), typeof e[r], "Object property does not match")), i;
    });
  }
};
At($r, "_dilutes", !0);
let Cr = $r;
const zu = (n) => (
  /** @type {any} */
  new Cr(n)
), Hu = Y(Cr), Ju = ie((n) => n != null && (n.constructor === Object || n.constructor == null));
class cc extends ye {
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
    return e != null && er(e, (s, r) => {
      const i = this.shape.keys.check(r, t);
      return !i && (t == null || t.extend(r + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value")), i && this.shape.values.check(s, t);
    });
  }
}
const lc = (n, e) => new cc(n, e), Wu = Y(cc);
class hc extends ye {
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
    return e != null && er(this.shape, (s, r) => {
      const i = (
        /** @type {Schema<any>} */
        s.check(e[r], t)
      );
      return !i && (t == null || t.extend(r.toString(), "Tuple", typeof s)), i;
    });
  }
}
const Gu = (...n) => new hc(n);
Y(hc);
class uc extends ye {
  /**
   * @param {Array<S>} v
   */
  constructor(e) {
    super(), this.shape = e.length === 1 ? e[0] : new Jr(e);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(e, t) {
    const s = Br(e) && oo(e, (r) => this.shape.check(r));
    return !s && (t == null || t.extend(null, "Array", "")), s;
  }
}
const dc = (...n) => new uc(n), qu = Y(uc), Yu = ie((n) => Br(n));
class fc extends ye {
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
const Xu = (n, e = null) => new fc(n, e);
Y(fc);
const Qu = Xu(ye);
class ed extends ye {
  /**
   * @param {Args} args
   */
  constructor(e) {
    super(), this.len = e.length - 1, this.args = Gu(...e.slice(-1)), this.res = e[this.len];
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
const td = Y(ed), nd = ie((n) => typeof n == "function");
class sd extends ye {
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
    const s = oo(this.shape, (r) => r.check(e, t));
    return !s && (t == null || t.extend(null, "Intersectinon", typeof e)), s;
  }
}
Y(sd, (n) => n.shape.length > 0);
class Jr extends ye {
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
    const s = Wa(this.shape, (r) => r.check(e, t));
    return t == null || t.extend(null, "Union", typeof e), s;
  }
}
At(Jr, "_dilutes", !0);
const us = (...n) => n.findIndex((e) => Er.check(e)) >= 0 ? us(...n.map((e) => js(e)).map((e) => Er.check(e) ? e.shape : [e]).flat(1)) : n.length === 1 ? n[0] : new Jr(n), Er = (
  /** @type {Schema<$Union<any>>} */
  Y(Jr)
), gc = () => !0, Tr = ie(gc), rd = (
  /** @type {Schema<Schema<any>>} */
  Y(mo, (n) => n.shape === gc)
), yo = ie((n) => typeof n == "bigint"), id = (
  /** @type {Schema<Schema<BigInt>>} */
  ie((n) => n === yo)
), pc = ie((n) => typeof n == "symbol");
ie((n) => n === pc);
const Rn = ie((n) => typeof n == "number"), mc = (
  /** @type {Schema<Schema<number>>} */
  ie((n) => n === Rn)
), as = ie((n) => typeof n == "string"), yc = (
  /** @type {Schema<Schema<string>>} */
  ie((n) => n === as)
), Wr = ie((n) => typeof n == "boolean"), od = (
  /** @type {Schema<Schema<Boolean>>} */
  ie((n) => n === Wr)
), wc = Hr(void 0);
Y(zr, (n) => n.shape.length === 1 && n.shape[0] === void 0);
Hr(void 0);
const Gr = Hr(null), ad = (
  /** @type {Schema<Schema<null>>} */
  Y(zr, (n) => n.shape.length === 1 && n.shape[0] === null)
);
Y(Uint8Array);
Y(po, (n) => n.shape === Uint8Array);
const cd = us(Rn, as, Gr, wc, yo, Wr, pc);
(() => {
  const n = (
    /** @type {$Array<$any>} */
    dc(Tr)
  ), e = (
    /** @type {$Record<$string,$any>} */
    lc(as, Tr)
  ), t = us(Rn, as, Gr, Wr, n, e);
  return n.shape = t, e.shape.values = t, t;
})();
const js = (n) => {
  if (Qu.check(n))
    return (
      /** @type {any} */
      n
    );
  if (Ju.check(n)) {
    const e = {};
    for (const t in n)
      e[t] = js(n[t]);
    return (
      /** @type {any} */
      zu(e)
    );
  } else {
    if (Yu.check(n))
      return (
        /** @type {any} */
        us(...n.map(js))
      );
    if (cd.check(n))
      return (
        /** @type {any} */
        Hr(n)
      );
    if (nd.check(n))
      return (
        /** @type {any} */
        Y(
          /** @type {any} */
          n
        )
      );
  }
  je();
}, da = Au ? () => {
} : (n, e) => {
  const t = new ju();
  if (!e.check(n, t))
    throw ht(`Expected value to be of type ${e.constructor.name}.
${t.toString()}`);
};
class ld {
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
    return this.patterns.push({ if: js(e), h: t }), this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(e) {
    return this.if(Tr, e);
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
const hd = (n) => new ld(
  /** @type {any} */
  n
), _c = (
  /** @type {any} */
  hd(
    /** @type {Schema<prng.PRNG>} */
    Tr
  ).if(mc, (n, e) => di(e, na, Sr)).if(yc, (n, e) => $u(e)).if(od, (n, e) => ua(e)).if(id, (n, e) => BigInt(di(e, na, Sr))).if(Er, (n, e) => bn(e, fi(e, n.shape))).if(Hu, (n, e) => {
    const t = {};
    for (const s in n.shape) {
      let r = n.shape[s];
      if (Fu.check(r)) {
        if (ua(e))
          continue;
        r = r.shape;
      }
      t[s] = _c(r, e);
    }
    return t;
  }).if(qu, (n, e) => {
    const t = [], s = rc(e, 0, 42);
    for (let r = 0; r < s; r++)
      t.push(bn(e, n.shape));
    return t;
  }).if(ic, (n, e) => fi(e, n.shape)).if(ad, (n, e) => null).if(td, (n, e) => {
    const t = bn(e, n.res);
    return () => t;
  }).if(rd, (n, e) => bn(e, fi(e, [
    Rn,
    as,
    Gr,
    wc,
    yo,
    Wr,
    dc(Rn),
    lc(us("a", "b", "c"), Rn)
  ]))).if(Wu, (n, e) => {
    const t = {}, s = di(e, 0, 3);
    for (let r = 0; r < s; r++) {
      const i = bn(e, n.shape.keys), o = bn(e, n.shape.values);
      t[i] = o;
    }
    return t;
  }).done()
), bn = (n, e) => (
  /** @type {any} */
  _c(js(e), n)
), qr = (
  /** @type {Document} */
  typeof document < "u" ? document : {}
);
ie((n) => n.nodeType === pd);
typeof DOMParser < "u" && new DOMParser();
ie((n) => n.nodeType === dd);
ie((n) => n.nodeType === fd);
const ud = (n) => Nh(n, (e, t) => `${t}:${e};`).join(""), dd = qr.ELEMENT_NODE, fd = qr.TEXT_NODE, gd = qr.DOCUMENT_NODE, pd = qr.DOCUMENT_FRAGMENT_NODE;
ie((n) => n.nodeType === gd);
const Et = Symbol, vc = Et(), kc = Et(), md = Et(), yd = Et(), wd = Et(), bc = Et(), _d = Et(), wo = Et(), vd = Et(), kd = (n) => {
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
}, bd = {
  [vc]: gt("font-weight", "bold"),
  [kc]: gt("font-weight", "normal"),
  [md]: gt("color", "blue"),
  [wd]: gt("color", "green"),
  [yd]: gt("color", "grey"),
  [bc]: gt("color", "red"),
  [_d]: gt("color", "purple"),
  [wo]: gt("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [vd]: gt("color", "black")
}, Sd = (n) => {
  var o;
  n.length === 1 && ((o = n[0]) == null ? void 0 : o.constructor) === Function && (n = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  n[0]());
  const e = [], t = [], s = qe();
  let r = [], i = 0;
  for (; i < n.length; i++) {
    const a = n[i], c = bd[a];
    if (c !== void 0)
      s.set(c.left, c.right);
    else {
      if (a === void 0)
        break;
      if (a.constructor === String || a.constructor === Number) {
        const h = ud(s);
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
}, Sc = Lu ? Sd : kd, xd = (...n) => {
  console.log(...Sc(n)), xc.forEach((e) => e.print(n));
}, Id = (...n) => {
  console.warn(...Sc(n)), n.unshift(wo), xc.forEach((e) => e.print(n));
}, xc = is(), Ic = (n) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: n
}), Cd = (n, e) => Ic(() => {
  let t;
  do
    t = n.next();
  while (!t.done && !e(t.value));
  return t;
}), gi = (n, e) => Ic(() => {
  const { done: t, value: s } = n.next();
  return { done: t, value: t ? void 0 : e(s) };
});
class _o {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, t) {
    this.clock = e, this.len = t;
  }
}
class tr {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const Cc = (n, e, t) => e.clients.forEach((s, r) => {
  const i = (
    /** @type {Array<GC|Item>} */
    n.doc.store.clients.get(r)
  );
  if (i != null) {
    const o = i[i.length - 1], a = o.id.clock + o.length;
    for (let c = 0, h = s[c]; c < s.length && h.clock < a; h = s[++c])
      jc(n, i, h.clock, h.len, t);
  }
}), Ed = (n, e) => {
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
}, Ec = (n, e) => {
  const t = n.clients.get(e.client);
  return t !== void 0 && Ed(t, e.clock) !== null;
}, vo = (n) => {
  n.clients.forEach((e) => {
    e.sort((r, i) => r.clock - i.clock);
    let t, s;
    for (t = 1, s = 1; t < e.length; t++) {
      const r = e[s - 1], i = e[t];
      r.clock + r.len >= i.clock ? r.len = yn(r.len, i.clock + i.len - r.clock) : (s < t && (e[s] = i), s++);
    }
    e.length = s;
  });
}, Td = (n) => {
  const e = new tr();
  for (let t = 0; t < n.length; t++)
    n[t].clients.forEach((s, r) => {
      if (!e.clients.has(r)) {
        const i = s.slice();
        for (let o = t + 1; o < n.length; o++)
          Mh(i, n[o].clients.get(r) || []);
        e.clients.set(r, i);
      }
    });
  return vo(e), e;
}, Or = (n, e, t, s) => {
  Qt(n.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new _o(t, s));
}, Od = () => new tr(), Ad = (n) => {
  const e = Od();
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
        r.push(new _o(a, c));
      }
    }
    r.length > 0 && e.clients.set(s, r);
  }), e;
}, ds = (n, e) => {
  D(n.restEncoder, e.clients.size), qt(e.clients.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
    n.resetDsCurVal(), D(n.restEncoder, t);
    const r = s.length;
    D(n.restEncoder, r);
    for (let i = 0; i < r; i++) {
      const o = s[i];
      n.writeDsClock(o.clock), n.writeDsLen(o.len);
    }
  });
}, ko = (n) => {
  const e = new tr(), t = O(n.restDecoder);
  for (let s = 0; s < t; s++) {
    n.resetDsCurVal();
    const r = O(n.restDecoder), i = O(n.restDecoder);
    if (i > 0) {
      const o = Qt(e.clients, r, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let a = 0; a < i; a++)
        o.push(new _o(n.readDsClock(), n.readDsLen()));
    }
  }
  return e;
}, fa = (n, e, t) => {
  const s = new tr(), r = O(n.restDecoder);
  for (let i = 0; i < r; i++) {
    n.resetDsCurVal();
    const o = O(n.restDecoder), a = O(n.restDecoder), c = t.clients.get(o) || [], h = re(t, o);
    for (let u = 0; u < a; u++) {
      const f = n.readDsClock(), g = f + n.readDsLen();
      if (f < h) {
        h < g && Or(s, o, h, g - h);
        let m = ut(c, f), w = c[m];
        for (!w.deleted && w.id.clock < f && (c.splice(m + 1, 0, Vr(e, w, f - w.id.clock)), m++); m < c.length && (w = c[m++], w.id.clock < g); )
          w.deleted || (g < w.id.clock + w.length && c.splice(m, 0, Vr(e, w, g - w.id.clock)), w.delete(e));
      } else
        Or(s, o, f, g - f);
    }
  }
  if (s.clients.size > 0) {
    const i = new gn();
    return D(i.restEncoder, 0), ds(i, s), i.toUint8Array();
  }
  return null;
}, Tc = Qa;
class Jt extends $h {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = mu(), collectionid: t = null, gc: s = !0, gcFilter: r = () => !0, meta: i = null, autoLoad: o = !1, shouldLoad: a = !0 } = {}) {
    super(), this.gc = s, this.gcFilter = r, this.clientID = Tc(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new $c(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = a, this.autoLoad = o, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = la((h) => {
      this.on("load", () => {
        this.isLoaded = !0, h(this);
      });
    });
    const c = () => la((h) => {
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
    e !== null && !this.shouldLoad && P(
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
    return new Set(qt(this.subdocs).map((e) => e.guid));
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
    return P(this, e, t);
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
    de
  )) {
    const s = Qt(this.share, e, () => {
      const i = new t();
      return i._integrate(this, null), i;
    }), r = s.constructor;
    if (t !== de && r !== t)
      if (r === de) {
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
      this.get(e, Vn)
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
      this.get(e, N)
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
      this.get(e, ls)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, pn);
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
    this.isDestroyed = !0, qt(this.subdocs).forEach((t) => t.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const t = (
        /** @type {ContentDoc} */
        e.content
      );
      t.doc = new Jt({ guid: this.guid, ...t.opts, shouldLoad: !1 }), t.doc._item = e, P(
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
class Oc {
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
class Ac extends Oc {
  /**
   * @return {ID}
   */
  readLeftID() {
    return R(O(this.restDecoder), O(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return R(O(this.restDecoder), O(this.restDecoder));
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
    return os(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return Nn(this.restDecoder);
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
    return Vs(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return Ru(Ae(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(Nn(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return Nn(this.restDecoder);
  }
}
class Dd {
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
class cs extends Dd {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], O(e), this.keyClockDecoder = new ui(Ae(e)), this.clientDecoder = new gr(Ae(e)), this.leftClockDecoder = new ui(Ae(e)), this.rightClockDecoder = new ui(Ae(e)), this.infoDecoder = new ca(Ae(e), os), this.stringDecoder = new fu(Ae(e)), this.parentInfoDecoder = new ca(Ae(e), os), this.typeRefDecoder = new gr(Ae(e)), this.lenDecoder = new gr(Ae(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new Mn(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new Mn(this.clientDecoder.read(), this.rightClockDecoder.read());
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
    return Vs(this.restDecoder);
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
    return Vs(this.restDecoder);
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
class Dc {
  constructor() {
    this.restEncoder = Pr();
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
class nr extends Dc {
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
    Ni(this.restEncoder, e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    Ln(this.restEncoder, e);
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
    Ms(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Oe(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    Ln(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    Ln(this.restEncoder, e);
  }
}
class Lc {
  constructor() {
    this.restEncoder = Pr(), this.dsCurrVal = 0;
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
    e === 0 && je(), D(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class gn extends Lc {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new hi(), this.clientEncoder = new fr(), this.leftClockEncoder = new hi(), this.rightClockEncoder = new hi(), this.infoEncoder = new ia(Ni), this.stringEncoder = new ru(), this.parentInfoEncoder = new ia(Ni), this.typeRefEncoder = new fr(), this.lenEncoder = new fr();
  }
  toUint8Array() {
    const e = Pr();
    return D(e, 0), Oe(e, this.keyClockEncoder.toUint8Array()), Oe(e, this.clientEncoder.toUint8Array()), Oe(e, this.leftClockEncoder.toUint8Array()), Oe(e, this.rightClockEncoder.toUint8Array()), Oe(e, ot(this.infoEncoder)), Oe(e, this.stringEncoder.toUint8Array()), Oe(e, ot(this.parentInfoEncoder)), Oe(e, this.typeRefEncoder.toUint8Array()), Oe(e, this.lenEncoder.toUint8Array()), Fr(e, ot(this.restEncoder)), ot(e);
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
    Ms(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    Oe(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    Ms(this.restEncoder, e);
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
const Ld = (n, e, t, s) => {
  s = yn(s, e[0].id.clock);
  const r = ut(e, s);
  D(n.restEncoder, e.length - r), n.writeClient(t), D(n.restEncoder, s);
  const i = e[r];
  i.write(n, s - i.id.clock);
  for (let o = r + 1; o < e.length; o++)
    e[o].write(n, 0);
}, bo = (n, e, t) => {
  const s = /* @__PURE__ */ new Map();
  t.forEach((r, i) => {
    re(e, i) > r && s.set(i, r);
  }), Yr(e).forEach((r, i) => {
    t.has(i) || s.set(i, 0);
  }), D(n.restEncoder, s.size), qt(s.entries()).sort((r, i) => i[0] - r[0]).forEach(([r, i]) => {
    Ld(
      n,
      /** @type {Array<GC|Item>} */
      e.clients.get(r),
      r,
      i
    );
  });
}, Nd = (n, e) => {
  const t = qe(), s = O(n.restDecoder);
  for (let r = 0; r < s; r++) {
    const i = O(n.restDecoder), o = new Array(i), a = n.readClient();
    let c = O(n.restDecoder);
    t.set(a, { i: 0, refs: o });
    for (let h = 0; h < i; h++) {
      const u = n.readInfo();
      switch (Kr & u) {
        case 0: {
          const f = n.readLen();
          o[h] = new $e(R(a, c), f), c += f;
          break;
        }
        case 10: {
          const f = O(n.restDecoder);
          o[h] = new Ue(R(a, c), f), c += f;
          break;
        }
        default: {
          const f = (u & (It | Re)) === 0, g = new ee(
            R(a, c),
            null,
            // left
            (u & Re) === Re ? n.readLeftID() : null,
            // origin
            null,
            // right
            (u & It) === It ? n.readRightID() : null,
            // right origin
            f ? n.readParentInfo() ? e.get(n.readString()) : n.readLeftID() : null,
            // parent
            f && (u & Ns) === Ns ? n.readString() : null,
            // parentSub
            rl(n, u)
            // item content
          );
          o[h] = g, c += g.length;
        }
      }
    }
  }
  return t;
}, Rd = (n, e, t) => {
  const s = [];
  let r = qt(t.keys()).sort((m, w) => m - w);
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
  const a = new $c(), c = /* @__PURE__ */ new Map(), h = (m, w) => {
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
  const f = /* @__PURE__ */ new Map(), g = () => {
    for (const m of s) {
      const w = m.id.client, S = t.get(w);
      S ? (S.i--, a.clients.set(w, S.refs.slice(S.i)), t.delete(w), S.i = 0, S.refs = []) : a.clients.set(w, [m]), r = r.filter((W) => W !== w);
    }
    s.length = 0;
  };
  for (; ; ) {
    if (u.constructor !== Ue) {
      const w = Qt(f, u.id.client, () => re(e, u.id.client)) - u.id.clock;
      if (w < 0)
        s.push(u), h(u.id.client, u.id.clock - 1), g();
      else {
        const S = u.getMissing(n, e);
        if (S !== null) {
          s.push(u);
          const W = t.get(
            /** @type {number} */
            S
          ) || { refs: [], i: 0 };
          if (W.refs.length === W.i)
            h(
              /** @type {number} */
              S,
              re(e, S)
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
    const m = new gn();
    return bo(m, a, /* @__PURE__ */ new Map()), D(m.restEncoder, 0), { missing: c, update: m.toUint8Array() };
  }
  return null;
}, Md = (n, e) => bo(n, e.doc.store, e.beforeState), Vd = (n, e, t, s = new cs(n)) => P(e, (r) => {
  r.local = !1;
  let i = !1;
  const o = r.doc, a = o.store, c = Nd(s, o), h = Rd(r, a, c), u = a.pendingStructs;
  if (u) {
    for (const [g, m] of u.missing)
      if (m < re(a, g)) {
        i = !0;
        break;
      }
    if (h) {
      for (const [g, m] of h.missing) {
        const w = u.missing.get(g);
        (w == null || w > m) && u.missing.set(g, m);
      }
      u.update = Ar([u.update, h.update]);
    }
  } else
    a.pendingStructs = h;
  const f = fa(s, r, a);
  if (a.pendingDs) {
    const g = new cs(hs(a.pendingDs));
    O(g.restDecoder);
    const m = fa(g, r, a);
    f && m ? a.pendingDs = Ar([f, m]) : a.pendingDs = f || m;
  } else
    a.pendingDs = f;
  if (i) {
    const g = (
      /** @type {{update: Uint8Array}} */
      a.pendingStructs.update
    );
    a.pendingStructs = null, Nc(r.doc, g);
  }
}, t, !1), Nc = (n, e, t, s = cs) => {
  const r = hs(e);
  Vd(r, n, t, new s(r));
}, ga = (n, e, t) => Nc(n, e, t, Ac), $d = (n, e, t = /* @__PURE__ */ new Map()) => {
  bo(n, e.store, t), ds(n, Ad(e.store));
}, Ud = (n, e = new Uint8Array([0]), t = new gn()) => {
  const s = Rc(e);
  $d(t, n, s);
  const r = [t.toUint8Array()];
  if (n.store.pendingDs && r.push(n.store.pendingDs), n.store.pendingStructs && r.push(Qd(n.store.pendingStructs.update, e)), r.length > 1) {
    if (t.constructor === nr)
      return Yd(r.map((i, o) => o === 0 ? i : tf(i)));
    if (t.constructor === gn)
      return Ar(r);
  }
  return r[0];
}, pi = (n, e) => Ud(n, e, new nr()), jd = (n) => {
  const e = /* @__PURE__ */ new Map(), t = O(n.restDecoder);
  for (let s = 0; s < t; s++) {
    const r = O(n.restDecoder), i = O(n.restDecoder);
    e.set(r, i);
  }
  return e;
}, Rc = (n) => jd(new Oc(hs(n))), Mc = (n, e) => (D(n.restEncoder, e.size), qt(e.entries()).sort((t, s) => s[0] - t[0]).forEach(([t, s]) => {
  D(n.restEncoder, t), D(n.restEncoder, s);
}), n), Bd = (n, e) => Mc(n, Yr(e.store)), Kd = (n, e = new Lc()) => (n instanceof Map ? Mc(e, n) : Bd(e, n), e.toUint8Array()), Pd = (n) => Kd(n, new Dc());
class Fd {
  constructor() {
    this.l = [];
  }
}
const pa = () => new Fd(), ma = (n, e) => n.l.push(e), ya = (n, e) => {
  const t = n.l, s = t.length;
  n.l = t.filter((r) => e !== r), s === n.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, Vc = (n, e, t) => fo(n.l, [e, t]);
class Mn {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, t) {
    this.client = e, this.clock = t;
  }
}
const cr = (n, e) => n === e || n !== null && e !== null && n.client === e.client && n.clock === e.clock, R = (n, e) => new Mn(n, e), Zd = (n) => {
  for (const [e, t] of n.doc.share.entries())
    if (t === n)
      return e;
  throw je();
}, In = (n, e) => e === void 0 ? !n.deleted : e.sv.has(n.id.client) && (e.sv.get(n.id.client) || 0) > n.id.clock && !Ec(e.ds, n.id), $i = (n, e) => {
  const t = Qt(n.meta, $i, is), s = n.doc.store;
  t.has(e) || (e.sv.forEach((r, i) => {
    r < re(s, i) && Yt(n, R(i, r));
  }), Cc(n, e.ds, (r) => {
  }), t.add(e));
};
class $c {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const Yr = (n) => {
  const e = /* @__PURE__ */ new Map();
  return n.clients.forEach((t, s) => {
    const r = t[t.length - 1];
    e.set(s, r.id.clock + r.length);
  }), e;
}, re = (n, e) => {
  const t = n.clients.get(e);
  if (t === void 0)
    return 0;
  const s = t[t.length - 1];
  return s.id.clock + s.length;
}, Uc = (n, e) => {
  let t = n.clients.get(e.id.client);
  if (t === void 0)
    t = [], n.clients.set(e.id.client, t);
  else {
    const s = t[t.length - 1];
    if (s.id.clock + s.length !== e.id.clock)
      throw je();
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
  throw je();
}, zd = (n, e) => {
  const t = n.clients.get(e.client);
  return t[ut(t, e.clock)];
}, mi = (
  /** @type {function(StructStore,ID):Item} */
  zd
), Ui = (n, e, t) => {
  const s = ut(e, t), r = e[s];
  return r.id.clock < t && r instanceof ee ? (e.splice(s + 1, 0, Vr(n, r, t - r.id.clock)), s + 1) : s;
}, Yt = (n, e) => {
  const t = (
    /** @type {Array<Item>} */
    n.doc.store.clients.get(e.client)
  );
  return t[Ui(n, t, e.clock)];
}, wa = (n, e, t) => {
  const s = e.clients.get(t.client), r = ut(s, t.clock), i = s[r];
  return t.clock !== i.id.clock + i.length - 1 && i.constructor !== $e && s.splice(r + 1, 0, Vr(n, i, t.clock - i.id.clock + 1)), i;
}, Hd = (n, e, t) => {
  const s = (
    /** @type {Array<GC|Item>} */
    n.clients.get(e.id.client)
  );
  s[ut(s, e.id.clock)] = t;
}, jc = (n, e, t, s, r) => {
  if (s === 0)
    return;
  const i = t + s;
  let o = Ui(n, e, t), a;
  do
    a = e[o++], i < a.id.clock + a.length && Ui(n, e, i), r(a);
  while (o < e.length && e[o].id.clock < i);
};
class Jd {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, t, s) {
    this.doc = e, this.deleteSet = new tr(), this.beforeState = Yr(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = s, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const _a = (n, e) => e.deleteSet.clients.size === 0 && !Rh(e.afterState, (t, s) => e.beforeState.get(s) !== t) ? !1 : (vo(e.deleteSet), Md(n, e), ds(n, e.deleteSet), !0), va = (n, e, t) => {
  const s = e._item;
  (s === null || s.id.clock < (n.beforeState.get(s.id.client) || 0) && !s.deleted) && Qt(n.changed, e, is).add(t);
}, mr = (n, e) => {
  let t = n[e], s = n[e - 1], r = e;
  for (; r > 0; t = s, s = n[--r - 1]) {
    if (s.deleted === t.deleted && s.constructor === t.constructor && s.mergeWith(t)) {
      t instanceof ee && t.parentSub !== null && /** @type {AbstractType<any>} */
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
}, Wd = (n, e, t) => {
  for (const [s, r] of n.clients.entries()) {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let o = r.length - 1; o >= 0; o--) {
      const a = r[o], c = a.clock + a.len;
      for (let h = ut(i, a.clock), u = i[h]; h < i.length && u.id.clock < c; u = i[++h]) {
        const f = i[h];
        if (a.clock + a.len <= f.id.clock)
          break;
        f instanceof ee && f.deleted && !f.keep && t(f) && f.gc(e, !1);
      }
    }
  }
}, Gd = (n, e) => {
  n.clients.forEach((t, s) => {
    const r = (
      /** @type {Array<GC|Item>} */
      e.clients.get(s)
    );
    for (let i = t.length - 1; i >= 0; i--) {
      const o = t[i], a = Ga(r.length - 1, 1 + ut(r, o.clock + o.len - 1));
      for (let c = a, h = r[c]; c > 0 && h.id.clock >= o.clock; h = r[c])
        c -= 1 + mr(r, c);
    }
  });
}, Bc = (n, e) => {
  if (e < n.length) {
    const t = n[e], s = t.doc, r = s.store, i = t.deleteSet, o = t._mergeStructs;
    try {
      vo(i), t.afterState = Yr(t.doc.store), s.emit("beforeObserverCalls", [t, s]);
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
            Vc(h._dEH, c, t);
          }));
        }), a.push(() => s.emit("afterTransaction", [t, s])), a.push(() => {
          t._needFormattingCleanup && mf(t);
        });
      }), fo(a, []);
    } finally {
      s.gc && Wd(i, r, s.gcFilter), Gd(i, r), t.afterState.forEach((u, f) => {
        const g = t.beforeState.get(f) || 0;
        if (g !== u) {
          const m = (
            /** @type {Array<GC|Item>} */
            r.clients.get(f)
          ), w = yn(ut(m, g), 1);
          for (let S = m.length - 1; S >= w; )
            S -= 1 + mr(m, S);
        }
      });
      for (let u = o.length - 1; u >= 0; u--) {
        const { client: f, clock: g } = o[u].id, m = (
          /** @type {Array<GC|Item>} */
          r.clients.get(f)
        ), w = ut(m, g);
        w + 1 < m.length && mr(m, w + 1) > 1 || w > 0 && mr(m, w);
      }
      if (!t.local && t.afterState.get(s.clientID) !== t.beforeState.get(s.clientID) && (xd(wo, vc, "[yjs] ", kc, bc, "Changed the client-id because another client seems to be using it."), s.clientID = Tc()), s.emit("afterTransactionCleanup", [t, s]), s._observers.has("update")) {
        const u = new nr();
        _a(u, t) && s.emit("update", [u.toUint8Array(), t.origin, s, t]);
      }
      if (s._observers.has("updateV2")) {
        const u = new gn();
        _a(u, t) && s.emit("updateV2", [u.toUint8Array(), t.origin, s, t]);
      }
      const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: h } = t;
      (a.size > 0 || h.size > 0 || c.size > 0) && (a.forEach((u) => {
        u.clientID = s.clientID, u.collectionid == null && (u.collectionid = s.collectionid), s.subdocs.add(u);
      }), h.forEach((u) => s.subdocs.delete(u)), s.emit("subdocs", [{ loaded: c, added: a, removed: h }, s, t]), h.forEach((u) => u.destroy())), n.length <= e + 1 ? (s._transactionCleanups = [], s.emit("afterAllTransactions", [s, n])) : Bc(n, e + 1);
    }
  }
}, P = (n, e, t = null, s = !0) => {
  const r = n._transactionCleanups;
  let i = !1, o = null;
  n._transaction === null && (i = !0, n._transaction = new Jd(n, t, s), r.push(n._transaction), r.length === 1 && n.emit("beforeAllTransactions", [n]), n.emit("beforeTransaction", [n._transaction, n]));
  try {
    o = e(n._transaction);
  } finally {
    if (i) {
      const a = n._transaction === r[0];
      n._transaction = null, a && Bc(r, 0);
    }
  }
  return o;
};
function* qd(n) {
  const e = O(n.restDecoder);
  for (let t = 0; t < e; t++) {
    const s = O(n.restDecoder), r = n.readClient();
    let i = O(n.restDecoder);
    for (let o = 0; o < s; o++) {
      const a = n.readInfo();
      if (a === 10) {
        const c = O(n.restDecoder);
        yield new Ue(R(r, i), c), i += c;
      } else if ((Kr & a) !== 0) {
        const c = (a & (It | Re)) === 0, h = new ee(
          R(r, i),
          null,
          // left
          (a & Re) === Re ? n.readLeftID() : null,
          // origin
          null,
          // right
          (a & It) === It ? n.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          c ? n.readParentInfo() ? n.readString() : n.readLeftID() : null,
          // parent
          c && (a & Ns) === Ns ? n.readString() : null,
          // parentSub
          rl(n, a)
          // item content
        );
        yield h, i += h.length;
      } else {
        const c = n.readLen();
        yield new $e(R(r, i), c), i += c;
      }
    }
  }
}
class So {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, t) {
    this.gen = qd(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === Ue);
    return this.curr;
  }
}
class xo {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const Yd = (n) => Ar(n, Ac, nr), Xd = (n, e) => {
  if (n.constructor === $e) {
    const { client: t, clock: s } = n.id;
    return new $e(R(t, s + e), n.length - e);
  } else if (n.constructor === Ue) {
    const { client: t, clock: s } = n.id;
    return new Ue(R(t, s + e), n.length - e);
  } else {
    const t = (
      /** @type {Item} */
      n
    ), { client: s, clock: r } = t.id;
    return new ee(
      R(s, r + e),
      null,
      R(s, r + e - 1),
      null,
      t.rightOrigin,
      t.parent,
      t.parentSub,
      t.content.splice(e)
    );
  }
}, Ar = (n, e = cs, t = gn) => {
  if (n.length === 1)
    return n[0];
  const s = n.map((u) => new e(hs(u)));
  let r = s.map((u) => new So(u, !0)), i = null;
  const o = new t(), a = new xo(o);
  for (; r = r.filter((g) => g.curr !== null), r.sort(
    /** @type {function(any,any):number} */
    (g, m) => {
      if (g.curr.id.client === m.curr.id.client) {
        const w = g.curr.id.clock - m.curr.id.clock;
        return w === 0 ? g.curr.constructor === m.curr.constructor ? 0 : g.curr.constructor === Ue ? 1 : -1 : w;
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
        Mt(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next();
      else if (i.struct.id.clock + i.struct.length < g.id.clock)
        if (i.struct.constructor === Ue)
          i.struct.length = g.id.clock + g.length - i.struct.id.clock;
        else {
          Mt(a, i.struct, i.offset);
          const w = g.id.clock - i.struct.id.clock - i.struct.length;
          i = { struct: new Ue(R(f, i.struct.id.clock + i.struct.length), w), offset: 0 };
        }
      else {
        const w = i.struct.id.clock + i.struct.length - g.id.clock;
        w > 0 && (i.struct.constructor === Ue ? i.struct.length -= w : g = Xd(g, w)), i.struct.mergeWith(
          /** @type {any} */
          g
        ) || (Mt(a, i.struct, i.offset), i = { struct: g, offset: 0 }, u.next());
      }
    } else
      i = { struct: (
        /** @type {Item | GC} */
        u.curr
      ), offset: 0 }, u.next();
    for (let g = u.curr; g !== null && g.id.client === f && g.id.clock === i.struct.id.clock + i.struct.length && g.constructor !== Ue; g = u.next())
      Mt(a, i.struct, i.offset), i = { struct: g, offset: 0 };
  }
  i !== null && (Mt(a, i.struct, i.offset), i = null), Io(a);
  const c = s.map((u) => ko(u)), h = Td(c);
  return ds(o, h), o.toUint8Array();
}, Qd = (n, e, t = cs, s = gn) => {
  const r = Rc(e), i = new s(), o = new xo(i), a = new t(hs(n)), c = new So(a, !1);
  for (; c.curr; ) {
    const u = c.curr, f = u.id.client, g = r.get(f) || 0;
    if (c.curr.constructor === Ue) {
      c.next();
      continue;
    }
    if (u.id.clock + u.length > g)
      for (Mt(o, u, yn(g - u.id.clock, 0)), c.next(); c.curr && c.curr.id.client === f; )
        Mt(o, c.curr, 0), c.next();
    else
      for (; c.curr && c.curr.id.client === f && c.curr.id.clock + c.curr.length <= g; )
        c.next();
  }
  Io(o);
  const h = ko(a);
  return ds(i, h), i.toUint8Array();
}, Kc = (n) => {
  n.written > 0 && (n.clientStructs.push({ written: n.written, restEncoder: ot(n.encoder.restEncoder) }), n.encoder.restEncoder = Pr(), n.written = 0);
}, Mt = (n, e, t) => {
  n.written > 0 && n.currClient !== e.id.client && Kc(n), n.written === 0 && (n.currClient = e.id.client, n.encoder.writeClient(e.id.client), D(n.encoder.restEncoder, e.id.clock + t)), e.write(n.encoder, t), n.written++;
}, Io = (n) => {
  Kc(n);
  const e = n.encoder.restEncoder;
  D(e, n.clientStructs.length);
  for (let t = 0; t < n.clientStructs.length; t++) {
    const s = n.clientStructs[t];
    D(e, s.written), Fr(e, s.restEncoder);
  }
}, ef = (n, e, t, s) => {
  const r = new t(hs(n)), i = new So(r, !1), o = new s(), a = new xo(o);
  for (let h = i.curr; h !== null; h = i.next())
    Mt(a, e(h), 0);
  Io(a);
  const c = ko(r);
  return ds(o, c), o.toUint8Array();
}, tf = (n) => ef(n, Eu, cs, nr), ka = "You must not compute changes after the event-handler fired.";
class Xr {
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
    return this._path || (this._path = nf(this.currentTarget, this.target));
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
    return Ec(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw ht(ka);
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
                o = "delete", a = ai(c.content.getContent());
              else
                return;
            else
              c !== null && this.deletes(c) ? (o = "update", a = ai(c.content.getContent())) : (o = "add", a = void 0);
          } else if (this.deletes(i))
            o = "delete", a = ai(
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
        throw ht(ka);
      const t = this.target, s = is(), r = is(), i = [];
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
const nf = (n, e) => {
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
  Id("Invalid access: Add Yjs type to a document before reading data.");
}, Pc = 80;
let Co = 0;
class sf {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, t) {
    e.marker = !0, this.p = e, this.index = t, this.timestamp = Co++;
  }
}
const rf = (n) => {
  n.timestamp = Co++;
}, Fc = (n, e, t) => {
  n.p.marker = !1, n.p = e, e.marker = !0, n.index = t, n.timestamp = Co++;
}, of = (n, e, t) => {
  if (n.length >= Pc) {
    const s = n.reduce((r, i) => r.timestamp < i.timestamp ? r : i);
    return Fc(s, e, t), s;
  } else {
    const s = new sf(e, t);
    return n.push(s), s;
  }
}, Qr = (n, e) => {
  if (n._start === null || e === 0 || n._searchMarker === null)
    return null;
  const t = n._searchMarker.length === 0 ? null : n._searchMarker.reduce((i, o) => dr(e - i.index) < dr(e - o.index) ? i : o);
  let s = n._start, r = 0;
  for (t !== null && (s = t.p, r = t.index, rf(t)); s.right !== null && r < e; ) {
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
  return t !== null && dr(t.index - r) < /** @type {YText|YArray<any>} */
  s.parent.length / Pc ? (Fc(t, s, r), t) : of(n._searchMarker, s, r);
}, Bs = (n, e, t) => {
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
    (e < r.index || t > 0 && e === r.index) && (r.index = yn(e, r.index + t));
  }
}, ei = (n, e, t) => {
  const s = n, r = e.changedParentTypes;
  for (; Qt(r, n, () => []).push(t), n._item !== null; )
    n = /** @type {AbstractType<any>} */
    n._item.parent;
  Vc(s._eH, t, e);
};
class de {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = pa(), this._dEH = pa(), this._searchMarker = null;
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
    ma(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    ma(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    ya(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    ya(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const Zc = (n, e, t) => {
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
}, zc = (n) => {
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
}, Ks = (n, e) => {
  let t = 0, s = n._start;
  for (n.doc ?? me(); s !== null; ) {
    if (s.countable && !s.deleted) {
      const r = s.content.getContent();
      for (let i = 0; i < r.length; i++)
        e(r[i], t++, n);
    }
    s = s.right;
  }
}, Hc = (n, e) => {
  const t = [];
  return Ks(n, (s, r) => {
    t.push(e(s, r, n));
  }), t;
}, af = (n) => {
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
}, Jc = (n, e) => {
  n.doc ?? me();
  const t = Qr(n, e);
  let s = n._start;
  for (t !== null && (s = t.p, e -= t.index); s !== null; s = s.right)
    if (!s.deleted && s.countable) {
      if (e < s.length)
        return s.content.getContent()[e];
      e -= s.length;
    }
}, Dr = (n, e, t, s) => {
  let r = t;
  const i = n.doc, o = i.clientID, a = i.store, c = t === null ? e._start : t.right;
  let h = [];
  const u = () => {
    h.length > 0 && (r = new ee(R(o, re(a, o)), r, r && r.lastId, c, c && c.id, e, null, new mn(h)), r.integrate(n, 0), h = []);
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
              r = new ee(R(o, re(a, o)), r, r && r.lastId, c, c && c.id, e, null, new sr(new Uint8Array(
                /** @type {Uint8Array} */
                f
              ))), r.integrate(n, 0);
              break;
            case Jt:
              r = new ee(R(o, re(a, o)), r, r && r.lastId, c, c && c.id, e, null, new rr(
                /** @type {Doc} */
                f
              )), r.integrate(n, 0);
              break;
            default:
              if (f instanceof de)
                r = new ee(R(o, re(a, o)), r, r && r.lastId, c, c && c.id, e, null, new Tt(f)), r.integrate(n, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), u();
}, Wc = () => ht("Length exceeded!"), Gc = (n, e, t, s) => {
  if (t > e._length)
    throw Wc();
  if (t === 0)
    return e._searchMarker && Bs(e._searchMarker, t, s.length), Dr(n, e, null, s);
  const r = t, i = Qr(e, t);
  let o = e._start;
  for (i !== null && (o = i.p, t -= i.index, t === 0 && (o = o.prev, t += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right)
    if (!o.deleted && o.countable) {
      if (t <= o.length) {
        t < o.length && Yt(n, R(o.id.client, o.id.clock + t));
        break;
      }
      t -= o.length;
    }
  return e._searchMarker && Bs(e._searchMarker, r, s.length), Dr(n, e, o, s);
}, cf = (n, e, t) => {
  let r = (e._searchMarker || []).reduce((i, o) => o.index > i.index ? o : i, { index: 0, p: e._start }).p;
  if (r)
    for (; r.right; )
      r = r.right;
  return Dr(n, e, r, t);
}, qc = (n, e, t, s) => {
  if (s === 0)
    return;
  const r = t, i = s, o = Qr(e, t);
  let a = e._start;
  for (o !== null && (a = o.p, t -= o.index); a !== null && t > 0; a = a.right)
    !a.deleted && a.countable && (t < a.length && Yt(n, R(a.id.client, a.id.clock + t)), t -= a.length);
  for (; s > 0 && a !== null; )
    a.deleted || (s < a.length && Yt(n, R(a.id.client, a.id.clock + s)), a.delete(n), s -= a.length), a = a.right;
  if (s > 0)
    throw Wc();
  e._searchMarker && Bs(
    e._searchMarker,
    r,
    -i + s
    /* in case we remove the above exception */
  );
}, Lr = (n, e, t) => {
  const s = e._map.get(t);
  s !== void 0 && s.delete(n);
}, Eo = (n, e, t, s) => {
  const r = e._map.get(t) || null, i = n.doc, o = i.clientID;
  let a;
  if (s == null)
    a = new mn([s]);
  else
    switch (s.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        a = new mn([s]);
        break;
      case Uint8Array:
        a = new sr(
          /** @type {Uint8Array} */
          s
        );
        break;
      case Jt:
        a = new rr(
          /** @type {Doc} */
          s
        );
        break;
      default:
        if (s instanceof de)
          a = new Tt(s);
        else
          throw new Error("Unexpected content type");
    }
  new ee(R(o, re(i.store, o)), r, r && r.lastId, null, null, e, t, a).integrate(n, 0);
}, To = (n, e) => {
  n.doc ?? me();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted ? t.content.getContent()[t.length - 1] : void 0;
}, Yc = (n) => {
  const e = {};
  return n.doc ?? me(), n._map.forEach((t, s) => {
    t.deleted || (e[s] = t.content.getContent()[t.length - 1]);
  }), e;
}, Xc = (n, e) => {
  n.doc ?? me();
  const t = n._map.get(e);
  return t !== void 0 && !t.deleted;
}, lf = (n, e) => {
  const t = {};
  return n._map.forEach((s, r) => {
    let i = s;
    for (; i !== null && (!e.sv.has(i.id.client) || i.id.clock >= (e.sv.get(i.id.client) || 0)); )
      i = i.left;
    i !== null && In(i, e) && (t[r] = i.content.getContent()[i.length - 1]);
  }), t;
}, lr = (n) => (n.doc ?? me(), Cd(
  n._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class hf extends Xr {
}
class Vn extends de {
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
    const t = new Vn();
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
    return new Vn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new Vn();
    return e.insert(0, this.toArray().map(
      (t) => t instanceof de ? (
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
    super._callObserver(e, t), ei(this, e, new hf(this, e));
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
    this.doc !== null ? P(this.doc, (s) => {
      Gc(
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
    this.doc !== null ? P(this.doc, (t) => {
      cf(
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
    this.doc !== null ? P(this.doc, (s) => {
      qc(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return Jc(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return zc(this);
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
    return Zc(this, e, t);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof de ? e.toJSON() : e);
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
    return Hc(
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
    Ks(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return af(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Mf);
  }
}
const uf = (n) => new Vn();
class df extends Xr {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, t, s) {
    super(e, t), this.keysChanged = s;
  }
}
class N extends de {
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
    return new N();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const e = new N();
    return this.forEach((t, s) => {
      e.set(s, t instanceof de ? (
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
    ei(this, e, new df(this, e, t));
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
        e[s] = r instanceof de ? r.toJSON() : r;
      }
    }), e;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...lr(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return gi(
      lr(this),
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
    return gi(
      lr(this),
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
    return gi(
      lr(this),
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
    this.doc !== null ? P(this.doc, (t) => {
      Lr(t, this, e);
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
    return this.doc !== null ? P(this.doc, (s) => {
      Eo(
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
      To(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return Xc(this, e);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    this.doc !== null ? P(this.doc, (e) => {
      this.forEach(function(t, s, r) {
        Lr(e, r, s);
      });
    }) : this._prelimContent.clear();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(Vf);
  }
}
const ff = (n) => new N(), zt = (n, e) => n === e || typeof n == "object" && typeof e == "object" && n && e && Iu(n, e);
class ji {
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
      case te:
        this.right.deleted || fs(
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
const ba = (n, e, t) => {
  for (; e.right !== null && t > 0; ) {
    switch (e.right.content.constructor) {
      case te:
        e.right.deleted || fs(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (t < e.right.length && Yt(n, R(e.right.id.client, e.right.id.clock + t)), e.index += e.right.length, t -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, hr = (n, e, t, s) => {
  const r = /* @__PURE__ */ new Map(), i = s ? Qr(e, t) : null;
  if (i) {
    const o = new ji(i.p.left, i.p, i.index, r);
    return ba(n, o, t - i.index);
  } else {
    const o = new ji(null, e._start, 0, r);
    return ba(n, o, t);
  }
}, Qc = (n, e, t, s) => {
  for (; t.right !== null && (t.right.deleted === !0 || t.right.content.constructor === te && zt(
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
    const c = t.left, h = t.right, u = new ee(R(i, re(r.store, i)), c, c && c.lastId, h, h && h.id, e, null, new te(a, o));
    u.integrate(n, 0), t.right = u, t.forward();
  });
}, fs = (n, e) => {
  const { key: t, value: s } = e;
  s === null ? n.delete(t) : n.set(t, s);
}, el = (n, e) => {
  for (; n.right !== null; ) {
    if (!(n.right.deleted || n.right.content.constructor === te && zt(
      e[
        /** @type {ContentFormat} */
        n.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      n.right.content.value
    ))) break;
    n.forward();
  }
}, tl = (n, e, t, s) => {
  const r = n.doc, i = r.clientID, o = /* @__PURE__ */ new Map();
  for (const a in s) {
    const c = s[a], h = t.currentAttributes.get(a) ?? null;
    if (!zt(h, c)) {
      o.set(a, h);
      const { left: u, right: f } = t;
      t.right = new ee(R(i, re(r.store, i)), u, u && u.lastId, f, f && f.id, e, null, new te(a, c)), t.right.integrate(n, 0), t.forward();
    }
  }
  return o;
}, yi = (n, e, t, s, r) => {
  t.currentAttributes.forEach((g, m) => {
    r[m] === void 0 && (r[m] = null);
  });
  const i = n.doc, o = i.clientID;
  el(t, r);
  const a = tl(n, e, t, r), c = s.constructor === String ? new dt(
    /** @type {string} */
    s
  ) : s instanceof de ? new Tt(s) : new wn(s);
  let { left: h, right: u, index: f } = t;
  e._searchMarker && Bs(e._searchMarker, t.index, c.getLength()), u = new ee(R(o, re(i.store, o)), h, h && h.lastId, u, u && u.id, e, null, c), u.integrate(n, 0), t.right = u, t.index = f, t.forward(), Qc(n, e, t, a);
}, Sa = (n, e, t, s, r) => {
  const i = n.doc, o = i.clientID;
  el(t, r);
  const a = tl(n, e, t, r);
  e: for (; t.right !== null && (s > 0 || a.size > 0 && (t.right.deleted || t.right.content.constructor === te)); ) {
    if (!t.right.deleted)
      switch (t.right.content.constructor) {
        case te: {
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
          s < t.right.length && Yt(n, R(t.right.id.client, t.right.id.clock + s)), s -= t.right.length;
          break;
      }
    t.forward();
  }
  if (s > 0) {
    let c = "";
    for (; s > 0; s--)
      c += `
`;
    t.right = new ee(R(o, re(i.store, o)), t.left, t.left && t.left.lastId, t.right, t.right && t.right.id, e, null, new dt(c)), t.right.integrate(n, 0), t.forward();
  }
  Qc(n, e, t, a);
}, nl = (n, e, t, s, r) => {
  let i = e;
  const o = qe();
  for (; i && (!i.countable || i.deleted); ) {
    if (!i.deleted && i.content.constructor === te) {
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
        case te: {
          const { key: u, value: f } = (
            /** @type {ContentFormat} */
            h
          ), g = s.get(u) ?? null;
          (o.get(u) !== h || g === f) && (e.delete(n), a++, !c && (r.get(u) ?? null) === f && g !== f && (g === null ? r.delete(u) : r.set(u, g))), !c && !e.deleted && fs(
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
}, gf = (n, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const t = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === te) {
      const s = (
        /** @type {ContentFormat} */
        e.content.key
      );
      t.has(s) ? e.delete(n) : t.add(s);
    }
    e = e.left;
  }
}, pf = (n) => {
  let e = 0;
  return P(
    /** @type {Doc} */
    n.doc,
    (t) => {
      let s = (
        /** @type {Item} */
        n._start
      ), r = n._start, i = qe();
      const o = Di(i);
      for (; r; ) {
        if (r.deleted === !1)
          switch (r.content.constructor) {
            case te:
              fs(
                o,
                /** @type {ContentFormat} */
                r.content
              );
              break;
            default:
              e += nl(t, s, r, i, o), i = Di(o), s = r;
              break;
          }
        r = r.right;
      }
    }
  ), e;
}, mf = (n) => {
  const e = /* @__PURE__ */ new Set(), t = n.doc;
  for (const [s, r] of n.afterState.entries()) {
    const i = n.beforeState.get(s) || 0;
    r !== i && jc(
      n,
      /** @type {Array<Item|GC>} */
      t.store.clients.get(s),
      i,
      r,
      (o) => {
        !o.deleted && /** @type {Item} */
        o.content.constructor === te && o.constructor !== $e && e.add(
          /** @type {any} */
          o.parent
        );
      }
    );
  }
  P(t, (s) => {
    Cc(n, n.deleteSet, (r) => {
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
      r.content.constructor === te ? e.add(i) : gf(s, r);
    });
    for (const r of e)
      pf(r);
  });
}, xa = (n, e, t) => {
  const s = t, r = Di(e.currentAttributes), i = e.right;
  for (; t > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case Tt:
        case wn:
        case dt:
          t < e.right.length && Yt(n, R(e.right.id.client, e.right.id.clock + t)), t -= e.right.length, e.right.delete(n);
          break;
      }
    e.forward();
  }
  i && nl(n, i, e.right, r, e.currentAttributes);
  const o = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return o._searchMarker && Bs(o._searchMarker, e.index, -s + t), e;
};
class yf extends Xr {
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
      P(e, (s) => {
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
                (typeof h == "object" || h.length > 0) && (m = { insert: h }, r.size > 0 && (m.attributes = {}, r.forEach((w, S) => {
                  w !== null && (m.attributes[S] = w);
                }))), h = "";
                break;
              case "retain":
                u > 0 && (m = { retain: u }, xu(c) || (m.attributes = ku({}, c))), u = 0;
                break;
            }
            m && t.push(m), a = null;
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case Tt:
            case wn:
              this.adds(o) ? this.deletes(o) || (g(), a = "insert", h = o.content.getContent()[0], g()) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), f += 1) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += 1);
              break;
            case dt:
              this.adds(o) ? this.deletes(o) || (a !== "insert" && (g(), a = "insert"), h += /** @type {ContentString} */
              o.content.str) : this.deletes(o) ? (a !== "delete" && (g(), a = "delete"), f += o.length) : o.deleted || (a !== "retain" && (g(), a = "retain"), u += o.length);
              break;
            case te: {
              const { key: m, value: w } = (
                /** @type {ContentFormat} */
                o.content
              );
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const S = r.get(m) ?? null;
                  zt(S, w) ? w !== null && o.delete(s) : (a === "retain" && g(), zt(w, i.get(m) ?? null) ? delete c[m] : c[m] = w);
                }
              } else if (this.deletes(o)) {
                i.set(m, w);
                const S = r.get(m) ?? null;
                zt(S, w) || (a === "retain" && g(), c[m] = S);
              } else if (!o.deleted) {
                i.set(m, w);
                const S = c[m];
                S !== void 0 && (zt(S, w) ? S !== null && o.delete(s) : (a === "retain" && g(), w === null ? delete c[m] : c[m] = w));
              }
              o.deleted || (a === "insert" && g(), fs(
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
class F extends de {
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
    const s = new yf(this, e, t);
    ei(this, e, s), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
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
    this.doc !== null ? P(this.doc, (s) => {
      const r = new ji(null, this._start, 0, /* @__PURE__ */ new Map());
      for (let i = 0; i < e.length; i++) {
        const o = e[i];
        if (o.insert !== void 0) {
          const a = !t && typeof o.insert == "string" && i === e.length - 1 && r.right === null && o.insert.slice(-1) === `
` ? o.insert.slice(0, -1) : o.insert;
          (typeof a != "string" || a.length > 0) && yi(s, this, r, a, o.attributes || {});
        } else o.retain !== void 0 ? Sa(s, this, r, o.retain, o.attributes || {}) : o.delete !== void 0 && xa(s, r, o.delete);
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
        i.forEach((w, S) => {
          g = !0, f[S] = w;
        });
        const m = { insert: a };
        g && (m.attributes = f), r.push(m), a = "";
      }
    }
    const u = () => {
      for (; c !== null; ) {
        if (In(c, e) || t !== void 0 && In(c, t))
          switch (c.content.constructor) {
            case dt: {
              const f = i.get("ychange");
              e !== void 0 && !In(c, e) ? (f === void 0 || f.user !== c.id.client || f.type !== "removed") && (h(), i.set("ychange", s ? s("removed", c.id) : { type: "removed" })) : t !== void 0 && !In(c, t) ? (f === void 0 || f.user !== c.id.client || f.type !== "added") && (h(), i.set("ychange", s ? s("added", c.id) : { type: "added" })) : f !== void 0 && (h(), i.delete("ychange")), a += /** @type {ContentString} */
              c.content.str;
              break;
            }
            case Tt:
            case wn: {
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
            case te:
              In(c, e) && (h(), fs(
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
    return e || t ? P(o, (f) => {
      e && $i(f, e), t && $i(f, t), u();
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
    r !== null ? P(r, (i) => {
      const o = hr(i, this, e, !s);
      s || (s = {}, o.currentAttributes.forEach((a, c) => {
        s[c] = a;
      })), yi(i, this, o, t, s);
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
    r !== null ? P(r, (i) => {
      const o = hr(i, this, e, !s);
      yi(i, this, o, t, s || {});
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
    s !== null ? P(s, (r) => {
      xa(r, hr(r, this, e, !0), t);
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
    r !== null ? P(r, (i) => {
      const o = hr(i, this, e, !1);
      o.right !== null && Sa(i, this, o, t, s);
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
    this.doc !== null ? P(this.doc, (t) => {
      Lr(t, this, e);
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
    this.doc !== null ? P(this.doc, (s) => {
      Eo(s, this, e, t);
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
      To(this, e)
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
    return Yc(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef($f);
  }
}
const wf = (n) => new F();
class wi {
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
        e.content.type, !e.deleted && (t.constructor === ls || t.constructor === pn) && t._start !== null)
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
class pn extends de {
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
    return new pn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new pn();
    return e.insert(0, this.toArray().map((t) => t instanceof de ? t.clone() : t)), e;
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
    return new wi(this, e);
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
    const s = new wi(this, (r) => r.nodeName && r.nodeName.toUpperCase() === e).next();
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
    return e = e.toUpperCase(), qt(new wi(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, t) {
    ei(this, e, new kf(this, t, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return Hc(this, (e) => e.toString()).join("");
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
    return s !== void 0 && s._createAssociation(r, this), Ks(this, (i) => {
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
    this.doc !== null ? P(this.doc, (s) => {
      Gc(s, this, e, t);
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
      P(this.doc, (s) => {
        const r = e && e instanceof de ? e._item : e;
        Dr(s, this, r, t);
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
    this.doc !== null ? P(this.doc, (s) => {
      qc(s, this, e, t);
    }) : this._prelimContent.splice(e, t);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return zc(this);
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
    return Jc(this, e);
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
    return Zc(this, e, t);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    Ks(this, e);
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
    e.writeTypeRef(jf);
  }
}
const _f = (n) => new pn();
class ls extends pn {
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
    return new ls(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new ls(this.nodeName), t = this.getAttributes();
    return Su(t, (s, r) => {
      e.setAttribute(
        r,
        /** @type {any} */
        s
      );
    }), e.insert(0, this.toArray().map((s) => s instanceof de ? s.clone() : s)), e;
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
    this.doc !== null ? P(this.doc, (t) => {
      Lr(t, this, e);
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
    this.doc !== null ? P(this.doc, (s) => {
      Eo(s, this, e, t);
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
      To(this, e)
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
      Xc(this, e)
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
      e ? lf(this, e) : Yc(this)
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
    return Ks(this, (o) => {
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
    e.writeTypeRef(Uf), e.writeKey(this.nodeName);
  }
}
const vf = (n) => new ls(n.readKey());
class kf extends Xr {
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
class Nr extends N {
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
    return new Nr(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const e = new Nr(this.hookName);
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
    e.writeTypeRef(Bf), e.writeKey(this.hookName);
  }
}
const bf = (n) => new Nr(n.readKey());
class Rr extends F {
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
    return new Rr();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const e = new Rr();
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
    e.writeTypeRef(Kf);
  }
}
const Sf = (n) => new Rr();
class Oo {
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
const xf = 0;
class $e extends Oo {
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
    t > 0 && (this.id.clock += t, this.length -= t), Uc(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, t) {
    e.writeInfo(xf), e.writeLen(this.length - t);
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
class sr {
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
    return new sr(this.content);
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
const If = (n) => new sr(n.readBuf());
class Ps {
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
    return new Ps(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const t = new Ps(this.len - e);
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
    Or(e.deleteSet, t.id.client, t.id.clock, this.len), t.markDeleted();
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
const Cf = (n) => new Ps(n.readLen()), sl = (n, e) => new Jt({ guid: n, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class rr {
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
    return new rr(sl(this.doc.guid, this.opts));
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
const Ef = (n) => new rr(sl(n.readString(), n.readAny()));
class wn {
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
    return new wn(this.embed);
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
const Tf = (n) => new wn(n.readJSON());
class te {
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
    return new te(this.key, this.value);
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
const Of = (n) => new te(n.readKey(), n.readJSON());
class Mr {
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
    return new Mr(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(e) {
    const t = new Mr(this.arr.slice(e));
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
const Af = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++) {
    const r = n.readString();
    r === "undefined" ? t.push(void 0) : t.push(JSON.parse(r));
  }
  return new Mr(t);
}, Df = Ir("node_env") === "development";
class mn {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, Df && nc(e);
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
    return new mn(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const t = new mn(this.arr.slice(e));
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
const Lf = (n) => {
  const e = n.readLen(), t = [];
  for (let s = 0; s < e; s++)
    t.push(n.readAny());
  return new mn(t);
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
const Nf = (n) => new dt(n.readString()), Rf = [
  uf,
  ff,
  wf,
  vf,
  _f,
  bf,
  Sf
], Mf = 0, Vf = 1, $f = 2, Uf = 3, jf = 4, Bf = 5, Kf = 6;
class Tt {
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
    return new Tt(this.type._copy());
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
const Pf = (n) => new Tt(Rf[n.readTypeRef()](n)), Vr = (n, e, t) => {
  const { client: s, clock: r } = e.id, i = new ee(
    R(s, r + t),
    e,
    R(s, r + t - 1),
    e.right,
    e.rightOrigin,
    e.parent,
    e.parentSub,
    e.content.splice(t)
  );
  return e.deleted && i.markDeleted(), e.keep && (i.keep = !0), e.redone !== null && (i.redone = R(e.redone.client, e.redone.clock + t)), e.right = i, i.right !== null && (i.right.left = i), n._mergeStructs.push(i), i.parentSub !== null && i.right === null && i.parent._map.set(i.parentSub, i), e.length = t, i;
};
class ee extends Oo {
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
    super(e, c.getLength()), this.origin = s, this.left = t, this.right = r, this.rightOrigin = i, this.parent = o, this.parentSub = a, this.redone = null, this.content = c, this.info = this.content.isCountable() ? ta : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & li) > 0 !== e && (this.info ^= li);
  }
  get marker() {
    return (this.info & li) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & ea) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= ea);
  }
  get countable() {
    return (this.info & ta) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & ci) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= ci);
  }
  markDeleted() {
    this.info |= ci;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, t) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= re(t, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= re(t, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === Mn && this.id.client !== this.parent.client && this.parent.clock >= re(t, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = wa(e, t, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = Yt(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === $e || this.right && this.right.constructor === $e)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === ee ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === ee && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === Mn) {
      const s = mi(t, this.parent);
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
    if (t > 0 && (this.id.clock += t, this.left = wa(e, e.doc.store, R(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
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
          if (o.add(r), i.add(r), cr(this.origin, r.origin)) {
            if (r.id.client < this.id.client)
              s = r, i.clear();
            else if (cr(this.rightOrigin, r.rightOrigin))
              break;
          } else if (r.origin !== null && o.has(mi(e.doc.store, r.origin)))
            i.has(mi(e.doc.store, r.origin)) || (s = r, i.clear());
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
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), Uc(e.doc.store, this), this.content.integrate(e, this), va(
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
    return this.length === 1 ? this.id : R(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(e) {
    if (this.constructor === e.constructor && cr(e.origin, this.lastId) && this.right === e && cr(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
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
      this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), Or(e.deleteSet, this.id.client, this.id.clock, this.length), va(e, t, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, t) {
    if (!this.deleted)
      throw je();
    this.content.gc(e), t ? Hd(e, this, new $e(this.id, this.length)) : this.content = new Ps(this.length);
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
    const s = t > 0 ? R(this.id.client, this.id.clock + t - 1) : this.origin, r = this.rightOrigin, i = this.parentSub, o = this.content.getRef() & Kr | (s === null ? 0 : Re) | // origin is defined
    (r === null ? 0 : It) | // right origin is defined
    (i === null ? 0 : Ns);
    if (e.writeInfo(o), s !== null && e.writeLeftID(s), r !== null && e.writeRightID(r), s === null && r === null) {
      const a = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const h = Zd(a);
          e.writeParentInfo(!0), e.writeString(h);
        } else
          e.writeParentInfo(!1), e.writeLeftID(c.id);
      } else a.constructor === String ? (e.writeParentInfo(!0), e.writeString(a)) : a.constructor === Mn ? (e.writeParentInfo(!1), e.writeLeftID(a)) : je();
      i !== null && e.writeString(i);
    }
    this.content.write(e, t);
  }
}
const rl = (n, e) => Ff[e & Kr](n), Ff = [
  () => {
    je();
  },
  // GC is not ItemContent
  Cf,
  // 1
  Af,
  // 2
  If,
  // 3
  Nf,
  // 4
  Tf,
  // 5
  Of,
  // 6
  Pf,
  // 7
  Lf,
  // 8
  Ef,
  // 9
  () => {
    je();
  }
  // 10 - Skip is not ItemContent
], Zf = 10;
class Ue extends Oo {
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
    e.writeInfo(Zf), D(e.restEncoder, this.length - t);
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
const il = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), ol = "__ $YJS$ __";
il[ol] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
il[ol] = !0;
var ue = Uint8Array, Ne = Uint16Array, Ao = Int32Array, ti = new ue([
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
]), ni = new ue([
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
]), Bi = new ue([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), al = function(n, e) {
  for (var t = new Ne(31), s = 0; s < 31; ++s)
    t[s] = e += 1 << n[s - 1];
  for (var r = new Ao(t[30]), s = 1; s < 30; ++s)
    for (var i = t[s]; i < t[s + 1]; ++i)
      r[i] = i - t[s] << 5 | s;
  return { b: t, r };
}, cl = al(ti, 2), ll = cl.b, Ki = cl.r;
ll[28] = 258, Ki[258] = 28;
var hl = al(ni, 0), zf = hl.b, Ia = hl.r, Pi = new Ne(32768);
for (var Z = 0; Z < 32768; ++Z) {
  var Dt = (Z & 43690) >> 1 | (Z & 21845) << 1;
  Dt = (Dt & 52428) >> 2 | (Dt & 13107) << 2, Dt = (Dt & 61680) >> 4 | (Dt & 3855) << 4, Pi[Z] = ((Dt & 65280) >> 8 | (Dt & 255) << 8) >> 1;
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
        for (var h = r << 4 | n[r], u = e - n[r], f = o[n[r] - 1]++ << u, g = f | (1 << u) - 1; f <= g; ++f)
          a[Pi[f] >> c] = h;
  } else
    for (a = new Ne(s), r = 0; r < s; ++r)
      n[r] && (a[r] = Pi[o[n[r] - 1]++] >> 15 - n[r]);
  return a;
}), Xt = new ue(288);
for (var Z = 0; Z < 144; ++Z)
  Xt[Z] = 8;
for (var Z = 144; Z < 256; ++Z)
  Xt[Z] = 9;
for (var Z = 256; Z < 280; ++Z)
  Xt[Z] = 7;
for (var Z = 280; Z < 288; ++Z)
  Xt[Z] = 8;
var Fs = new ue(32);
for (var Z = 0; Z < 32; ++Z)
  Fs[Z] = 5;
var Hf = /* @__PURE__ */ ct(Xt, 9, 0), Jf = /* @__PURE__ */ ct(Xt, 9, 1), Wf = /* @__PURE__ */ ct(Fs, 5, 0), Gf = /* @__PURE__ */ ct(Fs, 5, 1), _i = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Pe = function(n, e, t) {
  var s = e / 8 | 0;
  return (n[s] | n[s + 1] << 8) >> (e & 7) & t;
}, vi = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, Do = function(n) {
  return (n + 7) / 8 | 0;
}, ul = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new ue(n.subarray(e, t));
}, qf = [
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
], Ze = function(n, e, t) {
  var s = new Error(e || qf[n]);
  if (s.code = n, Error.captureStackTrace && Error.captureStackTrace(s, Ze), !t)
    throw s;
  return s;
}, Yf = function(n, e, t, s) {
  var r = n.length, i = 0;
  if (!r || e.f && !e.l)
    return t || new ue(0);
  var o = !t, a = o || e.i != 2, c = e.i;
  o && (t = new ue(r * 3));
  var h = function(ps) {
    var ms = t.length;
    if (ps > ms) {
      var kn = new ue(Math.max(ms * 2, ps));
      kn.set(t), t = kn;
    }
  }, u = e.f || 0, f = e.p || 0, g = e.b || 0, m = e.l, w = e.d, S = e.m, W = e.n, Ke = r * 8;
  do {
    if (!m) {
      u = Pe(n, f, 1);
      var be = Pe(n, f + 1, 3);
      if (f += 3, be)
        if (be == 1)
          m = Jf, w = Gf, S = 9, W = 5;
        else if (be == 2) {
          var _e = Pe(n, f, 31) + 257, oe = Pe(n, f + 10, 15) + 4, U = _e + Pe(n, f + 5, 31) + 1;
          f += 14;
          for (var T = new ue(U), ae = new ue(19), X = 0; X < oe; ++X)
            ae[Bi[X]] = Pe(n, f + X * 3, 7);
          f += oe * 3;
          for (var ge = _i(ae), Ot = (1 << ge) - 1, Se = ct(ae, ge, 1), X = 0; X < U; ) {
            var ve = Se[Pe(n, f, Ot)];
            f += ve & 15;
            var ne = ve >> 4;
            if (ne < 16)
              T[X++] = ne;
            else {
              var ce = 0, z = 0;
              for (ne == 16 ? (z = 3 + Pe(n, f, 3), f += 2, ce = T[X - 1]) : ne == 17 ? (z = 3 + Pe(n, f, 7), f += 3) : ne == 18 && (z = 11 + Pe(n, f, 127), f += 7); z--; )
                T[X++] = ce;
            }
          }
          var ke = T.subarray(0, _e), le = T.subarray(_e);
          S = _i(ke), W = _i(le), m = ct(ke, S, 1), w = ct(le, W, 1);
        } else
          Ze(1);
      else {
        var ne = Do(f) + 4, we = n[ne - 4] | n[ne - 3] << 8, fe = ne + we;
        if (fe > r) {
          c && Ze(0);
          break;
        }
        a && h(g + we), t.set(n.subarray(ne, fe), g), e.b = g += we, e.p = f = fe * 8, e.f = u;
        continue;
      }
      if (f > Ke) {
        c && Ze(0);
        break;
      }
    }
    a && h(g + 131072);
    for (var gs = (1 << S) - 1, Ve = (1 << W) - 1, ft = f; ; ft = f) {
      var ce = m[vi(n, f) & gs], xe = ce >> 4;
      if (f += ce & 15, f > Ke) {
        c && Ze(0);
        break;
      }
      if (ce || Ze(2), xe < 256)
        t[g++] = xe;
      else if (xe == 256) {
        ft = f, m = null;
        break;
      } else {
        var Ie = xe - 254;
        if (xe > 264) {
          var X = xe - 257, H = ti[X];
          Ie = Pe(n, f, (1 << H) - 1) + ll[X], f += H;
        }
        var Xe = w[vi(n, f) & Ve], _n = Xe >> 4;
        Xe || Ze(3), f += Xe & 15;
        var le = zf[_n];
        if (_n > 3) {
          var H = ni[_n];
          le += vi(n, f) & (1 << H) - 1, f += H;
        }
        if (f > Ke) {
          c && Ze(0);
          break;
        }
        a && h(g + 131072);
        var vn = g + Ie;
        if (g < le) {
          var ir = i - le, or = Math.min(le, vn);
          for (ir + g < 0 && Ze(3); g < or; ++g)
            t[g] = s[ir + g];
        }
        for (; g < vn; ++g)
          t[g] = t[g - le];
      }
    }
    e.l = m, e.p = ft, e.b = g, e.f = u, m && (u = 1, e.m = S, e.d = w, e.n = W);
  } while (!u);
  return g != t.length && o ? ul(t, 0, g) : t.subarray(0, g);
}, pt = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8;
}, ys = function(n, e, t) {
  t <<= e & 7;
  var s = e / 8 | 0;
  n[s] |= t, n[s + 1] |= t >> 8, n[s + 2] |= t >> 16;
}, ki = function(n, e) {
  for (var t = [], s = 0; s < n.length; ++s)
    n[s] && t.push({ s, f: n[s] });
  var r = t.length, i = t.slice();
  if (!r)
    return { t: fl, l: 0 };
  if (r == 1) {
    var o = new ue(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(fe, _e) {
    return fe.f - _e.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], c = t[1], h = 0, u = 1, f = 2;
  for (t[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != r - 1; )
    a = t[t[h].f < t[f].f ? h++ : f++], c = t[h != u && t[h].f < t[f].f ? h++ : f++], t[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var g = i[0].s, s = 1; s < r; ++s)
    i[s].s > g && (g = i[s].s);
  var m = new Ne(g + 1), w = Fi(t[u - 1], m, 0);
  if (w > e) {
    var s = 0, S = 0, W = w - e, Ke = 1 << W;
    for (i.sort(function(_e, oe) {
      return m[oe.s] - m[_e.s] || _e.f - oe.f;
    }); s < r; ++s) {
      var be = i[s].s;
      if (m[be] > e)
        S += Ke - (1 << w - m[be]), m[be] = e;
      else
        break;
    }
    for (S >>= W; S > 0; ) {
      var ne = i[s].s;
      m[ne] < e ? S -= 1 << e - m[ne]++ - 1 : ++s;
    }
    for (; s >= 0 && S; --s) {
      var we = i[s].s;
      m[we] == e && (--m[we], ++S);
    }
    w = e;
  }
  return { t: new ue(m), l: w };
}, Fi = function(n, e, t) {
  return n.s == -1 ? Math.max(Fi(n.l, e, t + 1), Fi(n.r, e, t + 1)) : e[n.s] = t;
}, Ca = function(n) {
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
}, ws = function(n, e) {
  for (var t = 0, s = 0; s < e.length; ++s)
    t += n[s] * e[s];
  return t;
}, dl = function(n, e, t) {
  var s = t.length, r = Do(e + 2);
  n[r] = s & 255, n[r + 1] = s >> 8, n[r + 2] = n[r] ^ 255, n[r + 3] = n[r + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    n[r + i + 4] = t[i];
  return (r + 4 + s) * 8;
}, Ea = function(n, e, t, s, r, i, o, a, c, h, u) {
  pt(e, u++, t), ++r[256];
  for (var f = ki(r, 15), g = f.t, m = f.l, w = ki(i, 15), S = w.t, W = w.l, Ke = Ca(g), be = Ke.c, ne = Ke.n, we = Ca(S), fe = we.c, _e = we.n, oe = new Ne(19), U = 0; U < be.length; ++U)
    ++oe[be[U] & 31];
  for (var U = 0; U < fe.length; ++U)
    ++oe[fe[U] & 31];
  for (var T = ki(oe, 7), ae = T.t, X = T.l, ge = 19; ge > 4 && !ae[Bi[ge - 1]]; --ge)
    ;
  var Ot = h + 5 << 3, Se = ws(r, Xt) + ws(i, Fs) + o, ve = ws(r, g) + ws(i, S) + o + 14 + 3 * ge + ws(oe, ae) + 2 * oe[16] + 3 * oe[17] + 7 * oe[18];
  if (c >= 0 && Ot <= Se && Ot <= ve)
    return dl(e, u, n.subarray(c, c + h));
  var ce, z, ke, le;
  if (pt(e, u, 1 + (ve < Se)), u += 2, ve < Se) {
    ce = ct(g, m, 0), z = g, ke = ct(S, W, 0), le = S;
    var gs = ct(ae, X, 0);
    pt(e, u, ne - 257), pt(e, u + 5, _e - 1), pt(e, u + 10, ge - 4), u += 14;
    for (var U = 0; U < ge; ++U)
      pt(e, u + 3 * U, ae[Bi[U]]);
    u += 3 * ge;
    for (var Ve = [be, fe], ft = 0; ft < 2; ++ft)
      for (var xe = Ve[ft], U = 0; U < xe.length; ++U) {
        var Ie = xe[U] & 31;
        pt(e, u, gs[Ie]), u += ae[Ie], Ie > 15 && (pt(e, u, xe[U] >> 5 & 127), u += xe[U] >> 12);
      }
  } else
    ce = Hf, z = Xt, ke = Wf, le = Fs;
  for (var U = 0; U < a; ++U) {
    var H = s[U];
    if (H > 255) {
      var Ie = H >> 18 & 31;
      ys(e, u, ce[Ie + 257]), u += z[Ie + 257], Ie > 7 && (pt(e, u, H >> 23 & 31), u += ti[Ie]);
      var Xe = H & 31;
      ys(e, u, ke[Xe]), u += le[Xe], Xe > 3 && (ys(e, u, H >> 5 & 8191), u += ni[Xe]);
    } else
      ys(e, u, ce[H]), u += z[H];
  }
  return ys(e, u, ce[256]), u + z[256];
}, Xf = /* @__PURE__ */ new Ao([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), fl = /* @__PURE__ */ new ue(0), Qf = function(n, e, t, s, r, i) {
  var o = i.z || n.length, a = new ue(s + o + 5 * (1 + Math.ceil(o / 7e3)) + r), c = a.subarray(s, a.length - r), h = i.l, u = (i.r || 0) & 7;
  if (e) {
    u && (c[0] = i.r >> 3);
    for (var f = Xf[e - 1], g = f >> 13, m = f & 8191, w = (1 << t) - 1, S = i.p || new Ne(32768), W = i.h || new Ne(w + 1), Ke = Math.ceil(t / 3), be = 2 * Ke, ne = function(si) {
      return (n[si] ^ n[si + 1] << Ke ^ n[si + 2] << be) & w;
    }, we = new Ao(25e3), fe = new Ne(288), _e = new Ne(32), oe = 0, U = 0, T = i.i || 0, ae = 0, X = i.w || 0, ge = 0; T + 2 < o; ++T) {
      var Ot = ne(T), Se = T & 32767, ve = W[Ot];
      if (S[Se] = ve, W[Ot] = Se, X <= T) {
        var ce = o - T;
        if ((oe > 7e3 || ae > 24576) && (ce > 423 || !h)) {
          u = Ea(n, c, 0, we, fe, _e, U, ae, ge, T - ge, u), ae = oe = U = 0, ge = T;
          for (var z = 0; z < 286; ++z)
            fe[z] = 0;
          for (var z = 0; z < 30; ++z)
            _e[z] = 0;
        }
        var ke = 2, le = 0, gs = m, Ve = Se - ve & 32767;
        if (ce > 2 && Ot == ne(T - Ve))
          for (var ft = Math.min(g, ce) - 1, xe = Math.min(32767, T), Ie = Math.min(258, ce); Ve <= xe && --gs && Se != ve; ) {
            if (n[T + ke] == n[T + ke - Ve]) {
              for (var H = 0; H < Ie && n[T + H] == n[T + H - Ve]; ++H)
                ;
              if (H > ke) {
                if (ke = H, le = Ve, H > ft)
                  break;
                for (var Xe = Math.min(Ve, H - 2), _n = 0, z = 0; z < Xe; ++z) {
                  var vn = T - Ve + z & 32767, ir = S[vn], or = vn - ir & 32767;
                  or > _n && (_n = or, ve = vn);
                }
              }
            }
            Se = ve, ve = S[Se], Ve += Se - ve & 32767;
          }
        if (le) {
          we[ae++] = 268435456 | Ki[ke] << 18 | Ia[le];
          var ps = Ki[ke] & 31, ms = Ia[le] & 31;
          U += ti[ps] + ni[ms], ++fe[257 + ps], ++_e[ms], X = T + ke, ++oe;
        } else
          we[ae++] = n[T], ++fe[n[T]];
      }
    }
    for (T = Math.max(T, X); T < o; ++T)
      we[ae++] = n[T], ++fe[n[T]];
    u = Ea(n, c, h, we, fe, _e, U, ae, ge, T - ge, u), h || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = W, i.p = S, i.i = T, i.w = X);
  } else {
    for (var T = i.w || 0; T < o + h; T += 65535) {
      var kn = T + 65535;
      kn >= o && (c[u / 8 | 0] = h, kn = o), u = dl(c, u + 1, n.subarray(T, kn));
    }
    i.i = o;
  }
  return ul(a, 0, s + Do(u) + r);
}, eg = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, s = 9; --s; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), tg = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, s = 0; s < e.length; ++s)
        t = eg[t & 255 ^ e[s]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, ng = function(n, e, t, s, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), o = new ue(i.length + n.length);
    o.set(i), o.set(n, i.length), n = o, r.w = i.length;
  }
  return Qf(n, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, s, r);
}, Zi = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, sg = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Zi(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var s = 0; s <= t.length; ++s)
      n[s + 10] = t.charCodeAt(s);
  }
}, rg = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Ze(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var s = (e >> 3 & 1) + (e >> 4 & 1); s > 0; s -= !n[t++])
    ;
  return t + (e & 2);
}, ig = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, og = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Ta(n, e) {
  e || (e = {});
  var t = tg(), s = n.length;
  t.p(n);
  var r = ng(n, e, og(e), 8), i = r.length;
  return sg(r, e), Zi(r, i - 8, t.d()), Zi(r, i - 4, s), r;
}
function Oa(n, e) {
  var t = rg(n);
  return t + 8 > n.length && Ze(6, "invalid gzip data"), Yf(n.subarray(t, -8), { i: 2 }, new ue(ig(n)), e);
}
var ag = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), cg = 0;
try {
  ag.decode(fl, { stream: !0 }), cg = 1;
} catch {
}
const gl = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Dn(n, e, t) {
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
      return e.slice(0, o) + Dn(n.slice(o), e.slice(o), t);
  }
  const r = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - r > 1) {
    const o = Math.round(0.5 * (r + i));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Dn(n.slice(1), null, t);
}
function pl(n) {
  if (n.length !== ml(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function ml(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function bs(n) {
  const e = ml(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Aa(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = bs(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Da(n, e) {
  pl(n);
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
function lg(n, e) {
  pl(n);
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
function yt(n, e, t = gl) {
  if (n != null && Aa(n, t), e != null && Aa(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = bs(e), h = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Dn("", h, t);
    if (c < e)
      return c;
    const u = lg(c, t);
    if (u == null)
      throw new Error("cannot decrement any more");
    return u;
  }
  if (e == null) {
    const c = bs(n), h = n.slice(c.length), u = Da(c, t);
    return u ?? c + Dn(h, null, t);
  }
  const s = bs(n), r = n.slice(s.length), i = bs(e), o = e.slice(i.length);
  if (s === i)
    return s + Dn(r, o, t);
  const a = Da(s, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : s + Dn(r, null, t);
}
function zi(n, e, t, s = gl) {
  if (t === 0)
    return [];
  if (t === 1)
    return [yt(n, e, s)];
  {
    let r = yt(n, e, s);
    const i = [r];
    for (let o = 0; o < t - 1; o++)
      r = yt(r, e, s), i.push(r);
    return i;
  }
}
const hg = za().int().nonnegative().optional();
function _s(n) {
  var t;
  const e = hg.safeParse(n);
  if (!e.success)
    throw new j("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function yl(n, e, t, s) {
  const r = n.Id, i = new N();
  i.set("Kind", n.Kind), i.set("outerItemId", e), i.set("OrderKey", t), i.set("Label", new F(n.Label ?? ""));
  const o = new N();
  for (const [a, c] of Object.entries(n.Info ?? {}))
    o.set(a, c);
  if (i.set("Info", o), n.Kind === "item") {
    const a = n, c = a.Type === Sn ? "" : a.Type ?? "";
    switch (i.set("MIMEType", c), !0) {
      case (a.ValueKind === "literal" && a.Value !== void 0): {
        i.set("ValueKind", "literal"), i.set("literalValue", new F(a.Value));
        break;
      }
      case (a.ValueKind === "binary" && a.Value !== void 0): {
        i.set("ValueKind", "binary"), i.set("binaryValue", Ka(a.Value));
        break;
      }
      default:
        i.set("ValueKind", a.ValueKind ?? "none");
    }
    s.set(r, i);
    const h = zi(null, null, (a.innerEntries ?? []).length);
    (a.innerEntries ?? []).forEach((u, f) => {
      yl(u, r, h[f], s);
    });
  } else {
    const a = n;
    i.set("TargetId", a.TargetId ?? ""), s.set(r, i);
  }
}
var tt, I, Zs, Un, _t, jn, De, Vt, $t, nt, st, Ur, nn, Ut, sn, p, Cn, Ss, Nt, yr, Hi, wl, _l, Ee, en, En, xs, Tn, Is, On, vl, Ji, kl, Wi, Gi, L, bl, qi, Yi, Sl;
const tn = class tn extends Jl {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  /**** constructor — initialise store from document and options ****/
  constructor(t, s) {
    var i;
    super();
    _(this, p);
    /**** private state ****/
    _(this, tt);
    _(this, I);
    _(this, Zs);
    _(this, Un);
    _(this, _t, null);
    _(this, jn, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    _(this, De, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId  (kept in sync with #ReverseIndex)
    _(this, Vt, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    _(this, $t, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    _(this, nt, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    _(this, st, /* @__PURE__ */ new Map());
    _(this, Ur, Zl);
    // transaction nesting
    _(this, nn, 0);
    // ChangeSet accumulator inside a transaction
    _(this, Ut, {});
    // suppress index updates / change tracking when applying remote patches
    _(this, sn, !1);
    x(this, tt, t), x(this, I, t.getMap("Entries")), x(this, Zs, (s == null ? void 0 : s.LiteralSizeLimit) ?? Pl), x(this, Un, (s == null ? void 0 : s.TrashTTLms) ?? 2592e6), d(this, p, wl).call(this);
    const r = (s == null ? void 0 : s.TrashCheckIntervalMs) ?? Math.min(Math.floor(l(this, Un) / 4), 36e5);
    x(this, _t, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      r
    )), typeof ((i = l(this, _t)) == null ? void 0 : i.unref) == "function" && l(this, _t).unref();
  }
  /**** fromScratch — build initial document with three well-known items ****/
  static fromScratch(t) {
    const s = new Jt(), r = s.getMap("Entries");
    return s.transact(() => {
      const i = new N();
      i.set("Kind", "item"), i.set("outerItemId", ""), i.set("OrderKey", ""), i.set("Label", new F()), i.set("Info", new N()), i.set("MIMEType", ""), i.set("ValueKind", "none"), r.set(Te, i);
      const o = new N();
      o.set("Kind", "item"), o.set("outerItemId", Te), o.set("OrderKey", "a0"), o.set("Label", new F("trash")), o.set("Info", new N()), o.set("MIMEType", ""), o.set("ValueKind", "none"), r.set(G, o);
      const a = new N();
      a.set("Kind", "item"), a.set("outerItemId", Te), a.set("OrderKey", "a1"), a.set("Label", new F("lost-and-found")), a.set("Info", new N()), a.set("MIMEType", ""), a.set("ValueKind", "none"), r.set(Ce, a);
    }), new tn(s, t);
  }
  /**** fromBinary — restore store from compressed update ****/
  static fromBinary(t, s) {
    const r = new Jt();
    return ga(r, Oa(t)), new tn(r, s);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, s) {
    const r = typeof t == "string" ? JSON.parse(t) : t, i = new Jt(), o = i.getMap("Entries");
    return i.transact(() => {
      yl(r, "", "", o);
    }), new tn(i, s);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — access system items ****/
  get RootItem() {
    return d(this, p, Nt).call(this, Te);
  }
  get TrashItem() {
    return d(this, p, Nt).call(this, G);
  }
  get LostAndFoundItem() {
    return d(this, p, Nt).call(this, Ce);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve entry by Id ****/
  EntryWithId(t) {
    if (l(this, I).has(t))
      return d(this, p, Ss).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, s, r) {
    if (s == null) throw new j("invalid-argument", "outerItem must not be missing");
    const i = t ?? Sn;
    Ai(i), _s(r), d(this, p, Cn).call(this, s.Id);
    const o = crypto.randomUUID(), a = d(this, p, Tn).call(this, s.Id, r), c = i === Sn ? "" : i;
    return this.transact(() => {
      const h = new N();
      h.set("Kind", "item"), h.set("outerItemId", s.Id), h.set("OrderKey", a), h.set("Label", new F()), h.set("Info", new N()), h.set("MIMEType", c), h.set("ValueKind", "none"), l(this, I).set(o, h), d(this, p, Ee).call(this, s.Id, o), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, o, "outerItem");
    }), d(this, p, Nt).call(this, o);
  }
  /**** newLinkAt — create link as inner link of outer data ****/
  newLinkAt(t, s, r) {
    if (t == null) throw new j("invalid-argument", "Target must not be missing");
    if (s == null) throw new j("invalid-argument", "outerItem must not be missing");
    _s(r), d(this, p, Cn).call(this, t.Id), d(this, p, Cn).call(this, s.Id);
    const i = crypto.randomUUID(), o = d(this, p, Tn).call(this, s.Id, r);
    return this.transact(() => {
      const a = new N();
      a.set("Kind", "link"), a.set("outerItemId", s.Id), a.set("OrderKey", o), a.set("Label", new F()), a.set("Info", new N()), a.set("TargetId", t.Id), l(this, I).set(i, a), d(this, p, Ee).call(this, s.Id, i), d(this, p, En).call(this, t.Id, i), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, i, "outerItem");
    }), d(this, p, yr).call(this, i);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, s, r) {
    if (s == null) throw new j("invalid-argument", "outerItem must not be missing");
    _s(r), d(this, p, Cn).call(this, s.Id);
    const i = t;
    if (i == null || i.Kind !== "item")
      throw new j("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const o = /* @__PURE__ */ new Map();
    d(this, p, qi).call(this, i, o);
    const a = d(this, p, Tn).call(this, s.Id, r), c = o.get(i.Id);
    return this.transact(() => {
      d(this, p, Yi).call(this, i, s.Id, a, o), d(this, p, L).call(this, s.Id, "innerEntryList");
    }), d(this, p, Nt).call(this, c);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, s, r) {
    if (s == null) throw new j("invalid-argument", "outerItem must not be missing");
    _s(r), d(this, p, Cn).call(this, s.Id);
    const i = t;
    if (i == null || i.Kind !== "link")
      throw new j("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const o = crypto.randomUUID(), a = d(this, p, Tn).call(this, s.Id, r);
    return this.transact(() => {
      const c = new N();
      c.set("Kind", "link"), c.set("outerItemId", s.Id), c.set("OrderKey", a), c.set("Label", new F(i.Label ?? ""));
      const h = new N();
      for (const [u, f] of Object.entries(i.Info ?? {}))
        h.set(u, f);
      c.set("Info", h), c.set("TargetId", i.TargetId ?? ""), l(this, I).set(o, c), d(this, p, Ee).call(this, s.Id, o), i.TargetId && d(this, p, En).call(this, i.TargetId, o), d(this, p, L).call(this, s.Id, "innerEntryList");
    }), d(this, p, yr).call(this, o);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** moveEntryTo — move entry to new outer data and position ****/
  moveEntryTo(t, s, r) {
    if (_s(r), !this._mayMoveEntryTo(t.Id, s.Id, r))
      throw new j(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const i = this._outerItemIdOf(t.Id), o = d(this, p, Tn).call(this, s.Id, r);
    this.transact(() => {
      const a = l(this, I).get(t.Id);
      if (a.set("outerItemId", s.Id), a.set("OrderKey", o), i === G && s.Id !== G) {
        const c = a.get("Info");
        c instanceof N && c.has("_trashedAt") && (c.delete("_trashedAt"), d(this, p, L).call(this, t.Id, "Info._trashedAt"));
      }
      i != null && (d(this, p, en).call(this, i, t.Id), d(this, p, L).call(this, i, "innerEntryList")), d(this, p, Ee).call(this, s.Id, t.Id), d(this, p, L).call(this, s.Id, "innerEntryList"), d(this, p, L).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const s = d(this, p, On).call(this, t);
    if (s.length === 0)
      return;
    const r = zi(null, null, s.length);
    s.forEach((i, o) => {
      const a = l(this, I).get(i.Id);
      a != null && (a.set("OrderKey", r[o]), d(this, p, L).call(this, i.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new j("delete-not-permitted", "this entry cannot be deleted");
    const s = this._outerItemIdOf(t.Id), r = yt(d(this, p, Is).call(this, G), null);
    this.transact(() => {
      const i = l(this, I).get(t.Id);
      i.set("outerItemId", G), i.set("OrderKey", r);
      let o = i.get("Info");
      o instanceof N || (o = new N(), i.set("Info", o)), o.set("_trashedAt", Date.now()), s != null && (d(this, p, en).call(this, s, t.Id), d(this, p, L).call(this, s, "innerEntryList")), d(this, p, Ee).call(this, G, t.Id), d(this, p, L).call(this, G, "innerEntryList"), d(this, p, L).call(this, t.Id, "outerItem"), d(this, p, L).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry and subtree ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== G)
      throw new j(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, p, vl).call(this, t.Id))
      throw new j(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, p, Gi).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — remove trash items past TTL ****/
  purgeExpiredTrashEntries(t) {
    const s = t ?? l(this, Un);
    if (s == null)
      return 0;
    const r = Date.now(), i = Array.from(l(this, De).get(G) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const a of i) {
      const c = l(this, I).get(a);
      if (c == null || c.get("outerItemId") !== G)
        continue;
      const h = c.get("Info"), u = h instanceof N ? h.get("_trashedAt") : void 0;
      if (typeof u == "number" && !(r - u < s))
        try {
          this.purgeEntry(d(this, p, Ss).call(this, a)), o++;
        } catch {
        }
    }
    return o;
  }
  /**** dispose — cleanup trash timer ****/
  dispose() {
    l(this, _t) != null && (clearInterval(l(this, _t)), x(this, _t, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback in batched transaction ****/
  transact(t) {
    ar(this, nn)._++;
    try {
      l(this, nn) === 1 && !l(this, sn) ? l(this, tt).transact(() => {
        t();
      }) : t();
    } finally {
      if (ar(this, nn)._--, l(this, nn) === 0) {
        const s = { ...l(this, Ut) };
        x(this, Ut, {});
        const r = l(this, sn) ? "external" : "internal";
        d(this, p, bl).call(this, r, s);
      }
    }
  }
  /**** onChangeInvoke — subscribe to change events ****/
  onChangeInvoke(t) {
    return l(this, jn).add(t), () => {
      l(this, jn).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — apply remote changes and update indices ****/
  applyRemotePatch(t) {
    x(this, sn, !0);
    try {
      ga(l(this, tt), t), this.transact(() => {
        d(this, p, _l).call(this);
      });
    } finally {
      x(this, sn, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get state vector for sync ****/
  get currentCursor() {
    return Pd(l(this, tt));
  }
  /**** exportPatch — encode changes since cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? pi(l(this, tt)) : pi(l(this, tt), t);
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = new Set(l(this, I).keys());
    this.transact(() => {
      l(this, I).forEach((s, r) => {
        if (r === Te)
          return;
        const i = s.get("outerItemId");
        if (i && !t.has(i)) {
          const o = yt(d(this, p, Is).call(this, Ce), null);
          s.set("outerItemId", Ce), s.set("OrderKey", o), d(this, p, Ee).call(this, Ce, r), d(this, p, L).call(this, r, "outerItem"), d(this, p, L).call(this, Ce, "innerEntryList");
        }
        if (s.get("Kind") === "link") {
          const o = s.get("TargetId");
          if (o && !t.has(o)) {
            const a = yt(d(this, p, Is).call(this, Ce), null), c = new N();
            c.set("Kind", "data"), c.set("outerItemId", Ce), c.set("OrderKey", a), c.set("Label", new F()), c.set("Info", new N()), c.set("MIMEType", ""), c.set("ValueKind", "none"), l(this, I).set(o, c), d(this, p, Ee).call(this, Ce, o), t.add(o), d(this, p, L).call(this, Ce, "innerEntryList");
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
    return Ta(pi(l(this, tt)));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, s, r) {
    const i = new TextDecoder().decode(Oa(t));
    return this.newEntryFromJSONat(JSON.parse(i), s, r);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const s = JSON.stringify(this._EntryAsJSON(t));
    return Ta(new TextEncoder().encode(s));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind ****/
  _KindOf(t) {
    const s = l(this, I).get(t);
    if (s == null)
      throw new j("not-found", `entry '${t}' not found`);
    return s.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const s = l(this, I).get(t);
    if (s == null)
      return "";
    const r = s.get("Label");
    return r instanceof F ? r.toString() : String(r ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, s) {
    Ha(s), this.transact(() => {
      const r = l(this, I).get(t);
      if (r == null)
        return;
      let i = r.get("Label");
      i instanceof F ? (i.delete(0, i.length), s.length > 0 && i.insert(0, s)) : (i = new F(s), r.set("Label", i)), d(this, p, L).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get data MIME type ****/
  _TypeOf(t) {
    const s = l(this, I).get(t), r = (s == null ? void 0 : s.get("MIMEType")) ?? "";
    return r === "" ? Sn : r;
  }
  /**** _setTypeOf — set data MIME type ****/
  _setTypeOf(t, s) {
    Ai(s);
    const r = s === Sn ? "" : s;
    this.transact(() => {
      var i;
      (i = l(this, I).get(t)) == null || i.set("MIMEType", r), d(this, p, L).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get data value kind ****/
  _ValueKindOf(t) {
    const s = l(this, I).get(t);
    return (s == null ? void 0 : s.get("ValueKind")) ?? "none";
  }
  /**** _readValueOf — get data value (literal or binary) ****/
  async _readValueOf(t) {
    const s = this._ValueKindOf(t);
    switch (!0) {
      case s === "none":
        return;
      case s === "literal": {
        const r = l(this, I).get(t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : i ?? "";
      }
      case s === "binary": {
        const r = l(this, I).get(t);
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
      const r = l(this, I).get(t);
      if (r != null) {
        switch (!0) {
          case s == null: {
            r.set("ValueKind", "none");
            break;
          }
          case (typeof s == "string" && s.length <= l(this, Zs)): {
            r.set("ValueKind", "literal");
            let i = r.get("literalValue");
            i instanceof F ? (i.delete(0, i.length), s.length > 0 && i.insert(0, s)) : (i = new F(s), r.set("literalValue", i));
            break;
          }
          case typeof s == "string": {
            const o = new TextEncoder().encode(s), a = tn._blobHash(o);
            this._storeValueBlob(a, o), r.set("ValueKind", "literal-reference"), r.set("ValueRef", { Hash: a, Size: o.byteLength });
            break;
          }
          case s.byteLength <= Fl: {
            r.set("ValueKind", "binary"), r.set("binaryValue", s);
            break;
          }
          default: {
            const i = s, o = tn._blobHash(i);
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
      throw new j(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const o = l(this, I).get(t), a = o == null ? void 0 : o.get("literalValue");
      if (a instanceof F) {
        const c = r - s;
        c > 0 && a.delete(s, c), i.length > 0 && a.insert(s, i);
      }
      d(this, p, L).call(this, t, "Value");
    });
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const s = l(this, I).get(t);
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
        const o = l(s, I).get(t), a = o == null ? void 0 : o.get("Info");
        return a instanceof N ? a.get(i) : void 0;
      },
      set(r, i, o) {
        return typeof i != "string" ? !1 : o === void 0 ? (s.transact(() => {
          var h;
          const a = l(s, I).get(t), c = a == null ? void 0 : a.get("Info");
          c instanceof N && c.has(i) && (c.delete(i), d(h = s, p, L).call(h, t, `Info.${i}`));
        }), !0) : (Oh(i), Ah(o), s.transact(() => {
          var h;
          const a = l(s, I).get(t);
          if (a == null)
            return;
          let c = a.get("Info");
          c instanceof N || (c = new N(), a.set("Info", c)), c.set(i, o), d(h = s, p, L).call(h, t, `Info.${i}`);
        }), !0);
      },
      deleteProperty(r, i) {
        return typeof i != "string" ? !1 : (s.transact(() => {
          var c;
          const o = l(s, I).get(t), a = o == null ? void 0 : o.get("Info");
          a instanceof N && a.has(i) && (a.delete(i), d(c = s, p, L).call(c, t, `Info.${i}`));
        }), !0);
      },
      ownKeys() {
        const r = l(s, I).get(t), i = r == null ? void 0 : r.get("Info");
        return i instanceof N ? Array.from(i.keys()) : [];
      },
      getOwnPropertyDescriptor(r, i) {
        if (typeof i != "string")
          return;
        const o = l(s, I).get(t), a = o == null ? void 0 : o.get("Info");
        if (!(a instanceof N))
          return;
        const c = a.get(i);
        return c !== void 0 ? { configurable: !0, enumerable: !0, value: c } : void 0;
      }
    });
  }
  /**** _outerItemIdOf — get outer item Id ****/
  _outerItemIdOf(t) {
    const s = l(this, I).get(t), r = s == null ? void 0 : s.get("outerItemId");
    return r != null && r !== "" ? r : void 0;
  }
  /**** _innerEntriesOf — get sorted children as array-like proxy ****/
  _innerEntriesOf(t) {
    const s = this, r = d(this, p, On).call(this, t);
    return new Proxy([], {
      get(i, o) {
        var a;
        if (o === "length")
          return r.length;
        if (o === Symbol.iterator)
          return function* () {
            var c;
            for (let h = 0; h < r.length; h++)
              yield d(c = s, p, Ss).call(c, r[h].Id);
          };
        if (typeof o == "string" && !isNaN(Number(o))) {
          const c = Number(o);
          return c >= 0 && c < r.length ? d(a = s, p, Ss).call(a, r[c].Id) : void 0;
        }
        return i[o];
      }
    });
  }
  /**** _mayMoveEntryTo — check move validity ****/
  _mayMoveEntryTo(t, s, r) {
    return t === Te || t === s ? !1 : t === G || t === Ce ? s === Te : !d(this, p, Sl).call(this, s, t);
  }
  /**** _mayDeleteEntry — check delete validity ****/
  _mayDeleteEntry(t) {
    return t !== Te && t !== G && t !== Ce;
  }
  /**** _TargetOf — get link target data ****/
  _TargetOf(t) {
    const s = l(this, I).get(t), r = s == null ? void 0 : s.get("TargetId");
    if (!r)
      throw new j("not-found", `link '${t}' has no target`);
    return d(this, p, Nt).call(this, r);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const s = this._ValueKindOf(t);
    switch (!0) {
      case s === "literal": {
        const r = l(this, I).get(t), i = r == null ? void 0 : r.get("literalValue");
        return i instanceof F ? i.toString() : i ?? "";
      }
      case s === "binary": {
        const r = l(this, I).get(t);
        return r == null ? void 0 : r.get("binaryValue");
      }
      default:
        return;
    }
  }
};
tt = new WeakMap(), I = new WeakMap(), Zs = new WeakMap(), Un = new WeakMap(), _t = new WeakMap(), jn = new WeakMap(), De = new WeakMap(), Vt = new WeakMap(), $t = new WeakMap(), nt = new WeakMap(), st = new WeakMap(), Ur = new WeakMap(), nn = new WeakMap(), Ut = new WeakMap(), sn = new WeakMap(), p = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #requireItemExists — throw if data does not exist ****/
Cn = function(t) {
  const s = l(this, I).get(t);
  if (s == null || s.get("Kind") !== "item")
    throw new j("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped — return cached wrapper objects ****/
Ss = function(t) {
  const s = l(this, I).get(t);
  if (s == null)
    throw new j("invalid-argument", `entry '${t}' not found`);
  return s.get("Kind") === "item" ? d(this, p, Nt).call(this, t) : d(this, p, yr).call(this, t);
}, /**** #wrappedItem — return or create cached wrapper for data ****/
Nt = function(t) {
  const s = l(this, st).get(t);
  if (s instanceof Xo)
    return s;
  const r = new Xo(this, t);
  return d(this, p, Hi).call(this, t, r), r;
}, /**** #wrappedLink — return or create cached wrapper for link ****/
yr = function(t) {
  const s = l(this, st).get(t);
  if (s instanceof Qo)
    return s;
  const r = new Qo(this, t);
  return d(this, p, Hi).call(this, t, r), r;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
Hi = function(t, s) {
  if (l(this, st).size >= l(this, Ur)) {
    const r = l(this, st).keys().next().value;
    r != null && l(this, st).delete(r);
  }
  l(this, st).set(t, s);
}, /**** #rebuildIndices — full rebuild used during construction ****/
wl = function() {
  l(this, De).clear(), l(this, Vt).clear(), l(this, $t).clear(), l(this, nt).clear(), l(this, I).forEach((t, s) => {
    const r = t.get("outerItemId");
    if (r && d(this, p, Ee).call(this, r, s), t.get("Kind") === "link") {
      const i = t.get("TargetId");
      i && d(this, p, En).call(this, i, s);
    }
  });
}, /**** #updateIndicesFromView — incremental diff after remote patches ****/
_l = function() {
  const t = /* @__PURE__ */ new Set();
  l(this, I).forEach((i, o) => {
    t.add(o);
    const a = i.get("outerItemId") || void 0, c = l(this, Vt).get(o);
    switch (a !== c && (c != null && (d(this, p, en).call(this, c, o), d(this, p, L).call(this, c, "innerEntryList")), a != null && (d(this, p, Ee).call(this, a, o), d(this, p, L).call(this, a, "innerEntryList")), d(this, p, L).call(this, o, "outerItem")), !0) {
      case i.get("Kind") === "link": {
        const h = i.get("TargetId"), u = l(this, nt).get(o);
        h !== u && (u != null && d(this, p, xs).call(this, u, o), h != null && d(this, p, En).call(this, h, o));
        break;
      }
      case l(this, nt).has(o):
        d(this, p, xs).call(this, l(this, nt).get(o), o);
        break;
    }
    d(this, p, L).call(this, o, "Label");
  });
  const s = Array.from(l(this, Vt).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of s)
    d(this, p, en).call(this, o, i), d(this, p, L).call(this, o, "innerEntryList");
  const r = Array.from(l(this, nt).entries()).filter(([i]) => !t.has(i));
  for (const [i, o] of r)
    d(this, p, xs).call(this, o, i);
}, /**** #addToReverseIndex — add entry to reverse index ****/
Ee = function(t, s) {
  let r = l(this, De).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), l(this, De).set(t, r)), r.add(s), l(this, Vt).set(s, t);
}, /**** #removeFromReverseIndex — remove entry from reverse index ****/
en = function(t, s) {
  var r;
  (r = l(this, De).get(t)) == null || r.delete(s), l(this, Vt).delete(s);
}, /**** #addToLinkTargetIndex — add link to target index ****/
En = function(t, s) {
  let r = l(this, $t).get(t);
  r == null && (r = /* @__PURE__ */ new Set(), l(this, $t).set(t, r)), r.add(s), l(this, nt).set(s, t);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
xs = function(t, s) {
  var r;
  (r = l(this, $t).get(t)) == null || r.delete(s), l(this, nt).delete(s);
}, /**** #OrderKeyAt — generate fractional key at insertion position ****/
Tn = function(t, s) {
  const r = (a) => {
    if (a.length === 0 || s == null) {
      const h = a.length > 0 ? a[a.length - 1].OrderKey : null;
      return yt(h, null);
    }
    const c = Math.max(0, Math.min(s, a.length));
    return yt(
      c > 0 ? a[c - 1].OrderKey : null,
      c < a.length ? a[c].OrderKey : null
    );
  };
  let i = d(this, p, On).call(this, t);
  const o = r(i);
  return o.length <= zl ? o : (this._rebalanceInnerEntriesOf(t), r(d(this, p, On).call(this, t)));
}, /**** #lastOrderKeyOf — get last inner entry's order key ****/
Is = function(t) {
  const s = d(this, p, On).call(this, t);
  return s.length > 0 ? s[s.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/
On = function(t) {
  const s = l(this, De).get(t) ?? /* @__PURE__ */ new Set(), r = [];
  for (const i of s) {
    const o = l(this, I).get(i);
    (o == null ? void 0 : o.get("outerItemId")) === t && r.push({ Id: i, OrderKey: o.get("OrderKey") ?? "" });
  }
  return r.sort((i, o) => i.OrderKey < o.OrderKey ? -1 : i.OrderKey > o.OrderKey ? 1 : i.Id < o.Id ? -1 : i.Id > o.Id ? 1 : 0), r;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
vl = function(t) {
  const s = d(this, p, Wi).call(this), r = /* @__PURE__ */ new Set();
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const o of l(this, De).get(G) ?? /* @__PURE__ */ new Set())
      r.has(o) || d(this, p, Ji).call(this, o, s, r) && (r.add(o), i = !0);
  }
  return r.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has root-reachable links ****/
Ji = function(t, s, r) {
  const i = [t], o = /* @__PURE__ */ new Set();
  for (; i.length > 0; ) {
    const a = i.pop();
    if (o.has(a))
      continue;
    o.add(a);
    const c = l(this, $t).get(a) ?? /* @__PURE__ */ new Set();
    for (const h of c) {
      if (s.has(h))
        return !0;
      const u = d(this, p, kl).call(this, h);
      if (u != null && r.has(u))
        return !0;
    }
    for (const h of l(this, De).get(a) ?? /* @__PURE__ */ new Set())
      o.has(h) || i.push(h);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
kl = function(t) {
  let s = t;
  for (; s != null; ) {
    const r = this._outerItemIdOf(s);
    if (r === G)
      return s;
    if (r === Te || r == null)
      return null;
    s = r;
  }
  return null;
}, /**** #reachableFromRoot — get all entries reachable from root ****/
Wi = function() {
  const t = /* @__PURE__ */ new Set(), s = [Te];
  for (; s.length > 0; ) {
    const r = s.pop();
    if (!t.has(r)) {
      t.add(r);
      for (const i of l(this, De).get(r) ?? /* @__PURE__ */ new Set())
        t.has(i) || s.push(i);
    }
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
Gi = function(t) {
  const s = l(this, I).get(t);
  if (s == null)
    return;
  const r = s.get("Kind"), i = s.get("outerItemId"), o = d(this, p, Wi).call(this), a = /* @__PURE__ */ new Set(), c = Array.from(l(this, De).get(t) ?? /* @__PURE__ */ new Set());
  for (const h of c)
    if (d(this, p, Ji).call(this, h, o, a)) {
      const u = l(this, I).get(h), f = yt(d(this, p, Is).call(this, G), null);
      u.set("outerItemId", G), u.set("OrderKey", f), d(this, p, en).call(this, t, h), d(this, p, Ee).call(this, G, h), d(this, p, L).call(this, G, "innerEntryList"), d(this, p, L).call(this, h, "outerItem");
    } else
      d(this, p, Gi).call(this, h);
  if (d(this, p, L).call(this, t, "Existence"), l(this, I).delete(t), i && (d(this, p, en).call(this, i, t), d(this, p, L).call(this, i, "innerEntryList")), r === "link") {
    const h = s.get("TargetId");
    h && d(this, p, xs).call(this, h, t);
  }
  l(this, st).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
L = function(t, s) {
  l(this, Ut)[t] == null && (l(this, Ut)[t] = /* @__PURE__ */ new Set()), l(this, Ut)[t].add(s);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
bl = function(t, s) {
  if (Object.keys(s).length !== 0)
    for (const r of l(this, jn))
      try {
        r(t, s);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
qi = function(t, s) {
  if (s.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const r of t.innerEntries ?? [])
      d(this, p, qi).call(this, r, s);
}, /**** #importEntryFromJSON — recursively create a Y.js entry and update indices ****/
Yi = function(t, s, r, i) {
  const o = i.get(t.Id), a = new N();
  a.set("Kind", t.Kind), a.set("outerItemId", s), a.set("OrderKey", r), a.set("Label", new F(t.Label ?? ""));
  const c = new N();
  for (const [h, u] of Object.entries(t.Info ?? {}))
    c.set(h, u);
  if (a.set("Info", c), t.Kind === "item") {
    const h = t, u = h.Type === Sn ? "" : h.Type ?? "";
    switch (a.set("MIMEType", u), !0) {
      case (h.ValueKind === "literal" && h.Value !== void 0): {
        a.set("ValueKind", "literal"), a.set("literalValue", new F(h.Value));
        break;
      }
      case (h.ValueKind === "binary" && h.Value !== void 0): {
        a.set("ValueKind", "binary"), a.set("binaryValue", Ka(h.Value));
        break;
      }
      default:
        a.set("ValueKind", h.ValueKind ?? "none");
    }
    l(this, I).set(o, a), d(this, p, Ee).call(this, s, o);
    const f = zi(null, null, (h.innerEntries ?? []).length);
    (h.innerEntries ?? []).forEach((g, m) => {
      d(this, p, Yi).call(this, g, o, f[m], i);
    });
  } else {
    const h = t, u = i.has(h.TargetId) ? i.get(h.TargetId) : h.TargetId;
    a.set("TargetId", u ?? ""), l(this, I).set(o, a), d(this, p, Ee).call(this, s, o), u && d(this, p, En).call(this, u, o);
  }
}, /**** #isDescendantOf — check ancestor relationship ****/
Sl = function(t, s) {
  let r = t;
  for (; r != null; ) {
    if (r === s)
      return !0;
    r = this._outerItemIdOf(r);
  }
  return !1;
};
let La = tn;
const Na = 1, Ra = 2, Ma = 3, Va = 4, $a = 5, et = 32, ur = 1024 * 1024;
function bi(...n) {
  const e = n.reduce((r, i) => r + i.byteLength, 0), t = new Uint8Array(e);
  let s = 0;
  for (const r of n)
    t.set(r, s), s += r.byteLength;
  return t;
}
function vs(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function Ua(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function ja(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var vt, kt, zs, Bn, rn, Kn, on, Pn, Fn, Zn, Hs, J, Xi, An, Cs, xl, Il, Cl;
class gg {
  /**** constructor ****/
  constructor(e) {
    _(this, J);
    At(this, "StoreId");
    _(this, vt, "disconnected");
    _(this, kt);
    _(this, zs, "");
    _(this, Bn);
    _(this, rn);
    _(this, Kn, /* @__PURE__ */ new Set());
    _(this, on, /* @__PURE__ */ new Set());
    _(this, Pn, /* @__PURE__ */ new Set());
    _(this, Fn, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    _(this, Zn, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    _(this, Hs, /* @__PURE__ */ new Map());
    this.StoreId = e;
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, vt);
  }
  /**** connect ****/
  async connect(e, t) {
    return x(this, zs, e), x(this, Bn, t), d(this, J, Xi).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, J, Il).call(this), d(this, J, Cs).call(this, "disconnected"), (e = l(this, kt)) == null || e.close(), x(this, kt, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, J, An).call(this, vs(Na, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const s = Ua(e);
    if (t.byteLength <= ur)
      d(this, J, An).call(this, vs(Ra, bi(s, t)));
    else {
      const r = Math.ceil(t.byteLength / ur);
      for (let i = 0; i < r; i++) {
        const o = i * ur, a = t.slice(o, o + ur), c = new Uint8Array(et + 8);
        c.set(s, 0), new DataView(c.buffer).setUint32(et, i, !1), new DataView(c.buffer).setUint32(et + 4, r, !1), d(this, J, An).call(this, vs($a, bi(c, a)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, J, An).call(this, vs(Ma, Ua(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return l(this, Kn).add(e), () => {
      l(this, Kn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, on).add(e), () => {
      l(this, on).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Pn).add(e), () => {
      l(this, Pn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SDS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, J, An).call(this, vs(Va, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return l(this, Fn).add(e), () => {
      l(this, Fn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, Hs);
  }
}
vt = new WeakMap(), kt = new WeakMap(), zs = new WeakMap(), Bn = new WeakMap(), rn = new WeakMap(), Kn = new WeakMap(), on = new WeakMap(), Pn = new WeakMap(), Fn = new WeakMap(), Zn = new WeakMap(), Hs = new WeakMap(), J = new WeakSet(), /**** #doConnect ****/
Xi = function() {
  return new Promise((e, t) => {
    const s = `${l(this, zs)}?token=${encodeURIComponent(l(this, Bn).Token)}`, r = new WebSocket(s);
    r.binaryType = "arraybuffer", x(this, kt, r), d(this, J, Cs).call(this, "connecting"), r.onopen = () => {
      d(this, J, Cs).call(this, "connected"), e();
    }, r.onerror = (i) => {
      l(this, vt) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      x(this, kt, void 0), l(this, vt) !== "disconnected" && (d(this, J, Cs).call(this, "reconnecting"), d(this, J, xl).call(this));
    }, r.onmessage = (i) => {
      d(this, J, Cl).call(this, new Uint8Array(i.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
An = function(e) {
  var t;
  ((t = l(this, kt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, kt).send(e);
}, /**** #setState ****/
Cs = function(e) {
  if (l(this, vt) !== e) {
    x(this, vt, e);
    for (const t of l(this, Pn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
xl = function() {
  var t;
  const e = ((t = l(this, Bn)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  x(this, rn, setTimeout(() => {
    l(this, vt) === "reconnecting" && d(this, J, Xi).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Il = function() {
  l(this, rn) != null && (clearTimeout(l(this, rn)), x(this, rn, void 0));
}, /**** #handleFrame ****/
Cl = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], s = e.slice(1);
  switch (t) {
    case Na: {
      for (const r of l(this, Kn))
        try {
          r(s);
        } catch {
        }
      break;
    }
    case Ra: {
      if (s.byteLength < et)
        return;
      const r = ja(s.slice(0, et)), i = s.slice(et);
      for (const o of l(this, on))
        try {
          o(r, i);
        } catch {
        }
      break;
    }
    case Ma:
      break;
    case Va: {
      try {
        const r = JSON.parse(new TextDecoder().decode(s));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), l(this, Hs).set(r.PeerId, r);
        for (const i of l(this, Fn))
          try {
            i(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case $a: {
      if (s.byteLength < et + 8)
        return;
      const r = ja(s.slice(0, et)), i = new DataView(s.buffer, s.byteOffset + et, 8), o = i.getUint32(0, !1), a = i.getUint32(4, !1), c = s.slice(et + 8);
      let h = l(this, Zn).get(r);
      if (h == null && (h = { total: a, chunks: /* @__PURE__ */ new Map() }, l(this, Zn).set(r, h)), h.chunks.set(o, c), h.chunks.size === h.total) {
        const u = bi(
          ...Array.from({ length: h.total }, (f, g) => h.chunks.get(g))
        );
        l(this, Zn).delete(r);
        for (const f of l(this, on))
          try {
            f(r, u);
          } catch {
          }
      }
      break;
    }
  }
};
var Js, ze, pe, jt, rt, He, Bt, zn, Hn, Jn, an, Wn, Le, $, Es, Ts, El, Tl, Ol, Qi, eo, Al, to, Dl;
class pg {
  /**** Constructor ****/
  constructor(e, t = {}) {
    _(this, $);
    At(this, "StoreId");
    _(this, Js);
    _(this, ze, crypto.randomUUID());
    _(this, pe);
    /**** Signalling WebSocket ****/
    _(this, jt);
    /**** active RTCPeerConnection per remote PeerId ****/
    _(this, rt, /* @__PURE__ */ new Map());
    _(this, He, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    _(this, Bt, "disconnected");
    /**** Event Handlers ****/
    _(this, zn, /* @__PURE__ */ new Set());
    _(this, Hn, /* @__PURE__ */ new Set());
    _(this, Jn, /* @__PURE__ */ new Set());
    _(this, an, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    _(this, Wn, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    _(this, Le, !1);
    this.StoreId = e, x(this, Js, t), x(this, pe, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SDS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, Bt);
  }
  /**** connect ****/
  async connect(e, t) {
    if (!/^wss?:\/\/.+\/signal\/.+/.test(e))
      throw new TypeError(
        `SDS WebRTC: invalid signalling URL '${e}' — expected wss://<host>/signal/<storeId>`
      );
    return new Promise((s, r) => {
      const i = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(i);
      x(this, jt, o), d(this, $, Es).call(this, "connecting"), o.onopen = () => {
        d(this, $, Es).call(this, "connected"), d(this, $, Ts).call(this, { type: "hello", from: l(this, ze) }), s();
      }, o.onerror = () => {
        if (!l(this, Le) && l(this, pe) != null) {
          const a = e.replace("/signal/", "/ws/");
          x(this, Le, !0), l(this, pe).connect(a, t).then(s).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        l(this, Bt) !== "disconnected" && (d(this, $, Es).call(this, "reconnecting"), setTimeout(() => {
          l(this, Bt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (a) => {
        try {
          const c = JSON.parse(a.data);
          d(this, $, El).call(this, c, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, $, Es).call(this, "disconnected"), (e = l(this, jt)) == null || e.close(), x(this, jt, void 0);
    for (const t of l(this, rt).values())
      t.close();
    l(this, rt).clear(), l(this, He).clear(), l(this, Le) && l(this, pe) != null && (l(this, pe).disconnect(), x(this, Le, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var s;
    if (l(this, Le)) {
      (s = l(this, pe)) == null || s.sendPatch(e);
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
    if (l(this, Le)) {
      (i = l(this, pe)) == null || i.sendValue(e, t);
      return;
    }
    const s = d(this, $, to).call(this, e), r = new Uint8Array(33 + t.byteLength);
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
    if (l(this, Le)) {
      (r = l(this, pe)) == null || r.requestValue(e);
      return;
    }
    const t = d(this, $, to).call(this, e), s = new Uint8Array(33);
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
    return l(this, zn).add(e), l(this, Le) && l(this, pe) != null ? l(this, pe).onPatch(e) : () => {
      l(this, zn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return l(this, Hn).add(e), l(this, Le) && l(this, pe) != null ? l(this, pe).onValue(e) : () => {
      l(this, Hn).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Jn).add(e), () => {
      l(this, Jn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (l(this, Le)) {
      (r = l(this, pe)) == null || r.sendLocalState(e);
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
    return l(this, an).add(e), () => {
      l(this, an).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return l(this, Wn);
  }
}
Js = new WeakMap(), ze = new WeakMap(), pe = new WeakMap(), jt = new WeakMap(), rt = new WeakMap(), He = new WeakMap(), Bt = new WeakMap(), zn = new WeakMap(), Hn = new WeakMap(), Jn = new WeakMap(), an = new WeakMap(), Wn = new WeakMap(), Le = new WeakMap(), $ = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
Es = function(e) {
  if (l(this, Bt) !== e) {
    x(this, Bt, e);
    for (const t of l(this, Jn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
Ts = function(e) {
  var t;
  ((t = l(this, jt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && l(this, jt).send(JSON.stringify(e));
}, El = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === l(this, ze))
        return;
      l(this, rt).has(e.from) || await d(this, $, Tl).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== l(this, ze))
        return;
      await d(this, $, Ol).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== l(this, ze))
        return;
      const s = l(this, rt).get(e.from);
      s != null && await s.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== l(this, ze))
        return;
      const s = l(this, rt).get(e.from);
      s != null && await s.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, Tl = async function(e) {
  const t = d(this, $, Qi).call(this, e), s = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  d(this, $, eo).call(this, s, e), l(this, He).set(e, s);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, $, Ts).call(this, { type: "offer", from: l(this, ze), to: e, sdp: r });
}, Ol = async function(e, t) {
  const s = d(this, $, Qi).call(this, e);
  await s.setRemoteDescription(new RTCSessionDescription(t));
  const r = await s.createAnswer();
  await s.setLocalDescription(r), d(this, $, Ts).call(this, { type: "answer", from: l(this, ze), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Qi = function(e) {
  const t = l(this, Js).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], s = new RTCPeerConnection({ iceServers: t });
  return l(this, rt).set(e, s), s.onicecandidate = (r) => {
    r.candidate != null && d(this, $, Ts).call(this, {
      type: "candidate",
      from: l(this, ze),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, s.ondatachannel = (r) => {
    d(this, $, eo).call(this, r.channel, e), l(this, He).set(e, r.channel);
  }, s.onconnectionstatechange = () => {
    if (s.connectionState === "failed" || s.connectionState === "closed") {
      l(this, rt).delete(e), l(this, He).delete(e), l(this, Wn).delete(e);
      for (const r of l(this, an))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, s;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
eo = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (s) => {
    const r = new Uint8Array(s.data);
    d(this, $, Al).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Al = function(e, t) {
  if (e.byteLength < 1)
    return;
  const s = e[0], r = e.slice(1);
  switch (s) {
    case 1: {
      for (const i of l(this, zn))
        try {
          i(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const i = d(this, $, Dl).call(this, r.slice(0, 32)), o = r.slice(32);
      for (const a of l(this, Hn))
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
        i.lastSeen = Date.now(), l(this, Wn).set(i.PeerId, i);
        for (const o of l(this, an))
          try {
            o(i.PeerId, i);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
to = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let s = 0; s < e.length; s += 2)
    t[s / 2] = parseInt(e.slice(s, s + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Dl = function(e) {
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
function Lt(n, e, t) {
  return n.transaction(e, t);
}
var bt, Je, Ws, We, mt;
class mg {
  /**** constructor ****/
  constructor(e) {
    _(this, We);
    _(this, bt);
    _(this, Je);
    _(this, Ws);
    x(this, Je, e), x(this, Ws, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, We, mt).call(this), t = Lt(e, ["snapshots"], "readonly"), s = await Fe(
      t.objectStore("snapshots").get(l(this, Je))
    );
    return s != null ? s.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await d(this, We, mt).call(this), s = Lt(t, ["snapshots"], "readwrite");
    await Fe(
      s.objectStore("snapshots").put({
        storeId: l(this, Je),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await d(this, We, mt).call(this), r = Lt(t, ["patches"], "readonly").objectStore("patches"), i = IDBKeyRange.bound(
      [l(this, Je), e + 1],
      [l(this, Je), Number.MAX_SAFE_INTEGER]
    );
    return (await Fe(
      r.getAll(i)
    )).sort((a, c) => a.clock - c.clock).map((a) => a.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const s = await d(this, We, mt).call(this), r = Lt(s, ["patches"], "readwrite");
    try {
      await Fe(
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
    const t = await d(this, We, mt).call(this), r = Lt(t, ["patches"], "readwrite").objectStore("patches"), i = IDBKeyRange.bound(
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
    const t = await d(this, We, mt).call(this), s = Lt(t, ["values"], "readonly"), r = await Fe(
      s.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const s = await d(this, We, mt).call(this), i = Lt(s, ["values"], "readwrite").objectStore("values"), o = await Fe(
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
    const t = await d(this, We, mt).call(this), r = Lt(t, ["values"], "readwrite").objectStore("values"), i = await Fe(
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
    (e = l(this, bt)) == null || e.close(), x(this, bt, void 0);
  }
}
bt = new WeakMap(), Je = new WeakMap(), Ws = new WeakMap(), We = new WeakSet(), mt = async function() {
  return l(this, bt) != null ? l(this, bt) : new Promise((e, t) => {
    const s = indexedDB.open(l(this, Ws), 1);
    s.onupgradeneeded = (r) => {
      const i = r.target.result;
      i.objectStoreNames.contains("snapshots") || i.createObjectStore("snapshots", { keyPath: "storeId" }), i.objectStoreNames.contains("patches") || i.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), i.objectStoreNames.contains("values") || i.createObjectStore("values", { keyPath: "hash" });
    }, s.onsuccess = (r) => {
      x(this, bt, r.target.result), e(l(this, bt));
    }, s.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const ug = 512 * 1024;
var he, q, K, Kt, Gn, qn, Gs, qs, cn, Yn, Pt, Xn, ln, hn, un, St, Ft, Ge, Ys, Qn, xt, it, B, Ll, Nl, Rl, Ml, Vl, no, $l, so, Ul, jl, ro;
class yg {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    _(this, B);
    _(this, he);
    _(this, q);
    _(this, K);
    _(this, Kt);
    _(this, Gn);
    At(this, "PeerId", crypto.randomUUID());
    _(this, qn);
    _(this, Gs);
    _(this, qs, []);
    // outgoing patch queue (patches created while disconnected)
    _(this, cn, 0);
    // accumulated patch bytes since last checkpoint
    _(this, Yn, 0);
    // sequence number of the last saved snapshot
    _(this, Pt, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the DataStore owns the format.
    _(this, Xn, new Uint8Array(0));
    // heartbeat timer
    _(this, ln);
    _(this, hn);
    // presence peer tracking
    _(this, un, /* @__PURE__ */ new Map());
    _(this, St, /* @__PURE__ */ new Map());
    _(this, Ft, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    _(this, Ge);
    // connection state mirror
    _(this, Ys, "disconnected");
    _(this, Qn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    _(this, xt, []);
    // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
    // used to call releaseValue() when the entry's value changes or the entry is purged
    _(this, it, /* @__PURE__ */ new Map());
    x(this, he, e), x(this, q, t.PersistenceProvider ?? void 0), x(this, K, t.NetworkProvider ?? void 0), x(this, Kt, t.PresenceProvider ?? t.NetworkProvider ?? void 0), x(this, Gn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && l(this, K) != null && x(this, Ge, new BroadcastChannel(`sns:${l(this, K).StoreId}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    l(this, q) != null && l(this, he).setValueBlobLoader(
      (e) => l(this, q).loadValue(e)
    ), await d(this, B, Ll).call(this), d(this, B, Nl).call(this), d(this, B, Rl).call(this), d(this, B, Ml).call(this), d(this, B, Vl).call(this), l(this, K) != null && l(this, K).onConnectionChange((e) => {
      x(this, Ys, e);
      for (const t of l(this, Qn))
        try {
          t(e);
        } catch {
        }
      e === "connected" && d(this, B, $l).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, s;
    l(this, ln) != null && (clearInterval(l(this, ln)), x(this, ln, void 0));
    for (const r of l(this, St).values())
      clearTimeout(r);
    l(this, St).clear();
    for (const r of l(this, xt))
      try {
        r();
      } catch {
      }
    x(this, xt, []), (e = l(this, Ge)) == null || e.close(), x(this, Ge, void 0), (t = l(this, K)) == null || t.disconnect(), l(this, q) != null && l(this, cn) > 0 && await d(this, B, no).call(this), await ((s = l(this, q)) == null ? void 0 : s.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (l(this, K) == null)
      throw new j("no-network-provider", "no NetworkProvider configured");
    x(this, qn, e), x(this, Gs, t), await l(this, K).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (l(this, K) == null)
      throw new j("no-network-provider", "no NetworkProvider configured");
    l(this, K).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (l(this, K) == null)
      throw new j("no-network-provider", "no NetworkProvider configured");
    if (l(this, qn) == null)
      throw new j(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await l(this, K).connect(l(this, qn), l(this, Gs));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return l(this, Ys);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return l(this, Qn).add(e), () => {
      l(this, Qn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var s, r;
    x(this, hn, e);
    const t = { ...e, PeerId: this.PeerId };
    (s = l(this, Kt)) == null || s.sendLocalState(e), (r = l(this, Ge)) == null || r.postMessage({ type: "presence", payload: e });
    for (const i of l(this, Ft))
      try {
        i(this.PeerId, t, "local");
      } catch (o) {
        console.error("SDS: presence handler failed", o);
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return l(this, un);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return l(this, Ft).add(e), () => {
      l(this, Ft).delete(e);
    };
  }
}
he = new WeakMap(), q = new WeakMap(), K = new WeakMap(), Kt = new WeakMap(), Gn = new WeakMap(), qn = new WeakMap(), Gs = new WeakMap(), qs = new WeakMap(), cn = new WeakMap(), Yn = new WeakMap(), Pt = new WeakMap(), Xn = new WeakMap(), ln = new WeakMap(), hn = new WeakMap(), un = new WeakMap(), St = new WeakMap(), Ft = new WeakMap(), Ge = new WeakMap(), Ys = new WeakMap(), Qn = new WeakMap(), xt = new WeakMap(), it = new WeakMap(), B = new WeakSet(), Ll = async function() {
  if (l(this, q) == null)
    return;
  await l(this, q).loadSnapshot();
  const e = await l(this, q).loadPatchesSince(l(this, Yn));
  for (const t of e)
    try {
      l(this, he).applyRemotePatch(t);
    } catch {
    }
  e.length > 0 && x(this, Pt, l(this, Yn) + e.length), x(this, Xn, l(this, he).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
Nl = function() {
  const e = l(this, he).onChangeInvoke((t, s) => {
    var o, a;
    if (t === "external") {
      d(this, B, so).call(this, s, "request").catch(() => {
      });
      return;
    }
    const r = l(this, Xn);
    ar(this, Pt)._++;
    const i = l(this, he).exportPatch(r);
    x(this, Xn, l(this, he).currentCursor), i.byteLength !== 0 && (l(this, q) != null && (l(this, q).appendPatch(i, l(this, Pt)).catch(() => {
    }), x(this, cn, l(this, cn) + i.byteLength), l(this, cn) >= ug && d(this, B, no).call(this).catch(() => {
    })), ((o = l(this, K)) == null ? void 0 : o.ConnectionState) === "connected" ? (l(this, K).sendPatch(i), (a = l(this, Ge)) == null || a.postMessage({ type: "patch", payload: i })) : l(this, qs).push(i), d(this, B, so).call(this, s, "send").catch(() => {
    }));
  });
  l(this, xt).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
Rl = function() {
  if (l(this, K) != null) {
    const t = l(this, K).onPatch((r) => {
      try {
        l(this, he).applyRemotePatch(r);
      } catch {
      }
    });
    l(this, xt).push(t);
    const s = l(this, K).onValue(async (r, i) => {
      var o;
      l(this, he).storeValueBlob(r, i), await ((o = l(this, q)) == null ? void 0 : o.saveValue(r, i));
    });
    l(this, xt).push(s);
  }
  const e = l(this, Kt);
  if (e != null) {
    const t = e.onRemoteState((s, r) => {
      d(this, B, Ul).call(this, s, r);
    });
    l(this, xt).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
Ml = function() {
  const e = l(this, Gn) / 4;
  x(this, ln, setInterval(() => {
    var t, s;
    l(this, hn) != null && ((t = l(this, Kt)) == null || t.sendLocalState(l(this, hn)), (s = l(this, Ge)) == null || s.postMessage({ type: "presence", payload: l(this, hn) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Vl = function() {
  l(this, Ge) != null && (l(this, Ge).onmessage = (e) => {
    var s;
    const t = e.data;
    switch (!0) {
      case t.type === "patch":
        try {
          l(this, he).applyRemotePatch(t.payload);
        } catch (r) {
          console.error("SDS: failed to apply remote patch from BroadcastChannel", r);
        }
        break;
      case t.type === "presence":
        (s = l(this, Kt)) == null || s.sendLocalState(t.payload);
        break;
    }
  });
}, no = async function() {
  l(this, q) != null && (await l(this, q).saveSnapshot(l(this, he).asBinary()), await l(this, q).prunePatches(l(this, Pt)), x(this, Yn, l(this, Pt)), x(this, cn, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
$l = function() {
  var t;
  const e = l(this, qs).splice(0);
  for (const s of e)
    try {
      (t = l(this, K)) == null || t.sendPatch(s);
    } catch (r) {
      console.error("SDS: failed to send queued patch", r);
    }
}, so = async function(e, t) {
  var s, r, i;
  for (const [o, a] of Object.entries(e)) {
    const c = a;
    if (c.has("Existence")) {
      const g = l(this, it).get(o);
      g != null && (await ((s = l(this, q)) == null ? void 0 : s.releaseValue(g)), l(this, it).delete(o));
    }
    if (!c.has("Value"))
      continue;
    const h = l(this, it).get(o), u = l(this, he)._getValueRefOf(o), f = u == null ? void 0 : u.Hash;
    if (h != null && h !== f && (await ((r = l(this, q)) == null ? void 0 : r.releaseValue(h)), l(this, it).delete(o)), u != null) {
      if (l(this, K) == null) {
        l(this, it).set(o, u.Hash);
        continue;
      }
      if (t === "send") {
        const g = l(this, he).getValueBlobByHash(u.Hash);
        g != null && (await ((i = l(this, q)) == null ? void 0 : i.saveValue(u.Hash, g)), l(this, it).set(o, u.Hash), l(this, K).ConnectionState === "connected" && l(this, K).sendValue(u.Hash, g));
      } else
        l(this, it).set(o, u.Hash), !l(this, he).hasValueBlob(u.Hash) && l(this, K).ConnectionState === "connected" && l(this, K).requestValue(u.Hash);
    }
  }
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
Ul = function(e, t) {
  if (t == null) {
    d(this, B, ro).call(this, e);
    return;
  }
  const s = { ...t, _lastSeen: Date.now() };
  l(this, un).set(e, s), d(this, B, jl).call(this, e);
  for (const r of l(this, Ft))
    try {
      r(e, t, "remote");
    } catch (i) {
      console.error("SDS: presence handler failed", i);
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
jl = function(e) {
  const t = l(this, St).get(e);
  t != null && clearTimeout(t);
  const s = setTimeout(
    () => {
      d(this, B, ro).call(this, e);
    },
    l(this, Gn)
  );
  l(this, St).set(e, s);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
ro = function(e) {
  if (!l(this, un).has(e))
    return;
  l(this, un).delete(e);
  const t = l(this, St).get(e);
  t != null && (clearTimeout(t), l(this, St).delete(e));
  for (const s of l(this, Ft))
    try {
      s(e, void 0, "remote");
    } catch (r) {
      console.error("SDS: presence handler failed", r);
    }
};
export {
  mg as SDS_BrowserPersistenceProvider,
  La as SDS_DataStore,
  Ja as SDS_Entry,
  j as SDS_Error,
  Xo as SDS_Item,
  Qo as SDS_Link,
  yg as SDS_SyncEngine,
  pg as SDS_WebRTCProvider,
  gg as SDS_WebSocketProvider
};
