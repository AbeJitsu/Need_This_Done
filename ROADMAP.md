# NeedThisDone Roadmap

## Mission

Build an AI-powered business that helps companies generate more customers through website improvements, conversion optimization, useful audits, and automation.

## Now

1. Secure and correct the site analyzer and contact-to-lead flow.
2. Simplify the owner dashboard around leads, projects, clients, appointments, blog, and payments.
3. Preserve a focused client portal for shared projects, comments, files, reports, appointments, and payment access.
4. Replace custom ecommerce checkout with Stripe-hosted Payment Links, invoices, subscriptions, and Customer Portal.

## Next

1. Remove LMS, inline editing/page-builder, ecommerce, Medusa/Railway, and their unused tests, jobs, APIs, and documentation.
2. Remove dark-mode support from the retained application surface.
3. Reduce global providers and fix hydration, accessibility, mobile overflow, sitemap, and stale-link issues.

## Operating rules

- Work on `dev`; merge to `production` only after review and explicit approval.
- One focused change per commit, with tests and rollback notes.
- Update `docs/PROJECT_STATUS.md` in the same commit as each implementation slice.
- Do not apply destructive database migrations until application callers are removed and the migration is separately reviewed.

See [the project tracker](docs/PROJECT_STATUS.md) for active work and [the system audit](docs/audits/2026-07-24-system-audit.md) for the baseline.
