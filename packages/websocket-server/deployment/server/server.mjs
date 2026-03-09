// /opt/sds-websocket-server/server/server.mjs
import { createSDSServer } from '@rozek/sds-websocket-server'

// all configuration is read from environment variables:
//   SDS_JWT_SECRET  (required)
//   SDS_ISSUER      (optional)
//   SDS_HOST        (default: 127.0.0.1 — set to 0.0.0.0 inside Docker)
//   SDS_PORT        (default: 3000)
//   SDS_PERSIST_DIR (optional — enable SQLite persistence)
const { start } = createSDSServer()
start()
