/*******************************************************************************
*                                                                              *
*                           SNS_PresenceProvider                               *
*                                                                              *
*******************************************************************************/

// usually implemented by the same class as SNS_NetworkProvider
// (WebSocket and WebRTC providers both implement this).

export interface SNS_LocalPresenceState {
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

export interface SNS_RemotePresenceState extends SNS_LocalPresenceState {
  PeerId:string                               // always present for remote peers
  lastSeen:number                                        // Date.now() timestamp
}

export interface SNS_PresenceProvider {

/**** sendLocalState — broadcast the local client's presence state to all peers ****/

  sendLocalState (localPresenceState:SNS_LocalPresenceState):void

/**** onRemoteState — subscribe to peer state updates; State===undefined means offline ****/

  onRemoteState (
    Callback:(PeerID:string, State:SNS_RemotePresenceState | undefined) => void
  ):() => void                                         // returns unsubscribe fn

  readonly PeerSet:ReadonlyMap<string,SNS_RemotePresenceState>
                                   // current snapshot of all known remote peers
}
