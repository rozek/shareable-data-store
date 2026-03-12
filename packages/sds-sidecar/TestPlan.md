# Test Plan — `@rozek/sds-sidecar`

---

## Goal

Verify the correctness of the pure-logic components of `sds-sidecar` — trigger parsing, MIME glob matching, depth-check arithmetic, and the backoff/subscription contract of `SidecarNetworkProvider` — without requiring a live WebSocket server or SQLite database.

`@rozek/sds-sidecar` is a backend-agnostic library; the `runSidecar` function and the `SDS_StoreFactory` interface are excluded from unit testing because they require a real `SDS_StoreFactory` implementation, a live WebSocket server, and a local SQLite database. Those integration concerns are covered at the backend-specific level (`sds-sidecar-jj`, `sds-sidecar-loro`, `sds-sidecar-yjs`).

---

## Scope

**In scope:**

- `parseTriggerSpec` (Config.ts) — all accepted trigger formats and all rejection paths
- `DBPathFor` (Config.ts) — path construction and store-ID sanitisation (unit-tested directly in `Config.test.ts`, Part II)
- Reconnect backoff formula (SidecarNetworkProvider) — exponential growth, hard cap, jitter range
- Subscription contract (SidecarNetworkProvider) — idempotent unsubscribe, constructor-property initialisation
- MIME glob matching (WebHookManager, inline re-implementation) — wildcard expansion, case-insensitivity, literal-dot handling
- Depth-check formula (WebHookManager, inline) — `chainIndex + 1` formula and the 'not found' case

**Out of scope:**

- `resolveConfig` (requires filesystem and environment — integration tests)
- `WebHookManager.processChangeSet` and `#filterByTrigger` (require a live `SDS_DataStore`)
- `SidecarNetworkProvider.connect` / disconnect / patch flow (require a live WebSocket server)
- `runSidecar` daemon lifecycle, graceful shutdown, auth-error webhook firing (require a backend factory and live server)
- JWT cryptographic validity (tested by `@rozek/sds-websocket-server`)

---

## Test Environment

- **Runtime:** Node.js 22.5+
- **Test framework:** Vitest 2
- **External dependencies:** none — all tested logic is self-contained or re-implemented inline

---

## Test Modules and Cases

### Part I — `parseTriggerSpec` (Config.test.ts)

The tests are ordered so that each subsequent test may rely on the passing of all earlier tests as assumptions. Redundant tests (same equivalence class, no new code path) have been eliminated.

#### 1.1 Simple keyword triggers

- **TC-PS-01** — `parseTriggerSpec` parses `'change'`, `'create'`, `'delete'`, and bare `'value'` correctly; all four are data variation over the same direct-equality branch pattern

#### 1.2 `value:<mime-glob>` trigger

- **TC-PS-02** — `'value:image/*'` is parsed into `{ Kind:'value', MIMEGlob:'image/*' }`; exercises the `'value:'` prefix path (*`'value:application/json'` is the same class — omitted*)

#### 1.3 Empty MIME glob rejection

- **TC-PS-03** — `'value:'` is rejected with `SDS_SidecarError`; verifies the `trim().length === 0` guard inside the `'value:'` branch

#### 1.4 `info:<key>=<value>` trigger (builds on TC-PS-01)

- **TC-PS-04** — `'info:public=true'` is parsed into `{ Kind:'info', Key:'public', Value:'true' }`; basic key/value split

#### 1.5 `=` in the info value (builds on TC-PS-04)

- **TC-PS-05** — `'info:token=abc=def'` splits at the first `=` only, producing `Value:'abc=def'`; *`'info:status=published'` is the same class as TC-PS-04 — omitted*

#### 1.6 Missing or empty info key (builds on TC-PS-04)

- **TC-PS-06** — both `'info:'` (no `=` at all, `EqIdx === -1`) and `'info:=value'` (empty key, `EqIdx === 0`) fail the `EqIdx < 1` guard; they are the same equivalence class and tested together

#### 1.7 Unknown trigger strings

- **TC-PS-07** — `'unknown'` and `''` both reach the `default` branch and throw `SDS_SidecarError`

---

### Part II — `DBPathFor` (Config.test.ts)

The tests are ordered so that each subsequent test may rely on the passing of all earlier tests as assumptions.

#### 2.1 Safe store ID (no sanitisation needed)

- **TC-DP-01** — a store ID containing only `[a-zA-Z0-9_-]` is returned unchanged inside `PersistenceDir` with a `.db` suffix

#### 2.2 Special-character sanitisation (builds on TC-DP-01)

- **TC-DP-02** — any character outside `[a-zA-Z0-9_-]` (e.g. space, `/`) is replaced with `_`; verifies the regex replace branch

#### 2.3 Output path structure (builds on TC-DP-01)

- **TC-DP-03** — the result always starts with `PersistenceDir` and ends with `.db`, independent of sanitisation

---

### Part III — Reconnect Backoff (SidecarNetworkProvider.test.ts)

#### 3.1 Exponential growth and hard cap

- **TC-BD-01** — The base-delay sequence `[ 1000, 2000, 4000, 8000, 16000, 32000, 60000, 60000 ]` is reproduced exactly; the weaker property "never exceeds MaxDelay" is a direct consequence and is not tested separately

#### 3.2 Jitter range (builds on TC-BD-01)

- **TC-BD-02** — For a fixed base delay of 8 000 ms and jitter of 0.1, 50 random samples all fall within `[0, ceil(base * 1.1)]`

---

### Part IV — Subscription Contract (SidecarNetworkProvider.test.ts)

#### 4.1 Idempotent unsubscribe

- **TC-SC-01** — The function returned by both `onPatch` and `onAuthError` may be called any number of times without throwing; *the two subscribe methods belong to the same equivalence class — tested in one test*

#### 4.2 Constructor properties

- **TC-SC-02** — A freshly created `SidecarNetworkProvider` has `ConnectionState === 'disconnected'` and `StoreId` equal to the constructor argument; *two independent assertions merged into one constructor call*

---

### Part V — MIME Glob Matching (WebHookManager.test.ts)

The helper is private; a local re-implementation (kept in sync with the production code) is used.

#### 5.1 Wildcard subtype — positive and negative

- **TC-MG-01** — `'image/*'` matches `image/png` (same supertype) and does not match `video/mp4` (different supertype); both outcomes tested together because they exercise the same regex path; *`image/jpeg` is the same equivalence class as `image/png` — omitted; `video/*` not matching `audio/ogg` is the same class as `image/*` not matching `video/mp4` — omitted*

#### 5.2 Universal wildcard (builds on TC-MG-01)

- **TC-MG-02** — `'*/*'` matches `text/plain`; one representative is enough because the wildcard expansion logic proved correct in TC-MG-01; *`application/json` and `image/svg+xml` are the same class — omitted*

#### 5.3 Exact match (no wildcard)

- **TC-MG-03** — `'application/json'` matches itself and does not match `'application/xml'`

#### 5.4 Case-insensitivity

- **TC-MG-04** — Both `'Image/PNG'` against `'image/*'` and `'image/png'` against `'Image/*'` return `true`

#### 5.5 Literal dot handling

- **TC-MG-05** — `'image/svg.xml'` matches `'image/svg.xml'` but `'image/svgXxml'` does not; the `.` in the glob is escaped before regex construction

---

### Part VI — Depth-Check Formula (WebHookManager.test.ts)

#### 6.1 Direct child depth

- **TC-DC-01** — When `watchId` is the first element of `outerItemChain`, `findIndex + 1 === 1` (depth 1 = direct child)

#### 6.2 watchId absent (builds on TC-DC-01)

- **TC-DC-02** — When `watchId` is not in the chain at all, `findIndex === -1`; *a grandchild (chainIndex 1 → depth 2) follows directly from the formula proved in TC-DC-01 and is not a separate test*

---

## Running the Tests

```bash
cd packages/sds-sidecar
pnpm test:run
```
