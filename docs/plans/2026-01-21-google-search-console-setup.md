# Google Search Console Setup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify site SEO configuration and set up Google Search Console so needthisdone.com gets indexed by Google.

**Architecture:** Site already has proper SEO setup - this is about verifying it works in production and connecting it to Google Search Console.

**Tech Stack:** Next.js App Router (sitemap.ts, robots.ts), Google Search Console

---

## Pre-Flight Check: Site Configuration Status

Your site is **correctly configured** for SEO:

| Item | Status | Details |
|------|--------|---------|
| Sitemap | ✅ Good | `app/sitemap.ts` generates `/sitemap.xml` with all pages |
| Robots.txt | ✅ Good | `app/robots.ts` allows `/` and blocks only private routes |
| Meta robots | ✅ Good | `layout.tsx` sets `index: true, follow: true` |
| Canonical URLs | ✅ Good | `metadataBase` set to `https://needthisdone.com` |
| JSON-LD | ✅ Good | LocalBusiness and WebSite structured data included |
| noindex tags | ✅ None | Only internal chatbot elements use noindex |

**No code changes needed.** The issue is likely that Google just hasn't discovered your site yet.

---

## Task 1: Verify Production URLs Work

Before setting up Search Console, verify the SEO files are being served correctly.

**Step 1: Check sitemap.xml in browser**

Open: `https://needthisdone.com/sitemap.xml`

Expected: XML file listing all your pages with URLs like:
```xml
<url>
  <loc>https://needthisdone.com/</loc>
  <lastmod>2026-01-21...</lastmod>
  <priority>1.0</priority>
</url>
```

**Step 2: Check robots.txt in browser**

Open: `https://needthisdone.com/robots.txt`

Expected:
```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
...
Sitemap: https://needthisdone.com/sitemap.xml
```

**Step 3: If either fails**

If either returns 404 or error, the issue is deployment config - check Vercel/deployment logs.

---

## Task 2: Set Up Google Search Console (Browser Task)

This task is for Claude in Chrome. Copy this prompt into a new Claude session with browser access:

---

### Claude in Chrome Prompt

```
I need help setting up Google Search Console for my website needthisdone.com. I'm already logged into my Google account.

Here's what I need you to do:

1. Navigate to Google Search Console: https://search.google.com/search-console

2. Add my property:
   - Click "Add property"
   - Choose "URL prefix" option (not Domain)
   - Enter: https://needthisdone.com
   - Click Continue

3. Verify ownership:
   - Look for the "HTML tag" verification method
   - Copy the meta tag they provide (looks like: <meta name="google-site-verification" content="..."/>)
   - Show me the exact content value - I need to add this to my site

4. Once I confirm I've added the tag:
   - Click Verify
   - Confirm verification succeeded

5. Submit sitemap:
   - In the left sidebar, click "Sitemaps"
   - In the "Add a new sitemap" field, enter: sitemap.xml
   - Click Submit

6. Request indexing:
   - In the left sidebar, click "URL inspection"
   - Enter: https://needthisdone.com/
   - Click "Request indexing"

Let me know what verification code I need to add, and guide me through each step.
```

---

## Task 3: Add Google Verification Meta Tag (Code Change)

After getting the verification code from Search Console, add it to your site.

**Files:**
- Modify: `app/app/layout.tsx` (metadata section)

**Step 1: Add verification to metadata**

In `app/app/layout.tsx`, find the `metadata` export (around line 70) and add the verification field:

```typescript
export const metadata: Metadata = {
  // ... existing fields ...

  // Google Search Console verification
  verification: {
    google: 'YOUR_VERIFICATION_CODE_HERE',  // Replace with actual code from Search Console
  },

  // ... rest of metadata ...
};
```

**Step 2: Deploy the change**

```bash
git add app/app/layout.tsx
git commit -m "feat(seo): add Google Search Console verification meta tag"
git push
```

**Step 3: Wait for deployment, then verify in Search Console**

---

## Task 4: Monitor Indexing Progress

After setup, check back in 2-3 days:

1. Go to Search Console → Coverage report
2. Look for "Valid" pages increasing
3. Check "URL Inspection" for specific pages

**Expected timeline:**
- Homepage indexed: 1-3 days
- Full site indexed: 1-2 weeks
- Search rankings appear: 2-4 weeks

---

## Summary

| Step | Who Does It | Time |
|------|-------------|------|
| 1. Verify URLs work | You (browser) | 2 min |
| 2. Set up Search Console | Claude in Chrome | 5-10 min |
| 3. Add verification tag | You (code) | 5 min |
| 4. Monitor progress | You (weekly) | Ongoing |

The site is ready - we just need to tell Google it exists.
