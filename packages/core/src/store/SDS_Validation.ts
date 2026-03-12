/*******************************************************************************
*                                                                              *
*            SDS Store — shared validation functions for all backends          *
*                                                                              *
*******************************************************************************/

// these four functions enforce the same constraints on user-supplied strings
// and metadata values in every backend. Internally they use zod schemas so
// that constraint declarations are declarative and DRY; externally they always
// throw SDS_Error('invalid-argument', …) so callers never need to handle
// ZodError.

import { z } from 'zod'
import { SDS_Error } from '../error/SDS_Error.js'
import {
  maxLabelLength, maxMIMETypeLength, maxInfoKeyLength, maxInfoValueSize,
} from './SDS_Constants.js'

/**** parseOrThrow — parse value with schema; re-throw as SDS_Error on failure ****/

  function parseOrThrow<T> (Schema:z.ZodType<T>, Value:unknown):T {
    const Result = Schema.safeParse(Value)
    if (Result.success) { return Result.data }
    const Msg = Result.error.issues[0]?.message ?? 'invalid argument'
    throw new SDS_Error('invalid-argument', Msg)
  }

/**** schemas ****/

  const LabelSchema = z.string({
    invalid_type_error: 'Label must be a string',
  }).max(maxLabelLength, `Label must not exceed ${maxLabelLength} characters`)

  const MIMETypeSchema = z.string({
    invalid_type_error: 'MIMEType must be a non-empty string',
  }).min(1, 'MIMEType must be a non-empty string')
    .max(maxMIMETypeLength, `MIMEType must not exceed ${maxMIMETypeLength} characters`)

  const InfoKeySchema = z.string({
    invalid_type_error: 'Info key must be a string',
  }).min(1, 'Info key must not be empty')
    .max(maxInfoKeyLength, `Info key must not exceed ${maxInfoKeyLength} characters`)

  const InfoValueSchema = z.unknown().superRefine((Value,Context) => {
    let serializedValue:string | undefined
    try { serializedValue = JSON.stringify(Value) } catch {
      Context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Info value must be JSON-serialisable',
      })
      return
    }
    if (serializedValue === undefined) {
      // JSON.stringify returns undefined (without throwing) for functions and symbols
      Context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Info value must be JSON-serialisable',
      })
      return
    }
    if (new TextEncoder().encode(serializedValue).length > maxInfoValueSize) {
      Context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Info value must not exceed ${maxInfoValueSize} bytes when serialised as UTF-8 JSON`,
      })
    }
  })

/**** validateLabel — throw if label is not a string or exceeds maxLabelLength ****/

  export function validateLabel (Value:unknown):void { parseOrThrow(LabelSchema,    Value) }

/**** validateMIMEType — throw if MIMEType is not a non-empty string or exceeds maxMIMETypeLength ****/

  export function validateMIMEType (Value:unknown):void { parseOrThrow(MIMETypeSchema, Value) }

/**** validateInfoKey — throw if Info key is empty or exceeds maxInfoKeyLength ****/

  export function validateInfoKey (Key:unknown):void { parseOrThrow(InfoKeySchema, Key) }

/**** validateInfoValue — throw if Info value is not JSON-serialisable or exceeds maxInfoValueSize ****/

  export function validateInfoValue (Value:unknown):void { parseOrThrow(InfoValueSchema, Value) }
