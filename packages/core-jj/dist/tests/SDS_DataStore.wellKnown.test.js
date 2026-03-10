/*******************************************************************************
*                                                                              *
*                  SDS_DataStore — Well-known Data Items Tests                      *
*                                                                              *
*******************************************************************************/
import { describe, it, expect } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
const RootId = '00000000-0000-4000-8000-000000000000';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Well-known Data Items', () => {
    it('W-01: RootItem.isRootItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.RootItem.isRootItem).toBe(true);
    });
    it('W-02: TrashItem.isTrashItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.TrashItem.isTrashItem).toBe(true);
    });
    it('W-03: LostAndFoundItem.isLostAndFoundItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.LostAndFoundItem.isLostAndFoundItem).toBe(true);
    });
    it('W-04: RootItem.isItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.RootItem.isItem).toBe(true);
    });
    it('W-05: RootItem.outerItem is undefined', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.RootItem.outerItem).toBeUndefined();
    });
    it('W-06: TrashItem.outerItem is RootItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.TrashItem.outerItem?.Id).toBe(RootId);
    });
    it('W-07: LostAndFoundItem.outerItem is RootItem', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.LostAndFoundItem.outerItem?.Id).toBe(RootId);
    });
    it('W-08: RootItem.mayBeDeleted is false', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.RootItem.mayBeDeleted).toBe(false);
    });
    it('W-09: TrashItem.mayBeDeleted is false', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.TrashItem.mayBeDeleted).toBe(false);
    });
    it('W-10: LostAndFoundItem.mayBeDeleted is false', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.LostAndFoundItem.mayBeDeleted).toBe(false);
    });
    it('W-11: TrashItem default Label is "trash"', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.TrashItem.Label).toBe('trash');
    });
    it('W-12: LostAndFoundItem default Label is "lost-and-found"', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(Store.LostAndFoundItem.Label).toBe('lost-and-found');
    });
    it('W-13: TrashItem can be renamed', () => {
        const Store = SDS_DataStore.fromScratch();
        Store.TrashItem.Label = 'bin';
        expect(Store.TrashItem.Label).toBe('bin');
    });
    it('W-14: RootItem.innerEntryList contains TrashItem and LostAndFoundItem', () => {
        const Store = SDS_DataStore.fromScratch();
        const InnerEntries = Store.RootItem.innerEntryList;
        const Ids = Array.from(InnerEntries).map((e) => e.Id);
        expect(Ids).toContain(Store.TrashItem.Id);
        expect(Ids).toContain(Store.LostAndFoundItem.Id);
    });
});
//# sourceMappingURL=SDS_DataStore.wellKnown.test.js.map