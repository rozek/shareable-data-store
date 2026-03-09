/*******************************************************************************
*                                                                              *
*                    vite config — sds-browser-bundle-loro                      *
*                                                                              *
* Bundles core-loro + network-websocket + network-webrtc + persistence-browser *
* + sync-engine — plus fflate, fractional-indexing, zod — into a single,     *
* self-contained ESM file.                                                     *
*                                                                              *
* The CRDT backend is Loro (@rozek/sds-core-loro).                            *
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
      entry:    resolve(__dirname, 'src/sds-browser-bundle-loro.ts'),
      formats:  ['es'],
      fileName: 'sds-browser-bundle-loro',
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
      // @rozek/sds-core must be aliased before @rozek/sds-core-loro so that
      // the longer prefix wins (both share the '@rozek/sds-core' prefix).
      '@rozek/sds-core-loro':           resolve(__dirname, '../core-loro/src/sds-core-loro.ts'),
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
