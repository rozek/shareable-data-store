/*******************************************************************************
*                                                                              *
*                           SNS Store JJ — Constants                           *
*                                                                              *
*******************************************************************************/

export {
  RootId, TrashId, LostAndFoundId,
  DefaultMIMEType, DefaultLiteralSizeLimit,
  DefaultBinarySizeLimit, DefaultWrapperCacheSize,
} from '@rozek/sns-core'

export const CheckpointThreshold = 512*1024  // 512 KB accumulated patches
