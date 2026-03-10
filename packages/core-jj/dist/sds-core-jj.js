/*******************************************************************************
*                                                                              *
*                      SDS Core JJ — json-joy backend                          *
*                                                                              *
* Exports the complete public API for the json-joy CRDT backend.               *
* The API surface is intentionally identical to @rozek/sds-core-yjs and        *
* @rozek/sds-core-loro so that application code can switch backends without    *
* changing import paths.                                                        *
*                                                                              *
*******************************************************************************/
// json-joy-specific classes (full implementations)
export { SDS_Entry } from './store/SDS_Entry.js';
export { SDS_Item } from './store/SDS_Item.js';
export { SDS_Link } from './store/SDS_Link.js';
export { SDS_DataStore } from './store/SDS_DataStore.js';
// backend-agnostic types (re-exported from @rozek/sds-core)
export { SDS_Error } from '@rozek/sds-core';
//# sourceMappingURL=sds-core-jj.js.map