/*******************************************************************************
*                                                                              *
*       SNS_NoteStore - wraps a json-joy CRDT Model without exposing it        *
*                                                                              *
*******************************************************************************/

// json-joy Model data model:
//
//   model.root.Entries   →  { [id: string]: EntryRecord }
//
//   Per-entry EntryRecord fields:
//     Kind:          string           'note' | 'link'
//     outerPlacement:{outerNoteId, OrderKey}
//     Label:         string           collaborative string
//     Info:          { [key: string]: any }  arbitrary metadata
//     MIMEType:      string           (notes only; '' = 'text/plain')
//     ValueKind:     string           (notes only)
//     literalValue:  string           (notes, ValueKind=literal only)
//     binaryValue:   Uint8Array       (notes, ValueKind=binary only)
//     ValueRef:      { Hash, Size }   (notes, *-reference only)
//     TargetId:      string           (links only)

import { Model } from 'json-joy/lib/json-crdt/index.js'
import { s as Schema } from 'json-joy/lib/json-crdt-patch/schema.js'
import { Patch } from 'json-joy/lib/json-crdt-patch/index.js'
import { gzipSync, gunzipSync } from 'fflate'
import { generateKeyBetween } from 'fractional-indexing'
import { SNS_Error, SNS_Entry, SNS_Note, SNS_Link } from '@rozek/sns-core'
import {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit,
  DefaultWrapperCacheSize,
} from './constants.js'
import { CanonicalEmptySnapshot } from './canonical-empty-snapshot.js'
import type { SNS_ChangeSet, SNS_SyncCursor } from '@rozek/sns-core'

//----------------------------------------------------------------------------//
//                                   Types                                    //
//----------------------------------------------------------------------------//

  export type ChangeOrigin = 'internal' | 'external'
  export type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void

  export interface SNS_NoteStoreOptions {
    LiteralSizeLimit?: number
    TrashTTLms?: number
    TrashCheckIntervalMs?: number
  }

//----------------------------------------------------------------------------//
//                          Zod Validation Schemas                            //
//----------------------------------------------------------------------------//

import { z } from 'zod'

const StringSchema = z.string()
const MIMETypeSchema = z.string().min(1)
const OptIndexSchema = z.number().int().nonnegative().optional()

//----------------------------------------------------------------------------//
//                                SNS_NoteStore                               //
//----------------------------------------------------------------------------//

export class SNS_NoteStore {

/**** private state ****/

  #Model: Model
  #LiteralSizeLimit: number
  #TrashTTLms: number | null
  #TrashCheckTimer: ReturnType<typeof setInterval> | null = null
  #Handlers: Set<ChangeHandler> = new Set()

  // reverse index: outerNoteId → Set<entryId>
  #ReverseIndex: Map<string, Set<string>> = new Map()

  // forward index: entryId → outerNoteId (kept in sync with #ReverseIndex)
  #ForwardIndex: Map<string, string> = new Map()

  // incoming link index: targetId → Set<linkId>
  #LinkTargetIndex: Map<string, Set<string>> = new Map()

  // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
  #LinkForwardIndex: Map<string, string> = new Map()

  // LRU wrapper cache
  #WrapperCache: Map<string, SNS_Entry> = new Map()
  readonly #MaxCacheSize = DefaultWrapperCacheSize

  // transaction nesting
  #TxnDepth = 0

  // ChangeSet accumulator inside a transaction
  #PendingChangeSet: SNS_ChangeSet = {}

  // patch log for exportPatch() — only locally generated patches (as binaries)
  #LocalPatches: Uint8Array[] = []

  // suppress index updates / change tracking when applying remote patches
  #ApplyingExternal = false

//----------------------------------------------------------------------------//
//                                Construction                                //
//----------------------------------------------------------------------------//

/**** constructor — initialize store with model and configuration ****/

  private constructor (Model_:Model, Options?:SNS_NoteStoreOptions) {
    this.#Model = Model_
    this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit
    this.#TrashTTLms = Options?.TrashTTLms ?? null

    this.#rebuildIndices()

    if (this.#TrashTTLms != null) {
      const CheckInterval =
        Options?.TrashCheckIntervalMs ??
        Math.min(Math.floor(this.#TrashTTLms/4), 3600000)
      this.#TrashCheckTimer = setInterval(
        () => {
          this.purgeExpiredTrashEntries()
        },
        CheckInterval
      )
      if (typeof (this.#TrashCheckTimer as any).unref === 'function') {
        (this.#TrashCheckTimer as any).unref()
      }
    }
  }

/**** fromScratch — create store from canonical empty snapshot ****/

  static fromScratch (Options?:SNS_NoteStoreOptions):SNS_NoteStore {
    return this.fromBinary(CanonicalEmptySnapshot, Options)
  }

/**** fromBinary — deserialize store from binary snapshot ****/

  static fromBinary (Binary:Uint8Array, Options?:SNS_NoteStoreOptions):SNS_NoteStore {
    const Decompressed = gunzipSync(Binary)
    const Model_ = Model.fromBinary(Decompressed)
    return new SNS_NoteStore(Model_, Options)
  }

/**** fromJSON — deserialize store from base64-encoded JSON snapshot ****/

  static fromJSON (JSON_:string, Options?:SNS_NoteStoreOptions):SNS_NoteStore {
    const NodeBuffer = (globalThis as any).Buffer
    const Binary = NodeBuffer != null
      ? new Uint8Array(NodeBuffer.from(String(JSON_), 'base64'))
      : Uint8Array.from(atob(String(JSON_)), (c) => c.charCodeAt(0))
    return this.fromBinary(Binary, Options)
  }

//----------------------------------------------------------------------------//
//                             Public Accessors                               //
//----------------------------------------------------------------------------//

/**** RootNote / TrashNote / LostAndFoundNote — access special notes ****/

  get RootNote ():SNS_Note {
    return this.#wrap(RootId) as SNS_Note
  }

  get TrashNote ():SNS_Note {
    return this.#wrap(TrashId) as SNS_Note
  }

  get LostAndFoundNote ():SNS_Note {
    return this.#wrap(LostAndFoundId) as SNS_Note
  }

/**** EntryWithId — retrieve entry by id ****/

  EntryWithId (Id:string):SNS_Entry | undefined {
    const EntryData = this.#view().Entries[Id]
    if (EntryData != null) {
      return this.#wrap(Id) as SNS_Entry
    }
    return undefined
  }

//----------------------------------------------------------------------------//
//                             Public Mutators                                //
//----------------------------------------------------------------------------//

/**** newNoteAt — create new note in specified location ****/

  newNoteAt (
    OuterNote:SNS_Note,
    MIMEType?:string,
    InsertionIndex?:number
  ):SNS_Note {
    const Type = MIMEType ?? DefaultMIMEType
    const MimeResult = MIMETypeSchema.safeParse(Type)
    if (! MimeResult.success) {
      throw new SNS_Error('invalid-argument', 'MIMEType must be a non-empty string')
    }
    OptIndexSchema.parse(InsertionIndex)

    return this.transact(() => {
      const NoteId = crypto.randomUUID()
      const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
      const storedType = Type === DefaultMIMEType ? '' : Type
      const EntryData = Schema.obj({
        Kind: Schema.con('note'),
        outerPlacement: Schema.val(Schema.con({ outerNoteId: OuterNote.Id, OrderKey: OrderKey })),
        Label: Schema.val(Schema.str('')),
        Info: Schema.obj({}),
        MIMEType: Schema.val(Schema.str(storedType)),
        ValueKind: Schema.val(Schema.str('none'))
      })
      this.#Model.api
        .obj(['Entries'])
        .set({ [NoteId]: EntryData })
      this.#addToReverseIndex(OuterNote.Id, NoteId)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(NoteId, 'outerNote')
      return this.#wrap(NoteId) as SNS_Note
    })
  }

/**** newLinkAt — create new link in specified location ****/

  newLinkAt (
    TargetNote:SNS_Note,
    OuterNote:SNS_Note,
    InsertionIndex?:number
  ):SNS_Link {
    OptIndexSchema.parse(InsertionIndex)
    this.#requireNoteExists(TargetNote.Id)
    this.#requireNoteExists(OuterNote.Id)

    return this.transact(() => {
      const LinkId = crypto.randomUUID()
      const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
      const LinkData = Schema.obj({
        Kind: Schema.con('link'),
        outerPlacement: Schema.val(Schema.con({ outerNoteId: OuterNote.Id, OrderKey: OrderKey })),
        Label: Schema.val(Schema.str('')),
        Info: Schema.obj({}),
        TargetId: Schema.con(TargetNote.Id)
      })
      this.#Model.api
        .obj(['Entries'])
        .set({ [LinkId]: LinkData })
      this.#addToReverseIndex(OuterNote.Id, LinkId)
      this.#addToLinkTargetIndex(TargetNote.Id, LinkId)
      this.#recordChange(OuterNote.Id, 'innerEntryList')
      this.#recordChange(LinkId, 'outerNote')
      return this.#wrap(LinkId) as SNS_Link
    })
  }

/**** deserializeNoteInto — deserialize note from JSON into tree ****/

  deserializeNoteInto (
    Data:any,
    OuterNote:SNS_Note,
    InsertionIndex?:number
  ):SNS_Note {
    OptIndexSchema.parse(InsertionIndex)

    if (Data == null) {
      throw new SNS_Error('invalid-argument', 'Serialisation must not be null')
    }

    // build a flat list of all entries (including nested ones from innerEntries)
    const allEntries: any[] = []
    const IdMap = new Map<string, string>()

    const addEntry = (Entry:any, OuterIdOrNote:string | SNS_Note):void => {
      const outerId = typeof OuterIdOrNote === 'string' ? OuterIdOrNote : OuterIdOrNote.Id
      const oldId = Entry.Id ?? crypto.randomUUID()
      const newId = crypto.randomUUID()
      IdMap.set(oldId, newId)

      allEntries.push({
        oldId,
        newId,
        outerId,
        Entry
      })

      // Recursively add inner entries
      if (Entry.innerEntries && Array.isArray(Entry.innerEntries)) {
        for (const innerEntry of Entry.innerEntries) {
          addEntry(innerEntry, newId)
        }
      }
    }

    addEntry(Data, OuterNote)

    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
    const RootNewId = IdMap.get(allEntries[0].oldId)!

    this.transact(() => {
      for (let i = 0; i < allEntries.length; i++) {
        const { oldId, newId, outerId, Entry } = allEntries[i]

        const outerNoteId = i === 0 ? OuterNote.Id : IdMap.get(outerId) ?? outerId
        const EntryOrderKey = i === 0 ? OrderKey : (Entry.outerPlacement?.OrderKey ?? '')

        const EntryDataObj: any = {
          Kind: Schema.con(Entry.Kind),
          outerPlacement: Schema.val(Schema.con({ outerNoteId: outerNoteId, OrderKey: EntryOrderKey })),
          Label: Schema.val(Schema.str(Entry.Label ?? '')),
          Info: Schema.obj({})
        }

        if (Entry.Kind === 'note') {
          // Preserve the MIME type (or use empty string if not provided)
          const storedType = Entry.Type === 'text/plain' ? '' : (Entry.Type ?? '')
          EntryDataObj.MIMEType = Schema.val(Schema.str(storedType))
          EntryDataObj.ValueKind = Schema.val(Schema.str(Entry.ValueKind ?? 'none'))
          if (Entry.literalValue) {
            EntryDataObj.literalValue = Entry.literalValue
          }
          if (Entry.binaryValue) {
            EntryDataObj.binaryValue = Entry.binaryValue
          }
          if (Entry.ValueRef) {
            EntryDataObj.ValueRef = Entry.ValueRef
          }
        } else if (Entry.Kind === 'link') {
          // Map old target ID to new target ID
          const TargetNewId = Entry.TargetId ? (IdMap.get(Entry.TargetId) ?? Entry.TargetId) : ''
          EntryDataObj.TargetId = Schema.con(TargetNewId)
        }

        const EntryData = Schema.obj(EntryDataObj)
        this.#Model.api
          .obj(['Entries'])
          .set({ [newId]: EntryData })

        this.#addToReverseIndex(outerNoteId, newId)

        if (Entry.Kind === 'link' && Entry.TargetId) {
          const TargetNewId = IdMap.get(Entry.TargetId) ?? Entry.TargetId
          this.#addToLinkTargetIndex(TargetNewId, newId)
        }
      }

      this.#recordChange(OuterNote.Id, 'innerEntryList')
    })

    return this.#wrap(RootNewId) as SNS_Note
  }

/**** deserializeLinkInto — deserialize link from JSON into tree ****/

  deserializeLinkInto (
    Data:any,
    OuterNote:SNS_Note,
    InsertionIndex?:number
  ):SNS_Link {
    const LinkId = Data.Id ?? crypto.randomUUID()
    const OrderKey = this.#orderKeyAt(OuterNote.Id, InsertionIndex)
    const LinkData = Schema.obj({
      Kind: Schema.con('link'),
      outerPlacement: Schema.val(Schema.con({ outerNoteId: OuterNote.Id, OrderKey: OrderKey })),
      Label: Schema.val(Schema.str(Data.Label ?? '')),
      Info: Schema.obj(Data.Info ?? {}),
      TargetId: Schema.con(Data.TargetId)
    })
    this.#Model.api
      .obj(['Entries'])
      .set({ [LinkId]: LinkData })
    this.#addToReverseIndex(OuterNote.Id, LinkId)
    this.#addToLinkTargetIndex(Data.TargetId, LinkId)
    this.#recordChange(OuterNote.Id, 'innerEntryList')
    this.#recordChange(LinkId, 'outerNote')
    return this.#wrap(LinkId) as SNS_Link
  }

/**** EntryMayBeMovedTo — check if entry can be moved to target ****/

  EntryMayBeMovedTo (Entry:SNS_Entry, OuterNote:SNS_Note, Index?:number):boolean {
    return this._mayMoveEntryTo(Entry.Id, OuterNote.Id, Index)
  }

/**** moveEntryTo — move entry to new location in tree ****/

  moveEntryTo (Entry:SNS_Entry, OuterNote:SNS_Note, Index?:number):void {
    OptIndexSchema.parse(Index)
    if (! this._mayMoveEntryTo(Entry.Id, OuterNote.Id, Index)) {
      throw new SNS_Error('move-would-cycle', 'cannot move an entry into one of its own descendants')
    }
    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey = this.#orderKeyAt(OuterNote.Id, Index)

    this.transact(() => {
      this.#Model.api
        .val(['Entries', Entry.Id, 'outerPlacement'])
        .set(Schema.con({ outerNoteId: OuterNote.Id, OrderKey: OrderKey }))

      // If moving out of trash, remove _trashedAt
      if (oldOuterNoteId === TrashId && OuterNote.Id !== TrashId) {
        const EntryData = this.#view().Entries[Entry.Id]
        const Info = (EntryData as any)?.Info
        if (Info != null && '_trashedAt' in Info) {
          this.#Model.api.obj(['Entries', Entry.Id, 'Info']).del(['_trashedAt'])
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
    return this._mayDeleteEntry(Entry.Id)
  }

/**** deleteEntry — move entry to trash ****/

  deleteEntry (Entry:SNS_Entry):void {
    if (! this._mayDeleteEntry(Entry.Id)) {
      throw new SNS_Error('delete-not-permitted', 'this entry cannot be deleted')
    }
    const oldOuterNoteId = this._outerNoteIdOf(Entry.Id)
    const OrderKey = this.#lastOrderKeyOf(TrashId)
    const newOrderKey = generateKeyBetween(OrderKey, null)

    this.transact(() => {
      this.#Model.api
        .val(['Entries', Entry.Id, 'outerPlacement'])
        .set(Schema.con({ outerNoteId: TrashId, OrderKey: newOrderKey }))

      this.#ensureInfoExists(Entry.Id)

      this.#Model.api
        .obj(['Entries', Entry.Id, 'Info'])
        .set({ _trashedAt: Schema.val(Schema.json(Date.now())) })

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

/**** purgeEntry — permanently delete entry from trash ****/

  purgeEntry (Entry:SNS_Entry):void {
    if (this._outerNoteIdOf(Entry.Id) !== TrashId) {
      throw new SNS_Error('purge-not-in-trash', 'only direct children of TrashNote can be purged')
    }
    if (this.#isProtected(Entry.Id)) {
      throw new SNS_Error('purge-protected', 'entry is protected by incoming links and cannot be purged')
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

    const Now = Date.now()
    const View = this.#view()
    const TrashChildren = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set<string>())
    let purgedCount = 0

    for (const InnerEntryId of TrashChildren) {
      // Check that this entry is a direct inner entry of TrashNote
      const InnerEntryData = View.Entries[InnerEntryId]
      if (InnerEntryData == null) {
        continue
      }
      const outerNoteId = (InnerEntryData as any).outerPlacement?.outerNoteId
      if (outerNoteId !== TrashId) {
        continue
      }

      // Check if the entry has a _trashedAt timestamp and if it's expired
      const trashedAt = (InnerEntryData as any).Info?._trashedAt
      if (typeof trashedAt === 'number' && ! (Now-trashedAt<TTL)) {
        try {
          this.purgeEntry(this.#wrap(InnerEntryId) as SNS_Entry)
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

  transact<T> (Callback:() => T):T {
    const isRootTxn = this.#TxnDepth === 0
    this.#TxnDepth++

    let Result: T

    try {
      Result = Callback()
    } finally {
      this.#TxnDepth--
      if (isRootTxn) {
        const Patch_ = this.#Model.api.flush()
        if (! this.#ApplyingExternal) {
          try {
            const Binary = Patch_.toBinary()
            if (Binary.byteLength > 0) {
              this.#LocalPatches.push(Binary)
            }
          } catch {
            // ignore
          }
        }
        const ChangeSet = this.#PendingChangeSet
        const Origin: ChangeOrigin = this.#ApplyingExternal ? 'external' : 'internal'
        this.#PendingChangeSet = {}
        this.#notifyHandlers(Origin, ChangeSet)
      }
    }

    return Result as any
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
    this.#ApplyingExternal = true
    try {
      this.transact(() => {
        // If it's a Uint8Array, it could be encoded patches or a single patch binary
        if (Patch_ instanceof Uint8Array) {
          // Try to decode as multiple patches first
          try {
            const PatchBinaries = this.#decodePatchArray(Patch_)
            for (const Binary of PatchBinaries) {
              const ConvertedPatch = Patch.fromBinary(Binary)
              this.#Model.applyPatch(ConvertedPatch)
            }
          } catch {
            // If decoding fails, treat as a single patch binary
            const ConvertedPatch = Patch.fromBinary(Patch_)
            this.#Model.applyPatch(ConvertedPatch)
          }
        } else {
          this.#Model.applyPatch(Patch_)
        }
        this.#updateIndicesFromView()
      })
    } finally {
      this.#ApplyingExternal = false
    }
    this.recoverOrphans()
  }

/**** currentCursor — get current sync position ****/

  get currentCursor ():SNS_SyncCursor {
    return this.#encodeUint32(this.#LocalPatches.length)
  }

/**** exportPatch — export patches since given cursor ****/

  exportPatch (Origin?:SNS_SyncCursor):Uint8Array {
    const StartIndex = Origin != null ? this.#decodeUint32(Origin) : 0
    const PatchesToExport = this.#LocalPatches.slice(StartIndex)
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
    const Result: Uint8Array[] = []
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
      // Move orphaned entries to LostAndFound
      const allEntries = this.#view().Entries
      for (const [EntryId, EntryData] of Object.entries(allEntries)) {
        const outerNoteId = (EntryData as any).outerPlacement?.outerNoteId
        if (
          outerNoteId &&
          outerNoteId !== RootId &&
          outerNoteId !== TrashId &&
          outerNoteId !== LostAndFoundId &&
          ! allEntries[outerNoteId]
        ) {
          // this entry's outer note no longer exists
          const OrderKey = this.#lastOrderKeyOf(LostAndFoundId)
          const newOrderKey = generateKeyBetween(OrderKey, null)
          this.#Model.api
            .obj(['Entries', EntryId, 'outerPlacement'])
            .set(Schema.val(Schema.con({
              outerNoteId: LostAndFoundId,
              OrderKey: newOrderKey
            })))
          this.#removeFromReverseIndex(outerNoteId, EntryId)
          this.#addToReverseIndex(LostAndFoundId, EntryId)
          this.#recordChange(outerNoteId, 'innerEntryList')
          this.#recordChange(LostAndFoundId, 'innerEntryList')
          this.#recordChange(EntryId, 'outerNote')
        }
      }
    })
  }

/**** asBinary — serialize store to gzipped binary ****/

  asBinary ():Uint8Array {
    return gzipSync(this.#Model.toBinary())
  }

/**** asJSON — serialize store to base64-encoded binary ****/

  asJSON ():string {
    const Bytes = this.asBinary()
    const NodeBuffer = (globalThis as any).Buffer
    if (NodeBuffer != null) { return NodeBuffer.from(Bytes).toString('base64') }
    let Binary = ''
    for (let i = 0; i < Bytes.byteLength; i++) { Binary += String.fromCharCode(Bytes[i]) }
    return btoa(Binary)
  }

//----------------------------------------------------------------------------//
//                               Proxies                                      //
//----------------------------------------------------------------------------//

/**** get — proxy handler for property access ****/

  get (target:any, property:string | symbol):any {
    if (property === 'Entries') {
      return new Proxy(this.#view().Entries, {
        get: (entriesTarget:any, entryId:any) => {
          return this.#wrap(entryId as string)
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
              value: this.#wrap(String(prop))
            }
          }
          return undefined
        }
      })
    }
    return this.#view()[property as string]
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
//              Internal helpers — called by SNS_Entry / Note / Link           //
//----------------------------------------------------------------------------//

/**** _KindOf — get entry kind (note or link) ****/

  _KindOf (Id:string):'note' | 'link' {
    const EntryData = this.#view().Entries[Id]
    if (EntryData == null) {
      throw new SNS_Error('not-found', `entry '${Id}' not found`)
    }
    return (EntryData as any).Kind as 'note' | 'link'
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
    StringSchema.parse(Value)
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
    MIMETypeSchema.parse(Value)
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

/**** _isLiteralOf — check if entry value is literal text ****/

  _isLiteralOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'literal' || Kind === 'literal-reference'
  }

/**** _isBinaryOf — check if entry value is binary ****/

  _isBinaryOf (Id:string):boolean {
    const Kind = this._ValueKindOf(Id)
    return Kind === 'binary' || Kind === 'binary-reference'
  }

/**** _readValueOf — read entry value ****/

  async _readValueOf (Id:string):Promise<string | Uint8Array | undefined> {
    const Kind = this._ValueKindOf(Id)
    switch (true) {
      case Kind === 'none':
        return undefined
      case Kind === 'literal': {
        const EntryData = this.#view().Entries[Id]
        const LiteralVal = (EntryData as any)?.literalValue
        return String(LiteralVal ?? '')
      }
      case Kind === 'binary': {
        const EntryData = this.#view().Entries[Id]
        return (EntryData as any)?.binaryValue as Uint8Array | undefined
      }
      default:
        throw new SNS_Error('not-implemented', 'large value fetching requires a ValueStore')
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
        case Value == null: {
          this.#Model.api.obj(['Entries', Id]).set({ ValueKind: Schema.val(Schema.str('none')) })
          break
        }
        case typeof Value === 'string' && (Value as string).length <= this.#LiteralSizeLimit: {
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('literal')),
            literalValue: Value as string
          })
          break
        }
        case typeof Value === 'string': {
          const Encoder = new TextEncoder()
          const Bytes = Encoder.encode(Value as string)
          const Hash = `sha256-size-${Bytes.byteLength}`
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('literal-reference')),
            ValueRef: { Hash, Size: Bytes.byteLength }
          })
          break
        }
        case (Value as Uint8Array).byteLength <= DefaultBinarySizeLimit: {
          this.#Model.api.obj(['Entries', Id]).set({
            ValueKind: Schema.val(Schema.str('binary')),
            binaryValue: Value as Uint8Array
          })
          break
        }
        default: {
          const Bytes = Value as Uint8Array
          const Hash = `sha256-size-${Bytes.byteLength}`
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
      throw new SNS_Error('change-value-not-literal', 'changeValue only works on notes with ValueKind literal')
    }
    this.transact(() => {
      const currentValue = String((this.#view().Entries[Id] as any)?.literalValue ?? '')
      const newValue = currentValue.slice(0, Index)+Insertion+currentValue.slice(Index+DeleteCount)
      this._writeValueOf(Id, newValue)
    })
  }

/**** _innerEntriesOf — get sorted inner entries ****/

  _innerEntriesOf (Id:string):SNS_Entry[] {
    return this.#sortedInnerEntriesOf(Id).map(entry => this.#wrap(entry.Id)) as SNS_Entry[]
  }

/**** _outerNoteOf — get outer note ****/

  _outerNoteOf (Id:string):SNS_Note | undefined {
    const outerNoteId = this._outerNoteIdOf(Id)
    return outerNoteId ? (this.#wrap(outerNoteId) as SNS_Note) : undefined
  }

/**** _outerNoteIdOf — get outer note id ****/

  _outerNoteIdOf (Id:string):string | null {
    const EntryData = this.#view().Entries[Id]
    const outerNoteId = (EntryData as any)?.outerPlacement?.outerNoteId
    return outerNoteId ?? null
  }

/**** _outerNotesOf — get ancestor note chain ****/

  _outerNotesOf (Id:string):SNS_Note[] {
    const Result: SNS_Note[] = []
    let currentId: string | null = this._outerNoteIdOf(Id)
    while (currentId != null) {
      Result.push(this.#wrap(currentId) as SNS_Note)
      currentId = this._outerNoteIdOf(currentId)
    }
    return Result
  }

/**** _outerNoteIdsOf — get ancestor note id chain ****/

  _outerNoteIdsOf (Id:string):string[] {
    const Result: string[] = []
    let currentId: string | null = this._outerNoteIdOf(Id)
    while (currentId != null) {
      Result.push(currentId)
      currentId = this._outerNoteIdOf(currentId)
    }
    return Result
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
        Store.transact(() => {
          Store.#Model.api.obj(['Entries', Id, 'Info']).set({ [Key]: Value })
          Store.#recordChange(Id, `Info.${Key}`)
        })
        return true
      },
      deleteProperty (_target:any, Key:any) {
        if (typeof Key !== 'string') {return false}
        Store.transact(() => {
          Store.#Model.api.obj(['Entries', Id, 'Info']).del([Key])
          Store.#recordChange(Id, `Info.${Key}`)
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

/**** _TargetOf — get link target note ****/

  _TargetOf (Id:string):SNS_Note | undefined {
    const EntryData = this.#view().Entries[Id]
    const TargetId = (EntryData as any)?.TargetId
    return TargetId ? (this.#wrap(TargetId) as SNS_Note) : undefined
  }

/**** _EntryAsJSON — serialize entry to JSON ****/

  _EntryAsJSON (Id:string):any {
    const EntryData = this.#view().Entries[Id]
    if (EntryData == null) {
      throw new SNS_Error('not-found', `entry '${Id}' not found`)
    }
    return {
      Id,
      Kind: (EntryData as any).Kind,
      Label: (EntryData as any).Label,
      Info: (EntryData as any).Info,
      ...(((EntryData as any).Kind === 'note') && {
        Type: this._TypeOf(Id),
        ValueKind: this._ValueKindOf(Id),
        literalValue: (EntryData as any).literalValue,
        binaryValue: (EntryData as any).binaryValue,
        ValueRef: (EntryData as any).ValueRef
      }),
      ...(((EntryData as any).Kind === 'link') && {
        TargetId: (EntryData as any).TargetId
      }),
      innerEntries: this._innerEntriesOf(Id).map(e => e.asJSON())
    }
  }

/**** _mayMoveEntryTo — check if move is valid ****/

  _mayMoveEntryTo (EntryId:string, outerNoteId:string, Index?:number):boolean {
    // RootNote cannot be moved
    if (EntryId === RootId) {
      return false
    }
    // TrashNote and LostAndFoundNote can only be moved to RootNote
    if ((EntryId === TrashId || EntryId === LostAndFoundId) && outerNoteId !== RootId) {
      return false
    }
    // Check if the move would create a cycle
    if (this.#wouldCreateCycle(EntryId, outerNoteId)) {
      return false
    }
    return true
  }

/**** _mayDeleteEntry — check if entry can be deleted ****/

  _mayDeleteEntry (EntryId:string):boolean {
    // Root note, trash note, and lost-and-found note cannot be deleted
    if (EntryId === RootId || EntryId === TrashId || EntryId === LostAndFoundId) {
      return false
    }
    return true
  }

//----------------------------------------------------------------------------//
//                             Private Helpers                                //
//----------------------------------------------------------------------------//

/**** #view — get current model state view ****/

  #view ():any {
    return this.#Model.api.view()
  }

/**** #wrap — wrap raw entry data in SNS_Entry object ****/

  #wrap (Id:string):SNS_Entry | null {
    const View = this.#view()
    const EntryData = View.Entries[Id]
    if (EntryData == null) {
      return null
    }

    const Kind = (EntryData as any).Kind
    if (Kind === 'note') {
      return this.#wrapNote(Id)
    } else if (Kind === 'link') {
      return this.#wrapLink(Id)
    }
    return null
  }

/**** #wrapNote — wrap raw note data in SNS_Note object ****/

  #wrapNote (Id:string):SNS_Note {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SNS_Note) {
      return Cached
    }
    const Note = new SNS_Note(this, Id)
    this.#cacheWrapper(Id, Note)
    return Note
  }

/**** #wrapLink — wrap raw link data in SNS_Link object ****/

  #wrapLink (Id:string):SNS_Link {
    const Cached = this.#WrapperCache.get(Id)
    if (Cached instanceof SNS_Link) {
      return Cached
    }
    const Link = new SNS_Link(this, Id)
    this.#cacheWrapper(Id, Link)
    return Link
  }

/**** #cacheWrapper — add wrapper to LRU cache ****/

  #cacheWrapper (Id:string, Wrapper:SNS_Entry):void {
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
      const outerNoteId = (EntryData as any).outerPlacement?.outerNoteId
      if (outerNoteId) {
        this.#addToReverseIndex(outerNoteId, EntryId)
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

      const NewOuterNoteId = (EntryData as any).outerPlacement?.outerNoteId
      const oldOuterNoteId = this.#ForwardIndex.get(EntryId)

      if (NewOuterNoteId !== oldOuterNoteId) {
        if (oldOuterNoteId != null) {
          this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
          this.#recordChange(oldOuterNoteId, 'innerEntryList')
        }
        if (NewOuterNoteId != null) {
          this.#addToReverseIndex(NewOuterNoteId, EntryId)
          this.#recordChange(NewOuterNoteId, 'innerEntryList')
        }
        this.#recordChange(EntryId, 'outerNote')
      }

      if ((EntryData as any).Kind === 'link') {
        const NewTargetId = (EntryData as any).TargetId
        const OldTargetId = this.#LinkForwardIndex.get(EntryId)
        if (NewTargetId !== OldTargetId) {
          if (OldTargetId != null) {
            this.#removeFromLinkTargetIndex(OldTargetId, EntryId)
          }
          if (NewTargetId != null) {
            this.#addToLinkTargetIndex(NewTargetId, EntryId)
          }
        }
      } else if (this.#LinkForwardIndex.has(EntryId)) {
        this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId)!, EntryId)
      }

      this.#recordChange(EntryId, 'Label')
    }

    const deletedEntries = Array.from(this.#ForwardIndex.entries()).filter(([Id]) => ! SeenIds.has(Id))
    for (const [EntryId, oldOuterNoteId] of deletedEntries) {
      this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
      this.#recordChange(oldOuterNoteId, 'innerEntryList')
    }

    const deletedLinks = Array.from(this.#LinkForwardIndex.entries()).filter(([Id]) => ! SeenIds.has(Id))
    for (const [LinkId, OldTargetId] of deletedLinks) {
      this.#removeFromLinkTargetIndex(OldTargetId, LinkId)
    }
  }

/**** #addToReverseIndex — add entry to outer-note index ****/

  #addToReverseIndex (outerNoteId:string, EntryId:string):void {
    let innerIds = this.#ReverseIndex.get(outerNoteId)
    if (innerIds == null) {
      innerIds = new Set()
      this.#ReverseIndex.set(outerNoteId, innerIds)
    }
    innerIds.add(EntryId)
    this.#ForwardIndex.set(EntryId, outerNoteId)
  }

/**** #removeFromReverseIndex — remove entry from outer-note index ****/

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

/**** #orderKeyAt — generate order key for insertion position ****/

  #orderKeyAt (outerNoteId:string, InsertionIndex?:number):string {
    const innerEntries = this.#sortedInnerEntriesOf(outerNoteId)
    if (innerEntries.length === 0 || InsertionIndex == null) {
      const LastKey = innerEntries.length>0 ? innerEntries[innerEntries.length-1].OrderKey : null
      return generateKeyBetween(LastKey, null)
    }
    const ClampedIndex = Math.max(0, Math.min(InsertionIndex, innerEntries.length))
    const Before = ClampedIndex>0 ? innerEntries[ClampedIndex-1].OrderKey : null
    const After = ClampedIndex<innerEntries.length ? innerEntries[ClampedIndex].OrderKey : null
    return generateKeyBetween(Before, After)
  }

/**** #lastOrderKeyOf — get order key of last inner entry ****/

  #lastOrderKeyOf (NoteId:string):string | null {
    const innerEntries = this.#sortedInnerEntriesOf(NoteId)
    return innerEntries.length>0 ? innerEntries[innerEntries.length-1].OrderKey : null
  }

/**** #sortedInnerEntriesOf — get sorted inner entries ****/

  #sortedInnerEntriesOf (NoteId:string):Array<{ Id: string; OrderKey: string }> {
    const innerIds = this.#ReverseIndex.get(NoteId) ?? new Set<string>()
    const Result: Array<{ Id: string; OrderKey: string }> = []
    const Entries = this.#view().Entries
    for (const innerEntryId of innerIds) {
      const EntryData = Entries[innerEntryId]
      const innerOuterNoteId = (EntryData as any).outerPlacement?.outerNoteId
      if (innerOuterNoteId === NoteId) {
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
        if (this.#subtreeHasIncomingLinks(DirectChild, RootReachable, Protected)) {
          Protected.add(DirectChild)
          Changed = true
        }
      }
    }
    return Protected.has(TrashBranchId)
  }

/**** #subtreeHasIncomingLinks — check for incoming links to subtree ****/

  #subtreeHasIncomingLinks (
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

/**** #directTrashInnerEntryContaining — find direct inner entry of TrashNote containing entry ****/

  #directTrashInnerEntryContaining (EntryId:string):string | null {
    let currentId: string | undefined = EntryId
    while (currentId != null) {
      const Outer = this._outerNoteIdOf(currentId)
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
    const oldOuterNoteId = (EntryData as any).outerPlacement?.outerNoteId

    const RootReachable = this.#reachableFromRoot()
    const Protected = new Set<string>()

    const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set<string>())
    for (const innerEntryId of innerEntries) {
      if (this.#subtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
        // Inner rescue: move to TrashNote top level
        const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null)
        this.#Model.api.obj(['Entries', innerEntryId, 'outerPlacement']).set({
          outerNoteId: TrashId,
          OrderKey: OrderKey
        })
        this.#removeFromReverseIndex(EntryId, innerEntryId)
        this.#addToReverseIndex(TrashId, innerEntryId)
        this.#recordChange(TrashId, 'innerEntryList')
        this.#recordChange(innerEntryId, 'outerNote')
      } else {
        this.#purgeSubtree(innerEntryId)
      }
    }

    // Delete the entry itself
    this.#Model.api.obj(['Entries']).del([EntryId])

    if (oldOuterNoteId) {
      this.#removeFromReverseIndex(oldOuterNoteId, EntryId)
      this.#recordChange(oldOuterNoteId, 'innerEntryList')
    }

    if (Kind === 'link') {
      const TargetId = (EntryData as any).TargetId
      if (TargetId) {
        this.#removeFromLinkTargetIndex(TargetId, EntryId)
      }
    }

    this.#WrapperCache.delete(EntryId)
  }

/**** #requireNoteExists — throw if note doesn't exist ****/

  #requireNoteExists (NoteId:string):void {
    const View = this.#view()
    const EntryData = View.Entries[NoteId]
    if (EntryData == null || (EntryData as any).Kind !== 'note') {
      throw new SNS_Error('invalid-argument', `note '${NoteId}' does not exist`)
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
    if (this.#PendingChangeSet[EntryId] == null) {
      this.#PendingChangeSet[EntryId] = new Set()
    }
    ;(this.#PendingChangeSet[EntryId] as Set<string>).add(Property)
  }

/**** #notifyHandlers — invoke change listeners ****/

  #notifyHandlers (Origin:ChangeOrigin, ChangeSet:SNS_ChangeSet):void {
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

/**** #wouldCreateCycle — check if move would create an outer-note cycle ****/

  #wouldCreateCycle (EntryId:string, TargetId:string):boolean {
    let currentId: string | null = TargetId
    while (currentId != null) {
      if (currentId === EntryId) {
        return true
      }
      currentId = this._outerNoteIdOf(currentId)
    }
    return false
  }

}

export default SNS_NoteStore
