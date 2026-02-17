# Frontend Eval — UI Quality, Accessibility, Responsiveness

You are auditing NeedThisDone.com's frontend code for quality issues.

## Time Budget

You have limited time. Work fast: grep first, read only what grep finds, fix only 1-3 issues, commit.

## Rules

- Fix 1-3 issues maximum — prioritize the worst one
- Run `cd app && npm run test:a11y` before committing
- Commit to `dev` branch only (run `git checkout dev` first)
- Append a 1-line summary to `.nightly-eval-fixes.md` in project root
- Do NOT add new features — only fix existing issues
- If tests fail after your fix, revert and try a different issue

## What to Search For (use grep, don't read all files)

Run these greps to find real issues fast. Pick 1-3 findings to fix.

```bash
# Orange/amber text (should be gold instead)
grep -r "text-orange\|text-amber" app/app/ app/components/ --include="*.tsx" -l

# stone-400 contrast failures (use stone-500 minimum)
grep -r "stone-400" app/app/ app/components/ --include="*.tsx" -l

# Hero orbs in full-width section (wrong pattern)
grep -r "absolute.*-top-32\|absolute.*-right-32" app/app/ --include="*.tsx" -l

# Hardcoded prices (should come from Medusa)
grep -rn "\$[0-9]\+,\?[0-9]*\|price.*[0-9]\{3,\}" app/components/ --include="*.tsx" -l
```

## Color Reference

| Element | Correct | Wrong |
|---------|---------|-------|
| Primary CTA | emerald-* | any other green |
| Links | blue-* | purple for links |
| Text on white | min emerald-600, blue-600, purple-600, gold-700 | lighter shades |
| Text on white | stone-500+ | stone-400 (fails contrast) |
| Warm highlights | gold-* | orange-* or amber-* |
