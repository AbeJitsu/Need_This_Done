-- ============================================================================
-- Migration: Create Product Images Storage Bucket
-- ============================================================================
-- Creates a public storage bucket for product images with appropriate RLS policies
-- This allows consultation product images to be stored and served publicly

-- Create the storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- Public bucket so images can be accessed via URL
  5242880,  -- 5 MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS Policies for Product Images
-- ============================================================================

-- Policy 1: Allow public read access to all images in product-images bucket
-- This lets anyone view product images (needed for shop page)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Policy 2: Allow authenticated users to upload images
-- This lets admin users upload new product images via the dashboard
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy 3: Allow authenticated users to update images
-- This lets admin users replace existing product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Policy 4: Allow authenticated users to delete images
-- This lets admin users remove old product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ============================================================================
-- Verification Query (commented out - for manual testing only)
-- ============================================================================
-- To verify the bucket was created successfully, run:
-- SELECT * FROM storage.buckets WHERE id = 'product-images';
--
-- To verify policies were created, run:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%product images%';
