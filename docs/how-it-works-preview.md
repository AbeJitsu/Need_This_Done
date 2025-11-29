# How It Works Page - Evaluation

## ASCII Preview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HEADER (PageHeader)                                │
│                                                                                 │
│                              How It Works                                       │
│                                 (h1, bold)                                      │
│                                                                                 │
│            Here's how we work together to get your project done right.          │
│                              (gray subtext)                                     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                        STEPS GRID (2x2 on desktop, 1 col mobile)                │
│                                                                                 │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐     │
│  │ ┌───┐                           │    │ ┌───┐                           │     │
│  │ │ 1 │  Tell Us What You Need    │    │ │ 2 │  We Review & Respond      │     │
│  │ └───┘  (purple title)           │    │ └───┘  (blue title)             │     │
│  │ purple                          │    │ blue                            │     │
│  │ badge                           │    │ badge                           │     │
│  │                                 │    │                                 │     │
│  │ Describe your task in your own  │    │ We carefully review your        │     │
│  │ words. Include any files...     │    │ request and get back to you...  │     │
│  │                                 │    │                                 │     │
│  │ • Fill out our simple form      │    │ • We assess what needs done     │     │
│  │ • Attach any relevant files     │    │ • We ask clarifying questions   │     │
│  │ • Let us know your timeline     │    │ • You receive a clear quote     │     │
│  │                                 │    │                                 │     │
│  │ border: 2px gray                │    │ border: 2px gray                │     │
│  │ hover: purple              [✓]  │    │ hover: blue               [✓]   │     │
│  └─────────────────────────────────┘    └─────────────────────────────────┘     │
│                                                                                 │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐     │
│  │ ┌───┐                           │    │ ┌───┐                           │     │
│  │ │ 3 │  We Get to Work           │    │ │ 4 │  Review & Deliver         │     │
│  │ └───┘  (green title)            │    │ └───┘  (orange title)           │     │
│  │ green                           │    │ orange                          │     │
│  │ badge                           │    │ badge                           │     │
│  │                                 │    │                                 │     │
│  │ Once you give the go-ahead,     │    │ You review the completed work.  │     │
│  │ we start on your task...        │    │ We make any needed adjustments..│     │
│  │                                 │    │                                 │     │
│  │ • Work begins on your task      │    │ • You review what we have done  │     │
│  │ • Regular updates on progress   │    │ • We address any feedback       │     │
│  │ • Open communication            │    │ • Final delivery. Task complete!│     │
│  │                                 │    │                                 │     │
│  │ border: 2px gray                │    │ border: 2px gray                │     │
│  │ hover: green              [✓]   │    │ hover: orange             [✓]   │     │
│  └─────────────────────────────────┘    └─────────────────────────────────┘     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                          TIMELINE NOTE (Card component)                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  Typical Timeline                                                       │    │
│  │  (blue text, semibold)                                                  │    │
│  │                                                                         │    │
│  │  Most projects are completed within 1-2 weeks, depending on scope.      │    │
│  │  Larger projects may take longer - we'll provide a clear timeline       │    │
│  │  with your quote.                                                       │    │
│  │                                                                         │    │
│  │  border: 2px gray                                                       │    │
│  │  hover: blue border + glow                                              │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                             CTA SECTION (CTASection)                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │                       Ready to Get Started?                             │    │
│  │                            (h2, bold)                                   │    │
│  │                                                                         │    │
│  │           Tell us what you need and we'll take it from there.           │    │
│  │                           (gray text)                                   │    │
│  │                                                                         │    │
│  │              ┌──────────────┐    ┌──────────────┐                       │    │
│  │              │ Get In Touch │    │ View Pricing │                       │    │
│  │              │   (orange)   │    │    (teal)    │                       │    │
│  │              └──────────────┘    └──────────────┘                       │    │
│  │                                                                         │    │
│  │  border: 2px gray                                                       │    │
│  │  hover: orange border                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Issues Found (ALL FIXED)

### [✓] ISSUE 1: StepCard has generic gray hover (not color-matched)

**Location**: `app/components/StepCard.tsx:29`

**Fixed**: Added `cardHoverColors[color]` - now each step hovers to its accent color (purple, blue, green, orange).

---

### [✓] ISSUE 2: StepCard border is 1px (inconsistent with other cards)

**Location**: `app/components/StepCard.tsx:29`

**Fixed**: Updated to `border-2 border-gray-400` for consistency with ServiceCard and Card components.

---

### [—] ISSUE 3: No visual connection showing flow between steps

**Decision**: Keep as-is. The numbered CircleBadges (1, 2, 3, 4) provide clear sequence. Adding connecting lines would add visual clutter without meaningful benefit.

---

### [✓] ISSUE 4: CTA buttons didn't match page context

**Fixed**: Changed from "View FAQ" + "Our Services" to "Get In Touch" + "View Pricing" - now visitors who understand the process can take immediate action.

---

## Component Breakdown

| Section | Component | Border | Hover | Notes |
|---------|-----------|--------|-------|-------|
| Header | PageHeader | none | none | Centered text |
| Step 1-4 | StepCard | 2px gray | color-matched [✓] | Purple/blue/green/orange |
| Timeline | Card | 2px gray | blue | Uses Card component |
| CTA | CTASection | 2px gray | orange | "Get In Touch" + "View Pricing" |

---

## Files Involved

- `app/app/how-it-works/page.tsx` - Page layout and data
- `app/components/StepCard.tsx` - Step cards (needs hover fix)
- `app/components/PageHeader.tsx` - Already using shared component
- `app/components/Card.tsx` - Already using for Timeline
- `app/components/CTASection.tsx` - Already using for CTA
- `app/components/CircleBadge.tsx` - Number badges (looks good)

---

## Add Your Notes Below

<!--
Add your feedback, decisions, and additional observations here:

-->
