/*******************************************************************************
*                                                                              *
*                      SNS Browser Bundle Loro — Entry                         *
*                                                                              *
*******************************************************************************/

// re-exports the complete public API of all SNS packages in one place so that 
// Vite / Rollup can bundle everything into a single self-contained ESM file.
//
// The CRDT backend used in this bundle is Loro (@rozek/sds-core-loro). 
// @rozek/sds-core-loro re-exports all backend-agnostic types from 
// @rozek/sds-core, so we export from @rozek/sds-core-loro only
//
// NOTE: loro-crdt is NOT bundled — it ships WebAssembly and must be provided 
// externally. See README.md for setup instructions.

export * from '@rozek/sds-core-loro'
export * from '@rozek/sds-network-websocket'
export * from '@rozek/sds-network-webrtc'
export * from '@rozek/sds-persistence-browser'
export * from '@rozek/sds-sync-engine'
