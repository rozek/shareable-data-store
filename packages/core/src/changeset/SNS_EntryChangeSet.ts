/*******************************************************************************
*                                                                              *
* SNS_EntryChangeSet - the set of prop. names that changed for a single entry  *
*                                                                              *
*******************************************************************************/

// possible values:
//  - 'outerNote'     — the entry was moved to a different container
//  - 'Label'         — the label string changed
//  - 'Type'          — the MIME type changed
//  - 'Value'         — the value (literal or binary) changed
//  - 'innerNoteList' — the ordered list of children changed
//  - 'Info.<key>'    — the Info map entry with the given key was set or deleted

export type SNS_EntryChangeSet = Set<string>
