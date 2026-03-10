/*******************************************************************************
*                                                                              *
*                                 InfoParser                                   *
*                                                                              *
*******************************************************************************/

// extracts --info.key value pairs from an argv-like array so that commander
// never sees them (commander would reject unknown options otherwise)

import { SDS_CommandError } from './StoreAccess.js'
import { ExitCodes }        from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                              extractInfoEntries                            //
//----------------------------------------------------------------------------//

/**** extractInfoEntries — removes --info.key [value] pairs from argv ****/

export function extractInfoEntries (Argv:readonly string[]):{
  CleanArgv:   string[]
  InfoEntries: Record<string,unknown>
} {
  const CleanArgv:string[]                 = []
  const InfoEntries:Record<string,unknown> = {}
  let ArgIdx = 0

  while (ArgIdx < Argv.length) {
    const Arg = Argv[ArgIdx]

    // --info.key=value  (value embedded with =)
    if (Arg.startsWith('--info.') && Arg.includes('=')) {
      const EqualsAt = Arg.indexOf('=')
      const Key      = Arg.slice(7, EqualsAt)
      const rawValue = Arg.slice(EqualsAt+1)
      InfoEntries[Key] = parseInfoValue(rawValue)
      ArgIdx++
      continue
    }

    // --info.key value  (value as next arg)
    if (Arg.startsWith('--info.') && (! Arg.includes('='))) {
      const Key     = Arg.slice(7)
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

  return { CleanArgv, InfoEntries }
}

/**** parseInfoValue — tries JSON parse first, falls back to plain string ****/

function parseInfoValue (raw:string):unknown {
  try { return JSON.parse(raw) } catch { return raw }
}

//----------------------------------------------------------------------------//
//                              applyInfoToEntry                              //
//----------------------------------------------------------------------------//

/**** applyInfoToEntry — writes info entries into the proxy returned by entry.Info ****/

export function applyInfoToEntry (
  InfoProxy:Record<string,unknown>,
  WholeMap:unknown,
  InfoEntries:Record<string,unknown>
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
      InfoProxy[Key] = Value
    }
  }

  // --info.xxx: set individual keys
  for (const [Key, Value] of Object.entries(InfoEntries)) {
    InfoProxy[Key] = Value
  }
}
