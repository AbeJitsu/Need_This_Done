-- ============================================================================
-- Create Page Content History Table
-- ============================================================================
-- Stores version history for page content so clients can revert changes.
-- Every time content is saved, the previous version is stored here first.
-- Similar to Google Docs revision history.

CREATE TABLE IF NOT EXISTS page_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the page_content record
  page_content_id UUID NOT NULL REFERENCES page_content(id) ON DELETE CASCADE,

  -- Page Identifier (denormalized for faster queries)
  page_slug TEXT NOT NULL,

  -- The content at this point in time
  content JSONB NOT NULL,

  -- Who made the change (null if record was created before this migration)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- When this version was saved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Optional note (e.g., "Before edit", "Restored from version X")
  version_note TEXT
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE page_content_history ENABLE ROW LEVEL SECURITY;

-- Only admins can read version history
CREATE POLICY "Only admins can read page content history"
  ON page_content_history
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- Only the system (via admin client) can insert history records
-- Users don't insert directly - the API does this automatically on save
CREATE POLICY "Only admins can insert page content history"
  ON page_content_history
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- Admins can delete old history if needed
CREATE POLICY "Only admins can delete page content history"
  ON page_content_history
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes
-- ============================================================================

-- Fast lookup by page_content_id (most common query)
CREATE INDEX IF NOT EXISTS page_content_history_content_id_idx
  ON page_content_history(page_content_id);

-- Fast lookup by page_slug (for direct queries)
CREATE INDEX IF NOT EXISTS page_content_history_slug_idx
  ON page_content_history(page_slug);

-- Ordering by created_at (for showing most recent first)
CREATE INDEX IF NOT EXISTS page_content_history_created_at_idx
  ON page_content_history(page_content_id, created_at DESC);

-- ============================================================================
-- Function: Cleanup old versions (keep last 20 per page)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_page_content_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  version_count INTEGER;
  versions_to_delete UUID[];
BEGIN
  -- Count versions for this page
  SELECT COUNT(*) INTO version_count
  FROM page_content_history
  WHERE page_content_id = NEW.page_content_id;

  -- If more than 20 versions, delete oldest
  IF version_count > 20 THEN
    SELECT ARRAY_AGG(id) INTO versions_to_delete
    FROM (
      SELECT id
      FROM page_content_history
      WHERE page_content_id = NEW.page_content_id
      ORDER BY created_at ASC
      LIMIT version_count - 20
    ) old_versions;

    DELETE FROM page_content_history
    WHERE id = ANY(versions_to_delete);
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to cleanup after each insert
CREATE TRIGGER cleanup_old_page_content_versions
  AFTER INSERT ON page_content_history
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_page_content_history();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE page_content_history IS 'Version history for page content, enabling revert functionality like Google Docs';
COMMENT ON COLUMN page_content_history.page_content_id IS 'Reference to the parent page_content record';
COMMENT ON COLUMN page_content_history.page_slug IS 'Denormalized page slug for faster queries';
COMMENT ON COLUMN page_content_history.content IS 'The complete content JSON at this point in time';
COMMENT ON COLUMN page_content_history.created_by IS 'User who made this version (who was editing when this was saved)';
COMMENT ON COLUMN page_content_history.version_note IS 'Optional note like "Restored from Dec 30 version"';
