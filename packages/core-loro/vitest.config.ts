/*******************************************************************************
*                                                                              *
*                        vitest config — core-loro                             *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'

// loro-crdt ships a pre-built WASM binary and a Node.js-compatible JS wrapper.
// Vitest runs in Node.js which supports WASM natively, so no additional setup
// is required — the default 'node' environment is sufficient.

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    include:     ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**'],
    },
  },
})
