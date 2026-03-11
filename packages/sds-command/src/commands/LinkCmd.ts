/*******************************************************************************
*                                                                              *
*                                LinkCmd                                       *
*                                                                              *
*******************************************************************************/

// link-specific operations: get and create

import type { Command }   from 'commander'
import type { SDS_Item }  from '@rozek/sds-core'
import { RootId }         from '@rozek/sds-core'

import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printLine, formatLinkLine } from '../Output.js'
import {
  SDS_CommandError, loadContext, closeContext, resolveEntryId,
} from '../StoreAccess.js'
import { extractInfoEntries, applyInfoToEntry } from '../InfoParser.js'
import { ExitCodes } from '../ExitCodes.js'

//----------------------------------------------------------------------------//
//                            registerLinkCommands                            //
//----------------------------------------------------------------------------//

/**** registerLinkCommands — attaches the `link` sub-tree to Program ****/

export function registerLinkCommands (Program:Command, ExtraArgv:string[]):void {
  const LinkCmd = Program.command('link')
    .description('link-specific operations')

/**** link get ****/

  LinkCmd.command('get <id>')
    .description('display link details')
    .option('--label',      'include label')
    .option('--target',     'include target item ID')
    .option('--info',       'include info map')
    .option('--info.<key>', 'include only the named info entry, e.g. --info.author')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdLinkGet(Config, Id, Options, InfoKey)
    })

/**** link create ****/

  LinkCmd.command('create')
    .description('create a new link pointing at a target item')
    .requiredOption('--target <itemId>',   'target item to point to')
    .option('--container <itemId>',        'container item (default: root)')
    .option('--at <index>',               'insertion index (default: append)')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdLinkCreate(Config, Options)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdLinkGet ****/

async function cmdLinkGet (
  Config:SDSConfig, RawId:string,
  Options:{ label?:boolean; target?:boolean; info?:boolean },
  InfoKey:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if ((Entry == null) || (! Entry.isLink)) {
      throw new SDS_CommandError(`link '${Id}' not found`, ExitCodes.NotFound)
    }

    const ShowAll  = ! (Options.label || Options.target || Options.info || (InfoKey != null))
    const TargetId = Context.Store._TargetOf(Id).Id

    if (Config.Format === 'json') {
      const Obj:Record<string,unknown> = { id:Id, kind:'link' }
      if (ShowAll || Options.label)  { Obj['label']  = Entry.Label }
      if (ShowAll || Options.target) { Obj['target'] = TargetId }
      switch (true) {
        case (InfoKey != null): {
          Obj['info.'+InfoKey!] = Context.Store._InfoProxyOf(Id)[InfoKey!] ?? null
          break
        }
        case (ShowAll || Options.info): {
          Obj['info'] = { ...Context.Store._InfoProxyOf(Id) }
          break
        }
      }
      printResult(Config, Obj)
    } else {
      printLine(`id:     ${Id}`)
      printLine(`kind:   link`)
      if (ShowAll || Options.label)  { printLine(`label:  ${Entry.Label}`) }
      if (ShowAll || Options.target) { printLine(`target: ${TargetId}`) }
      switch (true) {
        case (InfoKey != null): {
          const Value = Context.Store._InfoProxyOf(Id)[InfoKey!]
          printLine(`info.${InfoKey}: ${JSON.stringify(Value ?? null)}`)
          break
        }
        case (ShowAll || Options.info): {
          printLine(`info:   ${JSON.stringify(Context.Store._InfoProxyOf(Id))}`)
          break
        }
      }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdLinkCreate ****/

async function cmdLinkCreate (
  Config:SDSConfig,
  Options:{ target:string; container?:string; at?:string }
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const TargetId    = resolveEntryId(Options.target)
    const ContainerId = resolveEntryId(Options.container ?? RootId)
    const AtIndex     = Options.at != null ? parseInt(Options.at, 10) : undefined

    const Target    = Context.Store.EntryWithId(TargetId) as SDS_Item | undefined
    const Container = Context.Store.EntryWithId(ContainerId) as SDS_Item | undefined

    if ((Target == null) || (! Target.isItem)) {
      throw new SDS_CommandError(
        `target '${TargetId}' not found or is not an item`, ExitCodes.NotFound
      )
    }
    if ((Container == null) || (! Container.isItem)) {
      throw new SDS_CommandError(
        `container '${ContainerId}' not found or is not an item`, ExitCodes.NotFound
      )
    }

    const Link = Context.Store.newLinkAt(Target, Container, AtIndex)

    if (Config.Format === 'json') {
      printResult(Config, { id:Link.Id, created:true, target:TargetId })
    } else {
      printLine(Link.Id)
    }
  } finally {
    await closeContext(Context)
  }
}
