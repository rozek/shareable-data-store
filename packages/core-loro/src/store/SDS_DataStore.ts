/*******************************************************************************
*                                                                              *
*       SDS_DataStore - wraps a Loro CRDT Doc without exposing it              *
*                                                                              *
*******************************************************************************/

// Loro data model (all inside one Loro document):
//
//   doc.getMap('Entries')   →  LoroMap<string, LoroMap<any>>
//
//   Per-entry LoroMap fields:
//     Kind:          string         'item' | 'link'
//     outerItemId:   string         '' for the root data (no outer data)
//     OrderKey:      string         fractional-indexing key
//     Label:         LoroText       collaborative string
//     Info:          LoroMap<any>   arbitrary metadata
//     MIMEType:      string         (items only; '' = 'text/plain')
//     ValueKind:     string         (items only)
//     literalValue:  LoroText       (items, ValueKind=literal only)
//     binaryValue:   Uint8Array     (items, ValueKind=binary only)
//     ValueRef:      string (json)  (items, *-reference only)
//     TargetId:      string         (links only)
//
// NOTE: Loro LoroMap values are restricted to primitives and nested containers.
// Uint8Array is stored as a primitive value directly (Loro supports binary).
// Complex objects like ValueRef are stored as JSON strings.

import { Loro, LoroMap, LoroText, VersionVector } from 'loro-crdt'
import { z }                     from 'zod'
import { gzipSync, gunzipSync }  from 'fflate'
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'
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

/**** _loroCreateEntry — recursively populate a LoroMap from an SDS_EntryJSON tree ****/

  function _loroCreateEntry (
    JSON_:SDS_EntryJSON, outerItemId:string, orderKey:string,
    EntriesMap:LoroMap
  ):void {
    const Id       = JSON_.Id
    const EntryMap = EntriesMap.setContainer(Id, new LoroMap()) as LoroMap
    EntryMap.set('Kind',        JSON_.Kind)
    EntryMap.set('outerItemId', outerItemId)
    EntryMap.set('OrderKey',    orderKey)
    const LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
    if (JSON_.Label) { LabelText.insert(0, JSON_.Label) }
    const InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
    for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }

    if (JSON_.Kind === 'item') {
      const ItemJSON   = JSON_ as SDS_ItemJSON
      const storedType = ItemJSON.Type === DefaultMIMEType ? '' : (ItemJSON.Type ?? '')
      EntryMap.set('MIMEType', storedType)

      switch (true) {
        case (ItemJSON.ValueKind === 'literal' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind', 'literal')
          const LitText = EntryMap.setContainer('literalValue', new LoroText()) as LoroText
          if (ItemJSON.Value!.length > 0) { LitText.insert(0, ItemJSON.Value!) }
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

      const FreshKeys = generateNKeysBetween(null, null, (ItemJSON.innerEntries ?? []).length)
      ;(ItemJSON.innerEntries ?? []).forEach((innerJSON, i) => {
        _loroCreateEntry(innerJSON, Id, FreshKeys[i], EntriesMap)
      })
    } else {
      const LinkJSON = JSON_ as SDS_LinkJSON
      EntryMap.set('TargetId', LinkJSON.TargetId ?? '')
    }
  }

//----------------------------------------------------------------------------//
//                                SDS_DataStore                               //
//----------------------------------------------------------------------------//

export class SDS_DataStore extends SDS_StoreBase {

/**** private state ****/

  #doc:              Loro
  #EntriesMap:       LoroMap
  #LiteralSizeLimit: number
  #TrashTTLms:       number
  #TrashCheckTimer:  ReturnType<typeof setInterval> | null = null
  #Handlers:         Set<ChangeHandler> = new Set()

  // reverse index: outerItemId → Set<entryId>
  #ReverseIndex:Map<string,Set<string>> = new Map()

  // forward index: entryId → outerItemId
  #ForwardIndex:Map<string,string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex:Map<string,Set<string>> = new Map()

  // link forward index: linkId → targetId
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

  private constructor (Doc:Loro, Options?:SDS_DataStoreOptions) {
    super()
    this.#doc              = Doc
    this.#EntriesMap       = Doc.getMap('Entries') as LoroMap
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

/**** fromScratch — create a new store with root, trash, and lost-and-found items ****/

  static fromScratch (Options?:SDS_DataStoreOptions):SDS_DataStore {
    const Doc        = new Loro()
    const EntriesMap = Doc.getMap('Entries') as LoroMap

    // root data (outermost data, no outer data)
    const Root = EntriesMap.setContainer(RootId, new LoroMap()) as LoroMap
    Root.set('Kind',        'item')
    Root.set('outerItemId', '')
    Root.set('OrderKey',    '')
    Root.setContainer('Label', new LoroText())
    Root.setContainer('Info',  new LoroMap())
    Root.set('MIMEType',   '')
    Root.set('ValueKind',  'none')

    // Trash data
    const Trash = EntriesMap.setContainer(TrashId, new LoroMap()) as LoroMap
    Trash.set('Kind',        'item')
    Trash.set('outerItemId', RootId)
    Trash.set('OrderKey',    'a0')
    const TrashLabel = Trash.setContainer('Label', new LoroText()) as LoroText
    TrashLabel.insert(0, 'trash')
    Trash.setContainer('Info', new LoroMap())
    Trash.set('MIMEType',  '')
    Trash.set('ValueKind', 'none')

    // Lost & Found data
    const LostAndFound = EntriesMap.setContainer(LostAndFoundId, new LoroMap()) as LoroMap
    LostAndFound.set('Kind',        'item')
    LostAndFound.set('outerItemId', RootId)
    LostAndFound.set('OrderKey',    'a1')
    const LafLabel = LostAndFound.setContainer('Label', new LoroText()) as LoroText
    LafLabel.insert(0, 'lost-and-found')
    LostAndFound.setContainer('Info', new LoroMap())
    LostAndFound.set('MIMEType',  '')
    LostAndFound.set('ValueKind', 'none')

    Doc.commit()
    return new SDS_DataStore(Doc, Options)
  }

/**** fromBinary — restore store from gzip-compressed binary data ****/

  static fromBinary (Data:Uint8Array, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const Doc = new Loro()
    Doc.import(gunzipSync(Data))
    return new SDS_DataStore(Doc, Options)
  }

/**** fromJSON — restore store from a plain JSON object or its JSON.stringify representation ****/

  static fromJSON (Serialisation:unknown, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const JSON_ = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation)
      : Serialisation) as SDS_ItemJSON

    const Doc        = new Loro()
    const EntriesMap = Doc.getMap('Entries') as LoroMap

    Doc.commit()
    _loroCreateEntry(JSON_, '', '', EntriesMap)
    Doc.commit()

    return new SDS_DataStore(Doc, Options)
  }

//----------------------------------------------------------------------------//
//                             Well-known items                               //
//----------------------------------------------------------------------------//

/**** RootItem / TrashItem / LostAndFoundItem — well-known data accessors ****/

  get RootItem ():SDS_Item         { return this.#wrappedItem(RootId) }
  get TrashItem ():SDS_Item        { return this.#wrappedItem(TrashId) }
  get LostAndFoundItem ():SDS_Item { return this.#wrappedItem(LostAndFoundId) }

//----------------------------------------------------------------------------//
//                                   Lookup                                   //
//----------------------------------------------------------------------------//

/**** EntryWithId — retrieve an entry by Id ****/

  EntryWithId (EntryId:string):SDS_Entry | undefined {
    const EntryMap = this.#getEntryMap(EntryId)
    if (EntryMap == null) { return undefined }
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

    const Id         = crypto.randomUUID()
    const OrderKey   = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
    const storedType = effectiveType === DefaultMIMEType ? '' : effectiveType

    this.transact(() => {
      const EntryMap = this.#EntriesMap.setContainer(Id, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'item')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.setContainer('Label', new LoroText())
      EntryMap.setContainer('Info',  new LoroMap())
      EntryMap.set('MIMEType',   storedType)
      EntryMap.set('ValueKind',  'none')

      this.#addToReverseIndex(outerItem.Id, Id)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerItem')
    })

    return this.#wrappedItem(Id)
  }

/**** newLinkAt — create a new link within an outer data ****/

  newLinkAt (Target:SDS_Item, outerItem:SDS_Item, InsertionIndex?:number):SDS_Link {
    if (Target == null)     throw new SDS_Error('invalid-argument','Target must not be missing')
    if (outerItem == null)  throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(Target.Id)
    this.#requireItemExists(outerItem.Id)

    const Id       = crypto.randomUUID()
    const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.setContainer(Id, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.setContainer('Label', new LoroText())
      EntryMap.setContainer('Info',  new LoroMap())
      EntryMap.set('TargetId',    Target.Id)

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
      const EntryMap = this.#EntriesMap.setContainer(newId, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)
      const LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
      if (JSON_.Label) { LabelText.insert(0, JSON_.Label) }
      const InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
      for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }
      EntryMap.set('TargetId', JSON_.TargetId ?? '')

      this.#addToReverseIndex(outerItem.Id, newId)
      if (JSON_.TargetId) { this.#addToLinkTargetIndex(JSON_.TargetId, newId) }
      this.#recordChange(outerItem.Id, 'innerEntryList')
    })

    return this.#wrappedLink(newId)
  }

//----------------------------------------------------------------------------//
//                               Move / Delete                                //


/**** moveEntryTo — move an entry to a different outer data ****/

  moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, InsertionIndex?:number):void {
    parseInsertionIndex(InsertionIndex)
    if (! this._mayMoveEntryTo(Entry.Id, outerItem.Id, InsertionIndex)) {
      throw new SDS_Error('move-would-cycle',
        'cannot move an entry into one of its own descendants')
    }

    const oldOuterItemId = this._outerItemIdOf(Entry.Id)
    const OrderKey       = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#getEntryMap(Entry.Id)!
      EntryMap.set('outerItemId', outerItem.Id)
      EntryMap.set('OrderKey',    OrderKey)

      if (oldOuterItemId === TrashId && outerItem.Id !== TrashId) {
        const InfoMap = EntryMap.get('Info') as LoroMap | undefined
        if (InfoMap instanceof LoroMap && InfoMap.get('_trashedAt') != null) {
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
      const EntryMap = this.#getEntryMap(innerEntry.Id)
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
      const EntryMap = this.#getEntryMap(Entry.Id)!
      EntryMap.set('outerItemId', TrashId)
      EntryMap.set('OrderKey',    OrderKey)

      let InfoMap = EntryMap.get('Info') as LoroMap | undefined
      if (! (InfoMap instanceof LoroMap)) {
        InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
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

/**** purgeEntry — permanently delete a trash entry ****/

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

/**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/

  purgeExpiredTrashEntries (TTLms?:number):number {
    const effectiveTTL = TTLms ?? this.#TrashTTLms
    if (effectiveTTL == null) { return 0 }
    const Now           = Date.now()
    const TrashChildren = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set<string>())
    let Count = 0
    for (const EntryId of TrashChildren) {
      const EntryMap = this.#getEntryMap(EntryId)
      if (EntryMap == null) { continue }
      if (EntryMap.get('outerItemId') !== TrashId) { continue }
      const InfoMap   = EntryMap.get('Info') as LoroMap | undefined
      const trashedAt = InfoMap instanceof LoroMap ? InfoMap.get('_trashedAt') : undefined
      if (typeof trashedAt !== 'number') { continue }
      if (Now-trashedAt < effectiveTTL) { continue }
      try {
        this.purgeEntry(this.#wrapped(EntryId))
        Count++
      } catch (_Signal) { /* protected or already removed — skip */ }
    }
    return Count
  }

/**** dispose — cleanup and stop background timers ****/

  dispose ():void {
    if (this.#TrashCheckTimer != null) {
      clearInterval(this.#TrashCheckTimer)
      this.#TrashCheckTimer = null
    }
  }

//----------------------------------------------------------------------------//
//                           Transactions & Events                            //
//----------------------------------------------------------------------------//

/**** transact — execute operations within a batch transaction ****/

  transact (Callback:() => void):void {
    this.#TransactionDepth++
    try {
      Callback()
    } finally {
      this.#TransactionDepth--
      if (this.#TransactionDepth === 0) {
        // Commit the Loro transaction (only for local changes)
        if (! this.#ApplyingExternal) { this.#doc.commit() }
        const ChangeSet          = { ...this.#PendingChangeSet }
        this.#PendingChangeSet   = {}
        const Origin:ChangeOrigin = this.#ApplyingExternal ? 'external' : 'internal'
        this.#notifyHandlers(Origin, ChangeSet)
      }
    }
  }

/**** onChangeInvoke — register a change listener and return unsubscribe function ****/

  onChangeInvoke (Handler:ChangeHandler):() => void {
    this.#Handlers.add(Handler)
    return () => { this.#Handlers.delete(Handler) }
  }

//----------------------------------------------------------------------------//
//                                    Sync                                    //
//----------------------------------------------------------------------------//

/**** applyRemotePatch — merge remote changes and rebuild indices ****/

  applyRemotePatch (encodedPatch:Uint8Array):void {
    this.#ApplyingExternal = true
    try {
      this.#doc.import(encodedPatch)
      this.transact(() => {
        this.#updateIndicesFromView()
      })
    } finally {
      this.#ApplyingExternal = false
    }
    this.recoverOrphans()
  }

/**** currentCursor — get current version vector as sync cursor ****/

  get currentCursor ():SDS_SyncCursor {
    // Encode Loro VersionVector as bytes for use as SDS_SyncCursor
    return this.#doc.version().encode()
  }

/**** exportPatch — generate a change patch since a given cursor ****/

  exportPatch (sinceCursor?:SDS_SyncCursor):Uint8Array {
    if (sinceCursor == null || sinceCursor.byteLength === 0) {
      return this.#doc.export({ mode: 'snapshot' })
    }
    return this.#doc.export({ mode: 'update', from: VersionVector.decode(sinceCursor) })
  }

/**** recoverOrphans — move entries with missing parents to lost-and-found ****/

  recoverOrphans ():void {
    const allIds   = new Set(Object.keys(this.#EntriesMap.toJSON() as object))
    let hasChanges = false

    this.transact(() => {
      const EntriesJSON = this.#EntriesMap.toJSON() as Record<string,any>
      for (const [EntryId, EntryData] of Object.entries(EntriesJSON)) {
        if (EntryId === RootId) { continue }

        const outerItemId = EntryData.outerItemId as string | undefined
        if (outerItemId && ! allIds.has(outerItemId)) {
          const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
          const EntryMap = this.#getEntryMap(EntryId)!
          EntryMap.set('outerItemId', LostAndFoundId)
          EntryMap.set('OrderKey',    OrderKey)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(EntryId, 'outerItem')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          hasChanges = true
        }

        if (EntryData.Kind === 'link') {
          const TargetId = EntryData.TargetId as string | undefined
          if (TargetId && ! allIds.has(TargetId)) {
            const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
            const newEntry = this.#EntriesMap.setContainer(TargetId, new LoroMap()) as LoroMap
            newEntry.set('Kind',        'item')
            newEntry.set('outerItemId', LostAndFoundId)
            newEntry.set('OrderKey',    OrderKey)
            newEntry.setContainer('Label', new LoroText())
            newEntry.setContainer('Info',  new LoroMap())
            newEntry.set('MIMEType',   '')
            newEntry.set('ValueKind',  'none')
            this.#addToReverseIndex(LostAndFoundId, TargetId)
            allIds.add(TargetId)
            this.#recordChange(LostAndFoundId, 'innerEntryList')
            hasChanges = true
          }
        }
      }
    })
  }

//----------------------------------------------------------------------------//
//                             Serialisation                                  //
//----------------------------------------------------------------------------//

/**** asBinary — export store as gzip-compressed Loro snapshot ****/

  asBinary ():Uint8Array {
    return gzipSync(this.#doc.export({ mode: 'snapshot' }))
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

/**** #getEntryMap — returns the LoroMap for a given entry Id ****/

  #getEntryMap (Id:string):LoroMap | undefined {
    const Value = this.#EntriesMap.get(Id)
    if (! (Value instanceof LoroMap)) { return undefined }
    // treat tombstoned entries (outerItemId === '') as non-existent
    if (Value.get('outerItemId') === '' && Id !== RootId) { return undefined }
    return Value
  }

/**** #requireItemExists — throw if data does not exist ****/

  #requireItemExists (Id:string):void {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null || EntryMap.get('Kind') !== 'item') {
      throw new SDS_Error('invalid-argument', `item '${Id}' does not exist`)
    }
  }

/**** #wrapped / #wrappedItem / #wrappedLink — return cached wrapper objects ****/

  #wrapped (Id:string):SDS_Entry {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) {
      throw new SDS_Error('invalid-argument', `entry '${Id}' not found`)
    }
    return EntryMap.get('Kind') === 'item' ? this.#wrappedItem(Id) : this.#wrappedLink(Id)
  }

  #wrappedItem (Id:string):SDS_Item {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Item) { return Cached }
    const Wrapper = new SDS_Item(this, Id)
    this.#CacheWrapper(Id, Wrapper)
    return Wrapper
  }

  #wrappedLink (Id:string):SDS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Link) { return Cached }
    const Wrapper = new SDS_Link(this, Id)
    this.#CacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #CacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/

  #CacheWrapper (Id:string, Wrapper:SDS_Entry):void {
    if (this.#WrapperCache.size >= this.#MaxCacheSize) {
      const FirstKey = this.#WrapperCache.keys().next().value
      if (FirstKey != null) { this.#WrapperCache.delete(FirstKey) }
    }
    this.#WrapperCache.set(Id, Wrapper)
  }

/**** #rebuildIndices — full rebuild of all indices from scratch ****/

  #rebuildIndices ():void {
    this.#ReverseIndex.clear()
    this.#ForwardIndex.clear()
    this.#LinkTargetIndex.clear()
    this.#LinkForwardIndex.clear()

    const EntriesJSON = this.#EntriesMap.toJSON() as Record<string,any>
    for (const [EntryId, EntryData] of Object.entries(EntriesJSON)) {
      const outerItemId = EntryData.outerItemId as string | undefined
      if (outerItemId) { this.#addToReverseIndex(outerItemId, EntryId) }
      if (EntryData.Kind === 'link') {
        const TargetId = EntryData.TargetId as string | undefined
        if (TargetId) { this.#addToLinkTargetIndex(TargetId, EntryId) }
      }
    }
  }

/**** #updateIndicesFromView — incremental diff used after remote patches ****/

  #updateIndicesFromView ():void {
    const EntriesJSON = this.#EntriesMap.toJSON() as Record<string,any>
    const SeenIds     = new Set<string>()

    // Pass 1: created and changed entries
    for (const [EntryId, EntryData] of Object.entries(EntriesJSON)) {
      SeenIds.add(EntryId)

      const newOuterItemId = (EntryData.outerItemId as string | undefined) || undefined
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
        case (EntryData.Kind === 'link'): {
          const newTargetId = EntryData.TargetId as string | undefined
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

      this.#recordChange(EntryId, 'Label')
    }

    // Pass 2: deleted entries
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

/**** #addToReverseIndex — add entry to reverse and forward indices ****/

  #addToReverseIndex (outerItemId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerItemId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerItemId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerItemId)
  }

/**** #removeFromReverseIndex — remove entry from indices ****/

  #removeFromReverseIndex (outerItemId:string, EntryId:string):void {
    this.#ReverseIndex.get(outerItemId)?.delete(EntryId)
    this.#ForwardIndex.delete(EntryId)
  }

/**** #addToLinkTargetIndex — add link to target and forward indices ****/

  #addToLinkTargetIndex (TargetId:string, LinkId:string):void {
    let Links = this.#LinkTargetIndex.get(TargetId)
    if (Links == null) {
      Links = new Set()
      this.#LinkTargetIndex.set(TargetId, Links)
    }
    Links.add(LinkId)
    this.#LinkForwardIndex.set(LinkId, TargetId)
  }

/**** #removeFromLinkTargetIndex — remove link from indices ****/

  #removeFromLinkTargetIndex (TargetId:string, LinkId:string):void {
    this.#LinkTargetIndex.get(TargetId)?.delete(LinkId)
    this.#LinkForwardIndex.delete(LinkId)
  }

/**** #OrderKeyAt — generate fractional order key for insertion position ****/

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

/**** #lastOrderKeyOf — get the last order key for an entry's children ****/

  #lastOrderKeyOf (DataId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(DataId)
    return innerEntries.length > 0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/

  #sortedInnerEntriesOf (DataId:string):Array<{ Id:string; OrderKey:string }> {
    const innerIds = this.#ReverseIndex.get(DataId) ?? new Set<string>()
    const Result: Array<{ Id:string; OrderKey:string }> = []
    for (const innerEntryId of innerIds) {
      const EntryMap = this.#getEntryMap(innerEntryId)
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

/**** #SubtreeHasIncomingLinks — check if subtree has links from reachable entries ****/

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

/**** #directTrashInnerEntryContaining — get direct inner entry of TrashItem containing an entry ****/

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
    const EntryMap = this.#getEntryMap(EntryId)
    if (EntryMap == null) { return }

    const Kind           = EntryMap.get('Kind') as string
    const oldOuterItemId = EntryMap.get('outerItemId') as string | undefined

    const RootReachable = this.#reachableFromRoot()
    const Protected     = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#SubtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        const innerMap = this.#getEntryMap(innerEntryId)!
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

    // signal deletion before tombstoning the entry (so listeners can still read ValueRef etc.)
    this.#recordChange(EntryId, 'Existence')

    // in Loro, we "delete" by marking as having no valid outer data — Loro doesn't
    // support removing a nested container key directly in all versions.
    // We set all fields to tombstone values and remove from our indices.
    // Data: their CRDT doc will keep the key but it becomes an orphan
    // that is invisible to normal traversal (outerItemId = '' / not in any index).
    // For a true delete, use:
    //   this.#EntriesMap.delete(EntryId)   // if supported by loro-crdt version
    // Otherwise we tombstone the entry:
    EntryMap.set('outerItemId', '')
    EntryMap.set('OrderKey',    '')

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

/**** _KindOf — get entry kind (data or link) ****/

  _KindOf (Id:string):'item' | 'link' {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) { throw new SDS_Error('not-found', `entry '${Id}' not found`) }
    return EntryMap.get('Kind') as 'item' | 'link'
  }

/**** _LabelOf — get entry label text ****/

  _LabelOf (Id:string):string {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) { return '' }
    const LabelVal = EntryMap.get('Label')
    return LabelVal instanceof LoroText ? LabelVal.toString() : String(LabelVal ?? '')
  }

/**** _setLabelOf — set entry label text ****/

  _setLabelOf (Id:string, Value:string):void {
    expectValidLabel(Value)
    this.transact(() => {
      const EntryMap = this.#getEntryMap(Id)
      if (EntryMap == null) { return }
      let LabelText = EntryMap.get('Label') as LoroText | undefined
      if (LabelText instanceof LoroText) {
        const Len = LabelText.toString().length
        if (Len > 0) { LabelText.delete(0, Len) }
        if (Value.length > 0) { LabelText.insert(0, Value) }
      } else {
        LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
        if (Value.length > 0) { LabelText.insert(0, Value) }
      }
      this.#recordChange(Id, 'Label')
    })
  }

/**** _TypeOf — get entry MIME type ****/

  _TypeOf (Id:string):string {
    const EntryMap = this.#getEntryMap(Id)
    const Stored   = (EntryMap?.get('MIMEType') as string | undefined) ?? ''
    return Stored === '' ? DefaultMIMEType : Stored
  }

/**** _setTypeOf — set entry MIME type ****/

  _setTypeOf (Id:string, Value:string):void {
    expectValidMIMEType(Value)
    const storedValue = Value === DefaultMIMEType ? '' : Value
    this.transact(() => {
      this.#getEntryMap(Id)?.set('MIMEType', storedValue)
      this.#recordChange(Id, 'Type')
    })
  }

/**** _ValueKindOf — get value kind (none, literal, binary, reference types) ****/

  _ValueKindOf (Id:string):
    'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending'
  {
    const EntryMap = this.#getEntryMap(Id)
    return ((EntryMap?.get('ValueKind') as string | undefined) ?? 'none') as any
  }

/**** _readValueOf — read entry value (literal or binary) ****/

  async _readValueOf (Id:string):Promise<string | Uint8Array | undefined> {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'none'): return undefined
      case (Kind === 'literal'): {
        const EntryMap   = this.#getEntryMap(Id)
        const LiteralVal = EntryMap?.get('literalValue')
        return LiteralVal instanceof LoroText ? LiteralVal.toString() : String(LiteralVal ?? '')
      }
      case (Kind === 'binary'): {
        const EntryMap = this.#getEntryMap(Id)
        const BinVal   = EntryMap?.get('binaryValue')
        return BinVal instanceof Uint8Array ? BinVal : undefined
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

/**** _writeValueOf — write entry value with automatic storage strategy ****/

  _writeValueOf (Id:string, Value:string | Uint8Array | undefined):void {
    this.transact(() => {
      const EntryMap = this.#getEntryMap(Id)
      if (EntryMap == null) { return }

      switch (true) {
        case (Value == null): {
          EntryMap.set('ValueKind', 'none')
          break
        }
        case (typeof Value === 'string' && (Value as string).length <= this.#LiteralSizeLimit): {
          EntryMap.set('ValueKind', 'literal')
          let LiteralText = EntryMap.get('literalValue') as LoroText | undefined
          if (LiteralText instanceof LoroText) {
            const Len = LiteralText.toString().length
            if (Len > 0) { LiteralText.delete(0, Len) }
            if ((Value as string).length > 0) { LiteralText.insert(0, Value as string) }
          } else {
            LiteralText = EntryMap.setContainer('literalValue', new LoroText()) as LoroText
            if ((Value as string).length > 0) { LiteralText.insert(0, Value as string) }
          }
          break
        }
        case (typeof Value === 'string'): {
          const Encoder = new TextEncoder()
          const Bytes   = Encoder.encode(Value as string)
          const Hash    = SDS_DataStore._BLOBhash(Bytes)
          this._storeValueBlob(Hash, Bytes)
          EntryMap.set('ValueKind', 'literal-reference')
          EntryMap.set('ValueRef',  JSON.stringify({ Hash, Size:Bytes.byteLength }))
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
          EntryMap.set('ValueRef',  JSON.stringify({ Hash, Size:Bytes.byteLength }))
          break
        }
      }
      this.#recordChange(Id, 'Value')
    })
  }

/**** _spliceValueOf — modify literal value text at a range ****/

  _spliceValueOf (Id:string, fromIndex:number, toIndex:number, Replacement:string):void {
    if (this._ValueKindOf(Id) !== 'literal') {
      throw new SDS_Error('change-value-not-literal',
        'changeValue() is only available when ValueKind === \'literal\'')
    }
    this.transact(() => {
      const EntryMap    = this.#getEntryMap(Id)
      const LiteralText = EntryMap?.get('literalValue') as LoroText | undefined
      if (LiteralText instanceof LoroText) {
        const DeleteCount = toIndex-fromIndex
        if (DeleteCount > 0) { LiteralText.delete(fromIndex, DeleteCount) }
        if (Replacement.length > 0) { LiteralText.insert(fromIndex, Replacement) }
      }
      this.#recordChange(Id, 'Value')
    })
  }

/**** _getValueRefOf — return the ValueRef for *-reference entries ****/

  _getValueRefOf (Id:string):{ Hash:string; Size:number } | undefined {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) { return undefined }
    const Kind = this._ValueKindOf(Id)
    if (Kind !== 'literal-reference' && Kind !== 'binary-reference') { return undefined }
    const Raw = EntryMap.get('ValueRef')
    if (Raw == undefined) { return undefined }
    return (typeof Raw === 'string' ? JSON.parse(Raw) : Raw) as { Hash:string; Size:number }
  }

/**** _InfoProxyOf — get proxy for arbitrary metadata object ****/

  _InfoProxyOf (Id:string):Record<string,unknown> {
    const Store = this
    return new Proxy({} as Record<string,unknown>, {
      get (_target, Key) {
        if (typeof Key !== 'string') { return undefined }
        const EntryMap = Store.#getEntryMap(Id)
        const InfoMap  = EntryMap?.get('Info') as LoroMap | undefined
        return InfoMap instanceof LoroMap ? InfoMap.get(Key) : undefined
      },
      set (_target, Key, Value) {
        if (typeof Key !== 'string') { return false }
        if (Value === undefined) {
          Store.transact(() => {
            const EntryMap = Store.#getEntryMap(Id)
            const InfoMap  = EntryMap?.get('Info') as LoroMap | undefined
            if (InfoMap instanceof LoroMap) {
              const existed = InfoMap.get(Key) !== undefined
              InfoMap.delete(Key)
              if (existed) { Store.#recordChange(Id, `Info.${Key}`) }
            }
          })
          return true
        }
        expectValidInfoKey(Key)
        checkInfoValueSize(Value)
        Store.transact(() => {
          const EntryMap = Store.#getEntryMap(Id)
          if (EntryMap == null) { return }
          let InfoMap = EntryMap.get('Info') as LoroMap | undefined
          if (! (InfoMap instanceof LoroMap)) {
            InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
          }
          InfoMap.set(Key, Value)
          Store.#recordChange(Id, `Info.${Key}`)
        })
        return true
      },
      deleteProperty (_target, Key) {
        if (typeof Key !== 'string') { return false }
        Store.transact(() => {
          const EntryMap = Store.#getEntryMap(Id)
          const InfoMap  = EntryMap?.get('Info') as LoroMap | undefined
          if (InfoMap instanceof LoroMap) {
            const existed = InfoMap.get(Key) !== undefined
            InfoMap.delete(Key)
            if (existed) { Store.#recordChange(Id, `Info.${Key}`) }
          }
        })
        return true
      },
      ownKeys () {
        const EntryMap = Store.#getEntryMap(Id)
        const InfoMap  = EntryMap?.get('Info') as LoroMap | undefined
        if (! (InfoMap instanceof LoroMap)) { return [] }
        return Object.keys(InfoMap.toJSON() as object)
      },
      getOwnPropertyDescriptor (_target, Key) {
        if (typeof Key !== 'string') { return undefined }
        const EntryMap = Store.#getEntryMap(Id)
        const InfoMap  = EntryMap?.get('Info') as LoroMap | undefined
        if (! (InfoMap instanceof LoroMap)) { return undefined }
        const Value = InfoMap.get(Key)
        return Value !== undefined
          ? { configurable:true, enumerable:true, value:Value }
          : undefined
      },
    })
  }

/**** _outerItemIdOf — get outer item Id or undefined ****/

  _outerItemIdOf (Id:string):string | undefined {
    const EntryMap     = this.#getEntryMap(Id)
    const outerItemId  = EntryMap?.get('outerItemId') as string | undefined
    return (outerItemId != null && outerItemId !== '') ? outerItemId : undefined
  }

/**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/

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


/**** _mayMoveEntryTo — check if entry can be moved without cycles ****/

  _mayMoveEntryTo (Id:string, outerItemId:string, _InsertionIndex?:number):boolean {
    if (Id === RootId || Id === outerItemId) { return false }
    if (Id === TrashId || Id === LostAndFoundId) { return outerItemId === RootId }
    return ! this.#isDescendantOf(outerItemId, Id)
  }


/**** _mayDeleteEntry — check if entry is deletable ****/

  _mayDeleteEntry (Id:string):boolean {
    return Id !== RootId && Id !== TrashId && Id !== LostAndFoundId
  }


/**** _TargetOf — get the target data for a link ****/

  _TargetOf (Id:string):SDS_Item {
    const EntryMap = this.#getEntryMap(Id)
    const TargetId = EntryMap?.get('TargetId') as string | undefined
    if (! TargetId) {
      throw new SDS_Error('not-found', `link '${Id}' has no target`)
    }
    return this.#wrappedItem(TargetId)
  }


/**** _currentValueOf — synchronously return the inline value of an item ****/

  _currentValueOf (Id:string):string | Uint8Array | undefined {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'literal'): {
        const EntryMap   = this.#getEntryMap(Id)
        const LiteralVal = EntryMap?.get('literalValue')
        return LiteralVal instanceof LoroText ? LiteralVal.toString() : String(LiteralVal ?? '')
      }
      case (Kind === 'binary'): {
        const EntryMap = this.#getEntryMap(Id)
        const BinVal   = EntryMap?.get('binaryValue')
        return BinVal instanceof Uint8Array ? BinVal : undefined
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

/**** #importEntryFromJSON — recursively create a Loro entry and update indices ****/

  #importEntryFromJSON (
    JSON_:SDS_EntryJSON, outerItemId:string, OrderKey:string,
    IdMap:Map<string,string>
  ):void {
    const newId    = IdMap.get(JSON_.Id)!
    const EntryMap = this.#EntriesMap.setContainer(newId, new LoroMap()) as LoroMap
    EntryMap.set('Kind',        JSON_.Kind)
    EntryMap.set('outerItemId', outerItemId)
    EntryMap.set('OrderKey',    OrderKey)
    const LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
    if (JSON_.Label) { LabelText.insert(0, JSON_.Label) }
    const InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
    for (const [Key, Val] of Object.entries(JSON_.Info ?? {})) { InfoMap.set(Key, Val) }

    if (JSON_.Kind === 'item') {
      const ItemJSON   = JSON_ as SDS_ItemJSON
      const storedType = ItemJSON.Type === DefaultMIMEType ? '' : (ItemJSON.Type ?? '')
      EntryMap.set('MIMEType', storedType)

      switch (true) {
        case (ItemJSON.ValueKind === 'literal' && ItemJSON.Value !== undefined): {
          EntryMap.set('ValueKind', 'literal')
          const LitText = EntryMap.setContainer('literalValue', new LoroText()) as LoroText
          if (ItemJSON.Value!.length > 0) { LitText.insert(0, ItemJSON.Value!) }
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
      this.#addToReverseIndex(outerItemId, newId)
      if (TargetId) { this.#addToLinkTargetIndex(TargetId, newId) }
    }
  }

/**** #isDescendantOf — check if one entry is a descendant of another ****/

  #isDescendantOf (MaybeDescendantId:string, AncestorId:string):boolean {
    let currentId:string | undefined = MaybeDescendantId
    while (currentId != null) {
      if (currentId === AncestorId) { return true }
      currentId = this._outerItemIdOf(currentId)
    }
    return false
  }
}
