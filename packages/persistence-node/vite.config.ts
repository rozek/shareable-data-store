/*******************************************************************************
*                                                                              *
*                      vite config — persistence-node                          *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-persistence-node.ts'),
      formats:  ['es'],
      fileName: 'sds-persistence-node',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [/^node:/, '@rozek/sds-core'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
