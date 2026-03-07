import e from "better-sqlite3";
class E {
  #a;
  #s;
  /**** constructor ****/
  constructor(a, s) {
    this.#s = s, this.#a = new e(a), this.#a.pragma("journal_mode = WAL"), this.#a.pragma("synchronous = NORMAL"), this.#t();
  }
  /**** #initSchema ****/
  #t() {
    this.#a.exec(`
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
    const a = this.#a.prepare("SELECT data FROM snapshots WHERE store_id = ?").get(this.#s);
    return a != null ? new Uint8Array(a.data) : null;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(a) {
    this.#a.prepare(
      "INSERT INTO snapshots (store_id, data, clock) VALUES (?,?,?) ON CONFLICT(store_id) DO UPDATE SET data=excluded.data, clock=excluded.clock"
    ).run(this.#s, Buffer.from(a), Date.now());
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(a) {
    return this.#a.prepare("SELECT data FROM patches WHERE store_id = ? AND clock > ? ORDER BY clock ASC").all(this.#s, a).map((t) => new Uint8Array(t.data));
  }
  /**** appendPatch ****/
  async appendPatch(a, s) {
    this.#a.prepare(
      "INSERT OR IGNORE INTO patches (store_id, clock, data) VALUES (?,?,?)"
    ).run(this.#s, s, Buffer.from(a));
  }
  /**** prunePatches ****/
  async prunePatches(a) {
    this.#a.prepare("DELETE FROM patches WHERE store_id = ? AND clock < ?").run(this.#s, a);
  }
  /**** loadValue ****/
  async loadValue(a) {
    const s = this.#a.prepare("SELECT data FROM blobs WHERE hash = ?").get(a);
    return s != null ? new Uint8Array(s.data) : null;
  }
  /**** saveValue ****/
  async saveValue(a, s) {
    this.#a.prepare(
      "INSERT INTO blobs (hash, data, ref_count) VALUES (?,?,1) ON CONFLICT(hash) DO UPDATE SET ref_count = ref_count + 1"
    ).run(a, Buffer.from(s));
  }
  /**** releaseValue ****/
  async releaseValue(a) {
    this.#a.prepare("UPDATE blobs SET ref_count = ref_count - 1 WHERE hash = ?").run(a), this.#a.prepare("DELETE FROM blobs WHERE hash = ? AND ref_count <= 0").run(a);
  }
  /**** close ****/
  async close() {
    this.#a.close();
  }
}
export {
  E as SNS_DesktopPersistenceProvider
};
