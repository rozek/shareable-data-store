/*******************************************************************************
*                                                                              *
*                            SDS Sidecar Library                               *
*                                                                              *
*******************************************************************************/

// backend-agnostic library — CLI argument parsing, persistence, sync engine,
// and webhook notifications behind a pluggable SDS_StoreFactory interface.
// Use a backend-specific wrapper (e.g. @rozek/sds-sidecar-jj) to run as a CLI.
//
// usage:
//   runSidecar(Factory)                   — default CLI name 'sds-sidecar'
//   runSidecar(Factory, 'sds-sidecar-jj') — backend-specific CLI name
//
// environment variables:
//   SDS_SERVER_URL    — WebSocket base URL (overridden by <ws-url>)
//   SDS_STORE_ID      — store identifier   (overridden by <store-id>)
//   SDS_TOKEN         — JWT for the WS server
//   SDS_WEBHOOK_TOKEN — bearer token for outgoing webhook calls
//   SDS_PERSISTENCE_DIR — directory for the local SQLite DB
//   SDS_ON_AUTH_ERROR — webhook URL to notify on auth errors

import fs from 'node:fs/promises'

import { Command }                           from 'commander'
import type { SDS_DataStore }                from '@rozek/sds-core'
import { SDS_DesktopPersistenceProvider }    from '@rozek/sds-persistence-node'
import { SDS_SyncEngine }                    from '@rozek/sds-sync-engine'

import pkg from '../package.json'

import { ExitCodes }                         from './ExitCodes.js'
import { resolveConfig, SDS_SidecarError, DBPathFor } from './Config.js'
import { SidecarNetworkProvider }            from './SidecarNetworkProvider.js'
import { WebHookManager }                    from './WebHookManager.js'

//----------------------------------------------------------------------------//
//                             SDS_StoreFactory                               //
//----------------------------------------------------------------------------//

/**** SDS_StoreFactory — pluggable interface for backend-specific store creation ****/

  export interface SDS_StoreFactory {
    fromScratch (): SDS_DataStore
    fromBinary  (Data: Uint8Array): SDS_DataStore
  }

//----------------------------------------------------------------------------//
//                              CLI helpers                                   //
//----------------------------------------------------------------------------//

/**** buildProgram — constructs the commander program ****/

  function buildProgram (CommandName:string):Command {
    const Program = new Command(CommandName)
      Program
        .description('shareable-data-store sidecar — persistent sync + webhook notifications')
        .version(pkg.version, '--version', 'print version')
        .allowUnknownOption(false)
        .configureOutput({ writeErr: () => {} })

        // positional arguments
        .argument('[ws-url]',   'WebSocket server URL (env: SDS_SERVER_URL)')
        .argument('[store-id]', 'store identifier     (env: SDS_STORE_ID)')

        // identity
        .option('--token <jwt>',            'JWT for the WebSocket server (env: SDS_TOKEN)')
        .option('--config <file>',          'JSON config file path')

        // persistence
        .option('--persist-dir <path>',     'directory for local SQLite DB (env: SDS_PERSISTENCE_DIR)')

        // single inline webhook
        .option('--webhook-url <url>',      'webhook endpoint URL')
        .option('--webhook-token <token>',  'bearer token for webhook calls (env: SDS_WEBHOOK_TOKEN)')
        .option('--topic <string>',         'opaque string echoed in the webhook payload')
        .option('--watch <uuid>',           'UUID of the subtree root to observe')
        .option('--depth <n>',              'max watch depth (default: unlimited)')
        .option('--on <trigger>',           'trigger condition (repeatable)', collectRepeatable, [])

        // auth-error webhook
        .option('--on-auth-error <url>',    'webhook URL to notify on auth errors')

        // reconnect tuning
        .option('--reconnect-initial <ms>', 'initial reconnect delay in ms (default: 1000)')
        .option('--reconnect-max <ms>',     'max reconnect delay in ms     (default: 60000)')
        .option('--reconnect-jitter <f>',   'jitter fraction 0..1          (default: 0.1)')

    return Program
  }

/**** collectRepeatable — commander collector for --on (allows multiple values) ****/

  function collectRepeatable (Value:string, Previous:string[]):string[] {
    return [ ...Previous, Value ]
  }

//----------------------------------------------------------------------------//
//                               runSidecar                                   //
//----------------------------------------------------------------------------//

/**** runSidecar — wires up sync engine, webhook manager, and signal handlers ****/

  export async function runSidecar (
    Factory:     SDS_StoreFactory,
    CommandName: string = 'sds-sidecar',
  ):Promise<void> {
    const Program = buildProgram(CommandName)
    Program.exitOverride()
    Program.configureOutput({ writeErr: () => {} })

    let ParsedArgs:{ args:string[]; opts:Record<string,unknown> }
    try {
      await Program.parseAsync(process.argv)
      ParsedArgs = { args: Program.args, opts: Program.opts() }
    } catch (Signal:unknown) {
      const CmdErr = Signal as { code?:string; message:string }
      switch (true) {
        case (CmdErr.code === 'commander.helpDisplayed'):
        case (CmdErr.code === 'commander.version'):
          process.exit(ExitCodes.OK)
        default:
          process.stderr.write(`${CommandName}: ${CmdErr.message}\n\n`)
          process.stderr.write(Program.helpInformation())
          process.exit(ExitCodes.UsageError)
      }
    }

    // merge positional args into options
    const [ WsUrl, StoreIdArg ] = ParsedArgs.args
    const CliOptions = {
      ...ParsedArgs.opts,
      ...(WsUrl       != null ? { server: WsUrl }       : {}),
      ...(StoreIdArg  != null ? { store:  StoreIdArg }  : {}),
    }

    let Config:Awaited<ReturnType<typeof resolveConfig>>
    try {
      Config = await resolveConfig(CliOptions)
    } catch (Signal) {
      if (Signal instanceof SDS_SidecarError) {
        process.stderr.write(`${CommandName}: ${Signal.message}\n`)
        process.exit(Signal.ExitCode)
      }
      throw Signal
    }

    // ensure persist directory exists
    await fs.mkdir(Config.PersistenceDir!, { recursive:true })
    const DbPath = DBPathFor(Config.PersistenceDir!, Config.StoreId)

    // open local persistence
    const Persistence = new SDS_DesktopPersistenceProvider(DbPath, Config.StoreId)

    // load or create store using the provided factory
    let Store:SDS_DataStore
    try {
      const Snapshot = await Persistence.loadSnapshot()
      Store = (Snapshot != null)
        ? Factory.fromBinary(Snapshot)
        : Factory.fromScratch()
    } catch (Signal) {
      process.stderr.write(
        `${CommandName}: failed to load store '${Config.StoreId}': ${(Signal as Error).message}\n`
      )
      await Persistence.close().catch(() => {})
      process.exit(ExitCodes.GeneralError)
    }

    // create network provider with sidecar-specific backoff + auth-error detection
    const Network = new SidecarNetworkProvider(Config.StoreId, Config.reconnect)

    // webhook manager — only created when at least one webhook is configured
    const WebHookMgr = (Config.WebHooks.length > 0)
      ? new WebHookManager(Config.WebHooks, Store, Config.StoreId, Config.WebHookToken)
      : undefined

    // create sync engine (persistence + network only; no presence needed)
    const Engine = new SDS_SyncEngine(Store, {
      PersistenceProvider: Persistence,
      NetworkProvider:     Network,
      BroadcastChannel:    false,
    })

    await Engine.start()

    // register store change handler for webhook processing
    const detachChangeHandler = WebHookMgr != null
      ? Store.onChangeInvoke((Origin, ChangeSet) => {
          WebHookMgr.processChangeSet(Origin, ChangeSet).catch((Signal) => {
            process.stderr.write(
              `[${CommandName}] webhook error: ${(Signal as Error).message}\n`
            )
          })
        })
      : () => {}

    // auth-error handler — fire optional webhook, then shut down
    Network.onAuthError(async (Code, Reason) => {
      const Label = Code === 4001 ? 'Unauthorized' : 'Forbidden'
      process.stderr.write(
        `[${CommandName}] AUTH ERROR ${Code} ${Label}: ${Reason || '(no reason given)'}\n` +
        `[${CommandName}] reconnect suppressed — check SDS_TOKEN or --token\n`
      )

      if (Config.onAuthError != null) {
        await fireAuthErrorWebHook(Config.onAuthError, Config.WebHookToken, {
          StoreId:   Config.StoreId,
          ServerURL: Config.ServerURL,
          Code,
          Reason:    Reason || Label,
        }, CommandName).catch((Signal) => {
          process.stderr.write(
            `[${CommandName}] auth-error webhook failed: ${(Signal as Error).message ?? Signal}\n`
          )
        })
      }

      await cleanUp(Engine, detachChangeHandler, Persistence)
      process.exit(Code === 4001 ? ExitCodes.Unauthorized : ExitCodes.Forbidden)
    })

    // connect to WebSocket server (the SidecarNetworkProvider handles all reconnects)
    process.stderr.write(
      `[${CommandName}] connecting to ${Config.ServerURL} (store: ${Config.StoreId})\n`
    )
    try {
      await Engine.connectTo(Config.ServerURL, { Token: Config.Token })
    } catch (Signal) {
      process.stderr.write(
        `[${CommandName}] initial connection failed: ${(Signal as Error).message}\n`
      )
      // the network provider has already scheduled a reconnect; we stay alive
    }

    // log connection state changes
    Network.onConnectionChange((State) => {
      switch (State) {
        case 'connected':
          process.stderr.write(`[${CommandName}] connected\n`); break
        case 'reconnecting':
          process.stderr.write(`[${CommandName}] disconnected — reconnecting…\n`); break
        case 'disconnected':
          process.stderr.write(`[${CommandName}] disconnected\n`); break
      }
    })

    // graceful shutdown on SIGINT and SIGTERM
    const handleSignal = async (Signal:string) => {
      process.stderr.write(`\n[${CommandName}] received ${Signal} — shutting down\n`)
      await cleanUp(Engine, detachChangeHandler, Persistence)
      process.exit(ExitCodes.OK)
    }

    process.once('SIGINT',  () => { handleSignal('SIGINT').catch(() => process.exit(1)) })
    process.once('SIGTERM', () => { handleSignal('SIGTERM').catch(() => process.exit(1)) })

    // keep the process alive — the event loop stays active due to the WebSocket
    process.stderr.write(`[${CommandName}] running (press Ctrl+C to stop)\n`)
  }

/**** cleanUp — stops the sync engine and closes persistence ****/

  async function cleanUp (
    Engine:     SDS_SyncEngine,
    Detach:     () => void,
    Persistence:SDS_DesktopPersistenceProvider,
  ):Promise<void> {
    Detach()
    try { await Engine.stop() }       catch (_Signal) {}
    try { await Persistence.close() } catch (_Signal) {}
  }

/**** fireAuthErrorWebHook — sends an HTTP POST to the onAuthError URL ****/

  async function fireAuthErrorWebHook (
    URL:          string,
    WebHookToken: string | undefined,
    Body:         Record<string,unknown>,
    CommandName:  string,
  ):Promise<void> {
    const Headers:Record<string,string> = { 'Content-Type':'application/json' }
    if (WebHookToken != null) {
      Headers['Authorization'] = `Bearer ${WebHookToken}`
    }
    const Response = await fetch(URL, {
      method:  'POST',
      headers: Headers,
      body:    JSON.stringify(Body),
      signal:  AbortSignal.timeout(10_000),
    })
    if (! Response.ok) {
      process.stderr.write(
        `[${CommandName}] auth-error webhook returned ${Response.status} ${Response.statusText}\n`
      )
    }
  }
