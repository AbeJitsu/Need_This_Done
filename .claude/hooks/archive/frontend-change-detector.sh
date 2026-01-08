#!/bin/bash
# PostToolUse Hook: Frontend Change Detector
# What: Tracks frontend file changes for screenshot reminders
# Why: Visual changes should be verified with screenshots
# How: Uses shared utilities, writes to state file

# Source shared utilities (includes recursion guard)
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Read JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .parameters.file_path // empty')

# Only process Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Track frontend files using shared pattern
if is_frontend_file "$FILE_PATH"; then
  track_file "$FRONTEND_CHANGES_FILE" "$FILE_PATH"
fi

exit 0
