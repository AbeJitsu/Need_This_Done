#!/bin/bash
# PostToolUse Hook: Frontend Change Detector
# ============================================================================
# What: Tracks frontend file changes and reminds to capture screenshots
# Why: Visual changes should always be verified with screenshots
# How: Writes changed files to a tracking file, displayed at session end
#
# Files tracked:
# - lib/colors.ts (color system)
# - components/*.tsx (UI components)
# - app/**/page.tsx (pages)
# - globals.css (global styles)
# - tailwind.config.* (Tailwind config)

# Read JSON input from stdin
INPUT=$(cat)

# Extract tool name and file path
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.parameters.file_path // .parameters.path // empty')

# Only process Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Check if this is a frontend file that affects visuals
IS_FRONTEND=false

# Color system
if [[ "$FILE_PATH" =~ lib/colors\.ts$ ]]; then
  IS_FRONTEND=true
fi

# Components
if [[ "$FILE_PATH" =~ components/.*\.tsx$ ]]; then
  IS_FRONTEND=true
fi

# Pages
if [[ "$FILE_PATH" =~ app/.*page\.tsx$ ]]; then
  IS_FRONTEND=true
fi

# Global styles
if [[ "$FILE_PATH" =~ globals\.css$ ]]; then
  IS_FRONTEND=true
fi

# Tailwind config
if [[ "$FILE_PATH" =~ tailwind\.config ]]; then
  IS_FRONTEND=true
fi

# If it's a frontend file, track it
if [[ "$IS_FRONTEND" == "true" ]]; then
  TRACKING_FILE="$CLAUDE_PROJECT_DIR/.claude/frontend-changes.txt"

  # Create tracking file if it doesn't exist
  touch "$TRACKING_FILE"

  # Add file if not already tracked (avoid duplicates)
  if ! grep -qF "$FILE_PATH" "$TRACKING_FILE" 2>/dev/null; then
    echo "$FILE_PATH" >> "$TRACKING_FILE"
  fi
fi

exit 0
