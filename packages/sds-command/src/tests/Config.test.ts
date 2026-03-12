/*******************************************************************************
*                                                                              *
*                          Config — unit tests                                 *
*                                                                              *
*******************************************************************************/

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import os   from 'node:os'
import path from 'node:path'
import { resolveConfig, DBPathFor, SDS_ConfigError } from '../Config.js'

describe('resolveConfig / DBPathFor', () => {
  const originalENV = { ...process.env }

  beforeEach(() => {
    // clear SDS env vars before each test
    delete process.env['SDS_SERVER_URL']
    delete process.env['SDS_STORE_ID']
    delete process.env['SDS_TOKEN']
    delete process.env['SDS_ADMIN_TOKEN']
    delete process.env['SDS_PERSISTENCE_DIR']
  })

  afterEach(() => {
    Object.assign(process.env, originalENV)
  })

  it('CF-01: uses defaults when no options or env vars are set', () => {
    const Config = resolveConfig({})
    expect(Config.Format).toBe('text')
    expect(Config.OnError).toBe('stop')
    expect(Config.PersistenceDir).toBe(path.join(os.homedir(), '.sds'))
    expect(Config.ServerURL).toBeUndefined()
    expect(Config.StoreId).toBeUndefined()
    expect(Config.Token).toBeUndefined()
    expect(Config.AdminToken).toBeUndefined()
  })

  it('CF-02: normalises the format option', () => {
    expect(resolveConfig({ format:'JSON' }).Format).toBe('json')
    expect(resolveConfig({ format:'TEXT' }).Format).toBe('text')
  })

  it('CF-03: normalises the onError option', () => {
    expect(resolveConfig({ onError:'continue' }).OnError).toBe('continue')
    expect(resolveConfig({ onError:'ask' }).OnError).toBe('ask')
  })

  it('CF-04: CLI options take precedence over env vars', () => {
    process.env['SDS_STORE_ID'] = 'env-store'
    const Config = resolveConfig({ store:'cli-store' })
    expect(Config.StoreId).toBe('cli-store')
  })

  it('CF-05: reads SDS_SERVER_URL from env var when no server option is given', () => {
    process.env['SDS_SERVER_URL'] = 'ws://localhost:3000'
    process.env['SDS_STORE_ID']   = 'my-store'
    const Config = resolveConfig({})
    expect(Config.ServerURL).toBe('ws://localhost:3000')
    expect(Config.StoreId).toBe('my-store')
  })

  it('CF-06: reads SDS_TOKEN and SDS_ADMIN_TOKEN from env vars when no token option is given', () => {
    process.env['SDS_TOKEN']       = 'tok-abc'
    process.env['SDS_ADMIN_TOKEN'] = 'adm-xyz'
    const Config = resolveConfig({})
    expect(Config.Token).toBe('tok-abc')
    expect(Config.AdminToken).toBe('adm-xyz')
  })

  it('CF-07: DBPathFor combines PersistenceDir and store ID into a .db path', () => {
    const Config = resolveConfig({ persistenceDir:'/tmp/sds' })
    expect(DBPathFor(Config, 'valid-id_123')).toBe('/tmp/sds/valid-id_123.db')
  })

  it('CF-08: DBPathFor replaces chars outside [a-zA-Z0-9_-] in the store ID with _', () => {
    const Config = resolveConfig({ persistenceDir:'/tmp/sds' })
    expect(DBPathFor(Config, 'my/store')).toBe('/tmp/sds/my_store.db')
    expect(DBPathFor(Config, 'test store')).toBe('/tmp/sds/test_store.db')
  })

  it('CF-09: rejects an invalid --format value with SDS_ConfigError', () => {
    expect(() => resolveConfig({ format:'unknown' })).toThrow(SDS_ConfigError)
  })

  it('CF-10: rejects an invalid --on-error value with SDS_ConfigError', () => {
    expect(() => resolveConfig({ onError:'unknown' })).toThrow(SDS_ConfigError)
  })
})
