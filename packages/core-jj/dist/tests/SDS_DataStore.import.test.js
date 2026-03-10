/*******************************************************************************
*                                                                              *
*                     SDS_DataStore — Import Tests                             *
*                                                                              *
*******************************************************************************/
import { describe, it, expect } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
import { SDS_Item } from '../store/SDS_Item.js';
import { SDS_Link } from '../store/SDS_Link.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Import', () => {
    it('I-01: deserializeItemInto imports data into container', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item1 = Store1.newItemAt(undefined, Store1.RootItem);
        Item1.Label = 'original';
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(Item1.asJSON(), Store2.RootItem);
        expect(Imported).toBeInstanceOf(SDS_Item);
        const Ids = Array.from(Store2.RootItem.innerEntryList).map((e) => e.Id);
        expect(Ids).toContain(Imported.Id);
    });
    it('I-02: imported data gets a new Id', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item1 = Store1.newItemAt(undefined, Store1.RootItem);
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(Item1.asJSON(), Store2.RootItem);
        expect(Imported.Id).not.toBe(Item1.Id);
    });
    it('I-03: imported data has same Label', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item1 = Store1.newItemAt(undefined, Store1.RootItem);
        Item1.Label = 'copy this';
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(Item1.asJSON(), Store2.RootItem);
        expect(Imported.Label).toBe('copy this');
    });
    it('I-04: imported data has same MIME type', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item1 = Store1.newItemAt('text/markdown', Store1.RootItem);
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(Item1.asJSON(), Store2.RootItem);
        expect(Imported.Type).toBe('text/markdown');
    });
    it('I-05: nested items are imported with their structure', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const OuterItem = Store1.newItemAt(undefined, Store1.RootItem);
        const InnerItem1 = Store1.newItemAt(undefined, OuterItem);
        const InnerItem2 = Store1.newItemAt(undefined, OuterItem);
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(OuterItem.asJSON(), Store2.RootItem);
        expect(Imported.innerEntryList.length).toBe(2);
    });
    it('I-06: deserializeLinkInto imports link into container', () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Target = Store1.newItemAt(undefined, Store1.RootItem);
        const Link1 = Store1.newLinkAt(Target, Store1.RootItem);
        Link1.Label = 'link copy';
        const Store2 = SDS_DataStore.fromScratch();
        // target must exist in Store2 for the link to be valid
        const Target2 = Store2.newItemAt(undefined, Store2.RootItem);
        const Imported = Store2.deserializeLinkInto(Link1.asJSON(), Store2.RootItem);
        expect(Imported).toBeInstanceOf(SDS_Link);
        const Ids = Array.from(Store2.RootItem.innerEntryList).map((e) => e.Id);
        expect(Ids).toContain(Imported.Id);
    });
    it('I-07: invalid serialisation throws SDS_Error invalid-argument', () => {
        const Store = SDS_DataStore.fromScratch();
        expect(() => Store.deserializeItemInto(null, Store.RootItem)).toThrow();
    });
    it('I-08: imported item preserves literal value', async () => {
        const Store1 = SDS_DataStore.fromScratch();
        const Item1 = Store1.newItemAt(undefined, Store1.RootItem);
        Item1.writeValue('preserved');
        const Store2 = SDS_DataStore.fromScratch();
        const Imported = Store2.deserializeItemInto(Item1.asJSON(), Store2.RootItem);
        expect(await Imported.readValue()).toBe('preserved');
    });
});
//# sourceMappingURL=SDS_DataStore.import.test.js.map