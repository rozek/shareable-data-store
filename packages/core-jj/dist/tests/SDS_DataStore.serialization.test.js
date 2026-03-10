/*******************************************************************************
*                                                                              *
*                 SDS_DataStore — Serialisation Tests                          *
*                                                                              *
*******************************************************************************/
import { describe, it, expect } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Serialisation', () => {
    it('S-01: asBinary starts with gzip magic bytes', () => {
        const Store = SDS_DataStore.fromScratch();
        const Binary = Store.asBinary();
        expect(Binary[0]).toBe(0x1f);
        expect(Binary[1]).toBe(0x8b);
    });
    it('S-02: fromBinary round-trips all items', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const ItemA = Store1.newItemAt(undefined, Store1.RootItem);
        const ItemB = Store1.newItemAt('text/markdown', Store1.RootItem);
        const Binary = Store1.asBinary();
        const Store2 = SDS_DataStore.fromBinary(Binary);
        expect(Store2.EntryWithId(ItemA.Id)).toBeDefined();
        expect(Store2.EntryWithId(ItemB.Id)).toBeDefined();
    });
    it('S-03: round-tripped store has same Label values', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt(undefined, Store1.RootItem);
        Item.Label = 'preserved label';
        const Store2 = SDS_DataStore.fromBinary(Store1.asBinary());
        expect(Store2.EntryWithId(Item.Id)?.Label).toBe('preserved label');
    });
    it('S-04: round-tripped store has same innerEntryList order', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const A = Store1.newItemAt(undefined, Store1.RootItem);
        const B = Store1.newItemAt(undefined, Store1.RootItem);
        const C = Store1.newItemAt(undefined, Store1.RootItem);
        const Order1 = Array.from(Store1.RootItem.innerEntryList)
            .filter((e) => [A.Id, B.Id, C.Id].includes(e.Id))
            .map((e) => e.Id);
        const Store2 = SDS_DataStore.fromBinary(Store1.asBinary());
        const Order2 = Array.from(Store2.RootItem.innerEntryList)
            .filter((e) => [A.Id, B.Id, C.Id].includes(e.Id))
            .map((e) => e.Id);
        expect(Order2).toEqual(Order1);
    });
    it('S-05: round-tripped store preserves literal value', async () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt(undefined, Store1.RootItem);
        Item.writeValue('my content');
        const Store2 = SDS_DataStore.fromBinary(Store1.asBinary());
        const Item2 = Store2.EntryWithId(Item.Id);
        expect(await Item2.readValue()).toBe('my content');
    });
    it('S-06: round-tripped store preserves binary value', async () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt('application/octet-stream', Store1.RootItem);
        const Bytes = new Uint8Array([7, 8, 9]);
        Item.writeValue(Bytes);
        const Store2 = SDS_DataStore.fromBinary(Store1.asBinary());
        const Item2 = Store2.EntryWithId(Item.Id);
        expect(Array.from(await Item2.readValue())).toEqual([7, 8, 9]);
    });
    it('S-07: fromJSON(asJSON()) round-trips', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt(undefined, Store1.RootItem);
        Item.Label = 'json test';
        const Store2 = SDS_DataStore.fromJSON(Store1.asJSON());
        expect(Store2.EntryWithId(Item.Id)?.Label).toBe('json test');
    });
    it('S-08: binary round-trip preserves nested items', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const OuterItem = Store1.newItemAt(undefined, Store1.RootItem);
        const InnerItem = Store1.newItemAt(undefined, OuterItem);
        const Binary = Store1.asBinary();
        const Store2 = SDS_DataStore.fromBinary(Binary);
        const OuterItem2 = Store2.EntryWithId(OuterItem.Id);
        expect(OuterItem2).toBeDefined();
        expect(Store2.EntryWithId(InnerItem.Id)?.outerItem?.Id).toBe(OuterItem.Id);
    });
    it('S-09: asJSON() returns a plain JS object', () => {
        const Store = SDS_DataStore.fromScratch();
        const JSON_ = Store.asJSON();
        expect(typeof JSON_).toBe('object');
        expect(JSON_.Kind).toBe('item');
    });
    it('S-10: fromJSON(asJSON()) preserves literal value', async () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt(undefined, Store1.RootItem);
        Item.writeValue('round-trip content');
        const Store2 = SDS_DataStore.fromJSON(Store1.asJSON());
        const Item2 = Store2.EntryWithId(Item.Id);
        expect(await Item2.readValue()).toBe('round-trip content');
    });
    it('S-11: fromJSON(asJSON()) preserves binary value', async () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item = Store1.newItemAt('application/octet-stream', Store1.RootItem);
        const Bytes = new Uint8Array([10, 20, 30]);
        Item.writeValue(Bytes);
        const Store2 = SDS_DataStore.fromJSON(Store1.asJSON());
        const Item2 = Store2.EntryWithId(Item.Id);
        expect(Array.from(await Item2.readValue())).toEqual([10, 20, 30]);
    });
});
//# sourceMappingURL=SDS_DataStore.serialization.test.js.map