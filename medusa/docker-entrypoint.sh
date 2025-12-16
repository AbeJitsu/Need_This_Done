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
# Seed Database (if seed file exists)
# ============================================================================
# Automatically populate with consultation products and regions on first start
# This ensures products are available immediately after deployment

if [ -f "src/seeds/seed.ts" ]; then
  echo "Seeding database with consultation products..."
  npm run seed

  if [ $? -eq 0 ]; then
    echo "✓ Database seeded successfully"
  else
    echo "⚠ Seed completed with warnings (products may have been partially created)"
  fi
else
  echo "⚠ No seed file found, skipping database seeding"
fi

# ============================================================================
# Verify Products Exist Before Starting Server
# ============================================================================
# Wait up to 30 seconds for products to be available
# This ensures the app doesn't become available until products are ready

echo "Verifying products are available..."
MAX_RETRIES=6
RETRY=1

while [ $RETRY -le $MAX_RETRIES ]; do
  PRODUCT_COUNT=$(psql "$DATABASE_URL" -tc "SELECT COUNT(*) FROM product WHERE deleted_at IS NULL;" 2>/dev/null | tr -d ' ')

  if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo "✓ Found $PRODUCT_COUNT products in database"
    break
  fi

  if [ $RETRY -lt $MAX_RETRIES ]; then
    echo "  Attempt $RETRY/$MAX_RETRIES: No products yet, retrying in 5s..."
    sleep 5
  fi

  RETRY=$((RETRY + 1))
done

if [ "$PRODUCT_COUNT" -eq 0 ]; then
  echo "⚠ Warning: No products found, but starting server anyway"
fi

# ============================================================================
# Start Medusa Server
# ============================================================================

echo "Starting Medusa server..."
exec npm start
