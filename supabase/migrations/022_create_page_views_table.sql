-- ============================================================================
-- Create Page Views Table for Analytics
-- ============================================================================
-- Tracks page views for Puck CMS pages to provide analytics insights.
-- Stores individual view events with timestamps for trend analysis.

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page Reference
  page_slug TEXT NOT NULL,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  -- View Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,  -- Anonymous session identifier
  referrer TEXT,
  user_agent TEXT,

  -- Timestamps
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views (anonymous tracking)
CREATE POLICY "Anyone can insert page views"
  ON page_views
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read page views
CREATE POLICY "Only admins can read page views"
  ON page_views
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS page_views_page_slug_idx ON page_views(page_slug);
CREATE INDEX IF NOT EXISTS page_views_viewed_at_idx ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS page_views_page_slug_viewed_at_idx ON page_views(page_slug, viewed_at DESC);

-- ============================================================================
-- Aggregation View for Quick Stats
-- ============================================================================

CREATE OR REPLACE VIEW page_view_stats AS
SELECT
  page_slug,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as authenticated_views,
  MAX(viewed_at) as last_viewed_at,
  MIN(viewed_at) as first_viewed_at
FROM page_views
GROUP BY page_slug
ORDER BY total_views DESC;
