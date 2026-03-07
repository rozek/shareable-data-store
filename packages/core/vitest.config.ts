/*******************************************************************************
*                                                                              *
*                          vitest config — core                                *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // only discover tests under src/. The scripts/ directory contains
    // maintenance utilities (e.g. the canonical snapshot generator) that are
    // run on demand and must not be part of the regular test suite.
    include: ['src/**/*.{test,spec}.{ts,mts,cts}'],
  },
})
