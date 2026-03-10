/*******************************************************************************
*                                                                              *
*       SDS_DataStore - wraps a Y.js CRDT Doc without exposing it              *
*                                                                              *
*******************************************************************************/

// Y.js data model (all inside one Y.Doc):
//
//   doc.getMap('Entries')   →  Y.Map<string, Y.Map<any>>
//
//   Per-entry Y.Map fields:
//     Kind:          string           'item' | 'link'
//     outerItemId:   string           '' for the root data (no outer data)
//     OrderKey:      string           fractional-indexing key
//     Label:         Y.Text           collaborative string
//     Info:          Y.Map<any>       arbitrary metadata
//     MIMEType:      string           (items only; '' = 'text/plain')
//     ValueKind:     string           (items only)
//     literalValue:  Y.Text           (items, ValueKind=literal only)
//     binaryValue:   Uint8Array       (items, ValueKind=binary only)
//     ValueRef:      { Hash, Size }   (items, *-reference only)
//     TargetId:      string           (links only)

import * as Y                    from 'yjs'
import { z }                     from 'zod'
import { gzipSync, gunzipSync }  from 'fflate'
import { generateKeyBetween, generateNKeysBetween }    from 'fractional-indexing'
import { SDS_Error }             from '../error/SDS_Error.js'
import {
  SDS_DataStore as SDS_StoreBase,
  _base64ToUint8Array,
  SDS_DataStoreOptions,
  SDS_Entry, SDS_Item, SDS_Link,
  maxOrderKeyLength,
  expectValidLabel, expectValidMIMEType, expectValidInfoKey, checkInfoValueSize,
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit,
  DefaultWrapperCacheSize,
} from '@rozek/sds-core'
import type { ChangeOrigin, ChangeHandler, SDS_EntryJSON, SDS_ItemJSON, SDS_LinkJSON } from '@rozek/sds-core'
import type { SDS_ChangeSet }  from '../changeset/SDS_ChangeSet.js'
import type { SDS_SyncCursor } from '../interfaces/SDS_PersistenceProvider.js'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export type { ChangeOrigin, ChangeHandler, SDS_DataStoreOptions }

//----------------------------------------------------------------------------//
//                          Zod Validation Schemas                            //
//----------------------------------------------------------------------------//

  const optIndexSchema = z.number().int().nonnegative().optional()

  function parseInsertionIndex (Value:unknown):void {
    const Result = optIndexSchema.safeParse(Value)
    if (! Result.success) {
      throw new SDS_Error('invalid-argument', Result.error.issues[0]?.message ?? 'InsertionIndex must be a non-negative integer')
    }
  }

//----------------------------------------------------------------------------//
//                        Module-level JSON helpers                           //
//----------------------------------------------------------------------------//

/**** _yjsCreateEntry — recursively populate a Y.Map from an SDS_EntryJSON tree ****/

  function _yjsCreateEntry (
    JSON_:SDS_EntryJSON, outerItemId:string, orderKey:string,
    EntriesMap:Y.Map<Y.Map<any>>
  ):void {
    const Id       = JSON_.Id
    const EntryMap = new Y.Map<any>()
    EntryMap.set('Kind',        JSON_.Kind)
    EntryMap.set('outerItemId', outerItemId)
    EntryMap.set('OrderKey',    orderKey)
    EntryMap.set('Label',       new Y.Text(JSON_.Label ?? ''))
    const InfoMap = new Y.Map<any>()
    for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }
    EntryMap.set('Info', InfoMap)

    if (JSON_.Kind === 'item') {
      const ItemJSON   = JSON_ as SDS_ItemJSON
      const storedType = ItemJSON.Type === DefaultMIMEType ? '' : (ItemJSON.Type ?? '')
      EntryMap.set('MIMEType', storedType)

      switch (true) {
        case (ItemJSON.ValueKind === 'literal' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind',    'literal')
          EntryMap.set('literalValue', new Y.Text(ItemJSON.Value!))
          break
        }
        case (ItemJSON.ValueKind === 'binary' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind',   'binary')
          EntryMap.set('binaryValue', _base64ToUint8Array(ItemJSON.Value!))
          break
        }
        default:
          EntryMap.set('ValueKind', ItemJSON.ValueKind ?? 'none')
      }

      EntriesMap.set(Id, EntryMap)

      const FreshKeys = generateNKeysBetween(null, null, (ItemJSON.innerEntries ?? []).length)
      ;(ItemJSON.innerEntries ?? []).forEach((innerJSON, i) => {
        _yjsCreateEntry(innerJSON, Id, FreshKeys[i], EntriesMap)
      })
    } else {
      const LinkJSON = JSON_ as SDS_LinkJSON
      EntryMap.set('TargetId', LinkJSON.TargetId ?? '')
      EntriesMap.set(Id, EntryMap)
    }
  }

//----------------------------------------------------------------------------//
//                                SDS_DataStore                               //
//----------------------------------------------------------------------------//

export class SDS_DataStore extends SDS_StoreBase {

/**** private state ****/

  #doc:              Y.Doc
  #EntriesMap:       Y.Map<Y.Map<any>>
  #LiteralSizeLimit:number
  #TrashTTLms:       number
  #TrashCheckTimer:  ReturnType<typeof setInterval> | null = null
  #Handlers:         Set<ChangeHandler> = new Set()

  // reverse index: outerItemId → Set<entryId>
  #ReverseIndex:Map<string,Set<string>> = new Map()

  // forward index: entryId → outerItemId  (kept in sync with #ReverseIndex)
  #ForwardIndex:Map<string,string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex:Map<string,Set<string>> = new Map()

  // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
  #LinkForwardIndex:Map<string,string> = new Map()

  // LRU wrapper cache
  #WrapperCache:Map<string,SDS_Entry> = new Map()
  readonly #MaxCacheSize = DefaultWrapperCacheSize

  // transaction nesting
  #TransactionDepth = 0

  // ChangeSet accumulator inside a transaction
  #PendingChangeSet:SDS_ChangeSet = {}

  // suppress index updates / change tracking when applying remote patches
  #ApplyingExternal = false

//----------------------------------------------------------------------------//
//                               Construction                                 //
//----------------------------------------------------------------------------//

/**** constructor — initialise store from document and options ****/

  private constructor (Doc:Y.Doc, Options?:SDS_DataStoreOptions) {
    super()
    this.#doc              = Doc
    this.#EntriesMap       = Doc.getMap('Entries') as Y.Map<Y.Map<any>>
    this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit
    this.#TrashTTLms       = Options?.TrashTTLms ?? 2_592_000_000
    this.#rebuildIndices()

    const CheckIntervalMs = Options?.TrashCheckIntervalMs
      ?? Math.min(Math.floor(this.#TrashTTLms/4), 3_600_000)
    this.#TrashCheckTimer = setInterval(
      () => { this.purgeExpiredTrashEntries() },
      CheckIntervalMs
    )
    // let Node.js exit even while the timer is pending
    if (typeof (this.#TrashCheckTimer as any)?.unref === 'function') {
      (this.#TrashCheckTimer as any).unref()
    }
  }


/**** fromScratch — build initial document with three well-known items ****/

  static fromScratch (Options?:SDS_DataStoreOptions):SDS_DataStore {
  /*
   * For the Y.js backend we build the initial document from scratch by
   * creating the three well-known items with their fixed UUIDs.  Because Y.js
   * CRDT conflict resolution is deterministic (last-write-wins by logical
   * clock for map values), two independent peers calling fromScratch() will
   * converge to the same state after the first patch exchange — without
   * requiring a canonical pre-generated snapshot.
   */
    const Doc        = new Y.Doc()
    const EntriesMap = Doc.getMap('Entries') as Y.Map<Y.Map<any>>

    Doc.transact(() => {
      // root data (outermost data, no outer data)
      const Root = new Y.Map<any>()
      Root.set('Kind',        'item')
      Root.set('outerItemId', '')
      Root.set('OrderKey',    '')
      Root.set('Label',       new Y.Text())
      Root.set('Info',        new Y.Map())
      Root.set('MIMEType',    '')
      Root.set('ValueKind',   'none')
      EntriesMap.set(RootId, Root)

      // Trash data
      const Trash = new Y.Map<any>()
      Trash.set('Kind',        'item')
      Trash.set('outerItemId', RootId)
      Trash.set('OrderKey',    'a0')
      Trash.set('Label',       new Y.Text('trash'))
      Trash.set('Info',        new Y.Map())
      Trash.set('MIMEType',    '')
      Trash.set('ValueKind',   'none')
      EntriesMap.set(TrashId, Trash)

      // Lost & Found data
      const LostAndFound = new Y.Map<any>()
      LostAndFound.set('Kind',        'item')
      LostAndFound.set('outerItemId', RootId)
      LostAndFound.set('OrderKey',    'a1')
      LostAndFound.set('Label',       new Y.Text('lost-and-found'))
      LostAndFound.set('Info',        new Y.Map())
      LostAndFound.set('MIMEType',    '')
      LostAndFound.set('ValueKind',   'none')
      EntriesMap.set(LostAndFoundId, LostAndFound)
    })

    return new SDS_DataStore(Doc, Options)
  }

/**** fromBinary — restore store from compressed update ****/

  static fromBinary (Data:Uint8Array, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const Doc = new Y.Doc()
    Y.applyUpdate(Doc, gunzipSync(Data))
    return new SDS_DataStore(Doc, Options)
  }

/**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/

  static fromJSON (Serialisation:unknown, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const JSON_ = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation)
      : Serialisation) as SDS_ItemJSON

    const Doc        = new Y.Doc()
    const EntriesMap = Doc.getMap('Entries') as Y.Map<Y.Map<any>>

    Doc.transact(() => { _yjsCreateEntry(JSON_, '', '', EntriesMap) })

    return new SDS_DataStore(Doc, Options)
  }

//----------------------------------------------------------------------------//
//                             Well-known items                               //
//----------------------------------------------------------------------------//

/**** RootItem / TrashItem / LostAndFoundItem — access system items ****/

  get RootItem ():SDS_Item         { return this.#wrappedItem(RootId) }
  get TrashItem ():SDS_Item        { return this.#wrappedItem(TrashId) }
  get LostAndFoundItem ():SDS_Item { return this.#wrappedItem(LostAndFoundId) }

//----------------------------------------------------------------------------//
//                                   Lookup                                   //
//----------------------------------------------------------------------------//

/**** EntryWithId — retrieve entry by Id ****/

  EntryWithId (EntryId:string):SDS_Entry | undefined {
    if (! this.#EntriesMap.has(EntryId)) { return undefined }
    return this.#wrapped(EntryId)
  }

//----------------------------------------------------------------------------//
//                                  Factory                                   //
//----------------------------------------------------------------------------//

/**** newItemAt — create a new item of given type as inner entry of outerItem ****/

  newItemAt (MIMEType:string|undefined, outerItem:SDS_Item, InsertionIndex?:number):SDS_Item {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    const effectiveType = MIMEType ?? DefaultMIMEType
    expectValidMIMEType(effectiveType)
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(outerItem.Id)

    const Id        = crypto.randomUUID()
    const OrderKey  = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
    const storedType = effectiveType === DefaultMIMEType ? '' : effectiveType

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'item')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text())
      EntryMap.set('Info',        new Y.Map())
      EntryMap.set('MIMEType',    storedType)
      EntryMap.set('ValueKind',   'none')
      this.#EntriesMap.set(Id, EntryMap)

      this.#addToReverseIndex(outerItem.Id, Id)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerItem')
    })

    return this.#wrappedItem(Id)
  }

/**** newLinkAt — create link as inner link of outer data ****/

  newLinkAt (Target:SDS_Item, outerItem:SDS_Item, InsertionIndex?:number):SDS_Link {
    if (Target == null)     throw new SDS_Error('invalid-argument','Target must not be missing')
    if (outerItem == null)  throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(Target.Id)
    this.#requireItemExists(outerItem.Id)

    const Id       = crypto.randomUUID()
    const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text())
      EntryMap.set('Info',        new Y.Map())
      EntryMap.set('TargetId',    Target.Id)
      this.#EntriesMap.set(Id, EntryMap)

      this.#addToReverseIndex(outerItem.Id, Id)
      this.#addToLinkTargetIndex(Target.Id, Id)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerItem')
    })

    return this.#wrappedLink(Id)
  }

//----------------------------------------------------------------------------//
//                                   Import                                   //
//----------------------------------------------------------------------------//

/**** deserializeItemInto — import item subtree; always remaps all IDs ****/

  deserializeItemInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Item {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(outerItem.Id)

    const JSON_ = Serialisation as SDS_ItemJSON
    if (JSON_ == null || JSON_.Kind !== 'item') {
      throw new SDS_Error('invalid-argument', 'Serialisation must be an SDS_ItemJSON object')
    }

    const IdMap    = new Map<string,string>()
    this.#collectEntryIds(JSON_, IdMap)

    const OrderKey  = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
    const rootNewId = IdMap.get(JSON_.Id)!

    this.transact(() => {
      this.#importEntryFromJSON(JSON_, outerItem.Id, OrderKey, IdMap)
      this.#recordChange(outerItem.Id, 'innerEntryList')
    })

    return this.#wrappedItem(rootNewId)
  }

/**** deserializeLinkInto — import link; always assigns a new Id ****/

  deserializeLinkInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Link {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(outerItem.Id)

    const JSON_ = Serialisation as SDS_LinkJSON
    if (JSON_ == null || JSON_.Kind !== 'link') {
      throw new SDS_Error('invalid-argument', 'Serialisation must be an SDS_LinkJSON object')
    }

    const newId    = crypto.randomUUID()
    const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text(JSON_.Label ?? ''))
      const InfoMap = new Y.Map<any>()
      for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }
      EntryMap.set('Info',     InfoMap)
      EntryMap.set('TargetId', JSON_.TargetId ?? '')
      this.#EntriesMap.set(newId, EntryMap)

      this.#addToReverseIndex(outerItem.Id, newId)
      if (JSON_.TargetId) { this.#addToLinkTargetIndex(JSON_.TargetId, newId) }
      this.#recordChange(outerItem.Id, 'innerEntryList')
    })

    return this.#wrappedLink(newId)
  }

//----------------------------------------------------------------------------//
//                               Move / Delete                                //
//----------------------------------------------------------------------------//

/**** moveEntryTo — move entry to new outer data and position ****/

  moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):void {
    parseInsertionIndex(InsertionIndex)
    if (! this._mayMoveEntryTo(Entry.Id, outerItem.Id, InsertionIndex)) {
      throw new SDS_Error('move-would-cycle',
        'cannot move an entry into one of its own descendants')
    }

    const oldOuterItemId = this._outerItemIdOf(Entry.Id)
    const OrderKey       = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Entry.Id)!
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)

      // When moving an entry out of TrashItem, remove the _trashedAt timestamp
      // so that a subsequent deleteEntry() will record a fresh timestamp.
      if (oldOuterItemId === TrashId && outerItem.Id !== TrashId) {
        const InfoMap = EntryMap.get('Info') as Y.Map<any> | undefined
        if (InfoMap instanceof Y.Map && InfoMap.has('_trashedAt')) {
          InfoMap.delete('_trashedAt')
          this.#recordChange(Entry.Id, 'Info._trashedAt')
        }
      }

      if (oldOuterItemId != null) {
        this.#removeFromReverseIndex(oldOuterItemId, Entry.Id)
        this.#recordChange(oldOuterItemId, 'innerEntryList')
      }
      this.#addToReverseIndex(outerItem.Id, Entry.Id)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(Entry.Id, 'outerItem')
    })
  }

/**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/

  _rebalanceInnerEntriesOf (outerItemId:string):void {
    const innerEntries = this.#sortedInnerEntriesOf(outerItemId)
    if (innerEntries.length === 0) { return }
    const freshKeys = generateNKeysBetween(null, null, innerEntries.length)
    innerEntries.forEach((innerEntry, i) => {
      const EntryMap = this.#EntriesMap.get(innerEntry.Id)
      if (EntryMap == null) { return }
      EntryMap.set('OrderKey', freshKeys[i])
      this.#recordChange(innerEntry.Id, 'outerItem')
    })
  }

/**** deleteEntry — move entry to trash with timestamp ****/

  deleteEntry (Entry:SDS_Entry):void {
    if (! this._mayDeleteEntry(Entry.Id)) {
      throw new SDS_Error('delete-not-permitted', 'this entry cannot be deleted')
    }
    const oldOuterItemId = this._outerItemIdOf(Entry.Id)
    const OrderKey       = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Entry.Id)!
      EntryMap.set('outerItemId', TrashId)
      EntryMap.set('OrderKey',    OrderKey)

      // ensure Info Y.Map exists before writing _trashedAt
      let InfoMap = EntryMap.get('Info') as Y.Map<any> | undefined
      if (! (InfoMap instanceof Y.Map)) {
        InfoMap = new Y.Map()
        EntryMap.set('Info', InfoMap)
      }
      InfoMap.set('_trashedAt', Date.now())

      if (oldOuterItemId != null) {
        this.#removeFromReverseIndex(oldOuterItemId, Entry.Id)
        this.#recordChange(oldOuterItemId, 'innerEntryList')
      }
      this.#addToReverseIndex(TrashId, Entry.Id)
      this.#recordChange(TrashId, 'innerEntryList')
      this.#recordChange(Entry.Id, 'outerItem')
      this.#recordChange(Entry.Id, 'Info._trashedAt')
    })
  }

/**** purgeEntry — permanently delete entry and subtree ****/

  purgeEntry (Entry:SDS_Entry):void {
    const oldOuter = this._outerItemIdOf(Entry.Id)
    if (oldOuter !== TrashId) {
      throw new SDS_Error('purge-not-in-trash',
        'only direct children of TrashItem can be purged')
    }
    if (this.#isProtected(Entry.Id)) {
      throw new SDS_Error('purge-protected',
        'entry is protected by incoming links and cannot be purged')
    }
    this.transact(() => {
      this.#purgeSubtree(Entry.Id)
    })
  }

//----------------------------------------------------------------------------//
//                           Trash TTL / Auto-purge                          //
//----------------------------------------------------------------------------//

/**** purgeExpiredTrashEntries — remove trash items past TTL ****/

  purgeExpiredTrashEntries (TTLms?:number):number {
    const effectiveTTL = TTLms ?? this.#TrashTTLms
    if (effectiveTTL == null) { return 0 }
    const Now           = Date.now()
    const TrashChildren = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set<string>())
    let Count = 0
    for (const EntryId of TrashChildren) {
      const EntryMap = this.#EntriesMap.get(EntryId)
      if (EntryMap == null) { continue }
      if (EntryMap.get('outerItemId') !== TrashId) { continue }
      const InfoMap   = EntryMap.get('Info') as Y.Map<any> | undefined
      const trashedAt = InfoMap instanceof Y.Map ? InfoMap.get('_trashedAt') : undefined
      if (typeof trashedAt !== 'number') { continue }
      if (Now - trashedAt < effectiveTTL) { continue }
      try {
        this.purgeEntry(this.#wrapped(EntryId))
        Count++
      } catch (_Signal) { /* protected or already removed — skip */ }
    }
    return Count
  }

/**** dispose — stop background timer and remove all change listeners ****/

  dispose ():void {
    if (this.#TrashCheckTimer != null) {
      clearInterval(this.#TrashCheckTimer)
      this.#TrashCheckTimer = null
    }
    this.#Handlers.clear()
  }

//----------------------------------------------------------------------------//
//                           Transactions & Events                            //
//----------------------------------------------------------------------------//

/**** transact — execute callback in batched transaction ****/

  transact (Callback:() => void):void {
    this.#TransactionDepth++
    try {
      if (this.#TransactionDepth === 1 && ! this.#ApplyingExternal) {
        // outermost local transaction: wrap in a Y.js transaction so all
        // CRDT mutations are batched into a single update event.
        this.#doc.transact(() => { Callback() })
      } else {
        Callback()
      }
    } finally {
      this.#TransactionDepth--
      if (this.#TransactionDepth === 0) {
        const ChangeSet          = { ...this.#PendingChangeSet }
        this.#PendingChangeSet   = {}
        const Origin:ChangeOrigin = this.#ApplyingExternal ? 'external' : 'internal'
        this.#notifyHandlers(Origin, ChangeSet)
      }
    }
  }

/**** onChangeInvoke — subscribe to change events ****/

  onChangeInvoke (Handler:ChangeHandler):() => void {
    this.#Handlers.add(Handler)
    return () => { this.#Handlers.delete(Handler) }
  }

//----------------------------------------------------------------------------//
//                                    Sync                                    //
//----------------------------------------------------------------------------//

/**** applyRemotePatch — apply remote changes and update indices ****/

  applyRemotePatch (encodedPatch:Uint8Array):void {
    if (encodedPatch.byteLength === 0) { return }
    this.#ApplyingExternal = true
    try {
      Y.applyUpdate(this.#doc, encodedPatch)
      // After applying the external update, diff the new state against our
      // in-memory indices and record all changes into the PendingChangeSet.
      this.transact(() => {
        this.#updateIndicesFromView()
      })
    } finally {
      this.#ApplyingExternal = false
    }
    this.recoverOrphans()
  }

/**** currentCursor — get state vector for sync ****/

  get currentCursor ():SDS_SyncCursor {
    return Y.encodeStateVector(this.#doc)
  }

/**** exportPatch — encode changes since cursor ****/

  exportPatch (sinceCursor?:SDS_SyncCursor):Uint8Array {
    if (sinceCursor == null || sinceCursor.byteLength === 0) {
      return Y.encodeStateAsUpdate(this.#doc)
    }
    return Y.encodeStateAsUpdate(this.#doc, sinceCursor)
  }

/**** recoverOrphans — move entries with missing parents to lost-and-found ****/

  recoverOrphans ():void {
    const allIds   = new Set(this.#EntriesMap.keys())
    let hasChanges = false

    this.transact(() => {
      this.#EntriesMap.forEach((EntryMap, EntryId) => {
        if (EntryId === RootId) { return }

        // orphaned entry: outerItemId points to a missing entry
        const outerItemId = EntryMap.get('outerItemId') as string | undefined
        if (outerItemId && ! allIds.has(outerItemId)) {
          const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
          EntryMap.set('outerItemId', LostAndFoundId)
          EntryMap.set('OrderKey',    OrderKey)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(EntryId, 'outerItem')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          hasChanges = true
        }

        // dangling link: TargetId points to a missing entry
        if (EntryMap.get('Kind') === 'link') {
          const TargetId = EntryMap.get('TargetId') as string | undefined
          if (TargetId && ! allIds.has(TargetId)) {
            const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
            const newItem  = new Y.Map<any>()
            newItem.set('Kind',        'item')
            newItem.set('outerItemId', LostAndFoundId)
            newItem.set('OrderKey',    OrderKey)
            newItem.set('Label',       new Y.Text())
            newItem.set('Info',        new Y.Map())
            newItem.set('MIMEType',    '')
            newItem.set('ValueKind',   'none')
            this.#EntriesMap.set(TargetId, newItem)
            this.#addToReverseIndex(LostAndFoundId, TargetId)
            allIds.add(TargetId)
            this.#recordChange(LostAndFoundId, 'innerEntryList')
            hasChanges = true
          }
        }
      })
    })
  }

//----------------------------------------------------------------------------//
//                             Serialisation                                  //
//----------------------------------------------------------------------------//

/**** asBinary — export compressed Y.js update ****/

  asBinary ():Uint8Array {
    return gzipSync(Y.encodeStateAsUpdate(this.#doc))
  }

/**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/

  newEntryFromBinaryAt (
    Serialisation:Uint8Array, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Entry {
    const JSONString = new TextDecoder().decode(gunzipSync(Serialisation))
    return this.newEntryFromJSONat(JSON.parse(JSONString), outerItem, InsertionIndex)
  }

/**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/

  _EntryAsBinary (Id:string):Uint8Array {
    const JSONString = JSON.stringify(this._EntryAsJSON(Id))
    return gzipSync(new TextEncoder().encode(JSONString))
  }

//----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//

/**** #requireItemExists — throw if data does not exist ****/

  #requireItemExists (Id:string):void {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null || EntryMap.get('Kind') !== 'item') {
      throw new SDS_Error('invalid-argument', `item '${Id}' does not exist`)
    }
  }

/**** #wrapped — return cached wrapper objects ****/

  #wrapped (Id:string):SDS_Entry {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) {
      throw new SDS_Error('invalid-argument', `entry '${Id}' not found`)
    }
    return EntryMap.get('Kind') === 'item' ? this.#wrappedItem(Id) : this.#wrappedLink(Id)
  }

/**** #wrappedItem — return or create cached wrapper for data ****/

  #wrappedItem (Id:string):SDS_Item {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Item) { return Cached }
    const Wrapper = new SDS_Item(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #wrappedLink — return or create cached wrapper for link ****/

  #wrappedLink (Id:string):SDS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Link) { return Cached }
    const Wrapper = new SDS_Link(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #cacheWrapper — add wrapper to LRU cache ****/

  #cacheWrapper (Id:string, Wrapper:SDS_Entry):void {
    if (this.#WrapperCache.size >= this.#MaxCacheSize) {
      const FirstKey = this.#WrapperCache.keys().next().value
      if (FirstKey != null) { this.#WrapperCache.delete(FirstKey) }
    }
    this.#WrapperCache.set(Id, Wrapper)
  }

/**** #rebuildIndices — full rebuild used during construction ****/

  #rebuildIndices ():void {
    this.#ReverseIndex.clear()
    this.#ForwardIndex.clear()
    this.#LinkTargetIndex.clear()
    this.#LinkForwardIndex.clear()
    this.#EntriesMap.forEach((EntryMap, EntryId) => {
      const outerItemId = EntryMap.get('outerItemId') as string | undefined
      if (outerItemId) { this.#addToReverseIndex(outerItemId, EntryId) }
      if (EntryMap.get('Kind') === 'link') {
        const TargetId = EntryMap.get('TargetId') as string | undefined
        if (TargetId) { this.#addToLinkTargetIndex(TargetId, EntryId) }
      }
    })
  }

/**** #updateIndicesFromView — incremental diff after remote patches ****/

  #updateIndicesFromView ():void {
    const SeenIds = new Set<string>()

    // pass 1: created and changed entries
    this.#EntriesMap.forEach((EntryMap, EntryId) => {
      SeenIds.add(EntryId)

      const newOuterItemId = (EntryMap.get('outerItemId') as string | undefined) || undefined
      const oldOuterItemId = this.#ForwardIndex.get(EntryId)

      if (newOuterItemId !== oldOuterItemId) {
        if (oldOuterItemId != null) {
          this.#removeFromReverseIndex(oldOuterItemId, EntryId)
          this.#recordChange(oldOuterItemId, 'innerEntryList')
        }
        if (newOuterItemId != null) {
          this.#addToReverseIndex(newOuterItemId, EntryId)
          this.#recordChange(newOuterItemId, 'innerEntryList')
        }
        this.#recordChange(EntryId, 'outerItem')
      }

      switch (true) {
        case (EntryMap.get('Kind') === 'link'): {
          const newTargetId = EntryMap.get('TargetId') as string | undefined
          const oldTargetId = this.#LinkForwardIndex.get(EntryId)
          if (newTargetId !== oldTargetId) {
            if (oldTargetId != null) { this.#removeFromLinkTargetIndex(oldTargetId, EntryId) }
            if (newTargetId != null) { this.#addToLinkTargetIndex(newTargetId, EntryId) }
          }
          break
        }
        case this.#LinkForwardIndex.has(EntryId):
          this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId)!, EntryId)
          break
      }

      // Conservative: assume label may have changed
      this.#recordChange(EntryId, 'Label')
    })

    // pass 2: deleted entries
    const deletedEntries = Array.from(this.#ForwardIndex.entries())
      .filter(([Id]) => ! SeenIds.has(Id))
    for (const [EntryId, oldOuterItemId] of deletedEntries) {
      this.#removeFromReverseIndex(oldOuterItemId, EntryId)
      this.#recordChange(oldOuterItemId, 'innerEntryList')
    }

    const deletedLinks = Array.from(this.#LinkForwardIndex.entries())
      .filter(([Id]) => ! SeenIds.has(Id))
    for (const [LinkId, oldTargetId] of deletedLinks) {
      this.#removeFromLinkTargetIndex(oldTargetId, LinkId)
    }
  }

/**** #addToReverseIndex — add entry to reverse index ****/

  #addToReverseIndex (outerItemId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerItemId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerItemId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerItemId)
  }

/**** #removeFromReverseIndex — remove entry from reverse index ****/

  #removeFromReverseIndex (outerItemId:string, EntryId:string):void {
    this.#ReverseIndex.get(outerItemId)?.delete(EntryId)
    this.#ForwardIndex.delete(EntryId)
  }

/**** #addToLinkTargetIndex — add link to target index ****/

  #addToLinkTargetIndex (TargetId:string, LinkId:string):void {
    let Links = this.#LinkTargetIndex.get(TargetId)
    if (Links == null) {
      Links = new Set()
      this.#LinkTargetIndex.set(TargetId, Links)
    }
    Links.add(LinkId)
    this.#LinkForwardIndex.set(LinkId, TargetId)
  }

/**** #removeFromLinkTargetIndex — remove link from target index ****/

  #removeFromLinkTargetIndex (TargetId:string, LinkId:string):void {
    this.#LinkTargetIndex.get(TargetId)?.delete(LinkId)
    this.#LinkForwardIndex.delete(LinkId)
  }

/**** #OrderKeyAt — generate fractional key at insertion position ****/

  #OrderKeyAt (outerItemId:string, InsertionIndex?:number):string {
    const keyFrom = (Entries:Array<{OrderKey:string}>):string => {
      if (Entries.length === 0 || InsertionIndex == null) {
        const Last = Entries.length > 0 ? Entries[Entries.length-1].OrderKey : null
        return generateKeyBetween(Last, null)
      }
      const i = Math.max(0, Math.min(InsertionIndex, Entries.length))
      return generateKeyBetween(
        i > 0 ? Entries[i-1].OrderKey : null,
        i < Entries.length ? Entries[i].OrderKey : null
      )
    }
    let Entries = this.#sortedInnerEntriesOf(outerItemId)
    const Key   = keyFrom(Entries)
    if (Key.length <= maxOrderKeyLength) { return Key }
    this._rebalanceInnerEntriesOf(outerItemId)
    return keyFrom(this.#sortedInnerEntriesOf(outerItemId))
  }

/**** #lastOrderKeyOf — get last inner entry's order key ****/

  #lastOrderKeyOf (DataId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(DataId)
    return innerEntries.length > 0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/

  #sortedInnerEntriesOf (DataId:string):Array<{ Id:string; OrderKey:string }> {
    const innerIds = this.#ReverseIndex.get(DataId) ?? new Set<string>()
    const Result:Array<{ Id:string; OrderKey:string }> = []
    for (const innerEntryId of innerIds) {
      const EntryMap = this.#EntriesMap.get(innerEntryId)
      const innerOuterItemId = EntryMap?.get('outerItemId') as string | undefined
      if (innerOuterItemId === DataId) {
        Result.push({ Id:innerEntryId, OrderKey:EntryMap!.get('OrderKey') as string ?? '' })
      }
    }
    Result.sort((EntryA, EntryB) => (
      EntryA.OrderKey < EntryB.OrderKey ? -1 : EntryA.OrderKey > EntryB.OrderKey ? 1 :
      EntryA.Id < EntryB.Id ? -1 : EntryA.Id > EntryB.Id ? 1 : 0
    ))
    return Result
  }

/**** #isProtected — check if trash entry has incoming links from root ****/

  #isProtected (TrashBranchId:string):boolean {
    const RootReachable = this.#reachableFromRoot()
    const Protected     = new Set<string>()
    let Changed = true
    while (Changed) {
      Changed = false
      for (const DirectChild of (this.#ReverseIndex.get(TrashId) ?? new Set())) {
        if (Protected.has(DirectChild)) { continue }
        if (this.#SubtreeHasIncomingLinks(DirectChild, RootReachable, Protected)) {
          Protected.add(DirectChild)
          Changed = true
        }
      }
    }
    return Protected.has(TrashBranchId)
  }

/**** #SubtreeHasIncomingLinks — check if subtree has root-reachable links ****/

  #SubtreeHasIncomingLinks (
    RootOfSubtree:string, RootReachable:Set<string>, Protected:Set<string>
  ):boolean {
    const Queue   = [RootOfSubtree]
    const Visited = new Set<string>()
    while (Queue.length > 0) {
      const EntryId = Queue.pop()!
      if (Visited.has(EntryId)) { continue }
      Visited.add(EntryId)
      const IncomingLinks = this.#LinkTargetIndex.get(EntryId) ?? new Set<string>()
      for (const LinkId of IncomingLinks) {
        if (RootReachable.has(LinkId)) { return true }
        const TrashBranch = this.#directTrashInnerEntryContaining(LinkId)
        if (TrashBranch != null && Protected.has(TrashBranch)) { return true }
      }
      for (const innerEntryId of (this.#ReverseIndex.get(EntryId) ?? new Set())) {
        if (! Visited.has(innerEntryId)) { Queue.push(innerEntryId) }
      }
    }
    return false
  }

/**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/

  #directTrashInnerEntryContaining (EntryId:string):string | null {
    let currentId:string | undefined = EntryId
    while (currentId != null) {
      const Outer = this._outerItemIdOf(currentId)
      if (Outer === TrashId) { return currentId }
      if (Outer === RootId || Outer == null) { return null }
      currentId = Outer
    }
    return null
  }

/**** #reachableFromRoot — get all entries reachable from root ****/

  #reachableFromRoot ():Set<string> {
    const Reachable = new Set<string>()
    const Queue     = [RootId]
    while (Queue.length > 0) {
      const Id = Queue.pop()!
      if (Reachable.has(Id)) { continue }
      Reachable.add(Id)
      for (const innerEntryId of (this.#ReverseIndex.get(Id) ?? new Set())) {
        if (! Reachable.has(innerEntryId)) { Queue.push(innerEntryId) }
      }
    }
    return Reachable
  }

/**** #purgeSubtree — recursively delete entry and unprotected children ****/

  #purgeSubtree (EntryId:string):void {
    const EntryMap = this.#EntriesMap.get(EntryId)
    if (EntryMap == null) { return }

    const Kind        = EntryMap.get('Kind') as string
    const oldOuterItemId = EntryMap.get('outerItemId') as string | undefined

    const RootReachable = this.#reachableFromRoot()
    const Protected     = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#SubtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        // inner rescue: move to TrashItem top level
        const innerMap = this.#EntriesMap.get(innerEntryId)!
        const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)
        innerMap.set('outerItemId', TrashId)
        innerMap.set('OrderKey',    OrderKey)
        this.#removeFromReverseIndex(EntryId, innerEntryId)
        this.#addToReverseIndex(TrashId, innerEntryId)
        this.#recordChange(TrashId, 'innerEntryList')
        this.#recordChange(innerEntryId, 'outerItem')
      } else {
        this.#purgeSubtree(innerEntryId)
      }
    }

    // signal deletion before removing the entry (so listeners can still read ValueRef etc.)
    this.#recordChange(EntryId, 'Existence')

    // delete the entry itself
    this.#EntriesMap.delete(EntryId)
    if (oldOuterItemId) {
      this.#removeFromReverseIndex(oldOuterItemId, EntryId)
      this.#recordChange(oldOuterItemId, 'innerEntryList')
    }
    if (Kind === 'link') {
      const TargetId = EntryMap.get('TargetId') as string | undefined
      if (TargetId) { this.#removeFromLinkTargetIndex(TargetId, EntryId) }
    }
    this.#WrapperCache.delete(EntryId)
  }

/**** #recordChange — add property change to pending changeset ****/

  #recordChange (EntryId:string, Property:string):void {
    if (this.#PendingChangeSet[EntryId] == null) {
      this.#PendingChangeSet[EntryId] = new Set()
    }
    (this.#PendingChangeSet[EntryId] as Set<string>).add(Property)
  }

/**** #notifyHandlers — call change handlers with origin and changeset ****/

  #notifyHandlers (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet):void {
    if (Object.keys(ChangeSet).length === 0) { return }
    for (const Handler of this.#Handlers) {
      try { Handler(Origin, ChangeSet) } catch (_Signal) { /* swallow */ }
    }
  }

//----------------------------------------------------------------------------//
//           Internal helpers — called by SDS_Entry / Data / Link             //
//----------------------------------------------------------------------------//

/**** _KindOf — get entry kind ****/

  _KindOf (Id:string):'item' | 'link' {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) { throw new SDS_Error('not-found', `entry '${Id}' not found`) }
    return EntryMap.get('Kind') as 'item' | 'link'
  }

/**** _LabelOf — get entry label text ****/

  _LabelOf (Id:string):string {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) { return '' }
    const LabelVal = EntryMap.get('Label')
    return LabelVal instanceof Y.Text ? LabelVal.toString() : String(LabelVal ?? '')
  }

/**** _setLabelOf — set entry label text ****/

  _setLabelOf (Id:string, Value:string):void {
    expectValidLabel(Value)
    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Id)
      if (EntryMap == null) { return }
      let LabelText = EntryMap.get('Label') as Y.Text | undefined
      if (LabelText instanceof Y.Text) {
        LabelText.delete(0, LabelText.length)
        if (Value.length > 0) { LabelText.insert(0, Value) }
      } else {
        LabelText = new Y.Text(Value)
        EntryMap.set('Label', LabelText)
      }
      this.#recordChange(Id, 'Label')
    })
  }

/**** _TypeOf — get data MIME type ****/

  _TypeOf (Id:string):string {
    const EntryMap = this.#EntriesMap.get(Id)
    const Stored   = (EntryMap?.get('MIMEType') as string | undefined) ?? ''
    return Stored === '' ? DefaultMIMEType : Stored
  }

/**** _setTypeOf — set data MIME type ****/

  _setTypeOf (Id:string, Value:string):void {
    expectValidMIMEType(Value)
    const storedValue = Value === DefaultMIMEType ? '' : Value
    this.transact(() => {
      this.#EntriesMap.get(Id)?.set('MIMEType', storedValue)
      this.#recordChange(Id, 'Type')
    })
  }

/**** _ValueKindOf — get data value kind ****/

  _ValueKindOf (Id:string):
    'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending'
  {
    const EntryMap = this.#EntriesMap.get(Id)
    return ((EntryMap?.get('ValueKind') as string | undefined) ?? 'none') as any
  }

/**** _readValueOf — get data value (literal or binary) ****/

  async _readValueOf (Id:string):Promise<string | Uint8Array | undefined> {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'none'):    return undefined
      case (Kind === 'literal'): {
        const EntryMap   = this.#EntriesMap.get(Id)
        const LiteralVal = EntryMap?.get('literalValue')
        return LiteralVal instanceof Y.Text ? LiteralVal.toString() : (LiteralVal as string ?? '')
      }
      case (Kind === 'binary'):  {
        const EntryMap = this.#EntriesMap.get(Id)
        return EntryMap?.get('binaryValue') as Uint8Array | undefined
      }
      default: {
        const ref = this._getValueRefOf(Id)
        if (ref == undefined) { return undefined }
        const Blob = await this._getValueBlobAsync(ref.Hash)
        if (Blob == undefined) { return undefined }
        return Kind === 'literal-reference' ? new TextDecoder().decode(Blob) : Blob
      }
    }
  }

/**** _writeValueOf — set data value ****/

  _writeValueOf (Id:string, Value:string | Uint8Array | undefined):void {
    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Id)
      if (EntryMap == null) { return }

      switch (true) {
        case (Value == null): {
          EntryMap.set('ValueKind', 'none')
          break
        }
        case (typeof Value === 'string' && (Value as string).length <= this.#LiteralSizeLimit): {
          EntryMap.set('ValueKind', 'literal')
          let LiteralText = EntryMap.get('literalValue') as Y.Text | undefined
          if (LiteralText instanceof Y.Text) {
            LiteralText.delete(0, LiteralText.length)
            if ((Value as string).length > 0) { LiteralText.insert(0, Value as string) }
          } else {
            LiteralText = new Y.Text(Value as string)
            EntryMap.set('literalValue', LiteralText)
          }
          break
        }
        case (typeof Value === 'string'): {
          const Encoder = new TextEncoder()
          const Bytes   = Encoder.encode(Value as string)
          const Hash    = SDS_DataStore._BLOBhash(Bytes)
          this._storeValueBlob(Hash, Bytes)
          EntryMap.set('ValueKind', 'literal-reference')
          EntryMap.set('ValueRef',  { Hash, Size:Bytes.byteLength })
          break
        }
        case ((Value as Uint8Array).byteLength <= DefaultBinarySizeLimit): {
          EntryMap.set('ValueKind',   'binary')
          EntryMap.set('binaryValue', Value as Uint8Array)
          break
        }
        default: {
          const Bytes = Value as Uint8Array
          const Hash  = SDS_DataStore._BLOBhash(Bytes)
          this._storeValueBlob(Hash, Bytes)
          EntryMap.set('ValueKind', 'binary-reference')
          EntryMap.set('ValueRef',  { Hash, Size:Bytes.byteLength })
          break
        }
      }
      this.#recordChange(Id, 'Value')
    })
  }

/**** _spliceValueOf — modify literal value range ****/

  _spliceValueOf (Id:string, fromIndex:number, toIndex:number, Replacement:string):void {
    if (this._ValueKindOf(Id) !== 'literal') {
      throw new SDS_Error('change-value-not-literal',
        'changeValue() is only available when ValueKind === \'literal\'')
    }
    this.transact(() => {
      const EntryMap   = this.#EntriesMap.get(Id)
      const LiteralText = EntryMap?.get('literalValue') as Y.Text | undefined
      if (LiteralText instanceof Y.Text) {
        const DeleteCount = toIndex - fromIndex
        if (DeleteCount > 0) { LiteralText.delete(fromIndex, DeleteCount) }
        if (Replacement.length > 0) { LiteralText.insert(fromIndex, Replacement) }
      }
      this.#recordChange(Id, 'Value')
    })
  }

/**** _getValueRefOf — return the ValueRef for *-reference entries ****/

  _getValueRefOf (Id:string):{ Hash:string; Size:number } | undefined {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) { return undefined }
    const Kind = this._ValueKindOf(Id)
    if (Kind !== 'literal-reference' && Kind !== 'binary-reference') { return undefined }
    return EntryMap.get('ValueRef') as { Hash:string; Size:number } | undefined
  }

/**** _InfoProxyOf — get info metadata proxy object ****/

  _InfoProxyOf (Id:string):Record<string,unknown> {
    const Store = this
    return new Proxy({} as Record<string,unknown>, {
      get (_target, Key) {
        if (typeof Key !== 'string') { return undefined }
        const EntryMap = Store.#EntriesMap.get(Id)
        const InfoMap  = EntryMap?.get('Info') as Y.Map<any> | undefined
        return InfoMap instanceof Y.Map ? InfoMap.get(Key) : undefined
      },
      set (_target, Key, Value) {
        if (typeof Key !== 'string') { return false }
        if (Value === undefined) {
          Store.transact(() => {
            const EntryMap = Store.#EntriesMap.get(Id)
            const InfoMap  = EntryMap?.get('Info') as Y.Map<any> | undefined
            if (InfoMap instanceof Y.Map && InfoMap.has(Key)) {
              InfoMap.delete(Key)
              Store.#recordChange(Id, `Info.${Key}`)
            }
          })
          return true
        }
        expectValidInfoKey(Key)
        checkInfoValueSize(Value)
        Store.transact(() => {
          const EntryMap = Store.#EntriesMap.get(Id)
          if (EntryMap == null) { return }
          let InfoMap = EntryMap.get('Info') as Y.Map<any> | undefined
          if (! (InfoMap instanceof Y.Map)) {
            InfoMap = new Y.Map()
            EntryMap.set('Info', InfoMap)
          }
          InfoMap.set(Key, Value)
          Store.#recordChange(Id, `Info.${Key}`)
        })
        return true
      },
      deleteProperty (_target, Key) {
        if (typeof Key !== 'string') { return false }
        Store.transact(() => {
          const EntryMap = Store.#EntriesMap.get(Id)
          const InfoMap  = EntryMap?.get('Info') as Y.Map<any> | undefined
          if (InfoMap instanceof Y.Map && InfoMap.has(Key)) {
            InfoMap.delete(Key)
            Store.#recordChange(Id, `Info.${Key}`)
          }
        })
        return true
      },
      ownKeys () {
        const EntryMap = Store.#EntriesMap.get(Id)
        const InfoMap  = EntryMap?.get('Info') as Y.Map<any> | undefined
        return InfoMap instanceof Y.Map ? Array.from(InfoMap.keys()) : []
      },
      getOwnPropertyDescriptor (_target, Key) {
        if (typeof Key !== 'string') { return undefined }
        const EntryMap = Store.#EntriesMap.get(Id)
        const InfoMap  = EntryMap?.get('Info') as Y.Map<any> | undefined
        if (! (InfoMap instanceof Y.Map)) { return undefined }
        const Value = InfoMap.get(Key)
        return Value !== undefined
          ? { configurable:true, enumerable:true, value:Value }
          : undefined
      },
    })
  }

/**** _outerItemIdOf — get outer item Id ****/

  _outerItemIdOf (Id:string):string | undefined {
    const EntryMap     = this.#EntriesMap.get(Id)
    const outerItemId  = EntryMap?.get('outerItemId') as string | undefined
    return (outerItemId != null && outerItemId !== '') ? outerItemId : undefined
  }

/**** _innerEntriesOf — get sorted children as array-like proxy ****/

  _innerEntriesOf (DataId:string):SDS_Entry[] {
    const Store  = this
    const Sorted = this.#sortedInnerEntriesOf(DataId)

    return new Proxy([] as SDS_Entry[], {
      get (_target, Prop) {
        if (Prop === 'length') { return Sorted.length }
        if (Prop === Symbol.iterator) {
          return function* () {
            for (let i = 0; i < Sorted.length; i++) {
              yield Store.#wrapped(Sorted[i].Id)
            }
          }
        }
        if (typeof Prop === 'string' && ! isNaN(Number(Prop))) {
          const Index = Number(Prop)
          return (Index >= 0 && Index < Sorted.length)
            ? Store.#wrapped(Sorted[Index].Id)
            : undefined
        }
        return (_target as any)[Prop]
      },
    })
  }

/**** _mayMoveEntryTo — check move validity ****/

  _mayMoveEntryTo (Id:string, outerItemId:string, _InsertionIndex?:number):boolean {
    if (Id === RootId || Id === outerItemId) { return false }
    if (Id === TrashId || Id === LostAndFoundId) { return outerItemId === RootId }
    return ! this.#isDescendantOf(outerItemId, Id)
  }

/**** _mayDeleteEntry — check delete validity ****/

  _mayDeleteEntry (Id:string):boolean {
    return Id !== RootId && Id !== TrashId && Id !== LostAndFoundId
  }

/**** _TargetOf — get link target data ****/

  _TargetOf (Id:string):SDS_Item {
    const EntryMap = this.#EntriesMap.get(Id)
    const TargetId = EntryMap?.get('TargetId') as string | undefined
    if (TargetId == null || TargetId === '') {
      throw new SDS_Error('not-found', `link '${Id}' has no target`)
    }
    return this.#wrappedItem(TargetId)
  }

/**** _currentValueOf — synchronously return the inline value of an item ****/

  _currentValueOf (Id:string):string | Uint8Array | undefined {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'literal'): {
        const EntryMap   = this.#EntriesMap.get(Id)
        const LiteralVal = EntryMap?.get('literalValue')
        return LiteralVal instanceof Y.Text ? LiteralVal.toString() : (LiteralVal as string ?? '')
      }
      case (Kind === 'binary'): {
        const EntryMap = this.#EntriesMap.get(Id)
        return EntryMap?.get('binaryValue') as Uint8Array | undefined
      }
      default:
        return undefined
    }
  }

/**** #collectEntryIds — build an old→new UUID map for all entries in the subtree ****/

  #collectEntryIds (JSON_:SDS_EntryJSON, IdMap:Map<string,string>):void {
    IdMap.set(JSON_.Id, crypto.randomUUID())
    if (JSON_.Kind === 'item') {
      for (const inner of (JSON_ as SDS_ItemJSON).innerEntries ?? []) {
        this.#collectEntryIds(inner, IdMap)
      }
    }
  }

/**** #importEntryFromJSON — recursively create a Y.js entry and update indices ****/

  #importEntryFromJSON (
    JSON_:SDS_EntryJSON, outerItemId:string, OrderKey:string,
    IdMap:Map<string,string>
  ):void {
    const newId    = IdMap.get(JSON_.Id)!
    const EntryMap = new Y.Map<any>()
    EntryMap.set('Kind',        JSON_.Kind)
    EntryMap.set('outerItemId', outerItemId)
    EntryMap.set('OrderKey',    OrderKey)
    EntryMap.set('Label',       new Y.Text(JSON_.Label ?? ''))
    const InfoMap = new Y.Map<any>()
    for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }
    EntryMap.set('Info', InfoMap)

    if (JSON_.Kind === 'item') {
      const ItemJSON   = JSON_ as SDS_ItemJSON
      const storedType = ItemJSON.Type === DefaultMIMEType ? '' : (ItemJSON.Type ?? '')
      EntryMap.set('MIMEType', storedType)

      switch (true) {
        case (ItemJSON.ValueKind === 'literal' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind',    'literal')
          EntryMap.set('literalValue', new Y.Text(ItemJSON.Value!))
          break
        }
        case (ItemJSON.ValueKind === 'binary' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind',   'binary')
          EntryMap.set('binaryValue', _base64ToUint8Array(ItemJSON.Value!))
          break
        }
        default:
          EntryMap.set('ValueKind', ItemJSON.ValueKind ?? 'none')
      }

      this.#EntriesMap.set(newId, EntryMap)
      this.#addToReverseIndex(outerItemId, newId)

      const FreshKeys = generateNKeysBetween(null, null, (ItemJSON.innerEntries ?? []).length)
      ;(ItemJSON.innerEntries ?? []).forEach((innerJSON, i) => {
        this.#importEntryFromJSON(innerJSON, newId, FreshKeys[i], IdMap)
      })
    } else {
      const LinkJSON = JSON_ as SDS_LinkJSON
      const TargetId = IdMap.has(LinkJSON.TargetId)
        ? IdMap.get(LinkJSON.TargetId)!
        : LinkJSON.TargetId
      EntryMap.set('TargetId', TargetId ?? '')
      this.#EntriesMap.set(newId, EntryMap)
      this.#addToReverseIndex(outerItemId, newId)
      if (TargetId) { this.#addToLinkTargetIndex(TargetId, newId) }
    }
  }

/**** #isDescendantOf — check ancestor relationship ****/

  #isDescendantOf (MaybeDescendantId:string, AncestorId:string):boolean {
    let currentId:string | undefined = MaybeDescendantId
    while (currentId != null) {
      if (currentId === AncestorId) { return true }
      currentId = this._outerItemIdOf(currentId)
    }
    return false
  }
}
