#!/bin/bash
# PostToolUse Hook: Session Tracker
# What: Tracks all files modified by this session
# Why: Enables multi-instance parallel work, uncommitted change detection

echo "SESSION TRACKER FIRED"

# Source shared utilities
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Read JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // .tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .parameters.file_path // empty')

# Only process Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Track the file if we have a path and session file
if [[ -n "$FILE_PATH" ]] && [[ -n "$SESSION_CHANGES_FILE" ]]; then
  track_file "$SESSION_CHANGES_FILE" "$FILE_PATH"
fi

exit 0
