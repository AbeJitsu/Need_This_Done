# Multi-Stage Production Build for Next.js
# Think of this as assembly line with quality control at each stage.
# We build it in pieces, testing and optimizing as we go,
# then only pack the finished product for shipping (the final stage).
#
# Why multi-stage?
# - Stage 1: Gather all ingredients
# - Stage 2: Prepare ingredients
# - Stage 3: Cook and optimize
# - Stage 4: Package only what's needed (final deliverable)
# Result: Small, fast, production-ready image

# ============================================================================
# Stage 1: Base Image
# ============================================================================
# Start with Node.js 20 on Alpine Linux
# Alpine = tiny Linux distro (5MB vs 200MB)
# node:20-alpine = latest stable Node with production essentials

FROM node:20-alpine AS base

WORKDIR /app

# ============================================================================
# Stage 2: Dependencies - Gather All Ingredients
# ============================================================================
# This stage collects all npm packages the app needs.
# Like shopping for ingredients before cooking - do it once, reuse later.

FROM base AS dependencies

# Copy only package files (not the whole app)
# This allows Docker to cache this layer - reuse it if packages don't change
COPY package*.json ./

# npm ci = "clean install" (exactly as specified, no surprises)
# --frozen-lockfile = use exact versions from package-lock.json
# Ensures identical setup on developer laptop and production server
RUN npm ci --frozen-lockfile

# ============================================================================
# Stage 3: Builder - Cook and Optimize
# ============================================================================
# This stage takes source code and turns it into production-ready files.
# Like actually cooking the meal - the ingredients transform.

FROM dependencies AS builder

# Copy the source code
COPY . .

# Build the Next.js app
# This creates:
# - .next/ folder (compiled JavaScript)
# - public/ folder (images, fonts, etc)
# - Everything optimized for production
RUN npm run build

# ============================================================================
# Stage 4: Runner - Final Package
# ============================================================================
# The final deliverable. Only includes what's needed to RUN the app,
# not the source code or build tools.
# Like shipping the finished meal, not the kitchen.

FROM base AS runner

# Create a non-root user for security
# Apps should never run as root - limits damage if compromised
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application from builder stage
# .next/ = compiled JavaScript
# public/ = static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000 (where Next.js listens)
# Note: NOT exposed to outside world, only to Nginx
EXPOSE 3000

# Environment defaults (can be overridden in docker-compose.yml)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check - is the app responding?
# Curl to /api/health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the app
CMD ["node", "server.js"]
