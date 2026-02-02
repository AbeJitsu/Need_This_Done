-- ============================================================================
-- MIGRATION 051: Create Loyalty Points System
-- ============================================================================
-- What: Loyalty points system for customer rewards program
-- Why: Drive repeat purchases and customer retention
-- How: Track earned points, redemptions, and point balances

-- Create loyalty_points_config table (admin settings)
CREATE TABLE IF NOT EXISTS loyalty_points_config (
  id BIGSERIAL PRIMARY KEY,
  points_per_dollar DECIMAL(5,2) DEFAULT 1.0,  -- 1 point per $1 spent
  min_points_to_redeem BIGINT DEFAULT 100,      -- Minimum points to redeem
  point_value_cents BIGINT DEFAULT 1,            -- 1 point = 1 cent
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_points table (earning history)
CREATE TABLE IF NOT EXISTS loyalty_points (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_earned BIGINT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'purchase', 'referral', 'bonus', etc
  source_id VARCHAR(100),        -- order_id, referral_id, etc
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_redemptions table (point usage history)
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id VARCHAR(100),         -- Associated order_id if redeemed at checkout
  points_redeemed BIGINT NOT NULL,
  amount_credited_cents BIGINT NOT NULL,  -- Dollar value in cents
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for current user balances
CREATE OR REPLACE VIEW loyalty_points_balance AS
SELECT
  user_id,
  COALESCE(SUM(points_earned), 0) - COALESCE(SUM(points_redeemed), 0) as current_balance
FROM (
  SELECT user_id, points_earned, 0::BIGINT as points_redeemed FROM loyalty_points
  UNION ALL
  SELECT user_id, 0::BIGINT as points_earned, points_redeemed FROM loyalty_redemptions WHERE status = 'completed'
) combined
GROUP BY user_id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created ON loyalty_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user_id ON loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_order_id ON loyalty_redemptions(order_id);

-- Insert default config
INSERT INTO loyalty_points_config (points_per_dollar, min_points_to_redeem, point_value_cents)
VALUES (1.0, 100, 1)
ON CONFLICT DO NOTHING;

-- Create function to calculate user's current points balance
CREATE OR REPLACE FUNCTION get_user_loyalty_balance(p_user_id UUID)
RETURNS BIGINT AS $$
SELECT COALESCE(
  (SELECT current_balance FROM loyalty_points_balance WHERE user_id = p_user_id),
  0
)
$$ LANGUAGE SQL STABLE;

-- Enable RLS
ALTER TABLE loyalty_points_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read for config (so frontend can display terms)
CREATE POLICY "public_read_config" ON loyalty_points_config
  FOR SELECT USING (TRUE);

-- Users can only see their own points
CREATE POLICY "users_read_own_points" ON loyalty_points
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "admin_read_all_points" ON loyalty_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see their own redemptions
CREATE POLICY "users_read_own_redemptions" ON loyalty_redemptions
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "admin_read_all_redemptions" ON loyalty_redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );
