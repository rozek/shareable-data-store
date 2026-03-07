var n = Object.defineProperty;
var h = (r, t, e) => t in r ? n(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var i = (r, t, e) => h(r, typeof t != "symbol" ? t + "" : t, e);
class S extends Error {
  constructor(e, s) {
    super(s);
    i(this, "Code");
    this.Code = e, this.name = "SNS_Error";
  }
}
const d = "00000000-0000-4000-8000-000000000000", _ = "00000000-0000-4000-8000-000000000001", u = "00000000-0000-4000-8000-000000000002", I = "text/plain", l = 131072, f = 2048, g = 5e3;
class o {
  constructor(t, e) {
    this._Store = t, this.Id = e;
  }
  //----------------------------------------------------------------------------//
  //                                  Identity                                  //
  //----------------------------------------------------------------------------//
  /**** isRootNote / isTrashNote / isLostAndFoundNote / isNote / isLink ****/
  get isRootNote() {
    return this.Id === d;
  }
  get isTrashNote() {
    return this.Id === _;
  }
  get isLostAndFoundNote() {
    return this.Id === u;
  }
  get isNote() {
    return this._Store._KindOf(this.Id) === "note";
  }
  get isLink() {
    return this._Store._KindOf(this.Id) === "link";
  }
  //----------------------------------------------------------------------------//
  //                                 Hierarchy                                  //
  //----------------------------------------------------------------------------//
  /**** outerNote / outerNoteId / outerNotes / outerNoteIds ****/
  get outerNote() {
    return this._Store._outerNoteOf(this.Id);
  }
  get outerNoteId() {
    return this._Store._outerNoteIdOf(this.Id);
  }
  get outerNotes() {
    return this._Store._outerNotesOf(this.Id);
  }
  get outerNoteIds() {
    return this._Store._outerNoteIdsOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                Description                                 //
  //----------------------------------------------------------------------------//
  /**** Label / Info ****/
  get Label() {
    return this._Store._LabelOf(this.Id);
  }
  set Label(t) {
    this._Store._setLabelOf(this.Id, t);
  }
  get Info() {
    return this._Store._InfoProxyOf(this.Id);
  }
  //----------------------------------------------------------------------------//
  //                                   Move                                     //
  //----------------------------------------------------------------------------//
  /**** mayBeMovedTo ****/
  mayBeMovedTo(t, e) {
    return this._Store._mayMoveEntryTo(this.Id, t.Id, e);
  }
  /**** moveTo ****/
  moveTo(t, e) {
    this._Store.moveEntryTo(this, t, e);
  }
  //----------------------------------------------------------------------------//
  //                                  Delete                                    //
  //----------------------------------------------------------------------------//
  /**** mayBeDeleted ****/
  get mayBeDeleted() {
    return this._Store._mayDeleteEntry(this.Id);
  }
  /**** delete ****/
  delete() {
    this._Store.deleteEntry(this);
  }
  /**** purge ****/
  purge() {
    this._Store.purgeEntry(this);
  }
  //----------------------------------------------------------------------------//
  //                              Serialisation                                 //
  //----------------------------------------------------------------------------//
  /**** asJSON ****/
  asJSON() {
    return this._Store._EntryAsJSON(this.Id);
  }
}
class c extends o {
  constructor(t, e) {
    super(t, e);
  }
  //----------------------------------------------------------------------------//
  //                               Type & Value                                 //
  //----------------------------------------------------------------------------//
  /**** Type / ValueKind / isLiteral / isBinary ****/
  get Type() {
    return this._Store._TypeOf(this.Id);
  }
  set Type(t) {
    this._Store._setTypeOf(this.Id, t);
  }
  get ValueKind() {
    return this._Store._ValueKindOf(this.Id);
  }
  get isLiteral() {
    return this._Store._isLiteralOf(this.Id);
  }
  get isBinary() {
    return this._Store._isBinaryOf(this.Id);
  }
  /**** readValue — resolves inline values immediately, fetches blobs async ****/
  readValue() {
    return this._Store._readValueOf(this.Id);
  }
  /**** writeValue — chooses ValueKind automatically based on type/size ****/
  writeValue(t) {
    this._Store._writeValueOf(this.Id, t);
  }
  /**** changeValue — collaborative character-level edit (literal only) ****/
  changeValue(t, e, s) {
    this._Store._spliceValueOf(this.Id, t, e, s);
  }
  //----------------------------------------------------------------------------//
  //                             Inner Entry List                               //
  //----------------------------------------------------------------------------//
  /**** innerEntryList ****/
  get innerEntryList() {
    return this._Store._innerEntriesOf(this.Id);
  }
}
class y extends o {
  constructor(t, e) {
    super(t, e);
  }
  /**** Target ****/
  get Target() {
    return this._Store._TargetOf(this.Id);
  }
}
export {
  f as DefaultBinarySizeLimit,
  l as DefaultLiteralSizeLimit,
  I as DefaultMIMEType,
  g as DefaultWrapperCacheSize,
  u as LostAndFoundId,
  d as RootId,
  o as SNS_Entry,
  S as SNS_Error,
  y as SNS_Link,
  c as SNS_Note,
  _ as TrashId
};
