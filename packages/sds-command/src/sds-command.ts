/*******************************************************************************
*                                                                              *
*                             SDS Command CLI                                  *
*                                                                              *
*******************************************************************************/

// entry point for the `sds` CLI tool; builds the commander program, registers
// all sub-commands, and dispatches to REPL or script runner when appropriate

import { Command } from 'commander'

import { resolveConfig }     from './Config.js'
import { printError }        from './Output.js'
import { ExitCodes }         from './ExitCodes.js'
import { SDS_CommandError }  from './StoreAccess.js'
import { extractInfoEntries } from './InfoParser.js'
import { startREPL }         from './REPL.js'
import { runScript }         from './ScriptRunner.js'

import pkg from '../package.json'

import { registerTokenCommands } from './commands/TokenCmd.js'
import { registerStoreCommands } from './commands/StoreCmd.js'
import { registerEntryCommands } from './commands/EntryCmd.js'
import { registerItemCommands }  from './commands/ItemCmd.js'
import { registerLinkCommands }  from './commands/LinkCmd.js'
import { registerTrashCommands } from './commands/TrashCmd.js'
import { registerTreeCommands }  from './commands/TreeCmd.js'

//----------------------------------------------------------------------------//
//                             buildProgram                                   //
//----------------------------------------------------------------------------//

/**** buildProgram — constructs a fully configured commander Command ****/

function buildProgram (ExtraArgv:string[]):Command {
  const Program = new Command('sds')
    Program
      .description('shareable-data-store CLI')
      .version(pkg.version, '--version', 'print version')
      .allowUnknownOption(false)

      // global options — available on every sub-command via optsWithGlobals()
      .option('--server <url>',       'WebSocket server URL (env: SDS_SERVER_URL)')
      .option('--store <id>',         'store identifier (env: SDS_STORE_ID)')
      .option('--token <jwt>',        'client JWT — read/write (env: SDS_TOKEN)')
      .option('--admin-token <jwt>',  'admin JWT (env: SDS_ADMIN_TOKEN)')
      .option('--data-dir <path>',    'directory for local SQLite files (env: SDS_DATA_DIR)')
      .option('--format <fmt>',       'output format: text | json (default: text)')
      .option('--on-error <action>',  'error mode: stop | continue | ask (default: stop)')

  registerTokenCommands(Program)
  registerStoreCommands(Program)
  registerEntryCommands(Program, ExtraArgv)
  registerItemCommands(Program, ExtraArgv)
  registerLinkCommands(Program, ExtraArgv)
  registerTrashCommands(Program)
  registerTreeCommands(Program)

/**** shell — interactive REPL ****/

  Program.command('shell')
    .description('start an interactive REPL (also started when sds is called with no arguments)')
    .action(async (_Options, SubCommand) => {
      const Config = resolveConfig(SubCommand.optsWithGlobals())
      await startREPL((Tokens) => executeTokens(Tokens, Config))
    })

  // root action: --script runner or REPL when no sub-command is given
  Program
    .option('--script <file>', 'run commands from file (use - for stdin)')
    .action(async (Options) => {
      const Config = resolveConfig(Options)
      if (Options.script != null) {
        const Code = await runScript(Config, Options.script, executeTokens)
        process.exit(Code)
      } else {
        await startREPL((Tokens) => executeTokens(Tokens, Config))
      }
    })

  return Program
}

//----------------------------------------------------------------------------//
//                             executeTokens                                  //
//----------------------------------------------------------------------------//

/**** executeTokens — parses and executes a token array as an sds command ****/

async function executeTokens (
  Tokens:string[], Config?:import('./Config.js').SDSConfig
):Promise<number> {
  if (Tokens.length === 0) { return ExitCodes.OK }

  // extract --info.xxx options before handing off to commander
  const { CleanArgv, InfoEntries } = extractInfoEntries(Tokens)

  const Program = buildProgram(
    Object.entries(InfoEntries).flatMap(([Key, Value]) => [
      `--info.${Key}`, JSON.stringify(Value),
    ])
  )
  Program.exitOverride()

  try {
    await Program.parseAsync(['node', 'sds', ...CleanArgv])
    return ExitCodes.OK
  } catch (Signal:unknown) {
    const CommanderError = Signal as { code?:string; message:string; exitCode?:number }

    // commander's own exit events — not real errors
    if (
      (CommanderError.code === 'commander.helpDisplayed') ||
      (CommanderError.code === 'commander.version')
    ) { return ExitCodes.OK }

    if (CommanderError.code === 'commander.unknownCommand') {
      process.stderr.write(`sds: unknown command '${CleanArgv[0]}' — try 'sds help'\n`)
      return ExitCodes.UsageError
    }

    if (
      (CommanderError.code === 'commander.unknownOption') ||
      (CommanderError.code === 'commander.missingArgument') ||
      (CommanderError.code === 'commander.missingMandatoryOptionValue')
    ) {
      process.stderr.write(`sds: ${CommanderError.message}\n`)
      return ExitCodes.UsageError
    }

    if (Signal instanceof SDS_CommandError) {
      const OutputConfig = Config ?? { Format:'text' as const, OnError:'stop' as const, DataDir:'' }
      printError(OutputConfig, Signal.message, Signal.ExitCode)
      return Signal.ExitCode
    }

    // unexpected error
    const OutputConfig = Config ?? { Format:'text' as const, OnError:'stop' as const, DataDir:'' }
    printError(OutputConfig, (Signal as Error).message ?? String(Signal))
    return ExitCodes.GeneralError
  }
}

//----------------------------------------------------------------------------//
//                                  main                                      //
//----------------------------------------------------------------------------//

/**** main — CLI entry point ****/

async function main ():Promise<void> {
  // strip --info.xxx options before commander sees them; keep them for
  // later injection into sub-command handlers via buildProgram(ExtraArgv)
  const { CleanArgv, InfoEntries } = extractInfoEntries(process.argv.slice(2))

  const ExtraArgv = Object.entries(InfoEntries).flatMap(([Key, Value]) => [
    `--info.${Key}`, JSON.stringify(Value),
  ])

  const Program = buildProgram(ExtraArgv)
  Program.exitOverride()

  try {
    await Program.parseAsync(['node', 'sds', ...CleanArgv])
  } catch (Signal:unknown) {
    const CommanderError = Signal as { code?:string; message:string; exitCode?:number }

    if (
      (CommanderError.code === 'commander.helpDisplayed') ||
      (CommanderError.code === 'commander.version')
    ) { process.exit(ExitCodes.OK) }

    if (
      (CommanderError.code === 'commander.unknownCommand') ||
      (CommanderError.code === 'commander.unknownOption') ||
      (CommanderError.code === 'commander.missingArgument') ||
      (CommanderError.code === 'commander.missingMandatoryOptionValue')
    ) {
      process.stderr.write(`sds: ${CommanderError.message}\n`)
      process.exit(ExitCodes.UsageError)
    }

    if (Signal instanceof SDS_CommandError) {
      const Config = resolveConfig({})
      printError(Config, Signal.message, Signal.ExitCode)
      process.exit(Signal.ExitCode)
    }

    const Config = resolveConfig({})
    printError(Config, (Signal as Error).message ?? String(Signal))
    process.exit(ExitCodes.GeneralError)
  }
}

// run CLI when this module is executed directly
if (
  (typeof process !== 'undefined') &&
  (process.argv[1] != null) &&
  (process.argv[1].endsWith('sds-command.js') || process.argv[1].endsWith('/sds'))
) {
  main().catch((Signal) => {
    process.stderr.write(`sds: fatal: ${(Signal as Error).message ?? Signal}\n`)
    process.exit(ExitCodes.GeneralError)
  })
}

