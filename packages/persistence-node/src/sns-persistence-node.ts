/*******************************************************************************
*                                                                              *
*                           SNS Persistence Node                               *
*                                                                              *
*******************************************************************************/

// SQLite-backed SNS_PersistenceProvider for Node.js (and Electron).
// Uses better-sqlite3 for synchronous, high-performance access.
//
// Database schema (auto-created on first open):
//
//   CREATE TABLE snapshots (
//     store_id  TEXT    PRIMARY KEY,
//     data      BLOB    NOT NULL,
//     clock     INTEGER NOT NULL
//   );
//   CREATE TABLE patches (
//     store_id  TEXT    NOT NULL,
//     clock     INTEGER NOT NULL,
//     data      BLOB    NOT NULL,
//     PRIMARY KEY (store_id, clock)
//   );
//   CREATE TABLE blobs (
//     hash      TEXT    PRIMARY KEY,
//     data      BLOB    NOT NULL,
//     ref_count INTEGER NOT NULL DEFAULT 0
//   );

import Database from 'better-sqlite3'
import type { SNS_PersistenceProvider, SNS_PatchSeqNumber } from '@rozek/sns-core'

//----------------------------------------------------------------------------//
//                       SNS_DesktopPersistenceProvider                       //
//----------------------------------------------------------------------------//

export class SNS_DesktopPersistenceProvider implements SNS_PersistenceProvider {
  #DB:     Database.Database
  #StoreId:string

/**** constructor ****/

  constructor (DbPath:string, StoreId:string) {
    this.#StoreId = StoreId
    this.#DB      = new Database(DbPath)
    this.#DB.pragma('journal_mode = WAL')
    this.#DB.pragma('synchronous = NORMAL')
    this.#initSchema()
  }

/**** #initSchema ****/

  #initSchema ():void {
    this.#DB.exec(`
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
    `)
  }

//----------------------------------------------------------------------------//
//                           SNS_PersistenceProvider                          //
//----------------------------------------------------------------------------//

/**** loadSnapshot ****/

  async loadSnapshot ():Promise<Uint8Array | undefined> {
    const Row = this.#DB
      .prepare('SELECT data FROM snapshots WHERE store_id = ?')
      .get(this.#StoreId) as { data:Buffer } | undefined
    return Row != null ? new Uint8Array(Row.data) : undefined
  }

/**** saveSnapshot ****/

  async saveSnapshot (Data:Uint8Array):Promise<void> {
    this.#DB
      .prepare(
        'INSERT INTO snapshots (store_id, data, clock) VALUES (?,?,?) ' +
        'ON CONFLICT(store_id) DO UPDATE SET data=excluded.data, clock=excluded.clock'
      )
      .run(this.#StoreId, Buffer.from(Data), Date.now())
  }

/**** loadPatchesSince ****/

  async loadPatchesSince (SeqNumber:SNS_PatchSeqNumber):Promise<Uint8Array[]> {
    const Rows = this.#DB
      .prepare('SELECT data FROM patches WHERE store_id = ? AND clock > ? ORDER BY clock ASC')
      .all(this.#StoreId, SeqNumber) as { data:Buffer }[]
    return Rows.map((Row) => new Uint8Array(Row.data))
  }

/**** appendPatch ****/

  async appendPatch (Patch:Uint8Array, SeqNumber:SNS_PatchSeqNumber):Promise<void> {
    this.#DB
      .prepare(
        'INSERT OR IGNORE INTO patches (store_id, clock, data) VALUES (?,?,?)'
      )
      .run(this.#StoreId, SeqNumber, Buffer.from(Patch))
  }

/**** prunePatches ****/

  async prunePatches (beforeSeqNumber:SNS_PatchSeqNumber):Promise<void> {
    this.#DB
      .prepare('DELETE FROM patches WHERE store_id = ? AND clock < ?')
      .run(this.#StoreId, beforeSeqNumber)
  }

/**** loadValue ****/

  async loadValue (ValueHash:string):Promise<Uint8Array | undefined> {
    const Row = this.#DB
      .prepare('SELECT data FROM blobs WHERE hash = ?')
      .get(ValueHash) as { data:Buffer } | undefined
    return Row != null ? new Uint8Array(Row.data) : undefined
  }

/**** saveValue ****/

  async saveValue (ValueHash:string, Data:Uint8Array):Promise<void> {
    this.#DB
      .prepare(
        'INSERT INTO blobs (hash, data, ref_count) VALUES (?,?,1) ' +
        'ON CONFLICT(hash) DO UPDATE SET ref_count = ref_count + 1'
      )
      .run(ValueHash, Buffer.from(Data))
  }

/**** releaseValue ****/

  async releaseValue (ValueHash:string):Promise<void> {
    this.#DB
      .prepare('UPDATE blobs SET ref_count = ref_count - 1 WHERE hash = ?')
      .run(ValueHash)
    this.#DB
      .prepare('DELETE FROM blobs WHERE hash = ? AND ref_count <= 0')
      .run(ValueHash)
  }

/**** close ****/

  async close ():Promise<void> {
    this.#DB.close()
  }
}
