# Hero Section Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix hero section size (too large), improve gradient visibility, and make scroll indicator functional

**Architecture:** Scale down typography to 5xl-7xl range, increase gradient opacity/size, add smooth scroll behavior with scroll-margin-top offset for navigation header

**Tech Stack:** React, TailwindCSS, Next.js

---

## Issues Identified

1. **Title too large**: 9xl (128px) on desktop is overwhelming - can barely see page content
2. **Gradients too subtle**: Low opacity (60%/50%) + positioned too far off-screen = invisible
3. **Scroll indicator non-functional**: No click handler, just decorative

## Task 1: Reduce Hero Title Scale

**Files:**
- Modify: `app/components/home/HomePageClient.tsx:58`

**Step 1: Scale down title sizes**

Change from overwhelming 9xl to more balanced scale:

```tsx
<h1 className="text-5xl sm:text-6xl md:text-7xl font-manrope font-extrabold tracking-tight mb-6 animate-scale-in leading-[1.1]">
```

**Before:** `text-6xl sm:text-7xl md:text-8xl lg:text-9xl`
**After:** `text-5xl sm:text-6xl md:text-7xl`

**Rationale:**
- Mobile: 60px (5xl) - fits screen, still bold
- Tablet: 72px (6xl) - balanced
- Desktop: 96px (7xl) - commanding without overwhelming

**Step 2: Test visual balance**

Run: Open http://localhost:3000
Expected: Title is bold but doesn't dominate entire viewport

**Step 3: Commit**

```bash
git add app/components/home/HomePageClient.tsx
git commit -m "fix(hero): reduce title scale from 9xl to 7xl max

- Mobile: 5xl (60px) fits screen better
- Desktop: 7xl (96px) balanced, not overwhelming
- Maintains bold Manrope ExtraBold impact"
```

---

## Task 2: Enhance Gradient Visibility

**Files:**
- Modify: `app/components/home/HomePageClient.tsx:51-53`

**Step 1: Increase gradient opacity and bring closer to viewport**

Current gradients are too far off-screen and too subtle:

```tsx
{/* Background gradients - diagonal emerald slash + purple glow */}
<div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200 to-emerald-100 blur-3xl opacity-70" />
<div className="absolute -bottom-16 -right-16 w-[500px] h-[500px] bg-gradient-to-tl from-purple-200 to-purple-100 blur-3xl opacity-60" />
```

**Changes:**
- Top gradient position: `-top-32 -left-32` → `-top-20 -left-20` (closer)
- Top gradient size: `w-96 h-96` (384px) → `w-[600px] h-[600px]` (larger)
- Top gradient color: `from-emerald-100 to-emerald-50` → `from-emerald-200 to-emerald-100` (more saturated)
- Top gradient opacity: `opacity-60` → `opacity-70` (more visible)
- Bottom gradient position: `-bottom-20 -right-20` → `-bottom-16 -right-16` (closer)
- Bottom gradient size: `w-80 h-80` (320px) → `w-[500px] h-[500px]` (larger)
- Bottom gradient color: `from-purple-100 to-purple-50` → `from-purple-200 to-purple-100` (more saturated)
- Bottom gradient opacity: `opacity-50` → `opacity-60` (more visible)
- Remove: `rotate-45` on emerald gradient (unnecessary, complicates positioning)

**Step 2: Test gradient visibility**

Run: Open http://localhost:3000
Expected:
- Emerald glow visible in top-left behind title
- Purple glow visible in bottom-right
- Creates atmospheric depth without being distracting

**Step 3: Commit**

```bash
git add app/components/home/HomePageClient.tsx
git commit -m "fix(hero): enhance gradient visibility

- Increase gradient sizes (600px/500px from 384px/320px)
- Move gradients closer to viewport (-20/-16 from -32/-20)
- Boost opacity (70%/60% from 60%/50%)
- Use more saturated colors (200/100 from 100/50)
- Remove rotate-45 for cleaner positioning"
```

---

## Task 3: Make Scroll Indicator Functional

**Files:**
- Modify: `app/components/home/HomePageClient.tsx:76-80`

**Step 1: Add smooth scroll click handler**

The scroll indicator currently has no functionality. Add smooth scroll to services section:

```tsx
{/* Scroll indicator - functional smooth scroll */}
<button
  onClick={() => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }}
  className="mt-12 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer animate-slide-up animate-delay-300"
  aria-label="Scroll to services section"
>
  <span>Scroll to explore</span>
  <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>
```

**Changes:**
- Wrap in `<button>` instead of `<div>`
- Add `onClick` handler with smooth scroll
- Target: `#services-section` (need to add this ID)
- Add hover state: `hover:text-gray-700`
- Add `cursor-pointer` for visual affordance
- Add `aria-label` for accessibility

**Step 2: Add target ID to services section**

In the same file around line 94 (services section start), add ID:

```tsx
{/* Services Section - Asymmetric Hero Card Layout */}
<EditableSection sectionKey="services" label="Services">
<div id="services-section" className="mb-24 scroll-mt-24">
```

**Changes:**
- Add `id="services-section"` for scroll target
- Add `scroll-mt-24` (96px offset) to account for fixed navigation header

**Step 3: Test scroll functionality**

Run: Open http://localhost:3000

Test steps:
1. Click "Scroll to explore" button
2. Verify smooth scroll animation occurs
3. Verify services section appears at top of viewport (below nav)
4. Verify hover state works (text darkens)

Expected: Smooth scroll to services section with proper header offset

**Step 4: Commit**

```bash
git add app/components/home/HomePageClient.tsx
git commit -m "feat(hero): make scroll indicator functional

- Add click handler with smooth scroll to services
- Convert div to button for semantics
- Add hover state and cursor pointer
- Add target ID and scroll-margin-top offset
- Include aria-label for accessibility"
```

---

## Task 4: Final Visual Verification

**Files:**
- None (testing only)

**Step 1: Visual regression check**

Run: Open http://localhost:3000

Verify:
1. ✅ Hero title is readable and balanced (not overwhelming)
2. ✅ Emerald gradient visible top-left
3. ✅ Purple gradient visible bottom-right
4. ✅ Scroll indicator is clickable and works
5. ✅ Services section appears after smooth scroll with correct offset

**Step 2: Mobile responsive check**

Run: Open http://localhost:3000 + resize to 375px width

Verify:
1. ✅ Title scales to 5xl (60px) - fits screen
2. ✅ Gradients still visible on small screens
3. ✅ Scroll indicator works on touch devices
4. ✅ No horizontal scroll

**Step 3: Accessibility check**

Run: Test with keyboard navigation

Verify:
1. ✅ Tab to scroll indicator button
2. ✅ Press Enter/Space to trigger scroll
3. ✅ Focus ring visible on button

**Step 4: Document completion**

All issues resolved:
- ❌ Title too large → ✅ Scaled to balanced 7xl max
- ❌ Gradients invisible → ✅ Larger, closer, more opaque
- ❌ Scroll indicator broken → ✅ Functional with smooth scroll

---

## Expected Results

**Before:**
- Hero dominates entire viewport (128px title)
- Background gradients barely visible
- Scroll indicator decorative only

**After:**
- Hero is bold but balanced (96px max title)
- Background gradients provide atmospheric depth
- Scroll indicator smoothly navigates to services section

## Testing Commands

```bash
# Visual test
open http://localhost:3000

# Mobile test
# (Use browser DevTools responsive mode at 375px width)

# Keyboard test
# Tab to scroll button, press Enter
```

## Success Criteria

- [ ] Hero title is 7xl max (96px) on desktop
- [ ] Background gradients clearly visible
- [ ] Scroll indicator button is functional
- [ ] Smooth scroll animation works
- [ ] Services section has proper header offset
- [ ] Mobile responsive (5xl = 60px title fits)
- [ ] Keyboard accessible (Tab + Enter works)
- [ ] No visual regressions in other sections
