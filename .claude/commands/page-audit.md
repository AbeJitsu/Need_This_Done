---
description: Audit a page for accessibility, dark mode, color system, and code quality issues
allowed-tools: Read(**/*), Grep(*), Glob(*)
---

# Page Audit

Audit a page against project standards and report issues.

## Arguments
- `$ARGUMENTS` - Route path (e.g., "/shop", "/admin/blog") or "all" for full site audit

## Your Task

Read the page file(s) and check against this checklist. Report all issues found.

## Checklist

### 1. Dark Mode Compliance
- [ ] All text colors have `dark:` variant
- [ ] All background colors have `dark:` variant
- [ ] All border colors have `dark:` variant
- [ ] No hardcoded colors like `bg-white` without `dark:bg-gray-800`
- [ ] Hover states have dark variants

### 2. Color System (lib/colors.ts)
- [ ] Imports colors from `@/lib/colors`
- [ ] Uses color utilities (accentColors, alertColors, formInputColors, etc.)
- [ ] No hardcoded Tailwind colors in JSX
- [ ] Colors are Easy To Change and Test (ETC principle)

### 3. Accessibility (WCAG AA)
- [ ] Semantic HTML (proper headings h1→h2→h3, landmarks)
- [ ] Focus indicators on interactive elements
- [ ] Alt text on all images
- [ ] Form labels properly associated with inputs
- [ ] 5:1 contrast ratio minimum

### 4. Code Quality
- [ ] Uses existing components (PageHeader, Card, Button, CTASection)
- [ ] Clear section comments with dividers
- [ ] TypeScript types/interfaces defined
- [ ] No duplicate code (DRY principle)
- [ ] Descriptive function/variable names

### 5. Responsive Design
- [ ] Mobile-first approach
- [ ] Proper breakpoints (sm:, md:, lg:)
- [ ] No horizontal overflow on mobile

### 6. Performance
- [ ] Uses Next.js Image component (not img tags)
- [ ] Lazy loading where appropriate
- [ ] No unnecessary re-renders

### 7. UX/Usability
- [ ] Clear CTAs
- [ ] Loading states for async operations
- [ ] Error states with helpful messages
- [ ] Empty states for lists

### 8. SEO
- [ ] Page has metadata export
- [ ] Proper heading hierarchy
- [ ] Descriptive link text (not "click here")

## Known Issues to Check

### Alert Colors (CRITICAL)
Alerts must use `alertColors` from lib/colors.ts:

**Correct:**
```tsx
import { alertColors } from '@/lib/colors';
<div className={alertColors.error.container}>
<div className={alertColors.success.container}>
```

**Wrong - not dark mode compliant:**
```tsx
<div className="bg-red-100 text-red-800">
<div className="bg-green-100 text-green-800">
```

### Status Badges
Use `statusBadgeColors` from lib/colors.ts, not hardcoded colors.

### Form Inputs
Use `formInputColors` from lib/colors.ts for consistent form styling.

## Output Format

For each issue found, report:
```
**[Category]** - [File:Line]
Current: `<current code>`
Fix: `<suggested fix>`
```

Then provide a summary:
- Total issues found
- Critical issues (dark mode, accessibility)
- Quick wins (easy to fix)
- Larger efforts (refactoring needed)
