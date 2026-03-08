# SNS WebSocket Server — Deployment Guide

This document describes how to deploy `@rozek/sns-websocket-server` in production. There are two fundamentally different setups — choose one based on your requirements.

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
│  sns-websocket-server   │  – JWT auth, patch relay, WebRTC signalling
│  port 3000 (internal)   │  – POST /api/token
│                         │  – optional SQLite persistence (SNS_PERSIST_DIR)
└─────────────────────────┘
```

The SNS server acts as a **relay server** by default: clients synchronise their CRDT state with each other through it. When `SNS_PERSIST_DIR` is set the server additionally persists patches and snapshots to a per-store SQLite database, so late-joining clients can catch up without needing another peer to be online. TLS is handled entirely by Caddy.

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
- Ports 80 and 443 reachable from the internet
- DNS A/AAAA records for all domains pointing to this server

### Setup A1 — Docker + Caddy + Pre-built Image (recommended)

The Docker image is built automatically by CI and pushed to the GitHub Container Registry (GHCR) on every change. The server only pulls and runs it — no `docker build`, no `node-gyp`, no RAM spike.

```bash
# 1. clone the repository (shallow clone is sufficient)
git clone --depth=1 https://github.com/rozek/shareable-notes-store /opt/shareable-notes-store

# 2. copy the deployment scaffold to its target location
cp -r /opt/shareable-notes-store/packages/websocket-server/deployment /opt/sns-websocket-server
cd /opt/sns-websocket-server

# 3. create the secrets file
cp .env.example .env
$EDITOR .env          # set SNS_JWT_SECRET, SNS_DOMAIN, ACME_EMAIL

# 4. pull the pre-built image from GitHub Container Registry
docker compose pull

# 5. (optional) restore a backup before the first start — see Backup & Restore below

# 6. start both containers
# (Docker creates the named volumes caddy_data and sns_stores automatically)
docker compose up -d

# 7. follow the logs
docker compose logs -f
```

**Updating:**

```bash
# pull latest deployment files (keeps .env and data volumes untouched)
git -C /opt/shareable-notes-store pull
cp -r /opt/shareable-notes-store/packages/websocket-server/deployment/server /opt/sns-websocket-server/server

# pull the new image and restart
cd /opt/sns-websocket-server
docker compose pull
docker compose up -d
```

---

### Setup A2 — Docker + Caddy + Build on Server

Use this only if your server has more than 1 GB RAM and you prefer to build the image locally. Building compiles `better-sqlite3` from source via `node-gyp`, which requires build tools and temporarily uses significant RAM.

**Required build tools** (only if `better-sqlite3` has no pre-built binary for your platform — see note in step 4):

- Debian / Ubuntu: `apt-get install -y make g++ python3`
- RHEL / Rocky / AlmaLinux: `dnf install -y make gcc gcc-c++ python3`

```bash
# 1. clone the repository
git clone --depth=1 https://github.com/rozek/shareable-notes-store /opt/shareable-notes-store

# 2. copy the deployment scaffold
cp -r /opt/shareable-notes-store/packages/websocket-server/deployment /opt/sns-websocket-server
cd /opt/sns-websocket-server

# 3. create the secrets file
cp .env.example .env
$EDITOR .env          # set SNS_JWT_SECRET, SNS_DOMAIN, ACME_EMAIL

# 4. build the package tarball
#    pnpm install fetches a pre-built binary for better-sqlite3 where available.
#    If no pre-built binary matches your platform/Node.js version, it falls back
#    to compiling from source (build tools above must be installed in that case).
#    Build tools are NOT needed in relay-only mode (no SNS_PERSIST_DIR).
#    (corepack is included in Node.js 22 and activates pnpm automatically)
cd /opt/shareable-notes-store
corepack enable
pnpm install
pnpm --filter @rozek/sns-websocket-server build
pnpm --filter @rozek/sns-websocket-server pack --pack-destination /tmp/sns-pack/
mv /tmp/sns-pack/rozek-sns-websocket-server-*.tgz /opt/sns-websocket-server/server/sns-websocket-server.tgz

# 5. build the Docker image
cd /opt/sns-websocket-server
docker compose build

# 6. (optional) restore a backup before the first start — see Backup & Restore below

# 7. start both containers
docker compose up -d

# 8. follow the logs
docker compose logs -f
```

**Updating:**

```bash
cd /opt/shareable-notes-store
git pull
cp -r packages/websocket-server/deployment/server /opt/sns-websocket-server/server

pnpm install
pnpm --filter @rozek/sns-websocket-server build
pnpm --filter @rozek/sns-websocket-server pack --pack-destination /tmp/sns-pack/
mv /tmp/sns-pack/rozek-sns-websocket-server-*.tgz /opt/sns-websocket-server/server/sns-websocket-server.tgz

cd /opt/sns-websocket-server
docker compose up -d --build
```

---

## Setup B — Bare Node.js (without Docker)

These variants run the server directly with Node.js — without Docker, without Caddy. You are responsible for providing a reverse proxy (e.g. Caddy or nginx) in front of the server to handle TLS.

All three variants use the same minimal `server.mjs` entry point. The differences are in how packages are obtained and whether persistence is enabled.

### Setup B1 — Bare Node.js + Relay-only

No persistence, no `better-sqlite3`, no compilation. Works on any server regardless of available RAM.

```bash
# 1. create the working directory
mkdir -p /opt/sns-websocket-server && cd /opt/sns-websocket-server

# 2. install server and dependencies — skip optional native addons
npm install --no-optional @rozek/sns-websocket-server @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSNSServer } from '@rozek/sns-websocket-server'

const { start } = createSNSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. start the server
export SNS_JWT_SECRET=<paste-generated-secret-here>   # required
export SNS_PORT=3000                                  # default: 3000
export SNS_HOST=127.0.0.1                             # listen on loopback only
export SNS_ISSUER=https://my-server.example.com       # optional
# SNS_PERSIST_DIR is intentionally omitted — relay-only mode

node server.mjs
```

For a permanent setup, write the variables to `/etc/sns-websocket-server.env` and use a systemd unit with `EnvironmentFile=` instead of hardcoding secrets.

---

### Setup B2 — Bare Node.js + SQLite Persistence + Pre-built Binary

`better-sqlite3` ships pre-built binaries for Linux x64/arm64, Node.js 18–22. Setting `npm_config_build_from_source=false` explicitly forbids fallback compilation, so the install fails with a clear error rather than silently running `node-gyp` and exhausting RAM.

```bash
# 1. create the working directory
mkdir -p /opt/sns-websocket-server && cd /opt/sns-websocket-server

# 2. install server, persistence, and SQLite — pre-built binary only, no compilation fallback
npm_config_build_from_source=false npm install \
  @rozek/sns-websocket-server @rozek/sns-persistence-node better-sqlite3 \
  @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSNSServer } from '@rozek/sns-websocket-server'

const { start } = createSNSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. create the persistence directory and start the server
mkdir -p /var/lib/sns-websocket-server/stores

export SNS_JWT_SECRET=<paste-generated-secret-here>
export SNS_PORT=3000
export SNS_HOST=127.0.0.1
export SNS_ISSUER=https://my-server.example.com                   # optional
export SNS_PERSIST_DIR=/var/lib/sns-websocket-server/stores       # enables SQLite persistence

node server.mjs
```

If no pre-built binary matches your platform, the install fails immediately with a clear error — upgrade Node.js to a supported version (18–22) or use Setup B3 instead.

---

### Setup B3 — Bare Node.js + SQLite Persistence + Tarball

Build on a development machine or in CI (where RAM is plentiful), ship only the resulting tarball to the server. No compilation on the server whatsoever.

**On your dev machine / in CI:**

```bash
pnpm --filter @rozek/sns-websocket-server build
pnpm --filter @rozek/sns-websocket-server pack --pack-destination /tmp/sns-pack/
scp /tmp/sns-pack/rozek-sns-websocket-server-*.tgz user@server:/opt/sns-websocket-server/
```

**On the server:**

```bash
# 1. create the working directory
mkdir -p /opt/sns-websocket-server && cd /opt/sns-websocket-server

# 2. install from the tarball — no compilation whatsoever
npm install --no-optional ./rozek-sns-websocket-server-*.tgz \
  @hono/node-server @hono/node-ws hono jose

# 3. create the entry point
cat > server.mjs << 'EOF'
import { createSNSServer } from '@rozek/sns-websocket-server'

const { start } = createSNSServer()
start()
EOF

# 4. generate a JWT secret (run once, save the output)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 5. start the server
export SNS_JWT_SECRET=<paste-generated-secret-here>
export SNS_PORT=3000
export SNS_HOST=127.0.0.1
export SNS_ISSUER=https://my-server.example.com   # optional
# add SNS_PERSIST_DIR if you want SQLite persistence:
# export SNS_PERSIST_DIR=/var/lib/sns-websocket-server/stores

node server.mjs
```

---

## Directory Structure After Setup (Docker variants)

```
/opt/sns-websocket-server/
├── docker-compose.yml
├── .env                   ← secrets (never commit this file!)
├── .env.example           ← template (safe to commit)
├── Caddyfile
├── generate-admin-token.mjs
└── server/
    ├── Dockerfile
    ├── package.json
    ├── server.mjs              ← entry point
    └── sns-websocket-server.tgz  ← only for Setup A2 (built locally)

Docker named volumes (managed by Docker, independent of /opt/sns-websocket-server/):
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
| `SNS_DOMAIN` | **yes** (Docker) | Subdomain for the SNS server — Caddy requests a TLS certificate for it automatically |
| `ACME_EMAIL` | **yes** (Docker) | E-mail address for Let's Encrypt notifications (shared across all subdomains) |

Generate a strong `SNS_JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Create the First Admin Token

An admin token is required to issue further tokens via `POST /api/token`. Create one **locally** using `generate-admin-token.mjs` — no running server needed:

```bash
SNS_JWT_SECRET=$(grep SNS_JWT_SECRET /opt/sns-websocket-server/.env | cut -d= -f2) \
  STORE_ID=my-store-42 \
  SUBJECT=admin@example.com \
  node /opt/sns-websocket-server/generate-admin-token.mjs
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

### Logs

```bash
docker compose logs -f sns-websocket-server   # application logs
docker compose logs -f caddy                  # TLS / proxy logs
```

### Status and Health

```bash
docker compose ps
docker inspect sns-websocket-server | grep -A5 Health
```

### Backup & Restore

The persistent data lives in two named Docker volumes that are independent of `/opt/sns-websocket-server/`. Access them via a temporary Alpine container. The backup archives are written to the **current working directory** on the host (`$(pwd)`).

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
- Protect the `.env` file: `chmod 600 /opt/sns-websocket-server/.env`
- Admin tokens should have a short lifetime and be rotated after use.
- The SNS server is **not** intended for direct internet exposure — `SNS_HOST=0.0.0.0` applies only within the Docker network; Caddy is the sole publicly reachable service.
- In multi-tenant setups each store should have its own `aud` claim and separate admin tokens.
- TLS certificates are stored in the named Docker volume `caddy_data` — back it up regularly (see Backup & Restore above).
- When `SNS_PERSIST_DIR` is set, back up the named Docker volume `sns_stores` regularly — it contains the authoritative CRDT state for all stores (see Backup & Restore above).
- In relay-only mode (no `SNS_PERSIST_DIR`) the server holds no persistent state; a restart is safe at any time.