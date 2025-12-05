# Claude Code Hooks Reference Guide

This guide documents all available Claude Code hooks with practical examples tailored to this project's needs (Next.js with Docker, E2E testing, and accessibility).

**Current Setup**: We have a [Stop hook](.claude/hooks/stop.sh) that checks Docker containers. This guide shows what other hooks are available and how to implement them.

---

## Table of Contents

1. [What are Hooks?](#what-are-hooks)
2. [All 10 Hook Types](#all-10-hook-types)
3. [How to Implement Hooks](#how-to-implement-hooks)
4. [Recommended Hooks for This Project](#recommended-hooks-for-this-project)
5. [Exit Codes and Patterns](#exit-codes-and-patterns)

---

## What are Hooks?

Claude Code hooks are shell commands that execute at specific points in Claude Code's lifecycle. They give you deterministic control over Claude's behavior, logging, permissions, and more.

**Key Points:**
- Hooks run automatically based on events
- They receive JSON input via stdin
- They can block actions, modify inputs, or just log/notify
- They're useful for automation, safety checks, and context injection

---

## All 10 Hook Types

### 1. PreToolUse - Before Tool Execution

**When it triggers:** After Claude creates tool parameters but before the tool actually runs

**Use cases:**
- Block dangerous commands (e.g., `rm -rf /`)
- Modify tool inputs
- Log tool usage
- Enforce security policies

**Example: Block risky Bash commands**

```bash
#!/bin/bash
# File: .claude/hooks/pre-tool-use.sh
# Blocks potentially dangerous commands before they execute

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Block dangerous patterns
if [[ "$tool_name" == "Bash" ]]; then
  if [[ "$command" =~ rm[[:space:]]+-rf[[:space:]]+/ ]] || [[ "$command" =~ docker[[:space:]]+system[[:space:]]prune ]]; then
    echo '{"decision":"block","reason":"Blocked potentially dangerous command"}' | jq -c
    exit 0
  fi
fi

exit 0
```

**Add to settings.json:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-tool-use.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 2. PostToolUse - After Tool Execution

**When it triggers:** Immediately after a tool completes successfully

**Use cases:**
- Auto-format code after edits
- Validate outputs
- Log results
- Trigger secondary actions

**Example: Auto-format TypeScript files**

```bash
#!/bin/bash
# File: .claude/hooks/post-tool-use.sh
# Auto-formats TypeScript/TSX files after edits

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# Only format TypeScript files
if [[ "$tool_name" =~ ^(Edit|Write)$ ]]; then
  if [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
    npm --prefix app run lint:fix "$file_path" 2>/dev/null || true
  fi
fi

exit 0
```

**Add to settings.json:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 3. UserPromptSubmit - Before Claude Processes Input

**When it triggers:** When you submit a prompt, before Claude processes it

**Use cases:**
- Inject context into prompts
- Add reminders about best practices
- Validate prompts
- Block problematic requests

**Example: Auto-inject testing context**

```bash
#!/bin/bash
# File: .claude/hooks/user-prompt-submit.sh
# Adds testing reminders when you mention tests

input=$(cat)
prompt=$(echo "$input" | jq -r '.prompt')

# If prompt mentions tests, inject helpful context
if echo "$prompt" | grep -iE "(test|spec|e2e|playwright)" >/dev/null; then
  echo "📋 Testing context: Check app/e2e/ for test patterns. Run tests with: npm --prefix app run test:a11y" >&2
fi

exit 0
```

**Add to settings.json:**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/user-prompt-submit.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 4. SessionStart - Session Initialization

**When it triggers:** When Claude Code starts or resumes a session

**Use cases:**
- Load project-specific context
- Display setup instructions
- Initialize environment
- Install dependencies

**Example: Show project info**

```bash
#!/bin/bash
# File: .claude/hooks/session-start.sh
# Shows project info when session starts

cat >&2 <<'EOF'
🚀 Need This Done Project
  - Next.js app with Docker dev environment
  - Run: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
  - Tests: npm --prefix app run test:a11y
  - Design system: docs/DESIGN_SYSTEM.md
  - Storybook: npm --prefix app run storybook
EOF

exit 0
```

**Add to settings.json:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 5. Stop - After Claude Finishes ✅

**When it triggers:** When the main Claude Code agent finishes responding

**Use cases:**
- Health checks (like our Docker check)
- Suggest next steps
- Cleanup and validation
- Status reporting

**Current Implementation:**

We already use this hook! See [.claude/hooks/stop.sh](.claude/hooks/stop.sh) - it checks if Docker containers are running and provides helpful guidance if they're not.

---

### 6. SubagentStop - After Subagents Finish

**When it triggers:** When a Claude Code subagent (launched via Task tool) completes

**Use cases:**
- Clean up resources created by subagents
- Log subagent work
- Aggregate results
- Stop services

**Example: Simple logging**

```bash
#!/bin/bash
# File: .claude/hooks/subagent-stop.sh
# Logs when subagents finish

echo "✓ Subagent task completed" >&2
exit 0
```

**Add to settings.json:**

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-stop.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 7. PermissionRequest - Before Permission Dialog

**When it triggers:** When Claude Code shows you a permission dialog

**Use cases:**
- Auto-approve safe tools
- Auto-deny risky operations
- Modify permission requests
- Bypass confirmation dialogs

**Example: Auto-approve read-only tools**

```bash
#!/bin/bash
# File: .claude/hooks/permission-request.sh
# Auto-approves safe read-only operations

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Auto-approve safe read-only operations
if [[ "$tool_name" =~ ^(Read|Glob|Grep)$ ]]; then
  echo '{"decision":"approve","reason":"Auto-approved safe read operation"}' | jq -c
  exit 0
fi

exit 0
```

---

### 8. Notification - When Alerts Occur

**When it triggers:** When Claude Code sends notifications (permissions, auth events, etc.)

**Use cases:**
- Send custom desktop alerts
- Log notification events
- Route to external systems (Slack, Discord)
- Suppress certain notifications

**Example: Simple logger**

```bash
#!/bin/bash
# File: .claude/hooks/notification.sh
# Logs notifications

input=$(cat)
notification_type=$(echo "$input" | jq -r '.type // "unknown"')

echo "🔔 Notification: $notification_type" >&2
exit 0
```

---

### 9. PreCompact - Before Context Compression

**When it triggers:** Before Claude Code runs a compact operation (manual `/compact` or automatic cleanup)

**Use cases:**
- Back up conversation history
- Block inappropriate compaction
- Log what's being removed
- Archive important data

**Example: Backup before compacting**

```bash
#!/bin/bash
# File: .claude/hooks/pre-compact.sh
# Backs up conversation before compression

echo "💾 Backing up conversation before compression..." >&2
# Could copy transcript files here if needed
exit 0
```

---

### 10. SessionEnd - Session Cleanup

**When it triggers:** When a Claude Code session terminates

**Use cases:**
- Archive session history
- Clean up temporary files
- Shut down services
- Send final reports

**Example: Cleanup**

```bash
#!/bin/bash
# File: .claude/hooks/session-end.sh
# Cleans up when session ends

echo "🧹 Cleaning up session..." >&2
# Could remove temp files, stop services, etc.
exit 0
```

---

## How to Implement Hooks

### Step 1: Create the Hook Script

```bash
touch .claude/hooks/[hook-name].sh
chmod +x .claude/hooks/[hook-name].sh
```

### Step 2: Write Your Hook Logic

All hooks receive JSON via stdin. Parse it and take action:

```bash
#!/bin/bash
# Read JSON input
input=$(cat)

# Extract fields you need
tool_name=$(echo "$input" | jq -r '.tool_name')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# Do your logic...

# Exit with proper code
exit 0
```

### Step 3: Add to settings.json

Update [.claude/settings.json](.claude/settings.json) to register the hook:

```json
{
  "hooks": {
    "HookType": [
      {
        "matcher": "ToolName",  // optional, for PreToolUse/PostToolUse
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-name.sh"
          }
        ]
      }
    ]
  }
}
```

### Step 4: Test

Trigger the event that fires the hook and verify the behavior.

---

## Recommended Hooks for This Project

Based on your Next.js + Docker + Testing setup, these hooks are most useful:

### Priority 1: PostToolUse (Auto-format)

Automatically format TypeScript files after edits - keeps code style consistent without manual commands.

### Priority 2: UserPromptSubmit (Testing Reminders)

Auto-inject testing best practices when you mention tests - helps ensure E2E tests are written properly.

### Priority 3: SessionStart (Project Info)

Display project info at startup - quick reference for Docker commands, test runners, and key files.

---

## Exit Codes and Patterns

### Exit Codes

- `exit 0` - Success, continue normally
- `exit 2` - Block the action (only for certain hooks), show stderr message
- Other codes - Non-blocking error (shown in debug mode only)

### JSON Input Pattern

All hooks receive JSON data:

```bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
```

### JSON Output Pattern (for decisions)

Some hooks can return JSON to control behavior:

```bash
echo '{"decision":"block","reason":"explanation"}' | jq -c
exit 0
```

### File Naming

- Use lowercase with hyphens: `pre-tool-use.sh` (not `preToolUse.sh`)
- Location: `.claude/hooks/`
- Must be executable: `chmod +x`

---

## Debugging Hooks

If a hook isn't working:

1. **Check configuration**: Run `claude /hooks` to see registered hooks
2. **Verify script**: Run the script manually with sample JSON
3. **Check permissions**: Ensure script has execute permissions (`chmod +x`)
4. **Use debug mode**: Run `claude --debug` to see hook execution details
5. **Check JSON**: Validate JSON syntax with `jq -c`

---

## Security Reminders

Since hooks execute with your full permissions:

- Always review hook code before activating
- Test hooks locally first
- Use absolute paths with `$CLAUDE_PROJECT_DIR`
- Quote all variables: `"$VAR"` not `$VAR`
- Hook scripts have access to any file you can read
- Don't copy untrusted code into hooks

---

## Quick Reference

| Hook | When It Triggers | Best For |
|------|-----------------|----------|
| **PreToolUse** | Before tool runs | Blocking dangerous commands, input validation |
| **PostToolUse** | After tool completes | Auto-formatting, output validation |
| **UserPromptSubmit** | Before Claude processes input | Context injection, reminders |
| **SessionStart** | Session begins | Loading context, setup info |
| **Stop** | Claude finishes responding | Health checks, cleanup ✅ *You have this* |
| **SubagentStop** | Subagent completes | Resource cleanup |
| **PermissionRequest** | Permission dialog shown | Auto-approve/deny |
| **Notification** | Alerts occur | Logging, routing |
| **PreCompact** | Before compression | Backups, blocking |
| **SessionEnd** | Session terminates | Cleanup, archiving |

---

## Need Help?

- Check the official Claude Code docs: [code.claude.com](https://code.claude.com)
- Review example hooks in this file
- Start with one simple hook and expand from there
- Refer back to this guide when implementing on another machine
