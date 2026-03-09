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
      entry:    resolve(__dirname, 'src/sds-sync-engine.ts'),
      formats:  ['es'],
      fileName: 'sds-sync-engine',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@rozek/sds-core'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
