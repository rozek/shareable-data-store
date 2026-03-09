/*******************************************************************************
*                                                                              *
*       SDS_NoteStore - wraps a Loro CRDT Doc without exposing it              *
*                                                                              *
*******************************************************************************/

// Loro data model (all inside one Loro document):
//
//   doc.getMap('Entries')   →  LoroMap<string, LoroMap<any>>
//
//   Per-entry LoroMap fields:
//     Kind:          string         'note' | 'link'
//     outerNoteId:   string         '' for the root note (no outer note)
//     OrderKey:      string         fractional-indexing key
//     Label:         LoroText       collaborative string
//     Info:          LoroMap<any>   arbitrary metadata
//     MIMEType:      string         (notes only; '' = 'text/plain')
//     ValueKind:     string         (notes only)
//     literalValue:  LoroText       (notes, ValueKind=literal only)
//     binaryValue:   Uint8Array     (notes, ValueKind=binary only)
//     ValueRef:      string (json)  (notes, *-reference only)
//     TargetId:      string         (links only)
//
// NOTE: Loro LoroMap values are restricted to primitives and nested containers.
// Uint8Array is stored as a primitive value directly (Loro supports binary).
// Complex objects like ValueRef are stored as JSON strings.

import { Loro, LoroMap, LoroText, VersionVector } from 'loro-crdt'
import { z }                     from 'zod'
import { gzipSync, gunzipSync }  from 'fflate'
import { generateKeyBetween }    from 'fractional-indexing'
import { SDS_Error }             from '../error/SDS_Error.js'
import { SDS_Entry }             from '@rozek/sds-core'
import { SDS_Note }              from '@rozek/sds-core'
import { SDS_Link }              from '@rozek/sds-core'
import {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit,
  DefaultWrapperCacheSize,
} from './constants.js'
import type { SDS_ChangeSet }  from '../changeset/SDS_ChangeSet.js'
import type { SDS_SyncCursor } from '../interfaces/SDS_PersistenceProvider.js'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export type ChangeOrigin  = 'internal' | 'external'
  export type ChangeHandler = (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet) => void

  export interface SDS_NoteStoreOptions {
    LiteralSizeLimit?:number
    TrashTTLms?:number
    TrashCheckIntervalMs?:number
  }

//----------------------------------------------------------------------------//
//                          Zod Validation Schemas                            //
//----------------------------------------------------------------------------//

  const StringSchema   = z.string()
  const MIMETypeSchema = z.string().min(1)
  const OptIndexSchema = z.number().int().nonnegative().optional()

//----------------------------------------------------------------------------//
//                                SDS_NoteStore                               //
//----------------------------------------------------------------------------//

export class SDS_NoteStore {

/**** private state ****/

  #doc:              Loro
  #EntriesMap:       LoroMap
  #LiteralSizeLimit: number
  #TrashTTLms:       number | null
  #TrashCheckTimer:  ReturnType<typeof setInterval> | null = null
  #Handlers:         Set<ChangeHandler> = new Set()

  // reverse index: outerNoteId → Set<entryId>
  #ReverseIndex:Map<string,Set<string>> = new Map()

  // forward index: entryId → outerNoteId
  #ForwardIndex:Map<string,string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex:Map<string,Set<string>> = new Map()

  // link forward index: linkId → targetId
  #LinkForwardIndex:Map<string,string> = new Map()

  // LRU wrapper cache
  #WrapperCache:Map<string,SDS_Entry> = new Map()
  readonly #MaxCacheSize = DefaultWrapperCacheSize

  // transaction nesting
  #TransactDepth = 0

  // ChangeSet accumulator inside a transaction
  #PendingChangeSet:SDS_ChangeSet = {}

  // suppress index updates / change tracking when applying remote patches
  #ApplyingExternal = false

//----------------------------------------------------------------------------//
//                               Construction                                 //
//----------------------------------------------------------------------------//

  private constructor (Doc:Loro, Options?:SDS_NoteStoreOptions) {
    this.#doc              = Doc
    this.#EntriesMap       = Doc.getMap('Entries') as LoroMap
    this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit
    this.#TrashTTLms       = Options?.TrashTTLms ?? null
    this.#rebuildIndices()

    if (this.#TrashTTLms != null) {
      const CheckIntervalMs = Options?.TrashCheckIntervalMs
        ?? Math.min(Math.floor(this.#TrashTTLms/4), 3_600_000)
      this.#TrashCheckTimer = setInterval(
        () => { this.purgeExpiredTrashEntries() },
        CheckIntervalMs
      )
      if (typeof (this.#TrashCheckTimer as any)?.unref === 'function') {
        (this.#TrashCheckTimer as any).unref()
      }
    }
  }

/**** fromScratch — create a new store with root, trash, and lost-and-found notes ****/

  static fromScratch (Options?:SDS_NoteStoreOptions):SDS_NoteStore {
    const Doc        = new Loro()
    const EntriesMap = Doc.getMap('Entries') as LoroMap

    // root note (outermost note, no outer note)
    const Root = EntriesMap.setContainer(RootId, new LoroMap()) as LoroMap
    Root.set('Kind',        'note')
    Root.set('outerNoteId', '')
    Root.set('OrderKey',    '')
    Root.setContainer('Label', new LoroText())
    Root.setContainer('Info',  new LoroMap())
    Root.set('MIMEType',   '')
    Root.set('ValueKind',  'none')

    // Trash note
    const Trash = EntriesMap.setContainer(TrashId, new LoroMap()) as LoroMap
    Trash.set('Kind',        'note')
    Trash.set('outerNoteId', RootId)
    Trash.set('OrderKey',    'a0')
    const TrashLabel = Trash.setContainer('Label', new LoroText()) as LoroText
    TrashLabel.insert(0, 'trash')
    Trash.setContainer('Info', new LoroMap())
    Trash.set('MIMEType',  '')
    Trash.set('ValueKind', 'none')

    // Lost & Found note
    const LostAndFound = EntriesMap.setContainer(LostAndFoundId, new LoroMap()) as LoroMap
    LostAndFound.set('Kind',        'note')
    LostAndFound.set('outerNoteId', RootId)
    LostAndFound.set('OrderKey',    'a1')
    const LafLabel = LostAndFound.setContainer('Label', new LoroText()) as LoroText
    LafLabel.insert(0, 'lost-and-found')
    LostAndFound.setContainer('Info', new LoroMap())
    LostAndFound.set('MIMEType',  '')
    LostAndFound.set('ValueKind', 'none')

    Doc.commit()
    return new SDS_NoteStore(Doc, Options)
  }

/**** fromBinary — restore store from gzip-compressed binary data ****/

  static fromBinary (Data:Uint8Array, Options?:SDS_NoteStoreOptions):SDS_NoteStore {
    const Doc = new Loro()
    Doc.import(gunzipSync(Data))
    return new SDS_NoteStore(Doc, Options)
  }

/**** fromJSON — restore store from base64-encoded JSON representation ****/

  static fromJSON (Data:unknown, Options?:SDS_NoteStoreOptions):SDS_NoteStore {
    let Binary:Uint8Array
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) {
      Binary = new Uint8Array(NodeBuffer.from(String(Data), 'base64'))
    } else {
      Binary = Uint8Array.from(atob(String(Data)), (c) => c.charCodeAt(0))
    }
    return SDS_NoteStore.fromBinary(Binary, Options)
  }

//----------------------------------------------------------------------------//
//                             Well-known notes                               //
//----------------------------------------------------------------------------//

/**** RootNote / TrashNote / LostAndFoundNote — well-known note accessors ****/

  get RootNote ():SDS_Note         { return this.#wrapNote(RootId) }
  get TrashNote ():SDS_Note        { return this.#wrapNote(TrashId) }
  get LostAndFoundNote ():SDS_Note { return this.#wrapNote(LostAndFoundId) }

//----------------------------------------------------------------------------//
//                                   Lookup                                   //
//----------------------------------------------------------------------------//

/**** EntryWithId — retrieve an entry by ID ****/

  EntryWithId (EntryId:string):SDS_Entry | undefined {
    const EntryMap = this.#getEntryMap(EntryId)
    if (EntryMap == null) { return undefined }
    return this.#wrap(EntryId)
  }

//----------------------------------------------------------------------------//
//                                  Factory                                   //
//----------------------------------------------------------------------------//

/**** newNoteAt — create a new note within an outer note ****/

  newNoteAt (OuterNote:SDS_Note, Type?:string, InsertionIndex?:number):SDS_Note {
    const effectiveType = Type ?? DefaultMIMEType
    if (! MIMETypeSchema.safeParse(effectiveType).success) {
      throw new SDS_Error('invalid-argument', 'MIMEType must be a non-empty string')
    }
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)

    const Id         = crypto.randomUUID()
    const OrderKey   = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
    const storedType = effectiveType === DefaultMIMEType ? '' : effectiveType

    this.transact(() => {
      const EntryMap = this.#EntriesMap.setContainer(Id, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'note')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.setContainer('Label', new LoroText())
      EntryMap.setContainer('Info',  new LoroMap())
      EntryMap.set('MIMEType',   storedType)
      EntryMap.set('ValueKind',  'none')

      this.#addToReverseIndex(OuterNote.Id, Id)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerNote')
    })

    return this.#wrapNote(Id)
  }

/**** newLinkAt — create a new link within an outer note ****/

  newLinkAt (Target:SDS_Note, OuterNote:SDS_Note, InsertionIndex?:number):SDS_Link {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(Target.Id)
    this.#requireNoteExists(OuterNote.Id)

    const Id       = crypto.randomUUID()
    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.setContainer(Id, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.setContainer('Label', new LoroText())
      EntryMap.setContainer('Info',  new LoroMap())
      EntryMap.set('TargetId',    Target.Id)

      this.#addToReverseIndex(OuterNote.Id, Id)
      this.#addToLinkTargetIndex(Target.Id, Id)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerNote')
    })

    return this.#wrapLink(Id)
  }

//----------------------------------------------------------------------------//
//                                   Import                                   //
//----------------------------------------------------------------------------//

/**** deserializeNoteInto — restore a note from serialized representation ****/

  deserializeNoteInto (
    Serialization:unknown, OuterNote:SDS_Note, InsertionIndex?:number
  ):SDS_Note {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)
    if (Serialization == null) {
      throw new SDS_Error('invalid-argument', 'Serialisation must not be null')
    }

    const restoredView = Serialization as { Entries: Record<string,any> }
    const Ids          = Object.keys(restoredView.Entries ?? {})
    if (Ids.length === 0) {
      throw new SDS_Error('invalid-argument', 'empty serialisation')
    }

    const oldRootId = Ids[0]
    const newRootId = crypto.randomUUID()
    const IdMap     = new Map<string,string>([[oldRootId, newRootId]])
    for (const oldId of Ids) {
      if (! IdMap.has(oldId)) { IdMap.set(oldId, crypto.randomUUID()) }
    }

    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      for (const oldId of Ids) {
        const Data    = restoredView.Entries[oldId]
        const newId   = IdMap.get(oldId)!
        const isRoot  = (oldId === oldRootId)

        const newOuterNoteId = isRoot
          ? OuterNote.Id
          : (Data.outerPlacement?.outerNoteId != null
            ? (IdMap.get(Data.outerPlacement.outerNoteId) ?? OuterNote.Id)
            : undefined)
        const newOrderKey = isRoot
          ? OrderKey
          : (Data.outerPlacement?.OrderKey ?? '')

        const EntryMap = this.#EntriesMap.setContainer(newId, new LoroMap()) as LoroMap
        EntryMap.set('Kind', Data.Kind)
        const LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
        if (Data.Label) { LabelText.insert(0, Data.Label) }
        EntryMap.setContainer('Info', new LoroMap())
        EntryMap.set('outerNoteId', newOuterNoteId ?? '')
        EntryMap.set('OrderKey',    newOrderKey)

        if (Data.Kind === 'note') {
          EntryMap.set('MIMEType',  Data.MIMEType ?? '')
          EntryMap.set('ValueKind', 'none')
        } else {
          EntryMap.set('TargetId',
            Data.TargetId != null ? (IdMap.get(Data.TargetId) ?? Data.TargetId) : '')
        }

        if (newOuterNoteId) { this.#addToReverseIndex(newOuterNoteId, newId) }
        if (Data.Kind === 'link' && Data.TargetId != null) {
          this.#addToLinkTargetIndex(IdMap.get(Data.TargetId) ?? Data.TargetId, newId)
        }
      }
      this.#recordChange(OuterNote.Id, 'innerEntryList')
    })

    return this.#wrapNote(newRootId)
  }

/**** deserializeLinkInto — restore a link from serialized representation ****/

  deserializeLinkInto (
    Serialization:unknown, OuterNote:SDS_Note, InsertionIndex?:number
  ):SDS_Link {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)
    if (Serialization == null) {
      throw new SDS_Error('invalid-argument', 'Serialisation must not be null')
    }

    const restoredView = Serialization as { Entries: Record<string,any> }
    const Ids          = Object.keys(restoredView.Entries ?? {})
    if (Ids.length === 0) {
      throw new SDS_Error('invalid-argument', 'empty serialisation')
    }

    const Data = restoredView.Entries[Ids[0]]
    if (Data.Kind !== 'link') {
      throw new SDS_Error('invalid-argument', 'serialisation is not a link')
    }

    const newId    = crypto.randomUUID()
    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.setContainer(newId, new LoroMap()) as LoroMap
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      const LabelText = EntryMap.setContainer('Label', new LoroText()) as LoroText
      if (Data.Label) { LabelText.insert(0, Data.Label) }
      EntryMap.setContainer('Info', new LoroMap())
      EntryMap.set('TargetId', Data.TargetId ?? '')

      this.#addToReverseIndex(OuterNote.Id, newId)
      if (Data.TargetId) { this.#addToLinkTargetIndex(Data.TargetId, newId) }
      this.#recordChange(OuterNote.Id, 'innerEntryList')
    })

    return this.#wrapLink(newId)
  }

//----------------------------------------------------------------------------//
//                               Move / Delete                                //
//----------------------------------------------------------------------------//

/**** EntryMayBeMovedTo — check if an entry can be moved to an outer note ****/

  EntryMayBeMovedTo (Entry:SDS_Entry, OuterNote:SDS_Note, InsertionIndex?:number):boolean {
    return Entry.mayBeMovedTo(OuterNote, InsertionIndex)
  }

/**** moveEntryTo — move an entry to a different outer note ****/

  moveEntryTo (Entry:SDS_Entry, OuterNote:SDS_Note, InsertionIndex?:number):void {
    OptIndexSchema.parse(InsertionIndex)
    if (! this._mayMoveEntryTo(Entry.Id, OuterNote.Id, InsertionIndex)) {
      throw new SDS_Error('move-would-cycle',
        'cannot move an entry into one of its own descendants')
    }

    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey       = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#getEntryMap(Entry.Id)!
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)

      if (oldOuterNoteId === TrashId && OuterNote.Id !== TrashId) {
        const InfoMap = EntryMap.get('Info') as LoroMap | undefined
        if (InfoMap instanceof LoroMap && InfoMap.get('_trashedAt') != null) {
          InfoMap.delete('_trashedAt')
          this.#recordChange(Entry.Id, 'Info._trashedAt')
        }
      }

      if (oldOuterNoteId != null) {
        this.#removeFromReverseIndex(oldOuterNoteId, Entry.Id)
        this.#recordChange(oldOuterNoteId, 'innerEntryList')
      }
      this.#addToReverseIndex(OuterNote.Id, Entry.Id)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(Entry.Id, 'outerNote')
    })
  }

/**** EntryMayBeDeleted — check if an entry can be deleted ****/

  EntryMayBeDeleted (Entry:SDS_Entry):boolean {
    return Entry.mayBeDeleted
  }

/**** deleteEntry — move an entry to trash ****/

  deleteEntry (Entry:SDS_Entry):void {
    if (! this._mayDeleteEntry(Entry.Id)) {
      throw new SDS_Error('delete-not-permitted', 'this entry cannot be deleted')
    }
    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey       = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)

    this.transact(() => {
      const EntryMap = this.#getEntryMap(Entry.Id)!
      EntryMap.set('outerNoteId', TrashId)
      EntryMap.set('OrderKey',    OrderKey)

      let InfoMap = EntryMap.get('Info') as LoroMap | undefined
      if (! (InfoMap instanceof LoroMap)) {
        InfoMap = EntryMap.setContainer('Info', new LoroMap()) as LoroMap
      }
      InfoMap.set('_trashedAt', Date.now())

      if (oldOuterNoteId != null) {
        this.#removeFromReverseIndex(oldOuterNoteId, Entry.Id)
        this.#recordChange(oldOuterNoteId, 'innerEntryList')
      }
      this.#addToReverseIndex(TrashId, Entry.Id)
      this.#recordChange(TrashId, 'innerEntryList')
      this.#recordChange(Entry.Id, 'outerNote')
      this.#recordChange(Entry.Id, 'Info._trashedAt')
    })
  }

/**** purgeEntry — permanently delete a trash entry ****/

  purgeEntry (Entry:SDS_Entry):void {
    const oldOuter = this._outerNoteIdOf(Entry.Id)
    if (oldOuter !== TrashId) {
      throw new SDS_Error('purge-not-in-trash',
        'only direct children of TrashNote can be purged')
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
    const EffectiveTTL = TTLms ?? this.#TrashTTLms
    if (EffectiveTTL == null) { return 0 }
    const Now           = Date.now()
    const TrashChildren = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set<string>())
    let Count = 0
    for (const EntryId of TrashChildren) {
      const EntryMap = this.#getEntryMap(EntryId)
      if (EntryMap == null) { continue }
      if (EntryMap.get('outerNoteId') !== TrashId) { continue }
      const InfoMap   = EntryMap.get('Info') as LoroMap | undefined
      const trashedAt = InfoMap instanceof LoroMap ? InfoMap.get('_trashedAt') : undefined
      if (typeof trashedAt !== 'number') { continue }
      if (Now-trashedAt < EffectiveTTL) { continue }
      try {
        this.purgeEntry(this.#wrap(EntryId))
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
    this.#TransactDepth++
    try {
      Callback()
    } finally {
      this.#TransactDepth--
      if (this.#TransactDepth === 0) {
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

        const outerNoteId = EntryData.outerNoteId as string | undefined
        if (outerNoteId && ! allIds.has(outerNoteId)) {
          const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
          const EntryMap = this.#getEntryMap(EntryId)!
          EntryMap.set('outerNoteId', LostAndFoundId)
          EntryMap.set('OrderKey',    OrderKey)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(EntryId, 'outerNote')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          hasChanges = true
        }

        if (EntryData.Kind === 'link') {
          const TargetId = EntryData.TargetId as string | undefined
          if (TargetId && ! allIds.has(TargetId)) {
            const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
            const newEntry = this.#EntriesMap.setContainer(TargetId, new LoroMap()) as LoroMap
            newEntry.set('Kind',        'note')
            newEntry.set('outerNoteId', LostAndFoundId)
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

/**** asJSON — export store as base64-encoded binary ****/

  asJSON ():string {
    const Bytes = this.asBinary()
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) {
      return NodeBuffer.from(Bytes).toString('base64')
    }
    let Binary = ''
    for (let i = 0; i < Bytes.byteLength; i++) { Binary += String.fromCharCode(Bytes[i]) }
    return btoa(Binary)
  }

//----------------------------------------------------------------------------//
//                              Internal helpers                              //
//----------------------------------------------------------------------------//

/**** #getEntryMap — returns the LoroMap for a given entry ID ****/

  #getEntryMap (Id:string):LoroMap | undefined {
    const Value = this.#EntriesMap.get(Id)
    if (!(Value instanceof LoroMap)) { return undefined }
    // treat tombstoned entries (outerNoteId === '') as non-existent
    if (Value.get('outerNoteId') === '' && Id !== RootId) { return undefined }
    return Value
  }

/**** #requireNoteExists — throw if note does not exist ****/

  #requireNoteExists (Id:string):void {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null || EntryMap.get('Kind') !== 'note') {
      throw new SDS_Error('invalid-argument', `note '${Id}' does not exist`)
    }
  }

/**** #wrap / #wrapNote / #wrapLink — return cached wrapper objects ****/

  #wrap (Id:string):SDS_Entry {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) {
      throw new SDS_Error('invalid-argument', `entry '${Id}' not found`)
    }
    return EntryMap.get('Kind') === 'note' ? this.#wrapNote(Id) : this.#wrapLink(Id)
  }

  #wrapNote (Id:string):SDS_Note {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Note) { return Cached }
    const Wrapper = new SDS_Note(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

  #wrapLink (Id:string):SDS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SDS_Link) { return Cached }
    const Wrapper = new SDS_Link(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #cacheWrapper — add wrapper to LRU cache, evicting oldest if full ****/

  #cacheWrapper (Id:string, Wrapper:SDS_Entry):void {
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
      const outerNoteId = EntryData.outerNoteId as string | undefined
      if (outerNoteId) { this.#addToReverseIndex(outerNoteId, EntryId) }
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

      const newOuterNoteId = (EntryData.outerNoteId as string | undefined) || undefined
      const oldOuterNoteId = this.#ForwardIndex.get(EntryId)

      if (newOuterNoteId !== oldOuterNoteId) {
        if (oldOuterNoteId != null) {
          this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
          this.#recordChange(oldOuterNoteId, 'innerEntryList')
        }
        if (newOuterNoteId != null) {
          this.#addToReverseIndex(newOuterNoteId, EntryId)
          this.#recordChange(newOuterNoteId, 'innerEntryList')
        }
        this.#recordChange(EntryId, 'outerNote')
      }

      if (EntryData.Kind === 'link') {
        const newTargetId = EntryData.TargetId as string | undefined
        const oldTargetId = this.#LinkForwardIndex.get(EntryId)
        if (newTargetId !== oldTargetId) {
          if (oldTargetId != null) { this.#removeFromLinkTargetIndex(oldTargetId, EntryId) }
          if (newTargetId != null) { this.#addToLinkTargetIndex(newTargetId, EntryId) }
        }
      } else if (this.#LinkForwardIndex.has(EntryId)) {
        this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId)!, EntryId)
      }

      this.#recordChange(EntryId, 'Label')
    }

    // Pass 2: deleted entries
    const deletedEntries = Array.from(this.#ForwardIndex.entries())
      .filter(([Id]) => ! SeenIds.has(Id))
    for (const [EntryId, oldOuterNoteId] of deletedEntries) {
      this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
      this.#recordChange(oldOuterNoteId, 'innerEntryList')
    }

    const deletedLinks = Array.from(this.#LinkForwardIndex.entries())
      .filter(([Id]) => ! SeenIds.has(Id))
    for (const [LinkId, oldTargetId] of deletedLinks) {
      this.#removeFromLinkTargetIndex(oldTargetId, LinkId)
    }
  }

/**** #addToReverseIndex — add entry to reverse and forward indices ****/

  #addToReverseIndex (outerNoteId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerNoteId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerNoteId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerNoteId)
  }

/**** #removeFromReverseIndex — remove entry from indices ****/

  #removeFromReverseIndex (outerNoteId:string, EntryId:string):void {
    this.#ReverseIndex.get(outerNoteId)?.delete(EntryId)
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

/**** #orderKeyAt — generate fractional order key for insertion position ****/

  #orderKeyAt (outerNoteId:string, InsertionIndex?:number):string {
    const innerEntries = this.#sortedInnerEntriesOf(outerNoteId)
    if (innerEntries.length === 0 || InsertionIndex == null) {
      const LastKey = innerEntries.length > 0 ? innerEntries[innerEntries.length-1].OrderKey : null
      return generateKeyBetween(LastKey, null)
    }
    const ClampedIndex = Math.max(0, Math.min(InsertionIndex, innerEntries.length))
    const Before = ClampedIndex > 0 ? innerEntries[ClampedIndex-1].OrderKey : null
    const After  = ClampedIndex < innerEntries.length ? innerEntries[ClampedIndex].OrderKey : null
    return generateKeyBetween(Before, After)
  }

/**** #lastOrderKeyOf — get the last order key for an entry's children ****/

  #lastOrderKeyOf (NoteId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(NoteId)
    return innerEntries.length > 0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — get sorted inner entries by order key ****/

  #sortedInnerEntriesOf (NoteId:string):Array<{ Id:string; OrderKey:string }> {
    const innerIds = this.#ReverseIndex.get(NoteId) ?? new Set<string>()
    const Result: Array<{ Id:string; OrderKey:string }> = []
    for (const innerEntryId of innerIds) {
      const EntryMap = this.#getEntryMap(innerEntryId)
      const innerOuterNoteId = EntryMap?.get('outerNoteId') as string | undefined
      if (innerOuterNoteId === NoteId) {
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
        if (this.#subtreeHasIncomingLinks(DirectChild, RootReachable, Protected)) {
          Protected.add(DirectChild)
          Changed = true
        }
      }
    }
    return Protected.has(TrashBranchId)
  }

/**** #subtreeHasIncomingLinks — check if subtree has links from reachable entries ****/

  #subtreeHasIncomingLinks (
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

/**** #directTrashInnerEntryContaining — get direct inner entry of TrashNote containing an entry ****/

  #directTrashInnerEntryContaining (EntryId:string):string | null {
    let currentId:string | undefined = EntryId
    while (currentId != null) {
      const Outer = this._outerNoteIdOf(currentId)
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
    const oldOuterNoteId = EntryMap.get('outerNoteId') as string | undefined

    const RootReachable = this.#reachableFromRoot()
    const Protected     = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#subtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        const InnerMap = this.#getEntryMap(innerEntryId)!
        const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)
        InnerMap.set('outerNoteId', TrashId)
        InnerMap.set('OrderKey',    OrderKey)
        this.#removeFromReverseIndex(EntryId, innerEntryId)
        this.#addToReverseIndex(TrashId, innerEntryId)
        this.#recordChange(TrashId, 'innerEntryList')
        this.#recordChange(innerEntryId, 'outerNote')
      } else {
        this.#purgeSubtree(innerEntryId)
      }
    }

    // In Loro, we "delete" by marking as having no valid outer note — Loro doesn't
    // support removing a nested container key directly in all versions.
    // We set all fields to tombstone values and remove from our indices.
    // Note: their CRDT doc will keep the key but it becomes an orphan
    // that is invisible to normal traversal (outerNoteId = '' / not in any index).
    // For a true delete, use:
    //   this.#EntriesMap.delete(EntryId)   // if supported by loro-crdt version
    // Otherwise we tombstone the entry:
    EntryMap.set('outerNoteId', '')
    EntryMap.set('OrderKey',    '')

    if (oldOuterNoteId) {
      this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
      this.#recordChange(oldOuterNoteId, 'innerEntryList')
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
//           Internal helpers — called by SDS_Entry / Note / Link             //
//----------------------------------------------------------------------------//


/**** _KindOf — get entry kind (note or link) ****/

  _KindOf (Id:string):'note' | 'link' {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) { throw new SDS_Error('not-found', `entry '${Id}' not found`) }
    return EntryMap.get('Kind') as 'note' | 'link'
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
    StringSchema.parse(Value)
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
    MIMETypeSchema.parse(Value)
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


/**** _isLiteralOf — check if value is a literal string ****/

  _isLiteralOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'literal' || Kind === 'literal-reference'
  }


/**** _isBinaryOf — check if value is binary data ****/

  _isBinaryOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'binary' || Kind === 'binary-reference'
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
      default:
        throw new SDS_Error('not-implemented',
          'large value fetching requires a ValueStore (not yet wired)')
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
          const Hash    = `sha256-size-${Bytes.byteLength}`
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
          const Hash  = `sha256-size-${Bytes.byteLength}`
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
        "changeValue() is only available when ValueKind === 'literal'")
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
          if (InfoMap instanceof LoroMap) { InfoMap.delete(Key) }
          Store.#recordChange(Id, `Info.${Key}`)
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


/**** _outerNoteOf — get the outer note ****/

  _outerNoteOf (Id:string):SDS_Note | undefined {
    const OuterId = this._outerNoteIdOf(Id)
    return OuterId != null ? this.#wrapNote(OuterId) : undefined
  }


/**** _outerNoteIdOf — get outer note ID or undefined ****/

  _outerNoteIdOf (Id:string):string | undefined {
    const EntryMap     = this.#getEntryMap(Id)
    const outerNoteId  = EntryMap?.get('outerNoteId') as string | undefined
    return (outerNoteId != null && outerNoteId !== '') ? outerNoteId : undefined
  }


/**** _outerNotesOf — get ancestor chain from entry to root ****/

  _outerNotesOf (Id:string):SDS_Note[] {
    const Result:SDS_Note[] = []
    let currentId:string | undefined = this._outerNoteIdOf(Id)
    while (currentId != null) {
      Result.push(this.#wrapNote(currentId))
      if (currentId === RootId) { break }
      currentId = this._outerNoteIdOf(currentId)
    }
    return Result
  }


/**** _outerNoteIdsOf — get ancestor IDs from entry to root ****/

  _outerNoteIdsOf (Id:string):string[] {
    return this._outerNotesOf(Id).map((n) => n.Id)
  }


/**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/

  _innerEntriesOf (NoteId:string):SDS_Entry[] {
    const Store  = this
    const Sorted = this.#sortedInnerEntriesOf(NoteId)

    return new Proxy([] as SDS_Entry[], {
      get (_target, Prop) {
        if (Prop === 'length') { return Sorted.length }
        if (Prop === Symbol.iterator) {
          return function* () {
            for (let i = 0; i < Sorted.length; i++) {
              yield Store.#wrap(Sorted[i].Id)
            }
          }
        }
        if (typeof Prop === 'string' && ! isNaN(Number(Prop))) {
          const Idx = Number(Prop)
          return (Idx >= 0 && Idx < Sorted.length)
            ? Store.#wrap(Sorted[Idx].Id)
            : undefined
        }
        return (_target as any)[Prop]
      },
    })
  }


/**** _mayMoveEntryTo — check if entry can be moved without cycles ****/

  _mayMoveEntryTo (Id:string, outerNoteId:string, _InsertionIndex?:number):boolean {
    if (Id === RootId || Id === outerNoteId) { return false }
    if (Id === TrashId || Id === LostAndFoundId) { return outerNoteId === RootId }
    return ! this.#isDescendantOf(outerNoteId, Id)
  }


/**** _mayDeleteEntry — check if entry is deletable ****/

  _mayDeleteEntry (Id:string):boolean {
    return Id !== RootId && Id !== TrashId && Id !== LostAndFoundId
  }


/**** _TargetOf — get the target note for a link ****/

  _TargetOf (Id:string):SDS_Note {
    const EntryMap = this.#getEntryMap(Id)
    const TargetId = EntryMap?.get('TargetId') as string | undefined
    if (! TargetId) {
      throw new SDS_Error('not-found', `link '${Id}' has no target`)
    }
    return this.#wrapNote(TargetId)
  }


/**** _EntryAsJSON — serialize entry and subtree to JSON ****/

  _EntryAsJSON (Id:string):unknown {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) {
      throw new SDS_Error('not-found', `entry '${Id}' not found`)
    }
    const SubEntries: Record<string,any> = {}
    this.#collectSubtree(Id, SubEntries)
    return { Entries: SubEntries }
  }


/**** #collectSubtree — recursively serialize entry and its children ****/

  #collectSubtree (Id:string, Out:Record<string,any>):void {
    const EntryMap = this.#getEntryMap(Id)
    if (EntryMap == null) { return }

    const outerNoteId = EntryMap.get('outerNoteId') as string | undefined
    const OrderKey    = EntryMap.get('OrderKey') as string | undefined
    const LabelVal    = EntryMap.get('Label')
    const InfoMap     = EntryMap.get('Info') as LoroMap | undefined
    const Info: Record<string,any> = InfoMap instanceof LoroMap
      ? InfoMap.toJSON() as Record<string,any>
      : {}

    const Entry: Record<string,any> = {
      Kind:  EntryMap.get('Kind'),
      Label: LabelVal instanceof LoroText ? LabelVal.toString() : String(LabelVal ?? ''),
      Info,
    }
    if (outerNoteId && OrderKey) {
      Entry['outerPlacement'] = { outerNoteId:outerNoteId, OrderKey }
    }
    if (EntryMap.get('Kind') === 'note') {
      Entry['MIMEType']  = EntryMap.get('MIMEType') ?? ''
      Entry['ValueKind'] = EntryMap.get('ValueKind') ?? 'none'
      const LiteralVal = EntryMap.get('literalValue')
      if (LiteralVal instanceof LoroText) {
        Entry['literalValue'] = LiteralVal.toString()
      }
      const BinVal = EntryMap.get('binaryValue')
      if (BinVal instanceof Uint8Array) { Entry['binaryValue'] = BinVal }
      const ValueRefJSON = EntryMap.get('ValueRef') as string | undefined
      if (ValueRefJSON) { try { Entry['ValueRef'] = JSON.parse(ValueRefJSON) } catch (_) {} }
    } else {
      Entry['TargetId'] = EntryMap.get('TargetId')
    }
    Out[Id] = Entry

    for (const innerEntryId of (this.#ReverseIndex.get(Id) ?? new Set())) {
      this.#collectSubtree(innerEntryId, Out)
    }
  }


/**** #isDescendantOf — check if one entry is a descendant of another ****/

  #isDescendantOf (MaybeDescendantId:string, AncestorId:string):boolean {
    let currentId:string | undefined = MaybeDescendantId
    while (currentId != null) {
      if (currentId === AncestorId) { return true }
      currentId = this._outerNoteIdOf(currentId)
    }
    return false
  }
}
