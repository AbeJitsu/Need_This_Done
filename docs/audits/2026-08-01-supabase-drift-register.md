# Supabase Local/Hosted Drift Register

**Evidence date:** 2026-08-01  
**Environment compared:** migration-built local schema on `dev` versus linked hosted project `oxhjtmozsdstbokwtnwa`  
**Change authority:** read-only inspection only; this document does not authorize a hosted write, migration, table drop, or data deletion.

## Decision

The local database is not yet a faithful replacement rehearsal for the retained production product.
It successfully rebuilds and tests the Phase 6 AI-employee boundary, but it also rebuilds retired
legacy tables that hosted Supabase no longer has. Conversely, hosted Supabase retains Medusa-era
public types and sequences that local migrations do not reproduce. Several other legacy domains
exist in both databases even though they have no retained runtime caller.

The target is therefore **retained-contract parity**, not a zero-line whole-schema diff:

1. every retained table, function, policy, grant, constraint, trigger, and storage boundary is
   reproducible locally from migrations;
2. each retained behavior has a real local database test, including authorization and failure cases;
3. the same focused contract is verified read-only or with separately approved temporary data on hosted Supabase;
4. every difference outside that contract is classified and either deliberately preserved or removed through a separately reviewed cleanup migration.

Until those four conditions pass, local Supabase is a strong test environment but is not proof that
the entire hosted database can be replaced or restored from the repository.

## Evidence collected

- `supabase status`: local Supabase is running.
- Local catalog query: the migration-built `public` schema contains **69 tables**.
- `supabase migration list`: local and hosted histories matched through `072`; `073` was local-only at audit time.
- `supabase db diff --linked --schema public`: fresh read-only comparison completed.
- Runtime caller scan: current non-test application code was checked for Supabase table and RPC use.
- Roadmap and release-evidence review: retained scope was evaluated against the human-led AI Growth Employee mission.
- Repository gate: lint, TypeScript, 156 required unit tests, 48 accessibility tests, and the production build passed; the build independently confirmed that the analytics, marketplace, and media routes remain deployable.

The linked diff is directional. A generated `drop table` here means the table is built by local
migrations but is absent from hosted `public`. A generated `create type` or `create sequence` means
the object exists in hosted `public` but is absent from the migration-built local `public` schema.
The generated SQL is evidence only and must never be applied as a migration without classification.

## Structural drift

### Local-only legacy tables: 22

Hosted Supabase already lacks these tables. They are created locally by historical migrations and
inflate the local test surface with systems the roadmap retired.

| Domain | Local-only tables | Classification | Replacement boundary |
| --- | --- | --- | --- |
| Old appointments | `appointment_requests`, `appointment_reminders`, `appointment_notification_log` | Retired | Consultation preferences stay on `projects`; Abe or Andrea confirms; Google Calendar will own the invite and reminders. |
| Campaign email | `email_templates`, `email_campaigns`, `campaign_recipients`, `campaign_opens`, `campaign_clicks` | Retired | Repository-owned transactional templates plus the email provider; live delivery/recovery remains unproven. |
| Loyalty/referrals | `loyalty_points_config`, `loyalty_points`, `loyalty_redemptions`, `customer_referrals`, `referral_transactions`, `referral_credit_usage` | Retired | No replacement in the final vision. |
| Storefront support | `product_categories`, `product_category_mappings`, `product_waitlist`, `saved_addresses`, `waitlist_campaigns`, `waitlist_campaign_recipients` | Retired | Repository offering catalog and project-request handoff; no storefront account system. |
| Legacy payment reliability | `payment_attempts`, `webhook_events` | Retirement candidate | Stripe remains payment truth. Reintroduce a smaller reconciliation record only if a retained hosted payment flow proves it is necessary. |

Associated local-only objects include the `appointment_status` type, legacy functions, policies,
triggers, indexes, and grants for these tables. Historical migrations remain immutable. A future
additive cleanup migration should stop rebuilding them locally only after caller and dependency
checks pass.

### Hosted-only Medusa residue

The linked diff found **31 Medusa/order-era enum types** and **8 migration/display sequences** in
hosted `public` that local migrations do not reproduce there. Examples include cart, order, claim,
payment-session, price-list, product-status, return, shipping, and swap enums, plus Medusa/MikroORM
migration and order display sequences.

Classification: **hosted retirement candidates**, not objects to copy into local Supabase. Before
removal, inspect dependencies and confirm that no retained table, function, view, or stored data uses
them. Any hosted cleanup is destructive and requires its own backup, reviewed migration, dry run,
and explicit approval.

### Expected pending changes: migrations 073 and 074

`073_secure_google_calendar_tokens.sql` is intentionally local-only. The linked diff therefore shows
the encrypted token columns and key-aware token functions as absent from hosted Supabase. This is
planned migration state, not unexplained drift. Hosted deployment remains blocked until a server-only
`CALENDAR_TOKEN_ENCRYPTION_KEY` exists and a separate deployment is approved.

`074_create_private_project_attachments_bucket.sql` was added after this audit exposed that the
retained private attachment bucket had no migration. A fresh local reset now reproduces its 5 MB
limit and allowed file types without granting browser-direct object access. It remains pending and
requires separate hosted review and approval. A read-only hosted dry run lists exactly `073` and
`074`; neither migration was applied.

### Other local-only legacy shape

Local `orders` contains twelve deposit/final-payment/admin columns that hosted does not. These belong
to the retired custom order/deposit workflow. Do not add them to hosted. The `orders` table itself is
still common to both environments and has a live caller described below, so its final retirement is
not yet proven.

## Same in both databases but not automatically retained

Schema parity can preserve the wrong product. These common domains require caller/data/dependency
review even though they do not appear as table drift.

| Classification | Tables or domain | Current evidence | Required decision/proof |
| --- | --- | --- | --- |
| Retain | `projects`, `project_comments`, `project_github_handoffs`, `site_reports`, `user_roles`, `workflow_runs` | Direct current callers; central to intake, collaboration, reports, decisions, and operator access. | Add/complete real local authorization and browser proofs listed in `RELEASE_EVIDENCE.md`. |
| Retain — Phase 6 | `customer_accounts`, `customer_memberships`, `ai_employees`, and the five `ai_employee_*` work/decision/outcome/brief/schedule tables | Migration `072` and focused real local RLS tests pass. | Complete hosted anonymous and cross-customer behavior verification. |
| Retain with a pending security transition | `google_calendar_tokens` | Current connect/status/disconnect callers; hosted row count was zero at the 2026-07-31 read-only check. | Provision the server secret, separately approve `073`, reconnect, and prove token/event idempotency behavior. |
| Retain | `health_check` | Active health route and retained-schema manifest. | Preserve read-only health behavior and narrow policy. |
| Application-retired; schema cleanup candidate | `blog_posts`, `changelog_entries`, `page_embeddings` | Hosted blog export completed; public blog is repository-owned; CMS, changelog, chatbot, indexing, embeddings, and media callers are removed with regression guards. | Remove only through the post-cutover content/chat/media cleanup migration after backup, dry run, and explicit approval. |
| Active contradiction — urgent | `orders` | `/api/admin/analytics` and `/admin/analytics` still present an order/revenue dashboard; navigation still links to it although the roadmap classifies it as retirement-targeted. | Remove or replace this surface with project/outcome metrics before declaring order commerce retired. Then verify no callers and inspect hosted data before table cleanup. |
| Likely retired code/schema residue | `marketplace_templates`, `template_categories`, `template_purchases`, `template_reviews` | A large `/api/marketplace` handler remains, but no retained UI caller was found. | Confirm no external caller, remove the API in a focused commit, then test absence before schema review. |
| Likely retired code/schema residue | `media` and media storage | Media APIs/components remain through an editor component after inline-editor retirement. | Confirm no retained blog workflow needs it; either explicitly retain and test it or remove the orphaned caller chain first. |
| Retirement candidates with no current non-test table caller found | `cart_reminders`, `coupons`, `coupon_usage`, `currencies`, `exchange_rates`, `user_currency_preferences`, `demo_items`, `enrollments`, `pages`, `page_content`, `page_content_history`, `page_views`, `payments`, `product_interactions`, `product_similarities`, `quotes`, `reviews`, `review_votes`, `review_reports`, `stripe_customers`, `subscriptions`, `wizard_sessions` | They are common to local and hosted, but the current caller scan found no direct runtime table use. | Check views, functions, triggers, storage, provider callbacks, hosted row counts, and legal retention before proposing cleanup. “No direct caller” alone is not deletion proof. |

The order analytics contradiction recorded at audit time was resolved on 2026-08-01: the page, API,
navigation, and browser spec were removed, a legacy UI redirect was added, and the retirement guard
now asserts that the routes stay absent. The `orders` table remains a schema-retirement candidate;
its removal still requires dependency inspection, backup, review, and separate approval.

The marketplace caller recorded at audit time was also resolved on 2026-08-01: the orphaned API and
its browser spec were removed, and the product-inventory guard now keeps that route absent. The four
marketplace tables remain schema-retirement candidates under the same backup, dependency-review, and
approval boundary.

The former embeddings debug route and its unreproducible `profiles` reference were removed with the
chatbot/indexing surface. No retained caller depends on that object.

## Local replacement confidence gate

Local Supabase may be treated as a production-replacement rehearsal only when all checks below pass
from a fresh disposable reset:

1. **Migration reproducibility:** `supabase db reset --local` and `supabase db lint --local` pass with
   no unexplained migration warning.
2. **Retained schema manifest:** an automated check asserts the exact retained tables, columns,
   constraints, RPC signatures, grants, RLS enablement, policies, triggers, and storage buckets.
3. **Retained behavior:** `npm run verify:database` passes with zero required skips, including customer,
   role, anonymous, cross-customer, concurrency, idempotency, immutable-history, consultation, and
   cascading-cleanup coverage.
4. **Client isolation:** real authenticated local database and browser tests prove project, comment,
   file, report, and handoff isolation.
5. **Restore rehearsal:** a schema-plus-sanitized-fixture restore into disposable local Supabase proves
   the retained product can start and complete its critical workflows without production credentials.
6. **Focused hosted comparison:** the retained manifest shows zero unexplained local/hosted difference.
   Historical retirement candidates remain in this register instead of blocking retained parity.
7. **Hosted behavior:** separately approved tests prove the same high-risk authorization behavior on
   hosted Supabase, then remove all temporary identities and rows.

This gate proves structure and behavior. It does not claim that local test data is a copy of customer
data, and it does not require a cloud-synced folder. Migrations, deterministic fixtures, and encrypted
backups are the reproducible assets.

## Safe execution order

1. **Completed locally 2026-08-01:** create the retained schema-manifest test and make it pass after
   a fresh local reset. The test now covers 16 retained RLS tables, critical columns, policies,
   constraints, RPC signatures/grants, and the private project-attachment bucket.
2. Resolve the active `orders` analytics contradiction in one focused application commit.
3. **Completed locally 2026-08-01:** remove confirmed marketplace, chatbot/embeddings,
   changelog, database-blog, media, and design-tool callers with retirement guards.
4. Add a new local-only cleanup migration for the 22 already-absent-hosted legacy tables and other
   proven local retirement targets; reset and run the complete database/code/browser gate.
5. Re-run the linked diff. The expected result is only classified hosted residue plus intentionally
   pending migrations.
6. Inventory hosted dependencies and row counts for common retirement candidates without reading or
   copying customer contents.
7. Design hosted cleanup migrations by domain. Each destructive migration gets its own backup,
   review, dry run, approval, validation, and rollback/recovery procedure.

Migration `073`, hosted `072` behavior verification, application promotion, and destructive schema
cleanup remain separate approval boundaries. None occurred during this audit.

## Seven Habits alignment

- **Be proactive:** replace vague drift anxiety with an explicit register and controllable test gate.
- **Begin with the end in mind:** prove the retained human-led Growth Employee can be rebuilt locally.
- **Put first things first:** establish the retained manifest before deleting or deploying anything.
- **Think win-win:** protect customer data and production uptime while reducing local maintenance noise.
- **Seek first to understand:** separate structural drift, expected pending work, active callers, and unknown dependencies.
- **Synergize:** combine roadmap decisions, migration history, runtime callers, local tests, and hosted read-only evidence.
- **Sharpen the saw:** automate the manifest and repeat the focused comparison before every database release.
