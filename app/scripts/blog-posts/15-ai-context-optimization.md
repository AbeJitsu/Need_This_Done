---
slug: ai-context-budget-tips
title: Your AI Is Reading the Same Thing 8 Times (and How to Fix It)
excerpt: We cut 800 lines of duplicated instructions from our AI coding setup. Here are the practical lessons about managing your context budget.
category: tips
tags:
  - ai
  - productivity
  - claude-code
  - development
  - tips
status: published
source: original
author_name: Abe Reyes
meta_title: Your AI Is Reading the Same Thing 8 Times (and How to Fix It)
meta_description: Practical tips for managing AI context budgets. We cut 800 lines of duplicated instructions and learned lessons that apply to any AI coding tool.
---

# Your AI Is Reading the Same Thing 8 Times (and How to Fix It)

We recently discovered that our AI coding assistant was reading the same product management rule eight times before answering a single question.

Eight times. The exact same paragraph, copy-pasted across eight different instruction files.

That's like handing a new employee the company handbook eight times and then wondering why they're slow to respond.

## Context Is a Budget

Every AI tool has a context window — a fixed amount of text it can hold in its head at once. Your instructions, your code, your conversation history, and the AI's reasoning all compete for that same space.

When you fill half the budget with duplicated instructions, you're not just being messy. You're making your AI dumber on every task. Less room for reasoning means worse answers. It's that simple.

Think of it like a desk. If it's covered in eight copies of the same memo, there's no room to actually work.

## What We Found

We audited our setup: 31 instruction files, roughly 4,850 lines of configuration telling our AI how to work on this codebase.

The results were... humbling.

- The same color system was defined in **three separate files**
- The same product management rule appeared in **eight places**
- A 55-line changelog was tracking things that `git log` already tracks perfectly
- Multiple files repeated the same "how to run tests" instructions word for word

We'd built up these files organically over months. Every time we wanted the AI to remember something, we added it to whatever file felt closest. Nobody was checking for overlap.

## The Fixes

Here's what we did — and these tips work regardless of which AI coding tool you use.

**Audit for duplication.** Take your most important rule or instruction and search for it across all your config files. If it shows up more than once, you have a problem. We searched for "Medusa" and found it everywhere.

**Layer your instructions.** Most AI tools support some kind of hierarchy — global settings, project-level settings, directory-level settings. Use the layers. Put general rules at the top, specific rules close to the code they govern. Don't repeat yourself across layers.

**Point, don't repeat.** Pick one canonical location for each piece of knowledge. Everywhere else, just reference it. Instead of copying our color system into three files, we kept it in one and added a one-line pointer: *"See design.md for the color system."* One source of truth. Zero drift.

**Delete what your tools already track.** We had a handwritten changelog duplicating what Git already records perfectly. That's 55 lines of context budget spent on information the AI could get from `git log` any time it needed to. Gone.

**Measure the result.** After cleanup, we cut roughly 800 lines — about 7,200 tokens of wasted context per session. That's space the AI now uses for actual thinking instead of re-reading the same memo.

## Why This Matters Beyond Setup

Context budget management isn't a one-time cleanup task. It's an ongoing skill.

Every instruction you add has a cost. Every duplicated rule makes the AI a little slower, a little less sharp. The developers who get the best results from AI tools aren't necessarily better prompters — they're better editors. They keep the brief clean.

There's a real difference between an assistant drowning in redundant memos and one working from a clear, concise brief. Same AI, same capabilities, wildly different output quality.

## Check Your Own Setup

If you're using AI coding tools with any kind of instruction files, here's a five-minute check:

1. Count your instruction files and total their line count
2. Pick three key terms and search across all files for duplicates
3. Ask yourself: *"Is anything here that my tools already know?"*

You might be surprised how much room you can free up. We were.

The AI didn't get smarter. We just stopped making it read the same thing eight times.
