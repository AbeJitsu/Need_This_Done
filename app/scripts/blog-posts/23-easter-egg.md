---
slug: easter-egg-nobody-will-find
title: "The Easter Egg Nobody Will Find (And Why We Built It Anyway)"
excerpt: "We made the tiny device mockups in our hero section fully interactive. Click a link in the phone and the main page navigates. Tap the chatbot and the real chatbot opens. Almost nobody will discover this."
category: behind-the-scenes
tags:
  - easter-eggs
  - delight
  - engagement
  - ux
status: published
source: original
author_name: Abe Reyes
meta_title: "The Easter Egg Nobody Will Find (And Why We Built It Anyway)"
meta_description: "Why we spent time making tiny hero device mockups interactive — forwarding clicks and opening real widgets. The case for building small delights into professional sites."
---

# The Easter Egg Nobody Will Find (And Why We Built It Anyway)

Our homepage has two small device mockups in the hero section — a phone and a tablet showing our actual site running live inside CSS-styled frames. They're there to give visitors a preview of what their project could look like. Nice visual. Professional touch.

This week, we made them interactive.

Click a link inside the tiny phone and the main page navigates to that section. Tap the chatbot button in the miniature device and the full-size chatbot widget opens on the real page. Hover over the device frames and they glow — emerald on one, purple on the other.

Almost nobody will ever discover this. The devices are small. They look decorative. No affordance suggests they're clickable. We built it anyway.

## How It Works

The device mockups are iframes loading our own site at mobile and tablet widths. Because they're same-origin, we have full access to the content inside them.

We injected a script that intercepts two types of interactions:

**Navigation forwarding.** When someone clicks a link inside the device iframe, instead of navigating the tiny iframe (which would look weird and broken), we catch the click and forward it to the parent window using `postMessage`. The parent page then navigates to the target URL at full size.

```typescript
// Inside the iframe: intercept clicks on links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link?.href) {
    e.preventDefault();
    window.parent.postMessage(
      { type: 'navigate', url: link.href },
      window.location.origin
    );
  }
});
```

**Widget forwarding.** The site has two floating widgets — an AI chatbot and a sales assessment wizard. Both are triggered by buttons with specific `aria-label` attributes. Inside the device iframe, we intercept clicks on those buttons and dispatch a custom event on the parent window instead of opening the widget in the cramped iframe.

The parent page already has event listeners for `open-chatbot` and `open-wizard` custom events (both widgets support this pattern for programmatic triggers). So the wiring was minimal — catch the click in the iframe, dispatch the event on the parent, and the widget opens full-size as if the user had clicked the real button.

## The Hover Glow

We added a subtle glow effect on device frame hover. Not a border highlight or an opacity change — an actual colored shadow that suggests energy beneath the surface.

The colors follow our BJJ belt system: emerald for the phone (action, growth), purple for the tablet (creativity, mastery). The glow appears on hover and fades on mouse-out:

```css
/* Emerald glow for phone */
transition: box-shadow 0.3s ease;
&:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
}

/* Purple glow for tablet */
&:hover {
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.15);
}
```

The opacity is intentionally low — `0.15` is a suggestion, not a spotlight. If someone hovers and notices the glow, they might try clicking. If they don't hover, they never know it's there. No visual noise for people who aren't exploring.

## Why Build Something Nobody Will Find?

This is the question that matters. We spent real development time — about 160 lines of new code across five files — on a feature that maybe 1 in 100 visitors will discover. Why?

**It changes how we think about the product.** When you build hidden delights into your work, you start thinking about every interaction as an opportunity. "What would make this moment surprising?" becomes a design reflex. That reflex improves the obvious features too, not just the hidden ones.

**It rewards the curious.** The people who *do* discover it — the ones who hover over things, click on things that don't look clickable, poke around just to see what happens — are often your most engaged visitors. They're evaluating your attention to detail. An interactive device mockup tells them: these people care about craft.

**It's fun.** Not everything has to be driven by conversion metrics. Sometimes you build something because it makes you smile. A team that never builds anything fun eventually stops having fun building. And that shows in the work.

**It took 30 minutes.** The infrastructure was already there. Same-origin iframes. `postMessage` API. Custom event listeners on the widgets. The actual implementation was connecting existing pieces, not building new systems. The return on investment — in morale, in craftsmanship reflex, in potential delight — easily justified a half hour of work.

## The Philosophy of Hidden Things

There's a concept in Japanese woodworking where the inside of a drawer — the part nobody sees — is finished as beautifully as the outside. It's not about showing off. It's about the integrity of the whole piece.

Easter eggs serve a similar purpose in software. They're a signal of completeness. If the team cared enough to make a decorative mockup interactive, what does that say about the parts of the product they *knew* you'd see?

The best products are full of these moments. A double-tap on the Instagram logo scrolls to the top. A pull-to-refresh in the GitHub app shows a loading animation that looks like the Octocat. Pulling down past the top of the list in Apple Maps shows a compass that actually works.

None of these features are in any marketing material. You discover them by being curious. And once you find one, you start looking for more. That's engagement you can't buy with a feature announcement.

## What We Didn't Do

It would have been tempting to add a tooltip: "Try clicking inside the devices!" Or an animated arrow pointing at the mockup. Or a blog post callout on the homepage saying "Easter egg: our device previews are interactive."

We didn't do any of that. The whole point is discovery. If you tell people about the hidden thing, it's not hidden anymore. It's just a feature with extra steps.

The glow on hover is the only hint, and it's subtle enough to miss. That's by design. The payoff of discovering something unexpected is directly proportional to how unexpected it actually was.

## For Builders Who Think This Is Frivolous

If you're in the "every feature must serve a KPI" camp, I get it. Resources are finite. Time spent on easter eggs is time not spent on core functionality.

But consider this: we built this feature in the time it would take to have one meeting about whether to build this feature. The cost was negligible. The upside — even if only a handful of people discover it — is a moment of genuine delight in a world of sameness.

Not everything has to be strategic. Sometimes you build a small, hidden, interactive thing because the craft demands it. Because you walked past that decorative mockup a hundred times and thought: "What if it did something?"

What if it did?
