/*******************************************************************************
*                                                                              *
*                              SDS_NoteStore                                   *
*                                                                              *
*******************************************************************************/

// minimal interface that SDS_SyncEngine (and other infrastructure packages)
// need from a NoteStore.  All three CRDT backends (sds-core-jj, sds-core-yjs,
// sds-core-loro) implement this interface on their concrete SDS_NoteStore class

import type { SDS_SyncCursor } from './SDS_PersistenceProvider.js'
import type { SDS_ChangeSet }  from '../changeset/SDS_ChangeSet.js'

export type ChangeOrigin  = 'internal' | 'external'
export type ChangeHandler = (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet) => void

export interface SDS_NoteStore {
  readonly currentCursor:SDS_SyncCursor  // opaque cursor for current CRDT state

/**** onChangeInvoke — registers a change listener, returns unsubscribe fn ****/

  onChangeInvoke (Handler:ChangeHandler):() => void

/**** exportPatch — exports changes since sinceCursor; full snapshot if omitted ****/

  exportPatch (sinceCursor?:SDS_SyncCursor):Uint8Array

/**** applyRemotePatch - apply patch from a remote peer ****/

  applyRemotePatch (encodedPatch:Uint8Array):void

/**** asBinary — serialise entire store as compressed binary (for checkpoints) ****/

  asBinary ():Uint8Array
}
