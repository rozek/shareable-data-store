/*******************************************************************************
*                                                                              *
*                      SNS Core JJ — json-joy backend                          *
*                                                                              *
* Exports the complete public API for the json-joy CRDT backend.               *
* The API surface is intentionally identical to @rozek/sns-core-yjs and        *
* @rozek/sns-core-loro so that application code can switch backends without    *
* changing import paths.                                                        *
*                                                                              *
*******************************************************************************/

// json-joy-specific classes (full implementations)
export { SNS_Entry }                from './store/SNS_Entry.js'
export { SNS_Note }                 from './store/SNS_Note.js'
export { SNS_Link }                 from './store/SNS_Link.js'
export { SNS_NoteStore }            from './store/SNS_NoteStore.js'
export type { SNS_NoteStoreOptions, ChangeOrigin, ChangeHandler } from './store/SNS_NoteStore.js'

// backend-agnostic types (re-exported from @rozek/sns-core)
export { SNS_Error }                from '@rozek/sns-core'
export type { SNS_ChangeSet }       from '@rozek/sns-core'
export type { SNS_EntryChangeSet }  from '@rozek/sns-core'
export type { SNS_SyncCursor, SNS_PatchSeqNumber, SNS_PersistenceProvider } from '@rozek/sns-core'
export type {
  SNS_NetworkProvider,
  SNS_ConnectionOptions,
  SNS_ConnectionState,
}                                   from '@rozek/sns-core'
export type { SNS_PresenceProvider, SNS_LocalPresenceState, SNS_RemotePresenceState } from '@rozek/sns-core'
