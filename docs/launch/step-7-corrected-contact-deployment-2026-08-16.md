# Corrected contact deployment — 2026-08-16

This record closes the corrected application cutover for launch checklist
items 7 and 7.1. It does not authorize environment-variable provisioning,
provider activation, hosted migration, payment, or external delivery.

## Exact release

- Verified candidate: `e363a5f74ff8ad731272089f8714bd81edb97d3d`
- `origin/dev`: exact SHA verified with `git ls-remote`
- `origin/production`: fast-forwarded from `b981f49` to the verified candidate
- Application rollback reference: `8b8d429`
- Vercel deployment: `dpl_GVMHoCVSKiMgy2nse84zKs1cXafc`
- Deployment URL: `https://app-m3bsrt3t0-vision2virtual.vercel.app`
- Production alias: `https://needthisdone.com`
- Vercel result: `READY`, target `production`, 49 generated pages

## Post-deployment checks

- `/api/health`: `200`, with Redis, Supabase, and app all reported `up`
- `/`, `/contact`, and `/services`: `200`
- Anonymous `POST /api/agent-plans`: `401`
- Anonymous `POST /api/agent-bridge/claim`: `401`
- Contact browser contract: 6/6 across desktop and mobile, including both
  offers and the heading geometry assertion
- Retained contact offer-switching contract: 2/2 across desktop and mobile
- Browser bundle scan: 15 contact scripts; no server-only environment names,
  provider-key shapes, model-ID patterns, or source-map URLs

The deployment contains the responsive contact-panel spacing repair and the
browser/server Supabase boundary repair. No Vercel environment values,
provider settings, hosted database state, payment state, or customer data was
changed during this cutover.

## Rollback

If the corrected application fails before the remaining launch controls pass,
redeploy `8b8d429` or another reviewed replacement. Preserve hosted migration
history and use forward-only database repair; do not reset or reverse hosted
Supabase state.
