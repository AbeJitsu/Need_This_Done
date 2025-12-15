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
#   ./scripts/docker.sh start website          # Development mode
#   ./scripts/docker.sh --prod restart store   # Production mode
#   ./scripts/docker.sh stop memory
#   ./scripts/docker.sh up                     # Start everything
#   ./scripts/docker.sh --prod up              # Start production
# ============================================================================

# Color codes for friendly output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# Mode Detection (Development vs Production)
# ============================================================================

# Check for --prod flag or DOCKER_MODE environment variable
DOCKER_MODE="${DOCKER_MODE:-development}"
if [[ "$1" == "--prod" ]] || [[ "$1" == "--production" ]]; then
  DOCKER_MODE="production"
  shift  # Remove flag from arguments
fi

# Get docker-compose command with proper flags
get_compose_cmd() {
  # CRITICAL: Always use --env-file to ensure env vars are loaded
  # This fixes the "env vars disappear on restart" issue
  if [[ "$DOCKER_MODE" == "production" ]]; then
    echo "docker-compose --env-file .env.local -f docker-compose.production.yml"
  else
    echo "docker-compose --env-file .env.local -f docker-compose.yml -f docker-compose.dev.yml"
  fi
}

# Display current mode
if [[ "$DOCKER_MODE" == "production" ]]; then
  MODE_DISPLAY="${RED}[PRODUCTION]${NC}"
else
  MODE_DISPLAY="${GREEN}[DEVELOPMENT]${NC}"
fi

# ============================================================================
# Service Name Mapping (Friendly → Docker)
# ============================================================================

# Get service name (for docker-compose commands: build, up, restart)
get_service_name() {
  case "$1" in
    front-door|gateway)   echo "nginx" ;;
    website|app|site)     echo "app" ;;
    memory|cache)         echo "redis" ;;
    store|shop)           echo "medusa" ;;
    store-data|shop-db)   echo "medusa_postgres" ;;
    design-tools|components|storybook) echo "storybook" ;;
    e2e|e2e-tests)        echo "e2e_tests" ;;
    integration|int-tests) echo "integration_tests" ;;
    *)                    echo "$1" ;; # Pass through if already a service name
  esac
}

# Get container name (for docker direct commands: stop, logs, ps)
get_container_name() {
  case "$1" in
    front-door|gateway)   echo "nginx" ;;
    website|app|site)     echo "nextjs_app" ;;
    memory|cache)         echo "redis" ;;
    store|shop)           echo "medusa_backend" ;;
    store-data|shop-db)   echo "medusa_postgres" ;;
    design-tools|components|storybook) echo "storybook_dev" ;;
    e2e|e2e-tests)        echo "e2e_tests" ;;
    integration|int-tests) echo "integration_tests" ;;
    *)                    echo "$1" ;; # Pass through if already a container name
  esac
}

get_friendly_name() {
  case "$1" in
    nginx)              echo "front-door" ;;
    app|nextjs_app)     echo "website" ;;
    redis)              echo "memory" ;;
    medusa|medusa_backend) echo "store" ;;
    medusa_postgres)    echo "store-data" ;;
    storybook|storybook_dev) echo "design-tools" ;;
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

  MODES:
    --prod, --production    Run in production mode (uses docker-compose.production.yml)
                           Default: development mode

  MAIN SERVICES (always running):
    front-door    Where visitors enter your site
    website       Your main site that people see
    memory        Helps pages load faster
    store         Handles shopping and checkout
    store-data    Keeps track of products and orders

  DEVELOPMENT TOOLS (optional):
    design-tools  Preview how things look (Storybook)

  TESTING (run on demand):
    integration   Run integration tests
    e2e           Run end-to-end tests

  COMMANDS:
    start <service>     Start a specific service
    stop <service>      Stop a specific service
    restart <service>   Restart a specific service (supports multiple: website store)
    logs <service>      View logs for a service
    up                  Start everything (development mode)
    down                Stop everything
    status              See what's running
    rebuild <service>   Rebuild and restart a service
    test [type]         Run tests (integration or e2e)
    fresh               Complete fresh start (removes all data)
    after-pull          Restart services after git pull (smart detection)
    fix-checkout        Fix common checkout issues (restart website + store)
    verify-env          Verify critical environment variables are loaded in containers
    seed                Seed database with consultation products

  DEVELOPMENT EXAMPLES:
    ./scripts/docker.sh start memory
    ./scripts/docker.sh restart website
    ./scripts/docker.sh logs store
    ./scripts/docker.sh up
    ./scripts/docker.sh status
    ./scripts/docker.sh test e2e
    ./scripts/docker.sh seed                   Seed products database

  PRODUCTION EXAMPLES (on DigitalOcean):
    ./scripts/docker.sh --prod up              Start production
    ./scripts/docker.sh --prod restart website Restart in production
    ./scripts/docker.sh --prod logs store      View production logs
    ./scripts/docker.sh --prod down            Stop production
    ./scripts/docker.sh --prod verify-env      Check env vars are loaded
    ./scripts/docker.sh --prod seed            Seed production database

  QUICK FIXES:
    ./scripts/docker.sh after-pull                    After git pull
    ./scripts/docker.sh fix-checkout                  Checkout not working
    ./scripts/docker.sh restart website store         Multiple services
    ./scripts/docker.sh --prod restart website store  Production restart

  See README.md → "Docker Development Workflow" for complete restart guidance

EOF
}

# ============================================================================
# Commands
# ============================================================================

cmd_start() {
  local service="$1"
  local service_name=$(get_service_name "$service")
  local friendly=$(get_friendly_name "$service_name")

  echo -e "${MODE_DISPLAY} ${BLUE}Starting ${friendly}...${NC}"
  $(get_compose_cmd) up -d "$service_name"
  echo -e "${GREEN}${friendly} is now running${NC}"
}

cmd_stop() {
  local service="$1"
  local container_name=$(get_container_name "$service")
  local friendly=$(get_friendly_name "$container_name")

  echo -e "${YELLOW}Stopping ${friendly}...${NC}"
  docker stop "$container_name" 2>/dev/null || echo -e "${YELLOW}${friendly} wasn't running${NC}"
  echo -e "${GREEN}${friendly} stopped${NC}"
}

cmd_restart() {
  # Support multiple services: restart website store memory
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No service specified${NC}"
    echo "Usage: ./scripts/docker.sh restart <service> [service2] [service3]..."
    return 1
  fi

  echo -e "${MODE_DISPLAY} ${BLUE}Restarting services...${NC}"
  echo ""

  # Restart each service
  for service in "$@"; do
    local service_name=$(get_service_name "$service")
    local friendly=$(get_friendly_name "$service_name")

    echo -e "  ${YELLOW}→${NC} Restarting ${friendly}..."
    $(get_compose_cmd) restart "$service_name" 2>/dev/null
    if [ $? -eq 0 ]; then
      echo -e "  ${GREEN}✓${NC} ${friendly} restarted"
    else
      echo -e "  ${RED}✗${NC} ${friendly} failed to restart (not running?)"
    fi
  done

  echo ""
  echo -e "${GREEN}Restart complete${NC}"
}

cmd_logs() {
  local service="$1"
  local container_name=$(get_container_name "$service")
  local friendly=$(get_friendly_name "$container_name")

  echo -e "${BLUE}Showing logs for ${friendly}...${NC}"
  docker logs -f "$container_name"
}

cmd_up() {
  echo -e "${MODE_DISPLAY} ${BLUE}Starting all services...${NC}"
  echo ""

  # Create .env symlink if it doesn't exist (fixes docker-compose warnings)
  if [ ! -e .env ] && [ -f .env.local ]; then
    echo -e "${YELLOW}Creating .env symlink to .env.local...${NC}"
    ln -sf .env.local .env
    echo -e "${GREEN}✓ Symlink created${NC}"
    echo ""
  fi

  if [[ "$DOCKER_MODE" == "production" ]]; then
    echo "  Starting production services:"
    echo "    - front-door (nginx with SSL)"
    echo "    - website (Next.js production build)"
    echo "    - memory (Redis cache)"
    echo "    - store (Medusa backend)"
    echo "    - store-data (PostgreSQL)"
  else
    echo "  Starting development services:"
    echo "    - front-door (entry point)"
    echo "    - website (your main site)"
    echo "    - memory (fast cache)"
    echo "    - store (shopping)"
    echo "    - store-data (product inventory)"
    echo "    - design-tools (component preview)"
  fi
  echo ""
  $(get_compose_cmd) up --build -d
  echo ""
  echo -e "${GREEN}All services are starting up!${NC}"
  echo ""
  if [[ "$DOCKER_MODE" == "production" ]]; then
    echo "  Production site will be at:"
    echo "    - https://needthisdone.com (website)"
    echo "    - https://needthisdone.com:9000 (store API)"
  else
    echo "  Access your site at:"
    echo "    - http://localhost:3000 (website)"
    echo "    - http://localhost:6006 (design-tools)"
    echo "    - http://localhost:9000 (store API)"
  fi
  echo ""
}

cmd_down() {
  echo -e "${MODE_DISPLAY} ${YELLOW}Stopping all services...${NC}"
  $(get_compose_cmd) down
  echo -e "${GREEN}All services stopped${NC}"
}

cmd_status() {
  echo -e "${BLUE}Service Status${NC}"
  echo ""
  echo "  Main Services:"

  local main_services=("nginx" "nextjs_app" "redis" "medusa_backend" "medusa_postgres")

  for docker_name in "${main_services[@]}"; do
    local friendly=$(get_friendly_name "$docker_name")
    local status=$(docker ps --filter "name=^${docker_name}$" --format "{{.Status}}" 2>/dev/null)

    if [ -n "$status" ]; then
      echo -e "    ${GREEN}●${NC} ${friendly} - running"
    else
      echo -e "    ${RED}○${NC} ${friendly} - stopped"
    fi
  done

  echo ""
  echo "  Development Tools:"

  local dev_services=("storybook_dev")

  for docker_name in "${dev_services[@]}"; do
    local friendly=$(get_friendly_name "$docker_name")
    local status=$(docker ps --filter "name=^${docker_name}$" --format "{{.Status}}" 2>/dev/null)

    if [ -n "$status" ]; then
      echo -e "    ${GREEN}●${NC} ${friendly} - running"
    else
      echo -e "    ${YELLOW}○${NC} ${friendly} - stopped (optional)"
    fi
  done

  echo ""
  echo "  Test Containers:"

  local test_services=("integration_tests" "e2e_tests")

  for docker_name in "${test_services[@]}"; do
    local friendly=$(get_friendly_name "$docker_name")
    local status=$(docker ps --filter "name=^${docker_name}$" --format "{{.Status}}" 2>/dev/null)

    if [ -n "$status" ]; then
      echo -e "    ${GREEN}●${NC} ${friendly} - running"
    else
      echo -e "    ${YELLOW}○${NC} ${friendly} - not running (run on demand)"
    fi
  done
  echo ""
}

cmd_test() {
  local test_type="$1"

  # Tests only run in development mode
  if [[ "$DOCKER_MODE" == "production" ]]; then
    echo -e "${RED}Error: Tests should not be run in production mode${NC}"
    echo "Remove the --prod flag to run tests"
    return 1
  fi

  case "$test_type" in
    integration|int)
      echo -e "${BLUE}Running integration tests...${NC}"
      docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml up --build --abort-on-container-exit integration_tests
      ;;
    e2e|end-to-end)
      echo -e "${BLUE}Running end-to-end tests...${NC}"
      docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.e2e.yml up --build --abort-on-container-exit e2e_tests
      ;;
    *)
      echo -e "${YELLOW}Choose a test type:${NC}"
      echo "  ./scripts/docker.sh test integration"
      echo "  ./scripts/docker.sh test e2e"
      ;;
  esac
}

cmd_rebuild() {
  local service="$1"
  local service_name=$(get_service_name "$service")
  local friendly=$(get_friendly_name "$service_name")

  echo -e "${MODE_DISPLAY} ${BLUE}Rebuilding ${friendly}...${NC}"
  $(get_compose_cmd) build --no-cache "$service_name"
  $(get_compose_cmd) up -d "$service_name"
  echo -e "${GREEN}${friendly} rebuilt and running${NC}"
}

cmd_fresh() {
  echo -e "${MODE_DISPLAY} ${RED}Fresh Start - This will remove all data!${NC}"
  echo ""
  read -p "Are you sure? (y/n) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create .env symlink if it doesn't exist (fixes docker-compose warnings)
    if [ ! -e .env ] && [ -f .env.local ]; then
      echo -e "${YELLOW}Creating .env symlink to .env.local...${NC}"
      ln -sf .env.local .env
      echo -e "${GREEN}✓ Symlink created${NC}"
    fi

    echo -e "${YELLOW}Stopping and removing everything...${NC}"
    $(get_compose_cmd) down -v
    $(get_compose_cmd) build --no-cache
    $(get_compose_cmd) up -d
    echo -e "${GREEN}Fresh start complete!${NC}"
  else
    echo "Cancelled"
  fi
}

cmd_after_pull() {
  echo -e "${BLUE}Smart Restart After Git Pull${NC}"
  echo ""
  echo "Detecting what changed..."
  echo ""

  local changed_files=$(git diff HEAD@{1} --name-only 2>/dev/null || echo "")
  local restart_services=()

  # Check what directories changed
  if echo "$changed_files" | grep -q "^app/"; then
    restart_services+=("website")
    echo -e "  ${YELLOW}•${NC} Detected app/ changes → will restart website"
  fi

  if echo "$changed_files" | grep -q "^medusa/"; then
    restart_services+=("store")
    echo -e "  ${YELLOW}•${NC} Detected medusa/ changes → will restart store"
  fi

  if echo "$changed_files" | grep -q "^nginx/"; then
    restart_services+=("front-door")
    echo -e "  ${YELLOW}•${NC} Detected nginx/ changes → will restart front-door"
  fi

  if echo "$changed_files" | grep -q ".env"; then
    # If services not already in list, add them
    [[ " ${restart_services[@]} " =~ " website " ]] || restart_services+=("website")
    [[ " ${restart_services[@]} " =~ " store " ]] || restart_services+=("store")
    echo -e "  ${YELLOW}•${NC} Detected .env changes → will restart website + store"
  fi

  if [ ${#restart_services[@]} -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} No service restarts needed (only docs/config changed)"
    echo ""
    return 0
  fi

  echo ""
  echo -e "${BLUE}Restarting: ${restart_services[*]}${NC}"
  echo ""

  cmd_restart "${restart_services[@]}"
}

cmd_fix_checkout() {
  echo -e "${BLUE}Fixing Checkout Issues${NC}"
  echo ""
  echo "This will:"
  echo "  • Restart website (Next.js app + API routes)"
  echo "  • Restart store (Medusa backend)"
  echo "  • Clear any stuck payment sessions"
  echo ""

  cmd_restart website store

  echo ""
  echo -e "${GREEN}Checkout fix complete!${NC}"
  echo ""
  echo "Try the checkout flow again at https://localhost/checkout"
}

cmd_verify_env() {
  echo -e "${BLUE}Verifying environment variables in containers...${NC}"
  echo ""

  local errors=0

  # Check if containers are running first
  if ! docker ps --format '{{.Names}}' | grep -q "medusa_backend"; then
    echo -e "${YELLOW}⚠ Medusa container not running, skipping verification${NC}"
    return 0
  fi

  # Check Medusa backend has critical env vars
  echo -e "  Checking ${YELLOW}Medusa${NC} backend..."

  if ! docker exec medusa_backend printenv JWT_SECRET > /dev/null 2>&1; then
    echo -e "    ${RED}✗ JWT_SECRET missing${NC}"
    echo -e "      Fix: Add 'env_file: - .env.local' to medusa service in docker-compose"
    errors=$((errors + 1))
  else
    echo -e "    ${GREEN}✓ JWT_SECRET loaded${NC}"
  fi

  if ! docker exec medusa_backend printenv COOKIE_SECRET > /dev/null 2>&1; then
    echo -e "    ${RED}✗ COOKIE_SECRET missing${NC}"
    errors=$((errors + 1))
  else
    echo -e "    ${GREEN}✓ COOKIE_SECRET loaded${NC}"
  fi

  # Check Next.js app has critical env vars
  if docker ps --format '{{.Names}}' | grep -q "nextjs_app"; then
    echo -e "  Checking ${YELLOW}Next.js${NC} app..."

    if ! docker exec nextjs_app printenv NEXT_PUBLIC_SUPABASE_URL > /dev/null 2>&1; then
      echo -e "    ${RED}✗ NEXT_PUBLIC_SUPABASE_URL missing${NC}"
      errors=$((errors + 1))
    else
      echo -e "    ${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL loaded${NC}"
    fi

    if ! docker exec nextjs_app printenv SUPABASE_SERVICE_ROLE_KEY > /dev/null 2>&1; then
      echo -e "    ${RED}✗ SUPABASE_SERVICE_ROLE_KEY missing${NC}"
      errors=$((errors + 1))
    else
      echo -e "    ${GREEN}✓ SUPABASE_SERVICE_ROLE_KEY loaded${NC}"
    fi
  fi

  echo ""
  if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ All critical environment variables verified${NC}"
    return 0
  else
    echo -e "${RED}✗ Found $errors missing environment variable(s)${NC}"
    echo -e "${YELLOW}Run: ./scripts/docker.sh --prod up${NC} to rebuild with correct env vars"
    return 1
  fi
}

cmd_seed() {
  echo -e "${MODE_DISPLAY} ${BLUE}Seeding Products Database${NC}"
  echo ""

  # Check if Medusa container is running
  if ! docker ps --format '{{.Names}}' | grep -q "medusa_backend"; then
    echo -e "${RED}✗ Medusa container not running${NC}"
    echo -e "${YELLOW}Start services first: ./scripts/docker.sh up${NC}"
    return 1
  fi

  # Get admin password from environment or use default
  local admin_password="${MEDUSA_ADMIN_PASSWORD:-admin123}"

  echo "Step 1: Creating admin user..."
  docker exec medusa_backend npm run seed:admin 2>&1 | grep -E "✓|✗|Created|already exists|Error" || true
  echo ""

  echo "Step 2: Seeding consultation products..."
  docker exec -e MEDUSA_ADMIN_PASSWORD="$admin_password" medusa_backend node seed-products.js

  local exit_code=$?
  echo ""

  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
    echo ""
    if [[ "$DOCKER_MODE" == "production" ]]; then
      echo "  Verify at: https://needthisdone.com/shop"
    else
      echo "  Verify at: https://localhost/shop"
    fi
  else
    echo -e "${RED}✗ Seeding failed${NC}"
    return 1
  fi
}

# ============================================================================
# Main Entry Point
# ============================================================================

case "$1" in
  start)    cmd_start "$2" ;;
  stop)     cmd_stop "$2" ;;
  restart)  shift; cmd_restart "$@" ;;  # Support multiple services
  logs)     cmd_logs "$2" ;;
  up)       cmd_up ;;
  down)     cmd_down ;;
  status)   cmd_status ;;
  rebuild)  cmd_rebuild "$2" ;;
  test)     cmd_test "$2" ;;
  fresh)    cmd_fresh ;;
  after-pull) cmd_after_pull ;;
  fix-checkout) cmd_fix_checkout ;;
  verify-env) cmd_verify_env ;;
  seed)     cmd_seed ;;
  help|-h|--help|"")  show_help ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac
