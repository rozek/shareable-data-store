/*******************************************************************************
*                                                                              *
*                     vite config — sds-sidecar-loro                           *
*                                                                              *
*******************************************************************************/

import { resolve }     from 'path'
import { defineConfig } from 'vite'
import dts              from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-sidecar-loro.ts'),
      formats:  ['es'],
      fileName: 'sds-sidecar-loro',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        'commander',
        '@rozek/sds-core',
        '@rozek/sds-core-loro',
        '@rozek/sds-persistence-node',
        '@rozek/sds-sidecar',
        '@rozek/sds-sync-engine',
      ],
      output: {
        banner: '#!/usr/bin/env -S node --no-warnings',
      },
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
