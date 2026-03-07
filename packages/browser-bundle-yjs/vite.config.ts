/*******************************************************************************
*                                                                              *
*                     vite config — sns-browser-bundle-yjs                     *
*                                                                              *
* Bundles core-yjs + network-websocket + network-webrtc + persistence-browser  *
* + sync-engine — plus all their npm dependencies (yjs, fflate,               *
* fractional-indexing, zod) — into a single, self-contained ESM file.         *
*                                                                              *
* The CRDT backend is Y.js (@rozek/sns-core-yjs).                             *
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
      entry:    resolve(__dirname, 'src/sns-browser-bundle-yjs.ts'),
      formats:  ['es'],
      fileName: 'sns-browser-bundle-yjs',
    },
    outDir: 'dist',
    rollupOptions: {
      // No externals — every dependency is inlined into the bundle.
    },
  },
  resolve: {
    alias: {
      // @rozek/sns-core must be aliased before @rozek/sns-core-yjs so that
      // the longer prefix wins (both share the '@rozek/sns-core' prefix).
      '@rozek/sns-core-yjs':            resolve(__dirname, '../core-yjs/src/sns-core-yjs.ts'),
      '@rozek/sns-core':                resolve(__dirname, '../core/src/sns-core.ts'),
      '@rozek/sns-network-websocket':   resolve(__dirname, '../network-websocket/src/sns-network-websocket.ts'),
      '@rozek/sns-network-webrtc':      resolve(__dirname, '../network-webrtc/src/sns-network-webrtc.ts'),
      '@rozek/sns-persistence-browser': resolve(__dirname, '../persistence-browser/src/sns-persistence-browser.ts'),
      '@rozek/sns-sync-engine':         resolve(__dirname, '../sync-engine/src/sns-sync-engine.ts'),
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
})
