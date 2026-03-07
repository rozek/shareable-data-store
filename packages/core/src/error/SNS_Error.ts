/*******************************************************************************
*                                                                              *
*                                  SNS_Error                                   *
*                                                                              *
*******************************************************************************/

export class SNS_Error extends Error {
  readonly Code:string

  constructor (Code:string, Message:string) {
    super(Message)
    this.Code = Code
    this.name = 'SNS_Error'
  }
}
