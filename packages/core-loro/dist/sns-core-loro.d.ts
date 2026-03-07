import { SNS_ChangeSet } from '@rozek/sns-core';
import { SNS_ConnectionOptions } from '@rozek/sns-core';
import { SNS_ConnectionState } from '@rozek/sns-core';
import { SNS_Entry } from '@rozek/sns-core';
import { SNS_EntryChangeSet } from '@rozek/sns-core';
import { SNS_Error } from '@rozek/sns-core';
import { SNS_Link } from '@rozek/sns-core';
import { SNS_LocalPresenceState } from '@rozek/sns-core';
import { SNS_NetworkProvider } from '@rozek/sns-core';
import { SNS_Note } from '@rozek/sns-core';
import { SNS_PatchSeqNumber } from '@rozek/sns-core';
import { SNS_PersistenceProvider } from '@rozek/sns-core';
import { SNS_PresenceProvider } from '@rozek/sns-core';
import { SNS_RemotePresenceState } from '@rozek/sns-core';
import { SNS_SyncCursor } from '@rozek/sns-core';

export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet) => void;

export declare type ChangeOrigin = 'internal' | 'external';

export { SNS_ChangeSet }

export { SNS_ConnectionOptions }

export { SNS_ConnectionState }

export { SNS_Entry }

export { SNS_EntryChangeSet }

export { SNS_Error }

export { SNS_Link }

export { SNS_LocalPresenceState }

export { SNS_NetworkProvider }

export { SNS_Note }

export declare class SNS_NoteStore {
    #private;
    private constructor();
    /**** fromScratch — create a new store with root, trash, and lost-and-found notes ****/
    static fromScratch(Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromBinary — restore store from gzip-compressed binary data ****/
    static fromBinary(Data: Uint8Array, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** fromJSON — restore store from base64-encoded JSON representation ****/
    static fromJSON(Data: unknown, Options?: SNS_NoteStoreOptions): SNS_NoteStore;
    /**** RootNote / TrashNote / LostAndFoundNote — well-known note accessors ****/
    get RootNote(): SNS_Note;
    get TrashNote(): SNS_Note;
    get LostAndFoundNote(): SNS_Note;
    /**** EntryWithId — retrieve an entry by ID ****/
    EntryWithId(EntryId: string): SNS_Entry | undefined;
    /**** newNoteAt — create a new note within an outer note ****/
    newNoteAt(OuterNote: SNS_Note, Type?: string, InsertionIndex?: number): SNS_Note;
    /**** newLinkAt — create a new link within an outer note ****/
    newLinkAt(Target: SNS_Note, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** deserializeNoteInto — restore a note from serialized representation ****/
    deserializeNoteInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Note;
    /**** deserializeLinkInto — restore a link from serialized representation ****/
    deserializeLinkInto(Serialization: unknown, OuterNote: SNS_Note, InsertionIndex?: number): SNS_Link;
    /**** EntryMayBeMovedTo — check if an entry can be moved to an outer note ****/
    EntryMayBeMovedTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): boolean;
    /**** moveEntryTo — move an entry to a different outer note ****/
    moveEntryTo(Entry: SNS_Entry, OuterNote: SNS_Note, InsertionIndex?: number): void;
    /**** EntryMayBeDeleted — check if an entry can be deleted ****/
    EntryMayBeDeleted(Entry: SNS_Entry): boolean;
    /**** deleteEntry — move an entry to trash ****/
    deleteEntry(Entry: SNS_Entry): void;
    /**** purgeEntry — permanently delete a trash entry ****/
    purgeEntry(Entry: SNS_Entry): void;
    /**** purgeExpiredTrashEntries — auto-purge trash entries older than TTL ****/
    purgeExpiredTrashEntries(TTLms?: number): number;
    /**** dispose — cleanup and stop background timers ****/
    dispose(): void;
    /**** transact — execute operations within a batch transaction ****/
    transact(Callback: () => void): void;
    /**** onChangeInvoke — register a change listener and return unsubscribe function ****/
    onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** applyRemotePatch — merge remote changes and rebuild indices ****/
    applyRemotePatch(encodedPatch: Uint8Array): void;
    /**** currentCursor — get current version vector as sync cursor ****/
    get currentCursor(): SNS_SyncCursor;
    /**** exportPatch — generate a change patch since a given cursor ****/
    exportPatch(sinceCursor?: SNS_SyncCursor): Uint8Array;
    /**** recoverOrphans — move entries with missing parents to lost-and-found ****/
    recoverOrphans(): void;
    /**** asBinary — export store as gzip-compressed Loro snapshot ****/
    asBinary(): Uint8Array;
    /**** asJSON — export store as base64-encoded binary ****/
    asJSON(): string;
    /**** _KindOf — get entry kind (note or link) ****/
    _KindOf(Id: string): 'note' | 'link';
    /**** _LabelOf — get entry label text ****/
    _LabelOf(Id: string): string;
    /**** _setLabelOf — set entry label text ****/
    _setLabelOf(Id: string, Value: string): void;
    /**** _TypeOf — get entry MIME type ****/
    _TypeOf(Id: string): string;
    /**** _setTypeOf — set entry MIME type ****/
    _setTypeOf(Id: string, Value: string): void;
    /**** _ValueKindOf — get value kind (none, literal, binary, reference types) ****/
    _ValueKindOf(Id: string): 'none' | 'literal' | 'binary' | 'binary-reference' | 'literal-reference' | 'pending';
    /**** _isLiteralOf — check if value is a literal string ****/
    _isLiteralOf(Id: string): boolean;
    /**** _isBinaryOf — check if value is binary data ****/
    _isBinaryOf(Id: string): boolean;
    /**** _readValueOf — read entry value (literal or binary) ****/
    _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    /**** _writeValueOf — write entry value with automatic storage strategy ****/
    _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    /**** _spliceValueOf — modify literal value text at a range ****/
    _spliceValueOf(Id: string, fromIndex: number, toIndex: number, Replacement: string): void;
    /**** _InfoProxyOf — get proxy for arbitrary metadata object ****/
    _InfoProxyOf(Id: string): Record<string, unknown>;
    /**** _outerNoteOf — get the outer note ****/
    _outerNoteOf(Id: string): SNS_Note | undefined;
    /**** _outerNoteIdOf — get outer note ID or undefined ****/
    _outerNoteIdOf(Id: string): string | undefined;
    /**** _outerNotesOf — get ancestor chain from entry to root ****/
    _outerNotesOf(Id: string): SNS_Note[];
    /**** _outerNoteIdsOf — get ancestor IDs from entry to root ****/
    _outerNoteIdsOf(Id: string): string[];
    /**** _innerEntriesOf — get inner entries as proxy-wrapped array ****/
    _innerEntriesOf(NoteId: string): SNS_Entry[];
    /**** _mayMoveEntryTo — check if entry can be moved without cycles ****/
    _mayMoveEntryTo(Id: string, outerNoteId: string, _InsertionIndex?: number): boolean;
    /**** _mayDeleteEntry — check if entry is deletable ****/
    _mayDeleteEntry(Id: string): boolean;
    /**** _TargetOf — get the target note for a link ****/
    _TargetOf(Id: string): SNS_Note;
    /**** _EntryAsJSON — serialize entry and subtree to JSON ****/
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
