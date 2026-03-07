/*******************************************************************************
*                                                                              *
*                      SNS Browser Bundle Loro — Entry                         *
*                                                                              *
*******************************************************************************/

// re-exports the complete public API of all SNS packages in one place so that 
// Vite / Rollup can bundle everything into a single self-contained ESM file.
//
// The CRDT backend used in this bundle is Loro (@rozek/sns-core-loro). 
// @rozek/sns-core-loro re-exports all backend-agnostic types from 
// @rozek/sns-core, so we export from @rozek/sns-core-loro only
//
// NOTE: loro-crdt is NOT bundled — it ships WebAssembly and must be provided 
// externally. See README.md for setup instructions.

export * from '@rozek/sns-core-loro'
export * from '@rozek/sns-network-websocket'
export * from '@rozek/sns-network-webrtc'
export * from '@rozek/sns-persistence-browser'
export * from '@rozek/sns-sync-engine'
