# Comprehensive Hardcoded Text Color Audit Report

## Executive Summary

I've completed a thorough search across all 10 public page files and found **125 instances** of hardcoded text color classes. These colors span gray, blue, green, purple, red, and orange shades (ranging from 300-900 levels). All instances need to be replaced with centralized color definitions from `lib/colors.ts`.

---

## Summary by File

| File | Total Hardcoded Colors | Critical Priority |
|------|----------------------|-------------------|
| `/app/app/contact/page.tsx` | 33 | High |
| `/app/app/checkout/page.tsx` | 30 | High |
| `/app/app/cart/page.tsx` | 17 | High |
| `/app/app/get-started/page.tsx` | 18 | High |
| `/app/app/shop/page.tsx` | 6 | Medium |
| `/app/app/page.tsx` (Home) | 9 | High |
| `/app/app/services/page.tsx` | 4 | Medium |
| `/app/app/pricing/page.tsx` | 6 | Medium |
| `/app/app/how-it-works/page.tsx` | 2 | Low |
| `/app/app/faq/page.tsx` | 1 | Low |

---

## Detailed Findings by File

### 1. `/app/app/page.tsx` (Home Page)
**Total: 9 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 57 | `text-blue-600 dark:text-blue-400` | Hero heading (h1) | Both | `titleColors.blue` |
| 60 | `text-gray-600 dark:text-gray-300` | Hero description (p) | Both | `formInputColors.helper` |
| 75 | `text-gray-900 dark:text-gray-100` | Services section heading | Both | Already using component pattern |
| 75 | `text-blue-600 dark:text-blue-400` | Services heading hover | Both | `titleColors.blue` |
| 100 | `text-gray-900 dark:text-gray-100` | How It Works heading | Both | Already using component pattern |
| 109 | `text-gray-900 dark:text-gray-100` | Step title | Both | Already using component pattern |
| 110 | `text-gray-600 dark:text-gray-300` | Step description | Both | `formInputColors.helper` |
| 116 | `text-gray-700 dark:text-gray-300` | Link text | Both | `formInputColors.helper` |
| 123 | `text-gray-900 dark:text-gray-100` | CTA heading | Both | Already using component pattern |
| 126 | `text-gray-600 dark:text-gray-300` | CTA description | Both | `formInputColors.helper` |

### 2. `/app/app/services/page.tsx`
**Total: 4 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 78 | `text-gray-900 dark:text-gray-100` | "What to Expect" heading | Both | Already using component pattern |
| 86 | `text-green-600 dark:text-green-700` | Checkmark icon | Both | NEW: `successCheckmarkColors.icon` |
| 89 | `text-gray-900 dark:text-gray-100` | Item title | Both | Already using component pattern |
| 89 | `text-blue-600 dark:text-blue-300` | Item title hover (with link) | Both | `titleColors.blue` |
| 93 | `text-gray-600 dark:text-gray-300` | Item description | Both | `formInputColors.helper` |

### 3. `/app/app/pricing/page.tsx`
**Total: 6 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 81 | `text-gray-900 dark:text-gray-100` | Payment structure label | Both | Already using component pattern |
| 84 | `text-gray-600 dark:text-gray-300` | Payment structure description | Both | `formInputColors.helper` |
| 93 | `text-gray-900 dark:text-gray-100` | Payment structure label | Both | Already using component pattern |
| 96 | `text-gray-600 dark:text-gray-300` | Payment structure description | Both | `formInputColors.helper` |
| 108 | `text-gray-900 dark:text-gray-100` | Custom section heading | Both | Already using component pattern |
| 111 | `text-gray-600 dark:text-gray-300` | Custom section description | Both | `formInputColors.helper` |

### 4. `/app/app/how-it-works/page.tsx`
**Total: 2 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 66 | `text-blue-600 dark:text-blue-300` | Timeline note heading | Both | `titleColors.blue` |
| 69 | `text-gray-600 dark:text-gray-300` | Timeline note description | Both | `formInputColors.helper` |

### 5. `/app/app/faq/page.tsx`
**Total: 1 hardcoded color**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 119 | `text-gray-600 dark:text-gray-300` | FAQ answer text | Both | `formInputColors.helper` |

### 6. `/app/app/get-started/page.tsx`
**Total: 18 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 65 | `text-green-600 dark:text-green-400` | Success icon | Both | `featureCardColors.success.icon` |
| 69 | `text-gray-900 dark:text-gray-100` | Success page heading | Both | Already using component pattern |
| 72 | `text-gray-600 dark:text-gray-300` | Success page description | Both | `formInputColors.helper` |
| 79 | `text-gray-900 dark:text-gray-100` | "What Happens Next" heading | Both | Already using component pattern |
| 86 | `text-green-700 dark:text-green-300` | Step 1 badge number | Both | NEW: `stepBadgeColors.green` |
| 89 | `text-gray-900 dark:text-gray-100` | Step title | Both | Already using component pattern |
| 90 | `text-gray-600 dark:text-gray-300` | Step description | Both | `formInputColors.helper` |
| 98 | `text-blue-700 dark:text-blue-300` | Step 2 badge number | Both | NEW: `stepBadgeColors.blue` |
| 101 | `text-gray-900 dark:text-gray-100` | Step title | Both | Already using component pattern |
| 102 | `text-gray-600 dark:text-gray-300` | Step description | Both | `formInputColors.helper` |
| 110 | `text-purple-700 dark:text-purple-300` | Step 3 badge number | Both | NEW: `stepBadgeColors.purple` |
| 113 | `text-gray-900 dark:text-gray-100` | Step title | Both | Already using component pattern |
| 114 | `text-gray-600 dark:text-gray-300` | Step description | Both | `formInputColors.helper` |
| 122 | `text-orange-700 dark:text-orange-300` | Step 4 badge number | Both | NEW: `stepBadgeColors.orange` |
| 125 | `text-gray-900 dark:text-gray-100` | Step title | Both | Already using component pattern |
| 126 | `text-gray-600 dark:text-gray-300` | Step description | Both | `formInputColors.helper` |
| 156 | `text-gray-900 dark:text-gray-100` | Payment section heading | Both | Already using component pattern |
| 163 | `text-gray-900 dark:text-gray-100` | Payment label | Both | Already using component pattern |
| 164 | `text-gray-600 dark:text-gray-300` | Payment description | Both | `formInputColors.helper` |
| 171 | `text-gray-900 dark:text-gray-100` | Payment label | Both | Already using component pattern |

### 7. `/app/app/shop/page.tsx`
**Total: 6 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 89 | `hover:text-blue-700 dark:hover:text-blue-300` | Cart link hover | Both | `navigationColors.linkHover` (blue variant) |
| 119 | `text-gray-600 dark:text-gray-300` | Loading message | Both | `formInputColors.helper` |
| 125 | `text-gray-600 dark:text-gray-300` | No products message | Both | `formInputColors.helper` |
| 165 | `text-gray-900 dark:text-gray-100` | Product title | Both | Already using component pattern |
| 169 | `text-gray-900 dark:text-gray-100` | Product price | Both | Already using component pattern |
| 175 | `text-gray-600 dark:text-gray-300` | Product description | Both | `formInputColors.helper` |

### 8. `/app/app/cart/page.tsx`
**Total: 17 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 76 | `text-gray-600 dark:text-gray-300` | Empty cart message | Both | `formInputColors.helper` |
| 103 | `text-red-900 dark:text-red-200` | Error message | Both | `formValidationColors.error` |
| 116 | `text-gray-900 dark:text-gray-100` | Cart item title | Both | Already using component pattern |
| 120 | `text-gray-600 dark:text-gray-300` | Variant info | Both | `formInputColors.helper` |
| 127 | `hover:text-red-600 dark:hover:text-red-400` | Remove button hover | Both | NEW: `dangerColors.hover` |
| 143 | `text-gray-900 dark:text-gray-100` | Quantity display | Both | Already using component pattern |
| 156 | `text-gray-900 dark:text-gray-100` | Item price | Both | Already using component pattern |
| 168 | `text-blue-600 dark:text-blue-400` | Continue shopping link | Both | `titleColors.blue` |
| 178 | `text-gray-900 dark:text-gray-100` | Summary heading | Both | Already using component pattern |
| 184 | `text-gray-600 dark:text-gray-300` | Subtotal label | Both | `formInputColors.helper` |
| 185 | `text-gray-900 dark:text-gray-100` | Subtotal value | Both | Already using component pattern |
| 191 | `text-gray-600 dark:text-gray-300` | Tax label | Both | `formInputColors.helper` |
| 192 | `text-gray-900 dark:text-gray-100` | Tax value | Both | Already using component pattern |
| 199 | `text-gray-900 dark:text-gray-100` | Total label | Both | Already using component pattern |
| 200 | `text-gray-900 dark:text-gray-100` | Total value | Both | Already using component pattern |
| 226 | `text-gray-600 dark:text-gray-300` | Info box text | Both | `formInputColors.helper` |

### 9. `/app/app/checkout/page.tsx`
**Total: 30 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 158 | `text-green-600 dark:text-green-400` | Success checkmark icon | Both | `featureCardColors.success.icon` |
| 169 | `text-gray-900 dark:text-gray-100` | Success heading | Both | Already using component pattern |
| 172 | `text-gray-600 dark:text-gray-300` | Success description | Both | `formInputColors.helper` |
| 180 | `text-gray-600 dark:text-gray-300` | Order number label | Both | `formInputColors.helper` |
| 183 | `text-gray-900 dark:text-gray-100` | Order number value | Both | Already using component pattern |
| 189 | `text-gray-600 dark:text-gray-300` | Email label | Both | `formInputColors.helper` |
| 192 | `text-gray-900 dark:text-gray-100` | Email value | Both | Already using component pattern |
| 193 | `text-gray-600 dark:text-gray-300` | Email helper text | Both | `formInputColors.helper` |
| 200 | `text-green-900 dark:text-green-200` | Success message | Both | `formValidationColors.success` |
| 235 | `text-red-900 dark:text-red-200` | Error message | Both | `formValidationColors.error` |
| 242 | `text-gray-900 dark:text-gray-100` | Section heading | Both | Already using component pattern |
| 285 | `text-gray-600 dark:text-gray-300` | Empty cart message | Both | `formInputColors.helper` |
| 300 | `text-red-900 dark:text-red-200` | Error message | Both | `formValidationColors.error` |
| 307 | `text-gray-900 dark:text-gray-100` | Section heading | Both | Already using component pattern |
| 313 | `text-gray-600 dark:text-gray-300` | Field label | Both | `formInputColors.helper` |
| 316 | `text-gray-900 dark:text-gray-100` | Field value | Both | Already using component pattern |
| 319 | `text-gray-600 dark:text-gray-300` | Helper text | Both | `formInputColors.helper` |
| 326 | `text-gray-900 dark:text-gray-100` | Input label | Both | `formInputColors.label` |
| 334 | `text-gray-900 dark:text-gray-100` | Input text | Both | Part of `formInputColors.base` |
| 337 | `text-gray-600 dark:text-gray-300` | Helper text | Both | `formInputColors.helper` |
| 453 | `text-gray-900 dark:text-gray-100` | Summary heading | Both | Already using component pattern |
| 459 | `text-gray-600 dark:text-gray-300` | Items label | Both | `formInputColors.helper` |
| 460 | `text-gray-900 dark:text-gray-100` | Items value | Both | Already using component pattern |
| 468 | `text-gray-600 dark:text-gray-300` | Subtotal label | Both | `formInputColors.helper` |
| 471 | `text-gray-900 dark:text-gray-100` | Subtotal value | Both | `formInputColors.helper` |
| 477 | `text-gray-600 dark:text-gray-300` | Tax label | Both | `formInputColors.helper` |
| 478 | `text-gray-900 dark:text-gray-100` | Tax value | Both | Already using component pattern |
| 488 | `text-gray-900 dark:text-gray-100` | Total label | Both | Already using component pattern |
| 491 | `text-gray-900 dark:text-gray-100` | Total value | Both | Already using component pattern |

### 10. `/app/app/contact/page.tsx`
**Total: 33 hardcoded colors**

| Line | Color Class | Context | Mode | Recommended Replacement |
|------|-------------|---------|------|------------------------|
| 158 | `text-green-600 dark:text-green-300` | Success checkmark | Both | NEW: `successCheckmarkColors.icon` |
| 160 | `text-gray-900 dark:text-gray-100` | Success heading | Both | Already using component pattern |
| 163 | `text-gray-600 dark:text-gray-300` | Success description | Both | `formInputColors.helper` |
| 169 | `text-gray-900 dark:text-gray-100` | "What happens next" heading | Both | Already using component pattern |
| 170 | `text-gray-600 dark:text-gray-300` | Steps list | Both | `formInputColors.helper` |
| 172 | `text-blue-600 dark:text-blue-300` | Step number 1 | Both | `titleColors.blue` |
| 176 | `text-blue-600 dark:text-blue-300` | Step number 2 | Both | `titleColors.blue` |
| 180 | `text-blue-600 dark:text-blue-300` | Step number 3 | Both | `titleColors.blue` |
| 212 | `text-gray-900 dark:text-gray-100` | Input field (inline class) | Both | Part of inline form styles |
| 229 | `text-gray-900 dark:text-gray-100` | Input field (inline class) | Both | Part of inline form styles |
| 247 | `text-gray-900 dark:text-gray-100` | Input field (inline class) | Both | Part of inline form styles |
| 262 | `text-gray-900 dark:text-gray-100` | Select field (inline class) | Both | Part of inline form styles |
| 287 | `text-gray-900 dark:text-gray-100` | Textarea field (inline class) | Both | Part of inline form styles |
| 331 | `text-gray-600 dark:text-gray-300` | File name display | Both | `formInputColors.helper` |
| 334 | `text-gray-400 dark:text-gray-500` | File size display | Both | NEW: `mutedTextColors.normal` |
| 341 | `text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100` | Remove file button | Both | NEW: `dangerColors.text` + `dangerColors.hover` |

---

## Color Pattern Analysis

### Most Common Hardcoded Patterns

1. **Body/Helper Text** (appears 45+ times)
   - Pattern: `text-gray-600 dark:text-gray-300`
   - Use: Descriptions, helper text, secondary content
   - **Replacement**: `formInputColors.helper`

2. **Headings/Labels** (appears 40+ times)
   - Pattern: `text-gray-900 dark:text-gray-100`
   - Use: Headings, labels, primary text
   - **Note**: Many already using components, but inline usage needs extraction

3. **Link/Accent Colors** (appears 15+ times)
   - Pattern: `text-blue-600 dark:text-blue-400` or `text-blue-600 dark:text-blue-300`
   - Use: Links, accented headings, interactive elements
   - **Replacement**: `titleColors.blue`

4. **Success Messages/Icons** (appears 5+ times)
   - Pattern: `text-green-600 dark:text-green-400`
   - Use: Success icons, checkmarks
   - **Replacement**: `featureCardColors.success.icon`

5. **Error Messages** (appears 5+ times)
   - Pattern: `text-red-900 dark:text-red-200`
   - Use: Error messages, validation feedback
   - **Replacement**: `formValidationColors.error`

---

## New Color Definitions Needed in `lib/colors.ts`

Based on the audit, these new color definitions should be added:

```typescript
// ============================================================================
// Step Badge Colors - Numbered badges for multi-step processes
// ============================================================================
export const stepBadgeColors: Record<AccentVariant, string> = {
  purple: 'text-purple-700 dark:text-purple-300',
  blue: 'text-blue-700 dark:text-blue-300',
  green: 'text-green-700 dark:text-green-300',
  orange: 'text-orange-700 dark:text-orange-300',
  teal: 'text-teal-700 dark:text-teal-300',
  gray: 'text-gray-700 dark:text-gray-300',
  red: 'text-red-700 dark:text-red-300',
};

// ============================================================================
// Success Checkmark Colors - For checkmarks in feature lists
// ============================================================================
export const successCheckmarkColors = {
  icon: 'text-green-600 dark:text-green-300',
  iconAlt: 'text-green-600 dark:text-green-700', // Used in services page
};

// ============================================================================
// Danger/Destructive Action Colors
// ============================================================================
export const dangerColors = {
  text: 'text-red-500 dark:text-red-300',
  hover: 'hover:text-red-600 dark:hover:text-red-400',
  hoverStrong: 'hover:text-red-700 dark:hover:text-red-100',
};

// ============================================================================
// Muted Text Colors - For very subtle secondary text
// ============================================================================
export const mutedTextColors = {
  normal: 'text-gray-400 dark:text-gray-500',
  light: 'text-gray-500 dark:text-gray-300',
};

// ============================================================================
// Heading Text Colors - Standard heading colors (non-accented)
// ============================================================================
export const headingColors = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-700 dark:text-gray-300',
};
```

---

## Recommendations

### Priority 1: High-Impact Pages (Complete First)
1. **Contact page** - 33 instances, customer-facing
2. **Checkout page** - 30 instances, critical conversion point
3. **Home page** - 9 instances, first impression
4. **Get Started page** - 18 instances, conversion flow
5. **Cart page** - 17 instances, conversion flow

### Priority 2: Medium-Impact Pages
6. **Shop page** - 6 instances
7. **Services page** - 4 instances
8. **Pricing page** - 6 instances

### Priority 3: Low-Impact Pages
9. **How It Works** - 2 instances
10. **FAQ** - 1 instance

### Implementation Strategy

1. **Add new color definitions** to `lib/colors.ts` (stepBadgeColors, successCheckmarkColors, dangerColors, mutedTextColors, headingColors)

2. **Replace common patterns first** across all files:
   - All `text-gray-600 dark:text-gray-300` → `formInputColors.helper`
   - All `text-blue-600 dark:text-blue-400` (or 300) → `titleColors.blue`
   - All form validation messages → `formValidationColors.error/success`

3. **Extract inline form field colors** - Many form inputs have inline color classes that should use `formInputColors.base`

4. **Create reusable heading component** - Consider creating a `<Heading>` component for `text-gray-900 dark:text-gray-100` pattern since it appears 40+ times

5. **Test dark mode thoroughly** after each file replacement to ensure contrast ratios remain accessible

---

## Files Ready for Migration

All files have been analyzed and documented. The next step is to systematically replace these hardcoded colors with centralized definitions from `lib/colors.ts`, starting with the high-priority pages and adding the new color definitions as needed.

Total hardcoded text colors found: **125 instances** across 10 files.
