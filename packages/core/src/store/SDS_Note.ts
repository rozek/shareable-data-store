/*******************************************************************************
*                                                                              *
*                                  SDS_Note                                    *
*                                                                              *
*******************************************************************************/

import type { SDS_NoteStore } from '../interfaces/SDS_NoteStore.js'
import      { SDS_Entry }     from './SDS_Entry.js'

export class SDS_Note extends SDS_Entry {
  constructor (Store:SDS_NoteStore & Record<string,any>, Id:string) {
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

  get innerEntryList ():SDS_Entry[] {
    return this._Store['_innerEntriesOf'](this.Id)
  }
}
