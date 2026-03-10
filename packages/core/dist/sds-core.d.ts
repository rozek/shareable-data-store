export declare function _base64ToUint8Array(base64: string): Uint8Array;

export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SDS_ChangeSet) => void;

/**** ChangeOrigin / ChangeHandler — types shared by all backends and consumers ****/
export declare type ChangeOrigin = 'internal' | 'external';

/**** validateInfoValue — throw if Info value is not JSON-serialisable or exceeds maxInfoValueSize ****/
export declare function checkInfoValueSize(Value: unknown): void;

export declare const DefaultBinarySizeLimit = 2048;

export declare const DefaultLiteralSizeLimit = 131072;

/**** Store-wide defaults, shared by all backend implementations ****/
export declare const DefaultMIMEType = "text/plain";

export declare const DefaultWrapperCacheSize = 5000;

/**** validateInfoKey — throw if Info key is empty or exceeds maxInfoKeyLength ****/
export declare function expectValidInfoKey(Key: unknown): void;

/*******************************************************************************
 *                                                                              *
 *            SDS Store — shared validation functions for all backends          *
 *                                                                              *
 *******************************************************************************/
/**** validateLabel — throw if label is not a string or exceeds maxLabelLength ****/
export declare function expectValidLabel(Value: unknown): void;

/**** validateMIMEType — throw if MIMEType is not a non-empty string or exceeds maxMIMETypeLength ****/
export declare function expectValidMIMEType(Value: unknown): void;

export declare const LostAndFoundId = "00000000-0000-4000-8000-000000000002";

export declare const maxInfoKeyLength = 1024;

export declare const maxInfoValueSize = 1048576;

/**** Validation limits for user-supplied strings and metadata ****/
export declare const maxLabelLength = 1024;

export declare const maxMIMETypeLength = 256;

/****  OrderKey management ****/
export declare const maxOrderKeyLength = 200;

/**** well-known fixed UUIDs for the three root containers ****/
export declare const RootId = "00000000-0000-4000-8000-000000000000";

export declare type SDS_ChangeSet = Record<string, SDS_EntryChangeSet>;

export declare interface SDS_ConnectionOptions {
    Token: string;
    reconnectDelayMs?: number;
}

/*******************************************************************************
 *                                                                              *
 *                            SDS_NetworkProvider                               *
 *                                                                              *
 *******************************************************************************/
export declare type SDS_ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export declare abstract class SDS_DataStore {
    #private;
    /**** _BLOBhash — FNV-1a 32-bit content hash used as blob identity key ****/
    protected static _BLOBhash(Data: Uint8Array): string;
    /**** _storeValueBlob — cache a blob (called by backends on write) ****/
    protected _storeValueBlob(Hash: string, Blob: Uint8Array): void;
    /**** _getValueBlobAsync — look up a blob; fall back to the persistence loader ****/
    protected _getValueBlobAsync(Hash: string): Promise<Uint8Array | undefined>;
    /**** storeValueBlob — public entry point for SyncEngine ****/
    storeValueBlob(Hash: string, Blob: Uint8Array): void;
    /**** getValueBlobByHash — synchronous lookup (returns undefined if not cached) ****/
    getValueBlobByHash(Hash: string): Uint8Array | undefined;
    /**** hasValueBlob — check whether a blob is already in the local cache ****/
    hasValueBlob(Hash: string): boolean;
    /**** setValueBlobLoader — called by SDS_SyncEngine to enable lazy persistence loading ****/
    setValueBlobLoader(Loader: (Hash: string) => Promise<Uint8Array | undefined>): void;
    /**** _getValueRefOf — return the { Hash, Size } ref for entries with *-reference ValueKind ****/
    abstract _getValueRefOf(Id: string): {
        Hash: string;
        Size: number;
    } | undefined;
    /**** RootItem — the invisible root of the entry tree ****/
    abstract get RootItem(): SDS_Item;
    /**** TrashItem — container for soft-deleted entries ****/
    abstract get TrashItem(): SDS_Item;
    /**** LostAndFoundItem — container for orphaned entries recovered after sync ****/
    abstract get LostAndFoundItem(): SDS_Item;
    /**** EntryWithId — retrieve an entry by its unique Id, or undefined ****/
    abstract EntryWithId(EntryId: string): SDS_Entry | undefined;
    /**** newItemAt — create a new item of given type as a direct inner entry of outerItem ****/
    abstract newItemAt(MIMEType: string | undefined, outerItem: SDS_Item, InsertionIndex?: number): SDS_Item;
    /**** newLinkAt — create a new link pointing at Target inside outerItem ****/
    abstract newLinkAt(Target: SDS_Item, outerItem: SDS_Item, InsertionIndex?: number): SDS_Link;
    /**** newEntryFromJSONat — import a serialised entry (item or link) from JSON ****/
    newEntryFromJSONat(Serialisation: unknown, outerItem: SDS_Item, InsertionIndex?: number): SDS_Entry;
    /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) from binary ****/
    abstract newEntryFromBinaryAt(Serialisation: Uint8Array, outerItem: SDS_Item, InsertionIndex?: number): SDS_Entry;
    /**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/
    abstract deserializeItemInto(Serialisation: unknown, outerItem: SDS_Item, InsertionIndex?: number): SDS_Item;
    /**** deserializeLinkInto — import a serialised link; always remaps its Id ****/
    abstract deserializeLinkInto(Serialisation: unknown, outerItem: SDS_Item, InsertionIndex?: number): SDS_Link;
    /**** EntryMayBeMovedTo — true when moving Entry into outerItem at InsertionIndex is allowed ****/
    EntryMayBeMovedTo(Entry: SDS_Entry, outerItem: SDS_Item, InsertionIndex?: number): boolean;
    /**** moveEntryTo — move Entry to outerItem at InsertionIndex ****/
    abstract moveEntryTo(Entry: SDS_Entry, outerItem: SDS_Item, InsertionIndex?: number): void;
    /**** EntryMayBeDeleted — true when Entry can be moved to the trash ****/
    EntryMayBeDeleted(Entry: SDS_Entry): boolean;
    /**** deleteEntry — move Entry to TrashItem and record deletion timestamp ****/
    abstract deleteEntry(Entry: SDS_Entry): void;
    /**** purgeEntry — permanently remove Entry and its subtree ****/
    abstract purgeEntry(Entry: SDS_Entry): void;
    /**** purgeExpiredTrashEntries — remove all trash entries whose TTL has elapsed ****/
    abstract purgeExpiredTrashEntries(TTLms?: number): number;
    /**** rebalanceInnerEntriesOf — reassign fresh, evenly-spaced OrderKeys to all direct inner entries ****/
    rebalanceInnerEntriesOf(item: SDS_Item): void;
    /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
    protected abstract _rebalanceInnerEntriesOf(outerItemId: string): void;
    /**** transact — execute Callback inside a batched, atomic transaction ****/
    abstract transact(Callback: () => void): void;
    /**** onChangeInvoke — register Handler as a change listener; returns an unsubscribe function ****/
    abstract onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** dispose — release timers and other resources held by the store ****/
    abstract dispose(): void;
    /**** currentCursor — opaque cursor representing the current CRDT state ****/
    abstract get currentCursor(): SDS_SyncCursor;
    /**** exportPatch — encode all changes since sinceCursor; full snapshot when omitted ****/
    abstract exportPatch(sinceCursor?: SDS_SyncCursor): Uint8Array;
    /**** applyRemotePatch — integrate a patch received from a remote peer ****/
    abstract applyRemotePatch(encodedPatch: Uint8Array): void;
    /**** asBinary — serialise the entire store as a compressed binary snapshot ****/
    abstract asBinary(): Uint8Array;
    /**** asJSON — serialise the full store tree as a plain, human-readable JSON object ****/
    asJSON(): SDS_ItemJSON;
    /**** recoverOrphans — move entries with missing parents into LostAndFoundItem ****/
    abstract recoverOrphans(): void;
    /**** _KindOf — return the Kind ('item' | 'link') of the entry with the given Id ****/
    abstract _KindOf(Id: string): 'item' | 'link';
    /**** _LabelOf — return the current label text of the entry with the given Id ****/
    abstract _LabelOf(Id: string): string;
    /**** _setLabelOf — update the label text of the entry with the given Id ****/
    abstract _setLabelOf(Id: string, Value: string): void;
    /**** _TypeOf — return the MIME type of the item with the given Id ****/
    abstract _TypeOf(Id: string): string;
    /**** _setTypeOf — update the MIME type of the item with the given Id ****/
    abstract _setTypeOf(Id: string, Value: string): void;
    /**** _ValueKindOf — return the value kind of the item with the given Id ****/
    abstract _ValueKindOf(Id: string): 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    /**** _isLiteralOf — true when the item stores an inline literal string ****/
    _isLiteralOf(Id: string): boolean;
    /**** _isBinaryOf — true when the item stores inline binary data ****/
    _isBinaryOf(Id: string): boolean;
    /**** _readValueOf — resolve and return the item's current value ****/
    abstract _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    /**** _writeValueOf — replace the item's stored value ****/
    abstract _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    /**** _spliceValueOf — replace a character range inside a literal value ****/
    abstract _spliceValueOf(Id: string, fromIndex: number, toIndex: number, Replacement: string): void;
    /**** _InfoProxyOf — return a Proxy giving key/value access to the Info metadata ****/
    abstract _InfoProxyOf(Id: string): Record<string, unknown>;
    /**** _outerItemOf — return the direct outer item of the entry with the given Id ****/
    _outerItemOf(Id: string): SDS_Item | undefined;
    /**** _outerItemIdOf — return the Id of the direct outer item ****/
    abstract _outerItemIdOf(Id: string): string | undefined;
    /**** _outerItemChainOf — return the full ancestor chain from direct outer to root ****/
    _outerItemChainOf(Id: string): SDS_Item[];
    /**** _outerItemIdsOf — return the Ids of all ancestors from direct outer to root ****/
    _outerItemIdsOf(Id: string): string[];
    /**** _innerEntriesOf — return the direct inner entries sorted by OrderKey ****/
    abstract _innerEntriesOf(DataId: string): SDS_Entry[];
    /**** _mayMoveEntryTo — false when moving Id into outerItemId would create a cycle ****/
    abstract _mayMoveEntryTo(Id: string, outerItemId: string, InsertionIndex?: number): boolean;
    /**** _mayDeleteEntry — false for the three well-known system items ****/
    abstract _mayDeleteEntry(Id: string): boolean;
    /**** _TargetOf — return the link target item for the link with the given Id ****/
    abstract _TargetOf(Id: string): SDS_Item;
    /**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/
    abstract _currentValueOf(Id: string): string | Uint8Array | undefined;
    /**** _EntryAsBinary — gzip-compress the JSON representation of an entry and its subtree ****/
    abstract _EntryAsBinary(Id: string): Uint8Array;
    /**** _EntryAsJSON — serialise an entry and its full subtree as a plain JSON object ****/
    _EntryAsJSON(Id: string): SDS_EntryJSON;
}

/**** SDS_DataStoreOptions — construction options shared by all backends ****/
export declare interface SDS_DataStoreOptions {
    LiteralSizeLimit?: number;
    TrashTTLms?: number;
    TrashCheckIntervalMs?: number;
}

export declare class SDS_Entry {
    protected readonly _Store: SDS_DataStore;
    readonly Id: string;
    constructor(_Store: SDS_DataStore, Id: string);
    /**** isRootItem / isTrashItem / isLostAndFoundItem / isItem / isLink ****/
    get isRootItem(): boolean;
    get isTrashItem(): boolean;
    get isLostAndFoundItem(): boolean;
    get isItem(): boolean;
    get isLink(): boolean;
    /**** outerItem / outerItemId / outerItemChain / outerItemIds ****/
    get outerItem(): SDS_Item | undefined;
    get outerItemId(): string | undefined;
    get outerItemChain(): SDS_Item[];
    get outerItemIds(): string[];
    /**** Label / Info ****/
    get Label(): string;
    set Label(Value: string);
    get Info(): Record<string, unknown>;
    /**** mayBeMovedTo ****/
    mayBeMovedTo(outerItem: SDS_Item, InsertionIndex?: number): boolean;
    /**** moveTo ****/
    moveTo(outerItem: SDS_Item, InsertionIndex?: number): void;
    /**** mayBeDeleted ****/
    get mayBeDeleted(): boolean;
    /**** delete ****/
    delete(): void;
    /**** purge ****/
    purge(): void;
    /**** asJSON — serialise this entry and its subtree as a plain JSON object ****/
    asJSON(): SDS_EntryJSON;
    /**** asBinary — serialise this entry and its subtree as a gzip-compressed binary ****/
    asBinary(): Uint8Array;
}

/*******************************************************************************
 *                                                                              *
 * SDS_EntryChangeSet - the set of prop. names that changed for a single entry  *
 *                                                                              *
 *******************************************************************************/
export declare type SDS_EntryChangeSet = Set<string>;

/**** SDS_EntryJSON — union of item and link JSON representations ****/
export declare type SDS_EntryJSON = SDS_ItemJSON | SDS_LinkJSON;

/*******************************************************************************
 *                                                                              *
 *                                  SDS_Error                                   *
 *                                                                              *
 *******************************************************************************/
export declare class SDS_Error extends Error {
    readonly code: string;
    constructor(Code: string, Message: string);
}

export declare class SDS_Item extends SDS_Entry {
    constructor(Store: SDS_DataStore, Id: string);
    /**** Type / ValueKind / isLiteral / isBinary ****/
    get Type(): string;
    set Type(Type: string);
    get ValueKind(): 'none' | 'literal' | 'literal-reference' | 'binary' | 'binary-reference' | 'pending';
    get isLiteral(): boolean;
    get isBinary(): boolean;
    /**** readValue — resolves inline values immediately, fetches blobs async ****/
    readValue(): Promise<string | Uint8Array | undefined>;
    /**** writeValue — chooses ValueKind automatically based on type/size ****/
    writeValue(Value: string | Uint8Array | undefined): void;
    /**** changeValue — collaborative character-level edit (literal only) ****/
    changeValue(fromIndex: number, toIndex: number, Replacement: string): void;
    /**** innerEntryList ****/
    get innerEntryList(): SDS_Entry[];
    /**** asJSON — serialise this item and its subtree as a plain JSON object ****/
    asJSON(): SDS_ItemJSON;
}

/**** SDS_ItemJSON — plain-object serialisation of an item entry (recursive) ****/
export declare interface SDS_ItemJSON {
    Kind: 'item';
    Id: string;
    Label: string;
    Type: string;
    ValueKind: 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    Value?: string;
    Info: Record<string, unknown>;
    innerEntries: SDS_EntryJSON[];
}

export declare class SDS_Link extends SDS_Entry {
    constructor(Store: SDS_DataStore, Id: string);
    /**** Target ****/
    get Target(): SDS_Item;
    /**** asJSON — serialise this link as a plain JSON object ****/
    asJSON(): SDS_LinkJSON;
}

/**** SDS_LinkJSON — plain-object serialisation of a link entry ****/
export declare interface SDS_LinkJSON {
    Kind: 'link';
    Id: string;
    Label: string;
    TargetId: string;
    Info: Record<string, unknown>;
}

/*******************************************************************************
 *                                                                              *
 *                           SDS_PresenceProvider                               *
 *                                                                              *
 *******************************************************************************/
export declare interface SDS_LocalPresenceState {
    PeerId?: string;
    UserName?: string;
    UserColor?: string;
    UserFocus?: {
        EntryId: string;
        Property: 'Value' | 'Label' | 'Info';
        Cursor?: {
            from: number;
            to: number;
        };
    };
    custom?: unknown;
}

export declare interface SDS_NetworkProvider {
    readonly StoreId: string;
    readonly ConnectionState: SDS_ConnectionState;
    /**** connect — open an authenticated connection to a relay server ****/
    connect(URL: string, Options: SDS_ConnectionOptions): Promise<void>;
    /**** disconnect — close connection and cancel any pending reconnect ****/
    disconnect(): void;
    /**** sendPatch — broadcast a CRDT patch to all connected peers ****/
    sendPatch(Patch: Uint8Array): void;
    /**** sendValue — upload a large value blob identified by its SHA-256 hash ****/
    sendValue(ValueHash: string, Data: Uint8Array): void;
    /**** requestValue — ask the relay to deliver a value blob by its hash ****/
    requestValue(ValueHash: string): void;
    /**** onPatch — subscribe to incoming CRDT patches; returns unsubscribe fn ****/
    onPatch(Callback: (Patch: Uint8Array) => void): () => void;
    /**** onValue — subscribe to incoming value blobs; returns unsubscribe fn ****/
    onValue(Callback: (ValueHash: string, Value: Uint8Array) => void): () => void;
    /**** onConnectionChange — subscribe to connection-state changes; returns unsubscribe fn ****/
    onConnectionChange(Callback: (ConnectionState: SDS_ConnectionState) => void): () => void;
}

export declare type SDS_PatchSeqNumber = number;

export declare interface SDS_PersistenceProvider {
    /**** loadSnapshot — load most recent full snapshot, or undefined if none exists ****/
    loadSnapshot(): Promise<Uint8Array | undefined>;
    /**** saveSnapshot — persist a full snapshot, replacing any previous one ****/
    saveSnapshot(Data: Uint8Array): Promise<void>;
    /**** loadPatchesSince — load all patches with SeqNumber > given value ****/
    loadPatchesSince(SeqNumber: SDS_PatchSeqNumber): Promise<Uint8Array[]>;
    /**** appendPatch — append a patch at the given sequence position ****/
    appendPatch(Patch: Uint8Array, SeqNumber: SDS_PatchSeqNumber): Promise<void>;
    /**** prunePatches — delete all patches with SeqNumber < given value ****/
    prunePatches(beforeSeqNumber: SDS_PatchSeqNumber): Promise<void>;
    /**** loadValue — load a large value blob by its SHA-256 hex hash ****/
    loadValue(ValueHash: string): Promise<Uint8Array | undefined>;
    /**** saveValue — store a large value blob under its SHA-256 hex hash ****/
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    /**** releaseValue — decrement ref-count; delete the blob when it reaches zero ****/
    releaseValue(ValueHash: string): Promise<void>;
    /**** close — release all held resources ****/
    close(): Promise<void>;
}

export declare interface SDS_PresenceProvider {
    /**** sendLocalState — broadcast the local client's presence state to all peers ****/
    sendLocalState(localPresenceState: SDS_LocalPresenceState): void;
    /**** onRemoteState — subscribe to peer state updates; State===undefined means offline ****/
    onRemoteState(Callback: (PeerId: string, State: SDS_RemotePresenceState | undefined) => void): () => void;
    readonly PeerSet: ReadonlyMap<string, SDS_RemotePresenceState>;
}

export declare interface SDS_RemotePresenceState extends SDS_LocalPresenceState {
    PeerId: string;
    lastSeen: number;
}

/*******************************************************************************
 *                                                                              *
 *                          SDS_PersistenceProvider                             *
 *                                                                              *
 *******************************************************************************/
export declare type SDS_SyncCursor = Uint8Array;

export declare const TrashId = "00000000-0000-4000-8000-000000000001";

/**** _UInt8ArrayToBase64 / _Base64ToUint8Array — shared base64 helpers ****/
export declare function _uint8ArrayToBase64(Bytes: Uint8Array): string;

export { }
