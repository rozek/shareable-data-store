/*******************************************************************************
*                                                                              *
*                    vite config — sds-mcp-server-loro                         *
*                                                                              *
*******************************************************************************/

import { resolve }     from 'path'
import { defineConfig } from 'vite'
import dts              from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-mcp-server-loro.ts'),
      formats:  ['es'],
      fileName: 'sds-mcp-server-loro',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        '@modelcontextprotocol/sdk',
        /^@modelcontextprotocol\//,
        '@rozek/sds-mcp-server',
        '@rozek/sds-core',
        '@rozek/sds-core-loro',
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
