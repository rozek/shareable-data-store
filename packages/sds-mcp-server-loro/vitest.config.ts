/*******************************************************************************
*                                                                              *
*                   vitest config — sds-mcp-server-loro                        *
*                                                                              *
*******************************************************************************/

import { defineConfig } from 'vitest/config'

// the smoke tests spawn the pre-built MCP server binary via StdioClientTransport
// and do not import any CRDT modules directly, so no special plugins are needed.

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    include:     ['src/tests/**/*.test.ts'],
    testTimeout: 30000,  // MCP server startup + tool calls can take several seconds
    coverage: {
      provider: 'v8',
      include:  ['src/**/*.ts'],
      exclude:  ['src/tests/**'],
    },
  },
})
