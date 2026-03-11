import { DatabaseSync as e } from "node:sqlite";
class c {
  #s;
  #a;
  /**** constructor ****/
  constructor(s, a) {
    this.#a = a, this.#s = new e(s), this.#s.exec("PRAGMA journal_mode = WAL"), this.#s.exec("PRAGMA synchronous = NORMAL"), this.#t();
  }
  /**** #initSchema ****/
  #t() {
    this.#s.exec(`
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
  //                           SDS_PersistenceProvider                          //
  //----------------------------------------------------------------------------//
  /**** loadSnapshot ****/
  async loadSnapshot() {
    return this.#s.prepare("SELECT data FROM snapshots WHERE store_id = ?").get(this.#a)?.data;
  }
  /**** saveSnapshot ****/
  async saveSnapshot(s) {
    this.#s.prepare(
      "INSERT INTO snapshots (store_id, data, clock) VALUES (?,?,?) ON CONFLICT(store_id) DO UPDATE SET data=excluded.data, clock=excluded.clock"
    ).run(this.#a, s, Date.now());
  }
  /**** loadPatchesSince ****/
  async loadPatchesSince(s) {
    return this.#s.prepare("SELECT data FROM patches WHERE store_id = ? AND clock > ? ORDER BY clock ASC").all(this.#a, s).map((t) => t.data);
  }
  /**** appendPatch ****/
  async appendPatch(s, a) {
    this.#s.prepare(
      "INSERT OR IGNORE INTO patches (store_id, clock, data) VALUES (?,?,?)"
    ).run(this.#a, a, s);
  }
  /**** prunePatches ****/
  async prunePatches(s) {
    this.#s.prepare("DELETE FROM patches WHERE store_id = ? AND clock < ?").run(this.#a, s);
  }
  /**** loadValue ****/
  async loadValue(s) {
    return this.#s.prepare("SELECT data FROM blobs WHERE hash = ?").get(s)?.data;
  }
  /**** saveValue ****/
  async saveValue(s, a) {
    this.#s.prepare(
      "INSERT INTO blobs (hash, data, ref_count) VALUES (?,?,1) ON CONFLICT(hash) DO UPDATE SET ref_count = ref_count + 1"
    ).run(s, a);
  }
  /**** releaseValue ****/
  async releaseValue(s) {
    this.#s.prepare("UPDATE blobs SET ref_count = ref_count - 1 WHERE hash = ?").run(s), this.#s.prepare("DELETE FROM blobs WHERE hash = ? AND ref_count <= 0").run(s);
  }
  /**** close ****/
  async close() {
    this.#s.close();
  }
}
export {
  c as SDS_DesktopPersistenceProvider
};
