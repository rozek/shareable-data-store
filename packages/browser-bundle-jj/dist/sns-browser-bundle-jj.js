var ql = Object.defineProperty;
var eo = (n) => {
  throw TypeError(n);
};
var Ul = (n, e, t) => e in n ? ql(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Sn = (n, e, t) => Ul(n, typeof e != "symbol" ? e + "" : e, t), _i = (n, e, t) => e.has(n) || eo("Cannot " + t);
var x = (n, e, t) => (_i(n, e, "read from private field"), t ? t.call(n) : e.get(n)), D = (n, e, t) => e.has(n) ? eo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), z = (n, e, t, i) => (_i(n, e, "write to private field"), i ? i.call(n, t) : e.set(n, t), t), T = (n, e, t) => (_i(n, e, "access private method"), t);
var Kr = (n, e, t, i) => ({
  set _(r) {
    z(n, e, r, t);
  },
  get _() {
    return x(n, e, i);
  }
});
class ke extends Error {
  constructor(t, i) {
    super(i);
    Sn(this, "Code");
    this.Code = t, this.name = "SNS_Error";
  }
}
const ot = "00000000-0000-4000-8000-000000000000", ye = "00000000-0000-4000-8000-000000000001", Ge = "00000000-0000-4000-8000-000000000002", Wr = "text/plain", Fl = 131072, zl = 2048, Zl = 5e3;
class zc {
  constructor(e, t) {
    this._Store = e, this.Id = t;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootNote / isTrashNote / isLostAndFoundNote / isNote / isLink ****/
  get isRootNote() {
    return this.Id === ot;
  }
  get isTrashNote() {
    return this.Id === ye;
  }
  get isLostAndFoundNote() {
    return this.Id === Ge;
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
class to extends zc {
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
  changeValue(e, t, i) {
    this._Store._spliceValueOf(this.Id, e, t, i);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  /**** innerEntryList ****/
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class no extends zc {
  constructor(e, t) {
    super(e, t);
  }
  /**** Target ****/
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
function Hl(n) {
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
var ki = {}, ys = function(n, e) {
  return ys = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, i) {
    t.__proto__ = i;
  } || function(t, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r]);
  }, ys(n, e);
};
function Zc(n, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  ys(n, e);
  function t() {
    this.constructor = n;
  }
  n.prototype = e === null ? Object.create(e) : (t.prototype = e.prototype, new t());
}
var ii = function() {
  return ii = Object.assign || function(e) {
    for (var t, i = 1, r = arguments.length; i < r; i++) {
      t = arguments[i];
      for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[s] = t[s]);
    }
    return e;
  }, ii.apply(this, arguments);
};
function Hc(n, e) {
  var t = {};
  for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && e.indexOf(i) < 0 && (t[i] = n[i]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, i = Object.getOwnPropertySymbols(n); r < i.length; r++)
      e.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(n, i[r]) && (t[i[r]] = n[i[r]]);
  return t;
}
function Jc(n, e, t, i) {
  var r = arguments.length, s = r < 3 ? e : i === null ? i = Object.getOwnPropertyDescriptor(e, t) : i, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") s = Reflect.decorate(n, e, t, i);
  else for (var c = n.length - 1; c >= 0; c--) (o = n[c]) && (s = (r < 3 ? o(s) : r > 3 ? o(e, t, s) : o(e, t)) || s);
  return r > 3 && s && Object.defineProperty(e, t, s), s;
}
function Kc(n, e) {
  return function(t, i) {
    e(t, i, n);
  };
}
function Wc(n, e, t, i, r, s) {
  function o(_) {
    if (_ !== void 0 && typeof _ != "function") throw new TypeError("Function expected");
    return _;
  }
  for (var c = i.kind, u = c === "getter" ? "get" : c === "setter" ? "set" : "value", l = !e && n ? i.static ? n : n.prototype : null, a = e || (l ? Object.getOwnPropertyDescriptor(l, i.name) : {}), h, g = !1, p = t.length - 1; p >= 0; p--) {
    var b = {};
    for (var k in i) b[k] = k === "access" ? {} : i[k];
    for (var k in i.access) b.access[k] = i.access[k];
    b.addInitializer = function(_) {
      if (g) throw new TypeError("Cannot add initializers after decoration has completed");
      s.push(o(_ || null));
    };
    var m = (0, t[p])(c === "accessor" ? { get: a.get, set: a.set } : a[u], b);
    if (c === "accessor") {
      if (m === void 0) continue;
      if (m === null || typeof m != "object") throw new TypeError("Object expected");
      (h = o(m.get)) && (a.get = h), (h = o(m.set)) && (a.set = h), (h = o(m.init)) && r.unshift(h);
    } else (h = o(m)) && (c === "field" ? r.unshift(h) : a[u] = h);
  }
  l && Object.defineProperty(l, i.name, a), g = !0;
}
function Gc(n, e, t) {
  for (var i = arguments.length > 2, r = 0; r < e.length; r++)
    t = i ? e[r].call(n, t) : e[r].call(n);
  return i ? t : void 0;
}
function Xc(n) {
  return typeof n == "symbol" ? n : "".concat(n);
}
function Yc(n, e, t) {
  return typeof e == "symbol" && (e = e.description ? "[".concat(e.description, "]") : ""), Object.defineProperty(n, "name", { configurable: !0, value: t ? "".concat(t, " ", e) : e });
}
function Qc(n, e) {
  if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(n, e);
}
function $c(n, e, t, i) {
  function r(s) {
    return s instanceof t ? s : new t(function(o) {
      o(s);
    });
  }
  return new (t || (t = Promise))(function(s, o) {
    function c(a) {
      try {
        l(i.next(a));
      } catch (h) {
        o(h);
      }
    }
    function u(a) {
      try {
        l(i.throw(a));
      } catch (h) {
        o(h);
      }
    }
    function l(a) {
      a.done ? s(a.value) : r(a.value).then(c, u);
    }
    l((i = i.apply(n, e || [])).next());
  });
}
function eu(n, e) {
  var t = { label: 0, sent: function() {
    if (s[0] & 1) throw s[1];
    return s[1];
  }, trys: [], ops: [] }, i, r, s, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return o.next = c(0), o.throw = c(1), o.return = c(2), typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function c(l) {
    return function(a) {
      return u([l, a]);
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
    } catch (a) {
      l = [6, a], r = 0;
    } finally {
      i = s = 0;
    }
    if (l[0] & 5) throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
var di = Object.create ? (function(n, e, t, i) {
  i === void 0 && (i = t);
  var r = Object.getOwnPropertyDescriptor(e, t);
  (!r || ("get" in r ? !e.__esModule : r.writable || r.configurable)) && (r = { enumerable: !0, get: function() {
    return e[t];
  } }), Object.defineProperty(n, i, r);
}) : (function(n, e, t, i) {
  i === void 0 && (i = t), n[i] = e[t];
});
function tu(n, e) {
  for (var t in n) t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && di(e, n, t);
}
function si(n) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && n[e], i = 0;
  if (t) return t.call(n);
  if (n && typeof n.length == "number") return {
    next: function() {
      return n && i >= n.length && (n = void 0), { value: n && n[i++], done: !n };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Ds(n, e) {
  var t = typeof Symbol == "function" && n[Symbol.iterator];
  if (!t) return n;
  var i = t.call(n), r, s = [], o;
  try {
    for (; (e === void 0 || e-- > 0) && !(r = i.next()).done; ) s.push(r.value);
  } catch (c) {
    o = { error: c };
  } finally {
    try {
      r && !r.done && (t = i.return) && t.call(i);
    } finally {
      if (o) throw o.error;
    }
  }
  return s;
}
function nu() {
  for (var n = [], e = 0; e < arguments.length; e++)
    n = n.concat(Ds(arguments[e]));
  return n;
}
function ru() {
  for (var n = 0, e = 0, t = arguments.length; e < t; e++) n += arguments[e].length;
  for (var i = Array(n), r = 0, e = 0; e < t; e++)
    for (var s = arguments[e], o = 0, c = s.length; o < c; o++, r++)
      i[r] = s[o];
  return i;
}
function iu(n, e, t) {
  if (t || arguments.length === 2) for (var i = 0, r = e.length, s; i < r; i++)
    (s || !(i in e)) && (s || (s = Array.prototype.slice.call(e, 0, i)), s[i] = e[i]);
  return n.concat(s || Array.prototype.slice.call(e));
}
function yn(n) {
  return this instanceof yn ? (this.v = n, this) : new yn(n);
}
function su(n, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var i = t.apply(n, e || []), r, s = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), c("next"), c("throw"), c("return", o), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function o(p) {
    return function(b) {
      return Promise.resolve(b).then(p, h);
    };
  }
  function c(p, b) {
    i[p] && (r[p] = function(k) {
      return new Promise(function(m, _) {
        s.push([p, k, m, _]) > 1 || u(p, k);
      });
    }, b && (r[p] = b(r[p])));
  }
  function u(p, b) {
    try {
      l(i[p](b));
    } catch (k) {
      g(s[0][3], k);
    }
  }
  function l(p) {
    p.value instanceof yn ? Promise.resolve(p.value.v).then(a, h) : g(s[0][2], p);
  }
  function a(p) {
    u("next", p);
  }
  function h(p) {
    u("throw", p);
  }
  function g(p, b) {
    p(b), s.shift(), s.length && u(s[0][0], s[0][1]);
  }
}
function ou(n) {
  var e, t;
  return e = {}, i("next"), i("throw", function(r) {
    throw r;
  }), i("return"), e[Symbol.iterator] = function() {
    return this;
  }, e;
  function i(r, s) {
    e[r] = n[r] ? function(o) {
      return (t = !t) ? { value: yn(n[r](o)), done: !1 } : s ? s(o) : o;
    } : s;
  }
}
function au(n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = n[Symbol.asyncIterator], t;
  return e ? e.call(n) : (n = typeof si == "function" ? si(n) : n[Symbol.iterator](), t = {}, i("next"), i("throw"), i("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function i(s) {
    t[s] = n[s] && function(o) {
      return new Promise(function(c, u) {
        o = n[s](o), r(c, u, o.done, o.value);
      });
    };
  }
  function r(s, o, c, u) {
    Promise.resolve(u).then(function(l) {
      s({ value: l, done: c });
    }, o);
  }
}
function cu(n, e) {
  return Object.defineProperty ? Object.defineProperty(n, "raw", { value: e }) : n.raw = e, n;
}
var Jl = Object.create ? (function(n, e) {
  Object.defineProperty(n, "default", { enumerable: !0, value: e });
}) : function(n, e) {
  n.default = e;
}, gs = function(n) {
  return gs = Object.getOwnPropertyNames || function(e) {
    var t = [];
    for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[t.length] = i);
    return t;
  }, gs(n);
};
function uu(n) {
  if (n && n.__esModule) return n;
  var e = {};
  if (n != null) for (var t = gs(n), i = 0; i < t.length; i++) t[i] !== "default" && di(e, n, t[i]);
  return Jl(e, n), e;
}
function lu(n) {
  return n && n.__esModule ? n : { default: n };
}
function hu(n, e, t, i) {
  if (t === "a" && !i) throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? n !== e || !i : !e.has(n)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return t === "m" ? i : t === "a" ? i.call(n) : i ? i.value : e.get(n);
}
function du(n, e, t, i, r) {
  if (i === "m") throw new TypeError("Private method is not writable");
  if (i === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof e == "function" ? n !== e || !r : !e.has(n)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return i === "a" ? r.call(n, t) : r ? r.value = t : e.set(n, t), t;
}
function fu(n, e) {
  if (e === null || typeof e != "object" && typeof e != "function") throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof n == "function" ? e === n : n.has(e);
}
function pu(n, e, t) {
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
var Kl = typeof SuppressedError == "function" ? SuppressedError : function(n, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = n, i.suppressed = e, i;
};
function yu(n) {
  function e(s) {
    n.error = n.hasError ? new Kl(s, n.error, "An error was suppressed during disposal.") : s, n.hasError = !0;
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
function gu(n, e) {
  return typeof n == "string" && /^\.\.?\//.test(n) ? n.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(t, i, r, s, o) {
    return i ? e ? ".jsx" : ".js" : r && (!s || !o) ? t : r + s + "." + o.toLowerCase() + "js";
  }) : n;
}
const Wl = {
  __extends: Zc,
  __assign: ii,
  __rest: Hc,
  __decorate: Jc,
  __param: Kc,
  __esDecorate: Wc,
  __runInitializers: Gc,
  __propKey: Xc,
  __setFunctionName: Yc,
  __metadata: Qc,
  __awaiter: $c,
  __generator: eu,
  __createBinding: di,
  __exportStar: tu,
  __values: si,
  __read: Ds,
  __spread: nu,
  __spreadArrays: ru,
  __spreadArray: iu,
  __await: yn,
  __asyncGenerator: su,
  __asyncDelegator: ou,
  __asyncValues: au,
  __makeTemplateObject: cu,
  __importStar: uu,
  __importDefault: lu,
  __classPrivateFieldGet: hu,
  __classPrivateFieldSet: du,
  __classPrivateFieldIn: fu,
  __addDisposableResource: pu,
  __disposeResources: yu,
  __rewriteRelativeImportExtension: gu
}, Gl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __addDisposableResource: pu,
  get __assign() {
    return ii;
  },
  __asyncDelegator: ou,
  __asyncGenerator: su,
  __asyncValues: au,
  __await: yn,
  __awaiter: $c,
  __classPrivateFieldGet: hu,
  __classPrivateFieldIn: fu,
  __classPrivateFieldSet: du,
  __createBinding: di,
  __decorate: Jc,
  __disposeResources: yu,
  __esDecorate: Wc,
  __exportStar: tu,
  __extends: Zc,
  __generator: eu,
  __importDefault: lu,
  __importStar: uu,
  __makeTemplateObject: cu,
  __metadata: Qc,
  __param: Kc,
  __propKey: Xc,
  __read: Ds,
  __rest: Hc,
  __rewriteRelativeImportExtension: gu,
  __runInitializers: Gc,
  __setFunctionName: Yc,
  __spread: nu,
  __spreadArray: iu,
  __spreadArrays: ru,
  __values: si,
  default: Wl
}, Symbol.toStringTag, { value: "Module" })), re = /* @__PURE__ */ Hl(Gl);
var Si = {}, xi = {}, ro;
function Xl() {
  return ro || (ro = 1, Object.defineProperty(xi, "__esModule", { value: !0 })), xi;
}
var Oi = {}, xn = {}, Ni = {}, Ci = {}, On = {}, io;
function Yl() {
  if (io) return On;
  io = 1, Object.defineProperty(On, "__esModule", { value: !0 }), On.dim = void 0;
  const n = (e) => e;
  return On.dim = n, On;
}
var so;
function Ql() {
  return so || (so = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.toLine = void 0;
    const e = Yl(), t = (r) => " " + (r.length ? `{ ${r.toString().split(",").map((s) => Number(s).toString(16).toUpperCase().padStart(r.BYTES_PER_ELEMENT << 1, "0")).join(" ")} }` : "{}"), i = (r, s = " ") => {
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
          return r ? r.split(/([\u0000-\u001F]|\n|\t)/).filter(Boolean).map((c) => c === `
` ? "⏎" : c === "	" ? "⇥" : c.length === 1 && c.charCodeAt(0) < 32 ? "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0") : (0, e.dim)('"') + JSON.stringify(c).slice(1, -1) + (0, e.dim)('"')).join(" ") : '""';
        case "object": {
          if (Array.isArray(r))
            return r.length ? `[${s}${r.map((c) => (0, n.toLine)(c, s)).join("," + s)}${s}]` : "[]";
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
          return o.length ? `{${s}${o.map((c) => `${c}${s}${(0, e.dim)("=")}${s}${(0, n.toLine)(r[c], s)}`).join("," + s)}${s}}` : "{}";
        }
        case "function":
          return `fn ${(0, n.toLine)(r.name)} ( ${r.length} args )`;
        case "symbol":
          return `sym ( ${r.description} )`;
      }
      return "?";
    };
    n.toLine = i;
  })(Ci)), Ci;
}
var Ii = {}, Ti = {}, oo;
function $l() {
  return oo || (oo = 1, Object.defineProperty(Ti, "__esModule", { value: !0 })), Ti;
}
var Ai = {}, ji = {}, ao;
function eh() {
  return ao || (ao = 1, Object.defineProperty(ji, "__esModule", { value: !0 })), ji;
}
var Ei = {}, co;
function th() {
  return co || (co = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.ServerClockVector = n.ClockVector = n.LogicalClock = n.interval = n.printTs = n.containsId = n.contains = n.compare = n.equal = n.tick = n.tss = n.ts = n.Timespan = n.Timestamp = void 0;
    class e {
      constructor(m, _) {
        this.sid = m, this.time = _;
      }
    }
    n.Timestamp = e;
    class t {
      constructor(m, _, f) {
        this.sid = m, this.time = _, this.span = f;
      }
    }
    n.Timespan = t;
    const i = (k, m) => new e(k, m);
    n.ts = i;
    const r = (k, m, _) => new t(k, m, _);
    n.tss = r;
    const s = (k, m) => (0, n.ts)(k.sid, k.time + m);
    n.tick = s;
    const o = (k, m) => k.time === m.time && k.sid === m.sid;
    n.equal = o;
    const c = (k, m) => {
      const _ = k.time, f = m.time;
      if (_ > f)
        return 1;
      if (_ < f)
        return -1;
      const d = k.sid, y = m.sid;
      return d > y ? 1 : d < y ? -1 : 0;
    };
    n.compare = c;
    const u = (k, m, _, f) => {
      if (k.sid !== _.sid)
        return !1;
      const d = k.time, y = _.time;
      return !(d > y || d + m < y + f);
    };
    n.contains = u;
    const l = (k, m, _) => {
      if (k.sid !== _.sid)
        return !1;
      const f = k.time, d = _.time;
      return !(f > d || f + m < d + 1);
    };
    n.containsId = l;
    const a = (k) => {
      if (k.sid === 1)
        return "." + k.time;
      let m = "" + k.sid;
      return m.length > 4 && (m = ".." + m.slice(m.length - 4)), m + "." + k.time;
    };
    n.printTs = a;
    const h = (k, m, _) => new t(k.sid, k.time + m, _);
    n.interval = h;
    class g extends e {
      /**
       * Returns a new timestamp, which is the current clock value, and advances the
       * clock by a number of cycles.
       *
       * @param cycles Number of cycles to advance the clock.
       * @returns A new timestamp, which is the current clock value.
       */
      tick(m) {
        const _ = new e(this.sid, this.time);
        return this.time += m, _;
      }
    }
    n.LogicalClock = g;
    class p extends g {
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
      observe(m, _) {
        const f = m.time + _ - 1, d = m.sid;
        if (d !== this.sid) {
          const y = this.peers.get(m.sid);
          y ? f > y.time && (y.time = f) : this.peers.set(m.sid, (0, n.ts)(d, f));
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
      fork(m) {
        const _ = new p(m, this.time);
        return m !== this.sid && _.observe((0, n.tick)(this, -1), 1), this.peers.forEach((f) => {
          _.observe(f, 1);
        }), _;
      }
      /**
       * Returns a human-readable string representation of the clock vector.
       *
       * @param tab String to use for indentation.
       * @returns Human-readable string representation of the clock vector.
       */
      toString(m = "") {
        const _ = this.peers.size;
        let f = 1, d = "";
        return this.peers.forEach((y) => {
          d += `
${m}${f === _ ? "└─" : "├─"} ${y.sid}.${y.time}`, f++;
        }), `clock ${this.sid}.${this.time}${d}`;
      }
    }
    n.ClockVector = p;
    class b extends g {
      constructor() {
        super(...arguments), this.peers = /* @__PURE__ */ new Map();
      }
      observe(m, _) {
        if (m.sid > 8)
          throw new Error("INVALID_SERVER_SESSION");
        if (this.time < m.time)
          throw new Error("TIME_TRAVEL");
        const f = m.time + _;
        f > this.time && (this.time = f);
      }
      clone() {
        return this.fork();
      }
      fork() {
        return new b(1, this.time);
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
    n.ServerClockVector = b;
  })(Ei)), Ei;
}
var uo;
function le() {
  return uo || (uo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(eh(), n), e.__exportStar(th(), n);
  })(Ai)), Ai;
}
var X = {}, Nn = {}, lo;
function Te() {
  if (lo) return Nn;
  lo = 1, Object.defineProperty(Nn, "__esModule", { value: !0 }), Nn.printTree = void 0;
  const n = (e = "", t) => {
    let i = "", r = t.length - 1;
    for (; r >= 0 && !t[r]; r--)
      ;
    for (let s = 0; s <= r; s++) {
      const o = t[s];
      if (!o)
        continue;
      const c = s === r, u = o(e + (c ? " " : "│") + "  "), l = u ? c ? "└─" : "├─" : "│";
      i += `
` + e + l + (u ? " " + u : "");
    }
    return i;
  };
  return Nn.printTree = n, Nn;
}
var ho;
function Zr() {
  if (ho) return X;
  ho = 1, Object.defineProperty(X, "__esModule", { value: !0 }), X.NopOp = X.DelOp = X.UpdArrOp = X.InsArrOp = X.InsBinOp = X.InsStrOp = X.InsVecOp = X.InsObjOp = X.InsValOp = X.NewArrOp = X.NewBinOp = X.NewStrOp = X.NewVecOp = X.NewObjOp = X.NewValOp = X.NewConOp = void 0;
  const n = Te(), e = le();
  class t {
    constructor(y) {
      this.id = y;
    }
    span() {
      return 1;
    }
    toString() {
      let y = this.name() + " " + (0, e.printTs)(this.id);
      const v = this.span();
      return v > 1 && (y += "!" + v), y;
    }
  }
  class i extends t {
    constructor(y, v) {
      super(y), this.id = y, this.val = v;
    }
    name() {
      return "new_con";
    }
    toString() {
      const y = this.val, v = "Uint8Array", w = y instanceof e.Timestamp ? `{ ${(0, e.printTs)(y)} }` : y instanceof Uint8Array ? y.length < 13 ? `${v} { ${("" + y).replaceAll(",", ", ")} }` : `${v}(${y.length})` : `{ ${JSON.stringify(y)} }`;
      return super.toString() + " " + w;
    }
  }
  X.NewConOp = i;
  class r extends t {
    name() {
      return "new_val";
    }
  }
  X.NewValOp = r;
  class s extends t {
    name() {
      return "new_obj";
    }
  }
  X.NewObjOp = s;
  class o extends t {
    name() {
      return "new_vec";
    }
  }
  X.NewVecOp = o;
  class c extends t {
    name() {
      return "new_str";
    }
  }
  X.NewStrOp = c;
  class u extends t {
    name() {
      return "new_bin";
    }
  }
  X.NewBinOp = u;
  class l extends t {
    name() {
      return "new_arr";
    }
  }
  X.NewArrOp = l;
  class a extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.val = w;
    }
    name() {
      return "ins_val";
    }
    toString() {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}, val = ${(0, e.printTs)(this.val)}`;
    }
  }
  X.InsValOp = a;
  class h extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.data = w;
    }
    name() {
      return "ins_obj";
    }
    toString(y = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, n.printTree)(y, this.data.map((w) => (S) => `${JSON.stringify(w[0])}: ${(0, e.printTs)(w[1])}`));
    }
  }
  X.InsObjOp = h;
  class g extends t {
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.data = w;
    }
    name() {
      return "ins_vec";
    }
    toString(y = "") {
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)}` + (0, n.printTree)(y, this.data.map((w) => (S) => `${w[0]}: ${(0, e.printTs)(w[1])}`));
    }
  }
  X.InsVecOp = g;
  class p extends t {
    constructor(y, v, w, S) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = S;
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
  X.InsStrOp = p;
  class b extends t {
    constructor(y, v, w, S) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = S;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_bin";
    }
    toString() {
      const y = (0, e.printTs)(this.ref);
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${y} ← ${this.data} }`;
    }
  }
  X.InsBinOp = b;
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
    constructor(y, v, w, S) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.data = S;
    }
    span() {
      return this.data.length;
    }
    name() {
      return "ins_arr";
    }
    toString() {
      const y = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = this.data.map(e.printTs).join(", ");
      return super.toString() + ", obj = " + y + " { " + v + " ← " + w + " }";
    }
  }
  X.InsArrOp = k;
  class m extends t {
    /**
     * @param id ID of this operation.
     * @param obj and "arr" object ID where to update an element.
     * @param ref ID of the element to update.
     * @param val ID of the new value to set.
     */
    constructor(y, v, w, S) {
      super(y), this.id = y, this.obj = v, this.ref = w, this.val = S;
    }
    name() {
      return "upd_arr";
    }
    toString() {
      const y = (0, e.printTs)(this.obj), v = (0, e.printTs)(this.ref), w = (0, e.printTs)(this.val);
      return super.toString() + ", obj = " + y + " { " + v + ": " + w + " }";
    }
  }
  X.UpdArrOp = m;
  class _ extends t {
    /**
     * @param id ID of this operation.
     * @param obj Object in which to delete something.
     * @param what ID of the first operation to be deleted.
     */
    constructor(y, v, w) {
      super(y), this.id = y, this.obj = v, this.what = w;
    }
    name() {
      return "del";
    }
    toString() {
      const y = this.what.map((v) => (0, e.printTs)(v) + "!" + v.span).join(", ");
      return super.toString() + `, obj = ${(0, e.printTs)(this.obj)} { ${y} }`;
    }
  }
  X.DelOp = _;
  class f extends t {
    constructor(y, v) {
      super(y), this.id = y, this.len = v;
    }
    span() {
      return this.len;
    }
    name() {
      return "nop";
    }
  }
  return X.NopOp = f, X;
}
var Cn = {}, Pi = {}, In = {}, Tn = {}, An = {}, jn = {}, fo;
function nh() {
  if (fo) return jn;
  fo = 1, Object.defineProperty(jn, "__esModule", { value: !0 }), jn.Slice = void 0;
  let n = class {
    constructor(t, i, r, s) {
      this.uint8 = t, this.view = i, this.start = r, this.end = s;
    }
    subarray() {
      return this.uint8.subarray(this.start, this.end);
    }
  };
  return jn.Slice = n, jn;
}
var po;
function vu() {
  if (po) return An;
  po = 1, Object.defineProperty(An, "__esModule", { value: !0 }), An.Writer = void 0;
  const n = nh(), e = new Uint8Array([]), t = new DataView(e.buffer), i = typeof Buffer == "function", r = i ? Buffer.prototype.utf8Write : null, s = i ? Buffer.from : null, o = typeof TextEncoder < "u" ? new TextEncoder() : null;
  let c = class {
    /**
     * @param allocSize Number of bytes to allocate at a time when buffer ends.
     */
    constructor(l = 64 * 1024) {
      this.allocSize = l, this.view = t, this.x0 = 0, this.x = 0, this.uint8 = new Uint8Array(l), this.size = l, this.view = new DataView(this.uint8.buffer);
    }
    /** @ignore */
    grow(l) {
      const a = this.x0, h = this.x, g = this.uint8, p = new Uint8Array(l), b = new DataView(p.buffer), k = g.subarray(a, h);
      p.set(k, 0), this.x = h - a, this.x0 = 0, this.uint8 = p, this.size = l, this.view = b;
    }
    /**
     * Make sure the internal buffer has enough space to write the specified number
     * of bytes, otherwise resize the internal buffer to accommodate for more size.
     *
     * @param capacity Number of bytes.
     */
    ensureCapacity(l) {
      const a = this.size, h = a - this.x;
      if (h < l) {
        const g = a - this.x0, p = l - h, b = g + p;
        this.grow(b <= this.allocSize ? this.allocSize : b * 2);
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
      const a = this.uint8 = new Uint8Array(l);
      this.size = l, this.view = new DataView(a.buffer), this.x = this.x0 = 0;
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
    u8u16(l, a) {
      this.ensureCapacity(3);
      let h = this.x;
      this.uint8[h++] = l, this.uint8[h++] = a >>> 8, this.uint8[h++] = a & 255, this.x = h;
    }
    u8u32(l, a) {
      this.ensureCapacity(5);
      let h = this.x;
      this.uint8[h++] = l, this.view.setUint32(h, a), this.x = h + 4;
    }
    u8u64(l, a) {
      this.ensureCapacity(9);
      let h = this.x;
      this.uint8[h++] = l, this.view.setBigUint64(h, BigInt(a)), this.x = h + 8;
    }
    u8f32(l, a) {
      this.ensureCapacity(5);
      let h = this.x;
      this.uint8[h++] = l, this.view.setFloat32(h, a), this.x = h + 4;
    }
    u8f64(l, a) {
      this.ensureCapacity(9);
      let h = this.x;
      this.uint8[h++] = l, this.view.setFloat64(h, a), this.x = h + 8;
    }
    buf(l, a) {
      this.ensureCapacity(a);
      const h = this.x;
      this.uint8.set(l, h), this.x = h + a;
    }
    /**
     * Encodes string as UTF-8. You need to call .ensureCapacity(str.length * 4)
     * before calling
     *
     * @param str String to encode as UTF-8.
     * @returns The number of bytes written
     */
    utf8(l) {
      const a = l.length * 4;
      if (a < 168)
        return this.utf8Native(l);
      this.ensureCapacity(a);
      const h = this.size - this.x;
      if (r) {
        const g = r.call(this.uint8, l, this.x, h);
        return this.x += g, g;
      } else if (s) {
        const g = this.uint8, p = g.byteOffset + this.x, k = s(g.buffer).subarray(p, p + h).write(l, 0, h, "utf8");
        return this.x += k, k;
      } else if (a > 1024 && o) {
        const g = o.encodeInto(l, this.uint8.subarray(this.x, this.x + h)).written;
        return this.x += g, g;
      }
      return this.utf8Native(l);
    }
    utf8Native(l) {
      const a = l.length, h = this.uint8;
      let g = this.x, p = 0;
      for (; p < a; ) {
        let k = l.charCodeAt(p++);
        if ((k & 4294967168) === 0) {
          h[g++] = k;
          continue;
        } else if ((k & 4294965248) === 0)
          h[g++] = k >> 6 & 31 | 192;
        else {
          if (k >= 55296 && k <= 56319 && p < a) {
            const m = l.charCodeAt(p);
            (m & 64512) === 56320 && (p++, k = ((k & 1023) << 10) + (m & 1023) + 65536);
          }
          (k & 4294901760) === 0 ? (h[g++] = k >> 12 & 15 | 224, h[g++] = k >> 6 & 63 | 128) : (h[g++] = k >> 18 & 7 | 240, h[g++] = k >> 12 & 63 | 128, h[g++] = k >> 6 & 63 | 128);
        }
        h[g++] = k & 63 | 128;
      }
      const b = g - this.x;
      return this.x = g, b;
    }
    ascii(l) {
      const a = l.length;
      this.ensureCapacity(a);
      const h = this.uint8;
      let g = this.x, p = 0;
      for (; p < a; )
        h[g++] = l.charCodeAt(p++);
      this.x = g;
    }
  };
  return An.Writer = c, An;
}
var yo;
function qs() {
  if (yo) return Tn;
  yo = 1, Object.defineProperty(Tn, "__esModule", { value: !0 }), Tn.CrdtWriter = void 0;
  const n = vu();
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
          const c = (r - o) / 4294967296;
          if (r <= 17179869183) {
            this.ensureCapacity(5);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = c << 5 | r >>> 27;
          } else if (r <= 2199023255551) {
            this.ensureCapacity(6);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (c & 3) << 5 | r >>> 27, u[this.x++] = c >>> 2;
          } else if (r <= 281474976710655) {
            this.ensureCapacity(7);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (c & 3) << 5 | r >>> 27, u[this.x++] = 128 | (c & 508) >>> 2, u[this.x++] = c >>> 9;
          } else {
            this.ensureCapacity(8);
            const u = this.uint8;
            u[this.x++] = s | r & 63, u[this.x++] = 128 | r >>> 6 & 127, u[this.x++] = 128 | r >>> 13 & 127, u[this.x++] = 128 | r >>> 20 & 127, u[this.x++] = 128 | (c & 3) << 5 | r >>> 27, u[this.x++] = 128 | (c & 508) >>> 2, u[this.x++] = 128 | (c & 65024) >>> 9, u[this.x++] = c >>> 16;
          }
        }
      }
    }
  };
  return Tn.CrdtWriter = e, Tn;
}
var En = {}, Pn = {}, go;
function rh() {
  if (go) return Pn;
  go = 1, Object.defineProperty(Pn, "__esModule", { value: !0 }), Pn.isFloat32 = void 0;
  const n = new DataView(new ArrayBuffer(4)), e = (t) => (n.setFloat32(0, t), t === n.getFloat32(0));
  return Pn.isFloat32 = e, Pn;
}
var Rn = {}, vo;
function bu() {
  if (vo) return Rn;
  vo = 1, Object.defineProperty(Rn, "__esModule", { value: !0 }), Rn.JsonPackExtension = void 0;
  let n = class {
    constructor(t, i) {
      this.tag = t, this.val = i;
    }
  };
  return Rn.JsonPackExtension = n, Rn;
}
var Ln = {}, bo;
function ih() {
  if (bo) return Ln;
  bo = 1, Object.defineProperty(Ln, "__esModule", { value: !0 }), Ln.CborEncoderFast = void 0;
  const n = vu(), e = Number.isSafeInteger;
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
      let c = s.x;
      r <= 23 ? o[c++] = 0 + r : r <= 255 ? (o[c++] = 24, o[c++] = r) : r <= 65535 ? (o[c++] = 25, s.view.setUint16(c, r), c += 2) : r <= 4294967295 ? (o[c++] = 26, s.view.setUint32(c, r), c += 4) : (o[c++] = 27, s.view.setBigUint64(c, BigInt(r)), c += 8), s.x = c;
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
      const c = o.uint8;
      let u = o.x;
      s < 24 ? c[u++] = 32 + s : s <= 255 ? (c[u++] = 56, c[u++] = s) : s <= 65535 ? (c[u++] = 57, o.view.setUint16(u, s), u += 2) : s <= 4294967295 ? (c[u++] = 58, o.view.setUint32(u, s), u += 4) : (c[u++] = 59, o.view.setBigUint64(u, BigInt(s)), u += 8), o.x = u;
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
      const s = this.writer, c = r.length * 4;
      s.ensureCapacity(5 + c);
      const u = s.uint8;
      let l = s.x;
      c <= 23 ? s.x++ : c <= 255 ? (u[s.x++] = 120, l = s.x, s.x++) : c <= 65535 ? (u[s.x++] = 121, l = s.x, s.x += 2) : (u[s.x++] = 122, l = s.x, s.x += 4);
      const a = s.utf8(r);
      c <= 23 ? u[l] = 96 + a : c <= 255 ? u[l] = a : c <= 65535 ? s.view.setUint16(l, a) : s.view.setUint32(l, a);
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
      for (let c = 0; c < o; c++) {
        const u = s[c];
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
  return Ln.CborEncoderFast = t, Ln;
}
var Bn = {}, mo;
function Us() {
  if (mo) return Bn;
  mo = 1, Object.defineProperty(Bn, "__esModule", { value: !0 }), Bn.JsonPackValue = void 0;
  let n = class {
    constructor(t) {
      this.val = t;
    }
  };
  return Bn.JsonPackValue = n, Bn;
}
var wo;
function mu() {
  if (wo) return En;
  wo = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.CborEncoder = void 0;
  const n = rh(), e = bu(), t = ih(), i = Us();
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
      this.writeMapHdr(o.size), o.forEach((c, u) => {
        this.writeAny(u), this.writeAny(c);
      });
    }
    writeUndef() {
      this.writer.u8(247);
    }
  };
  return En.CborEncoder = r, En;
}
var _o;
function wu() {
  if (_o) return In;
  _o = 1, Object.defineProperty(In, "__esModule", { value: !0 }), In.Encoder = void 0;
  const e = re.__importStar(Zr()), t = qs(), i = le(), r = mu();
  class s extends r.CborEncoder {
    /**
     * Creates a new encoder instance.
     *
     * @param writer An optional custom implementation of CRDT writer.
     */
    constructor(c = new t.CrdtWriter()) {
      super(c), this.writer = c, this.patchSid = 0;
    }
    /**
     * Encodes a JSON CRDT Patch into a {@link Uint8Array} blob.
     *
     * @param patch A JSON CRDT Patch to encode.
     * @returns A {@link Uint8Array} blob containing the encoded JSON CRDT Patch.
     */
    encode(c) {
      this.writer.reset();
      const u = c.getId(), l = this.patchSid = u.sid, a = this.writer;
      a.vu57(l), a.vu57(u.time);
      const h = c.meta;
      return h === void 0 ? this.writeUndef() : this.writeArr([h]), this.encodeOperations(c), a.flush();
    }
    encodeOperations(c) {
      const u = c.ops, l = u.length;
      this.writer.vu57(l);
      for (let a = 0; a < l; a++)
        this.encodeOperation(u[a]);
    }
    encodeId(c) {
      const u = c.sid, l = c.time, a = this.writer;
      u === this.patchSid ? a.b1vu56(0, l) : (a.b1vu56(1, l), a.vu57(u));
    }
    encodeTss(c) {
      this.encodeId(c), this.writer.vu57(c.span);
    }
    writeInsStr(c, u, l, a) {
      const h = this.writer;
      return c <= 7 ? h.u8(96 + c) : (h.u8(
        96
        /* JsonCrdtPatchOpcodeOverlay.ins_str */
      ), h.vu57(c)), this.encodeId(u), this.encodeId(l), h.utf8(a);
    }
    encodeOperation(c) {
      const u = this.writer;
      switch (c.constructor) {
        case e.NewConOp: {
          const h = c.val;
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
          const a = c;
          u.u8(
            72
            /* JsonCrdtPatchOpcodeOverlay.ins_val */
          ), this.encodeId(a.obj), this.encodeId(a.val);
          break;
        }
        case e.InsObjOp: {
          const a = c, h = a.data, g = h.length;
          g <= 7 ? u.u8(80 + g) : (u.u8(
            80
            /* JsonCrdtPatchOpcodeOverlay.ins_obj */
          ), u.vu57(g)), this.encodeId(a.obj);
          for (let p = 0; p < g; p++) {
            const b = h[p];
            this.writeStr(b[0]), this.encodeId(b[1]);
          }
          break;
        }
        case e.InsVecOp: {
          const a = c, h = a.data, g = h.length;
          g <= 7 ? u.u8(88 + g) : (u.u8(
            88
            /* JsonCrdtPatchOpcodeOverlay.ins_vec */
          ), u.vu57(g)), this.encodeId(a.obj);
          for (let p = 0; p < g; p++) {
            const b = h[p];
            u.u8(b[0]), this.encodeId(b[1]);
          }
          break;
        }
        case e.InsStrOp: {
          const a = c, h = a.obj, g = a.ref, p = a.data, b = p.length;
          u.ensureCapacity(24 + b * 4);
          const k = u.x, m = this.writeInsStr(b, h, g, p);
          b !== m && (u.x = k, this.writeInsStr(m, h, g, p));
          break;
        }
        case e.InsBinOp: {
          const a = c, h = a.data, g = h.length;
          g <= 7 ? u.u8(104 + g) : (u.u8(
            104
            /* JsonCrdtPatchOpcodeOverlay.ins_bin */
          ), u.vu57(g)), this.encodeId(a.obj), this.encodeId(a.ref), u.buf(h, g);
          break;
        }
        case e.InsArrOp: {
          const a = c, h = a.data, g = h.length;
          g <= 7 ? u.u8(112 + g) : (u.u8(
            112
            /* JsonCrdtPatchOpcodeOverlay.ins_arr */
          ), u.vu57(g)), this.encodeId(a.obj), this.encodeId(a.ref);
          for (let p = 0; p < g; p++)
            this.encodeId(h[p]);
          break;
        }
        case e.UpdArrOp: {
          const a = c;
          u.u8(
            120
            /* JsonCrdtPatchOpcodeOverlay.upd_arr */
          ), this.encodeId(a.obj), this.encodeId(a.ref), this.encodeId(a.val);
          break;
        }
        case e.DelOp: {
          const a = c, h = a.what, g = h.length;
          g <= 7 ? u.u8(128 + g) : (u.u8(
            128
            /* JsonCrdtPatchOpcodeOverlay.del */
          ), u.vu57(g)), this.encodeId(a.obj);
          for (let p = 0; p < g; p++)
            this.encodeTss(h[p]);
          break;
        }
        case e.NopOp: {
          const h = c.len;
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
  return In.Encoder = s, In;
}
var Vn = {}, Mn = {}, Dn = {}, qn = {}, Gr = {}, xt = {}, ko;
function sh() {
  if (ko) return xt;
  ko = 1, Object.defineProperty(xt, "__esModule", { value: !0 }), xt.decodeAsciiMax15 = xt.decodeAscii = void 0;
  const n = String.fromCharCode, e = (i, r, s) => {
    const o = [];
    for (let c = 0; c < s; c++) {
      const u = i[r++];
      if (u & 128)
        return;
      o.push(u);
    }
    return n.apply(String, o);
  };
  xt.decodeAscii = e;
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
        const o = i[r++], c = i[r++];
        if ((o & 128) > 0 || (c & 128) > 0) {
          r -= 2;
          return;
        }
        if (s < 3)
          return n(o, c);
        const u = i[r++];
        if ((u & 128) > 0) {
          r -= 3;
          return;
        }
        return n(o, c, u);
      }
    else {
      const o = i[r++], c = i[r++], u = i[r++], l = i[r++];
      if ((o & 128) > 0 || (c & 128) > 0 || (u & 128) > 0 || (l & 128) > 0) {
        r -= 4;
        return;
      }
      if (s < 6) {
        if (s === 4)
          return n(o, c, u, l);
        {
          const a = i[r++];
          if ((a & 128) > 0) {
            r -= 5;
            return;
          }
          return n(o, c, u, l, a);
        }
      } else if (s < 8) {
        const a = i[r++], h = i[r++];
        if ((a & 128) > 0 || (h & 128) > 0) {
          r -= 6;
          return;
        }
        if (s < 7)
          return n(o, c, u, l, a, h);
        const g = i[r++];
        if ((g & 128) > 0) {
          r -= 7;
          return;
        }
        return n(o, c, u, l, a, h, g);
      } else {
        const a = i[r++], h = i[r++], g = i[r++], p = i[r++];
        if ((a & 128) > 0 || (h & 128) > 0 || (g & 128) > 0 || (p & 128) > 0) {
          r -= 8;
          return;
        }
        if (s < 10) {
          if (s === 8)
            return n(o, c, u, l, a, h, g, p);
          {
            const b = i[r++];
            if ((b & 128) > 0) {
              r -= 9;
              return;
            }
            return n(o, c, u, l, a, h, g, p, b);
          }
        } else if (s < 12) {
          const b = i[r++], k = i[r++];
          if ((b & 128) > 0 || (k & 128) > 0) {
            r -= 10;
            return;
          }
          if (s < 11)
            return n(o, c, u, l, a, h, g, p, b, k);
          const m = i[r++];
          if ((m & 128) > 0) {
            r -= 11;
            return;
          }
          return n(o, c, u, l, a, h, g, p, b, k, m);
        } else {
          const b = i[r++], k = i[r++], m = i[r++], _ = i[r++];
          if ((b & 128) > 0 || (k & 128) > 0 || (m & 128) > 0 || (_ & 128) > 0) {
            r -= 12;
            return;
          }
          if (s < 14) {
            if (s === 12)
              return n(o, c, u, l, a, h, g, p, b, k, m, _);
            {
              const f = i[r++];
              if ((f & 128) > 0) {
                r -= 13;
                return;
              }
              return n(o, c, u, l, a, h, g, p, b, k, m, _, f);
            }
          } else {
            const f = i[r++], d = i[r++];
            if ((f & 128) > 0 || (d & 128) > 0) {
              r -= 14;
              return;
            }
            if (s < 15)
              return n(o, c, u, l, a, h, g, p, b, k, m, _, f, d);
            const y = i[r++];
            if ((y & 128) > 0) {
              r -= 15;
              return;
            }
            return n(o, c, u, l, a, h, g, p, b, k, m, _, f, d, y);
          }
        }
      }
    }
  };
  return xt.decodeAsciiMax15 = t, xt;
}
var Xr = {}, So;
function oh() {
  if (So) return Xr;
  So = 1, Object.defineProperty(Xr, "__esModule", { value: !0 });
  const n = String.fromCharCode;
  return Xr.default = (e, t, i) => {
    let r = t;
    const s = r + i, o = [];
    for (; r < s; ) {
      let c = e[r++];
      if ((c & 128) !== 0) {
        const u = e[r++] & 63;
        if ((c & 224) === 192)
          c = (c & 31) << 6 | u;
        else {
          const l = e[r++] & 63;
          if ((c & 240) === 224)
            c = (c & 31) << 12 | u << 6 | l;
          else if ((c & 248) === 240) {
            const a = e[r++] & 63;
            let h = (c & 7) << 18 | u << 12 | l << 6 | a;
            if (h > 65535) {
              h -= 65536;
              const g = h >>> 10 & 1023 | 55296;
              c = 56320 | h & 1023, o.push(g);
            } else
              c = h;
          }
        }
      }
      o.push(c);
    }
    return n.apply(String, o);
  }, Xr;
}
var xo;
function ah() {
  if (xo) return Gr;
  xo = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const n = re, e = sh(), t = n.__importDefault(oh()), i = typeof Buffer < "u", r = i ? Buffer.prototype.utf8Slice : null, s = i ? Buffer.from : null, o = (a, h, g) => (0, e.decodeAsciiMax15)(a, h, g) ?? (0, t.default)(a, h, g), c = (a, h, g) => (0, e.decodeAscii)(a, h, g) ?? (0, t.default)(a, h, g), u = r ? (a, h, g) => r.call(a, h, h + g) : s ? (a, h, g) => s(a).subarray(h, h + g).toString("utf8") : t.default, l = (a, h, g) => g < 16 ? o(a, h, g) : g < 32 ? c(a, h, g) : u(a, h, g);
  return Gr.default = l, Gr;
}
var Oo;
function ch() {
  if (Oo) return qn;
  Oo = 1, Object.defineProperty(qn, "__esModule", { value: !0 }), qn.decodeUtf8 = void 0;
  const e = re.__importDefault(ah());
  return qn.decodeUtf8 = e.default, qn;
}
var No;
function ku() {
  if (No) return Dn;
  No = 1, Object.defineProperty(Dn, "__esModule", { value: !0 }), Dn.Reader = void 0;
  const n = ch();
  let e = class _u {
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
      const s = this.x, o = s + i, c = typeof r == "number" ? s + r : this.end;
      return this.uint8.subarray(o, c);
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
      const s = this.x, o = s + i, c = typeof r == "number" ? s + r : this.end;
      return new _u(this.uint8, this.view, o, c);
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
      for (let c = this.x; c < o; c++)
        s += String.fromCharCode(r[c]);
      return this.x = o, s;
    }
  };
  return Dn.Reader = e, Dn;
}
var Co;
function Su() {
  if (Co) return Mn;
  Co = 1, Object.defineProperty(Mn, "__esModule", { value: !0 }), Mn.CrdtReader = void 0;
  const n = ku();
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
      const c = this.u8();
      if (c <= 127)
        return c * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127);
      const u = this.u8();
      if (u <= 127)
        return u * 34359738368 + ((c & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127));
      const l = this.u8();
      return l <= 127 ? l * 4398046511104 + ((u & 127) * 34359738368 + ((c & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127))) : this.u8() * 562949953421312 + ((l & 127) * 4398046511104 + ((u & 127) * 34359738368 + ((c & 127) * 268435456 + ((o & 127) << 21 | (s & 127) << 14 | (r & 127) << 7 | i & 127))));
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
      const c = this.u8();
      if (c <= 127)
        return [r, c << 13 | (o & 127) << 6 | s & 63];
      const u = this.u8();
      if (u <= 127)
        return [r, u << 20 | (c & 127) << 13 | (o & 127) << 6 | s & 63];
      const l = this.u8();
      if (l <= 127)
        return [
          r,
          l * 134217728 + ((u & 127) << 20 | (c & 127) << 13 | (o & 127) << 6 | s & 63)
        ];
      const a = this.u8();
      if (a <= 127)
        return [
          r,
          a * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (c & 127) << 13 | (o & 127) << 6 | s & 63))
        ];
      const h = this.u8();
      if (h <= 127)
        return [
          r,
          h * 2199023255552 + ((a & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (c & 127) << 13 | (o & 127) << 6 | s & 63)))
        ];
      const g = this.u8();
      return [
        r,
        g * 281474976710656 + ((h & 127) * 2199023255552 + ((a & 127) * 17179869184 + ((l & 127) * 134217728 + ((u & 127) << 20 | (c & 127) << 13 | (o & 127) << 6 | s & 63))))
      ];
    }
  };
  return Mn.CrdtReader = e, Mn;
}
var Un = {}, Fn = {}, Io;
function Fs() {
  return Io || (Io = 1, Object.defineProperty(Fn, "__esModule", { value: !0 }), Fn.isUint8Array = void 0, Fn.isUint8Array = typeof Buffer == "function" ? (n) => n instanceof Uint8Array || Buffer.isBuffer(n) : (n) => n instanceof Uint8Array), Fn;
}
var Ri = {}, Li = {}, To;
function uh() {
  return To || (To = 1, Object.defineProperty(Li, "__esModule", { value: !0 })), Li;
}
var Ao;
function fi() {
  return Ao || (Ao = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.ORIGIN = void 0;
    const e = re, t = le();
    e.__exportStar(uh(), n), n.ORIGIN = (0, t.ts)(
      0,
      0
      /* SYSTEM_SESSION_TIME.ORIGIN */
    );
  })(Ri)), Ri;
}
var Bi = {}, Vi = {}, zn = {}, jo;
function pi() {
  if (jo) return zn;
  jo = 1, Object.defineProperty(zn, "__esModule", { value: !0 }), zn.printBinary = void 0;
  const n = (e = "", t) => {
    const i = t[0], r = t[1];
    let s = "";
    return i && (s += `
` + e + "← " + i(e + "  ")), r && (s += `
` + e + "→ " + r(e + "  ")), s;
  };
  return zn.printBinary = n, zn;
}
var Zn = {}, Eo;
function lh() {
  if (Eo) return Zn;
  Eo = 1, Object.defineProperty(Zn, "__esModule", { value: !0 }), Zn.printJson = void 0;
  const n = (e = "", t, i = 2) => (JSON.stringify(t, null, i) || "nil").split(`
`).join(`
` + e);
  return Zn.printJson = n, Zn;
}
var Po;
function hh() {
  return Po || (Po = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Te(), n), e.__exportStar(pi(), n), e.__exportStar(lh(), n);
  })(Vi)), Vi;
}
var Ro;
function yi() {
  return Ro || (Ro = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.s = n.schema = n.nodes = n.SchemaNode = n.NodeBuilder = void 0;
    const e = re, t = Fs(), i = le(), r = e.__importStar(Iu()), s = hh(), o = (a) => {
      switch (typeof a) {
        case "number":
        case "boolean":
        case "undefined":
          return !0;
        case "object":
          return a === null || a instanceof i.Timestamp;
        default:
          return !1;
      }
    };
    class c {
      constructor(h) {
        this._build = h;
      }
      build(h) {
        var g;
        return ((g = this._build) == null ? void 0 : g.call(this, h)) ?? h.con(void 0);
      }
    }
    n.NodeBuilder = c;
    class u extends c {
      toString(h) {
        return this.type;
      }
    }
    n.SchemaNode = u;
    var l;
    (function(a) {
      class h extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "con";
        }
        build(y) {
          return y.con(this.raw);
        }
        toString(y) {
          return this.type + " " + r.con(this.raw);
        }
      }
      a.con = h;
      class g extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "str";
        }
        build(y) {
          return y.json(this.raw);
        }
        toString(y) {
          return this.type + " " + r.con(this.raw);
        }
      }
      a.str = g;
      class p extends u {
        constructor(y) {
          super(), this.raw = y, this.type = "bin";
        }
        build(y) {
          return y.json(this.raw);
        }
        toString(y) {
          return this.type + " " + r.bin(this.raw);
        }
      }
      a.bin = p;
      class b extends u {
        constructor(y) {
          super(), this.value = y, this.type = "val";
        }
        build(y) {
          const v = y.val(), w = this.value.build(y);
          return y.setVal(v, w), v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [(v) => this.value.toString(v)]);
        }
      }
      a.val = b;
      class k extends u {
        constructor(y) {
          super(), this.value = y, this.type = "vec";
        }
        build(y) {
          const v = y.vec(), w = this.value, S = w.length;
          if (S) {
            const N = [];
            for (let C = 0; C < S; C++) {
              const E = w[C];
              if (!E)
                continue;
              const O = E.build(y);
              N.push([C, O]);
            }
            y.insVec(v, N);
          }
          return v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [
            ...this.value.map((v, w) => (S) => `${w}: ${v ? v.toString(S) : r.line(v)}`)
          ]);
        }
      }
      a.vec = k;
      class m extends u {
        constructor(y, v) {
          super(), this.obj = y, this.opt = v, this.type = "obj";
        }
        optional() {
          return this;
        }
        build(y) {
          const v = y.obj(), w = [], S = { ...this.obj, ...this.opt }, N = Object.keys(S), C = N.length;
          if (C) {
            for (let E = 0; E < C; E++) {
              const O = N[E], I = S[O].build(y);
              w.push([O, I]);
            }
            y.insObj(v, w);
          }
          return v;
        }
        toString(y = "") {
          return this.type + (0, s.printTree)(y, [
            ...[...Object.entries(this.obj)].map(([v, w]) => (S) => r.line(v) + (0, s.printTree)(S + " ", [(N) => w.toString(N)])),
            ...[...Object.entries(this.opt ?? [])].map(([v, w]) => (S) => r.line(v) + "?" + (0, s.printTree)(S + " ", [(N) => w.toString(N)]))
          ]);
        }
      }
      a.obj = m;
      class _ extends u {
        constructor(y) {
          super(), this.arr = y, this.type = "arr";
        }
        build(y) {
          const v = y.arr(), w = this.arr, S = w.length;
          if (S) {
            const N = [];
            for (let C = 0; C < S; C++)
              N.push(w[C].build(y));
            y.insArr(v, v, N);
          }
          return v;
        }
        toString(y) {
          return this.type + (0, s.printTree)(y, [
            ...this.arr.map((v, w) => (S) => `[${w}]: ${v ? v.toString(S) : r.line(v)}`)
          ]);
        }
      }
      a.arr = _;
      class f extends u {
        /**
         * @param id A unique extension ID.
         * @param data Schema of the data node of the extension.
         */
        constructor(y, v) {
          super(), this.id = y, this.data = v, this.type = "ext";
        }
        build(y) {
          const v = new Uint8Array([this.id, 0, 0]), w = y.vec();
          return v[1] = w.sid % 256, v[2] = w.time % 256, y.insVec(w, [
            [0, y.constOrJson(n.s.con(v))],
            [1, this.data.build(y)]
          ]), w;
        }
        toString(y) {
          return this.type + "(" + this.id + ")" + (0, s.printTree)(y, [(v) => this.data.toString(v)]);
        }
      }
      a.ext = f;
    })(l || (n.nodes = l = {})), n.schema = {
      /**
       * Creates a "con" node schema and the default value.
       *
       * @param raw Raw default value.
       */
      con: (a) => new l.con(a),
      /**
       * Creates a "str" node schema and the default value.
       *
       * @param str Default value.
       */
      str: (a) => new l.str(a || ""),
      /**
       * Creates a "bin" node schema and the default value.
       *
       * @param bin Default value.
       */
      bin: (a) => new l.bin(a),
      /**
       * Creates a "val" node schema and the default value.
       *
       * @param val Default value.
       */
      val: (a) => new l.val(a),
      /**
       * Creates a "vec" node schema and the default value.
       *
       * @param vec Default value.
       */
      vec: (...a) => new l.vec(a),
      /**
       * Creates a "obj" node schema and the default value.
       *
       * @param obj Default value, required object keys.
       * @param opt Default value of optional object keys.
       */
      obj: (a, h) => new l.obj(a, h),
      /**
       * This is an alias for {@link schema.obj}. It creates a "map" node schema,
       * which is an object where a key can be any string and the value is of the
       * same type.
       *
       * @param obj Default value.
       */
      map: (a) => n.schema.obj(a),
      /**
       * Creates an "arr" node schema and the default value.
       *
       * @param arr Default value.
       */
      arr: (a) => new l.arr(a),
      /**
       * Recursively creates a node tree from any POJO.
       */
      json: (a) => {
        switch (typeof a) {
          case "object": {
            if (!a)
              return n.s.val(n.s.con(a));
            if (a instanceof c)
              return a;
            if (Array.isArray(a))
              return n.s.arr(a.map((h) => n.s.json(h)));
            if ((0, t.isUint8Array)(a))
              return n.s.bin(a);
            if (a instanceof i.Timestamp)
              return n.s.val(n.s.con(a));
            {
              const h = {}, g = Object.keys(a);
              for (const p of g)
                h[p] = n.s.jsonCon(a[p]);
              return n.s.obj(h);
            }
          }
          case "string":
            return n.s.str(a);
          default:
            return n.s.val(n.s.con(a));
        }
      },
      /**
       * Recursively creates a schema node tree from any POJO. Same as {@link json}, but
       * converts constant values to {@link nodes.con} nodes, instead wrapping them into
       * {@link nodes.val} nodes.
       *
       * @todo Remove this once "arr" RGA supports in-place updates.
       */
      jsonCon: (a) => o(a) ? n.s.con(a) : n.s.json(a),
      /**
       * Creates an extension node schema.
       *
       * @param id A unique extension ID.
       * @param data Schema of the data node of the extension.
       */
      ext: (a, h) => new l.ext(a, h)
    }, n.s = n.schema;
  })(Bi)), Bi;
}
var Lo;
function zs() {
  if (Lo) return Un;
  Lo = 1, Object.defineProperty(Un, "__esModule", { value: !0 }), Un.PatchBuilder = void 0;
  const e = re.__importStar(Zr()), t = le(), i = Fs(), r = Cu(), s = fi(), o = yi(), c = (l) => {
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
    constructor(a) {
      this.clock = a, this.patch = new r.Patch();
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
      const a = this.patch;
      return this.patch = new r.Patch(), a;
    }
    // --------------------------------------------------------- Basic operations
    /**
     * Create a new "obj" LWW-Map object.
     *
     * @returns ID of the new operation.
     */
    obj() {
      this.pad();
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewObjOp(a)), a;
    }
    /**
     * Create a new "arr" RGA-Array object.
     *
     * @returns ID of the new operation.
     */
    arr() {
      this.pad();
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewArrOp(a)), a;
    }
    /**
     * Create a new "vec" LWW-Array vector.
     *
     * @returns ID of the new operation.
     */
    vec() {
      this.pad();
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewVecOp(a)), a;
    }
    /**
     * Create a new "str" RGA-String object.
     *
     * @returns ID of the new operation.
     */
    str() {
      this.pad();
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewStrOp(a)), a;
    }
    /**
     * Create a new "bin" RGA-Binary object.
     *
     * @returns ID of the new operation.
     */
    bin() {
      this.pad();
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewBinOp(a)), a;
    }
    /**
     * Create a new immutable constant JSON value. Can be anything, including
     * nested arrays and objects.
     *
     * @param value JSON value
     * @returns ID of the new operation.
     */
    con(a) {
      this.pad();
      const h = this.clock.tick(1);
      return this.patch.ops.push(new e.NewConOp(h, a)), h;
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
      const a = this.clock.tick(1);
      return this.patch.ops.push(new e.NewValOp(a)), a;
    }
    /**
     * Set value of document's root LWW-Register.
     *
     * @returns ID of the new operation.
     */
    root(a) {
      return this.setVal(s.ORIGIN, a);
    }
    /**
     * Set fields of an "obj" object.
     *
     * @returns ID of the new operation.
     */
    insObj(a, h) {
      if (!h.length)
        throw new Error("EMPTY_TUPLES");
      this.pad();
      const g = this.clock.tick(1), p = new e.InsObjOp(g, a, h), b = p.span();
      return b > 1 && this.clock.tick(b - 1), this.patch.ops.push(p), g;
    }
    /**
     * Set elements of a "vec" object.
     *
     * @returns ID of the new operation.
     */
    insVec(a, h) {
      if (!h.length)
        throw new Error("EMPTY_TUPLES");
      this.pad();
      const g = this.clock.tick(1), p = new e.InsVecOp(g, a, h), b = p.span();
      return b > 1 && this.clock.tick(b - 1), this.patch.ops.push(p), g;
    }
    /**
     * Set value of a "val" object.
     *
     * @returns ID of the new operation.
     * @todo Rename to "insVal".
     */
    setVal(a, h) {
      this.pad();
      const g = this.clock.tick(1), p = new e.InsValOp(g, a, h);
      return this.patch.ops.push(p), g;
    }
    /**
     * Insert a substring into a "str" object.
     *
     * @returns ID of the new operation.
     */
    insStr(a, h, g) {
      if (!g.length)
        throw new Error("EMPTY_STRING");
      this.pad();
      const p = this.clock.tick(1), b = new e.InsStrOp(p, a, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Insert binary data into a "bin" object.
     *
     * @returns ID of the new operation.
     */
    insBin(a, h, g) {
      if (!g.length)
        throw new Error("EMPTY_BINARY");
      this.pad();
      const p = this.clock.tick(1), b = new e.InsBinOp(p, a, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Insert elements into an "arr" object.
     *
     * @returns ID of the new operation.
     */
    insArr(a, h, g) {
      this.pad();
      const p = this.clock.tick(1), b = new e.InsArrOp(p, a, h, g), k = b.span();
      return k > 1 && this.clock.tick(k - 1), this.patch.ops.push(b), p;
    }
    /**
     * Update an element in an "arr" object.
     *
     * @returns ID of the new operation.
     */
    updArr(a, h, g) {
      this.pad();
      const p = this.clock.tick(1), b = new e.UpdArrOp(p, a, h, g);
      return this.patch.ops.push(b), p;
    }
    /**
     * Delete a span of operations.
     *
     * @param obj Object in which to delete something.
     * @param what List of time spans to delete.
     * @returns ID of the new operation.
     */
    del(a, h) {
      this.pad();
      const g = this.clock.tick(1);
      return this.patch.ops.push(new e.DelOp(g, a, h)), g;
    }
    /**
     * Operation that does nothing just skips IDs in the patch.
     *
     * @param span Length of the operation.
     * @returns ID of the new operation.
     *
     */
    nop(a) {
      this.pad();
      const h = this.clock.tick(a);
      return this.patch.ops.push(new e.NopOp(h, a)), h;
    }
    // --------------------------------------- JSON value construction operations
    /**
     * Run the necessary builder commands to create an arbitrary JSON object.
     */
    jsonObj(a) {
      const h = this.obj(), g = Object.keys(a);
      if (g.length) {
        const p = [];
        for (const b of g) {
          const k = a[b], m = k instanceof t.Timestamp ? k : c(k) ? this.con(k) : this.json(k);
          p.push([b, m]);
        }
        this.insObj(h, p);
      }
      return h;
    }
    /**
     * Run the necessary builder commands to create an arbitrary JSON array.
     */
    jsonArr(a) {
      const h = this.arr();
      if (a.length) {
        const g = [];
        for (const p of a)
          g.push(this.json(p));
        this.insArr(h, h, g);
      }
      return h;
    }
    /**
     * Run builder commands to create a JSON string.
     */
    jsonStr(a) {
      const h = this.str();
      return a && this.insStr(h, h, a), h;
    }
    /**
     * Run builder commands to create a binary data type.
     */
    jsonBin(a) {
      const h = this.bin();
      return a.length && this.insBin(h, h, a), h;
    }
    /**
     * Run builder commands to create a JSON value.
     */
    jsonVal(a) {
      const h = this.val(), g = this.con(a);
      return this.setVal(h, g), h;
    }
    /**
     * Run the necessary builder commands to create any arbitrary JSON value.
     */
    json(a) {
      if (a instanceof t.Timestamp)
        return a;
      if (a === void 0)
        return this.con(a);
      if (a instanceof Array)
        return this.jsonArr(a);
      if ((0, i.isUint8Array)(a))
        return this.jsonBin(a);
      if (a instanceof o.NodeBuilder)
        return a.build(this);
      switch (typeof a) {
        case "object":
          return a === null ? this.jsonVal(a) : this.jsonObj(a);
        case "string":
          return this.jsonStr(a);
        case "number":
        case "boolean":
          return this.jsonVal(a);
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
    constOrJson(a) {
      return a instanceof t.Timestamp ? a : c(a) ? this.con(a) : this.json(a);
    }
    /**
     * Creates a "con" data type unless the value is already a timestamp, in which
     * case it is returned as-is.
     *
     * @param value Value to convert to a "con" data type.
     * @returns ID of the new "con" object.
     */
    maybeConst(a) {
      return a instanceof t.Timestamp ? a : this.con(a);
    }
    // ------------------------------------------------------------------ Private
    /**
     * Add padding "noop" operation if clock's time has jumped. This method checks
     * if clock has advanced past the ID of the last operation of the patch and,
     * if so, adds a "noop" operation to the patch to pad the gap.
     */
    pad() {
      const a = this.patch.nextTime();
      if (!a)
        return;
      const h = this.clock.time - a;
      if (h > 0) {
        const g = (0, t.ts)(this.clock.sid, a), p = new e.NopOp(g, h);
        this.patch.ops.push(p);
      }
    }
  };
  return Un.PatchBuilder = u, Un;
}
var Hn = {}, Jn = {}, Kn = {}, Bo;
function dh() {
  if (Bo) return Kn;
  Bo = 1, Object.defineProperty(Kn, "__esModule", { value: !0 }), Kn.decodeF16 = void 0;
  const n = Math.pow, e = (t) => {
    const i = (t & 31744) >> 10, r = t & 1023;
    return (t >> 15 ? -1 : 1) * (i ? i === 31 ? r ? NaN : 1 / 0 : n(2, i - 15) * (1 + r / 1024) : 6103515625e-14 * (r / 1024));
  };
  return Kn.decodeF16 = e, Kn;
}
var Yr = {}, Wn = {}, Qr = {}, Vo;
function fh() {
  if (Vo) return Qr;
  Vo = 1, Object.defineProperty(Qr, "__esModule", { value: !0 });
  const n = String.fromCharCode;
  return Qr.default = (e, t, i) => {
    let r = t;
    const s = r + i;
    let o = "";
    for (; r < s; ) {
      const c = e[r++];
      if ((c & 128) === 0) {
        o += n(c);
        continue;
      }
      const u = e[r++] & 63;
      if ((c & 224) === 192) {
        o += n((c & 31) << 6 | u);
        continue;
      }
      const l = e[r++] & 63;
      if ((c & 240) === 224) {
        o += n((c & 31) << 12 | u << 6 | l);
        continue;
      }
      if ((c & 248) === 240) {
        const a = e[r++] & 63;
        let h = (c & 7) << 18 | u << 12 | l << 6 | a;
        if (h > 65535) {
          h -= 65536;
          const g = h >>> 10 & 1023 | 55296;
          h = 56320 | h & 1023, o += n(g, h);
        } else
          o += n(h);
      } else
        o += n(c);
    }
    return o;
  }, Qr;
}
var Mo;
function ph() {
  if (Mo) return Wn;
  Mo = 1, Object.defineProperty(Wn, "__esModule", { value: !0 }), Wn.CachedUtf8Decoder = void 0;
  const e = re.__importDefault(fh());
  let t = 1 + Math.round(Math.random() * ((-1 >>> 0) - 1));
  function i(o, c) {
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, (t >>> 0) % (c - o + 1) + o;
  }
  class r {
    constructor(c, u) {
      this.bytes = c, this.value = u;
    }
  }
  let s = class {
    constructor() {
      this.caches = [];
      for (let c = 0; c < 31; c++)
        this.caches.push([]);
    }
    get(c, u, l) {
      const a = this.caches[l - 1], h = a.length;
      e: for (let g = 0; g < h; g++) {
        const p = a[g], b = p.bytes;
        for (let k = 0; k < l; k++)
          if (b[k] !== c[u + k])
            continue e;
        return p.value;
      }
      return null;
    }
    store(c, u) {
      const l = this.caches[c.length - 1], a = new r(c, u);
      l.length >= 16 ? l[i(0, 15)] = a : l.push(a);
    }
    decode(c, u, l) {
      if (!l)
        return "";
      const a = this.get(c, u, l);
      if (a !== null)
        return a;
      const h = (0, e.default)(c, u, l), g = Uint8Array.prototype.slice.call(c, u, u + l);
      return this.store(g, h), h;
    }
  };
  return Wn.CachedUtf8Decoder = s, Wn;
}
var Do;
function yh() {
  if (Do) return Yr;
  Do = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const n = ph();
  return Yr.default = new n.CachedUtf8Decoder(), Yr;
}
var qo;
function xu() {
  if (qo) return Jn;
  qo = 1, Object.defineProperty(Jn, "__esModule", { value: !0 }), Jn.CborDecoderBase = void 0;
  const n = re, e = dh(), t = bu(), i = Us(), r = ku(), s = n.__importDefault(yh());
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
      const l = this.reader.u8(), a = l >> 5, h = l & 31;
      return a < 4 ? a < 2 ? a === 0 ? this.readUint(h) : this.readNint(h) : a === 2 ? this.readBin(h) : this.readStr(h) : a < 6 ? a === 4 ? this.readArr(h) : this.readObj(h) : a === 6 ? this.readTag(h) : this.readTkn(h);
    }
    readAnyRaw(u) {
      const l = u >> 5, a = u & 31;
      return l < 4 ? l < 2 ? l === 0 ? this.readUint(a) : this.readNint(a) : l === 2 ? this.readBin(a) : this.readStr(a) : l < 6 ? l === 4 ? this.readArr(a) : this.readObj(a) : l === 6 ? this.readTag(a) : this.readTkn(a);
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
          let a = 0;
          const h = [];
          for (; this.reader.peak() !== 255; ) {
            const k = this.readBinChunk();
            a += k.length, h.push(k);
          }
          this.reader.x++;
          const g = new Uint8Array(a);
          let p = 0;
          const b = h.length;
          for (let k = 0; k < b; k++) {
            const m = h[k];
            g.set(m, p), p += m.length;
          }
          return g;
        }
        default:
          throw 1;
      }
    }
    readBinChunk() {
      const u = this.reader.u8(), l = u >> 5, a = u & 31;
      if (l !== 2)
        throw 2;
      if (a > 27)
        throw 3;
      return this.readBin(a);
    }
    // ----------------------------------------------------------- String reading
    readAsStr() {
      const l = this.reader.u8(), a = l >> 5, h = l & 31;
      if (a !== 3)
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
          let a = "";
          for (; l.peak() !== 255; )
            a += this.readStrChunk();
          return this.reader.x++, a;
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
      const u = this.reader.u8(), l = u >> 5, a = u & 31;
      if (l !== 3)
        throw 4;
      if (a > 27)
        throw 5;
      return this.readStr(a);
    }
    // ------------------------------------------------------------ Array reading
    readArr(u) {
      const l = this.readMinorLen(u);
      return l >= 0 ? this.readArrRaw(l) : this.readArrIndef();
    }
    readArrRaw(u) {
      const l = [];
      for (let a = 0; a < u; a++)
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
        const a = {};
        for (let h = 0; h < l; h++) {
          const g = this.key();
          if (g === "__proto__")
            throw 6;
          const p = this.readAny();
          a[g] = p;
        }
        return a;
      } else {
        if (u === 31)
          return this.readObjIndef();
        throw 1;
      }
    }
    /** Remove this? */
    readObjRaw(u) {
      const l = {};
      for (let a = 0; a < u; a++) {
        const h = this.key(), g = this.readAny();
        l[h] = g;
      }
      return l;
    }
    readObjIndef() {
      const u = {};
      for (; this.reader.peak() !== 255; ) {
        const l = this.key();
        if (this.reader.peak() === 255)
          throw 7;
        const a = this.readAny();
        u[l] = a;
      }
      return this.reader.x++, u;
    }
    key() {
      const u = this.reader.u8(), l = u >> 5, a = u & 31;
      if (l !== 3)
        return String(this.readAnyRaw(u));
      const h = this.readStrLen(a);
      if (h > 31)
        return this.reader.utf8(h);
      const g = this.keyDecoder.decode(this.reader.uint8, this.reader.x, h);
      return this.reader.skip(h), g;
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
  return Jn.CborDecoderBase = o, Jn;
}
var Uo;
function gh() {
  if (Uo) return Hn;
  Uo = 1, Object.defineProperty(Hn, "__esModule", { value: !0 }), Hn.CborDecoder = void 0;
  const n = xu(), e = Us();
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
        const c = this.readAny(), u = this.readAny();
        s.set(c, u);
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
      const c = s;
      if (this.skipAny(), this.reader.x - c !== o)
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
        const c = this.key(), u = this.readPrimitiveOrVal();
        s[c] = u;
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
      const c = s & 31;
      if (c < 24)
        return c;
      switch (c) {
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
  return Hn.CborDecoder = t, Hn;
}
var Fo;
function Ou() {
  if (Fo) return Vn;
  Fo = 1, Object.defineProperty(Vn, "__esModule", { value: !0 }), Vn.Decoder = void 0;
  const n = Su(), e = le(), t = zs(), i = gh();
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
      const o = this.reader, c = o.vu57(), u = o.vu57(), a = c === 1 ? new e.ServerClockVector(1, u) : new e.ClockVector(c, u);
      this.patchSid = a.sid;
      const h = this.builder = new t.PatchBuilder(a), g = this.val();
      return Array.isArray(g) && (h.patch.meta = g[0]), this.decodeOperations(), h.patch;
    }
    decodeId() {
      const o = this.reader, [c, u] = o.b1vu56();
      return c ? new e.Timestamp(o.vu57(), u) : new e.Timestamp(this.patchSid, u);
    }
    decodeTss() {
      const o = this.decodeId(), c = this.reader.vu57();
      return (0, e.interval)(o, 0, c);
    }
    decodeOperations() {
      const c = this.reader.vu57();
      for (let u = 0; u < c; u++)
        this.decodeOperation();
    }
    decodeOperation() {
      const o = this.builder, c = this.reader, u = c.u8();
      switch (u >> 3) {
        case 0: {
          const a = u & 7;
          o.con(a ? this.decodeId() : this.val());
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
          const a = this.decodeId(), h = this.decodeId();
          o.setVal(a, h);
          break;
        }
        case 10: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < a; p++) {
            const b = this.val();
            if (typeof b != "string")
              continue;
            const k = this.decodeId();
            g.push([b, k]);
          }
          o.insObj(h, g);
          break;
        }
        case 11: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < a; p++) {
            const b = this.val();
            if (typeof b != "number")
              continue;
            const k = this.decodeId();
            g.push([b, k]);
          }
          o.insVec(h, g);
          break;
        }
        case 12: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = this.decodeId(), p = c.utf8(a);
          o.insStr(h, g, p);
          break;
        }
        case 13: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = this.decodeId(), p = c.buf(a);
          if (!(p instanceof Uint8Array))
            return;
          o.insBin(h, g, p);
          break;
        }
        case 14: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = this.decodeId(), p = [];
          for (let b = 0; b < a; b++)
            p.push(this.decodeId());
          o.insArr(h, g, p);
          break;
        }
        case 15: {
          const a = this.decodeId(), h = this.decodeId(), g = this.decodeId();
          o.updArr(a, h, g);
          break;
        }
        case 16: {
          const a = u & 7 || c.vu57(), h = this.decodeId(), g = [];
          for (let p = 0; p < a; p++)
            g.push(this.decodeTss());
          o.del(h, g);
          break;
        }
        case 17: {
          const a = u & 7 || c.vu57();
          o.nop(a);
          break;
        }
        default:
          throw new Error("UNKNOWN_OP");
      }
    }
  }
  return Vn.Decoder = r, Vn;
}
var Mi = {}, zo;
function vh() {
  return zo || (zo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.decode = n.decoder = n.encode = n.encoder = void 0;
    const e = wu(), t = Ou(), i = qs(), r = new i.CrdtWriter(1024 * 4);
    n.encoder = new e.Encoder(r);
    const s = (c) => n.encoder.encode(c);
    n.encode = s, n.decoder = new t.Decoder();
    const o = (c) => n.decoder.decode(c);
    n.decode = o;
  })(Mi)), Mi;
}
var Zo;
function bh() {
  return Zo || (Zo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(wu(), n), e.__exportStar(Ou(), n), e.__exportStar(vh(), n);
  })(Pi)), Pi;
}
var Ho;
function Cu() {
  if (Ho) return Cn;
  Ho = 1, Object.defineProperty(Cn, "__esModule", { value: !0 }), Cn.Patch = void 0;
  const e = re.__importStar(Zr()), t = le(), i = Te(), r = bh();
  let s = class Nu {
    constructor() {
      this.ops = [], this.meta = void 0;
    }
    /**
     * Un-marshals a JSON CRDT patch from a binary representation.
     */
    static fromBinary(c) {
      return (0, r.decode)(c);
    }
    /**
     * Returns the patch ID, which is equal to the ID of the first operation
     * in the patch.
     *
     * @returns The ID of the first operation in the patch.
     */
    getId() {
      const c = this.ops[0];
      if (c)
        return c.id;
    }
    /**
     * Returns the total time span of the patch, which is the sum of all
     * operation spans.
     *
     * @returns The length of the patch.
     */
    span() {
      let c = 0;
      for (const u of this.ops)
        c += u.span();
      return c;
    }
    /**
     * Returns the expected time of the next inserted operation.
     */
    nextTime() {
      const c = this.ops, u = c.length;
      if (!u)
        return 0;
      const l = c[u - 1];
      return l.id.time + l.span();
    }
    /**
     * Creates a new patch where all timestamps are transformed using the
     * provided function.
     *
     * @param ts Timestamp transformation function.
     * @returns A new patch with transformed timestamps.
     */
    rewriteTime(c) {
      const u = new Nu(), l = this.ops, a = l.length, h = u.ops;
      for (let g = 0; g < a; g++) {
        const p = l[g];
        p instanceof e.DelOp ? h.push(new e.DelOp(c(p.id), c(p.obj), p.what)) : p instanceof e.NewConOp ? h.push(new e.NewConOp(c(p.id), p.val instanceof t.Timestamp ? c(p.val) : p.val)) : p instanceof e.NewVecOp ? h.push(new e.NewVecOp(c(p.id))) : p instanceof e.NewValOp ? h.push(new e.NewValOp(c(p.id))) : p instanceof e.NewObjOp ? h.push(new e.NewObjOp(c(p.id))) : p instanceof e.NewStrOp ? h.push(new e.NewStrOp(c(p.id))) : p instanceof e.NewBinOp ? h.push(new e.NewBinOp(c(p.id))) : p instanceof e.NewArrOp ? h.push(new e.NewArrOp(c(p.id))) : p instanceof e.InsArrOp ? h.push(new e.InsArrOp(c(p.id), c(p.obj), c(p.ref), p.data.map(c))) : p instanceof e.UpdArrOp ? h.push(new e.UpdArrOp(c(p.id), c(p.obj), c(p.ref), c(p.val))) : p instanceof e.InsStrOp ? h.push(new e.InsStrOp(c(p.id), c(p.obj), c(p.ref), p.data)) : p instanceof e.InsBinOp ? h.push(new e.InsBinOp(c(p.id), c(p.obj), c(p.ref), p.data)) : p instanceof e.InsValOp ? h.push(new e.InsValOp(c(p.id), c(p.obj), c(p.val))) : p instanceof e.InsObjOp ? h.push(new e.InsObjOp(c(p.id), c(p.obj), p.data.map(([b, k]) => [b, c(k)]))) : p instanceof e.InsVecOp ? h.push(new e.InsVecOp(c(p.id), c(p.obj), p.data.map(([b, k]) => [b, c(k)]))) : p instanceof e.NopOp && h.push(new e.NopOp(c(p.id), p.len));
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
    rebase(c, u) {
      const l = this.getId();
      if (!l)
        throw new Error("EMPTY_PATCH");
      const a = l.sid, h = l.time;
      if (u ?? (u = h), h === c)
        return this;
      const g = c - h;
      return this.rewriteTime((p) => {
        if (p.sid !== a)
          return p;
        const b = p.time;
        return b < u ? p : (0, t.ts)(a, b + g);
      });
    }
    /**
     * Creates a deep clone of the patch.
     *
     * @returns A deep clone of the patch.
     */
    clone() {
      return this.rewriteTime((c) => c);
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
    toString(c = "") {
      const u = this.getId();
      return `Patch ${u ? (0, t.printTs)(u) : "(nil)"}!${this.span()}` + (0, i.printTree)(c, this.ops.map((a) => (h) => a.toString(h)));
    }
  };
  return Cn.Patch = s, Cn;
}
var Jo;
function kt() {
  return Jo || (Jo = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar($l(), n), e.__exportStar(le(), n), e.__exportStar(Zr(), n), e.__exportStar(Cu(), n), e.__exportStar(zs(), n), e.__exportStar(yi(), n);
  })(Ii)), Ii;
}
var Ko;
function Iu() {
  return Ko || (Ko = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.bin = n.con = n.line = void 0;
    const e = Ql(), t = kt();
    n.line = e.toLine;
    const i = (s) => s instanceof Uint8Array ? "Uint8Array " + (0, n.bin)(s) : `{ ${s instanceof t.Timestamp ? (0, t.printTs)(s) : (0, n.line)(s)} }`;
    n.con = i;
    const r = (s) => "{ " + ("" + s).replaceAll(",", ", ") + " }";
    n.bin = r;
  })(Ni)), Ni;
}
var Wo;
function gi() {
  if (Wo) return xn;
  Wo = 1, Object.defineProperty(xn, "__esModule", { value: !0 }), xn.ConNode = void 0;
  const n = Iu(), e = le();
  let t = class Tu {
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
      return new Tu(this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(r) {
      return this.name() + " " + (0, e.printTs)(this.id) + " " + (0, n.con)(this.val);
    }
  };
  return xn.ConNode = t, xn;
}
var Gn = {}, Ot = {}, Nt = {}, Xn = {}, Yn = {}, Qn = {}, Go;
function mh() {
  if (Go) return Qn;
  Go = 1, Object.defineProperty(Qn, "__esModule", { value: !0 }), Qn.RelativeTimestamp = void 0;
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
  return Qn.RelativeTimestamp = n, Qn;
}
var Xo;
function wh() {
  if (Xo) return Yn;
  Xo = 1, Object.defineProperty(Yn, "__esModule", { value: !0 }), Yn.ClockEncoder = void 0;
  const n = le(), e = mh();
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
      const o = s.time, c = s.sid;
      let u = this.table.get(c);
      if (!u) {
        let h = this.clock.peers.get(c);
        h || (h = new n.Timestamp(c, this.clock.time - 1)), u = new t(this.index++, h), this.table.set(c, u);
      }
      const a = u.clock.time - o;
      if (a < 0)
        throw new Error("TIME_TRAVEL");
      return new e.RelativeTimestamp(u.index, a);
    }
    toJson() {
      const s = [];
      return this.table.forEach((o) => {
        const c = o.clock;
        s.push(c.sid, c.time);
      }), s;
    }
  };
  return Yn.ClockEncoder = i, Yn;
}
var Ct = {}, Yo;
function Au() {
  if (Yo) return Ct;
  Yo = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.CRDT_MAJOR_OVERLAY = Ct.CRDT_MAJOR = void 0;
  var n;
  (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 1] = "VAL", t[t.OBJ = 2] = "OBJ", t[t.VEC = 3] = "VEC", t[t.STR = 4] = "STR", t[t.BIN = 5] = "BIN", t[t.ARR = 6] = "ARR";
  })(n || (Ct.CRDT_MAJOR = n = {}));
  var e;
  return (function(t) {
    t[t.CON = 0] = "CON", t[t.VAL = 32] = "VAL", t[t.VEC = 96] = "VEC", t[t.OBJ = 64] = "OBJ", t[t.STR = 128] = "STR", t[t.BIN = 160] = "BIN", t[t.ARR = 192] = "ARR";
  })(e || (Ct.CRDT_MAJOR_OVERLAY = e = {})), Ct;
}
var Qo;
function _h() {
  if (Qo) return Xn;
  Qo = 1, Object.defineProperty(Xn, "__esModule", { value: !0 }), Xn.Encoder = void 0;
  const e = re.__importStar(St()), t = wh(), i = qs(), r = le(), s = mu(), o = Au();
  let c = class extends s.CborEncoder {
    constructor(l) {
      super(l || new i.CrdtWriter()), this.clockEncoder = new t.ClockEncoder(), this.time = 0, this.cTableEntry = (a) => {
        const h = a.clock, g = this.writer;
        g.vu57(h.sid), g.vu57(h.time);
      }, this.tsLogical = (a) => {
        const h = this.clockEncoder.append(a);
        this.writer.id(h.sessionIndex, h.timeDiff);
      }, this.tsServer = (a) => {
        this.writer.vu57(a.time);
      }, this.ts = this.tsLogical, this.cKey = (a, h) => {
        this.writeStr(h), this.cNode(this.doc.index.get(a));
      };
    }
    encode(l) {
      this.doc = l;
      const a = this.writer;
      return a.reset(), l.clock.sid === 1 ? this.encodeServer(l) : this.encodeLogical(l), a.flush();
    }
    encodeLogical(l) {
      const a = this.writer;
      this.ts = this.tsLogical, this.clockEncoder.reset(l.clock), a.ensureCapacity(4);
      const h = a.x0, g = a.x;
      a.x += 4, this.cRoot(l.root), this.encodeClockTable(h, g);
    }
    encodeServer(l) {
      this.ts = this.tsServer;
      const a = this.writer;
      a.u8(128), a.vu57(this.time = l.clock.time), this.cRoot(l.root);
    }
    encodeClockTable(l, a) {
      const h = this.writer, g = h.x0 - l;
      h.view.setUint32(h.x0 + (a - l), h.x - a - g - 4);
      const b = this.clockEncoder.table, k = b.size;
      h.vu57(k), b.forEach(this.cTableEntry);
    }
    cRoot(l) {
      l.val.sid === 0 ? this.writer.u8(0) : this.cNode(l.node());
    }
    writeTL(l, a) {
      const h = this.writer;
      a < 31 ? h.u8(l | a) : (h.u8(l | 31), h.vu57(a));
    }
    cNode(l) {
      l instanceof e.ConNode ? this.cCon(l) : l instanceof e.ValNode ? this.cVal(l) : l instanceof e.StrNode ? this.cStr(l) : l instanceof e.ObjNode ? this.cObj(l) : l instanceof e.VecNode ? this.cVec(l) : l instanceof e.ArrNode ? this.cArr(l) : l instanceof e.BinNode && this.cBin(l);
    }
    cCon(l) {
      const a = l.val;
      this.ts(l.id), a instanceof r.Timestamp ? (this.writer.u8(1), this.ts(a)) : (this.writer.u8(0), this.writeAny(a));
    }
    cVal(l) {
      this.ts(l.id), this.writer.u8(32), this.cNode(l.node());
    }
    cObj(l) {
      this.ts(l.id);
      const a = l.keys;
      this.writeTL(o.CRDT_MAJOR_OVERLAY.OBJ, a.size), a.forEach(this.cKey);
    }
    cVec(l) {
      const a = l.elements, h = a.length;
      this.ts(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.VEC, h);
      const g = this.doc.index;
      for (let p = 0; p < h; p++) {
        const b = a[p];
        b ? this.cNode(g.get(b)) : this.writer.u8(0);
      }
    }
    cStr(l) {
      const a = this.ts;
      a(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.STR, l.count);
      for (let h = l.first(); h; h = l.next(h))
        a(h.id), h.del ? this.writeUInteger(h.span) : this.writeStr(h.data);
    }
    cBin(l) {
      const a = this.ts, h = this.writer;
      a(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.BIN, l.count);
      for (let g = l.first(); g; g = l.next(g)) {
        a(g.id);
        const p = g.span, b = g.del;
        h.b1vu56(~~b, p), !b && h.buf(g.data, p);
      }
    }
    cArr(l) {
      const a = this.ts, h = this.writer;
      a(l.id), this.writeTL(o.CRDT_MAJOR_OVERLAY.ARR, l.count);
      const g = this.doc.index;
      for (let p = l.first(); p; p = l.next(p)) {
        a(p.id);
        const b = p.span, k = p.del;
        if (h.b1vu56(~~k, b), k)
          continue;
        const m = p.data;
        for (let _ = 0; _ < b; _++)
          this.cNode(g.get(m[_]));
      }
    }
  };
  return Xn.Encoder = c, Xn;
}
var $n = {}, er = {}, $o;
function kh() {
  if ($o) return er;
  $o = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.ClockDecoder = void 0;
  const n = le();
  let e = class ju {
    static fromArr(i) {
      const r = new ju(i[0], i[1]), s = i.length;
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
  return er.ClockDecoder = e, er;
}
var ea;
function Sh() {
  if (ea) return $n;
  ea = 1, Object.defineProperty($n, "__esModule", { value: !0 }), $n.Decoder = void 0;
  const e = re.__importStar(St()), t = kh(), i = Su(), r = le(), s = Ws(), o = xu(), c = Au();
  let u = class extends o.CborDecoderBase {
    constructor() {
      super(new i.CrdtReader()), this.clockDecoder = void 0, this.time = -1, this.cStrChunk = () => {
        const a = this.ts(), h = this.val();
        return typeof h == "string" ? new e.StrChunk(a, h.length, h) : new e.StrChunk(a, ~~h, "");
      }, this.cBinChunk = () => {
        const a = this.ts(), h = this.reader, [g, p] = h.b1vu56();
        return g ? new e.BinChunk(a, p, void 0) : new e.BinChunk(a, p, h.buf(p));
      };
    }
    decode(a, h) {
      this.clockDecoder = void 0, this.time = -1;
      const g = this.reader;
      if (g.reset(a), g.peak() & 128) {
        g.x++;
        const m = this.time = g.vu57();
        h || (h = s.Model.withServerClock(void 0, m));
      } else if (this.decodeClockTable(), !h) {
        const m = this.clockDecoder.clock;
        h = s.Model.create(void 0, m);
      }
      this.doc = h;
      const b = this.cRoot(), k = h.root = new e.RootNode(this.doc, b.id);
      return b.parent = k, this.clockDecoder = void 0, h;
    }
    decodeClockTable() {
      const a = this.reader, h = a.u32(), g = a.x;
      a.x += h;
      const p = a.vu57(), b = a.vu57(), k = a.vu57();
      this.clockDecoder = new t.ClockDecoder(b, k);
      for (let m = 1; m < p; m++) {
        const _ = a.vu57(), f = a.vu57();
        this.clockDecoder.pushTuple(_, f);
      }
      a.x = g;
    }
    ts() {
      if (this.time < 0) {
        const [g, p] = this.reader.id();
        return this.clockDecoder.decodeId(g, p);
      } else
        return new r.Timestamp(1, this.reader.vu57());
    }
    cRoot() {
      const a = this.reader;
      return a.uint8[a.x] ? this.cNode() : s.UNDEFINED;
    }
    cNode() {
      const a = this.reader, h = this.ts(), g = a.u8(), p = g >> 5, b = g & 31;
      switch (p) {
        case c.CRDT_MAJOR.CON:
          return this.cCon(h, b);
        case c.CRDT_MAJOR.VAL:
          return this.cVal(h);
        case c.CRDT_MAJOR.OBJ:
          return this.cObj(h, b !== 31 ? b : a.vu57());
        case c.CRDT_MAJOR.VEC:
          return this.cVec(h, b !== 31 ? b : a.vu57());
        case c.CRDT_MAJOR.STR:
          return this.cStr(h, b !== 31 ? b : a.vu57());
        case c.CRDT_MAJOR.BIN:
          return this.cBin(h, b !== 31 ? b : a.vu57());
        case c.CRDT_MAJOR.ARR:
          return this.cArr(h, b !== 31 ? b : a.vu57());
      }
      throw new Error("UNKNOWN_NODE");
    }
    cCon(a, h) {
      const g = this.doc, p = h ? this.ts() : this.val(), b = new e.ConNode(a, p);
      return g.index.set(a, b), b;
    }
    cVal(a) {
      const h = this.cNode(), g = this.doc, p = new e.ValNode(g, a, h.id);
      return h.parent = p, g.index.set(a, p), p;
    }
    cObj(a, h) {
      const g = new e.ObjNode(this.doc, a);
      for (let p = 0; p < h; p++)
        this.cObjChunk(g);
      return this.doc.index.set(a, g), g;
    }
    cObjChunk(a) {
      const h = this.key(), g = this.cNode();
      g.parent = a, a.keys.set(h, g.id);
    }
    cVec(a, h) {
      const g = this.reader, p = new e.VecNode(this.doc, a), b = p.elements;
      for (let k = 0; k < h; k++)
        if (!g.peak())
          g.x++, b.push(void 0);
        else {
          const _ = this.cNode();
          _.parent = p, b.push(_.id);
        }
      return this.doc.index.set(a, p), p;
    }
    cStr(a, h) {
      const g = new e.StrNode(a);
      return h && g.ingest(h, this.cStrChunk), this.doc.index.set(a, g), g;
    }
    cBin(a, h) {
      const g = new e.BinNode(a);
      return h && g.ingest(h, this.cBinChunk), this.doc.index.set(a, g), g;
    }
    cArr(a, h) {
      const g = new e.ArrNode(this.doc, a);
      return h && g.ingest(h, () => {
        const p = this.ts(), [b, k] = this.reader.b1vu56();
        if (b)
          return new e.ArrChunk(p, k, void 0);
        const m = [];
        for (let _ = 0; _ < k; _++) {
          const f = this.cNode();
          f.parent = g, m.push(f.id);
        }
        return new e.ArrChunk(p, k, m);
      }), this.doc.index.set(a, g), g;
    }
  };
  return $n.Decoder = u, $n;
}
var ta;
function xh() {
  if (ta) return Nt;
  ta = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.decoder = Nt.encoder = void 0;
  const n = _h(), e = Sh();
  return Nt.encoder = new n.Encoder(), Nt.decoder = new e.Decoder(), Nt;
}
var Di = {}, pe = {}, tr = {}, $r = {}, na;
function Zs() {
  if (na) return $r;
  na = 1, Object.defineProperty($r, "__esModule", { value: !0 }), $r.hasOwnProperty = e;
  const n = Object.prototype.hasOwnProperty;
  function e(t, i) {
    return n.call(t, i);
  }
  return $r;
}
var ra;
function Eu() {
  if (ra) return tr;
  ra = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.get = void 0;
  const n = Zs(), e = (t, i) => {
    const r = i.length;
    let s;
    if (!r)
      return t;
    for (let o = 0; o < r; o++)
      if (s = i[o], t instanceof Array) {
        if (typeof s != "number") {
          if (s === "-")
            return;
          const c = ~~s;
          if ("" + c !== s)
            return;
          s = c;
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
  return tr.get = e, tr;
}
var qi = {}, ia;
function Hs() {
  return ia || (ia = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.isInteger = n.isRoot = n.toPath = void 0, n.unescapeComponent = s, n.escapeComponent = o, n.parseJsonPointer = c, n.formatJsonPointer = u, n.isChild = a, n.isPathEqual = h, n.parent = p, n.isValidIndex = b;
    const e = /~1/g, t = /~0/g, i = /~/g, r = /\//g;
    function s(m) {
      return m.indexOf("~") === -1 ? m : m.replace(e, "/").replace(t, "~");
    }
    function o(m) {
      return m.indexOf("/") === -1 && m.indexOf("~") === -1 ? m : m.replace(i, "~0").replace(r, "~1");
    }
    function c(m) {
      return m ? m.slice(1).split("/").map(s) : [];
    }
    function u(m) {
      return (0, n.isRoot)(m) ? "" : "/" + m.map((_) => o(String(_))).join("/");
    }
    const l = (m) => typeof m == "string" ? c(m) : m;
    n.toPath = l;
    function a(m, _) {
      if (m.length >= _.length)
        return !1;
      for (let f = 0; f < m.length; f++)
        if (m[f] !== _[f])
          return !1;
      return !0;
    }
    function h(m, _) {
      if (m.length !== _.length)
        return !1;
      for (let f = 0; f < m.length; f++)
        if (m[f] !== _[f])
          return !1;
      return !0;
    }
    const g = (m) => !m.length;
    n.isRoot = g;
    function p(m) {
      if (m.length < 1)
        throw new Error("NO_PARENT");
      return m.slice(0, m.length - 1);
    }
    function b(m) {
      if (typeof m == "number")
        return !0;
      const _ = Number.parseInt(m, 10);
      return String(_) === m && _ >= 0;
    }
    const k = (m) => {
      const _ = m.length;
      let f = 0, d;
      for (; f < _; ) {
        if (d = m.charCodeAt(f), d >= 48 && d <= 57) {
          f++;
          continue;
        }
        return !1;
      }
      return !0;
    };
    n.isInteger = k;
  })(qi)), qi;
}
var nr = {}, Ui = {}, Fi = {}, sa;
function Oh() {
  return sa || (sa = 1, Object.defineProperty(Fi, "__esModule", { value: !0 })), Fi;
}
var zi = {}, oa;
function Nh() {
  return oa || (oa = 1, (function(n) {
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
  })(zi)), zi;
}
var je = {}, aa;
function Ch() {
  if (aa) return je;
  aa = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.isObjectReference = je.isArrayEnd = je.isArrayReference = je.find = void 0;
  const n = Zs(), { isArray: e } = Array, t = (o, c) => {
    const u = c.length;
    if (!u)
      return { val: o };
    let l, a;
    for (let g = 0; g < u; g++)
      if (l = o, a = c[g], e(l)) {
        const p = l.length;
        if (a === "-")
          a = p;
        else if (typeof a == "string") {
          const b = ~~a;
          if ("" + b !== a)
            throw new Error("INVALID_INDEX");
          if (a = b, a < 0)
            throw new Error("INVALID_INDEX");
        }
        o = l[a];
      } else if (typeof l == "object" && l)
        o = (0, n.hasOwnProperty)(l, a) ? l[a] : void 0;
      else
        throw new Error("NOT_FOUND");
    return { val: o, obj: l, key: a };
  };
  je.find = t;
  const i = (o) => e(o.obj) && typeof o.key == "number";
  je.isArrayReference = i;
  const r = (o) => o.obj.length === o.key;
  je.isArrayEnd = r;
  const s = (o) => typeof o.obj == "object" && typeof o.key == "string";
  return je.isObjectReference = s, je;
}
var Zi = {}, rr = {}, ca;
function Ih() {
  if (ca) return rr;
  ca = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.findByPointer = void 0;
  const n = Zs(), e = Hs(), { isArray: t } = Array, i = (r, s) => {
    if (!r)
      return { val: s };
    let o, c, u = 0, l = 1;
    for (; u > -1; )
      if (u = r.indexOf("/", l), c = u > -1 ? r.substring(l, u) : r.substring(l), l = u + 1, o = s, t(o)) {
        const a = o.length;
        if (c === "-")
          c = a;
        else {
          const h = ~~c;
          if ("" + h !== c)
            throw new Error("INVALID_INDEX");
          if (c = h, c < 0)
            throw "INVALID_INDEX";
        }
        s = o[c];
      } else if (typeof o == "object" && o)
        c = (0, e.unescapeComponent)(c), s = (0, n.hasOwnProperty)(o, c) ? o[c] : void 0;
      else
        throw "NOT_FOUND";
    return { val: s, obj: o, key: c };
  };
  return rr.findByPointer = i, rr;
}
var ua;
function Th() {
  return ua || (ua = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(Ih(), n);
  })(Zi)), Zi;
}
var la;
function Ah() {
  return la || (la = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Oh(), n), e.__exportStar(Hs(), n), e.__exportStar(Nh(), n), e.__exportStar(Eu(), n), e.__exportStar(Ch(), n), e.__exportStar(Th(), n);
  })(Ui)), Ui;
}
var ha;
function jh() {
  if (ha) return nr;
  ha = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.find = void 0;
  const n = Ah(), e = St(), t = (i, r) => {
    const s = (0, n.toPath)(r);
    let o = i;
    const c = s.length;
    if (!c)
      return o;
    let u = 0;
    for (; u < c && o; ) {
      const l = s[u++];
      if (o = o.container(), !o)
        throw new Error("NOT_CONTAINER");
      if (o instanceof e.ObjNode) {
        const a = o.get(String(l));
        if (!a)
          throw new Error("NOT_FOUND");
        o = a;
      } else if (o instanceof e.ArrNode) {
        const a = o.getNode(Number(l));
        if (!a)
          throw new Error("NOT_FOUND");
        o = a;
      } else if (o instanceof e.VecNode) {
        const a = o.get(Number(l));
        if (!a)
          throw new Error("NOT_FOUND");
        o = a;
      }
    }
    return o;
  };
  return nr.find = t, nr;
}
var ir = {}, Ee = {}, sr = {}, da;
function Pu() {
  if (da) return sr;
  da = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.FanOut = void 0;
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
  return sr.FanOut = n, sr;
}
var fa;
function Ru() {
  if (fa) return Ee;
  fa = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.OnNewFanOut = Ee.MapFanOut = Ee.MicrotaskBufferFanOut = Ee.MergeFanOut = void 0;
  const n = Pu();
  class e extends n.FanOut {
    constructor(o, c = (u) => u) {
      super(), this.fanouts = o, this.mappper = c, this.unsubs = [];
    }
    listen(o) {
      this.listeners.size || (this.unsubs = this.fanouts.map((u) => u.listen((l) => this.emit(this.mappper(l)))));
      const c = super.listen(o);
      return () => {
        if (c(), !this.listeners.size) {
          for (const u of this.unsubs)
            u();
          this.unsubs = [];
        }
      };
    }
  }
  Ee.MergeFanOut = e;
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
      const c = super.listen(o);
      return () => {
        c(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), this.buffer = [], (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  Ee.MicrotaskBufferFanOut = t;
  class i extends n.FanOut {
    constructor(o, c) {
      super(), this.source = o, this.mapper = c, this.unsub = void 0;
    }
    listen(o) {
      this.unsub || (this.unsub = this.source.listen((u) => this.emit(this.mapper(u))));
      const c = super.listen(o);
      return () => {
        c(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  Ee.MapFanOut = i;
  class r extends n.FanOut {
    constructor(o, c = void 0) {
      super(), this.source = o, this.last = c, this.unsub = void 0;
    }
    listen(o) {
      this.unsub || (this.unsub = this.source.listen((u) => {
        this.last !== u && this.emit(this.last = u);
      }));
      const c = super.listen(o);
      return () => {
        c(), this.listeners.size || this.clear();
      };
    }
    clear() {
      var o;
      this.listeners.clear(), this.last = void 0, (o = this.unsub) == null || o.call(this), this.unsub = void 0;
    }
  }
  return Ee.OnNewFanOut = r, Ee;
}
var pa;
function Eh() {
  if (pa) return ir;
  pa = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.NodeEvents = void 0;
  const n = Ru();
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
  return ir.NodeEvents = e, ir;
}
var or = {}, ya;
function Ph() {
  if (ya) return or;
  ya = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.ExtNode = void 0;
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
  return or.ExtNode = e, or;
}
var It = {}, Hi = {}, Ji = {}, ga;
function Rh() {
  return ga || (ga = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.deepEqual = void 0;
    const e = Array.isArray, t = Object.prototype, i = (r, s) => {
      if (r === s)
        return !0;
      let o = 0, c = 0;
      if (e(r)) {
        if (!e(s) || (o = r.length, o !== s.length))
          return !1;
        for (c = o; c-- !== 0; )
          if (!(0, n.deepEqual)(r[c], s[c]))
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
            for (let a = 0; a < l; a++)
              if (r[a] !== s[a])
                return !1;
            return !0;
          }
        }
        const u = Object.keys(r);
        if (o = u.length, o !== Object.keys(s).length || e(s))
          return !1;
        for (c = o; c-- !== 0; ) {
          const l = u[c];
          if (!(0, n.deepEqual)(r[l], s[l]))
            return !1;
        }
        return !0;
      }
      return !1;
    };
    n.deepEqual = i;
  })(Ji)), Ji;
}
var va;
function Lh() {
  return va || (va = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(Rh(), n);
  })(Hi)), Hi;
}
var ar = {}, ba;
function Bh() {
  if (ba) return ar;
  ba = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.cmpUint8Array = void 0;
  const n = (e, t) => {
    const i = e.length;
    if (i !== t.length)
      return !1;
    for (let r = 0; r < i; r++)
      if (e[r] !== t[r])
        return !1;
    return !0;
  };
  return ar.cmpUint8Array = n, ar;
}
var Ki = {}, ma;
function Js() {
  return ma || (ma = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.apply = n.invert = n.dst = n.src = n.diffEdit = n.diff = n.overlap = n.sfx = n.pfx = n.normalize = void 0;
    const e = (d) => {
      const y = d.length;
      if (y < 2)
        return d;
      let v = 0;
      e: {
        if (!d[0][1])
          break e;
        for (v = 1; v < y; v++) {
          const S = d[v - 1], N = d[v];
          if (!N[1] || S[0] === N[0])
            break e;
        }
        return d;
      }
      const w = [];
      for (let S = 0; S < v; S++)
        w.push(d[S]);
      for (let S = v; S < y; S++) {
        const N = d[S];
        if (!N[1])
          continue;
        const C = w.length > 0 ? w[w.length - 1] : null;
        C && C[0] === N[0] ? C[1] += N[1] : w.push(N);
      }
      return w;
    };
    n.normalize = e;
    const t = (d) => {
      const y = d.charCodeAt(0);
      return y >= 56320 && y <= 57343;
    }, i = (d) => {
      const y = d.charCodeAt(d.length - 1);
      return y >= 55296 && y <= 56319;
    }, r = (d, y) => {
      d.push([0, ""]);
      let v = 0, w = 0, S = 0, N = "", C = "", E = 0;
      for (; v < d.length; ) {
        if (v < d.length - 1 && !d[v][1]) {
          d.splice(v, 1);
          continue;
        }
        const I = d[v];
        switch (I[0]) {
          case 1:
            S++, v++, C += I[1];
            break;
          case -1:
            w++, v++, N += I[1];
            break;
          case 0: {
            let j = v - S - w - 1;
            if (y) {
              const L = d[j];
              if (j >= 0) {
                let ue = L[1];
                if (i(ue)) {
                  const G = ue.slice(-1);
                  if (L[1] = ue = ue.slice(0, -1), N = G + N, C = G + C, !ue) {
                    d.splice(j, 1), v--;
                    let he = j - 1;
                    const oe = d[he];
                    if (oe) {
                      const se = oe[0];
                      se === 1 ? (S++, he--, C = oe[1] + C) : se === -1 && (w++, he--, N = oe[1] + N);
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
              const L = S + w, Z = N.length, K = C.length;
              Z === 0 && K === 0 ? (d.splice(v - L, L), v = v - L) : Z === 0 ? (d.splice(v - L, L, [1, C]), v = v - L + 1) : K === 0 ? (d.splice(v - L, L, [-1, N]), v = v - L + 1) : (d.splice(v - L, L, [-1, N], [1, C]), v = v - L + 2);
            }
            const B = d[v - 1];
            v !== 0 && B[0] === 0 ? (B[1] += d[v][1], d.splice(v, 1)) : v++, S = 0, w = 0, N = "", C = "";
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
      O && r(d, y);
    }, s = (d, y, v, w) => {
      if (v > 0 && v < d.length) {
        const C = d.charCodeAt(v);
        C >= 56320 && C <= 57343 && v--;
      }
      if (w > 0 && w < y.length) {
        const C = y.charCodeAt(w);
        C >= 56320 && C <= 57343 && w--;
      }
      const S = h(d.slice(0, v), y.slice(0, w), !1), N = h(d.slice(v), y.slice(w), !1);
      return S.concat(N);
    }, o = (d, y) => {
      const v = d.length, w = y.length, S = Math.ceil((v + w) / 2), N = S, C = 2 * S, E = new Array(C), O = new Array(C);
      for (let Z = 0; Z < C; Z++)
        E[Z] = -1, O[Z] = -1;
      E[N + 1] = 0, O[N + 1] = 0;
      const I = v - w, j = I % 2 !== 0;
      let P = 0, R = 0, B = 0, L = 0;
      for (let Z = 0; Z < S; Z++) {
        for (let K = -Z + P; K <= Z - R; K += 2) {
          const ue = N + K;
          let G = 0;
          const he = E[ue - 1], oe = E[ue + 1];
          K === -Z || K !== Z && he < oe ? G = oe : G = he + 1;
          let se = G - K;
          for (; G < v && se < w && d.charAt(G) === y.charAt(se); )
            G++, se++;
          if (E[ue] = G, G > v)
            R += 2;
          else if (se > w)
            P += 2;
          else if (j) {
            const ie = N + I - K, Se = O[ie];
            if (ie >= 0 && ie < C && Se !== -1 && G >= v - Se)
              return s(d, y, G, se);
          }
        }
        for (let K = -Z + B; K <= Z - L; K += 2) {
          const ue = N + K;
          let G = K === -Z || K !== Z && O[ue - 1] < O[ue + 1] ? O[ue + 1] : O[ue - 1] + 1, he = G - K;
          for (; G < v && he < w && d.charAt(v - G - 1) === y.charAt(w - he - 1); )
            G++, he++;
          if (O[ue] = G, G > v)
            L += 2;
          else if (he > w)
            B += 2;
          else if (!j) {
            const oe = N + I - K, se = E[oe];
            if (oe >= 0 && oe < C && se !== -1) {
              const ie = N + se - oe;
              if (G = v - G, se >= G)
                return s(d, y, se, ie);
            }
          }
        }
      }
      return [
        [-1, d],
        [1, y]
      ];
    }, c = (d, y) => {
      if (!d)
        return [[1, y]];
      if (!y)
        return [[-1, d]];
      const v = d.length, w = y.length, S = v > w ? d : y, N = v > w ? y : d, C = N.length, E = S.indexOf(N);
      if (E >= 0) {
        const O = S.slice(0, E), I = S.slice(E + C);
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
        [1, y]
      ] : o(d, y);
    }, u = (d, y) => {
      if (!d || !y || d.charAt(0) !== y.charAt(0))
        return 0;
      let v = 0, w = Math.min(d.length, y.length), S = w, N = 0;
      for (; v < S; )
        d.slice(N, S) === y.slice(N, S) ? (v = S, N = v) : w = S, S = Math.floor((w - v) / 2 + v);
      const C = d.charCodeAt(S - 1);
      return C >= 55296 && C <= 56319 && S--, S;
    };
    n.pfx = u;
    const l = (d, y) => {
      if (!d || !y || d.slice(-1) !== y.slice(-1))
        return 0;
      let v = 0, w = Math.min(d.length, y.length), S = w, N = 0;
      for (; v < S; )
        d.slice(d.length - S, d.length - N) === y.slice(y.length - S, y.length - N) ? (v = S, N = v) : w = S, S = Math.floor((w - v) / 2 + v);
      if (S > 0 && S < d.length) {
        const C = d.length - S - 1, E = d.charCodeAt(C), O = E >= 55296 && E <= 56319, I = E === 8205 || // ZWJ
        E >= 65024 && E <= 65039 || // Variation selectors
        E >= 768 && E <= 879;
        if (O || I)
          for (S--; S > 0; ) {
            const j = d.length - S - 1;
            if (j < 0)
              break;
            const P = d.charCodeAt(j), R = P >= 55296 && P <= 56319, B = P === 8205 || P >= 65024 && P <= 65039 || P >= 768 && P <= 879;
            if (!R && !B)
              break;
            S--;
          }
      }
      return S;
    };
    n.sfx = l;
    const a = (d, y) => {
      const v = d.length, w = y.length;
      if (v === 0 || w === 0)
        return 0;
      let S = v;
      if (v > w ? (S = w, d = d.substring(v - w)) : v < w && (y = y.substring(0, v)), d === y)
        return S;
      let N = 0, C = 1;
      for (; ; ) {
        const E = d.substring(S - C), O = y.indexOf(E);
        if (O === -1)
          return N;
        C += O, (O === 0 || d.substring(S - C) === y.substring(0, C)) && (N = C, C++);
      }
    };
    n.overlap = a;
    const h = (d, y, v) => {
      if (d === y)
        return d ? [[0, d]] : [];
      const w = (0, n.pfx)(d, y), S = d.slice(0, w);
      d = d.slice(w), y = y.slice(w);
      const N = (0, n.sfx)(d, y), C = d.slice(d.length - N);
      d = d.slice(0, d.length - N), y = y.slice(0, y.length - N);
      const E = c(d, y);
      return S && E.unshift([0, S]), C && E.push([0, C]), r(E, v), E;
    }, g = (d, y) => h(d, y, !0);
    n.diff = g;
    const p = (d, y, v) => {
      e: {
        if (v < 0)
          break e;
        const w = d.length, S = y.length;
        if (w === S)
          break e;
        const N = y.slice(v), C = N.length;
        if (C > w || d.slice(w - C) !== N)
          break e;
        if (S > w) {
          const I = w - C, j = d.slice(0, I), P = y.slice(0, I);
          if (j !== P)
            break e;
          const R = y.slice(I, v), B = [];
          return j && B.push([0, j]), R && B.push([1, R]), N && B.push([0, N]), B;
        } else {
          const I = S - C, j = y.slice(0, I), P = d.slice(0, I);
          if (P !== j)
            break e;
          const R = d.slice(I, w - C), B = [];
          return P && B.push([0, P]), R && B.push([-1, R]), N && B.push([0, N]), B;
        }
      }
      return (0, n.diff)(d, y);
    };
    n.diffEdit = p;
    const b = (d) => {
      let y = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const S = d[w];
        S[0] !== 1 && (y += S[1]);
      }
      return y;
    };
    n.src = b;
    const k = (d) => {
      let y = "";
      const v = d.length;
      for (let w = 0; w < v; w++) {
        const S = d[w];
        S[0] !== -1 && (y += S[1]);
      }
      return y;
    };
    n.dst = k;
    const m = (d) => {
      const y = d[0];
      return y === 0 ? d : y === 1 ? [-1, d[1]] : [1, d[1]];
    }, _ = (d) => d.map(m);
    n.invert = _;
    const f = (d, y, v, w) => {
      const S = d.length;
      let N = y;
      for (let C = S - 1; C >= 0; C--) {
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
  })(Ki)), Ki;
}
var Wi = {}, wa;
function Vh() {
  return wa || (wa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.dst = n.src = n.apply = n.diff = n.toBin = n.toStr = void 0;
    const t = re.__importStar(Js()), i = (l) => {
      let a = "";
      const h = l.length;
      for (let g = 0; g < h; g++)
        a += String.fromCharCode(l[g]);
      return a;
    };
    n.toStr = i;
    const r = (l) => {
      const a = l.length, h = new Uint8Array(a);
      for (let g = 0; g < a; g++)
        h[g] = l.charCodeAt(g);
      return h;
    };
    n.toBin = r;
    const s = (l, a) => {
      const h = (0, n.toStr)(l), g = (0, n.toStr)(a);
      return t.diff(h, g);
    };
    n.diff = s;
    const o = (l, a, h, g) => t.apply(l, a, (p, b) => h(p, (0, n.toBin)(b)), g);
    n.apply = o;
    const c = (l) => (0, n.toBin)(t.src(l));
    n.src = c;
    const u = (l) => (0, n.toBin)(t.dst(l));
    n.dst = u;
  })(Wi)), Wi;
}
var Gi = {}, _a;
function Mh() {
  return _a || (_a = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.apply = n.diff = n.agg = void 0;
    const t = re.__importStar(Js()), i = (o) => {
      const c = [], u = o.length;
      let l = [];
      const a = (h, g) => {
        if (!g.length)
          return;
        const p = l.length;
        if (p) {
          const b = l[p - 1];
          if (b[0] === h) {
            b[1] += g;
            return;
          }
        }
        l.push([h, g]);
      };
      e: for (let h = 0; h < u; h++) {
        const g = o[h], p = g[0], b = g[1], k = b.indexOf(`
`);
        if (k < 0) {
          a(p, b);
          continue e;
        } else
          a(p, b.slice(0, k + 1)), l.length && c.push(l), l = [];
        let m = k;
        const _ = b.length;
        t: for (; m < _; ) {
          const f = b.indexOf(`
`, m + 1);
          if (f < 0) {
            a(p, b.slice(m + 1));
            break t;
          }
          c.push([[p, b.slice(m + 1, f + 1)]]), m = f;
        }
      }
      l.length && c.push(l);
      {
        const h = c.length;
        for (let g = 0; g < h; g++) {
          const p = c[g] = t.normalize(c[g]), b = p.length;
          e: {
            if (b < 2)
              break e;
            const k = p[0], m = p[1], _ = m[0];
            if (k[0] !== 0 || _ !== -1 && _ !== 1)
              break e;
            for (let f = 2; f < b; f++)
              if (p[f][0] !== _)
                break e;
            for (let f = g + 1; f < h; f++) {
              const d = c[f] = t.normalize(c[f]), y = d.length, v = k[1];
              let w, S;
              if (d.length > 1 && (w = d[0])[0] === _ && (S = d[1])[0] === 0 && v === w[1]) {
                p.splice(0, 1), m[1] = v + m[1], S[1] = v + S[1], d.splice(0, 1);
                break e;
              } else
                for (let N = 0; N < y; N++)
                  if (d[N][0] !== _)
                    break e;
            }
          }
          e: {
            if (p.length < 2)
              break e;
            const k = p[p.length - 1], m = k[1];
            if (k[0] !== -1)
              break e;
            t: for (let _ = g + 1; _ < h; _++) {
              const f = c[_] = t.normalize(c[_]), d = f.length;
              let y;
              if (d === 0)
                continue t;
              if (d === 1) {
                if (y = f[0], y[0] === -1)
                  continue t;
                if (f[0][0] !== 0)
                  break e;
              } else if (y = f[1], d > 2 || f[0][0] !== -1)
                break e;
              const v = y[0];
              if (v === -1)
                continue t;
              if (v !== 0)
                break e;
              const w = y[1];
              if (w.length > m.length || !m.endsWith(w))
                break e;
              const S = m.length - w.length;
              k[1] = m.slice(0, S), p.push([0, w]), y[0] = -1, c[g] = t.normalize(c[g]), c[_] = t.normalize(c[_]);
              break e;
            }
          }
        }
      }
      return c;
    };
    n.agg = i;
    const r = (o, c) => {
      if (!c.length)
        return o.map((f, d) => [-1, d, -1]);
      if (!o.length)
        return c.map((f, d) => [1, -1, d]);
      const u = o.join(`
`) + `
`, l = c.join(`
`) + `
`;
      if (u === l)
        return [];
      const a = t.diff(u, l), h = (0, n.agg)(a), g = h.length, p = [];
      let b = -1, k = -1;
      const m = o.length, _ = c.length;
      for (let f = 0; f < g; f++) {
        const d = h[f];
        let y = d.length;
        if (!y)
          continue;
        const v = d[y - 1], w = v[0], S = v[1];
        if (S === `
`)
          d.splice(y - 1, 1);
        else {
          const C = S.length;
          S[C - 1] === `
` && (C === 1 ? d.splice(y - 1, 1) : v[1] = S.slice(0, C - 1));
        }
        let N = 0;
        if (y = d.length, !y)
          w === 0 ? (N = 0, b++, k++) : w === 1 ? (N = 1, k++) : w === -1 && (N = -1, b++);
        else if (f + 1 === g)
          b + 1 < m ? k + 1 < _ ? (N = y === 1 && d[0][0] === 0 ? 0 : 2, b++, k++) : (N = -1, b++) : (N = 1, k++);
        else {
          const E = d[0][0];
          y === 1 && E === w && E === 0 ? (b++, k++) : w === 0 ? (N = 2, b++, k++) : w === 1 ? (N = 1, k++) : w === -1 && (N = -1, b++);
        }
        N === 0 && o[b] !== c[k] && (N = 2), p.push([N, b, k]);
      }
      return p;
    };
    n.diff = r;
    const s = (o, c, u, l) => {
      const a = o.length;
      e: for (let h = a - 1; h >= 0; h--) {
        const [g, p, b] = o[h];
        switch (g) {
          case 0:
            continue e;
          case -1:
            c(p);
            break;
          case 1:
            u(p, b);
            break;
          case 2:
            l(p, b);
            break;
        }
      }
    };
    n.apply = s;
  })(Gi)), Gi;
}
var Xi = {}, cr = {}, ka;
function vi() {
  if (ka) return cr;
  ka = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.sort = void 0;
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
  return cr.sort = n, cr;
}
var Yi = {}, Sa;
function Ks() {
  return Sa || (Sa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.hash = n.updateJson = n.updateBin = n.updateStr = n.updateNum = n.CONST = void 0;
    const e = vi();
    var t;
    (function(u) {
      u[u.START_STATE = 5381] = "START_STATE", u[u.NULL = 982452847] = "NULL", u[u.TRUE = 982453247] = "TRUE", u[u.FALSE = 982454243] = "FALSE", u[u.ARRAY = 982452259] = "ARRAY", u[u.STRING = 982453601] = "STRING", u[u.OBJECT = 982454533] = "OBJECT", u[u.BINARY = 982454837] = "BINARY";
    })(t || (n.CONST = t = {}));
    const i = (u, l) => (u << 5) + u + l;
    n.updateNum = i;
    const r = (u, l) => {
      const a = l.length;
      u = (0, n.updateNum)(u, t.STRING), u = (0, n.updateNum)(u, a);
      let h = a;
      for (; h; )
        u = (u << 5) + u + l.charCodeAt(--h);
      return u;
    };
    n.updateStr = r;
    const s = (u, l) => {
      const a = l.length;
      u = (0, n.updateNum)(u, t.BINARY), u = (0, n.updateNum)(u, a);
      let h = a;
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
            const g = l.length;
            u = (0, n.updateNum)(u, t.ARRAY);
            for (let p = 0; p < g; p++)
              u = (0, n.updateJson)(u, l[p]);
            return u;
          }
          if (l instanceof Uint8Array)
            return (0, n.updateBin)(u, l);
          u = (0, n.updateNum)(u, t.OBJECT);
          const a = (0, e.sort)(Object.keys(l)), h = a.length;
          for (let g = 0; g < h; g++) {
            const p = a[g];
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
    const c = (u) => (0, n.updateJson)(t.START_STATE, u) >>> 0;
    n.hash = c;
  })(Yi)), Yi;
}
var Qi = {}, xa;
function Lu() {
  return xa || (xa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHash = void 0;
    const e = vi(), t = Ks(), i = kt(), r = (s) => {
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
            let c = "[";
            for (let u = 0; u < o; u++)
              c += (0, n.structHash)(s[u]) + ";";
            return c + "]";
          } else {
            if (s instanceof Uint8Array)
              return (0, t.hash)(s).toString(36);
            {
              const o = Object.keys(s);
              (0, e.sort)(o);
              let c = "{";
              const u = o.length;
              for (let l = 0; l < u; l++) {
                const a = o[l];
                c += (0, t.hash)(a).toString(36) + ":" + (0, n.structHash)(s[a]) + ",";
              }
              return c + "}";
            }
          }
        default:
          return "U";
      }
    };
    n.structHash = r;
  })(Qi)), Qi;
}
var Oa;
function Dh() {
  return Oa || (Oa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHashCrdt = void 0;
    const e = vi(), t = Xu(), i = Ks(), r = Lu(), s = (o) => {
      if (o instanceof t.ConNode)
        return (0, r.structHash)(o.val);
      if (o instanceof t.ValNode)
        return (0, n.structHashCrdt)(o.node());
      if (o instanceof t.StrNode)
        return (0, i.hash)(o.view()).toString(36);
      if (o instanceof t.ObjNode) {
        let c = "{";
        const u = Array.from(o.keys.keys());
        (0, e.sort)(u);
        const l = u.length;
        for (let a = 0; a < l; a++) {
          const h = u[a], g = o.get(h);
          c += (0, i.hash)(h).toString(36) + ":" + (0, n.structHashCrdt)(g) + ",";
        }
        return c + "}";
      } else if (o instanceof t.ArrNode || o instanceof t.VecNode) {
        let c = "[";
        return o.children((u) => {
          c += (0, n.structHashCrdt)(u) + ";";
        }), c + "]";
      } else if (o instanceof t.BinNode)
        return (0, i.hash)(o.view()).toString(36);
      return "U";
    };
    n.structHashCrdt = s;
  })(Xi)), Xi;
}
var $i = {}, Na;
function qh() {
  return Na || (Na = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.structHashSchema = void 0;
    const e = vi(), t = yi(), i = Ks(), r = Lu(), s = (o) => {
      if (o instanceof t.nodes.con || o instanceof t.nodes.str || o instanceof t.nodes.bin)
        return (0, r.structHash)(o.raw);
      if (o instanceof t.nodes.val)
        return (0, n.structHashSchema)(o.value);
      if (o instanceof t.nodes.obj) {
        let c = "{";
        const u = { ...o.obj, ...o.opt }, l = Object.keys(u);
        (0, e.sort)(l);
        const a = l.length;
        for (let h = 0; h < a; h++) {
          const g = l[h], p = u[g];
          c += (0, i.hash)(g).toString(36) + ":" + (0, n.structHashSchema)(p) + ",";
        }
        return c + "}";
      } else if (o instanceof t.nodes.arr || o instanceof t.nodes.vec) {
        let c = "[";
        const u = o instanceof t.nodes.arr ? o.arr : o.value;
        for (const l of u)
          c += (0, n.structHashSchema)(l) + ";";
        return c + "]";
      }
      return (0, r.structHash)(o);
    };
    n.structHashSchema = s;
  })($i)), $i;
}
var Ca;
function Bu() {
  if (Ca) return It;
  Ca = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.JsonCrdtDiff = It.DiffError = void 0;
  const n = re, e = Lh(), t = Bh(), i = kt(), r = St(), s = n.__importStar(Js()), o = n.__importStar(Vh()), c = n.__importStar(Mh()), u = Dh(), l = qh();
  class a extends Error {
    constructor(p = "DIFF") {
      super(p);
    }
  }
  It.DiffError = a;
  let h = class {
    constructor(p) {
      this.model = p, this.builder = new i.PatchBuilder(p.clock.clone());
    }
    diffStr(p, b) {
      const k = p.view();
      if (k === b)
        return;
      const m = this.builder;
      s.apply(s.diff(k, b), k.length, (_, f) => m.insStr(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => m.del(p.id, p.findInterval(_, f)));
    }
    diffBin(p, b) {
      const k = p.view();
      if ((0, t.cmpUint8Array)(k, b))
        return;
      const m = this.builder;
      o.apply(o.diff(k, b), k.length, (_, f) => m.insBin(p.id, _ ? p.find(_ - 1) : p.id, f), (_, f) => m.del(p.id, p.findInterval(_, f)));
    }
    diffArr(p, b) {
      if (p.size() === 0) {
        const S = b.length;
        if (S === 0)
          return;
        let N = p.id;
        for (let C = 0; C < S; C++)
          N = this.builder.insArr(p.id, N, [this.buildView(b[C])]);
        return;
      } else if (b.length === 0) {
        const S = [];
        for (const N of p.chunks()) {
          if (N.del)
            continue;
          const C = N.id;
          S.push((0, i.tss)(C.sid, C.time, N.span));
        }
        S.length && this.builder.del(p.id, S);
        return;
      }
      const k = [];
      p.children((S) => k.push((0, u.structHashCrdt)(S)));
      const m = [], _ = b.length;
      for (let S = 0; S < _; S++)
        m.push((0, l.structHashSchema)(b[S]));
      const f = c.diff(k, m);
      if (!f.length)
        return;
      const d = [], y = [];
      c.apply(f, (S) => {
        const N = p.findInterval(S, 1);
        if (!N || !N.length)
          throw new a();
        y.push(...N);
      }, (S, N) => {
        const C = b[N], E = S >= 0 ? p.find(S) : p.id;
        if (!E)
          throw new a();
        d.push([E, [C]]);
      }, (S, N) => {
        const C = b[N];
        try {
          this.diffAny(p.getNode(S), C);
        } catch (E) {
          if (E instanceof a) {
            const O = p.findInterval(S, 1);
            y.push(...O);
            const I = S ? p.find(S - 1) : p.id;
            if (!I)
              throw new a();
            d.push([I, [C]]);
          } else
            throw E;
        }
      });
      const v = this.builder, w = d.length;
      for (let S = 0; S < w; S++) {
        const [N, C] = d[S];
        v.insArr(p.id, N, C.map((E) => this.buildView(E)));
      }
      y.length && v.del(p.id, y);
    }
    diffObj(p, b) {
      const k = this.builder, m = [], _ = /* @__PURE__ */ new Set();
      p.forEach((y) => {
        _.add(y), b[y] === void 0 && m.push([y, k.con(void 0)]);
      });
      const f = Object.keys(b), d = f.length;
      for (let y = 0; y < d; y++) {
        const v = f[y], w = b[v];
        if (_.has(v)) {
          const S = p.get(v);
          if (S)
            try {
              this.diffAny(S, w);
              continue;
            } catch (N) {
              if (!(N instanceof a))
                throw N;
            }
        }
        m.push([v, this.buildConView(w)]);
      }
      m.length && k.insObj(p.id, m);
    }
    diffVec(p, b) {
      const k = this.builder, m = [], _ = p.elements, f = _.length, d = b.length, y = p.doc.index, v = Math.min(f, d);
      for (let w = d; w < f; w++) {
        const S = _[w];
        if (S) {
          const N = y.get(S);
          if (!N || N instanceof r.ConNode && N.val === void 0)
            continue;
          m.push([w, k.con(void 0)]);
        }
      }
      e: for (let w = 0; w < v; w++) {
        const S = b[w], N = p.get(w);
        if (N) {
          try {
            this.diffAny(N, S);
            continue;
          } catch (C) {
            if (!(C instanceof a))
              throw C;
          }
          if (N instanceof r.ConNode && typeof S != "object") {
            const C = k.con(S);
            m.push([w, C]);
            continue e;
          }
        }
        m.push([w, this.buildConView(S)]);
      }
      for (let w = f; w < d; w++)
        m.push([w, this.buildConView(b[w])]);
      m.length && k.insVec(p.id, m);
    }
    diffVal(p, b) {
      try {
        this.diffAny(p.node(), b);
      } catch (k) {
        if (k instanceof a)
          this.builder.setVal(p.id, this.buildConView(b));
        else
          throw k;
      }
    }
    diffAny(p, b) {
      if (p instanceof r.ConNode) {
        b instanceof i.nodes.con && (b = b.raw);
        const k = p.val;
        if (k !== b && (k instanceof i.Timestamp && !(b instanceof i.Timestamp) || !(k instanceof i.Timestamp) && b instanceof i.Timestamp || !(0, e.deepEqual)(p.val, b)))
          throw new a();
      } else if (p instanceof r.StrNode) {
        if (b instanceof i.nodes.str && (b = b.raw), typeof b != "string")
          throw new a();
        this.diffStr(p, b);
      } else if (p instanceof r.ObjNode) {
        if (b instanceof i.nodes.obj && (b = b.opt ? { ...b.obj, ...b.opt } : b.obj), b instanceof i.NodeBuilder)
          throw new a();
        if (b instanceof Uint8Array)
          throw new a();
        if (!b || typeof b != "object" || Array.isArray(b))
          throw new a();
        this.diffObj(p, b);
      } else if (p instanceof r.ValNode)
        b instanceof i.nodes.val && (b = b.value), this.diffVal(p, b);
      else if (p instanceof r.ArrNode) {
        if (b instanceof i.nodes.arr && (b = b.arr), !Array.isArray(b))
          throw new a();
        this.diffArr(p, b);
      } else if (p instanceof r.VecNode) {
        if (b instanceof i.nodes.vec && (b = b.value), !Array.isArray(b))
          throw new a();
        this.diffVec(p, b);
      } else if (p instanceof r.BinNode) {
        if (b instanceof i.nodes.bin && (b = b.raw), !(b instanceof Uint8Array))
          throw new a();
        this.diffBin(p, b);
      } else
        throw new a();
    }
    diff(p, b) {
      return this.diffAny(p, b), this.builder.flush();
    }
    /** Diffs only keys present in the destination object. */
    diffDstKeys(p, b) {
      const k = this.builder, m = [], _ = Object.keys(b), f = _.length;
      for (let d = 0; d < f; d++) {
        const y = _[d], v = p.get(y), w = b[y];
        if (!v) {
          m.push([y, this.buildConView(w)]);
          continue;
        }
        try {
          this.diffAny(v, w);
        } catch (S) {
          if (S instanceof a)
            m.push([y, this.buildConView(w)]);
          else
            throw S;
        }
      }
      return m.length && k.insObj(p.id, m), this.builder.flush();
    }
    buildView(p) {
      const b = this.builder;
      return p instanceof i.Timestamp ? b.con(p) : p instanceof i.nodes.con ? b.con(p.raw) : b.json(p);
    }
    buildConView(p) {
      const b = this.builder;
      return p instanceof i.Timestamp ? b.con(p) : p instanceof i.nodes.con ? b.con(p.raw) : b.constOrJson(p);
    }
  };
  return It.JsonCrdtDiff = h, It;
}
var es = {}, Ia;
function Uh() {
  return Ia || (Ia = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.merge = n.diff = void 0;
    const e = Bu(), t = (r, s) => {
      const c = new e.JsonCrdtDiff(r.api.model).diff(r.node, s);
      return c.ops.length ? c : void 0;
    };
    n.diff = t;
    const i = (r, s) => {
      const o = (0, n.diff)(r, s);
      return o && r.api.model.applyLocalPatch(o), o;
    };
    n.merge = i;
  })(es)), es;
}
var ur = {}, Ta;
function Fh() {
  if (Ta) return ur;
  Ta = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.ChangeEvent = void 0;
  const n = kt(), e = (i) => i instanceof n.InsValOp || i instanceof n.InsObjOp || i instanceof n.InsVecOp || i instanceof n.InsStrOp || i instanceof n.InsBinOp || i instanceof n.InsArrOp || i instanceof n.UpdArrOp || i instanceof n.DelOp;
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
          const c = s, l = this.api.builder.patch.ops;
          for (let a = c; a < l.length; a++) {
            const h = l[a];
            if (e(h)) {
              const g = o.get(h.obj);
              g && r.add(g);
            }
          }
        } else if (s instanceof n.Patch) {
          const c = s.ops, u = c.length;
          for (let l = 0; l < u; l++) {
            const a = c[l];
            if (e(a)) {
              const h = o.get(a.obj);
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
          let c = o.parent;
          for (; c && !r.has(c); )
            r.add(c), c = c.parent;
        }
      }
      return r;
    }
  }
  return ur.ChangeEvent = t, ur;
}
var ts = {}, Aa;
function zh() {
  return Aa || (Aa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.proxy$ = n.proxy = void 0;
    const e = (i, r = []) => new Proxy(() => {
    }, {
      get: (s, o, c) => (r.push(String(o)), (0, n.proxy)(i, r)),
      apply: (s, o, c) => i(r, ...c)
    });
    n.proxy = e;
    const t = (i, r, s = []) => new Proxy({}, { get: (o, c, u) => c === r ? i(s) : (s.push(String(c)), (0, n.proxy$)(i, r, s)) });
    n.proxy$ = t;
  })(ts)), ts;
}
var ja;
function Zh() {
  if (ja) return pe;
  ja = 1, Object.defineProperty(pe, "__esModule", { value: !0 }), pe.ModelApi = pe.ArrApi = pe.BinApi = pe.StrApi = pe.ObjApi = pe.VecApi = pe.ValApi = pe.ConApi = pe.NodeApi = void 0;
  const n = re, e = Te(), t = Eu(), i = Hs(), r = jh(), s = St(), o = Eh(), c = Pu(), u = zs(), l = Ru(), a = Ph(), h = Bu(), g = n.__importStar(Uh()), p = Fh(), b = le(), k = zh(), m = (E) => {
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
      if (j instanceof a.ExtNode && (I = j), j instanceof s.VecNode && (I = j.ext()), !I)
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
      const [j, P] = m(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v)
          R.set({ [P]: I });
        else if (R instanceof N || R instanceof w || R instanceof S) {
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
          else if (R instanceof S) {
            if (!(I instanceof Uint8Array))
              break e;
            R.ins(L, I);
          }
        } else if (R instanceof y)
          R.set([[~~P, I]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    replace(O, I) {
      const [j, P] = m(O);
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
        } else if (R instanceof y)
          R.set([[~~P, I]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    remove(O, I = 1) {
      const [j, P] = m(O);
      e: try {
        const R = this.select(j, !0);
        if (R instanceof v) {
          const B = P + "";
          if (!R.has(B))
            break e;
          R.del([B]);
        } else if (R instanceof N || R instanceof w || R instanceof S) {
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
        } else if (R instanceof y)
          R.set([[~~P, void 0]]);
        else
          break e;
        return !0;
      } catch {
      }
      return !1;
    }
    diff(O) {
      return g.diff(this, O);
    }
    merge(O) {
      return g.merge(this, O);
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
  class y extends _ {
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
  pe.VecApi = y;
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
      const B = j.builder.nextTime(), L = new b.Timestamp(R.clock.sid, B), Z = P.insAt(O, L, I);
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
  class S extends _ {
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
  pe.BinApi = S;
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
      super(O.root, void 0), this.model = O, this.next = 0, this.onBeforeReset = new c.FanOut(), this.onReset = new c.FanOut(), this.onBeforePatch = new c.FanOut(), this.onPatch = new c.FanOut(), this.onBeforeLocalChange = new c.FanOut(), this.onLocalChange = new c.FanOut(), this.onLocalChanges = new l.MicrotaskBufferFanOut(this.onLocalChange), this.onBeforeTransaction = new c.FanOut(), this.onTransaction = new c.FanOut(), this.onChange = new l.MergeFanOut([this.onReset, this.onPatch, this.onLocalChange], (I) => new p.ChangeEvent(I, this)), this.onChanges = new l.MicrotaskBufferFanOut(this.onChange), this.onFlush = new c.FanOut(), this.inTx = !1, this.stopAutoFlush = void 0, this.subscribe = (I) => this.onChanges.listen(() => I()), this.getSnapshot = () => this.view(), this.api = this, this.builder = new u.PatchBuilder(O.clock), O.onbeforereset = () => this.onBeforeReset.emit(), O.onreset = (I) => this.onReset.emit(I), O.onbeforepatch = (I) => this.onBeforePatch.emit(I), O.onpatch = (I) => this.onPatch.emit(I);
    }
    wrap(O) {
      if (O instanceof s.ValNode)
        return O.api || (O.api = new d(O, this));
      if (O instanceof s.StrNode)
        return O.api || (O.api = new w(O, this));
      if (O instanceof s.BinNode)
        return O.api || (O.api = new S(O, this));
      if (O instanceof s.ArrNode)
        return O.api || (O.api = new N(O, this));
      if (O instanceof s.ObjNode)
        return O.api || (O.api = new v(O, this));
      if (O instanceof s.ConNode)
        return O.api || (O.api = new f(O, this));
      if (O instanceof s.VecNode)
        return O.api || (O.api = new y(O, this));
      if (O instanceof a.ExtNode) {
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
var Ea;
function Vu() {
  return Ea || (Ea = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(Zh(), n);
  })(Di)), Di;
}
var lr = {}, Pa;
function Hh() {
  if (Pa) return lr;
  Pa = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.randomSessionId = void 0;
  const n = 65535, e = 9007199254740991 - n, t = () => Math.floor(e * Math.random() + n);
  return lr.randomSessionId = t, lr;
}
var hr = {}, Ra;
function Jh() {
  if (Ra) return hr;
  Ra = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.Extensions = void 0;
  const n = Te();
  let e = class Mu {
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
      const i = new Mu();
      for (const r of Object.values(this.ext))
        i.register(r);
      return i;
    }
    toString(i = "") {
      const r = Object.keys(this.ext).map((s) => +s).sort();
      return "extensions" + (0, n.printTree)(i, r.map((s) => (o) => `${s}: ${this.ext[s].name}`));
    }
  };
  return hr.Extensions = e, hr;
}
var Tt = {}, ns = {}, rs = {}, La;
function Kh() {
  return La || (La = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(pi(), n);
  })(rs)), rs;
}
var Ba;
function Wh() {
  return Ba || (Ba = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.print = n.remove = n.insert = n.insertLeft = n.insertRight = void 0;
    const e = Kh(), t = JSON.stringify, i = (k, m, _) => {
      const f = m.p;
      if (!f)
        return k;
      const d = m === f.l;
      let y = f.bf | 0;
      switch (d ? f.bf = ++y : f.bf = --y, y) {
        case 0:
          return k;
        case 1:
        case -1:
          return i(k, f, m);
        default: {
          const v = _ === m.l;
          return d ? v ? (r(f, m), m.p ? k : m) : (o(f, m, _), _.p ? k : _) : v ? (c(f, m, _), _.p ? k : _) : (s(f, m), m.p ? k : m);
        }
      }
    }, r = (k, m) => {
      const _ = k.p, f = m.r;
      m.p = _, m.r = k, k.p = m, k.l = f, f && (f.p = k), _ && (_.l === k ? _.l = m : _.r = m);
      let d = k.bf, y = m.bf;
      d += -1 - (y > 0 ? y : 0), y += -1 + (d < 0 ? d : 0), k.bf = d, m.bf = y;
    }, s = (k, m) => {
      const _ = k.p, f = m.l;
      m.p = _, m.l = k, k.p = m, k.r = f, f && (f.p = k), _ && (_.l === k ? _.l = m : _.r = m);
      let d = k.bf, y = m.bf;
      d += 1 - (y < 0 ? y : 0), y += 1 + (d > 0 ? d : 0), k.bf = d, m.bf = y;
    }, o = (k, m, _) => {
      s(m, _), r(k, _);
    }, c = (k, m, _) => {
      r(m, _), s(k, _);
    }, u = (k, m, _) => (_.r = m, m.p = _, _.bf--, _.l ? k : i(k, _, m));
    n.insertRight = u;
    const l = (k, m, _) => (_.l = m, m.p = _, _.bf++, _.r ? k : i(k, _, m));
    n.insertLeft = l;
    const a = (k, m, _) => {
      if (!k)
        return m;
      const f = m.k;
      let d = k, y, v = 0;
      for (; y = (v = _(f, d.k)) < 0 ? d.l : d.r; )
        d = y;
      return v < 0 ? (0, n.insertLeft)(k, m, d) : (0, n.insertRight)(k, m, d);
    };
    n.insert = a;
    const h = (k, m) => {
      if (!k)
        return m;
      const _ = m.p, f = m.l, d = m.r;
      if (m.p = m.l = m.r = void 0, f && d)
        if (f.r) {
          let w = f, S = w;
          for (; S = w.r; )
            w = S;
          const N = w.l, C = w.p, E = N;
          return _ && (_.l === m ? _.l = w : _.r = w), w.p = _, w.r = d, w.bf = m.bf, f !== w && (w.l = f, f.p = w), d.p = w, C && (C.l === w ? C.l = E : C.r = E), E && (E.p = C), p(_ ? k : w, C, 1);
        } else {
          _ && (_.l === m ? _.l = f : _.r = f), f.p = _, f.r = d, d.p = f;
          const w = m.bf;
          if (_)
            return f.bf = w, g(k, f, 1);
          const S = w - 1;
          if (f.bf = S, S >= -1)
            return f;
          const N = d.l;
          return d.bf > 0 ? (c(f, d, N), N) : (s(f, d), d);
        }
      const y = f || d;
      return y && (y.p = _), _ ? _.l === m ? (_.l = y, g(k, _, 1)) : (_.r = y, p(k, _, 1)) : y;
    };
    n.remove = h;
    const g = (k, m, _) => {
      let f = m.bf | 0;
      f -= _, m.bf = f;
      let d = _;
      if (f === -1)
        return k;
      if (f < -1) {
        const v = m.r;
        if (v.bf <= 0)
          v.l && v.bf === 0 && (d = 0), s(m, v), m = v;
        else {
          const w = v.l;
          c(m, v, w), m = w;
        }
      }
      const y = m.p;
      return y ? y.l === m ? g(k, y, d) : p(k, y, d) : m;
    }, p = (k, m, _) => {
      let f = m.bf | 0;
      f += _, m.bf = f;
      let d = _;
      if (f === 1)
        return k;
      if (f > 1) {
        const v = m.l;
        if (v.bf >= 0)
          v.r && v.bf === 0 && (d = 0), r(m, v), m = v;
        else {
          const w = v.r;
          o(m, v, w), m = w;
        }
      }
      const y = m.p;
      return y ? y.l === m ? g(k, y, d) : p(k, y, d) : m;
    }, b = (k, m = "") => {
      if (!k)
        return "∅";
      const { bf: _, l: f, r: d, k: y, v } = k, w = v && typeof v == "object" && v.constructor === Object ? t(v) : v && typeof v == "object" ? v.toString(m) : t(v), S = y !== void 0 ? ` { ${t(y)} = ${w} }` : "", N = _ ? ` [${_}]` : "";
      return k.constructor.name + `${N}` + S + (0, e.printBinary)(m, [f ? (C) => (0, n.print)(f, C) : null, d ? (C) => (0, n.print)(d, C) : null]);
    };
    n.print = b;
  })(ns)), ns;
}
var dr = {}, is = {}, fr = {}, Va;
function Du() {
  if (Va) return fr;
  Va = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.first = void 0;
  const n = (e) => {
    let t = e;
    for (; t; )
      if (t.l)
        t = t.l;
      else
        return t;
    return t;
  };
  return fr.first = n, fr;
}
var pr = {}, Ma;
function Gh() {
  if (Ma) return pr;
  Ma = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.next = void 0;
  const n = Du(), e = (t) => {
    const i = t.r;
    if (i)
      return (0, n.first)(i);
    let r = t.p;
    for (; r && r.r === t; )
      t = r, r = r.p;
    return r;
  };
  return pr.next = e, pr;
}
var Da;
function qu() {
  return Da || (Da = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.remove = n.insert = n.insertLeft = n.insertRight = n.findOrNextLower = n.find = n.size = n.prev = n.last = n.next = n.first = void 0;
    const e = Du();
    Object.defineProperty(n, "first", { enumerable: !0, get: function() {
      return e.first;
    } });
    const t = Gh();
    Object.defineProperty(n, "next", { enumerable: !0, get: function() {
      return t.next;
    } });
    const i = (p) => {
      let b = p;
      for (; b; )
        if (b.r)
          b = b.r;
        else
          return b;
      return b;
    };
    n.last = i;
    const r = (p) => {
      if (p.l) {
        for (p = p.l; p.r; )
          p = p.r;
        return p;
      }
      let b = p.p;
      for (; b && b.l === p; )
        p = b, b = b.p;
      return b;
    };
    n.prev = r;
    const s = (p) => {
      const b = p.l, k = p.r;
      return 1 + (b ? s(b) : 0) + (k ? s(k) : 0);
    }, o = (p) => p ? s(p) : 0;
    n.size = o;
    const c = (p, b, k) => {
      let m = p;
      for (; m; ) {
        const _ = k(b, m.k);
        if (_ === 0)
          return m;
        m = _ < 0 ? m.l : m.r;
      }
      return m;
    };
    n.find = c;
    const u = (p, b, k) => {
      let m = p, _;
      for (; m; ) {
        const f = k(m.k, b);
        if (f === 0)
          return m;
        if (f > 0)
          m = m.l;
        else {
          const d = m.r;
          if (_ = m, !d)
            return _;
          m = d;
        }
      }
      return _;
    };
    n.findOrNextLower = u;
    const l = (p, b) => {
      const k = p.r = b.r;
      b.r = p, p.p = b, k && (k.p = p);
    };
    n.insertRight = l;
    const a = (p, b) => {
      const k = p.l = b.l;
      b.l = p, p.p = b, k && (k.p = p);
    };
    n.insertLeft = a;
    const h = (p, b, k) => {
      if (!p)
        return b;
      const m = b.k;
      let _ = p;
      for (; _; ) {
        const f = k(m, _.k), d = f < 0 ? _.l : _.r;
        if (d)
          _ = d;
        else {
          f < 0 ? (0, n.insertLeft)(b, _) : (0, n.insertRight)(b, _);
          break;
        }
      }
      return p;
    };
    n.insert = h;
    const g = (p, b) => {
      const k = b.p, m = b.l, _ = b.r;
      if (b.p = b.l = b.r = void 0, !m && !_) {
        if (k)
          k.l === b ? k.l = void 0 : k.r = void 0;
        else return;
        return p;
      } else if (m && _) {
        let d = m;
        for (; d.r; )
          d = d.r;
        return d.r = _, _.p = d, k ? (k.l === b ? k.l = m : k.r = m, m.p = k, p) : (m.p = void 0, m);
      }
      const f = m || _;
      if (f.p = k, k)
        k.l === b ? k.l = f : k.r = f;
      else return f;
      return p;
    };
    n.remove = g;
  })(is)), is;
}
var ss = {}, qa;
function Xh() {
  return qa || (qa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), re.__exportStar(Te(), n);
  })(ss)), ss;
}
var Ua;
function Yh() {
  if (Ua) return dr;
  Ua = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.createMap = void 0;
  const n = qu(), e = Xh(), t = (r, s) => r === s ? 0 : r < s ? -1 : 1, i = (r, s, o, c, u, l) => {
    class a {
      constructor(g) {
        this.min = void 0, this.root = void 0, this.max = void 0, this._size = 0, this.next = n.next, this.comparator = g || t;
      }
      set(g, p) {
        const b = this.root;
        if (b === void 0) {
          this._size = 1;
          const y = new r(g, p);
          return this.root = this.min = this.max = s(void 0, y, this.comparator);
        }
        const k = this.comparator;
        let m;
        const _ = this.max;
        if (m = k(g, _.k), m === 0)
          return _.v = p, _;
        if (m > 0) {
          const y = this.max = new r(g, p);
          return this.root = c(b, y, _), this._size++, y;
        }
        const f = this.min;
        if (m = k(g, f.k), m === 0)
          return f.v = p, f;
        if (m < 0) {
          const y = this.min = new r(g, p);
          return this.root = o(b, y, f), this._size++, y;
        }
        let d = b;
        do {
          if (m = k(g, d.k), m === 0)
            return d.v = p, d;
          if (m > 0) {
            const y = d.r;
            if (y === void 0) {
              const v = new r(g, p);
              return this.root = c(b, v, d), this._size++, v;
            }
            d = y;
          } else if (m < 0) {
            const y = d.l;
            if (y === void 0) {
              const v = new r(g, p);
              return this.root = o(b, v, d), this._size++, v;
            }
            d = y;
          }
        } while (!0);
      }
      find(g) {
        const p = this.comparator;
        let b = this.root;
        for (; b; ) {
          const k = +p(g, b.k);
          if (k === 0)
            return b;
          b = k < 0 ? b.l : b.r;
        }
      }
      get(g) {
        var p;
        return (p = this.find(g)) == null ? void 0 : p.v;
      }
      del(g) {
        const p = this.find(g);
        return p ? (p === this.max && (this.max = (0, n.prev)(p)), p === this.min && (this.min = (0, n.next)(p)), this.root = u(this.root, p), this._size--, !0) : !1;
      }
      clear() {
        this._size = 0, this.root = this.min = this.max = void 0;
      }
      has(g) {
        return !!this.find(g);
      }
      size() {
        return this._size;
      }
      isEmpty() {
        return !this.min;
      }
      getOrNextLower(g) {
        return (0, n.findOrNextLower)(this.root, g, this.comparator) || void 0;
      }
      forEach(g) {
        let p = this.first();
        if (p)
          do
            g(p);
          while (p = (0, n.next)(p));
      }
      first() {
        return this.min;
      }
      last() {
        return this.max;
      }
      iterator0() {
        let g = this.first();
        return () => {
          if (!g)
            return;
          const p = g;
          return g = (0, n.next)(g), p;
        };
      }
      iterator() {
        const g = this.iterator0();
        return {
          next: () => {
            const p = g();
            return { value: p, done: !p };
          }
        };
      }
      entries() {
        return { [Symbol.iterator]: () => this.iterator() };
      }
      toString(g) {
        return this.constructor.name + (0, e.printTree)(g, [(p) => l(this.root, p)]);
      }
    }
    return a;
  };
  return dr.createMap = i, dr;
}
var Fa;
function Qh() {
  if (Fa) return Tt;
  Fa = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.AvlMap = Tt.AvlNode = void 0;
  const n = Wh(), e = Yh();
  class t {
    constructor(r, s) {
      this.k = r, this.v = s, this.p = void 0, this.l = void 0, this.r = void 0, this.bf = 0;
    }
  }
  return Tt.AvlNode = t, Tt.AvlMap = (0, e.createMap)(t, n.insert, n.insertLeft, n.insertRight, n.remove, n.print), Tt;
}
var yr = {}, we = {}, za;
function Uu() {
  if (za) return we;
  za = 1, Object.defineProperty(we, "__esModule", { value: !0 }), we.remove2 = we.insert2 = we.prev2 = we.next2 = we.last2 = we.first2 = void 0;
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
    const a = u.r2 = l.r2;
    l.r2 = u, u.p2 = l, a && (a.p2 = u);
  }, s = (u, l) => {
    const a = u.l2 = l.l2;
    l.l2 = u, u.p2 = l, a && (a.p2 = u);
  }, o = (u, l, a) => {
    if (!u)
      return l;
    let h = u;
    for (; h; ) {
      const g = a(l, h), p = g < 0 ? h.l2 : h.r2;
      if (p)
        h = p;
      else {
        g < 0 ? s(l, h) : r(l, h);
        break;
      }
    }
    return u;
  };
  we.insert2 = o;
  const c = (u, l) => {
    const a = l.p2, h = l.l2, g = l.r2;
    if (l.p2 = l.l2 = l.r2 = void 0, !h && !g) {
      if (a)
        a.l2 === l ? a.l2 = void 0 : a.r2 = void 0;
      else return;
      return u;
    } else if (h && g) {
      let b = h;
      for (; b.r2; )
        b = b.r2;
      return b.r2 = g, g.p2 = b, a ? (a.l2 === l ? a.l2 = h : a.r2 = h, h.p2 = a, u) : (h.p2 = void 0, h);
    }
    const p = h || g;
    if (p.p2 = a, a)
      a.l2 === l ? a.l2 = p : a.r2 = p;
    else return p;
    return u;
  };
  return we.remove2 = c, we;
}
var Za;
function $h() {
  if (Za) return yr;
  Za = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.cmpNode = void 0;
  const n = St(), e = kt(), t = Uu(), i = (s, o) => {
    const c = (0, t.last2)(s.ids), u = (0, t.last2)(o.ids);
    return c && u && !(0, e.equal)(c.id, u.id) ? !1 : s.length() === o.length() && s.size() === o.size();
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
      const c = s.keys, u = o.keys, l = c.size, a = u.size;
      if (l !== a)
        return !1;
      for (const h of c.keys()) {
        const g = c.get(h), p = u.get(h);
        if (!g || !p || !(0, e.equal)(g, p))
          return !1;
      }
      return !0;
    } else {
      if (s instanceof n.ArrNode)
        return !(o instanceof n.ArrNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
      if (s instanceof n.VecNode) {
        if (!(o instanceof n.VecNode) || !(0, e.equal)(s.id, o.id))
          return !1;
        const c = s.elements, u = o.elements, l = c.length;
        if (l !== u.length)
          return !1;
        for (let a = 0; a < l; a++) {
          const h = c[a], g = u[a];
          if (h) {
            if (!g || !(0, e.equal)(h, g))
              return !1;
          } else if (g)
            return !1;
        }
        return !0;
      } else if (s instanceof n.BinNode)
        return !(o instanceof n.BinNode) || !(0, e.equal)(s.id, o.id) ? !1 : i(s, o);
    }
    return !1;
  };
  return yr.cmpNode = r, yr;
}
var Ha;
function Ws() {
  if (Ha) return Ot;
  Ha = 1, Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.Model = Ot.UNDEFINED = void 0;
  const n = re, e = n.__importStar(Zr()), t = n.__importStar(le()), i = xh(), r = Vu(), s = fi(), o = Hh(), c = St(), u = gi(), l = Te(), a = Jh(), h = Qh(), g = kt(), p = $h();
  Ot.UNDEFINED = new u.ConNode(s.ORIGIN, void 0);
  let b = class vs {
    /**
     * Use this method to generate a random session ID for an existing document.
     * It checks for the uniqueness of the session ID given the current peers in
     * the document. This reduces the chance of collision substantially.
     *
     * @returns A random session ID that is not used by any peer in the current
     *     document.
     */
    rndSid() {
      const m = this.clock, _ = m.sid, f = m.peers;
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
    static fromPatches(m) {
      if (!m.length)
        throw new Error("NO_PATCHES");
      const d = m[0].getId().sid;
      if (!d)
        throw new Error("NO_SID");
      const y = vs.create(void 0, d);
      return y.applyBatch(m), y;
    }
    constructor(m) {
      this.root = new c.RootNode(this, s.ORIGIN), this.index = new h.AvlMap(t.compare), this.ext = new a.Extensions(), this.tick = 0, this.onbeforepatch = void 0, this.onpatch = void 0, this.onbeforereset = void 0, this.onreset = void 0, this.clock = m, m.time || (m.time = 1);
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
    applyBatch(m) {
      const _ = m.length;
      for (let f = 0; f < _; f++)
        this.applyPatch(m[f]);
    }
    /**
     * Works like `applyPatch`, but is intended to be used by the local client
     * for locally generated patches. It checks if the model clock is ahead of
     * the patch clock and rebases the patch if necessary.
     *
     * @param patch A patch to apply to the document.
     */
    applyLocalPatch(m) {
      const _ = m.getId();
      if (_) {
        const f = this.clock;
        if (f.sid === _.sid) {
          const d = f.time;
          d > _.time && (m = m.rebase(d));
        }
      }
      this.applyPatch(m);
    }
    /**
     * Applies a single patch to the document. All mutations to the model must go
     * through this method. (With the only exception of local changes through API,
     * which have an alternative path.)
     *
     * @param patch A patch to apply to the document.
     */
    applyPatch(m) {
      var d, y;
      (d = this.onbeforepatch) == null || d.call(this, m);
      const _ = m.ops, { length: f } = _;
      for (let v = 0; v < f; v++)
        this.applyOperation(_[v]);
      this.tick++, (y = this.onpatch) == null || y.call(this, m);
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
    applyOperation(m) {
      this.clock.observe(m.id, m.span());
      const _ = this.index;
      if (m instanceof e.InsStrOp) {
        const f = _.get(m.obj);
        f instanceof c.StrNode && f.ins(m.ref, m.id, m.data);
      } else if (m instanceof e.NewObjOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.ObjNode(this, f));
      } else if (m instanceof e.NewArrOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.ArrNode(this, f));
      } else if (m instanceof e.NewStrOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.StrNode(f));
      } else if (m instanceof e.NewValOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.ValNode(this, f, s.ORIGIN));
      } else if (m instanceof e.NewConOp) {
        const f = m.id;
        _.get(f) || _.set(f, new u.ConNode(f, m.val));
      } else if (m instanceof e.InsObjOp) {
        const f = _.get(m.obj), d = m.data, y = d.length;
        if (f instanceof c.ObjNode)
          for (let v = 0; v < y; v++) {
            const w = d[v], S = _.get(w[1]);
            if (!S || f.id.time >= w[1].time)
              continue;
            S.parent = f;
            const N = f.put(w[0] + "", S.id);
            N && this._gcTree(N);
          }
      } else if (m instanceof e.InsVecOp) {
        const f = _.get(m.obj), d = m.data, y = d.length;
        if (f instanceof c.VecNode)
          for (let v = 0; v < y; v++) {
            const w = d[v], S = _.get(w[1]);
            if (!S || f.id.time >= w[1].time)
              continue;
            S.parent = f;
            const N = f.put(Number(w[0]), S.id);
            N && this._gcTree(N);
          }
      } else if (m instanceof e.InsValOp) {
        const f = m.obj, d = f.sid === 0 && f.time === 0 ? this.root : _.get(f);
        if (d instanceof c.ValNode) {
          const y = _.get(m.val);
          if (y) {
            y.parent = d;
            const v = d.set(m.val);
            v && this._gcTree(v);
          }
        }
      } else if (m instanceof e.InsArrOp) {
        const f = _.get(m.obj);
        if (f instanceof c.ArrNode) {
          const d = [], y = m.data, v = y.length;
          for (let w = 0; w < v; w++) {
            const S = y[w], N = _.get(S);
            N && (f.id.time >= S.time || (d.push(S), N.parent = f));
          }
          d.length && f.ins(m.ref, m.id, d);
        }
      } else if (m instanceof e.UpdArrOp) {
        const f = _.get(m.obj);
        if (f instanceof c.ArrNode) {
          const d = m.val, y = _.get(d);
          if (y) {
            y.parent = f;
            const v = f.upd(m.ref, d);
            v && this._gcTree(v);
          }
        }
      } else if (m instanceof e.DelOp) {
        const f = _.get(m.obj);
        if (f instanceof c.ArrNode) {
          const d = m.what.length;
          for (let y = 0; y < d; y++) {
            const v = m.what[y];
            for (let w = 0; w < v.span; w++) {
              const S = f.getById(new t.Timestamp(v.sid, v.time + w));
              S && this._gcTree(S);
            }
          }
          f.delete(m.what);
        } else (f instanceof c.StrNode || f instanceof c.BinNode) && f.delete(m.what);
      } else if (m instanceof e.NewBinOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.BinNode(f));
      } else if (m instanceof e.InsBinOp) {
        const f = _.get(m.obj);
        f instanceof c.BinNode && f.ins(m.ref, m.id, m.data);
      } else if (m instanceof e.NewVecOp) {
        const f = m.id;
        _.get(f) || _.set(f, new c.VecNode(this, f));
      }
    }
    /**
     * Recursively deletes a tree of nodes. Used when root node is overwritten or
     * when object contents of container node (object or array) is removed.
     *
     * @ignore
     */
    _gcTree(m) {
      if (m.sid === 0)
        return;
      const f = this.index.get(m);
      if (!f)
        return;
      f.parent = void 0;
      const d = f.api;
      d && d.events.handleDelete(), f.children((y) => this._gcTree(y.id)), this.index.del(m);
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
    fork(m = this.rndSid()) {
      const _ = this.clock instanceof t.ClockVector ? this.clock.fork(m) : this.clock.clone(), f = new vs(_);
      f.ext = this.ext.clone();
      const d = this.index, y = f.index;
      return d.forEach(({ v }) => {
        let w;
        if (v instanceof u.ConNode)
          w = v.clone();
        else if (v instanceof c.ValNode)
          w = v.clone(f);
        else if (v instanceof c.ObjNode)
          w = v.clone(f);
        else if (v instanceof c.VecNode)
          w = v.clone(f);
        else if (v instanceof c.StrNode)
          w = v.clone();
        else if (v instanceof c.BinNode)
          w = v.clone();
        else if (v instanceof c.ArrNode)
          w = v.clone(f);
        else
          throw new Error("UNKNOWN_NODE");
        y.set(w.id, w);
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
    reset(m) {
      var v, w;
      (v = this.onbeforereset) == null || v.call(this);
      const _ = this.index;
      this.index = new h.AvlMap(t.compare);
      const f = m.toBinary();
      i.decoder.decode(f, this), this.clock = m.clock.clone(), this.ext = m.ext.clone(), this.linkParents();
      const d = this._api;
      d && (d.flush(), d.builder.clock = this.clock, d.node = this.root);
      const y = /* @__PURE__ */ new Set();
      _.forEach(({ v: S }) => {
        const N = S.api;
        if (!N)
          return;
        const C = this.index.get(S.id);
        if (!C) {
          N.events.handleDelete();
          return;
        }
        N.node = C, C.api = N, S && C && !(0, p.cmpNode)(S, C) && y.add(C);
      }), this.tick++, (w = this.onreset) == null || w.call(this, y);
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
      const m = (f, d) => {
        d.parent = f, d.children((y) => m(d, y));
      }, _ = this.root;
      _.parent = void 0, _.children((f) => m(_, f));
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
    setSchema(m, _ = !0) {
      const f = this.clock;
      if (f.time === 1) {
        const y = f.sid;
        _ && (f.sid = 2), this.api.set(m), _ && this.setSid(y);
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
    setSid(m) {
      const _ = this.clock, f = _.sid;
      f !== m && (_.sid = m, _.observe(new t.Timestamp(f, _.time - 1), 1));
    }
    // ---------------------------------------------------------------- Printable
    toString(m = "") {
      const _ = () => "", f = this.ext.size() > 0;
      return "model" + (0, l.printTree)(m, [
        (d) => this.root.toString(d),
        _,
        (d) => {
          const y = [];
          return this.index.forEach((v) => y.push(v.v)), `index (${y.length} nodes)` + (y.length ? (0, l.printTree)(d, y.map((v) => (w) => `${v.name()} ${t.printTs(v.id)}`)) : "");
        },
        _,
        (d) => `view${(0, l.printTree)(d, [(y) => String(JSON.stringify(this.view(), null, 2)).replace(/\n/g, `
` + y)])}`,
        _,
        (d) => this.clock.toString(d),
        f ? _ : null,
        f ? (d) => this.ext.toString(d) : null
      ]);
    }
  };
  return Ot.Model = b, b.sid = o.randomSessionId, b.create = (k, m = b.sid()) => {
    const _ = typeof m == "number" ? m === 1 ? new t.ServerClockVector(1, 1) : new t.ClockVector(m, 1) : m, f = new b(_);
    return k !== void 0 && f.setSchema(k instanceof g.NodeBuilder ? k : g.s.json(k), !0), f;
  }, b.withServerClock = (k, m = 1) => b.create(k, new t.ServerClockVector(1, m)), b.fromBinary = (k) => i.decoder.decode(k), b.load = (k, m, _) => {
    const f = i.decoder.decode(k);
    return _ && f.setSchema(_, !0), typeof m == "number" && f.setSid(m), f;
  }, Ot;
}
var Ja;
function zu() {
  if (Ja) return Gn;
  Ja = 1, Object.defineProperty(Gn, "__esModule", { value: !0 }), Gn.ValNode = void 0;
  const n = le(), e = Te(), t = Ws();
  let i = class Fu {
    constructor(s, o, c) {
      this.doc = s, this.id = o, this.val = c, this.api = void 0, this.parent = void 0;
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
      return new Fu(s, this.id, this.val);
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      const o = this.node();
      return this.name() + " " + (0, n.printTs)(this.id) + (0, e.printTree)(s, [(u) => o ? o.toString(u) : (0, n.printTs)(this.val)]);
    }
  };
  return Gn.ValNode = i, Gn;
}
var gr = {}, Ka;
function ed() {
  if (Ka) return gr;
  Ka = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.RootNode = void 0;
  const n = fi(), e = zu();
  let t = class Zu extends e.ValNode {
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
      return new Zu(r, this.val);
    }
  };
  return gr.RootNode = t, gr;
}
var vr = {}, br = {}, Wa;
function td() {
  if (Wa) return br;
  Wa = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.CRDT_CONSTANTS = void 0;
  var n;
  return (function(e) {
    e[e.MAX_TUPLE_LENGTH = 255] = "MAX_TUPLE_LENGTH";
  })(n || (br.CRDT_CONSTANTS = n = {})), br;
}
var Ga;
function nd() {
  if (Ga) return vr;
  Ga = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.VecNode = void 0;
  const n = gi(), e = td(), t = Te(), i = le();
  let r = class Hu {
    constructor(o, c) {
      this.doc = o, this.id = c, this.elements = [], this.__extNode = void 0, this._view = [], this.api = void 0, this.parent = void 0;
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
      const c = this.elements[o];
      if (c)
        return this.doc.index.get(c);
    }
    /**
     * @ignore
     */
    put(o, c) {
      if (o > e.CRDT_CONSTANTS.MAX_TUPLE_LENGTH)
        throw new Error("OUT_OF_BOUNDS");
      const u = this.val(o);
      if (!(u && (0, i.compare)(u, c) >= 0)) {
        if (o > this.elements.length)
          for (let l = this.elements.length; l < o; l++)
            this.elements.push(void 0);
        return o < this.elements.length ? this.elements[o] = c : this.elements.push(c), u;
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
      const c = o.val, u = this.id;
      return !(c instanceof Uint8Array) || c.length !== 3 || c[1] !== u.sid % 256 || c[2] !== u.time % 256 ? -1 : c[0];
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
      const c = this.elements, u = c.length, l = this.doc.index;
      for (let a = 0; a < u; a++) {
        const h = c[a];
        if (!h)
          continue;
        const g = l.get(h);
        g && o(g);
      }
    }
    /** @ignore */
    view() {
      const o = this.ext();
      if (o)
        return o.view();
      let c = !0;
      const u = this._view, l = [], a = this.doc.index, h = this.elements, g = h.length;
      for (let p = 0; p < g; p++) {
        const b = h[p], k = b ? a.get(b) : void 0, m = k ? k.view() : void 0;
        u[p] !== m && (c = !1), l.push(m);
      }
      return c ? u : this._view = l;
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
      const c = new Hu(o, this.id), u = this.elements, l = u.length;
      for (let a = 0; a < l; a++)
        c.elements.push(u[a]);
      return c;
    }
    /** ----------------------------------------------------- {@link Printable} */
    toString(o = "") {
      const c = this.ext(), u = this.name() + " " + (0, i.printTs)(this.id) + (c ? ` { extension = ${this.getExtId()} }` : "");
      if (c)
        return this.child().toString(o, this.id);
      const l = this.doc.index;
      return u + (0, t.printTree)(o, [
        ...this.elements.map((a, h) => (g) => `${h}: ${a && l.get(a) ? l.get(a).toString(g + "  " + " ".repeat(("" + h).length)) : "nil"}`),
        ...c ? [(a) => `${this.child().toString(a)}`] : []
      ]);
    }
  };
  return vr.VecNode = r, vr;
}
var mr = {}, Xa;
function rd() {
  if (Xa) return mr;
  Xa = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.ObjNode = void 0;
  const n = Te(), e = le(), t = gi();
  let i = class Ju {
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
      const c = this.keys.get(s);
      if (!(c && (0, e.compare)(c, o) >= 0))
        return this.keys.set(s, o), c;
    }
    /**
     * Iterate over all key-value pairs in the object.
     *
     * @param callback Callback to call for each key-value pair.
     */
    nodes(s) {
      const o = this.doc.index;
      this.keys.forEach((c, u) => s(o.get(c), u));
    }
    forEach(s) {
      const o = this.doc.index;
      this.keys.forEach((c, u) => {
        const l = o.get(c);
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
      this.keys.forEach((c, u) => s(o.get(c)));
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
      const s = this.doc, o = s.clock.time + s.tick, c = this._view;
      if (this._tick === o)
        return c;
      const u = {}, l = s.index;
      let a = !0;
      return this.keys.forEach((h, g) => {
        const p = l.get(h);
        if (!p) {
          a = !1;
          return;
        }
        const b = p.view();
        b !== void 0 ? (c[g] !== b && (a = !1), u[g] = b) : c[g] !== void 0 && (a = !1);
      }), a ? c : (this._tick = o, this._view = u);
    }
    /** @ignore */
    clone(s) {
      const o = new Ju(s, this.id);
      return this.keys.forEach((c, u) => o.keys.set(u, c)), o;
    }
    // ---------------------------------------------------------------- Printable
    toString(s = "") {
      return this.name() + " " + (0, e.printTs)(this.id) + (0, n.printTree)(s, [...this.keys.entries()].filter(([, c]) => !!this.doc.index.get(c)).map(([c, u]) => (l) => JSON.stringify(c) + (0, n.printTree)(l + " ", [(a) => this.doc.index.get(u).toString(a)])));
    }
  };
  return mr.ObjNode = i, mr;
}
var At = {}, wr = {}, _r = {}, Ya;
function id() {
  if (Ya) return _r;
  Ya = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.printOctets = void 0;
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
  return _r.printOctets = n, _r;
}
var os = {}, Qa;
function sd() {
  return Qa || (Qa = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.rlSplay = n.lrSplay = n.llSplay = n.rrSplay = n.lSplay = n.rSplay = n.splay = void 0;
    const e = (u, l, a) => {
      const h = l.p;
      if (!h)
        return u;
      const g = h.p, p = h.l === l;
      return g ? (g.l === h ? p ? u = (0, n.llSplay)(u, l, h, g) : u = (0, n.lrSplay)(u, l, h, g) : p ? u = (0, n.rlSplay)(u, l, h, g) : u = (0, n.rrSplay)(u, l, h, g), a > 1 ? (0, n.splay)(u, l, a - 1) : u) : (p ? (0, n.rSplay)(l, h) : (0, n.lSplay)(l, h), l);
    };
    n.splay = e;
    const t = (u, l) => {
      const a = u.r;
      u.p = void 0, u.r = l, l.p = u, l.l = a, a && (a.p = l);
    };
    n.rSplay = t;
    const i = (u, l) => {
      const a = u.l;
      u.p = void 0, u.l = l, l.p = u, l.r = a, a && (a.p = l);
    };
    n.lSplay = i;
    const r = (u, l, a, h) => {
      const g = a.l, p = l.l, b = h.p;
      return l.p = b, l.l = a, a.p = l, a.l = h, a.r = p, h.p = a, h.r = g, g && (g.p = h), p && (p.p = a), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    n.rrSplay = r;
    const s = (u, l, a, h) => {
      const g = a.r, p = l.r, b = h.p;
      return l.p = b, l.r = a, a.p = l, a.l = p, a.r = h, h.p = a, h.l = g, g && (g.p = h), p && (p.p = a), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    n.llSplay = s;
    const o = (u, l, a, h) => {
      const g = l.l, p = l.r, b = h.p;
      return l.p = b, l.l = a, l.r = h, a.p = l, a.r = g, h.p = l, h.l = p, g && (g.p = a), p && (p.p = h), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    n.lrSplay = o;
    const c = (u, l, a, h) => {
      const g = l.r, p = l.l, b = h.p;
      return l.p = b, l.l = h, l.r = a, a.p = l, a.l = g, h.p = l, h.r = p, g && (g.p = a), p && (p.p = h), b ? b.l === h ? b.l = l : b.r = l : u = l, u;
    };
    n.rlSplay = c;
  })(os)), os;
}
var as = {}, $a;
function od() {
  return $a || ($a = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.splay2 = void 0;
    const e = (u, l) => {
      const a = l.p2;
      if (!a)
        return u;
      const h = a.p2, g = a.l2 === l;
      return h ? (h.l2 === a ? g ? u = s(u, l, a, h) : u = o(u, l, a, h) : g ? u = c(u, l, a, h) : u = r(u, l, a, h), (0, n.splay2)(u, l)) : (g ? t(l, a) : i(l, a), l);
    };
    n.splay2 = e;
    const t = (u, l) => {
      const a = u.r2;
      u.p2 = void 0, u.r2 = l, l.p2 = u, l.l2 = a, a && (a.p2 = l);
    }, i = (u, l) => {
      const a = u.l2;
      u.p2 = void 0, u.l2 = l, l.p2 = u, l.r2 = a, a && (a.p2 = l);
    }, r = (u, l, a, h) => {
      const g = a.l2, p = l.l2, b = h.p2;
      return l.p2 = b, l.l2 = a, a.p2 = l, a.l2 = h, a.r2 = p, h.p2 = a, h.r2 = g, g && (g.p2 = h), p && (p.p2 = a), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, s = (u, l, a, h) => {
      const g = a.r2, p = l.r2, b = h.p2;
      return l.p2 = b, l.r2 = a, a.p2 = l, a.l2 = p, a.r2 = h, h.p2 = a, h.l2 = g, g && (g.p2 = h), p && (p.p2 = a), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, o = (u, l, a, h) => {
      const g = l.l2, p = l.r2, b = h.p2;
      return l.p2 = b, l.l2 = a, l.r2 = h, a.p2 = l, a.r2 = g, h.p2 = l, h.l2 = p, g && (g.p2 = a), p && (p.p2 = h), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    }, c = (u, l, a, h) => {
      const g = l.r2, p = l.l2, b = h.p2;
      return l.p2 = b, l.l2 = h, l.r2 = a, a.p2 = l, a.l2 = g, h.p2 = l, h.r2 = p, g && (g.p2 = a), p && (p.p2 = h), b ? b.l2 === h ? b.l2 = l : b.r2 = l : u = l, u;
    };
  })(as)), as;
}
var kr = {}, ec = {}, tc;
function ad() {
  if (tc) return ec;
  if (tc = 1, typeof Iterator > "u" && typeof globalThis == "object") {
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
  return ec;
}
var nc;
function cd() {
  if (nc) return kr;
  nc = 1, Object.defineProperty(kr, "__esModule", { value: !0 }), kr.UndEndIterator = void 0, ad();
  class n extends Iterator {
    constructor(i) {
      super(), this.n = i;
    }
    next() {
      const i = this.n();
      return new e(i, i === void 0);
    }
  }
  kr.UndEndIterator = n;
  class e {
    constructor(i, r) {
      this.value = i, this.done = r;
    }
  }
  return kr;
}
var rc;
function Gs() {
  if (rc) return wr;
  rc = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.AbstractRga = void 0;
  const n = le(), e = Fs(), t = id(), i = sd(), r = od(), s = Uu(), o = fi(), c = Te(), u = pi(), l = cd(), a = (_, f) => {
    const d = _.id, y = f.id;
    return d.sid - y.sid || d.time - y.time;
  }, h = (_) => {
    const f = _.l, d = _.r;
    _.len = (_.del ? 0 : _.span) + (f ? f.len : 0) + (d ? d.len : 0);
  }, g = (_) => {
    const f = _.l, d = _.r;
    _.len = _.span + (f ? f.len : 0) + (d ? d.len : 0);
  }, p = (_, f) => {
    for (; _; )
      _.len += f, _ = _.p;
  }, b = (_) => {
    const f = _.r;
    if (f) {
      _ = f;
      let y;
      for (; y = _.l; )
        _ = y;
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
      let y;
      for (; y = _.r; )
        _ = y;
      return _;
    }
    let d = _.p;
    for (; d && d.l === _; )
      _ = d, d = d.p;
    return d;
  };
  let m = class {
    constructor(f) {
      this.id = f, this.root = void 0, this.ids = void 0, this.count = 0;
    }
    // --------------------------------------------------------------- Public API
    ins(f, d, y) {
      const v = this.id, w = f.time, S = f.sid;
      if (v.time === w && v.sid === S) {
        this.insAfterRoot(f, d, y);
        return;
      }
      let C = this.ids, E = C;
      for (; C; ) {
        const L = C.id, Z = L.sid;
        if (Z > S)
          C = C.l2;
        else if (Z < S)
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
      if (j !== S || w - I >= P)
        return;
      const B = w - I;
      this.insAfterChunk(f, E, B, d, y);
    }
    insAt(f, d, y) {
      if (!f) {
        const E = this.id;
        return this.insAfterRoot(E, d, y), E;
      }
      const v = this.findChunk(f - 1);
      if (!v)
        return;
      const [w, S] = v, N = w.id, C = S === 0 ? N : new n.Timestamp(N.sid, N.time + S);
      return this.insAfterChunk(C, w, S, d, y), C;
    }
    insAfterRoot(f, d, y) {
      const v = this.createChunk(d, y), w = this.first();
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
    insAfterChunk(f, d, y, v, w) {
      const S = d.id, N = S.time, C = S.sid, E = d.span, O = this.createChunk(v, w);
      if (y + 1 < E) {
        const j = v.sid, P = v.time;
        if (C === j && N <= P && N + E - 1 >= P)
          return;
        if (P > f.time + 1 || j > f.sid) {
          this.insertInside(O, d, y + 1), this.splay(O);
          return;
        }
      }
      this.insertAfterRef(O, f, d), this.splay(O);
    }
    delete(f) {
      const d = f.length;
      for (let y = 0; y < d; y++)
        this.deleteSpan(f[y]);
      this.onChange();
    }
    deleteSpan(f) {
      const d = f.span, y = f.time, v = y + d - 1, w = this.findById(f);
      if (!w)
        return;
      let S = w, N = S;
      for (; S; ) {
        N = S;
        const C = S.id, E = S.span, O = C.time, I = O + E - 1;
        if (S.del) {
          if (I >= v)
            break;
          S = S.s;
          continue;
        }
        const j = y <= O, P = y <= I;
        if (j)
          if (v >= I) {
            if (S.delete(), p(S, -S.span), v <= I)
              break;
          } else {
            const B = v - O + 1, L = this.split(S, B);
            S.delete(), h(L), p(S, -S.span);
            break;
          }
        else if (P)
          if (v >= I) {
            const B = y - O, L = this.split(S, B);
            if (L.delete(), L.len = L.r ? L.r.len : 0, p(S, -L.span), v <= I)
              break;
          } else {
            const B = this.split(S, v - O + 1), L = this.split(S, y - O);
            L.delete(), h(B), h(L), p(S, -L.span);
            break;
          }
        S = S.s;
      }
      N && this.mergeTombstones2(w, N);
    }
    find(f) {
      let d = this.root;
      for (; d; ) {
        const y = d.l, v = y ? y.len : 0;
        let w;
        if (f < v)
          d = y;
        else if (d.del)
          f -= v, d = d.r;
        else if (f < v + (w = d.span)) {
          const S = f - v, N = d.id;
          return S ? new n.Timestamp(N.sid, N.time + S) : N;
        } else
          f -= v + w, d = d.r;
      }
    }
    findChunk(f) {
      let d = this.root;
      for (; d; ) {
        const y = d.l, v = y ? y.len : 0;
        let w;
        if (f < v)
          d = y;
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
      const y = [];
      if (!d)
        return y;
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
        return y;
      if (v.span >= d + w) {
        const C = v.id;
        return y.push((0, n.tss)(C.sid, C.time + w, d)), y;
      }
      const S = v.span - w, N = v.id;
      if (y.push((0, n.tss)(N.sid, N.time + w, S)), d -= S, v = b(v), !v)
        return y;
      do {
        if (v.del)
          continue;
        const C = v.id, E = v.span;
        if (d <= E)
          return y.push((0, n.tss)(C.sid, C.time, d)), y;
        y.push((0, n.tss)(C.sid, C.time, E)), d -= E;
      } while ((v = b(v)) && d > 0);
      return y;
    }
    /** Rename to .rangeX() method? */
    findInterval2(f, d) {
      const y = [];
      return this.range0(void 0, f, d, (v, w, S) => {
        const N = v.id;
        y.push((0, n.tss)(N.sid, N.time + w, S));
      }), y;
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
    range0(f, d, y, v) {
      let w = f || this.findById(d);
      if (f)
        for (; w && !(0, n.containsId)(w.id, w.span, d); )
          w = b(w);
      if (w) {
        if (w.del) {
          if ((0, n.containsId)(w.id, w.span, y))
            return;
        } else {
          const S = d.time - w.id.time;
          if ((0, n.containsId)(w.id, w.span, y)) {
            const E = y.time - d.time + 1;
            return v(w, S, E), w;
          }
          const C = w.span - S;
          if (v(w, S, C))
            return w;
        }
        for (w = b(w); w; ) {
          if ((0, n.containsId)(w.id, w.span, y))
            return !w.del && v(w, 0, y.time - w.id.time + 1), w;
          if (!w.del && v(w, 0, w.span))
            return w;
          w = b(w);
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
      const d = f.id, y = f.span;
      return y === 1 ? d : new n.Timestamp(d.sid, d.time + y - 1);
    }
    /** @todo Maybe use implementation from tree utils, if does not impact performance. */
    /** @todo Or better remove this method completely, as it does not require "this". */
    next(f) {
      return b(f);
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
      const d = f.p, y = f.l;
      if (!d)
        return y ? y.len : 0;
      const v = this.pos(d);
      if (d.r === f)
        return v + (d.del ? 0 : d.span) + (y ? y.len : 0);
      const S = f.r;
      return v - (f.del ? 0 : f.span) - (S ? S.len : 0);
    }
    chunks0() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = b(f)), d;
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
      const y = d.l;
      d.l = f, f.l = y, f.p = d;
      let v = 0;
      y && (y.p = f, v = y.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfter(f, d) {
      const y = d.r;
      d.r = f, f.r = y, f.p = d;
      let v = 0;
      y && (y.p = f, v = y.len), f.len = f.span + v, p(d, f.span), this.insertId(f), this.onChange();
    }
    insertAfterRef(f, d, y) {
      const v = f.id, w = v.sid, S = v.time;
      let N = !1;
      for (; ; ) {
        const C = y.id, E = C.time + y.span;
        y.s || (N = C.sid === w && E === S && E - 1 === d.time, N && (y.s = f));
        const O = b(y);
        if (!O)
          break;
        const I = O.id, j = I.time, P = I.sid;
        if (j < S)
          break;
        if (j === S) {
          if (P === w)
            return;
          if (P < w)
            break;
        }
        y = O;
      }
      N && !y.del ? (this.mergeContent(y, f.data), y.s = void 0) : this.insertAfter(f, y);
    }
    mergeContent(f, d) {
      const y = f.span;
      f.merge(d), p(f, f.span - y), this.onChange();
    }
    insertInside(f, d, y) {
      const v = d.p, w = d.l, S = d.r, N = d.s, C = d.len, E = d.split(y);
      if (d.s = E, E.s = N, d.l = d.r = E.l = E.r = void 0, E.l = void 0, f.p = v, !w)
        f.l = d, d.p = f;
      else {
        f.l = w, w.p = f;
        const j = w.r;
        w.r = d, d.p = w, d.l = j, j && (j.p = d);
      }
      if (!S)
        f.r = E, E.p = f;
      else {
        f.r = S, S.p = f;
        const j = S.l;
        S.l = E, E.p = S, E.r = j, j && (j.p = E);
      }
      v ? v.l === d ? v.l = f : v.r = f : this.root = f, h(d), h(E), w && (w.len = (w.l ? w.l.len : 0) + d.len + (w.del ? 0 : w.span)), S && (S.len = (S.r ? S.r.len : 0) + E.len + (S.del ? 0 : S.span)), f.len = C + f.span;
      const O = f.span;
      let I = f.p;
      for (; I; )
        I.len += O, I = I.p;
      this.insertId(E), this.insertIdFast(f), this.onChange();
    }
    split(f, d) {
      const y = f.s, v = f.split(d), w = f.r;
      return f.s = v, v.r = w, v.s = y, f.r = v, v.p = f, this.insertId(v), w && (w.p = v), v;
    }
    mergeTombstones(f, d) {
      if (!f.del || !d.del)
        return !1;
      const y = f.id, v = d.id;
      return y.sid !== v.sid || y.time + f.span !== v.time ? !1 : (f.s = d.s, f.span += d.span, this.deleteChunk(d), !0);
    }
    mergeTombstones2(f, d) {
      let y = f;
      for (; y; ) {
        const w = b(y);
        if (!w)
          break;
        if (!this.mergeTombstones(y, w)) {
          if (w === d) {
            if (w) {
              const N = b(w);
              N && this.mergeTombstones(w, N);
            }
            break;
          }
          y = y.s;
        }
      }
      const v = k(f);
      v && this.mergeTombstones(v, f);
    }
    rmTombstones() {
      let f = this.first();
      const d = [];
      for (; f; )
        f.del && d.push(f), f = b(f);
      for (let y = 0; y < d.length; y++)
        this.deleteChunk(d[y]);
    }
    deleteChunk(f) {
      this.deleteId(f);
      const d = f.p, y = f.l, v = f.r;
      if (f.id = o.ORIGIN, !y && !v)
        d ? d.l === f ? d.l = void 0 : d.r = void 0 : this.root = void 0;
      else if (y && v) {
        let w = y;
        for (; w.r; )
          w = w.r;
        w.r = v, v.p = w;
        const S = v.len;
        let N;
        for (N = w, d ? (d.l === f ? d.l = y : d.r = y, y.p = d) : (this.root = y, y.p = void 0); N && N !== d; )
          N.len += S, N = N.p;
      } else {
        const w = y || v;
        w.p = d, d ? d.l === f ? d.l = w : d.r = w : this.root = w;
      }
    }
    insertId(f) {
      this.ids = (0, s.insert2)(this.ids, f, a), this.count++, this.ids = (0, r.splay2)(this.ids, f);
    }
    insertIdFast(f) {
      this.ids = (0, s.insert2)(this.ids, f, a), this.count++;
    }
    deleteId(f) {
      this.ids = (0, s.remove2)(this.ids, f), this.count--;
    }
    findById(f) {
      const d = f.sid, y = f.time;
      let v = this.ids, w = v;
      for (; v; ) {
        const I = v.id, j = I.sid;
        if (j > d)
          v = v.l2;
        else if (j < d)
          w = v, v = v.r2;
        else {
          const P = I.time;
          if (P > y)
            v = v.l2;
          else if (P < y)
            w = v, v = v.r2;
          else {
            w = v;
            break;
          }
        }
      }
      if (!w)
        return;
      const S = w.id, N = S.time, C = S.sid, E = w.span;
      if (!(C !== d || y < N || y - N >= E))
        return w;
    }
    posById(f) {
      const d = this.findById(f);
      if (!d)
        return;
      const y = this.pos(d);
      return d.del ? y : y + (f.time - d.id.time);
    }
    /**
     * @param id ID of character to start the search from.
     * @returns Previous ID in the RGA sequence.
     */
    prevId(f) {
      let d = this.findById(f);
      if (!d)
        return;
      const y = f.time;
      if (d.id.time < y)
        return new n.Timestamp(f.sid, y - 1);
      if (d = k(d), !d)
        return;
      const v = d.id;
      return d.span > 1 ? new n.Timestamp(v.sid, v.time + d.span - 1) : v;
    }
    spanView(f) {
      const d = [];
      let y = f.span;
      const v = f.time;
      let w = this.findById(f);
      if (!w)
        return d;
      if (!w.del)
        if (w.span >= y + v - w.id.time) {
          const S = v - w.id.time, N = S + y, C = w.view().slice(S, N);
          return d.push(C), d;
        } else {
          const S = v - w.id.time, N = w.view().slice(S, f.span);
          y -= w.span - S, d.push(N);
        }
      for (; w = w.s; ) {
        const S = w.span;
        if (!w.del) {
          if (S > y) {
            const N = w.view().slice(0, y);
            d.push(N);
            break;
          }
          d.push(w.data);
        }
        if (y -= S, y <= 0)
          break;
      }
      return d;
    }
    // ---------------------------------------------------------- Splay balancing
    splay(f) {
      const d = f.p;
      if (!d)
        return;
      const y = d.p, v = d.l === f;
      if (!y) {
        v ? (0, i.rSplay)(f, d) : (0, i.lSplay)(f, d), this.root = f, h(d), g(f);
        return;
      }
      y.l === d ? v ? this.root = (0, i.llSplay)(this.root, f, d, y) : this.root = (0, i.lrSplay)(this.root, f, d, y) : v ? this.root = (0, i.rlSplay)(this.root, f, d, y) : this.root = (0, i.rrSplay)(this.root, f, d, y), h(y), h(d), g(f), this.splay(f);
    }
    // ---------------------------------------------------------- Export / Import
    iterator() {
      let f = this.first();
      return () => {
        const d = f;
        return f && (f = b(f)), d;
      };
    }
    ingest(f, d) {
      if (f < 1)
        return;
      const y = /* @__PURE__ */ new Map();
      this.root = this._ingest(f, () => {
        const v = d(), w = v.id, S = w.sid + "." + w.time, N = y.get(S);
        N && (N.s = v, y.delete(S));
        const C = (0, n.tick)(w, v.span);
        return y.set(C.sid + "." + C.time, v), v;
      });
    }
    _ingest(f, d) {
      const y = f >> 1, v = f - y - 1, w = y > 0 ? this._ingest(y, d) : void 0, S = d();
      w && (S.l = w, w.p = S);
      const N = v > 0 ? this._ingest(v, d) : void 0;
      return N && (S.r = N, N.p = S), h(S), this.insertId(S), S;
    }
    // ---------------------------------------------------------------- Printable
    toStringName() {
      return "AbstractRga";
    }
    toString(f = "") {
      const d = this.view();
      let y = "";
      return (0, e.isUint8Array)(d) ? y += ` { ${(0, t.printOctets)(d) || "∅"} }` : typeof d == "string" && (y += `{ ${d.length > 32 ? JSON.stringify(d.substring(0, 32)) + " …" : JSON.stringify(d)} }`), `${this.toStringName()} ${(0, n.printTs)(this.id)} ${y}` + (0, c.printTree)(f, [(w) => this.root ? this.printChunk(w, this.root) : "∅"]);
    }
    printChunk(f, d) {
      return this.formatChunk(d) + (0, u.printBinary)(f, [
        d.l ? (y) => this.printChunk(y, d.l) : null,
        d.r ? (y) => this.printChunk(y, d.r) : null
      ]);
    }
    formatChunk(f) {
      let y = `chunk ${(0, n.printTs)(f.id)}:${f.span} .${f.len}.`;
      if (f.del)
        y += ` [${f.span}]`;
      else if ((0, e.isUint8Array)(f.data))
        y += ` { ${(0, t.printOctets)(f.data) || "∅"} }`;
      else if (typeof f.data == "string") {
        const v = f.data.length > 32 ? JSON.stringify(f.data.substring(0, 32)) + " …" : JSON.stringify(f.data);
        y += ` { ${v} }`;
      }
      return y;
    }
  };
  return wr.AbstractRga = m, wr;
}
var ic;
function ud() {
  if (ic) return At;
  ic = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.ArrNode = At.ArrChunk = void 0;
  const n = Gs(), e = le(), t = pi(), i = Te();
  class r {
    constructor(c, u, l) {
      this.id = c, this.span = u, this.len = l ? u : 0, this.del = !l, this.p = void 0, this.l = void 0, this.r = void 0, this.s = void 0, this.data = l;
    }
    merge(c) {
      this.data.push(...c), this.span = this.data.length;
    }
    split(c) {
      const u = this.span;
      if (this.span = c, !this.del) {
        const a = this.data.splice(c);
        return new r((0, e.tick)(this.id, c), u - c, a);
      }
      return new r((0, e.tick)(this.id, c), u - c, void 0);
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
  At.ArrChunk = r;
  let s = class Ku extends n.AbstractRga {
    constructor(c, u) {
      super(u), this.doc = c, this._tick = 0, this._view = [], this.api = void 0, this.parent = void 0;
    }
    /**
     * Returns a reference to an element at a given position in the array.
     *
     * @param position The position of the element to get.
     * @returns An element of the array, if any.
     */
    get(c) {
      const u = this.findChunk(c);
      if (u)
        return u[0].data[u[1]];
    }
    /**
     * Returns a JSON node at a given position in the array.
     *
     * @param position The position of the element to get.
     * @returns A JSON node, if any.
     */
    getNode(c) {
      const u = this.get(c);
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
    getId(c) {
      const u = this.findChunk(c);
      if (!u)
        return;
      const [l, a] = u, h = l.id;
      return a ? (0, e.tick)(h, a) : h;
    }
    getById(c) {
      const u = this.findById(c);
      if (!u || u.del)
        return;
      const l = c.time - u.id.time;
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
    upd(c, u) {
      const l = this.findById(c);
      if (!l)
        return;
      const a = l.data;
      if (!a)
        return;
      const h = c.time - l.id.time, g = a[h];
      if (!(g && (0, e.compare)(g, u) >= 0))
        return a[h] = u, this.onChange(), g;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(c, u) {
      return new r(c, u ? u.length : 0, u);
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
      const c = this.doc, u = c.clock.time + c.tick, l = this._view;
      if (this._tick === u)
        return l;
      const a = [], h = c.index;
      let g = !0;
      for (let b = this.first(); b; b = this.next(b))
        if (!b.del)
          for (const k of b.data) {
            const m = h.get(k);
            if (!m) {
              g = !1;
              continue;
            }
            const _ = m.view();
            l[a.length] !== _ && (g = !1), a.push(_);
          }
      return l.length !== a.length && (g = !1), g ? l : (this._tick = u, this._view = a);
    }
    /** @ignore */
    children(c) {
      const u = this.doc.index;
      for (let l = this.first(); l; l = this.next(l)) {
        const a = l.data;
        if (!a)
          continue;
        const h = a.length;
        for (let g = 0; g < h; g++)
          c(u.get(a[g]));
      }
    }
    /** @ignore */
    clone(c) {
      const u = new Ku(c, this.id), l = this.count;
      if (!l)
        return u;
      let a = this.first();
      return u.ingest(l, () => {
        const h = a.clone();
        return a = this.next(a), h;
      }), u;
    }
    // ---------------------------------------------------------------- Printable
    /** @ignore */
    printChunk(c, u) {
      const l = this.pos(u);
      let a = "";
      if (!u.del) {
        const h = this.doc.index;
        a = (0, i.printTree)(c, u.data.map((g) => h.get(g)).filter((g) => !!g).map((g, p) => (b) => `[${l + p}]: ${g.toString(b + "    " + " ".repeat(String(p).length))}`));
      }
      return this.formatChunk(u) + a + (0, t.printBinary)(c, [
        u.l ? (h) => this.printChunk(h, u.l) : null,
        u.r ? (h) => this.printChunk(h, u.r) : null
      ]);
    }
  };
  return At.ArrNode = s, At;
}
var jt = {}, sc;
function ld() {
  if (sc) return jt;
  sc = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt.BinNode = jt.BinChunk = void 0;
  const n = le(), e = Gs();
  class t {
    constructor(s, o, c) {
      this.id = s, this.span = o, this.len = c ? o : 0, this.del = !c, this.p = void 0, this.l = void 0, this.r = void 0, this.s = void 0, this.data = c;
    }
    merge(s) {
      const o = this.data.length, c = new Uint8Array(o + s.length);
      c.set(this.data), c.set(s, o), this.data = c, this.span = c.length;
    }
    split(s) {
      if (!this.del) {
        const c = this.data, u = c.subarray(s), l = new t((0, n.tick)(this.id, s), this.span - s, u);
        return this.data = c.subarray(0, s), this.span = s, l;
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
  jt.BinChunk = t;
  let i = class Wu extends e.AbstractRga {
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
      let o = 0, c = this.first();
      for (; c; ) {
        if (!c.del) {
          const u = c.data;
          s.set(u, o), o += u.length;
        }
        c = this.next(c);
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
      const s = new Wu(this.id), o = this.count;
      if (!o)
        return s;
      let c = this.first();
      return s.ingest(o, () => {
        const u = c.clone();
        return c = this.next(c), u;
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
  return jt.BinNode = i, jt;
}
var Et = {}, oc;
function hd() {
  if (oc) return Et;
  oc = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.StrNode = Et.StrChunk = void 0;
  const n = le(), e = Gs(), t = qu();
  class i {
    constructor(o, c, u) {
      this.id = o, this.span = c, this.len = u ? c : 0, this.del = !u, this.p = void 0, this.l = void 0, this.r = void 0, this.p2 = void 0, this.l2 = void 0, this.r2 = void 0, this.s = void 0, this.data = u;
    }
    merge(o) {
      this.data += o, this.span = this.data.length;
    }
    split(o) {
      if (!this.del) {
        const u = new i((0, n.tick)(this.id, o), this.span - o, this.data.slice(o));
        return this.data = this.data.slice(0, o), this.span = o, u;
      }
      const c = new i((0, n.tick)(this.id, o), this.span - o, "");
      return this.span = o, c;
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
  Et.StrChunk = i;
  let r = class Gu extends e.AbstractRga {
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
      for (let c = this.first(); c; c = (0, t.next)(c))
        o += c.data;
      return this._view = o;
    }
    name() {
      return "str";
    }
    /** @ignore */
    clone() {
      const o = new Gu(this.id), c = this.count;
      if (!c)
        return o;
      let u = this.first();
      return o.ingest(c, () => {
        const l = u.clone();
        return u = this.next(u), l;
      }), o;
    }
    // -------------------------------------------------------------- AbstractRga
    /** @ignore */
    createChunk(o, c) {
      return new i(o, c ? c.length : 0, c || "");
    }
    /** @ignore */
    onChange() {
      this._view = "";
    }
    toStringName() {
      return this.name();
    }
  };
  return Et.StrNode = r, Et;
}
var ac;
function dd() {
  return ac || (ac = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.StrChunk = n.StrNode = n.BinChunk = n.BinNode = n.ArrChunk = n.ArrNode = n.ObjNode = n.VecNode = n.RootNode = n.ValNode = n.ConNode = void 0;
    var e = gi();
    Object.defineProperty(n, "ConNode", { enumerable: !0, get: function() {
      return e.ConNode;
    } });
    var t = zu();
    Object.defineProperty(n, "ValNode", { enumerable: !0, get: function() {
      return t.ValNode;
    } });
    var i = ed();
    Object.defineProperty(n, "RootNode", { enumerable: !0, get: function() {
      return i.RootNode;
    } });
    var r = nd();
    Object.defineProperty(n, "VecNode", { enumerable: !0, get: function() {
      return r.VecNode;
    } });
    var s = rd();
    Object.defineProperty(n, "ObjNode", { enumerable: !0, get: function() {
      return s.ObjNode;
    } });
    var o = ud();
    Object.defineProperty(n, "ArrNode", { enumerable: !0, get: function() {
      return o.ArrNode;
    } }), Object.defineProperty(n, "ArrChunk", { enumerable: !0, get: function() {
      return o.ArrChunk;
    } });
    var c = ld();
    Object.defineProperty(n, "BinNode", { enumerable: !0, get: function() {
      return c.BinNode;
    } }), Object.defineProperty(n, "BinChunk", { enumerable: !0, get: function() {
      return c.BinChunk;
    } });
    var u = hd();
    Object.defineProperty(n, "StrNode", { enumerable: !0, get: function() {
      return u.StrNode;
    } }), Object.defineProperty(n, "StrChunk", { enumerable: !0, get: function() {
      return u.StrChunk;
    } });
  })(Oi)), Oi;
}
var cc;
function St() {
  return cc || (cc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(Xl(), n), e.__exportStar(dd(), n);
  })(Si)), Si;
}
var cs = {}, uc;
function fd() {
  return uc || (uc = 1, Object.defineProperty(cs, "__esModule", { value: !0 })), cs;
}
var us = {}, lc;
function pd() {
  return lc || (lc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 }), n.Model = void 0;
    const e = re;
    var t = Ws();
    Object.defineProperty(n, "Model", { enumerable: !0, get: function() {
      return t.Model;
    } }), e.__exportStar(Vu(), n);
  })(us)), us;
}
var hc;
function Xu() {
  return hc || (hc = 1, (function(n) {
    Object.defineProperty(n, "__esModule", { value: !0 });
    const e = re;
    e.__exportStar(St(), n), e.__exportStar(fd(), n), e.__exportStar(pd(), n), e.__exportStar(kt(), n);
  })(ki)), ki;
}
var yd = Xu(), F = yi(), dc = kt(), ve = Uint8Array, Ce = Uint16Array, Xs = Int32Array, bi = new ve([
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
]), mi = new ve([
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
]), bs = new ve([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Yu = function(n, e) {
  for (var t = new Ce(31), i = 0; i < 31; ++i)
    t[i] = e += 1 << n[i - 1];
  for (var r = new Xs(t[30]), i = 1; i < 30; ++i)
    for (var s = t[i]; s < t[i + 1]; ++s)
      r[s] = s - t[i] << 5 | i;
  return { b: t, r };
}, Qu = Yu(bi, 2), $u = Qu.b, ms = Qu.r;
$u[28] = 258, ms[258] = 28;
var el = Yu(mi, 0), gd = el.b, fc = el.r, ws = new Ce(32768);
for (var ce = 0; ce < 32768; ++ce) {
  var it = (ce & 43690) >> 1 | (ce & 21845) << 1;
  it = (it & 52428) >> 2 | (it & 13107) << 2, it = (it & 61680) >> 4 | (it & 3855) << 4, ws[ce] = ((it & 65280) >> 8 | (it & 255) << 8) >> 1;
}
var Je = (function(n, e, t) {
  for (var i = n.length, r = 0, s = new Ce(e); r < i; ++r)
    n[r] && ++s[n[r] - 1];
  var o = new Ce(e);
  for (r = 1; r < e; ++r)
    o[r] = o[r - 1] + s[r - 1] << 1;
  var c;
  if (t) {
    c = new Ce(1 << e);
    var u = 15 - e;
    for (r = 0; r < i; ++r)
      if (n[r])
        for (var l = r << 4 | n[r], a = e - n[r], h = o[n[r] - 1]++ << a, g = h | (1 << a) - 1; h <= g; ++h)
          c[ws[h] >> u] = l;
  } else
    for (c = new Ce(i), r = 0; r < i; ++r)
      n[r] && (c[r] = ws[o[n[r] - 1]++] >> 15 - n[r]);
  return c;
}), mt = new ve(288);
for (var ce = 0; ce < 144; ++ce)
  mt[ce] = 8;
for (var ce = 144; ce < 256; ++ce)
  mt[ce] = 9;
for (var ce = 256; ce < 280; ++ce)
  mt[ce] = 7;
for (var ce = 280; ce < 288; ++ce)
  mt[ce] = 8;
var Pr = new ve(32);
for (var ce = 0; ce < 32; ++ce)
  Pr[ce] = 5;
var vd = /* @__PURE__ */ Je(mt, 9, 0), bd = /* @__PURE__ */ Je(mt, 9, 1), md = /* @__PURE__ */ Je(Pr, 5, 0), wd = /* @__PURE__ */ Je(Pr, 5, 1), ls = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, Pe = function(n, e, t) {
  var i = e / 8 | 0;
  return (n[i] | n[i + 1] << 8) >> (e & 7) & t;
}, hs = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, Ys = function(n) {
  return (n + 7) / 8 | 0;
}, tl = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new ve(n.subarray(e, t));
}, _d = [
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
  var i = new Error(e || _d[n]);
  if (i.code = n, Error.captureStackTrace && Error.captureStackTrace(i, Be), !t)
    throw i;
  return i;
}, kd = function(n, e, t, i) {
  var r = n.length, s = 0;
  if (!r || e.f && !e.l)
    return t || new ve(0);
  var o = !t, c = o || e.i != 2, u = e.i;
  o && (t = new ve(r * 3));
  var l = function(_n) {
    var kn = t.length;
    if (_n > kn) {
      var Jt = new ve(Math.max(kn * 2, _n));
      Jt.set(t), t = Jt;
    }
  }, a = e.f || 0, h = e.p || 0, g = e.b || 0, p = e.l, b = e.d, k = e.m, m = e.n, _ = r * 8;
  do {
    if (!p) {
      a = Pe(n, h, 1);
      var f = Pe(n, h + 1, 3);
      if (h += 3, f)
        if (f == 1)
          p = bd, b = wd, k = 9, m = 5;
        else if (f == 2) {
          var w = Pe(n, h, 31) + 257, S = Pe(n, h + 10, 15) + 4, N = w + Pe(n, h + 5, 31) + 1;
          h += 14;
          for (var C = new ve(N), E = new ve(19), O = 0; O < S; ++O)
            E[bs[O]] = Pe(n, h + O * 3, 7);
          h += S * 3;
          for (var I = ls(E), j = (1 << I) - 1, P = Je(E, I, 1), O = 0; O < N; ) {
            var R = P[Pe(n, h, j)];
            h += R & 15;
            var d = R >> 4;
            if (d < 16)
              C[O++] = d;
            else {
              var B = 0, L = 0;
              for (d == 16 ? (L = 3 + Pe(n, h, 3), h += 2, B = C[O - 1]) : d == 17 ? (L = 3 + Pe(n, h, 7), h += 3) : d == 18 && (L = 11 + Pe(n, h, 127), h += 7); L--; )
                C[O++] = B;
            }
          }
          var Z = C.subarray(0, w), K = C.subarray(w);
          k = ls(Z), m = ls(K), p = Je(Z, k, 1), b = Je(K, m, 1);
        } else
          Be(1);
      else {
        var d = Ys(h) + 4, y = n[d - 4] | n[d - 3] << 8, v = d + y;
        if (v > r) {
          u && Be(0);
          break;
        }
        c && l(g + y), t.set(n.subarray(d, v), g), e.b = g += y, e.p = h = v * 8, e.f = a;
        continue;
      }
      if (h > _) {
        u && Be(0);
        break;
      }
    }
    c && l(g + 131072);
    for (var ue = (1 << k) - 1, G = (1 << m) - 1, he = h; ; he = h) {
      var B = p[hs(n, h) & ue], oe = B >> 4;
      if (h += B & 15, h > _) {
        u && Be(0);
        break;
      }
      if (B || Be(2), oe < 256)
        t[g++] = oe;
      else if (oe == 256) {
        he = h, p = null;
        break;
      } else {
        var se = oe - 254;
        if (oe > 264) {
          var O = oe - 257, ie = bi[O];
          se = Pe(n, h, (1 << ie) - 1) + $u[O], h += ie;
        }
        var Se = b[hs(n, h) & G], Zt = Se >> 4;
        Se || Be(3), h += Se & 15;
        var K = gd[Zt];
        if (Zt > 3) {
          var ie = mi[Zt];
          K += hs(n, h) & (1 << ie) - 1, h += ie;
        }
        if (h > _) {
          u && Be(0);
          break;
        }
        c && l(g + 131072);
        var Ht = g + se;
        if (g < K) {
          var Hr = s - K, Jr = Math.min(K, Ht);
          for (Hr + g < 0 && Be(3); g < Jr; ++g)
            t[g] = i[Hr + g];
        }
        for (; g < Ht; ++g)
          t[g] = t[g - K];
      }
    }
    e.l = p, e.p = he, e.b = g, e.f = a, p && (a = 1, e.m = k, e.d = b, e.n = m);
  } while (!a);
  return g != t.length && o ? tl(t, 0, g) : t.subarray(0, g);
}, We = function(n, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  n[i] |= t, n[i + 1] |= t >> 8;
}, Sr = function(n, e, t) {
  t <<= e & 7;
  var i = e / 8 | 0;
  n[i] |= t, n[i + 1] |= t >> 8, n[i + 2] |= t >> 16;
}, ds = function(n, e) {
  for (var t = [], i = 0; i < n.length; ++i)
    n[i] && t.push({ s: i, f: n[i] });
  var r = t.length, s = t.slice();
  if (!r)
    return { t: rl, l: 0 };
  if (r == 1) {
    var o = new ve(t[0].s + 1);
    return o[t[0].s] = 1, { t: o, l: 1 };
  }
  t.sort(function(v, w) {
    return v.f - w.f;
  }), t.push({ s: -1, f: 25001 });
  var c = t[0], u = t[1], l = 0, a = 1, h = 2;
  for (t[0] = { s: -1, f: c.f + u.f, l: c, r: u }; a != r - 1; )
    c = t[t[l].f < t[h].f ? l++ : h++], u = t[l != a && t[l].f < t[h].f ? l++ : h++], t[a++] = { s: -1, f: c.f + u.f, l: c, r: u };
  for (var g = s[0].s, i = 1; i < r; ++i)
    s[i].s > g && (g = s[i].s);
  var p = new Ce(g + 1), b = _s(t[a - 1], p, 0);
  if (b > e) {
    var i = 0, k = 0, m = b - e, _ = 1 << m;
    for (s.sort(function(w, S) {
      return p[S.s] - p[w.s] || w.f - S.f;
    }); i < r; ++i) {
      var f = s[i].s;
      if (p[f] > e)
        k += _ - (1 << b - p[f]), p[f] = e;
      else
        break;
    }
    for (k >>= m; k > 0; ) {
      var d = s[i].s;
      p[d] < e ? k -= 1 << e - p[d]++ - 1 : ++i;
    }
    for (; i >= 0 && k; --i) {
      var y = s[i].s;
      p[y] == e && (--p[y], ++k);
    }
    b = e;
  }
  return { t: new ve(p), l: b };
}, _s = function(n, e, t) {
  return n.s == -1 ? Math.max(_s(n.l, e, t + 1), _s(n.r, e, t + 1)) : e[n.s] = t;
}, pc = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new Ce(++e), i = 0, r = n[0], s = 1, o = function(u) {
    t[i++] = u;
  }, c = 1; c <= e; ++c)
    if (n[c] == r && c != e)
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
      s = 1, r = n[c];
    }
  return { c: t.subarray(0, i), n: e };
}, xr = function(n, e) {
  for (var t = 0, i = 0; i < e.length; ++i)
    t += n[i] * e[i];
  return t;
}, nl = function(n, e, t) {
  var i = t.length, r = Ys(e + 2);
  n[r] = i & 255, n[r + 1] = i >> 8, n[r + 2] = n[r] ^ 255, n[r + 3] = n[r + 1] ^ 255;
  for (var s = 0; s < i; ++s)
    n[r + s + 4] = t[s];
  return (r + 4 + i) * 8;
}, yc = function(n, e, t, i, r, s, o, c, u, l, a) {
  We(e, a++, t), ++r[256];
  for (var h = ds(r, 15), g = h.t, p = h.l, b = ds(s, 15), k = b.t, m = b.l, _ = pc(g), f = _.c, d = _.n, y = pc(k), v = y.c, w = y.n, S = new Ce(19), N = 0; N < f.length; ++N)
    ++S[f[N] & 31];
  for (var N = 0; N < v.length; ++N)
    ++S[v[N] & 31];
  for (var C = ds(S, 7), E = C.t, O = C.l, I = 19; I > 4 && !E[bs[I - 1]]; --I)
    ;
  var j = l + 5 << 3, P = xr(r, mt) + xr(s, Pr) + o, R = xr(r, g) + xr(s, k) + o + 14 + 3 * I + xr(S, E) + 2 * S[16] + 3 * S[17] + 7 * S[18];
  if (u >= 0 && j <= P && j <= R)
    return nl(e, a, n.subarray(u, u + l));
  var B, L, Z, K;
  if (We(e, a, 1 + (R < P)), a += 2, R < P) {
    B = Je(g, p, 0), L = g, Z = Je(k, m, 0), K = k;
    var ue = Je(E, O, 0);
    We(e, a, d - 257), We(e, a + 5, w - 1), We(e, a + 10, I - 4), a += 14;
    for (var N = 0; N < I; ++N)
      We(e, a + 3 * N, E[bs[N]]);
    a += 3 * I;
    for (var G = [f, v], he = 0; he < 2; ++he)
      for (var oe = G[he], N = 0; N < oe.length; ++N) {
        var se = oe[N] & 31;
        We(e, a, ue[se]), a += E[se], se > 15 && (We(e, a, oe[N] >> 5 & 127), a += oe[N] >> 12);
      }
  } else
    B = vd, L = mt, Z = md, K = Pr;
  for (var N = 0; N < c; ++N) {
    var ie = i[N];
    if (ie > 255) {
      var se = ie >> 18 & 31;
      Sr(e, a, B[se + 257]), a += L[se + 257], se > 7 && (We(e, a, ie >> 23 & 31), a += bi[se]);
      var Se = ie & 31;
      Sr(e, a, Z[Se]), a += K[Se], Se > 3 && (Sr(e, a, ie >> 5 & 8191), a += mi[Se]);
    } else
      Sr(e, a, B[ie]), a += L[ie];
  }
  return Sr(e, a, B[256]), a + L[256];
}, Sd = /* @__PURE__ */ new Xs([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), rl = /* @__PURE__ */ new ve(0), xd = function(n, e, t, i, r, s) {
  var o = s.z || n.length, c = new ve(i + o + 5 * (1 + Math.ceil(o / 7e3)) + r), u = c.subarray(i, c.length - r), l = s.l, a = (s.r || 0) & 7;
  if (e) {
    a && (u[0] = s.r >> 3);
    for (var h = Sd[e - 1], g = h >> 13, p = h & 8191, b = (1 << t) - 1, k = s.p || new Ce(32768), m = s.h || new Ce(b + 1), _ = Math.ceil(t / 3), f = 2 * _, d = function(wi) {
      return (n[wi] ^ n[wi + 1] << _ ^ n[wi + 2] << f) & b;
    }, y = new Xs(25e3), v = new Ce(288), w = new Ce(32), S = 0, N = 0, C = s.i || 0, E = 0, O = s.w || 0, I = 0; C + 2 < o; ++C) {
      var j = d(C), P = C & 32767, R = m[j];
      if (k[P] = R, m[j] = P, O <= C) {
        var B = o - C;
        if ((S > 7e3 || E > 24576) && (B > 423 || !l)) {
          a = yc(n, u, 0, y, v, w, N, E, I, C - I, a), E = S = N = 0, I = C;
          for (var L = 0; L < 286; ++L)
            v[L] = 0;
          for (var L = 0; L < 30; ++L)
            w[L] = 0;
        }
        var Z = 2, K = 0, ue = p, G = P - R & 32767;
        if (B > 2 && j == d(C - G))
          for (var he = Math.min(g, B) - 1, oe = Math.min(32767, C), se = Math.min(258, B); G <= oe && --ue && P != R; ) {
            if (n[C + Z] == n[C + Z - G]) {
              for (var ie = 0; ie < se && n[C + ie] == n[C + ie - G]; ++ie)
                ;
              if (ie > Z) {
                if (Z = ie, K = G, ie > he)
                  break;
                for (var Se = Math.min(G, ie - 2), Zt = 0, L = 0; L < Se; ++L) {
                  var Ht = C - G + L & 32767, Hr = k[Ht], Jr = Ht - Hr & 32767;
                  Jr > Zt && (Zt = Jr, R = Ht);
                }
              }
            }
            P = R, R = k[P], G += P - R & 32767;
          }
        if (K) {
          y[E++] = 268435456 | ms[Z] << 18 | fc[K];
          var _n = ms[Z] & 31, kn = fc[K] & 31;
          N += bi[_n] + mi[kn], ++v[257 + _n], ++w[kn], O = C + Z, ++S;
        } else
          y[E++] = n[C], ++v[n[C]];
      }
    }
    for (C = Math.max(C, O); C < o; ++C)
      y[E++] = n[C], ++v[n[C]];
    a = yc(n, u, l, y, v, w, N, E, I, C - I, a), l || (s.r = a & 7 | u[a / 8 | 0] << 3, a -= 7, s.h = m, s.p = k, s.i = C, s.w = O);
  } else {
    for (var C = s.w || 0; C < o + l; C += 65535) {
      var Jt = C + 65535;
      Jt >= o && (u[a / 8 | 0] = l, Jt = o), a = nl(u, a + 1, n.subarray(C, Jt));
    }
    s.i = o;
  }
  return tl(c, 0, i + Ys(a) + r);
}, Od = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, i = 9; --i; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), Nd = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, i = 0; i < e.length; ++i)
        t = Od[t & 255 ^ e[i]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Cd = function(n, e, t, i, r) {
  if (!r && (r = { l: 1 }, e.dictionary)) {
    var s = e.dictionary.subarray(-32768), o = new ve(s.length + n.length);
    o.set(s), o.set(n, s.length), n = o, r.w = s.length;
  }
  return xd(n, e.level == null ? 6 : e.level, e.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, i, r);
}, ks = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Id = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && ks(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var i = 0; i <= t.length; ++i)
      n[i + 10] = t.charCodeAt(i);
  }
}, Td = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && Be(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var i = (e >> 3 & 1) + (e >> 4 & 1); i > 0; i -= !n[t++])
    ;
  return t + (e & 2);
}, Ad = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, jd = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function Ed(n, e) {
  e || (e = {});
  var t = Nd(), i = n.length;
  t.p(n);
  var r = Cd(n, e, jd(e), 8), s = r.length;
  return Id(r, e), ks(r, s - 8, t.d()), ks(r, s - 4, i), r;
}
function Pd(n, e) {
  var t = Td(n);
  return t + 8 > n.length && Be(6, "invalid gzip data"), kd(n.subarray(t, -8), { i: 2 }, new ve(Ad(n)), e);
}
var Rd = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Ld = 0;
try {
  Rd.decode(rl, { stream: !0 }), Ld = 1;
} catch {
}
const Bd = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function Yt(n, e, t) {
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
      return e.slice(0, o) + Yt(n.slice(o), e.slice(o), t);
  }
  const r = n ? t.indexOf(n[0]) : 0, s = e != null ? t.indexOf(e[0]) : t.length;
  if (s - r > 1) {
    const o = Math.round(0.5 * (r + s));
    return t[o];
  } else
    return e && e.length > 1 ? e.slice(0, 1) : t[r] + Yt(n.slice(1), null, t);
}
function il(n) {
  if (n.length !== sl(n[0]))
    throw new Error("invalid integer part of order key: " + n);
}
function sl(n) {
  if (n >= "a" && n <= "z")
    return n.charCodeAt(0) - 97 + 2;
  if (n >= "A" && n <= "Z")
    return 90 - n.charCodeAt(0) + 2;
  throw new Error("invalid order key head: " + n);
}
function Cr(n) {
  const e = sl(n[0]);
  if (e > n.length)
    throw new Error("invalid order key: " + n);
  return n.slice(0, e);
}
function gc(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = Cr(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function vc(n, e) {
  il(n);
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
function Vd(n, e) {
  il(n);
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
function Or(n, e, t = Bd) {
  if (n != null && gc(n, t), e != null && gc(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const u = Cr(e), l = e.slice(u.length);
    if (u === "A" + t[0].repeat(26))
      return u + Yt("", l, t);
    if (u < e)
      return u;
    const a = Vd(u, t);
    if (a == null)
      throw new Error("cannot decrement any more");
    return a;
  }
  if (e == null) {
    const u = Cr(n), l = n.slice(u.length), a = vc(u, t);
    return a ?? u + Yt(l, null, t);
  }
  const i = Cr(n), r = n.slice(i.length), s = Cr(e), o = e.slice(s.length);
  if (i === s)
    return i + Yt(r, o, t);
  const c = vc(i, t);
  if (c == null)
    throw new Error("cannot increment any more");
  return c < e ? c : i + Yt(r, null, t);
}
const Md = new Uint8Array([
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
]);
var te;
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
    const s = n.objectKeys(r).filter((c) => typeof r[r[c]] != "number"), o = {};
    for (const c of s)
      o[c] = r[c];
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
})(te || (te = {}));
var bc;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(bc || (bc = {}));
const q = te.arrayToEnum([
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
]), ct = (n) => {
  switch (typeof n) {
    case "undefined":
      return q.undefined;
    case "string":
      return q.string;
    case "number":
      return Number.isNaN(n) ? q.nan : q.number;
    case "boolean":
      return q.boolean;
    case "function":
      return q.function;
    case "bigint":
      return q.bigint;
    case "symbol":
      return q.symbol;
    case "object":
      return Array.isArray(n) ? q.array : n === null ? q.null : n.then && typeof n.then == "function" && n.catch && typeof n.catch == "function" ? q.promise : typeof Map < "u" && n instanceof Map ? q.map : typeof Set < "u" && n instanceof Set ? q.set : typeof Date < "u" && n instanceof Date ? q.date : q.object;
    default:
      return q.unknown;
  }
}, V = te.arrayToEnum([
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
class rt extends Error {
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
          let c = i, u = 0;
          for (; u < o.path.length; ) {
            const l = o.path[u];
            u === o.path.length - 1 ? (c[l] = c[l] || { _errors: [] }, c[l]._errors.push(t(o))) : c[l] = c[l] || { _errors: [] }, c = c[l], u++;
          }
        }
    };
    return r(this), i;
  }
  static assert(e) {
    if (!(e instanceof rt))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, te.jsonStringifyReplacer, 2);
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
rt.create = (n) => new rt(n);
const Ss = (n, e) => {
  let t;
  switch (n.code) {
    case V.invalid_type:
      n.received === q.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case V.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, te.jsonStringifyReplacer)}`;
      break;
    case V.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${te.joinValues(n.keys, ", ")}`;
      break;
    case V.invalid_union:
      t = "Invalid input";
      break;
    case V.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${te.joinValues(n.options)}`;
      break;
    case V.invalid_enum_value:
      t = `Invalid enum value. Expected ${te.joinValues(n.options)}, received '${n.received}'`;
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
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : te.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
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
      t = e.defaultError, te.assertNever(n);
  }
  return { message: t };
};
let Dd = Ss;
function qd() {
  return Dd;
}
const Ud = (n) => {
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
  let c = "";
  const u = i.filter((l) => !!l).slice().reverse();
  for (const l of u)
    c = l(o, { data: e, defaultError: c }).message;
  return {
    ...r,
    path: s,
    message: c
  };
};
function M(n, e) {
  const t = qd(), i = Ud({
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
      t === Ss ? void 0 : Ss
      // then global default map
    ].filter((r) => !!r)
  });
  n.common.issues.push(i);
}
class Ie {
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
    return Ie.mergeObjectSync(e, i);
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
}), Ir = (n) => ({ status: "dirty", value: n }), Ae = (n) => ({ status: "valid", value: n }), mc = (n) => n.status === "aborted", wc = (n) => n.status === "dirty", gn = (n) => n.status === "valid", oi = (n) => typeof Promise < "u" && n instanceof Promise;
var U;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(U || (U = {}));
class wt {
  constructor(e, t, i, r) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = i, this._key = r;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const _c = (n, e) => {
  if (gn(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new rt(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function W(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: i, description: r } = n;
  if (e && (t || i))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: r } : { errorMap: (o, c) => {
    const { message: u } = n;
    return o.code === "invalid_enum_value" ? { message: u ?? c.defaultError } : typeof c.data > "u" ? { message: u ?? i ?? c.defaultError } : o.code !== "invalid_type" ? { message: c.defaultError } : { message: u ?? t ?? c.defaultError };
  }, description: r };
}
class Q {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return ct(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: ct(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Ie(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: ct(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (oi(t))
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
      parsedType: ct(e)
    }, r = this._parseSync({ data: e, path: i.path, parent: i });
    return _c(i, r);
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
      parsedType: ct(e)
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: e, path: [], parent: t });
        return gn(s) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => gn(s) ? {
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
      parsedType: ct(e)
    }, r = this._parse({ data: e, path: i.path, parent: i }), s = await (oi(r) ? r : Promise.resolve(r));
    return _c(i, s);
  }
  refine(e, t) {
    const i = (r) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(r) : t;
    return this._refinement((r, s) => {
      const o = e(r), c = () => s.addIssue({
        code: V.custom,
        ...i(r)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((u) => u ? !0 : (c(), !1)) : o ? !0 : (c(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((i, r) => e(i) ? !0 : (r.addIssue(typeof t == "function" ? t(i, r) : t), !1));
  }
  _refinement(e) {
    return new mn({
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
    return bt.create(this, this._def);
  }
  nullable() {
    return wn.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Ke.create(this);
  }
  promise() {
    return li.create(this, this._def);
  }
  or(e) {
    return ci.create([this, e], this._def);
  }
  and(e) {
    return ui.create(this, e, this._def);
  }
  transform(e) {
    return new mn({
      ...W(this._def),
      schema: this,
      typeName: J.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Os({
      ...W(this._def),
      innerType: this,
      defaultValue: t,
      typeName: J.ZodDefault
    });
  }
  brand() {
    return new hf({
      typeName: J.ZodBranded,
      type: this,
      ...W(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ns({
      ...W(this._def),
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
    return Qs.create(this, e);
  }
  readonly() {
    return Cs.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Fd = /^c[^\s-]{8,}$/i, zd = /^[0-9a-z]+$/, Zd = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Hd = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Jd = /^[a-z0-9_-]{21}$/i, Kd = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Wd = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Gd = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Xd = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let fs;
const Yd = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Qd = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, $d = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, ef = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, tf = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, nf = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ol = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", rf = new RegExp(`^${ol}$`);
function al(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function sf(n) {
  return new RegExp(`^${al(n)}$`);
}
function of(n) {
  let e = `${ol}T${al(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function af(n, e) {
  return !!((e === "v4" || !e) && Yd.test(n) || (e === "v6" || !e) && $d.test(n));
}
function cf(n, e) {
  if (!Kd.test(n))
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
function uf(n, e) {
  return !!((e === "v4" || !e) && Qd.test(n) || (e === "v6" || !e) && ef.test(n));
}
class vt extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== q.string) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: q.string,
        received: s.parsedType
      }), H;
    }
    const i = new Ie();
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
        const o = e.data.length > s.value, c = e.data.length < s.value;
        (o || c) && (r = this._getOrReturnCtx(e, r), o ? M(r, {
          code: V.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }) : c && M(r, {
          code: V.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }), i.dirty());
      } else if (s.kind === "email")
        Gd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "email",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "emoji")
        fs || (fs = new RegExp(Xd, "u")), fs.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "emoji",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "uuid")
        Hd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "uuid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "nanoid")
        Jd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "nanoid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid")
        Fd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "cuid",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "cuid2")
        zd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
          validation: "cuid2",
          code: V.invalid_string,
          message: s.message
        }), i.dirty());
      else if (s.kind === "ulid")
        Zd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
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
      }), i.dirty()) : s.kind === "datetime" ? of(s).test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "datetime",
        message: s.message
      }), i.dirty()) : s.kind === "date" ? rf.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "date",
        message: s.message
      }), i.dirty()) : s.kind === "time" ? sf(s).test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        code: V.invalid_string,
        validation: "time",
        message: s.message
      }), i.dirty()) : s.kind === "duration" ? Wd.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "duration",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "ip" ? af(e.data, s.version) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "ip",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "jwt" ? cf(e.data, s.alg) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "jwt",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "cidr" ? uf(e.data, s.version) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "cidr",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64" ? tf.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "base64",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : s.kind === "base64url" ? nf.test(e.data) || (r = this._getOrReturnCtx(e, r), M(r, {
        validation: "base64url",
        code: V.invalid_string,
        message: s.message
      }), i.dirty()) : te.assertNever(s);
    return { status: i.value, value: e.data };
  }
  _regex(e, t, i) {
    return this.refinement((r) => e.test(r), {
      validation: t,
      code: V.invalid_string,
      ...U.errToObj(i)
    });
  }
  _addCheck(e) {
    return new vt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...U.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...U.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...U.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...U.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...U.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...U.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...U.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...U.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...U.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...U.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...U.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...U.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...U.errToObj(e) });
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
      ...U.errToObj(e == null ? void 0 : e.message)
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
      ...U.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...U.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...U.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...U.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...U.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...U.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...U.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...U.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...U.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, U.errToObj(e));
  }
  trim() {
    return new vt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new vt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new vt({
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
vt.create = (n) => new vt({
  checks: [],
  typeName: J.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...W(n)
});
function lf(n, e) {
  const t = (n.toString().split(".")[1] || "").length, i = (e.toString().split(".")[1] || "").length, r = t > i ? t : i, s = Number.parseInt(n.toFixed(r).replace(".", "")), o = Number.parseInt(e.toFixed(r).replace(".", ""));
  return s % o / 10 ** r;
}
class vn extends Q {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== q.number) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: q.number,
        received: s.parsedType
      }), H;
    }
    let i;
    const r = new Ie();
    for (const s of this._def.checks)
      s.kind === "int" ? te.isInteger(e.data) || (i = this._getOrReturnCtx(e, i), M(i, {
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
      }), r.dirty()) : s.kind === "multipleOf" ? lf(e.data, s.value) !== 0 && (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), r.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (i = this._getOrReturnCtx(e, i), M(i, {
        code: V.not_finite,
        message: s.message
      }), r.dirty()) : te.assertNever(s);
    return { status: r.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, U.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, U.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, U.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, U.toString(t));
  }
  setLimit(e, t, i, r) {
    return new vn({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: U.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new vn({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: U.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: U.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: U.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: U.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: U.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: U.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: U.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: U.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: U.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && te.isInteger(e.value));
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
vn.create = (n) => new vn({
  checks: [],
  typeName: J.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...W(n)
});
class Rr extends Q {
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
    if (this._getType(e) !== q.bigint)
      return this._getInvalidInput(e);
    let i;
    const r = new Ie();
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
      }), r.dirty()) : te.assertNever(s);
    return { status: r.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return M(t, {
      code: V.invalid_type,
      expected: q.bigint,
      received: t.parsedType
    }), H;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, U.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, U.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, U.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, U.toString(t));
  }
  setLimit(e, t, i, r) {
    return new Rr({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: i,
          message: U.toString(r)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Rr({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: U.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: U.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: U.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: U.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: U.toString(t)
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
Rr.create = (n) => new Rr({
  checks: [],
  typeName: J.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...W(n)
});
class kc extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== q.boolean) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.boolean,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
kc.create = (n) => new kc({
  typeName: J.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...W(n)
});
class ai extends Q {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== q.date) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_type,
        expected: q.date,
        received: s.parsedType
      }), H;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return M(s, {
        code: V.invalid_date
      }), H;
    }
    const i = new Ie();
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
      }), i.dirty()) : te.assertNever(s);
    return {
      status: i.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new ai({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: U.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: U.toString(t)
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
ai.create = (n) => new ai({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: J.ZodDate,
  ...W(n)
});
class Sc extends Q {
  _parse(e) {
    if (this._getType(e) !== q.symbol) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.symbol,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
Sc.create = (n) => new Sc({
  typeName: J.ZodSymbol,
  ...W(n)
});
class xc extends Q {
  _parse(e) {
    if (this._getType(e) !== q.undefined) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.undefined,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
xc.create = (n) => new xc({
  typeName: J.ZodUndefined,
  ...W(n)
});
class Oc extends Q {
  _parse(e) {
    if (this._getType(e) !== q.null) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.null,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
Oc.create = (n) => new Oc({
  typeName: J.ZodNull,
  ...W(n)
});
class Nc extends Q {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Ae(e.data);
  }
}
Nc.create = (n) => new Nc({
  typeName: J.ZodAny,
  ...W(n)
});
class Cc extends Q {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Ae(e.data);
  }
}
Cc.create = (n) => new Cc({
  typeName: J.ZodUnknown,
  ...W(n)
});
class _t extends Q {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return M(t, {
      code: V.invalid_type,
      expected: q.never,
      received: t.parsedType
    }), H;
  }
}
_t.create = (n) => new _t({
  typeName: J.ZodNever,
  ...W(n)
});
class Ic extends Q {
  _parse(e) {
    if (this._getType(e) !== q.undefined) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.void,
        received: i.parsedType
      }), H;
    }
    return Ae(e.data);
  }
}
Ic.create = (n) => new Ic({
  typeName: J.ZodVoid,
  ...W(n)
});
class Ke extends Q {
  _parse(e) {
    const { ctx: t, status: i } = this._processInputParams(e), r = this._def;
    if (t.parsedType !== q.array)
      return M(t, {
        code: V.invalid_type,
        expected: q.array,
        received: t.parsedType
      }), H;
    if (r.exactLength !== null) {
      const o = t.data.length > r.exactLength.value, c = t.data.length < r.exactLength.value;
      (o || c) && (M(t, {
        code: o ? V.too_big : V.too_small,
        minimum: c ? r.exactLength.value : void 0,
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
      return Promise.all([...t.data].map((o, c) => r.type._parseAsync(new wt(t, o, t.path, c)))).then((o) => Ie.mergeArray(i, o));
    const s = [...t.data].map((o, c) => r.type._parseSync(new wt(t, o, t.path, c)));
    return Ie.mergeArray(i, s);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new Ke({
      ...this._def,
      minLength: { value: e, message: U.toString(t) }
    });
  }
  max(e, t) {
    return new Ke({
      ...this._def,
      maxLength: { value: e, message: U.toString(t) }
    });
  }
  length(e, t) {
    return new Ke({
      ...this._def,
      exactLength: { value: e, message: U.toString(t) }
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
  ...W(e)
});
function Kt(n) {
  if (n instanceof ge) {
    const e = {};
    for (const t in n.shape) {
      const i = n.shape[t];
      e[t] = bt.create(Kt(i));
    }
    return new ge({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof Ke ? new Ke({
    ...n._def,
    type: Kt(n.element)
  }) : n instanceof bt ? bt.create(Kt(n.unwrap())) : n instanceof wn ? wn.create(Kt(n.unwrap())) : n instanceof zt ? zt.create(n.items.map((e) => Kt(e))) : n;
}
class ge extends Q {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = te.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== q.object) {
      const l = this._getOrReturnCtx(e);
      return M(l, {
        code: V.invalid_type,
        expected: q.object,
        received: l.parsedType
      }), H;
    }
    const { status: i, ctx: r } = this._processInputParams(e), { shape: s, keys: o } = this._getCached(), c = [];
    if (!(this._def.catchall instanceof _t && this._def.unknownKeys === "strip"))
      for (const l in r.data)
        o.includes(l) || c.push(l);
    const u = [];
    for (const l of o) {
      const a = s[l], h = r.data[l];
      u.push({
        key: { status: "valid", value: l },
        value: a._parse(new wt(r, h, r.path, l)),
        alwaysSet: l in r.data
      });
    }
    if (this._def.catchall instanceof _t) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const a of c)
          u.push({
            key: { status: "valid", value: a },
            value: { status: "valid", value: r.data[a] }
          });
      else if (l === "strict")
        c.length > 0 && (M(r, {
          code: V.unrecognized_keys,
          keys: c
        }), i.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const a of c) {
        const h = r.data[a];
        u.push({
          key: { status: "valid", value: a },
          value: l._parse(
            new wt(r, h, r.path, a)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: a in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const a of u) {
        const h = await a.key, g = await a.value;
        l.push({
          key: h,
          value: g,
          alwaysSet: a.alwaysSet
        });
      }
      return l;
    }).then((l) => Ie.mergeObjectSync(i, l)) : Ie.mergeObjectSync(i, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return U.errToObj, new ge({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, i) => {
          var s, o;
          const r = ((o = (s = this._def).errorMap) == null ? void 0 : o.call(s, t, i).message) ?? i.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: U.errToObj(e).message ?? r
          } : {
            message: r
          };
        }
      } : {}
    });
  }
  strip() {
    return new ge({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ge({
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
    return new ge({
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
    return new ge({
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
    return new ge({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const i of te.objectKeys(e))
      e[i] && this.shape[i] && (t[i] = this.shape[i]);
    return new ge({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const i of te.objectKeys(this.shape))
      e[i] || (t[i] = this.shape[i]);
    return new ge({
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
    for (const i of te.objectKeys(this.shape)) {
      const r = this.shape[i];
      e && !e[i] ? t[i] = r : t[i] = r.optional();
    }
    return new ge({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const i of te.objectKeys(this.shape))
      if (e && !e[i])
        t[i] = this.shape[i];
      else {
        let s = this.shape[i];
        for (; s instanceof bt; )
          s = s._def.innerType;
        t[i] = s;
      }
    return new ge({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return cl(te.objectKeys(this.shape));
  }
}
ge.create = (n, e) => new ge({
  shape: () => n,
  unknownKeys: "strip",
  catchall: _t.create(),
  typeName: J.ZodObject,
  ...W(e)
});
ge.strictCreate = (n, e) => new ge({
  shape: () => n,
  unknownKeys: "strict",
  catchall: _t.create(),
  typeName: J.ZodObject,
  ...W(e)
});
ge.lazycreate = (n, e) => new ge({
  shape: n,
  unknownKeys: "strip",
  catchall: _t.create(),
  typeName: J.ZodObject,
  ...W(e)
});
class ci extends Q {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), i = this._def.options;
    function r(s) {
      for (const c of s)
        if (c.result.status === "valid")
          return c.result;
      for (const c of s)
        if (c.result.status === "dirty")
          return t.common.issues.push(...c.ctx.common.issues), c.result;
      const o = s.map((c) => new rt(c.ctx.common.issues));
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
        }, a = u._parseSync({
          data: t.data,
          path: t.path,
          parent: l
        });
        if (a.status === "valid")
          return a;
        a.status === "dirty" && !s && (s = { result: a, ctx: l }), l.common.issues.length && o.push(l.common.issues);
      }
      if (s)
        return t.common.issues.push(...s.ctx.common.issues), s.result;
      const c = o.map((u) => new rt(u));
      return M(t, {
        code: V.invalid_union,
        unionErrors: c
      }), H;
    }
  }
  get options() {
    return this._def.options;
  }
}
ci.create = (n, e) => new ci({
  options: n,
  typeName: J.ZodUnion,
  ...W(e)
});
function xs(n, e) {
  const t = ct(n), i = ct(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === q.object && i === q.object) {
    const r = te.objectKeys(e), s = te.objectKeys(n).filter((c) => r.indexOf(c) !== -1), o = { ...n, ...e };
    for (const c of s) {
      const u = xs(n[c], e[c]);
      if (!u.valid)
        return { valid: !1 };
      o[c] = u.data;
    }
    return { valid: !0, data: o };
  } else if (t === q.array && i === q.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const r = [];
    for (let s = 0; s < n.length; s++) {
      const o = n[s], c = e[s], u = xs(o, c);
      if (!u.valid)
        return { valid: !1 };
      r.push(u.data);
    }
    return { valid: !0, data: r };
  } else return t === q.date && i === q.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class ui extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e), r = (s, o) => {
      if (mc(s) || mc(o))
        return H;
      const c = xs(s.value, o.value);
      return c.valid ? ((wc(s) || wc(o)) && t.dirty(), { status: t.value, value: c.data }) : (M(i, {
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
ui.create = (n, e, t) => new ui({
  left: n,
  right: e,
  typeName: J.ZodIntersection,
  ...W(t)
});
class zt extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== q.array)
      return M(i, {
        code: V.invalid_type,
        expected: q.array,
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
    const s = [...i.data].map((o, c) => {
      const u = this._def.items[c] || this._def.rest;
      return u ? u._parse(new wt(i, o, i.path, c)) : null;
    }).filter((o) => !!o);
    return i.common.async ? Promise.all(s).then((o) => Ie.mergeArray(t, o)) : Ie.mergeArray(t, s);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new zt({
      ...this._def,
      rest: e
    });
  }
}
zt.create = (n, e) => {
  if (!Array.isArray(n))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new zt({
    items: n,
    typeName: J.ZodTuple,
    rest: null,
    ...W(e)
  });
};
class Tc extends Q {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== q.map)
      return M(i, {
        code: V.invalid_type,
        expected: q.map,
        received: i.parsedType
      }), H;
    const r = this._def.keyType, s = this._def.valueType, o = [...i.data.entries()].map(([c, u], l) => ({
      key: r._parse(new wt(i, c, i.path, [l, "key"])),
      value: s._parse(new wt(i, u, i.path, [l, "value"]))
    }));
    if (i.common.async) {
      const c = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of o) {
          const l = await u.key, a = await u.value;
          if (l.status === "aborted" || a.status === "aborted")
            return H;
          (l.status === "dirty" || a.status === "dirty") && t.dirty(), c.set(l.value, a.value);
        }
        return { status: t.value, value: c };
      });
    } else {
      const c = /* @__PURE__ */ new Map();
      for (const u of o) {
        const l = u.key, a = u.value;
        if (l.status === "aborted" || a.status === "aborted")
          return H;
        (l.status === "dirty" || a.status === "dirty") && t.dirty(), c.set(l.value, a.value);
      }
      return { status: t.value, value: c };
    }
  }
}
Tc.create = (n, e, t) => new Tc({
  valueType: e,
  keyType: n,
  typeName: J.ZodMap,
  ...W(t)
});
class Lr extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.parsedType !== q.set)
      return M(i, {
        code: V.invalid_type,
        expected: q.set,
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
      for (const a of u) {
        if (a.status === "aborted")
          return H;
        a.status === "dirty" && t.dirty(), l.add(a.value);
      }
      return { status: t.value, value: l };
    }
    const c = [...i.data.values()].map((u, l) => s._parse(new wt(i, u, i.path, l)));
    return i.common.async ? Promise.all(c).then((u) => o(u)) : o(c);
  }
  min(e, t) {
    return new Lr({
      ...this._def,
      minSize: { value: e, message: U.toString(t) }
    });
  }
  max(e, t) {
    return new Lr({
      ...this._def,
      maxSize: { value: e, message: U.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Lr.create = (n, e) => new Lr({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: J.ZodSet,
  ...W(e)
});
class Ac extends Q {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ac.create = (n, e) => new Ac({
  getter: n,
  typeName: J.ZodLazy,
  ...W(e)
});
class jc extends Q {
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
jc.create = (n, e) => new jc({
  value: n,
  typeName: J.ZodLiteral,
  ...W(e)
});
function cl(n, e) {
  return new bn({
    values: n,
    typeName: J.ZodEnum,
    ...W(e)
  });
}
class bn extends Q {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), i = this._def.values;
      return M(t, {
        expected: te.joinValues(i),
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
    return bn.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return bn.create(this.options.filter((i) => !e.includes(i)), {
      ...this._def,
      ...t
    });
  }
}
bn.create = cl;
class Ec extends Q {
  _parse(e) {
    const t = te.getValidEnumValues(this._def.values), i = this._getOrReturnCtx(e);
    if (i.parsedType !== q.string && i.parsedType !== q.number) {
      const r = te.objectValues(t);
      return M(i, {
        expected: te.joinValues(r),
        received: i.parsedType,
        code: V.invalid_type
      }), H;
    }
    if (this._cache || (this._cache = new Set(te.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const r = te.objectValues(t);
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
Ec.create = (n, e) => new Ec({
  values: n,
  typeName: J.ZodNativeEnum,
  ...W(e)
});
class li extends Q {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== q.promise && t.common.async === !1)
      return M(t, {
        code: V.invalid_type,
        expected: q.promise,
        received: t.parsedType
      }), H;
    const i = t.parsedType === q.promise ? t.data : Promise.resolve(t.data);
    return Ae(i.then((r) => this._def.type.parseAsync(r, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
li.create = (n, e) => new li({
  type: n,
  typeName: J.ZodPromise,
  ...W(e)
});
class mn extends Q {
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
        return Promise.resolve(o).then(async (c) => {
          if (t.value === "aborted")
            return H;
          const u = await this._def.schema._parseAsync({
            data: c,
            path: i.path,
            parent: i
          });
          return u.status === "aborted" ? H : u.status === "dirty" || t.value === "dirty" ? Ir(u.value) : u;
        });
      {
        if (t.value === "aborted")
          return H;
        const c = this._def.schema._parseSync({
          data: o,
          path: i.path,
          parent: i
        });
        return c.status === "aborted" ? H : c.status === "dirty" || t.value === "dirty" ? Ir(c.value) : c;
      }
    }
    if (r.type === "refinement") {
      const o = (c) => {
        const u = r.refinement(c, s);
        if (i.common.async)
          return Promise.resolve(u);
        if (u instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return c;
      };
      if (i.common.async === !1) {
        const c = this._def.schema._parseSync({
          data: i.data,
          path: i.path,
          parent: i
        });
        return c.status === "aborted" ? H : (c.status === "dirty" && t.dirty(), o(c.value), { status: t.value, value: c.value });
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((c) => c.status === "aborted" ? H : (c.status === "dirty" && t.dirty(), o(c.value).then(() => ({ status: t.value, value: c.value }))));
    }
    if (r.type === "transform")
      if (i.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: i.data,
          path: i.path,
          parent: i
        });
        if (!gn(o))
          return H;
        const c = r.transform(o.value, s);
        if (c instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: c };
      } else
        return this._def.schema._parseAsync({ data: i.data, path: i.path, parent: i }).then((o) => gn(o) ? Promise.resolve(r.transform(o.value, s)).then((c) => ({
          status: t.value,
          value: c
        })) : H);
    te.assertNever(r);
  }
}
mn.create = (n, e, t) => new mn({
  schema: n,
  typeName: J.ZodEffects,
  effect: e,
  ...W(t)
});
mn.createWithPreprocess = (n, e, t) => new mn({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: J.ZodEffects,
  ...W(t)
});
class bt extends Q {
  _parse(e) {
    return this._getType(e) === q.undefined ? Ae(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
bt.create = (n, e) => new bt({
  innerType: n,
  typeName: J.ZodOptional,
  ...W(e)
});
class wn extends Q {
  _parse(e) {
    return this._getType(e) === q.null ? Ae(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
wn.create = (n, e) => new wn({
  innerType: n,
  typeName: J.ZodNullable,
  ...W(e)
});
class Os extends Q {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let i = t.data;
    return t.parsedType === q.undefined && (i = this._def.defaultValue()), this._def.innerType._parse({
      data: i,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Os.create = (n, e) => new Os({
  innerType: n,
  typeName: J.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...W(e)
});
class Ns extends Q {
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
    return oi(r) ? r.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new rt(i.common.issues);
        },
        input: i.data
      })
    })) : {
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new rt(i.common.issues);
        },
        input: i.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Ns.create = (n, e) => new Ns({
  innerType: n,
  typeName: J.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...W(e)
});
class Pc extends Q {
  _parse(e) {
    if (this._getType(e) !== q.nan) {
      const i = this._getOrReturnCtx(e);
      return M(i, {
        code: V.invalid_type,
        expected: q.nan,
        received: i.parsedType
      }), H;
    }
    return { status: "valid", value: e.data };
  }
}
Pc.create = (n) => new Pc({
  typeName: J.ZodNaN,
  ...W(n)
});
class hf extends Q {
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
class Qs extends Q {
  _parse(e) {
    const { status: t, ctx: i } = this._processInputParams(e);
    if (i.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: i.data,
          path: i.path,
          parent: i
        });
        return s.status === "aborted" ? H : s.status === "dirty" ? (t.dirty(), Ir(s.value)) : this._def.out._parseAsync({
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
    return new Qs({
      in: e,
      out: t,
      typeName: J.ZodPipeline
    });
  }
}
class Cs extends Q {
  _parse(e) {
    const t = this._def.innerType._parse(e), i = (r) => (gn(r) && (r.value = Object.freeze(r.value)), r);
    return oi(t) ? t.then((r) => i(r)) : i(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Cs.create = (n, e) => new Cs({
  innerType: n,
  typeName: J.ZodReadonly,
  ...W(e)
});
var J;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(J || (J = {}));
const ul = vt.create, df = vn.create;
_t.create;
Ke.create;
ci.create;
ui.create;
zt.create;
bn.create;
li.create;
bt.create;
wn.create;
const ff = ul(), Rc = ul().min(1), ei = df().int().nonnegative().optional();
var ee, Br, Pt, Ye, Rt, xe, ut, lt, ze, Ze, hi, Qt, ht, $t, Lt, A, ll, hl, dl, fl, Y, be, pl, yl, Is, gl, vl, Le, at, Wt, Tr, Gt, ni, ri, bl, Ts, ml, As, js, Es, wl, pf, $, _l, kl;
const $s = class $s {
  //----------------------------------------------------------------------------//
  //                                Construction                                //
  //----------------------------------------------------------------------------//
  /**** constructor — initialize store with model and configuration ****/
  constructor(e, t) {
    D(this, A);
    /**** private state ****/
    D(this, ee);
    D(this, Br);
    D(this, Pt);
    D(this, Ye, null);
    D(this, Rt, /* @__PURE__ */ new Set());
    // reverse index: outerNoteId → Set<entryId>
    D(this, xe, /* @__PURE__ */ new Map());
    // forward index: entryId → outerNoteId (kept in sync with #ReverseIndex)
    D(this, ut, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    D(this, lt, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
    D(this, ze, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    D(this, Ze, /* @__PURE__ */ new Map());
    D(this, hi, Zl);
    // transaction nesting
    D(this, Qt, 0);
    // ChangeSet accumulator inside a transaction
    D(this, ht, {});
    // patch log for exportPatch() — only locally generated patches (as binaries)
    D(this, $t, []);
    // suppress index updates / change tracking when applying remote patches
    D(this, Lt, !1);
    if (z(this, ee, e), z(this, Br, (t == null ? void 0 : t.LiteralSizeLimit) ?? Fl), z(this, Pt, (t == null ? void 0 : t.TrashTTLms) ?? null), T(this, A, gl).call(this), x(this, Pt) != null) {
      const i = (t == null ? void 0 : t.TrashCheckIntervalMs) ?? Math.min(Math.floor(x(this, Pt) / 4), 36e5);
      z(this, Ye, setInterval(
        () => {
          this.purgeExpiredTrashEntries();
        },
        i
      )), typeof x(this, Ye).unref == "function" && x(this, Ye).unref();
    }
  }
  /**** fromScratch — create store from canonical empty snapshot ****/
  static fromScratch(e) {
    return this.fromBinary(Md, e);
  }
  /**** fromBinary — deserialize store from binary snapshot ****/
  static fromBinary(e, t) {
    const i = Pd(e), r = yd.Model.fromBinary(i);
    return new $s(r, t);
  }
  /**** fromJSON — deserialize store from base64-encoded JSON snapshot ****/
  static fromJSON(e, t) {
    const i = new Uint8Array(Buffer.from(String(e), "base64"));
    return this.fromBinary(i, t);
  }
  //----------------------------------------------------------------------------//
  //                             Public Accessors                               //
  //----------------------------------------------------------------------------//
  /**** RootNote / TrashNote / LostAndFoundNote — access special notes ****/
  get RootNote() {
    return T(this, A, be).call(this, ot);
  }
  get TrashNote() {
    return T(this, A, be).call(this, ye);
  }
  get LostAndFoundNote() {
    return T(this, A, be).call(this, Ge);
  }
  /**** EntryWithId — retrieve entry by id ****/
  EntryWithId(e) {
    if (T(this, A, Y).call(this).Entries[e] != null)
      return T(this, A, be).call(this, e);
  }
  //----------------------------------------------------------------------------//
  //                             Public Mutators                                //
  //----------------------------------------------------------------------------//
  /**** newNoteAt — create new note in specified location ****/
  newNoteAt(e, t, i) {
    const r = t ?? Wr;
    if (!Rc.safeParse(r).success)
      throw new ke("invalid-argument", "MIMEType must be a non-empty string");
    return ei.parse(i), this.transact(() => {
      const o = crypto.randomUUID(), c = T(this, A, Gt).call(this, e.Id, i), u = r === Wr ? "" : r, l = F.s.obj({
        Kind: F.s.con("note"),
        outerPlacement: F.s.val(F.s.con({ outerNoteId: e.Id, OrderKey: c })),
        Label: F.s.val(F.s.str("")),
        Info: F.s.obj({}),
        MIMEType: F.s.val(F.s.str(u)),
        ValueKind: F.s.val(F.s.str("none"))
      });
      return x(this, ee).api.obj(["Entries"]).set({ [o]: l }), T(this, A, Le).call(this, e.Id, o), T(this, A, $).call(this, e.Id, "innerEntryList"), T(this, A, $).call(this, o, "outerNote"), T(this, A, be).call(this, o);
    });
  }
  /**** newLinkAt — create new link in specified location ****/
  newLinkAt(e, t, i) {
    return ei.parse(i), T(this, A, Es).call(this, e.Id), T(this, A, Es).call(this, t.Id), this.transact(() => {
      const r = crypto.randomUUID(), s = T(this, A, Gt).call(this, t.Id, i), o = F.s.obj({
        Kind: F.s.con("link"),
        outerPlacement: F.s.val(F.s.con({ outerNoteId: t.Id, OrderKey: s })),
        Label: F.s.val(F.s.str("")),
        Info: F.s.obj({}),
        TargetId: F.s.con(e.Id)
      });
      return x(this, ee).api.obj(["Entries"]).set({ [r]: o }), T(this, A, Le).call(this, t.Id, r), T(this, A, Wt).call(this, e.Id, r), T(this, A, $).call(this, t.Id, "innerEntryList"), T(this, A, $).call(this, r, "outerNote"), T(this, A, be).call(this, r);
    });
  }
  /**** deserializeNoteInto — deserialize note from JSON into tree ****/
  deserializeNoteInto(e, t, i) {
    if (ei.parse(i), e == null)
      throw new ke("invalid-argument", "Serialisation must not be null");
    const r = [], s = /* @__PURE__ */ new Map(), o = (l, a) => {
      const h = typeof a == "string" ? a : a.Id, g = l.Id ?? crypto.randomUUID(), p = crypto.randomUUID();
      if (s.set(g, p), r.push({
        oldId: g,
        newId: p,
        outerId: h,
        Entry: l
      }), l.innerEntries && Array.isArray(l.innerEntries))
        for (const b of l.innerEntries)
          o(b, p);
    };
    o(e, t);
    const c = T(this, A, Gt).call(this, t.Id, i), u = s.get(r[0].oldId);
    return this.transact(() => {
      var l;
      for (let a = 0; a < r.length; a++) {
        const { oldId: h, newId: g, outerId: p, Entry: b } = r[a], k = a === 0 ? t.Id : s.get(p) ?? p, m = a === 0 ? c : ((l = b.outerPlacement) == null ? void 0 : l.OrderKey) ?? "", _ = {
          Kind: F.s.con(b.Kind),
          outerPlacement: F.s.val(F.s.con({ outerNoteId: k, OrderKey: m })),
          Label: F.s.val(F.s.str(b.Label ?? "")),
          Info: F.s.obj({})
        };
        if (b.Kind === "note") {
          const d = b.Type === "text/plain" ? "" : b.Type ?? "";
          _.MIMEType = F.s.val(F.s.str(d)), _.ValueKind = F.s.val(F.s.str(b.ValueKind ?? "none")), b.literalValue && (_.literalValue = b.literalValue), b.binaryValue && (_.binaryValue = b.binaryValue), b.ValueRef && (_.ValueRef = b.ValueRef);
        } else if (b.Kind === "link") {
          const d = b.TargetId ? s.get(b.TargetId) ?? b.TargetId : "";
          _.TargetId = F.s.con(d);
        }
        const f = F.s.obj(_);
        if (x(this, ee).api.obj(["Entries"]).set({ [g]: f }), T(this, A, Le).call(this, k, g), b.Kind === "link" && b.TargetId) {
          const d = s.get(b.TargetId) ?? b.TargetId;
          T(this, A, Wt).call(this, d, g);
        }
      }
      T(this, A, $).call(this, t.Id, "innerEntryList");
    }), T(this, A, be).call(this, u);
  }
  /**** deserializeLinkInto — deserialize link from JSON into tree ****/
  deserializeLinkInto(e, t, i) {
    const r = e.Id ?? crypto.randomUUID(), s = T(this, A, Gt).call(this, t.Id, i), o = F.s.obj({
      Kind: F.s.con("link"),
      outerPlacement: F.s.val(F.s.con({ outerNoteId: t.Id, OrderKey: s })),
      Label: F.s.val(F.s.str(e.Label ?? "")),
      Info: F.s.obj(e.Info ?? {}),
      TargetId: F.s.con(e.TargetId)
    });
    return x(this, ee).api.obj(["Entries"]).set({ [r]: o }), T(this, A, Le).call(this, t.Id, r), T(this, A, Wt).call(this, e.TargetId, r), T(this, A, $).call(this, t.Id, "innerEntryList"), T(this, A, $).call(this, r, "outerNote"), T(this, A, be).call(this, r);
  }
  /**** EntryMayBeMovedTo — check if entry can be moved to target ****/
  EntryMayBeMovedTo(e, t, i) {
    return this._mayMoveEntryTo(e.Id, t.Id, i);
  }
  /**** moveEntryTo — move entry to new location in tree ****/
  moveEntryTo(e, t, i) {
    if (ei.parse(i), !this._mayMoveEntryTo(e.Id, t.Id, i))
      throw new ke("move-would-cycle", "cannot move an entry into one of its own descendants");
    const r = this._outerNoteIdOf(e.Id), s = T(this, A, Gt).call(this, t.Id, i);
    this.transact(() => {
      if (x(this, ee).api.val(["Entries", e.Id, "outerPlacement"]).set(F.s.con({ outerNoteId: t.Id, OrderKey: s })), r === ye && t.Id !== ye) {
        const o = T(this, A, Y).call(this).Entries[e.Id], c = o == null ? void 0 : o.Info;
        c != null && "_trashedAt" in c && (x(this, ee).api.obj(["Entries", e.Id, "Info"]).del(["_trashedAt"]), T(this, A, $).call(this, e.Id, "Info._trashedAt"));
      }
      r != null && (T(this, A, at).call(this, r, e.Id), T(this, A, $).call(this, r, "innerEntryList")), T(this, A, Le).call(this, t.Id, e.Id), T(this, A, $).call(this, t.Id, "innerEntryList"), T(this, A, $).call(this, e.Id, "outerNote");
    });
  }
  /**** EntryMayBeDeleted — check if entry can be deleted ****/
  EntryMayBeDeleted(e) {
    return this._mayDeleteEntry(e.Id);
  }
  /**** deleteEntry — move entry to trash ****/
  deleteEntry(e) {
    if (!this._mayDeleteEntry(e.Id))
      throw new ke("delete-not-permitted", "this entry cannot be deleted");
    const t = this._outerNoteIdOf(e.Id), i = T(this, A, ni).call(this, ye), r = Or(i, null);
    this.transact(() => {
      x(this, ee).api.val(["Entries", e.Id, "outerPlacement"]).set(F.s.con({ outerNoteId: ye, OrderKey: r })), T(this, A, wl).call(this, e.Id), x(this, ee).api.obj(["Entries", e.Id, "Info"]).set({ _trashedAt: F.s.val(F.s.json(Date.now())) }), t != null && (T(this, A, at).call(this, t, e.Id), T(this, A, $).call(this, t, "innerEntryList")), T(this, A, Le).call(this, ye, e.Id), T(this, A, $).call(this, ye, "innerEntryList"), T(this, A, $).call(this, e.Id, "outerNote"), T(this, A, $).call(this, e.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry from trash ****/
  purgeEntry(e) {
    if (this._outerNoteIdOf(e.Id) !== ye)
      throw new ke("purge-not-in-trash", "only direct children of TrashNote can be purged");
    if (T(this, A, bl).call(this, e.Id))
      throw new ke("purge-protected", "entry is protected by incoming links and cannot be purged");
    this.transact(() => {
      T(this, A, js).call(this, e.Id);
    });
  }
  /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
  purgeExpiredTrashEntries(e) {
    var c, u;
    const t = e ?? x(this, Pt);
    if (t == null)
      return 0;
    const i = Date.now(), r = T(this, A, Y).call(this), s = Array.from(x(this, xe).get(ye) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const l of s) {
      const a = r.Entries[l];
      if (a == null || ((c = a.outerPlacement) == null ? void 0 : c.outerNoteId) !== ye)
        continue;
      const g = (u = a.Info) == null ? void 0 : u._trashedAt;
      if (typeof g == "number" && !(i - g < t))
        try {
          this.purgeEntry(T(this, A, be).call(this, l)), o++;
        } catch {
        }
    }
    return o;
  }
  /**** dispose — clean up resources ****/
  dispose() {
    x(this, Ye) != null && (clearInterval(x(this, Ye)), z(this, Ye, null)), x(this, Rt).clear();
  }
  //----------------------------------------------------------------------------//
  //                             Change Tracking                                //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback within transaction ****/
  transact(e) {
    const t = x(this, Qt) === 0;
    Kr(this, Qt)._++;
    let i;
    try {
      i = e();
    } finally {
      if (Kr(this, Qt)._--, t) {
        const r = x(this, ee).api.flush();
        if (!x(this, Lt))
          try {
            const c = r.toBinary();
            c.byteLength > 0 && x(this, $t).push(c);
          } catch {
          }
        const s = x(this, ht), o = x(this, Lt) ? "external" : "internal";
        z(this, ht, {}), T(this, A, _l).call(this, o, s);
      }
    }
    return i;
  }
  /**** onChangeInvoke — register change listener ****/
  onChangeInvoke(e) {
    return x(this, Rt).add(e), () => {
      x(this, Rt).delete(e);
    };
  }
  /**** applyRemotePatch — apply external patch to model ****/
  applyRemotePatch(e) {
    z(this, Lt, !0);
    try {
      this.transact(() => {
        if (e instanceof Uint8Array)
          try {
            const t = T(this, A, fl).call(this, e);
            for (const i of t) {
              const r = dc.Patch.fromBinary(i);
              x(this, ee).applyPatch(r);
            }
          } catch {
            const t = dc.Patch.fromBinary(e);
            x(this, ee).applyPatch(t);
          }
        else
          x(this, ee).applyPatch(e);
        T(this, A, vl).call(this);
      });
    } finally {
      z(this, Lt, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get current sync position ****/
  get currentCursor() {
    return T(this, A, ll).call(this, x(this, $t).length);
  }
  /**** exportPatch — export patches since given cursor ****/
  exportPatch(e) {
    const t = e != null ? T(this, A, hl).call(this, e) : 0, i = x(this, $t).slice(t);
    return T(this, A, dl).call(this, i);
  }
  /**** recoverOrphans — move orphaned entries to LostAndFound ****/
  recoverOrphans() {
    this.transact(() => {
      var t;
      const e = T(this, A, Y).call(this).Entries;
      for (const [i, r] of Object.entries(e)) {
        const s = (t = r.outerPlacement) == null ? void 0 : t.outerNoteId;
        if (s && s !== ot && s !== ye && s !== Ge && !e[s]) {
          const o = T(this, A, ni).call(this, Ge), c = Or(o, null);
          x(this, ee).api.obj(["Entries", i, "outerPlacement"]).set(F.s.val(F.s.con({
            outerNoteId: Ge,
            OrderKey: c
          }))), T(this, A, at).call(this, s, i), T(this, A, Le).call(this, Ge, i), T(this, A, $).call(this, s, "innerEntryList"), T(this, A, $).call(this, Ge, "innerEntryList"), T(this, A, $).call(this, i, "outerNote");
        }
      }
    });
  }
  /**** asBinary — serialize store to gzipped binary ****/
  asBinary() {
    return Ed(x(this, ee).toBinary());
  }
  /**** asJSON — serialize store to base64-encoded binary ****/
  asJSON() {
    return Buffer.from(this.asBinary()).toString("base64");
  }
  //----------------------------------------------------------------------------//
  //                               Proxies                                      //
  //----------------------------------------------------------------------------//
  /**** get — proxy handler for property access ****/
  get(e, t) {
    return t === "Entries" ? new Proxy(T(this, A, Y).call(this).Entries, {
      get: (i, r) => T(this, A, be).call(this, r),
      set: () => !1,
      deleteProperty: () => !1,
      ownKeys: () => Object.keys(T(this, A, Y).call(this).Entries),
      getOwnPropertyDescriptor: (i, r) => {
        if (Object.keys(T(this, A, Y).call(this).Entries).includes(String(r)))
          return {
            configurable: !0,
            enumerable: !0,
            value: T(this, A, be).call(this, String(r))
          };
      }
    }) : T(this, A, Y).call(this)[t];
  }
  /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
  set() {
    return !1;
  }
  deleteProperty() {
    return !1;
  }
  ownKeys() {
    return Object.keys(T(this, A, Y).call(this));
  }
  getOwnPropertyDescriptor() {
    return {
      configurable: !0,
      enumerable: !0
    };
  }
  //----------------------------------------------------------------------------//
  //              Internal helpers — called by SNS_Entry / Note / Link           //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (note or link) ****/
  _KindOf(e) {
    const t = T(this, A, Y).call(this).Entries[e];
    if (t == null)
      throw new ke("not-found", `entry '${e}' not found`);
    return t.Kind;
  }
  /**** _LabelOf — get entry label ****/
  _LabelOf(e) {
    const t = T(this, A, Y).call(this).Entries[e];
    return t == null ? "" : String(t.Label ?? "");
  }
  /**** _setLabelOf — set entry label ****/
  _setLabelOf(e, t) {
    ff.parse(t), this.transact(() => {
      T(this, A, Y).call(this).Entries[e] != null && (x(this, ee).api.obj(["Entries", e]).set({ Label: t }), T(this, A, $).call(this, e, "Label"));
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(e) {
    const t = T(this, A, Y).call(this).Entries[e], i = (t == null ? void 0 : t.MIMEType) ?? "";
    return i === "" ? Wr : i;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(e, t) {
    Rc.parse(t);
    const i = t === Wr ? "" : t;
    this.transact(() => {
      x(this, ee).api.obj(["Entries", e]).set({ MIMEType: i }), T(this, A, $).call(this, e, "Type");
    });
  }
  /**** _ValueKindOf — get value storage kind ****/
  _ValueKindOf(e) {
    const t = T(this, A, Y).call(this).Entries[e];
    return (t == null ? void 0 : t.ValueKind) ?? "none";
  }
  /**** _isLiteralOf — check if entry value is literal text ****/
  _isLiteralOf(e) {
    const t = this._ValueKindOf(e);
    return t === "literal" || t === "literal-reference";
  }
  /**** _isBinaryOf — check if entry value is binary ****/
  _isBinaryOf(e) {
    const t = this._ValueKindOf(e);
    return t === "binary" || t === "binary-reference";
  }
  /**** _readValueOf — read entry value ****/
  async _readValueOf(e) {
    const t = this._ValueKindOf(e);
    switch (!0) {
      case t === "none":
        return;
      case t === "literal": {
        const i = T(this, A, Y).call(this).Entries[e], r = i == null ? void 0 : i.literalValue;
        return String(r ?? "");
      }
      case t === "binary": {
        const i = T(this, A, Y).call(this).Entries[e];
        return i == null ? void 0 : i.binaryValue;
      }
      default:
        throw new ke("not-implemented", "large value fetching requires a ValueStore");
    }
  }
  /**** _writeValueOf — write entry value ****/
  _writeValueOf(e, t) {
    this.transact(() => {
      if (T(this, A, Y).call(this).Entries[e] != null) {
        switch (!0) {
          case t == null: {
            x(this, ee).api.obj(["Entries", e]).set({ ValueKind: F.s.val(F.s.str("none")) });
            break;
          }
          case (typeof t == "string" && t.length <= x(this, Br)): {
            x(this, ee).api.obj(["Entries", e]).set({
              ValueKind: F.s.val(F.s.str("literal")),
              literalValue: t
            });
            break;
          }
          case typeof t == "string": {
            const s = new TextEncoder().encode(t), o = `sha256-size-${s.byteLength}`;
            x(this, ee).api.obj(["Entries", e]).set({
              ValueKind: F.s.val(F.s.str("literal-reference")),
              ValueRef: { Hash: o, Size: s.byteLength }
            });
            break;
          }
          case t.byteLength <= zl: {
            x(this, ee).api.obj(["Entries", e]).set({
              ValueKind: F.s.val(F.s.str("binary")),
              binaryValue: t
            });
            break;
          }
          default: {
            const r = t, s = `sha256-size-${r.byteLength}`;
            x(this, ee).api.obj(["Entries", e]).set({
              ValueKind: F.s.val(F.s.str("binary-reference")),
              ValueRef: { Hash: s, Size: r.byteLength }
            });
            break;
          }
        }
        T(this, A, $).call(this, e, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value in-place ****/
  _spliceValueOf(e, t, i, r) {
    if (this._ValueKindOf(e) !== "literal")
      throw new ke("change-value-not-literal", "changeValue only works on notes with ValueKind literal");
    this.transact(() => {
      var u;
      const o = String(((u = T(this, A, Y).call(this).Entries[e]) == null ? void 0 : u.literalValue) ?? ""), c = o.slice(0, t) + r + o.slice(t + i);
      this._writeValueOf(e, c);
    });
  }
  /**** _innerEntriesOf — get sorted inner entries ****/
  _innerEntriesOf(e) {
    return T(this, A, ri).call(this, e).map((t) => T(this, A, be).call(this, t.Id));
  }
  /**** _outerNoteOf — get outer note ****/
  _outerNoteOf(e) {
    const t = this._outerNoteIdOf(e);
    return t ? T(this, A, be).call(this, t) : void 0;
  }
  /**** _outerNoteIdOf — get outer note id ****/
  _outerNoteIdOf(e) {
    var r;
    const t = T(this, A, Y).call(this).Entries[e];
    return ((r = t == null ? void 0 : t.outerPlacement) == null ? void 0 : r.outerNoteId) ?? null;
  }
  /**** _outerNotesOf — get ancestor note chain ****/
  _outerNotesOf(e) {
    const t = [];
    let i = this._outerNoteIdOf(e);
    for (; i != null; )
      t.push(T(this, A, be).call(this, i)), i = this._outerNoteIdOf(i);
    return t;
  }
  /**** _outerNoteIdsOf — get ancestor note id chain ****/
  _outerNoteIdsOf(e) {
    const t = [];
    let i = this._outerNoteIdOf(e);
    for (; i != null; )
      t.push(i), i = this._outerNoteIdOf(i);
    return t;
  }
  /**** _InfoProxyOf — get proxy for metadata access ****/
  _InfoProxyOf(e) {
    const t = this;
    return new Proxy({}, {
      get(i, r) {
        var o, c;
        if (typeof r != "string")
          return;
        const s = (c = T(o = t, A, Y).call(o).Entries[e]) == null ? void 0 : c.Info;
        return s == null ? void 0 : s[r];
      },
      set(i, r, s) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var o;
          x(t, ee).api.obj(["Entries", e, "Info"]).set({ [r]: s }), T(o = t, A, $).call(o, e, `Info.${r}`);
        }), !0);
      },
      deleteProperty(i, r) {
        return typeof r != "string" ? !1 : (t.transact(() => {
          var s;
          x(t, ee).api.obj(["Entries", e, "Info"]).del([r]), T(s = t, A, $).call(s, e, `Info.${r}`);
        }), !0);
      },
      ownKeys() {
        var r, s;
        const i = (s = T(r = t, A, Y).call(r).Entries[e]) == null ? void 0 : s.Info;
        return i != null ? Object.keys(i) : [];
      },
      getOwnPropertyDescriptor(i, r) {
        var o, c;
        if (typeof r != "string")
          return;
        const s = (c = T(o = t, A, Y).call(o).Entries[e]) == null ? void 0 : c.Info;
        if (!(s == null || !(r in s)))
          return { configurable: !0, enumerable: !0, value: s[r] };
      },
      has(i, r) {
        var o, c;
        if (typeof r != "string")
          return !1;
        const s = (c = T(o = t, A, Y).call(o).Entries[e]) == null ? void 0 : c.Info;
        return s != null && r in s;
      }
    });
  }
  /**** _TargetOf — get link target note ****/
  _TargetOf(e) {
    const t = T(this, A, Y).call(this).Entries[e], i = t == null ? void 0 : t.TargetId;
    return i ? T(this, A, be).call(this, i) : void 0;
  }
  /**** _EntryAsJSON — serialize entry to JSON ****/
  _EntryAsJSON(e) {
    const t = T(this, A, Y).call(this).Entries[e];
    if (t == null)
      throw new ke("not-found", `entry '${e}' not found`);
    return {
      Id: e,
      Kind: t.Kind,
      Label: t.Label,
      Info: t.Info,
      ...t.Kind === "note" && {
        Type: this._TypeOf(e),
        ValueKind: this._ValueKindOf(e),
        literalValue: t.literalValue,
        binaryValue: t.binaryValue,
        ValueRef: t.ValueRef
      },
      ...t.Kind === "link" && {
        TargetId: t.TargetId
      },
      innerEntries: this._innerEntriesOf(e).map((i) => i.asJSON())
    };
  }
  /**** _mayMoveEntryTo — check if move is valid ****/
  _mayMoveEntryTo(e, t, i) {
    return !(e === ot || (e === ye || e === Ge) && t !== ot || T(this, A, kl).call(this, e, t));
  }
  /**** _mayDeleteEntry — check if entry can be deleted ****/
  _mayDeleteEntry(e) {
    return !(e === ot || e === ye || e === Ge);
  }
};
ee = new WeakMap(), Br = new WeakMap(), Pt = new WeakMap(), Ye = new WeakMap(), Rt = new WeakMap(), xe = new WeakMap(), ut = new WeakMap(), lt = new WeakMap(), ze = new WeakMap(), Ze = new WeakMap(), hi = new WeakMap(), Qt = new WeakMap(), ht = new WeakMap(), $t = new WeakMap(), Lt = new WeakMap(), A = new WeakSet(), /**** #encodeUint32 — encode 32-bit integer as bytes ****/
ll = function(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e >>> 0, !1), t;
}, /**** #decodeUint32 — decode 32-bit integer from bytes ****/
hl = function(e) {
  return e.byteLength < 4 ? 0 : new DataView(e.buffer, e.byteOffset, 4).getUint32(0, !1);
}, /**** #encodePatchArray — encode array of patches ****/
dl = function(e) {
  const t = 4 + e.reduce((o, c) => o + 4 + c.byteLength, 0), i = new Uint8Array(t), r = new DataView(i.buffer);
  r.setUint32(0, e.length, !1);
  let s = 4;
  for (const o of e)
    r.setUint32(s, o.byteLength, !1), s += 4, i.set(o, s), s += o.byteLength;
  return i;
}, /**** #decodePatchArray — decode array of patches ****/
fl = function(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = t.getUint32(0, !1), r = [];
  let s = 4;
  for (let o = 0; o < i; o++) {
    const c = t.getUint32(s, !1);
    s += 4, r.push(e.slice(s, s + c)), s += c;
  }
  return r;
}, //----------------------------------------------------------------------------//
//                             Private Helpers                                //
//----------------------------------------------------------------------------//
/**** #view — get current model state view ****/
Y = function() {
  return x(this, ee).api.view();
}, /**** #wrap — wrap raw entry data in SNS_Entry object ****/
be = function(e) {
  const i = T(this, A, Y).call(this).Entries[e];
  if (i == null)
    return null;
  const r = i.Kind;
  return r === "note" ? T(this, A, pl).call(this, e) : r === "link" ? T(this, A, yl).call(this, e) : null;
}, /**** #wrapNote — wrap raw note data in SNS_Note object ****/
pl = function(e) {
  const t = x(this, Ze).get(e);
  if (t instanceof to)
    return t;
  const i = new to(this, e);
  return T(this, A, Is).call(this, e, i), i;
}, /**** #wrapLink — wrap raw link data in SNS_Link object ****/
yl = function(e) {
  const t = x(this, Ze).get(e);
  if (t instanceof no)
    return t;
  const i = new no(this, e);
  return T(this, A, Is).call(this, e, i), i;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
Is = function(e, t) {
  if (x(this, Ze).size >= x(this, hi)) {
    const i = x(this, Ze).keys().next().value;
    i != null && x(this, Ze).delete(i);
  }
  x(this, Ze).set(e, t);
}, /**** #rebuildIndices — rebuild all indices from scratch ****/
gl = function() {
  var t;
  x(this, xe).clear(), x(this, ut).clear(), x(this, lt).clear(), x(this, ze).clear();
  const e = T(this, A, Y).call(this).Entries;
  for (const [i, r] of Object.entries(e)) {
    const s = (t = r.outerPlacement) == null ? void 0 : t.outerNoteId;
    if (s && T(this, A, Le).call(this, s, i), r.Kind === "link") {
      const o = r.TargetId;
      o && T(this, A, Wt).call(this, o, i);
    }
  }
}, /**** #updateIndicesFromView — update indices after patch applied ****/
vl = function() {
  var s;
  const e = /* @__PURE__ */ new Set(), t = T(this, A, Y).call(this).Entries;
  for (const [o, c] of Object.entries(t)) {
    e.add(o);
    const u = (s = c.outerPlacement) == null ? void 0 : s.outerNoteId, l = x(this, ut).get(o);
    if (u !== l && (l != null && (T(this, A, at).call(this, l, o), T(this, A, $).call(this, l, "innerEntryList")), u != null && (T(this, A, Le).call(this, u, o), T(this, A, $).call(this, u, "innerEntryList")), T(this, A, $).call(this, o, "outerNote")), c.Kind === "link") {
      const a = c.TargetId, h = x(this, ze).get(o);
      a !== h && (h != null && T(this, A, Tr).call(this, h, o), a != null && T(this, A, Wt).call(this, a, o));
    } else x(this, ze).has(o) && T(this, A, Tr).call(this, x(this, ze).get(o), o);
    T(this, A, $).call(this, o, "Label");
  }
  const i = Array.from(x(this, ut).entries()).filter(([o]) => !e.has(o));
  for (const [o, c] of i)
    T(this, A, at).call(this, c, o), T(this, A, $).call(this, c, "innerEntryList");
  const r = Array.from(x(this, ze).entries()).filter(([o]) => !e.has(o));
  for (const [o, c] of r)
    T(this, A, Tr).call(this, c, o);
}, /**** #addToReverseIndex — add entry to outer-note index ****/
Le = function(e, t) {
  let i = x(this, xe).get(e);
  i == null && (i = /* @__PURE__ */ new Set(), x(this, xe).set(e, i)), i.add(t), x(this, ut).set(t, e);
}, /**** #removeFromReverseIndex — remove entry from outer-note index ****/
at = function(e, t) {
  var i;
  (i = x(this, xe).get(e)) == null || i.delete(t), x(this, ut).delete(t);
}, /**** #addToLinkTargetIndex — add link to target index ****/
Wt = function(e, t) {
  let i = x(this, lt).get(e);
  i == null && (i = /* @__PURE__ */ new Set(), x(this, lt).set(e, i)), i.add(t), x(this, ze).set(t, e);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
Tr = function(e, t) {
  var i;
  (i = x(this, lt).get(e)) == null || i.delete(t), x(this, ze).delete(t);
}, /**** #orderKeyAt — generate order key for insertion position ****/
Gt = function(e, t) {
  const i = T(this, A, ri).call(this, e);
  if (i.length === 0 || t == null) {
    const c = i.length > 0 ? i[i.length - 1].OrderKey : null;
    return Or(c, null);
  }
  const r = Math.max(0, Math.min(t, i.length)), s = r > 0 ? i[r - 1].OrderKey : null, o = r < i.length ? i[r].OrderKey : null;
  return Or(s, o);
}, /**** #lastOrderKeyOf — get order key of last inner entry ****/
ni = function(e) {
  const t = T(this, A, ri).call(this, e);
  return t.length > 0 ? t[t.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries ****/
ri = function(e) {
  var s, o;
  const t = x(this, xe).get(e) ?? /* @__PURE__ */ new Set(), i = [], r = T(this, A, Y).call(this).Entries;
  for (const c of t) {
    const u = r[c];
    ((s = u.outerPlacement) == null ? void 0 : s.outerNoteId) === e && i.push({
      Id: c,
      OrderKey: ((o = u.outerPlacement) == null ? void 0 : o.OrderKey) ?? ""
    });
  }
  return i.sort(
    (c, u) => c.OrderKey < u.OrderKey ? -1 : c.OrderKey > u.OrderKey ? 1 : c.Id < u.Id ? -1 : c.Id > u.Id ? 1 : 0
  ), i;
}, /**** #isProtected — check if entry is protected by incoming links ****/
bl = function(e) {
  const t = T(this, A, As).call(this), i = /* @__PURE__ */ new Set();
  let r = !0;
  for (; r; ) {
    r = !1;
    for (const s of x(this, xe).get(ye) ?? /* @__PURE__ */ new Set())
      i.has(s) || T(this, A, Ts).call(this, s, t, i) && (i.add(s), r = !0);
  }
  return i.has(e);
}, /**** #subtreeHasIncomingLinks — check for incoming links to subtree ****/
Ts = function(e, t, i) {
  const r = [e], s = /* @__PURE__ */ new Set();
  for (; r.length > 0; ) {
    const o = r.pop();
    if (s.has(o))
      continue;
    s.add(o);
    const c = x(this, lt).get(o) ?? /* @__PURE__ */ new Set();
    for (const u of c) {
      if (t.has(u))
        return !0;
      const l = T(this, A, ml).call(this, u);
      if (l != null && i.has(l))
        return !0;
    }
    for (const u of x(this, xe).get(o) ?? /* @__PURE__ */ new Set())
      s.has(u) || r.push(u);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashNote containing entry ****/
ml = function(e) {
  let t = e;
  for (; t != null; ) {
    const i = this._outerNoteIdOf(t);
    if (i === ye)
      return t;
    if (i === ot || i == null)
      return null;
    t = i;
  }
  return null;
}, /**** #reachableFromRoot — compute reachable entries from root ****/
As = function() {
  const e = /* @__PURE__ */ new Set(), t = [ot];
  for (; t.length > 0; ) {
    const i = t.pop();
    if (!e.has(i)) {
      e.add(i);
      for (const r of x(this, xe).get(i) ?? /* @__PURE__ */ new Set())
        e.has(r) || t.push(r);
    }
  }
  return e;
}, /**** #purgeSubtree — recursively purge entry and children ****/
js = function(e) {
  var u;
  const t = T(this, A, Y).call(this).Entries[e];
  if (t == null)
    return;
  const i = t.Kind, r = (u = t.outerPlacement) == null ? void 0 : u.outerNoteId, s = T(this, A, As).call(this), o = /* @__PURE__ */ new Set(), c = Array.from(x(this, xe).get(e) ?? /* @__PURE__ */ new Set());
  for (const l of c)
    if (T(this, A, Ts).call(this, l, s, o)) {
      const a = Or(T(this, A, ni).call(this, ye), null);
      x(this, ee).api.obj(["Entries", l, "outerPlacement"]).set({
        outerNoteId: ye,
        OrderKey: a
      }), T(this, A, at).call(this, e, l), T(this, A, Le).call(this, ye, l), T(this, A, $).call(this, ye, "innerEntryList"), T(this, A, $).call(this, l, "outerNote");
    } else
      T(this, A, js).call(this, l);
  if (x(this, ee).api.obj(["Entries"]).del([e]), r && (T(this, A, at).call(this, r, e), T(this, A, $).call(this, r, "innerEntryList")), i === "link") {
    const l = t.TargetId;
    l && T(this, A, Tr).call(this, l, e);
  }
  x(this, Ze).delete(e);
}, /**** #requireNoteExists — throw if note doesn't exist ****/
Es = function(e) {
  const i = T(this, A, Y).call(this).Entries[e];
  if (i == null || i.Kind !== "note")
    throw new ke("invalid-argument", `note '${e}' does not exist`);
}, /**** #ensureInfoExists — create Info object if missing ****/
wl = function(e) {
  const t = T(this, A, Y).call(this).Entries[e];
  (t == null ? void 0 : t.Info) == null && x(this, ee).api.obj(["Entries", e]).set({ Info: F.s.obj({}) });
}, /**** #removeInfoIfEmpty — delete Info object if empty ****/
pf = function(e) {
  const t = T(this, A, Y).call(this).Entries[e], i = t == null ? void 0 : t.Info;
  i != null && Object.keys(i).length === 0 && x(this, ee).api.obj(["Entries", e]).del(["Info"]);
}, /**** #recordChange — track property change ****/
$ = function(e, t) {
  x(this, ht)[e] == null && (x(this, ht)[e] = /* @__PURE__ */ new Set()), x(this, ht)[e].add(t);
}, /**** #notifyHandlers — invoke change listeners ****/
_l = function(e, t) {
  if (Object.keys(t).length !== 0)
    for (const i of x(this, Rt))
      try {
        i(e, t);
      } catch {
      }
}, /**** #wouldCreateCycle — check if move would create an outer-note cycle ****/
kl = function(e, t) {
  let i = t;
  for (; i != null; ) {
    if (i === e)
      return !0;
    i = this._outerNoteIdOf(i);
  }
  return !1;
};
let Lc = $s;
const Bc = 1, Vc = 2, Mc = 3, Dc = 4, qc = 5, Fe = 32, ti = 1024 * 1024;
function ps(...n) {
  const e = n.reduce((r, s) => r + s.byteLength, 0), t = new Uint8Array(e);
  let i = 0;
  for (const r of n)
    t.set(r, i), i += r.byteLength;
  return t;
}
function Nr(n, e) {
  const t = new Uint8Array(1 + e.byteLength);
  return t[0] = n, t.set(e, 1), t;
}
function Uc(n) {
  const e = new Uint8Array(n.length / 2);
  for (let t = 0; t < n.length; t += 2)
    e[t / 2] = parseInt(n.slice(t, t + 2), 16);
  return e;
}
function Fc(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var Qe, $e, Vr, en, Bt, tn, Vt, nn, rn, sn, Mr, fe, Ps, Xt, Ar, Sl, xl, Ol;
class Vf {
  /**** constructor ****/
  constructor(e) {
    D(this, fe);
    Sn(this, "StoreID");
    D(this, Qe, "disconnected");
    D(this, $e);
    D(this, Vr, "");
    D(this, en);
    D(this, Bt);
    D(this, tn, /* @__PURE__ */ new Set());
    D(this, Vt, /* @__PURE__ */ new Set());
    D(this, nn, /* @__PURE__ */ new Set());
    D(this, rn, /* @__PURE__ */ new Set());
    // incoming value chunk reassembly: hash → chunks array
    D(this, sn, /* @__PURE__ */ new Map());
    // presence peer set (remote peers)
    D(this, Mr, /* @__PURE__ */ new Map());
    this.StoreID = e;
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return x(this, Qe);
  }
  /**** connect ****/
  async connect(e, t) {
    return z(this, Vr, e), z(this, en, t), T(this, fe, Ps).call(this);
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    T(this, fe, xl).call(this), T(this, fe, Ar).call(this, "disconnected"), (e = x(this, $e)) == null || e.close(), z(this, $e, void 0);
  }
  /**** sendPatch ****/
  sendPatch(e) {
    T(this, fe, Xt).call(this, Nr(Bc, e));
  }
  /**** sendValue ****/
  sendValue(e, t) {
    const i = Uc(e);
    if (t.byteLength <= ti)
      T(this, fe, Xt).call(this, Nr(Vc, ps(i, t)));
    else {
      const r = Math.ceil(t.byteLength / ti);
      for (let s = 0; s < r; s++) {
        const o = s * ti, c = t.slice(o, o + ti), u = new Uint8Array(Fe + 8);
        u.set(i, 0), new DataView(u.buffer).setUint32(Fe, s, !1), new DataView(u.buffer).setUint32(Fe + 4, r, !1), T(this, fe, Xt).call(this, Nr(qc, ps(u, c)));
      }
    }
  }
  /**** requestValue ****/
  requestValue(e) {
    T(this, fe, Xt).call(this, Nr(Mc, Uc(e)));
  }
  /**** onPatch ****/
  onPatch(e) {
    return x(this, tn).add(e), () => {
      x(this, tn).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return x(this, Vt).add(e), () => {
      x(this, Vt).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return x(this, nn).add(e), () => {
      x(this, nn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                            SNS_PresenceProvider                            //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    const t = new TextEncoder().encode(JSON.stringify(e));
    T(this, fe, Xt).call(this, Nr(Dc, t));
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return x(this, rn).add(e), () => {
      x(this, rn).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return x(this, Mr);
  }
}
Qe = new WeakMap(), $e = new WeakMap(), Vr = new WeakMap(), en = new WeakMap(), Bt = new WeakMap(), tn = new WeakMap(), Vt = new WeakMap(), nn = new WeakMap(), rn = new WeakMap(), sn = new WeakMap(), Mr = new WeakMap(), fe = new WeakSet(), /**** #doConnect ****/
Ps = function() {
  return new Promise((e, t) => {
    const i = `${x(this, Vr)}?token=${encodeURIComponent(x(this, en).Token)}`, r = new WebSocket(i);
    r.binaryType = "arraybuffer", z(this, $e, r), T(this, fe, Ar).call(this, "connecting"), r.onopen = () => {
      T(this, fe, Ar).call(this, "connected"), e();
    }, r.onerror = (s) => {
      x(this, Qe) === "connecting" && t(new Error("WebSocket connection failed"));
    }, r.onclose = () => {
      z(this, $e, void 0), x(this, Qe) !== "disconnected" && (T(this, fe, Ar).call(this, "reconnecting"), T(this, fe, Sl).call(this));
    }, r.onmessage = (s) => {
      T(this, fe, Ol).call(this, new Uint8Array(s.data));
    };
  });
}, //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #send ****/
Xt = function(e) {
  var t;
  ((t = x(this, $e)) == null ? void 0 : t.readyState) === WebSocket.OPEN && x(this, $e).send(e);
}, /**** #setState ****/
Ar = function(e) {
  if (x(this, Qe) !== e) {
    z(this, Qe, e);
    for (const t of x(this, nn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #scheduleReconnect ****/
Sl = function() {
  var t;
  const e = ((t = x(this, en)) == null ? void 0 : t.reconnectDelayMs) ?? 2e3;
  z(this, Bt, setTimeout(() => {
    x(this, Qe) === "reconnecting" && T(this, fe, Ps).call(this).catch(() => {
    });
  }, e));
}, /**** #clearReconnectTimer ****/
xl = function() {
  x(this, Bt) != null && (clearTimeout(x(this, Bt)), z(this, Bt, void 0));
}, /**** #handleFrame ****/
Ol = function(e) {
  if (e.byteLength < 1)
    return;
  const t = e[0], i = e.slice(1);
  switch (t) {
    case Bc: {
      for (const r of x(this, tn))
        try {
          r(i);
        } catch {
        }
      break;
    }
    case Vc: {
      if (i.byteLength < Fe)
        return;
      const r = Fc(i.slice(0, Fe)), s = i.slice(Fe);
      for (const o of x(this, Vt))
        try {
          o(r, s);
        } catch {
        }
      break;
    }
    case Mc:
      break;
    case Dc: {
      try {
        const r = JSON.parse(new TextDecoder().decode(i));
        if (typeof r.PeerId != "string")
          break;
        r.lastSeen = Date.now(), x(this, Mr).set(r.PeerId, r);
        for (const s of x(this, rn))
          try {
            s(r.PeerId, r);
          } catch {
          }
      } catch {
      }
      break;
    }
    case qc: {
      if (i.byteLength < Fe + 8)
        return;
      const r = Fc(i.slice(0, Fe)), s = new DataView(i.buffer, i.byteOffset + Fe, 8), o = s.getUint32(0, !1), c = s.getUint32(4, !1), u = i.slice(Fe + 8);
      let l = x(this, sn).get(r);
      if (l == null && (l = { total: c, chunks: /* @__PURE__ */ new Map() }, x(this, sn).set(r, l)), l.chunks.set(o, u), l.chunks.size === l.total) {
        const a = ps(
          ...Array.from({ length: l.total }, (h, g) => l.chunks.get(g))
        );
        x(this, sn).delete(r);
        for (const h of x(this, Vt))
          try {
            h(r, a);
          } catch {
          }
      }
      break;
    }
  }
};
var Dr, Ve, me, dt, He, Me, ft, on, an, cn, Mt, un, Oe, ne, jr, Er, Nl, Cl, Il, Rs, Ls, Tl, Bs, Al;
class Mf {
  /**** Constructor ****/
  constructor(e, t = {}) {
    D(this, ne);
    Sn(this, "StoreID");
    D(this, Dr);
    D(this, Ve, crypto.randomUUID());
    D(this, me);
    /**** Signalling WebSocket ****/
    D(this, dt);
    /**** active RTCPeerConnection per remote PeerId ****/
    D(this, He, /* @__PURE__ */ new Map());
    D(this, Me, /* @__PURE__ */ new Map());
    /**** Connection state ****/
    D(this, ft, "disconnected");
    /**** Event Handlers ****/
    D(this, on, /* @__PURE__ */ new Set());
    D(this, an, /* @__PURE__ */ new Set());
    D(this, cn, /* @__PURE__ */ new Set());
    D(this, Mt, /* @__PURE__ */ new Set());
    /**** Presence Peer Set ****/
    D(this, un, /* @__PURE__ */ new Map());
    /**** Fallback Mode ****/
    D(this, Oe, !1);
    this.StoreID = e, z(this, Dr, t), z(this, me, t.Fallback ?? void 0);
  }
  //----------------------------------------------------------------------------//
  //                            SNS_NetworkProvider                             //
  //----------------------------------------------------------------------------//
  /**** ConnectionState ****/
  get ConnectionState() {
    return x(this, ft);
  }
  /**** connect ****/
  async connect(e, t) {
    return new Promise((i, r) => {
      const s = `${e}?token=${encodeURIComponent(t.Token)}`, o = new WebSocket(s);
      z(this, dt, o), T(this, ne, jr).call(this, "connecting"), o.onopen = () => {
        T(this, ne, jr).call(this, "connected"), T(this, ne, Er).call(this, { type: "hello", from: x(this, Ve) }), i();
      }, o.onerror = () => {
        if (!x(this, Oe) && x(this, me) != null) {
          const c = e.replace("/signal/", "/ws/");
          z(this, Oe, !0), x(this, me).connect(c, t).then(i).catch(r);
        } else
          r(new Error("WebRTC signalling connection failed"));
      }, o.onclose = () => {
        x(this, ft) !== "disconnected" && (T(this, ne, jr).call(this, "reconnecting"), setTimeout(() => {
          x(this, ft) === "reconnecting" && this.connect(e, t).catch(() => {
          });
        }, t.reconnectDelayMs ?? 2e3));
      }, o.onmessage = (c) => {
        try {
          const u = JSON.parse(c.data);
          T(this, ne, Nl).call(this, u, t);
        } catch {
        }
      };
    });
  }
  /**** disconnect ****/
  disconnect() {
    var e;
    T(this, ne, jr).call(this, "disconnected"), (e = x(this, dt)) == null || e.close(), z(this, dt, void 0);
    for (const t of x(this, He).values())
      t.close();
    x(this, He).clear(), x(this, Me).clear(), x(this, Oe) && x(this, me) != null && (x(this, me).disconnect(), z(this, Oe, !1));
  }
  /**** sendPatch ****/
  sendPatch(e) {
    var i;
    if (x(this, Oe)) {
      (i = x(this, me)) == null || i.sendPatch(e);
      return;
    }
    const t = new Uint8Array(1 + e.byteLength);
    t[0] = 1, t.set(e, 1);
    for (const r of x(this, Me).values())
      if (r.readyState === "open")
        try {
          r.send(t);
        } catch {
        }
  }
  /**** sendValue ****/
  sendValue(e, t) {
    var s;
    if (x(this, Oe)) {
      (s = x(this, me)) == null || s.sendValue(e, t);
      return;
    }
    const i = T(this, ne, Bs).call(this, e), r = new Uint8Array(33 + t.byteLength);
    r[0] = 2, r.set(i, 1), r.set(t, 33);
    for (const o of x(this, Me).values())
      if (o.readyState === "open")
        try {
          o.send(r);
        } catch {
        }
  }
  /**** requestValue ****/
  requestValue(e) {
    var r;
    if (x(this, Oe)) {
      (r = x(this, me)) == null || r.requestValue(e);
      return;
    }
    const t = T(this, ne, Bs).call(this, e), i = new Uint8Array(33);
    i[0] = 3, i.set(t, 1);
    for (const s of x(this, Me).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onPatch ****/
  onPatch(e) {
    return x(this, on).add(e), x(this, Oe) && x(this, me) != null ? x(this, me).onPatch(e) : () => {
      x(this, on).delete(e);
    };
  }
  /**** onValue ****/
  onValue(e) {
    return x(this, an).add(e), x(this, Oe) && x(this, me) != null ? x(this, me).onValue(e) : () => {
      x(this, an).delete(e);
    };
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return x(this, cn).add(e), () => {
      x(this, cn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PresenceProvider                              //
  //----------------------------------------------------------------------------//
  /**** sendLocalState ****/
  sendLocalState(e) {
    var r;
    if (x(this, Oe)) {
      (r = x(this, me)) == null || r.sendLocalState(e);
      return;
    }
    const t = new TextEncoder().encode(JSON.stringify(e)), i = new Uint8Array(1 + t.byteLength);
    i[0] = 4, i.set(t, 1);
    for (const s of x(this, Me).values())
      if (s.readyState === "open")
        try {
          s.send(i);
        } catch {
        }
  }
  /**** onRemoteState ****/
  onRemoteState(e) {
    return x(this, Mt).add(e), () => {
      x(this, Mt).delete(e);
    };
  }
  /**** PeerSet ****/
  get PeerSet() {
    return x(this, un);
  }
}
Dr = new WeakMap(), Ve = new WeakMap(), me = new WeakMap(), dt = new WeakMap(), He = new WeakMap(), Me = new WeakMap(), ft = new WeakMap(), on = new WeakMap(), an = new WeakMap(), cn = new WeakMap(), Mt = new WeakMap(), un = new WeakMap(), Oe = new WeakMap(), ne = new WeakSet(), //----------------------------------------------------------------------------//
//                                  Private                                   //
//----------------------------------------------------------------------------//
/**** #setState — updates the connection state and notifies all registered handlers ****/
jr = function(e) {
  if (x(this, ft) !== e) {
    z(this, ft, e);
    for (const t of x(this, cn))
      try {
        t(e);
      } catch {
      }
  }
}, /**** #sendSignal — sends a JSON signalling message over the signalling WebSocket ****/
Er = function(e) {
  var t;
  ((t = x(this, dt)) == null ? void 0 : t.readyState) === WebSocket.OPEN && x(this, dt).send(JSON.stringify(e));
}, Nl = async function(e, t) {
  switch (e.type) {
    case "hello": {
      if (e.from === x(this, Ve))
        return;
      x(this, He).has(e.from) || await T(this, ne, Cl).call(this, e.from);
      break;
    }
    case "offer": {
      if (e.to !== x(this, Ve))
        return;
      await T(this, ne, Il).call(this, e.from, e.sdp);
      break;
    }
    case "answer": {
      if (e.to !== x(this, Ve))
        return;
      const i = x(this, He).get(e.from);
      i != null && await i.setRemoteDescription(new RTCSessionDescription(e.sdp));
      break;
    }
    case "candidate": {
      if (e.to !== x(this, Ve))
        return;
      const i = x(this, He).get(e.from);
      i != null && await i.addIceCandidate(new RTCIceCandidate(e.candidate));
      break;
    }
  }
}, Cl = async function(e) {
  const t = T(this, ne, Rs).call(this, e), i = t.createDataChannel("sns", { ordered: !1, maxRetransmits: 0 });
  T(this, ne, Ls).call(this, i, e), x(this, Me).set(e, i);
  const r = await t.createOffer();
  await t.setLocalDescription(r), T(this, ne, Er).call(this, { type: "offer", from: x(this, Ve), to: e, sdp: r });
}, Il = async function(e, t) {
  const i = T(this, ne, Rs).call(this, e);
  await i.setRemoteDescription(new RTCSessionDescription(t));
  const r = await i.createAnswer();
  await i.setLocalDescription(r), T(this, ne, Er).call(this, { type: "answer", from: x(this, Ve), to: e, sdp: r });
}, /**** #createPeerConnection — creates and configures a new RTCPeerConnection for RemotePeerId ****/
Rs = function(e) {
  const t = x(this, Dr).ICEServers ?? [
    { urls: "stun:stun.cloudflare.com:3478" }
  ], i = new RTCPeerConnection({ iceServers: t });
  return x(this, He).set(e, i), i.onicecandidate = (r) => {
    r.candidate != null && T(this, ne, Er).call(this, {
      type: "candidate",
      from: x(this, Ve),
      to: e,
      candidate: r.candidate.toJSON()
    });
  }, i.ondatachannel = (r) => {
    T(this, ne, Ls).call(this, r.channel, e), x(this, Me).set(e, r.channel);
  }, i.onconnectionstatechange = () => {
    if (i.connectionState === "failed" || i.connectionState === "closed") {
      x(this, He).delete(e), x(this, Me).delete(e), x(this, un).delete(e);
      for (const r of x(this, Mt))
        try {
          r(e, void 0);
        } catch {
        }
    }
  }, i;
}, /**** #setupDataChannel — attaches message and error handlers to a data channel ****/
Ls = function(e, t) {
  e.binaryType = "arraybuffer", e.onmessage = (i) => {
    const r = new Uint8Array(i.data);
    T(this, ne, Tl).call(this, r, t);
  };
}, /**** #handleFrame — dispatches a received binary data-channel frame to the appropriate handler ****/
Tl = function(e, t) {
  if (e.byteLength < 1)
    return;
  const i = e[0], r = e.slice(1);
  switch (i) {
    case 1: {
      for (const s of x(this, on))
        try {
          s(r);
        } catch {
        }
      break;
    }
    case 2: {
      if (r.byteLength < 32)
        return;
      const s = T(this, ne, Al).call(this, r.slice(0, 32)), o = r.slice(32);
      for (const c of x(this, an))
        try {
          c(s, o);
        } catch {
        }
      break;
    }
    case 4: {
      try {
        const s = JSON.parse(new TextDecoder().decode(r));
        if (typeof s.PeerId != "string")
          break;
        s.lastSeen = Date.now(), x(this, un).set(s.PeerId, s);
        for (const o of x(this, Mt))
          try {
            o(s.PeerId, s);
          } catch {
          }
      } catch {
      }
      break;
    }
  }
}, /**** #hexToBytes ****/
Bs = function(e) {
  const t = new Uint8Array(e.length / 2);
  for (let i = 0; i < e.length; i += 2)
    t[i / 2] = parseInt(e.slice(i, i + 2), 16);
  return t;
}, /**** #bytesToHex ****/
Al = function(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
};
function Re(n) {
  return new Promise((e, t) => {
    n.onsuccess = () => {
      e(n.result);
    }, n.onerror = () => {
      t(n.error);
    };
  });
}
function st(n, e, t) {
  return n.transaction(e, t);
}
var et, De, qr, qe, Xe;
class Df {
  /**** constructor ****/
  constructor(e) {
    D(this, qe);
    D(this, et);
    D(this, De);
    D(this, qr);
    z(this, De, e), z(this, qr, `sns:${e}`);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const e = await T(this, qe, Xe).call(this), t = st(e, ["snapshots"], "readonly"), i = await Re(
      t.objectStore("snapshots").get(x(this, De))
    );
    return i != null ? i.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(e) {
    const t = await T(this, qe, Xe).call(this), i = st(t, ["snapshots"], "readwrite");
    await Re(
      i.objectStore("snapshots").put({
        storeId: x(this, De),
        data: e,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(e) {
    const t = await T(this, qe, Xe).call(this), r = st(t, ["patches"], "readonly").objectStore("patches"), s = IDBKeyRange.bound(
      [x(this, De), e + 1],
      [x(this, De), Number.MAX_SAFE_INTEGER]
    );
    return (await Re(
      r.getAll(s)
    )).sort((c, u) => c.clock - u.clock).map((c) => c.data);
  }
  /**** appendPatch ****/
  async appendPatch(e, t) {
    const i = await T(this, qe, Xe).call(this), r = st(i, ["patches"], "readwrite");
    try {
      await Re(
        r.objectStore("patches").add({
          storeId: x(this, De),
          clock: t,
          data: e
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(e) {
    const t = await T(this, qe, Xe).call(this), r = st(t, ["patches"], "readwrite").objectStore("patches"), s = IDBKeyRange.bound(
      [x(this, De), 0],
      [x(this, De), e - 1]
    );
    await new Promise((o, c) => {
      const u = r.openCursor(s);
      u.onsuccess = () => {
        const l = u.result;
        if (l === null) {
          o();
          return;
        }
        l.delete(), l.continue();
      }, u.onerror = () => {
        c(u.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(e) {
    const t = await T(this, qe, Xe).call(this), i = st(t, ["values"], "readonly"), r = await Re(
      i.objectStore("values").get(e)
    );
    return r != null ? r.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(e, t) {
    const i = await T(this, qe, Xe).call(this), s = st(i, ["values"], "readwrite").objectStore("values"), o = await Re(
      s.get(e)
    );
    o != null ? await Re(
      s.put({ hash: e, data: o.data, ref_count: o.ref_count + 1 })
    ) : await Re(
      s.put({ hash: e, data: t, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(e) {
    const t = await T(this, qe, Xe).call(this), r = st(t, ["values"], "readwrite").objectStore("values"), s = await Re(
      r.get(e)
    );
    if (s == null)
      return;
    const o = s.ref_count - 1;
    o <= 0 ? await Re(r.delete(e)) : await Re(
      r.put({ hash: e, data: s.data, ref_count: o })
    );
  }
  /**** close ****/
  async close() {
    var e;
    (e = x(this, et)) == null || e.close(), z(this, et, void 0);
  }
}
et = new WeakMap(), De = new WeakMap(), qr = new WeakMap(), qe = new WeakSet(), Xe = async function() {
  return x(this, et) != null ? x(this, et) : new Promise((e, t) => {
    const i = indexedDB.open(x(this, qr), 1);
    i.onupgradeneeded = (r) => {
      const s = r.target.result;
      s.objectStoreNames.contains("snapshots") || s.createObjectStore("snapshots", { keyPath: "storeId" }), s.objectStoreNames.contains("patches") || s.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), s.objectStoreNames.contains("values") || s.createObjectStore("values", { keyPath: "hash" });
    }, i.onsuccess = (r) => {
      z(this, et, r.target.result), e(x(this, et));
    }, i.onerror = (r) => {
      t(r.target.error);
    };
  });
};
const yf = 512 * 1024;
var Ne, _e, de, pt, ln, hn, Ur, Fr, Dt, dn, yt, fn, qt, Ut, Ft, tt, gt, Ue, zr, pn, nt, ae, jl, El, Pl, Rl, Ll, Vs, Bl, Vl, Ml, Dl, Ms;
class qf {
  //----------------------------------------------------------------------------//
  //                                Constructor                                 //
  //----------------------------------------------------------------------------//
  constructor(e, t = {}) {
    D(this, ae);
    D(this, Ne);
    D(this, _e);
    D(this, de);
    D(this, pt);
    D(this, ln);
    Sn(this, "PeerId", crypto.randomUUID());
    D(this, hn);
    D(this, Ur);
    D(this, Fr, []);
    // outgoing patch queue (patches created while disconnected)
    D(this, Dt, 0);
    // accumulated patch bytes since last checkpoint
    D(this, dn, 0);
    // sequence number of the last saved snapshot
    D(this, yt, 0);
    // current patch sequence # (append-monotonic counter, managed by SyncEngine)
    // CRDT cursor captured after the last processed local change;
    // passed to Store.exportPatch() to retrieve exactly that one change.
    // Initialised to an empty cursor; updated in #loadAndRestore and after
    // each local mutation.  Backend-agnostic: the NoteStore owns the format.
    D(this, fn, new Uint8Array(0));
    // heartbeat timer
    D(this, qt);
    D(this, Ut);
    // presence peer tracking
    D(this, Ft, /* @__PURE__ */ new Map());
    D(this, tt, /* @__PURE__ */ new Map());
    D(this, gt, /* @__PURE__ */ new Set());
    // BroadcastChannel (optional, browser/tauri only)
    D(this, Ue);
    // connection state mirror
    D(this, zr, "disconnected");
    D(this, pn, /* @__PURE__ */ new Set());
    // unsubscribe functions for registered handlers
    D(this, nt, []);
    z(this, Ne, e), z(this, _e, t.PersistenceProvider ?? void 0), z(this, de, t.NetworkProvider ?? void 0), z(this, pt, t.PresenceProvider ?? t.NetworkProvider ?? void 0), z(this, ln, t.PresenceTimeoutMs ?? 12e4), (t.BroadcastChannel ?? !0) && typeof BroadcastChannel < "u" && x(this, de) != null && z(this, Ue, new BroadcastChannel(`sns:${x(this, de).StoreID}`));
  }
  //----------------------------------------------------------------------------//
  //                                 Lifecycle                                  //
  //----------------------------------------------------------------------------//
  /**** start ****/
  async start() {
    await T(this, ae, jl).call(this), T(this, ae, El).call(this), T(this, ae, Pl).call(this), T(this, ae, Rl).call(this), T(this, ae, Ll).call(this), x(this, de) != null && x(this, de).onConnectionChange((e) => {
      z(this, zr, e);
      for (const t of x(this, pn))
        try {
          t(e);
        } catch {
        }
      e === "connected" && T(this, ae, Bl).call(this);
    });
  }
  /**** stop ****/
  async stop() {
    var e, t, i;
    x(this, qt) != null && (clearInterval(x(this, qt)), z(this, qt, void 0));
    for (const r of x(this, tt).values())
      clearTimeout(r);
    x(this, tt).clear();
    for (const r of x(this, nt))
      try {
        r();
      } catch {
      }
    z(this, nt, []), (e = x(this, Ue)) == null || e.close(), z(this, Ue, void 0), (t = x(this, de)) == null || t.disconnect(), x(this, _e) != null && x(this, Dt) > 0 && await T(this, ae, Vs).call(this), await ((i = x(this, _e)) == null ? void 0 : i.close());
  }
  //----------------------------------------------------------------------------//
  //                             Network Connection                             //
  //----------------------------------------------------------------------------//
  /**** connectTo ****/
  async connectTo(e, t) {
    if (x(this, de) == null)
      throw new ke("no-network-provider", "no NetworkProvider configured");
    z(this, hn, e), z(this, Ur, t), await x(this, de).connect(e, t);
  }
  /**** disconnect ****/
  disconnect() {
    if (x(this, de) == null)
      throw new ke("no-network-provider", "no NetworkProvider configured");
    x(this, de).disconnect();
  }
  /**** reconnect ****/
  async reconnect() {
    if (x(this, de) == null)
      throw new ke("no-network-provider", "no NetworkProvider configured");
    if (x(this, hn) == null)
      throw new ke(
        "not-yet-connected",
        "connectTo() has not been called yet; cannot reconnect"
      );
    await x(this, de).connect(x(this, hn), x(this, Ur));
  }
  /**** ConnectionState ****/
  get ConnectionState() {
    return x(this, zr);
  }
  /**** onConnectionChange ****/
  onConnectionChange(e) {
    return x(this, pn).add(e), () => {
      x(this, pn).delete(e);
    };
  }
  //----------------------------------------------------------------------------//
  //                                  Presence                                  //
  //----------------------------------------------------------------------------//
  /**** setPresenceTo ****/
  setPresenceTo(e) {
    var i, r;
    z(this, Ut, e);
    const t = { ...e, PeerId: this.PeerId };
    (i = x(this, pt)) == null || i.sendLocalState(e), (r = x(this, Ue)) == null || r.postMessage({ type: "presence", payload: e });
    for (const s of x(this, gt))
      try {
        s(this.PeerId, t, "local");
      } catch {
      }
  }
  /**** PeerSet (remote peers only) ****/
  get PeerSet() {
    return x(this, Ft);
  }
  /**** onPresenceChange ****/
  onPresenceChange(e) {
    return x(this, gt).add(e), () => {
      x(this, gt).delete(e);
    };
  }
}
Ne = new WeakMap(), _e = new WeakMap(), de = new WeakMap(), pt = new WeakMap(), ln = new WeakMap(), hn = new WeakMap(), Ur = new WeakMap(), Fr = new WeakMap(), Dt = new WeakMap(), dn = new WeakMap(), yt = new WeakMap(), fn = new WeakMap(), qt = new WeakMap(), Ut = new WeakMap(), Ft = new WeakMap(), tt = new WeakMap(), gt = new WeakMap(), Ue = new WeakMap(), zr = new WeakMap(), pn = new WeakMap(), nt = new WeakMap(), ae = new WeakSet(), jl = async function() {
  if (x(this, _e) == null)
    return;
  const e = await x(this, _e).loadSnapshot();
  if (e != null)
    try {
      const i = x(this, Ne).constructor.fromBinary(e);
    } catch {
    }
  const t = await x(this, _e).loadPatchesSince(x(this, dn));
  for (const i of t)
    try {
      x(this, Ne).applyRemotePatch(i);
    } catch {
    }
  t.length > 0 && z(this, yt, x(this, dn) + t.length), z(this, fn, x(this, Ne).currentCursor);
}, //----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//
/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/
El = function() {
  const e = x(this, Ne).onChangeInvoke((t, i) => {
    var o, c;
    if (t !== "internal")
      return;
    const r = x(this, fn);
    Kr(this, yt)._++;
    const s = x(this, Ne).exportPatch(r);
    z(this, fn, x(this, Ne).currentCursor), s.byteLength !== 0 && (x(this, _e) != null && (x(this, _e).appendPatch(s, x(this, yt)).catch(() => {
    }), z(this, Dt, x(this, Dt) + s.byteLength), x(this, Dt) >= yf && T(this, ae, Vs).call(this).catch(() => {
    })), ((o = x(this, de)) == null ? void 0 : o.ConnectionState) === "connected" ? (x(this, de).sendPatch(s), (c = x(this, Ue)) == null || c.postMessage({ type: "patch", payload: s })) : x(this, Fr).push(s), T(this, ae, Vl).call(this, i).catch(() => {
    }));
  });
  x(this, nt).push(e);
}, /**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/
Pl = function() {
  if (x(this, de) != null) {
    const t = x(this, de).onPatch((r) => {
      try {
        x(this, Ne).applyRemotePatch(r);
      } catch {
      }
    });
    x(this, nt).push(t);
    const i = x(this, de).onValue(async (r, s) => {
      var o;
      await ((o = x(this, _e)) == null ? void 0 : o.saveValue(r, s));
    });
    x(this, nt).push(i);
  }
  const e = x(this, pt);
  if (e != null) {
    const t = e.onRemoteState((i, r) => {
      T(this, ae, Ml).call(this, i, r);
    });
    x(this, nt).push(t);
  }
}, /**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/
Rl = function() {
  const e = x(this, ln) / 4;
  z(this, qt, setInterval(() => {
    var t, i;
    x(this, Ut) != null && ((t = x(this, pt)) == null || t.sendLocalState(x(this, Ut)), (i = x(this, Ue)) == null || i.postMessage({ type: "presence", payload: x(this, Ut) }));
  }, e));
}, /**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/
Ll = function() {
  x(this, Ue) != null && (x(this, Ue).onmessage = (e) => {
    var i;
    const t = e.data;
    if (t.type === "patch")
      try {
        x(this, Ne).applyRemotePatch(t.payload);
      } catch {
      }
    else t.type === "presence" && ((i = x(this, pt)) == null || i.sendLocalState(t.payload));
  });
}, Vs = async function() {
  x(this, _e) != null && (await x(this, _e).saveSnapshot(x(this, Ne).asBinary()), await x(this, _e).prunePatches(x(this, yt)), z(this, dn, x(this, yt)), z(this, Dt, 0));
}, //----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//
/**** #flushOfflineQueue — sends all queued offline patches to the network ****/
Bl = function() {
  var t;
  const e = x(this, Fr).splice(0);
  for (const i of e)
    try {
      (t = x(this, de)) == null || t.sendPatch(i);
    } catch {
    }
}, Vl = async function(e) {
  for (const [t, i] of Object.entries(e))
    i.has("Value") && x(this, de) != null;
}, //----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//
/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/
Ml = function(e, t) {
  if (t == null) {
    T(this, ae, Ms).call(this, e);
    return;
  }
  const i = { ...t, _lastSeen: Date.now() };
  x(this, Ft).set(e, i), T(this, ae, Dl).call(this, e);
  for (const r of x(this, gt))
    try {
      r(e, t, "remote");
    } catch {
    }
}, /**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/
Dl = function(e) {
  const t = x(this, tt).get(e);
  t != null && clearTimeout(t);
  const i = setTimeout(
    () => {
      T(this, ae, Ms).call(this, e);
    },
    x(this, ln)
  );
  x(this, tt).set(e, i);
}, /**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/
Ms = function(e) {
  if (!x(this, Ft).has(e))
    return;
  x(this, Ft).delete(e);
  const t = x(this, tt).get(e);
  t != null && (clearTimeout(t), x(this, tt).delete(e));
  for (const i of x(this, gt))
    try {
      i(e, void 0, "remote");
    } catch {
    }
};
export {
  Df as SNS_BrowserPersistenceProvider,
  zc as SNS_Entry,
  ke as SNS_Error,
  no as SNS_Link,
  to as SNS_Note,
  Lc as SNS_NoteStore,
  qf as SNS_SyncEngine,
  Mf as SNS_WebRTCProvider,
  Vf as SNS_WebSocketProvider
};
