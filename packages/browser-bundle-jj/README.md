# @rozek/sns-browser-bundle-jj

A **single self-contained ESM file** that bundles the entire **shareable-notes-store** (SNS) stack for browser use:

- `@rozek/sns-core-jj` — store, notes, links, **json-joy CRDT engine** (concrete implementation)
- `@rozek/sns-network-websocket` — WebSocket sync & presence
- `@rozek/sns-network-webrtc` — WebRTC peer-to-peer sync & presence
- `@rozek/sns-persistence-browser` — IndexedDB persistence
- `@rozek/sns-sync-engine` — coordination & lifecycle

> **Note:** This bundle uses [**json-joy**](https://github.com/streamich/json-joy) as its CRDT backend (`@rozek/sns-core-jj`). If you need a different backend, use `@rozek/sns-browser-bundle-yjs` (Y.js) or `@rozek/sns-browser-bundle-loro` (Loro CRDT) instead.

All npm dependencies (`json-joy`, `fflate`, `fractional-indexing`, `zod`) are inlined — there are **no external CDN requests** at runtime.

---

## Why a bundle?

Every `import` statement in a browser application potentially loads code from a third-party server. With the standard per-package installation approach that means separate network requests to your own server for the SNS packages, plus requests to CDNs or npm mirrors for `json-joy`, `fflate`, etc.

`@rozek/sns-browser-bundle-jj` eliminates that: copy `dist/sns-browser-bundle-jj.js` (≈ 439 KB raw, ≈ 100 KB gzip) to your own infrastructure and point your application's import map or bundler at it. Every byte of SNS code then comes from a single, auditable file served exclusively from your server — making it straightforward to demonstrate **GDPR / DSGVO compliance**.

---

## Usage

### Via an import map (no bundler required)

Copy `dist/sns-browser-bundle-jj.js` to your web server, then declare an import map in your HTML:

```html
<script type="importmap">
{
  "imports": {
    "@rozek/sns-browser-bundle-jj": "/js/sns-browser-bundle-jj.js"
  }
}
</script>

<script type="module">
  import {
    SNS_NoteStore,
    SNS_BrowserPersistenceProvider,
    SNS_WebSocketProvider,
    SNS_SyncEngine,
  } from '@rozek/sns-browser-bundle-jj'

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
  note.Label = 'Hello from the browser bundle!'
  note.Value = 'No CDN, no third-party dependencies!'

  store.onChangeInvoke((Origin, ChangeSet) => {
    console.log('changed:', ChangeSet)
  })

  // ── clean up on page unload ────────────────────────────────────

  window.addEventListener('beforeunload', () => engine.stop())
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
      // redirect all SNS packages to the single bundle file
      // Note: @rozek/sns-core-jj must come before @rozek/sns-core so the
      // longer prefix wins the alias match.
      '@rozek/sns-core-jj': '/public/js/sns-browser-bundle-jj.js',
      '@rozek/sns-core': '/public/js/sns-browser-bundle-jj.js',
      '@rozek/sns-network-websocket': '/public/js/sns-browser-bundle-jj.js',
      '@rozek/sns-network-webrtc': '/public/js/sns-browser-bundle-jj.js',
      '@rozek/sns-persistence-browser': '/public/js/sns-browser-bundle-jj.js',
      '@rozek/sns-sync-engine': '/public/js/sns-browser-bundle-jj.js',
    },
  },
})
```

Then import as normal:

```typescript
import { SNS_NoteStore }                  from '@rozek/sns-core'
import { SNS_BrowserPersistenceProvider } from '@rozek/sns-persistence-browser'
import { SNS_WebSocketProvider }          from '@rozek/sns-network-websocket'
import { SNS_SyncEngine }                 from '@rozek/sns-sync-engine'
```

---

## Exports

The bundle re-exports the complete public API of all constituent packages. Refer to their individual READMEs for full API documentation:

| Export | Source package |
| --- | --- |
| `SNS_NoteStore`, `SNS_Entry`, `SNS_Note`, `SNS_Link` | `@rozek/sns-core-jj` (json-joy backend) |
| `SNS_Error`, `SNS_ChangeSet`, `SNS_SyncCursor`, `SNS_PatchSeqNumber` | `@rozek/sns-core` (re-exported via `@rozek/sns-core-jj`) |
| `SNS_PersistenceProvider`, `SNS_NetworkProvider`, `SNS_PresenceProvider` | `@rozek/sns-core` (re-exported via `@rozek/sns-core-jj`) |
| `SNS_WebSocketProvider` | `@rozek/sns-network-websocket` |
| `SNS_WebRTCProvider`, `SNS_WebRTCProviderOptions` | `@rozek/sns-network-webrtc` |
| `SNS_BrowserPersistenceProvider` | `@rozek/sns-persistence-browser` |
| `SNS_SyncEngine`, `SNS_SyncEngineOptions` | `@rozek/sns-sync-engine` |

---

## Common usage patterns

### Offline-first, no network

```typescript
import {
  SNS_NoteStore,
  SNS_BrowserPersistenceProvider,
  SNS_SyncEngine,
} from '@rozek/sns-browser-bundle-jj'

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
} from '@rozek/sns-browser-bundle-jj'

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

// track remote peers
engine.onPresenceChange((peerId, state) => {
  if (state != null) {
    console.log(`peer ${peerId} joined:`, state)
  } else {
    console.log(`peer ${peerId} left`)
  }
})
```

### Peer-to-peer collaboration over WebRTC (with WebSocket fallback)

```typescript
import {
  SNS_NoteStore,
  SNS_BrowserPersistenceProvider,
  SNS_WebSocketProvider,
  SNS_WebRTCProvider,
  SNS_SyncEngine,
} from '@rozek/sns-browser-bundle-jj'

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
import { SNS_NoteStore } from '@rozek/sns-browser-bundle-jj'

const store = SNS_NoteStore.fromScratch({
  TrashTTLms:7 * 24 * 60 * 60 * 1000,  // purge after 7 days
})

// remember to stop the internal timer when the store is no longer needed
window.addEventListener('beforeunload', () => store.dispose())
```

---

## Building the bundle yourself

From the monorepo root:

```bash
pnpm --filter @rozek/sns-browser-bundle-jj build
```

The output is written to `packages/browser-bundle-jj/dist/`:

| File | Description |
| --- | --- |
| `sns-browser-bundle-jj.js` | Single ESM file (≈ 439 KB raw, ≈ 100 KB gzip) |
| `sns-browser-bundle-jj.d.ts` | Rolled-up TypeScript declarations |

---

## License

MIT © Andreas Rozek