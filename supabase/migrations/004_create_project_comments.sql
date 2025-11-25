-- ============================================================================
-- Create Project Comments Table for Client-Admin Communication
-- ============================================================================
-- Enables back-and-forth conversation between clients and admins on projects.
-- Admins can create internal notes (invisible to clients).
-- Status changes automatically generate comments.

-- ============================================================================
-- Project Comments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Content
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,  -- Internal notes only visible to admins

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Users see public comments on their projects.
-- Admins see all comments including internal notes.

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Users can read non-internal comments on their projects
CREATE POLICY "Users can read own project comments"
  ON project_comments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      -- User can see non-internal comments on their projects
      (
        is_internal = false AND
        project_id IN (
          SELECT id FROM projects WHERE user_id = auth.uid()
        )
      )
      OR
      -- Admins can see all comments on all projects
      COALESCE(
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
        false
      )
    )
  );

-- Only authenticated users can insert comments
CREATE POLICY "Authenticated users can comment"
  ON project_comments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

-- Comments are permanent - no updates or deletes
-- (This ensures audit trail and prevents accidental modification)

-- ============================================================================
-- Indexes
-- ============================================================================
-- Speed up queries for project and user lookups

CREATE INDEX IF NOT EXISTS project_comments_project_id_idx
  ON project_comments(project_id);

CREATE INDEX IF NOT EXISTS project_comments_user_id_idx
  ON project_comments(user_id);

CREATE INDEX IF NOT EXISTS project_comments_created_at_idx
  ON project_comments(created_at DESC);

-- ============================================================================
-- Trigger: Auto-Create Comment on Status Change
-- ============================================================================
-- When a project status is updated, automatically create a comment documenting it

CREATE OR REPLACE FUNCTION create_status_update_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
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

CREATE TRIGGER project_status_change_comment
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_status_update_comment();
