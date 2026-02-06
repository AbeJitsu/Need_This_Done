# Portfolio & Visibility Overhaul - Roadmap

## Status: In Progress

### Phase 1: `/work` Portfolio Page (Highest Impact)
- [ ] `app/lib/portfolio-data.ts` — Static case study content
- [ ] `app/app/work/page.tsx` — Server component with metadata
- [ ] `app/components/work/WorkPageClient.tsx` — Client wrapper
- [ ] `app/components/work/CaseStudyCard.tsx` — Project cards
- [ ] `app/components/work/StatCounter.tsx` — Animated counters
- [ ] `app/components/work/TechStackBadge.tsx` — Tech labels
- [ ] `app/components/work/ArchitectureDiagram.tsx` — Visual stack

### Phase 2: Blog Content (5 Posts)
- [ ] `scripts/seed-blog-posts.ts` — Seed script
- [ ] Circuit Breaker Pattern tutorial
- [ ] Self-Taught to Full-Stack story
- [ ] Why I Built My Own E-Commerce
- [ ] Request Deduplication tutorial
- [ ] Combat Medic to Code story

### Phase 3: Navigation & Homepage
- [ ] Update `page-config.ts` nav links (add Work, Blog)
- [ ] Update footer links (add Work)
- [ ] Homepage: shift CTA to "See My Work"

### Phase 4: Resume Updates
- [ ] "Open to Opportunities" banner + PDF download
- [ ] Add Bridgette Automation project
- [ ] Update CTA to include /work

### Phase 5: Minor Tweaks
- [ ] About page: update CTA → /work
- [ ] Contact page: add "view my work first" link

### Verification
```bash
cd app && npm run dev          # Visual check
cd app && npm run build        # Zero warnings
cd app && npm run test:e2e     # Tests pass
cd app && npm run test:a11y    # Accessibility
```
