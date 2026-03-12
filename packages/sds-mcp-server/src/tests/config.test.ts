/*******************************************************************************
*                                                                              *
*                          Config — unit tests (CF)                            *
*                                                                              *
*******************************************************************************/

// covers: CF (config defaults — env vars, CLI args, and precedence)
// unit-level: no binary is spawned; imports Config.ts directly

import os   from 'node:os'
import path from 'node:path'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  setServerDefaults, configFrom, resolvePersistenceDir, DBPathFor,
} from '../Config.js'

//----------------------------------------------------------------------------//
//                               test helpers                                 //
//----------------------------------------------------------------------------//

/**** withEnv — temporarily sets env vars and restores them afterwards ****/

function withEnv (Vars:Record<string,string>, Fn:() => void):void {
  const Previous:Record<string,string|undefined> = {}
  for (const [Key, Value] of Object.entries(Vars)) {
    Previous[Key] = process.env[Key]
    process.env[Key] = Value
  }
  try {
    Fn()
  } finally {
    for (const [Key, OldValue] of Object.entries(Previous)) {
      if (OldValue == null) {
        delete process.env[Key]
      } else {
        process.env[Key] = OldValue
      }
    }
  }
}

//----------------------------------------------------------------------------//
//                         resolvePersistenceDir — unit tests                        //
//----------------------------------------------------------------------------//

describe('resolvePersistenceDir', () => {
  beforeEach(() => {
    // reset server defaults and remove test env var before each case
    setServerDefaults({})
    delete process.env['SDS_PERSISTENCE_DIR']
  })

  afterEach(() => {
    delete process.env['SDS_PERSISTENCE_DIR']
  })

/**** CF-RD-01 — built-in default is ~/.sds ****/

  it('CF-RD-01: returns ~/.sds when no param, no ServerDefault, no env var', () => {
    const Expected = path.join(os.homedir(), '.sds')
    expect(resolvePersistenceDir()).toBe(Expected)
  })

/**** CF-RD-02 — SDS_PERSISTENCE_DIR env var is used as default ****/

  it('CF-RD-02: picks up SDS_PERSISTENCE_DIR env var', () => {
    withEnv({ SDS_PERSISTENCE_DIR:'/tmp/cf-env-dir' }, () => {
      expect(resolvePersistenceDir()).toBe('/tmp/cf-env-dir')
    })
  })

/**** CF-RD-03 — ServerDefault overrides env var ****/

  it('CF-RD-03: ServerDefault.PersistenceDir overrides SDS_PERSISTENCE_DIR', () => {
    setServerDefaults({ PersistenceDir:'/tmp/cf-cli-dir' })
    withEnv({ SDS_PERSISTENCE_DIR:'/tmp/cf-env-dir' }, () => {
      expect(resolvePersistenceDir()).toBe('/tmp/cf-cli-dir')
    })
  })

/**** CF-RD-04 — explicit PersistenceDir param overrides everything ****/

  it('CF-RD-04: explicit PersistenceDir param overrides ServerDefault and env var', () => {
    setServerDefaults({ PersistenceDir:'/tmp/cf-cli-dir' })
    withEnv({ SDS_PERSISTENCE_DIR:'/tmp/cf-env-dir' }, () => {
      expect(resolvePersistenceDir('/tmp/cf-param-dir')).toBe('/tmp/cf-param-dir')
    })
  })

})

//----------------------------------------------------------------------------//
//                            configFrom — unit tests                         //
//----------------------------------------------------------------------------//

describe('configFrom', () => {
  beforeEach(() => {
    setServerDefaults({})
    for (const Key of [ 'SDS_STORE_ID','SDS_PERSISTENCE_DIR','SDS_SERVER_URL','SDS_TOKEN','SDS_ADMIN_TOKEN' ]) {
      delete process.env[Key]
    }
  })

  afterEach(() => {
    for (const Key of [ 'SDS_STORE_ID','SDS_PERSISTENCE_DIR','SDS_SERVER_URL','SDS_TOKEN','SDS_ADMIN_TOKEN' ]) {
      delete process.env[Key]
    }
  })

/**** CF-01: SDS_STORE_ID env var is used when StoreId is absent from params ****/

  it('CF-01: SDS_STORE_ID env var sets StoreId default', () => {
    withEnv({ SDS_STORE_ID:'env-store' }, () => {
      const Config = configFrom({})
      expect(Config.StoreId).toBe('env-store')
    })
  })

/**** CF-02: SDS_PERSISTENCE_DIR env var is used when PersistenceDir is absent from params ****/

  it('CF-02: SDS_PERSISTENCE_DIR env var sets PersistenceDir default', () => {
    withEnv({ SDS_PERSISTENCE_DIR:'/tmp/cf-02' }, () => {
      const Config = configFrom({})
      expect(Config.PersistenceDir).toBe('/tmp/cf-02')
    })
  })

/**** CF-03: explicit StoreId param overrides SDS_STORE_ID ****/

  it('CF-03: explicit StoreId param wins over SDS_STORE_ID env var', () => {
    withEnv({ SDS_STORE_ID:'env-store' }, () => {
      const Config = configFrom({ StoreId:'param-store' })
      expect(Config.StoreId).toBe('param-store')
    })
  })

/**** CF-04: --store CLI arg (via ServerDefaults) sets StoreId default ****/

  it('CF-04: ServerDefaults.StoreId (--store CLI arg) sets StoreId default', () => {
    setServerDefaults({ StoreId:'cli-store' })
    const Config = configFrom({})
    expect(Config.StoreId).toBe('cli-store')
  })

/**** CF-05: --persistence-dir CLI arg (via ServerDefaults) sets PersistenceDir default ****/

  it('CF-05: ServerDefaults.PersistenceDir (--persistence-dir CLI arg) sets PersistenceDir default', () => {
    setServerDefaults({ PersistenceDir:'/tmp/cf-05' })
    const Config = configFrom({})
    expect(Config.PersistenceDir).toBe('/tmp/cf-05')
  })

/**** CF-06: explicit StoreId param overrides ServerDefaults.StoreId (--store) ****/

  it('CF-06: explicit StoreId param wins over ServerDefaults.StoreId', () => {
    setServerDefaults({ StoreId:'cli-store' })
    const Config = configFrom({ StoreId:'param-store' })
    expect(Config.StoreId).toBe('param-store')
  })

/**** CF-07: ServerDefaults.StoreId (--store) overrides SDS_STORE_ID ****/

  it('CF-07: ServerDefaults.StoreId (--store) wins over SDS_STORE_ID env var', () => {
    setServerDefaults({ StoreId:'cli-winner' })
    withEnv({ SDS_STORE_ID:'env-loser' }, () => {
      const Config = configFrom({})
      expect(Config.StoreId).toBe('cli-winner')
    })
  })

/**** CF-EC-01: SDS_SERVER_URL, SDS_TOKEN, SDS_ADMIN_TOKEN are picked up ****/

  it('CF-EC-01: SDS_SERVER_URL, SDS_TOKEN, and SDS_ADMIN_TOKEN are resolved from env', () => {
    withEnv({
      SDS_SERVER_URL:  'ws://env-server',
      SDS_TOKEN:       'env-token',
      SDS_ADMIN_TOKEN: 'env-admin-token',
    }, () => {
      const Config = configFrom({})
      expect(Config.ServerURL).toBe('ws://env-server')
      expect(Config.Token).toBe('env-token')
      expect(Config.AdminToken).toBe('env-admin-token')
    })
  })

})

//----------------------------------------------------------------------------//
//                            DBPathFor — unit tests                          //
//----------------------------------------------------------------------------//

describe('DBPathFor', () => {

/**** CF-DB-01 — alphanumeric store ID is passed through unchanged ****/

  it('CF-DB-01: keeps a safe store ID unchanged', () => {
    const Config = configFrom({ PersistenceDir:'/tmp/cf-db' })
    const Result = DBPathFor(Config, 'my-store_1')
    expect(Result).toBe(path.join('/tmp/cf-db', 'my-store_1.db'))
  })

/**** CF-DB-02 — special characters in store ID are replaced with underscores ****/

  it('CF-DB-02: sanitises special characters in store ID', () => {
    const Config = configFrom({ PersistenceDir:'/tmp/cf-db' })
    const Result = DBPathFor(Config, 'foo bar/baz')
    expect(Result).toBe(path.join('/tmp/cf-db', 'foo_bar_baz.db'))
  })

/**** CF-DB-03 — output is always inside Config.PersistenceDir ****/

  it('CF-DB-03: output path is inside Config.PersistenceDir with .db extension', () => {
    const Config = configFrom({ PersistenceDir:'/some/persist/dir' })
    const Result = DBPathFor(Config, 'store')
    expect(Result.startsWith('/some/persist/dir')).toBe(true)
    expect(Result.endsWith('.db')).toBe(true)
  })

})
