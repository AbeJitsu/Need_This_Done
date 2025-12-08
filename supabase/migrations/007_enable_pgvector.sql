-- ============================================================================
-- Migration 007: Enable pgvector Extension
-- ============================================================================
-- What: Enables the pgvector extension for vector similarity search
-- Why: Required for storing and searching embeddings for the AI chatbot
-- How: PostgreSQL 17 (configured in config.toml) has native pgvector support

-- Enable the vector extension for embedding storage and similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add a comment explaining the extension's purpose
COMMENT ON EXTENSION vector IS 'Vector data type and similarity search functions for AI chatbot embeddings';
