#!/bin/bash
# Shared Hook Utilities
# What: Single source of truth for patterns, paths, and helper functions
# Why: DRY - avoid duplicating logic across hooks

# ============================================
# RECURSION GUARD
# Prevents hooks from triggering themselves
# ============================================
if [[ -n "$CLAUDE_HOOK_RUNNING" ]]; then
  exit 0
fi
export CLAUDE_HOOK_RUNNING=1

# ============================================
# STATE FILE PATHS
# All hook state lives in .claude/state/
# ============================================
STATE_DIR="$CLAUDE_PROJECT_DIR/.claude/state"
mkdir -p "$STATE_DIR" 2>/dev/null

export FRONTEND_CHANGES_FILE="$STATE_DIR/frontend-changes.txt"
export TYPE_CHECK_NEEDED_FILE="$STATE_DIR/type-check-needed"
export LAST_TYPE_CHECK_FILE="$STATE_DIR/last-type-check"

# ============================================
# FRONTEND FILE DETECTION
# Single regex for all frontend file detection
# ============================================
export FRONTEND_PATTERN='(lib/colors\.ts|components/.*\.tsx|app/.*page\.tsx|globals\.css|tailwind\.config)'

is_frontend_file() {
  local file_path="$1"
  [[ "$file_path" =~ $FRONTEND_PATTERN ]]
}

# ============================================
# TYPESCRIPT FILE DETECTION
# ============================================
is_typescript_file() {
  local file_path="$1"
  [[ "$file_path" =~ \.(ts|tsx)$ ]] && [[ ! "$file_path" =~ node_modules|\.next|dist|build ]]
}

is_in_app_dir() {
  local file_path="$1"
  [[ "$file_path" =~ /app/ ]]
}

# ============================================
# TRACKING HELPERS
# ============================================
track_file() {
  local tracking_file="$1"
  local file_path="$2"

  touch "$tracking_file"
  if ! grep -qF "$file_path" "$tracking_file" 2>/dev/null; then
    echo "$file_path" >> "$tracking_file"
  fi
}

get_tracked_count() {
  local tracking_file="$1"
  [[ -f "$tracking_file" ]] && wc -l < "$tracking_file" | tr -d ' ' || echo "0"
}

clear_tracking() {
  local tracking_file="$1"
  rm -f "$tracking_file"
}

# ============================================
# DEBOUNCE HELPER
# Prevents running too frequently
# ============================================
should_run_debounced() {
  local marker_file="$1"
  local debounce_seconds="${2:-5}"

  if [[ ! -f "$marker_file" ]]; then
    touch "$marker_file"
    return 0
  fi

  local last_run=$(stat -f %m "$marker_file" 2>/dev/null || stat -c %Y "$marker_file" 2>/dev/null)
  local now=$(date +%s)
  local diff=$((now - last_run))

  if [[ $diff -ge $debounce_seconds ]]; then
    touch "$marker_file"
    return 0
  fi

  return 1
}
