-- ============================================================================
-- Create projects Table for Contact Form Submissions
-- ============================================================================
-- This table stores project inquiries submitted through the contact form.
-- Each submission captures client info, service interest, and project details.

-- ============================================================================
-- Status Enum
-- ============================================================================
-- Tracks where each project is in the workflow

CREATE TYPE project_status AS ENUM (
  'submitted',
  'in_review',
  'scheduled',
  'in_progress',
  'completed'
);

-- ============================================================================
-- Projects Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,

  -- Project details
  service TEXT,
  message TEXT NOT NULL,

  -- Workflow
  status project_status DEFAULT 'submitted',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- For now, allow public insert (contact form) and restrict read/update to admin

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a project (public contact form)
CREATE POLICY "Allow public insert"
  ON projects
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read projects (future admin dashboard)
CREATE POLICY "Allow authenticated read"
  ON projects
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update projects (future admin dashboard)
CREATE POLICY "Allow authenticated update"
  ON projects
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Indexes
-- ============================================================================
-- Speed up common queries

CREATE INDEX IF NOT EXISTS projects_created_at_idx
  ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS projects_status_idx
  ON projects(status);

CREATE INDEX IF NOT EXISTS projects_email_idx
  ON projects(email);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================
-- Automatically update the updated_at timestamp when a row changes

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
