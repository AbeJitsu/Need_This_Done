---
slug: why-your-sticky-header-isnt-sticking
title: "Why Your Sticky Header Isn't Sticking (And the One-Line Fix)"
excerpt: "Your nav has position: sticky and top: 0. It should work. It doesn't. Here's the one cause nobody checks first — and a debugging checklist so you never waste time on this again."
category: tutorial
tags:
  - css
  - sticky
  - debugging
  - nextjs
  - frontend
status: published
source: original
author_name: Abe Reyes
meta_title: "Why Your Sticky Header Isn't Sticking (And the One-Line Fix)"
meta_description: "The #1 cause of CSS position: sticky not working isn't overflow — it's your parent element. A real debugging story with a checklist you can bookmark."
---

# Why Your Sticky Header Isn't Sticking (And the One-Line Fix)

Your nav has `position: sticky; top: 0`. It should work. It doesn't.

You've already checked Stack Overflow. You've inspected `overflow`. You've toggled `z-index`. You've stared at DevTools until your eyes crossed. Nothing.

Here's the thing: **the real cause is something you'd never think to check** — and once you see it, you'll wonder how you missed it.

## What We Tried (And Why It Failed)

We had a Next.js site with a navigation component. The Tailwind classes were textbook:

```tsx
<nav className="sticky top-0 z-40 bg-white">
  {/* navigation content */}
</nav>
```

That's correct. Should work. Didn't.

**Attempt 1: Remove `overflow-x: hidden` from the body.**

This is the most common Stack Overflow answer, and for good reason — `overflow: hidden` on any ancestor *does* break sticky positioning. We removed it from `globals.css`. No change.

**Attempt 2: Remove `transition-colors duration-0` from the body tag.**

A long shot, but CSS transitions can occasionally interfere with paint layers. Removed it. Still broken.

Both were reasonable guesses. But the actual problem was hiding in the DOM structure.

## The Real Cause: Your Parent Is Too Short

Here's how `position: sticky` actually works. It doesn't stick to the viewport like `fixed` does. **It sticks within its parent's scrollable area.**

That means:
- If the parent is 5000px tall, the sticky element rides along for 5000px of scrolling
- If the parent is exactly as tall as the sticky element itself, there's **zero scroll distance** — the element scrolls away immediately with its parent

This is what our DOM looked like:

```html
<body>
  <div data-noindex>          <!-- wraps ONLY the nav -->
    <nav class="sticky top-0">  <!-- wants to stick -->
    </nav>
  </div>
  <main>...</main>             <!-- all the page content -->
</body>
```

See the problem? The `<div data-noindex>` wrapper was exactly as tall as the nav. When you scrolled, that wrapper — and everything inside it — scrolled away as a unit. The nav was *sticking perfectly* inside its parent. Its parent just happened to be 64 pixels tall.

In our case, someone added the wrapper for SEO purposes, thinking `data-noindex` would tell search engines to skip the nav. It created a nav-height container that killed sticky positioning.

## The Fix: One Line

Remove the wrapper. That's the whole fix.

**Before:**
```tsx
// layout.tsx
<div data-noindex>
  <Navigation />
</div>
<main>{children}</main>
```

**After:**
```tsx
// layout.tsx
<Navigation />
<main>{children}</main>
```

The nav now sits directly inside `<body>` alongside `<main>`. The scroll container is the full page. Sticky works.

## The Sticky Debugging Checklist

Bookmark this. Next time `position: sticky` breaks, run through it in order:

**1. Parent height** — Is the sticky element's parent taller than the element itself? If the parent is only as tall as the sticky element, there's nowhere to stick. **This was our issue.**

**2. Overflow** — Does *any* ancestor have `overflow: hidden`, `overflow: auto`, or `overflow: scroll`? Any of these create a new scroll context that can trap the sticky element.

**3. Flex/Grid containers** — Is the element inside a flex or grid child that constrains its height? A `flex-grow: 0` parent can silently limit the available sticky range.

**4. Z-index** — Is something painting over the sticky element? It might be sticking but invisible. Check with a temporary `z-index: 9999`.

**5. Top/bottom value** — Did you actually set `top: 0`? `position: sticky` without a `top` or `bottom` value does nothing. This is the easiest one to miss.

## What About `data-noindex`?

Quick aside: `data-noindex` is not a web standard that search engines respect. Google uses the `<meta name="robots" content="noindex">` tag or the `X-Robots-Tag` HTTP header. A `data-noindex` attribute on a div does nothing for SEO.

And even if you need to signal "this is navigation" to crawlers, the `<nav>` semantic element already does that. No wrapper needed.

## The Takeaway

When sticky positioning breaks, **inspect the parent, not the element.** The element's CSS is almost always fine. It's the container that's wrong.

The fix is usually structural — unwrap a div, move the element up a level, or make the parent taller. One line of HTML, not three hours in DevTools.
