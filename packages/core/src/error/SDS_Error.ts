/*******************************************************************************
*                                                                              *
*                                  SDS_Error                                   *
*                                                                              *
*******************************************************************************/

export class SDS_Error extends Error {
  readonly Code:string

  constructor (Code:string, Message:string) {
    super(Message)
    this.Code = Code
    this.name = 'SDS_Error'
  }
}
