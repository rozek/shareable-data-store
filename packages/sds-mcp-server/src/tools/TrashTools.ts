/*******************************************************************************
*                                                                              *
*                               TrashTools                                     *
*                                                                              *
*******************************************************************************/

// MCP tool definitions and handlers for trash operations:
// sds_trash_list, sds_trash_purge_all, sds_trash_purge_expired

import type { Tool }  from '@modelcontextprotocol/sdk/types.js'
import { TrashId }    from '@rozek/sds-core'

import { configFrom }    from '../Config.js'
import { MCP_ToolError } from '../Errors.js'
import { loadContext, closeContext, type BatchSession } from '../StoreAccess.js'

const DefaultTrashTTLms = 30*24*60*60*1000  // 30 days

//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//

export const TrashToolDefs:Tool[] = [

/**** sds_trash_list ****/

  {
    name:        'sds_trash_list',
    description: 'list all entries currently in the trash',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string', description:'store identifier' },
        PersistenceDir: { type:'string', description:'local database directory (default: ~/.sds)' },
        only:    { type:'string', enum:['items','links'], description:'restrict output to items or links only' },
      },
      required: [ 'StoreId' ],
    },
  },

/**** sds_trash_purge_all ****/

  {
    name:        'sds_trash_purge_all',
    description: 'permanently delete every entry in the trash',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string', description:'store identifier' },
        PersistenceDir: { type:'string', description:'local database directory (default: ~/.sds)' },
      },
      required: [ 'StoreId' ],
    },
  },

/**** sds_trash_purge_expired ****/

  {
    name:        'sds_trash_purge_expired',
    description: (
      'permanently delete trash entries older than TTLms milliseconds ' +
      '(default: 30 days)'
    ),
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string',  description:'store identifier' },
        PersistenceDir: { type:'string',  description:'local database directory (default: ~/.sds)' },
        TTLms:   { type:'integer', description:'age threshold in ms — entries older than this are purged (default: 2592000000 = 30 days)' },
      },
      required: [ 'StoreId' ],
    },
  },

]

//----------------------------------------------------------------------------//
//                           standalone handlers                              //
//----------------------------------------------------------------------------//

export type TrashToolHandler = (Params:Record<string,unknown>) => Promise<unknown>

export const TrashToolHandlers:Record<string,TrashToolHandler> = {

  'sds_trash_list': async (Params) => {
    const Config  = configFrom(Params)
    const Context = await loadContext(Config)
    try {
      return coreTrashList(Context.Store, Params)
    } finally {
      await closeContext(Context)
    }
  },

  'sds_trash_purge_all': async (Params) => {
    const Config  = configFrom(Params)
    const Context = await loadContext(Config)
    try {
      return coreTrashPurgeAll(Context.Store)
    } finally {
      await closeContext(Context)
    }
  },

  'sds_trash_purge_expired': async (Params) => {
    const Config  = configFrom(Params)
    const TTLms   = validateTTLms(Params)
    const Context = await loadContext(Config)
    try {
      return coreTrashPurgeExpired(Context.Store, TTLms)
    } finally {
      await closeContext(Context)
    }
  },
}

//----------------------------------------------------------------------------//
//                            batch step handlers                             //
//----------------------------------------------------------------------------//

export type TrashBatchStepFn = (Session:BatchSession, Params:Record<string,unknown>) => Promise<unknown>

export const TrashBatchStepHandlers:Record<string,TrashBatchStepFn> = {
  'sds_trash_list':          async (Session, Params) => coreTrashList(Session.Store, Params),
  'sds_trash_purge_all':     async (Session, _Params) => coreTrashPurgeAll(Session.Store),
  'sds_trash_purge_expired': async (Session, Params) => {
    const TTLms = validateTTLms(Params)
    return coreTrashPurgeExpired(Session.Store, TTLms)
  },
}

//----------------------------------------------------------------------------//
//                           core implementations                             //
//----------------------------------------------------------------------------//

import type { SDS_DataStore } from '@rozek/sds-core'

/**** coreTrashList ****/

function coreTrashList (
  Store:SDS_DataStore, Params:Record<string,unknown>
):unknown[] {
  const RawOnly = (Params['only'] as string | undefined)?.toLowerCase()
  if ((RawOnly != null) && (! ['items','links'].includes(RawOnly))) {
    throw new MCP_ToolError(`'only' must be 'items' or 'links' — got '${Params['only']}'`)
  }

  const TrashItem = Store.TrashItem
  const Entries   = Store._innerEntriesOf(TrashItem.Id)

  return Entries
    .filter((Entry) => {
      if (RawOnly == null) { return true }
      const Kind = Entry.isItem ? 'item' : 'link'
      return RawOnly === Kind+'s'
    })
    .map((Entry) => ({
      Id:    Entry.Id,
      Kind:  Entry.isItem ? 'item' : 'link',
      Label: Entry.Label,
    }))
}

/**** coreTrashPurgeAll ****/

function coreTrashPurgeAll (Store:SDS_DataStore):object {
  const TrashItem = Store.TrashItem
  const Entries   = [ ...Store._innerEntriesOf(TrashItem.Id) ]
  let   Count     = 0

  for (const Entry of Entries) {
    try { Entry.purge(); Count++ } catch { /* skip any protected entry */ }
  }

  return { purged:Count }
}

/**** coreTrashPurgeExpired ****/

function coreTrashPurgeExpired (Store:SDS_DataStore, TTLms:number):object {
  const Count = Store.purgeExpiredTrashEntries(TTLms)
  return { purged:Count, TTLms }
}

//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//

/**** validateTTLms — validates and returns the TTLms parameter ****/

function validateTTLms (Params:Record<string,unknown>):number {
  const Raw = (Params['TTLms'] as number | undefined) ?? DefaultTrashTTLms
  if ((typeof Raw !== 'number') || (! Number.isInteger(Raw)) || (Raw <= 0)) {
    throw new MCP_ToolError(`'TTLms' must be a positive integer — got ${Raw}`)
  }
  return Raw
}
