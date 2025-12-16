-- ============================================================================
-- Medusa Schema Setup for Railway Migration
-- ============================================================================
-- Creates a separate schema for Medusa e-commerce tables to avoid conflicts
-- with main app tables in the public schema.
--
-- Why separate schema:
-- - Medusa manages its own migrations
-- - Prevents table name collisions
-- - Enables independent scaling and debugging
-- - Cleaner database organization

-- Create medusa schema
CREATE SCHEMA IF NOT EXISTS medusa;

-- Grant permissions to all relevant roles
GRANT ALL ON SCHEMA medusa TO postgres;
GRANT ALL ON SCHEMA medusa TO authenticated;
GRANT ALL ON SCHEMA medusa TO service_role;

-- Grant usage to anon role (for API access)
GRANT USAGE ON SCHEMA medusa TO anon;

-- Set default privileges for future tables in medusa schema
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa GRANT SELECT ON TABLES TO authenticated;

-- Verify schema was created (this will error if schema doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'medusa'
  ) THEN
    RAISE EXCEPTION 'Medusa schema was not created successfully';
  END IF;
END $$;
