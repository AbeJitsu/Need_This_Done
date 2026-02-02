# Homepage Redesign: "Cinematic Confidence"

**Objective:** Transform the homepage into a modern, high-end design with bold typography, smooth interactions, and asymmetric layouts that makes visitors say "wow, these people are serious."

**Approach:** Framer Motion-driven scroll animations, oversized headlines, mouse-reactive gradients, magnetic CTAs, and scroll-linked parallax effects. All high-performance (no Three.js, minimal dependencies).

---

## Visual Direction

### Color Progression (BJJ Belt System - Unchanged)
- **Green (Emerald)** → Primary actions, success
- **Blue** → Secondary, trust
- **Purple** → Tertiary, creativity
- **Gold** → Warm accents
- **Gray** → Neutral, supporting

### Core Aesthetic
- **Typography** — Oversized headlines (6xl-8xl on desktop, 4xl-5xl on mobile)
- **Whitespace** — Generous margins and padding (premium feel)
- **Effects** — Soft gradient orbs, parallax depth, magnetic interactions
- **Animations** — Scroll-linked reveals, micro-interactions, smooth transitions

---

## Section Breakdown

### 1. HERO — Full-Viewport Statement
**Purpose:** Immediately convey confidence and capability.

**Layout:**
- Full viewport height (100vh minimum)
- Centered headline + supporting text
- Animated gradient mesh background (mouse-reactive)
- Magnetic CTA button
- Scroll indicator (parallax fade)

**Content:**
```
Headline: "We build what you need done."
Subheading: [Rotating keywords: "websites" / "automations" / "AI tools"]
CTA Button: "Start Your Project" (green, magnetic)
```

**Animations:**
- **Gradient mesh** — 3-4 soft orbs that drift subtly and shift slightly toward cursor (5-10% movement, not following directly). Uses `useMotionValue` + `useTransform` for GPU acceleration.
- **Headline reveal** — Words clip-mask in from below, staggered 150ms apart
- **Rotating keyword** — Color-coded to BJJ progression (green→blue→purple), vertical slide transition every 3s
- **CTA button** — Scales on hover, glowing shadow in button color, pulls slightly toward cursor within ~100px radius (magnetic effect)
- **Scroll indicator** — Fades out via parallax as user scrolls down (scroll-linked opacity via `useScroll`)

**Mobile adaptations:**
- Headline scales to 4xl-5xl
- Gradient orbs repositioned (smaller, less aggressive positioning)
- Touch-friendly: no cursor-reactive effects, simpler animations

---

### 2. TECH STACK BAR — Built With Trust
**Purpose:** Show what you're built on without being salesy.

**Layout:**
- Thin horizontal bar (py-6, sm:py-8)
- Gray-100 background with subtle divider lines above/below
- Logo grid: Claude Code, Next.js, Vercel, Railway, Supabase

**Content:**
- 5 logos in a row (desktop) or wrapped 2-3 per row (mobile)
- No text, just logos (trust through association with quality tools)

**Animations:**
- Logos fade in as they come into view (0.5s easing, simple FadeIn component)
- Subtle scale on hover (scale-105)
- Lucide icons: Code2 (Claude), Package (Next.js), Zap (Vercel), Database (Railway), Cloud (Supabase)

**Mobile adaptations:**
- Stack into 2-3 rows
- Smaller logo sizes

---

### 3. SERVICES — Staggered, Asymmetric Reveal
**Purpose:** Showcase offerings with visual hierarchy (Website Builds gets emphasis).

**Layout:**
- Asymmetric grid (desktop): Left card spans 2 rows, right side has 3 smaller cards
- Stacked single column (mobile)

**Cards:**
```
Position 1 (Large, Left):  Website Builds (Emerald)
Position 2 (Top Right):    Automation Setup (Blue)
Position 3 (Middle Right): Managed AI (Purple)
Position 4 (Bottom Right): Custom Tools (Gold)
```

**Card Design:**
- Rounded corners (rounded-2xl)
- Gradient background: `from-{color}-50 via-white to-{color}-50/30`
- Border: `border-2 border-{color}-200`
- Icon (Lucide React) with color matching
- Title, description, "View Pricing" CTA
- Hover effect: `-translate-y-2` (lift), `shadow-2xl`, colored glow

**Animations:**
- **Scroll-linked stagger** (desktop only):
  - Card 1 (left): slides from left (-100 → 0)
  - Card 2 (top-right): slides from top (-100 → 0)
  - Card 3 (middle-right): slides from right (+100 → 0)
  - Card 4 (bottom-right): slides from bottom (+100 → 0)
  - Stagger delay: 100ms between cards
  - Uses `whileInView` + `viewport` for scroll-triggered animation
- Icon scale on hover: `scale-110`

**Mobile adaptations:**
- Single column, full width
- All cards equal height
- Simplified animations (fade-in only)

---

### 4. PROCESS — Scroll-Snap Horizontal Timeline
**Purpose:** De-risk the buyer's journey by showing transparency and clear steps.

**Layout (Desktop):**
- Horizontal scroll-snap carousel with prev/next button controls
  - Buttons positioned left/right outside carousel (or inside with overlay)
  - Buttons use green (primary progression color)
  - Arrow icons (ChevronLeft, ChevronRight from Lucide)
- 4 cards: Discovery → Planning → Build → Launch
- Color-coded left border (green→blue→purple→gold)
- Below: Trust bar with 3 columns (icons + text)

**Layout (Mobile):**
- Vertical stack (no carousel)
- Each card full width, normal scrolling
- Trust bar remains 3-column but responsive

**Card Content:**
```
01. Discovery (Green)
    "We listen, ask questions, understand your goals"
    Timeline: 1 week

02. Planning (Blue)
    "Map every step, align on goals"
    Timeline: 1 week

03. Build (Purple)
    "Hands-on building, weekly check-ins"
    Timeline: 2-4 weeks

04. Launch (Gold)
    "We deploy, train, you own it"
    Timeline: 1 week
```

**Trust Bar:**
- 3 columns: 🤝 Human + AI | 📊 Transparent Updates | ✅ No Surprises
- Icons scale in from center as section comes into view
- Uses `StaggerContainer` + `StaggerItem`

**Animations:**
- Cards slide in from different directions as they enter viewport (scroll-linked)
- Trust bar icons counter-reveal with scale-in effect
- Smooth scroll-snap between steps (native CSS `scroll-snap-type: x mandatory`)

**Mobile adaptations:**
- Remove scroll-snap, use normal vertical scroll
- Trust bar stacks into single column or 2 rows (depends on space)

---

### 5. FINAL CTA — Cinematic Close
**Purpose:** Last impression; make it easy to take next step.

**Layout:**
- Full-viewport height (100vh minimum)
- Centered, vertically aligned
- Parallax gradient mesh background (purple/gold tones)
- Headline + tagline + dual CTAs

**Content:**
```
Headline: "Let's build something great."
Tagline: "Build without limits."
Primary CTA: "Book a Free Call" (Purple button, magnetic)
Secondary CTA: "Chat with us" (Link with underline animation)
```

**Animations:**
- **Gradient mesh** — Similar to hero, responds to scroll position (parallax depth). Orbs fade as user scrolls past section.
- **Headline reveal** — Clips in word-by-word from below, slight stagger
- **Tagline & buttons** — Fade in with delay (spring animation on buttons)
- **Magnetic hover** — Primary button pulls toward cursor, glowing shadow
- **Sticky on mobile** — Button stays visible at bottom as section scrolls into/past viewport

**Mobile adaptations:**
- Headline scales to 4xl-5xl
- Tagline smaller
- Button fixed at bottom during section scroll (sticky behavior)

---

## Technical Implementation

### Animations Library
- **Framer Motion** (already in project)
  - `useScroll()` for parallax scroll-linking
  - `useMotionValue()` + `useTransform()` for cursor-reactive gradients
  - `whileInView` for scroll-triggered reveals (duration: 0.5s)
  - `whileHover` for magnetic button effects (duration: 0.5s)
  - `AnimatePresence` for mount/unmount transitions
- **Standard timing:** 0.5s easing (balanced between snappy and cinematic)

### Components to Build/Modify
1. **Hero.tsx** (new)
   - Gradient mesh with cursor tracking
   - Rotating headline with clip-path reveal
   - Rotating keyword carousel
   - Magnetic CTA button

2. **TechStackBar.tsx** (new)
   - Logo grid with fade-in animation
   - Responsive wrapping (2-3 per row on mobile)

3. **Services.tsx** (modify)
   - Asymmetric grid layout (CSS Grid with specific placement)
   - Scroll-linked stagger animations
   - Hover lift effects
   - Keep existing inline editing

4. **Process.tsx** (modify)
   - Horizontal scroll-snap carousel (desktop)
   - Vertical stack (mobile)
   - Trust bar with animated icons
   - Keep existing inline editing

5. **FinalCTA.tsx** (new)
   - Parallax gradient mesh
   - Sticky button on mobile
   - Dual CTAs with hover animations

6. **MagneticButton.tsx** (new utility)
   - Reusable component for cursor-tracking hover effect
   - Configurable pull radius (default 100px)
   - Glow shadow in accent color

### Utility Updates
- **motion/CursorReactiveGradient.tsx** (new)
  - Reusable component for mouse-tracking gradient mesh
  - Positions orbs and applies transforms based on cursor position
  - Used in Hero and FinalCTA sections

### Performance Considerations
- All animations run on GPU (transform + opacity, no layout shifts)
- Scroll listeners debounced/throttled
- Gradient orbs use `willChange: 'transform'` for optimization
- No Three.js or heavy libraries
- Lighthouse: target 90+ (performance)

### Responsive Breakpoints
- **Mobile:** sm (640px) — Single column, simplified animations
- **Tablet:** md (768px) — 2-column layouts where applicable
- **Desktop:** lg (1024px) — Full asymmetric grids, carousels active

---

## File Structure Changes

**Current:**
```
app/components/home/
  ├─ HomePageClient.tsx    [main page]
  ├─ ServiceIcons.tsx       [icon mappings]
```

**After redesign:**
```
app/components/home/
  ├─ HomePageClient.tsx     [main page, refactored into sections]
  ├─ sections/
  │  ├─ Hero.tsx            [new]
  │  ├─ TechStackBar.tsx     [new]
  │  ├─ Services.tsx         [modified]
  │  ├─ Process.tsx          [modified]
  │  ├─ FinalCTA.tsx         [new]
  ├─ components/
  │  ├─ ServiceIcons.tsx     [unchanged]
  │  ├─ MagneticButton.tsx   [new]
  │  ├─ CursorReactiveGradient.tsx [new]
```

---

## Implementation Phases

### Phase 1: Infrastructure (2-3 hours)
- Create new motion utilities (CursorReactiveGradient, MagneticButton)
- Set up responsive breakpoint logic
- Create section component scaffolds

### Phase 2: Hero Section (2-3 hours)
- Gradient mesh with cursor tracking
- Headline reveal animation
- Rotating keyword carousel
- Scroll indicator
- Mobile adaptation

### Phase 3: Services & TechStackBar (2 hours)
- Refactor Services into asymmetric grid
- Add scroll-linked stagger animations
- Create TechStackBar component
- Mobile responsive

### Phase 4: Process Section (2-3 hours)
- Horizontal scroll-snap carousel (desktop)
- Vertical stack (mobile)
- Trust bar with animated icons
- Animation refinement

### Phase 5: Final CTA (1-2 hours)
- Parallax gradient mesh
- Sticky button on mobile
- Dual CTAs with interactions
- Final polish

### Phase 6: Testing & Refinement (2-3 hours)
- E2E tests for interactive elements
- Accessibility audit (a11y)
- Lighthouse performance check
- Cross-browser testing (Safari, Firefox)

**Total estimated time:** 11-16 hours of focused work

---

## Success Criteria

✅ **Visual Impact**
- Oversized typography command attention (headlines 6xl+)
- Asymmetric layouts break predictable patterns
- Gradient orbs and parallax create depth perception

✅ **Performance**
- Lighthouse: 90+ (performance score)
- First Contentful Paint: <1.5s
- Smooth 60fps animations on modern devices
- Mobile: Fast enough to feel responsive

✅ **Readability & Accessibility (WCAG AA Compliant)**
- **All text contrast ratios: minimum 5:1** (WCAG AA exceeds 4.5:1 minimum)
- **Text colors:** Gray-600+ for body, Gray-700+ for small text, color-specific -600 shades for accent text
- **Link underlines:** Always visible, not color-dependent
- **Focus indicators:** 2px ring with offset on all interactive elements
- **Reduced motion:** All animations respect `prefers-reduced-motion` media query
- Line height and spacing support readability (1.6x minimum for body text)
- Mobile text sizes scale appropriately (rem-based, responsive)
- Button sizes: minimum 44x44px touch targets (mobile accessible)

✅ **Interactivity**
- Hover effects feel responsive, not sluggish
- Magnetic buttons pull smoothly toward cursor
- Scroll animations match scroll speed (no jank)
- Touch-friendly on mobile (no hover-required interactions)

✅ **Code Quality**
- Zero ESLint warnings
- TypeScript strict mode
- All tests passing (E2E, a11y, unit)
- Inline editing integration maintained

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Scroll animations cause jank on low-end devices | Use `will-change`, test on 3G throttle, simplify on mobile |
| Gradient orbs are hard to see on light backgrounds | Ensure sufficient color saturation and blur for visibility |
| Magnetic button feels unresponsive | Adjust cursor tracking sensitivity and spring config |
| Carousel scroll-snap doesn't work well on mobile | Fall back to vertical stack, standard scrolling |
| Accessibility regression from heavy animations | Test with screen readers, keyboard navigation, reduced-motion support |

---

## Inline Editing Integration

All content sections remain editable via existing InlineEditContext:
- Hero headline, keyword list
- Service card titles, descriptions
- Process step titles, descriptions, timelines
- Final CTA headline, tagline

No changes to editing workflow or API integration required.

---

## Design System Compliance

- ✅ Color system: Uses existing `accentColors`, `titleColors` from `/lib/colors.ts`
- ✅ Typography: Maintains Inter font family, extends scale to 6xl-8xl
- ✅ Spacing: Follows existing Tailwind scale (no new arbitrary values)
- ✅ Accessibility: All text meets WCAG AA contrast, reduces motion respected
- ✅ Components: Uses existing Button, FadeIn, StaggerContainer, RevealSection patterns
- ✅ Dark mode: Not enabled (light mode only, per project guidelines)

---

## Implementation Decisions

✅ **Tech stack bar logos** — Use Lucide React icons (Code2, Package, Zap, Database, Cloud)
✅ **Final CTA tagline** — "Build without limits."
✅ **Scroll-snap carousel** — Include prev/next button controls (positioned left/right of carousel)
✅ **Animation speed** — 0.5s (balanced between snappy and cinematic)
✅ **Color theme for Process cards** — Green → Blue → Purple → Gold (BJJ progression maintained)
✅ **Accessibility** — WCAG AA compliant on all text (5:1 contrast minimum)

---

## Next Steps (If Approved)

1. Set up git worktree for isolated development
2. Build Phase 1 (motion utilities infrastructure)
3. Iteratively build sections (Phases 2-5)
4. Comprehensive testing (Phase 6)
5. Merge to `main` after approval
