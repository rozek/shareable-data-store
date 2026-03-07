/*******************************************************************************
*                                                                              *
*                      vitest config — sync-engine                             *
*                                                                              *
*******************************************************************************/

import { createRequire }  from 'module'
import { defineConfig }   from 'vitest/config'

// Resolve json-joy to its real filesystem path (bypassing the pnpm symlink).
// This is needed because sns-core-jj is used as the test NoteStore backend,
// which transitively pulls in json-joy.
const _require   = createRequire(import.meta.url)
const jsonJoyDir = _require.resolve('json-joy/lib/index.js')
  .replace(/\/lib\/index\.js$/, '')

export default defineConfig({
  resolve: {
    alias: {
      'json-joy': jsonJoyDir,
    },
  },
  test: {
    globals: true,
  },
})
