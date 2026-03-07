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
      entry:    resolve(__dirname, 'src/sns-persistence-node.ts'),
      formats:  ['es'],
      fileName: 'sns-persistence-node',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [/^node:/, '@rozek/sns-core', 'better-sqlite3'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
