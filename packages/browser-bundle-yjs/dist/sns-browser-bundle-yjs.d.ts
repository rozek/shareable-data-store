export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void;

declare type ChangeHandler_2 = (Origin: ChangeOrigin_2, ChangeSet: SNS_ChangeSet) => void;

export declare type ChangeOrigin = 'internal' | 'external';

declare type ChangeOrigin_2 = 'internal' | 'external';

export declare class SNS_BrowserPersistenceProvider implements SNS_PersistenceProvider {
    #private;
    /**** constructor ****/
    constructor(StoreId: string);
    /**** loadSnapshot ****/
    loadSnapshot(): Promise<Uint8Array | undefined>;
    /**** saveSnapshot ****/
    saveSnapshot(Data: Uint8Array): Promise<void>;
    /**** loadPatchesSince ****/
    loadPatchesSince(SeqNumber: SNS_PatchSeqNumber): Promise<Uint8Array[]>;
    /**** appendPatch ****/
    appendPatch(Patch: Uint8Array, SeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** prunePatches ****/
    prunePatches(beforeSeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** loadValue ****/
    loadValue(ValueHash: string): Promise<Uint8Array | undefined>;
    /**** saveValue ****/
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    /**** releaseValue ****/
    releaseValue(ValueHash: string): Promise<void>;
    /**** close ****/
    close(): Promise<void>;
}

export declare type SNS_ChangeSet = Record<string, SNS_EntryChangeSet>;

export declare interface SNS_ConnectionOptions {
    Token: string;
    reconnectDelayMs?: number;
}

/*******************************************************************************
 *                                                                              *
 *                            SNS_NetworkProvider                               *
 *                                                                              *
 *******************************************************************************/
export declare type SNS_ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export declare class SNS_Entry {
    protected readonly _Store: StoreBackend;
    readonly Id: string;
    constructor(_Store: StoreBackend, Id: string);
    /**** isRootNote / isTrashNote / isLostAndFoundNote / isNote / isLink ****/
    get isRootNote(): boolean;
    get isTrashNote(): boolean;
    get isLostAndFoundNote(): boolean;
    get isNote(): boolean;
    get isLink(): boolean;
    /**** outerNote / outerNoteId / outerNotes / outerNoteIds ****/
    get outerNote(): SNS_Note | undefined;
    get outerNoteId(): string | undefined;
    get outerNotes(): SNS_Note[];
    get outerNoteIds(): string[];
    /**** Label / Info ****/
    get Label(): string;
    set Label(Value: string);
    get Info(): Record<string, unknown>;
    /**** mayBeMovedTo ****/
    mayBeMovedTo(OuterNote: SNS_Note, InsertionIndex?: number): boolean;
    /**** moveTo ****/
    moveTo(OuterNote: SNS_Note, InsertionIndex?: number): void;
    /**** mayBeDeleted ****/
    get mayBeDeleted(): boolean;
    /**** delete ****/
    delete(): void;
    /**** purge ****/
    purge(): void;
    /**** asJSON ****/
    asJSON(): unknown;
}

/*******************************************************************************
 *                                                                              *
 * SNS_EntryChangeSet - the set of prop. names that changed for a single entry  *
 *                                                                              *
 *******************************************************************************/
export declare type SNS_EntryChangeSet = Set<string>;

/*******************************************************************************
 *                                                                              *
 *                                  SNS_Error                                   *
 *                                                                              *
 *******************************************************************************/
export declare class SNS_Error extends Error {
    readonly Code: string;
    constructor(Code: string, Message: string);
}

export declare class SNS_Link extends SNS_Entry {
    constructor(Store: SNS_NoteStore_2 & Record<string, any>, Id: string);
    /**** Target ****/
    get Target(): SNS_Note;
}

/*******************************************************************************
 *                                                                              *
 *                           SNS_PresenceProvider                               *
 *                                                                              *
 *******************************************************************************/
export declare interface SNS_LocalPresenceState {
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

export declare interface SNS_NetworkProvider {
    readonly StoreID: string;
    readonly ConnectionState: SNS_ConnectionState;
    /**** connect — open an authenticated connection to a relay server ****/
    connect(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
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
    onConnectionChange(Callback: (ConnectionState: SNS_ConnectionState) => void): () => void;
}

export declare class SNS_Note extends SNS_Entry {
    constructor(Store: SNS_NoteStore_2 & Record<string, any>, Id: string);
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
    get innerEntryList(): SNS_Entry[];
}

export declare class SNS_NoteStore {
    #private;
    /**** constructor — initialise store from document and options ****/
    private constructor();
    /**** fromScratch — build initial document with three well-known notes ****/
    static fromScratch(Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromBinary — restore store from compressed update ****/
    static fromBinary(Data: Uint8Array, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromJSON — restore store from base64-encoded data ****/
    static fromJSON(Data: unknown, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** RootNote / TrashNote / LostAndFoundNote — access system notes ****/
    get RootNote(): SNS_Note;
    get TrashNote(): SNS_Note;
    get LostAndFoundNote(): SNS_Note;
    /**** EntryWithId — retrieve entry by ID ****/
    EntryWithId(EntryId: string): SNS_Entry | undefined;
    /**** newNoteAt — create note as inner note of outer note ****/
    newNoteAt(OuterNote: SNS_Note, Type?: string, InsertionIndex?: number): SNS_Note;
    /**** newLinkAt — create link as inner link of outer note ****/
    newLinkAt(Target: SNS_Note, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** deserializeNoteInto — import note subtree with remapped IDs ****/
    deserializeNoteInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Note;
    /**** deserializeLinkInto — import link with remapped target ID ****/
    deserializeLinkInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** EntryMayBeMovedTo — check if entry can move to new outer note ****/
    EntryMayBeMovedTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): boolean;
    /**** moveEntryTo — move entry to new outer note and position ****/
    moveEntryTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): void;
    /**** EntryMayBeDeleted — check if entry can be deleted ****/
    EntryMayBeDeleted(Entry: SNS_Entry): boolean;
    /**** deleteEntry — move entry to trash with timestamp ****/
    deleteEntry(Entry: SNS_Entry): void;
    /**** purgeEntry — permanently delete entry and subtree ****/
    purgeEntry(Entry: SNS_Entry): void;
    /**** purgeExpiredTrashEntries — remove trash items past TTL ****/
    purgeExpiredTrashEntries(TTLms?: number): number;
    /**** dispose — cleanup trash timer ****/
    dispose(): void;
    /**** transact — execute callback in batched transaction ****/
    transact(Callback: () => void): void;
    /**** onChangeInvoke — subscribe to change events ****/
    onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** applyRemotePatch — apply remote changes and update indices ****/
    applyRemotePatch(encodedPatch: Uint8Array): void;
    /**** currentCursor — get state vector for sync ****/
    get currentCursor(): SNS_SyncCursor;
    /**** exportPatch — encode changes since cursor ****/
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
    recoverOrphans(): void;
    /**** asBinary — export compressed Y.js update ****/
    asBinary(): Uint8Array;
    /**** asJSON — export as base64-encoded compressed update ****/
    asJSON(): string;
    /**** _KindOf — get entry kind ****/
    _KindOf(Id: string): 'note' | 'link';
    /**** _LabelOf — get entry label text ****/
    _LabelOf(Id: string): string;
    /**** _setLabelOf — set entry label text ****/
    _setLabelOf(Id: string, Value: string): void;
    /**** _TypeOf — get note MIME type ****/
    _TypeOf(Id: string): string;
    /**** _setTypeOf — set note MIME type ****/
    _setTypeOf(Id: string, Value: string): void;
    /**** _ValueKindOf — get note value kind ****/
    _ValueKindOf(Id: string): 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    /**** _isLiteralOf — check if note has literal value ****/
    _isLiteralOf(Id: string): boolean;
    /**** _isBinaryOf — check if note has binary value ****/
    _isBinaryOf(Id: string): boolean;
    /**** _readValueOf — get note value (literal or binary) ****/
    _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    /**** _writeValueOf — set note value ****/
    _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    /**** _spliceValueOf — modify literal value range ****/
    _spliceValueOf(Id: string, fromIndex: number, toIndex: number, Replacement: string): void;
    /**** _InfoProxyOf — get info metadata proxy object ****/
    _InfoProxyOf(Id: string): Record<string, unknown>;
    /**** _outerNoteOf — get outer note ****/
    _outerNoteOf(Id: string): SNS_Note | undefined;
    /**** _outerNoteIdOf — get outer note ID ****/
    _outerNoteIdOf(Id: string): string | undefined;
    /**** _outerNotesOf — get ancestor chain ****/
    _outerNotesOf(Id: string): SNS_Note[];
    /**** _outerNoteIdsOf — get ancestor IDs ****/
    _outerNoteIdsOf(Id: string): string[];
    /**** _innerEntriesOf — get sorted children as array-like proxy ****/
    _innerEntriesOf(NoteId: string): SNS_Entry[];
    /**** _mayMoveEntryTo — check move validity ****/
    _mayMoveEntryTo(Id: string, outerNoteId: string, _InsertionIndex?: number): boolean;
    /**** _mayDeleteEntry — check delete validity ****/
    _mayDeleteEntry(Id: string): boolean;
    /**** _TargetOf — get link target note ****/
    _TargetOf(Id: string): SNS_Note;
    /**** _EntryAsJSON — serialize entry and subtree ****/
    _EntryAsJSON(Id: string): unknown;
}

declare interface SNS_NoteStore_2 {
    readonly currentCursor: SNS_SyncCursor;
    /**** onChangeInvoke — registers a change listener, returns unsubscribe fn ****/
    onChangeInvoke(Handler: ChangeHandler_2): () => void;
    /**** exportPatch — exports changes since sinceCursor; full snapshot if omitted ****/
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    /**** applyRemotePatch - apply patch from a remote peer ****/
    applyRemotePatch(encodedPatch: Uint8Array): void;
    /**** asBinary — serialise entire store as compressed binary (for checkpoints) ****/
    asBinary(): Uint8Array;
}

export declare interface SNS_NoteStoreOptions {
    LiteralSizeLimit?: number;
    TrashTTLms?: number;
    TrashCheckIntervalMs?: number;
}

export declare type SNS_PatchSeqNumber = number;

export declare interface SNS_PersistenceProvider {
    /**** loadSnapshot — load most recent full snapshot, or undefined if none exists ****/
    loadSnapshot(): Promise<Uint8Array | undefined>;
    /**** saveSnapshot — persist a full snapshot, replacing any previous one ****/
    saveSnapshot(Data: Uint8Array): Promise<void>;
    /**** loadPatchesSince — load all patches with SeqNumber > given value ****/
    loadPatchesSince(SeqNumber: SNS_PatchSeqNumber): Promise<Uint8Array[]>;
    /**** appendPatch — append a patch at the given sequence position ****/
    appendPatch(Patch: Uint8Array, SeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** prunePatches — delete all patches with SeqNumber < given value ****/
    prunePatches(beforeSeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** loadValue — load a large value blob by its SHA-256 hex hash ****/
    loadValue(ValueHash: string): Promise<Uint8Array | undefined>;
    /**** saveValue — store a large value blob under its SHA-256 hex hash ****/
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    /**** releaseValue — decrement ref-count; delete the blob when it reaches zero ****/
    releaseValue(ValueHash: string): Promise<void>;
    /**** close — release all held resources ****/
    close(): Promise<void>;
}

export declare interface SNS_PresenceProvider {
    /**** sendLocalState — broadcast the local client's presence state to all peers ****/
    sendLocalState(localPresenceState: SNS_LocalPresenceState): void;
    /**** onRemoteState — subscribe to peer state updates; State===undefined means offline ****/
    onRemoteState(Callback: (PeerID: string, State: SNS_RemotePresenceState | undefined) => void): () => void;
    readonly PeerSet: ReadonlyMap<string, SNS_RemotePresenceState>;
}

export declare interface SNS_RemotePresenceState extends SNS_LocalPresenceState {
    PeerId: string;
    lastSeen: number;
}

/*******************************************************************************
 *                                                                              *
 *                          SNS_PersistenceProvider                             *
 *                                                                              *
 *******************************************************************************/
export declare type SNS_SyncCursor = Uint8Array;

export declare class SNS_SyncEngine {
    #private;
    readonly PeerId: string;
    constructor(Store: SNS_NoteStore_2, Options?: SNS_SyncEngineOptions);
    /**** start ****/
    start(): Promise<void>;
    /**** stop ****/
    stop(): Promise<void>;
    /**** connectTo ****/
    connectTo(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
    /**** disconnect ****/
    disconnect(): void;
    /**** reconnect ****/
    reconnect(): Promise<void>;
    /**** ConnectionState ****/
    get ConnectionState(): SNS_ConnectionState;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SNS_ConnectionState) => void): () => void;
    /**** setPresenceTo ****/
    setPresenceTo(State: Omit<SNS_LocalPresenceState, never>): void;
    /**** PeerSet (remote peers only) ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
    /**** onPresenceChange ****/
    onPresenceChange(Callback: (PeerId: string, State: SNS_RemotePresenceState | undefined, Origin: 'local' | 'remote') => void): () => void;
}

export declare interface SNS_SyncEngineOptions {
    PersistenceProvider?: SNS_PersistenceProvider;
    NetworkProvider?: SNS_NetworkProvider;
    PresenceProvider?: SNS_PresenceProvider;
    BroadcastChannel?: boolean;
    PresenceTimeoutMs?: number;
}

export declare class SNS_WebRTCProvider implements SNS_NetworkProvider, SNS_PresenceProvider {
    #private;
    readonly StoreID: string;
    /**** Constructor ****/
    constructor(StoreId: string, Options?: SNS_WebRTCProviderOptions);
    /**** ConnectionState ****/
    get ConnectionState(): SNS_ConnectionState;
    /**** connect ****/
    connect(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
    /**** disconnect ****/
    disconnect(): void;
    /**** sendPatch ****/
    sendPatch(Patch: Uint8Array): void;
    /**** sendValue ****/
    sendValue(ValueHash: string, Data: Uint8Array): void;
    /**** requestValue ****/
    requestValue(ValueHash: string): void;
    /**** onPatch ****/
    onPatch(Callback: (Patch: Uint8Array) => void): () => void;
    /**** onValue ****/
    onValue(Callback: (Hash: string, Data: Uint8Array) => void): () => void;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SNS_ConnectionState) => void): () => void;
    /**** sendLocalState ****/
    sendLocalState(State: SNS_LocalPresenceState): void;
    /**** onRemoteState ****/
    onRemoteState(Callback: (PeerId: string, State: SNS_RemotePresenceState | undefined) => void): () => void;
    /**** PeerSet ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
}

export declare interface SNS_WebRTCProviderOptions {
    ICEServers?: RTCIceServer[];
    Fallback?: SNS_WebSocketProvider;
}

export declare class SNS_WebSocketProvider implements SNS_NetworkProvider, SNS_PresenceProvider {
    #private;
    readonly StoreID: string;
    /**** constructor ****/
    constructor(StoreId: string);
    /**** ConnectionState ****/
    get ConnectionState(): SNS_ConnectionState;
    /**** connect ****/
    connect(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
    /**** disconnect ****/
    disconnect(): void;
    /**** sendPatch ****/
    sendPatch(Patch: Uint8Array): void;
    /**** sendValue ****/
    sendValue(ValueHash: string, Data: Uint8Array): void;
    /**** requestValue ****/
    requestValue(ValueHash: string): void;
    /**** onPatch ****/
    onPatch(Callback: (Patch: Uint8Array) => void): () => void;
    /**** onValue ****/
    onValue(Callback: (ValueHash: string, Value: Uint8Array) => void): () => void;
    /**** onConnectionChange ****/
    onConnectionChange(Callback: (State: SNS_ConnectionState) => void): () => void;
    /**** sendLocalState ****/
    sendLocalState(State: SNS_LocalPresenceState): void;
    /**** onRemoteState ****/
    onRemoteState(Callback: (PeerId: string, State: SNS_RemotePresenceState | undefined) => void): () => void;
    /**** PeerSet ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
}

declare type StoreBackend = SNS_NoteStore_2 & Record<string, any>;

export { }
