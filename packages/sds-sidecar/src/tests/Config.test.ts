/*******************************************************************************
*                                                                              *
*                             Config — unit tests                              *
*                                                                              *
*******************************************************************************/

import path from 'node:path'

import { describe, it, expect } from 'vitest'
import { parseTriggerSpec, DBPathFor, SDS_SidecarError } from '../Config.js'

//----------------------------------------------------------------------------//
//                           parseTriggerSpec tests                           //
//----------------------------------------------------------------------------//

describe('parseTriggerSpec', () => {

/**** TC-PS-01 — simple keyword triggers ****/

  // 'change', 'create', 'delete', and bare 'value' all follow the same
  // direct-equality branch pattern and return { Kind:<keyword> }; they are
  // tested together as data variation over a single code path
  it('parses simple keyword triggers', () => {
    for (const Kind of [ 'change', 'create', 'delete', 'value' ] as const) {
      expect(parseTriggerSpec(Kind)).toEqual({ Kind })
    }
  })

/**** TC-PS-02 — value:<mime-glob> trigger ****/

  // exercises the 'value:' prefix path and verifies the MIMEGlob field
  it("parses 'value:image/*'", () => {
    expect(parseTriggerSpec('value:image/*')).toEqual({ Kind:'value', MIMEGlob:'image/*' })
  })

/**** TC-PS-03 — value: with empty glob ****/

  // the trim().length === 0 guard inside the 'value:' branch
  it("rejects 'value:' with empty MIME glob", () => {
    expect(() => parseTriggerSpec('value:')).toThrow(SDS_SidecarError)
  })

/**** TC-PS-04 — info:<key>=<value> trigger ****/

  // basic info parsing: first '=' splits key from value
  it("parses 'info:public=true'", () => {
    expect(parseTriggerSpec('info:public=true')).toEqual({
      Kind:'info', Key:'public', Value:'true',
    })
  })

/**** TC-PS-05 — '=' inside the info value — builds on TC-PS-04 ****/

  // assumption: TC-PS-04 passes (basic info parsing works)
  // verifies that only the first '=' is used as the separator
  it("allows '=' in the info value part", () => {
    expect(parseTriggerSpec('info:token=abc=def')).toEqual({
      Kind:'info', Key:'token', Value:'abc=def',
    })
  })

/**** TC-PS-06 — info: with missing or empty key ****/

  // both 'info:' (EqIdx === -1) and 'info:=value' (EqIdx === 0) fail the
  // EqIdx < 1 guard — they belong to the same equivalence class
  it("rejects 'info:' (no '=') and 'info:=value' (empty key)", () => {
    expect(() => parseTriggerSpec('info:')).toThrow(SDS_SidecarError)
    expect(() => parseTriggerSpec('info:=value')).toThrow(SDS_SidecarError)
  })

/**** TC-PS-07 — unknown trigger strings ****/

  it('rejects unknown trigger strings', () => {
    expect(() => parseTriggerSpec('unknown')).toThrow(SDS_SidecarError)
    expect(() => parseTriggerSpec('')).toThrow(SDS_SidecarError)
  })

})

//----------------------------------------------------------------------------//
//                               DBPathFor tests                              //
//----------------------------------------------------------------------------//

describe('DBPathFor', () => {

/**** TC-DP-01 — alphanumeric store ID is passed through unchanged ****/

  // a store ID containing only [a-zA-Z0-9_-] must not be altered
  it('keeps a safe store ID unchanged', () => {
    const Result = DBPathFor('/data', 'my-store_1')
    expect(Result).toBe(path.join('/data', 'my-store_1.db'))
  })

/**** TC-DP-02 — special characters in store ID are replaced with underscores ****/

  // any character outside [a-zA-Z0-9_-] is substituted — builds on TC-DP-01
  it('sanitises special characters in store ID', () => {
    const Result = DBPathFor('/data', 'foo bar/baz')
    expect(Result).toBe(path.join('/data', 'foo_bar_baz.db'))
  })

/**** TC-DP-03 — output always ends with .db inside PersistenceDir ****/

  // verifies the path structure independent of sanitisation — builds on TC-DP-01
  it('returns a path inside PersistenceDir with .db extension', () => {
    const Dir    = '/some/persist/dir'
    const Result = DBPathFor(Dir, 'store')
    expect(Result.startsWith(Dir)).toBe(true)
    expect(Result.endsWith('.db')).toBe(true)
  })

})
