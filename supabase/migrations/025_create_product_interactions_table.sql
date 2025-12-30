-- ============================================================================
-- Product Interactions Table
-- ============================================================================
-- Tracks user interactions with products for recommendations
-- Enables: "frequently bought together", "also viewed", "trending now"
--
-- Why: Personalized recommendations increase conversion and average order value
-- How: Record views, purchases, cart additions; aggregate for recommendations

-- ============================================================================
-- Create Tables
-- ============================================================================

-- Product interaction events
CREATE TABLE IF NOT EXISTS product_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (nullable for anonymous users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,                                   -- For anonymous tracking

  -- Product information
  product_id TEXT NOT NULL,                          -- Medusa product ID
  variant_id TEXT,                                   -- Specific variant if applicable

  -- Interaction type
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN ('view', 'cart_add', 'purchase', 'wishlist')
  ),

  -- Context
  source_page TEXT,                                  -- Where the interaction occurred
  referrer_product_id TEXT,                          -- If they came from another product

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product similarity scores (precomputed for performance)
CREATE TABLE IF NOT EXISTS product_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product pair
  product_id TEXT NOT NULL,
  related_product_id TEXT NOT NULL,

  -- Relationship type
  relationship_type TEXT NOT NULL CHECK (
    relationship_type IN ('bought_together', 'viewed_together', 'similar_category')
  ),

  -- Score (higher = stronger relationship)
  score DECIMAL(5,4) NOT NULL DEFAULT 0,            -- 0.0000 to 1.0000
  interaction_count INTEGER DEFAULT 0,               -- How many times seen together

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure unique pairs per relationship type
  UNIQUE(product_id, related_product_id, relationship_type)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Fast lookups by product
CREATE INDEX IF NOT EXISTS idx_product_interactions_product_id
  ON product_interactions(product_id);

-- Fast lookups by user
CREATE INDEX IF NOT EXISTS idx_product_interactions_user_id
  ON product_interactions(user_id) WHERE user_id IS NOT NULL;

-- Fast lookups by session
CREATE INDEX IF NOT EXISTS idx_product_interactions_session_id
  ON product_interactions(session_id) WHERE session_id IS NOT NULL;

-- Recent interactions for trending
CREATE INDEX IF NOT EXISTS idx_product_interactions_created_at
  ON product_interactions(created_at DESC);

-- Interaction type queries
CREATE INDEX IF NOT EXISTS idx_product_interactions_type
  ON product_interactions(interaction_type, product_id);

-- Similarity lookups
CREATE INDEX IF NOT EXISTS idx_product_similarities_product_id
  ON product_similarities(product_id, score DESC);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_similarities ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access to interactions"
  ON product_interactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to similarities"
  ON product_similarities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own interactions
CREATE POLICY "Users can read own interactions"
  ON product_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Similarities are public read (needed for recommendations)
CREATE POLICY "Public read for similarities"
  ON product_similarities FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- Views: Precomputed Recommendations
-- ============================================================================

-- Popular products (last 7 days)
CREATE OR REPLACE VIEW popular_products AS
SELECT
  product_id,
  COUNT(*) AS total_interactions,
  COUNT(*) FILTER (WHERE interaction_type = 'view') AS view_count,
  COUNT(*) FILTER (WHERE interaction_type = 'purchase') AS purchase_count,
  COUNT(*) FILTER (WHERE interaction_type = 'cart_add') AS cart_count
FROM product_interactions
WHERE created_at > now() - INTERVAL '7 days'
GROUP BY product_id
ORDER BY total_interactions DESC;

-- Trending products (last 24 hours vs previous 24 hours)
CREATE OR REPLACE VIEW trending_products AS
WITH recent AS (
  SELECT product_id, COUNT(*) AS recent_count
  FROM product_interactions
  WHERE created_at > now() - INTERVAL '24 hours'
  GROUP BY product_id
),
previous AS (
  SELECT product_id, COUNT(*) AS previous_count
  FROM product_interactions
  WHERE created_at BETWEEN now() - INTERVAL '48 hours' AND now() - INTERVAL '24 hours'
  GROUP BY product_id
)
SELECT
  COALESCE(r.product_id, p.product_id) AS product_id,
  COALESCE(r.recent_count, 0) AS recent_count,
  COALESCE(p.previous_count, 0) AS previous_count,
  CASE
    WHEN COALESCE(p.previous_count, 0) = 0 THEN COALESCE(r.recent_count, 0)::DECIMAL
    ELSE (COALESCE(r.recent_count, 0) - COALESCE(p.previous_count, 0))::DECIMAL / p.previous_count
  END AS trend_score
FROM recent r
FULL OUTER JOIN previous p ON r.product_id = p.product_id
WHERE COALESCE(r.recent_count, 0) > 0
ORDER BY trend_score DESC;

-- ============================================================================
-- Function: Record Product Interaction
-- ============================================================================
-- Use this function to record interactions (handles session/user logic)

CREATE OR REPLACE FUNCTION record_product_interaction(
  p_product_id TEXT,
  p_interaction_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_variant_id TEXT DEFAULT NULL,
  p_source_page TEXT DEFAULT NULL,
  p_referrer_product_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO product_interactions (
    product_id,
    interaction_type,
    user_id,
    session_id,
    variant_id,
    source_page,
    referrer_product_id
  ) VALUES (
    p_product_id,
    p_interaction_type,
    p_user_id,
    p_session_id,
    p_variant_id,
    p_source_page,
    p_referrer_product_id
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE product_interactions IS 'Tracks user interactions with products for recommendations';
COMMENT ON TABLE product_similarities IS 'Precomputed product similarity scores for fast recommendations';
COMMENT ON VIEW popular_products IS 'Products ranked by interaction count over last 7 days';
COMMENT ON VIEW trending_products IS 'Products with increasing interest in last 24 hours';
