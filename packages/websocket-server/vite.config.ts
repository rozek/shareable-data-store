/*******************************************************************************
*                                                                              *
*                     vite config — websocket-server                           *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sns-websocket-server.ts'),
      formats:  ['es'],
      fileName: 'sns-websocket-server',
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [
        /^node:/,
        'hono',
        /^hono\//,
        '@hono/node-server',
        '@hono/node-ws',
        'jose',
      ],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
