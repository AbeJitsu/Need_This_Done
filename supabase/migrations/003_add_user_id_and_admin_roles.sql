-- ============================================================================
-- Add user_id Column and Admin Role System to Projects Table
-- ============================================================================
-- Links projects to authenticated users and implements role-based access control.
-- Admin users (marked in user metadata) can see all projects.
-- Regular users can only see their own projects.

-- ============================================================================
-- Add user_id Column
-- ============================================================================
-- Links each project to the user who submitted it. NULL for guest submissions.

ALTER TABLE projects
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================================
-- Create Helper Function for Admin Check
-- ============================================================================
-- Checks if current user is marked as admin in their metadata

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Backfill Existing Projects
-- ============================================================================
-- Set user_id to NULL for existing projects (they were guest submissions)
-- This is safe because they came through the contact form before user_id existed

UPDATE projects SET user_id = NULL WHERE user_id IS NULL;

-- ============================================================================
-- Update RLS Policies
-- ============================================================================
-- Drop old permissive policies and replace with proper user/admin separation

DROP POLICY IF EXISTS "Allow authenticated read" ON projects;
DROP POLICY IF EXISTS "Allow authenticated update" ON projects;

-- Authenticated users can read only their own projects OR all if admin
CREATE POLICY "Users can read own projects, admins read all"
  ON projects
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR is_admin()
    )
  );

-- Authenticated users can update only their own projects OR all if admin
CREATE POLICY "Users can update own projects, admins update all"
  ON projects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR is_admin()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR is_admin()
    )
  );

-- Only admins can delete projects
CREATE POLICY "Only admins can delete"
  ON projects
  FOR DELETE
  USING (auth.role() = 'authenticated' AND is_admin());

-- ============================================================================
-- Index for user_id Performance
-- ============================================================================
-- Speed up queries filtering by user_id

CREATE INDEX IF NOT EXISTS projects_user_id_idx
  ON projects(user_id);
