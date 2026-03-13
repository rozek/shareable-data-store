var or = (n) => {
  throw TypeError(n);
};
var Lt = (n, e, t) => e.has(n) || or("Cannot " + t);
var m = (n, e, t) => (Lt(n, e, "read from private field"), t ? t.call(n) : e.get(n)), $ = (n, e, t) => e.has(n) ? or("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), he = (n, e, t, r) => (Lt(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), u = (n, e, t) => (Lt(n, e, "access private method"), t);
var Rt = (n, e, t, r) => ({
  set _(s) {
    he(n, e, s, t);
  },
  get _() {
    return m(n, e, r);
  }
});
import { SDS_DataStore as fn, DefaultWrapperCacheSize as hn, DefaultLiteralSizeLimit as mn, RootId as Fe, TrashId as N, LostAndFoundId as me, SDS_Error as Y, expectValidMIMEType as lr, DefaultMIMEType as We, expectValidLabel as vn, DefaultBinarySizeLimit as pn, expectValidInfoKey as gn, checkInfoValueSize as yn, _base64ToUint8Array as Mr, SDS_Item as cr, SDS_Link as ur, maxOrderKeyLength as _n } from "@rozek/sds-core";
import { SDS_Entry as bs, SDS_Error as ks, SDS_Item as xs, SDS_Link as Is } from "@rozek/sds-core";
import { Model as dr } from "json-joy/lib/json-crdt/index.js";
import { s as h } from "json-joy/lib/json-crdt-patch/schema.js";
import { Patch as wn } from "json-joy/lib/json-crdt-patch/index.js";
var F = Uint8Array, le = Uint16Array, sr = Int32Array, Ct = new F([
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
]), At = new F([
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
]), $t = new F([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Nr = function(n, e) {
  for (var t = new le(31), r = 0; r < 31; ++r)
    t[r] = e += 1 << n[r - 1];
  for (var s = new sr(t[30]), r = 1; r < 30; ++r)
    for (var a = t[r]; a < t[r + 1]; ++a)
      s[a] = a - t[r] << 5 | r;
  return { b: t, r: s };
}, Pr = Nr(Ct, 2), Dr = Pr.b, zt = Pr.r;
Dr[28] = 258, zt[258] = 28;
var $r = Nr(At, 0), bn = $r.b, fr = $r.r, Kt = new le(32768);
for (var L = 0; L < 32768; ++L) {
  var Se = (L & 43690) >> 1 | (L & 21845) << 1;
  Se = (Se & 52428) >> 2 | (Se & 13107) << 2, Se = (Se & 61680) >> 4 | (Se & 3855) << 4, Kt[L] = ((Se & 65280) >> 8 | (Se & 255) << 8) >> 1;
}
var we = (function(n, e, t) {
  for (var r = n.length, s = 0, a = new le(e); s < r; ++s)
    n[s] && ++a[n[s] - 1];
  var i = new le(e);
  for (s = 1; s < e; ++s)
    i[s] = i[s - 1] + a[s - 1] << 1;
  var o;
  if (t) {
    o = new le(1 << e);
    var c = 15 - e;
    for (s = 0; s < r; ++s)
      if (n[s])
        for (var d = s << 4 | n[s], f = e - n[s], p = i[n[s] - 1]++ << f, k = p | (1 << f) - 1; p <= k; ++p)
          o[Kt[p] >> c] = d;
  } else
    for (o = new le(r), s = 0; s < r; ++s)
      n[s] && (o[s] = Kt[i[n[s] - 1]++] >> 15 - n[s]);
  return o;
}), Ze = new F(288);
for (var L = 0; L < 144; ++L)
  Ze[L] = 8;
for (var L = 144; L < 256; ++L)
  Ze[L] = 9;
for (var L = 256; L < 280; ++L)
  Ze[L] = 7;
for (var L = 280; L < 288; ++L)
  Ze[L] = 8;
var gt = new F(32);
for (var L = 0; L < 32; ++L)
  gt[L] = 5;
var kn = /* @__PURE__ */ we(Ze, 9, 0), xn = /* @__PURE__ */ we(Ze, 9, 1), In = /* @__PURE__ */ we(gt, 5, 0), En = /* @__PURE__ */ we(gt, 5, 1), Vt = function(n) {
  for (var e = n[0], t = 1; t < n.length; ++t)
    n[t] > e && (e = n[t]);
  return e;
}, ve = function(n, e, t) {
  var r = e / 8 | 0;
  return (n[r] | n[r + 1] << 8) >> (e & 7) & t;
}, Zt = function(n, e) {
  var t = e / 8 | 0;
  return (n[t] | n[t + 1] << 8 | n[t + 2] << 16) >> (e & 7);
}, ar = function(n) {
  return (n + 7) / 8 | 0;
}, zr = function(n, e, t) {
  return (t == null || t > n.length) && (t = n.length), new F(n.subarray(e, t));
}, Tn = [
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
  var r = new Error(e || Tn[n]);
  if (r.code = n, Error.captureStackTrace && Error.captureStackTrace(r, pe), !t)
    throw r;
  return r;
}, On = function(n, e, t, r) {
  var s = n.length, a = 0;
  if (!s || e.f && !e.l)
    return t || new F(0);
  var i = !t, o = i || e.i != 2, c = e.i;
  i && (t = new F(s * 3));
  var d = function(ct) {
    var ut = t.length;
    if (ct > ut) {
      var Ue = new F(Math.max(ut * 2, ct));
      Ue.set(t), t = Ue;
    }
  }, f = e.f || 0, p = e.p || 0, k = e.b || 0, j = e.l, W = e.d, R = e.m, X = e.n, fe = s * 8;
  do {
    if (!j) {
      f = ve(n, p, 1);
      var re = ve(n, p + 1, 3);
      if (p += 3, re)
        if (re == 1)
          j = xn, W = En, R = 9, X = 5;
        else if (re == 2) {
          var Q = ve(n, p, 31) + 257, z = ve(n, p + 10, 15) + 4, A = Q + ve(n, p + 5, 31) + 1;
          p += 14;
          for (var x = new F(A), K = new F(19), M = 0; M < z; ++M)
            K[$t[M]] = ve(n, p + M * 3, 7);
          p += z * 3;
          for (var H = Vt(K), Oe = (1 << H) - 1, ne = we(K, H, 1), M = 0; M < A; ) {
            var J = ne[ve(n, p, Oe)];
            p += J & 15;
            var D = J >> 4;
            if (D < 16)
              x[M++] = D;
            else {
              var B = 0, V = 0;
              for (D == 16 ? (V = 3 + ve(n, p, 3), p += 2, B = x[M - 1]) : D == 17 ? (V = 3 + ve(n, p, 7), p += 3) : D == 18 && (V = 11 + ve(n, p, 127), p += 7); V--; )
                x[M++] = B;
            }
          }
          var ee = x.subarray(0, Q), U = x.subarray(Q);
          R = Vt(ee), X = Vt(U), j = we(ee, R, 1), W = we(U, X, 1);
        } else
          pe(1);
      else {
        var D = ar(p) + 4, G = n[D - 4] | n[D - 3] << 8, q = D + G;
        if (q > s) {
          c && pe(0);
          break;
        }
        o && d(k + G), t.set(n.subarray(D, q), k), e.b = k += G, e.p = p = q * 8, e.f = f;
        continue;
      }
      if (p > fe) {
        c && pe(0);
        break;
      }
    }
    o && d(k + 131072);
    for (var lt = (1 << R) - 1, ue = (1 << X) - 1, ke = p; ; ke = p) {
      var B = j[Zt(n, p) & lt], se = B >> 4;
      if (p += B & 15, p > fe) {
        c && pe(0);
        break;
      }
      if (B || pe(2), se < 256)
        t[k++] = se;
      else if (se == 256) {
        ke = p, j = null;
        break;
      } else {
        var ae = se - 254;
        if (se > 264) {
          var M = se - 257, Z = Ct[M];
          ae = ve(n, p, (1 << Z) - 1) + Dr[M], p += Z;
        }
        var ge = W[Zt(n, p) & ue], Ke = ge >> 4;
        ge || pe(3), p += ge & 15;
        var U = bn[Ke];
        if (Ke > 3) {
          var Z = At[Ke];
          U += Zt(n, p) & (1 << Z) - 1, p += Z;
        }
        if (p > fe) {
          c && pe(0);
          break;
        }
        o && d(k + 131072);
        var Be = k + ae;
        if (k < U) {
          var bt = a - U, kt = Math.min(U, Be);
          for (bt + k < 0 && pe(3); k < kt; ++k)
            t[k] = r[bt + k];
        }
        for (; k < Be; ++k)
          t[k] = t[k - U];
      }
    }
    e.l = j, e.p = ke, e.b = k, e.f = f, j && (f = 1, e.m = R, e.d = W, e.n = X);
  } while (!f);
  return k != t.length && i ? zr(t, 0, k) : t.subarray(0, k);
}, xe = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8;
}, dt = function(n, e, t) {
  t <<= e & 7;
  var r = e / 8 | 0;
  n[r] |= t, n[r + 1] |= t >> 8, n[r + 2] |= t >> 16;
}, Mt = function(n, e) {
  for (var t = [], r = 0; r < n.length; ++r)
    n[r] && t.push({ s: r, f: n[r] });
  var s = t.length, a = t.slice();
  if (!s)
    return { t: Br, l: 0 };
  if (s == 1) {
    var i = new F(t[0].s + 1);
    return i[t[0].s] = 1, { t: i, l: 1 };
  }
  t.sort(function(q, Q) {
    return q.f - Q.f;
  }), t.push({ s: -1, f: 25001 });
  var o = t[0], c = t[1], d = 0, f = 1, p = 2;
  for (t[0] = { s: -1, f: o.f + c.f, l: o, r: c }; f != s - 1; )
    o = t[t[d].f < t[p].f ? d++ : p++], c = t[d != f && t[d].f < t[p].f ? d++ : p++], t[f++] = { s: -1, f: o.f + c.f, l: o, r: c };
  for (var k = a[0].s, r = 1; r < s; ++r)
    a[r].s > k && (k = a[r].s);
  var j = new le(k + 1), W = Bt(t[f - 1], j, 0);
  if (W > e) {
    var r = 0, R = 0, X = W - e, fe = 1 << X;
    for (a.sort(function(Q, z) {
      return j[z.s] - j[Q.s] || Q.f - z.f;
    }); r < s; ++r) {
      var re = a[r].s;
      if (j[re] > e)
        R += fe - (1 << W - j[re]), j[re] = e;
      else
        break;
    }
    for (R >>= X; R > 0; ) {
      var D = a[r].s;
      j[D] < e ? R -= 1 << e - j[D]++ - 1 : ++r;
    }
    for (; r >= 0 && R; --r) {
      var G = a[r].s;
      j[G] == e && (--j[G], ++R);
    }
    W = e;
  }
  return { t: new F(j), l: W };
}, Bt = function(n, e, t) {
  return n.s == -1 ? Math.max(Bt(n.l, e, t + 1), Bt(n.r, e, t + 1)) : e[n.s] = t;
}, hr = function(n) {
  for (var e = n.length; e && !n[--e]; )
    ;
  for (var t = new le(++e), r = 0, s = n[0], a = 1, i = function(c) {
    t[r++] = c;
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
}, ft = function(n, e) {
  for (var t = 0, r = 0; r < e.length; ++r)
    t += n[r] * e[r];
  return t;
}, Kr = function(n, e, t) {
  var r = t.length, s = ar(e + 2);
  n[s] = r & 255, n[s + 1] = r >> 8, n[s + 2] = n[s] ^ 255, n[s + 3] = n[s + 1] ^ 255;
  for (var a = 0; a < r; ++a)
    n[s + a + 4] = t[a];
  return (s + 4 + r) * 8;
}, mr = function(n, e, t, r, s, a, i, o, c, d, f) {
  xe(e, f++, t), ++s[256];
  for (var p = Mt(s, 15), k = p.t, j = p.l, W = Mt(a, 15), R = W.t, X = W.l, fe = hr(k), re = fe.c, D = fe.n, G = hr(R), q = G.c, Q = G.n, z = new le(19), A = 0; A < re.length; ++A)
    ++z[re[A] & 31];
  for (var A = 0; A < q.length; ++A)
    ++z[q[A] & 31];
  for (var x = Mt(z, 7), K = x.t, M = x.l, H = 19; H > 4 && !K[$t[H - 1]]; --H)
    ;
  var Oe = d + 5 << 3, ne = ft(s, Ze) + ft(a, gt) + i, J = ft(s, k) + ft(a, R) + i + 14 + 3 * H + ft(z, K) + 2 * z[16] + 3 * z[17] + 7 * z[18];
  if (c >= 0 && Oe <= ne && Oe <= J)
    return Kr(e, f, n.subarray(c, c + d));
  var B, V, ee, U;
  if (xe(e, f, 1 + (J < ne)), f += 2, J < ne) {
    B = we(k, j, 0), V = k, ee = we(R, X, 0), U = R;
    var lt = we(K, M, 0);
    xe(e, f, D - 257), xe(e, f + 5, Q - 1), xe(e, f + 10, H - 4), f += 14;
    for (var A = 0; A < H; ++A)
      xe(e, f + 3 * A, K[$t[A]]);
    f += 3 * H;
    for (var ue = [re, q], ke = 0; ke < 2; ++ke)
      for (var se = ue[ke], A = 0; A < se.length; ++A) {
        var ae = se[A] & 31;
        xe(e, f, lt[ae]), f += K[ae], ae > 15 && (xe(e, f, se[A] >> 5 & 127), f += se[A] >> 12);
      }
  } else
    B = kn, V = Ze, ee = In, U = gt;
  for (var A = 0; A < o; ++A) {
    var Z = r[A];
    if (Z > 255) {
      var ae = Z >> 18 & 31;
      dt(e, f, B[ae + 257]), f += V[ae + 257], ae > 7 && (xe(e, f, Z >> 23 & 31), f += Ct[ae]);
      var ge = Z & 31;
      dt(e, f, ee[ge]), f += U[ge], ge > 3 && (dt(e, f, Z >> 5 & 8191), f += At[ge]);
    } else
      dt(e, f, B[Z]), f += V[Z];
  }
  return dt(e, f, B[256]), f + V[256];
}, Sn = /* @__PURE__ */ new sr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Br = /* @__PURE__ */ new F(0), Cn = function(n, e, t, r, s, a) {
  var i = a.z || n.length, o = new F(r + i + 5 * (1 + Math.ceil(i / 7e3)) + s), c = o.subarray(r, o.length - s), d = a.l, f = (a.r || 0) & 7;
  if (e) {
    f && (c[0] = a.r >> 3);
    for (var p = Sn[e - 1], k = p >> 13, j = p & 8191, W = (1 << t) - 1, R = a.p || new le(32768), X = a.h || new le(W + 1), fe = Math.ceil(t / 3), re = 2 * fe, D = function(jt) {
      return (n[jt] ^ n[jt + 1] << fe ^ n[jt + 2] << re) & W;
    }, G = new sr(25e3), q = new le(288), Q = new le(32), z = 0, A = 0, x = a.i || 0, K = 0, M = a.w || 0, H = 0; x + 2 < i; ++x) {
      var Oe = D(x), ne = x & 32767, J = X[Oe];
      if (R[ne] = J, X[Oe] = ne, M <= x) {
        var B = i - x;
        if ((z > 7e3 || K > 24576) && (B > 423 || !d)) {
          f = mr(n, c, 0, G, q, Q, A, K, H, x - H, f), K = z = A = 0, H = x;
          for (var V = 0; V < 286; ++V)
            q[V] = 0;
          for (var V = 0; V < 30; ++V)
            Q[V] = 0;
        }
        var ee = 2, U = 0, lt = j, ue = ne - J & 32767;
        if (B > 2 && Oe == D(x - ue))
          for (var ke = Math.min(k, B) - 1, se = Math.min(32767, x), ae = Math.min(258, B); ue <= se && --lt && ne != J; ) {
            if (n[x + ee] == n[x + ee - ue]) {
              for (var Z = 0; Z < ae && n[x + Z] == n[x + Z - ue]; ++Z)
                ;
              if (Z > ee) {
                if (ee = Z, U = ue, Z > ke)
                  break;
                for (var ge = Math.min(ue, Z - 2), Ke = 0, V = 0; V < ge; ++V) {
                  var Be = x - ue + V & 32767, bt = R[Be], kt = Be - bt & 32767;
                  kt > Ke && (Ke = kt, J = Be);
                }
              }
            }
            ne = J, J = R[ne], ue += ne - J & 32767;
          }
        if (U) {
          G[K++] = 268435456 | zt[ee] << 18 | fr[U];
          var ct = zt[ee] & 31, ut = fr[U] & 31;
          A += Ct[ct] + At[ut], ++q[257 + ct], ++Q[ut], M = x + ee, ++z;
        } else
          G[K++] = n[x], ++q[n[x]];
      }
    }
    for (x = Math.max(x, M); x < i; ++x)
      G[K++] = n[x], ++q[n[x]];
    f = mr(n, c, d, G, q, Q, A, K, H, x - H, f), d || (a.r = f & 7 | c[f / 8 | 0] << 3, f -= 7, a.h = X, a.p = R, a.i = x, a.w = M);
  } else {
    for (var x = a.w || 0; x < i + d; x += 65535) {
      var Ue = x + 65535;
      Ue >= i && (c[f / 8 | 0] = d, Ue = i), f = Kr(c, f + 1, n.subarray(x, Ue));
    }
    a.i = i;
  }
  return zr(o, 0, r + ar(f) + s);
}, An = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), e = 0; e < 256; ++e) {
    for (var t = e, r = 9; --r; )
      t = (t & 1 && -306674912) ^ t >>> 1;
    n[e] = t;
  }
  return n;
})(), jn = function() {
  var n = -1;
  return {
    p: function(e) {
      for (var t = n, r = 0; r < e.length; ++r)
        t = An[t & 255 ^ e[r]] ^ t >>> 8;
      n = t;
    },
    d: function() {
      return ~n;
    }
  };
}, Ln = function(n, e, t, r, s) {
  if (!s && (s = { l: 1 }, e.dictionary)) {
    var a = e.dictionary.subarray(-32768), i = new F(a.length + n.length);
    i.set(a), i.set(n, a.length), n = i, s.w = a.length;
  }
  return Cn(n, e.level == null ? 6 : e.level, e.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + e.mem, t, r, s);
}, Ut = function(n, e, t) {
  for (; t; ++e)
    n[e] = t, t >>>= 8;
}, Rn = function(n, e) {
  var t = e.filename;
  if (n[0] = 31, n[1] = 139, n[2] = 8, n[8] = e.level < 2 ? 4 : e.level == 9 ? 2 : 0, n[9] = 3, e.mtime != 0 && Ut(n, 4, Math.floor(new Date(e.mtime || Date.now()) / 1e3)), t) {
    n[3] = 8;
    for (var r = 0; r <= t.length; ++r)
      n[r + 10] = t.charCodeAt(r);
  }
}, Vn = function(n) {
  (n[0] != 31 || n[1] != 139 || n[2] != 8) && pe(6, "invalid gzip data");
  var e = n[3], t = 10;
  e & 4 && (t += (n[10] | n[11] << 8) + 2);
  for (var r = (e >> 3 & 1) + (e >> 4 & 1); r > 0; r -= !n[t++])
    ;
  return t + (e & 2);
}, Zn = function(n) {
  var e = n.length;
  return (n[e - 4] | n[e - 3] << 8 | n[e - 2] << 16 | n[e - 1] << 24) >>> 0;
}, Mn = function(n) {
  return 10 + (n.filename ? n.filename.length + 1 : 0);
};
function vr(n, e) {
  e || (e = {});
  var t = jn(), r = n.length;
  t.p(n);
  var s = Ln(n, e, Mn(e), 8), a = s.length;
  return Rn(s, e), Ut(s, a - 8, t.d()), Ut(s, a - 4, r), s;
}
function Nt(n, e) {
  var t = Vn(n);
  return t + 8 > n.length && pe(6, "invalid gzip data"), On(n.subarray(t, -8), { i: 2 }, new F(Zn(n)), e);
}
var Nn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Pn = 0;
try {
  Nn.decode(Br, { stream: !0 }), Pn = 1;
} catch {
}
const Ur = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
function pr(n, e) {
  if (n === "A" + e[0].repeat(26))
    throw new Error("invalid order key: " + n);
  const t = ht(n);
  if (n.slice(t.length).slice(-1) === e[0])
    throw new Error("invalid order key: " + n);
}
function gr(n, e) {
  Fr(n);
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
function Dn(n, e) {
  Fr(n);
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
function Ie(n, e, t = Ur) {
  if (n != null && pr(n, t), e != null && pr(e, t), n != null && e != null && n >= e)
    throw new Error(n + " >= " + e);
  if (n == null) {
    if (e == null)
      return "a" + t[0];
    const c = ht(e), d = e.slice(c.length);
    if (c === "A" + t[0].repeat(26))
      return c + Qe("", d, t);
    if (c < e)
      return c;
    const f = Dn(c, t);
    if (f == null)
      throw new Error("cannot decrement any more");
    return f;
  }
  if (e == null) {
    const c = ht(n), d = n.slice(c.length), f = gr(c, t);
    return f ?? c + Qe(d, null, t);
  }
  const r = ht(n), s = n.slice(r.length), a = ht(e), i = e.slice(a.length);
  if (r === a)
    return r + Qe(s, i, t);
  const o = gr(r, t);
  if (o == null)
    throw new Error("cannot increment any more");
  return o < e ? o : r + Qe(s, null, t);
}
function Ft(n, e, t, r = Ur) {
  if (t === 0)
    return [];
  if (t === 1)
    return [Ie(n, e, r)];
  {
    let s = Ie(n, e, r);
    const a = [s];
    for (let i = 0; i < t - 1; i++)
      s = Ie(s, e, r), a.push(s);
    return a;
  }
}
var C;
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
})(C || (C = {}));
var yr;
(function(n) {
  n.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(yr || (yr = {}));
const y = C.arrayToEnum([
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
}, v = C.arrayToEnum([
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
class Te extends Error {
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
          let o = r, c = 0;
          for (; c < i.path.length; ) {
            const d = i.path[c];
            c === i.path.length - 1 ? (o[d] = o[d] || { _errors: [] }, o[d]._errors.push(t(i))) : o[d] = o[d] || { _errors: [] }, o = o[d], c++;
          }
        }
    };
    return s(this), r;
  }
  static assert(e) {
    if (!(e instanceof Te))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, C.jsonStringifyReplacer, 2);
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
Te.create = (n) => new Te(n);
const Wt = (n, e) => {
  let t;
  switch (n.code) {
    case v.invalid_type:
      n.received === y.undefined ? t = "Required" : t = `Expected ${n.expected}, received ${n.received}`;
      break;
    case v.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(n.expected, C.jsonStringifyReplacer)}`;
      break;
    case v.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${C.joinValues(n.keys, ", ")}`;
      break;
    case v.invalid_union:
      t = "Invalid input";
      break;
    case v.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${C.joinValues(n.options)}`;
      break;
    case v.invalid_enum_value:
      t = `Invalid enum value. Expected ${C.joinValues(n.options)}, received '${n.received}'`;
      break;
    case v.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case v.invalid_return_type:
      t = "Invalid function return type";
      break;
    case v.invalid_date:
      t = "Invalid date";
      break;
    case v.invalid_string:
      typeof n.validation == "object" ? "includes" in n.validation ? (t = `Invalid input: must include "${n.validation.includes}"`, typeof n.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${n.validation.position}`)) : "startsWith" in n.validation ? t = `Invalid input: must start with "${n.validation.startsWith}"` : "endsWith" in n.validation ? t = `Invalid input: must end with "${n.validation.endsWith}"` : C.assertNever(n.validation) : n.validation !== "regex" ? t = `Invalid ${n.validation}` : t = "Invalid";
      break;
    case v.too_small:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "more than"} ${n.minimum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at least" : "over"} ${n.minimum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "bigint" ? t = `Number must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${n.minimum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly equal to " : n.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(n.minimum))}` : t = "Invalid input";
      break;
    case v.too_big:
      n.type === "array" ? t = `Array must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "less than"} ${n.maximum} element(s)` : n.type === "string" ? t = `String must contain ${n.exact ? "exactly" : n.inclusive ? "at most" : "under"} ${n.maximum} character(s)` : n.type === "number" ? t = `Number must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "bigint" ? t = `BigInt must be ${n.exact ? "exactly" : n.inclusive ? "less than or equal to" : "less than"} ${n.maximum}` : n.type === "date" ? t = `Date must be ${n.exact ? "exactly" : n.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(n.maximum))}` : t = "Invalid input";
      break;
    case v.custom:
      t = "Invalid input";
      break;
    case v.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case v.not_multiple_of:
      t = `Number must be a multiple of ${n.multipleOf}`;
      break;
    case v.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, C.assertNever(n);
  }
  return { message: t };
};
let $n = Wt;
function zn() {
  return $n;
}
const Kn = (n) => {
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
  const c = r.filter((d) => !!d).slice().reverse();
  for (const d of c)
    o = d(i, { data: e, defaultError: o }).message;
  return {
    ...s,
    path: a,
    message: o
  };
};
function g(n, e) {
  const t = zn(), r = Kn({
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
      t === Wt ? void 0 : Wt
      // then global default map
    ].filter((s) => !!s)
  });
  n.common.issues.push(r);
}
class ce {
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
      const a = await s.key, i = await s.value;
      r.push({
        key: a,
        value: i
      });
    }
    return ce.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const s of t) {
      const { key: a, value: i } = s;
      if (a.status === "aborted" || i.status === "aborted")
        return w;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || s.alwaysSet) && (r[a.value] = i.value);
    }
    return { status: e.value, value: r };
  }
}
const w = Object.freeze({
  status: "aborted"
}), mt = (n) => ({ status: "dirty", value: n }), de = (n) => ({ status: "valid", value: n }), _r = (n) => n.status === "aborted", wr = (n) => n.status === "dirty", nt = (n) => n.status === "valid", xt = (n) => typeof Promise < "u" && n instanceof Promise;
var _;
(function(n) {
  n.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, n.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(_ || (_ = {}));
class Me {
  constructor(e, t, r, s) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const br = (n, e) => {
  if (nt(e))
    return { success: !0, data: e.value };
  if (!n.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new Te(n.common.issues);
      return this._error = t, this._error;
    }
  };
};
function T(n) {
  if (!n)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: s } = n;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: s } : { errorMap: (i, o) => {
    const { message: c } = n;
    return i.code === "invalid_enum_value" ? { message: c ?? o.defaultError } : typeof o.data > "u" ? { message: c ?? r ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: c ?? t ?? o.defaultError };
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
      status: new ce(),
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
    if (xt(t))
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
    return br(r, s);
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
        return nt(a) ? {
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
    return this._parseAsync({ data: e, path: [], parent: t }).then((a) => nt(a) ? {
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
    }, s = this._parse({ data: e, path: r.path, parent: r }), a = await (xt(s) ? s : Promise.resolve(s));
    return br(r, a);
  }
  refine(e, t) {
    const r = (s) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(s) : t;
    return this._refinement((s, a) => {
      const i = e(s), o = () => a.addIssue({
        code: v.custom,
        ...r(s)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((c) => c ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, s) => e(r) ? !0 : (s.addIssue(typeof t == "function" ? t(r, s) : t), !1));
  }
  _refinement(e) {
    return new it({
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
    return Ve.create(this, this._def);
  }
  nullable() {
    return ot.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return be.create(this);
  }
  promise() {
    return Ot.create(this, this._def);
  }
  or(e) {
    return Et.create([this, e], this._def);
  }
  and(e) {
    return Tt.create(this, e, this._def);
  }
  transform(e) {
    return new it({
      ...T(this._def),
      schema: this,
      typeName: b.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ht({
      ...T(this._def),
      innerType: this,
      defaultValue: t,
      typeName: b.ZodDefault
    });
  }
  brand() {
    return new ds({
      typeName: b.ZodBranded,
      type: this,
      ...T(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Yt({
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
    return ir.create(this, e);
  }
  readonly() {
    return Gt.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Bn = /^c[^\s-]{8,}$/i, Un = /^[0-9a-z]+$/, Fn = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Wn = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, qn = /^[a-z0-9_-]{21}$/i, Hn = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Yn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Gn = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Qn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Pt;
const Xn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Jn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, es = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, ts = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, rs = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ns = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, qr = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", ss = new RegExp(`^${qr}$`);
function Hr(n) {
  let e = "[0-5]\\d";
  n.precision ? e = `${e}\\.\\d{${n.precision}}` : n.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = n.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function as(n) {
  return new RegExp(`^${Hr(n)}$`);
}
function is(n) {
  let e = `${qr}T${Hr(n)}`;
  const t = [];
  return t.push(n.local ? "Z?" : "Z"), n.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function os(n, e) {
  return !!((e === "v4" || !e) && Xn.test(n) || (e === "v6" || !e) && es.test(n));
}
function ls(n, e) {
  if (!Hn.test(n))
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
function cs(n, e) {
  return !!((e === "v4" || !e) && Jn.test(n) || (e === "v6" || !e) && ts.test(n));
}
class Pe extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== y.string) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: v.invalid_type,
        expected: y.string,
        received: a.parsedType
      }), w;
    }
    const r = new ce();
    let s;
    for (const a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (s = this._getOrReturnCtx(e, s), g(s, {
          code: v.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (s = this._getOrReturnCtx(e, s), g(s, {
          code: v.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), r.dirty());
      else if (a.kind === "length") {
        const i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (s = this._getOrReturnCtx(e, s), i ? g(s, {
          code: v.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }) : o && g(s, {
          code: v.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }), r.dirty());
      } else if (a.kind === "email")
        Gn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "email",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "emoji")
        Pt || (Pt = new RegExp(Qn, "u")), Pt.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "emoji",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "uuid")
        Wn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "uuid",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "nanoid")
        qn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "nanoid",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid")
        Bn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "cuid",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "cuid2")
        Un.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "cuid2",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "ulid")
        Fn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
          validation: "ulid",
          code: v.invalid_string,
          message: a.message
        }), r.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          s = this._getOrReturnCtx(e, s), g(s, {
            validation: "url",
            code: v.invalid_string,
            message: a.message
          }), r.dirty();
        }
      else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "regex",
        code: v.invalid_string,
        message: a.message
      }), r.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: { includes: a.value, position: a.position },
        message: a.message
      }), r.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: { startsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: { endsWith: a.value },
        message: a.message
      }), r.dirty()) : a.kind === "datetime" ? is(a).test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: "datetime",
        message: a.message
      }), r.dirty()) : a.kind === "date" ? ss.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: "date",
        message: a.message
      }), r.dirty()) : a.kind === "time" ? as(a).test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.invalid_string,
        validation: "time",
        message: a.message
      }), r.dirty()) : a.kind === "duration" ? Yn.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "duration",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "ip" ? os(e.data, a.version) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "ip",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "jwt" ? ls(e.data, a.alg) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "jwt",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "cidr" ? cs(e.data, a.version) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "cidr",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64" ? rs.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "base64",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : a.kind === "base64url" ? ns.test(e.data) || (s = this._getOrReturnCtx(e, s), g(s, {
        validation: "base64url",
        code: v.invalid_string,
        message: a.message
      }), r.dirty()) : C.assertNever(a);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((s) => e.test(s), {
      validation: t,
      code: v.invalid_string,
      ..._.errToObj(r)
    });
  }
  _addCheck(e) {
    return new Pe({
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
Pe.create = (n) => new Pe({
  checks: [],
  typeName: b.ZodString,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...T(n)
});
function us(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = t > r ? t : r, a = Number.parseInt(n.toFixed(s).replace(".", "")), i = Number.parseInt(e.toFixed(s).replace(".", ""));
  return a % i / 10 ** s;
}
class st extends S {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== y.number) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: v.invalid_type,
        expected: y.number,
        received: a.parsedType
      }), w;
    }
    let r;
    const s = new ce();
    for (const a of this._def.checks)
      a.kind === "int" ? C.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.invalid_type,
        expected: "integer",
        received: "float",
        message: a.message
      }), s.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.too_small,
        minimum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.too_big,
        maximum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), s.dirty()) : a.kind === "multipleOf" ? us(e.data, a.value) !== 0 && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), s.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.not_finite,
        message: a.message
      }), s.dirty()) : C.assertNever(a);
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
    return new st({
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
    return new st({
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && C.isInteger(e.value));
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
st.create = (n) => new st({
  checks: [],
  typeName: b.ZodNumber,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...T(n)
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
    if (this._getType(e) !== y.bigint)
      return this._getInvalidInput(e);
    let r;
    const s = new ce();
    for (const a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.too_small,
        type: "bigint",
        minimum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.too_big,
        type: "bigint",
        maximum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), s.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), g(r, {
        code: v.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), s.dirty()) : C.assertNever(a);
    return { status: s.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return g(t, {
      code: v.invalid_type,
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
    return new yt({
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
yt.create = (n) => new yt({
  checks: [],
  typeName: b.ZodBigInt,
  coerce: (n == null ? void 0 : n.coerce) ?? !1,
  ...T(n)
});
class kr extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== y.boolean) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.boolean,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
kr.create = (n) => new kr({
  typeName: b.ZodBoolean,
  coerce: (n == null ? void 0 : n.coerce) || !1,
  ...T(n)
});
class It extends S {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== y.date) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: v.invalid_type,
        expected: y.date,
        received: a.parsedType
      }), w;
    }
    if (Number.isNaN(e.data.getTime())) {
      const a = this._getOrReturnCtx(e);
      return g(a, {
        code: v.invalid_date
      }), w;
    }
    const r = new ce();
    let s;
    for (const a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.too_small,
        message: a.message,
        inclusive: !0,
        exact: !1,
        minimum: a.value,
        type: "date"
      }), r.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (s = this._getOrReturnCtx(e, s), g(s, {
        code: v.too_big,
        message: a.message,
        inclusive: !0,
        exact: !1,
        maximum: a.value,
        type: "date"
      }), r.dirty()) : C.assertNever(a);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new It({
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
It.create = (n) => new It({
  checks: [],
  coerce: (n == null ? void 0 : n.coerce) || !1,
  typeName: b.ZodDate,
  ...T(n)
});
class xr extends S {
  _parse(e) {
    if (this._getType(e) !== y.symbol) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.symbol,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
xr.create = (n) => new xr({
  typeName: b.ZodSymbol,
  ...T(n)
});
class Ir extends S {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.undefined,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
Ir.create = (n) => new Ir({
  typeName: b.ZodUndefined,
  ...T(n)
});
class Er extends S {
  _parse(e) {
    if (this._getType(e) !== y.null) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.null,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
Er.create = (n) => new Er({
  typeName: b.ZodNull,
  ...T(n)
});
class Tr extends S {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return de(e.data);
  }
}
Tr.create = (n) => new Tr({
  typeName: b.ZodAny,
  ...T(n)
});
class Or extends S {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return de(e.data);
  }
}
Or.create = (n) => new Or({
  typeName: b.ZodUnknown,
  ...T(n)
});
class Ne extends S {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return g(t, {
      code: v.invalid_type,
      expected: y.never,
      received: t.parsedType
    }), w;
  }
}
Ne.create = (n) => new Ne({
  typeName: b.ZodNever,
  ...T(n)
});
class Sr extends S {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.void,
        received: r.parsedType
      }), w;
    }
    return de(e.data);
  }
}
Sr.create = (n) => new Sr({
  typeName: b.ZodVoid,
  ...T(n)
});
class be extends S {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), s = this._def;
    if (t.parsedType !== y.array)
      return g(t, {
        code: v.invalid_type,
        expected: y.array,
        received: t.parsedType
      }), w;
    if (s.exactLength !== null) {
      const i = t.data.length > s.exactLength.value, o = t.data.length < s.exactLength.value;
      (i || o) && (g(t, {
        code: i ? v.too_big : v.too_small,
        minimum: o ? s.exactLength.value : void 0,
        maximum: i ? s.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: s.exactLength.message
      }), r.dirty());
    }
    if (s.minLength !== null && t.data.length < s.minLength.value && (g(t, {
      code: v.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.minLength.message
    }), r.dirty()), s.maxLength !== null && t.data.length > s.maxLength.value && (g(t, {
      code: v.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => s.type._parseAsync(new Me(t, i, t.path, o)))).then((i) => ce.mergeArray(r, i));
    const a = [...t.data].map((i, o) => s.type._parseSync(new Me(t, i, t.path, o)));
    return ce.mergeArray(r, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new be({
      ...this._def,
      minLength: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new be({
      ...this._def,
      maxLength: { value: e, message: _.toString(t) }
    });
  }
  length(e, t) {
    return new be({
      ...this._def,
      exactLength: { value: e, message: _.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
be.create = (n, e) => new be({
  type: n,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: b.ZodArray,
  ...T(e)
});
function qe(n) {
  if (n instanceof P) {
    const e = {};
    for (const t in n.shape) {
      const r = n.shape[t];
      e[t] = Ve.create(qe(r));
    }
    return new P({
      ...n._def,
      shape: () => e
    });
  } else return n instanceof be ? new be({
    ...n._def,
    type: qe(n.element)
  }) : n instanceof Ve ? Ve.create(qe(n.unwrap())) : n instanceof ot ? ot.create(qe(n.unwrap())) : n instanceof ze ? ze.create(n.items.map((e) => qe(e))) : n;
}
class P extends S {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = C.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== y.object) {
      const d = this._getOrReturnCtx(e);
      return g(d, {
        code: v.invalid_type,
        expected: y.object,
        received: d.parsedType
      }), w;
    }
    const { status: r, ctx: s } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Ne && this._def.unknownKeys === "strip"))
      for (const d in s.data)
        i.includes(d) || o.push(d);
    const c = [];
    for (const d of i) {
      const f = a[d], p = s.data[d];
      c.push({
        key: { status: "valid", value: d },
        value: f._parse(new Me(s, p, s.path, d)),
        alwaysSet: d in s.data
      });
    }
    if (this._def.catchall instanceof Ne) {
      const d = this._def.unknownKeys;
      if (d === "passthrough")
        for (const f of o)
          c.push({
            key: { status: "valid", value: f },
            value: { status: "valid", value: s.data[f] }
          });
      else if (d === "strict")
        o.length > 0 && (g(s, {
          code: v.unrecognized_keys,
          keys: o
        }), r.dirty());
      else if (d !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const d = this._def.catchall;
      for (const f of o) {
        const p = s.data[f];
        c.push({
          key: { status: "valid", value: f },
          value: d._parse(
            new Me(s, p, s.path, f)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: f in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const d = [];
      for (const f of c) {
        const p = await f.key, k = await f.value;
        d.push({
          key: p,
          value: k,
          alwaysSet: f.alwaysSet
        });
      }
      return d;
    }).then((d) => ce.mergeObjectSync(r, d)) : ce.mergeObjectSync(r, c);
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
          var a, i;
          const s = ((i = (a = this._def).errorMap) == null ? void 0 : i.call(a, t, r).message) ?? r.defaultError;
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
    return new P({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of C.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of C.objectKeys(this.shape))
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
    return qe(this);
  }
  partial(e) {
    const t = {};
    for (const r of C.objectKeys(this.shape)) {
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
    for (const r of C.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let a = this.shape[r];
        for (; a instanceof Ve; )
          a = a._def.innerType;
        t[r] = a;
      }
    return new P({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Yr(C.objectKeys(this.shape));
  }
}
P.create = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strip",
  catchall: Ne.create(),
  typeName: b.ZodObject,
  ...T(e)
});
P.strictCreate = (n, e) => new P({
  shape: () => n,
  unknownKeys: "strict",
  catchall: Ne.create(),
  typeName: b.ZodObject,
  ...T(e)
});
P.lazycreate = (n, e) => new P({
  shape: n,
  unknownKeys: "strip",
  catchall: Ne.create(),
  typeName: b.ZodObject,
  ...T(e)
});
class Et extends S {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function s(a) {
      for (const o of a)
        if (o.result.status === "valid")
          return o.result;
      for (const o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = a.map((o) => new Te(o.ctx.common.issues));
      return g(t, {
        code: v.invalid_union,
        unionErrors: i
      }), w;
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
      for (const c of r) {
        const d = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, f = c._parseSync({
          data: t.data,
          path: t.path,
          parent: d
        });
        if (f.status === "valid")
          return f;
        f.status === "dirty" && !a && (a = { result: f, ctx: d }), d.common.issues.length && i.push(d.common.issues);
      }
      if (a)
        return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((c) => new Te(c));
      return g(t, {
        code: v.invalid_union,
        unionErrors: o
      }), w;
    }
  }
  get options() {
    return this._def.options;
  }
}
Et.create = (n, e) => new Et({
  options: n,
  typeName: b.ZodUnion,
  ...T(e)
});
function qt(n, e) {
  const t = Ae(n), r = Ae(e);
  if (n === e)
    return { valid: !0, data: n };
  if (t === y.object && r === y.object) {
    const s = C.objectKeys(e), a = C.objectKeys(n).filter((o) => s.indexOf(o) !== -1), i = { ...n, ...e };
    for (const o of a) {
      const c = qt(n[o], e[o]);
      if (!c.valid)
        return { valid: !1 };
      i[o] = c.data;
    }
    return { valid: !0, data: i };
  } else if (t === y.array && r === y.array) {
    if (n.length !== e.length)
      return { valid: !1 };
    const s = [];
    for (let a = 0; a < n.length; a++) {
      const i = n[a], o = e[a], c = qt(i, o);
      if (!c.valid)
        return { valid: !1 };
      s.push(c.data);
    }
    return { valid: !0, data: s };
  } else return t === y.date && r === y.date && +n == +e ? { valid: !0, data: n } : { valid: !1 };
}
class Tt extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), s = (a, i) => {
      if (_r(a) || _r(i))
        return w;
      const o = qt(a.value, i.value);
      return o.valid ? ((wr(a) || wr(i)) && t.dirty(), { status: t.value, value: o.data }) : (g(r, {
        code: v.invalid_intersection_types
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
Tt.create = (n, e, t) => new Tt({
  left: n,
  right: e,
  typeName: b.ZodIntersection,
  ...T(t)
});
class ze extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.array)
      return g(r, {
        code: v.invalid_type,
        expected: y.array,
        received: r.parsedType
      }), w;
    if (r.data.length < this._def.items.length)
      return g(r, {
        code: v.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), w;
    !this._def.rest && r.data.length > this._def.items.length && (g(r, {
      code: v.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const a = [...r.data].map((i, o) => {
      const c = this._def.items[o] || this._def.rest;
      return c ? c._parse(new Me(r, i, r.path, o)) : null;
    }).filter((i) => !!i);
    return r.common.async ? Promise.all(a).then((i) => ce.mergeArray(t, i)) : ce.mergeArray(t, a);
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
    typeName: b.ZodTuple,
    rest: null,
    ...T(e)
  });
};
class Cr extends S {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.map)
      return g(r, {
        code: v.invalid_type,
        expected: y.map,
        received: r.parsedType
      }), w;
    const s = this._def.keyType, a = this._def.valueType, i = [...r.data.entries()].map(([o, c], d) => ({
      key: s._parse(new Me(r, o, r.path, [d, "key"])),
      value: a._parse(new Me(r, c, r.path, [d, "value"]))
    }));
    if (r.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of i) {
          const d = await c.key, f = await c.value;
          if (d.status === "aborted" || f.status === "aborted")
            return w;
          (d.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(d.value, f.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const c of i) {
        const d = c.key, f = c.value;
        if (d.status === "aborted" || f.status === "aborted")
          return w;
        (d.status === "dirty" || f.status === "dirty") && t.dirty(), o.set(d.value, f.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Cr.create = (n, e, t) => new Cr({
  valueType: e,
  keyType: n,
  typeName: b.ZodMap,
  ...T(t)
});
class _t extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== y.set)
      return g(r, {
        code: v.invalid_type,
        expected: y.set,
        received: r.parsedType
      }), w;
    const s = this._def;
    s.minSize !== null && r.data.size < s.minSize.value && (g(r, {
      code: v.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.minSize.message
    }), t.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && (g(r, {
      code: v.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.maxSize.message
    }), t.dirty());
    const a = this._def.valueType;
    function i(c) {
      const d = /* @__PURE__ */ new Set();
      for (const f of c) {
        if (f.status === "aborted")
          return w;
        f.status === "dirty" && t.dirty(), d.add(f.value);
      }
      return { status: t.value, value: d };
    }
    const o = [...r.data.values()].map((c, d) => a._parse(new Me(r, c, r.path, d)));
    return r.common.async ? Promise.all(o).then((c) => i(c)) : i(o);
  }
  min(e, t) {
    return new _t({
      ...this._def,
      minSize: { value: e, message: _.toString(t) }
    });
  }
  max(e, t) {
    return new _t({
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
_t.create = (n, e) => new _t({
  valueType: n,
  minSize: null,
  maxSize: null,
  typeName: b.ZodSet,
  ...T(e)
});
class Ar extends S {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
Ar.create = (n, e) => new Ar({
  getter: n,
  typeName: b.ZodLazy,
  ...T(e)
});
class jr extends S {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return g(t, {
        received: t.data,
        code: v.invalid_literal,
        expected: this._def.value
      }), w;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
jr.create = (n, e) => new jr({
  value: n,
  typeName: b.ZodLiteral,
  ...T(e)
});
function Yr(n, e) {
  return new at({
    values: n,
    typeName: b.ZodEnum,
    ...T(e)
  });
}
class at extends S {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return g(t, {
        expected: C.joinValues(r),
        received: t.parsedType,
        code: v.invalid_type
      }), w;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return g(t, {
        received: t.data,
        code: v.invalid_enum_value,
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
    return at.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return at.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
at.create = Yr;
class Lr extends S {
  _parse(e) {
    const t = C.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== y.string && r.parsedType !== y.number) {
      const s = C.objectValues(t);
      return g(r, {
        expected: C.joinValues(s),
        received: r.parsedType,
        code: v.invalid_type
      }), w;
    }
    if (this._cache || (this._cache = new Set(C.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const s = C.objectValues(t);
      return g(r, {
        received: r.data,
        code: v.invalid_enum_value,
        options: s
      }), w;
    }
    return de(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Lr.create = (n, e) => new Lr({
  values: n,
  typeName: b.ZodNativeEnum,
  ...T(e)
});
class Ot extends S {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== y.promise && t.common.async === !1)
      return g(t, {
        code: v.invalid_type,
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
Ot.create = (n, e) => new Ot({
  type: n,
  typeName: b.ZodPromise,
  ...T(e)
});
class it extends S {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === b.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
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
            return w;
          const c = await this._def.schema._parseAsync({
            data: o,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? w : c.status === "dirty" || t.value === "dirty" ? mt(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return w;
        const o = this._def.schema._parseSync({
          data: i,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? w : o.status === "dirty" || t.value === "dirty" ? mt(o.value) : o;
      }
    }
    if (s.type === "refinement") {
      const i = (o) => {
        const c = s.refinement(o, a);
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
        return o.status === "aborted" ? w : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? w : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (s.type === "transform")
      if (r.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!nt(i))
          return w;
        const o = s.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((i) => nt(i) ? Promise.resolve(s.transform(i.value, a)).then((o) => ({
          status: t.value,
          value: o
        })) : w);
    C.assertNever(s);
  }
}
it.create = (n, e, t) => new it({
  schema: n,
  typeName: b.ZodEffects,
  effect: e,
  ...T(t)
});
it.createWithPreprocess = (n, e, t) => new it({
  schema: e,
  effect: { type: "preprocess", transform: n },
  typeName: b.ZodEffects,
  ...T(t)
});
class Ve extends S {
  _parse(e) {
    return this._getType(e) === y.undefined ? de(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ve.create = (n, e) => new Ve({
  innerType: n,
  typeName: b.ZodOptional,
  ...T(e)
});
class ot extends S {
  _parse(e) {
    return this._getType(e) === y.null ? de(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ot.create = (n, e) => new ot({
  innerType: n,
  typeName: b.ZodNullable,
  ...T(e)
});
class Ht extends S {
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
Ht.create = (n, e) => new Ht({
  innerType: n,
  typeName: b.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...T(e)
});
class Yt extends S {
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
    return xt(s) ? s.then((a) => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new Te(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new Te(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Yt.create = (n, e) => new Yt({
  innerType: n,
  typeName: b.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...T(e)
});
class Rr extends S {
  _parse(e) {
    if (this._getType(e) !== y.nan) {
      const r = this._getOrReturnCtx(e);
      return g(r, {
        code: v.invalid_type,
        expected: y.nan,
        received: r.parsedType
      }), w;
    }
    return { status: "valid", value: e.data };
  }
}
Rr.create = (n) => new Rr({
  typeName: b.ZodNaN,
  ...T(n)
});
class ds extends S {
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
class ir extends S {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const a = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? w : a.status === "dirty" ? (t.dirty(), mt(a.value)) : this._def.out._parseAsync({
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
    return new ir({
      in: e,
      out: t,
      typeName: b.ZodPipeline
    });
  }
}
class Gt extends S {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (s) => (nt(s) && (s.value = Object.freeze(s.value)), s);
    return xt(t) ? t.then((s) => r(s)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Gt.create = (n, e) => new Gt({
  innerType: n,
  typeName: b.ZodReadonly,
  ...T(e)
});
var b;
(function(n) {
  n.ZodString = "ZodString", n.ZodNumber = "ZodNumber", n.ZodNaN = "ZodNaN", n.ZodBigInt = "ZodBigInt", n.ZodBoolean = "ZodBoolean", n.ZodDate = "ZodDate", n.ZodSymbol = "ZodSymbol", n.ZodUndefined = "ZodUndefined", n.ZodNull = "ZodNull", n.ZodAny = "ZodAny", n.ZodUnknown = "ZodUnknown", n.ZodNever = "ZodNever", n.ZodVoid = "ZodVoid", n.ZodArray = "ZodArray", n.ZodObject = "ZodObject", n.ZodUnion = "ZodUnion", n.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", n.ZodIntersection = "ZodIntersection", n.ZodTuple = "ZodTuple", n.ZodRecord = "ZodRecord", n.ZodMap = "ZodMap", n.ZodSet = "ZodSet", n.ZodFunction = "ZodFunction", n.ZodLazy = "ZodLazy", n.ZodLiteral = "ZodLiteral", n.ZodEnum = "ZodEnum", n.ZodEffects = "ZodEffects", n.ZodNativeEnum = "ZodNativeEnum", n.ZodOptional = "ZodOptional", n.ZodNullable = "ZodNullable", n.ZodDefault = "ZodDefault", n.ZodCatch = "ZodCatch", n.ZodPromise = "ZodPromise", n.ZodBranded = "ZodBranded", n.ZodPipeline = "ZodPipeline", n.ZodReadonly = "ZodReadonly";
})(b || (b = {}));
const fs = st.create;
Ne.create;
be.create;
Et.create;
Tt.create;
ze.create;
at.create;
Ot.create;
Ve.create;
ot.create;
const Vr = new Uint8Array([
  31,
  139,
  8,
  0,
  177,
  131,
  174,
  105,
  0,
  3,
  99,
  96,
  96,
  82,
  111,
  12,
  112,
  172,
  96,
  119,
  205,
  43,
  41,
  202,
  76,
  45,
  110,
  244,
  119,
  174,
  80,
  49,
  128,
  2,
  93,
  48,
  97,
  2,
  34,
  44,
  96,
  92,
  24,
  104,
  244,
  115,
  77,
  241,
  206,
  204,
  75,
  105,
  244,
  101,
  72,
  201,
  44,
  73,
  205,
  77,
  245,
  73,
  76,
  74,
  205,
  105,
  244,
  81,
  104,
  244,
  110,
  72,
  241,
  204,
  75,
  203,
  111,
  244,
  116,
  168,
  224,
  240,
  245,
  244,
  117,
  13,
  169,
  44,
  72,
  109,
  244,
  80,
  104,
  116,
  111,
  168,
  224,
  12,
  75,
  204,
  41,
  77,
  5,
  107,
  115,
  85,
  104,
  116,
  105,
  108,
  116,
  78,
  201,
  203,
  207,
  75,
  37,
  202,
  70,
  195,
  70,
  91,
  55,
  136,
  141,
  54,
  16,
  27,
  43,
  248,
  242,
  75,
  75,
  82,
  139,
  2,
  114,
  18,
  147,
  129,
  214,
  231,
  149,
  52,
  90,
  43,
  52,
  90,
  49,
  44,
  170,
  224,
  6,
  11,
  123,
  2,
  85,
  120,
  166,
  16,
  231,
  151,
  10,
  14,
  255,
  162,
  148,
  212,
  34,
  239,
  212,
  202,
  164,
  68,
  3,
  168,
  71,
  44,
  20,
  26,
  205,
  27,
  27,
  205,
  82,
  75,
  138,
  18,
  139,
  51,
  32,
  30,
  50,
  64,
  246,
  144,
  190,
  66,
  163,
  30,
  138,
  135,
  116,
  20,
  26,
  181,
  27,
  27,
  181,
  136,
  247,
  144,
  81,
  163,
  10,
  212,
  67,
  202,
  56,
  60,
  164,
  164,
  208,
  168,
  72,
  177,
  135,
  12,
  161,
  30,
  146,
  87,
  104,
  148,
  107,
  108,
  148,
  173,
  224,
  203,
  201,
  47,
  46,
  209,
  77,
  204,
  75,
  209,
  77,
  203,
  47,
  205,
  75,
  1,
  123,
  77,
  14,
  201,
  103,
  178,
  10,
  50,
  200,
  254,
  146,
  82,
  144,
  108,
  148,
  0,
  123,
  138,
  241,
  202,
  175,
  89,
  83,
  55,
  29,
  94,
  204,
  30,
  8,
  0,
  64,
  93,
  64,
  8,
  53,
  2,
  0,
  0
]);
function Gr(n, e, t, r) {
  const s = n.Id, a = {};
  for (const c of Object.keys(n.Info))
    a[c] = h.con(n.Info[c]);
  if (n.Kind === "link") {
    r.api.obj(["Entries"]).set({ [s]: h.obj({
      Kind: h.con("link"),
      outerPlacement: h.val(h.con({ outerItemId: e, OrderKey: t })),
      Label: h.val(h.str(n.Label)),
      Info: h.obj(a),
      TargetId: h.con(n.TargetId)
    }) });
    return;
  }
  const i = n.Type === We ? "" : n.Type, o = {
    Kind: h.con("item"),
    outerPlacement: h.val(h.con({ outerItemId: e, OrderKey: t })),
    Label: h.val(h.str(n.Label)),
    Info: h.obj(a),
    MIMEType: h.val(h.str(i)),
    ValueKind: h.val(h.str(n.ValueKind))
  };
  switch (!0) {
    case (n.ValueKind === "literal" && n.Value != null):
      o.literalValue = h.val(h.str(n.Value));
      break;
    case (n.ValueKind === "binary" && n.Value != null):
      o.binaryValue = h.con(Mr(n.Value));
      break;
  }
  if (r.api.obj(["Entries"]).set({ [s]: h.obj(o) }), n.innerEntries.length > 0) {
    const c = Ft(null, null, n.innerEntries.length);
    for (let d = 0; d < n.innerEntries.length; d++)
      Gr(n.innerEntries[d], s, c[d], r);
  }
}
const Qr = fs().int().nonnegative().optional();
function Dt(n) {
  var t;
  const e = Qr.safeParse(n);
  if (!e.success)
    throw new Y("invalid-argument", ((t = e.error.issues[0]) == null ? void 0 : t.message) ?? "InsertionIndex must be a non-negative integer");
}
var O, wt, Je, Ee, De, oe, je, Le, ye, _e, St, et, Re, tt, $e, rt, l, Xr, Jr, en, tn, Qt, Xt, I, te, rn, nn, Jt, sn, an, ie, Ce, He, vt, Ye, pt, Ge, on, er, ln, tr, rr, nr, cn, hs, E, un, dn;
const Xe = class Xe extends fn {
  //----------------------------------------------------------------------------//
  //                                Construction                                //
  //----------------------------------------------------------------------------//
  /**** constructor — initialize store with model and configuration ****/
  constructor(t, r) {
    super();
    $(this, l);
    /**** private state ****/
    $(this, O);
    $(this, wt);
    $(this, Je);
    $(this, Ee, null);
    $(this, De, /* @__PURE__ */ new Set());
    // reverse index: outerItemId → Set<entryId>
    $(this, oe, /* @__PURE__ */ new Map());
    // forward index: entryId → outerItemId (kept in sync with #ReverseIndex)
    $(this, je, /* @__PURE__ */ new Map());
    // incoming link index: targetId → Set<linkId>
    $(this, Le, /* @__PURE__ */ new Map());
    // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
    $(this, ye, /* @__PURE__ */ new Map());
    // LRU wrapper cache
    $(this, _e, /* @__PURE__ */ new Map());
    $(this, St, hn);
    // transaction nesting
    $(this, et, 0);
    // ChangeSet accumulator inside a transaction
    $(this, Re, {});
    // patch log for exportPatch() — only locally generated patches (as binaries)
    $(this, tt, []);
    // suppress index updates / change tracking when applying remote patches
    $(this, $e, !1);
    // optional observer called when applyRemotePatch() catches an internal error
    $(this, rt);
    he(this, O, t), he(this, wt, (r == null ? void 0 : r.LiteralSizeLimit) ?? mn), he(this, Je, (r == null ? void 0 : r.TrashTTLms) ?? 2592e6), he(this, rt, r == null ? void 0 : r.onApplyPatchError), u(this, l, sn).call(this);
    const s = (r == null ? void 0 : r.TrashCheckIntervalMs) ?? Math.min(Math.floor(m(this, Je) / 4), 36e5);
    he(this, Ee, setInterval(
      () => {
        this.purgeExpiredTrashEntries();
      },
      s
    )), typeof m(this, Ee).unref == "function" && m(this, Ee).unref();
  }
  /**** fromScratch — create store from canonical empty snapshot ****/
  static fromScratch(t) {
    return this.fromBinary(Vr, t);
  }
  /**** fromBinary — deserialize store from binary snapshot ****/
  static fromBinary(t, r) {
    const s = Nt(t), a = dr.fromBinary(s).fork();
    return new Xe(a, r);
  }
  /**** fromJSON — deserialize store from a plain JSON object or JSON string ****/
  static fromJSON(t, r) {
    const s = typeof t == "string" ? JSON.parse(t) : t, a = dr.fromBinary(Nt(Vr));
    return Gr(s, "", "", a), a.api.flush(), new Xe(a, r);
  }
  //----------------------------------------------------------------------------//
  //                             Public Accessors                               //
  //----------------------------------------------------------------------------//
  /**** RootItem / TrashItem / LostAndFoundItem — access special items ****/
  get RootItem() {
    return u(this, l, te).call(this, Fe);
  }
  get TrashItem() {
    return u(this, l, te).call(this, N);
  }
  get LostAndFoundItem() {
    return u(this, l, te).call(this, me);
  }
  /**** EntryWithId — retrieve entry by id ****/
  EntryWithId(t) {
    if (u(this, l, I).call(this).Entries[t] != null)
      return u(this, l, te).call(this, t);
  }
  //----------------------------------------------------------------------------//
  //                             Public Mutators                                //
  //----------------------------------------------------------------------------//
  /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
  newItemAt(t, r, s) {
    if (r == null) throw new Y("invalid-argument", "outerItem must not be missing");
    const a = t ?? We;
    lr(a), Dt(s);
    const i = crypto.randomUUID();
    return this.transact(() => {
      const o = u(this, l, Ye).call(this, r.Id, s), c = a === We ? "" : a, d = h.obj({
        Kind: h.con("item"),
        outerPlacement: h.val(h.con({ outerItemId: r.Id, OrderKey: o })),
        Label: h.val(h.str("")),
        Info: h.obj({}),
        MIMEType: h.val(h.str(c)),
        ValueKind: h.val(h.str("none"))
      });
      m(this, O).api.obj(["Entries"]).set({ [i]: d }), u(this, l, ie).call(this, r.Id, i), u(this, l, E).call(this, r.Id, "innerEntryList"), u(this, l, E).call(this, i, "outerItem");
    }), u(this, l, te).call(this, i);
  }
  /**** newLinkAt — create new link in specified location ****/
  newLinkAt(t, r, s) {
    if (t == null) throw new Y("invalid-argument", "Target must not be missing");
    if (r == null) throw new Y("invalid-argument", "outerItem must not be missing");
    Dt(s), u(this, l, nr).call(this, t.Id), u(this, l, nr).call(this, r.Id);
    const a = crypto.randomUUID();
    return this.transact(() => {
      const i = u(this, l, Ye).call(this, r.Id, s), o = h.obj({
        Kind: h.con("link"),
        outerPlacement: h.val(h.con({ outerItemId: r.Id, OrderKey: i })),
        Label: h.val(h.str("")),
        Info: h.obj({}),
        TargetId: h.con(t.Id)
      });
      m(this, O).api.obj(["Entries"]).set({ [a]: o }), u(this, l, ie).call(this, r.Id, a), u(this, l, He).call(this, t.Id, a), u(this, l, E).call(this, r.Id, "innerEntryList"), u(this, l, E).call(this, a, "outerItem");
    }), u(this, l, te).call(this, a);
  }
  /**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/
  deserializeItemInto(t, r, s) {
    if (r == null) throw new Y("invalid-argument", "outerItem must not be missing");
    Dt(s);
    const a = typeof t == "string" ? JSON.parse(t) : t;
    if (a == null || a.Kind !== "item")
      throw new Y("invalid-argument", "Serialisation must be a valid SDS_ItemJSON object");
    const i = /* @__PURE__ */ new Map();
    u(this, l, Qt).call(this, a, i);
    const o = u(this, l, Ye).call(this, r.Id, s), c = i.get(a.Id) ?? a.Id;
    return this.transact(() => {
      u(this, l, Xt).call(this, a, r.Id, o, i);
    }), u(this, l, te).call(this, c);
  }
  /**** deserializeLinkInto — import a serialised link; always assigns a new Id ****/
  deserializeLinkInto(t, r, s) {
    if (r == null) throw new Y("invalid-argument", "outerItem must not be missing");
    const a = typeof t == "string" ? JSON.parse(t) : t;
    if (a == null || a.Kind !== "link")
      throw new Y("invalid-argument", "Serialisation must be a valid SDS_LinkJSON object");
    const i = crypto.randomUUID(), o = u(this, l, Ye).call(this, r.Id, s), c = {};
    for (const f of Object.keys(a.Info ?? {}))
      c[f] = h.con(a.Info[f]);
    const d = h.obj({
      Kind: h.con("link"),
      outerPlacement: h.val(h.con({ outerItemId: r.Id, OrderKey: o })),
      Label: h.val(h.str(a.Label ?? "")),
      Info: h.obj(c),
      TargetId: h.con(a.TargetId)
    });
    return this.transact(() => {
      m(this, O).api.obj(["Entries"]).set({ [i]: d }), u(this, l, ie).call(this, r.Id, i), u(this, l, He).call(this, a.TargetId, i), u(this, l, E).call(this, r.Id, "innerEntryList"), u(this, l, E).call(this, i, "outerItem");
    }), u(this, l, te).call(this, i);
  }
  /**** moveEntryTo — move entry to new location in tree ****/
  moveEntryTo(t, r, s) {
    if (Qr.parse(s), !this._mayMoveEntryTo(t.Id, r.Id, s))
      throw new Y("move-would-cycle", "cannot move an entry into one of its own descendants");
    const a = this._outerItemIdOf(t.Id), i = u(this, l, Ye).call(this, r.Id, s);
    this.transact(() => {
      if (m(this, O).api.val(["Entries", t.Id, "outerPlacement"]).set(h.con({ outerItemId: r.Id, OrderKey: i })), a === N && r.Id !== N) {
        const o = u(this, l, I).call(this).Entries[t.Id], c = o == null ? void 0 : o.Info;
        c != null && "_trashedAt" in c && (m(this, O).api.obj(["Entries", t.Id, "Info"]).del(["_trashedAt"]), u(this, l, E).call(this, t.Id, "Info._trashedAt"));
      }
      a != null && (u(this, l, Ce).call(this, a, t.Id), u(this, l, E).call(this, a, "innerEntryList")), u(this, l, ie).call(this, r.Id, t.Id), u(this, l, E).call(this, r.Id, "innerEntryList"), u(this, l, E).call(this, t.Id, "outerItem");
    });
  }
  /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
  _rebalanceInnerEntriesOf(t) {
    const r = u(this, l, Ge).call(this, t);
    if (r.length === 0)
      return;
    const s = Ft(null, null, r.length);
    r.forEach((a, i) => {
      m(this, O).api.val(["Entries", a.Id, "outerPlacement"]).set(h.con({ outerItemId: t, OrderKey: s[i] })), u(this, l, E).call(this, a.Id, "outerItem");
    });
  }
  /**** deleteEntry — move entry to trash ****/
  deleteEntry(t) {
    if (!this._mayDeleteEntry(t.Id))
      throw new Y("delete-not-permitted", "this entry cannot be deleted");
    const r = this._outerItemIdOf(t.Id), s = u(this, l, pt).call(this, N), a = Ie(s, null);
    this.transact(() => {
      m(this, O).api.val(["Entries", t.Id, "outerPlacement"]).set(h.con({ outerItemId: N, OrderKey: a })), u(this, l, cn).call(this, t.Id), m(this, O).api.obj(["Entries", t.Id, "Info"]).set({ _trashedAt: h.val(h.json(Date.now())) }), r != null && (u(this, l, Ce).call(this, r, t.Id), u(this, l, E).call(this, r, "innerEntryList")), u(this, l, ie).call(this, N, t.Id), u(this, l, E).call(this, N, "innerEntryList"), u(this, l, E).call(this, t.Id, "outerItem"), u(this, l, E).call(this, t.Id, "Info._trashedAt");
    });
  }
  /**** purgeEntry — permanently delete entry from trash ****/
  purgeEntry(t) {
    if (this._outerItemIdOf(t.Id) !== N)
      throw new Y("purge-not-in-trash", "only direct children of TrashItem can be purged");
    if (u(this, l, on).call(this, t.Id))
      throw new Y("purge-protected", "entry is protected by incoming links and cannot be purged");
    this.transact(() => {
      u(this, l, rr).call(this, t.Id);
    });
  }
  /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
  purgeExpiredTrashEntries(t) {
    var c, d;
    const r = t ?? m(this, Je);
    if (r == null)
      return 0;
    const s = Date.now(), a = u(this, l, I).call(this), i = Array.from(m(this, oe).get(N) ?? /* @__PURE__ */ new Set());
    let o = 0;
    for (const f of i) {
      const p = a.Entries[f];
      if (p == null || ((c = p.outerPlacement) == null ? void 0 : c.outerItemId) !== N)
        continue;
      const j = (d = p.Info) == null ? void 0 : d._trashedAt;
      if (typeof j == "number" && !(s - j < r))
        try {
          this.purgeEntry(u(this, l, te).call(this, f)), o++;
        } catch {
        }
    }
    return o;
  }
  /**** dispose — clean up resources ****/
  dispose() {
    m(this, Ee) != null && (clearInterval(m(this, Ee)), he(this, Ee, null)), m(this, De).clear();
  }
  //----------------------------------------------------------------------------//
  //                             Change Tracking                                //
  //----------------------------------------------------------------------------//
  /**** transact — execute callback within transaction ****/
  transact(t) {
    const r = m(this, et) === 0;
    Rt(this, et)._++;
    try {
      t();
    } finally {
      if (Rt(this, et)._--, r) {
        const s = m(this, O).api.flush();
        if (!m(this, $e))
          try {
            const o = s.toBinary();
            o.byteLength > 0 && m(this, tt).push(o);
          } catch {
          }
        const a = m(this, Re), i = m(this, $e) ? "external" : "internal";
        he(this, Re, {}), u(this, l, un).call(this, i, a);
      }
    }
  }
  /**** onChangeInvoke — register change listener ****/
  onChangeInvoke(t) {
    return m(this, De).add(t), () => {
      m(this, De).delete(t);
    };
  }
  /**** applyRemotePatch — apply external patch to model ****/
  applyRemotePatch(t) {
    he(this, $e, !0);
    try {
      this.transact(() => {
        if (t instanceof Uint8Array) {
          if (t.byteLength === 0)
            return;
          let r;
          try {
            r = u(this, l, tn).call(this, t);
          } catch {
            r = [t];
          }
          for (const s of r) {
            const a = wn.fromBinary(s);
            try {
              m(this, O).applyPatch(a);
            } catch (i) {
              m(this, rt) != null && m(this, rt).call(this, i);
            }
          }
        } else
          m(this, O).applyPatch(t);
        u(this, l, an).call(this);
      });
    } finally {
      he(this, $e, !1);
    }
    this.recoverOrphans();
  }
  /**** currentCursor — get current sync position ****/
  get currentCursor() {
    return u(this, l, Xr).call(this, m(this, tt).length);
  }
  /**** exportPatch — export patches since given cursor ****/
  exportPatch(t) {
    const r = t != null ? u(this, l, Jr).call(this, t) : 0, s = m(this, tt).slice(r);
    return u(this, l, en).call(this, s);
  }
  /**** recoverOrphans — move orphaned entries to LostAndFound ****/
  recoverOrphans() {
    this.transact(() => {
      var s;
      const t = u(this, l, I).call(this).Entries, r = new Set(Object.keys(t));
      for (const [a, i] of Object.entries(t)) {
        const o = (s = i.outerPlacement) == null ? void 0 : s.outerItemId;
        if (o && !r.has(o)) {
          const c = Ie(u(this, l, pt).call(this, me), null);
          m(this, O).api.val(["Entries", a, "outerPlacement"]).set(h.con({ outerItemId: me, OrderKey: c })), u(this, l, Ce).call(this, o, a), u(this, l, ie).call(this, me, a), u(this, l, E).call(this, o, "innerEntryList"), u(this, l, E).call(this, me, "innerEntryList"), u(this, l, E).call(this, a, "outerItem");
        }
        if (i.Kind === "link") {
          const c = i.TargetId;
          if (c && !r.has(c)) {
            const d = Ie(u(this, l, pt).call(this, me), null);
            m(this, O).api.obj(["Entries"]).set({ [c]: h.obj({
              Kind: h.con("item"),
              outerPlacement: h.val(h.con({ outerItemId: me, OrderKey: d })),
              Label: h.val(h.str("")),
              Info: h.obj({}),
              MIMEType: h.val(h.str("")),
              ValueKind: h.val(h.str("none"))
            }) }), u(this, l, ie).call(this, me, c), r.add(c), u(this, l, E).call(this, me, "innerEntryList");
          }
        }
      }
    });
  }
  /**** asBinary — serialize store to gzipped binary ****/
  asBinary() {
    return vr(m(this, O).toBinary());
  }
  /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
  newEntryFromBinaryAt(t, r, s) {
    const a = new TextDecoder().decode(Nt(t));
    return this.newEntryFromJSONat(JSON.parse(a), r, s);
  }
  /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
  _EntryAsBinary(t) {
    const r = JSON.stringify(this._EntryAsJSON(t));
    return vr(new TextEncoder().encode(r));
  }
  //----------------------------------------------------------------------------//
  //                               Proxies                                      //
  //----------------------------------------------------------------------------//
  /**** get — proxy handler for property access ****/
  get(t, r) {
    return r === "Entries" ? new Proxy(u(this, l, I).call(this).Entries, {
      get: (s, a) => u(this, l, te).call(this, a),
      set: () => !1,
      deleteProperty: () => !1,
      ownKeys: () => Object.keys(u(this, l, I).call(this).Entries),
      getOwnPropertyDescriptor: (s, a) => {
        if (Object.keys(u(this, l, I).call(this).Entries).includes(String(a)))
          return {
            configurable: !0,
            enumerable: !0,
            value: u(this, l, te).call(this, String(a))
          };
      }
    }) : u(this, l, I).call(this)[r];
  }
  /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
  set() {
    return !1;
  }
  deleteProperty() {
    return !1;
  }
  ownKeys() {
    return Object.keys(u(this, l, I).call(this));
  }
  getOwnPropertyDescriptor() {
    return {
      configurable: !0,
      enumerable: !0
    };
  }
  //----------------------------------------------------------------------------//
  //              Internal helpers — called by SDS_Entry / Data / Link           //
  //----------------------------------------------------------------------------//
  /**** _KindOf — get entry kind (data or link) ****/
  _KindOf(t) {
    const r = u(this, l, I).call(this).Entries[t];
    if (r == null)
      throw new Y("not-found", `entry '${t}' not found`);
    return r.Kind;
  }
  /**** _LabelOf — get entry label ****/
  _LabelOf(t) {
    const r = u(this, l, I).call(this).Entries[t];
    return r == null ? "" : String(r.Label ?? "");
  }
  /**** _setLabelOf — set entry label ****/
  _setLabelOf(t, r) {
    vn(r), this.transact(() => {
      u(this, l, I).call(this).Entries[t] != null && (m(this, O).api.obj(["Entries", t]).set({ Label: r }), u(this, l, E).call(this, t, "Label"));
    });
  }
  /**** _TypeOf — get entry MIME type ****/
  _TypeOf(t) {
    const r = u(this, l, I).call(this).Entries[t], s = (r == null ? void 0 : r.MIMEType) ?? "";
    return s === "" ? We : s;
  }
  /**** _setTypeOf — set entry MIME type ****/
  _setTypeOf(t, r) {
    lr(r);
    const s = r === We ? "" : r;
    this.transact(() => {
      m(this, O).api.obj(["Entries", t]).set({ MIMEType: s }), u(this, l, E).call(this, t, "Type");
    });
  }
  /**** _ValueKindOf — get value storage kind ****/
  _ValueKindOf(t) {
    const r = u(this, l, I).call(this).Entries[t];
    return (r == null ? void 0 : r.ValueKind) ?? "none";
  }
  /**** _readValueOf — read entry value ****/
  async _readValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "none":
        return;
      case r === "literal": {
        const s = u(this, l, I).call(this).Entries[t], a = s == null ? void 0 : s.literalValue;
        return String(a ?? "");
      }
      case r === "binary": {
        const s = u(this, l, I).call(this).Entries[t];
        return s == null ? void 0 : s.binaryValue;
      }
      default: {
        const s = this._getValueRefOf(t);
        if (s == null)
          return;
        const a = await this._getValueBlobAsync(s.Hash);
        return a == null ? void 0 : r === "literal-reference" ? new TextDecoder().decode(a) : a;
      }
    }
  }
  /**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/
  _currentValueOf(t) {
    const r = this._ValueKindOf(t);
    switch (!0) {
      case r === "literal": {
        const s = u(this, l, I).call(this).Entries[t];
        return String((s == null ? void 0 : s.literalValue) ?? "");
      }
      case r === "binary": {
        const s = u(this, l, I).call(this).Entries[t];
        return s == null ? void 0 : s.binaryValue;
      }
      default:
        return;
    }
  }
  /**** _writeValueOf — write entry value ****/
  _writeValueOf(t, r) {
    this.transact(() => {
      if (u(this, l, I).call(this).Entries[t] != null) {
        switch (!0) {
          case r == null: {
            m(this, O).api.obj(["Entries", t]).set({ ValueKind: h.val(h.str("none")) });
            break;
          }
          case (typeof r == "string" && r.length <= m(this, wt)): {
            m(this, O).api.obj(["Entries", t]).set({
              ValueKind: h.val(h.str("literal")),
              literalValue: r
            });
            break;
          }
          case typeof r == "string": {
            const i = new TextEncoder().encode(r), o = Xe._BLOBhash(i);
            this._storeValueBlob(o, i), m(this, O).api.obj(["Entries", t]).set({
              ValueKind: h.val(h.str("literal-reference")),
              ValueRef: { Hash: o, Size: i.byteLength }
            });
            break;
          }
          case r.byteLength <= pn: {
            m(this, O).api.obj(["Entries", t]).set({
              ValueKind: h.val(h.str("binary")),
              binaryValue: r
            });
            break;
          }
          default: {
            const a = r, i = Xe._BLOBhash(a);
            this._storeValueBlob(i, a), m(this, O).api.obj(["Entries", t]).set({
              ValueKind: h.val(h.str("binary-reference")),
              ValueRef: { Hash: i, Size: a.byteLength }
            });
            break;
          }
        }
        u(this, l, E).call(this, t, "Value");
      }
    });
  }
  /**** _spliceValueOf — modify literal value in-place ****/
  _spliceValueOf(t, r, s, a) {
    if (this._ValueKindOf(t) !== "literal")
      throw new Y("change-value-not-literal", "changeValue only works on items with ValueKind literal");
    this.transact(() => {
      var d;
      const o = String(((d = u(this, l, I).call(this).Entries[t]) == null ? void 0 : d.literalValue) ?? ""), c = o.slice(0, r) + a + o.slice(r + s);
      this._writeValueOf(t, c);
    });
  }
  /**** _innerEntriesOf — get sorted inner entries ****/
  _innerEntriesOf(t) {
    return u(this, l, Ge).call(this, t).map((r) => u(this, l, te).call(this, r.Id));
  }
  /**** _outerItemIdOf — get outer data id ****/
  _outerItemIdOf(t) {
    var a;
    const r = u(this, l, I).call(this).Entries[t];
    return ((a = r == null ? void 0 : r.outerPlacement) == null ? void 0 : a.outerItemId) ?? void 0;
  }
  /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
  _getValueRefOf(t) {
    const r = this._ValueKindOf(t);
    if (r !== "literal-reference" && r !== "binary-reference")
      return;
    const s = u(this, l, I).call(this).Entries[t], a = s == null ? void 0 : s.ValueRef;
    if (a != null)
      return typeof a == "string" ? JSON.parse(a) : a;
  }
  /**** _InfoProxyOf — get proxy for metadata access ****/
  _InfoProxyOf(t) {
    const r = this;
    return new Proxy({}, {
      get(s, a) {
        var o, c;
        if (typeof a != "string")
          return;
        const i = (c = u(o = r, l, I).call(o).Entries[t]) == null ? void 0 : c.Info;
        return i == null ? void 0 : i[a];
      },
      set(s, a, i) {
        return typeof a != "string" ? !1 : i === void 0 ? (r.transact(() => {
          var c, d, f;
          const o = (d = u(c = r, l, I).call(c).Entries[t]) == null ? void 0 : d.Info;
          o != null && a in o && (m(r, O).api.obj(["Entries", t, "Info"]).del([a]), u(f = r, l, E).call(f, t, `Info.${a}`));
        }), !0) : (gn(a), yn(i), r.transact(() => {
          var o;
          m(r, O).api.obj(["Entries", t, "Info"]).set({ [a]: i }), u(o = r, l, E).call(o, t, `Info.${a}`);
        }), !0);
      },
      deleteProperty(s, a) {
        return typeof a != "string" ? !1 : (r.transact(() => {
          var o, c, d;
          const i = (c = u(o = r, l, I).call(o).Entries[t]) == null ? void 0 : c.Info;
          i != null && a in i && (m(r, O).api.obj(["Entries", t, "Info"]).del([a]), u(d = r, l, E).call(d, t, `Info.${a}`));
        }), !0);
      },
      ownKeys() {
        var a, i;
        const s = (i = u(a = r, l, I).call(a).Entries[t]) == null ? void 0 : i.Info;
        return s != null ? Object.keys(s) : [];
      },
      getOwnPropertyDescriptor(s, a) {
        var o, c;
        if (typeof a != "string")
          return;
        const i = (c = u(o = r, l, I).call(o).Entries[t]) == null ? void 0 : c.Info;
        if (!(i == null || !(a in i)))
          return { configurable: !0, enumerable: !0, value: i[a] };
      },
      has(s, a) {
        var o, c;
        if (typeof a != "string")
          return !1;
        const i = (c = u(o = r, l, I).call(o).Entries[t]) == null ? void 0 : c.Info;
        return i != null && a in i;
      }
    });
  }
  /**** _TargetOf — get link target data ****/
  _TargetOf(t) {
    const r = u(this, l, I).call(this).Entries[t], s = r == null ? void 0 : r.TargetId;
    if (s == null || s === "")
      throw new Y("not-found", `link '${t}' has no target`);
    return u(this, l, te).call(this, s);
  }
  /**** _mayMoveEntryTo — check if move is valid ****/
  _mayMoveEntryTo(t, r, s) {
    return !(t === Fe || (t === N || t === me) && r !== Fe || u(this, l, dn).call(this, t, r));
  }
  /**** _mayDeleteEntry — check if entry can be deleted ****/
  _mayDeleteEntry(t) {
    return !(t === Fe || t === N || t === me);
  }
};
O = new WeakMap(), wt = new WeakMap(), Je = new WeakMap(), Ee = new WeakMap(), De = new WeakMap(), oe = new WeakMap(), je = new WeakMap(), Le = new WeakMap(), ye = new WeakMap(), _e = new WeakMap(), St = new WeakMap(), et = new WeakMap(), Re = new WeakMap(), tt = new WeakMap(), $e = new WeakMap(), rt = new WeakMap(), l = new WeakSet(), /**** #encodeUint32 — encode 32-bit integer as bytes ****/
Xr = function(t) {
  const r = new Uint8Array(4);
  return new DataView(r.buffer).setUint32(0, t >>> 0, !1), r;
}, /**** #decodeUint32 — decode 32-bit integer from bytes ****/
Jr = function(t) {
  return t.byteLength < 4 ? 0 : new DataView(t.buffer, t.byteOffset, 4).getUint32(0, !1);
}, /**** #encodePatchArray — encode array of patches ****/
en = function(t) {
  const r = 4 + t.reduce((o, c) => o + 4 + c.byteLength, 0), s = new Uint8Array(r), a = new DataView(s.buffer);
  a.setUint32(0, t.length, !1);
  let i = 4;
  for (const o of t)
    a.setUint32(i, o.byteLength, !1), i += 4, s.set(o, i), i += o.byteLength;
  return s;
}, /**** #decodePatchArray — decode array of patches ****/
tn = function(t) {
  const r = new DataView(t.buffer, t.byteOffset, t.byteLength), s = r.getUint32(0, !1), a = [];
  let i = 4;
  for (let o = 0; o < s; o++) {
    const c = r.getUint32(i, !1);
    i += 4, a.push(t.slice(i, i + c)), i += c;
  }
  return a;
}, //----------------------------------------------------------------------------//
//                             Private Helpers                                //
//----------------------------------------------------------------------------//
/**** #collectEntryIds — build old-to-new UUID mapping for an entire subtree ****/
Qt = function(t, r) {
  if (r.set(t.Id, crypto.randomUUID()), t.Kind === "item")
    for (const s of t.innerEntries)
      u(this, l, Qt).call(this, s, r);
}, /**** #importEntryFromJSON — recursively import a JSON entry with index updates ****/
Xt = function(t, r, s, a) {
  const i = a.get(t.Id) ?? t.Id, o = {};
  for (const f of Object.keys(t.Info ?? {}))
    o[f] = h.con(t.Info[f]);
  if (t.Kind === "link") {
    const f = a.get(t.TargetId) ?? t.TargetId;
    m(this, O).api.obj(["Entries"]).set({ [i]: h.obj({
      Kind: h.con("link"),
      outerPlacement: h.val(h.con({ outerItemId: r, OrderKey: s })),
      Label: h.val(h.str(t.Label ?? "")),
      Info: h.obj(o),
      TargetId: h.con(f)
    }) }), u(this, l, ie).call(this, r, i), u(this, l, He).call(this, f, i), u(this, l, E).call(this, r, "innerEntryList"), u(this, l, E).call(this, i, "outerItem");
    return;
  }
  const c = t.Type === We ? "" : t.Type, d = {
    Kind: h.con("item"),
    outerPlacement: h.val(h.con({ outerItemId: r, OrderKey: s })),
    Label: h.val(h.str(t.Label ?? "")),
    Info: h.obj(o),
    MIMEType: h.val(h.str(c)),
    ValueKind: h.val(h.str(t.ValueKind ?? "none"))
  };
  switch (!0) {
    case (t.ValueKind === "literal" && t.Value != null):
      d.literalValue = h.val(h.str(t.Value));
      break;
    case (t.ValueKind === "binary" && t.Value != null):
      d.binaryValue = h.con(Mr(t.Value));
      break;
  }
  if (m(this, O).api.obj(["Entries"]).set({ [i]: h.obj(d) }), u(this, l, ie).call(this, r, i), u(this, l, E).call(this, r, "innerEntryList"), u(this, l, E).call(this, i, "outerItem"), t.innerEntries.length > 0) {
    const f = Ft(null, null, t.innerEntries.length);
    for (let p = 0; p < t.innerEntries.length; p++)
      u(this, l, Xt).call(this, t.innerEntries[p], i, f[p], a);
  }
}, /**** #view — get current model state view ****/
I = function() {
  return m(this, O).api.view();
}, /**** #wrapped — wrap raw entry data in SDS_Entry object ****/
te = function(t) {
  const s = u(this, l, I).call(this).Entries[t];
  if (s == null)
    return null;
  const a = s.Kind;
  switch (!0) {
    case a === "item":
      return u(this, l, rn).call(this, t);
    case a === "link":
      return u(this, l, nn).call(this, t);
    default:
      return null;
  }
}, /**** #wrappedItem — wrap raw data data in SDS_Item object ****/
rn = function(t) {
  const r = m(this, _e).get(t);
  if (r instanceof cr)
    return r;
  const s = new cr(this, t);
  return u(this, l, Jt).call(this, t, s), s;
}, /**** #wrappedLink — wrap raw link data in SDS_Link object ****/
nn = function(t) {
  const r = m(this, _e).get(t);
  if (r instanceof ur)
    return r;
  const s = new ur(this, t);
  return u(this, l, Jt).call(this, t, s), s;
}, /**** #cacheWrapper — add wrapper to LRU cache ****/
Jt = function(t, r) {
  if (m(this, _e).size >= m(this, St)) {
    const s = m(this, _e).keys().next().value;
    s != null && m(this, _e).delete(s);
  }
  m(this, _e).set(t, r);
}, /**** #rebuildIndices — rebuild all indices from scratch ****/
sn = function() {
  var r;
  m(this, oe).clear(), m(this, je).clear(), m(this, Le).clear(), m(this, ye).clear();
  const t = u(this, l, I).call(this).Entries;
  for (const [s, a] of Object.entries(t)) {
    const i = (r = a.outerPlacement) == null ? void 0 : r.outerItemId;
    if (i && u(this, l, ie).call(this, i, s), a.Kind === "link") {
      const o = a.TargetId;
      o && u(this, l, He).call(this, o, s);
    }
  }
}, /**** #updateIndicesFromView — update indices after patch applied ****/
an = function() {
  var i;
  const t = /* @__PURE__ */ new Set(), r = u(this, l, I).call(this).Entries;
  for (const [o, c] of Object.entries(r)) {
    t.add(o);
    const d = (i = c.outerPlacement) == null ? void 0 : i.outerItemId, f = m(this, je).get(o);
    switch (d !== f && (f != null && (u(this, l, Ce).call(this, f, o), u(this, l, E).call(this, f, "innerEntryList")), d != null && (u(this, l, ie).call(this, d, o), u(this, l, E).call(this, d, "innerEntryList")), u(this, l, E).call(this, o, "outerItem")), !0) {
      case c.Kind === "link": {
        const p = c.TargetId, k = m(this, ye).get(o);
        p !== k && (k != null && u(this, l, vt).call(this, k, o), p != null && u(this, l, He).call(this, p, o));
        break;
      }
      case m(this, ye).has(o):
        u(this, l, vt).call(this, m(this, ye).get(o), o);
        break;
    }
    u(this, l, E).call(this, o, "Label");
  }
  const s = Array.from(m(this, je).entries()).filter(([o]) => !t.has(o));
  for (const [o, c] of s)
    u(this, l, Ce).call(this, c, o), u(this, l, E).call(this, c, "innerEntryList");
  const a = Array.from(m(this, ye).entries()).filter(([o]) => !t.has(o));
  for (const [o, c] of a)
    u(this, l, vt).call(this, c, o);
}, /**** #addToReverseIndex — add entry to outer-data index ****/
ie = function(t, r) {
  let s = m(this, oe).get(t);
  s == null && (s = /* @__PURE__ */ new Set(), m(this, oe).set(t, s)), s.add(r), m(this, je).set(r, t);
}, /**** #removeFromReverseIndex — remove entry from outer-data index ****/
Ce = function(t, r) {
  var s;
  (s = m(this, oe).get(t)) == null || s.delete(r), m(this, je).delete(r);
}, /**** #addToLinkTargetIndex — add link to target index ****/
He = function(t, r) {
  let s = m(this, Le).get(t);
  s == null && (s = /* @__PURE__ */ new Set(), m(this, Le).set(t, s)), s.add(r), m(this, ye).set(r, t);
}, /**** #removeFromLinkTargetIndex — remove link from target index ****/
vt = function(t, r) {
  var s;
  (s = m(this, Le).get(t)) == null || s.delete(r), m(this, ye).delete(r);
}, /**** #OrderKeyAt — generate order key for insertion position ****/
Ye = function(t, r) {
  const s = (o) => {
    if (o.length === 0 || r == null) {
      const d = o.length > 0 ? o[o.length - 1].OrderKey : null;
      return Ie(d, null);
    }
    const c = Math.max(0, Math.min(r, o.length));
    return Ie(
      c > 0 ? o[c - 1].OrderKey : null,
      c < o.length ? o[c].OrderKey : null
    );
  };
  let a = u(this, l, Ge).call(this, t);
  const i = s(a);
  return i.length <= _n ? i : (this._rebalanceInnerEntriesOf(t), s(u(this, l, Ge).call(this, t)));
}, /**** #lastOrderKeyOf — get order key of last inner entry ****/
pt = function(t) {
  const r = u(this, l, Ge).call(this, t);
  return r.length > 0 ? r[r.length - 1].OrderKey : null;
}, /**** #sortedInnerEntriesOf — get sorted inner entries ****/
Ge = function(t) {
  var i, o;
  const r = m(this, oe).get(t) ?? /* @__PURE__ */ new Set(), s = [], a = u(this, l, I).call(this).Entries;
  for (const c of r) {
    const d = a[c];
    ((i = d.outerPlacement) == null ? void 0 : i.outerItemId) === t && s.push({
      Id: c,
      OrderKey: ((o = d.outerPlacement) == null ? void 0 : o.OrderKey) ?? ""
    });
  }
  return s.sort(
    (c, d) => c.OrderKey < d.OrderKey ? -1 : c.OrderKey > d.OrderKey ? 1 : c.Id < d.Id ? -1 : c.Id > d.Id ? 1 : 0
  ), s;
}, /**** #isProtected — check if entry is protected by incoming links ****/
on = function(t) {
  const r = u(this, l, tr).call(this), s = /* @__PURE__ */ new Set();
  let a = !0;
  for (; a; ) {
    a = !1;
    for (const i of m(this, oe).get(N) ?? /* @__PURE__ */ new Set())
      s.has(i) || u(this, l, er).call(this, i, r, s) && (s.add(i), a = !0);
  }
  return s.has(t);
}, /**** #SubtreeHasIncomingLinks — check for incoming links to subtree ****/
er = function(t, r, s) {
  const a = [t], i = /* @__PURE__ */ new Set();
  for (; a.length > 0; ) {
    const o = a.pop();
    if (i.has(o))
      continue;
    i.add(o);
    const c = m(this, Le).get(o) ?? /* @__PURE__ */ new Set();
    for (const d of c) {
      if (r.has(d))
        return !0;
      const f = u(this, l, ln).call(this, d);
      if (f != null && s.has(f))
        return !0;
    }
    for (const d of m(this, oe).get(o) ?? /* @__PURE__ */ new Set())
      i.has(d) || a.push(d);
  }
  return !1;
}, /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
ln = function(t) {
  let r = t;
  for (; r != null; ) {
    const s = this._outerItemIdOf(r);
    if (s === N)
      return r;
    if (s === Fe || s == null)
      return null;
    r = s;
  }
  return null;
}, /**** #reachableFromRoot — compute live-tree entries reachable from root ****/
// TrashItem is included (it is a direct child of Root) but its subtree is
// NOT traversed — entries inside Trash are not considered "live" and must
// not protect other entries from being purged.
tr = function() {
  const t = /* @__PURE__ */ new Set(), r = [Fe];
  for (; r.length > 0; ) {
    const s = r.pop();
    if (!t.has(s) && (t.add(s), s !== N))
      for (const a of m(this, oe).get(s) ?? /* @__PURE__ */ new Set())
        t.has(a) || r.push(a);
  }
  return t;
}, /**** #purgeSubtree — recursively purge entry and children ****/
rr = function(t) {
  var d;
  const r = u(this, l, I).call(this).Entries[t];
  if (r == null)
    return;
  const s = r.Kind, a = (d = r.outerPlacement) == null ? void 0 : d.outerItemId, i = u(this, l, tr).call(this), o = /* @__PURE__ */ new Set(), c = Array.from(m(this, oe).get(t) ?? /* @__PURE__ */ new Set());
  for (const f of c)
    if (u(this, l, er).call(this, f, i, o)) {
      const p = Ie(u(this, l, pt).call(this, N), null);
      m(this, O).api.obj(["Entries", f, "outerPlacement"]).set({
        outerItemId: N,
        OrderKey: p
      }), u(this, l, Ce).call(this, t, f), u(this, l, ie).call(this, N, f), u(this, l, E).call(this, N, "innerEntryList"), u(this, l, E).call(this, f, "outerItem");
    } else
      u(this, l, rr).call(this, f);
  if (m(this, O).api.obj(["Entries"]).del([t]), a && (u(this, l, Ce).call(this, a, t), u(this, l, E).call(this, a, "innerEntryList")), s === "link") {
    const f = r.TargetId;
    f && u(this, l, vt).call(this, f, t);
  }
  m(this, _e).delete(t);
}, /**** #requireItemExists — throw if data doesn't exist ****/
nr = function(t) {
  const s = u(this, l, I).call(this).Entries[t];
  if (s == null || s.Kind !== "item")
    throw new Y("invalid-argument", `item '${t}' does not exist`);
}, /**** #ensureInfoExists — create Info object if missing ****/
cn = function(t) {
  const r = u(this, l, I).call(this).Entries[t];
  (r == null ? void 0 : r.Info) == null && m(this, O).api.obj(["Entries", t]).set({ Info: h.obj({}) });
}, /**** #removeInfoIfEmpty — delete Info object if empty ****/
hs = function(t) {
  const r = u(this, l, I).call(this).Entries[t], s = r == null ? void 0 : r.Info;
  s != null && Object.keys(s).length === 0 && m(this, O).api.obj(["Entries", t]).del(["Info"]);
}, /**** #recordChange — track property change ****/
E = function(t, r) {
  m(this, Re)[t] == null && (m(this, Re)[t] = /* @__PURE__ */ new Set()), m(this, Re)[t].add(r);
}, /**** #notifyHandlers — invoke change listeners ****/
un = function(t, r) {
  if (Object.keys(r).length !== 0)
    for (const s of m(this, De))
      try {
        s(t, r);
      } catch {
      }
}, /**** #wouldCreateCycle — check if move would create an outer-data cycle ****/
dn = function(t, r) {
  let s = r;
  for (; s != null; ) {
    if (s === t)
      return !0;
    s = this._outerItemIdOf(s);
  }
  return !1;
};
let Zr = Xe;
export {
  Zr as SDS_DataStore,
  bs as SDS_Entry,
  ks as SDS_Error,
  xs as SDS_Item,
  Is as SDS_Link
};
