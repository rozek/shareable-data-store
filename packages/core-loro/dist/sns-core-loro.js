var en = Object.defineProperty;
var ir = (n) => {
  throw TypeError(n);
};
var tn = (n, e, t) => e in n ? en(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var or = (n, e, t) => tn(n, typeof e != "symbol" ? e + "" : e, t), Vt = (n, e, t) => e.has(n) || ir("Cannot " + t);
var m = (n, e, t) => (Vt(n, e, "read from private field"), t ? t.call(n) : e.get(n)), W = (n, e, t) => e.has(n) ? ir("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), ge = (n, e, t, r) => (Vt(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), d = (n, e, t) => (Vt(n, e, "access private method"), t);
var jt = (n, e, t, r) => ({
  set _(s) {
    ge(n, e, s, t);
  },
  get _() {
    return m(n, e, r);
  }
});
import { Loro as cr, LoroMap as E, LoroText as J, VersionVector as rn } from "loro-crdt";
class q extends Error {
  constructor(t, r) {
    super(r);
    or(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
}
const ce = "00000000-0000-4000-8000-000000000000", K = "00000000-0000-4000-8000-000000000001", le = "00000000-0000-4000-8000-000000000002", bt = "text/plain", nn = 131072, sn = 2048, an = 5e3;
class Rr {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  get isRootNote() {
    return this.Id === ce;
  }
  get isTrashNote() {
    return this.Id === K;
  }
  get isLostAndFoundNote() {
    return this.Id === le;
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
class lr extends Rr {
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
  changeValue(e, t, r) {
    this._Store._spliceValueOf(this.Id, e, t, r);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class dr extends Rr {
  constructor(e, t) {
    super(e, t);
  }
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
var T;
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
    const a = {};
    for (const i of s)
      a[i] = i;
    return a;
  }, n.getValidEnumValues = (s) => {
    const a = n.objectKeys(s).filter((o) => typeof s[s[o]] != "number"), i = {};
    for (const o of a)
      i[o] = s[o];
    return n.objectValues(i);
  }, n.objectValues = (s) => n.objectKeys(s).map(function(a) {
    return s[a];
  }), n.objectKeys = typeof Object.keys == "function" ? (s) => Object.keys(s) : (s) => {
    const a = [];
    for (const i in s)
      Object.prototype.hasOwnProperty.call(s, i) && a.push(i);
    return a;
  }, n.find = (s, a) => {
    for (const i of s)
      if (a(i))
        return i;
  }, n.isInteger = typeof Number.isInteger == "function" ? (s) => Number.isInteger(s) : (s) => typeof s == "number" && Number.isFinite(s) && Math.floor(s) === s;
  function r(s, a = " | ") {
    return s.map((i) => typeof i == "string" ? `'${i}'` : i).join(a);
  }
  n.joinValues = r, n.jsonStringifyReplacer = (s, a) => typeof a == "bigint" ? a.toString() : a;
})(T || (T = {}));
var ur;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(ur || (ur = {}));
const v = T.arrayToEnum([
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
]), Ae = (n) => {
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
}, h = T.arrayToEnum([
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
class Ce extends Error {
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
    const t = e || function(a) {
      return a.message;
    }, r = { _errors: [] }, s = (a) => {
      for (const i of a.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(s);
        else if (i.code === "invalid_return_type")
          s(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          s(i.argumentsError);
        else if (i.path.length === 0)
          r._errors.push(t(i));
        else {
          let o = r, l = 0;
          for (; l < i.path.length; ) {
            const u = i.path[l];
            l === i.path.length - 1 ? (o[u] = o[u] || { _errors: [] }, o[u]._errors.push(t(i))) : o[u] = o[u] || { _errors: [] }, o = o[u], l++;
          }
        }
    };
    return s(this), r;
  }
  static assert(e) {
    if (!(e instanceof Ce))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, T.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const s of this.issues)
      if (s.path.length > 0) {
        const a = s.path[0];
        t[a] = t[a] || [], t[a].push(e(s));
      } else
        r.push(e(s));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Ce.create = (n) => new Ce(n);
const Pt = (n, e) => {
  let t;
  switch (n.code) {
    case h.invalid_type:
      n.received === v.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case h.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, T.jsonStringifyReplacer)}`;
      break;
    case h.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${T.joinValues(n.keys, ", ")}`;
      break;
    case h.invalid_union:
      t = "Invalid input";
      break;
    case h.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${T.joinValues(n.options)}`;
      break;
    case h.invalid_enum_value:
      t = `Invalid enum value. Expected ${T.joinValues(n.options)}, received '${n.received}'`;
      break;
    case h.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case h.invalid_return_type:
      t = "Invalid function return type";
      break;
    case h.invalid_date:
      t = "Invalid date";
      break;
    case h.invalid_string:
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : T.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
      break;
    case h.too_small:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "more than"} ${n.minimum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "over"} ${n.minimum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "bigint" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(n.minimum))}` : t = "Invalid input";
      break;
    case h.too_big:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "less than"} ${n.maximum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "under"} ${n.maximum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "bigint" ? t = `BigInt must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly" : n.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(n.maximum))}` : t = "Invalid input";
      break;
    case h.custom:
      t = "Invalid input";
      break;
    case h.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case h.not_multiple_of:
      t = `Number must be a multiple of ${n.multipleOf}`;
      break;
    case h.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, T.assertNever(n);
  }
  return { message: t };
};
let on = Pt;
function cn() {
  return on;
}
const ln = (n) => {
  const { data: e, path: t, errorMaps: r, issueData: s } = n, a = [...t, ...s.path || []], i = {
    ...s,
    path: a
  };
  if (s.message !== void 0)
    return {
      ...s,
      path: a,
      message: s.message
    };
  let o = "";
  const l = r.filter((u) => !!u).slice().reverse();
  for (const u of l)
    o = u(i, { data: e, defaultError: o }).message;
  return {
    ...s,
    path: a,
    message: o
  };
};
function g(n, e) {
  const t = cn(), r = ln({
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
      t === Pt ? void 0 : Pt
      // then global default map
    ].filter((s) => !!s)
  });
  n.common.issues.push(r);
}
class ue {
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
        return _;
      s.status === "dirty" && e.dirty(), r.push(s.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const s of t) {
      const a = await s.key, i = await s.value;
      r.push({
        key: a,
        value: i
      });
    }
    return ue.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const s of t) {
      const { key: a, value: i } = s;
      if (a.status === "aborted" || i.status === "aborted")
        return _;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || s.alwaysSet) && (r[a.value] = i.value);
    }
    return { status: e.value, value: r };
  }
}
const _ = Object.freeze({
  status: "aborted"
}), ft = (n) => ({ status: "dirty", value: n }), me = (n) => ({ status: "valid", value: n }), fr = (n) => n.status === "aborted", hr = (n) => n.status === "dirty", tt = (n) => n.status === "valid", Tt = (n) => typeof Promise < "u" && n instanceof Promise;
var y;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(y || (y = {}));
class je {
  constructor(e, t, r, s) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const mr = (n, e) => {
  if (tt(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ce(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function b(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: s } = n;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: s } : { errorMap: (i, o) => {
    const { message: l } = n;
    return i.code === "invalid_enum_value" ? { message: l ?? o.defaultError } : typeof o.data > "u" ? { message: l ?? r ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: l ?? t ?? o.defaultError };
  }, description: s };
}
class S {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Ae(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Ae(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new ue(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Ae(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Tt(t))
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
      parsedType: Ae(e)
    }, s = this._parseSync({ data: e, path: r.path, parent: r });
    return mr(r, s);
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
      parsedType: Ae(e)
    };
    if (!this["~standard"].async)
      try {
        const a = this._parseSync({ data: e, path: [], parent: t });
        return tt(a) ? {
          value: a.value
        } : {
          issues: t.common.issues
        };
      } catch (a) {
        (s = (r = a == null ? void 0 : a.message) == null ? void 0 : r.toLowerCase()) != null && s.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((a) => tt(a) ? {
      value: a.value
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
      parsedType: Ae(e)
    }, s = this._parse({ data: e, path: r.path, parent: r }), a = await (Tt(s) ? s : Promise.resolve(s));
    return mr(r, a);
  }
  refine(e, t) {
    const r = (s) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(s) : t;
    return this._refinement((s, a) => {
      const i = e(s), o = () => a.addIssue({
        code: h.custom,
        ...r(s)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((l) => l ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, s) => e(r) ? !0 : (s.addIssue(typeof t == "function" ? t(r, s) : t), !1));
  }
  _refinement(e) {
    return new st({
      schema: this,
      typeName: w.ZodEffects,
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
    return Ve.create(this, this._def);
  }
  nullable() {
    return at.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Ie.create(this);
  }
  promise() {
    return At.create(this, this._def);
  }
  or(e) {
    return Nt.create([this, e], this._def);
  }
  and(e) {
    return Et.create(this, e, this._def);
  }
  transform(e) {
    return new st({
      ...b(this._def),
      schema: this,
      typeName: w.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ut({
      ...b(this._def),
      innerType: this,
      defaultValue: t,
      typeName: w.ZodDefault
    });
  }
  brand() {
    return new Ln({
      typeName: w.ZodBranded,
      type: this,
      ...b(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ft({
      ...b(this._def),
      innerType: this,
      catchValue: t,
      typeName: w.ZodCatch
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
    return nr.create(this, e);
  }
  readonly() {
    return Wt.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const dn = /^c[^\s-]{8,}$/i, un = /^[0-9a-z]+$/, fn = /^[0-9A-HJKMNP-TV-Z]{26}$/i, hn = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, mn = /^[a-z0-9_-]{21}$/i, gn = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, vn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, pn = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, yn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Kt;
const _n = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, wn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, xn = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, kn = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, In = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, bn = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Zr = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Sn = new RegExp(`^${Zr}$`);
function Vr(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function On(n) {
  return new RegExp(`^${Vr(n)}$`);
}
function Tn(n) {
  let e = `${Zr}T${Vr(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Cn(n, e) {
  return !!((e === "v4" || !e) && _n.test(n) || (e === "v6" || !e) && xn.test(n));
}
function Nn(n, e) {
  if (!gn.test(n))
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
function En(n, e) {
  return !!((e === "v4" || !e) && wn.test(n) || (e === "v6" || !e) && kn.test(n));
}
class Ze extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== v.string) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: h.invalid_type,
        expected: v.string,
        received: a.parsedType
      }), _;
    }
    const r = new ue();
    let s;
    for (const a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (s = this._getOrReturnCtx(e, s), g(s, {
          code: h.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (s = this._getOrReturnCtx(e, s), g(s, {
          code: h.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "length") {
        const i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (s = this._getOrReturnCtx(e, s), i ? g(s, {
          code: h.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }) : o && g(s, {
          code: h.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }), r.dirty());
      } else if (a.kind === "email")
        pn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "email",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "emoji")
        Kt || (Kt = new RegExp(yn, "u")), Kt.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "emoji",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "uuid")
        hn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "uuid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "nanoid")
        mn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "nanoid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid")
        dn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "cuid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid2")
        un.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "cuid2",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "ulid")
        fn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "ulid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          s = this._getOrReturnCtx(e, s), g(s, {
            validation: "url",
            code: h.invalid_string,
            message: a.message
          }), r.dirty();
        }
      else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "regex",
        code: h.invalid_string,
        message: a.message
      }), r.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: { includes: a.value, position: a.position },
        message: a.message
      }), r.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: { startsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: { endsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "datetime" ? Tn(a).test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: "datetime",
        message: a.message
      }), r.dirty()) : a.kind === "date" ? Sn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: "date",
        message: a.message
      }), r.dirty()) : a.kind === "time" ? On(a).test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.invalid_string,
        validation: "time",
        message: a.message
      }), r.dirty()) : a.kind === "duration" ? vn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "duration",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "ip" ? Cn(e.data, a.version) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "ip",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "jwt" ? Nn(e.data, a.alg) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "jwt",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "cidr" ? En(e.data, a.version) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "cidr",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64" ? In.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "base64",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64url" ? bn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "base64url",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : T.assertNever(a);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((s) => e.test(s), {
      validation: t,
      code: h.invalid_string,
      ...y.errToObj(r)
    });
  }
  _addCheck(e) {
    return new Ze({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...y.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...y.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...y.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...y.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...y.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...y.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...y.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...y.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...y.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...y.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...y.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...y.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...y.errToObj(e) });
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
      ...y.errToObj(e == null ? void 0 : e.message)
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
      ...y.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...y.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...y.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...y.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...y.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...y.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...y.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...y.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...y.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, y.errToObj(e));
  }
  trim() {
    return new Ze({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new Ze({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new Ze({
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
Ze.create = (n) => new Ze({
  checks: [],
  typeName: w.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...b(n)
});
function An(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = t > r ? t : r, a = Number.parseInt(n.toFixed(s).replace(".", "")), i = Number.parseInt(e.toFixed(s).replace(".", ""));
  return a % i / 10 ** s;
}
class rt extends S {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== v.number) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: h.invalid_type,
        expected: v.number,
        received: a.parsedType
      }), _;
    }
    let r;
    const s = new ue();
    for (const a of this._def.checks)
      a.kind === "int" ? T.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.invalid_type,
        expected: "integer",
        received: "float",
        message: a.message
      }), s.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.too_small,
        minimum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.too_big,
        maximum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), s.dirty()) : a.kind === "multipleOf" ? An(e.data, a.value) !== 0 && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), s.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.not_finite,
        message: a.message
      }), s.dirty()) : T.assertNever(a);
    return { status: s.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, y.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, y.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, y.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, y.toString(t));
  }
  setLimit(e, t, r, s) {
    return new rt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: y.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new rt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: y.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: y.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: y.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: y.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: y.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: y.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: y.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: y.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: y.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && T.isInteger(e.value));
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
rt.create = (n) => new rt({
  checks: [],
  typeName: w.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...b(n)
});
class yt extends S {
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
    const s = new ue();
    for (const a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.too_small,
        type: "bigint",
        minimum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.too_big,
        type: "bigint",
        maximum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), s.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: h.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), s.dirty()) : T.assertNever(a);
    return { status: s.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return g(t, {
      code: h.invalid_type,
      expected: v.bigint,
      received: t.parsedType
    }), _;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, y.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, y.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, y.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, y.toString(t));
  }
  setLimit(e, t, r, s) {
    return new yt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: y.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new yt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: y.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: y.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: y.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: y.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: y.toString(t)
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
yt.create = (n) => new yt({
  checks: [],
  typeName: w.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...b(n)
});
class gr extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== v.boolean) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.boolean,
        received: r.parsedType
      }), _;
    }
    return me(e.data);
  }
}
gr.create = (n) => new gr({
  typeName: w.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...b(n)
});
class Ct extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== v.date) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: h.invalid_type,
        expected: v.date,
        received: a.parsedType
      }), _;
    }
    if (Number.isNaN(e.data.getTime())) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: h.invalid_date
      }), _;
    }
    const r = new ue();
    let s;
    for (const a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.too_small,
        message: a.message,
        inclusive: !0,
        exact: !1,
        minimum: a.value,
        type: "date"
      }), r.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (s = this._getOrReturnCtx(e, s), g(s, {
        code: h.too_big,
        message: a.message,
        inclusive: !0,
        exact: !1,
        maximum: a.value,
        type: "date"
      }), r.dirty()) : T.assertNever(a);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new Ct({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: y.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: y.toString(t)
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
Ct.create = (n) => new Ct({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: w.ZodDate,
  ...b(n)
});
class vr extends S {
  _parse(e) {
    if (this._getType(e) !== v.symbol) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.symbol,
        received: r.parsedType
      }), _;
    }
    return me(e.data);
  }
}
vr.create = (n) => new vr({
  typeName: w.ZodSymbol,
  ...b(n)
});
class pr extends S {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.undefined,
        received: r.parsedType
      }), _;
    }
    return me(e.data);
  }
}
pr.create = (n) => new pr({
  typeName: w.ZodUndefined,
  ...b(n)
});
class yr extends S {
  _parse(e) {
    if (this._getType(e) !== v.null) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.null,
        received: r.parsedType
      }), _;
    }
    return me(e.data);
  }
}
yr.create = (n) => new yr({
  typeName: w.ZodNull,
  ...b(n)
});
class _r extends S {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return me(e.data);
  }
}
_r.create = (n) => new _r({
  typeName: w.ZodAny,
  ...b(n)
});
class wr extends S {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return me(e.data);
  }
}
wr.create = (n) => new wr({
  typeName: w.ZodUnknown,
  ...b(n)
});
class Ke extends S {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return g(t, {
      code: h.invalid_type,
      expected: v.never,
      received: t.parsedType
    }), _;
  }
}
Ke.create = (n) => new Ke({
  typeName: w.ZodNever,
  ...b(n)
});
class xr extends S {
  _parse(e) {
    if (this._getType(e) !== v.undefined) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.void,
        received: r.parsedType
      }), _;
    }
    return me(e.data);
  }
}
xr.create = (n) => new xr({
  typeName: w.ZodVoid,
  ...b(n)
});
class Ie extends S {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), s = this._def;
    if (t.parsedType !== v.array)
      return g(t, {
        code: h.invalid_type,
        expected: v.array,
        received: t.parsedType
      }), _;
    if (s.exactLength !== null) {
      const i = t.data.length > s.exactLength.value, o = t.data.length < s.exactLength.value;
      (i || o) && (g(t, {
        code: i ? h.too_big : h.too_small,
        minimum: o ? s.exactLength.value : void 0,
        maximum: i ? s.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: s.exactLength.message
      }), r.dirty());
    }
    if (s.minLength !== null && t.data.length < s.minLength.value && (g(t, {
      code: h.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.minLength.message
    }), r.dirty()), s.maxLength !== null && t.data.length > s.maxLength.value && (g(t, {
      code: h.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => s.type._parseAsync(new je(t, i, t.path, o)))).then((i) => ue.mergeArray(r, i));
    const a = [...t.data].map((i, o) => s.type._parseSync(new je(t, i, t.path, o)));
    return ue.mergeArray(r, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new Ie({
      ...this._def,
      minLength: { value: e, message: y.toString(t) }
    });
  }
  max(e, t) {
    return new Ie({
      ...this._def,
      maxLength: { value: e, message: y.toString(t) }
    });
  }
  length(e, t) {
    return new Ie({
      ...this._def,
      exactLength: { value: e, message: y.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Ie.create = (n, e) => new Ie({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: w.ZodArray,
  ...b(e)
});
function qe(n) {
  if (n instanceof D) {
    const e = {};
    for (const t in n.shape) {
      const r = n.shape[t];
      e[t] = Ve.create(qe(r));
    }
    return new D({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof Ie ? new Ie({
    ...n._def,
    type: qe(n.element)
  }) : n instanceof Ve ? Ve.create(qe(n.unwrap())) : n instanceof at ? at.create(qe(n.unwrap())) : n instanceof Be ? Be.create(n.items.map((e) => qe(e))) : n;
}
class D extends S {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = T.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== v.object) {
      const u = this._getOrReturnCtx(e);
      return g(u, {
        code: h.invalid_type,
        expected: v.object,
        received: u.parsedType
      }), _;
    }
    const { status: r, ctx: s } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Ke && this._def.unknownKeys === "strip"))
      for (const u in s.data)
        i.includes(u) || o.push(u);
    const l = [];
    for (const u of i) {
      const f = a[u], p = s.data[u];
      l.push({
        key: { status: "valid", value: u },
        value: f._parse(new je(s, p, s.path, u)),
        alwaysSet: u in s.data
      });
    }
    if (this._def.catchall instanceof Ke) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const f of o)
          l.push({
            key: { status: "valid", value: f },
            value: { status: "valid", value: s.data[f] }
          });
      else if (u === "strict")
        o.length > 0 && (g(s, {
          code: h.unrecognized_keys,
          keys: o
        }), r.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const f of o) {
        const p = s.data[f];
        l.push({
          key: { status: "valid", value: f },
          value: u._parse(
            new je(s, p, s.path, f)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: f in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const f of l) {
        const p = await f.key, x = await f.value;
        u.push({
          key: p,
          value: x,
          alwaysSet: f.alwaysSet
        });
      }
      return u;
    }).then((u) => ue.mergeObjectSync(r, u)) : ue.mergeObjectSync(r, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return y.errToObj, new D({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var a, i;
          const s = ((i = (a = this._def).errorMap) == null ? void 0 : i.call(a, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: y.errToObj(e).message ?? s
          } : {
            message: s
          };
        }
      } : {}
    });
  }
  strip() {
    return new D({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new D({
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
    return new D({
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
    return new D({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: w.ZodObject
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
    return new D({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of T.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new D({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of T.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new D({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return qe(this);
  }
  partial(e) {
    const t = {};
    for (const r of T.objectKeys(this.shape)) {
      const s = this.shape[r];
      e && !e[r] ? t[r] = s : t[r] = s.optional();
    }
    return new D({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of T.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let a = this.shape[r];
        for (; a instanceof Ve; )
          a = a._def.innerType;
        t[r] = a;
      }
    return new D({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return jr(T.objectKeys(this.shape));
  }
}
D.create = (n, e) => new D({
  shape: () => n,
  unknownKeys: "strip",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
D.strictCreate = (n, e) => new D({
  shape: () => n,
  unknownKeys: "strict",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
D.lazycreate = (n, e) => new D({
  shape: n,
  unknownKeys: "strip",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
class Nt extends S {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function s(a) {
      for (const o of a)
        if (o.result.status === "valid")
          return o.result;
      for (const o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = a.map((o) => new Ce(o.ctx.common.issues));
      return g(t, {
        code: h.invalid_union,
        unionErrors: i
      }), _;
    }
    if (t.common.async)
      return Promise.all(r.map(async (a) => {
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
      })).then(s);
    {
      let a;
      const i = [];
      for (const l of r) {
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
        f.status === "dirty" && !a && (a = { result: f, ctx: u }), u.common.issues.length && i.push(u.common.issues);
      }
      if (a)
        return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((l) => new Ce(l));
      return g(t, {
        code: h.invalid_union,
        unionErrors: o
      }), _;
    }
  }
  get options() {
    return this._def.options;
  }
}
Nt.create = (n, e) => new Nt({
  options: n,
  typeName: w.ZodUnion,
  ...b(e)
});
function Bt(n, e) {
  const t = Ae(n), r = Ae(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === v.object && r === v.object) {
    const s = T.objectKeys(e), a = T.objectKeys(n).filter((o) => s.indexOf(o) !== -1), i = { ...n, ...e };
    for (const o of a) {
      const l = Bt(n[o], e[o]);
      if (!l.valid)
        return { valid: !1 };
      i[o] = l.data;
    }
    return { valid: !0, data: i };
  } else if (t === v.array && r === v.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const s = [];
    for (let a = 0; a < n.length; a++) {
      const i = n[a], o = e[a], l = Bt(i, o);
      if (!l.valid)
        return { valid: !1 };
      s.push(l.data);
    }
    return { valid: !0, data: s };
  } else return t === v.date && r === v.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class Et extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = (a, i) => {
      if (fr(a) || fr(i))
        return _;
      const o = Bt(a.value, i.value);
      return o.valid ? ((hr(a) || hr(i)) && t.dirty(), { status: t.value, value: o.data }) : (g(r, {
        code: h.invalid_intersection_types
      }), _);
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
    ]).then(([a, i]) => s(a, i)) : s(this._def.left._parseSync({
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
Et.create = (n, e, t) => new Et({
  left: n,
  right: e,
  typeName: w.ZodIntersection,
  ...b(t)
});
class Be extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.array)
      return g(r, {
        code: h.invalid_type,
        expected: v.array,
        received: r.parsedType
      }), _;
    if (r.data.length < this._def.items.length)
      return g(r, {
        code: h.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), _;
    !this._def.rest && r.data.length > this._def.items.length && (g(r, {
      code: h.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const a = [...r.data].map((i, o) => {
      const l = this._def.items[o] || this._def.rest;
      return l ? l._parse(new je(r, i, r.path, o)) : null;
    }).filter((i) => !!i);
    return r.common.async ? Promise.all(a).then((i) => ue.mergeArray(t, i)) : ue.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Be({
      ...this._def,
      rest: e
    });
  }
}
Be.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Be({
    items: n,
    typeName: w.ZodTuple,
    rest: null,
    ...b(e)
  });
};
class kr extends S {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.map)
      return g(r, {
        code: h.invalid_type,
        expected: v.map,
        received: r.parsedType
      }), _;
    const s = this._def.keyType, a = this._def.valueType, i = [...r.data.entries()].map(([o, l], u) => ({
      key: s._parse(new je(r, o, r.path, [u, "key"])),
      value: a._parse(new je(r, l, r.path, [u, "value"]))
    }));
    if (r.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of i) {
          const u = await l.key, f = await l.value;
          if (u.status === "aborted" || f.status === "aborted")
            return _;
          (u.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(u.value, f.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const l of i) {
        const u = l.key, f = l.value;
        if (u.status === "aborted" || f.status === "aborted")
          return _;
        (u.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(u.value, f.value);
      }
      return { status: t.value, value: o };
    }
  }
}
kr.create = (n, e, t) => new kr({
  valueType: e,
  keyType: n,
  typeName: w.ZodMap,
  ...b(t)
});
class _t extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== v.set)
      return g(r, {
        code: h.invalid_type,
        expected: v.set,
        received: r.parsedType
      }), _;
    const s = this._def;
    s.minSize !== null && r.data.size < s.minSize.value && (g(r, {
      code: h.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.minSize.message
    }), t.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && (g(r, {
      code: h.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.maxSize.message
    }), t.dirty());
    const a = this._def.valueType;
    function i(l) {
      const u = /* @__PURE__ */ new Set();
      for (const f of l) {
        if (f.status === "aborted")
          return _;
        f.status === "dirty" && t.dirty(), u.add(f.value);
      }
      return { status: t.value, value: u };
    }
    const o = [...r.data.values()].map((l, u) => a._parse(new je(r, l, r.path, u)));
    return r.common.async ? Promise.all(o).then((l) => i(l)) : i(o);
  }
  min(e, t) {
    return new _t({
      ...this._def,
      minSize: { value: e, message: y.toString(t) }
    });
  }
  max(e, t) {
    return new _t({
      ...this._def,
      maxSize: { value: e, message: y.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
_t.create = (n, e) => new _t({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: w.ZodSet,
  ...b(e)
});
class Ir extends S {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ir.create = (n, e) => new Ir({
  getter: n,
  typeName: w.ZodLazy,
  ...b(e)
});
class br extends S {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return g(t, {
        received: t.data,
        code: h.invalid_literal,
        expected: this._def.value
      }), _;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
br.create = (n, e) => new br({
  value: n,
  typeName: w.ZodLiteral,
  ...b(e)
});
function jr(n, e) {
  return new nt({
    values: n,
    typeName: w.ZodEnum,
    ...b(e)
  });
}
class nt extends S {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return g(t, {
        expected: T.joinValues(r),
        received: t.parsedType,
        code: h.invalid_type
      }), _;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return g(t, {
        received: t.data,
        code: h.invalid_enum_value,
        options: r
      }), _;
    }
    return me(e.data);
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
    return nt.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return nt.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
nt.create = jr;
class Sr extends S {
  _parse(e) {
    const t = T.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== v.string && r.parsedType !== v.number) {
      const s = T.objectValues(t);
      return g(r, {
        expected: T.joinValues(s),
        received: r.parsedType,
        code: h.invalid_type
      }), _;
    }
    if (this._cache || (this._cache = new Set(T.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const s = T.objectValues(t);
      return g(r, {
        received: r.data,
        code: h.invalid_enum_value,
        options: s
      }), _;
    }
    return me(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Sr.create = (n, e) => new Sr({
  values: n,
  typeName: w.ZodNativeEnum,
  ...b(e)
});
class At extends S {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== v.promise && t.common.async === !1)
      return g(t, {
        code: h.invalid_type,
        expected: v.promise,
        received: t.parsedType
      }), _;
    const r = t.parsedType === v.promise ? t.data : Promise.resolve(t.data);
    return me(r.then((s) => this._def.type.parseAsync(s, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
At.create = (n, e) => new At({
  type: n,
  typeName: w.ZodPromise,
  ...b(e)
});
class st extends S {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === w.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = this._def.effect || null, a = {
      addIssue: (i) => {
        g(r, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (a.addIssue = a.addIssue.bind(a), s.type === "preprocess") {
      const i = s.transform(r.data, a);
      if (r.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return _;
          const l = await this._def.schema._parseAsync({
            data: o,
            path: r.path,
            parent: r
          });
          return l.status === "aborted" ? _ : l.status === "dirty" || t.value === "dirty" ? ft(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return _;
        const o = this._def.schema._parseSync({
          data: i,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? _ : o.status === "dirty" || t.value === "dirty" ? ft(o.value) : o;
      }
    }
    if (s.type === "refinement") {
      const i = (o) => {
        const l = s.refinement(o, a);
        if (r.common.async)
          return Promise.resolve(l);
        if (l instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? _ : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? _ : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (s.type === "transform")
      if (r.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!tt(i))
          return _;
        const o = s.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((i) => tt(i) ? Promise.resolve(s.transform(i.value, a)).then((o) => ({
          status: t.value,
          value: o
        })) : _);
    T.assertNever(s);
  }
}
st.create = (n, e, t) => new st({
  schema: n,
  typeName: w.ZodEffects,
  effect: e,
  ...b(t)
});
st.createWithPreprocess = (n, e, t) => new st({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: w.ZodEffects,
  ...b(t)
});
class Ve extends S {
  _parse(e) {
    return this._getType(e) === v.undefined ? me(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ve.create = (n, e) => new Ve({
  innerType: n,
  typeName: w.ZodOptional,
  ...b(e)
});
class at extends S {
  _parse(e) {
    return this._getType(e) === v.null ? me(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
at.create = (n, e) => new at({
  innerType: n,
  typeName: w.ZodNullable,
  ...b(e)
});
class Ut extends S {
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
Ut.create = (n, e) => new Ut({
  innerType: n,
  typeName: w.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...b(e)
});
class Ft extends S {
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
    return Tt(s) ? s.then((a) => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new Ce(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new Ce(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Ft.create = (n, e) => new Ft({
  innerType: n,
  typeName: w.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...b(e)
});
class Or extends S {
  _parse(e) {
    if (this._getType(e) !== v.nan) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: h.invalid_type,
        expected: v.nan,
        received: r.parsedType
      }), _;
    }
    return { status: "valid", value: e.data };
  }
}
Or.create = (n) => new Or({
  typeName: w.ZodNaN,
  ...b(n)
});
class Ln extends S {
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
class nr extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const a = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? _ : a.status === "dirty" ? (t.dirty(), ft(a.value)) : this._def.out._parseAsync({
          data: a.value,
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
      return s.status === "aborted" ? _ : s.status === "dirty" ? (t.dirty(), {
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
    return new nr({
      in: e,
      out: t,
      typeName: w.ZodPipeline
    });
  }
}
class Wt extends S {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (s) => (tt(s) && (s.value = Object.freeze(s.value)), s);
    return Tt(t) ? t.then((s) => r(s)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Wt.create = (n, e) => new Wt({
  innerType: n,
  typeName: w.ZodReadonly,
  ...b(e)
});
var w;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(w || (w = {}));
const Kr = Ze.create, Mn = rt.create;
Ke.create;
Ie.create;
Nt.create;
Et.create;
Be.create;
nt.create;
At.create;
Ve.create;
at.create;
var H = Uint8Array, de = Uint16Array, sr = Int32Array, Mt = new H([
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
]), Rt = new H([
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
]), Jt = new H([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), $r = function(n, e) {
  for (var t = new de(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << n[r - 1];
  for (var s = new sr(t[30]), r = 1; r < 30; ++r)
    for (var a = t[r]; a < t[r + 1]; ++a)
      s[a] = a - t[r] << 5 | r;
  return { b: t, r: s };
}, Dr = $r(Mt, 2), zr = Dr.b, qt = Dr.r;
zr[28] = 258, qt[258] = 28;
var Pr = $r(Rt, 0), Rn = Pr.b, Tr = Pr.r, Ht = new de(32768);
for (var L = 0; L < 32768; ++L) {
  var Ee = (L & 43690) >> 1 | (L & 21845) << 1;
  Ee = (Ee & 52428) >> 2 | (Ee & 13107) << 2, Ee = (Ee & 61680) >> 4 | (Ee & 3855) << 4, Ht[L] = ((Ee & 65280) >> 8 | (Ee & 255) << 8) >> 1;
}
var be = (function(n, e, t) {
  for (var r = n.length, s = 0, a = new de(e); s < r; ++s)
    n[s] && ++a[n[s] - 1];
  var i = new de(e);
  for (s = 1; s < e; ++s)
    i[s] = i[s - 1] + a[s - 1] << 1;
  var o;
  if (t) {
    o = new de(1 << e);
    var l = 15 - e;
    for (s = 0; s < r; ++s)
      if (n[s])
        for (var u = s << 4 | n[s], f = e - n[s], p = i[n[s] - 1]++ << f, x = p | (1 << f) - 1; p <= x; ++p)
          o[Ht[p] >> l] = u;
  } else
    for (o = new de(r), s = 0; s < r; ++s)
      n[s] && (o[s] = Ht[i[n[s] - 1]++] >> 15 - n[s]);
  return o;
}), $e = new H(288);
for (var L = 0; L < 144; ++L)
  $e[L] = 8;
for (var L = 144; L < 256; ++L)
  $e[L] = 9;
for (var L = 256; L < 280; ++L)
  $e[L] = 7;
for (var L = 280; L < 288; ++L)
  $e[L] = 8;
var wt = new H(32);
for (var L = 0; L < 32; ++L)
  wt[L] = 5;
var Zn = /* @__PURE__ */ be($e, 9, 0), Vn = /* @__PURE__ */ be($e, 9, 1), jn = /* @__PURE__ */ be(wt, 5, 0), Kn = /* @__PURE__ */ be(wt, 5, 1), $t = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, ve = function(n, e, t) {
  var r = e / 8 | 0;
  return (n[r] | n[r + 1] << 8) >> (e & 7) & t;
}, Dt = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, ar = function(n) {
  return (n + 7) / 8 | 0;
}, Br = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new H(n.subarray(e, t));
}, $n = [
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
], pe = function(n, e, t) {
  var r = new Error(e || $n[n]);
  if (r.code = n, Error.captureStackTrace && Error.captureStackTrace(r, pe), !t)
    throw r;
  return r;
}, Dn = function(n, e, t, r) {
  var s = n.length, a = 0;
  if (!s || e.f && !e.l)
    return t || new H(0);
  var i = !t, o = i || e.i != 2, l = e.i;
  i && (t = new H(s * 3));
  var u = function(ot) {
    var ct = t.length;
    if (ot > ct) {
      var We = new H(Math.max(ct * 2, ot));
      We.set(t), t = We;
    }
  }, f = e.f || 0, p = e.p || 0, x = e.b || 0, k = e.l, V = e.d, A = e.m, z = e.n, se = s * 8;
  do {
    if (!k) {
      f = ve(n, p, 1);
      var M = ve(n, p + 1, 3);
      if (p += 3, M)
        if (M == 1)
          k = Vn, V = Kn, A = 9, z = 5;
        else if (M == 2) {
          var X = ve(n, p, 31) + 257, P = ve(n, p + 10, 15) + 4, C = X + ve(n, p + 5, 31) + 1;
          p += 14;
          for (var I = new H(C), B = new H(19), $ = 0; $ < P; ++$)
            B[Jt[$]] = ve(n, p + $ * 3, 7);
          p += P * 3;
          for (var G = $t(B), Ne = (1 << G) - 1, ae = be(B, G, 1), $ = 0; $ < C; ) {
            var ee = ae[ve(n, p, Ne)];
            p += ee & 15;
            var j = ee >> 4;
            if (j < 16)
              I[$++] = j;
            else {
              var U = 0, R = 0;
              for (j == 16 ? (R = 3 + ve(n, p, 3), p += 2, U = I[$ - 1]) : j == 17 ? (R = 3 + ve(n, p, 7), p += 3) : j == 18 && (R = 11 + ve(n, p, 127), p += 7); R--; )
                I[$++] = U;
            }
          }
          var te = I.subarray(0, X), F = I.subarray(X);
          A = $t(te), z = $t(F), k = be(te, A, 1), V = be(F, z, 1);
        } else
          pe(1);
      else {
        var j = ar(p) + 4, Q = n[j - 4] | n[j - 3] << 8, Y = j + Q;
        if (Y > s) {
          l && pe(0);
          break;
        }
        o && u(x + Q), t.set(n.subarray(j, Y), x), e.b = x += Q, e.p = p = Y * 8, e.f = f;
        continue;
      }
      if (p > se) {
        l && pe(0);
        break;
      }
    }
    o && u(x + 131072);
    for (var it = (1 << A) - 1, fe = (1 << z) - 1, Se = p; ; Se = p) {
      var U = k[Dt(n, p) & it], ie = U >> 4;
      if (p += U & 15, p > se) {
        l && pe(0);
        break;
      }
      if (U || pe(2), ie < 256)
        t[x++] = ie;
      else if (ie == 256) {
        Se = p, k = null;
        break;
      } else {
        var oe = ie - 254;
        if (ie > 264) {
          var $ = ie - 257, Z = Mt[$];
          oe = ve(n, p, (1 << Z) - 1) + zr[$], p += Z;
        }
        var ye = V[Dt(n, p) & fe], Ue = ye >> 4;
        ye || pe(3), p += ye & 15;
        var F = Rn[Ue];
        if (Ue > 3) {
          var Z = Rt[Ue];
          F += Dt(n, p) & (1 << Z) - 1, p += Z;
        }
        if (p > se) {
          l && pe(0);
          break;
        }
        o && u(x + 131072);
        var Fe = x + oe;
        if (x < F) {
          var kt = a - F, It = Math.min(F, Fe);
          for (kt + x < 0 && pe(3); x < It; ++x)
            t[x] = r[kt + x];
        }
        for (; x < Fe; ++x)
          t[x] = t[x - F];
      }
    }
    e.l = k, e.p = Se, e.b = x, e.f = f, k && (f = 1, e.m = A, e.d = V, e.n = z);
  } while (!f);
  return x != t.length && i ? Br(t, 0, x) : t.subarray(0, x);
}, Oe = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8;
}, lt = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8, n[r + 2] |= t >> 16;
}, zt = function(n, e) {
  for (var t = [], r = 0; r < n.length; ++r)
    n[r] && t.push({ s: r, f: n[r] });
  var s = t.length, a = t.slice();
  if (!s)
    return { t: Fr, l: 0 };
  if (s == 1) {
    var i = new H(t[0].s + 1);
    return i[t[0].s] = 1, { t: i, l: 1 };
  }
  t.sort(function(Y, X) {
    return Y.f - X.f;
  }), t.push({ s: -1, f: 25001 });
  var o = t[0], l = t[1], u = 0, f = 1, p = 2;
  for (t[0] = { s: -1, f: o.f + l.f, l: o, r: l }; f != s - 1; )
    o = t[t[u].f < t[p].f ? u++ : p++], l = t[u != f && t[u].f < t[p].f ? u++ : p++], t[f++] = { s: -1, f: o.f + l.f, l: o, r: l };
  for (var x = a[0].s, r = 1; r < s; ++r)
    a[r].s > x && (x = a[r].s);
  var k = new de(x + 1), V = Yt(t[f - 1], k, 0);
  if (V > e) {
    var r = 0, A = 0, z = V - e, se = 1 << z;
    for (a.sort(function(X, P) {
      return k[P.s] - k[X.s] || X.f - P.f;
    }); r < s; ++r) {
      var M = a[r].s;
      if (k[M] > e)
        A += se - (1 << V - k[M]), k[M] = e;
      else
        break;
    }
    for (A >>= z; A > 0; ) {
      var j = a[r].s;
      k[j] < e ? A -= 1 << e - k[j]++ - 1 : ++r;
    }
    for (; r >= 0 && A; --r) {
      var Q = a[r].s;
      k[Q] == e && (--k[Q], ++A);
    }
    V = e;
  }
  return { t: new H(k), l: V };
}, Yt = function(n, e, t) {
  return n.s == -1 ? Math.max(Yt(n.l, e, t + 1), Yt(n.r, e, t + 1)) : e[n.s] = t;
}, Cr = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new de(++e), r = 0, s = n[0], a = 1, i = function(l) {
    t[r++] = l;
  }, o = 1; o <= e; ++o)
    if (n[o] == s && o != e)
      ++a;
    else {
      if (!s && a > 2) {
        for (; a > 138; a -= 138)
          i(32754);
        a > 2 && (i(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
      } else if (a > 3) {
        for (i(s), --a; a > 6; a -= 6)
          i(8304);
        a > 2 && (i(a - 3 << 5 | 8208), a = 0);
      }
      for (; a--; )
        i(s);
      a = 1, s = n[o];
    }
  return { c: t.subarray(0, r), n: e };
}, dt = function(n, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += n[r] * e[r];
  return t;
}, Ur = function(n, e, t) {
  var r = t.length, s = ar(e + 2);
  n[s] = r & 255, n[s + 1] = r >> 8, n[s + 2] = n[s] ^ 255, n[s + 3] = n[s + 1] ^ 255;
  for (var a = 0; a < r; ++a)
    n[s + a + 4] = t[a];
  return (s + 4 + r) * 8;
}, Nr = function(n, e, t, r, s, a, i, o, l, u, f) {
  Oe(e, f++, t), ++s[256];
  for (var p = zt(s, 15), x = p.t, k = p.l, V = zt(a, 15), A = V.t, z = V.l, se = Cr(x), M = se.c, j = se.n, Q = Cr(A), Y = Q.c, X = Q.n, P = new de(19), C = 0; C < M.length; ++C)
    ++P[M[C] & 31];
  for (var C = 0; C < Y.length; ++C)
    ++P[Y[C] & 31];
  for (var I = zt(P, 7), B = I.t, $ = I.l, G = 19; G > 4 && !B[Jt[G - 1]]; --G)
    ;
  var Ne = u + 5 << 3, ae = dt(s, $e) + dt(a, wt) + i, ee = dt(s, x) + dt(a, A) + i + 14 + 3 * G + dt(P, B) + 2 * P[16] + 3 * P[17] + 7 * P[18];
  if (l >= 0 && Ne <= ae && Ne <= ee)
    return Ur(e, f, n.subarray(l, l + u));
  var U, R, te, F;
  if (Oe(e, f, 1 + (ee < ae)), f += 2, ee < ae) {
    U = be(x, k, 0), R = x, te = be(A, z, 0), F = A;
    var it = be(B, $, 0);
    Oe(e, f, j - 257), Oe(e, f + 5, X - 1), Oe(e, f + 10, G - 4), f += 14;
    for (var C = 0; C < G; ++C)
      Oe(e, f + 3 * C, B[Jt[C]]);
    f += 3 * G;
    for (var fe = [M, Y], Se = 0; Se < 2; ++Se)
      for (var ie = fe[Se], C = 0; C < ie.length; ++C) {
        var oe = ie[C] & 31;
        Oe(e, f, it[oe]), f += B[oe], oe > 15 && (Oe(e, f, ie[C] >> 5 & 127), f += ie[C] >> 12);
      }
  } else
    U = Zn, R = $e, te = jn, F = wt;
  for (var C = 0; C < o; ++C) {
    var Z = r[C];
    if (Z > 255) {
      var oe = Z >> 18 & 31;
      lt(e, f, U[oe + 257]), f += R[oe + 257], oe > 7 && (Oe(e, f, Z >> 23 & 31), f += Mt[oe]);
      var ye = Z & 31;
      lt(e, f, te[ye]), f += F[ye], ye > 3 && (lt(e, f, Z >> 5 & 8191), f += Rt[ye]);
    } else
      lt(e, f, U[Z]), f += R[Z];
  }
  return lt(e, f, U[256]), f + R[256];
}, zn = /* @__PURE__ */ new sr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Fr = /* @__PURE__ */ new H(0), Pn = function(n, e, t, r, s, a) {
  var i = a.z || n.length, o = new H(r + i + 5 * (1 + Math.ceil(i / 7e3)) + s), l = o.subarray(r, o.length - s), u = a.l, f = (a.r || 0) & 7;
  if (e) {
    f && (l[0] = a.r >> 3);
    for (var p = zn[e - 1], x = p >> 13, k = p & 8191, V = (1 << t) - 1, A = a.p || new de(32768), z = a.h || new de(V + 1), se = Math.ceil(t / 3), M = 2 * se, j = function(Zt) {
      return (n[Zt] ^ n[Zt + 1] << se ^ n[Zt + 2] << M) & V;
    }, Q = new sr(25e3), Y = new de(288), X = new de(32), P = 0, C = 0, I = a.i || 0, B = 0, $ = a.w || 0, G = 0; I + 2 < i; ++I) {
      var Ne = j(I), ae = I & 32767, ee = z[Ne];
      if (A[ae] = ee, z[Ne] = ae, $ <= I) {
        var U = i - I;
        if ((P > 7e3 || B > 24576) && (U > 423 || !u)) {
          f = Nr(n, l, 0, Q, Y, X, C, B, G, I - G, f), B = P = C = 0, G = I;
          for (var R = 0; R < 286; ++R)
            Y[R] = 0;
          for (var R = 0; R < 30; ++R)
            X[R] = 0;
        }
        var te = 2, F = 0, it = k, fe = ae - ee & 32767;
        if (U > 2 && Ne == j(I - fe))
          for (var Se = Math.min(x, U) - 1, ie = Math.min(32767, I), oe = Math.min(258, U); fe <= ie && --it && ae != ee; ) {
            if (n[I + te] == n[I + te - fe]) {
              for (var Z = 0; Z < oe && n[I + Z] == n[I + Z - fe]; ++Z)
                ;
              if (Z > te) {
                if (te = Z, F = fe, Z > Se)
                  break;
                for (var ye = Math.min(fe, Z - 2), Ue = 0, R = 0; R < ye; ++R) {
                  var Fe = I - fe + R & 32767, kt = A[Fe], It = Fe - kt & 32767;
                  It > Ue && (Ue = It, ee = Fe);
                }
              }
            }
            ae = ee, ee = A[ae], fe += ae - ee & 32767;
          }
        if (F) {
          Q[B++] = 268435456 | qt[te] << 18 | Tr[F];
          var ot = qt[te] & 31, ct = Tr[F] & 31;
          C += Mt[ot] + Rt[ct], ++Y[257 + ot], ++X[ct], $ = I + te, ++P;
        } else
          Q[B++] = n[I], ++Y[n[I]];
      }
    }
    for (I = Math.max(I, $); I < i; ++I)
      Q[B++] = n[I], ++Y[n[I]];
    f = Nr(n, l, u, Q, Y, X, C, B, G, I - G, f), u || (a.r = f & 7 | l[f / 8 | 0] << 3, f -= 7, a.h = z, a.p = A, a.i = I, a.w = $);
  } else {
    for (var I = a.w || 0; I < i + u; I += 65535) {
      var We = I + 65535;
      We >= i && (l[f / 8 | 0] = u, We = i), f = Ur(l, f + 1, n.subarray(I, We));
    }
    a.i = i;
  }
  return Br(o, 0, r + ar(f) + s);
}, Bn = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Un = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, r = 0; r < e.length; ++r)
        t = Bn[t & 255 ^ e[r]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Fn = function(n, e, t, r, s) {
  if (!s && (s = { l: 1 }, e.dictionary)) {
    var a = e.dictionary.subarray(-32768), i = new H(a.length + n.length);
    i.set(a), i.set(n, a.length), n = i, s.w = a.length;
  }
  return Pn(n, e.level == null ? 6 : e.level, e.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, r, s);
}, Gt = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Wn = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Gt(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      n[r + 10] = t.charCodeAt(r);
  }
}, Jn = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && pe(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !n[t++])
    ;
  return t + (e & 2);
}, qn = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, Hn = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Yn(n, e) {
  e || (e = {});
  var t = Un(), r = n.length;
  t.p(n);
  var s = Fn(n, e, Hn(e), 8), a = s.length;
  return Wn(s, e), Gt(s, a - 8, t.d()), Gt(s, a - 4, r), s;
}
function Gn(n, e) {
  var t = Jn(n);
  return t + 8 > n.length && pe(6, "invalid gzip data"), Dn(n.subarray(t, -8), { i: 2 }, new H(qn(n)), e);
}
var Qn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Xn = 0;
try {
  Qn.decode(Fr, { stream: !0 }), Xn = 1;
} catch {
}
const es = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Qe(n, e, t) {
  const r = t[0];
  if (e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n.slice(-1) === r || e && e.slice(-1) === r)
    throw new Error("trailing zero");
  if (e) {
    let i = 0;
    for (; (n[i] || r) === e[i]; )
      i++;
    if (i > 0)
      return e.slice(0, i) + Qe(n.slice(i), e.slice(i), t);
  }
  const s = n ? t.indexOf(n[0]) : 0, a = e != null ? t.indexOf(e[0]) : t.length;
  if (a - s > 1) {
    const i = Math.round(0.5 * (s + a));
    return t[i];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[s] + Qe(n.slice(1), null, t);
}
function Wr(n) {
  if (n.length !== Jr(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function Jr(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function ht(n) {
  const e = Jr(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Er(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = ht(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Ar(n, e) {
  Wr(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let a = r.length - 1; s && a >= 0; a--) {
    const i = e.indexOf(r[a]) + 1;
    i === e.length ? r[a] = e[0] : (r[a] = e[i], s = !1);
  }
  if (s) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const a = String.fromCharCode(t.charCodeAt(0) + 1);
    return a > "a" ? r.push(e[0]) : r.pop(), a + r.join("");
  } else
    return t + r.join("");
}
function ts(n, e) {
  Wr(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let a = r.length - 1; s && a >= 0; a--) {
    const i = e.indexOf(r[a]) - 1;
    i === -1 ? r[a] = e.slice(-1) : (r[a] = e[i], s = !1);
  }
  if (s) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const a = String.fromCharCode(t.charCodeAt(0) - 1);
    return a < "Z" ? r.push(e.slice(-1)) : r.pop(), a + r.join("");
  } else
    return t + r.join("");
}
function Je(n, e, t = es) {
  if (n != null && Er(n, t), e != null && Er(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const l = ht(e), u = e.slice(l.length);
    if (l === "A" + t[0].repeat(26))
      return l + Qe("", u, t);
    if (l < e)
      return l;
    const f = ts(l, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const l = ht(n), u = n.slice(l.length), f = Ar(l, t);
    return f ?? l + Qe(u, null, t);
  }
  const r = ht(n), s = n.slice(r.length), a = ht(e), i = e.slice(a.length);
  if (r === a)
    return r + Qe(s, i, t);
  const o = Ar(r, t);
  if (o == null)
    throw new Error("cannot increment any more");
  return o < e ? o : r + Qe(s, null, t);
}
const rs = Kr(), Lr = Kr().min(1), ut = Mn().int().nonnegative().optional();
var we, re, xt, ze, Te, Xe, ne, Le, Me, xe, ke, Lt, et, Re, Pe, c, N, He, mt, _e, St, Qt, qr, Hr, he, De, Ye, gt, Ge, vt, Ot, Yr, Xt, Gr, er, tr, O, Qr, rr, Xr;
const pt = class pt {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t) {
    W(this, c);
    /**** private state ****/
    W(this, we);
    W(this, re);
    W(this, xt);
    W(this, ze);
    W(this, Te, null);
    W(this, Xe, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    W(this, ne, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId
    W(this, Le, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    W(this, Me, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId
    W(this, xe, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    W(this, ke, /* @__PURE__ */ new Map());
    W(this, Lt, an);
    // transaction nesting
    W(this, et, 0);
    // ChangeSet accumulator inside a transaction
    W(this, Re, {});
    // suppress index updates / change tracking when applying remote patches
    W(this, Pe, !1);
    var r;
    if (ge(this, we, e), ge(this, re, e.getMap("Entries")), ge(this, xt, (t == null ? void 0 : t.LiteralSizeLimit) ?? nn), ge(this, ze, (t == null ? void 0 : t.TrashTTLms) ?? null), d(this, c, qr).call(this), m(this, ze) != null) {
      const s = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(m(this, ze) / 4), 36e5);
      ge(this, Te, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        s
      )), typeof ((r = m(this, Te)) == null ? void 0 : r.unref) == "function" && m(this, Te).unref();
    }
  }
  static fromScratch(e) {
    const t = new cr(), r = t.getMap("Entries"), s = r.setContainer(ce, new E());
    s.set("Kind", "note"), s.set("outerNoteId", ""), s.set("OrderKey", ""), s.setContainer("Label", new J()), s.setContainer("Info", new E()), s.set("MIMEType", ""), s.set("ValueKind", "none");
    const a = r.setContainer(K, new E());
    a.set("Kind", "note"), a.set("outerNoteId", ce), a.set("OrderKey", "a0"), a.setContainer("Label", new J()).insert(0, "trash"), a.setContainer("Info", new E()), a.set("MIMEType", ""), a.set("ValueKind", "none");
    const o = r.setContainer(le, new E());
    return o.set("Kind", "note"), o.set("outerNoteId", ce), o.set("OrderKey", "a1"), o.setContainer("Label", new J()).insert(0, "lost-and-found"), o.setContainer("Info", new E()), o.set("MIMEType", ""), o.set("ValueKind", "none"), t.commit(), new pt(t, e);
  }
  static fromBinary(e, t) {
    const r = new cr();
    return r.import(Gn(e)), new pt(r, t);
  }
  static fromJSON(e, t) {
    let r;
    return typeof Buffer < "u" ? r = new Uint8Array(Buffer.from(String(e), "base64")) : r = Uint8Array.from(atob(String(e)), (s) => s.charCodeAt(0)), pt.fromBinary(r, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  get RootNote() {
    return d(this, c, _e).call(this, ce);
  }
  get TrashNote() {
    return d(this, c, _e).call(this, K);
  }
  get LostAndFoundNote() {
    return d(this, c, _e).call(this, le);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  EntryWithId(e) {
    const t = d(this, c, N).call(this, e);
    if (t != null && !(e !== ce && t.get("outerNoteId") === ""))
      return d(this, c, mt).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  newNoteAt(e, t, r) {
    const s = t ?? bt;
    if (!Lr.safeParse(s).success)
      throw new q("invalid-argument", "MIMEType must be a non-empty string");
    ut.parse(r), d(this, c, He).call(this, e.Id);
    const a = crypto.randomUUID(), i = d(this, c, Ge).call(this, e.Id, r), o = s === bt ? "" : s;
    return this.transact(() => {
      const l = m(this, re).setContainer(a, new E());
      l.set("Kind", "note"), l.set("outerNoteId", e.Id), l.set("OrderKey", i), l.setContainer("Label", new J()), l.setContainer("Info", new E()), l.set("MIMEType", o), l.set("ValueKind", "none"), d(this, c, he).call(this, e.Id, a), d(this, c, O).call(this, e.Id, "innerEntryList"), d(this, c, O).call(this, a, "outerNote");
    }), d(this, c, _e).call(this, a);
  }
  newLinkAt(e, t, r) {
    ut.parse(r), d(this, c, He).call(this, e.Id), d(this, c, He).call(this, t.Id);
    const s = crypto.randomUUID(), a = d(this, c, Ge).call(this, t.Id, r);
    return this.transact(() => {
      const i = m(this, re).setContainer(s, new E());
      i.set("Kind", "link"), i.set("outerNoteId", t.Id), i.set("OrderKey", a), i.setContainer("Label", new J()), i.setContainer("Info", new E()), i.set("TargetId", e.Id), d(this, c, he).call(this, t.Id, s), d(this, c, Ye).call(this, e.Id, s), d(this, c, O).call(this, t.Id, "innerEntryList"), d(this, c, O).call(this, s, "outerNote");
    }), d(this, c, St).call(this, s);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  deserializeNoteInto(e, t, r) {
    if (ut.parse(r), d(this, c, He).call(this, t.Id), e == null)
      throw new q("invalid-argument", "Serialisation must not be null");
    const s = e, a = Object.keys(s.Entries ?? {});
    if (a.length === 0)
      throw new q("invalid-argument", "empty serialisation");
    const i = a[0], o = crypto.randomUUID(), l = /* @__PURE__ */ new Map([[i, o]]);
    for (const f of a)
      l.has(f) || l.set(f, crypto.randomUUID());
    const u = d(this, c, Ge).call(this, t.Id, r);
    return this.transact(() => {
      var f, p;
      for (const x of a) {
        const k = s.Entries[x], V = l.get(x), A = x === i, z = A ? t.Id : ((f = k.outerPlacement) == null ? void 0 : f.outerNoteId) != null ? l.get(k.outerPlacement.outerNoteId) ?? t.Id : void 0, se = A ? u : ((p = k.outerPlacement) == null ? void 0 : p.OrderKey) ?? "", M = m(this, re).setContainer(V, new E());
        M.set("Kind", k.Kind);
        const j = M.setContainer("Label", new J());
        k.Label && j.insert(0, k.Label), M.setContainer("Info", new E()), M.set("outerNoteId", z ?? ""), M.set("OrderKey", se), k.Kind === "note" ? (M.set("MIMEType", k.MIMEType ?? ""), M.set("ValueKind", "none")) : M.set(
          "TargetId",
          k.TargetId != null ? l.get(k.TargetId) ?? k.TargetId : ""
        ), z && d(this, c, he).call(this, z, V), k.Kind === "link" && k.TargetId != null && d(this, c, Ye).call(this, l.get(k.TargetId) ?? k.TargetId, V);
      }
      d(this, c, O).call(this, t.Id, "innerEntryList");
    }), d(this, c, _e).call(this, o);
  }
  deserializeLinkInto(e, t, r) {
    if (ut.parse(r), d(this, c, He).call(this, t.Id), e == null)
      throw new q("invalid-argument", "Serialisation must not be null");
    const s = e, a = Object.keys(s.Entries ?? {});
    if (a.length === 0)
      throw new q("invalid-argument", "empty serialisation");
    const i = s.Entries[a[0]];
    if (i.Kind !== "link")
      throw new q("invalid-argument", "serialisation is not a link");
    const o = crypto.randomUUID(), l = d(this, c, Ge).call(this, t.Id, r);
    return this.transact(() => {
      const u = m(this, re).setContainer(o, new E());
      u.set("Kind", "link"), u.set("outerNoteId", t.Id), u.set("OrderKey", l);
      const f = u.setContainer("Label", new J());
      i.Label && f.insert(0, i.Label), u.setContainer("Info", new E()), u.set("TargetId", i.TargetId ?? ""), d(this, c, he).call(this, t.Id, o), i.TargetId && d(this, c, Ye).call(this, i.TargetId, o), d(this, c, O).call(this, t.Id, "innerEntryList");
    }), d(this, c, St).call(this, o);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  EntryMayBeMovedTo(e, t, r) {
    return e.mayBeMovedTo(t, r);
  }
  moveEntryTo(e, t, r) {
    if (ut.parse(r), !this._mayMoveEntryTo(e.Id, t.Id, r))
      throw new q(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const s = this._outerNoteIdOf(e.Id), a = d(this, c, Ge).call(this, t.Id, r);
    this.transact(() => {
      const i = d(this, c, N).call(this, e.Id);
      if (i.set("outerNoteId", t.Id), i.set("OrderKey", a), s === K && t.Id !== K) {
        const o = i.get("Info");
        o instanceof E && o.get("_trashedAt") != null && (o.delete("_trashedAt"), d(this, c, O).call(this, e.Id, "Info._trashedAt"));
      }
      s != null && (d(this, c, De).call(this, s, e.Id), d(this, c, O).call(this, s, "innerEntryList")), d(this, c, he).call(this, t.Id, e.Id), d(this, c, O).call(this, t.Id, "innerEntryList"), d(this, c, O).call(this, e.Id, "outerNote");
    });
  }
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new q("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), r = Je(d(this, c, vt).call(this, K), null);
    this.transact(() => {
      const s = d(this, c, N).call(this, e.Id);
      s.set("outerNoteId", K), s.set("OrderKey", r);
      let a = s.get("Info");
      a instanceof E || (a = s.setContainer("Info", new E())), a.set("_trashedAt", Date.now()), t != null && (d(this, c, De).call(this, t, e.Id), d(this, c, O).call(this, t, "innerEntryList")), d(this, c, he).call(this, K, e.Id), d(this, c, O).call(this, K, "innerEntryList"), d(this, c, O).call(this, e.Id, "outerNote"), d(this, c, O).call(this, e.Id, "Info._trashedAt");
    });
  }
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== K)
      throw new q(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (d(this, c, Yr).call(this, e.Id))
      throw new q(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, c, tr).call(this, e.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  purgeExpiredTrashEntries(e) {
    const t = e ?? m(this, ze);
    if (t == null)
      return 0;
    const r = Date.now(), s = Array.from(m(this, ne).get(K) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const i of s) {
      const o = d(this, c, N).call(this, i);
      if (o == null || o.get("outerNoteId") !== K)
        continue;
      const l = o.get("Info"), u = l instanceof E ? l.get("_trashedAt") : void 0;
      if (typeof u == "number" && !(r - u < t))
        try {
          this.purgeEntry(d(this, c, mt).call(this, i)), a++;
        } catch {
        }
    }
    return a;
  }
  dispose() {
    m(this, Te) != null && (clearInterval(m(this, Te)), ge(this, Te, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  transact(e) {
    jt(this, et)._++;
    try {
      e();
    } finally {
      if (jt(this, et)._--, m(this, et) === 0) {
        m(this, Pe) || m(this, we).commit();
        const t = { ...m(this, Re) };
        ge(this, Re, {});
        const r = m(this, Pe) ? "external" : "internal";
        d(this, c, Qr).call(this, r, t);
      }
    }
  }
  onChangeInvoke(e) {
    return m(this, Xe).add(e), () => {
      m(this, Xe).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  applyRemotePatch(e) {
    ge(this, Pe, !0);
    try {
      m(this, we).import(e), this.transact(() => {
        d(this, c, Hr).call(this);
      });
    } finally {
      ge(this, Pe, !1);
    }
    this.recoverOrphans();
  }
  get currentCursor() {
    return m(this, we).version().encode();
  }
  exportPatch(e) {
    return e == null || e.byteLength === 0 ? m(this, we).export({ mode: "snapshot" }) : m(this, we).exportFrom(rn.decode(e));
  }
  recoverOrphans() {
    const e = new Set(Object.keys(m(this, re).toJSON()));
    this.transact(() => {
      const t = m(this, re).toJSON();
      for (const [r, s] of Object.entries(t)) {
        if (r === ce)
          continue;
        const a = s.outerNoteId;
        if (a && !e.has(a)) {
          const i = Je(d(this, c, vt).call(this, le), null), o = d(this, c, N).call(this, r);
          o.set("outerNoteId", le), o.set("OrderKey", i), d(this, c, he).call(this, le, r), d(this, c, O).call(this, r, "outerNote"), d(this, c, O).call(this, le, "innerEntryList");
        }
        if (s.Kind === "link") {
          const i = s.TargetId;
          if (i && !e.has(i)) {
            const o = Je(d(this, c, vt).call(this, le), null), l = m(this, re).setContainer(i, new E());
            l.set("Kind", "note"), l.set("outerNoteId", le), l.set("OrderKey", o), l.setContainer("Label", new J()), l.setContainer("Info", new E()), l.set("MIMEType", ""), l.set("ValueKind", "none"), d(this, c, he).call(this, le, i), e.add(i), d(this, c, O).call(this, le, "innerEntryList");
          }
        }
      }
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  asBinary() {
    return Yn(m(this, we).export({ mode: "snapshot" }));
  }
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
  _KindOf(e) {
    const t = d(this, c, N).call(this, e);
    if (t == null)
      throw new q("not-found", `entry '${e}' not found`);
    return t.get("Kind");
  }
  _LabelOf(e) {
    const t = d(this, c, N).call(this, e);
    if (t == null)
      return "";
    const r = t.get("Label");
    return r instanceof J ? r.toString() : String(r ?? "");
  }
  _setLabelOf(e, t) {
    rs.parse(t), this.transact(() => {
      const r = d(this, c, N).call(this, e);
      if (r == null)
        return;
      let s = r.get("Label");
      if (s instanceof J) {
        const a = s.toString().length;
        a > 0 && s.delete(0, a), t.length > 0 && s.insert(0, t);
      } else
        s = r.setContainer("Label", new J()), t.length > 0 && s.insert(0, t);
      d(this, c, O).call(this, e, "Label");
    });
  }
  _TypeOf(e) {
    const t = d(this, c, N).call(this, e), r = (t == null ? void 0 : t.get("MIMEType")) ?? "";
    return r === "" ? bt : r;
  }
  _setTypeOf(e, t) {
    Lr.parse(t);
    const r = t === bt ? "" : t;
    this.transact(() => {
      var s;
      (s = d(this, c, N).call(this, e)) == null || s.set("MIMEType", r), d(this, c, O).call(this, e, "Type");
    });
  }
  _ValueKindOf(e) {
    const t = d(this, c, N).call(this, e);
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
        const r = d(this, c, N).call(this, e), s = r == null ? void 0 : r.get("literalValue");
        return s instanceof J ? s.toString() : String(s ?? "");
      }
      case t === "binary": {
        const r = d(this, c, N).call(this, e), s = r == null ? void 0 : r.get("binaryValue");
        return s instanceof Uint8Array ? s : void 0;
      }
      default:
        throw new q(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  _writeValueOf(e, t) {
    this.transact(() => {
      const r = d(this, c, N).call(this, e);
      if (r != null) {
        switch (!0) {
          case t == null: {
            r.set("ValueKind", "none");
            break;
          }
          case (typeof t == "string" && t.length <= m(this, xt)): {
            r.set("ValueKind", "literal");
            let s = r.get("literalValue");
            if (s instanceof J) {
              const a = s.toString().length;
              a > 0 && s.delete(0, a), t.length > 0 && s.insert(0, t);
            } else
              s = r.setContainer("literalValue", new J()), t.length > 0 && s.insert(0, t);
            break;
          }
          case typeof t == "string": {
            const a = new TextEncoder().encode(t), i = `sha256-size-${a.byteLength}`;
            r.set("ValueKind", "literal-reference"), r.set("ValueRef", JSON.stringify({ Hash: i, Size: a.byteLength }));
            break;
          }
          case t.byteLength <= sn: {
            r.set("ValueKind", "binary"), r.set("binaryValue", t);
            break;
          }
          default: {
            const s = t, a = `sha256-size-${s.byteLength}`;
            r.set("ValueKind", "binary-reference"), r.set("ValueRef", JSON.stringify({ Hash: a, Size: s.byteLength }));
            break;
          }
        }
        d(this, c, O).call(this, e, "Value");
      }
    });
  }
  _spliceValueOf(e, t, r, s) {
    if (this._ValueKindOf(e) !== "literal")
      throw new q(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const a = d(this, c, N).call(this, e), i = a == null ? void 0 : a.get("literalValue");
      if (i instanceof J) {
        const o = r - t;
        o > 0 && i.delete(t, o), s.length > 0 && i.insert(t, s);
      }
      d(this, c, O).call(this, e, "Value");
    });
  }
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(r, s) {
        var o;
        if (typeof s != "string")
          return;
        const a = d(o = t, c, N).call(o, e), i = a == null ? void 0 : a.get("Info");
        return i instanceof E ? i.get(s) : void 0;
      },
      set(r, s, a) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var l, u;
          const i = d(l = t, c, N).call(l, e);
          if (i == null)
            return;
          let o = i.get("Info");
          o instanceof E || (o = i.setContainer("Info", new E())), o.set(s, a), d(u = t, c, O).call(u, e, `Info.${s}`);
        }), !0);
      },
      deleteProperty(r, s) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var o, l;
          const a = d(o = t, c, N).call(o, e), i = a == null ? void 0 : a.get("Info");
          i instanceof E && i.delete(s), d(l = t, c, O).call(l, e, `Info.${s}`);
        }), !0);
      },
      ownKeys() {
        var a;
        const r = d(a = t, c, N).call(a, e), s = r == null ? void 0 : r.get("Info");
        return s instanceof E ? Object.keys(s.toJSON()) : [];
      },
      getOwnPropertyDescriptor(r, s) {
        var l;
        if (typeof s != "string")
          return;
        const a = d(l = t, c, N).call(l, e), i = a == null ? void 0 : a.get("Info");
        if (!(i instanceof E))
          return;
        const o = i.get(s);
        return o !== void 0 ? { configurable: !0, enumerable: !0, value: o } : void 0;
      }
    });
  }
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? d(this, c, _e).call(this, t) : void 0;
  }
  _outerNoteIdOf(e) {
    const t = d(this, c, N).call(this, e), r = t == null ? void 0 : t.get("outerNoteId");
    return r != null && r !== "" ? r : void 0;
  }
  _outerNotesOf(e) {
    const t = [];
    let r = this._outerNoteIdOf(e);
    for (; r != null && (t.push(d(this, c, _e).call(this, r)), r !== ce); )
      r = this._outerNoteIdOf(r);
    return t;
  }
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  _innerEntriesOf(e) {
    const t = this, r = d(this, c, Ot).call(this, e);
    return new Proxy([], {
      get(s, a) {
        var i;
        if (a === "length")
          return r.length;
        if (a === Symbol.iterator)
          return function* () {
            var o;
            for (let l = 0; l < r.length; l++)
              yield d(o = t, c, mt).call(o, r[l].Id);
          };
        if (typeof a == "string" && !isNaN(Number(a))) {
          const o = Number(a);
          return o >= 0 && o < r.length ? d(i = t, c, mt).call(i, r[o].Id) : void 0;
        }
        return s[a];
      }
    });
  }
  _mayMoveEntryTo(e, t, r) {
    return e === ce || e === t ? !1 : e === K || e === le ? t === ce : !d(this, c, Xr).call(this, t, e);
  }
  _mayDeleteEntry(e) {
    return e !== ce && e !== K && e !== le;
  }
  _TargetOf(e) {
    const t = d(this, c, N).call(this, e), r = t == null ? void 0 : t.get("TargetId");
    if (!r)
      throw new q("not-found", `link '${e}' has no target`);
    return d(this, c, _e).call(this, r);
  }
  _EntryAsJSON(e) {
    if (d(this, c, N).call(this, e) == null)
      throw new q("not-found", `entry '${e}' not found`);
    const r = {};
    return d(this, c, rr).call(this, e, r), { Entries: r };
  }
};
we = new WeakMap(), re = new WeakMap(), xt = new WeakMap(), ze = new WeakMap(), Te = new WeakMap(), Xe = new WeakMap(), ne = new WeakMap(), Le = new WeakMap(), Me = new WeakMap(), xe = new WeakMap(), ke = new WeakMap(), Lt = new WeakMap(), et = new WeakMap(), Re = new WeakMap(), Pe = new WeakMap(), c = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry ID ****/
N = function(e) {
  const t = m(this, re).get(e);
  return t instanceof E ? t : void 0;
}, /**** #requireNoteExists ****/
He = function(e) {
  const t = d(this, c, N).call(this, e);
  if (t == null || t.get("Kind") !== "note")
    throw new q("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink ****/
mt = function(e) {
  const t = d(this, c, N).call(this, e);
  if (t == null)
    throw new q("invalid-argument", `entry '${e}' not found`);
  return t.get("Kind") === "note" ? d(this, c, _e).call(this, e) : d(this, c, St).call(this, e);
}, _e = function(e) {
  const t = m(this, ke).get(e);
  if (t instanceof lr)
    return t;
  const r = new lr(this, e);
  return d(this, c, Qt).call(this, e, r), r;
}, St = function(e) {
  const t = m(this, ke).get(e);
  if (t instanceof dr)
    return t;
  const r = new dr(this, e);
  return d(this, c, Qt).call(this, e, r), r;
}, Qt = function(e, t) {
  if (m(this, ke).size >= m(this, Lt)) {
    const r = m(this, ke).keys().next().value;
    r != null && m(this, ke).delete(r);
  }
  m(this, ke).set(e, t);
}, /**** #rebuildIndices ****/
qr = function() {
  m(this, ne).clear(), m(this, Le).clear(), m(this, Me).clear(), m(this, xe).clear();
  const e = m(this, re).toJSON();
  for (const [t, r] of Object.entries(e)) {
    const s = r.outerNoteId;
    if (s && d(this, c, he).call(this, s, t), r.Kind === "link") {
      const a = r.TargetId;
      a && d(this, c, Ye).call(this, a, t);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Hr = function() {
  const e = m(this, re).toJSON(), t = /* @__PURE__ */ new Set();
  for (const [a, i] of Object.entries(e)) {
    t.add(a);
    const o = i.outerNoteId || void 0, l = m(this, Le).get(a);
    if (o !== l && (l != null && (d(this, c, De).call(this, l, a), d(this, c, O).call(this, l, "innerEntryList")), o != null && (d(this, c, he).call(this, o, a), d(this, c, O).call(this, o, "innerEntryList")), d(this, c, O).call(this, a, "outerNote")), i.Kind === "link") {
      const u = i.TargetId, f = m(this, xe).get(a);
      u !== f && (f != null && d(this, c, gt).call(this, f, a), u != null && d(this, c, Ye).call(this, u, a));
    } else m(this, xe).has(a) && d(this, c, gt).call(this, m(this, xe).get(a), a);
    d(this, c, O).call(this, a, "Label");
  }
  const r = Array.from(m(this, Le).entries()).filter(([a]) => !t.has(a));
  for (const [a, i] of r)
    d(this, c, De).call(this, i, a), d(this, c, O).call(this, i, "innerEntryList");
  const s = Array.from(m(this, xe).entries()).filter(([a]) => !t.has(a));
  for (const [a, i] of s)
    d(this, c, gt).call(this, i, a);
}, he = function(e, t) {
  let r = m(this, ne).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), m(this, ne).set(e, r)), r.add(t), m(this, Le).set(t, e);
}, De = function(e, t) {
  var r;
  (r = m(this, ne).get(e)) == null || r.delete(t), m(this, Le).delete(t);
}, Ye = function(e, t) {
  let r = m(this, Me).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), m(this, Me).set(e, r)), r.add(t), m(this, xe).set(t, e);
}, gt = function(e, t) {
  var r;
  (r = m(this, Me).get(e)) == null || r.delete(t), m(this, xe).delete(t);
}, /**** #orderKeyAt ****/
Ge = function(e, t) {
  const r = d(this, c, Ot).call(this, e);
  if (r.length === 0 || t == null) {
    const o = r.length > 0 ? r[r.length - 1].OrderKey : null;
    return Je(o, null);
  }
  const s = Math.max(0, Math.min(t, r.length)), a = s > 0 ? r[s - 1].OrderKey : null, i = s < r.length ? r[s].OrderKey : null;
  return Je(a, i);
}, vt = function(e) {
  const t = d(this, c, Ot).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, Ot = function(e) {
  const t = m(this, ne).get(e) ?? /* @__PURE__ */ new Set(), r = [];
  for (const s of t) {
    const a = d(this, c, N).call(this, s);
    (a == null ? void 0 : a.get("outerNoteId")) === e && r.push({ Id: s, OrderKey: a.get("OrderKey") ?? "" });
  }
  return r.sort((s, a) => s.OrderKey < a.OrderKey ? -1 : s.OrderKey > a.OrderKey ? 1 : s.Id < a.Id ? -1 : s.Id > a.Id ? 1 : 0), r;
}, /**** #isProtected ****/
Yr = function(e) {
  const t = d(this, c, er).call(this), r = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const a of m(this, ne).get(K) ?? /* @__PURE__ */ new Set())
      r.has(a) || d(this, c, Xt).call(this, a, t, r) && (r.add(a), s = !0);
  }
  return r.has(e);
}, Xt = function(e, t, r) {
  const s = [e], a = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const i = s.pop();
    if (a.has(i))
      continue;
    a.add(i);
    const o = m(this, Me).get(i) ?? /* @__PURE__ */ new Set();
    for (const l of o) {
      if (t.has(l))
        return !0;
      const u = d(this, c, Gr).call(this, l);
      if (u != null && r.has(u))
        return !0;
    }
    for (const l of m(this, ne).get(i) ?? /* @__PURE__ */ new Set())
      a.has(l) || s.push(l);
  }
  return !1;
}, Gr = function(e) {
  let t = e;
  for (; t != null; ) {
    const r = this._outerNoteIdOf(t);
    if (r === K)
      return t;
    if (r === ce || r == null)
      return null;
    t = r;
  }
  return null;
}, er = function() {
  const e = /* @__PURE__ */ new Set(), t = [ce];
  for (; t.length > 0; ) {
    const r = t.pop();
    if (!e.has(r)) {
      e.add(r);
      for (const s of m(this, ne).get(r) ?? /* @__PURE__ */ new Set())
        e.has(s) || t.push(s);
    }
  }
  return e;
}, /**** #purgeSubtree ****/
tr = function(e) {
  const t = d(this, c, N).call(this, e);
  if (t == null)
    return;
  const r = t.get("Kind"), s = t.get("outerNoteId"), a = d(this, c, er).call(this), i = /* @__PURE__ */ new Set(), o = Array.from(m(this, ne).get(e) ?? /* @__PURE__ */ new Set());
  for (const l of o)
    if (d(this, c, Xt).call(this, l, a, i)) {
      const u = d(this, c, N).call(this, l), f = Je(d(this, c, vt).call(this, K), null);
      u.set("outerNoteId", K), u.set("OrderKey", f), d(this, c, De).call(this, e, l), d(this, c, he).call(this, K, l), d(this, c, O).call(this, K, "innerEntryList"), d(this, c, O).call(this, l, "outerNote");
    } else
      d(this, c, tr).call(this, l);
  if (t.set("outerNoteId", ""), t.set("OrderKey", ""), s && (d(this, c, De).call(this, s, e), d(this, c, O).call(this, s, "innerEntryList")), r === "link") {
    const l = t.get("TargetId");
    l && d(this, c, gt).call(this, l, e);
  }
  m(this, ke).delete(e);
}, /**** #recordChange ****/
O = function(e, t) {
  m(this, Re)[e] == null && (m(this, Re)[e] = /* @__PURE__ */ new Set()), m(this, Re)[e].add(t);
}, /**** #notifyHandlers ****/
Qr = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const r of m(this, Xe))
      try {
        r(e, t);
      } catch {
      }
}, rr = function(e, t) {
  const r = d(this, c, N).call(this, e);
  if (r == null)
    return;
  const s = r.get("outerNoteId"), a = r.get("OrderKey"), i = r.get("Label"), o = r.get("Info"), l = o instanceof E ? o.toJSON() : {}, u = {
    Kind: r.get("Kind"),
    Label: i instanceof J ? i.toString() : String(i ?? ""),
    Info: l
  };
  if (s && a && (u.outerPlacement = { outerNoteId: s, OrderKey: a }), r.get("Kind") === "note") {
    u.MIMEType = r.get("MIMEType") ?? "", u.ValueKind = r.get("ValueKind") ?? "none";
    const f = r.get("literalValue");
    f instanceof J && (u.literalValue = f.toString());
    const p = r.get("binaryValue");
    p instanceof Uint8Array && (u.binaryValue = p);
    const x = r.get("ValueRef");
    if (x)
      try {
        u.ValueRef = JSON.parse(x);
      } catch {
      }
  } else
    u.TargetId = r.get("TargetId");
  t[e] = u;
  for (const f of m(this, ne).get(e) ?? /* @__PURE__ */ new Set())
    d(this, c, rr).call(this, f, t);
}, Xr = function(e, t) {
  let r = e;
  for (; r != null; ) {
    if (r === t)
      return !0;
    r = this._outerNoteIdOf(r);
  }
  return !1;
};
let Mr = pt;
export {
  Rr as SNS_Entry,
  q as SNS_Error,
  dr as SNS_Link,
  lr as SNS_Note,
  Mr as SNS_NoteStore
};
