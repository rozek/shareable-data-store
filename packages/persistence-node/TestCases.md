# Test Cases — @rozek/sns-persistence-node

## PC — Construction

| # | Description | Expected |
|---|---|---|
| PC-01 | construct with valid path and storeId | no exception; instance created |
| PC-02 | auto-creates snapshots, patches, values tables on first open | tables exist after construction |

## PS — Snapshot

| # | Description | Expected |
|---|---|---|
| PS-01 | loadSnapshot on empty DB returns null | `null` |
| PS-02 | saveSnapshot then loadSnapshot returns same bytes | deep-equal Uint8Array |
| PS-03 | saveSnapshot twice overwrites previous | second snapshot is returned |
| PS-04 | saveSnapshot / close / reopen / loadSnapshot survives restart | data survives close/reopen |

## PP — Patches

| # | Description | Expected |
|---|---|---|
| PP-01 | loadPatchesSince on empty DB returns [] | `[]` |
| PP-02 | appendPatch then loadPatchesSince(0) returns that patch | array with one Uint8Array |
| PP-03 | multiple patches returned in clock order | sorted ascending |
| PP-04 | loadPatchesSince(clock) returns only patches after clock | filters correctly |
| PP-05 | prunePatches removes patches with clock < threshold | patches below threshold gone |
| PP-06 | appendPatch with duplicate clock is ignored (INSERT OR IGNORE) | no error; only first persisted |

## PV — Values

| # | Description | Expected |
|---|---|---|
| PV-01 | loadValue for unknown hash returns null | `null` |
| PV-02 | saveValue then loadValue returns same bytes | deep-equal Uint8Array |
| PV-03 | saveValue same hash twice increments ref_count | ref_count = 2 after two saves |
| PV-04 | releaseValue decrements ref_count; at 0 row is deleted | loadValue returns null after two releases |
| PV-05 | releaseValue below 0 is safe (no negative ref_count; row deleted) | no exception; row gone |
