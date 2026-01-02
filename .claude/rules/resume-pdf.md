# Resume PDF Generation Rule

When modifying `job-search/resume-dev.html`, follow these guidelines to maintain clean PDF output.

## Page Structure

The resume is designed as a 3-page document with explicit page breaks:

```
PAGE 1: Header + Summary + Skills + needthisdone.com job
PAGE 2: Acadio → Combat Medic (all remaining jobs)
PAGE 3: Featured Project + Education + Influences
```

## Page Break Classes

| Class | Purpose |
|-------|---------|
| `.page-2-start` | Forces page break before element (on Acadio job) |
| `.projects-section` | Forces page break before Featured Project |

If you add a new job or section that should start a new page, add the appropriate class.

## Print CSS Location

All print styles are in `@media print { }` block (around line 669).

**Page 1 values (keep tight - this page is full):**

| Property | Current Value | Purpose |
|----------|---------------|---------|
| Section margin | 12px | Space between sections |
| Section padding | 8px | Internal section padding |
| Summary line-height | 1.6 | Vertical text spacing |

**Page 2 & 3 values (more spacious):**

| Property | Current Value | Purpose |
|----------|---------------|---------|
| Job margin | 20px | Space between job entries |
| Bullet line-height | 1.8 | Vertical text spacing |
| Bullet item margin | 8px | Space between bullet points |
| Education line-height | 1.8 | Vertical text spacing |
| Influences p margin | 14px | Space between book entries |

## Adjusting Page Fill

**Page 1 is tight** - don't increase spacing here or it will overflow.

**Pages 2 & 3 have room** - if empty space appears:
1. Increase `margin-bottom` on `.job` (page 2)
2. Increase `line-height` on `.job-bullets` (page 2)
3. Increase `.education` line-height (page 3)
4. Increase `.influences p` margin (page 3)

If content overflows to next page:
1. Decrease the above values
2. Check if page break class is in wrong place
3. Page 1 overflow → reduce summary or skills content

## Adding Content

When adding new sections:
1. Add HTML in the appropriate page location
2. Add non-print CSS in the desktop media query
3. Add print CSS in `@media print { }` block
4. Regenerate PDF to verify fit

## Generating the PDF

```bash
cd app && npx tsx scripts/generate-resume-pdf.ts
```

Output: `job-search/Resume_Abe_Reyes.pdf`

The script uses Playwright with:
- Letter format (8.5" x 11")
- 0.5" margins (0.3" top on page 1)
- Full background colors
- Scale 1 (no shrinking)

## Syncing with /resume Page

The web version lives at `app/app/resume/page.tsx`. When updating content:
1. Update `job-search/resume-dev.html` first
2. Mirror changes to `app/app/resume/page.tsx`
3. The web version uses Tailwind, HTML uses inline CSS

## Content Guidelines

- Keep language simple for non-technical readers
- Use active voice in bullet points
- Start bullets with action verbs
- Avoid jargon in summary and book descriptions
