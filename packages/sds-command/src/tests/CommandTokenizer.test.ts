/*******************************************************************************
*                                                                              *
*                       CommandTokenizer — unit tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { tokenizeLine } from '../CommandTokenizer.js'

describe('tokenizeLine', () => {
  it('splits simple whitespace-separated tokens', () => {
    expect(tokenizeLine('item create')).toEqual(['item', 'create'])
  })

  it('returns an empty array for an empty line', () => {
    expect(tokenizeLine('')).toEqual([])
    expect(tokenizeLine('   ')).toEqual([])
  })

  it('handles single-quoted strings', () => {
    expect(tokenizeLine("--label 'my item'")).toEqual(['--label', 'my item'])
  })

  it('handles double-quoted strings', () => {
    expect(tokenizeLine('--label "my item"')).toEqual(['--label', 'my item'])
  })

  it('handles escaped quote inside double quotes', () => {
    expect(tokenizeLine('--label "say \\"hello\\""')).toEqual(['--label', 'say "hello"'])
  })

  it('strips inline comments starting with #', () => {
    expect(tokenizeLine('item list root # list all items')).toEqual(
      ['item', 'list', 'root']
    )
  })

  it('treats a line starting with # as a comment', () => {
    expect(tokenizeLine('# this whole line is a comment')).toEqual([])
  })

  it('handles multiple spaces between tokens', () => {
    expect(tokenizeLine('item   create   --label   test')).toEqual(
      ['item', 'create', '--label', 'test']
    )
  })

  it('handles tabs as whitespace', () => {
    expect(tokenizeLine('item\tcreate')).toEqual(['item', 'create'])
  })

  it('handles backslash-escaped space outside quotes', () => {
    expect(tokenizeLine('item\\ create')).toEqual(['item create'])
  })

  it('handles backslash-escaped double-quote outside quotes', () => {
    expect(tokenizeLine('\\"quoted\\"')).toEqual(['"quoted"'])
  })
})
