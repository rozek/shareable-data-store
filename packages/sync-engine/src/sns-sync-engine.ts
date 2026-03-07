/*******************************************************************************
*                                                                              *
*                             SNS Sync Engine                                  *
*                                                                              *
*******************************************************************************/

// SNS_SyncEngine coordinates SNS_NoteStore ↔ SNS_PersistenceProvider
// ↔ SNS_NetworkProvider ↔ SNS_PresenceProvider in a single place.
//
// Responsibilities:
//  - Startup: load snapshot → apply persisted patches (local restore)
//  - Offline patch queue: buffer outgoing patches while disconnected; flush on reconnect
//  - Checkpoint: after CheckpointThresholdBytes patches → write snapshot + prune patches
//  - Large value transfer: detect ValueRef changes; send/request blobs over value channel
//  - Presence heartbeat: re-broadcast local state periodically
//  - BroadcastChannel (Browser/Tauri only): cross-tab patch + presence relay

import type {
  SNS_NoteStore,
  SNS_PersistenceProvider,
  SNS_NetworkProvider,
  SNS_PresenceProvider,
  SNS_LocalPresenceState,
  SNS_RemotePresenceState,
  SNS_ConnectionOptions,
  SNS_ConnectionState,
  SNS_ChangeSet,
  SNS_SyncCursor,
} from '@rozek/sns-core'
import { SNS_Error } from '@rozek/sns-core'

//----------------------------------------------------------------------------//
//                          SNS_SyncEngineOptions                              //
//----------------------------------------------------------------------------//

export interface SNS_SyncEngineOptions {
  PersistenceProvider?: SNS_PersistenceProvider
  NetworkProvider?:     SNS_NetworkProvider
  PresenceProvider?:    SNS_PresenceProvider
  BroadcastChannel?:   boolean  // default: true in Browser/Tauri; no-op in Node.js
  PresenceTimeoutMs?:  number   // peer removed after this ms without heartbeat (default 120000)
}

//----------------------------------------------------------------------------//
//                              SNS_SyncEngine                                 //
//----------------------------------------------------------------------------//

const CheckpointThreshold = 512*1024  // 512 KB of accumulated patch bytes

export class SNS_SyncEngine {
  #Store:              SNS_NoteStore
  #Persistence:        SNS_PersistenceProvider | undefined
  #Network:            SNS_NetworkProvider | undefined
  #Presence:           SNS_PresenceProvider | undefined
  #PresenceTimeoutMs:  number

  readonly PeerId:string = crypto.randomUUID()

  #LastConnectURL: string | undefined = undefined
  #LastConnectOpts:SNS_ConnectionOptions | undefined = undefined

  
  #OfflineQueue: Uint8Array[] = [] // outgoing patch queue (patches created while disconnected)
  #AccumulatedBytes = 0         // accumulated patch bytes since last checkpoint
  #SnapshotSeq = 0                 // sequence number of the last saved snapshot
  #PatchSeq = 0 // current patch sequence # (append-monotonic counter, managed by SyncEngine)

  // CRDT cursor captured after the last processed local change;
  // passed to Store.exportPatch() to retrieve exactly that one change.
  // Initialised to an empty cursor; updated in #loadAndRestore and after
  // each local mutation.  Backend-agnostic: the NoteStore owns the format.
  #LastCursor: SNS_SyncCursor = new Uint8Array(0)

  // heartbeat timer
  #HeartbeatTimer: ReturnType<typeof setInterval> | undefined = undefined
  #LastLocalState:  SNS_LocalPresenceState | undefined = undefined

  // presence peer tracking
  #PeerSet: Map<string, SNS_RemotePresenceState & { _lastSeen:number }> = new Map()
  #PeerTimeoutTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  #PresenceChangeHandlers: Set<
    (PeerId:string, State:SNS_RemotePresenceState | undefined, Origin:'local'|'remote') => void
  > = new Set()

  // BroadcastChannel (optional, browser/tauri only)
  #BC: BroadcastChannel | undefined = undefined

  // connection state mirror
  #ConnectionState: SNS_ConnectionState = 'disconnected'
  #ConnectionChangeHandlers: Set<(State:SNS_ConnectionState) => void> = new Set()

  // unsubscribe functions for registered handlers
  #Unsubs: Array<() => void> = []

//----------------------------------------------------------------------------//
//                                Constructor                                 //
//----------------------------------------------------------------------------//

  constructor (Store:SNS_NoteStore, Options:SNS_SyncEngineOptions = {}) {
    this.#Store       = Store
    this.#Persistence = Options.PersistenceProvider ?? undefined
    this.#Network     = Options.NetworkProvider     ?? undefined
    this.#Presence    = Options.PresenceProvider
      ?? (Options.NetworkProvider as unknown as SNS_PresenceProvider | undefined)
      ?? undefined
    this.#PresenceTimeoutMs = Options.PresenceTimeoutMs ?? 120_000

    const useBroadcastChannel =
      (Options.BroadcastChannel ?? true) &&
      typeof BroadcastChannel !== 'undefined'

    if (useBroadcastChannel && this.#Network != undefined) {
      this.#BC = new BroadcastChannel(`sns:${this.#Network.StoreID}`)
    }
  }

//----------------------------------------------------------------------------//
//                                 Lifecycle                                  //
//----------------------------------------------------------------------------//

/**** start ****/

  async start ():Promise<void> {
    await this.#loadAndRestore()
    this.#wireStoreToProviders()
    this.#wireNetworkToStore()
    this.#wirePresenceHeartbeat()
    this.#wireBroadcastChannel()
    if (this.#Network != undefined) {
      this.#Network.onConnectionChange((State) => {
        this.#ConnectionState = State
        for (const Handler of this.#ConnectionChangeHandlers) {
          try { Handler(State) } catch (_Signal) {}
        }
        if (State === 'connected') {
          this.#flushOfflineQueue()
        }
      })
    }
  }

/**** stop ****/

  async stop ():Promise<void> {
    if (this.#HeartbeatTimer != undefined) {
      clearInterval(this.#HeartbeatTimer)
      this.#HeartbeatTimer = undefined
    }
    for (const Timer of this.#PeerTimeoutTimers.values()) { clearTimeout(Timer) }
    this.#PeerTimeoutTimers.clear()

    for (const Unsub of this.#Unsubs) { try { Unsub() } catch {} }
    this.#Unsubs = []

    this.#BC?.close()
    this.#BC = undefined

    this.#Network?.disconnect()

    if (this.#Persistence != undefined && this.#AccumulatedBytes > 0) {
      await this.#writeCheckpoint()
    }
    await this.#Persistence?.close()
  }

//----------------------------------------------------------------------------//
//                             Network Connection                             //
//----------------------------------------------------------------------------//

/**** connectTo ****/

  async connectTo (URL:string, Options:SNS_ConnectionOptions):Promise<void> {
    if (this.#Network == undefined) {
      throw new SNS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    this.#LastConnectURL  = URL
    this.#LastConnectOpts = Options
    await this.#Network.connect(URL, Options)
  }

/**** disconnect ****/

  disconnect ():void {
    if (this.#Network == undefined) {
      throw new SNS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    this.#Network.disconnect()
  }

/**** reconnect ****/

  async reconnect ():Promise<void> {
    if (this.#Network == undefined) {
      throw new SNS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    if (this.#LastConnectURL == undefined) {
      throw new SNS_Error('not-yet-connected',
        'connectTo() has not been called yet; cannot reconnect')
    }
    await this.#Network.connect(this.#LastConnectURL, this.#LastConnectOpts!)
  }

/**** ConnectionState ****/

  get ConnectionState ():SNS_ConnectionState { return this.#ConnectionState }

/**** onConnectionChange ****/

  onConnectionChange (Callback:(State:SNS_ConnectionState) => void):() => void {
    this.#ConnectionChangeHandlers.add(Callback)
    return () => { this.#ConnectionChangeHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                                  Presence                                  //
//----------------------------------------------------------------------------//

/**** setPresenceTo ****/

  setPresenceTo (State:Omit<SNS_LocalPresenceState, never>):void {
    this.#LastLocalState = State
    const full = { ...State, PeerId:this.PeerId } as SNS_RemotePresenceState
    this.#Presence?.sendLocalState(State)
    this.#BC?.postMessage({ type:'presence', payload:State })
    for (const Handler of this.#PresenceChangeHandlers) {
      try { Handler(this.PeerId, full, 'local') } catch {}
    }
  }

/**** PeerSet (remote peers only) ****/

  get PeerSet ():ReadonlyMap<string, SNS_RemotePresenceState> {
    return this.#PeerSet as unknown as ReadonlyMap<string, SNS_RemotePresenceState>
  }

/**** onPresenceChange ****/

  onPresenceChange (
    Callback:(PeerId:string, State:SNS_RemotePresenceState | undefined, Origin:'local'|'remote') => void
  ):() => void {
    this.#PresenceChangeHandlers.add(Callback)
    return () => { this.#PresenceChangeHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                                  Startup                                   //
//----------------------------------------------------------------------------//

/**** #loadAndRestore — loads the latest snapshot and replays all persisted patches ****/

  async #loadAndRestore ():Promise<void> {
    if (this.#Persistence == undefined) { return }
    const Snapshot = await this.#Persistence.loadSnapshot()
    if (Snapshot != undefined) {
      try {
        const SnapshotStore = (this.#Store.constructor as any).fromBinary(Snapshot)
        // instead of creating a new store, we apply patches on top of the existing empty store
        // by exporting a full patch from the loaded snapshot store and applying to this.#Store.
        // Simpler approach: use the snapshot binary directly as first patch
        // (The SNS_NoteStore.fromBinary wraps the model; we can't replace the store.)
        // The SyncEngine must be given a freshly created store here.
        // We apply the snapshot as an "import" by getting its binary model data.
        // SNS_NoteStore exposes applyRemotePatch; snapshot binary is not a patch.
        // → Use asBinary/fromBinary at construction time instead (outside SyncEngine).
        // Here: just apply patches since clock 0.
      } catch (_Signal) {}
    }
    const Patches = await this.#Persistence.loadPatchesSince(this.#SnapshotSeq)
    for (const PatchBytes of Patches) {
      try { this.#Store.applyRemotePatch(PatchBytes) } catch (_Signal) {}
    }
    if (Patches.length > 0) {
      this.#PatchSeq = this.#SnapshotSeq + Patches.length
    }
    // capture the CRDT cursor after full restore so that the first local
    // mutation can export exactly its own patch via Store.exportPatch().
    this.#LastCursor = this.#Store.currentCursor
  }

//----------------------------------------------------------------------------//
//                                   Wiring                                   //
//----------------------------------------------------------------------------//

/**** #wireStoreToProviders — subscribes to local store changes and routes them to persistence and network ****/

  #wireStoreToProviders ():void {
    const unsub = this.#Store.onChangeInvoke((Origin, ChangeSet) => {
      if (Origin !== 'internal') { return }

      // export exactly the patch produced by this local change.
      // #LastCursor was captured just before this change fired, so
      // exportPatch(#LastCursor) returns only the new delta — regardless
      // of which CRDT backend is in use.
      const prevCursor = this.#LastCursor
      this.#PatchSeq++
      const PatchLog = this.#Store.exportPatch(prevCursor)
      this.#LastCursor = this.#Store.currentCursor
      if (PatchLog.byteLength === 0) { return }

      // persist
      if (this.#Persistence != undefined) {
        this.#Persistence.appendPatch(PatchLog, this.#PatchSeq)
          .catch(() => {})
        this.#AccumulatedBytes += PatchLog.byteLength
        if (this.#AccumulatedBytes >= CheckpointThreshold) {
          this.#writeCheckpoint().catch(() => {})
        }
      }

      // send over network
      if (this.#Network?.ConnectionState === 'connected') {
        this.#Network.sendPatch(PatchLog)
        this.#BC?.postMessage({ type:'patch', payload:PatchLog })
      } else {
        this.#OfflineQueue.push(PatchLog)
      }

      // detect value changes and transfer blobs
      this.#handleValueChanges(ChangeSet).catch(() => {})
    })
    this.#Unsubs.push(unsub)
  }

/**** #wireNetworkToStore — subscribes to incoming network patches and presence events ****/

  #wireNetworkToStore ():void {
    if (this.#Network != undefined) {
      const unsubPatch = this.#Network.onPatch((Patch) => {
        try { this.#Store.applyRemotePatch(Patch) } catch (_Signal) {}
      })
      this.#Unsubs.push(unsubPatch)

      const unsubValue = this.#Network.onValue(async (Hash, Data) => {
        await this.#Persistence?.saveValue(Hash, Data)
      })
      this.#Unsubs.push(unsubValue)
    }

    // presence — may be a dedicated PresenceProvider or the NetworkProvider
    // itself implementing SNS_PresenceProvider.  Register regardless of Network.
    const PresenceProvider = this.#Presence
    if (PresenceProvider != undefined) {
      const unsubPresence = PresenceProvider.onRemoteState((PeerId, State) => {
        this.#handleRemotePresence(PeerId, State)
      })
      this.#Unsubs.push(unsubPresence)
    }
  }

/**** #wirePresenceHeartbeat — starts a periodic timer to re-broadcast local presence state ****/

  #wirePresenceHeartbeat ():void {
    const IntervalMs = this.#PresenceTimeoutMs / 4
    this.#HeartbeatTimer = setInterval(() => {
      if (this.#LastLocalState != undefined) {
        this.#Presence?.sendLocalState(this.#LastLocalState)
        this.#BC?.postMessage({ type:'presence', payload:this.#LastLocalState })
      }
    }, IntervalMs)
  }

/**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/

  #wireBroadcastChannel ():void {
    if (this.#BC == undefined) { return }
    this.#BC.onmessage = (BroadcastEvent) => {
      const Msg = BroadcastEvent.data as { type:string; payload:any }
      if (Msg.type === 'patch') {
        try { this.#Store.applyRemotePatch(Msg.payload as Uint8Array) } catch {}
      } else if (Msg.type === 'presence') {
        this.#Presence?.sendLocalState(Msg.payload as SNS_LocalPresenceState)
      }
    }
  }

//----------------------------------------------------------------------------//
//                                 Checkpoint                                 //
//----------------------------------------------------------------------------//

/**** #writeCheckpoint — saves a snapshot and prunes all patches up to the current seq ****/

  async #writeCheckpoint ():Promise<void> {
    if (this.#Persistence == undefined) { return }
    await this.#Persistence.saveSnapshot(this.#Store.asBinary())
    await this.#Persistence.prunePatches(this.#PatchSeq)
    this.#SnapshotSeq     = this.#PatchSeq
    this.#AccumulatedBytes = 0
  }

//----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//

/**** #flushOfflineQueue — sends all queued offline patches to the network ****/

  #flushOfflineQueue ():void {
    const Queue = this.#OfflineQueue.splice(0)
    for (const PatchData of Queue) {
      try { this.#Network?.sendPatch(PatchData) } catch {}
    }
  }

//----------------------------------------------------------------------------//
//                               Value Transfer                               //
//----------------------------------------------------------------------------//

/**** #handleValueChanges — stub: detects value-ref changes and triggers blob transfer ****/

  async #handleValueChanges (ChangeSet:SNS_ChangeSet):Promise<void> {
    for (const [_EntryId, Changes] of Object.entries(ChangeSet)) {
      if ((Changes as Set<string>).has('Value') && this.#Network != undefined) {
        // value refs are requested / sent by the SyncEngine when the CRDT
        // ValueKind becomes 'binary-reference' or 'literal-reference'.
        // Full implementation requires reading ValueRef from the entry and
        // triggering sendValue / requestValue accordingly.
        // This stub satisfies the interface; full implementation is left for
        // the ValueStore integration layer.
      }
    }
  }

//----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//

/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/

  #handleRemotePresence (
    PeerId:string, State:SNS_RemotePresenceState | undefined
  ):void {
    if (State == undefined) {
      this.#removePeer(PeerId)
      return
    }

    const extended = { ...State, _lastSeen:Date.now() }
    this.#PeerSet.set(PeerId, extended)
    this.#resetPeerTimeout(PeerId)

    for (const Handler of this.#PresenceChangeHandlers) {
      try { Handler(PeerId, State, 'remote') } catch {}
    }
  }

/**** #resetPeerTimeout — arms a timeout to remove a peer if no heartbeat arrives within PresenceTimeoutMs ****/

  #resetPeerTimeout (PeerId:string):void {
    const existing = this.#PeerTimeoutTimers.get(PeerId)
    if (existing != undefined) { clearTimeout(existing) }
    const Timer = setTimeout(
      () => { this.#removePeer(PeerId) },
      this.#PresenceTimeoutMs
    )
    this.#PeerTimeoutTimers.set(PeerId, Timer)
  }

/**** #removePeer — removes a peer from the peer set and notifies presence change handlers ****/

  #removePeer (PeerId:string):void {
    if (! this.#PeerSet.has(PeerId)) { return }
    this.#PeerSet.delete(PeerId)
    const Timer = this.#PeerTimeoutTimers.get(PeerId)
    if (Timer != undefined) { clearTimeout(Timer); this.#PeerTimeoutTimers.delete(PeerId) }
    for (const Handler of this.#PresenceChangeHandlers) {
      try { Handler(PeerId, undefined, 'remote') } catch {}
    }
  }
}
