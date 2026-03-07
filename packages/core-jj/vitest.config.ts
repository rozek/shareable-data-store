/*******************************************************************************
*                                                                              *
*                         vitest config — core-jj                              *
*                                                                              *
*******************************************************************************/

import { createRequire }  from 'module'
import { defineConfig }   from 'vitest/config'

// Resolve json-joy to its real filesystem path (bypassing the pnpm symlink).
// Without this, Vite maps json-joy to a virtual path that breaks the CJS
// internal relative require() calls at runtime.
const _require   = createRequire(import.meta.url)
const jsonJoyDir = _require.resolve('json-joy/lib/index.js')
  .replace(/\/lib\/index\.js$/, '')

export default defineConfig({
  resolve: {
    alias: {
      // Route bare json-joy imports to the real package directory so that
      // CJS require('./nodes') and friends resolve against the actual file
      // system rather than Vite's virtual module path.
      'json-joy': jsonJoyDir,
    },
  },
  test: {
    globals: true,
  },
})
