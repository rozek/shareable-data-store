/*******************************************************************************
*                                                                              *
*                       SNS Core Loro — Loro CRDT backend                      *
*                                                                              *
* Exports the complete public API for the Loro CRDT backend.                   *
* The API surface is intentionally identical to @rozek/sns-core so that        *
* application code can switch backends without changing import paths.           *
*                                                                              *
*******************************************************************************/

// Loro-specific classes (full implementations)
export { SNS_Error }                from './error/SNS_Error.js'
export { SNS_Entry }                from './store/SNS_Entry.js'
export { SNS_Note }                 from './store/SNS_Note.js'
export { SNS_Link }                 from './store/SNS_Link.js'
export { SNS_NoteStore }            from './store/SNS_NoteStore.js'
export type { SNS_NoteStoreOptions, ChangeOrigin, ChangeHandler } from './store/SNS_NoteStore.js'

// changeset types (backend-agnostic — copied locally)
export type { SNS_ChangeSet }      from './changeset/SNS_ChangeSet.js'
export type { SNS_EntryChangeSet } from './changeset/SNS_EntryChangeSet.js'

// persistence & network interfaces (backend-agnostic — re-exported from sns-core)
export type { SNS_SyncCursor, SNS_PatchSeqNumber, SNS_PersistenceProvider } from '@rozek/sns-core'
export type {
  SNS_NetworkProvider,
  SNS_ConnectionOptions,
  SNS_ConnectionState,
}                                 from '@rozek/sns-core'
export type { SNS_PresenceProvider, SNS_LocalPresenceState, SNS_RemotePresenceState } from '@rozek/sns-core'
