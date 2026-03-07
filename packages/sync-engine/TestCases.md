# Test Cases — @rozek/sns-sync-engine

## SL — Lifecycle

| # | Description | Expected |
|---|---|---|
| SL-01 | construct without options succeeds | instance created, no exception |
| SL-02 | start() with no providers succeeds (no-op) | resolves without error |
| SL-03 | stop() closes persistence and disconnects network | persistence.close() + network.disconnect() called |
| SL-04 | stop() writes checkpoint if accumulated bytes > 0 | persistence.close() called; no exception |

## SP — Persistence

| # | Description | Expected |
|---|---|---|
| SP-01 | start() calls loadPatchesSince and applies patches to store | `loadPatchesSince` called; patched note is accessible by ID and Label in the target store |
| SP-02 | internal store change calls appendPatch with patch + clock | appendPatch() called once |
| SP-03 | accumulated bytes ≥ threshold triggers writeCheckpoint | saveSnapshot() + prunePatches() called |
| SP-04 | stop() calls prunePatches if AccumulatedBytes > 0 | prunePatches() called |

## SN — Network

| # | Description | Expected |
|---|---|---|
| SN-01 | connectTo() without NetworkProvider throws SNS_Error 'no-network-provider' | throws |
| SN-02 | reconnect() without prior connectTo() throws 'not-yet-connected' | throws |
| SN-03 | when connected, internal store change → network.sendPatch() called | sendPatch() called |
| SN-04 | when disconnected, internal store change → patch queued; flushes on reconnect | sendPatch() called after reconnect |
| SN-05 | incoming network patch → applied to store | patched note's Label readable in store after patch delivery |

## SS — Presence

| # | Description | Expected |
|---|---|---|
| SS-01 | setPresenceTo() calls presence.sendLocalState() | sendLocalState() called |
| SS-02 | onPresenceChange fires with 'local' origin when setPresenceTo is called | handler called with ('local') |
| SS-03 | incoming remote presence triggers onPresenceChange with 'remote' origin | handler called with ('remote') |
| SS-04 | peer not seen for PresenceTimeoutMs → onPresenceChange fires with State=undefined | handler called with undefined state |
| SS-05 | setPresenceTo({ custom: {...} }) passes custom data to presence.sendLocalState | sendLocalState() called with correct custom field |
