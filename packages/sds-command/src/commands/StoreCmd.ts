/*******************************************************************************
*                                                                              *
*                               StoreCmd                                       *
*                                                                              *
*******************************************************************************/

// store lifecycle commands: info, ping, sync, destroy, export, import

import fs              from 'node:fs/promises'
import type { Command } from 'commander'

import type { SDS_DataStore }              from '@rozek/sds-core'
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core'

import { resolveConfig, DBPathFor, type SDSConfig }  from '../Config.js'
import { printResult, printLine } from '../Output.js'
import {
  SDS_CommandError, loadContext, closeContext,
  runSync, StoreExists, destroyStore, parseIntOption, readFileSafely,
  createStoreFromBinary,
} from '../StoreAccess.js'
import { ExitCodes } from '../ExitCodes.js'

//----------------------------------------------------------------------------//
//                           registerStoreCommands                            //
//----------------------------------------------------------------------------//

/**** registerStoreCommands — attaches the `store` sub-tree to Program ****/

export function registerStoreCommands (Program:Command):void {
  const StoreCmd = Program.command('store')
    .description('store lifecycle operations')

/**** store info ****/

  StoreCmd.command('info')
    .description('show local store metadata (existence, entry count, DB path)')
    .action(async (_Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdStoreInfo(Config)
    })

/**** store ping ****/

  StoreCmd.command('ping')
    .description('check connectivity to the WebSocket server')
    .action(async (_Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdStorePing(Config)
    })

/**** store sync ****/

  StoreCmd.command('sync')
    .description('connect to server, exchange CRDT patches, and disconnect')
    .option('--timeout <ms>', 'milliseconds to wait after connecting', '5000')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const TimeoutMs = parseIntOption(Options.timeout, '--timeout')
      if (TimeoutMs <= 0) {
        throw new SDS_CommandError(
          `'--timeout' must be a positive integer — got ${TimeoutMs}`,
          ExitCodes.UsageError
        )
      }
      await cmdStoreSync(Config, TimeoutMs)
    })

/**** store destroy ****/

  StoreCmd.command('destroy')
    .description('permanently delete the local store database')
    .action(async (_Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdStoreDestroy(Config)
    })

/**** store export ****/

  StoreCmd.command('export')
    .description('export the current store snapshot')
    .option('--encoding <enc>', 'serialisation encoding: json | binary', 'json')
    .option('--output <file>',  'destination file (default: stdout)')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdStoreExport(Config, Options.encoding, Options.output)
    })

/**** store import ****/

  StoreCmd.command('import')
    .description('CRDT-merge a snapshot file into the local store')
    .requiredOption('--input <file>', 'source file to import')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      await cmdStoreImport(Config, Options.input)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdStoreInfo ****/

async function cmdStoreInfo (Config:SDSConfig):Promise<void> {
  const StoreId = Config.StoreId
  if (StoreId == null) {
    throw new SDS_CommandError(
      'no store ID — set SDS_STORE_ID or use --store', ExitCodes.UsageError
    )
  }

  const Exists = await StoreExists(Config)
  if (! Exists) {
    if (Config.Format === 'json') {
      printResult(Config, { storeId:StoreId, exists:false })
    } else {
      printLine(`store '${StoreId}': not found in '${Config.PersistenceDir}'`)
    }
    return
  }

  const Context = await loadContext(Config)
  try {
    const EntryCount = countEntries(Context.Store)
    if (Config.Format === 'json') {
      printResult(Config, {
        storeId:    StoreId,
        exists:     true,
        entryCount: EntryCount,
        dbPath:     DBPathFor(Config, StoreId),
      })
    } else {
      printLine(`store:       ${StoreId}`)
      printLine(`entries:     ${EntryCount}`)
      printLine(`db path:     ${DBPathFor(Config, StoreId)}`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdStorePing ****/

async function cmdStorePing (Config:SDSConfig):Promise<void> {
  const ServerURL = Config.ServerURL
  const Token     = Config.Token
  if (ServerURL == null) {
    throw new SDS_CommandError(
      'no server URL — set SDS_SERVER_URL or use --server', ExitCodes.UsageError
    )
  }
  if (Token == null) {
    throw new SDS_CommandError(
      'no client token — set SDS_TOKEN or use --token', ExitCodes.UsageError
    )
  }

  // use runSync with a very short timeout just to check connectivity
  try {
    const Result = await runSync(Config, 1000)
    if (Config.Format === 'json') {
      printResult(Config, { server:Result.ServerURL, storeId:Result.StoreId, reachable:true })
    } else {
      printLine(`server '${Result.ServerURL}': reachable`)
    }
  } catch (Signal) {
    if ((Signal instanceof SDS_CommandError) && (Signal.ExitCode === ExitCodes.NetworkError)) {
      if (Config.Format === 'json') {
        printResult(Config, { server:ServerURL, reachable:false, error:Signal.message })
      } else {
        printLine(`server '${ServerURL}': unreachable — ${Signal.message}`)
      }
    } else {
      throw Signal
    }
  }
}

/**** cmdStoreSync ****/

async function cmdStoreSync (Config:SDSConfig, TimeoutMs:number):Promise<void> {
  const Result = await runSync(Config, TimeoutMs)
  if (Config.Format === 'json') {
    printResult(Config, {
      storeId:   Result.StoreId,
      server:    Result.ServerURL,
      connected: Result.Connected,
      synced:    Result.Connected,
    })
  } else {
    const Status = Result.Connected ? 'synced' : 'could not connect'
    printLine(`store '${Result.StoreId}': ${Status}`)
  }
}

/**** cmdStoreDestroy ****/

async function cmdStoreDestroy (Config:SDSConfig):Promise<void> {
  await destroyStore(Config)
  if (Config.Format === 'json') {
    printResult(Config, { storeId:Config.StoreId, destroyed:true })
  } else {
    printLine(`store '${Config.StoreId}': deleted`)
  }
}

/**** cmdStoreExport ****/

async function cmdStoreExport (
  Config:SDSConfig, Format:string, OutputFile:string | undefined
):Promise<void> {
  const NormalizedFormat = Format.toLowerCase()
  if ((NormalizedFormat !== 'json') && (NormalizedFormat !== 'binary')) {
    throw new SDS_CommandError(
      `'--encoding' accepts 'json' or 'binary' — got '${Format}'`,
      ExitCodes.UsageError
    )
  }

  const Context = await loadContext(Config)
  try {
    const isBinary = NormalizedFormat === 'binary'
    const Data     = isBinary ? Context.Store.asBinary() : JSON.stringify(Context.Store.asJSON(), null, 2)

    if (OutputFile != null) {
      await fs.writeFile(OutputFile, isBinary ? (Data as Uint8Array) : (Data as string)+'\n')
      if (Config.Format === 'json') {
        printResult(Config, { exported:true, file:OutputFile, format:NormalizedFormat })
      } else {
        printLine(`exported to '${OutputFile}'`)
      }
    } else {
      // stdout
      if (isBinary) {
        process.stdout.write(Data as Uint8Array)
      } else {
        process.stdout.write((Data as string) + '\n')
      }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** cmdStoreImport ****/

async function cmdStoreImport (Config:SDSConfig, InputFile:string):Promise<void> {
  const rawData = await readFileSafely(InputFile)

  // detect encoding: JSON starts with '{' or '[' after optional BOM/whitespace
  const Text   = rawData.toString('utf8').trimStart()
  const isJSON = Text.startsWith('{') || Text.startsWith('[')

  // allow creation so we can import into a new store
  const Context = await loadContext(Config, true)
  try {
    if (isJSON) {
      let Parsed:unknown
      try {
        Parsed = JSON.parse(Text)
      } catch {
        throw new SDS_CommandError(
          `'${InputFile}' does not contain valid JSON`,
          ExitCodes.UsageError
        )
      }
      mergeEntriesFromJSON(Context.Store as unknown as SDS_DataStore, Parsed)
    } else {
      // binary: gzip'd CRDT model — reconstruct a temp store and copy user entries
      const TmpStore = createStoreFromBinary(new Uint8Array(rawData))
      try {
        mergeEntriesFromJSON(Context.Store as unknown as SDS_DataStore, TmpStore.asJSON())
      } finally {
        TmpStore.dispose()
      }
    }
    if (Config.Format === 'json') {
      printResult(Config, { imported:true, file:InputFile })
    } else {
      printLine(`imported '${InputFile}'`)
    }
  } finally {
    await closeContext(Context)
  }
}

/**** mergeEntriesFromJSON — copy non-system inner entries from a root JSON export ****/

function mergeEntriesFromJSON (
  Store:SDS_DataStore, RootJSON:unknown
):void {
  const Root = RootJSON as Record<string,unknown>
  const SystemIds = new Set([ RootId, TrashId, LostAndFoundId ])
  const InnerEntries = Root['innerEntries'] as Array<Record<string,unknown>> | undefined
  if (InnerEntries == null) { return }

  for (const Entry of InnerEntries) {
    if (! SystemIds.has(Entry['Id'] as string)) {
      Store.newEntryFromJSONat(Entry, Store.RootItem)
    }
  }
}

//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//

/**** countEntries — recursive count of all non-system items in the tree ****/

function countEntries (Store:SDS_DataStore):number {
  const SystemIds = new Set([ RootId, TrashId, LostAndFoundId ])
  let Count = 0

  function traverseEntries (ItemId:string):void {
    for (const Entry of Store._innerEntriesOf(ItemId)) {
      if (SystemIds.has(Entry.Id)) { continue }   // skip system containers entirely — no count, no recursion
      Count++
      if (Entry.isItem) { traverseEntries(Entry.Id) }
    }
  }

  traverseEntries(RootId)
  return Count
}
