# Repository Instructions

NeedThisDone is being simplified into a lead-generation, project-delivery, and client-collaboration product.

## Product boundaries

- Keep: marketing content, blog, site analyzer, lead/project/appointment workflows, client portal, and Stripe-hosted payments.
- Retire: Medusa/Railway ecommerce, carts, inventory, LMS, inline/page editing, workflow automation, and dark mode.
- Do not extend a retired system. Remove it in a focused, tested slice instead.

## Working rules

1. Read `docs/PROJECT_STATUS.md` and the relevant audit before changing a subsystem.
2. Work on `dev`; do not alter `production` without explicit approval.
3. Make one coherent change per commit and record validation plus rollback notes in the project tracker.
4. Keep production code warning-free and run appropriate tests before committing.
5. Do not apply destructive Supabase migrations until callers are gone and the migration is separately reviewed.

## Common commands

```bash
cd app && npm run dev
cd app && npm run type-check
cd app && npm run test:unit
cd app && npm run build
```

After `npm run build`, restart the dev server because `.next` is replaced.
