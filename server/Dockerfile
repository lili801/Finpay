FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm ci --omit=dev --workspace server --include-workspace-root

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup --system --gid 1001 finpay \
  && adduser --system --uid 1001 --ingroup finpay finpay

COPY --from=dependencies --chown=finpay:finpay /app/node_modules ./node_modules
COPY --from=dependencies --chown=finpay:finpay /app/server/node_modules ./server/node_modules
COPY --chown=finpay:finpay server/package.json ./server/package.json
COPY --chown=finpay:finpay server/src ./server/src

USER finpay

EXPOSE 4000

CMD ["node", "server/src/server.js"]
