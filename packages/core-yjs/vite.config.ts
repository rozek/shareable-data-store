/*******************************************************************************
*                                                                              *
*                         vite config — core-yjs                               *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
    // No special environment needed — Y.js works in Node.js natively.
  },
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sns-core-yjs.ts'),
      formats:  ['es'],
      fileName: 'sns-core-yjs',
    },
    outDir: 'dist',
    rollupOptions: {
      // yjs, fflate, fractional-indexing, zod are bundled (not peer deps)
      external: [/^@rozek\/sns-core/],
    },
  },
  plugins: [
    dts({ rollupTypes:true }),
  ],
})
