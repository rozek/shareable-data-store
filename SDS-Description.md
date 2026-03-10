# Shareable Data Store (SDS)

A **Shareable Data Store** is a CRDT-backed, hierarchical content store designed for real-time collaborative applications. It provides a unified, backend-agnostic API for creating, reading, updating, and syncing structured data across multiple clients — offline-capable, conflict-free, and fully serialisable.

---

## Data Model

The store holds a **tree of entries**. Every entry has a universally unique `Id`, a human-readable `Label`, and an open-ended `Info` metadata map. Entries come in two kinds:

- **Item** — a typed container. It carries a MIME `Type`, an optional `Value` (string or binary), and an ordered list of child entries. Items are the primary building block for all user data.
- **Link** — a typed reference. It points to another item anywhere in the tree. A link has no value and no children of its own; it exists solely to create cross-references without duplicating data.

### Tree Structure

The tree is rooted at three **well-known items** that are always present:

| Item          | Role                                                    |
|---------------|---------------------------------------------------------|
| **Root**      | Invisible top-level container; all user content lives here |
| **Trash**     | Soft-delete target; entries moved here carry a deletion timestamp and are auto-purged after a configurable TTL |
| **Lost & Found** | Recovery container; orphaned entries encountered during sync are placed here automatically |

### Values

An item's value is stored in one of six modes, selected automatically by the store:

| `ValueKind`          | Description                                          |
|----------------------|------------------------------------------------------|
| `none`               | item carries no value                                |
| `literal`            | inline UTF-16 string (supports collaborative character-level edits) |
| `binary`             | inline `Uint8Array` (below a configurable size threshold) |
| `literal-reference`  | oversized string, body kept in the blob store        |
| `binary-reference`   | oversized binary, body kept in the blob store        |
| `pending`            | referenced blob not yet available locally            |

Large blobs are stored in a **content-addressed blob store** keyed by a FNV-1a hash, and transferred on demand over a dedicated value channel.

---

## Sync Model

The store is built on a **CRDT** (Conflict-free Replicated Data Type). Every mutation produces an opaque binary patch. Changes can be:

- **exported** as incremental patches from any prior cursor position, or as a full snapshot
- **applied** from remote peers without conflict; all operations are commutative and idempotent
- **sequenced** locally by the sync engine, which maintains a monotonic patch log for persistence

A `ChangeSet` — emitted on every successful mutation — maps each affected entry `Id` to the set of changed property names (`Label`, `Type`, `Value`, `innerItemList`, `outerItem`, `Info.<key>`), together with a `ChangeOrigin` flag (`'internal'` for local edits, `'external'` for patches arriving from the network).

---

## Pluggable Providers

Three orthogonal provider interfaces allow the store to be deployed in any environment:

| Provider              | Responsibility                                  | Reference implementations        |
|-----------------------|-------------------------------------------------|-----------------------------------|
| `SDS_NetworkProvider` | Send/receive CRDT patches and value blobs       | WebSocket, WebRTC                 |
| `SDS_PersistenceProvider` | Load/save snapshots, patch logs, value blobs | IndexedDB (browser), SQLite (Node.js) |
| `SDS_PresenceProvider` | Broadcast and receive per-peer presence state  | WebSocket, WebRTC                 |

The **SyncEngine** (`SDS_SyncEngine`) wires these providers together. It handles startup restore, offline patch queuing, checkpoint compaction, large-value transfers, cross-tab relay via `BroadcastChannel`, and presence heartbeating — all transparently, without the application needing to know about the underlying CRDT backend.

---

## Presence

Each peer continuously broadcasts a **local presence state** containing optional user identity (`UserName`, `UserColor`), the currently focused entry and property, an optional character-range cursor (for collaborative text editing), and arbitrary application-defined data. Remote peer states are accessible via a live `PeerSet` map and a subscription callback; stale peers are automatically evicted after a configurable timeout.

---

## Serialisation

Any entry or the entire tree can be serialised to:

- **JSON** — a recursive, human-readable plain-object representation (`SDS_ItemJSON` / `SDS_LinkJSON`)
- **Binary** — a gzip-compressed form of the same structure, suited for network transport and storage

The store also supports full **import** of serialised subtrees, always remapping all IDs to prevent collisions.

---

## CRDT Backends

The abstract `SDS_DataStore` class is implemented by three interchangeable backends — each a drop-in replacement for the others:

| Package       | CRDT Engine |
|---------------|-------------|
| `sds-core-jj` | json-joy     |
| `sds-core-loro` | Loro       |
| `sds-core-yjs` | Y.js        |

Application code targets the shared `SDS_DataStore` API exclusively; backend selection is a deployment-time choice with no impact on the application layer.
