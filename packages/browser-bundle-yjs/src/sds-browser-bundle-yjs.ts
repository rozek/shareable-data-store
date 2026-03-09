/*******************************************************************************
*                                                                              *
*                       SNS Browser Bundle YJS — Entry                         *
*                                                                              *
*******************************************************************************/

// Re-exports the complete public API of all SNS packages in one place so that
// Vite / Rollup can bundle everything — including npm dependencies — into a 
// single self-contained ESM file.

// The CRDT backend used in this bundle is Y.js (@rozek/sds-core-yjs). 
// @rozek/sds-core-yjs re-exports all backend-agnostic types from 
// @rozek/sds-core, so we export from @rozek/sds-core-yjs only

export * from '@rozek/sds-core-yjs'
export * from '@rozek/sds-network-websocket'
export * from '@rozek/sds-network-webrtc'
export * from '@rozek/sds-persistence-browser'
export * from '@rozek/sds-sync-engine'
