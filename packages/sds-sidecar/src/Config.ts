/*******************************************************************************
*                                                                              *
*                               SidecarConfig                                  *
*                                                                              *
*******************************************************************************/

// resolves CLI options, environment variables, and an optional JSON config file
// into a single SDS_SidecarConfig; options > env vars > config file

import fs   from 'node:fs/promises'
import path from 'node:path'
import os   from 'node:os'

import { ExitCodes } from './ExitCodes.js'

/**** SDS_SidecarError — carries a machine-readable exit code alongside the message ****/

  export class SDS_SidecarError extends Error {
    readonly ExitCode:number
    constructor (Message:string, ExitCode:number = ExitCodes.UsageError) {
      super(Message)
      this.name     = 'SDS_SidecarError'
      this.ExitCode = ExitCode
    }
  }

/**** TriggerSpec — the parsed form of a single --on value ****/

  export type TriggerSpec =
    | { Kind:'change' }
    | { Kind:'create' }
    | { Kind:'delete' }
    | { Kind:'value';  MIMEGlob?:string }
    | { Kind:'info';   Key:string; Value:string }

/**** WebHookConfig — one webhook endpoint with its trigger rules ****/

  export interface WebHookConfig {
    URL:       string
    Topic?:    string          // opaque string echoed in every payload from this hook
    Watch?:    string          // UUID of the subtree root to observe
    maxDepth?: number          // max depth of watched subtree (default: unlimited)
    on:        TriggerSpec[]   // trigger conditions (at least one required)
  }

/**** reconnect options ****/

  export interface ReconnectOptions {
    initialDelay: number   // ms before first retry (default: 1000)
    maxDelay:     number   // max ms between retries (default: 60000)
    Jitter:       number   // random fraction added/removed from delay (default: 0.1)
  }

/**** SDS_SidecarConfig ****/

  export interface SDS_SidecarConfig {
    ServerURL:     string            // WebSocket server base URL
    StoreId:       string            // store identifier
    Token:         string            // JWT (read scope recommended)
    PersistenceDir?:   string         // directory for local SQLite DB
    WebHookToken?: string            // bearer token for outgoing webhook calls
    onAuthError?:  string            // webhook URL to call on auth errors
    reconnect:     ReconnectOptions
    WebHooks:      WebHookConfig[]
  }

/**** parseTriggerSpec — parses a single --on argument into a TriggerSpec ****/

  export function parseTriggerSpec (Raw:string):TriggerSpec {
    switch (true) {
      case (Raw === 'change'): return { Kind:'change' }
      case (Raw === 'create'): return { Kind:'create' }
      case (Raw === 'delete'): return { Kind:'delete' }
      case (Raw === 'value'):  return { Kind:'value' }
      case (Raw.startsWith('value:')): {
        const MIMEGlob = Raw.slice('value:'.length).trim()
        if (MIMEGlob.length === 0) {
          throw new SDS_SidecarError(`invalid --on value '${Raw}' — expected 'value:<mime-glob>'`)
        }
        return { Kind:'value', MIMEGlob }
      }
      case (Raw.startsWith('info:')): {
        const Rest  = Raw.slice('info:'.length)
        const EqIdx = Rest.indexOf('=')
        if (EqIdx < 1) {
          throw new SDS_SidecarError(
            `invalid --on value '${Raw}' — expected 'info:<key>=<value>'`
          )
        }
        const Key   = Rest.slice(0, EqIdx).trim()
        const Value = Rest.slice(EqIdx+1)
        if (Key.length === 0) {
          throw new SDS_SidecarError(
            `invalid --on value '${Raw}' — info key must not be empty`
          )
        }
        return { Kind:'info', Key, Value }
      }
      default:
        throw new SDS_SidecarError(
          `unknown trigger '${Raw}' — valid values: change, create, delete, ` +
          `value, value:<mime-glob>, info:<key>=<value>`
        )
    }
  }

/**** parseWebHookConfig — validates and parses a single webhook config object ****/

  export function parseWebHookConfig (Raw:unknown, Index:number):WebHookConfig {
    if ((Raw == null) || (typeof Raw !== 'object') || Array.isArray(Raw)) {
      throw new SDS_SidecarError(`WebHooks[${Index}]: expected an object`)
    }
    const Obj = Raw as Record<string,unknown>

    if (typeof Obj['URL'] !== 'string' || Obj['URL'].trim().length === 0) {
      throw new SDS_SidecarError(`WebHooks[${Index}].URL: expected a non-empty string`)
    }
    const URL = Obj['URL'].trim()

    const Topic    = (Obj['Topic']    != null) ? String(Obj['Topic'])    : undefined
    const Watch    = (Obj['Watch']    != null) ? String(Obj['Watch'])    : undefined
    const MaxDepth = (Obj['maxDepth'] != null) ? Number(Obj['maxDepth']) : undefined
    if ((MaxDepth != null) && (! Number.isInteger(MaxDepth) || MaxDepth < 0)) {
      throw new SDS_SidecarError(`WebHooks[${Index}].maxDepth: expected a non-negative integer`)
    }

    const RawOn = Obj['on']
    if (! Array.isArray(RawOn) || RawOn.length === 0) {
      throw new SDS_SidecarError(`WebHooks[${Index}].on: expected a non-empty array`)
    }
    const On = (RawOn as string[]).map((Spec, i) => {
      try {
        return parseTriggerSpec(String(Spec))
      } catch (Signal) {
        throw new SDS_SidecarError(`WebHooks[${Index}].on[${i}]: ${(Signal as Error).message}`)
      }
    })

    return { URL, Topic, Watch, maxDepth: MaxDepth, on: On }
  }

/**** resolveConfig — merges CLI options, env vars, and optional config file ****/

  export async function resolveConfig (
    Options:Record<string,unknown>
  ):Promise<SDS_SidecarConfig> {
    // load JSON config file when --config is given; fields serve as defaults
    let FileConfig:Record<string,unknown> = {}
    const ConfigPath = Options['config'] as string | undefined
    if (ConfigPath != null) {
      let Raw:string
      try {
        Raw = await fs.readFile(path.resolve(ConfigPath), 'utf-8')
      } catch (Signal) {
        throw new SDS_SidecarError(
          `cannot read config file '${ConfigPath}': ${(Signal as Error).message}`,
          ExitCodes.NotFound
        )
      }
      try {
        FileConfig = JSON.parse(Raw)
      } catch (Signal) {
        throw new SDS_SidecarError(
          `config file '${ConfigPath}' contains invalid JSON: ${(Signal as Error).message}`
        )
      }
    }

    // options > env vars > file config
    const ServerURL = (
      (Options['server']  ?? process.env['SDS_SERVER_URL']  ?? FileConfig['ServerURL'])
    ) as string | undefined
    const StoreId = (
      (Options['store']   ?? process.env['SDS_STORE_ID']    ?? FileConfig['StoreId'])
    ) as string | undefined
    const Token = (
      (Options['token']   ?? process.env['SDS_TOKEN']       ?? FileConfig['Token'])
    ) as string | undefined
    const PersistenceDir = (
      (Options['persistenceDir'] ?? process.env['SDS_PERSISTENCE_DIR'] ?? FileConfig['PersistenceDir'])
    ) as string | undefined
    const WebHookToken = (
      (Options['webhookToken'] ?? process.env['SDS_WEBHOOK_TOKEN'] ?? FileConfig['WebHookToken'])
    ) as string | undefined
    const OnAuthError = (
      (Options['onAuthError'] ?? process.env['SDS_ON_AUTH_ERROR'] ?? FileConfig['onAuthError'])
    ) as string | undefined

    if (ServerURL == null || ServerURL.trim().length === 0) {
      throw new SDS_SidecarError(
        'no server URL — set SDS_SERVER_URL, use --server, or set "ServerURL" in config file'
      )
    }
    if (! /^wss?:\/\//.test(ServerURL)) {
      throw new SDS_SidecarError(
        `invalid server URL '${ServerURL}' — must start with 'ws://' or 'wss://'`
      )
    }
    if (StoreId == null || StoreId.trim().length === 0) {
      throw new SDS_SidecarError(
        'no store ID — set SDS_STORE_ID, use --store, or set "StoreId" in config file'
      )
    }
    if (Token == null || Token.trim().length === 0) {
      throw new SDS_SidecarError(
        'no token — set SDS_TOKEN, use --token, or set "Token" in config file'
      )
    }

    // reconnect options — CLI overrides file overrides defaults
    const FileReconnect = (FileConfig['reconnect'] ?? {}) as Record<string,unknown>
    const InitialDelay  = Number(Options['reconnectInitial'] ?? FileReconnect['initialDelay'] ?? 1000)
    const MaxDelay      = Number(Options['reconnectMax']     ?? FileReconnect['maxDelay']     ?? 60000)
    const Jitter        = Number(Options['reconnectJitter']  ?? FileReconnect['Jitter']       ?? 0.1)

    if (! isFinite(InitialDelay) || InitialDelay < 100) {
      throw new SDS_SidecarError('--reconnect-initial must be at least 100 ms')
    }
    if (! isFinite(MaxDelay) || MaxDelay < InitialDelay) {
      throw new SDS_SidecarError('--reconnect-max must be >= --reconnect-initial')
    }
    if (! isFinite(Jitter) || Jitter < 0 || Jitter > 1) {
      throw new SDS_SidecarError('--reconnect-jitter must be between 0 and 1')
    }

    // resolve PersistenceDir
    const ResolvedPersistenceDir = PersistenceDir != null
      ? path.resolve(PersistenceDir)
      : path.join(os.homedir(), '.sds')

    // inline webhooks from CLI (--webhook-url + --watch + --depth + --on)
    const InlineWebHooks:WebHookConfig[] = []
    const InlineURL = Options['webhookUrl'] as string | undefined
    if (InlineURL != null) {
      const RawOns = (Options['on'] as string[] | undefined) ?? []
      if (RawOns.length === 0) {
        throw new SDS_SidecarError('--webhook-url given without any --on trigger')
      }
      const On       = RawOns.map((Raw) => parseTriggerSpec(Raw))
      const Topic    = Options['topic'] as string | undefined
      const Watch    = Options['watch'] as string | undefined
      const MaxDepth = Options['depth'] != null
        ? Number(Options['depth'] as string)
        : undefined
      if ((MaxDepth != null) && (! Number.isInteger(MaxDepth) || MaxDepth < 0)) {
        throw new SDS_SidecarError('--depth must be a non-negative integer')
      }
      InlineWebHooks.push({ URL: InlineURL, Topic, Watch, maxDepth: MaxDepth, on: On })
    }

    // webhooks from config file
    const FileWebHooks:WebHookConfig[] = []
    const RawFileWebHooks = FileConfig['WebHooks']
    if (Array.isArray(RawFileWebHooks)) {
      for (let i = 0; i < RawFileWebHooks.length; i++) {
        FileWebHooks.push(parseWebHookConfig(RawFileWebHooks[i], i))
      }
    }

    const WebHooks = [ ...InlineWebHooks, ...FileWebHooks ]

    return {
      ServerURL:    ServerURL.trim(),
      StoreId:      StoreId.trim(),
      Token:        Token.trim(),
      PersistenceDir:   ResolvedPersistenceDir,
      WebHookToken: WebHookToken,
      onAuthError:  OnAuthError,
      reconnect:    { initialDelay: InitialDelay, maxDelay: MaxDelay, Jitter },
      WebHooks,
    }
  }

/**** DBPathFor — resolves the SQLite DB file path for a given store ID ****/

  export function DBPathFor (PersistenceDir:string, StoreId:string):string {
    const SafeId = StoreId.replace(/[^a-zA-Z0-9_-]/g, '_')
    return path.join(PersistenceDir, `${SafeId}.db`)
  }
