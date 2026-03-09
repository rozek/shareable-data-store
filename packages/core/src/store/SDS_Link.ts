/*******************************************************************************
*                                                                              *
*        SDS_Link — points to a fixed target Note, set at creation time        *
*                                                                              *
*******************************************************************************/

import      { SDS_Entry }     from './SDS_Entry.js'
import type { SDS_Note }      from './SDS_Note.js'
import type { SDS_NoteStore } from '../interfaces/SDS_NoteStore.js'

export class SDS_Link extends SDS_Entry {
  constructor (Store:SDS_NoteStore & Record<string,any>, Id:string) {
    super(Store, Id)
  }

/**** Target ****/

  get Target ():SDS_Note {
    return this._Store['_TargetOf'](this.Id)
  }
}
