#!/bin/bash
# Reliable dev server restart
# Usage: ./scripts/dev-server.sh
#
# Kills any existing server on port 3000, cleans .next cache,
# and starts fresh from the correct directory.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"

# 1. Kill any process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. Clean .next if it exists (prevents stale cache)
rm -rf "$APP_DIR/.next"

# 3. Start dev server from correct directory
cd "$APP_DIR" && npm run dev
