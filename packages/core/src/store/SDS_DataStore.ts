/*******************************************************************************
*                                                                              *
*        SDS_DataStore — abstract base class for all store backends            *
*                                                                              *
*******************************************************************************/

// this abstract class defines the complete API that every SDS backend must
// implement, and provides concrete implementations for all methods whose
// logic is identical across backends (i.e. those that are expressed purely
// in terms of other abstract methods and therefore carry no CRDT-specific
// state).  backend packages only need to implement what is genuinely
// backend-specific.

import { RootId }              from './SDS_Constants.js'
import { SDS_Error }           from '../error/SDS_Error.js'
import type { SDS_SyncCursor } from '../interfaces/SDS_PersistenceProvider.js'
import type { SDS_ChangeSet }  from '../changeset/SDS_ChangeSet.js'
import type { SDS_Entry }      from './SDS_Entry.js'
import type { SDS_Item }       from './SDS_Item.js'
import type { SDS_Link }       from './SDS_Link.js'

/**** SDS_LinkJSON — plain-object serialisation of a link entry ****/

  export interface SDS_LinkJSON {
    Kind:     'link'
    Id:       string
    Label:    string
    TargetId: string
    Info:     Record<string,unknown>
  }

/**** SDS_ItemJSON — plain-object serialisation of an item entry (recursive) ****/

  export interface SDS_ItemJSON {
    Kind:         'item'
    Id:           string
    Label:        string
    Type:         string
    ValueKind:    'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending'
    Value?:       string          // literal string  OR  base64-encoded Uint8Array
    Info:         Record<string,unknown>
    innerEntries: SDS_EntryJSON[]
  }

/**** SDS_EntryJSON — union of item and link JSON representations ****/

  export type SDS_EntryJSON = SDS_ItemJSON | SDS_LinkJSON

/**** _UInt8ArrayToBase64 / _Base64ToUint8Array — shared base64 helpers ****/

  export function _UInt8ArrayToBase64 (Bytes:Uint8Array):string {
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) { return NodeBuffer.from(Bytes).toString('base64') }

    let Binary = ''
      for (let i = 0; i < Bytes.byteLength; i++) { Binary += String.fromCharCode(Bytes[i]) }
    return btoa(Binary)
  }

  export function _Base64ToUint8Array (base64:string):Uint8Array {
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) { return new Uint8Array(NodeBuffer.from(base64, 'base64')) }

    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  }

/**** ChangeOrigin / ChangeHandler — types shared by all backends and consumers ****/

  export type ChangeOrigin  = 'internal' | 'external'
  export type ChangeHandler = (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet) => void

/**** SDS_DataStoreOptions — construction options shared by all backends ****/

  export interface SDS_DataStoreOptions {
    LiteralSizeLimit?:number

    // time in milliseconds after which entries that have been moved to TrashItem
    // are automatically purged — protected entries (those with incoming links from
    // the root-reachable tree) are silently skipped.
    // defaults to 30 days (2 592 000 000 ms); set to 0 to disable auto-purge.
    TrashTTLms?:number

    // how often the auto-purge check runs, in milliseconds.
    // defaults to min(TrashTTLms / 4, 3 600 000).
    TrashCheckIntervalMs?:number

    // [json-joy backend only] called whenever applyRemotePatch() suppresses an
    // internal CRDT exception (caused by a known json-joy _gcTree bug).  other
    // backends (core-loro, core-yjs) never invoke this callback.  the CRDT
    // state is consistent when this fires; the callback is intended for
    // observability only (e.g. logging, diagnostics) — not for error recovery.
    onApplyPatchError?: (Error:unknown) => void
  }

export abstract class SDS_DataStore {

//----------------------------------------------------------------------------//
//                          Large-value blob store                            //
//----------------------------------------------------------------------------//

// in-memory map holding large-value blobs (those with ValueKind
// '*-reference'). Written by backends on writeValue and by the SyncEngine when
// a blob arrives from the network or is loaded from persistence.

  #ValueBlobs:Map<string,Uint8Array> = new Map()

// optional async loader injected by SDS_SyncEngine so that _readValueOf can
// transparently fetch blobs from the persistence layer on demand.
  #ValueBlobLoader:
    ((Hash:string) => Promise<Uint8Array | undefined>) | undefined = undefined

/**** _BLOBhash — FNV-1a 32-bit content hash used as blob identity key ****/

  protected static _BLOBhash (Data:Uint8Array):string {
    let h = 0x811c9dc5
    for (let i = 0; i < Data.length; i++) {
      h = Math.imul(h ^ Data[i], 0x01000193) >>> 0
    }
    return `fnv1a-${h.toString(16).padStart(8,'0')}-${Data.length}`
  }

/**** _storeValueBlob — cache a blob (called by backends on write) ****/

  protected _storeValueBlob (Hash:string, Blob:Uint8Array):void {
    this.#ValueBlobs.set(Hash, Blob)
  }

/**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/

  protected async _getValueBlobAsync (Hash:string):Promise<Uint8Array | undefined> {
    let Blob = this.#ValueBlobs.get(Hash)
    if (Blob == undefined && this.#ValueBlobLoader != undefined) {
      Blob = await this.#ValueBlobLoader(Hash)
      if (Blob != undefined) { this.#ValueBlobs.set(Hash, Blob) }
    }
    return Blob
  }

/**** storeValueBlob — public entry point for SyncEngine ****/

  storeValueBlob (Hash:string, Blob:Uint8Array):void {
    this.#ValueBlobs.set(Hash, Blob)
  }

/**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/

  getValueBlobByHash (Hash:string):Uint8Array | undefined {
    return this.#ValueBlobs.get(Hash)
  }

/**** hasValueBlob — check whether a blob is already in the local cache ****/

  hasValueBlob (Hash:string):boolean {
    return this.#ValueBlobs.has(Hash)
  }

/**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/

  setValueBlobLoader (
    Loader:(Hash:string) => Promise<Uint8Array | undefined>
  ):void {
    this.#ValueBlobLoader = Loader
  }

/**** _getValueRefOf — return the { Hash, Size } ref for entries with *-reference ValueKind ****/

  abstract _getValueRefOf (Id:string):{ Hash:string; Size:number } | undefined

//----------------------------------------------------------------------------//
//                             Well-known items                               //
//----------------------------------------------------------------------------//

/**** RootItem — the invisible root of the entry tree ****/

  abstract get RootItem ():SDS_Item

/**** TrashItem — container for soft-deleted entries ****/

  abstract get TrashItem ():SDS_Item

/**** LostAndFoundItem — container for orphaned entries recovered after sync ****/

  abstract get LostAndFoundItem ():SDS_Item

//----------------------------------------------------------------------------//
//                                   Lookup                                   //
//----------------------------------------------------------------------------//

/**** EntryWithId — retrieve an entry by its unique Id, or undefined ****/

  abstract EntryWithId (EntryId:string):SDS_Entry | undefined

//----------------------------------------------------------------------------//
//                                  Factory                                   //
//----------------------------------------------------------------------------//

/**** newItemAt — create a new item of given type as a direct inner entry of outerItem ****/

  abstract newItemAt (MIMEType:string|undefined, outerItem:SDS_Item, InsertionIndex?:number):SDS_Item

/**** newLinkAt — create a new link pointing at Target inside outerItem ****/

  abstract newLinkAt (Target:SDS_Item, outerItem:SDS_Item, InsertionIndex?:number):SDS_Link

//----------------------------------------------------------------------------//
//                                   Import                                   //
//----------------------------------------------------------------------------//

/**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/

  newEntryFromJSONat (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Entry {
    const JSON_ = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation as string)
      : Serialisation) as { Kind?:string }
    switch (true) {
      case (JSON_?.Kind === 'item'): return this.deserializeItemInto(JSON_, outerItem, InsertionIndex)
      case (JSON_?.Kind === 'link'): return this.deserializeLinkInto(JSON_, outerItem, InsertionIndex)
      default: throw new SDS_Error('invalid-argument','Serialisation must be an SDS_EntryJSON object')
    }
  }

/**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) from binary ****/

  abstract newEntryFromBinaryAt (
    Serialisation:Uint8Array, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Entry

/**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/

  abstract deserializeItemInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Item

/**** deserializeLinkInto — import a serialised link; always remaps its Id ****/

  abstract deserializeLinkInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Link

//----------------------------------------------------------------------------//
//                               Move / Delete                                //
//----------------------------------------------------------------------------//

/**** EntryMayBeMovedTo — true when moving Entry into outerItem at InsertionIndex is allowed ****/

  EntryMayBeMovedTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):boolean {
    return this._mayMoveEntryTo(Entry.Id, outerItem.Id, InsertionIndex)
  }

/**** moveEntryTo — move Entry to outerItem at InsertionIndex ****/

  abstract moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):void

/**** EntryMayBeDeleted — true when Entry can be moved to the trash ****/

  EntryMayBeDeleted (Entry:SDS_Entry):boolean {
    return this._mayDeleteEntry(Entry.Id)
  }

/**** deleteEntry — move Entry to TrashItem and record deletion timestamp ****/

  abstract deleteEntry (Entry:SDS_Entry):void

/**** purgeEntry — permanently remove Entry and its subtree ****/

  abstract purgeEntry (Entry:SDS_Entry):void

//----------------------------------------------------------------------------//
//                           Trash TTL / Auto-Purge                           //
//----------------------------------------------------------------------------//

/**** purgeExpiredTrashEntries — remove all trash entries whose TTL has elapsed ****/

  abstract purgeExpiredTrashEntries (TTLms?:number):number

//----------------------------------------------------------------------------//
//                            OrderKey Management                             //
//----------------------------------------------------------------------------//

/**** rebalanceInnerEntriesOf — reassign fresh, evenly-spaced OrderKeys to all direct inner entries ****/

  rebalanceInnerEntriesOf (item:SDS_Item):void {
    this.transact(() => this._rebalanceInnerEntriesOf(item.Id))
  }

/**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/

  protected abstract _rebalanceInnerEntriesOf (outerItemId:string):void

//----------------------------------------------------------------------------//
//                           Transactions & Events                            //
//----------------------------------------------------------------------------//

/**** transact — execute Callback inside a batched, atomic transaction ****/

  abstract transact (Callback:() => void):void

/**** onChangeInvoke — register Handler as a change listener; returns an unsubscribe function ****/

  abstract onChangeInvoke (Handler:ChangeHandler):() => void

//----------------------------------------------------------------------------//
//                                  Lifecycle                                 //
//----------------------------------------------------------------------------//

/**** dispose — release timers and other resources held by the store ****/

  abstract dispose ():void

//----------------------------------------------------------------------------//
//                                    Sync                                    //
//----------------------------------------------------------------------------//

/**** currentCursor — opaque cursor representing the current CRDT state ****/

  abstract get currentCursor ():SDS_SyncCursor

/**** exportPatch — encode all changes since sinceCursor; full snapshot when omitted ****/

  abstract exportPatch (sinceCursor?:SDS_SyncCursor):Uint8Array

/**** applyRemotePatch — integrate a patch received from a remote peer ****/

  abstract applyRemotePatch (encodedPatch:Uint8Array):void

//----------------------------------------------------------------------------//
//                               Serialisation                                //
//----------------------------------------------------------------------------//

/**** asBinary — serialise the entire store as a compressed binary snapshot ****/

  abstract asBinary ():Uint8Array

/**** asJSON — serialise the full store tree as a plain, human-readable JSON object ****/

  asJSON ():SDS_ItemJSON {
    return this._EntryAsJSON(RootId) as SDS_ItemJSON
  }

/**** recoverOrphans — move entries with missing parents into LostAndFoundItem ****/

  abstract recoverOrphans ():void

//----------------------------------------------------------------------------//
//               Package-internal API — used by SDS_Entry / Item / Link      //
//----------------------------------------------------------------------------//

/**** _KindOf — return the Kind ('item' | 'link') of the entry with the given Id ****/

  abstract _KindOf (Id:string):'item' | 'link'

/**** _LabelOf — return the current label text of the entry with the given Id ****/

  abstract _LabelOf (Id:string):string

/**** _setLabelOf — update the label text of the entry with the given Id ****/

  abstract _setLabelOf (Id:string, Value:string):void

/**** _TypeOf — return the MIME type of the item with the given Id ****/

  abstract _TypeOf (Id:string):string

/**** _setTypeOf — update the MIME type of the item with the given Id ****/

  abstract _setTypeOf (Id:string, Value:string):void

/**** _ValueKindOf — return the value kind of the item with the given Id ****/

  abstract _ValueKindOf (Id:string):
    'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending'

/**** _isLiteralOf — true when the item stores an inline literal string ****/

  _isLiteralOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return (Kind === 'literal') || (Kind === 'literal-reference')
  }

/**** _isBinaryOf — true when the item stores inline binary data ****/

  _isBinaryOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return (Kind === 'binary') || (Kind === 'binary-reference')
  }

/**** _readValueOf — resolve and return the item's current value ****/

  abstract _readValueOf (Id:string):Promise<string | Uint8Array | undefined>

/**** _writeValueOf — replace the item's stored value ****/

  abstract _writeValueOf (Id:string, Value:string | Uint8Array | undefined):void

/**** _spliceValueOf — replace a character range inside a literal value ****/

  abstract _spliceValueOf (Id:string, fromIndex:number, toIndex:number, Replacement:string):void

/**** _InfoProxyOf — return a Proxy giving key/value access to the Info metadata ****/

  abstract _InfoProxyOf (Id:string):Record<string,unknown>

/**** _outerItemOf — return the direct outer item of the entry with the given Id ****/

  _outerItemOf (Id:string):SDS_Item | undefined {
    const outerId = this._outerItemIdOf(Id)
    return outerId == null ? undefined : this.EntryWithId(outerId) as SDS_Item | undefined
  }

/**** _outerItemIdOf — return the Id of the direct outer item ****/

  abstract _outerItemIdOf (Id:string):string | undefined

/**** _outerItemChainOf — return the full ancestor chain from direct outer to root ****/

  _outerItemChainOf (Id:string):SDS_Item[] {
    const Result:SDS_Item[] = []
    let currentId:string | undefined = this._outerItemIdOf(Id)
    while (currentId != null) {
      Result.push(this.EntryWithId(currentId) as SDS_Item)
      if (currentId === RootId) { break }
      currentId = this._outerItemIdOf(currentId)
    }
    return Result
  }

/**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/

  _outerItemIdsOf (Id:string):string[] {
    return this._outerItemChainOf(Id).map((Item) => Item.Id)
  }

/**** _innerEntriesOf — return the direct inner entries sorted by OrderKey ****/

  abstract _innerEntriesOf (DataId:string):SDS_Entry[]

/**** _mayMoveEntryTo — false when moving Id into outerItemId would create a cycle ****/

  abstract _mayMoveEntryTo (Id:string, outerItemId:string, InsertionIndex?:number):boolean

/**** _mayDeleteEntry — false for the three well-known system items ****/

  abstract _mayDeleteEntry (Id:string):boolean

/**** _TargetOf — return the link target item for the link with the given Id ****/

  abstract _TargetOf (Id:string):SDS_Item

/**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/

  abstract _currentValueOf (Id:string):string | Uint8Array | undefined

/**** _EntryAsBinary — gzip-compress the JSON representation of an entry and its subtree ****/

  abstract _EntryAsBinary (Id:string):Uint8Array

/**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/

  _EntryAsJSON (Id:string):SDS_EntryJSON {
    const Kind  = this._KindOf(Id)
    const Label = this._LabelOf(Id)

    const InfoProxy = this._InfoProxyOf(Id)
    const Info:Record<string,unknown> = {}
    for (const Key of Object.keys(InfoProxy)) { Info[Key] = InfoProxy[Key] }

    if (Kind === 'link') {
      const TargetId = this._TargetOf(Id).Id
      return { Kind:'link', Id, Label, TargetId, Info }
    }

    const Type      = this._TypeOf(Id)
    const ValueKind = this._ValueKindOf(Id)
    const Result:SDS_ItemJSON = { Kind:'item', Id, Label, Type, ValueKind, Info, innerEntries:[] }

    if (ValueKind === 'literal' || ValueKind === 'binary') {
      const RawValue = this._currentValueOf(Id)
      if (RawValue !== undefined) {
        Result.Value = typeof RawValue === 'string'
          ? RawValue
          : _UInt8ArrayToBase64(RawValue)
      }
    }

    Result.innerEntries = Array.from(this._innerEntriesOf(Id))
      .map((Entry) => this._EntryAsJSON(Entry.Id))

    return Result
  }
}
