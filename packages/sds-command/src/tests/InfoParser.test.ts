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

  it('throws when --info is not a JSON object', () => {
    expect(() => applyInfoToEntry({}, '[1,2,3]', {})).toThrow()
  })
})
