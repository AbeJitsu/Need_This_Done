-- ============================================================================
-- Create Enrollments Table for LMS
-- ============================================================================
-- Tracks student enrollments in courses (both free and paid).

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Course Reference (references pages table for Puck-based courses)
  course_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  -- Enrollment Type
  enrollment_type TEXT NOT NULL CHECK (enrollment_type IN ('free', 'paid')),

  -- Payment Reference (for paid enrollments)
  payment_id TEXT,  -- Stripe payment/subscription ID
  amount_paid INTEGER DEFAULT 0,  -- Amount in cents

  -- Progress Tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Unique constraint: one enrollment per user per course
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments"
  ON enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments (progress)
CREATE POLICY "Users can update own enrollments"
  ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all enrollments
CREATE POLICY "Admins can read all enrollments"
  ON enrollments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS enrollments_user_course_idx ON enrollments(user_id, course_id);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollments_updated_at();
