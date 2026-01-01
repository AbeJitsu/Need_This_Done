-- ============================================================================
-- Create Changelog Entries Table
-- ============================================================================
-- Stores public changelog entries for the /changelog page.
-- Enables daily automatic updates via cron job.

CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entry identification
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,

  -- Metadata
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'Public',

  -- Content
  description TEXT,
  benefit TEXT,
  changes JSONB DEFAULT '[]'::jsonb,
  how_to_use JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,

  -- Processing status (for auto-completion)
  needs_completion BOOLEAN DEFAULT false,
  git_context TEXT,
  affected_routes JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read changelog entries (public page)
CREATE POLICY "Anyone can read changelog entries"
  ON changelog_entries
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can insert changelog entries"
  ON changelog_entries
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can update changelog entries"
  ON changelog_entries
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can delete changelog entries"
  ON changelog_entries
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes
-- ============================================================================

-- Fast lookup by slug
CREATE INDEX IF NOT EXISTS changelog_entries_slug_idx ON changelog_entries(slug);

-- Fast ordering by date (most recent first)
CREATE INDEX IF NOT EXISTS changelog_entries_date_idx ON changelog_entries(date DESC);

-- Find entries needing completion
CREATE INDEX IF NOT EXISTS changelog_entries_needs_completion_idx
  ON changelog_entries(needs_completion) WHERE needs_completion = true;

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_changelog_entries_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER changelog_entries_updated_at
  BEFORE UPDATE ON changelog_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_changelog_entries_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE changelog_entries IS 'Public changelog entries displayed on /changelog';
COMMENT ON COLUMN changelog_entries.slug IS 'URL-friendly identifier for the entry';
COMMENT ON COLUMN changelog_entries.changes IS 'Array of {what, why, where} objects';
COMMENT ON COLUMN changelog_entries.how_to_use IS 'Array of instruction strings';
COMMENT ON COLUMN changelog_entries.needs_completion IS 'True if entry needs auto-completion by cron';
COMMENT ON COLUMN changelog_entries.git_context IS 'Git diff/commit info for auto-completion';
COMMENT ON COLUMN changelog_entries.affected_routes IS 'Routes affected by changes';
