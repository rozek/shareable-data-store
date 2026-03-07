# @rozek/sns-browser-bundle-loro

A **single ESM file** that bundles the **shareable-notes-store** (SNS) stack for browser use with the **Loro CRDT** backend:

- `@rozek/sns-core-loro` — store, notes, links, **Loro CRDT engine** (concrete implementation)
- `@rozek/sns-network-websocket` — WebSocket sync & presence
- `@rozek/sns-network-webrtc` — WebRTC peer-to-peer sync & presence
- `@rozek/sns-persistence-browser` — IndexedDB persistence
- `@rozek/sns-sync-engine` — coordination & lifecycle

> **Note:** This bundle uses [**Loro CRDT**](https://loro.dev) as its CRDT backend (`@rozek/sns-core-loro`). If you need a different backend, use `@rozek/sns-browser-bundle-jj` (json-joy) or `@rozek/sns-browser-bundle-yjs` (Y.js) instead.

> ⚠️ **`loro-crdt` is NOT bundled.** Loro ships WebAssembly (`.wasm`) which cannot be inlined by Rollup/Vite. You must provide `loro-crdt` separately — see [Setup](#setup-loro-crdt-external-dependency) below.

All other npm dependencies (`fflate`, `fractional-indexing`, `zod`) are inlined — only `loro-crdt` must be provided externally.

---

## Why a bundle?

Every `import` statement in a browser application potentially loads code from a third-party server. `@rozek/sns-browser-bundle-loro` bundles the entire SNS infrastructure layer into a single auditable file that you serve from your own server. Only `loro-crdt` remains external due to its WebAssembly payload.

Bundle size: ≈ 163 KB raw / ≈ 36 KB gzip (excluding `loro-crdt`).

---

## Setup: `loro-crdt` external dependency

Because Loro uses WebAssembly, `loro-crdt` must be loaded separately. You have two options:

### Option A — Self-hosted (recommended for GDPR compliance)

Download `loro-crdt` from npm and serve it from your own infrastructure:

```bash
npm pack loro-crdt   # produces loro-crdt-x.y.z.tgz
```

Extract and place the ESM file at `/js/loro-crdt.js` (and the `.wasm` file alongside it), then declare both in your import map:

```html
<script type="importmap">
{
  "imports": {
    "loro-crdt":                        "/js/loro-crdt.js",
    "@rozek/sns-browser-bundle-loro":   "/js/sns-browser-bundle-loro.js"
  }
}
</script>
```

### Option B — CDN

```html
<script type="importmap">
{
  "imports": {
    "loro-crdt":                        "https://esm.sh/loro-crdt@latest",
    "@rozek/sns-browser-bundle-loro":   "/js/sns-browser-bundle-loro.js"
  }
}
</script>
```

---

## Usage

### Via an import map (no bundler required)

After setting up the import map as shown above:

```html
<script type="module">
  import {
    SNS_NoteStore,
    SNS_BrowserPersistenceProvider,
    SNS_WebSocketProvider,
    SNS_SyncEngine,
  } from '@rozek/sns-browser-bundle-loro'

  // ── build the stack ────────────────────────────────────────────

  const store = SNS_NoteStore.fromScratch()
  const persistence = new SNS_BrowserPersistenceProvider('my-store-id')
  const network = new SNS_WebSocketProvider('my-store-id')
  const engine = new SNS_SyncEngine(store, {
    PersistenceProvider:persistence,
    NetworkProvider: network,
    PresenceProvider: network,   // WebSocketProvider implements both
  })

  await engine.start()
  await engine.connectTo('wss://my-relay.example.com/sync', { Token:'<jwt>' })

  // ── work with notes ────────────────────────────────────────────

  const note = store.newNoteAt(store.RootNote)
  note.Label = 'Hello from the Loro bundle!'

  store.onChangeInvoke((Origin, ChangeSet) => {
    console.log('changed:', ChangeSet)
  })

  window.addEventListener('beforeunload', () => engine.stop())
</script>
```

### Via a bundler (Vite, Rollup, webpack, …)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      // redirect all SNS packages to the single bundle file
      // Note: @rozek/sns-core-loro must come before @rozek/sns-core so the
      // longer prefix wins the alias match.
      '@rozek/sns-core-loro': '/public/js/sns-browser-bundle-loro.js',
      '@rozek/sns-core': '/public/js/sns-browser-bundle-loro.js',
      '@rozek/sns-network-websocket': '/public/js/sns-browser-bundle-loro.js',
      '@rozek/sns-network-webrtc': '/public/js/sns-browser-bundle-loro.js',
      '@rozek/sns-persistence-browser': '/public/js/sns-browser-bundle-loro.js',
      '@rozek/sns-sync-engine': '/public/js/sns-browser-bundle-loro.js',
      // loro-crdt must remain external and be resolved at runtime
      'loro-crdt': 'loro-crdt',
    },
  },
})
```

Then import as normal — `loro-crdt` will be resolved from your import map at runtime:

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core-loro'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'
```

---

## Exports

The bundle re-exports the complete public API of all constituent packages. Refer to their individual READMEs for full API documentation:

| Export | Source package |
| --- | --- |
| `SNS_NoteStore`, `SNS_Entry`, `SNS_Note`, `SNS_Link`, `SNS_Error` | `@rozek/sns-core-loro` (Loro CRDT backend) |
| `SNS_ChangeSet`, `SNS_SyncCursor`, `SNS_PatchSeqNumber` | `@rozek/sns-core` (re-exported via `@rozek/sns-core-loro`) |
| `SNS_PersistenceProvider`, `SNS_NetworkProvider`, `SNS_PresenceProvider` | `@rozek/sns-core` (re-exported via `@rozek/sns-core-loro`) |
| `SNS_WebSocketProvider` | `@rozek/sns-network-websocket` |
| `SNS_WebRTCProvider`, `SNS_WebRTCProviderOptions` | `@rozek/sns-network-webrtc` |
| `SNS_BrowserPersistenceProvider` | `@rozek/sns-persistence-browser` |
| `SNS_SyncEngine`, `SNS_SyncEngineOptions` | `@rozek/sns-sync-engine` |

**Note:** `loro-crdt` itself is not re-exported; it is loaded as a side-effect by `@rozek/sns-core-loro` at import time.

---

## Common usage patterns

### Offline-first, no network

```typescript
import {
  SNS_NoteStore,
  SNS_BrowserPersistenceProvider,
  SNS_SyncEngine,
} from '@rozek/sns-browser-bundle-loro'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('personal-notes')
const engine = new SNS_SyncEngine(store, { PersistenceProvider:persistence })

await engine.start()

const note = store.newNoteAt(store.RootNote)
note.Label = 'Survives page reloads via IndexedDB'
```

### Real-time collaboration over WebSocket

```typescript
import {
  SNS_NoteStore,
  SNS_BrowserPersistenceProvider,
  SNS_WebSocketProvider,
  SNS_SyncEngine,
} from '@rozek/sns-browser-bundle-loro'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('collab-store')
const network = new SNS_WebSocketProvider('collab-store')

const engine = new SNS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })
```

### Peer-to-peer collaboration over WebRTC (with WebSocket fallback)

```typescript
import {
  SNS_NoteStore,
  SNS_BrowserPersistenceProvider,
  SNS_WebSocketProvider,
  SNS_WebRTCProvider,
  SNS_SyncEngine,
} from '@rozek/sns-browser-bundle-loro'

const store = SNS_NoteStore.fromScratch()
const persistence = new SNS_BrowserPersistenceProvider('p2p-store')
const wsFallback = new SNS_WebSocketProvider('p2p-store')
const network = new SNS_WebRTCProvider('p2p-store', { Fallback:wsFallback })

const engine = new SNS_SyncEngine(store, {
  PersistenceProvider:persistence,
  NetworkProvider: network,
  PresenceProvider: network,
})

await engine.start()
await engine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })
```

### Automatic trash expiry

```typescript
import { SNS_NoteStore } from '@rozek/sns-browser-bundle-loro'

const store = SNS_NoteStore.fromScratch({
  TrashTTLms:7 * 24 * 60 * 60 * 1000,  // purge after 7 days
})

window.addEventListener('beforeunload', () => store.dispose())
```

---

## Building the bundle yourself

From the monorepo root:

```bash
pnpm --filter @rozek/sns-browser-bundle-loro build
```

The output is written to `packages/browser-bundle-loro/dist/`:

| File | Description |
| --- | --- |
| `sns-browser-bundle-loro.js` | ESM file (≈ 163 KB raw, ≈ 36 KB gzip); `loro-crdt` external |
| `sns-browser-bundle-loro.d.ts` | Rolled-up TypeScript declarations |

---

## License

MIT © Andreas Rozek
