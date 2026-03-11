/*******************************************************************************
*                                                                              *
*                     vitest config — websocket-server                         *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'
import type { Plugin }  from 'vite'

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
  test: {
    globals:     true,
    environment: 'node',
  },
})
