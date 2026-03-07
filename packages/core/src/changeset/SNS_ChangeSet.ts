/*******************************************************************************
*                                                                              *
* SNS_ChangeSet - maps each changed entry id to the set of its changed prop.s  *
*                                                                              *
*******************************************************************************/

import type { SNS_EntryChangeSet } from './SNS_EntryChangeSet.js'
export type SNS_ChangeSet = Record<string,SNS_EntryChangeSet>
