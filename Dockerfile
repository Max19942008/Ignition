# ---- build stage ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .
# next.config.js inlines these into the client bundle at build time
ARG REACT_APP_API_URL
ARG REACT_APP_API_GRAPHQL_URL
ARG REACT_APP_API_WS
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_API_GRAPHQL_URL=$REACT_APP_API_GRAPHQL_URL \
    REACT_APP_API_WS=$REACT_APP_API_WS \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=3072
RUN yarn build \
 && yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

# ---- runtime stage ----
FROM node:20-bookworm-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/next.config.js /app/next-i18next.config.js ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
