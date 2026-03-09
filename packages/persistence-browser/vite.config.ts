/*******************************************************************************
*                                                                              *
*                    vite config — persistence-browser                         *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-persistence-browser.ts'),
      formats:  ['es'],
      fileName: 'sds-persistence-browser',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@rozek/sds-core'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
