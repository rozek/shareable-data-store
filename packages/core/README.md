# @rozek/sns-core

Backend-agnostic shared types and interfaces for the **shareable-notes-store** (SNS) family.

This package contains everything that is common to **all** SNS CRDT backends: the error class, the change-set types, and the provider interfaces. It does **not** contain any CRDT implementation — use one of the backend packages for that:

| Backend | Package |
| --- | --- |
| json-joy | `@rozek/sns-core-jj` |
| Y.js | `@rozek/sns-core-yjs` |
| Loro | `@rozek/sns-core-loro` |

---

## Installation

```bash
pnpm add @rozek/sns-core
```

Application code typically depends on a backend package directly and does not need to add `@rozek/sns-core` explicitly — it is a peer dependency of all backend packages.

---

## Exports

### `SNS_Error`

```typescript
class SNS_Error extends Error {
  readonly Code:string
  constructor(Code:string, Message:string)
}
```

Thrown by all SNS packages on invalid arguments or invalid state.

Common error codes: `'invalid-argument'`, `'move-would-cycle'`, `'delete-not-permitted'`, `'purge-not-in-trash'`, `'purge-protected'`, `'change-value-not-literal'`.

---

### `SNS_ChangeSet` / `SNS_EntryChangeSet`

```typescript
type SNS_EntryChangeSet = Set<string>
type SNS_ChangeSet = Record<string,SNS_EntryChangeSet>
```

Delivered to `onChangeInvoke` handlers after every mutation. The ChangeSet maps each affected entry ID to the set of property keys that changed (`'Label'`, `'Value'`, `'outerNote'`, `'innerEntryList'`, `'Info.<key>'`, …).

---

### `SNS_SyncCursor` / `SNS_PatchSeqNumber`

```typescript
type SNS_SyncCursor     = Uint8Array  // opaque; format is backend-specific
type SNS_PatchSeqNumber = number      // maintained by SNS_SyncEngine
```

---

### Provider interfaces

These interfaces are implemented by the infrastructure packages and consumed by `SNS_SyncEngine`.

#### `SNS_PersistenceProvider`

```typescript
interface SNS_PersistenceProvider {
  loadSnapshot ():Promise<Uint8Array | null>
  saveSnapshot (Data:Uint8Array):Promise<void>

  loadPatchesSince (SeqNumber:SNS_PatchSeqNumber):Promise<Uint8Array[]>
  appendPatch (Patch:Uint8Array, SeqNumber:SNS_PatchSeqNumber):Promise<void>
  prunePatches (beforeSeqNumber:SNS_PatchSeqNumber):Promise<void>

  loadValue (ValueHash:string):Promise<Uint8Array | null>
  saveValue (ValueHash:string, Data:Uint8Array):Promise<void>
  releaseValue (ValueHash:string):Promise<void>

  close ():Promise<void>
}
```

Implemented by `@rozek/sns-persistence-browser` (IndexedDB) and `@rozek/sns-persistence-node` (SQLite).

#### `SNS_NetworkProvider`

```typescript
type SNS_ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

interface SNS_ConnectionOptions {
  Token:string               // JWT
  reconnectDelayMs?:number   // auto-reconnect backoff in ms (default 2000)
}

interface SNS_NetworkProvider {
  readonly StoreID:string
  readonly ConnectionState:SNS_ConnectionState

  connect (URL:string, Options:SNS_ConnectionOptions):Promise<void>
  disconnect ():void

  sendPatch (Patch:Uint8Array):void
  sendValue (ValueHash:string, Data:Uint8Array):void
  requestValue (ValueHash:string):void

  onPatch (Callback:(Patch:Uint8Array) => void):() => void
  onValue (Callback:(ValueHash:string, Value:Uint8Array) => void):() => void
  onConnectionChange (Callback:(State:SNS_ConnectionState) => void):() => void
}
```

Implemented by `@rozek/sns-network-websocket` and `@rozek/sns-network-webrtc`.

#### `SNS_PresenceProvider`

```typescript
interface SNS_LocalPresenceState {
  PeerId?:string   // injected by the engine; not set by the user
  UserName?:string
  UserColor?:string
  UserFocus?: {
    entryId:string
    Property:'Value' | 'Label' | 'Info'
    Cursor?:{ from:number; to:number }
  }
  custom?:unknown  // arbitrary JSON-serialisable application data
}

interface SNS_RemotePresenceState extends SNS_LocalPresenceState {
  PeerId:string    // always present for remote peers
  lastSeen:number  // Date.now() timestamp of last received update
}

interface SNS_PresenceProvider {
  sendLocalState(State:SNS_LocalPresenceState):void
  onRemoteState(
    Callback:(PeerId:string, State:SNS_RemotePresenceState | null) => void
  ):() => void
  readonly PeerSet:ReadonlyMap<string,SNS_RemotePresenceState>
}
```

Usually implemented by the same class as `SNS_NetworkProvider`(`@rozek/sns-network-websocket` and `@rozek/sns-network-webrtc` both implement both interfaces).

---

## License

MIT © Andreas Rozek