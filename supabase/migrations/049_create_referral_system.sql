-- Referral Program Tables

-- Customer referral codes (one per customer)
CREATE TABLE IF NOT EXISTS customer_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(12) NOT NULL UNIQUE,
  credit_balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_referrals INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track individual referrals (who referred whom)
CREATE TABLE IF NOT EXISTS referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code VARCHAR(12) NOT NULL REFERENCES customer_referrals(referral_code),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
  credit_amount DECIMAL(10, 2) DEFAULT 10.00,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'expired'))
);

-- Track referral credit usage (when customer applies credit to order)
CREATE TABLE IF NOT EXISTS referral_credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES customer_referrals(id) ON DELETE CASCADE,
  order_id VARCHAR(255),
  amount_used DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_customer_referrals_user_id ON customer_referrals(user_id);
CREATE INDEX idx_customer_referrals_code ON customer_referrals(referral_code);
CREATE INDEX idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX idx_referral_transactions_referred ON referral_transactions(referred_user_id);
CREATE INDEX idx_referral_transactions_status ON referral_transactions(status);
CREATE INDEX idx_referral_credit_usage_user ON referral_credit_usage(user_id);

-- RLS Policies
ALTER TABLE customer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_credit_usage ENABLE ROW LEVEL SECURITY;

-- Customers can view their own referral data
CREATE POLICY customer_referrals_view ON customer_referrals
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Customers can view referral transactions they're involved in
CREATE POLICY referral_transactions_view ON referral_transactions
  FOR SELECT
  USING (
    auth.uid() = referrer_id OR
    auth.uid() = referred_user_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Customers can view their own credit usage
CREATE POLICY referral_credit_usage_view ON referral_credit_usage
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );
