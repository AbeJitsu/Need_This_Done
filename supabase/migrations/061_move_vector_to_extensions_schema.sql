-- ============================================================================
-- Move pgvector Extension from Public to Extensions Schema
-- ============================================================================
-- What: Move vector extension to extensions schema to eliminate linter warning
-- Why: Supabase Security Advisor flags extensions in public schema
-- How: Drop dependent objects, move extension, recreate with schema-qualified refs
-- ============================================================================

-- ============================================================================
-- Step 1: Ensure extensions schema exists with proper grants
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- ============================================================================
-- Step 2: Drop dependent objects (reverse dependency order)
-- ============================================================================

-- 2a. Drop the match_page_embeddings function (depends on vector type)
DROP FUNCTION IF EXISTS public.match_page_embeddings(vector, float, int);

-- 2b. Drop the HNSW index (depends on vector_cosine_ops operator class)
DROP INDEX IF EXISTS public.page_embeddings_embedding_idx;

-- ============================================================================
-- Step 3: Move the extension
-- ============================================================================
-- ALTER EXTENSION ... SET SCHEMA moves all extension objects (types, operators,
-- operator classes, casts) to the new schema in one atomic operation.
ALTER EXTENSION vector SET SCHEMA extensions;

-- ============================================================================
-- Step 4: Recreate the HNSW index
-- ============================================================================
-- The column type stays as-is (the underlying type OID doesn't change),
-- but the operator class must now be schema-qualified.
CREATE INDEX page_embeddings_embedding_idx
  ON public.page_embeddings
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- Step 5: Recreate match_page_embeddings function
-- ============================================================================
-- Key changes:
--   - Parameter type: extensions.vector(1536) instead of vector(1536)
--   - SET search_path includes extensions so <=> operator resolves
--   - Empty string '' would hide the operator; we need 'extensions, public'
CREATE OR REPLACE FUNCTION public.match_page_embeddings(
  query_embedding extensions.vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  page_url text,
  page_title text,
  content_chunk text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SET search_path TO 'extensions', 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.page_url,
    pe.page_title,
    pe.content_chunk,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) as similarity
  FROM public.page_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.match_page_embeddings IS
  'Performs semantic search on page embeddings using cosine similarity.
   Returns the most relevant page chunks for a given query embedding.
   Used by the AI chatbot for RAG (Retrieval-Augmented Generation).';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying:
-- 1. supabase db lint → 0 errors, 0 warnings (except leaked password)
-- 2. Test chatbot embedding search still works
-- 3. SELECT * FROM match_page_embeddings('[0.1,0.2,...]'::extensions.vector, 0.5, 3);
