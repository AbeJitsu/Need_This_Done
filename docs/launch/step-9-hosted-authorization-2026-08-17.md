# Step 9 — Hosted authentication and authorization verification — 2026-08-17

This record covers launch checklist item 9 against the approved hosted
Supabase project after the item-8 retention exception was expressly renewed
for this check. It is an authorization and boundary proof only; it does not
authorize provider activation, model requests, email, publication, payment,
Calendar, spend, account changes, customer workflows, or real recipients.

## Decision

- **Result:** `PASSED`.
- **Security owner:** Abe Reyes / `abejitsu`.
- **Item-8 prerequisite:** The existing Vercel retained-variable exception was
  renewed for this check on 2026-08-17. Its review/removal date remains
  **2026-09-15**.
- **Hosted target:** Supabase project `oxhjtmozsdstbokwtnwa`, expected branch
  `dev`, with Auth health `200` and the expected project identity.
- **Hosted history:** Exactly `91` rows, latest migration `095`, with no
  higher migration.
- **Deployment preflight:** The reviewed Production deployment
  `dpl_4XP38V8P6G8NGBb517aMa658m5Qm` and Preview deployment
  `dpl_6NMvvVgVv2aqGtgxFFvqtwWr7Exh` were both confirmed `Ready` before the
  verifier ran. This check did not alter either deployment or any Vercel
  environment value.

The verifier ran from the `dev` worktree at repository snapshot
`9259e54527c670d7c5e2cdf678296b31cd4e4962`. The worktree already contained
documentation edits; the verifier script, application code, and migrations
were not changed for this check.

## Command and safety boundary

```bash
NEEDTHISDONE_HOSTED_FIXTURE_ACK=I_UNDERSTAND_THIS_CREATES_DISPOSABLE_HOSTED_FIXTURES \
  npm --prefix app run verify:hosted-parity
```

The verifier used the approved `.env.cloud.profile` target and did not print
or record credential values. It created four temporary `.invalid` fixture
identities and their scoped authorization records, then removed them in its
cleanup path. No customer or prospect records were created or used for the
fixture checks. The sanitized result reported zero external provider calls,
zero external recipients, and zero cleanup errors. No object bytes were
downloaded; existing Storage metadata was only listed and compared.

## Authorization matrix

| Boundary | Observed hosted evidence | Result |
| --- | --- | --- |
| Endpoint and anonymous/private boundary | Auth identity matched the approved project; both retained Storage buckets were private; anonymous Storage listing was denied; 13 service-only functions had no browser-role grant. | `PASSED` |
| Owner and manager access | Each owner saw only the employee in its own customer; the manager could record the scoped employee decision. | `PASSED` |
| Viewer read-only behavior | The viewer saw its own tenant employee, but employee-work-item writes and decisions were denied. | `PASSED` |
| Tenant isolation | Cross-customer employee and provenance reads returned no foreign records. | `PASSED` |
| Planner approval boundary | Viewer plan creation and direct authenticated planner writes were denied; owner draft creation, exact idempotency replay, unapproved-dispatch denial, approval snapshot, and post-approval dispatch passed. | `PASSED` |
| Worker boundary | Browser worker claim was denied; the service-role worker claim leased once, rejected a concurrent second claim, and reclaimed one expired lease. | `PASSED` |
| Storage privacy and limits | The two private buckets, expected limits/MIME rules, 217 project-attachment metadata records, zero agent-media objects, and no-byte-download boundary matched. | `PASSED` |
| Emergency stop | Model-usage reservation failed closed while the fixture emergency stop was enabled. | `PASSED` |
| Idempotency and lease controls | Planner creation, dispatch replay, usage reservation replay, and lease/reclaim behavior were exact and bounded. | `PASSED` |
| Provenance isolation | The owning user could read its provenance record; the other customer could not. | `PASSED` |
| Fixture cleanup | Four disposable users were created, four were cleaned, cleanup errors were `0`, and cleanup failures were empty. | `PASSED` |

The verifier also reported hosted history/schema checks passing: 49 retained
RLS tables, 17 required policy markers, 13 service-only functions, and 4
authenticated functions. Its report fields were `hosted_writes: 0`,
`external_provider_calls: 0`, and `external_recipients: 0`; the temporary
fixture lifecycle was the explicitly approved exception for this check.

## Rollback and remaining gates

No rollback was required. Preserve hosted history, audit records, and this
sanitized evidence. If a later hosted authorization issue appears, disable
the affected route or redeploy the reviewed application rollback reference
`8b8d429`; any database correction remains forward-only.

Item 8 remains an `EXCEPTION`, not a clean variable-allowlist pass. Its owner,
scope, and 2026-09-15 review/removal date remain active. Item 9 passing does
not authorize OpenRouter, Calendar, email, Stripe, OpenClaw/Mac activation,
prospecting, publication, spend, or any customer workflow. Items 10–22 and
the separate paid-proof items remain independently gated.
