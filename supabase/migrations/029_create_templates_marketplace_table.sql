-- ============================================================================
-- Migration: Create Template Marketplace Tables
-- ============================================================================
-- What: Tables for sharing and selling page templates
-- Why: Let users monetize their designs and discover community templates
-- How: Store template data, purchases, reviews, and author information

-- ============================================================================
-- Templates Table
-- ============================================================================
-- Stores published templates available in the marketplace

CREATE TABLE IF NOT EXISTS marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Author info
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,

  -- Template metadata
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,             -- business, portfolio, blog, ecommerce, landing
  tags TEXT[],

  -- Content (Puck page data)
  content JSONB NOT NULL,                    -- The actual Puck page structure
  thumbnail_url TEXT,                        -- Preview image
  preview_images TEXT[],                     -- Additional screenshots

  -- Pricing
  price_type VARCHAR(20) DEFAULT 'free',     -- free, paid
  price_cents INTEGER DEFAULT 0,             -- Price in cents (if paid)
  currency VARCHAR(3) DEFAULT 'USD',

  -- Stats
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending',      -- pending, approved, rejected, suspended
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,

  -- Publishing
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Template Purchases Table
-- ============================================================================
-- Tracks who has purchased/downloaded templates

CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Purchase details
  price_paid INTEGER DEFAULT 0,              -- Price at time of purchase
  payment_id VARCHAR(255),                   -- Stripe payment ID if paid

  -- Access
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_purchase UNIQUE (template_id, user_id)
);

-- ============================================================================
-- Template Reviews Table
-- ============================================================================
-- User reviews for templates

CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,

  -- Moderation
  status VARCHAR(20) DEFAULT 'approved',     -- approved, hidden

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_review UNIQUE (template_id, user_id)
);

-- ============================================================================
-- Template Categories Table
-- ============================================================================
-- Predefined categories for organization

CREATE TABLE IF NOT EXISTS template_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- Templates: Anyone can read approved, authors can manage their own
CREATE POLICY "Anyone can read approved templates"
  ON marketplace_templates FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authors can read their own templates"
  ON marketplace_templates FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Authors can create templates"
  ON marketplace_templates FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own templates"
  ON marketplace_templates FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all templates"
  ON marketplace_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Purchases: Users can read their own
CREATE POLICY "Users can read their purchases"
  ON template_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases"
  ON template_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Reviews: Anyone can read, users can manage their own
CREATE POLICY "Anyone can read reviews"
  ON template_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can manage their reviews"
  ON template_reviews FOR ALL
  USING (user_id = auth.uid());

-- Categories: Anyone can read
CREATE POLICY "Anyone can read categories"
  ON template_categories FOR SELECT
  USING (true);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_templates_author ON marketplace_templates(author_id);
CREATE INDEX idx_templates_category ON marketplace_templates(category);
CREATE INDEX idx_templates_status ON marketplace_templates(status);
CREATE INDEX idx_templates_featured ON marketplace_templates(is_featured, featured_order);
CREATE INDEX idx_templates_price ON marketplace_templates(price_type);
CREATE INDEX idx_templates_rating ON marketplace_templates(average_rating DESC);
CREATE INDEX idx_templates_downloads ON marketplace_templates(download_count DESC);
CREATE INDEX idx_purchases_user ON template_purchases(user_id);
CREATE INDEX idx_purchases_template ON template_purchases(template_id);
CREATE INDEX idx_reviews_template ON template_reviews(template_id);

-- ============================================================================
-- Views
-- ============================================================================

-- Popular templates
CREATE OR REPLACE VIEW popular_templates AS
SELECT
  t.*,
  u.raw_user_meta_data->>'full_name' as author_full_name
FROM marketplace_templates t
JOIN auth.users u ON t.author_id = u.id
WHERE t.status = 'approved'
ORDER BY t.download_count DESC, t.average_rating DESC;

-- Featured templates
CREATE OR REPLACE VIEW featured_templates AS
SELECT
  t.*,
  u.raw_user_meta_data->>'full_name' as author_full_name
FROM marketplace_templates t
JOIN auth.users u ON t.author_id = u.id
WHERE t.status = 'approved' AND t.is_featured = true
ORDER BY t.featured_order, t.created_at DESC;

-- ============================================================================
-- Functions
-- ============================================================================

-- Record template download and return content
CREATE OR REPLACE FUNCTION download_template(
  p_template_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template marketplace_templates%ROWTYPE;
  v_purchase template_purchases%ROWTYPE;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM marketplace_templates
  WHERE id = p_template_id AND status = 'approved';

  IF v_template.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Template not found');
  END IF;

  -- Check if purchase exists (for paid templates)
  IF v_template.price_type = 'paid' THEN
    SELECT * INTO v_purchase
    FROM template_purchases
    WHERE template_id = p_template_id AND user_id = p_user_id;

    IF v_purchase.id IS NULL THEN
      RETURN jsonb_build_object('error', 'Purchase required');
    END IF;
  END IF;

  -- Update or create purchase record
  INSERT INTO template_purchases (template_id, user_id, downloaded_at, download_count)
  VALUES (p_template_id, p_user_id, NOW(), 1)
  ON CONFLICT (template_id, user_id)
  DO UPDATE SET
    downloaded_at = NOW(),
    download_count = template_purchases.download_count + 1;

  -- Update template download count
  UPDATE marketplace_templates
  SET download_count = download_count + 1
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'content', v_template.content,
    'name', v_template.name
  );
END;
$$;

-- Update template rating when review is added/updated
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_templates
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
      AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_review_update
  AFTER INSERT OR UPDATE OR DELETE ON template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- ============================================================================
-- Seed Data: Categories
-- ============================================================================

INSERT INTO template_categories (id, name, description, icon, display_order)
VALUES
  ('business', 'Business', 'Professional templates for businesses', '💼', 1),
  ('portfolio', 'Portfolio', 'Showcase your work and projects', '🎨', 2),
  ('blog', 'Blog', 'Templates for blogs and publications', '📝', 3),
  ('ecommerce', 'E-commerce', 'Online store and product pages', '🛒', 4),
  ('landing', 'Landing Page', 'High-converting landing pages', '🚀', 5),
  ('saas', 'SaaS', 'Software and app marketing pages', '💻', 6),
  ('personal', 'Personal', 'Personal websites and profiles', '👤', 7),
  ('creative', 'Creative', 'Artistic and creative templates', '✨', 8)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

-- ============================================================================
-- Triggers: Update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_templates_updated_at
  BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();

CREATE TRIGGER template_reviews_updated_at
  BEFORE UPDATE ON template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();
