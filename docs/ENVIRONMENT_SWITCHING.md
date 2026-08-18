# Safe environment switching

The app reads one active root `.env.local`, and `app/.env.local` remains a symlink to it. Credentials live in two ignored profiles so local and hosted Supabase values cannot be mixed accidentally:

- `.env.local.profile` targets disposable Supabase at `http://127.0.0.1:54321`.
- `.env.cloud.profile` targets the approved hosted development project at `https://oxhjtmozsdstbokwtnwa.supabase.co`.

Production is intentionally not a switcher target. It needs its own migration and release approvals.

## Switch targets

From the repository root:

```bash
npm run env:local
npm run env:cloud
npm run env:cloud:dry-run
```

The switcher checks that the profile exists, contains `ENV_TARGET`, uses the exact approved URL, and has both Supabase keys. It does not print keys. `--dry-run` validates the cloud profile without changing the active link or contacting Supabase.

## Create or refresh profiles

For local Supabase, start the disposable stack and copy the API URL, anon key, and service-role key from:

```bash
supabase start
supabase status
```

Put those values in `.env.local.profile` with `ENV_TARGET=local` and `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`. Obtain hosted development values from the approved Supabase project's API settings and put them in `.env.cloud.profile` with `ENV_TARGET=cloud`. Keep both files mode `600` when they contain credentials.

If the private OpenRouter worker is configured, keep
`OPENROUTER_PRIMARY_MODEL`, `OPENROUTER_TEST_MODEL`, and the optional
`OPENROUTER_BACKUP_MODEL` in the active root profile as private variables.
The isolated Mac worker still needs the same values in its own chmod-600
`--env-file`. `openrouter/free` is allowed only in the backup variable for the
approval-gated two-request probe; it is never a pinned worker model.

Do not edit `app/.env.local`; it must stay linked to the root active environment. Do not commit either profile. The repository ignores `.env.*.profile`.

## Database safety

`npm run verify:database` is the one-command local database gate. It selects `ENV_TARGET=local`, runs local schema lint, and runs all retained security, RLS, planner/OpenClaw, prospecting, and consultation persistence checks against disposable local Supabase. For a fresh database, run `supabase db reset --local` first, then run the gate. Hosted checks require separate, explicitly named commands and a review of their target before they run. Never point a reset, migration, or destructive test at the hosted project.

## Recovery

If a profile is missing or malformed, the switcher fails without changing `.env.local`. Recreate the profile from `supabase status` or the hosted project's API settings, then rerun the switch command. To return to the safe default after any hosted inspection, run `npm run env:local`.
