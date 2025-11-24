-- ============================================================================
-- Create demo_items Table for Database Demo
-- ============================================================================
-- This table stores items created via the Database Demo component.
-- It demonstrates real database persistence with Supabase.

CREATE TABLE IF NOT EXISTS demo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Set Up Row Level Security (RLS)
-- ============================================================================
-- Enable RLS so we can control who can read/write to this table

ALTER TABLE demo_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to read all items
CREATE POLICY "Allow public read access"
  ON demo_items
  FOR SELECT
  USING (true);

-- Allow anyone (public) to insert new items
CREATE POLICY "Allow public insert access"
  ON demo_items
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone (public) to delete items
CREATE POLICY "Allow public delete access"
  ON demo_items
  FOR DELETE
  USING (true);

-- ============================================================================
-- Create Index
-- ============================================================================
-- Index created_at for faster ordering when fetching items

CREATE INDEX IF NOT EXISTS demo_items_created_at_idx
  ON demo_items(created_at DESC);
