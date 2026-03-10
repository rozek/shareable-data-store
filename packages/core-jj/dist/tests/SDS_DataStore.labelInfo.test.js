/*******************************************************************************
*                                                                              *
*                  SDS_DataStore — Label & Info Tests                          *
*                                                                              *
*******************************************************************************/
import { describe, it, expect, vi } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Label & Info', () => {
    it('L-01: new data has empty Label', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        expect(Item.Label).toBe('');
    });
    it('L-02: Label setter stores the value', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Label = 'My Data';
        expect(Item.Label).toBe('My Data');
    });
    it('L-03: Label change fires ChangeSet with Label key', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Item.Label = 'test';
        const CallArgs = Handler.mock.calls[0];
        expect(CallArgs).toBeDefined();
        const ChangeSet = CallArgs[1];
        expect(ChangeSet[Item.Id]?.has('Label')).toBe(true);
    });
    it('L-04: Info is initially empty', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        expect(Object.keys(Item.Info).length).toBe(0);
    });
    it('L-05: Info set stores value', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Info['tag'] = 'important';
        expect(Item.Info['tag']).toBe('important');
    });
    it('L-06: Info set fires ChangeSet with Info.tag', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Item.Info['tag'] = 'important';
        const ChangeSet = Handler.mock.calls[0][1];
        expect(ChangeSet[Item.Id]?.has('Info.tag')).toBe(true);
    });
    it('L-07: Info delete removes key', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Info['tag'] = 'important';
        delete Item.Info['tag'];
        expect(Item.Info['tag']).toBeUndefined();
    });
    it('L-08: Info delete fires ChangeSet with Info.tag', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Info['tag'] = 'important';
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        delete Item.Info['tag'];
        const ChangeSet = Handler.mock.calls[0][1];
        expect(ChangeSet[Item.Id]?.has('Info.tag')).toBe(true);
    });
    it('L-09: deleting the last Info key removes the Info node (Info still readable as {})', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Info['tag'] = 'important';
        delete Item.Info['tag'];
        // the CRDT Info node has been removed — but the proxy still returns an empty object.
        expect(Object.keys(Item.Info).length).toBe(0);
        // writing a new key afterwards must still work (node recreated transparently).
        Item.Info['x'] = 1;
        expect(Item.Info['x']).toBe(1);
    });
    it('L-10: Label setter with non-string argument throws SDS_Error invalid-argument', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        expect(() => { Item.Label = 42; }).toThrowError(expect.objectContaining({ code: 'invalid-argument' }));
    });
    it('L-11: assigning undefined to an Info key deletes the key', () => {
        const Store = SDS_DataStore.fromScratch();
        const Item = Store.newItemAt(undefined, Store.RootItem);
        Item.Info['tag'] = 'important';
        expect(Item.Info['tag']).toBe('important');
        Item.Info['tag'] = undefined;
        expect(Item.Info['tag']).toBeUndefined();
        expect(Object.keys(Item.Info)).not.toContain('tag');
    });
});
//# sourceMappingURL=SDS_DataStore.labelInfo.test.js.map