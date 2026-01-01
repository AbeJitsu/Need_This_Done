-- ============================================================================
-- Migration: Create Reviews Tables
-- ============================================================================
-- What: Customer reviews and ratings for products
-- Why: Social proof helps customers make purchasing decisions
-- How: Store reviews, aggregate ratings, moderate content

-- ============================================================================
-- Reviews Table
-- ============================================================================
-- Stores individual product reviews from customers

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL,          -- Medusa product ID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id VARCHAR(255),                     -- Optional: verify purchase

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,

  -- Reviewer info (for display)
  reviewer_name VARCHAR(255),                -- Display name
  reviewer_email VARCHAR(255),               -- For verification
  is_verified_purchase BOOLEAN DEFAULT false,

  -- Media
  images TEXT[],                             -- Array of image URLs

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending',      -- pending, approved, rejected
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Review Votes Table
-- ============================================================================
-- Tracks helpful/not helpful votes to prevent duplicates

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),                   -- For anonymous votes
  vote_type VARCHAR(20) NOT NULL,            -- helpful, not_helpful
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either user_id or session_id must be set
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
  -- One vote per user/session per review
  CONSTRAINT unique_user_vote UNIQUE (review_id, user_id),
  CONSTRAINT unique_session_vote UNIQUE (review_id, session_id)
);

-- ============================================================================
-- Review Reports Table
-- ============================================================================
-- Tracks reports for moderation

CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL,               -- spam, inappropriate, fake, other
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',      -- pending, reviewed, dismissed
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- Reviews: Anyone can read approved, authors can edit their own pending
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authors can read their own reviews"
  ON reviews FOR SELECT
  USING (user_id = auth.uid() OR reviewer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR reviewer_email IS NOT NULL);

CREATE POLICY "Authors can update their pending reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Votes: Anyone can vote, limited by constraints
CREATE POLICY "Anyone can read votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create votes"
  ON review_votes FOR INSERT
  WITH CHECK (true);

-- Reports: Authenticated users can create, admins can manage
CREATE POLICY "Authenticated users can report"
  ON review_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read their own reports"
  ON review_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage reports"
  ON review_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_review_votes_review ON review_votes(review_id);
CREATE INDEX idx_review_reports_review ON review_reports(review_id);
CREATE INDEX idx_review_reports_status ON review_reports(status);

-- ============================================================================
-- Views
-- ============================================================================

-- Product rating summary
CREATE OR REPLACE VIEW product_ratings AS
SELECT
  product_id,
  COUNT(*) as total_reviews,
  ROUND(AVG(rating)::numeric, 1) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_star,
  COUNT(*) FILTER (WHERE rating = 4) as four_star,
  COUNT(*) FILTER (WHERE rating = 3) as three_star,
  COUNT(*) FILTER (WHERE rating = 2) as two_star,
  COUNT(*) FILTER (WHERE rating = 1) as one_star,
  COUNT(*) FILTER (WHERE is_verified_purchase) as verified_purchases
FROM reviews
WHERE status = 'approved'
GROUP BY product_id;

-- ============================================================================
-- Functions
-- ============================================================================

-- Get product rating summary
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id VARCHAR(255))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'product_id', product_id,
    'total_reviews', total_reviews,
    'average_rating', average_rating,
    'distribution', json_build_object(
      '5', five_star,
      '4', four_star,
      '3', three_star,
      '2', two_star,
      '1', one_star
    ),
    'verified_purchases', verified_purchases
  ) INTO v_result
  FROM product_ratings
  WHERE product_id = p_product_id;

  -- Return empty summary if no reviews
  IF v_result IS NULL THEN
    v_result := json_build_object(
      'product_id', p_product_id,
      'total_reviews', 0,
      'average_rating', 0,
      'distribution', json_build_object('5', 0, '4', 0, '3', 0, '2', 0, '1', 0),
      'verified_purchases', 0
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Vote on a review (helpful/not helpful)
CREATE OR REPLACE FUNCTION vote_on_review(
  p_review_id UUID,
  p_vote_type VARCHAR(20),
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_vote review_votes%ROWTYPE;
BEGIN
  -- Validate vote type
  IF p_vote_type NOT IN ('helpful', 'not_helpful') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid vote type');
  END IF;

  -- Check for existing vote
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_existing_vote
    FROM review_votes
    WHERE review_id = p_review_id AND user_id = p_user_id;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT * INTO v_existing_vote
    FROM review_votes
    WHERE review_id = p_review_id AND session_id = p_session_id;
  ELSE
    RETURN json_build_object('success', false, 'error', 'User or session required');
  END IF;

  -- If already voted, update or remove
  IF v_existing_vote.id IS NOT NULL THEN
    IF v_existing_vote.vote_type = p_vote_type THEN
      -- Same vote, remove it
      DELETE FROM review_votes WHERE id = v_existing_vote.id;

      -- Update count
      IF p_vote_type = 'helpful' THEN
        UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = p_review_id;
      END IF;

      RETURN json_build_object('success', true, 'action', 'removed');
    ELSE
      -- Different vote, update it
      UPDATE review_votes SET vote_type = p_vote_type WHERE id = v_existing_vote.id;

      -- Update counts
      IF p_vote_type = 'helpful' THEN
        UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = p_review_id;
      ELSE
        UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = p_review_id;
      END IF;

      RETURN json_build_object('success', true, 'action', 'changed');
    END IF;
  END IF;

  -- Insert new vote
  INSERT INTO review_votes (review_id, user_id, session_id, vote_type)
  VALUES (p_review_id, p_user_id, p_session_id, p_vote_type);

  -- Update helpful count
  IF p_vote_type = 'helpful' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = p_review_id;
  END IF;

  RETURN json_build_object('success', true, 'action', 'created');
END;
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_timestamp();

-- Update report count when review is reported
CREATE OR REPLACE FUNCTION update_report_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET reported_count = (
    SELECT COUNT(*) FROM review_reports WHERE review_id = NEW.review_id
  )
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_reported
  AFTER INSERT ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_count();
