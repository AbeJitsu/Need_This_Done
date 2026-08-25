-- Correct the additive Daily Desk private-SVG path check introduced in 107.
-- The first expression over-escaped the dot for PostgreSQL's regex engine.
-- This forward-only fix keeps all existing paths and still accepts only the
-- deterministic owner/asset/version SVG layout.

alter table public.daily_desk_social_asset_versions
  drop constraint daily_desk_social_asset_versions_storage_path_check;

alter table public.daily_desk_social_asset_versions
  add constraint daily_desk_social_asset_versions_storage_path_check
  check (storage_path ~ '^daily-desk/[0-9a-f-]+/[0-9a-f-]+/[0-9a-f-]+[.]svg$');
