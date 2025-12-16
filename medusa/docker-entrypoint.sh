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
# Seed Database (optional, errors don't stop server)
# ============================================================================
# Attempts to seed on startup. If products/regions already exist, seed will
# fail gracefully and server will start anyway.

if [ -f "data/seed.json" ]; then
  echo "Attempting to seed database..."
  set +e  # Temporarily disable exit on error
  npm run seed 2>&1
  SEED_EXIT=$?
  set -e  # Re-enable exit on error

  if [ $SEED_EXIT -eq 0 ]; then
    echo "✓ Database seeded successfully"
  else
    echo "⚠ Seed skipped (data likely already exists)"
  fi
else
  echo "⚠ No seed file found, skipping database seeding"
fi

# ============================================================================
# Ready to Start
# ============================================================================
echo "Database migrations complete, starting server..."

# ============================================================================
# Start Medusa Server
# ============================================================================

echo "Starting Medusa server..."
exec npm start
