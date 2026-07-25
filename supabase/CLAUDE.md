# Supabase Database Instructions

Supabase supports the retained NeedThisDone product: authentication, leads, projects, client collaboration, blog content, site reports, appointments, and storage.

```text
Supabase
  |- Users and roles
  |- Leads and projects
  |- Comments and shared files
  |- Blog and site reports
  `- Appointments

Stripe
  `- Payment and subscription truth

Application
  `- Links projects and clients
     to Stripe references
```

Supabase manages collaboration data; Stripe manages money.

## Safety rules

1. Treat migrations as production-impacting changes.
2. Do not drop tables, storage buckets, or policies until all application callers are removed and the migration is separately reviewed.
3. Enable RLS on every PostgREST-exposed table.
4. Client data must be scoped by authenticated ownership; owner/admin access must use the established admin-role check.
5. Do not expose site reports, files, payment details, or project comments through anonymous broad-read policies.

## Local workflow

```bash
supabase start
supabase db reset
supabase db lint
```

## Migration conventions

- Use the next zero-padded migration number and a descriptive snake-case name.
- Explain purpose, impact, data handling, verification, and rollback notes in the migration comments.
- Prefer additive migrations. Schema deletion belongs in a later dedicated cleanup migration after application removal is validated.
- Every policy must enforce a real access condition; never use user-editable JWT metadata as an authorization source.
