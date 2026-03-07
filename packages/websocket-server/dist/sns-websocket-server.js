import { Hono as fe } from "hono";
import { serve as pe } from "@hono/node-server";
import { createNodeWebSocket as de } from "@hono/node-ws";
import { jwtVerify as he, SignJWT as ye } from "jose";
import be from "node:path";
function ge(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
function we(r) {
  if (Object.prototype.hasOwnProperty.call(r, "__esModule")) return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function s() {
      return this instanceof s ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(s) {
    var a = Object.getOwnPropertyDescriptor(r, s);
    Object.defineProperty(t, s, a.get ? a : {
      enumerable: !0,
      get: function() {
        return r[s];
      }
    });
  }), t;
}
var j = { exports: {} };
function ce(r) {
  throw new Error('Could not dynamically require "' + r + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
const Ee = {}, me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ee
}, Symbol.toStringTag, { value: "Module" })), _ = /* @__PURE__ */ we(me);
var R = {}, z;
function v() {
  return z || (z = 1, R.getBooleanOption = (r, e) => {
    let t = !1;
    if (e in r && typeof (t = r[e]) != "boolean")
      throw new TypeError(`Expected the "${e}" option to be a boolean`);
    return t;
  }, R.cppdb = Symbol(), R.inspect = Symbol.for("nodejs.util.inspect.custom")), R;
}
var A, H;
function ue() {
  if (H) return A;
  H = 1;
  const r = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function e(t, s) {
    if (new.target !== e)
      return new e(t, s);
    if (typeof s != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, t), r.value = "" + t, Object.defineProperty(this, "message", r), Error.captureStackTrace(this, e), this.code = s;
  }
  return Object.setPrototypeOf(e, Error), Object.setPrototypeOf(e.prototype, Error.prototype), Object.defineProperty(e.prototype, "name", r), A = e, A;
}
var x = { exports: {} }, k, G;
function Te() {
  if (G) return k;
  G = 1;
  var r = _.sep || "/";
  k = e;
  function e(t) {
    if (typeof t != "string" || t.length <= 7 || t.substring(0, 7) != "file://")
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    var s = decodeURI(t.substring(7)), a = s.indexOf("/"), n = s.substring(0, a), i = s.substring(a + 1);
    return n == "localhost" && (n = ""), n && (n = r + r + n), i = i.replace(/^(.+)\|/, "$1:"), r == "\\" && (i = i.replace(/\//g, "\\")), /^.+\:/.test(i) || (i = r + i), n + i;
  }
  return k;
}
var X;
function Se() {
  return X || (X = 1, (function(r, e) {
    var t = _, s = _, a = Te(), n = s.join, i = s.dirname, f = t.accessSync && function(y) {
      try {
        t.accessSync(y);
      } catch {
        return !1;
      }
      return !0;
    } || t.existsSync || s.existsSync, d = {
      arrow: process.env.NODE_BINDINGS_ARROW || " → ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function w(y) {
      typeof y == "string" ? y = { bindings: y } : y || (y = {}), Object.keys(d).map(function(h) {
        h in y || (y[h] = d[h]);
      }), y.module_root || (y.module_root = e.getRoot(e.getFileName())), s.extname(y.bindings) != ".node" && (y.bindings += ".node");
      for (var g = typeof __webpack_require__ == "function" ? __non_webpack_require__ : ce, c = [], u = 0, o = y.try.length, l, b, p; u < o; u++) {
        l = n.apply(
          null,
          y.try[u].map(function(h) {
            return y[h] || h;
          })
        ), c.push(l);
        try {
          return b = y.path ? g.resolve(l) : g(l), y.path || (b.path = l), b;
        } catch (h) {
          if (h.code !== "MODULE_NOT_FOUND" && h.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(h.message))
            throw h;
        }
      }
      throw p = new Error(
        `Could not locate the bindings file. Tried:
` + c.map(function(h) {
          return y.arrow + h;
        }).join(`
`)
      ), p.tries = c, p;
    }
    r.exports = e = w, e.getFileName = function(g) {
      var c = Error.prepareStackTrace, u = Error.stackTraceLimit, o = {}, l;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(p, h) {
        for (var E = 0, T = h.length; E < T; E++)
          if (l = h[E].getFileName(), l !== __filename)
            if (g) {
              if (l !== g)
                return;
            } else
              return;
      }, Error.captureStackTrace(o), o.stack, Error.prepareStackTrace = c, Error.stackTraceLimit = u;
      var b = "file://";
      return l.indexOf(b) === 0 && (l = a(l)), l;
    }, e.getRoot = function(g) {
      for (var c = i(g), u; ; ) {
        if (c === "." && (c = process.cwd()), f(n(c, "package.json")) || f(n(c, "node_modules")))
          return c;
        if (u === c)
          throw new Error(
            'Could not find module root given file: "' + g + '". Do you have a `package.json` file? '
          );
        u = c, c = n(c, "..");
      }
    };
  })(x, x.exports)), x.exports;
}
var S = {}, Y;
function ve() {
  if (Y) return S;
  Y = 1;
  const { cppdb: r } = v();
  return S.prepare = function(t) {
    return this[r].prepare(t, this, !1);
  }, S.exec = function(t) {
    return this[r].exec(t), this;
  }, S.close = function() {
    return this[r].close(), this;
  }, S.loadExtension = function(...t) {
    return this[r].loadExtension(...t), this;
  }, S.defaultSafeIntegers = function(...t) {
    return this[r].defaultSafeIntegers(...t), this;
  }, S.unsafeMode = function(...t) {
    return this[r].unsafeMode(...t), this;
  }, S.getters = {
    name: {
      get: function() {
        return this[r].name;
      },
      enumerable: !0
    },
    open: {
      get: function() {
        return this[r].open;
      },
      enumerable: !0
    },
    inTransaction: {
      get: function() {
        return this[r].inTransaction;
      },
      enumerable: !0
    },
    readonly: {
      get: function() {
        return this[r].readonly;
      },
      enumerable: !0
    },
    memory: {
      get: function() {
        return this[r].memory;
      },
      enumerable: !0
    }
  }, S;
}
var q, J;
function _e() {
  if (J) return q;
  J = 1;
  const { cppdb: r } = v(), e = /* @__PURE__ */ new WeakMap();
  q = function(n) {
    if (typeof n != "function") throw new TypeError("Expected first argument to be a function");
    const i = this[r], f = t(i, this), { apply: d } = Function.prototype, w = {
      default: { value: s(d, n, i, f.default) },
      deferred: { value: s(d, n, i, f.deferred) },
      immediate: { value: s(d, n, i, f.immediate) },
      exclusive: { value: s(d, n, i, f.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(w.default.value, w), Object.defineProperties(w.deferred.value, w), Object.defineProperties(w.immediate.value, w), Object.defineProperties(w.exclusive.value, w), w.default.value;
  };
  const t = (a, n) => {
    let i = e.get(a);
    if (!i) {
      const f = {
        commit: a.prepare("COMMIT", n, !1),
        rollback: a.prepare("ROLLBACK", n, !1),
        savepoint: a.prepare("SAVEPOINT `	_bs3.	`", n, !1),
        release: a.prepare("RELEASE `	_bs3.	`", n, !1),
        rollbackTo: a.prepare("ROLLBACK TO `	_bs3.	`", n, !1)
      };
      e.set(a, i = {
        default: Object.assign({ begin: a.prepare("BEGIN", n, !1) }, f),
        deferred: Object.assign({ begin: a.prepare("BEGIN DEFERRED", n, !1) }, f),
        immediate: Object.assign({ begin: a.prepare("BEGIN IMMEDIATE", n, !1) }, f),
        exclusive: Object.assign({ begin: a.prepare("BEGIN EXCLUSIVE", n, !1) }, f)
      });
    }
    return i;
  }, s = (a, n, i, { begin: f, commit: d, rollback: w, savepoint: y, release: g, rollbackTo: c }) => function() {
    let o, l, b;
    i.inTransaction ? (o = y, l = g, b = c) : (o = f, l = d, b = w), o.run();
    try {
      const p = a.call(n, this, arguments);
      return l.run(), p;
    } catch (p) {
      throw i.inTransaction && (b.run(), b !== w && l.run()), p;
    }
  };
  return q;
}
var L, K;
function Oe() {
  if (K) return L;
  K = 1;
  const { getBooleanOption: r, cppdb: e } = v();
  return L = function(s, a) {
    if (a == null && (a = {}), typeof s != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof a != "object") throw new TypeError("Expected second argument to be an options object");
    const n = r(a, "simple"), i = this[e].prepare(`PRAGMA ${s}`, this, !0);
    return n ? i.pluck().get() : i.all();
  }, L;
}
var D, Z;
function Ie() {
  if (Z) return D;
  Z = 1;
  const r = _, e = _, { promisify: t } = _, { cppdb: s } = v(), a = t(r.access);
  D = async function(f, d) {
    if (d == null && (d = {}), typeof f != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof d != "object") throw new TypeError("Expected second argument to be an options object");
    f = f.trim();
    const w = "attached" in d ? d.attached : "main", y = "progress" in d ? d.progress : null;
    if (!f) throw new TypeError("Backup filename cannot be an empty string");
    if (f === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof w != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!w) throw new TypeError('The "attached" option cannot be an empty string');
    if (y != null && typeof y != "function") throw new TypeError('Expected the "progress" option to be a function');
    await a(e.dirname(f)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const g = await a(f).then(() => !1, () => !0);
    return n(this[s].backup(this, w, f, g), y || null);
  };
  const n = (i, f) => {
    let d = 0, w = !0;
    return new Promise((y, g) => {
      setImmediate(function c() {
        try {
          const u = i.transfer(d);
          if (!u.remainingPages) {
            i.close(), y(u);
            return;
          }
          if (w && (w = !1, d = 100), f) {
            const o = f(u);
            if (o !== void 0)
              if (typeof o == "number" && o === o) d = Math.max(0, Math.min(2147483647, Math.round(o)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(c);
        } catch (u) {
          i.close(), g(u);
        }
      });
    });
  };
  return D;
}
var N, Q;
function Re() {
  if (Q) return N;
  Q = 1;
  const { cppdb: r } = v();
  return N = function(t) {
    if (t == null && (t = {}), typeof t != "object") throw new TypeError("Expected first argument to be an options object");
    const s = "attached" in t ? t.attached : "main";
    if (typeof s != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!s) throw new TypeError('The "attached" option cannot be an empty string');
    return this[r].serialize(s);
  }, N;
}
var B, ee;
function je() {
  if (ee) return B;
  ee = 1;
  const { getBooleanOption: r, cppdb: e } = v();
  return B = function(s, a, n) {
    if (a == null && (a = {}), typeof a == "function" && (n = a, a = {}), typeof s != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof n != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof a != "object") throw new TypeError("Expected second argument to be an options object");
    if (!s) throw new TypeError("User-defined function name cannot be an empty string");
    const i = "safeIntegers" in a ? +r(a, "safeIntegers") : 2, f = r(a, "deterministic"), d = r(a, "directOnly"), w = r(a, "varargs");
    let y = -1;
    if (!w) {
      if (y = n.length, !Number.isInteger(y) || y < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (y > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[e].function(n, s, y, i, f, d), this;
  }, B;
}
var U, te;
function xe() {
  if (te) return U;
  te = 1;
  const { getBooleanOption: r, cppdb: e } = v();
  U = function(n, i) {
    if (typeof n != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof i != "object" || i === null) throw new TypeError("Expected second argument to be an options object");
    if (!n) throw new TypeError("User-defined function name cannot be an empty string");
    const f = "start" in i ? i.start : null, d = t(i, "step", !0), w = t(i, "inverse", !1), y = t(i, "result", !1), g = "safeIntegers" in i ? +r(i, "safeIntegers") : 2, c = r(i, "deterministic"), u = r(i, "directOnly"), o = r(i, "varargs");
    let l = -1;
    if (!o && (l = Math.max(s(d), w ? s(w) : 0), l > 0 && (l -= 1), l > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[e].aggregate(f, d, w, y, n, l, g, c, u), this;
  };
  const t = (a, n, i) => {
    const f = n in a ? a[n] : null;
    if (typeof f == "function") return f;
    if (f != null) throw new TypeError(`Expected the "${n}" option to be a function`);
    if (i) throw new TypeError(`Missing required option "${n}"`);
    return null;
  }, s = ({ length: a }) => {
    if (Number.isInteger(a) && a >= 0) return a;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return U;
}
var $, re;
function Pe() {
  if (re) return $;
  re = 1;
  const { cppdb: r } = v();
  $ = function(u, o) {
    if (typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (!u) throw new TypeError("Virtual table module name cannot be an empty string");
    let l = !1;
    if (typeof o == "object" && o !== null)
      l = !0, o = g(t(o, "used", u));
    else {
      if (typeof o != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      o = e(o);
    }
    return this[r].table(o, u, l), this;
  };
  function e(c) {
    return function(o, l, b, ...p) {
      const h = {
        module: o,
        database: l,
        table: b
      }, E = d.call(c, h, p);
      if (typeof E != "object" || E === null)
        throw new TypeError(`Virtual table module "${o}" did not return a table definition object`);
      return t(E, "returned", o);
    };
  }
  function t(c, u, o) {
    if (!f.call(c, "rows"))
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition without a "rows" property`);
    if (!f.call(c, "columns"))
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition without a "columns" property`);
    const l = c.rows;
    if (typeof l != "function" || Object.getPrototypeOf(l) !== w)
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition with an invalid "rows" property (should be a generator function)`);
    let b = c.columns;
    if (!Array.isArray(b) || !(b = [...b]).every((m) => typeof m == "string"))
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (b.length !== new Set(b).size)
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition with duplicate column names`);
    if (!b.length)
      throw new RangeError(`Virtual table module "${o}" ${u} a table definition with zero columns`);
    let p;
    if (f.call(c, "parameters")) {
      if (p = c.parameters, !Array.isArray(p) || !(p = [...p]).every((m) => typeof m == "string"))
        throw new TypeError(`Virtual table module "${o}" ${u} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      p = i(l);
    if (p.length !== new Set(p).size)
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition with duplicate parameter names`);
    if (p.length > 32)
      throw new RangeError(`Virtual table module "${o}" ${u} a table definition with more than the maximum number of 32 parameters`);
    for (const m of p)
      if (b.includes(m))
        throw new TypeError(`Virtual table module "${o}" ${u} a table definition with column "${m}" which was ambiguously defined as both a column and parameter`);
    let h = 2;
    if (f.call(c, "safeIntegers")) {
      const m = c.safeIntegers;
      if (typeof m != "boolean")
        throw new TypeError(`Virtual table module "${o}" ${u} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      h = +m;
    }
    let E = !1;
    if (f.call(c, "directOnly") && (E = c.directOnly, typeof E != "boolean"))
      throw new TypeError(`Virtual table module "${o}" ${u} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...p.map(y).map((m) => `${m} HIDDEN`),
        ...b.map(y)
      ].join(", ")});`,
      s(l, new Map(b.map((m, O) => [m, p.length + O])), o),
      p,
      h,
      E
    ];
  }
  function s(c, u, o) {
    return function* (...b) {
      const p = b.map((h) => Buffer.isBuffer(h) ? Buffer.from(h) : h);
      for (let h = 0; h < u.size; ++h)
        p.push(null);
      for (const h of c(...b))
        if (Array.isArray(h))
          a(h, p, u.size, o), yield p;
        else if (typeof h == "object" && h !== null)
          n(h, p, u, o), yield p;
        else
          throw new TypeError(`Virtual table module "${o}" yielded something that isn't a valid row object`);
    };
  }
  function a(c, u, o, l) {
    if (c.length !== o)
      throw new TypeError(`Virtual table module "${l}" yielded a row with an incorrect number of columns`);
    const b = u.length - o;
    for (let p = 0; p < o; ++p)
      u[p + b] = c[p];
  }
  function n(c, u, o, l) {
    let b = 0;
    for (const p of Object.keys(c)) {
      const h = o.get(p);
      if (h === void 0)
        throw new TypeError(`Virtual table module "${l}" yielded a row with an undeclared column "${p}"`);
      u[h] = c[p], b += 1;
    }
    if (b !== o.size)
      throw new TypeError(`Virtual table module "${l}" yielded a row with missing columns`);
  }
  function i({ length: c }) {
    if (!Number.isInteger(c) || c < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const u = [];
    for (let o = 0; o < c; ++o)
      u.push(`$${o + 1}`);
    return u;
  }
  const { hasOwnProperty: f } = Object.prototype, { apply: d } = Function.prototype, w = Object.getPrototypeOf(function* () {
  }), y = (c) => `"${c.replace(/"/g, '""')}"`, g = (c) => () => c;
  return $;
}
var C, ne;
function Ae() {
  if (ne) return C;
  ne = 1;
  const r = function() {
  };
  return C = function(t, s) {
    return Object.assign(new r(), this);
  }, C;
}
var M, oe;
function ke() {
  if (oe) return M;
  oe = 1;
  const r = _, e = _, t = v(), s = ue();
  let a;
  function n(f, d) {
    if (new.target == null)
      return new n(f, d);
    let w;
    if (Buffer.isBuffer(f) && (w = f, f = ":memory:"), f == null && (f = ""), d == null && (d = {}), typeof f != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof d != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in d) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in d) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const y = f.trim(), g = y === "" || y === ":memory:", c = t.getBooleanOption(d, "readonly"), u = t.getBooleanOption(d, "fileMustExist"), o = "timeout" in d ? d.timeout : 5e3, l = "verbose" in d ? d.verbose : null, b = "nativeBinding" in d ? d.nativeBinding : null;
    if (c && g && !w) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(o) || o < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (o > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (l != null && typeof l != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (b != null && typeof b != "string" && typeof b != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let p;
    if (b == null ? p = a || (a = Se()("better_sqlite3.node")) : typeof b == "string" ? p = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : ce)(e.resolve(b).replace(/(\.node)?$/, ".node")) : p = b, p.isInitialized || (p.setErrorConstructor(s), p.isInitialized = !0), !g && !r.existsSync(e.dirname(y)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [t.cppdb]: { value: new p.Database(y, f, g, c, u, o, l || null, w || null) },
      ...i.getters
    });
  }
  const i = ve();
  return n.prototype.prepare = i.prepare, n.prototype.transaction = _e(), n.prototype.pragma = Oe(), n.prototype.backup = Ie(), n.prototype.serialize = Re(), n.prototype.function = je(), n.prototype.aggregate = xe(), n.prototype.table = Pe(), n.prototype.loadExtension = i.loadExtension, n.prototype.exec = i.exec, n.prototype.close = i.close, n.prototype.defaultSafeIntegers = i.defaultSafeIntegers, n.prototype.unsafeMode = i.unsafeMode, n.prototype[t.inspect] = Ae(), M = n, M;
}
var ie;
function qe() {
  return ie || (ie = 1, j.exports = ke(), j.exports.SqliteError = ue()), j.exports;
}
var Le = qe();
const De = /* @__PURE__ */ ge(Le);
class Ne {
  #e;
  #t;
  /**** constructor ****/
  constructor(e, t) {
    this.#t = t, this.#e = new De(e), this.#e.pragma("journal_mode = WAL"), this.#e.pragma("synchronous = NORMAL"), this.#r();
  }
  /**** #initSchema ****/
  #r() {
    this.#e.exec(`
      CREATE TABLE IF NOT EXISTS snapshots (
        store_id  TEXT    PRIMARY KEY,
        data      BLOB    NOT NULL,
        clock     INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS patches (
        store_id  TEXT    NOT NULL,
        clock     INTEGER NOT NULL,
        data      BLOB    NOT NULL,
        PRIMARY KEY (store_id, clock)
      );
      CREATE TABLE IF NOT EXISTS blobs (
        hash      TEXT    PRIMARY KEY,
        data      BLOB    NOT NULL,
        ref_count INTEGER NOT NULL DEFAULT 0
      );
    `);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = this.#e.prepare("SELECT data FROM snapshots WHERE store_id = ?").get(this.#t);
    return e != null ? new Uint8Array(e.data) : null;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    this.#e.prepare(
      "INSERT INTO snapshots (store_id, data, clock) VALUES (?,?,?) ON CONFLICT(store_id) DO UPDATE SET data=excluded.data, clock=excluded.clock"
    ).run(this.#t, Buffer.from(e), Date.now());
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    return this.#e.prepare("SELECT data FROM patches WHERE store_id = ? AND clock > ? ORDER BY clock ASC").all(this.#t, e).map((t) => new Uint8Array(t.data));
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    this.#e.prepare(
      "INSERT OR IGNORE INTO patches (store_id, clock, data) VALUES (?,?,?)"
    ).run(this.#t, t, Buffer.from(e));
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    this.#e.prepare("DELETE FROM patches WHERE store_id = ? AND clock < ?").run(this.#t, e);
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = this.#e.prepare("SELECT data FROM blobs WHERE hash = ?").get(e);
    return t != null ? new Uint8Array(t.data) : null;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    this.#e.prepare(
      "INSERT INTO blobs (hash, data, ref_count) VALUES (?,?,1) ON CONFLICT(hash) DO UPDATE SET ref_count = ref_count + 1"
    ).run(e, Buffer.from(t));
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    this.#e.prepare("UPDATE blobs SET ref_count = ref_count - 1 WHERE hash = ?").run(e), this.#e.prepare("DELETE FROM blobs WHERE hash = ? AND ref_count <= 0").run(e);
  }
  /**** close ****/
  async close() {
    this.#e.close();
  }
}
const V = 1, W = 2, le = 5, I = 32;
function Be(r) {
  return Array.from(r).map((e) => e.toString(16).padStart(2, "0")).join("");
}
class Ue {
  StoreId;
  #e = /* @__PURE__ */ new Set();
  #t;
  #r = /* @__PURE__ */ new Map();
  constructor(e, t) {
    this.StoreId = e, this.#t = t;
  }
  /**** addClient ****/
  addClient(e) {
    this.#e.add(e);
  }
  /**** removeClient ****/
  removeClient(e) {
    this.#e.delete(e);
  }
  /**** isEmpty ****/
  isEmpty() {
    return this.#e.size === 0;
  }
  /**** hasPersistence ****/
  hasPersistence() {
    return this.#t != null;
  }
  /**** broadcast — sends Data to all clients in this store except Sender ****/
  broadcast(e, t) {
    for (const s of this.#e)
      if (s !== t)
        try {
          s.send(e);
        } catch {
        }
  }
  /**** replayTo — sends stored snapshot and patches to a newly connected client ****/
  async replayTo(e) {
    const t = this.#t;
    if (t == null)
      return;
    const s = await t.loadSnapshot();
    if (s != null) {
      const n = new Uint8Array(1 + s.byteLength);
      n[0] = W, n.set(s, 1);
      try {
        e.send(n);
      } catch {
      }
    }
    const a = await t.loadPatchesSince(0);
    for (const n of a) {
      const i = new Uint8Array(1 + n.byteLength);
      i[0] = V, i.set(n, 1);
      try {
        e.send(i);
      } catch {
      }
    }
  }
  /**** persistPatch — stores a patch payload (bytes after the 0x01 type byte) ****/
  persistPatch(e) {
    this.#t?.appendPatch(e, Date.now()).catch(() => {
    });
  }
  /**** persistValue — stores a value payload (hash + data, bytes after 0x02);
                       prunes all accumulated patches since the value is a full state ****/
  persistValue(e) {
    const t = this.#t;
    t?.saveSnapshot(e).then(() => t.prunePatches(Date.now() + 1)).catch(() => {
    });
  }
  /**** handleChunk — accumulates VALUE_CHUNK frames; persists the assembled
                      value when all chunks have arrived ****/
  handleChunk(e) {
    if (e.byteLength < 1 + I + 8)
      return;
    const t = e.slice(1, 1 + I), s = Be(t), a = new DataView(e.buffer, e.byteOffset + 1 + I), n = a.getUint32(0, !1), i = a.getUint32(4, !1), f = e.slice(1 + I + 8);
    let d = this.#r.get(s);
    if (d == null && (d = { Chunks: /* @__PURE__ */ new Map(), Total: i }, this.#r.set(s, d)), d.Chunks.set(n, f), d.Chunks.size < d.Total)
      return;
    this.#r.delete(s);
    const w = [];
    for (let u = 0; u < d.Total; u++) {
      const o = d.Chunks.get(u);
      o != null && w.push(o);
    }
    const y = w.reduce((u, o) => u + o.byteLength, 0), g = new Uint8Array(I + y);
    g.set(t, 0);
    let c = I;
    for (const u of w)
      g.set(u, c), c += u.byteLength;
    this.persistValue(g);
  }
  /**** close — closes the underlying SQLite connection ****/
  async close() {
    await this.#t?.close();
  }
}
const P = /* @__PURE__ */ new Map();
function ae(r, e) {
  let t = P.get(r);
  if (t == null) {
    let s;
    if (e != null) {
      const a = r.replace(/[^a-zA-Z0-9_-]/g, "_"), n = be.join(e, `${a}.db`);
      s = new Ne(n, r);
    }
    t = new Ue(r, s), P.set(r, t);
  }
  return t;
}
function se(r, e) {
  const t = P.get(r);
  t != null && (t.removeClient(e), t.isEmpty() && (P.delete(r), t.close().catch(() => {
  })));
}
async function F(r, e, t) {
  const { payload: s } = await he(r, e, {
    algorithms: ["HS256"],
    ...t != null ? { issuer: t } : {}
  });
  if (typeof s.sub != "string" || typeof s.aud != "string")
    throw new Error("missing claims");
  const a = s.scope;
  if (a !== "read" && a !== "write" && a !== "admin")
    throw new Error("invalid scope");
  return {
    sub: s.sub,
    aud: s.aud,
    scope: a,
    iss: s.iss
  };
}
async function $e(r, e, t, s, a, n) {
  const i = new ye({ sub: e, aud: t, scope: s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + Math.round(a / 1e3));
  return n != null && i.setIssuer(n), i.sign(r);
}
function Ce(r) {
  return r === V || r === W || r === le;
}
function Me(r) {
  const e = r?.JWTSecret ?? process.env.SNS_JWT_SECRET ?? "", t = r?.Issuer ?? process.env.SNS_ISSUER, s = r?.Port ?? parseInt(process.env.SNS_PORT ?? "3000", 10), a = r?.Host ?? process.env.SNS_HOST ?? "127.0.0.1", n = r?.PersistDir ?? process.env.SNS_PERSIST_DIR;
  if (e.length === 0)
    throw new Error("SNS_JWT_SECRET environment variable is required");
  const i = new TextEncoder().encode(e), f = new fe(), { injectWebSocket: d, upgradeWebSocket: w } = de({ app: f });
  f.get("/ws/:storeId", w(async (g) => {
    const c = g.req.param("storeId"), u = g.req.query("token") ?? "";
    let o;
    try {
      o = await F(u, i, t);
    } catch {
      return {
        onOpen: (E, T) => {
          T.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== c)
      return {
        onOpen: (h, E) => {
          E.close(4003, "Forbidden");
        }
      };
    const l = ae(c, n);
    let b;
    const p = {
      send: (h) => {
        b.send(h);
      },
      scope: o.scope
    };
    return {
      onOpen: (h, E) => {
        b = E, l.addClient(p), l.hasPersistence() && l.replayTo(p).catch(() => {
        });
      },
      onMessage: (h, E) => {
        const T = h.data;
        if (!(T instanceof ArrayBuffer))
          return;
        const m = new Uint8Array(T);
        if (m.byteLength < 1)
          return;
        const O = m[0];
        if (!(o.scope === "read" && Ce(O)) && (l.broadcast(m, p), l.hasPersistence()))
          switch (!0) {
            case O === V:
              l.persistPatch(m.slice(1));
              break;
            case O === W:
              l.persistValue(m.slice(1));
              break;
            case O === le:
              l.handleChunk(m);
              break;
          }
      },
      onClose: () => {
        se(c, p);
      }
    };
  })), f.get("/signal/:storeId", w(async (g) => {
    const c = g.req.param("storeId"), u = g.req.query("token") ?? "";
    let o;
    try {
      o = await F(u, i, t);
    } catch {
      return {
        onOpen: (E, T) => {
          T.close(4001, "Unauthorized");
        }
      };
    }
    if (o.aud !== c)
      return {
        onOpen: (h, E) => {
          E.close(4003, "Forbidden");
        }
      };
    const l = ae(`signal:${c}`);
    let b;
    const p = {
      send: (h) => {
        b.send(h);
      },
      scope: o.scope
    };
    return {
      onOpen: (h, E) => {
        b = E, l.addClient(p);
      },
      onMessage: (h, E) => {
        const T = h.data;
        if (T instanceof ArrayBuffer)
          l.broadcast(new Uint8Array(T), p);
        else if (typeof T == "string") {
          const m = new TextEncoder().encode(T);
          l.broadcast(m, p);
        }
      },
      onClose: () => {
        se(`signal:${c}`, p);
      }
    };
  })), f.post("/api/token", async (g) => {
    const c = g.req.header("Authorization") ?? "";
    if (!c.startsWith("Bearer "))
      return g.json({ error: "missing token" }, 401);
    const u = c.slice(7);
    let o;
    try {
      o = await F(u, i, t);
    } catch {
      return g.json({ error: "invalid token" }, 401);
    }
    if (o.scope !== "admin")
      return g.json({ error: "admin scope required" }, 403);
    let l;
    try {
      l = await g.req.json();
    } catch {
      return g.json({ error: "invalid JSON body" }, 400);
    }
    if (typeof l.sub != "string" || typeof l.scope != "string")
      return g.json({ error: "sub and scope required" }, 400);
    const b = Fe(l.exp ?? "24h"), p = await $e(
      i,
      l.sub,
      o.aud,
      l.scope,
      b,
      t
    );
    return g.json({ token: p });
  });
  function y() {
    const g = pe({ fetch: f.fetch, port: s, hostname: a });
    d(g);
  }
  return { app: f, start: y };
}
function Fe(r) {
  const e = /^(\d+)(s|m|h|d)$/.exec(r);
  if (e == null)
    return 1440 * 60 * 1e3;
  const t = parseInt(e[1], 10);
  switch (e[2]) {
    case "s":
      return t * 1e3;
    case "m":
      return t * 60 * 1e3;
    case "h":
      return t * 60 * 60 * 1e3;
    case "d":
      return t * 24 * 60 * 60 * 1e3;
    default:
      return 1440 * 60 * 1e3;
  }
}
if (process.argv[1]?.endsWith("sns-websocket-server.js")) {
  const { start: r } = Me();
  r();
}
export {
  Ue as LiveStore,
  Me as createSNSServer,
  Ce as rejectWriteFrame
};
