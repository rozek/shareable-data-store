/*******************************************************************************
*                                                                              *
*                      vitest config — sync-engine                             *
*                                                                              *
*******************************************************************************/

import { createRequire }  from 'module'
import { fileURLToPath }  from 'url'
import path               from 'path'
import { defineConfig }   from 'vitest/config'

// Resolve json-joy via sds-core-jj's dist file as the CJS require() base.
// pnpm hoists json-joy under sds-core-jj's node_modules, not this package's,
// so createRequire(import.meta.url) cannot find it. We construct a createRequire()
// anchored to sds-core-jj's own dist file to reach json-joy from there.
const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const coreJJMain = path.join(
  __dirname, 'node_modules', '@rozek', 'sds-core-jj', 'dist', 'sds-core-jj.js'
)
const _coreJJReq = createRequire(coreJJMain)
const jsonJoyDir = _coreJJReq.resolve('json-joy/lib/index.js')
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
