# ============================================================================
# Medusa Backend Dockerfile
# ============================================================================
# Builds the Medusa headless ecommerce backend service
# Runs on port 9000 within the Docker network

FROM node:20-alpine

WORKDIR /app

# ============================================================================
# Install dependencies (including dev for TypeScript compilation)
# ============================================================================
COPY package.json ./
RUN npm install --legacy-peer-deps

# ============================================================================
# Copy source code
# ============================================================================
COPY . .

# ============================================================================
# Build TypeScript
# ============================================================================
RUN npm run build

# ============================================================================
# Patch TypeORM empty criteria issue in PaymentProviderService
# ============================================================================
# TypeORM 0.3.23+ rejects empty criteria in update(). Medusa uses this pattern:
#   model.update({}, { is_installed: false })
# We patch to use createQueryBuilder which works with all TypeORM versions.
COPY patch-typeorm.js /app/patch-typeorm.js
RUN node /app/patch-typeorm.js && rm /app/patch-typeorm.js

# ============================================================================
# Copy entrypoint script
# ============================================================================
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ============================================================================
# NOTE: Keep dev dependencies (needed for migrations)
# ============================================================================
# RUN npm prune --production

# ============================================================================
# Expose port
# ============================================================================
EXPOSE 9000

# ============================================================================
# Health check
# ============================================================================
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# ============================================================================
# Start Medusa (runs migrations then starts server)
# ============================================================================
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
