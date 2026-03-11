/*******************************************************************************
*                                                                              *
*                                   Output                                     *
*                                                                              *
*******************************************************************************/

// text and JSON output helpers; all writes go through these functions so
// the format switch is always handled in one place

import type { SDSConfig } from './Config.js'

//----------------------------------------------------------------------------//
//                              Output primitives                             //
//----------------------------------------------------------------------------//

/**** printLine — writes one line to stdout ****/

export function printLine (Text:string = ''):void {
  process.stdout.write(Text + '\n')
}

/**** printJSON — pretty-prints a value as JSON to stdout ****/

export function printJSON (Value:unknown):void {
  process.stdout.write(JSON.stringify(Value, null, 2) + '\n')
}

/**** printError — writes a formatted error line to stderr ****/

export function printError (Config:SDSConfig, Message:string, Code?:number):void {
  if (Config.Format === 'json') {
    process.stderr.write(
      JSON.stringify({ error:Message, exitCode:Code ?? 1 }) + '\n'
    )
  } else {
    process.stderr.write(`sds: error: ${Message}\n`)
  }
}

//----------------------------------------------------------------------------//
//                            Structured output                               //
//----------------------------------------------------------------------------//

/**** printResult — prints a command result in the configured format ****/

export function printResult (Config:SDSConfig, Value:unknown):void {
  if (Config.Format === 'json') { printJSON(Value); return }

  switch (true) {
    case (Value == null):             break
    case (typeof Value === 'string'): printLine(Value as string); break
    case (Array.isArray(Value)):
      for (const Item of (Value as unknown[])) { printLine(String(Item)) }
      break
    default: printLine(JSON.stringify(Value))
  }
}

//----------------------------------------------------------------------------//
//                              Entry formatters                              //
//----------------------------------------------------------------------------//

export interface ItemDisplayOptions {
  showLabel?: boolean
  showMIME?:  boolean
  showValue?: boolean
  showInfo?:  boolean
  InfoKey?:   string   // specific info key via --info.<key>
}

/**** formatItemLine — one-line text representation of an item entry ****/

export function formatItemLine (
  Id:string, Label:string, MIMEType:string,
  Value:unknown, Info:Record<string,unknown>,
  Options:ItemDisplayOptions
):string {
  const Parts:string[] = [ Id ]

  if (Options.showLabel) { Parts.push(Label !== '' ? Label : '(no label)') }
  if (Options.showMIME)  { Parts.push(MIMEType) }
  if (Options.showValue) { Parts.push(Value != null ? String(Value) : '(no value)') }

  switch (true) {
    case (Options.InfoKey != null):
      Parts.push(JSON.stringify(Info[Options.InfoKey!] ?? null))
      break
    case (Options.showInfo):
      Parts.push(JSON.stringify(Info))
      break
  }

  return Parts.join('  ')
}

/**** formatLinkLine — one-line text representation of a link entry ****/

export function formatLinkLine (
  Id:string, Label:string, TargetId:string,
  Info:Record<string,unknown>,
  Options:{ showLabel?:boolean; showTarget?:boolean; showInfo?:boolean; InfoKey?:string }
):string {
  const Parts:string[] = [ Id ]

  if (Options.showLabel)  { Parts.push(Label !== '' ? Label : '(no label)') }
  if (Options.showTarget) { Parts.push(`→ ${TargetId}`) }

  switch (true) {
    case (Options.InfoKey != null):
      Parts.push(JSON.stringify(Info[Options.InfoKey!] ?? null))
      break
    case (Options.showInfo):
      Parts.push(JSON.stringify(Info))
      break
  }

  return Parts.join('  ')
}

//----------------------------------------------------------------------------//
//                               Tree rendering                               //
//----------------------------------------------------------------------------//

/**** TreeLines — returns an array of pre-formatted tree lines ****/

export function TreeLines (
  Id:string, Label:string, Kind:'item'|'link', TargetId:string | undefined,
  Children:TreeNode[], Prefix:string, IsLast:boolean
):string[] {
  const Connector = IsLast ? '└── ' : '├── '
  const TypeMark  = Kind === 'link' ? ` → ${TargetId ?? '?'}` : ''
  const LabelPart = Label !== '' ? `  ${Label}` : ''
  const Head      = `${Prefix}${Connector}${Id}${LabelPart}${TypeMark}`

  const ChildPrefix = Prefix + (IsLast ? '    ' : '│   ')
  const Result:string[] = [ Head ]
  for (let ChildIdx = 0; ChildIdx < Children.length; ChildIdx++) {
    const Node      = Children[ChildIdx]
    const ChildLast = ChildIdx === Children.length-1
    Result.push(
      ...TreeLines(
        Node.Id, Node.Label, Node.Kind, Node.TargetId,
        Node.Children, ChildPrefix, ChildLast
      )
    )
  }
  return Result
}

export interface TreeNode {
  Id:        string
  Kind:      'item' | 'link'
  Label:     string
  TargetId?: string
  Children:  TreeNode[]
}
