/*******************************************************************************
*                                                                              *
*                           SDS_PresenceProvider                               *
*                                                                              *
*******************************************************************************/

// usually implemented by the same class as SDS_NetworkProvider
// (WebSocket and WebRTC providers both implement this).

export interface SDS_LocalPresenceState {
  PeerId?:string // injected by the engine before transmission; not set by  user
  UserName?:string
  UserColor?:string
  UserFocus?: {
    EntryId: string
    Property:'Value' | 'Label' | 'Info'
    Cursor?: { from:number; to:number }
                    // only set when (property === 'Value') and value is literal
  }
  custom?:unknown                // arbitrary JSON-serialisable application data
}

export interface SDS_RemotePresenceState extends SDS_LocalPresenceState {
  PeerId:string                               // always present for remote peers
  lastSeen:number                                        // Date.now() timestamp
}

export interface SDS_PresenceProvider {

/**** sendLocalState — broadcast the local client's presence state to all peers ****/

  sendLocalState (localPresenceState:SDS_LocalPresenceState):void

/**** onRemoteState — subscribe to peer state updates; State===undefined means offline ****/

  onRemoteState (
    Callback:(PeerID:string, State:SDS_RemotePresenceState | undefined) => void
  ):() => void                                         // returns unsubscribe fn

  readonly PeerSet:ReadonlyMap<string,SDS_RemotePresenceState>
                                   // current snapshot of all known remote peers
}
