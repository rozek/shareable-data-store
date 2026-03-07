/*******************************************************************************
*                                                                              *
*                            SNS_NetworkProvider                               *
*                                                                              *
*******************************************************************************/

// implementations: SNS_WebSocketProvider, SNS_WebRTCProvider

export type SNS_ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'

export interface SNS_ConnectionOptions {
  Token:            string                      // JWT for server authentication
  reconnectDelayMs?:number        // auto-reconnect backoff in ms (default 2000)
}

export interface SNS_NetworkProvider {
  readonly StoreID:string          // the store id this provider is connected to
  readonly ConnectionState:SNS_ConnectionState       // current connection state

/**** connect — open an authenticated connection to a relay server ****/

  connect (URL:string, Options:SNS_ConnectionOptions):Promise<void>

/**** disconnect — close connection and cancel any pending reconnect ****/

  disconnect ():void

/**** sendPatch — broadcast a CRDT patch to all connected peers ****/

  sendPatch (Patch:Uint8Array):void

/**** sendValue — upload a large value blob identified by its SHA-256 hash ****/

  sendValue (ValueHash:string, Data:Uint8Array):void

/**** requestValue — ask the relay to deliver a value blob by its hash ****/

  requestValue (ValueHash:string):void

/**** onPatch — subscribe to incoming CRDT patches; returns unsubscribe fn ****/

  onPatch (Callback:(Patch:Uint8Array) => void):() => void

/**** onValue — subscribe to incoming value blobs; returns unsubscribe fn ****/

  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void

/**** onConnectionChange — subscribe to connection-state changes; returns unsubscribe fn ****/

  onConnectionChange (Callback:(ConnectionState:SNS_ConnectionState) => void):() => void
}
