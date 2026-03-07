/*******************************************************************************
*                                                                              *
*                          SNS_PersistenceProvider                             *
*                                                                              *
*******************************************************************************/

// implementations: SNS_BrowserPersistenceProvider (IndexedDB),
//                  SNS_DesktopPersistenceProvider (SQLite)

// SNS_SyncCursor is an opaque byte sequence identifying a position in the CRDT 
// patch log. Its internal layout is CRDT-backend-specific and is therefore never
// interpreted by the persistence or network layers:
//  – json-joy backend: 4-byte big-endian uint32
//  – Y.js backend:     state vector (variable length)
//  – Loro backend:     version vector (variable length)
// SNS_SyncCursor is used exclusively by SNS_NoteStore.exportPatch() and
// SNS_NoteStore.currentCursor — not by SNS_PersistenceProvider.

export type SNS_SyncCursor = Uint8Array

// SNS_PatchSeqNumber is a plain integer maintained by SNS_SyncEngine. It counts 
// patches appended since the last checkpoint and serves as the ordering key in 
// the persistence layer. It is entirely independent of the CRDT backend's cursor
// format.
export type SNS_PatchSeqNumber = number

export interface SNS_PersistenceProvider {

/**** loadSnapshot — load most recent full snapshot, or undefined if none exists ****/

  loadSnapshot ():Promise<Uint8Array | undefined>

/**** saveSnapshot — persist a full snapshot, replacing any previous one ****/

  saveSnapshot (Data:Uint8Array):Promise<void>

/**** loadPatchesSince — load all patches with SeqNumber > given value ****/

  loadPatchesSince (SeqNumber:SNS_PatchSeqNumber):Promise<Uint8Array[]>

/**** appendPatch — append a patch at the given sequence position ****/

  appendPatch (Patch:Uint8Array, SeqNumber:SNS_PatchSeqNumber):Promise<void>

/**** prunePatches — delete all patches with SeqNumber < given value ****/

  prunePatches (beforeSeqNumber:SNS_PatchSeqNumber):Promise<void>

/**** loadValue — load a large value blob by its SHA-256 hex hash ****/

  loadValue (ValueHash:string):Promise<Uint8Array | undefined>

/**** saveValue — store a large value blob under its SHA-256 hex hash ****/

  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>

/**** releaseValue — decrement ref-count; delete the blob when it reaches zero ****/

  releaseValue (ValueHash:string):Promise<void>

/**** close — release all held resources ****/

  close ():Promise<void>
}
