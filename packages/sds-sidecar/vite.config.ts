/*******************************************************************************
*                                                                              *
*                        vite config — sds-sidecar                             *
*                                                                              *
*******************************************************************************/

import { resolve }     from 'path'
import { defineConfig } from 'vite'
import dts              from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-sidecar.ts'),
      formats:  ['es'],
      fileName: 'sds-sidecar',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        'commander',
        '@rozek/sds-core',
        '@rozek/sds-persistence-node',
        '@rozek/sds-sync-engine',
      ],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
