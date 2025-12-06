#!/bin/bash
# Multi-Container Health Check for Docker Development Environment

# Define expected containers
EXPECTED_CONTAINERS=(
  "nextjs_app"
  "nginx"
  "redis"
  "storybook_dev"
)

# First, check if Docker daemon is accessible
if ! docker ps &>/dev/null; then
  cat >&2 <<'EOF'
⚠️  Docker daemon is not running

Your Docker containers can't be accessed because Docker Desktop isn't running.

Quick fix:
  1. Open Docker Desktop from your Applications folder
  2. Wait for the whale icon in your menu bar to stop animating
  3. Try again!

You can also enable "Start Docker Desktop when you log in" in Docker Settings → General
if you'd like it to auto-start next time.

EOF
  exit 0
fi

# Check which containers are running
running_containers=$(docker ps --format '{{.Names}}')

# Track which containers are down
down_containers=()

# Check each expected container
for container in "${EXPECTED_CONTAINERS[@]}"; do
  if ! echo "$running_containers" | grep -q "^${container}$"; then
    down_containers+=("$container")
  fi
done

# If any containers are down, ask user if they want to start them
if [ ${#down_containers[@]} -gt 0 ]; then
  cat >&2 <<EOF
📦 Some Docker containers aren't running:
EOF

  # List each down container with description
  for container in "${down_containers[@]}"; do
    case $container in
      nextjs_app) echo "  • nextjs_app (your Next.js application)" >&2 ;;
      nginx) echo "  • nginx (HTTPS entry point)" >&2 ;;
      redis) echo "  • redis (cache and sessions)" >&2 ;;
      storybook_dev) echo "  • storybook_dev (component library)" >&2 ;;
    esac
  done

  # Prompt user for action
  echo "" >&2
  read -p "Would you like to start them? (y/n) " -n 1 -r -t 10 choice
  echo "" >&2

  if [[ $choice =~ ^[Yy]$ ]]; then
    echo "Starting Docker containers..." >&2
    docker-compose up -d
    if [ $? -eq 0 ]; then
      echo "✅ Containers started successfully!" >&2
      exit 0
    else
      echo "❌ Failed to start containers. Check Docker logs for details." >&2
      exit 0
    fi
  else
    echo "Skipping container startup." >&2
    exit 0
  fi
fi

# All containers running - we're good!
exit 0
