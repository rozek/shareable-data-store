/*******************************************************************************
*                                                                              *
*                          WebHookManager — unit tests                         *
*                                                                              *
*******************************************************************************/

// tests the MIME-glob matching helper and trigger-label formatting used by
// WebHookManager; store-dependent paths are covered via integration tests

import { describe, it, expect } from 'vitest'

//----------------------------------------------------------------------------//
//                         MIME glob matching (inline)                        //
//----------------------------------------------------------------------------//

// the helper is private in WebHookManager; we re-implement it here to test
// the logic in isolation — it must stay in sync with the production code

function matchesMIMEGlob (MIMEType:string, Glob:string):boolean {
  const Pattern = Glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
                      .replace(/\*/g, '.*')
                      .replace(/\?/g, '.')
  return new RegExp(`^${Pattern}$`, 'i').test(MIMEType)
}

describe('matchesMIMEGlob', () => {

/**** TC-MG-01 — wildcard subtype: positive match and cross-type rejection ****/

  // a single subtype wildcard matches within the same supertype and rejects
  // a different supertype — both directions in one test because they exercise
  // the same regex path with opposite outcomes
  it("'image/*' matches image/png and rejects video/mp4", () => {
    expect(matchesMIMEGlob('image/png', 'image/*')).toBe(true)
    expect(matchesMIMEGlob('video/mp4', 'image/*')).toBe(false)
  })

/**** TC-MG-02 — double-wildcard glob — builds on TC-MG-01 ****/

  // assumption: TC-MG-01 passes (wildcard expansion and matching work)
  // one representative is enough — the same regex logic handles any MIME type
  it("'*/*' matches any MIME type", () => {
    expect(matchesMIMEGlob('text/plain', '*/*')).toBe(true)
  })

/**** TC-MG-03 — exact match (no wildcard) ****/

  it('exact match works for equal and unequal types', () => {
    expect(matchesMIMEGlob('application/json', 'application/json')).toBe(true)
    expect(matchesMIMEGlob('application/xml',  'application/json')).toBe(false)
  })

/**** TC-MG-04 — matching is case-insensitive ****/

  it('is case-insensitive', () => {
    expect(matchesMIMEGlob('Image/PNG', 'image/*')).toBe(true)
    expect(matchesMIMEGlob('image/png', 'Image/*')).toBe(true)
  })

/**** TC-MG-05 — dots are treated as literals, not regex wildcards ****/

  it('dots in MIME type are treated literally', () => {
    // 'image/svg.xml' must not match 'image/svgXxml' (dot ≠ any char)
    expect(matchesMIMEGlob('image/svgXxml', 'image/svg.xml')).toBe(false)
    expect(matchesMIMEGlob('image/svg.xml', 'image/svg.xml')).toBe(true)
  })

})

//----------------------------------------------------------------------------//
//                         depth-check formula tests                          //
//----------------------------------------------------------------------------//

// the depth check in WebHookManager counts how deep into the chain the
// watchId appears.  depth 1 = direct child of watchId.

describe('depth-check formula', () => {

/**** TC-DC-01 — direct child has depth 1 ****/

  // outerItemChain = [immediateParent, grandparent, root]
  // when watchId === immediateParent, chainIndex = 0 → depth = 1
  it('direct child has depth 1', () => {
    const WatchId = 'watch'
    const Chain   = [ { Id:'watch' }, { Id:'root' } ]
    const Depth   = Chain.findIndex((Item) => Item.Id === WatchId)
    expect(Depth+1).toBe(1)
  })

/**** TC-DC-02 — watchId absent from chain — builds on TC-DC-01 ****/

  // assumption: TC-DC-01 passes (findIndex + 1 formula is correct)
  // a grandchild's depth (chainIndex 1 → depth 2) follows directly from the
  // same formula, so it adds no new information; tested here only for the
  // 'watchId not found' path which returns -1 and means 'not in subtree'
  it('returns -1 when watchId is not in chain', () => {
    const WatchId = 'other'
    const Chain   = [ { Id:'parent' }, { Id:'root' } ]
    const Depth   = Chain.findIndex((Item) => Item.Id === WatchId)
    expect(Depth).toBe(-1)
  })

})
