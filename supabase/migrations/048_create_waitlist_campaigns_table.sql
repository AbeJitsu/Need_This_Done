-- Create table for managing waitlist email campaigns
CREATE TABLE IF NOT EXISTS waitlist_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'targeted_offer' CHECK (campaign_type IN ('targeted_offer', 'restock_alert', 'exclusive_discount')),

  -- Campaign configuration
  title TEXT NOT NULL,
  message TEXT,
  discount_code TEXT,
  discount_percent INT,
  call_to_action_text TEXT DEFAULT 'Shop Now',

  -- Targeting
  product_ids TEXT[] DEFAULT '{}', -- Array of product UUIDs to target

  -- Campaign status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),

  -- Scheduling
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table to track campaign delivery and performance
CREATE TABLE IF NOT EXISTS waitlist_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES waitlist_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  product_id UUID,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP,

  -- Performance tracking
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  purchased_after TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for campaign queries
CREATE INDEX idx_waitlist_campaigns_status ON waitlist_campaigns(status);
CREATE INDEX idx_waitlist_campaigns_scheduled_at ON waitlist_campaigns(scheduled_at);
CREATE INDEX idx_waitlist_campaign_recipients_campaign_id ON waitlist_campaign_recipients(campaign_id);
CREATE INDEX idx_waitlist_campaign_recipients_email_status ON waitlist_campaign_recipients(email, status);
CREATE INDEX idx_waitlist_campaign_recipients_product_id ON waitlist_campaign_recipients(product_id);

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_waitlist_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_waitlist_campaigns_timestamp
BEFORE UPDATE ON waitlist_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_campaigns_timestamp();

CREATE OR REPLACE FUNCTION update_waitlist_campaign_recipients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_waitlist_campaign_recipients_timestamp
BEFORE UPDATE ON waitlist_campaign_recipients
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_campaign_recipients_timestamp();
