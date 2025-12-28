#!/bin/bash
# PostToolUse Hook: TypeScript Type Check
# What: Runs fast type-check after TypeScript file edits
# Why: Catches type errors immediately without slow test runs
# How: Debounced tsc --noEmit, non-blocking

# Source shared utilities (includes recursion guard)
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Read JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only process Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Only process TypeScript files in app/
if ! is_typescript_file "$FILE_PATH" || ! is_in_app_dir "$FILE_PATH"; then
  exit 0
fi

# Mark that type-check is needed
touch "$TYPE_CHECK_NEEDED_FILE"

# Debounce: only run type-check every 10 seconds
if ! should_run_debounced "$LAST_TYPE_CHECK_FILE" 10; then
  exit 0
fi

# Check if type-check is actually needed
if [[ ! -f "$TYPE_CHECK_NEEDED_FILE" ]]; then
  exit 0
fi

# Run type-check in background (non-blocking)
(
  cd "$CLAUDE_PROJECT_DIR/app" || exit 0

  # Skip if node_modules not installed
  [[ ! -d "node_modules" ]] && exit 0

  # Run type-check, capture output
  OUTPUT=$(npx tsc --noEmit 2>&1)
  EXIT_CODE=$?

  # Clear the "needed" marker
  rm -f "$TYPE_CHECK_NEEDED_FILE"

  # Only report if there are errors
  if [[ $EXIT_CODE -ne 0 ]]; then
    echo "" >&2
    echo "TypeScript errors detected:" >&2
    echo "$OUTPUT" | head -20 >&2
    echo "" >&2
  fi
) &

exit 0
