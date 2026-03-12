/*******************************************************************************
*                                                                              *
*                         SDS Core YJS — Y.js backend                          *
*                                                                              *
* Exports the complete public API for the Y.js CRDT backend.                   *
* The API surface is intentionally identical to @rozek/sds-core so that        *
* application code can switch backends without changing import paths.           *
*                                                                              *
*******************************************************************************/

// Y.js-specific classes (full implementations)
export { SDS_Error }                from '@rozek/sds-core'
export { SDS_Entry }                from './store/SDS_Entry.js'
export { SDS_Item }                 from './store/SDS_Item.js'
export { SDS_Link }                 from './store/SDS_Link.js'
export { SDS_DataStore }            from './store/SDS_DataStore.js'
export type { SDS_DataStoreOptions, ChangeOrigin, ChangeHandler } from './store/SDS_DataStore.js'

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
