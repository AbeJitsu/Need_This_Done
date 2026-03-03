-- ============================================
-- WIZARD SESSIONS
-- Tracks sales assessment wizard interactions for analytics.
-- Anonymous writes only (no RLS) — admin reads via Supabase dashboard.
-- ============================================

CREATE TABLE IF NOT EXISTS wizard_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  source              TEXT NOT NULL CHECK (source IN ('page', 'overlay')),
  responses           JSONB,
  recommended_tier    TEXT,
  recommended_addons  TEXT[],
  estimated_total     INTEGER,  -- cents
  outcome             TEXT CHECK (outcome IN ('added_to_cart', 'booked_consultation', 'abandoned')),
  abandoned_at_step   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin analytics queries
CREATE INDEX IF NOT EXISTS idx_wizard_sessions_outcome ON wizard_sessions (outcome);
CREATE INDEX IF NOT EXISTS idx_wizard_sessions_created ON wizard_sessions (created_at DESC);
