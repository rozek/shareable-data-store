/*******************************************************************************
*                                                                              *
*                              ScriptRunner                                    *
*                                                                              *
*******************************************************************************/

// executes a batch of SDS commands read from a file or stdin;
// honours the --on-error mode for line-by-line error handling

import fs       from 'node:fs/promises'
import readline from 'node:readline'
import { tokenizeLine }     from './CommandTokenizer.js'
import type { SDSConfig }   from './Config.js'
import { SDS_CommandError } from './StoreAccess.js'
import { ExitCodes }        from './ExitCodes.js'

//----------------------------------------------------------------------------//
//                               runScript                                    //
//----------------------------------------------------------------------------//

/**** runScript — reads and executes commands from a file or stdin ****/

export async function runScript (
  Config:SDSConfig,
  ScriptPath:string,
  executeCommand:(Tokens:string[], Config:SDSConfig) => Promise<number>
):Promise<number> {
  let InputStream:NodeJS.ReadableStream
  if (ScriptPath === '-') {
    InputStream = process.stdin
  } else {
    try {
      const FileHandle = await fs.open(ScriptPath)
      InputStream = FileHandle.createReadStream()
    } catch {
      throw new SDS_CommandError(
        `cannot open script file '${ScriptPath}'`, ExitCodes.NotFound
      )
    }
  }

  const LineReader = readline.createInterface({
    input:    InputStream,
    terminal: false,
  })

  let LastExitCode = 0

  for await (const rawLine of LineReader) {
    const Line = rawLine.trim()
    if ((Line === '') || Line.startsWith('#')) { continue }

    const Tokens = tokenizeLine(Line)
    if (Tokens.length === 0) { continue }

    let ExitCode = 0
    try {
      ExitCode = await executeCommand(Tokens, Config)
    } catch (Signal) {
      ExitCode = 1
      process.stderr.write(`sds: ${(Signal as Error).message}\n`)
    }

    if (ExitCode !== 0) {
      LastExitCode = ExitCode

      switch (Config.OnError) {
        case 'stop':     LineReader.close(); return ExitCode
        case 'continue': break              // keep executing
        case 'ask':      {
          const shouldContinue = await askContinue()
          if (! shouldContinue) { LineReader.close(); return ExitCode }
          break
        }
      }
    }
  }

  LineReader.close()
  return LastExitCode
}

//----------------------------------------------------------------------------//
//                               askContinue                                  //
//----------------------------------------------------------------------------//

/**** askContinue — prompts the user whether to continue after an error ****/

async function askContinue ():Promise<boolean> {
  const isTTY = process.stdin.isTTY
  if (! isTTY) { return false } // non-interactive: treat as stop

  return new Promise<boolean>((resolve) => {
    const PromptInterface = readline.createInterface({ input:process.stdin, output:process.stdout })
    PromptInterface.question('error — continue? [y/N] ', (Answer) => {
      PromptInterface.close()
      resolve(Answer.trim().toLowerCase() === 'y')
    })
  })
}
