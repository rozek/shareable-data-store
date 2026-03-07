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
      entry:    resolve(__dirname, 'src/sns-persistence-browser.ts'),
      formats:  ['es'],
      fileName: 'sns-persistence-browser',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@rozek/sns-core'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
