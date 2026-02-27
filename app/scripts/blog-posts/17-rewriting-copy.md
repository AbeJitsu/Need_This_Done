---
slug: rewriting-copy-plain-language
title: "From Developer Speak to Human Words: Rewriting Our Website Copy"
excerpt: "We rewrote every heading and bullet point on our portfolio to sound like a human explaining their work — not a developer listing their stack. Here's what changed and why it matters."
category: case-study
tags:
  - copywriting
  - ux
  - plain-language
status: published
source: original
author_name: Abe Reyes
meta_title: "From Developer Speak to Human Words: Rewriting Our Website Copy"
meta_description: "How rewriting jargon-heavy portfolio copy into plain language made our site more approachable. Before and after examples from a real rewrite."
---

# From Developer Speak to Human Words: Rewriting Our Website Copy

I was reading through our portfolio page the other day when a sentence stopped me cold:

*"Production-grade reliability: circuit breaker, retry logic, request deduplication."*

That sentence was technically accurate. It was also completely meaningless to anyone who might actually hire us. A business owner reading that would nod politely and move on. A developer might appreciate it, but they're not the one signing the contract.

We had a problem. Our website sounded like a resume written for other engineers, not a pitch written for the people we actually serve.

## The Jargon Trap

Here's how it happens. You're a developer, so you describe your work in developer terms. You wrote a circuit breaker? You say "circuit breaker." You implemented RAG with pgvector embeddings? You type exactly that, because it's precise and correct.

But precision isn't the same as communication. Your site visitor doesn't need to know the implementation. They need to know what it means for them.

This is a pattern I see constantly in technical portfolios. We describe *how* we built things when visitors want to know *what* the thing does for them.

## What We Actually Changed

The rewrite touched three pages — our portfolio, contact page, and about page. The changes were small in terms of lines of code. Five files, roughly 30 lines changed total. But the impact on readability was immediate.

Here's what the before and after looked like for our main project description.

**Before:**
*"Production e-commerce platform serving real customers. Built from scratch with Next.js 14, TypeScript, and a microservices architecture connecting Medusa, Supabase, Stripe, and Redis."*

**After:**
*"Online store and business platform built from scratch. Handles payments, bookings, email campaigns, and customer accounts — everything a growing business needs in one place."*

Same project. Same accomplishment. But the second version tells you what the thing *does* instead of what it's *made of*. A business owner reads the first version and sees alphabet soup. They read the second and think: "Oh, that's what I need."

## The Impact Bullets Were Even Worse

The impact section was where the jargon really piled up. Each bullet was a flex for developer audiences that meant nothing to clients.

**Before:**
- *"1,300+ commits in under 3 months of intense development"*
- *"Production-grade reliability: circuit breaker, retry logic, request deduplication"*
- *"AI chatbot with RAG (pgvector + OpenAI) answering customer questions from indexed site content"*

**After:**
- *"Built from zero to production in under 3 months"*
- *"Built-in safeguards so nothing breaks — if something goes wrong, the system recovers automatically"*
- *"AI chatbot that learns from the website to answer customer questions automatically"*

The commit count was the first thing to go. Nobody outside of engineering knows whether 1,300 commits in three months is impressive or normal. "Zero to production" tells the same speed story in terms anyone understands.

The circuit breaker line became "built-in safeguards." Because that's what a circuit breaker *is* — it's a safeguard. The client doesn't care about the pattern name. They care that their site won't go down.

And "RAG (pgvector + OpenAI)" became "learns from the website." Because that's the magic. The chatbot reads your site and answers questions about it. That's the value proposition. The vector database is an implementation detail.

## Three Rules for the Rewrite

As we went through each page, a few principles emerged:

**1. Describe outcomes, not ingredients.** Nobody walks into a restaurant and orders "flour, eggs, butter, and sugar arranged in layers with thermal processing." They order cake. Your portfolio should describe the cake, not the recipe.

**2. If a term needs a parenthetical explanation, replace it.** "FINRA regulatory content scraping with validation" became "automated extraction of regulated financial content." If you find yourself writing "(that means...)" after a term, the term isn't pulling its weight.

**3. Keep the tech badges for developers who want them.** We didn't strip the technology names entirely. The tech stack badges still show Next.js, TypeScript, Supabase, and so on. But they're visual tags you can glance at, not embedded in the prose where they interrupt the story.

## The Heading Hierarchy Fix

While we had the hood open, we also fixed a structural issue that had been bugging me. Several pages had heading jumps — going from H1 straight to H3, skipping H2 entirely.

This matters for two audiences. Screen readers use heading levels to build a mental map of the page. Jumping from H1 to H3 is like a book with chapters that skip from Chapter 1 to Chapter 3 — disorienting. Search engines also use heading hierarchy to understand page structure, so clean headings help with SEO.

The fix was straightforward. Our `CaseStudyCard` component was rendering project titles as H3 when they should have been H2. Subtitles were H4 instead of H3. A small change in the component fixed it across every portfolio entry at once.

## Why This Matters More Than You Think

Copy rewrites don't feel like "real work." There's no new feature to demo. No impressive architecture diagram. The git diff is short and unexciting.

But here's the thing: your website copy is doing sales calls 24 hours a day. Every visitor who reads "circuit breaker, retry logic, request deduplication" and bounces is a potential client lost. Not because the work isn't impressive, but because the words didn't connect.

We write code for computers to execute. We should write copy for humans to understand.

## The Takeaway

If you're a developer with a portfolio site, try this exercise. Read your project descriptions out loud to someone who doesn't code. Watch their face. The moment their eyes glaze over is the moment your copy needs a rewrite.

You don't have to dumb anything down. You just have to translate. "Circuit breaker" becomes "automatic recovery." "RAG pipeline" becomes "learns from your content." "Microservices architecture" becomes "connects all your tools in one place."

Same impressive work. Better words for it.
