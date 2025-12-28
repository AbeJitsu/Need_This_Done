#!/bin/bash
# Git Pre-Commit Hook: Accessibility Check Warning
# ============================================================================
# What: Warns about changes that could affect accessibility
# Why: Ensures developers remember to run accessibility tests
# How: Checks if color/styling files were modified, displays reminder
#
# Installation:
#   ln -sf ../../.claude/hooks/git-pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit

# Colors for output
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Files that affect accessibility
A11Y_PATTERNS=(
  "lib/colors.ts"
  "globals.css"
  "tailwind.config"
  "components/"
  "app/"
)

# Check if any accessibility-related files are staged
HAS_A11Y_CHANGES=false
CHANGED_FILES=()

for pattern in "${A11Y_PATTERNS[@]}"; do
  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      HAS_A11Y_CHANGES=true
      CHANGED_FILES+=("$file")
    fi
  done < <(echo "$STAGED_FILES" | grep -E "$pattern" || true)
done

# If accessibility-related files changed, show reminder
if [[ "$HAS_A11Y_CHANGES" == "true" ]]; then
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}⚠️  Accessibility Check Reminder${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Files that may affect accessibility:"
  for file in "${CHANGED_FILES[@]}"; do
    echo -e "  ${BLUE}→${NC} $file"
  done
  echo ""
  echo -e "${GREEN}Before pushing, consider running:${NC}"
  echo "  cd app && npm run test:a11y"
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
fi

# Always allow commit (non-blocking)
exit 0
