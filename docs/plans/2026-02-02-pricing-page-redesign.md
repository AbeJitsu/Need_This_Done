# Pricing Page Redesign Evaluation

**Goal:** Bring the pricing page up to the same bold, editorial standard as the homepage.

**Current file:** `app/components/pricing/UnifiedPricingPage.tsx`

---

## Section 1: Hero (Lines 288-371)

**What it does:** Welcome + quick-nav buttons to jump to sections

**Current state:**
- Pastel gradient background (emerald-200 → sky-50 → purple-200)
- Centered "Simple Pricing" heading (text-4xl to 6xl)
- 5 quick-nav buttons in a row: Websites, Automation, AI Agents, Custom, Have a Quote?
- Bouncing chevron scroll hint

**What's good:**
- Quick-nav buttons are smart UX — lets visitors jump to what they care about
- Clean hierarchy: headline → subtext → nav buttons

**What's weak:**
- Pastel gradient feels washed out — doesn't match the bold dark aesthetic of the homepage
- "Simple Pricing" is generic — doesn't convey confidence or brand personality
- Section headers throughout the page use centered text with gradient underlines — doesn't match the editorial left-aligned style from homepage
- Nav buttons are white cards with thin borders — look like default UI, not premium

**Redesign direction:**
- [ ] Bold editorial header (left-aligned, accent line + uppercase label)
- [ ] Stronger headline copy (more personality)
- [ ] Nav buttons styled as bold pills or dark chips matching brand aesthetic
- [ ] Background treatment: either dark hero or the homepage gradient style

---

## Section 2: Website Packages (Lines 373-471)

**What it does:** Two pricing tiers — Launch Site ($500) and Growth Site ($1200)

**Current state:**
- Centered section header with gradient underline
- 2-column grid, white cards with thin borders
- "Most Popular" badge on Growth Site (blue gradient)
- Feature lists with colored checkmarks
- CTA: "Start for $250" / "Start for $600" with deposit explanation

**What's good:**
- Clear pricing with deposit model explained
- Feature comparison is easy to scan
- Popular badge draws attention to recommended tier

**What's weak:**
- Cards are very pale/washed out — almost invisible borders, faded text
- The Launch Site card appears completely ghost-like (extremely low contrast text)
- No visual hierarchy between the two cards beyond the badge
- CTA buttons are muted green — barely visible
- Huge empty white space on the right when Growth Site card isn't visible
- Centered layout doesn't match editorial direction

**Redesign direction:**
- [ ] Bold dark cards matching homepage Services aesthetic
- [ ] Clear visual distinction: standard vs. recommended tier
- [ ] High-contrast text and visible CTAs
- [ ] Left-aligned editorial section header
- [ ] Consider making popular card larger or featured

---

## Section 3: Automation & AI (Lines 473-531)

**What it does:** Two service cards — Automation Setup ($150/workflow) and Managed AI ($500/month)

**Current state:**
- Centered header with gradient underline (purple → gold)
- 2-column grid, white cards with thin borders
- Icon badges (Zap, Bot) with colored backgrounds
- Purple "Book a Call" button and brown/gold "Book a Call" button
- Price display: large numbers with unit text

**What's good:**
- Clear pricing model (per-workflow vs monthly)
- Icons differentiate the two services
- BJJ color progression respected (purple, gold)

**What's weak:**
- Same washed-out white card problem as websites section
- Two identical "Book a Call" buttons side by side — feels repetitive
- Brown button color looks muddy, not premium gold
- Cards feel thin and generic — no personality
- No descriptive details beyond one-liner descriptions

**Redesign direction:**
- [ ] Bold dark cards (purple and gold/dark themes)
- [ ] Single "Book a Call" CTA or differentiated CTAs
- [ ] Richer descriptions or bullet points showing what's included
- [ ] Editorial section header

---

## Section 4: Build Your Own / Custom (Lines 533-652)

**What it does:** Selectable add-on checklist with running total and checkout

**Current state:**
- Centered header with gradient underline
- 6 add-ons in a list: Extra Page ($100), Blog ($300), File Uploads ($150), Booking ($200), Payments ($400), CMS ($500)
- Checkbox + icon + description + price per row
- Selected items get gold/purple highlight
- Floating total/checkout box appears when items selected

**What's good:**
- Interactive builder is great UX — empowers the customer
- Real-time total with deposit calculation
- Clear price per item
- AnimatePresence for smooth total reveal

**What's weak:**
- List feels plain — just rows of text with checkboxes
- Icons are gray and forgettable
- No visual grouping or categorization of add-ons
- The checkout summary box could be bolder
- Same centered header pattern

**Redesign direction:**
- [ ] Style add-ons as selectable cards/tiles instead of plain list rows
- [ ] Group by category or add visual interest (icon colors, hover states)
- [ ] Bold checkout summary (dark card, large price, prominent CTA)
- [ ] Editorial section header

---

## Section 5: Consultation CTA (Lines 654-692)

**What it does:** Catch-all for undecided visitors — book a free consultation

**Current state:**
- Light gradient card (emerald-50 → white → blue-50)
- Decorative gradient orbs (green and blue, blurred)
- "Not sure what you need?" heading
- Green "Book a Free Consultation" button with calendar icon
- "15, 30, or 45 minute sessions" helper text

**What's good:**
- Good placement after all pricing options
- Low-pressure copy ("no commitment required")
- Calendar icon on button adds clarity

**What's weak:**
- Pastel gradient with orbs — old pattern we're moving away from
- Feels like an afterthought, not a confident invitation
- Same visual language as homepage's old CTA (which we just redesigned to dark)

**Redesign direction:**
- [ ] Match the dark CTA style from homepage (slate → purple gradient)
- [ ] Two-column layout or bold centered treatment
- [ ] Stronger visual presence — this is the safety net for unsure visitors

---

## Section 6: Quote Authorization (Lines 694-922)

**What it does:** Form for customers who already received a quote to authorize and pay deposit

**Current state:**
- Dark slate-900 background (unique on this page — already bold)
- "Already Received a Quote?" heading in white
- White card form with Quote Reference + Email inputs
- Purple "Authorize Quote" button
- Success state with 4-step timeline (green → blue → purple → gold)
- Payment state with Stripe integration

**What's good:**
- Dark background already matches the bold direction
- Clear form with good helper text
- Success state timeline follows BJJ belt progression
- Security reassurance text
- Functional Stripe payment integration

**What's weak:**
- The dark section feels disconnected from the rest of the page (only dark section)
- Form card is plain white — could have more polish
- Transition from light sections to this dark section is abrupt

**Redesign direction:**
- [ ] Keep dark background — it already works
- [ ] Polish the form card (subtle border, better spacing)
- [ ] Smoother transition from consultation CTA to this section
- [ ] Once other sections get bold treatment, this will feel more cohesive

---

## Global Issues

| Issue | Where | Fix |
|-------|-------|-----|
| **Centered headers everywhere** | All sections | Switch to editorial left-aligned with accent line |
| **Washed-out cards** | Sections 2, 3, 4 | Bold dark cards matching homepage |
| **Pastel gradient backgrounds** | Hero, Consultation | Replace with bold treatments |
| **Inconsistent section spacing** | Throughout | Standardize with mb-24 between sections |
| **No visual rhythm** | Page feels flat | Alternate dark/light sections for contrast |
| **Generic copy** | "Simple Pricing" | More brand personality, confident tone |

## Recommended Redesign Order

1. **Hero** — Sets the tone, biggest visual impact
2. **Website Packages** — Most important revenue section
3. **Automation & AI** — Quick win, similar card pattern
4. **Build Your Own** — Interactive, needs careful UX thinking
5. **Consultation CTA** — Small section, fast redesign
6. **Quote Auth** — Already mostly good, polish pass only

## Design Principles (from homepage)

- Editorial headers: accent line + uppercase label + bold heading (left-aligned)
- Dark cards with colored gradients (emerald-800, slate-900, purple-700→900)
- BJJ belt color progression: green → blue → purple → gold
- High contrast text on dark backgrounds (white, colored-200 shades)
- Framer Motion: FadeIn, StaggerContainer for entrance animations
- WCAG AA compliance: 4.5:1 text, 3:1 borders minimum
