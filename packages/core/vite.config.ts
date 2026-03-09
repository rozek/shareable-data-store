/*******************************************************************************
*                                                                              *
*                           vite config — core                                 *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
    // only discover tests under src/. The scripts/ directory contains
    // maintenance utilities (e.g. the canonical snapshot generator) that are
    // run on demand and must not be part of the regular test suite.
    include: ['src/**/*.{test,spec}.{ts,mts,cts}'],
  },
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-core.ts'),
      formats:  ['es'],
      fileName: 'sds-core',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [/^json-joy/],  // json-joy is a peer dependency — never bundle it
    },
  },
  plugins: [
    dts({ rollupTypes:true }),
  ],
})
