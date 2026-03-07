/*******************************************************************************
*                                                                              *
*                              SNS_NoteStore                                   *
*                                                                              *
*******************************************************************************/

// minimal interface that SNS_SyncEngine (and other infrastructure packages)
// need from a NoteStore.  All three CRDT backends (sns-core-jj, sns-core-yjs,
// sns-core-loro) implement this interface on their concrete SNS_NoteStore class

import type { SNS_SyncCursor } from './SNS_PersistenceProvider.js'
import type { SNS_ChangeSet }  from '../changeset/SNS_ChangeSet.js'

export type ChangeOrigin  = 'internal' | 'external'
export type ChangeHandler = (Origin:ChangeOrigin, ChangeSet:SNS_ChangeSet) => void

export interface SNS_NoteStore {
  readonly currentCursor:SNS_SyncCursor  // opaque cursor for current CRDT state

/**** onChangeInvoke — registers a change listener, returns unsubscribe fn ****/

  onChangeInvoke (Handler:ChangeHandler):() => void

/**** exportPatch — exports changes since sinceCursor; full snapshot if omitted ****/

  exportPatch (sinceCursor?:SNS_SyncCursor):Uint8Array

/**** applyRemotePatch - apply patch from a remote peer ****/

  applyRemotePatch (encodedPatch:Uint8Array):void

/**** asBinary — serialise entire store as compressed binary (for checkpoints) ****/

  asBinary ():Uint8Array
}
