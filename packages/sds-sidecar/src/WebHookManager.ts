/*******************************************************************************
*                                                                              *
*                             WebHookManager                                   *
*                                                                              *
*******************************************************************************/

// evaluates SDS_ChangeSet events against configured webhook rules and fires
// matching HTTP POSTs; supports per-webhook topic, watch subtree, depth, and
// trigger conditions (change, create, delete, value[:<mime-glob>], info:<key>=<value>)

import type { SDS_DataStore, ChangeOrigin } from '@rozek/sds-core'
import type { SDS_ChangeSet }               from '@rozek/sds-core'
import { TrashId }                          from '@rozek/sds-core'

import type { WebHookConfig, TriggerSpec }  from './Config.js'

  const WebHookTimeout = 10_000   // ms; aborts fetch if endpoint does not respond

/**** WebHookPayload — JSON body sent to the webhook endpoint ****/

  export interface WebHookPayload {
    StoreId:        string
    Trigger:        string                 // the specific trigger kind that fired
    Topic?:         string                 // opaque string from the webhook config
    changedEntries: string[]               // IDs of entries that matched
    Timestamp:      string                 // ISO 8601
  }

/**** matchesMIMEGlob — returns true when MIMEType matches a glob like 'image/*' ****/

  function matchesMIMEGlob (MIMEType:string, Glob:string):boolean {
    const Pattern = Glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
                        .replace(/\*/g, '.*')
                        .replace(/\?/g, '.')
    return new RegExp(`^${Pattern}$`, 'i').test(MIMEType)
  }

//----------------------------------------------------------------------------//
//                              WebHookManager                                //
//----------------------------------------------------------------------------//

export class WebHookManager {
  #Configs:      WebHookConfig[]
  #Store:        SDS_DataStore
  #WebHookToken: string | undefined
  #StoreId:      string

  constructor (
    Configs:WebHookConfig[], Store:SDS_DataStore,
    StoreId:string, WebHookToken?:string
  ) {
    this.#Configs      = Configs
    this.#Store        = Store
    this.#StoreId      = StoreId
    this.#WebHookToken = WebHookToken
  }

/**** processChangeSet — evaluates the changeset against all rules; fires matching hooks ****/

  async processChangeSet (Origin:ChangeOrigin, ChangeSet:SDS_ChangeSet):Promise<void> {
    if (this.#Configs.length === 0) { return }
    const ChangedIds = Object.keys(ChangeSet)
    if (ChangedIds.length === 0) { return }

    const Promises:Promise<void>[] = []
    for (const Config of this.#Configs) {
      const Matched = this.#matchConfig(Config, ChangeSet, ChangedIds)
      for (const { Trigger, EntryIds } of Matched) {
        const Payload:WebHookPayload = {
          StoreId:        this.#StoreId,
          Trigger:        triggerLabel(Trigger),
          changedEntries: EntryIds,
          Timestamp:      new Date().toISOString(),
        }
        if (Config.Topic != null) { Payload.Topic = Config.Topic }
        Promises.push(this.#fireWebHook(Config.URL, Payload))
      }
    }
    await Promise.allSettled(Promises)
  }

/**** #matchConfig — returns each trigger that fires for this config + the matching IDs ****/

  #matchConfig (
    Config:WebHookConfig,
    ChangeSet:SDS_ChangeSet,
    ChangedIds:string[],
  ):Array<{ Trigger:TriggerSpec; EntryIds:string[] }> {
    const WatchId = Config.Watch != null
      ? this.#resolveWatch(Config.Watch)
      : undefined

    // filter to only IDs inside the watched subtree (or all if no watch set)
    const ScopedIds = WatchId != null
      ? ChangedIds.filter((Id) =>
          this.#isInWatchedSubtree(Id, WatchId, Config.maxDepth ?? Infinity)
        )
      : ChangedIds

    if (ScopedIds.length === 0) { return [] }

    const Results:Array<{ Trigger:TriggerSpec; EntryIds:string[] }> = []

    for (const Trigger of Config.on) {
      const Matching = this.#filterByTrigger(Trigger, ScopedIds, ChangeSet)
      if (Matching.length > 0) {
        Results.push({ Trigger, EntryIds:Matching })
      }
    }
    return Results
  }

/**** #filterByTrigger — returns the entry IDs that satisfy the given trigger ****/

  #filterByTrigger (
    Trigger:TriggerSpec, Ids:string[], ChangeSet:SDS_ChangeSet
  ):string[] {
    switch (Trigger.Kind) {

      case 'change':
        // any entry with any change qualifies
        return Ids

      case 'create':
        // entry was moved into a non-trash container (outerItem changed,
        // and the entry is not currently in trash or lost-and-found)
        return Ids.filter((Id) => {
          const EntryChanges = ChangeSet[Id]
          if (! EntryChanges?.has('outerItem')) { return false }
          const Entry = this.#Store.EntryWithId(Id)
          if (Entry == null) { return false }
          const OuterId = Entry.outerItemId
          return (OuterId != null) && (OuterId !== TrashId)
        })

      case 'delete':
        // entry was moved to trash (outerItem changed and is now TrashId),
        // or entry no longer exists (purged)
        return Ids.filter((Id) => {
          const EntryChanges = ChangeSet[Id]
          if (! EntryChanges?.has('outerItem')) { return false }
          const Entry = this.#Store.EntryWithId(Id)
          if (Entry == null) { return true }    // purged
          return Entry.outerItemId === TrashId
        })

      case 'value': {
        if (Trigger.MIMEGlob == null) {
          // any value change
          return Ids.filter((Id) => ChangeSet[Id]?.has('Value'))
        }
        // MIME-type-filtered value change
        return Ids.filter((Id) => {
          if (! ChangeSet[Id]?.has('Value')) { return false }
          const Entry = this.#Store.EntryWithId(Id)
          if (Entry == null || ! Entry.isItem) { return false }
          const Item = Entry as import('@rozek/sds-core').SDS_Item
          return matchesMIMEGlob(Item.Type, Trigger.MIMEGlob!)
        })
      }

      case 'info': {
        // Info.<key> changed to the expected value
        const ChangeKey = `Info.${Trigger.Key}`
        return Ids.filter((Id) => {
          if (! ChangeSet[Id]?.has(ChangeKey)) { return false }
          const Entry = this.#Store.EntryWithId(Id)
          if (Entry == null) { return false }
          const CurrentValue = Entry.Info[Trigger.Key]
          // compare as string (the TriggerSpec value is always a string)
          return String(CurrentValue) === Trigger.Value
        })
      }

      default: return []
    }
  }

/**** #resolveWatch — verifies that the watch UUID exists in the store ****/

  // Note: only direct UUIDs are supported; link targets are NOT automatically
  // included in the watched subtree even if they are linked from within it.
  #resolveWatch (WatchId:string):string | undefined {
    return this.#Store.EntryWithId(WatchId) != null ? WatchId : undefined
  }

/**** #isInWatchedSubtree — true when EntryId is inside WatchId at depth <= MaxDepth ****/

  #isInWatchedSubtree (EntryId:string, WatchId:string, MaxDepth:number):boolean {
    if (EntryId === WatchId) { return true }

    // outerItemChain walks from the immediate parent up to root
    const Entry = this.#Store.EntryWithId(EntryId)
    if (Entry == null) { return false }

    const Chain = Entry.outerItemChain
    for (let Depth = 0; Depth < Chain.length; Depth++) {
      if (Chain[Depth].Id === WatchId) {
        // depth 1 = direct child; check against MaxDepth
        return (Depth+1) <= MaxDepth
      }
    }
    return false
  }

/**** #fireWebHook — sends an HTTP POST with the JSON payload and bearer token ****/

  async #fireWebHook (URL:string, Payload:WebHookPayload):Promise<void> {
    const Headers:Record<string,string> = {
      'Content-Type': 'application/json',
    }
    if (this.#WebHookToken != null) {
      Headers['Authorization'] = `Bearer ${this.#WebHookToken}`
    }
    try {
      const Response = await fetch(URL, {
        method:  'POST',
        headers: Headers,
        body:    JSON.stringify(Payload),
        signal:  AbortSignal.timeout(WebHookTimeout),
      })
      if (! Response.ok) {
        process.stderr.write(
          `[sds-sidecar] webhook ${URL} returned ${Response.status} ${Response.statusText}\n`
        )
      }
    } catch (Signal) {
      process.stderr.write(
        `[sds-sidecar] webhook ${URL} failed: ${(Signal as Error).message}\n`
      )
    }
  }
}

/**** triggerLabel — returns a human-readable string for a TriggerSpec ****/

  function triggerLabel (Trigger:TriggerSpec):string {
    switch (Trigger.Kind) {
      case 'change': return 'change'
      case 'create': return 'create'
      case 'delete': return 'delete'
      case 'value':  return Trigger.MIMEGlob != null ? `value:${Trigger.MIMEGlob}` : 'value'
      case 'info':   return `info:${Trigger.Key}=${Trigger.Value}`
    }
  }
