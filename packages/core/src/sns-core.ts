/*******************************************************************************
*                                                                              *
*                                  SNS Core                                    *
*                                                                              *
*******************************************************************************/

// backend-agnostic shared types and interfaces, consumed by all SNS backend 
// packages (sns-core-jj, sns-core-yjs, sns-core-loro) and by the infrastructure
// packages (sync-engine, network, persistence).                                                                

export { SNS_Error } from './error/SNS_Error.js'

export {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit,
  DefaultBinarySizeLimit, DefaultWrapperCacheSize,
}                        from './store/constants.js'
export { SNS_Entry }     from './store/SNS_Entry.js'
export { SNS_Note }      from './store/SNS_Note.js'
export { SNS_Link }      from './store/SNS_Link.js'

export type { SNS_ChangeSet }      from './changeset/SNS_ChangeSet.js'
export type { SNS_EntryChangeSet } from './changeset/SNS_EntryChangeSet.js'

export type { SNS_SyncCursor, SNS_PatchSeqNumber, SNS_PersistenceProvider }
                                   from './interfaces/SNS_PersistenceProvider.js'
export type { SNS_NoteStore, ChangeOrigin, ChangeHandler }
                                   from './interfaces/SNS_NoteStore.js'
export type {
  SNS_NetworkProvider,
  SNS_ConnectionOptions,
  SNS_ConnectionState,
}                                    from './interfaces/SNS_NetworkProvider.js'
export type { SNS_PresenceProvider } from './interfaces/SNS_PresenceProvider.js'
export type {
  SNS_LocalPresenceState,
  SNS_RemotePresenceState,
}                                    from './interfaces/SNS_PresenceProvider.js'
