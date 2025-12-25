-- ============================================================================
-- Media Library Storage Bucket
-- ============================================================================
-- Purpose: Central media storage for the Puck page builder
-- Supports: Images for pages, products, and general content

-- Create the media-library bucket (public access for serving images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-library',
  'media-library',
  true,
  10485760, -- 10MB limit (larger for high-quality images)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Public read access (anyone can view images for published pages)
CREATE POLICY "Public can view media library images"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-library');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-library'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-library'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete media
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-library'
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- Media Metadata Table
-- ============================================================================
-- Stores metadata about uploaded media for search and organization

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  folder TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read for media metadata
CREATE POLICY "Anyone can view media metadata"
ON media FOR SELECT
USING (true);

-- Authenticated users can insert media metadata
CREATE POLICY "Authenticated users can insert media metadata"
ON media FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update media metadata
CREATE POLICY "Authenticated users can update media metadata"
ON media FOR UPDATE
USING (auth.role() = 'authenticated');

-- Authenticated users can delete media metadata
CREATE POLICY "Authenticated users can delete media metadata"
ON media FOR DELETE
USING (auth.role() = 'authenticated');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_media_updated_at ON media;
CREATE TRIGGER trigger_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();
