/*******************************************************************************
*                                                                              *
*       SNS_NoteStore - wraps a Y.js CRDT Doc without exposing it              *
*                                                                              *
*******************************************************************************/

// Y.js data model (all inside one Y.Doc):
//
//   doc.getMap('Entries')   →  Y.Map<string, Y.Map<any>>
//
//   Per-entry Y.Map fields:
//     Kind:          string           'note' | 'link'
//     outerNoteId:   string           '' for the root note (no outer note)
//     OrderKey:      string           fractional-indexing key
//     Label:         Y.Text           collaborative string
//     Info:          Y.Map<any>       arbitrary metadata
//     MIMEType:      string           (notes only; '' = 'text/plain')
//     ValueKind:     string           (notes only)
//     literalValue:  Y.Text           (notes, ValueKind=literal only)
//     binaryValue:   Uint8Array       (notes, ValueKind=binary only)
//     ValueRef:      { Hash, Size }   (notes, *-reference only)
//     TargetId:      string           (links only)

import * as Y                    from 'yjs'
import { z }                     from 'zod'
import { gzipSync, gunzipSync }  from 'fflate'
import { generateKeyBetween }    from 'fractional-indexing'
import { SNS_Error }             from '../error/SNS_Error.js'
import { SNS_Entry }             from '@rozek/sns-core'
import { SNS_Note }              from '@rozek/sns-core'
import { SNS_Link }              from '@rozek/sns-core'
import {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit,
  DefaultWrapperCacheSize,
} from './constants.js'
import type { SNS_ChangeSet }  from '../changeset/SNS_ChangeSet.js'
import type { SNS_SyncCursor } from '../interfaces/SNS_PersistenceProvider.js'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export type ChangeOrigin  = 'internal' | 'external'
  export type ChangeHandler = (Origin:ChangeOrigin, ChangeSet:SNS_ChangeSet) => void

  export interface SNS_NoteStoreOptions {
    LiteralSizeLimit?:number

    // Time in milliseconds after which entries that have been moved to TrashNote
    // are automatically purged. Protected entries (those with incoming links from
    // the root-reachable tree) are silently skipped.
    // Undefined (the default) disables auto-purge.
    TrashTTLms?:number

    // How often the auto-purge check runs, in milliseconds.
    // Defaults to min(TrashTTLms / 4, 3 600 000).
    // Ignored when TrashTTLms is not set.
    TrashCheckIntervalMs?:number
  }

//----------------------------------------------------------------------------//
//                          Zod Validation Schemas                            //
//----------------------------------------------------------------------------//

  const StringSchema   = z.string()
  const MIMETypeSchema = z.string().min(1)
  const OptIndexSchema = z.number().int().nonnegative().optional()

//----------------------------------------------------------------------------//
//                                SNS_NoteStore                               //
//----------------------------------------------------------------------------//

export class SNS_NoteStore {

/**** private state ****/

  #doc:              Y.Doc
  #EntriesMap:       Y.Map<Y.Map<any>>
  #LiteralSizeLimit:number
  #TrashTTLms:       number | null
  #TrashCheckTimer:  ReturnType<typeof setInterval> | null = null
  #Handlers:         Set<ChangeHandler> = new Set()

  // reverse index: outerNoteId → Set<entryId>
  #ReverseIndex:Map<string,Set<string>> = new Map()

  // forward index: entryId → outerNoteId  (kept in sync with #ReverseIndex)
  #ForwardIndex:Map<string,string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex:Map<string,Set<string>> = new Map()

  // link forward index: linkId → targetId  (kept in sync with #LinkTargetIndex)
  #LinkForwardIndex:Map<string,string> = new Map()

  // LRU wrapper cache
  #WrapperCache:Map<string,SNS_Entry> = new Map()
  readonly #MaxCacheSize = DefaultWrapperCacheSize

  // transaction nesting
  #TransactDepth = 0

  // ChangeSet accumulator inside a transaction
  #PendingChangeSet:SNS_ChangeSet = {}

  // suppress index updates / change tracking when applying remote patches
  #ApplyingExternal = false

//----------------------------------------------------------------------------//
//                               Construction                                 //
//----------------------------------------------------------------------------//

/**** constructor — initialise store from document and options ****/

  private constructor (Doc:Y.Doc, Options?:SNS_NoteStoreOptions) {
    this.#doc              = Doc
    this.#EntriesMap       = Doc.getMap('Entries') as Y.Map<Y.Map<any>>
    this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit
    this.#TrashTTLms       = Options?.TrashTTLms ?? null
    this.#rebuildIndices()

    if (this.#TrashTTLms != null) {
      const CheckIntervalMs = Options?.TrashCheckIntervalMs
        ?? Math.min(Math.floor(this.#TrashTTLms / 4), 3_600_000)
      this.#TrashCheckTimer = setInterval(
        () => { this.purgeExpiredTrashEntries() },
        CheckIntervalMs
      )
      // Let Node.js exit even while the timer is pending.
      if (typeof (this.#TrashCheckTimer as any)?.unref === 'function') {
        (this.#TrashCheckTimer as any).unref()
      }
    }
  }


/**** fromScratch — build initial document with three well-known notes ****/

  static fromScratch (Options?:SNS_NoteStoreOptions):SNS_NoteStore {
  /*
   * For the Y.js backend we build the initial document from scratch by
   * creating the three well-known notes with their fixed UUIDs.  Because Y.js
   * CRDT conflict resolution is deterministic (last-write-wins by logical
   * clock for map values), two independent peers calling fromScratch() will
   * converge to the same state after the first patch exchange — without
   * requiring a canonical pre-generated snapshot.
   */
    const Doc        = new Y.Doc()
    const EntriesMap = Doc.getMap('Entries') as Y.Map<Y.Map<any>>

    Doc.transact(() => {
      // root note (outermost note, no outer note)
      const Root = new Y.Map<any>()
      Root.set('Kind',        'note')
      Root.set('outerNoteId', '')
      Root.set('OrderKey',    '')
      Root.set('Label',       new Y.Text())
      Root.set('Info',        new Y.Map())
      Root.set('MIMEType',    '')
      Root.set('ValueKind',   'none')
      EntriesMap.set(RootId, Root)

      // Trash note
      const Trash = new Y.Map<any>()
      Trash.set('Kind',        'note')
      Trash.set('outerNoteId', RootId)
      Trash.set('OrderKey',    'a0')
      Trash.set('Label',       new Y.Text('trash'))
      Trash.set('Info',        new Y.Map())
      Trash.set('MIMEType',    '')
      Trash.set('ValueKind',   'none')
      EntriesMap.set(TrashId, Trash)

      // Lost & Found note
      const LostAndFound = new Y.Map<any>()
      LostAndFound.set('Kind',        'note')
      LostAndFound.set('outerNoteId', RootId)
      LostAndFound.set('OrderKey',    'a1')
      LostAndFound.set('Label',       new Y.Text('lost-and-found'))
      LostAndFound.set('Info',        new Y.Map())
      LostAndFound.set('MIMEType',    '')
      LostAndFound.set('ValueKind',   'none')
      EntriesMap.set(LostAndFoundId, LostAndFound)
    })

    return new SNS_NoteStore(Doc, Options)
  }

/**** fromBinary — restore store from compressed update ****/

  static fromBinary (Data:Uint8Array, Options?:SNS_NoteStoreOptions):SNS_NoteStore {
    const Doc = new Y.Doc()
    Y.applyUpdate(Doc, gunzipSync(Data))
    return new SNS_NoteStore(Doc, Options)
  }

/**** fromJSON — restore store from base64-encoded data ****/

  static fromJSON (Data:unknown, Options?:SNS_NoteStoreOptions):SNS_NoteStore {
    let Binary:Uint8Array
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) {
      Binary = new Uint8Array(NodeBuffer.from(String(Data), 'base64'))
    } else {
      Binary = Uint8Array.from(atob(String(Data)), (c) => c.charCodeAt(0))
    }
    return SNS_NoteStore.fromBinary(Binary, Options)
  }

//----------------------------------------------------------------------------//
//                             Well-known notes                               //
//----------------------------------------------------------------------------//

/**** RootNote / TrashNote / LostAndFoundNote — access system notes ****/

  get RootNote ():SNS_Note         { return this.#wrapNote(RootId) }
  get TrashNote ():SNS_Note        { return this.#wrapNote(TrashId) }
  get LostAndFoundNote ():SNS_Note { return this.#wrapNote(LostAndFoundId) }

//----------------------------------------------------------------------------//
//                                   Lookup                                   //
//----------------------------------------------------------------------------//

/**** EntryWithId — retrieve entry by ID ****/

  EntryWithId (EntryId:string):SNS_Entry | undefined {
    if (! this.#EntriesMap.has(EntryId)) { return undefined }
    return this.#wrap(EntryId)
  }

//----------------------------------------------------------------------------//
//                                  Factory                                   //
//----------------------------------------------------------------------------//

/**** newNoteAt — create note as inner note of outer note ****/

  newNoteAt (OuterNote:SNS_Note, Type?:string, InsertionIndex?:number):SNS_Note {
    const effectiveType = Type ?? DefaultMIMEType
    if (! MIMETypeSchema.safeParse(effectiveType).success) {
      throw new SNS_Error('invalid-argument', 'MIMEType must be a non-empty string')
    }
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)

    const Id        = crypto.randomUUID()
    const OrderKey  = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
    const storedType = effectiveType === DefaultMIMEType ? '' : effectiveType

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'note')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text())
      EntryMap.set('Info',        new Y.Map())
      EntryMap.set('MIMEType',    storedType)
      EntryMap.set('ValueKind',   'none')
      this.#EntriesMap.set(Id, EntryMap)

      this.#addToReverseIndex(OuterNote.Id, Id)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(Id, 'outerNote')
    })

    return this.#wrapNote(Id)
  }

/**** newLinkAt — create link as inner link of outer note ****/

  newLinkAt (Target:SNS_Note, OuterNote:SNS_Note, InsertionIndex?:number):SNS_Link {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(Target.Id)
    this.#requireNoteExists(OuterNote.Id)

    const Id       = crypto.randomUUID()
    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text())
      EntryMap.set('Info',        new Y.Map())
      EntryMap.set('TargetId',    Target.Id)
      this.#EntriesMap.set(Id, EntryMap)

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

/**** deserializeNoteInto — import note subtree with remapped IDs ****/

  deserializeNoteInto (
    Serialization:unknown, OuterNote:SNS_Note, InsertionIndex?:number
  ):SNS_Note {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)
    if (Serialization == null) {
      throw new SNS_Error('invalid-argument', 'Serialisation must not be null')
    }

    const RestoredView = Serialization as { Entries: Record<string,any> }
    const Ids          = Object.keys(RestoredView.Entries ?? {})
    if (Ids.length === 0) {
      throw new SNS_Error('invalid-argument', 'empty serialisation')
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
        const Data    = RestoredView.Entries[oldId]
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

        const EntryMap = new Y.Map<any>()
        EntryMap.set('Kind',  Data.Kind)
        EntryMap.set('Label', new Y.Text(Data.Label ?? ''))
        EntryMap.set('Info',  new Y.Map())

        if (newOuterNoteId != null) {
          EntryMap.set('outerNoteId', newOuterNoteId)
          EntryMap.set('OrderKey',    newOrderKey)
        } else {
          EntryMap.set('outerNoteId', '')
          EntryMap.set('OrderKey',    '')
        }

        if (Data.Kind === 'note') {
          EntryMap.set('MIMEType',  Data.MIMEType ?? '')
          EntryMap.set('ValueKind', 'none')
        } else {
          EntryMap.set('TargetId',
            Data.TargetId != null ? (IdMap.get(Data.TargetId) ?? Data.TargetId) : '')
        }

        this.#EntriesMap.set(newId, EntryMap)
        if (newOuterNoteId) { this.#addToReverseIndex(newOuterNoteId, newId) }
        if (Data.Kind === 'link' && Data.TargetId != null) {
          this.#addToLinkTargetIndex(IdMap.get(Data.TargetId) ?? Data.TargetId, newId)
        }
      }
      this.#recordChange(OuterNote.Id, 'innerEntryList')
    })

    return this.#wrapNote(newRootId)
  }

/**** deserializeLinkInto — import link with remapped target ID ****/

  deserializeLinkInto (
    Serialization:unknown, OuterNote:SNS_Note, InsertionIndex?:number
  ):SNS_Link {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(OuterNote.Id)
    if (Serialization == null) {
      throw new SNS_Error('invalid-argument', 'Serialisation must not be null')
    }

    const RestoredView = Serialization as { Entries: Record<string,any> }
    const Ids          = Object.keys(RestoredView.Entries ?? {})
    if (Ids.length === 0) {
      throw new SNS_Error('invalid-argument', 'empty serialisation')
    }

    const Data = RestoredView.Entries[Ids[0]]
    if (Data.Kind !== 'link') {
      throw new SNS_Error('invalid-argument', 'serialisation is not a link')
    }

    const newId    = crypto.randomUUID()
    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = new Y.Map<any>()
      EntryMap.set('Kind',        'link')
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)
      EntryMap.set('Label',       new Y.Text(Data.Label ?? ''))
      EntryMap.set('Info',        new Y.Map())
      EntryMap.set('TargetId',    Data.TargetId ?? '')
      this.#EntriesMap.set(newId, EntryMap)

      this.#addToReverseIndex(OuterNote.Id, newId)
      if (Data.TargetId) { this.#addToLinkTargetIndex(Data.TargetId, newId) }
      this.#recordChange(OuterNote.Id, 'innerEntryList')
    })

    return this.#wrapLink(newId)
  }

//----------------------------------------------------------------------------//
//                               Move / Delete                                //
//----------------------------------------------------------------------------//

/**** EntryMayBeMovedTo — check if entry can move to new outer note ****/

  EntryMayBeMovedTo (Entry:SNS_Entry, OuterNote:SNS_Note, InsertionIndex?:number):boolean {
    return Entry.mayBeMovedTo(OuterNote, InsertionIndex)
  }

/**** moveEntryTo — move entry to new outer note and position ****/

  moveEntryTo (Entry:SNS_Entry, OuterNote:SNS_Note, InsertionIndex?:number):void {
    OptIndexSchema.parse(InsertionIndex)
    if (! this._mayMoveEntryTo(Entry.Id, OuterNote.Id, InsertionIndex)) {
      throw new SNS_Error('move-would-cycle',
        'cannot move an entry into one of its own descendants')
    }

    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey       = this.#orderKeyAt(OuterNote.Id, InsertionIndex)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Entry.Id)!
      EntryMap.set('outerNoteId', OuterNote.Id)
      EntryMap.set('OrderKey',    OrderKey)

      // When moving an entry out of TrashNote, remove the _trashedAt timestamp
      // so that a subsequent deleteEntry() will record a fresh timestamp.
      if (oldOuterNoteId === TrashId && OuterNote.Id !== TrashId) {
        const InfoMap = EntryMap.get('Info') as Y.Map<any> | undefined
        if (InfoMap instanceof Y.Map && InfoMap.has('_trashedAt')) {
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

/**** EntryMayBeDeleted — check if entry can be deleted ****/

  EntryMayBeDeleted (Entry:SNS_Entry):boolean {
    return Entry.mayBeDeleted
  }

/**** deleteEntry — move entry to trash with timestamp ****/

  deleteEntry (Entry:SNS_Entry):void {
    if (! this._mayDeleteEntry(Entry.Id)) {
      throw new SNS_Error('delete-not-permitted', 'this entry cannot be deleted')
    }
    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey       = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)

    this.transact(() => {
      const EntryMap = this.#EntriesMap.get(Entry.Id)!
      EntryMap.set('outerNoteId', TrashId)
      EntryMap.set('OrderKey',    OrderKey)

      // Ensure Info Y.Map exists before writing _trashedAt
      let InfoMap = EntryMap.get('Info') as Y.Map<any> | undefined
      if (! (InfoMap instanceof Y.Map)) {
        InfoMap = new Y.Map()
        EntryMap.set('Info', InfoMap)
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

/**** purgeEntry — permanently delete entry and subtree ****/

  purgeEntry (Entry:SNS_Entry):void {
    const oldOuter = this._outerNoteIdOf(Entry.Id)
    if (oldOuter !== TrashId) {
      throw new SNS_Error('purge-not-in-trash',
        'only direct children of TrashNote can be purged')
    }
    if (this.#isProtected(Entry.Id)) {
      throw new SNS_Error('purge-protected',
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
      if (EntryMap.get('outerNoteId') !== TrashId) { continue }
      const InfoMap   = EntryMap.get('Info') as Y.Map<any> | undefined
      const trashedAt = InfoMap instanceof Y.Map ? InfoMap.get('_trashedAt') : undefined
      if (typeof trashedAt !== 'number') { continue }
      if (Now - trashedAt < effectiveTTL) { continue }
      try {
        this.purgeEntry(this.#wrap(EntryId))
        Count++
      } catch (_Signal) { /* protected or already removed — skip */ }
    }
    return Count
  }

/**** dispose — cleanup trash timer ****/

  dispose ():void {
    if (this.#TrashCheckTimer != null) {
      clearInterval(this.#TrashCheckTimer)
      this.#TrashCheckTimer = null
    }
  }

//----------------------------------------------------------------------------//
//                           Transactions & Events                            //
//----------------------------------------------------------------------------//

/**** transact — execute callback in batched transaction ****/

  transact (Callback:() => void):void {
    this.#TransactDepth++
    try {
      if (this.#TransactDepth === 1 && ! this.#ApplyingExternal) {
        // Outermost local transaction: wrap in a Y.js transaction so all
        // CRDT mutations are batched into a single update event.
        this.#doc.transact(() => { Callback() })
      } else {
        Callback()
      }
    } finally {
      this.#TransactDepth--
      if (this.#TransactDepth === 0) {
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

  get currentCursor ():SNS_SyncCursor {
    return Y.encodeStateVector(this.#doc)
  }

/**** exportPatch — encode changes since cursor ****/

  exportPatch (sinceCursor?:SNS_SyncCursor):Uint8Array {
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

        // Orphaned entry: outerNoteId points to a missing note
        const outerNoteId = EntryMap.get('outerNoteId') as string | undefined
        if (outerNoteId && ! allIds.has(outerNoteId)) {
          const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
          EntryMap.set('outerNoteId', LostAndFoundId)
          EntryMap.set('OrderKey',    OrderKey)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(EntryId, 'outerNote')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          hasChanges = true
        }

        // Dangling link: TargetId points to a missing note
        if (EntryMap.get('Kind') === 'link') {
          const TargetId = EntryMap.get('TargetId') as string | undefined
          if (TargetId && ! allIds.has(TargetId)) {
            const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(LostAndFoundId), null)
            const newNote  = new Y.Map<any>()
            newNote.set('Kind',        'note')
            newNote.set('outerNoteId', LostAndFoundId)
            newNote.set('OrderKey',    OrderKey)
            newNote.set('Label',       new Y.Text())
            newNote.set('Info',        new Y.Map())
            newNote.set('MIMEType',    '')
            newNote.set('ValueKind',   'none')
            this.#EntriesMap.set(TargetId, newNote)
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

/**** asJSON — export as base64-encoded compressed update ****/

  asJSON ():string {
    const Bytes  = this.asBinary()
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

/**** #requireNoteExists — throw if note does not exist ****/

  #requireNoteExists (Id:string):void {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null || EntryMap.get('Kind') !== 'note') {
      throw new SNS_Error('invalid-argument', `note '${Id}' does not exist`)
    }
  }

/**** #wrap / #wrapNote / #wrapLink — return cached wrapper objects ****/

  #wrap (Id:string):SNS_Entry {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) {
      throw new SNS_Error('invalid-argument', `entry '${Id}' not found`)
    }
    return EntryMap.get('Kind') === 'note' ? this.#wrapNote(Id) : this.#wrapLink(Id)
  }

/**** #wrapNote — return or create cached wrapper for note ****/

  #wrapNote (Id:string):SNS_Note {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SNS_Note) { return Cached }
    const Wrapper = new SNS_Note(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #wrapLink — return or create cached wrapper for link ****/

  #wrapLink (Id:string):SNS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SNS_Link) { return Cached }
    const Wrapper = new SNS_Link(this, Id)
    this.#cacheWrapper(Id, Wrapper)
    return Wrapper
  }

/**** #cacheWrapper — add wrapper to LRU cache ****/

  #cacheWrapper (Id:string, Wrapper:SNS_Entry):void {
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
      const outerNoteId = EntryMap.get('outerNoteId') as string | undefined
      if (outerNoteId) { this.#addToReverseIndex(outerNoteId, EntryId) }
      if (EntryMap.get('Kind') === 'link') {
        const TargetId = EntryMap.get('TargetId') as string | undefined
        if (TargetId) { this.#addToLinkTargetIndex(TargetId, EntryId) }
      }
    })
  }

/**** #updateIndicesFromView — incremental diff after remote patches ****/

  #updateIndicesFromView ():void {
    const SeenIds = new Set<string>()

    // Pass 1: created and changed entries
    this.#EntriesMap.forEach((EntryMap, EntryId) => {
      SeenIds.add(EntryId)

      const newOuterNoteId = (EntryMap.get('outerNoteId') as string | undefined) || undefined
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

      if (EntryMap.get('Kind') === 'link') {
        const newTargetId = EntryMap.get('TargetId') as string | undefined
        const oldTargetId = this.#LinkForwardIndex.get(EntryId)
        if (newTargetId !== oldTargetId) {
          if (oldTargetId != null) { this.#removeFromLinkTargetIndex(oldTargetId, EntryId) }
          if (newTargetId != null) { this.#addToLinkTargetIndex(newTargetId, EntryId) }
        }
      } else if (this.#LinkForwardIndex.has(EntryId)) {
        this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId)!, EntryId)
      }

      // Conservative: assume label may have changed
      this.#recordChange(EntryId, 'Label')
    })

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

/**** #addToReverseIndex — add entry to reverse index ****/

  #addToReverseIndex (outerNoteId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerNoteId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerNoteId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerNoteId)
  }

/**** #removeFromReverseIndex — remove entry from reverse index ****/

  #removeFromReverseIndex (outerNoteId:string, EntryId:string):void {
    this.#ReverseIndex.get(outerNoteId)?.delete(EntryId)
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

/**** #orderKeyAt — generate fractional key at insertion position ****/

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

/**** #lastOrderKeyOf — get last inner entry's order key ****/

  #lastOrderKeyOf (NoteId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(NoteId)
    return innerEntries.length > 0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — retrieve children sorted by order key ****/

  #sortedInnerEntriesOf (NoteId:string):Array<{ Id:string; OrderKey:string }> {
    const innerIds = this.#ReverseIndex.get(NoteId) ?? new Set<string>()
    const Result:Array<{ Id:string; OrderKey:string }> = []
    for (const innerEntryId of innerIds) {
      const EntryMap = this.#EntriesMap.get(innerEntryId)
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

/**** #subtreeHasIncomingLinks — check if subtree has root-reachable links ****/

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

/**** #directTrashInnerEntryContaining — find direct inner entry of TrashNote containing entry ****/

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
    const EntryMap = this.#EntriesMap.get(EntryId)
    if (EntryMap == null) { return }

    const Kind        = EntryMap.get('Kind') as string
    const oldOuterNoteId = EntryMap.get('outerNoteId') as string | undefined

    const RootReachable = this.#reachableFromRoot()
    const Protected     = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#subtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        // Inner rescue: move to TrashNote top level
        const InnerMap = this.#EntriesMap.get(innerEntryId)!
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

    // Delete the entry itself
    this.#EntriesMap.delete(EntryId)
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

  #notifyHandlers (Origin:ChangeOrigin, ChangeSet:SNS_ChangeSet):void {
    if (Object.keys(ChangeSet).length === 0) { return }
    for (const Handler of this.#Handlers) {
      try { Handler(Origin, ChangeSet) } catch (_Signal) { /* swallow */ }
    }
  }

//----------------------------------------------------------------------------//
//           Internal helpers — called by SNS_Entry / Note / Link             //
//----------------------------------------------------------------------------//

/**** _KindOf — get entry kind ****/

  _KindOf (Id:string):'note' | 'link' {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) { throw new SNS_Error('not-found', `entry '${Id}' not found`) }
    return EntryMap.get('Kind') as 'note' | 'link'
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
    StringSchema.parse(Value)
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

/**** _TypeOf — get note MIME type ****/

  _TypeOf (Id:string):string {
    const EntryMap = this.#EntriesMap.get(Id)
    const Stored   = (EntryMap?.get('MIMEType') as string | undefined) ?? ''
    return Stored === '' ? DefaultMIMEType : Stored
  }

/**** _setTypeOf — set note MIME type ****/

  _setTypeOf (Id:string, Value:string):void {
    MIMETypeSchema.parse(Value)
    const storedValue = Value === DefaultMIMEType ? '' : Value
    this.transact(() => {
      this.#EntriesMap.get(Id)?.set('MIMEType', storedValue)
      this.#recordChange(Id, 'Type')
    })
  }

/**** _ValueKindOf — get note value kind ****/

  _ValueKindOf (Id:string):
    'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending'
  {
    const EntryMap = this.#EntriesMap.get(Id)
    return ((EntryMap?.get('ValueKind') as string | undefined) ?? 'none') as any
  }

/**** _isLiteralOf — check if note has literal value ****/

  _isLiteralOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'literal' || Kind === 'literal-reference'
  }

/**** _isBinaryOf — check if note has binary value ****/

  _isBinaryOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'binary' || Kind === 'binary-reference'
  }

/**** _readValueOf — get note value (literal or binary) ****/

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
      default:
        throw new SNS_Error('not-implemented',
          'large value fetching requires a ValueStore (not yet wired)')
    }
  }

/**** _writeValueOf — set note value ****/

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
          const Hash    = `sha256-size-${Bytes.byteLength}`
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
          const Hash  = `sha256-size-${Bytes.byteLength}`
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
      throw new SNS_Error('change-value-not-literal',
        "changeValue() is only available when ValueKind === 'literal'")
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
          if (InfoMap instanceof Y.Map) { InfoMap.delete(Key) }
          Store.#recordChange(Id, `Info.${Key}`)
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

/**** _outerNoteOf — get outer note ****/

  _outerNoteOf (Id:string):SNS_Note | undefined {
    const OuterId = this._outerNoteIdOf(Id)
    return OuterId != null ? this.#wrapNote(OuterId) : undefined
  }

/**** _outerNoteIdOf — get outer note ID ****/

  _outerNoteIdOf (Id:string):string | undefined {
    const EntryMap     = this.#EntriesMap.get(Id)
    const outerNoteId  = EntryMap?.get('outerNoteId') as string | undefined
    return (outerNoteId != null && outerNoteId !== '') ? outerNoteId : undefined
  }

/**** _outerNotesOf — get ancestor chain ****/

  _outerNotesOf (Id:string):SNS_Note[] {
    const Result:SNS_Note[] = []
    let currentId:string | undefined = this._outerNoteIdOf(Id)
    while (currentId != null) {
      Result.push(this.#wrapNote(currentId))
      if (currentId === RootId) { break }
      currentId = this._outerNoteIdOf(currentId)
    }
    return Result
  }

/**** _outerNoteIdsOf — get ancestor IDs ****/

  _outerNoteIdsOf (Id:string):string[] {
    return this._outerNotesOf(Id).map((n) => n.Id)
  }

/**** _innerEntriesOf — get sorted children as array-like proxy ****/

  _innerEntriesOf (NoteId:string):SNS_Entry[] {
    const Store  = this
    const Sorted = this.#sortedInnerEntriesOf(NoteId)

    return new Proxy([] as SNS_Entry[], {
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

/**** _mayMoveEntryTo — check move validity ****/

  _mayMoveEntryTo (Id:string, outerNoteId:string, _InsertionIndex?:number):boolean {
    if (Id === RootId || Id === outerNoteId) { return false }
    if (Id === TrashId || Id === LostAndFoundId) { return outerNoteId === RootId }
    return ! this.#isDescendantOf(outerNoteId, Id)
  }

/**** _mayDeleteEntry — check delete validity ****/

  _mayDeleteEntry (Id:string):boolean {
    return Id !== RootId && Id !== TrashId && Id !== LostAndFoundId
  }

/**** _TargetOf — get link target note ****/

  _TargetOf (Id:string):SNS_Note {
    const EntryMap = this.#EntriesMap.get(Id)
    const TargetId = EntryMap?.get('TargetId') as string | undefined
    if (! TargetId) {
      throw new SNS_Error('not-found', `link '${Id}' has no target`)
    }
    return this.#wrapNote(TargetId)
  }

/**** _EntryAsJSON — serialize entry and subtree ****/

  _EntryAsJSON (Id:string):unknown {
    if (! this.#EntriesMap.has(Id)) {
      throw new SNS_Error('not-found', `entry '${Id}' not found`)
    }
    const SubEntries:Record<string,any> = {}
    this.#collectSubtree(Id, SubEntries)
    return { Entries: SubEntries }
  }

/**** #collectSubtree — recursively serialize entry and descendants ****/

  #collectSubtree (Id:string, Out:Record<string,any>):void {
    const EntryMap = this.#EntriesMap.get(Id)
    if (EntryMap == null) { return }

    const outerNoteId = EntryMap.get('outerNoteId') as string | undefined
    const OrderKey    = EntryMap.get('OrderKey') as string | undefined
    const LabelVal    = EntryMap.get('Label')
    const InfoMap     = EntryMap.get('Info') as Y.Map<any> | undefined
    const Info:Record<string,any> = {}
    if (InfoMap instanceof Y.Map) {
      InfoMap.forEach((Val, Key) => { Info[Key] = Val })
    }

    const Entry:Record<string,any> = {
      Kind:  EntryMap.get('Kind'),
      Label: LabelVal instanceof Y.Text ? LabelVal.toString() : String(LabelVal ?? ''),
      Info,
    }
    if (outerNoteId && OrderKey) {
      Entry['outerPlacement'] = { outerNoteId:outerNoteId, OrderKey }
    }
    if (EntryMap.get('Kind') === 'note') {
      Entry['MIMEType']  = EntryMap.get('MIMEType') ?? ''
      Entry['ValueKind'] = EntryMap.get('ValueKind') ?? 'none'
      const LiteralVal = EntryMap.get('literalValue')
      if (LiteralVal instanceof Y.Text) {
        Entry['literalValue'] = LiteralVal.toString()
      }
      const BinVal = EntryMap.get('binaryValue')
      if (BinVal instanceof Uint8Array) { Entry['binaryValue'] = BinVal }
      const ValueRef = EntryMap.get('ValueRef')
      if (ValueRef != null) { Entry['ValueRef'] = ValueRef }
    } else {
      Entry['TargetId'] = EntryMap.get('TargetId')
    }
    Out[Id] = Entry

    for (const innerEntryId of (this.#ReverseIndex.get(Id) ?? new Set())) {
      this.#collectSubtree(innerEntryId, Out)
    }
  }

/**** #isDescendantOf — check ancestor relationship ****/

  #isDescendantOf (MaybeDescendantId:string, AncestorId:string):boolean {
    let currentId:string | undefined = MaybeDescendantId
    while (currentId != null) {
      if (currentId === AncestorId) { return true }
      currentId = this._outerNoteIdOf(currentId)
    }
    return false
  }
}
