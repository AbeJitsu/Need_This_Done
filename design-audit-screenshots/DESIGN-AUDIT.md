# Need This Done - Design Audit Document

## Purpose
Ensure visual consistency across all public pages with premium, cohesive styling.
Homepage is the benchmark for modern styling - all pages should match.

## Screenshots Location
All full-page screenshots saved in: `design-audit-screenshots/`

---

## Success Criteria Checklist

### Border Consistency (PRIORITY)
- [ ] All section containers use same border: `border border-gray-200` (1px, subtle)
- [ ] All cards within sections use same border treatment
- [ ] No mixing of thick vs thin borders on same page
- [ ] Consistent border-radius across all cards (rounded-xl or rounded-2xl)

### Visual Hierarchy
- [ ] Dark CTA sections have no visible borders (rely on background contrast)
- [ ] Light sections with borders are visually consistent
- [ ] Card shadows are uniform (shadow-sm or none)

### Typography & Spacing
- [ ] Section headers follow same size/weight pattern
- [ ] Consistent padding within cards
- [ ] Consistent gaps between cards

---

## Page-by-Page Analysis

### 1. HOMEPAGE (/)
**Screenshot:** `homepage-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Need This Done | Nav | Get a Quote                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Websites. Automation. AI.                       │
│         [See Services]  [Get a Quote]                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    What We Build                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Website     │  │ Automation  │  │ Managed AI  │  THIN    │
│  │ Builds      │  │ Setup       │  │ Services    │  BORDER  │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├──────────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████████████   │
│  ██  Not Sure Where to Start?                          ██   │
│  ██  [Book a Free Consultation]                        ██   │
│  ████████████████████████████████████████████████████████   │
├──────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗   │
│  ║            Transparent Pricing                       ║   │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐             ║   │
│  ║  │ Websites │ │Automation│ │Managed AI│  NO BORDER  ║   │
│  ║  │ From $500│ │$150/flow │ │$500/mo   │  (bg only)  ║   │
│  ║  └──────────┘ └──────────┘ └──────────┘             ║   │
│  ╚══════════════════════════════════════════════════════╝   │
│                     ↑ THIN OUTER BORDER                     │
├──────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗   │
│  ║              How It Works                            ║   │
│  ║     ①──→②──→③──→④                                   ║   │
│  ║  Tell Us  Scope  Build  Launch                      ║   │
│  ╚══════════════════════════════════════════════════════╝   │
│                     ↑ THICKER BORDER ⚠️                      │
├──────────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████████████   │
│  ██            Ready to Build?                         ██   │
│  ██   [Get a Quote]  [View Pricing]                    ██   │
│  ████████████████████████████████████████████████████████   │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ⚠️ "How It Works" section has THICKER border than "Transparent Pricing"
2. ✓ "What We Build" cards have consistent thin borders
3. ✓ Dark sections have no borders (correct)

---

### 2. SERVICES (/services)
**Screenshot:** `services-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│              Three Ways to Grow                              │
├──────────────────────────────────────────────────────────────┤
│            Which sounds like you?                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Website     │  │ Automation  │  │ Managed AI  │  THIN    │
│  │ Builds      │  │ Setup       │  │ Services    │  BORDER  │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├──────────────────────────────────────────────────────────────┤
│              Compare Services                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Website Builds] [Automation Setup] [Managed AI]       │ │
│  │ ─────────────────────────────────────────────────────  │ │
│  │ BEST FOR: ...                                          │ │
│  │ WHAT YOU GET: ...                                      │ │
│  │ TIMELINE: ...                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↑ BORDER                          │
├──────────────────────────────────────────────────────────────┤
│                    Dive Deeper                               │
│              (Accordion dropdowns)                           │
├──────────────────────────────────────────────────────────────┤
│              Ready to Start?                                 │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Get a Quote     │  │ Book a Strategy │                   │
│  │ [Request Quote] │  │ [Book a Call]   │                   │
│  └─────────────────┘  └─────────────────┘                   │
│           ↑ BORDER           ↑ BORDER                       │
├──────────────────────────────────────────────────────────────┤
│              What to Expect                                  │
│  (icon) Clear Communication  (icon) Quality Work            │
│  (icon) Fair Pricing         (icon) Ongoing Support         │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Persona cards have consistent thin borders
2. ✓ Compare Services table has border
3. ✓ Ready to Start cards have borders
4. ⚠️ "What to Expect" section has NO container border (inconsistent with other pages)

---

### 3. PRICING (/pricing)
**Screenshot:** `pricing-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████████████   │
│  ██  Not sure what you need?                           ██   │
│  ██  [Book a Free Consultation]                        ██   │
│  ████████████████████████████████████████████████████████   │
├──────────────────────────────────────────────────────────────┤
│              Simple Pricing                                  │
│         [Enter email to get started]                         │
├──────────────────────────────────────────────────────────────┤
│  WEBSITES                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Launch Site     │  │ Growth Site     │  "Most Popular"  │
│  │ $500            │  │ $1,200          │                   │
│  │ • 3-5 pages     │  │ • 5-8 pages     │                   │
│  │ [Pay $250...]   │  │ [Pay $600...]   │                   │
│  └─────────────────┘  └─────────────────┘                   │
│          ↑ BORDER           ↑ BORDER                        │
├──────────────────────────────────────────────────────────────┤
│  AUTOMATION & AI                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Automation      │  │ Managed AI      │                   │
│  │ $150/workflow   │  │ $500/month      │                   │
│  │ [Book a Call]   │  │ [Book a Call]   │                   │
│  └─────────────────┘  └─────────────────┘                   │
│     ↑ COLORED BG        ↑ COLORED BG                        │
├──────────────────────────────────────────────────────────────┤
│  NEED SOMETHING CUSTOM?                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Additional│ │Blog Setup│ │File Form │ │Calendar │        │
│  │Page $100 │ │$300      │ │$150      │ │$200     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│       ↑ THIN BORDERS (dashed style)                         │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Website pricing cards have borders
2. ⚠️ Automation cards have colored background but different border treatment
3. ⚠️ Add-on items have DASHED borders (different from rest of site)

---

### 4. HOW IT WORKS (/how-it-works)
**Screenshot:** `how-it-works-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│           How We Work Together                               │
│  (Human+AI)  (Clear Updates)  (No Surprises)                │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ① Tell Us What You Need                                │ │
│  │    Fill out our simple form...                         │ │
│  │    [Start Here]                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                      ↑ THICK BORDER ⚠️                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │② Get a   │  │③ We      │  │④ You     │                   │
│  │  Quote   │  │  Build   │  │  Launch  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│       ↑ THIN        ↑ THIN       ↑ THIN                     │
├──────────────────────────────────────────────────────────────┤
│  Typical Timeline (text section)                             │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Questions about the process?                          ║ │
│  ║  [Book a Quick Chat]  [Read the FAQ]                   ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ THICK BORDER ⚠️                       │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Ready to Start?                                       ║ │
│  ║  [Get a Quote] [View Services] [See Pricing]           ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ THICK BORDER ⚠️                       │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ⚠️ Step 1 card has THICK border (inconsistent)
2. ✓ Steps 2-4 have thin borders
3. ⚠️ "Questions" section has THICK border
4. ⚠️ "Ready to Start" section has THICK border
5. ⚠️ This page has the MOST border inconsistencies

---

### 5. ABOUT (/about)
**Screenshot:** `about-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│           About the Founder                                  │
│           The person behind Need This Done                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Hey, I'm Abe                                               │
│  (Bio text...)                                              │
│                                                              │
│  ════════════════════════════════════════                   │
│  Beyond the Code (highlighted section)                       │
│  ════════════════════════════════════════                   │
│       ↑ YELLOW/GOLD BACKGROUND ACCENT                       │
│                                                              │
│  How I Work                                                  │
│  • Clear communication...                                   │
│  • Reliable follow-through...                               │
│  • Calm under pressure...                                   │
│                                                              │
│  How I Use AI                                               │
│  (text...)                                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Want to Know More?                                    ║ │
│  ║  [View Full Resume] [See What I Build] [Start Project] ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ BORDER (light)                        │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Mostly text-based, minimal cards
2. ✓ CTA section has subtle border
3. ⚠️ "Beyond the Code" uses background accent instead of border (intentional differentiation?)

---

### 6. FAQ (/faq)
**Screenshot:** `faq-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│        Frequently Asked Questions                            │
│        Your questions, answered.                             │
├──────────────────────────────────────────────────────────────┤
│  ┌─ ① ────────────────────────────────────────────────────┐ │
│  │  What do you build?                                    │ │
│  │  (answer text...)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│       ↑ LEFT ACCENT BORDER (teal)                           │
│  ┌─ ② ────────────────────────────────────────────────────┐ │
│  │  How much does it cost?                                │ │
│  └────────────────────────────────────────────────────────┘ │
│       ↑ LEFT ACCENT BORDER (green)                          │
│  ┌─ ③ ────────────────────────────────────────────────────┐ │
│  │  How long does it take?                                │ │
│  └────────────────────────────────────────────────────────┘ │
│       ↑ LEFT ACCENT BORDER (blue)                           │
│  ... (more questions with colored left borders)             │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Still Have Questions?                                 ║ │
│  ║  [Book a Call]                                         ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ BORDER                                │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ FAQ items use LEFT ACCENT BORDER style (intentional design choice)
2. ✓ Different colors indicate different categories
3. ✓ "Still Have Questions" CTA has consistent border
4. ✓ This page is consistent within itself

---

### 7. CONTACT (/contact)
**Screenshot:** `contact-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████████████   │
│  ██  Let's Build Something Together                    ██   │
│  ██                                                    ██   │
│  ██  ┌──────────┐ ┌──────────┐ ┌──────────┐           ██   │
│  ██  │Quick Chat│ │Strategy  │ │Deep Dive │           ██   │
│  ██  │ 15 min   │ │ 30 min   │ │ 60 min   │           ██   │
│  ██  └──────────┘ └──────────┘ └──────────┘           ██   │
│  ████████████████████████████████████████████████████████   │
│              ↑ CARDS ON DARK BACKGROUND                     │
├──────────────────────────────────────────────────────────────┤
│           Tell us about your project                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Your name          │  Email address                   │ │
│  │  Company            │  What interests you?             │ │
│  │  What's on your mind?                                  │ │
│  │  Attachments                                           │ │
│  │         [Send Message]                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                      ↑ NO VISIBLE BORDER (form area)        │
├──────────────────────────────────────────────────────────────┤
│  Prefer a different way to connect?                          │
│  [View Pricing] [Browse Services]                            │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Dark hero section has internal cards
2. ⚠️ Form section has no container border (inconsistent with other pages)
3. ✓ Overall clean design

---

### 8. BLOG (/blog)
**Screenshot:** `blog-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│                      Blog                                    │
│    Insights on websites, automation, and AI                  │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [web-development]                                     │ │
│  │  JQuery: Understanding the Library That Shaped...      │ │
│  │                                                        │ │
│  │  By Abe Reyes • January 1, 2026                        │ │
│  │  #javascript  #jquery  #web-history                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                      ↑ THIN BORDER                           │
├──────────────────────────────────────────────────────────────┤
│  (more blog cards would go here)                             │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Blog cards have thin, consistent borders
2. ✓ Clean, minimal design

---

### 9. GET STARTED (/get-started)
**Screenshot:** `get-started-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│           Let's Build Something                              │
│    Two ways to get started. Pick what works for you.         │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ [Free]              │  │ [Paid]              │           │
│  │ Get a Quote         │  │ Strategy Call       │           │
│  │ • Response in 2 days│  │ • 30-minute session │           │
│  │ [Request a Quote]   │  │ [Book a Call]       │           │
│  └─────────────────────┘  └─────────────────────┘           │
│         ↑ BORDER               ↑ BORDER                     │
├──────────────────────────────────────────────────────────────┤
│  Already Have a Quote?                                       │
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Let's Begin Your Project                              ║ │
│  ║  Quote Reference Number: [input]                       ║ │
│  ║  Email Address: [input]                                ║ │
│  ║  [Authorize & Pay Deposit]                             ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ BORDER                                │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Option cards have consistent borders
2. ✓ Form section has border
3. ✓ Good consistency on this page

---

### 10. BUILD (/build)
**Screenshot:** `build-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│              Build Your Site                                 │
│  [Packages]  [Build Your Own]                                │
│         [Enter email to get started]                         │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Launch Site         │  │ Growth Site         │           │
│  │ $500                │  │ $1,200   "Most Pop" │           │
│  │ • 3-5 pages         │  │ • 5-8 pages         │           │
│  │ [Pay $250 Deposit]  │  │ [Pay $600 Deposit]  │           │
│  └─────────────────────┘  └─────────────────────┘           │
│         ↑ BORDER               ↑ BORDER                     │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Pricing cards have consistent borders
2. ✓ Clean, focused page

---

### 11. SHOP (/shop)
**Screenshot:** `shop-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│              Simple Pricing                                  │
│    Pick a package or build exactly what you need.            │
├──────────────────────────────────────────────────────────────┤
│  PACKAGES                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Launch Site         │  │ Growth Site         │           │
│  │ $500 one-time       │  │ $1,200 one-time     │           │
│  │ [Get Started]       │  │ [Get Started]       │           │
│  └─────────────────────┘  └─────────────────────┘           │
│         ↑ BORDER               ↑ BORDER                     │
├──────────────────────────────────────────────────────────────┤
│  ADD-ONS                                                     │
│  Additional Page ............................ $100           │
│  Contact Form with File Upload .............. $150           │
│  Calendar Booking ........................... $200           │
│  Blog Setup ................................. $300           │
│  Payment Integration ........................ $400           │
│  CMS Integration ............................ $500           │
│         ↑ NO BORDERS (list style)                           │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Want something custom?                                ║ │
│  ║  [Build Your Own]                                      ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                      ↑ DARK BACKGROUND SECTION               │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Package cards have borders
2. ⚠️ Add-ons section uses list style (no individual borders) - intentional?
3. ✓ CTA section is dark (no border needed)

---

### 12. PRIVACY (/privacy)
**Screenshot:** `privacy-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│              Privacy Policy                                  │
│    How we collect, use, and protect your information.        │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  Quick Summary                                         ║ │
│  ║  • We only collect what we need                        ║ │
│  ║  • We never sell your data                             ║ │
│  ║  • You can request deletion                            ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│         ↑ BLUE LEFT ACCENT + LIGHT BG                       │
├──────────────────────────────────────────────────────────────┤
│  1. Information We Collect                                   │
│  (text...)                                                  │
│  2. How We Use Your Information                              │
│  (text...)                                                  │
│  ... etc                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Summary box has left accent border (consistent with FAQ style)
2. ✓ Clean text-based layout

---

### 13. TERMS (/terms)
**Screenshot:** `terms-full.png`

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────────────────────────────────────────────────────────┤
│              Terms of Service                                │
│    The terms and conditions that govern your use.            │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  The Short Version                                     ║ │
│  ║  • Be respectful and use services lawfully             ║ │
│  ║  • Pay for services you book                           ║ │
│  ║  • We'll do our best to help                           ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│         ↑ BLUE LEFT ACCENT + LIGHT BG                       │
├──────────────────────────────────────────────────────────────┤
│  1. Acceptance of Terms                                      │
│  (text...)                                                  │
│  2. Our Services                                             │
│  (text...)                                                  │
│  ... etc                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Border Issues Found:**
1. ✓ Summary box consistent with Privacy page
2. ✓ Clean text-based layout

---

## Summary of Border Inconsistencies

### Critical Issues (Fix First)

| Page | Section | Issue |
|------|---------|-------|
| Homepage | "How It Works" | Thicker border than "Transparent Pricing" |
| How It Works | Step 1, Questions, Ready to Start | All have thicker borders than other pages |

### Medium Issues

| Page | Section | Issue |
|------|---------|-------|
| Pricing | Add-on items | Use dashed borders (different style) |
| Services | "What to Expect" | No container border |
| Contact | Form section | No container border |

### Intentional Variations (Keep)

| Pattern | Where Used | Notes |
|---------|------------|-------|
| Left accent borders | FAQ items, Privacy/Terms summaries | Color-coded by category |
| No borders (dark bg) | CTA sections | Contrast provides separation |
| Colored background | Automation/AI cards on Pricing | Visual differentiation |

---

## Recommended Border Standard

```css
/* Standard section container */
.section-card {
  border: 1px solid rgb(229 231 235); /* gray-200 */
  border-radius: 1rem; /* rounded-2xl */
}

/* Standard inner card */
.inner-card {
  border: 1px solid rgb(229 231 235); /* gray-200 */
  border-radius: 0.75rem; /* rounded-xl */
}

/* Left accent (for FAQ-style items) */
.accent-card {
  border-left: 4px solid var(--accent-color);
  background: rgb(249 250 251); /* gray-50 */
}
```

---

## Next Steps

1. [ ] Audit all components using borders in `app/components/`
2. [ ] Create shared border utility classes
3. [ ] Update "How It Works" page sections to use thin borders
4. [ ] Update Homepage "How It Works" section border
5. [ ] Review and standardize Pricing page add-on borders
6. [ ] Add container borders to Contact form and Services "What to Expect"
