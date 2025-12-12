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
