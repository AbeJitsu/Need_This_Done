#!/bin/sh
# ============================================================================
# Medusa Docker Entrypoint Script
# ============================================================================
# What: Runs database migrations before starting the Medusa server
# Why: Ensures database schema is up-to-date on every deployment
# How: Executes migrations, then starts the server

set -e

echo "=========================================="
echo "Medusa Backend Startup"
echo "=========================================="

# ============================================================================
# Verify Environment Variables
# ============================================================================
echo "Verifying required environment variables..."

if [ -z "$JWT_SECRET" ]; then
  echo "✗ ERROR: JWT_SECRET is not set"
  echo "  Check that docker-compose.yml passes JWT_SECRET from .env.local"
  exit 1
fi

if [ -z "$COOKIE_SECRET" ]; then
  echo "✗ ERROR: COOKIE_SECRET is not set"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "✗ ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$REDIS_URL" ]; then
  echo "✗ ERROR: REDIS_URL is not set"
  exit 1
fi

echo "✓ All required environment variables are set"

# ============================================================================
# Run Database Migrations
# ============================================================================

echo "Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully (includes default region setup)"
else
  echo "✗ Migrations failed"
  exit 1
fi

# ============================================================================
# Start Medusa Server
# ============================================================================

echo "Starting Medusa server..."
exec npm start
