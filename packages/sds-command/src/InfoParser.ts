/*******************************************************************************
*                                                                              *
*                                 InfoParser                                   *
*                                                                              *
*******************************************************************************/

// extracts --info.key value pairs and --info-delete.key flags from an
// argv-like array so that commander never sees them (commander would
// reject unknown options otherwise)

import { SDS_CommandError } from './StoreAccess.js'
import { ExitCodes }        from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                              isValidInfoKey                                //
//----------------------------------------------------------------------------//

// valid info keys must be valid JavaScript identifiers — this is required
// because the key is embedded in the option name (--info.<key>) and any
// spaces or special characters would prevent correct parsing

const ValidInfoKeyPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

/**** assertValidInfoKey ****/

function assertValidInfoKey (Key:string):void {
  if (! ValidInfoKeyPattern.test(Key)) {
    throw new SDS_CommandError(
      `invalid info key ${JSON.stringify(Key)} — keys must be valid JavaScript identifiers`,
      ExitCodes.UsageError
    )
  }
}

//----------------------------------------------------------------------------//
//                              extractInfoEntries                            //
//----------------------------------------------------------------------------//

/**** extractInfoEntries — removes --info.key [value] and --info-delete.key pairs from argv ****/

export function extractInfoEntries (Argv:readonly string[]):{
  CleanArgv:      string[]
  InfoEntries:    Record<string,unknown>
  InfoDeleteKeys: string[]
} {
  const CleanArgv:string[]                 = []
  const InfoEntries:Record<string,unknown> = {}
  const InfoDeleteKeys:string[]            = []
  let ArgIdx = 0

  while (ArgIdx < Argv.length) {
    const Arg = Argv[ArgIdx]

    // --info-delete.key  (flag only — no value)
    if (Arg.startsWith('--info-delete.')) {
      const Key = Arg.slice(14)
      assertValidInfoKey(Key)
      InfoDeleteKeys.push(Key)
      ArgIdx++
      continue
    }

    // --info.key=value  (value embedded with =)
    if (Arg.startsWith('--info.') && Arg.includes('=')) {
      const EqualsAt = Arg.indexOf('=')
      const Key      = Arg.slice(7, EqualsAt)
      const rawValue = Arg.slice(EqualsAt+1)
      assertValidInfoKey(Key)
      InfoEntries[Key] = parseInfoValue(rawValue)
      ArgIdx++
      continue
    }

    // --info.key value  (value as next arg)
    if (Arg.startsWith('--info.') && (! Arg.includes('='))) {
      const Key     = Arg.slice(7)
      assertValidInfoKey(Key)
      const nextArg = Argv[ArgIdx+1]
      if ((nextArg != null) && (! nextArg.startsWith('--'))) {
        InfoEntries[Key] = parseInfoValue(nextArg)
        ArgIdx += 2
        continue
      }
      // flag without value — set to true
      InfoEntries[Key] = true
      ArgIdx++
      continue
    }

    CleanArgv.push(Arg)
    ArgIdx++
  }

  return { CleanArgv, InfoEntries, InfoDeleteKeys }
}

/**** parseInfoValue — tries JSON parse first, falls back to plain string ****/

function parseInfoValue (raw:string):unknown {
  try { return JSON.parse(raw) } catch { return raw }
}

//----------------------------------------------------------------------------//
//                              applyInfoToEntry                              //
//----------------------------------------------------------------------------//

/**** applyInfoToEntry — writes and deletes info entries via the proxy returned by entry.Info ****/

export function applyInfoToEntry (
  InfoProxy:Record<string,unknown>,
  WholeMap:unknown,
  InfoEntries:Record<string,unknown>,
  InfoDeleteKeys:string[] = []
):void {
  // --info <json>: set all keys from the map (merge into existing info)
  if (WholeMap != null) {
    let parsedValue:unknown
    if (typeof WholeMap === 'string') {
      try { parsedValue = JSON.parse(WholeMap) } catch {
        throw new SDS_CommandError(
          `--info value is not valid JSON: ${WholeMap}`,
          ExitCodes.UsageError
        )
      }
    } else {
      parsedValue = WholeMap
    }
    if ((typeof parsedValue !== 'object') || (parsedValue === null) || Array.isArray(parsedValue)) {
      throw new SDS_CommandError(
        '--info value must be a JSON object',
        ExitCodes.UsageError
      )
    }
    for (const [Key, Value] of Object.entries(parsedValue as Record<string,unknown>)) {
      assertValidInfoKey(Key)
      InfoProxy[Key] = Value
    }
  }

  // --info.key: set individual keys (already validated in extractInfoEntries)
  for (const [Key, Value] of Object.entries(InfoEntries)) {
    InfoProxy[Key] = Value
  }

  // --info-delete.key: remove individual keys (already validated in extractInfoEntries)
  for (const Key of InfoDeleteKeys) {
    delete InfoProxy[Key]
  }
}
