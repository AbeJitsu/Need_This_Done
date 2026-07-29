# NeedThisDone

NeedThisDone sells and operates a supervised AI Growth Employee that prepares evidence-backed growth decisions for a human owner or manager.

The website is both the sales surface and the first proof of the service: visitors can request an audit, begin a project, collaborate through a client portal, and pay through Stripe-hosted flows.

## Current direction

The retained product is:

- A marketing, audit, and proposal surface for the managed service.
- A customer-scoped employee workspace with three daily check-ins.
- A maximum of five scheduled decisions per employee, queue, and day.
- Immutable decisions and manual action/outcome records in Supabase.
- Owner/manager approval; viewers remain read-only.
- Existing operator, project, and client collaboration needed to deliver the service.

The Medusa/Railway ecommerce runtime, product reviews, carts, inventory, LMS, visual page editing, workflow automation, and dark-mode support are retired. Historical database migrations remain for audit history and are not runtime dependencies.

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
npm run test:employee-workspace
```

After a production build, restart the development server because the build replaces `.next`.

Local database behavior tests require the Supabase CLI and a running Docker-compatible
container engine. They reset only the local database:

```bash
supabase start
supabase db reset
cd app
RUN_LOCAL_SUPABASE_TESTS=true npm run test:unit -- __tests__/lib/ai-employee-rls.test.ts
```

Production uses hosted Supabase. Migration `072` must pass the local gate before a
separately approved hosted dry run or deployment.

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

Retired from the application:

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
