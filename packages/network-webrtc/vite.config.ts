/*******************************************************************************
*                                                                              *
*                      vite config — network-webrtc                            *
*                                                                              *
*******************************************************************************/

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/sds-network-webrtc.ts'),
      formats:  ['es'],
      fileName: 'sds-network-webrtc',
    },
    outDir: 'dist',
    rollupOptions: {
      // uses native browser RTCPeerConnection — no external library needed
      // WebSocket provider used as signalling + fallback channel
      external: ['@rozek/sds-core', '@rozek/sds-network-websocket'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
