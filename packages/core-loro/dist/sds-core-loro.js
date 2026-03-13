var lr = (s) => {
  throw TypeError(s);
};
var Zt = (s, e, t) => e.has(s) || lr("Cannot " + t);
var g = (s, e, t) => (Zt(s, e, "read from private field"), t ? t.call(s) : e.get(s)), U = (s, e, t) => e.has(s) ? lr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), ge = (s, e, t, r) => (Zt(s, e, "write to private field"), r ? r.call(s, t) : e.set(s, t), t), d = (s, e, t) => (Zt(s, e, "access private method"), t);
var jt = (s, e, t, r) => ({
  set _(n) {
    ge(s, e, n, t);
  },
  get _() {
    return g(s, e, r);
  }
});
import { SDS_DataStore as sn, DefaultWrapperCacheSize as an, DefaultLiteralSizeLimit as on, RootId as ue, TrashId as V, LostAndFoundId as fe, SDS_Error as W, expectValidMIMEType as dr, DefaultMIMEType as He, SDS_Item as ur, SDS_Link as fr, maxOrderKeyLength as cn, expectValidLabel as ln, DefaultBinarySizeLimit as dn, expectValidInfoKey as un, checkInfoValueSize as fn, _base64ToUint8Array as jr } from "@rozek/sds-core";
import { SDS_Entry as fs, SDS_Error as hs, SDS_Item as ms, SDS_Link as gs } from "@rozek/sds-core";
import { Loro as Kt, LoroMap as E, LoroText as j, VersionVector as hn } from "loro-crdt";
var S;
(function(s) {
  s.assertEqual = (n) => {
  };
  function e(n) {
  }
  s.assertIs = e;
  function t(n) {
    throw new Error();
  }
  s.assertNever = t, s.arrayToEnum = (n) => {
    const a = {};
    for (const i of n)
      a[i] = i;
    return a;
  }, s.getValidEnumValues = (n) => {
    const a = s.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), i = {};
    for (const o of a)
      i[o] = n[o];
    return s.objectValues(i);
  }, s.objectValues = (n) => s.objectKeys(n).map(function(a) {
    return n[a];
  }), s.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const a = [];
    for (const i in n)
      Object.prototype.hasOwnProperty.call(n, i) && a.push(i);
    return a;
  }, s.find = (n, a) => {
    for (const i of n)
      if (a(i))
        return i;
  }, s.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function r(n, a = " | ") {
    return n.map((i) => typeof i == "string" ? `'${i}'` : i).join(a);
  }
  s.joinValues = r, s.jsonStringifyReplacer = (n, a) => typeof a == "bigint" ? a.toString() : a;
})(S || (S = {}));
var hr;
(function(s) {
  s.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(hr || (hr = {}));
const p = S.arrayToEnum([
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
]), Ne = (s) => {
  switch (typeof s) {
    case "undefined":
      return p.undefined;
    case "string":
      return p.string;
    case "number":
      return Number.isNaN(s) ? p.nan : p.number;
    case "boolean":
      return p.boolean;
    case "function":
      return p.function;
    case "bigint":
      return p.bigint;
    case "symbol":
      return p.symbol;
    case "object":
      return Array.isArray(s) ? p.array : s === null ? p.null : s.then && typeof s.then == "function" && s.catch && typeof s.catch == "function" ? p.promise : typeof Map < "u" && s instanceof Map ? p.map : typeof Set < "u" && s instanceof Set ? p.set : typeof Date < "u" && s instanceof Date ? p.date : p.object;
    default:
      return p.unknown;
  }
}, h = S.arrayToEnum([
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
    }, r = { _errors: [] }, n = (a) => {
      for (const i of a.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n);
        else if (i.code === "invalid_return_type")
          n(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n(i.argumentsError);
        else if (i.path.length === 0)
          r._errors.push(t(i));
        else {
          let o = r, c = 0;
          for (; c < i.path.length; ) {
            const u = i.path[c];
            c === i.path.length - 1 ? (o[u] = o[u] || { _errors: [] }, o[u]._errors.push(t(i))) : o[u] = o[u] || { _errors: [] }, o = o[u], c++;
          }
        }
    };
    return n(this), r;
  }
  static assert(e) {
    if (!(e instanceof Ce))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, S.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const a = n.path[0];
        t[a] = t[a] || [], t[a].push(e(n));
      } else
        r.push(e(n));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
Ce.create = (s) => new Ce(s);
const Bt = (s, e) => {
  let t;
  switch (s.code) {
    case h.invalid_type:
      s.received === p.undefined ? t = "Required" : t = `Expected ${s.expected}, received ${s.received}`;
      break;
    case h.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(s.expected, S.jsonStringifyReplacer)}`;
      break;
    case h.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${S.joinValues(s.keys, ", ")}`;
      break;
    case h.invalid_union:
      t = "Invalid input";
      break;
    case h.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${S.joinValues(s.options)}`;
      break;
    case h.invalid_enum_value:
      t = `Invalid enum value. Expected ${S.joinValues(s.options)}, received '${s.received}'`;
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
      typeof s.validation == "object" ? "includes" in s.validation ? (t = `Invalid input: must include "${s.validation.includes}"`, typeof s.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${s.validation.position}`)) : "startsWith" in s.validation ? t = `Invalid input: must start with "${s.validation.startsWith}"` : "endsWith" in s.validation ? t = `Invalid input: must end with "${s.validation.endsWith}"` : S.assertNever(s.validation) : s.validation !== "regex" ? t = `Invalid ${s.validation}` : t = "Invalid";
      break;
    case h.too_small:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "more than"} ${s.minimum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "over"} ${s.minimum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "bigint" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s.minimum))}` : t = "Invalid input";
      break;
    case h.too_big:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "less than"} ${s.maximum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "under"} ${s.maximum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "bigint" ? t = `BigInt must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly" : s.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s.maximum))}` : t = "Invalid input";
      break;
    case h.custom:
      t = "Invalid input";
      break;
    case h.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case h.not_multiple_of:
      t = `Number must be a multiple of ${s.multipleOf}`;
      break;
    case h.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, S.assertNever(s);
  }
  return { message: t };
};
let mn = Bt;
function gn() {
  return mn;
}
const vn = (s) => {
  const { data: e, path: t, errorMaps: r, issueData: n } = s, a = [...t, ...n.path || []], i = {
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
  const c = r.filter((u) => !!u).slice().reverse();
  for (const u of c)
    o = u(i, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: a,
    message: o
  };
};
function v(s, e) {
  const t = gn(), r = vn({
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
      t === Bt ? void 0 : Bt
      // then global default map
    ].filter((n) => !!n)
  });
  s.common.issues.push(r);
}
class le {
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
    for (const n of t) {
      if (n.status === "aborted")
        return _;
      n.status === "dirty" && e.dirty(), r.push(n.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const n of t) {
      const a = await n.key, i = await n.value;
      r.push({
        key: a,
        value: i
      });
    }
    return le.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const n of t) {
      const { key: a, value: i } = n;
      if (a.status === "aborted" || i.status === "aborted")
        return _;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || n.alwaysSet) && (r[a.value] = i.value);
    }
    return { status: e.value, value: r };
  }
}
const _ = Object.freeze({
  status: "aborted"
}), gt = (s) => ({ status: "dirty", value: s }), he = (s) => ({ status: "valid", value: s }), mr = (s) => s.status === "aborted", gr = (s) => s.status === "dirty", st = (s) => s.status === "valid", St = (s) => typeof Promise < "u" && s instanceof Promise;
var y;
(function(s) {
  s.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(y || (y = {}));
class je {
  constructor(e, t, r, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const vr = (s, e) => {
  if (st(e))
    return { success: !0, data: e.value };
  if (!s.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Ce(s.common.issues);
      return this._error = t, this._error;
    }
  };
};
function b(s) {
  if (!s)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: n } = s;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (i, o) => {
    const { message: c } = s;
    return i.code === "invalid_enum_value" ? { message: c ?? o.defaultError } : typeof o.data > "u" ? { message: c ?? r ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: c ?? t ?? o.defaultError };
  }, description: n };
}
class O {
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
      status: new le(),
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
    }, n = this._parseSync({ data: e, path: r.path, parent: r });
    return vr(r, n);
  }
  "~validate"(e) {
    var r, n;
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
        const a = this._parseSync({ data: e, path: [], parent: t });
        return st(a) ? {
          value: a.value
        } : {
          issues: t.common.issues
        };
      } catch (a) {
        (n = (r = a == null ? void 0 : a.message) == null ? void 0 : r.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((a) => st(a) ? {
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
      parsedType: Ne(e)
    }, n = this._parse({ data: e, path: r.path, parent: r }), a = await (St(n) ? n : Promise.resolve(n));
    return vr(r, a);
  }
  refine(e, t) {
    const r = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, a) => {
      const i = e(n), o = () => a.addIssue({
        code: h.custom,
        ...r(n)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((c) => c ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, n) => e(r) ? !0 : (n.addIssue(typeof t == "function" ? t(r, n) : t), !1));
  }
  _refinement(e) {
    return new ot({
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
    return Ze.create(this, this._def);
  }
  nullable() {
    return ct.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ke.create(this);
  }
  promise() {
    return Lt.create(this, this._def);
  }
  or(e) {
    return Et.create([this, e], this._def);
  }
  and(e) {
    return At.create(this, e, this._def);
  }
  transform(e) {
    return new ot({
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
    return new $n({
      typeName: w.ZodBranded,
      type: this,
      ...b(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Wt({
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
    return ir.create(this, e);
  }
  readonly() {
    return Jt.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const pn = /^c[^\s-]{8,}$/i, yn = /^[0-9a-z]+$/, _n = /^[0-9A-HJKMNP-TV-Z]{26}$/i, wn = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, xn = /^[a-z0-9_-]{21}$/i, kn = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, bn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, In = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Tn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let $t;
const On = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Sn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Cn = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, En = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, An = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Ln = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Kr = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Nn = new RegExp(`^${Kr}$`);
function $r(s) {
  let e = "[0-5]\\d";
  s.precision ? e = `${e}\\.\\d{${s.precision}}` : s.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = s.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Mn(s) {
  return new RegExp(`^${$r(s)}$`);
}
function Rn(s) {
  let e = `${Kr}T${$r(s)}`;
  const t = [];
  return t.push(s.local ? "Z?" : "Z"), s.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Vn(s, e) {
  return !!((e === "v4" || !e) && On.test(s) || (e === "v6" || !e) && Cn.test(s));
}
function Zn(s, e) {
  if (!kn.test(s))
    return !1;
  try {
    const [t] = s.split(".");
    if (!t)
      return !1;
    const r = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(r));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function jn(s, e) {
  return !!((e === "v4" || !e) && Sn.test(s) || (e === "v6" || !e) && En.test(s));
}
class Pe extends O {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== p.string) {
      const a = this._getOrReturnCtx(e);
      return v(a, {
        code: h.invalid_type,
        expected: p.string,
        received: a.parsedType
      }), _;
    }
    const r = new le();
    let n;
    for (const a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (n = this._getOrReturnCtx(e, n), v(n, {
          code: h.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (n = this._getOrReturnCtx(e, n), v(n, {
          code: h.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "length") {
        const i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (n = this._getOrReturnCtx(e, n), i ? v(n, {
          code: h.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }) : o && v(n, {
          code: h.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }), r.dirty());
      } else if (a.kind === "email")
        In.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "email",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "emoji")
        $t || ($t = new RegExp(Tn, "u")), $t.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "emoji",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "uuid")
        wn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "uuid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "nanoid")
        xn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "nanoid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid")
        pn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "cuid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid2")
        yn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "cuid2",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "ulid")
        _n.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
          validation: "ulid",
          code: h.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), v(n, {
            validation: "url",
            code: h.invalid_string,
            message: a.message
          }), r.dirty();
        }
      else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "regex",
        code: h.invalid_string,
        message: a.message
      }), r.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: { includes: a.value, position: a.position },
        message: a.message
      }), r.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: { startsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: { endsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "datetime" ? Rn(a).test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: "datetime",
        message: a.message
      }), r.dirty()) : a.kind === "date" ? Nn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: "date",
        message: a.message
      }), r.dirty()) : a.kind === "time" ? Mn(a).test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.invalid_string,
        validation: "time",
        message: a.message
      }), r.dirty()) : a.kind === "duration" ? bn.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "duration",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "ip" ? Vn(e.data, a.version) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "ip",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "jwt" ? Zn(e.data, a.alg) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "jwt",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "cidr" ? jn(e.data, a.version) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "cidr",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64" ? An.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "base64",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64url" ? Ln.test(e.data) || (n = this._getOrReturnCtx(e, n), v(n, {
        validation: "base64url",
        code: h.invalid_string,
        message: a.message
      }), r.dirty()) : S.assertNever(a);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: h.invalid_string,
      ...y.errToObj(r)
    });
  }
  _addCheck(e) {
    return new Pe({
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
    return new Pe({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new Pe({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new Pe({
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
Pe.create = (s) => new Pe({
  checks: [],
  typeName: w.ZodString,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...b(s)
});
function Kn(s, e) {
  const t = (s.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, n = t > r ? t : r, a = Number.parseInt(s.toFixed(n).replace(".", "")), i = Number.parseInt(e.toFixed(n).replace(".", ""));
  return a % i / 10 ** n;
}
class at extends O {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== p.number) {
      const a = this._getOrReturnCtx(e);
      return v(a, {
        code: h.invalid_type,
        expected: p.number,
        received: a.parsedType
      }), _;
    }
    let r;
    const n = new le();
    for (const a of this._def.checks)
      a.kind === "int" ? S.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.invalid_type,
        expected: "integer",
        received: "float",
        message: a.message
      }), n.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.too_small,
        minimum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.too_big,
        maximum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? Kn(e.data, a.value) !== 0 && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.not_finite,
        message: a.message
      }), n.dirty()) : S.assertNever(a);
    return { status: n.value, value: e.data };
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
  setLimit(e, t, r, n) {
    return new at({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: y.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new at({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && S.isInteger(e.value));
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
at.create = (s) => new at({
  checks: [],
  typeName: w.ZodNumber,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...b(s)
});
class wt extends O {
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
    if (this._getType(e) !== p.bigint)
      return this._getInvalidInput(e);
    let r;
    const n = new le();
    for (const a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.too_small,
        type: "bigint",
        minimum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.too_big,
        type: "bigint",
        maximum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), v(r, {
        code: h.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : S.assertNever(a);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return v(t, {
      code: h.invalid_type,
      expected: p.bigint,
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
  setLimit(e, t, r, n) {
    return new wt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: y.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new wt({
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
wt.create = (s) => new wt({
  checks: [],
  typeName: w.ZodBigInt,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...b(s)
});
class pr extends O {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== p.boolean) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.boolean,
        received: r.parsedType
      }), _;
    }
    return he(e.data);
  }
}
pr.create = (s) => new pr({
  typeName: w.ZodBoolean,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...b(s)
});
class Ct extends O {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== p.date) {
      const a = this._getOrReturnCtx(e);
      return v(a, {
        code: h.invalid_type,
        expected: p.date,
        received: a.parsedType
      }), _;
    }
    if (Number.isNaN(e.data.getTime())) {
      const a = this._getOrReturnCtx(e);
      return v(a, {
        code: h.invalid_date
      }), _;
    }
    const r = new le();
    let n;
    for (const a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.too_small,
        message: a.message,
        inclusive: !0,
        exact: !1,
        minimum: a.value,
        type: "date"
      }), r.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (n = this._getOrReturnCtx(e, n), v(n, {
        code: h.too_big,
        message: a.message,
        inclusive: !0,
        exact: !1,
        maximum: a.value,
        type: "date"
      }), r.dirty()) : S.assertNever(a);
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
Ct.create = (s) => new Ct({
  checks: [],
  coerce: (s == null ? void 0 : s.coerce) || !1,
  typeName: w.ZodDate,
  ...b(s)
});
class yr extends O {
  _parse(e) {
    if (this._getType(e) !== p.symbol) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.symbol,
        received: r.parsedType
      }), _;
    }
    return he(e.data);
  }
}
yr.create = (s) => new yr({
  typeName: w.ZodSymbol,
  ...b(s)
});
class _r extends O {
  _parse(e) {
    if (this._getType(e) !== p.undefined) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.undefined,
        received: r.parsedType
      }), _;
    }
    return he(e.data);
  }
}
_r.create = (s) => new _r({
  typeName: w.ZodUndefined,
  ...b(s)
});
class wr extends O {
  _parse(e) {
    if (this._getType(e) !== p.null) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.null,
        received: r.parsedType
      }), _;
    }
    return he(e.data);
  }
}
wr.create = (s) => new wr({
  typeName: w.ZodNull,
  ...b(s)
});
class xr extends O {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return he(e.data);
  }
}
xr.create = (s) => new xr({
  typeName: w.ZodAny,
  ...b(s)
});
class kr extends O {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return he(e.data);
  }
}
kr.create = (s) => new kr({
  typeName: w.ZodUnknown,
  ...b(s)
});
class Ke extends O {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return v(t, {
      code: h.invalid_type,
      expected: p.never,
      received: t.parsedType
    }), _;
  }
}
Ke.create = (s) => new Ke({
  typeName: w.ZodNever,
  ...b(s)
});
class br extends O {
  _parse(e) {
    if (this._getType(e) !== p.undefined) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.void,
        received: r.parsedType
      }), _;
    }
    return he(e.data);
  }
}
br.create = (s) => new br({
  typeName: w.ZodVoid,
  ...b(s)
});
class ke extends O {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== p.array)
      return v(t, {
        code: h.invalid_type,
        expected: p.array,
        received: t.parsedType
      }), _;
    if (n.exactLength !== null) {
      const i = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (i || o) && (v(t, {
        code: i ? h.too_big : h.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: i ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), r.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (v(t, {
      code: h.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), r.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (v(t, {
      code: h.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => n.type._parseAsync(new je(t, i, t.path, o)))).then((i) => le.mergeArray(r, i));
    const a = [...t.data].map((i, o) => n.type._parseSync(new je(t, i, t.path, o)));
    return le.mergeArray(r, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ke({
      ...this._def,
      minLength: { value: e, message: y.toString(t) }
    });
  }
  max(e, t) {
    return new ke({
      ...this._def,
      maxLength: { value: e, message: y.toString(t) }
    });
  }
  length(e, t) {
    return new ke({
      ...this._def,
      exactLength: { value: e, message: y.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ke.create = (s, e) => new ke({
  type: s,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: w.ZodArray,
  ...b(e)
});
function Ye(s) {
  if (s instanceof K) {
    const e = {};
    for (const t in s.shape) {
      const r = s.shape[t];
      e[t] = Ze.create(Ye(r));
    }
    return new K({
      ...s._def,
      shape: () => e
    });
  } else return s instanceof ke ? new ke({
    ...s._def,
    type: Ye(s.element)
  }) : s instanceof Ze ? Ze.create(Ye(s.unwrap())) : s instanceof ct ? ct.create(Ye(s.unwrap())) : s instanceof Ue ? Ue.create(s.items.map((e) => Ye(e))) : s;
}
class K extends O {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = S.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== p.object) {
      const u = this._getOrReturnCtx(e);
      return v(u, {
        code: h.invalid_type,
        expected: p.object,
        received: u.parsedType
      }), _;
    }
    const { status: r, ctx: n } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Ke && this._def.unknownKeys === "strip"))
      for (const u in n.data)
        i.includes(u) || o.push(u);
    const c = [];
    for (const u of i) {
      const f = a[u], m = n.data[u];
      c.push({
        key: { status: "valid", value: u },
        value: f._parse(new je(n, m, n.path, u)),
        alwaysSet: u in n.data
      });
    }
    if (this._def.catchall instanceof Ke) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const f of o)
          c.push({
            key: { status: "valid", value: f },
            value: { status: "valid", value: n.data[f] }
          });
      else if (u === "strict")
        o.length > 0 && (v(n, {
          code: h.unrecognized_keys,
          keys: o
        }), r.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const f of o) {
        const m = n.data[f];
        c.push({
          key: { status: "valid", value: f },
          value: u._parse(
            new je(n, m, n.path, f)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: f in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const f of c) {
        const m = await f.key, x = await f.value;
        u.push({
          key: m,
          value: x,
          alwaysSet: f.alwaysSet
        });
      }
      return u;
    }).then((u) => le.mergeObjectSync(r, u)) : le.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return y.errToObj, new K({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var a, i;
          const n = ((i = (a = this._def).errorMap) == null ? void 0 : i.call(a, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: y.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new K({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new K({
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
    return new K({
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
    return new K({
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
    return new K({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of S.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new K({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of S.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new K({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Ye(this);
  }
  partial(e) {
    const t = {};
    for (const r of S.objectKeys(this.shape)) {
      const n = this.shape[r];
      e && !e[r] ? t[r] = n : t[r] = n.optional();
    }
    return new K({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of S.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let a = this.shape[r];
        for (; a instanceof Ze; )
          a = a._def.innerType;
        t[r] = a;
      }
    return new K({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Dr(S.objectKeys(this.shape));
  }
}
K.create = (s, e) => new K({
  shape: () => s,
  unknownKeys: "strip",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
K.strictCreate = (s, e) => new K({
  shape: () => s,
  unknownKeys: "strict",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
K.lazycreate = (s, e) => new K({
  shape: s,
  unknownKeys: "strip",
  catchall: Ke.create(),
  typeName: w.ZodObject,
  ...b(e)
});
class Et extends O {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function n(a) {
      for (const o of a)
        if (o.result.status === "valid")
          return o.result;
      for (const o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = a.map((o) => new Ce(o.ctx.common.issues));
      return v(t, {
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
      })).then(n);
    {
      let a;
      const i = [];
      for (const c of r) {
        const u = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, f = c._parseSync({
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
      const o = i.map((c) => new Ce(c));
      return v(t, {
        code: h.invalid_union,
        unionErrors: o
      }), _;
    }
  }
  get options() {
    return this._def.options;
  }
}
Et.create = (s, e) => new Et({
  options: s,
  typeName: w.ZodUnion,
  ...b(e)
});
function Ft(s, e) {
  const t = Ne(s), r = Ne(e);
  if (s === e)
    return { valid: !0, data: s };
  if (t === p.object && r === p.object) {
    const n = S.objectKeys(e), a = S.objectKeys(s).filter((o) => n.indexOf(o) !== -1), i = { ...s, ...e };
    for (const o of a) {
      const c = Ft(s[o], e[o]);
      if (!c.valid)
        return { valid: !1 };
      i[o] = c.data;
    }
    return { valid: !0, data: i };
  } else if (t === p.array && r === p.array) {
    if (s.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let a = 0; a < s.length; a++) {
      const i = s[a], o = e[a], c = Ft(i, o);
      if (!c.valid)
        return { valid: !1 };
      n.push(c.data);
    }
    return { valid: !0, data: n };
  } else return t === p.date && r === p.date && +s == +e ? { valid: !0, data: s } : { valid: !1 };
}
class At extends O {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = (a, i) => {
      if (mr(a) || mr(i))
        return _;
      const o = Ft(a.value, i.value);
      return o.valid ? ((gr(a) || gr(i)) && t.dirty(), { status: t.value, value: o.data }) : (v(r, {
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
    ]).then(([a, i]) => n(a, i)) : n(this._def.left._parseSync({
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
At.create = (s, e, t) => new At({
  left: s,
  right: e,
  typeName: w.ZodIntersection,
  ...b(t)
});
class Ue extends O {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== p.array)
      return v(r, {
        code: h.invalid_type,
        expected: p.array,
        received: r.parsedType
      }), _;
    if (r.data.length < this._def.items.length)
      return v(r, {
        code: h.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), _;
    !this._def.rest && r.data.length > this._def.items.length && (v(r, {
      code: h.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const a = [...r.data].map((i, o) => {
      const c = this._def.items[o] || this._def.rest;
      return c ? c._parse(new je(r, i, r.path, o)) : null;
    }).filter((i) => !!i);
    return r.common.async ? Promise.all(a).then((i) => le.mergeArray(t, i)) : le.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Ue({
      ...this._def,
      rest: e
    });
  }
}
Ue.create = (s, e) => {
  if (!Array.isArray(s))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ue({
    items: s,
    typeName: w.ZodTuple,
    rest: null,
    ...b(e)
  });
};
class Ir extends O {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== p.map)
      return v(r, {
        code: h.invalid_type,
        expected: p.map,
        received: r.parsedType
      }), _;
    const n = this._def.keyType, a = this._def.valueType, i = [...r.data.entries()].map(([o, c], u) => ({
      key: n._parse(new je(r, o, r.path, [u, "key"])),
      value: a._parse(new je(r, c, r.path, [u, "value"]))
    }));
    if (r.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of i) {
          const u = await c.key, f = await c.value;
          if (u.status === "aborted" || f.status === "aborted")
            return _;
          (u.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(u.value, f.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const c of i) {
        const u = c.key, f = c.value;
        if (u.status === "aborted" || f.status === "aborted")
          return _;
        (u.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(u.value, f.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Ir.create = (s, e, t) => new Ir({
  valueType: e,
  keyType: s,
  typeName: w.ZodMap,
  ...b(t)
});
class xt extends O {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== p.set)
      return v(r, {
        code: h.invalid_type,
        expected: p.set,
        received: r.parsedType
      }), _;
    const n = this._def;
    n.minSize !== null && r.data.size < n.minSize.value && (v(r, {
      code: h.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && r.data.size > n.maxSize.value && (v(r, {
      code: h.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const a = this._def.valueType;
    function i(c) {
      const u = /* @__PURE__ */ new Set();
      for (const f of c) {
        if (f.status === "aborted")
          return _;
        f.status === "dirty" && t.dirty(), u.add(f.value);
      }
      return { status: t.value, value: u };
    }
    const o = [...r.data.values()].map((c, u) => a._parse(new je(r, c, r.path, u)));
    return r.common.async ? Promise.all(o).then((c) => i(c)) : i(o);
  }
  min(e, t) {
    return new xt({
      ...this._def,
      minSize: { value: e, message: y.toString(t) }
    });
  }
  max(e, t) {
    return new xt({
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
xt.create = (s, e) => new xt({
  valueType: s,
  minSize: null,
  maxSize: null,
  typeName: w.ZodSet,
  ...b(e)
});
class Tr extends O {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Tr.create = (s, e) => new Tr({
  getter: s,
  typeName: w.ZodLazy,
  ...b(e)
});
class Or extends O {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return v(t, {
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
Or.create = (s, e) => new Or({
  value: s,
  typeName: w.ZodLiteral,
  ...b(e)
});
function Dr(s, e) {
  return new it({
    values: s,
    typeName: w.ZodEnum,
    ...b(e)
  });
}
class it extends O {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return v(t, {
        expected: S.joinValues(r),
        received: t.parsedType,
        code: h.invalid_type
      }), _;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return v(t, {
        received: t.data,
        code: h.invalid_enum_value,
        options: r
      }), _;
    }
    return he(e.data);
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
    return it.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return it.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
it.create = Dr;
class Sr extends O {
  _parse(e) {
    const t = S.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== p.string && r.parsedType !== p.number) {
      const n = S.objectValues(t);
      return v(r, {
        expected: S.joinValues(n),
        received: r.parsedType,
        code: h.invalid_type
      }), _;
    }
    if (this._cache || (this._cache = new Set(S.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = S.objectValues(t);
      return v(r, {
        received: r.data,
        code: h.invalid_enum_value,
        options: n
      }), _;
    }
    return he(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Sr.create = (s, e) => new Sr({
  values: s,
  typeName: w.ZodNativeEnum,
  ...b(e)
});
class Lt extends O {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== p.promise && t.common.async === !1)
      return v(t, {
        code: h.invalid_type,
        expected: p.promise,
        received: t.parsedType
      }), _;
    const r = t.parsedType === p.promise ? t.data : Promise.resolve(t.data);
    return he(r.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Lt.create = (s, e) => new Lt({
  type: s,
  typeName: w.ZodPromise,
  ...b(e)
});
class ot extends O {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === w.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = this._def.effect || null, a = {
      addIssue: (i) => {
        v(r, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (a.addIssue = a.addIssue.bind(a), n.type === "preprocess") {
      const i = n.transform(r.data, a);
      if (r.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return _;
          const c = await this._def.schema._parseAsync({
            data: o,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? _ : c.status === "dirty" || t.value === "dirty" ? gt(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return _;
        const o = this._def.schema._parseSync({
          data: i,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? _ : o.status === "dirty" || t.value === "dirty" ? gt(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const i = (o) => {
        const c = n.refinement(o, a);
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
        return o.status === "aborted" ? _ : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? _ : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (r.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!st(i))
          return _;
        const o = n.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((i) => st(i) ? Promise.resolve(n.transform(i.value, a)).then((o) => ({
          status: t.value,
          value: o
        })) : _);
    S.assertNever(n);
  }
}
ot.create = (s, e, t) => new ot({
  schema: s,
  typeName: w.ZodEffects,
  effect: e,
  ...b(t)
});
ot.createWithPreprocess = (s, e, t) => new ot({
  schema: e,
  effect: { type: "preprocess", transform: s },
  typeName: w.ZodEffects,
  ...b(t)
});
class Ze extends O {
  _parse(e) {
    return this._getType(e) === p.undefined ? he(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ze.create = (s, e) => new Ze({
  innerType: s,
  typeName: w.ZodOptional,
  ...b(e)
});
class ct extends O {
  _parse(e) {
    return this._getType(e) === p.null ? he(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ct.create = (s, e) => new ct({
  innerType: s,
  typeName: w.ZodNullable,
  ...b(e)
});
class Ut extends O {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === p.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Ut.create = (s, e) => new Ut({
  innerType: s,
  typeName: w.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...b(e)
});
class Wt extends O {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: r.data,
      path: r.path,
      parent: {
        ...r
      }
    });
    return St(n) ? n.then((a) => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new Ce(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
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
Wt.create = (s, e) => new Wt({
  innerType: s,
  typeName: w.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...b(e)
});
class Cr extends O {
  _parse(e) {
    if (this._getType(e) !== p.nan) {
      const r = this._getOrReturnCtx(e);
      return v(r, {
        code: h.invalid_type,
        expected: p.nan,
        received: r.parsedType
      }), _;
    }
    return { status: "valid", value: e.data };
  }
}
Cr.create = (s) => new Cr({
  typeName: w.ZodNaN,
  ...b(s)
});
class $n extends O {
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
class ir extends O {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const a = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? _ : a.status === "dirty" ? (t.dirty(), gt(a.value)) : this._def.out._parseAsync({
          data: a.value,
          path: r.path,
          parent: r
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return n.status === "aborted" ? _ : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: r.path,
        parent: r
      });
    }
  }
  static create(e, t) {
    return new ir({
      in: e,
      out: t,
      typeName: w.ZodPipeline
    });
  }
}
class Jt extends O {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (n) => (st(n) && (n.value = Object.freeze(n.value)), n);
    return St(t) ? t.then((n) => r(n)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Jt.create = (s, e) => new Jt({
  innerType: s,
  typeName: w.ZodReadonly,
  ...b(e)
});
var w;
(function(s) {
  s.ZodString = "ZodString", s.ZodNumber = "ZodNumber", s.ZodNaN = "ZodNaN", s.ZodBigInt = "ZodBigInt", s.ZodBoolean = "ZodBoolean", s.ZodDate = "ZodDate", s.ZodSymbol = "ZodSymbol", s.ZodUndefined = "ZodUndefined", s.ZodNull = "ZodNull", s.ZodAny = "ZodAny", s.ZodUnknown = "ZodUnknown", s.ZodNever = "ZodNever", s.ZodVoid = "ZodVoid", s.ZodArray = "ZodArray", s.ZodObject = "ZodObject", s.ZodUnion = "ZodUnion", s.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s.ZodIntersection = "ZodIntersection", s.ZodTuple = "ZodTuple", s.ZodRecord = "ZodRecord", s.ZodMap = "ZodMap", s.ZodSet = "ZodSet", s.ZodFunction = "ZodFunction", s.ZodLazy = "ZodLazy", s.ZodLiteral = "ZodLiteral", s.ZodEnum = "ZodEnum", s.ZodEffects = "ZodEffects", s.ZodNativeEnum = "ZodNativeEnum", s.ZodOptional = "ZodOptional", s.ZodNullable = "ZodNullable", s.ZodDefault = "ZodDefault", s.ZodCatch = "ZodCatch", s.ZodPromise = "ZodPromise", s.ZodBranded = "ZodBranded", s.ZodPipeline = "ZodPipeline", s.ZodReadonly = "ZodReadonly";
})(w || (w = {}));
const Dn = at.create;
Ke.create;
ke.create;
Et.create;
At.create;
Ue.create;
it.create;
Lt.create;
Ze.create;
ct.create;
var J = Uint8Array, ce = Uint16Array, or = Int32Array, Mt = new J([
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
]), Rt = new J([
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
]), qt = new J([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), zr = function(s, e) {
  for (var t = new ce(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << s[r - 1];
  for (var n = new or(t[30]), r = 1; r < 30; ++r)
    for (var a = t[r]; a < t[r + 1]; ++a)
      n[a] = a - t[r] << 5 | r;
  return { b: t, r: n };
}, Pr = zr(Mt, 2), Br = Pr.b, Ht = Pr.r;
Br[28] = 258, Ht[258] = 28;
var Fr = zr(Rt, 0), zn = Fr.b, Er = Fr.r, Yt = new ce(32768);
for (var L = 0; L < 32768; ++L) {
  var Ae = (L & 43690) >> 1 | (L & 21845) << 1;
  Ae = (Ae & 52428) >> 2 | (Ae & 13107) << 2, Ae = (Ae & 61680) >> 4 | (Ae & 3855) << 4, Yt[L] = ((Ae & 65280) >> 8 | (Ae & 255) << 8) >> 1;
}
var be = (function(s, e, t) {
  for (var r = s.length, n = 0, a = new ce(e); n < r; ++n)
    s[n] && ++a[s[n] - 1];
  var i = new ce(e);
  for (n = 1; n < e; ++n)
    i[n] = i[n - 1] + a[n - 1] << 1;
  var o;
  if (t) {
    o = new ce(1 << e);
    var c = 15 - e;
    for (n = 0; n < r; ++n)
      if (s[n])
        for (var u = n << 4 | s[n], f = e - s[n], m = i[s[n] - 1]++ << f, x = m | (1 << f) - 1; m <= x; ++m)
          o[Yt[m] >> c] = u;
  } else
    for (o = new ce(r), n = 0; n < r; ++n)
      s[n] && (o[n] = Yt[i[s[n] - 1]++] >> 15 - s[n]);
  return o;
}), $e = new J(288);
for (var L = 0; L < 144; ++L)
  $e[L] = 8;
for (var L = 144; L < 256; ++L)
  $e[L] = 9;
for (var L = 256; L < 280; ++L)
  $e[L] = 7;
for (var L = 280; L < 288; ++L)
  $e[L] = 8;
var kt = new J(32);
for (var L = 0; L < 32; ++L)
  kt[L] = 5;
var Pn = /* @__PURE__ */ be($e, 9, 0), Bn = /* @__PURE__ */ be($e, 9, 1), Fn = /* @__PURE__ */ be(kt, 5, 0), Un = /* @__PURE__ */ be(kt, 5, 1), Dt = function(s) {
  for (var e = s[0], t = 1; t < s.length; ++t)
    s[t] > e && (e = s[t]);
  return e;
}, ve = function(s, e, t) {
  var r = e / 8 | 0;
  return (s[r] | s[r + 1] << 8) >> (e & 7) & t;
}, zt = function(s, e) {
  var t = e / 8 | 0;
  return (s[t] | s[t + 1] << 8 | s[t + 2] << 16) >> (e & 7);
}, cr = function(s) {
  return (s + 7) / 8 | 0;
}, Ur = function(s, e, t) {
  return (t == null || t > s.length) && (t = s.length), new J(s.subarray(e, t));
}, Wn = [
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
], pe = function(s, e, t) {
  var r = new Error(e || Wn[s]);
  if (r.code = s, Error.captureStackTrace && Error.captureStackTrace(r, pe), !t)
    throw r;
  return r;
}, Jn = function(s, e, t, r) {
  var n = s.length, a = 0;
  if (!n || e.f && !e.l)
    return t || new J(0);
  var i = !t, o = i || e.i != 2, c = e.i;
  i && (t = new J(n * 3));
  var u = function(dt) {
    var ut = t.length;
    if (dt > ut) {
      var qe = new J(Math.max(ut * 2, dt));
      qe.set(t), t = qe;
    }
  }, f = e.f || 0, m = e.p || 0, x = e.b || 0, A = e.l, $ = e.d, N = e.m, Q = e.n, me = n * 8;
  do {
    if (!A) {
      f = ve(s, m, 1);
      var re = ve(s, m + 1, 3);
      if (m += 3, re)
        if (re == 1)
          A = Bn, $ = Un, N = 9, Q = 5;
        else if (re == 2) {
          var G = ve(s, m, 31) + 257, z = ve(s, m + 10, 15) + 4, C = G + ve(s, m + 5, 31) + 1;
          m += 14;
          for (var k = new J(C), P = new J(19), Z = 0; Z < z; ++Z)
            P[qt[Z]] = ve(s, m + Z * 3, 7);
          m += z * 3;
          for (var H = Dt(P), Ee = (1 << H) - 1, ne = be(P, H, 1), Z = 0; Z < C; ) {
            var X = ne[ve(s, m, Ee)];
            m += X & 15;
            var D = X >> 4;
            if (D < 16)
              k[Z++] = D;
            else {
              var B = 0, M = 0;
              for (D == 16 ? (M = 3 + ve(s, m, 3), m += 2, B = k[Z - 1]) : D == 17 ? (M = 3 + ve(s, m, 7), m += 3) : D == 18 && (M = 11 + ve(s, m, 127), m += 7); M--; )
                k[Z++] = B;
            }
          }
          var ee = k.subarray(0, G), F = k.subarray(G);
          N = Dt(ee), Q = Dt(F), A = be(ee, N, 1), $ = be(F, Q, 1);
        } else
          pe(1);
      else {
        var D = cr(m) + 4, Y = s[D - 4] | s[D - 3] << 8, q = D + Y;
        if (q > n) {
          c && pe(0);
          break;
        }
        o && u(x + Y), t.set(s.subarray(D, q), x), e.b = x += Y, e.p = m = q * 8, e.f = f;
        continue;
      }
      if (m > me) {
        c && pe(0);
        break;
      }
    }
    o && u(x + 131072);
    for (var lt = (1 << N) - 1, de = (1 << Q) - 1, Ie = m; ; Ie = m) {
      var B = A[zt(s, m) & lt], se = B >> 4;
      if (m += B & 15, m > me) {
        c && pe(0);
        break;
      }
      if (B || pe(2), se < 256)
        t[x++] = se;
      else if (se == 256) {
        Ie = m, A = null;
        break;
      } else {
        var ae = se - 254;
        if (se > 264) {
          var Z = se - 257, R = Mt[Z];
          ae = ve(s, m, (1 << R) - 1) + Br[Z], m += R;
        }
        var ye = $[zt(s, m) & de], We = ye >> 4;
        ye || pe(3), m += ye & 15;
        var F = zn[We];
        if (We > 3) {
          var R = Rt[We];
          F += zt(s, m) & (1 << R) - 1, m += R;
        }
        if (m > me) {
          c && pe(0);
          break;
        }
        o && u(x + 131072);
        var Je = x + ae;
        if (x < F) {
          var It = a - F, Tt = Math.min(F, Je);
          for (It + x < 0 && pe(3); x < Tt; ++x)
            t[x] = r[It + x];
        }
        for (; x < Je; ++x)
          t[x] = t[x - F];
      }
    }
    e.l = A, e.p = Ie, e.b = x, e.f = f, A && (f = 1, e.m = N, e.d = $, e.n = Q);
  } while (!f);
  return x != t.length && i ? Ur(t, 0, x) : t.subarray(0, x);
}, Te = function(s, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  s[r] |= t, s[r + 1] |= t >> 8;
}, ft = function(s, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  s[r] |= t, s[r + 1] |= t >> 8, s[r + 2] |= t >> 16;
}, Pt = function(s, e) {
  for (var t = [], r = 0; r < s.length; ++r)
    s[r] && t.push({ s: r, f: s[r] });
  var n = t.length, a = t.slice();
  if (!n)
    return { t: Jr, l: 0 };
  if (n == 1) {
    var i = new J(t[0].s + 1);
    return i[t[0].s] = 1, { t: i, l: 1 };
  }
  t.sort(function(q, G) {
    return q.f - G.f;
  }), t.push({ s: -1, f: 25001 });
  var o = t[0], c = t[1], u = 0, f = 1, m = 2;
  for (t[0] = { s: -1, f: o.f + c.f, l: o, r: c }; f != n - 1; )
    o = t[t[u].f < t[m].f ? u++ : m++], c = t[u != f && t[u].f < t[m].f ? u++ : m++], t[f++] = { s: -1, f: o.f + c.f, l: o, r: c };
  for (var x = a[0].s, r = 1; r < n; ++r)
    a[r].s > x && (x = a[r].s);
  var A = new ce(x + 1), $ = Gt(t[f - 1], A, 0);
  if ($ > e) {
    var r = 0, N = 0, Q = $ - e, me = 1 << Q;
    for (a.sort(function(G, z) {
      return A[z.s] - A[G.s] || G.f - z.f;
    }); r < n; ++r) {
      var re = a[r].s;
      if (A[re] > e)
        N += me - (1 << $ - A[re]), A[re] = e;
      else
        break;
    }
    for (N >>= Q; N > 0; ) {
      var D = a[r].s;
      A[D] < e ? N -= 1 << e - A[D]++ - 1 : ++r;
    }
    for (; r >= 0 && N; --r) {
      var Y = a[r].s;
      A[Y] == e && (--A[Y], ++N);
    }
    $ = e;
  }
  return { t: new J(A), l: $ };
}, Gt = function(s, e, t) {
  return s.s == -1 ? Math.max(Gt(s.l, e, t + 1), Gt(s.r, e, t + 1)) : e[s.s] = t;
}, Ar = function(s) {
  for (var e = s.length; e && !s[--e]; )
    ;
  for (var t = new ce(++e), r = 0, n = s[0], a = 1, i = function(c) {
    t[r++] = c;
  }, o = 1; o <= e; ++o)
    if (s[o] == n && o != e)
      ++a;
    else {
      if (!n && a > 2) {
        for (; a > 138; a -= 138)
          i(32754);
        a > 2 && (i(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
      } else if (a > 3) {
        for (i(n), --a; a > 6; a -= 6)
          i(8304);
        a > 2 && (i(a - 3 << 5 | 8208), a = 0);
      }
      for (; a--; )
        i(n);
      a = 1, n = s[o];
    }
  return { c: t.subarray(0, r), n: e };
}, ht = function(s, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += s[r] * e[r];
  return t;
}, Wr = function(s, e, t) {
  var r = t.length, n = cr(e + 2);
  s[n] = r & 255, s[n + 1] = r >> 8, s[n + 2] = s[n] ^ 255, s[n + 3] = s[n + 1] ^ 255;
  for (var a = 0; a < r; ++a)
    s[n + a + 4] = t[a];
  return (n + 4 + r) * 8;
}, Lr = function(s, e, t, r, n, a, i, o, c, u, f) {
  Te(e, f++, t), ++n[256];
  for (var m = Pt(n, 15), x = m.t, A = m.l, $ = Pt(a, 15), N = $.t, Q = $.l, me = Ar(x), re = me.c, D = me.n, Y = Ar(N), q = Y.c, G = Y.n, z = new ce(19), C = 0; C < re.length; ++C)
    ++z[re[C] & 31];
  for (var C = 0; C < q.length; ++C)
    ++z[q[C] & 31];
  for (var k = Pt(z, 7), P = k.t, Z = k.l, H = 19; H > 4 && !P[qt[H - 1]]; --H)
    ;
  var Ee = u + 5 << 3, ne = ht(n, $e) + ht(a, kt) + i, X = ht(n, x) + ht(a, N) + i + 14 + 3 * H + ht(z, P) + 2 * z[16] + 3 * z[17] + 7 * z[18];
  if (c >= 0 && Ee <= ne && Ee <= X)
    return Wr(e, f, s.subarray(c, c + u));
  var B, M, ee, F;
  if (Te(e, f, 1 + (X < ne)), f += 2, X < ne) {
    B = be(x, A, 0), M = x, ee = be(N, Q, 0), F = N;
    var lt = be(P, Z, 0);
    Te(e, f, D - 257), Te(e, f + 5, G - 1), Te(e, f + 10, H - 4), f += 14;
    for (var C = 0; C < H; ++C)
      Te(e, f + 3 * C, P[qt[C]]);
    f += 3 * H;
    for (var de = [re, q], Ie = 0; Ie < 2; ++Ie)
      for (var se = de[Ie], C = 0; C < se.length; ++C) {
        var ae = se[C] & 31;
        Te(e, f, lt[ae]), f += P[ae], ae > 15 && (Te(e, f, se[C] >> 5 & 127), f += se[C] >> 12);
      }
  } else
    B = Pn, M = $e, ee = Fn, F = kt;
  for (var C = 0; C < o; ++C) {
    var R = r[C];
    if (R > 255) {
      var ae = R >> 18 & 31;
      ft(e, f, B[ae + 257]), f += M[ae + 257], ae > 7 && (Te(e, f, R >> 23 & 31), f += Mt[ae]);
      var ye = R & 31;
      ft(e, f, ee[ye]), f += F[ye], ye > 3 && (ft(e, f, R >> 5 & 8191), f += Rt[ye]);
    } else
      ft(e, f, B[R]), f += M[R];
  }
  return ft(e, f, B[256]), f + M[256];
}, qn = /* @__PURE__ */ new or([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Jr = /* @__PURE__ */ new J(0), Hn = function(s, e, t, r, n, a) {
  var i = a.z || s.length, o = new J(r + i + 5 * (1 + Math.ceil(i / 7e3)) + n), c = o.subarray(r, o.length - n), u = a.l, f = (a.r || 0) & 7;
  if (e) {
    f && (c[0] = a.r >> 3);
    for (var m = qn[e - 1], x = m >> 13, A = m & 8191, $ = (1 << t) - 1, N = a.p || new ce(32768), Q = a.h || new ce($ + 1), me = Math.ceil(t / 3), re = 2 * me, D = function(Vt) {
      return (s[Vt] ^ s[Vt + 1] << me ^ s[Vt + 2] << re) & $;
    }, Y = new or(25e3), q = new ce(288), G = new ce(32), z = 0, C = 0, k = a.i || 0, P = 0, Z = a.w || 0, H = 0; k + 2 < i; ++k) {
      var Ee = D(k), ne = k & 32767, X = Q[Ee];
      if (N[ne] = X, Q[Ee] = ne, Z <= k) {
        var B = i - k;
        if ((z > 7e3 || P > 24576) && (B > 423 || !u)) {
          f = Lr(s, c, 0, Y, q, G, C, P, H, k - H, f), P = z = C = 0, H = k;
          for (var M = 0; M < 286; ++M)
            q[M] = 0;
          for (var M = 0; M < 30; ++M)
            G[M] = 0;
        }
        var ee = 2, F = 0, lt = A, de = ne - X & 32767;
        if (B > 2 && Ee == D(k - de))
          for (var Ie = Math.min(x, B) - 1, se = Math.min(32767, k), ae = Math.min(258, B); de <= se && --lt && ne != X; ) {
            if (s[k + ee] == s[k + ee - de]) {
              for (var R = 0; R < ae && s[k + R] == s[k + R - de]; ++R)
                ;
              if (R > ee) {
                if (ee = R, F = de, R > Ie)
                  break;
                for (var ye = Math.min(de, R - 2), We = 0, M = 0; M < ye; ++M) {
                  var Je = k - de + M & 32767, It = N[Je], Tt = Je - It & 32767;
                  Tt > We && (We = Tt, X = Je);
                }
              }
            }
            ne = X, X = N[ne], de += ne - X & 32767;
          }
        if (F) {
          Y[P++] = 268435456 | Ht[ee] << 18 | Er[F];
          var dt = Ht[ee] & 31, ut = Er[F] & 31;
          C += Mt[dt] + Rt[ut], ++q[257 + dt], ++G[ut], Z = k + ee, ++z;
        } else
          Y[P++] = s[k], ++q[s[k]];
      }
    }
    for (k = Math.max(k, Z); k < i; ++k)
      Y[P++] = s[k], ++q[s[k]];
    f = Lr(s, c, u, Y, q, G, C, P, H, k - H, f), u || (a.r = f & 7 | c[f / 8 | 0] << 3, f -= 7, a.h = Q, a.p = N, a.i = k, a.w = Z);
  } else {
    for (var k = a.w || 0; k < i + u; k += 65535) {
      var qe = k + 65535;
      qe >= i && (c[f / 8 | 0] = u, qe = i), f = Wr(c, f + 1, s.subarray(k, qe));
    }
    a.i = i;
  }
  return Ur(o, 0, r + cr(f) + n);
}, Yn = /* @__PURE__ */ (function() {
  for (var s = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    s[e] = t;
  }
  return s;
})(), Gn = function() {
  var s = -1;
  return {
    p: function(e) {
      for (var t = s, r = 0; r < e.length; ++r)
        t = Yn[t & 255 ^ e[r]] ^ t >>> 8;
      s = t;
    },
    d: function() {
      return ~s;
    }
  };
}, Qn = function(s, e, t, r, n) {
  if (!n && (n = { l: 1 }, e.dictionary)) {
    var a = e.dictionary.subarray(-32768), i = new J(a.length + s.length);
    i.set(a), i.set(s, a.length), s = i, n.w = a.length;
  }
  return Hn(s, e.level == null ? 6 : e.level, e.mem == null ? n.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(s.length))) * 1.5) : 20 : 12 + e.mem, t, r, n);
}, Qt = function(s, e, t) {
  for (; t; ++e)
    s[e] = t, t >>>= 8;
}, Xn = function(s, e) {
  var t = e.filename;
  if (s[0] = 31, s[1] = 139, s[2] = 8, s[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, s[9] = 3, e.mtime != 0 && Qt(s, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    s[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      s[r + 10] = t.charCodeAt(r);
  }
}, es = function(s) {
  (s[0] != 31 || s[1] != 139 || s[2] != 8) && pe(6, "invalid gzip data");
  var e = s[3], t = 10;
  e & 4 && (t += (s[10] | s[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !s[t++])
    ;
  return t + (e & 2);
}, ts = function(s) {
  var e = s.length;
  return (s[e - 4] | s[e - 3] << 8 | s[e - 2] << 16 | s[e - 1] << 24) >>> 0;
}, rs = function(s) {
  return 10 + (s.filename ? s.filename.length + 1 : 0);
};
function Nr(s, e) {
  e || (e = {});
  var t = Gn(), r = s.length;
  t.p(s);
  var n = Qn(s, e, rs(e), 8), a = n.length;
  return Xn(n, e), Qt(n, a - 8, t.d()), Qt(n, a - 4, r), n;
}
function Mr(s, e) {
  var t = es(s);
  return t + 8 > s.length && pe(6, "invalid gzip data"), Jn(s.subarray(t, -8), { i: 2 }, new J(ts(s)), e);
}
var ns = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ss = 0;
try {
  ns.decode(Jr, { stream: !0 }), ss = 1;
} catch {
}
const qr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function tt(s, e, t) {
  const r = t[0];
  if (e != null && s >= e)
    throw new Error(s + " >= " + e);
  if (s.slice(-1) === r || e && e.slice(-1) === r)
    throw new Error("trailing zero");
  if (e) {
    let i = 0;
    for (; (s[i] || r) === e[i]; )
      i++;
    if (i > 0)
      return e.slice(0, i) + tt(s.slice(i), e.slice(i), t);
  }
  const n = s ? t.indexOf(s[0]) : 0, a = e != null ? t.indexOf(e[0]) : t.length;
  if (a - n > 1) {
    const i = Math.round(0.5 * (n + a));
    return t[i];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[n] + tt(s.slice(1), null, t);
}
function Hr(s) {
  if (s.length !== Yr(s[0]))
    throw new Error("invalid integer part of order key: " + s);
}
function Yr(s) {
  if (s >= "a" && s <= "z")
    return s.charCodeAt(0) - 97 + 2;
  if (s >= "A" && s <= "Z")
    return 90 - s.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + s);
}
function vt(s) {
  const e = Yr(s[0]);
  if (e > s.length)
    throw new Error("invalid order key: " + s);
  return s.slice(0, e);
}
function Rr(s, e) {
  if (s === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + s);
  const t = vt(s);
  if (s.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + s);
}
function Vr(s, e) {
  Hr(s);
  const [t, ...r] = s.split("");
  let n = !0;
  for (let a = r.length - 1; n && a >= 0; a--) {
    const i = e.indexOf(r[a]) + 1;
    i === e.length ? r[a] = e[0] : (r[a] = e[i], n = !1);
  }
  if (n) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const a = String.fromCharCode(t.charCodeAt(0) + 1);
    return a > "a" ? r.push(e[0]) : r.pop(), a + r.join("");
  } else
    return t + r.join("");
}
function as(s, e) {
  Hr(s);
  const [t, ...r] = s.split("");
  let n = !0;
  for (let a = r.length - 1; n && a >= 0; a--) {
    const i = e.indexOf(r[a]) - 1;
    i === -1 ? r[a] = e.slice(-1) : (r[a] = e[i], n = !1);
  }
  if (n) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const a = String.fromCharCode(t.charCodeAt(0) - 1);
    return a < "Z" ? r.push(e.slice(-1)) : r.pop(), a + r.join("");
  } else
    return t + r.join("");
}
function Oe(s, e, t = qr) {
  if (s != null && Rr(s, t), e != null && Rr(e, t), s != null && e != null && s >= e)
    throw new Error(s + " >= " + e);
  if (s == null) {
    if (e == null)
      return "a" + t[0];
    const c = vt(e), u = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + tt("", u, t);
    if (c < e)
      return c;
    const f = as(c, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const c = vt(s), u = s.slice(c.length), f = Vr(c, t);
    return f ?? c + tt(u, null, t);
  }
  const r = vt(s), n = s.slice(r.length), a = vt(e), i = e.slice(a.length);
  if (r === a)
    return r + tt(n, i, t);
  const o = Vr(r, t);
  if (o == null)
    throw new Error("cannot increment any more");
  return o < e ? o : r + tt(n, null, t);
}
function Xt(s, e, t, r = qr) {
  if (t === 0)
    return [];
  if (t === 1)
    return [Oe(s, e, r)];
  {
    let n = Oe(s, e, r);
    const a = [n];
    for (let i = 0; i < t - 1; i++)
      n = Oe(n, e, r), a.push(n);
    return a;
  }
}
const is = Dn().int().nonnegative().optional();
function mt(s) {
  var t;
  const e = is.safeParse(s);
  if (!e.success)
    throw new W("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
function Gr(s, e, t, r) {
  const n = s.Id, a = r.setContainer(n, new E());
  a.set("Kind", s.Kind), a.set("outerItemId", e), a.set("OrderKey", t);
  const i = a.setContainer("Label", new j());
  s.Label && i.insert(0, s.Label);
  const o = a.setContainer("Info", new E());
  for (const [c, u] of Object.entries(s.Info ?? {}))
    o.set(c, u);
  if (s.Kind === "item") {
    const c = s, u = c.Type === He ? "" : c.Type ?? "";
    switch (a.set("MIMEType", u), !0) {
      case (c.ValueKind === "literal" && c.Value !== void 0): {
        a.set("ValueKind", "literal");
        const m = a.setContainer("literalValue", new j());
        c.Value.length > 0 && m.insert(0, c.Value);
        break;
      }
      case (c.ValueKind === "binary" && c.Value !== void 0): {
        a.set("ValueKind", "binary"), a.set("binaryValue", jr(c.Value));
        break;
      }
      default:
        a.set("ValueKind", c.ValueKind ?? "none");
    }
    const f = Xt(null, null, (c.innerEntries ?? []).length);
    (c.innerEntries ?? []).forEach((m, x) => {
      Gr(m, n, f[x], r);
    });
  } else {
    const c = s;
    a.set("TargetId", c.TargetId ?? "");
  }
}
var _e, te, bt, rt, Se, Be, oe, Me, Re, we, xe, Nt, nt, Ve, Fe, l, T, Ge, pt, Le, Ot, er, Qr, Xr, ie, De, Qe, yt, Xe, _t, et, en, tr, tn, rr, nr, I, rn, sr, ar, nn;
const ze = class ze extends sn {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(t, r) {
    var a;
    super();
    U(this, l);
    /**** private state ****/
    U(this, _e);
    U(this, te);
    U(this, bt);
    U(this, rt);
    U(this, Se, null);
    U(this, Be, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    U(this, oe, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId
    U(this, Me, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    U(this, Re, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId
    U(this, we, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    U(this, xe, /* @__PURE__ */ new Map());
    U(this, Nt, an);
    // transaction nesting
    U(this, nt, 0);
    // ChangeSet accumulator inside a transaction
    U(this, Ve, {});
    // suppress index updates / change tracking when applying remote patches
    U(this, Fe, !1);
    ge(this, _e, t), ge(this, te, t.getMap("Entries")), ge(this, bt, (r == null ? void 0 : r.LiteralSizeLimit) ?? on), ge(this, rt, (r == null ? void 0 : r.TrashTTLms) ?? 2592e6), d(this, l, Qr).call(this);
    const n = (r == null ? void 0 : r.TrashCheckIntervalMs) ?? Math.min(Math.floor(g(this, rt) / 4), 36e5);
    ge(this, Se, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      n
    )), typeof ((a = g(this, Se)) == null ? void 0 : a.unref) == "function" && g(this, Se).unref();
  }
  /**** fromScratch — create a new store with root, trash, and lost-and-found items ****/
  static fromScratch(t) {
    const r = new Kt(), n = r.getMap("Entries"), a = n.setContainer(ue, new E());
    a.set("Kind", "item"), a.set("outerItemId", ""), a.set("OrderKey", ""), a.setContainer("Label", new j()), a.setContainer("Info", new E()), a.set("MIMEType", ""), a.set("ValueKind", "none");
    const i = n.setContainer(V, new E());
    i.set("Kind", "item"), i.set("outerItemId", ue), i.set("OrderKey", "a0"), i.setContainer("Label", new j()).insert(0, "trash"), i.setContainer("Info", new E()), i.set("MIMEType", ""), i.set("ValueKind", "none");
    const c = n.setContainer(fe, new E());
    return c.set("Kind", "item"), c.set("outerItemId", ue), c.set("OrderKey", "a1"), c.setContainer("Label", new j()).insert(0, "lost-and-found"), c.setContainer("Info", new E()), c.set("MIMEType", ""), c.set("ValueKind", "none"), r.commit(), new ze(r, t);
  }
  /**** fromBinary — restore store from gzip-compressed binary data ****/
  static fromBinary(t, r) {
    const n = new Kt();
    return n.import(Mr(t)), new ze(n, r);
  }
  /**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/
  static fromJSON(t, r) {
    const n = typeof t == "string" ? JSON.parse(t) : t, a = new Kt(), i = a.getMap("Entries");
    return a.commit(), Gr(n, "", "", i), a.commit(), new ze(a, r);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known items                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — well-known data accessors ****/
  get RootItem() {
    return d(this, l, Le).call(this, ue);
  }
  get TrashItem() {
    return d(this, l, Le).call(this, V);
  }
  get LostAndFoundItem() {
    return d(this, l, Le).call(this, fe);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  /**** EntryWithId — retrieve an entry by Id ****/
  EntryWithId(t) {
    if (d(this, l, T).call(this, t) != null)
      return d(this, l, pt).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, r, n) {
    if (r == null) throw new W("invalid-argument", "outerItem must not be missing");
    const a = t ?? He;
    dr(a), mt(n), d(this, l, Ge).call(this, r.Id);
    const i = crypto.randomUUID(), o = d(this, l, Xe).call(this, r.Id, n), c = a === He ? "" : a;
    return this.transact(() => {
      const u = g(this, te).setContainer(i, new E());
      u.set("Kind", "item"), u.set("outerItemId", r.Id), u.set("OrderKey", o), u.setContainer("Label", new j()), u.setContainer("Info", new E()), u.set("MIMEType", c), u.set("ValueKind", "none"), d(this, l, ie).call(this, r.Id, i), d(this, l, I).call(this, r.Id, "innerEntryList"), d(this, l, I).call(this, i, "outerItem");
    }), d(this, l, Le).call(this, i);
  }
  /**** newLinkAt — create a new link within an outer data ****/
  newLinkAt(t, r, n) {
    if (t == null) throw new W("invalid-argument", "Target must not be missing");
    if (r == null) throw new W("invalid-argument", "outerItem must not be missing");
    mt(n), d(this, l, Ge).call(this, t.Id), d(this, l, Ge).call(this, r.Id);
    const a = crypto.randomUUID(), i = d(this, l, Xe).call(this, r.Id, n);
    return this.transact(() => {
      const o = g(this, te).setContainer(a, new E());
      o.set("Kind", "link"), o.set("outerItemId", r.Id), o.set("OrderKey", i), o.setContainer("Label", new j()), o.setContainer("Info", new E()), o.set("TargetId", t.Id), d(this, l, ie).call(this, r.Id, a), d(this, l, Qe).call(this, t.Id, a), d(this, l, I).call(this, r.Id, "innerEntryList"), d(this, l, I).call(this, a, "outerItem");
    }), d(this, l, Ot).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  /**** deserializeItemInto — import item subtree; always remaps all IDs ****/
  deserializeItemInto(t, r, n) {
    if (r == null) throw new W("invalid-argument", "outerItem must not be missing");
    mt(n), d(this, l, Ge).call(this, r.Id);
    const a = t;
    if (a == null || a.Kind !== "item")
      throw new W("invalid-argument", "Serialisation must be an SDS_ItemJSON object");
    const i = /* @__PURE__ */ new Map();
    d(this, l, sr).call(this, a, i);
    const o = d(this, l, Xe).call(this, r.Id, n), c = i.get(a.Id);
    return this.transact(() => {
      d(this, l, ar).call(this, a, r.Id, o, i), d(this, l, I).call(this, r.Id, "innerEntryList");
    }), d(this, l, Le).call(this, c);
  }
  /**** deserializeLinkInto — import link; always assigns a new Id ****/
  deserializeLinkInto(t, r, n) {
    if (r == null) throw new W("invalid-argument", "outerItem must not be missing");
    mt(n), d(this, l, Ge).call(this, r.Id);
    const a = t;
    if (a == null || a.Kind !== "link")
      throw new W("invalid-argument", "Serialisation must be an SDS_LinkJSON object");
    const i = crypto.randomUUID(), o = d(this, l, Xe).call(this, r.Id, n);
    return this.transact(() => {
      const c = g(this, te).setContainer(i, new E());
      c.set("Kind", "link"), c.set("outerItemId", r.Id), c.set("OrderKey", o);
      const u = c.setContainer("Label", new j());
      a.Label && u.insert(0, a.Label);
      const f = c.setContainer("Info", new E());
      for (const [m, x] of Object.entries(a.Info ?? {}))
        f.set(m, x);
      c.set("TargetId", a.TargetId ?? ""), d(this, l, ie).call(this, r.Id, i), a.TargetId && d(this, l, Qe).call(this, a.TargetId, i), d(this, l, I).call(this, r.Id, "innerEntryList");
    }), d(this, l, Ot).call(this, i);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  /**** moveEntryTo — move an entry to a different outer data ****/
  moveEntryTo(t, r, n) {
    if (mt(n), !this._mayMoveEntryTo(t.Id, r.Id, n))
      throw new W(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const a = this._outerItemIdOf(t.Id), i = d(this, l, Xe).call(this, r.Id, n);
    this.transact(() => {
      const o = d(this, l, T).call(this, t.Id);
      if (o.set("outerItemId", r.Id), o.set("OrderKey", i), a === V && r.Id !== V) {
        const c = o.get("Info");
        c instanceof E && c.get("_trashedAt") != null && (c.delete("_trashedAt"), d(this, l, I).call(this, t.Id, "Info._trashedAt"));
      }
      a != null && (d(this, l, De).call(this, a, t.Id), d(this, l, I).call(this, a, "innerEntryList")), d(this, l, ie).call(this, r.Id, t.Id), d(this, l, I).call(this, r.Id, "innerEntryList"), d(this, l, I).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const r = d(this, l, et).call(this, t);
    if (r.length === 0)
      return;
    const n = Xt(null, null, r.length);
    r.forEach((a, i) => {
      const o = d(this, l, T).call(this, a.Id);
      o != null && (o.set("OrderKey", n[i]), d(this, l, I).call(this, a.Id, "outerItem"));
    });
  }
  /**** deleteEntry — move entry to trash with timestamp ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new W("delete-not-permitted", "this entry cannot be deleted");
    const r = this._outerItemIdOf(t.Id), n = Oe(d(this, l, _t).call(this, V), null);
    this.transact(() => {
      const a = d(this, l, T).call(this, t.Id);
      a.set("outerItemId", V), a.set("OrderKey", n);
      let i = a.get("Info");
      i instanceof E || (i = a.setContainer("Info", new E())), i.set("_trashedAt", Date.now()), r != null && (d(this, l, De).call(this, r, t.Id), d(this, l, I).call(this, r, "innerEntryList")), d(this, l, ie).call(this, V, t.Id), d(this, l, I).call(this, V, "innerEntryList"), d(this, l, I).call(this, t.Id, "outerItem"), d(this, l, I).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete a trash entry ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== V)
      throw new W(
        "purge-not-in-trash",
        "only direct children of TrashItem can be purged"
      );
    if (d(this, l, en).call(this, t.Id))
      throw new W(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      d(this, l, nr).call(this, t.Id);
    });
  }
  //----------------------------------------------------------------------------//
  //                           Trash TTL / Auto-purge                          //
  //----------------------------------------------------------------------------//
  /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    const r = t ?? g(this, rt);
    if (r == null)
      return 0;
    const n = Date.now(), a = Array.from(g(this, oe).get(V) ?? /* @__PURE__ */ new Set());
    let i = 0;
    for (const o of a) {
      const c = d(this, l, T).call(this, o);
      if (c == null || c.get("outerItemId") !== V)
        continue;
      const u = c.get("Info"), f = u instanceof E ? u.get("_trashedAt") : void 0;
      if (typeof f == "number" && !(n - f < r))
        try {
          this.purgeEntry(d(this, l, pt).call(this, o)), i++;
        } catch {
        }
    }
    return i;
  }
  /**** dispose — stop background timer and remove all change listeners ****/
  dispose() {
    g(this, Se) != null && (clearInterval(g(this, Se)), ge(this, Se, null)), g(this, Be).clear();
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  /**** transact — execute operations within a batch transaction ****/
  transact(t) {
    jt(this, nt)._++;
    try {
      t();
    } finally {
      if (jt(this, nt)._--, g(this, nt) === 0) {
        g(this, Fe) || g(this, _e).commit();
        const r = { ...g(this, Ve) };
        ge(this, Ve, {});
        const n = g(this, Fe) ? "external" : "internal";
        d(this, l, rn).call(this, n, r);
      }
    }
  }
  /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
  onChangeInvoke(t) {
    return g(this, Be).add(t), () => {
      g(this, Be).delete(t);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  /**** applyRemotePatch — merge remote changes and rebuild indices ****/
  applyRemotePatch(t) {
    if (t.byteLength !== 0) {
      ge(this, Fe, !0);
      try {
        g(this, _e).import(t), this.transact(() => {
          d(this, l, Xr).call(this);
        });
      } finally {
        ge(this, Fe, !1);
      }
      this.recoverOrphans();
    }
  }
  /**** currentCursor — get current version vector as sync cursor ****/
  get currentCursor() {
    return g(this, _e).version().encode();
  }
  /**** exportPatch — generate a change patch since a given cursor ****/
  exportPatch(t) {
    return t == null || t.byteLength === 0 ? g(this, _e).export({ mode: "snapshot" }) : g(this, _e).export({ mode: "update", from: hn.decode(t) });
  }
  /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
  recoverOrphans() {
    const t = g(this, te).toJSON(), r = new Set(
      Object.entries(t).filter(([n, a]) => n === ue || a.outerItemId !== "").map(([n]) => n)
    );
    this.transact(() => {
      const n = g(this, te).toJSON();
      for (const [a, i] of Object.entries(n)) {
        if (a === ue)
          continue;
        const o = i.outerItemId;
        if (o && !r.has(o)) {
          const c = Oe(d(this, l, _t).call(this, fe), null), u = d(this, l, T).call(this, a);
          u.set("outerItemId", fe), u.set("OrderKey", c), d(this, l, ie).call(this, fe, a), d(this, l, I).call(this, a, "outerItem"), d(this, l, I).call(this, fe, "innerEntryList");
        }
        if (i.Kind === "link") {
          const c = i.TargetId;
          if (c && !r.has(c)) {
            const u = Oe(d(this, l, _t).call(this, fe), null), f = g(this, te).setContainer(c, new E());
            f.set("Kind", "item"), f.set("outerItemId", fe), f.set("OrderKey", u), f.setContainer("Label", new j()), f.setContainer("Info", new E()), f.set("MIMEType", ""), f.set("ValueKind", "none"), d(this, l, ie).call(this, fe, c), r.add(c), d(this, l, I).call(this, fe, "innerEntryList");
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
    return Nr(g(this, _e).export({ mode: "snapshot" }));
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, r, n) {
    const a = new TextDecoder().decode(Mr(t));
    return this.newEntryFromJSONat(JSON.parse(a), r, n);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const r = JSON.stringify(this._EntryAsJSON(t));
    return Nr(new TextEncoder().encode(r));
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SDS_Entry / Data / Link             //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (data or link) ****/
  _KindOf(t) {
    const r = d(this, l, T).call(this, t);
    if (r == null)
      throw new W("not-found", `entry '${t}' not found`);
    return r.get("Kind");
  }
  /**** _LabelOf — get entry label text ****/
  _LabelOf(t) {
    const r = d(this, l, T).call(this, t);
    if (r == null)
      return "";
    const n = r.get("Label");
    return n instanceof j ? n.toString() : String(n ?? "");
  }
  /**** _setLabelOf — set entry label text ****/
  _setLabelOf(t, r) {
    ln(r), this.transact(() => {
      const n = d(this, l, T).call(this, t);
      if (n == null)
        return;
      let a = n.get("Label");
      if (a instanceof j) {
        const i = a.toString().length;
        i > 0 && a.delete(0, i), r.length > 0 && a.insert(0, r);
      } else
        a = n.setContainer("Label", new j()), r.length > 0 && a.insert(0, r);
      d(this, l, I).call(this, t, "Label");
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const r = d(this, l, T).call(this, t), n = (r == null ? void 0 : r.get("MIMEType")) ?? "";
    return n === "" ? He : n;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, r) {
    dr(r);
    const n = r === He ? "" : r;
    this.transact(() => {
      var a;
      (a = d(this, l, T).call(this, t)) == null || a.set("MIMEType", n), d(this, l, I).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get value kind (none, literal, binary, reference types) ****/
  _ValueKindOf(t) {
    const r = d(this, l, T).call(this, t);
    return (r == null ? void 0 : r.get("ValueKind")) ?? "none";
  }
  /**** _readValueOf — read entry value (literal or binary) ****/
  async _readValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "none":
        return;
      case r === "literal": {
        const n = d(this, l, T).call(this, t), a = n == null ? void 0 : n.get("literalValue");
        return a instanceof j ? a.toString() : String(a ?? "");
      }
      case r === "binary": {
        const n = d(this, l, T).call(this, t), a = n == null ? void 0 : n.get("binaryValue");
        return a instanceof Uint8Array ? a : void 0;
      }
      default: {
        const n = this._getValueRefOf(t);
        if (n == null)
          return;
        const a = await this._getValueBlobAsync(n.Hash);
        return a == null ? void 0 : r === "literal-reference" ? new TextDecoder().decode(a) : a;
      }
    }
  }
  /**** _writeValueOf — write entry value with automatic storage strategy ****/
  _writeValueOf(t, r) {
    this.transact(() => {
      const n = d(this, l, T).call(this, t);
      if (n != null) {
        switch (!0) {
          case r == null: {
            n.set("ValueKind", "none");
            break;
          }
          case (typeof r == "string" && r.length <= g(this, bt)): {
            n.set("ValueKind", "literal");
            let a = n.get("literalValue");
            if (a instanceof j) {
              const i = a.toString().length;
              i > 0 && a.delete(0, i), r.length > 0 && a.insert(0, r);
            } else
              a = n.setContainer("literalValue", new j()), r.length > 0 && a.insert(0, r);
            break;
          }
          case typeof r == "string": {
            const i = new TextEncoder().encode(r), o = ze._BLOBhash(i);
            this._storeValueBlob(o, i), n.set("ValueKind", "literal-reference"), n.set("ValueRef", JSON.stringify({ Hash: o, Size: i.byteLength }));
            break;
          }
          case r.byteLength <= dn: {
            n.set("ValueKind", "binary"), n.set("binaryValue", r);
            break;
          }
          default: {
            const a = r, i = ze._BLOBhash(a);
            this._storeValueBlob(i, a), n.set("ValueKind", "binary-reference"), n.set("ValueRef", JSON.stringify({ Hash: i, Size: a.byteLength }));
            break;
          }
        }
        d(this, l, I).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value text at a range ****/
  _spliceValueOf(t, r, n, a) {
    if (this._ValueKindOf(t) !== "literal")
      throw new W(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const i = d(this, l, T).call(this, t), o = i == null ? void 0 : i.get("literalValue");
      if (o instanceof j) {
        const c = n - r;
        c > 0 && o.delete(r, c), a.length > 0 && o.insert(r, a);
      }
      d(this, l, I).call(this, t, "Value");
    });
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const r = d(this, l, T).call(this, t);
    if (r == null)
      return;
    const n = this._ValueKindOf(t);
    if (n !== "literal-reference" && n !== "binary-reference")
      return;
    const a = r.get("ValueRef");
    if (a != null)
      return typeof a == "string" ? JSON.parse(a) : a;
  }
  /**** _InfoProxyOf — get proxy for arbitrary metadata object ****/
  _InfoProxyOf(t) {
    const r = this;
    return new Proxy({}, {
      get(n, a) {
        var c;
        if (typeof a != "string")
          return;
        const i = d(c = r, l, T).call(c, t), o = i == null ? void 0 : i.get("Info");
        return o instanceof E ? o.get(a) : void 0;
      },
      set(n, a, i) {
        return typeof a != "string" ? !1 : i === void 0 ? (r.transact(() => {
          var u, f;
          const o = d(u = r, l, T).call(u, t), c = o == null ? void 0 : o.get("Info");
          if (c instanceof E) {
            const m = c.get(a) !== void 0;
            c.delete(a), m && d(f = r, l, I).call(f, t, `Info.${a}`);
          }
        }), !0) : (un(a), fn(i), r.transact(() => {
          var u, f;
          const o = d(u = r, l, T).call(u, t);
          if (o == null)
            return;
          let c = o.get("Info");
          c instanceof E || (c = o.setContainer("Info", new E())), c.set(a, i), d(f = r, l, I).call(f, t, `Info.${a}`);
        }), !0);
      },
      deleteProperty(n, a) {
        return typeof a != "string" ? !1 : (r.transact(() => {
          var c, u;
          const i = d(c = r, l, T).call(c, t), o = i == null ? void 0 : i.get("Info");
          if (o instanceof E) {
            const f = o.get(a) !== void 0;
            o.delete(a), f && d(u = r, l, I).call(u, t, `Info.${a}`);
          }
        }), !0);
      },
      ownKeys() {
        var i;
        const n = d(i = r, l, T).call(i, t), a = n == null ? void 0 : n.get("Info");
        return a instanceof E ? Object.keys(a.toJSON()) : [];
      },
      getOwnPropertyDescriptor(n, a) {
        var u;
        if (typeof a != "string")
          return;
        const i = d(u = r, l, T).call(u, t), o = i == null ? void 0 : i.get("Info");
        if (!(o instanceof E))
          return;
        const c = o.get(a);
        return c !== void 0 ? { configurable: !0, enumerable: !0, value: c } : void 0;
      }
    });
  }
  /**** _outerItemIdOf — get outer item Id or undefined ****/
  _outerItemIdOf(t) {
    const r = d(this, l, T).call(this, t), n = r == null ? void 0 : r.get("outerItemId");
    return n != null && n !== "" ? n : void 0;
  }
  /**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/
  _innerEntriesOf(t) {
    const r = this, n = d(this, l, et).call(this, t);
    return new Proxy([], {
      get(a, i) {
        var o;
        if (i === "length")
          return n.length;
        if (i === Symbol.iterator)
          return function* () {
            var c;
            for (let u = 0; u < n.length; u++)
              yield d(c = r, l, pt).call(c, n[u].Id);
          };
        if (typeof i == "string" && !isNaN(Number(i))) {
          const c = Number(i);
          return c >= 0 && c < n.length ? d(o = r, l, pt).call(o, n[c].Id) : void 0;
        }
        return a[i];
      }
    });
  }
  /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
  _mayMoveEntryTo(t, r, n) {
    return t === ue || t === r ? !1 : t === V || t === fe ? r === ue : !d(this, l, nn).call(this, r, t);
  }
  /**** _mayDeleteEntry — check if entry is deletable ****/
  _mayDeleteEntry(t) {
    return t !== ue && t !== V && t !== fe;
  }
  /**** _TargetOf — get the target data for a link ****/
  _TargetOf(t) {
    const r = d(this, l, T).call(this, t), n = r == null ? void 0 : r.get("TargetId");
    if (n == null || n === "")
      throw new W("not-found", `link '${t}' has no target`);
    return d(this, l, Le).call(this, n);
  }
  /**** _currentValueOf — synchronously return the inline value of an item ****/
  _currentValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "literal": {
        const n = d(this, l, T).call(this, t), a = n == null ? void 0 : n.get("literalValue");
        return a instanceof j ? a.toString() : String(a ?? "");
      }
      case r === "binary": {
        const n = d(this, l, T).call(this, t), a = n == null ? void 0 : n.get("binaryValue");
        return a instanceof Uint8Array ? a : void 0;
      }
      default:
        return;
    }
  }
};
_e = new WeakMap(), te = new WeakMap(), bt = new WeakMap(), rt = new WeakMap(), Se = new WeakMap(), Be = new WeakMap(), oe = new WeakMap(), Me = new WeakMap(), Re = new WeakMap(), we = new WeakMap(), xe = new WeakMap(), Nt = new WeakMap(), nt = new WeakMap(), Ve = new WeakMap(), Fe = new WeakMap(), l = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #getEntryMap — returns the LoroMap for a given entry Id ****/
T = function(t) {
  const r = g(this, te).get(t);
  if (r instanceof E && !(r.get("outerItemId") === "" && t !== ue))
    return r;
}, /**** #requireItemExists — throw if data does not exist ****/
Ge = function(t) {
  const r = d(this, l, T).call(this, t);
  if (r == null || r.get("Kind") !== "item")
    throw new W("invalid-argument", `item '${t}' does not exist`);
}, /**** #wrapped / #wrappedItem / #wrappedLink — return cached wrapper objects ****/
pt = function(t) {
  const r = d(this, l, T).call(this, t);
  if (r == null)
    throw new W("invalid-argument", `entry '${t}' not found`);
  return r.get("Kind") === "item" ? d(this, l, Le).call(this, t) : d(this, l, Ot).call(this, t);
}, Le = function(t) {
  const r = g(this, xe).get(t);
  if (r instanceof ur)
    return r;
  const n = new ur(this, t);
  return d(this, l, er).call(this, t, n), n;
}, Ot = function(t) {
  const r = g(this, xe).get(t);
  if (r instanceof fr)
    return r;
  const n = new fr(this, t);
  return d(this, l, er).call(this, t, n), n;
}, /**** #CacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/
er = function(t, r) {
  if (g(this, xe).size >= g(this, Nt)) {
    const n = g(this, xe).keys().next().value;
    n != null && g(this, xe).delete(n);
  }
  g(this, xe).set(t, r);
}, /**** #rebuildIndices — full rebuild of all indices from scratch ****/
Qr = function() {
  g(this, oe).clear(), g(this, Me).clear(), g(this, Re).clear(), g(this, we).clear();
  const t = g(this, te).toJSON();
  for (const [r, n] of Object.entries(t)) {
    const a = n.outerItemId;
    if (a && d(this, l, ie).call(this, a, r), n.Kind === "link") {
      const i = n.TargetId;
      i && d(this, l, Qe).call(this, i, r);
    }
  }
}, /**** #updateIndicesFromView — incremental diff used after remote patches ****/
Xr = function() {
  const t = g(this, te).toJSON(), r = /* @__PURE__ */ new Set();
  for (const [i, o] of Object.entries(t)) {
    r.add(i);
    const c = o.outerItemId || void 0, u = g(this, Me).get(i);
    switch (c !== u && (u != null && (d(this, l, De).call(this, u, i), d(this, l, I).call(this, u, "innerEntryList")), c != null && (d(this, l, ie).call(this, c, i), d(this, l, I).call(this, c, "innerEntryList")), d(this, l, I).call(this, i, "outerItem")), !0) {
      case o.Kind === "link": {
        const f = o.TargetId, m = g(this, we).get(i);
        f !== m && (m != null && d(this, l, yt).call(this, m, i), f != null && d(this, l, Qe).call(this, f, i));
        break;
      }
      case g(this, we).has(i):
        d(this, l, yt).call(this, g(this, we).get(i), i);
        break;
    }
    d(this, l, I).call(this, i, "Label");
  }
  const n = Array.from(g(this, Me).entries()).filter(([i]) => !r.has(i));
  for (const [i, o] of n)
    d(this, l, De).call(this, o, i), d(this, l, I).call(this, o, "innerEntryList");
  const a = Array.from(g(this, we).entries()).filter(([i]) => !r.has(i));
  for (const [i, o] of a)
    d(this, l, yt).call(this, o, i);
}, /**** #addToReverseIndex — add entry to reverse and forward indices ****/
ie = function(t, r) {
  let n = g(this, oe).get(t);
  n == null && (n = /* @__PURE__ */ new Set(), g(this, oe).set(t, n)), n.add(r), g(this, Me).set(r, t);
}, /**** #removeFromReverseIndex — remove entry from indices ****/
De = function(t, r) {
  var n;
  (n = g(this, oe).get(t)) == null || n.delete(r), g(this, Me).delete(r);
}, /**** #addToLinkTargetIndex — add link to target and forward indices ****/
Qe = function(t, r) {
  let n = g(this, Re).get(t);
  n == null && (n = /* @__PURE__ */ new Set(), g(this, Re).set(t, n)), n.add(r), g(this, we).set(r, t);
}, /**** #removeFromLinkTargetIndex — remove link from indices ****/
yt = function(t, r) {
  var n;
  (n = g(this, Re).get(t)) == null || n.delete(r), g(this, we).delete(r);
}, /**** #OrderKeyAt — generate fractional order key for insertion position ****/
Xe = function(t, r) {
  const n = (o) => {
    if (o.length === 0 || r == null) {
      const u = o.length > 0 ? o[o.length - 1].OrderKey : null;
      return Oe(u, null);
    }
    const c = Math.max(0, Math.min(r, o.length));
    return Oe(
      c > 0 ? o[c - 1].OrderKey : null,
      c < o.length ? o[c].OrderKey : null
    );
  };
  let a = d(this, l, et).call(this, t);
  const i = n(a);
  return i.length <= cn ? i : (this._rebalanceInnerEntriesOf(t), n(d(this, l, et).call(this, t)));
}, /**** #lastOrderKeyOf — get the last order key for an entry's children ****/
_t = function(t) {
  const r = d(this, l, et).call(this, t);
  return r.length > 0 ? r[r.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/
et = function(t) {
  const r = g(this, oe).get(t) ?? /* @__PURE__ */ new Set(), n = [];
  for (const a of r) {
    const i = d(this, l, T).call(this, a);
    (i == null ? void 0 : i.get("outerItemId")) === t && n.push({ Id: a, OrderKey: i.get("OrderKey") ?? "" });
  }
  return n.sort((a, i) => a.OrderKey < i.OrderKey ? -1 : a.OrderKey > i.OrderKey ? 1 : a.Id < i.Id ? -1 : a.Id > i.Id ? 1 : 0), n;
}, /**** #isProtected — check if trash entry has incoming links from root ****/
en = function(t) {
  const r = d(this, l, rr).call(this), n = /* @__PURE__ */ new Set();
  let a = !0;
  for (; a; ) {
    a = !1;
    for (const i of g(this, oe).get(V) ?? /* @__PURE__ */ new Set())
      n.has(i) || d(this, l, tr).call(this, i, r, n) && (n.add(i), a = !0);
  }
  return n.has(t);
}, /**** #SubtreeHasIncomingLinks — check if subtree has links from reachable entries ****/
tr = function(t, r, n) {
  const a = [t], i = /* @__PURE__ */ new Set();
  for (; a.length > 0; ) {
    const o = a.pop();
    if (i.has(o))
      continue;
    i.add(o);
    const c = g(this, Re).get(o) ?? /* @__PURE__ */ new Set();
    for (const u of c) {
      if (r.has(u))
        return !0;
      const f = d(this, l, tn).call(this, u);
      if (f != null && n.has(f))
        return !0;
    }
    for (const u of g(this, oe).get(o) ?? /* @__PURE__ */ new Set())
      i.has(u) || a.push(u);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — get direct inner entry of TrashItem containing an entry ****/
tn = function(t) {
  let r = t;
  for (; r != null; ) {
    const n = this._outerItemIdOf(r);
    if (n === V)
      return r;
    if (n === ue || n == null)
      return null;
    r = n;
  }
  return null;
}, /**** #reachableFromRoot — compute live-tree entries reachable from root ****/
// TrashItem is included (it is a direct child of Root) but its subtree is
// NOT traversed — entries inside Trash are not considered "live" and must
// not protect other entries from being purged.
rr = function() {
  const t = /* @__PURE__ */ new Set(), r = [ue];
  for (; r.length > 0; ) {
    const n = r.pop();
    if (!t.has(n) && (t.add(n), n !== V))
      for (const a of g(this, oe).get(n) ?? /* @__PURE__ */ new Set())
        t.has(a) || r.push(a);
  }
  return t;
}, /**** #purgeSubtree — recursively delete entry and unprotected children ****/
nr = function(t) {
  const r = d(this, l, T).call(this, t);
  if (r == null)
    return;
  const n = r.get("Kind"), a = r.get("outerItemId"), i = d(this, l, rr).call(this), o = /* @__PURE__ */ new Set(), c = Array.from(g(this, oe).get(t) ?? /* @__PURE__ */ new Set());
  for (const u of c)
    if (d(this, l, tr).call(this, u, i, o)) {
      const f = d(this, l, T).call(this, u), m = Oe(d(this, l, _t).call(this, V), null);
      f.set("outerItemId", V), f.set("OrderKey", m), d(this, l, De).call(this, t, u), d(this, l, ie).call(this, V, u), d(this, l, I).call(this, V, "innerEntryList"), d(this, l, I).call(this, u, "outerItem");
    } else
      d(this, l, nr).call(this, u);
  if (d(this, l, I).call(this, t, "Existence"), r.set("outerItemId", ""), r.set("OrderKey", ""), a && (d(this, l, De).call(this, a, t), d(this, l, I).call(this, a, "innerEntryList")), n === "link") {
    const u = r.get("TargetId");
    u && d(this, l, yt).call(this, u, t);
  }
  g(this, xe).delete(t);
}, /**** #recordChange — add property change to pending changeset ****/
I = function(t, r) {
  g(this, Ve)[t] == null && (g(this, Ve)[t] = /* @__PURE__ */ new Set()), g(this, Ve)[t].add(r);
}, /**** #notifyHandlers — call change handlers with origin and changeset ****/
rn = function(t, r) {
  if (Object.keys(r).length !== 0)
    for (const n of g(this, Be))
      try {
        n(t, r);
      } catch {
      }
}, /**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/
sr = function(t, r) {
  if (r.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const n of t.innerEntries ?? [])
      d(this, l, sr).call(this, n, r);
}, /**** #importEntryFromJSON — recursively create a Loro entry and update indices ****/
ar = function(t, r, n, a) {
  const i = a.get(t.Id), o = g(this, te).setContainer(i, new E());
  o.set("Kind", t.Kind), o.set("outerItemId", r), o.set("OrderKey", n);
  const c = o.setContainer("Label", new j());
  t.Label && c.insert(0, t.Label);
  const u = o.setContainer("Info", new E());
  for (const [f, m] of Object.entries(t.Info ?? {}))
    u.set(f, m);
  if (t.Kind === "item") {
    const f = t, m = f.Type === He ? "" : f.Type ?? "";
    switch (o.set("MIMEType", m), !0) {
      case (f.ValueKind === "literal" && f.Value !== void 0): {
        o.set("ValueKind", "literal");
        const A = o.setContainer("literalValue", new j());
        f.Value.length > 0 && A.insert(0, f.Value);
        break;
      }
      case (f.ValueKind === "binary" && f.Value !== void 0): {
        o.set("ValueKind", "binary"), o.set("binaryValue", jr(f.Value));
        break;
      }
      default:
        o.set("ValueKind", f.ValueKind ?? "none");
    }
    d(this, l, ie).call(this, r, i);
    const x = Xt(null, null, (f.innerEntries ?? []).length);
    (f.innerEntries ?? []).forEach((A, $) => {
      d(this, l, ar).call(this, A, i, x[$], a);
    });
  } else {
    const f = t, m = a.has(f.TargetId) ? a.get(f.TargetId) : f.TargetId;
    o.set("TargetId", m ?? ""), d(this, l, ie).call(this, r, i), m && d(this, l, Qe).call(this, m, i);
  }
}, /**** #isDescendantOf — check if one entry is a descendant of another ****/
nn = function(t, r) {
  let n = t;
  for (; n != null; ) {
    if (n === r)
      return !0;
    n = this._outerItemIdOf(n);
  }
  return !1;
};
let Zr = ze;
export {
  Zr as SDS_DataStore,
  fs as SDS_Entry,
  hs as SDS_Error,
  ms as SDS_Item,
  gs as SDS_Link
};
