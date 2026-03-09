/*******************************************************************************
*                                                                              *
*               SDS_Entry — base class for SDS_Note and SDS_Link               *
*                                                                              *
*******************************************************************************/

import type { SDS_NoteStore } from '../interfaces/SDS_NoteStore.js'
import type { SDS_Note }      from './SDS_Note.js'
import { RootId, TrashId, LostAndFoundId } from './constants.js'

// allows bracket-notation access to internal store methods not declared on the
// minimal SDS_NoteStore interface, while keeping the constructor type-safe

type StoreBackend = SDS_NoteStore & Record<string, any>

export class SDS_Entry {
  constructor (
    protected readonly _Store:StoreBackend,
    readonly Id:string,
  ) {}

//----------------------------------------------------------------------------//
//                                  Identity                                  //
//----------------------------------------------------------------------------//

/**** isRootNote / isTrashNote / isLostAndFoundNote / isNote / isLink ****/

  get isRootNote ():         boolean { return this.Id === RootId }
  get isTrashNote ():        boolean { return this.Id === TrashId }
  get isLostAndFoundNote (): boolean { return this.Id === LostAndFoundId }
  get isNote ():             boolean { return this._Store['_KindOf'](this.Id) === 'note' }
  get isLink ():             boolean { return this._Store['_KindOf'](this.Id) === 'link' }

//----------------------------------------------------------------------------//
//                                 Hierarchy                                  //
//----------------------------------------------------------------------------//

/**** outerNote / outerNoteId / outerNotes / outerNoteIds ****/

  get outerNote ():SDS_Note | undefined {
    return this._Store['_outerNoteOf'](this.Id)
  }

  get outerNoteId ():string | undefined {
    return this._Store['_outerNoteIdOf'](this.Id)
  }

  get outerNotes ():SDS_Note[] {
    return this._Store['_outerNotesOf'](this.Id)
  }

  get outerNoteIds ():string[] {
    return this._Store['_outerNoteIdsOf'](this.Id)
  }

//----------------------------------------------------------------------------//
//                                Description                                 //
//----------------------------------------------------------------------------//

/**** Label / Info ****/

  get Label ():string       { return this._Store['_LabelOf'](this.Id) }
  set Label (Value:string)  { this._Store['_setLabelOf'](this.Id, Value) }

  get Info ():Record<string,unknown> {
    return this._Store['_InfoProxyOf'](this.Id)
  }

//----------------------------------------------------------------------------//
//                                   Move                                     //
//----------------------------------------------------------------------------//

/**** mayBeMovedTo ****/

  mayBeMovedTo (OuterNote:SDS_Note, InsertionIndex?:number):boolean {
    return this._Store['_mayMoveEntryTo'](this.Id, OuterNote.Id, InsertionIndex)
  }

/**** moveTo ****/

  moveTo (OuterNote:SDS_Note, InsertionIndex?:number):void {
    this._Store['moveEntryTo'](this, OuterNote, InsertionIndex)
  }

//----------------------------------------------------------------------------//
//                                  Delete                                    //
//----------------------------------------------------------------------------//

/**** mayBeDeleted ****/

  get mayBeDeleted ():boolean {
    return this._Store['_mayDeleteEntry'](this.Id)
  }

/**** delete ****/

  delete ():void { this._Store['deleteEntry'](this) }

/**** purge ****/

  purge ():void  { this._Store['purgeEntry'](this) }

//----------------------------------------------------------------------------//
//                              Serialisation                                 //
//----------------------------------------------------------------------------//

/**** asJSON ****/

  asJSON ():unknown { return this._Store['_EntryAsJSON'](this.Id) }
}
