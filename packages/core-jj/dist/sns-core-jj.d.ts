import { Patch } from 'json-joy/lib/json-crdt-patch/index.js';
import { SNS_ChangeSet } from '@rozek/sns-core';
import { SNS_ChangeSet as SNS_ChangeSet_2 } from '../changeset/SNS_ChangeSet.js';
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
import { SNS_SyncCursor as SNS_SyncCursor_2 } from '../interfaces/SNS_PersistenceProvider.js';

export declare type ChangeHandler = (Origin: ChangeOrigin, ChangeSet: SNS_ChangeSet_2) => void;

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
