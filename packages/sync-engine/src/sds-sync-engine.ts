/*******************************************************************************
*                                                                              *
*                             SDS Sync Engine                                  *
*                                                                              *
*******************************************************************************/

// SDS_SyncEngine coordinates SDS_DataStore ↔ SDS_PersistenceProvider
// ↔ SDS_NetworkProvider ↔ SDS_PresenceProvider in a single place.
//
// Responsibilities:
//  - Startup: load snapshot → apply persisted patches (local restore)
//  - Offline patch queue: buffer outgoing patches while disconnected; flush on reconnect
//  - Checkpoint: after CheckpointThresholdBytes patches → write snapshot + prune patches
//  - Large value transfer: detect ValueRef changes; send/request blobs over value channel
//  - Presence heartbeat: re-broadcast local state periodically
//  - BroadcastChannel (Browser/Tauri only): cross-tab patch + presence relay

import type {
  SDS_DataStore,
  SDS_PersistenceProvider,
  SDS_NetworkProvider,
  SDS_PresenceProvider,
  SDS_LocalPresenceState,
  SDS_RemotePresenceState,
  SDS_ConnectionOptions,
  SDS_ConnectionState,
  SDS_ChangeSet,
  SDS_SyncCursor,
} from '@rozek/sds-core'
import { SDS_Error } from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                          SDS_SyncEngineOptions                              //
//----------------------------------------------------------------------------//

export interface SDS_SyncEngineOptions {
  PersistenceProvider?: SDS_PersistenceProvider
  NetworkProvider?:     SDS_NetworkProvider
  PresenceProvider?:    SDS_PresenceProvider
  BroadcastChannel?:   boolean  // default: true in Browser/Tauri; no-op in Node.js
  PresenceTimeoutMs?:  number   // peer removed after this ms without heartbeat (default 120000)
}

//----------------------------------------------------------------------------//
//                              SDS_SyncEngine                                 //
//----------------------------------------------------------------------------//

const CheckpointThreshold = 512*1024  // 512 KB of accumulated patch bytes

export class SDS_SyncEngine {
  #Store:              SDS_DataStore
  #Persistence:        SDS_PersistenceProvider | undefined
  #Network:            SDS_NetworkProvider | undefined
  #Presence:           SDS_PresenceProvider | undefined
  #PresenceTimeoutMs:  number

  readonly PeerId:string = crypto.randomUUID()

  #LastConnectURL: string | undefined = undefined
  #LastConnectOpts:SDS_ConnectionOptions | undefined = undefined

  
  #OfflineQueue: Uint8Array[] = [] // outgoing patch queue (patches created while disconnected)
  #AccumulatedBytes = 0         // accumulated patch bytes since last checkpoint
  #SnapshotSeq = 0                 // sequence number of the last saved snapshot
  #PatchSeq = 0 // current patch sequence # (append-monotonic counter, managed by SyncEngine)

  // CRDT cursor captured after the last processed local change;
  // passed to Store.exportPatch() to retrieve exactly that one change.
  // Initialised to an empty cursor; updated in #loadAndRestore and after
  // each local mutation.  Backend-agnostic: the DataStore owns the format.
  #LastCursor: SDS_SyncCursor = new Uint8Array(0)

  // heartbeat timer
  #HeartbeatTimer: ReturnType<typeof setInterval> | undefined = undefined
  #LastLocalState:  SDS_LocalPresenceState | undefined = undefined

  // presence peer tracking
  #PeerSet: Map<string, SDS_RemotePresenceState & { _lastSeen:number }> = new Map()
  #PeerTimeoutTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  #PresenceChangeHandlers: Set<
    (PeerId:string, State:SDS_RemotePresenceState | undefined, Origin:'local'|'remote') => void
  > = new Set()

  // BroadcastChannel (optional, browser/tauri only)
  #BC: BroadcastChannel | undefined = undefined

  // connection state mirror
  #ConnectionState: SDS_ConnectionState = 'disconnected'
  #ConnectionChangeHandlers: Set<(State:SDS_ConnectionState) => void> = new Set()

  // unsubscribe functions for registered handlers
  #Unsubs: Array<() => void> = []

  // tracks entryId → blob hash for all entries whose value is in a *-reference kind;
  // used to call releaseValue() when the entry's value changes or the entry is purged
  #TrackedBlobRefs: Map<string,string> = new Map()

//----------------------------------------------------------------------------//
//                                Constructor                                 //
//----------------------------------------------------------------------------//

  constructor (Store:SDS_DataStore, Options:SDS_SyncEngineOptions = {}) {
    this.#Store       = Store
    this.#Persistence = Options.PersistenceProvider ?? undefined
    this.#Network     = Options.NetworkProvider     ?? undefined
    this.#Presence    = Options.PresenceProvider
      ?? (typeof (Options.NetworkProvider as any)?.onRemoteState === 'function'
          ? (Options.NetworkProvider as unknown as SDS_PresenceProvider)
          : undefined)
    this.#PresenceTimeoutMs = Options.PresenceTimeoutMs ?? 120_000

    const useBroadcastChannel =
      (Options.BroadcastChannel ?? true) &&
      typeof BroadcastChannel !== 'undefined'

    if (useBroadcastChannel && this.#Network != undefined) {
      this.#BC = new BroadcastChannel(`sds:${this.#Network.StoreId}`)
    }
  }

//----------------------------------------------------------------------------//
//                                 Lifecycle                                  //
//----------------------------------------------------------------------------//

/**** start ****/

  async start ():Promise<void> {
    // wire lazy persistence loading so _readValueOf can fetch blobs on demand.
    // the Persistence reference is captured at wiring time; the lambda uses
    // optional chaining so it remains safe if stop() clears #Persistence later.
    if (this.#Persistence != undefined) {
      const Persistence = this.#Persistence
      this.#Store.setValueBlobLoader((Hash) => Persistence.loadValue(Hash))
    }
    // note: providers are wired AFTER #loadAndRestore intentionally.
    // restore patches are applied without triggering re-persistence or
    // re-broadcast — they were already in the persistence layer and the
    // network is not yet connected at this point.
    await this.#loadAndRestore()
    this.#wireStoreToProviders()
    this.#wireNetworkToStore()
    this.#wirePresenceHeartbeat()
    this.#wireBroadcastChannel()
    if (this.#Network != undefined) {
      this.#Network.onConnectionChange((State) => {
        this.#ConnectionState = State
        for (const Handler of this.#ConnectionChangeHandlers) {
          try { Handler(State) } catch (Signal) {
            console.error('[SDS] connection-change handler threw:', (Signal as Error).message ?? Signal)
          }
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

    // always persist the current store state on stop — even if no local patches
    // were produced (e.g. the first sync on a new machine only receives remote
    // patches, which leave #AccumulatedBytes at 0 but do change the store)
    if (this.#Persistence != undefined) {
      await this.#writeCheckpoint()
    }
    await this.#Persistence?.close()
  }

//----------------------------------------------------------------------------//
//                             Network Connection                             //
//----------------------------------------------------------------------------//

/**** connectTo ****/

  async connectTo (URL:string, Options:SDS_ConnectionOptions):Promise<void> {
    if (this.#Network == undefined) {
      throw new SDS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    this.#LastConnectURL  = URL
    this.#LastConnectOpts = Options
    await this.#Network.connect(URL, Options)
  }

/**** disconnect ****/

  disconnect ():void {
    if (this.#Network == undefined) {
      throw new SDS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    this.#Network.disconnect()
  }

/**** reconnect ****/

  async reconnect ():Promise<void> {
    if (this.#Network == undefined) {
      throw new SDS_Error('no-network-provider', 'no NetworkProvider configured')
    }
    if (this.#LastConnectURL == undefined) {
      throw new SDS_Error('not-yet-connected',
        'connectTo() has not been called yet; cannot reconnect')
    }
    await this.#Network.connect(this.#LastConnectURL, this.#LastConnectOpts!)
  }

/**** ConnectionState ****/

  get ConnectionState ():SDS_ConnectionState { return this.#ConnectionState }

/**** onConnectionChange ****/

  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void {
    this.#ConnectionChangeHandlers.add(Callback)
    return () => { this.#ConnectionChangeHandlers.delete(Callback) }
  }

//----------------------------------------------------------------------------//
//                                  Presence                                  //
//----------------------------------------------------------------------------//

/**** setPresenceTo ****/

  setPresenceTo (State:Omit<SDS_LocalPresenceState, never>):void {
    this.#LastLocalState = State
    const full = { ...State, PeerId:this.PeerId } as SDS_RemotePresenceState
    this.#Presence?.sendLocalState(State)
    this.#BC?.postMessage({ type:'presence', payload:full, senderId:this.PeerId })
    for (const Handler of this.#PresenceChangeHandlers) {
      try { Handler(this.PeerId, full, 'local') } catch (Signal) { console.error('SDS: presence handler failed', Signal) }
    }
  }

/**** PeerSet (remote peers only) ****/

  get PeerSet ():ReadonlyMap<string, SDS_RemotePresenceState> {
    return this.#PeerSet as unknown as ReadonlyMap<string, SDS_RemotePresenceState>
  }

/**** onPresenceChange ****/

  onPresenceChange (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | undefined, Origin:'local'|'remote') => void
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
    // Note: snapshots are opaque CRDT binaries that cannot be applied via applyRemotePatch.
    // Restoration is handled by passing a pre-initialised store to SyncEngine at construction
    // time (use SDS_DataStore.fromBinary outside the engine). The snapshot sequence number
    // is stored separately so that only the patches written after the snapshot need replaying.
    if (Snapshot != undefined) {
      // Snapshot was already baked into this.#Store before construction — nothing to do here.
      // #SnapshotSeq stays 0; loadPatchesSince(0) returns exactly the residual patches
      // because writeCheckpoint() always prunes all patches before the snapshot seq,
      // leaving only those written after the last checkpoint.
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
      if (Origin === 'external') {
        // incoming remote patch: request any blobs we don't have yet
        this.#handleValueChanges(ChangeSet, 'request').catch((Signal) => {
          console.error('[SDS] value-request failed:', (Signal as Error).message ?? Signal)
        })
        return
      }

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
          .catch((Signal) => {
            console.error('[SDS] appendPatch failed:', (Signal as Error).message ?? Signal)
          })
        this.#AccumulatedBytes += PatchLog.byteLength
        if (this.#AccumulatedBytes >= CheckpointThreshold) {
          this.#writeCheckpoint().catch((Signal) => {
            console.error('[SDS] checkpoint failed:', (Signal as Error).message ?? Signal)
          })
        }
      }

      // send over network; include senderId so cross-tab BC receivers can
      // identify and skip their own patches (avoids redundant re-application)
      if (this.#Network?.ConnectionState === 'connected') {
        this.#Network.sendPatch(PatchLog)
        this.#BC?.postMessage({ type:'patch', payload:PatchLog, senderId:this.PeerId })
      } else {
        this.#OfflineQueue.push(PatchLog)
      }

      // detect value changes and transfer blobs
      this.#handleValueChanges(ChangeSet, 'send').catch((Signal) => {
        console.error('[SDS] value-send failed:', (Signal as Error).message ?? Signal)
      })
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
        this.#Store.storeValueBlob(Hash, Data)       // cache in DataStore for immediate readValue()
        await this.#Persistence?.saveValue(Hash, Data)
      })
      this.#Unsubs.push(unsubValue)
    }

    // presence — may be a dedicated PresenceProvider or the NetworkProvider
    // itself implementing SDS_PresenceProvider.  Register regardless of Network.
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
        const fullState = { ...this.#LastLocalState, PeerId:this.PeerId } as SDS_RemotePresenceState
        this.#BC?.postMessage({ type:'presence', payload:fullState, senderId:this.PeerId })
      }
    }, IntervalMs)
  }

/**** #wireBroadcastChannel — wires the BroadcastChannel for cross-tab patch and presence relay ****/

  #wireBroadcastChannel ():void {
    if (this.#BC == undefined) { return }
    this.#BC.onmessage = (BroadcastEvent) => {
      const Msg = BroadcastEvent.data as { type:string; payload:any; senderId?:string }
      // skip messages originating from this very engine instance — BroadcastChannel
      // does not echo to the sender itself, but a senderId guard makes intent explicit
      // and guards against any future same-context relay scenarios.
      if (Msg.senderId === this.PeerId) { return }
      switch (true) {
        case (Msg.type === 'patch'):
          try {
            this.#Store.applyRemotePatch(Msg.payload as Uint8Array)
          } catch (Signal) {
            console.error('[SDS] failed to apply BC patch:', (Signal as Error).message ?? Signal)
          }
          break
        case (Msg.type === 'presence'):
          // treat as incoming remote presence — do NOT re-send as local state
          this.#handleRemotePresence(
            (Msg.payload as SDS_LocalPresenceState).PeerId ?? Msg.senderId ?? 'unknown',
            Msg.payload as SDS_RemotePresenceState
          )
          break
      }
    }
  }

//----------------------------------------------------------------------------//
//                                 Checkpoint                                 //
//----------------------------------------------------------------------------//

/**** #writeCheckpoint — saves a snapshot and prunes patches (network engines only) ****/

  async #writeCheckpoint ():Promise<void> {
    if (this.#Persistence == undefined) { return }
    await this.#Persistence.saveSnapshot(this.#Store.asBinary())
    // only prune residual patches if this engine has a NetworkProvider —
    // offline-only engines keep patches in SQLite so that a future
    // 'store sync' run can upload them to the server
    if (this.#Network != null) {
      await this.#Persistence.prunePatches(this.#PatchSeq)
      this.#SnapshotSeq = this.#PatchSeq
    }
    this.#AccumulatedBytes = 0
  }

//----------------------------------------------------------------------------//
//                            Offline Queue Flush                             //
//----------------------------------------------------------------------------//

/**** #flushOfflineQueue — sends all queued offline patches to the network ****/

  #flushOfflineQueue ():void {
    const Queue = this.#OfflineQueue.splice(0)
    for (const PatchData of Queue) {
      try { this.#Network?.sendPatch(PatchData) } catch (Signal) { console.error('SDS: failed to send queued patch', Signal) }
    }
  }

//----------------------------------------------------------------------------//
//                               Value Transfer                               //
//----------------------------------------------------------------------------//

/**** #handleValueChanges — send outgoing blobs, request missing incoming blobs, release stale blobs ****/

  async #handleValueChanges (
    ChangeSet:SDS_ChangeSet,
    Direction:'send' | 'request',
  ):Promise<void> {
    for (const [EntryId, Changes] of Object.entries(ChangeSet)) {
      const changedProps = Changes as Set<string>

      // ── entry purged — release its blob if we are tracking one ───────────
      if (changedProps.has('Existence')) {
        const oldHash = this.#TrackedBlobRefs.get(EntryId)
        if (oldHash != undefined) {
          await this.#Persistence?.releaseValue(oldHash)
          this.#TrackedBlobRefs.delete(EntryId)
        }
      }

      if (! changedProps.has('Value')) { continue }

      // ── value changed — release old blob if the hash has changed ─────────
      const oldHash = this.#TrackedBlobRefs.get(EntryId)
      const ref     = this.#Store._getValueRefOf(EntryId)
      const newHash = ref?.Hash

      if (oldHash != undefined && oldHash !== newHash) {
        await this.#Persistence?.releaseValue(oldHash)
        this.#TrackedBlobRefs.delete(EntryId)
      }

      if (ref == undefined) { continue }  // value is inline or cleared; nothing to transfer

      // ── blob transfer / request ───────────────────────────────────────────
      if (this.#Network == undefined) {
        // no network — still track the ref so we can release it later
        this.#TrackedBlobRefs.set(EntryId, ref.Hash)
        continue
      }

      if (Direction === 'send') {
        // outgoing: persist blob locally, then forward to connected peers
        const Blob = this.#Store.getValueBlobByHash(ref.Hash)
        if (Blob != undefined) {
          await this.#Persistence?.saveValue(ref.Hash, Blob)
          this.#TrackedBlobRefs.set(EntryId, ref.Hash)
          if (this.#Network.ConnectionState === 'connected') {
            this.#Network.sendValue(ref.Hash, Blob)
          }
        }
      } else {
        // incoming: track the ref; request blob from the network if not cached
        this.#TrackedBlobRefs.set(EntryId, ref.Hash)
        if (
          ! this.#Store.hasValueBlob(ref.Hash) &&
          this.#Network.ConnectionState === 'connected'
        ) {
          this.#Network.requestValue(ref.Hash)
        }
      }
    }
  }

//----------------------------------------------------------------------------//
//                              Remote Presence                               //
//----------------------------------------------------------------------------//

/**** #handleRemotePresence — updates the peer set and notifies handlers when a presence update arrives ****/

  #handleRemotePresence (
    PeerId:string, State:SDS_RemotePresenceState | undefined
  ):void {
    if (State == undefined) {
      this.#removePeer(PeerId)
      return
    }

    const extended = { ...State, _lastSeen:Date.now() }
    this.#PeerSet.set(PeerId, extended)
    this.#resetPeerTimeout(PeerId)

    for (const Handler of this.#PresenceChangeHandlers) {
      try { Handler(PeerId, State, 'remote') } catch (Signal) { console.error('SDS: presence handler failed', Signal) }
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
      try { Handler(PeerId, undefined, 'remote') } catch (Signal) { console.error('SDS: presence handler failed', Signal) }
    }
  }
}
