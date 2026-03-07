export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void;

export declare type ChangeOrigin = 'internal' | 'external';

export declare const DefaultBinarySizeLimit = 2048;

export declare const DefaultLiteralSizeLimit = 131072;

export declare const DefaultMIMEType = "text/plain";

export declare const DefaultWrapperCacheSize = 5000;

export declare const LostAndFoundId = "00000000-0000-4000-8000-000000000002";

/*******************************************************************************
 *                                                                              *
 *                            SNS Store — Constants                             *
 *                                                                              *
 *******************************************************************************/
export declare const RootId = "00000000-0000-4000-8000-000000000000";

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
    constructor(Store: SNS_NoteStore & Record<string, any>, Id: string);
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
    constructor(Store: SNS_NoteStore & Record<string, any>, Id: string);
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

export declare interface SNS_NoteStore {
    readonly currentCursor: SNS_SyncCursor;
    /**** onChangeInvoke — registers a change listener, returns unsubscribe fn ****/
    onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** exportPatch — exports changes since sinceCursor; full snapshot if omitted ****/
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    /**** applyRemotePatch - apply patch from a remote peer ****/
    applyRemotePatch(encodedPatch: Uint8Array): void;
    /**** asBinary — serialise entire store as compressed binary (for checkpoints) ****/
    asBinary(): Uint8Array;
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

declare type StoreBackend = SNS_NoteStore & Record<string, any>;

export declare const TrashId = "00000000-0000-4000-8000-000000000001";

export { }
