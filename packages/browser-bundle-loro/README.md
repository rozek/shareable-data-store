# @rozek/sds-browser-bundle-loro

A **single ESM file** that bundles the **shareable-data-store** (SNS) stack for browser use with the **Loro CRDT** backend:

- `@rozek/sds-core-loro` — store, notes, links, **Loro CRDT engine** (concrete implementation)
- `@rozek/sds-network-websocket` — WebSocket sync & presence
- `@rozek/sds-network-webrtc` — WebRTC peer-to-peer sync & presence
- `@rozek/sds-persistence-browser` — IndexedDB persistence
- `@rozek/sds-sync-engine` — coordination & lifecycle

> **Note:** This bundle uses [**Loro CRDT**](https://loro.dev) as its CRDT backend (`@rozek/sds-core-loro`). If you need a different backend, use `@rozek/sds-browser-bundle-jj` (json-joy) or `@rozek/sds-browser-bundle-yjs` (Y.js) instead.

> ⚠️ `loro-crdt` **is NOT bundled.** Loro ships WebAssembly (`.wasm`) which cannot be inlined by Rollup/Vite. You must provide `loro-crdt` separately — see [Setup](#setup-loro-crdt-external-dependency) below.

All other npm dependencies (`fflate`, `fractional-indexing`, `zod`) are inlined — only `loro-crdt` must be provided externally.

---

## Why a bundle?

Every `import` statement in a browser application potentially loads code from a third-party server. `@rozek/sds-browser-bundle-loro` bundles the entire SNS infrastructure layer into a single auditable file that you serve from your own server. Only `loro-crdt` remains external due to its WebAssembly payload.

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
    "loro-crdt":                      "/js/loro-crdt.js",
    "@rozek/sds-browser-bundle-loro": "/js/sds-browser-bundle-loro.js"
  }
}
</script>
```

### Option B — CDN

```html
<script type="importmap">
{
  "imports": {
    "loro-crdt":                      "https://esm.sh/loro-crdt@latest",
    "@rozek/sds-browser-bundle-loro": "/js/sds-browser-bundle-loro.js"
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
    SDS_NoteStore,
    SDS_BrowserPersistenceProvider,
    SDS_WebSocketProvider,
    SDS_SyncEngine,
  } from '@rozek/sds-browser-bundle-loro'

  // ── build the stack ────────────────────────────────────────────

  const NoteStore   = SDS_NoteStore.fromScratch()
  const Persistence = new SDS_BrowserPersistenceProvider('my-store-id')
  const Network     = new SDS_WebSocketProvider('my-store-id')
  const SyncEngine  = new SDS_SyncEngine(NoteStore, {
    PersistenceProvider:Persistence,
    NetworkProvider: Network,
    PresenceProvider:Network,   // WebSocketProvider implements both
  })

  await SyncEngine.start()
  await SyncEngine.connectTo('wss://my-relay.example.com/sync', { Token:'<jwt>' })

  // ── work with notes ────────────────────────────────────────────

  const Note = NoteStore.newNoteAt(NoteStore.RootNote)
  Note.Label = 'Hello from the Loro bundle!'

  NoteStore.onChangeInvoke((Origin,ChangeSet) => {
    console.log('changed:', ChangeSet)
  })

  window.addEventListener('beforeunload', () => SyncEngine.stop())
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
      // Note: @rozek/sds-core-loro must come before @rozek/sds-core so the
      // longer prefix wins the alias match.
      '@rozek/sds-core-loro': '/public/js/sds-browser-bundle-loro.js',
      '@rozek/sds-core': '/public/js/sds-browser-bundle-loro.js',
      '@rozek/sds-network-websocket': '/public/js/sds-browser-bundle-loro.js',
      '@rozek/sds-network-webrtc': '/public/js/sds-browser-bundle-loro.js',
      '@rozek/sds-persistence-browser': '/public/js/sds-browser-bundle-loro.js',
      '@rozek/sds-sync-engine': '/public/js/sds-browser-bundle-loro.js',
      // loro-crdt must remain external and be resolved at runtime
      'loro-crdt': 'loro-crdt',
    },
  },
})
```

Then import as normal — `loro-crdt` will be resolved from your import map at runtime:

```typescript
import { SDS_NoteStore }                  from '@rozek/sds-core-loro'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'
```

---

## Exports

The bundle re-exports the complete public API of all constituent packages. Refer to their individual READMEs for full API documentation:

| Export | Source package |
| --- | --- |
| `SDS_NoteStore`, `SDS_Entry`, `SDS_Note`, `SDS_Link`, `SDS_Error` | `@rozek/sds-core-loro` (Loro CRDT backend) |
| `SDS_ChangeSet`, `SDS_SyncCursor`, `SDS_PatchSeqNumber` | `@rozek/sds-core` (re-exported via `@rozek/sds-core-loro`) |
| `SDS_PersistenceProvider`, `SDS_NetworkProvider`, `SDS_PresenceProvider` | `@rozek/sds-core` (re-exported via `@rozek/sds-core-loro`) |
| `SDS_WebSocketProvider` | `@rozek/sds-network-websocket` |
| `SDS_WebRTCProvider`, `SDS_WebRTCProviderOptions` | `@rozek/sds-network-webrtc` |
| `SDS_BrowserPersistenceProvider` | `@rozek/sds-persistence-browser` |
| `SDS_SyncEngine`, `SDS_SyncEngineOptions` | `@rozek/sds-sync-engine` |

**Note:** `loro-crdt` itself is not re-exported; it is loaded as a side-effect by `@rozek/sds-core-loro` at import time.

---

## Common usage patterns

### Offline-first, no network

```typescript
import {
  SDS_NoteStore,
  SDS_BrowserPersistenceProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-loro'

const NoteStore   = SDS_NoteStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('personal-notes')
const SyncEngine  = new SDS_SyncEngine(NoteStore, { PersistenceProvider:Persistence })

await SyncEngine.start()

const Note = NoteStore.newNoteAt(NoteStore.RootNote)
Note.Label = 'Survives page reloads via IndexedDB'
```

### Real-time collaboration over WebSocket

```typescript
import {
  SDS_NoteStore,
  SDS_BrowserPersistenceProvider,
  SDS_WebSocketProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-loro'

const NoteStore   = SDS_NoteStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('collab-store')
const Network     = new SDS_WebSocketProvider('collab-store')

const SyncEngine = new SDS_SyncEngine(NoteStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })
```

### Peer-to-peer collaboration over WebRTC (with WebSocket fallback)

```typescript
import {
  SDS_NoteStore,
  SDS_BrowserPersistenceProvider,
  SDS_WebSocketProvider,
  SDS_WebRTCProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-loro'

const NoteStore   = SDS_NoteStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('p2p-store')
const wsFallback  = new SDS_WebSocketProvider('p2p-store')
const Network     = new SDS_WebRTCProvider('p2p-store', { Fallback:wsFallback })

const SyncEngine = new SDS_SyncEngine(NoteStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })
```

### Automatic trash expiry

```typescript
import { SDS_NoteStore } from '@rozek/sds-browser-bundle-loro'

const NoteStore = SDS_NoteStore.fromScratch({
  TrashTTLms:7 * 24 * 60 * 60 * 1000,  // purge after 7 days
})

window.addEventListener('beforeunload', () => NoteStore.dispose())
```

---

## Building the bundle yourself

From the monorepo root:

```bash
pnpm --filter @rozek/sds-browser-bundle-loro build
```

The output is written to `packages/browser-bundle-loro/dist/`:

| File | Description |
| --- | --- |
| `sds-browser-bundle-loro.js` | ESM file (≈ 163 KB raw, ≈ 36 KB gzip); `loro-crdt` external |
| `sds-browser-bundle-loro.d.ts` | Rolled-up TypeScript declarations |

---

## License

MIT © Andreas Rozek