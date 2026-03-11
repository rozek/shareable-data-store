/*******************************************************************************
*                                                                              *
*                             SDS Command CLI                                  *
*                                                                              *
*******************************************************************************/

// entry point for the `sds` CLI tool; builds the commander program, registers
// all sub-commands, and dispatches to REPL or script runner when appropriate

import { Command } from 'commander'

import { resolveConfig, SDS_ConfigError } from './Config.js'
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
import { registerTrashCommands } from './commands/TrashCmd.js'
import { registerTreeCommands }  from './commands/TreeCmd.js'

//----------------------------------------------------------------------------//
//                             buildProgram                                   //
//----------------------------------------------------------------------------//

/**** buildProgram — constructs a fully configured commander Command ****/

// isSubContext = true  → REPL / script runner: skip `shell` command and the
//                        root action so that process.exit() can never be called
//                        from within those contexts
// isSubContext = false → full top-level CLI (default)

function buildProgram (ExtraArgv:string[], isSubContext:boolean = false):Command {
  const Program = new Command('sds')
    Program
      .description('shareable-data-store CLI')
      .version(pkg.version, '--version', 'print version')
      .allowUnknownOption(false)
      // suppress Commander's own error writing — we handle it ourselves so that
      // the error message always appears before any help text
      .configureOutput({ writeErr: () => {} })

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
  registerTrashCommands(Program)
  registerTreeCommands(Program)

  // `shell` and the root action are only available at the top-level CLI.
  // In REPL / script sub-executions (isSubContext = true) they are omitted so
  // that (a) the help output does not offer a `shell` sub-shell, and (b) no
  // process.exit() call can ever escape from within executeTokens.
  if (! isSubContext) {

/**** shell — interactive REPL ****/

    Program.command('shell')
      .description('start an interactive REPL')
      .action(async (_Options, SubCommand) => {
        const Config = resolveConfig(SubCommand.optsWithGlobals())
        await startREPL((Tokens) => executeTokens(Tokens, Config))
      })

    Program
      .option('--script <file>', 'run commands from file (use - for stdin)')
      .action(async (Options) => {
        const Config = resolveConfig(Options)
        if (Options.script != null) {
          const Code = await runScript(Config, Options.script, executeTokens)
          process.exit(Code)
        } else {
          process.stdout.write(Program.helpInformation())
          process.exit(ExitCodes.OK)
        }
      })

  }

  return Program
}

//----------------------------------------------------------------------------//
//                            applyExitOverride                               //
//----------------------------------------------------------------------------//

/**** applyExitOverride — recursively arms exitOverride and silences writeErr ****/

function applyExitOverride (Cmd:Command):void {
  Cmd.exitOverride()
  Cmd.configureOutput({ writeErr: () => {} })
  for (const SubCmd of Cmd.commands) {
    applyExitOverride(SubCmd)
  }
}

//----------------------------------------------------------------------------//
//                             executeTokens                                  //
//----------------------------------------------------------------------------//

/**** configToGlobalTokens — rebuilds global CLI tokens from a resolved Config ****/

function configToGlobalTokens (
  Config:import('./Config.js').SDSConfig
):string[] {
  const Tokens:string[] = []
  if (Config.ServerURL   != null) { Tokens.push('--server',      Config.ServerURL) }
  if (Config.StoreId     != null) { Tokens.push('--store',       Config.StoreId) }
  if (Config.Token       != null) { Tokens.push('--token',       Config.Token) }
  if (Config.AdminToken  != null) { Tokens.push('--admin-token', Config.AdminToken) }
  Tokens.push('--data-dir', Config.DataDir)
  if (Config.Format !== 'text')   { Tokens.push('--format', Config.Format) }
  return Tokens
}

/**** executeTokens — parses and executes a token array as an sds command ****/

async function executeTokens (
  Tokens:string[], Config?:import('./Config.js').SDSConfig
):Promise<number> {
  if (Tokens.length === 0) { return ExitCodes.OK }

  // extract --info.<key> options before handing off to commander
  const { CleanArgv, InfoEntries } = extractInfoEntries(Tokens)

  // prepend global options from Config so that REPL/script lines inherit
  // the same store, data-dir, token, etc. as the outer invocation
  const GlobalTokens = (Config != null) ? configToGlobalTokens(Config) : []

  const Program = buildProgram(
    Object.entries(InfoEntries).flatMap(([Key, Value]) => [
      `--info.${Key}`, JSON.stringify(Value),
    ]),
    true  // isSubContext: skip shell + root action so process.exit() can never fire
  )
  applyExitOverride(Program)

  try {
    await Program.parseAsync(['node', 'sds', ...GlobalTokens, ...CleanArgv])
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

    if (Signal instanceof SDS_ConfigError) {
      process.stderr.write(`sds: ${Signal.message}\n`)
      return Signal.ExitCode
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
  // strip --info.<key> options before commander sees them; keep them for
  // later injection into sub-command handlers via buildProgram(ExtraArgv)
  const { CleanArgv, InfoEntries } = extractInfoEntries(process.argv.slice(2))

  const ExtraArgv = Object.entries(InfoEntries).flatMap(([Key, Value]) => [
    `--info.${Key}`, JSON.stringify(Value),
  ])

  const Program = buildProgram(ExtraArgv)
  applyExitOverride(Program)

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
      // error message first, then help — so the mistake is visible at the top
      process.stderr.write(`sds: ${CommanderError.message}\n\n`)
      process.stderr.write(Program.helpInformation())
      process.exit(ExitCodes.UsageError)
    }

    if (Signal instanceof SDS_ConfigError) {
      process.stderr.write(`sds: ${Signal.message}\n`)
      process.exit(Signal.ExitCode)
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

