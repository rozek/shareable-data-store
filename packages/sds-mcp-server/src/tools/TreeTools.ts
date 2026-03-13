/*******************************************************************************
*                                                                              *
*                               TreeTools                                      *
*                                                                              *
*******************************************************************************/

// MCP tool definition and handler for tree display: sds_tree_show

import type { Tool }       from '@modelcontextprotocol/sdk/types.js'
import { RootId } from '@rozek/sds-core'

import { configFrom }    from '../Config.js'
import { MCP_ToolError } from '../Errors.js'
import { loadContext, closeContext, type BatchSession } from '../StoreAccess.js'

//----------------------------------------------------------------------------//
//                            tool definitions                                //
//----------------------------------------------------------------------------//

export const TreeToolDefs:Tool[] = [

/**** sds_tree_show ****/

  {
    name:        'sds_tree_show',
    description: 'return the entire store as a nested tree structure starting from root',
    inputSchema: {
      type: 'object',
      properties: {
        StoreId: { type:'string',  description:'store identifier' },
        PersistenceDir: { type:'string',  description:'local database directory (default: ~/.sds)' },
        Depth:   { type:'integer', description:'maximum number of levels to include (default: unlimited)' },
      },
      required: [ 'StoreId' ],
    },
  },

]

//----------------------------------------------------------------------------//
//                           standalone handlers                              //
//----------------------------------------------------------------------------//

export type TreeToolHandler = (Params:Record<string,unknown>) => Promise<unknown>

export const TreeToolHandlers:Record<string,TreeToolHandler> = {

  'sds_tree_show': async (Params) => {
    const Config   = configFrom(Params)
    const MaxDepth = resolveDepth(Params)
    const Context  = await loadContext(Config)
    try {
      return coreTreeShow(Context.Store, MaxDepth)
    } finally {
      await closeContext(Context)
    }
  },

}

//----------------------------------------------------------------------------//
//                            batch step handlers                             //
//----------------------------------------------------------------------------//

export type TreeBatchStepFn = (Session:BatchSession, Params:Record<string,unknown>) => Promise<unknown>

export const TreeBatchStepHandlers:Record<string,TreeBatchStepFn> = {
  'sds_tree_show': async (Session, Params) => {
    const MaxDepth = resolveDepth(Params)
    return coreTreeShow(Session.Store, MaxDepth)
  },
}

//----------------------------------------------------------------------------//
//                           core implementations                             //
//----------------------------------------------------------------------------//

import type { SDS_DataStore } from '@rozek/sds-core'

/**** TreeNode — discriminated union: item nodes carry innerEntries, link nodes carry TargetId ****/

export type TreeNode =
  | { Id:string; Kind:'item'; Label:string; innerEntries:TreeNode[] }
  | { Id:string; Kind:'link'; Label:string; TargetId:string         }

/**** coreTreeShow ****/

function coreTreeShow (Store:SDS_DataStore, MaxDepth:number):object {
  return { Root:buildTreeNodes(Store, RootId, MaxDepth, 0) }
}

/**** buildTreeNodes — recursive conversion of store entries to TreeNode ****/

function buildTreeNodes (
  Store:SDS_DataStore, ItemId:string, MaxDepth:number, Depth:number
):TreeNode[] {
  if (Depth >= MaxDepth) { return [] }

  const Result:TreeNode[] = []
  for (const Entry of Store._innerEntriesOf(ItemId)) {
    if (Entry.isLink) {
      const TargetId = Store._TargetOf(Entry.Id).Id
      Result.push({ Id:Entry.Id, Kind:'link' as const, Label:Entry.Label, TargetId })
    } else {
      const innerEntries = (Depth+1 < MaxDepth)
        ? buildTreeNodes(Store, Entry.Id, MaxDepth, Depth+1)
        : []
      Result.push({ Id:Entry.Id, Kind:'item' as const, Label:Entry.Label, innerEntries })
    }
  }
  return Result
}

//----------------------------------------------------------------------------//
//                              helper utilities                              //
//----------------------------------------------------------------------------//

/**** resolveDepth — validates and returns the Depth parameter ****/

function resolveDepth (Params:Record<string,unknown>):number {
  if (Params['Depth'] == null) { return Infinity }
  const Value = Params['Depth'] as number
  if ((typeof Value !== 'number') || (! Number.isInteger(Value)) || (Value < 0)) {
    throw new MCP_ToolError(`'Depth' must be a non-negative integer — got ${Value}`)
  }
  return Value
}
