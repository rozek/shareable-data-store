import { Patch } from 'json-joy/lib/json-crdt-patch/index.js';
import { SNS_ChangeSet as SNS_ChangeSet_2 } from '../changeset/SNS_ChangeSet.js';
import { SNS_SyncCursor as SNS_SyncCursor_2 } from '../interfaces/SNS_PersistenceProvider.js';

export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet_2) => void;

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
    /**** constructor — initialize store with model and configuration ****/
    private constructor();
    /**** fromScratch — create store from canonical empty snapshot ****/
    static fromScratch(Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromBinary — deserialize store from binary snapshot ****/
    static fromBinary(Binary: Uint8Array, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromJSON — deserialize store from base64-encoded JSON snapshot ****/
    static fromJSON(JSON_: string, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** RootNote / TrashNote / LostAndFoundNote — access special notes ****/
    get RootNote(): SNS_Note;
    get TrashNote(): SNS_Note;
    get LostAndFoundNote(): SNS_Note;
    /**** EntryWithId — retrieve entry by id ****/
    EntryWithId(Id: string): SNS_Entry | undefined;
    /**** newNoteAt — create new note in specified location ****/
    newNoteAt(OuterNote: SNS_Note, MIMEType?: string, InsertionIndex?: number): SNS_Note;
    /**** newLinkAt — create new link in specified location ****/
    newLinkAt(TargetNote: SNS_Note, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** deserializeNoteInto — deserialize note from JSON into tree ****/
    deserializeNoteInto(Data: any, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Note;
    /**** deserializeLinkInto — deserialize link from JSON into tree ****/
    deserializeLinkInto(Data: any, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** EntryMayBeMovedTo — check if entry can be moved to target ****/
    EntryMayBeMovedTo(Entry: SNS_Entry, OuterNote: SNS_Note, Index?: number): boolean;
    /**** moveEntryTo — move entry to new location in tree ****/
    moveEntryTo(Entry: SNS_Entry, OuterNote: SNS_Note, Index?: number): void;
    /**** EntryMayBeDeleted — check if entry can be deleted ****/
    EntryMayBeDeleted(Entry: SNS_Entry): boolean;
    /**** deleteEntry — move entry to trash ****/
    deleteEntry(Entry: SNS_Entry): void;
    /**** purgeEntry — permanently delete entry from trash ****/
    purgeEntry(Entry: SNS_Entry): void;
    /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
    purgeExpiredTrashEntries(TrashTTL?: number): number;
    /**** dispose — clean up resources ****/
    dispose(): void;
    /**** transact — execute callback within transaction ****/
    transact<T>(Callback: () => T): T;
    /**** onChangeInvoke — register change listener ****/
    onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** applyRemotePatch — apply external patch to model ****/
    applyRemotePatch(Patch_: Patch | Uint8Array): void;
    /**** currentCursor — get current sync position ****/
    get currentCursor(): SNS_SyncCursor_2;
    /**** exportPatch — export patches since given cursor ****/
    exportPatch(Origin?: SNS_SyncCursor_2): Uint8Array;
    /**** recoverOrphans — move orphaned entries to LostAndFound ****/
    recoverOrphans(): void;
    /**** asBinary — serialize store to gzipped binary ****/
    asBinary(): Uint8Array;
    /**** asJSON — serialize store to base64-encoded binary ****/
    asJSON(): string;
    /**** get — proxy handler for property access ****/
    get(target: any, property: string | symbol): any;
    /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
    set(): boolean;
    deleteProperty(): boolean;
    ownKeys(): string[];
    getOwnPropertyDescriptor(): PropertyDescriptor | undefined;
    /**** _KindOf — get entry kind (note or link) ****/
    _KindOf(Id: string): 'note' | 'link';
    /**** _LabelOf — get entry label ****/
    _LabelOf(Id: string): string;
    /**** _setLabelOf — set entry label ****/
    _setLabelOf(Id: string, Value: string): void;
    /**** _TypeOf — get entry MIME type ****/
    _TypeOf(Id: string): string;
    /**** _setTypeOf — set entry MIME type ****/
    _setTypeOf(Id: string, Value: string): void;
    /**** _ValueKindOf — get value storage kind ****/
    _ValueKindOf(Id: string): 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    /**** _isLiteralOf — check if entry value is literal text ****/
    _isLiteralOf(Id: string): boolean;
    /**** _isBinaryOf — check if entry value is binary ****/
    _isBinaryOf(Id: string): boolean;
    /**** _readValueOf — read entry value ****/
    _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    /**** _writeValueOf — write entry value ****/
    _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    /**** _spliceValueOf — modify literal value in-place ****/
    _spliceValueOf(Id: string, Index: number, DeleteCount: number, Insertion: string): void;
    /**** _innerEntriesOf — get sorted inner entries ****/
    _innerEntriesOf(Id: string): SNS_Entry[];
    /**** _outerNoteOf — get outer note ****/
    _outerNoteOf(Id: string): SNS_Note | undefined;
    /**** _outerNoteIdOf — get outer note id ****/
    _outerNoteIdOf(Id: string): string | null;
    /**** _outerNotesOf — get ancestor note chain ****/
    _outerNotesOf(Id: string): SNS_Note[];
    /**** _outerNoteIdsOf — get ancestor note id chain ****/
    _outerNoteIdsOf(Id: string): string[];
    /**** _InfoProxyOf — get proxy for metadata access ****/
    _InfoProxyOf(Id: string): Record<string, unknown>;
    /**** _TargetOf — get link target note ****/
    _TargetOf(Id: string): SNS_Note | undefined;
    /**** _EntryAsJSON — serialize entry to JSON ****/
    _EntryAsJSON(Id: string): any;
    /**** _mayMoveEntryTo — check if move is valid ****/
    _mayMoveEntryTo(EntryId: string, outerNoteId: string, Index?: number): boolean;
    /**** _mayDeleteEntry — check if entry can be deleted ****/
    _mayDeleteEntry(EntryId: string): boolean;
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
