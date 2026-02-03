# PR Verification Rule

Verification depth depends on what changed. Use the decision tree to pick the right level.

## Decision Tree

Start here to pick your verification level:

| What Changed? | Risk Level | Verification |
|---------------|-----------|--------------|
| 1-2 files, visual/config only | Low | **Quick** |
| Dependency patch (20.0 → 20.3) | Low | **Quick** |
| New feature, multi-file, new logic | Medium | **Standard** |
| API endpoints, state management | Medium | **Standard** |
| Auth, checkout, payments touched | High | **Full** |
| Major refactor (10+ files) | High | **Full** |
| Unsure which tier | ? | **Full** (better safe) |

---

## Quick Verification (Low-Risk Changes)

For visual fixes, config updates, dependency patches, self-contained changes.

```bash
# Checkout
git checkout origin/<branch-name>

# 1. Read the diff (understand what changed)
git diff origin/main...HEAD

# 2. Start dev server
cd app && npm run dev

# 3. Quick visual check (does it look right? Any errors?)
# → Look at the console, spot-check the UI

# 4. Done — ready to merge
```

**Examples:** Hero gradient responsive fix, color tweaks, Stripe patch version bump, config changes

---

## Standard Verification (Medium-Risk Changes)

For new features, multi-file changes, state/API modifications.

```bash
# Checkout
git checkout origin/<branch-name>

# 1. Dev server check
cd app && npm run dev

# 2. E2E tests
cd app && npm run test:e2e

# 3. Review the diff
git diff origin/main...HEAD

# 4. Merge if green
```

---

## Full Verification (High-Risk Changes)

For auth, payments, major refactors, or anything you're unsure about.

```bash
# Checkout
git checkout origin/<branch-name>

# 1. Dev server
cd app && npm run dev

# 2. All tests
cd app && npm run test:e2e
cd app && npm run test:a11y

# 3. Build check
cd app && npm run build

# 4. Review diff thoroughly
git diff origin/main...HEAD

# 5. Merge if all green
```

---

## Merging

```bash
# Option 1: Local merge (simpler)
git checkout main
git merge origin/<branch-name>
git push

# Option 2: GitHub merge (keeps PR history)
gh pr merge <PR#> --merge
```

---

## Anti-patterns to Avoid

- ❌ Running full test suite for simple visual fixes (wastes time)
- ❌ Merging without reading the diff at all (miss mistakes)
- ❌ Skipping verification entirely (accumulates bugs)
- ❌ Using "Full Verification" for every tiny change (slows you down)
