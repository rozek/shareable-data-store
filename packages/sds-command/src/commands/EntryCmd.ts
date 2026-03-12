/*******************************************************************************
*                                                                              *
*                               EntryCmd                                       *
*                                                                              *
*******************************************************************************/

// entry operations: create, get, list, update, move, delete, restore, purge

import type { Command }    from 'commander'
import type { SDS_Entry }  from '@rozek/sds-core'
import type { SDS_Item }   from '@rozek/sds-core'
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core'

import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printLine, formatItemLine, type ItemDisplayOptions } from '../Output.js'
import {
  SDS_CommandError, loadContext, closeContext, resolveEntryId,
  parseIntOption, readFileSafely,
} from '../StoreAccess.js'
import { ExitCodes } from '../ExitCodes.js'
import { extractInfoEntries, applyInfoToEntry } from '../InfoParser.js'

//----------------------------------------------------------------------------//
//                           registerEntryCommands                            //
//----------------------------------------------------------------------------//

/**** registerEntryCommands — attaches the `entry` sub-tree to Program ****/

export function registerEntryCommands (Program:Command, ExtraArgv:string[]):void {
  const EntryCmd = Program.command('entry')
    .description('operations on entries (items and links)')

/**** entry create ****/

  EntryCmd.command('create')
    .description('create a new item (default) or link (with --target)')
    .option('--target <itemId>',    'link target — creates a link instead of an item')
    .option('--container <itemId>', 'container item (default: root)')
    .option('--at <index>',         'insertion index (default: append)')
    .option('--label <label>',      'initial label')
    .option('--mime <type>',        'MIME type (default: text/plain, items only)')
    .option('--value <string>',     'initial text value (items only)')
    .option('--file <path>',        'read initial value from file (items only)')
    .option('--info <json>',          'initial info map as JSON object')
    .option('--info.<key>',           'set a single info entry, e.g. --info.author')
    .option('--info-delete.<key>',    'remove a single info entry, e.g. --info-delete.author')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig                = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries, InfoDeleteKeys } = extractInfoEntries(ExtraArgv)
      await cmdEntryCreate(Config, Options, InfoEntries, InfoDeleteKeys)
    })

/**** entry get ****/

  EntryCmd.command('get <id>')
    .description('display all or selected fields of an entry')
    .option('--kind',           'include entry kind (item or link)')
    .option('--label',          'include label')
    .option('--mime',           'include MIME type (items only)')
    .option('--value',          'include value (items only)')
    .option('--info',           'include full info map')
    .option('--info.<key>',     'include only the named info entry, e.g. --info.author')
    .option('--target',         'include link target ID (links only)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdEntryGet(Config, Id, Options, InfoKey)
    })

/**** entry list ****/

  EntryCmd.command('list <id>')
    .description('list entries in a container item (only IDs by default)')
    .option('--recursive',        'traverse inner containers recursively')
    .option('--depth <n>',        'maximum recursion depth')
    .option('--only <kind>',      'filter by kind: items | links')
    .option('--label',            'include label')
    .option('--mime',             'include MIME type (items only)')
    .option('--value',            'include value (items only)')
    .option('--info',             'include info map')
    .option('--info.<key>',       'include only the named info entry, e.g. --info.author')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdEntryList(Config, Id, Options, InfoKey)
    })

/**** entry update ****/

  EntryCmd.command('update <id>')
    .description('update entry properties (works on both items and links)')
    .option('--label <label>',  'new label (items and links)')
    .option('--mime <type>',    'new MIME type (items only)')
    .option('--value <string>', 'new text value (items only)')
    .option('--file <path>',    'read new value from file (items only)')
    .option('--info <json>',    'merge info map from JSON object')
    .option('--info.<key>',         'set a single info entry, e.g. --info.author')
    .option('--info-delete.<key>',  'remove a single info entry, e.g. --info-delete.author')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig                = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries, InfoDeleteKeys } = extractInfoEntries(ExtraArgv)
      await cmdEntryUpdate(Config, Id, Options, InfoEntries, InfoDeleteKeys)
    })

/**** entry move ****/

  EntryCmd.command('move <id>')
    .description('move an entry to a different container')
    .requiredOption('--to <targetId>', 'destination container item ID')
    .option('--at <index>',            'insertion index (default: append)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdEntryMove(Config, Id, Options.to, Options.at)
    })

/**** entry delete ****/

  EntryCmd.command('delete <id>')
    .description('soft-delete: move entry to the trash')
    .action(async (Id:string, _Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdEntryDelete(Config, Id)
    })

/**** entry restore ****/

  EntryCmd.command('restore <id>')
    .description('restore a trashed entry (moves to root or --to target)')
    .option('--to <targetId>', 'destination container item ID (default: root)')
    .option('--at <index>',    'insertion index (default: append)')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdEntryRestore(Config, Id, Options.to, Options.at)
    })

/**** entry purge ****/

  EntryCmd.command('purge <id>')
    .description('permanently delete an entry (must be in the trash)')
    .action(async (Id:string, _Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdEntryPurge(Config, Id)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdEntryCreate ****/

async function cmdEntryCreate (
  Config:SDSConfig,
  Options:{
    target?:string; container?:string; at?:string;
    label?:string; mime?:string; value?:string; file?:string; info?:string
  },
  InfoEntries:Record<string,unknown>,
  InfoDeleteKeys:string[]
):Promise<void> {
  // mutual exclusion: --value and --file cannot both be specified
  if ((Options.value != null) && (Options.file != null)) {
    throw new SDS_CommandError(
      `'--value' and '--file' are mutually exclusive — specify at most one`,
      ExitCodes.UsageError
    )
  }

  if (Options.target != null) {

    // validate: item-only options cannot be combined with --target
    if (Options.mime != null) {
      throw new SDS_CommandError(
        `'--mime' is not supported when creating a link — only items have a MIME type`,
        ExitCodes.UsageError
      )
    }
    if (Options.value != null) {
      throw new SDS_CommandError(
        `'--value' is not supported when creating a link — only items have a value`,
        ExitCodes.UsageError
      )
    }
    if (Options.file != null) {
      throw new SDS_CommandError(
        `'--file' is not supported when creating a link — only items have a value`,
        ExitCodes.UsageError
      )
    }

    // create LINK — store must already exist (target must be reachable)
    const Context = await loadContext(Config)
    try {
      const TargetId    = resolveEntryId(Options.target)
      const ContainerId = resolveEntryId(Options.container ?? RootId)
      const AtIndex     = Options.at != null ? parseIntOption(Options.at, '--at') : undefined
      if ((AtIndex != null) && (AtIndex < 0)) {
        throw new SDS_CommandError(
          `'--at' must be a non-negative integer — got ${AtIndex}`, ExitCodes.UsageError
        )
      }

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

      if (Options.label != null) { Link.Label = Options.label }
      applyInfoToEntry(
        Context.Store._InfoProxyOf(Link.Id) as Record<string,unknown>,
        Options.info ?? null,
        InfoEntries, InfoDeleteKeys
      )

      if (Config.Format === 'json') {
        printResult(Config, { id:Link.Id, created:true, kind:'link', target:TargetId })
      } else {
        printLine(Link.Id)
      }
    } finally {
      await closeContext(Context)
    }

  } else {

    // create ITEM — auto-creates store if needed
    const Context = await loadContext(Config, true)
    try {
      const ContainerId = resolveEntryId(Options.container ?? RootId)
      const Container   = Context.Store.EntryWithId(ContainerId) as SDS_Item | undefined
      if ((Container == null) || (! Container.isItem)) {
        throw new SDS_CommandError(
          `container '${ContainerId}' not found or is not an item`, ExitCodes.NotFound
        )
      }

      const AtIndex  = Options.at != null ? parseIntOption(Options.at, '--at') : undefined
      if ((AtIndex != null) && (AtIndex < 0)) {
        throw new SDS_CommandError(
          `'--at' must be a non-negative integer — got ${AtIndex}`, ExitCodes.UsageError
        )
      }
      const MIMEType = Options.mime ?? 'text/plain'
      const Item     = Context.Store.newItemAt(MIMEType, Container, AtIndex)

      if (Options.label != null) { Item.Label = Options.label }

      switch (true) {
        case (Options.file != null): {
          const FileData = await readFileSafely(Options.file!)
          const isBinary = ! MIMEType.startsWith('text/')
          Item.writeValue(isBinary ? new Uint8Array(FileData) : FileData.toString('utf8'))
          break
        }
        case (Options.value != null): {
          Item.writeValue(Options.value!)
          break
        }
      }

      applyInfoToEntry(Item.Info, Options.info ?? null, InfoEntries, InfoDeleteKeys)

      if (Config.Format === 'json') {
        printResult(Config, { id:Item.Id, created:true, kind:'item' })
      } else {
        printLine(Item.Id)
      }
    } finally {
      await closeContext(Context)
    }
  }
}

/**** cmdEntryGet ****/

async function cmdEntryGet (
  Config:SDSConfig, RawId:string,
  Options:{
    kind?:boolean; label?:boolean; mime?:boolean;
    value?:boolean; info?:boolean; target?:boolean
  },
  InfoKey:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }

    const ShowAll = ! (
      Options.kind || Options.label || Options.mime ||
      Options.value || Options.info || Options.target || (InfoKey != null)
    )
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

/**** cmdEntryList ****/

async function cmdEntryList (
  Config:SDSConfig, RawId:string,
  Options:{ recursive?:boolean; depth?:string; only?:string; label?:boolean; mime?:boolean; value?:boolean; info?:boolean },
  InfoKey:string | undefined
):Promise<void> {
  const OnlyKind = Options.only?.toLowerCase()
  if ((OnlyKind != null) && (! ['item', 'items', 'link', 'links'].includes(OnlyKind))) {
    throw new SDS_CommandError(
      `'--only' accepts 'items' or 'links' — got '${Options.only}'`,
      ExitCodes.UsageError
    )
  }

  const Context = await loadContext(Config)
  try {
    const Id   = resolveEntryId(RawId)
    const Item = Context.Store.EntryWithId(Id) as SDS_Item | undefined
    if ((Item == null) || (! Item.isItem)) {
      throw new SDS_CommandError(
        `container '${Id}' not found or is not an item`, ExitCodes.NotFound
      )
    }

    const MaxDepth = Options.depth != null ? parseIntOption(Options.depth, '--depth') : Infinity
    const DisplayOptions:ItemDisplayOptions = {
      showLabel: Options.label,
      showMIME:  Options.mime,
      showValue: Options.value,
      showInfo:  Options.info,
      InfoKey,
    }

    const Entries:unknown[] = []
    walkEntries(Context.Store, Id, Options.recursive ?? false, MaxDepth, 0, OnlyKind, DisplayOptions, Entries, Config)

    if (Config.Format === 'json') {
      printResult(Config, Entries)
    } else {
      for (const Line of Entries as string[]) { printLine(Line) }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** walkEntries — recursive DFS for entry list ****/

const SystemListIds = new Set([ TrashId, LostAndFoundId ])

function walkEntries (
  Store:import('@rozek/sds-core').SDS_DataStore,
  ItemId:string,
  Recursive:boolean, MaxDepth:number, Depth:number,
  OnlyKind:string | undefined,
  Options:ItemDisplayOptions,
  Out:unknown[],
  Config:SDSConfig
):void {
  for (const Entry of Store._innerEntriesOf(ItemId)) {
    if (SystemListIds.has(Entry.Id)) { continue }  // hide system containers from listing
    const Kind = Entry.isItem ? 'item' : 'link'
    if ((OnlyKind == null) || (OnlyKind === Kind+'s') || (OnlyKind === Kind)) {
      if (Config.Format === 'json') {
        const Obj:Record<string,unknown> = { id:Entry.Id, kind:Kind }
        if (Options.showLabel) { Obj['label'] = Entry.Label }
        if (Entry.isItem) {
          if (Options.showMIME)  { Obj['mime']  = Store._TypeOf(Entry.Id) }
          if (Options.showValue) { Obj['value'] = Store._currentValueOf(Entry.Id) ?? null }
        }
        switch (true) {
          case (Options.InfoKey != null): {
            Obj['info.'+Options.InfoKey!] = Store._InfoProxyOf(Entry.Id)[Options.InfoKey!] ?? null
            break
          }
          case (Options.showInfo): {
            Obj['info'] = { ...Store._InfoProxyOf(Entry.Id) }
            break
          }
        }
        Out.push(Obj)
      } else {
        Out.push(formatItemLine(
          Entry.Id,
          Options.showLabel ? Entry.Label : '',
          (Options.showMIME && Entry.isItem) ? Store._TypeOf(Entry.Id) : '',
          (Options.showValue && Entry.isItem) ? Store._currentValueOf(Entry.Id) : undefined,
          (Options.showInfo || (Options.InfoKey != null)) ? Store._InfoProxyOf(Entry.Id) as Record<string,unknown> : {},
          Options
        ))
      }
    }
    if (Recursive && Entry.isItem && (Depth < MaxDepth)) {
      walkEntries(Store, Entry.Id, Recursive, MaxDepth, Depth+1, OnlyKind, Options, Out, Config)
    }
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
    const AtIndex  = AtStr != null ? parseIntOption(AtStr, '--at') : undefined
    if ((AtIndex != null) && (AtIndex < 0)) {
      throw new SDS_CommandError(
        `'--at' must be a non-negative integer — got ${AtIndex}`, ExitCodes.UsageError
      )
    }

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
    const AtIndex  = AtStr != null ? parseIntOption(AtStr, '--at') : undefined
    if ((AtIndex != null) && (AtIndex < 0)) {
      throw new SDS_CommandError(
        `'--at' must be a non-negative integer — got ${AtIndex}`, ExitCodes.UsageError
      )
    }

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

/**** cmdEntryUpdate ****/

async function cmdEntryUpdate (
  Config:SDSConfig, RawId:string,
  Options:{ label?:string; mime?:string; value?:string; file?:string; info?:string },
  InfoEntries:Record<string,unknown>,
  InfoDeleteKeys:string[]
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id    = resolveEntryId(RawId)
    const Entry = Context.Store.EntryWithId(Id)
    if (Entry == null) {
      throw new SDS_CommandError(`entry '${Id}' not found`, ExitCodes.NotFound)
    }

    // item-only fields: give a meaningful error when used on a link
    if (Entry.isLink) {
      if (Options.mime != null) {
        throw new SDS_CommandError(
          `'--mime' is not supported for links — only items have a MIME type`,
          ExitCodes.UsageError
        )
      }
      if (Options.value != null) {
        throw new SDS_CommandError(
          `'--value' is not supported for links — only items have a value`,
          ExitCodes.UsageError
        )
      }
      if (Options.file != null) {
        throw new SDS_CommandError(
          `'--file' is not supported for links — only items have a value`,
          ExitCodes.UsageError
        )
      }
    }

    if (Options.label != null) { (Entry as SDS_Item).Label = Options.label }

    if (Entry.isItem) {
      // mutual exclusion: --value and --file cannot both be specified
      if ((Options.value != null) && (Options.file != null)) {
        throw new SDS_CommandError(
          `'--value' and '--file' are mutually exclusive — specify at most one`,
          ExitCodes.UsageError
        )
      }

      const Item = Entry as SDS_Item
      if (Options.mime != null) { Item.Type = Options.mime }
      switch (true) {
        case (Options.file != null): {
          const FileData = await readFileSafely(Options.file!)
          const isBinary = ! Item.Type.startsWith('text/')
          Item.writeValue(isBinary ? new Uint8Array(FileData) : FileData.toString('utf8'))
          break
        }
        case (Options.value != null): {
          Item.writeValue(Options.value!)
          break
        }
      }
    }

    applyInfoToEntry(
      Context.Store._InfoProxyOf(Id) as Record<string,unknown>,
      Options.info ?? null,
      InfoEntries, InfoDeleteKeys
    )

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, updated:true })
    } else {
      printLine(`updated '${Id}'`)
    }
  } finally {
    await closeContext(Context)
  }
}

//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//

type DisplayOptions = 'all' | {
  kind?:boolean; label?:boolean; mime?:boolean; value?:boolean;
  info?:boolean; target?:boolean; InfoKey?:string
}

/**** entryToJSON ****/

function entryToJSON (
  Entry:SDS_Entry, Store:import('@rozek/sds-core').SDS_DataStore, Options:DisplayOptions
):Record<string,unknown> {
  const ShowAll = Options === 'all'
  const Result:Record<string,unknown> = { id:Entry.Id }

  if (ShowAll || (Options as any).kind)   { Result['kind']  = Entry.isItem ? 'item' : 'link' }
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
  switch (true) {
    case (InfoKey != null): {
      Result['info.'+InfoKey!] = Store._InfoProxyOf(Entry.Id)[InfoKey!] ?? null
      break
    }
    case (ShowAll || (Options as any).info): {
      Result['info'] = { ...Store._InfoProxyOf(Entry.Id) }
      break
    }
  }

  return Result
}

/**** printEntryText ****/

function printEntryText (
  Entry:SDS_Entry, Store:import('@rozek/sds-core').SDS_DataStore, Options:DisplayOptions
):void {
  const ShowAll = Options === 'all'
  printLine(`id:    ${Entry.Id}`)
  if (ShowAll || (Options as any).kind) {
    printLine(`kind:  ${Entry.isItem ? 'item' : 'link'}`)
  }

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
  switch (true) {
    case (InfoKey != null): {
      const Value = Store._InfoProxyOf(Entry.Id)[InfoKey!]
      printLine(`info.${InfoKey}: ${JSON.stringify(Value ?? null)}`)
      break
    }
    case (ShowAll || (Options as any).info): {
      const Info = Store._InfoProxyOf(Entry.Id)
      printLine(`info:  ${JSON.stringify(Info)}`)
      break
    }
  }
}
