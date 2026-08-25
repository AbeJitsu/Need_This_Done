# NeedThisDone — Release Evidence

**Last updated:** 2026-08-25

| Claim | Status | Evidence / boundary |
| --- | --- | --- |
| Public Website Fix and Managed Automation pages | Existing scope | Not revalidated by this repository cleanup. |
| Vision, system-map documentation, and script-owned migration configuration | Focused checks passed | `git diff --check`, staged-migration verification, type-check, lint, and focused public-journey, private-boundary, and capability-manifest tests passed on 2026-08-24. This remains a local repository change only. |
| OpenRouter provider routing policy | Focused test passed | The server-owned privacy/routing policy merges into request payloads and structured/tool requests force `require_parameters`; no provider request or model activation occurred. |
| Daily Desk work | Retired from active source | Its code, routes, and pending migration entries were removed through reviewed Git reverts. Prior checkpoint commits remain recoverable in Git history; no hosted rollback was performed. |
| Codex project integration | Focused local checks passed | The relocated lifecycle hooks pass shell and JSON/path checks; tracked Claude configuration and workflows are absent; type-check and `git diff --check` passed on 2026-08-25. `codex doctor` loaded this project configuration but reported an unrelated local-runtime state warning, which is not a product or release claim. |
| Hosted migrations | Not claimable | No hosted write is part of this work. |
| Deployment, secrets, Mac activation, provider activation | Not claimable | Each needs separate owner approval. |
| External messages, publication, spend, customer outcome | Not claimable | No external action is part of this work. |

Local tests, disposable local Supabase, and provider doubles are not hosted or
customer proof. Record a claim here only after its exact validation is run.
