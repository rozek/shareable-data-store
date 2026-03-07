/*******************************************************************************
*                                                                              *
*                       SNS Browser Bundle YJS — Entry                         *
*                                                                              *
*******************************************************************************/

// Re-exports the complete public API of all SNS packages in one place so that
// Vite / Rollup can bundle everything — including npm dependencies — into a 
// single self-contained ESM file.

// The CRDT backend used in this bundle is Y.js (@rozek/sns-core-yjs). 
// @rozek/sns-core-yjs re-exports all backend-agnostic types from 
// @rozek/sns-core, so we export from @rozek/sns-core-yjs only

export * from '@rozek/sns-core-yjs'
export * from '@rozek/sns-network-websocket'
export * from '@rozek/sns-network-webrtc'
export * from '@rozek/sns-persistence-browser'
export * from '@rozek/sns-sync-engine'
