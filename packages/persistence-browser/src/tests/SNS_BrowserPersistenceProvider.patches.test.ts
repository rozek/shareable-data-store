/*******************************************************************************
*                                                                              *
*            SNS_BrowserPersistenceProvider — Patches Tests                    *
*                                                                              *
*******************************************************************************/

import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { SNS_BrowserPersistenceProvider }   from '../sns-persistence-browser.js'

//----------------------------------------------------------------------------//
//                                   Tests                                    //
//----------------------------------------------------------------------------//

describe('SNS_BrowserPersistenceProvider — Patches', () => {

  let Provider: SNS_BrowserPersistenceProvider
  beforeEach(() => {
    Provider = new SNS_BrowserPersistenceProvider(`store-${Math.random()}`)
  })

  it('BP-01: loadPatchesSince on empty DB returns []', async () => {
    expect(await Provider.loadPatchesSince(0)).toEqual([])
    await Provider.close()
  })

  it('BP-02: appendPatch then loadPatchesSince(0) returns that patch', async () => {
    await Provider.appendPatch(new Uint8Array([5, 6]), 100)
    const Loaded = await Provider.loadPatchesSince(0)
    expect(Loaded).toHaveLength(1)
    expect(Array.from(Loaded[0])).toEqual([5, 6])
    await Provider.close()
  })

  it('BP-03: multiple patches returned in ascending clock order', async () => {
    await Provider.appendPatch(new Uint8Array([3]), 300)
    await Provider.appendPatch(new Uint8Array([1]), 100)
    await Provider.appendPatch(new Uint8Array([2]), 200)
    const Loaded = await Provider.loadPatchesSince(0)
    expect(Loaded).toHaveLength(3)
    expect(Array.from(Loaded[0])).toEqual([1])
    expect(Array.from(Loaded[1])).toEqual([2])
    expect(Array.from(Loaded[2])).toEqual([3])
    await Provider.close()
  })

  it('BP-04: loadPatchesSince(clock) returns only patches after clock', async () => {
    await Provider.appendPatch(new Uint8Array([1]), 100)
    await Provider.appendPatch(new Uint8Array([2]), 200)
    await Provider.appendPatch(new Uint8Array([3]), 300)
    const Loaded = await Provider.loadPatchesSince(150)
    expect(Loaded).toHaveLength(2)
    expect(Array.from(Loaded[0])).toEqual([2])
    await Provider.close()
  })

  it('BP-05: prunePatches removes patches with clock < threshold', async () => {
    await Provider.appendPatch(new Uint8Array([1]), 100)
    await Provider.appendPatch(new Uint8Array([2]), 200)
    await Provider.appendPatch(new Uint8Array([3]), 300)
    await Provider.prunePatches(200)
    const Loaded = await Provider.loadPatchesSince(0)
    expect(Loaded).toHaveLength(2)
    expect(Array.from(Loaded[0])).toEqual([2])
    await Provider.close()
  })

})
