/*******************************************************************************
*                                                                              *
*                               StoreAccess                                    *
*                                                                              *
*******************************************************************************/

// loads the CRDT store from local SQLite persistence, manages the SyncEngine
// lifecycle, and provides a one-shot sync helper for store-sync operations

import fs   from 'node:fs/promises'
import path from 'node:path'

import type { SDS_DataStore }             from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider } from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                 from '@rozek/sds-sync-engine'
import { SDS_WebSocketProvider }          from '@rozek/sds-network-websocket'

import type { SDSConfig }  from './Config.js'
import { DBPathFor }       from './Config.js'
import { ExitCodes }       from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                             SDS_StoreFactory                               //
//----------------------------------------------------------------------------//

/**** SDS_StoreFactory — pluggable backend factory injected by the CLI wrapper ****/

export interface SDS_StoreFactory {
  fromScratch (): SDS_DataStore
  fromBinary  (Data:Uint8Array): SDS_DataStore
}

let Factory:SDS_StoreFactory

/**** setStoreFactory — called once by runCommand before any store operations ****/

export function setStoreFactory (f:SDS_StoreFactory):void {
  Factory = f
}

/**** createStoreFromBinary — creates a temporary store using the injected factory ****/

export function createStoreFromBinary (Data:Uint8Array):SDS_DataStore {
  return Factory.fromBinary(Data)
}

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

  await fs.mkdir(Config.PersistenceDir, { recursive:true })
  const DbPath      = DBPathFor(Config, StoreId)
  const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId)

  let Store:SDS_DataStore
  try {
    const Snapshot = await Persistence.loadSnapshot()
    switch (true) {
      case (Snapshot != null): {
        Store = Factory.fromBinary(Snapshot!)
        break
      }
      case (allowCreate): {
        Store = Factory.fromScratch()
        break
      }
      default: {
        await Persistence.close()
        throw new SDS_CommandError(
          `store '${StoreId}' not found in '${Config.PersistenceDir}'`,
          ExitCodes.NotFound
        )
      }
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
  if (! /^wss?:\/\//.test(ServerURL)) {
    throw new SDS_CommandError(
      `invalid server URL '${ServerURL}' — must start with 'ws://' or 'wss://'`,
      ExitCodes.UsageError
    )
  }
  if (Token == null) {
    throw new SDS_CommandError(
      'no client token — set SDS_TOKEN or use --token', ExitCodes.UsageError
    )
  }

  await fs.mkdir(Config.PersistenceDir, { recursive:true })
  const DbPath      = DBPathFor(Config, StoreId)
  const Persistence = new SDS_DesktopPersistenceProvider(DbPath, StoreId)

  const Snapshot = await Persistence.loadSnapshot()
  const Store    = Snapshot != null
    ? Factory.fromBinary(Snapshot)
    : Factory.fromScratch()

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
    // upload the full local CRDT state so that connected peers receive our
    // data.  The SyncEngine already sent a MSG_SYNC_REQUEST on connect, so
    // the "download" half (receiving remote state) is handled by whichever
    // peers respond to that request.
    const FullState = Store.exportPatch()
    if (FullState.byteLength > 0) {
      Network.sendPatch(FullState)
    }
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
        `store '${StoreId}' not found in '${Config.PersistenceDir}'`,
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

import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core'

/**** resolveEntryId — maps well-known aliases to their canonical UUIDs ****/

export function resolveEntryId (IdOrAlias:string):string {
  switch (IdOrAlias.toLowerCase()) {
    case 'root':          return RootId
    case 'trash':         return TrashId
    case 'lost-and-found':
    case 'lostandfound':  return LostAndFoundId
    default:              return IdOrAlias
  }
}

//----------------------------------------------------------------------------//
//                              parseIntOption                                //
//----------------------------------------------------------------------------//

/**** parseIntOption — parses an integer CLI option; throws UsageError on NaN ****/

export function parseIntOption (Raw:string, FlagName:string):number {
  const Value = parseInt(Raw, 10)
  if (isNaN(Value)) {
    throw new SDS_CommandError(
      `invalid value for ${FlagName}: '${Raw}' — expected an integer`,
      ExitCodes.UsageError
    )
  }
  return Value
}

//----------------------------------------------------------------------------//
//                              readFileSafely                                //
//----------------------------------------------------------------------------//

/**** readFileSafely — wraps fs.readFile; maps ENOENT to SDS_CommandError(NotFound) ****/

export async function readFileSafely (FilePath:string):Promise<Buffer> {
  try {
    return await fs.readFile(FilePath)
  } catch (Signal:unknown) {
    if ((Signal as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new SDS_CommandError(
        `file not found: '${FilePath}'`,
        ExitCodes.NotFound
      )
    }
    throw Signal
  }
}
