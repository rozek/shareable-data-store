# @rozek/sds-core

Backend-agnostic shared types and interfaces for the **shareable-data-store** (SNS) family.

This package contains everything that is common to **all** SNS CRDT backends: the error class, the change-set types, and the provider interfaces. It does **not** contain any CRDT implementation — use one of the backend packages for that:

| Backend | Package |
| --- | --- |
| json-joy | `@rozek/sds-core-jj` |
| Y.js | `@rozek/sds-core-yjs` |
| Loro | `@rozek/sds-core-loro` |

---

## Installation

```bash
pnpm add @rozek/sds-core
```

Application code typically depends on a backend package directly and does not need to add `@rozek/sds-core` explicitly — it is a peer dependency of all backend packages.

---

## Exports

### `SDS_Error`

```typescript
class SDS_Error extends Error {
  readonly Code:string
  constructor (Code:string, Message:string)
}
```

Thrown by all SNS packages on invalid arguments or invalid state.

Common error codes: `'invalid-argument'`, `'move-would-cycle'`, `'delete-not-permitted'`, `'purge-not-in-trash'`, `'purge-protected'`, `'change-value-not-literal'`.

---

### `SDS_ChangeSet` / `SDS_EntryChangeSet`

```typescript
type SDS_EntryChangeSet = Set<string>
type SDS_ChangeSet = Record<string,SDS_EntryChangeSet>
```

Delivered to `onChangeInvoke` handlers after every mutation. The ChangeSet maps each affected entry ID to the set of property keys that changed (`'Label'`, `'Value'`, `'outerNote'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

### `SDS_SyncCursor` / `SDS_PatchSeqNumber`

```typescript
type SDS_SyncCursor     = Uint8Array  // opaque; format is backend-specific
type SDS_PatchSeqNumber = number      // maintained by SDS_SyncEngine
```

---

### Provider interfaces

These interfaces are implemented by the infrastructure packages and consumed by `SDS_SyncEngine`.

#### `SDS_PersistenceProvider`

```typescript
interface SDS_PersistenceProvider {
  loadSnapshot ():Promise<Uint8Array | null>
  saveSnapshot (Data:Uint8Array):Promise<void>

  loadPatchesSince (SeqNumber:SDS_PatchSeqNumber):Promise<Uint8Array[]>
  appendPatch (Patch:Uint8Array, SeqNumber:SDS_PatchSeqNumber):Promise<void>
  prunePatches (beforeSeqNumber:SDS_PatchSeqNumber):Promise<void>

  loadValue (ValueHash:string):Promise<Uint8Array | null>
  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue (ValueHash:string):Promise<void>

  close ():Promise<void>
}
```

Implemented by `@rozek/sds-persistence-browser` (IndexedDB) and `@rozek/sds-persistence-node` (SQLite).

#### `SDS_NetworkProvider`

```typescript
type SDS_ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

interface SDS_ConnectionOptions {
  Token:string               // JWT
  reconnectDelayMs?:number   // auto-reconnect backoff in ms (default 2000)
}

interface SDS_NetworkProvider {
  readonly StoreID:string
  readonly ConnectionState:SDS_ConnectionState

  connect (URL:string, Options:SDS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SDS_ConnectionState) => void):() => void
}
```

Implemented by `@rozek/sds-network-websocket` and `@rozek/sds-network-webrtc`.

#### `SDS_PresenceProvider`

```typescript
interface SDS_LocalPresenceState {
  PeerId?:string   // injected by the engine; not set by the user
  UserName?:string
  UserColor?:string
  UserFocus?: {
    EntryId:string
    Property:'Value' | 'Label' | 'Info'
    Cursor?:{ from:number; to:number }
  }
  custom?:unknown  // arbitrary JSON-serialisable application data
}

interface SDS_RemotePresenceState extends SDS_LocalPresenceState {
  PeerId:string    // always present for remote peers
  lastSeen:number  // Date.now() timestamp of last received update
}

interface SDS_PresenceProvider {
  sendLocalState (State:SDS_LocalPresenceState):void
  onRemoteState (
    Callback:(PeerId:string, State:SDS_RemotePresenceState | null) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string,SDS_RemotePresenceState>
}
```

Usually implemented by the same class as `SDS_NetworkProvider`(`@rozek/sds-network-websocket` and `@rozek/sds-network-webrtc` both implement both interfaces).

---

## License

MIT © Andreas Rozek