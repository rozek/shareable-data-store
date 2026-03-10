/*******************************************************************************
*                                                                              *
*                                 ExitCodes                                    *
*                                                                              *
*******************************************************************************/

// standard-conform exit codes; machine-readable by scripts and AI consumers

//----------------------------------------------------------------------------//
//                                 ExitCodes                                  //
//----------------------------------------------------------------------------//

export const ExitCodes = {
  OK:           0,   // success
  GeneralError: 1,   // unspecified runtime error
  UsageError:   2,   // bad arguments or missing required option
  NotFound:     3,   // entry, store, or file not found
  Unauthorized: 4,   // authentication failed (missing or invalid token)
  NetworkError: 5,   // WebSocket or HTTP connection error
  Forbidden:    6,   // operation not permitted for this scope
} as const

export type ExitCode = typeof ExitCodes[keyof typeof ExitCodes]
