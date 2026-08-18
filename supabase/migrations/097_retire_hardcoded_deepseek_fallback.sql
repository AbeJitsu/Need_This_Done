-- Retire the nonexistent hardcoded DeepSeek free fallback.
--
-- Current OpenRouter catalog evidence contains paid DeepSeek model IDs but no
-- `deepseek/deepseek-v4-flash:free`. Backup configuration is server-only via
-- OPENROUTER_BACKUP_MODEL and remains an evidence-only probe boundary.
--
-- Data handling: deactivate any historical fallback benchmark candidate and
-- fail closed to evaluation-required for a profile that retained the retired
-- route. Preserve evaluation and usage evidence. Rollback is forward-only:
-- restore a route only through a reviewed migration using a current exact
-- environment-configured model ID.

update public.model_benchmark_candidates
set is_active = false,
    updated_at = now()
where candidate_kind = 'deepseek-fallback'
  and is_active;

update public.growth_profiles
set model_route = 'evaluation-required',
    selected_model_id = null,
    selected_model_rationale = '',
    model_selected_at = null,
    updated_at = now()
where model_route = 'selected-deepseek-fallback';

alter table public.growth_profiles
  drop constraint if exists growth_profiles_selected_model_check;

alter table public.growth_profiles
  add constraint growth_profiles_selected_model_check
  check (
    (model_route = 'evaluation-required' and selected_model_id is null)
    or (
      model_route in ('selected-primary', 'selected-free')
      and nullif(trim(selected_model_id), '') is not null
      and trim(selected_model_id) <> 'openrouter/free'
      and nullif(trim(selected_model_rationale), '') is not null
    )
  );
