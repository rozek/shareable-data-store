/*******************************************************************************
*                                                                              *
*                               EntryCmd                                       *
*                                                                              *
*******************************************************************************/

// shared entry operations: get, move, delete, restore, purge

import type { Command }    from 'commander'
import type { SDS_Entry }  from '@rozek/sds-core'
import type { SDS_Item }   from '@rozek/sds-core'
import { RootId, TrashId } from '@rozek/sds-core'

import type { SDSConfig }  from '../Config.js'
import { printResult, printLine } from '../Output.js'
import {
  SDS_CommandError, loadContext, closeContext, resolveEntryId,
} from '../StoreAccess.js'
import { ExitCodes } from '../ExitCodes.js'
import { extractInfoEntries } from '../InfoParser.js'

//----------------------------------------------------------------------------//
//                           registerEntryCommands                            //
//----------------------------------------------------------------------------//

/**** registerEntryCommands — attaches the `entry` sub-tree to Program ****/

export function registerEntryCommands (Program:Command, ExtraArgv:string[]):void {
  const EntryCmd = Program.command('entry')
    .description('operations shared by items and links')

/**** entry get ****/

  EntryCmd.command('get <id>')
    .description('display all or selected fields of an entry')
    .option('--label',          'include label')
    .option('--mime',           'include MIME type (items only)')
    .option('--value',          'include value (items only)')
    .option('--info',           'include full info map')
    .option('--info.xxx <key>', 'include a specific info key (see --info.key)')
    .option('--target',         'include link target ID (links only)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = SubCommand.optsWithGlobals()
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdEntryGet(Config, Id, Options, InfoKey)
    })

/**** entry move ****/

  EntryCmd.command('move <id>')
    .description('move an entry to a different container')
    .requiredOption('--to <targetId>', 'destination container item ID')
    .option('--at <index>',            'insertion index (default: append)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = SubCommand.optsWithGlobals()
      await cmdEntryMove(Config, Id, Options.to, Options.at)
    })

/**** entry delete ****/

  EntryCmd.command('delete <id>')
    .description('soft-delete: move entry to the trash')
    .action(async (Id:string, _Options, SubCommand) => {
      const Config:SDSConfig = SubCommand.optsWithGlobals()
      await cmdEntryDelete(Config, Id)
    })

/**** entry restore ****/

  EntryCmd.command('restore <id>')
    .description('restore a trashed entry (moves to root or --to target)')
    .option('--to <targetId>', 'destination container item ID (default: root)')
    .option('--at <index>',    'insertion index (default: append)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = SubCommand.optsWithGlobals()
      await cmdEntryRestore(Config, Id, Options.to, Options.at)
    })

/**** entry purge ****/

  EntryCmd.command('purge <id>')
    .description('permanently delete an entry (must be in the trash)')
    .action(async (Id:string, _Options, SubCommand) => {
      const Config:SDSConfig = SubCommand.optsWithGlobals()
      await cmdEntryPurge(Config, Id)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdEntryGet ****/

async function cmdEntryGet (
  Config:SDSConfig, RawId:string,
  Options:{ label?:boolean; mime?:boolean; value?:boolean; info?:boolean; target?:boolean },
  InfoKey:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }

    const ShowAll  = ! (Options.label || Options.mime || Options.value || Options.info || Options.target || (InfoKey != null))
    const Display:DisplayOptions = ShowAll ? 'all' : { ...Options, InfoKey }

    if (Config.Format === 'json') {
      printResult(Config, entryToJSON(Entry, Context.Store, Display))
    } else {
      printEntryText(Entry, Context.Store, Display)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdEntryMove ****/

async function cmdEntryMove (
  Config:SDSConfig, RawId:string, RawTarget:string, AtStr:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id       = resolveEntryId(RawId)
    const TargetId = resolveEntryId(RawTarget)
    const AtIndex  = AtStr != null ? parseInt(AtStr, 10) : undefined

    const Entry  = Context.Store.EntryWithId(Id)
    const Target = Context.Store.EntryWithId(TargetId) as SDS_Item | undefined

    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }
    if ((Target == null) || (! Target.isItem)) {
      throw new SDS_CommandError(
        `target '${TargetId}' not found or is not an item`, ExitCodes.NotFound
      )
    }
    if (! Entry.mayBeMovedTo(Target, AtIndex)) {
      throw new SDS_CommandError(
        `cannot move '${Id}' into '${TargetId}' — cycle or invalid target`,
        ExitCodes.Forbidden
      )
    }
    Entry.moveTo(Target, AtIndex)

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, movedTo:TargetId, at:AtIndex ?? 'end' })
    } else {
      printLine(`moved '${Id}' into '${TargetId}'`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdEntryDelete ****/

async function cmdEntryDelete (Config:SDSConfig, RawId:string):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }
    if (! Entry.mayBeDeleted) {
      throw new SDS_CommandError(
        `entry '${Id}' cannot be deleted (system entry)`, ExitCodes.Forbidden
      )
    }
    Entry.delete()

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, deleted:true })
    } else {
      printLine(`deleted '${Id}' (moved to trash)`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdEntryRestore ****/

async function cmdEntryRestore (
  Config:SDSConfig, RawId:string,
  RawTarget:string | undefined, AtStr:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id       = resolveEntryId(RawId)
    const TargetId = resolveEntryId(RawTarget ?? RootId)
    const AtIndex  = AtStr != null ? parseInt(AtStr, 10) : undefined

    const Entry  = Context.Store.EntryWithId(Id)
    const Target = Context.Store.EntryWithId(TargetId) as SDS_Item | undefined

    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }

    // restore is only valid for entries currently in the trash
    if (Entry.outerItemId !== TrashId) {
      throw new SDS_CommandError(
        `entry '${Id}' is not in the trash — use 'entry move' to relocate live entries`,
        ExitCodes.Forbidden
      )
    }

    if ((Target == null) || (! Target.isItem)) {
      throw new SDS_CommandError(
        `target '${TargetId}' not found or is not an item`, ExitCodes.NotFound
      )
    }
    Entry.moveTo(Target, AtIndex)

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, restoredTo:TargetId, at:AtIndex ?? 'end' })
    } else {
      printLine(`restored '${Id}' into '${TargetId}'`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdEntryPurge ****/

async function cmdEntryPurge (Config:SDSConfig, RawId:string):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }

    // ensure the entry is in the trash
    const OuterId = Entry.outerItemId
    if (OuterId !== TrashId) {
      throw new SDS_CommandError(
        `entry '${Id}' is not in the trash — delete it first`,
        ExitCodes.Forbidden
      )
    }

    Entry.purge()

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, purged:true })
    } else {
      printLine(`purged '${Id}'`)
    }
  } finally {
    await closeContext(Context)
  }
}

//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//

type DisplayOptions = 'all' | {
  label?:boolean; mime?:boolean; value?:boolean; info?:boolean; target?:boolean; InfoKey?:string
}

/**** entryToJSON ****/

function entryToJSON (
  Entry:SDS_Entry, Store:import('@rozek/sds-core').SDS_DataStore, Options:DisplayOptions
):Record<string,unknown> {
  const ShowAll = Options === 'all'
  const Result:Record<string,unknown> = { id:Entry.Id, kind:Entry.isItem ? 'item' : 'link' }

  if (ShowAll || (Options as any).label)  { Result['label'] = Entry.Label }
  if (Entry.isItem) {
    const Item = Entry as SDS_Item
    if (ShowAll || (Options as any).mime)  { Result['mime']  = Item.Type }
    if (ShowAll || (Options as any).value) { Result['value'] = Store._currentValueOf(Entry.Id) ?? null }
  }
  if (Entry.isLink) {
    const TargetId = Store._TargetOf(Entry.Id).Id
    if (ShowAll || (Options as any).target) { Result['target'] = TargetId }
  }
  const InfoKey = (Options as any).InfoKey as string | undefined
  if (InfoKey != null) {
    Result['info.'+InfoKey] = Store._InfoProxyOf(Entry.Id)[InfoKey] ?? null
  } else if (ShowAll || (Options as any).info) {
    Result['info'] = { ...Store._InfoProxyOf(Entry.Id) }
  }

  return Result
}

/**** printEntryText ****/

function printEntryText (
  Entry:SDS_Entry, Store:import('@rozek/sds-core').SDS_DataStore, Options:DisplayOptions
):void {
  const ShowAll = Options === 'all'
  printLine(`id:    ${Entry.Id}`)
  printLine(`kind:  ${Entry.isItem ? 'item' : 'link'}`)

  if (ShowAll || (Options as any).label) { printLine(`label: ${Entry.Label}`) }

  if (Entry.isItem) {
    const Item = Entry as SDS_Item
    if (ShowAll || (Options as any).mime) { printLine(`mime:  ${Item.Type}`) }
    if (ShowAll || (Options as any).value) {
      const Value = Store._currentValueOf(Entry.Id)
      printLine(`value: ${Value != null ? String(Value) : '(none)'}`)
    }
  }
  if (Entry.isLink) {
    const TargetId = Store._TargetOf(Entry.Id).Id
    if (ShowAll || (Options as any).target) { printLine(`target: ${TargetId}`) }
  }
  const InfoKey = (Options as any).InfoKey as string | undefined
  if (InfoKey != null) {
    const Value = Store._InfoProxyOf(Entry.Id)[InfoKey]
    printLine(`info.${InfoKey}: ${JSON.stringify(Value ?? null)}`)
  } else if (ShowAll || (Options as any).info) {
    const Info = Store._InfoProxyOf(Entry.Id)
    printLine(`info:  ${JSON.stringify(Info)}`)
  }
}
