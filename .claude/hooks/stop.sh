#!/bin/bash
# Check Docker dev containers are running (hot reload catches errors)

if ! docker ps --format '{{.Names}}' | grep -q 'nextjs_app'; then
  echo "Docker containers not running. Start with:" >&2
  echo "  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up" >&2
  exit 2
fi

# Silent success
exit 0
