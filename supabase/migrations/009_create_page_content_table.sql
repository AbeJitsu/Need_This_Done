-- ============================================================================
-- Create Page Content Table for Hybrid CMS
-- ============================================================================
-- Stores editable content for marketing pages (pricing, faq, services, etc.)
-- Content is edited via Puck but rendered within code-defined page structures.
-- This allows non-technical users to update text, colors, and content items
-- without touching the page layout or code.

CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page Identifier (matches route: 'pricing', 'faq', 'services', etc.)
  page_slug TEXT NOT NULL UNIQUE,

  -- Content Type (determines expected JSON structure)
  content_type TEXT NOT NULL,

  -- Editable Content (JSON structure varies by content_type)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Ownership & Audit
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public can read all page content (needed for server-side rendering)
CREATE POLICY "Public can read page content"
  ON page_content
  FOR SELECT
  USING (true);

-- Only admins can create page content
CREATE POLICY "Only admins can insert page content"
  ON page_content
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- Only admins can update page content
CREATE POLICY "Only admins can update page content"
  ON page_content
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- Only admins can delete page content
CREATE POLICY "Only admins can delete page content"
  ON page_content
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS page_content_slug_idx ON page_content(page_slug);
CREATE INDEX IF NOT EXISTS page_content_type_idx ON page_content(content_type);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp (reuses existing function from earlier migrations)
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE page_content IS 'Stores editable content for marketing pages, edited via Puck visual editor';
COMMENT ON COLUMN page_content.page_slug IS 'URL slug matching the page route (e.g., pricing, faq, services)';
COMMENT ON COLUMN page_content.content_type IS 'Type identifier that determines the expected JSON structure (e.g., pricing_page, faq_page)';
COMMENT ON COLUMN page_content.content IS 'JSON content edited through Puck, structure varies by content_type';
