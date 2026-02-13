-- ============================================================================
-- Fix Appointment Admin Policies to Use is_admin()
-- ============================================================================
-- What: Replace user_metadata JWT checks with is_admin() on 3 appointment tables
-- Why: user_metadata is user-editable and insecure (Supabase linter rule rls_references_user_metadata)
-- Impact: None — same behavior, more secure implementation
-- Note: Wrapped in DO blocks because these tables may not exist in all environments
-- ============================================================================

DO $$
BEGIN
  -- 1. appointment_requests
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname = 'appointment_requests') THEN
    DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointment_requests;
    CREATE POLICY "Admins can manage all appointments"
      ON public.appointment_requests
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- 2. appointment_reminders
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname = 'appointment_reminders') THEN
    DROP POLICY IF EXISTS "Admins can view all reminders" ON public.appointment_reminders;
    CREATE POLICY "Admins can view all reminders"
      ON public.appointment_reminders
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- 3. appointment_notification_log
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname = 'appointment_notification_log') THEN
    DROP POLICY IF EXISTS "Admins can view notification logs" ON public.appointment_notification_log;
    CREATE POLICY "Admins can view notification logs"
      ON public.appointment_notification_log
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying: supabase db lint should still show 0 errors
-- No policies should reference user_metadata:
--   SELECT c.relname, p.polname
--   FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
--   JOIN pg_namespace n ON c.relnamespace = n.oid
--   WHERE n.nspname = 'public'
--     AND pg_get_expr(p.polqual, p.polrelid) LIKE '%user_metadata%';
--   Expected: 0 rows
