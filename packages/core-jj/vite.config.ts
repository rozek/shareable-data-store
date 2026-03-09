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
      entry:    resolve(__dirname, 'src/sds-core-jj.ts'),
      formats:  ['es'],
      fileName: 'sds-core-jj',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [/^@rozek\/sds-core/, /^json-joy/],
    },
  },
  plugins: [
    dts({ rollupTypes:true }),
  ],
})
