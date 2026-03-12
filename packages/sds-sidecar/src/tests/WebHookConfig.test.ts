/*******************************************************************************
*                                                                              *
*                         parseWebHookConfig — unit tests                      *
*                                                                              *
*******************************************************************************/

import { describe, it, expect } from 'vitest'
import { parseWebHookConfig, SDS_SidecarError } from '../Config.js'

//----------------------------------------------------------------------------//
//                        structural validation tests                         //
//----------------------------------------------------------------------------//

describe('parseWebHookConfig — structural validation', () => {

/**** TC-PC-01 — rejects non-object inputs ****/

  // null, a primitive string, and an array all fail the object-shape guard;
  // they belong to the same equivalence class and share one code path
  it('rejects null, primitives, and arrays', () => {
    expect(() => parseWebHookConfig(null,     0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig('string', 0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig([],       0)).toThrow(SDS_SidecarError)
  })

/**** TC-PC-02 — rejects missing, empty, or whitespace-only URL ****/

  // URL absence and blank strings all fail the non-empty-string guard
  it('rejects missing URL, empty string, and whitespace-only string', () => {
    expect(() => parseWebHookConfig({},                          0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ URL:'' },                  0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ URL:'   ' },               0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ URL:42 },                  0)).toThrow(SDS_SidecarError)
  })

/**** TC-PC-03 — rejects invalid maxDepth values ****/

  // negative number and non-integer both fail the non-negative-integer guard;
  // assumes TC-PC-02 passes (URL validation works)
  it('rejects negative and non-integer maxDepth', () => {
    const Base = { URL:'https://hooks.example.com', on:['change'] }
    expect(() => parseWebHookConfig({ ...Base, maxDepth:-1  }, 0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ ...Base, maxDepth:1.5 }, 0)).toThrow(SDS_SidecarError)
  })

/**** TC-PC-04 — rejects missing, empty, and non-array `on` ****/

  // `on` is required; an empty array and a non-array all fail the guard
  it('rejects absent, empty, and non-array `on`', () => {
    const Base = { URL:'https://hooks.example.com' }
    expect(() => parseWebHookConfig({ ...Base },              0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ ...Base, on:[] },       0)).toThrow(SDS_SidecarError)
    expect(() => parseWebHookConfig({ ...Base, on:'change' }, 0)).toThrow(SDS_SidecarError)
  })

/**** TC-PC-05 — rejects an invalid trigger inside `on` ****/

  // wraps parseTriggerSpec errors with a WebHooks[i].on[j]: prefix;
  // assumes TC-PC-04 passes (array presence is checked)
  it('rejects unknown trigger string inside `on`', () => {
    const Config = { URL:'https://hooks.example.com', on:['change', 'not-a-trigger'] }
    expect(() => parseWebHookConfig(Config, 0)).toThrow(SDS_SidecarError)
  })

})

//----------------------------------------------------------------------------//
//                            happy-path tests                                //
//----------------------------------------------------------------------------//

describe('parseWebHookConfig — happy paths', () => {

/**** TC-PC-06 — accepts minimal valid config ****/

  // only URL and one trigger are required; all optional fields are undefined
  it('accepts a minimal config with URL and one trigger', () => {
    const Result = parseWebHookConfig(
      { URL:'https://hooks.example.com', on:['change'] }, 0
    )
    expect(Result).toEqual({
      URL:      'https://hooks.example.com',
      Topic:    undefined,
      Watch:    undefined,
      maxDepth: undefined,
      on:       [ { Kind:'change' } ],
    })
  })

/**** TC-PC-07 — accepts a full config with all optional fields ****/

  // assumption: TC-PC-06 passes (URL + trigger parsing is correct)
  // exercises Topic, Watch, maxDepth, and multiple triggers including info:
  it('accepts a full config with Topic, Watch, maxDepth, and mixed triggers', () => {
    const Result = parseWebHookConfig({
      URL:      'https://hooks.example.com/store',
      Topic:    'my-topic',
      Watch:    'abc-uuid-123',
      maxDepth: 2,
      on:       [ 'create', 'value:image/*', 'info:public=true' ],
    }, 1)
    expect(Result).toEqual({
      URL:      'https://hooks.example.com/store',
      Topic:    'my-topic',
      Watch:    'abc-uuid-123',
      maxDepth: 2,
      on:       [
        { Kind:'create' },
        { Kind:'value', MIMEGlob:'image/*' },
        { Kind:'info', Key:'public', Value:'true' },
      ],
    })
  })

/**** TC-PC-08 — trims whitespace from URL — builds on TC-PC-06 ****/

  // assumption: TC-PC-06 passes (basic URL parsing works)
  // verifies that leading/trailing whitespace is stripped from the URL
  it('trims whitespace from URL', () => {
    const Result = parseWebHookConfig(
      { URL:'  https://hooks.example.com  ', on:['delete'] }, 0
    )
    expect(Result.URL).toBe('https://hooks.example.com')
  })

/**** TC-PC-09 — error messages include webhook index — builds on TC-PC-01 ****/

  // assumption: TC-PC-01 passes (structural rejection works)
  // verifies that the index is embedded in the error message for traceability
  it('includes the webhook index in error messages', () => {
    expect(() => parseWebHookConfig(null, 3)).toThrow('WebHooks[3]')
    expect(() => parseWebHookConfig({ URL:'', on:['change'] }, 7)).toThrow('WebHooks[7].URL')
  })

})
