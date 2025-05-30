# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat build-base python3
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* prisma ./
RUN npm install -g node-gyp
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# COOLIFY BUILD ENV VARIABLES
ARG NEXT_PUBLIC_URL
ARG NEYNAR_API_KEY
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_IS_TEST_MODE
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_DISABLED
ARG JWT_SECRET
ARG SUPABASE_SERVICE_KEY
ARG DIRECT_URL
ARG SUPABASE_URL
ARG DATABASE_URL
ARG OPENAI_API_KEY
ARG MIDJOURNEY_API_KEY
ARG PINATA_JWT_SECRET
ARG NEXT_PUBLIC_GATEWAY_URL
ARG SIGNER_PRIVATE_KEY
ARG NEXT_PUBLIC_DAIMO_PAY_ID
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_REOWN_DOMAIN_VERIFICATION_CODE
ARG NEXT_PUBLIC_FARCASTER_HEADER
ARG NEXT_PUBLIC_FARCASTER_PAYLOAD
ARG NEXT_PUBLIC_FARCASTER_SIGNATURE
ARG NEXT_PUBLIC_IS_TEST_MODE
ARG FARVILLE_SERVICE_URL
ARG FARVILLE_SERVICE_API_KEY
ARG NEXT_PUBLIC_SOCKET_URL

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]