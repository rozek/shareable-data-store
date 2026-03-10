# SDS WebSocket Server — Deployment Guide

This document describes how to deploy `@rozek/sds-websocket-server` in production. There are two fundamentally different setups — choose one based on your requirements.

---

## Architecture

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
│  sds-websocket-server   │  – JWT auth, patch relay, WebRTC signalling
│  port 3000 (internal)   │  – POST /api/token
│                         │  – optional SQLite persistence (SDS_PERSIST_DIR)
└─────────────────────────┘
```

The SDS server acts as a **relay server** by default: clients synchronise their CRDT state with each other through it. When `SDS_PERSIST_DIR` is set the server additionally persists patches and snapshots to a per-store SQLite database, so late-joining clients can catch up without needing another peer to be online. TLS is handled entirely by Caddy.

---

## Choose Your Setup

|  | **Setup A — Docker + Caddy** | **Setup B — Bare Node.js** |
| --- | --- | --- |
| TLS / HTTPS | ✅ Caddy handles it automatically | ❌ you must provide a reverse proxy |
| Relay-only (no persistence) | [→ A1](#setup-a1--docker--caddy--pre-built-image-recommended) | [→ B1](#setup-b1--bare-nodejs--relay-only) |
| SQLite persistence | [→ A1](#setup-a1--docker--caddy--pre-built-image-recommended) or [→ A2](#setup-a2--docker--caddy--build-on-server) | [→ B2](#setup-b2--bare-nodejs--sqlite-persistence-pre-built-binary) or [→ B3](#setup-b3--bare-nodejs--sqlite-persistence-tarball) |
| Server ≤ 1 GB RAM | ✅ A1 works fine (no build on server) | ✅ B1 and B2 work fine |
| Server &gt; 1 GB RAM | ✅ A1 or A2 | ✅ any |
| Recommended | **A1** | B1 or B2 |

**If in doubt, use Setup A1.** It pulls a pre-built multi-platform Docker image from GitHub Container Registry — no compilation on the server, no RAM spike, automatic TLS via Caddy.

---

## Setup A — Docker + Caddy

Both variants use the same `docker-compose.yml` with Caddy as a TLS-terminating reverse proxy. The only difference is whether the server image is pulled from a registry or built locally.

### Common prerequisites

- Docker with the Compose plugin installed
- ports 80 and 443 reachable from the internet
- DNS A/AAAA records for all domains pointing to this server

### Setup A1 — Docker + Caddy + Pre-built Image (recommended)

The Docker image is built automatically by CI and pushed to the GitHub Container Registry (GHCR) on every change. The server only pulls and runs it — no `docker build`, no `node-gyp`, no RAM spike.

```bash
# 1. clone the repository (shallow clone is sufficient)
git clone --depth=1 https://github.com/rozek/shareable-data-store /opt/shareable-data-store

# 2. copy the deployment scaffold to its target location
cp -r /opt/shareable-data-store/packages/websocket-server/deployment /opt/sds-websocket-server
cd /opt/sds-websocket-server

# 3. create the secrets file
cp .env.example .env
$EDITOR .env          # set SDS_JWT_SECRET, SDS_DOMAIN, ACME_EMAIL

# 4. pull the pre-built image from GitHub Container Registry
docker compose pull

# 5. (optional) restore a backup before the first start — see Backup & Restore below

# 6. start both containers
# (Docker creates the named volumes caddy_data and sds_stores automatically)
docker compose up -d

# 7. follow the logs
docker compose logs -f
```

**Updating:**

```bash
# pull latest deployment files (keeps .env and data volumes untouched)
git -C /opt/shareable-data-store pull
cp -r /opt/shareable-data-store/packages/websocket-server/deployment/server /opt/sds-websocket-server/server

# pull the new image and restart
cd /opt/sds-websocket-server
docker compose pull
docker compose up -d
```

---

### Setup A2 — Docker + Caddy + Build on Server

Use this only if your server has more than 1 GB RAM and you prefer to build the image locally. Building compiles `better-sqlite3` from source via `node-gyp`, which requires build tools and temporarily uses significant RAM.

**Required build tools** (only if `better-sqlite3` has no pre-built binary for your platform — see data in step 4):

- Debian / Ubuntu: `apt-get install -y make g++ python3`
- RHEL / Rocky / AlmaLinux: `dnf install -y make gcc gcc-c++ python3`

```bash
# 1. clone the repository
git clone --depth=1 https://github.com/rozek/shareable-data-store /opt/shareable-data-store

# 2. copy the deployment scaffold
cp -r /opt/shareable-data-store/packages/websocket-server/deployment /opt/sds-websocket-server
cd /opt/sds-websocket-server

# 3. create the secrets file
cp .env.example .env
$EDITOR .env          # set SDS_JWT_SECRET, SDS_DOMAIN, ACME_EMAIL

# 4. build the package tarball
#    pnpm install fetches a pre-built binary for better-sqlite3 where available.
#    If no pre-built binary matches your platform/Node.js version, it falls back
#    to compiling from source (build tools above must be installed in that case).
#    Build tools are NOT needed in relay-only mode (no SDS_PERSIST_DIR).
#    (corepack is included in Node.js 22 and activates pnpm automatically)
cd /opt/shareable-data-store
corepack enable
pnpm install
pnpm --filter @rozek/sds-websocket-server build
pnpm --filter @rozek/sds-websocket-server pack --pack-destination /tmp/sds-pack/
mv /tmp/sds-pack/rozek-sds-websocket-server-*.tgz /opt/sds-websocket-server/server/sds-websocket-server.tgz

# 5. build the Docker image (uses docker-compose.build.yml to add the build: section)
cd /opt/sds-websocket-server
docker compose -f docker-compose.yml -f docker-compose.build.yml build

# 6. (optional) restore a backup before the first start — see Backup & Restore below

# 7. start both containers
docker compose up -d

# 8. follow the logs
docker compose logs -f
```

**Updating:**

```bash
cd /opt/shareable-data-store
git pull
cp -r packages/websocket-server/deployment/server /opt/sds-websocket-server/server

pnpm install
pnpm --filter @rozek/sds-websocket-server build
cd packages/websocket-server
pnpm pack --pack-destination /tmp/sds-pack/
cd -
mv /tmp/sds-pack/rozek-sds-websocket-server-*.tgz /opt/sds-websocket-server/server/sds-websocket-server.tgz

cd /opt/sds-websocket-server
docker compose -f docker-compose.yml -f docker-compose.build.yml build
docker compose up -d
```

---

## Setup B — Bare Node.js (without Docker)

These variants run the server directly with Node.js — without Docker, without Caddy. You are responsible for providing a reverse proxy (e.g. Caddy or nginx) in front of the server to handle TLS.

All three variants use the same minimal `server.mjs` entry point. The differences are in how packages are obtained and whether persistence is enabled.

### Setup B1 — Bare Node.js + Relay-only

No persistence, no `better-sqlite3`, no compilation. Works on any server regardless of available RAM.

```bash
# 1. create the working directory
mkdir -p /opt/sds-websocket-server && cd /opt/sds-websocket-server

# 2. install server and dependencies — skip optional native addons
npm install --no-optional @rozek/sds-websocket-server @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSDSServer } from '@rozek/sds-websocket-server'

const { start } = createSDSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. start the server
export SDS_JWT_SECRET=<paste-generated-secret-here>   # required
export SDS_PORT=3000                                  # default: 3000
export SDS_HOST=127.0.0.1                             # listen on loopback only
export SDS_ISSUER=https://my-server.example.com       # optional
# SDS_PERSIST_DIR is intentionally omitted — relay-only mode

node server.mjs
```

For a permanent setup, write the variables to `/etc/sds-websocket-server.env` and use a systemd unit with `EnvironmentFile=` instead of hardcoding secrets.

---

### Setup B2 — Bare Node.js + SQLite Persistence + Pre-built Binary

`better-sqlite3` ships pre-built binaries for Linux x64/arm64, Node.js 18–22. Setting `npm_config_build_from_source=false` explicitly forbids fallback compilation, so the install fails with a clear error rather than silently running `node-gyp` and exhausting RAM.

```bash
# 1. create the working directory
mkdir -p /opt/sds-websocket-server && cd /opt/sds-websocket-server

# 2. install server, persistence, and SQLite — pre-built binary only, no compilation fallback
npm_config_build_from_source=false npm install \
  @rozek/sds-websocket-server @rozek/sds-persistence-node better-sqlite3 \
  @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSDSServer } from '@rozek/sds-websocket-server'

const { start } = createSDSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. create the persistence directory and start the server
mkdir -p /var/lib/sds-websocket-server/stores

export SDS_JWT_SECRET=<paste-generated-secret-here>
export SDS_PORT=3000
export SDS_HOST=127.0.0.1
export SDS_ISSUER=https://my-server.example.com                   # optional
export SDS_PERSIST_DIR=/var/lib/sds-websocket-server/stores       # enables SQLite persistence

node server.mjs
```

If no pre-built binary matches your platform, the install fails immediately with a clear error — upgrade Node.js to a supported version (18–22) or use Setup B3 instead.

---

### Setup B3 — Bare Node.js + SQLite Persistence + Tarball

Build on a development machine or in CI (where RAM is plentiful), ship only the resulting tarball to the server. No compilation on the server whatsoever.

**On your dev machine / in CI:**

```bash
pnpm --filter @rozek/sds-websocket-server build
cd packages/websocket-server
pnpm pack --pack-destination /tmp/sds-pack/
cd -
scp /tmp/sds-pack/rozek-sds-websocket-server-*.tgz user@server:/opt/sds-websocket-server/
```

**On the server:**

```bash
# 1. create the working directory
mkdir -p /opt/sds-websocket-server && cd /opt/sds-websocket-server

# 2. install from the tarball — no compilation whatsoever
npm install --no-optional ./rozek-sds-websocket-server-*.tgz \
  @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSDSServer } from '@rozek/sds-websocket-server'

const { start } = createSDSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. start the server
export SDS_JWT_SECRET=<paste-generated-secret-here>
export SDS_PORT=3000
export SDS_HOST=127.0.0.1
export SDS_ISSUER=https://my-server.example.com   # optional
# add SDS_PERSIST_DIR if you want SQLite persistence:
# export SDS_PERSIST_DIR=/var/lib/sds-websocket-server/stores

node server.mjs
```

---

## Directory Structure After Setup (Docker Variants)

```
/opt/sds-websocket-server/
├── docker-compose.yml
├── .env                   ← secrets (never commit this file!)
├── .env.example           ← template (safe to commit)
├── Caddyfile
├── generate-admin-token.mjs
└── server/
    ├── Dockerfile
    ├── package.json
    ├── server.mjs              ← entry point
    └── sds-websocket-server.tgz  ← only for Setup A2 (built locally)

Docker named volumes (managed by Docker, independent of /opt/sds-websocket-server/):
  caddy_data    ← TLS certificates
  sds_stores    ← SQLite databases, one per store
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
| `SDS_JWT_SECRET` | **yes** | HS256 signing secret — at least 32 random bytes, base64url-encoded |
| `SDS_ISSUER` | no | validated as the `iss` claim in JWTs |
| `SDS_HOST` | no | bind address inside the container (default: `0.0.0.0`) |
| `SDS_PORT` | no | port inside the container (default: `3000`) |
| `SDS_PERSIST_DIR` | no | enable SQLite persistence. Must match the container-side mount path from `docker-compose.yml` — with the default configuration use `/data/stores`. Without Docker any writable directory path on the host works. |
| *(custom)* | no | add one variable per additional service subdomain (e.g. `WIKI_DOMAIN=wiki.example.com`) and reference it in the Caddyfile. |
| `SDS_DOMAIN` | **yes** (Docker) | subdomain for the SDS server — Caddy requests a TLS certificate for it automatically |
| `ACME_EMAIL` | **yes** (Docker) | EMail address for Let's Encrypt notifications (shared across all subdomains) |

Generate a strong `SDS_JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Create the First Admin Token

An admin token is required to issue further tokens via `POST /api/token`. Create one **locally** using `generate-admin-token.mjs` — no running server needed:

```bash
SDS_JWT_SECRET=$(grep SDS_JWT_SECRET /opt/sds-websocket-server/.env | cut -d= -f2) \
  STORE_ID=my-store-42 \
  SUBJECT=admin@example.com \
  node /opt/sds-websocket-server/generate-admin-token.mjs
```

The script reads `SDS_JWT_SECRET`, `STORE_ID`, `SUBJECT`, and optionally `EXPIRES_IN` (default: `90d`) from the environment and prints the signed JWT to stdout.

---

## Issue Client Tokens via the API

With the admin token you can issue further tokens at runtime, e.g. for individual users:

```bash
ADMIN_TOKEN="<admin-token-from-above>"
SDS_DOMAIN="store.example.com"
STORE_ID="my-store-42"

curl -s -X POST "https://${SDS_DOMAIN}/api/token" \
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

Clients connect to the server via `SDS_SyncEngine`:

```ts
import { SDS_SyncEngine }        from '@rozek/sds-sync-engine'
import { SDS_WebSocketProvider } from '@rozek/sds-network-websocket'
import { SDS_DataStore }         from '@rozek/sds-core-jj'  // or -yjs / -loro

const Store   = SDS_DataStore.fromScratch()
const Token   = '<jwt-token-with-write-scope>'
const StoreId = 'my-store-42'

const NetworkProvider = new SDS_WebSocketProvider({
  url:`wss://${SDS_DOMAIN}/ws/${StoreId}?token=${Token}`,
})

const SyncEngine = new SDS_SyncEngine(Store, { NetworkProvider })
await SyncEngine()
```

---

## Operations & Maintenance

### Logs

```bash
docker compose logs -f sds-websocket-server   # application logs
docker compose logs -f caddy                  # TLS / proxy logs
```

### Status and Health

```bash
docker compose ps
docker inspect sds-websocket-server | grep -A5 Health
```

### Backup & Restore

The persistent data lives in two named Docker volumes that are independent of `/opt/sds-websocket-server/`. Access them via a temporary Alpine container. The backup archives are written to the **current working directory** on the host (`$(pwd)`).

**Backup:**

```bash
# TLS certificates
docker run --rm \
  -v caddy_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/caddy_data.tar.gz /data

# SQLite stores (only needed when SDS_PERSIST_DIR is set)
docker run --rm \
  -v sds_stores:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/sds_stores.tar.gz /data
```

**Restore:**

```bash
# TLS certificates
docker run --rm \
  -v caddy_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/caddy_data.tar.gz -C /

# SQLite stores
docker run --rm \
  -v sds_stores:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/sds_stores.tar.gz -C /

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
  -connect store.example.com:443 \
  -servername store.example.com 2>/dev/null \
  | openssl x509 -noout -dates
```

---

## Security Notes

- `SDS_JWT_SECRET` must have at least 256 bits of entropy (≥ 32 random bytes, base64url-encoded).
- protect the `.env` file: `chmod 600 /opt/sds-websocket-server/.env`
- admin tokens should have a short lifetime and be rotated after use.
- the SDS server is **not** intended for direct internet exposure — `SDS_HOST=0.0.0.0` applies only within the Docker network; Caddy is the sole publicly reachable service.
- In multi-tenant setups each store should have its own `aud` claim and separate admin tokens.
- TLS certificates are stored in the named Docker volume `caddy_data` — back it up regularly (see Backup & Restore above).
- when `SDS_PERSIST_DIR` is set, back up the named Docker volume `sds_stores` regularly — it contains the authoritative CRDT state for all stores (see Backup & Restore above).
- in relay-only mode (no `SDS_PERSIST_DIR`) the server holds no persistent state; a restart is safe at any time.