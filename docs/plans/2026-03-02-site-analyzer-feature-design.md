# Site Analyzer Feature — Design Document

**Date:** 2026-03-02
**Branch:** `experiment/site-analyzer`
**Status:** Approved — ready for implementation planning

## Summary

A public-facing lead generation tool. Users enter a URL + email, get a site analysis report emailed to them, and can view a detailed dashboard-style scorecard at `/report/[id]`.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Access model | Anonymous + email | Lowest friction, captures leads without signup barrier |
| Processing | Synchronous API route | Vercel Pro (60s timeout), analyzer runs in ~10s for 8 pages |
| CTA strategy | Tiered | Email = book a call (soft). Report page = book a call + browse packages (both) |
| Report style | Dashboard scorecard | Visual score bars, grade badge, expandable AI sections |
| Rate limits | 2 per IP/day, 2 per email/day | Whichever hits first blocks the request |

## User Flow

```
/site-analyzer                    POST /api/site-analyzer           /report/[id]
┌──────────────┐                  ┌──────────────────┐              ┌──────────────┐
│ URL + email  │ ──submit──────→  │ Validate inputs  │              │ Score badge  │
│ form         │                  │ Rate limit check │              │ Score bars   │
│              │  ←─progress───   │ Run analyzer     │              │ A11y callout │
│              │                  │ Save to Supabase │  ──────────→ │ Page metrics │
│              │  ←─redirect───   │ Send email async │              │ AI analysis  │
└──────────────┘                  └──────────────────┘              │ CTAs         │
                                                                    └──────────────┘
```

## Data Model

### New table: `site_reports`

```sql
create table site_reports (
  id                uuid primary key default gen_random_uuid(),
  url               text not null,
  email             text not null,
  score             integer not null,
  grade             text not null,
  categories        jsonb not null,       -- score breakdown array
  accessibility     jsonb not null,       -- a11y issues array
  metrics           jsonb not null,       -- per-page TechnicalMetrics
  ai_analysis       text not null,        -- markdown from AI
  executive_summary text not null,
  pages_crawled     integer not null,
  created_at        timestamptz default now()
);
```

- RLS: Public read (UUID = access token), service role insert only
- JSONB fields allow adding metrics without schema migrations
- No raw HTML stored — only processed results needed for display

## API Route: `POST /api/site-analyzer`

**Input:** `{ url: string, email: string }`

**Flow:**
1. Validate URL (must start with http/https, must resolve)
2. Sanitize + validate email
3. Rate limit check: 2/day per IP, 2/day per email
4. Run analyzer (refactored from CLI script into importable library)
5. Save report to Supabase via service role client
6. Fire email via Resend (async — don't block response)
7. Return `{ reportId, score, grade, redirectUrl }`

**Timeout:** 55 seconds (leave 5s buffer under Vercel's 60s limit)

## Email: React Email Template

**Subject:** "Your Site Report: [domain] scored [score]/100"

**Content (top to bottom):**
1. Header: "Your Site Report Is Ready"
2. Score card: score/100 + grade + top 5 wins/losses (checkmarks and X marks)
3. Executive summary (2-3 sentences)
4. Primary CTA: "View Your Full Report" → `/report/[id]`
5. Divider
6. Soft CTA: "Book a Free 15-Min Call" → `/contact` or Calendly
7. Footer: NeedThisDone.com branding

**Strategy:** Show enough to hook, not enough to satisfy — drive click-through to report page.

## Report Page: `/report/[id]`

Server-rendered. Data from Supabase. No auth required.

**Sections (top to bottom):**

1. **Hero** — dark background (matches site pattern), grade badge (color-coded: A=emerald, B=blue, C=purple, D=gold, F=red following BJJ belt progression), executive summary
2. **Score Breakdown** — 10 horizontal bars with earned/possible, color-coded (green=full, yellow=partial, red=zero), notes per category
3. **Accessibility Issues** — dedicated callout box (not buried in scores), lists specific issues, includes "why this matters" context about ADA lawsuit risk
4. **Page-by-Page Metrics** — collapsible table: path, title, words, H1 count, alt coverage
5. **AI Analysis** — 6 expandable accordion sections, Section 6 (Action Items) open by default
6. **CTA Section** — "Ready to improve your score?" with primary button (Book a Free 15-Min Call, emerald) and secondary button (See Our Packages from $500, blue outline)

## Analyzer Refactor

The CLI script (`scripts/prototype-site-review.ts`) needs to be split:

- **`app/lib/site-analyzer.ts`** — Importable library: `analyzeSite(url)` returns structured data (metrics, score, AI analysis)
- **`app/scripts/prototype-site-review.ts`** — Thin CLI wrapper that calls the library and formats console output

This lets the API route and the CLI script share the same analysis engine.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/lib/site-analyzer.ts` | Create | Core analyzer library (extracted from CLI script) |
| `app/scripts/prototype-site-review.ts` | Modify | Thin CLI wrapper calling library |
| `supabase/migrations/064_site_reports.sql` | Create | New table + RLS policies |
| `app/app/site-analyzer/page.tsx` | Create | Public input form page |
| `app/components/site-analyzer/AnalyzerForm.tsx` | Create | Client component: form + progress |
| `app/app/api/site-analyzer/route.ts` | Create | POST endpoint: validate, analyze, save, email |
| `app/app/report/[id]/page.tsx` | Create | Report dashboard (server component) |
| `app/components/report/ScoreBreakdown.tsx` | Create | Score bars visualization |
| `app/components/report/AccessibilityCallout.tsx` | Create | A11y issues section |
| `app/components/report/AIAnalysis.tsx` | Create | Expandable AI sections |
| `app/components/report/ReportCTA.tsx` | Create | Tiered CTA section |
| `app/emails/SiteReportEmail.tsx` | Create | React Email template |
| `app/lib/email-service.ts` | Modify | Add `sendSiteReport()` function |

## Rate Limiting

```typescript
// Two independent checks — whichever fails first blocks
const ipCheck = await checkRateLimit(
  `analyzer:ip:${ip}`, { maxAttempts: 2, windowSeconds: 86400 }, 'site-analyzer'
);
const emailCheck = await checkRateLimit(
  `analyzer:email:${email}`, { maxAttempts: 2, windowSeconds: 86400 }, 'site-analyzer'
);
if (!ipCheck.allowed) return rateLimitResponse(ipCheck.resetAt);
if (!emailCheck.allowed) return rateLimitResponse(emailCheck.resetAt);
```
