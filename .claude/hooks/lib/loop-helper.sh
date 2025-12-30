#!/bin/bash
# ============================================================================
# Loop Helper Library
# ============================================================================
# Shared functions for autonomous loop management.
# Sourced by stop-check.sh, session-start.sh, and loop skills.

# ============================================================================
# PATHS
# ============================================================================
# Determine project directory with fallback if CLAUDE_PROJECT_DIR not set
# Priority: 1) CLAUDE_PROJECT_DIR, 2) git root, 3) walk up to find .claude
_get_project_dir() {
  # Use CLAUDE_PROJECT_DIR if set
  if [[ -n "$CLAUDE_PROJECT_DIR" ]]; then
    echo "$CLAUDE_PROJECT_DIR"
    return 0
  fi

  # Try git root (most reliable)
  local git_root
  git_root="$(git rev-parse --show-toplevel 2>/dev/null)"
  if [[ -n "$git_root" && -d "$git_root/.claude" ]]; then
    echo "$git_root"
    return 0
  fi

  # Walk up from current directory to find .claude
  local dir="$PWD"
  while [[ "$dir" != "/" ]]; do
    if [[ -d "$dir/.claude" ]]; then
      echo "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done

  # Last resort: current directory
  echo "$PWD"
}

_PROJECT_DIR="$(_get_project_dir)"
LOOP_STATE_FILE="$_PROJECT_DIR/.claude/loop-state.json"
TODO_FILE="$_PROJECT_DIR/TODO.md"

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

# Check if loop is currently active
is_loop_active() {
  [[ -f "$LOOP_STATE_FILE" ]] && jq -e '.active == true' "$LOOP_STATE_FILE" >/dev/null 2>&1
}

# Get loop start time (Unix timestamp)
get_loop_start_time() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r '.startTime // 0' "$LOOP_STATE_FILE"
  else
    echo "0"
  fi
}

# Get max hours setting
get_max_hours() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r '.maxHours // 5' "$LOOP_STATE_FILE"
  else
    echo "5"
  fi
}

# Get current iteration count
get_iteration_count() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r '.iterationCount // 0' "$LOOP_STATE_FILE"
  else
    echo "0"
  fi
}

# Increment iteration count
increment_iteration() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    local current=$(get_iteration_count)
    local new=$((current + 1))
    local tmp=$(mktemp)
    jq ".iterationCount = $new" "$LOOP_STATE_FILE" > "$tmp" && mv "$tmp" "$LOOP_STATE_FILE"
  fi
}

# Get elapsed hours since loop start
get_elapsed_hours() {
  local start=$(get_loop_start_time)
  local now=$(date +%s)
  local elapsed=$((now - start))
  echo $((elapsed / 3600))
}

# Get elapsed time formatted (Xh Ym)
get_elapsed_formatted() {
  local start=$(get_loop_start_time)
  local now=$(date +%s)
  local elapsed=$((now - start))
  local hours=$((elapsed / 3600))
  local minutes=$(((elapsed % 3600) / 60))
  echo "${hours}h ${minutes}m"
}

# Check if time limit exceeded
is_time_limit_exceeded() {
  local max_hours=$(get_max_hours)
  local elapsed_hours=$(get_elapsed_hours)
  [[ $elapsed_hours -ge $max_hours ]]
}

# ============================================================================
# TODO.MD PARSING
# ============================================================================

# Count tasks by status
# Note: grep -c outputs "0" when no matches but exits with code 1
# We capture the output and provide default if empty
# Pattern matches: "- [ ]" at start (bullet) or "[ ]" at start of line
# Excludes comment lines (starting with <!--)
count_ready_tasks() {
  local count
  count=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -cE '^-?\s*\[ \]' 2>/dev/null) || true
  echo "${count:-0}"
}

count_in_progress_tasks() {
  local count
  count=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -cE '^-?\s*\[→\]' 2>/dev/null) || true
  echo "${count:-0}"
}

count_completed_tasks() {
  local count
  count=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -cE '^-?\s*\[x\]' 2>/dev/null) || true
  echo "${count:-0}"
}

count_blocked_tasks() {
  local count
  count=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -cE '^-?\s*\[!\]' 2>/dev/null) || true
  echo "${count:-0}"
}

# Check if all tasks are complete (no [ ] or [→] remaining)
all_tasks_complete() {
  local ready=$(count_ready_tasks)
  local in_progress=$(count_in_progress_tasks)
  [[ "$ready" -eq 0 ]] && [[ "$in_progress" -eq 0 ]]
}

# Check for nested tasks (sub-bullets under [ ] items)
has_nested_tasks() {
  # Look for lines that start with whitespace followed by - or * after a [ ] line
  grep -A1 '^\[ \]' "$TODO_FILE" 2>/dev/null | grep -qE '^[[:space:]]+-'
}

# Get first ready task name
get_first_ready_task() {
  grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -E '^-?\s*\[ \]' | head -1 | sed 's/.*\[ \] //'
}

# Get current in-progress task name
get_current_task() {
  grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -E '^-?\s*\[→\]' | head -1 | sed 's/.*\[→\] //'
}

# ============================================================================
# FAILURE TRACKING
# ============================================================================

# Get failure count for a task
get_failure_count() {
  local task_hash=$(echo "$1" | md5sum | cut -c1-8)
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r ".failureCounts[\"$task_hash\"] // 0" "$LOOP_STATE_FILE"
  else
    echo "0"
  fi
}

# Increment failure count for a task
increment_failure_count() {
  local task_hash=$(echo "$1" | md5sum | cut -c1-8)
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    local current=$(get_failure_count "$1")
    local new=$((current + 1))
    local tmp=$(mktemp)
    jq ".failureCounts[\"$task_hash\"] = $new" "$LOOP_STATE_FILE" > "$tmp" && mv "$tmp" "$LOOP_STATE_FILE"
  fi
}

# Reset failure count for a task
reset_failure_count() {
  local task_hash=$(echo "$1" | md5sum | cut -c1-8)
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    local tmp=$(mktemp)
    jq "del(.failureCounts[\"$task_hash\"])" "$LOOP_STATE_FILE" > "$tmp" && mv "$tmp" "$LOOP_STATE_FILE"
  fi
}

# Get max consecutive failures setting
get_max_failures() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r '.maxConsecutiveFailures // 3' "$LOOP_STATE_FILE"
  else
    echo "3"
  fi
}

# ============================================================================
# LOOP LIFECYCLE
# ============================================================================

# Start a new loop
start_loop() {
  local max_hours="${1:-5}"
  local max_failures="${2:-3}"
  local now=$(date +%s)

  cat > "$LOOP_STATE_FILE" << EOF
{
  "active": true,
  "startTime": $now,
  "maxHours": $max_hours,
  "maxConsecutiveFailures": $max_failures,
  "iterationCount": 0,
  "failureCounts": {},
  "cycleNumber": 1,
  "tasksCompleted": 0
}
EOF
}

# End the loop (success or limit)
end_loop() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    local tmp=$(mktemp)
    jq '.active = false' "$LOOP_STATE_FILE" > "$tmp" && mv "$tmp" "$LOOP_STATE_FILE"
  fi
}

# Delete loop state entirely
delete_loop_state() {
  rm -f "$LOOP_STATE_FILE"
}

# Increment tasks completed counter
increment_tasks_completed() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    local current=$(jq -r '.tasksCompleted // 0' "$LOOP_STATE_FILE")
    local new=$((current + 1))
    local tmp=$(mktemp)
    jq ".tasksCompleted = $new" "$LOOP_STATE_FILE" > "$tmp" && mv "$tmp" "$LOOP_STATE_FILE"
  fi
}

# Get tasks completed count
get_tasks_completed() {
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    jq -r '.tasksCompleted // 0' "$LOOP_STATE_FILE"
  else
    echo "0"
  fi
}

# ============================================================================
# SUMMARY GENERATION
# ============================================================================

# Generate loop summary
generate_summary() {
  local elapsed=$(get_elapsed_formatted)
  local iterations=$(get_iteration_count)
  local completed=$(get_tasks_completed)
  local ready=$(count_ready_tasks)
  local blocked=$(count_blocked_tasks)
  local in_progress=$(count_in_progress_tasks)

  echo "Duration:     $elapsed"
  echo "Iterations:   $iterations"
  echo "Completed:    $completed tasks"

  if [[ "$ready" -gt 0 ]]; then
    echo "Remaining:    $ready tasks"
  fi

  if [[ "$in_progress" -gt 0 ]]; then
    echo "In Progress:  $in_progress tasks"
  fi

  if [[ "$blocked" -gt 0 ]]; then
    echo "Blocked:      $blocked tasks (need human attention)"
  fi
}
