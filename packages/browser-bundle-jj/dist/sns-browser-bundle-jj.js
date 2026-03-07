var Vl = Object.defineProperty;
var so = (n) => {
  throw TypeError(n);
};
var Ml = (n, e, t) => e in n ? Vl(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var On = (n, e, t) => Ml(n, typeof e != "symbol" ? e + "" : e, t), Oi = (n, e, t) => e.has(n) || so("Cannot " + t);
var S = (n, e, t) => (Oi(n, e, "read from private field"), t ? t.call(n) : e.get(n)), D = (n, e, t) => e.has(n) ? so("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), z = (n, e, t, i) => (Oi(n, e, "write to private field"), i ? i.call(n, t) : e.set(n, t), t), T = (n, e, t) => (Oi(n, e, "access private method"), t);
var Qr = (n, e, t, i) => ({
  set _(r) {
    z(n, e, r, t);
  },
  get _() {
    return S(n, e, i);
  }
});
const Xe = "00000000-0000-4000-8000-000000000000", ye = "00000000-0000-4000-8000-000000000001", Ie = "00000000-0000-4000-8000-000000000002", $r = "text/plain";
class Kc {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  get isRootNote() {
    return this.Id === Xe;
  }
  get isTrashNote() {
    return this.Id === ye;
  }
  get isLostAndFoundNote() {
    return this.Id === Ie;
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
class oo extends Kc {
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
  changeValue(e, t, i) {
    this._Store._spliceValueOf(this.Id, e, t, i);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class ao extends Kc {
  constructor(e, t) {
    super(e, t);
  }
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
var ee;
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
    const s = {};
    for (const o of r)
      s[o] = o;
    return s;
  }, n.getValidEnumValues = (r) => {
    const s = n.objectKeys(r).filter((a) => typeof r[r[a]] != "number"), o = {};
    for (const a of s)
      o[a] = r[a];
    return n.objectValues(o);
  }, n.objectValues = (r) => n.objectKeys(r).map(function(s) {
    return r[s];
  }), n.objectKeys = typeof Object.keys == "function" ? (r) => Object.keys(r) : (r) => {
    const s = [];
    for (const o in r)
      Object.prototype.hasOwnProperty.call(r, o) && s.push(o);
    return s;
  }, n.find = (r, s) => {
    for (const o of r)
      if (s(o))
        return o;
  }, n.isInteger = typeof Number.isInteger == "function" ? (r) => Number.isInteger(r) : (r) => typeof r == "number" && Number.isFinite(r) && Math.floor(r) === r;
  function i(r, s = " | ") {
    return r.map((o) => typeof o == "string" ? `'${o}'` : o).join(s);
  }
  n.joinValues = i, n.jsonStringifyReplacer = (r, s) => typeof s == "bigint" ? s.toString() : s;
})(ee || (ee = {}));
var co;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(co || (co = {}));
const U = ee.arrayToEnum([
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
]), at = (n) => {
  switch (typeof n) {
    case "undefined":
      return U.undefined;
    case "string":
      return U.string;
    case "number":
      return Number.isNaN(n) ? U.nan : U.number;
    case "boolean":
      return U.boolean;
    case "function":
      return U.function;
    case "bigint":
      return U.bigint;
    case "symbol":
      return U.symbol;
    case "object":
      return Array.isArray(n) ? U.array : n === null ? U.null : n.then && typeof n.then == "function" && n.catch && typeof n.catch == "function" ? U.promise : typeof Map < "u" && n instanceof Map ? U.map : typeof Set < "u" && n instanceof Set ? U.set : typeof Date < "u" && n instanceof Date ? U.date : U.object;
    default:
      return U.unknown;
  }
}, V = ee.arrayToEnum([
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
class it extends Error {
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
    }, i = { _errors: [] }, r = (s) => {
      for (const o of s.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(r);
        else if (o.code === "invalid_return_type")
          r(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          r(o.argumentsError);
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
    return r(this), i;
  }
  static assert(e) {
    if (!(e instanceof it))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, ee.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, i = [];
    for (const r of this.issues)
      if (r.path.length > 0) {
        const s = r.path[0];
        t[s] = t[s] || [], t[s].push(e(r));
      } else
        i.push(e(r));
    return { formErrors: i, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
it.create = (n) => new it(n);
const ms = (n, e) => {
  let t;
  switch (n.code) {
    case V.invalid_type:
      n.received === U.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case V.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, ee.jsonStringifyReplacer)}`;
      break;
    case V.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${ee.joinValues(n.keys, ", ")}`;
      break;
    case V.invalid_union:
      t = "Invalid input";
      break;
    case V.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${ee.joinValues(n.options)}`;
      break;
    case V.invalid_enum_value:
      t = `Invalid enum value. Expected ${ee.joinValues(n.options)}, received '${n.received}'`;
      break;
    case V.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case V.invalid_return_type:
      t = "Invalid function return type";
      break;
    case V.invalid_date:
      t = "Invalid date";
      break;
    case V.invalid_string:
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : ee.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
      break;
    case V.too_small:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "more than"} ${n.minimum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "over"} ${n.minimum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "bigint" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(n.minimum))}` : t = "Invalid input";
      break;
    case V.too_big:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "less than"} ${n.maximum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "under"} ${n.maximum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "bigint" ? t = `BigInt must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly" : n.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(n.maximum))}` : t = "Invalid input";
      break;
    case V.custom:
      t = "Invalid input";
      break;
    case V.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case V.not_multiple_of:
      t = `Number must be a multiple of ${n.multipleOf}`;
      break;
    case V.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, ee.assertNever(n);
  }
  return { message: t };
};
let Dl = ms;
function ql() {
  return Dl;
}
const Ul = (n) => {
  const { data: e, path: t, errorMaps: i, issueData: r } = n, s = [...t, ...r.path || []], o = {
    ...r,
    path: s
  };
  if (r.message !== void 0)
    return {
      ...r,
      path: s,
      message: r.message
    };
  let a = "";
  const u = i.filter((l) => !!l).slice().reverse();
  for (const l of u)
    a = l(o, { data: e, defaultError: a }).message;
  return {
    ...r,
    path: s,
    message: a
  };
};
function M(n, e) {
  const t = ql(), i = Ul({
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
      t === ms ? void 0 : ms
      // then global default map
    ].filter((r) => !!r)
  });
  n.common.issues.push(i);
}
class Ce {
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
    for (const r of t) {
      if (r.status === "aborted")
        return H;
      r.status === "dirty" && e.dirty(), i.push(r.value);
    }
    return { status: e.value, value: i };
  }
  static async mergeObjectAsync(e, t) {
    const i = [];
    for (const r of t) {
      const s = await r.key, o = await r.value;
      i.push({
        key: s,
        value: o
      });
    }
    return Ce.mergeObjectSync(e, i);
  }
  static mergeObjectSync(e, t) {
    const i = {};
    for (const r of t) {
      const { key: s, value: o } = r;
      if (s.status === "aborted" || o.status === "aborted")
        return H;
      s.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof o.value < "u" || r.alwaysSet) && (i[s.value] = o.value);
    }
    return { status: e.value, value: i };
  }
}
const H = Object.freeze({
  status: "aborted"
}), Tr = (n) => ({ status: "dirty", value: n }), Ae = (n) => ({ status: "valid", value: n }), uo = (n) => n.status === "aborted", lo = (n) => n.status === "dirty", vn = (n) => n.status === "valid", ci = (n) => typeof Promise < "u" && n instanceof Promise;
var F;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(F || (F = {}));
class bt {
  constructor(e, t, i, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = i, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const ho = (n, e) => {
  if (vn(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new it(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function G(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: i, description: r } = n;
  if (e && (t || i))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: r } : { errorMap: (o, a) => {
    const { message: u } = n;
    return o.code === "invalid_enum_value" ? { message: u ?? a.defaultError } : typeof a.data > "u" ? { message: u ?? i ?? a.defaultError } : o.code !== "invalid_type" ? { message: a.defaultError } : { message: u ?? t ?? a.defaultError };
  }, description: r };
}
class Q {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return at(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: at(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Ce(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: at(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (ci(t))
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
      parsedType: at(e)
    }, r = this._parseSync({ data: e, path: i.path, parent: i });
    return ho(i, r);
  }
  "~validate"(e) {
    var i, r;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: at(e)
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: e, path: [], parent: t });
        return vn(s) ? {
          value: s.value
        } : {
          issues: t.common.issues
        };
      } catch (s) {
        (r = (i = s == null ? void 0 : s.message) == null ? void 0 : i.toLowerCase()) != null && r.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => vn(s) ? {
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
      parsedType: at(e)
    }, r = this._parse({ data: e, path: i.path, parent: i }), s = await (ci(r) ? r : Promise.resolve(r));
    return ho(i, s);
  }
  refine(e, t) {
    const i = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, s) => {
      const o = e(r), a = () => s.addIssue({
        code: V.custom,
        ...i(r)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((u) => u ? !0 : (a(), !1)) : o ? !0 : (a(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((i, r) => e(i) ? !0 : (r.addIssue(typeof t == "function" ? t(i, r) : t), !1));
  }
  _refinement(e) {
    return new wn({
      schema: this,
      typeName: J.ZodEffects,
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
    return vt.create(this, this._def);
  }
  nullable() {
    return _n.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Ke.create(this);
  }
  promise() {
    return di.create(this, this._def);
  }
  or(e) {
    return li.create([this, e], this._def);
  }
  and(e) {
    return hi.create(this, e, this._def);
  }
  transform(e) {
    return new wn({
      ...G(this._def),
      schema: this,
      typeName: J.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new _s({
      ...G(this._def),
      innerType: this,
      defaultValue: t,
      typeName: J.ZodDefault
    });
  }
  brand() {
    return new lh({
      typeName: J.ZodBranded,
      type: this,
      ...G(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ks({
      ...G(this._def),
      innerType: this,
      catchValue: t,
      typeName: J.ZodCatch
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
    return Hs.create(this, e);
  }
  readonly() {
    return Ss.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Fl = /^c[^\s-]{8,}$/i, zl = /^[0-9a-z]+$/, Zl = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Hl = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Jl = /^[a-z0-9_-]{21}$/i, Kl = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Wl = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Gl = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Xl = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Ni;
const Yl = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ql = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, $l = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, eh = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, th = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, nh = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Wc = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", rh = new RegExp(`^${Wc}$`);
function Gc(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function ih(n) {
  return new RegExp(`^${Gc(n)}$`);
}
function sh(n) {
  let e = `${Wc}T${Gc(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function oh(n, e) {
  return !!((e === "v4" || !e) && Yl.test(n) || (e === "v6" || !e) && $l.test(n));
}
function ah(n, e) {
  if (!Kl.test(n))
    return !1;
  try {
    const [t] = n.split(".");
    if (!t)
      return !1;
    const i = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), r = JSON.parse(atob(i));
    return !(typeof r != "object" || r === null || "typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || e && r.alg !== e);
  } catch {
    return !1;
  }
}
function ch(n, e) {
  return !!((e === "v4" || !e) && Ql.test(n) || (e === "v6" || !e) && eh.test(n));
}
class yt extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== U.string) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: U.string,
        received: s.parsedType
      }), H;
    }
    const i = new Ce();
    let r;
    for (const s of this._def.checks)
      if (s.kind === "min")
        e.data.length < s.value && (r = this._getOrReturnCtx(e, r), M(r, {
          code: V.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), i.dirty());
      else if (s.kind === "max")
        e.data.length > s.value && (r = this._getOrReturnCtx(e, r), M(r, {
          code: V.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), i.dirty());
      else if (s.kind === "length") {
        const o = e.data.length > s.value, a = e.data.length < s.value;
        (o || a) && (r = this._getOrReturnCtx(e, r), o ? M(r, {
          code: V.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }) : a && M(r, {
          code: V.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }), i.dirty());
      } else if (s.kind === "email")
        Gl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "email",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "emoji")
        Ni || (Ni = new RegExp(Xl, "u")), Ni.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "emoji",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "uuid")
        Hl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "uuid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "nanoid")
        Jl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "nanoid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid")
        Fl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "cuid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid2")
        zl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "cuid2",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "ulid")
        Zl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "ulid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "url")
        try {
          new URL(e.data);
        } catch {
          r = this._getOrReturnCtx(e, r), M(r, {
            validation: "url",
            code: V.invalid_string,
            message: s.message
          }), i.dirty();
        }
      else s.kind === "regex" ? (s.regex.lastIndex = 0, s.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "regex",
        code: V.invalid_string,
        message: s.message
      }), i.dirty())) : s.kind === "trim" ? e.data = e.data.trim() : s.kind === "includes" ? e.data.includes(s.value, s.position) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: { includes: s.value, position: s.position },
        message: s.message
      }), i.dirty()) : s.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : s.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : s.kind === "startsWith" ? e.data.startsWith(s.value) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: { startsWith: s.value },
        message: s.message
      }), i.dirty()) : s.kind === "endsWith" ? e.data.endsWith(s.value) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: { endsWith: s.value },
        message: s.message
      }), i.dirty()) : s.kind === "datetime" ? sh(s).test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "datetime",
        message: s.message
      }), i.dirty()) : s.kind === "date" ? rh.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "date",
        message: s.message
      }), i.dirty()) : s.kind === "time" ? ih(s).test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "time",
        message: s.message
      }), i.dirty()) : s.kind === "duration" ? Wl.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "duration",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "ip" ? oh(e.data, s.version) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "ip",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "jwt" ? ah(e.data, s.alg) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "jwt",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "cidr" ? ch(e.data, s.version) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "cidr",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64" ? th.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "base64",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64url" ? nh.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "base64url",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : ee.assertNever(s);
    return { status: i.value, value: e.data };
  }
  _regex(e, t, i) {
    return this.refinement((r) => e.test(r), {
      validation: t,
      code: V.invalid_string,
      ...F.errToObj(i)
    });
  }
  _addCheck(e) {
    return new yt({
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
    return new yt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new yt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new yt({
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
yt.create = (n) => new yt({
  checks: [],
  typeName: J.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...G(n)
});
function uh(n, e) {
  const t = (n.toString().split(".")[1] || "").length, i = (e.toString().split(".")[1] || "").length, r = t > i ? t : i, s = Number.parseInt(n.toFixed(r).replace(".", "")), o = Number.parseInt(e.toFixed(r).replace(".", ""));
  return s % o / 10 ** r;
}
class bn extends Q {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== U.number) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: U.number,
        received: s.parsedType
      }), H;
    }
    let i;
    const r = new Ce();
    for (const s of this._def.checks)
      s.kind === "int" ? ee.isInteger(e.data) || (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.invalid_type,
        expected: "integer",
        received: "float",
        message: s.message
      }), r.dirty()) : s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.too_small,
        minimum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), r.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.too_big,
        maximum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), r.dirty()) : s.kind === "multipleOf" ? uh(e.data, s.value) !== 0 && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), r.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.not_finite,
        message: s.message
      }), r.dirty()) : ee.assertNever(s);
    return { status: r.value, value: e.data };
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
  setLimit(e, t, i, r) {
    return new bn({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: F.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new bn({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && ee.isInteger(e.value));
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
bn.create = (n) => new bn({
  checks: [],
  typeName: J.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...G(n)
});
class Mr extends Q {
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
    const r = new Ce();
    for (const s of this._def.checks)
      s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.too_small,
        type: "bigint",
        minimum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), r.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.too_big,
        type: "bigint",
        maximum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), r.dirty()) : s.kind === "multipleOf" ? e.data % s.value !== BigInt(0) && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), r.dirty()) : ee.assertNever(s);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return M(t, {
      code: V.invalid_type,
      expected: U.bigint,
      received: t.parsedType
    }), H;
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
  setLimit(e, t, i, r) {
    return new Mr({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: F.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Mr({
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
Mr.create = (n) => new Mr({
  checks: [],
  typeName: J.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...G(n)
});
class fo extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== U.boolean) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.boolean,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
fo.create = (n) => new fo({
  typeName: J.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...G(n)
});
class ui extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== U.date) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: U.date,
        received: s.parsedType
      }), H;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_date
      }), H;
    }
    const i = new Ce();
    let r;
    for (const s of this._def.checks)
      s.kind === "min" ? e.data.getTime() < s.value && (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.too_small,
        message: s.message,
        inclusive: !0,
        exact: !1,
        minimum: s.value,
        type: "date"
      }), i.dirty()) : s.kind === "max" ? e.data.getTime() > s.value && (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.too_big,
        message: s.message,
        inclusive: !0,
        exact: !1,
        maximum: s.value,
        type: "date"
      }), i.dirty()) : ee.assertNever(s);
    return {
      status: i.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new ui({
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
ui.create = (n) => new ui({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: J.ZodDate,
  ...G(n)
});
class po extends Q {
  _parse(e) {
    if (this._getType(e) !== U.symbol) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.symbol,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
po.create = (n) => new po({
  typeName: J.ZodSymbol,
  ...G(n)
});
class go extends Q {
  _parse(e) {
    if (this._getType(e) !== U.undefined) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.undefined,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
go.create = (n) => new go({
  typeName: J.ZodUndefined,
  ...G(n)
});
class yo extends Q {
  _parse(e) {
    if (this._getType(e) !== U.null) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.null,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
yo.create = (n) => new yo({
  typeName: J.ZodNull,
  ...G(n)
});
class vo extends Q {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Ae(e.data);
  }
}
vo.create = (n) => new vo({
  typeName: J.ZodAny,
  ...G(n)
});
class bo extends Q {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Ae(e.data);
  }
}
bo.create = (n) => new bo({
  typeName: J.ZodUnknown,
  ...G(n)
});
class mt extends Q {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return M(t, {
      code: V.invalid_type,
      expected: U.never,
      received: t.parsedType
    }), H;
  }
}
mt.create = (n) => new mt({
  typeName: J.ZodNever,
  ...G(n)
});
class mo extends Q {
  _parse(e) {
    if (this._getType(e) !== U.undefined) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.void,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
mo.create = (n) => new mo({
  typeName: J.ZodVoid,
  ...G(n)
});
class Ke extends Q {
  _parse(e) {
    const { ctx: t, status: i } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== U.array)
      return M(t, {
        code: V.invalid_type,
        expected: U.array,
        received: t.parsedType
      }), H;
    if (r.exactLength !== null) {
      const o = t.data.length > r.exactLength.value, a = t.data.length < r.exactLength.value;
      (o || a) && (M(t, {
        code: o ? V.too_big : V.too_small,
        minimum: a ? r.exactLength.value : void 0,
        maximum: o ? r.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: r.exactLength.message
      }), i.dirty());
    }
    if (r.minLength !== null && t.data.length < r.minLength.value && (M(t, {
      code: V.too_small,
      minimum: r.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.minLength.message
    }), i.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (M(t, {
      code: V.too_big,
      maximum: r.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: r.maxLength.message
    }), i.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, a) => r.type._parseAsync(new bt(t, o, t.path, a)))).then((o) => Ce.mergeArray(i, o));
    const s = [...t.data].map((o, a) => r.type._parseSync(new bt(t, o, t.path, a)));
    return Ce.mergeArray(i, s);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new Ke({
      ...this._def,
      minLength: { value: e, message: F.toString(t) }
    });
  }
  max(e, t) {
    return new Ke({
      ...this._def,
      maxLength: { value: e, message: F.toString(t) }
    });
  }
  length(e, t) {
    return new Ke({
      ...this._def,
      exactLength: { value: e, message: F.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Ke.create = (n, e) => new Ke({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: J.ZodArray,
  ...G(e)
});
function Kt(n) {
  if (n instanceof ve) {
    const e = {};
    for (const t in n.shape) {
      const i = n.shape[t];
      e[t] = vt.create(Kt(i));
    }
    return new ve({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof Ke ? new Ke({
    ...n._def,
    type: Kt(n.element)
  }) : n instanceof vt ? vt.create(Kt(n.unwrap())) : n instanceof _n ? _n.create(Kt(n.unwrap())) : n instanceof Ft ? Ft.create(n.items.map((e) => Kt(e))) : n;
}
class ve extends Q {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = ee.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== U.object) {
      const l = this._getOrReturnCtx(e);
      return M(l, {
        code: V.invalid_type,
        expected: U.object,
        received: l.parsedType
      }), H;
    }
    const { status: i, ctx: r } = this._processInputParams(e), { shape: s, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof mt && this._def.unknownKeys === "strip"))
      for (const l in r.data)
        o.includes(l) || a.push(l);
    const u = [];
    for (const l of o) {
      const c = s[l], h = r.data[l];
      u.push({
        key: { status: "valid", value: l },
        value: c._parse(new bt(r, h, r.path, l)),
        alwaysSet: l in r.data
      });
    }
    if (this._def.catchall instanceof mt) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const c of a)
          u.push({
            key: { status: "valid", value: c },
            value: { status: "valid", value: r.data[c] }
          });
      else if (l === "strict")
        a.length > 0 && (M(r, {
          code: V.unrecognized_keys,
          keys: a
        }), i.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const c of a) {
        const h = r.data[c];
        u.push({
          key: { status: "valid", value: c },
          value: l._parse(
            new bt(r, h, r.path, c)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: c in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const c of u) {
        const h = await c.key, y = await c.value;
        l.push({
          key: h,
          value: y,
          alwaysSet: c.alwaysSet
        });
      }
      return l;
    }).then((l) => Ce.mergeObjectSync(i, l)) : Ce.mergeObjectSync(i, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return F.errToObj, new ve({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, i) => {
          var s, o;
          const r = ((o = (s = this._def).errorMap) == null ? void 0 : o.call(s, t, i).message) ?? i.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: F.errToObj(e).message ?? r
          } : {
            message: r
          };
        }
      } : {}
    });
  }
  strip() {
    return new ve({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ve({
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
    return new ve({
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
    return new ve({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: J.ZodObject
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
    return new ve({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const i of ee.objectKeys(e))
      e[i] && this.shape[i] && (t[i] = this.shape[i]);
    return new ve({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const i of ee.objectKeys(this.shape))
      e[i] || (t[i] = this.shape[i]);
    return new ve({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Kt(this);
  }
  partial(e) {
    const t = {};
    for (const i of ee.objectKeys(this.shape)) {
      const r = this.shape[i];
      e && !e[i] ? t[i] = r : t[i] = r.optional();
    }
    return new ve({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const i of ee.objectKeys(this.shape))
      if (e && !e[i])
        t[i] = this.shape[i];
      else {
        let s = this.shape[i];
        for (; s instanceof vt; )
          s = s._def.innerType;
        t[i] = s;
      }
    return new ve({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Xc(ee.objectKeys(this.shape));
  }
}
ve.create = (n, e) => new ve({
  shape: () => n,
  unknownKeys: "strip",
  catchall: mt.create(),
  typeName: J.ZodObject,
  ...G(e)
});
ve.strictCreate = (n, e) => new ve({
  shape: () => n,
  unknownKeys: "strict",
  catchall: mt.create(),
  typeName: J.ZodObject,
  ...G(e)
});
ve.lazycreate = (n, e) => new ve({
  shape: n,
  unknownKeys: "strip",
  catchall: mt.create(),
  typeName: J.ZodObject,
  ...G(e)
});
class li extends Q {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = this._def.options;
    function r(s) {
      for (const a of s)
        if (a.result.status === "valid")
          return a.result;
      for (const a of s)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = s.map((a) => new it(a.ctx.common.issues));
      return M(t, {
        code: V.invalid_union,
        unionErrors: o
      }), H;
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
      })).then(r);
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
      const a = o.map((u) => new it(u));
      return M(t, {
        code: V.invalid_union,
        unionErrors: a
      }), H;
    }
  }
  get options() {
    return this._def.options;
  }
}
li.create = (n, e) => new li({
  options: n,
  typeName: J.ZodUnion,
  ...G(e)
});
function ws(n, e) {
  const t = at(n), i = at(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === U.object && i === U.object) {
    const r = ee.objectKeys(e), s = ee.objectKeys(n).filter((a) => r.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of s) {
      const u = ws(n[a], e[a]);
      if (!u.valid)
        return { valid: !1 };
      o[a] = u.data;
    }
    return { valid: !0, data: o };
  } else if (t === U.array && i === U.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const r = [];
    for (let s = 0; s < n.length; s++) {
      const o = n[s], a = e[s], u = ws(o, a);
      if (!u.valid)
        return { valid: !1 };
      r.push(u.data);
    }
    return { valid: !0, data: r };
  } else return t === U.date && i === U.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class hi extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e), r = (s, o) => {
      if (uo(s) || uo(o))
        return H;
      const a = ws(s.value, o.value);
      return a.valid ? ((lo(s) || lo(o)) && t.dirty(), { status: t.value, value: a.data }) : (M(i, {
        code: V.invalid_intersection_types
      }), H);
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
    ]).then(([s, o]) => r(s, o)) : r(this._def.left._parseSync({
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
hi.create = (n, e, t) => new hi({
  left: n,
  right: e,
  typeName: J.ZodIntersection,
  ...G(t)
});
class Ft extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.array)
      return M(i, {
        code: V.invalid_type,
        expected: U.array,
        received: i.parsedType
      }), H;
    if (i.data.length < this._def.items.length)
      return M(i, {
        code: V.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), H;
    !this._def.rest && i.data.length > this._def.items.length && (M(i, {
      code: V.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const s = [...i.data].map((o, a) => {
      const u = this._def.items[a] || this._def.rest;
      return u ? u._parse(new bt(i, o, i.path, a)) : null;
    }).filter((o) => !!o);
    return i.common.async ? Promise.all(s).then((o) => Ce.mergeArray(t, o)) : Ce.mergeArray(t, s);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Ft({
      ...this._def,
      rest: e
    });
  }
}
Ft.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ft({
    items: n,
    typeName: J.ZodTuple,
    rest: null,
    ...G(e)
  });
};
class wo extends Q {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.map)
      return M(i, {
        code: V.invalid_type,
        expected: U.map,
        received: i.parsedType
      }), H;
    const r = this._def.keyType, s = this._def.valueType, o = [...i.data.entries()].map(([a, u], l) => ({
      key: r._parse(new bt(i, a, i.path, [l, "key"])),
      value: s._parse(new bt(i, u, i.path, [l, "value"]))
    }));
    if (i.common.async) {
      const a = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of o) {
          const l = await u.key, c = await u.value;
          if (l.status === "aborted" || c.status === "aborted")
            return H;
          (l.status === "dirty" || c.status === "dirty") && t.dirty(), a.set(l.value, c.value);
        }
        return { status: t.value, value: a };
      });
    } else {
      const a = /* @__PURE__ */ new Map();
      for (const u of o) {
        const l = u.key, c = u.value;
        if (l.status === "aborted" || c.status === "aborted")
          return H;
        (l.status === "dirty" || c.status === "dirty") && t.dirty(), a.set(l.value, c.value);
      }
      return { status: t.value, value: a };
    }
  }
}
wo.create = (n, e, t) => new wo({
  valueType: e,
  keyType: n,
  typeName: J.ZodMap,
  ...G(t)
});
class Dr extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== U.set)
      return M(i, {
        code: V.invalid_type,
        expected: U.set,
        received: i.parsedType
      }), H;
    const r = this._def;
    r.minSize !== null && i.data.size < r.minSize.value && (M(i, {
      code: V.too_small,
      minimum: r.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.minSize.message
    }), t.dirty()), r.maxSize !== null && i.data.size > r.maxSize.value && (M(i, {
      code: V.too_big,
      maximum: r.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: r.maxSize.message
    }), t.dirty());
    const s = this._def.valueType;
    function o(u) {
      const l = /* @__PURE__ */ new Set();
      for (const c of u) {
        if (c.status === "aborted")
          return H;
        c.status === "dirty" && t.dirty(), l.add(c.value);
      }
      return { status: t.value, value: l };
    }
    const a = [...i.data.values()].map((u, l) => s._parse(new bt(i, u, i.path, l)));
    return i.common.async ? Promise.all(a).then((u) => o(u)) : o(a);
  }
  min(e, t) {
    return new Dr({
      ...this._def,
      minSize: { value: e, message: F.toString(t) }
    });
  }
  max(e, t) {
    return new Dr({
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
Dr.create = (n, e) => new Dr({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: J.ZodSet,
  ...G(e)
});
class _o extends Q {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
_o.create = (n, e) => new _o({
  getter: n,
  typeName: J.ZodLazy,
  ...G(e)
});
class ko extends Q {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return M(t, {
        received: t.data,
        code: V.invalid_literal,
        expected: this._def.value
      }), H;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
ko.create = (n, e) => new ko({
  value: n,
  typeName: J.ZodLiteral,
  ...G(e)
});
function Xc(n, e) {
  return new mn({
    values: n,
    typeName: J.ZodEnum,
    ...G(e)
  });
}
class mn extends Q {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), i = this._def.values;
      return M(t, {
        expected: ee.joinValues(i),
        received: t.parsedType,
        code: V.invalid_type
      }), H;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), i = this._def.values;
      return M(t, {
        received: t.data,
        code: V.invalid_enum_value,
        options: i
      }), H;
    }
    return Ae(e.data);
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
    return mn.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return mn.create(this.options.filter((i) => !e.includes(i)), {
      ...this._def,
      ...t
    });
  }
}
mn.create = Xc;
class So extends Q {
  _parse(e) {
    const t = ee.getValidEnumValues(this._def.values), i = this._getOrReturnCtx(e);
    if (i.parsedType !== U.string && i.parsedType !== U.number) {
      const r = ee.objectValues(t);
      return M(i, {
        expected: ee.joinValues(r),
        received: i.parsedType,
        code: V.invalid_type
      }), H;
    }
    if (this._cache || (this._cache = new Set(ee.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = ee.objectValues(t);
      return M(i, {
        received: i.data,
        code: V.invalid_enum_value,
        options: r
      }), H;
    }
    return Ae(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
So.create = (n, e) => new So({
  values: n,
  typeName: J.ZodNativeEnum,
  ...G(e)
});
class di extends Q {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== U.promise && t.common.async === !1)
      return M(t, {
        code: V.invalid_type,
        expected: U.promise,
        received: t.parsedType
      }), H;
    const i = t.parsedType === U.promise ? t.data : Promise.resolve(t.data);
    return Ae(i.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
di.create = (n, e) => new di({
  type: n,
  typeName: J.ZodPromise,
  ...G(e)
});
class wn extends Q {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === J.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e), r = this._def.effect || null, s = {
      addIssue: (o) => {
        M(i, o), o.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return i.path;
      }
    };
    if (s.addIssue = s.addIssue.bind(s), r.type === "preprocess") {
      const o = r.transform(i.data, s);
      if (i.common.async)
        return Promise.resolve(o).then(async (a) => {
          if (t.value === "aborted")
            return H;
          const u = await this._def.schema._parseAsync({
            data: a,
            path: i.path,
            parent: i
          });
          return u.status === "aborted" ? H : u.status === "dirty" || t.value === "dirty" ? Tr(u.value) : u;
        });
      {
        if (t.value === "aborted")
          return H;
        const a = this._def.schema._parseSync({
          data: o,
          path: i.path,
          parent: i
        });
        return a.status === "aborted" ? H : a.status === "dirty" || t.value === "dirty" ? Tr(a.value) : a;
      }
    }
    if (r.type === "refinement") {
      const o = (a) => {
        const u = r.refinement(a, s);
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
        return a.status === "aborted" ? H : (a.status === "dirty" && t.dirty(), o(a.value), { status: t.value, value: a.value });
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((a) => a.status === "aborted" ? H : (a.status === "dirty" && t.dirty(), o(a.value).then(() => ({ status: t.value, value: a.value }))));
    }
    if (r.type === "transform")
      if (i.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: i.data,
          path: i.path,
          parent: i
        });
        if (!vn(o))
          return H;
        const a = r.transform(o.value, s);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((o) => vn(o) ? Promise.resolve(r.transform(o.value, s)).then((a) => ({
          status: t.value,
          value: a
        })) : H);
    ee.assertNever(r);
  }
}
wn.create = (n, e, t) => new wn({
  schema: n,
  typeName: J.ZodEffects,
  effect: e,
  ...G(t)
});
wn.createWithPreprocess = (n, e, t) => new wn({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: J.ZodEffects,
  ...G(t)
});
class vt extends Q {
  _parse(e) {
    return this._getType(e) === U.undefined ? Ae(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
vt.create = (n, e) => new vt({
  innerType: n,
  typeName: J.ZodOptional,
  ...G(e)
});
class _n extends Q {
  _parse(e) {
    return this._getType(e) === U.null ? Ae(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
_n.create = (n, e) => new _n({
  innerType: n,
  typeName: J.ZodNullable,
  ...G(e)
});
class _s extends Q {
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
_s.create = (n, e) => new _s({
  innerType: n,
  typeName: J.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...G(e)
});
class ks extends Q {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, r = this._def.innerType._parse({
      data: i.data,
      path: i.path,
      parent: {
        ...i
      }
    });
    return ci(r) ? r.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new it(i.common.issues);
        },
        input: i.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new it(i.common.issues);
        },
        input: i.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ks.create = (n, e) => new ks({
  innerType: n,
  typeName: J.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...G(e)
});
class xo extends Q {
  _parse(e) {
    if (this._getType(e) !== U.nan) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: U.nan,
        received: i.parsedType
      }), H;
    }
    return { status: "valid", value: e.data };
  }
}
xo.create = (n) => new xo({
  typeName: J.ZodNaN,
  ...G(n)
});
class lh extends Q {
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
class Hs extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: i.data,
          path: i.path,
          parent: i
        });
        return s.status === "aborted" ? H : s.status === "dirty" ? (t.dirty(), Tr(s.value)) : this._def.out._parseAsync({
          data: s.value,
          path: i.path,
          parent: i
        });
      })();
    {
      const r = this._def.in._parseSync({
        data: i.data,
        path: i.path,
        parent: i
      });
      return r.status === "aborted" ? H : r.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: r.value
      }) : this._def.out._parseSync({
        data: r.value,
        path: i.path,
        parent: i
      });
    }
  }
  static create(e, t) {
    return new Hs({
      in: e,
      out: t,
      typeName: J.ZodPipeline
    });
  }
}
class Ss extends Q {
  _parse(e) {
    const t = this._def.innerType._parse(e), i = (r) => (vn(r) && (r.value = Object.freeze(r.value)), r);
    return ci(t) ? t.then((r) => i(r)) : i(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ss.create = (n, e) => new Ss({
  innerType: n,
  typeName: J.ZodReadonly,
  ...G(e)
});
var J;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(J || (J = {}));
const Yc = yt.create, hh = bn.create;
mt.create;
Ke.create;
li.create;
hi.create;
Ft.create;
mn.create;
di.create;
vt.create;
_n.create;
function dh(n) {
  if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
  var e = n.default;
  if (typeof e == "function") {
    var t = function i() {
      return this instanceof i ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(n).forEach(function(i) {
    var r = Object.getOwnPropertyDescriptor(n, i);
    Object.defineProperty(t, i, r.get ? r : {
      enumerable: !0,
      get: function() {
        return n[i];
      }
    });
  }), t;
}
var Ci = {}, xs = function(n, e) {
  return xs = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, i) {
    t.__proto__ = i;
  } || function(t, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r]);
  }, xs(n, e);
};
function Qc(n, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  xs(n, e);
  function t() {
    this.constructor = n;
  }
  n.prototype = e === null ? Object.create(e) : (t.prototype = e.prototype, new t());
}
var fi = function() {
  return fi = Object.assign || function(e) {
    for (var t, i = 1, r = arguments.length; i < r; i++) {
      t = arguments[i];
      for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[s] = t[s]);
    }
    return e;
  }, fi.apply(this, arguments);
};
function $c(n, e) {
  var t = {};
  for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && e.indexOf(i) < 0 && (t[i] = n[i]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, i = Object.getOwnPropertySymbols(n); r < i.length; r++)
      e.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(n, i[r]) && (t[i[r]] = n[i[r]]);
  return t;
}
function eu(n, e, t, i) {
  var r = arguments.length, s = r < 3 ? e : i === null ? i = Object.getOwnPropertyDescriptor(e, t) : i, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") s = Reflect.decorate(n, e, t, i);
  else for (var a = n.length - 1; a >= 0; a--) (o = n[a]) && (s = (r < 3 ? o(s) : r > 3 ? o(e, t, s) : o(e, t)) || s);
  return r > 3 && s && Object.defineProperty(e, t, s), s;
}
function tu(n, e) {
  return function(t, i) {
    e(t, i, n);
  };
}
function nu(n, e, t, i, r, s) {
  function o(_) {
    if (_ !== void 0 && typeof _ != "function") throw new TypeError("Function expected");
    return _;
  }
  for (var a = i.kind, u = a === "getter" ? "get" : a === "setter" ? "set" : "value", l = !e && n ? i.static ? n : n.prototype : null, c = e || (l ? Object.getOwnPropertyDescriptor(l, i.name) : {}), h, y = !1, p = t.length - 1; p >= 0; p--) {
    var m = {};
    for (var k in i) m[k] = k === "access" ? {} : i[k];
    for (var k in i.access) m.access[k] = i.access[k];
    m.addInitializer = function(_) {
      if (y) throw new TypeError("Cannot add initializers after decoration has completed");
      s.push(o(_ || null));
    };
    var b = (0, t[p])(a === "accessor" ? { get: c.get, set: c.set } : c[u], m);
    if (a === "accessor") {
      if (b === void 0) continue;
      if (b === null || typeof b != "object") throw new TypeError("Object expected");
      (h = o(b.get)) && (c.get = h), (h = o(b.set)) && (c.set = h), (h = o(b.init)) && r.unshift(h);
    } else (h = o(b)) && (a === "field" ? r.unshift(h) : c[u] = h);
  }
  l && Object.defineProperty(l, i.name, c), y = !0;
}
function ru(n, e, t) {
  for (var i = arguments.length > 2, r = 0; r < e.length; r++)
    t = i ? e[r].call(n, t) : e[r].call(n);
  return i ? t : void 0;
}
function iu(n) {
  return typeof n == "symbol" ? n : "".concat(n);
}
function su(n, e, t) {
  return typeof e == "symbol" && (e = e.description ? "[".concat(e.description, "]") : ""), Object.defineProperty(n, "name", { configurable: !0, value: t ? "".concat(t, " ", e) : e });
}
function ou(n, e) {
  if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(n, e);
}
function au(n, e, t, i) {
  function r(s) {
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
      c.done ? s(c.value) : r(c.value).then(a, u);
    }
    l((i = i.apply(n, e || [])).next());
  });
}
function cu(n, e) {
  var t = { label: 0, sent: function() {
    if (s[0] & 1) throw s[1];
    return s[1];
  }, trys: [], ops: [] }, i, r, s, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
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
      if (i = 1, r && (s = l[0] & 2 ? r.return : l[0] ? r.throw || ((s = r.return) && s.call(r), 0) : r.next) && !(s = s.call(r, l[1])).done) return s;
      switch (r = 0, s && (l = [l[0] & 2, s.value]), l[0]) {
        case 0:
        case 1:
          s = l;
          break;
        case 4:
          return t.label++, { value: l[1], done: !1 };
        case 5:
          t.label++, r = l[1], l = [0];
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
      l = e.call(n, t);
    } catch (c) {
      l = [6, c], r = 0;
    } finally {
      i = s = 0;
    }
    if (l[0] & 5) throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
var yi = Object.create ? (function(n, e, t, i) {
  i === void 0 && (i = t);
  var r = Object.getOwnPropertyDescriptor(e, t);
  (!r || ("get" in r ? !e.__esModule : r.writable || r.configurable)) && (r = { enumerable: !0, get: function() {
    return e[t];
  } }), Object.defineProperty(n, i, r);
}) : (function(n, e, t, i) {
  i === void 0 && (i = t), n[i] = e[t];
});
function uu(n, e) {
  for (var t in n) t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && yi(e, n, t);
}
function pi(n) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && n[e], i = 0;
  if (t) return t.call(n);
  if (n && typeof n.length == "number") return {
    next: function() {
      return n && i >= n.length && (n = void 0), { value: n && n[i++], done: !n };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Js(n, e) {
  var t = typeof Symbol == "function" && n[Symbol.iterator];
  if (!t) return n;
  var i = t.call(n), r, s = [], o;
  try {
    for (; (e === void 0 || e-- > 0) && !(r = i.next()).done; ) s.push(r.value);
  } catch (a) {
    o = { error: a };
  } finally {
    try {
      r && !r.done && (t = i.return) && t.call(i);
    } finally {
      if (o) throw o.error;
    }
  }
  return s;
}
function lu() {
  for (var n = [], e = 0; e < arguments.length; e++)
    n = n.concat(Js(arguments[e]));
  return n;
}
function hu() {
  for (var n = 0, e = 0, t = arguments.length; e < t; e++) n += arguments[e].length;
  for (var i = Array(n), r = 0, e = 0; e < t; e++)
    for (var s = arguments[e], o = 0, a = s.length; o < a; o++, r++)
      i[r] = s[o];
  return i;
}
function du(n, e, t) {
  if (t || arguments.length === 2) for (var i = 0, r = e.length, s; i < r; i++)
    (s || !(i in e)) && (s || (s = Array.prototype.slice.call(e, 0, i)), s[i] = e[i]);
  return n.concat(s || Array.prototype.slice.call(e));
}
function kn(n) {
  return this instanceof kn ? (this.v = n, this) : new kn(n);
}
function fu(n, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var i = t.apply(n, e || []), r, s = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function o(p) {
    return function(m) {
      return Promise.resolve(m).then(p, h);
    };
  }
  function a(p, m) {
    i[p] && (r[p] = function(k) {
      return new Promise(function(b, _) {
        s.push([p, k, b, _]) > 1 || u(p, k);
      });
    }, m && (r[p] = m(r[p])));
  }
  function u(p, m) {
    try {
      l(i[p](m));
    } catch (k) {
      y(s[0][3], k);
    }
  }
  function l(p) {
    p.value instanceof kn ? Promise.resolve(p.value.v).then(c, h) : y(s[0][2], p);
  }
  function c(p) {
    u("next", p);
  }
  function h(p) {
    u("throw", p);
  }
  function y(p, m) {
    p(m), s.shift(), s.length && u(s[0][0], s[0][1]);
  }
}
function pu(n) {
  var e, t;
  return e = {}, i("next"), i("throw", function(r) {
    throw r;
  }), i("return"), e[Symbol.iterator] = function() {
    return this;
  }, e;
  function i(r, s) {
    e[r] = n[r] ? function(o) {
      return (t = !t) ? { value: kn(n[r](o)), done: !1 } : s ? s(o) : o;
    } : s;
  }
}
function gu(n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = n[Symbol.asyncIterator], t;
  return e ? e.call(n) : (n = typeof pi == "function" ? pi(n) : n[Symbol.iterator](), t = {}, i("next"), i("throw"), i("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function i(s) {
    t[s] = n[s] && function(o) {
      return new Promise(function(a, u) {
        o = n[s](o), r(a, u, o.done, o.value);
      });
    };
  }
  function r(s, o, a, u) {
    Promise.resolve(u).then(function(l) {
      s({ value: l, done: a });
    }, o);
  }
}
function yu(n, e) {
  return Object.defineProperty ? Object.defineProperty(n, "raw", { value: e }) : n.raw = e, n;
}
var fh = Object.create ? (function(n, e) {
  Object.defineProperty(n, "default", { enumerable: !0, value: e });
}) : function(n, e) {
  n.default = e;
}, Os = function(n) {
  return Os = Object.getOwnPropertyNames || function(e) {
    var t = [];
    for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[t.length] = i);
    return t;
  }, Os(n);
};
function vu(n) {
  if (n && n.__esModule) return n;
  var e = {};
  if (n != null) for (var t = Os(n), i = 0; i < t.length; i++) t[i] !== "default" && yi(e, n, t[i]);
  return fh(e, n), e;
}
function bu(n) {
  return n && n.__esModule ? n : { default: n };
}
function mu(n, e, t, i) {
  if (t === "a" && !i) throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? n !== e || !i : !e.has(n)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return t === "m" ? i : t === "a" ? i.call(n) : i ? i.value : e.get(n);
}
function wu(n, e, t, i, r) {
  if (i === "m") throw new TypeError("Private method is not writable");
  if (i === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof e == "function" ? n !== e || !r : !e.has(n)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return i === "a" ? r.call(n, t) : r ? r.value = t : e.set(n, t), t;
}
function _u(n, e) {
  if (e === null || typeof e != "object" && typeof e != "function") throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof n == "function" ? e === n : n.has(e);
}
function ku(n, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, r;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (r = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    r && (i = function() {
      try {
        r.call(this);
      } catch (s) {
        return Promise.reject(s);
      }
    }), n.stack.push({ value: e, dispose: i, async: t });
  } else t && n.stack.push({ async: !0 });
  return e;
}
var ph = typeof SuppressedError == "function" ? SuppressedError : function(n, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = n, i.suppressed = e, i;
};
function Su(n) {
  function e(s) {
    n.error = n.hasError ? new ph(s, n.error, "An error was suppressed during disposal.") : s, n.hasError = !0;
  }
  var t, i = 0;
  function r() {
    for (; t = n.stack.pop(); )
      try {
        if (!t.async && i === 1) return i = 0, n.stack.push(t), Promise.resolve().then(r);
        if (t.dispose) {
          var s = t.dispose.call(t.value);
          if (t.async) return i |= 2, Promise.resolve(s).then(r, function(o) {
            return e(o), r();
          });
        } else i |= 1;
      } catch (o) {
        e(o);
      }
    if (i === 1) return n.hasError ? Promise.reject(n.error) : Promise.resolve();
    if (n.hasError) throw n.error;
  }
  return r();
}
function xu(n, e) {
  return typeof n == "string" && /^\.\.?\//.test(n) ? n.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(t, i, r, s, o) {
    return i ? e ? ".jsx" : ".js" : r && (!s || !o) ? t : r + s + "." + o.toLowerCase() + "js";
  }) : n;
}
const gh = {
  __extends: Qc,
  __assign: fi,
  __rest: $c,
  __decorate: eu,
  __param: tu,
  __esDecorate: nu,
  __runInitializers: ru,
  __propKey: iu,
  __setFunctionName: su,
  __metadata: ou,
  __awaiter: au,
  __generator: cu,
  __createBinding: yi,
  __exportStar: uu,
  __values: pi,
  __read: Js,
  __spread: lu,
  __spreadArrays: hu,
  __spreadArray: du,
  __await: kn,
  __asyncGenerator: fu,
  __asyncDelegator: pu,
  __asyncValues: gu,
  __makeTemplateObject: yu,
  __importStar: vu,
  __importDefault: bu,
  __classPrivateFieldGet: mu,
  __classPrivateFieldSet: wu,
  __classPrivateFieldIn: _u,
  __addDisposableResource: ku,
  __disposeResources: Su,
  __rewriteRelativeImportExtension: xu
}, yh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __addDisposableResource: ku,
  get __assign() {
    return fi;
  },
  __asyncDelegator: pu,
  __asyncGenerator: fu,
  __asyncValues: gu,
  __await: kn,
  __awaiter: au,
  __classPrivateFieldGet: mu,
  __classPrivateFieldIn: _u,
  __classPrivateFieldSet: wu,
  __createBinding: yi,
  __decorate: eu,
  __disposeResources: Su,
  __esDecorate: nu,
  __exportStar: uu,
  __extends: Qc,
  __generator: cu,
  __importDefault: bu,
  __importStar: vu,
  __makeTemplateObject: yu,
  __metadata: ou,
  __param: tu,
  __propKey: iu,
  __read: Js,
  __rest: $c,
  __rewriteRelativeImportExtension: xu,
  __runInitializers: ru,
  __setFunctionName: su,
  __spread: lu,
  __spreadArray: du,
  __spreadArrays: hu,
  __values: pi,
  default: gh
}, Symbol.toStringTag, { value: "Module" })), re = /* @__PURE__ */ dh(yh);
var Ii = {}, Ti = {}, Oo;
function vh() {
  return Oo || (Oo = 1, Object.defineProperty(Ti, "__esModule", { value: !0 })), Ti;
}
var Ai = {}, Nn = {}, ji = {}, Ei = {}, Cn = {}, No;
function bh() {
  if (No) return Cn;
  No = 1, Object.defineProperty(Cn, "__esModule", { value: !0 }), Cn.dim = void 0;
  const n = (e) => e;
  return Cn.dim = n, Cn;
}
var Co;
function mh() {
  return Co || (Co = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.toLine = void 0;
    const e = bh(), t = (r) => " " + (r.length ? `{ ${r.toString().split(",").map((s) => Number(s).toString(16).toUpperCase().padStart(r.BYTES_PER_ELEMENT << 1, "0")).join(" ")} }` : "{}"), i = (r, s = " ") => {
      switch (r) {
        case null:
          return "!n";
        case void 0:
          return "!u";
        case !0:
          return "!t";
        case !1:
          return "!f";
      }
      switch (typeof r) {
        case "number":
        case "bigint": {
          const o = typeof r == "number" && Math.round(r) !== r ? r + "" : Intl.NumberFormat("en-US").format(r) + (typeof r == "bigint" ? "n" : "");
          return o[0] === "0" && o[1] === "." ? o.slice(1) : o;
        }
        case "string":
          return r ? r.split(/([\u0000-\u001F]|\n|\t)/).filter(Boolean).map((a) => a === `
` ? "⏎" : a === "	" ? "⇥" : a.length === 1 && a.charCodeAt(0) < 32 ? "\\x" + a.charCodeAt(0).toString(16).padStart(2, "0") : (0, e.dim)('"') + JSON.stringify(a).slice(1, -1) + (0, e.dim)('"')).join(" ") : '""';
        case "object": {
          if (Array.isArray(r))
            return r.length ? `[${s}${r.map((a) => (0, n.toLine)(a, s)).join("," + s)}${s}]` : "[]";
          if (r instanceof DataView)
            return r.constructor.name + t(new Uint8Array(r.buffer, r.byteOffset, r.byteLength));
          if (ArrayBuffer.isView(r))
            return r.constructor.name + t(r);
          if (r instanceof ArrayBuffer)
            return "ArrayBuffer" + t(new Uint8Array(r));
          if (r instanceof Date)
            return "Date { " + r.getTime() + " }";
          if (r instanceof RegExp)
            return r + "";
          const o = Object.keys(r);
          return o.length ? `{${s}${o.map((a) => `${a}${s}${(0, e.dim)("=")}${s}${(0, n.toLine)(r[a], s)}`).join("," + s)}${s}}` : "{}";
        }
        case "function":
          return `fn ${(0, n.toLine)(r.name)} ( ${r.length} args )`;
        case "symbol":
          return `sym ( ${r.description} )`;
      }
      return "?";
    };
    n.toLine = i;
  })(Ei)), Ei;
}
var Pi = {}, Ri = {}, Io;
function wh() {
  return Io || (Io = 1, Object.defineProperty(Ri, "__esModule", { value: !0 })), Ri;
}
var Li = {}, Bi = {}, To;
function _h() {
  return To || (To = 1, Object.defineProperty(Bi, "__esModule", { value: !0 })), Bi;
}
var Vi = {}, Ao;
function kh() {
  return Ao || (Ao = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.ServerClockVector = n.ClockVector = n.LogicalClock = n.interval = n.printTs = n.containsId = n.contains = n.compare = n.equal = n.tick = n.tss = n.ts = n.Timespan = n.Timestamp = void 0;
    class e {
      constructor(b, _) {
        this.sid = b, this.time = _;
      }
    }
    n.Timestamp = e;
    class t {
      constructor(b, _, f) {
        this.sid = b, this.time = _, this.span = f;
      }
    }
    n.Timespan = t;
    const i = (k, b) => new e(k, b);
    n.ts = i;
    const r = (k, b, _) => new t(k, b, _);
    n.tss = r;
    const s = (k, b) => (0, n.ts)(k.sid, k.time + b);
    n.tick = s;
    const o = (k, b) => k.time === b.time && k.sid === b.sid;
    n.equal = o;
    const a = (k, b) => {
      const _ = k.time, f = b.time;
      if (_ > f)
        return 1;
      if (_ < f)
        return -1;
      const d = k.sid, g = b.sid;
      return d > g ? 1 : d < g ? -1 : 0;
    };
    n.compare = a;
    const u = (k, b, _, f) => {
      if (k.sid !== _.sid)
        return !1;
      const d = k.time, g = _.time;
      return !(d > g || d + b < g + f);
    };
    n.contains = u;
    const l = (k, b, _) => {
      if (k.sid !== _.sid)
        return !1;
      const f = k.time, d = _.time;
      return !(f > d || f + b < d + 1);
    };
    n.containsId = l;
    const c = (k) => {
      if (k.sid === 1)
        return "." + k.time;
      let b = "" + k.sid;
      return b.length > 4 && (b = ".." + b.slice(b.length - 4)), b + "." + k.time;
    };
    n.printTs = c;
    const h = (k, b, _) => new t(k.sid, k.time + b, _);
    n.interval = h;
    class y extends e {
      /**
       * Returns a new timestamp, which is the current clock value, and advances the
       * clock by a number of cycles.
       *
       * @param cycles Number of cycles to advance the clock.
       * @returns A new timestamp, which is the current clock value.
       */
      tick(b) {
        const _ = new e(this.sid, this.time);
        return this.time += b, _;
      }
    }
    n.LogicalClock = y;
    class p extends y {
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
      observe(b, _) {
        const f = b.time + _ - 1, d = b.sid;
        if (d !== this.sid) {
          const g = this.peers.get(b.sid);
          g ? f > g.time && (g.time = f) : this.peers.set(b.sid, (0, n.ts)(d, f));
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
      fork(b) {
        const _ = new p(b, this.time);
        return b !== this.sid && _.observe((0, n.tick)(this, -1), 1), this.peers.forEach((f) => {
          _.observe(f, 1);
        }), _;
      }
      /**
       * Returns a human-readable string representation of the clock vector.
       *
       * @param tab String to use for indentation.
       * @returns Human-readable string representation of the clock vector.
       */
      toString(b = "") {
        const _ = this.peers.size;
        let f = 1, d = "";
        return this.peers.forEach((g) => {
          d += `
${b}${f === _ ? "└─" : "├─"} ${g.sid}.${g.time}`, f++;
        }), `clock ${this.sid}.${this.time}${d}`;
      }
    }
    n.ClockVector = p;
    class m extends y {
      constructor() {
        super(...arguments), this.peers = /* @__PURE__ */ new Map();
      }
      observe(b, _) {
        if (b.sid > 8)
          throw new Error("INVALID_SERVER_SESSION");
        if (this.time < b.time)
          throw new Error("TIME_TRAVEL");
        const f = b.time + _;
        f > this.time && (this.time = f);
      }
      clone() {
        return this.fork();
      }
      fork() {
        return new m(1, this.time);
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
    n.ServerClockVector = m;
  })(Vi)), Vi;
}
var jo;
function le() {
  return jo || (jo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(_h(), n), e.__exportStar(kh(), n);
  })(Li)), Li;
}
var Y = {}, In = {}, Eo;
function je() {
  if (Eo) return In;
  Eo = 1, Object.defineProperty(In, "__esModule", { value: !0 }), In.printTree = void 0;
  const n = (e = "", t) => {
    let i = "", r = t.length - 1;
    for (; r >= 0 && !t[r]; r--)
      ;
    for (let s = 0; s <= r; s++) {
      const o = t[s];
      if (!o)
        continue;
      const a = s === r, u = o(e + (a ? " " : "│") + "  "), l = u ? a ? "└─" : "├─" : "│";
      i += `
` + e + l + (u ? " " + u : "");
    }
    return i;
  };
  return In.printTree = n, In;
}
var Po;
function Gr() {
  if (Po) return Y;
  Po = 1, Object.defineProperty(Y, "__esModule", { value: !0 }), Y.NopOp = Y.DelOp = Y.UpdArrOp = Y.InsArrOp = Y.InsBinOp = Y.InsStrOp = Y.InsVecOp = Y.InsObjOp = Y.InsValOp = Y.NewArrOp = Y.NewBinOp = Y.NewStrOp = Y.NewVecOp = Y.NewObjOp = Y.NewValOp = Y.NewConOp = void 0;
  const n = je(), e = le();
  class t {
    constructor(g) {
      this.id = g;
    }
    span() {
      return 1;
    }
    toString() {
      let g = this.name() + " " + (0, e.printTs)(this.id);
      const v = this.span();
      return v > 1 && (g += "!" + v), g;
    }
  }
  class i extends t {
    constructor(g, v) {
      super(g), this.id = g, this.val = v;
    }
    name() {
      return "new_con";
    }
    toString() {
      const g = this.val, v = "Uint8Array", w = g instanceof e.Timestamp ? `{ ${(0, e.printTs)(g)} }` : g instanceof Uint8Array ? g.length < 13 ? `${v} { ${("" + g).replaceAll(",", ", ")} }` : `${v}(${g.length})` : `{ ${JSON.stringify(g)} }`;
      return super.toString() + " " + w;
    }
  }
  Y.NewConOp = i;
  class r extends t {
    name() {
      return "new_val";
    }
  }
  Y.NewValOp = r;
  class s extends t {
    name() {
      return "new_obj";
    }
  }
  Y.NewObjOp = s;
  class o extends t {
    name() {
      return "new_vec";
    }
  }
  Y.NewVecOp = o;
  class a extends t {
    name() {
      return "new_str";
    }
  }
  Y.NewStrOp = a;
  class u extends t {
    name() {
      return "new_bin";
    }
  }
  Y.NewBinOp = u;
  class l extends t {
    name() {
      return "new_arr";
    }
  }
  Y.NewArrOp = l;
  class c extends t {
    constructor(g, v, w) {
      super(g), this.id = g, this.obj = v, this.val = w;
    }
    name() {
      return "ins_val";
    }
    toString() {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}, val = ${(0, e.printTs)(this.val)}`;
    }
  }
  Y.InsValOp = c;
  class h extends t {
    constructor(g, v, w) {
      super(g), this.id = g, this.obj = v, this.data = w;
    }
    name() {
      return "ins_obj";
    }
    toString(g = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, n.printTree)(g, this.data.map((w) => (x) => `${JSON.stringify(w[0])}: ${(0, e.printTs)(w[1])}`));
    }
  }
  Y.InsObjOp = h;
  class y extends t {
    constructor(g, v, w) {
      super(g), this.id = g, this.obj = v, this.data = w;
    }
    name() {
      return "ins_vec";
    }
    toString(g = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, n.printTree)(g, this.data.map((w) => (x) => `${w[0]}: ${(0, e.printTs)(w[1])}`));
    }
  }
  Y.InsVecOp = y;
  class p extends t {
    constructor(g, v, w, x) {
      super(g), this.id = g, this.obj = v, this.ref = w, this.data = x;
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
  Y.InsStrOp = p;
  class m extends t {
    constructor(g, v, w, x) {
      super(g), this.id = g, this.obj = v, this.ref = w, this.data = x;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_bin";
    }
    toString() {
      const g = (0, e.printTs)(this.ref);
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${g} ← ${this.data} }`;
    }
  }
  Y.InsBinOp = m;
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
    constructor(g, v, w, x) {
      super(g), this.id = g, this.obj = v, this.ref = w, this.data = x;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_arr";
    }
    toString() {
      const g = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = this.data.map(e.printTs).join(", ");
      return super.toString() + ", obj = " + g + " { " + v + " ← " + w + " }";
    }
  }
  Y.InsArrOp = k;
  class b extends t {
    /**
     * @param id ID of this operation.
     * @param obj and "arr" object ID where to update an element.
     * @param ref ID of the element to update.
     * @param val ID of the new value to set.
     */
    constructor(g, v, w, x) {
      super(g), this.id = g, this.obj = v, this.ref = w, this.val = x;
    }
    name() {
      return "upd_arr";
    }
    toString() {
      const g = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = (0, e.printTs)(this.val);
      return super.toString() + ", obj = " + g + " { " + v + ": " + w + " }";
    }
  }
  Y.UpdArrOp = b;
  class _ extends t {
    /**
     * @param id ID of this operation.
     * @param obj Object in which to delete something.
     * @param what ID of the first operation to be deleted.
     */
    constructor(g, v, w) {
      super(g), this.id = g, this.obj = v, this.what = w;
    }
    name() {
      return "del";
    }
    toString() {
      const g = this.what.map((v) => (0, e.printTs)(v) + "!" + v.span).join(", ");
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${g} }`;
    }
  }
  Y.DelOp = _;
  class f extends t {
    constructor(g, v) {
      super(g), this.id = g, this.len = v;
    }
    span() {
      return this.len;
    }
    name() {
      return "nop";
    }
  }
  return Y.NopOp = f, Y;
}
var Tn = {}, Mi = {}, An = {}, jn = {}, En = {}, Pn = {}, Ro;
function Sh() {
  if (Ro) return Pn;
  Ro = 1, Object.defineProperty(Pn, "__esModule", { value: !0 }), Pn.Slice = void 0;
  let n = class {
    constructor(t, i, r, s) {
      this.uint8 = t, this.view = i, this.start = r, this.end = s;
    }
    subarray() {
      return this.uint8.subarray(this.start, this.end);
    }
  };
  return Pn.Slice = n, Pn;
}
var Lo;
function Ou() {
  if (Lo) return En;
  Lo = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.Writer = void 0;
  const n = Sh(), e = new Uint8Array([]), t = new DataView(e.buffer), i = typeof Buffer == "function", r = i ? Buffer.prototype.utf8Write : null, s = i ? Buffer.from : null, o = typeof TextEncoder < "u" ? new TextEncoder() : null;
  let a = class {
    /**
     * @param allocSize Number of bytes to allocate at a time when buffer ends.
     */
    constructor(l = 64 * 1024) {
      this.allocSize = l, this.view = t, this.x0 = 0, this.x = 0, this.uint8 = new Uint8Array(l), this.size = l, this.view = new DataView(this.uint8.buffer);
    }
    /** @ignore */
    grow(l) {
      const c = this.x0, h = this.x, y = this.uint8, p = new Uint8Array(l), m = new DataView(p.buffer), k = y.subarray(c, h);
      p.set(k, 0), this.x = h - c, this.x0 = 0, this.uint8 = p, this.size = l, this.view = m;
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
        const y = c - this.x0, p = l - h, m = y + p;
        this.grow(m <= this.allocSize ? this.allocSize : m * 2);
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
      const l = new n.Slice(this.uint8, this.view, this.x0, this.x);
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
      if (r) {
        const y = r.call(this.uint8, l, this.x, h);
        return this.x += y, y;
      } else if (s) {
        const y = this.uint8, p = y.byteOffset + this.x, k = s(y.buffer).subarray(p, p + h).write(l, 0, h, "utf8");
        return this.x += k, k;
      } else if (c > 1024 && o) {
        const y = o.encodeInto(l, this.uint8.subarray(this.x, this.x + h)).written;
        return this.x += y, y;
      }
      return this.utf8Native(l);
    }
    utf8Native(l) {
      const c = l.length, h = this.uint8;
      let y = this.x, p = 0;
      for (; p < c; ) {
        let k = l.charCodeAt(p++);
        if ((k & 4294967168) === 0) {
          h[y++] = k;
          continue;
        } else if ((k & 4294965248) === 0)
          h[y++] = k >> 6 & 31 | 192;
        else {
          if (k >= 55296 && k <= 56319 && p < c) {
            const b = l.charCodeAt(p);
            (b & 64512) === 56320 && (p++, k = ((k & 1023) << 10) + (b & 1023) + 65536);
          }
          (k & 4294901760) === 0 ? (h[y++] = k >> 12 & 15 | 224, h[y++] = k >> 6 & 63 | 128) : (h[y++] = k >> 18 & 7 | 240, h[y++] = k >> 12 & 63 | 128, h[y++] = k >> 6 & 63 | 128);
        }
        h[y++] = k & 63 | 128;
      }
      const m = y - this.x;
      return this.x = y, m;
    }
    ascii(l) {
      const c = l.length;
      this.ensureCapacity(c);
      const h = this.uint8;
      let y = this.x, p = 0;
      for (; p < c; )
        h[y++] = l.charCodeAt(p++);
      this.x = y;
    }
  };
  return En.Writer = a, En;
}
var Bo;
function Ks() {
  if (Bo) return jn;
  Bo = 1, Object.defineProperty(jn, "__esModule", { value: !0 }), jn.CrdtWriter = void 0;
  const n = Ou();
  let e = class extends n.Writer {
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
    id(i, r) {
      i <= 7 && r <= 15 ? this.u8(i << 4 | r) : (this.b1vu56(1, i), this.vu57(r));
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
        const r = this.uint8;
        r[this.x++] = 128 | i & 127, r[this.x++] = i >>> 7;
      } else if (i <= 2097151) {
        this.ensureCapacity(3);
        const r = this.uint8;
        r[this.x++] = 128 | i & 127, r[this.x++] = 128 | i >>> 7 & 127, r[this.x++] = i >>> 14;
      } else if (i <= 268435455) {
        this.ensureCapacity(4);
        const r = this.uint8;
        r[this.x++] = 128 | i & 127, r[this.x++] = 128 | i >>> 7 & 127, r[this.x++] = 128 | i >>> 14 & 127, r[this.x++] = i >>> 21;
      } else {
        let r = i | 0;
        r < 0 && (r += 4294967296);
        const s = (i - r) / 4294967296;
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
    b1vu56(i, r) {
      if (r <= 63)
        this.u8(i << 7 | r);
      else {
        const s = i << 7 | 64;
        if (r <= 8191) {
          this.ensureCapacity(2);
          const o = this.uint8;
          o[this.x++] = s | r & 63, o[this.x++] = r >>> 6;
        } else if (r <= 1048575) {
          this.ensureCapacity(3);
          const o = this.uint8;
          o[this.x++] = s | r & 63, o[this.x++] = 128 | r >>> 6 & 127, o[this.x++] = r >>> 13;
        } else if (r <= 134217727) {
          this.ensureCapacity(4);
          const o = this.uint8;
          o[this.x++] = s | r & 63, o[this.x++] = 128 | r >>> 6 & 127, o[this.x++] = 128 | r >>> 13 & 127, o[this.x++] = r >>> 20;
        } else {
          let o = r | 0;
          o < 0 && (o += 4294967296);
          const a = (r - o) / 4294967296;
          if (r <= 17179869183) {
            this.ensureCapacity(5);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = a << 5 | r >>> 27;
          } else if (r <= 2199023255551) {
            this.ensureCapacity(6);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | r >>> 27, u[this.x++] = a >>> 2;
          } else if (r <= 281474976710655) {
            this.ensureCapacity(7);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | r >>> 27, u[this.x++] = 128 | (a & 508) >>> 2, u[this.x++] = a >>> 9;
          } else {
            this.ensureCapacity(8);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (a & 3) << 5 | r >>> 27, u[this.x++] = 128 | (a & 508) >>> 2, u[this.x++] = 128 | (a & 65024) >>> 9, u[this.x++] = a >>> 16;
          }
        }
      }
    }
  };
  return jn.CrdtWriter = e, jn;
}
var Rn = {}, Ln = {}, Vo;
function xh() {
  if (Vo) return Ln;
  Vo = 1, Object.defineProperty(Ln, "__esModule", { value: !0 }), Ln.isFloat32 = void 0;
  const n = new DataView(new ArrayBuffer(4)), e = (t) => (n.setFloat32(0, t), t === n.getFloat32(0));
  return Ln.isFloat32 = e, Ln;
}
var Bn = {}, Mo;
function Nu() {
  if (Mo) return Bn;
  Mo = 1, Object.defineProperty(Bn, "__esModule", { value: !0 }), Bn.JsonPackExtension = void 0;
  let n = class {
    constructor(t, i) {
      this.tag = t, this.val = i;
    }
  };
  return Bn.JsonPackExtension = n, Bn;
}
var Vn = {}, Do;
function Oh() {
  if (Do) return Vn;
  Do = 1, Object.defineProperty(Vn, "__esModule", { value: !0 }), Vn.CborEncoderFast = void 0;
  const n = Ou(), e = Number.isSafeInteger;
  let t = class {
    constructor(r = new n.Writer()) {
      this.writer = r;
    }
    encode(r) {
      return this.writeAny(r), this.writer.flush();
    }
    writeAny(r) {
      switch (typeof r) {
        case "number":
          return this.writeNumber(r);
        case "string":
          return this.writeStr(r);
        case "boolean":
          return this.writer.u8(244 + +r);
        case "object": {
          if (!r)
            return this.writer.u8(246);
          switch (r.constructor) {
            case Array:
              return this.writeArr(r);
            default:
              return this.writeObj(r);
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
    writeBoolean(r) {
      r ? this.writer.u8(245) : this.writer.u8(244);
    }
    writeNumber(r) {
      e(r) ? this.writeInteger(r) : typeof r == "bigint" ? this.writeBigInt(r) : this.writeFloat(r);
    }
    writeBigInt(r) {
      r >= 0 ? this.writeBigUint(r) : this.writeBigSint(r);
    }
    writeBigUint(r) {
      if (r <= Number.MAX_SAFE_INTEGER)
        return this.writeUInteger(Number(r));
      this.writer.u8u64(27, r);
    }
    writeBigSint(r) {
      if (r >= Number.MIN_SAFE_INTEGER)
        return this.encodeNint(Number(r));
      const s = -BigInt(1) - r;
      this.writer.u8u64(59, s);
    }
    writeInteger(r) {
      r >= 0 ? this.writeUInteger(r) : this.encodeNint(r);
    }
    writeUInteger(r) {
      const s = this.writer;
      s.ensureCapacity(9);
      const o = s.uint8;
      let a = s.x;
      r <= 23 ? o[a++] = 0 + r : r <= 255 ? (o[a++] = 24, o[a++] = r) : r <= 65535 ? (o[a++] = 25, s.view.setUint16(a, r), a += 2) : r <= 4294967295 ? (o[a++] = 26, s.view.setUint32(a, r), a += 4) : (o[a++] = 27, s.view.setBigUint64(a, BigInt(r)), a += 8), s.x = a;
    }
    /** @deprecated Remove and use `writeNumber` instead. */
    encodeNumber(r) {
      this.writeNumber(r);
    }
    /** @deprecated Remove and use `writeInteger` instead. */
    encodeInteger(r) {
      this.writeInteger(r);
    }
    /** @deprecated */
    encodeUint(r) {
      this.writeUInteger(r);
    }
    encodeNint(r) {
      const s = -1 - r, o = this.writer;
      o.ensureCapacity(9);
      const a = o.uint8;
      let u = o.x;
      s < 24 ? a[u++] = 32 + s : s <= 255 ? (a[u++] = 56, a[u++] = s) : s <= 65535 ? (a[u++] = 57, o.view.setUint16(u, s), u += 2) : s <= 4294967295 ? (a[u++] = 58, o.view.setUint32(u, s), u += 4) : (a[u++] = 59, o.view.setBigUint64(u, BigInt(s)), u += 8), o.x = u;
    }
    writeFloat(r) {
      this.writer.u8f64(251, r);
    }
    writeBin(r) {
      const s = r.length;
      this.writeBinHdr(s), this.writer.buf(r, s);
    }
    writeBinHdr(r) {
      const s = this.writer;
      r <= 23 ? s.u8(64 + r) : r <= 255 ? s.u16(22528 + r) : r <= 65535 ? s.u8u16(89, r) : r <= 4294967295 ? s.u8u32(90, r) : s.u8u64(91, r);
    }
    writeStr(r) {
      const s = this.writer, a = r.length * 4;
      s.ensureCapacity(5 + a);
      const u = s.uint8;
      let l = s.x;
      a <= 23 ? s.x++ : a <= 255 ? (u[s.x++] = 120, l = s.x, s.x++) : a <= 65535 ? (u[s.x++] = 121, l = s.x, s.x += 2) : (u[s.x++] = 122, l = s.x, s.x += 4);
      const c = s.utf8(r);
      a <= 23 ? u[l] = 96 + c : a <= 255 ? u[l] = c : a <= 65535 ? s.view.setUint16(l, c) : s.view.setUint32(l, c);
    }
    writeStrHdr(r) {
      const s = this.writer;
      r <= 23 ? s.u8(96 + r) : r <= 255 ? s.u16(30720 + r) : r <= 65535 ? s.u8u16(121, r) : s.u8u32(122, r);
    }
    writeAsciiStr(r) {
      this.writeStrHdr(r.length), this.writer.ascii(r);
    }
    writeArr(r) {
      const s = r.length;
      this.writeArrHdr(s);
      for (let o = 0; o < s; o++)
        this.writeAny(r[o]);
    }
    writeArrHdr(r) {
      const s = this.writer;
      r <= 23 ? s.u8(128 + r) : r <= 255 ? s.u16(38912 + r) : r <= 65535 ? s.u8u16(153, r) : r <= 4294967295 ? s.u8u32(154, r) : s.u8u64(155, r);
    }
    writeObj(r) {
      const s = Object.keys(r), o = s.length;
      this.writeObjHdr(o);
      for (let a = 0; a < o; a++) {
        const u = s[a];
        this.writeStr(u), this.writeAny(r[u]);
      }
    }
    writeObjHdr(r) {
      const s = this.writer;
      r <= 23 ? s.u8(160 + r) : r <= 255 ? s.u16(47104 + r) : r <= 65535 ? s.u8u16(185, r) : r <= 4294967295 ? s.u8u32(186, r) : s.u8u64(187, r);
    }
    writeMapHdr(r) {
      this.writeObjHdr(r);
    }
    writeStartMap() {
      this.writer.u8(191);
    }
    writeTag(r, s) {
      this.writeTagHdr(r), this.writeAny(s);
    }
    writeTagHdr(r) {
      const s = this.writer;
      r <= 23 ? s.u8(192 + r) : r <= 255 ? s.u16(55296 + r) : r <= 65535 ? s.u8u16(217, r) : r <= 4294967295 ? s.u8u32(218, r) : s.u8u64(219, r);
    }
    writeTkn(r) {
      const s = this.writer;
      r <= 23 ? s.u8(224 + r) : r <= 255 && s.u16(63488 + r);
    }
    // ------------------------------------------------------- Streaming encoding
    writeStartStr() {
      this.writer.u8(127);
    }
    writeStrChunk(r) {
      throw new Error("Not implemented");
    }
    writeEndStr() {
      throw new Error("Not implemented");
    }
    writeStartBin() {
      this.writer.u8(95);
    }
    writeBinChunk(r) {
      throw new Error("Not implemented");
    }
    writeEndBin() {
      throw new Error("Not implemented");
    }
    writeStartArr() {
      this.writer.u8(159);
    }
    writeArrChunk(r) {
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
    writeObjChunk(r, s) {
      throw new Error("Not implemented");
    }
    writeEndObj() {
      this.writer.u8(
        255
        /* CONST.END */
      );
    }
  };
  return Vn.CborEncoderFast = t, Vn;
}
var Mn = {}, qo;
function Ws() {
  if (qo) return Mn;
  qo = 1, Object.defineProperty(Mn, "__esModule", { value: !0 }), Mn.JsonPackValue = void 0;
  let n = class {
    constructor(t) {
      this.val = t;
    }
  };
  return Mn.JsonPackValue = n, Mn;
}
var Uo;
function Cu() {
  if (Uo) return Rn;
  Uo = 1, Object.defineProperty(Rn, "__esModule", { value: !0 }), Rn.CborEncoder = void 0;
  const n = xh(), e = Nu(), t = Oh(), i = Ws();
  let r = class extends t.CborEncoderFast {
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
      (0, n.isFloat32)(o) ? this.writer.u8f32(250, o) : this.writer.u8f64(251, o);
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
  return Rn.CborEncoder = r, Rn;
}
var Fo;
function Iu() {
  if (Fo) return An;
  Fo = 1, Object.defineProperty(An, "__esModule", { value: !0 }), An.Encoder = void 0;
  const e = re.__importStar(Gr()), t = Ks(), i = le(), r = Cu();
  class s extends r.CborEncoder {
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
          const c = a, h = c.data, y = h.length;
          y <= 7 ? u.u8(80 + y) : (u.u8(
            80
            /* JsonCrdtPatchOpcodeOverlay.ins_obj */
          ), u.vu57(y)), this.encodeId(c.obj);
          for (let p = 0; p < y; p++) {
            const m = h[p];
            this.writeStr(m[0]), this.encodeId(m[1]);
          }
          break;
        }
        case e.InsVecOp: {
          const c = a, h = c.data, y = h.length;
          y <= 7 ? u.u8(88 + y) : (u.u8(
            88
            /* JsonCrdtPatchOpcodeOverlay.ins_vec */
          ), u.vu57(y)), this.encodeId(c.obj);
          for (let p = 0; p < y; p++) {
            const m = h[p];
            u.u8(m[0]), this.encodeId(m[1]);
          }
          break;
        }
        case e.InsStrOp: {
          const c = a, h = c.obj, y = c.ref, p = c.data, m = p.length;
          u.ensureCapacity(24 + m * 4);
          const k = u.x, b = this.writeInsStr(m, h, y, p);
          m !== b && (u.x = k, this.writeInsStr(b, h, y, p));
          break;
        }
        case e.InsBinOp: {
          const c = a, h = c.data, y = h.length;
          y <= 7 ? u.u8(104 + y) : (u.u8(
            104
            /* JsonCrdtPatchOpcodeOverlay.ins_bin */
          ), u.vu57(y)), this.encodeId(c.obj), this.encodeId(c.ref), u.buf(h, y);
          break;
        }
        case e.InsArrOp: {
          const c = a, h = c.data, y = h.length;
          y <= 7 ? u.u8(112 + y) : (u.u8(
            112
            /* JsonCrdtPatchOpcodeOverlay.ins_arr */
          ), u.vu57(y)), this.encodeId(c.obj), this.encodeId(c.ref);
          for (let p = 0; p < y; p++)
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
          const c = a, h = c.what, y = h.length;
          y <= 7 ? u.u8(128 + y) : (u.u8(
            128
            /* JsonCrdtPatchOpcodeOverlay.del */
          ), u.vu57(y)), this.encodeId(c.obj);
          for (let p = 0; p < y; p++)
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
  return An.Encoder = s, An;
}
var Dn = {}, qn = {}, Un = {}, Fn = {}, ei = {}, St = {}, zo;
function Nh() {
  if (zo) return St;
  zo = 1, Object.defineProperty(St, "__esModule", { value: !0 }), St.decodeAsciiMax15 = St.decodeAscii = void 0;
  const n = String.fromCharCode, e = (i, r, s) => {
    const o = [];
    for (let a = 0; a < s; a++) {
      const u = i[r++];
      if (u & 128)
        return;
      o.push(u);
    }
    return n.apply(String, o);
  };
  St.decodeAscii = e;
  const t = (i, r, s) => {
    if (s < 4)
      if (s < 2) {
        if (s === 0)
          return "";
        {
          const o = i[r++];
          if ((o & 128) > 1) {
            r -= 1;
            return;
          }
          return n(o);
        }
      } else {
        const o = i[r++], a = i[r++];
        if ((o & 128) > 0 || (a & 128) > 0) {
          r -= 2;
          return;
        }
        if (s < 3)
          return n(o, a);
        const u = i[r++];
        if ((u & 128) > 0) {
          r -= 3;
          return;
        }
        return n(o, a, u);
      }
    else {
      const o = i[r++], a = i[r++], u = i[r++], l = i[r++];
      if ((o & 128) > 0 || (a & 128) > 0 || (u & 128) > 0 || (l & 128) > 0) {
        r -= 4;
        return;
      }
      if (s < 6) {
        if (s === 4)
          return n(o, a, u, l);
        {
          const c = i[r++];
          if ((c & 128) > 0) {
            r -= 5;
            return;
          }
          return n(o, a, u, l, c);
        }
      } else if (s < 8) {
        const c = i[r++], h = i[r++];
        if ((c & 128) > 0 || (h & 128) > 0) {
          r -= 6;
          return;
        }
        if (s < 7)
          return n(o, a, u, l, c, h);
        const y = i[r++];
        if ((y & 128) > 0) {
          r -= 7;
          return;
        }
        return n(o, a, u, l, c, h, y);
      } else {
        const c = i[r++], h = i[r++], y = i[r++], p = i[r++];
        if ((c & 128) > 0 || (h & 128) > 0 || (y & 128) > 0 || (p & 128) > 0) {
          r -= 8;
          return;
        }
        if (s < 10) {
          if (s === 8)
            return n(o, a, u, l, c, h, y, p);
          {
            const m = i[r++];
            if ((m & 128) > 0) {
              r -= 9;
              return;
            }
            return n(o, a, u, l, c, h, y, p, m);
          }
        } else if (s < 12) {
          const m = i[r++], k = i[r++];
          if ((m & 128) > 0 || (k & 128) > 0) {
            r -= 10;
            return;
          }
          if (s < 11)
            return n(o, a, u, l, c, h, y, p, m, k);
          const b = i[r++];
          if ((b & 128) > 0) {
            r -= 11;
            return;
          }
          return n(o, a, u, l, c, h, y, p, m, k, b);
        } else {
          const m = i[r++], k = i[r++], b = i[r++], _ = i[r++];
          if ((m & 128) > 0 || (k & 128) > 0 || (b & 128) > 0 || (_ & 128) > 0) {
            r -= 12;
            return;
          }
          if (s < 14) {
            if (s === 12)
              return n(o, a, u, l, c, h, y, p, m, k, b, _);
            {
              const f = i[r++];
              if ((f & 128) > 0) {
                r -= 13;
                return;
              }
              return n(o, a, u, l, c, h, y, p, m, k, b, _, f);
            }
          } else {
            const f = i[r++], d = i[r++];
            if ((f & 128) > 0 || (d & 128) > 0) {
              r -= 14;
              return;
            }
            if (s < 15)
              return n(o, a, u, l, c, h, y, p, m, k, b, _, f, d);
            const g = i[r++];
            if ((g & 128) > 0) {
              r -= 15;
              return;
            }
            return n(o, a, u, l, c, h, y, p, m, k, b, _, f, d, g);
          }
        }
      }
    }
  };
  return St.decodeAsciiMax15 = t, St;
}
var ti = {}, Zo;
function Ch() {
  if (Zo) return ti;
  Zo = 1, Object.defineProperty(ti, "__esModule", { value: !0 });
  const n = String.fromCharCode;
  return ti.default = (e, t, i) => {
    let r = t;
    const s = r + i, o = [];
    for (; r < s; ) {
      let a = e[r++];
      if ((a & 128) !== 0) {
        const u = e[r++] & 63;
        if ((a & 224) === 192)
          a = (a & 31) << 6 | u;
        else {
          const l = e[r++] & 63;
          if ((a & 240) === 224)
            a = (a & 31) << 12 | u << 6 | l;
          else if ((a & 248) === 240) {
            const c = e[r++] & 63;
            let h = (a & 7) << 18 | u << 12 | l << 6 | c;
            if (h > 65535) {
              h -= 65536;
              const y = h >>> 10 & 1023 | 55296;
              a = 56320 | h & 1023, o.push(y);
            } else
              a = h;
          }
        }
      }
      o.push(a);
    }
    return n.apply(String, o);
  }, ti;
}
var Ho;
function Ih() {
  if (Ho) return ei;
  Ho = 1, Object.defineProperty(ei, "__esModule", { value: !0 });
  const n = re, e = Nh(), t = n.__importDefault(Ch()), i = typeof Buffer < "u", r = i ? Buffer.prototype.utf8Slice : null, s = i ? Buffer.from : null, o = (c, h, y) => (0, e.decodeAsciiMax15)(c, h, y) ?? (0, t.default)(c, h, y), a = (c, h, y) => (0, e.decodeAscii)(c, h, y) ?? (0, t.default)(c, h, y), u = r ? (c, h, y) => r.call(c, h, h + y) : s ? (c, h, y) => s(c).subarray(h, h + y).toString("utf8") : t.default, l = (c, h, y) => y < 16 ? o(c, h, y) : y < 32 ? a(c, h, y) : u(c, h, y);
  return ei.default = l, ei;
}
var Jo;
function Th() {
  if (Jo) return Fn;
  Jo = 1, Object.defineProperty(Fn, "__esModule", { value: !0 }), Fn.decodeUtf8 = void 0;
  const e = re.__importDefault(Ih());
  return Fn.decodeUtf8 = e.default, Fn;
}
var Ko;
function Au() {
  if (Ko) return Un;
  Ko = 1, Object.defineProperty(Un, "__esModule", { value: !0 }), Un.Reader = void 0;
  const n = Th();
  let e = class Tu {
    constructor(i = new Uint8Array([]), r = new DataView(i.buffer, i.byteOffset, i.length), s = 0, o = i.length) {
      this.uint8 = i, this.view = r, this.x = s, this.end = o;
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
      const r = this.x, s = r + i, o = this.uint8.subarray(r, s);
      return this.x = s, o;
    }
    subarray(i = 0, r) {
      const s = this.x, o = s + i, a = typeof r == "number" ? s + r : this.end;
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
    slice(i = 0, r) {
      const s = this.x, o = s + i, a = typeof r == "number" ? s + r : this.end;
      return new Tu(this.uint8, this.view, o, a);
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
      const r = this.slice(0, i);
      return this.skip(i), r;
    }
    u8() {
      return this.uint8[this.x++];
    }
    i8() {
      return this.view.getInt8(this.x++);
    }
    u16() {
      let i = this.x;
      const r = (this.uint8[i++] << 8) + this.uint8[i++];
      return this.x = i, r;
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
      const r = this.x;
      return this.x += i, (0, n.decodeUtf8)(this.uint8, r, i);
    }
    ascii(i) {
      const r = this.uint8;
      let s = "";
      const o = this.x + i;
      for (let a = this.x; a < o; a++)
        s += String.fromCharCode(r[a]);
      return this.x = o, s;
    }
  };
  return Un.Reader = e, Un;
}
var Wo;
function ju() {
  if (Wo) return qn;
  Wo = 1, Object.defineProperty(qn, "__esModule", { value: !0 }), qn.CrdtReader = void 0;
  const n = Au();
  let e = class extends n.Reader {
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
      const r = this.u8();
      if (r <= 127)
        return r << 7 | i & 127;
      const s = this.u8();
      if (s <= 127)
        return s << 14 | (r & 127) << 7 | i & 127;
      const o = this.u8();
      if (o <= 127)
        return o << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127;
      const a = this.u8();
      if (a <= 127)
        return a * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127);
      const u = this.u8();
      if (u <= 127)
        return u * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127));
      const l = this.u8();
      return l <= 127 ? l * 4398046511104 + ((u & 127) * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127))) : this.u8() * 562949953421312 + ((l & 127) * 4398046511104 + ((u & 127) * 34359738368 + ((a & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127))));
    }
    vu57Skip() {
      this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.u8() <= 127 || this.x++;
    }
    b1vu56() {
      const i = this.u8(), r = i & 128 ? 1 : 0, s = 127 & i;
      if (s <= 63)
        return [r, s];
      const o = this.u8();
      if (o <= 127)
        return [r, o << 6 | s & 63];
      const a = this.u8();
      if (a <= 127)
        return [r, a << 13 | (o & 127) << 6 | s & 63];
      const u = this.u8();
      if (u <= 127)
        return [r, u << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63];
      const l = this.u8();
      if (l <= 127)
        return [
          r,
          l * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63)
        ];
      const c = this.u8();
      if (c <= 127)
        return [
          r,
          c * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63))
        ];
      const h = this.u8();
      if (h <= 127)
        return [
          r,
          h * 2199023255552 + ((c & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63)))
        ];
      const y = this.u8();
      return [
        r,
        y * 281474976710656 + ((h & 127) * 2199023255552 + ((c & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (a & 127) << 13 | (o & 127) << 6 | s & 63))))
      ];
    }
  };
  return qn.CrdtReader = e, qn;
}
var zn = {}, Zn = {}, Go;
function Gs() {
  return Go || (Go = 1, Object.defineProperty(Zn, "__esModule", { value: !0 }), Zn.isUint8Array = void 0, Zn.isUint8Array = typeof Buffer == "function" ? (n) => n instanceof Uint8Array || Buffer.isBuffer(n) : (n) => n instanceof Uint8Array), Zn;
}
var Di = {}, qi = {}, Xo;
function Ah() {
  return Xo || (Xo = 1, Object.defineProperty(qi, "__esModule", { value: !0 })), qi;
}
var Yo;
function vi() {
  return Yo || (Yo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.ORIGIN = void 0;
    const e = re, t = le();
    e.__exportStar(Ah(), n), n.ORIGIN = (0, t.ts)(
      0,
      0
      /* SYSTEM_SESSION_TIME.ORIGIN */
    );
  })(Di)), Di;
}
var Ui = {}, Fi = {}, Hn = {}, Qo;
function bi() {
  if (Qo) return Hn;
  Qo = 1, Object.defineProperty(Hn, "__esModule", { value: !0 }), Hn.printBinary = void 0;
  const n = (e = "", t) => {
    const i = t[0], r = t[1];
    let s = "";
    return i && (s += `
` + e + "← " + i(e + "  ")), r && (s += `
` + e + "→ " + r(e + "  ")), s;
  };
  return Hn.printBinary = n, Hn;
}
var Jn = {}, $o;
function jh() {
  if ($o) return Jn;
  $o = 1, Object.defineProperty(Jn, "__esModule", { value: !0 }), Jn.printJson = void 0;
  const n = (e = "", t, i = 2) => (JSON.stringify(t, null, i) || "nil").split(`
`).join(`
` + e);
  return Jn.printJson = n, Jn;
}
var ea;
function Eh() {
  return ea || (ea = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(je(), n), e.__exportStar(bi(), n), e.__exportStar(jh(), n);
  })(Fi)), Fi;
}
var ta;
function mi() {
  return ta || (ta = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.s = n.schema = n.nodes = n.SchemaNode = n.NodeBuilder = void 0;
    const e = re, t = Gs(), i = le(), r = e.__importStar(Bu()), s = Eh(), o = (c) => {
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
        var y;
        return ((y = this._build) == null ? void 0 : y.call(this, h)) ?? h.con(void 0);
      }
    }
    n.NodeBuilder = a;
    class u extends a {
      toString(h) {
        return this.type;
      }
    }
    n.SchemaNode = u;
    var l;
    (function(c) {
      class h extends u {
        constructor(g) {
          super(), this.raw = g, this.type = "con";
        }
        build(g) {
          return g.con(this.raw);
        }
        toString(g) {
          return this.type + " " + r.con(this.raw);
        }
      }
      c.con = h;
      class y extends u {
        constructor(g) {
          super(), this.raw = g, this.type = "str";
        }
        build(g) {
          return g.json(this.raw);
        }
        toString(g) {
          return this.type + " " + r.con(this.raw);
        }
      }
      c.str = y;
      class p extends u {
        constructor(g) {
          super(), this.raw = g, this.type = "bin";
        }
        build(g) {
          return g.json(this.raw);
        }
        toString(g) {
          return this.type + " " + r.bin(this.raw);
        }
      }
      c.bin = p;
      class m extends u {
        constructor(g) {
          super(), this.value = g, this.type = "val";
        }
        build(g) {
          const v = g.val(), w = this.value.build(g);
          return g.setVal(v, w), v;
        }
        toString(g) {
          return this.type + (0, s.printTree)(g, [(v) => this.value.toString(v)]);
        }
      }
      c.val = m;
      class k extends u {
        constructor(g) {
          super(), this.value = g, this.type = "vec";
        }
        build(g) {
          const v = g.vec(), w = this.value, x = w.length;
          if (x) {
            const N = [];
            for (let C = 0; C < x; C++) {
              const E = w[C];
              if (!E)
                continue;
              const O = E.build(g);
              N.push([C, O]);
            }
            g.insVec(v, N);
          }
          return v;
        }
        toString(g) {
          return this.type + (0, s.printTree)(g, [
            ...this.value.map((v, w) => (x) => `${w}: ${v ? v.toString(x) : r.line(v)}`)
          ]);
        }
      }
      c.vec = k;
      class b extends u {
        constructor(g, v) {
          super(), this.obj = g, this.opt = v, this.type = "obj";
        }
        optional() {
          return this;
        }
        build(g) {
          const v = g.obj(), w = [], x = { ...this.obj, ...this.opt }, N = Object.keys(x), C = N.length;
          if (C) {
            for (let E = 0; E < C; E++) {
              const O = N[E], I = x[O].build(g);
              w.push([O, I]);
            }
            g.insObj(v, w);
          }
          return v;
        }
        toString(g = "") {
          return this.type + (0, s.printTree)(g, [
            ...[...Object.entries(this.obj)].map(([v, w]) => (x) => r.line(v) + (0, s.printTree)(x + " ", [(N) => w.toString(N)])),
            ...[...Object.entries(this.opt ?? [])].map(([v, w]) => (x) => r.line(v) + "?" + (0, s.printTree)(x + " ", [(N) => w.toString(N)]))
          ]);
        }
      }
      c.obj = b;
      class _ extends u {
        constructor(g) {
          super(), this.arr = g, this.type = "arr";
        }
        build(g) {
          const v = g.arr(), w = this.arr, x = w.length;
          if (x) {
            const N = [];
            for (let C = 0; C < x; C++)
              N.push(w[C].build(g));
            g.insArr(v, v, N);
          }
          return v;
        }
        toString(g) {
          return this.type + (0, s.printTree)(g, [
            ...this.arr.map((v, w) => (x) => `[${w}]: ${v ? v.toString(x) : r.line(v)}`)
          ]);
        }
      }
      c.arr = _;
      class f extends u {
        /**
         * @param id A unique extension ID.
         * @param data Schema of the data node of the extension.
         */
        constructor(g, v) {
          super(), this.id = g, this.data = v, this.type = "ext";
        }
        build(g) {
          const v = new Uint8Array([this.id, 0, 0]), w = g.vec();
          return v[1] = w.sid % 256, v[2] = w.time % 256, g.insVec(w, [
            [0, g.constOrJson(n.s.con(v))],
            [1, this.data.build(g)]
          ]), w;
        }
        toString(g) {
          return this.type + "(" + this.id + ")" + (0, s.printTree)(g, [(v) => this.data.toString(v)]);
        }
      }
      c.ext = f;
    })(l || (n.nodes = l = {})), n.schema = {
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
      map: (c) => n.schema.obj(c),
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
              return n.s.val(n.s.con(c));
            if (c instanceof a)
              return c;
            if (Array.isArray(c))
              return n.s.arr(c.map((h) => n.s.json(h)));
            if ((0, t.isUint8Array)(c))
              return n.s.bin(c);
            if (c instanceof i.Timestamp)
              return n.s.val(n.s.con(c));
            {
              const h = {}, y = Object.keys(c);
              for (const p of y)
                h[p] = n.s.jsonCon(c[p]);
              return n.s.obj(h);
            }
          }
          case "string":
            return n.s.str(c);
          default:
            return n.s.val(n.s.con(c));
        }
      },
      /**
       * Recursively creates a schema node tree from any POJO. Same as {@link json}, but
       * converts constant values to {@link nodes.con} nodes, instead wrapping them into
       * {@link nodes.val} nodes.
       *
       * @todo Remove this once "arr" RGA supports in-place updates.
       */
      jsonCon: (c) => o(c) ? n.s.con(c) : n.s.json(c),
      /**
       * Creates an extension node schema.
       *
       * @param id A unique extension ID.
       * @param data Schema of the data node of the extension.
       */
      ext: (c, h) => new l.ext(c, h)
    }, n.s = n.schema;
  })(Ui)), Ui;
}
var na;
function Xs() {
  if (na) return zn;
  na = 1, Object.defineProperty(zn, "__esModule", { value: !0 }), zn.PatchBuilder = void 0;
  const e = re.__importStar(Gr()), t = le(), i = Gs(), r = Lu(), s = vi(), o = mi(), a = (l) => {
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
      this.clock = c, this.patch = new r.Patch();
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
      return this.patch = new r.Patch(), c;
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
      const y = this.clock.tick(1), p = new e.InsObjOp(y, c, h), m = p.span();
      return m > 1 && this.clock.tick(m - 1), this.patch.ops.push(p), y;
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
      const y = this.clock.tick(1), p = new e.InsVecOp(y, c, h), m = p.span();
      return m > 1 && this.clock.tick(m - 1), this.patch.ops.push(p), y;
    }
    /**
     * Set value of a "val" object.
     *
     * @returns ID of the new operation.
     * @todo Rename to "insVal".
     */
    setVal(c, h) {
      this.pad();
      const y = this.clock.tick(1), p = new e.InsValOp(y, c, h);
      return this.patch.ops.push(p), y;
    }
    /**
     * Insert a substring into a "str" object.
     *
     * @returns ID of the new operation.
     */
    insStr(c, h, y) {
      if (!y.length)
        throw new Error("EMPTY_STRING");
      this.pad();
      const p = this.clock.tick(1), m = new e.InsStrOp(p, c, h, y), k = m.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(m), p;
    }
    /**
     * Insert binary data into a "bin" object.
     *
     * @returns ID of the new operation.
     */
    insBin(c, h, y) {
      if (!y.length)
        throw new Error("EMPTY_BINARY");
      this.pad();
      const p = this.clock.tick(1), m = new e.InsBinOp(p, c, h, y), k = m.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(m), p;
    }
    /**
     * Insert elements into an "arr" object.
     *
     * @returns ID of the new operation.
     */
    insArr(c, h, y) {
      this.pad();
      const p = this.clock.tick(1), m = new e.InsArrOp(p, c, h, y), k = m.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(m), p;
    }
    /**
     * Update an element in an "arr" object.
     *
     * @returns ID of the new operation.
     */
    updArr(c, h, y) {
      this.pad();
      const p = this.clock.tick(1), m = new e.UpdArrOp(p, c, h, y);
      return this.patch.ops.push(m), p;
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
      const y = this.clock.tick(1);
      return this.patch.ops.push(new e.DelOp(y, c, h)), y;
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
      const h = this.obj(), y = Object.keys(c);
      if (y.length) {
        const p = [];
        for (const m of y) {
          const k = c[m], b = k instanceof t.Timestamp ? k : a(k) ? this.con(k) : this.json(k);
          p.push([m, b]);
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
        const y = [];
        for (const p of c)
          y.push(this.json(p));
        this.insArr(h, h, y);
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
      const h = this.val(), y = this.con(c);
      return this.setVal(h, y), h;
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
        const y = (0, t.ts)(this.clock.sid, c), p = new e.NopOp(y, h);
        this.patch.ops.push(p);
      }
    }
  };
  return zn.PatchBuilder = u, zn;
}
var Kn = {}, Wn = {}, Gn = {}, ra;
function Ph() {
  if (ra) return Gn;
  ra = 1, Object.defineProperty(Gn, "__esModule", { value: !0 }), Gn.decodeF16 = void 0;
  const n = Math.pow, e = (t) => {
    const i = (t & 31744) >> 10, r = t & 1023;
    return (t >> 15 ? -1 : 1) * (i ? i === 31 ? r ? NaN : 1 / 0 : n(2, i - 15) * (1 + r / 1024) : 6103515625e-14 * (r / 1024));
  };
  return Gn.decodeF16 = e, Gn;
}
var ni = {}, Xn = {}, ri = {}, ia;
function Rh() {
  if (ia) return ri;
  ia = 1, Object.defineProperty(ri, "__esModule", { value: !0 });
  const n = String.fromCharCode;
  return ri.default = (e, t, i) => {
    let r = t;
    const s = r + i;
    let o = "";
    for (; r < s; ) {
      const a = e[r++];
      if ((a & 128) === 0) {
        o += n(a);
        continue;
      }
      const u = e[r++] & 63;
      if ((a & 224) === 192) {
        o += n((a & 31) << 6 | u);
        continue;
      }
      const l = e[r++] & 63;
      if ((a & 240) === 224) {
        o += n((a & 31) << 12 | u << 6 | l);
        continue;
      }
      if ((a & 248) === 240) {
        const c = e[r++] & 63;
        let h = (a & 7) << 18 | u << 12 | l << 6 | c;
        if (h > 65535) {
          h -= 65536;
          const y = h >>> 10 & 1023 | 55296;
          h = 56320 | h & 1023, o += n(y, h);
        } else
          o += n(h);
      } else
        o += n(a);
    }
    return o;
  }, ri;
}
var sa;
function Lh() {
  if (sa) return Xn;
  sa = 1, Object.defineProperty(Xn, "__esModule", { value: !0 }), Xn.CachedUtf8Decoder = void 0;
  const e = re.__importDefault(Rh());
  let t = 1 + Math.round(Math.random() * ((-1 >>> 0) - 1));
  function i(o, a) {
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, (t >>> 0) % (a - o + 1) + o;
  }
  class r {
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
      e: for (let y = 0; y < h; y++) {
        const p = c[y], m = p.bytes;
        for (let k = 0; k < l; k++)
          if (m[k] !== a[u + k])
            continue e;
        return p.value;
      }
      return null;
    }
    store(a, u) {
      const l = this.caches[a.length - 1], c = new r(a, u);
      l.length >= 16 ? l[i(0, 15)] = c : l.push(c);
    }
    decode(a, u, l) {
      if (!l)
        return "";
      const c = this.get(a, u, l);
      if (c !== null)
        return c;
      const h = (0, e.default)(a, u, l), y = Uint8Array.prototype.slice.call(a, u, u + l);
      return this.store(y, h), h;
    }
  };
  return Xn.CachedUtf8Decoder = s, Xn;
}
var oa;
function Bh() {
  if (oa) return ni;
  oa = 1, Object.defineProperty(ni, "__esModule", { value: !0 });
  const n = Lh();
  return ni.default = new n.CachedUtf8Decoder(), ni;
}
var aa;
function Eu() {
  if (aa) return Wn;
  aa = 1, Object.defineProperty(Wn, "__esModule", { value: !0 }), Wn.CborDecoderBase = void 0;
  const n = re, e = Ph(), t = Nu(), i = Ws(), r = Au(), s = n.__importDefault(Bh());
  let o = class {
    constructor(u = new r.Reader(), l = s.default) {
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
          const y = new Uint8Array(c);
          let p = 0;
          const m = h.length;
          for (let k = 0; k < m; k++) {
            const b = h[k];
            y.set(b, p), p += b.length;
          }
          return y;
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
          const y = this.key();
          if (y === "__proto__")
            throw 6;
          const p = this.readAny();
          c[y] = p;
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
        const h = this.key(), y = this.readAny();
        l[h] = y;
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
      const y = this.keyDecoder.decode(this.reader.uint8, this.reader.x, h);
      return this.reader.skip(h), y;
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
  return Wn.CborDecoderBase = o, Wn;
}
var ca;
function Vh() {
  if (ca) return Kn;
  ca = 1, Object.defineProperty(Kn, "__esModule", { value: !0 }), Kn.CborDecoder = void 0;
  const n = Eu(), e = Ws();
  let t = class extends n.CborDecoderBase {
    // -------------------------------------------------------------- Map reading
    readAsMap() {
      const r = this.reader.u8(), s = r >> 5, o = r & 31;
      switch (s) {
        case 5:
          return this.readMap(o);
        default:
          throw 0;
      }
    }
    readMap(r) {
      const s = this.readMinorLen(r);
      return s >= 0 ? this.readMapRaw(s) : this.readMapIndef();
    }
    readMapRaw(r) {
      const s = /* @__PURE__ */ new Map();
      for (let o = 0; o < r; o++) {
        const a = this.readAny(), u = this.readAny();
        s.set(a, u);
      }
      return s;
    }
    readMapIndef() {
      const r = /* @__PURE__ */ new Map();
      for (; this.reader.peak() !== 255; ) {
        const s = this.readAny();
        if (this.reader.peak() === 255)
          throw 7;
        const o = this.readAny();
        r.set(s, o);
      }
      return this.reader.x++, r;
    }
    // ----------------------------------------------------------- Value skipping
    skipN(r) {
      for (let s = 0; s < r; s++)
        this.skipAny();
    }
    skipAny() {
      this.skipAnyRaw(this.reader.u8());
    }
    skipAnyRaw(r) {
      const s = r >> 5, o = r & 31;
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
    skipMinorLen(r) {
      if (r <= 23)
        return r;
      switch (r) {
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
    skipUNint(r) {
      if (!(r <= 23))
        switch (r) {
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
    skipBin(r) {
      const s = this.skipMinorLen(r);
      if (s >= 0)
        this.reader.skip(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipBinChunk();
        this.reader.x++;
      }
    }
    skipBinChunk() {
      const r = this.reader.u8(), s = r >> 5, o = r & 31;
      if (s !== 2)
        throw 2;
      if (o > 27)
        throw 3;
      this.skipBin(o);
    }
    // ---------------------------------------------------------- String skipping
    skipStr(r) {
      const s = this.skipMinorLen(r);
      if (s >= 0)
        this.reader.skip(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipStrChunk();
        this.reader.x++;
      }
    }
    skipStrChunk() {
      const r = this.reader.u8(), s = r >> 5, o = r & 31;
      if (s !== 3)
        throw 4;
      if (o > 27)
        throw 5;
      this.skipStr(o);
    }
    // ----------------------------------------------------------- Array skipping
    skipArr(r) {
      const s = this.skipMinorLen(r);
      if (s >= 0)
        this.skipN(s);
      else {
        for (; this.reader.peak() !== 255; )
          this.skipAny();
        this.reader.x++;
      }
    }
    // ---------------------------------------------------------- Object skipping
    skipObj(r) {
      const s = this.readMinorLen(r);
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
    skipTag(r) {
      if (this.skipMinorLen(r) < 0)
        throw 1;
      this.skipAny();
    }
    // ----------------------------------------------------------- Token skipping
    skipTkn(r) {
      switch (r) {
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
      if (!(r <= 23))
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
    validate(r, s = 0, o = r.length) {
      this.reader.reset(r), this.reader.x = s;
      const a = s;
      if (this.skipAny(), this.reader.x - a !== o)
        throw 8;
    }
    // -------------------------------------------- One level reading - any value
    decodeLevel(r) {
      return this.reader.reset(r), this.readLevel();
    }
    /**
     * Decodes only one level of objects and arrays. Other values are decoded
     * completely.
     *
     * @returns One level of decoded CBOR value.
     */
    readLevel() {
      const r = this.reader.u8(), s = r >> 5, o = r & 31;
      switch (s) {
        case 4:
          return this.readArrLevel(o);
        case 5:
          return this.readObjLevel(o);
        default:
          return super.readAnyRaw(r);
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
      const r = this.reader, s = r.x;
      this.skipAny();
      const o = r.x;
      return new e.JsonPackValue(r.uint8.subarray(s, o));
    }
    // ----------------------------------------------- One level reading - object
    readObjLevel(r) {
      const s = this.readMinorLen(r);
      return s >= 0 ? this.readObjRawLevel(s) : this.readObjIndefLevel();
    }
    readObjRawLevel(r) {
      const s = {};
      for (let o = 0; o < r; o++) {
        const a = this.key(), u = this.readPrimitiveOrVal();
        s[a] = u;
      }
      return s;
    }
    readObjIndefLevel() {
      const r = {};
      for (; this.reader.peak() !== 255; ) {
        const s = this.key();
        if (this.reader.peak() === 255)
          throw 7;
        const o = this.readPrimitiveOrVal();
        r[s] = o;
      }
      return this.reader.x++, r;
    }
    // ------------------------------------------------ One level reading - array
    readArrLevel(r) {
      const s = this.readMinorLen(r);
      return s >= 0 ? this.readArrRawLevel(s) : this.readArrIndefLevel();
    }
    readArrRawLevel(r) {
      const s = [];
      for (let o = 0; o < r; o++)
        s.push(this.readPrimitiveOrVal());
      return s;
    }
    readArrIndefLevel() {
      const r = [];
      for (; this.reader.peak() !== 255; )
        r.push(this.readPrimitiveOrVal());
      return this.reader.x++, r;
    }
    // ---------------------------------------------------------- Shallow reading
    readHdr(r) {
      const s = this.reader.u8();
      if (s >> 5 !== r)
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
    findKey(r) {
      const s = this.readObjHdr();
      for (let o = 0; o < s; o++) {
        if (this.key() === r)
          return this;
        this.skipAny();
      }
      throw 9;
    }
    findIndex(r) {
      const s = this.readArrHdr();
      if (r >= s)
        throw 10;
      for (let o = 0; o < r; o++)
        this.skipAny();
      return this;
    }
    find(r) {
      for (let s = 0; s < r.length; s++) {
        const o = r[s];
        typeof o == "string" ? this.findKey(o) : this.findIndex(o);
      }
      return this;
    }
  };
  return Kn.CborDecoder = t, Kn;
}
var ua;
function Pu() {
  if (ua) return Dn;
  ua = 1, Object.defineProperty(Dn, "__esModule", { value: !0 }), Dn.Decoder = void 0;
  const n = ju(), e = le(), t = Xs(), i = Vh();
  class r extends i.CborDecoder {
    /**
     * Creates a new JSON CRDT patch decoder.
     *
     * @param reader An optional custom implementation of a CRDT decoder.
     */
    constructor(o = new n.CrdtReader()) {
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
      const h = this.builder = new t.PatchBuilder(c), y = this.val();
      return Array.isArray(y) && (h.patch.meta = y[0]), this.decodeOperations(), h.patch;
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
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = [];
          for (let p = 0; p < c; p++) {
            const m = this.val();
            if (typeof m != "string")
              continue;
            const k = this.decodeId();
            y.push([m, k]);
          }
          o.insObj(h, y);
          break;
        }
        case 11: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = [];
          for (let p = 0; p < c; p++) {
            const m = this.val();
            if (typeof m != "number")
              continue;
            const k = this.decodeId();
            y.push([m, k]);
          }
          o.insVec(h, y);
          break;
        }
        case 12: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = this.decodeId(), p = a.utf8(c);
          o.insStr(h, y, p);
          break;
        }
        case 13: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = this.decodeId(), p = a.buf(c);
          if (!(p instanceof Uint8Array))
            return;
          o.insBin(h, y, p);
          break;
        }
        case 14: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = this.decodeId(), p = [];
          for (let m = 0; m < c; m++)
            p.push(this.decodeId());
          o.insArr(h, y, p);
          break;
        }
        case 15: {
          const c = this.decodeId(), h = this.decodeId(), y = this.decodeId();
          o.updArr(c, h, y);
          break;
        }
        case 16: {
          const c = u & 7 || a.vu57(), h = this.decodeId(), y = [];
          for (let p = 0; p < c; p++)
            y.push(this.decodeTss());
          o.del(h, y);
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
  return Dn.Decoder = r, Dn;
}
var zi = {}, la;
function Mh() {
  return la || (la = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.decode = n.decoder = n.encode = n.encoder = void 0;
    const e = Iu(), t = Pu(), i = Ks(), r = new i.CrdtWriter(1024 * 4);
    n.encoder = new e.Encoder(r);
    const s = (a) => n.encoder.encode(a);
    n.encode = s, n.decoder = new t.Decoder();
    const o = (a) => n.decoder.decode(a);
    n.decode = o;
  })(zi)), zi;
}
var ha;
function Dh() {
  return ha || (ha = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Iu(), n), e.__exportStar(Pu(), n), e.__exportStar(Mh(), n);
  })(Mi)), Mi;
}
var da;
function Lu() {
  if (da) return Tn;
  da = 1, Object.defineProperty(Tn, "__esModule", { value: !0 }), Tn.Patch = void 0;
  const e = re.__importStar(Gr()), t = le(), i = je(), r = Dh();
  let s = class Ru {
    constructor() {
      this.ops = [], this.meta = void 0;
    }
    /**
     * Un-marshals a JSON CRDT patch from a binary representation.
     */
    static fromBinary(a) {
      return (0, r.decode)(a);
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
      const u = new Ru(), l = this.ops, c = l.length, h = u.ops;
      for (let y = 0; y < c; y++) {
        const p = l[y];
        p instanceof e.DelOp ? h.push(new e.DelOp(a(p.id), a(p.obj), p.what)) : p instanceof e.NewConOp ? h.push(new e.NewConOp(a(p.id), p.val instanceof t.Timestamp ? a(p.val) : p.val)) : p instanceof e.NewVecOp ? h.push(new e.NewVecOp(a(p.id))) : p instanceof e.NewValOp ? h.push(new e.NewValOp(a(p.id))) : p instanceof e.NewObjOp ? h.push(new e.NewObjOp(a(p.id))) : p instanceof e.NewStrOp ? h.push(new e.NewStrOp(a(p.id))) : p instanceof e.NewBinOp ? h.push(new e.NewBinOp(a(p.id))) : p instanceof e.NewArrOp ? h.push(new e.NewArrOp(a(p.id))) : p instanceof e.InsArrOp ? h.push(new e.InsArrOp(a(p.id), a(p.obj), a(p.ref), p.data.map(a))) : p instanceof e.UpdArrOp ? h.push(new e.UpdArrOp(a(p.id), a(p.obj), a(p.ref), a(p.val))) : p instanceof e.InsStrOp ? h.push(new e.InsStrOp(a(p.id), a(p.obj), a(p.ref), p.data)) : p instanceof e.InsBinOp ? h.push(new e.InsBinOp(a(p.id), a(p.obj), a(p.ref), p.data)) : p instanceof e.InsValOp ? h.push(new e.InsValOp(a(p.id), a(p.obj), a(p.val))) : p instanceof e.InsObjOp ? h.push(new e.InsObjOp(a(p.id), a(p.obj), p.data.map(([m, k]) => [m, a(k)]))) : p instanceof e.InsVecOp ? h.push(new e.InsVecOp(a(p.id), a(p.obj), p.data.map(([m, k]) => [m, a(k)]))) : p instanceof e.NopOp && h.push(new e.NopOp(a(p.id), p.len));
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
      const y = a - h;
      return this.rewriteTime((p) => {
        if (p.sid !== c)
          return p;
        const m = p.time;
        return m < u ? p : (0, t.ts)(c, m + y);
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
      return (0, r.encode)(this);
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
  return Tn.Patch = s, Tn;
}
var fa;
function _t() {
  return fa || (fa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(wh(), n), e.__exportStar(le(), n), e.__exportStar(Gr(), n), e.__exportStar(Lu(), n), e.__exportStar(Xs(), n), e.__exportStar(mi(), n);
  })(Pi)), Pi;
}
var pa;
function Bu() {
  return pa || (pa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.bin = n.con = n.line = void 0;
    const e = mh(), t = _t();
    n.line = e.toLine;
    const i = (s) => s instanceof Uint8Array ? "Uint8Array " + (0, n.bin)(s) : `{ ${s instanceof t.Timestamp ? (0, t.printTs)(s) : (0, n.line)(s)} }`;
    n.con = i;
    const r = (s) => "{ " + ("" + s).replaceAll(",", ", ") + " }";
    n.bin = r;
  })(ji)), ji;
}
var ga;
function wi() {
  if (ga) return Nn;
  ga = 1, Object.defineProperty(Nn, "__esModule", { value: !0 }), Nn.ConNode = void 0;
  const n = Bu(), e = le();
  let t = class Vu {
    /**
     * @param id ID of the CRDT node.
     * @param val Raw value of the constant. It can be any JSON/CBOR value, or
     *        a logical timestamp {@link Timestamp}.
     */
    constructor(r, s) {
      this.id = r, this.val = s, this.api = void 0, this.parent = void 0;
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
      return new Vu(this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(r) {
      return this.name() + " " + (0, e.printTs)(this.id) + " " + (0, n.con)(this.val);
    }
  };
  return Nn.ConNode = t, Nn;
}
var Yn = {}, xt = {}, Ot = {}, Qn = {}, $n = {}, er = {}, ya;
function qh() {
  if (ya) return er;
  ya = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.RelativeTimestamp = void 0;
  let n = class {
    /**
     *
     * @param sessionIndex Index of the clock in clock table.
     * @param timeDiff Time difference relative to the clock time from the table.
     */
    constructor(t, i) {
      this.sessionIndex = t, this.timeDiff = i;
    }
  };
  return er.RelativeTimestamp = n, er;
}
var va;
function Uh() {
  if (va) return $n;
  va = 1, Object.defineProperty($n, "__esModule", { value: !0 }), $n.ClockEncoder = void 0;
  const n = le(), e = qh();
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
      const o = new t(this.index++, (0, n.tick)(s, -1));
      this.table.clear(), this.table.set(s.sid, o);
    }
    append(s) {
      const o = s.time, a = s.sid;
      let u = this.table.get(a);
      if (!u) {
        let h = this.clock.peers.get(a);
        h || (h = new n.Timestamp(a, this.clock.time - 1)), u = new t(this.index++, h), this.table.set(a, u);
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
  return $n.ClockEncoder = i, $n;
}
var Nt = {}, ba;
function Mu() {
  if (ba) return Nt;
  ba = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.CRDT_MAJOR_OVERLAY = Nt.CRDT_MAJOR = void 0;
  var n;
  (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 1] = "VAL", t[t.OBJ = 2] = "OBJ", t[t.VEC = 3] = "VEC", t[t.STR = 4] = "STR", t[t.BIN = 5] = "BIN", t[t.ARR = 6] = "ARR";
  })(n || (Nt.CRDT_MAJOR = n = {}));
  var e;
  return (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 32] = "VAL", t[t.VEC = 96] = "VEC", t[t.OBJ = 64] = "OBJ", t[t.STR = 128] = "STR", t[t.BIN = 160] = "BIN", t[t.ARR = 192] = "ARR";
  })(e || (Nt.CRDT_MAJOR_OVERLAY = e = {})), Nt;
}
var ma;
function Fh() {
  if (ma) return Qn;
  ma = 1, Object.defineProperty(Qn, "__esModule", { value: !0 }), Qn.Encoder = void 0;
  const e = re.__importStar(kt()), t = Uh(), i = Ks(), r = le(), s = Cu(), o = Mu();
  let a = class extends s.CborEncoder {
    constructor(l) {
      super(l || new i.CrdtWriter()), this.clockEncoder = new t.ClockEncoder(), this.time = 0, this.cTableEntry = (c) => {
        const h = c.clock, y = this.writer;
        y.vu57(h.sid), y.vu57(h.time);
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
      const h = c.x0, y = c.x;
      c.x += 4, this.cRoot(l.root), this.encodeClockTable(h, y);
    }
    encodeServer(l) {
      this.ts = this.tsServer;
      const c = this.writer;
      c.u8(128), c.vu57(this.time = l.clock.time), this.cRoot(l.root);
    }
    encodeClockTable(l, c) {
      const h = this.writer, y = h.x0 - l;
      h.view.setUint32(h.x0 + (c - l), h.x - c - y - 4);
      const m = this.clockEncoder.table, k = m.size;
      h.vu57(k), m.forEach(this.cTableEntry);
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
      this.ts(l.id), c instanceof r.Timestamp ? (this.writer.u8(1), this.ts(c)) : (this.writer.u8(0), this.writeAny(c));
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
      const y = this.doc.index;
      for (let p = 0; p < h; p++) {
        const m = c[p];
        m ? this.cNode(y.get(m)) : this.writer.u8(0);
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
      for (let y = l.first(); y; y = l.next(y)) {
        c(y.id);
        const p = y.span, m = y.del;
        h.b1vu56(~~m, p), !m && h.buf(y.data, p);
      }
    }
    cArr(l) {
      const c = this.ts, h = this.writer;
      c(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.ARR, l.count);
      const y = this.doc.index;
      for (let p = l.first(); p; p = l.next(p)) {
        c(p.id);
        const m = p.span, k = p.del;
        if (h.b1vu56(~~k, m), k)
          continue;
        const b = p.data;
        for (let _ = 0; _ < m; _++)
          this.cNode(y.get(b[_]));
      }
    }
  };
  return Qn.Encoder = a, Qn;
}
var tr = {}, nr = {}, wa;
function zh() {
  if (wa) return nr;
  wa = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.ClockDecoder = void 0;
  const n = le();
  let e = class Du {
    static fromArr(i) {
      const r = new Du(i[0], i[1]), s = i.length;
      for (let o = 2; o < s; o += 2)
        r.pushTuple(i[o], i[o + 1]);
      return r;
    }
    constructor(i, r) {
      this.table = [], this.clock = new n.ClockVector(i, r + 1), this.table.push((0, n.ts)(i, r));
    }
    pushTuple(i, r) {
      const s = (0, n.ts)(i, r);
      this.clock.observe(s, 1), this.table.push(s);
    }
    decodeId(i, r) {
      if (!i)
        return (0, n.ts)(0, r);
      const s = this.table[i - 1];
      if (!s)
        throw new Error("INVALID_CLOCK_TABLE");
      return (0, n.ts)(s.sid, s.time - r);
    }
  };
  return nr.ClockDecoder = e, nr;
}
var _a;
function Zh() {
  if (_a) return tr;
  _a = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.Decoder = void 0;
  const e = re.__importStar(kt()), t = zh(), i = ju(), r = le(), s = to(), o = Eu(), a = Mu();
  let u = class extends o.CborDecoderBase {
    constructor() {
      super(new i.CrdtReader()), this.clockDecoder = void 0, this.time = -1, this.cStrChunk = () => {
        const c = this.ts(), h = this.val();
        return typeof h == "string" ? new e.StrChunk(c, h.length, h) : new e.StrChunk(c, ~~h, "");
      }, this.cBinChunk = () => {
        const c = this.ts(), h = this.reader, [y, p] = h.b1vu56();
        return y ? new e.BinChunk(c, p, void 0) : new e.BinChunk(c, p, h.buf(p));
      };
    }
    decode(c, h) {
      this.clockDecoder = void 0, this.time = -1;
      const y = this.reader;
      if (y.reset(c), y.peak() & 128) {
        y.x++;
        const b = this.time = y.vu57();
        h || (h = s.Model.withServerClock(void 0, b));
      } else if (this.decodeClockTable(), !h) {
        const b = this.clockDecoder.clock;
        h = s.Model.create(void 0, b);
      }
      this.doc = h;
      const m = this.cRoot(), k = h.root = new e.RootNode(this.doc, m.id);
      return m.parent = k, this.clockDecoder = void 0, h;
    }
    decodeClockTable() {
      const c = this.reader, h = c.u32(), y = c.x;
      c.x += h;
      const p = c.vu57(), m = c.vu57(), k = c.vu57();
      this.clockDecoder = new t.ClockDecoder(m, k);
      for (let b = 1; b < p; b++) {
        const _ = c.vu57(), f = c.vu57();
        this.clockDecoder.pushTuple(_, f);
      }
      c.x = y;
    }
    ts() {
      if (this.time < 0) {
        const [y, p] = this.reader.id();
        return this.clockDecoder.decodeId(y, p);
      } else
        return new r.Timestamp(1, this.reader.vu57());
    }
    cRoot() {
      const c = this.reader;
      return c.uint8[c.x] ? this.cNode() : s.UNDEFINED;
    }
    cNode() {
      const c = this.reader, h = this.ts(), y = c.u8(), p = y >> 5, m = y & 31;
      switch (p) {
        case a.CRDT_MAJOR.CON:
          return this.cCon(h, m);
        case a.CRDT_MAJOR.VAL:
          return this.cVal(h);
        case a.CRDT_MAJOR.OBJ:
          return this.cObj(h, m !== 31 ? m : c.vu57());
        case a.CRDT_MAJOR.VEC:
          return this.cVec(h, m !== 31 ? m : c.vu57());
        case a.CRDT_MAJOR.STR:
          return this.cStr(h, m !== 31 ? m : c.vu57());
        case a.CRDT_MAJOR.BIN:
          return this.cBin(h, m !== 31 ? m : c.vu57());
        case a.CRDT_MAJOR.ARR:
          return this.cArr(h, m !== 31 ? m : c.vu57());
      }
      throw new Error("UNKNOWN_NODE");
    }
    cCon(c, h) {
      const y = this.doc, p = h ? this.ts() : this.val(), m = new e.ConNode(c, p);
      return y.index.set(c, m), m;
    }
    cVal(c) {
      const h = this.cNode(), y = this.doc, p = new e.ValNode(y, c, h.id);
      return h.parent = p, y.index.set(c, p), p;
    }
    cObj(c, h) {
      const y = new e.ObjNode(this.doc, c);
      for (let p = 0; p < h; p++)
        this.cObjChunk(y);
      return this.doc.index.set(c, y), y;
    }
    cObjChunk(c) {
      const h = this.key(), y = this.cNode();
      y.parent = c, c.keys.set(h, y.id);
    }
    cVec(c, h) {
      const y = this.reader, p = new e.VecNode(this.doc, c), m = p.elements;
      for (let k = 0; k < h; k++)
        if (!y.peak())
          y.x++, m.push(void 0);
        else {
          const _ = this.cNode();
          _.parent = p, m.push(_.id);
        }
      return this.doc.index.set(c, p), p;
    }
    cStr(c, h) {
      const y = new e.StrNode(c);
      return h && y.ingest(h, this.cStrChunk), this.doc.index.set(c, y), y;
    }
    cBin(c, h) {
      const y = new e.BinNode(c);
      return h && y.ingest(h, this.cBinChunk), this.doc.index.set(c, y), y;
    }
    cArr(c, h) {
      const y = new e.ArrNode(this.doc, c);
      return h && y.ingest(h, () => {
        const p = this.ts(), [m, k] = this.reader.b1vu56();
        if (m)
          return new e.ArrChunk(p, k, void 0);
        const b = [];
        for (let _ = 0; _ < k; _++) {
          const f = this.cNode();
          f.parent = y, b.push(f.id);
        }
        return new e.ArrChunk(p, k, b);
      }), this.doc.index.set(c, y), y;
    }
  };
  return tr.Decoder = u, tr;
}
var ka;
function Hh() {
  if (ka) return Ot;
  ka = 1, Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.decoder = Ot.encoder = void 0;
  const n = Fh(), e = Zh();
  return Ot.encoder = new n.Encoder(), Ot.decoder = new e.Decoder(), Ot;
}
var Zi = {}, pe = {}, rr = {}, ii = {}, Sa;
function Ys() {
  if (Sa) return ii;
  Sa = 1, Object.defineProperty(ii, "__esModule", { value: !0 }), ii.hasOwnProperty = e;
  const n = Object.prototype.hasOwnProperty;
  function e(t, i) {
    return n.call(t, i);
  }
  return ii;
}
var xa;
function qu() {
  if (xa) return rr;
  xa = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.get = void 0;
  const n = Ys(), e = (t, i) => {
    const r = i.length;
    let s;
    if (!r)
      return t;
    for (let o = 0; o < r; o++)
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
        if (!t || !(0, n.hasOwnProperty)(t, s))
          return;
        t = t[s];
      } else
        return;
    return t;
  };
  return rr.get = e, rr;
}
var Hi = {}, Oa;
function Qs() {
  return Oa || (Oa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.isInteger = n.isRoot = n.toPath = void 0, n.unescapeComponent = s, n.escapeComponent = o, n.parseJsonPointer = a, n.formatJsonPointer = u, n.isChild = c, n.isPathEqual = h, n.parent = p, n.isValidIndex = m;
    const e = /~1/g, t = /~0/g, i = /~/g, r = /\//g;
    function s(b) {
      return b.indexOf("~") === -1 ? b : b.replace(e, "/").replace(t, "~");
    }
    function o(b) {
      return b.indexOf("/") === -1 && b.indexOf("~") === -1 ? b : b.replace(i, "~0").replace(r, "~1");
    }
    function a(b) {
      return b ? b.slice(1).split("/").map(s) : [];
    }
    function u(b) {
      return (0, n.isRoot)(b) ? "" : "/" + b.map((_) => o(String(_))).join("/");
    }
    const l = (b) => typeof b == "string" ? a(b) : b;
    n.toPath = l;
    function c(b, _) {
      if (b.length >= _.length)
        return !1;
      for (let f = 0; f < b.length; f++)
        if (b[f] !== _[f])
          return !1;
      return !0;
    }
    function h(b, _) {
      if (b.length !== _.length)
        return !1;
      for (let f = 0; f < b.length; f++)
        if (b[f] !== _[f])
          return !1;
      return !0;
    }
    const y = (b) => !b.length;
    n.isRoot = y;
    function p(b) {
      if (b.length < 1)
        throw new Error("NO_PARENT");
      return b.slice(0, b.length - 1);
    }
    function m(b) {
      if (typeof b == "number")
        return !0;
      const _ = Number.parseInt(b, 10);
      return String(_) === b && _ >= 0;
    }
    const k = (b) => {
      const _ = b.length;
      let f = 0, d;
      for (; f < _; ) {
        if (d = b.charCodeAt(f), d >= 48 && d <= 57) {
          f++;
          continue;
        }
        return !1;
      }
      return !0;
    };
    n.isInteger = k;
  })(Hi)), Hi;
}
var ir = {}, Ji = {}, Ki = {}, Na;
function Jh() {
  return Na || (Na = 1, Object.defineProperty(Ki, "__esModule", { value: !0 })), Ki;
}
var Wi = {}, Ca;
function Kh() {
  return Ca || (Ca = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.validatePath = n.validateJsonPointer = void 0;
    const e = (r) => {
      if (typeof r == "string") {
        if (r) {
          if (r[0] !== "/")
            throw new Error("POINTER_INVALID");
          if (r.length > 1024)
            throw new Error("POINTER_TOO_LONG");
        }
      } else
        (0, n.validatePath)(r);
    };
    n.validateJsonPointer = e;
    const { isArray: t } = Array, i = (r) => {
      if (!t(r))
        throw new Error("Invalid path.");
      if (r.length > 256)
        throw new Error("Path too long.");
      for (const s of r)
        switch (typeof s) {
          case "string":
          case "number":
            continue;
          default:
            throw new Error("Invalid path step.");
        }
    };
    n.validatePath = i;
  })(Wi)), Wi;
}
var Ee = {}, Ia;
function Wh() {
  if (Ia) return Ee;
  Ia = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.isObjectReference = Ee.isArrayEnd = Ee.isArrayReference = Ee.find = void 0;
  const n = Ys(), { isArray: e } = Array, t = (o, a) => {
    const u = a.length;
    if (!u)
      return { val: o };
    let l, c;
    for (let y = 0; y < u; y++)
      if (l = o, c = a[y], e(l)) {
        const p = l.length;
        if (c === "-")
          c = p;
        else if (typeof c == "string") {
          const m = ~~c;
          if ("" + m !== c)
            throw new Error("INVALID_INDEX");
          if (c = m, c < 0)
            throw new Error("INVALID_INDEX");
        }
        o = l[c];
      } else if (typeof l == "object" && l)
        o = (0, n.hasOwnProperty)(l, c) ? l[c] : void 0;
      else
        throw new Error("NOT_FOUND");
    return { val: o, obj: l, key: c };
  };
  Ee.find = t;
  const i = (o) => e(o.obj) && typeof o.key == "number";
  Ee.isArrayReference = i;
  const r = (o) => o.obj.length === o.key;
  Ee.isArrayEnd = r;
  const s = (o) => typeof o.obj == "object" && typeof o.key == "string";
  return Ee.isObjectReference = s, Ee;
}
var Gi = {}, sr = {}, Ta;
function Gh() {
  if (Ta) return sr;
  Ta = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.findByPointer = void 0;
  const n = Ys(), e = Qs(), { isArray: t } = Array, i = (r, s) => {
    if (!r)
      return { val: s };
    let o, a, u = 0, l = 1;
    for (; u > -1; )
      if (u = r.indexOf("/", l), a = u > -1 ? r.substring(l, u) : r.substring(l), l = u + 1, o = s, t(o)) {
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
        a = (0, e.unescapeComponent)(a), s = (0, n.hasOwnProperty)(o, a) ? o[a] : void 0;
      else
        throw "NOT_FOUND";
    return { val: s, obj: o, key: a };
  };
  return sr.findByPointer = i, sr;
}
var Aa;
function Xh() {
  return Aa || (Aa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(Gh(), n);
  })(Gi)), Gi;
}
var ja;
function Yh() {
  return ja || (ja = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Jh(), n), e.__exportStar(Qs(), n), e.__exportStar(Kh(), n), e.__exportStar(qu(), n), e.__exportStar(Wh(), n), e.__exportStar(Xh(), n);
  })(Ji)), Ji;
}
var Ea;
function Qh() {
  if (Ea) return ir;
  Ea = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.find = void 0;
  const n = Yh(), e = kt(), t = (i, r) => {
    const s = (0, n.toPath)(r);
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
  return ir.find = t, ir;
}
var or = {}, Pe = {}, ar = {}, Pa;
function Uu() {
  if (Pa) return ar;
  Pa = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.FanOut = void 0;
  class n {
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
  return ar.FanOut = n, ar;
}
var Ra;
function Fu() {
  if (Ra) return Pe;
  Ra = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.OnNewFanOut = Pe.MapFanOut = Pe.MicrotaskBufferFanOut = Pe.MergeFanOut = void 0;
  const n = Uu();
  class e extends n.FanOut {
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
  Pe.MergeFanOut = e;
  class t extends n.FanOut {
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
  Pe.MicrotaskBufferFanOut = t;
  class i extends n.FanOut {
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
  Pe.MapFanOut = i;
  class r extends n.FanOut {
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
  return Pe.OnNewFanOut = r, Pe;
}
var La;
function $h() {
  if (La) return or;
  La = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.NodeEvents = void 0;
  const n = Fu();
  let e = class {
    constructor(i) {
      this.api = i, this.subscribe = (r) => this.onViewChanges.listen(() => r()), this.getSnapshot = () => this.api.view(), this.onChanges = new n.MapFanOut(this.api.api.onChanges, this.getSnapshot), this.onViewChanges = new n.OnNewFanOut(this.onChanges, this.api.view());
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
  return or.NodeEvents = e, or;
}
var cr = {}, Ba;
function ed() {
  if (Ba) return cr;
  Ba = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.ExtNode = void 0;
  const n = le();
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
    toString(i, r) {
      return this.name() + (r ? " " + (0, n.printTs)(r) : "") + " " + this.data.toString(i);
    }
  };
  return cr.ExtNode = e, cr;
}
var Ct = {}, Xi = {}, Yi = {}, Va;
function td() {
  return Va || (Va = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.deepEqual = void 0;
    const e = Array.isArray, t = Object.prototype, i = (r, s) => {
      if (r === s)
        return !0;
      let o = 0, a = 0;
      if (e(r)) {
        if (!e(s) || (o = r.length, o !== s.length))
          return !1;
        for (a = o; a-- !== 0; )
          if (!(0, n.deepEqual)(r[a], s[a]))
            return !1;
        return !0;
      }
      if (r && s && typeof r == "object" && typeof s == "object") {
        e: {
          if (r.__proto__ === t)
            break e;
          if (r instanceof Uint8Array) {
            if (!(s instanceof Uint8Array))
              return !1;
            const l = r.length;
            if (l !== s.length)
              return !1;
            for (let c = 0; c < l; c++)
              if (r[c] !== s[c])
                return !1;
            return !0;
          }
        }
        const u = Object.keys(r);
        if (o = u.length, o !== Object.keys(s).length || e(s))
          return !1;
        for (a = o; a-- !== 0; ) {
          const l = u[a];
          if (!(0, n.deepEqual)(r[l], s[l]))
            return !1;
        }
        return !0;
      }
      return !1;
    };
    n.deepEqual = i;
  })(Yi)), Yi;
}
var Ma;
function nd() {
  return Ma || (Ma = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(td(), n);
  })(Xi)), Xi;
}
var ur = {}, Da;
function rd() {
  if (Da) return ur;
  Da = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.cmpUint8Array = void 0;
  const n = (e, t) => {
    const i = e.length;
    if (i !== t.length)
      return !1;
    for (let r = 0; r < i; r++)
      if (e[r] !== t[r])
        return !1;
    return !0;
  };
  return ur.cmpUint8Array = n, ur;
}
var Qi = {}, qa;
function $s() {
  return qa || (qa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.apply = n.invert = n.dst = n.src = n.diffEdit = n.diff = n.overlap = n.sfx = n.pfx = n.normalize = void 0;
    const e = (d) => {
      const g = d.length;
      if (g < 2)
        return d;
      let v = 0;
      e: {
        if (!d[0][1])
          break e;
        for (v = 1; v < g; v++) {
          const x = d[v - 1], N = d[v];
          if (!N[1] || x[0] === N[0])
            break e;
        }
        return d;
      }
      const w = [];
      for (let x = 0; x < v; x++)
        w.push(d[x]);
      for (let x = v; x < g; x++) {
        const N = d[x];
        if (!N[1])
          continue;
        const C = w.length > 0 ? w[w.length - 1] : null;
        C && C[0] === N[0] ? C[1] += N[1] : w.push(N);
      }
      return w;
    };
    n.normalize = e;
    const t = (d) => {
      const g = d.charCodeAt(0);
      return g >= 56320 && g <= 57343;
    }, i = (d) => {
      const g = d.charCodeAt(d.length - 1);
      return g >= 55296 && g <= 56319;
    }, r = (d, g) => {
      d.push([0, ""]);
      let v = 0, w = 0, x = 0, N = "", C = "", E = 0;
      for (; v < d.length; ) {
        if (v < d.length - 1 && !d[v][1]) {
          d.splice(v, 1);
          continue;
        }
        const I = d[v];
        switch (I[0]) {
          case 1:
            x++, v++, C += I[1];
            break;
          case -1:
            w++, v++, N += I[1];
            break;
          case 0: {
            let j = v - x - w - 1;
            if (g) {
              const L = d[j];
              if (j >= 0) {
                let ue = L[1];
                if (i(ue)) {
                  const X = ue.slice(-1);
                  if (L[1] = ue = ue.slice(0, -1), N = X + N, C = X + C, !ue) {
                    d.splice(j, 1), v--;
                    let he = j - 1;
                    const oe = d[he];
                    if (oe) {
                      const se = oe[0];
                      se === 1 ? (x++, he--, C = oe[1] + C) : se === -1 && (w++, he--, N = oe[1] + N);
                    }
                    j = he;
                  }
                }
              }
              const Z = d[v], K = Z[1];
              if (t(K)) {
                const ue = K.charAt(0);
                Z[1] = K.slice(1), N += ue, C += ue;
              }
            }
            if (v < d.length - 1 && !d[v][1]) {
              d.splice(v, 1);
              break;
            }
            const P = N.length > 0, R = C.length > 0;
            if (P || R) {
              P && R && (E = (0, n.pfx)(C, N), E !== 0 && (j >= 0 ? d[j][1] += C.slice(0, E) : (d.splice(0, 0, [0, C.slice(0, E)]), v++), C = C.slice(E), N = N.slice(E)), E = (0, n.sfx)(C, N), E !== 0 && (d[v][1] = C.slice(C.length - E) + d[v][1], C = C.slice(0, C.length - E), N = N.slice(0, N.length - E)));
              const L = x + w, Z = N.length, K = C.length;
              Z === 0 && K === 0 ? (d.splice(v - L, L), v = v - L) : Z === 0 ? (d.splice(v - L, L, [1, C]), v = v - L + 1) : K === 0 ? (d.splice(v - L, L, [-1, N]), v = v - L + 1) : (d.splice(v - L, L, [-1, N], [1, C]), v = v - L + 2);
            }
            const B = d[v - 1];
            v !== 0 && B[0] === 0 ? (B[1] += d[v][1], d.splice(v, 1)) : v++, x = 0, w = 0, N = "", C = "";
            break;
          }
        }
      }
      d[d.length - 1][1] === "" && d.pop();
      let O = !1;
      for (v = 1; v < d.length - 1; ) {
        const I = d[v - 1], j = d[v + 1];
        if (I[0] === 0 && j[0] === 0) {
          const P = I[1], R = d[v], B = R[1], L = j[1];
          B.slice(B.length - P.length) === P ? (d[v][1] = P + B.slice(0, B.length - P.length), j[1] = P + L, d.splice(v - 1, 1), O = !0) : B.slice(0, L.length) === L && (I[1] += j[1], R[1] = B.slice(L.length) + L, d.splice(v + 1, 1), O = !0);
        }
        v++;
      }
      O && r(d, g);
    }, s = (d, g, v, w) => {
      if (v > 0 && v < d.length) {
        const C = d.charCodeAt(v);
        C >= 56320 && C <= 57343 && v--;
      }
      if (w > 0 && w < g.length) {
        const C = g.charCodeAt(w);
        C >= 56320 && C <= 57343 && w--;
      }
      const x = h(d.slice(0, v), g.slice(0, w), !1), N = h(d.slice(v), g.slice(w), !1);
      return x.concat(N);
    }, o = (d, g) => {
      const v = d.length, w = g.length, x = Math.ceil((v + w) / 2), N = x, C = 2 * x, E = new Array(C), O = new Array(C);
      for (let Z = 0; Z < C; Z++)
        E[Z] = -1, O[Z] = -1;
      E[N + 1] = 0, O[N + 1] = 0;
      const I = v - w, j = I % 2 !== 0;
      let P = 0, R = 0, B = 0, L = 0;
      for (let Z = 0; Z < x; Z++) {
        for (let K = -Z + P; K <= Z - R; K += 2) {
          const ue = N + K;
          let X = 0;
          const he = E[ue - 1], oe = E[ue + 1];
          K === -Z || K !== Z && he < oe ? X = oe : X = he + 1;
          let se = X - K;
          for (; X < v && se < w && d.charAt(X) === g.charAt(se); )
            X++, se++;
          if (E[ue] = X, X > v)
            R += 2;
          else if (se > w)
            P += 2;
          else if (j) {
            const ie = N + I - K, Se = O[ie];
            if (ie >= 0 && ie < C && Se !== -1 && X >= v - Se)
              return s(d, g, X, se);
          }
        }
        for (let K = -Z + B; K <= Z - L; K += 2) {
          const ue = N + K;
          let X = K === -Z || K !== Z && O[ue - 1] < O[ue + 1] ? O[ue + 1] : O[ue - 1] + 1, he = X - K;
          for (; X < v && he < w && d.charAt(v - X - 1) === g.charAt(w - he - 1); )
            X++, he++;
          if (O[ue] = X, X > v)
            L += 2;
          else if (he > w)
            B += 2;
          else if (!j) {
            const oe = N + I - K, se = E[oe];
            if (oe >= 0 && oe < C && se !== -1) {
              const ie = N + se - oe;
              if (X = v - X, se >= X)
                return s(d, g, se, ie);
            }
          }
        }
      }
      return [
        [-1, d],
        [1, g]
      ];
    }, a = (d, g) => {
      if (!d)
        return [[1, g]];
      if (!g)
        return [[-1, d]];
      const v = d.length, w = g.length, x = v > w ? d : g, N = v > w ? g : d, C = N.length, E = x.indexOf(N);
      if (E >= 0) {
        const O = x.slice(0, E), I = x.slice(E + C);
        return v > w ? [
          [-1, O],
          [0, N],
          [-1, I]
        ] : [
          [1, O],
          [0, N],
          [1, I]
        ];
      }
      return C === 1 ? [
        [-1, d],
        [1, g]
      ] : o(d, g);
    }, u = (d, g) => {
      if (!d || !g || d.charAt(0) !== g.charAt(0))
        return 0;
      let v = 0, w = Math.min(d.length, g.length), x = w, N = 0;
      for (; v < x; )
        d.slice(N, x) === g.slice(N, x) ? (v = x, N = v) : w = x, x = Math.floor((w - v) / 2 + v);
      const C = d.charCodeAt(x - 1);
      return C >= 55296 && C <= 56319 && x--, x;
    };
    n.pfx = u;
    const l = (d, g) => {
      if (!d || !g || d.slice(-1) !== g.slice(-1))
        return 0;
      let v = 0, w = Math.min(d.length, g.length), x = w, N = 0;
      for (; v < x; )
        d.slice(d.length - x, d.length - N) === g.slice(g.length - x, g.length - N) ? (v = x, N = v) : w = x, x = Math.floor((w - v) / 2 + v);
      if (x > 0 && x < d.length) {
        const C = d.length - x - 1, E = d.charCodeAt(C), O = E >= 55296 && E <= 56319, I = E === 8205 || // ZWJ
        E >= 65024 && E <= 65039 || // Variation selectors
        E >= 768 && E <= 879;
        if (O || I)
          for (x--; x > 0; ) {
            const j = d.length - x - 1;
            if (j < 0)
              break;
            const P = d.charCodeAt(j), R = P >= 55296 && P <= 56319, B = P === 8205 || P >= 65024 && P <= 65039 || P >= 768 && P <= 879;
            if (!R && !B)
              break;
            x--;
          }
      }
      return x;
    };
    n.sfx = l;
    const c = (d, g) => {
      const v = d.length, w = g.length;
      if (v === 0 || w === 0)
        return 0;
      let x = v;
      if (v > w ? (x = w, d = d.substring(v - w)) : v < w && (g = g.substring(0, v)), d === g)
        return x;
      let N = 0, C = 1;
      for (; ; ) {
        const E = d.substring(x - C), O = g.indexOf(E);
        if (O === -1)
          return N;
        C += O, (O === 0 || d.substring(x - C) === g.substring(0, C)) && (N = C, C++);
      }
    };
    n.overlap = c;
    const h = (d, g, v) => {
      if (d === g)
        return d ? [[0, d]] : [];
      const w = (0, n.pfx)(d, g), x = d.slice(0, w);
      d = d.slice(w), g = g.slice(w);
      const N = (0, n.sfx)(d, g), C = d.slice(d.length - N);
      d = d.slice(0, d.length - N), g = g.slice(0, g.length - N);
      const E = a(d, g);
      return x && E.unshift([0, x]), C && E.push([0, C]), r(E, v), E;
    }, y = (d, g) => h(d, g, !0);
    n.diff = y;
    const p = (d, g, v) => {
      e: {
        if (v < 0)
          break e;
        const w = d.length, x = g.length;
        if (w === x)
          break e;
        const N = g.slice(v), C = N.length;
        if (C > w || d.slice(w - C) !== N)
          break e;
        if (x > w) {
          const I = w - C, j = d.slice(0, I), P = g.slice(0, I);
          if (j !== P)
            break e;
          const R = g.slice(I, v), B = [];
          return j && B.push([0, j]), R && B.push([1, R]), N && B.push([0, N]), B;
        } else {
          const I = x - C, j = g.slice(0, I), P = d.slice(0, I);
          if (P !== j)
            break e;
          const R = d.slice(I, w - C), B = [];
          return P && B.push([0, P]), R && B.push([-1, R]), N && B.push([0, N]), B;
        }
      }
      return (0, n.diff)(d, g);
    };
    n.diffEdit = p;
    const m = (d) => {
      let g = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const x = d[w];
        x[0] !== 1 && (g += x[1]);
      }
      return g;
    };
    n.src = m;
    const k = (d) => {
      let g = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const x = d[w];
        x[0] !== -1 && (g += x[1]);
      }
      return g;
    };
    n.dst = k;
    const b = (d) => {
      const g = d[0];
      return g === 0 ? d : g === 1 ? [-1, d[1]] : [1, d[1]];
    }, _ = (d) => d.map(b);
    n.invert = _;
    const f = (d, g, v, w) => {
      const x = d.length;
      let N = g;
      for (let C = x - 1; C >= 0; C--) {
        const [E, O] = d[C];
        if (E === 0)
          N -= O.length;
        else if (E === 1)
          v(N, O);
        else {
          const I = O.length;
          N -= I, w(N, I, O);
        }
      }
    };
    n.apply = f;
  })(Qi)), Qi;
}
var $i = {}, Ua;
function id() {
  return Ua || (Ua = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.dst = n.src = n.apply = n.diff = n.toBin = n.toStr = void 0;
    const t = re.__importStar($s()), i = (l) => {
      let c = "";
      const h = l.length;
      for (let y = 0; y < h; y++)
        c += String.fromCharCode(l[y]);
      return c;
    };
    n.toStr = i;
    const r = (l) => {
      const c = l.length, h = new Uint8Array(c);
      for (let y = 0; y < c; y++)
        h[y] = l.charCodeAt(y);
      return h;
    };
    n.toBin = r;
    const s = (l, c) => {
      const h = (0, n.toStr)(l), y = (0, n.toStr)(c);
      return t.diff(h, y);
    };
    n.diff = s;
    const o = (l, c, h, y) => t.apply(l, c, (p, m) => h(p, (0, n.toBin)(m)), y);
    n.apply = o;
    const a = (l) => (0, n.toBin)(t.src(l));
    n.src = a;
    const u = (l) => (0, n.toBin)(t.dst(l));
    n.dst = u;
  })($i)), $i;
}
var es = {}, Fa;
function sd() {
  return Fa || (Fa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.apply = n.diff = n.agg = void 0;
    const t = re.__importStar($s()), i = (o) => {
      const a = [], u = o.length;
      let l = [];
      const c = (h, y) => {
        if (!y.length)
          return;
        const p = l.length;
        if (p) {
          const m = l[p - 1];
          if (m[0] === h) {
            m[1] += y;
            return;
          }
        }
        l.push([h, y]);
      };
      e: for (let h = 0; h < u; h++) {
        const y = o[h], p = y[0], m = y[1], k = m.indexOf(`
`);
        if (k < 0) {
          c(p, m);
          continue e;
        } else
          c(p, m.slice(0, k + 1)), l.length && a.push(l), l = [];
        let b = k;
        const _ = m.length;
        t: for (; b < _; ) {
          const f = m.indexOf(`
`, b + 1);
          if (f < 0) {
            c(p, m.slice(b + 1));
            break t;
          }
          a.push([[p, m.slice(b + 1, f + 1)]]), b = f;
        }
      }
      l.length && a.push(l);
      {
        const h = a.length;
        for (let y = 0; y < h; y++) {
          const p = a[y] = t.normalize(a[y]), m = p.length;
          e: {
            if (m < 2)
              break e;
            const k = p[0], b = p[1], _ = b[0];
            if (k[0] !== 0 || _ !== -1 && _ !== 1)
              break e;
            for (let f = 2; f < m; f++)
              if (p[f][0] !== _)
                break e;
            for (let f = y + 1; f < h; f++) {
              const d = a[f] = t.normalize(a[f]), g = d.length, v = k[1];
              let w, x;
              if (d.length > 1 && (w = d[0])[0] === _ && (x = d[1])[0] === 0 && v === w[1]) {
                p.splice(0, 1), b[1] = v + b[1], x[1] = v + x[1], d.splice(0, 1);
                break e;
              } else
                for (let N = 0; N < g; N++)
                  if (d[N][0] !== _)
                    break e;
            }
          }
          e: {
            if (p.length < 2)
              break e;
            const k = p[p.length - 1], b = k[1];
            if (k[0] !== -1)
              break e;
            t: for (let _ = y + 1; _ < h; _++) {
              const f = a[_] = t.normalize(a[_]), d = f.length;
              let g;
              if (d === 0)
                continue t;
              if (d === 1) {
                if (g = f[0], g[0] === -1)
                  continue t;
                if (f[0][0] !== 0)
                  break e;
              } else if (g = f[1], d > 2 || f[0][0] !== -1)
                break e;
              const v = g[0];
              if (v === -1)
                continue t;
              if (v !== 0)
                break e;
              const w = g[1];
              if (w.length > b.length || !b.endsWith(w))
                break e;
              const x = b.length - w.length;
              k[1] = b.slice(0, x), p.push([0, w]), g[0] = -1, a[y] = t.normalize(a[y]), a[_] = t.normalize(a[_]);
              break e;
            }
          }
        }
      }
      return a;
    };
    n.agg = i;
    const r = (o, a) => {
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
      const c = t.diff(u, l), h = (0, n.agg)(c), y = h.length, p = [];
      let m = -1, k = -1;
      const b = o.length, _ = a.length;
      for (let f = 0; f < y; f++) {
        const d = h[f];
        let g = d.length;
        if (!g)
          continue;
        const v = d[g - 1], w = v[0], x = v[1];
        if (x === `
`)
          d.splice(g - 1, 1);
        else {
          const C = x.length;
          x[C - 1] === `
` && (C === 1 ? d.splice(g - 1, 1) : v[1] = x.slice(0, C - 1));
        }
        let N = 0;
        if (g = d.length, !g)
          w === 0 ? (N = 0, m++, k++) : w === 1 ? (N = 1, k++) : w === -1 && (N = -1, m++);
        else if (f + 1 === y)
          m + 1 < b ? k + 1 < _ ? (N = g === 1 && d[0][0] === 0 ? 0 : 2, m++, k++) : (N = -1, m++) : (N = 1, k++);
        else {
          const E = d[0][0];
          g === 1 && E === w && E === 0 ? (m++, k++) : w === 0 ? (N = 2, m++, k++) : w === 1 ? (N = 1, k++) : w === -1 && (N = -1, m++);
        }
        N === 0 && o[m] !== a[k] && (N = 2), p.push([N, m, k]);
      }
      return p;
    };
    n.diff = r;
    const s = (o, a, u, l) => {
      const c = o.length;
      e: for (let h = c - 1; h >= 0; h--) {
        const [y, p, m] = o[h];
        switch (y) {
          case 0:
            continue e;
          case -1:
            a(p);
            break;
          case 1:
            u(p, m);
            break;
          case 2:
            l(p, m);
            break;
        }
      }
    };
    n.apply = s;
  })(es)), es;
}
var ts = {}, lr = {}, za;
function _i() {
  if (za) return lr;
  za = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.sort = void 0;
  const n = (e) => {
    const t = e.length;
    for (let i = 1; i < t; i++) {
      const r = e[i];
      let s = i;
      for (; s !== 0 && e[s - 1] > r; )
        e[s] = e[s - 1], s--;
      e[s] = r;
    }
    return e;
  };
  return lr.sort = n, lr;
}
var ns = {}, Za;
function eo() {
  return Za || (Za = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.hash = n.updateJson = n.updateBin = n.updateStr = n.updateNum = n.CONST = void 0;
    const e = _i();
    var t;
    (function(u) {
      u[u.START_STATE = 5381] = "START_STATE", u[u.NULL = 982452847] = "NULL", u[u.TRUE = 982453247] = "TRUE", u[u.FALSE = 982454243] = "FALSE", u[u.ARRAY = 982452259] = "ARRAY", u[u.STRING = 982453601] = "STRING", u[u.OBJECT = 982454533] = "OBJECT", u[u.BINARY = 982454837] = "BINARY";
    })(t || (n.CONST = t = {}));
    const i = (u, l) => (u << 5) + u + l;
    n.updateNum = i;
    const r = (u, l) => {
      const c = l.length;
      u = (0, n.updateNum)(u, t.STRING), u = (0, n.updateNum)(u, c);
      let h = c;
      for (; h; )
        u = (u << 5) + u + l.charCodeAt(--h);
      return u;
    };
    n.updateStr = r;
    const s = (u, l) => {
      const c = l.length;
      u = (0, n.updateNum)(u, t.BINARY), u = (0, n.updateNum)(u, c);
      let h = c;
      for (; h; )
        u = (u << 5) + u + l[--h];
      return u;
    };
    n.updateBin = s;
    const o = (u, l) => {
      switch (typeof l) {
        case "number":
          return (0, n.updateNum)(u, l);
        case "string":
          return u = (0, n.updateNum)(u, t.STRING), (0, n.updateStr)(u, l);
        case "object": {
          if (l === null)
            return (0, n.updateNum)(u, t.NULL);
          if (Array.isArray(l)) {
            const y = l.length;
            u = (0, n.updateNum)(u, t.ARRAY);
            for (let p = 0; p < y; p++)
              u = (0, n.updateJson)(u, l[p]);
            return u;
          }
          if (l instanceof Uint8Array)
            return (0, n.updateBin)(u, l);
          u = (0, n.updateNum)(u, t.OBJECT);
          const c = (0, e.sort)(Object.keys(l)), h = c.length;
          for (let y = 0; y < h; y++) {
            const p = c[y];
            u = (0, n.updateStr)(u, p), u = (0, n.updateJson)(u, l[p]);
          }
          return u;
        }
        case "boolean":
          return (0, n.updateNum)(u, l ? t.TRUE : t.FALSE);
      }
      return u;
    };
    n.updateJson = o;
    const a = (u) => (0, n.updateJson)(t.START_STATE, u) >>> 0;
    n.hash = a;
  })(ns)), ns;
}
var rs = {}, Ha;
function zu() {
  return Ha || (Ha = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHash = void 0;
    const e = _i(), t = eo(), i = _t(), r = (s) => {
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
              a += (0, n.structHash)(s[u]) + ";";
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
                a += (0, t.hash)(c).toString(36) + ":" + (0, n.structHash)(s[c]) + ",";
              }
              return a + "}";
            }
          }
        default:
          return "U";
      }
    };
    n.structHash = r;
  })(rs)), rs;
}
var Ja;
function od() {
  return Ja || (Ja = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHashCrdt = void 0;
    const e = _i(), t = il(), i = eo(), r = zu(), s = (o) => {
      if (o instanceof t.ConNode)
        return (0, r.structHash)(o.val);
      if (o instanceof t.ValNode)
        return (0, n.structHashCrdt)(o.node());
      if (o instanceof t.StrNode)
        return (0, i.hash)(o.view()).toString(36);
      if (o instanceof t.ObjNode) {
        let a = "{";
        const u = Array.from(o.keys.keys());
        (0, e.sort)(u);
        const l = u.length;
        for (let c = 0; c < l; c++) {
          const h = u[c], y = o.get(h);
          a += (0, i.hash)(h).toString(36) + ":" + (0, n.structHashCrdt)(y) + ",";
        }
        return a + "}";
      } else if (o instanceof t.ArrNode || o instanceof t.VecNode) {
        let a = "[";
        return o.children((u) => {
          a += (0, n.structHashCrdt)(u) + ";";
        }), a + "]";
      } else if (o instanceof t.BinNode)
        return (0, i.hash)(o.view()).toString(36);
      return "U";
    };
    n.structHashCrdt = s;
  })(ts)), ts;
}
var is = {}, Ka;
function ad() {
  return Ka || (Ka = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHashSchema = void 0;
    const e = _i(), t = mi(), i = eo(), r = zu(), s = (o) => {
      if (o instanceof t.nodes.con || o instanceof t.nodes.str || o instanceof t.nodes.bin)
        return (0, r.structHash)(o.raw);
      if (o instanceof t.nodes.val)
        return (0, n.structHashSchema)(o.value);
      if (o instanceof t.nodes.obj) {
        let a = "{";
        const u = { ...o.obj, ...o.opt }, l = Object.keys(u);
        (0, e.sort)(l);
        const c = l.length;
        for (let h = 0; h < c; h++) {
          const y = l[h], p = u[y];
          a += (0, i.hash)(y).toString(36) + ":" + (0, n.structHashSchema)(p) + ",";
        }
        return a + "}";
      } else if (o instanceof t.nodes.arr || o instanceof t.nodes.vec) {
        let a = "[";
        const u = o instanceof t.nodes.arr ? o.arr : o.value;
        for (const l of u)
          a += (0, n.structHashSchema)(l) + ";";
        return a + "]";
      }
      return (0, r.structHash)(o);
    };
    n.structHashSchema = s;
  })(is)), is;
}
var Wa;
function Zu() {
  if (Wa) return Ct;
  Wa = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.JsonCrdtDiff = Ct.DiffError = void 0;
  const n = re, e = nd(), t = rd(), i = _t(), r = kt(), s = n.__importStar($s()), o = n.__importStar(id()), a = n.__importStar(sd()), u = od(), l = ad();
  class c extends Error {
    constructor(p = "DIFF") {
      super(p);
    }
  }
  Ct.DiffError = c;
  let h = class {
    constructor(p) {
      this.model = p, this.builder = new i.PatchBuilder(p.clock.clone());
    }
    diffStr(p, m) {
      const k = p.view();
      if (k === m)
        return;
      const b = this.builder;
      s.apply(s.diff(k, m), k.length, (_, f) => b.insStr(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => b.del(p.id, p.findInterval(_, f)));
    }
    diffBin(p, m) {
      const k = p.view();
      if ((0, t.cmpUint8Array)(k, m))
        return;
      const b = this.builder;
      o.apply(o.diff(k, m), k.length, (_, f) => b.insBin(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => b.del(p.id, p.findInterval(_, f)));
    }
    diffArr(p, m) {
      if (p.size() === 0) {
        const x = m.length;
        if (x === 0)
          return;
        let N = p.id;
        for (let C = 0; C < x; C++)
          N = this.builder.insArr(p.id, N, [this.buildView(m[C])]);
        return;
      } else if (m.length === 0) {
        const x = [];
        for (const N of p.chunks()) {
          if (N.del)
            continue;
          const C = N.id;
          x.push((0, i.tss)(C.sid, C.time, N.span));
        }
        x.length && this.builder.del(p.id, x);
        return;
      }
      const k = [];
      p.children((x) => k.push((0, u.structHashCrdt)(x)));
      const b = [], _ = m.length;
      for (let x = 0; x < _; x++)
        b.push((0, l.structHashSchema)(m[x]));
      const f = a.diff(k, b);
      if (!f.length)
        return;
      const d = [], g = [];
      a.apply(f, (x) => {
        const N = p.findInterval(x, 1);
        if (!N || !N.length)
          throw new c();
        g.push(...N);
      }, (x, N) => {
        const C = m[N], E = x >= 0 ? p.find(x) : p.id;
        if (!E)
          throw new c();
        d.push([E, [C]]);
      }, (x, N) => {
        const C = m[N];
        try {
          this.diffAny(p.getNode(x), C);
        } catch (E) {
          if (E instanceof c) {
            const O = p.findInterval(x, 1);
            g.push(...O);
            const I = x ? p.find(x - 1) : p.id;
            if (!I)
              throw new c();
            d.push([I, [C]]);
          } else
            throw E;
        }
      });
      const v = this.builder, w = d.length;
      for (let x = 0; x < w; x++) {
        const [N, C] = d[x];
        v.insArr(p.id, N, C.map((E) => this.buildView(E)));
      }
      g.length && v.del(p.id, g);
    }
    diffObj(p, m) {
      const k = this.builder, b = [], _ = /* @__PURE__ */ new Set();
      p.forEach((g) => {
        _.add(g), m[g] === void 0 && b.push([g, k.con(void 0)]);
      });
      const f = Object.keys(m), d = f.length;
      for (let g = 0; g < d; g++) {
        const v = f[g], w = m[v];
        if (_.has(v)) {
          const x = p.get(v);
          if (x)
            try {
              this.diffAny(x, w);
              continue;
            } catch (N) {
              if (!(N instanceof c))
                throw N;
            }
        }
        b.push([v, this.buildConView(w)]);
      }
      b.length && k.insObj(p.id, b);
    }
    diffVec(p, m) {
      const k = this.builder, b = [], _ = p.elements, f = _.length, d = m.length, g = p.doc.index, v = Math.min(f, d);
      for (let w = d; w < f; w++) {
        const x = _[w];
        if (x) {
          const N = g.get(x);
          if (!N || N instanceof r.ConNode && N.val === void 0)
            continue;
          b.push([w, k.con(void 0)]);
        }
      }
      e: for (let w = 0; w < v; w++) {
        const x = m[w], N = p.get(w);
        if (N) {
          try {
            this.diffAny(N, x);
            continue;
          } catch (C) {
            if (!(C instanceof c))
              throw C;
          }
          if (N instanceof r.ConNode && typeof x != "object") {
            const C = k.con(x);
            b.push([w, C]);
            continue e;
          }
        }
        b.push([w, this.buildConView(x)]);
      }
      for (let w = f; w < d; w++)
        b.push([w, this.buildConView(m[w])]);
      b.length && k.insVec(p.id, b);
    }
    diffVal(p, m) {
      try {
        this.diffAny(p.node(), m);
      } catch (k) {
        if (k instanceof c)
          this.builder.setVal(p.id, this.buildConView(m));
        else
          throw k;
      }
    }
    diffAny(p, m) {
      if (p instanceof r.ConNode) {
        m instanceof i.nodes.con && (m = m.raw);
        const k = p.val;
        if (k !== m && (k instanceof i.Timestamp && !(m instanceof i.Timestamp) || !(k instanceof i.Timestamp) && m instanceof i.Timestamp || !(0, e.deepEqual)(p.val, m)))
          throw new c();
      } else if (p instanceof r.StrNode) {
        if (m instanceof i.nodes.str && (m = m.raw), typeof m != "string")
          throw new c();
        this.diffStr(p, m);
      } else if (p instanceof r.ObjNode) {
        if (m instanceof i.nodes.obj && (m = m.opt ? { ...m.obj, ...m.opt } : m.obj), m instanceof i.NodeBuilder)
          throw new c();
        if (m instanceof Uint8Array)
          throw new c();
        if (!m || typeof m != "object" || Array.isArray(m))
          throw new c();
        this.diffObj(p, m);
      } else if (p instanceof r.ValNode)
        m instanceof i.nodes.val && (m = m.value), this.diffVal(p, m);
      else if (p instanceof r.ArrNode) {
        if (m instanceof i.nodes.arr && (m = m.arr), !Array.isArray(m))
          throw new c();
        this.diffArr(p, m);
      } else if (p instanceof r.VecNode) {
        if (m instanceof i.nodes.vec && (m = m.value), !Array.isArray(m))
          throw new c();
        this.diffVec(p, m);
      } else if (p instanceof r.BinNode) {
        if (m instanceof i.nodes.bin && (m = m.raw), !(m instanceof Uint8Array))
          throw new c();
        this.diffBin(p, m);
      } else
        throw new c();
    }
    diff(p, m) {
      return this.diffAny(p, m), this.builder.flush();
    }
    /** Diffs only keys present in the destination object. */
    diffDstKeys(p, m) {
      const k = this.builder, b = [], _ = Object.keys(m), f = _.length;
      for (let d = 0; d < f; d++) {
        const g = _[d], v = p.get(g), w = m[g];
        if (!v) {
          b.push([g, this.buildConView(w)]);
          continue;
        }
        try {
          this.diffAny(v, w);
        } catch (x) {
          if (x instanceof c)
            b.push([g, this.buildConView(w)]);
          else
            throw x;
        }
      }
      return b.length && k.insObj(p.id, b), this.builder.flush();
    }
    buildView(p) {
      const m = this.builder;
      return p instanceof i.Timestamp ? m.con(p) : p instanceof i.nodes.con ? m.con(p.raw) : m.json(p);
    }
    buildConView(p) {
      const m = this.builder;
      return p instanceof i.Timestamp ? m.con(p) : p instanceof i.nodes.con ? m.con(p.raw) : m.constOrJson(p);
    }
  };
  return Ct.JsonCrdtDiff = h, Ct;
}
var ss = {}, Ga;
function cd() {
  return Ga || (Ga = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.merge = n.diff = void 0;
    const e = Zu(), t = (r, s) => {
      const a = new e.JsonCrdtDiff(r.api.model).diff(r.node, s);
      return a.ops.length ? a : void 0;
    };
    n.diff = t;
    const i = (r, s) => {
      const o = (0, n.diff)(r, s);
      return o && r.api.model.applyLocalPatch(o), o;
    };
    n.merge = i;
  })(ss)), ss;
}
var hr = {}, Xa;
function ud() {
  if (Xa) return hr;
  Xa = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.ChangeEvent = void 0;
  const n = _t(), e = (i) => i instanceof n.InsValOp || i instanceof n.InsObjOp || i instanceof n.InsVecOp || i instanceof n.InsStrOp || i instanceof n.InsBinOp || i instanceof n.InsArrOp || i instanceof n.UpdArrOp || i instanceof n.DelOp;
  class t {
    constructor(r, s) {
      this.raw = r, this.api = s, this._direct = null, this._parents = null;
    }
    origin() {
      var o;
      const { raw: r, api: s } = this;
      return r instanceof Set ? 2 : typeof r == "number" ? 0 : r instanceof n.Patch ? ((o = r.getId()) == null ? void 0 : o.sid) === s.model.clock.sid ? 0 : 1 : 0;
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
      let r = this._direct;
      e: if (!r) {
        const s = this.raw;
        if (s instanceof Set) {
          this._direct = r = s;
          break e;
        }
        this._direct = r = /* @__PURE__ */ new Set();
        const o = this.api.model.index;
        if (typeof s == "number") {
          const a = s, l = this.api.builder.patch.ops;
          for (let c = a; c < l.length; c++) {
            const h = l[c];
            if (e(h)) {
              const y = o.get(h.obj);
              y && r.add(y);
            }
          }
        } else if (s instanceof n.Patch) {
          const a = s.ops, u = a.length;
          for (let l = 0; l < u; l++) {
            const c = a[l];
            if (e(c)) {
              const h = o.get(c.obj);
              h && r.add(h);
            }
          }
        }
      }
      return r;
    }
    /**
     * JSON CRDT nodes which are parents of directly affected nodes in this
     * change event.
     */
    parents() {
      let r = this._parents;
      if (!r) {
        this._parents = r = /* @__PURE__ */ new Set();
        const s = this.direct();
        for (const o of s) {
          let a = o.parent;
          for (; a && !r.has(a); )
            r.add(a), a = a.parent;
        }
      }
      return r;
    }
  }
  return hr.ChangeEvent = t, hr;
}
var os = {}, Ya;
function ld() {
  return Ya || (Ya = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.proxy$ = n.proxy = void 0;
    const e = (i, r = []) => new Proxy(() => {
    }, {
      get: (s, o, a) => (r.push(String(o)), (0, n.proxy)(i, r)),
      apply: (s, o, a) => i(r, ...a)
    });
    n.proxy = e;
    const t = (i, r, s = []) => new Proxy({}, { get: (o, a, u) => a === r ? i(s) : (s.push(String(a)), (0, n.proxy$)(i, r, s)) });
    n.proxy$ = t;
  })(os)), os;
}
var Qa;
function hd() {
  if (Qa) return pe;
  Qa = 1, Object.defineProperty(pe, "__esModule", { value: !0 }), pe.ModelApi = pe.ArrApi = pe.BinApi = pe.StrApi = pe.ObjApi = pe.VecApi = pe.ValApi = pe.ConApi = pe.NodeApi = void 0;
  const n = re, e = je(), t = qu(), i = Qs(), r = Qh(), s = kt(), o = $h(), a = Uu(), u = Xs(), l = Fu(), c = ed(), h = Zu(), y = n.__importStar(cd()), p = ud(), m = le(), k = ld(), b = (E) => {
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
    constructor(O, I) {
      this.node = O, this.api = I, this.ev = void 0;
    }
    /**
     * Find a child node at the given path starting from this node.
     *
     * @param path Path to the child node to find.
     * @returns JSON CRDT node at the given path.
     */
    find(O) {
      let I = this.node;
      if (O === void 0) {
        if (typeof I.child == "function") {
          const j = I.child();
          if (!j) {
            if (I instanceof s.RootNode)
              return I;
            throw new Error("NO_CHILD");
          }
          return j;
        }
        throw new Error("CANNOT_IN");
      }
      for (typeof O == "string" && O && O[0] !== "/" && (O = "/" + O), typeof O == "number" && (O = [O]); I instanceof s.ValNode; )
        I = I.child();
      return (0, r.find)(I, O);
    }
    /**
     * Find a child node at the given path starting from this node and wrap it in
     * a local changes API.
     *
     * @param path Path to the child node to find.
     * @returns Local changes API for the child node at the given path.
     */
    in(O) {
      const I = this.find(O);
      return this.api.wrap(I);
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
      let I;
      const j = this.node;
      if (j instanceof c.ExtNode && (I = j), j instanceof s.VecNode && (I = j.ext()), !I)
        throw new Error("NOT_EXT");
      const P = this.api.wrap(I);
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
    select(O, I) {
      try {
        let j = O !== void 0 ? this.find(O) : this.node;
        if (I)
          for (; j instanceof s.ValNode; )
            j = j.child();
        return this.api.wrap(j);
      } catch {
        return;
      }
    }
    read(O) {
      const I = this.view();
      if (Array.isArray(O))
        return (0, t.get)(I, O);
      if (!O)
        return I;
      let j = O + "";
      return O && j[0] !== "/" && (j = "/" + j), (0, t.get)(I, (0, i.toPath)(j));
    }
    add(O, I) {
      const [j, P] = b(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v)
          R.set({ [P]: I });
        else if (R instanceof N || R instanceof w || R instanceof x) {
          const B = R.length();
          let L = 0;
          if (typeof P == "number")
            L = P;
          else if (P === "-")
            L = B;
          else if (L = ~~P, L + "" !== P)
            break e;
          if (L !== L)
            break e;
          if (L < 0 && (L = 0), L > B && (L = B), R instanceof N)
            R.ins(L, Array.isArray(I) ? I : [I]);
          else if (R instanceof w)
            R.ins(L, I + "");
          else if (R instanceof x) {
            if (!(I instanceof Uint8Array))
              break e;
            R.ins(L, I);
          }
        } else if (R instanceof g)
          R.set([[~~P, I]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    replace(O, I) {
      const [j, P] = b(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v) {
          const B = P + "";
          if (!R.has(B))
            break e;
          R.set({ [P]: I });
        } else if (R instanceof N) {
          const B = R.length();
          let L = 0;
          if (typeof P == "number")
            L = P;
          else if (L = ~~P, L + "" !== P)
            break e;
          if (L !== L || L < 0 || L > B)
            break e;
          L === B ? R.ins(L, [I]) : R.upd(L, I);
        } else if (R instanceof g)
          R.set([[~~P, I]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    remove(O, I = 1) {
      const [j, P] = b(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v) {
          const B = P + "";
          if (!R.has(B))
            break e;
          R.del([B]);
        } else if (R instanceof N || R instanceof w || R instanceof x) {
          const B = R.length();
          let L = 0;
          if (typeof P == "number")
            L = P;
          else if (P === "-")
            L = I;
          else if (L = ~~P, L + "" !== P)
            break e;
          if (L !== L || L < 0 || L > B)
            break e;
          R.del(L, Math.min(I, B - L));
        } else if (R instanceof g)
          R.set([[~~P, void 0]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    diff(O) {
      return y.diff(this, O);
    }
    merge(O) {
      return y.merge(this, O);
    }
    op(O) {
      var R;
      if (!Array.isArray(O))
        return !1;
      const [I, j, P] = O;
      switch (I) {
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
    onSelfChange(O, I) {
      return this.api.onChange.listen((j) => {
        (j.direct().has(this.node) || I && j.isReset()) && O(j);
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
    onChildChange(O, I) {
      return this.api.onChange.listen((j) => {
        (j.parents().has(this.node) || I && j.isReset()) && O(j);
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
    onSubtreeChange(O, I) {
      return this.api.onChange.listen((j) => {
        const P = this.node;
        (j.direct().has(P) || j.parents().has(P) || I && j.isReset()) && O(j);
      });
    }
    // -------------------------------------------------------------------- Debug
    toString(O = "") {
      return "api(" + (this.constructor === _ ? "*" : this.node.name()) + ")" + (0, e.printTree)(O, [(j) => this.node.toString(j)]);
    }
  }
  pe.NodeApi = _;
  class f extends _ {
    /**
     * Returns a proxy object for this node.
     */
    get s() {
      return { $: this };
    }
  }
  pe.ConApi = f;
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
      const { api: I, node: j } = this, R = I.builder.constOrJson(O);
      I.builder.setVal(j.id, R), I.apply();
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
  pe.ValApi = d;
  class g extends _ {
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
      const { api: I, node: j } = this, { builder: P } = I;
      P.insVec(j.id, O.map(([R, B]) => [R, P.constOrJson(B)])), I.apply();
    }
    push(...O) {
      const I = this.length();
      this.set(O.map((j, P) => [I + P, j]));
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
        get: (I, j, P) => {
          if (j === "$")
            return this;
          if (j === "toExt")
            return () => this.asExt();
          const R = Number(j);
          if (Number.isNaN(R))
            throw new Error("INVALID_INDEX");
          const B = this.node.get(R);
          if (!B)
            throw new Error("OUT_OF_BOUNDS");
          return this.api.wrap(B).s;
        }
      });
    }
  }
  pe.VecApi = g;
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
      const { api: I, node: j } = this, { builder: P } = I;
      P.insObj(j.id, Object.entries(O).map(([R, B]) => [R, P.constOrJson(B)])), I.apply();
    }
    /**
     * Deletes a list of keys from the object.
     *
     * @param keys List of keys to delete.
     * @returns Reference to itself.
     */
    del(O) {
      const { api: I, node: j } = this, { builder: P } = I;
      I.builder.insObj(j.id, O.map((R) => [R, P.con(void 0)])), I.apply();
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
      const I = this.diffKeys(O);
      return I && this.api.model.applyLocalPatch(I), I;
    }
    /**
     * Returns a proxy object for this node. Allows to access object properties
     * by key.
     */
    get s() {
      return new Proxy({}, {
        get: (I, j, P) => {
          if (j === "$")
            return this;
          const R = String(j), B = this.node.get(R);
          if (!B)
            throw new Error("NO_SUCH_KEY");
          return this.api.wrap(B).s;
        }
      });
    }
  }
  pe.ObjApi = v;
  class w extends _ {
    /**
     * Inserts text at a given position.
     *
     * @param index Position at which to insert text.
     * @param text Text to insert.
     * @returns Reference to itself.
     */
    ins(O, I) {
      const { api: j, node: P } = this;
      j.onBeforeLocalChange.emit(j.next);
      const R = j.builder;
      R.pad();
      const B = j.builder.nextTime(), L = new m.Timestamp(R.clock.sid, B), Z = P.insAt(O, L, I);
      if (!Z)
        throw new Error("OUT_OF_BOUNDS");
      R.insStr(P.id, Z, I), j.advance();
    }
    /**
     * Deletes a range of text at a given position.
     *
     * @param index Position at which to delete text.
     * @param length Number of UTF-16 code units to delete.
     * @returns Reference to itself.
     */
    del(O, I) {
      const { api: j, node: P } = this;
      j.onBeforeLocalChange.emit(j.next);
      const R = j.builder;
      R.pad();
      const B = P.findInterval(O, I);
      if (!B)
        throw new Error("OUT_OF_BOUNDS");
      P.delete(B), R.del(P.id, B), j.advance();
    }
    /**
     * Given a character index in local coordinates, find the ID of the character
     * in the global coordinates.
     *
     * @param index Index of the character or `-1` for before the first character.
     * @returns ID of the character after which the given position is located.
     */
    findId(O) {
      const I = this.node, P = I.length() - 1;
      return O > P && (O = P), O < 0 ? I.id : I.find(O) || I.id;
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
      const I = this.node, j = I.id;
      if (j.sid === O.sid && j.time === O.time)
        return -1;
      const P = I.findById(O);
      return P ? I.pos(P) + (P.del ? 0 : O.time - P.id.time) : -1;
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
  pe.StrApi = w;
  class x extends _ {
    /**
     * Inserts octets at a given position.
     *
     * @param index Position at which to insert octets.
     * @param data Octets to insert.
     * @returns Reference to itself.
     */
    ins(O, I) {
      const { api: j, node: P } = this, R = O ? P.find(O - 1) : P.id;
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      j.builder.insBin(P.id, R, I), j.apply();
    }
    /**
     * Deletes a range of octets at a given position.
     *
     * @param index Position at which to delete octets.
     * @param length Number of octets to delete.
     * @returns Reference to itself.
     */
    del(O, I) {
      const { api: j, node: P } = this, R = P.findInterval(O, I);
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
  pe.BinApi = x;
  class N extends _ {
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
    ins(O, I) {
      const { api: j, node: P } = this, { builder: R } = j, B = O ? P.find(O - 1) : P.id;
      if (!B)
        throw new Error("OUT_OF_BOUNDS");
      const L = [];
      for (let Z = 0; Z < I.length; Z++)
        L.push(R.json(I[Z]));
      R.insArr(P.id, B, L), j.apply();
    }
    /**
     * Inserts elements at the end of the array.
     *
     * @param values Values or schema of the elements to insert at the end of the array.
     */
    push(...O) {
      const I = this.length();
      this.ins(I, O);
    }
    /**
     * Updates (overwrites) an element at a given position.
     *
     * @param index Position at which to update the element.
     * @param value Value or schema of the element to replace with.
     */
    upd(O, I) {
      const { api: j, node: P } = this, R = P.getId(O);
      if (!R)
        throw new Error("OUT_OF_BOUNDS");
      const { builder: B } = j;
      B.updArr(P.id, R, B.constOrJson(I)), j.apply();
    }
    /**
     * Deletes a range of elements at a given position.
     *
     * @param index Position at which to delete elements.
     * @param length Number of elements to delete.
     * @returns Reference to itself.
     */
    del(O, I) {
      const { api: j, node: P } = this, R = P.findInterval(O, I);
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
        get: (I, j, P) => {
          if (j === "$")
            return this;
          const R = Number(j);
          if (Number.isNaN(R))
            throw new Error("INVALID_INDEX");
          const B = this.node.getNode(R);
          if (!B)
            throw new Error("OUT_OF_BOUNDS");
          return this.api.wrap(B).s;
        }
      });
    }
  }
  pe.ArrApi = N;
  class C extends d {
    /**
     * @param model Model instance on which the API operates.
     */
    constructor(O) {
      super(O.root, void 0), this.model = O, this.next = 0, this.onBeforeReset = new a.FanOut(), this.onReset = new a.FanOut(), this.onBeforePatch = new a.FanOut(), this.onPatch = new a.FanOut(), this.onBeforeLocalChange = new a.FanOut(), this.onLocalChange = new a.FanOut(), this.onLocalChanges = new l.MicrotaskBufferFanOut(this.onLocalChange), this.onBeforeTransaction = new a.FanOut(), this.onTransaction = new a.FanOut(), this.onChange = new l.MergeFanOut([this.onReset, this.onPatch, this.onLocalChange], (I) => new p.ChangeEvent(I, this)), this.onChanges = new l.MicrotaskBufferFanOut(this.onChange), this.onFlush = new a.FanOut(), this.inTx = !1, this.stopAutoFlush = void 0, this.subscribe = (I) => this.onChanges.listen(() => I()), this.getSnapshot = () => this.view(), this.api = this, this.builder = new u.PatchBuilder(O.clock), O.onbeforereset = () => this.onBeforeReset.emit(), O.onreset = (I) => this.onReset.emit(I), O.onbeforepatch = (I) => this.onBeforePatch.emit(I), O.onpatch = (I) => this.onPatch.emit(I);
    }
    wrap(O) {
      if (O instanceof s.ValNode)
        return O.api || (O.api = new d(O, this));
      if (O instanceof s.StrNode)
        return O.api || (O.api = new w(O, this));
      if (O instanceof s.BinNode)
        return O.api || (O.api = new x(O, this));
      if (O instanceof s.ArrNode)
        return O.api || (O.api = new N(O, this));
      if (O instanceof s.ObjNode)
        return O.api || (O.api = new v(O, this));
      if (O instanceof s.ConNode)
        return O.api || (O.api = new f(O, this));
      if (O instanceof s.VecNode)
        return O.api || (O.api = new g(O, this));
      if (O instanceof c.ExtNode) {
        if (O.api)
          return O.api;
        const I = this.model.ext.get(O.extId);
        return O.api = new I.Api(O, this);
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
      const O = this.builder.patch.ops, I = O.length, j = this.model, P = this.next;
      this.onBeforeLocalChange.emit(P);
      for (let R = this.next; R < I; R++)
        j.applyOperation(O[R]);
      this.next = I, j.tick++, this.onLocalChange.emit(P);
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
      const I = () => this.builder.patch.ops.length && this.flush(), j = this.onLocalChanges.listen(I), P = this.onBeforeTransaction.listen(I), R = this.onTransaction.listen(I);
      return O && I(), this.stopAutoFlush = () => {
        this.stopAutoFlush = void 0, j(), P(), R();
      };
    }
  }
  return pe.ModelApi = C, pe;
}
var $a;
function Hu() {
  return $a || ($a = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(hd(), n);
  })(Zi)), Zi;
}
var dr = {}, ec;
function dd() {
  if (ec) return dr;
  ec = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.randomSessionId = void 0;
  const n = 65535, e = 9007199254740991 - n, t = () => Math.floor(e * Math.random() + n);
  return dr.randomSessionId = t, dr;
}
var fr = {}, tc;
function fd() {
  if (tc) return fr;
  tc = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.Extensions = void 0;
  const n = je();
  let e = class Ju {
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
      const i = new Ju();
      for (const r of Object.values(this.ext))
        i.register(r);
      return i;
    }
    toString(i = "") {
      const r = Object.keys(this.ext).map((s) => +s).sort();
      return "extensions" + (0, n.printTree)(i, r.map((s) => (o) => `${s}: ${this.ext[s].name}`));
    }
  };
  return fr.Extensions = e, fr;
}
var It = {}, as = {}, cs = {}, nc;
function pd() {
  return nc || (nc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(bi(), n);
  })(cs)), cs;
}
var rc;
function gd() {
  return rc || (rc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.print = n.remove = n.insert = n.insertLeft = n.insertRight = void 0;
    const e = pd(), t = JSON.stringify, i = (k, b, _) => {
      const f = b.p;
      if (!f)
        return k;
      const d = b === f.l;
      let g = f.bf | 0;
      switch (d ? f.bf = ++g : f.bf = --g, g) {
        case 0:
          return k;
        case 1:
        case -1:
          return i(k, f, b);
        default: {
          const v = _ === b.l;
          return d ? v ? (r(f, b), b.p ? k : b) : (o(f, b, _), _.p ? k : _) : v ? (a(f, b, _), _.p ? k : _) : (s(f, b), b.p ? k : b);
        }
      }
    }, r = (k, b) => {
      const _ = k.p, f = b.r;
      b.p = _, b.r = k, k.p = b, k.l = f, f && (f.p = k), _ && (_.l === k ? _.l = b : _.r = b);
      let d = k.bf, g = b.bf;
      d += -1 - (g > 0 ? g : 0), g += -1 + (d < 0 ? d : 0), k.bf = d, b.bf = g;
    }, s = (k, b) => {
      const _ = k.p, f = b.l;
      b.p = _, b.l = k, k.p = b, k.r = f, f && (f.p = k), _ && (_.l === k ? _.l = b : _.r = b);
      let d = k.bf, g = b.bf;
      d += 1 - (g < 0 ? g : 0), g += 1 + (d > 0 ? d : 0), k.bf = d, b.bf = g;
    }, o = (k, b, _) => {
      s(b, _), r(k, _);
    }, a = (k, b, _) => {
      r(b, _), s(k, _);
    }, u = (k, b, _) => (_.r = b, b.p = _, _.bf--, _.l ? k : i(k, _, b));
    n.insertRight = u;
    const l = (k, b, _) => (_.l = b, b.p = _, _.bf++, _.r ? k : i(k, _, b));
    n.insertLeft = l;
    const c = (k, b, _) => {
      if (!k)
        return b;
      const f = b.k;
      let d = k, g, v = 0;
      for (; g = (v = _(f, d.k)) < 0 ? d.l : d.r; )
        d = g;
      return v < 0 ? (0, n.insertLeft)(k, b, d) : (0, n.insertRight)(k, b, d);
    };
    n.insert = c;
    const h = (k, b) => {
      if (!k)
        return b;
      const _ = b.p, f = b.l, d = b.r;
      if (b.p = b.l = b.r = void 0, f && d)
        if (f.r) {
          let w = f, x = w;
          for (; x = w.r; )
            w = x;
          const N = w.l, C = w.p, E = N;
          return _ && (_.l === b ? _.l = w : _.r = w), w.p = _, w.r = d, w.bf = b.bf, f !== w && (w.l = f, f.p = w), d.p = w, C && (C.l === w ? C.l = E : C.r = E), E && (E.p = C), p(_ ? k : w, C, 1);
        } else {
          _ && (_.l === b ? _.l = f : _.r = f), f.p = _, f.r = d, d.p = f;
          const w = b.bf;
          if (_)
            return f.bf = w, y(k, f, 1);
          const x = w - 1;
          if (f.bf = x, x >= -1)
            return f;
          const N = d.l;
          return d.bf > 0 ? (a(f, d, N), N) : (s(f, d), d);
        }
      const g = f || d;
      return g && (g.p = _), _ ? _.l === b ? (_.l = g, y(k, _, 1)) : (_.r = g, p(k, _, 1)) : g;
    };
    n.remove = h;
    const y = (k, b, _) => {
      let f = b.bf | 0;
      f -= _, b.bf = f;
      let d = _;
      if (f === -1)
        return k;
      if (f < -1) {
        const v = b.r;
        if (v.bf <= 0)
          v.l && v.bf === 0 && (d = 0), s(b, v), b = v;
        else {
          const w = v.l;
          a(b, v, w), b = w;
        }
      }
      const g = b.p;
      return g ? g.l === b ? y(k, g, d) : p(k, g, d) : b;
    }, p = (k, b, _) => {
      let f = b.bf | 0;
      f += _, b.bf = f;
      let d = _;
      if (f === 1)
        return k;
      if (f > 1) {
        const v = b.l;
        if (v.bf >= 0)
          v.r && v.bf === 0 && (d = 0), r(b, v), b = v;
        else {
          const w = v.r;
          o(b, v, w), b = w;
        }
      }
      const g = b.p;
      return g ? g.l === b ? y(k, g, d) : p(k, g, d) : b;
    }, m = (k, b = "") => {
      if (!k)
        return "∅";
      const { bf: _, l: f, r: d, k: g, v } = k, w = v && typeof v == "object" && v.constructor === Object ? t(v) : v && typeof v == "object" ? v.toString(b) : t(v), x = g !== void 0 ? ` { ${t(g)} = ${w} }` : "", N = _ ? ` [${_}]` : "";
      return k.constructor.name + `${N}` + x + (0, e.printBinary)(b, [f ? (C) => (0, n.print)(f, C) : null, d ? (C) => (0, n.print)(d, C) : null]);
    };
    n.print = m;
  })(as)), as;
}
var pr = {}, us = {}, gr = {}, ic;
function Ku() {
  if (ic) return gr;
  ic = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.first = void 0;
  const n = (e) => {
    let t = e;
    for (; t; )
      if (t.l)
        t = t.l;
      else
        return t;
    return t;
  };
  return gr.first = n, gr;
}
var yr = {}, sc;
function yd() {
  if (sc) return yr;
  sc = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.next = void 0;
  const n = Ku(), e = (t) => {
    const i = t.r;
    if (i)
      return (0, n.first)(i);
    let r = t.p;
    for (; r && r.r === t; )
      t = r, r = r.p;
    return r;
  };
  return yr.next = e, yr;
}
var oc;
function Wu() {
  return oc || (oc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.remove = n.insert = n.insertLeft = n.insertRight = n.findOrNextLower = n.find = n.size = n.prev = n.last = n.next = n.first = void 0;
    const e = Ku();
    Object.defineProperty(n, "first", { enumerable: !0, get: function() {
      return e.first;
    } });
    const t = yd();
    Object.defineProperty(n, "next", { enumerable: !0, get: function() {
      return t.next;
    } });
    const i = (p) => {
      let m = p;
      for (; m; )
        if (m.r)
          m = m.r;
        else
          return m;
      return m;
    };
    n.last = i;
    const r = (p) => {
      if (p.l) {
        for (p = p.l; p.r; )
          p = p.r;
        return p;
      }
      let m = p.p;
      for (; m && m.l === p; )
        p = m, m = m.p;
      return m;
    };
    n.prev = r;
    const s = (p) => {
      const m = p.l, k = p.r;
      return 1 + (m ? s(m) : 0) + (k ? s(k) : 0);
    }, o = (p) => p ? s(p) : 0;
    n.size = o;
    const a = (p, m, k) => {
      let b = p;
      for (; b; ) {
        const _ = k(m, b.k);
        if (_ === 0)
          return b;
        b = _ < 0 ? b.l : b.r;
      }
      return b;
    };
    n.find = a;
    const u = (p, m, k) => {
      let b = p, _;
      for (; b; ) {
        const f = k(b.k, m);
        if (f === 0)
          return b;
        if (f > 0)
          b = b.l;
        else {
          const d = b.r;
          if (_ = b, !d)
            return _;
          b = d;
        }
      }
      return _;
    };
    n.findOrNextLower = u;
    const l = (p, m) => {
      const k = p.r = m.r;
      m.r = p, p.p = m, k && (k.p = p);
    };
    n.insertRight = l;
    const c = (p, m) => {
      const k = p.l = m.l;
      m.l = p, p.p = m, k && (k.p = p);
    };
    n.insertLeft = c;
    const h = (p, m, k) => {
      if (!p)
        return m;
      const b = m.k;
      let _ = p;
      for (; _; ) {
        const f = k(b, _.k), d = f < 0 ? _.l : _.r;
        if (d)
          _ = d;
        else {
          f < 0 ? (0, n.insertLeft)(m, _) : (0, n.insertRight)(m, _);
          break;
        }
      }
      return p;
    };
    n.insert = h;
    const y = (p, m) => {
      const k = m.p, b = m.l, _ = m.r;
      if (m.p = m.l = m.r = void 0, !b && !_) {
        if (k)
          k.l === m ? k.l = void 0 : k.r = void 0;
        else return;
        return p;
      } else if (b && _) {
        let d = b;
        for (; d.r; )
          d = d.r;
        return d.r = _, _.p = d, k ? (k.l === m ? k.l = b : k.r = b, b.p = k, p) : (b.p = void 0, b);
      }
      const f = b || _;
      if (f.p = k, k)
        k.l === m ? k.l = f : k.r = f;
      else return f;
      return p;
    };
    n.remove = y;
  })(us)), us;
}
var ls = {}, ac;
function vd() {
  return ac || (ac = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(je(), n);
  })(ls)), ls;
}
var cc;
function bd() {
  if (cc) return pr;
  cc = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.createMap = void 0;
  const n = Wu(), e = vd(), t = (r, s) => r === s ? 0 : r < s ? -1 : 1, i = (r, s, o, a, u, l) => {
    class c {
      constructor(y) {
        this.min = void 0, this.root = void 0, this.max = void 0, this._size = 0, this.next = n.next, this.comparator = y || t;
      }
      set(y, p) {
        const m = this.root;
        if (m === void 0) {
          this._size = 1;
          const g = new r(y, p);
          return this.root = this.min = this.max = s(void 0, g, this.comparator);
        }
        const k = this.comparator;
        let b;
        const _ = this.max;
        if (b = k(y, _.k), b === 0)
          return _.v = p, _;
        if (b > 0) {
          const g = this.max = new r(y, p);
          return this.root = a(m, g, _), this._size++, g;
        }
        const f = this.min;
        if (b = k(y, f.k), b === 0)
          return f.v = p, f;
        if (b < 0) {
          const g = this.min = new r(y, p);
          return this.root = o(m, g, f), this._size++, g;
        }
        let d = m;
        do {
          if (b = k(y, d.k), b === 0)
            return d.v = p, d;
          if (b > 0) {
            const g = d.r;
            if (g === void 0) {
              const v = new r(y, p);
              return this.root = a(m, v, d), this._size++, v;
            }
            d = g;
          } else if (b < 0) {
            const g = d.l;
            if (g === void 0) {
              const v = new r(y, p);
              return this.root = o(m, v, d), this._size++, v;
            }
            d = g;
          }
        } while (!0);
      }
      find(y) {
        const p = this.comparator;
        let m = this.root;
        for (; m; ) {
          const k = +p(y, m.k);
          if (k === 0)
            return m;
          m = k < 0 ? m.l : m.r;
        }
      }
      get(y) {
        var p;
        return (p = this.find(y)) == null ? void 0 : p.v;
      }
      del(y) {
        const p = this.find(y);
        return p ? (p === this.max && (this.max = (0, n.prev)(p)), p === this.min && (this.min = (0, n.next)(p)), this.root = u(this.root, p), this._size--, !0) : !1;
      }
      clear() {
        this._size = 0, this.root = this.min = this.max = void 0;
      }
      has(y) {
        return !!this.find(y);
      }
      size() {
        return this._size;
      }
      isEmpty() {
        return !this.min;
      }
      getOrNextLower(y) {
        return (0, n.findOrNextLower)(this.root, y, this.comparator) || void 0;
      }
      forEach(y) {
        let p = this.first();
        if (p)
          do
            y(p);
          while (p = (0, n.next)(p));
      }
      first() {
        return this.min;
      }
      last() {
        return this.max;
      }
      iterator0() {
        let y = this.first();
        return () => {
          if (!y)
            return;
          const p = y;
          return y = (0, n.next)(y), p;
        };
      }
      iterator() {
        const y = this.iterator0();
        return {
          next: () => {
            const p = y();
            return { value: p, done: !p };
          }
        };
      }
      entries() {
        return { [Symbol.iterator]: () => this.iterator() };
      }
      toString(y) {
        return this.constructor.name + (0, e.printTree)(y, [(p) => l(this.root, p)]);
      }
    }
    return c;
  };
  return pr.createMap = i, pr;
}
var uc;
function md() {
  if (uc) return It;
  uc = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.AvlMap = It.AvlNode = void 0;
  const n = gd(), e = bd();
  class t {
    constructor(r, s) {
      this.k = r, this.v = s, this.p = void 0, this.l = void 0, this.r = void 0, this.bf = 0;
    }
  }
  return It.AvlNode = t, It.AvlMap = (0, e.createMap)(t, n.insert, n.insertLeft, n.insertRight, n.remove, n.print), It;
}
var vr = {}, we = {}, lc;
function Gu() {
  if (lc) return we;
  lc = 1, Object.defineProperty(we, "__esModule", { value: !0 }), we.remove2 = we.insert2 = we.prev2 = we.next2 = we.last2 = we.first2 = void 0;
  const n = (u) => {
    let l = u;
    for (; l; )
      if (l.l2)
        l = l.l2;
      else
        return l;
    return l;
  };
  we.first2 = n;
  const e = (u) => {
    let l = u;
    for (; l; )
      if (l.r2)
        l = l.r2;
      else
        return l;
    return l;
  };
  we.last2 = e;
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
  we.next2 = t;
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
  we.prev2 = i;
  const r = (u, l) => {
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
      const y = c(l, h), p = y < 0 ? h.l2 : h.r2;
      if (p)
        h = p;
      else {
        y < 0 ? s(l, h) : r(l, h);
        break;
      }
    }
    return u;
  };
  we.insert2 = o;
  const a = (u, l) => {
    const c = l.p2, h = l.l2, y = l.r2;
    if (l.p2 = l.l2 = l.r2 = void 0, !h && !y) {
      if (c)
        c.l2 === l ? c.l2 = void 0 : c.r2 = void 0;
      else return;
      return u;
    } else if (h && y) {
      let m = h;
      for (; m.r2; )
        m = m.r2;
      return m.r2 = y, y.p2 = m, c ? (c.l2 === l ? c.l2 = h : c.r2 = h, h.p2 = c, u) : (h.p2 = void 0, h);
    }
    const p = h || y;
    if (p.p2 = c, c)
      c.l2 === l ? c.l2 = p : c.r2 = p;
    else return p;
    return u;
  };
  return we.remove2 = a, we;
}
var hc;
function wd() {
  if (hc) return vr;
  hc = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.cmpNode = void 0;
  const n = kt(), e = _t(), t = Gu(), i = (s, o) => {
    const a = (0, t.last2)(s.ids), u = (0, t.last2)(o.ids);
    return a && u && !(0, e.equal)(a.id, u.id) ? !1 : s.length() === o.length() && s.size() === o.size();
  }, r = (s, o) => {
    if (s === o)
      return !0;
    if (s instanceof n.ConNode)
      return o instanceof n.ConNode && (0, e.equal)(s.id, o.id);
    if (s instanceof n.ValNode)
      return o instanceof n.ValNode && (0, e.equal)(s.id, o.id) && (0, e.equal)(s.val, o.val);
    if (s instanceof n.StrNode)
      return !(o instanceof n.StrNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
    if (s instanceof n.ObjNode) {
      if (!(o instanceof n.ObjNode) || !(0, e.equal)(s.id, o.id))
        return !1;
      const a = s.keys, u = o.keys, l = a.size, c = u.size;
      if (l !== c)
        return !1;
      for (const h of a.keys()) {
        const y = a.get(h), p = u.get(h);
        if (!y || !p || !(0, e.equal)(y, p))
          return !1;
      }
      return !0;
    } else {
      if (s instanceof n.ArrNode)
        return !(o instanceof n.ArrNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
      if (s instanceof n.VecNode) {
        if (!(o instanceof n.VecNode) || !(0, e.equal)(s.id, o.id))
          return !1;
        const a = s.elements, u = o.elements, l = a.length;
        if (l !== u.length)
          return !1;
        for (let c = 0; c < l; c++) {
          const h = a[c], y = u[c];
          if (h) {
            if (!y || !(0, e.equal)(h, y))
              return !1;
          } else if (y)
            return !1;
        }
        return !0;
      } else if (s instanceof n.BinNode)
        return !(o instanceof n.BinNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
    }
    return !1;
  };
  return vr.cmpNode = r, vr;
}
var dc;
function to() {
  if (dc) return xt;
  dc = 1, Object.defineProperty(xt, "__esModule", { value: !0 }), xt.Model = xt.UNDEFINED = void 0;
  const n = re, e = n.__importStar(Gr()), t = n.__importStar(le()), i = Hh(), r = Hu(), s = vi(), o = dd(), a = kt(), u = wi(), l = je(), c = fd(), h = md(), y = _t(), p = wd();
  xt.UNDEFINED = new u.ConNode(s.ORIGIN, void 0);
  let m = class Ns {
    /**
     * Use this method to generate a random session ID for an existing document.
     * It checks for the uniqueness of the session ID given the current peers in
     * the document. This reduces the chance of collision substantially.
     *
     * @returns A random session ID that is not used by any peer in the current
     *     document.
     */
    rndSid() {
      const b = this.clock, _ = b.sid, f = b.peers;
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
    static fromPatches(b) {
      if (!b.length)
        throw new Error("NO_PATCHES");
      const d = b[0].getId().sid;
      if (!d)
        throw new Error("NO_SID");
      const g = Ns.create(void 0, d);
      return g.applyBatch(b), g;
    }
    constructor(b) {
      this.root = new a.RootNode(this, s.ORIGIN), this.index = new h.AvlMap(t.compare), this.ext = new c.Extensions(), this.tick = 0, this.onbeforepatch = void 0, this.onpatch = void 0, this.onbeforereset = void 0, this.onreset = void 0, this.clock = b, b.time || (b.time = 1);
    }
    /**
     * API for applying local changes to the current document.
     */
    get api() {
      return this._api || (this._api = new r.ModelApi(this)), this._api;
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
    applyBatch(b) {
      const _ = b.length;
      for (let f = 0; f < _; f++)
        this.applyPatch(b[f]);
    }
    /**
     * Works like `applyPatch`, but is intended to be used by the local client
     * for locally generated patches. It checks if the model clock is ahead of
     * the patch clock and rebases the patch if necessary.
     *
     * @param patch A patch to apply to the document.
     */
    applyLocalPatch(b) {
      const _ = b.getId();
      if (_) {
        const f = this.clock;
        if (f.sid === _.sid) {
          const d = f.time;
          d > _.time && (b = b.rebase(d));
        }
      }
      this.applyPatch(b);
    }
    /**
     * Applies a single patch to the document. All mutations to the model must go
     * through this method. (With the only exception of local changes through API,
     * which have an alternative path.)
     *
     * @param patch A patch to apply to the document.
     */
    applyPatch(b) {
      var d, g;
      (d = this.onbeforepatch) == null || d.call(this, b);
      const _ = b.ops, { length: f } = _;
      for (let v = 0; v < f; v++)
        this.applyOperation(_[v]);
      this.tick++, (g = this.onpatch) == null || g.call(this, b);
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
    applyOperation(b) {
      this.clock.observe(b.id, b.span());
      const _ = this.index;
      if (b instanceof e.InsStrOp) {
        const f = _.get(b.obj);
        f instanceof a.StrNode && f.ins(b.ref, b.id, b.data);
      } else if (b instanceof e.NewObjOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.ObjNode(this, f));
      } else if (b instanceof e.NewArrOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.ArrNode(this, f));
      } else if (b instanceof e.NewStrOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.StrNode(f));
      } else if (b instanceof e.NewValOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.ValNode(this, f, s.ORIGIN));
      } else if (b instanceof e.NewConOp) {
        const f = b.id;
        _.get(f) || _.set(f, new u.ConNode(f, b.val));
      } else if (b instanceof e.InsObjOp) {
        const f = _.get(b.obj), d = b.data, g = d.length;
        if (f instanceof a.ObjNode)
          for (let v = 0; v < g; v++) {
            const w = d[v], x = _.get(w[1]);
            if (!x || f.id.time >= w[1].time)
              continue;
            x.parent = f;
            const N = f.put(w[0] + "", x.id);
            N && this._gcTree(N);
          }
      } else if (b instanceof e.InsVecOp) {
        const f = _.get(b.obj), d = b.data, g = d.length;
        if (f instanceof a.VecNode)
          for (let v = 0; v < g; v++) {
            const w = d[v], x = _.get(w[1]);
            if (!x || f.id.time >= w[1].time)
              continue;
            x.parent = f;
            const N = f.put(Number(w[0]), x.id);
            N && this._gcTree(N);
          }
      } else if (b instanceof e.InsValOp) {
        const f = b.obj, d = f.sid === 0 && f.time === 0 ? this.root : _.get(f);
        if (d instanceof a.ValNode) {
          const g = _.get(b.val);
          if (g) {
            g.parent = d;
            const v = d.set(b.val);
            v && this._gcTree(v);
          }
        }
      } else if (b instanceof e.InsArrOp) {
        const f = _.get(b.obj);
        if (f instanceof a.ArrNode) {
          const d = [], g = b.data, v = g.length;
          for (let w = 0; w < v; w++) {
            const x = g[w], N = _.get(x);
            N && (f.id.time >= x.time || (d.push(x), N.parent = f));
          }
          d.length && f.ins(b.ref, b.id, d);
        }
      } else if (b instanceof e.UpdArrOp) {
        const f = _.get(b.obj);
        if (f instanceof a.ArrNode) {
          const d = b.val, g = _.get(d);
          if (g) {
            g.parent = f;
            const v = f.upd(b.ref, d);
            v && this._gcTree(v);
          }
        }
      } else if (b instanceof e.DelOp) {
        const f = _.get(b.obj);
        if (f instanceof a.ArrNode) {
          const d = b.what.length;
          for (let g = 0; g < d; g++) {
            const v = b.what[g];
            for (let w = 0; w < v.span; w++) {
              const x = f.getById(new t.Timestamp(v.sid, v.time + w));
              x && this._gcTree(x);
            }
          }
          f.delete(b.what);
        } else (f instanceof a.StrNode || f instanceof a.BinNode) && f.delete(b.what);
      } else if (b instanceof e.NewBinOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.BinNode(f));
      } else if (b instanceof e.InsBinOp) {
        const f = _.get(b.obj);
        f instanceof a.BinNode && f.ins(b.ref, b.id, b.data);
      } else if (b instanceof e.NewVecOp) {
        const f = b.id;
        _.get(f) || _.set(f, new a.VecNode(this, f));
      }
    }
    /**
     * Recursively deletes a tree of nodes. Used when root node is overwritten or
     * when object contents of container node (object or array) is removed.
     *
     * @ignore
     */
    _gcTree(b) {
      if (b.sid === 0)
        return;
      const f = this.index.get(b);
      if (!f)
        return;
      f.parent = void 0;
      const d = f.api;
      d && d.events.handleDelete(), f.children((g) => this._gcTree(g.id)), this.index.del(b);
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
    fork(b = this.rndSid()) {
      const _ = this.clock instanceof t.ClockVector ? this.clock.fork(b) : this.clock.clone(), f = new Ns(_);
      f.ext = this.ext.clone();
      const d = this.index, g = f.index;
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
        g.set(w.id, w);
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
    reset(b) {
      var v, w;
      (v = this.onbeforereset) == null || v.call(this);
      const _ = this.index;
      this.index = new h.AvlMap(t.compare);
      const f = b.toBinary();
      i.decoder.decode(f, this), this.clock = b.clock.clone(), this.ext = b.ext.clone(), this.linkParents();
      const d = this._api;
      d && (d.flush(), d.builder.clock = this.clock, d.node = this.root);
      const g = /* @__PURE__ */ new Set();
      _.forEach(({ v: x }) => {
        const N = x.api;
        if (!N)
          return;
        const C = this.index.get(x.id);
        if (!C) {
          N.events.handleDelete();
          return;
        }
        N.node = C, C.api = N, x && C && !(0, p.cmpNode)(x, C) && g.add(C);
      }), this.tick++, (w = this.onreset) == null || w.call(this, g);
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
      const b = (f, d) => {
        d.parent = f, d.children((g) => b(d, g));
      }, _ = this.root;
      _.parent = void 0, _.children((f) => b(_, f));
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
    setSchema(b, _ = !0) {
      const f = this.clock;
      if (f.time === 1) {
        const g = f.sid;
        _ && (f.sid = 2), this.api.set(b), _ && this.setSid(g);
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
    setSid(b) {
      const _ = this.clock, f = _.sid;
      f !== b && (_.sid = b, _.observe(new t.Timestamp(f, _.time - 1), 1));
    }
    // ---------------------------------------------------------------- Printable
    toString(b = "") {
      const _ = () => "", f = this.ext.size() > 0;
      return "model" + (0, l.printTree)(b, [
        (d) => this.root.toString(d),
        _,
        (d) => {
          const g = [];
          return this.index.forEach((v) => g.push(v.v)), `index (${g.length} nodes)` + (g.length ? (0, l.printTree)(d, g.map((v) => (w) => `${v.name()} ${t.printTs(v.id)}`)) : "");
        },
        _,
        (d) => `view${(0, l.printTree)(d, [(g) => String(JSON.stringify(this.view(), null, 2)).replace(/\n/g, `
` + g)])}`,
        _,
        (d) => this.clock.toString(d),
        f ? _ : null,
        f ? (d) => this.ext.toString(d) : null
      ]);
    }
  };
  return xt.Model = m, m.sid = o.randomSessionId, m.create = (k, b = m.sid()) => {
    const _ = typeof b == "number" ? b === 1 ? new t.ServerClockVector(1, 1) : new t.ClockVector(b, 1) : b, f = new m(_);
    return k !== void 0 && f.setSchema(k instanceof y.NodeBuilder ? k : y.s.json(k), !0), f;
  }, m.withServerClock = (k, b = 1) => m.create(k, new t.ServerClockVector(1, b)), m.fromBinary = (k) => i.decoder.decode(k), m.load = (k, b, _) => {
    const f = i.decoder.decode(k);
    return _ && f.setSchema(_, !0), typeof b == "number" && f.setSid(b), f;
  }, xt;
}
var fc;
function Yu() {
  if (fc) return Yn;
  fc = 1, Object.defineProperty(Yn, "__esModule", { value: !0 }), Yn.ValNode = void 0;
  const n = le(), e = je(), t = to();
  let i = class Xu {
    constructor(s, o, a) {
      this.doc = s, this.id = o, this.val = a, this.api = void 0, this.parent = void 0;
    }
    /**
     * @ignore
     */
    set(s) {
      if ((0, n.compare)(s, this.val) <= 0 && this.val.sid !== 0 || (0, n.compare)(s, this.id) <= 0)
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
      return new Xu(s, this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      const o = this.node();
      return this.name() + " " + (0, n.printTs)(this.id) + (0, e.printTree)(s, [(u) => o ? o.toString(u) : (0, n.printTs)(this.val)]);
    }
  };
  return Yn.ValNode = i, Yn;
}
var br = {}, pc;
function _d() {
  if (pc) return br;
  pc = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.RootNode = void 0;
  const n = vi(), e = Yu();
  let t = class Qu extends e.ValNode {
    /**
     * @param val Latest value of the document root.
     */
    constructor(r, s) {
      super(r, n.ORIGIN, s);
    }
    name() {
      return "root";
    }
    /** @ignore */
    clone(r) {
      return new Qu(r, this.val);
    }
  };
  return br.RootNode = t, br;
}
var mr = {}, wr = {}, gc;
function kd() {
  if (gc) return wr;
  gc = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.CRDT_CONSTANTS = void 0;
  var n;
  return (function(e) {
    e[e.MAX_TUPLE_LENGTH = 255] = "MAX_TUPLE_LENGTH";
  })(n || (wr.CRDT_CONSTANTS = n = {})), wr;
}
var yc;
function Sd() {
  if (yc) return mr;
  yc = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.VecNode = void 0;
  const n = wi(), e = kd(), t = je(), i = le();
  let r = class $u {
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
      if (!(o instanceof n.ConNode))
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
        const y = l.get(h);
        y && o(y);
      }
    }
    /** @ignore */
    view() {
      const o = this.ext();
      if (o)
        return o.view();
      let a = !0;
      const u = this._view, l = [], c = this.doc.index, h = this.elements, y = h.length;
      for (let p = 0; p < y; p++) {
        const m = h[p], k = m ? c.get(m) : void 0, b = k ? k.view() : void 0;
        u[p] !== b && (a = !1), l.push(b);
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
      const a = new $u(o, this.id), u = this.elements, l = u.length;
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
        ...this.elements.map((c, h) => (y) => `${h}: ${c && l.get(c) ? l.get(c).toString(y + "  " + " ".repeat(("" + h).length)) : "nil"}`),
        ...a ? [(c) => `${this.child().toString(c)}`] : []
      ]);
    }
  };
  return mr.VecNode = r, mr;
}
var _r = {}, vc;
function xd() {
  if (vc) return _r;
  vc = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.ObjNode = void 0;
  const n = je(), e = le(), t = wi();
  let i = class el {
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
      return this.keys.forEach((h, y) => {
        const p = l.get(h);
        if (!p) {
          c = !1;
          return;
        }
        const m = p.view();
        m !== void 0 ? (a[y] !== m && (c = !1), u[y] = m) : a[y] !== void 0 && (c = !1);
      }), c ? a : (this._tick = o, this._view = u);
    }
    /** @ignore */
    clone(s) {
      const o = new el(s, this.id);
      return this.keys.forEach((a, u) => o.keys.set(u, a)), o;
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      return this.name() + " " + (0, e.printTs)(this.id) + (0, n.printTree)(s, [...this.keys.entries()].filter(([, a]) => !!this.doc.index.get(a)).map(([a, u]) => (l) => JSON.stringify(a) + (0, n.printTree)(l + " ", [(c) => this.doc.index.get(u).toString(c)])));
    }
  };
  return _r.ObjNode = i, _r;
}
var Tt = {}, kr = {}, Sr = {}, bc;
function Od() {
  if (bc) return Sr;
  bc = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.printOctets = void 0;
  const n = (e, t = 16) => {
    let i = "";
    if (!e.length)
      return i;
    e[0] < 16 && (i += "0"), i += e[0].toString(16);
    for (let r = 1; r < e.length && r < t; r++) {
      const s = e[r];
      i += " ", s < 16 && (i += "0"), i += s.toString(16);
    }
    return e.length > t && (i += `… (${e.length - t} more)`), i;
  };
  return Sr.printOctets = n, Sr;
}
var hs = {}, mc;
function Nd() {
  return mc || (mc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.rlSplay = n.lrSplay = n.llSplay = n.rrSplay = n.lSplay = n.rSplay = n.splay = void 0;
    const e = (u, l, c) => {
      const h = l.p;
      if (!h)
        return u;
      const y = h.p, p = h.l === l;
      return y ? (y.l === h ? p ? u = (0, n.llSplay)(u, l, h, y) : u = (0, n.lrSplay)(u, l, h, y) : p ? u = (0, n.rlSplay)(u, l, h, y) : u = (0, n.rrSplay)(u, l, h, y), c > 1 ? (0, n.splay)(u, l, c - 1) : u) : (p ? (0, n.rSplay)(l, h) : (0, n.lSplay)(l, h), l);
    };
    n.splay = e;
    const t = (u, l) => {
      const c = u.r;
      u.p = void 0, u.r = l, l.p = u, l.l = c, c && (c.p = l);
    };
    n.rSplay = t;
    const i = (u, l) => {
      const c = u.l;
      u.p = void 0, u.l = l, l.p = u, l.r = c, c && (c.p = l);
    };
    n.lSplay = i;
    const r = (u, l, c, h) => {
      const y = c.l, p = l.l, m = h.p;
      return l.p = m, l.l = c, c.p = l, c.l = h, c.r = p, h.p = c, h.r = y, y && (y.p = h), p && (p.p = c), m ? m.l === h ? m.l = l : m.r = l : u = l, u;
    };
    n.rrSplay = r;
    const s = (u, l, c, h) => {
      const y = c.r, p = l.r, m = h.p;
      return l.p = m, l.r = c, c.p = l, c.l = p, c.r = h, h.p = c, h.l = y, y && (y.p = h), p && (p.p = c), m ? m.l === h ? m.l = l : m.r = l : u = l, u;
    };
    n.llSplay = s;
    const o = (u, l, c, h) => {
      const y = l.l, p = l.r, m = h.p;
      return l.p = m, l.l = c, l.r = h, c.p = l, c.r = y, h.p = l, h.l = p, y && (y.p = c), p && (p.p = h), m ? m.l === h ? m.l = l : m.r = l : u = l, u;
    };
    n.lrSplay = o;
    const a = (u, l, c, h) => {
      const y = l.r, p = l.l, m = h.p;
      return l.p = m, l.l = h, l.r = c, c.p = l, c.l = y, h.p = l, h.r = p, y && (y.p = c), p && (p.p = h), m ? m.l === h ? m.l = l : m.r = l : u = l, u;
    };
    n.rlSplay = a;
  })(hs)), hs;
}
var ds = {}, wc;
function Cd() {
  return wc || (wc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.splay2 = void 0;
    const e = (u, l) => {
      const c = l.p2;
      if (!c)
        return u;
      const h = c.p2, y = c.l2 === l;
      return h ? (h.l2 === c ? y ? u = s(u, l, c, h) : u = o(u, l, c, h) : y ? u = a(u, l, c, h) : u = r(u, l, c, h), (0, n.splay2)(u, l)) : (y ? t(l, c) : i(l, c), l);
    };
    n.splay2 = e;
    const t = (u, l) => {
      const c = u.r2;
      u.p2 = void 0, u.r2 = l, l.p2 = u, l.l2 = c, c && (c.p2 = l);
    }, i = (u, l) => {
      const c = u.l2;
      u.p2 = void 0, u.l2 = l, l.p2 = u, l.r2 = c, c && (c.p2 = l);
    }, r = (u, l, c, h) => {
      const y = c.l2, p = l.l2, m = h.p2;
      return l.p2 = m, l.l2 = c, c.p2 = l, c.l2 = h, c.r2 = p, h.p2 = c, h.r2 = y, y && (y.p2 = h), p && (p.p2 = c), m ? m.l2 === h ? m.l2 = l : m.r2 = l : u = l, u;
    }, s = (u, l, c, h) => {
      const y = c.r2, p = l.r2, m = h.p2;
      return l.p2 = m, l.r2 = c, c.p2 = l, c.l2 = p, c.r2 = h, h.p2 = c, h.l2 = y, y && (y.p2 = h), p && (p.p2 = c), m ? m.l2 === h ? m.l2 = l : m.r2 = l : u = l, u;
    }, o = (u, l, c, h) => {
      const y = l.l2, p = l.r2, m = h.p2;
      return l.p2 = m, l.l2 = c, l.r2 = h, c.p2 = l, c.r2 = y, h.p2 = l, h.l2 = p, y && (y.p2 = c), p && (p.p2 = h), m ? m.l2 === h ? m.l2 = l : m.r2 = l : u = l, u;
    }, a = (u, l, c, h) => {
      const y = l.r2, p = l.l2, m = h.p2;
      return l.p2 = m, l.l2 = h, l.r2 = c, c.p2 = l, c.l2 = y, h.p2 = l, h.r2 = p, y && (y.p2 = c), p && (p.p2 = h), m ? m.l2 === h ? m.l2 = l : m.r2 = l : u = l, u;
    };
  })(ds)), ds;
}
var xr = {}, _c = {}, kc;
function Id() {
  if (kc) return _c;
  if (kc = 1, typeof Iterator > "u" && typeof globalThis == "object") {
    class n {
      [Symbol.iterator]() {
        return this;
      }
      find(t) {
        for (const i of this)
          if (t(i))
            return i;
      }
    }
    globalThis.Iterator = n;
  }
  return _c;
}
var Sc;
function Td() {
  if (Sc) return xr;
  Sc = 1, Object.defineProperty(xr, "__esModule", { value: !0 }), xr.UndEndIterator = void 0, Id();
  class n extends Iterator {
    constructor(i) {
      super(), this.n = i;
    }
    next() {
      const i = this.n();
      return new e(i, i === void 0);
    }
  }
  xr.UndEndIterator = n;
  class e {
    constructor(i, r) {
      this.value = i, this.done = r;
    }
  }
  return xr;
}
var xc;
function no() {
  if (xc) return kr;
  xc = 1, Object.defineProperty(kr, "__esModule", { value: !0 }), kr.AbstractRga = void 0;
  const n = le(), e = Gs(), t = Od(), i = Nd(), r = Cd(), s = Gu(), o = vi(), a = je(), u = bi(), l = Td(), c = (_, f) => {
    const d = _.id, g = f.id;
    return d.sid - g.sid || d.time - g.time;
  }, h = (_) => {
    const f = _.l, d = _.r;
    _.len = (_.del ? 0 : _.span) + (f ? f.len : 0) + (d ? d.len : 0);
  }, y = (_) => {
    const f = _.l, d = _.r;
    _.len = _.span + (f ? f.len : 0) + (d ? d.len : 0);
  }, p = (_, f) => {
    for (; _; )
      _.len += f, _ = _.p;
  }, m = (_) => {
    const f = _.r;
    if (f) {
      _ = f;
      let g;
      for (; g = _.l; )
        _ = g;
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
      let g;
      for (; g = _.r; )
        _ = g;
      return _;
    }
    let d = _.p;
    for (; d && d.l === _; )
      _ = d, d = d.p;
    return d;
  };
  let b = class {
    constructor(f) {
      this.id = f, this.root = void 0, this.ids = void 0, this.count = 0;
    }
    // --------------------------------------------------------------- Public API
    ins(f, d, g) {
      const v = this.id, w = f.time, x = f.sid;
      if (v.time === w && v.sid === x) {
        this.insAfterRoot(f, d, g);
        return;
      }
      let C = this.ids, E = C;
      for (; C; ) {
        const L = C.id, Z = L.sid;
        if (Z > x)
          C = C.l2;
        else if (Z < x)
          E = C, C = C.r2;
        else {
          const K = L.time;
          if (K > w)
            C = C.l2;
          else if (K < w)
            E = C, C = C.r2;
          else {
            E = C;
            break;
          }
        }
      }
      if (!E)
        return;
      const O = E.id, I = O.time, j = O.sid, P = E.span;
      if (j !== x || w - I >= P)
        return;
      const B = w - I;
      this.insAfterChunk(f, E, B, d, g);
    }
    insAt(f, d, g) {
      if (!f) {
        const E = this.id;
        return this.insAfterRoot(E, d, g), E;
      }
      const v = this.findChunk(f - 1);
      if (!v)
        return;
      const [w, x] = v, N = w.id, C = x === 0 ? N : new n.Timestamp(N.sid, N.time + x);
      return this.insAfterChunk(C, w, x, d, g), C;
    }
    insAfterRoot(f, d, g) {
      const v = this.createChunk(d, g), w = this.first();
      if (!w)
        this.setRoot(v);
      else if ((0, n.compare)(w.id, d) < 0)
        this.insertBefore(v, w);
      else {
        if ((0, n.containsId)(w.id, w.span, d))
          return;
        this.insertAfterRef(v, f, w);
      }
    }
    insAfterChunk(f, d, g, v, w) {
      const x = d.id, N = x.time, C = x.sid, E = d.span, O = this.createChunk(v, w);
      if (g + 1 < E) {
        const j = v.sid, P = v.time;
        if (C === j && N <= P && N + E - 1 >= P)
          return;
        if (P > f.time + 1 || j > f.sid) {
          this.insertInside(O, d, g + 1), this.splay(O);
          return;
        }
      }
      this.insertAfterRef(O, f, d), this.splay(O);
    }
    delete(f) {
      const d = f.length;
      for (let g = 0; g < d; g++)
        this.deleteSpan(f[g]);
      this.onChange();
    }
    deleteSpan(f) {
      const d = f.span, g = f.time, v = g + d - 1, w = this.findById(f);
      if (!w)
        return;
      let x = w, N = x;
      for (; x; ) {
        N = x;
        const C = x.id, E = x.span, O = C.time, I = O + E - 1;
        if (x.del) {
          if (I >= v)
            break;
          x = x.s;
          continue;
        }
        const j = g <= O, P = g <= I;
        if (j)
          if (v >= I) {
            if (x.delete(), p(x, -x.span), v <= I)
              break;
          } else {
            const B = v - O + 1, L = this.split(x, B);
            x.delete(), h(L), p(x, -x.span);
            break;
          }
        else if (P)
          if (v >= I) {
            const B = g - O, L = this.split(x, B);
            if (L.delete(), L.len = L.r ? L.r.len : 0, p(x, -L.span), v <= I)
              break;
          } else {
            const B = this.split(x, v - O + 1), L = this.split(x, g - O);
            L.delete(), h(B), h(L), p(x, -L.span);
            break;
          }
        x = x.s;
      }
      N && this.mergeTombstones2(w, N);
    }
    find(f) {
      let d = this.root;
      for (; d; ) {
        const g = d.l, v = g ? g.len : 0;
        let w;
        if (f < v)
          d = g;
        else if (d.del)
          f -= v, d = d.r;
        else if (f < v + (w = d.span)) {
          const x = f - v, N = d.id;
          return x ? new n.Timestamp(N.sid, N.time + x) : N;
        } else
          f -= v + w, d = d.r;
      }
    }
    findChunk(f) {
      let d = this.root;
      for (; d; ) {
        const g = d.l, v = g ? g.len : 0;
        let w;
        if (f < v)
          d = g;
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
      const g = [];
      if (!d)
        return g;
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
        return g;
      if (v.span >= d + w) {
        const C = v.id;
        return g.push((0, n.tss)(C.sid, C.time + w, d)), g;
      }
      const x = v.span - w, N = v.id;
      if (g.push((0, n.tss)(N.sid, N.time + w, x)), d -= x, v = m(v), !v)
        return g;
      do {
        if (v.del)
          continue;
        const C = v.id, E = v.span;
        if (d <= E)
          return g.push((0, n.tss)(C.sid, C.time, d)), g;
        g.push((0, n.tss)(C.sid, C.time, E)), d -= E;
      } while ((v = m(v)) && d > 0);
      return g;
    }
    /** Rename to .rangeX() method? */
    findInterval2(f, d) {
      const g = [];
      return this.range0(void 0, f, d, (v, w, x) => {
        const N = v.id;
        g.push((0, n.tss)(N.sid, N.time + w, x));
      }), g;
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
    range0(f, d, g, v) {
      let w = f || this.findById(d);
      if (f)
        for (; w && !(0, n.containsId)(w.id, w.span, d); )
          w = m(w);
      if (w) {
        if (w.del) {
          if ((0, n.containsId)(w.id, w.span, g))
            return;
        } else {
          const x = d.time - w.id.time;
          if ((0, n.containsId)(w.id, w.span, g)) {
            const E = g.time - d.time + 1;
            return v(w, x, E), w;
          }
          const C = w.span - x;
          if (v(w, x, C))
            return w;
        }
        for (w = m(w); w; ) {
          if ((0, n.containsId)(w.id, w.span, g))
            return !w.del && v(w, 0, g.time - w.id.time + 1), w;
          if (!w.del && v(w, 0, w.span))
            return w;
          w = m(w);
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
      const d = f.id, g = f.span;
      return g === 1 ? d : new n.Timestamp(d.sid, d.time + g - 1);
    }
    /** @todo Maybe use implementation from tree utils, if does not impact performance. */
    /** @todo Or better remove this method completely, as it does not require "this". */
    next(f) {
      return m(f);
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
      const d = f.p, g = f.l;
      if (!d)
        return g ? g.len : 0;
      const v = this.pos(d);
      if (d.r === f)
        return v + (d.del ? 0 : d.span) + (g ? g.len : 0);
      const x = f.r;
      return v - (f.del ? 0 : f.span) - (x ? x.len : 0);
    }
    chunks0() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = m(f)), d;
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
      const g = d.l;
      d.l = f, f.l = g, f.p = d;
      let v = 0;
      g && (g.p = f, v = g.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfter(f, d) {
      const g = d.r;
      d.r = f, f.r = g, f.p = d;
      let v = 0;
      g && (g.p = f, v = g.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfterRef(f, d, g) {
      const v = f.id, w = v.sid, x = v.time;
      let N = !1;
      for (; ; ) {
        const C = g.id, E = C.time + g.span;
        g.s || (N = C.sid === w && E === x && E - 1 === d.time, N && (g.s = f));
        const O = m(g);
        if (!O)
          break;
        const I = O.id, j = I.time, P = I.sid;
        if (j < x)
          break;
        if (j === x) {
          if (P === w)
            return;
          if (P < w)
            break;
        }
        g = O;
      }
      N && !g.del ? (this.mergeContent(g, f.data), g.s = void 0) : this.insertAfter(f, g);
    }
    mergeContent(f, d) {
      const g = f.span;
      f.merge(d), p(f, f.span - g), this.onChange();
    }
    insertInside(f, d, g) {
      const v = d.p, w = d.l, x = d.r, N = d.s, C = d.len, E = d.split(g);
      if (d.s = E, E.s = N, d.l = d.r = E.l = E.r = void 0, E.l = void 0, f.p = v, !w)
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
      let I = f.p;
      for (; I; )
        I.len += O, I = I.p;
      this.insertId(E), this.insertIdFast(f), this.onChange();
    }
    split(f, d) {
      const g = f.s, v = f.split(d), w = f.r;
      return f.s = v, v.r = w, v.s = g, f.r = v, v.p = f, this.insertId(v), w && (w.p = v), v;
    }
    mergeTombstones(f, d) {
      if (!f.del || !d.del)
        return !1;
      const g = f.id, v = d.id;
      return g.sid !== v.sid || g.time + f.span !== v.time ? !1 : (f.s = d.s, f.span += d.span, this.deleteChunk(d), !0);
    }
    mergeTombstones2(f, d) {
      let g = f;
      for (; g; ) {
        const w = m(g);
        if (!w)
          break;
        if (!this.mergeTombstones(g, w)) {
          if (w === d) {
            if (w) {
              const N = m(w);
              N && this.mergeTombstones(w, N);
            }
            break;
          }
          g = g.s;
        }
      }
      const v = k(f);
      v && this.mergeTombstones(v, f);
    }
    rmTombstones() {
      let f = this.first();
      const d = [];
      for (; f; )
        f.del && d.push(f), f = m(f);
      for (let g = 0; g < d.length; g++)
        this.deleteChunk(d[g]);
    }
    deleteChunk(f) {
      this.deleteId(f);
      const d = f.p, g = f.l, v = f.r;
      if (f.id = o.ORIGIN, !g && !v)
        d ? d.l === f ? d.l = void 0 : d.r = void 0 : this.root = void 0;
      else if (g && v) {
        let w = g;
        for (; w.r; )
          w = w.r;
        w.r = v, v.p = w;
        const x = v.len;
        let N;
        for (N = w, d ? (d.l === f ? d.l = g : d.r = g, g.p = d) : (this.root = g, g.p = void 0); N && N !== d; )
          N.len += x, N = N.p;
      } else {
        const w = g || v;
        w.p = d, d ? d.l === f ? d.l = w : d.r = w : this.root = w;
      }
    }
    insertId(f) {
      this.ids = (0, s.insert2)(this.ids, f, c), this.count++, this.ids = (0, r.splay2)(this.ids, f);
    }
    insertIdFast(f) {
      this.ids = (0, s.insert2)(this.ids, f, c), this.count++;
    }
    deleteId(f) {
      this.ids = (0, s.remove2)(this.ids, f), this.count--;
    }
    findById(f) {
      const d = f.sid, g = f.time;
      let v = this.ids, w = v;
      for (; v; ) {
        const I = v.id, j = I.sid;
        if (j > d)
          v = v.l2;
        else if (j < d)
          w = v, v = v.r2;
        else {
          const P = I.time;
          if (P > g)
            v = v.l2;
          else if (P < g)
            w = v, v = v.r2;
          else {
            w = v;
            break;
          }
        }
      }
      if (!w)
        return;
      const x = w.id, N = x.time, C = x.sid, E = w.span;
      if (!(C !== d || g < N || g - N >= E))
        return w;
    }
    posById(f) {
      const d = this.findById(f);
      if (!d)
        return;
      const g = this.pos(d);
      return d.del ? g : g + (f.time - d.id.time);
    }
    /**
     * @param id ID of character to start the search from.
     * @returns Previous ID in the RGA sequence.
     */
    prevId(f) {
      let d = this.findById(f);
      if (!d)
        return;
      const g = f.time;
      if (d.id.time < g)
        return new n.Timestamp(f.sid, g - 1);
      if (d = k(d), !d)
        return;
      const v = d.id;
      return d.span > 1 ? new n.Timestamp(v.sid, v.time + d.span - 1) : v;
    }
    spanView(f) {
      const d = [];
      let g = f.span;
      const v = f.time;
      let w = this.findById(f);
      if (!w)
        return d;
      if (!w.del)
        if (w.span >= g + v - w.id.time) {
          const x = v - w.id.time, N = x + g, C = w.view().slice(x, N);
          return d.push(C), d;
        } else {
          const x = v - w.id.time, N = w.view().slice(x, f.span);
          g -= w.span - x, d.push(N);
        }
      for (; w = w.s; ) {
        const x = w.span;
        if (!w.del) {
          if (x > g) {
            const N = w.view().slice(0, g);
            d.push(N);
            break;
          }
          d.push(w.data);
        }
        if (g -= x, g <= 0)
          break;
      }
      return d;
    }
    // ---------------------------------------------------------- Splay balancing
    splay(f) {
      const d = f.p;
      if (!d)
        return;
      const g = d.p, v = d.l === f;
      if (!g) {
        v ? (0, i.rSplay)(f, d) : (0, i.lSplay)(f, d), this.root = f, h(d), y(f);
        return;
      }
      g.l === d ? v ? this.root = (0, i.llSplay)(this.root, f, d, g) : this.root = (0, i.lrSplay)(this.root, f, d, g) : v ? this.root = (0, i.rlSplay)(this.root, f, d, g) : this.root = (0, i.rrSplay)(this.root, f, d, g), h(g), h(d), y(f), this.splay(f);
    }
    // ---------------------------------------------------------- Export / Import
    iterator() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = m(f)), d;
      };
    }
    ingest(f, d) {
      if (f < 1)
        return;
      const g = /* @__PURE__ */ new Map();
      this.root = this._ingest(f, () => {
        const v = d(), w = v.id, x = w.sid + "." + w.time, N = g.get(x);
        N && (N.s = v, g.delete(x));
        const C = (0, n.tick)(w, v.span);
        return g.set(C.sid + "." + C.time, v), v;
      });
    }
    _ingest(f, d) {
      const g = f >> 1, v = f - g - 1, w = g > 0 ? this._ingest(g, d) : void 0, x = d();
      w && (x.l = w, w.p = x);
      const N = v > 0 ? this._ingest(v, d) : void 0;
      return N && (x.r = N, N.p = x), h(x), this.insertId(x), x;
    }
    // ---------------------------------------------------------------- Printable
    toStringName() {
      return "AbstractRga";
    }
    toString(f = "") {
      const d = this.view();
      let g = "";
      return (0, e.isUint8Array)(d) ? g += ` { ${(0, t.printOctets)(d) || "∅"} }` : typeof d == "string" && (g += `{ ${d.length > 32 ? JSON.stringify(d.substring(0, 32)) + " …" : JSON.stringify(d)} }`), `${this.toStringName()} ${(0, n.printTs)(this.id)} ${g}` + (0, a.printTree)(f, [(w) => this.root ? this.printChunk(w, this.root) : "∅"]);
    }
    printChunk(f, d) {
      return this.formatChunk(d) + (0, u.printBinary)(f, [
        d.l ? (g) => this.printChunk(g, d.l) : null,
        d.r ? (g) => this.printChunk(g, d.r) : null
      ]);
    }
    formatChunk(f) {
      let g = `chunk ${(0, n.printTs)(f.id)}:${f.span} .${f.len}.`;
      if (f.del)
        g += ` [${f.span}]`;
      else if ((0, e.isUint8Array)(f.data))
        g += ` { ${(0, t.printOctets)(f.data) || "∅"} }`;
      else if (typeof f.data == "string") {
        const v = f.data.length > 32 ? JSON.stringify(f.data.substring(0, 32)) + " …" : JSON.stringify(f.data);
        g += ` { ${v} }`;
      }
      return g;
    }
  };
  return kr.AbstractRga = b, kr;
}
var Oc;
function Ad() {
  if (Oc) return Tt;
  Oc = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.ArrNode = Tt.ArrChunk = void 0;
  const n = no(), e = le(), t = bi(), i = je();
  class r {
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
        return new r((0, e.tick)(this.id, a), u - a, c);
      }
      return new r((0, e.tick)(this.id, a), u - a, void 0);
    }
    delete() {
      this.del = !0, this.data = void 0;
    }
    clone() {
      return new r(this.id, this.span, this.data ? [...this.data] : void 0);
    }
    view() {
      return this.data ? [...this.data] : [];
    }
  }
  Tt.ArrChunk = r;
  let s = class tl extends n.AbstractRga {
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
      const h = a.time - l.id.time, y = c[h];
      if (!(y && (0, e.compare)(y, u) >= 0))
        return c[h] = u, this.onChange(), y;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(a, u) {
      return new r(a, u ? u.length : 0, u);
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
      let y = !0;
      for (let m = this.first(); m; m = this.next(m))
        if (!m.del)
          for (const k of m.data) {
            const b = h.get(k);
            if (!b) {
              y = !1;
              continue;
            }
            const _ = b.view();
            l[c.length] !== _ && (y = !1), c.push(_);
          }
      return l.length !== c.length && (y = !1), y ? l : (this._tick = u, this._view = c);
    }
    /** @ignore */
    children(a) {
      const u = this.doc.index;
      for (let l = this.first(); l; l = this.next(l)) {
        const c = l.data;
        if (!c)
          continue;
        const h = c.length;
        for (let y = 0; y < h; y++)
          a(u.get(c[y]));
      }
    }
    /** @ignore */
    clone(a) {
      const u = new tl(a, this.id), l = this.count;
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
        c = (0, i.printTree)(a, u.data.map((y) => h.get(y)).filter((y) => !!y).map((y, p) => (m) => `[${l + p}]: ${y.toString(m + "    " + " ".repeat(String(p).length))}`));
      }
      return this.formatChunk(u) + c + (0, t.printBinary)(a, [
        u.l ? (h) => this.printChunk(h, u.l) : null,
        u.r ? (h) => this.printChunk(h, u.r) : null
      ]);
    }
  };
  return Tt.ArrNode = s, Tt;
}
var At = {}, Nc;
function jd() {
  if (Nc) return At;
  Nc = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.BinNode = At.BinChunk = void 0;
  const n = le(), e = no();
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
        const a = this.data, u = a.subarray(s), l = new t((0, n.tick)(this.id, s), this.span - s, u);
        return this.data = a.subarray(0, s), this.span = s, l;
      }
      const o = new t((0, n.tick)(this.id, s), this.span - s, void 0);
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
  At.BinChunk = t;
  let i = class nl extends e.AbstractRga {
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
      const s = new nl(this.id), o = this.count;
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
  return At.BinNode = i, At;
}
var jt = {}, Cc;
function Ed() {
  if (Cc) return jt;
  Cc = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt.StrNode = jt.StrChunk = void 0;
  const n = le(), e = no(), t = Wu();
  class i {
    constructor(o, a, u) {
      this.id = o, this.span = a, this.len = u ? a : 0, this.del = !u, this.p = void 0, this.l = void 0, this.r = void 0, this.p2 = void 0, this.l2 = void 0, this.r2 = void 0, this.s = void 0, this.data = u;
    }
    merge(o) {
      this.data += o, this.span = this.data.length;
    }
    split(o) {
      if (!this.del) {
        const u = new i((0, n.tick)(this.id, o), this.span - o, this.data.slice(o));
        return this.data = this.data.slice(0, o), this.span = o, u;
      }
      const a = new i((0, n.tick)(this.id, o), this.span - o, "");
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
  jt.StrChunk = i;
  let r = class rl extends e.AbstractRga {
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
      const o = new rl(this.id), a = this.count;
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
  return jt.StrNode = r, jt;
}
var Ic;
function Pd() {
  return Ic || (Ic = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.StrChunk = n.StrNode = n.BinChunk = n.BinNode = n.ArrChunk = n.ArrNode = n.ObjNode = n.VecNode = n.RootNode = n.ValNode = n.ConNode = void 0;
    var e = wi();
    Object.defineProperty(n, "ConNode", { enumerable: !0, get: function() {
      return e.ConNode;
    } });
    var t = Yu();
    Object.defineProperty(n, "ValNode", { enumerable: !0, get: function() {
      return t.ValNode;
    } });
    var i = _d();
    Object.defineProperty(n, "RootNode", { enumerable: !0, get: function() {
      return i.RootNode;
    } });
    var r = Sd();
    Object.defineProperty(n, "VecNode", { enumerable: !0, get: function() {
      return r.VecNode;
    } });
    var s = xd();
    Object.defineProperty(n, "ObjNode", { enumerable: !0, get: function() {
      return s.ObjNode;
    } });
    var o = Ad();
    Object.defineProperty(n, "ArrNode", { enumerable: !0, get: function() {
      return o.ArrNode;
    } }), Object.defineProperty(n, "ArrChunk", { enumerable: !0, get: function() {
      return o.ArrChunk;
    } });
    var a = jd();
    Object.defineProperty(n, "BinNode", { enumerable: !0, get: function() {
      return a.BinNode;
    } }), Object.defineProperty(n, "BinChunk", { enumerable: !0, get: function() {
      return a.BinChunk;
    } });
    var u = Ed();
    Object.defineProperty(n, "StrNode", { enumerable: !0, get: function() {
      return u.StrNode;
    } }), Object.defineProperty(n, "StrChunk", { enumerable: !0, get: function() {
      return u.StrChunk;
    } });
  })(Ai)), Ai;
}
var Tc;
function kt() {
  return Tc || (Tc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(vh(), n), e.__exportStar(Pd(), n);
  })(Ii)), Ii;
}
var fs = {}, Ac;
function Rd() {
  return Ac || (Ac = 1, Object.defineProperty(fs, "__esModule", { value: !0 })), fs;
}
var ps = {}, jc;
function Ld() {
  return jc || (jc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.Model = void 0;
    const e = re;
    var t = to();
    Object.defineProperty(n, "Model", { enumerable: !0, get: function() {
      return t.Model;
    } }), e.__exportStar(Hu(), n);
  })(ps)), ps;
}
var Ec;
function il() {
  return Ec || (Ec = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(kt(), n), e.__exportStar(Rd(), n), e.__exportStar(Ld(), n), e.__exportStar(_t(), n);
  })(Ci)), Ci;
}
var Bd = il(), q = mi(), Vd = _t(), be = Uint8Array, Ne = Uint16Array, ro = Int32Array, ki = new be([
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
]), Si = new be([
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
]), Cs = new be([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), sl = function(n, e) {
  for (var t = new Ne(31), i = 0; i < 31; ++i)
    t[i] = e += 1 << n[i - 1];
  for (var r = new ro(t[30]), i = 1; i < 30; ++i)
    for (var s = t[i]; s < t[i + 1]; ++s)
      r[s] = s - t[i] << 5 | i;
  return { b: t, r };
}, ol = sl(ki, 2), al = ol.b, Is = ol.r;
al[28] = 258, Is[258] = 28;
var cl = sl(Si, 0), Md = cl.b, Pc = cl.r, Ts = new Ne(32768);
for (var ce = 0; ce < 32768; ++ce) {
  var st = (ce & 43690) >> 1 | (ce & 21845) << 1;
  st = (st & 52428) >> 2 | (st & 13107) << 2, st = (st & 61680) >> 4 | (st & 3855) << 4, Ts[ce] = ((st & 65280) >> 8 | (st & 255) << 8) >> 1;
}
var We = (function(n, e, t) {
  for (var i = n.length, r = 0, s = new Ne(e); r < i; ++r)
    n[r] && ++s[n[r] - 1];
  var o = new Ne(e);
  for (r = 1; r < e; ++r)
    o[r] = o[r - 1] + s[r - 1] << 1;
  var a;
  if (t) {
    a = new Ne(1 << e);
    var u = 15 - e;
    for (r = 0; r < i; ++r)
      if (n[r])
        for (var l = r << 4 | n[r], c = e - n[r], h = o[n[r] - 1]++ << c, y = h | (1 << c) - 1; h <= y; ++h)
          a[Ts[h] >> u] = l;
  } else
    for (a = new Ne(i), r = 0; r < i; ++r)
      n[r] && (a[r] = Ts[o[n[r] - 1]++] >> 15 - n[r]);
  return a;
}), wt = new be(288);
for (var ce = 0; ce < 144; ++ce)
  wt[ce] = 8;
for (var ce = 144; ce < 256; ++ce)
  wt[ce] = 9;
for (var ce = 256; ce < 280; ++ce)
  wt[ce] = 7;
for (var ce = 280; ce < 288; ++ce)
  wt[ce] = 8;
var qr = new be(32);
for (var ce = 0; ce < 32; ++ce)
  qr[ce] = 5;
var Dd = /* @__PURE__ */ We(wt, 9, 0), qd = /* @__PURE__ */ We(wt, 9, 1), Ud = /* @__PURE__ */ We(qr, 5, 0), Fd = /* @__PURE__ */ We(qr, 5, 1), gs = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Re = function(n, e, t) {
  var i = e / 8 | 0;
  return (n[i] | n[i + 1] << 8) >> (e & 7) & t;
}, ys = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, io = function(n) {
  return (n + 7) / 8 | 0;
}, ul = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new be(n.subarray(e, t));
}, zd = [
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
], Be = function(n, e, t) {
  var i = new Error(e || zd[n]);
  if (i.code = n, Error.captureStackTrace && Error.captureStackTrace(i, Be), !t)
    throw i;
  return i;
}, Zd = function(n, e, t, i) {
  var r = n.length, s = 0;
  if (!r || e.f && !e.l)
    return t || new be(0);
  var o = !t, a = o || e.i != 2, u = e.i;
  o && (t = new be(r * 3));
  var l = function(Sn) {
    var xn = t.length;
    if (Sn > xn) {
      var Ht = new be(Math.max(xn * 2, Sn));
      Ht.set(t), t = Ht;
    }
  }, c = e.f || 0, h = e.p || 0, y = e.b || 0, p = e.l, m = e.d, k = e.m, b = e.n, _ = r * 8;
  do {
    if (!p) {
      c = Re(n, h, 1);
      var f = Re(n, h + 1, 3);
      if (h += 3, f)
        if (f == 1)
          p = qd, m = Fd, k = 9, b = 5;
        else if (f == 2) {
          var w = Re(n, h, 31) + 257, x = Re(n, h + 10, 15) + 4, N = w + Re(n, h + 5, 31) + 1;
          h += 14;
          for (var C = new be(N), E = new be(19), O = 0; O < x; ++O)
            E[Cs[O]] = Re(n, h + O * 3, 7);
          h += x * 3;
          for (var I = gs(E), j = (1 << I) - 1, P = We(E, I, 1), O = 0; O < N; ) {
            var R = P[Re(n, h, j)];
            h += R & 15;
            var d = R >> 4;
            if (d < 16)
              C[O++] = d;
            else {
              var B = 0, L = 0;
              for (d == 16 ? (L = 3 + Re(n, h, 3), h += 2, B = C[O - 1]) : d == 17 ? (L = 3 + Re(n, h, 7), h += 3) : d == 18 && (L = 11 + Re(n, h, 127), h += 7); L--; )
                C[O++] = B;
            }
          }
          var Z = C.subarray(0, w), K = C.subarray(w);
          k = gs(Z), b = gs(K), p = We(Z, k, 1), m = We(K, b, 1);
        } else
          Be(1);
      else {
        var d = io(h) + 4, g = n[d - 4] | n[d - 3] << 8, v = d + g;
        if (v > r) {
          u && Be(0);
          break;
        }
        a && l(y + g), t.set(n.subarray(d, v), y), e.b = y += g, e.p = h = v * 8, e.f = c;
        continue;
      }
      if (h > _) {
        u && Be(0);
        break;
      }
    }
    a && l(y + 131072);
    for (var ue = (1 << k) - 1, X = (1 << b) - 1, he = h; ; he = h) {
      var B = p[ys(n, h) & ue], oe = B >> 4;
      if (h += B & 15, h > _) {
        u && Be(0);
        break;
      }
      if (B || Be(2), oe < 256)
        t[y++] = oe;
      else if (oe == 256) {
        he = h, p = null;
        break;
      } else {
        var se = oe - 254;
        if (oe > 264) {
          var O = oe - 257, ie = ki[O];
          se = Re(n, h, (1 << ie) - 1) + al[O], h += ie;
        }
        var Se = m[ys(n, h) & X], zt = Se >> 4;
        Se || Be(3), h += Se & 15;
        var K = Md[zt];
        if (zt > 3) {
          var ie = Si[zt];
          K += ys(n, h) & (1 << ie) - 1, h += ie;
        }
        if (h > _) {
          u && Be(0);
          break;
        }
        a && l(y + 131072);
        var Zt = y + se;
        if (y < K) {
          var Xr = s - K, Yr = Math.min(K, Zt);
          for (Xr + y < 0 && Be(3); y < Yr; ++y)
            t[y] = i[Xr + y];
        }
        for (; y < Zt; ++y)
          t[y] = t[y - K];
      }
    }
    e.l = p, e.p = he, e.b = y, e.f = c, p && (c = 1, e.m = k, e.d = m, e.n = b);
  } while (!c);
  return y != t.length && o ? ul(t, 0, y) : t.subarray(0, y);
}, Ge = function(n, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  n[i] |= t, n[i + 1] |= t >> 8;
}, Or = function(n, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  n[i] |= t, n[i + 1] |= t >> 8, n[i + 2] |= t >> 16;
}, vs = function(n, e) {
  for (var t = [], i = 0; i < n.length; ++i)
    n[i] && t.push({ s: i, f: n[i] });
  var r = t.length, s = t.slice();
  if (!r)
    return { t: hl, l: 0 };
  if (r == 1) {
    var o = new be(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(v, w) {
    return v.f - w.f;
  }), t.push({ s: -1, f: 25001 });
  var a = t[0], u = t[1], l = 0, c = 1, h = 2;
  for (t[0] = { s: -1, f: a.f + u.f, l: a, r: u }; c != r - 1; )
    a = t[t[l].f < t[h].f ? l++ : h++], u = t[l != c && t[l].f < t[h].f ? l++ : h++], t[c++] = { s: -1, f: a.f + u.f, l: a, r: u };
  for (var y = s[0].s, i = 1; i < r; ++i)
    s[i].s > y && (y = s[i].s);
  var p = new Ne(y + 1), m = As(t[c - 1], p, 0);
  if (m > e) {
    var i = 0, k = 0, b = m - e, _ = 1 << b;
    for (s.sort(function(w, x) {
      return p[x.s] - p[w.s] || w.f - x.f;
    }); i < r; ++i) {
      var f = s[i].s;
      if (p[f] > e)
        k += _ - (1 << m - p[f]), p[f] = e;
      else
        break;
    }
    for (k >>= b; k > 0; ) {
      var d = s[i].s;
      p[d] < e ? k -= 1 << e - p[d]++ - 1 : ++i;
    }
    for (; i >= 0 && k; --i) {
      var g = s[i].s;
      p[g] == e && (--p[g], ++k);
    }
    m = e;
  }
  return { t: new be(p), l: m };
}, As = function(n, e, t) {
  return n.s == -1 ? Math.max(As(n.l, e, t + 1), As(n.r, e, t + 1)) : e[n.s] = t;
}, Rc = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new Ne(++e), i = 0, r = n[0], s = 1, o = function(u) {
    t[i++] = u;
  }, a = 1; a <= e; ++a)
    if (n[a] == r && a != e)
      ++s;
    else {
      if (!r && s > 2) {
        for (; s > 138; s -= 138)
          o(32754);
        s > 2 && (o(s > 10 ? s - 11 << 5 | 28690 : s - 3 << 5 | 12305), s = 0);
      } else if (s > 3) {
        for (o(r), --s; s > 6; s -= 6)
          o(8304);
        s > 2 && (o(s - 3 << 5 | 8208), s = 0);
      }
      for (; s--; )
        o(r);
      s = 1, r = n[a];
    }
  return { c: t.subarray(0, i), n: e };
}, Nr = function(n, e) {
  for (var t = 0, i = 0; i < e.length; ++i)
    t += n[i] * e[i];
  return t;
}, ll = function(n, e, t) {
  var i = t.length, r = io(e + 2);
  n[r] = i & 255, n[r + 1] = i >> 8, n[r + 2] = n[r] ^ 255, n[r + 3] = n[r + 1] ^ 255;
  for (var s = 0; s < i; ++s)
    n[r + s + 4] = t[s];
  return (r + 4 + i) * 8;
}, Lc = function(n, e, t, i, r, s, o, a, u, l, c) {
  Ge(e, c++, t), ++r[256];
  for (var h = vs(r, 15), y = h.t, p = h.l, m = vs(s, 15), k = m.t, b = m.l, _ = Rc(y), f = _.c, d = _.n, g = Rc(k), v = g.c, w = g.n, x = new Ne(19), N = 0; N < f.length; ++N)
    ++x[f[N] & 31];
  for (var N = 0; N < v.length; ++N)
    ++x[v[N] & 31];
  for (var C = vs(x, 7), E = C.t, O = C.l, I = 19; I > 4 && !E[Cs[I - 1]]; --I)
    ;
  var j = l + 5 << 3, P = Nr(r, wt) + Nr(s, qr) + o, R = Nr(r, y) + Nr(s, k) + o + 14 + 3 * I + Nr(x, E) + 2 * x[16] + 3 * x[17] + 7 * x[18];
  if (u >= 0 && j <= P && j <= R)
    return ll(e, c, n.subarray(u, u + l));
  var B, L, Z, K;
  if (Ge(e, c, 1 + (R < P)), c += 2, R < P) {
    B = We(y, p, 0), L = y, Z = We(k, b, 0), K = k;
    var ue = We(E, O, 0);
    Ge(e, c, d - 257), Ge(e, c + 5, w - 1), Ge(e, c + 10, I - 4), c += 14;
    for (var N = 0; N < I; ++N)
      Ge(e, c + 3 * N, E[Cs[N]]);
    c += 3 * I;
    for (var X = [f, v], he = 0; he < 2; ++he)
      for (var oe = X[he], N = 0; N < oe.length; ++N) {
        var se = oe[N] & 31;
        Ge(e, c, ue[se]), c += E[se], se > 15 && (Ge(e, c, oe[N] >> 5 & 127), c += oe[N] >> 12);
      }
  } else
    B = Dd, L = wt, Z = Ud, K = qr;
  for (var N = 0; N < a; ++N) {
    var ie = i[N];
    if (ie > 255) {
      var se = ie >> 18 & 31;
      Or(e, c, B[se + 257]), c += L[se + 257], se > 7 && (Ge(e, c, ie >> 23 & 31), c += ki[se]);
      var Se = ie & 31;
      Or(e, c, Z[Se]), c += K[Se], Se > 3 && (Or(e, c, ie >> 5 & 8191), c += Si[Se]);
    } else
      Or(e, c, B[ie]), c += L[ie];
  }
  return Or(e, c, B[256]), c + L[256];
}, Hd = /* @__PURE__ */ new ro([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), hl = /* @__PURE__ */ new be(0), Jd = function(n, e, t, i, r, s) {
  var o = s.z || n.length, a = new be(i + o + 5 * (1 + Math.ceil(o / 7e3)) + r), u = a.subarray(i, a.length - r), l = s.l, c = (s.r || 0) & 7;
  if (e) {
    c && (u[0] = s.r >> 3);
    for (var h = Hd[e - 1], y = h >> 13, p = h & 8191, m = (1 << t) - 1, k = s.p || new Ne(32768), b = s.h || new Ne(m + 1), _ = Math.ceil(t / 3), f = 2 * _, d = function(xi) {
      return (n[xi] ^ n[xi + 1] << _ ^ n[xi + 2] << f) & m;
    }, g = new ro(25e3), v = new Ne(288), w = new Ne(32), x = 0, N = 0, C = s.i || 0, E = 0, O = s.w || 0, I = 0; C + 2 < o; ++C) {
      var j = d(C), P = C & 32767, R = b[j];
      if (k[P] = R, b[j] = P, O <= C) {
        var B = o - C;
        if ((x > 7e3 || E > 24576) && (B > 423 || !l)) {
          c = Lc(n, u, 0, g, v, w, N, E, I, C - I, c), E = x = N = 0, I = C;
          for (var L = 0; L < 286; ++L)
            v[L] = 0;
          for (var L = 0; L < 30; ++L)
            w[L] = 0;
        }
        var Z = 2, K = 0, ue = p, X = P - R & 32767;
        if (B > 2 && j == d(C - X))
          for (var he = Math.min(y, B) - 1, oe = Math.min(32767, C), se = Math.min(258, B); X <= oe && --ue && P != R; ) {
            if (n[C + Z] == n[C + Z - X]) {
              for (var ie = 0; ie < se && n[C + ie] == n[C + ie - X]; ++ie)
                ;
              if (ie > Z) {
                if (Z = ie, K = X, ie > he)
                  break;
                for (var Se = Math.min(X, ie - 2), zt = 0, L = 0; L < Se; ++L) {
                  var Zt = C - X + L & 32767, Xr = k[Zt], Yr = Zt - Xr & 32767;
                  Yr > zt && (zt = Yr, R = Zt);
                }
              }
            }
            P = R, R = k[P], X += P - R & 32767;
          }
        if (K) {
          g[E++] = 268435456 | Is[Z] << 18 | Pc[K];
          var Sn = Is[Z] & 31, xn = Pc[K] & 31;
          N += ki[Sn] + Si[xn], ++v[257 + Sn], ++w[xn], O = C + Z, ++x;
        } else
          g[E++] = n[C], ++v[n[C]];
      }
    }
    for (C = Math.max(C, O); C < o; ++C)
      g[E++] = n[C], ++v[n[C]];
    c = Lc(n, u, l, g, v, w, N, E, I, C - I, c), l || (s.r = c & 7 | u[c / 8 | 0] << 3, c -= 7, s.h = b, s.p = k, s.i = C, s.w = O);
  } else {
    for (var C = s.w || 0; C < o + l; C += 65535) {
      var Ht = C + 65535;
      Ht >= o && (u[c / 8 | 0] = l, Ht = o), c = ll(u, c + 1, n.subarray(C, Ht));
    }
    s.i = o;
  }
  return ul(a, 0, i + io(c) + r);
}, Kd = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, i = 9; --i; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Wd = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, i = 0; i < e.length; ++i)
        t = Kd[t & 255 ^ e[i]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Gd = function(n, e, t, i, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var s = e.dictionary.subarray(-32768), o = new be(s.length + n.length);
    o.set(s), o.set(n, s.length), n = o, r.w = s.length;
  }
  return Jd(n, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, i, r);
}, js = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Xd = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && js(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var i = 0; i <= t.length; ++i)
      n[i + 10] = t.charCodeAt(i);
  }
}, Yd = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Be(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var i = (e >> 3 & 1) + (e >> 4 & 1); i > 0; i -= !n[t++])
    ;
  return t + (e & 2);
}, Qd = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, $d = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function ef(n, e) {
  e || (e = {});
  var t = Wd(), i = n.length;
  t.p(n);
  var r = Gd(n, e, $d(e), 8), s = r.length;
  return Xd(r, e), js(r, s - 8, t.d()), js(r, s - 4, i), r;
}
function tf(n, e) {
  var t = Yd(n);
  return t + 8 > n.length && Be(6, "invalid gzip data"), Zd(n.subarray(t, -8), { i: 2 }, new be(Qd(n)), e);
}
var nf = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), rf = 0;
try {
  nf.decode(hl, { stream: !0 }), rf = 1;
} catch {
}
const sf = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Qt(n, e, t) {
  const i = t[0];
  if (e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n.slice(-1) === i || e && e.slice(-1) === i)
    throw new Error("trailing zero");
  if (e) {
    let o = 0;
    for (; (n[o] || i) === e[o]; )
      o++;
    if (o > 0)
      return e.slice(0, o) + Qt(n.slice(o), e.slice(o), t);
  }
  const r = n ? t.indexOf(n[0]) : 0, s = e != null ? t.indexOf(e[0]) : t.length;
  if (s - r > 1) {
    const o = Math.round(0.5 * (r + s));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Qt(n.slice(1), null, t);
}
function dl(n) {
  if (n.length !== fl(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function fl(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function Ar(n) {
  const e = fl(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function Bc(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = Ar(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function Vc(n, e) {
  dl(n);
  const [t, ...i] = n.split("");
  let r = !0;
  for (let s = i.length - 1; r && s >= 0; s--) {
    const o = e.indexOf(i[s]) + 1;
    o === e.length ? i[s] = e[0] : (i[s] = e[o], r = !1);
  }
  if (r) {
    if (t === "Z")
      return "a" + e[0];
    if (t === "z")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) + 1);
    return s > "a" ? i.push(e[0]) : i.pop(), s + i.join("");
  } else
    return t + i.join("");
}
function of(n, e) {
  dl(n);
  const [t, ...i] = n.split("");
  let r = !0;
  for (let s = i.length - 1; r && s >= 0; s--) {
    const o = e.indexOf(i[s]) - 1;
    o === -1 ? i[s] = e.slice(-1) : (i[s] = e[o], r = !1);
  }
  if (r) {
    if (t === "a")
      return "Z" + e.slice(-1);
    if (t === "A")
      return null;
    const s = String.fromCharCode(t.charCodeAt(0) - 1);
    return s < "Z" ? i.push(e.slice(-1)) : i.pop(), s + i.join("");
  } else
    return t + i.join("");
}
function Jt(n, e, t = sf) {
  if (n != null && Bc(n, t), e != null && Bc(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const u = Ar(e), l = e.slice(u.length);
    if (u === "A" + t[0].repeat(26))
      return u + Qt("", l, t);
    if (u < e)
      return u;
    const c = of(u, t);
    if (c == null)
      throw new Error("cannot decrement any more");
    return c;
  }
  if (e == null) {
    const u = Ar(n), l = n.slice(u.length), c = Vc(u, t);
    return c ?? u + Qt(l, null, t);
  }
  const i = Ar(n), r = n.slice(i.length), s = Ar(e), o = e.slice(s.length);
  if (i === s)
    return i + Qt(r, o, t);
  const a = Vc(i, t);
  if (a == null)
    throw new Error("cannot increment any more");
  return a < e ? a : i + Qt(r, null, t);
}
class ge extends Error {
  constructor(t, i) {
    super(i);
    On(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
}
const af = new Uint8Array([
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
]), cf = Yc(), Mc = Yc().min(1), Cr = hh().int().nonnegative().optional();
function uf(n) {
  const e = 4 + n.reduce((s, o) => s + 4 + o.byteLength, 0), t = new Uint8Array(e), i = new DataView(t.buffer);
  i.setUint32(0, n.length, !1);
  let r = 4;
  for (const s of n)
    i.setUint32(r, s.byteLength, !1), r += 4, t.set(s, r), r += s.byteLength;
  return t;
}
function lf(n) {
  const e = new DataView(n.buffer, n.byteOffset, n.byteLength), t = e.getUint32(0, !1), i = [];
  let r = 4;
  for (let s = 0; s < t; s++) {
    const o = e.getUint32(r, !1);
    r += 4, i.push(n.slice(r, r + o)), r += o;
  }
  return i;
}
function hf(n) {
  const e = new Uint8Array(4);
  return new DataView(e.buffer).setUint32(0, n >>> 0, !1), e;
}
function df(n) {
  return n.byteLength < 4 ? 0 : new DataView(n.buffer, n.byteOffset, 4).getUint32(0, !1);
}
var W, Ur, Pt, Qe, $t, ke, ct, ut, Ze, He, gi, en, lt, tn, Rt, A, ne, Wt, jr, ze, oi, Es, pl, gl, Te, Et, Gt, Er, Xt, Pr, ai, yl, Ps, vl, Rs, Ls, Bs, Vs, $, bl, Ms, ml;
const Vr = class Vr {
  //----------------------------------------------------------------------------//
  //                               Construction                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t) {
    D(this, A);
    /**** private state ****/
    D(this, W);
    D(this, Ur);
    D(this, Pt);
    D(this, Qe, null);
    D(this, $t, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    D(this, ke, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId  (kept in sync with #ReverseIndex)
    D(this, ct, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    D(this, ut, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
    D(this, Ze, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    D(this, He, /* @__PURE__ */ new Map());
    D(this, gi, 5e3);
    // transaction nesting
    D(this, en, 0);
    // ChangeSet accumulator inside a transaction
    D(this, lt, {});
    // patch log for exportPatch() — only locally generated patches
    D(this, tn, []);
    // suppress adding to patch log when applying remote patches
    D(this, Rt, !1);
    var i;
    if (z(this, W, e), z(this, Ur, (t == null ? void 0 : t.LiteralSizeLimit) ?? 131072), z(this, Pt, (t == null ? void 0 : t.TrashTTLms) ?? null), T(this, A, pl).call(this), S(this, Pt) != null) {
      const r = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(S(this, Pt) / 4), 36e5);
      z(this, Qe, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        r
      )), typeof ((i = S(this, Qe)) == null ? void 0 : i.unref) == "function" && S(this, Qe).unref();
    }
  }
  static fromScratch(e) {
    return Vr.fromBinary(af, e);
  }
  static fromBinary(e, t) {
    const i = tf(e), r = Bd.Model.fromBinary(i);
    return new Vr(r, t);
  }
  static fromJSON(e, t) {
    const i = new Uint8Array(Buffer.from(String(e), "base64"));
    return Vr.fromBinary(i, t);
  }
  //----------------------------------------------------------------------------//
  //                             Well-known notes                               //
  //----------------------------------------------------------------------------//
  get RootNote() {
    return T(this, A, ze).call(this, Xe);
  }
  get TrashNote() {
    return T(this, A, ze).call(this, ye);
  }
  get LostAndFoundNote() {
    return T(this, A, ze).call(this, Ie);
  }
  //----------------------------------------------------------------------------//
  //                                   Lookup                                   //
  //----------------------------------------------------------------------------//
  EntryWithId(e) {
    if (T(this, A, ne).call(this).Entries[e] != null)
      return T(this, A, jr).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Factory                                   //
  //----------------------------------------------------------------------------//
  newNoteAt(e, t, i) {
    const r = t ?? $r;
    if (!Mc.safeParse(r).success)
      throw new ge("invalid-argument", "MIMEType must be a non-empty string");
    Cr.parse(i), T(this, A, Wt).call(this, e.Id);
    const s = crypto.randomUUID(), o = T(this, A, Xt).call(this, e.Id, i), a = r === $r ? "" : r;
    return this.transact(() => {
      S(this, W).api.obj(["Entries"]).set({
        [s]: q.s.obj({
          Kind: q.s.con("note"),
          outerPlacement: q.s.val(q.s.con({ outerNoteId: e.Id, OrderKey: o })),
          Label: q.s.val(q.s.str("")),
          Info: q.s.obj({}),
          MIMEType: q.s.val(q.s.str(a)),
          ValueKind: q.s.val(q.s.str("none"))
        })
      }), T(this, A, Te).call(this, e.Id, s), T(this, A, $).call(this, e.Id, "innerEntryList"), T(this, A, $).call(this, s, "outerNote");
    }), T(this, A, ze).call(this, s);
  }
  newLinkAt(e, t, i) {
    Cr.parse(i), T(this, A, Wt).call(this, e.Id), T(this, A, Wt).call(this, t.Id);
    const r = crypto.randomUUID(), s = T(this, A, Xt).call(this, t.Id, i);
    return this.transact(() => {
      S(this, W).api.obj(["Entries"]).set({
        [r]: q.s.obj({
          Kind: q.s.con("link"),
          outerPlacement: q.s.val(q.s.con({ outerNoteId: t.Id, OrderKey: s })),
          Label: q.s.val(q.s.str("")),
          Info: q.s.obj({}),
          TargetId: q.s.con(e.Id)
        })
      }), T(this, A, Te).call(this, t.Id, r), T(this, A, Gt).call(this, e.Id, r), T(this, A, $).call(this, t.Id, "innerEntryList"), T(this, A, $).call(this, r, "outerNote");
    }), T(this, A, oi).call(this, r);
  }
  //----------------------------------------------------------------------------//
  //                                   Import                                   //
  //----------------------------------------------------------------------------//
  deserializeNoteInto(e, t, i) {
    if (Cr.parse(i), T(this, A, Wt).call(this, t.Id), e == null)
      throw new ge("invalid-argument", "Serialisation must not be null");
    const r = e, s = Object.keys(r.Entries ?? {});
    if (s.length === 0)
      throw new ge("invalid-argument", "empty serialisation");
    const o = s[0], a = crypto.randomUUID(), u = /* @__PURE__ */ new Map([[o, a]]);
    for (const c of s)
      u.has(c) || u.set(c, crypto.randomUUID());
    const l = T(this, A, Xt).call(this, t.Id, i);
    return this.transact(() => {
      for (const c of s) {
        const h = r.Entries[c], y = u.get(c), m = c === o ? { outerNoteId: t.Id, OrderKey: l } : h.outerPlacement != null ? { outerNoteId: u.get(h.outerPlacement.outerNoteId) ?? t.Id, OrderKey: h.outerPlacement.OrderKey } : void 0, k = {
          Kind: q.s.con(h.Kind),
          Label: q.s.val(q.s.str(h.Label ?? "")),
          Info: q.s.obj({})
        };
        m != null && (k.outerPlacement = q.s.val(q.s.con(m))), h.Kind === "note" ? (k.MIMEType = q.s.val(q.s.str(h.MIMEType ?? "")), k.ValueKind = q.s.val(q.s.str("none"))) : k.TargetId = q.s.con(
          h.TargetId != null ? u.get(h.TargetId) ?? h.TargetId : ""
        ), S(this, W).api.obj(["Entries"]).set({ [y]: q.s.obj(k) });
        const b = (m == null ? void 0 : m.outerNoteId) ?? "";
        b !== "" && T(this, A, Te).call(this, b, y), h.Kind === "link" && h.TargetId != null && T(this, A, Gt).call(this, u.get(h.TargetId) ?? h.TargetId, y);
      }
      T(this, A, $).call(this, t.Id, "innerEntryList");
    }), T(this, A, ze).call(this, a);
  }
  deserializeLinkInto(e, t, i) {
    if (Cr.parse(i), T(this, A, Wt).call(this, t.Id), e == null)
      throw new ge("invalid-argument", "Serialisation must not be null");
    const r = e, s = Object.keys(r.Entries ?? {});
    if (s.length === 0)
      throw new ge("invalid-argument", "empty serialisation");
    const o = r.Entries[s[0]];
    if (o.Kind !== "link")
      throw new ge("invalid-argument", "serialisation is not a link");
    const a = crypto.randomUUID(), u = T(this, A, Xt).call(this, t.Id, i);
    return this.transact(() => {
      S(this, W).api.obj(["Entries"]).set({
        [a]: q.s.obj({
          Kind: q.s.con("link"),
          outerPlacement: q.s.val(q.s.con({ outerNoteId: t.Id, OrderKey: u })),
          Label: q.s.val(q.s.str(o.Label ?? "")),
          Info: q.s.obj({}),
          TargetId: q.s.con(o.TargetId ?? "")
        })
      }), T(this, A, Te).call(this, t.Id, a), o.TargetId != null && T(this, A, Gt).call(this, o.TargetId, a), T(this, A, $).call(this, t.Id, "innerEntryList");
    }), T(this, A, oi).call(this, a);
  }
  //----------------------------------------------------------------------------//
  //                               Move / Delete                                //
  //----------------------------------------------------------------------------//
  EntryMayBeMovedTo(e, t, i) {
    return e.mayBeMovedTo(t, i);
  }
  moveEntryTo(e, t, i) {
    if (Cr.parse(i), !this._mayMoveEntryTo(e.Id, t.Id, i))
      throw new ge(
        "move-would-cycle",
        "cannot move an entry into one of its own descendants"
      );
    const r = this._outerNoteIdOf(e.Id), s = T(this, A, Xt).call(this, t.Id, i);
    this.transact(() => {
      var o;
      if (S(this, W).api.val(["Entries", e.Id, "outerPlacement"]).set({ outerNoteId: t.Id, OrderKey: s }), r === ye && t.Id !== ye) {
        const a = (o = T(this, A, ne).call(this).Entries[e.Id]) == null ? void 0 : o.Info;
        a != null && "_trashedAt" in a && (S(this, W).api.obj(["Entries", e.Id, "Info"]).del(["_trashedAt"]), T(this, A, Vs).call(this, e.Id), T(this, A, $).call(this, e.Id, "Info._trashedAt"));
      }
      r != null && (T(this, A, Et).call(this, r, e.Id), T(this, A, $).call(this, r, "innerEntryList")), T(this, A, Te).call(this, t.Id, e.Id), T(this, A, $).call(this, t.Id, "innerEntryList"), T(this, A, $).call(this, e.Id, "outerNote");
    });
  }
  EntryMayBeDeleted(e) {
    return e.mayBeDeleted;
  }
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new ge("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), i = Jt(T(this, A, Pr).call(this, ye), null);
    this.transact(() => {
      S(this, W).api.val(["Entries", e.Id, "outerPlacement"]).set({ outerNoteId: ye, OrderKey: i }), T(this, A, Bs).call(this, e.Id), S(this, W).api.obj(["Entries", e.Id, "Info"]).set({ _trashedAt: q.s.val(q.s.json(Date.now())) }), t != null && (T(this, A, Et).call(this, t, e.Id), T(this, A, $).call(this, t, "innerEntryList")), T(this, A, Te).call(this, ye, e.Id), T(this, A, $).call(this, ye, "innerEntryList"), T(this, A, $).call(this, e.Id, "outerNote"), T(this, A, $).call(this, e.Id, "Info._trashedAt");
    });
  }
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== ye)
      throw new ge(
        "purge-not-in-trash",
        "only direct children of TrashNote can be purged"
      );
    if (T(this, A, yl).call(this, e.Id))
      throw new ge(
        "purge-protected",
        "entry is protected by incoming links and cannot be purged"
      );
    this.transact(() => {
      T(this, A, Ls).call(this, e.Id);
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
    var a, u, l, c;
    const t = e ?? S(this, Pt);
    if (t == null)
      return 0;
    const i = Date.now(), r = T(this, A, ne).call(this), s = Array.from(S(this, ke).get(ye) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const h of s) {
      if (((u = (a = r.Entries[h]) == null ? void 0 : a.outerPlacement) == null ? void 0 : u.outerNoteId) !== ye)
        continue;
      const y = (c = (l = r.Entries[h]) == null ? void 0 : l.Info) == null ? void 0 : c._trashedAt;
      if (typeof y == "number" && !(i - y < t))
        try {
          this.purgeEntry(T(this, A, jr).call(this, h)), o++;
        } catch {
        }
    }
    return o;
  }
  // Stops the auto-purge timer (if running). Call when the store is no longer
  // needed and `TrashTTLms` was set in the constructor options.
  dispose() {
    S(this, Qe) != null && (clearInterval(S(this, Qe)), z(this, Qe, null));
  }
  //----------------------------------------------------------------------------//
  //                           Transactions & Events                            //
  //----------------------------------------------------------------------------//
  transact(e) {
    Qr(this, en)._++;
    try {
      e();
    } finally {
      if (Qr(this, en)._--, S(this, en) === 0) {
        const t = S(this, W).api.flush();
        if (!S(this, Rt))
          try {
            const s = t.toBinary();
            s.byteLength > 0 && S(this, tn).push(s);
          } catch {
          }
        const i = { ...S(this, lt) };
        z(this, lt, {});
        const r = S(this, Rt) ? "external" : "internal";
        T(this, A, bl).call(this, r, i);
      }
    }
  }
  onChangeInvoke(e) {
    return S(this, $t).add(e), () => {
      S(this, $t).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                    Sync                                    //
  //----------------------------------------------------------------------------//
  applyRemotePatch(e) {
    z(this, Rt, !0);
    try {
      this.transact(() => {
        const t = lf(e);
        for (const i of t) {
          const r = Vd.Patch.fromBinary(i);
          S(this, W).applyPatch(r);
        }
        T(this, A, gl).call(this);
      });
    } finally {
      z(this, Rt, !1);
    }
    this.recoverOrphans();
  }
  get currentCursor() {
    return hf(S(this, tn).length);
  }
  exportPatch(e) {
    const t = e != null ? df(e) : 0, i = S(this, tn).slice(t);
    return uf(i);
  }
  recoverOrphans() {
    const t = T(this, A, ne).call(this).Entries, i = new Set(Object.keys(t));
    this.transact(() => {
      var r;
      for (const [s, o] of Object.entries(t)) {
        if (s === Xe)
          continue;
        const a = (r = o.outerPlacement) == null ? void 0 : r.outerNoteId;
        if (a != null && !i.has(a)) {
          const u = Jt(T(this, A, Pr).call(this, Ie), null);
          S(this, W).api.val(["Entries", s, "outerPlacement"]).set({ outerNoteId: Ie, OrderKey: u }), T(this, A, Te).call(this, Ie, s), T(this, A, $).call(this, s, "outerNote"), T(this, A, $).call(this, Ie, "innerEntryList");
        }
        if (o.Kind === "link") {
          const u = o.TargetId;
          if (u != null && !i.has(u)) {
            const l = Jt(T(this, A, Pr).call(this, Ie), null);
            S(this, W).api.obj(["Entries"]).set({
              [u]: q.s.obj({
                Kind: q.s.con("note"),
                outerPlacement: q.s.val(q.s.con({ outerNoteId: Ie, OrderKey: l })),
                Label: q.s.val(q.s.str("")),
                Info: q.s.obj({}),
                MIMEType: q.s.val(q.s.str("")),
                ValueKind: q.s.val(q.s.str("none"))
              })
            }), T(this, A, Te).call(this, Ie, u), i.add(u), T(this, A, $).call(this, Ie, "innerEntryList");
          }
        }
      }
    });
  }
  //----------------------------------------------------------------------------//
  //                             Serialisation                                  //
  //----------------------------------------------------------------------------//
  asBinary() {
    return ef(S(this, W).toBinary());
  }
  asJSON() {
    return Buffer.from(this.asBinary()).toString("base64");
  }
  //----------------------------------------------------------------------------//
  //           Internal helpers — called by SNS_Entry / Note / Link             //
  //----------------------------------------------------------------------------//
  _KindOf(e) {
    const t = T(this, A, ne).call(this).Entries[e];
    if (t == null)
      throw new ge("not-found", `entry '${e}' not found`);
    return t.Kind;
  }
  _LabelOf(e) {
    var t;
    return ((t = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : t.Label) ?? "";
  }
  _setLabelOf(e, t) {
    cf.parse(t), this.transact(() => {
      S(this, W).api.val(["Entries", e, "Label"]).set(t), T(this, A, $).call(this, e, "Label");
    });
  }
  // Returns the MIME type for entry Id.  An empty string stored in the CRDT
  // means the default type ('text/plain') — this avoids storing the common
  // case redundantly across every note.
  _TypeOf(e) {
    var i;
    const t = ((i = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : i.MIMEType) ?? "";
    return t === "" ? $r : t;
  }
  _setTypeOf(e, t) {
    Mc.parse(t);
    const i = t === $r ? "" : t;
    this.transact(() => {
      S(this, W).api.val(["Entries", e, "MIMEType"]).set(i), T(this, A, $).call(this, e, "Type");
    });
  }
  _ValueKindOf(e) {
    var t;
    return ((t = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : t.ValueKind) ?? "none";
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
    var i, r;
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal":
        return ((i = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : i.literalValue) ?? "";
      case t === "binary":
        return (r = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : r.binaryValue;
      default:
        throw new ge(
          "not-implemented",
          "large value fetching requires a ValueStore (not yet wired)"
        );
    }
  }
  _writeValueOf(e, t) {
    this.transact(() => {
      var i, r, s, o;
      switch (!0) {
        case t == null: {
          S(this, W).api.val(["Entries", e, "ValueKind"]).set("none");
          break;
        }
        case (typeof t == "string" && t.length <= S(this, Ur)): {
          S(this, W).api.val(["Entries", e, "ValueKind"]).set("literal");
          const a = (i = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : i.literalValue;
          a == null ? S(this, W).api.obj(["Entries", e]).set({ literalValue: q.s.str(t) }) : (a.length > 0 && S(this, W).api.str(["Entries", e, "literalValue"]).del(0, a.length), t.length > 0 && S(this, W).api.str(["Entries", e, "literalValue"]).ins(0, t));
          break;
        }
        case typeof t == "string": {
          const u = new TextEncoder().encode(t), l = `sha256-size-${u.byteLength}`;
          S(this, W).api.val(["Entries", e, "ValueKind"]).set("literal-reference"), ((r = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : r.ValueRef) == null ? S(this, W).api.obj(["Entries", e]).set({ ValueRef: q.s.val(q.s.con({ Hash: l, Size: u.byteLength })) }) : S(this, W).api.val(["Entries", e, "ValueRef"]).set({ Hash: l, Size: u.byteLength });
          break;
        }
        case t.byteLength <= 2048: {
          S(this, W).api.val(["Entries", e, "ValueKind"]).set("binary"), ((s = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : s.binaryValue) == null ? S(this, W).api.obj(["Entries", e]).set({ binaryValue: q.s.val(q.s.bin(t)) }) : S(this, W).api.val(["Entries", e, "binaryValue"]).set(t);
          break;
        }
        default: {
          const a = t, u = `sha256-size-${a.byteLength}`;
          S(this, W).api.val(["Entries", e, "ValueKind"]).set("binary-reference"), ((o = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : o.ValueRef) == null ? S(this, W).api.obj(["Entries", e]).set({ ValueRef: q.s.val(q.s.con({ Hash: u, Size: a.byteLength })) }) : S(this, W).api.val(["Entries", e, "ValueRef"]).set({ Hash: u, Size: a.byteLength });
          break;
        }
      }
      T(this, A, $).call(this, e, "Value");
    });
  }
  _spliceValueOf(e, t, i, r) {
    if (this._ValueKindOf(e) !== "literal")
      throw new ge(
        "change-value-not-literal",
        "changeValue() is only available when ValueKind === 'literal'"
      );
    this.transact(() => {
      const s = i - t;
      s > 0 && S(this, W).api.str(["Entries", e, "literalValue"]).del(t, s), r.length > 0 && S(this, W).api.str(["Entries", e, "literalValue"]).ins(t, r), T(this, A, $).call(this, e, "Value");
    });
  }
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(i, r) {
        var s, o, a;
        if (typeof r == "string")
          return (a = (o = T(s = t, A, ne).call(s).Entries[e]) == null ? void 0 : o.Info) == null ? void 0 : a[r];
      },
      set(i, r, s) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var o, a;
          T(o = t, A, Bs).call(o, e), S(t, W).api.obj(["Entries", e, "Info"]).set({ [r]: q.s.val(q.s.json(s)) }), T(a = t, A, $).call(a, e, `Info.${r}`);
        }), !0);
      },
      deleteProperty(i, r) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var s, o;
          S(t, W).api.obj(["Entries", e, "Info"]).del([r]), T(s = t, A, Vs).call(s, e), T(o = t, A, $).call(o, e, `Info.${r}`);
        }), !0);
      },
      ownKeys() {
        var i, r;
        return Object.keys(((r = T(i = t, A, ne).call(i).Entries[e]) == null ? void 0 : r.Info) ?? {});
      },
      getOwnPropertyDescriptor(i, r) {
        var o, a, u;
        if (typeof r != "string")
          return;
        const s = (u = (a = T(o = t, A, ne).call(o).Entries[e]) == null ? void 0 : a.Info) == null ? void 0 : u[r];
        return s !== void 0 ? { configurable: !0, enumerable: !0, value: s } : void 0;
      }
    });
  }
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t != null ? T(this, A, ze).call(this, t) : void 0;
  }
  _outerNoteIdOf(e) {
    var t, i;
    return (i = (t = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : t.outerPlacement) == null ? void 0 : i.outerNoteId;
  }
  _outerNotesOf(e) {
    const t = [];
    let i = this._outerNoteIdOf(e);
    for (; i != null && (t.push(T(this, A, ze).call(this, i)), i !== Xe); )
      i = this._outerNoteIdOf(i);
    return t;
  }
  _outerNoteIdsOf(e) {
    return this._outerNotesOf(e).map((t) => t.Id);
  }
  _innerEntriesOf(e) {
    const t = this, i = T(this, A, ai).call(this, e);
    return new Proxy([], {
      get(r, s) {
        var o;
        if (s === "length")
          return i.length;
        if (s === Symbol.iterator)
          return function* () {
            var a;
            for (let u = 0; u < i.length; u++)
              yield T(a = t, A, jr).call(a, i[u].Id);
          };
        if (typeof s == "string" && !isNaN(Number(s))) {
          const a = Number(s);
          return a >= 0 && a < i.length ? T(o = t, A, jr).call(o, i[a].Id) : void 0;
        }
        return r[s];
      }
    });
  }
  _mayMoveEntryTo(e, t, i) {
    return e === Xe || e === t ? !1 : e === ye || e === Ie ? t === Xe : !T(this, A, ml).call(this, t, e);
  }
  _mayDeleteEntry(e) {
    return e !== Xe && e !== ye && e !== Ie;
  }
  _TargetOf(e) {
    var i;
    const t = (i = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : i.TargetId;
    if (t == null)
      throw new ge("not-found", `link '${e}' has no target`);
    return T(this, A, ze).call(this, t);
  }
  _EntryAsJSON(e) {
    const t = T(this, A, ne).call(this);
    if (t.Entries[e] == null)
      throw new ge("not-found", `entry '${e}' not found`);
    const i = {};
    return T(this, A, Ms).call(this, e, t, i), { Entries: i };
  }
};
W = new WeakMap(), Ur = new WeakMap(), Pt = new WeakMap(), Qe = new WeakMap(), $t = new WeakMap(), ke = new WeakMap(), ct = new WeakMap(), ut = new WeakMap(), Ze = new WeakMap(), He = new WeakMap(), gi = new WeakMap(), en = new WeakMap(), lt = new WeakMap(), tn = new WeakMap(), Rt = new WeakMap(), A = new WeakSet(), //----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//
/**** #view ****/
ne = function() {
  return S(this, W).view();
}, /**** #requireNoteExists ****/
Wt = function(e) {
  const t = T(this, A, ne).call(this);
  if (t.Entries[e] == null || t.Entries[e].Kind !== "note")
    throw new ge("invalid-argument", `note '${e}' does not exist`);
}, /**** #wrap / #wrapNote / #wrapLink ****/
jr = function(e) {
  const i = T(this, A, ne).call(this).Entries[e];
  if (i == null)
    throw new ge("invalid-argument", `entry '${e}' not found`);
  return i.Kind === "note" ? T(this, A, ze).call(this, e) : T(this, A, oi).call(this, e);
}, ze = function(e) {
  const t = S(this, He).get(e);
  if (t instanceof oo)
    return t;
  const i = new oo(this, e);
  return T(this, A, Es).call(this, e, i), i;
}, oi = function(e) {
  const t = S(this, He).get(e);
  if (t instanceof ao)
    return t;
  const i = new ao(this, e);
  return T(this, A, Es).call(this, e, i), i;
}, Es = function(e, t) {
  if (S(this, He).size >= S(this, gi)) {
    const i = S(this, He).keys().next().value;
    i != null && S(this, He).delete(i);
  }
  S(this, He).set(e, t);
}, /**** #rebuildIndices — full rebuild used during construction ****/
pl = function() {
  var t;
  S(this, ke).clear(), S(this, ct).clear(), S(this, ut).clear(), S(this, Ze).clear();
  const e = T(this, A, ne).call(this);
  for (const [i, r] of Object.entries(e.Entries)) {
    const s = (t = r.outerPlacement) == null ? void 0 : t.outerNoteId;
    s != null && T(this, A, Te).call(this, s, i), r.Kind === "link" && r.TargetId != null && T(this, A, Gt).call(this, r.TargetId, i);
  }
}, /**** #updateIndicesFromView — incremental diff update used after remote patches ****/
gl = function() {
  var s;
  const e = T(this, A, ne).call(this).Entries, t = /* @__PURE__ */ new Set();
  for (const [o, a] of Object.entries(e)) {
    t.add(o);
    const u = (s = a.outerPlacement) == null ? void 0 : s.outerNoteId, l = S(this, ct).get(o);
    if (u !== l && (l != null && (T(this, A, Et).call(this, l, o), T(this, A, $).call(this, l, "innerEntryList")), u != null && (T(this, A, Te).call(this, u, o), T(this, A, $).call(this, u, "innerEntryList")), T(this, A, $).call(this, o, "outerNote")), a.Kind === "link") {
      const c = a.TargetId, h = S(this, Ze).get(o);
      c !== h && (h != null && T(this, A, Er).call(this, h, o), c != null && T(this, A, Gt).call(this, c, o));
    } else S(this, Ze).has(o) && T(this, A, Er).call(this, S(this, Ze).get(o), o);
    T(this, A, $).call(this, o, "Label");
  }
  const i = Array.from(S(this, ct).entries()).filter(([o]) => !t.has(o));
  for (const [o, a] of i)
    T(this, A, Et).call(this, a, o), T(this, A, $).call(this, a, "innerEntryList");
  const r = Array.from(S(this, Ze).entries()).filter(([o]) => !t.has(o));
  for (const [o, a] of r)
    T(this, A, Er).call(this, a, o);
}, Te = function(e, t) {
  let i = S(this, ke).get(e);
  i == null && (i = /* @__PURE__ */ new Set(), S(this, ke).set(e, i)), i.add(t), S(this, ct).set(t, e);
}, Et = function(e, t) {
  var i;
  (i = S(this, ke).get(e)) == null || i.delete(t), S(this, ct).delete(t);
}, Gt = function(e, t) {
  let i = S(this, ut).get(e);
  i == null && (i = /* @__PURE__ */ new Set(), S(this, ut).set(e, i)), i.add(t), S(this, Ze).set(t, e);
}, Er = function(e, t) {
  var i;
  (i = S(this, ut).get(e)) == null || i.delete(t), S(this, Ze).delete(t);
}, /**** #orderKeyAt ****/
Xt = function(e, t) {
  const i = T(this, A, ai).call(this, e);
  if (i.length === 0 || t == null) {
    const a = i.length > 0 ? i[i.length - 1].OrderKey : null;
    return Jt(a, null);
  }
  const r = Math.max(0, Math.min(t, i.length)), s = r > 0 ? i[r - 1].OrderKey : null, o = r < i.length ? i[r].OrderKey : null;
  return Jt(s, o);
}, Pr = function(e) {
  const t = T(this, A, ai).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, ai = function(e) {
  var s;
  const t = T(this, A, ne).call(this), i = S(this, ke).get(e) ?? /* @__PURE__ */ new Set(), r = [];
  for (const o of i) {
    const a = (s = t.Entries[o]) == null ? void 0 : s.outerPlacement;
    (a == null ? void 0 : a.outerNoteId) === e && r.push({ Id: o, OrderKey: a.OrderKey });
  }
  return r.sort((o, a) => o.OrderKey < a.OrderKey ? -1 : o.OrderKey > a.OrderKey ? 1 : o.Id < a.Id ? -1 : o.Id > a.Id ? 1 : 0), r;
}, /**** #isProtected — check if a direct TrashNote child is protected ****/
yl = function(e) {
  const t = T(this, A, Rs).call(this), i = /* @__PURE__ */ new Set();
  let r = !0;
  for (; r; ) {
    r = !1;
    for (const s of S(this, ke).get(ye) ?? /* @__PURE__ */ new Set())
      i.has(s) || T(this, A, Ps).call(this, s, t, i) && (i.add(s), r = !0);
  }
  return i.has(e);
}, Ps = function(e, t, i) {
  const r = [e], s = /* @__PURE__ */ new Set();
  for (; r.length > 0; ) {
    const o = r.pop();
    if (s.has(o))
      continue;
    s.add(o);
    const a = S(this, ut).get(o) ?? /* @__PURE__ */ new Set();
    for (const u of a) {
      if (t.has(u))
        return !0;
      const l = T(this, A, vl).call(this, u);
      if (l != null && i.has(l))
        return !0;
    }
    for (const u of S(this, ke).get(o) ?? /* @__PURE__ */ new Set())
      s.has(u) || r.push(u);
  }
  return !1;
}, vl = function(e) {
  let t = e;
  for (; t != null; ) {
    const i = this._outerNoteIdOf(t);
    if (i === ye)
      return t;
    if (i === Xe || i == null)
      return null;
    t = i;
  }
  return null;
}, Rs = function() {
  const e = /* @__PURE__ */ new Set(), t = [Xe];
  for (; t.length > 0; ) {
    const i = t.pop();
    if (!e.has(i)) {
      e.add(i);
      for (const r of S(this, ke).get(i) ?? /* @__PURE__ */ new Set())
        e.has(r) || t.push(r);
    }
  }
  return e;
}, /**** #purgeSubtree ****/
Ls = function(e) {
  var u;
  const i = T(this, A, ne).call(this).Entries[e];
  if (i == null)
    return;
  const r = T(this, A, Rs).call(this), s = /* @__PURE__ */ new Set(), o = Array.from(S(this, ke).get(e) ?? /* @__PURE__ */ new Set());
  for (const l of o)
    if (T(this, A, Ps).call(this, l, r, s)) {
      const c = Jt(T(this, A, Pr).call(this, ye), null);
      S(this, W).api.val(["Entries", l, "outerPlacement"]).set({ outerNoteId: ye, OrderKey: c }), T(this, A, Et).call(this, e, l), T(this, A, Te).call(this, ye, l), T(this, A, $).call(this, ye, "innerEntryList"), T(this, A, $).call(this, l, "outerNote");
    } else
      T(this, A, Ls).call(this, l);
  S(this, W).api.obj(["Entries"]).del([e]);
  const a = (u = i.outerPlacement) == null ? void 0 : u.outerNoteId;
  a != null && (T(this, A, Et).call(this, a, e), T(this, A, $).call(this, a, "innerEntryList")), i.Kind === "link" && i.TargetId != null && T(this, A, Er).call(this, i.TargetId, e), S(this, He).delete(e);
}, /**** #ensureInfoExists — creates the Info obj node if it has been removed ****/
Bs = function(e) {
  var t;
  ((t = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : t.Info) == null && S(this, W).api.obj(["Entries", e]).set({ Info: q.s.obj({}) });
}, /**** #removeInfoIfEmpty — removes the Info obj node when it is empty ****/
Vs = function(e) {
  var i;
  const t = (i = T(this, A, ne).call(this).Entries[e]) == null ? void 0 : i.Info;
  t != null && Object.keys(t).length === 0 && S(this, W).api.obj(["Entries", e]).del(["Info"]);
}, /**** #recordChange ****/
$ = function(e, t) {
  S(this, lt)[e] == null && (S(this, lt)[e] = /* @__PURE__ */ new Set()), S(this, lt)[e].add(t);
}, /**** #notifyHandlers ****/
bl = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const i of S(this, $t))
      try {
        i(e, t);
      } catch {
      }
}, Ms = function(e, t, i) {
  i[e] = t.Entries[e];
  for (const r of S(this, ke).get(e) ?? /* @__PURE__ */ new Set())
    T(this, A, Ms).call(this, r, t, i);
}, ml = function(e, t) {
  let i = e;
  for (; i != null; ) {
    if (i === t)
      return !0;
    i = this._outerNoteIdOf(i);
  }
  return !1;
};
let Dc = Vr;
const qc = 1, Uc = 2, Fc = 3, zc = 4, Zc = 5, Fe = 32, si = 1024 * 1024;
function bs(...n) {
  const e = n.reduce((r, s) => r + s.byteLength, 0), t = new Uint8Array(e);
  let i = 0;
  for (const r of n)
    t.set(r, i), i += r.byteLength;
  return t;
}
function Ir(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function Hc(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function Jc(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var $e, et, Fr, nn, Lt, rn, Bt, sn, on, an, zr, fe, Ds, Yt, Rr, wl, _l, kl;
class Lf {
  /**** constructor ****/
  constructor(e) {
    D(this, fe);
    On(this, "StoreID");
    D(this, $e, "disconnected");
    D(this, et, null);
    D(this, Fr, "");
    D(this, nn, null);
    D(this, Lt, null);
    D(this, rn, /* @__PURE__ */ new Set());
    D(this, Bt, /* @__PURE__ */ new Set());
    D(this, sn, /* @__PURE__ */ new Set());
    D(this, on, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    D(this, an, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    D(this, zr, /* @__PURE__ */ new Map());
    this.StoreID = e;
  }
  //----------------------------------------------------------------------------//
  //                             SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, $e);
  }
  /**** connect ****/
  async connect(e, t) {
    return z(this, Fr, e), z(this, nn, t), T(this, fe, Ds).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    T(this, fe, _l).call(this), T(this, fe, Rr).call(this, "disconnected"), (e = S(this, et)) == null || e.close(), z(this, et, null);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    T(this, fe, Yt).call(this, Ir(qc, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const i = Hc(e);
    if (t.byteLength <= si)
      T(this, fe, Yt).call(this, Ir(Uc, bs(i, t)));
    else {
      const r = Math.ceil(t.byteLength / si);
      for (let s = 0; s < r; s++) {
        const o = s * si, a = t.slice(o, o + si), u = new Uint8Array(Fe + 8);
        u.set(i, 0), new DataView(u.buffer).setUint32(Fe, s, !1), new DataView(u.buffer).setUint32(Fe + 4, r, !1), T(this, fe, Yt).call(this, Ir(Zc, bs(u, a)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    T(this, fe, Yt).call(this, Ir(Fc, Hc(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return S(this, rn).add(e), () => {
      S(this, rn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return S(this, Bt).add(e), () => {
      S(this, Bt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, sn).add(e), () => {
      S(this, sn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SNS_PresenceProvider                             //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    T(this, fe, Yt).call(this, Ir(zc, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return S(this, on).add(e), () => {
      S(this, on).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return S(this, zr);
  }
}
$e = new WeakMap(), et = new WeakMap(), Fr = new WeakMap(), nn = new WeakMap(), Lt = new WeakMap(), rn = new WeakMap(), Bt = new WeakMap(), sn = new WeakMap(), on = new WeakMap(), an = new WeakMap(), zr = new WeakMap(), fe = new WeakSet(), /**** #doConnect ****/
Ds = function() {
  return new Promise((e, t) => {
    const i = `${S(this, Fr)}?token=${encodeURIComponent(S(this, nn).Token)}`, r = new WebSocket(i);
    r.binaryType = "arraybuffer", z(this, et, r), T(this, fe, Rr).call(this, "connecting"), r.onopen = () => {
      T(this, fe, Rr).call(this, "connected"), e();
    }, r.onerror = (s) => {
      S(this, $e) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      z(this, et, null), S(this, $e) !== "disconnected" && (T(this, fe, Rr).call(this, "reconnecting"), T(this, fe, wl).call(this));
    }, r.onmessage = (s) => {
      T(this, fe, kl).call(this, new Uint8Array(s.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
Yt = function(e) {
  var t;
  ((t = S(this, et)) == null ? void 0 : t.readyState) === WebSocket.OPEN && S(this, et).send(e);
}, /**** #setState ****/
Rr = function(e) {
  if (S(this, $e) !== e) {
    z(this, $e, e);
    for (const t of S(this, sn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
wl = function() {
  var t;
  const e = ((t = S(this, nn)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  z(this, Lt, setTimeout(() => {
    S(this, $e) === "reconnecting" && T(this, fe, Ds).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
_l = function() {
  S(this, Lt) != null && (clearTimeout(S(this, Lt)), z(this, Lt, null));
}, /**** #handleFrame ****/
kl = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], i = e.slice(1);
  switch (t) {
    case qc: {
      for (const r of S(this, rn))
        try {
          r(i);
        } catch {
        }
      break;
    }
    case Uc: {
      if (i.byteLength < Fe)
        return;
      const r = Jc(i.slice(0, Fe)), s = i.slice(Fe);
      for (const o of S(this, Bt))
        try {
          o(r, s);
        } catch {
        }
      break;
    }
    case Fc:
      break;
    case zc: {
      try {
        const r = JSON.parse(new TextDecoder().decode(i));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), S(this, zr).set(r.PeerId, r);
        for (const s of S(this, on))
          try {
            s(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case Zc: {
      if (i.byteLength < Fe + 8)
        return;
      const r = Jc(i.slice(0, Fe)), s = new DataView(i.buffer, i.byteOffset + Fe, 8), o = s.getUint32(0, !1), a = s.getUint32(4, !1), u = i.slice(Fe + 8);
      let l = S(this, an).get(r);
      if (l == null && (l = { total: a, chunks: /* @__PURE__ */ new Map() }, S(this, an).set(r, l)), l.chunks.set(o, u), l.chunks.size === l.total) {
        const c = bs(
          ...Array.from({ length: l.total }, (h, y) => l.chunks.get(y))
        );
        S(this, an).delete(r);
        for (const h of S(this, Bt))
          try {
            h(r, c);
          } catch {
          }
      }
      break;
    }
  }
};
var Zr, Ve, me, ht, Je, Me, dt, cn, un, ln, Vt, hn, xe, te, Lr, Br, Sl, xl, Ol, qs, Us, Nl, Fs, Cl;
class Bf {
  /**** constructor ****/
  constructor(e, t = {}) {
    D(this, te);
    On(this, "StoreID");
    D(this, Zr);
    D(this, Ve, crypto.randomUUID());
    D(this, me);
    /**** Signalling WebSocket ****/
    D(this, ht, null);
    /**** Active RTCPeerConnection per remote PeerId ****/
    D(this, Je, /* @__PURE__ */ new Map());
    D(this, Me, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    D(this, dt, "disconnected");
    /**** Event handlers ****/
    D(this, cn, /* @__PURE__ */ new Set());
    D(this, un, /* @__PURE__ */ new Set());
    D(this, ln, /* @__PURE__ */ new Set());
    D(this, Vt, /* @__PURE__ */ new Set());
    /**** Presence peer set ****/
    D(this, hn, /* @__PURE__ */ new Map());
    /**** Fallback mode ****/
    D(this, xe, !1);
    this.StoreID = e, z(this, Zr, t), z(this, me, t.Fallback ?? null);
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, dt);
  }
  /**** connect ****/
  async connect(e, t) {
    return new Promise((i, r) => {
      const s = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(s);
      z(this, ht, o), T(this, te, Lr).call(this, "connecting"), o.onopen = () => {
        T(this, te, Lr).call(this, "connected"), T(this, te, Br).call(this, { type: "hello", from: S(this, Ve) }), i();
      }, o.onerror = () => {
        if (!S(this, xe) && S(this, me) != null) {
          const a = e.replace("/signal/", "/ws/");
          z(this, xe, !0), S(this, me).connect(a, t).then(i).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        S(this, dt) !== "disconnected" && (T(this, te, Lr).call(this, "reconnecting"), setTimeout(() => {
          S(this, dt) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (a) => {
        try {
          const u = JSON.parse(a.data);
          T(this, te, Sl).call(this, u, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    T(this, te, Lr).call(this, "disconnected"), (e = S(this, ht)) == null || e.close(), z(this, ht, null);
    for (const t of S(this, Je).values())
      t.close();
    S(this, Je).clear(), S(this, Me).clear(), S(this, xe) && S(this, me) != null && (S(this, me).disconnect(), z(this, xe, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var i;
    if (S(this, xe)) {
      (i = S(this, me)) == null || i.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of S(this, Me).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var s;
    if (S(this, xe)) {
      (s = S(this, me)) == null || s.sendValue(e, t);
      return;
    }
    const i = T(this, te, Fs).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(i, 1), r.set(t, 33);
    for (const o of S(this, Me).values())
      if (o.readyState === "open")
        try {
          o.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (S(this, xe)) {
      (r = S(this, me)) == null || r.requestValue(e);
      return;
    }
    const t = T(this, te, Fs).call(this, e), i = new Uint8Array(33);
    i[0] = 3, i.set(t, 1);
    for (const s of S(this, Me).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return S(this, cn).add(e), S(this, xe) && S(this, me) != null ? S(this, me).onPatch(e) : () => {
      S(this, cn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return S(this, un).add(e), S(this, xe) && S(this, me) != null ? S(this, me).onValue(e) : () => {
      S(this, un).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, ln).add(e), () => {
      S(this, ln).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (S(this, xe)) {
      (r = S(this, me)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), i = new Uint8Array(1 + t.byteLength);
    i[0] = 4, i.set(t, 1);
    for (const s of S(this, Me).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return S(this, Vt).add(e), () => {
      S(this, Vt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return S(this, hn);
  }
}
Zr = new WeakMap(), Ve = new WeakMap(), me = new WeakMap(), ht = new WeakMap(), Je = new WeakMap(), Me = new WeakMap(), dt = new WeakMap(), cn = new WeakMap(), un = new WeakMap(), ln = new WeakMap(), Vt = new WeakMap(), hn = new WeakMap(), xe = new WeakMap(), te = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
Lr = function(e) {
  if (S(this, dt) !== e) {
    z(this, dt, e);
    for (const t of S(this, ln))
      try {
        t(e);
      } catch {
      }
  }
}, Br = function(e) {
  var t;
  ((t = S(this, ht)) == null ? void 0 : t.readyState) === WebSocket.OPEN && S(this, ht).send(JSON.stringify(e));
}, Sl = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === S(this, Ve))
        return;
      S(this, Je).has(e.from) || await T(this, te, xl).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== S(this, Ve))
        return;
      await T(this, te, Ol).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== S(this, Ve))
        return;
      const i = S(this, Je).get(e.from);
      i != null && await i.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== S(this, Ve))
        return;
      const i = S(this, Je).get(e.from);
      i != null && await i.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, xl = async function(e) {
  const t = T(this, te, qs).call(this, e), i = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  T(this, te, Us).call(this, i, e), S(this, Me).set(e, i);
  const r = await t.createOffer();
  await t.setLocalDescription(r), T(this, te, Br).call(this, { type: "offer", from: S(this, Ve), to: e, sdp: r });
}, Ol = async function(e, t) {
  const i = T(this, te, qs).call(this, e);
  await i.setRemoteDescription(new RTCSessionDescription(t));
  const r = await i.createAnswer();
  await i.setLocalDescription(r), T(this, te, Br).call(this, { type: "answer", from: S(this, Ve), to: e, sdp: r });
}, qs = function(e) {
  const t = S(this, Zr).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], i = new RTCPeerConnection({ iceServers: t });
  return S(this, Je).set(e, i), i.onicecandidate = (r) => {
    r.candidate != null && T(this, te, Br).call(this, {
      type: "candidate",
      from: S(this, Ve),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, i.ondatachannel = (r) => {
    T(this, te, Us).call(this, r.channel, e), S(this, Me).set(e, r.channel);
  }, i.onconnectionstatechange = () => {
    if (i.connectionState === "failed" || i.connectionState === "closed") {
      S(this, Je).delete(e), S(this, Me).delete(e), S(this, hn).delete(e);
      for (const r of S(this, Vt))
        try {
          r(e, null);
        } catch {
        }
    }
  }, i;
}, Us = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (i) => {
    const r = new Uint8Array(i.data);
    T(this, te, Nl).call(this, r, t);
  };
}, Nl = function(e, t) {
  if (e.byteLength < 1)
    return;
  const i = e[0], r = e.slice(1);
  switch (i) {
    case 1: {
      for (const s of S(this, cn))
        try {
          s(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const s = T(this, te, Cl).call(this, r.slice(0, 32)), o = r.slice(32);
      for (const a of S(this, un))
        try {
          a(s, o);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const s = JSON.parse(new TextDecoder().decode(r));
        if (typeof s.PeerId != "string")
          break;
        s.lastSeen = Date.now(), S(this, hn).set(s.PeerId, s);
        for (const o of S(this, Vt))
          try {
            o(s.PeerId, s);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, Fs = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let i = 0; i < e.length; i += 2)
    t[i / 2] = parseInt(e.slice(i, i + 2), 16);
  return t;
}, Cl = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Le(n) {
  return new Promise((e, t) => {
    n.onsuccess = () => {
      e(n.result);
    }, n.onerror = () => {
      t(n.error);
    };
  });
}
function ot(n, e, t) {
  return n.transaction(e, t);
}
var tt, De, Hr, qe, Ye;
class Vf {
  /**** constructor ****/
  constructor(e) {
    D(this, qe);
    D(this, tt, null);
    D(this, De);
    D(this, Hr);
    z(this, De, e), z(this, Hr, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await T(this, qe, Ye).call(this), t = ot(e, ["snapshots"], "readonly"), i = await Le(
      t.objectStore("snapshots").get(S(this, De))
    );
    return i != null ? i.data : null;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await T(this, qe, Ye).call(this), i = ot(t, ["snapshots"], "readwrite");
    await Le(
      i.objectStore("snapshots").put({
        storeId: S(this, De),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await T(this, qe, Ye).call(this), r = ot(t, ["patches"], "readonly").objectStore("patches"), s = IDBKeyRange.bound(
      [S(this, De), e + 1],
      [S(this, De), Number.MAX_SAFE_INTEGER]
    );
    return (await Le(
      r.getAll(s)
    )).sort((a, u) => a.clock - u.clock).map((a) => a.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const i = await T(this, qe, Ye).call(this), r = ot(i, ["patches"], "readwrite");
    try {
      await Le(
        r.objectStore("patches").add({
          storeId: S(this, De),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await T(this, qe, Ye).call(this), r = ot(t, ["patches"], "readwrite").objectStore("patches"), s = IDBKeyRange.bound(
      [S(this, De), 0],
      [S(this, De), e - 1]
    );
    await new Promise((o, a) => {
      const u = r.openCursor(s);
      u.onsuccess = () => {
        const l = u.result;
        if (l == null) {
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
    const t = await T(this, qe, Ye).call(this), i = ot(t, ["values"], "readonly"), r = await Le(
      i.objectStore("values").get(e)
    );
    return r != null ? r.data : null;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const i = await T(this, qe, Ye).call(this), s = ot(i, ["values"], "readwrite").objectStore("values"), o = await Le(
      s.get(e)
    );
    o != null ? await Le(
      s.put({ hash: e, data: o.data, ref_count: o.ref_count + 1 })
    ) : await Le(
      s.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await T(this, qe, Ye).call(this), r = ot(t, ["values"], "readwrite").objectStore("values"), s = await Le(
      r.get(e)
    );
    if (s == null)
      return;
    const o = s.ref_count - 1;
    o <= 0 ? await Le(r.delete(e)) : await Le(
      r.put({ hash: e, data: s.data, ref_count: o })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = S(this, tt)) == null || e.close(), z(this, tt, null);
  }
}
tt = new WeakMap(), De = new WeakMap(), Hr = new WeakMap(), qe = new WeakSet(), Ye = async function() {
  return S(this, tt) != null ? S(this, tt) : new Promise((e, t) => {
    const i = indexedDB.open(S(this, Hr), 1);
    i.onupgradeneeded = (r) => {
      const s = r.target.result;
      s.objectStoreNames.contains("snapshots") || s.createObjectStore("snapshots", { keyPath: "storeId" }), s.objectStoreNames.contains("patches") || s.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), s.objectStoreNames.contains("values") || s.createObjectStore("values", { keyPath: "hash" });
    }, i.onsuccess = (r) => {
      z(this, tt, r.target.result), e(S(this, tt));
    }, i.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const ff = 512 * 1024;
var Oe, _e, de, ft, dn, fn, Jr, Kr, Mt, pn, pt, gn, Dt, qt, Ut, nt, gt, Ue, Wr, yn, rt, ae, Il, Tl, Al, jl, El, zs, Pl, Rl, Ll, Bl, Zs;
class Mf {
  //----------------------------------------------------------------------------//
  //                               Construction                                  //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    D(this, ae);
    D(this, Oe);
    D(this, _e);
    D(this, de);
    D(this, ft);
    D(this, dn);
    On(this, "PeerId", crypto.randomUUID());
    D(this, fn, null);
    D(this, Jr, null);
    // outgoing patch queue (patches created while disconnected)
    D(this, Kr, []);
    // accumulated patch bytes since last checkpoint
    D(this, Mt, 0);
    // sequence number of the last saved snapshot
    D(this, pn, 0);
    // current patch sequence number (append-monotonic counter, managed by SyncEngine)
    D(this, pt, 0);
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    D(this, gn, new Uint8Array(0));
    // heartbeat timer
    D(this, Dt, null);
    D(this, qt, null);
    // presence peer tracking
    D(this, Ut, /* @__PURE__ */ new Map());
    D(this, nt, /* @__PURE__ */ new Map());
    D(this, gt, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    D(this, Ue, null);
    // connection state mirror
    D(this, Wr, "disconnected");
    D(this, yn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    D(this, rt, []);
    z(this, Oe, e), z(this, _e, t.PersistenceProvider ?? null), z(this, de, t.NetworkProvider ?? null), z(this, ft, t.PresenceProvider ?? t.NetworkProvider ?? null), z(this, dn, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && S(this, de) != null && z(this, Ue, new BroadcastChannel(`sns:${S(this, de).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                               Lifecycle                                     //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await T(this, ae, Il).call(this), T(this, ae, Tl).call(this), T(this, ae, Al).call(this), T(this, ae, jl).call(this), T(this, ae, El).call(this), S(this, de) != null && S(this, de).onConnectionChange((e) => {
      z(this, Wr, e);
      for (const t of S(this, yn))
        try {
          t(e);
        } catch {
        }
      e === "connected" && T(this, ae, Pl).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, i;
    S(this, Dt) != null && (clearInterval(S(this, Dt)), z(this, Dt, null));
    for (const r of S(this, nt).values())
      clearTimeout(r);
    S(this, nt).clear();
    for (const r of S(this, rt))
      try {
        r();
      } catch {
      }
    z(this, rt, []), (e = S(this, Ue)) == null || e.close(), z(this, Ue, null), (t = S(this, de)) == null || t.disconnect(), S(this, _e) != null && S(this, Mt) > 0 && await T(this, ae, zs).call(this), await ((i = S(this, _e)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                            Network connection                               //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (S(this, de) == null)
      throw new ge("no-network-provider", "no NetworkProvider configured");
    z(this, fn, e), z(this, Jr, t), await S(this, de).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (S(this, de) == null)
      throw new ge("no-network-provider", "no NetworkProvider configured");
    S(this, de).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (S(this, de) == null)
      throw new ge("no-network-provider", "no NetworkProvider configured");
    if (S(this, fn) == null)
      throw new ge(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await S(this, de).connect(S(this, fn), S(this, Jr));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return S(this, Wr);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return S(this, yn).add(e), () => {
      S(this, yn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                Presence                                     //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var i, r;
    z(this, qt, e);
    const t = { ...e, PeerId: this.PeerId };
    (i = S(this, ft)) == null || i.sendLocalState(e), (r = S(this, Ue)) == null || r.postMessage({ type: "presence", payload: e });
    for (const s of S(this, gt))
      try {
        s(this.PeerId, t, "local");
      } catch {
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return S(this, Ut);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return S(this, gt).add(e), () => {
      S(this, gt).delete(e);
    };
  }
}
Oe = new WeakMap(), _e = new WeakMap(), de = new WeakMap(), ft = new WeakMap(), dn = new WeakMap(), fn = new WeakMap(), Jr = new WeakMap(), Kr = new WeakMap(), Mt = new WeakMap(), pn = new WeakMap(), pt = new WeakMap(), gn = new WeakMap(), Dt = new WeakMap(), qt = new WeakMap(), Ut = new WeakMap(), nt = new WeakMap(), gt = new WeakMap(), Ue = new WeakMap(), Wr = new WeakMap(), yn = new WeakMap(), rt = new WeakMap(), ae = new WeakSet(), Il = async function() {
  if (S(this, _e) == null)
    return;
  const e = await S(this, _e).loadSnapshot();
  if (e != null)
    try {
      const i = S(this, Oe).constructor.fromBinary(e);
    } catch {
    }
  const t = await S(this, _e).loadPatchesSince(S(this, pn));
  for (const i of t)
    try {
      S(this, Oe).applyRemotePatch(i);
    } catch {
    }
  t.length > 0 && z(this, pt, S(this, pn) + t.length), z(this, gn, S(this, Oe).currentCursor);
}, //----------------------------------------------------------------------------//
//                           Private — Wiring                                  //
//----------------------------------------------------------------------------//
Tl = function() {
  const e = S(this, Oe).onChangeInvoke((t, i) => {
    var o, a;
    if (t !== "internal")
      return;
    const r = S(this, gn);
    Qr(this, pt)._++;
    const s = S(this, Oe).exportPatch(r);
    z(this, gn, S(this, Oe).currentCursor), s.byteLength !== 0 && (S(this, _e) != null && (S(this, _e).appendPatch(s, S(this, pt)).catch(() => {
    }), z(this, Mt, S(this, Mt) + s.byteLength), S(this, Mt) >= ff && T(this, ae, zs).call(this).catch(() => {
    })), ((o = S(this, de)) == null ? void 0 : o.ConnectionState) === "connected" ? (S(this, de).sendPatch(s), (a = S(this, Ue)) == null || a.postMessage({ type: "patch", payload: s })) : S(this, Kr).push(s), T(this, ae, Rl).call(this, i).catch(() => {
    }));
  });
  S(this, rt).push(e);
}, Al = function() {
  if (S(this, de) != null) {
    const t = S(this, de).onPatch((r) => {
      try {
        S(this, Oe).applyRemotePatch(r);
      } catch {
      }
    });
    S(this, rt).push(t);
    const i = S(this, de).onValue(async (r, s) => {
      var o;
      await ((o = S(this, _e)) == null ? void 0 : o.saveValue(r, s));
    });
    S(this, rt).push(i);
  }
  const e = S(this, ft);
  if (e != null) {
    const t = e.onRemoteState((i, r) => {
      T(this, ae, Ll).call(this, i, r);
    });
    S(this, rt).push(t);
  }
}, jl = function() {
  const e = S(this, dn) / 4;
  z(this, Dt, setInterval(() => {
    var t, i;
    S(this, qt) != null && ((t = S(this, ft)) == null || t.sendLocalState(S(this, qt)), (i = S(this, Ue)) == null || i.postMessage({ type: "presence", payload: S(this, qt) }));
  }, e));
}, El = function() {
  S(this, Ue) != null && (S(this, Ue).onmessage = (e) => {
    var i;
    const t = e.data;
    if (t.type === "patch")
      try {
        S(this, Oe).applyRemotePatch(t.payload);
      } catch {
      }
    else t.type === "presence" && ((i = S(this, ft)) == null || i.sendLocalState(t.payload));
  });
}, zs = async function() {
  S(this, _e) != null && (await S(this, _e).saveSnapshot(S(this, Oe).asBinary()), await S(this, _e).prunePatches(S(this, pt)), z(this, pn, S(this, pt)), z(this, Mt, 0));
}, //----------------------------------------------------------------------------//
//                       Private — Offline queue flush                         //
//----------------------------------------------------------------------------//
Pl = function() {
  var t;
  const e = S(this, Kr).splice(0);
  for (const i of e)
    try {
      (t = S(this, de)) == null || t.sendPatch(i);
    } catch {
    }
}, Rl = async function(e) {
  for (const [t, i] of Object.entries(e))
    i.has("Value") && S(this, de) != null;
}, //----------------------------------------------------------------------------//
//                        Private — Remote presence                            //
//----------------------------------------------------------------------------//
Ll = function(e, t) {
  if (t == null) {
    T(this, ae, Zs).call(this, e);
    return;
  }
  const i = { ...t, _lastSeen: Date.now() };
  S(this, Ut).set(e, i), T(this, ae, Bl).call(this, e);
  for (const r of S(this, gt))
    try {
      r(e, t, "remote");
    } catch {
    }
}, Bl = function(e) {
  const t = S(this, nt).get(e);
  t != null && clearTimeout(t);
  const i = setTimeout(
    () => {
      T(this, ae, Zs).call(this, e);
    },
    S(this, dn)
  );
  S(this, nt).set(e, i);
}, Zs = function(e) {
  if (!S(this, Ut).has(e))
    return;
  S(this, Ut).delete(e);
  const t = S(this, nt).get(e);
  t != null && (clearTimeout(t), S(this, nt).delete(e));
  for (const i of S(this, gt))
    try {
      i(e, void 0, "remote");
    } catch {
    }
};
export {
  Vf as SNS_BrowserPersistenceProvider,
  Kc as SNS_Entry,
  ge as SNS_Error,
  ao as SNS_Link,
  oo as SNS_Note,
  Dc as SNS_NoteStore,
  Mf as SNS_SyncEngine,
  Bf as SNS_WebRTCProvider,
  Lf as SNS_WebSocketProvider
};
