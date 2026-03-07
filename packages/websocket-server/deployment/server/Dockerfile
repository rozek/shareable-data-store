# /opt/sns-server/server/Dockerfile
FROM node:22-alpine

WORKDIR /app

# install dependencies first so Docker can cache this layer
COPY package.json ./
RUN npm install --omit=dev

# entry point
COPY server.mjs ./

# run as a non-root user
USER node

EXPOSE 3000

CMD ["node", "server.mjs"]
