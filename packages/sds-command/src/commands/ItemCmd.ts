/*******************************************************************************
*                                                                              *
*                                ItemCmd                                       *
*                                                                              *
*******************************************************************************/

// item-specific operations: list, get, create, update

import fs               from 'node:fs/promises'
import type { Command }   from 'commander'
import type { SDS_Item }  from '@rozek/sds-core'
import { RootId }         from '@rozek/sds-core'

import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printLine, formatItemLine, type ItemDisplayOptions } from '../Output.js'
import {
  SDS_CommandError, loadContext, closeContext, resolveEntryId,
} from '../StoreAccess.js'
import { extractInfoEntries, applyInfoToEntry } from '../InfoParser.js'
import { ExitCodes } from '../ExitCodes.js'

//----------------------------------------------------------------------------//
//                            registerItemCommands                            //
//----------------------------------------------------------------------------//

/**** registerItemCommands — attaches the `item` sub-tree to Program ****/

export function registerItemCommands (Program:Command, ExtraArgv:string[]):void {
  const ItemCmd = Program.command('item')
    .description('item-specific operations')

/**** item list ****/

  ItemCmd.command('list <id>')
    .description('list entries in a container item (only IDs by default)')
    .option('--recursive',        'traverse inner containers recursively')
    .option('--depth <n>',        'maximum recursion depth')
    .option('--only <kind>',      'filter by kind: items | links')
    .option('--label',            'include label')
    .option('--mime',             'include MIME type')
    .option('--value',            'include value')
    .option('--info',             'include info map')
    .option('--info.<key>',       'include only the named info entry, e.g. --info.author')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdItemList(Config, Id, Options, InfoKey)
    })

/**** item get ****/

  ItemCmd.command('get <id>')
    .description('display item details')
    .option('--label',    'include label')
    .option('--mime',     'include MIME type')
    .option('--value',    'include value')
    .option('--info',     'include info map')
    .option('--info.<key>', 'include only the named info entry, e.g. --info.author')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      const InfoKey          = Object.keys(InfoEntries)[0]
      await cmdItemGet(Config, Id, Options, InfoKey)
    })

/**** item create ****/

  ItemCmd.command('create')
    .description('create a new item')
    .option('--label <label>',     'item label')
    .option('--mime <type>',       'MIME type (default: text/plain)')
    .option('--container <itemId>','container item (default: root)')
    .option('--at <index>',        'insertion index (default: append)')
    .option('--value <string>',    'initial text value')
    .option('--file <path>',       'read initial value from file')
    .option('--info <json>',       'info map as JSON object')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      await cmdItemCreate(Config, Options, InfoEntries)
    })

/**** item update ****/

  ItemCmd.command('update <id>')
    .description('update item properties')
    .option('--label <label>',  'new label')
    .option('--mime <type>',    'new MIME type')
    .option('--value <string>', 'new text value')
    .option('--file <path>',    'read new value from file')
    .option('--info <json>',    'merge info map from JSON object')
    .action(async (Id:string, Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const { InfoEntries }  = extractInfoEntries(ExtraArgv)
      await cmdItemUpdate(Config, Id, Options, InfoEntries)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdItemList ****/

async function cmdItemList (
  Config:SDSConfig, RawId:string,
  Options:{ recursive?:boolean; depth?:string; only?:string; label?:boolean; mime?:boolean; value?:boolean; info?:boolean },
  InfoKey:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id   = resolveEntryId(RawId)
    const Item = Context.Store.EntryWithId(Id) as SDS_Item | undefined
    if ((Item == null) || (! Item.isItem)) {
      throw new SDS_CommandError(
        `item '${Id}' not found`, ExitCodes.NotFound
      )
    }

    const MaxDepth  = Options.depth != null ? parseInt(Options.depth, 10) : Infinity
    const OnlyKind  = Options.only?.toLowerCase()
    const DisplayOptions:ItemDisplayOptions = {
      showLabel: Options.label,
      showMIME:  Options.mime,
      showValue: Options.value,
      showInfo:  Options.info,
      InfoKey,
    }

    const Entries:unknown[] = []
    walkItems(Context.Store, Id, Options.recursive ?? false, MaxDepth, 0, OnlyKind, DisplayOptions, Entries, Config)

    if (Config.Format === 'json') {
      printResult(Config, Entries)
    } else {
      for (const Line of Entries as string[]) { printLine(Line) }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** walkItems — recursive DFS for item list ****/

function walkItems (
  Store:import('@rozek/sds-core').SDS_DataStore,
  ItemId:string,
  Recursive:boolean, MaxDepth:number, Depth:number,
  OnlyKind:string | undefined,
  Options:ItemDisplayOptions,
  Out:unknown[],
  Config:SDSConfig
):void {
  for (const Entry of Store._innerEntriesOf(ItemId)) {
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
      walkItems(Store, Entry.Id, Recursive, MaxDepth, Depth+1, OnlyKind, Options, Out, Config)
    }
  }
}

/**** cmdItemGet ****/

async function cmdItemGet (
  Config:SDSConfig, RawId:string,
  Options:{ label?:boolean; mime?:boolean; value?:boolean; info?:boolean },
  InfoKey:string | undefined
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id   = resolveEntryId(RawId)
    const Item = Context.Store.EntryWithId(Id) as SDS_Item | undefined
    if ((Item == null) || (! Item.isItem)) {
      throw new SDS_CommandError(`item '${Id}' not found`, ExitCodes.NotFound)
    }

    const ShowAll = ! (Options.label || Options.mime || Options.value || Options.info || (InfoKey != null))

    if (Config.Format === 'json') {
      const Obj:Record<string,unknown> = { id:Id, kind:'item' }
      if (ShowAll || Options.label) { Obj['label'] = Item.Label }
      if (ShowAll || Options.mime)  { Obj['mime']  = Item.Type }
      if (ShowAll || Options.value) { Obj['value'] = Context.Store._currentValueOf(Id) ?? null }
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
      printLine(`id:    ${Id}`)
      if (ShowAll || Options.label) { printLine(`label: ${Item.Label}`) }
      if (ShowAll || Options.mime)  { printLine(`mime:  ${Item.Type}`) }
      if (ShowAll || Options.value) {
        const Value = Context.Store._currentValueOf(Id)
        printLine(`value: ${Value != null ? String(Value) : '(none)'}`)
      }
      switch (true) {
        case (InfoKey != null): {
          const Value = Context.Store._InfoProxyOf(Id)[InfoKey!]
          printLine(`info.${InfoKey}: ${JSON.stringify(Value ?? null)}`)
          break
        }
        case (ShowAll || Options.info): {
          printLine(`info:  ${JSON.stringify(Context.Store._InfoProxyOf(Id))}`)
          break
        }
      }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdItemCreate ****/

async function cmdItemCreate (
  Config:SDSConfig,
  Options:{ label?:string; mime?:string; container?:string; at?:string; value?:string; file?:string; info?:string },
  InfoEntries:Record<string,unknown>
):Promise<void> {
  const Context = await loadContext(Config, true) // create store if it doesn't exist yet
  try {
    const ContainerId = resolveEntryId(Options.container ?? RootId)
    const Container   = Context.Store.EntryWithId(ContainerId) as SDS_Item | undefined
    if ((Container == null) || (! Container.isItem)) {
      throw new SDS_CommandError(
        `container '${ContainerId}' not found or is not an item`, ExitCodes.NotFound
      )
    }

    const AtIndex  = Options.at != null ? parseInt(Options.at, 10) : undefined
    const MIMEType = Options.mime ?? 'text/plain'
    const Item     = Context.Store.newItemAt(MIMEType, Container, AtIndex)

    if (Options.label != null) { Item.Label = Options.label }

    switch (true) {
      case (Options.file != null): {
        const FileData = await fs.readFile(Options.file!)
        const isBinary = ! MIMEType.startsWith('text/')
        Item.writeValue(isBinary ? new Uint8Array(FileData) : FileData.toString('utf8'))
        break
      }
      case (Options.value != null): {
        Item.writeValue(Options.value!)
        break
      }
    }

    applyInfoToEntry(Item.Info, Options.info ?? null, InfoEntries)

    if (Config.Format === 'json') {
      printResult(Config, { id:Item.Id, created:true })
    } else {
      printLine(Item.Id)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdItemUpdate ****/

async function cmdItemUpdate (
  Config:SDSConfig, RawId:string,
  Options:{ label?:string; mime?:string; value?:string; file?:string; info?:string },
  InfoEntries:Record<string,unknown>
):Promise<void> {
  const Context = await loadContext(Config)
  try {
    const Id   = resolveEntryId(RawId)
    const Item = Context.Store.EntryWithId(Id) as SDS_Item | undefined
    if ((Item == null) || (! Item.isItem)) {
      throw new SDS_CommandError(`item '${Id}' not found`, ExitCodes.NotFound)
    }

    if (Options.label != null) { Item.Label = Options.label }
    if (Options.mime  != null) { Item.Type  = Options.mime }

    switch (true) {
      case (Options.file != null): {
        const FileData = await fs.readFile(Options.file!)
        const isBinary = ! Item.Type.startsWith('text/')
        Item.writeValue(isBinary ? new Uint8Array(FileData) : FileData.toString('utf8'))
        break
      }
      case (Options.value != null): {
        Item.writeValue(Options.value!)
        break
      }
    }

    applyInfoToEntry(Item.Info, Options.info ?? null, InfoEntries)

    if (Config.Format === 'json') {
      printResult(Config, { id:Id, updated:true })
    } else {
      printLine(`updated '${Id}'`)
    }
  } finally {
    await closeContext(Context)
  }
}
