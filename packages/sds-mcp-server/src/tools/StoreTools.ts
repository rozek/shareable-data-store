/*******************************************************************************
*                                                                              *
*                               StoreTools                                     *
*                                                                              *
*******************************************************************************/

// MCP tool definitions and handlers for store lifecycle operations:
// sds_store_info, sds_store_ping, sds_store_sync, sds_store_destroy,
// sds_store_export, sds_store_import

import fs from 'node:fs/promises'

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

import type { SDS_DataStore }              from '@rozek/sds-core'
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core'

import { configFrom, DBPathFor } from '../Config.js'
import { MCP_ToolError }         from '../Errors.js'
import {
  loadContext, closeContext, runSync,
  StoreExists, destroyStore, readFileSafely, countEntries,
  createStoreFromBinary,
  type BatchSession,
} from '../StoreAccess.js'

//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//

export const StoreToolDefs:Tool[] = [

/**** sds_store_info ****/

  {
    name:        'sds_store_info',
    description: 'show existence, entry count, and DB path of a local store',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string', description:'store identifier' },
        PersistenceDir: { type:'string', description:'local database directory (default: ~/.sds)' },
      },
      required: [ 'StoreId' ],
    },
  },

/**** sds_store_ping ****/

  {
    name:        'sds_store_ping',
    description: 'check connectivity to the WebSocket server',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId:   { type:'string', description:'store identifier' },
        ServerURL: { type:'string', description:'WebSocket server base URL' },
        Token:     { type:'string', description:'client JWT with read or write scope' },
      },
      required: [ 'StoreId', 'ServerURL', 'Token' ],
    },
  },

/**** sds_store_sync ****/

  {
    name:        'sds_store_sync',
    description: 'connect to the server, exchange CRDT patches, and disconnect',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId:   { type:'string',  description:'store identifier' },
        ServerURL: { type:'string',  description:'WebSocket server base URL' },
        Token:     { type:'string',  description:'client JWT with read or write scope' },
        PersistenceDir:   { type:'string',  description:'local database directory (default: ~/.sds)' },
        TimeoutMs: { type:'integer', description:'max wait in ms after connecting (default: 5000)' },
      },
      required: [ 'StoreId', 'ServerURL', 'Token' ],
    },
  },

/**** sds_store_destroy ****/

  {
    name:        'sds_store_destroy',
    description: 'permanently delete the local SQLite store file and its WAL/SHM companions',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string', description:'store identifier' },
        PersistenceDir: { type:'string', description:'local database directory (default: ~/.sds)' },
      },
      required: [ 'StoreId' ],
    },
  },

/**** sds_store_export ****/

  {
    name:        'sds_store_export',
    description: (
      'export the current store snapshot; binary without OutputFile returns inline DataBase64'
    ),
    inputSchema: {
      type: 'object',
      properties: {
        StoreId:    { type:'string', description:'store identifier' },
        PersistenceDir:    { type:'string', description:'local database directory (default: ~/.sds)' },
        Encoding:   { type:'string', enum:['json','binary'], description:'serialisation format (default: json)' },
        OutputFile: { type:'string', description:'destination file path; omit to return data in response' },
      },
      required: [ 'StoreId' ],
    },
  },

/**** sds_store_import ****/

  {
    name:        'sds_store_import',
    description: 'CRDT-merge a snapshot (JSON or binary) into the local store',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId:       { type:'string', description:'store identifier' },
        PersistenceDir:       { type:'string', description:'local database directory (default: ~/.sds)' },
        InputFile:     { type:'string', description:'source file path — mutually exclusive with InputBase64' },
        InputBase64:   { type:'string', description:'base64-encoded snapshot — mutually exclusive with InputFile' },
        InputEncoding: { type:'string', enum:['json','binary'], description:'encoding of InputBase64 — required when InputBase64 is used' },
      },
      required: [ 'StoreId' ],
    },
  },

]

//----------------------------------------------------------------------------//
//                           standalone handlers                              //
//----------------------------------------------------------------------------//

export type StoreToolHandler = (Params:Record<string,unknown>) => Promise<unknown>

export const StoreToolHandlers:Record<string,StoreToolHandler> = {
  'sds_store_info':    async (Params) => toolStoreInfo(configFrom(Params)),
  'sds_store_ping':    async (Params) => toolStorePing(configFrom(Params)),
  'sds_store_sync':    async (Params) => {
    const Config    = configFrom(Params)
    const TimeoutMs = (Params['TimeoutMs'] as number | undefined) ?? 5000
    if ((typeof TimeoutMs !== 'number') || (TimeoutMs <= 0) || (! Number.isInteger(TimeoutMs))) {
      throw new MCP_ToolError(`'TimeoutMs' must be a positive integer — got ${TimeoutMs}`)
    }
    return toolStoreSync(Config, TimeoutMs)
  },
  'sds_store_destroy': async (Params) => toolStoreDestroy(configFrom(Params)),
  'sds_store_export':  async (Params) => {
    const Config    = configFrom(Params)
    const Encoding  = ((Params['Encoding'] as string | undefined) ?? 'json').toLowerCase()
    const OutputFile = Params['OutputFile'] as string | undefined
    if ((Encoding !== 'json') && (Encoding !== 'binary')) {
      throw new MCP_ToolError(`'Encoding' must be 'json' or 'binary' — got '${Params['Encoding']}'`)
    }
    return toolStoreExport(Config, Encoding as 'json'|'binary', OutputFile)
  },
  'sds_store_import':  async (Params) => {
    const Config = configFrom(Params)
    validateImportParams(Params)
    return toolStoreImport(
      Config,
      Params['InputFile']     as string | undefined,
      Params['InputBase64']   as string | undefined,
      ((Params['InputEncoding'] as string | undefined) ?? 'json').toLowerCase() as 'json'|'binary',
    )
  },
}

//----------------------------------------------------------------------------//
//                            batch step handlers                             //
//----------------------------------------------------------------------------//

export type StoreBatchStepFn = (Session:BatchSession, Params:Record<string,unknown>) => Promise<unknown>

export const StoreBatchStepHandlers:Record<string,StoreBatchStepFn> = {

  'sds_store_info': async (Session, _Params) => {
    return {
      StoreId:    Session.StoreId,
      exists:     true,
      EntryCount: countEntries(Session.Store),
      DBPath:     DBPathFor({ PersistenceDir:Session.PersistenceDir }, Session.StoreId),
    }
  },

  'sds_store_sync': async (Session, Params) => {
    const ServerURL = Params['ServerURL'] as string | undefined
    const Token     = Params['Token']     as string | undefined
    const TimeoutMs = (Params['TimeoutMs'] as number | undefined) ?? 5000
    if (ServerURL == null) { throw new MCP_ToolError('ServerURL is required') }
    if (Token     == null) { throw new MCP_ToolError('Token is required') }
    if (! /^wss?:\/\//.test(ServerURL)) {
      throw new MCP_ToolError(
        `invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`
      )
    }
    if ((typeof TimeoutMs !== 'number') || (TimeoutMs <= 0) || (! Number.isInteger(TimeoutMs))) {
      throw new MCP_ToolError(`'TimeoutMs' must be a positive integer — got ${TimeoutMs}`)
    }
    await Session.syncWith(ServerURL, Token, TimeoutMs)
    return { StoreId:Session.StoreId, Server:ServerURL, synced:true }
  },

  'sds_store_export': async (Session, Params) => {
    const Encoding   = ((Params['Encoding'] as string | undefined) ?? 'json').toLowerCase()
    const OutputFile = Params['OutputFile'] as string | undefined
    if ((Encoding !== 'json') && (Encoding !== 'binary')) {
      throw new MCP_ToolError(`'Encoding' must be 'json' or 'binary' — got '${Params['Encoding']}'`)
    }
    return coreStoreExport(Session.Store, Encoding as 'json'|'binary', OutputFile)
  },

  'sds_store_import': async (Session, Params) => {
    validateImportParams(Params)
    return coreStoreImport(
      Session.Store,
      Params['InputFile']     as string | undefined,
      Params['InputBase64']   as string | undefined,
      ((Params['InputEncoding'] as string | undefined) ?? 'json').toLowerCase() as 'json'|'binary',
    )
  },
}

//----------------------------------------------------------------------------//
//                           core implementations                             //
//----------------------------------------------------------------------------//

/**** toolStoreInfo ****/

async function toolStoreInfo (Config:ReturnType<typeof configFrom>):Promise<object> {
  const StoreId = Config.StoreId
  if (StoreId == null) { throw new MCP_ToolError('StoreId is required') }

  const Exists = await StoreExists(Config)
  if (! Exists) { return { StoreId, exists:false } }

  const Context = await loadContext(Config)
  try {
    return {
      StoreId,
      exists:     true,
      EntryCount: countEntries(Context.Store),
      DBPath:     DBPathFor(Config, StoreId),
    }
  } finally {
    await closeContext(Context)
  }
}

/**** toolStorePing ****/

async function toolStorePing (Config:ReturnType<typeof configFrom>):Promise<object> {
  const { ServerURL, Token } = Config
  if (ServerURL == null) { throw new MCP_ToolError('ServerURL is required') }
  if (Token     == null) { throw new MCP_ToolError('Token is required') }

  if (! /^wss?:\/\//.test(ServerURL)) {
    throw new MCP_ToolError(
      `invalid ServerURL '${ServerURL}' — must start with 'ws://' or 'wss://'`
    )
  }

  try {
    const Result = await runSync(Config, 1000)
    return { Server:Result.ServerURL, StoreId:Result.StoreId, reachable:true }
  } catch (Signal) {
    const message = Signal instanceof Error ? Signal.message : String(Signal)
    return { Server:ServerURL, reachable:false, Error:message }
  }
}

/**** toolStoreSync ****/

async function toolStoreSync (
  Config:ReturnType<typeof configFrom>, TimeoutMs:number
):Promise<object> {
  const Result = await runSync(Config, TimeoutMs)
  return { StoreId:Result.StoreId, Server:Result.ServerURL, synced:Result.Connected }
}

/**** toolStoreDestroy ****/

async function toolStoreDestroy (Config:ReturnType<typeof configFrom>):Promise<object> {
  const StoreId = Config.StoreId
  if (StoreId == null) { throw new MCP_ToolError('StoreId is required') }
  await destroyStore(Config)
  return { StoreId, destroyed:true }
}

/**** toolStoreExport ****/

async function toolStoreExport (
  Config:ReturnType<typeof configFrom>,
  Encoding:'json'|'binary', OutputFile:string | undefined
):Promise<object> {
  const Context = await loadContext(Config)
  try {
    return await coreStoreExport(Context.Store, Encoding, OutputFile)
  } finally {
    await closeContext(Context)
  }
}

/**** coreStoreExport — shared by standalone and batch handlers ****/

async function coreStoreExport (
  Store:SDS_DataStore, Encoding:'json'|'binary', OutputFile:string | undefined
):Promise<object> {
  const isBinary = Encoding === 'binary'
  const Data     = isBinary
    ? Store.asBinary()
    : JSON.stringify(Store.asJSON(), null, 2)

  if (OutputFile != null) {
    try {
      await fs.writeFile(OutputFile, isBinary ? (Data as Uint8Array) : (Data as string)+'\n')
    } catch (Signal) {
      throw new MCP_ToolError(`failed to write export to '${OutputFile}': ${(Signal as Error).message}`)
    }
    return { exported:true, Format:Encoding, File:OutputFile }
  }

  if (isBinary) {
    const DataBase64 = Buffer.from(Data as Uint8Array).toString('base64')
    return { exported:true, Format:'binary', DataBase64 }
  }

  return { exported:true, Format:'json', Data }
}

/**** toolStoreImport ****/

async function toolStoreImport (
  Config:ReturnType<typeof configFrom>,
  InputFile:string | undefined, InputBase64:string | undefined,
  InputEncoding:'json'|'binary'
):Promise<object> {
  const Context = await loadContext(Config, true)
  try {
    return await coreStoreImport(Context.Store, InputFile, InputBase64, InputEncoding)
  } finally {
    await closeContext(Context)
  }
}

/**** coreStoreImport — shared by standalone and batch handlers ****/

async function coreStoreImport (
  Store:SDS_DataStore,
  InputFile:string | undefined, InputBase64:string | undefined,
  InputEncoding:'json'|'binary'
):Promise<object> {
  let RawData:Buffer
  let Source:string

  if (InputFile != null) {
    RawData = await readFileSafely(InputFile)
    Source  = InputFile
  } else {
    // InputBase64 is guaranteed non-null by validateImportParams
    RawData = Buffer.from(InputBase64!, 'base64')
    Source  = 'base64'
  }

  const isJSON = InputEncoding === 'json'
  if (isJSON) {
    const Text = RawData.toString('utf8').trimStart()
    let Parsed:unknown
    try {
      Parsed = JSON.parse(Text)
    } catch {
      throw new MCP_ToolError(
        InputFile != null
          ? `'${InputFile}' does not contain valid JSON`
          : 'InputBase64 does not contain valid JSON'
      )
    }
    mergeEntriesFromJSON(Store, Parsed)
  } else {
    let TmpStore:SDS_DataStore
    try {
      TmpStore = createStoreFromBinary(new Uint8Array(RawData))
    } catch {
      throw new MCP_ToolError(
        InputFile != null
          ? `'${InputFile}' does not contain valid binary SDS data`
          : 'InputBase64 does not contain valid binary SDS data'
      )
    }
    try {
      mergeEntriesFromJSON(Store, TmpStore.asJSON())
    } finally {
      TmpStore.dispose()
    }
  }

  return InputFile != null
    ? { imported:true, File:Source }
    : { imported:true, Source }
}

/**** validateImportParams — checks mutual exclusion of InputFile / InputBase64 ****/

function validateImportParams (Params:Record<string,unknown>):void {
  const hasFile   = Params['InputFile']   != null
  const hasBase64 = Params['InputBase64'] != null
  if (! hasFile && ! hasBase64) {
    throw new MCP_ToolError('either InputFile or InputBase64 is required')
  }
  if (hasFile && hasBase64) {
    throw new MCP_ToolError('InputFile and InputBase64 are mutually exclusive')
  }
  if (hasBase64 && (Params['InputEncoding'] == null)) {
    throw new MCP_ToolError('InputEncoding is required when InputBase64 is used')
  }
}

/**** mergeEntriesFromJSON — copies non-system inner entries into the store ****/

function mergeEntriesFromJSON (Store:SDS_DataStore, RootJSON:unknown):void {
  const SystemIds     = new Set([ RootId, TrashId, LostAndFoundId ])
  const Root          = RootJSON as Record<string,unknown>
  const InnerEntries  = Root['innerEntries'] as Array<Record<string,unknown>> | undefined
  if (InnerEntries == null) { return }

  for (const Entry of InnerEntries) {
    if (! SystemIds.has(Entry['Id'] as string)) {
      Store.newEntryFromJSONat(Entry, Store.RootItem)
    }
  }
}
