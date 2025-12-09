#!/bin/bash

# Pre-commit hook: Runs TypeScript type-check before git commits
# This prevents broken code from being committed in the first place

# Get the command being executed
COMMAND=$(jq -r '.tool_input.command // ""' 2>/dev/null)

# Check if this is a git commit command
if echo "$COMMAND" | grep -q '^git.*commit'; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Running TypeScript type-check before commit..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Navigate to app directory (handle both $CLAUDE_PROJECT_DIR set and relative paths)
  if [ -n "$CLAUDE_PROJECT_DIR" ]; then
    cd "$CLAUDE_PROJECT_DIR/app" || exit 2
  else
    cd "app" || exit 2
  fi

  npm run type-check

  if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Type-check failed! Commit blocked."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Fix the TypeScript errors above and try again."
    echo ""
    exit 2  # Exit code 2 blocks the tool call
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Type-check passed! Proceeding with commit..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi

exit 0
