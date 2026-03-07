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
      entry:    resolve(__dirname, 'src/sns-network-webrtc.ts'),
      formats:  ['es'],
      fileName: 'sns-network-webrtc',
    },
    outDir: 'dist',
    rollupOptions: {
      // uses native browser RTCPeerConnection — no external library needed
      // WebSocket provider used as signalling + fallback channel
      external: ['@rozek/sns-core', '@rozek/sns-network-websocket'],
    },
  },
  plugins: [ dts({ rollupTypes:true }) ],
})
