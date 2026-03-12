/*******************************************************************************
*                                                                              *
*                       vitest config — sds-sidecar                            *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include:     ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**', 'src/sds-sidecar.ts'],
    },
  },
})
