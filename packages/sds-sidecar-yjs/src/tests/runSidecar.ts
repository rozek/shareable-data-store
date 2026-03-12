/*******************************************************************************
*                                                                              *
*                      integration test sidecar helper                         *
*                                                                              *
*******************************************************************************/

// spawns the built sds-sidecar-yjs binary and captures stdout, stderr, and exit code

import { spawn }         from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path              from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BinPath   = path.resolve(__dirname, '../../dist/sds-sidecar-yjs.js')

//----------------------------------------------------------------------------//
//                                 CLIResult                                  //
//----------------------------------------------------------------------------//

export interface CLIResult {
  Stdout:   string
  Stderr:   string
  ExitCode: number
}

//----------------------------------------------------------------------------//
//                               runSidecar                                   //
//----------------------------------------------------------------------------//

/**** runSidecar — spawns the sds-sidecar-yjs binary with given args and env ****/

export async function runSidecar (
  Args:string[],
  Env?:Record<string,string|undefined>
):Promise<CLIResult> {
  return new Promise((resolve) => {
    const Proc = spawn(process.execPath, [BinPath, ...Args], {
      env: { ...process.env, NODE_OPTIONS:'--no-warnings', ...Env },
    })

    let Stdout = ''
    let Stderr = ''

    Proc.stdout.on('data', (Chunk:Buffer) => { Stdout += Chunk.toString() })
    Proc.stderr.on('data', (Chunk:Buffer) => { Stderr += Chunk.toString() })

    Proc.stdin.end()

    Proc.on('close', (Code) => {
      resolve({ Stdout:Stdout.trim(), Stderr:Stderr.trim(), ExitCode:Code ?? 1 })
    })
  })
}
