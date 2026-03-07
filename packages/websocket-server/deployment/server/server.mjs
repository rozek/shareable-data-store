// /opt/sns-server/server/server.mjs
import { createSNSServer } from '@rozek/sns-websocket-server'

createSNSServer()
// all configuration is read from environment variables:
//   SNS_JWT_SECRET  (required)
//   SNS_ISSUER      (optional)
//   SNS_HOST        (default: 127.0.0.1 — set to 0.0.0.0 inside Docker)
//   SNS_PORT        (default: 3000)
//   SNS_PERSIST_DIR (optional — enable SQLite persistence)
