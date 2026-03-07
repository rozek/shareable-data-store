# SNS WebSocket Server — Deployment Guide

This document describes the production-ready setup of `@rozek/sns-websocket-server` in a Docker container behind Caddy as a reverse proxy with automatic TLS.

---

## Overview

```
Internet
   │  HTTPS / WSS (port 443)
   ▼
┌─────────────────────────┐
│  Caddy (Reverse Proxy)  │  – TLS termination, HTTP→HTTPS redirect
│  port 80 / 443          │  – WebSocket upgrade forwarding
└───────────┬─────────────┘
            │  HTTP / WS (internal, port 3000)
            ▼
┌─────────────────────────┐
│  sns-server (Node.js)   │  – JWT auth, patch relay, WebRTC signalling
│  port 3000 (internal)   │  – POST /api/token
│                         │  – optional SQLite persistence (SNS_PERSIST_DIR)
└─────────────────────────┘
```

The SNS server acts as a **relay server** by default: clients synchronise their CRDT state with each other through it. When `SNS_PERSIST_DIR` is set the server additionally persists patches and snapshots to a per-store SQLite database in that directory, so late-joining clients can catch up without needing another peer to be online. TLS is handled entirely by Caddy.

---

## Quick Start

All deployment files are included in the `deployment/` directory of this repository. Clone the repository on your server, configure the secrets, and start the containers:

```bash
# 1. clone the repository (shallow clone is sufficient)
git clone --depth=1 https://github.com/rozek/shareable-notes-store /opt/sns-source

# 2. copy the deployment scaffold to its target location
cp -r /opt/sns-source/packages/websocket-server/deployment /opt/sns-server
cd /opt/sns-server

# 3. create the secrets file
cp .env.example .env
$EDITOR .env          # set SNS_JWT_SECRET, SNS_DOMAIN, ACME_EMAIL

# 4. build the package and pack it as a tarball for the Docker image
#    pnpm install fetches a pre-built binary for better-sqlite3 where available.
#    If no pre-built binary matches your platform/Node.js version it falls back
#    to compiling from source — in that case build tools must be present:
#
#    RHEL / Rocky / AlmaLinux:  dnf install -y make gcc gcc-c++ python3
#    Debian / Ubuntu:           apt-get install -y make g++ python3
#
#    Build tools are NOT needed in relay-only mode (no SNS_PERSIST_DIR).
#
#    (corepack is included in Node.js 22 and activates pnpm automatically)
cd /opt/sns-source
corepack enable
pnpm install
pnpm --filter @rozek/sns-websocket-server build
pnpm --filter @rozek/sns-websocket-server pack --pack-destination /tmp/sns-pack/
mv /tmp/sns-pack/rozek-sns-websocket-server-*.tgz /opt/sns-server/server/sns-websocket-server.tgz

# 5. build the Docker image
cd /opt/sns-server
docker compose build

# 6. (optional) restore a backup before the first start — see Backup & Restore below

# 7. start both containers
# (Docker creates the named volumes caddy_data and sns_stores automatically if they don't exist yet)
docker compose up -d

# 8. follow the logs
docker compose logs -f
```

On the first start Caddy automatically requests a TLS certificate for every domain listed in the Caddyfile. Ports 80 and 443 must be reachable from the internet, and the DNS A/AAAA records for all domains must point to this server.

---

## Directory Structure After Setup

```
/opt/sns-server/
├── docker-compose.yml
├── .env                   ← secrets (never commit this file!)
├── .env.example           ← template (safe to commit)
├── Caddyfile
├── generate-admin-token.mjs
└── server/
    ├── Dockerfile
    ├── package.json
    ├── server.mjs              ← entry point
    └── sns-websocket-server.tgz  ← built locally (see Quick Start step 4)

Docker named volumes (managed by Docker, independent of /opt/sns-server/):
  caddy_data    ← TLS certificates
  sns_stores    ← SQLite databases, one per store
```

---

## Configuration

### `.env`

**Never commit secrets to version control.** Use `.env.example` as your starting point:

```bash
cp .env.example .env
```

Key variables:

| Variable | Required | Description |
| --- | --- | --- |
| `SNS_JWT_SECRET` | **yes** | HS256 signing secret — at least 32 random bytes, base64url-encoded |
| `SNS_ISSUER` | no | Validated as the `iss` claim in JWTs |
| `SNS_HOST` | no | Bind address inside the container (default: `0.0.0.0`) |
| `SNS_PORT` | no | Port inside the container (default: `3000`) |
| `SNS_PERSIST_DIR` | no | Enable SQLite persistence. Must match the container-side mount path from `docker-compose.yml` — with the default configuration use `/data/stores`. Without Docker any writable directory path on the host works. |
| *(custom)* | no | Add one variable per additional service subdomain (e.g. `WIKI_DOMAIN=wiki.example.com`) and reference it in the Caddyfile. |
| `SNS_DOMAIN` | **yes** | Subdomain for the SNS server — Caddy requests a TLS certificate for it automatically |
| `ACME_EMAIL` | **yes** | E-mail address for Let's Encrypt notifications (shared across all subdomains) |

Generate a strong `SNS_JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Create the First Admin Token

An admin token is required to issue further tokens via `POST /api/token`. Create one **locally** using `generate-admin-token.mjs` — no running server needed:

```bash
SNS_JWT_SECRET=$(grep SNS_JWT_SECRET /opt/sns-server/.env | cut -d= -f2) \
  STORE_ID=my-store-42 \
  SUBJECT=admin@example.com \
  node /opt/sns-server/generate-admin-token.mjs
```

The script reads `SNS_JWT_SECRET`, `STORE_ID`, `SUBJECT`, and optionally `EXPIRES_IN` (default: `90d`) from the environment and prints the signed JWT to stdout.

---

## Issue Client Tokens via the API

With the admin token you can issue further tokens at runtime, e.g. for individual users:

```bash
ADMIN_TOKEN="<admin-token-from-above>"
SNS_DOMAIN="notes.example.com"
STORE_ID="my-store-42"

curl -s -X POST "https://${SNS_DOMAIN}/api/token" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sub": "user@example.com",
    "scope": "write",
    "exp": "30d"
  }'
```

Available `scope` values:

| Scope | Can read | Can write | Can issue tokens |
| --- | --- | --- | --- |
| `read` | ✅ | ❌ | ❌ |
| `write` | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ |

---

## Connect a Client

Clients connect to the server via `SNS_SyncEngine`:

```ts
import { SNS_SyncEngine }        from '@rozek/sns-sync-engine'
import { SNS_WebSocketProvider } from '@rozek/sns-network-websocket'
import { SNS_NoteStore }         from '@rozek/sns-core-jj'  // or -yjs / -loro

const Store   = SNS_NoteStore.fromScratch()
const Token   = '<jwt-token-with-write-scope>'
const StoreId = 'my-store-42'

const NetworkProvider = new SNS_WebSocketProvider({
  url:`wss://${SNS_DOMAIN}/ws/${StoreId}?token=${Token}`,
})

const SyncEngine = new SNS_SyncEngine(Store, { NetworkProvider })
await SyncEngine()
```

---

## Operations & Maintenance

### Updating

```bash
# pull latest source
cd /opt/sns-source
git pull

# copy updated deployment files (keeps .env and data volumes untouched)
cp -r packages/websocket-server/deployment/server /opt/sns-server/server

# rebuild the package tarball
# (build tools only needed if better-sqlite3 has no pre-built binary for your platform — see Quick Start step 4)
pnpm install
pnpm --filter @rozek/sns-websocket-server build
pnpm --filter @rozek/sns-websocket-server pack --pack-destination /tmp/sns-pack/
mv /tmp/sns-pack/rozek-sns-websocket-server-*.tgz /opt/sns-server/server/sns-websocket-server.tgz

# rebuild the Docker image and restart
cd /opt/sns-server
docker compose up -d --build
```

### Logs

```bash
docker compose logs -f sns-server   # application logs
docker compose logs -f caddy        # TLS / proxy logs
tail -f /opt/sns-server/data/logs/access.log  # Caddy access log
```

### Status and Health

```bash
docker compose ps
docker inspect sns-server | grep -A5 Health
```

### Backup & Restore

The persistent data lives in two named Docker volumes that are independent of `/opt/sns-server/`. Access them via a temporary Alpine container. The backup archives are written to the **current working directory** on the host (`$(pwd)`).

**Backup:**

```bash
# TLS certificates
docker run --rm \
  -v caddy_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/caddy_data.tar.gz /data

# SQLite stores (only needed when SNS_PERSIST_DIR is set)
docker run --rm \
  -v sns_stores:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/sns_stores.tar.gz /data
```

**Restore:**

Run `docker compose build` first (see Quick Start step 4), then restore before starting the containers:

```bash
# TLS certificates
docker run --rm \
  -v caddy_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/caddy_data.tar.gz -C /

# SQLite stores
docker run --rm \
  -v sns_stores:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/sns_stores.tar.gz -C /

# then start the containers as usual
docker compose up -d
```

When restoring on a running system (e.g. after a hardware failure), stop the containers first:

```bash
docker compose down
# … restore commands above …
docker compose up -d
```

---

### Verify the TLS Certificate

```bash
echo | openssl s_client \
  -connect notes.example.com:443 \
  -servername notes.example.com 2>/dev/null \
  | openssl x509 -noout -dates
```

---

## Security Notes

- `SNS_JWT_SECRET` must have at least 256 bits of entropy (≥ 32 random bytes, base64url-encoded).
- Protect the `.env` file: `chmod 600 /opt/sns-server/.env`
- Admin tokens should have a short lifetime and be rotated after use.
- The SNS server is **not** intended for direct internet exposure — `SNS_HOST=0.0.0.0` applies only within the Docker network; Caddy is the sole publicly reachable service.
- In multi-tenant setups each store should have its own `aud` claim and separate admin tokens.
- TLS certificates are stored in the named Docker volume `caddy_data` — back it up regularly (see Backup & Restore below).
- When `SNS_PERSIST_DIR` is set, back up the named Docker volume `sns_stores` regularly — it contains the authoritative CRDT state for all stores (see Backup & Restore below).
- In relay-only mode (no `SNS_PERSIST_DIR`) the server holds no persistent state; a restart is safe at any time.