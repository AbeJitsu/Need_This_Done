# Dark Mode Fix Plan

## Overview

**Current Status**: Dark mode temporarily disabled in production to prevent broken styling
**Goal**: Fix all hardcoded colors to use centralized color system from `lib/colors.ts`
**Scale**: 1,134 hardcoded color instances across 117 files

## Branch Strategy

1. Create new branch from main: `git checkout -b fix/dark-mode-colors`
2. Multiple agents can work in parallel on different file batches
3. Once complete and tested, merge to main
4. Then merge main to production

## The Core Problem

- **810 `dark:` classes** hardcoded in components
- **324+ other color classes** (text-gray-900, bg-white, etc.) not using centralized system
- ESLint rule only catches `dark:` prefix, missing 70% of violations
- No pre-commit hooks or CI enforcement

## Work Distribution for Parallel Agents

### Agent A - High Priority Components (184 issues)
**Files to fix:**
- [ ] `components/HowItWorks.tsx` (66 issues)
- [ ] `components/AuthDemo.tsx` (61 issues)  
- [ ] `components/templates/WizardSteps.tsx` (57 issues)

**Common patterns in these files:**
- `text-blue-900 dark:text-white` → Use `infoBannerColors.blue.heading`
- `bg-gray-900 dark:bg-gray-950` → Use appropriate bg from colors.ts
- `border-purple-200 dark:border-purple-700` → Use border colors from colors.ts

### Agent B - Navigation & Admin (140 issues)
**Files to fix:**
- [ ] `components/AdminDashboard.tsx` (46 issues)
- [ ] `components/Navigation.tsx` (34 issues)
- [ ] `components/UserDashboard.tsx` (26 issues)
- [ ] `components/SpeedDemo.tsx` (36 issues)

**Common patterns in these files:**
- `text-gray-600 dark:text-gray-300` → Use `formInputColors.helper`
- `text-gray-900 dark:text-gray-100` → Use `headingColors.primary`

### Agent C - Media & Templates (126 issues)
**Files to fix:**
- [ ] `components/media/MediaLibrary.tsx` (32 issues)
- [ ] `components/templates/TemplatePicker.tsx` (25 issues)
- [ ] `components/media/ImageUpload.tsx` (23 issues)
- [ ] `components/DatabaseDemo.tsx` (42 issues)

### Agent D - Content Editors (114 issues)
**Files to fix:**
- [ ] `components/InlineEditor/VersionHistoryPanel.tsx` (23 issues)
- [ ] `components/content-editor/previews/HomepagePreview.tsx` (18 issues)
- [ ] `components/content-editor/fields/ArrayField.tsx` (18 issues)
- [ ] `components/get-started/GetStartedPageClient.tsx` (21 issues)

### Agent E - Puck Components (98 issues)
**Files to fix:**
- [ ] `components/puck/ProductPicker.tsx` (37 issues)
- [ ] `components/puck/MediaPickerField.tsx` (27 issues)
- [ ] `components/puck/ProductCardComponent.tsx` (17 issues)

### Agent F - Remaining Components
**Files with fewer issues** - Complete all files with <15 hardcoded colors

## Step-by-Step Fix Process

### 1. First, Expand colors.ts with Missing Patterns

**Add these exports to `lib/colors.ts`:**

```typescript
// Special color values
export const specialColors = {
  white: 'text-white',
  bgWhite: 'bg-white dark:bg-gray-900',
  bgTransparent: 'bg-transparent',
  borderTransparent: 'border-transparent',
  textCurrent: 'text-current',
};

// Focus ring patterns (currently missing)
export const focusPatterns = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  purple: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
  // Add other colors
};

// Hover text colors (currently missing)
export const hoverTextColors: Record<AccentVariant, string> = {
  purple: 'hover:text-purple-700 dark:hover:text-purple-300',
  blue: 'hover:text-blue-700 dark:hover:text-blue-300',
  // Add other colors
};

// Common opacity utilities
export const opacityUtils = {
  opacity0: 'opacity-0',
  opacity25: 'opacity-25',
  opacity50: 'opacity-50',
  opacity75: 'opacity-75',
  opacity100: 'opacity-100',
};
```

### 2. Update ESLint Configuration

**Edit `.eslintrc.json`:**

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error", // Changed from "warn" to "error"
      {
        "selector": "Literal[value=/\\b(text|bg|border|ring|outline|fill|stroke|shadow|placeholder|decoration|divide|from|via|to)-(white|black|transparent|current|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))\\b/]",
        "message": "No hardcoded colors allowed. Import from '@/lib/colors.ts' instead."
      },
      {
        "selector": "TemplateLiteral > TemplateElement[value.raw=/\\b(text|bg|border|ring|outline|fill|stroke|shadow|placeholder|decoration|divide|from|via|to)-(white|black|transparent|current|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))\\b/]",
        "message": "No hardcoded colors in template literals. Import from '@/lib/colors.ts' instead."
      },
      {
        "selector": "Literal[value=/\\b(hover:|focus:|active:|disabled:|group-hover:|dark:)(text|bg|border|ring)-/]",
        "message": "No hardcoded state colors. Import from '@/lib/colors.ts' instead."
      }
    ]
  }
}
```

### 3. Common Migration Patterns

#### Pattern 1: Info/Alert Boxes
```tsx
// ❌ OLD
<div className={`${neutralAccentBg.blue} border border-blue-300 dark:border-blue-700`}>
  <h3 className="text-blue-900 dark:text-white">Title</h3>
  <p className="text-blue-900 dark:text-gray-100">Content</p>
</div>

// ✅ NEW
import { infoBannerColors } from '@/lib/colors';

<div className={`${infoBannerColors.blue.bg} ${infoBannerColors.blue.border}`}>
  <h3 className={infoBannerColors.blue.heading}>Title</h3>
  <p className={infoBannerColors.blue.text}>Content</p>
</div>
```

#### Pattern 2: General Text
```tsx
// ❌ OLD
<h2 className="text-gray-900 dark:text-gray-100">
<p className="text-gray-600 dark:text-gray-300">

// ✅ NEW
import { headingColors, formInputColors } from '@/lib/colors';

<h2 className={headingColors.primary}>
<p className={formInputColors.helper}>
```

#### Pattern 3: Card Backgrounds
```tsx
// ❌ OLD
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

// ✅ NEW
import { cardBgColors, cardBorderColors } from '@/lib/colors';

<div className={`${cardBgColors.base} ${cardBorderColors.light}`}>
```

## Testing Checklist

For each component fixed:
- [ ] Remove all ESLint warnings
- [ ] Verify light mode appearance
- [ ] Re-enable dark mode temporarily and verify appearance
- [ ] Check hover/focus states work correctly
- [ ] Run component tests if they exist

## Final Steps

1. **Create pre-commit hook** (`.husky/pre-commit`):
```bash
#!/bin/sh
npm run lint -- --max-warnings=0
```

2. **Add test to prevent regression**:
```typescript
// tests/no-hardcoded-colors.test.ts
describe('No hardcoded colors', () => {
  it('should not contain hardcoded color classes', async () => {
    const files = await glob('components/**/*.tsx');
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const colorPattern = /\b(text|bg|border)-(gray|blue|purple|white|black)-\d+/g;
      expect(content).not.toMatch(colorPattern);
    }
  });
});
```

3. **Update layout.tsx to re-enable dark mode**:
Remove the temporary force light mode script and restore original dark mode detection.

4. **Unhide DarkModeToggle** in Navigation.tsx

## Success Criteria

- Zero ESLint warnings related to colors
- All colors imported from `lib/colors.ts`
- Dark mode works correctly on all pages
- Pre-commit hook prevents future violations
- Tests ensure no regression

## Notes

- If a color pattern doesn't exist in colors.ts, ADD IT FIRST before using
- Follow the existing patterns in colors.ts (WCAG AA compliance)
- Use the dark-mode-system.md principles (INVERSION vs NEUTRAL)
- Test thoroughly - dark mode bugs are highly visible to users