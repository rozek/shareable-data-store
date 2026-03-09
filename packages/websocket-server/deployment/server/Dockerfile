# /opt/sds-server/server/Dockerfile
FROM node:22-alpine

WORKDIR /app

# build tools required to compile better-sqlite3 (native addon)
RUN apk add --no-cache python3 make g++

# install dependencies first so Docker can cache this layer
# sds-websocket-server.tgz is built locally and copied here before docker compose build
# (see DEPLOYMENT.md — Quick Start)
COPY package.json sds-websocket-server.tgz ./
RUN npm install --omit=dev

# entry point
COPY server.mjs ./

# run as a non-root user
USER node

EXPOSE 3000

CMD ["node", "server.mjs"]
