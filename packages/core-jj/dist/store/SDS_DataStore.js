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
import { Model } from 'json-joy/lib/json-crdt/index.js';
import { s as Schema } from 'json-joy/lib/json-crdt-patch/schema.js';
import { Patch } from 'json-joy/lib/json-crdt-patch/index.js';
import { gzipSync, gunzipSync } from 'fflate';
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';
import { z } from 'zod';
import { SDS_Error, SDS_Item, SDS_Link, SDS_DataStore as SDS_StoreBase, maxOrderKeyLength, expectValidLabel, expectValidMIMEType, expectValidInfoKey, checkInfoValueSize, _base64ToUint8Array, RootId, TrashId, LostAndFoundId, DefaultMIMEType, DefaultLiteralSizeLimit, DefaultBinarySizeLimit, DefaultWrapperCacheSize, } from '@rozek/sds-core';
import { CanonicalEmptySnapshot } from './canonical-empty-snapshot.js';
//----------------------------------------------------------------------------//
//                           Module-level Helpers                             //
//----------------------------------------------------------------------------//
/**** _createEntry — recursively populate a json-joy model from a JSON subtree ****/
// used by SDS_DataStore.fromJSON() only; does NOT update in-memory indices
// (the constructor calls #rebuildIndices() after fromJSON populates the model)
function _createEntry(JSON_, outerItemId, OrderKey, Model_) {
    const Id = JSON_.Id;
    const InfoObj = {};
    for (const Key of Object.keys(JSON_.Info)) {
        InfoObj[Key] = Schema.con(JSON_.Info[Key]);
    }
    if (JSON_.Kind === 'link') {
        Model_.api.obj(['Entries']).set({ [Id]: Schema.obj({
                Kind: Schema.con('link'),
                outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
                Label: Schema.val(Schema.str(JSON_.Label)),
                Info: Schema.obj(InfoObj),
                TargetId: Schema.con(JSON_.TargetId),
            }) });
        return;
    }
    const storedType = JSON_.Type === DefaultMIMEType ? '' : JSON_.Type;
    const EntryObj = {
        Kind: Schema.con('item'),
        outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
        Label: Schema.val(Schema.str(JSON_.Label)),
        Info: Schema.obj(InfoObj),
        MIMEType: Schema.val(Schema.str(storedType)),
        ValueKind: Schema.val(Schema.str(JSON_.ValueKind)),
    };
    switch (true) {
        case (JSON_.ValueKind === 'literal' && JSON_.Value != null):
            EntryObj.literalValue = Schema.val(Schema.str(JSON_.Value));
            break;
        case (JSON_.ValueKind === 'binary' && JSON_.Value != null):
            EntryObj.binaryValue = Schema.con(_base64ToUint8Array(JSON_.Value));
            break;
    }
    Model_.api.obj(['Entries']).set({ [Id]: Schema.obj(EntryObj) });
    if (JSON_.innerEntries.length > 0) {
        const OrderKeys = generateNKeysBetween(null, null, JSON_.innerEntries.length);
        for (let i = 0; i < JSON_.innerEntries.length; i++) {
            _createEntry(JSON_.innerEntries[i], Id, OrderKeys[i], Model_);
        }
    }
}
//----------------------------------------------------------------------------//
//                          Zod Validation Schemas                            //
//----------------------------------------------------------------------------//
const optIndexSchema = z.number().int().nonnegative().optional();
function parseInsertionIndex(Value) {
    const Result = optIndexSchema.safeParse(Value);
    if (!Result.success) {
        throw new SDS_Error('invalid-argument', Result.error.issues[0]?.message ?? 'InsertionIndex must be a non-negative integer');
    }
}
//----------------------------------------------------------------------------//
//                                SDS_DataStore                               //
//----------------------------------------------------------------------------//
export class SDS_DataStore extends SDS_StoreBase {
    /**** private state ****/
    #Model;
    #LiteralSizeLimit;
    #TrashTTLms;
    #TrashCheckTimer = null;
    #Handlers = new Set();
    // reverse index: outerItemId → Set<entryId>
    #ReverseIndex = new Map();
    // forward index: entryId → outerItemId (kept in sync with #ReverseIndex)
    #ForwardIndex = new Map();
    // incoming link index: targetId → Set<linkId>
    #LinkTargetIndex = new Map();
    // link forward index: linkId → targetId (kept in sync with #LinkTargetIndex)
    #LinkForwardIndex = new Map();
    // LRU wrapper cache
    #WrapperCache = new Map();
    #MaxCacheSize = DefaultWrapperCacheSize;
    // transaction nesting
    #TransactionDepth = 0;
    // ChangeSet accumulator inside a transaction
    #pendingChangeSet = {};
    // patch log for exportPatch() — only locally generated patches (as binaries)
    #localPatches = [];
    // suppress index updates / change tracking when applying remote patches
    #applyingExternal = false;
    //----------------------------------------------------------------------------//
    //                                Construction                                //
    //----------------------------------------------------------------------------//
    /**** constructor — initialize store with model and configuration ****/
    constructor(Model_, Options) {
        super();
        this.#Model = Model_;
        this.#LiteralSizeLimit = Options?.LiteralSizeLimit ?? DefaultLiteralSizeLimit;
        this.#TrashTTLms = Options?.TrashTTLms ?? 2_592_000_000;
        this.#rebuildIndices();
        const CheckInterval = Options?.TrashCheckIntervalMs ??
            Math.min(Math.floor(this.#TrashTTLms / 4), 3600000);
        this.#TrashCheckTimer = setInterval(() => {
            this.purgeExpiredTrashEntries();
        }, CheckInterval);
        // let Node.js exit even while the timer is pending
        if (typeof this.#TrashCheckTimer.unref === 'function') {
            this.#TrashCheckTimer.unref();
        }
    }
    /**** fromScratch — create store from canonical empty snapshot ****/
    static fromScratch(Options) {
        return this.fromBinary(CanonicalEmptySnapshot, Options);
    }
    /**** fromBinary — deserialize store from binary snapshot ****/
    static fromBinary(Serialisation, Options) {
        const decompressedSerialisation = gunzipSync(Serialisation);
        const restoredStore = Model.fromBinary(decompressedSerialisation);
        return new SDS_DataStore(restoredStore, Options);
    }
    /**** fromJSON — deserialize store from a plain JSON object or JSON string ****/
    static fromJSON(Serialisation, Options) {
        const serialisedJSON = (typeof Serialisation === 'string'
            ? JSON.parse(Serialisation)
            : Serialisation);
        const restoredStore = Model.fromBinary(gunzipSync(CanonicalEmptySnapshot));
        _createEntry(serialisedJSON, '', '', restoredStore);
        restoredStore.api.flush();
        return new SDS_DataStore(restoredStore, Options);
    }
    //----------------------------------------------------------------------------//
    //                             Public Accessors                               //
    //----------------------------------------------------------------------------//
    /**** RootItem / TrashItem / LostAndFoundItem — access special items ****/
    get RootItem() {
        return this.#wrapped(RootId);
    }
    get TrashItem() {
        return this.#wrapped(TrashId);
    }
    get LostAndFoundItem() {
        return this.#wrapped(LostAndFoundId);
    }
    /**** EntryWithId — retrieve entry by id ****/
    EntryWithId(Id) {
        const EntryData = this.#view().Entries[Id];
        if (EntryData != null) {
            return this.#wrapped(Id);
        }
        return undefined;
    }
    //----------------------------------------------------------------------------//
    //                             Public Mutators                                //
    //----------------------------------------------------------------------------//
    /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
    newItemAt(MIMEType, outerItem, InsertionIndex) {
        if (outerItem == null)
            throw new SDS_Error('invalid-argument', 'outerItem must not be missing');
        const MIMEType_ = MIMEType ?? DefaultMIMEType;
        expectValidMIMEType(MIMEType_);
        parseInsertionIndex(InsertionIndex);
        const DataId = crypto.randomUUID();
        this.transact(() => {
            const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex);
            const storedType = MIMEType_ === DefaultMIMEType ? '' : MIMEType_;
            const EntryData = Schema.obj({
                Kind: Schema.con('item'),
                outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey })),
                Label: Schema.val(Schema.str('')),
                Info: Schema.obj({}),
                MIMEType: Schema.val(Schema.str(storedType)),
                ValueKind: Schema.val(Schema.str('none'))
            });
            this.#Model.api
                .obj(['Entries'])
                .set({ [DataId]: EntryData });
            this.#addToReverseIndex(outerItem.Id, DataId);
            this.#recordChange(outerItem.Id, 'innerEntryList');
            this.#recordChange(DataId, 'outerItem');
        });
        return this.#wrapped(DataId);
    }
    /**** newLinkAt — create new link in specified location ****/
    newLinkAt(Target, outerItem, InsertionIndex) {
        if (Target == null)
            throw new SDS_Error('invalid-argument', 'Target must not be missing');
        if (outerItem == null)
            throw new SDS_Error('invalid-argument', 'outerItem must not be missing');
        parseInsertionIndex(InsertionIndex);
        this.#requireItemExists(Target.Id);
        this.#requireItemExists(outerItem.Id);
        const LinkId = crypto.randomUUID();
        this.transact(() => {
            const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex);
            const LinkData = Schema.obj({
                Kind: Schema.con('link'),
                outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey })),
                Label: Schema.val(Schema.str('')),
                Info: Schema.obj({}),
                TargetId: Schema.con(Target.Id)
            });
            this.#Model.api
                .obj(['Entries'])
                .set({ [LinkId]: LinkData });
            this.#addToReverseIndex(outerItem.Id, LinkId);
            this.#addToLinkTargetIndex(Target.Id, LinkId);
            this.#recordChange(outerItem.Id, 'innerEntryList');
            this.#recordChange(LinkId, 'outerItem');
        });
        return this.#wrapped(LinkId);
    }
    /**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/
    deserializeItemInto(Serialisation, outerItem, InsertionIndex) {
        if (outerItem == null)
            throw new SDS_Error('invalid-argument', 'outerItem must not be missing');
        parseInsertionIndex(InsertionIndex);
        const serialisedJSON = (typeof Serialisation === 'string'
            ? JSON.parse(Serialisation)
            : Serialisation);
        if (serialisedJSON == null || serialisedJSON.Kind !== 'item') {
            throw new SDS_Error('invalid-argument', 'Serialisation must be a valid SDS_ItemJSON object');
        }
        const IdMap = new Map();
        this.#collectEntryIds(serialisedJSON, IdMap);
        const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex);
        const RootId_ = IdMap.get(serialisedJSON.Id) ?? serialisedJSON.Id;
        this.transact(() => {
            this.#importEntryFromJSON(serialisedJSON, outerItem.Id, OrderKey, IdMap);
        });
        return this.#wrapped(RootId_);
    }
    /**** deserializeLinkInto — import a serialised link; always assigns a new Id ****/
    deserializeLinkInto(Serialisation, outerItem, InsertionIndex) {
        if (outerItem == null)
            throw new SDS_Error('invalid-argument', 'outerItem must not be missing');
        const serialisedJSON = (typeof Serialisation === 'string'
            ? JSON.parse(Serialisation)
            : Serialisation);
        if (serialisedJSON == null || serialisedJSON.Kind !== 'link') {
            throw new SDS_Error('invalid-argument', 'Serialisation must be a valid SDS_LinkJSON object');
        }
        const LinkId = crypto.randomUUID();
        const OrderKey = this.#OrderKeyAt(outerItem.Id, InsertionIndex);
        const InfoObj = {};
        for (const Key of Object.keys(serialisedJSON.Info ?? {})) {
            InfoObj[Key] = Schema.con(serialisedJSON.Info[Key]);
        }
        const LinkData = Schema.obj({
            Kind: Schema.con('link'),
            outerPlacement: Schema.val(Schema.con({ outerItemId: outerItem.Id, OrderKey })),
            Label: Schema.val(Schema.str(serialisedJSON.Label ?? '')),
            Info: Schema.obj(InfoObj),
            TargetId: Schema.con(serialisedJSON.TargetId),
        });
        this.transact(() => {
            this.#Model.api.obj(['Entries']).set({ [LinkId]: LinkData });
            this.#addToReverseIndex(outerItem.Id, LinkId);
            this.#addToLinkTargetIndex(serialisedJSON.TargetId, LinkId);
            this.#recordChange(outerItem.Id, 'innerEntryList');
            this.#recordChange(LinkId, 'outerItem');
        });
        return this.#wrapped(LinkId);
    }
    /**** moveEntryTo — move entry to new location in tree ****/
    moveEntryTo(Entry, outerItem, Index) {
        optIndexSchema.parse(Index);
        if (!this._mayMoveEntryTo(Entry.Id, outerItem.Id, Index)) {
            throw new SDS_Error('move-would-cycle', 'cannot move an entry into one of its own descendants');
        }
        const oldOuterItemId = this._outerItemIdOf(Entry.Id);
        const OrderKey = this.#OrderKeyAt(outerItem.Id, Index);
        this.transact(() => {
            this.#Model.api
                .val(['Entries', Entry.Id, 'outerPlacement'])
                .set(Schema.con({ outerItemId: outerItem.Id, OrderKey: OrderKey }));
            // if moving out of trash, remove _trashedAt
            if (oldOuterItemId === TrashId && outerItem.Id !== TrashId) {
                const EntryData = this.#view().Entries[Entry.Id];
                const Info = EntryData?.Info;
                if (Info != null && '_trashedAt' in Info) {
                    this.#Model.api.obj(['Entries', Entry.Id, 'Info']).del(['_trashedAt']);
                    this.#recordChange(Entry.Id, 'Info._trashedAt');
                }
            }
            if (oldOuterItemId != null) {
                this.#removeFromReverseIndex(oldOuterItemId, Entry.Id);
                this.#recordChange(oldOuterItemId, 'innerEntryList');
            }
            this.#addToReverseIndex(outerItem.Id, Entry.Id);
            this.#recordChange(outerItem.Id, 'innerEntryList');
            this.#recordChange(Entry.Id, 'outerItem');
        });
    }
    /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
    _rebalanceInnerEntriesOf(outerItemId) {
        const innerEntries = this.#sortedInnerEntriesOf(outerItemId);
        if (innerEntries.length === 0) {
            return;
        }
        const freshKeys = generateNKeysBetween(null, null, innerEntries.length);
        innerEntries.forEach((innerEntry, i) => {
            this.#Model.api
                .val(['Entries', innerEntry.Id, 'outerPlacement'])
                .set(Schema.con({ outerItemId, OrderKey: freshKeys[i] }));
            this.#recordChange(innerEntry.Id, 'outerItem');
        });
    }
    /**** deleteEntry — move entry to trash ****/
    deleteEntry(Entry) {
        if (!this._mayDeleteEntry(Entry.Id)) {
            throw new SDS_Error('delete-not-permitted', 'this entry cannot be deleted');
        }
        const oldOuterItemId = this._outerItemIdOf(Entry.Id);
        const OrderKey = this.#lastOrderKeyOf(TrashId);
        const newOrderKey = generateKeyBetween(OrderKey, null);
        this.transact(() => {
            this.#Model.api
                .val(['Entries', Entry.Id, 'outerPlacement'])
                .set(Schema.con({ outerItemId: TrashId, OrderKey: newOrderKey }));
            this.#ensureInfoExists(Entry.Id);
            this.#Model.api
                .obj(['Entries', Entry.Id, 'Info'])
                .set({ _trashedAt: Schema.val(Schema.json(Date.now())) });
            if (oldOuterItemId != null) {
                this.#removeFromReverseIndex(oldOuterItemId, Entry.Id);
                this.#recordChange(oldOuterItemId, 'innerEntryList');
            }
            this.#addToReverseIndex(TrashId, Entry.Id);
            this.#recordChange(TrashId, 'innerEntryList');
            this.#recordChange(Entry.Id, 'outerItem');
            this.#recordChange(Entry.Id, 'Info._trashedAt');
        });
    }
    /**** purgeEntry — permanently delete entry from trash ****/
    purgeEntry(Entry) {
        if (this._outerItemIdOf(Entry.Id) !== TrashId) {
            throw new SDS_Error('purge-not-in-trash', 'only direct children of TrashItem can be purged');
        }
        if (this.#isProtected(Entry.Id)) {
            throw new SDS_Error('purge-protected', 'entry is protected by incoming links and cannot be purged');
        }
        this.transact(() => {
            this.#purgeSubtree(Entry.Id);
        });
    }
    /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
    purgeExpiredTrashEntries(TrashTTL) {
        const TTL = TrashTTL ?? this.#TrashTTLms;
        if (TTL == null) {
            return 0;
        }
        const now = Date.now();
        const View = this.#view();
        const TrashEntries = Array.from(this.#ReverseIndex.get(TrashId) ?? new Set());
        let purgedCount = 0;
        for (const innerEntryId of TrashEntries) {
            // check that this entry is a direct inner entry of TrashItem
            const innerEntryData = View.Entries[innerEntryId];
            if (innerEntryData == null) {
                continue;
            }
            const outerItemId = innerEntryData.outerPlacement?.outerItemId;
            if (outerItemId !== TrashId) {
                continue;
            }
            // check if the entry has a _trashedAt timestamp and if it's expired
            const trashedAt = innerEntryData.Info?._trashedAt;
            if (typeof trashedAt === 'number' && !(now - trashedAt < TTL)) {
                try {
                    this.purgeEntry(this.#wrapped(innerEntryId));
                    purgedCount++;
                }
                catch {
                    // silently skip protected entries
                }
            }
        }
        return purgedCount;
    }
    /**** dispose — clean up resources ****/
    dispose() {
        if (this.#TrashCheckTimer != null) {
            clearInterval(this.#TrashCheckTimer);
            this.#TrashCheckTimer = null;
        }
        this.#Handlers.clear();
    }
    //----------------------------------------------------------------------------//
    //                             Change Tracking                                //
    //----------------------------------------------------------------------------//
    /**** transact — execute callback within transaction ****/
    transact(Callback) {
        const isRootTransaction = this.#TransactionDepth === 0;
        this.#TransactionDepth++;
        try {
            Callback();
        }
        finally {
            this.#TransactionDepth--;
            if (isRootTransaction) {
                const Patch_ = this.#Model.api.flush();
                if (!this.#applyingExternal) {
                    try {
                        const binaryPatch = Patch_.toBinary();
                        if (binaryPatch.byteLength > 0) {
                            this.#localPatches.push(binaryPatch);
                        }
                    }
                    catch {
                        // ignore
                    }
                }
                const ChangeSet = this.#pendingChangeSet;
                const Origin = this.#applyingExternal ? 'external' : 'internal';
                this.#pendingChangeSet = {};
                this.#notifyHandlers(Origin, ChangeSet);
            }
        }
    }
    /**** onChangeInvoke — register change listener ****/
    onChangeInvoke(Handler) {
        this.#Handlers.add(Handler);
        return () => {
            this.#Handlers.delete(Handler);
        };
    }
    /**** applyRemotePatch — apply external patch to model ****/
    applyRemotePatch(Patch_) {
        this.#applyingExternal = true;
        try {
            this.transact(() => {
                if (Patch_ instanceof Uint8Array) {
                    // Decode the patch array; fall back to treating the whole binary as a
                    // single patch when the array header is absent.
                    let PatchBinaries;
                    try {
                        PatchBinaries = this.#decodePatchArray(Patch_);
                    }
                    catch {
                        PatchBinaries = [Patch_];
                    }
                    for (const Binary of PatchBinaries) {
                        const ConvertedPatch = Patch.fromBinary(Binary);
                        try {
                            this.#Model.applyPatch(ConvertedPatch);
                        }
                        catch {
                            // json-joy's _gcTree has a bug: ObjNode.children() can pass
                            // undefined to its callback when a concurrent peer operation
                            // caused a child node to be GCed before the current traversal
                            // reaches it.  Crucially, the CRDT state update (key deletion /
                            // value replacement in the ObjNode's keys map) completes *before*
                            // _gcTree is invoked, so the model view is already consistent
                            // when the exception fires.  We suppress the error and let
                            // #updateIndicesFromView() + recoverOrphans() reconcile the
                            // in-memory indices with the (correct) model view.
                        }
                    }
                }
                else {
                    this.#Model.applyPatch(Patch_);
                }
                this.#updateIndicesFromView();
            });
        }
        finally {
            this.#applyingExternal = false;
        }
        this.recoverOrphans();
    }
    /**** currentCursor — get current sync position ****/
    get currentCursor() {
        return this.#encodeUint32(this.#localPatches.length);
    }
    /**** exportPatch — export patches since given cursor ****/
    exportPatch(Origin) {
        const StartIndex = Origin != null ? this.#decodeUint32(Origin) : 0;
        const PatchesToExport = this.#localPatches.slice(StartIndex);
        return this.#encodePatchArray(PatchesToExport);
    }
    /**** #encodeUint32 — encode 32-bit integer as bytes ****/
    #encodeUint32(Value) {
        const Buffer = new Uint8Array(4);
        return new DataView(Buffer.buffer).setUint32(0, Value >>> 0, false), Buffer;
    }
    /**** #decodeUint32 — decode 32-bit integer from bytes ****/
    #decodeUint32(Data) {
        return Data.byteLength < 4 ? 0 : new DataView(Data.buffer, Data.byteOffset, 4).getUint32(0, false);
    }
    /**** #encodePatchArray — encode array of patches ****/
    #encodePatchArray(Patches) {
        const TotalSize = 4 + Patches.reduce((acc, binary) => acc + 4 + binary.byteLength, 0);
        const Result = new Uint8Array(TotalSize);
        const View = new DataView(Result.buffer);
        View.setUint32(0, Patches.length, false);
        let Offset = 4;
        for (const Binary of Patches) {
            View.setUint32(Offset, Binary.byteLength, false);
            Offset += 4;
            Result.set(Binary, Offset);
            Offset += Binary.byteLength;
        }
        return Result;
    }
    /**** #decodePatchArray — decode array of patches ****/
    #decodePatchArray(Data) {
        const View = new DataView(Data.buffer, Data.byteOffset, Data.byteLength);
        const Count = View.getUint32(0, false);
        const Result = [];
        let Offset = 4;
        for (let i = 0; i < Count; i++) {
            const Size = View.getUint32(Offset, false);
            Offset += 4;
            Result.push(Data.slice(Offset, Offset + Size));
            Offset += Size;
        }
        return Result;
    }
    /**** recoverOrphans — move orphaned entries to LostAndFound ****/
    recoverOrphans() {
        this.transact(() => {
            // move orphaned entries to LostAndFound
            const allEntries = this.#view().Entries;
            for (const [EntryId, EntryData] of Object.entries(allEntries)) {
                const outerItemId = EntryData.outerPlacement?.outerItemId;
                if (outerItemId &&
                    outerItemId !== RootId &&
                    outerItemId !== TrashId &&
                    outerItemId !== LostAndFoundId &&
                    !allEntries[outerItemId]) {
                    // this entry's outer data no longer exists
                    const OrderKey = this.#lastOrderKeyOf(LostAndFoundId);
                    const newOrderKey = generateKeyBetween(OrderKey, null);
                    this.#Model.api
                        .obj(['Entries', EntryId, 'outerPlacement'])
                        .set(Schema.val(Schema.con({
                        outerItemId: LostAndFoundId,
                        OrderKey: newOrderKey
                    })));
                    this.#removeFromReverseIndex(outerItemId, EntryId);
                    this.#addToReverseIndex(LostAndFoundId, EntryId);
                    this.#recordChange(outerItemId, 'innerEntryList');
                    this.#recordChange(LostAndFoundId, 'innerEntryList');
                    this.#recordChange(EntryId, 'outerItem');
                }
            }
        });
    }
    /**** asBinary — serialize store to gzipped binary ****/
    asBinary() {
        return gzipSync(this.#Model.toBinary());
    }
    /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
    newEntryFromBinaryAt(Serialisation, outerItem, InsertionIndex) {
        const JSONString = new TextDecoder().decode(gunzipSync(Serialisation));
        return this.newEntryFromJSONat(JSON.parse(JSONString), outerItem, InsertionIndex);
    }
    /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
    _EntryAsBinary(Id) {
        const JSONString = JSON.stringify(this._EntryAsJSON(Id));
        return gzipSync(new TextEncoder().encode(JSONString));
    }
    //----------------------------------------------------------------------------//
    //                               Proxies                                      //
    //----------------------------------------------------------------------------//
    /**** get — proxy handler for property access ****/
    get(Target, Property) {
        if (Property === 'Entries') {
            return new Proxy(this.#view().Entries, {
                get: (entriesTarget, entryId) => {
                    return this.#wrapped(entryId);
                },
                set: () => false,
                deleteProperty: () => false,
                ownKeys: () => {
                    return Object.keys(this.#view().Entries);
                },
                getOwnPropertyDescriptor: (_, prop) => {
                    if (Object.keys(this.#view().Entries).includes(String(prop))) {
                        return {
                            configurable: true,
                            enumerable: true,
                            value: this.#wrapped(String(prop))
                        };
                    }
                    return undefined;
                }
            });
        }
        return this.#view()[Property];
    }
    /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
    set() {
        return false;
    }
    deleteProperty() {
        return false;
    }
    ownKeys() {
        return Object.keys(this.#view());
    }
    getOwnPropertyDescriptor() {
        return {
            configurable: true,
            enumerable: true
        };
    }
    //----------------------------------------------------------------------------//
    //              Internal helpers — called by SDS_Entry / Data / Link           //
    //----------------------------------------------------------------------------//
    /**** _KindOf — get entry kind (data or link) ****/
    _KindOf(Id) {
        const EntryData = this.#view().Entries[Id];
        if (EntryData == null) {
            throw new SDS_Error('not-found', `entry '${Id}' not found`);
        }
        return EntryData.Kind;
    }
    /**** _LabelOf — get entry label ****/
    _LabelOf(Id) {
        const EntryData = this.#view().Entries[Id];
        if (EntryData == null) {
            return '';
        }
        return String(EntryData.Label ?? '');
    }
    /**** _setLabelOf — set entry label ****/
    _setLabelOf(Id, Value) {
        expectValidLabel(Value);
        this.transact(() => {
            const EntryData = this.#view().Entries[Id];
            if (EntryData == null) {
                return;
            }
            this.#Model.api.obj(['Entries', Id]).set({ Label: Value });
            this.#recordChange(Id, 'Label');
        });
    }
    /**** _TypeOf — get entry MIME type ****/
    _TypeOf(Id) {
        const EntryData = this.#view().Entries[Id];
        const Stored = EntryData?.MIMEType ?? '';
        return Stored === '' ? DefaultMIMEType : Stored;
    }
    /**** _setTypeOf — set entry MIME type ****/
    _setTypeOf(Id, Value) {
        expectValidMIMEType(Value);
        const storedValue = Value === DefaultMIMEType ? '' : Value;
        this.transact(() => {
            this.#Model.api.obj(['Entries', Id]).set({ MIMEType: storedValue });
            this.#recordChange(Id, 'Type');
        });
    }
    /**** _ValueKindOf — get value storage kind ****/
    _ValueKindOf(Id) {
        const EntryData = this.#view().Entries[Id];
        return (EntryData?.ValueKind ?? 'none');
    }
    /**** _readValueOf — read entry value ****/
    async _readValueOf(Id) {
        const Kind = this._ValueKindOf(Id);
        switch (true) {
            case (Kind === 'none'):
                return undefined;
            case (Kind === 'literal'): {
                const EntryData = this.#view().Entries[Id];
                const LiteralVal = EntryData?.literalValue;
                return String(LiteralVal ?? '');
            }
            case (Kind === 'binary'): {
                const EntryData = this.#view().Entries[Id];
                return EntryData?.binaryValue;
            }
            default: {
                const ref = this._getValueRefOf(Id);
                if (ref == undefined) {
                    return undefined;
                }
                const Blob = await this._getValueBlobAsync(ref.Hash);
                if (Blob == undefined) {
                    return undefined;
                }
                return Kind === 'literal-reference' ? new TextDecoder().decode(Blob) : Blob;
            }
        }
    }
    /**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/
    _currentValueOf(Id) {
        const Kind = this._ValueKindOf(Id);
        switch (true) {
            case (Kind === 'literal'): {
                const EntryData = this.#view().Entries[Id];
                return String(EntryData?.literalValue ?? '');
            }
            case (Kind === 'binary'): {
                const EntryData = this.#view().Entries[Id];
                return EntryData?.binaryValue;
            }
            default: return undefined;
        }
    }
    /**** _writeValueOf — write entry value ****/
    _writeValueOf(Id, Value) {
        this.transact(() => {
            const EntryData = this.#view().Entries[Id];
            if (EntryData == null) {
                return;
            }
            switch (true) {
                case (Value == null): {
                    this.#Model.api.obj(['Entries', Id]).set({ ValueKind: Schema.val(Schema.str('none')) });
                    break;
                }
                case (typeof Value === 'string' && Value.length <= this.#LiteralSizeLimit): {
                    this.#Model.api.obj(['Entries', Id]).set({
                        ValueKind: Schema.val(Schema.str('literal')),
                        literalValue: Value
                    });
                    break;
                }
                case (typeof Value === 'string'): {
                    const Encoder = new TextEncoder();
                    const Bytes = Encoder.encode(Value);
                    const Hash = SDS_DataStore._BLOBhash(Bytes);
                    this._storeValueBlob(Hash, Bytes);
                    this.#Model.api.obj(['Entries', Id]).set({
                        ValueKind: Schema.val(Schema.str('literal-reference')),
                        ValueRef: { Hash, Size: Bytes.byteLength }
                    });
                    break;
                }
                case (Value.byteLength <= DefaultBinarySizeLimit): {
                    this.#Model.api.obj(['Entries', Id]).set({
                        ValueKind: Schema.val(Schema.str('binary')),
                        binaryValue: Value
                    });
                    break;
                }
                default: {
                    const Bytes = Value;
                    const Hash = SDS_DataStore._BLOBhash(Bytes);
                    this._storeValueBlob(Hash, Bytes);
                    this.#Model.api.obj(['Entries', Id]).set({
                        ValueKind: Schema.val(Schema.str('binary-reference')),
                        ValueRef: { Hash, Size: Bytes.byteLength }
                    });
                    break;
                }
            }
            this.#recordChange(Id, 'Value');
        });
    }
    /**** _spliceValueOf — modify literal value in-place ****/
    _spliceValueOf(Id, Index, DeleteCount, Insertion) {
        const Kind = this._ValueKindOf(Id);
        if (Kind !== 'literal') {
            throw new SDS_Error('change-value-not-literal', 'changeValue only works on items with ValueKind literal');
        }
        this.transact(() => {
            const currentValue = String(this.#view().Entries[Id]?.literalValue ?? '');
            const newValue = currentValue.slice(0, Index) + Insertion + currentValue.slice(Index + DeleteCount);
            this._writeValueOf(Id, newValue);
        });
    }
    /**** _innerEntriesOf — get sorted inner entries ****/
    _innerEntriesOf(Id) {
        return this.#sortedInnerEntriesOf(Id).map(entry => this.#wrapped(entry.Id));
    }
    /**** _outerItemIdOf — get outer data id ****/
    _outerItemIdOf(Id) {
        const EntryData = this.#view().Entries[Id];
        const outerItemId = EntryData?.outerPlacement?.outerItemId;
        return outerItemId ?? undefined;
    }
    /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
    _getValueRefOf(Id) {
        const Kind = this._ValueKindOf(Id);
        if (Kind !== 'literal-reference' && Kind !== 'binary-reference') {
            return undefined;
        }
        const EntryData = this.#view().Entries[Id];
        const Raw = EntryData?.ValueRef;
        if (Raw == undefined) {
            return undefined;
        }
        return (typeof Raw === 'string' ? JSON.parse(Raw) : Raw);
    }
    /**** _InfoProxyOf — get proxy for metadata access ****/
    _InfoProxyOf(Id) {
        const Store = this;
        return new Proxy({}, {
            get(_target, Key) {
                if (typeof Key !== 'string') {
                    return undefined;
                }
                const Info = Store.#view().Entries[Id]?.Info;
                return Info?.[Key];
            },
            set(_target, Key, Value) {
                if (typeof Key !== 'string') {
                    return false;
                }
                if (Value === undefined) {
                    Store.transact(() => {
                        const Info = Store.#view().Entries[Id]?.Info;
                        if (Info != null && Key in Info) {
                            Store.#Model.api.obj(['Entries', Id, 'Info']).del([Key]);
                            Store.#recordChange(Id, `Info.${Key}`);
                        }
                    });
                    return true;
                }
                expectValidInfoKey(Key);
                checkInfoValueSize(Value);
                Store.transact(() => {
                    Store.#Model.api.obj(['Entries', Id, 'Info']).set({ [Key]: Value });
                    Store.#recordChange(Id, `Info.${Key}`);
                });
                return true;
            },
            deleteProperty(_target, Key) {
                if (typeof Key !== 'string') {
                    return false;
                }
                Store.transact(() => {
                    const Info = Store.#view().Entries[Id]?.Info;
                    if (Info != null && Key in Info) {
                        Store.#Model.api.obj(['Entries', Id, 'Info']).del([Key]);
                        Store.#recordChange(Id, `Info.${Key}`);
                    }
                });
                return true;
            },
            ownKeys() {
                const Info = Store.#view().Entries[Id]?.Info;
                return Info != null ? Object.keys(Info) : [];
            },
            getOwnPropertyDescriptor(_target, Key) {
                if (typeof Key !== 'string') {
                    return undefined;
                }
                const Info = Store.#view().Entries[Id]?.Info;
                if (Info == null || !(Key in Info)) {
                    return undefined;
                }
                return { configurable: true, enumerable: true, value: Info[Key] };
            },
            has(_target, Key) {
                if (typeof Key !== 'string') {
                    return false;
                }
                const Info = Store.#view().Entries[Id]?.Info;
                return Info != null && Key in Info;
            },
        });
    }
    /**** _TargetOf — get link target data ****/
    _TargetOf(Id) {
        const EntryData = this.#view().Entries[Id];
        const TargetId = EntryData?.TargetId;
        if (!TargetId) {
            throw new SDS_Error('not-found', `link '${Id}' has no target`);
        }
        return this.#wrapped(TargetId);
    }
    /**** _mayMoveEntryTo — check if move is valid ****/
    _mayMoveEntryTo(EntryId, outerItemId, Index) {
        // RootItem cannot be moved
        if (EntryId === RootId) {
            return false;
        }
        // TrashItem and LostAndFoundItem can only be moved to RootItem
        if ((EntryId === TrashId || EntryId === LostAndFoundId) && outerItemId !== RootId) {
            return false;
        }
        // Check if the move would create a cycle
        if (this.#wouldCreateCycle(EntryId, outerItemId)) {
            return false;
        }
        return true;
    }
    /**** _mayDeleteEntry — check if entry can be deleted ****/
    _mayDeleteEntry(EntryId) {
        // Root data, trash data, and lost-and-found data cannot be deleted
        if (EntryId === RootId || EntryId === TrashId || EntryId === LostAndFoundId) {
            return false;
        }
        return true;
    }
    //----------------------------------------------------------------------------//
    //                             Private Helpers                                //
    //----------------------------------------------------------------------------//
    /**** #collectEntryIds — build old-to-new UUID mapping for an entire subtree ****/
    #collectEntryIds(JSON_, IdMap) {
        IdMap.set(JSON_.Id, crypto.randomUUID());
        if (JSON_.Kind === 'item') {
            for (const InnerJSON of JSON_.innerEntries) {
                this.#collectEntryIds(InnerJSON, IdMap);
            }
        }
    }
    /**** #importEntryFromJSON — recursively import a JSON entry with index updates ****/
    #importEntryFromJSON(JSON_, outerItemId, OrderKey, IdMap) {
        const Id = IdMap.get(JSON_.Id) ?? JSON_.Id;
        const InfoObj = {};
        for (const Key of Object.keys(JSON_.Info ?? {})) {
            InfoObj[Key] = Schema.con(JSON_.Info[Key]);
        }
        if (JSON_.Kind === 'link') {
            const TargetId = IdMap.get(JSON_.TargetId) ?? JSON_.TargetId;
            this.#Model.api.obj(['Entries']).set({ [Id]: Schema.obj({
                    Kind: Schema.con('link'),
                    outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
                    Label: Schema.val(Schema.str(JSON_.Label ?? '')),
                    Info: Schema.obj(InfoObj),
                    TargetId: Schema.con(TargetId),
                }) });
            this.#addToReverseIndex(outerItemId, Id);
            this.#addToLinkTargetIndex(TargetId, Id);
            this.#recordChange(outerItemId, 'innerEntryList');
            this.#recordChange(Id, 'outerItem');
            return;
        }
        const storedType = JSON_.Type === DefaultMIMEType ? '' : JSON_.Type;
        const EntryObj = {
            Kind: Schema.con('item'),
            outerPlacement: Schema.val(Schema.con({ outerItemId, OrderKey })),
            Label: Schema.val(Schema.str(JSON_.Label ?? '')),
            Info: Schema.obj(InfoObj),
            MIMEType: Schema.val(Schema.str(storedType)),
            ValueKind: Schema.val(Schema.str(JSON_.ValueKind ?? 'none')),
        };
        switch (true) {
            case (JSON_.ValueKind === 'literal' && JSON_.Value != null):
                EntryObj.literalValue = Schema.val(Schema.str(JSON_.Value));
                break;
            case (JSON_.ValueKind === 'binary' && JSON_.Value != null):
                EntryObj.binaryValue = Schema.con(_base64ToUint8Array(JSON_.Value));
                break;
        }
        this.#Model.api.obj(['Entries']).set({ [Id]: Schema.obj(EntryObj) });
        this.#addToReverseIndex(outerItemId, Id);
        this.#recordChange(outerItemId, 'innerEntryList');
        this.#recordChange(Id, 'outerItem');
        if (JSON_.innerEntries.length > 0) {
            const OrderKeys = generateNKeysBetween(null, null, JSON_.innerEntries.length);
            for (let i = 0; i < JSON_.innerEntries.length; i++) {
                this.#importEntryFromJSON(JSON_.innerEntries[i], Id, OrderKeys[i], IdMap);
            }
        }
    }
    /**** #view — get current model state view ****/
    #view() {
        return this.#Model.api.view();
    }
    /**** #wrapped — wrap raw entry data in SDS_Entry object ****/
    #wrapped(Id) {
        const View = this.#view();
        const EntryData = View.Entries[Id];
        if (EntryData == null) {
            return null;
        }
        const Kind = EntryData.Kind;
        switch (true) {
            case (Kind === 'item'): return this.#wrappedItem(Id);
            case (Kind === 'link'): return this.#wrappedLink(Id);
            default: return null;
        }
    }
    /**** #wrappedItem — wrap raw data data in SDS_Item object ****/
    #wrappedItem(Id) {
        const Cached = this.#WrapperCache.get(Id);
        if (Cached instanceof SDS_Item) {
            return Cached;
        }
        const Data = new SDS_Item(this, Id);
        this.#cacheWrapper(Id, Data);
        return Data;
    }
    /**** #wrappedLink — wrap raw link data in SDS_Link object ****/
    #wrappedLink(Id) {
        const Cached = this.#WrapperCache.get(Id);
        if (Cached instanceof SDS_Link) {
            return Cached;
        }
        const Link = new SDS_Link(this, Id);
        this.#cacheWrapper(Id, Link);
        return Link;
    }
    /**** #cacheWrapper — add wrapper to LRU cache ****/
    #cacheWrapper(Id, Wrapper) {
        if (this.#WrapperCache.size >= this.#MaxCacheSize) {
            const FirstKey = this.#WrapperCache.keys().next().value;
            if (FirstKey != null) {
                this.#WrapperCache.delete(FirstKey);
            }
        }
        this.#WrapperCache.set(Id, Wrapper);
    }
    /**** #rebuildIndices — rebuild all indices from scratch ****/
    #rebuildIndices() {
        this.#ReverseIndex.clear();
        this.#ForwardIndex.clear();
        this.#LinkTargetIndex.clear();
        this.#LinkForwardIndex.clear();
        const Entries = this.#view().Entries;
        for (const [EntryId, EntryData] of Object.entries(Entries)) {
            const outerItemId = EntryData.outerPlacement?.outerItemId;
            if (outerItemId) {
                this.#addToReverseIndex(outerItemId, EntryId);
            }
            if (EntryData.Kind === 'link') {
                const TargetId = EntryData.TargetId;
                if (TargetId) {
                    this.#addToLinkTargetIndex(TargetId, EntryId);
                }
            }
        }
    }
    /**** #updateIndicesFromView — update indices after patch applied ****/
    #updateIndicesFromView() {
        const SeenIds = new Set();
        const Entries = this.#view().Entries;
        for (const [EntryId, EntryData] of Object.entries(Entries)) {
            SeenIds.add(EntryId);
            const newOuterItemId = EntryData.outerPlacement?.outerItemId;
            const oldOuterItemId = this.#ForwardIndex.get(EntryId);
            if (newOuterItemId !== oldOuterItemId) {
                if (oldOuterItemId != null) {
                    this.#removeFromReverseIndex(oldOuterItemId, EntryId);
                    this.#recordChange(oldOuterItemId, 'innerEntryList');
                }
                if (newOuterItemId != null) {
                    this.#addToReverseIndex(newOuterItemId, EntryId);
                    this.#recordChange(newOuterItemId, 'innerEntryList');
                }
                this.#recordChange(EntryId, 'outerItem');
            }
            switch (true) {
                case (EntryData.Kind === 'link'): {
                    const newTargetId = EntryData.TargetId;
                    const oldTargetId = this.#LinkForwardIndex.get(EntryId);
                    if (newTargetId !== oldTargetId) {
                        if (oldTargetId != null) {
                            this.#removeFromLinkTargetIndex(oldTargetId, EntryId);
                        }
                        if (newTargetId != null) {
                            this.#addToLinkTargetIndex(newTargetId, EntryId);
                        }
                    }
                    break;
                }
                case this.#LinkForwardIndex.has(EntryId):
                    this.#removeFromLinkTargetIndex(this.#LinkForwardIndex.get(EntryId), EntryId);
                    break;
            }
            this.#recordChange(EntryId, 'Label');
        }
        const deletedEntries = Array.from(this.#ForwardIndex.entries()).filter(([Id]) => !SeenIds.has(Id));
        for (const [EntryId, oldOuterItemId] of deletedEntries) {
            this.#removeFromReverseIndex(oldOuterItemId, EntryId);
            this.#recordChange(oldOuterItemId, 'innerEntryList');
        }
        const deletedLinks = Array.from(this.#LinkForwardIndex.entries()).filter(([Id]) => !SeenIds.has(Id));
        for (const [LinkId, oldTargetId] of deletedLinks) {
            this.#removeFromLinkTargetIndex(oldTargetId, LinkId);
        }
    }
    /**** #addToReverseIndex — add entry to outer-data index ****/
    #addToReverseIndex(outerItemId, EntryId) {
        let innerIds = this.#ReverseIndex.get(outerItemId);
        if (innerIds == null) {
            innerIds = new Set();
            this.#ReverseIndex.set(outerItemId, innerIds);
        }
        innerIds.add(EntryId);
        this.#ForwardIndex.set(EntryId, outerItemId);
    }
    /**** #removeFromReverseIndex — remove entry from outer-data index ****/
    #removeFromReverseIndex(outerItemId, EntryId) {
        this.#ReverseIndex.get(outerItemId)?.delete(EntryId);
        this.#ForwardIndex.delete(EntryId);
    }
    /**** #addToLinkTargetIndex — add link to target index ****/
    #addToLinkTargetIndex(TargetId, LinkId) {
        let Links = this.#LinkTargetIndex.get(TargetId);
        if (Links == null) {
            Links = new Set();
            this.#LinkTargetIndex.set(TargetId, Links);
        }
        Links.add(LinkId);
        this.#LinkForwardIndex.set(LinkId, TargetId);
    }
    /**** #removeFromLinkTargetIndex — remove link from target index ****/
    #removeFromLinkTargetIndex(TargetId, LinkId) {
        this.#LinkTargetIndex.get(TargetId)?.delete(LinkId);
        this.#LinkForwardIndex.delete(LinkId);
    }
    /**** #OrderKeyAt — generate order key for insertion position ****/
    #OrderKeyAt(outerItemId, InsertionIndex) {
        const keyFrom = (Entries) => {
            if (Entries.length === 0 || InsertionIndex == null) {
                const Last = Entries.length > 0 ? Entries[Entries.length - 1].OrderKey : null;
                return generateKeyBetween(Last, null);
            }
            const i = Math.max(0, Math.min(InsertionIndex, Entries.length));
            return generateKeyBetween(i > 0 ? Entries[i - 1].OrderKey : null, i < Entries.length ? Entries[i].OrderKey : null);
        };
        let Entries = this.#sortedInnerEntriesOf(outerItemId);
        const Key = keyFrom(Entries);
        if (Key.length <= maxOrderKeyLength) {
            return Key;
        }
        this._rebalanceInnerEntriesOf(outerItemId);
        return keyFrom(this.#sortedInnerEntriesOf(outerItemId));
    }
    /**** #lastOrderKeyOf — get order key of last inner entry ****/
    #lastOrderKeyOf(DataId) {
        const innerEntries = this.#sortedInnerEntriesOf(DataId);
        return innerEntries.length > 0 ? innerEntries[innerEntries.length - 1].OrderKey : null;
    }
    /**** #sortedInnerEntriesOf — get sorted inner entries ****/
    #sortedInnerEntriesOf(DataId) {
        const innerIds = this.#ReverseIndex.get(DataId) ?? new Set();
        const Result = [];
        const Entries = this.#view().Entries;
        for (const innerEntryId of innerIds) {
            const EntryData = Entries[innerEntryId];
            const innerOuterItemId = EntryData.outerPlacement?.outerItemId;
            if (innerOuterItemId === DataId) {
                Result.push({
                    Id: innerEntryId,
                    OrderKey: EntryData.outerPlacement?.OrderKey ?? ''
                });
            }
        }
        Result.sort((EntryA, EntryB) => EntryA.OrderKey < EntryB.OrderKey
            ? -1
            : EntryA.OrderKey > EntryB.OrderKey
                ? 1
                : EntryA.Id < EntryB.Id
                    ? -1
                    : EntryA.Id > EntryB.Id
                        ? 1
                        : 0);
        return Result;
    }
    /**** #isProtected — check if entry is protected by incoming links ****/
    #isProtected(TrashBranchId) {
        const RootReachable = this.#reachableFromRoot();
        const Protected = new Set();
        let Changed = true;
        while (Changed) {
            Changed = false;
            for (const DirectChild of this.#ReverseIndex.get(TrashId) ?? new Set()) {
                if (Protected.has(DirectChild)) {
                    continue;
                }
                if (this.#SubtreeHasIncomingLinks(DirectChild, RootReachable, Protected)) {
                    Protected.add(DirectChild);
                    Changed = true;
                }
            }
        }
        return Protected.has(TrashBranchId);
    }
    /**** #SubtreeHasIncomingLinks — check for incoming links to subtree ****/
    #SubtreeHasIncomingLinks(RootOfSubtree, RootReachable, Protected) {
        const Queue = [RootOfSubtree];
        const Visited = new Set();
        while (Queue.length > 0) {
            const EntryId = Queue.pop();
            if (Visited.has(EntryId)) {
                continue;
            }
            Visited.add(EntryId);
            const IncomingLinks = this.#LinkTargetIndex.get(EntryId) ?? new Set();
            for (const LinkId of IncomingLinks) {
                if (RootReachable.has(LinkId)) {
                    return true;
                }
                const TrashBranch = this.#directTrashInnerEntryContaining(LinkId);
                if (TrashBranch != null && Protected.has(TrashBranch)) {
                    return true;
                }
            }
            for (const innerEntryId of this.#ReverseIndex.get(EntryId) ?? new Set()) {
                if (!Visited.has(innerEntryId)) {
                    Queue.push(innerEntryId);
                }
            }
        }
        return false;
    }
    /**** #directTrashInnerEntryContaining — find direct inner entry of TrashItem containing entry ****/
    #directTrashInnerEntryContaining(EntryId) {
        let currentId = EntryId;
        while (currentId != null) {
            const Outer = this._outerItemIdOf(currentId);
            if (Outer === TrashId) {
                return currentId;
            }
            if (Outer === RootId || Outer == null) {
                return null;
            }
            currentId = Outer;
        }
        return null;
    }
    /**** #reachableFromRoot — compute reachable entries from root ****/
    #reachableFromRoot() {
        const Reachable = new Set();
        const Queue = [RootId];
        while (Queue.length > 0) {
            const Id = Queue.pop();
            if (Reachable.has(Id)) {
                continue;
            }
            Reachable.add(Id);
            for (const innerEntryId of this.#ReverseIndex.get(Id) ?? new Set()) {
                if (!Reachable.has(innerEntryId)) {
                    Queue.push(innerEntryId);
                }
            }
        }
        return Reachable;
    }
    /**** #purgeSubtree — recursively purge entry and children ****/
    #purgeSubtree(EntryId) {
        const EntryData = this.#view().Entries[EntryId];
        if (EntryData == null) {
            return;
        }
        const Kind = EntryData.Kind;
        const oldOuterItemId = EntryData.outerPlacement?.outerItemId;
        const RootReachable = this.#reachableFromRoot();
        const Protected = new Set();
        const innerEntries = Array.from(this.#ReverseIndex.get(EntryId) ?? new Set());
        for (const innerEntryId of innerEntries) {
            if (this.#SubtreeHasIncomingLinks(innerEntryId, RootReachable, Protected)) {
                // inner rescue: move to TrashItem top level
                const OrderKey = generateKeyBetween(this.#lastOrderKeyOf(TrashId), null);
                this.#Model.api.obj(['Entries', innerEntryId, 'outerPlacement']).set({
                    outerItemId: TrashId,
                    OrderKey: OrderKey
                });
                this.#removeFromReverseIndex(EntryId, innerEntryId);
                this.#addToReverseIndex(TrashId, innerEntryId);
                this.#recordChange(TrashId, 'innerEntryList');
                this.#recordChange(innerEntryId, 'outerItem');
            }
            else {
                this.#purgeSubtree(innerEntryId);
            }
        }
        // delete the entry itself
        this.#Model.api.obj(['Entries']).del([EntryId]);
        if (oldOuterItemId) {
            this.#removeFromReverseIndex(oldOuterItemId, EntryId);
            this.#recordChange(oldOuterItemId, 'innerEntryList');
        }
        if (Kind === 'link') {
            const TargetId = EntryData.TargetId;
            if (TargetId) {
                this.#removeFromLinkTargetIndex(TargetId, EntryId);
            }
        }
        this.#WrapperCache.delete(EntryId);
    }
    /**** #requireItemExists — throw if data doesn't exist ****/
    #requireItemExists(DataId) {
        const View = this.#view();
        const EntryData = View.Entries[DataId];
        if (EntryData == null || EntryData.Kind !== 'item') {
            throw new SDS_Error('invalid-argument', `item '${DataId}' does not exist`);
        }
    }
    /**** #ensureInfoExists — create Info object if missing ****/
    #ensureInfoExists(EntryId) {
        const EntryData = this.#view().Entries[EntryId];
        const Info = EntryData?.Info;
        if (Info == null) {
            this.#Model.api.obj(['Entries', EntryId]).set({ Info: Schema.obj({}) });
        }
    }
    /**** #removeInfoIfEmpty — delete Info object if empty ****/
    #removeInfoIfEmpty(EntryId) {
        const EntryData = this.#view().Entries[EntryId];
        const Info = EntryData?.Info;
        if (Info != null && Object.keys(Info).length === 0) {
            this.#Model.api.obj(['Entries', EntryId]).del(['Info']);
        }
    }
    /**** #recordChange — track property change ****/
    #recordChange(EntryId, Property) {
        if (this.#pendingChangeSet[EntryId] == null) {
            this.#pendingChangeSet[EntryId] = new Set();
        }
        ;
        this.#pendingChangeSet[EntryId].add(Property);
    }
    /**** #notifyHandlers — invoke change listeners ****/
    #notifyHandlers(Origin, ChangeSet) {
        if (Object.keys(ChangeSet).length === 0) {
            return;
        }
        for (const Handler of this.#Handlers) {
            try {
                Handler(Origin, ChangeSet);
            }
            catch (_Signal) {
                /* swallow */
            }
        }
    }
    /**** #wouldCreateCycle — check if move would create an outer-data cycle ****/
    #wouldCreateCycle(EntryId, TargetId) {
        let currentId = TargetId;
        while (currentId != null) {
            if (currentId === EntryId) {
                return true;
            }
            currentId = this._outerItemIdOf(currentId);
        }
        return false;
    }
}
export default SDS_DataStore;
//# sourceMappingURL=SDS_DataStore.js.map