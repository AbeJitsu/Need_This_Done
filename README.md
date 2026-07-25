# NeedThisDone

NeedThisDone helps businesses generate more customers through website improvements, conversion optimization, and practical AI-powered automation.

The website is both the sales surface and the first proof of the service: visitors can request an audit, begin a project, collaborate through a client portal, and pay through Stripe-hosted flows.

## Current direction

The application is being simplified on `dev`. The retained product is:

- Marketing site, services, work, blog, and contact flow.
- Site analyzer and report experience.
- Lead, project, appointment, and client collaboration workflows.
- A small owner dashboard for managing that work.
- Stripe-hosted invoices, Payment Links, subscriptions, and customer portal.

Medusa/Railway ecommerce, LMS, visual page editing, workflow automation, and dark-mode support are being retired. They must not be extended.

Read [the system audit](docs/audits/2026-07-24-system-audit.md) for the evidence and [the project tracker](docs/PROJECT_STATUS.md) for current work.

## Local development

```bash
cd app
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Local admin review can use the development-only bypass in `.env.local`; it must never be enabled in production.

Useful checks:

```bash
cd app
npm run type-check
npm run test:unit
npm run build
```

After a production build, restart the development server because the build replaces `.next`.

## How the business works

```text
Visitor
   |
   +--> Site Analyzer / Contact Form
              |
              v
            Lead
              |
              v
      Owner Dashboard
   (qualify, schedule, quote)
              |
              +--> Stripe-hosted payment
              |
              v
           Project
              |
              v
        Client Portal
  (updates, files, comments,
   reports, appointments)
              |
              v
      Measurable client outcome
```

## How the software fits together

```text
Browser
   |
   v
Vercel / Next.js
   |--------> Supabase
   |           auth, leads, projects,
   |           blog, reports, files
   |
   |--------> Stripe
   |           hosted payments,
   |           invoices, subscriptions,
   |           customer portal
   |
   |--------> OpenAI
   |           website analysis
   |
   |--------> Resend
   |           transactional email
   |
   +--------> Upstash Redis
               rate limits, deduplication,
               short-lived cache
```

Retiring from the application:

```text
Medusa/Railway ecommerce - carts - inventory - LMS
inline/page editing - workflow automation - dark mode
```

| Service | Retained responsibility |
| --- | --- |
| Vercel | Next.js hosting and scheduled work that supports the retained product |
| Supabase | Authentication, leads, projects, collaboration data, storage, blog, and reports |
| Stripe | Hosted payment links, invoices, subscriptions, and customer self-service portal |
| OpenAI | Site analysis and selected AI-assisted workflows |
| Resend | Transactional email |
| Upstash Redis | Rate limiting, deduplication, and small retained caches |

## How changes reach production

```text
Plan and document
       |
       v
Implement on dev
       |
       v
Tests + desktop/mobile review
       |
       v
Explicit approval
       |
       v
Merge to production
```

## Branch policy

- `dev` is the integration branch for reviewed work.
- `production` is deployed, approved code only.
- No long-lived branches beyond those two.
- Each change must be validated on `dev` before an explicit production approval.

## Documentation policy

- `README.md` explains the current product and how to work on it.
- `docs/PROJECT_STATUS.md` is the authoritative implementation tracker.
- `docs/audits/` contains evidence and architecture reviews.
- Design documents stay only when they support the current mission.
- Retired-system manuals are deleted with the systems they described.
