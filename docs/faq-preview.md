# FAQ Page - Evaluation

## ASCII Preview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HEADER (PageHeader)                                │
│                                                                                 │
│                       Frequently Asked Questions                                │
│                              (h1, bold)                                         │
│                                                                                 │
│                        Your questions, answered.                                │
│                            (gray subtext)                                       │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                         FAQ ITEMS (10 items, stacked)                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ ┌───┐                                                                   │    │
│  ││ 1 │  What types of tasks do you handle?                               │    │
│  │ └───┘  (purple title)                                                   │    │
│  │ purple                                                                  │    │
│  │ badge   We help with all kinds of tasks: spreadsheets...               │    │
│  │         [services page] link inside                                     │    │
│  │                                                                         │    │
│  │ border: 1px gray + 4px left purple accent               [!]             │    │
│  │ hover: purple (via faqColors)                           [✓]             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ ┌───┐                                                                   │    │
│  ││ 2 │  Do I need to be tech-savvy to work with you?                     │    │
│  │ └───┘  (blue title)                                                     │    │
│  │ blue                                                                    │    │
│  │ badge   Not at all! We work with people of all technical backgrounds...│    │
│  │                                                                         │    │
│  │ border: 1px gray + 4px left blue accent                 [!]             │    │
│  │ hover: blue (via faqColors)                             [✓]             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ ┌───┐                                                                   │    │
│  ││ 3 │  How long does a typical task take?                               │    │
│  │ └───┘  (green title)                                                    │    │
│  │ green                                                                   │    │
│  │ badge   Most tasks completed within a few days to a week...            │    │
│  │         [how it works] link inside                                      │    │
│  │                                                                         │    │
│  │ border: 1px gray + 4px left green accent                [!]             │    │
│  │ hover: green (via faqColors)                            [✓]             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ ┌───┐                                                                   │    │
│  ││ 4 │  How much does it cost?                                           │    │
│  │ └───┘  (orange title)                                                   │    │
│  │ orange                                                                  │    │
│  │ badge   Pricing depends on scope... [pricing page] link inside         │    │
│  │                                                                         │    │
│  │ border: 1px gray + 4px left orange accent               [!]             │    │
│  │ hover: orange (via faqColors)                           [✓]             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ... (items 5-10 continue cycling purple/blue/green/orange)                     │
│                                                                                 │
│  Item 5: "How do I get started?" (purple) - has [contact form] link            │
│  Item 6: "One-time or ongoing?" (blue)                                          │
│  Item 7: "Changes after delivery?" (green)                                      │
│  Item 8: "How do you handle communication?" (orange)                            │
│  Item 9: "Payment methods?" (purple)                                            │
│  Item 10: "Question not listed?" (blue) - has [contact page] link              │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                    CTA SECTION (CUSTOM INLINE - NOT CTASection!)        [!]     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  bg: gradient blue-50 to purple-50 (light mode)                        │    │
│  │  bg: gray-800 (dark mode)                                              │    │
│  │                                                                         │    │
│  │                     Still Have Questions?                               │    │
│  │                          (h2, bold)                                     │    │
│  │                                                                         │    │
│  │      We're here to help. Reach out and we'll get back to you promptly. │    │
│  │                         (gray text)                                     │    │
│  │                                                                         │    │
│  │           ┌───────────────────┐    ┌──────────────┐                     │    │
│  │           │ Learn How It Works│    │ View Services│                     │    │
│  │           │     (orange)      │    │    (teal)    │                     │    │
│  │           └───────────────────┘    └──────────────┘                     │    │
│  │                                                                         │    │
│  │  border: 1px blue-200                                           [!]     │    │
│  │  hover: border-blue-300 (hardcoded, not using Card)             [!]     │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Issues Found

### [✓] ISSUE 1: FAQ items use 2px border (fixed)

**Location**: `app/app/faq/page.tsx:120`

**Current**:
```tsx
border border-gray-200 dark:border-gray-700 border-l-4 ${styles.border}
```

**Other cards use**: `border-2 border-gray-400` (ServiceCard, StepCard, Card)

**Fix**: Change to `border-2 border-gray-400 dark:border-gray-500 border-l-4`

---

### [✓] ISSUE 2: FAQ items already have color-matched hover

**Location**: `app/lib/colors.ts` (faqColors)

**Status**: Already working! Each FAQ item hovers to its accent color via `faqColors[color].hover`

---

### [✓] ISSUE 3: Bottom CTA now uses CTASection component (fixed)

**Location**: `app/app/faq/page.tsx:138-154`

**Current**: 17 lines of custom inline styling
```tsx
<div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-gray-800...">
```

**Problem**:
- Doesn't use CTASection component (DRY violation)
- Has gradient background (inconsistent with other pages)
- 1px border instead of 2px

**Fix**: Replace with CTASection component

---

### [✓] ISSUE 4: CTA buttons now drive action (fixed)

**Current buttons**:
- "Learn How It Works" (orange) → /how-it-works
- "View Services" (teal) → /services

**Problem**: FAQ visitors have questions answered - they're ready to act!

**Better options**:
- "Get In Touch" (orange) → /contact
- "View Pricing" (teal) → /pricing

---

## Component Breakdown

| Section | Component | Border | Hover | Notes |
|---------|-----------|--------|-------|-------|
| Header | PageHeader | none | none | Centered text |
| FAQ 1-10 | inline div | 1px gray [!] | color-matched [✓] | Has left accent |
| CTA | inline div [!] | 1px blue [!] | blue | Should use CTASection |

---

## Files Involved

- `app/app/faq/page.tsx` - Page layout (needs CTA refactor)
- `app/lib/colors.ts` - faqColors (already has color hover)
- `app/components/CircleBadge.tsx` - Number badges (working)
- `app/components/PageHeader.tsx` - Already using

---

## Recommended Fixes

1. **Update FAQ item border** from 1px to 2px for consistency
2. **Replace inline CTA** with CTASection component
3. **Change CTA buttons** to "Get In Touch" + "View Pricing"

---

## Add Your Notes Below

<!--
Add your feedback, decisions, and additional observations here:

-->
