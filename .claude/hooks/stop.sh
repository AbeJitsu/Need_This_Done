#!/bin/bash
# Multi-Container Health Check for Docker Development Environment

# Exit gracefully if Docker isn't available
command -v docker &> /dev/null || exit 0

# Define expected containers
EXPECTED_CONTAINERS=(
  "nextjs_app"
  "nginx"
  "redis"
  "storybook_dev"
)

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

# If any containers are down, show helpful menu
if [ ${#down_containers[@]} -gt 0 ]; then
  cat >&2 <<EOF
Hey! Looks like some of your Docker containers aren't running.

Containers currently DOWN:
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

  # Trigger Docker troubleshooting skill
  cat >&2 <<'EOF'

🔧 Docker Troubleshooting Activated

I'm running intelligent diagnostics to figure out what went wrong:
  • Checking container status and exit codes
  • Analyzing Docker logs for error messages
  • Identifying the root cause
  • Determining the best recovery path

Once I've diagnosed the issue, I'll recommend a fix and ask your permission before running it.

EOF

  exit 2
fi

# All containers running - we're good!
exit 0
