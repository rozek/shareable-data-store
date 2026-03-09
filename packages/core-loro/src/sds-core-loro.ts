/*******************************************************************************
*                                                                              *
*                       SNS Core Loro — Loro CRDT backend                      *
*                                                                              *
* Exports the complete public API for the Loro CRDT backend.                   *
* The API surface is intentionally identical to @rozek/sds-core so that        *
* application code can switch backends without changing import paths.           *
*                                                                              *
*******************************************************************************/

// Loro-specific classes (full implementations)
export { SDS_Error }                from './error/SDS_Error.js'
export { SDS_Entry }                from './store/SDS_Entry.js'
export { SDS_Note }                 from './store/SDS_Note.js'
export { SDS_Link }                 from './store/SDS_Link.js'
export { SDS_NoteStore }            from './store/SDS_NoteStore.js'
export type { SDS_NoteStoreOptions, ChangeOrigin, ChangeHandler } from './store/SDS_NoteStore.js'

// changeset types (backend-agnostic — copied locally)
export type { SDS_ChangeSet }      from './changeset/SDS_ChangeSet.js'
export type { SDS_EntryChangeSet } from './changeset/SDS_EntryChangeSet.js'

// persistence & network interfaces (backend-agnostic — re-exported from sds-core)
export type { SDS_SyncCursor, SDS_PatchSeqNumber, SDS_PersistenceProvider } from '@rozek/sds-core'
export type {
  SDS_NetworkProvider,
  SDS_ConnectionOptions,
  SDS_ConnectionState,
}                                 from '@rozek/sds-core'
export type { SDS_PresenceProvider, SDS_LocalPresenceState, SDS_RemotePresenceState } from '@rozek/sds-core'
