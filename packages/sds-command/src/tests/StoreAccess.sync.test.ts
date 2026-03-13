/*******************************************************************************
*                                                                              *
*                   StoreAccess — runSync unit tests                            *
*                                                                              *
*******************************************************************************/

// covers: SY (store sync — runSync validation and upload behaviour)

import { describe, it, expect, vi, beforeEach } from 'vitest'

//----------------------------------------------------------------------------//
//                              Module Mocks                                  //
//----------------------------------------------------------------------------//

/**** hoisted variables shared between vi.mock factories and tests ****/

const Hoisted = vi.hoisted(() => {
  // persistence mock controls
  const mockLoadSnapshot     = vi.fn().mockResolvedValue(undefined)
  const mockLoadPatchesSince = vi.fn().mockResolvedValue([] as Uint8Array[])
  const mockAppendPatch      = vi.fn().mockResolvedValue(undefined)
  const mockPrunePatches     = vi.fn().mockResolvedValue(undefined)
  const mockSaveSnapshot     = vi.fn().mockResolvedValue(undefined)
  const mockPersistenceClose = vi.fn().mockResolvedValue(undefined)
  const mockLoadValue        = vi.fn().mockResolvedValue(undefined)
  const mockSaveValue        = vi.fn().mockResolvedValue(undefined)
  const mockReleaseValue     = vi.fn().mockResolvedValue(undefined)

  // network mock controls
  const mockSendPatch        = vi.fn()
  let   connChangeCallback:  ((state:string) => void) | undefined

  const fireConnected = () => { connChangeCallback?.('connected') }
  const fireDisconnected = () => { connChangeCallback?.('disconnected') }

  return {
    mockLoadSnapshot, mockLoadPatchesSince, mockAppendPatch,
    mockPrunePatches, mockSaveSnapshot, mockPersistenceClose,
    mockLoadValue, mockSaveValue, mockReleaseValue,
    mockSendPatch,
    get connChangeCallback () { return connChangeCallback },
    set connChangeCallback (cb) { connChangeCallback = cb },
    fireConnected, fireDisconnected,
  }
})

vi.mock('@rozek/sds-persistence-node', () => ({
  SDS_DesktopPersistenceProvider: class {
    loadSnapshot     = Hoisted.mockLoadSnapshot
    loadPatchesSince = Hoisted.mockLoadPatchesSince
    appendPatch      = Hoisted.mockAppendPatch
    prunePatches     = Hoisted.mockPrunePatches
    saveSnapshot     = Hoisted.mockSaveSnapshot
    close            = Hoisted.mockPersistenceClose
    loadValue        = Hoisted.mockLoadValue
    saveValue        = Hoisted.mockSaveValue
    releaseValue     = Hoisted.mockReleaseValue
  },
}))

vi.mock('@rozek/sds-network-websocket', () => ({
  SDS_WebSocketProvider: class {
    StoreId:string
    constructor (StoreId:string) { this.StoreId = StoreId }
    get ConnectionState () { return 'disconnected' as const }
    async connect () {
      // simulate immediate connection: fire 'connected' before returning
      Hoisted.fireConnected()
    }
    disconnect () {}
    sendPatch   = Hoisted.mockSendPatch
    sendValue () {}
    requestValue () {}
    sendSyncRequest () {}
    onPatch (cb:Function) { return () => {} }
    onValue (cb:Function) { return () => {} }
    onConnectionChange (cb:Function) {
      Hoisted.connChangeCallback = cb as (s:string) => void
      return () => {}
    }
    onSyncRequest (cb:Function) { return () => {} }
    sendLocalState () {}
    onRemoteState () { return () => {} }
    get PeerSet () { return new Map() }
  },
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const real = await importOriginal<typeof import('node:fs/promises')>()
  return { ...real, mkdir: vi.fn().mockResolvedValue(undefined) }
})

//----------------------------------------------------------------------------//
//                       Subject Under Test                                   //
//----------------------------------------------------------------------------//

import { SDS_DataStore } from '@rozek/sds-core-jj'
import { setStoreFactory, runSync } from '../StoreAccess.js'
import type { SDSConfig } from '../Config.js'

// inject the JJ backend so runSync can create stores during the test
setStoreFactory({
  fromScratch: ()     => SDS_DataStore.fromScratch(),
  fromBinary:  (Data) => SDS_DataStore.fromBinary(Data),
})

//----------------------------------------------------------------------------//
//                              Helpers                                       //
//----------------------------------------------------------------------------//

function baseConfig (overrides:Partial<SDSConfig> = {}):SDSConfig {
  return {
    StoreId:   'test-store',
    PersistenceDir:   '/tmp/sds-test',
    ServerURL: 'ws://localhost:4000',
    Token:     'test-token',
    Format:    'text',
    OnError:   'stop',
    ...overrides,
  }
}

//----------------------------------------------------------------------------//
//                                Tests                                       //
//----------------------------------------------------------------------------//

describe('runSync (SY)', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    Hoisted.connChangeCallback = undefined
    Hoisted.mockLoadPatchesSince.mockResolvedValue([] as Uint8Array[])
    Hoisted.mockLoadSnapshot.mockResolvedValue(undefined)
  })

  it('SY-01: missing store ID throws UsageError (exit code 2)', async () => {
    const Config = baseConfig({ StoreId: undefined as any })
    await expect(runSync(Config, 50)).rejects.toMatchObject({
      name:     'SDS_CommandError',
      ExitCode: 2,
      message:  expect.stringMatching(/no store ID/),
    })
  })

  it('SY-02: missing server URL throws UsageError (exit code 2)', async () => {
    const Config = baseConfig({ ServerURL: undefined as any })
    await expect(runSync(Config, 50)).rejects.toMatchObject({
      name:     'SDS_CommandError',
      ExitCode: 2,
      message:  expect.stringMatching(/no server URL/),
    })
  })

  it('SY-03: invalid server URL (not ws:// or wss://) throws UsageError (exit code 2)', async () => {
    const Config = baseConfig({ ServerURL: 'http://localhost:4000' })
    await expect(runSync(Config, 50)).rejects.toMatchObject({
      name:     'SDS_CommandError',
      ExitCode: 2,
      message:  expect.stringMatching(/invalid server URL/),
    })
  })

  it('SY-04: missing token throws UsageError (exit code 2)', async () => {
    const Config = baseConfig({ Token: undefined as any })
    await expect(runSync(Config, 50)).rejects.toMatchObject({
      name:     'SDS_CommandError',
      ExitCode: 2,
      message:  expect.stringMatching(/no client token/),
    })
  })

  it('SY-05: local state is uploaded as a full-state export via sendPatch on connect', async () => {
    // simulate a locally-stored snapshot with data (e.g. from offline work);
    // runSync loads the snapshot, starts the SyncEngine (which applies any
    // persisted patches), then exports the full CRDT state and sends it as
    // a single sendPatch call after connecting

    // build a snapshot that contains real CRDT data
    const { SDS_DataStore } = await import('@rozek/sds-core-jj')
    const TempStore = SDS_DataStore.fromScratch()
    TempStore.newItemAt(undefined, TempStore.RootItem)
    const SnapshotBinary = TempStore.asBinary()

    Hoisted.mockLoadSnapshot.mockResolvedValue(SnapshotBinary)

    const Config = baseConfig()
    const Result = await runSync(Config, 50) // small timeout so test is fast

    // sendPatch must have been called with a non-empty full-state export
    expect(Hoisted.mockSendPatch).toHaveBeenCalled()
    const SentPatch = Hoisted.mockSendPatch.mock.calls[0][0] as Uint8Array
    expect(SentPatch).toBeInstanceOf(Uint8Array)
    expect(SentPatch.byteLength).toBeGreaterThan(0)

    // result must report successful connection
    expect(Result.Connected).toBe(true)
    expect(Result.StoreId).toBe('test-store')
    expect(Result.ServerURL).toBe('ws://localhost:4000')
  })

})
