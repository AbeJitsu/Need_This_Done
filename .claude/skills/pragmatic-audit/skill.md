---
name: pragmatic-audit
description: Scan codebase for Pragmatic Programmer anti-patterns. Adds findings to TODO.md for auto-loop to fix. Triggers on "pragmatic audit", "code quality audit", or "/pragmatic-audit".
---

# Pragmatic Audit: Code Quality Scanner

Scan the codebase for bad programming practices from "The Pragmatic Programmer" and add findings to TODO.md so auto-loop can fix them.

**📝 OUTPUT**: All detected issues are written to TODO.md, NOT stored in this skill file.

## Enhanced with Modern Principles 🚀

This audit now includes detection for:

**🎯 YAGNI (You Aren't Gonna Need It)**
- Finds overengineered code built for imaginary future requirements
- Detects abstractions with single implementations
- Identifies unused parameters and "just in case" code

**🏗️ SOLID Principles**
- **S**ingle Responsibility: Finds god objects doing too much
- **O**pen/Closed: Detects switch statements that need constant updates
- **L**iskov Substitution: Checks for proper inheritance
- **I**nterface Segregation: Finds fat interfaces with empty implementations
- **D**ependency Inversion: Identifies tight coupling to concrete classes

**💋 KISS (Keep It Simple, Stupid)**
- Detects unnecessarily complex code
- Finds nested ternaries and deep nesting
- Identifies functions with too many parameters
- Catches over-complicated solutions to simple problems

## Autonomous Loop Support

**This skill uses the same loop mechanism as auto-loop.** It will continue scanning until ALL patterns are checked, even if it takes multiple iterations.

### Starting the Audit

When starting, create the loop state file:

```bash
cat > .claude/loop-state.json << 'EOF'
{
  "active": true,
  "startTime": $(date +%s),
  "maxHours": 2,
  "maxConsecutiveFailures": 3,
  "iterationCount": 0,
  "failureCounts": {},
  "cycleNumber": 1,
  "tasksCompleted": 0,
  "auditMode": true,
  "patternsChecked": [],
  "totalPatterns": 12
}
EOF
```

### Tracking Progress

After completing each pattern category, update `patternsChecked`:

```bash
# After scanning DRY violations
jq '.patternsChecked += ["DRY"]' .claude/loop-state.json > tmp && mv tmp .claude/loop-state.json

# Patterns to track: YAGNI, SOLID, KISS, DRY, HARDCODED, BROKEN_WINDOWS, COUPLING, ETC, NAMING, TESTS, EXCEPTIONS, RESOURCES
```

### Completion Check

The audit is complete when `patternsChecked.length == totalPatterns`. At that point:

```bash
# Clean up loop state
rm .claude/loop-state.json
```

### Stop Hook Behavior

The stop hook will see `active: true` and block exit, prompting you to continue scanning remaining patterns. Check which patterns still need scanning by reading `patternsChecked` from the state file.

## Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. SCAN        Use Grep/Glob to detect anti-patterns           │
│  2. CATEGORIZE  Group by type and severity                       │
│  3. DEDUPE      Skip issues already in TODO.md                   │
│  4. REPORT      Add new findings to TODO.md                      │
│  5. SUMMARIZE   Show statistics                                  │
└──────────────────────────────────────────────────────────────────┘
```

**CRITICAL**: This skill ONLY writes to TODO.md. It does not store example issues.
When run, it scans the codebase and adds all findings to TODO.md in the proper format.

## Detection Categories

Scan for these Pragmatic Programmer anti-patterns:

### 1. YAGNI Violations (Severity: High) 🆕

You Aren't Gonna Need It - overengineered code for imaginary requirements.

**Detect:**
- Abstract classes/interfaces with single implementation
- Generic solutions used for only one specific case
- Unused parameters in function signatures
- "Future-proof" code with no current use

**Grep patterns:**
```bash
# Abstract classes with single implementation
grep -r "abstract class" app/ --include="*.ts" | cut -d: -f2 | awk '{print $3}' | while read class; do
  count=$(grep -r "extends $class" app/ --include="*.ts" | wc -l)
  if [ $count -eq 1 ]; then echo "Single implementation: $class"; fi
done

# Unused function parameters (look for _, unused prefixes)
grep -rE "function.*\(.*(_\w+|unused\w+)" app/ --include="*.ts" --include="*.tsx"

# Interfaces with single implementation
grep -r "interface.*{" app/ --include="*.ts" | grep -v ".d.ts"
```

### 2. SOLID Violations (Severity: High) 🆕

Breaking Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.

**Detect:**
- God classes (files > 500 lines doing multiple things)
- Classes/functions with "and" in the name (doing multiple things)
- Switch statements that need updating for new types
- Fat interfaces forcing empty implementations

**Grep patterns:**
```bash
# God objects - files over 500 lines
find app -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 500 {print $0}'

# Multiple responsibilities - "and" in names
grep -rE "(function|class|interface).*And" app/ --include="*.ts" --include="*.tsx"

# Switch statements (often violate Open/Closed)
grep -rE "switch\s*\(" app/ --include="*.ts" --include="*.tsx" -A 10 | grep -E "case\s+" | wc -l

# Empty method implementations (Interface Segregation violation)
grep -rE "{\s*(//.*)?}" app/ --include="*.ts" --include="*.tsx"
```

### 3. KISS Violations (Severity: Medium) 🆕

Keep It Simple, Stupid - unnecessarily complex code.

**Detect:**
- Nested ternary operators
- Functions with > 4 parameters
- Deeply nested conditionals (> 3 levels)
- Complex regex when simple string methods work

**Grep patterns:**
```bash
# Nested ternaries
grep -rE "\?.*\?.*:" app/ --include="*.ts" --include="*.tsx"

# Functions with many parameters
grep -rE "function.*\([^)]{100,}\)" app/ --include="*.ts" --include="*.tsx"

# Deep nesting (look for multiple indentation levels)
grep -rE "^[ \t]{16,}" app/ --include="*.ts" --include="*.tsx"

# Complex regex
grep -rE "RegExp\(.*{10,}" app/ --include="*.ts" --include="*.tsx"
```

### 4. DRY Violations (Severity: High)

**Detect:**
- Repeated inline styles (e.g., `bg-white dark:bg-gray-800 rounded` in multiple files)
- Duplicate error handling patterns
- Copy-pasted code blocks

**Grep patterns:**
```bash
# Repeated card/container styles
grep -r "bg-white dark:bg-gray-800 rounded" app/ --include="*.tsx"

# Repeated input styles
grep -r "border-gray-300 dark:border-gray-600 focus:" app/ --include="*.tsx"

# Repeated error handling
grep -r "catch.*console.error" app/ --include="*.ts" --include="*.tsx"
```

### 5. Hardcoded Values (Severity: Medium)

Magic numbers and inline constants that should be configurable.

**Detect:**
- Magic numbers (timeouts, limits)
- Hardcoded URLs
- Inline color values outside colors.ts

**Grep patterns:**
```bash
# Magic timeouts (1000, 3000, 5000, etc.)
grep -rE "setTimeout\([^,]+,\s*[0-9]{4,}" app/ --include="*.ts" --include="*.tsx"

# Hardcoded hex colors outside colors.ts
grep -rE "#[0-9a-fA-F]{6}" app/ --include="*.tsx" | grep -v "colors.ts"

# Hardcoded URLs
grep -rE "'https?://[^']+'" app/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "localhost"
```

### 6. Broken Windows (Severity: Low-Medium)

Code quality debt that signals neglect.

**Detect:**
- TODO/FIXME/HACK/XXX comments
- Console.log left in production code
- Commented-out code blocks

**Grep patterns:**
```bash
# TODO/FIXME comments (excluding node_modules)
grep -rE "//\s*(TODO|FIXME|HACK|XXX)" app/ --include="*.ts" --include="*.tsx"

# Console.log (excluding test files)
grep -r "console.log(" app/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v ".spec."

# eslint-disable without explanation
grep -r "eslint-disable" app/ --include="*.ts" --include="*.tsx"
```

### 7. Tight Coupling (Severity: High)

Components that are too interdependent.

**Detect:**
- Deep import chains (../../../)
- Files over 500 lines (god objects)
- Circular dependencies

**Grep patterns:**
```bash
# Deep relative imports
grep -rE "from\s+['\"]\.\.\/\.\.\/\.\.\/" app/ --include="*.ts" --include="*.tsx"

# Long files (check with wc -l, flag >500)
find app -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

### 8. ETC Violations (Severity: Medium)

Code that's hard to change.

**Detect:**
- Hardcoded dark: classes outside colors.ts
- Inline Tailwind color classes instead of using design system
- Repeated patterns that should be abstracted

**Grep patterns:**
```bash
# Hardcoded dark mode classes
grep -rE "dark:(bg|text|border)-[a-z]+-[0-9]+" app/ --include="*.tsx" | grep -v "colors.ts" | grep -v "lib/"

# Hardcoded color classes (should use design system)
grep -rE "(bg|text|border)-(red|blue|green|orange|purple)-[0-9]+" app/components --include="*.tsx" | grep -v "colors.ts"
```

### 9. Poor Naming (Severity: Low)

Unclear or too-short identifiers.

**Detect:**
- Single-letter variables (excluding loop counters i, j, k)
- Functions with unclear names (< 4 chars)
- Ambiguous names (data, info, temp, etc.)

**Grep patterns:**
```bash
# Single-letter variables
grep -rE "(const|let|var)\s+[a-z]\s*=" app/ --include="*.ts" --include="*.tsx" | grep -v "[ijk]\s*="

# Very short function names
grep -rE "function\s+[a-z]{1,3}\(" app/ --include="*.ts" --include="*.tsx"
```

### 10. Missing Tests (Severity: Medium)

Components without corresponding test files.

**Detect:**
- Components in app/components without .test.tsx or .a11y.test.tsx
- Hooks without unit tests
- Utilities without tests

**Detection logic:**
```
For each .tsx file in app/components:
  Check if corresponding .test.tsx or .a11y.test.tsx exists
  If not, flag as missing tests
```

### 11. Exception Issues (Severity: High)

Poor error handling practices.

**Detect:**
- Empty catch blocks
- Catch with only console.log (swallowed errors)
- Generic catch (e: any) without proper typing

**Grep patterns:**
```bash
# Empty or minimal catch blocks
grep -rE "catch\s*\([^)]*\)\s*\{\s*\}" app/ --include="*.ts" --include="*.tsx"

# Generic error type
grep -rE "catch\s*\(\s*\w+:\s*any\s*\)" app/ --include="*.ts" --include="*.tsx"

# Catch with only console
grep -rE "catch.*\{[^}]*console\.(log|error)[^}]*\}" app/ --include="*.ts" --include="*.tsx"
```

### 12. Resource Leaks (Severity: High)

Potential memory leaks and cleanup issues.

**Detect:**
- addEventListener without corresponding removeEventListener
- setInterval without clearInterval
- useEffect without cleanup for subscriptions

**Grep patterns:**
```bash
# Event listeners without cleanup
grep -r "addEventListener" app/ --include="*.tsx" | grep -v "removeEventListener"

# Intervals without cleanup
grep -r "setInterval" app/ --include="*.ts" --include="*.tsx"

# Subscriptions in useEffect (check for return statement)
```

## Execution Steps

### Step 1: Read TODO.md
Read the current TODO.md to get existing tracked issues. Extract all task descriptions to avoid duplicates.

### Step 2: Run Detection Scans
Use Grep tool for each category above. Collect results with file:line information.

### Step 3: Deduplicate
For each finding:
- Check if file path already exists in TODO.md tasks
- Check if the same line number is already tracked
- Skip if already present

### Step 4: Categorize and Prioritize
Group findings by:
- **Critical** (Severity: High): Exception issues, resource leaks, tight coupling
- **Important** (Severity: Medium): DRY violations, hardcoded values, missing tests, ETC
- **Maintenance** (Severity: Low): Broken windows, poor naming

### Step 5: Add to TODO.md

**CRITICAL**: Match the exact format in TODO.md that auto-loop expects.

Auto-loop looks for:
- `[ ]` = ready to work (picks first one)
- `[→]` = in progress (continues this)
- `[x]` = done
- `[!]` = blocked

Tasks MUST be **leaf-level** (no nested sub-items under them).

**Output Format** (matches existing DRY/ETC Audit section):

```markdown
### Pragmatic Programmer Audit (Mon DD, YYYY)

**CATEGORY_NAME** - Brief description of the pattern type
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern: Description of what was found                                 │
│  Found in: X files                                                      │
│  Impact: Why this matters                                               │
│  Fix: High-level approach to fix                                        │
└─────────────────────────────────────────────────────────────────────────┘
- [ ] Specific actionable task with file:line reference
- [ ] Another specific task that can be completed in one session
```

**IMPORTANT**: The audit skill writes findings to TODO.md. It does NOT contain example issues.
All detected issues are added to TODO.md in the format above.

**Key Format Rules:**
1. Section header with full date: `### Pragmatic Programmer Audit (Dec 31, 2025)`
2. Category in bold with dash and description: `**CATEGORY** - Description`
3. ASCII box with Pattern/Found/Impact/Fix (optional but helpful)
4. Leaf-level tasks with `- [ ]` prefix (NO sub-items under these)
5. Include file:line when known for easy navigation
6. Add to `## To Do` section, after any existing audit sections

### Step 6: Insert in Correct Location

Add findings to TODO.md in the `## To Do` section:

1. Read TODO.md structure
2. Find `## To Do` section
3. Look for existing `### Pragmatic Programmer Audit` section
4. If exists: append new tasks to existing categories (don't duplicate section header)
5. If not exists: add new section after any other audit sections (like DRY/ETC Audit)

**Placement order in `## To Do`:**
```
## To Do

### DRY/ETC Audit (Dec 31, 2025)     <- existing
...existing tasks...

### Pragmatic Programmer Audit (Jan 1, 2025)  <- NEW SECTION HERE
...new tasks...

### Short Term                        <- existing
...existing tasks...
```

### Step 7: Verify Output

Before finishing, verify:
- [ ] All new tasks use `- [ ]` prefix
- [ ] No nested sub-items under tasks
- [ ] Each task references a specific file or location
- [ ] Tasks are actionable (one work session each)
- [ ] No duplicate tasks from previous audits

### Step 8: Display Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRAGMATIC AUDIT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files scanned:  142
Issues found:   23

By Severity:
  Critical:     2
  Important:    12
  Maintenance:  9

New tasks added: 8 (15 already tracked)

Run /auto-loop to start fixing issues.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Natural Language Triggers

This skill activates when user says:
- "pragmatic audit"
- "audit code quality"
- "check for bad practices"
- "find code smells"
- "scan for issues"
- "/pragmatic-audit"

## Integration with Auto-Loop

**This skill feeds auto-loop.** The workflow is:

```
/pragmatic-audit  →  Adds [ ] tasks to TODO.md  →  /auto-loop fixes them
```

**Format Requirements for Auto-Loop:**

1. **Leaf-level tasks only**: Auto-loop validates that tasks have no nested sub-items
   ```markdown
   # VALID - auto-loop can work on this
   - [ ] Fix DRY violation in AdminSidebar.tsx

   # INVALID - auto-loop will reject (nested sub-items)
   - [ ] Fix DRY violations
     - Extract card styles      <- NESTED, will fail
     - Consolidate handlers     <- NESTED, will fail
   ```

2. **Task markers**: Use `- [ ]` prefix for ready tasks

3. **Actionable descriptions**: Each task should be completable in one work session
   - Bad: `- [ ] Fix all DRY violations` (too broad)
   - Good: `- [ ] Extract card styles from AdminSidebar.tsx to cardColors in colors.ts`

4. **File references**: Include file:line for navigation
   - `- [ ] Remove console.log in PaymentForm.tsx:42`

**After running `/pragmatic-audit`:**
1. New tasks appear in TODO.md under `## To Do`
2. Run `/auto-loop` to start fixing
3. Auto-loop marks `[→]` in progress, uses TDD, marks `[x]` when done
4. Run `/pragmatic-audit` again next week to find new issues

## Exclusions

Always exclude from scans:
- node_modules/
- .next/
- dist/
- *.test.* and *.spec.* files (for console.log checks)
- Third-party configs

## Notes

- Run nightly via cron or manually before major releases
- Focus on actionable issues, not style preferences
- Each finding should be fixable in one task
- Prefer fewer high-quality findings over many low-priority ones

## Quick Reference: Principles

### 🎯 YAGNI (You Aren't Gonna Need It)
**Red Flags:**
- `abstract class` with one implementation
- `interface IFoo { }` used by only `class Foo`
- Generic `DataProcessor<T>` that only ever uses `string`
- Parameters like `options?: never` or `_unused`

**Fix:** Delete the abstraction, use concrete implementation

### 🏗️ SOLID
**S - Single Responsibility**
- Files > 500 lines
- Classes with "Manager" or "Handler" in name
- Methods named `validateAndSaveAndNotify()`

**O - Open/Closed**
- Switch statements updated for each new type
- If/else chains checking `instanceof`

**L - Liskov Substitution**
- Subclasses that throw "Not Implemented"
- Overrides that change method behavior completely

**I - Interface Segregation**
- Interfaces forcing empty method implementations
- Fat interfaces with 10+ methods

**D - Dependency Inversion**
- Direct instantiation: `new ConcreteClass()`
- Imports from `../../infrastructure/database`

### 💋 KISS (Keep It Simple)
**Too Complex:**
```typescript
// ❌ Nested ternary hell
const status = user ? (user.active ? (user.verified ? 'ready' : 'pending') : 'inactive') : 'none';

// ✅ Simple and clear
function getUserStatus(user) {
  if (!user) return 'none';
  if (!user.active) return 'inactive';
  if (!user.verified) return 'pending';
  return 'ready';
}
```

**Simplification Checklist:**
- Can a junior dev understand this?
- Could you explain it without "and then"?
- Does it need a comment to be clear?
- Are there more than 3 levels of nesting?

### 🔍 How to Spot Violations

| Principle | Quick Check | Command |
|-----------|------------|---------|
| YAGNI | "What if we need..." in comments | `grep -r "TODO.*might need" app/` |
| SOLID-S | File does 2+ unrelated things | `wc -l *.tsx \| sort -rn` |
| SOLID-O | Adding features = modifying existing | `git log --oneline file.ts` |
| KISS | Needs diagram to explain | `grep -r "?.*?.*:" app/` |
| DRY | Copy-paste coding | `grep -r "exact same string" app/` |
