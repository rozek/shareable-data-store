/*******************************************************************************
*                                                                              *
*                               TrashCmd                                       *
*                                                                              *
*******************************************************************************/

// trash management: list, purge-all, purge-expired

import type { Command }  from 'commander'
import { TrashId }       from '@rozek/sds-core'

import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printLine } from '../Output.js'
import { SDS_CommandError, loadContext, closeContext, parseIntOption } from '../StoreAccess.js'
import { ExitCodes } from '../ExitCodes.js'

const DefaultTrashTTLms = 30*24*60*60*1000  // 30 days

//----------------------------------------------------------------------------//
//                            registerTrashCommands                           //
//----------------------------------------------------------------------------//

/**** registerTrashCommands — attaches the `trash` sub-tree to Program ****/

export function registerTrashCommands (Program:Command):void {
  const TrashCmd = Program.command('trash')
    .description('trash inspection and cleanup')

/**** trash list ****/

  TrashCmd.command('list')
    .description('list all entries currently in the trash')
    .option('--only <kind>', 'filter by kind: items | links')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdTrashList(Config, Options.only)
    })

/**** trash purge-all ****/

  TrashCmd.command('purge-all')
    .description('permanently delete every entry in the trash')
    .action(async (_Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdTrashPurgeAll(Config)
    })

/**** trash purge-expired ****/

  TrashCmd.command('purge-expired')
    .description('permanently delete trash entries older than --ttl milliseconds')
    .option('--ttl <ms>', 'TTL in milliseconds (default: 30 days)', String(DefaultTrashTTLms))
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const TTLms = parseIntOption(Options.ttl, '--ttl')
      if (TTLms <= 0) {
        throw new SDS_CommandError(
          `'--ttl' must be a positive integer — got ${TTLms}`,
          ExitCodes.UsageError
        )
      }
      await cmdTrashPurgeExpired(Config, TTLms)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdTrashList ****/

async function cmdTrashList (Config:SDSConfig, OnlyKind:string | undefined):Promise<void> {
  const NormalizedKind = OnlyKind?.toLowerCase()
  if (NormalizedKind != null && ! ['item', 'items', 'link', 'links'].includes(NormalizedKind)) {
    throw new SDS_CommandError(
      `'--only' accepts 'items' or 'links' — got '${OnlyKind}'`,
      ExitCodes.UsageError
    )
  }

  const Context = await loadContext(Config)
  try {
    const TrashItem = Context.Store.TrashItem
    const Entries   = Context.Store._innerEntriesOf(TrashItem.Id)
    const Filtered  = Entries.filter((Entry) => {
      if (NormalizedKind == null) { return true }
      const Kind = Entry.isItem ? 'item' : 'link'
      return (NormalizedKind === Kind+'s') || (NormalizedKind === Kind)
    })

    if (Config.Format === 'json') {
      printResult(Config, Filtered.map((Entry) => ({
        id:    Entry.Id,
        kind:  Entry.isItem ? 'item' : 'link',
        label: Entry.Label,
      })))
    } else {
      if (Filtered.length === 0) {
        printLine('(trash is empty)')
      } else {
        for (const Entry of Filtered) {
          const Kind = Entry.isItem ? 'item' : 'link'
          printLine(`${Entry.Id}  ${Kind}  ${Entry.Label}`)
        }
      }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdTrashPurgeAll ****/

async function cmdTrashPurgeAll (Config:SDSConfig):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const TrashItem = Context.Store.TrashItem
    const Entries   = [ ...Context.Store._innerEntriesOf(TrashItem.Id) ]
    let   Count     = 0

    for (const Entry of Entries) {
      try { Entry.purge(); Count++ } catch { /* skip protected entries */ }
    }

    if (Config.Format === 'json') {
      printResult(Config, { purged:Count })
    } else {
      printLine(`purged ${Count} entr${Count === 1 ? 'y' : 'ies'} from trash`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdTrashPurgeExpired ****/

async function cmdTrashPurgeExpired (Config:SDSConfig, TTLms:number):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Count = Context.Store.purgeExpiredTrashEntries(TTLms)

    if (Config.Format === 'json') {
      printResult(Config, { purged:Count, ttlMs:TTLms })
    } else {
      printLine(`purged ${Count} expired entr${Count === 1 ? 'y' : 'ies'} from trash`)
    }
  } finally {
    await closeContext(Context)
  }
}
