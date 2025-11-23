# #!/bin/bash

# # ============================================================================
# # Claude Code Stop Hook
# # ============================================================================
# # Verifies that all quality checks pass before considering work complete.
# # Runs checks sequentially (fast to slow) and exits on first failure.
# #
# # Checks performed (in order):
# # 1. Type checking (tsc) - ~2-5s
# # 2. Linting (eslint) - ~2-5s
# # 3. Integration tests (vitest + real Docker services) - ~10-30s
# # 4. Build (next build) - ~30-60s
# #
# # Prerequisites:
# # - Docker services must be running: docker-compose up -d
# #
# # Exit codes:
# # 0 = All checks passed, safe to complete
# # 2 = At least one check failed, block completion

# set -e

# PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
# APP_DIR="$PROJECT_DIR/app"

# # If we can't find the app directory, try finding it relative to this script
# if [ ! -d "$APP_DIR" ]; then
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
#   APP_DIR="$PROJECT_DIR/app"
# fi

# # Color codes for output
# RED='\033[0;31m'
# GREEN='\033[0;32m'
# YELLOW='\033[1;33m'
# BLUE='\033[0;34m'
# NC='\033[0m' # No Color

# # ============================================================================
# # Helper Functions
# # ============================================================================

# log_section() {
#   echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
#   echo -e "${BLUE}▶ $1${NC}"
#   echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
# }

# log_success() {
#   echo -e "${GREEN}✓ $1${NC}"
# }

# log_error() {
#   echo -e "${RED}✗ $1${NC}"
# }

# log_warning() {
#   echo -e "${YELLOW}⚠ $1${NC}"
# }

# # ============================================================================
# # Change to app directory
# # ============================================================================

# cd "$APP_DIR" || {
#   log_error "Failed to change to app directory: $APP_DIR"
#   exit 2
# }

# # ============================================================================
# # Run Quality Checks
# # ============================================================================

# # Track if any check failed
# FAILED=false

# # ────────────────────────────────────────────────────────────────────────────
# # 1. TypeScript Type Checking
# # ────────────────────────────────────────────────────────────────────────────

# log_section "Step 1/4: TypeScript Type Checking"

# if npm run type-check 2>&1; then
#   log_success "TypeScript type checking passed"
# else
#   log_error "TypeScript type checking failed"
#   FAILED=true
# fi

# # ────────────────────────────────────────────────────────────────────────────
# # 2. ESLint Linting
# # ────────────────────────────────────────────────────────────────────────────

# log_section "Step 2/4: ESLint Linting"

# if npm run lint 2>&1; then
#   log_success "ESLint linting passed"
# else
#   log_error "ESLint linting failed"
#   FAILED=true
# fi

# # ────────────────────────────────────────────────────────────────────────────
# # 3. Integration Tests (Docker services required)
# # ────────────────────────────────────────────────────────────────────────────

# log_section "Step 3/4: Integration Tests (Real Services)"

# # Check if Redis is accessible - services MUST be running
# if nc -z localhost 6379 2>/dev/null; then
#   log_warning "Docker services detected, running integration tests..."

#   if npm run test:integration:run 2>&1; then
#     log_success "Integration tests passed"
#   else
#     log_error "Integration tests failed"
#     FAILED=true
#   fi
# else
#   log_error "Docker services not detected"
#   echo "Integration tests require Docker services to be running."
#   echo "Start them with:"
#   echo "  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
#   FAILED=true
# fi

# # ────────────────────────────────────────────────────────────────────────────
# # 4. Next.js Build
# # ────────────────────────────────────────────────────────────────────────────

# log_section "Step 4/4: Next.js Build"

# if npm run build 2>&1; then
#   log_success "Next.js build succeeded"
# else
#   log_error "Next.js build failed"
#   FAILED=true
# fi

# # ============================================================================
# # Final Report
# # ============================================================================

# echo ""
# log_section "Quality Check Summary"

# if [ "$FAILED" = false ]; then
#   log_success "All quality checks PASSED! ✓"
#   echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
#   echo -e "${GREEN}Your work is ready:${NC}"
#   echo -e "${GREEN}  • TypeScript types are valid${NC}"
#   echo -e "${GREEN}  • Code follows linting standards${NC}"
#   echo -e "${GREEN}  • Integration tests pass (real services)${NC}"
#   echo -e "${GREEN}  • Application builds successfully${NC}"
#   echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
#   exit 0
# else
#   log_error "Some quality checks FAILED! ✗"
#   echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
#   echo -e "${RED}Please fix the issues above before completing.${NC}"
#   echo -e "${RED}Ensure Docker services are running:${NC}"
#   echo -e "${RED}  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d${NC}"
#   echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
#   exit 2
# fi
