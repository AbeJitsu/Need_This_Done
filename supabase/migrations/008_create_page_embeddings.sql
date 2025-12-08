-- ============================================================================
-- Migration 008: Create Page Embeddings Table for AI Chatbot
-- ============================================================================
-- What: Stores page content chunks with vector embeddings for semantic search
-- Why: Enables the chatbot to find relevant content based on user questions
-- How: Uses pgvector for efficient similarity search with HNSW indexing

-- ============================================================================
-- Page Embeddings Table
-- ============================================================================
-- Each row represents a chunk of page content with its vector embedding.
-- Long pages are split into multiple chunks for better search accuracy.

CREATE TABLE IF NOT EXISTS page_embeddings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page identification
  page_url TEXT NOT NULL,              -- URL path (e.g., "/services", "/shop/prod_123")
  page_title TEXT NOT NULL,            -- Page title for citations
  page_type TEXT NOT NULL DEFAULT 'static',  -- Type: "static", "cms", "product"

  -- Content and change detection
  content_hash TEXT NOT NULL,          -- SHA-256 hash of full page content
  content_chunk TEXT NOT NULL,         -- Text chunk (max ~6000 chars)
  chunk_index INTEGER NOT NULL DEFAULT 0,  -- Order of chunk within page

  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding vector(1536) NOT NULL,

  -- Additional metadata for context
  metadata JSONB DEFAULT '{}'::jsonb,  -- Extra info (prices, categories, etc.)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Fast lookup by URL (for checking if page is indexed)
CREATE INDEX IF NOT EXISTS page_embeddings_url_idx
  ON page_embeddings(page_url);

-- Fast lookup by hash (for change detection)
CREATE INDEX IF NOT EXISTS page_embeddings_hash_idx
  ON page_embeddings(content_hash);

-- Combined URL + hash index (most common query pattern)
CREATE INDEX IF NOT EXISTS page_embeddings_url_hash_idx
  ON page_embeddings(page_url, content_hash);

-- HNSW index for vector similarity search
-- This makes semantic search fast even with thousands of embeddings
-- Parameters: m=16 (connections per layer), ef_construction=64 (build quality)
CREATE INDEX IF NOT EXISTS page_embeddings_embedding_idx
  ON page_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Public read access: Chatbot needs to search for all visitors
-- Service role write: Only server can add/update embeddings

ALTER TABLE page_embeddings ENABLE ROW LEVEL SECURITY;

-- Everyone can read embeddings (chatbot works for all visitors)
CREATE POLICY "Anyone can read page embeddings"
  ON page_embeddings
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via API routes)
CREATE POLICY "Service role can modify embeddings"
  ON page_embeddings
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Auto-update Trigger for updated_at
-- ============================================================================

CREATE TRIGGER update_page_embeddings_updated_at
  BEFORE UPDATE ON page_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Vector Search Function
-- ============================================================================
-- What: Finds the most similar page chunks to a query embedding
-- Why: Core function for RAG (Retrieval-Augmented Generation)
-- How: Uses cosine similarity with configurable threshold and limit

CREATE OR REPLACE FUNCTION match_page_embeddings(
  query_embedding vector(1536),
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.page_url,
    pe.page_title,
    pe.content_chunk,
    pe.metadata,
    -- Convert distance to similarity (1 - distance = similarity for cosine)
    1 - (pe.embedding <=> query_embedding) as similarity
  FROM page_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION match_page_embeddings IS
  'Performs semantic search on page embeddings using cosine similarity.
   Returns the most relevant page chunks for a given query embedding.
   Used by the AI chatbot for RAG (Retrieval-Augmented Generation).';
