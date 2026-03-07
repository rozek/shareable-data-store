/*******************************************************************************
*                                                                              *
*                          SNS Persistence Browser                             *
*                                                                              *
*******************************************************************************/

// IndexedDB-backed SNS_PersistenceProvider for browser environments.
//
// IndexedDB object stores (all within one database named 'sns:<storeId>'):
//
//   snapshots   keyPath: 'storeId'
//               { storeId:string, data:Uint8Array, clock:number }
//
//   patches     keyPath: ['storeId','clock']
//               { storeId:string, clock:number, data:Uint8Array }
//
//   values      keyPath: 'hash'
//               { hash:string, data:Uint8Array, ref_count:number }

import type { SNS_PersistenceProvider, SNS_PatchSeqNumber } from '@rozek/sns-core'

//----------------------------------------------------------------------------//
//                       Helper — IndexedDB promisification                   //
//----------------------------------------------------------------------------//

  function IndexedDBRequest<T> (Req:IDBRequest<T>):Promise<T> {
    return new Promise<T>((resolve, reject) => {
      Req.onsuccess = () => { resolve(Req.result) }
      Req.onerror   = () => { reject(Req.error)  }
    })
  }

  function IndexedDBTransaction (
    DB:IDBDatabase, Stores:string[], Mode:IDBTransactionMode
  ):IDBTransaction {
    return DB.transaction(Stores, Mode)
  }

//----------------------------------------------------------------------------//
//                        SNS_BrowserPersistenceProvider                      //
//----------------------------------------------------------------------------//

export class SNS_BrowserPersistenceProvider implements SNS_PersistenceProvider {
  #DB:     IDBDatabase | undefined = undefined
  #StoreId:string
  #DBName: string

/**** constructor ****/

  constructor (StoreId:string) {
    this.#StoreId = StoreId
    this.#DBName  = `sns:${StoreId}`
  }

/**** #open — lazily open DB ****/

  async #open ():Promise<IDBDatabase> {
    if (this.#DB != null) { return this.#DB }
    return new Promise<IDBDatabase>((resolve, reject) => {
      const Req = indexedDB.open(this.#DBName, 1)
      Req.onupgradeneeded = (Event) => {
        const DB = (Event.target as IDBOpenDBRequest).result

        if (! DB.objectStoreNames.contains('snapshots')) {
          DB.createObjectStore('snapshots', { keyPath:'storeId' })
        }
        if (! DB.objectStoreNames.contains('patches')) {
          DB.createObjectStore('patches', { keyPath:['storeId','clock'] })
        }
        if (! DB.objectStoreNames.contains('values')) {
          DB.createObjectStore('values', { keyPath:'hash' })
        }
      }
      Req.onsuccess = (Event) => {
        this.#DB = (Event.target as IDBOpenDBRequest).result
        resolve(this.#DB)
      }
      Req.onerror = (Event) => {
        reject((Event.target as IDBOpenDBRequest).error)
      }
    })
  }

//----------------------------------------------------------------------------//
//                           SNS_PersistenceProvider                          //
//----------------------------------------------------------------------------//

/**** loadSnapshot ****/

  async loadSnapshot ():Promise<Uint8Array | undefined> {
    const DB  = await this.#open()
    const Tx  = IndexedDBTransaction(DB, ['snapshots'], 'readonly')
    const Row = await IndexedDBRequest<{ storeId:string; data:Uint8Array; clock:number } | undefined>(
      Tx.objectStore('snapshots').get(this.#StoreId)
    )
    return Row != null ? Row.data : undefined
  }

/**** saveSnapshot ****/

  async saveSnapshot (Data:Uint8Array):Promise<void> {
    const DB = await this.#open()
    const Tx = IndexedDBTransaction(DB, ['snapshots'], 'readwrite')
    await IndexedDBRequest<IDBValidKey>(
      Tx.objectStore('snapshots').put({
        storeId: this.#StoreId,
        data:    Data,
        clock:   Date.now(),
      })
    )
  }

/**** loadPatchesSince ****/

  async loadPatchesSince (SeqNumber:SNS_PatchSeqNumber):Promise<Uint8Array[]> {
    const DB     = await this.#open()
    const Tx     = IndexedDBTransaction(DB, ['patches'], 'readonly')
    const Store  = Tx.objectStore('patches')
    const Range  = IDBKeyRange.bound(
      [this.#StoreId, SeqNumber+1],
      [this.#StoreId, Number.MAX_SAFE_INTEGER]
    )
    const Rows   = await IndexedDBRequest<Array<{ storeId:string; clock:number; data:Uint8Array }>>(
      Store.getAll(Range)
    )
    return Rows.sort((RowA, RowB) => RowA.clock - RowB.clock).map((Row) => Row.data)
  }

/**** appendPatch ****/

  async appendPatch (Patch:Uint8Array, SeqNumber:SNS_PatchSeqNumber):Promise<void> {
    const DB  = await this.#open()
    const Tx  = IndexedDBTransaction(DB, ['patches'], 'readwrite')
    // add() throws if key already exists — that is the desired behaviour (ignore duplicate)
    try {
      await IndexedDBRequest<IDBValidKey>(
        Tx.objectStore('patches').add({
          storeId: this.#StoreId,
          clock:   SeqNumber,
          data:    Patch,
        })
      )
    } catch (_Signal) { /* duplicate seq — ignore */ }
  }

/**** prunePatches ****/

  async prunePatches (beforeSeqNumber:SNS_PatchSeqNumber):Promise<void> {
    const DB    = await this.#open()
    const Tx    = IndexedDBTransaction(DB, ['patches'], 'readwrite')
    const Store = Tx.objectStore('patches')
    const Range = IDBKeyRange.bound(
      [this.#StoreId, 0],
      [this.#StoreId, beforeSeqNumber-1]
    )
    await new Promise<void>((resolve, reject) => {
      const Req = Store.openCursor(Range)
      Req.onsuccess = () => {
        const IDBCursor = Req.result
        if (IDBCursor === null) { resolve(); return }
        IDBCursor.delete()
        IDBCursor.continue()
      }
      Req.onerror = () => { reject(Req.error) }
    })
  }

/**** loadValue ****/

  async loadValue (ValueHash:string):Promise<Uint8Array | undefined> {
    const DB  = await this.#open()
    const Tx  = IndexedDBTransaction(DB, ['values'], 'readonly')
    const Row = await IndexedDBRequest<{ hash:string; data:Uint8Array; ref_count:number } | undefined>(
      Tx.objectStore('values').get(ValueHash)
    )
    return Row != null ? Row.data : undefined
  }

/**** saveValue ****/

  async saveValue (ValueHash:string, Data:Uint8Array):Promise<void> {
    const DB    = await this.#open()
    const Tx    = IndexedDBTransaction(DB, ['values'], 'readwrite')
    const Store = Tx.objectStore('values')
    const Existing = await IndexedDBRequest<{ hash:string; data:Uint8Array; ref_count:number } | undefined>(
      Store.get(ValueHash)
    )
    if (Existing != null) {
      await IndexedDBRequest<IDBValidKey>(
        Store.put({ hash:ValueHash, data:Existing.data, ref_count:Existing.ref_count+1 })
      )
    } else {
      await IndexedDBRequest<IDBValidKey>(
        Store.put({ hash:ValueHash, data:Data, ref_count:1 })
      )
    }
  }

/**** releaseValue ****/

  async releaseValue (ValueHash:string):Promise<void> {
    const DB    = await this.#open()
    const Tx    = IndexedDBTransaction(DB, ['values'], 'readwrite')
    const Store = Tx.objectStore('values')
    const Existing = await IndexedDBRequest<{ hash:string; data:Uint8Array; ref_count:number } | undefined>(
      Store.get(ValueHash)
    )
    if (Existing == null) { return }
    const NewCount = Existing.ref_count - 1
    if (NewCount <= 0) {
      await IndexedDBRequest<undefined>(Store.delete(ValueHash))
    } else {
      await IndexedDBRequest<IDBValidKey>(
        Store.put({ hash:ValueHash, data:Existing.data, ref_count:NewCount })
      )
    }
  }

/**** close ****/

  async close ():Promise<void> {
    this.#DB?.close()
    this.#DB = undefined
  }
}
