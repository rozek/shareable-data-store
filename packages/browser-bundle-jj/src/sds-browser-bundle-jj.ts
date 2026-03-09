/*******************************************************************************
*                                                                              *
*                         SNS Browser Bundle — Entry                           *
*                                                                              *
*******************************************************************************/

// re-exports the complete public API of all SNS packages in one place so that 
// Vite / Rollup can bundle everything — including npm dependencies — into a 
// single self-contained ESM file.
//
// The CRDT backend used in this bundle is json-joy (@rozek/sds-core-jj). 
// @rozek/sds-core-jj already re-exports all backend-agnostic types from 
// @rozek/sds-core, so we export from @rozek/sds-core-jj only

export * from '@rozek/sds-core-jj'
export * from '@rozek/sds-network-websocket'
export * from '@rozek/sds-network-webrtc'
export * from '@rozek/sds-persistence-browser'
export * from '@rozek/sds-sync-engine'
