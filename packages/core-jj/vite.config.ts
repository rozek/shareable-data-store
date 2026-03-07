/*******************************************************************************
*                                                                              *
*                          vite config — core-jj                               *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sns-core-jj.ts'),
      formats:  ['es'],
      fileName: 'sns-core-jj',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [/^@rozek\/sns-core/, /^json-joy/],
    },
  },
  plugins: [
    dts({ rollupTypes:true }),
  ],
})
