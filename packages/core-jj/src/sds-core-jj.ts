/*******************************************************************************
*                                                                              *
*                      SNS Core JJ — json-joy backend                          *
*                                                                              *
* Exports the complete public API for the json-joy CRDT backend.               *
* The API surface is intentionally identical to @rozek/sds-core-yjs and        *
* @rozek/sds-core-loro so that application code can switch backends without    *
* changing import paths.                                                        *
*                                                                              *
*******************************************************************************/

// json-joy-specific classes (full implementations)
export { SDS_Entry }                from './store/SDS_Entry.js'
export { SDS_Note }                 from './store/SDS_Note.js'
export { SDS_Link }                 from './store/SDS_Link.js'
export { SDS_NoteStore }            from './store/SDS_NoteStore.js'
export type { SDS_NoteStoreOptions, ChangeOrigin, ChangeHandler } from './store/SDS_NoteStore.js'

// backend-agnostic types (re-exported from @rozek/sds-core)
export { SDS_Error }                from '@rozek/sds-core'
export type { SDS_ChangeSet }       from '@rozek/sds-core'
export type { SDS_EntryChangeSet }  from '@rozek/sds-core'
export type { SDS_SyncCursor, SDS_PatchSeqNumber, SDS_PersistenceProvider } from '@rozek/sds-core'
export type {
  SDS_NetworkProvider,
  SDS_ConnectionOptions,
  SDS_ConnectionState,
}                                   from '@rozek/sds-core'
export type { SDS_PresenceProvider, SDS_LocalPresenceState, SDS_RemotePresenceState } from '@rozek/sds-core'
