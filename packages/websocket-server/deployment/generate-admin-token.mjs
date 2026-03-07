// generate-admin-token.mjs
// run with: node generate-admin-token.mjs
//
// Required environment variables:
//   SNS_JWT_SECRET  — the same secret the server uses
//   STORE_ID        — e.g. 'my-store-42'
//   SUBJECT         — e.g. 'admin@example.com'
//
// Optional:
//   EXPIRES_IN      — e.g. '90d' (default: '90d')
//
// Example:
//   SNS_JWT_SECRET=$(grep SNS_JWT_SECRET /opt/sns-server/.env | cut -d= -f2) \
//     STORE_ID=my-store-42 \
//     SUBJECT=admin@example.com \
//     node generate-admin-token.mjs

import { SignJWT } from 'jose'

const Secret    = process.env.SNS_JWT_SECRET
const StoreId   = process.env.STORE_ID
const Subject   = process.env.SUBJECT
const ExpiresIn = process.env.EXPIRES_IN ?? '90d'

if (! Secret || ! StoreId || ! Subject) {
  console.error('Please set SNS_JWT_SECRET, STORE_ID and SUBJECT')
  process.exit(1)
}

const Key   = new TextEncoder().encode(Secret)
const Token = await new SignJWT({ scope:'admin' })
  .setProtectedHeader({ alg:'HS256' })
  .setSubject(Subject)
  .setAudience(StoreId)
  .setIssuedAt()
  .setExpirationTime(ExpiresIn)
  .sign(Key)

console.log(Token)
