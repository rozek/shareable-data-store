/*******************************************************************************
*                                                                              *
*                   SDS_DataStore — Events & Transact Tests                    *
*                                                                              *
*******************************************************************************/
import { describe, it, expect, vi } from 'vitest';
import { SDS_DataStore } from '../store/SDS_DataStore.js';
//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//
describe('SDS_DataStore — Events & Transact', () => {
    it('EV-01: onChangeInvoke callback fires after newItemAt', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Store.newItemAt(undefined, Store.RootItem);
        expect(Handler).toHaveBeenCalledOnce();
    });
    it('EV-02: ChangeSet contains entries for new data and container', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        const Item = Store.newItemAt(undefined, Store.RootItem);
        const ChangeSet = Handler.mock.calls[0][1];
        expect(ChangeSet[Item.Id]).toBeDefined();
        expect(ChangeSet[Store.RootItem.Id]).toBeDefined();
    });
    it('EV-03: ChangeSet for new data contains outerItem', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        const Item = Store.newItemAt(undefined, Store.RootItem);
        const ChangeSet = Handler.mock.calls[0][1];
        expect(ChangeSet[Item.Id]?.has('outerItem')).toBe(true);
    });
    it('EV-04: ChangeSet for container contains innerEntryList', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Store.newItemAt(undefined, Store.RootItem);
        const ChangeSet = Handler.mock.calls[0][1];
        expect(ChangeSet[Store.RootItem.Id]?.has('innerEntryList')).toBe(true);
    });
    it('EV-05: onChangeInvoke returns an unsubscribe function', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        const Unsubscribe = Store.onChangeInvoke(Handler);
        expect(typeof Unsubscribe).toBe('function');
    });
    it('EV-06: after unsubscribe callback is no longer called', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        const Unsubscribe = Store.onChangeInvoke(Handler);
        Unsubscribe();
        Store.newItemAt(undefined, Store.RootItem);
        expect(Handler).not.toHaveBeenCalled();
    });
    it('EV-07: multiple handlers all receive the event', () => {
        const Store = SDS_DataStore.fromScratch();
        const HandlerA = vi.fn();
        const HandlerB = vi.fn();
        Store.onChangeInvoke(HandlerA);
        Store.onChangeInvoke(HandlerB);
        Store.newItemAt(undefined, Store.RootItem);
        expect(HandlerA).toHaveBeenCalledOnce();
        expect(HandlerB).toHaveBeenCalledOnce();
    });
    it('EV-08: nested transact emits only one ChangeSet event', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Store.transact(() => {
            Store.newItemAt(undefined, Store.RootItem);
            Store.transact(() => {
                Store.newItemAt(undefined, Store.RootItem);
            });
        });
        expect(Handler).toHaveBeenCalledOnce();
    });
    it('EV-09: Origin is internal for local mutations', () => {
        const Store = SDS_DataStore.fromScratch();
        const Handler = vi.fn();
        Store.onChangeInvoke(Handler);
        Store.newItemAt(undefined, Store.RootItem);
        expect(Handler.mock.calls[0][0]).toBe('internal');
    });
});
//# sourceMappingURL=SDS_DataStore.events.test.js.map