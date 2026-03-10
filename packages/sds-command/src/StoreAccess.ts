/*******************************************************************************
*                                                                              *
*                               StoreAccess                                    *
*                                                                              *
*******************************************************************************/

// loads the CRDT store from local SQLite persistence, manages the SyncEngine
// lifecycle, and provides a one-shot sync helper for store-sync operations

import fs   from 'node:fs/promises'
import path from 'node:path'

import { SDS_DataStore }                  from '@rozek/sds-core-jj'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'

import type { SDSConfig }  from './Config.js'
import { DBPathFor }       from './Config.js'
import { ExitCodes }       from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                              SDS_CommandError                              //
//----------------------------------------------------------------------------//

/**** SDS_CommandError — carries a machine-readable exit code alongside the message ****/

export class SDS_CommandError extends Error {
  readonly ExitCode:number

  constructor (Message:string, Code:number = ExitCodes.GeneralError) {
    super(Message)
    this.name     = 'SDS_CommandError'
    this.ExitCode = Code
  }
}

//----------------------------------------------------------------------------//
//                                SDS_Context                                 //
//----------------------------------------------------------------------------//

export interface SDS_Context {
  Store:       SDS_DataStore
  Persistence: SDS_DesktopPersistenceProvider
  Engine:      SDS_SyncEngine
}

//----------------------------------------------------------------------------//
//                               loadContext                                  //
//----------------------------------------------------------------------------//

/**** loadContext — opens the local store; creates it only when allowCreate is true ****/

export async function loadContext (
  Config:SDSConfig, allowCreate:boolean = false
):Promise<SDS_Context> {
  const StoreId = Config.StoreId
  if (StoreId == null) {
    throw new SDS_CommandError(
      'no store ID — set SDS_STORE_ID or use --store',
      ExitCodes.UsageError
    )
  }

  await fs.mkdir(Config.DataDir, { recursive:true })
  const DbPath      = DBPathFor(Config, StoreId)
  const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId)

  let Store:SDS_DataStore
  try {
    const Snapshot = await Persistence.loadSnapshot()
    if (Snapshot != null) {
      Store = SDS_DataStore.fromBinary(Snapshot)
    } else if (allowCreate) {
      Store = SDS_DataStore.fromScratch()
    } else {
      await Persistence.close()
      throw new SDS_CommandError(
        `store '${StoreId}' not found in '${Config.DataDir}'`,
        ExitCodes.NotFound
      )
    }
  } catch (Signal) {
    if (Signal instanceof SDS_CommandError) { throw Signal }
    await Persistence.close().catch(() => {})
    throw new SDS_CommandError(
      `failed to open store '${StoreId}': ${(Signal as Error).message}`,
      ExitCodes.GeneralError
    )
  }

  // SyncEngine with persistence only (no network); auto-persists local changes
  const SyncEngine = new SDS_SyncEngine(Store, { PersistenceProvider:Persistence })
  await SyncEngine.start()

  return { Store, Persistence, Engine: SyncEngine }
}

/**** closeContext — flushes any pending checkpoint and closes the database ****/

export async function closeContext (Context:SDS_Context):Promise<void> {
  await Context.Engine.stop()
}

//----------------------------------------------------------------------------//
//                               runSync                                      //
//----------------------------------------------------------------------------//

export interface SyncResult {
  Connected:  boolean
  StoreId:    string
  ServerURL:  string
}

/**** runSync — one-shot: load → connect → exchange patches → save → close ****/

export async function runSync (
  Config:SDSConfig, TimeoutMs:number = 5000
):Promise<SyncResult> {
  const StoreId   = Config.StoreId
  const ServerURL = Config.ServerURL
  const Token     = Config.Token

  if (StoreId == null) {
    throw new SDS_CommandError(
      'no store ID — set SDS_STORE_ID or use --store', ExitCodes.UsageError
    )
  }
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

  await fs.mkdir(Config.DataDir, { recursive:true })
  const DbPath      = DBPathFor(Config, StoreId)
  const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId)

  const Snapshot = await Persistence.loadSnapshot()
  const Store    = Snapshot != null
    ? SDS_DataStore.fromBinary(Snapshot)
    : SDS_DataStore.fromScratch()

  const Network    = new SDS_WebSocketProvider(StoreId)
  const SyncEngine = new SDS_SyncEngine(Store, {
    PersistenceProvider: Persistence,
    NetworkProvider:     Network,
  })

  await SyncEngine.start()

  let ConnectionEstablished = false
  let Resolve!:() => void
  const CompletionPromise = new Promise<void>((resolve) => { Resolve = resolve })

  const detachConnectionObserver = SyncEngine.onConnectionChange((State) => {
    if (State === 'connected') {
      ConnectionEstablished = true
      setTimeout(Resolve, TimeoutMs) // wait after connected for patch exchange
    }
    if (State === 'disconnected') { Resolve() }
  })

  // overall guard: if we never connect within twice the timeout, abort
  const Guard = setTimeout(() => { Resolve() }, TimeoutMs*2)

  try {
    await SyncEngine.connectTo(ServerURL, { Token })
    await CompletionPromise
  } catch (Signal) {
    throw new SDS_CommandError(
      `sync failed: ${(Signal as Error).message}`,
      ExitCodes.NetworkError
    )
  } finally {
    clearTimeout(Guard)
    detachConnectionObserver()
    await SyncEngine.stop()
  }

  return { Connected: ConnectionEstablished, StoreId, ServerURL }
}

//----------------------------------------------------------------------------//
//                               StoreExists                                  //
//----------------------------------------------------------------------------//

/**** StoreExists — returns true when the SQLite DB file for StoreId is present ****/

export async function StoreExists (Config:SDSConfig):Promise<boolean> {
  const StoreId = Config.StoreId
  if (StoreId == null) { return false }
  const DbPath = DBPathFor(Config, StoreId)
  try {
    await fs.access(DbPath)
    return true
  } catch { return false }
}

/**** destroyStore — deletes the local SQLite DB file ****/

export async function destroyStore (Config:SDSConfig):Promise<void> {
  const StoreId = Config.StoreId
  if (StoreId == null) {
    throw new SDS_CommandError(
      'no store ID — set SDS_STORE_ID or use --store', ExitCodes.UsageError
    )
  }
  const DbPath = DBPathFor(Config, StoreId)
  try {
    await fs.unlink(DbPath)
    // also remove WAL/SHM companion files if they exist
    await fs.unlink(DbPath+'-wal').catch(() => {})
    await fs.unlink(DbPath+'-shm').catch(() => {})
  } catch (Signal:unknown) {
    const FileSystemError = Signal as NodeJS.ErrnoException
    if (FileSystemError.code === 'ENOENT') {
      throw new SDS_CommandError(
        `store '${StoreId}' not found in '${Config.DataDir}'`,
        ExitCodes.NotFound
      )
    }
    throw new SDS_CommandError(
      `failed to delete store '${StoreId}': ${FileSystemError.message}`,
      ExitCodes.GeneralError
    )
  }
}

//----------------------------------------------------------------------------//
//                               resolveEntryId                               //
//----------------------------------------------------------------------------//

import { RootId, TrashId } from '@rozek/sds-core'

/**** resolveEntryId — maps well-known aliases to their canonical UUIDs ****/

export function resolveEntryId (IdOrAlias:string):string {
  switch (IdOrAlias.toLowerCase()) {
    case 'root':  return RootId
    case 'trash': return TrashId
    default:      return IdOrAlias
  }
}
