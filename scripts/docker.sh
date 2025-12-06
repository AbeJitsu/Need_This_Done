#!/bin/bash
# ============================================================================
# Docker Helper Commands - Simple Names for Your Services
# ============================================================================
# Think of your system like a storefront business:
#   front-door  = Where visitors enter (nginx)
#   website     = Your main site (Next.js)
#   memory      = Helps pages load faster (Redis)
#   store       = Handles shopping (Medusa)
#   store-data  = Product inventory (PostgreSQL)
#   design-tools = Preview your designs (Storybook)
#
# Usage:
#   ./scripts/docker.sh start website
#   ./scripts/docker.sh stop store
#   ./scripts/docker.sh restart memory
#   ./scripts/docker.sh up        # Start everything
#   ./scripts/docker.sh down      # Stop everything
#   ./scripts/docker.sh status    # See what's running
#   ./scripts/docker.sh logs website
# ============================================================================

# Color codes for friendly output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# Service Name Mapping (Friendly → Docker)
# ============================================================================

get_docker_name() {
  case "$1" in
    front-door|gateway)   echo "nginx" ;;
    website|app|site)     echo "nextjs_app" ;;
    memory|cache)         echo "redis" ;;
    store|shop)           echo "medusa_backend" ;;
    store-data|shop-db)   echo "medusa_postgres" ;;
    design-tools|components|storybook) echo "storybook_dev" ;;
    e2e|e2e-tests)        echo "e2e_tests" ;;
    integration|int-tests) echo "integration_tests" ;;
    *)                    echo "$1" ;; # Pass through if already docker name
  esac
}

get_friendly_name() {
  case "$1" in
    nginx)              echo "front-door" ;;
    nextjs_app)         echo "website" ;;
    redis)              echo "memory" ;;
    medusa_backend)     echo "store" ;;
    medusa_postgres)    echo "store-data" ;;
    storybook_dev)      echo "design-tools" ;;
    e2e_tests)          echo "e2e" ;;
    integration_tests)  echo "integration" ;;
    *)                  echo "$1" ;;
  esac
}

# ============================================================================
# Helper Functions
# ============================================================================

show_help() {
  cat << 'EOF'

  Docker Helper - Friendly Commands for Your Services

  SERVICES (use these friendly names):
    front-door    Where visitors enter your site
    website       Your main site that people see
    memory        Helps pages load faster
    store         Handles shopping and checkout
    store-data    Keeps track of products and orders
    design-tools  Preview how things look (dev only)

  COMMANDS:
    start <service>     Start a specific service
    stop <service>      Stop a specific service
    restart <service>   Restart a specific service
    logs <service>      View logs for a service
    up                  Start everything (development mode)
    down                Stop everything
    status              See what's running
    rebuild <service>   Rebuild and restart a service
    fresh               Complete fresh start (removes all data)

  EXAMPLES:
    ./scripts/docker.sh start memory
    ./scripts/docker.sh restart website
    ./scripts/docker.sh logs store
    ./scripts/docker.sh up
    ./scripts/docker.sh status

EOF
}

# ============================================================================
# Commands
# ============================================================================

cmd_start() {
  local service="$1"
  local docker_name=$(get_docker_name "$service")
  local friendly=$(get_friendly_name "$docker_name")

  echo -e "${BLUE}Starting ${friendly}...${NC}"
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d "$docker_name"
  echo -e "${GREEN}${friendly} is now running${NC}"
}

cmd_stop() {
  local service="$1"
  local docker_name=$(get_docker_name "$service")
  local friendly=$(get_friendly_name "$docker_name")

  echo -e "${YELLOW}Stopping ${friendly}...${NC}"
  docker stop "$docker_name" 2>/dev/null || echo -e "${YELLOW}${friendly} wasn't running${NC}"
  echo -e "${GREEN}${friendly} stopped${NC}"
}

cmd_restart() {
  local service="$1"
  local docker_name=$(get_docker_name "$service")
  local friendly=$(get_friendly_name "$docker_name")

  echo -e "${BLUE}Restarting ${friendly}...${NC}"
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart "$docker_name"
  echo -e "${GREEN}${friendly} restarted${NC}"
}

cmd_logs() {
  local service="$1"
  local docker_name=$(get_docker_name "$service")
  local friendly=$(get_friendly_name "$docker_name")

  echo -e "${BLUE}Showing logs for ${friendly}...${NC}"
  docker logs -f "$docker_name"
}

cmd_up() {
  echo -e "${BLUE}Starting all services...${NC}"
  echo ""
  echo "  This will start:"
  echo "    - front-door (entry point)"
  echo "    - website (your main site)"
  echo "    - memory (fast cache)"
  echo "    - store (shopping)"
  echo "    - store-data (product inventory)"
  echo "    - design-tools (component preview)"
  echo ""
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
  echo ""
  echo -e "${GREEN}All services are starting up!${NC}"
  echo ""
  echo "  Access your site at:"
  echo "    - http://localhost:3000 (website)"
  echo "    - http://localhost:6006 (design-tools)"
  echo "    - http://localhost:9000 (store API)"
  echo ""
}

cmd_down() {
  echo -e "${YELLOW}Stopping all services...${NC}"
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
  echo -e "${GREEN}All services stopped${NC}"
}

cmd_status() {
  echo -e "${BLUE}Service Status${NC}"
  echo ""

  local services=("nginx" "nextjs_app" "redis" "medusa_backend" "medusa_postgres" "storybook_dev")

  for docker_name in "${services[@]}"; do
    local friendly=$(get_friendly_name "$docker_name")
    local status=$(docker ps --filter "name=^${docker_name}$" --format "{{.Status}}" 2>/dev/null)

    if [ -n "$status" ]; then
      echo -e "  ${GREEN}●${NC} ${friendly} - running"
    else
      echo -e "  ${RED}○${NC} ${friendly} - stopped"
    fi
  done
  echo ""
}

cmd_rebuild() {
  local service="$1"
  local docker_name=$(get_docker_name "$service")
  local friendly=$(get_friendly_name "$docker_name")

  echo -e "${BLUE}Rebuilding ${friendly}...${NC}"
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache "$docker_name"
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d "$docker_name"
  echo -e "${GREEN}${friendly} rebuilt and running${NC}"
}

cmd_fresh() {
  echo -e "${RED}Fresh Start - This will remove all data!${NC}"
  echo ""
  read -p "Are you sure? (y/n) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping and removing everything...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    echo -e "${GREEN}Fresh start complete!${NC}"
  else
    echo "Cancelled"
  fi
}

# ============================================================================
# Main Entry Point
# ============================================================================

case "$1" in
  start)    cmd_start "$2" ;;
  stop)     cmd_stop "$2" ;;
  restart)  cmd_restart "$2" ;;
  logs)     cmd_logs "$2" ;;
  up)       cmd_up ;;
  down)     cmd_down ;;
  status)   cmd_status ;;
  rebuild)  cmd_rebuild "$2" ;;
  fresh)    cmd_fresh ;;
  help|-h|--help|"")  show_help ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac
