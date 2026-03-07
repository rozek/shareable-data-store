/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  DANGER — READ THIS BEFORE RUNNING                                       ║
 * ║                                                                          ║
 * ║  This script generates a NEW canonical empty snapshot.  Running it      ║
 * ║  and copying its output into canonical-empty-snapshot.ts will change    ║
 * ║  the internal json-joy CRDT node-ID space that ALL peers share.         ║
 * ║                                                                          ║
 * ║  Consequence: every existing persisted store and every stored patch      ║
 * ║  becomes PERMANENTLY INCOMPATIBLE with stores built from the new         ║
 * ║  snapshot.  There is no automatic migration path.                        ║
 * ║                                                                          ║
 * ║  Only run this when ALL of the following are true:                       ║
 * ║    1. The SNS entry schema has changed (new top-level CRDT fields).      ║
 * ║    2. You accept that all existing persisted data will be abandoned.     ║
 * ║    3. You have coordinated the change with all active deployments.       ║
 * ║                                                                          ║
 * ║  This script is intentionally NOT listed in package.json "scripts".     ║
 * ║  Run it explicitly and only when you understand the consequences:        ║
 * ║                                                                          ║
 * ║    node_modules/.bin/vitest run \                                        ║
 * ║      scripts/generate-canonical-snapshot.test.ts                        ║
 * ║                                                                          ║
 * ║  Then copy the printed CANONICAL_SNAPSHOT_BYTES into                     ║
 * ║  src/store/canonical-empty-snapshot.ts.                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * WHY this script bypasses SNS_NoteStore.fromScratch()
 * -----------------------------------------------------
 * fromScratch() now delegates to fromBinary(CanonicalEmptySnapshot).
 * Using it here would be circular: the output would just be a re-compressed
 * version of the existing snapshot, not a freshly seeded one.  Instead, this
 * script rebuilds the CRDT model directly from the schema, exactly as the
 * original snapshot was created.
 */

import { describe, it } from 'vitest'
import { Model }        from 'json-joy/lib/json-crdt'
import { s as Schema }  from 'json-joy/lib/json-crdt-patch/schema'
import { gzipSync }     from 'fflate'

const RootId         = '00000000-0000-4000-8000-000000000000'
const TrashId        = '00000000-0000-4000-8000-000000000001'
const LostAndFoundId = '00000000-0000-4000-8000-000000000002'

describe('DANGER: generate NEW canonical empty snapshot', () => {
  it('prints bytes to stdout — copy manually into canonical-empty-snapshot.ts', () => {
    const Model_ = Model.create()

    Model_.api.root(Schema.obj({
      Entries: Schema.obj({
        [RootId]: Schema.obj({
          Kind:     Schema.con('note'),
          Label:    Schema.val(Schema.str('')),
          Info:     Schema.obj({}),
          MIMEType: Schema.val(Schema.str('')),
          ValueKind:Schema.val(Schema.str('none')),
        }),
        [TrashId]: Schema.obj({
          Kind:          Schema.con('note'),
          outerPlacement:Schema.val(Schema.con({ outerNoteId: RootId, OrderKey: 'a0' })),
          Label:         Schema.val(Schema.str('trash')),
          Info:          Schema.obj({}),
          MIMEType:      Schema.val(Schema.str('')),
          ValueKind:     Schema.val(Schema.str('none')),
        }),
        [LostAndFoundId]: Schema.obj({
          Kind:          Schema.con('note'),
          outerPlacement:Schema.val(Schema.con({ outerNoteId: RootId, OrderKey: 'a1' })),
          Label:         Schema.val(Schema.str('lost-and-found')),
          Info:          Schema.obj({}),
          MIMEType:      Schema.val(Schema.str('')),
          ValueKind:     Schema.val(Schema.str('none')),
        }),
      }),
    }))
    Model_.api.flush()  // discard init patch — state is already set

    const Compressed = gzipSync(Model_.toBinary())
    const Bytes      = Array.from(Compressed).join(', ')

    // eslint-disable-next-line no-console
    console.log(`\nCANONICAL_SNAPSHOT_LENGTH=${Compressed.length}`)
    // eslint-disable-next-line no-console
    console.log(`CANONICAL_SNAPSHOT_BYTES=${Bytes}`)
    // eslint-disable-next-line no-console
    console.log('\nNOW: copy the bytes above into src/store/canonical-empty-snapshot.ts')
    // eslint-disable-next-line no-console
    console.log('WARNING: this will break all existing persisted stores and patches!\n')
  })
})
