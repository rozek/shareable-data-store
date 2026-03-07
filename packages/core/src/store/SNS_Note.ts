/*******************************************************************************
*                                                                              *
*                                  SNS_Note                                    *
*                                                                              *
*******************************************************************************/

import type { SNS_NoteStore } from '../interfaces/SNS_NoteStore.js'
import      { SNS_Entry }     from './SNS_Entry.js'

export class SNS_Note extends SNS_Entry {
  constructor (Store:SNS_NoteStore & Record<string,any>, Id:string) {
    super(Store, Id)
  }

//----------------------------------------------------------------------------//
//                               Type & Value                                 //
//----------------------------------------------------------------------------//

/**** Type / ValueKind / isLiteral / isBinary ****/

  get Type ():string     { return this._Store['_TypeOf'](this.Id) }
  set Type (Type:string) { this._Store['_setTypeOf'](this.Id, Type) }

  get ValueKind ():'none' | 'literal' | 'literal-reference' | 'binary' | 'binary-reference' | 'pending' {
    return this._Store['_ValueKindOf'](this.Id)
  }

  get isLiteral ():boolean { return this._Store['_isLiteralOf'](this.Id) }
  get isBinary (): boolean { return this._Store['_isBinaryOf'](this.Id) }

/**** readValue — resolves inline values immediately, fetches blobs async ****/

  readValue ():Promise<string | Uint8Array | undefined> {
    return this._Store['_readValueOf'](this.Id)
  }

/**** writeValue — chooses ValueKind automatically based on type/size ****/

  writeValue (Value:string | Uint8Array | undefined):void {
    this._Store['_writeValueOf'](this.Id, Value)
  }

/**** changeValue — collaborative character-level edit (literal only) ****/

  changeValue (fromIndex:number, toIndex:number, Replacement:string):void {
    this._Store['_spliceValueOf'](this.Id, fromIndex, toIndex, Replacement)
  }

//----------------------------------------------------------------------------//
//                             Inner Entry List                               //
//----------------------------------------------------------------------------//

/**** innerEntryList ****/

  get innerEntryList ():SNS_Entry[] {
    return this._Store['_innerEntriesOf'](this.Id)
  }
}
