# ── Build stage ──────────────────────────────────────────────
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Copy workspace root files needed for pnpm install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Copy package.json for each workspace member so pnpm resolves correctly
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/

# Copy Prisma schema + config before install (prisma generate runs at install)
COPY apps/api/prisma/schema.prisma apps/api/prisma/
COPY apps/api/prisma.config.ts apps/api/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy API source code and build config
COPY apps/api/ apps/api/

# Generate Prisma client explicitly (in case postinstall didn't fire)
RUN cd apps/api && npx prisma generate

# Build the NestJS API
RUN pnpm --filter api build

# ── Production stage ─────────────────────────────────────────
FROM node:22-slim AS production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy workspace structure files
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy root node_modules (hoisted deps)
COPY --from=base /app/node_modules ./node_modules

# Copy API build output + runtime files
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules

# Copy prisma schema + config (needed at runtime for migrations)
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main"]
