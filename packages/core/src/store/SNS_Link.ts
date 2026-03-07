/*******************************************************************************
*                                                                              *
*        SNS_Link — points to a fixed target Note, set at creation time        *
*                                                                              *
*******************************************************************************/

import      { SNS_Entry }     from './SNS_Entry.js'
import type { SNS_Note }      from './SNS_Note.js'
import type { SNS_NoteStore } from '../interfaces/SNS_NoteStore.js'

export class SNS_Link extends SNS_Entry {
  constructor (Store:SNS_NoteStore & Record<string,any>, Id:string) {
    super(Store, Id)
  }

/**** Target ****/

  get Target ():SNS_Note {
    return this._Store['_TargetOf'](this.Id)
  }
}
