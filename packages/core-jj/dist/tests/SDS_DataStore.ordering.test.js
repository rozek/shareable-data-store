/*******************************************************************************
*                                                                              *
*                    SDS_DataStore — Ordering Tests                            *
*                                                                              *
*******************************************************************************/
import { describe, it, expect } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Ordering', () => {
    it('O-01: three items without InsertionIndex appear in creation order', () => {
        const Store = SDS_DataStore.fromScratch();
        const A = Store.newItemAt(undefined, Store.RootItem);
        const B = Store.newItemAt(undefined, Store.RootItem);
        const C = Store.newItemAt(undefined, Store.RootItem);
        const InnerEntries = Array.from(Store.RootItem.innerEntryList)
            .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === C.Id)
            .map((e) => e.Id);
        expect(InnerEntries).toEqual([A.Id, B.Id, C.Id]);
    });
    it('O-02: InsertionIndex 0 inserts at the front', () => {
        const Store = SDS_DataStore.fromScratch();
        const A = Store.newItemAt(undefined, Store.RootItem);
        const B = Store.newItemAt(undefined, Store.RootItem);
        const First = Store.newItemAt(undefined, Store.RootItem, 0);
        // find among A, B, First only
        const InnerEntries = Array.from(Store.RootItem.innerEntryList)
            .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === First.Id)
            .map((e) => e.Id);
        expect(InnerEntries[0]).toBe(First.Id);
    });
    it('O-03: InsertionIndex 1 inserts at the second position', () => {
        // use a custom container (not RootItem) so no system items interfere with indexing
        const Store = SDS_DataStore.fromScratch();
        const OuterItem = Store.newItemAt(undefined, Store.RootItem);
        const A = Store.newItemAt(undefined, OuterItem);
        const B = Store.newItemAt(undefined, OuterItem);
        const Middle = Store.newItemAt(undefined, OuterItem, 1);
        const InnerEntries = Array.from(OuterItem.innerEntryList).map((e) => e.Id);
        expect(InnerEntries[1]).toBe(Middle.Id);
    });
    it('O-04: InsertionIndex beyond length appends at end', () => {
        const Store = SDS_DataStore.fromScratch();
        const A = Store.newItemAt(undefined, Store.RootItem);
        const B = Store.newItemAt(undefined, Store.RootItem);
        const Last = Store.newItemAt(undefined, Store.RootItem, 9999);
        const InnerEntries = Array.from(Store.RootItem.innerEntryList)
            .filter((e) => e.Id === A.Id || e.Id === B.Id || e.Id === Last.Id)
            .map((e) => e.Id);
        expect(InnerEntries[InnerEntries.length - 1]).toBe(Last.Id);
    });
    it('O-05: innerEntryList.length reflects actual inner-entry count', () => {
        const Store = SDS_DataStore.fromScratch();
        const OuterItem = Store.newItemAt(undefined, Store.RootItem);
        Store.newItemAt(undefined, OuterItem);
        Store.newItemAt(undefined, OuterItem);
        Store.newItemAt(undefined, OuterItem);
        expect(OuterItem.innerEntryList.length).toBe(3);
    });
    it('O-06: innerEntryList is iterable with for..of', () => {
        const Store = SDS_DataStore.fromScratch();
        const OuterItem = Store.newItemAt(undefined, Store.RootItem);
        Store.newItemAt(undefined, OuterItem);
        Store.newItemAt(undefined, OuterItem);
        const Collected = [];
        for (const Entry of OuterItem.innerEntryList) {
            Collected.push(Entry.Id);
        }
        expect(Collected.length).toBe(2);
    });
    it('O-07: innerEntryList[0] returns first inner entry', () => {
        const Store = SDS_DataStore.fromScratch();
        const OuterItem = Store.newItemAt(undefined, Store.RootItem);
        const InnerItem = Store.newItemAt(undefined, OuterItem);
        expect(OuterItem.innerEntryList[0]?.Id).toBe(InnerItem.Id);
    });
});
//# sourceMappingURL=SDS_DataStore.ordering.test.js.map