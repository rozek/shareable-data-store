export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void;

declare type ChangeHandler_2 = (Origin: ChangeOrigin_2, ChangeSet: SNS_ChangeSet_2) => void;

export declare type ChangeOrigin = 'internal' | 'external';

declare type ChangeOrigin_2 = 'internal' | 'external';

export declare class SNS_BrowserPersistenceProvider implements SNS_PersistenceProvider {
    #private;
    /**** constructor ****/
    constructor(StoreId: string);
    /**** loadSnapshot ****/
    loadSnapshot(): Promise<Uint8Array | null>;
    /**** saveSnapshot ****/
    saveSnapshot(Data: Uint8Array): Promise<void>;
    /**** loadPatchesSince ****/
    loadPatchesSince(SeqNumber: SNS_PatchSeqNumber): Promise<Uint8Array[]>;
    /**** appendPatch ****/
    appendPatch(Patch: Uint8Array, SeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** prunePatches ****/
    prunePatches(beforeSeqNumber: SNS_PatchSeqNumber): Promise<void>;
    /**** loadValue ****/
    loadValue(ValueHash: string): Promise<Uint8Array | null>;
    /**** saveValue ****/
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    /**** releaseValue ****/
    releaseValue(ValueHash: string): Promise<void>;
    /**** close ****/
    close(): Promise<void>;
}

export declare type SNS_ChangeSet = Record<string, SNS_EntryChangeSet>;

declare type SNS_ChangeSet_2 = Record<string, SNS_EntryChangeSet_2>;

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
    protected readonly _Store: SNS_NoteStore;
    readonly Id: string;
    constructor(_Store: SNS_NoteStore, Id: string);
    get isRootNote(): boolean;
    get isTrashNote(): boolean;
    get isLostAndFoundNote(): boolean;
    get isNote(): boolean;
    get isLink(): boolean;
    get outerNote(): SNS_Note | undefined;
    get outerNoteId(): string | undefined;
    get outerNotes(): SNS_Note[];
    get outerNoteIds(): string[];
    get Label(): string;
    set Label(Value: string);
    get Info(): Record<string, unknown>;
    mayBeMovedTo(OuterNote: SNS_Note, InsertionIndex?: number): boolean;
    moveTo(OuterNote: SNS_Note, InsertionIndex?: number): void;
    get mayBeDeleted(): boolean;
    delete(): void;
    purge(): void;
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
 * SNS_EntryChangeSet - the set of prop. names that changed for a single entry  *
 *                                                                              *
 *******************************************************************************/
declare type SNS_EntryChangeSet_2 = Set<string>;

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
    constructor(Store: SNS_NoteStore, Id: string);
    get Target(): SNS_Note;
}

/*******************************************************************************
 *                                                                              *
 *                           SNS_PresenceProvider                               *
 *                                                                              *
 *******************************************************************************/
export declare interface SNS_LocalPresenceState {
    UserName?: string;
    UserColor?: string;
    UserFocus?: {
        entryId: string;
        Property: 'Value' | 'Label' | 'Info';
        Cursor?: {
            from: number;
            to: number;
        };
    };
}

export declare interface SNS_NetworkProvider {
    readonly StoreID: string;
    readonly ConnectionState: SNS_ConnectionState;
    connect(URL: string, Options: SNS_ConnectionOptions): Promise<void>;
    disconnect(): void;
    sendPatch(Patch: Uint8Array): void;
    sendValue(ValueHash: string, Data: Uint8Array): void;
    requestValue(ValueHash: string): void;
    onPatch(Callback: (Patch: Uint8Array) => void): () => void;
    onValue(Callback: (ValueHash: string, Value: Uint8Array) => void): () => void;
    onConnectionChange(Callback: (ConnectionState: SNS_ConnectionState) => void): () => void;
}

export declare class SNS_Note extends SNS_Entry {
    constructor(Store: SNS_NoteStore, Id: string);
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
    get innerEntryList(): SNS_Entry[];
}

export declare class SNS_NoteStore {
    #private;
    private constructor();
    static fromScratch(Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    static fromBinary(Data: Uint8Array, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    static fromJSON(Data: unknown, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    get RootNote(): SNS_Note;
    get TrashNote(): SNS_Note;
    get LostAndFoundNote(): SNS_Note;
    EntryWithId(EntryId: string): SNS_Entry | undefined;
    newNoteAt(OuterNote: SNS_Note, Type?: string, InsertionIndex?: number): SNS_Note;
    newLinkAt(Target: SNS_Note, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    deserializeNoteInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Note;
    deserializeLinkInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    EntryMayBeMovedTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): boolean;
    moveEntryTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): void;
    EntryMayBeDeleted(Entry: SNS_Entry): boolean;
    deleteEntry(Entry: SNS_Entry): void;
    purgeEntry(Entry: SNS_Entry): void;
    purgeExpiredTrashEntries(TTLms?: number): number;
    dispose(): void;
    transact(Callback: () => void): void;
    onChangeInvoke(Handler: ChangeHandler): () => void;
    applyRemotePatch(encodedPatch: Uint8Array): void;
    get currentCursor(): SNS_SyncCursor;
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    recoverOrphans(): void;
    asBinary(): Uint8Array;
    asJSON(): string;
    _KindOf(Id: string): 'note' | 'link';
    _LabelOf(Id: string): string;
    _setLabelOf(Id: string, Value: string): void;
    _TypeOf(Id: string): string;
    _setTypeOf(Id: string, Value: string): void;
    _ValueKindOf(Id: string): 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    _isLiteralOf(Id: string): boolean;
    _isBinaryOf(Id: string): boolean;
    _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    _spliceValueOf(Id: string, fromIndex: number, toIndex: number, Replacement: string): void;
    _InfoProxyOf(Id: string): Record<string, unknown>;
    _outerNoteOf(Id: string): SNS_Note | undefined;
    _outerNoteIdOf(Id: string): string | undefined;
    _outerNotesOf(Id: string): SNS_Note[];
    _outerNoteIdsOf(Id: string): string[];
    _innerEntriesOf(NoteId: string): SNS_Entry[];
    _mayMoveEntryTo(Id: string, OuterNoteId: string, _InsertionIndex?: number): boolean;
    _mayDeleteEntry(Id: string): boolean;
    _TargetOf(Id: string): SNS_Note;
    _EntryAsJSON(Id: string): unknown;
}

declare interface SNS_NoteStore_2 {
    /** Opaque cursor identifying the current CRDT state. */
    readonly currentCursor: SNS_SyncCursor;
    /**
     * Register a change listener.
     * Returns an unsubscribe function.
     */
    onChangeInvoke(Handler: ChangeHandler_2): () => void;
    /**
     * Export all changes that occurred after `sinceCursor`.
     * If omitted, exports a full snapshot.
     */
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    /**
     * Apply an encoded patch (from exportPatch) received from a remote peer.
     */
    applyRemotePatch(encodedPatch: Uint8Array): void;
    /**
     * Serialise the entire store as a compressed binary snapshot.
     * Used for checkpoint persistence.
     */
    asBinary(): Uint8Array;
}

export declare interface SNS_NoteStoreOptions {
    LiteralSizeLimit?: number;
    TrashTTLms?: number;
    TrashCheckIntervalMs?: number;
}

export declare type SNS_PatchSeqNumber = number;

export declare interface SNS_PersistenceProvider {
    loadSnapshot(): Promise<Uint8Array | null>;
    saveSnapshot(Data: Uint8Array): Promise<void>;
    loadPatchesSince(SeqNumber: SNS_PatchSeqNumber): Promise<Uint8Array[]>;
    appendPatch(Patch: Uint8Array, SeqNumber: SNS_PatchSeqNumber): Promise<void>;
    prunePatches(beforeSeqNumber: SNS_PatchSeqNumber): Promise<void>;
    loadValue(ValueHash: string): Promise<Uint8Array | null>;
    saveValue(ValueHash: string, Data: Uint8Array): Promise<void>;
    releaseValue(ValueHash: string): Promise<void>;
    close(): Promise<void>;
}

export declare interface SNS_PresenceProvider {
    sendLocalState(localPresenceState: SNS_LocalPresenceState): void;
    /**** onRemoteState — State === null means the peer went offline ****/
    onRemoteState(Callback: (PeerID: string, RemotePresenceState: SNS_RemotePresenceState | null) => void): () => void;
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
    /**** constructor ****/
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
    onRemoteState(Callback: (PeerId: string, State: SNS_RemotePresenceState | null) => void): () => void;
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
    onRemoteState(Callback: (PeerId: string, State: SNS_RemotePresenceState | null) => void): () => void;
    /**** PeerSet ****/
    get PeerSet(): ReadonlyMap<string, SNS_RemotePresenceState>;
}

export { }
