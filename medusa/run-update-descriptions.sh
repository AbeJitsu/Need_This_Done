#!/bin/bash
# Wrapper script to run update-product-descriptions.js inside the Medusa container
# This ensures reliable access to Medusa API on port 9000

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_FILE="$SCRIPT_DIR/update-product-descriptions.js"

# Check if script exists
if [ ! -f "$SCRIPT_FILE" ]; then
  echo "Error: $SCRIPT_FILE not found"
  exit 1
fi

# Check if Medusa container is running
if ! docker ps --format '{{.Names}}' | grep -q '^medusa_backend$'; then
  echo "Error: medusa_backend container is not running"
  echo "Start the dev environment with: npm run dev:start"
  exit 1
fi

echo "Copying script to Medusa container..."
docker cp "$SCRIPT_FILE" medusa_backend:/app/update-descriptions.js

echo "Running update script..."
docker exec medusa_backend node /app/update-descriptions.js

# Cleanup
docker exec medusa_backend rm -f /app/update-descriptions.js
