/*******************************************************************************
*                                                                              *
*                        integration test CLI helper                           *
*                                                                              *
*******************************************************************************/

// spawns the built sds binary and captures stdout, stderr, and exit code

import { spawn }         from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path              from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BinPath   = path.resolve(__dirname, '../../dist/sds-command-jj.js')

//----------------------------------------------------------------------------//
//                                 CLIResult                                  //
//----------------------------------------------------------------------------//

export interface CLIResult {
  Stdout:   string
  Stderr:   string
  ExitCode: number
}

//----------------------------------------------------------------------------//
//                                  runCLI                                    //
//----------------------------------------------------------------------------//

/**** runCLI — spawns the sds binary; optionally pipes StdinData to its stdin ****/

export async function runCLI (
  Args:string[],
  Env?:Record<string,string|undefined>,
  StdinData?:string
):Promise<CLIResult> {
  return new Promise((resolve) => {
    const Proc = spawn(process.execPath, [BinPath, ...Args], {
      env: { ...process.env, NODE_OPTIONS:'--no-warnings', ...Env },
    })

    let Stdout = ''
    let Stderr = ''

    Proc.stdout.on('data', (Chunk:Buffer) => { Stdout += Chunk.toString() })
    Proc.stderr.on('data', (Chunk:Buffer) => { Stderr += Chunk.toString() })

    if (StdinData != null) { Proc.stdin.write(StdinData) }
    Proc.stdin.end()

    Proc.on('close', (Code) => {
      resolve({ Stdout:Stdout.trim(), Stderr:Stderr.trim(), ExitCode:Code ?? 1 })
    })
  })
}
