var f = (s) => {
  throw TypeError(s);
};
var D = (s, t, e) => t.has(s) || f("Cannot " + e);
var r = (s, t, e) => (D(s, t, "read from private field"), e ? e.call(s) : t.get(s)), y = (s, t, e) => t.has(s) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), g = (s, t, e, a) => (D(s, t, "write to private field"), a ? a.call(s, e) : t.set(s, e), e), h = (s, t, e) => (D(s, t, "access private method"), e);
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
var w, i, x, u, d;
class T {
  /**** constructor ****/
  constructor(t) {
    y(this, u);
    y(this, w, null);
    y(this, i);
    y(this, x);
    g(this, i, t), g(this, x, `sns:${t}`);
  }
  //----------------------------------------------------------------------------//
  //                           SNS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    const t = await h(this, u, d).call(this), e = p(t, ["snapshots"], "readonly"), a = await c(
      e.objectStore("snapshots").get(r(this, i))
    );
    return a != null ? a.data : null;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(t) {
    const e = await h(this, u, d).call(this), a = p(e, ["snapshots"], "readwrite");
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
    const e = await h(this, u, d).call(this), o = p(e, ["patches"], "readonly").objectStore("patches"), n = IDBKeyRange.bound(
      [r(this, i), t + 1],
      [r(this, i), Number.MAX_SAFE_INTEGER]
    );
    return (await c(
      o.getAll(n)
    )).sort((b, S) => b.clock - S.clock).map((b) => b.data);
  }
  /**** appendPatch ****/
  async appendPatch(t, e) {
    const a = await h(this, u, d).call(this), o = p(a, ["patches"], "readwrite");
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
    const e = await h(this, u, d).call(this), o = p(e, ["patches"], "readwrite").objectStore("patches"), n = IDBKeyRange.bound(
      [r(this, i), 0],
      [r(this, i), t - 1]
    );
    await new Promise((l, b) => {
      const S = o.openCursor(n);
      S.onsuccess = () => {
        const B = S.result;
        if (B == null) {
          l();
          return;
        }
        B.delete(), B.continue();
      }, S.onerror = () => {
        b(S.error);
      };
    });
  }
  /**** loadValue ****/
  async loadValue(t) {
    const e = await h(this, u, d).call(this), a = p(e, ["values"], "readonly"), o = await c(
      a.objectStore("values").get(t)
    );
    return o != null ? o.data : null;
  }
  /**** saveValue ****/
  async saveValue(t, e) {
    const a = await h(this, u, d).call(this), n = p(a, ["values"], "readwrite").objectStore("values"), l = await c(
      n.get(t)
    );
    l != null ? await c(
      n.put({ hash: t, data: l.data, ref_count: l.ref_count + 1 })
    ) : await c(
      n.put({ hash: t, data: e, ref_count: 1 })
    );
  }
  /**** releaseValue ****/
  async releaseValue(t) {
    const e = await h(this, u, d).call(this), o = p(e, ["values"], "readwrite").objectStore("values"), n = await c(
      o.get(t)
    );
    if (n == null)
      return;
    const l = n.ref_count - 1;
    l <= 0 ? await c(o.delete(t)) : await c(
      o.put({ hash: t, data: n.data, ref_count: l })
    );
  }
  /**** close ****/
  async close() {
    var t;
    (t = r(this, w)) == null || t.close(), g(this, w, null);
  }
}
w = new WeakMap(), i = new WeakMap(), x = new WeakMap(), u = new WeakSet(), d = async function() {
  return r(this, w) != null ? r(this, w) : new Promise((t, e) => {
    const a = indexedDB.open(r(this, x), 1);
    a.onupgradeneeded = (o) => {
      const n = o.target.result;
      n.objectStoreNames.contains("snapshots") || n.createObjectStore("snapshots", { keyPath: "storeId" }), n.objectStoreNames.contains("patches") || n.createObjectStore("patches", { keyPath: ["storeId", "clock"] }), n.objectStoreNames.contains("values") || n.createObjectStore("values", { keyPath: "hash" });
    }, a.onsuccess = (o) => {
      g(this, w, o.target.result), t(r(this, w));
    }, a.onerror = (o) => {
      e(o.target.error);
    };
  });
};
export {
  T as SNS_BrowserPersistenceProvider
};
