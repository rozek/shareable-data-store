/*******************************************************************************
*                                                                              *
*                         vite config — core-loro                              *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
    // No special environment needed.
  },
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-core-loro.ts'),
      formats:  ['es'],
      fileName: 'sds-core-loro',
    },
    outDir: 'dist',
    rollupOptions: {
      // loro-crdt ships WebAssembly; externalize it so consumers handle WASM loading.
      // fflate, fractional-indexing, and zod are pure JS and get bundled.
      external: [/^@rozek\/sds-core/, /^loro-crdt/],
    },
  },
  plugins: [
    dts({ rollupTypes:true }),
  ],
})
