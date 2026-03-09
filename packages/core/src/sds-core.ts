/*******************************************************************************
*                                                                              *
*                                  SNS Core                                    *
*                                                                              *
*******************************************************************************/

// backend-agnostic shared types and interfaces, consumed by all SNS backend 
// packages (sds-core-jj, sds-core-yjs, sds-core-loro) and by the infrastructure
// packages (sync-engine, network, persistence).                                                                

export { SDS_Error } from './error/SDS_Error.js'

export {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit,
  DefaultBinarySizeLimit, DefaultWrapperCacheSize,
}                        from './store/constants.js'
export { SDS_Entry }     from './store/SDS_Entry.js'
export { SDS_Note }      from './store/SDS_Note.js'
export { SDS_Link }      from './store/SDS_Link.js'

export type { SDS_ChangeSet }      from './changeset/SDS_ChangeSet.js'
export type { SDS_EntryChangeSet } from './changeset/SDS_EntryChangeSet.js'

export type { SDS_SyncCursor, SDS_PatchSeqNumber, SDS_PersistenceProvider }
                                   from './interfaces/SDS_PersistenceProvider.js'
export type { SDS_NoteStore, ChangeOrigin, ChangeHandler }
                                   from './interfaces/SDS_NoteStore.js'
export type {
  SDS_NetworkProvider,
  SDS_ConnectionOptions,
  SDS_ConnectionState,
}                                    from './interfaces/SDS_NetworkProvider.js'
export type { SDS_PresenceProvider } from './interfaces/SDS_PresenceProvider.js'
export type {
  SDS_LocalPresenceState,
  SDS_RemotePresenceState,
}                                    from './interfaces/SDS_PresenceProvider.js'
