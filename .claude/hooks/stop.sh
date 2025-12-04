#!/bin/bash
# Check Docker dev containers are running and provide helpful guidance

DOCKER_CMD="docker-compose -f docker-compose.yml -f docker-compose.dev.yml"

# Check if nextjs_app is running
if ! docker ps --format '{{.Names}}' | grep -q 'nextjs_app'; then
  cat >&2 <<'EOF'
Docker containers not running.

Choose a command:

1. First time or need a fresh start:
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

2. Just restart after stopping:
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

3. Something is seriously broken (nuclear option):
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

4. Restart containers after config changes:
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart

EOF
  exit 2
fi

# All containers running
exit 0
