/*******************************************************************************
*                                                                              *
* SDS_ChangeSet - maps each changed entry id to the set of its changed prop.s  *
*                                                                              *
*******************************************************************************/

import type { SDS_EntryChangeSet } from './SDS_EntryChangeSet.js'
export type SDS_ChangeSet = Record<string,SDS_EntryChangeSet>
