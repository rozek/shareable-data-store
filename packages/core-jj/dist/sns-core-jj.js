var or = (n) => {
  throw TypeError(n);
};
var Zt = (n, e, t) => e.has(n) || or("Cannot " + t);
var f = (n, e, t) => (Zt(n, e, "read from private field"), t ? t.call(n) : e.get(n)), W = (n, e, t) => e.has(n) ? or("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), pe = (n, e, t, r) => (Zt(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), u = (n, e, t) => (Zt(n, e, "access private method"), t);
var Vt = (n, e, t, r) => ({
  set _(s) {
    pe(n, e, s, t);
  },
  get _() {
    return f(n, e, r);
  }
});
import { Model as Xr } from "json-joy/lib/json-crdt/index.js";
import { s as g } from "json-joy/lib/json-crdt-patch/schema.js";
import { Patch as en } from "json-joy/lib/json-crdt-patch/index.js";
import { SNS_Error as q } from "@rozek/sns-core";
import { SNS_Error as fs } from "@rozek/sns-core";
const Ie = "00000000-0000-4000-8000-000000000000", $ = "00000000-0000-4000-8000-000000000001", ce = "00000000-0000-4000-8000-000000000002", bt = "text/plain", tn = 131072, rn = 2048, nn = 5e3;
class jr {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  get isRootNote() {
    return this.Id === Ie;
  }
  get isTrashNote() {
    return this.Id === $;
  }
  get isLostAndFoundNote() {
    return this.Id === ce;
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
class lr extends jr {
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
class cr extends jr {
  constructor(e, t) {
    super(e, t);
  }
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
var O;
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
    const i = {};
    for (const a of s)
      i[a] = a;
    return i;
  }, n.getValidEnumValues = (s) => {
    const i = n.objectKeys(s).filter((o) => typeof s[s[o]] != "number"), a = {};
    for (const o of i)
      a[o] = s[o];
    return n.objectValues(a);
  }, n.objectValues = (s) => n.objectKeys(s).map(function(i) {
    return s[i];
  }), n.objectKeys = typeof Object.keys == "function" ? (s) => Object.keys(s) : (s) => {
    const i = [];
    for (const a in s)
      Object.prototype.hasOwnProperty.call(s, a) && i.push(a);
    return i;
  }, n.find = (s, i) => {
    for (const a of s)
      if (i(a))
        return a;
  }, n.isInteger = typeof Number.isInteger == "function" ? (s) => Number.isInteger(s) : (s) => typeof s == "number" && Number.isFinite(s) && Math.floor(s) === s;
  function r(s, i = " | ") {
    return s.map((a) => typeof a == "string" ? `'${a}'` : a).join(i);
  }
  n.joinValues = r, n.jsonStringifyReplacer = (s, i) => typeof i == "bigint" ? i.toString() : i;
})(O || (O = {}));
var ur;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(ur || (ur = {}));
const y = O.arrayToEnum([
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
]), Ne = (n) => {
  switch (typeof n) {
    case "undefined":
      return y.undefined;
    case "string":
      return y.string;
    case "number":
      return Number.isNaN(n) ? y.nan : y.number;
    case "boolean":
      return y.boolean;
    case "function":
      return y.function;
    case "bigint":
      return y.bigint;
    case "symbol":
      return y.symbol;
    case "object":
      return Array.isArray(n) ? y.array : n === null ? y.null : n.then && typeof n.then == "function" && n.catch && typeof n.catch == "function" ? y.promise : typeof Map < "u" && n instanceof Map ? y.map : typeof Set < "u" && n instanceof Set ? y.set : typeof Date < "u" && n instanceof Date ? y.date : y.object;
    default:
      return y.unknown;
  }
}, m = O.arrayToEnum([
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
class Se extends Error {
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
    const t = e || function(i) {
      return i.message;
    }, r = { _errors: [] }, s = (i) => {
      for (const a of i.issues)
        if (a.code === "invalid_union")
          a.unionErrors.map(s);
        else if (a.code === "invalid_return_type")
          s(a.returnTypeError);
        else if (a.code === "invalid_arguments")
          s(a.argumentsError);
        else if (a.path.length === 0)
          r._errors.push(t(a));
        else {
          let o = r, c = 0;
          for (; c < a.path.length; ) {
            const h = a.path[c];
            c === a.path.length - 1 ? (o[h] = o[h] || { _errors: [] }, o[h]._errors.push(t(a))) : o[h] = o[h] || { _errors: [] }, o = o[h], c++;
          }
        }
    };
    return s(this), r;
  }
  static assert(e) {
    if (!(e instanceof Se))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, O.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const s of this.issues)
      if (s.path.length > 0) {
        const i = s.path[0];
        t[i] = t[i] || [], t[i].push(e(s));
      } else
        r.push(e(s));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Se.create = (n) => new Se(n);
const zt = (n, e) => {
  let t;
  switch (n.code) {
    case m.invalid_type:
      n.received === y.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case m.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, O.jsonStringifyReplacer)}`;
      break;
    case m.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${O.joinValues(n.keys, ", ")}`;
      break;
    case m.invalid_union:
      t = "Invalid input";
      break;
    case m.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${O.joinValues(n.options)}`;
      break;
    case m.invalid_enum_value:
      t = `Invalid enum value. Expected ${O.joinValues(n.options)}, received '${n.received}'`;
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
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : O.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
      break;
    case m.too_small:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "more than"} ${n.minimum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "over"} ${n.minimum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "bigint" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(n.minimum))}` : t = "Invalid input";
      break;
    case m.too_big:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "less than"} ${n.maximum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "under"} ${n.maximum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "bigint" ? t = `BigInt must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly" : n.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(n.maximum))}` : t = "Invalid input";
      break;
    case m.custom:
      t = "Invalid input";
      break;
    case m.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case m.not_multiple_of:
      t = `Number must be a multiple of ${n.multipleOf}`;
      break;
    case m.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, O.assertNever(n);
  }
  return { message: t };
};
let sn = zt;
function an() {
  return sn;
}
const on = (n) => {
  const { data: e, path: t, errorMaps: r, issueData: s } = n, i = [...t, ...s.path || []], a = {
    ...s,
    path: i
  };
  if (s.message !== void 0)
    return {
      ...s,
      path: i,
      message: s.message
    };
  let o = "";
  const c = r.filter((h) => !!h).slice().reverse();
  for (const h of c)
    o = h(a, { data: e, defaultError: o }).message;
  return {
    ...s,
    path: i,
    message: o
  };
};
function p(n, e) {
  const t = an(), r = on({
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
      t === zt ? void 0 : zt
      // then global default map
    ].filter((s) => !!s)
  });
  n.common.issues.push(r);
}
class oe {
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
        return w;
      s.status === "dirty" && e.dirty(), r.push(s.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const s of t) {
      const i = await s.key, a = await s.value;
      r.push({
        key: i,
        value: a
      });
    }
    return oe.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const s of t) {
      const { key: i, value: a } = s;
      if (i.status === "aborted" || a.status === "aborted")
        return w;
      i.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof a.value < "u" || s.alwaysSet) && (r[i.value] = a.value);
    }
    return { status: e.value, value: r };
  }
}
const w = Object.freeze({
  status: "aborted"
}), dt = (n) => ({ status: "dirty", value: n }), de = (n) => ({ status: "valid", value: n }), dr = (n) => n.status === "aborted", hr = (n) => n.status === "dirty", et = (n) => n.status === "valid", St = (n) => typeof Promise < "u" && n instanceof Promise;
var _;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(_ || (_ = {}));
class Ze {
  constructor(e, t, r, s) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const fr = (n, e) => {
  if (et(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Se(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function E(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: s } = n;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: s } : { errorMap: (a, o) => {
    const { message: c } = n;
    return a.code === "invalid_enum_value" ? { message: c ?? o.defaultError } : typeof o.data > "u" ? { message: c ?? r ?? o.defaultError } : a.code !== "invalid_type" ? { message: o.defaultError } : { message: c ?? t ?? o.defaultError };
  }, description: s };
}
class S {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Ne(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Ne(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new oe(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Ne(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (St(t))
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
      parsedType: Ne(e)
    }, s = this._parseSync({ data: e, path: r.path, parent: r });
    return fr(r, s);
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
      parsedType: Ne(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return et(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (s = (r = i == null ? void 0 : i.message) == null ? void 0 : r.toLowerCase()) != null && s.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => et(i) ? {
      value: i.value
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
      parsedType: Ne(e)
    }, s = this._parse({ data: e, path: r.path, parent: r }), i = await (St(s) ? s : Promise.resolve(s));
    return fr(r, i);
  }
  refine(e, t) {
    const r = (s) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(s) : t;
    return this._refinement((s, i) => {
      const a = e(s), o = () => i.addIssue({
        code: m.custom,
        ...r(s)
      });
      return typeof Promise < "u" && a instanceof Promise ? a.then((c) => c ? !0 : (o(), !1)) : a ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, s) => e(r) ? !0 : (s.addIssue(typeof t == "function" ? t(r, s) : t), !1));
  }
  _refinement(e) {
    return new nt({
      schema: this,
      typeName: x.ZodEffects,
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
    return Le.create(this, this._def);
  }
  nullable() {
    return st.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return we.create(this);
  }
  promise() {
    return Ct.create(this, this._def);
  }
  or(e) {
    return Ot.create([this, e], this._def);
  }
  and(e) {
    return Nt.create(this, e, this._def);
  }
  transform(e) {
    return new nt({
      ...E(this._def),
      schema: this,
      typeName: x.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Kt({
      ...E(this._def),
      innerType: this,
      defaultValue: t,
      typeName: x.ZodDefault
    });
  }
  brand() {
    return new Cn({
      typeName: x.ZodBranded,
      type: this,
      ...E(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ut({
      ...E(this._def),
      innerType: this,
      catchValue: t,
      typeName: x.ZodCatch
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
    return sr.create(this, e);
  }
  readonly() {
    return Ft.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const ln = /^c[^\s-]{8,}$/i, cn = /^[0-9a-z]+$/, un = /^[0-9A-HJKMNP-TV-Z]{26}$/i, dn = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, hn = /^[a-z0-9_-]{21}$/i, fn = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, mn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, vn = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, pn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Mt;
const gn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, yn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, _n = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, wn = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, xn = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, kn = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Lr = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", bn = new RegExp(`^${Lr}$`);
function Zr(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function In(n) {
  return new RegExp(`^${Zr(n)}$`);
}
function En(n) {
  let e = `${Lr}T${Zr(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Sn(n, e) {
  return !!((e === "v4" || !e) && gn.test(n) || (e === "v6" || !e) && _n.test(n));
}
function Tn(n, e) {
  if (!fn.test(n))
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
function On(n, e) {
  return !!((e === "v4" || !e) && yn.test(n) || (e === "v6" || !e) && wn.test(n));
}
class je extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== y.string) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: y.string,
        received: i.parsedType
      }), w;
    }
    const r = new oe();
    let s;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (s = this._getOrReturnCtx(e, s), p(s, {
          code: m.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (s = this._getOrReturnCtx(e, s), p(s, {
          code: m.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "length") {
        const a = e.data.length > i.value, o = e.data.length < i.value;
        (a || o) && (s = this._getOrReturnCtx(e, s), a ? p(s, {
          code: m.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : o && p(s, {
          code: m.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), r.dirty());
      } else if (i.kind === "email")
        vn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "email",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "emoji")
        Mt || (Mt = new RegExp(pn, "u")), Mt.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "emoji",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "uuid")
        dn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "uuid",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "nanoid")
        hn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "nanoid",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid")
        ln.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "cuid",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid2")
        cn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "cuid2",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "ulid")
        un.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
          validation: "ulid",
          code: m.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          s = this._getOrReturnCtx(e, s), p(s, {
            validation: "url",
            code: m.invalid_string,
            message: i.message
          }), r.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "regex",
        code: m.invalid_string,
        message: i.message
      }), r.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), r.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "datetime" ? En(i).test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: "datetime",
        message: i.message
      }), r.dirty()) : i.kind === "date" ? bn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: "date",
        message: i.message
      }), r.dirty()) : i.kind === "time" ? In(i).test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.invalid_string,
        validation: "time",
        message: i.message
      }), r.dirty()) : i.kind === "duration" ? mn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "duration",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "ip" ? Sn(e.data, i.version) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "ip",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "jwt" ? Tn(e.data, i.alg) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "jwt",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "cidr" ? On(e.data, i.version) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "cidr",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64" ? xn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "base64",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64url" ? kn.test(e.data) || (s = this._getOrReturnCtx(e, s), p(s, {
        validation: "base64url",
        code: m.invalid_string,
        message: i.message
      }), r.dirty()) : O.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((s) => e.test(s), {
      validation: t,
      code: m.invalid_string,
      ..._.errToObj(r)
    });
  }
  _addCheck(e) {
    return new je({
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
    return new je({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new je({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new je({
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
je.create = (n) => new je({
  checks: [],
  typeName: x.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...E(n)
});
function Nn(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = t > r ? t : r, i = Number.parseInt(n.toFixed(s).replace(".", "")), a = Number.parseInt(e.toFixed(s).replace(".", ""));
  return i % a / 10 ** s;
}
class tt extends S {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== y.number) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: y.number,
        received: i.parsedType
      }), w;
    }
    let r;
    const s = new oe();
    for (const i of this._def.checks)
      i.kind === "int" ? O.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), s.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? Nn(e.data, i.value) !== 0 && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.not_finite,
        message: i.message
      }), s.dirty()) : O.assertNever(i);
    return { status: s.value, value: e.data };
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
  setLimit(e, t, r, s) {
    return new tt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: _.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new tt({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && O.isInteger(e.value));
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
tt.create = (n) => new tt({
  checks: [],
  typeName: x.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...E(n)
});
class gt extends S {
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
    if (this._getType(e) !== y.bigint)
      return this._getInvalidInput(e);
    let r;
    const s = new oe();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), p(r, {
        code: m.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : O.assertNever(i);
    return { status: s.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return p(t, {
      code: m.invalid_type,
      expected: y.bigint,
      received: t.parsedType
    }), w;
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
  setLimit(e, t, r, s) {
    return new gt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: _.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new gt({
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
gt.create = (n) => new gt({
  checks: [],
  typeName: x.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...E(n)
});
class mr extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== y.boolean) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.boolean,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
mr.create = (n) => new mr({
  typeName: x.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...E(n)
});
class Tt extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== y.date) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_type,
        expected: y.date,
        received: i.parsedType
      }), w;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return p(i, {
        code: m.invalid_date
      }), w;
    }
    const r = new oe();
    let s;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), r.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (s = this._getOrReturnCtx(e, s), p(s, {
        code: m.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), r.dirty()) : O.assertNever(i);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new Tt({
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
Tt.create = (n) => new Tt({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: x.ZodDate,
  ...E(n)
});
class vr extends S {
  _parse(e) {
    if (this._getType(e) !== y.symbol) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.symbol,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
vr.create = (n) => new vr({
  typeName: x.ZodSymbol,
  ...E(n)
});
class pr extends S {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.undefined,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
pr.create = (n) => new pr({
  typeName: x.ZodUndefined,
  ...E(n)
});
class gr extends S {
  _parse(e) {
    if (this._getType(e) !== y.null) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.null,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
gr.create = (n) => new gr({
  typeName: x.ZodNull,
  ...E(n)
});
class yr extends S {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return de(e.data);
  }
}
yr.create = (n) => new yr({
  typeName: x.ZodAny,
  ...E(n)
});
class _r extends S {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return de(e.data);
  }
}
_r.create = (n) => new _r({
  typeName: x.ZodUnknown,
  ...E(n)
});
class Ve extends S {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return p(t, {
      code: m.invalid_type,
      expected: y.never,
      received: t.parsedType
    }), w;
  }
}
Ve.create = (n) => new Ve({
  typeName: x.ZodNever,
  ...E(n)
});
class wr extends S {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.void,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
wr.create = (n) => new wr({
  typeName: x.ZodVoid,
  ...E(n)
});
class we extends S {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), s = this._def;
    if (t.parsedType !== y.array)
      return p(t, {
        code: m.invalid_type,
        expected: y.array,
        received: t.parsedType
      }), w;
    if (s.exactLength !== null) {
      const a = t.data.length > s.exactLength.value, o = t.data.length < s.exactLength.value;
      (a || o) && (p(t, {
        code: a ? m.too_big : m.too_small,
        minimum: o ? s.exactLength.value : void 0,
        maximum: a ? s.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: s.exactLength.message
      }), r.dirty());
    }
    if (s.minLength !== null && t.data.length < s.minLength.value && (p(t, {
      code: m.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.minLength.message
    }), r.dirty()), s.maxLength !== null && t.data.length > s.maxLength.value && (p(t, {
      code: m.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((a, o) => s.type._parseAsync(new Ze(t, a, t.path, o)))).then((a) => oe.mergeArray(r, a));
    const i = [...t.data].map((a, o) => s.type._parseSync(new Ze(t, a, t.path, o)));
    return oe.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new we({
      ...this._def,
      minLength: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new we({
      ...this._def,
      maxLength: { value: e, message: _.toString(t) }
    });
  }
  length(e, t) {
    return new we({
      ...this._def,
      exactLength: { value: e, message: _.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
we.create = (n, e) => new we({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: x.ZodArray,
  ...E(e)
});
function We(n) {
  if (n instanceof P) {
    const e = {};
    for (const t in n.shape) {
      const r = n.shape[t];
      e[t] = Le.create(We(r));
    }
    return new P({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof we ? new we({
    ...n._def,
    type: We(n.element)
  }) : n instanceof Le ? Le.create(We(n.unwrap())) : n instanceof st ? st.create(We(n.unwrap())) : n instanceof ze ? ze.create(n.items.map((e) => We(e))) : n;
}
class P extends S {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = O.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== y.object) {
      const h = this._getOrReturnCtx(e);
      return p(h, {
        code: m.invalid_type,
        expected: y.object,
        received: h.parsedType
      }), w;
    }
    const { status: r, ctx: s } = this._processInputParams(e), { shape: i, keys: a } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Ve && this._def.unknownKeys === "strip"))
      for (const h in s.data)
        a.includes(h) || o.push(h);
    const c = [];
    for (const h of a) {
      const d = i[h], v = s.data[h];
      c.push({
        key: { status: "valid", value: h },
        value: d._parse(new Ze(s, v, s.path, h)),
        alwaysSet: h in s.data
      });
    }
    if (this._def.catchall instanceof Ve) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const d of o)
          c.push({
            key: { status: "valid", value: d },
            value: { status: "valid", value: s.data[d] }
          });
      else if (h === "strict")
        o.length > 0 && (p(s, {
          code: m.unrecognized_keys,
          keys: o
        }), r.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const d of o) {
        const v = s.data[d];
        c.push({
          key: { status: "valid", value: d },
          value: h._parse(
            new Ze(s, v, s.path, d)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: d in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const d of c) {
        const v = await d.key, k = await d.value;
        h.push({
          key: v,
          value: k,
          alwaysSet: d.alwaysSet
        });
      }
      return h;
    }).then((h) => oe.mergeObjectSync(r, h)) : oe.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return _.errToObj, new P({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var i, a;
          const s = ((a = (i = this._def).errorMap) == null ? void 0 : a.call(i, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: _.errToObj(e).message ?? s
          } : {
            message: s
          };
        }
      } : {}
    });
  }
  strip() {
    return new P({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new P({
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
    return new P({
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
    return new P({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: x.ZodObject
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
    return new P({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of O.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of O.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return We(this);
  }
  partial(e) {
    const t = {};
    for (const r of O.objectKeys(this.shape)) {
      const s = this.shape[r];
      e && !e[r] ? t[r] = s : t[r] = s.optional();
    }
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of O.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let i = this.shape[r];
        for (; i instanceof Le; )
          i = i._def.innerType;
        t[r] = i;
      }
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Vr(O.objectKeys(this.shape));
  }
}
P.create = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strip",
  catchall: Ve.create(),
  typeName: x.ZodObject,
  ...E(e)
});
P.strictCreate = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strict",
  catchall: Ve.create(),
  typeName: x.ZodObject,
  ...E(e)
});
P.lazycreate = (n, e) => new P({
  shape: n,
  unknownKeys: "strip",
  catchall: Ve.create(),
  typeName: x.ZodObject,
  ...E(e)
});
class Ot extends S {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function s(i) {
      for (const o of i)
        if (o.result.status === "valid")
          return o.result;
      for (const o of i)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const a = i.map((o) => new Se(o.ctx.common.issues));
      return p(t, {
        code: m.invalid_union,
        unionErrors: a
      }), w;
    }
    if (t.common.async)
      return Promise.all(r.map(async (i) => {
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
      })).then(s);
    {
      let i;
      const a = [];
      for (const c of r) {
        const h = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, d = c._parseSync({
          data: t.data,
          path: t.path,
          parent: h
        });
        if (d.status === "valid")
          return d;
        d.status === "dirty" && !i && (i = { result: d, ctx: h }), h.common.issues.length && a.push(h.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const o = a.map((c) => new Se(c));
      return p(t, {
        code: m.invalid_union,
        unionErrors: o
      }), w;
    }
  }
  get options() {
    return this._def.options;
  }
}
Ot.create = (n, e) => new Ot({
  options: n,
  typeName: x.ZodUnion,
  ...E(e)
});
function Bt(n, e) {
  const t = Ne(n), r = Ne(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === y.object && r === y.object) {
    const s = O.objectKeys(e), i = O.objectKeys(n).filter((o) => s.indexOf(o) !== -1), a = { ...n, ...e };
    for (const o of i) {
      const c = Bt(n[o], e[o]);
      if (!c.valid)
        return { valid: !1 };
      a[o] = c.data;
    }
    return { valid: !0, data: a };
  } else if (t === y.array && r === y.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const s = [];
    for (let i = 0; i < n.length; i++) {
      const a = n[i], o = e[i], c = Bt(a, o);
      if (!c.valid)
        return { valid: !1 };
      s.push(c.data);
    }
    return { valid: !0, data: s };
  } else return t === y.date && r === y.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class Nt extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = (i, a) => {
      if (dr(i) || dr(a))
        return w;
      const o = Bt(i.value, a.value);
      return o.valid ? ((hr(i) || hr(a)) && t.dirty(), { status: t.value, value: o.data }) : (p(r, {
        code: m.invalid_intersection_types
      }), w);
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
    ]).then(([i, a]) => s(i, a)) : s(this._def.left._parseSync({
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
Nt.create = (n, e, t) => new Nt({
  left: n,
  right: e,
  typeName: x.ZodIntersection,
  ...E(t)
});
class ze extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.array)
      return p(r, {
        code: m.invalid_type,
        expected: y.array,
        received: r.parsedType
      }), w;
    if (r.data.length < this._def.items.length)
      return p(r, {
        code: m.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), w;
    !this._def.rest && r.data.length > this._def.items.length && (p(r, {
      code: m.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...r.data].map((a, o) => {
      const c = this._def.items[o] || this._def.rest;
      return c ? c._parse(new Ze(r, a, r.path, o)) : null;
    }).filter((a) => !!a);
    return r.common.async ? Promise.all(i).then((a) => oe.mergeArray(t, a)) : oe.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new ze({
      ...this._def,
      rest: e
    });
  }
}
ze.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new ze({
    items: n,
    typeName: x.ZodTuple,
    rest: null,
    ...E(e)
  });
};
class xr extends S {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.map)
      return p(r, {
        code: m.invalid_type,
        expected: y.map,
        received: r.parsedType
      }), w;
    const s = this._def.keyType, i = this._def.valueType, a = [...r.data.entries()].map(([o, c], h) => ({
      key: s._parse(new Ze(r, o, r.path, [h, "key"])),
      value: i._parse(new Ze(r, c, r.path, [h, "value"]))
    }));
    if (r.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of a) {
          const h = await c.key, d = await c.value;
          if (h.status === "aborted" || d.status === "aborted")
            return w;
          (h.status === "dirty" || d.status === "dirty") && t.dirty(), o.set(h.value, d.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const c of a) {
        const h = c.key, d = c.value;
        if (h.status === "aborted" || d.status === "aborted")
          return w;
        (h.status === "dirty" || d.status === "dirty") && t.dirty(), o.set(h.value, d.value);
      }
      return { status: t.value, value: o };
    }
  }
}
xr.create = (n, e, t) => new xr({
  valueType: e,
  keyType: n,
  typeName: x.ZodMap,
  ...E(t)
});
class yt extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.set)
      return p(r, {
        code: m.invalid_type,
        expected: y.set,
        received: r.parsedType
      }), w;
    const s = this._def;
    s.minSize !== null && r.data.size < s.minSize.value && (p(r, {
      code: m.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.minSize.message
    }), t.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && (p(r, {
      code: m.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function a(c) {
      const h = /* @__PURE__ */ new Set();
      for (const d of c) {
        if (d.status === "aborted")
          return w;
        d.status === "dirty" && t.dirty(), h.add(d.value);
      }
      return { status: t.value, value: h };
    }
    const o = [...r.data.values()].map((c, h) => i._parse(new Ze(r, c, r.path, h)));
    return r.common.async ? Promise.all(o).then((c) => a(c)) : a(o);
  }
  min(e, t) {
    return new yt({
      ...this._def,
      minSize: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new yt({
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
yt.create = (n, e) => new yt({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: x.ZodSet,
  ...E(e)
});
class kr extends S {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
kr.create = (n, e) => new kr({
  getter: n,
  typeName: x.ZodLazy,
  ...E(e)
});
class br extends S {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return p(t, {
        received: t.data,
        code: m.invalid_literal,
        expected: this._def.value
      }), w;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
br.create = (n, e) => new br({
  value: n,
  typeName: x.ZodLiteral,
  ...E(e)
});
function Vr(n, e) {
  return new rt({
    values: n,
    typeName: x.ZodEnum,
    ...E(e)
  });
}
class rt extends S {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return p(t, {
        expected: O.joinValues(r),
        received: t.parsedType,
        code: m.invalid_type
      }), w;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return p(t, {
        received: t.data,
        code: m.invalid_enum_value,
        options: r
      }), w;
    }
    return de(e.data);
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
    return rt.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return rt.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
rt.create = Vr;
class Ir extends S {
  _parse(e) {
    const t = O.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== y.string && r.parsedType !== y.number) {
      const s = O.objectValues(t);
      return p(r, {
        expected: O.joinValues(s),
        received: r.parsedType,
        code: m.invalid_type
      }), w;
    }
    if (this._cache || (this._cache = new Set(O.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const s = O.objectValues(t);
      return p(r, {
        received: r.data,
        code: m.invalid_enum_value,
        options: s
      }), w;
    }
    return de(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ir.create = (n, e) => new Ir({
  values: n,
  typeName: x.ZodNativeEnum,
  ...E(e)
});
class Ct extends S {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== y.promise && t.common.async === !1)
      return p(t, {
        code: m.invalid_type,
        expected: y.promise,
        received: t.parsedType
      }), w;
    const r = t.parsedType === y.promise ? t.data : Promise.resolve(t.data);
    return de(r.then((s) => this._def.type.parseAsync(s, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Ct.create = (n, e) => new Ct({
  type: n,
  typeName: x.ZodPromise,
  ...E(e)
});
class nt extends S {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === x.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = this._def.effect || null, i = {
      addIssue: (a) => {
        p(r, a), a.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), s.type === "preprocess") {
      const a = s.transform(r.data, i);
      if (r.common.async)
        return Promise.resolve(a).then(async (o) => {
          if (t.value === "aborted")
            return w;
          const c = await this._def.schema._parseAsync({
            data: o,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? w : c.status === "dirty" || t.value === "dirty" ? dt(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return w;
        const o = this._def.schema._parseSync({
          data: a,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? w : o.status === "dirty" || t.value === "dirty" ? dt(o.value) : o;
      }
    }
    if (s.type === "refinement") {
      const a = (o) => {
        const c = s.refinement(o, i);
        if (r.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? w : (o.status === "dirty" && t.dirty(), a(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? w : (o.status === "dirty" && t.dirty(), a(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (s.type === "transform")
      if (r.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!et(a))
          return w;
        const o = s.transform(a.value, i);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((a) => et(a) ? Promise.resolve(s.transform(a.value, i)).then((o) => ({
          status: t.value,
          value: o
        })) : w);
    O.assertNever(s);
  }
}
nt.create = (n, e, t) => new nt({
  schema: n,
  typeName: x.ZodEffects,
  effect: e,
  ...E(t)
});
nt.createWithPreprocess = (n, e, t) => new nt({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: x.ZodEffects,
  ...E(t)
});
class Le extends S {
  _parse(e) {
    return this._getType(e) === y.undefined ? de(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Le.create = (n, e) => new Le({
  innerType: n,
  typeName: x.ZodOptional,
  ...E(e)
});
class st extends S {
  _parse(e) {
    return this._getType(e) === y.null ? de(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
st.create = (n, e) => new st({
  innerType: n,
  typeName: x.ZodNullable,
  ...E(e)
});
class Kt extends S {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === y.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Kt.create = (n, e) => new Kt({
  innerType: n,
  typeName: x.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...E(e)
});
class Ut extends S {
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
    return St(s) ? s.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new Se(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new Se(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Ut.create = (n, e) => new Ut({
  innerType: n,
  typeName: x.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...E(e)
});
class Er extends S {
  _parse(e) {
    if (this._getType(e) !== y.nan) {
      const r = this._getOrReturnCtx(e);
      return p(r, {
        code: m.invalid_type,
        expected: y.nan,
        received: r.parsedType
      }), w;
    }
    return { status: "valid", value: e.data };
  }
}
Er.create = (n) => new Er({
  typeName: x.ZodNaN,
  ...E(n)
});
class Cn extends S {
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
class sr extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return i.status === "aborted" ? w : i.status === "dirty" ? (t.dirty(), dt(i.value)) : this._def.out._parseAsync({
          data: i.value,
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
      return s.status === "aborted" ? w : s.status === "dirty" ? (t.dirty(), {
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
    return new sr({
      in: e,
      out: t,
      typeName: x.ZodPipeline
    });
  }
}
class Ft extends S {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (s) => (et(s) && (s.value = Object.freeze(s.value)), s);
    return St(t) ? t.then((s) => r(s)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ft.create = (n, e) => new Ft({
  innerType: n,
  typeName: x.ZodReadonly,
  ...E(e)
});
var x;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(x || (x = {}));
const Mr = je.create, An = tt.create;
Ve.create;
we.create;
Ot.create;
Nt.create;
ze.create;
rt.create;
Ct.create;
Le.create;
st.create;
var J = Uint8Array, ae = Uint16Array, ir = Int32Array, Rt = new J([
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
]), jt = new J([
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
]), Wt = new J([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), $r = function(n, e) {
  for (var t = new ae(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << n[r - 1];
  for (var s = new ir(t[30]), r = 1; r < 30; ++r)
    for (var i = t[r]; i < t[r + 1]; ++i)
      s[i] = i - t[r] << 5 | r;
  return { b: t, r: s };
}, Pr = $r(Rt, 2), Dr = Pr.b, qt = Pr.r;
Dr[28] = 258, qt[258] = 28;
var zr = $r(jt, 0), Rn = zr.b, Sr = zr.r, Jt = new ae(32768);
for (var j = 0; j < 32768; ++j) {
  var Oe = (j & 43690) >> 1 | (j & 21845) << 1;
  Oe = (Oe & 52428) >> 2 | (Oe & 13107) << 2, Oe = (Oe & 61680) >> 4 | (Oe & 3855) << 4, Jt[j] = ((Oe & 65280) >> 8 | (Oe & 255) << 8) >> 1;
}
var xe = (function(n, e, t) {
  for (var r = n.length, s = 0, i = new ae(e); s < r; ++s)
    n[s] && ++i[n[s] - 1];
  var a = new ae(e);
  for (s = 1; s < e; ++s)
    a[s] = a[s - 1] + i[s - 1] << 1;
  var o;
  if (t) {
    o = new ae(1 << e);
    var c = 15 - e;
    for (s = 0; s < r; ++s)
      if (n[s])
        for (var h = s << 4 | n[s], d = e - n[s], v = a[n[s] - 1]++ << d, k = v | (1 << d) - 1; v <= k; ++v)
          o[Jt[v] >> c] = h;
  } else
    for (o = new ae(r), s = 0; s < r; ++s)
      n[s] && (o[s] = Jt[a[n[s] - 1]++] >> 15 - n[s]);
  return o;
}), Me = new J(288);
for (var j = 0; j < 144; ++j)
  Me[j] = 8;
for (var j = 144; j < 256; ++j)
  Me[j] = 9;
for (var j = 256; j < 280; ++j)
  Me[j] = 7;
for (var j = 280; j < 288; ++j)
  Me[j] = 8;
var _t = new J(32);
for (var j = 0; j < 32; ++j)
  _t[j] = 5;
var jn = /* @__PURE__ */ xe(Me, 9, 0), Ln = /* @__PURE__ */ xe(Me, 9, 1), Zn = /* @__PURE__ */ xe(_t, 5, 0), Vn = /* @__PURE__ */ xe(_t, 5, 1), $t = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, fe = function(n, e, t) {
  var r = e / 8 | 0;
  return (n[r] | n[r + 1] << 8) >> (e & 7) & t;
}, Pt = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, ar = function(n) {
  return (n + 7) / 8 | 0;
}, Br = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new J(n.subarray(e, t));
}, Mn = [
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
], me = function(n, e, t) {
  var r = new Error(e || Mn[n]);
  if (r.code = n, Error.captureStackTrace && Error.captureStackTrace(r, me), !t)
    throw r;
  return r;
}, $n = function(n, e, t, r) {
  var s = n.length, i = 0;
  if (!s || e.f && !e.l)
    return t || new J(0);
  var a = !t, o = a || e.i != 2, c = e.i;
  a && (t = new J(s * 3));
  var h = function(at) {
    var ot = t.length;
    if (at > ot) {
      var Ue = new J(Math.max(ot * 2, at));
      Ue.set(t), t = Ue;
    }
  }, d = e.f || 0, v = e.p || 0, k = e.b || 0, R = e.l, L = e.d, A = e.m, z = e.n, he = s * 8;
  do {
    if (!R) {
      d = fe(n, v, 1);
      var re = fe(n, v + 1, 3);
      if (v += 3, re)
        if (re == 1)
          R = Ln, L = Vn, A = 9, z = 5;
        else if (re == 2) {
          var Q = fe(n, v, 31) + 257, B = fe(n, v + 10, 15) + 4, N = Q + fe(n, v + 5, 31) + 1;
          v += 14;
          for (var I = new J(N), K = new J(19), M = 0; M < B; ++M)
            K[Wt[M]] = fe(n, v + M * 3, 7);
          v += B * 3;
          for (var Y = $t(K), Te = (1 << Y) - 1, ne = xe(K, Y, 1), M = 0; M < N; ) {
            var X = ne[fe(n, v, Te)];
            v += X & 15;
            var D = X >> 4;
            if (D < 16)
              I[M++] = D;
            else {
              var U = 0, Z = 0;
              for (D == 16 ? (Z = 3 + fe(n, v, 3), v += 2, U = I[M - 1]) : D == 17 ? (Z = 3 + fe(n, v, 7), v += 3) : D == 18 && (Z = 11 + fe(n, v, 127), v += 7); Z--; )
                I[M++] = U;
            }
          }
          var ee = I.subarray(0, Q), F = I.subarray(Q);
          A = $t(ee), z = $t(F), R = xe(ee, A, 1), L = xe(F, z, 1);
        } else
          me(1);
      else {
        var D = ar(v) + 4, G = n[D - 4] | n[D - 3] << 8, H = D + G;
        if (H > s) {
          c && me(0);
          break;
        }
        o && h(k + G), t.set(n.subarray(D, H), k), e.b = k += G, e.p = v = H * 8, e.f = d;
        continue;
      }
      if (v > he) {
        c && me(0);
        break;
      }
    }
    o && h(k + 131072);
    for (var it = (1 << A) - 1, le = (1 << z) - 1, ke = v; ; ke = v) {
      var U = R[Pt(n, v) & it], se = U >> 4;
      if (v += U & 15, v > he) {
        c && me(0);
        break;
      }
      if (U || me(2), se < 256)
        t[k++] = se;
      else if (se == 256) {
        ke = v, R = null;
        break;
      } else {
        var ie = se - 254;
        if (se > 264) {
          var M = se - 257, V = Rt[M];
          ie = fe(n, v, (1 << V) - 1) + Dr[M], v += V;
        }
        var ve = L[Pt(n, v) & le], Be = ve >> 4;
        ve || me(3), v += ve & 15;
        var F = Rn[Be];
        if (Be > 3) {
          var V = jt[Be];
          F += Pt(n, v) & (1 << V) - 1, v += V;
        }
        if (v > he) {
          c && me(0);
          break;
        }
        o && h(k + 131072);
        var Ke = k + ie;
        if (k < F) {
          var xt = i - F, kt = Math.min(F, Ke);
          for (xt + k < 0 && me(3); k < kt; ++k)
            t[k] = r[xt + k];
        }
        for (; k < Ke; ++k)
          t[k] = t[k - F];
      }
    }
    e.l = R, e.p = ke, e.b = k, e.f = d, R && (d = 1, e.m = A, e.d = L, e.n = z);
  } while (!d);
  return k != t.length && a ? Br(t, 0, k) : t.subarray(0, k);
}, be = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8;
}, lt = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8, n[r + 2] |= t >> 16;
}, Dt = function(n, e) {
  for (var t = [], r = 0; r < n.length; ++r)
    n[r] && t.push({ s: r, f: n[r] });
  var s = t.length, i = t.slice();
  if (!s)
    return { t: Ur, l: 0 };
  if (s == 1) {
    var a = new J(t[0].s + 1);
    return a[t[0].s] = 1, { t: a, l: 1 };
  }
  t.sort(function(H, Q) {
    return H.f - Q.f;
  }), t.push({ s: -1, f: 25001 });
  var o = t[0], c = t[1], h = 0, d = 1, v = 2;
  for (t[0] = { s: -1, f: o.f + c.f, l: o, r: c }; d != s - 1; )
    o = t[t[h].f < t[v].f ? h++ : v++], c = t[h != d && t[h].f < t[v].f ? h++ : v++], t[d++] = { s: -1, f: o.f + c.f, l: o, r: c };
  for (var k = i[0].s, r = 1; r < s; ++r)
    i[r].s > k && (k = i[r].s);
  var R = new ae(k + 1), L = Ht(t[d - 1], R, 0);
  if (L > e) {
    var r = 0, A = 0, z = L - e, he = 1 << z;
    for (i.sort(function(Q, B) {
      return R[B.s] - R[Q.s] || Q.f - B.f;
    }); r < s; ++r) {
      var re = i[r].s;
      if (R[re] > e)
        A += he - (1 << L - R[re]), R[re] = e;
      else
        break;
    }
    for (A >>= z; A > 0; ) {
      var D = i[r].s;
      R[D] < e ? A -= 1 << e - R[D]++ - 1 : ++r;
    }
    for (; r >= 0 && A; --r) {
      var G = i[r].s;
      R[G] == e && (--R[G], ++A);
    }
    L = e;
  }
  return { t: new J(R), l: L };
}, Ht = function(n, e, t) {
  return n.s == -1 ? Math.max(Ht(n.l, e, t + 1), Ht(n.r, e, t + 1)) : e[n.s] = t;
}, Tr = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new ae(++e), r = 0, s = n[0], i = 1, a = function(c) {
    t[r++] = c;
  }, o = 1; o <= e; ++o)
    if (n[o] == s && o != e)
      ++i;
    else {
      if (!s && i > 2) {
        for (; i > 138; i -= 138)
          a(32754);
        i > 2 && (a(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (a(s), --i; i > 6; i -= 6)
          a(8304);
        i > 2 && (a(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        a(s);
      i = 1, s = n[o];
    }
  return { c: t.subarray(0, r), n: e };
}, ct = function(n, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += n[r] * e[r];
  return t;
}, Kr = function(n, e, t) {
  var r = t.length, s = ar(e + 2);
  n[s] = r & 255, n[s + 1] = r >> 8, n[s + 2] = n[s] ^ 255, n[s + 3] = n[s + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    n[s + i + 4] = t[i];
  return (s + 4 + r) * 8;
}, Or = function(n, e, t, r, s, i, a, o, c, h, d) {
  be(e, d++, t), ++s[256];
  for (var v = Dt(s, 15), k = v.t, R = v.l, L = Dt(i, 15), A = L.t, z = L.l, he = Tr(k), re = he.c, D = he.n, G = Tr(A), H = G.c, Q = G.n, B = new ae(19), N = 0; N < re.length; ++N)
    ++B[re[N] & 31];
  for (var N = 0; N < H.length; ++N)
    ++B[H[N] & 31];
  for (var I = Dt(B, 7), K = I.t, M = I.l, Y = 19; Y > 4 && !K[Wt[Y - 1]]; --Y)
    ;
  var Te = h + 5 << 3, ne = ct(s, Me) + ct(i, _t) + a, X = ct(s, k) + ct(i, A) + a + 14 + 3 * Y + ct(B, K) + 2 * B[16] + 3 * B[17] + 7 * B[18];
  if (c >= 0 && Te <= ne && Te <= X)
    return Kr(e, d, n.subarray(c, c + h));
  var U, Z, ee, F;
  if (be(e, d, 1 + (X < ne)), d += 2, X < ne) {
    U = xe(k, R, 0), Z = k, ee = xe(A, z, 0), F = A;
    var it = xe(K, M, 0);
    be(e, d, D - 257), be(e, d + 5, Q - 1), be(e, d + 10, Y - 4), d += 14;
    for (var N = 0; N < Y; ++N)
      be(e, d + 3 * N, K[Wt[N]]);
    d += 3 * Y;
    for (var le = [re, H], ke = 0; ke < 2; ++ke)
      for (var se = le[ke], N = 0; N < se.length; ++N) {
        var ie = se[N] & 31;
        be(e, d, it[ie]), d += K[ie], ie > 15 && (be(e, d, se[N] >> 5 & 127), d += se[N] >> 12);
      }
  } else
    U = jn, Z = Me, ee = Zn, F = _t;
  for (var N = 0; N < o; ++N) {
    var V = r[N];
    if (V > 255) {
      var ie = V >> 18 & 31;
      lt(e, d, U[ie + 257]), d += Z[ie + 257], ie > 7 && (be(e, d, V >> 23 & 31), d += Rt[ie]);
      var ve = V & 31;
      lt(e, d, ee[ve]), d += F[ve], ve > 3 && (lt(e, d, V >> 5 & 8191), d += jt[ve]);
    } else
      lt(e, d, U[V]), d += Z[V];
  }
  return lt(e, d, U[256]), d + Z[256];
}, Pn = /* @__PURE__ */ new ir([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Ur = /* @__PURE__ */ new J(0), Dn = function(n, e, t, r, s, i) {
  var a = i.z || n.length, o = new J(r + a + 5 * (1 + Math.ceil(a / 7e3)) + s), c = o.subarray(r, o.length - s), h = i.l, d = (i.r || 0) & 7;
  if (e) {
    d && (c[0] = i.r >> 3);
    for (var v = Pn[e - 1], k = v >> 13, R = v & 8191, L = (1 << t) - 1, A = i.p || new ae(32768), z = i.h || new ae(L + 1), he = Math.ceil(t / 3), re = 2 * he, D = function(Lt) {
      return (n[Lt] ^ n[Lt + 1] << he ^ n[Lt + 2] << re) & L;
    }, G = new ir(25e3), H = new ae(288), Q = new ae(32), B = 0, N = 0, I = i.i || 0, K = 0, M = i.w || 0, Y = 0; I + 2 < a; ++I) {
      var Te = D(I), ne = I & 32767, X = z[Te];
      if (A[ne] = X, z[Te] = ne, M <= I) {
        var U = a - I;
        if ((B > 7e3 || K > 24576) && (U > 423 || !h)) {
          d = Or(n, c, 0, G, H, Q, N, K, Y, I - Y, d), K = B = N = 0, Y = I;
          for (var Z = 0; Z < 286; ++Z)
            H[Z] = 0;
          for (var Z = 0; Z < 30; ++Z)
            Q[Z] = 0;
        }
        var ee = 2, F = 0, it = R, le = ne - X & 32767;
        if (U > 2 && Te == D(I - le))
          for (var ke = Math.min(k, U) - 1, se = Math.min(32767, I), ie = Math.min(258, U); le <= se && --it && ne != X; ) {
            if (n[I + ee] == n[I + ee - le]) {
              for (var V = 0; V < ie && n[I + V] == n[I + V - le]; ++V)
                ;
              if (V > ee) {
                if (ee = V, F = le, V > ke)
                  break;
                for (var ve = Math.min(le, V - 2), Be = 0, Z = 0; Z < ve; ++Z) {
                  var Ke = I - le + Z & 32767, xt = A[Ke], kt = Ke - xt & 32767;
                  kt > Be && (Be = kt, X = Ke);
                }
              }
            }
            ne = X, X = A[ne], le += ne - X & 32767;
          }
        if (F) {
          G[K++] = 268435456 | qt[ee] << 18 | Sr[F];
          var at = qt[ee] & 31, ot = Sr[F] & 31;
          N += Rt[at] + jt[ot], ++H[257 + at], ++Q[ot], M = I + ee, ++B;
        } else
          G[K++] = n[I], ++H[n[I]];
      }
    }
    for (I = Math.max(I, M); I < a; ++I)
      G[K++] = n[I], ++H[n[I]];
    d = Or(n, c, h, G, H, Q, N, K, Y, I - Y, d), h || (i.r = d & 7 | c[d / 8 | 0] << 3, d -= 7, i.h = z, i.p = A, i.i = I, i.w = M);
  } else {
    for (var I = i.w || 0; I < a + h; I += 65535) {
      var Ue = I + 65535;
      Ue >= a && (c[d / 8 | 0] = h, Ue = a), d = Kr(c, d + 1, n.subarray(I, Ue));
    }
    i.i = a;
  }
  return Br(o, 0, r + ar(d) + s);
}, zn = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Bn = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, r = 0; r < e.length; ++r)
        t = zn[t & 255 ^ e[r]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Kn = function(n, e, t, r, s) {
  if (!s && (s = { l: 1 }, e.dictionary)) {
    var i = e.dictionary.subarray(-32768), a = new J(i.length + n.length);
    a.set(i), a.set(n, i.length), n = a, s.w = i.length;
  }
  return Dn(n, e.level == null ? 6 : e.level, e.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, r, s);
}, Yt = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Un = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Yt(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      n[r + 10] = t.charCodeAt(r);
  }
}, Fn = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && me(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !n[t++])
    ;
  return t + (e & 2);
}, Wn = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, qn = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Jn(n, e) {
  e || (e = {});
  var t = Bn(), r = n.length;
  t.p(n);
  var s = Kn(n, e, qn(e), 8), i = s.length;
  return Un(s, e), Yt(s, i - 8, t.d()), Yt(s, i - 4, r), s;
}
function Hn(n, e) {
  var t = Fn(n);
  return t + 8 > n.length && me(6, "invalid gzip data"), $n(n.subarray(t, -8), { i: 2 }, new J(Wn(n)), e);
}
var Yn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Gn = 0;
try {
  Yn.decode(Ur, { stream: !0 }), Gn = 1;
} catch {
}
const Qn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Ye(n, e, t) {
  const r = t[0];
  if (e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n.slice(-1) === r || e && e.slice(-1) === r)
    throw new Error("trailing zero");
  if (e) {
    let a = 0;
    for (; (n[a] || r) === e[a]; )
      a++;
    if (a > 0)
      return e.slice(0, a) + Ye(n.slice(a), e.slice(a), t);
  }
  const s = n ? t.indexOf(n[0]) : 0, i = e != null ? t.indexOf(e[0]) : t.length;
  if (i - s > 1) {
    const a = Math.round(0.5 * (s + i));
    return t[a];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[s] + Ye(n.slice(1), null, t);
}
function Fr(n) {
  if (n.length !== Wr(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function Wr(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function ht(n) {
  const e = Wr(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Nr(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = ht(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Cr(n, e) {
  Fr(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let i = r.length - 1; s && i >= 0; i--) {
    const a = e.indexOf(r[i]) + 1;
    a === e.length ? r[i] = e[0] : (r[i] = e[a], s = !1);
  }
  if (s) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) + 1);
    return i > "a" ? r.push(e[0]) : r.pop(), i + r.join("");
  } else
    return t + r.join("");
}
function Xn(n, e) {
  Fr(n);
  const [t, ...r] = n.split("");
  let s = !0;
  for (let i = r.length - 1; s && i >= 0; i--) {
    const a = e.indexOf(r[i]) - 1;
    a === -1 ? r[i] = e.slice(-1) : (r[i] = e[a], s = !1);
  }
  if (s) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const i = String.fromCharCode(t.charCodeAt(0) - 1);
    return i < "Z" ? r.push(e.slice(-1)) : r.pop(), i + r.join("");
  } else
    return t + r.join("");
}
function Fe(n, e, t = Qn) {
  if (n != null && Nr(n, t), e != null && Nr(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = ht(e), h = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Ye("", h, t);
    if (c < e)
      return c;
    const d = Xn(c, t);
    if (d == null)
      throw new Error("cannot decrement any more");
    return d;
  }
  if (e == null) {
    const c = ht(n), h = n.slice(c.length), d = Cr(c, t);
    return d ?? c + Ye(h, null, t);
  }
  const r = ht(n), s = n.slice(r.length), i = ht(e), a = e.slice(i.length);
  if (r === i)
    return r + Ye(s, a, t);
  const o = Cr(r, t);
  if (o == null)
    throw new Error("cannot increment any more");
  return o < e ? o : r + Ye(s, null, t);
}
const es = new Uint8Array([
  31,
  139,
  8,
  0,
  235,
  111,
  170,
  105,
  0,
  3,
  165,
  207,
  207,
  74,
  195,
  64,
  16,
  6,
  240,
  232,
  197,
  170,
  208,
  179,
  138,
  173,
  171,
  22,
  4,
  53,
  154,
  138,
  104,
  241,
  15,
  40,
  53,
  106,
  72,
  211,
  86,
  16,
  239,
  91,
  119,
  138,
  133,
  184,
  145,
  100,
  3,
  219,
  91,
  191,
  55,
  17,
  95,
  196,
  135,
  208,
  71,
  16,
  244,
  49,
  172,
  73,
  10,
  241,
  32,
  4,
  156,
  195,
  192,
  12,
  51,
  124,
  252,
  12,
  99,
  122,
  3,
  221,
  115,
  61,
  99,
  75,
  21,
  14,
  40,
  66,
  167,
  169,
  107,
  86,
  86,
  102,
  210,
  246,
  127,
  90,
  99,
  50,
  78,
  10,
  109,
  91,
  184,
  3,
  41,
  224,
  25,
  66,
  6,
  138,
  168,
  197,
  123,
  228,
  163,
  197,
  224,
  142,
  132,
  35,
  251,
  1,
  156,
  51,
  93,
  242,
  28,
  207,
  190,
  29,
  62,
  17,
  174,
  25,
  174,
  70,
  122,
  246,
  142,
  251,
  49,
  37,
  111,
  54,
  195,
  5,
  208,
  28,
  255,
  74,
  42,
  148,
  88,
  199,
  233,
  101,
  154,
  120,
  146,
  38,
  234,
  114,
  16,
  43,
  10,
  187,
  62,
  191,
  167,
  71,
  146,
  10,
  199,
  12,
  71,
  198,
  139,
  158,
  79,
  214,
  237,
  241,
  133,
  35,
  138,
  89,
  116,
  169,
  19,
  10,
  10,
  93,
  26,
  246,
  184,
  149,
  65,
  26,
  12,
  135,
  192,
  1,
  169,
  144,
  71,
  15,
  41,
  200,
  202,
  131,
  118,
  25,
  118,
  126,
  129,
  182,
  25,
  182,
  128,
  205,
  226,
  160,
  61,
  212,
  50,
  208,
  250,
  31,
  160,
  53,
  134,
  213,
  127,
  131,
  234,
  25,
  104,
  133,
  161,
  10,
  84,
  116,
  217,
  15,
  34,
  101,
  114,
  41,
  204,
  126,
  16,
  75,
  145,
  208,
  170,
  57,
  89,
  133,
  45,
  231,
  93,
  75,
  108,
  17,
  11,
  9,
  106,
  234,
  249,
  235,
  253,
  245,
  237,
  227,
  115,
  238,
  230,
  27,
  200,
  123,
  156,
  72,
  53,
  2,
  0,
  0
]), ts = Mr(), Ar = Mr().min(1), ut = An().int().nonnegative().optional();
function rs(n) {
  const e = 4 + n.reduce((i, a) => i + 4 + a.byteLength, 0), t = new Uint8Array(e), r = new DataView(t.buffer);
  r.setUint32(0, n.length, !1);
  let s = 4;
  for (const i of n)
    r.setUint32(s, i.byteLength, !1), s += 4, t.set(i, s), s += i.byteLength;
  return t;
}
function ns(n) {
  const e = new DataView(n.buffer, n.byteOffset, n.byteLength), t = e.getUint32(0, !1), r = [];
  let s = 4;
  for (let i = 0; i < t; i++) {
    const a = e.getUint32(s, !1);
    s += 4, r.push(n.slice(s, s + a)), s += a;
  }
  return r;
}
function ss(n) {
  const e = new Uint8Array(4);
  return new DataView(e.buffer).setUint32(0, n >>> 0, !1), e;
}
function is(n) {
  return n.byteLength < 4 ? 0 : new DataView(n.buffer, n.byteOffset, 4).getUint32(0, !1);
}
var b, wt, Pe, Ee, Ge, te, Ce, Ae, ye, _e, At, Qe, Re, Xe, De, l, C, qe, ft, ge, It, Gt, qr, Jr, ue, $e, Je, mt, He, vt, Et, Hr, Qt, Yr, Xt, er, tr, rr, T, Gr, nr, Qr;
const pt = class pt {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t) {
    W(this, l);
    /**** private state ****/
    W(this, b);
    W(this, wt);
    W(this, Pe);
    W(this, Ee, null);
    W(this, Ge, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    W(this, te, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId  (kept in sync with #ReverseIndex)
    W(this, Ce, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    W(this, Ae, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    W(this, ye, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    W(this, _e, /* @__PURE__ */ new Map());
    W(this, At, nn);
    // transaction nesting
    W(this, Qe, 0);
    // ChangeSet accumulator inside a transaction
    W(this, Re, {});
    // patch log for exportPatch() — only locally generated patches
    W(this, Xe, []);
    // suppress adding to patch log when applying remote patches
    W(this, De, !1);
    var r;
    if (pe(this, b, e), pe(this, wt, (t == null ? void 0 : t.LiteralSizeLimit) ?? tn), pe(this, Pe, (t == null ? void 0 : t.TrashTTLms) ?? null), u(this, l, qr).call(this), f(this, Pe) != null) {
      const s = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(f(this, Pe) / 4), 36e5);
      pe(this, Ee, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        s
      )), typeof ((r = f(this, Ee)) == null ? void 0 : r.unref) == "function" && f(this, Ee).unref();
    }
  }
  static fromScratch(e) {
    return pt.fromBinary(es, e);
  }
  static fromBinary(e, t) {
    const r = Hn(e), s = Xr.fromBinary(r);
    return new pt(s, t);
  }
  static fromJSON(e, t) {
    const r = new Uint8Array(Buffer.from(String(e), "base64"));
    return pt.fromBinary(r, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  get RootNote() {
    return u(this, l, ge).call(this, Ie);
  }
  get TrashNote() {
    return u(this, l, ge).call(this, $);
  }
  get LostAndFoundNote() {
    return u(this, l, ge).call(this, ce);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  EntryWithId(e) {
    if (u(this, l, C).call(this).Entries[e] != null)
      return u(this, l, ft).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  newNoteAt(e, t, r) {
    const s = t ?? bt;
    if (!Ar.safeParse(s).success)
      throw new q("invalid-argument", "MIMEType must be a non-empty string");
    ut.parse(r), u(this, l, qe).call(this, e.Id);
    const i = crypto.randomUUID(), a = u(this, l, He).call(this, e.Id, r), o = s === bt ? "" : s;
    return this.transact(() => {
      f(this, b).api.obj(["Entries"]).set({
        [i]: g.obj({
          Kind: g.con("note"),
          outerPlacement: g.val(g.con({ outerNoteId: e.Id, OrderKey: a })),
          Label: g.val(g.str("")),
          Info: g.obj({}),
          MIMEType: g.val(g.str(o)),
          ValueKind: g.val(g.str("none"))
        })
      }), u(this, l, ue).call(this, e.Id, i), u(this, l, T).call(this, e.Id, "innerEntryList"), u(this, l, T).call(this, i, "outerNote");
    }), u(this, l, ge).call(this, i);
  }
  newLinkAt(e, t, r) {
    ut.parse(r), u(this, l, qe).call(this, e.Id), u(this, l, qe).call(this, t.Id);
    const s = crypto.randomUUID(), i = u(this, l, He).call(this, t.Id, r);
    return this.transact(() => {
      f(this, b).api.obj(["Entries"]).set({
        [s]: g.obj({
          Kind: g.con("link"),
          outerPlacement: g.val(g.con({ outerNoteId: t.Id, OrderKey: i })),
          Label: g.val(g.str("")),
          Info: g.obj({}),
          TargetId: g.con(e.Id)
        })
      }), u(this, l, ue).call(this, t.Id, s), u(this, l, Je).call(this, e.Id, s), u(this, l, T).call(this, t.Id, "innerEntryList"), u(this, l, T).call(this, s, "outerNote");
    }), u(this, l, It).call(this, s);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  deserializeNoteInto(e, t, r) {
    if (ut.parse(r), u(this, l, qe).call(this, t.Id), e == null)
      throw new q("invalid-argument", "Serialisation must not be null");
    const s = e, i = Object.keys(s.Entries ?? {});
    if (i.length === 0)
      throw new q("invalid-argument", "empty serialisation");
    const a = i[0], o = crypto.randomUUID(), c = /* @__PURE__ */ new Map([[a, o]]);
    for (const d of i)
      c.has(d) || c.set(d, crypto.randomUUID());
    const h = u(this, l, He).call(this, t.Id, r);
    return this.transact(() => {
      for (const d of i) {
        const v = s.Entries[d], k = c.get(d), L = d === a ? { outerNoteId: t.Id, OrderKey: h } : v.outerPlacement != null ? { outerNoteId: c.get(v.outerPlacement.outerNoteId) ?? t.Id, OrderKey: v.outerPlacement.OrderKey } : void 0, A = {
          Kind: g.con(v.Kind),
          Label: g.val(g.str(v.Label ?? "")),
          Info: g.obj({})
        };
        L != null && (A.outerPlacement = g.val(g.con(L))), v.Kind === "note" ? (A.MIMEType = g.val(g.str(v.MIMEType ?? "")), A.ValueKind = g.val(g.str("none"))) : A.TargetId = g.con(
          v.TargetId != null ? c.get(v.TargetId) ?? v.TargetId : ""
        ), f(this, b).api.obj(["Entries"]).set({ [k]: g.obj(A) });
        const z = (L == null ? void 0 : L.outerNoteId) ?? "";
        z !== "" && u(this, l, ue).call(this, z, k), v.Kind === "link" && v.TargetId != null && u(this, l, Je).call(this, c.get(v.TargetId) ?? v.TargetId, k);
      }
      u(this, l, T).call(this, t.Id, "innerEntryList");
    }), u(this, l, ge).call(this, o);
  }
  deserializeLinkInto(e, t, r) {
    if (ut.parse(r), u(this, l, qe).call(this, t.Id), e == null)
      throw new q("invalid-argument", "Serialisation must not be null");
    const s = e, i = Object.keys(s.Entries ?? {});
    if (i.length === 0)
      throw new q("invalid-argument", "empty serialisation");
    const a = s.Entries[i[0]];
    if (a.Kind !== "link")
      throw new q("invalid-argument", "serialisation is not a link");
    const o = crypto.randomUUID(), c = u(this, l, He).call(this, t.Id, r);
    return this.transact(() => {
      f(this, b).api.obj(["Entries"]).set({
        [o]: g.obj({
          Kind: g.con("link"),
          outerPlacement: g.val(g.con({ outerNoteId: t.Id, OrderKey: c })),
          Label: g.val(g.str(a.Label ?? "")),
          Info: g.obj({}),
          TargetId: g.con(a.TargetId ?? "")
        })
      }), u(this, l, ue).call(this, t.Id, o), a.TargetId != null && u(this, l, Je).call(this, a.TargetId, o), u(this, l, T).call(this, t.Id, "innerEntryList");
    }), u(this, l, It).call(this, o);
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
    const s = this._outerNoteIdOf(e.Id), i = u(this, l, He).call(this, t.Id, r);
    this.transact(() => {
      var a;
      if (f(this, b).api.val(["Entries", e.Id, "outerPlacement"]).set({ outerNoteId: t.Id, OrderKey: i }), s === $ && t.Id !== $) {
        const o = (a = u(this, l, C).call(this).Entries[e.Id]) == null ? void 0 : a.Info;
        o != null && "_trashedAt" in o && (f(this, b).api.obj(["Entries", e.Id, "Info"]).del(["_trashedAt"]), u(this, l, rr).call(this, e.Id), u(this, l, T).call(this, e.Id, "Info._trashedAt"));
      }
      s != null && (u(this, l, $e).call(this, s, e.Id), u(this, l, T).call(this, s, "innerEntryList")), u(this, l, ue).call(this, t.Id, e.Id), u(this, l, T).call(this, t.Id, "innerEntryList"), u(this, l, T).call(this, e.Id, "outerNote");
    });
  }
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new q("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), r = Fe(u(this, l, vt).call(this, $), null);
    this.transact(() => {
      f(this, b).api.val(["Entries", e.Id, "outerPlacement"]).set({ outerNoteId: $, OrderKey: r }), u(this, l, tr).call(this, e.Id), f(this, b).api.obj(["Entries", e.Id, "Info"]).set({ _trashedAt: g.val(g.json(Date.now())) }), t != null && (u(this, l, $e).call(this, t, e.Id), u(this, l, T).call(this, t, "innerEntryList")), u(this, l, ue).call(this, $, e.Id), u(this, l, T).call(this, $, "innerEntryList"), u(this, l, T).call(this, e.Id, "outerNote"), u(this, l, T).call(this, e.Id, "Info._trashedAt");
    });
  }
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== $)
      throw new q(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (u(this, l, Hr).call(this, e.Id))
      throw new q(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      u(this, l, er).call(this, e.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  // Immediately purges all trash entries whose `_trashedAt` timestamp is older
  // than `TrashTTLms`. Protected entries (those with incoming links from the
  // root-reachable tree) are silently skipped.
  // Returns the number of entries actually purged.
  // Can also be called manually regardless of whether `TrashTTLms` was set.
  purgeExpiredTrashEntries(e) {
    var o, c, h, d;
    const t = e ?? f(this, Pe);
    if (t == null)
      return 0;
    const r = Date.now(), s = u(this, l, C).call(this), i = Array.from(f(this, te).get($) ?? /* @__PURE__ */ new Set());
    let a = 0;
    for (const v of i) {
      if (((c = (o = s.Entries[v]) == null ? void 0 : o.outerPlacement) == null ? void 0 : c.outerNoteId) !== $)
        continue;
      const k = (d = (h = s.Entries[v]) == null ? void 0 : h.Info) == null ? void 0 : d._trashedAt;
      if (typeof k == "number" && !(r - k < t))
        try {
          this.purgeEntry(u(this, l, ft).call(this, v)), a++;
        } catch {
        }
    }
    return a;
  }
  // Stops the auto-purge timer (if running). Call when the store is no longer
  // needed and `TrashTTLms` was set in the constructor options.
  dispose() {
    f(this, Ee) != null && (clearInterval(f(this, Ee)), pe(this, Ee, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  transact(e) {
    Vt(this, Qe)._++;
    try {
      e();
    } finally {
      if (Vt(this, Qe)._--, f(this, Qe) === 0) {
        const t = f(this, b).api.flush();
        if (!f(this, De))
          try {
            const i = t.toBinary();
            i.byteLength > 0 && f(this, Xe).push(i);
          } catch {
          }
        const r = { ...f(this, Re) };
        pe(this, Re, {});
        const s = f(this, De) ? "external" : "internal";
        u(this, l, Gr).call(this, s, r);
      }
    }
  }
  onChangeInvoke(e) {
    return f(this, Ge).add(e), () => {
      f(this, Ge).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  applyRemotePatch(e) {
    pe(this, De, !0);
    try {
      this.transact(() => {
        const t = ns(e);
        for (const r of t) {
          const s = en.fromBinary(r);
          f(this, b).applyPatch(s);
        }
        u(this, l, Jr).call(this);
      });
    } finally {
      pe(this, De, !1);
    }
    this.recoverOrphans();
  }
  get currentCursor() {
    return ss(f(this, Xe).length);
  }
  exportPatch(e) {
    const t = e != null ? is(e) : 0, r = f(this, Xe).slice(t);
    return rs(r);
  }
  recoverOrphans() {
    const t = u(this, l, C).call(this).Entries, r = new Set(Object.keys(t));
    this.transact(() => {
      var s;
      for (const [i, a] of Object.entries(t)) {
        if (i === Ie)
          continue;
        const o = (s = a.outerPlacement) == null ? void 0 : s.outerNoteId;
        if (o != null && !r.has(o)) {
          const c = Fe(u(this, l, vt).call(this, ce), null);
          f(this, b).api.val(["Entries", i, "outerPlacement"]).set({ outerNoteId: ce, OrderKey: c }), u(this, l, ue).call(this, ce, i), u(this, l, T).call(this, i, "outerNote"), u(this, l, T).call(this, ce, "innerEntryList");
        }
        if (a.Kind === "link") {
          const c = a.TargetId;
          if (c != null && !r.has(c)) {
            const h = Fe(u(this, l, vt).call(this, ce), null);
            f(this, b).api.obj(["Entries"]).set({
              [c]: g.obj({
                Kind: g.con("note"),
                outerPlacement: g.val(g.con({ outerNoteId: ce, OrderKey: h })),
                Label: g.val(g.str("")),
                Info: g.obj({}),
                MIMEType: g.val(g.str("")),
                ValueKind: g.val(g.str("none"))
              })
            }), u(this, l, ue).call(this, ce, c), r.add(c), u(this, l, T).call(this, ce, "innerEntryList");
          }
        }
      }
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  asBinary() {
    return Jn(f(this, b).toBinary());
  }
  asJSON() {
    return Buffer.from(this.asBinary()).toString("base64");
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SNS_Entry / Note / Link             //
  //----------------------------------------------------------------------------//
  _KindOf(e) {
    const t = u(this, l, C).call(this).Entries[e];
    if (t == null)
      throw new q("not-found", `entry '${e}' not found`);
    return t.Kind;
  }
  _LabelOf(e) {
    var t;
    return ((t = u(this, l, C).call(this).Entries[e]) == null ? void 0 : t.Label) ?? "";
  }
  _setLabelOf(e, t) {
    ts.parse(t), this.transact(() => {
      f(this, b).api.val(["Entries", e, "Label"]).set(t), u(this, l, T).call(this, e, "Label");
    });
  }
  // Returns the MIME type for entry Id.  An empty string stored in the CRDT
  // means the default type ('text/plain') — this avoids storing the common
  // case redundantly across every note.
  _TypeOf(e) {
    var r;
    const t = ((r = u(this, l, C).call(this).Entries[e]) == null ? void 0 : r.MIMEType) ?? "";
    return t === "" ? bt : t;
  }
  _setTypeOf(e, t) {
    Ar.parse(t);
    const r = t === bt ? "" : t;
    this.transact(() => {
      f(this, b).api.val(["Entries", e, "MIMEType"]).set(r), u(this, l, T).call(this, e, "Type");
    });
  }
  _ValueKindOf(e) {
    var t;
    return ((t = u(this, l, C).call(this).Entries[e]) == null ? void 0 : t.ValueKind) ?? "none";
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
    var r, s;
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal":
        return ((r = u(this, l, C).call(this).Entries[e]) == null ? void 0 : r.literalValue) ?? "";
      case t === "binary":
        return (s = u(this, l, C).call(this).Entries[e]) == null ? void 0 : s.binaryValue;
      default:
        throw new q(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  _writeValueOf(e, t) {
    this.transact(() => {
      var r, s, i, a;
      switch (!0) {
        case t == null: {
          f(this, b).api.val(["Entries", e, "ValueKind"]).set("none");
          break;
        }
        case (typeof t == "string" && t.length <= f(this, wt)): {
          f(this, b).api.val(["Entries", e, "ValueKind"]).set("literal");
          const o = (r = u(this, l, C).call(this).Entries[e]) == null ? void 0 : r.literalValue;
          o == null ? f(this, b).api.obj(["Entries", e]).set({ literalValue: g.str(t) }) : (o.length > 0 && f(this, b).api.str(["Entries", e, "literalValue"]).del(0, o.length), t.length > 0 && f(this, b).api.str(["Entries", e, "literalValue"]).ins(0, t));
          break;
        }
        case typeof t == "string": {
          const c = new TextEncoder().encode(t), h = `sha256-size-${c.byteLength}`;
          f(this, b).api.val(["Entries", e, "ValueKind"]).set("literal-reference"), ((s = u(this, l, C).call(this).Entries[e]) == null ? void 0 : s.ValueRef) == null ? f(this, b).api.obj(["Entries", e]).set({ ValueRef: g.val(g.con({ Hash: h, Size: c.byteLength })) }) : f(this, b).api.val(["Entries", e, "ValueRef"]).set({ Hash: h, Size: c.byteLength });
          break;
        }
        case t.byteLength <= rn: {
          f(this, b).api.val(["Entries", e, "ValueKind"]).set("binary"), ((i = u(this, l, C).call(this).Entries[e]) == null ? void 0 : i.binaryValue) == null ? f(this, b).api.obj(["Entries", e]).set({ binaryValue: g.val(g.bin(t)) }) : f(this, b).api.val(["Entries", e, "binaryValue"]).set(t);
          break;
        }
        default: {
          const o = t, c = `sha256-size-${o.byteLength}`;
          f(this, b).api.val(["Entries", e, "ValueKind"]).set("binary-reference"), ((a = u(this, l, C).call(this).Entries[e]) == null ? void 0 : a.ValueRef) == null ? f(this, b).api.obj(["Entries", e]).set({ ValueRef: g.val(g.con({ Hash: c, Size: o.byteLength })) }) : f(this, b).api.val(["Entries", e, "ValueRef"]).set({ Hash: c, Size: o.byteLength });
          break;
        }
      }
      u(this, l, T).call(this, e, "Value");
    });
  }
  _spliceValueOf(e, t, r, s) {
    if (this._ValueKindOf(e) !== "literal")
      throw new q(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const i = r - t;
      i > 0 && f(this, b).api.str(["Entries", e, "literalValue"]).del(t, i), s.length > 0 && f(this, b).api.str(["Entries", e, "literalValue"]).ins(t, s), u(this, l, T).call(this, e, "Value");
    });
  }
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(r, s) {
        var i, a, o;
        if (typeof s == "string")
          return (o = (a = u(i = t, l, C).call(i).Entries[e]) == null ? void 0 : a.Info) == null ? void 0 : o[s];
      },
      set(r, s, i) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var a, o;
          u(a = t, l, tr).call(a, e), f(t, b).api.obj(["Entries", e, "Info"]).set({ [s]: g.val(g.json(i)) }), u(o = t, l, T).call(o, e, `Info.${s}`);
        }), !0);
      },
      deleteProperty(r, s) {
        return typeof s != "string" ? !1 : (t.transact(() => {
          var i, a;
          f(t, b).api.obj(["Entries", e, "Info"]).del([s]), u(i = t, l, rr).call(i, e), u(a = t, l, T).call(a, e, `Info.${s}`);
        }), !0);
      },
      ownKeys() {
        var r, s;
        return Object.keys(((s = u(r = t, l, C).call(r).Entries[e]) == null ? void 0 : s.Info) ?? {});
      },
      getOwnPropertyDescriptor(r, s) {
        var a, o, c;
        if (typeof s != "string")
          return;
        const i = (c = (o = u(a = t, l, C).call(a).Entries[e]) == null ? void 0 : o.Info) == null ? void 0 : c[s];
        return i !== void 0 ? { configurable: !0, enumerable: !0, value: i } : void 0;
      }
    });
  }
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? u(this, l, ge).call(this, t) : void 0;
  }
  _outerNoteIdOf(e) {
    var t, r;
    return (r = (t = u(this, l, C).call(this).Entries[e]) == null ? void 0 : t.outerPlacement) == null ? void 0 : r.outerNoteId;
  }
  _outerNotesOf(e) {
    const t = [];
    let r = this._outerNoteIdOf(e);
    for (; r != null && (t.push(u(this, l, ge).call(this, r)), r !== Ie); )
      r = this._outerNoteIdOf(r);
    return t;
  }
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  _innerEntriesOf(e) {
    const t = this, r = u(this, l, Et).call(this, e);
    return new Proxy([], {
      get(s, i) {
        var a;
        if (i === "length")
          return r.length;
        if (i === Symbol.iterator)
          return function* () {
            var o;
            for (let c = 0; c < r.length; c++)
              yield u(o = t, l, ft).call(o, r[c].Id);
          };
        if (typeof i == "string" && !isNaN(Number(i))) {
          const o = Number(i);
          return o >= 0 && o < r.length ? u(a = t, l, ft).call(a, r[o].Id) : void 0;
        }
        return s[i];
      }
    });
  }
  _mayMoveEntryTo(e, t, r) {
    return e === Ie || e === t ? !1 : e === $ || e === ce ? t === Ie : !u(this, l, Qr).call(this, t, e);
  }
  _mayDeleteEntry(e) {
    return e !== Ie && e !== $ && e !== ce;
  }
  _TargetOf(e) {
    var r;
    const t = (r = u(this, l, C).call(this).Entries[e]) == null ? void 0 : r.TargetId;
    if (t == null)
      throw new q("not-found", `link '${e}' has no target`);
    return u(this, l, ge).call(this, t);
  }
  _EntryAsJSON(e) {
    const t = u(this, l, C).call(this);
    if (t.Entries[e] == null)
      throw new q("not-found", `entry '${e}' not found`);
    const r = {};
    return u(this, l, nr).call(this, e, t, r), { Entries: r };
  }
};
b = new WeakMap(), wt = new WeakMap(), Pe = new WeakMap(), Ee = new WeakMap(), Ge = new WeakMap(), te = new WeakMap(), Ce = new WeakMap(), Ae = new WeakMap(), ye = new WeakMap(), _e = new WeakMap(), At = new WeakMap(), Qe = new WeakMap(), Re = new WeakMap(), Xe = new WeakMap(), De = new WeakMap(), l = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #view ****/
C = function() {
  return f(this, b).view();
}, /**** #requireNoteExists ****/
qe = function(e) {
  const t = u(this, l, C).call(this);
  if (t.Entries[e] == null || t.Entries[e].Kind !== "note")
    throw new q("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink ****/
ft = function(e) {
  const r = u(this, l, C).call(this).Entries[e];
  if (r == null)
    throw new q("invalid-argument", `entry '${e}' not found`);
  return r.Kind === "note" ? u(this, l, ge).call(this, e) : u(this, l, It).call(this, e);
}, ge = function(e) {
  const t = f(this, _e).get(e);
  if (t instanceof lr)
    return t;
  const r = new lr(this, e);
  return u(this, l, Gt).call(this, e, r), r;
}, It = function(e) {
  const t = f(this, _e).get(e);
  if (t instanceof cr)
    return t;
  const r = new cr(this, e);
  return u(this, l, Gt).call(this, e, r), r;
}, Gt = function(e, t) {
  if (f(this, _e).size >= f(this, At)) {
    const r = f(this, _e).keys().next().value;
    r != null && f(this, _e).delete(r);
  }
  f(this, _e).set(e, t);
}, /**** #rebuildIndices — full rebuild used during construction ****/
qr = function() {
  var t;
  f(this, te).clear(), f(this, Ce).clear(), f(this, Ae).clear(), f(this, ye).clear();
  const e = u(this, l, C).call(this);
  for (const [r, s] of Object.entries(e.Entries)) {
    const i = (t = s.outerPlacement) == null ? void 0 : t.outerNoteId;
    i != null && u(this, l, ue).call(this, i, r), s.Kind === "link" && s.TargetId != null && u(this, l, Je).call(this, s.TargetId, r);
  }
}, /**** #updateIndicesFromView — incremental diff update used after remote patches ****/
Jr = function() {
  var i;
  const e = u(this, l, C).call(this).Entries, t = /* @__PURE__ */ new Set();
  for (const [a, o] of Object.entries(e)) {
    t.add(a);
    const c = (i = o.outerPlacement) == null ? void 0 : i.outerNoteId, h = f(this, Ce).get(a);
    if (c !== h && (h != null && (u(this, l, $e).call(this, h, a), u(this, l, T).call(this, h, "innerEntryList")), c != null && (u(this, l, ue).call(this, c, a), u(this, l, T).call(this, c, "innerEntryList")), u(this, l, T).call(this, a, "outerNote")), o.Kind === "link") {
      const d = o.TargetId, v = f(this, ye).get(a);
      d !== v && (v != null && u(this, l, mt).call(this, v, a), d != null && u(this, l, Je).call(this, d, a));
    } else f(this, ye).has(a) && u(this, l, mt).call(this, f(this, ye).get(a), a);
    u(this, l, T).call(this, a, "Label");
  }
  const r = Array.from(f(this, Ce).entries()).filter(([a]) => !t.has(a));
  for (const [a, o] of r)
    u(this, l, $e).call(this, o, a), u(this, l, T).call(this, o, "innerEntryList");
  const s = Array.from(f(this, ye).entries()).filter(([a]) => !t.has(a));
  for (const [a, o] of s)
    u(this, l, mt).call(this, o, a);
}, ue = function(e, t) {
  let r = f(this, te).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), f(this, te).set(e, r)), r.add(t), f(this, Ce).set(t, e);
}, $e = function(e, t) {
  var r;
  (r = f(this, te).get(e)) == null || r.delete(t), f(this, Ce).delete(t);
}, Je = function(e, t) {
  let r = f(this, Ae).get(e);
  r == null && (r = /* @__PURE__ */ new Set(), f(this, Ae).set(e, r)), r.add(t), f(this, ye).set(t, e);
}, mt = function(e, t) {
  var r;
  (r = f(this, Ae).get(e)) == null || r.delete(t), f(this, ye).delete(t);
}, /**** #orderKeyAt ****/
He = function(e, t) {
  const r = u(this, l, Et).call(this, e);
  if (r.length === 0 || t == null) {
    const o = r.length > 0 ? r[r.length - 1].OrderKey : null;
    return Fe(o, null);
  }
  const s = Math.max(0, Math.min(t, r.length)), i = s > 0 ? r[s - 1].OrderKey : null, a = s < r.length ? r[s].OrderKey : null;
  return Fe(i, a);
}, vt = function(e) {
  const t = u(this, l, Et).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, Et = function(e) {
  var i;
  const t = u(this, l, C).call(this), r = f(this, te).get(e) ?? /* @__PURE__ */ new Set(), s = [];
  for (const a of r) {
    const o = (i = t.Entries[a]) == null ? void 0 : i.outerPlacement;
    (o == null ? void 0 : o.outerNoteId) === e && s.push({ Id: a, OrderKey: o.OrderKey });
  }
  return s.sort((a, o) => a.OrderKey < o.OrderKey ? -1 : a.OrderKey > o.OrderKey ? 1 : a.Id < o.Id ? -1 : a.Id > o.Id ? 1 : 0), s;
}, /**** #isProtected — check if a direct TrashNote child is protected ****/
Hr = function(e) {
  const t = u(this, l, Xt).call(this), r = /* @__PURE__ */ new Set();
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const i of f(this, te).get($) ?? /* @__PURE__ */ new Set())
      r.has(i) || u(this, l, Qt).call(this, i, t, r) && (r.add(i), s = !0);
  }
  return r.has(e);
}, Qt = function(e, t, r) {
  const s = [e], i = /* @__PURE__ */ new Set();
  for (; s.length > 0; ) {
    const a = s.pop();
    if (i.has(a))
      continue;
    i.add(a);
    const o = f(this, Ae).get(a) ?? /* @__PURE__ */ new Set();
    for (const c of o) {
      if (t.has(c))
        return !0;
      const h = u(this, l, Yr).call(this, c);
      if (h != null && r.has(h))
        return !0;
    }
    for (const c of f(this, te).get(a) ?? /* @__PURE__ */ new Set())
      i.has(c) || s.push(c);
  }
  return !1;
}, Yr = function(e) {
  let t = e;
  for (; t != null; ) {
    const r = this._outerNoteIdOf(t);
    if (r === $)
      return t;
    if (r === Ie || r == null)
      return null;
    t = r;
  }
  return null;
}, Xt = function() {
  const e = /* @__PURE__ */ new Set(), t = [Ie];
  for (; t.length > 0; ) {
    const r = t.pop();
    if (!e.has(r)) {
      e.add(r);
      for (const s of f(this, te).get(r) ?? /* @__PURE__ */ new Set())
        e.has(s) || t.push(s);
    }
  }
  return e;
}, /**** #purgeSubtree ****/
er = function(e) {
  var c;
  const r = u(this, l, C).call(this).Entries[e];
  if (r == null)
    return;
  const s = u(this, l, Xt).call(this), i = /* @__PURE__ */ new Set(), a = Array.from(f(this, te).get(e) ?? /* @__PURE__ */ new Set());
  for (const h of a)
    if (u(this, l, Qt).call(this, h, s, i)) {
      const d = Fe(u(this, l, vt).call(this, $), null);
      f(this, b).api.val(["Entries", h, "outerPlacement"]).set({ outerNoteId: $, OrderKey: d }), u(this, l, $e).call(this, e, h), u(this, l, ue).call(this, $, h), u(this, l, T).call(this, $, "innerEntryList"), u(this, l, T).call(this, h, "outerNote");
    } else
      u(this, l, er).call(this, h);
  f(this, b).api.obj(["Entries"]).del([e]);
  const o = (c = r.outerPlacement) == null ? void 0 : c.outerNoteId;
  o != null && (u(this, l, $e).call(this, o, e), u(this, l, T).call(this, o, "innerEntryList")), r.Kind === "link" && r.TargetId != null && u(this, l, mt).call(this, r.TargetId, e), f(this, _e).delete(e);
}, /**** #ensureInfoExists — creates the Info obj node if it has been removed ****/
tr = function(e) {
  var t;
  ((t = u(this, l, C).call(this).Entries[e]) == null ? void 0 : t.Info) == null && f(this, b).api.obj(["Entries", e]).set({ Info: g.obj({}) });
}, /**** #removeInfoIfEmpty — removes the Info obj node when it is empty ****/
rr = function(e) {
  var r;
  const t = (r = u(this, l, C).call(this).Entries[e]) == null ? void 0 : r.Info;
  t != null && Object.keys(t).length === 0 && f(this, b).api.obj(["Entries", e]).del(["Info"]);
}, /**** #recordChange ****/
T = function(e, t) {
  f(this, Re)[e] == null && (f(this, Re)[e] = /* @__PURE__ */ new Set()), f(this, Re)[e].add(t);
}, /**** #notifyHandlers ****/
Gr = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const r of f(this, Ge))
      try {
        r(e, t);
      } catch {
      }
}, nr = function(e, t, r) {
  r[e] = t.Entries[e];
  for (const s of f(this, te).get(e) ?? /* @__PURE__ */ new Set())
    u(this, l, nr).call(this, s, t, r);
}, Qr = function(e, t) {
  let r = e;
  for (; r != null; ) {
    if (r === t)
      return !0;
    r = this._outerNoteIdOf(r);
  }
  return !1;
};
let Rr = pt;
export {
  jr as SNS_Entry,
  fs as SNS_Error,
  cr as SNS_Link,
  lr as SNS_Note,
  Rr as SNS_NoteStore
};
