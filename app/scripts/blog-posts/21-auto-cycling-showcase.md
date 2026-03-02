---
slug: auto-cycling-showcases-phase-rotation-react
title: "Auto-Cycling Showcases: Phase Rotation with React"
excerpt: "How we built a content showcase that automatically cycles through device views — and the clock-sync trick that keeps multiple animations perfectly aligned."
category: tutorial
tags:
  - react
  - animation
  - framer-motion
  - showcase
status: published
source: original
author_name: Abe Reyes
meta_title: "Auto-Cycling Showcases: Phase Rotation with React"
meta_description: "Building an auto-cycling React showcase with synchronized phase rotation. Covers timer management, wall-clock sync, enter/exit animations, and reduced motion accessibility."
---

# Auto-Cycling Showcases: Phase Rotation with React

We had three device mockups — phone, tablet, and monitor — and a hero section that rotates through three brand keywords. The obvious approach was to let each device run its own rotation timer. Keyword changes every two seconds, same animation, simple interval.

It worked for about fifteen seconds before the drift became visible.

## The Drift Problem

JavaScript timers aren't precise. `setInterval` doesn't guarantee exact timing — it fires "approximately" every N milliseconds, with the actual delay depending on the event loop, garbage collection pauses, and browser tab throttling.

When you have one timer, this doesn't matter. Nobody notices if a rotation fires 12ms late. But when you have three iframes each running their own `setInterval`, the small inaccuracies compound. After a minute, one device might be a full phase ahead of another. Your carefully designed showcase where each device shows a different keyword turns into three devices occasionally showing the same one.

We needed the timers to stay synchronized without them communicating with each other.

## The Wall-Clock Trick

The solution was to derive state from the system clock instead of tracking it with a counter.

Instead of "increment the index every 2 seconds," each device asks: "Based on the current time, what phase should I be showing?"

```typescript
const CYCLE_MS = 2000;
const TOTAL_CYCLE = CYCLE_MS * keywords.length;

const update = () => {
  const now = Date.now();
  const elapsed = now % TOTAL_CYCLE;
  const baseIndex = Math.floor(elapsed / CYCLE_MS);
  setCurrentKeywordIndex((baseIndex + initialPhase) % keywords.length);
};
```

Every device calculates `baseIndex` from the same `Date.now()` value. Since they share the same clock, they always agree on the current phase. The `initialPhase` offset is what makes each device show a *different* keyword — device 0 shows phase 0, device 1 shows phase 1, device 2 shows phase 2.

No communication needed. No shared state. No synchronization protocol. Just math and a clock.

## Scheduling the Next Update

We still need to trigger re-renders at the right moments. A naive approach would use `setInterval(update, 100)` to check frequently. That works but wastes cycles — most of those checks won't result in a phase change.

Instead, we calculate exactly when the next transition will happen and schedule a timeout for that moment:

```typescript
const update = () => {
  const now = Date.now();
  const elapsed = now % TOTAL_CYCLE;
  const baseIndex = Math.floor(elapsed / CYCLE_MS);
  setCurrentKeywordIndex((baseIndex + initialPhase) % keywords.length);

  // Schedule next update at the exact transition boundary
  const msUntilNext = CYCLE_MS - (elapsed % CYCLE_MS);
  return setTimeout(update, msUntilNext + 50);
};
```

The `+ 50` buffer ensures we fire slightly *after* the boundary rather than slightly before. If we fire 1ms early, `Date.now()` still shows the old phase and nothing changes until the next timeout. Firing 50ms late is imperceptible to users but guarantees the phase has actually advanced.

This means we fire exactly three timeouts per full cycle (one per keyword), not fifty from a polling interval. Cleaner for performance, more precise in timing.

## The Suspense Boundary

There's a React-specific wrinkle. Our hero component uses `useSearchParams()` to read the `heroPhase` URL parameter. In Next.js App Router, `useSearchParams()` requires a Suspense boundary — without it, the entire page would fall back to a loading state during server rendering.

We split the component into three layers:

```tsx
// Public API — provides Suspense boundary
export function Hero() {
  return (
    <Suspense fallback={<HeroInner initialPhase={0} autoRotate={false} />}>
      <HeroWithParams />
    </Suspense>
  );
}

// Reads URL params — must be inside Suspense
function HeroWithParams() {
  const searchParams = useSearchParams();
  const initialPhase = Number(searchParams.get('heroPhase')) || 0;
  return <HeroInner initialPhase={initialPhase} />;
}

// Actual implementation — no hooks that need Suspense
function HeroInner({ initialPhase, autoRotate = true }) {
  // All the rotation logic lives here
}
```

The fallback renders `HeroInner` with phase 0 and no auto-rotation. This means during server-side rendering, the hero shows the first keyword statically. Once the client hydrates, `HeroWithParams` reads the URL parameter and kicks off the animation. No layout shift, no flash of wrong content.

## The Phase Offset for Showcase Mode

In normal use (someone visiting the homepage), every hero starts at phase 0 and rotates normally. The magic happens in showcase mode, where each device iframe loads the homepage with a different `heroPhase` parameter:

```
Phone:   /?heroPhase=0  → starts at "Websites"
Tablet:  /?heroPhase=1  → starts at "Automations"
Monitor: /?heroPhase=2  → starts at "AI Solutions"
```

At any given moment, each device shows a different keyword. They all rotate at the same speed from the same clock, so the offsets are maintained indefinitely. Visitors see all three brand keywords simultaneously across the devices.

## Respecting Reduced Motion

Not everyone wants things moving on their screen. The `prefers-reduced-motion` media query tells us when a user has requested less animation. For a keyword rotation, this means we should either slow the rotation significantly or stop it entirely:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion || !autoRotate) return;
```

When reduced motion is active, the hero stays on its initial keyword. Each device in showcase mode still shows a different keyword (since that's based on `initialPhase`, not the timer), but nothing moves. The showcase still communicates the variety of services — just without animation.

## Cleaning Up Timeouts

A common bug with this pattern is leaked timeouts. If the component unmounts before the next timeout fires, you get a state update on an unmounted component. The cleanup is straightforward since `update()` returns the timeout ID:

```typescript
useEffect(() => {
  if (!autoRotate) return;
  const timer = update();
  return () => clearTimeout(timer);
}, [autoRotate, initialPhase]);
```

Each call to `update` sets the next timeout and returns its ID. The effect cleanup clears whatever the current pending timeout is. No arrays of timer IDs, no ref tracking. Just one timeout at a time, cleaned up when the component unmounts or dependencies change.

## The Takeaway

If you're building any kind of synchronized animation across multiple independent components — whether it's device showcases, dashboard widgets, or multi-panel displays — consider deriving state from a shared clock rather than synchronizing independent timers.

The pattern is always the same: replace "increment a counter every N ms" with "calculate the current value from `Date.now()`." It's deterministic, drift-free, and requires zero coordination between components. Math is more reliable than message passing.
