/*******************************************************************************
*                                                                              *
*                                 ExitCodes                                    *
*                                                                              *
*******************************************************************************/

// standard-conform exit codes; machine-readable by scripts and process managers

  export const ExitCodes = {
    OK:           0,   // success (clean shutdown)
    GeneralError: 1,   // unspecified runtime error
    UsageError:   2,   // bad arguments or missing required option
    NotFound:     3,   // store or config file not found
    Unauthorized: 4,   // server rejected the token (close code 4001)
    NetworkError: 5,   // WebSocket or HTTP connection error
    Forbidden:    6,   // token valid but store access denied (close code 4003)
  } as const

  export type ExitCode = typeof ExitCodes[keyof typeof ExitCodes]
