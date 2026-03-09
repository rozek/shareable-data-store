/*******************************************************************************
*                                                                              *
*                     vite config — sds-browser-bundle-yjs                     *
*                                                                              *
* Bundles core-yjs + network-websocket + network-webrtc + persistence-browser  *
* + sync-engine — plus all their npm dependencies (yjs, fflate,               *
* fractional-indexing, zod) — into a single, self-contained ESM file.         *
*                                                                              *
* The CRDT backend is Y.js (@rozek/sds-core-yjs).                             *
*                                                                              *
* There are intentionally NO externals: the resulting file can be served from  *
* your own infrastructure without any third-party CDN dependency, which makes  *
* it straightforward to achieve GDPR / DSGVO compliance.                       *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-browser-bundle-yjs.ts'),
      formats:  ['es'],
      fileName: 'sds-browser-bundle-yjs',
    },
    outDir: 'dist',
    rollupOptions: {
      // No externals — every dependency is inlined into the bundle.
    },
  },
  resolve: {
    alias: {
      // @rozek/sds-core must be aliased before @rozek/sds-core-yjs so that
      // the longer prefix wins (both share the '@rozek/sds-core' prefix).
      '@rozek/sds-core-yjs':            resolve(__dirname, '../core-yjs/src/sds-core-yjs.ts'),
      '@rozek/sds-core':                resolve(__dirname, '../core/src/sds-core.ts'),
      '@rozek/sds-network-websocket':   resolve(__dirname, '../network-websocket/src/sds-network-websocket.ts'),
      '@rozek/sds-network-webrtc':      resolve(__dirname, '../network-webrtc/src/sds-network-webrtc.ts'),
      '@rozek/sds-persistence-browser': resolve(__dirname, '../persistence-browser/src/sds-persistence-browser.ts'),
      '@rozek/sds-sync-engine':         resolve(__dirname, '../sync-engine/src/sds-sync-engine.ts'),
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
})
