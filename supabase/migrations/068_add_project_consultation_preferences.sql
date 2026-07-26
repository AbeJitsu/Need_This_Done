-- Preserve consultation intent submitted with a project inquiry. These fields
-- are lead context only and intentionally do not create an appointment.
alter table public.projects
  add column if not exists consultation_type text,
  add column if not exists preferred_consultation_at timestamptz,
  add column if not exists alternate_consultation_at timestamptz;

alter table public.projects
  add constraint projects_consultation_type_check
    check (consultation_type is null or consultation_type in ('quick', 'strategy', 'deep-dive')),
  add constraint projects_consultation_preference_check
    check (alternate_consultation_at is null or preferred_consultation_at is not null);
