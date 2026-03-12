# @rozek/sds-sidecar

The backend-agnostic core library for the **SDS sidecar daemon** family. It implements all CLI argument parsing, SQLite persistence, sync-engine wiring, exponential-backoff reconnect, and HTTP webhook dispatch — behind a single pluggable `SDS_StoreFactory` interface.

This package is **not a standalone CLI**. To run a sidecar daemon, install the backend-specific wrapper for your CRDT backend:

| backend | package |
| --- | --- |
| json-joy | `@rozek/sds-sidecar-jj` |
| Loro | `@rozek/sds-sidecar-loro` |
| Y.js | `@rozek/sds-sidecar-yjs` |

Use `@rozek/sds-sidecar` directly only when implementing support for a custom CRDT backend.

---

## Prerequisites

- **Node.js** 22.5 or later
- A running **SDS WebSocket relay server** reachable at a `ws://` or `wss://` URL
- A valid **JWT** with at minimum `read` scope and an `aud` claim matching the target store ID
- All clients connected to the same relay must use the **same CRDT backend**. Patch and snapshot bytes are backend-specific binary formats; mixing backends causes silent data corruption

---

## Installation

```bash
npm install @rozek/sds-sidecar
```

---

## API

### `SDS_StoreFactory`

The single extension point. Implement this interface to connect any CRDT backend:

```typescript
export interface SDS_StoreFactory {
  fromScratch (): SDS_DataStore        // create a new, empty store
  fromBinary  (Data: Uint8Array): SDS_DataStore  // restore a store from a snapshot
}
```

`SDS_DataStore` is the abstract base class from `@rozek/sds-core`. The concrete implementation is provided by the backend package (e.g. `@rozek/sds-core-jj`).

### `runSidecar`

```typescript
export async function runSidecar (
  Factory:     SDS_StoreFactory,
  CommandName: string = 'sds-sidecar',
): Promise<void>
```

Parses `process.argv`, opens the local SQLite database, loads or creates the store via `Factory`, starts the sync engine, sets up webhook dispatch, and installs SIGINT / SIGTERM handlers. `CommandName` is displayed in `--help` output and log messages; pass the name of the backend-specific binary.

### Implementing a custom backend

```typescript
import { SDS_DataStore }                      from '@rozek/my-sds-backend'
import { runSidecar }                         from '@rozek/sds-sidecar'
import type { SDS_StoreFactory }              from '@rozek/sds-sidecar'

const Factory: SDS_StoreFactory = {
  fromScratch: ()     => SDS_DataStore.fromScratch(),
  fromBinary:  (Data) => SDS_DataStore.fromBinary(Data),
}

if (process.argv[1]?.endsWith('sds-sidecar-custom.js')) {
  runSidecar(Factory, 'sds-sidecar-custom').catch((Signal) => {
    process.stderr.write(`sds-sidecar-custom: fatal: ${(Signal as Error).message}\n`)
    process.exit(1)
  })
}
```

---

## CLI reference

The following options, environment variables, trigger syntax, and webhook payload format apply to all backend-specific wrappers. Refer to the individual backend package README for usage examples.

### Synopsis

```
<backend-cli> <ws-url> <store-id> [options]
```

Both positional arguments may also be supplied through environment variables or a JSON config file; the command-line values always take precedence.

---

### Options

#### Identity

| Option | Description |
| --- | --- |
| `--token <jwt>` | JWT for the WebSocket server (env: `SDS_TOKEN`) |
| `--config <file>` | path to a JSON config file |

#### Persistence

| Option | Description |
| --- | --- |
| `--persist-dir <path>` | directory for the local SQLite database (env: `SDS_PERSISTENCE_DIR`, default: `~/.sds`) |

#### Inline webhook

| Option | Description |
| --- | --- |
| `--webhook-url <url>` | webhook endpoint URL |
| `--webhook-token <token>` | bearer token sent with all outgoing webhook calls (env: `SDS_WEBHOOK_TOKEN`) |
| `--topic <string>` | opaque string echoed in the `Topic` field of every payload from this webhook |
| `--watch <uuid>` | restrict notifications to entries physically nested inside this subtree (identified by UUID) |
| `--depth <n>` | maximum watch depth (default: unlimited) |
| `--on <trigger>` | trigger condition — repeatable; at least one required when `--webhook-url` is set |

> **Note:** `--watch` uses the UUID of the subtree root. Only entries that are physically nested inside that subtree are observed. Entries that are merely linked to from within the subtree are **not** automatically included. If the UUID does not exist in the store at the time a change occurs, the webhook is silently suppressed for that change.

#### Auth-error webhook

| Option | Description |
| --- | --- |
| `--on-auth-error <url>` | Webhook URL to notify when the server rejects the token (uses `--webhook-token` too) |

#### Reconnect tuning

| Option | Default | Description |
| --- | --- | --- |
| `--reconnect-initial <ms>` | 1000 | initial reconnect delay in milliseconds |
| `--reconnect-max <ms>` | 60000 | maximum reconnect delay in milliseconds |
| `--reconnect-jitter <f>` | 0.1 | jitter fraction 0–1 applied to each delay |

---

### Environment Variables

| Variable | Description |
| --- | --- |
| `SDS_SERVER_URL` | WebSocket base URL — must start with `ws://` or `wss://` (overridden by positional `<ws-url>`) |
| `SDS_STORE_ID` | store identifier (overridden by positional `<store-id>`) |
| `SDS_TOKEN` | JWT for the WebSocket server |
| `SDS_WEBHOOK_TOKEN` | Bearer token for all outgoing webhook HTTP calls |
| `SDS_PERSISTENCE_DIR` | directory for the local SQLite database |
| `SDS_ON_AUTH_ERROR` | Webhook URL to notify when the server rejects the token |

---

### JSON Config File

When `--config <file>` is given, options are read from a JSON file. CLI options and environment variables take precedence over file values.

```json
{
  "ServerURL":     "wss://relay.example.com",
  "StoreId":       "my-store",
  "Token":         "<jwt>",
  "PersistenceDir": "/var/lib/sds",
  "WebHookToken":  "<bearer-token>",
  "onAuthError":   "https://admin.example.com/auth-error",

  "reconnect": {
    "initialDelay": 1000,
    "maxDelay":     60000,
    "Jitter":       0.1
  },

  "WebHooks": [
    {
      "URL":      "https://hooks.example.com/store-changed",
      "Topic":    "my-topic",
      "Watch":    "<entry-uuid>",   // UUID of the subtree root; link targets not included
      "maxDepth": 2,
      "on":       [ "create", "delete", "value:application/json" ]
    }
  ]
}
```

---

### Trigger Syntax

Each `--on` value (or `"on"` array element in the config file) is one of:

| Trigger | Fires when… |
| --- | --- |
| `change` | any watched entry changes in any way |
| `create` | a watched entry is moved into a non-trash container |
| `delete` | a watched entry is moved to the trash or purged |
| `value` | the value of a watched item changes |
| `value:<mime-glob>` | the value changes and the item's MIME type matches the glob (e.g. `value:image/*`) |
| `info:<key>=<value>` | the `Info.<key>` field of a watched entry changes to the given value |

MIME globs support `*` (any sequence) and `?` (any single character). Matching is case-insensitive. Only the first `=` in an `info:` trigger is the separator, so values may contain `=`.

---

### Webhook Payload

Every matching webhook receives an HTTP POST with a JSON body. Each request times out after **10 seconds**; a non-2xx response is logged to stderr but does not stop the sidecar.

```json
{
  "StoreId":        "my-store",
  "Trigger":        "value:image/*",
  "Topic":          "my-topic",
  "changedEntries": ["<uuid-1>", "<uuid-2>"],
  "Timestamp":      "2026-01-15T10:30:00.000Z"
}
```

`Topic` is only present when `--topic` (or `"Topic"` in the config file) is set. The `Authorization: Bearer <token>` header is included when a webhook token is set.

---

### Reconnect Behaviour

When the WebSocket connection drops for any reason other than an auth error, the sidecar reconnects automatically using exponential backoff:

- initial delay: `--reconnect-initial` ms (default 1 s)
- doubles each attempt: 1 s → 2 s → 4 s → … → cap
- hard cap: `--reconnect-max` ms (default 60 s)
- ±`--reconnect-jitter` fraction added randomly to each delay (default 10 %)

---

### Auth Errors

When the server closes the WebSocket connection with code **4001** (Unauthorized — JWT rejected) or **4003** (Forbidden — JWT valid but does not match the store's audience), the sidecar:

1. Logs the error to stderr with a clear message
2. Fires the `--on-auth-error` webhook (if configured), with a JSON body:

```json
{
  "StoreId":   "my-store",
  "ServerURL": "wss://relay.example.com",
  "Code":      4001,
  "Reason":    "Unauthorized"
}
```

`Code` is either `4001` (JWT rejected) or `4003` (JWT valid but store audience mismatch). `Reason` is the close-frame reason string, or the label `"Unauthorized"` / `"Forbidden"` when the server sends none.

3. Exits without attempting to reconnect

The bearer token sent with the auth-error webhook is the same `--webhook-token` / `SDS_WEBHOOK_TOKEN` used for all other webhooks — it is entirely separate from the SDS JWT (`--token` / `SDS_TOKEN`).

---

### Exit Codes

| Code | Name | Meaning |
| --- | --- | --- |
| 0 | OK | clean shutdown (SIGINT / SIGTERM) |
| 1 | GeneralError | unspecified runtime error |
| 2 | UsageError | bad arguments or missing required option |
| 3 | NotFound | config file not found |
| 4 | Unauthorized | server rejected the JWT (WS close code 4001) |
| 5 | NetworkError | reserved (not currently used at exit) |
| 6 | Forbidden | JWT valid but store access denied (WS close code 4003) |

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek