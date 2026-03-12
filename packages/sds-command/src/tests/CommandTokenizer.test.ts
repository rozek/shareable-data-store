/*******************************************************************************
*                                                                              *
*                       CommandTokenizer — unit tests                          *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { tokenizeLine } from '../CommandTokenizer.js'

describe('tokenizeLine', () => {
  it('CT-01: returns an empty array for an empty line', () => {
    expect(tokenizeLine('')).toEqual([])
  })

  it('CT-02: returns an empty array for a whitespace-only line', () => {
    expect(tokenizeLine('   ')).toEqual([])
  })

  it('CT-03: splits simple whitespace-separated tokens', () => {
    expect(tokenizeLine('item create')).toEqual(['item', 'create'])
  })

  it('CT-04: handles multiple spaces between tokens', () => {
    expect(tokenizeLine('item   create   --label   test')).toEqual(
      ['item', 'create', '--label', 'test']
    )
  })

  it('CT-05: handles double-quoted strings', () => {
    expect(tokenizeLine('--label "my item"')).toEqual(['--label', 'my item'])
  })

  it('CT-06: handles single-quoted strings', () => {
    expect(tokenizeLine("--label 'my item'")).toEqual(['--label', 'my item'])
  })

  it('CT-07: unclosed quote merges the remaining input into the last token', () => {
    expect(tokenizeLine('"hello')).toEqual(['hello'])
  })

  it('CT-08: handles backslash-escaped space outside quotes', () => {
    expect(tokenizeLine('item\\ create')).toEqual(['item create'])
  })

  it('CT-09: handles backslash-escaped double-quote outside quotes', () => {
    expect(tokenizeLine('\\"quoted\\"')).toEqual(['"quoted"'])
  })

  it('CT-10: handles backslash-escaped double-quote inside a double-quoted string', () => {
    expect(tokenizeLine('--label "say \\"hello\\""')).toEqual(['--label', 'say "hello"'])
  })

  it('CT-11: strips inline comments starting with #', () => {
    expect(tokenizeLine('item list root # list all items')).toEqual(
      ['item', 'list', 'root']
    )
  })

  it('CT-12: treats a line starting with # as a comment', () => {
    expect(tokenizeLine('# this whole line is a comment')).toEqual([])
  })

  it('CT-13: handles tabs as whitespace', () => {
    expect(tokenizeLine('item\tcreate')).toEqual(['item', 'create'])
  })
})
