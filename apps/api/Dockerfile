# ==========================================
# Production Dockerfile for @college/api (NestJS)
# Multi-stage build ensuring zero source .ts files in runtime image
# Architect: Abubakr Muminov
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install full dependencies for building
RUN pnpm install --frozen-lockfile

# Copy source trees for compilation
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Compile shared library and NestJS backend
RUN pnpm --filter @college/shared build
RUN pnpm --filter @college/api build

# Prune devDependencies to reduce image weight
RUN pnpm prune --prod

# ==========================================
# Production Runner (Contains ONLY compiled dist, NO .ts sources)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create unprivileged system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy root workspace files and production node_modules
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy compiled shared package
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

# Copy compiled API binary artifacts (compiled dist only)
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

USER nestjs

EXPOSE 4000

CMD ["node", "apps/api/dist/main"]
