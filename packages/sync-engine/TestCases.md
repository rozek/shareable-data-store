# Test Cases — @rozek/sds-sync-engine

## SL — Lifecycle

| # | Description | Expected |
|---|---|---|
| SL-01 | construct without options succeeds | instance created, no exception |
| SL-02 | start() with no providers succeeds (no-op) | resolves without error |
| SL-03 | stop() closes persistence and disconnects network | persistence.close() + network.disconnect() called |
| SL-04 | stop() always writes a checkpoint and closes persistence (even with no local changes) | saveSnapshot() + close() called |

## SP — Persistence

| # | Description | Expected |
|---|---|---|
| SP-01 | start() calls loadPatchesSince and applies patches to store | `loadPatchesSince` called; patched data is accessible by Id and Label in the target store |
| SP-02 | internal store change calls appendPatch with patch + clock | appendPatch() called once |
| SP-03 | accumulated bytes ≥ threshold triggers writeCheckpoint (offline engine: snapshot saved, patches kept) | saveSnapshot() called; prunePatches() NOT called |
| SP-04 | stop() writes checkpoint for offline engine; patches are NOT pruned (must survive for future sync) | saveSnapshot() called; prunePatches() NOT called; close() called |
| SP-05 | stop() writes checkpoint even when only remote patches were received (AccumulatedBytes stays 0); network engine prunes | saveSnapshot() + prunePatches() + close() called; snapshot contains remote item |
| SP-06 | network engines prune patches on checkpoint; offline engines preserve patches for future sync | offline: prunePatches() not called; network: prunePatches() called |
| SP-07 | writeCheckpoint merges external patches before saving snapshot (concurrent access) | snapshot saved by stop() contains data from patches written by another process |
| SP-08 | writeCheckpoint advances LastCursor after merging external patches | subsequent local exportPatch() does not re-export the merged external data |

## SN — Network

| # | Description | Expected |
|---|---|---|
| SN-01 | connectTo() without NetworkProvider throws SDS_Error 'no-network-provider' | throws |
| SN-02 | reconnect() without prior connectTo() throws 'not-yet-connected' | throws |
| SN-03 | when connected, internal store change → network.sendPatch() called | sendPatch() called |
| SN-04 | when disconnected, internal store change → patch queued; flushes on reconnect | sendPatch() called after reconnect |
| SN-05 | incoming network patch → applied to store | patched data's Label readable in store after patch delivery |

## SR — Sync Request

| # | Description | Expected |
|---|---|---|
| SR-01 | on connection, engine sends a sync request with the current cursor | `sendSyncRequest()` called with `Store.currentCursor` after `'connected'` fires |
| SR-02 | incoming sync request triggers a full-state response after a random delay | `sendPatch()` called with non-empty `exportPatch()` data within 50–300 ms |
| SR-03 | sync response timer is cleared on stop() | no pending timer after `stop()` completes |

## SS — Presence

| # | Description | Expected |
|---|---|---|
| SS-01 | setPresenceTo() calls presence.sendLocalState() | sendLocalState() called |
| SS-02 | onPresenceChange fires with 'local' origin when setPresenceTo is called | handler called with ('local') |
| SS-03 | incoming remote presence triggers onPresenceChange with 'remote' origin | handler called with ('remote') |
| SS-04 | peer not seen for PresenceTimeoutMs → onPresenceChange fires with State=undefined | handler called with undefined state |
| SS-05 | setPresenceTo({ custom: {...} }) passes custom data to presence.sendLocalState | sendLocalState() called with correct custom field |
