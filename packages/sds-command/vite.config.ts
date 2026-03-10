/*******************************************************************************
*                                                                              *
*                        vite config — sds-command                             *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-command.ts'),
      formats:  ['es'],
      fileName: 'sds-command',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        'commander',
        '@rozek/sds-core',
        '@rozek/sds-core-jj',
        '@rozek/sds-network-websocket',
        '@rozek/sds-persistence-node',
        '@rozek/sds-sync-engine',
        'better-sqlite3',
      ],
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
