# DRY Violations Fix - Progress Checklist

**Started:** 2025-12-09
**Status:** 🚧 In Progress

---

## Step 0: Setup

- [x] Create progress checklist
- [x] Create stop hook script
- [x] Update permissions in settings.local.json
- [x] Update permissions in settings.json (project-wide)

---

## Step 1: Fix Homepage CTA Duplication

- [x] Update default-page-content.ts (line 348)
- [x] Change "Get a Quote" → "Start Your Project"

---

## Step 2: Add Color Definitions to lib/colors.ts

- [x] Add stepBadgeColors
- [x] Add successCheckmarkColors
- [x] Add dangerColors
- [x] Add mutedTextColors
- [x] Add headingColors
- [x] Add linkHoverColors

---

## Step 3: Fix High-Priority Pages (77 instances total)

### Contact Page (33 instances)
- [x] Add color imports
- [x] Replace success checkmark (line 158)
- [x] Replace helper text instances
- [x] Replace blue step numbers (lines 172, 176, 180)
- [x] Replace muted text (line 334)
- [x] Replace danger button colors (line 341)

### Checkout Page (30 instances)
- [x] Add color imports
- [x] Replace success icon (line 158)
- [x] Replace helper text instances
- [x] Replace success messages (line 200)
- [x] Replace error messages (lines 235, 300)

### Home Page (9 instances)
- [x] Add color imports
- [x] Replace hero heading (line 57)
- [x] Replace helper text instances (lines 60, 110, 116, 126)
- [x] Replace hover colors (line 75)

### Get Started Page (18 instances)
- [x] Add color imports
- [x] Replace success icon (line 65)
- [x] Replace step badge numbers (lines 86, 98, 110, 122)
- [x] Replace helper text instances
- [x] Replace muted text (line 235)

### Cart Page (17 instances)
- [x] Add color imports
- [x] Replace helper text instances
- [x] Replace error messages (line 103)
- [x] Replace danger hover (line 127)
- [x] Replace link colors (line 168)

### Test High-Priority Pages
- [ ] Run npm run test:a11y
- [ ] Verify no regressions

---

## Step 4: Fix Medium-Priority Pages (16 instances total)

### Shop Page (6 instances)
- [ ] Add color imports
- [ ] Replace link hover (line 89)
- [ ] Replace helper text (lines 119, 125, 175)

### Services Page (4 instances)
- [ ] Add color imports
- [ ] Replace checkmark icon (line 86)
- [ ] Replace title hover (line 89)
- [ ] Replace helper text (line 93)

### Pricing Page (6 instances)
- [ ] Add color imports
- [ ] Replace helper text (lines 84, 96, 111)

---

## Step 5: Fix Low-Priority Pages (3 instances total)

### How It Works Page (2 instances)
- [ ] Add color imports
- [ ] Replace timeline heading (line 66)
- [ ] Replace helper text (line 69)

### FAQ Page (1 instance)
- [ ] Add color imports
- [ ] Replace answer text (line 119)

---

## Step 6: Final Testing & Verification

- [ ] Run npm run test:a11y (expect 22 passing, 0 failing)
- [ ] Search for remaining hardcoded colors
- [ ] Visual verification (light mode)
- [ ] Visual verification (dark mode)
- [ ] No TypeScript errors

---

## Step 7: Commit & Push

- [ ] Stage all changes (git add .)
- [ ] Create commit with /dac
- [ ] Push to dev branch (git push origin dev)

---

## Summary

**Total Tasks:** 50
**Completed:** 1
**Remaining:** 49
**Progress:** 2%

**Hardcoded Colors to Fix:**
- High Priority: 77 instances
- Medium Priority: 16 instances
- Low Priority: 3 instances
- **Total:** 96 inline color replacements (after staged fixes)

**Success Criteria:**
✅ All 22 accessibility tests pass
✅ Zero hardcoded color patterns remain
✅ "Get a Quote" appears only 2x on homepage
✅ Changes committed and pushed to dev
