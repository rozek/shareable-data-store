# @rozek/sds-browser-bundle-jj

A **single self-contained ESM file** that bundles the entire **shareable-data-store** (SDS) stack for browser use:

- `@rozek/sds-core-jj` — store, items, links, **json-joy CRDT engine** (concrete implementation)
- `@rozek/sds-network-websocket` — WebSocket sync & presence
- `@rozek/sds-network-webrtc` — WebRTC peer-to-peer sync & presence
- `@rozek/sds-persistence-browser` — IndexedDB persistence
- `@rozek/sds-sync-engine` — coordination & lifecycle

> **Data:** This bundle uses [**json-joy**](https://github.com/streamich/json-joy) as its CRDT backend (`@rozek/sds-core-jj`). If you need a different backend, use `@rozek/sds-browser-bundle-yjs` (Y.js) or `@rozek/sds-browser-bundle-loro` (Loro CRDT) instead.

All npm dependencies (`json-joy`, `fflate`, `fractional-indexing`, `zod`) are inlined — there are **no external CDN requests** at runtime.

---

## Prerequisites

| requirement | details |
| --- | --- |
| **Modern browser** | requires ES module support (`<script type="module">`). Any evergreen browser is supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. |
| **Web server** | The bundle file must be served over HTTP/HTTPS — `file://` URLs do not support ES modules. |

This package targets **browsers only**. All SDS and third-party dependencies (`json-joy`, `fflate`, `fractional-indexing`, `zod`) are inlined — no CDN requests at runtime.

---

## Why a bundle?

Every `import` statement in a browser application potentially loads code from a third-party server. With the standard per-package installation approach that means separate network requests to your own server for the SDS packages, plus requests to CDNs or npm mirrors for `json-joy`, `fflate`, etc.

`@rozek/sds-browser-bundle-jj` eliminates that: copy `dist/sds-browser-bundle-jj.js` (≈ 439 KB raw, ≈ 100 KB gzip) to your own infrastructure and point your application's import map or bundler at it. Every byte of SDS code then comes from a single, auditable file served exclusively from your server — making it straightforward to demonstrate **GDPR / DSGVO compliance**.

---

## Usage

### Via an import map (no bundler required)

Copy `dist/sds-browser-bundle-jj.js` to your web server, then declare an import map in your HTML:

```html
<script type="importmap">
{
  "imports": {
    "@rozek/sds-browser-bundle-jj": "/js/sds-browser-bundle-jj.js"
  }
}
</script>

<script type="module">
  import {
    SDS_DataStore,
    SDS_BrowserPersistenceProvider,
    SDS_WebSocketProvider,
    SDS_SyncEngine,
  } from '@rozek/sds-browser-bundle-jj'

  // ── build the stack ────────────────────────────────────────────

  const DataStore   = SDS_DataStore.fromScratch()
  const Persistence = new SDS_BrowserPersistenceProvider('my-store-id')
  const Network     = new SDS_WebSocketProvider('my-store-id')
  const SyncEngine  = new SDS_SyncEngine(DataStore, {
    PersistenceProvider:Persistence,
    NetworkProvider: Network,
    PresenceProvider:Network,   // WebSocketProvider implements both
  })

  await SyncEngine.start()
  await SyncEngine.connectTo('wss://my-relay.example.com/sync', { Token:'<jwt>' })

  // ── work with items ────────────────────────────────────────────

  const Data = DataStore.newItemAt(undefined, DataStore.RootItem)
  Data.Label = 'Hello from the browser bundle!'
  Data.writeValue('No CDN, no third-party dependencies!')

  DataStore.onChangeInvoke((Origin,ChangeSet) => {
    console.log('changed:',ChangeSet)
  })

  // ── clean up on page unload ────────────────────────────────────

  window.addEventListener('beforeunload', () => SyncEngine.stop())
</script>
```

### Via a bundler (Vite, Rollup, webpack, …)

If your project uses its own bundler, add the bundle as an external dependency alias so it is not bundled a second time:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      // redirect all SDS packages to the single bundle file
      // Data: @rozek/sds-core-jj must come before @rozek/sds-core so the
      // longer prefix wins the alias match.
      '@rozek/sds-core-jj': '/public/js/sds-browser-bundle-jj.js',
      '@rozek/sds-core': '/public/js/sds-browser-bundle-jj.js',
      '@rozek/sds-network-websocket': '/public/js/sds-browser-bundle-jj.js',
      '@rozek/sds-network-webrtc': '/public/js/sds-browser-bundle-jj.js',
      '@rozek/sds-persistence-browser': '/public/js/sds-browser-bundle-jj.js',
      '@rozek/sds-sync-engine': '/public/js/sds-browser-bundle-jj.js',
    },
  },
})
```

Then import as normal:

```typescript
import { SDS_DataStore }                  from '@rozek/sds-core'
import { SDS_BrowserPersistenceProvider } from '@rozek/sds-persistence-browser'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'
```

---

## Exports

The bundle re-exports the complete public API of all constituent packages. Refer to their individual READMEs for full API documentation:

| Export | Source package |
| --- | --- |
| `SDS_DataStore`, `SDS_Entry`, `SDS_Item`, `SDS_Link` | `@rozek/sds-core-jj` (json-joy backend) |
| `SDS_Error`, `SDS_ChangeSet`, `SDS_SyncCursor`, `SDS_PatchSeqNumber` | `@rozek/sds-core` (re-exported via `@rozek/sds-core-jj`) |
| `SDS_PersistenceProvider`, `SDS_NetworkProvider`, `SDS_PresenceProvider` | `@rozek/sds-core` (re-exported via `@rozek/sds-core-jj`) |
| `SDS_WebSocketProvider` | `@rozek/sds-network-websocket` |
| `SDS_WebRTCProvider`, `SDS_WebRTCProviderOptions` | `@rozek/sds-network-webrtc` |
| `SDS_BrowserPersistenceProvider` | `@rozek/sds-persistence-browser` |
| `SDS_SyncEngine`, `SDS_SyncEngineOptions` | `@rozek/sds-sync-engine` |

---

## Common usage patterns

### Offline-first, no network

```typescript
import {
  SDS_DataStore,
  SDS_BrowserPersistenceProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-jj'

const DataStore = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('personal-store')
const Engine = new SDS_SyncEngine(DataStore, { PersistenceProvider:Persistence })

await Engine.start()

const Data = DataStore.newItemAt(undefined, DataStore.RootItem)
Data.Label = 'Survives page reloads via IndexedDB'
```

### Real-time collaboration over WebSocket

```typescript
import {
  SDS_DataStore,
  SDS_BrowserPersistenceProvider,
  SDS_WebSocketProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-jj'

const DataStore   = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('collab-store')
const Network     = new SDS_WebSocketProvider('collab-store')

const SyncEngine = new SDS_SyncEngine(DataStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })

// track remote peers
SyncEngine.onPresenceChange((PeerId,PeerState) => {
  if (PeerState != null) {
    console.log(`peer ${PeerId} joined:`,PeerState)
  } else {
    console.log(`peer ${PeerId} left`)
  }
})
```

### Peer-to-peer collaboration over WebRTC (with WebSocket fallback)

```typescript
import {
  SDS_DataStore,
  SDS_BrowserPersistenceProvider,
  SDS_WebSocketProvider,
  SDS_WebRTCProvider,
  SDS_SyncEngine,
} from '@rozek/sds-browser-bundle-jj'

const DataStore   = SDS_DataStore.fromScratch()
const Persistence = new SDS_BrowserPersistenceProvider('p2p-store')
const wsFallback  = new SDS_WebSocketProvider('p2p-store')
const Network     = new SDS_WebRTCProvider('p2p-store', { Fallback:wsFallback })

const SyncEngine = new SDS_SyncEngine(DataStore, {
  PersistenceProvider:Persistence,
  NetworkProvider: Network,
  PresenceProvider:Network,
})

await SyncEngine.start()
await SyncEngine.connectTo('wss://relay.example.com/sync', { Token:'<jwt>' })
```

### Automatic trash expiry

```typescript
import { SDS_DataStore } from '@rozek/sds-browser-bundle-jj'

const DataStore = SDS_DataStore.fromScratch({
  TrashTTLms:7 * 24 * 60 * 60 * 1000,  // purge after 7 days
})

// remember to stop the internal timer when the store is no longer needed
window.addEventListener('beforeunload', () => DataStore.dispose())
```

---

## Building the bundle yourself

From the monorepo root:

```bash
pnpm --filter @rozek/sds-browser-bundle-jj build
```

The output is written to `packages/browser-bundle-jj/dist/`:

| file | description |
| --- | --- |
| `sds-browser-bundle-jj.js` | Single ESM file (≈ 439 KB raw, ≈ 100 KB gzip) |
| `sds-browser-bundle-jj.d.ts` | Rolled-up TypeScript declarations |

---

## License

[MIT License](../../LICENSE.md) © Andreas Rozek