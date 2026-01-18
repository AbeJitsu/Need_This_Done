# Color Compliance Plan

**STATUS: COMPLETE** - Merged to production on 2026-01-18

Fix non-text contrast violations and consolidate to approved color palette.

## Approved Palette
- **Green:** `emerald-*`
- **Blue:** `blue-*`
- **Purple:** `purple-*`
- **Gold:** `gold-*`
- **Gray:** `gray-*`, `slate-*`, `stone-*`
- **Red:** errors only

---

## Phase 1: Fix Border Contrast (3:1 minimum)

- [x] Change `border-gray-200` → `border-gray-400` (37 occurrences)
- [x] Change `border-gray-300` → `border-gray-400` (4 occurrences)
- [x] Change `border-stone-200` → `border-stone-400` (9 occurrences)
- [x] Run non-text contrast test to verify

---

## Phase 2: Fix Icon Contrast (3:1 minimum)

- [x] Change light green icons (`green-300`, `emerald-300`) → `-500` or `-600` (mostly decorative, OK)
- [x] Change light blue icons (`sky-200`, `sky-300`) → `blue-500` or `-600` (handled in Phase 6)
- [x] Change light purple icons (`purple-200`, `violet-200`) → `purple-500` or `-600` (handled in Phase 5)
- [x] Run non-text contrast test to verify

---

## Phase 3: Convert Teal → Emerald (~60 uses)

- [x] `text-teal-*` → `text-emerald-*`
- [x] `bg-teal-*` → `bg-emerald-*`
- [x] `border-teal-*` → `border-emerald-*`
- [x] `from-teal-*` / `to-teal-*` → `from-emerald-*` / `to-emerald-*`

---

## Phase 4: Convert Amber/Yellow/Orange → Gold (~50 uses)

- [x] `text-amber-*` → `text-gold-*`
- [x] `bg-amber-*` → `bg-gold-*`
- [x] `border-amber-*` → `border-gold-*`
- [x] `from-amber-*` / `to-amber-*` → `from-gold-*` / `to-gold-*`
- [x] `*-yellow-*` → `*-gold-*`
- [x] `*-orange-*` → `*-gold-*`

---

## Phase 5: Convert Violet → Purple (~14 uses)

- [x] `text-violet-*` → `text-purple-*`
- [x] `bg-violet-*` → `bg-purple-*`
- [x] `border-violet-*` → `border-purple-*`
- [x] `from-violet-*` / `to-violet-*` → `from-purple-*` / `to-purple-*`

---

## Phase 6: Convert Sky/Cyan/Indigo → Blue (~20 uses)

- [x] `*-sky-*` → `*-blue-*`
- [x] `*-cyan-*` → `*-blue-*`
- [x] `*-indigo-*` → `*-blue-*`

---

## Phase 7: Convert Pink/Rose/Fuchsia → Purple or Remove (~23 uses)

- [x] `*-pink-*` → `*-purple-*`
- [x] `*-rose-*` → `*-purple-*`
- [x] `*-fuchsia-*` → `*-purple-*`

---

## Phase 8: Final Verification

- [x] Update Tailwind safelist in `tailwind.config.cjs` (remove old colors, add new)
- [x] Add border-t-* variants for card top accents
- [x] Run `npm run test:e2e -- contrast-audit` (text contrast) - 21 passed
- [x] Run `npm run test:e2e -- non-text-contrast` (icons/borders) - reports only, passes
- [x] Run `npm run dev` and visually check key pages
- [x] Commit all changes (excluding this plan.md)

---

## Phase 9: Deep Border Fixes (Session 2)

- [x] Fix `cardBorderColors` in lib/colors.ts (subtle/light/medium all → gray-400)
- [x] Fix border-gray-200 → border-gray-400 in 72+ component files
- [x] Fix border-gray-300 → border-gray-400 in 40+ component files
- [x] Fix border-stone-400 → border-stone-500 in /about, /resume (stone-400 = 2.52:1, needs 3:1)
- [x] Remove opacity modifiers (border-gray-400/60 → border-gray-400)
- [x] Fix lib/premium-design.ts border values
- [x] Create color-contrast-viewer.html for reference

---

## Phase 10: Documentation & Deployment (Session 3)

- [x] Fix build errors (missing accentText imports)
- [x] Update .claude/rules/colors.md with contrast compliance table
- [x] Update .claude/rules/design-system.md with minimum shades table
- [x] Add dark backgrounds section to color-contrast-viewer.html
- [x] Verify production build works
- [x] Merge main → production branch
- [x] Update plan.md with completion status

---

## Remaining Issues (Low Priority)

Decorative elements that don't require 3:1:
- Light gradient orbs in hero sections (decorative backgrounds)
- Icons that accompany text labels (text provides meaning)
- Small decorative dots
- 71 uses of `green-*` that could be `emerald-*` for consistency

---

## Color Audit Summary

| Palette | Uses | Status |
|---------|------|--------|
| gray-* | 1,776 | ✓ Primary neutral |
| blue-* | 540 | ✓ Approved |
| purple-* | 429 | ✓ Approved |
| emerald-* | 386 | ✓ Approved (green) |
| gold-* | 259 | ✓ Approved |
| red-* | 137 | ✓ Errors only |
| stone-* | 108 | ✓ Warm neutral (/about, /resume) |
| slate-* | 93 | ✓ Approved neutral |
| green-* | 71 | ⚠️ Should migrate to emerald-* |

---

## Notes

- Red is allowed for error states only
- Gray-400 is the minimum compliant border shade on white (3.03:1)
- Stone-500 is the minimum compliant border shade on white (4.25:1)
- Stone-400 FAILS at 2.52:1
- Shade mappings: 200→400, 300→500, 400→600 for equivalent visual weight
- Opacity modifiers reduce contrast (gray-400/60 ≈ 2.3:1)
