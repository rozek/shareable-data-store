# Test Cases — @rozek/sns-persistence-browser

## BC — Construction

| # | Description | Expected |
|---|---|---|
| BC-01 | construct with a storeId and call loadSnapshot (lazy-opens DB) | no exception; returns null |

## BS — Snapshot

| # | Description | Expected |
|---|---|---|
| BS-01 | loadSnapshot on empty DB returns null | `null` |
| BS-02 | saveSnapshot then loadSnapshot returns same bytes | deep-equal Uint8Array |
| BS-03 | saveSnapshot twice overwrites previous | second snapshot is returned |

## BP — Patches

| # | Description | Expected |
|---|---|---|
| BP-01 | loadPatchesSince on empty DB returns [] | `[]` |
| BP-02 | appendPatch then loadPatchesSince(0) returns that patch | array with one Uint8Array |
| BP-03 | multiple patches returned in ascending clock order | sorted correctly |
| BP-04 | loadPatchesSince(clock) returns only patches after clock | filters correctly |
| BP-05 | prunePatches removes patches with clock < threshold | patches below threshold gone |

## BV — Values

| # | Description | Expected |
|---|---|---|
| BV-01 | loadValue for unknown hash returns null | `null` |
| BV-02 | saveValue then loadValue returns same bytes | deep-equal Uint8Array |
| BV-03 | saveValue same hash twice; two releaseValue calls delete row | null after two releases |
| BV-04 | releaseValue on unknown hash does not throw | resolves without error |
