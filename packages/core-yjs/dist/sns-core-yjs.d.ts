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
