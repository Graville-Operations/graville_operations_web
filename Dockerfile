# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.20.2

# Stage 1: install all deps (including dev deps, needed for `next build`)
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Stage 2: build the Next.js app
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Needed at build time since Next.js inlines NEXT_PUBLIC_* vars into the client bundle
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Requires `output: 'standalone'` in next.config.js
RUN npm run build

# Stage 3: minimal production runtime
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Run the application as a non-root user.
USER node

# Standalone output already contains only what's needed to run the server —
# no node_modules, no source files, no devDependencies.
COPY --from=builder --chown=node:node /usr/src/app/public ./public
COPY --from=builder --chown=node:node /usr/src/app/.next/standalone ./
COPY --from=builder --chown=node:node /usr/src/app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]