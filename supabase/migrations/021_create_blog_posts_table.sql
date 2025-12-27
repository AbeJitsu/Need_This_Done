-- ============================================================================
-- Create Blog Posts Table for Content Management
-- ============================================================================
-- Stores blog posts with metadata for the blog content system.
-- Designed for easy content repurposing from LinkedIn and other sources.
-- Follows the same patterns as the pages table for consistency.

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Post Identity
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,

  -- Content
  excerpt TEXT, -- Short summary for listings (can be LinkedIn post length)
  content TEXT NOT NULL, -- Full blog content (markdown or plain text)

  -- Optional Puck content for rich layouts (future enhancement)
  puck_content JSONB,

  -- Media
  featured_image TEXT, -- URL to featured image

  -- Categorization
  tags TEXT[] DEFAULT '{}', -- Array of tag strings
  category TEXT, -- Primary category (e.g., 'tips', 'case-study', 'news')

  -- Publication Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,

  -- SEO (optional)
  meta_title TEXT, -- Override title for SEO
  meta_description TEXT, -- Override description for SEO

  -- Source tracking (where the content originated)
  source TEXT, -- e.g., 'linkedin', 'original', 'newsletter'
  source_url TEXT, -- Link to original if applicable

  -- Ownership
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT, -- Denormalized for display

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all posts (for preview)
CREATE POLICY "Authenticated users can read all blog posts"
  ON blog_posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete posts
CREATE POLICY "Only admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

CREATE POLICY "Only admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category);
CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at DESC);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_blog_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_set_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_published_at();

-- Also set published_at on insert if status is published
CREATE OR REPLACE FUNCTION set_blog_published_at_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_set_published_at_on_insert
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_published_at_on_insert();
