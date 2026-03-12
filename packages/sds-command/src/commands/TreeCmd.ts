/*******************************************************************************
*                                                                              *
*                                TreeCmd                                       *
*                                                                              *
*******************************************************************************/

// tree show — visual tree of the entire store

import type { Command } from 'commander'
import { RootId, TrashId, LostAndFoundId } from '@rozek/sds-core'

import { resolveConfig, type SDSConfig }  from '../Config.js'
import { printResult, printLine, TreeLines, type TreeNode } from '../Output.js'
import { loadContext, closeContext, parseIntOption } from '../StoreAccess.js'

//----------------------------------------------------------------------------//
//                            registerTreeCommands                            //
//----------------------------------------------------------------------------//

/**** registerTreeCommands — attaches the `tree` sub-tree to Program ****/

export function registerTreeCommands (Program:Command):void {
  const TreeCmd = Program.command('tree')
    .description('tree display')

/**** tree show ****/

  TreeCmd.command('show')
    .description('display the store tree')
    .option('--depth <n>', 'maximum display depth (default: unlimited)')
    .action(async (Options, SubCommand) => {
      const Config:SDSConfig = resolveConfig(SubCommand.optsWithGlobals())
      const MaxDepth = Options.depth != null ? parseIntOption(Options.depth, '--depth') : Infinity
      await cmdTreeShow(Config, MaxDepth)
    })
}

//----------------------------------------------------------------------------//
//                           command implementations                          //
//----------------------------------------------------------------------------//

/**** cmdTreeShow ****/

async function cmdTreeShow (Config:SDSConfig, MaxDepth:number):Promise<void> {
  const Context = await loadContext(Config)
  try {
    if (Config.Format === 'json') {
      const Tree = buildTreeNodes(Context.Store, RootId, MaxDepth, 0)
      printResult(Config, { root:Tree })
    } else {
      printLine('root/')
      const Nodes = buildTreeNodes(Context.Store, RootId, MaxDepth, 0)
      for (let NodeIdx = 0; NodeIdx < Nodes.length; NodeIdx++) {
        const Node   = Nodes[NodeIdx]
        const IsLast = NodeIdx === Nodes.length-1
        const Lines  = TreeLines(
          Node.Id, Node.Label, Node.Kind, Node.TargetId,
          Node.Children, '', IsLast
        )
        for (const Line of Lines) { printLine(Line) }
      }
      if (Nodes.length === 0) { printLine('  (empty)') }
    }
  } finally {
    await closeContext(Context)
  }
}

/**** buildTreeNodes — recursive conversion of store entries to TreeNode ****/

const SystemTreeIds = new Set([ TrashId, LostAndFoundId ])

function buildTreeNodes (
  Store:import('@rozek/sds-core').SDS_DataStore,
  ItemId:string, MaxDepth:number, Depth:number
):TreeNode[] {
  if (Depth >= MaxDepth) { return [] }

  const Result:TreeNode[] = []
  for (const Entry of Store._innerEntriesOf(ItemId)) {
    if (SystemTreeIds.has(Entry.Id)) { continue }  // hide system containers from tree output
    const Kind     = Entry.isItem ? 'item' as const : 'link' as const
    const TargetId = Entry.isLink ? Store._TargetOf(Entry.Id).Id : undefined
    const Children = (Entry.isItem && (Depth+1 < MaxDepth))
      ? buildTreeNodes(Store, Entry.Id, MaxDepth, Depth+1)
      : []
    Result.push({ Id:Entry.Id, Kind, Label:Entry.Label, TargetId, Children })
  }
  return Result
}
