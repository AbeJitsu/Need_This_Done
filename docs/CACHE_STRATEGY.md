# Cache and Rate-Limit Strategy

Caching exists to make the retained lead and project workflow reliable, not to preserve removed ecommerce behavior.

## Retained responsibilities

| Area | Key pattern | Invalidate when |
| --- | --- | --- |
| Blog | `blog:post:{slug}`, `blog:posts:*` | A post is created, changed, published, or deleted |
| Projects | `project:{id}`, `admin:projects:*` | A project, status, comment, or attachment changes |
| Appointments | `appointments:user:{id}`, `admin:appointments:*` | An appointment changes |
| Site reports | `site-report:{id}` if cached | A report is generated or corrected |
| Rate limits | `rate-limit:{feature}:{subject}` | Allow natural expiry; do not manually invalidate |
| Request deduplication | `dedup:{request-fingerprint}` | Allow short natural expiry |

## Rules

- Cache only read-heavy data that can safely be briefly stale.
- Invalidate related keys immediately after a successful mutation.
- Do not cache authorization decisions, payment state, or signed file URLs.
- The source of truth for payments is Stripe; the app may cache display-only payment summaries briefly.
- Redis failures must degrade safely: rate-limited external work may fail closed; non-critical caches may fail open.

## Adding a cache key

1. Name it by domain and record it in this document.
2. Define its TTL and every mutation that invalidates it.
3. Add a targeted test for stale-data prevention.
4. Do not add a key for a system scheduled for retirement.
