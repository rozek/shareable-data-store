/*******************************************************************************
*                                                                              *
*                     vite config — network-websocket                          *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-network-websocket.ts'),
      formats:  ['es'],
      fileName: 'sds-network-websocket',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@rozek/sds-core'],  // uses the native browser WebSocket API — no external WS library needed
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
