# Application Library Instructions

## Retained service boundaries

| Concern | Source of truth |
| --- | --- |
| Leads, projects, comments, attachments, blog, reports | Supabase |
| Login and project ownership | Existing authenticated session boundary; do not add a second auth system |
| Payments and subscriptions | Stripe-hosted Payment Links, invoices, subscriptions, and Customer Portal |
| AI site analysis | OpenAI, with SSRF-safe fetching and rate limits |
| Email | Resend |
| Short-lived cache, rate limits, deduplication | Upstash Redis |

## Rules

- Do not add cart, product catalog, Medusa, inventory, or custom-checkout dependencies.
- Treat Stripe as the payment source of truth; store only the references needed for projects and portal display.
- Keep authorization checks server-side and enforce project ownership for client data.
- Validate and bound all external requests, especially site-analyzer URLs.
- Use shared validation, timeout, retry, and API-error helpers instead of recreating them in routes.
