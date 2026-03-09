// generate-admin-token.mjs
// Generates a signed admin JWT using only Node.js built-ins (no npm install needed).
//
// Required environment variables:
//   SDS_JWT_SECRET  — the same base64url-encoded secret the server uses
//   STORE_ID        — e.g. 'my-store-42'
//   SUBJECT         — e.g. 'admin@example.com'
//
// Optional:
//   EXPIRES_IN      — e.g. '90d', '24h', '30m' (default: '90d')
//
// Example:
//   SDS_JWT_SECRET=$(grep SDS_JWT_SECRET /opt/sds-websocket-server/.env | cut -d= -f2) \
//     STORE_ID=my-store-42 \
//     SUBJECT=admin@example.com \
//     node generate-admin-token.mjs

import { createHmac } from 'crypto'

function base64url (value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  return Buffer.from(str).toString('base64url')
}

function parseExpiry (str) {
  const match = str.match(/^(\d+)(s|m|h|d|w)$/)
  if (match == null) {
    throw new Error(`Invalid EXPIRES_IN format: "${str}". Use e.g. "90d", "24h", "30m".`)
  }
  const multipliers = { s:1, m:60, h:3600, d:86400, w:604800 }
  return parseInt(match[1]) * multipliers[match[2]]
}

const Secret    = process.env.SDS_JWT_SECRET
const StoreId   = process.env.STORE_ID
const Subject   = process.env.SUBJECT
const ExpiresIn = process.env.EXPIRES_IN ?? '90d'

if (!Secret || !StoreId || !Subject) {
  console.error('Error: please set SDS_JWT_SECRET, STORE_ID and SUBJECT')
  process.exit(1)
}

const now = Math.floor(Date.now() / 1000)
const exp = now + parseExpiry(ExpiresIn)

const header  = base64url({ alg:'HS256', typ:'JWT' })
const payload = base64url({ sub:Subject, aud:StoreId, scope:'admin', iat:now, exp })

const signature = createHmac('sha256', Buffer.from(Secret, 'utf8'))
  .update(`${header}.${payload}`)
  .digest('base64url')

console.log(`${header}.${payload}.${signature}`)
