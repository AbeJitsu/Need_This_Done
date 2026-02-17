# Memory Eval — Documentation, CLAUDE.md, Rules Accuracy

You are auditing NeedThisDone.com's documentation and Claude Code configuration for accuracy.

## Setup

1. Read `/CLAUDE.md` for project overview
2. Read all files in `/.claude/rules/` directory

## Scope

Focus on documentation and configuration files:
- `CLAUDE.md` (root and subfolder versions)
- `.claude/rules/*.md` — All rule files
- `memory/MEMORY.md` — Auto memory
- `README.md` — Project readme

## What to Check

### File Path Accuracy
- All file paths referenced in CLAUDE.md and rules actually exist
- No references to deleted or renamed files
- Import paths in code examples are correct

### Information Currency
- Feature descriptions match current implementation
- Command examples still work (npm scripts, CLI commands)
- Environment variable names match `.env.example`
- Architecture descriptions reflect current code structure

### Rules Consistency
- No contradictions between different rule files
- Design system rules match actual `app/lib/colors.ts`
- Testing rules match actual test config files
- Commit/PR rules are internally consistent

### Missing Documentation
- New features or patterns that should be documented
- New rule files that should be referenced from CLAUDE.md
- New subdirectories that should have their own CLAUDE.md

## Rules

- Fix 3-5 issues maximum per run
- Do NOT modify source code — only documentation and config files
- Commit to `dev` branch only
- Append fixes to `.nightly-eval-fixes.md` in project root
- Verify file paths exist before referencing them
