-- ============================================================================
-- Create Pages Table for Puck CMS Content
-- ============================================================================
-- Stores page configurations and content from Puck visual editor.
-- Each page has a unique slug, JSON content, and publication status.

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page Identity
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,

  -- Puck Content (JSON configuration from editor)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Publication Status
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Ownership
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can read published pages"
  ON pages
  FOR SELECT
  USING (is_published = true);

-- Authenticated users can read all pages (for preview)
CREATE POLICY "Authenticated users can read all pages"
  ON pages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete pages
CREATE POLICY "Only admins can insert pages"
  ON pages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can update pages"
  ON pages
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can delete pages"
  ON pages
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_is_published_idx ON pages(is_published);
CREATE INDEX IF NOT EXISTS pages_created_at_idx ON pages(created_at DESC);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when is_published changes to true
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = now();
  ELSIF NEW.is_published = false THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_set_published_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();
