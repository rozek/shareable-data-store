/*******************************************************************************
*                                                                              *
*                          InfoParser — unit tests                             *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { extractInfoEntries, applyInfoToEntry } from '../InfoParser.js'

describe('extractInfoEntries', () => {
  it('passes through unrelated args unchanged', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['item', 'create', '--label', 'test']
    )
    expect(CleanArgv).toEqual(['item', 'create', '--label', 'test'])
    expect(InfoEntries).toEqual({})
  })

  it('extracts --info.key value pairs', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['item', 'create', '--info.author', 'Alice', '--label', 'x']
    )
    expect(CleanArgv).toEqual(['item', 'create', '--label', 'x'])
    expect(InfoEntries).toEqual({ author:'Alice' })
  })

  it('parses JSON values for info entries', () => {
    const { InfoEntries } = extractInfoEntries(
      ['--info.count', '42', '--info.active', 'true']
    )
    expect(InfoEntries).toEqual({ count:42, active:true })
  })

  it('handles --info.key=value syntax', () => {
    const { InfoEntries } = extractInfoEntries(['--info.name=Alice'])
    expect(InfoEntries).toEqual({ name:'Alice' })
  })

  it('treats a flag without a value as boolean true', () => {
    const { InfoEntries } = extractInfoEntries(['--info.flag'])
    expect(InfoEntries).toEqual({ flag:true })
  })

  it('extracts multiple info entries', () => {
    const { CleanArgv, InfoEntries } = extractInfoEntries(
      ['--info.a', '1', '--info.b', '"hello"', '--mime', 'text/plain']
    )
    expect(CleanArgv).toEqual(['--mime', 'text/plain'])
    expect(InfoEntries).toEqual({ a:1, b:'hello' })
  })

  it('accepts valid JavaScript identifier keys', () => {
    const { InfoEntries } = extractInfoEntries(
      ['--info._private', 'x', '--info.$ref', 'y', '--info.count1', 'z']
    )
    expect(InfoEntries).toEqual({ _private:'x', $ref:'y', count1:'z' })
  })

  it('throws on a key with a hyphen (--info.my-key)', () => {
    expect(() => extractInfoEntries(['--info.my-key', 'val'])).toThrow()
  })

  it('throws on a key starting with a digit (--info.1st)', () => {
    expect(() => extractInfoEntries(['--info.1st', 'val'])).toThrow()
  })

  it('throws on a key with an embedded dot (--info.a.b=v)', () => {
    expect(() => extractInfoEntries(['--info.a.b=val'])).toThrow()
  })

  it('throws on an empty key (--info.=v)', () => {
    expect(() => extractInfoEntries(['--info.=val'])).toThrow()
  })
})

describe('applyInfoToEntry', () => {
  it('sets keys from a JSON object string', () => {
    const Proxy:Record<string,unknown> = {}
    applyInfoToEntry(Proxy, '{"x":1,"y":2}', {})
    expect(Proxy).toMatchObject({ x:1, y:2 })
  })

  it('merges individual info entries', () => {
    const Proxy:Record<string,unknown> = { existing:'keep' }
    applyInfoToEntry(Proxy, null, { newKey:'value' })
    expect(Proxy).toMatchObject({ existing:'keep', newKey:'value' })
  })

  it('throws on invalid JSON for --info', () => {
    expect(() => applyInfoToEntry({}, 'not-json', {})).toThrow()
  })

  it('throws when --info is not a JSON object (array)', () => {
    expect(() => applyInfoToEntry({}, '[1,2,3]', {})).toThrow()
  })

  it('throws when --info is not a JSON object (null)', () => {
    expect(() => applyInfoToEntry({}, 'null', {})).toThrow()
  })

  it('throws when --info is not a JSON object (string)', () => {
    expect(() => applyInfoToEntry({}, '"hello"', {})).toThrow()
  })

  it('throws when --info is not a JSON object (number)', () => {
    expect(() => applyInfoToEntry({}, '42', {})).toThrow()
  })

  it('throws when --info JSON contains a key with a hyphen', () => {
    expect(() => applyInfoToEntry({}, '{"my-key":1}', {})).toThrow()
  })

  it('throws when --info JSON contains a key starting with a digit', () => {
    expect(() => applyInfoToEntry({}, '{"1st":"value"}', {})).toThrow()
  })

  it('accepts valid JavaScript identifier keys in --info JSON', () => {
    const Proxy:Record<string,unknown> = {}
    applyInfoToEntry(Proxy, '{"_private":1,"$ref":"y","count1":true}', {})
    expect(Proxy).toMatchObject({ _private:1, $ref:'y', count1:true })
  })
})
