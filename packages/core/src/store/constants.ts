/*******************************************************************************
*                                                                              *
*                            SNS Store — Constants                             *
*                                                                              *
*******************************************************************************/

// well-known fixed UUIDs for the three root containers

export const RootId         = '00000000-0000-4000-8000-000000000000'
export const TrashId        = '00000000-0000-4000-8000-000000000001'
export const LostAndFoundId = '00000000-0000-4000-8000-000000000002'

// Store-wide defaults, shared by all backend implementations

export const DefaultMIMEType         = 'text/plain'
export const DefaultLiteralSizeLimit = 131072  // 128 Ki UTF-16 code units
export const DefaultBinarySizeLimit  = 2048    // 2 KB inline threshold
export const DefaultWrapperCacheSize = 5000
