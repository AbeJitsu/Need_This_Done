-- ============================================================================
-- Fix Status Comment Trigger for Service Role Operations
-- ============================================================================
-- The original trigger used auth.uid() which returns NULL when updates are
-- made via service role (admin operations). This caused NOT NULL violations
-- on the user_id column.
--
-- This fix modifies the trigger to only create comments when auth.uid() is
-- available (user-initiated updates via RLS). Admin operations will create
-- comments explicitly via the API route instead.

-- ============================================================================
-- Drop and Recreate the Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION create_status_update_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create comment if there's an authenticated user context
  -- Service role operations (auth.uid() = NULL) will handle comments via API
  IF NEW.status != OLD.status AND auth.uid() IS NOT NULL THEN
    INSERT INTO project_comments (project_id, user_id, content, is_internal, created_at)
    VALUES (
      NEW.id,
      auth.uid(),
      'Status updated to: ' || NEW.status,
      false,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger itself (project_status_change_comment) doesn't need to be
-- recreated since we're only modifying the function it calls.
