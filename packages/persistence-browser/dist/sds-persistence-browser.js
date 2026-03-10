var f = (s) => {
  throw TypeError(s);
};
var g = (s, t, e) => t.has(s) || f("Cannot " + e);
var r = (s, t, e) => (g(s, t, "read from private field"), e ? e.call(s) : t.get(s)), D = (s, t, e) => t.has(s) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), x = (s, t, e, a) => (g(s, t, "write to private field"), a ? a.call(s, e) : t.set(s, e), e), d = (s, t, e) => (g(s, t, "access private method"), e);
function c(s) {
  return new Promise((t, e) => {
    s.onsuccess = () => {
      t(s.result);
    }, s.onerror = () => {
      e(s.error);
    };
  });
}
function p(s, t, e) {
  return s.transaction(t, e);
}
var w, i, B, h, l;
class j {
  /**** constructor ****/
  constructor(t) {
    D(this, h);
    D(this, w);
    D(this, i);
    D(this, B);
    x(this, i, t), x(this, B, `sds:${t}`);
  }
  //----------------------------------------------------------------------------//
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const t = await d(this, h, l).call(this), e = p(t, ["snapshots"], "readonly"), a = await c(
      e.objectStore("snapshots").get(r(this, i))
    );
    return a != null ? a.data : void 0;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(t) {
    const e = await d(this, h, l).call(this), a = p(e, ["snapshots"], "readwrite");
    await c(
      a.objectStore("snapshots").put({
        storeId: r(this, i),
        data: t,
        clock: Date.now()
      })
    );
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(t) {
    const e = await d(this, h, l).call(this), o = p(e, ["patches"], "readonly").objectStore("patches"), n = IDBKeyRange.bound(
      [r(this, i), t + 1],
      [r(this, i), Number.MAX_SAFE_INTEGER]
    );
    return (await c(
      o.getAll(n)
    )).sort((y, S) => y.clock - S.clock).map((y) => y.data);
  }
  /**** appendPatch ****/
  async appendPatch(t, e) {
    const a = await d(this, h, l).call(this), o = p(a, ["patches"], "readwrite");
    try {
      await c(
        o.objectStore("patches").add({
          storeId: r(this, i),
          clock: e,
          data: t
        })
      );
    } catch {
    }
  }
  /**** prunePatches ****/
  async prunePatches(t) {
    const e = await d(this, h, l).call(this), o = p(e, ["patches"], "readwrite").objectStore("patches"), n = IDBKeyRange.bound(
      [r(this, i), 0],
      [r(this, i), t - 1]
    );
    await new Promise((u, y) => {
      const S = o.openCursor(n);
      S.onsuccess = () => {
        const b = S.result;
        if (b === null) {
          u();
          return;
        }
        b.delete(), b.continue();
      }, S.onerror = () => {
        y(S.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(t) {
    const e = await d(this, h, l).call(this), a = p(e, ["values"], "readonly"), o = await c(
      a.objectStore("values").get(t)
    );
    return o != null ? o.data : void 0;
  }
  /**** saveValue ****/
  async saveValue(t, e) {
    const a = await d(this, h, l).call(this), n = p(a, ["values"], "readwrite").objectStore("values"), u = await c(
      n.get(t)
    );
    u != null ? await c(
      n.put({ hash: t, data: u.data, ref_count: u.ref_count + 1 })
    ) : await c(
      n.put({ hash: t, data: e, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(t) {
    const e = await d(this, h, l).call(this), o = p(e, ["values"], "readwrite").objectStore("values"), n = await c(
      o.get(t)
    );
    if (n == null)
      return;
    const u = n.ref_count - 1;
    u <= 0 ? await c(o.delete(t)) : await c(
      o.put({ hash: t, data: n.data, ref_count: u })
    );
  }
  /**** close ****/
  async close() {
    var t;
    (t = r(this, w)) == null || t.close(), x(this, w, void 0);
  }
}
w = new WeakMap(), i = new WeakMap(), B = new WeakMap(), h = new WeakSet(), l = async function() {
  return r(this, w) != null ? r(this, w) : new Promise((t, e) => {
    const a = indexedDB.open(r(this, B), 1);
    a.onupgradeneeded = (o) => {
      const n = o.target.result;
      n.objectStoreNames.contains("snapshots") || n.createObjectStore("snapshots", { keyPath: "storeId" }), n.objectStoreNames.contains("patches") || n.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), n.objectStoreNames.contains("values") || n.createObjectStore("values", { keyPath: "hash" });
    }, a.onsuccess = (o) => {
      x(this, w, o.target.result), t(r(this, w));
    }, a.onerror = (o) => {
      e(o.target.error);
    };
  });
};
export {
  j as SDS_BrowserPersistenceProvider
};
