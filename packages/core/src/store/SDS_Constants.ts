/*******************************************************************************
*                                                                              *
*                            SDS Store — Constants                             *
*                                                                              *
*******************************************************************************/

/**** well-known fixed UUIDs for the three root containers ****/

  export const RootId         = '00000000-0000-4000-8000-000000000000'
  export const TrashId        = '00000000-0000-4000-8000-000000000001'
  export const LostAndFoundId = '00000000-0000-4000-8000-000000000002'

/**** Store-wide defaults, shared by all backend implementations ****/

  export const DefaultMIMEType         = 'text/plain'
  export const DefaultLiteralSizeLimit = 131072  // 128 Ki UTF-16 code units
  export const DefaultBinarySizeLimit  = 2048    // 2 KB inline threshold
  export const DefaultWrapperCacheSize = 5000

/**** Validation limits for user-supplied strings and metadata ****/

  export const maxLabelLength    = 1024       // Unicode code points
  export const maxMIMETypeLength = 256        // characters
  export const maxInfoKeyLength  = 1024       // Unicode code points
  export const maxInfoValueSize  = 262_144    // bytes (JSON-encoded, UTF-8) — 256 Ki

/****  OrderKey management ****/

  export const maxOrderKeyLength = 200  // rebalance trigger: auto-rebalance when a generated key exceeds this length
