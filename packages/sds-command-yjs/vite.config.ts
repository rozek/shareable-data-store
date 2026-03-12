/*******************************************************************************
*                                                                              *
*                      vite config — sds-command-yjs                           *
*                                                                              *
*******************************************************************************/

import { resolve }     from 'path'
import { defineConfig } from 'vite'
import dts              from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-command-yjs.ts'),
      formats:  ['es'],
      fileName: 'sds-command-yjs',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        'commander',
        '@rozek/sds-command',
        '@rozek/sds-core',
        '@rozek/sds-core-yjs',
        '@rozek/sds-network-websocket',
        '@rozek/sds-persistence-node',
        '@rozek/sds-sync-engine',
      ],
      output: {
        banner: '#!/usr/bin/env -S node --no-warnings',
      },
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
