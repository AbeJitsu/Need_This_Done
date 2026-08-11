# NeedThisDone production launch checklist

This is the canonical numbered control document for promoting the reviewed `dev`
release candidate to hosted production. Provider runbooks and setup notes point
to these item numbers; they do not define a second activation order.

**Last reviewed:** 2026-08-11  
**Technical launch decision:** **NOT GO**  
**Business launch decision:** **INCOMPLETE** until items 23 and 24 are complete  
**Current release candidate:** `2cbcb38` (`dev`)  
**Hosted Supabase history:** through `072`  
**Local verification history:** through `092`  
**Immediate application rollback reference:** `8b8d429` (`production`)

## How to use this checklist

Every item is an independent release record. Update the status only when the
evidence, approval, and rollback fields are complete. A technical launch needs
items 1–22 to be `PASSED`, or an explicit owner-approved exception with an owner,
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

## Cutover safeguards

- Keep hosted backup, migration, deployment, secret provisioning, and live provider actions as separate approvals.
- Never reset hosted Supabase or destructively reverse a hosted migration. Hosted rollback is forward-only.
- Use no real customer or prospect recipient during verification.
- Send the only live messages to an owner-controlled mailbox.
- Use only the owner-controlled Calendar and an owner-approved nominal Stripe amount, with immediate refund or void.
- Keep OpenClaw loopback-only and approval-required. It must not send, publish, spend, change accounts, or deliver arbitrary external content.
- Preserve `8b8d429` as the application rollback reference until cutover and post-cutover checks pass.

## Launch items

### 1. Freeze the release candidate — `PASSED`

- **Owner:** Engineering owner
- **Prerequisites:** Clean worktree; exact release SHA recorded; no unresolved required check, or a documented owner-approved exception.
- **Live procedure:** Confirm the reviewed `dev` SHA. Run `ASSEMBLY_PRODUCTION_SERVER=true NEXT_PUBLIC_DASHBOARD_PREVIEW=false npm run verify:assembly:fresh`, `cd bridge && npm test`, and `git diff --check`. Freeze code changes until cutover completes.
- **Evidence:** On 2026-08-11, commit `2cbcb38` passed `ASSEMBLY_PRODUCTION_SERVER=true NEXT_PUBLIC_DASHBOARD_PREVIEW=false npm run verify:assembly:fresh`: local migrations `001`–`092`, schema lint, 214/214 required unit tests, 50/50 accessibility checks, the 49-page production build, schema manifest 7/7, security 14/14, AI-employee RLS 10/10, agent-operations RLS 3/3, planner/OpenClaw RLS 2/2, prospecting RLS 2/2, consultation integration 1/1, retained browser 45 passed with one intentional mobile exclusion, real-session auth 4/4, prospecting 1/1, daily cockpit 1/1, and employee workspace 2/2. `cd bridge && npm test` passed 6/6 and `git diff --check` passed. An unqualified preview-mode invocation was not counted; the documented production-server command is the passing release gate.
- **Approval:** Evidence complete. Release owner must record the freeze/sign-off before item 2 publishes the branch; no code changes are permitted after this release candidate is approved.
- **Rollback:** Unfreeze only through an approved replacement candidate. Keep `8b8d429` untouched as the immediate application rollback reference.

### 2. Push the reviewed `dev` branch — `PENDING_APPROVAL`

- **Owner:** Release owner
- **Prerequisites:** Item 1 passed; the remote target is the intended GitHub repository; branch protection and review state are known.
- **Live procedure:** Push the exact reviewed SHA to `origin/dev`; verify the remote ref resolves to the same SHA with `git ls-remote origin refs/heads/dev`.
- **Evidence:** Record the push result, remote SHA, timestamp, actor, and link to the reviewed commit or CI run.
- **Approval:** Required — release owner authorizes publishing the reviewed branch.
- **Rollback:** Do not force-push. If the branch must be corrected, publish a reviewed replacement commit and record both SHAs; preserve the prior remote ref in the evidence.

### 3. Back up hosted Supabase — `PENDING_APPROVAL`

- **Owner:** Database owner
- **Prerequisites:** Item 1 passed; intended hosted project confirmed; secure backup destination and recovery operator available.
- **Live procedure:** Capture hosted schema, data, roles/grants, Storage bucket metadata/object inventory, and checksums. Verify the files are readable and rehearse the recovery instructions without changing hosted state.
- **Evidence:** Store the backup location outside the repository, SHA-256 checksums, file modes/retention, readability result, recovery runbook, and the old hosted-state reference in the secure release record.
- **Approval:** Required — database owner explicitly approves the backup scope and retention location before any hosted migration.
- **Rollback:** Preserve the backup as the recovery reference. Do not delete or overwrite the old snapshot during a retry.

### 4. Run the hosted migration dry run — `PENDING_APPROVAL`

- **Owner:** Database migration reviewer
- **Prerequisites:** Items 1–3 passed; cloud profile points to the intended Supabase project; backup checksums are recorded.
- **Live procedure:** Review migrations `073`–`092` and run the linked hosted dry run. Classify every statement affecting tables, policies, functions, triggers, constraints, indexes, grants, buckets, and data. Compare the result with the retained local contract and stop on unexplained drift.
- **Evidence:** Retain the dry-run transcript, migration list, statement classification, drift decision, schema/object inventory, and reviewer notes. Do not print credentials.
- **Approval:** Required — migration reviewer and database owner approve the exact `073`–`092` change set.
- **Rollback:** No hosted change has occurred. Repair or replace the migration plan and rerun the dry run; never reset the hosted project.

### 5. Apply migrations `073`–`092` to hosted Supabase — `PENDING_APPROVAL`

- **Owner:** Database owner
- **Prerequisites:** Items 1–4 passed; explicit migration approval; current backup is readable; maintenance/monitoring window is declared.
- **Live procedure:** Apply only the reviewed migrations to the intended hosted project. Record each result and the resulting hosted migration version. Never use hosted `supabase db reset`, broad generated diffs, or a destructive reverse migration.
- **Evidence:** Record the command/result transcript without secrets, hosted migration history through `092`, error/log output, operator, timestamp, and final connection target.
- **Approval:** Required — separate approval for the hosted write, after backup and dry-run approval.
- **Rollback:** Hosted rollback is forward-only. Stop new application traffic if needed, preserve history/data, and use a separately reviewed forward fix; do not delete the migrations or reset the project.

### 6. Prove hosted database parity — `BLOCKED`

- **Owner:** Database and security owners
- **Prerequisites:** Item 5 passed; hosted application credentials and test identities are available; no customer data is used.
- **Live procedure:** Run hosted schema lint/manifest, RLS and tenant-isolation checks, function-grant checks, Storage privacy/size/MIME checks, planner approval/dispatch checks, provenance checks, and emergency-stop/lease/idempotency checks. Confirm Auth and Storage endpoints are the intended project.
- **Evidence:** Retain the hosted test report, schema/object counts, policy/grant results, bucket metadata, endpoint identity, test fixture cleanup, and any approved exception.
- **Approval:** Required — security owner accepts parity and tenant-isolation evidence.
- **Rollback:** Keep hosted history intact. Disable new callers or use a forward repair while preserving audit and test records.

### 7. Fast-forward production to `dev` — `BLOCKED`

- **Owner:** Release/deployment owner
- **Prerequisites:** Items 1–6 passed; `production` is an ancestor of the verified `dev` SHA; deployment target and rollback owner are named.
- **Live procedure:** Move the `production` branch forward to the verified `dev` SHA using the approved repository flow. Deploy that exact SHA to Vercel production and verify the deployment identity before enabling traffic.
- **Evidence:** Record the old and new branch SHAs, ancestry check, PR/deployment URL, Vercel deployment SHA, timestamp, and health result.
- **Approval:** Required — deployment owner approves the fast-forward and exact-commit deployment after hosted parity.
- **Rollback:** Re-deploy `8b8d429` as the application rollback reference if the application fails. Do not roll hosted migrations backward; preserve the forward-only database plan.

### 8. Configure and verify Vercel — `BLOCKED`

- **Owner:** Platform owner
- **Prerequisites:** Items 5–7 approved; server-only secret store access; exact environment scope (production/preview) is documented.
- **Live procedure:** Configure server-only Supabase, Auth, OpenRouter, bridge, provider, webhook, and encryption variables. Verify HTTPS health, protected routes, logs, error reporting, deployment identity, and that no provider key or model ID appears in browser code or source maps.
- **Evidence:** Retain a redacted configuration manifest, deployment URL/SHA, route checks, bundle inspection, log/error-monitoring links, and secret rotation owner. Never place values in Git or this checklist.
- **Approval:** Required — platform owner and security owner approve secret scope and browser/server boundary.
- **Rollback:** Remove or rotate only the affected deployment secrets through the secret manager and redeploy the last known-good application commit. Preserve logs and audit history.

### 9. Run hosted authentication and authorization checks — `BLOCKED`

- **Owner:** Security owner
- **Prerequisites:** Items 6–8 passed; owner, manager, viewer, anonymous, and cross-customer test identities are controlled and disposable.
- **Live procedure:** Verify anonymous denial, owner/manager access, viewer read-only behavior, cross-customer denial, planner approval-before-dispatch, dispatch boundary, prospect review, private Storage access, and emergency controls. Confirm no development authorization bypass is active.
- **Evidence:** Retain sanitized browser/API results, identity/role matrix, route status codes, cleanup record, and production configuration proof.
- **Approval:** Required — security owner signs the authorization matrix.
- **Rollback:** Disable the affected route/feature or redeploy the prior application commit; keep hosted data and audit records for investigation.

### 10. Activate OpenRouter under a hard cost boundary — `BLOCKED`

- **Owner:** AI/provider owner
- **Prerequisites:** Items 6–9 passed; restricted provider key, spend limit, alerting, retention/training settings, and exact current model IDs are reviewed.
- **Live procedure:** Create the restricted key and alerts. Resolve the exact catalog model IDs. Run the sanitized fixed evaluation set and record quality, tool use, latency, cost, failures, and repair rate. Pin the approved primary model only after the threshold and cost caps pass.
- **Evidence:** Retain provider settings, model IDs, evaluation rows/results, cap calculations, alerts, and the approved primary-pin record without exposing the key.
- **Approval:** Required — provider owner approves the key scope, limits, retention/training settings, evaluation result, and primary model.
- **Rollback:** Revoke/rotate the provider key, restore `evaluation-required`, unpin the primary, stop workers, and preserve evaluation/usage records.

### 11. Test the planner live — `BLOCKED`

- **Owner:** Application and AI/provider owners
- **Prerequisites:** Items 8–10 passed; a pinned model is active; authenticated owner session and disposable hosted test profile are available; no external recipient is configured.
- **Live procedure:** Create a plan in the hosted dashboard, edit it, reject it, create/approve a fresh plan, and dispatch it. Verify frozen snapshots, idempotency, selected model identity, estimated cost, approval-before-dispatch, and bridge queue linkage. Add and pass the authenticated browser test covering the complete UI lifecycle before marking this item passed.
- **Evidence:** Retain sanitized plan/run/task IDs, event history, frozen snapshot comparison, usage/cost ledger, browser test output, and cleanup result.
- **Approval:** Required — application owner and security owner approve the live planner lifecycle.
- **Rollback:** Reject/stop test plans, disable the planner route or unpin the model, and preserve plan/event/run history. Do not delete audit records.

### 12. Onboard OpenClaw on the Mac mini — `BLOCKED`

- **Owner:** Mac runtime owner
- **Prerequisites:** Items 10–11 passed; private Mac account, restricted provider profile, and operator approval policy are ready.
- **Live procedure:** Bind the Gateway to loopback only, configure a private provider profile and Gateway token, use cautious approval-required execution, and run `openclaw doctor`. Prove denial of sending, publishing, spending, account changes, arbitrary delivery, and direct browser access.
- **Evidence:** Retain redacted config fingerprints, `openclaw doctor` output, loopback listener check, approval/denial transcripts, and emergency-stop result.
- **Approval:** Required — Mac runtime owner approves the capability and credential boundary.
- **Rollback:** Stop OpenClaw, revoke its token/provider profile, remove test credentials, and leave the bridge disabled. Preserve doctor and denial evidence.

### 13. Install and verify the two launchd processes — `BLOCKED`

- **Owner:** Mac runtime owner
- **Prerequisites:** Items 11–12 passed; bridge API URL/secret, owner ID, worker ID, Gateway URL/token, private artifact root, and launchd manifests are reviewed.
- **Live procedure:** Install the loopback Gateway and signed bridge under launchd. Verify boot, restart, stop, logs, heartbeats, leases, signed callbacks, artifact boundaries, and worker identity. Run one controlled restart without external delivery.
- **Evidence:** Retain redacted launchd manifests, job identifiers, status/log excerpts, heartbeat/lease/callback IDs, artifact-root permissions, and restart results.
- **Approval:** Required — Mac runtime owner and application owner approve daemon installation.
- **Rollback:** Stop and unload both jobs, revoke bridge credentials, remove private runtime state only after evidence retention, and keep hosted queue records for reconciliation.

### 14. Run live safety negatives — `BLOCKED`

- **Owner:** Security owner
- **Prerequisites:** Items 9–13 passed; disposable plan/task identities and emergency-stop operator are ready.
- **Live procedure:** Attempt unapproved claim, direct send, publish, spend, account change, and external delivery. Trigger emergency stop. Verify each unsafe path fails closed and writes durable evidence without a side effect.
- **Evidence:** Retain sanitized request/result matrix, status codes, audit/event IDs, provider-side no-op confirmation, emergency-stop state, and cleanup record.
- **Approval:** Required — security owner accepts the negative-test coverage.
- **Rollback:** Keep the emergency stop active, stop the bridge/Gateway, and investigate before any retry. Preserve all failed-attempt evidence.

### 15. Run one harmless live research task — `BLOCKED`

- **Owner:** Application and Mac runtime owners
- **Prerequisites:** Items 11–14 passed; one public research task, no recipient, and an owner-approved monitoring window are ready.
- **Live procedure:** Create and approve a public research plan in the hosted dashboard. Verify Vercel → hosted Supabase → signed Mac bridge → loopback OpenClaw → callbacks. Confirm progress, usage, cost, lease, completion, and failure records.
- **Evidence:** Retain the plan/run/task/worker IDs, timestamps, callback signatures, usage/cost entries, lease transitions, artifacts, and final review state.
- **Approval:** Required — application and Mac runtime owners approve the harmless task scope.
- **Rollback:** Stop the queue or emergency-stop before retrying, reconcile stale leases/callbacks, and preserve the complete task history.

### 16. Verify artifact and prospect provenance — `BLOCKED`

- **Owner:** Research and security owners
- **Prerequisites:** Item 15 passed; private Storage and review queue are available; no outreach recipient is configured.
- **Live procedure:** Require public HTTPS citations and evidence-backed claims. Verify exact model, worker, run, task, timestamps, and usage. Upload artifacts privately and preview them through signed URLs. Confirm valid research enters `pending_review` and no outreach is automatically created or sent.
- **Evidence:** Retain sanitized citations, provenance rows, artifact/version IDs, signed-URL expiry proof, review status, and no-outreach assertion.
- **Approval:** Required — research owner accepts provenance and review-queue evidence.
- **Rollback:** Revoke signed URLs, stop the worker, leave artifacts in review, and preserve provenance records for correction.

### 17. Test transactional email live — `BLOCKED`

- **Owner:** Email/provider owner
- **Prerequisites:** Items 8–9 passed; restricted Resend credentials, verified sender identity, signed webhook endpoint, and owner-controlled mailbox are ready.
- **Live procedure:** Send one message only to the owner-controlled mailbox. Verify delivery, webhook signature, duplicate handling, failure, and retry behavior. Do not use customer addresses.
- **Evidence:** Retain provider message/event IDs, redacted delivery and webhook results, signature/replay tests, retry record, mailbox receipt, and cleanup/retention decision.
- **Approval:** Required — email owner authorizes the sender, content, mailbox, and one-message canary.
- **Rollback:** Disable or rotate the key, disable the sender route, preserve event/audit history, and leave customer delivery off.

### 18. Test prospecting sender live — `BLOCKED`

- **Owner:** Prospecting/provider owner
- **Prerequisites:** Items 9–10 and 16 passed; separate prospecting key/provider mode, suppression rules, signed event endpoint, and owner-controlled mailbox are ready.
- **Live procedure:** Send one approved message to the owner-controlled mailbox. Verify sender events, bounce/reply handling, suppression, retries, and audit history. Prove the transactional Resend key cannot activate prospecting.
- **Evidence:** Retain message/event IDs, provider-mode fingerprint, suppression/replay results, mailbox receipt, and audit trail. No customer or prospect address may appear.
- **Approval:** Required — prospecting owner approves the separate key, content, mailbox, and canary.
- **Rollback:** Disable prospecting mode, revoke the separate key, preserve sender events/suppression history, and leave the transactional key isolated.

### 19. Test Google OAuth and Calendar live — `BLOCKED`

- **Owner:** Calendar/integration owner
- **Prerequisites:** Items 6–9 passed; Google credentials, server-only `CALENDAR_TOKEN_ENCRYPTION_KEY`, hosted migration `073`, owner-controlled test calendar, and callback configuration are ready. The missing consultation caller and durable event-idempotency reference must be implemented first.
- **Live procedure:** Test sign-in and admin Calendar connection. Create, update, cancel, and delete one owner-controlled test event. Repeat the same confirmation/idempotency key and prove no duplicate event. Verify encrypted tokens, cleanup, and disconnect.
- **Evidence:** Retain OAuth state/callback results, token-encryption proof, calendar event IDs, idempotency/retry result, update/cancel/delete results, and cleanup record.
- **Approval:** Required — Calendar owner approves the Google project, test account/calendar, event content, and cleanup.
- **Rollback:** Disconnect the test account, delete test events, remove the server secret through the secret manager, and keep the manual-calendar path. Never reverse the encrypted-token migration ad hoc.

### 20. Test Stripe live — `BLOCKED`

- **Owner:** Payments owner
- **Prerequisites:** Items 6–9 passed; first offer, price, currency, refund rule, minimal payment references, signed idempotent webhook path, owner-controlled Stripe account, and owner-approved nominal amount are ready.
- **Live procedure:** Use the owner-controlled Stripe account for one controlled canary. Verify success, decline, duplicate webhook, refund/cancellation, signature rejection, and operator visibility. Keep subscriptions, Customer Portal, carts, and legacy orders out of scope.
- **Evidence:** Retain redacted Stripe object/event IDs, webhook signature/idempotency results, payment-reference rows, refund/void confirmation, and operator view. Never store card data.
- **Approval:** Required — payments owner approves the exact offer, nominal amount, test/live mode, refund/void window, and canary.
- **Rollback:** Immediately refund/void the canary, disable the payment path, preserve webhook/payment references, and leave the public fallback guarded until the path is reviewed again.

### 21. Run reliability and rollback tests — `BLOCKED`

- **Owner:** Reliability owner
- **Prerequisites:** Items 7–20 passed or have explicit exceptions; monitoring, emergency-stop operator, and application rollback deployment are available.
- **Live procedure:** Test Mac restart, bridge restart, Gateway/provider failure, network outage, expired lease, duplicate callback, stale reservation, overage, offline recovery, and emergency stop. Verify new claims are blocked when stopped. Deploy and verify application rollback to `8b8d429`; preserve hosted migration history.
- **Evidence:** Retain fault-injection matrix, timestamps, alerts, lease/callback reconciliation, stop-state proof, rollback deployment identity, recovery result, and monitoring links.
- **Approval:** Required — reliability and release owners approve the failure coverage and rollback result.
- **Rollback:** Keep the old application commit available, use forward database fixes only, and leave emergency stop active until recovery is understood.

### 22. Technical production go/no-go — `BLOCKED`

- **Owner:** Release owner
- **Prerequisites:** Items 1–21 are `PASSED` or have owner-approved, time-boxed exceptions; monitoring and rollback owners are named.
- **Live procedure:** Record the deployed commit, hosted migration state, provider configuration fingerprints, evidence links, monitoring owner, rollback owner, exceptions, and expiry dates. Decide `GO` or `NO GO` in this checklist and update release evidence/status documents.
- **Evidence:** Final signed checklist, deployment/hosted/provider evidence index, exception register, and post-cutover health snapshot.
- **Approval:** Required — release owner, database owner, security owner, and platform/provider owners sign the technical decision.
- **Rollback:** A `NO GO` keeps production on the old reference or rolls the application back to `8b8d429`; hosted state remains forward-only.

### 23. Paid Website Improvement gate — `NOT_STARTED`

- **Owner:** Business owner
- **Prerequisites:** Technical launch decision is recorded; one customer has agreed to the $500 scope and delivery boundary.
- **Live procedure:** Complete one paid $500 engagement, issue the $250/$250 invoice sequence, deliver one contained fix, and complete the handoff.
- **Evidence:** Store the scope, invoice/payment confirmation, before/after evidence, delivery date, handoff, and outcome in the business record. Do not infer completion from code or technical launch.
- **Approval:** Required — business owner and customer approve scope and handoff.
- **Rollback:** Preserve the engagement and invoice record; resolve scope/payment issues through the business process rather than deleting launch evidence.

### 24. Paid Managed AI Operator gate — `NOT_STARTED`

- **Owner:** Business owner
- **Prerequisites:** Technical launch decision is recorded; one customer has accepted the proposal, approval boundary, and 30-day pilot terms.
- **Live procedure:** Complete one paid 30-day pilot, provide four human-led weekly briefs, and record outcomes and any scope changes.
- **Evidence:** Store the proposal, payment record, approval boundary, four dated briefs, delivery acknowledgements, and outcome summary in the business record.
- **Approval:** Required — business owner and customer approve the pilot scope and final outcome.
- **Rollback:** Preserve the pilot and payment record; stop future work through the agreed business process and do not represent an incomplete pilot as launch proof.

## Current evidence index

- [Release evidence](../RELEASE_EVIDENCE.md) — current local release-candidate gate and known exceptions.
- [Project status](../PROJECT_STATUS.md) — execution ledger, branch state, migration state, and blockers.
- [Final assembly](../FINAL_ASSEMBLY.md) — provider-free local assembly procedure and evidence boundary.
- [Agent operations](../AGENT_OPERATIONS.md) — planner, bridge, OpenClaw, and approval boundary.
- [Full-stack external setup](full-stack-external-setup.md) — provider and Mac setup notes mapped to checklist items.
- [Google Calendar readiness](google-calendar-readiness.md) — Calendar-specific readiness and rollback details mapped to item 19.
- [Hosted payments readiness](hosted-payments-readiness.md) — payment-specific readiness and rollback details mapped to item 20.
