/*******************************************************************************
*                                                                              *
*                     SDS_DataStore — Value Tests                              *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, vi } from 'vitest'
import { SDS_DataStore } from '../store/SDS_DataStore.js'
import { SDS_Error }     from '@rozek/sds-core'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SDS_DataStore — Value', () => {

  it('V-01: new data has ValueKind none', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(Item.ValueKind).toBe('none')
  })

  it('V-02: writeValue(undefined) → ValueKind none', async () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    Item.writeValue(undefined)
    expect(Item.ValueKind).toBe('none')
    expect(await Item.readValue()).toBeUndefined()
  })

  it('V-03: writeValue(small string) → ValueKind literal', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(Item.ValueKind).toBe('literal')
  })

  it('V-04: readValue returns the written string', async () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello world')
    expect(await Item.readValue()).toBe('hello world')
  })

  it('V-05: isLiteral true after string write', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(Item.isLiteral).toBe(true)
  })

  it('V-06: isBinary false after string write', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(Item.isBinary).toBe(false)
  })

  it('V-07: writeValue(small Uint8Array) → ValueKind binary', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt('application/octet-stream', Store.RootItem)
    Item.writeValue(new Uint8Array([1, 2, 3]))
    expect(Item.ValueKind).toBe('binary')
  })

  it('V-08: readValue returns the written Uint8Array', async () => {
    const Store    = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt('application/octet-stream', Store.RootItem)
    const Bytes    = new Uint8Array([10, 20, 30])
    Item.writeValue(Bytes)
    const Result = await Item.readValue()
    expect(Result).toBeInstanceOf(Uint8Array)
    expect(Array.from(Result as Uint8Array)).toEqual([10, 20, 30])
  })

  it('V-09: isBinary true after binary write', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt('application/octet-stream', Store.RootItem)
    Item.writeValue(new Uint8Array([1]))
    expect(Item.isBinary).toBe(true)
  })

  it('V-10: large string → ValueKind literal-reference', () => {
    const Store  = SDS_DataStore.fromScratch({ LiteralSizeLimit:5 })
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello world')  // 11 chars > 5
    expect(Item.ValueKind).toBe('literal-reference')
  })

  it('V-11: large binary → ValueKind binary-reference', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt('application/octet-stream', Store.RootItem)
    Item.writeValue(new Uint8Array(3000))  // > 2048 bytes
    expect(Item.ValueKind).toBe('binary-reference')
  })

  it('V-12: changeValue splices the literal value', async () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello world')
    Item.changeValue(0, 5, 'Bye')  // replace 'hello' with 'Bye'
    expect(await Item.readValue()).toBe('Bye world')
  })

  it('V-13: changeValue on non-literal throws change-value-not-literal', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    expect(() => Item.changeValue(0, 1, 'x')).toThrowError(
      expect.objectContaining({ code:'change-value-not-literal' })
    )
  })

  it('V-14: value change fires ChangeSet with Value', () => {
    const Store   = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    const Handler = vi.fn()
    Store.onChangeInvoke(Handler)
    Item.writeValue('hello')
    const ChangeSet = Handler.mock.calls[0][1]
    expect(ChangeSet[Item.Id]?.has('Value')).toBe(true)
  })


  it('V-15: writeValue(undefined) on existing value → none', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    Item.writeValue(undefined)
    expect(Item.ValueKind).toBe('none')
  })

  it('V-16: writeValue with wrong-type argument throws SDS_Error invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item  = Store.newItemAt(undefined, Store.RootItem)
    expect(() => Item.writeValue(42 as any)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })

  it('V-17: large string round-trip — readValue returns the full string', async () => {
    const Store = SDS_DataStore.fromScratch({ LiteralSizeLimit:5 })
    const Item  = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello world')
    expect(Item.ValueKind).toBe('literal-reference')
    expect(await Item.readValue()).toBe('hello world')
  })

  it('V-18: large binary round-trip — readValue returns the full Uint8Array', async () => {
    const Store = SDS_DataStore.fromScratch()
    const Item  = Store.newItemAt('application/octet-stream', Store.RootItem)
    const Data  = new Uint8Array(3000)
    for (let i = 0; i < Data.length; i++) { Data[i] = i % 256 }
    Item.writeValue(Data)
    expect(Item.ValueKind).toBe('binary-reference')
    const Result = await Item.readValue()
    expect(Result).toBeInstanceOf(Uint8Array)
    expect(Array.from(Result as Uint8Array)).toEqual(Array.from(Data))
  })

  it('V-19: changeValue with negative fromIndex throws invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item  = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(() => Item.changeValue(-1, 2, 'x')).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })

  it('V-20: changeValue with toIndex < fromIndex throws invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item  = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(() => Item.changeValue(3, 2, 'x')).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })

  it('V-21: changeValue with non-string replacement throws invalid-argument', () => {
    const Store = SDS_DataStore.fromScratch()
    const Item  = Store.newItemAt(undefined, Store.RootItem)
    Item.writeValue('hello')
    expect(() => Item.changeValue(0, 2, 42 as any)).toThrowError(
      expect.objectContaining({ code:'invalid-argument' })
    )
  })
})
