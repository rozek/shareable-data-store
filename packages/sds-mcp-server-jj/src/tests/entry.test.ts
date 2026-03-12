/*******************************************************************************
*                                                                              *
*                   entry tools — integration tests (MCP)                      *
*                                                                              *
*******************************************************************************/

// covers: EC (entry create), EG (entry get), EL (entry list),
//         EU (entry update), EV (entry move), ED (entry delete / restore / purge)

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs   from 'node:fs/promises'
import os   from 'node:os'
import path from 'node:path'
import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { createMCPClient, callTool, closeMCPClient } from './runMCP.js'

let MCPClient:Client

beforeAll(async () => {
  MCPClient = await createMCPClient()
})

afterAll(async () => {
  await closeMCPClient(MCPClient)
})

//----------------------------------------------------------------------------//
//                             EC — entry create                              //
//----------------------------------------------------------------------------//

describe('entry create (EC)', () => {
  let PersistenceDir:string
  let ItemId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ec-'))
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EC-01: create item (no Target) → isError: false; Kind: "item"; Id is a UUID', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['Kind']).toBe('item')
    expect(typeof R['Id']).toBe('string')
    expect(R['Id'] as string).toMatch(/^[0-9a-f-]{36}$/)
    ItemId = R['Id'] as string
  })

  it('EC-02: create link (Target = existing item ID) → isError: false; Kind: "link"; Target matches', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      Target:  ItemId,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['Kind']).toBe('link')
    expect(R['Target']).toBe(ItemId)
  })

  it('EC-03: Label: "Docs", MIMEType: "text/markdown" → entry get returns those values', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:  'ec-test',
      PersistenceDir,
      Label:    'Docs',
      MIMEType: 'text/markdown',
    })
    expect(Create.isError).toBe(false)
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
    })
    expect(Get.isError).toBe(false)
    const R = Get.Result as Record<string,unknown>
    expect(R['Label']).toBe('Docs')
    expect(R['MIMEType']).toBe('text/markdown')
  })

  it('EC-04: Value: "hello" → entry get returns Value: "hello"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      Value:   'hello',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
    })
    expect((Get.Result as Record<string,unknown>)['Value']).toBe('hello')
  })

  it('EC-05: ValueBase64 of "world" → entry get Value decodes to "world"', async () => {
    const Encoded = Buffer.from('world').toString('base64')
    const Create  = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:     'ec-test',
      PersistenceDir,
      ValueBase64: Encoded,
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
      Fields:  [ 'Value' ],
    })
    expect(Get.isError).toBe(false)
    const V = (Get.Result as Record<string,unknown>)['Value'] as string
    // the store returns the raw string value — must equal the original decoded text
    expect(V).toBe('world')
  })

  it('EC-06: File pointing to temp file → entry get Value matches file content', async () => {
    const TmpFile = path.join(PersistenceDir, 'upload.txt')
    await fs.writeFile(TmpFile, 'file-content-ec06')

    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      File:    TmpFile,
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
    })
    expect((Get.Result as Record<string,unknown>)['Value']).toBe('file-content-ec06')
  })

  it('EC-07: Info: { author: "alice" } → entry get Info.author = "alice"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      Info:    { author:'alice' },
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
    })
    const R = Get.Result as Record<string,unknown>
    expect((R['Info'] as Record<string,unknown>)?.['author']).toBe('alice')
  })

  it('EC-08: at: 0 on item → item appears at index 0 in container entry list', async () => {
    // create a container to test insertion position
    const Ctr = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      Label:   'ctr-ec08',
    })
    const CtrId = (Ctr.Result as Record<string,unknown>)['Id'] as string

    // add a placeholder item first
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'ec-test',
      PersistenceDir,
      Container: CtrId,
      Label:     'existing',
    })

    // now insert at position 0
    const First = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'ec-test',
      PersistenceDir,
      Container: CtrId,
      Label:     'first',
      at:        0,
    })
    const FirstId = (First.Result as Record<string,unknown>)['Id'] as string

    const List = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id:      CtrId,
    })
    const Entries = List.Result as Array<Record<string,unknown>>
    expect(Entries[0]?.['Id']).toBe(FirstId)
  })

  it('EC-09: non-existent Container → isError: true; message contains "not found"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'ec-test',
      PersistenceDir,
      Container: '00000000-0000-0000-0000-000000000099',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not found/i)
  })

  // EC-10 is the representative test for the "item-only field + Target" guard;
  // the same validation rejects Value — no separate test needed for that combination.
  it('EC-10: MIMEType with Target → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:  'ec-test',
      PersistenceDir,
      Target:   ItemId,
      MIMEType: 'text/plain',
    })
    expect(Result.isError).toBe(true)
  })

  it('EC-11: Value and File together → isError: true; message contains "mutually exclusive"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ec-test',
      PersistenceDir,
      Value:   'text',
      File:    '/tmp/sds-nonexistent.txt',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/mutually exclusive/i)
  })

  // EC-12 proves that Container resolves well-known aliases via resolveEntryId();
  // testing a second alias would exercise the same code path and add no new coverage.
  it('EC-12: Container: "root" alias → item created in root; appears in root list', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'ec-test',
      PersistenceDir,
      Container: 'root',
      Label:     'ec12-root-alias',
    })
    expect(Create.isError).toBe(false)
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const List = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id:      'root',
    })
    const Entries = List.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === Id)).toBe(true)
  })

  it('EC-13: InfoDelete at create time is a no-op; command succeeds; entry info only contains Info keys', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:    'ec-test',
      PersistenceDir,
      Label:      'ec13-no-op',
      Info:       { keep:'yes' },
      InfoDelete: [ 'gone' ],
    })
    expect(Create.isError).toBe(false)
    expect((Create.Result as Record<string,unknown>)['created']).toBe(true)
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ec-test',
      PersistenceDir,
      Id,
    })
    const Info = (Get.Result as Record<string,unknown>)['Info'] as Record<string,unknown>
    expect(Info['keep']).toBe('yes')    // Info key was applied
    expect('gone' in Info).toBe(false)  // InfoDelete was silently ignored
  })

})

//----------------------------------------------------------------------------//
//                              EG — entry get                                //
//----------------------------------------------------------------------------//

describe('entry get (EG)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-eg-'))

    const Item = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'eg-test',
      PersistenceDir,
      Label:   'TestItem',
      Info:    { author:'alice' },
    })
    ItemId = (Item.Result as Record<string,unknown>)['Id'] as string

    const Link = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'eg-test',
      PersistenceDir,
      Target:  ItemId,
    })
    LinkId = (Link.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EG-01: no Fields, no InfoKeys → all available fields returned', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      ItemId,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R).toHaveProperty('Id')
    expect(R).toHaveProperty('Kind')
    expect(R).toHaveProperty('Label')
  })

  it('EG-02: Fields: ["Kind", "Label"] → response has Kind, Label; no MIMEType, Value, Info', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      ItemId,
      Fields:  [ 'Kind', 'Label' ],
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R).toHaveProperty('Id')
    expect(R).toHaveProperty('Kind')
    expect(R).toHaveProperty('Label')
    expect(R).not.toHaveProperty('MIMEType')
    expect(R).not.toHaveProperty('Value')
    expect(R).not.toHaveProperty('Info')
  })

  it('EG-03: InfoKeys: ["author"] → Info contains only author key', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId:  'eg-test',
      PersistenceDir,
      Id:       ItemId,
      InfoKeys: [ 'author' ],
    })
    expect(Result.isError).toBe(false)
    const R    = Result.Result as Record<string,unknown>
    const Info = R['Info'] as Record<string,unknown>
    expect(Info).toHaveProperty('author')
    expect(Info['author']).toBe('alice')
    expect(Object.keys(Info).length).toBe(1)
  })

  it('EG-04: Id: "root" → entry returned; Id equals well-known RootId', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      'root',
    })
    expect(Result.isError).toBe(false)
    expect((Result.Result as Record<string,unknown>)['Id']).toBe('00000000-0000-4000-8000-000000000000')
  })

  it('EG-05: Id: "trash" → entry returned; Id equals well-known TrashId; Kind: "item"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      'trash',
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['Id']).toBe('00000000-0000-4000-8000-000000000001')
    expect(R['Kind']).toBe('item')
  })

  it('EG-06: non-existent UUID → isError: true; message contains "not found"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      '00000000-0000-0000-0000-000000000099',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not found/i)
  })

  it('EG-07: link with Fields: ["Target"] → Target present; no MIMEType, no Value', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      LinkId,
      Fields:  [ 'Target' ],
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R).toHaveProperty('Target')
    expect(R).not.toHaveProperty('MIMEType')
    expect(R).not.toHaveProperty('Value')
  })

  it('EG-08: Id: "lost-and-found" → entry returned; Kind: "item"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      'lost-and-found',
    })
    expect(Result.isError).toBe(false)
    expect((Result.Result as Record<string,unknown>)['Kind']).toBe('item')
  })

  // requires: EG-08 (lost-and-found alias); lostandfound has its own switch case and
  // must be tested independently — a broken case would only be caught by this test.
  it('EG-09: Id: "lostandfound" (no-hyphen variant) resolves to the same entry as "lost-and-found"', async () => {
    const WithHyphen = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      'lost-and-found',
    })
    const WithoutHyphen = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eg-test',
      PersistenceDir,
      Id:      'lostandfound',
    })
    expect(WithoutHyphen.isError).toBe(false)
    const IdA = (WithHyphen.Result  as Record<string,unknown>)['Id']
    const IdB = (WithoutHyphen.Result as Record<string,unknown>)['Id']
    expect(IdB).toBe(IdA)
  })

})

//----------------------------------------------------------------------------//
//                             EL — entry list                               //
//----------------------------------------------------------------------------//

describe('entry list (EL)', () => {
  let PersistenceDir:string
  let OuterId:string
  let InnerItemId:string
  let InnerLinkId:string
  let DeepId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-el-'))

    const Outer = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'el-test',
      PersistenceDir,
      Label:   'outer',
    })
    OuterId = (Outer.Result as Record<string,unknown>)['Id'] as string

    const InnerItem = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'el-test',
      PersistenceDir,
      Container: OuterId,
      Label:     'inner-item',
      Info:      { tag:'important' },
    })
    InnerItemId = (InnerItem.Result as Record<string,unknown>)['Id'] as string

    const InnerLink = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'el-test',
      PersistenceDir,
      Container: OuterId,
      Target:    InnerItemId,
    })
    InnerLinkId = (InnerLink.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EL-01: Id: "root" → array contains created item IDs; every element has Id and Kind', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      'root',
    })
    expect(Result.isError).toBe(false)
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Array.isArray(Entries)).toBe(true)
    expect(Entries.some((e) => e['Id'] === OuterId)).toBe(true)
    for (const E of Entries) {
      expect(E).toHaveProperty('Id')
      expect(E).toHaveProperty('Kind')
    }
  })

  it('EL-02: recursive: true → nested items appear in result', async () => {
    // create a deeply nested item
    const Deep = await callTool(MCPClient, 'sds_entry_create', {
      StoreId:   'el-test',
      PersistenceDir,
      Container: InnerItemId,
      Label:     'deep',
    })
    DeepId = (Deep.Result as Record<string,unknown>)['Id'] as string

    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId:   'el-test',
      PersistenceDir,
      Id:        'root',
      recursive: true,
    })
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === DeepId)).toBe(true)
  })

  it('EL-03: only: "items" → no entry has Kind: "link"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      OuterId,
      only:    'items',
    })
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.every((e) => e['Kind'] === 'item')).toBe(true)
  })

  it('EL-04: only: "links" → no entry has Kind: "item"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      OuterId,
      only:    'links',
    })
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.every((e) => e['Kind'] === 'link')).toBe(true)
  })

  it('EL-05: recursive: true, Depth: 1 → deeply nested children not included', async () => {
    // OuterId has InnerItemId as a child; InnerItemId has DeepId as a child
    // with Depth: 1, DeepId (grandchild of OuterId) must not appear
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId:   'el-test',
      PersistenceDir,
      Id:        OuterId,
      recursive: true,
      Depth:     1,
    })
    const Entries  = Result.Result as Array<Record<string,unknown>>
    const EntryIds = Entries.map((e) => e['Id'])
    expect(EntryIds.includes(InnerItemId)).toBe(true)   // direct child — present
    expect(EntryIds.includes(DeepId)).toBe(false)        // grandchild — absent with Depth: 1
  })

  it('EL-06: Fields: ["Label"] → every entry has a Label field', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      OuterId,
      Fields:  [ 'Label' ],
    })
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.length).toBeGreaterThan(0)
    for (const E of Entries) { expect(E).toHaveProperty('Label') }
  })

  it('EL-07: InfoKeys: ["tag"] → every entry has Info object with only tag key', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId:  'el-test',
      PersistenceDir,
      Id:       OuterId,
      InfoKeys: [ 'tag' ],
    })
    const Entries = Result.Result as Array<Record<string,unknown>>
    expect(Entries.length).toBeGreaterThan(0)
    for (const E of Entries) {
      expect(E).toHaveProperty('Info')
      const InfoKeys = Object.keys(E['Info'] as object)
      expect(InfoKeys.length).toBe(1)
      expect(InfoKeys[0]).toBe('tag')
    }
  })

  it("EL-08: only: \"foobar\" → isError: true; message contains \"'only'\"", async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      OuterId,
      only:    'foobar',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/'only'/i)
  })

  it('EL-09: link ID as container → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      InnerLinkId,
    })
    expect(Result.isError).toBe(true)
  })

  it('EL-10: Id: "root" output → Trash ID absent from result array', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      'root',
    })
    const Entries  = Result.Result as Array<Record<string,unknown>>
    const EntryIds = Entries.map((e) => e['Id'])
    expect(EntryIds).not.toContain('00000000-0000-4000-8000-000000000001')  // TrashId
  })

  it('EL-11: Id: "lost-and-found" → alias resolves; tool succeeds (returns array)', async () => {
    // the lost-and-found container is normally empty; the test only verifies the alias resolves
    const Result = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'el-test',
      PersistenceDir,
      Id:      'lost-and-found',
    })
    expect(Result.isError).toBe(false)
    expect(Array.isArray(Result.Result)).toBe(true)
  })

})

//----------------------------------------------------------------------------//
//                            EU — entry update                              //
//----------------------------------------------------------------------------//

describe('entry update (EU)', () => {
  let PersistenceDir:string
  let ItemId:string
  let LinkId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-eu-'))

    const Item = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'eu-test',
      PersistenceDir,
      Label:   'original',
      Info:    { a:1 },
    })
    ItemId = (Item.Result as Record<string,unknown>)['Id'] as string

    const Link = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'eu-test',
      PersistenceDir,
      Target:  ItemId,
    })
    LinkId = (Link.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EU-01: update Label on item → updated: true; entry get reflects new label', async () => {
    const Update = await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Label:   'item-updated',
    })
    expect(Update.isError).toBe(false)
    expect((Update.Result as Record<string,unknown>)['updated']).toBe(true)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Fields:  [ 'Label' ],
    })
    expect((Get.Result as Record<string,unknown>)['Label']).toBe('item-updated')
  })

  it('EU-02: update Label on link → updated: true; entry get reflects new label', async () => {
    const Update = await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      LinkId,
      Label:   'link-updated',
    })
    expect(Update.isError).toBe(false)
    expect((Update.Result as Record<string,unknown>)['updated']).toBe(true)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      LinkId,
      Fields:  [ 'Label' ],
    })
    expect((Get.Result as Record<string,unknown>)['Label']).toBe('link-updated')
  })

  it('EU-03: update Value on item → entry get reflects new value', async () => {
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Value:   'eu03-value',
    })
    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Fields:  [ 'Value' ],
    })
    expect((Get.Result as Record<string,unknown>)['Value']).toBe('eu03-value')
  })

  it('EU-04: update MIMEType on item → entry get reflects new MIME type', async () => {
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId:  'eu-test',
      PersistenceDir,
      Id:       ItemId,
      MIMEType: 'application/json',
    })
    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Fields:  [ 'MIMEType' ],
    })
    expect((Get.Result as Record<string,unknown>)['MIMEType']).toBe('application/json')
  })

  it('EU-05: Info: { b: 2 } on item with existing { a: 1 } → info contains both a and b', async () => {
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Info:    { b:2 },
    })
    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
    })
    const Info = (Get.Result as Record<string,unknown>)['Info'] as Record<string,unknown>
    expect(Info['a']).toBe(1)
    expect(Info['b']).toBe(2)
  })

  // EU-06 is the representative test for the "item-only field on link" guard in update;
  // the same validation rejects Value — no separate test needed for that combination.
  it('EU-06: MIMEType on link → isError: true; message contains "link"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_update', {
      StoreId:  'eu-test',
      PersistenceDir,
      Id:       LinkId,
      MIMEType: 'text/plain',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/link/i)
  })

  it('EU-07: Value and File together → isError: true; message contains "mutually exclusive"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Value:   'text',
      File:    '/tmp/sds-nonexistent.txt',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/mutually exclusive/i)
  })

  it('EU-08: non-existent entry ID → isError: true; message contains "not found"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      '00000000-0000-0000-0000-000000000099',
      Label:   'x',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not found/i)
  })

  it('EU-09: InfoDelete removes key; other keys remain; deleted key absent from Info', async () => {
    // set initial info with two keys
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Info:    { keep:'yes', remove:'bye' },
    })

    // delete one key
    const Del = await callTool(MCPClient, 'sds_entry_update', {
      StoreId:    'eu-test',
      PersistenceDir,
      Id:         ItemId,
      InfoDelete: [ 'remove' ],
    })
    expect(Del.isError).toBe(false)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
    })
    const Info = (Get.Result as Record<string,unknown>)['Info'] as Record<string,unknown>
    expect('remove' in Info).toBe(false)  // deleted key must be gone
    expect(Info['keep']).toBe('yes')      // untouched key preserved
  })

  it('EU-10: InfoDelete with invalid JS identifier → isError: true; message contains key name', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_update', {
      StoreId:    'eu-test',
      PersistenceDir,
      Id:         ItemId,
      InfoDelete: [ 'my-key' ],  // hyphen makes this an invalid identifier
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/my-key/i)
  })

  it('EU-11: Info + InfoDelete in one call: new key added and existing key removed', async () => {
    // establish baseline: two keys
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
      Info:    { old:'out', stay:'here' },
    })

    // one call: add 'neu' and delete 'old'
    const Update = await callTool(MCPClient, 'sds_entry_update', {
      StoreId:    'eu-test',
      PersistenceDir,
      Id:         ItemId,
      Info:       { neu:'added' },
      InfoDelete: [ 'old' ],
    })
    expect(Update.isError).toBe(false)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
    })
    const Info = (Get.Result as Record<string,unknown>)['Info'] as Record<string,unknown>
    expect(Info['neu']).toBe('added')    // newly added key is present
    expect('old' in Info).toBe(false)   // deleted key is gone
    expect(Info['stay']).toBe('here')   // unrelated key is untouched
  })

  it('EU-12: Info and InfoDelete reference the same key — delete wins', async () => {
    // pre-condition: ensure the key is absent so the test starts clean
    await callTool(MCPClient, 'sds_entry_update', {
      StoreId:    'eu-test',
      PersistenceDir,
      Id:         ItemId,
      InfoDelete: [ 'contested' ],
    })

    // write and delete the same key in one call
    const Update = await callTool(MCPClient, 'sds_entry_update', {
      StoreId:    'eu-test',
      PersistenceDir,
      Id:         ItemId,
      Info:       { contested:'written' },
      InfoDelete: [ 'contested' ],
    })
    expect(Update.isError).toBe(false)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'eu-test',
      PersistenceDir,
      Id:      ItemId,
    })
    const Info = (Get.Result as Record<string,unknown>)['Info'] as Record<string,unknown>
    // delete must win — the key must be absent
    expect('contested' in Info).toBe(false)
  })

})

//----------------------------------------------------------------------------//
//                             EV — entry move                               //
//----------------------------------------------------------------------------//

describe('entry move (EV)', () => {
  let PersistenceDir:string
  let ContainerId:string
  let ItemId:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ev-'))

    const Ctr = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ev-test',
      PersistenceDir,
      Label:   'container',
    })
    ContainerId = (Ctr.Result as Record<string,unknown>)['Id'] as string

    const Item = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ev-test',
      PersistenceDir,
      Label:   'movable',
    })
    ItemId = (Item.Result as Record<string,unknown>)['Id'] as string
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('EV-01: move item to a different container → movedTo matches; item in target list', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ItemId,
      to:      ContainerId,
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    expect(R['movedTo']).toBe(ContainerId)

    const List = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ContainerId,
    })
    const Entries = List.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === ItemId)).toBe(true)
  })

  it('EV-02: at: 0 on move → item appears at index 0 in target container', async () => {
    // create a new item to move
    const New = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ev-test',
      PersistenceDir,
      Label:   'ev02-item',
    })
    const NewId = (New.Result as Record<string,unknown>)['Id'] as string

    await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      NewId,
      to:      ContainerId,
      at:      0,
    })

    const List = await callTool(MCPClient, 'sds_entry_list', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ContainerId,
    })
    const Entries = List.Result as Array<Record<string,unknown>>
    expect(Entries[0]?.['Id']).toBe(NewId)
  })

  it('EV-03: non-existent target container → isError: true; message contains "not found"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ItemId,
      to:      '00000000-0000-0000-0000-000000000099',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not found/i)
  })

  it('EV-04: move item into its own descendant → isError: true; message contains "descendant"', async () => {
    // ContainerId already contains ItemId — try to move ContainerId into ItemId
    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ContainerId,
      to:      ItemId,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/descendant/i)
  })

  it('EV-05: to: "root" alias → item is moved to root; isError: false', async () => {
    // ItemId is currently inside ContainerId; move it back to root via the alias
    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      ItemId,
      to:      'root',
    })
    expect(Result.isError).toBe(false)
    const R = Result.Result as Record<string,unknown>
    // movedTo must equal the canonical root UUID
    expect(R['movedTo']).toBe('00000000-0000-4000-8000-000000000000')
  })

  it('EV-06: move "lost-and-found" to a non-root container → isError: true', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id:      'lost-and-found',
      to:      ContainerId,
    })
    expect(Result.isError).toBe(true)
  })

  it('EV-07: at: -1 on move → isError: true; message contains "at"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ev-test',
      PersistenceDir,
      Label:   'ev07-item',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Result = await callTool(MCPClient, 'sds_entry_move', {
      StoreId: 'ev-test',
      PersistenceDir,
      Id,
      to: ContainerId,
      at: -1,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/at/i)
  })

})

//----------------------------------------------------------------------------//
//                    ED — entry delete / restore / purge                    //
//----------------------------------------------------------------------------//

describe('entry delete / restore / purge (ED)', () => {
  let PersistenceDir:string

  beforeAll(async () => {
    PersistenceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sds-ed-'))
    // ensure the store exists
    await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'seed',
    })
  })

  afterAll(async () => {
    await fs.rm(PersistenceDir, { recursive:true, force:true })
  })

  it('ED-01: delete item → deleted: true; sds_trash_list includes entry ID', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'todelete',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Delete = await callTool(MCPClient, 'sds_entry_delete', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Delete.isError).toBe(false)
    expect((Delete.Result as Record<string,unknown>)['deleted']).toBe(true)

    const Trash = await callTool(MCPClient, 'sds_trash_list', {
      StoreId: 'ed-test',
      PersistenceDir,
    })
    const Entries = Trash.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === Id)).toBe(true)
  })

  it('ED-02: delete "root" → isError: true; message contains "cannot be deleted"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_delete', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id:      'root',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/cannot be deleted/i)
  })

  it('ED-03: restore trashed entry → restoredTo = root ID; entry in root list', async () => {
    // get the actual root ID via the well-known alias
    const RootGet = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id:      'root',
      Fields:  [ 'Id' ],
    })
    const RootId = (RootGet.Result as Record<string,unknown>)['Id'] as string

    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'torestore',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    await callTool(MCPClient, 'sds_entry_delete', { StoreId:'ed-test', PersistenceDir, Id })

    const Restore = await callTool(MCPClient, 'sds_entry_restore', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Restore.isError).toBe(false)
    const R = Restore.Result as Record<string,unknown>
    // restoredTo must equal the canonical root ID
    expect(R['restoredTo']).toBe(RootId)

    const List = await callTool(MCPClient, 'sds_entry_list', {
      StoreId:   'ed-test',
      PersistenceDir,
      Id:        'root',
      recursive: true,
    })
    const Entries = List.Result as Array<Record<string,unknown>>
    expect(Entries.some((e) => e['Id'] === Id)).toBe(true)
  })

  it('ED-04: restore non-trashed entry → isError: true; message contains "not in the trash"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'liveitem',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Result = await callTool(MCPClient, 'sds_entry_restore', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not in the trash/i)
  })

  it('ED-05: purge trashed entry → purged: true; follow-up entry get returns isError: true', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'topurge',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    await callTool(MCPClient, 'sds_entry_delete', { StoreId:'ed-test', PersistenceDir, Id })

    const Purge = await callTool(MCPClient, 'sds_entry_purge', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Purge.isError).toBe(false)
    expect((Purge.Result as Record<string,unknown>)['purged']).toBe(true)

    const Get = await callTool(MCPClient, 'sds_entry_get', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Get.isError).toBe(true)
  })

  it('ED-06: purge non-trashed entry → isError: true; message contains "not in the trash"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'liveitem2',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    const Result = await callTool(MCPClient, 'sds_entry_purge', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/not in the trash/i)
  })

  it('ED-07: delete "lost-and-found" → isError: true; message contains "cannot be deleted"', async () => {
    const Result = await callTool(MCPClient, 'sds_entry_delete', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id:      'lost-and-found',
    })
    expect(Result.isError).toBe(true)
    expect(Result.Error).toMatch(/cannot be deleted/i)
  })

  // ED-08 proves that the to parameter in restore resolves well-known aliases;
  // testing a second alias would exercise the same code path and add no new coverage.
  it('ED-08: restore with to: "root" alias → restoredTo equals canonical root UUID', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'torestore-alias',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    await callTool(MCPClient, 'sds_entry_delete', { StoreId:'ed-test', PersistenceDir, Id })

    const Restore = await callTool(MCPClient, 'sds_entry_restore', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
      to:      'root',
    })
    expect(Restore.isError).toBe(false)
    expect((Restore.Result as Record<string,unknown>)['restoredTo'])
      .toBe('00000000-0000-4000-8000-000000000000')
  })

  it('ED-09: restore with at: -1 → isError: true; message contains "at"', async () => {
    const Create = await callTool(MCPClient, 'sds_entry_create', {
      StoreId: 'ed-test',
      PersistenceDir,
      Label:   'torestore-neg-at',
    })
    const Id = (Create.Result as Record<string,unknown>)['Id'] as string

    await callTool(MCPClient, 'sds_entry_delete', { StoreId:'ed-test', PersistenceDir, Id })

    const Restore = await callTool(MCPClient, 'sds_entry_restore', {
      StoreId: 'ed-test',
      PersistenceDir,
      Id,
      at:      -1,
    })
    expect(Restore.isError).toBe(true)
    expect(Restore.Error).toMatch(/at/i)
  })

})
