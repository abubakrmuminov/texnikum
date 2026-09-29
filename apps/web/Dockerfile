# ==========================================
# Production Dockerfile for @college/web (Next.js)
# Multi-stage build: strips all .ts/.tsx source files from final image
# Architect: Abubakr Muminov
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

# Copy monorepo manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies for build
RUN pnpm install --frozen-lockfile

# Copy source trees needed for building
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared library first
RUN pnpm --filter @college/shared build

# Set build-time env vars (needed for static page generation)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Compile Next.js production build
RUN pnpm --filter @college/web build

# Prune devDependencies to keep image small
RUN pnpm prune --prod

# ==========================================
# Production Runner (Contains ONLY compiled .next bundles & static assets)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Create unprivileged system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy root workspace and production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy compiled shared package
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

# Copy compiled Next.js build and static files (NO src/ code!)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.mjs ./apps/web/next.config.mjs

USER nextjs

EXPOSE 3000

WORKDIR /app/apps/web

CMD ["node", "../../node_modules/next/dist/bin/next", "start", "-p", "3000"]
