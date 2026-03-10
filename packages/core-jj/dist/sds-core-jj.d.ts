import { ChangeHandler } from '@rozek/sds-core';
import { ChangeOrigin } from '@rozek/sds-core';
import { Patch } from 'json-joy/lib/json-crdt-patch/index.js';
import { SDS_ChangeSet } from '@rozek/sds-core';
import { SDS_ConnectionOptions } from '@rozek/sds-core';
import { SDS_ConnectionState } from '@rozek/sds-core';
import { SDS_DataStore as SDS_DataStore_2 } from '@rozek/sds-core';
import { SDS_DataStoreOptions } from '@rozek/sds-core';
import { SDS_Entry } from '@rozek/sds-core';
import { SDS_EntryChangeSet } from '@rozek/sds-core';
import { SDS_Error } from '@rozek/sds-core';
import { SDS_Item } from '@rozek/sds-core';
import { SDS_Link } from '@rozek/sds-core';
import { SDS_LocalPresenceState } from '@rozek/sds-core';
import { SDS_NetworkProvider } from '@rozek/sds-core';
import { SDS_PatchSeqNumber } from '@rozek/sds-core';
import { SDS_PersistenceProvider } from '@rozek/sds-core';
import { SDS_PresenceProvider } from '@rozek/sds-core';
import { SDS_RemotePresenceState } from '@rozek/sds-core';
import { SDS_SyncCursor } from '@rozek/sds-core';

export { ChangeHandler }

export { ChangeOrigin }

export { SDS_ChangeSet }

export { SDS_ConnectionOptions }

export { SDS_ConnectionState }

export declare class SDS_DataStore extends SDS_DataStore_2 {
    #private;
    /**** constructor — initialize store with model and configuration ****/
    private constructor();
    /**** fromScratch — create store from canonical empty snapshot ****/
    static fromScratch(Options?: SDS_DataStoreOptions): SDS_DataStore;
    /**** fromBinary — deserialize store from binary snapshot ****/
    static fromBinary(Serialisation: Uint8Array, Options?: SDS_DataStoreOptions): SDS_DataStore;
    /**** fromJSON — deserialize store from a plain JSON object or JSON string ****/
    static fromJSON(Serialisation: unknown, Options?: SDS_DataStoreOptions): SDS_DataStore;
    /**** RootItem / TrashItem / LostAndFoundItem — access special items ****/
    get RootItem(): SDS_Item;
    get TrashItem(): SDS_Item;
    get LostAndFoundItem(): SDS_Item;
    /**** EntryWithId — retrieve entry by id ****/
    EntryWithId(Id: string): SDS_Entry | undefined;
    /**** newItemAt — create a new item of given type as inner entry of outerItem ****/
    newItemAt(MIMEType: string | undefined, outerItem: SDS_Item, InsertionIndex?: number): SDS_Item;
    /**** newLinkAt — create new link in specified location ****/
    newLinkAt(Target: SDS_Item, outerItem: SDS_Item, InsertionIndex?: number): SDS_Link;
    /**** deserializeItemInto — import a serialised item subtree; always remaps IDs ****/
    deserializeItemInto(Serialisation: unknown, outerItem: SDS_Item, InsertionIndex?: number): SDS_Item;
    /**** deserializeLinkInto — import a serialised link; always assigns a new Id ****/
    deserializeLinkInto(Serialisation: unknown, outerItem: SDS_Item, InsertionIndex?: number): SDS_Link;
    /**** moveEntryTo — move entry to new location in tree ****/
    moveEntryTo(Entry: SDS_Entry, outerItem: SDS_Item, Index?: number): void;
    /**** _rebalanceInnerEntriesOf — backend-specific raw rebalance; caller must hold a transaction ****/
    _rebalanceInnerEntriesOf(outerItemId: string): void;
    /**** deleteEntry — move entry to trash ****/
    deleteEntry(Entry: SDS_Entry): void;
    /**** purgeEntry — permanently delete entry from trash ****/
    purgeEntry(Entry: SDS_Entry): void;
    /**** purgeExpiredTrashEntries — delete trash entries older than TTL ****/
    purgeExpiredTrashEntries(TrashTTL?: number): number;
    /**** dispose — clean up resources ****/
    dispose(): void;
    /**** transact — execute callback within transaction ****/
    transact(Callback: () => void): void;
    /**** onChangeInvoke — register change listener ****/
    onChangeInvoke(Handler: ChangeHandler): () => void;
    /**** applyRemotePatch — apply external patch to model ****/
    applyRemotePatch(Patch_: Patch | Uint8Array): void;
    /**** currentCursor — get current sync position ****/
    get currentCursor(): SDS_SyncCursor;
    /**** exportPatch — export patches since given cursor ****/
    exportPatch(Origin?: SDS_SyncCursor): Uint8Array;
    /**** recoverOrphans — move orphaned entries to LostAndFound ****/
    recoverOrphans(): void;
    /**** asBinary — serialize store to gzipped binary ****/
    asBinary(): Uint8Array;
    /**** newEntryFromBinaryAt — import a gzip-compressed entry (item or link) ****/
    newEntryFromBinaryAt(Serialisation: Uint8Array, outerItem: SDS_Item, InsertionIndex?: number): SDS_Entry;
    /**** _EntryAsBinary — gzip-compress the JSON representation of an entry ****/
    _EntryAsBinary(Id: string): Uint8Array;
    /**** get — proxy handler for property access ****/
    get(Target: any, Property: string | symbol): any;
    /**** set / deleteProperty / ownKeys / getOwnPropertyDescriptor — proxy traps ****/
    set(): boolean;
    deleteProperty(): boolean;
    ownKeys(): string[];
    getOwnPropertyDescriptor(): PropertyDescriptor | undefined;
    /**** _KindOf — get entry kind (data or link) ****/
    _KindOf(Id: string): 'item' | 'link';
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
    /**** _readValueOf — read entry value ****/
    _readValueOf(Id: string): Promise<string | Uint8Array | undefined>;
    /**** _currentValueOf — synchronously return the inline value of an item, or undefined ****/
    _currentValueOf(Id: string): string | Uint8Array | undefined;
    /**** _writeValueOf — write entry value ****/
    _writeValueOf(Id: string, Value: string | Uint8Array | undefined): void;
    /**** _spliceValueOf — modify literal value in-place ****/
    _spliceValueOf(Id: string, Index: number, DeleteCount: number, Insertion: string): void;
    /**** _innerEntriesOf — get sorted inner entries ****/
    _innerEntriesOf(Id: string): SDS_Entry[];
    /**** _outerItemIdOf — get outer data id ****/
    _outerItemIdOf(Id: string): string | undefined;
    /**** _getValueRefOf — return the ValueRef for *-reference entries ****/
    _getValueRefOf(Id: string): {
        Hash: string;
        Size: number;
    } | undefined;
    /**** _InfoProxyOf — get proxy for metadata access ****/
    _InfoProxyOf(Id: string): Record<string, unknown>;
    /**** _TargetOf — get link target data ****/
    _TargetOf(Id: string): SDS_Item;
    /**** _mayMoveEntryTo — check if move is valid ****/
    _mayMoveEntryTo(EntryId: string, outerItemId: string, Index?: number): boolean;
    /**** _mayDeleteEntry — check if entry can be deleted ****/
    _mayDeleteEntry(EntryId: string): boolean;
}

export { SDS_DataStoreOptions }

export { SDS_Entry }

export { SDS_EntryChangeSet }

export { SDS_Error }

export { SDS_Item }

export { SDS_Link }

export { SDS_LocalPresenceState }

export { SDS_NetworkProvider }

export { SDS_PatchSeqNumber }

export { SDS_PersistenceProvider }

export { SDS_PresenceProvider }

export { SDS_RemotePresenceState }

export { SDS_SyncCursor }

export { }
