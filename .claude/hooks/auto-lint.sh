#!/bin/bash
# PostToolUse Hook: Auto-lint
# What: Runs ESLint with --fix on edited .ts/.tsx files
# Why: Ensures code style consistency

# Source shared utilities
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Read JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .parameters.file_path // empty')

# Only process Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Only lint TypeScript files in app/
if ! is_typescript_file "$FILE_PATH" || ! is_in_app_dir "$FILE_PATH"; then
  exit 0
fi

# Skip if node_modules not installed
if [[ ! -d "$CLAUDE_PROJECT_DIR/app/node_modules" ]]; then
  exit 0
fi

# Convert absolute path to relative path from app/ directory
RELATIVE_PATH=$(echo "$FILE_PATH" | sed "s|^.*/app/||")

# Run ESLint with --fix (non-blocking)
cd "$CLAUDE_PROJECT_DIR/app" && npm run lint -- --fix "$RELATIVE_PATH" &>/dev/null || true

exit 0
