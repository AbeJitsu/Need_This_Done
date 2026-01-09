#!/bin/bash
# PreToolUse Hook: Pre-commit accessibility check
# What: Runs before git commit, warns about frontend changes needing a11y tests
# Why: Ensures accessibility is checked before committing UI changes
# How: Checks staged files for frontend patterns, shows reminder

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only check git commit commands
if [[ ! "$COMMAND" =~ ^git\ commit ]]; then
  exit 0
fi

# Get staged files
STAGED=$(cd "$CLAUDE_PROJECT_DIR" && git diff --cached --name-only 2>/dev/null)

if [[ -z "$STAGED" ]]; then
  exit 0
fi

# Check for frontend files that affect accessibility
HAS_FRONTEND=$(echo "$STAGED" | grep -E 'components/.*\.tsx$|\.css$|colors\.ts$|app/.*page\.tsx$|globals\.css$')

if [[ -n "$HAS_FRONTEND" ]]; then
  echo ""
  echo "Frontend files staged for commit:"
  echo "$HAS_FRONTEND" | sed 's/^/  → /'
  echo ""
  echo "Consider: cd app && npm run test:a11y"
  echo ""
fi

# Non-blocking - just a reminder
exit 0
