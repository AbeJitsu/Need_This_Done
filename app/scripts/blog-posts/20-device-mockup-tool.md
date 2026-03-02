---
slug: building-device-mockup-preview-tool
title: Building a Device Mockup Preview Tool from Scratch
excerpt: "We needed to see our site inside phone and tablet frames during development. No existing tool did what we wanted, so we built our own with React and iframes."
category: behind-the-scenes
tags:
  - react
  - tooling
  - device-preview
  - prototyping
status: published
source: original
author_name: Abe Reyes
meta_title: Building a Device Mockup Preview Tool from Scratch
meta_description: "How and why we built a custom device mockup preview tool with React iframes. The challenges of responsive content inside device frames and how we solved them."
---

# Building a Device Mockup Preview Tool from Scratch

You know that section on tech company homepages where they show their product inside a phone or laptop frame? We wanted that for our hero section. Show potential clients what their site could look like, rendered live inside realistic device mockups.

The problem: every tool we tried was either a static screenshot generator (not live), a paid service with watermarks, or an npm package that hadn't been updated since 2021. We needed something that rendered our actual site — live, interactive, responsive — inside device frames we could style ourselves.

So we built it.

## Why Not Just Use Screenshots?

Screenshots are the obvious solution. Take a capture at mobile width, drop it into a phone PNG. Easy, done, move on.

But we wanted the content to be *live*. When we update the hero copy, the device preview should update too. When the keyword rotation cycles through "Websites," "Automations," "AI Solutions," the mockup should show that animation happening. Screenshots freeze a moment. We wanted the whole experience.

There's also a practical reason: we were iterating fast on the hero section. Taking new screenshots every time we changed a color or adjusted spacing would have been a constant chore. A live preview that updates automatically removed that friction entirely.

## The Core Architecture

The approach is simpler than you might expect. Each device mockup is three things:

**1. A CSS device frame.** A `div` with `border-radius`, `padding`, and a gradient background that looks like a phone or tablet bezel. No images — pure CSS. This means we can tweak proportions, colors, and corner radii without editing a PSD file.

**2. A scaled iframe.** The site loads at its natural resolution inside an `iframe`, then CSS `transform: scale()` shrinks it to fit the device frame. This is the key trick — the content thinks it's rendering at full width, so all our responsive breakpoints work correctly. We just mathematically shrink the result.

**3. A control panel.** Buttons to switch between phone, tablet, and monitor views, adjust scaling, and toggle between layout modes.

## The Scaling Math

This was the trickiest part. An iframe rendering a 1440px-wide page needs to fit inside a phone frame that's maybe 180px wide on screen. The scale factor is straightforward division:

```typescript
const scale = containerWidth / iframeNaturalWidth;
```

But you also need to set the iframe's actual dimensions to the *inverse* of the scale, so it renders at full size before being shrunk:

```typescript
<iframe
  style={{
    width: `${naturalWidth}px`,
    height: `${naturalHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }}
/>
```

The iframe is huge — wider than its container — but `transform: scale()` visually shrinks it down, and `overflow: hidden` on the parent clips the edges. The content inside renders at normal size with normal breakpoints, and the user sees a tiny, perfectly proportioned preview.

## Challenge: Responsive Breakpoints Inside Iframes

Here's something that surprised us: the content inside the iframe responds to the *iframe's width*, not the visual width on screen.

If you set the iframe width to 375px (mobile), the site renders its mobile layout. Set it to 1440px and scale it down, and the site renders its desktop layout — just tiny. This is actually what we wanted for the phone mockup. We load the page at phone width so visitors see the real mobile experience.

But for the tablet view, it got interesting. We wanted to show the tablet breakpoint, which meant the iframe width had to match our `md:` Tailwind breakpoint. Too wide and it shows desktop layout. Too narrow and it shows mobile. Getting the exact width right required checking our actual breakpoint values and matching them.

## Challenge: The Device Frame Details

CSS device frames sound simple until you try to make them look real. A phone isn't just a rounded rectangle. It has:

- A dynamic island or notch at the top
- An omnibox (URL bar) with a realistic appearance
- Consistent bezel widths that scale with the device size
- Subtle shadows and gradients that suggest depth

We built this up incrementally. The first version was literally a gray rounded rectangle. Each commit refined it — adding the address bar, adjusting corner radii to match real devices, getting the bezel proportions right so it reads as "phone" at a glance.

The latest iteration models an iPhone 17 Pro Max frame with CSS-only bezels, a pill-shaped dynamic island, and a minimal address bar showing the actual page URL. All proportional, all scalable, all without a single image asset.

## The Showcase Mode

Once the basic preview worked, we realized we could do something clever. Our hero section has a keyword rotation — it cycles through three brand keywords with color-coded animations. What if each device showed a *different* keyword at the same time?

This became the showcase mode. Three devices side by side — tablet, monitor, phone — each loading the same homepage but pinned to a different phase of the keyword rotation. The hero component reads a `heroPhase` URL parameter and starts its rotation at that offset.

The trick was synchronizing them. Rather than each iframe running an independent timer (which would drift over time), we derived the rotation phase from `Date.now()`. Every iframe calculates the same base index from the current timestamp, then adds its phase offset. They stay in perfect sync because they share the same clock.

## What We Learned

**Build for yourself first.** This tool exists because we needed it for our own development workflow. The hero section showcase was a bonus. Building tools for your own use means you understand the requirements deeply and you'll actually use the thing.

**CSS device frames beat image frames.** Images look more "realistic" but are a pain to maintain. Different sizes need different images. Retina screens need 2x assets. CSS frames scale infinitely, work on any background, and you can tweak them with a class change.

**Iframes are underrated.** The web development community has mostly moved on from iframes, and for good reason — they were historically a security mess. But for rendering your own content in a sandboxed viewport, they're exactly the right tool. Same-origin iframes give you full control over the content while providing natural viewport isolation.

**Start ugly, iterate fast.** The first version of the device frame was embarrassingly basic. But it proved the concept in an hour. Each refinement after that was small and targeted — better bezels, better scaling, better loading. The final version is four days of iteration, not four days of upfront design.

The device preview tool started as a quick experiment and became one of the most useful development tools we've built. Sometimes the best features are the ones you build for yourself.
