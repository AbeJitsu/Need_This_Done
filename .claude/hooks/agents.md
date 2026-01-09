# Hooks Folder

Two working hooks. Most Claude Code hook types are broken (Jan 2025).

## Active Hooks

| File | Purpose |
|------|---------|
| `session-start.sh` | Shows git branch and uncommitted files at session start |
| `pre-compact.sh` | Saves work state before context compression |

## What Works

| Hook Type | Status |
|-----------|--------|
| SessionStart | Works |
| PreCompact | Works |
| PreToolUse | Broken |
| PostToolUse | Broken |

## If Adding a Hook

Use stdout + exit 0:
```bash
echo "Message Claude will see"
exit 0
```

Using stderr (`>&2`) with exit 0 = invisible output.
