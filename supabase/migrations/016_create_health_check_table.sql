-- ============================================================================
-- Health Check Table
-- ============================================================================
-- A simple table for the /api/health endpoint to verify database connectivity.
-- Contains a single row with status = 'ok'.

CREATE TABLE IF NOT EXISTS health_check (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the health check row (only if not exists)
INSERT INTO health_check (id, status)
VALUES (1, 'ok')
ON CONFLICT (id) DO NOTHING;

-- Allow public read access for health checks (no auth needed)
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read health_check"
  ON health_check
  FOR SELECT
  USING (true);
