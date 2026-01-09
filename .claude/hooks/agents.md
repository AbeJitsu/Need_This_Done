# Hooks Folder

This folder contains Claude Code hooks - shell scripts that run at specific points in Claude's lifecycle.

## Output Rules (from official docs)

| Exit Code | Output | Behavior |
|-----------|--------|----------|
| `exit 0` | stdout | Shown in transcript (Claude sees it) |
| `exit 2` | stderr | Fed back to Claude as error |
| Other | - | Silent failure |

**Key insight:** Use `echo` (stdout) with `exit 0` for Claude to see output. Using `>&2` (stderr) without `exit 2` means output is invisible.

## Known Issues (as of Jan 2025)

**PostToolUse hooks may not trigger.** Multiple GitHub issues report this bug:
- [#6403](https://github.com/anthropics/claude-code/issues/6403) - PostToolUse completely non-functional
- [#6305](https://github.com/anthropics/claude-code/issues/6305) - Selective failure on tool-related hooks
- [#3148](https://github.com/anthropics/claude-code/issues/3148) - Matcher issues (try empty string `""`)

## Hook Types

| Hook | When it runs | Works? |
|------|-------------|--------|
| SessionStart | Session begins | Yes |
| UserPromptSubmit | Before processing user input | Yes |
| PreToolUse | Before tool executes | Test first |
| PostToolUse | After tool completes | **Buggy** |
| Stop | Session ends | Yes |
| PreCompact | Before context compression | Yes |

## Two Hook Types

### Command-based (shell scripts)
```json
{
  "type": "command",
  "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/my-hook.sh",
  "timeout": 10
}
```

### Prompt-based (LLM evaluation)
```json
{
  "type": "prompt",
  "prompt": "Validate this action. Return 'approve' or 'deny'."
}
```

Prompt-based hooks let Claude evaluate conditions directly without shell scripts.

## Correct Command Hook Pattern

```bash
#!/bin/bash
# [HookType] Hook: [Name]
# What: [One-line description]

INPUT=$(cat)
FIELD=$(echo "$INPUT" | jq -r '.field_name // empty')

# Do work...

# Use stdout for output Claude should see
echo "Hook result here"

# exit 0 = success, stdout shown
# exit 2 = block/error, stderr shown
exit 0
```

## JSON Fields by Hook Type

| Hook | Available Fields |
|------|-----------------|
| UserPromptSubmit | `.prompt` |
| PreToolUse | `.tool_name`, `.tool_input` |
| PostToolUse | `.tool_name`, `.tool_input`, `.tool_result` |
| Stop | (none - just runs) |

## PreToolUse Response Format

PreToolUse hooks can approve, deny, or modify tool calls:

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow|deny|ask",
    "updatedInput": { "field": "modified_value" }
  },
  "systemMessage": "Explanation for Claude"
}
```

## Before Creating a Hook

1. Check if the hook type works (PostToolUse is buggy)
2. Use stdout + exit 0 for visible output
3. Use stderr + exit 2 for blocking errors
4. Test manually: `echo '{"prompt":"test"}' | ./hook.sh`
5. Consider prompt-based hooks for simple validation
