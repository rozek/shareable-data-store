/*******************************************************************************
*                                                                              *
*                      vitest config — sds-mcp-server                          *
*                                                                              *
*******************************************************************************/

import { createRequire } from 'module'
import { fileURLToPath }  from 'url'
import path               from 'path'
import { defineConfig }   from 'vitest/config'
import type { Plugin }    from 'vite'

// resolve json-joy via sds-core-jj's dist file as the CJS require() base —
// pnpm hoists json-joy under sds-core-jj's node_modules, not this package's,
// so Vite's default resolver cannot find it
const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const coreJJMain = path.join(
  __dirname, 'node_modules', '@rozek', 'sds-core-jj', 'dist', 'sds-core-jj.js'
)
const _coreJJReq = createRequire(coreJJMain)
const jsonJoyDir = _coreJJReq.resolve('json-joy/lib/index.js')
  .replace(/\/lib\/index\.js$/, '')

// Vite 5.x does not list node:sqlite in builtinModules; intercept it here
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
    testTimeout: 15000,   // network-probe tests (SP-04, BA-06) may take several seconds
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**', 'src/sds-mcp-server.ts'],
    },
  },
})
