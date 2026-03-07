/*******************************************************************************
*                                                                              *
*                       vite config — sync-engine                              *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sns-sync-engine.ts'),
      formats:  ['es'],
      fileName: 'sns-sync-engine',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@rozek/sns-core'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
