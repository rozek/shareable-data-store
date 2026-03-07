var Bs = Object.defineProperty;
var br = (s) => {
  throw TypeError(s);
};
var Ks = (s, e, t) => e in s ? Bs(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var an = (s, e, t) => Ks(s, typeof e != "symbol" ? e + "" : e, t), Wn = (s, e, t) => e.has(s) || br("Cannot " + t);
var o = (s, e, t) => (Wn(s, e, "read from private field"), t ? t.call(s) : e.get(s)), y = (s, e, t) => e.has(s) ? br("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), w = (s, e, t, n) => (Wn(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t), d = (s, e, t) => (Wn(s, e, "access private method"), t);
var Mn = (s, e, t, n) => ({
  set _(r) {
    w(s, e, r, t);
  },
  get _() {
    return o(s, e, n);
  }
});
import { Loro as Sr, LoroMap as M, LoroText as X, VersionVector as $s } from "loro-crdt";
class $ extends Error {
  constructor(t, n) {
    super(n);
    an(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
}
const me = "00000000-0000-4000-8000-000000000000", F = "00000000-0000-4000-8000-000000000001", ye = "00000000-0000-4000-8000-000000000002", Rn = "text/plain", Us = 131072, zs = 2048, Fs = 5e3;
class rs {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootNote / isTrashNote / isLostAndFoundNote / isNote / isLink ****/
  get isRootNote() {
    return this.Id === me;
  }
  get isTrashNote() {
    return this.Id === F;
  }
  get isLostAndFoundNote() {
    return this.Id === ye;
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
  /**** outerNote / outerNoteId / outerNotes / outerNoteIds ****/
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
  /**** Label / Info ****/
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
  /**** mayBeMovedTo ****/
  mayBeMovedTo(e, t) {
    return this._Store._mayMoveEntryTo(this.Id, e.Id, t);
  }
  /**** moveTo ****/
  moveTo(e, t) {
    this._Store.moveEntryTo(this, e, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Delete                                    //
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
  //                              Serialisation                                 //
  //----------------------------------------------------------------------------//
  /**** asJSON ****/
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
}
class Ir extends rs {
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
  changeValue(e, t, n) {
    this._Store._spliceValueOf(this.Id, e, t, n);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  /**** innerEntryList ****/
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class Tr extends rs {
  constructor(e, t) {
    super(e, t);
  }
  /**** Target ****/
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
var N;
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
})(N || (N = {}));
var Cr;
(function(s) {
  s.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Cr || (Cr = {}));
const v = N.arrayToEnum([
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
]), et = (s) => {
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
}, g = N.arrayToEnum([
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
class Ge extends Error {
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
            const h = a.path[l];
            l === a.path.length - 1 ? (c[h] = c[h] || { _errors: [] }, c[h]._errors.push(t(a))) : c[h] = c[h] || { _errors: [] }, c = c[h], l++;
          }
        }
    };
    return r(this), n;
  }
  static assert(e) {
    if (!(e instanceof Ge))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, N.jsonStringifyReplacer, 2);
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
Ge.create = (s) => new Ge(s);
const Xn = (s, e) => {
  let t;
  switch (s.code) {
    case g.invalid_type:
      s.received === v.undefined ? t = "Required" : t = `Expected ${s.expected}, received ${s.received}`;
      break;
    case g.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(s.expected, N.jsonStringifyReplacer)}`;
      break;
    case g.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${N.joinValues(s.keys, ", ")}`;
      break;
    case g.invalid_union:
      t = "Invalid input";
      break;
    case g.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${N.joinValues(s.options)}`;
      break;
    case g.invalid_enum_value:
      t = `Invalid enum value. Expected ${N.joinValues(s.options)}, received '${s.received}'`;
      break;
    case g.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case g.invalid_return_type:
      t = "Invalid function return type";
      break;
    case g.invalid_date:
      t = "Invalid date";
      break;
    case g.invalid_string:
      typeof s.validation == "object" ? "includes" in s.validation ? (t = `Invalid input: must include "${s.validation.includes}"`, typeof s.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${s.validation.position}`)) : "startsWith" in s.validation ? t = `Invalid input: must start with "${s.validation.startsWith}"` : "endsWith" in s.validation ? t = `Invalid input: must end with "${s.validation.endsWith}"` : N.assertNever(s.validation) : s.validation !== "regex" ? t = `Invalid ${s.validation}` : t = "Invalid";
      break;
    case g.too_small:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "more than"} ${s.minimum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "over"} ${s.minimum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "bigint" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s.minimum))}` : t = "Invalid input";
      break;
    case g.too_big:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "less than"} ${s.maximum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "under"} ${s.maximum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "bigint" ? t = `BigInt must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly" : s.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s.maximum))}` : t = "Invalid input";
      break;
    case g.custom:
      t = "Invalid input";
      break;
    case g.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case g.not_multiple_of:
      t = `Number must be a multiple of ${s.multipleOf}`;
      break;
    case g.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, N.assertNever(s);
  }
  return { message: t };
};
let Hs = Xn;
function Ws() {
  return Hs;
}
const Js = (s) => {
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
  const l = n.filter((h) => !!h).slice().reverse();
  for (const h of l)
    c = h(a, { data: e, defaultError: c }).message;
  return {
    ...r,
    path: i,
    message: c
  };
};
function m(s, e) {
  const t = Ws(), n = Js({
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
      t === Xn ? void 0 : Xn
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
}), un = (s) => ({ status: "dirty", value: s }), be = (s) => ({ status: "valid", value: s }), Or = (s) => s.status === "aborted", Nr = (s) => s.status === "dirty", Qt = (s) => s.status === "valid", Dn = (s) => typeof Promise < "u" && s instanceof Promise;
var _;
(function(s) {
  s.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(_ || (_ = {}));
class ut {
  constructor(e, t, n, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Er = (s, e) => {
  if (Qt(e))
    return { success: !0, data: e.value };
  if (!s.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ge(s.common.issues);
      return this._error = t, this._error;
    }
  };
};
function T(s) {
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
    return et(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: et(e.data),
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
        parsedType: et(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Dn(t))
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
      parsedType: et(e)
    }, r = this._parseSync({ data: e, path: n.path, parent: n });
    return Er(n, r);
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
      parsedType: et(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return Qt(i) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => Qt(i) ? {
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
      parsedType: et(e)
    }, r = this._parse({ data: e, path: n.path, parent: n }), i = await (Dn(r) ? r : Promise.resolve(r));
    return Er(n, i);
  }
  refine(e, t) {
    const n = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, i) => {
      const a = e(r), c = () => i.addIssue({
        code: g.custom,
        ...n(r)
      });
      return typeof Promise < "u" && a instanceof Promise ? a.then((l) => l ? !0 : (c(), !1)) : a ? !0 : (c(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
  }
  _refinement(e) {
    return new en({
      schema: this,
      typeName: b.ZodEffects,
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
    return lt.create(this, this._def);
  }
  nullable() {
    return tn.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return je.create(this);
  }
  promise() {
    return $n.create(this, this._def);
  }
  or(e) {
    return Bn.create([this, e], this._def);
  }
  and(e) {
    return Kn.create(this, e, this._def);
  }
  transform(e) {
    return new en({
      ...T(this._def),
      schema: this,
      typeName: b.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new tr({
      ...T(this._def),
      innerType: this,
      defaultValue: t,
      typeName: b.ZodDefault
    });
  }
  brand() {
    return new pi({
      typeName: b.ZodBranded,
      type: this,
      ...T(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new nr({
      ...T(this._def),
      innerType: this,
      catchValue: t,
      typeName: b.ZodCatch
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
    return wr.create(this, e);
  }
  readonly() {
    return rr.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const qs = /^c[^\s-]{8,}$/i, Gs = /^[0-9a-z]+$/, Qs = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Ys = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Xs = /^[a-z0-9_-]{21}$/i, ei = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, ti = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, ni = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, ri = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Jn;
const si = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ii = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, ai = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, oi = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ci = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, di = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ss = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", li = new RegExp(`^${ss}$`);
function is(s) {
  let e = "[0-5]\\d";
  s.precision ? e = `${e}\\.\\d{${s.precision}}` : s.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = s.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function ui(s) {
  return new RegExp(`^${is(s)}$`);
}
function hi(s) {
  let e = `${ss}T${is(s)}`;
  const t = [];
  return t.push(s.local ? "Z?" : "Z"), s.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function fi(s, e) {
  return !!((e === "v4" || !e) && si.test(s) || (e === "v6" || !e) && ai.test(s));
}
function gi(s, e) {
  if (!ei.test(s))
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
function mi(s, e) {
  return !!((e === "v4" || !e) && ii.test(s) || (e === "v6" || !e) && oi.test(s));
}
class dt extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const i = this._getOrReturnCtx(e);
      return m(i, {
        code: g.invalid_type,
        expected: v.string,
        received: i.parsedType
      }), x;
    }
    const n = new we();
    let r;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (r = this._getOrReturnCtx(e, r), m(r, {
          code: g.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), n.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (r = this._getOrReturnCtx(e, r), m(r, {
          code: g.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), n.dirty());
      else if (i.kind === "length") {
        const a = e.data.length > i.value, c = e.data.length < i.value;
        (a || c) && (r = this._getOrReturnCtx(e, r), a ? m(r, {
          code: g.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : c && m(r, {
          code: g.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), n.dirty());
      } else if (i.kind === "email")
        ni.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "email",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "emoji")
        Jn || (Jn = new RegExp(ri, "u")), Jn.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "emoji",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "uuid")
        Ys.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "uuid",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "nanoid")
        Xs.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "nanoid",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "cuid")
        qs.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "cuid",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "cuid2")
        Gs.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "cuid2",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "ulid")
        Qs.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
          validation: "ulid",
          code: g.invalid_string,
          message: i.message
        }), n.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), m(r, {
            validation: "url",
            code: g.invalid_string,
            message: i.message
          }), n.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "regex",
        code: g.invalid_string,
        message: i.message
      }), n.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), n.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), n.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), n.dirty()) : i.kind === "datetime" ? hi(i).test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: "datetime",
        message: i.message
      }), n.dirty()) : i.kind === "date" ? li.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: "date",
        message: i.message
      }), n.dirty()) : i.kind === "time" ? ui(i).test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.invalid_string,
        validation: "time",
        message: i.message
      }), n.dirty()) : i.kind === "duration" ? ti.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "duration",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "ip" ? fi(e.data, i.version) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "ip",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "jwt" ? gi(e.data, i.alg) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "jwt",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "cidr" ? mi(e.data, i.version) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "cidr",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "base64" ? ci.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "base64",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : i.kind === "base64url" ? di.test(e.data) || (r = this._getOrReturnCtx(e, r), m(r, {
        validation: "base64url",
        code: g.invalid_string,
        message: i.message
      }), n.dirty()) : N.assertNever(i);
    return { status: n.value, value: e.data };
  }
  _regex(e, t, n) {
    return this.refinement((r) => e.test(r), {
      validation: t,
      code: g.invalid_string,
      ..._.errToObj(n)
    });
  }
  _addCheck(e) {
    return new dt({
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
    return new dt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new dt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new dt({
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
dt.create = (s) => new dt({
  checks: [],
  typeName: b.ZodString,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...T(s)
});
function yi(s, e) {
  const t = (s.toString().split(".")[1] || "").length, n = (e.toString().split(".")[1] || "").length, r = t > n ? t : n, i = Number.parseInt(s.toFixed(r).replace(".", "")), a = Number.parseInt(e.toFixed(r).replace(".", ""));
  return i % a / 10 ** r;
}
class Yt extends C {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== v.number) {
      const i = this._getOrReturnCtx(e);
      return m(i, {
        code: g.invalid_type,
        expected: v.number,
        received: i.parsedType
      }), x;
    }
    let n;
    const r = new we();
    for (const i of this._def.checks)
      i.kind === "int" ? N.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), r.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? yi(e.data, i.value) !== 0 && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.not_finite,
        message: i.message
      }), r.dirty()) : N.assertNever(i);
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
    return new Yt({
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
    return new Yt({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && N.isInteger(e.value));
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
Yt.create = (s) => new Yt({
  checks: [],
  typeName: b.ZodNumber,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...T(s)
});
class wn extends C {
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
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), r.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), m(n, {
        code: g.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), r.dirty()) : N.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return m(t, {
      code: g.invalid_type,
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
    return new wn({
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
    return new wn({
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
wn.create = (s) => new wn({
  checks: [],
  typeName: b.ZodBigInt,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...T(s)
});
class Ar extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.boolean,
        received: n.parsedType
      }), x;
    }
    return be(e.data);
  }
}
Ar.create = (s) => new Ar({
  typeName: b.ZodBoolean,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...T(s)
});
class jn extends C {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const i = this._getOrReturnCtx(e);
      return m(i, {
        code: g.invalid_type,
        expected: v.date,
        received: i.parsedType
      }), x;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return m(i, {
        code: g.invalid_date
      }), x;
    }
    const n = new we();
    let r;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), n.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (r = this._getOrReturnCtx(e, r), m(r, {
        code: g.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), n.dirty()) : N.assertNever(i);
    return {
      status: n.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new jn({
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
jn.create = (s) => new jn({
  checks: [],
  coerce: (s == null ? void 0 : s.coerce) || !1,
  typeName: b.ZodDate,
  ...T(s)
});
class Lr extends C {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.symbol,
        received: n.parsedType
      }), x;
    }
    return be(e.data);
  }
}
Lr.create = (s) => new Lr({
  typeName: b.ZodSymbol,
  ...T(s)
});
class Mr extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.undefined,
        received: n.parsedType
      }), x;
    }
    return be(e.data);
  }
}
Mr.create = (s) => new Mr({
  typeName: b.ZodUndefined,
  ...T(s)
});
class Rr extends C {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.null,
        received: n.parsedType
      }), x;
    }
    return be(e.data);
  }
}
Rr.create = (s) => new Rr({
  typeName: b.ZodNull,
  ...T(s)
});
class Pr extends C {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return be(e.data);
  }
}
Pr.create = (s) => new Pr({
  typeName: b.ZodAny,
  ...T(s)
});
class Vr extends C {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return be(e.data);
  }
}
Vr.create = (s) => new Vr({
  typeName: b.ZodUnknown,
  ...T(s)
});
class ht extends C {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return m(t, {
      code: g.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), x;
  }
}
ht.create = (s) => new ht({
  typeName: b.ZodNever,
  ...T(s)
});
class Zr extends C {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.void,
        received: n.parsedType
      }), x;
    }
    return be(e.data);
  }
}
Zr.create = (s) => new Zr({
  typeName: b.ZodVoid,
  ...T(s)
});
class je extends C {
  _parse(e) {
    const { ctx: t, status: n } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== v.array)
      return m(t, {
        code: g.invalid_type,
        expected: v.array,
        received: t.parsedType
      }), x;
    if (r.exactLength !== null) {
      const a = t.data.length > r.exactLength.value, c = t.data.length < r.exactLength.value;
      (a || c) && (m(t, {
        code: a ? g.too_big : g.too_small,
        minimum: c ? r.exactLength.value : void 0,
        maximum: a ? r.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: r.exactLength.message
      }), n.dirty());
    }
    if (r.minLength !== null && t.data.length < r.minLength.value && (m(t, {
      code: g.too_small,
      minimum: r.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.minLength.message
    }), n.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (m(t, {
      code: g.too_big,
      maximum: r.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.maxLength.message
    }), n.dirty()), t.common.async)
      return Promise.all([...t.data].map((a, c) => r.type._parseAsync(new ut(t, a, t.path, c)))).then((a) => we.mergeArray(n, a));
    const i = [...t.data].map((a, c) => r.type._parseSync(new ut(t, a, t.path, c)));
    return we.mergeArray(n, i);
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
je.create = (s, e) => new je({
  type: s,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: b.ZodArray,
  ...T(e)
});
function Nt(s) {
  if (s instanceof W) {
    const e = {};
    for (const t in s.shape) {
      const n = s.shape[t];
      e[t] = lt.create(Nt(n));
    }
    return new W({
      ...s._def,
      shape: () => e
    });
  } else return s instanceof je ? new je({
    ...s._def,
    type: Nt(s.element)
  }) : s instanceof lt ? lt.create(Nt(s.unwrap())) : s instanceof tn ? tn.create(Nt(s.unwrap())) : s instanceof St ? St.create(s.items.map((e) => Nt(e))) : s;
}
class W extends C {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = N.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== v.object) {
      const h = this._getOrReturnCtx(e);
      return m(h, {
        code: g.invalid_type,
        expected: v.object,
        received: h.parsedType
      }), x;
    }
    const { status: n, ctx: r } = this._processInputParams(e), { shape: i, keys: a } = this._getCached(), c = [];
    if (!(this._def.catchall instanceof ht && this._def.unknownKeys === "strip"))
      for (const h in r.data)
        a.includes(h) || c.push(h);
    const l = [];
    for (const h of a) {
      const f = i[h], p = r.data[h];
      l.push({
        key: { status: "valid", value: h },
        value: f._parse(new ut(r, p, r.path, h)),
        alwaysSet: h in r.data
      });
    }
    if (this._def.catchall instanceof ht) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const f of c)
          l.push({
            key: { status: "valid", value: f },
            value: { status: "valid", value: r.data[f] }
          });
      else if (h === "strict")
        c.length > 0 && (m(r, {
          code: g.unrecognized_keys,
          keys: c
        }), n.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const f of c) {
        const p = r.data[f];
        l.push({
          key: { status: "valid", value: f },
          value: h._parse(
            new ut(r, p, r.path, f)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: f in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const f of l) {
        const p = await f.key, k = await f.value;
        h.push({
          key: p,
          value: k,
          alwaysSet: f.alwaysSet
        });
      }
      return h;
    }).then((h) => we.mergeObjectSync(n, h)) : we.mergeObjectSync(n, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return _.errToObj, new W({
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
      typeName: b.ZodObject
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
    for (const n of N.objectKeys(e))
      e[n] && this.shape[n] && (t[n] = this.shape[n]);
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const n of N.objectKeys(this.shape))
      e[n] || (t[n] = this.shape[n]);
    return new W({
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
    for (const n of N.objectKeys(this.shape)) {
      const r = this.shape[n];
      e && !e[n] ? t[n] = r : t[n] = r.optional();
    }
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const n of N.objectKeys(this.shape))
      if (e && !e[n])
        t[n] = this.shape[n];
      else {
        let i = this.shape[n];
        for (; i instanceof lt; )
          i = i._def.innerType;
        t[n] = i;
      }
    return new W({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return as(N.objectKeys(this.shape));
  }
}
W.create = (s, e) => new W({
  shape: () => s,
  unknownKeys: "strip",
  catchall: ht.create(),
  typeName: b.ZodObject,
  ...T(e)
});
W.strictCreate = (s, e) => new W({
  shape: () => s,
  unknownKeys: "strict",
  catchall: ht.create(),
  typeName: b.ZodObject,
  ...T(e)
});
W.lazycreate = (s, e) => new W({
  shape: s,
  unknownKeys: "strip",
  catchall: ht.create(),
  typeName: b.ZodObject,
  ...T(e)
});
class Bn extends C {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), n = this._def.options;
    function r(i) {
      for (const c of i)
        if (c.result.status === "valid")
          return c.result;
      for (const c of i)
        if (c.result.status === "dirty")
          return t.common.issues.push(...c.ctx.common.issues), c.result;
      const a = i.map((c) => new Ge(c.ctx.common.issues));
      return m(t, {
        code: g.invalid_union,
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
        const h = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, f = l._parseSync({
          data: t.data,
          path: t.path,
          parent: h
        });
        if (f.status === "valid")
          return f;
        f.status === "dirty" && !i && (i = { result: f, ctx: h }), h.common.issues.length && a.push(h.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const c = a.map((l) => new Ge(l));
      return m(t, {
        code: g.invalid_union,
        unionErrors: c
      }), x;
    }
  }
  get options() {
    return this._def.options;
  }
}
Bn.create = (s, e) => new Bn({
  options: s,
  typeName: b.ZodUnion,
  ...T(e)
});
function er(s, e) {
  const t = et(s), n = et(e);
  if (s === e)
    return { valid: !0, data: s };
  if (t === v.object && n === v.object) {
    const r = N.objectKeys(e), i = N.objectKeys(s).filter((c) => r.indexOf(c) !== -1), a = { ...s, ...e };
    for (const c of i) {
      const l = er(s[c], e[c]);
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
      const a = s[i], c = e[i], l = er(a, c);
      if (!l.valid)
        return { valid: !1 };
      r.push(l.data);
    }
    return { valid: !0, data: r };
  } else return t === v.date && n === v.date && +s == +e ? { valid: !0, data: s } : { valid: !1 };
}
class Kn extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = (i, a) => {
      if (Or(i) || Or(a))
        return x;
      const c = er(i.value, a.value);
      return c.valid ? ((Nr(i) || Nr(a)) && t.dirty(), { status: t.value, value: c.data }) : (m(n, {
        code: g.invalid_intersection_types
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
Kn.create = (s, e, t) => new Kn({
  left: s,
  right: e,
  typeName: b.ZodIntersection,
  ...T(t)
});
class St extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.array)
      return m(n, {
        code: g.invalid_type,
        expected: v.array,
        received: n.parsedType
      }), x;
    if (n.data.length < this._def.items.length)
      return m(n, {
        code: g.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), x;
    !this._def.rest && n.data.length > this._def.items.length && (m(n, {
      code: g.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...n.data].map((a, c) => {
      const l = this._def.items[c] || this._def.rest;
      return l ? l._parse(new ut(n, a, n.path, c)) : null;
    }).filter((a) => !!a);
    return n.common.async ? Promise.all(i).then((a) => we.mergeArray(t, a)) : we.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new St({
      ...this._def,
      rest: e
    });
  }
}
St.create = (s, e) => {
  if (!Array.isArray(s))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new St({
    items: s,
    typeName: b.ZodTuple,
    rest: null,
    ...T(e)
  });
};
class Dr extends C {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.map)
      return m(n, {
        code: g.invalid_type,
        expected: v.map,
        received: n.parsedType
      }), x;
    const r = this._def.keyType, i = this._def.valueType, a = [...n.data.entries()].map(([c, l], h) => ({
      key: r._parse(new ut(n, c, n.path, [h, "key"])),
      value: i._parse(new ut(n, l, n.path, [h, "value"]))
    }));
    if (n.common.async) {
      const c = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of a) {
          const h = await l.key, f = await l.value;
          if (h.status === "aborted" || f.status === "aborted")
            return x;
          (h.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(h.value, f.value);
        }
        return { status: t.value, value: c };
      });
    } else {
      const c = /* @__PURE__ */ new Map();
      for (const l of a) {
        const h = l.key, f = l.value;
        if (h.status === "aborted" || f.status === "aborted")
          return x;
        (h.status === "dirty" || f.status === "dirty") && t.dirty(), c.set(h.value, f.value);
      }
      return { status: t.value, value: c };
    }
  }
}
Dr.create = (s, e, t) => new Dr({
  valueType: e,
  keyType: s,
  typeName: b.ZodMap,
  ...T(t)
});
class kn extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.parsedType !== v.set)
      return m(n, {
        code: g.invalid_type,
        expected: v.set,
        received: n.parsedType
      }), x;
    const r = this._def;
    r.minSize !== null && n.data.size < r.minSize.value && (m(n, {
      code: g.too_small,
      minimum: r.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.minSize.message
    }), t.dirty()), r.maxSize !== null && n.data.size > r.maxSize.value && (m(n, {
      code: g.too_big,
      maximum: r.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function a(l) {
      const h = /* @__PURE__ */ new Set();
      for (const f of l) {
        if (f.status === "aborted")
          return x;
        f.status === "dirty" && t.dirty(), h.add(f.value);
      }
      return { status: t.value, value: h };
    }
    const c = [...n.data.values()].map((l, h) => i._parse(new ut(n, l, n.path, h)));
    return n.common.async ? Promise.all(c).then((l) => a(l)) : a(c);
  }
  min(e, t) {
    return new kn({
      ...this._def,
      minSize: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new kn({
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
kn.create = (s, e) => new kn({
  valueType: s,
  minSize: null,
  maxSize: null,
  typeName: b.ZodSet,
  ...T(e)
});
class jr extends C {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
jr.create = (s, e) => new jr({
  getter: s,
  typeName: b.ZodLazy,
  ...T(e)
});
class Br extends C {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return m(t, {
        received: t.data,
        code: g.invalid_literal,
        expected: this._def.value
      }), x;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Br.create = (s, e) => new Br({
  value: s,
  typeName: b.ZodLiteral,
  ...T(e)
});
function as(s, e) {
  return new Xt({
    values: s,
    typeName: b.ZodEnum,
    ...T(e)
  });
}
class Xt extends C {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return m(t, {
        expected: N.joinValues(n),
        received: t.parsedType,
        code: g.invalid_type
      }), x;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), n = this._def.values;
      return m(t, {
        received: t.data,
        code: g.invalid_enum_value,
        options: n
      }), x;
    }
    return be(e.data);
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
    return Xt.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return Xt.create(this.options.filter((n) => !e.includes(n)), {
      ...this._def,
      ...t
    });
  }
}
Xt.create = as;
class Kr extends C {
  _parse(e) {
    const t = N.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
    if (n.parsedType !== v.string && n.parsedType !== v.number) {
      const r = N.objectValues(t);
      return m(n, {
        expected: N.joinValues(r),
        received: n.parsedType,
        code: g.invalid_type
      }), x;
    }
    if (this._cache || (this._cache = new Set(N.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = N.objectValues(t);
      return m(n, {
        received: n.data,
        code: g.invalid_enum_value,
        options: r
      }), x;
    }
    return be(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Kr.create = (s, e) => new Kr({
  values: s,
  typeName: b.ZodNativeEnum,
  ...T(e)
});
class $n extends C {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== v.promise && t.common.async === !1)
      return m(t, {
        code: g.invalid_type,
        expected: v.promise,
        received: t.parsedType
      }), x;
    const n = t.parsedType === v.promise ? t.data : Promise.resolve(t.data);
    return be(n.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
$n.create = (s, e) => new $n({
  type: s,
  typeName: b.ZodPromise,
  ...T(e)
});
class en extends C {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === b.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, i = {
      addIssue: (a) => {
        m(n, a), a.fatal ? t.abort() : t.dirty();
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
          return l.status === "aborted" ? x : l.status === "dirty" || t.value === "dirty" ? un(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return x;
        const c = this._def.schema._parseSync({
          data: a,
          path: n.path,
          parent: n
        });
        return c.status === "aborted" ? x : c.status === "dirty" || t.value === "dirty" ? un(c.value) : c;
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
        if (!Qt(a))
          return x;
        const c = r.transform(a.value, i);
        if (c instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: c };
      } else
        return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((a) => Qt(a) ? Promise.resolve(r.transform(a.value, i)).then((c) => ({
          status: t.value,
          value: c
        })) : x);
    N.assertNever(r);
  }
}
en.create = (s, e, t) => new en({
  schema: s,
  typeName: b.ZodEffects,
  effect: e,
  ...T(t)
});
en.createWithPreprocess = (s, e, t) => new en({
  schema: e,
  effect: { type: "preprocess", transform: s },
  typeName: b.ZodEffects,
  ...T(t)
});
class lt extends C {
  _parse(e) {
    return this._getType(e) === v.undefined ? be(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
lt.create = (s, e) => new lt({
  innerType: s,
  typeName: b.ZodOptional,
  ...T(e)
});
class tn extends C {
  _parse(e) {
    return this._getType(e) === v.null ? be(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
tn.create = (s, e) => new tn({
  innerType: s,
  typeName: b.ZodNullable,
  ...T(e)
});
class tr extends C {
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
tr.create = (s, e) => new tr({
  innerType: s,
  typeName: b.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...T(e)
});
class nr extends C {
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
    return Dn(r) ? r.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new Ge(n.common.issues);
        },
        input: n.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new Ge(n.common.issues);
        },
        input: n.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
nr.create = (s, e) => new nr({
  innerType: s,
  typeName: b.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...T(e)
});
class $r extends C {
  _parse(e) {
    if (this._getType(e) !== v.nan) {
      const n = this._getOrReturnCtx(e);
      return m(n, {
        code: g.invalid_type,
        expected: v.nan,
        received: n.parsedType
      }), x;
    }
    return { status: "valid", value: e.data };
  }
}
$r.create = (s) => new $r({
  typeName: b.ZodNaN,
  ...T(s)
});
class pi extends C {
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
class wr extends C {
  _parse(e) {
    const { status: t, ctx: n } = this._processInputParams(e);
    if (n.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return i.status === "aborted" ? x : i.status === "dirty" ? (t.dirty(), un(i.value)) : this._def.out._parseAsync({
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
    return new wr({
      in: e,
      out: t,
      typeName: b.ZodPipeline
    });
  }
}
class rr extends C {
  _parse(e) {
    const t = this._def.innerType._parse(e), n = (r) => (Qt(r) && (r.value = Object.freeze(r.value)), r);
    return Dn(t) ? t.then((r) => n(r)) : n(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
rr.create = (s, e) => new rr({
  innerType: s,
  typeName: b.ZodReadonly,
  ...T(e)
});
var b;
(function(s) {
  s.ZodString = "ZodString", s.ZodNumber = "ZodNumber", s.ZodNaN = "ZodNaN", s.ZodBigInt = "ZodBigInt", s.ZodBoolean = "ZodBoolean", s.ZodDate = "ZodDate", s.ZodSymbol = "ZodSymbol", s.ZodUndefined = "ZodUndefined", s.ZodNull = "ZodNull", s.ZodAny = "ZodAny", s.ZodUnknown = "ZodUnknown", s.ZodNever = "ZodNever", s.ZodVoid = "ZodVoid", s.ZodArray = "ZodArray", s.ZodObject = "ZodObject", s.ZodUnion = "ZodUnion", s.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s.ZodIntersection = "ZodIntersection", s.ZodTuple = "ZodTuple", s.ZodRecord = "ZodRecord", s.ZodMap = "ZodMap", s.ZodSet = "ZodSet", s.ZodFunction = "ZodFunction", s.ZodLazy = "ZodLazy", s.ZodLiteral = "ZodLiteral", s.ZodEnum = "ZodEnum", s.ZodEffects = "ZodEffects", s.ZodNativeEnum = "ZodNativeEnum", s.ZodOptional = "ZodOptional", s.ZodNullable = "ZodNullable", s.ZodDefault = "ZodDefault", s.ZodCatch = "ZodCatch", s.ZodPromise = "ZodPromise", s.ZodBranded = "ZodBranded", s.ZodPipeline = "ZodPipeline", s.ZodReadonly = "ZodReadonly";
})(b || (b = {}));
const os = dt.create, vi = Yt.create;
ht.create;
je.create;
Bn.create;
Kn.create;
St.create;
Xt.create;
$n.create;
lt.create;
tn.create;
var ee = Uint8Array, _e = Uint16Array, kr = Int32Array, zn = new ee([
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
]), Fn = new ee([
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
]), sr = new ee([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), cs = function(s, e) {
  for (var t = new _e(31), n = 0; n < 31; ++n)
    t[n] = e += 1 << s[n - 1];
  for (var r = new kr(t[30]), n = 1; n < 30; ++n)
    for (var i = t[n]; i < t[n + 1]; ++i)
      r[i] = i - t[n] << 5 | n;
  return { b: t, r };
}, ds = cs(zn, 2), ls = ds.b, ir = ds.r;
ls[28] = 258, ir[258] = 28;
var us = cs(Fn, 0), _i = us.b, Ur = us.r, ar = new _e(32768);
for (var V = 0; V < 32768; ++V) {
  var Ye = (V & 43690) >> 1 | (V & 21845) << 1;
  Ye = (Ye & 52428) >> 2 | (Ye & 13107) << 2, Ye = (Ye & 61680) >> 4 | (Ye & 3855) << 4, ar[V] = ((Ye & 65280) >> 8 | (Ye & 255) << 8) >> 1;
}
var Be = (function(s, e, t) {
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
        for (var h = r << 4 | s[r], f = e - s[r], p = a[s[r] - 1]++ << f, k = p | (1 << f) - 1; p <= k; ++p)
          c[ar[p] >> l] = h;
  } else
    for (c = new _e(n), r = 0; r < n; ++r)
      s[r] && (c[r] = ar[a[s[r] - 1]++] >> 15 - s[r]);
  return c;
}), ft = new ee(288);
for (var V = 0; V < 144; ++V)
  ft[V] = 8;
for (var V = 144; V < 256; ++V)
  ft[V] = 9;
for (var V = 256; V < 280; ++V)
  ft[V] = 7;
for (var V = 280; V < 288; ++V)
  ft[V] = 8;
var xn = new ee(32);
for (var V = 0; V < 32; ++V)
  xn[V] = 5;
var wi = /* @__PURE__ */ Be(ft, 9, 0), ki = /* @__PURE__ */ Be(ft, 9, 1), xi = /* @__PURE__ */ Be(xn, 5, 0), bi = /* @__PURE__ */ Be(xn, 5, 1), qn = function(s) {
  for (var e = s[0], t = 1; t < s.length; ++t)
    s[t] > e && (e = s[t]);
  return e;
}, Se = function(s, e, t) {
  var n = e / 8 | 0;
  return (s[n] | s[n + 1] << 8) >> (e & 7) & t;
}, Gn = function(s, e) {
  var t = e / 8 | 0;
  return (s[t] | s[t + 1] << 8 | s[t + 2] << 16) >> (e & 7);
}, xr = function(s) {
  return (s + 7) / 8 | 0;
}, hs = function(s, e, t) {
  return (t == null || t > s.length) && (t = s.length), new ee(s.subarray(e, t));
}, Si = [
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
  var n = new Error(e || Si[s]);
  if (n.code = s, Error.captureStackTrace && Error.captureStackTrace(n, Te), !t)
    throw n;
  return n;
}, Ii = function(s, e, t, n) {
  var r = s.length, i = 0;
  if (!r || e.f && !e.l)
    return t || new ee(0);
  var a = !t, c = a || e.i != 2, l = e.i;
  a && (t = new ee(r * 3));
  var h = function(rn) {
    var sn = t.length;
    if (rn > sn) {
      var Ct = new ee(Math.max(sn * 2, rn));
      Ct.set(t), t = Ct;
    }
  }, f = e.f || 0, p = e.p || 0, k = e.b || 0, S = e.l, U = e.d, P = e.m, J = e.n, ue = r * 8;
  do {
    if (!S) {
      f = Se(s, p, 1);
      var Z = Se(s, p + 1, 3);
      if (p += 3, Z)
        if (Z == 1)
          S = ki, U = bi, P = 9, J = 5;
        else if (Z == 2) {
          var ie = Se(s, p, 31) + 257, q = Se(s, p + 10, 15) + 4, A = ie + Se(s, p + 5, 31) + 1;
          p += 14;
          for (var I = new ee(A), G = new ee(19), H = 0; H < q; ++H)
            G[sr[H]] = Se(s, p + H * 3, 7);
          p += q * 3;
          for (var ne = qn(G), Qe = (1 << ne) - 1, he = Be(G, ne, 1), H = 0; H < A; ) {
            var oe = he[Se(s, p, Qe)];
            p += oe & 15;
            var z = oe >> 4;
            if (z < 16)
              I[H++] = z;
            else {
              var Q = 0, D = 0;
              for (z == 16 ? (D = 3 + Se(s, p, 3), p += 2, Q = I[H - 1]) : z == 17 ? (D = 3 + Se(s, p, 7), p += 3) : z == 18 && (D = 11 + Se(s, p, 127), p += 7); D--; )
                I[H++] = Q;
            }
          }
          var ce = I.subarray(0, ie), Y = I.subarray(ie);
          P = qn(ce), J = qn(Y), S = Be(ce, P, 1), U = Be(Y, J, 1);
        } else
          Te(1);
      else {
        var z = xr(p) + 4, se = s[z - 4] | s[z - 3] << 8, te = z + se;
        if (te > r) {
          l && Te(0);
          break;
        }
        c && h(k + se), t.set(s.subarray(z, te), k), e.b = k += se, e.p = p = te * 8, e.f = f;
        continue;
      }
      if (p > ue) {
        l && Te(0);
        break;
      }
    }
    c && h(k + 131072);
    for (var nn = (1 << P) - 1, ke = (1 << J) - 1, Ke = p; ; Ke = p) {
      var Q = S[Gn(s, p) & nn], fe = Q >> 4;
      if (p += Q & 15, p > ue) {
        l && Te(0);
        break;
      }
      if (Q || Te(2), fe < 256)
        t[k++] = fe;
      else if (fe == 256) {
        Ke = p, S = null;
        break;
      } else {
        var ge = fe - 254;
        if (fe > 264) {
          var H = fe - 257, j = zn[H];
          ge = Se(s, p, (1 << j) - 1) + ls[H], p += j;
        }
        var Le = U[Gn(s, p) & ke], It = Le >> 4;
        Le || Te(3), p += Le & 15;
        var Y = _i[It];
        if (It > 3) {
          var j = Fn[It];
          Y += Gn(s, p) & (1 << j) - 1, p += j;
        }
        if (p > ue) {
          l && Te(0);
          break;
        }
        c && h(k + 131072);
        var Tt = k + ge;
        if (k < Y) {
          var An = i - Y, Ln = Math.min(Y, Tt);
          for (An + k < 0 && Te(3); k < Ln; ++k)
            t[k] = n[An + k];
        }
        for (; k < Tt; ++k)
          t[k] = t[k - Y];
      }
    }
    e.l = S, e.p = Ke, e.b = k, e.f = f, S && (f = 1, e.m = P, e.d = U, e.n = J);
  } while (!f);
  return k != t.length && a ? hs(t, 0, k) : t.subarray(0, k);
}, $e = function(s, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  s[n] |= t, s[n + 1] |= t >> 8;
}, on = function(s, e, t) {
  t <<= e & 7;
  var n = e / 8 | 0;
  s[n] |= t, s[n + 1] |= t >> 8, s[n + 2] |= t >> 16;
}, Qn = function(s, e) {
  for (var t = [], n = 0; n < s.length; ++n)
    s[n] && t.push({ s: n, f: s[n] });
  var r = t.length, i = t.slice();
  if (!r)
    return { t: gs, l: 0 };
  if (r == 1) {
    var a = new ee(t[0].s + 1);
    return a[t[0].s] = 1, { t: a, l: 1 };
  }
  t.sort(function(te, ie) {
    return te.f - ie.f;
  }), t.push({ s: -1, f: 25001 });
  var c = t[0], l = t[1], h = 0, f = 1, p = 2;
  for (t[0] = { s: -1, f: c.f + l.f, l: c, r: l }; f != r - 1; )
    c = t[t[h].f < t[p].f ? h++ : p++], l = t[h != f && t[h].f < t[p].f ? h++ : p++], t[f++] = { s: -1, f: c.f + l.f, l: c, r: l };
  for (var k = i[0].s, n = 1; n < r; ++n)
    i[n].s > k && (k = i[n].s);
  var S = new _e(k + 1), U = or(t[f - 1], S, 0);
  if (U > e) {
    var n = 0, P = 0, J = U - e, ue = 1 << J;
    for (i.sort(function(ie, q) {
      return S[q.s] - S[ie.s] || ie.f - q.f;
    }); n < r; ++n) {
      var Z = i[n].s;
      if (S[Z] > e)
        P += ue - (1 << U - S[Z]), S[Z] = e;
      else
        break;
    }
    for (P >>= J; P > 0; ) {
      var z = i[n].s;
      S[z] < e ? P -= 1 << e - S[z]++ - 1 : ++n;
    }
    for (; n >= 0 && P; --n) {
      var se = i[n].s;
      S[se] == e && (--S[se], ++P);
    }
    U = e;
  }
  return { t: new ee(S), l: U };
}, or = function(s, e, t) {
  return s.s == -1 ? Math.max(or(s.l, e, t + 1), or(s.r, e, t + 1)) : e[s.s] = t;
}, zr = function(s) {
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
}, cn = function(s, e) {
  for (var t = 0, n = 0; n < e.length; ++n)
    t += s[n] * e[n];
  return t;
}, fs = function(s, e, t) {
  var n = t.length, r = xr(e + 2);
  s[r] = n & 255, s[r + 1] = n >> 8, s[r + 2] = s[r] ^ 255, s[r + 3] = s[r + 1] ^ 255;
  for (var i = 0; i < n; ++i)
    s[r + i + 4] = t[i];
  return (r + 4 + n) * 8;
}, Fr = function(s, e, t, n, r, i, a, c, l, h, f) {
  $e(e, f++, t), ++r[256];
  for (var p = Qn(r, 15), k = p.t, S = p.l, U = Qn(i, 15), P = U.t, J = U.l, ue = zr(k), Z = ue.c, z = ue.n, se = zr(P), te = se.c, ie = se.n, q = new _e(19), A = 0; A < Z.length; ++A)
    ++q[Z[A] & 31];
  for (var A = 0; A < te.length; ++A)
    ++q[te[A] & 31];
  for (var I = Qn(q, 7), G = I.t, H = I.l, ne = 19; ne > 4 && !G[sr[ne - 1]]; --ne)
    ;
  var Qe = h + 5 << 3, he = cn(r, ft) + cn(i, xn) + a, oe = cn(r, k) + cn(i, P) + a + 14 + 3 * ne + cn(q, G) + 2 * q[16] + 3 * q[17] + 7 * q[18];
  if (l >= 0 && Qe <= he && Qe <= oe)
    return fs(e, f, s.subarray(l, l + h));
  var Q, D, ce, Y;
  if ($e(e, f, 1 + (oe < he)), f += 2, oe < he) {
    Q = Be(k, S, 0), D = k, ce = Be(P, J, 0), Y = P;
    var nn = Be(G, H, 0);
    $e(e, f, z - 257), $e(e, f + 5, ie - 1), $e(e, f + 10, ne - 4), f += 14;
    for (var A = 0; A < ne; ++A)
      $e(e, f + 3 * A, G[sr[A]]);
    f += 3 * ne;
    for (var ke = [Z, te], Ke = 0; Ke < 2; ++Ke)
      for (var fe = ke[Ke], A = 0; A < fe.length; ++A) {
        var ge = fe[A] & 31;
        $e(e, f, nn[ge]), f += G[ge], ge > 15 && ($e(e, f, fe[A] >> 5 & 127), f += fe[A] >> 12);
      }
  } else
    Q = wi, D = ft, ce = xi, Y = xn;
  for (var A = 0; A < c; ++A) {
    var j = n[A];
    if (j > 255) {
      var ge = j >> 18 & 31;
      on(e, f, Q[ge + 257]), f += D[ge + 257], ge > 7 && ($e(e, f, j >> 23 & 31), f += zn[ge]);
      var Le = j & 31;
      on(e, f, ce[Le]), f += Y[Le], Le > 3 && (on(e, f, j >> 5 & 8191), f += Fn[Le]);
    } else
      on(e, f, Q[j]), f += D[j];
  }
  return on(e, f, Q[256]), f + D[256];
}, Ti = /* @__PURE__ */ new kr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), gs = /* @__PURE__ */ new ee(0), Ci = function(s, e, t, n, r, i) {
  var a = i.z || s.length, c = new ee(n + a + 5 * (1 + Math.ceil(a / 7e3)) + r), l = c.subarray(n, c.length - r), h = i.l, f = (i.r || 0) & 7;
  if (e) {
    f && (l[0] = i.r >> 3);
    for (var p = Ti[e - 1], k = p >> 13, S = p & 8191, U = (1 << t) - 1, P = i.p || new _e(32768), J = i.h || new _e(U + 1), ue = Math.ceil(t / 3), Z = 2 * ue, z = function(Hn) {
      return (s[Hn] ^ s[Hn + 1] << ue ^ s[Hn + 2] << Z) & U;
    }, se = new kr(25e3), te = new _e(288), ie = new _e(32), q = 0, A = 0, I = i.i || 0, G = 0, H = i.w || 0, ne = 0; I + 2 < a; ++I) {
      var Qe = z(I), he = I & 32767, oe = J[Qe];
      if (P[he] = oe, J[Qe] = he, H <= I) {
        var Q = a - I;
        if ((q > 7e3 || G > 24576) && (Q > 423 || !h)) {
          f = Fr(s, l, 0, se, te, ie, A, G, ne, I - ne, f), G = q = A = 0, ne = I;
          for (var D = 0; D < 286; ++D)
            te[D] = 0;
          for (var D = 0; D < 30; ++D)
            ie[D] = 0;
        }
        var ce = 2, Y = 0, nn = S, ke = he - oe & 32767;
        if (Q > 2 && Qe == z(I - ke))
          for (var Ke = Math.min(k, Q) - 1, fe = Math.min(32767, I), ge = Math.min(258, Q); ke <= fe && --nn && he != oe; ) {
            if (s[I + ce] == s[I + ce - ke]) {
              for (var j = 0; j < ge && s[I + j] == s[I + j - ke]; ++j)
                ;
              if (j > ce) {
                if (ce = j, Y = ke, j > Ke)
                  break;
                for (var Le = Math.min(ke, j - 2), It = 0, D = 0; D < Le; ++D) {
                  var Tt = I - ke + D & 32767, An = P[Tt], Ln = Tt - An & 32767;
                  Ln > It && (It = Ln, oe = Tt);
                }
              }
            }
            he = oe, oe = P[he], ke += he - oe & 32767;
          }
        if (Y) {
          se[G++] = 268435456 | ir[ce] << 18 | Ur[Y];
          var rn = ir[ce] & 31, sn = Ur[Y] & 31;
          A += zn[rn] + Fn[sn], ++te[257 + rn], ++ie[sn], H = I + ce, ++q;
        } else
          se[G++] = s[I], ++te[s[I]];
      }
    }
    for (I = Math.max(I, H); I < a; ++I)
      se[G++] = s[I], ++te[s[I]];
    f = Fr(s, l, h, se, te, ie, A, G, ne, I - ne, f), h || (i.r = f & 7 | l[f / 8 | 0] << 3, f -= 7, i.h = J, i.p = P, i.i = I, i.w = H);
  } else {
    for (var I = i.w || 0; I < a + h; I += 65535) {
      var Ct = I + 65535;
      Ct >= a && (l[f / 8 | 0] = h, Ct = a), f = fs(l, f + 1, s.subarray(I, Ct));
    }
    i.i = a;
  }
  return hs(c, 0, n + xr(f) + r);
}, Oi = /* @__PURE__ */ (function() {
  for (var s = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, n = 9; --n; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    s[e] = t;
  }
  return s;
})(), Ni = function() {
  var s = -1;
  return {
    p: function(e) {
      for (var t = s, n = 0; n < e.length; ++n)
        t = Oi[t & 255 ^ e[n]] ^ t >>> 8;
      s = t;
    },
    d: function() {
      return ~s;
    }
  };
}, Ei = function(s, e, t, n, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), a = new ee(i.length + s.length);
    a.set(i), a.set(s, i.length), s = a, r.w = i.length;
  }
  return Ci(s, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(s.length))) * 1.5) : 20 : 12 + e.mem, t, n, r);
}, cr = function(s, e, t) {
  for (; t; ++e)
    s[e] = t, t >>>= 8;
}, Ai = function(s, e) {
  var t = e.filename;
  if (s[0] = 31, s[1] = 139, s[2] = 8, s[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, s[9] = 3, e.mtime != 0 && cr(s, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    s[3] = 8;
    for (var n = 0; n <= t.length; ++n)
      s[n + 10] = t.charCodeAt(n);
  }
}, Li = function(s) {
  (s[0] != 31 || s[1] != 139 || s[2] != 8) && Te(6, "invalid gzip data");
  var e = s[3], t = 10;
  e & 4 && (t += (s[10] | s[11] << 8) + 2);
  for (var n = (e >> 3 & 1) + (e >> 4 & 1); n > 0; n -= !s[t++])
    ;
  return t + (e & 2);
}, Mi = function(s) {
  var e = s.length;
  return (s[e - 4] | s[e - 3] << 8 | s[e - 2] << 16 | s[e - 1] << 24) >>> 0;
}, Ri = function(s) {
  return 10 + (s.filename ? s.filename.length + 1 : 0);
};
function Pi(s, e) {
  e || (e = {});
  var t = Ni(), n = s.length;
  t.p(s);
  var r = Ei(s, e, Ri(e), 8), i = r.length;
  return Ai(r, e), cr(r, i - 8, t.d()), cr(r, i - 4, n), r;
}
function Vi(s, e) {
  var t = Li(s);
  return t + 8 > s.length && Te(6, "invalid gzip data"), Ii(s.subarray(t, -8), { i: 2 }, new ee(Mi(s)), e);
}
var Zi = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Di = 0;
try {
  Zi.decode(gs, { stream: !0 }), Di = 1;
} catch {
}
const ji = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Rt(s, e, t) {
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
      return e.slice(0, a) + Rt(s.slice(a), e.slice(a), t);
  }
  const r = s ? t.indexOf(s[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - r > 1) {
    const a = Math.round(0.5 * (r + i));
    return t[a];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Rt(s.slice(1), null, t);
}
function ms(s) {
  if (s.length !== ys(s[0]))
    throw new Error("invalid integer part of order key: " + s);
}
function ys(s) {
  if (s >= "a" && s <= "z")
    return s.charCodeAt(0) - 97 + 2;
  if (s >= "A" && s <= "Z")
    return 90 - s.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + s);
}
function hn(s) {
  const e = ys(s[0]);
  if (e > s.length)
    throw new Error("invalid order key: " + s);
  return s.slice(0, e);
}
function Hr(s, e) {
  if (s === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + s);
  const t = hn(s);
  if (s.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + s);
}
function Wr(s, e) {
  ms(s);
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
function Bi(s, e) {
  ms(s);
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
function Ot(s, e, t = ji) {
  if (s != null && Hr(s, t), e != null && Hr(e, t), s != null && e != null && s >= e)
    throw new Error(s + " >= " + e);
  if (s == null) {
    if (e == null)
      return "a" + t[0];
    const l = hn(e), h = e.slice(l.length);
    if (l === "A" + t[0].repeat(26))
      return l + Rt("", h, t);
    if (l < e)
      return l;
    const f = Bi(l, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const l = hn(s), h = s.slice(l.length), f = Wr(l, t);
    return f ?? l + Rt(h, null, t);
  }
  const n = hn(s), r = s.slice(n.length), i = hn(e), a = e.slice(i.length);
  if (n === i)
    return n + Rt(r, a, t);
  const c = Wr(n, t);
  if (c == null)
    throw new Error("cannot increment any more");
  return c < e ? c : n + Rt(r, null, t);
}
const Ki = os(), Jr = os().min(1), dn = vi().int().nonnegative().optional();
var Pe, de, bn, mt, ze, Pt, le, tt, nt, Ve, Ze, Un, Vt, rt, yt, u, L, Et, fn, Re, Vn, dr, ps, vs, xe, gt, At, gn, Lt, mn, Zn, _s, lr, ws, ur, hr, O, ks, fr, xs;
const _n = class _n {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t) {
    y(this, u);
    /**** private state ****/
    y(this, Pe);
    y(this, de);
    y(this, bn);
    y(this, mt);
    y(this, ze, null);
    y(this, Pt, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    y(this, le, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId
    y(this, tt, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    y(this, nt, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId
    y(this, Ve, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    y(this, Ze, /* @__PURE__ */ new Map());
    y(this, Un, Fs);
    // transaction nesting
    y(this, Vt, 0);
    // ChangeSet accumulator inside a transaction
    y(this, rt, {});
    // suppress index updates / change tracking when applying remote patches
    y(this, yt, !1);
    var n;
    if (w(this, Pe, e), w(this, de, e.getMap("Entries")), w(this, bn, (t == null ? void 0 : t.LiteralSizeLimit) ?? Us), w(this, mt, (t == null ? void 0 : t.TrashTTLms) ?? null), d(this, u, ps).call(this), o(this, mt) != null) {
      const r = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(o(this, mt) / 4), 36e5);
      w(this, ze, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        r
      )), typeof ((n = o(this, ze)) == null ? void 0 : n.unref) == "function" && o(this, ze).unref();
    }
  }
  /**** fromScratch — create a new store with root, trash, and lost-and-found notes ****/
  static fromScratch(e) {
    const t = new Sr(), n = t.getMap("Entries"), r = n.setContainer(me, new M());
    r.set("Kind", "note"), r.set("outerNoteId", ""), r.set("OrderKey", ""), r.setContainer("Label", new X()), r.setContainer("Info", new M()), r.set("MIMEType", ""), r.set("ValueKind", "none");
    const i = n.setContainer(F, new M());
    i.set("Kind", "note"), i.set("outerNoteId", me), i.set("OrderKey", "a0"), i.setContainer("Label", new X()).insert(0, "trash"), i.setContainer("Info", new M()), i.set("MIMEType", ""), i.set("ValueKind", "none");
    const c = n.setContainer(ye, new M());
    return c.set("Kind", "note"), c.set("outerNoteId", me), c.set("OrderKey", "a1"), c.setContainer("Label", new X()).insert(0, "lost-and-found"), c.setContainer("Info", new M()), c.set("MIMEType", ""), c.set("ValueKind", "none"), t.commit(), new _n(t, e);
  }
  /**** fromBinary — restore store from gzip-compressed binary data ****/
  static fromBinary(e, t) {
    const n = new Sr();
    return n.import(Vi(e)), new _n(n, t);
  }
  /**** fromJSON — restore store from base64-encoded JSON representation ****/
  static fromJSON(e, t) {
    let n;
    return typeof Buffer < "u" ? n = new Uint8Array(Buffer.from(String(e), "base64")) : n = Uint8Array.from(atob(String(e)), (r) => r.charCodeAt(0)), _n.fromBinary(n, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  /**** RootNote / TrashNote / LostAndFoundNote — well-known note accessors ****/
  get RootNote() {
    return d(this, u, Re).call(this, me);
  }
  get TrashNote() {
    return d(this, u, Re).call(this, F);
  }
  get LostAndFoundNote() {
    return d(this, u, Re).call(this, ye);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve an entry by ID ****/
  EntryWithId(e) {
    if (d(this, u, L).call(this, e) != null)
      return d(this, u, fn).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newNoteAt — create a new note within an outer note ****/
  newNoteAt(e, t, n) {
    const r = t ?? Rn;
    if (!Jr.safeParse(r).success)
      throw new $("invalid-argument", "MIMEType must be a non-empty string");
    dn.parse(n), d(this, u, Et).call(this, e.Id);
    const i = crypto.randomUUID(), a = d(this, u, Lt).call(this, e.Id, n), c = r === Rn ? "" : r;
    return this.transact(() => {
      const l = o(this, de).setContainer(i, new M());
      l.set("Kind", "note"), l.set("outerNoteId", e.Id), l.set("OrderKey", a), l.setContainer("Label", new X()), l.setContainer("Info", new M()), l.set("MIMEType", c), l.set("ValueKind", "none"), d(this, u, xe).call(this, e.Id, i), d(this, u, O).call(this, e.Id, "innerEntryList"), d(this, u, O).call(this, i, "outerNote");
    }), d(this, u, Re).call(this, i);
  }
  /**** newLinkAt — create a new link within an outer note ****/
  newLinkAt(e, t, n) {
    dn.parse(n), d(this, u, Et).call(this, e.Id), d(this, u, Et).call(this, t.Id);
    const r = crypto.randomUUID(), i = d(this, u, Lt).call(this, t.Id, n);
    return this.transact(() => {
      const a = o(this, de).setContainer(r, new M());
      a.set("Kind", "link"), a.set("outerNoteId", t.Id), a.set("OrderKey", i), a.setContainer("Label", new X()), a.setContainer("Info", new M()), a.set("TargetId", e.Id), d(this, u, xe).call(this, t.Id, r), d(this, u, At).call(this, e.Id, r), d(this, u, O).call(this, t.Id, "innerEntryList"), d(this, u, O).call(this, r, "outerNote");
    }), d(this, u, Vn).call(this, r);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeNoteInto — restore a note from serialized representation ****/
  deserializeNoteInto(e, t, n) {
    if (dn.parse(n), d(this, u, Et).call(this, t.Id), e == null)
      throw new $("invalid-argument", "Serialisation must not be null");
    const r = e, i = Object.keys(r.Entries ?? {});
    if (i.length === 0)
      throw new $("invalid-argument", "empty serialisation");
    const a = i[0], c = crypto.randomUUID(), l = /* @__PURE__ */ new Map([[a, c]]);
    for (const f of i)
      l.has(f) || l.set(f, crypto.randomUUID());
    const h = d(this, u, Lt).call(this, t.Id, n);
    return this.transact(() => {
      var f, p;
      for (const k of i) {
        const S = r.Entries[k], U = l.get(k), P = k === a, J = P ? t.Id : ((f = S.outerPlacement) == null ? void 0 : f.outerNoteId) != null ? l.get(S.outerPlacement.outerNoteId) ?? t.Id : void 0, ue = P ? h : ((p = S.outerPlacement) == null ? void 0 : p.OrderKey) ?? "", Z = o(this, de).setContainer(U, new M());
        Z.set("Kind", S.Kind);
        const z = Z.setContainer("Label", new X());
        S.Label && z.insert(0, S.Label), Z.setContainer("Info", new M()), Z.set("outerNoteId", J ?? ""), Z.set("OrderKey", ue), S.Kind === "note" ? (Z.set("MIMEType", S.MIMEType ?? ""), Z.set("ValueKind", "none")) : Z.set(
          "TargetId",
          S.TargetId != null ? l.get(S.TargetId) ?? S.TargetId : ""
        ), J && d(this, u, xe).call(this, J, U), S.Kind === "link" && S.TargetId != null && d(this, u, At).call(this, l.get(S.TargetId) ?? S.TargetId, U);
      }
      d(this, u, O).call(this, t.Id, "innerEntryList");
    }), d(this, u, Re).call(this, c);
  }
  /**** deserializeLinkInto — restore a link from serialized representation ****/
  deserializeLinkInto(e, t, n) {
    if (dn.parse(n), d(this, u, Et).call(this, t.Id), e == null)
      throw new $("invalid-argument", "Serialisation must not be null");
    const r = e, i = Object.keys(r.Entries ?? {});
    if (i.length === 0)
      throw new $("invalid-argument", "empty serialisation");
    const a = r.Entries[i[0]];
    if (a.Kind !== "link")
      throw new $("invalid-argument", "serialisation is not a link");
    const c = crypto.randomUUID(), l = d(this, u, Lt).call(this, t.Id, n);
    return this.transact(() => {
      const h = o(this, de).setContainer(c, new M());
      h.set("Kind", "link"), h.set("outerNoteId", t.Id), h.set("OrderKey", l);
      const f = h.setContainer("Label", new X());
      a.Label && f.insert(0, a.Label), h.setContainer("Info", new M()), h.set("TargetId", a.TargetId ?? ""), d(this, u, xe).call(this, t.Id, c), a.TargetId && d(this, u, At).call(this, a.TargetId, c), d(this, u, O).call(this, t.Id, "innerEntryList");
    }), d(this, u, Vn).call(this, c);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  /**** EntryMayBeMovedTo — check if an entry can be moved to an outer note ****/
  EntryMayBeMovedTo(e, t, n) {
    return e.mayBeMovedTo(t, n);
  }
  /**** moveEntryTo — move an entry to a different outer note ****/
  moveEntryTo(e, t, n) {
    if (dn.parse(n), !this._mayMoveEntryTo(e.Id, t.Id, n))
      throw new $(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const r = this._outerNoteIdOf(e.Id), i = d(this, u, Lt).call(this, t.Id, n);
    this.transact(() => {
      const a = d(this, u, L).call(this, e.Id);
      if (a.set("outerNoteId", t.Id), a.set("OrderKey", i), r === F && t.Id !== F) {
        const c = a.get("Info");
        c instanceof M && c.get("_trashedAt") != null && (c.delete("_trashedAt"), d(this, u, O).call(this, e.Id, "Info._trashedAt"));
      }
      r != null && (d(this, u, gt).call(this, r, e.Id), d(this, u, O).call(this, r, "innerEntryList")), d(this, u, xe).call(this, t.Id, e.Id), d(this, u, O).call(this, t.Id, "innerEntryList"), d(this, u, O).call(this, e.Id, "outerNote");
    });
  }
  /**** EntryMayBeDeleted — check if an entry can be deleted ****/
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  /**** deleteEntry — move an entry to trash ****/
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new $("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), n = Ot(d(this, u, mn).call(this, F), null);
    this.transact(() => {
      const r = d(this, u, L).call(this, e.Id);
      r.set("outerNoteId", F), r.set("OrderKey", n);
      let i = r.get("Info");
      i instanceof M || (i = r.setContainer("Info", new M())), i.set("_trashedAt", Date.now()), t != null && (d(this, u, gt).call(this, t, e.Id), d(this, u, O).call(this, t, "innerEntryList")), d(this, u, xe).call(this, F, e.Id), d(this, u, O).call(this, F, "innerEntryList"), d(this, u, O).call(this, e.Id, "outerNote"), d(this, u, O).call(this, e.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete a trash entry ****/
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== F)
      throw new $(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (d(this, u, _s).call(this, e.Id))
      throw new $(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, u, hr).call(this, e.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
  purgeExpiredTrashEntries(e) {
    const t = e ?? o(this, mt);
    if (t == null)
      return 0;
    const n = Date.now(), r = Array.from(o(this, le).get(F) ?? /* @__PURE__ */ new Set());
    let i = 0;
    for (const a of r) {
      const c = d(this, u, L).call(this, a);
      if (c == null || c.get("outerNoteId") !== F)
        continue;
      const l = c.get("Info"), h = l instanceof M ? l.get("_trashedAt") : void 0;
      if (typeof h == "number" && !(n - h < t))
        try {
          this.purgeEntry(d(this, u, fn).call(this, a)), i++;
        } catch {
        }
    }
    return i;
  }
  /**** dispose — cleanup and stop background timers ****/
  dispose() {
    o(this, ze) != null && (clearInterval(o(this, ze)), w(this, ze, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute operations within a batch transaction ****/
  transact(e) {
    Mn(this, Vt)._++;
    try {
      e();
    } finally {
      if (Mn(this, Vt)._--, o(this, Vt) === 0) {
        o(this, yt) || o(this, Pe).commit();
        const t = { ...o(this, rt) };
        w(this, rt, {});
        const n = o(this, yt) ? "external" : "internal";
        d(this, u, ks).call(this, n, t);
      }
    }
  }
  /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
  onChangeInvoke(e) {
    return o(this, Pt).add(e), () => {
      o(this, Pt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — merge remote changes and rebuild indices ****/
  applyRemotePatch(e) {
    w(this, yt, !0);
    try {
      o(this, Pe).import(e), this.transact(() => {
        d(this, u, vs).call(this);
      });
    } finally {
      w(this, yt, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get current version vector as sync cursor ****/
  get currentCursor() {
    return o(this, Pe).version().encode();
  }
  /**** exportPatch — generate a change patch since a given cursor ****/
  exportPatch(e) {
    return e == null || e.byteLength === 0 ? o(this, Pe).export({ mode: "snapshot" }) : o(this, Pe).export({ mode: "update", from: $s.decode(e) });
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const e = new Set(Object.keys(o(this, de).toJSON()));
    this.transact(() => {
      const t = o(this, de).toJSON();
      for (const [n, r] of Object.entries(t)) {
        if (n === me)
          continue;
        const i = r.outerNoteId;
        if (i && !e.has(i)) {
          const a = Ot(d(this, u, mn).call(this, ye), null), c = d(this, u, L).call(this, n);
          c.set("outerNoteId", ye), c.set("OrderKey", a), d(this, u, xe).call(this, ye, n), d(this, u, O).call(this, n, "outerNote"), d(this, u, O).call(this, ye, "innerEntryList");
        }
        if (r.Kind === "link") {
          const a = r.TargetId;
          if (a && !e.has(a)) {
            const c = Ot(d(this, u, mn).call(this, ye), null), l = o(this, de).setContainer(a, new M());
            l.set("Kind", "note"), l.set("outerNoteId", ye), l.set("OrderKey", c), l.setContainer("Label", new X()), l.setContainer("Info", new M()), l.set("MIMEType", ""), l.set("ValueKind", "none"), d(this, u, xe).call(this, ye, a), e.add(a), d(this, u, O).call(this, ye, "innerEntryList");
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
    return Pi(o(this, Pe).export({ mode: "snapshot" }));
  }
  /**** asJSON — export store as base64-encoded binary ****/
  asJSON() {
    const e = this.asBinary();
    if (typeof Buffer < "u")
      return Buffer.from(e).toString("base64");
    let t = "";
    for (let n = 0; n < e.byteLength; n++)
      t += String.fromCharCode(e[n]);
    return btoa(t);
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SNS_Entry / Note / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (note or link) ****/
  _KindOf(e) {
    const t = d(this, u, L).call(this, e);
    if (t == null)
      throw new $("not-found", `entry '${e}' not found`);
    return t.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(e) {
    const t = d(this, u, L).call(this, e);
    if (t == null)
      return "";
    const n = t.get("Label");
    return n instanceof X ? n.toString() : String(n ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(e, t) {
    Ki.parse(t), this.transact(() => {
      const n = d(this, u, L).call(this, e);
      if (n == null)
        return;
      let r = n.get("Label");
      if (r instanceof X) {
        const i = r.toString().length;
        i > 0 && r.delete(0, i), t.length > 0 && r.insert(0, t);
      } else
        r = n.setContainer("Label", new X()), t.length > 0 && r.insert(0, t);
      d(this, u, O).call(this, e, "Label");
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(e) {
    const t = d(this, u, L).call(this, e), n = (t == null ? void 0 : t.get("MIMEType")) ?? "";
    return n === "" ? Rn : n;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(e, t) {
    Jr.parse(t);
    const n = t === Rn ? "" : t;
    this.transact(() => {
      var r;
      (r = d(this, u, L).call(this, e)) == null || r.set("MIMEType", n), d(this, u, O).call(this, e, "Type");
    });
  }
  /**** _ValueKindOf — get value kind (none, literal, binary, reference types) ****/
  _ValueKindOf(e) {
    const t = d(this, u, L).call(this, e);
    return (t == null ? void 0 : t.get("ValueKind")) ?? "none";
  }
  /**** _isLiteralOf — check if value is a literal string ****/
  _isLiteralOf(e) {
    const t = this._ValueKindOf(e);
    return t === "literal" || t === "literal-reference";
  }
  /**** _isBinaryOf — check if value is binary data ****/
  _isBinaryOf(e) {
    const t = this._ValueKindOf(e);
    return t === "binary" || t === "binary-reference";
  }
  /**** _readValueOf — read entry value (literal or binary) ****/
  async _readValueOf(e) {
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal": {
        const n = d(this, u, L).call(this, e), r = n == null ? void 0 : n.get("literalValue");
        return r instanceof X ? r.toString() : String(r ?? "");
      }
      case t === "binary": {
        const n = d(this, u, L).call(this, e), r = n == null ? void 0 : n.get("binaryValue");
        return r instanceof Uint8Array ? r : void 0;
      }
      default:
        throw new $(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  /**** _writeValueOf — write entry value with automatic storage strategy ****/
  _writeValueOf(e, t) {
    this.transact(() => {
      const n = d(this, u, L).call(this, e);
      if (n != null) {
        switch (!0) {
          case t == null: {
            n.set("ValueKind", "none");
            break;
          }
          case (typeof t == "string" && t.length <= o(this, bn)): {
            n.set("ValueKind", "literal");
            let r = n.get("literalValue");
            if (r instanceof X) {
              const i = r.toString().length;
              i > 0 && r.delete(0, i), t.length > 0 && r.insert(0, t);
            } else
              r = n.setContainer("literalValue", new X()), t.length > 0 && r.insert(0, t);
            break;
          }
          case typeof t == "string": {
            const i = new TextEncoder().encode(t), a = `sha256-size-${i.byteLength}`;
            n.set("ValueKind", "literal-reference"), n.set("ValueRef", JSON.stringify({ Hash: a, Size: i.byteLength }));
            break;
          }
          case t.byteLength <= zs: {
            n.set("ValueKind", "binary"), n.set("binaryValue", t);
            break;
          }
          default: {
            const r = t, i = `sha256-size-${r.byteLength}`;
            n.set("ValueKind", "binary-reference"), n.set("ValueRef", JSON.stringify({ Hash: i, Size: r.byteLength }));
            break;
          }
        }
        d(this, u, O).call(this, e, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value text at a range ****/
  _spliceValueOf(e, t, n, r) {
    if (this._ValueKindOf(e) !== "literal")
      throw new $(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const i = d(this, u, L).call(this, e), a = i == null ? void 0 : i.get("literalValue");
      if (a instanceof X) {
        const c = n - t;
        c > 0 && a.delete(t, c), r.length > 0 && a.insert(t, r);
      }
      d(this, u, O).call(this, e, "Value");
    });
  }
  /**** _InfoProxyOf — get proxy for arbitrary metadata object ****/
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(n, r) {
        var c;
        if (typeof r != "string")
          return;
        const i = d(c = t, u, L).call(c, e), a = i == null ? void 0 : i.get("Info");
        return a instanceof M ? a.get(r) : void 0;
      },
      set(n, r, i) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var l, h;
          const a = d(l = t, u, L).call(l, e);
          if (a == null)
            return;
          let c = a.get("Info");
          c instanceof M || (c = a.setContainer("Info", new M())), c.set(r, i), d(h = t, u, O).call(h, e, `Info.${r}`);
        }), !0);
      },
      deleteProperty(n, r) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var c, l;
          const i = d(c = t, u, L).call(c, e), a = i == null ? void 0 : i.get("Info");
          a instanceof M && a.delete(r), d(l = t, u, O).call(l, e, `Info.${r}`);
        }), !0);
      },
      ownKeys() {
        var i;
        const n = d(i = t, u, L).call(i, e), r = n == null ? void 0 : n.get("Info");
        return r instanceof M ? Object.keys(r.toJSON()) : [];
      },
      getOwnPropertyDescriptor(n, r) {
        var l;
        if (typeof r != "string")
          return;
        const i = d(l = t, u, L).call(l, e), a = i == null ? void 0 : i.get("Info");
        if (!(a instanceof M))
          return;
        const c = a.get(r);
        return c !== void 0 ? { configurable: !0, enumerable: !0, value: c } : void 0;
      }
    });
  }
  /**** _outerNoteOf — get the outer note ****/
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? d(this, u, Re).call(this, t) : void 0;
  }
  /**** _outerNoteIdOf — get outer note ID or undefined ****/
  _outerNoteIdOf(e) {
    const t = d(this, u, L).call(this, e), n = t == null ? void 0 : t.get("outerNoteId");
    return n != null && n !== "" ? n : void 0;
  }
  /**** _outerNotesOf — get ancestor chain from entry to root ****/
  _outerNotesOf(e) {
    const t = [];
    let n = this._outerNoteIdOf(e);
    for (; n != null && (t.push(d(this, u, Re).call(this, n)), n !== me); )
      n = this._outerNoteIdOf(n);
    return t;
  }
  /**** _outerNoteIdsOf — get ancestor IDs from entry to root ****/
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  /**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/
  _innerEntriesOf(e) {
    const t = this, n = d(this, u, Zn).call(this, e);
    return new Proxy([], {
      get(r, i) {
        var a;
        if (i === "length")
          return n.length;
        if (i === Symbol.iterator)
          return function* () {
            var c;
            for (let l = 0; l < n.length; l++)
              yield d(c = t, u, fn).call(c, n[l].Id);
          };
        if (typeof i == "string" && !isNaN(Number(i))) {
          const c = Number(i);
          return c >= 0 && c < n.length ? d(a = t, u, fn).call(a, n[c].Id) : void 0;
        }
        return r[i];
      }
    });
  }
  /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
  _mayMoveEntryTo(e, t, n) {
    return e === me || e === t ? !1 : e === F || e === ye ? t === me : !d(this, u, xs).call(this, t, e);
  }
  /**** _mayDeleteEntry — check if entry is deletable ****/
  _mayDeleteEntry(e) {
    return e !== me && e !== F && e !== ye;
  }
  /**** _TargetOf — get the target note for a link ****/
  _TargetOf(e) {
    const t = d(this, u, L).call(this, e), n = t == null ? void 0 : t.get("TargetId");
    if (!n)
      throw new $("not-found", `link '${e}' has no target`);
    return d(this, u, Re).call(this, n);
  }
  /**** _EntryAsJSON — serialize entry and subtree to JSON ****/
  _EntryAsJSON(e) {
    if (d(this, u, L).call(this, e) == null)
      throw new $("not-found", `entry '${e}' not found`);
    const n = {};
    return d(this, u, fr).call(this, e, n), { Entries: n };
  }
};
Pe = new WeakMap(), de = new WeakMap(), bn = new WeakMap(), mt = new WeakMap(), ze = new WeakMap(), Pt = new WeakMap(), le = new WeakMap(), tt = new WeakMap(), nt = new WeakMap(), Ve = new WeakMap(), Ze = new WeakMap(), Un = new WeakMap(), Vt = new WeakMap(), rt = new WeakMap(), yt = new WeakMap(), u = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry ID ****/
L = function(e) {
  const t = o(this, de).get(e);
  if (t instanceof M && !(t.get("outerNoteId") === "" && e !== me))
    return t;
}, /**** #requireNoteExists — throw if note does not exist ****/
Et = function(e) {
  const t = d(this, u, L).call(this, e);
  if (t == null || t.get("Kind") !== "note")
    throw new $("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink — return cached wrapper objects ****/
fn = function(e) {
  const t = d(this, u, L).call(this, e);
  if (t == null)
    throw new $("invalid-argument", `entry '${e}' not found`);
  return t.get("Kind") === "note" ? d(this, u, Re).call(this, e) : d(this, u, Vn).call(this, e);
}, Re = function(e) {
  const t = o(this, Ze).get(e);
  if (t instanceof Ir)
    return t;
  const n = new Ir(this, e);
  return d(this, u, dr).call(this, e, n), n;
}, Vn = function(e) {
  const t = o(this, Ze).get(e);
  if (t instanceof Tr)
    return t;
  const n = new Tr(this, e);
  return d(this, u, dr).call(this, e, n), n;
}, /**** #cacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/
dr = function(e, t) {
  if (o(this, Ze).size >= o(this, Un)) {
    const n = o(this, Ze).keys().next().value;
    n != null && o(this, Ze).delete(n);
  }
  o(this, Ze).set(e, t);
}, /**** #rebuildIndices — full rebuild of all indices from scratch ****/
ps = function() {
  o(this, le).clear(), o(this, tt).clear(), o(this, nt).clear(), o(this, Ve).clear();
  const e = o(this, de).toJSON();
  for (const [t, n] of Object.entries(e)) {
    const r = n.outerNoteId;
    if (r && d(this, u, xe).call(this, r, t), n.Kind === "link") {
      const i = n.TargetId;
      i && d(this, u, At).call(this, i, t);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
vs = function() {
  const e = o(this, de).toJSON(), t = /* @__PURE__ */ new Set();
  for (const [i, a] of Object.entries(e)) {
    t.add(i);
    const c = a.outerNoteId || void 0, l = o(this, tt).get(i);
    if (c !== l && (l != null && (d(this, u, gt).call(this, l, i), d(this, u, O).call(this, l, "innerEntryList")), c != null && (d(this, u, xe).call(this, c, i), d(this, u, O).call(this, c, "innerEntryList")), d(this, u, O).call(this, i, "outerNote")), a.Kind === "link") {
      const h = a.TargetId, f = o(this, Ve).get(i);
      h !== f && (f != null && d(this, u, gn).call(this, f, i), h != null && d(this, u, At).call(this, h, i));
    } else o(this, Ve).has(i) && d(this, u, gn).call(this, o(this, Ve).get(i), i);
    d(this, u, O).call(this, i, "Label");
  }
  const n = Array.from(o(this, tt).entries()).filter(([i]) => !t.has(i));
  for (const [i, a] of n)
    d(this, u, gt).call(this, a, i), d(this, u, O).call(this, a, "innerEntryList");
  const r = Array.from(o(this, Ve).entries()).filter(([i]) => !t.has(i));
  for (const [i, a] of r)
    d(this, u, gn).call(this, a, i);
}, /**** #addToReverseIndex — add entry to reverse and forward indices ****/
xe = function(e, t) {
  let n = o(this, le).get(e);
  n == null && (n = /* @__PURE__ */ new Set(), o(this, le).set(e, n)), n.add(t), o(this, tt).set(t, e);
}, /**** #removeFromReverseIndex — remove entry from indices ****/
gt = function(e, t) {
  var n;
  (n = o(this, le).get(e)) == null || n.delete(t), o(this, tt).delete(t);
}, /**** #addToLinkTargetIndex — add link to target and forward indices ****/
At = function(e, t) {
  let n = o(this, nt).get(e);
  n == null && (n = /* @__PURE__ */ new Set(), o(this, nt).set(e, n)), n.add(t), o(this, Ve).set(t, e);
}, /**** #removeFromLinkTargetIndex — remove link from indices ****/
gn = function(e, t) {
  var n;
  (n = o(this, nt).get(e)) == null || n.delete(t), o(this, Ve).delete(t);
}, /**** #orderKeyAt — generate fractional order key for insertion position ****/
Lt = function(e, t) {
  const n = d(this, u, Zn).call(this, e);
  if (n.length === 0 || t == null) {
    const c = n.length > 0 ? n[n.length - 1].OrderKey : null;
    return Ot(c, null);
  }
  const r = Math.max(0, Math.min(t, n.length)), i = r > 0 ? n[r - 1].OrderKey : null, a = r < n.length ? n[r].OrderKey : null;
  return Ot(i, a);
}, /**** #lastOrderKeyOf — get the last order key for an entry's children ****/
mn = function(e) {
  const t = d(this, u, Zn).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/
Zn = function(e) {
  const t = o(this, le).get(e) ?? /* @__PURE__ */ new Set(), n = [];
  for (const r of t) {
    const i = d(this, u, L).call(this, r);
    (i == null ? void 0 : i.get("outerNoteId")) === e && n.push({ Id: r, OrderKey: i.get("OrderKey") ?? "" });
  }
  return n.sort((r, i) => r.OrderKey < i.OrderKey ? -1 : r.OrderKey > i.OrderKey ? 1 : r.Id < i.Id ? -1 : r.Id > i.Id ? 1 : 0), n;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
_s = function(e) {
  const t = d(this, u, ur).call(this), n = /* @__PURE__ */ new Set();
  let r = !0;
  for (; r; ) {
    r = !1;
    for (const i of o(this, le).get(F) ?? /* @__PURE__ */ new Set())
      n.has(i) || d(this, u, lr).call(this, i, t, n) && (n.add(i), r = !0);
  }
  return n.has(e);
}, /**** #subtreeHasIncomingLinks — check if subtree has links from reachable entries ****/
lr = function(e, t, n) {
  const r = [e], i = /* @__PURE__ */ new Set();
  for (; r.length > 0; ) {
    const a = r.pop();
    if (i.has(a))
      continue;
    i.add(a);
    const c = o(this, nt).get(a) ?? /* @__PURE__ */ new Set();
    for (const l of c) {
      if (t.has(l))
        return !0;
      const h = d(this, u, ws).call(this, l);
      if (h != null && n.has(h))
        return !0;
    }
    for (const l of o(this, le).get(a) ?? /* @__PURE__ */ new Set())
      i.has(l) || r.push(l);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — get direct inner entry of TrashNote containing an entry ****/
ws = function(e) {
  let t = e;
  for (; t != null; ) {
    const n = this._outerNoteIdOf(t);
    if (n === F)
      return t;
    if (n === me || n == null)
      return null;
    t = n;
  }
  return null;
}, /**** #reachableFromRoot — get all entries reachable from root ****/
ur = function() {
  const e = /* @__PURE__ */ new Set(), t = [me];
  for (; t.length > 0; ) {
    const n = t.pop();
    if (!e.has(n)) {
      e.add(n);
      for (const r of o(this, le).get(n) ?? /* @__PURE__ */ new Set())
        e.has(r) || t.push(r);
    }
  }
  return e;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
hr = function(e) {
  const t = d(this, u, L).call(this, e);
  if (t == null)
    return;
  const n = t.get("Kind"), r = t.get("outerNoteId"), i = d(this, u, ur).call(this), a = /* @__PURE__ */ new Set(), c = Array.from(o(this, le).get(e) ?? /* @__PURE__ */ new Set());
  for (const l of c)
    if (d(this, u, lr).call(this, l, i, a)) {
      const h = d(this, u, L).call(this, l), f = Ot(d(this, u, mn).call(this, F), null);
      h.set("outerNoteId", F), h.set("OrderKey", f), d(this, u, gt).call(this, e, l), d(this, u, xe).call(this, F, l), d(this, u, O).call(this, F, "innerEntryList"), d(this, u, O).call(this, l, "outerNote");
    } else
      d(this, u, hr).call(this, l);
  if (t.set("outerNoteId", ""), t.set("OrderKey", ""), r && (d(this, u, gt).call(this, r, e), d(this, u, O).call(this, r, "innerEntryList")), n === "link") {
    const l = t.get("TargetId");
    l && d(this, u, gn).call(this, l, e);
  }
  o(this, Ze).delete(e);
}, /**** #recordChange — add property change to pending changeset ****/
O = function(e, t) {
  o(this, rt)[e] == null && (o(this, rt)[e] = /* @__PURE__ */ new Set()), o(this, rt)[e].add(t);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
ks = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const n of o(this, Pt))
      try {
        n(e, t);
      } catch {
      }
}, /**** #collectSubtree — recursively serialize entry and its children ****/
fr = function(e, t) {
  const n = d(this, u, L).call(this, e);
  if (n == null)
    return;
  const r = n.get("outerNoteId"), i = n.get("OrderKey"), a = n.get("Label"), c = n.get("Info"), l = c instanceof M ? c.toJSON() : {}, h = {
    Kind: n.get("Kind"),
    Label: a instanceof X ? a.toString() : String(a ?? ""),
    Info: l
  };
  if (r && i && (h.outerPlacement = { outerNoteId: r, OrderKey: i }), n.get("Kind") === "note") {
    h.MIMEType = n.get("MIMEType") ?? "", h.ValueKind = n.get("ValueKind") ?? "none";
    const f = n.get("literalValue");
    f instanceof X && (h.literalValue = f.toString());
    const p = n.get("binaryValue");
    p instanceof Uint8Array && (h.binaryValue = p);
    const k = n.get("ValueRef");
    if (k)
      try {
        h.ValueRef = JSON.parse(k);
      } catch {
      }
  } else
    h.TargetId = n.get("TargetId");
  t[e] = h;
  for (const f of o(this, le).get(e) ?? /* @__PURE__ */ new Set())
    d(this, u, fr).call(this, f, t);
}, /**** #isDescendantOf — check if one entry is a descendant of another ****/
xs = function(e, t) {
  let n = e;
  for (; n != null; ) {
    if (n === t)
      return !0;
    n = this._outerNoteIdOf(n);
  }
  return !1;
};
let qr = _n;
const Gr = 1, Qr = 2, Yr = 3, Xr = 4, es = 5, Me = 32, Pn = 1024 * 1024;
function Yn(...s) {
  const e = s.reduce((r, i) => r + i.byteLength, 0), t = new Uint8Array(e);
  let n = 0;
  for (const r of s)
    t.set(r, n), n += r.byteLength;
  return t;
}
function ln(s, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = s, t.set(e, 1), t;
}
function ts(s) {
  const e = new Uint8Array(s.length / 2);
  for (let t = 0; t < s.length; t += 2)
    e[t / 2] = parseInt(s.slice(t, t + 2), 16);
  return e;
}
function ns(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var Fe, He, Sn, Zt, pt, Dt, vt, jt, Bt, Kt, In, K, gr, Mt, yn, bs, Ss, Is;
class Fi {
  /**** constructor ****/
  constructor(e) {
    y(this, K);
    an(this, "StoreID");
    y(this, Fe, "disconnected");
    y(this, He);
    y(this, Sn, "");
    y(this, Zt);
    y(this, pt);
    y(this, Dt, /* @__PURE__ */ new Set());
    y(this, vt, /* @__PURE__ */ new Set());
    y(this, jt, /* @__PURE__ */ new Set());
    y(this, Bt, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    y(this, Kt, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    y(this, In, /* @__PURE__ */ new Map());
    this.StoreID = e;
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, Fe);
  }
  /**** connect ****/
  async connect(e, t) {
    return w(this, Sn, e), w(this, Zt, t), d(this, K, gr).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, K, Ss).call(this), d(this, K, yn).call(this, "disconnected"), (e = o(this, He)) == null || e.close(), w(this, He, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    d(this, K, Mt).call(this, ln(Gr, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const n = ts(e);
    if (t.byteLength <= Pn)
      d(this, K, Mt).call(this, ln(Qr, Yn(n, t)));
    else {
      const r = Math.ceil(t.byteLength / Pn);
      for (let i = 0; i < r; i++) {
        const a = i * Pn, c = t.slice(a, a + Pn), l = new Uint8Array(Me + 8);
        l.set(n, 0), new DataView(l.buffer).setUint32(Me, i, !1), new DataView(l.buffer).setUint32(Me + 4, r, !1), d(this, K, Mt).call(this, ln(es, Yn(l, c)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    d(this, K, Mt).call(this, ln(Yr, ts(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, Dt).add(e), () => {
      o(this, Dt).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, vt).add(e), () => {
      o(this, vt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, jt).add(e), () => {
      o(this, jt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SNS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    d(this, K, Mt).call(this, ln(Xr, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, Bt).add(e), () => {
      o(this, Bt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, In);
  }
}
Fe = new WeakMap(), He = new WeakMap(), Sn = new WeakMap(), Zt = new WeakMap(), pt = new WeakMap(), Dt = new WeakMap(), vt = new WeakMap(), jt = new WeakMap(), Bt = new WeakMap(), Kt = new WeakMap(), In = new WeakMap(), K = new WeakSet(), /**** #doConnect ****/
gr = function() {
  return new Promise((e, t) => {
    const n = `${o(this, Sn)}?token=${encodeURIComponent(o(this, Zt).Token)}`, r = new WebSocket(n);
    r.binaryType = "arraybuffer", w(this, He, r), d(this, K, yn).call(this, "connecting"), r.onopen = () => {
      d(this, K, yn).call(this, "connected"), e();
    }, r.onerror = (i) => {
      o(this, Fe) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      w(this, He, void 0), o(this, Fe) !== "disconnected" && (d(this, K, yn).call(this, "reconnecting"), d(this, K, bs).call(this));
    }, r.onmessage = (i) => {
      d(this, K, Is).call(this, new Uint8Array(i.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
Mt = function(e) {
  var t;
  ((t = o(this, He)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, He).send(e);
}, /**** #setState ****/
yn = function(e) {
  if (o(this, Fe) !== e) {
    w(this, Fe, e);
    for (const t of o(this, jt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
bs = function() {
  var t;
  const e = ((t = o(this, Zt)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  w(this, pt, setTimeout(() => {
    o(this, Fe) === "reconnecting" && d(this, K, gr).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
Ss = function() {
  o(this, pt) != null && (clearTimeout(o(this, pt)), w(this, pt, void 0));
}, /**** #handleFrame ****/
Is = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], n = e.slice(1);
  switch (t) {
    case Gr: {
      for (const r of o(this, Dt))
        try {
          r(n);
        } catch {
        }
      break;
    }
    case Qr: {
      if (n.byteLength < Me)
        return;
      const r = ns(n.slice(0, Me)), i = n.slice(Me);
      for (const a of o(this, vt))
        try {
          a(r, i);
        } catch {
        }
      break;
    }
    case Yr:
      break;
    case Xr: {
      try {
        const r = JSON.parse(new TextDecoder().decode(n));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), o(this, In).set(r.PeerId, r);
        for (const i of o(this, Bt))
          try {
            i(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case es: {
      if (n.byteLength < Me + 8)
        return;
      const r = ns(n.slice(0, Me)), i = new DataView(n.buffer, n.byteOffset + Me, 8), a = i.getUint32(0, !1), c = i.getUint32(4, !1), l = n.slice(Me + 8);
      let h = o(this, Kt).get(r);
      if (h == null && (h = { total: c, chunks: /* @__PURE__ */ new Map() }, o(this, Kt).set(r, h)), h.chunks.set(a, l), h.chunks.size === h.total) {
        const f = Yn(
          ...Array.from({ length: h.total }, (p, k) => h.chunks.get(k))
        );
        o(this, Kt).delete(r);
        for (const p of o(this, vt))
          try {
            p(r, f);
          } catch {
          }
      }
      break;
    }
  }
};
var Tn, Ce, re, st, De, Oe, it, $t, Ut, zt, _t, Ft, pe, E, pn, vn, Ts, Cs, Os, mr, yr, Ns, pr, Es;
class Hi {
  /**** Constructor ****/
  constructor(e, t = {}) {
    y(this, E);
    an(this, "StoreID");
    y(this, Tn);
    y(this, Ce, crypto.randomUUID());
    y(this, re);
    /**** Signalling WebSocket ****/
    y(this, st);
    /**** active RTCPeerConnection per remote PeerId ****/
    y(this, De, /* @__PURE__ */ new Map());
    y(this, Oe, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    y(this, it, "disconnected");
    /**** Event Handlers ****/
    y(this, $t, /* @__PURE__ */ new Set());
    y(this, Ut, /* @__PURE__ */ new Set());
    y(this, zt, /* @__PURE__ */ new Set());
    y(this, _t, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    y(this, Ft, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    y(this, pe, !1);
    this.StoreID = e, w(this, Tn, t), w(this, re, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, it);
  }
  /**** connect ****/
  async connect(e, t) {
    return new Promise((n, r) => {
      const i = `${e}?token=${encodeURIComponent(t.Token)}`, a = new WebSocket(i);
      w(this, st, a), d(this, E, pn).call(this, "connecting"), a.onopen = () => {
        d(this, E, pn).call(this, "connected"), d(this, E, vn).call(this, { type: "hello", from: o(this, Ce) }), n();
      }, a.onerror = () => {
        if (!o(this, pe) && o(this, re) != null) {
          const c = e.replace("/signal/", "/ws/");
          w(this, pe, !0), o(this, re).connect(c, t).then(n).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, a.onclose = () => {
        o(this, it) !== "disconnected" && (d(this, E, pn).call(this, "reconnecting"), setTimeout(() => {
          o(this, it) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, a.onmessage = (c) => {
        try {
          const l = JSON.parse(c.data);
          d(this, E, Ts).call(this, l, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    d(this, E, pn).call(this, "disconnected"), (e = o(this, st)) == null || e.close(), w(this, st, void 0);
    for (const t of o(this, De).values())
      t.close();
    o(this, De).clear(), o(this, Oe).clear(), o(this, pe) && o(this, re) != null && (o(this, re).disconnect(), w(this, pe, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var n;
    if (o(this, pe)) {
      (n = o(this, re)) == null || n.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of o(this, Oe).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var i;
    if (o(this, pe)) {
      (i = o(this, re)) == null || i.sendValue(e, t);
      return;
    }
    const n = d(this, E, pr).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(n, 1), r.set(t, 33);
    for (const a of o(this, Oe).values())
      if (a.readyState === "open")
        try {
          a.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (o(this, pe)) {
      (r = o(this, re)) == null || r.requestValue(e);
      return;
    }
    const t = d(this, E, pr).call(this, e), n = new Uint8Array(33);
    n[0] = 3, n.set(t, 1);
    for (const i of o(this, Oe).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return o(this, $t).add(e), o(this, pe) && o(this, re) != null ? o(this, re).onPatch(e) : () => {
      o(this, $t).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return o(this, Ut).add(e), o(this, pe) && o(this, re) != null ? o(this, re).onValue(e) : () => {
      o(this, Ut).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, zt).add(e), () => {
      o(this, zt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (o(this, pe)) {
      (r = o(this, re)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), n = new Uint8Array(1 + t.byteLength);
    n[0] = 4, n.set(t, 1);
    for (const i of o(this, Oe).values())
      if (i.readyState === "open")
        try {
          i.send(n);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return o(this, _t).add(e), () => {
      o(this, _t).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return o(this, Ft);
  }
}
Tn = new WeakMap(), Ce = new WeakMap(), re = new WeakMap(), st = new WeakMap(), De = new WeakMap(), Oe = new WeakMap(), it = new WeakMap(), $t = new WeakMap(), Ut = new WeakMap(), zt = new WeakMap(), _t = new WeakMap(), Ft = new WeakMap(), pe = new WeakMap(), E = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
pn = function(e) {
  if (o(this, it) !== e) {
    w(this, it, e);
    for (const t of o(this, zt))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
vn = function(e) {
  var t;
  ((t = o(this, st)) == null ? void 0 : t.readyState) === WebSocket.OPEN && o(this, st).send(JSON.stringify(e));
}, Ts = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === o(this, Ce))
        return;
      o(this, De).has(e.from) || await d(this, E, Cs).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== o(this, Ce))
        return;
      await d(this, E, Os).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== o(this, Ce))
        return;
      const n = o(this, De).get(e.from);
      n != null && await n.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== o(this, Ce))
        return;
      const n = o(this, De).get(e.from);
      n != null && await n.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, Cs = async function(e) {
  const t = d(this, E, mr).call(this, e), n = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  d(this, E, yr).call(this, n, e), o(this, Oe).set(e, n);
  const r = await t.createOffer();
  await t.setLocalDescription(r), d(this, E, vn).call(this, { type: "offer", from: o(this, Ce), to: e, sdp: r });
}, Os = async function(e, t) {
  const n = d(this, E, mr).call(this, e);
  await n.setRemoteDescription(new RTCSessionDescription(t));
  const r = await n.createAnswer();
  await n.setLocalDescription(r), d(this, E, vn).call(this, { type: "answer", from: o(this, Ce), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
mr = function(e) {
  const t = o(this, Tn).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], n = new RTCPeerConnection({ iceServers: t });
  return o(this, De).set(e, n), n.onicecandidate = (r) => {
    r.candidate != null && d(this, E, vn).call(this, {
      type: "candidate",
      from: o(this, Ce),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, n.ondatachannel = (r) => {
    d(this, E, yr).call(this, r.channel, e), o(this, Oe).set(e, r.channel);
  }, n.onconnectionstatechange = () => {
    if (n.connectionState === "failed" || n.connectionState === "closed") {
      o(this, De).delete(e), o(this, Oe).delete(e), o(this, Ft).delete(e);
      for (const r of o(this, _t))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, n;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
yr = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (n) => {
    const r = new Uint8Array(n.data);
    d(this, E, Ns).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Ns = function(e, t) {
  if (e.byteLength < 1)
    return;
  const n = e[0], r = e.slice(1);
  switch (n) {
    case 1: {
      for (const i of o(this, $t))
        try {
          i(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const i = d(this, E, Es).call(this, r.slice(0, 32)), a = r.slice(32);
      for (const c of o(this, Ut))
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
        i.lastSeen = Date.now(), o(this, Ft).set(i.PeerId, i);
        for (const a of o(this, _t))
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
pr = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Es = function(e) {
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
function Xe(s, e, t) {
  return s.transaction(e, t);
}
var We, Ne, Cn, Ee, Ue;
class Wi {
  /**** constructor ****/
  constructor(e) {
    y(this, Ee);
    y(this, We);
    y(this, Ne);
    y(this, Cn);
    w(this, Ne, e), w(this, Cn, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await d(this, Ee, Ue).call(this), t = Xe(e, ["snapshots"], "readonly"), n = await Ie(
      t.objectStore("snapshots").get(o(this, Ne))
    );
    return n != null ? n.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await d(this, Ee, Ue).call(this), n = Xe(t, ["snapshots"], "readwrite");
    await Ie(
      n.objectStore("snapshots").put({
        storeId: o(this, Ne),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await d(this, Ee, Ue).call(this), r = Xe(t, ["patches"], "readonly").objectStore("patches"), i = IDBKeyRange.bound(
      [o(this, Ne), e + 1],
      [o(this, Ne), Number.MAX_SAFE_INTEGER]
    );
    return (await Ie(
      r.getAll(i)
    )).sort((c, l) => c.clock - l.clock).map((c) => c.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const n = await d(this, Ee, Ue).call(this), r = Xe(n, ["patches"], "readwrite");
    try {
      await Ie(
        r.objectStore("patches").add({
          storeId: o(this, Ne),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await d(this, Ee, Ue).call(this), r = Xe(t, ["patches"], "readwrite").objectStore("patches"), i = IDBKeyRange.bound(
      [o(this, Ne), 0],
      [o(this, Ne), e - 1]
    );
    await new Promise((a, c) => {
      const l = r.openCursor(i);
      l.onsuccess = () => {
        const h = l.result;
        if (h === null) {
          a();
          return;
        }
        h.delete(), h.continue();
      }, l.onerror = () => {
        c(l.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = await d(this, Ee, Ue).call(this), n = Xe(t, ["values"], "readonly"), r = await Ie(
      n.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const n = await d(this, Ee, Ue).call(this), i = Xe(n, ["values"], "readwrite").objectStore("values"), a = await Ie(
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
    const t = await d(this, Ee, Ue).call(this), r = Xe(t, ["values"], "readwrite").objectStore("values"), i = await Ie(
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
    (e = o(this, We)) == null || e.close(), w(this, We, void 0);
  }
}
We = new WeakMap(), Ne = new WeakMap(), Cn = new WeakMap(), Ee = new WeakSet(), Ue = async function() {
  return o(this, We) != null ? o(this, We) : new Promise((e, t) => {
    const n = indexedDB.open(o(this, Cn), 1);
    n.onupgradeneeded = (r) => {
      const i = r.target.result;
      i.objectStoreNames.contains("snapshots") || i.createObjectStore("snapshots", { keyPath: "storeId" }), i.objectStoreNames.contains("patches") || i.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), i.objectStoreNames.contains("values") || i.createObjectStore("values", { keyPath: "hash" });
    }, n.onsuccess = (r) => {
      w(this, We, r.target.result), e(o(this, We));
    }, n.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const $i = 512 * 1024;
var ve, ae, B, at, Ht, Wt, On, Nn, wt, Jt, ot, qt, kt, xt, bt, Je, ct, Ae, En, Gt, qe, R, As, Ls, Ms, Rs, Ps, vr, Vs, Zs, Ds, js, _r;
class Ji {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    y(this, R);
    y(this, ve);
    y(this, ae);
    y(this, B);
    y(this, at);
    y(this, Ht);
    an(this, "PeerId", crypto.randomUUID());
    y(this, Wt);
    y(this, On);
    y(this, Nn, []);
    // outgoing patch queue (patches created while disconnected)
    y(this, wt, 0);
    // accumulated patch bytes since last checkpoint
    y(this, Jt, 0);
    // sequence number of the last saved snapshot
    y(this, ot, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    y(this, qt, new Uint8Array(0));
    // heartbeat timer
    y(this, kt);
    y(this, xt);
    // presence peer tracking
    y(this, bt, /* @__PURE__ */ new Map());
    y(this, Je, /* @__PURE__ */ new Map());
    y(this, ct, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    y(this, Ae);
    // connection state mirror
    y(this, En, "disconnected");
    y(this, Gt, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    y(this, qe, []);
    w(this, ve, e), w(this, ae, t.PersistenceProvider ?? void 0), w(this, B, t.NetworkProvider ?? void 0), w(this, at, t.PresenceProvider ?? t.NetworkProvider ?? void 0), w(this, Ht, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && o(this, B) != null && w(this, Ae, new BroadcastChannel(`sns:${o(this, B).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await d(this, R, As).call(this), d(this, R, Ls).call(this), d(this, R, Ms).call(this), d(this, R, Rs).call(this), d(this, R, Ps).call(this), o(this, B) != null && o(this, B).onConnectionChange((e) => {
      w(this, En, e);
      for (const t of o(this, Gt))
        try {
          t(e);
        } catch {
        }
      e === "connected" && d(this, R, Vs).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, n;
    o(this, kt) != null && (clearInterval(o(this, kt)), w(this, kt, void 0));
    for (const r of o(this, Je).values())
      clearTimeout(r);
    o(this, Je).clear();
    for (const r of o(this, qe))
      try {
        r();
      } catch {
      }
    w(this, qe, []), (e = o(this, Ae)) == null || e.close(), w(this, Ae, void 0), (t = o(this, B)) == null || t.disconnect(), o(this, ae) != null && o(this, wt) > 0 && await d(this, R, vr).call(this), await ((n = o(this, ae)) == null ? void 0 : n.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (o(this, B) == null)
      throw new $("no-network-provider", "no NetworkProvider configured");
    w(this, Wt, e), w(this, On, t), await o(this, B).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (o(this, B) == null)
      throw new $("no-network-provider", "no NetworkProvider configured");
    o(this, B).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (o(this, B) == null)
      throw new $("no-network-provider", "no NetworkProvider configured");
    if (o(this, Wt) == null)
      throw new $(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await o(this, B).connect(o(this, Wt), o(this, On));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return o(this, En);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return o(this, Gt).add(e), () => {
      o(this, Gt).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var n, r;
    w(this, xt, e);
    const t = { ...e, PeerId: this.PeerId };
    (n = o(this, at)) == null || n.sendLocalState(e), (r = o(this, Ae)) == null || r.postMessage({ type: "presence", payload: e });
    for (const i of o(this, ct))
      try {
        i(this.PeerId, t, "local");
      } catch {
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return o(this, bt);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return o(this, ct).add(e), () => {
      o(this, ct).delete(e);
    };
  }
}
ve = new WeakMap(), ae = new WeakMap(), B = new WeakMap(), at = new WeakMap(), Ht = new WeakMap(), Wt = new WeakMap(), On = new WeakMap(), Nn = new WeakMap(), wt = new WeakMap(), Jt = new WeakMap(), ot = new WeakMap(), qt = new WeakMap(), kt = new WeakMap(), xt = new WeakMap(), bt = new WeakMap(), Je = new WeakMap(), ct = new WeakMap(), Ae = new WeakMap(), En = new WeakMap(), Gt = new WeakMap(), qe = new WeakMap(), R = new WeakSet(), As = async function() {
  if (o(this, ae) == null)
    return;
  const e = await o(this, ae).loadSnapshot();
  if (e != null)
    try {
      const n = o(this, ve).constructor.fromBinary(e);
    } catch {
    }
  const t = await o(this, ae).loadPatchesSince(o(this, Jt));
  for (const n of t)
    try {
      o(this, ve).applyRemotePatch(n);
    } catch {
    }
  t.length > 0 && w(this, ot, o(this, Jt) + t.length), w(this, qt, o(this, ve).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
Ls = function() {
  const e = o(this, ve).onChangeInvoke((t, n) => {
    var a, c;
    if (t !== "internal")
      return;
    const r = o(this, qt);
    Mn(this, ot)._++;
    const i = o(this, ve).exportPatch(r);
    w(this, qt, o(this, ve).currentCursor), i.byteLength !== 0 && (o(this, ae) != null && (o(this, ae).appendPatch(i, o(this, ot)).catch(() => {
    }), w(this, wt, o(this, wt) + i.byteLength), o(this, wt) >= $i && d(this, R, vr).call(this).catch(() => {
    })), ((a = o(this, B)) == null ? void 0 : a.ConnectionState) === "connected" ? (o(this, B).sendPatch(i), (c = o(this, Ae)) == null || c.postMessage({ type: "patch", payload: i })) : o(this, Nn).push(i), d(this, R, Zs).call(this, n).catch(() => {
    }));
  });
  o(this, qe).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
Ms = function() {
  if (o(this, B) != null) {
    const t = o(this, B).onPatch((r) => {
      try {
        o(this, ve).applyRemotePatch(r);
      } catch {
      }
    });
    o(this, qe).push(t);
    const n = o(this, B).onValue(async (r, i) => {
      var a;
      await ((a = o(this, ae)) == null ? void 0 : a.saveValue(r, i));
    });
    o(this, qe).push(n);
  }
  const e = o(this, at);
  if (e != null) {
    const t = e.onRemoteState((n, r) => {
      d(this, R, Ds).call(this, n, r);
    });
    o(this, qe).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
Rs = function() {
  const e = o(this, Ht) / 4;
  w(this, kt, setInterval(() => {
    var t, n;
    o(this, xt) != null && ((t = o(this, at)) == null || t.sendLocalState(o(this, xt)), (n = o(this, Ae)) == null || n.postMessage({ type: "presence", payload: o(this, xt) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Ps = function() {
  o(this, Ae) != null && (o(this, Ae).onmessage = (e) => {
    var n;
    const t = e.data;
    if (t.type === "patch")
      try {
        o(this, ve).applyRemotePatch(t.payload);
      } catch {
      }
    else t.type === "presence" && ((n = o(this, at)) == null || n.sendLocalState(t.payload));
  });
}, vr = async function() {
  o(this, ae) != null && (await o(this, ae).saveSnapshot(o(this, ve).asBinary()), await o(this, ae).prunePatches(o(this, ot)), w(this, Jt, o(this, ot)), w(this, wt, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
Vs = function() {
  var t;
  const e = o(this, Nn).splice(0);
  for (const n of e)
    try {
      (t = o(this, B)) == null || t.sendPatch(n);
    } catch {
    }
}, Zs = async function(e) {
  for (const [t, n] of Object.entries(e))
    n.has("Value") && o(this, B) != null;
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
Ds = function(e, t) {
  if (t == null) {
    d(this, R, _r).call(this, e);
    return;
  }
  const n = { ...t, _lastSeen: Date.now() };
  o(this, bt).set(e, n), d(this, R, js).call(this, e);
  for (const r of o(this, ct))
    try {
      r(e, t, "remote");
    } catch {
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
js = function(e) {
  const t = o(this, Je).get(e);
  t != null && clearTimeout(t);
  const n = setTimeout(
    () => {
      d(this, R, _r).call(this, e);
    },
    o(this, Ht)
  );
  o(this, Je).set(e, n);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
_r = function(e) {
  if (!o(this, bt).has(e))
    return;
  o(this, bt).delete(e);
  const t = o(this, Je).get(e);
  t != null && (clearTimeout(t), o(this, Je).delete(e));
  for (const n of o(this, ct))
    try {
      n(e, void 0, "remote");
    } catch {
    }
};
export {
  Wi as SNS_BrowserPersistenceProvider,
  rs as SNS_Entry,
  $ as SNS_Error,
  Tr as SNS_Link,
  Ir as SNS_Note,
  qr as SNS_NoteStore,
  Ji as SNS_SyncEngine,
  Hi as SNS_WebRTCProvider,
  Fi as SNS_WebSocketProvider
};
