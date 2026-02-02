-- Email Template and Campaign System

-- Email templates for marketing campaigns
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  template_type VARCHAR(50) DEFAULT 'marketing', -- marketing, promotional, transactional, newsletter
  variables JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketing campaigns sent via email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,
  subject VARCHAR(255) NOT NULL,
  segment_filter JSONB DEFAULT '{}', -- criteria for customer segmentation (purchase_date, total_spent, etc)
  segment_name VARCHAR(100), -- e.g. 'High-Value Customers', 'New Signups'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, failed
  total_recipients INT DEFAULT 0,
  successfully_sent INT DEFAULT 0,
  bounced INT DEFAULT 0,
  opened INT DEFAULT 0,
  clicked INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed'))
);

-- Track individual campaign recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, bounced, failed
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  opened_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, user_id),
  CONSTRAINT valid_recipient_status CHECK (status IN ('pending', 'sent', 'bounced', 'failed'))
);

-- Track email opens via pixel tracking
CREATE TABLE IF NOT EXISTS campaign_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  opened_at TIMESTAMP DEFAULT NOW()
);

-- Track email clicks
CREATE TABLE IF NOT EXISTS campaign_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT NOW(),
  link_url VARCHAR(512)
);

-- Indexes for performance
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at);
CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_campaign_opens_campaign ON campaign_opens(campaign_id);
CREATE INDEX idx_campaign_clicks_campaign ON campaign_clicks(campaign_id);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY email_templates_admin_only ON email_templates
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Only admins can manage campaigns
CREATE POLICY email_campaigns_admin_only ON email_campaigns
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Customers can see campaigns they received
CREATE POLICY campaign_recipients_users ON campaign_recipients
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );
