/*******************************************************************************
*                                                                              *
*                          SDS Core JJ — Smoke Tests                           *
*                                                                              *
* Verifies that all public API symbols are correctly re-exported from          *
* @rozek/sds-core.  The full functional test suite lives in that package.      *
*                                                                              *
*******************************************************************************/
import { describe, it, expect } from 'vitest';
import { SDS_Error, SDS_Entry, SDS_Item, SDS_Link, SDS_DataStore, } from '../sds-core-jj.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS Core JJ — Re-exports', () => {
    it('JJ-01: SDS_Error is exported and constructible', () => {
        const err = new SDS_Error('test', 'test message');
        expect(err).toBeInstanceOf(SDS_Error);
        expect(err.code).toBe('test');
        expect(err.message).toBe('test message');
    });
    it('JJ-02: SDS_DataStore is exported', () => {
        expect(SDS_DataStore).toBeDefined();
        expect(typeof SDS_DataStore.fromScratch).toBe('function');
        expect(typeof SDS_DataStore.fromBinary).toBe('function');
        expect(typeof SDS_DataStore.fromJSON).toBe('function');
    });
    it('JJ-03: SDS_Entry, SDS_Item, SDS_Link are exported', () => {
        expect(SDS_Entry).toBeDefined();
        expect(SDS_Item).toBeDefined();
        expect(SDS_Link).toBeDefined();
    });
    it('JJ-04: fromScratch() produces a working SDS_DataStore', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store).toBeInstanceOf(SDS_DataStore);
        expect(Store.RootItem.Id).toBe('00000000-0000-4000-8000-000000000000');
        expect(Store.TrashItem.Id).toBe('00000000-0000-4000-8000-000000000001');
        expect(Store.LostAndFoundItem.Id).toBe('00000000-0000-4000-8000-000000000002');
    });
    it('JJ-05: items and links are instances of SDS_Item and SDS_Link', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        const Link = Store.newLinkAt(Item, Store.RootItem);
        expect(Item).toBeInstanceOf(SDS_Item);
        expect(Link).toBeInstanceOf(SDS_Link);
    });
    it('JJ-06: patch exchange between two independent stores works', () => {
        const StoreA = SDS_DataStore.fromScratch();
        const StoreB = SDS_DataStore.fromScratch();
        const Item = StoreA.newItemAt(undefined, StoreA.RootItem);
        Item.Label = 'hello from core-jj';
        StoreB.applyRemotePatch(StoreA.exportPatch());
        expect(StoreB.EntryWithId(Item.Id)?.Label).toBe('hello from core-jj');
    });
});
//# sourceMappingURL=SDS_CoreJJ.test.js.map