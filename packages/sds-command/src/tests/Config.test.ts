/*******************************************************************************
*                                                                              *
*                          Config — unit tests                                 *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import os   from 'node:os'
import path from 'node:path'
import { resolveConfig, DBPathFor } from '../Config.js'

describe('resolveConfig', () => {
  const originalENV = { ...process.env }

  beforeEach(() => {
    // clear SDS env vars before each test
    delete process.env['SDS_SERVER_URL']
    delete process.env['SDS_STORE_ID']
    delete process.env['SDS_TOKEN']
    delete process.env['SDS_ADMIN_TOKEN']
    delete process.env['SDS_DATA_DIR']
  })

  afterEach(() => {
    Object.assign(process.env, originalENV)
  })

  it('uses defaults when no options or env vars are set', () => {
    const Config = resolveConfig({})
    expect(Config.Format).toBe('text')
    expect(Config.OnError).toBe('stop')
    expect(Config.DataDir).toBe(path.join(os.homedir(), '.sds'))
    expect(Config.ServerURL).toBeUndefined()
    expect(Config.StoreId).toBeUndefined()
    expect(Config.Token).toBeUndefined()
    expect(Config.AdminToken).toBeUndefined()
  })

  it('reads values from env vars', () => {
    process.env['SDS_SERVER_URL']  = 'ws://localhost:3000'
    process.env['SDS_STORE_ID']    = 'my-store'
    process.env['SDS_TOKEN']       = 'tok-abc'
    process.env['SDS_ADMIN_TOKEN'] = 'adm-xyz'
    const Config = resolveConfig({})
    expect(Config.ServerURL).toBe('ws://localhost:3000')
    expect(Config.StoreId).toBe('my-store')
    expect(Config.Token).toBe('tok-abc')
    expect(Config.AdminToken).toBe('adm-xyz')
  })

  it('CLI options take precedence over env vars', () => {
    process.env['SDS_STORE_ID'] = 'env-store'
    const Config = resolveConfig({ store:'cli-store' })
    expect(Config.StoreId).toBe('cli-store')
  })

  it('normalises the format option', () => {
    expect(resolveConfig({ format:'JSON' }).Format).toBe('json')
    expect(resolveConfig({ format:'TEXT' }).Format).toBe('text')
    expect(resolveConfig({ format:'unknown' }).Format).toBe('text')
  })

  it('normalises the onError option', () => {
    expect(resolveConfig({ onError:'continue' }).OnError).toBe('continue')
    expect(resolveConfig({ onError:'ask' }).OnError).toBe('ask')
    expect(resolveConfig({ onError:'unknown' }).OnError).toBe('stop')
  })
})

describe('DBPathFor', () => {
  it('sanitises the store ID for use as a file name', () => {
    const Config = resolveConfig({ dataDir:'/tmp/sds' })
    expect(DBPathFor(Config, 'my/store')).toBe('/tmp/sds/my_store.db')
    expect(DBPathFor(Config, 'test store')).toBe('/tmp/sds/test_store.db')
    expect(DBPathFor(Config, 'valid-id_123')).toBe('/tmp/sds/valid-id_123.db')
  })
})
