import { SNS_ConnectionOptions } from '@rozek/sns-core';
import { SNS_ConnectionState } from '@rozek/sns-core';
import { SNS_LocalPresenceState } from '@rozek/sns-core';
import { SNS_NetworkProvider } from '@rozek/sns-core';
import { SNS_PatchSeqNumber } from '@rozek/sns-core';
import { SNS_PersistenceProvider } from '@rozek/sns-core';
import { SNS_PresenceProvider } from '@rozek/sns-core';
import { SNS_RemotePresenceState } from '@rozek/sns-core';
import { SNS_SyncCursor } from '@rozek/sns-core';

export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void;

export declare type ChangeOrigin = 'internal' | 'external';

export declare type SNS_ChangeSet = Record<string, SNS_EntryChangeSet>;

export { SNS_ConnectionOptions }

export { SNS_ConnectionState }

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

export { SNS_LocalPresenceState }

export { SNS_NetworkProvider }

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

export declare interface SNS_NoteStoreOptions {
    LiteralSizeLimit?: number;
    TrashTTLms?: number;
    TrashCheckIntervalMs?: number;
}

export { SNS_PatchSeqNumber }

export { SNS_PersistenceProvider }

export { SNS_PresenceProvider }

export { SNS_RemotePresenceState }

export { SNS_SyncCursor }

export { }
