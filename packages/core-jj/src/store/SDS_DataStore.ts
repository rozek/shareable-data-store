/*******************************************************************************
*                                                                              *
*       SDS_DataStore - wraps a json-joy CRDT Model without exposing it        *
*                                                                              *
*******************************************************************************/

// json-joy Model data model:
//
//   model.root.Entries   →  { [id: string]: EntryRecord }
//
//   Per-entry EntryRecord fields:
//     Kind:          string           'item' | 'link'
//     outerPlacement:{outerItemId, OrderKey}
//     Label:         string           collaborative string
//     Info:          { [key: string]: any }  arbitrary metadata
//     MIMEType:      string           (items only; '' = 'text/plain')
//     ValueKind:     string           (items only)
//     literalValue:  string           (items, ValueKind=literal only)
//     binaryValue:   Uint8Array       (items, ValueKind=binary only)
//     ValueRef:      { Hash, Size }   (items, *-reference only)
//     TargetId:      string           (links only)

import { Model } from 'json-joy/lib/json-crdt/index.js'
import { s as Schema } from 'json-joy/lib/json-crdt-patch/schema.js'
import { Patch } from 'json-joy/lib/json-crdt-patch/index.js'
import { gzipSync, gunzipSync } from 'fflate'
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'
import { z } from 'zod'
import {
  SDS_Error, SDS_Entry, SDS_Item, SDS_Link, SDS_DataStore as SDS_StoreBase,
  SDS_DataStoreOptions,
  maxOrderKeyLength,
  expectValidLabel, expectValidMIMEType, expectValidInfoKey, checkInfoValueSize,
  _base64ToUint8Array,
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit,
  DefaultWrapperCacheSize,
} from '@rozek/sds-core'
import { CanonicalEmptySnapshot } from './canonical-empty-snapshot.js'
import type { SDS_ChangeSet, SDS_SyncCursor, ChangeOrigin, ChangeHandler } from '@rozek/sds-core'
import type { SDS_EntryJSON, SDS_ItemJSON, SDS_LinkJSON } from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export type { ChangeOrigin, ChangeHandler, SDS_DataStoreOptions }

//----------------------------------------------------------------------------//
//                           Module-level Helpers                             //
//----------------------------------------------------------------------------//

/**** _createEntry — recursively populate a json-joy model from a JSON subtree ****/

// used by SDS_DataStore.fromJSON() only; does NOT update in-memory indices
// (the constructor calls #rebuildIndices() after fromJSON populates the model)

  function _createEntry (
    JSON_:SDS_EntryJSON, outerItemId:string, OrderKey:string, Model_:Model
  ):void {
    const Id = JSON_.Id

    const InfoObj:Record<string,any> = {}
    for (const Key of Object.keys(JSON_.Info)) { InfoObj[Key] = Schema.con(JSON_.Info[Key]) }

    if (JSON_.Kind === 'link') {
      Model_.api.obj(['Entries']).set({ [Id]: Schema.obj({
        Kind:           Schema.con('link'),
        outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
        Label:          Schema.val(Schema.str(JSON_.Label)),
        Info:           Schema.obj(InfoObj),
        TargetId:       Schema.con(JSON_.TargetId),
      }) })
      return
    }

    const storedType = JSON_.Type === DefaultMIMEType ? '' : JSON_.Type
    const EntryObj:Record<string,any> = {
      Kind:           Schema.con('item'),
      outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
      Label:          Schema.val(Schema.str(JSON_.Label)),
      Info:           Schema.obj(InfoObj),
      MIMEType:       Schema.val(Schema.str(storedType)),
      ValueKind:      Schema.val(Schema.str(JSON_.ValueKind)),
    }

    switch (true) {
      case (JSON_.ValueKind === 'literal' && JSON_.Value != null):
        EntryObj.literalValue = Schema.val(Schema.str(JSON_.Value))
        break
      case (JSON_.ValueKind === 'binary' && JSON_.Value != null):
        EntryObj.binaryValue = Schema.con(_base64ToUint8Array(JSON_.Value))
        break
    }

    Model_.api.obj(['Entries']).set({ [Id]: Schema.obj(EntryObj) })

    if (JSON_.innerEntries.length > 0) {
      const OrderKeys = generateNKeysBetween(null, null, JSON_.innerEntries.length)
      for (let i = 0; i < JSON_.innerEntries.length; i++) {
        _createEntry(JSON_.innerEntries[i], Id, OrderKeys[i], Model_)
      }
    }
  }

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
//                                SDS_DataStore                               //
//----------------------------------------------------------------------------//

export class SDS_DataStore extends SDS_StoreBase {

/**** private state ****/

  #Model:Model
  #LiteralSizeLimit:number
  #TrashTTLms:number
  #TrashCheckTimer:ReturnType<typeof setInterval> | null = null
  #Handlers:Set<ChangeHandler> = new Set()

  // reverse index: outerItemId → Set<entryId>
  #ReverseIndex:Map<string, Set<string>> = new Map()

  // forward index: entryId → outerItemId (kept in sync with #ReverseIndex)
  #ForwardIndex:Map<string, string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex:Map<string, Set<string>> = new Map()

  // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
  #LinkForwardIndex:Map<string, string> = new Map()

  // LRU wrapper cache
  #WrapperCache:Map<string, SDS_Entry> = new Map()
  readonly #MaxCacheSize = DefaultWrapperCacheSize

  // transaction nesting
  #TransactionDepth = 0

  // ChangeSet accumulator inside a transaction
  #pendingChangeSet:SDS_ChangeSet = {}

  // patch log for exportPatch() — only locally generated patches (as binaries)
  #localPatches:Uint8Array[] = []

  // suppress index updates / change tracking when applying remote patches
  #applyingExternal = false

//----------------------------------------------------------------------------//
//                                Construction                                //
//----------------------------------------------------------------------------//

/**** constructor — initialize store with model and configuration ****/

  private constructor (Model_:Model, Options?:SDS_DataStoreOptions) {
    super()
    this.#Model = Model_
    this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit
    this.#TrashTTLms = Options?.TrashTTLms ?? 2_592_000_000

    this.#rebuildIndices()

    const CheckInterval =
      Options?.TrashCheckIntervalMs ??
      Math.min(Math.floor(this.#TrashTTLms/4), 3600000)
    this.#TrashCheckTimer = setInterval(
      () => {
        this.purgeExpiredTrashEntries()
      },
      CheckInterval
    )
    // let Node.js exit even while the timer is pending
    if (typeof (this.#TrashCheckTimer as any).unref === 'function') {
      (this.#TrashCheckTimer as any).unref()
    }
  }

/**** fromScratch — create store from canonical empty snapshot ****/

  static fromScratch (Options?:SDS_DataStoreOptions):SDS_DataStore {
    return this.fromBinary(CanonicalEmptySnapshot, Options)
  }

/**** fromBinary — deserialize store from binary snapshot ****/

  static fromBinary (Serialisation:Uint8Array, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const decompressedSerialisation = gunzipSync(Serialisation)
    const restoredStore             = Model.fromBinary(decompressedSerialisation)
    return new SDS_DataStore(restoredStore,Options)
  }

/**** fromJSON — deserialize store from a plain JSON object or JSON string ****/

  static fromJSON (Serialisation:unknown, Options?:SDS_DataStoreOptions):SDS_DataStore {
    const serialisedJSON = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation)
      : Serialisation) as SDS_ItemJSON
    const restoredStore = Model.fromBinary(gunzipSync(CanonicalEmptySnapshot))
    _createEntry(serialisedJSON, '', '', restoredStore)
    restoredStore.api.flush()
    return new SDS_DataStore(restoredStore, Options)
  }

//----------------------------------------------------------------------------//
//                             Public Accessors                               //
//----------------------------------------------------------------------------//

/**** RootItem / TrashItem / LostAndFoundItem — access special items ****/

  get RootItem ():SDS_Item {
    return this.#wrapped(RootId) as SDS_Item
  }

  get TrashItem ():SDS_Item {
    return this.#wrapped(TrashId) as SDS_Item
  }

  get LostAndFoundItem ():SDS_Item {
    return this.#wrapped(LostAndFoundId) as SDS_Item
  }

/**** EntryWithId — retrieve entry by id ****/

  EntryWithId (Id:string):SDS_Entry | undefined {
    const EntryData = this.#view().Entries[Id]
    if (EntryData != null) {
      return this.#wrapped(Id) as SDS_Entry
    }
    return undefined
  }

//----------------------------------------------------------------------------//
//                             Public Mutators                                //
//----------------------------------------------------------------------------//

/**** newItemAt — create a new item of given type as inner entry of outerItem ****/

  newItemAt (
    MIMEType:string|undefined, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Item {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    const MIMEType_ = MIMEType ?? DefaultMIMEType
    expectValidMIMEType(MIMEType_)
    parseInsertionIndex(InsertionIndex)

    const DataId = crypto.randomUUID()
    this.transact(() => {
      const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
      const storedType = MIMEType_ === DefaultMIMEType ? '' : MIMEType_
      const EntryData = Schema.obj({
        Kind: Schema.con('item'),
        outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey })),
        Label: Schema.val(Schema.str('')),
        Info: Schema.obj({}),
        MIMEType: Schema.val(Schema.str(storedType)),
        ValueKind: Schema.val(Schema.str('none'))
      })
      this.#Model.api
        .obj(['Entries'])
        .set({ [DataId]: EntryData })
      this.#addToReverseIndex(outerItem.Id, DataId)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(DataId, 'outerItem')
    })
    return this.#wrapped(DataId) as SDS_Item
  }

/**** newLinkAt — create new link in specified location ****/

  newLinkAt (
    Target:SDS_Item, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Link {
    if (Target == null)     throw new SDS_Error('invalid-argument','Target must not be missing')
    if (outerItem == null)  throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)
    this.#requireItemExists(Target.Id)
    this.#requireItemExists(outerItem.Id)

    const LinkId = crypto.randomUUID()
    this.transact(() => {
      const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
      const LinkData = Schema.obj({
        Kind: Schema.con('link'),
        outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey })),
        Label: Schema.val(Schema.str('')),
        Info: Schema.obj({}),
        TargetId: Schema.con(Target.Id)
      })
      this.#Model.api
        .obj(['Entries'])
        .set({ [LinkId]: LinkData })
      this.#addToReverseIndex(outerItem.Id, LinkId)
      this.#addToLinkTargetIndex(Target.Id, LinkId)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(LinkId, 'outerItem')
    })
    return this.#wrapped(LinkId) as SDS_Link
  }

/**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/

  deserializeItemInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Item {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    parseInsertionIndex(InsertionIndex)

    const serialisedJSON = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation as string)
      : Serialisation) as SDS_ItemJSON
    if (serialisedJSON == null || serialisedJSON.Kind !== 'item') {
      throw new SDS_Error('invalid-argument', 'Serialisation must be a valid SDS_ItemJSON object')
    }

    const IdMap = new Map<string,string>()
    this.#collectEntryIds(serialisedJSON, IdMap)

    const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)
    const RootId_  = IdMap.get(serialisedJSON.Id) ?? serialisedJSON.Id

    this.transact(() => {
      this.#importEntryFromJSON(serialisedJSON, outerItem.Id, OrderKey, IdMap)
    })

    return this.#wrapped(RootId_) as SDS_Item
  }

/**** deserializeLinkInto — import a serialised link; always assigns a new Id ****/

  deserializeLinkInto (
    Serialisation:unknown, outerItem:SDS_Item, InsertionIndex?:number
  ):SDS_Link {
    if (outerItem == null) throw new SDS_Error('invalid-argument','outerItem must not be missing')
    const serialisedJSON = (typeof Serialisation === 'string'
      ? JSON.parse(Serialisation as string)
      : Serialisation) as SDS_LinkJSON
    if (serialisedJSON == null || serialisedJSON.Kind !== 'link') {
      throw new SDS_Error('invalid-argument', 'Serialisation must be a valid SDS_LinkJSON object')
    }

    const LinkId  = crypto.randomUUID()
    const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex)

    const InfoObj:Record<string,any> = {}
    for (const Key of Object.keys(serialisedJSON.Info ?? {})) {
      InfoObj[Key] = Schema.con((serialisedJSON.Info as any)[Key])
    }

    const LinkData = Schema.obj({
      Kind:           Schema.con('link'),
      outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey })),
      Label:          Schema.val(Schema.str(serialisedJSON.Label ?? '')),
      Info:           Schema.obj(InfoObj),
      TargetId:       Schema.con(serialisedJSON.TargetId),
    })

    this.transact(() => {
      this.#Model.api.obj(['Entries']).set({ [LinkId]: LinkData })
      this.#addToReverseIndex(outerItem.Id, LinkId)
      this.#addToLinkTargetIndex(serialisedJSON.TargetId, LinkId)
      this.#recordChange(outerItem.Id, 'innerEntryList')
      this.#recordChange(LinkId, 'outerItem')
    })

    return this.#wrapped(LinkId) as SDS_Link
  }

/**** moveEntryTo — move entry to new location in tree ****/

  moveEntryTo (Entry:SDS_Entry, outerItem:SDS_Item, Index?:number):void {
    optIndexSchema.parse(Index)
    if (! this._mayMoveEntryTo(Entry.Id, outerItem.Id, Index)) {
      throw new SDS_Error('move-would-cycle', 'cannot move an entry into one of its own descendants')
    }
    const oldOuterItemId = this._outerItemIdOf(Entry.Id)
    const OrderKey = this.#OrderKeyAt(outerItem.Id, Index)

    this.transact(() => {
      this.#Model.api
        .val(['Entries', Entry.Id, 'outerPlacement'])
        .set(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey }))

      // if moving out of trash, remove _trashedAt
      if (oldOuterItemId === TrashId && outerItem.Id !== TrashId) {
        const EntryData = this.#view().Entries[Entry.Id]
        const Info = (EntryData as any)?.Info
        if (Info != null && '_trashedAt' in Info) {
          this.#Model.api.obj(['Entries', Entry.Id, 'Info']).del(['_trashedAt'])
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
      this.#Model.api
        .val(['Entries', innerEntry.Id, 'outerPlacement'])
        .set(Schema.con({ outerItemId, OrderKey: freshKeys[i] }))
      this.#recordChange(innerEntry.Id, 'outerItem')
    })
  }

/**** deleteEntry — move entry to trash ****/

  deleteEntry (Entry:SDS_Entry):void {
    if (! this._mayDeleteEntry(Entry.Id)) {
      throw new SDS_Error('delete-not-permitted', 'this entry cannot be deleted')
    }
    const oldOuterItemId = this._outerItemIdOf(Entry.Id)
    const OrderKey = this.#lastOrderKeyOf(TrashId)
    const newOrderKey = generateKeyBetween(OrderKey, null)

    this.transact(() => {
      this.#Model.api
        .val(['Entries', Entry.Id, 'outerPlacement'])
        .set(Schema.con({ outerItemId: TrashId, OrderKey: newOrderKey }))

      this.#ensureInfoExists(Entry.Id)

      this.#Model.api
        .obj(['Entries', Entry.Id, 'Info'])
        .set({ _trashedAt: Schema.val(Schema.json(Date.now())) })

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

/**** purgeEntry — permanently delete entry from trash ****/

  purgeEntry (Entry:SDS_Entry):void {
    if (this._outerItemIdOf(Entry.Id) !== TrashId) {
      throw new SDS_Error('purge-not-in-trash', 'only direct children of TrashItem can be purged')
    }
    if (this.#isProtected(Entry.Id)) {
      throw new SDS_Error('purge-protected', 'entry is protected by incoming links and cannot be purged')
    }
    this.transact(() => {
      this.#purgeSubtree(Entry.Id)
    })
  }

/**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/

  purgeExpiredTrashEntries (TrashTTL?:number):number {
    const TTL = TrashTTL ?? this.#TrashTTLms
    if (TTL == null) {
      return 0
    }

    const now = Date.now()
    const View = this.#view()
    const TrashEntries = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set<string>())
    let purgedCount = 0

    for (const innerEntryId of TrashEntries) {
      // check that this entry is a direct inner entry of TrashItem
      const innerEntryData = View.Entries[innerEntryId]
      if (innerEntryData == null) {
        continue
      }
      const outerItemId = (innerEntryData as any).outerPlacement?.outerItemId
      if (outerItemId !== TrashId) {
        continue
      }

      // check if the entry has a _trashedAt timestamp and if it's expired
      const trashedAt = (innerEntryData as any).Info?._trashedAt
      if (typeof trashedAt === 'number' && ! (now-trashedAt<TTL)) {
        try {
          this.purgeEntry(this.#wrapped(innerEntryId) as SDS_Entry)
          purgedCount++
        } catch {
          // silently skip protected entries
        }
      }
    }

    return purgedCount
  }

/**** dispose — clean up resources ****/

  dispose ():void {
    if (this.#TrashCheckTimer != null) {
      clearInterval(this.#TrashCheckTimer)
      this.#TrashCheckTimer = null
    }
    this.#Handlers.clear()
  }

//----------------------------------------------------------------------------//
//                             Change Tracking                                //
//----------------------------------------------------------------------------//

/**** transact — execute callback within transaction ****/

  transact (Callback:() => void):void {
    const isRootTransaction = this.#TransactionDepth === 0
    this.#TransactionDepth++

    try {
      Callback()
    } finally {
      this.#TransactionDepth--
      if (isRootTransaction) {
        const Patch_ = this.#Model.api.flush()
        if (! this.#applyingExternal) {
          try {
            const binaryPatch = Patch_.toBinary()
            if (binaryPatch.byteLength > 0) {
              this.#localPatches.push(binaryPatch)
            }
          } catch {
            // ignore
          }
        }
        const ChangeSet = this.#pendingChangeSet
        const Origin:ChangeOrigin = this.#applyingExternal ? 'external' : 'internal'
        this.#pendingChangeSet = {}
        this.#notifyHandlers(Origin, ChangeSet)
      }
    }
  }

/**** onChangeInvoke — register change listener ****/

  onChangeInvoke (Handler:ChangeHandler):() => void {
    this.#Handlers.add(Handler)
    return () => {
      this.#Handlers.delete(Handler)
    }
  }

/**** applyRemotePatch — apply external patch to model ****/

  applyRemotePatch (Patch_:Patch | Uint8Array):void {
    this.#applyingExternal = true
    try {
      this.transact(() => {
        // if it's a Uint8Array, it could be encoded patches or a single patch binary
        if (Patch_ instanceof Uint8Array) {
          // try to decode as multiple patches first
          try {
            const PatchBinaries = this.#decodePatchArray(Patch_)
            for (const Binary of PatchBinaries) {
              const ConvertedPatch = Patch.fromBinary(Binary)
              this.#Model.applyPatch(ConvertedPatch)
            }
          } catch {
            // if decoding fails, treat as a single patch binary
            const ConvertedPatch = Patch.fromBinary(Patch_)
            this.#Model.applyPatch(ConvertedPatch)
          }
        } else {
          this.#Model.applyPatch(Patch_)
        }
        this.#updateIndicesFromView()
      })
    } finally {
      this.#applyingExternal = false
    }
    this.recoverOrphans()
  }

/**** currentCursor — get current sync position ****/

  get currentCursor ():SDS_SyncCursor {
    return this.#encodeUint32(this.#localPatches.length)
  }

/**** exportPatch — export patches since given cursor ****/

  exportPatch (Origin?:SDS_SyncCursor):Uint8Array {
    const StartIndex = Origin != null ? this.#decodeUint32(Origin) : 0
    const PatchesToExport = this.#localPatches.slice(StartIndex)
    return this.#encodePatchArray(PatchesToExport)
  }

/**** #encodeUint32 — encode 32-bit integer as bytes ****/

  #encodeUint32 (Value:number):Uint8Array {
    const Buffer = new Uint8Array(4)
    return new DataView(Buffer.buffer).setUint32(0, Value>>>0, false), Buffer
  }

/**** #decodeUint32 — decode 32-bit integer from bytes ****/

  #decodeUint32 (Data:Uint8Array):number {
    return Data.byteLength<4 ? 0 : new DataView(Data.buffer, Data.byteOffset, 4).getUint32(0, false)
  }

/**** #encodePatchArray — encode array of patches ****/

  #encodePatchArray (Patches:Uint8Array[]):Uint8Array {
    const TotalSize = 4+Patches.reduce((acc, binary) => acc+4+binary.byteLength, 0)
    const Result = new Uint8Array(TotalSize)
    const View = new DataView(Result.buffer)
    View.setUint32(0, Patches.length, false)
    let Offset = 4
    for (const Binary of Patches) {
      View.setUint32(Offset, Binary.byteLength, false)
      Offset += 4
      Result.set(Binary, Offset)
      Offset += Binary.byteLength
    }
    return Result
  }

/**** #decodePatchArray — decode array of patches ****/

  #decodePatchArray (Data:Uint8Array):Uint8Array[] {
    const View = new DataView(Data.buffer, Data.byteOffset, Data.byteLength)
    const Count = View.getUint32(0, false)
    const Result:Uint8Array[] = []
    let Offset = 4
    for (let i = 0; i<Count; i++) {
      const Size = View.getUint32(Offset, false)
      Offset += 4
      Result.push(Data.slice(Offset, Offset+Size))
      Offset += Size
    }
    return Result
  }

/**** recoverOrphans — move orphaned entries to LostAndFound ****/

  recoverOrphans ():void {
    this.transact(() => {
      // move orphaned entries to LostAndFound
      const allEntries = this.#view().Entries
      for (const [EntryId, EntryData] of Object.entries(allEntries)) {
        const outerItemId = (EntryData as any).outerPlacement?.outerItemId
        if (
          outerItemId &&
          outerItemId !== RootId &&
          outerItemId !== TrashId &&
          outerItemId !== LostAndFoundId &&
          ! allEntries[outerItemId]
        ) {
          // this entry's outer data no longer exists
          const OrderKey = this.#lastOrderKeyOf(LostAndFoundId)
          const newOrderKey = generateKeyBetween(OrderKey, null)
          this.#Model.api
            .obj(['Entries', EntryId, 'outerPlacement'])
            .set(Schema.val(Schema.con({
              outerItemId: LostAndFoundId,
              OrderKey: newOrderKey
            })))
          this.#removeFromReverseIndex(outerItemId, EntryId)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(outerItemId, 'innerEntryList')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          this.#recordChange(EntryId, 'outerItem')
        }
      }
    })
  }

/**** asBinary — serialize store to gzipped binary ****/

  asBinary ():Uint8Array {
    return gzipSync(this.#Model.toBinary())
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
//                               Proxies                                      //
//----------------------------------------------------------------------------//

/**** get — proxy handler for property access ****/

  get (Target:any, Property:string | symbol):any {
    if (Property === 'Entries') {
      return new Proxy(this.#view().Entries, {
        get: (entriesTarget:any, entryId:any) => {
          return this.#wrapped(entryId as string)
        },
        set: ():boolean => false,
        deleteProperty: ():boolean => false,
        ownKeys: ():string[] => {
          return Object.keys(this.#view().Entries)
        },
        getOwnPropertyDescriptor: (_:any, prop:any) => {
          if (Object.keys(this.#view().Entries).includes(String(prop))) {
            return {
              configurable: true,
              enumerable: true,
              value: this.#wrapped(String(prop))
            }
          }
          return undefined
        }
      })
    }
    return this.#view()[Property as string]
  }

/**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/

  set ():boolean {
    return false
  }

  deleteProperty ():boolean {
    return false
  }

  ownKeys ():string[] {
    return Object.keys(this.#view())
  }

  getOwnPropertyDescriptor ():PropertyDescriptor | undefined {
    return {
      configurable: true,
      enumerable: true
    }
  }

//----------------------------------------------------------------------------//
//              Internal helpers — called by SDS_Entry / Data / Link           //
//----------------------------------------------------------------------------//

/**** _KindOf — get entry kind (data or link) ****/

  _KindOf (Id:string):'item' | 'link' {
    const EntryData = this.#view().Entries[Id]
    if (EntryData == null) {
      throw new SDS_Error('not-found', `entry '${Id}' not found`)
    }
    return (EntryData as any).Kind as 'item' | 'link'
  }

/**** _LabelOf — get entry label ****/

  _LabelOf (Id:string):string {
    const EntryData = this.#view().Entries[Id]
    if (EntryData == null) {
      return ''
    }
    return String((EntryData as any).Label ?? '')
  }

/**** _setLabelOf — set entry label ****/

  _setLabelOf (Id:string, Value:string):void {
    expectValidLabel(Value)
    this.transact(() => {
      const EntryData = this.#view().Entries[Id]
      if (EntryData == null) {
        return
      }
      this.#Model.api.obj(['Entries', Id]).set({ Label: Value })
      this.#recordChange(Id, 'Label')
    })
  }

/**** _TypeOf — get entry MIME type ****/

  _TypeOf (Id:string):string {
    const EntryData = this.#view().Entries[Id]
    const Stored = ((EntryData as any)?.MIMEType as string | undefined) ?? ''
    return Stored === '' ? DefaultMIMEType : Stored
  }

/**** _setTypeOf — set entry MIME type ****/

  _setTypeOf (Id:string, Value:string):void {
    expectValidMIMEType(Value)
    const storedValue = Value === DefaultMIMEType ? '' : Value
    this.transact(() => {
      this.#Model.api.obj(['Entries', Id]).set({ MIMEType: storedValue })
      this.#recordChange(Id, 'Type')
    })
  }

/**** _ValueKindOf — get value storage kind ****/

  _ValueKindOf (Id:string):'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending' {
    const EntryData = this.#view().Entries[Id]
    return ((EntryData as any)?.ValueKind as string | undefined ?? 'none') as any
  }

/**** _readValueOf — read entry value ****/

  async _readValueOf (Id:string):Promise<string | Uint8Array | undefined> {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'none'):
        return undefined
      case (Kind === 'literal'): {
        const EntryData = this.#view().Entries[Id]
        const LiteralVal = (EntryData as any)?.literalValue
        return String(LiteralVal ?? '')
      }
      case (Kind === 'binary'): {
        const EntryData = this.#view().Entries[Id]
        return (EntryData as any)?.binaryValue as Uint8Array | undefined
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

/**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/

  _currentValueOf (Id:string):string | Uint8Array | undefined {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case (Kind === 'literal'): {
        const EntryData = this.#view().Entries[Id]
        return String((EntryData as any)?.literalValue ?? '')
      }
      case (Kind === 'binary'): {
        const EntryData = this.#view().Entries[Id]
        return (EntryData as any)?.binaryValue as Uint8Array | undefined
      }
      default: return undefined
    }
  }

/**** _writeValueOf — write entry value ****/

  _writeValueOf (Id:string, Value:string | Uint8Array | undefined):void {
    this.transact(() => {
      const EntryData = this.#view().Entries[Id]
      if (EntryData == null) {
        return
      }

      switch (true) {
        case (Value == null): {
          this.#Model.api.obj(['Entries', Id]).set({ ValueKind: Schema.val(Schema.str('none')) })
          break
        }
        case (typeof Value === 'string' && (Value as string).length <= this.#LiteralSizeLimit): {
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('literal')),
            literalValue: Value as string
          })
          break
        }
        case (typeof Value === 'string'): {
          const Encoder = new TextEncoder()
          const Bytes = Encoder.encode(Value as string)
          const Hash = SDS_DataStore._BLOBhash(Bytes)
          this._storeValueBlob(Hash, Bytes)
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('literal-reference')),
            ValueRef: { Hash, Size: Bytes.byteLength }
          })
          break
        }
        case ((Value as Uint8Array).byteLength <= DefaultBinarySizeLimit): {
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('binary')),
            binaryValue: Value as Uint8Array
          })
          break
        }
        default: {
          const Bytes = Value as Uint8Array
          const Hash = SDS_DataStore._BLOBhash(Bytes)
          this._storeValueBlob(Hash, Bytes)
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('binary-reference')),
            ValueRef: { Hash, Size: Bytes.byteLength }
          })
          break
        }
      }
      this.#recordChange(Id, 'Value')
    })
  }

/**** _spliceValueOf — modify literal value in-place ****/

  _spliceValueOf (Id:string, Index:number, DeleteCount:number, Insertion:string):void {
    const Kind = this._ValueKindOf(Id)
    if (Kind !== 'literal') {
      throw new SDS_Error('change-value-not-literal', 'changeValue only works on items with ValueKind literal')
    }
    this.transact(() => {
      const currentValue = String((this.#view().Entries[Id] as any)?.literalValue ?? '')
      const newValue = currentValue.slice(0, Index)+Insertion+currentValue.slice(Index+DeleteCount)
      this._writeValueOf(Id, newValue)
    })
  }

/**** _innerEntriesOf — get sorted inner entries ****/

  _innerEntriesOf (Id:string):SDS_Entry[] {
    return this.#sortedInnerEntriesOf(Id).map(entry => this.#wrapped(entry.Id)) as SDS_Entry[]
  }

/**** _outerItemIdOf — get outer data id ****/

  _outerItemIdOf (Id:string):string | undefined {
    const EntryData = this.#view().Entries[Id]
    const outerItemId = (EntryData as any)?.outerPlacement?.outerItemId
    return outerItemId ?? undefined
  }

/**** _getValueRefOf — return the ValueRef for *-reference entries ****/

  _getValueRefOf (Id:string):{ Hash:string; Size:number } | undefined {
    const Kind = this._ValueKindOf(Id)
    if (Kind !== 'literal-reference' && Kind !== 'binary-reference') { return undefined }
    const EntryData = this.#view().Entries[Id]
    const Raw = (EntryData as any)?.ValueRef
    if (Raw == undefined) { return undefined }
    return (typeof Raw === 'string' ? JSON.parse(Raw) : Raw) as { Hash:string; Size:number }
  }

/**** _InfoProxyOf — get proxy for metadata access ****/

  _InfoProxyOf (Id:string):Record<string,unknown> {
    const Store = this
    return new Proxy({} as Record<string,unknown>, {
      get (_target:any, Key:any) {
        if (typeof Key !== 'string') {return undefined}
        const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
        return Info?.[Key]
      },
      set (_target:any, Key:any, Value:any) {
        if (typeof Key !== 'string') {return false}
        if (Value === undefined) {
          Store.transact(() => {
            const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
            if (Info != null && Key in Info) {
              Store.#Model.api.obj(['Entries', Id, 'Info']).del([Key])
              Store.#recordChange(Id, `Info.${Key}`)
            }
          })
          return true
        }
        expectValidInfoKey(Key)
        checkInfoValueSize(Value)
        Store.transact(() => {
          Store.#Model.api.obj(['Entries', Id, 'Info']).set({ [Key]: Value })
          Store.#recordChange(Id, `Info.${Key}`)
        })
        return true
      },
      deleteProperty (_target:any, Key:any) {
        if (typeof Key !== 'string') {return false}
        Store.transact(() => {
          const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
          if (Info != null && Key in Info) {
            Store.#Model.api.obj(['Entries', Id, 'Info']).del([Key])
            Store.#recordChange(Id, `Info.${Key}`)
          }
        })
        return true
      },
      ownKeys ():any[] {
        const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
        return Info != null ? Object.keys(Info) : []
      },
      getOwnPropertyDescriptor (_target:any, Key:any) {
        if (typeof Key !== 'string') {return undefined}
        const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
        if (Info == null || ! (Key in Info)) {return undefined}
        return { configurable: true, enumerable: true, value: Info[Key] }
      },
      has (_target:any, Key:any) {
        if (typeof Key !== 'string') {return false}
        const Info = Store.#view().Entries[Id]?.Info as Record<string,unknown> | undefined
        return Info != null && Key in Info
      },
    })
  }

/**** _TargetOf — get link target data ****/

  _TargetOf (Id:string):SDS_Item {
    const EntryData = this.#view().Entries[Id]
    const TargetId = (EntryData as any)?.TargetId
    if (! TargetId) {
      throw new SDS_Error('not-found', `link '${Id}' has no target`)
    }
    return this.#wrapped(TargetId) as SDS_Item
  }

/**** _mayMoveEntryTo — check if move is valid ****/

  _mayMoveEntryTo (EntryId:string, outerItemId:string, Index?:number):boolean {
    // RootItem cannot be moved
    if (EntryId === RootId) {
      return false
    }
    // TrashItem and LostAndFoundItem can only be moved to RootItem
    if ((EntryId === TrashId || EntryId === LostAndFoundId) && outerItemId !== RootId) {
      return false
    }
    // Check if the move would create a cycle
    if (this.#wouldCreateCycle(EntryId, outerItemId)) {
      return false
    }
    return true
  }

/**** _mayDeleteEntry — check if entry can be deleted ****/

  _mayDeleteEntry (EntryId:string):boolean {
    // Root data, trash data, and lost-and-found data cannot be deleted
    if (EntryId === RootId || EntryId === TrashId || EntryId === LostAndFoundId) {
      return false
    }
    return true
  }

//----------------------------------------------------------------------------//
//                             Private Helpers                                //
//----------------------------------------------------------------------------//

/**** #collectEntryIds — build old-to-new UUID mapping for an entire subtree ****/

  #collectEntryIds (JSON_:SDS_EntryJSON, IdMap:Map<string,string>):void {
    IdMap.set(JSON_.Id, crypto.randomUUID())
    if (JSON_.Kind === 'item') {
      for (const InnerJSON of JSON_.innerEntries) {
        this.#collectEntryIds(InnerJSON, IdMap)
      }
    }
  }

/**** #importEntryFromJSON — recursively import a JSON entry with index updates ****/

  #importEntryFromJSON (
    JSON_:SDS_EntryJSON, outerItemId:string, OrderKey:string,
    IdMap:Map<string,string>
  ):void {
    const Id = IdMap.get(JSON_.Id) ?? JSON_.Id

    const InfoObj:Record<string,any> = {}
    for (const Key of Object.keys(JSON_.Info ?? {})) {
      InfoObj[Key] = Schema.con((JSON_.Info as any)[Key])
    }

    if (JSON_.Kind === 'link') {
      const TargetId = IdMap.get(JSON_.TargetId) ?? JSON_.TargetId
      this.#Model.api.obj(['Entries']).set({ [Id]: Schema.obj({
        Kind:           Schema.con('link'),
        outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
        Label:          Schema.val(Schema.str(JSON_.Label ?? '')),
        Info:           Schema.obj(InfoObj),
        TargetId:       Schema.con(TargetId),
      }) })
      this.#addToReverseIndex(outerItemId, Id)
      this.#addToLinkTargetIndex(TargetId, Id)
      this.#recordChange(outerItemId, 'innerEntryList')
      this.#recordChange(Id, 'outerItem')
      return
    }

    const storedType = JSON_.Type === DefaultMIMEType ? '' : JSON_.Type
    const EntryObj:Record<string,any> = {
      Kind:           Schema.con('item'),
      outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
      Label:          Schema.val(Schema.str(JSON_.Label ?? '')),
      Info:           Schema.obj(InfoObj),
      MIMEType:       Schema.val(Schema.str(storedType)),
      ValueKind:      Schema.val(Schema.str(JSON_.ValueKind ?? 'none')),
    }

    switch (true) {
      case (JSON_.ValueKind === 'literal' && JSON_.Value != null):
        EntryObj.literalValue = Schema.val(Schema.str(JSON_.Value as string))
        break
      case (JSON_.ValueKind === 'binary' && JSON_.Value != null):
        EntryObj.binaryValue = Schema.con(_base64ToUint8Array(JSON_.Value as string))
        break
    }

    this.#Model.api.obj(['Entries']).set({ [Id]: Schema.obj(EntryObj) })
    this.#addToReverseIndex(outerItemId, Id)
    this.#recordChange(outerItemId, 'innerEntryList')
    this.#recordChange(Id, 'outerItem')

    if (JSON_.innerEntries.length > 0) {
      const OrderKeys = generateNKeysBetween(null, null, JSON_.innerEntries.length)
      for (let i = 0; i < JSON_.innerEntries.length; i++) {
        this.#importEntryFromJSON(JSON_.innerEntries[i], Id, OrderKeys[i], IdMap)
      }
    }
  }

/**** #view — get current model state view ****/

  #view ():any {
    return this.#Model.api.view()
  }

/**** #wrapped — wrap raw entry data in SDS_Entry object ****/

  #wrapped (Id:string):SDS_Entry | null {
    const View = this.#view()
    const EntryData = View.Entries[Id]
    if (EntryData == null) {
      return null
    }

    const Kind = (EntryData as any).Kind
    switch (true) {
      case (Kind === 'item'): return this.#wrappedItem(Id)
      case (Kind === 'link'): return this.#wrappedLink(Id)
      default:                return null
    }
  }

/**** #wrappedItem — wrap raw data data in SDS_Item object ****/

  #wrappedItem (Id:string):SDS_Item {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Item) {
      return Cached
    }
    const Data = new SDS_Item(this, Id)
    this.#cacheWrapper(Id, Data)
    return Data
  }

/**** #wrappedLink — wrap raw link data in SDS_Link object ****/

  #wrappedLink (Id:string):SDS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Link) {
      return Cached
    }
    const Link = new SDS_Link(this, Id)
    this.#cacheWrapper(Id, Link)
    return Link
  }

/**** #cacheWrapper — add wrapper to LRU cache ****/

  #cacheWrapper (Id:string, Wrapper:SDS_Entry):void {
    if (this.#WrapperCache.size >= this.#MaxCacheSize) {
      const FirstKey = this.#WrapperCache.keys().next().value
      if (FirstKey != null) {
        this.#WrapperCache.delete(FirstKey)
      }
    }
    this.#WrapperCache.set(Id, Wrapper)
  }

/**** #rebuildIndices — rebuild all indices from scratch ****/

  #rebuildIndices ():void {
    this.#ReverseIndex.clear()
    this.#ForwardIndex.clear()
    this.#LinkTargetIndex.clear()
    this.#LinkForwardIndex.clear()

    const Entries = this.#view().Entries
    for (const [EntryId, EntryData] of Object.entries(Entries)) {
      const outerItemId = (EntryData as any).outerPlacement?.outerItemId
      if (outerItemId) {
        this.#addToReverseIndex(outerItemId, EntryId)
      }
      if ((EntryData as any).Kind === 'link') {
        const TargetId = (EntryData as any).TargetId
        if (TargetId) {
          this.#addToLinkTargetIndex(TargetId, EntryId)
        }
      }
    }
  }

/**** #updateIndicesFromView — update indices after patch applied ****/

  #updateIndicesFromView ():void {
    const SeenIds = new Set<string>()

    const Entries = this.#view().Entries
    for (const [EntryId, EntryData] of Object.entries(Entries)) {
      SeenIds.add(EntryId)

      const newOuterItemId = (EntryData as any).outerPlacement?.outerItemId
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
        case ((EntryData as any).Kind === 'link'): {
          const newTargetId = (EntryData as any).TargetId
          const oldTargetId = this.#LinkForwardIndex.get(EntryId)
          if (newTargetId !== oldTargetId) {
            if (oldTargetId != null) {
              this.#removeFromLinkTargetIndex(oldTargetId, EntryId)
            }
            if (newTargetId != null) {
              this.#addToLinkTargetIndex(newTargetId, EntryId)
            }
          }
          break
        }
        case this.#LinkForwardIndex.has(EntryId):
          this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId)!, EntryId)
          break
      }

      this.#recordChange(EntryId, 'Label')
    }

    const deletedEntries = Array.from(this.#ForwardIndex.entries()).filter(([Id]) => ! SeenIds.has(Id))
    for (const [EntryId, oldOuterItemId] of deletedEntries) {
      this.#removeFromReverseIndex(oldOuterItemId, EntryId)
      this.#recordChange(oldOuterItemId, 'innerEntryList')
    }

    const deletedLinks = Array.from(this.#LinkForwardIndex.entries()).filter(([Id]) => ! SeenIds.has(Id))
    for (const [LinkId, oldTargetId] of deletedLinks) {
      this.#removeFromLinkTargetIndex(oldTargetId, LinkId)
    }
  }

/**** #addToReverseIndex — add entry to outer-data index ****/

  #addToReverseIndex (outerItemId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerItemId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerItemId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerItemId)
  }

/**** #removeFromReverseIndex — remove entry from outer-data index ****/

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

/**** #OrderKeyAt — generate order key for insertion position ****/

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

/**** #lastOrderKeyOf — get order key of last inner entry ****/

  #lastOrderKeyOf (DataId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(DataId)
    return innerEntries.length>0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — get sorted inner entries ****/

  #sortedInnerEntriesOf (DataId:string):Array<{ Id: string; OrderKey: string }> {
    const innerIds = this.#ReverseIndex.get(DataId) ?? new Set<string>()
    const Result: Array<{ Id: string; OrderKey: string }> = []
    const Entries = this.#view().Entries
    for (const innerEntryId of innerIds) {
      const EntryData = Entries[innerEntryId]
      const innerOuterItemId = (EntryData as any).outerPlacement?.outerItemId
      if (innerOuterItemId === DataId) {
        Result.push({
          Id: innerEntryId,
          OrderKey: (EntryData as any).outerPlacement?.OrderKey ?? ''
        })
      }
    }
    Result.sort((EntryA, EntryB) =>
      EntryA.OrderKey<EntryB.OrderKey
        ? -1
        : EntryA.OrderKey>EntryB.OrderKey
        ? 1
        : EntryA.Id<EntryB.Id
        ? -1
        : EntryA.Id>EntryB.Id
        ? 1
        : 0
    )
    return Result
  }

/**** #isProtected — check if entry is protected by incoming links ****/

  #isProtected (TrashBranchId:string):boolean {
    const RootReachable = this.#reachableFromRoot()
    const Protected = new Set<string>()
    let Changed = true
    while (Changed) {
      Changed = false
      for (const DirectChild of this.#ReverseIndex.get(TrashId) ?? new Set()) {
        if (Protected.has(DirectChild)) {
          continue
        }
        if (this.#SubtreeHasIncomingLinks(DirectChild, RootReachable, Protected)) {
          Protected.add(DirectChild)
          Changed = true
        }
      }
    }
    return Protected.has(TrashBranchId)
  }

/**** #SubtreeHasIncomingLinks — check for incoming links to subtree ****/

  #SubtreeHasIncomingLinks (
    RootOfSubtree:string,
    RootReachable:Set<string>,
    Protected:Set<string>
  ):boolean {
    const Queue = [RootOfSubtree]
    const Visited = new Set<string>()
    while (Queue.length > 0) {
      const EntryId = Queue.pop()!
      if (Visited.has(EntryId)) {
        continue
      }
      Visited.add(EntryId)
      const IncomingLinks = this.#LinkTargetIndex.get(EntryId) ?? new Set<string>()
      for (const LinkId of IncomingLinks) {
        if (RootReachable.has(LinkId)) {
          return true
        }
        const TrashBranch = this.#directTrashInnerEntryContaining(LinkId)
        if (TrashBranch != null && Protected.has(TrashBranch)) {
          return true
        }
      }
      for (const innerEntryId of this.#ReverseIndex.get(EntryId) ?? new Set()) {
        if (! Visited.has(innerEntryId)) {
          Queue.push(innerEntryId)
        }
      }
    }
    return false
  }

/**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/

  #directTrashInnerEntryContaining (EntryId:string):string | null {
    let currentId: string | undefined = EntryId
    while (currentId != null) {
      const Outer = this._outerItemIdOf(currentId)
      if (Outer === TrashId) {
        return currentId
      }
      if (Outer === RootId || Outer == null) {
        return null
      }
      currentId = Outer
    }
    return null
  }

/**** #reachableFromRoot — compute reachable entries from root ****/

  #reachableFromRoot ():Set<string> {
    const Reachable = new Set<string>()
    const Queue = [RootId]
    while (Queue.length > 0) {
      const Id = Queue.pop()!
      if (Reachable.has(Id)) {
        continue
      }
      Reachable.add(Id)
      for (const innerEntryId of this.#ReverseIndex.get(Id) ?? new Set()) {
        if (! Reachable.has(innerEntryId)) {
          Queue.push(innerEntryId)
        }
      }
    }
    return Reachable
  }

/**** #purgeSubtree — recursively purge entry and children ****/

  #purgeSubtree (EntryId:string):void {
    const EntryData = this.#view().Entries[EntryId]
    if (EntryData == null) {
      return
    }

    const Kind = (EntryData as any).Kind as string
    const oldOuterItemId = (EntryData as any).outerPlacement?.outerItemId

    const RootReachable = this.#reachableFromRoot()
    const Protected = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#SubtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        // inner rescue: move to TrashItem top level
        const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)
        this.#Model.api.obj(['Entries', innerEntryId, 'outerPlacement']).set({
          outerItemId: TrashId,
          OrderKey: OrderKey
        })
        this.#removeFromReverseIndex(EntryId, innerEntryId)
        this.#addToReverseIndex(TrashId, innerEntryId)
        this.#recordChange(TrashId, 'innerEntryList')
        this.#recordChange(innerEntryId, 'outerItem')
      } else {
        this.#purgeSubtree(innerEntryId)
      }
    }

    // delete the entry itself
    this.#Model.api.obj(['Entries']).del([EntryId])

    if (oldOuterItemId) {
      this.#removeFromReverseIndex(oldOuterItemId, EntryId)
      this.#recordChange(oldOuterItemId, 'innerEntryList')
    }

    if (Kind === 'link') {
      const TargetId = (EntryData as any).TargetId
      if (TargetId) {
        this.#removeFromLinkTargetIndex(TargetId, EntryId)
      }
    }

    this.#WrapperCache.delete(EntryId)
  }

/**** #requireItemExists — throw if data doesn't exist ****/

  #requireItemExists (DataId:string):void {
    const View = this.#view()
    const EntryData = View.Entries[DataId]
    if (EntryData == null || (EntryData as any).Kind !== 'item') {
      throw new SDS_Error('invalid-argument', `item '${DataId}' does not exist`)
    }
  }

/**** #ensureInfoExists — create Info object if missing ****/

  #ensureInfoExists (EntryId:string):void {
    const EntryData = this.#view().Entries[EntryId]
    const Info = (EntryData as any)?.Info
    if (Info == null) {
      this.#Model.api.obj(['Entries', EntryId]).set({ Info: Schema.obj({}) })
    }
  }

/**** #removeInfoIfEmpty — delete Info object if empty ****/

  #removeInfoIfEmpty (EntryId:string):void {
    const EntryData = this.#view().Entries[EntryId]
    const Info = (EntryData as any)?.Info
    if (Info != null && Object.keys(Info).length === 0) {
      this.#Model.api.obj(['Entries', EntryId]).del(['Info'])
    }
  }

/**** #recordChange — track property change ****/

  #recordChange (EntryId:string, Property:string):void {
    if (this.#pendingChangeSet[EntryId] == null) {
      this.#pendingChangeSet[EntryId] = new Set()
    }
    ;(this.#pendingChangeSet[EntryId] as Set<string>).add(Property)
  }

/**** #notifyHandlers — invoke change listeners ****/

  #notifyHandlers (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet):void {
    if (Object.keys(ChangeSet).length === 0) {
      return
    }
    for (const Handler of this.#Handlers) {
      try {
        Handler(Origin, ChangeSet)
      } catch (_Signal) {
        /* swallow */
      }
    }
  }

/**** #wouldCreateCycle — check if move would create an outer-data cycle ****/

  #wouldCreateCycle (EntryId:string, TargetId:string):boolean {
    let currentId: string | undefined = TargetId
    while (currentId != null) {
      if (currentId === EntryId) {
        return true
      }
      currentId = this._outerItemIdOf(currentId)
    }
    return false
  }

}

export default SDS_DataStore
