#!/bin/bash
# PostToolUse Hook: Auto-lint + Auto-changelog
# What:
#   1. Runs ESLint with --fix on edited .ts/.tsx files
#   2. Updates auto-log.json after git commits
# Why: Ensures code style + maintains automatic changelog

# Source shared utilities (includes recursion guard)
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Read JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .parameters.file_path // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# ============================================
# FEATURE 1: AUTO-CHANGELOG ON COMMIT
# Updates content/changelog/auto-log.json after git commits
# ============================================
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$COMMAND" =~ ^git\ commit ]]; then
  AUTO_LOG="$_PROJECT_DIR/content/changelog/auto-log.json"

  # Get latest commit info with proper date formatting
  # Using %cs (committer date short) and %ci (ISO format) for reliable parsing
  # Avoids --date=format: which can be unreliable in some shell contexts
  cd "$_PROJECT_DIR"
  HASH=$(git log -1 --format='%h' 2>/dev/null)
  DATE=$(git log -1 --format='%cs' 2>/dev/null)
  TIME=$(git log -1 --format='%ci' 2>/dev/null | cut -d' ' -f2 | cut -d: -f1,2)
  AUTHOR=$(git log -1 --format='%an' 2>/dev/null)
  MESSAGE=$(git log -1 --format='%s' 2>/dev/null)
  FILES_CHANGED=$(git log -1 --stat --format='' 2>/dev/null | tail -1 | grep -oE '[0-9]+' | head -1 || echo "0")

  # Determine category from commit message prefix
  CATEGORY="Other"
  [[ "$MESSAGE" =~ ^Fix:|^fix: ]] && CATEGORY="Fixes"
  [[ "$MESSAGE" =~ ^Feat:|^feat:|^Add:|^add: ]] && CATEGORY="Features"
  [[ "$MESSAGE" =~ ^Refactor:|^refactor: ]] && CATEGORY="Refactoring"
  [[ "$MESSAGE" =~ ^Docs:|^docs: ]] && CATEGORY="Documentation"
  [[ "$MESSAGE" =~ ^Test:|^test: ]] && CATEGORY="Testing"
  [[ "$MESSAGE" =~ ^Style:|^style: ]] && CATEGORY="Styling"
  [[ "$MESSAGE" =~ ^Config:|^config:|^Chore:|^chore: ]] && CATEGORY="Configuration"
  [[ "$MESSAGE" =~ ^Security:|^security: ]] && CATEGORY="Security"

  if [[ -n "$HASH" ]]; then
    # Create new entry JSON
    NEW_ENTRY=$(jq -n \
      --arg hash "$HASH" \
      --arg date "$DATE" \
      --arg time "$TIME" \
      --arg author "$AUTHOR" \
      --arg message "$MESSAGE" \
      --arg category "$CATEGORY" \
      --argjson files "${FILES_CHANGED:-0}" \
      '{hash: $hash, date: $date, time: $time, author: $author, message: $message, category: $category, filesChanged: $files}')

    # Prepend to existing array (or create new one)
    if [[ -f "$AUTO_LOG" ]] && jq -e '.' "$AUTO_LOG" >/dev/null 2>&1; then
      # Valid JSON exists - prepend new entry
      jq --argjson new "$NEW_ENTRY" '[$new] + .' "$AUTO_LOG" > "$AUTO_LOG.tmp" && mv "$AUTO_LOG.tmp" "$AUTO_LOG"
    else
      # Create new file with single entry
      echo "[$NEW_ENTRY]" | jq '.' > "$AUTO_LOG"
    fi
  fi

  exit 0
fi

# Only process Edit and Write tools for linting
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# ============================================
# SESSION TRACKING
# Track all files modified by this session
# Enables multi-instance parallel work
# ============================================
if [[ -n "$FILE_PATH" ]] && [[ -n "$SESSION_CHANGES_FILE" ]]; then
  track_file "$SESSION_CHANGES_FILE" "$FILE_PATH"
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
