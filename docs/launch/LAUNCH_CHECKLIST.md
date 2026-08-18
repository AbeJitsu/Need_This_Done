# NeedThisDone production launch checklist

This is the canonical numbered control document for promoting the reviewed `dev`
release candidate to hosted production. Provider runbooks and setup notes point
to these item numbers; they do not define a second activation order.

**Last reviewed:** 2026-08-17
**Technical launch decision:** **NOT GO**
**Business launch decision:** **INCOMPLETE** until items 23 and 24 are complete
**Current reviewed `dev` candidate SHA:** `e363a5f74ff8ad731272089f8714bd81edb97d3d`
**Deployed application SHA:** `e363a5f74ff8ad731272089f8714bd81edb97d3d` (corrected contact layout and browser/server boundary)
**Last full local assembly proof:** `e363a5f74ff8ad731272089f8714bd81edb97d3d` (2026-08-16; local migrations through `095`)
**Final pre-apply release-control SHA:** `e363a5f74ff8ad731272089f8714bd81edb97d3d`
**Latest hosted-stage control SHA:** `9d82a627d6d589b09f46d9cdb20d0b5dcf49a6ce`
**Post-write evidence:** [Hosted security repairs and parity closeout](step-5-hosted-security-repairs-2026-08-15.md)
**Hosted Supabase history:** through `095`
**Local verification history:** through `095`
**Immediate application rollback reference:** `8b8d429` (`production`)
**Active hosted parity endgame:** [hosted parity endgame](HOSTED_PARITY_ENDGAME.md)
**Latest hosted parity evidence:** [passing hosted parity result](hosted-parity-report-2026-08-15.json), [historical pre-repair result](hosted-parity-pre-repair-report-2026-08-15.json), and [security repair stage](step-5-hosted-security-repairs-2026-08-15.md)

## How to use this checklist

Every item is an independent release record. Update the status only when the
evidence, approval, and rollback fields are complete. A technical launch needs
items 1–7, 7.1, and 8–22 to be `PASSED`, or an explicit owner-approved exception with an owner,
scope, reason, expiration/removal date, and monitoring plan. Items 23 and 24 are
separate paid-business gates and must not be represented as technical launch
evidence.

Status values:

- `PASSED` — the procedure ran against the intended target and the evidence is retained.
- `IN_PROGRESS` — work is active but the exit proof is not complete.
- `PENDING_APPROVAL` — the procedure is understood but a required human approval is missing.
- `BLOCKED` — a prerequisite, credential, implementation, or external state is missing.
- `NOT_STARTED` — no launch work has been performed.
- `EXCEPTION` — an owner-approved, time-boxed deviation is recorded in full.

## Dependency map

```text
1–6 → 7.1 → 7 → 8 → 9 → 10 → 11 → 12–14 → 15–16 → 21 → 22
                      ├─ 17 transactional email
                      ├─ 19 Calendar
                      └─ 20 Stripe
                 9 + 10 + 16 → 18 prospecting
```

Items 17, 19, and 20 are independent provider-canary lanes and may run in
parallel once their own entry conditions are met. Item 18 remains separately
dependent on items 9, 10, and 16.

**Current gate state:** Items 1–7, 7.1, and 9 are `PASSED`; item 8 is the active
`EXCEPTION` gate; items 10–22 are `BLOCKED`; items 23–24 are `NOT_STARTED` and
remain separate from technical launch.

## Cutover safeguards

- Keep hosted backup, migration, deployment, secret provisioning, and live provider actions as separate approvals.
- Never reset hosted Supabase or destructively reverse a hosted migration. Hosted rollback is forward-only.
- Use no real customer or prospect recipient during verification.
- Send the only live messages to an owner-controlled mailbox.
- Use only the owner-controlled Calendar and an owner-approved nominal Stripe amount, with immediate refund or void.
- Keep OpenClaw loopback-only and approval-required. It must not send, publish, spend, change accounts, or deliver arbitrary external content.
- The corrected Vercel deployment `dpl_GVMHoCVSKiMgy2nse84zKs1cXafc` includes the verified contact-page correction in item 7.1. Configure or verify item 8 only against that corrected deployment or a reviewed replacement.
- Preserve `8b8d429` as the application rollback reference until cutover and post-cutover checks pass.

## Launch items

### Phase 1 — Release and hosted-data readiness

#### 1. Freeze the release candidate — `PASSED`

- **Owner:** Engineering owner
- **Entry condition:** Clean worktree; exact release SHA recorded; no unresolved required check, or a documented owner-approved exception.
- **Exit proof:** The reviewed candidate is frozen; the provider-free local assembly, bridge tests, whitespace validation, and recorded exceptions are retained.
- **Approval:** Recorded — the owner-authorized local model-spend change and the focused hosted-write gate repair were committed and validated. Hosted database, deployment, secret, provider, and live-canary approvals remain separate.
- **Rollback:** Unfreeze only through an approved replacement candidate. Keep `8b8d429` untouched as the immediate application rollback reference.
- **Evidence link:** [Final assembly](../FINAL_ASSEMBLY.md) and [release evidence](../RELEASE_EVIDENCE.md).

#### 2. Push the reviewed `dev` branch — `PASSED`

- **Owner:** Release owner
- **Entry condition:** Item 1 passed; the remote target is the intended GitHub repository; branch protection and review state are known.
- **Exit proof:** The exact reviewed candidate is published to `origin/dev` without force-push, and the remote ref is recorded at the reviewed SHA; production was fast-forwarded separately under item 7.
- **Approval:** Recorded — release-owner approval covered publishing the reviewed gate-repair commit only. It did not authorize hosted migration, deployment, provider, secret, or live-action work.
- **Rollback:** Do not force-push. If the branch must be corrected, publish a reviewed replacement commit and record both SHAs; preserve the prior remote ref in the evidence.
- **Evidence link:** [Release evidence](../RELEASE_EVIDENCE.md) and [project status](../PROJECT_STATUS.md).

#### 3. Back up hosted Supabase — `PASSED`

- **Owner:** Database owner
- **Entry condition:** Item 1 passed; the intended hosted project is confirmed; a secure backup destination and recovery operator are available.
- **Exit proof:** A protected, readable recovery point covers schema, data, roles/grants, Storage metadata/object inventory, and checksums; recovery instructions were rehearsed without changing hosted state.
- **Approval:** Recorded — the requesting owner explicitly authorized completion of Step 3 on 2026-08-12. This approval covers backup capture and verification only; it does not approve migrations, deployments, provider activation, secrets, or any hosted write.
- **Rollback:** Preserve the backup as the recovery reference. Do not delete or overwrite the old snapshot during a retry.
- **Evidence link:** [Project status](../PROJECT_STATUS.md) and [release evidence](../RELEASE_EVIDENCE.md).

#### 4. Run the hosted migration dry run — `PASSED`

- **Owner:** Database migration/release owner
- **Entry condition:** Items 1–3 passed; the cloud profile points to the intended Supabase project; backup checksums are recorded.
- **Exit proof:** The staged migration map, stage-specific dry runs, unchanged hosted history, protected-backup checksum, legacy-inventory checkpoints, and disposable-local rehearsal all pass with zero hosted writes.
- **Approval:** `PASSED` is review confirmation only. The gate does not authorize a hosted write. The owner’s retention decision is to preserve the protected backup and defer hosted deletion authorization for the explicit `090`–`092` retirement set until a separate Step 5 decision. Step 5 remains a separate hosted-write approval for each stage.
- **Rollback:** No hosted change has occurred. Repair or replace the migration plan and rerun the affected stage; never reset the hosted project.
- **Evidence link:** [Step 4 evidence](step-4-migration-dry-run-2026-08-12.md) and [hosted migration map](hosted-migration-stages.json).

#### 5. Apply each reviewed migration stage to hosted Supabase — `PASSED`

- **Owner:** Database owner
- **Entry condition:** Items 1–4 passed; the exact stage has a new stage-specific hosted-write approval; the current backup is readable; a maintenance/monitoring window and rollback owner are declared; the `090`–`092` retention decision is reaffirmed before that write.
- **Exit proof:** Only the approved staged migrations were applied, including the tracked `090`–`092`, `093`, `094`, and `095` repairs; hosted history is through `095` and the final repair evidence is retained.
- **Approval:** The supplied retention directive approved `090`–`092`. The owner directed the tracked forward repairs for the anonymous Storage defect, worker claim context, and verifier fixture cleanup; each stage used its own acknowledgement and protected backup. Hosted rollback remains forward-only.
- **Rollback:** Hosted rollback is forward-only. Stop new application traffic if needed, preserve history/data, and use a separately reviewed forward fix; do not delete migrations or reset the project. If a stage fails, do not continue to the next stage.
- **Evidence link:** [Destructive-retirement record](step-5-destructive-retirement-2026-08-15.md), [Storage policy repair](step-5-storage-policy-repair-2026-08-15.md), and [hosted security repairs](step-5-hosted-security-repairs-2026-08-15.md).

#### 6. Prove hosted database parity — `PASSED`

- **Owner:** Database and security owners
- **Entry condition:** Item 5 passed, including the separately approved `090`–`092` retirement decision or an owner-approved scope exception; hosted application credentials and disposable test identities are available; no customer data is used.
- **Exit proof:** Endpoint identity, hosted history, schema/RLS/grants, Storage privacy/limits, planner approval boundary, worker controls, emergency stop, lease/idempotency, provenance isolation, tenant isolation, and cleanup all pass with no external provider call.
- **Approval:** Recorded — Abe Reyes, the database/security owner, accepts the repair scope and final hosted parity evidence. This is an owner acceptance, not an independent security review.
- **Rollback:** Keep hosted history intact. Disable new callers or use a forward repair while preserving audit and test records.
- **Evidence link:** [Passing hosted parity result](hosted-parity-report-2026-08-15.json), [historical pre-repair result](hosted-parity-pre-repair-report-2026-08-15.json), and [security repair stage](step-5-hosted-security-repairs-2026-08-15.md).

### Phase 2 — Candidate validation and production cutover

#### 7.1. Repair and verify the contact page — `PASSED`

- **Owner:** Frontend and release owners
- **Entry condition:** Items 1–6 passed; the contact page is treated as a public conversion path; the exact release candidate and its prior deployed rollback reference are recorded.
- **Exit proof:** Both offer selections retain their fields and labels; the native fieldset/legend geometry passes focused accessibility, desktop/mobile contact, retained offer-switching, type, build, and live deployment checks.
- **Approval:** Recorded — the requested code/test/documentation repair and the separately approved corrected deployment are complete within this release scope. This does not authorize provider activation or secret provisioning.
- **Rollback:** Keep `8b8d429` as the application rollback reference until the later launch controls pass. If the candidate is rejected, redeploy that prior application or a reviewed replacement; hosted database rollback remains forward-only.
- **Evidence link:** [Corrected Step 7 deployment](step-7-corrected-contact-deployment-2026-08-16.md), [release evidence](../RELEASE_EVIDENCE.md), and [project status](../PROJECT_STATUS.md).

#### 7. Fast-forward production to `dev` — `PASSED`

- **Owner:** Release/deployment owner
- **Entry condition:** Items 1–6 and 7.1 passed; `production` is an ancestor of the verified `dev` SHA; the deployment target and rollback owner are named.
- **Exit proof:** `origin/production` and `origin/dev` resolve to the reviewed candidate, and the corrected Vercel deployment identity, readiness, health, public-route, protected-route, and contact checks are retained.
- **Approval:** Recorded — the owner explicitly authorized the fast-forward, exact-commit deployment, and post-deployment checks. This approval does not authorize step 8 secret or provider configuration.
- **Rollback:** Re-deploy `8b8d429` as the application rollback reference if the application fails. Do not roll hosted migrations backward; preserve the forward-only database plan.
- **Evidence link:** [Corrected Step 7 deployment](step-7-corrected-contact-deployment-2026-08-16.md) and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 3 — Hosted secrets, browser boundary, and authorization

#### 8. Configure and verify Vercel — `EXCEPTION`

- **Owner:** Abe Reyes / `abejitsu` (platform owner)
- **Entry condition:** Items 5–7 and 7.1 approved; the corrected application candidate is the target; the Production and Preview scopes are documented.
- **Exit proof:** **EXCEPTION** — the 2026-08-16 names-only preflight found 55 existing names in each scope and added only `ENV_TARGET` to Production and Preview. A separate owner-directed 2026-08-18 configuration added only server-only `OPENROUTER_BACKUP_MODEL` to those scopes. The current names-only count is 64 in Production, 64 in Preview, and 55 in unchanged Development. No existing variable was overwritten, revoked, rotated, or read.
- **Retention exception:** Keep every existing Vercel variable, including Supabase URL/anon/service-role credentials, Google client ID/secret, `NEXTAUTH_SECRET`, `COOKIE_SECRET`, `SESSION_SECRET`, `SESSION_MAX_AGE`, `REDIS_URL`, email/payment/provider entries, and legacy/test entries. This is not a clean six-variable allowlist pass and does not activate any provider or authorize a customer workflow.
- **Approval:** Recorded — Abe Reyes / `abejitsu` approved this time-boxed retention exception on 2026-08-16, expressly renewed its scope for item 9 on 2026-08-17, and directed the server-only backup-model addition on 2026-08-18. A later explicit directive separately approved the Production deployment. Review or remove the exception by **2026-09-15** before item 10 or any later hosted authorization/provider gate proceeds. Neither directive approved a provider request.
- **Monitoring:** Re-audit Vercel names in all three scopes at review; preserve the Production/Preview deployment identities; rerun health, public-route, protected-POST, and bundle scans after any environment change. Item 9 reconfirmed both reviewed deployment identities as `Ready`; Preview health was verified through Vercel’s automatic protection bypass; direct unauthenticated Preview requests may return the platform’s SSO redirect.
- **Deployment proof:** Current Production `dpl_7kr6p3LBfph9VjLMBnYgV627BE2M` reached `READY` and was aliased to `https://needthisdone.com`. Health reported Redis, Supabase, and the app up; `/` and `/services` returned `200`; the unsigned benchmark POST returned `401`; and 15 public scripts contained neither `OPENROUTER_BACKUP_MODEL` nor the configured model ID. Preview `dpl_6NMvvVgVv2aqGtgxFFvqtwWr7Exh` remains unchanged and `READY` from the earlier verification.
- **Rollback:** Preserve all existing variables. If the application is rejected, restore prior Production deployment `dpl_4XP38V8P6G8NGBb517aMa658m5Qm`. If only the backup configuration is rejected, remove only `OPENROUTER_BACKUP_MODEL` from Production and Preview. Do not revoke unrelated credentials or variables, and do not roll hosted migrations backward.
- **Evidence link:** [Environment variable inventory](ENVIRONMENT_VARIABLE_INVENTORY.md), [release evidence](../RELEASE_EVIDENCE.md), and the corrected Step 7 deployment record [step-7-corrected-contact-deployment-2026-08-16.md](step-7-corrected-contact-deployment-2026-08-16.md).

#### 9. Run hosted authentication and authorization checks — `PASSED`

- **Owner:** Security owner
- **Entry condition:** Items 6–7 passed and item 8's exception was recorded and expressly renewed for this check on 2026-08-17; owner, manager, viewer, anonymous, and cross-customer identities were controlled and disposable.
- **Exit proof:** The approved hosted verifier passed endpoint identity, anonymous/private Storage denial, owner/manager access, viewer read-only behavior, tenant isolation, planner approval-before-dispatch, service-role worker boundary, Storage privacy/limits, emergency stop, lease/idempotency, provenance isolation, and fixture cleanup with zero cleanup errors. No provider call or real recipient was used.
- **Approval:** Recorded — Abe Reyes / `abejitsu`, the approving security owner, accepted the sanitized authorization matrix and renewed the item-8 retention exception for this check. This is owner acceptance, not an independent security review or provider approval.
- **Rollback:** Disable the affected route/feature or redeploy the prior application commit; keep hosted data and audit records for investigation. Hosted database rollback remains forward-only.
- **Evidence link:** [Step 9 hosted authorization evidence](step-9-hosted-authorization-2026-08-17.md), [Agent operations](../AGENT_OPERATIONS.md), and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 4 — Core AI operator path

#### 10. Activate OpenRouter with provider-owned spend limits — `BLOCKED`

- **Owner:** AI/provider owner
- **Entry condition:** Items 6–9 passed; a restricted provider key, provider-side spend limit/alert, retention/training settings, and exact current model IDs are reviewed.
- **Exit proof:** The bounded provider configuration, fixed evaluation results, provider-reported usage/cost, failure and repair records, and approved primary-model pin are retained without exposing the key.
- **Approval:** Required — provider owner approves the key scope, limits, retention/training settings, evaluation result, and primary model.
- **Rollback:** Revoke/rotate the provider key, restore `evaluation-required`, unpin the primary, stop workers, and preserve evaluation/usage records.
- **Evidence link:** [Step 10A model comparison](step-10a-model-comparison-2026-08-17.md), [Full-stack external setup](full-stack-external-setup.md), [release evidence](../RELEASE_EVIDENCE.md), and [project status](../PROJECT_STATUS.md). Step 10 remains blocked: the comparison is partial because the configured free endpoint was rejected by the provider privacy/data-policy guardrail. A read-only 2026-08-18 catalog check identified `google/gemma-4-31b-it:free` for a separately approved repeat comparison; no primary model was pinned. The new backup probe is evidence-only and cannot satisfy the model-selection or provider-activation exit proof.

#### 11. Test the planner live — `BLOCKED`

- **Owner:** Application and AI/provider owners
- **Entry condition:** Items 8–10 passed; a pinned model is active; authenticated owner and disposable hosted test-profile sessions are available; no external recipient is configured.
- **Exit proof:** A hosted plan is created, edited, rejected, recreated, approved, and dispatched with frozen snapshots, idempotency, selected-model identity, estimated cost, approval-before-dispatch, bridge queue linkage, and a passing authenticated browser lifecycle test.
- **Approval:** Required — application owner and security owner approve the live planner lifecycle.
- **Rollback:** Reject/stop test plans, disable the planner route or unpin the model, and preserve plan/event/run history. Do not delete audit records.
- **Evidence link:** [Agent operations](../AGENT_OPERATIONS.md) and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 5 — Mac execution and safety

#### 12. Onboard OpenClaw on the Mac mini — `BLOCKED`

- **Owner:** Mac runtime owner
- **Entry condition:** Items 10–11 passed; the private Mac account, restricted provider profile, and approval-required operator policy are ready.
- **Exit proof:** OpenClaw is loopback-only and cautious; its doctor, listener, approval boundary, and denial of sending, publishing, spending, account changes, arbitrary delivery, and direct browser access are recorded.
- **Approval:** Required — Mac runtime owner approves the capability and credential boundary.
- **Rollback:** Stop OpenClaw, revoke its token/provider profile, remove test credentials, and leave the bridge disabled. Preserve doctor and denial evidence.
- **Evidence link:** [Full-stack external setup](full-stack-external-setup.md) and [Agent operations](../AGENT_OPERATIONS.md).

#### 13. Install and verify the two launchd processes — `BLOCKED`

- **Owner:** Mac runtime owner
- **Entry condition:** Items 11–12 passed; bridge URL/secret, owner and worker IDs, Gateway URL/token, private artifact root, and launchd manifests are reviewed.
- **Exit proof:** The loopback Gateway and signed bridge boot, restart, stop, log, heartbeat, lease, callback, artifact-boundary, and worker-identity checks pass without external delivery.
- **Approval:** Required — Mac runtime owner and application owner approve daemon installation.
- **Rollback:** Stop and unload both jobs, revoke bridge credentials, remove private runtime state only after evidence retention, and keep hosted queue records for reconciliation.
- **Evidence link:** [Full-stack external setup](full-stack-external-setup.md) and [Agent operations](../AGENT_OPERATIONS.md).

#### 14. Run live safety negatives — `BLOCKED`

- **Owner:** Security owner
- **Entry condition:** Items 9–13 passed; disposable plan/task identities and an emergency-stop operator are ready.
- **Exit proof:** Unapproved claim, direct send, publish, spend, account change, and external delivery all fail closed; emergency stop blocks unsafe paths and durable evidence records no side effect.
- **Approval:** Required — security owner accepts the negative-test coverage.
- **Rollback:** Keep the emergency stop active, stop the bridge/Gateway, and investigate before any retry. Preserve all failed-attempt evidence.
- **Evidence link:** [Agent operations](../AGENT_OPERATIONS.md) and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 6 — Research and provenance proof

#### 15. Run one harmless live research task — `BLOCKED`

- **Owner:** Application and Mac runtime owners
- **Entry condition:** Items 11–14 passed; one public research task, no recipient, and an owner-approved monitoring window are ready.
- **Exit proof:** The hosted dashboard, signed Mac bridge, loopback OpenClaw, and callbacks complete one harmless task with progress, usage, cost, lease, completion, and failure records.
- **Approval:** Required — application and Mac runtime owners approve the harmless task scope.
- **Rollback:** Stop the queue or emergency-stop before retrying, reconcile stale leases/callbacks, and preserve the complete task history.
- **Evidence link:** [Agent operations](../AGENT_OPERATIONS.md), [Full-stack external setup](full-stack-external-setup.md), and [release evidence](../RELEASE_EVIDENCE.md).

#### 16. Verify artifact and prospect provenance — `BLOCKED`

- **Owner:** Research and security owners
- **Entry condition:** Item 15 passed; private Storage and the review queue are available; no outreach recipient is configured.
- **Exit proof:** Public HTTPS citations, evidence-backed claims, exact model/worker/run/task/timestamp/usage provenance, private signed-URL artifacts, `pending_review` routing, and no automatic outreach are all recorded.
- **Approval:** Required — research owner accepts provenance and review-queue evidence.
- **Rollback:** Revoke signed URLs, stop the worker, leave artifacts in review, and preserve provenance records for correction.
- **Evidence link:** [Agent operations](../AGENT_OPERATIONS.md), [Full-stack external setup](full-stack-external-setup.md), and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 7 — Independent provider canaries (parallel)

Items 17, 19, and 20 are visibly parallel lanes. Each requires its own
provider approval and owner-controlled canary; none is serialized behind the
other two. Item 18 is the prospecting lane and follows its separate dependency
on items 9, 10, and 16.

#### 17. Test transactional email live — `BLOCKED`

- **Owner:** Email/provider owner
- **Entry condition:** Items 8–9 passed; restricted Resend credentials, a verified sender, signed webhook endpoint, and an owner-controlled mailbox are ready.
- **Exit proof:** One owner-mailbox message delivers; webhook signature, duplicate, failure, retry, provider event, and cleanup behavior are recorded; no customer address is used.
- **Approval:** Required — email owner authorizes the sender, content, mailbox, and one-message canary.
- **Rollback:** Disable or rotate the key, disable the sender route, preserve event/audit history, and leave customer delivery off.
- **Evidence link:** [Full-stack external setup](full-stack-external-setup.md) and [release evidence](../RELEASE_EVIDENCE.md).

#### 18. Test prospecting sender live — `BLOCKED`

- **Owner:** Prospecting/provider owner
- **Entry condition:** Items 9, 10, and 16 passed; a separate prospecting key/provider mode, suppression rules, signed event endpoint, and owner-controlled mailbox are ready.
- **Exit proof:** One approved owner-mailbox message proves sender events, bounce/reply handling, suppression, retries, audit history, and isolation from the transactional Resend key; no customer or prospect address appears.
- **Approval:** Required — prospecting owner approves the separate key, content, mailbox, and canary.
- **Rollback:** Disable prospecting mode, revoke the separate key, preserve sender events/suppression history, and leave the transactional key isolated.
- **Evidence link:** [Full-stack external setup](full-stack-external-setup.md), [Agent operations](../AGENT_OPERATIONS.md), and [release evidence](../RELEASE_EVIDENCE.md).

#### 19. Test Google OAuth and Calendar live — `BLOCKED`

- **Owner:** Calendar/integration owner
- **Entry condition:** Items 6–9 passed; Google credentials, server-only `CALENDAR_TOKEN_ENCRYPTION_KEY`, hosted migration `073`, owner-controlled test calendar, and callback configuration are ready; the consultation caller and durable event-idempotency reference are implemented.
- **Exit proof:** Owner-controlled OAuth sign-in and Calendar connection create, update, cancel, and delete one test event; repeated confirmation/idempotency keys do not duplicate it; encrypted-token, cleanup, and disconnect proof is retained.
- **Approval:** Required — Calendar owner approves the Google project, test account/calendar, event content, and cleanup.
- **Rollback:** Disconnect the test account, delete test events, remove the server secret through the secret manager, and keep the manual-calendar path. Never reverse the encrypted-token migration ad hoc.
- **Evidence link:** [Google Calendar readiness](google-calendar-readiness.md) and [release evidence](../RELEASE_EVIDENCE.md).

#### 20. Test Stripe live — `BLOCKED`

- **Owner:** Payments owner
- **Entry condition:** Items 6–9 passed; first offer, price, currency, refund rule, payment references, signed idempotent webhook path, owner-controlled Stripe account, and owner-approved nominal amount are ready.
- **Exit proof:** One controlled owner-account canary proves success, decline, duplicate webhook, refund/cancellation, signature rejection, and operator visibility; subscriptions, Customer Portal, carts, legacy orders, and card data remain out of scope.
- **Approval:** Required — payments owner approves the exact offer, nominal amount, test/live mode, refund/void window, and canary.
- **Rollback:** Immediately refund/void the canary, disable the payment path, preserve webhook/payment references, and leave the public fallback guarded until the path is reviewed again.
- **Evidence link:** [Hosted payments readiness](hosted-payments-readiness.md) and [release evidence](../RELEASE_EVIDENCE.md).

### Phase 8 — Reliability and technical go/no-go

#### 21. Run reliability and rollback tests — `BLOCKED`

- **Owner:** Reliability owner
- **Entry condition:** Items 7, 7.1, and 8–20 passed or have explicit exceptions; monitoring, emergency-stop operator, application rollback deployment, and the list of provider/runtime surfaces activated for this launch are available.
- **Exit proof:** Fault-injection and recovery coverage includes the core planner-to-bridge-to-runtime path plus every provider/runtime surface activated for the current launch, including restart, provider/network failure, lease/callback/idempotency, stale reservation, media overage, offline recovery, and emergency stop. The application rollback to `8b8d429` is verified. Any unactivated provider lane remains blocked and prevents item 22 from passing unless a documented, owner-approved, time-boxed exception is recorded.
- **Approval:** Required — reliability and release owners approve the failure coverage and rollback result.
- **Rollback:** Keep the old application commit available, use forward database fixes only, and leave emergency stop active until recovery is understood.
- **Evidence link:** [Agent operations](../AGENT_OPERATIONS.md), [release evidence](../RELEASE_EVIDENCE.md), and [project status](../PROJECT_STATUS.md).

#### 22. Technical production go/no-go — `BLOCKED`

- **Owner:** Release owner
- **Entry condition:** Items 1–7, 7.1, and 8–21 are `PASSED` or have owner-approved, time-boxed exceptions; monitoring and rollback owners are named.
- **Exit proof:** The final signed checklist records the deployed commit, hosted migration state, provider fingerprints, evidence index, monitoring/rollback owners, exceptions, expiry dates, and a `GO` or `NO GO` decision.
- **Approval:** Required — release owner, database owner, security owner, and platform/provider owners sign the technical decision.
- **Rollback:** A `NO GO` keeps production on the old reference or rolls the application back to `8b8d429`; hosted state remains forward-only.
- **Evidence link:** [Release evidence](../RELEASE_EVIDENCE.md) and [project status](../PROJECT_STATUS.md).

## Appendix — Business proof (not technical launch)

Items 23 and 24 are separate paid-business gates. They do not count as
technical launch evidence and do not authorize hosted, provider, or external
actions.

#### 23. Paid Website Improvement gate — `NOT_STARTED`

- **Owner:** Business owner
- **Entry condition:** The technical launch decision is recorded; one customer has agreed to the $500 scope and delivery boundary.
- **Exit proof:** One paid $500 engagement is scoped, invoiced through the $250/$250 sequence, delivered as one contained fix, and handed off; the outcome is recorded in the business record.
- **Approval:** Required — business owner and customer approve scope and handoff.
- **Rollback:** Preserve the engagement and invoice record; resolve scope/payment issues through the business process rather than deleting launch evidence.
- **Evidence link:** [Roadmap](../ROADMAP.md) and [project status](../PROJECT_STATUS.md).

#### 24. Paid Managed AI Operator gate — `NOT_STARTED`

- **Owner:** Business owner
- **Entry condition:** The technical launch decision is recorded; one customer has accepted the proposal, approval boundary, and 30-day pilot terms.
- **Exit proof:** One paid 30-day pilot completes with four human-led weekly briefs, delivery acknowledgements, outcomes, and any scope changes recorded in the business record.
- **Approval:** Required — business owner and customer approve the pilot scope and final outcome.
- **Rollback:** Preserve the pilot and payment record; stop future work through the agreed business process and do not represent an incomplete pilot as launch proof.
- **Evidence link:** [Roadmap](../ROADMAP.md) and [project status](../PROJECT_STATUS.md).

## Current evidence index

- [Release evidence](../RELEASE_EVIDENCE.md) — current local release-candidate gate and known exceptions.
- [Project status](../PROJECT_STATUS.md) — execution ledger, branch state, migration state, and blockers.
- [Final assembly](../FINAL_ASSEMBLY.md) — provider-free local assembly procedure and evidence boundary.
- [Agent operations](../AGENT_OPERATIONS.md) — planner, bridge, OpenClaw, and approval boundary.
- [Full-stack external setup](full-stack-external-setup.md) — provider and Mac setup notes mapped to checklist items.
- [Google Calendar readiness](google-calendar-readiness.md) — Calendar-specific readiness and rollback details mapped to item 19.
- [Hosted payments readiness](hosted-payments-readiness.md) — payment-specific readiness and rollback details mapped to item 20.
