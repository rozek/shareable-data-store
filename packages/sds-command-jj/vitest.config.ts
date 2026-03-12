/*******************************************************************************
*                                                                              *
*                      vitest config — sds-command-jj                          *
*                                                                              *
*******************************************************************************/

import { createRequire } from 'module'
import { fileURLToPath }  from 'url'
import path               from 'path'
import { defineConfig }   from 'vitest/config'
import type { Plugin }    from 'vite'

// Resolve json-joy via sds-core-jj's dist file as the CJS require() base.
// pnpm hoists json-joy under sds-core-jj's node_modules, not this package's,
// so Vite's default resolver cannot find it. We construct a createRequire()
// anchored to sds-core-jj's own dist file to reach json-joy from there.
const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const coreJJMain = path.join(
  __dirname, 'node_modules', '@rozek', 'sds-core-jj', 'dist', 'sds-core-jj.js'
)
const _coreJJReq = createRequire(coreJJMain)
const jsonJoyDir = _coreJJReq.resolve('json-joy/lib/index.js')
  .replace(/\/lib\/index\.js$/, '')

// Vite 5.x (bundled with Vitest 2.x) does not list node:sqlite in
// builtinModules, because it is a node:-prefix-only module. This plugin
// intercepts the import and serves it via createRequire, which bypasses
// Vite's built-in module resolver entirely.
const NodeSQLitePlugin:Plugin = {
  name:    'virtual-node-sqlite',
  enforce: 'pre',
  resolveId (Id:string) {
    if (Id === 'node:sqlite') { return '\0virtual:node-sqlite' }
  },
  load (Id:string) {
    if (Id !== '\0virtual:node-sqlite') { return }
    return `
      import { createRequire } from 'module'
      const _require = createRequire(import.meta.url)
      const { DatabaseSync, StatementSync, constants, backup } = _require('node:sqlite')
      export { DatabaseSync, StatementSync, constants, backup }
    `
  },
}

export default defineConfig({
  plugins: [ NodeSQLitePlugin ],
  resolve: {
    alias: {
      'json-joy': jsonJoyDir,
    },
  },
  test: {
    environment: 'node',
    include:     ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**'],
    },
  },
})
