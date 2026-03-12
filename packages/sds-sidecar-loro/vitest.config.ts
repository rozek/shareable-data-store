/*******************************************************************************
*                                                                              *
*                      vitest config — sds-sidecar-loro                        *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'

// the CLI smoke tests only spawn the pre-built binary via child_process — they
// do not import any CRDT or SQLite modules, so no special plugins are needed.

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    include:     ['src/tests/**/*.test.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**'],
    },
  },
})
