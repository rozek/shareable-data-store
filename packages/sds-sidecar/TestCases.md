# Test Cases — @rozek/sds-sidecar

## PS — `parseTriggerSpec`

| # | Description | Expected | Builds on |
|---|---|---|---|
| PS-01 | `parseTriggerSpec('change')`, `'create'`, `'delete'`, `'value'` | `{ Kind:'change' }` etc. — same direct-equality branch for all four | — |
| PS-02 | `parseTriggerSpec('value:image/*')` | `{ Kind:'value', MIMEGlob:'image/*' }` | PS-01 |
| PS-03 | `parseTriggerSpec('value:')` — empty glob | throws `SDS_SidecarError` | PS-02 |
| PS-04 | `parseTriggerSpec('info:public=true')` | `{ Kind:'info', Key:'public', Value:'true' }` | PS-01 |
| PS-05 | `parseTriggerSpec('info:token=abc=def')` — `=` in value | `{ Kind:'info', Key:'token', Value:'abc=def' }` | PS-04 |
| PS-06 | `parseTriggerSpec('info:')` and `parseTriggerSpec('info:=value')` — `EqIdx < 1` in both cases | throws `SDS_SidecarError` | PS-04 |
| PS-07 | `parseTriggerSpec('unknown')` and `parseTriggerSpec('')` | throws `SDS_SidecarError` | — |

## BD — Backoff Delay Formula (`SidecarNetworkProvider`)

| # | Description | Expected | Builds on |
|---|---|---|---|
| BD-01 | `Math.min(1000 * 2^n, 60000)` for attempts 0–7 | `[1000, 2000, 4000, 8000, 16000, 32000, 60000, 60000]` | — |
| BD-02 | 50 random jitter samples at base 8000 ms, jitter 0.1 | each sample ∈ `[0, ceil(8000 * 1.1)]` | BD-01 |

## SC — Subscription Contract (`SidecarNetworkProvider`)

| # | Description | Expected | Builds on |
|---|---|---|---|
| SC-01 | call `Off()` from `onPatch` twice; call `Off()` from `onAuthError` twice | no throw in all four calls (idempotent unsubscribe) | — |
| SC-02 | `new SidecarNetworkProvider('my-store', …)` | `ConnectionState === 'disconnected'`; `StoreId === 'my-store'` | — |

## MG — MIME Glob Matching (`WebHookManager`, inline helper)

| # | Description | Expected | Builds on |
|---|---|---|---|
| MG-01 | `matchesMIMEGlob('image/png', 'image/*')` and `matchesMIMEGlob('video/mp4', 'image/*')` | `true`; `false` | — |
| MG-02 | `matchesMIMEGlob('text/plain', '*/*')` | `true` | MG-01 |
| MG-03 | `matchesMIMEGlob('application/json', 'application/json')` and `matchesMIMEGlob('application/xml', 'application/json')` | `true`; `false` | — |
| MG-04 | `matchesMIMEGlob('Image/PNG', 'image/*')` and `matchesMIMEGlob('image/png', 'Image/*')` | `true`; `true` | MG-01 |
| MG-05 | `matchesMIMEGlob('image/svgXxml', 'image/svg.xml')` and `matchesMIMEGlob('image/svg.xml', 'image/svg.xml')` | `false`; `true` | MG-01 |

## DC — Depth-Check Formula (`WebHookManager`, inline)

| # | Description | Expected | Builds on |
|---|---|---|---|
| DC-01 | chain `[{Id:'watch'},{Id:'root'}]`, watchId `'watch'` → `findIndex + 1` | `1` (direct child) | — |
| DC-02 | chain `[{Id:'parent'},{Id:'root'}]`, watchId `'other'` → `findIndex` | `-1` (not in subtree) | DC-01 |
