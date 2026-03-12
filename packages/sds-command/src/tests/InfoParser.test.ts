/*******************************************************************************
*                                                                              *
*                          InfoParser — unit tests                             *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { extractInfoEntries, applyInfoToEntry } from '../InfoParser.js'

describe('extractInfoEntries / applyInfoToEntry', () => {
  it('IP-01: passes through unrelated args unchanged', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['item', 'create', '--label', 'test']
    )
    expect(CleanArgv).toEqual(['item', 'create', '--label', 'test'])
    expect(InfoEntries).toEqual({})
  })

  it('IP-02: extracts --info.key value pairs', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['item', 'create', '--info.author', 'Alice', '--label', 'x']
    )
    expect(CleanArgv).toEqual(['item', 'create', '--label', 'x'])
    expect(InfoEntries).toEqual({ author:'Alice' })
  })

  it('IP-03: extracts multiple info entries', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['--info.a', '1', '--info.b', '"hello"', '--mime', 'text/plain']
    )
    expect(CleanArgv).toEqual(['--mime', 'text/plain'])
    expect(InfoEntries).toEqual({ a:1, b:'hello' })
  })

  it('IP-04: parses numeric and boolean JSON values for info entries', () => {
    const { InfoEntries } = extractInfoEntries(
      ['--info.count', '42', '--info.active', 'true']
    )
    expect(InfoEntries).toEqual({ count:42, active:true })
  })

  it('IP-05: sets keys from a JSON object string', () => {
    const Proxy:Record<string,unknown> = {}
    applyInfoToEntry(Proxy, '{"x":1,"y":2}', {})
    expect(Proxy).toMatchObject({ x:1, y:2 })
  })

  it('IP-06: merges individual info entries', () => {
    const Proxy:Record<string,unknown> = { existing:'keep' }
    applyInfoToEntry(Proxy, null, { newKey:'value' })
    expect(Proxy).toMatchObject({ existing:'keep', newKey:'value' })
  })

  it('IP-07: applyInfoToEntry with null for both args leaves the proxy unchanged', () => {
    const Proxy:Record<string,unknown> = { existing:'keep' }
    applyInfoToEntry(Proxy, null, {})
    expect(Proxy).toMatchObject({ existing:'keep' })
    expect(Object.keys(Proxy)).toHaveLength(1)
  })

  it('IP-08: throws on invalid JSON for --info', () => {
    expect(() => applyInfoToEntry({}, 'not-json', {})).toThrow()
  })

  it('IP-09: throws on a key with a hyphen (--info.my-key)', () => {
    expect(() => extractInfoEntries(['--info.my-key', 'val'])).toThrow()
  })

  it('IP-10: throws when --info JSON contains a key with a hyphen', () => {
    expect(() => applyInfoToEntry({}, '{"my-key":1}', {})).toThrow()
  })

  it('IP-11: throws when --info is not a JSON object (null)', () => {
    expect(() => applyInfoToEntry({}, 'null', {})).toThrow()
  })

  it('IP-12: throws when --info is not a JSON object (string)', () => {
    expect(() => applyInfoToEntry({}, '"hello"', {})).toThrow()
  })

  it('IP-13: throws when --info is not a JSON object (number)', () => {
    expect(() => applyInfoToEntry({}, '42', {})).toThrow()
  })

  it('IP-14: handles --info.key=value syntax', () => {
    const { InfoEntries } = extractInfoEntries(['--info.name=Alice'])
    expect(InfoEntries).toEqual({ name:'Alice' })
  })

  it('IP-15: treats a flag without a value as boolean true', () => {
    const { InfoEntries } = extractInfoEntries(['--info.flag'])
    expect(InfoEntries).toEqual({ flag:true })
  })

  it('IP-16: accepts valid JavaScript identifier keys', () => {
    const { InfoEntries } = extractInfoEntries(
      ['--info._private', 'x', '--info.$ref', 'y', '--info.count1', 'z']
    )
    expect(InfoEntries).toEqual({ _private:'x', $ref:'y', count1:'z' })
  })

  it('IP-17: throws on a key starting with a digit (--info.1st)', () => {
    expect(() => extractInfoEntries(['--info.1st', 'val'])).toThrow()
  })

  it('IP-18: throws on a key with an embedded dot (--info.a.b=v)', () => {
    expect(() => extractInfoEntries(['--info.a.b=val'])).toThrow()
  })

  it('IP-19: throws on an empty key (--info.=v)', () => {
    expect(() => extractInfoEntries(['--info.=val'])).toThrow()
  })

  it('IP-20: throws when --info is not a JSON object (array)', () => {
    expect(() => applyInfoToEntry({}, '[1,2,3]', {})).toThrow()
  })

  it('IP-21: throws when --info JSON contains a key starting with a digit', () => {
    expect(() => applyInfoToEntry({}, '{"1st":"value"}', {})).toThrow()
  })

  it('IP-22: accepts valid JavaScript identifier keys in --info JSON', () => {
    const Proxy:Record<string,unknown> = {}
    applyInfoToEntry(Proxy, '{"_private":1,"$ref":"y","count1":true}', {})
    expect(Proxy).toMatchObject({ _private:1, $ref:'y', count1:true })
  })

  it('IP-23: --info-delete.key is extracted into InfoDeleteKeys; flag absent from CleanArgv', () => {
    const { CleanArgv, InfoDeleteKeys } = extractInfoEntries(
      ['entry', 'update', '--info-delete.tag', 'someId']
    )
    expect(InfoDeleteKeys).toContain('tag')
    expect(CleanArgv).not.toContain('--info-delete.tag')
    expect(CleanArgv).toEqual(['entry', 'update', 'someId'])
  })

  it('IP-24: multiple --info-delete.<key> flags all collected into InfoDeleteKeys; none remain in CleanArgv', () => {
    const { CleanArgv, InfoDeleteKeys } = extractInfoEntries(
      ['--info-delete.a', '--info-delete.b', '--info-delete.c', 'cmd']
    )
    expect(InfoDeleteKeys).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    expect(InfoDeleteKeys).toHaveLength(3)
    expect(CleanArgv).toEqual(['cmd'])
  })

  it('IP-25: invalid key in --info-delete.<key> (e.g. --info-delete.my-key) throws with UsageError', () => {
    expect(() => extractInfoEntries(['--info-delete.my-key'])).toThrow()
  })

  it('IP-26: applyInfoToEntry with non-empty InfoDeleteKeys removes those keys from the proxy; other keys remain', () => {
    const Proxy:Record<string,unknown> = { keep:'yes', remove:'bye', also:'here' }
    applyInfoToEntry(Proxy, null, {}, ['remove'])
    expect('remove' in Proxy).toBe(false)
    expect(Proxy['keep']).toBe('yes')
    expect(Proxy['also']).toBe('here')
  })
})
