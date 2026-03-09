/*******************************************************************************
*                                                                              *
*                          SDS_PersistenceProvider                             *
*                                                                              *
*******************************************************************************/

// implementations: SDS_BrowserPersistenceProvider (IndexedDB),
//                  SDS_DesktopPersistenceProvider (SQLite)

// SDS_SyncCursor is an opaque byte sequence identifying a position in the CRDT 
// patch log. Its internal layout is CRDT-backend-specific and is therefore never
// interpreted by the persistence or network layers:
//  – json-joy backend: 4-byte big-endian uint32
//  – Y.js backend:     state vector (variable length)
//  – Loro backend:     version vector (variable length)
// SDS_SyncCursor is used exclusively by SDS_NoteStore.exportPatch() and
// SDS_NoteStore.currentCursor — not by SDS_PersistenceProvider.

export type SDS_SyncCursor = Uint8Array

// SDS_PatchSeqNumber is a plain integer maintained by SDS_SyncEngine. It counts 
// patches appended since the last checkpoint and serves as the ordering key in 
// the persistence layer. It is entirely independent of the CRDT backend's cursor
// format.
export type SDS_PatchSeqNumber = number

export interface SDS_PersistenceProvider {

/**** loadSnapshot — load most recent full snapshot, or undefined if none exists ****/

  loadSnapshot ():Promise<Uint8Array | undefined>

/**** saveSnapshot — persist a full snapshot, replacing any previous one ****/

  saveSnapshot (Data:Uint8Array):Promise<void>

/**** loadPatchesSince — load all patches with SeqNumber > given value ****/

  loadPatchesSince (SeqNumber:SDS_PatchSeqNumber):Promise<Uint8Array[]>

/**** appendPatch — append a patch at the given sequence position ****/

  appendPatch (Patch:Uint8Array, SeqNumber:SDS_PatchSeqNumber):Promise<void>

/**** prunePatches — delete all patches with SeqNumber < given value ****/

  prunePatches (beforeSeqNumber:SDS_PatchSeqNumber):Promise<void>

/**** loadValue — load a large value blob by its SHA-256 hex hash ****/

  loadValue (ValueHash:string):Promise<Uint8Array | undefined>

/**** saveValue — store a large value blob under its SHA-256 hex hash ****/

  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>

/**** releaseValue — decrement ref-count; delete the blob when it reaches zero ****/

  releaseValue (ValueHash:string):Promise<void>

/**** close — release all held resources ****/

  close ():Promise<void>
}
