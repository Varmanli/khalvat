# Production Dockerfile for khalvat (Next.js, standalone output).
# Designed for Coolify's "Dockerfile" build pack. No secrets are baked in —
# all values below are supplied by Coolify's build/runtime environment.

# ---- deps: install dependencies reproducibly -------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: typecheck + build --------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# khalvat has no NEXT_PUBLIC_* vars (APP_URL is server-only). DATABASE_URL is
# read at build time by pages that import the DB client at module scope; set
# it as a build variable too (it does not need to be a reachable/real
# connection during build).
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

RUN npx tsc --noEmit
RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3004

# Real secrets (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_SECRET) must be
# provided as runtime environment variables in Coolify — never baked into
# this image. No database migration or seed command runs here.
CMD ["node", "server.js"]
