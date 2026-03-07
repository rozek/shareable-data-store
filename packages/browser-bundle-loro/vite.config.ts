/*******************************************************************************
*                                                                              *
*                    vite config — sns-browser-bundle-loro                      *
*                                                                              *
* Bundles core-loro + network-websocket + network-webrtc + persistence-browser *
* + sync-engine — plus fflate, fractional-indexing, zod — into a single,     *
* self-contained ESM file.                                                     *
*                                                                              *
* The CRDT backend is Loro (@rozek/sns-core-loro).                            *
*                                                                              *
* IMPORTANT — loro-crdt is kept EXTERNAL:                                      *
* loro-crdt ships WebAssembly, which cannot be inlined by Rollup/Vite without  *
* special WASM handling. Consumers must provide loro-crdt themselves (e.g. via *
* an import map pointing to a CDN or self-hosted copy).  See README.md for    *
* detailed setup instructions.                                                  *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sns-browser-bundle-loro.ts'),
      formats:  ['es'],
      fileName: 'sns-browser-bundle-loro',
    },
    outDir: 'dist',
    rollupOptions: {
      // loro-crdt ships WebAssembly and must remain external.
      // All other dependencies (fflate, fractional-indexing, zod) are inlined.
      external: [/^loro-crdt/],
    },
  },
  resolve: {
    alias: {
      // @rozek/sns-core must be aliased before @rozek/sns-core-loro so that
      // the longer prefix wins (both share the '@rozek/sns-core' prefix).
      '@rozek/sns-core-loro':           resolve(__dirname, '../core-loro/src/sns-core-loro.ts'),
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
